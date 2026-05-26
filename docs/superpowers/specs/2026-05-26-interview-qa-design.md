# Interview QA — Mülakat Bilgi Tabanı

**Tarih:** 2026-05-26
**Durum:** Tasarım onaylandı, implementasyona hazır
**Kaynak veri:** `C:\Users\Pc\Desktop\full_stack.txt` (~23 KB, Frontend + Backend Q&A)

---

## 1. Amaç

Mülakat sırasında Frontend (JavaScript, React) ve Backend (Java, Spring, SQL, OOP, SOLID, Mikroservis vb.) konularındaki soru-cevap içeriğine **tek noktadan, hızla ve cihazdan bağımsız** ulaşılabilen yerel bir web uygulaması inşa etmek.

### Başarı Kriterleri

- Ctrl+K → 50ms'den hızlı fuzzy arama
- Hem masaüstü hem mobilde rahat kullanım
- Sıfır internet bağımlılığı (build sonrası)
- Favori soruları kalıcı saklama (localStorage)
- Kod örnekleri syntax highlight'lı

---

## 2. Teknoloji Seçimi

| Katman | Seçim | Gerekçe |
|---|---|---|
| Build | **Vite** | Hızlı HMR, modern config, minimum boilerplate |
| UI | **React 18 + TypeScript** | Bileşen yapısı, tip güvenliği |
| Stil | **Tailwind CSS** | Utility-first, responsive kolay, dark mode hazır |
| Arama | **Fuse.js** | 6KB, fuzzy match, ağırlıklı alan desteği |
| Kod highlight | **Shiki** | VSCode highlighter, dark/light otomatik |
| İkonlar | **lucide-react** | Lightweight, tutarlı set |
| Test | **Vitest** | Vite-native, hızlı |

State management için **React Context** yeterli (Redux/Zustand YAGNI).

---

## 3. Proje Yapısı

```
interview-qa/
├── src/
│   ├── data/
│   │   └── qa.json                  # parse çıktısı (build-time)
│   ├── components/
│   │   ├── Sidebar.tsx              # kategori ağacı + favoriler sekmesi
│   │   ├── SearchModal.tsx          # Ctrl+K fuzzy arama
│   │   ├── QACard.tsx               # tek soru-cevap kartı
│   │   ├── CodeBlock.tsx            # Shiki ile syntax highlight
│   │   ├── ThemeToggle.tsx
│   │   └── TopBar.tsx
│   ├── hooks/
│   │   ├── useFavorites.ts          # localStorage favori yönetimi
│   │   ├── useTheme.ts              # dark/light tema + sistem tercihi
│   │   ├── useSearch.ts             # Fuse.js wrapper
│   │   └── useKeyboard.ts           # global kısayollar
│   ├── contexts/
│   │   ├── ThemeContext.tsx
│   │   ├── FavoritesContext.tsx
│   │   └── SearchContext.tsx
│   ├── types/
│   │   └── qa.ts                    # TypeScript tipleri
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                    # Tailwind directives
├── scripts/
│   ├── build-data.mjs               # txt → json parser
│   └── overrides.json               # parse hatası düzeltmeleri
├── tests/
│   ├── parse.test.ts
│   ├── useFavorites.test.ts
│   └── useSearch.test.ts
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── index.html
```

---

## 4. Veri Modeli

### TypeScript Şeması

```typescript
// src/types/qa.ts
export type QAData = {
  categories: Category[];
};

export type Category = {
  id: string;                  // "frontend" | "backend"
  title: string;               // "Frontend"
  subcategories: Subcategory[];
};

export type Subcategory = {
  id: string;                  // "javascript-fundamentals"
  title: string;               // "JavaScript Temelleri ve Mimari"
  items: QAItem[];
};

export type QAItem = {
  id: string;                  // unique slug: "closure-mantigi"
  question: string;            // "Closure Mantığı Nedir? Avantajı Nedir?"
  answer: string;              // Markdown — kod blokları ```java ... ```
  tags?: string[];             // arama için ek anahtar kelimeler
};
```

### Beklenen İçerik Hacmi

- Frontend: ~25 Q&A, 3 alt-kategori (JS Temelleri, React, Best Practices)
- Backend: ~50 Q&A, 5 alt-kategori (Java Core, Spring, SQL, Data Structures, Software Engineering)
- **Toplam:** ~75 Q&A → `qa.json` ≈ 37 KB

---

## 5. Parse Stratejisi

Kaynak dosyanın yapısı düzensiz:
- **Frontend bölümü:** Boş satırla ayrılmış düzgün Q&A blokları
- **Backend bölümü:** Neredeyse tamamı tek satıra sıkıştırılmış (boşluk ayracı yok)

Bu yüzden hibrit yaklaşım gerekli.

### Akış: `scripts/build-data.mjs`

