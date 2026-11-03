// Modul Panggilan API Pilah (Tanpa library luar)

const API = {
  async panggil(url, opsi = {}) {
    const config = {
      method: opsi.method || 'GET',
      headers: {
        'Accept': 'application/json',
        ...(opsi.headers || {})
      }
    };

    const token = localStorage.getItem('pilah_session_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (opsi.body && typeof opsi.body === 'object') {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(opsi.body);
    }

    try {
      const res = await fetch(url, config);
      let data = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      }

      if (res.status === 401) {
        // Jika belum masuk dan sedang di halaman terlindungi, arahkan ke masuk
        const path = window.location.pathname;
        if (path.includes('dasbor') || path.includes('profil') || path.includes('panduan')) {
          window.location.href = '/masuk.html';
        }
      }

      return {
        ok: res.ok,
        status: res.status,
        data
      };
    } catch (err) {
      console.error(`Panggilan API ke ${url} gagal:`, err);
      return {
        ok: false,
        status: 0,
        data: { error: 'Gagal terhubung ke server. Periksa jaringan Anda.' }
      };
    }
  },

  get(url) {
    return this.panggil(url, { method: 'GET' });
  },

  post(url, body) {
    return this.panggil(url, { method: 'POST', body });
  },

  put(url, body) {
    return this.panggil(url, { method: 'PUT', body });
  },

  delete(url) {
    return this.panggil(url, { method: 'DELETE' });
  },

  async keluar() {
    const res = await this.post('/api/keluar');
    window.location.href = '/masuk.html';
    return res;
  }
};

window.API = API;
