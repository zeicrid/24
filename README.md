# Game 24 - React Version

## Menjalankan secara lokal

1. Install Node.js (jika belum ada) dari https://nodejs.org
2. Buka folder ini di terminal, lalu jalankan:
   ```
   npm install
   npm run dev
   ```
3. Buka link yang muncul di terminal (biasanya `http://localhost:5173`)

## Build untuk hosting (GitHub Pages)

1. Buka `vite.config.js`, ubah baris `base` menjadi nama repo GitHub kamu.
   Contoh, jika repo bernama `24`, ubah menjadi:
   ```js
   base: '/24/',
   ```
2. Jalankan:
   ```
   npm run build
   ```
3. Akan muncul folder `dist/` berisi file hasil build (HTML, CSS, JS yang sudah digabung & dioptimasi).
4. Upload **isi folder `dist/`** ke repo GitHub kamu (bisa di branch `gh-pages`, atau di root branch `main` jika kamu set Pages ke folder root).
5. Aktifkan GitHub Pages seperti biasa di Settings > Pages.

## Apa yang berbeda dari versi vanilla JS?

- Animasi merge & perpindahan posisi ubin sekarang ditangani otomatis oleh `framer-motion`
  (sebelumnya butuh kode FLIP manual yang panjang).
- State game (level, ubin, status animasi, dll) dikelola dengan React `useState`,
  jadi tampilan otomatis sinkron dengan data tanpa manipulasi DOM manual.
- Logika solver & generator soal tetap sama persis (`src/gameLogic.js`),
  cuma dipindah jadi module yang di-import.
