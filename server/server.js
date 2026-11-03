import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, parse as parseUrl } from 'url';
import {
  ambilCookie,
  buatCookieSesi,
  buatCookieHapusSesi,
  dapatkanPenggunaDariSesi,
  daftarAkun,
  masukAkun,
  hapusSesi,
  verifikasiKataSandi,
  hashKataSandi,
  inisialisasiAkunDemo
} from './auth.js';
import { Storage } from './storage.js';
import { EntriService } from './entri.js';
import { validasiProfil } from './validasi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const MAX_PAYLOAD_BYTES = 10 * 1024; // 10 KB limit sesuai PRD

// Inisialisasi data demo awal
await inisialisasiAkunDemo();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8'
};

function kirimJson(res, statusCode, data, headers = {}) {
  const json = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(json),
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  res.end(json);
}

function bacaBodyJson(req) {
  return new Promise((resolve, reject) => {
    let bytesRead = 0;
    const chunks = [];

    req.on('data', (chunk) => {
      bytesRead += chunk.length;
      if (bytesRead > MAX_PAYLOAD_BYTES) {
        req.destroy();
        const err = new Error('Isi permintaan dibatasi 10 KB');
        err.statusCode = 413;
        return reject(err);
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw.trim()) {
        return resolve({});
      }
      try {
        const parsed = JSON.parse(raw);
        resolve(parsed);
      } catch {
        const err = new Error('Format JSON tidak valid');
        err.statusCode = 400;
        reject(err);
      }
    });

    req.on('error', (err) => reject(err));
  });
}

