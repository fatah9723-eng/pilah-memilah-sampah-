// Logika Halaman Masuk Pilah

(function () {
  const formMasuk = document.getElementById('form-masuk');
  const inputEmail = document.getElementById('input-email');
  const inputSandi = document.getElementById('input-sandi');
  const btnToggleSandi = document.getElementById('btn-toggle-sandi');
  const galatEmail = document.getElementById('galat-email');
  const galatSandi = document.getElementById('galat-sandi');
  const galatUmum = document.getElementById('galat-umum');
  const btnIsiDemo = document.getElementById('btn-isi-demo');

  // Toggle Lihat Sandi
  if (btnToggleSandi && inputSandi) {
    btnToggleSandi.addEventListener('click', () => {
      const isPassword = inputSandi.type === 'password';
      inputSandi.type = isPassword ? 'text' : 'password';
      btnToggleSandi.setAttribute('aria-label', isPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi');
      btnToggleSandi.title = isPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi';
    });
  }

  // Isi Cepat Demo
  if (btnIsiDemo && inputEmail && inputSandi) {
    btnIsiDemo.addEventListener('click', () => {
      inputEmail.value = 'burani@contoh.id';
      inputSandi.value = 'Pilah2026!';
      if (galatEmail) galatEmail.textContent = '';
      if (galatSandi) galatSandi.textContent = '';
      if (galatUmum) galatUmum.textContent = '';
    });
  }

  if (formMasuk) {
    formMasuk.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (galatEmail) galatEmail.textContent = '';
      if (galatSandi) galatSandi.textContent = '';
      if (galatUmum) galatUmum.textContent = '';

      const email = inputEmail.value.trim();
      const kataSandi = inputSandi.value;

      let valid = true;
      if (!email) {
        if (galatEmail) galatEmail.textContent = 'Alamat email wajib diisi.';
        valid = false;
      }
      if (!kataSandi) {
        if (galatSandi) galatSandi.textContent = 'Kata sandi wajib diisi.';
        valid = false;
      }
      if (!valid) return;

      const res = await window.API.post('/api/masuk', { email, kataSandi });

      if (res.ok) {
        if (res.data && res.data.token) {
          localStorage.setItem('pilah_session_token', res.data.token);
        }
        window.location.href = '/dasbor.html';
      } else {
        if (res.status === 429) {
          if (galatUmum) galatUmum.textContent = res.data.error || 'Terlalu banyak percobaan masuk yang gagal. Silakan tunggu 10 menit sebelum mencoba lagi.';
        } else {
          if (galatUmum) galatUmum.textContent = res.data.error || 'Email atau kata sandi salah.';
        }
      }
    });
  }
})();
