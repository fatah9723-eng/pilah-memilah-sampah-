// Validasi input dan kalkulasi logika sampah

export const JENIS_SAMPAH_VALID = ['organik', 'plastik', 'kertas', 'kacaLogam', 'b3'];

export const LABEL_JENIS_SAMPAH = {
  organik: 'Organik',
  plastik: 'Plastik',
  kertas: 'Kertas',
  kacaLogam: 'Kaca & Logam',
  b3: 'B3 (Berbahaya)'
};

/**
 * Validasi form pendaftaran
 */
export function validasiDaftar({ nama, email, kataSandi }) {
  const errors = {};

  if (!nama || typeof nama !== 'string' || nama.trim().length < 2 || nama.trim().length > 50) {
    errors.nama = 'Nama harus antara 2 hingga 50 karakter.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.email = 'Format email tidak valid.';
  }

  if (!kataSandi || typeof kataSandi !== 'string') {
    errors.kataSandi = 'Kata sandi wajib diisi.';
  } else if (kataSandi.length < 8) {
    errors.kataSandi = 'Kata sandi minimal 8 karakter.';
  } else if (!/[A-Za-z]/.test(kataSandi) || !/[0-9]/.test(kataSandi)) {
    errors.kataSandi = 'Kata sandi harus mengandung kombinasi huruf dan angka.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validasi form masuk
 */
export function validasiMasuk({ email, kataSandi }) {
  const errors = {};
  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.email = 'Email wajib diisi.';
  }
  if (!kataSandi || typeof kataSandi !== 'string' || !kataSandi) {
    errors.kataSandi = 'Kata sandi wajib diisi.';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validasi entri sampah
 */
export function validasiEntri({ jenis, beratKg, tanggal, catatan }) {
  const errors = {};

  if (!jenis || !JENIS_SAMPAH_VALID.includes(jenis)) {
    errors.jenis = 'Pilih salah satu jenis sampah yang sah (organik, plastik, kertas, kaca/logam, B3).';
  }

  const berat = Number(beratKg);
  if (beratKg === undefined || beratKg === null || isNaN(berat) || berat <= 0) {
    errors.beratKg = 'Berat harus berupa angka lebih dari 0 kg.';
  } else if (berat > 500) {
    errors.beratKg = 'Berat maksimal per setoran adalah 500 kg.';
  }

  const tanggalRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!tanggal || typeof tanggal !== 'string' || !tanggalRegex.test(tanggal)) {
    errors.tanggal = 'Format tanggal harus YYYY-MM-DD.';
  } else {
    const d = new Date(tanggal + 'T00:00:00Z');
    if (isNaN(d.getTime())) {
      errors.tanggal = 'Tanggal tidak valid.';
    }
  }

  if (catatan && typeof catatan === 'string' && catatan.length > 200) {
    errors.catatan = 'Catatan maksimal 200 karakter.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    dataBersih: {
      jenis,
      beratKg: Math.round(berat * 100) / 100,
      tanggal,
      catatan: catatan ? catatan.trim() : ''
    }
  };
}

/**
 * Validasi profil
 */
export function validasiProfil({ nama, targetMingguKg }) {
  const errors = {};

  if (nama !== undefined) {
    if (typeof nama !== 'string' || nama.trim().length < 2 || nama.trim().length > 50) {
      errors.nama = 'Nama harus antara 2 hingga 50 karakter.';
    }
  }

  if (targetMingguKg !== undefined) {
    const target = Number(targetMingguKg);
    if (isNaN(target) || target <= 0 || target > 100) {
      errors.targetMingguKg = 'Target mingguan harus berupa angka antara 0.1 hingga 100 kg.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Mendapatkan rentang Senin sampai Minggu untuk suatu tanggal
 */
export function dapatkanRentangMinggu(tanggalObj = new Date()) {
  const tgl = new Date(tanggalObj);
  // Hari: 0 (Min) -> 6, 1 (Sen) -> 0, dst.
  const hari = tgl.getDay();
  const selisihKeSenin = hari === 0 ? -6 : 1 - hari;

  const senin = new Date(tgl);
  senin.setDate(tgl.getDate() + selisihKeSenin);
  senin.setHours(0, 0, 0, 0);

  const minggu = new Date(senin);
  minggu.setDate(senin.getDate() + 6);
  minggu.setHours(23, 59, 59, 999);

  const formatTgl = (d) => {
    const thn = d.getFullYear();
    const bln = String(d.getMonth() + 1).padStart(2, '0');
    const hri = String(d.getDate()).padStart(2, '0');
    return `${thn}-${bln}-${hri}`;
  };

  return {
    seninStr: formatTgl(senin),
    mingguStr: formatTgl(minggu),
    seninDate: senin,
    mingguDate: minggu
  };
}

/**
 * Hitung ringkasan mingguan dari daftar entri
 */
export function hitungRingkasanMingguan(entriPengguna, refDate = new Date()) {
  const rentangIni = dapatkanRentangMinggu(refDate);

  // Minggu lalu (7 hari sebelumnya)
  const prevDate = new Date(refDate);
  prevDate.setDate(refDate.getDate() - 7);
  const rentangLalu = dapatkanRentangMinggu(prevDate);

  let totalMingguIni = 0;
  let totalMingguLalu = 0;
  const rincianJenis = {
    organik: 0,
    plastik: 0,
    kertas: 0,
    kacaLogam: 0,
    b3: 0
  };

  for (const item of entriPengguna) {
    const tgl = item.tanggal;
    const berat = Number(item.beratKg) || 0;

    if (tgl >= rentangIni.seninStr && tgl <= rentangIni.mingguStr) {
      totalMingguIni += berat;
      if (rincianJenis[item.jenis] !== undefined) {
        rincianJenis[item.jenis] += berat;
      }
    } else if (tgl >= rentangLalu.seninStr && tgl <= rentangLalu.mingguStr) {
      totalMingguLalu += berat;
    }
  }

  // Pembulatan 2 desimal
  totalMingguIni = Math.round(totalMingguIni * 100) / 100;
  totalMingguLalu = Math.round(totalMingguLalu * 100) / 100;
  for (const j in rincianJenis) {
    rincianJenis[j] = Math.round(rincianJenis[j] * 100) / 100;
  }

  const selisih = Math.round((totalMingguIni - totalMingguLalu) * 100) / 100;

  return {
    totalMingguIni,
    totalMingguLalu,
    selisih,
    rentangIni: { awal: rentangIni.seninStr, akhir: rentangIni.mingguStr },
    rincianJenis
  };
}

/**
 * Hitung data 7 hari terakhir untuk grafik batang SVG
 */
export function hitungDataGrafik7Hari(entriPengguna, refDate = new Date()) {
  const hasil = [];
  const namaHari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(refDate.getDate() - i);
    const thn = d.getFullYear();
    const bln = String(d.getMonth() + 1).padStart(2, '0');
    const hri = String(d.getDate()).padStart(2, '0');
    const tglStr = `${thn}-${bln}-${hri}`;
    const hariIndo = namaHari[d.getDay()];

    let totalHari = 0;
    const rincian = { organik: 0, plastik: 0, kertas: 0, kacaLogam: 0, b3: 0 };

    for (const item of entriPengguna) {
      if (item.tanggal === tglStr) {
        const berat = Number(item.beratKg) || 0;
        totalHari += berat;
        if (rincian[item.jenis] !== undefined) {
          rincian[item.jenis] += berat;
        }
      }
    }

    hasil.push({
      tanggal: tglStr,
      hariLabel: `${hariIndo} ${d.getDate()}/${d.getMonth() + 1}`,
      hariSingkat: hariIndo,
      totalKg: Math.round(totalHari * 100) / 100,
      rincian
    });
  }

  return hasil;
}
