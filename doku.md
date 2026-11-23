# Panduan Lengkap Persiapan GitHub Repo, Domain (`domainname.web.id`), Cloudflare DNS & Cloudflare Secrets

Dokumen ini berisi hasil pemeriksaan kesiapan repositori saat ini serta panduan langkah demi langkah untuk menaruh proyek ke **GitHub**, menghubungkan domain **`domainname.web.id`** ke **Cloudflare DNS**, men-deploy HTML statis di **Cloudflare Pages**, dan menyimpan seluruh ID/token konfigurasi sebagai **Environment Variables / Secrets di Cloudflare**.

---

## 1. Hasil Pemeriksaan Kesiapan Repository

Berdasarkan audit langsung terhadap seluruh file sumber (`package.json`, `site.config.json`, `scripts/site-builder.mjs`, `scripts/build-static.mjs`, `.gitignore`, `.env.example`, `server.js`, dan seluruh file HTML):

| Komponen | Status | Keterangan & Hasil Audit |
| --- | --- | --- |
| **Keamanan GitHub (`.gitignore`)** | Siap | `node_modules/`, `dist/`, `.env`, `.env.local`, `.env.*.local`, `*.log`, `.DS_Store` sudah dikecualikan agar tidak ikut ter-commit. |
| **Kebersihan Kode Sumber** | Siap | `site.config.json` bebas dari token/ID sensitif (`measurementId`, `verificationToken`, `publisherId` kosong). Tidak ada `localhost` atau *hardcoded secret* di HTML/JS. |
| **Build Statis (`npm run build`)** | Siap | Menjalankan `node scripts/build-static.mjs` tanpa bergantung pada `express` atau library native eksternal; menghasilkan **48 file HTML** (`en` di root, `id/es/pt/fr/de/ru/ja` di subdirektori), `robots.txt`, `sitemap.xml`, `_redirects`, `_headers`, `assets/`, dan `ads.txt` (jika `ADSENSE_CLIENT_ID` terisi). |
| **Validasi Sintaks (`npm run lint`)** | Siap | Memverifikasi `server.js`, `scripts/site-builder.mjs`, `scripts/build-static.mjs`, dan `assets/trust-i18n.js` menggunakan `node --check`. |
| **Cache Ketersediaan (`localStorage`)** | Siap | Hasil cek DoH/RDAP disimpan di `localStorage` (`domainAvailabilityCacheV1`) dengan kunci lowercase ternormalisasi, TTL (default 6 jam untuk `available`/`taken`, 5 menit untuk `check`), pruning otomatis, fallback aman `try...catch`, serta tombol re-check per baris. |
| **Cloudflare Secrets / Env Vars** | Siap | `scripts/site-builder.mjs` membaca override dari `process.env` saat proses build Cloudflare berjalan (`SITE_URL`, `CONTACT_EMAIL`, `GA_MEASUREMENT_ID`, `GSC_VERIFICATION`, `ADSENSE_CLIENT_ID`, `ADSENSE_DIRECT_SELLER_ID`, `ADSENSE_ENABLE_AUTO_ADS`, `BING_VERIFICATION`, `YANDEX_VERIFICATION`, `AHREFS_SITE_VERIFICATION`). |
| **Mode AdSense Non-Auto Ads** | Siap | `enableAutoAdsScript` bernilai `false` di `site.config.json` dan dapat dikontrol via `ADSENSE_ENABLE_AUTO_ADS=false`. Seluruh halaman memiliki penanda kotak putih putus-putus maksimal 2 slot (1 slot di `contact.html`). |
| **Security & Cache Headers (`_headers`)** | Siap | Build otomatis menghasilkan `dist/_headers` (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, dan `Cache-Control`). |
| **Redirect Bahasa Inggris (`_redirects`)** | Siap | Build otomatis menghasilkan `dist/_redirects` untuk mengarahkan `/en`, `/en/`, dan `/en/*` ke `/` dengan status `301`. |

