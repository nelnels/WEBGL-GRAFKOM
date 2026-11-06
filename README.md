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
di [RUBRIK.md](docs/RUBRIK.md). Jalankan pemeriksaan matematika/geometri dengan
`node tests/check.mjs` bila Node.js tersedia; aplikasi sendiri hanya memerlukan browser
dengan WebGL dan server HTTP lokal.

## Struktur folder

```text
WEBGL-GRAFKOM/
|-- index.html, pooh.html, piglet.html, tigger.html
|-- src/
|   |-- main.js                  # Titik masuk dan loop rendering
|   |-- core/webgl.js            # Class OOP, matematika, geometri dasar, renderer
|   |-- geometry/primitives.js   # Helper bentuk penyusun karakter
|   |-- characters/              # Model dan animasi Pooh, Piglet, Tigger
|   |-- scene/                   # Kamera dan lingkungan
|   `-- animation/               # Demo transformasi dan kontrol keyboard
|-- styles/style.css
|-- tests/check.mjs
`-- docs/RUBRIK.md
```

## Alur kode

1. HTML memuat `styles/style.css` dan `src/main.js`.
2. `main.js` membaca `data-character` dan memuat builder di `src/characters/`.
3. Builder menyusun karakter memakai `geometry/primitives.js` dan class `Node`/`Mesh` dari `core/webgl.js`.
4. `main.js` menggabungkan karakter dan environment, lalu menyiapkan kamera dan kontrol transformasi.
5. Setiap frame memperbarui animasi, transformasi, dan kamera, lalu `Renderer` menggambar scene.
