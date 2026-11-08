# Rubrik: WebGL murni dan cerita bersama

Seluruh rendering 3D menggunakan WebGL 1.0 langsung. Tidak ada Three.js,
library matriks, CDN, model GLB, atau renderer eksternal. HTML/CSS menyediakan
kanvas; JavaScript menghitung geometri dan transformasi; GLSL merendernya di GPU.

## Cara membuka satu per satu di VS Code

1. Buka folder `WEBGL-GRAFKOM`.
2. Klik kanan `pooh.html`, lalu **Open with Live Server**.
3. Untuk Piglet, buka `piglet.html` dengan cara yang sama.
4. Untuk Tigger, buka `tigger.html` dengan cara yang sama.
5. `index.html` menampilkan cerita 60 detik dengan ketiga karakter dalam satu environment.

Contoh URL bila Live Server berjalan di port 5500:

- `http://127.0.0.1:5500/pooh.html`
- `http://127.0.0.1:5500/piglet.html`
- `http://127.0.0.1:5500/tigger.html`

Nomor port mengikuti yang ditampilkan Live Server. Jangan membuka HTML dengan
double-click/file:// karena ES module perlu dilayani lewat HTTP.
Alternatif terminal dari folder proyek: `python3 -m http.server 8000`, lalu
buka `http://localhost:8000/pooh.html` dan halaman lainnya.

Halaman demo karakter membangun satu model. Halaman utama membangun Pooh, Piglet, dan Tigger dalam satu scene bersama environment yang sama.

## Kontrol

Klik kanvas, lalu gunakan keyboard:

| Tombol | Aksi |
| --- | --- |
| 1 | Buka halaman Pooh |
| 2 | Buka halaman Piglet |
| 3 | Buka halaman Tigger |
| T | Demonstrasi Translate |
| R | Demonstrasi Rotate sumbu Y |
| S | Demonstrasi Scaling |
| A | Demonstrasi Rotate Arbitrary Axis `(1, 1, 0.5)` |
| H | Demonstrasi Hierarchical Transformation |
| 0 / Esc | Kembali ke animasi normal |
| Space | Jeda/lanjut animasi |
| Drag / scroll | Putar kamera / zoom |

Menekan tombol demo yang sama sekali lagi juga kembali ke animasi normal.
Tombol 1/2/3 berpindah halaman, bukan menggabungkan karakter.

## Urutan demonstrasi setiap karakter

1. Perlihatkan animasi normal dan putar kamera untuk menunjukkan bentuk 3D.
2. Tekan T, jelaskan perubahan posisi. Tekan 0.
3. Tekan R, jelaskan rotasi sumbu Y. Tekan 0.
4. Tekan S, jelaskan perubahan ukuran. Tekan 0.
5. Tekan A, jelaskan sumbu diagonal ternormalisasi dan rumus Rodrigues. Tekan 0.
6. Tekan H, tunjukkan bahwa kepala dan anggota tubuh mengikuti parent badan.
7. Pindah karakter berikutnya dengan 2/3 dan ulangi.

## Pemetaan rubrik per karakter

| Poin | Pooh | Piglet | Tigger |
| --- | --- | --- | --- |
| 3D curve di karakter | Lengkungan kedua lengan | Senyum, alis, lipatan telinga | Ekor, alis, mulut, kumis |
| Ellipsoid | Kepala, perut, mata, telapak | Kepala, badan, moncong, tangan, telapak | Kepala, leher, paha, moncong, tangan |
| Cylinder | Lengan baju | Lengan, kaki | Lengan, betis |
| Quadric lain | Moncong: elliptic paraboloid | Telinga: elliptic paraboloid | Telinga: elliptic paraboloid |
| Translate/Rotate/Scaling/Arbitrary Axis | Ada, dengan kontrol T/R/S/A | Ada, dengan kontrol T/R/S/A | Ada, dengan kontrol T/R/S/A |
| Hierarchy | Badan -> kepala/tangan/kaki | Badan -> kepala/lengan/kaki; kepala -> telinga | Badan -> kepala/lengan/kaki/ekor; lengan -> siku; kaki -> lutut |