```
1. full_stack.txt okunur
2. "FRONTEND" ve "BACKEND" markerları ile ikiye bölünür
3. Frontend bloğu satır-bazlı parse edilir (boş satır = ayraç)
4. Backend bloğu pattern-based ayrıştırılır:
   - Alt-kategori başlangıçları: /^\d+\.\s+[A-ZÇŞĞÜÖİ]/
   - Soru sonları: "?", "farkı:", "nedir:", "Genel:" gibi anahtar bitişler
   - Bilinen 50+ soru başlığı sözlüğü split point olarak kullanılır
5. overrides.json varsa yamalar uygulanır
6. Java kod örnekleri tespit edilir (public boolean, function, indent pattern)
   ve markdown fenced code (```java) olarak sarmalanır
7. Her Q&A için id slug üretilir (Türkçe karakterler normalize edilir)
8. src/data/qa.json yazılır
9. Konsola özet basılır
```

### Konsol Çıktısı (örnek)

```
✓ Frontend okundu
  ├ JavaScript Temelleri: 9 Q&A
  ├ React Mimarisi: 11 Q&A
  └ Best Practices: 2 Q&A
✓ Backend okundu
  ├ Java Core: 10 Q&A
  ├ Spring Framework: 11 Q&A
  ├ SQL: 3 Q&A
  ├ Data Structures: 4 Q&A
  └ Software Engineering: 7 Q&A
