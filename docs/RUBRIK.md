# Rubrik: WebGL murni dan cerita bersama

Seluruh rendering 3D menggunakan WebGL 1.0 langsung. Tidak ada Three.js,
library matriks, CDN, model GLB, atau renderer eksternal. HTML/CSS menyediakan
kanvas; JavaScript menghitung geometri dan transformasi; GLSL merendernya di GPU.

## Cara membuka satu per satu di VS Code

1. Buka folder `WEBGL-GRAFKOM`.
2. Klik kanan `pooh.html`, lalu **Open with Live Server**.
3. Untuk Piglet, buka `piglet.html` dengan cara yang sama.
4. Untuk Tigger, buka `tigger.html` dengan cara yang sama.
5. `index.html` menampilkan film Pooh terjepit 68 detik dengan ketiga karakter dalam satu environment.

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

**Sedikit Terlalu Banyak Madu**, film 68 detik tanpa percakapan. Adaptasi bebas
*Winnie-the-Pooh*, bab 2; Piglet dan Tigger menjadi penolong untuk versi tiga karakter.

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

| Kriteria | Implementasi |
| --- | --- |
| Tiga karakter dalam satu environment | Pooh, Piglet dan Tigger pada satu halaman rumah sederhana |
| Translate | Pooh keluar; kedua penolong mendekat; posisi mengikuti titik pegangan saat menarik |
| Rotate | Kepala menoleh, tangan meraih, badan condong, kaki mengatur pijakan |
| Scaling | Tigger merendah sebelum menarik; Pooh sedikit menyempit saat lepas dari pintu |
| Arbitrary axis | Tigger sedikit miring pada sumbu ternormalisasi (1,1,0.5) saat menarik; jatuh juga memakai axis-angle |
| Hierarchy | Semua anggota tubuh mengikuti root/body; titik tangan dihitung dari matriks dunia |
| 3D curve dan quadric lain | Geometri karakter tetap: lengan Pooh/ekor Tigger, moncong Pooh dan telinga Piglet/Tigger |
| Environment | Balok dinding/atap/bangku, cylinder batang/pot, ellipsoid daun, torus bibir pot |
| Kelancaran | Interpolasi halus, dua tarikan berbeda, jatuh/bangun berselang, dan grounding |

`tests/story-check.mjs` memeriksa durasi 68 detik, fase, waktu pelepasan,
jarak pegangan, kontinuitas gerak, grounding dan replay deterministik.
`tests/environment-check.mjs` memeriksa hutan demo serta set rumah termasuk
ruang pintu yang tidak ditutup mesh. [ANIMASI.md](ANIMASI.md) menjelaskan rumusnya.

U menyembunyikan kontrol. Tidak ada dialog atau subtitle; judul hanya di awal/akhir.
Video trailer, laporan, gambar per karakter dan data pengumpulan masih perlu disiapkan.