const server = http.createServer(async (req, res) => {
  // Amankan header
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // CSP ketat sesuai PRD (semua CSS dan JS terpisah), mengizinkan data: untuk gambar dan frame jika di dalam AI Studio
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self';"
  );

  const parsedUrl = parseUrl(req.url, true);
  let pathname = parsedUrl.pathname || '/';
  const query = parsedUrl.query || {};

  // Liveness / health probe untuk Cloud Run & container orchestration
  if (pathname === '/health' || pathname === '/healthz' || pathname === '/_health') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('OK');
    return;
  }

  // Deteksi pengguna dari sesi cookie, header Authorization, atau query parameter token
  const cookies = ambilCookie(req);
  let token = cookies.pilah_session;
  if (!token && req.headers['authorization']) {
    const authHeader = req.headers['authorization'];
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }
  if (!token && query.token && typeof query.token === 'string') {
    token = query.token;
  }
  const pengguna = await dapatkanPenggunaDariSesi(token);
  const isHttps = req.headers['x-forwarded-proto'] === 'https' || req.connection?.encrypted || Boolean(req.headers['x-forwarded-ssl']);

  // Validasi Origin untuk proteksi CSRF pada permintaan mutating API
  if (pathname.startsWith('/api/') && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const origin = req.headers['origin'];
    const host = req.headers['host'] || '';
    const forwardedHost = req.headers['x-forwarded-host'] || '';

    if (origin) {
      try {
        const originUrl = new URL(origin);
        const originHost = originUrl.host;
        const originHostname = originUrl.hostname;

        const isAllowed =
          originHost === host ||
          (forwardedHost && (originHost === forwardedHost || originHostname === forwardedHost.split(':')[0])) ||
          originHostname === 'localhost' ||
          originHostname === '127.0.0.1' ||
          originHostname.endsWith('.run.app') ||
          originHostname.endsWith('.google.com') ||
          originHostname.endsWith('.googleusercontent.com');

        if (!isAllowed) {
          kirimJson(res, 403, { error: 'Origin tidak diizinkan (CSRF terdeteksi)' });
          return;
        }
      } catch {
        // jika URL tidak dapat di-parse, teruskan
      }
    }
  }

  // ==========================================
  // ROUTING API
  // ==========================================
  if (pathname.startsWith('/api/')) {
    try {
      // POST /api/daftar
      if (pathname === '/api/daftar' && req.method === 'POST') {
        const body = await bacaBodyJson(req);
        const hasil = await daftarAkun(body);
        const headers = {};
        if (hasil.token) {
          headers['Set-Cookie'] = buatCookieSesi(hasil.token, isHttps);
        }
        kirimJson(res, hasil.status, hasil.body, headers);
        return;
      }

      // POST /api/masuk
      if (pathname === '/api/masuk' && req.method === 'POST') {
        const body = await bacaBodyJson(req);
        const hasil = await masukAkun(body);
        const headers = {};
        if (hasil.token) {
          headers['Set-Cookie'] = buatCookieSesi(hasil.token, isHttps);
        }
        kirimJson(res, hasil.status, hasil.body, headers);
        return;
      }

      // POST /api/keluar
      if (pathname === '/api/keluar' && req.method === 'POST') {
        if (!pengguna) {
          kirimJson(res, 401, { error: 'Belum masuk' });
          return;
        }
        await hapusSesi(token);
        kirimJson(res, 200, { ok: true, pesan: 'Berhasil keluar' }, {
          'Set-Cookie': buatCookieHapusSesi(isHttps)
        });
        return;
      }

      // Endpoint berikut memerlukan login
      if (!pengguna) {
        kirimJson(res, 401, { error: 'Belum masuk atau sesi telah kedaluwarsa' });
        return;
      }

      // GET /api/saya
      if (pathname === '/api/saya' && req.method === 'GET') {
        kirimJson(res, 200, pengguna);
        return;
      }

      // PUT /api/saya
      if (pathname === '/api/saya' && req.method === 'PUT') {
        const body = await bacaBodyJson(req);
        const validasi = validasiProfil(body);
        if (!validasi.valid) {
          kirimJson(res, 400, { error: 'Data tidak valid', rincian: validasi.errors });
          return;
        }

        const semuaPengguna = await Storage.read('pengguna');
        const userIndex = semuaPengguna.findIndex((p) => p.id === pengguna.id);
        if (userIndex === -1) {
          kirimJson(res, 404, { error: 'Pengguna tidak ditemukan' });
          return;
        }

        if (body.nama && typeof body.nama === 'string') {
          semuaPengguna[userIndex].nama = body.nama.trim();
        }
        if (body.targetMingguKg !== undefined) {
          semuaPengguna[userIndex].targetMingguKg = Number(body.targetMingguKg);
        }

        await Storage.write('pengguna', semuaPengguna);
        const updatedUser = {
          id: semuaPengguna[userIndex].id,
          nama: semuaPengguna[userIndex].nama,
          email: semuaPengguna[userIndex].email,
          targetMingguKg: semuaPengguna[userIndex].targetMingguKg,
          dibuatPada: semuaPengguna[userIndex].dibuatPada
        };
        kirimJson(res, 200, updatedUser);
        return;
      }

      // PUT /api/saya/kata-sandi
      if (pathname === '/api/saya/kata-sandi' && req.method === 'PUT') {
        const body = await bacaBodyJson(req);
        const { kataSandiLama, kataSandiBaru } = body;

        if (!kataSandiLama || !kataSandiBaru) {
          kirimJson(res, 400, { error: 'Kata sandi lama dan kata sandi baru wajib diisi' });
          return;
        }
        if (kataSandiBaru.length < 8 || !/[A-Za-z]/.test(kataSandiBaru) || !/[0-9]/.test(kataSandiBaru)) {
          kirimJson(res, 400, { error: 'Kata sandi baru minimal 8 karakter dan harus mengandung huruf dan angka' });
          return;
        }

        const semuaPengguna = await Storage.read('pengguna');
        const user = semuaPengguna.find((p) => p.id === pengguna.id);
        if (!user) {
          kirimJson(res, 404, { error: 'Pengguna tidak ditemukan' });
          return;
        }

        const cocok = await verifikasiKataSandi(kataSandiLama, user.salt, user.hashKataSandi);
        if (!cocok) {
          kirimJson(res, 400, { error: 'Kata sandi lama salah' });
          return;
        }

        const { salt, hash } = await hashKataSandi(kataSandiBaru);
        user.salt = salt;
        user.hashKataSandi = hash;
        await Storage.write('pengguna', semuaPengguna);

        kirimJson(res, 200, { ok: true, pesan: 'Kata sandi berhasil diubah' });
        return;
      }

      // DELETE /api/saya (Hapus akun beserta semua catatannya)
      if (pathname === '/api/saya' && req.method === 'DELETE') {
        // Hapus entri pengguna
        const semuaEntri = await Storage.read('entri');
        const sisaEntri = semuaEntri.filter((e) => e.penggunaId !== pengguna.id);
        await Storage.write('entri', sisaEntri);

        // Hapus sesi pengguna
        const semuaSesi = await Storage.read('sesi');
        const sisaSesi = semuaSesi.filter((s) => s.penggunaId !== pengguna.id);
        await Storage.write('sesi', sisaSesi);

        // Hapus pengguna
        const semuaPengguna = await Storage.read('pengguna');
        const sisaPengguna = semuaPengguna.filter((p) => p.id !== pengguna.id);
        await Storage.write('pengguna', sisaPengguna);

        kirimJson(res, 200, { ok: true, pesan: 'Akun dan semua data berhasil dihapus' }, {
          'Set-Cookie': buatCookieHapusSesi(isHttps)
        });
        return;
      }

      // GET /api/entri
      if (pathname === '/api/entri' && req.method === 'GET') {
        const hasil = await EntriService.ambilSemua(pengguna.id, query);
        kirimJson(res, 200, hasil);
        return;
      }

      // POST /api/entri
      if (pathname === '/api/entri' && req.method === 'POST') {
        const body = await bacaBodyJson(req);
        const hasil = await EntriService.tambah(pengguna.id, body);
        kirimJson(res, hasil.status, hasil.body);
        return;
      }

      // PUT /api/entri/:id
      if (pathname.startsWith('/api/entri/') && req.method === 'PUT') {
        const id = pathname.replace('/api/entri/', '');
        const body = await bacaBodyJson(req);
        const hasil = await EntriService.ubah(pengguna.id, id, body);
        kirimJson(res, hasil.status, hasil.body);
        return;
      }

      // DELETE /api/entri/:id
      if (pathname.startsWith('/api/entri/') && req.method === 'DELETE') {
        const id = pathname.replace('/api/entri/', '');
        const hasil = await EntriService.hapus(pengguna.id, id);
        kirimJson(res, hasil.status, hasil.body);
        return;
      }

      kirimJson(res, 404, { error: 'Endpoint API tidak ditemukan' });
    } catch (err) {
      console.error('API Error:', err);
      const code = err.statusCode || 500;
      kirimJson(res, code, { error: err.message || 'Terjadi kesalahan pada server' });
    }
    return;
  }

  // ==========================================
  // ROUTE PROTECTION & REDIRECTS UNTUK HALAMAN HTML
  // ==========================================
  const protectedPages = ['/dasbor', '/dasbor.html', '/panduan', '/panduan.html', '/profil', '/profil.html'];
  const guestPages = ['/masuk', '/masuk.html', '/daftar', '/daftar.html'];

  if (protectedPages.includes(pathname) && !pengguna) {
    res.writeHead(302, { Location: '/masuk.html' });
    res.end();
    return;
  }

  if (guestPages.includes(pathname) && pengguna) {
    res.writeHead(302, { Location: '/dasbor.html' });
    res.end();
    return;
  }

  // ==========================================
  // STATIC FILE SERVING DARI PUBLIC_DIR
  // ==========================================
  let relativeFilePath = pathname === '/' ? '/index.html' : pathname;
  // Jika path tanpa .html dan bukan berkas css/js/img/pdf
  if (!path.extname(relativeFilePath)) {
    relativeFilePath += '.html';
  }

  const normalizedPath = path.normalize(relativeFilePath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, normalizedPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 page
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Halaman Tidak Ditemukan | Pilah</title>
  <link rel="stylesheet" href="/css/tokens.css">
  <link rel="stylesheet" href="/css/base.css">
</head>
<body style="display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px;">
  <div>
    <h1 style="font-family:var(--font-judul);font-size:3rem;margin-bottom:12px;">404</h1>
    <p style="margin-bottom:24px;color:var(--tinta-pudar);">Halaman yang Anda tuju tidak ditemukan.</p>
    <a href="/" style="display:inline-block;padding:12px 24px;background:var(--lumut);color:var(--kertas);text-decoration:none;border-radius:var(--radius);font-weight:600;">Kembali ke Beranda</a>
  </div>
</body>
</html>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Pilah server berjalan di http://0.0.0.0:${PORT}`);
});
