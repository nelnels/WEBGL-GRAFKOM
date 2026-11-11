# Animasi: Pooh Terjepit di Pintu

Film 68 detik tanpa percakapan. Semua pose ada di `src/animation/story.js`.
Environment khusus cerita ada di `src/scene/doorway-set.js`.
Pada detik 24–27.8, Tigger menyeimbangkan badan pada sumbu diagonal saat datang.
Detik 60–63 menampilkan squash persiapan dan berbalik ke penonton, kemudian
lambaian bertingkat bahu, siku dan telapak sampai penutup. Kamera kedatangan
melebar agar gerak dan ekor tetap terbaca dalam cerita.
Tetap WebGL murni; bentuk dan struktur modul karakter dipertahankan.

## Penjelasan untuk presentasi

1. **Waktu dan interpolasi.** Setiap aksi mempunyai waktu mulai dan selesai.
   Waktu dinormalisasi menjadi `u` dari 0 sampai 1, lalu diperhalus dengan
   `u*u*(3-2*u)`. Posisi dan sudut berpindah menggunakan `a+(b-a)*u`.
2. **Dua tarikan.** Tarikan pertama meningkat, ditahan, lalu mengendur.
   Tarikan kedua meningkat lebih jauh sampai Pooh lepas. Badan condong,
   tangan terangkat dan kaki berlawanan arah untuk menunjukkan usaha.
3. **Pegangan.** Matriks dunia mengubah titik lokal tangan menjadi posisi dunia.
   Rata-rata tangan Piglet mengikuti rata-rata tangan Pooh pada X/Z.
   Tangan Tigger mengikuti titik belakang badan Piglet. Sudut tangan diatur
   terlebih dahulu agar tinggi pegangan sesuai; tidak memakai inverse kinematics.
4. **Jatuh bergantian.** Pooh mulai lebih dulu; Piglet berselang 0.45 detik,
   Tigger 0.9 detik. Root diputar memakai axis-angle. Tigger berguling ke
   samping karena bentuk badannya memanjang. Bangun juga diberi selisih waktu.
5. **Grounding.** Posisi Y root disesuaikan dengan titik mesh terendah setelah
   transformasi. Ini mencegah kaki/badan menembus tanah, tanpa simulasi fisika.
6. **Scaling.** Piglet merendah mengikuti tenaga tarikan pada 30.5–38.5 dan 40.5–48.5
   detik: Y berkurang hingga 18%, X/Z bertambah hingga 6.3%, lalu kembali normal.
   Tinggi bahu dikompensasi agar tangan tetap berpegangan dan kaki tetap di lantai.
   Tigger sedikit merendah saat bersiap. Pooh menyempit sebentar
   ketika lepas dari pintu. Transformasi induk membawa semua bagian tubuh.
7. **Kamera.** Target, yaw dan ukuran framing diinterpolasi dari pembuka di dalam
   rumah menuju sisi luar. Kamera melebar sebelum jatuh, lalu mendekat sedikit
   untuk penutup. Kontrol drag/zoom tetap tersedia.

Rumah disusun dari balok dan panel kaca. Bagian tengah pintu kosong, belakang
rumah tertutup dinding, sedangkan kaca sisi kamera memperlihatkan interior.
`buildHouse()` menyusun rumah, jendela, atap dan cerobong; `buildGround()`,
`buildTrees()`, `buildSky()`, `buildGarden()` menyusun bagian environment lainnya.
Batang/pot memakai cylinder, daun memakai ellipsoid, bibir pot memakai torus.

`STORY_PHASES` menamai bab; `STORY_TIMING` memusatkan waktu tarikan, pelepasan,
jatuh dan bangun. Komentar bagian 1–7 memandu pembacaan dari perakitan sampai kamera.
Panduan demonstrasi lengkap: [PRESENTASI.md](PRESENTASI.md).

`update(seconds)` mengembalikan semua bagian ke pose awal sebelum menerapkan
transformasi berdasarkan waktu absolut. Karena itu seek dan replay tidak bergantung
pada frame sebelumnya. Tidak memakai physics engine atau motion capture.
