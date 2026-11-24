# Ide Konten Berbasis Data D1 (`available_domains`): Linkable Assets & Layak AdSense

Dokumen ini merangkum ide konten yang dapat dibangun dari tabel Cloudflare D1 `available_domains` untuk dua tujuan utama:
1. **Memancing backlink organik (*Linkable Assets*)** dari blogger, jurnalis teknologi, praktisi SEO, konsultan branding, dan komunitas startup/UMKM.
2. **Memenuhi standar kelayakan Google AdSense** (*high-value original content*, informatif, terstruktur, dan bebas dari pola *thin content* / *Scaled Content Abuse*).

---

## Ringkasan Kolom Sumber Data (`available_domains`)

| Kelompok Kolom | Kolom yang Dimanfaatkan | Potensi Olahan Konten |
| --- | --- | --- |
| **Identitas & Struktur** | `domain`, `sld`, `extension`, `char_length`, `lang` | Distribusi panjang domain, rasio TLD global vs ccTLD lokal, perbandingan antar 8 bahasa |
| **Kualitas & Fonetik** | `pronunciation_comfort_score`, `brandability_score`, `structure_length_score`, `character_cleanliness_score`, `overall_heuristic_score` | Statistik kelolosan *radio test*, persentil kualitas brand, benchmark nama pendek vs panjang |
| **SEO & Intent** | `niche_clarity_score`, `emd_pmd_score`, `emd_pmd_match_type` (`nk`, `np`, `up`, `be`, `nc`, `nn`, `os`, `of`, `ol`), `extension_lang_fit_score` | Studi kasus risiko *over-optimization* EMD/PMD, analisis pola nama aman SEO |
| **Kategorisasi & Waktu** | `tags` (JSON array maks 6 tag), `checked_at`, `check_method`, `check_source` | Kurasi domain terbaik per niche (`ai-tech`, `ecommerce`, `tools`, dll.), pembaruan berkala dengan stempel waktu |

---

## 1. Konten Riset Data & Statistik (*Original Data Studies* — Magnet Backlink Terkuat)

Blogger, media, dan praktisi SEO cenderung menautkan ke **data empiris orisinal** yang tidak tersedia di tempat lain. Format artikel riset mendalam juga dinilai bernilai tinggi oleh peninjau AdSense.

### A. Laporan Statistik Panjang & Ketersediaan Domain per Ekstensi
- **Contoh Judul**: *"Studi Data Ribuan Domain Tersedia: Seberapa Sulit Menemukan `.com` vs `.id` di Bawah 10 Karakter yang Mudah Diucapkan?"*
- **Data D1**: `extension`, `char_length`, `pronunciation_comfort_score`, `overall_heuristic_score`, `checked_at`.
- **Isi Utama**:
  - Persentase domain tersedia berdasar rentang panjang SLD (`<= 6`, `7–9`, `10–12`, `13+` karakter).
  - Perbandingan rata-rata `pronunciation_comfort_score` dan `brandability_score` per ekstensi (`.com`, `.id`, `.my.id`, `.web.id`, `.ai`, `.io`).
  - Penjelasan metodologi skoring (7 sub-skor) dan kesimpulan praktis pemilihan panjang domain.

### B. Studi SEO: Fenomena *Over-Optimization* EMD/PMD vs Nama Brandable
- **Contoh Judul**: *"Mengapa Banyak Domain Keyword-Match Masih Tersedia Tapi Berisiko SEO? Analisis Data `emd_pmd_match_type`"*
- **Data D1**: `emd_pmd_score`, `emd_pmd_match_type` (`os`, `of`, `ol`, `np`, `be`), `pronunciation_comfort_score`, `character_cleanliness_score`.
- **Isi Utama**:
  - Proporsi domain tersedia yang masuk kategori `os` (*keyword stuffing*), `of` (*forced hyphen/number*), dan `ol` (*terlalu panjang mengejar keyword*) dibanding `np` (*natural PMD*) dan `be` (*balanced EMD*).
  - Contoh pola penamaan berisiko vs pola PMD alami yang lolos *radio test* (`pronunciation_comfort_score >= 72`).