⚠ 1 belirsiz blok (overrides.json'a bakıldı, düzeltildi)
✓ qa.json yazıldı: 37.2 KB, 73 Q&A
```

### `overrides.json` Yapısı

```json
{
  "manualSplits": [
    {
      "rawMatch": "Algoritma Sorusu: boolean isSortedasc",
      "question": "Algoritma: boolean isSortedasc(int[] arr)",
      "subcategoryId": "data-structures"
    }
  ],
  "tagOverrides": {
    "closure-mantigi": ["scope", "encapsulation", "lexical", "private"]
  }
}
```

### Hata Politikası

Belirsiz bir blok `overrides.json`'da da yoksa **build fail eder** (sessiz veri kaybı önlenir). Konsola hatalı bloğun ilk 100 karakteri yazılır.

---

## 6. UI / UX Layout

### Desktop (≥768px)

- **TopBar:** Logo + arama bar (placeholder: "Ara... Ctrl+K") + favori sekmesi linki + tema toggle
- **Sidebar (280px):** Kategori ağacı, açılabilir/kapanabilir alt-kategoriler
- **İçerik (max-w 900px, kalan alan):** Seçili Q&A kartı, üstte breadcrumb (Frontend > JS Temelleri > Closure...)

### Mobile (<768px)

- TopBar üstte sabit (hamburger + arama ikonu + tema)
- Sidebar drawer olarak açılır (sol kenardan slide-in)
- İçerik tam genişlik
- Arama modal full-screen

### İlk Yükleme Ekranı

Uygulama açıldığında içerik panelinde **Hoşgeldin ekranı** gösterilir:
- Toplam Q&A sayısı ("73 soru, 8 kategori")
- Üç büyük buton: "Ctrl+K ile Ara", "Kategorilere Göz At", "Favorilerime Git"
- Son görüntülenen Q&A varsa (sessionStorage), "Kaldığın yerden devam et" linki

Sidebar ve TopBar her zaman görünür — bu sadece ana içerik alanı için.

### Favoriler Görünümü

Sidebar'daki `⭐ Favoriler (N)` linkine tıklandığında ana içerik alanı **filtreli liste görünümüne** geçer:
- Tüm favori Q&A'ler kart-grid halinde listelenir (her kart: soru + kısa preview)
- Her karta tıklayınca normal detay görünümüne döner
- URL: `/?view=favorites` (geri/ileri butonu çalışsın diye basit query param)

### Renk Paleti

| Element | Light | Dark |
|---|---|---|
| Background | `#fafafa` | `#0a0a0a` |
| Surface | `#ffffff` | `#171717` |
| Border | `#e5e5e5` | `#262626` |
| Text primary | `#171717` | `#fafafa` |
| Text secondary | `#737373` | `#a3a3a3` |
| Accent | `#3b82f6` | `#60a5fa` |
| Code bg | `#f5f5f5` | `#1c1c1c` |

### Tipografi

- UI: **Inter** (Google Fonts veya self-hosted)
- Kod: **JetBrains Mono**

### Klavye Kısayolları

| Tuş | Aksiyon |
|---|---|
| `Ctrl+K` / `Cmd+K` | Arama modalı aç |
| `Esc` | Modal/drawer kapat |
| `↑` `↓` | Arama sonuçlarında gezin |
| `Enter` | Seçili sonuca git |
| `F` | Açık Q&A'i favoriye toggle |
| `T` | Tema değiştir |

### Arama Modal

- Ctrl+K ile açılır, input otomatik focus
- Sonuçlar real-time (her keystroke'ta filter)
- Her sonuç: breadcrumb (kategori > alt-kategori) + soru başlığı
- Eşleşen karakterler bold + accent renk
- Footer: sonuç sayısı + kısayol ipuçları

### Fuse.js Konfigürasyonu

```typescript
{
  keys: [
    { name: 'question', weight: 2 },
    { name: 'answer', weight: 0.5 },
    { name: 'tags', weight: 1.5 }
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
  includeMatches: true
}
```

---

## 7. State Management

Üç Context yeterli:

```typescript
// ThemeContext
{ theme: 'light' | 'dark', toggle: () => void }

// FavoritesContext
{ ids: Set<string>, toggle: (id: string) => void, isFavorite: (id) => boolean }

// SearchContext
{ isOpen: boolean, query: string, open: () => void, close: () => void, setQuery: (q) => void }
```

Q&A verisi static JSON import — Context'e gerek yok.

### localStorage Anahtarları

| Anahtar | Değer |
|---|---|
| `qa-theme` | `"light"` veya `"dark"` |
| `qa-favorites` | `string[]` JSON (Q&A id'leri) |

İlk yüklemede:
- Tema → `localStorage` yoksa `window.matchMedia('(prefers-color-scheme: dark)')` ile sistem tercihi
- Favoriler → boş array fallback
- Geçersiz favori ID'leri (silinmiş Q&A) sessizce temizlenir

---

## 8. Build & Çalıştırma

### `package.json` Scripts

```json
{
  "predev":   "node scripts/build-data.mjs",
  "dev":      "vite",
  "prebuild": "node scripts/build-data.mjs",
  "build":    "tsc -b && vite build",
  "preview":  "vite preview",
  "parse":    "node scripts/build-data.mjs --verbose",
  "test":     "vitest run"
}
```

### Komutlar

```bash
npm install              # ilk kurulum
npm run dev              # localhost:5173 — HMR ile geliştirme
npm run build            # dist/ klasörü — production bundle
npm run preview          # build sonrası dist/'i sun
npm run parse            # sadece parse (mülakat öncesi içerik güncelleme)
npm run dev -- --host    # mobil erişim için LAN'da yayınla
```

### Dağıtım Senaryoları

1. **Yerel kullanım:** `npm run dev`
2. **Offline:** `npm run build` → `dist/`'i USB'ye al → `npx serve dist`
3. **Mobil erişim:** `npm run dev -- --host` → telefondan `http://<bilgisayar-ip>:5173`

---

## 9. Hata Yönetimi

| Senaryo | Davranış |
|---|---|
| `full_stack.txt` bulunamadı | Build fail + net hata mesajı |
| Parse'da belirsiz blok + overrides yok | Build fail, hatalı blok konsola |
| `qa.json` yok (dev'de) | Fallback ekran: "npm run parse çalıştırın" |
| Arama sonucu 0 | "Sonuç bulunamadı. Anahtar kelimeyi değiştir." |
| localStorage erişimi yok (private mode) | In-memory fallback, sessizce |
| Geçersiz favori ID | Sessizce localStorage'dan temizle |

---

## 10. Test Stratejisi

**Minimum ama anlamlı kapsam:**

- `parse.test.ts` — Frontend ve Backend'den beklenen sayıda Q&A çıkıyor (snapshot)
- `useFavorites.test.ts` — toggle, persistence, geçersiz ID temizliği
- `useSearch.test.ts` — typo toleransı ("closre" → "closure" bulur)

UI bileşenleri için integration test **yok** (küçük araç, manuel smoke yeterli):

1. Dev server → ana ekran açılıyor
2. Ctrl+K → arama çalışıyor
3. Favoriye al → yenile → favorilerde duruyor
4. Tema toggle → renkler değişiyor
5. Mobile viewport (DevTools) → drawer açılıyor

---

## 11. Performans Bütçesi

| Metrik | Hedef |
|---|---|
| Initial bundle (gzip) | < 150 KB |
| First paint (yerel) | < 1s |
| Arama yanıt | < 50ms |
| Tema toggle | < 16ms |

**Shiki optimizasyonu:** Tüm grammarlar ~2MB. Sadece `java`, `javascript`, `typescript`, `sql` lazy yüklenir → ~200KB.

---

## 12. Kapsam Dışı (YAGNI)

Mimari müsait, ama bu spec'in parçası değil:

- ❌ Quiz/flashcard modu (cevap gizli, açmak için tıkla)
- ❌ Cevap düzenleme arayüzü (in-app markdown editor)
- ❌ Birden fazla dil (TR/EN)
- ❌ Cloud sync (sadece localStorage)
- ❌ Çoklu kullanıcı / auth

---

## 13. Implementasyon Sırası (Önerilen)

1. Proje iskelet (Vite + React + TS + Tailwind kurulumu)
2. `parse.mjs` — frontend bölümü için
3. `parse.mjs` — backend bölümü için (pattern-based) + overrides.json desteği
4. TypeScript tipleri (`src/types/qa.ts`)
5. Context'ler (Theme, Favorites, Search)
6. Sidebar + TopBar
7. QACard + CodeBlock (Shiki entegrasyonu)
8. SearchModal + Fuse.js + klavye kısayolları
9. Favoriler sekmesi
10. Responsive (mobile drawer)
11. Test'ler
12. Smoke test + son rötuşlar
