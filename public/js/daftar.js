// Logika Halaman Daftar Pilah

(function () {
  const formDaftar = document.getElementById('form-daftar');
  const inputNama = document.getElementById('input-nama');
  const inputEmail = document.getElementById('input-email');
  const inputSandi = document.getElementById('input-sandi');
  const btnToggleSandi = document.getElementById('btn-toggle-sandi');
  const galatNama = document.getElementById('galat-nama');
  const galatEmail = document.getElementById('galat-email');
  const galatSandi = document.getElementById('galat-sandi');
  const galatUmum = document.getElementById('galat-umum');

  // Toggle Lihat Kata Sandi
  if (btnToggleSandi && inputSandi) {
    btnToggleSandi.addEventListener('click', () => {
      const isPassword = inputSandi.type === 'password';
      inputSandi.type = isPassword ? 'text' : 'password';
      btnToggleSandi.setAttribute('aria-label', isPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi');
      btnToggleSandi.title = isPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi';
    });
  }

  if (formDaftar) {
    formDaftar.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (galatNama) galatNama.textContent = '';
      if (galatEmail) galatEmail.textContent = '';
      if (galatSandi) galatSandi.textContent = '';
      if (galatUmum) galatUmum.textContent = '';

      const nama = inputNama.value.trim();
      const email = inputEmail.value.trim();
      const kataSandi = inputSandi.value;

      let valid = true;

      if (!nama || nama.length < 2) {
        if (galatNama) galatNama.textContent = 'Nama minimal 2 karakter.';
        valid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        if (galatEmail) galatEmail.textContent = 'Masukkan alamat email yang valid.';
        valid = false;
      }

      if (!kataSandi || kataSandi.length < 8) {
        if (galatSandi) galatSandi.textContent = 'Kata sandi minimal 8 karakter.';
        valid = false;
      } else if (!/[A-Za-z]/.test(kataSandi) || !/[0-9]/.test(kataSandi)) {
        if (galatSandi) galatSandi.textContent = 'Kata sandi harus mengandung kombinasi huruf dan angka.';
        valid = false;
      }

      if (!valid) return;

      const res = await window.API.post('/api/daftar', { nama, email, kataSandi });

      if (res.ok) {
        if (res.data && res.data.token) {
          localStorage.setItem('pilah_session_token', res.data.token);
        }
        window.location.href = '/dasbor.html';
      } else {
        if (res.data && res.data.rincian) {
          if (res.data.rincian.nama && galatNama) galatNama.textContent = res.data.rincian.nama;
          if (res.data.rincian.email && galatEmail) galatEmail.textContent = res.data.rincian.email;
          if (res.data.rincian.kataSandi && galatSandi) galatSandi.textContent = res.data.rincian.kataSandi;
        }
        if (res.data && res.data.error) {
          if (galatUmum) galatUmum.textContent = res.data.error;
        } else if (!res.data || !res.data.rincian) {
          if (galatUmum) galatUmum.textContent = 'Terjadi kesalahan saat pendaftaran. Silakan periksa data Anda.';
        }
      }
    });
  }
})();