### C. Riset Ekosistem Penamaan Lintas 8 Bahasa & ccTLD
- **Contoh Judul**: *"Peta Tren Kata Majemuk & Pemilihan Ekstensi Lokal vs Global di 8 Pasar Bahasa (EN, ID, ES, PT, FR, DE, RU, JA)"*
- **Data D1**: `lang`, `extension`, `extension_lang_fit_score`, `tags` (`<lang>-tld`, `multilingual`, `compound`).
- **Isi Utama**:
  - Perbandingan topik dan pola `compound` paling dominan di tiap bahasa.
  - Analisis kesesuaian TLD lokal (`.id`, `.es`, `.pt`, `.com.br`, `.fr`, `.de`, `.ru`, `.jp`) vs `.com`.

---

## 2. Halaman Kurasi Terpilih + Ulasan Editorial (*Curated Niche Lists*)

Daftar ide domain yang telah disaring ketat berdasarkan skor dan kebersihan karakter sangat sering di-*bookmark* dan dibagikan di komunitas startup, UMKM, indie hacker, maupun artikel referensi bisnis.

### A. Etalase Domain Berkualitas Tinggi per Niche Utama
- **Contoh Judul**:
  - *"50+ Ide Nama Domain AI & SaaS Tersedia dengan Skor Brandability > 85 (Update Berkala)"*
  - *"Rekomendasi Nama Domain Toko Online `.id` / `.my.id` yang Singkat & Lolos Radio Test"*
  - *"Ide Nama Domain Niche Tools & Kalkulator dengan Struktur Bersih Tanpa Angka/Strip"*
- **Kriteria Filter D1**:
  - `tags` mengandung topik target (mis. `ai-tech`, `ecommerce`, `tools`, `calculator`, `parenting-baby`, `cloud-tech`).
  - `overall_heuristic_score >= 80`
  - `pronunciation_comfort_score >= 75`
  - `character_cleanliness_score = 100`
  - Diurutkan berdasar `overall_heuristic_score DESC, checked_at DESC`.

### B. Syarat Wajib Agar Halaman Kurasi Tetap Layak AdSense
- **Jangan** membuat ratusan halaman tipis otomatis untuk setiap kombinasi tag kecil yang hanya berisi beberapa baris tabel.
- Buat halaman kurasi hanya untuk **kategori besar yang memiliki stok data memadai** (mis. minimal 25–50 domain berkualitas per halaman).
- Sertakan **panduan editorial khusus niche** (minimal ~800+ kata: analisis pola kata yang kuat di niche tersebut, tips pelafalan, pengingat cek merek dagang, serta penjelasan arti tiap kolom skor).
- Tampilkan waktu cek terakhir (`checked_at`) secara transparan dan sediakan tombol *Live Re-check* menuju pengecekan DoH/RDAP.

---

## 3. Halaman Alat Interaktif + *Benchmark* Database (*Interactive Linkbait Tools*)

Halaman alat (*web utility*) yang diperkaya data agregat nyata dari database memiliki rasio perolehan backlink paling konsisten di web.

### A. Domain Quality Explorer & Leaderboard per Niche
- **Data D1**: Seluruh 7 sub-skor, `overall_heuristic_score`, `tags`, `lang`, `extension`, `char_length`.
- **Konsep**: Pengunjung dapat memfilter kumpulan domain tersedia berdasarkan **Niche (`tags`)**, **Bahasa (`lang`)**, **Ekstensi**, dan **Skor Minimal**, lengkap dengan ringkasan statistik kategori tersebut.

### B. Radio-Test & Brandability Benchmark Calculator
- **Konsep**: Alat mandiri untuk menilai satu nama domain/brand menggunakan formula skoring yang sudah ada (`computeDomainScores`), lalu menampilkan **posisi persentilnya** terhadap data agregat di D1 (mis. *"Skor pelafalan 88/100 menempatkan nama ini di Top 10% dari domain `.id` yang terindeks"*), disertai dokumentasi rumus dan FAQ.

---

## 4. Contoh Query Agregasi D1 untuk Bahan Konten

