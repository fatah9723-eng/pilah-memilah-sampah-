// Data 32 barang sampah rumah tangga khas Indonesia untuk panduan memilah

const DATA_PANDUAN = [
  {
    id: 1,
    nama: 'Botol Kecap Manis',
    kategori: 'kacaLogam',
    kategoriLabel: 'Kaca & Logam',
    contoh: 'Botol kecap bango, saus sambal kaca',
    tips: 'Bilas bersih sisa kecap dengan sedikit air hangat. Lepas tutup plastik dan masukkan ke wadah kaca/logam.',
    warna: 'var(--warna-kacaLogam)'
  },
  {
    id: 2,
    nama: 'Kardus Mi Instan',
    kategori: 'kertas',
    kategoriLabel: 'Kertas',
    contoh: 'Kardus Indomie, Sedap, karton biskuit',
    tips: 'Buka lakban plastik, pipihkan kardus hingga gepeng agar hemat tempat saat ditimbang ke bank sampah.',
    warna: 'var(--warna-kertas)'
  },
  {
    id: 3,
    nama: 'Kulit Salak & Kulit Buah',
    kategori: 'organik',
    kategoriLabel: 'Organik',
    contoh: 'Kulit salak, kulit jeruk, kulit mangga',
    tips: 'Sangat cocok untuk komposter rumah atau lubang biopori. Jangan dicampur plastik kresek.',
    warna: 'var(--warna-organik)'
  },
  {
    id: 4,
    nama: 'Kulit Pisang',
    kategori: 'organik',
    kategoriLabel: 'Organik',
    contoh: 'Sisa kulit pisang goreng / pisang ambon',
    tips: 'Kaya kalium, sangat bagus langsung dikubur tipis di sekitar akar tanaman atau dibuat pupuk organik cair.',
    warna: 'var(--warna-organik)'
  },
  {
    id: 5,
    nama: 'Baterai Bekas (Remote / Jam)',
    kategori: 'b3',
    kategoriLabel: 'B3 (Berbahaya)',
    contoh: 'Baterai AA, AAA, baterai kancing',
    tips: 'Bungkus kutub baterai dengan isolasi bening. Taruh di wadah khusus B3 dan setor ke drop point e-waste.',
    warna: 'var(--warna-b3)'
  },
  {
    id: 6,
    nama: 'Kaca Pecah / Piring Beling',
    kategori: 'kacaLogam',
    kategoriLabel: 'Kaca & Logam',
    contoh: 'Pecahan gelas kopi, mangkok keramik retak',
    tips: 'Bungkus dengan kertas koran atau kardus tebal lalu lakban. Tulis "KACA PECAH" agar tidak melukai petugas kebersihan.',
    warna: 'var(--warna-kacaLogam)'
  },
  {
    id: 7,
    nama: 'Botol Plastik Air Mineral',
    kategori: 'plastik',
    kategoriLabel: 'Plastik',
    contoh: 'Botol PET 600ml, 1.5L',
    tips: 'Kosongkan air, remas botol hingga pipih. Lepas label plastik luar bila memungkinkan sebelum disetor.',
    warna: 'var(--warna-plastik)'
  },
  {
    id: 8,
    nama: 'Minyak Jelantah (Minyak Goreng Bekas)',
    kategori: 'b3',
    kategoriLabel: 'B3 (Berbahaya)',
    contoh: 'Sisa minyak goreng hitam',
    tips: 'Dinginkan lalu saring ke dalam jeriken / botol minyak bekas. Jangan pernah buang ke saluran air atau tanah!',
    warna: 'var(--warna-b3)'
  },
  {
    id: 9,
    nama: 'Kaleng Sarden & Susu Kental Manis',
    kategori: 'kacaLogam',
    kategoriLabel: 'Kaca & Logam',
    contoh: 'Kaleng kornet, kaleng sarden, kaleng susu',
    tips: 'Bilas bersih sisa saus atau minyak ikan dengan air sabun agar tidak mengundang semut dan lalat.',
    warna: 'var(--warna-kacaLogam)'
  },
  {
    id: 10,
    nama: 'Sisa Sayur & Nasi Basi',
    kategori: 'organik',
    kategoriLabel: 'Organik',
    contoh: 'Batang kangkung, kulit bawang, nasi sisa',
    tips: 'Tiriskan airnya sebelum dimasukkan ke tong sampah organik agar tidak menimbulkan bau busuk dan lindi.',
    warna: 'var(--warna-organik)'
  },
  {
    id: 11,
    nama: 'Kertas HVS & Buku Tulis Bekas',
    kategori: 'kertas',
    kategoriLabel: 'Kertas',
    contoh: 'Kertas cetak, fotokopi, tugas sekolah lama',
    tips: 'Lepaskan klip besi atau staples kawat. Jaga tetap kering, jangan terkena minyak atau air.',
    warna: 'var(--warna-kertas)'
  },
  {
    id: 12,
    nama: 'Styrofoam Pembungkus Makanan',
    kategori: 'plastik',
    kategoriLabel: 'Plastik',
    contoh: 'Gabus seblak, wadah bubur ayam',
    tips: 'Bilas bersih sisa kuah kaldu. Jika sangat berlemak pekat, bersihkan dulu sebelum dikelompokkan.',
    warna: 'var(--warna-plastik)'
  },
  {
    id: 13,
    nama: 'Bungkus Kopi Sachet & Sambal',
    kategori: 'plastik',
    kategoriLabel: 'Plastik',
    contoh: 'Sachet multilayer kopi mix, saus kecap sachet',
    tips: 'Gunting dan bersihkan ampasnya. Bahan multilayer ini bernilai jika dikumpulkan untuk bata ecobrick atau daur ulang khusus.',
    warna: 'var(--warna-plastik)'
  },
  {
    id: 14,
    nama: 'Bohlam Lampu & Neon TL',
    kategori: 'b3',
    kategoriLabel: 'B3 (Berbahaya)',
    contoh: 'Lampu LED rusak, lampu tabung TL pijar',
    tips: 'Mengandung merkuri gas berbahaya. Simpan dalam wadah kardus aslinya agar kaca tidak pecah di perjalanan.',
    warna: 'var(--warna-b3)'
  },
  {
    id: 15,
    nama: 'Obat Sirup & Tablet Kedaluwarsa',
    kategori: 'b3',
    kategoriLabel: 'B3 (Berbahaya)',
    contoh: 'Sirup obat batuk lewat masa kadaluarsa',
    tips: 'Keluarkan isi sirup/tablet, hancurkan, campur dengan tanah/ampas kopi. Rusak label botol sebelum dibuang ke limbah medis/B3.',
    warna: 'var(--warna-b3)'
  },
  {
    id: 16,
    nama: 'Kantong Kresek Belanja',
    kategori: 'plastik',
    kategoriLabel: 'Plastik',
    contoh: 'Kresek pasar, plastik minimarket',
    tips: 'Lipat rapi berbentuk segitiga atau simpan dalam wadah kantong untuk dipakai berulang kali sebelum disetor.',
    warna: 'var(--warna-plastik)'
  },
  {
    id: 17,
    nama: 'Struk Belanja Kertas Thermal',
    kategori: 'b3',
    kategoriLabel: 'B3 (Berbahaya)',
    contoh: 'Struk kasir minimarket, struk ATM',
    tips: 'Kertas thermal dilapisi bahan kimia BPA; tidak boleh didaur ulang bersama kertas biasa atau dijadikan kompos.',
    warna: 'var(--warna-b3)'
  },
  {
    id: 18,
    nama: 'Kotak Susu UHT (Tetra Pak)',
    kategori: 'kertas',
    kategoriLabel: 'Kertas',
    contoh: 'Kemasan karton susu anak, santan kotak',
    tips: 'Buka lipatan atas dan bawah, gunting satu sisi, bilas hingga tak bersusu, lalu keringkan sebelum ditumpuk.',
    warna: 'var(--warna-kertas)'
  },
  {
    id: 19,
    nama: 'Botol Sampo & Sabun Cair',
    kategori: 'plastik',
    kategoriLabel: 'Plastik',
    contoh: 'Botol HDPE Lifebuoy, Sunsilk, sabun cuci piring',
    tips: 'Kocok dengan sedikit air sampai busa bersih, lepas pompa pump (pegas logam), tutup dan botol plastik bernilai tinggi.',
    warna: 'var(--warna-plastik)'
  },
  {
    id: 20,
    nama: 'Kaleng Cat Semprot / Aerosol',
    kategori: 'b3',
    kategoriLabel: 'B3 (Berbahaya)',
    contoh: 'Semprotan nyamuk, cat semprot pylox, pengharum',
    tips: 'Pastikan gas di dalam kaleng sudah benar-benar habis di area berventilasi. Jangan pernah dibakar atau ditusuk paku.',
    warna: 'var(--warna-b3)'
  },
  {
    id: 21,
    nama: 'Daun Kering & Ranting Taman',
    kategori: 'organik',
    kategoriLabel: 'Organik',
    contoh: 'Sapuan halaman daun mangga, ranting peneduh',
    tips: 'Bahan cokelat (karbon) terbaik untuk campuran kompos bersama sisa makanan hijau agar kompos tidak berbau.',
    warna: 'var(--warna-organik)'
  },
  {
    id: 22,
    nama: 'Tulang Ayam & Duri Ikan',
    kategori: 'organik',
    kategoriLabel: 'Organik',
    contoh: 'Sisa makan malam ayam goreng / lele',
    tips: 'Tulang keras memerlukan waktu penguraian lebih lama; disarankan untuk biopori dalam atau pakan maggot BSF.',
    warna: 'var(--warna-organik)'
  },
  {
    id: 23,
    nama: 'Cangkang Telur Ayam',
    kategori: 'organik',
    kategoriLabel: 'Organik',
    contoh: 'Kulit telur ceplok / kue',
    tips: 'Remas hingga hancur menjadi serpihan kecil. Mengandung kalsium tinggi yang sangat disukai tanaman tomat dan cabai.',
    warna: 'var(--warna-organik)'
  },
  {
    id: 24,
    nama: 'Koran Bekas & Majalah',
    kategori: 'kertas',
    kategoriLabel: 'Kertas',
    contoh: 'Koran Kompas lama, majalah dinding',
    tips: 'Ikat rapi dengan tali rafia dalam bundel 1–2 kg. Sangat dicari oleh pengepul daur ulang kertas.',
    warna: 'var(--warna-kertas)'
  },
  {
    id: 25,
    nama: 'Panci & Wajan Rusak Bolong',
    kategori: 'kacaLogam',
    kategoriLabel: 'Kaca & Logam',
    contoh: 'Wajan teflon mengelupas, panci aluminium bocor',
    tips: 'Logam aluminium dan besi memiliki nilai daur ulang tinggi di bank sampah. Lepas gagang plastik tahan panas.',
    warna: 'var(--warna-kacaLogam)'
  },
  {
    id: 26,
    nama: 'Sikat Gigi Plastik Bekas',
    kategori: 'plastik',
    kategoriLabel: 'Plastik',
    contoh: 'Sikat gigi bekas 3 bulanan',
    tips: 'Bulu sikat nilon sulit terurai. Gagang plastik dapat didaur ulang jika dikumpulkan ke program khusus daur ulang sikat.',
    warna: 'var(--warna-plastik)'
  },
  {
    id: 27,
    nama: 'Piring Seng & Sendok Bekas',
    kategori: 'kacaLogam',
    kategoriLabel: 'Kaca & Logam',
    contoh: 'Sendok bengkok, mangkok seng jadul',
    tips: 'Kumpulkan dalam kelompok logam bersama kaleng minuman dan kabel tembaga.',
    warna: 'var(--warna-kacaLogam)'
  },
  {
    id: 28,
    nama: 'Popok Bayi Sekali Pakai',
    kategori: 'b3',
    kategoriLabel: 'B3 (Berbahaya)',
    contoh: 'Diapers, pembalut wanita',
    tips: 'Buang kotoran padat ke kloset terlebih dahulu. Gulung popok dengan rapi, masukkan kantong terpisah agar higienis.',
    warna: 'var(--warna-b3)'
  },
  {
    id: 29,
    nama: 'Galon Air Sekali Pakai',
    kategori: 'plastik',
    kategoriLabel: 'Plastik',
    contoh: 'Galon PET 15 liter sekali pakai',
    tips: 'Lepaskan pegangan tangan, injak atau pipihkan agar ringkas saat dibawa ke pengepul daur ulang.',
    warna: 'var(--warna-plastik)'
  },
  {
    id: 30,
    nama: 'Kotak Telur Karton (Egg Tray)',
    kategori: 'kertas',
    kategoriLabel: 'Kertas',
    contoh: 'Wadah karton telur isi 30 butir',
    tips: 'Terbuat dari bubur kertas daur ulang. Bisa dipakai ulang untuk menyemai bibit tanaman atau dimasukkan ke komposter.',
    warna: 'var(--warna-kertas)'
  },
  {
    id: 31,
    nama: 'Kemasan Botol Obat Salep / Tube',
    kategori: 'b3',
    kategoriLabel: 'B3 (Berbahaya)',
    contoh: 'Tube salep kulit aluminium / plastik',
    tips: 'Jangan dibakar. Tekan sampai obat habis terpakai dan pisahkan ke wadah limbah medis/B3 domestik.',
    warna: 'var(--warna-b3)'
  },
  {
    id: 32,
    nama: 'Sedotan & Tutup Cup Kopi',
    kategori: 'plastik',
    kategoriLabel: 'Plastik',
    contoh: 'Cup plastik kopi susu kekinian, sedotan boba',
    tips: 'Bilas bersih sisa susu / boba kenyal. Masukkan sedotan ke dalam cup kopi agar tidak tercecer di jalan.',
    warna: 'var(--warna-plastik)'
  }
];

window.DATA_PANDUAN = DATA_PANDUAN;
