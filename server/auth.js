import crypto from 'crypto';
import { Storage } from './storage.js';
import { validasiDaftar, validasiMasuk } from './validasi.js';

const SESI_DURASI_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari

// Pembatas laju percobaan masuk (rate limiting) di memori
// Map: emailNormalized -> { failedCount: number, lockedUntil: number, firstAttemptAt: number }
const percobaanMasuk = new Map();

function periksaBatasPercobaan(email) {
  const normEmail = email.toLowerCase().trim();
  const sekarang = Date.now();
  const info = percobaanMasuk.get(normEmail);

  if (!info) return { boleh: true };

  // Jika terkunci
  if (info.lockedUntil && sekarang < info.lockedUntil) {
    const sisaMenit = Math.ceil((info.lockedUntil - sekarang) / (60 * 1000));
    return {
      boleh: false,
      pesan: `Terlalu banyak percobaan masuk yang gagal. Silakan tunggu ${sisaMenit} menit sebelum mencoba lagi.`
    };
  }

  // Jika masa 10 menit sudah lewat sejak percobaan pertama, reset
  if (sekarang - info.firstAttemptAt > 10 * 60 * 1000) {
    percobaanMasuk.delete(normEmail);
    return { boleh: true };
  }

  if (info.failedCount >= 5) {
    info.lockedUntil = sekarang + 10 * 60 * 1000;
    return {
      boleh: false,
      pesan: 'Terlalu banyak percobaan masuk yang gagal. Silakan tunggu 10 menit sebelum mencoba lagi.'
    };
  }

  return { boleh: true };
}

function catatPercobaanGagal(email) {
  const normEmail = email.toLowerCase().trim();
  const sekarang = Date.now();
  const info = percobaanMasuk.get(normEmail) || {
    failedCount: 0,
    lockedUntil: 0,
    firstAttemptAt: sekarang
  };

  info.failedCount += 1;
  if (info.failedCount >= 5) {
    info.lockedUntil = sekarang + 10 * 60 * 1000;
  }
  percobaanMasuk.set(normEmail, info);
}

function resetPercobaan(email) {
  const normEmail = email.toLowerCase().trim();
  percobaanMasuk.delete(normEmail);
}

/**
 * Hash kata sandi dengan crypto.scrypt
 */
export async function hashKataSandi(kataSandi, saltHex = null) {
  const salt = saltHex ? Buffer.from(saltHex, 'hex') : crypto.randomBytes(16);
  return new Promise((resolve, reject) => {
    crypto.scrypt(kataSandi, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve({
        salt: salt.toString('hex'),
        hash: derivedKey.toString('hex')
      });
    });
  });
}

/**
 * Verifikasi kata sandi dengan crypto.timingSafeEqual
 */
export async function verifikasiKataSandi(kataSandi, saltHex, hashTersimpanHex) {
  const salt = Buffer.from(saltHex, 'hex');
  const hashTersimpan = Buffer.from(hashTersimpanHex, 'hex');

  return new Promise((resolve) => {
    crypto.scrypt(kataSandi, salt, 64, (err, derivedKey) => {
      if (err) return resolve(false);
      try {
        const cocok = crypto.timingSafeEqual(derivedKey, hashTersimpan);
        resolve(cocok);
      } catch {
        resolve(false);
      }
    });
  });
}

/**
 * Buat sesi baru untuk pengguna
 */
export async function buatSesi(penggunaId) {
  const token = crypto.randomBytes(32).toString('hex');
  const kedaluwarsa = Date.now() + SESI_DURASI_MS;

  const semuaSesi = await Storage.read('sesi');
  // Bersihkan sesi usang
  const sesiAktif = semuaSesi.filter((s) => s.kedaluwarsa > Date.now());
  sesiAktif.push({
    token,
    penggunaId,
    kedaluwarsa
  });

  await Storage.write('sesi', sesiAktif);
  return { token, kedaluwarsa };
}

/**
 * Ambil pengguna berdasarkan token sesi
 */
export async function dapatkanPenggunaDariSesi(token) {
  if (!token) return null;

  const semuaSesi = await Storage.read('sesi');
  const sesi = semuaSesi.find((s) => s.token === token && s.kedaluwarsa > Date.now());
  if (!sesi) return null;

  const semuaPengguna = await Storage.read('pengguna');
  const pengguna = semuaPengguna.find((p) => p.id === sesi.penggunaId);
  if (!pengguna) return null;

  return {
    id: pengguna.id,
    nama: pengguna.nama,
    email: pengguna.email,
    targetMingguKg: pengguna.targetMingguKg || 5,
    dibuatPada: pengguna.dibuatPada
  };
}

/**
 * Hapus sesi
 */
export async function hapusSesi(token) {
  if (!token) return;
  const semuaSesi = await Storage.read('sesi');
  const sisa = semuaSesi.filter((s) => s.token !== token);
  await Storage.write('sesi', sisa);
}

/**
 * Parsing cookie dari header permintaan
 */
export function ambilCookie(req) {
  const list = {};
  const rc = req.headers.cookie;

  if (rc) {
    rc.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const key = parts.shift().trim();
      const val = decodeURIComponent(parts.join('='));
      list[key] = val;
    });
  }
  return list;
}

/**
 * Buat string Set-Cookie
 */
export function buatCookieSesi(token, isSecure = false, maxAge = SESI_DURASI_MS / 1000) {
  const parts = [
    `pilah_session=${token}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${maxAge}`
  ];
  if (isSecure) {
    // Di lingkungan HTTPS / iframe AI Studio, gunakan SameSite=None; Secure; Partitioned
    parts.push('SameSite=None');
    parts.push('Secure');
    parts.push('Partitioned');
  } else {
    // Di lingkungan HTTP lokal gunakan SameSite=Strict
    parts.push('SameSite=Strict');
  }
  return parts.join('; ');
}