Query berikut dapat dijalankan lewat Wrangler CLI (`npx wrangler d1 execute domainname_available_domains --remote --command="..."`) saat menyusun data artikel:

```sql
-- 1. Statistik rata-rata panjang & skor per ekstensi (minimal 20 sampel)
SELECT
  extension,
  COUNT(*) AS total_domains,
  ROUND(AVG(char_length), 1) AS avg_length,
  ROUND(AVG(pronunciation_comfort_score), 1) AS avg_pronunciation,
  ROUND(AVG(brandability_score), 1) AS avg_brandability,
  ROUND(AVG(overall_heuristic_score), 1) AS avg_overall
FROM available_domains
WHERE overall_heuristic_score IS NOT NULL
GROUP BY extension
HAVING total_domains >= 20
ORDER BY total_domains DESC;

-- 2. Distribusi kategori EMD/PMD (untuk artikel studi risiko SEO)
SELECT
  emd_pmd_match_type,
  COUNT(*) AS total,
  ROUND(AVG(overall_heuristic_score), 1) AS avg_overall
FROM available_domains
WHERE emd_pmd_match_type IS NOT NULL
GROUP BY emd_pmd_match_type
ORDER BY total DESC;

-- 3. Kurasi Top 50 domain niche tertentu yang bersih & mudah diucapkan
SELECT
  domain,
  extension,
  lang,
  pronunciation_comfort_score,
  brandability_score,
  overall_heuristic_score,
  tags,
  checked_at
FROM available_domains
WHERE tags LIKE '%"ecommerce"%'
  AND overall_heuristic_score >= 80
  AND pronunciation_comfort_score >= 75
  AND character_cleanliness_score = 100
ORDER BY overall_heuristic_score DESC, checked_at DESC
LIMIT 50;
```

---

## 5. Checklist Kepatuhan AdSense & Anti-Spam

1. **Hindari halaman 1 domain = 1 URL** (mis. `/domain/contohbisnis.com`): Halaman seperti itu tergolong *thin content* / *doorway page* dan berisiko tinggi ditolak AdSense (*Low Value Content*) serta terkena filter *Scaled Content Abuse*.
2. **Jangan tampilkan tabel mentah tanpa narasi**: Setiap halaman riset maupun kurasi wajib memiliki analisis tertulis yang jelas, metodologi, dan nilai edukatif bagi pembaca.
3. **Jaga transparansi data**: Selalu cantumkan bahwa status ketersediaan berdasar pengecekan NS/RDAP pada waktu `checked_at` dan dapat berubah sewaktu-waktu.
4. **Pastikan tautan trust lengkap**: Setiap halaman konten baru wajib menautkan halaman `about.html`, `privacy-policy.html`, `terms.html`, `disclaimer.html`, dan `contact.html`, serta tidak melanggar batas slot iklan.

---

## 6. Pillar Articles Murni untuk Penguatan E-E-A-T di SERP

Selain konten kurasi dan alat interaktif di atas, data `available_domains` juga dapat diolah menjadi **7 Pillar Articles** (*evergreen reference hubs*) yang dirancang khusus untuk membangun **E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)** di Google SERP, sekaligus tetap menarik backlink dan layak disetujui AdSense:

### 1. Pillar Metodologi & Transparansi: *"Metodologi Terbuka Penilaian Kualitas Domain (Radio Test, Struktur, & Risiko SEO)"*
- **Data D1**: Seluruh 7 sub-skor, `overall_heuristic_score`, serta distribusi nyata persentase domain yang lolos/gugur di database.
- **Isi Utama**: Menjelaskan alasan ilmiah di balik pembobotan (`pronunciation 0.22`, `brandability 0.20`, `structure 0.13`, `ext_fit 0.12`, `cleanliness 0.10`, `niche 0.11`, `emd_pmd 0.12`) serta penalti sinergis (`pronunciation < 72 && niche < 60`), dibuktikan dengan angka distribusi empiris dari ribuan baris D1.
- **Peran E-E-A-T & Linkbait**: Membuktikan **Expertise & Trustworthiness** dan menjadi halaman rujukan (*methodology citation*) bagi artikel lain.

