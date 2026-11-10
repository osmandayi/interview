# Interview QA

Mülakat sırasında Frontend (JavaScript, React), Backend (Java, Spring, SQL, OOP, vb.) ve Tester (test seviyeleri, test süreçleri, otomasyon, API testleri, CI/CD, metodolojiler) sorularına tek noktadan ulaşılan yerel responsive web uygulaması. Bilgileri pasif okumanın yanında, **Canlı Mülakat** modu ile sistemin sorduğu sorulara cevap verip puanlanabilirsin.

## Kullanım

### Geliştirme

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` açılır.

### Production Build

```bash
npm run build
npm run preview
```

### Mobilden Erişim (LAN)

```bash
npm run dev -- --host
```

Aynı Wi-Fi'daki bir telefonda `http://<bilgisayar-ip>:5173` adresinden açılır.

### İçerik Güncelleme

- **Frontend / Backend:** `C:\Users\Pc\Desktop\full_stack.txt` dosyasını düzenle (dosya yoksa commit'li `qa.json` korunur).
- **Tester:** repodaki `content/tester.md` dosyasını düzenle. Yapı: `## N. Başlık` = alt kategori, `### N. Başlık` = soru, altındaki `* **Kısa Tanım:**` ve `* **Mülakat Örneği & Akış:**` maddeleri = cevap.

Ardından `npm run parse` ile yeniden üret (`npm run dev` / `npm run build` bunu otomatik yapar).

### Arayüz

- **Ana sayfa:** kaldığın yerden devam, kategori kartları (ilerleme yüzdesiyle), hızlı erişim ve son mülakat oturumlarının skorları.
- **Kenar menü:** kategori sekmeleri (Tümü / Frontend / Backend / Tester), menü içi filtre, alt kategori başına `okunan/toplam` sayacı ve ilerleme çubuğu. Mobilde alttan açılır.
- **İlerleme:** soruları “okundu” olarak işaretleyebilirsin; durum tarayıcıda (localStorage) saklanır.

### Klavye Kısayolları

| Tuş | Aksiyon |
|---|---|
| `Ctrl+K` / `Cmd+K` | Arama modalı aç |
| `Esc` | Modal/drawer kapat |
| `↑` `↓` | Arama sonuçlarında gezin |
| `Enter` | Seçili sonuca git |
| `F` | Açık Q&A'i favoriye toggle |
| `M` | Açık Q&A'i okundu olarak işaretle / kaldır |
| `←` `→` | Önceki / sonraki soru |
| `Ctrl+Enter` | Canlı Mülakat'ta cevabı gönder |
| `T` | Tema değiştir |

## Canlı Mülakat

"Canlı Mülakat" modu, bilgileri pasif okumak yerine aktif olarak test etmeni sağlar. Ana ekrandaki **Canlı Mülakat** kartından veya kenar menüden başlatılır.

- **Kapsam seçimi:** Tüm havuz (varsayılan), bir kategori ya da alt kategori.
- **Süre:** İsteğe bağlı soru başına 1/2/3 dk sınır; süre dolunca cevap otomatik gönderilir.
- **Akış:** Sistem tekrarsız sorular sorar; cevabını metin kutusuna yazıp gönderirsin.
- **Puanlama:** Cevabın, doğru cevaptaki anahtar kelimelerle karşılaştırılır. Eşleşme esnektir — Türkçe karakterler normalize edilir, kelime kökleri ve küçük yazım hataları (Levenshtein) tolere edilir, ve her anahtar kelime en fazla **bir kez** sayılır.
- **Geri bildirim:** Yüzde skor göstergesi + yakaladığın/kaçırdığın anahtar kelimeler + gerçek cevap (yakaladığın kelimeler vurgulu) gösterilir. Boş cevap gönderirsen uyarılırsın.
- **Oturum:** İstediğin kadar devam eder; "Bitir" deyince ortalama / en iyi skor ve en zayıftan güçlüye konu dökümüyle özet çıkar. Oturumlar ana sayfadaki geçmişe kaydedilir.

Anahtar kelimeler cevap metninden otomatik çıkarılır (Türkçe stop-word'ler ayıklanır). Tester sorularında sadece "Kısa Tanım" kısmı kullanılır; örnek senaryo puanlamaya dahil edilmez. İstersen `scripts/overrides.json` içinde `keywordOverrides` ile soru bazında elle de belirleyebilirsin.

## Yapı

- `scripts/build-data.mjs` — txt → JSON parser (Frontend satır-bazlı, Backend pattern-based, Tester markdown başlık-bazlı); full_stack kaynağı yoksa mevcut `qa.json`'daki Frontend/Backend'i korur
- `content/tester.md` — Tester mülakat içeriği (kaynak metin, olduğu gibi)
- `scripts/overrides.json` — parse hatalarını (`tagOverrides`) ve mülakat anahtar kelimelerini (`keywordOverrides`) manuel düzeltmek için
- `src/lib/scoring.ts` — mülakat puanlama motoru (normalize, Levenshtein, anahtar kelime ayıklama, skorlama)
- `src/components/` — React UI bileşenleri (Sidebar, SearchModal, QACard, InterviewSetup/View/Summary, vb.)
- `src/lib/` — veri yükleme, puanlama, cevap render'ı, localStorage yardımcıları, oturum geçmişi
- `src/hooks/` — useFavorites, useProgress, useTheme, useSearch, useInterview
- `src/contexts/` — Theme, Favorites, Progress, Search provider'ları
- `tests/` — Vitest test'leri (puanlama, mülakat oturumu ve Tester parser'ı dahil)

## Tasarım Dokümanları

Temel uygulama:
- Spec: [`docs/superpowers/specs/2026-05-26-interview-qa-design.md`](docs/superpowers/specs/2026-05-26-interview-qa-design.md)
- Plan: [`docs/superpowers/plans/2026-05-26-interview-qa.md`](docs/superpowers/plans/2026-05-26-interview-qa.md)

Canlı Mülakat modu:
- Spec: [`docs/superpowers/specs/2026-06-09-canli-mulakat-design.md`](docs/superpowers/specs/2026-06-09-canli-mulakat-design.md)
- Plan: [`docs/superpowers/plans/2026-06-09-canli-mulakat.md`](docs/superpowers/plans/2026-06-09-canli-mulakat.md)

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · Fuse.js · Shiki · lucide-react · Vitest