export function buatCookieHapusSesi(isSecure = false) {
  const sameSite = isSecure ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Strict';
  return `pilah_session=; HttpOnly; ${sameSite}; Path=/; Max-Age=0`;
}

/**
 * Logika Pendaftaran Akun
 */
export async function daftarAkun({ nama, email, kataSandi }) {
  const validasi = validasiDaftar({ nama, email, kataSandi });
  if (!validasi.valid) {
    return { status: 400, body: { error: 'Validasi gagal', rincian: validasi.errors } };
  }

  const normEmail = email.toLowerCase().trim();
  const semuaPengguna = await Storage.read('pengguna');

  // Cek keunikan email
  const sudahAda = semuaPengguna.some((p) => p.email.toLowerCase() === normEmail);
  if (sudahAda) {
    return {
      status: 400,
      body: {
        error: 'Pendaftaran gagal',
        rincian: { email: 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.' }
      }
    };
  }

  const { salt, hash } = await hashKataSandi(kataSandi);
  const idBaru = 'u_' + crypto.randomBytes(8).toString('hex');

  const penggunaBaru = {
    id: idBaru,
    nama: nama.trim(),
    email: normEmail,
    salt,
    hashKataSandi: hash,
    targetMingguKg: 5,
    dibuatPada: new Date().toISOString()
  };

  semuaPengguna.push(penggunaBaru);
  await Storage.write('pengguna', semuaPengguna);

  // Buat sesi langsung
  const { token } = await buatSesi(penggunaBaru.id);

  return {
    status: 201,
    body: {
      pengguna: {
        id: penggunaBaru.id,
        nama: penggunaBaru.nama,
        email: penggunaBaru.email,
        targetMingguKg: penggunaBaru.targetMingguKg,
        dibuatPada: penggunaBaru.dibuatPada
      },
      token
    },
    token
  };
}

/**
 * Logika Masuk Akun
 */
export async function masukAkun({ email, kataSandi }) {
  const validasi = validasiMasuk({ email, kataSandi });
  if (!validasi.valid) {
    return { status: 400, body: { error: 'Validasi gagal', rincian: validasi.errors } };
  }

  const normEmail = email.toLowerCase().trim();
  const cekLimit = periksaBatasPercobaan(normEmail);
  if (!cekLimit.boleh) {
    return {
      status: 429,
      body: { error: cekLimit.pesan }
    };
  }

  const semuaPengguna = await Storage.read('pengguna');
  const pengguna = semuaPengguna.find((p) => p.email.toLowerCase() === normEmail);

  const PESAN_SALAH = 'Email atau kata sandi salah.';

  if (!pengguna) {
    catatPercobaanGagal(normEmail);
    return { status: 400, body: { error: PESAN_SALAH } };
  }

  const cocok = await verifikasiKataSandi(kataSandi, pengguna.salt, pengguna.hashKataSandi);
  if (!cocok) {
    catatPercobaanGagal(normEmail);
    return { status: 400, body: { error: PESAN_SALAH } };
  }

  // Berhasil masuk
  resetPercobaan(normEmail);
  const { token } = await buatSesi(pengguna.id);

  return {
    status: 200,
    body: {
      pengguna: {
        id: pengguna.id,
        nama: pengguna.nama,
        email: pengguna.email,
        targetMingguKg: pengguna.targetMingguKg || 5,
        dibuatPada: pengguna.dibuatPada
      },
      token
    },
    token
  };
}

/**
 * Inisialisasi akun demo bila data kosong (Bu Rani dari PRD)
 */
export async function inisialisasiAkunDemo() {
  const pengguna = await Storage.read('pengguna');
  if (pengguna.length === 0) {
    const demoEmail = 'burani@contoh.id';
    const { salt, hash } = await hashKataSandi('Pilah2026!');
    const userId = 'u_burani123';
    pengguna.push({
      id: userId,
      nama: 'Bu Rani',
      email: demoEmail,
      salt,
      hashKataSandi: hash,
      targetMingguKg: 5,
      dibuatPada: new Date().toISOString()
    });
    await Storage.write('pengguna', pengguna);

    // Tambah beberapa contoh entri realistis sesuai PRD
    const formatTgl = (daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const entriAwal = [
      {
        id: 'e_1',
        penggunaId: userId,
        tanggal: formatTgl(0),
        jenis: 'organik',
        beratKg: 1.2,
        catatan: 'Kulit salak & sisa sayuran bayam',
        dibuatPada: new Date().toISOString()
      },
      {
        id: 'e_2',
        penggunaId: userId,
        tanggal: formatTgl(1),
        jenis: 'plastik',
        beratKg: 0.8,
        catatan: 'Botol kecap & gelas air mineral',
        dibuatPada: new Date().toISOString()
      },
      {
        id: 'e_3',
        penggunaId: userId,
        tanggal: formatTgl(2),
        jenis: 'kertas',
        beratKg: 1.5,
        catatan: 'Kardus mi instan & amplop berkas',
        dibuatPada: new Date().toISOString()
      },
      {
        id: 'e_4',
        penggunaId: userId,
        tanggal: formatTgl(3),
        jenis: 'kacaLogam',
        beratKg: 0.7,
        catatan: 'Kaleng sarden & botol sirup',
        dibuatPada: new Date().toISOString()
      },
      {
        id: 'e_5',
        penggunaId: userId,
        tanggal: formatTgl(5),
        jenis: 'organik',
        beratKg: 0.9,
        catatan: 'Kulit pisang & daun kering halaman',
        dibuatPada: new Date().toISOString()
      }
    ];
    await Storage.write('entri', entriAwal);
  }
}
