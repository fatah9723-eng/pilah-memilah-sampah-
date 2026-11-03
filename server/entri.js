import crypto from 'crypto';
import { Storage } from './storage.js';
import { validasiEntri, hitungRingkasanMingguan, hitungDataGrafik7Hari } from './validasi.js';

export const EntriService = {
  /**
   * Mengambil semua entri milik pengguna yang sedang login
   */
  async ambilSemua(penggunaId, query = {}) {
    const semua = await Storage.read('entri');
    let milikPengguna = semua.filter((e) => e.penggunaId === penggunaId);

    if (query.dari) {
      milikPengguna = milikPengguna.filter((e) => e.tanggal >= query.dari);
    }
    if (query.sampai) {
      milikPengguna = milikPengguna.filter((e) => e.tanggal <= query.sampai);
    }

    // Urutkan tanggal terbaru ke terlama
    milikPengguna.sort((a, b) => {
      if (b.tanggal !== a.tanggal) {
        return b.tanggal.localeCompare(a.tanggal);
      }
      return (b.dibuatPada || '').localeCompare(a.dibuatPada || '');
    });

    const ringkasan = hitungRingkasanMingguan(milikPengguna);
    const grafik7Hari = hitungDataGrafik7Hari(milikPengguna);

    return {
      entri: milikPengguna,
      ringkasan,
      grafik7Hari
    };
  },

  /**
   * Tambah entri baru
   */
  async tambah(penggunaId, data) {
    const validasi = validasiEntri(data);
    if (!validasi.valid) {
      return { status: 400, body: { error: 'Data entri tidak valid', rincian: validasi.errors } };
    }

    const { jenis, beratKg, tanggal, catatan } = validasi.dataBersih;
    const semua = await Storage.read('entri');

    const entriBaru = {
      id: 'e_' + crypto.randomBytes(8).toString('hex'),
      penggunaId,
      jenis,
      beratKg,
      tanggal,
      catatan,
      dibuatPada: new Date().toISOString()
    };

    semua.push(entriBaru);
    await Storage.write('entri', semua);

    return { status: 201, body: entriBaru };
  },

  /**
   * Ubah entri yang ada (hanya milik pengguna itu sendiri)
   */
  async ubah(penggunaId, entriId, data) {
    const validasi = validasiEntri(data);
    if (!validasi.valid) {
      return { status: 400, body: { error: 'Data entri tidak valid', rincian: validasi.errors } };
    }

    const semua = await Storage.read('entri');
    const index = semua.findIndex((e) => e.id === entriId);

    if (index === -1) {
      return { status: 404, body: { error: 'Catatan tidak ditemukan' } };
    }

    // Otorisasi ketat: Jika bukan milik pengguna ini, kembalikan 404
    if (semua[index].penggunaId !== penggunaId) {
      return { status: 404, body: { error: 'Catatan tidak ditemukan' } };
    }

    const { jenis, beratKg, tanggal, catatan } = validasi.dataBersih;
    semua[index] = {
      ...semua[index],
      jenis,
      beratKg,
      tanggal,
      catatan,
      diubahPada: new Date().toISOString()
    };

    await Storage.write('entri', semua);
    return { status: 200, body: semua[index] };
  },

  /**
   * Hapus entri (hanya milik pengguna itu sendiri)
   */
  async hapus(penggunaId, entriId) {
    const semua = await Storage.read('entri');
    const index = semua.findIndex((e) => e.id === entriId);

    if (index === -1) {
      return { status: 404, body: { error: 'Catatan tidak ditemukan' } };
    }

    // Otorisasi ketat: Jika bukan milik pengguna ini, kembalikan 404
    if (semua[index].penggunaId !== penggunaId) {
      return { status: 404, body: { error: 'Catatan tidak ditemukan' } };
    }

    const terhapus = semua.splice(index, 1)[0];
    await Storage.write('entri', semua);
    return { status: 200, body: { ok: true, terhapus } };
  }
};
