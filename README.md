# Interview QA

Mülakat sırasında Frontend (JavaScript, React) ve Backend (Java, Spring, SQL, OOP, vb.) sorularına tek noktadan ulaşılan yerel responsive web uygulaması.

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

## Yapı

- `scripts/build-data.mjs` — txt → JSON parser (Frontend satır-bazlı, Backend pattern-based)
- `scripts/overrides.json` — parse hatalarını manuel düzeltmek için
- `src/components/` — React UI bileşenleri
- `src/hooks/` — useFavorites, useTheme, useSearch
- `src/contexts/` — Theme, Favorites, Search provider'ları
- `tests/` — Vitest test'leri (17 test)

## Tasarım Dokümanı

- Spec: [`docs/superpowers/specs/2026-05-26-interview-qa-design.md`](docs/superpowers/specs/2026-05-26-interview-qa-design.md)
- Plan: [`docs/superpowers/plans/2026-05-26-interview-qa.md`](docs/superpowers/plans/2026-05-26-interview-qa.md)

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · Fuse.js · Shiki · lucide-react · Vitest