Quadric lokal: `z = d*(1 - x*x/(a*a) - y*y/(b*b))`.
Telinga Piglet menggeser pusat y sebesar 0.55. Badan/perut Tigger memakai surface bebas;
bukti quadric lain pada Tigger ada di telinga. Telapaknya memakai ellipsoid.
Panduan detail dan mode sorot primitive: [TIGGER.md](TIGGER.md).
Cylinder memakai radius atas sama dengan radius bawah.

## Kode yang ditunjukkan kepada dosen

- `src/core/webgl.js`: `canvas.getContext('webgl')`, GLSL vertex/fragment shader,
  `createBuffer`, `bufferData`, `vertexAttribPointer`, `uniformMatrix4fv`,
  `drawElements`, depth buffer, dan shadow framebuffer.
- `src/core/webgl.js`: `rotationAxis()` menghitung matriks Rodrigues; `Node.updateWorld()`
  menghitung `M_world_child = M_world_parent * M_local_child`.
- `src/core/webgl.js`: fungsi tessellation sphere/ellipsoid, cylinder, parametric surface,
  Catmull-Rom curve dan tube, serta torus.
- `src/geometry/primitives.js`: helper ellipsoid, cylinder, curve, dan elliptic paraboloid.
- `src/characters/pooh/index.js`, `src/characters/piglet/index.js`, `src/characters/tigger/index.js`: geometri serta hierarchy masing-masing karakter.
- `src/animation/character-transforms.js`: lima transformasi untuk karakter pada halaman aktif.
- `src/scene/camera.js`: kamera orbit berbasis event pointer, matriks view dan projection.
- `src/scene/environment.js`: tanah, pohon, batu, bunga, dan awan.
- `src/main.js`: pemilihan satu model, loop requestAnimationFrame, resize dan rendering.

Environment dan transisi halus sudah diimplementasikan; nilai estetika tetap
berdasarkan penilaian dosen.

## Bukti rubrik dalam cerita utama

Cerita: **Petualangan Layang-Layang**, durasi 60 detik. Piglet kehilangan kendali layang-layang, mencoba meraih tetapi gagal, lalu dibantu Pooh dan Tigger. Klimaks terjadi ketika tangan Tigger benar-benar mencapai layang-layang di cabang. Akhir memperlihatkan layang-layang kembali terbang.

| Kriteria | Adegan / implementasi |
| --- | --- |
| Tiga karakter, satu environment | `index.html`: Pooh, Piglet, dan Tigger dalam satu hutan; rumah, jembatan, dan pohon terhubung oleh jalur cerita |
| Translate | Piglet mengejar layang-layang (8-15); Tigger melewati jembatan (25-30); lompatan penyelamatan (38.5-44.5) |
| Rotate | Badan menghadap arah perjalanan; kepala menoleh dan mendongak; tangan menunjuk/melambai |
| Scaling | Tigger melakukan squash saat bersiap (36-39.5), lalu kembali ke proporsi normal saat meraih layang-layang |
| Arbitrary axis | Tigger melakukan salto penuh 360° terhadap sumbu ternormalisasi (1, 1, 0.5), detik 41.6-44.3 |
| Hierarchy | Gerakan dari pivot bahu; kepala, tangan, kaki mengikuti badan; lutut dan ekor Tigger bergerak |
| 3D curve pada karakter | Lengan Pooh, detail wajah Piglet, ekor/detail wajah Tigger |
| Ellipsoid / cylinder / quadric lain | Geometri karakter dipertahankan; moncong Pooh, telinga Piglet, serta telinga Tigger berupa paraboloid |
| Environment / kelancaran | Hutan berlapis, rumah, sungai, jembatan, jalan, bunga, kupu-kupu; transisi halus, kamera mengikuti adegan |

Implementasi cerita ada di `src/animation/story.js`; properti dan tali di `src/scene/story-props.js`. Timeline memakai waktu absolut agar seek dan replay menghasilkan pose yang sama. Tangan Tigger bertemu layang-layang di detik 41; tali mengikuti posisi tangan Piglet dan mengendur saat persiapan.

U menyembunyikan kontrol untuk rekaman, sementara judul dan subtitle tetap tampil. Dialog berupa teks, belum ada audio. Rekaman video 1 menit, unggahan YouTube, minimal dua gambar per karakter, dan dokumen pengumpulan tetap perlu disiapkan. Estetika dan kemiripan tetap dinilai dosen.
