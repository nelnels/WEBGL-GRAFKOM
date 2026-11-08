# Animasi: Pooh Terjepit di Pintu

Film 68 detik tanpa percakapan. Semua pose ada di `src/animation/story.js`.
Environment khusus cerita ada di `src/scene/doorway-set.js`.
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
6. **Scaling.** Tigger sedikit merendah saat bersiap. Pooh menyempit sebentar
   ketika lepas dari pintu. Transformasi induk membawa semua bagian tubuh.
7. **Kamera.** Target, yaw dan ukuran framing diinterpolasi dari pembuka di dalam
   rumah menuju sisi luar. Kamera melebar sebelum jatuh, lalu mendekat sedikit
   untuk penutup. Kontrol drag/zoom tetap tersedia.

Rumah disusun dari balok: dua dinding samping pintu dan satu lintel di atasnya.
Bagian tengah pintu kosong. Belakang rumah terbuka dan dinding dekat kamera
rendah agar pembuka di dalam rumah terlihat. Batang/pot memakai cylinder,
daun memakai ellipsoid, bibir pot memakai torus.

`update(seconds)` mengembalikan semua bagian ke pose awal sebelum menerapkan
transformasi berdasarkan waktu absolut. Karena itu seek dan replay tidak bergantung
pada frame sebelumnya. Tidak memakai physics engine atau motion capture.
