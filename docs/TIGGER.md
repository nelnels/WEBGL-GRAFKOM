# Tigger: struktur kode untuk presentasi

Model dirakit lewat ES modules yang langsung berjalan pada server statis.
Penataan file mempertahankan geometri, warna, urutan mesh, hierarki, view, dan animasi.

## Peta kode

| File | Bagian / fungsi | Jenis primitive |
| --- | --- | --- |
| `src/characters/tigger/index.js` | `createTigger(primitives)`: merakit modul, root/body, parts, view, dan `update(t)` | Perakitan dan transformasi |
| `src/characters/tigger/materials.js` | `buildMaterials(parent, helpers, materials)`: menyiapkan seluruh warna | Material; tidak membuat geometri |
| `src/characters/tigger/torso.js` | `buildTorso(parent, helpers, materials)`: badan, perut, belang badan, leher, dada | Surface loft bebas; ellipsoid untuk leher/dada |
| `src/characters/tigger/head.js` | `buildHead(parent, helpers, materials)`: kepala, wajah, mata, hidung, mulut, alis, kumis, belang kepala | Ellipsoid, curve, surface bebas |
| `src/characters/tigger/ears.js` | `buildEars(parent, helpers, materials)`: telinga luar/dalam, sisi depan/belakang | Elliptic paraboloid |
| `src/characters/tigger/limbs.js` | `buildLimbs(parent, helpers, materials)`: bahu, siku, lengan, pinggul, lutut, kaki dan belang cincin | Cylinder, ellipsoid, surface bebas |
| `src/characters/tigger/tail.js` | `buildTail(parent, helpers, materials)`: ekor dan ujungnya | Enam ruas Bézier kubik → tube; ellipsoid |
| `src/geometry/quadrics.js` | `ELLIPSOID`, `ELLIPTIC_PARABOLOID`, `CYLINDER`, `CURVE`: pembungkus primitive dan penamaan mesh | Empat helper bernama sesuai jenis |
| `src/geometry/primitives.js` | `egg`, `paraboloid`, `armSegment`, `line`: implementasi helper yang dibungkus | Primitive dasar yang tetap digunakan |
| `src/character-presentation.js` | `setupCharacterPresentation`, `collectParts`, `describeParts`: panel sorot dan daftar bagian | Pembacaan metadata mesh; penggantian material saja |

## Urutan perakitan

1. `main.js` memuat `characters/tigger/index.js` untuk halaman Tigger.
2. `createTigger()` menyiapkan material dan helper, kemudian membuat root dan body.
3. `buildTorso()` menambahkan badan, perut, belang, leher, dan dada.
4. `buildHead()` membangun wajah. `buildEars()` dipanggil di dalam urutan wajah
   per sisi, sehingga urutan child yang lama tetap sama.
5. `buildLimbs()` membangun kedua lengan dahulu, lalu kedua kaki.
6. `buildTail()` menambahkan ekor terakhir.
7. `update(t)` menghitung pose dasar langsung dari waktu. Cerita memakai
   `parts.head`, `parts.arms`, `parts.legs`, dan nama pivot yang tetap sama.

`index.js` juga menampung helper surface dan pita belang yang dipakai bersama.
Rumus dan angka aslinya dipindahkan tanpa mengganti tessellation atau perhitungan.
`quadrics.js` mempertahankan API Tigger dan meneruskan empat helper primitive ke
`createCharacterHelpers()` yang dipakai bersama Pooh/Piglet. Geometri dasarnya
tetap dibuat di `primitives.js`; nama mesh dan hierarki tidak berubah.

## Panel sorot

Buka `tigger.html`, tekan **Space** untuk menjeda dan **G** untuk membuka panel.
Pilih Ellipsoid, Paraboloid, Cylinder, Curve 3D, atau **Surface bebas**.
Badan/perut dan belang termasuk surface bebas, bukan quadric.
Paraboloid terdapat pada telinga; telapak kaki adalah ellipsoid.

Daftar bagian dan jumlahnya dihitung dari `geometry.type` serta nama mesh nyata.
Nama file sumber berasal dari `import.meta.url` modul pembangun dan disimpan sebagai
`sourceFile`. Jadi daftar panel mengikuti kode, termasuk pengecualian nama
`Tigger-front-paw-near/far` yang dipertahankan untuk interaksi properti cerita.
Menutup panel dengan **G** mengembalikan material asli.

## Berkas verifikasi

- `tests/check.mjs`: geometri, persamaan quadric, primitive, transformasi, dan navigasi.
- `tests/story-check.mjs`: cerita pintu 68 detik, kontak pegangan, dua tarikan, jatuh/bangun berselang, grounding, dan seek/replay.
- `tests/environment-check.mjs`: geometri dan transformasi lingkungan.

Jalankan: `node tests/check.mjs && node tests/story-check.mjs && node tests/environment-check.mjs`.

Urutan demo dan peta rubrik seluruh proyek: [PRESENTASI.md](PRESENTASI.md).
