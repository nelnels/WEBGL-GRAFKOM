# Panduan presentasi

## Urutan membuka proyek

1. Jalankan `python3 -m http.server 8000` dari folder proyek.
2. Buka `index.html`: putar cerita 68 detik untuk menunjukkan ketiga karakter dalam satu set rumah.
3. Buka `pooh.html`, `piglet.html`, dan `tigger.html` untuk membahas model di latar kosong.
4. Tekan Space untuk jeda, G untuk panel primitive. Pilih kategori dan tunjukkan bagian berwarna, rumus, jumlah mesh, serta file pembangunnya.
5. Tutup panel, lanjutkan animasi, kemudian demonstrasikan T/R/S/A/H. Tekan 0 di antara demonstrasi agar geraknya mudah dibedakan.
6. Buka fungsi kode berikut sesuai pertanyaan. Bukti demo dan pembahasan kode disampaikan saat presentasi; video promo tetap berupa cerita.

## Peta rubrik ke kode

| Item rubrik | Bukti visual | File dan fungsi yang dibuka |
| --- | --- | --- |
| 3D Curve pada karakter | Ekor Tigger, kumis, alis; lengan Pooh | `src/characters/tigger/tail.js`: `buildTail()`; `src/geometry/primitives.js`: `line()` |
| Object 1 | Pooh | `src/characters/pooh/index.js`: `createPooh()` |
| Object 2 | Piglet | `src/characters/piglet/index.js`: `createPiglet()` |
| Object 3 dan quadric tambahan | Tigger, khususnya telinga paraboloid | `src/characters/tigger/index.js`: `createTigger()`; `ears.js`: `buildEars()` |
| Estetika dan satu environment | Rumah, kaca, halaman, langit, pohon dan tiga karakter | `src/scene/doorway-set.js`: `createDoorwaySet()`, `buildHouse()`, `buildSky()`, `buildTrees()`, `buildGarden()` |
| Translate | Berjalan ke pintu, penolong mendekat; tombol T | `src/animation/story.js`: `pose()` dalam `createStory()`; `character-transforms.js`: `createCharacterTransforms()` |
| Rotate | Kepala, lengan dan badan bergerak; tombol R | `story.js`: `pose()`; `character-transforms.js`: mode `rotate` |
| Scaling | Pooh menyempit saat lepas, Tigger merendah; tombol S | `story.js`: `squeeze`, `crouch`; `character-transforms.js`: mode `scale` |
| Rotate Arbitrary Axis | Tigger miring saat tarikan, karakter jatuh; tombol A | `story.js`: `axis`, `axisAngle`; `src/core/webgl.js`: `rotationAxis()` |
| Hierarchical Transformation | Tangan mengikuti lengan/badan; tombol H | `src/core/webgl.js`: `Node.localMatrix()`, `Node.updateWorld()`; modul `limbs.js` karakter |

`pose()` adalah fungsi internal, dibaca di dalam `createStory()`, bukan ekspor terpisah. Semua path pendek pada tabel animasi berada di `src/animation/`.

## Empat hal yang perlu dijelaskan dengan tepat

- **Ellipsoid:** `x²/a² + y²/b² + z²/c² = 1`. Bola satuan diskalakan sepanjang tiga sumbu. Sphere dan ellipsoid dianggap satu jenis pada rubrik.
- **Elliptic paraboloid:** `z = d(1 − x²/a² − y²/b²)`. Telinga Tigger adalah bukti quadric selain ellipsoid dan cylinder. Badan/perut Tigger berupa surface loft bebas; jangan menyebutnya ellipsoid atau bukti quadric tambahan.
- **Curve 3D:** titik kontrol Catmull–Rom membentuk lintasan; `tubeGeometry()` memberikan penampang sehingga menjadi mesh 3D. Tunjukkan curve pada karakter, bukan hanya tanaman atau properti.
- **Hierarki:** `M_dunia_anak = M_dunia_induk × M_lokal_anak`. Gerakan badan membawa kepala dan anggota tubuh; pivot siku Tigger membawa bagian lengan di bawahnya.

Helper Tigger (`quadrics.js`) meneruskan pemanggilan ke `createCharacterHelpers()`, yang juga dipakai Pooh/Piglet. Seluruh helper akhirnya memakai `primitives.js`. Pembungkus mempertahankan API Tigger sambil menyatukan aturan penamaan dan perhitungan primitive; metadata sumber ditambahkan saat perakitan karakter.

