# Struktur Pooh dan Piglet

Kedua karakter mengikuti pembagian modul Tigger, tetap memakai WebGL murni.
Masing-masing folder `src/characters/pooh/` dan `src/characters/piglet/` berisi:

| Modul | Tanggung jawab |
| --- | --- |
| `index.js` | Factory karakter, root/body, perakitan, parts, view, dan update animasi |
| `materials.js` | Warna dan properti material |
| `torso.js` | Badan, pakaian, garis baju dan leher Piglet |
| `head.js` | Kepala, moncong, mata, hidung, alis, dan senyum |
| `ears.js` | Telinga; ellipsoid Pooh dan elliptic paraboloid Piglet |
| `limbs.js` | Lengan, tangan, kaki, dan pivot anggota tubuh |

`geometry/character-helpers.js` menyediakan `ELLIPSOID`, `ELLIPTIC_PARABOLOID`,
`CYLINDER`, `CURVE`, `BEZIER`, serta `SOURCE` untuk nama mesh dan file pembangunnya.
Helper memakai implementasi prosedural di `geometry/primitives.js`.
Telinga Piglet mempertahankan tessellation 24 × 48 dan pusat y = 0.55.
Moncong Pooh adalah elliptic paraboloid. Baju Pooh memakai ellipsoid utuh berwarna
merah, ditumpuk dengan perut kuning tanpa pemotongan sudut atau kelim tambahan.
Garis baju Piglet adalah torus parametrik, bukan quadric.

Kurva lengan, senyum, dan alis Pooh serta kurva senyum, alis, dan lipatan telinga
Piglet menggunakan Bézier melalui `geometry/bezier.js`. Evaluasi memakai algoritma
De Casteljau, lalu `tubeGeometry()` memberi ketebalan. Titik pertama dan terakhir
menentukan ujung kurva; titik di antaranya mengatur lengkungan. Wajah Tigger memakai
Catmull–Rom, sedangkan ekornya memakai enam ruas Bézier kubik.

`character-presentation.js` dipakai bersama ketiga halaman karakter.
Tekan G, pilih primitive, lalu lihat jumlah mesh, bagian, rumus dan file sumber.
Menutup panel mengembalikan material asli. Modul karakter tidak mengakses DOM.

Refactor mempertahankan angka geometri, urutan mesh, hierarchy, material, view,
dan rumus animasi. `tests/character-refactor-check.mjs` membandingkan hash
geometri, material dan matriks dunia pada enam waktu dengan model sebelum refactor.
Jalankan bersama `tests/check.mjs`, `tests/story-check.mjs`, dan
`tests/environment-check.mjs` untuk memeriksa integrasi.
