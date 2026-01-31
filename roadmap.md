# Roadmap Pengembangan Notflix

Dokumen ini merangkum apa saja yang telah diselesaikan dan rencana pengembangan selanjutnya untuk proyek Notflix.

## ✅ Selesai Dikerjakan (Completed)

### 1. Refactoring & Pembersihan Kode (Backend/Logic)
- [x] **Penghapusan Anime API:** Menghapus seluruh kode, interface, dan komponen yang berkaitan dengan sumber data Anime lama.
- [x] **Pembaruan `lib/api.ts`:**
  - Penambahan endpoint `getTrending` (dengan pagination).
  - Penambahan endpoint `getRank` (Movies & TV).
  - Penambahan endpoint `getRecommendations`.
  - Penyesuaian struktur data `Banner` untuk slider.

### 2. Navigasi & UI Komponen
- [x] **Navbar:**
  - Update link menu: Home, Trending, Rank.
  - **Mobile Menu:** Implementasi menu *sidebar* responsif (Hamburger menu) untuk tampilan mobile.
- [x] **Home Slider (`HeroSlider`):**
  - Mengubah banner statis menjadi slider otomatis (carousel).
  - **Auto-Enrichment:** Otomatis melengkapi deskripsi banner jika kosong menggunakan API detail.
  - Menambahkan navigasi panah dan indikator dots.

### 3. Halaman & Fitur Baru
- [x] **Integrasi Dracin (Dramabox):**
  - Fetching data Dracin API (Home, Search, Detail).
  - Menampilkan Dracin di Homepage dan Search.
  - Fix: Handling ID Dracin vs Movie yang akurat.
- [x] **Pencarian Tersegmentasi (Segmented Search):**
  - Tab pemisah untuk pencarian **Film** dan **Dracin**.
  - Pagination independent untuk setiap kategori.
  - "Load More" button yang responsif.
- [x] **Halaman Trending (`/trending`):**
  - Menampilkan Grid layout film trending.
  - Fitur Pagination (Previous / Next).
- [x] **Halaman Rank (`/rank`):**
  - Menampilkan baris "Top Rated Movies" dan "Top Rated TV Shows".

### 4. Autentikasi & Profil Pengguna
- [x] **Login & Register:**
  - Implementasi Supabase Auth.
  - **Keamanan:** Integrasi **hCaptcha** untuk mencegah bot.
- [x] **Halaman Profil (`/profile`):**
  - Menampilkan informasi user.
  - Menu navigasi ke History & Bookmarks.
  - **Bug Fix:** Mengoptimalkan koneksi Supabase untuk mencegah *Rate Limit*.
- [x] **Riwayat Tontonan (History):**
  - Halaman `/history` untuk melihat daftar tontonan.

### 5. Admin Dashboard
- [x] **Dashboard Utama:**
  - Integrasi Layout Admin (Sidebar, Header).
  - Menampilkan Data Real: Total Users, Top Rated Movie.
- [x] **Manajemen Film & Users:**
  - RBAC (Role Based Access Control).
  - Listing & Detail Film.

---

## 🚀 Rencana Selanjutnya (Upcoming/Planned)

Berikut adalah fitur-fitur yang bisa dikembangkan untuk tahap selanjutnya:

### Fitur Pengguna (User Experience)
- [ ] **Halaman Subscription:** Tampilan detail paket berlangganan.
- [ ] **Continue Watching (Player):** Resume video dari durasi terakhir ditonton.
- [ ] **Komentar & Rating:** Fitur user memberikan rating/komentar pada film.
- [ ] **Notifikasi:** Memberitahu user jika ada episode baru dari series favorit.

### Peningkatan UI/UX
- [ ] **Skeleton Loading:** Menambahkan animasi loading (skeleton) di semua halaman agar transisi lebih halus.
- [ ] **Dark/Light Mode Toggle:** (Opsional) jika ingin mendukung tema terang.

### Teknis & Performance
- [ ] **SEO Optimization:** Dynamic Metadata (Title, Description, OpenGraph) untuk setiap halaman detail.
- [ ] **Error Boundary UI:** Tampilan "Opps, Something went wrong" yang ramah user jika API down.
- [ ] **Image Optimization:** Konversi ke format WebP otomatis.

---


*Terakhir diperbarui: 31 Januari 2026*