## Cara membaca timeline cerita

`STORY_PHASES` adalah daftar bab beserta labelnya. `STORY_TIMING` memberi nama waktu tarikan, pelepasan, jatuh, dan bangun. Di dalam `story.js`, ikuti bagian bernomor:

1. Perakitan set dan tiga karakter.
2. Reset pose sebelum menghitung waktu yang diminta.
3. Gerakan Pooh, Piglet, kemudian Tigger.
4. Grounding: posisi Y disesuaikan dengan vertex dunia terendah.
5. Kontak tangan: posisi penolong disesuaikan terhadap titik pegangan dunia.
6. Pot madu mengikuti tangan atau bangku.
7. Kamera berpindah halus mengikuti perkembangan cerita.

`blend()` memakai smoothstep `u²(3−2u)`. Pose cerita bergantung pada waktu absolut sehingga menggeser slider mundur dan replay menghasilkan pose yang sama. Demo tombol memakai pelunakan antar-frame untuk perpindahan mode; jangan menyamakan mekanismenya dengan timeline cerita.

## Alur penjelasan environment dan renderer

`createDoorwaySet()` memanggil pembangun sesuai urutan mesh semula: tanah → rumah → pot madu → pohon → langit → taman. Semua builder menambahkan mesh ke root yang sama. `buildHouse()` mencakup dinding, pintu yang benar-benar kosong, jendela, panel kaca penuh, atap pelana, cerobong dan bangku.

`Renderer` pada `src/core/webgl.js` menggambar shadow map lalu objek padat dan kaca transparan. `src/story-player.js` mengaktifkan cahaya matahari; halaman demo karakter tetap berlatar kosong. `src/main.js` memilih halaman dan factory karakter.

## Persiapan video dan pengumpulan

Bukti langsung dalam cerita (tanpa panel/kode):

| Waktu | Yang terlihat |
| --- | --- |
| 0–14 | Pooh, bentuk kepala/badan, lengan curve, translate ke pintu dan rotasi saat berbalik |
| 14–30 | Piglet dan Tigger mendekat dalam satu environment; kemiringan sumbu diagonal Tigger paling jelas sekitar 25–26 detik |
| 30–48 | Gerakan menarik bersama: badan membawa lengan/tangan, persiapan squash dan dua usaha berbeda |
| 48–60 | Jatuh dan bangun berselang, rotasi badan dan kesinambungan gerak |
| 60–63 | Squash Tigger lebih jelas (hingga 22%), kembali ke proporsi normal, lalu berbalik ke penonton |
| 61–68 | Lambaian bertingkat bahu → siku → telapak; wajah, telinga paraboloid, ruas cylinder serta ekor curve Tigger terlihat dari sudut yang baru |

Gerakan tetap menjadi bagian cerita; tidak ada tur geometri atau badge teknis di video.
Pemeriksaan tambahan: `node tests/video-rubric-check.mjs` mengunci amplitudo gerakan,
sumbu diagonal, hierarki telapak, pemulihan skala dan seek deterministik.

- Rekam cerita pada `index.html`; U menyembunyikan kontrol. Video promo/trailer menampilkan storyline, bukan penjelasan pekerjaan.
- Periksa semua fitur rubrik terlihat jelas dalam rekaman, termasuk curve, perubahan skala dan rotasi sumbu bebas. Jika perlu bukti tambahan, gunakan sudut kamera atau cuplikan model tanpa narasi teknis.
- Tiga karakter harus terlihat berada dalam environment yang sama di video.
- Siapkan minimum dua gambar per karakter dari perspektif berbeda yang memperlihatkan bentuknya dengan jelas.
- Lengkapi kelas, tautan dan dokumen pengumpulan. Isi timestamp video setelah dokumen selesai sesuai catatan tugas.

## Pemeriksaan

Jalankan `node tests/check.mjs && node tests/story-check.mjs && node tests/environment-check.mjs`.
Tes tambahan `node tests/character-refactor-check.mjs` membandingkan hash lama Pooh/Piglet; hash float dapat berbeda antar-versi Node. Jangan memperbarui fixture hanya untuk menutupi kegagalan; periksa model dan lingkungan eksekusinya terlebih dahulu.
