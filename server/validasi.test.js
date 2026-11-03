import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validasiDaftar,
  validasiMasuk,
  validasiEntri,
  validasiProfil,
  dapatkanRentangMinggu,
  hitungRingkasanMingguan,
  JENIS_SAMPAH_VALID
} from './validasi.js';

test('validasiDaftar: menolak nama kosong atau kurang dari 2 karakter', () => {
  const hasil = validasiDaftar({ nama: 'A', email: 'budi@contoh.id', kataSandi: 'Rahasia123' });
  assert.equal(hasil.valid, false);
  assert.ok(hasil.errors.nama);
});

test('validasiDaftar: menolak kata sandi kurang dari 8 karakter atau tanpa angka', () => {
  const pendek = validasiDaftar({ nama: 'Budi', email: 'budi@contoh.id', kataSandi: 'Abc1' });
  assert.equal(pendek.valid, false);
  assert.ok(pendek.errors.kataSandi);

  const tanpaAngka = validasiDaftar({ nama: 'Budi', email: 'budi@contoh.id', kataSandi: 'Hanyahurufaja' });
  assert.equal(tanpaAngka.valid, false);
  assert.ok(tanpaAngka.errors.kataSandi);
});

test('validasiDaftar: menerima pendaftaran yang valid', () => {
  const hasil = validasiDaftar({ nama: 'Bu Rani', email: 'burani@contoh.id', kataSandi: 'Pilah2026!' });
  assert.equal(hasil.valid, true);
  assert.deepEqual(hasil.errors, {});
});

test('validasiMasuk: validasi field terisi', () => {
  assert.equal(validasiMasuk({ email: '', kataSandi: '' }).valid, false);
  assert.equal(validasiMasuk({ email: 'test@contoh.id', kataSandi: 'Rahasia123' }).valid, true);
});

test('validasiEntri: menolak berat <= 0 dan jenis sampah tidak sah', () => {
  const beratNol = validasiEntri({ jenis: 'plastik', beratKg: 0, tanggal: '2026-11-03' });
  assert.equal(beratNol.valid, false);
  assert.ok(beratNol.errors.beratKg);

  const jenisSalah = validasiEntri({ jenis: 'kayu', beratKg: 1.5, tanggal: '2026-11-03' });
  assert.equal(jenisSalah.valid, false);
  assert.ok(jenisSalah.errors.jenis);
});

test('validasiEntri: menerima entri yang sah dan membulatkan berat 2 desimal', () => {
  const sah = validasiEntri({
    jenis: 'organik',
    beratKg: 1.256,
    tanggal: '2026-11-03',
    catatan: 'Kulit salak'
  });
  assert.equal(sah.valid, true);
  assert.equal(sah.dataBersih.beratKg, 1.26);
});

test('validasiProfil: memeriksa batas target mingguan', () => {
  assert.equal(validasiProfil({ nama: 'Dimas', targetMingguKg: -2 }).valid, false);
  assert.equal(validasiProfil({ nama: 'Dimas', targetMingguKg: 120 }).valid, false);
  assert.equal(validasiProfil({ nama: 'Dimas', targetMingguKg: 7.5 }).valid, true);
});

test('hitungRingkasanMingguan: menghitung total minggu ini dan selisih', () => {
  const ref = new Date('2026-11-04T12:00:00Z'); // Rabu
  const rentang = dapatkanRentangMinggu(ref);

  const entri = [
    { tanggal: rentang.seninStr, jenis: 'organik', beratKg: 2.0 },
    { tanggal: rentang.seninStr, jenis: 'plastik', beratKg: 1.5 }
  ];

  const ringkasan = hitungRingkasanMingguan(entri, ref);
  assert.equal(ringkasan.totalMingguIni, 3.5);
  assert.equal(ringkasan.rincianJenis.organik, 2.0);
  assert.equal(ringkasan.rincianJenis.plastik, 1.5);
  assert.equal(ringkasan.selisih, 3.5);
});
