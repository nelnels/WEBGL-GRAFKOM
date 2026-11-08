# WEBGL-GRAFKOM

Proyek karakter WebGL murni tanpa library 3D dan tanpa dependensi jaringan.

Untuk urutan demonstrasi, peta rubrik → file → fungsi, rumus, dan persiapan video,
buka [Panduan Presentasi](docs/PRESENTASI.md).

Buka folder ini di VS Code, lalu klik kanan **index.html -> Open with Live Server**.

Halaman terpisah:

- `index.html`: film tanpa percakapan 68 detik, Pooh terjepit di pintu lalu ditolong Piglet/Tigger.
- `pooh.html`: demo Winnie the Pooh.
- `piglet.html`: hanya Piglet.
- `tigger.html`: hanya Tigger.

Pada halaman demo karakter, keyboard 1/2/3 berpindah halaman. T/R/S/A/H mendemonstrasikan translate, rotate,
scaling, rotasi sumbu bebas, dan hierarchy. 0/Esc kembali ke animasi normal.
Space menjeda animasi, drag memutar kamera, dan scroll melakukan zoom.
G membuka panel geometri pada ketiga halaman karakter. Pilih primitive untuk
menyorot mesh serta melihat rumus dan modul pembangunnya; tutup panel untuk
mengembalikan warna asli. Surface bebas juga mencakup torus pada pakaian.

Penjelasan rubrik, rumus, lokasi implementasi WebGL, dan urutan presentasi tersedia
di [RUBRIK.md](docs/RUBRIK.md). Jalankan pemeriksaan matematika/geometri dengan
`node tests/check.mjs` bila Node.js tersedia; aplikasi sendiri hanya memerlukan browser
dengan WebGL dan server HTTP lokal.

## Struktur folder

```text
WEBGL-GRAFKOM/
|-- index.html, pooh.html, piglet.html, tigger.html
|-- src/
|   |-- main.js                       # Titik masuk dan pemuatan karakter
|   |-- story-player.js               # Playback cerita dan loop rendering
|   |-- character-presentation.js     # Panel sorot bersama ketiga karakter
|   |-- core/webgl.js                 # Matriks, Node/Mesh, geometri, renderer
|   |-- geometry/
|   |   |-- primitives.js             # Helper geometri dasar
|   |   |-- character-helpers.js      # Primitive bernama dan metadata Pooh/Piglet
|   |   `-- quadrics.js               # Pembungkus primitive bernama
|   |-- characters/
|   |   |-- pooh/                      # index, materials, torso, head, ears, limbs
|   |   |-- piglet/                    # index, materials, torso, head, ears, limbs
|   |   `-- tigger/
|   |       |-- index.js              # createTigger, perakitan dan update(t)
|   |       |-- materials.js          # Warna
|   |       |-- torso.js              # Loft badan/perut; leher dan dada
|   |       |-- head.js               # Kepala dan wajah
|   |       |-- ears.js               # Paraboloid telinga
|   |       |-- limbs.js              # Lengan dan kaki
|   |       `-- tail.js               # Ekor kurva 3D
|   |-- scene/
|   |   |-- camera.js                 # Kamera orbit dan proyeksi
|   |   |-- doorway-set.js            # Perakitan tanah, rumah, pohon, langit, taman
|   |   `-- story-props.js            # Helper balok set rumah
|   `-- animation/                    # story.js dan character-transforms.js
|-- styles/style.css
|-- tests/                            # check.mjs, story-check.mjs, environment-check.mjs
`-- docs/                             # RUBRIK.md dan TIGGER.md
```

## Alur kode

1. HTML memuat `styles/style.css` dan `src/main.js`.
2. `main.js` membaca `data-character` dan memuat builder di `src/characters/`.
3. Builder menyusun karakter memakai `geometry/primitives.js` dan class `Node`/`Mesh` dari `core/webgl.js`.
4. `main.js` menampilkan demo karakter di latar kosong, lalu menyiapkan kamera dan kontrol transformasi. Hanya cerita utama yang membangun set rumah melalui `doorway-set.js`.
5. Setiap frame memperbarui animasi, transformasi, dan kamera, lalu `Renderer` menggambar scene.

## Lokasi item rubrik

Object 1/2/3 di tabel berikut adalah tiga karakter utama. Baris primitive
menunjukkan lokasi bentuk penyusunnya pada Tigger.