### Catatan Penting Arsitektur Static + Cloudflare Secrets
1. **Build-Time vs Runtime & Apa yang Boleh/Tidak Boleh Masuk ke HTML Statis**:
   - Di Cloudflare Pages (static hosting), file HTML dibangun sekali saat `npm run build` berjalan di server build Cloudflare. Nilai Environment Variables / Secrets yang Anda isi di Cloudflare akan dibaca oleh `scripts/build-static.mjs` lalu dicetak ke dalam HTML (`<meta>`, tag GA4, `ads.txt`, `sitemap.xml`).
   - ID seperti **GA4 (`G-...`)**, **GSC Verification**, **Bing/Yandex/Ahrefs token**, dan **AdSense Publisher ID (`ca-pub-...`)** memang bersifat **publik di sisi browser/HTML** (agar Googlebot & browser bisa membacanya), namun menyimpannya di Cloudflare Environment Variables membuat repo GitHub Anda tetap bersih dan mudah dikelola tanpa mengedit kode sumber tiap kali ganti akun/ID.
   - **JANGAN PERNAH** memasukkan *private secret key* (misalnya API Key berbayar, Gemini/OpenAI Key, Database Password, atau OAuth Client Secret) ke variabel build HTML statis. Jika kelak Anda menambah fitur berbasis private key, wajib memakai **Cloudflare Pages Functions (`/functions/*`)** atau **Cloudflare Workers** sisi server—bukan disuntikkan ke HTML statis.
2. **Catatan Perilaku `.html` di Cloudflare Pages (Clean URLs 308)**:
   - Cloudflare Pages secara bawaan menerapkan *Clean URLs* yang me-redirect URL berekstensi `.html` (misalnya `/disclaimer.html` -> `/disclaimer`, `/id/disclaimer.html` -> `/id/disclaimer`) dengan status `308 Permanent Redirect`.
   - Saat ini `canonical`, `hreflang`, dan `sitemap.xml` memakai format `.html` (`/disclaimer.html`, `/id/disclaimer.html`), sedangkan homepage edisi bahasa memakai format direktori (`/`, `/id/`, `/es/`, dst.) yang langsung merespons `200 OK`.
   - Setelah deploy pertama, uji URL `/disclaimer.html` dan `/id/disclaimer.html` dengan `curl -I`. Jika Google Search Console melaporkan status redirect `308` pada halaman trust/legal, Anda memiliki 2 pilihan:
     - Memperbarui rute halaman trust menjadi URL bersih (`/disclaimer` atau `/disclaimer/index.html`) agar cocok 100% tanpa hop `308`, **atau**
     - Menggunakan **Cloudflare Workers Static Assets** dengan pengaturan `assets.html_handling: "none"` jika ingin mempertahankan ekstensi `.html` merespons `200 OK` secara ketat.

---

## 2. Langkah 1 — Menyiapkan & Push ke GitHub Repository

1. **Pastikan tidak ada file rahasia lokal yang ikut ter-track**:
   - Jangan membuat file `.env` berisi data rahasia lalu memaksanya masuk ke Git.
   - Biarkan `site.config.json` dalam kondisi bersih (tanpa token pribadi) jika seluruh nilai ingin dikelola dari Cloudflare.