### 2. Pillar Linguistik & Fonetik: *"Anatomi Nama Brand yang Lolos 'Radio Test' Berdasarkan Data Empiris Domain"*
- **Data D1**: `sld`, `pronunciation_comfort_score`, `brandability_score`, `char_length`, `lang`.
- **Isi Utama**: Membedah pola fonetik nyata dari kelompok `sld` berskor pelafalan tinggi (`>= 85`) vs rendah (`< 50`) — rasio vokal ideal (`30%–56%`), benturan konsonan berat (`bk`, `tp`, `qj`, `xz`), akhiran terputus, dan perbedaan toleransi fonetik lintas bahasa (mis. akhiran `-k` / `ng` / `ny` pada `.id` vs `.com`).
- **Peran E-E-A-T & Linkbait**: Membuktikan **Experience** riset linguistik terapan dari data primer sendiri; sering dikutip oleh blog branding, copywriter, dan konsultan startup.

### 3. Pillar Infrastruktur Teknis: *"Cara Kerja Pengecekan Ketersediaan Domain: Perbandingan Akurasi Sinyal DNS (`NS`) vs `RDAP`"*
- **Data D1**: `check_method` (`NS` vs `RDAP`), `check_source` (`auto` vs `manual`), `extension`, `checked_at`.
- **Isi Utama**: Panduan teknis mendalam mengenai perbedaan delegasi DNS (`NS`) dan registrasi resmi (`RDAP`), mengapa domain tanpa NS tetap bisa berstatus terdaftar, keterbatasan TLD tertentu, serta statistik nyata proporsi pengecekan yang lolos melalui `NS` vs `RDAP`.
- **Peran E-E-A-T & Linkbait**: Mengokohkan **Authoritativeness** teknis di bidang DNS & standar RFC 1035; sering ditautkan oleh developer, sysadmin, dan media teknologi.

### 4. Pillar Audit & Anti-Pola Buruk: *"Domain Red Flags & Checklist Due Diligence Sebelum Mendaftarkan Nama Bisnis"*
- **Data D1**: `emd_pmd_match_type` (`os`, `of`, `ol`, `up`, `nn`), `character_cleanliness_score < 80`, dan proporsi domain yang jatuh ke kategori `brandable` (tak terpetakan kamus).
- **Isi Utama**: Mengungkap kesalahan penamaan paling umum di database nyata (tanda hubung ganda, pengulangan huruf `3x+`, angka tempelan, *keyword stuffing*), dipadukan dengan panduan audit riwayat Wayback Machine, profil backlink, dan pengecekan merek dagang.
- **Peran E-E-A-T & AdSense**: Memperkuat **Trustworthiness** karena melindungi pengguna dari kerugian registrasi domain berisiko—selaras dengan `disclaimer.html`.

### 5. Pillar Morfologi & Penamaan Bisnis: *"Pola Pembentukan Kata Majemuk & Akhiran Brand Terbaik di Berbagai Industri"*
- **Data D1**: `tags` (`business`, `ecommerce`, `tools`, `ai-tech`, `calculator`, `parenting-baby`, `geo-local`, `personal`), `sld`, `niche_clarity_score`, `brandability_score`.
- **Isi Utama**: Membedah struktur pembentuk nama yang konsisten meraih skor tinggi per sektor (mis. pola kata kerja + objek seperti `cek`/`hitung`/`scan`, sufiks kepemilikan `-ku`/`-mu` pada bahasa Indonesia, serta kombinasi 2 kata ringkas `<= 9` karakter).
- **Peran E-E-A-T & Linkbait**: Menjadi *evergreen playbook* rujukan bagi pendiri UMKM dan startup saat melakukan *brainstorming* nama brand.

### 6. Pillar SEO Internasional: *"Strategi ccTLD vs gTLD untuk Geotargeting & Ekspansi Multi-Bahasa (Analisis 8 Pasar)"*
- **Data D1**: `lang`, `extension`, `extension_lang_fit_score`, `tags` (`<lang>-tld`, `multilingual`).
- **Isi Utama**: Membandingkan dinamika ekstensi lokal (`.id`, `.co.id`, `.my.id`, `.de`, `.jp`, `.es`, `.com.br`, `.fr`, `.ru`) dengan gTLD (`.com`, `.io`, `.ai`, `.app`), serta panduan memilih ccTLD vs gTLD sesuai target audiens SERP Google.
- **Peran E-E-A-T**: Menguatkan *topical authority* di persimpangan topik **Domain Strategy + International SEO** (selaras dengan arsitektur 8 bahasa aplikasi).