| Item rubrik | File | Fungsi / metode |
| --- | --- | --- |
| 3D Curve | `src/characters/tigger/tail.js`; `src/geometry/primitives.js` | `buildTail()`; `line()` |
| Object 1 — Pooh | `src/characters/pooh/index.js` | `createPooh()` |
| Object 2 — Piglet | `src/characters/piglet/index.js` | `createPiglet()` |
| Object 3 — Tigger | `src/characters/tigger/index.js` | `createTigger()` |
| Ellipsoid | `src/geometry/quadrics.js`; `src/characters/tigger/head.js` | `ELLIPSOID()`; `buildHead()` |
| Elliptic paraboloid | `src/geometry/quadrics.js`; `src/characters/tigger/ears.js` | `ELLIPTIC_PARABOLOID()`; `buildEars()` |
| Cylinder | `src/geometry/quadrics.js`; `src/characters/tigger/limbs.js` | `CYLINDER()`; `buildLimbs()` |
| Translate | `src/animation/character-transforms.js` | `createCharacterTransforms()` → `update()`, mode `translate` |
| Rotate | `src/animation/character-transforms.js` | `createCharacterTransforms()` → `update()`, mode `rotate` |
| Scaling | `src/animation/character-transforms.js` | `createCharacterTransforms()` → `update()`, mode `scale` |
| Rotate arbitrary axis | `src/animation/character-transforms.js`; `src/core/webgl.js` | `createCharacterTransforms()` → `update()`, mode `axis`; `rotationAxis()` |
| Hierarchical | `src/animation/character-transforms.js`; `src/core/webgl.js` | `createCharacterTransforms()` → `update()`, mode `hierarchy`; `Node.updateWorld()` |

Rincian struktur Tigger tersedia di [TIGGER.md](docs/TIGGER.md). Badan dan perut
Tigger adalah surface loft bebas; panel sorot menampilkan jenis tersebut tersendiri.
Pembagian modul Pooh dan Piglet tersedia di [POOH-PIGLET.md](docs/POOH-PIGLET.md).

## Sedikit Terlalu Banyak Madu (68 detik)

Buka `index.html` melalui Live Server. Pooh menghabiskan madu lalu terjepit di pintu.
Piglet mencoba menolong; Tigger ikut membantu. Setelah dua usaha bersama, Pooh
lepas dan ketiganya jatuh bergantian. Penutupnya, Pooh kembali meraih pot madu.
Tanpa percakapan, subtitle maupun audio. Halaman cerita langsung menampilkan animasi saja untuk rekaman; judul dihapus dan kontrol disembunyikan saat dibuka.

Adaptasi bebas *Winnie-the-Pooh*, bab 2: Pooh terjepit setelah makan di rumah Rabbit.
Penolong diganti menjadi Piglet dan Tigger serta kejadiannya dipadatkan untuk film ini.

| Detik | Adegan |
| --- | --- |
| 0–6 | Pooh menghabiskan madu, meletakkan pot pada bangku dan berdiri menghadap pintu. |
| 6–14 | Pooh berjalan ke pintu, tersangkut, mencoba maju-mundur dan melihat perutnya. |
| 14–24 | Piglet mendekat, meraih kedua tangan Pooh, lalu mencoba menarik sendiri. |
| 24–30 | Tigger mendekat dan memegang bagian belakang tubuh Piglet. |
| 30–39 | Tarikan pertama: mengatur kaki, menarik, bertahan, kemudian mengendur. |
| 39–48 | Mereka menekuk kaki lagi; tarikan kedua meningkat sampai Pooh mulai lepas. |
| 48–55 | Pooh lepas dan jatuh lebih dulu, disusul Piglet dan Tigger. |
| 55–63 | Mereka bangun bergantian. |
| 63–68 | Pooh meraih pot madu lagi; Piglet dan Tigger menoleh serta mengangkat tangan. |

Environment khusus cerita mencakup rumah berdinding belakang, panel kaca transparan,
jendela, atap pelana, cerobong, pintu yang benar-benar berlubang, halaman, sembilan pohon,
matahari, awan, taman bunga, bangku, serta dua pot madu.
Halaman demo karakter memakai latar kosong. Kamera bergerak dari dalam rumah
ke sisi luar, kemudian melebar saat ketiganya jatuh.

Space: putar/jeda. R: ulangi. U: tampilkan/sembunyikan kontrol. Slider: pilih waktu 0–68.
Drag/scroll: kamera. Preferensi reduced motion memulai cerita dalam keadaan jeda.

- `src/animation/story.js`: pose, dua usaha menarik, kontak, jatuh dan kamera.
- `src/scene/doorway-set.js`: environment cerita dan pot madu prosedural.
- `src/scene/story-props.js`: helper balok.
- `src/story-player.js`: playback, seek, replay dan rendering WebGL.

Pemeriksaan: `node tests/check.mjs`, `node tests/story-check.mjs`,
`node tests/environment-check.mjs`, dan `node tests/character-refactor-check.mjs`.
`node tests/video-rubric-check.mjs` memeriksa gerakan yang diperjelas untuk video:
kemiringan diagonal Tigger saat datang, squash persiapan di penutup, lambaian
bahu–siku–telapak, dan seek deterministik. Bukti visual tetap berada di dalam
cerita 68 detik, tanpa panel rubrik atau tur presentasi tambahan.
Penjelasan gerak untuk presentasi: [ANIMASI.md](docs/ANIMASI.md).

`doorway-set.js` menyediakan `buildGround()`, `buildHouse()`, `buildTrees()`,
`buildSky()`, dan `buildGarden()`. `createDoorwaySet()` hanya merakit bagian-bagian
tersebut. `story.js` menyediakan `STORY_PHASES` untuk bab dan `STORY_TIMING`
internal untuk waktu aksi penting; komentar bernomor memandu pembacaan geraknya.
