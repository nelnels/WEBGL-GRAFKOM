# WEBGL-GRAFKOM

Proyek karakter WebGL murni tanpa library 3D dan tanpa dependensi jaringan.

Buka folder ini di VS Code, lalu klik kanan **pooh.html -> Open with Live Server**.

Halaman terpisah:

- `index.html` atau `pooh.html`: hanya Winnie the Pooh.
- `piglet.html`: hanya Piglet.
- `tigger.html`: hanya Tigger.

Keyboard 1/2/3 berpindah halaman. T/R/S/A/H mendemonstrasikan translate, rotate,
scaling, rotasi sumbu bebas, dan hierarchy. 0/Esc kembali ke animasi normal.
Space menjeda animasi, drag memutar kamera, dan scroll melakukan zoom.

Penjelasan rubrik, rumus, lokasi implementasi WebGL, dan urutan presentasi tersedia
di [RUBRIK.md](RUBRIK.md). Jalankan pemeriksaan matematika/geometri dengan
`node check.mjs` bila Node.js tersedia; aplikasi sendiri hanya memerlukan browser
dengan WebGL dan server HTTP lokal.