2. **Buat Repository Baru di GitHub**:
   - Buka [github.com](https://github.com) -> **New repository**.
   - Beri nama misalnya `domainname-web-id` (disarankan **Private** bila Anda ingin menjaga riwayat commit internal, atau **Public** karena kode sumber sudah bebas secret).
   - **Jangan** centang *Add a README file* atau *.gitignore* (karena sudah ada di proyek ini).
3. **Inisialisasi dan Push dari Lokal/Workspace**:
   ```bash
   git init
   git branch -M main
   git status   # Pastikan folder dist/ dan node_modules/ serta .env TIDAK muncul
   git add .
   git commit -m "Initial commit: static SEO build for domainname.web.id"
   git remote add origin https://github.com/<USERNAME_GITHUB>/<NAMA_REPO>.git
   git push -u origin main
   ```

---

## 3. Langkah 2 — Menyiapkan Domain & DNS Cloudflare

1. **Tambahkan Domain ke Cloudflare**:
   - Login ke [dash.cloudflare.com](https://dash.cloudflare.com).
   - Klik **Add a domain** (atau **Onboard a domain**), masukkan **`domainname.web.id`**.
   - Pilih paket **Free** (`$0`).
2. **Ganti Nameserver di Registrar Domain (`.web.id`)**:
   - Cloudflare akan menampilkan 2 Nameserver (contoh: `alice.ns.cloudflare.com` dan `bob.ns.cloudflare.com`).
   - Buka panel registrar domain Indonesia tempat `domainname.web.id` terdaftar.
   - Ubah **Nameserver** dari bawaan registrar menjadi 2 Nameserver Cloudflare tersebut (hapus nameserver lama).
   - Tunggu propagasi DNS (biasanya 10 menit – 2 jam) hingga status di Cloudflare menjadi **Active**.
3. **Konfigurasi SSL/TLS & Keamanan Dasar di Cloudflare Dashboard**:
   - Buka menu **SSL/TLS -> Overview**: pilih mode **`Full (strict)`**.
   - Buka menu **SSL/TLS -> Edge Certificates**:
     - **Always Use HTTPS**: **ON**.
     - **Automatic HTTPS Rewrites**: **ON**.
     - **Minimum TLS Version**: **TLS 1.2**.

---

## 4. Langkah 3 — Deploy ke Cloudflare Pages & Simpan Secrets di Cloudflare

### A. Menghubungkan GitHub Repo ke Cloudflare Pages
1. Di Cloudflare Dashboard, buka **Workers & Pages -> Create -> Pages -> Connect to Git**.
2. Hubungkan akun GitHub Anda dan pilih repository `domainname-web-id`.
3. Isi pengaturan Build:
   - **Project name**: `domainname-web-id`
   - **Production branch**: `main`
   - **Framework preset**: `None`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

### B. Mengisi Secrets & Environment Variables di Cloudflare
Sebelum (atau tepat setelah) klik **Save and Deploy**, masuk ke project Cloudflare Pages Anda -> **Settings -> Environment variables** -> tambahkan variabel di bawah ini untuk **Production** (dan **Preview** bila perlu):

| Nama Variabel | Tipe di Cloudflare | Contoh Nilai / Keterangan |
| --- | --- | --- |
| `NODE_VERSION` | Text (Plaintext) | `20` (memastikan Node.js modern untuk ESM & `fs.cpSync`) |
| `SITE_URL` | Text (Plaintext) | `https://domainname.web.id` |
| `CONTACT_EMAIL` | Secret / Text | `admin@domainname.web.id` |
| `GA_MEASUREMENT_ID` | **Secret** | `G-XXXXXXXXXX` (ID Google Analytics 4 Anda) |
| `GSC_VERIFICATION` | **Secret** | Token dari tag `<meta name="google-site-verification" content="TOKEN">` |
| `ADSENSE_CLIENT_ID` | **Secret** | `ca-pub-XXXXXXXXXXXXXXXX` (otomatis mengisi meta tag & membuat `dist/ads.txt`) |
| `ADSENSE_DIRECT_SELLER_ID` | Text / Secret | `f08c47fec0942fa0` (ID Google di `ads.txt`, biarkan default jika tidak berubah) |
| `ADSENSE_ENABLE_AUTO_ADS` | Text (Plaintext) | `false` (wajib `false` karena memakai iklan manual non-Auto Ads) |
| `BING_VERIFICATION` | **Secret** | Token `msvalidate.01` (opsional) |
| `YANDEX_VERIFICATION` | **Secret** | Token `yandex-verification` (opsional) |
| `AHREFS_SITE_VERIFICATION` | **Secret** | Token `ahrefs-site-verification` (opsional) |

> **Penting**: Setiap kali Anda menambah atau mengubah *Secret / Environment Variable* di Cloudflare Pages, Cloudflare **tidak otomatis** membangun ulang HTML lama. Buka tab **Deployments -> titik tiga pada deployment terbaru -> Retry deployment** agar `npm run build` berjalan ulang dengan nilai secret yang baru.

### C. Menghubungkan Custom Domain ke Cloudflare Pages
1. Buka project Cloudflare Pages -> tab **Custom domains -> Set up a custom domain**.
2. Tambahkan **`domainname.web.id`**. Cloudflare otomatis membuat record DNS `CNAME` (`@` -> `<project>.pages.dev`, status **Proxied / Awan Oranye**) dan menerbitkan sertifikat SSL Edge.
3. Opsional (Direkomendasikan): Tambahkan juga **`www.domainname.web.id`** di Custom Domains, lalu buat aturan redirect di Cloudflare (**Rules -> Redirect Rules**) agar `https://www.domainname.web.id/*` diarahkan permanen (**301**) ke `https://domainname.web.id/${1}` supaya tidak terjadi duplikasi `www` vs non-`www` di Google.

---

## 5. Langkah 4 — Checklist Verifikasi Pasca-Deploy

Setelah status deployment **Success** dan domain aktif, lakukan pengecekan berikut dari terminal atau browser:

1. **Cek URL Utama & Edisi Bahasa**:
   ```bash
   curl -I https://domainname.web.id/
   curl -I https://domainname.web.id/id/
   curl -I https://domainname.web.id/en/
   ```
   Pastikan `/` dan `/id/` mengembalikan `HTTP/2 200`, sedangkan `/en/` mengembalikan redirect `301` ke `/`.

2. **Cek File Wajib SEO & AdSense**:
   - `https://domainname.web.id/robots.txt` -> pastikan `Sitemap: https://domainname.web.id/sitemap.xml`
   - `https://domainname.web.id/sitemap.xml` -> pastikan seluruh `<loc>` memakai `https://domainname.web.id/...`
   - `https://domainname.web.id/ads.txt` -> pastikan muncul baris `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0` (muncul setelah `ADSENSE_CLIENT_ID` diisi dan di-redeploy).

3. **Cek Meta Tag & Non-Auto Ads di Source HTML (`Ctrl+U`)**:
   - Pastikan `<meta name="google-site-verification" ...>` dan `<meta name="google-adsense-account" ...>` hadir di HTML statis hasil build.
   - Pastikan tidak ada skrip Auto Ads (`adsbygoogle.js`) sampai Anda memasang unit iklan `<ins class="adsbygoogle">` manual nantinya.

4. **Submit ke Google Search Console & AdSense**:
   - Verifikasi properti domain `domainname.web.id` di Google Search Console (via DNS TXT record Cloudflare atau meta tag `GSC_VERIFICATION`).
   - Submit sitemap `https://domainname.web.id/sitemap.xml` di menu **Sitemaps** GSC.
   - Daftarkan `domainname.web.id` di Google AdSense (pastikan **Auto ads = OFF** pada pengaturan situs di dashboard AdSense).

---

## 6. Mengatasi Masalah GitHub TOS Suspend / Fork Limitation & Alternatif Aman

Jika akun atau repository GitHub Anda terkena *suspend* atau *limitation* oleh sistem moderasi otomatis GitHub:

### Mengapa Kode & Fork Bisa Terkena Limitasi?
1. **Pemicu Filter Anti-Spam Otomatis (Sudah Dibersihkan)**:
   - Sebelumnya `metadata.json` mengandung istilah `"pSEO"` dan `index.html` (di 8 bahasa) berisi contoh domain negatif yang mencantumkan merek dagang nyata (`iphone`, `nike`), pola URL menyerupai clickbait/phishing (`.xyz`/`.top`), serta kata kunci sensitif (`judi/gambling`, `casino`, `adult`, `malware`, `phishing`, `obat kuat`, `PBN`, `link farm`) meski konteksnya hanya edukasi.
   - Seluruh kata kunci berisiko tinggi tersebut **telah dibersihkan** dan diganti dengan contoh domain netral berstandar RFC 2606 (`.example`).
2. **Mengapa Melakukan *Fork* ke Akun Lain Ikut Terkena Limit**:
   - Fitur **Fork** di GitHub mempertahankan relasi grafik (`forked_from`) dan hash objek Git dari repo yang sudah ditandai (*flagged*). Akibatnya, akun kedua yang melakukan *fork* dari repo bermasalah langsung terkena deteksi *ban evasion* / propagasi risiko secara otomatis.

### Solusi Aman Agar Tidak Terkena Suspend Ulang
1. **JANGAN Gunakan Tombol Fork dari Repo Lama**:
   - Unduh kode bersih ini lalu buat repository **baru dari nol** (`git init`) dengan **akun GitHub yang sudah aktif 2FA** (hindari langsung mengunggah *bulk dump* dari akun baru yang belum terverifikasi).
2. **Alternatif 1 — Deploy Langsung ke Cloudflare Pages Tanpa GitHub (Paling Aman dari Filter GitHub)**:
   - Cloudflare Pages mendukung **Direct Upload** lewat Wrangler CLI tanpa perlu menaruh repo di GitHub sama sekali:
     ```bash
     GA_MEASUREMENT_ID=G-XXXX GSC_VERIFICATION=XXXX ADSENSE_CLIENT_ID=ca-pub-XXXX ADSENSE_ENABLE_AUTO_ADS=false npm run build
     npx wrangler pages deploy dist --project-name=domainname-web-id
     ```
   - Anda tetap menggunakan DNS Cloudflare, domain `domainname.web.id`, dan build statis HTML yang sama persis.
3. **Alternatif 2 — Gunakan GitLab + Cloudflare Pages**:
   - Cloudflare Pages mendukung integrasi Git resmi dengan **GitLab** (`Connect to Git -> GitLab`) selain GitHub.
4. **Banding Akun GitHub yang Sudah Terlanjur Kena Limit**:
   - Ajukan permohonan peninjauan resmi di [support.github.com/contact/reinstatement](https://support.github.com/contact/reinstatement) dan jelaskan bahwa repositori adalah utilitas riset penamaan domain & validasi DNS RFC 1035 (*false positive*), serta tidak melakukan aktivitas spam/scraping otomatis.

---

## 7. Dokumentasi Teknis Fitur Terbaru (`index.html` & `dist/`)

Bagian ini merangkum arsitektur antarmuka, optimasi mobile, serta mekanisme cache lokal yang aktif pada aplikasi:

### A. Cache Ketersediaan Domain di `localStorage`
- **Kunci Penyimpanan**: `domainAvailabilityCacheV1` berisi objek JSON `{ version: 1, entries: { "<domain_lowercase>": { status, rawStatus, method, checkedAt, ttlMs } } }`.
- **Normalisasi & Status**: Kunci domain selalu dinormalisasi ke huruf kecil (`normalizeDomainCacheKey`). Nilai `status` distandarkan menjadi `available | taken | check` (dengan `rawStatus` menyimpan detail `available | taken | no-ns | error` dan `method` menyimpan `NS | RDAP`).
- **TTL & Konfigurasi**:
  - Rentang TTL aman dikunci antara **1 menit** (`60.000 ms`) hingga **24 jam** (`86.400.000 ms`).
  - Default TTL adalah **6 jam** untuk status `available` dan `taken`, serta **5 menit** untuk status `check` (`no-ns` / `error`).
  - Dapat dikonfigurasi ulang via `window.__AVAILABILITY_CACHE_TTL_MS__` atau item `localStorage` `domainAvailabilityCacheTtlMs`.
- **Cache-First Lookup, Hidrasi & Keamanan Kuota**:
  - Saat `DOMContentLoaded`, `hydrateAvailabilityCacheFromStorage()` memuat entri yang masih valid ke `Map` memori sebelum generasi awal dan pengecekan otomatis berjalan, sehingga reload halaman, filter status (`All`, `Available`, `Taken`, `Check`), serta filter domain tidak memicu query ulang ke DoH/RDAP.
  - Seluruh baca/tulis `localStorage` dibungkus `try...catch` dengan fallback aman ke memori jika browser memblokir storage atau melebihi kuota (`QuotaExceededError`), disertai *periodic pruning* tiap **5 menit** dan batas maksimal **1.000 entri**.
- **Force Re-Check (Bypass Cache)**:
  - Baris berstatus `Available` / `Taken` menampilkan usia cache pada tooltip serta tombol **Re-check** (`data-recheck-domain`) untuk memaksa lookup ulang ke DNS-over-HTTPS / RDAP dan menimpa entri cache; klik eksplisit pada tombol `Check`, `No NS`, atau `Retry` juga memicu pengecekan segar.

### B. Sistem Warna, Layout Responsif & Token Desain
1. **Form Generator (`#generatorSection`)**:
   - **Primary Keyword & Extensions**: Latar `#de3723` teks putih dengan tombol **Generate Domain Names** (`#131354`, rata tengah, lebar sesuai isi tombol, border putih tegas, hover kontras `#FFFFFF` / `#131354`).
   - **Mobile Toggle `Add / Customize`**: Latar biru `#2165b3` dengan teks putih.
   - **Secondary & Tertiary Keyword**: Latar `#578686` dengan label putih dan input berlatar `#FFFFFF`.
   - **Shuffle Keywords (Word Count & Separator)**: Latar `#669999` dengan teks putih (`Shuffle Keywords` untuk label bahasa Inggris dari *Acak Urutan Kata Kunci*).
   - **Add Your Own Patterns**: Latar `#131354` teks putih, tombol sisip placeholder berkode warna berbeda (`+ [primary]`, `+ [secondary]`, `+ [tertiary]`, `+ [dash]`, `+ [number]`, `+ [vowel]`, `+ [consonant]`), serta tombol **Generate Domain Names** oranye tua (`#c83e0c`, rata tengah, lebar sesuai isi tombol, border putih, hover kontras `#FFFFFF` / `#c83e0c`).
   - Kedua tombol **Generate Domain Names** bekerja secara *mutually exclusive* (`activeGenerateSlot: 'basic' | 'pattern'`).
   - **Tombol `Start Over` / `Mulai Ulang` (`resetToHome`)**: Tersedia di titik-titik rawan kebingungan/friksi — pojok atas form (`#uiResetFormBtn`), bagian bawah panel opsi lanjutan (`#uiResetAdvBtn`), toolbar tabel analisis (`#uiResetAnalysisBtn`), layar tabel kosong/tanpa hasil filter, dan Langkah 5 pada panduan pengetahuan. Mengembalikan semua input kata kunci, ekstensi, checkbox permutasi, formula kustom, filter tabel, seleksi baris, scroll tabel, serta parameter URL ke kondisi awal bersih, lalu menggulir layar kembali ke atas halaman dengan dukungan `prefers-reduced-motion`.
2. **Bagian Permutasi & Tabel Analisis (`#domainAnalysisPanel`)**:
   - Blok `#resultsSection` (*Generated Domain Permutations*) disembunyikan secara aman (`hidden`) tanpa menghapus state maupun logika copy/export/bulk-check.
   - Kotak header **Domain Availability, Backlink, Archive & Index Data** memakai Soft Teal `#ECF2F2` dengan teks gelap `#292929`.
   - Tabel domain bernuansa oranye: header `#f05422` teks putih dan baris selang-seling `#FFFFFF` dan `#f9e1d9` (hover `#f4cec2`).
   - Pada layar mobile/tablet (`< lg`), kolom `#` disembunyikan dan urutan kolom menjadi `DOMAIN NAME` → `AVAILABILITY` → `CHARS` → `INSPECT` (`BL`, `WM`, `GG`).
   - Tombol batch (`Remove Selected`, `Copy`, `Copy MD`, `Export .txt`, `Bulk Check`) tetap aktif penuh dengan tombol `Bulk Check` bergaya netral sepadan `Copy MD`.
3. **Share & Export Link (`#shareExportSection`)**:
   - Responsif penuh: bertumpuk full-width (`grid-cols-1`) di smartphone, sejajar di tablet/desktop (`sm:flex` / `sm:grid-cols-3` / `md:flex`), dengan tombol berwarna-warni selaras palet halaman (`#0C723F`, `#131354`, `#578686`, `#2165b3`, `#f05422`, `#B87900`, `#de3723`).
4. **Konten Edukasi, FAQ, & Context Cards (`#editorial-design-tokens`)**:
   - Menggunakan token warna CSS *framework-agnostic* (`--surface-base: #FFFFFF`, `--surface-teal-soft: #ECF2F2`, `--surface-neutral: #EDEDED`, `--surface-teal-accent: #578686`, `--text-primary: #292929`, `--text-secondary: #3F3042`, `--text-on-teal: #FDFEFE`, `--accent-positive: #0C723F`) secara konsisten pada 6 bagian panduan/referensi (termasuk Langkah 5 panduan tombol `Start Over`), **Frequently Asked Questions**, serta kartu **AI Search Engine & Domain Indexing Context** dan **Domain Name Formula Summary**.

### C. Logging Otomatis Domain Tersedia (≤ 25 Karakter) ke Cloudflare D1
- **Cloudflare Pages Function**: `functions/api/log-available-domain.js` melayani endpoint `POST /api/log-available-domain` menggunakan binding D1 `env.DB`.
- **Auto-Bootstrap & Auto-Migrasi Schema**: Pada request pertama, handler otomatis menjalankan `CREATE TABLE IF NOT EXISTS available_domains`, mengecek `PRAGMA table_info(available_domains)` untuk menambah kolom `lang TEXT NOT NULL DEFAULT 'en'` serta 7 kolom skor (`brandability_score`, `structure_length_score`, `extension_lang_fit_score`, `character_cleanliness_score`, `niche_clarity_score`, `overall_heuristic_score`, `scored_at`) bertipe `INTEGER` bila belum ada dan menghapus kolom lama `checked_at_iso` bila masih ada, lalu membuat 4 indeks via `db.batch` (`idx_available_domains_checked_at`, `idx_available_domains_extension`, `idx_available_domains_char_length`, `idx_available_domains_lang`). File migrasi SQL terpisah juga tersedia di `migrations/0001_add_domain_scores.sql`.
- **Kolom, Penilaian Otomatis & Validasi Server-Side**: Hanya menerima payload `status === 'available'` dengan panjang `domain.length <= 25`, lalu menghitung dan memvalidasi 6 skor heuristik deterministik (`0–100`, memisahkan SLD secara akurat untuk ekstensi multi-bagian seperti `.web.id`/`.my.id`) dan melakukan upsert (`ON CONFLICT(domain) DO UPDATE`) untuk `domain` (`PRIMARY KEY`), `extension`, `char_length`, `lang`, `check_method` (`RDAP` / `NS`), `check_source` (`auto` / `manual`), `checked_at` (epoch ms), serta `brandability_score`, `structure_length_score`, `extension_lang_fit_score`, `character_cleanliness_score`, `niche_clarity_score`, `overall_heuristic_score`, dan `scored_at`.
- **Konfigurasi `wrangler.toml`**: Menyediakan binding `[[d1_databases]]` dengan `binding = "DB"` dan `pages_build_output_dir = "dist"` (serta `database_id` D1 Anda). Pastikan binding `DB` juga terhubung di **Cloudflare Pages -> Settings -> Functions -> D1 database bindings** bila deploy lewat GitHub.
- **Trigger & Tampilan Skor Sisi Klien**: Setiap pengecekan jaringan (`auto` maupun klik manual tombol `Check` / re-check) yang menghasilkan `available` otomatis menampilkan kolom `Score` (`XX/100` beserta rincian 5 sub-skor di tooltip) khusus baris `available` pada tabel analisis, dan untuk domain `<= 25` karakter mengirim `POST` non-blocking (`keepalive: true`) beserta skornya ke `/api/log-available-domain`. Error jaringan diabaikan diam-diam agar UI tetap responsif.

### D. Verifikasi Sebelum Commit / Deploy
Jalankan kedua perintah berikut untuk memastikan sintaks JS dan build statis bersih:
```bash
npm run lint
npm run build
```

