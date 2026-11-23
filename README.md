# SOUND HOBBY — Kartu Hobi Bersuara

Media pembelajaran **Bahasa Inggris Kelas 3 SD** (topic: *My Hobby*). Setiap kartu menampilkan **foto hobi**, **nama bahasa Inggris**, arti bahasa Indonesianya, dan **ikon speaker** yang jika diketuk akan **mengucapkan nama hobi** tersebut.

Tersedia **20 jenis hobi berbeda**.

## Fitur

- 20 kartu hobi dengan foto nyata: reading, swimming, painting, cooking, football, cycling, dancing, singing, gardening, fishing, hiking, drawing, sewing, jogging, yoga, chess, tennis, guitar, drums, camping
- Tombol speaker di setiap kartu — suara dihasilkan langsung oleh browser lewat **Web Speech API** (`speechSynthesis`), tanpa file audio
- Pilihan bahasa pengucapan: **English (en-US)** atau **Indonesia (id-ID)**
- Tombol **Putar Semua** untuk mendengarkan seluruh kartu yang sedang ditampilkan secara berurutan (otomatis berhenti dengan tombol yang sama / tombol Esc)
- Pencarian hobi, filter kategori, dan tombol acak urutan kartu
- Tombol layar penuh untuk penggunaan di IFP / proyektor
- Status bicara langsung, animasi kartu saat dibacakan, dan dukungan keyboard (Tab, Enter/Spasi, Esc)
- Situs statis, tanpa build dan tanpa dependensi

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
├── js/data.js        # daftar 20 hobi (kata, arti, kategori, gambar)
├── js/app.js         # render kartu, filter, dan logika pengucapan
├── assets/hobbies/   # 20 foto hobi + CREDITS.md
├── jalankan.bat      # launcher server lokal (Windows)
└── README.md
```

## Kredit foto

Foto berasal dari Openverse dengan lisensi Creative Commons. Rincian penulis, lisensi, dan sumber ada di [`assets/hobbies/CREDITS.md`](assets/hobbies/CREDITS.md).
