// Logika Panduan Memilah Sampah dengan Kartu 3D Flip (Pilah)

(function () {
  const inputCari = document.getElementById('input-cari-panduan');
  const wadahKartu = document.getElementById('wadah-kartu-panduan');
  const jumlahDitemukan = document.getElementById('jumlah-ditemukan');
  const btnKategori = document.querySelectorAll('.chip-filter');
  const btnHapusCari = document.getElementById('btn-hapus-cari');

  let filterKategoriAktif = 'semua';
  let kataKunciAktif = '';

  function buatKartuHtml(item) {
    const lencanaClass = `lencana-${item.kategori}`;
    return `
      <div class="wadah-kartu-3d" tabindex="0" role="button" aria-pressed="false" aria-label="Kartu panduan: ${item.nama}. Tekan Enter atau Spasi untuk membalik kartu.">
        <div class="kartu-pilah-inner">
          <!-- SISI DEPAN -->
          <div class="sisi-depan">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--s2);">
                <span class="lencana-sampah ${lencanaClass}">${item.kategoriLabel}</span>
                <span style="color:var(--tinta-pudar); font-size:0.75rem; font-family:var(--font-angka);">#${String(item.id).padStart(2, '0')}</span>
              </div>
              <h3 class="kartu-nama-barang">${item.nama}</h3>
              <p class="kartu-contoh">${item.contoh}</p>
            </div>
            <div class="kartu-petunjuk-balik">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>Ketuk untuk lihat cara pilah</span>
            </div>
          </div>

          <!-- SISI BELAKANG -->
          <div class="sisi-belakang">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--s2);">
                <span class="lencana-sampah ${lencanaClass}">Cara Pilah</span>
                <span style="font-size:0.8rem; font-weight:600; color:var(--lumut);">${item.kategoriLabel}</span>
              </div>
              <p class="kartu-tips-isi">${item.tips}</p>
            </div>
            <div class="kartu-petunjuk-balik" style="color:var(--tinta-pudar);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span>Ketuk untuk balik ke depan</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderKartu() {
    if (!wadahKartu) return;

    const query = kataKunciAktif.toLowerCase().trim();
    const hasil = window.DATA_PANDUAN.filter((item) => {
      const cocokKategori = filterKategoriAktif === 'semua' || item.kategori === filterKategoriAktif;
      if (!cocokKategori) return false;

      if (!query) return true;
      const cocokNama = item.nama.toLowerCase().includes(query);
      const cocokContoh = item.contoh.toLowerCase().includes(query);
      const cocokTips = item.tips.toLowerCase().includes(query);
      const cocokKat = item.kategoriLabel.toLowerCase().includes(query);
      return cocokNama || cocokContoh || cocokTips || cocokKat;
    });

    if (jumlahDitemukan) {
      jumlahDitemukan.textContent = `${hasil.length} barang`;
    }

    if (btnHapusCari) {
      btnHapusCari.style.display = kataKunciAktif ? 'inline-flex' : 'none';
    }

    if (hasil.length === 0) {
      wadahKartu.innerHTML = `
        <div class="keadaan-kosong" style="grid-column: 1 / -1;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          <h3>Tidak ada barang yang cocok</h3>
          <p>Coba gunakan kata kunci lain seperti "botol", "kardus", "pisang", atau pilih kategori di atas.</p>
        </div>
      `;
      return;
    }

    wadahKartu.innerHTML = hasil.map(buatKartuHtml).join('');

    // Tambahkan event click & keyboard untuk efek balik 3D
    const kartuElems = wadahKartu.querySelectorAll('.wadah-kartu-3d');
    kartuElems.forEach((kartu) => {
      const balik = () => {
        const terbalik = kartu.classList.toggle('terbalik');
        kartu.setAttribute('aria-pressed', terbalik ? 'true' : 'false');
      };

      kartu.addEventListener('click', (e) => {
        e.preventDefault();
        balik();
      });

      kartu.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          balik();
        }
      });
    });
  }

  // Event listener input cari (pencarian instan responsif)
  if (inputCari) {
    inputCari.addEventListener('input', (e) => {
      kataKunciAktif = e.target.value;
      renderKartu();
    });
  }

  if (btnHapusCari) {
    btnHapusCari.addEventListener('click', () => {
      if (inputCari) {
        inputCari.value = '';
        inputCari.focus();
      }
      kataKunciAktif = '';
      renderKartu();
    });
  }

  // Filter chip kategori
  btnKategori.forEach((btn) => {
    btn.addEventListener('click', () => {
      btnKategori.forEach((b) => b.classList.remove('aktif'));
      btn.classList.add('aktif');
      filterKategoriAktif = btn.dataset.kategori;
      renderKartu();
    });
  });

  // Render awal
  renderKartu();
})();
