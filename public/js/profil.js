// Logika Halaman Profil & Pengaturan Pilah

(function () {
  const elEmail = document.getElementById('profil-email');
  const elNama = document.getElementById('profil-nama');
  const elTarget = document.getElementById('profil-target');
  const statusProfil = document.getElementById('status-profil');
  const formProfil = document.getElementById('form-profil');

  const formSandi = document.getElementById('form-sandi');
  const inputSandiLama = document.getElementById('sandi-lama');
  const inputSandiBaru = document.getElementById('sandi-baru');
  const statusSandi = document.getElementById('status-sandi');

  const dialogHapus = document.getElementById('dialog-hapus-akun');
  const btnBukaHapus = document.getElementById('btn-buka-hapus-akun');
  const btnBatalHapus = document.getElementById('btn-batal-hapus');
  const btnKonfirmasiHapus = document.getElementById('btn-konfirmasi-hapus');
  const wadahToast = document.getElementById('wadah-toast');

  function toast(pesan) {
    if (!wadahToast) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = pesan;
    wadahToast.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  // Muat data profil
  async function muatProfil() {
    const res = await window.API.get('/api/saya');
    if (res.ok) {
      if (elEmail) elEmail.value = res.data.email;
      if (elNama) elNama.value = res.data.nama;
      if (elTarget) elTarget.value = res.data.targetMingguKg || 5;
    }
  }

  if (formProfil) {
    formProfil.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (statusProfil) statusProfil.textContent = '';
      const nama = elNama.value.trim();
      const targetMingguKg = parseFloat(elTarget.value);

      if (!nama || nama.length < 2) {
        if (statusProfil) {
          statusProfil.className = 'teks-bata';
          statusProfil.textContent = 'Nama minimal 2 karakter.';
        }
        return;
      }

      if (isNaN(targetMingguKg) || targetMingguKg <= 0) {
        if (statusProfil) {
          statusProfil.className = 'teks-bata';
          statusProfil.textContent = 'Target mingguan harus berupa angka positif.';
        }
        return;
      }

      const res = await window.API.put('/api/saya', { nama, targetMingguKg });
      if (res.ok) {
        if (statusProfil) {
          statusProfil.className = 'teks-lumut';
          statusProfil.textContent = 'Profil dan target mingguan berhasil diperbarui!';
        }
        toast('Profil berhasil disimpan');
      } else {
        if (statusProfil) {
          statusProfil.className = 'teks-bata';
          statusProfil.textContent = res.data.error || 'Gagal memperbarui profil.';
        }
      }
    });
  }

  if (formSandi) {
    formSandi.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (statusSandi) statusSandi.textContent = '';
      const kataSandiLama = inputSandiLama.value;
      const kataSandiBaru = inputSandiBaru.value;

      if (!kataSandiLama || !kataSandiBaru) {
        if (statusSandi) statusSandi.textContent = 'Harap isi kata sandi lama dan baru.';
        return;
      }

      if (kataSandiBaru.length < 8 || !/[A-Za-z]/.test(kataSandiBaru) || !/[0-9]/.test(kataSandiBaru)) {
        if (statusSandi) statusSandi.textContent = 'Kata sandi baru minimal 8 karakter dengan huruf dan angka.';
        return;
      }

      const res = await window.API.put('/api/saya/kata-sandi', { kataSandiLama, kataSandiBaru });
      if (res.ok) {
        if (statusSandi) {
          statusSandi.className = 'teks-lumut';
          statusSandi.textContent = 'Kata sandi berhasil diubah!';
        }
        inputSandiLama.value = '';
        inputSandiBaru.value = '';
        toast('Kata sandi berhasil diperbarui');
      } else {
        if (statusSandi) {
          statusSandi.className = 'teks-bata';
          statusSandi.textContent = res.data.error || 'Gagal mengubah kata sandi.';
        }
      }
    });
  }

  // Dialog Hapus Akun
  if (btnBukaHapus && dialogHapus) {
    btnBukaHapus.addEventListener('click', () => {
      dialogHapus.style.display = 'flex';
    });
  }

  if (btnBatalHapus && dialogHapus) {
    btnBatalHapus.addEventListener('click', () => {
      dialogHapus.style.display = 'none';
    });
  }

  if (btnKonfirmasiHapus) {
    btnKonfirmasiHapus.addEventListener('click', async () => {
      const res = await window.API.delete('/api/saya');
      if (res.ok) {
        window.location.href = '/masuk.html';
      } else {
        alert(res.data.error || 'Gagal menghapus akun');
      }
    });
  }

  const btnKeluar = document.getElementById('btn-keluar-nav');
  if (btnKeluar) {
    btnKeluar.addEventListener('click', async (e) => {
      e.preventDefault();
      await window.API.keluar();
    });
  }

  muatProfil();
})();
