# Interview QA

Mülakat sırasında Frontend (JavaScript, React) ve Backend (Java, Spring, SQL, OOP, vb.) sorularına tek noktadan ulaşılan yerel responsive web uygulaması. Bilgileri pasif okumanın yanında, **Canlı Mülakat** modu ile sistemin sorduğu sorulara cevap verip puanlanabilirsin.

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

1. `C:\Users\Pc\Desktop\full_stack.txt` dosyasını düzenle
2. `npm run parse` ile yeniden parse et
3. `npm run dev` zaten HMR ile günceller

### Klavye Kısayolları

| Tuş | Aksiyon |
|---|---|
| `Ctrl+K` / `Cmd+K` | Arama modalı aç |
| `Esc` | Modal/drawer kapat |
| `↑` `↓` | Arama sonuçlarında gezin |
| `Enter` | Seçili sonuca git |
| `F` | Açık Q&A'i favoriye toggle |
| `T` | Tema değiştir |

## Canlı Mülakat

"Canlı Mülakat" modu, bilgileri pasif okumak yerine aktif olarak test etmeni sağlar. Ana ekrandaki **Canlı Mülakat** kartından veya kenar menüden başlatılır.

- **Kapsam seçimi:** Tüm havuz (varsayılan) ya da belirli bir alan/kategori.
- **Akış:** Sistem tekrarsız sorular sorar; cevabını metin kutusuna yazıp gönderirsin.
- **Puanlama:** Cevabın, doğru cevaptaki anahtar kelimelerle karşılaştırılır. Eşleşme esnektir — Türkçe karakterler normalize edilir, kelime kökleri ve küçük yazım hataları (Levenshtein) tolere edilir, ve her anahtar kelime en fazla **bir kez** sayılır.
- **Geri bildirim:** Yüzde skor + yakaladığın/kaçırdığın anahtar kelimeler + gerçek cevap gösterilir. Boş cevap gönderirsen uyarılırsın.
- **Oturum:** İstediğin kadar devam eder; "Bitir" deyince cevaplanan soru sayısı ve ortalama skorla özet çıkar.

Anahtar kelimeler cevap metninden otomatik çıkarılır (Türkçe stop-word'ler ayıklanır). İstersen `scripts/overrides.json` içinde `keywordOverrides` ile soru bazında elle de belirleyebilirsin.

## Yapı

- `scripts/build-data.mjs` — txt → JSON parser (Frontend satır-bazlı, Backend pattern-based); kaynak yoksa mevcut `qa.json`'ı korur
- `scripts/overrides.json` — parse hatalarını (`tagOverrides`) ve mülakat anahtar kelimelerini (`keywordOverrides`) manuel düzeltmek için
- `src/lib/scoring.ts` — mülakat puanlama motoru (normalize, Levenshtein, anahtar kelime ayıklama, skorlama)
- `src/components/` — React UI bileşenleri (Sidebar, SearchModal, QACard, InterviewSetup/View/Summary, vb.)
- `src/hooks/` — useFavorites, useTheme, useSearch, useInterview
- `src/contexts/` — Theme, Favorites, Search provider'ları
- `tests/` — Vitest test'leri (37 test; puanlama ve mülakat oturumu dahil)

## Tasarım Dokümanları

Temel uygulama:
- Spec: [`docs/superpowers/specs/2026-05-26-interview-qa-design.md`](docs/superpowers/specs/2026-05-26-interview-qa-design.md)
- Plan: [`docs/superpowers/plans/2026-05-26-interview-qa.md`](docs/superpowers/plans/2026-05-26-interview-qa.md)

Canlı Mülakat modu:
- Spec: [`docs/superpowers/specs/2026-06-09-canli-mulakat-design.md`](docs/superpowers/specs/2026-06-09-canli-mulakat-design.md)
- Plan: [`docs/superpowers/plans/2026-06-09-canli-mulakat.md`](docs/superpowers/plans/2026-06-09-canli-mulakat.md)

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · Fuse.js · Shiki · lucide-react · Vitest
