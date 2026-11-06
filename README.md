# WEBGL-GRAFKOM

Proyek karakter WebGL murni tanpa library 3D dan tanpa dependensi jaringan.

Buka folder ini di VS Code, lalu klik kanan **index.html -> Open with Live Server**.

Halaman terpisah:

- `index.html`: cerita 60 detik, ketiga karakter dalam satu hutan.
- `pooh.html`: demo Winnie the Pooh.
- `piglet.html`: hanya Piglet.
- `tigger.html`: hanya Tigger.

Pada halaman demo karakter, keyboard 1/2/3 berpindah halaman. T/R/S/A/H mendemonstrasikan translate, rotate,
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

## Petualangan Layang-Layang (60 detik)

Buka `index.html`. Piglet bermain layang-layang, angin menyangkutkannya di pohon, dan ketiga sahabat mencari cara untuk membebaskannya. Cerita memiliki upaya gagal, kerja sama, klimaks penyelamatan, dan akhir ketika layang-layang terbang kembali.

| Detik | Adegan |
| --- | --- |
| 0-8 | Piglet menerbangkan layang-layang; Pooh keluar dari arah rumah. |
| 8-15 | Angin membawa layang-layang ke cabang; Piglet mengejarnya. |
| 15-25 | Piglet gagal meraih; Pooh menunjuk dan membantu mencari cara. |
| 25-35 | Tigger menyeberangi jembatan, berlari, lalu mencoba melompat. |
| 35-41 | Piglet mengendurkan tali; Pooh menunjuk cabang; Tigger merendah dan melesat. |
| 41-48 | Tangan Tigger menyentuh layang-layang; ia turun dan melepaskannya kembali. |
| 48-60 | Layang-layang terbang lagi; ketiganya merayakan dan menyapa penonton. |

Environment berisi rumah Pooh, sungai, jembatan kayu, jalur tanah, clearing, pohon penyelamatan, bukit, bunga, semak, dan kupu-kupu. Kamera mengikuti perkembangan cerita. Dialog tampil sebagai subtitle; belum ada audio.

Space: putar/jeda. R: ulangi. U: sembunyikan kontrol (judul dan subtitle tetap tampil untuk video). Slider: pilih waktu. Drag/scroll: kamera. Cerita berhenti pada detik 60. Preferensi reduced motion memulai cerita dalam keadaan jeda; tekan Putar untuk menonton.

- `src/animation/story.js`: timeline, pose, interaksi, kamera, dan transformasi.
- `src/scene/story-props.js`: layang-layang, tali yang mengikuti tangan, dan properti solid.
- `src/scene/environment.js`: lingkungan dan gerak ambient.
- `src/story-player.js`: playback, renderer, dan kontrol halaman.

Pemeriksaan: `node tests/check.mjs`, `node tests/story-check.mjs`, dan `node tests/environment-check.mjs`.
