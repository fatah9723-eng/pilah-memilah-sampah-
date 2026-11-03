// Pengelola Mode Terang / Gelap (Pilah)

(function () {
  const KUNCI_STORAGE = 'pilah_tema';

  function terapkanTema(tema) {
    if (tema === 'dark') {
      document.documentElement.setAttribute('data-tema', 'dark');
    } else {
      document.documentElement.removeAttribute('data-tema');
    }
    perbaruiIkonTombol(tema);
  }

  function perbaruiIkonTombol(tema) {
    const tombol = document.getElementById('btn-ganti-tema');
    if (!tombol) return;

    const isDark = tema === 'dark';
    tombol.setAttribute('aria-label', isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap');
    tombol.title = isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap';

    // SVG inline buatan sendiri (Matahari / Bulan)
    if (isDark) {
      tombol.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
    } else {
      tombol.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
    }
  }

  // Baca tema tersimpan atau preferensi sistem
  const temaTersimpan = localStorage.getItem(KUNCI_STORAGE);
  const preferensiSistemGelap = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const temaAwal = temaTersimpan || (preferensiSistemGelap ? 'dark' : 'light');

  terapkanTema(temaAwal);

  window.addEventListener('DOMContentLoaded', () => {
    const tombol = document.getElementById('btn-ganti-tema');
    perbaruiIkonTombol(document.documentElement.getAttribute('data-tema') === 'dark' ? 'dark' : 'light');

    if (tombol) {
      tombol.addEventListener('click', () => {
        const sedangGelap = document.documentElement.getAttribute('data-tema') === 'dark';
        const temaBaru = sedangGelap ? 'light' : 'dark';
        terapkanTema(temaBaru);
        localStorage.setItem(KUNCI_STORAGE, temaBaru);
      });
    }
  });
})();
