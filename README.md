# SOUND HOBBY — Kartu Hobi Bersuara

Media pembelajaran **Bahasa Inggris Kelas 3 SD** (topic: *My Hobby*). Aplikasi ini punya dua menu:

1. **Kartu Hobi** — foto hobi, nama bahasa Inggris, arti bahasa Indonesia, dan ikon speaker untuk mengucapkan nama hobi.
2. **Buat Kalimat** — pembuat kalimat otomatis (pilih hobi + tempat) dan **11 contoh kalimat**, masing-masing dengan ikon speaker untuk mengucapkan kalimatnya.

Tersedia **11 jenis hobi** dan **11 contoh kalimat**.

## Daftar hobi

Swimming · Playing football · Dancing · Singing · Reading books · Riding a bike · Watching TV · Cooking · Drawing · Shopping · Gardening

Enam kata pertama sesuai permintaan; lima kata berikutnya (Watching TV, Cooking, Drawing, Shopping, Gardening) diambil dari gambar daftar kosakata yang dibagikan.

## Fitur

### Kartu Hobi
- 11 kartu dengan foto nyata dan kata hobi yang sudah diperbarui
- Tombol speaker di setiap kartu — suara dihasilkan langsung oleh browser lewat **Web Speech API** (`speechSynthesis`), tanpa file audio
- Pilihan bahasa pengucapan: **English (en-US)** atau **Indonesia (id-ID)**
- Pencarian hobi, filter kategori, tombol acak, dan layar penuh

### Buat Kalimat
- Pilih **hobi** dan **tempat** → kalimat seperti *"I like reading books in the library."* langsung terbentuk, lengkap dengan arti bahasa Indonesianya
- Tombol **🎲 Acak** untuk variasi kalimat, dan speaker besar untuk mendengarkan kalimat buatanmu
- 11 contoh kalimat siap pakai (satu untuk tiap hobi), masing-masing dengan foto hobi dan tombol speaker kalimat
- Pencarian kalimat/hobi dan tombol acak urutan

### Umum
- Tombol **Putar Semua** di kedua menu untuk membacakan semua kartu/kalimat yang ditampilkan secara berurutan (berhenti dengan tombol yang sama atau tombol Esc)
- Status bicara langsung, animasi saat dibacakan, dan dukungan keyboard (Tab, Enter/Spasi, Esc)
- Situs statis, tanpa build dan tanpa dependensi

## Daftar kata dalam PDF

[Unduh daftar kata hobi (PDF)](daftar-kata-hobi.pdf) — berisi 11 kata hobi beserta arti bahasa Indonesianya. Tautan unduh juga tersedia di bagian atas aplikasi.

## Demo online

Aplikasi ini dipublikasikan dengan GitHub Pages:
**https://gurukayarayaid.github.io/gim-sound-hobby/**

## Menjalankan

Cukup buka `index.html` di browser. Untuk hasil terbaik (terutama di IFP), jalankan lewat server lokal:

```bash
python -m http.server 8081
```

Lalu buka <http://localhost:8081/index.html>.

Di Windows, klik dua kali `jalankan.bat` — file ini otomatis menyalakan server lokal dan membuka browser.

## Catatan suara

Fitur pengucapan memakai `window.speechSynthesis` dan suara bawaan sistem operasi. Pastikan perangkat memiliki suara English/Indonesia yang terpasang dan volume tidak dibungkam. Browser yang disarankan: **Chrome, Edge, atau Safari versi terbaru**. Jika suara tidak keluar, coba muat ulang halaman setelah beberapa detik agar daftar suara browser selesai dimuat.

## Struktur

```
gim-sound-hobby/
├── index.html
├── css/style.css
├── js/data.js        # daftar 11 hobi (kata, arti, kategori, gambar)
├── js/sentences.js   # 11 contoh kalimat + daftar tempat
├── js/app.js         # render kartu/kalimat, filter, builder, dan pengucapan
├── assets/hobbies/   # 11 foto hobi + CREDITS.md
├── jalankan.bat      # launcher server lokal (Windows)
├── daftar-kata-hobi.pdf # daftar 11 kata hobi + artinya
└── README.md
```

## Kredit foto

Foto berasal dari Openverse dengan lisensi Creative Commons. Rincian penulis, lisensi, dan sumber ada di [`assets/hobbies/CREDITS.md`](assets/hobbies/CREDITS.md).
