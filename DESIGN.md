# Design System — Tempmail

Dokumen ini nyatet keputusan visual buat frontend Tempmail: kenapa kelihatan seperti itu, bukan
cuma apa yang kelihatan. Pasangannya `PRD-TempMail.md` (fungsional) — dokumen ini soal rasa &
tampilannya.

## Konsep

Produk ini soal sesuatu yang **sengaja dibuat untuk dipakai sekali lalu dibuang**. Daripada
mendesainnya seperti dashboard SaaS biasa, identitas visualnya diambil dari dunia benda-benda yang
memang didesain untuk itu: tiket parkir, karcis penitipan barang, struk antrian — semua punya
tenggat waktu, dan semua bisa langsung dirobek begitu gak kepake lagi.

Dua elemen fisik dari dunia itu yang diangkat jadi motif:

- **Tepi sobek (perforasi)** di kartu alamat — meniru garis putus-putus di tiket yang dirancang
  buat dirobek
- **Stempel pembatalan** — yang biasanya dipakai petugas buat "mencoret" tiket setelah dipakai,
  di sini fungsinya dibalik jadi countdown TTL yang berjalan mundur

Kenapa bukan dua arah desain yang lebih "default" buat tools kayak gini:
- **Bukan** kartu putih bersih + font sans netral khas dashboard SaaS — kesannya jadi gak beda
  dari seribu tool lain, padahal sifat produknya ("sementara, lalu hilang") ini unik dan layak
  ditonjolkan
- **Bukan** tema hacker/terminal hijau-di-atas-hitam — kesannya terlalu "developer tool", padahal
  ini dipakai casual, bukan cuma buat ngoprek

## Warna

Satu warna aksen dipakai konsisten di kedua tema — merah tinta stempel — supaya kesan "dicap/
divalidasi" itu konsisten di mana-mana, gak random campur banyak warna.

| Token | Light | Dark | Dipakai untuk |
|---|---|---|---|
| `--color-bg` | `#EAF1EC` | `#0E1B16` | Latar halaman — hijau pucat/botol gelap, bukan abu/hitam netral |
| `--color-surface` | `#FFFFFF` | `#15261F` | Latar kartu, modal |
| `--color-border` | `#CBDBD0` | `#24382F` | Garis tepi, divider |
| `--color-text` | `#142420` | `#EAF1EC` | Teks utama |
| `--color-text-muted` | `#5C7468` | `#8FA89B` | Label, timestamp, teks sekunder |
| `--color-accent` | `#C8341F` | `#E0432B` | Tombol utama, link aktif, stempel countdown |
| `--color-accent-soft` | `rgba(200,52,31,.10)` | `rgba(224,67,43,.15)` | Hover state, highlight baris |

Dasar warnanya bukan abu-abu/krem netral, tapi condong ke hijau botol — biar gak jatuh ke dua pola
yang sudah terlalu sering dipakai (krem hangat + aksen terracotta, atau hitam pekat + aksen neon).
Hijau botol gelap dipilih karena dekat ke warna kotak pos lama, dan tetap kontras cukup tinggi buat
teks di kedua mode.

## Tipografi

Tiga font, masing-masing satu peran spesifik — bukan sekadar "satu buat heading satu buat body":

| Font | Peran | Kenapa |
|---|---|---|
| **Space Grotesk** | Wordmark, judul (`font-display`) | Geometris, agak kaku, kesannya seperti cap/stensil — bukan serif elegan yang dipakai hampir semua landing page AI sekarang |
| **JetBrains Mono** | Alamat email, angka countdown (`font-mono`) | Alamat itu string acak — mono bikin dia kebaca sebagai "kode yang di-generate", bukan teks biasa |
| **Inter** | Body, tombol, label (`font-sans`) | Netral, gak ganggu, biar dua font lain di atas yang jadi pusat perhatian |

Aturan pakainya: **Space Grotesk dan JetBrains Mono cuma muncul di tempat yang spesifik**
(wordmark, alamat, angka), gak dipakai buat paragraf panjang. Body teks selalu Inter. Ini supaya
karakter visualnya gak "berisik" — boldness-nya dihemat buat 2 elemen itu doang.

## Komponen Signature

### Kartu alamat (tiket klaim)
`AddressCard` + `CancellationStamp`. Class `.ticket-edge-top` / `.ticket-edge-bottom` bikin efek
sobekan pakai `radial-gradient` titik-titik di warna bg, ditumpuk di tepi atas-bawah kartu —
ilusi "lubang bekas dirobek dari blok tiket". Stempelnya sendiri lingkaran SVG yang progress-nya
ngisi berlawanan sama sisa waktu (makin dekat expired, makin penuh merahnya), dirotasi -8° biar
kesannya distempel manual bukan elemen UI biasa, dan mulai berdenyut (`animate-pulse`) di bawah
60 detik terakhir.

### Daftar email (kotak masuk)
Baris-baris dipisah garis putus-putus (`divide-dashed`), bukan garis solid — gestur kecil yang
konsisten sama tema "tiket" tanpa perlu nambah elemen baru.

### Pembaca email
Modal/slide-over sederhana, HTML body di-render di `<iframe sandbox="">` — selain alasan
keamanan (cegah script asing jalan), ini juga konsisten konsepnya: "ini cuma ditampilkan
sementara, bukan bagian permanen dari halaman."

### Animasi masuk
`stamp-in` — elemen muncul dari ukuran 1.4x lalu mengecil ke ukuran normal sambil rotasi -8°,
seolah "baru saja dicap". Dipakai di kartu login & kartu alamat saat pertama render. Dihormati
`prefers-reduced-motion` — animasi dimatikan kalau user minta gerakan minim.

## Aksesibilitas

- Semua elemen interaktif punya `focus-visible:outline` dengan warna accent — gak diandalkan ke
  warna/kontras doang buat indikasi fokus
- Kontras teks-vs-bg di kedua tema sudah dicek manual cocok buat teks ukuran kecil (label, mono)
- Iframe email pakai `sandbox=""` (paling restriktif) — bukan cuma estetika, ini juga mitigasi XSS
  dari HTML email yang gak terpercaya
- Countdown punya `role="timer"` + `aria-label` yang nyebut sisa waktu dalam kata-kata, bukan cuma
  visual ring

## Yang sengaja TIDAK dipakai

- **Gradient/glassmorphism** — gak ada glow, blur, atau gradient dekoratif. Permukaan flat,
  bedanya cuma lewat border & sedikit shadow alami dari elevasi modal
- **Lebih dari satu warna aksen** — godaan buat nambah warna kedua (misal hijau buat "berhasil",
  kuning buat "warning") ditahan; status dikomunikasikan lewat teks & posisi, bukan kode warna
  tambahan
- **Icon library generik** — tombol pakai teks atau satu-dua karakter (☀/☾, ✕) alih-alih import
  icon set yang bikin semua produk AI kelihatan pakai komponen yang sama