### 7. Pillar Laporan Indeks Periodik: *"Indeks Kualitas & Kelangkaan Nama Domain (Laporan Kuartalan/Tahunan)"*
- **Data D1**: `checked_at` (*time-series*), `char_length`, `extension`, `tags`, `overall_heuristic_score`.
- **Isi Utama**: Laporan indeks berkala (mis. per kuartal) yang melacak perubahan rata-rata skor kualitas, niche mana (`ai-tech`, `ecommerce`, `tools`) yang variasi pendeknya makin langka, serta pergeseran tren ekstensi dari waktu ke waktu.
- **Peran E-E-A-T & Linkbait**: Laporan berarsip dari tahun ke tahun mengumpulkan backlink secara kumulatif dan memposisikan situs sebagai **sumber data primer** di industri domain.

---

## 7. Arsitektur Hub-and-Spoke & Query Tambahan untuk Pillar Articles

### A. Pola Hub-and-Spoke untuk Mengalirkan E-E-A-T di SERP
1. **Jangan jadikan halaman pillar sebagai katalog promosi domain**: Fokus pada edukasi, metodologi, analisis pola, dan data agregat.
2. **Sertakan sinyal E-E-A-T eksplisit pada tiap halaman pillar**:
   - Jumlah sampel (`N`) dan rentang tanggal pengambilan data (`checked_at`).
   - Tanggal publikasi & pembaruan artikel (*Last updated*).
   - Tautan langsung ke **Generator Utama (`/`)** sebagai bukti *first-hand experience* dan ke **Halaman Trust** (`about.html`, `disclaimer.html`, `privacy-policy.html`, `contact.html`).
3. **Internal Linking Terstruktur**: Tiap Pillar Article bertindak sebagai **Hub Topik** yang saling terhubung dengan artikel riset/kurasi turunan (*spoke*) dan alat interaktif, sehingga otoritas dari backlink eksternal mengalir merata ke seluruh domain.

### B. Contoh Query D1 Tambahan untuk Bahan Pillar Articles
```sql
-- 1. Distribusi skor pelafalan (untuk Pillar Metodologi & Linguistik Radio Test)
SELECT
  CASE
    WHEN pronunciation_comfort_score >= 85 THEN '85-100 (Sangat Lancar)'
    WHEN pronunciation_comfort_score >= 72 THEN '72-84 (Lolos Radio Test)'
    WHEN pronunciation_comfort_score >= 55 THEN '55-71 (Sedang/Agak Kaku)'
    ELSE '0-54 (Sulit Diucapkan)'
  END AS radio_test_tier,
  COUNT(*) AS total_domains,
  ROUND(AVG(brandability_score), 1) AS avg_brandability,
  ROUND(AVG(overall_heuristic_score), 1) AS avg_overall
FROM available_domains
WHERE pronunciation_comfort_score IS NOT NULL
GROUP BY radio_test_tier
ORDER BY avg_overall DESC;

-- 2. Proporsi metode pengecekan NS vs RDAP (untuk Pillar Infrastruktur DNS/RDAP)
SELECT
  check_method,
  check_source,
  COUNT(*) AS total_checks,
  ROUND(AVG(char_length), 1) AS avg_length
FROM available_domains
GROUP BY check_method, check_source
ORDER BY total_checks DESC;

-- 3. Tren bulanan kualitas domain tersedia (untuk Pillar Indeks Periodik)
SELECT
  strftime('%Y-%m', checked_at / 1000, 'unixepoch') AS month_utc,
  COUNT(*) AS total_logged,
  ROUND(AVG(char_length), 1) AS avg_length,
  ROUND(AVG(overall_heuristic_score), 1) AS avg_overall
FROM available_domains
GROUP BY month_utc
ORDER BY month_utc DESC;
```

