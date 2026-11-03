// Logika Utama Dasbor Pilah

(function () {
  let dataPengguna = null;
  let daftarEntri = [];
  let ringkasanData = null;
  let grafikData = [];
  let entriSedangDiedit = null;
  let timerUrungkanHapus = null;
  let entriPendingHapus = null;

  // DOM Elements
  const elNamaPengguna = document.getElementById('nama-pengguna-dasbor');
  const elEmailPengguna = document.getElementById('email-pengguna-dasbor');
  const elTotalMingguIni = document.getElementById('total-minggu-ini');
  const elSelisihMinggu = document.getElementById('selisih-minggu');
  const elTargetKgTeks = document.getElementById('target-kg-teks');
  const elCincinProgres = document.getElementById('cincin-progres-bar');
  const elPesanTarget = document.getElementById('pesan-target-wadah');
  const elRincianOrganik = document.getElementById('rincian-organik');
  const elRincianPlastik = document.getElementById('rincian-plastik');
  const elRincianKertas = document.getElementById('rincian-kertas');
  const elRincianKacaLogam = document.getElementById('rincian-kacaLogam');
  const elRincianB3 = document.getElementById('rincian-b3');
  const elWadahGrafik = document.getElementById('wadah-grafik-dasbor');
  const elDaftarEntri = document.getElementById('wadah-daftar-entri');
  const elKeadaanKosong = document.getElementById('keadaan-kosong-dasbor');

  // Form Tambah Entri
  const formTambah = document.getElementById('form-tambah-entri');
  const inputBerat = document.getElementById('input-berat');
  const inputTanggal = document.getElementById('input-tanggal');
  const inputCatatan = document.getElementById('input-catatan');
  const pesanGalatForm = document.getElementById('galat-form-entri');

  // Modal Edit
  const dialogEdit = document.getElementById('dialog-edit-entri');
  const formEdit = document.getElementById('form-edit-entri');
  const editId = document.getElementById('edit-id');
  const editBerat = document.getElementById('edit-berat');
  const editTanggal = document.getElementById('edit-tanggal');
  const editCatatan = document.getElementById('edit-catatan');
  const btnBatalEdit = document.getElementById('btn-batal-edit');

  // Toast Container
  const wadahToast = document.getElementById('wadah-toast');

  // Set default tanggal hari ini
  if (inputTanggal) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    inputTanggal.value = `${yyyy}-${mm}-${dd}`;
  }

  // Animasi Angka Menghitung Naik (requestAnimationFrame ~500ms)
  function animasikanAngka(elemen, nilaiAkhir, desimal = 1, akhiran = '') {
    if (!elemen) return;
    const durasi = 500;
    const mulai = performance.now();
    const nilaiAwal = parseFloat(elemen.dataset.nilaiTerakhir || '0');
    elemen.dataset.nilaiTerakhir = nilaiAkhir;

    function step(sekarang) {
      const progres = Math.min((sekarang - mulai) / durasi, 1);
      // Easing out cubic
      const ease = 1 - Math.pow(1 - progres, 3);
      const nilaiSaatIni = nilaiAwal + (nilaiAkhir - nilaiAwal) * ease;
      elemen.textContent = nilaiSaatIni.toFixed(desimal) + akhiran;

      if (progres < 1) {
        requestAnimationFrame(step);
      } else {
        elemen.textContent = Number(nilaiAkhir).toFixed(desimal) + akhiran;
      }
    }
    requestAnimationFrame(step);
  }

  // Muat Data Dasbor
  async function muatData() {
    // Ambil info pengguna
    const resUser = await window.API.get('/api/saya');
    if (!resUser.ok) return;
    dataPengguna = resUser.data;

    if (elNamaPengguna) elNamaPengguna.textContent = dataPengguna.nama;
    if (elEmailPengguna) elEmailPengguna.textContent = dataPengguna.email;
    if (elTargetKgTeks) elTargetKgTeks.textContent = `${dataPengguna.targetMingguKg} kg`;

    // Ambil entri sampah
    const resEntri = await window.API.get('/api/entri');
    if (!resEntri.ok) return;

    daftarEntri = resEntri.data.entri || [];
    ringkasanData = resEntri.data.ringkasan || {};
    grafikData = resEntri.data.grafik7Hari || [];

    perbaruiTampilanDasbor();
  }

  // Perbarui UI Dasbor
  function perbaruiTampilanDasbor() {
    const totalMinggu = ringkasanData.totalMingguIni || 0;
    const selisih = ringkasanData.selisih || 0;
    const targetKg = dataPengguna ? dataPengguna.targetMingguKg || 5 : 5;

    // 1. Ringkasan Mingguan
    animasikanAngka(elTotalMingguIni, totalMinggu, 1, ' kg');

    if (elSelisihMinggu) {
      const teksSelisih = selisih >= 0 ? `+${selisih.toFixed(1)} kg dari minggu lalu` : `${selisih.toFixed(1)} kg dari minggu lalu`;
      elSelisihMinggu.textContent = teksSelisih;
      elSelisihMinggu.style.color = selisih >= 0 ? 'var(--lumut)' : 'var(--tinta-pudar)';
    }

    // Rincian per jenis
    const rincian = ringkasanData.rincianJenis || {};
    animasikanAngka(elRincianOrganik, rincian.organik || 0, 1, ' kg');
    animasikanAngka(elRincianPlastik, rincian.plastik || 0, 1, ' kg');
    animasikanAngka(elRincianKertas, rincian.kertas || 0, 1, ' kg');
    animasikanAngka(elRincianKacaLogam, rincian.kacaLogam || 0, 1, ' kg');
    animasikanAngka(elRincianB3, rincian.b3 || 0, 1, ' kg');

    // 2. Cincin Progres Tantangan Mingguan (SVG stroke-dashoffset)
    if (elCincinProgres) {
      const radius = 40;
      const keliling = 2 * Math.PI * radius; // ~251.32
      elCincinProgres.style.strokeDasharray = `${keliling} ${keliling}`;
      const rasio = Math.min(totalMinggu / targetKg, 1);
      const offset = keliling - rasio * keliling;
      elCincinProgres.style.strokeDashoffset = offset;
    }

    // Pesan jika target tercapai
    if (elPesanTarget) {
      if (totalMinggu >= targetKg && targetKg > 0) {
        elPesanTarget.innerHTML = `
          <div class="pesan-target-selesai">
            🎉 Hebat! Target mingguan ${targetKg} kg sudah tercapai (${totalMinggu} kg terpilah)!
          </div>
        `;
      } else {
        const sisa = Math.max(targetKg - totalMinggu, 0).toFixed(1);
        elPesanTarget.innerHTML = `
          <p style="font-size:0.85rem; color:var(--tinta-pudar); margin-top:4px;">
            Kurang <strong>${sisa} kg</strong> lagi untuk mencapai target minggu ini.
          </p>
        `;
      }
    }

    // 3. Render Grafik SVG 7 Hari
    if (window.renderGrafik7Hari && elWadahGrafik) {
      window.renderGrafik7Hari(grafikData, elWadahGrafik);
    }

    // 4. Render Daftar Catatan
    renderDaftarEntri();
  }

  // Render Daftar Entri
  function renderDaftarEntri() {
    if (!elDaftarEntri) return;

    if (daftarEntri.length === 0) {
      if (elKeadaanKosong) elKeadaanKosong.style.display = 'block';
      elDaftarEntri.innerHTML = '';
      return;
    }

    if (elKeadaanKosong) elKeadaanKosong.style.display = 'none';

    const namaJenis = {
      organik: 'Organik',
      plastik: 'Plastik',
      kertas: 'Kertas',
      kacaLogam: 'Kaca & Logam',
      b3: 'B3 (Berbahaya)'
    };

    elDaftarEntri.innerHTML = daftarEntri
      .map((item) => {
        const tgl = item.tanggal;
        const [y, m, d] = tgl.split('-');
        const tglFormat = `${d}/${m}/${y}`;
        const label = namaJenis[item.jenis] || item.jenis;
        const lencanaClass = `lencana-${item.jenis}`;

        return `
          <li class="item-entri" id="entri-${item.id}">
            <div class="entri-kiri">
              <div class="entri-baris-1">
                <span class="lencana-sampah ${lencanaClass}">${label}</span>
                <span class="entri-tanggal">${tglFormat}</span>
              </div>
              ${item.catatan ? `<div class="entri-catatan">${escapeHtml(item.catatan)}</div>` : ''}
            </div>
            <div style="display:flex; align-items:center; gap:var(--s4);">
              <span class="entri-berat">${item.beratKg} <span style="font-size:0.85rem; font-weight:normal; color:var(--tinta-pudar);">kg</span></span>
              <div class="entri-aksi">
                <button type="button" class="btn btn-garis btn-sm btn-edit" data-id="${item.id}" aria-label="Ubah catatan ${label} ${item.beratKg} kg">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <span>Ubah</span>
                </button>
                <button type="button" class="btn btn-bahaya btn-sm btn-hapus" data-id="${item.id}" aria-label="Hapus catatan ${label} ${item.beratKg} kg">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </li>
        `;
      })
      .join('');

    // Pasang event listener ke tombol ubah & hapus
    elDaftarEntri.querySelectorAll('.btn-edit').forEach((btn) => {
      btn.addEventListener('click', () => bukaModalEdit(btn.dataset.id));
    });

    elDaftarEntri.querySelectorAll('.btn-hapus').forEach((btn) => {
      btn.addEventListener('click', () => konfirmasiHapus(btn.dataset.id));
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Submit Form Tambah
  if (formTambah) {
    formTambah.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (pesanGalatForm) pesanGalatForm.textContent = '';

      const jenisRadio = formTambah.querySelector('input[name="jenis"]:checked');
      if (!jenisRadio) {
        if (pesanGalatForm) pesanGalatForm.textContent = 'Pilih salah satu jenis sampah terlebih dahulu.';
        return;
      }

      const berat = parseFloat(inputBerat.value);
      if (isNaN(berat) || berat <= 0) {
        if (pesanGalatForm) pesanGalatForm.textContent = 'Berat harus berupa angka lebih dari 0 kg.';
        inputBerat.focus();
        return;
      }

      const tanggal = inputTanggal.value;
      if (!tanggal) {
        if (pesanGalatForm) pesanGalatForm.textContent = 'Pilih tanggal setoran.';
        return;
      }

      const body = {
        jenis: jenisRadio.value,
        beratKg: berat,
        tanggal,
        catatan: inputCatatan.value.trim()
      };

      const res = await window.API.post('/api/entri', body);
      if (!res.ok) {
        if (pesanGalatForm) {
          pesanGalatForm.textContent = res.data.error || 'Gagal menyimpan catatan.';
        }
        return;
      }

      // Reset form berat & catatan, biarkan jenis dan tanggal tetap memudahkan setoran berikutnya
      inputBerat.value = '';
      inputCatatan.value = '';

      tampilkanToast('Catatan sampah berhasil disimpan.');
      await muatData();
    });
  }

  // Modal Edit Entri
  function bukaModalEdit(id) {
    const entri = daftarEntri.find((e) => e.id === id);
    if (!entri || !dialogEdit) return;

    entriSedangDiedit = entri;
    editId.value = entri.id;
    editBerat.value = entri.beratKg;
    editTanggal.value = entri.tanggal;
    editCatatan.value = entri.catatan || '';

    const radio = formEdit.querySelector(`input[name="edit-jenis"][value="${entri.jenis}"]`);
    if (radio) radio.checked = true;

    dialogEdit.style.display = 'flex';
  }

  if (btnBatalEdit) {
    btnBatalEdit.addEventListener('click', () => {
      if (dialogEdit) dialogEdit.style.display = 'none';
      entriSedangDiedit = null;
    });
  }

  if (formEdit) {
    formEdit.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!entriSedangDiedit) return;

      const jenisRadio = formEdit.querySelector('input[name="edit-jenis"]:checked');
      const berat = parseFloat(editBerat.value);
      const tanggal = editTanggal.value;
      const catatan = editCatatan.value.trim();

      const body = {
        jenis: jenisRadio.value,
        beratKg: berat,
        tanggal,
        catatan
      };

      const res = await window.API.put(`/api/entri/${entriSedangDiedit.id}`, body);
      if (res.ok) {
        dialogEdit.style.display = 'none';
        entriSedangDiedit = null;
        tampilkanToast('Catatan berhasil diperbarui.');
        await muatData();
      } else {
        alert(res.data.error || 'Gagal mengubah catatan');
      }
    });
  }

  // Konfirmasi & Hapus dengan Fitur Urungkan (Undo Toast 5 detik)
  function konfirmasiHapus(id) {
    const entri = daftarEntri.find((e) => e.id === id);
    if (!entri) return;

    // Sembunyikan elemen sementara dari daftar secara visual
    const itemEl = document.getElementById(`entri-${id}`);
    if (itemEl) itemEl.style.opacity = '0.3';

    // Batalkan timer hapus sebelumnya jika ada
    if (timerUrungkanHapus) {
      clearTimeout(timerUrungkanHapus);
      eksekusiHapusPermanen(entriPendingHapus);
    }

    entriPendingHapus = entri;

    // Buat Toast dengan Tombol Urungkan
    let sisaDetik = 5;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span>Catatan (${entri.beratKg} kg) dihapus.</span>
      <button type="button" class="toast-btn-batal" id="btn-undo-hapus">Batalkan (${sisaDetik}s)</button>
    `;
    wadahToast.appendChild(toast);

    const hitungMundur = setInterval(() => {
      sisaDetik -= 1;
      const btnUndo = toast.querySelector('#btn-undo-hapus');
      if (btnUndo) {
        btnUndo.textContent = `Batalkan (${sisaDetik}s)`;
      }
      if (sisaDetik <= 0) {
        clearInterval(hitungMundur);
      }
    }, 1000);

    const batalkanHapus = () => {
      clearInterval(hitungMundur);
      clearTimeout(timerUrungkanHapus);
      if (itemEl) itemEl.style.opacity = '1';
      toast.remove();
      entriPendingHapus = null;
      tampilkanToast('Penghapusan dibatalkan.');
    };

    toast.querySelector('#btn-undo-hapus').addEventListener('click', batalkanHapus);

    timerUrungkanHapus = setTimeout(async () => {
      clearInterval(hitungMundur);
      toast.remove();
      await eksekusiHapusPermanen(entri);
    }, 5000);
  }

  async function eksekusiHapusPermanen(entri) {
    if (!entri) return;
    const res = await window.API.delete(`/api/entri/${entri.id}`);
    entriPendingHapus = null;
    if (res.ok) {
      await muatData();
    }
  }

  function tampilkanToast(pesan) {
    if (!wadahToast) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = pesan;
    wadahToast.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // Tombol Keluar di Navigasi
  const btnKeluar = document.getElementById('btn-keluar-nav');
  if (btnKeluar) {
    btnKeluar.addEventListener('click', async (e) => {
      e.preventDefault();
      await window.API.keluar();
    });
  }

  // Inisialisasi
  muatData();
})();
