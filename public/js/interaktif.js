// Demo pemilahan interaktif beranda (tanpa dependensi eksternal)

(function () {
  const panggung = document.getElementById('demo-panggung');
  const model = panggung && panggung.querySelector('.demo-tempat-sampah');
  const tombolKategori = document.querySelectorAll('.pilihan-demo-btn');
  const keterangan = document.getElementById('demo-keterangan');

  if (!panggung || !model || !tombolKategori.length || !keterangan) return;

  const tips = {
    organik: 'Sisa sayur dan kulit buah masuk ke sampah organik.',
    plastik: 'Kosongkan dan bilas kemasan plastik sebelum dikumpulkan.',
    kertas: 'Pastikan kertas dan kardus tetap kering agar mudah didaur ulang.',
    kacaLogam: 'Pisahkan kaca dan logam; bungkus pecahan kaca dengan aman.',
    b3: 'Baterai dan lampu termasuk B3. Simpan terpisah, jangan dicampur.'
  };

  function pilihKategori(jenis) {
    const tombolAktif = Array.from(tombolKategori).find((tombol) => tombol.dataset.jenis === jenis);
    if (!tombolAktif || !tips[jenis]) return;

    tombolKategori.forEach((tombol) => {
      const aktif = tombol === tombolAktif;
      tombol.classList.toggle('aktif', aktif);
      tombol.setAttribute('aria-pressed', String(aktif));
    });

    panggung.querySelectorAll('.demo-bin').forEach((bin) => {
      bin.classList.toggle('terpilih', bin.dataset.jenis === jenis);
    });
    keterangan.textContent = tips[jenis];
  }

  tombolKategori.forEach((tombol) => {
    tombol.addEventListener('click', () => pilihKategori(tombol.dataset.jenis));
  });
  pilihKategori('organik');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  panggung.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;

    const batas = panggung.getBoundingClientRect();
    const posisiX = (event.clientX - batas.left) / batas.width - 0.5;
    const posisiY = (event.clientY - batas.top) / batas.height - 0.5;
    const rotasiY = -10 + posisiX * 14;
    const rotasiX = -5 - posisiY * 8;

    model.style.transform = `rotateX(${rotasiX}deg) rotateY(${rotasiY}deg)`;
  });

  panggung.addEventListener('pointerleave', () => {
    model.style.transform = '';
  });
})();
