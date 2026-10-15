# Rubrik: WebGL murni dan karakter terpisah

Seluruh rendering 3D menggunakan WebGL 1.0 langsung. Tidak ada Three.js,
library matriks, CDN, model GLB, atau renderer eksternal. HTML/CSS menyediakan
kanvas; JavaScript menghitung geometri dan transformasi; GLSL merendernya di GPU.

## Cara membuka satu per satu di VS Code

1. Buka folder `/Applications/XAMPP/xamppfiles/htdocs/WEBGLGRAFKOM`.
2. Klik kanan `pooh.html`, lalu **Open with Live Server**.
3. Untuk Piglet, buka `piglet.html` dengan cara yang sama.
4. Untuk Tigger, buka `tigger.html` dengan cara yang sama.
5. `index.html` juga menampilkan Pooh saja sebagai halaman awal.

Contoh URL bila Live Server berjalan di port 5500:

- `http://127.0.0.1:5500/pooh.html`
- `http://127.0.0.1:5500/piglet.html`
- `http://127.0.0.1:5500/tigger.html`

Nomor port mengikuti yang ditampilkan Live Server. Jangan membuka HTML dengan
double-click/file:// karena ES module perlu dilayani lewat HTTP.
Alternatif terminal dari folder proyek: `python3 -m http.server 8000`, lalu
buka `http://localhost:8000/pooh.html` dan halaman lainnya.

Setiap halaman hanya mengimpor builder karakter pilihannya dan membangun satu model.
Tidak ada tiga karakter yang disembunyikan dalam satu scene.

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
| 3D curve di karakter | Lipatan kaus | Senyum, alis, lipatan telinga | Ekor, alis, mulut, kumis |
| Ellipsoid | Kepala, perut, mata, telapak | Kepala, badan, moncong, tangan, telapak | Kepala, leher, paha, moncong, tangan |
| Cylinder | Lengan, lengan baju | Lengan, kaki | Lengan, betis |
| Quadric lain | Moncong: elliptic paraboloid | Telinga: elliptic paraboloid | Ujung telapak: elliptic paraboloid |
| Translate/Rotate/Scaling/Arbitrary Axis | Ada, dengan kontrol T/R/S/A | Ada, dengan kontrol T/R/S/A | Ada, dengan kontrol T/R/S/A |
| Hierarchy | Badan -> kepala/tangan/kaki/gentong | Badan -> kepala/lengan/kaki; kepala -> telinga | Badan -> kepala/lengan/kaki/ekor; lengan -> siku; kaki -> lutut |

Quadric lokal: `z = d*(1 - x*x/(a*a) - y*y/(b*b))`.
Telinga Piglet menggeser pusat y sebesar 0.76. Torso Tigger berbentuk khusus
bukan quadric; bukti quadric Tigger ada pada ujung telapak belakang.
Cylinder memakai radius atas sama dengan radius bawah.

## Kode yang ditunjukkan kepada dosen

- `webgl.js`: `canvas.getContext('webgl')`, GLSL vertex/fragment shader,
  `createBuffer`, `bufferData`, `vertexAttribPointer`, `uniformMatrix4fv`,
  `drawElements`, depth buffer, dan shadow framebuffer.
- `webgl.js`: `rotationAxis()` menghitung matriks Rodrigues; `Node.updateWorld()`
  menghitung `M_world_child = M_world_parent * M_local_child`.
- `webgl.js`: fungsi tessellation sphere/ellipsoid, cylinder, parametric surface,
  Catmull-Rom curve dan tube, torus, serta lathe gentong.
- `primitives.js`: helper ellipsoid, cylinder, curve, dan elliptic paraboloid.
- `pooh.js`, `piglet.js`, `tigger.js`: geometri serta hierarchy masing-masing karakter.
- `character-transforms.js`: lima transformasi untuk karakter pada halaman aktif.
- `camera.js`: kamera orbit berbasis event pointer, matriks view dan projection.
- `environment.js`: tanah, pohon, batu, bunga, dan awan.
- `main.js`: pemilihan satu model, loop requestAnimationFrame, resize dan rendering.

Environment dan transisi halus sudah diimplementasikan; nilai estetika tetap
berdasarkan penilaian dosen.
