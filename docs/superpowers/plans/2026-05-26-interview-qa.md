# Interview QA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mülakat sırasında Frontend + Backend soru-cevap içeriğine tek noktadan hızla ulaşılabilen yerel responsive web uygulaması.

**Architecture:** Vite + React + TypeScript ile statik bir SPA. Kaynak `full_stack.txt` build-time'da `qa.json`'a parse edilir. Fuse.js fuzzy arama, Shiki syntax highlight, Tailwind responsive UI. State: 3 React Context + localStorage. Hiç backend yok — tamamen client-side.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Fuse.js, Shiki, lucide-react, Vitest

**Spec:** [`docs/superpowers/specs/2026-05-26-interview-qa-design.md`](../specs/2026-05-26-interview-qa-design.md)

**Çalışma Dizini:** Tüm komutlar `C:\Users\Pc\Desktop\interview\` altında çalıştırılır. Plan dosyası bu dizinde `docs/` altında.

---

## Task 1: Proje İskeleti ve Bağımlılıklar

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `.gitignore`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`

- [ ] **Step 1: Git repo başlat**

Run:
```powershell
cd C:\Users\Pc\Desktop\interview
git init
git add docs
git commit -m "chore: add design spec and plan"
```

- [ ] **Step 2: package.json oluştur**

Create `package.json`:
```json
{
  "name": "interview-qa",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "predev": "node scripts/build-data.mjs",
    "dev": "vite",
    "prebuild": "node scripts/build-data.mjs",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "parse": "node scripts/build-data.mjs --verbose",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "fuse.js": "^7.0.0",
    "shiki": "^1.22.0",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "tailwindcss": "^3.4.14",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "vitest": "^2.1.4"
  }
}
```

- [ ] **Step 3: Bağımlılıkları kur**

Run: `npm install`
Expected: `node_modules/` oluşur, herhangi bir error yok.

- [ ] **Step 4: vite.config.ts**

Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  test: {
    environment: 'jsdom',
    globals: true
  }
});
```

- [ ] **Step 5: tsconfig.json**

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "tests"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 6: Tailwind config + PostCSS**

Create `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: []
};
```

Create `postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

- [ ] **Step 7: index.html ve giriş dosyaları**

Create `index.html`:
```html
<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Interview QA</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  </head>
  <body class="bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root {
  height: 100%;
}
body {
  font-family: 'Inter', system-ui, sans-serif;
}
code, pre {
  font-family: 'JetBrains Mono', monospace;
}
```

Create `src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `src/App.tsx` (geçici iskelet, sonraki task'larda doldurulacak):
```tsx
export default function App() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Interview QA — kurulum tamam</h1>
    </div>
  );
}
```

- [ ] **Step 8: .gitignore**

Create `.gitignore`:
```
node_modules
dist
.DS_Store
*.log
src/data/qa.json
```

- [ ] **Step 9: Geçici qa.json placeholder**

`src/data/qa.json`'ı geçici olarak oluştur (parser henüz yok):

Run:
```powershell
New-Item -ItemType Directory -Force -Path src\data | Out-Null
'{"categories":[]}' | Out-File -Encoding utf8 src\data\qa.json
```

- [ ] **Step 10: predev hook'u geçici devre dışı**

Step 1'deki `package.json`'da `"predev"` ve `"prebuild"` script'leri var. Henüz `scripts/build-data.mjs` yok. Bunlar Task 2'de gelecek. Şimdilik dev'i test etmek için geçici olarak `predev`'i kaldır:

Edit `package.json`, `"predev"` ve `"prebuild"` satırlarını sil. Task 6'da geri ekleyeceğiz.

- [ ] **Step 11: Dev server'ı test et**

Run: `npm run dev`
Expected: `http://localhost:5173` açılır, "Interview QA — kurulum tamam" yazısı görünür. Ctrl+C ile kapat.

- [ ] **Step 12: Commit**

Run:
```powershell
git add .
git commit -m "feat: scaffold Vite + React + TS + Tailwind project"
```

---

## Task 2: Parse Script — Frontend Bölümü (TDD)

**Files:**
- Create: `scripts/build-data.mjs`
- Create: `tests/parse.test.ts`
- Modify: `package.json` (vitest config zaten var)

Frontend bölümü düzgün satır-bazlı, boş satır = ayraç. Yapı: kategori (FRONTEND) > alt-kategori > soru / cevap çiftleri.

- [ ] **Step 1: Failing test yaz — Frontend kategori sayısı**

Create `tests/parse.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { parseDocument } from '../scripts/build-data.mjs';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync('C:/Users/Pc/Desktop/full_stack.txt', 'utf-8');

describe('parseDocument — Frontend', () => {
  it('returns a frontend category with 3 subcategories', () => {
    const result = parseDocument(SOURCE);
    const frontend = result.categories.find((c) => c.id === 'frontend');
    expect(frontend).toBeDefined();
    expect(frontend!.title).toBe('Frontend');
    expect(frontend!.subcategories.map((s) => s.title)).toEqual([
      'JavaScript Temelleri ve Mimari',
      'React Mimarisi ve Ekosistemi',
      'En İyi Pratikler ve Proje Mimarisi'
    ]);
  });

  it('JavaScript Temelleri has at least 9 Q&A items', () => {
    const result = parseDocument(SOURCE);
    const sub = result.categories
      .find((c) => c.id === 'frontend')!
      .subcategories.find((s) => s.title === 'JavaScript Temelleri ve Mimari');
    expect(sub!.items.length).toBeGreaterThanOrEqual(9);
  });

  it('finds the Closure Q&A with correct content', () => {
    const result = parseDocument(SOURCE);
    const allItems = result.categories.flatMap((c) =>
      c.subcategories.flatMap((s) => s.items)
    );
    const closure = allItems.find((i) => i.question.toLowerCase().includes('closure'));
    expect(closure).toBeDefined();
    expect(closure!.answer).toMatch(/lexical scope/i);
    expect(closure!.answer).toMatch(/Encapsulation/);
  });

  it('generates valid slug IDs (no spaces, lowercase, Turkish chars normalized)', () => {
    const result = parseDocument(SOURCE);
    const allItems = result.categories.flatMap((c) =>
      c.subcategories.flatMap((s) => s.items)
    );
    for (const item of allItems) {
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
```

- [ ] **Step 2: Test'i çalıştır — fail beklenir**

Run: `npm test`
Expected: FAIL — `parseDocument is not a function` veya `scripts/build-data.mjs` import edilemiyor.

- [ ] **Step 3: parseDocument'ın frontend bölümünü implement et**

Create `scripts/build-data.mjs`:
```javascript
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Known subcategory titles — used as section markers
const FRONTEND_SUBCATEGORIES = [
  'JavaScript Temelleri ve Mimari',
  'React Mimarisi ve Ekosistemi',
  'En İyi Pratikler ve Proje Mimarisi'
];

/**
 * Türkçe karakterleri normalize edip URL-safe slug üretir.
 */
export function slugify(text) {
  const map = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
                'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'I': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
  return text
    .split('').map((ch) => map[ch] ?? ch).join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/**
 * Frontend bölümünü boş satır ayracıyla parse eder.
 * Her satırın ilk satırı = soru, sonraki satırlar (boş satıra kadar) = cevap.
 */
function parseFrontend(text) {
  const lines = text.split('\n');
  const subcategories = [];
  let currentSub = null;
  let currentBlock = [];

  const flushBlock = () => {
    if (!currentSub || currentBlock.length === 0) {
      currentBlock = [];
      return;
    }
    const question = currentBlock[0].trim();
    const answer = currentBlock.slice(1).join('\n').trim();
    if (question && answer) {
      currentSub.items.push({
        id: slugify(question),
        question,
        answer,
        tags: []
      });
    }
    currentBlock = [];
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');

    if (FRONTEND_SUBCATEGORIES.includes(line.trim())) {
      flushBlock();
      currentSub = { id: slugify(line), title: line.trim(), items: [] };
      subcategories.push(currentSub);
      continue;
    }

    if (line.trim() === '') {
      flushBlock();
      continue;
    }

    currentBlock.push(line);
  }
  flushBlock();

  return subcategories;
}

export function parseDocument(source) {
  // FRONTEND ve BACKEND markerlarıyla ikiye böl
  const frontendMatch = source.match(/^FRONTEND\s*\n([\s\S]*?)(?=^BACKEND\s*$|\Z)/m);
  if (!frontendMatch) {
    throw new Error('FRONTEND marker bulunamadı');
  }
  const frontendText = frontendMatch[1];

  const frontendSubs = parseFrontend(frontendText);

  return {
    categories: [
      { id: 'frontend', title: 'Frontend', subcategories: frontendSubs }
      // backend Task 3'te eklenecek
    ]
  };
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  const verbose = process.argv.includes('--verbose');
  const SRC = 'C:/Users/Pc/Desktop/full_stack.txt';
  const text = readFileSync(SRC, 'utf-8');
  const data = parseDocument(text);
  const outPath = resolve(__dirname, '..', 'src', 'data', 'qa.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');

  if (verbose) {
    console.log('✓ Parsed:');
    for (const cat of data.categories) {
      console.log(`  ${cat.title}`);
      for (const sub of cat.subcategories) {
        console.log(`    ├ ${sub.title}: ${sub.items.length} Q&A`);
      }
    }
  }
  console.log(`✓ Yazıldı: ${outPath}`);
}
```

- [ ] **Step 4: Test'i çalıştır — geçmesi beklenir**

Run: `npm test`
Expected: PASS — 4 test geçer. Eğer hata varsa: regex'i, slugify'ı veya FRONTEND_SUBCATEGORIES listesini kontrol et.

- [ ] **Step 5: Parser'ı manuel çalıştır ve çıktıyı gör**

Run: `npm run parse`
Expected: `src/data/qa.json` oluşur. Konsolda subcategory başına Q&A sayısı listelenir.

`src/data/qa.json` dosyasının ilk birkaç entry'sini kontrol et — JS Temelleri'nde Closure, Promise, IIFE gibi başlıklar görünmeli.

- [ ] **Step 6: Commit**

Run:
```powershell
git add scripts/build-data.mjs tests/parse.test.ts
git commit -m "feat(parse): parse frontend section with TDD"
```

---

## Task 3: Parse Script — Backend Bölümü

**Files:**
- Modify: `scripts/build-data.mjs`
- Modify: `tests/parse.test.ts`

Backend bölümü tek satırda sıkıştırılmış. Strateji: bilinen alt-kategori başlıkları ve soru başlıkları sözlüğü ile split.

- [ ] **Step 1: Failing test yaz — Backend kategori**

Edit `tests/parse.test.ts`, dosyanın sonuna ekle:
```typescript
describe('parseDocument — Backend', () => {
  it('returns a backend category with 5 subcategories', () => {
    const result = parseDocument(SOURCE);
    const backend = result.categories.find((c) => c.id === 'backend');
    expect(backend).toBeDefined();
    expect(backend!.title).toBe('Backend');
    expect(backend!.subcategories.length).toBe(5);
  });

  it('finds Spring Framework subcategory with @Autowired Q&A', () => {
    const result = parseDocument(SOURCE);
    const spring = result.categories
      .find((c) => c.id === 'backend')!
      .subcategories.find((s) => s.title.includes('Spring Framework'));
    expect(spring).toBeDefined();
    const autowired = spring!.items.find((i) => i.question.includes('@Autowired'));
    expect(autowired).toBeDefined();
    expect(autowired!.answer).toMatch(/Dependency Injection/i);
  });

  it('finds SQL HAVING Q&A in SQL subcategory', () => {
    const result = parseDocument(SOURCE);
    const sql = result.categories
      .find((c) => c.id === 'backend')!
      .subcategories.find((s) => s.title.includes('SQL'));
    const having = sql!.items.find((i) => i.question.toLowerCase().includes('having'));
    expect(having).toBeDefined();
    expect(having!.answer).toMatch(/GROUP BY/);
  });
});
```

- [ ] **Step 2: Test'i çalıştır — fail beklenir**

Run: `npm test`
Expected: FAIL — backend kategori bulunamadı.

- [ ] **Step 3: Backend parser'ı implement et**

Edit `scripts/build-data.mjs`, `parseFrontend` fonksiyonunun ALTINA ekle:

```javascript
// Bilinen backend alt-kategori başlıkları (numara prefix'i ile başlar)
const BACKEND_SUBCATEGORIES = [
  '1. Java Core ve Temel Kavramlar',
  '2. Spring Framework ve Mikroservisler',
  '3. SQL ve Veritabanı',
  '4. Veri Yapıları ve Algoritmalar',
  '5. Yazılım Mühendisliği ve Metodolojiler'
];

// Bilinen soru başlıkları — split point olarak kullanılır.
// SIRA ÖNEMLİ: uzun olanlar önce gelmeli (kısa olanın substring'i olabilir).
const BACKEND_QUESTIONS = {
  '1. Java Core ve Temel Kavramlar': [
    'Integer ve int farkı:',
    'Java HashMap ve List farkı:',
    'HashMap ve List Eleman Ekleme/Çıkarma Metotları:',
    'Final ve Finally farkı:',
    'Metot Overloading (Aşırı Yükleme) nedir?',
    'Bir class birden fazla class\'ı extend edebilir mi?',
    'Static ve Normal fonksiyon nasıl çağrılır?',
    'String, StringBuilder, StringBuffer farkları:',
    '.java ve .class farkı nedir?',
    '.jar, .war, .ear farkı ve ne oldukları:'
  ],
  '2. Spring Framework ve Mikroservisler': [
    '@Autowired nedir?',
    'Entity ve Repository nedir?',
    'Service Registry nedir?',
    'Merkezi loglama nasıl yapılır? (Interceptor, AOP)',
    'Aspect Oriented Programming (AOP) nedir?',
    'Spring Core Genel:',
    'Transaction nedir? Anotasyon hangi parametreleri alır?',
    'Resilience4j:',
    'Zipkin:',
    'Grafana:',
    'Mikroservis Design Patternleri Nelerdir?',
    'Saga Pattern nedir?',
    'CQRS (Command Query Responsibility Segregation) nedir?'
  ],
  '3. SQL ve Veritabanı': [
    'HAVING nedir?',
    'JOIN ve UNION nedir?',
    'SQL Normalizasyon Adımları:'
  ],
  '4. Veri Yapıları ve Algoritmalar': [
    'Queue ve Stack farkı nedir?',
    '$O(n)$ ve $O(n^2)$ nedir?',
    'Stream nedir ve metotları nelerdir?',
    'Algoritma Sorusu: boolean isSortedasc(int[] arr)'
  ],
  '5. Yazılım Mühendisliği ve Metodolojiler': [
    'OOP (Object Oriented Programming - Nesne Yönelimli Programlama):',
    'SOLID:',
    'Strategy Pattern nedir?',
    'UML (Unified Modeling Language) nedir?',
    'Git kullandın mı? Merge nedir?',
    'Agile nedir, Scrum nedir, kullandınız mı?'
  ]
};

/**
 * Bir metin içinde verilen literal substring'in pozisyonlarını bulur.
 * Birden fazla geçiyorsa hepsini döner.
 */
function findOccurrences(haystack, needle) {
  const positions = [];
  let idx = 0;
  while ((idx = haystack.indexOf(needle, idx)) !== -1) {
    positions.push(idx);
    idx += needle.length;
  }
  return positions;
}

/**
 * Backend bölümünü bilinen başlıklarla parçalara böler.
 * 1. Önce alt-kategori başlıklarını bul.
 * 2. Her alt-kategori içinde bilinen soruları split point olarak kullan.
 */
function parseBackend(text) {
  // 1. Adım: tüm satırları tek bir string'e indir (newline'lar saklı)
  const flat = text.replace(/\r/g, '');

  // Alt-kategori split noktalarını bul
  const subSplits = BACKEND_SUBCATEGORIES.map((title) => {
    const pos = flat.indexOf(title);
    if (pos === -1) throw new Error(`Backend subcategory bulunamadı: ${title}`);
    return { title, pos };
  }).sort((a, b) => a.pos - b.pos);

  const subcategories = [];

  for (let i = 0; i < subSplits.length; i++) {
    const { title, pos } = subSplits[i];
    const end = i + 1 < subSplits.length ? subSplits[i + 1].pos : flat.length;
    const subText = flat.slice(pos + title.length, end);

    const questions = BACKEND_QUESTIONS[title] || [];
    // Sorular için split noktalarını bul, position'a göre sırala
    const qSplits = [];
    for (const q of questions) {
      const positions = findOccurrences(subText, q);
      if (positions.length === 0) {
        console.warn(`⚠ Soru bulunamadı (${title}): "${q.slice(0, 50)}..."`);
        continue;
      }
      // Sadece ilk geçişi al
      qSplits.push({ question: q, pos: positions[0] });
    }
    qSplits.sort((a, b) => a.pos - b.pos);

    const items = [];
    for (let j = 0; j < qSplits.length; j++) {
      const { question, pos: qPos } = qSplits[j];
      const qEnd = j + 1 < qSplits.length ? qSplits[j + 1].pos : subText.length;
      const answer = subText.slice(qPos + question.length, qEnd).trim();
      items.push({
        id: slugify(question),
        question: question.replace(/:$/, ''),
        answer,
        tags: []
      });
    }

    subcategories.push({
      id: slugify(title.replace(/^\d+\.\s*/, '')),
      title: title.replace(/^\d+\.\s*/, ''),
      items
    });
  }

  return subcategories;
}
```

Aynı dosyada `parseDocument` fonksiyonunu güncelle:
```javascript
export function parseDocument(source) {
  const frontendMatch = source.match(/^FRONTEND\s*\n([\s\S]*?)\n\s*BACKEND\b/m);
  if (!frontendMatch) {
    throw new Error('FRONTEND marker bulunamadı');
  }
  const backendMatch = source.match(/\bBACKEND\b([\s\S]*)$/);
  if (!backendMatch) {
    throw new Error('BACKEND marker bulunamadı');
  }

  const frontendText = frontendMatch[1];
  const backendText = backendMatch[1];

  return {
    categories: [
      { id: 'frontend', title: 'Frontend', subcategories: parseFrontend(frontendText) },
      { id: 'backend',  title: 'Backend',  subcategories: parseBackend(backendText) }
    ]
  };
}
```

- [ ] **Step 4: Test'i çalıştır — geçmesi beklenir**

Run: `npm test`
Expected: PASS — tüm 7 test geçer.

Hata varsa:
- `BACKEND_QUESTIONS` listesindeki başlıkların `full_stack.txt`'deki ile **birebir** eşleştiğinden emin ol (özellikle özel karakterler `'`, `(`, `)`)
- Bir başlık bulunamıyorsa `console.warn` çıktısını incele

- [ ] **Step 5: Parser'ı çalıştır ve verbose çıktıyı kontrol et**

Run: `npm run parse`
Expected: Console output:
```
✓ Parsed:
  Frontend
    ├ JavaScript Temelleri ve Mimari: 9 Q&A
    ├ React Mimarisi ve Ekosistemi: ... Q&A
    └ En İyi Pratikler ve Proje Mimarisi: 2 Q&A
  Backend
    ├ Java Core ve Temel Kavramlar: 10 Q&A
    ├ Spring Framework ve Mikroservisler: 13 Q&A
    ├ SQL ve Veritabanı: 3 Q&A
    ├ Veri Yapıları ve Algoritmalar: 4 Q&A
    └ Yazılım Mühendisliği ve Metodolojiler: 6 Q&A
✓ Yazıldı: ...
```

- [ ] **Step 6: Commit**

Run:
```powershell
git add scripts/build-data.mjs tests/parse.test.ts
git commit -m "feat(parse): parse backend section with pattern-based splitting"
```

---

## Task 4: Parse Script — Kod Blokları ve Overrides

**Files:**
- Modify: `scripts/build-data.mjs`
- Create: `scripts/overrides.json`

Java kod örnekleri (`isSortedasc`) düz metin halinde. Markdown fenced code (` ```java `) olarak sarmalayıp Shiki'ye verilebilir hale getir.

- [ ] **Step 1: Failing test yaz — kod bloğu sarmalama**

Edit `tests/parse.test.ts`, dosyanın sonuna ekle:
```typescript
describe('parseDocument — Kod Blokları ve Overrides', () => {
  it('wraps Java code in fenced markdown block', () => {
    const result = parseDocument(SOURCE);
    const allItems = result.categories.flatMap((c) =>
      c.subcategories.flatMap((s) => s.items)
    );
    const isSorted = allItems.find((i) => i.question.includes('isSortedasc'));
    expect(isSorted).toBeDefined();
    expect(isSorted!.answer).toContain('```java');
    expect(isSorted!.answer).toContain('public boolean isSortedasc');
    expect(isSorted!.answer).toContain('```\n');
  });

  it('applies tag overrides from overrides.json', () => {
    const result = parseDocument(SOURCE);
    const allItems = result.categories.flatMap((c) =>
      c.subcategories.flatMap((s) => s.items)
    );
    const closure = allItems.find((i) => i.question.toLowerCase().includes('closure'));
    expect(closure!.tags).toContain('scope');
    expect(closure!.tags).toContain('encapsulation');
  });
});
```

- [ ] **Step 2: overrides.json oluştur**

Create `scripts/overrides.json`:
```json
{
  "tagOverrides": {
    "closure-mantigi-nedir-avantaji-nedir": ["closure", "scope", "encapsulation", "lexical", "private"],
    "promise-yapisi-ve-kullanimi": ["promise", "async", "await", "then", "catch"],
    "event-loop-call-stack-ve-promise-iliskisi": ["event-loop", "async", "microtask", "callback"],
    "usestate-in-gelismis-alternatifidir": ["usereducer", "state", "hooks"],
    "autowired-nedir": ["spring", "di", "ioc", "dependency-injection"],
    "saga-pattern-nedir": ["saga", "microservice", "transaction", "distributed"],
    "cqrs-command-query-responsibility-segregation-nedir": ["cqrs", "command", "query", "architecture"]
  }
}
```

> Not: `tagOverrides` anahtarları slug'larla eşleşir. Mevcut slug'ları görmek için `npm run parse` sonrası `src/data/qa.json` içinden ID'leri kopyala.

- [ ] **Step 3: Kod bloğu sarmalama ve overrides yükleme implement et**

Edit `scripts/build-data.mjs`:

A) `parseBackend` fonksiyonunun **sonunda**, return etmeden önce items'leri post-process et. `parseBackend` fonksiyonunun **return subcategories** satırından ÖNCE şunu ekle:

```javascript
  // Java kod bloklarını fenced markdown olarak sarmala
  for (const sub of subcategories) {
    for (const item of sub.items) {
      item.answer = wrapJavaCode(item.answer);
    }
  }
```

Sonra dosyanın üst kısmına (`parseBackend`'in altına) ekle:

```javascript
/**
 * "public boolean ... { ... }" gibi Java kod bloklarını ```java ile sarmala.
 * Basit heuristik: "public", "private" + "{" pattern'i kod başlangıcı.
 */
function wrapJavaCode(answer) {
  // Java kod tespiti: "Java\npublic boolean ..." gibi pattern'ler
  const javaPattern = /(Java)?\s*(public\s+(?:boolean|int|void|String|static)\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?^\})/m;
  return answer.replace(javaPattern, (_match, _javaLabel, code) => {
    return '\n```java\n' + code.trim() + '\n```\n';
  });
}
```

B) Önce `scripts/build-data.mjs`'in EN ÜSTÜNDEKİ mevcut import statement'ını güncelle, `existsSync` ekle:

```javascript
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
```

Sonra `parseDocument` fonksiyonunun TANIMINDAN ÖNCE (helper fonksiyon olarak) bu iki fonksiyonu ekle:

```javascript
function loadOverrides() {
  const path = resolve(__dirname, 'overrides.json');
  if (!existsSync(path)) return { tagOverrides: {} };
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return { tagOverrides: {} };
  }
}

function applyOverrides(data, overrides) {
  for (const cat of data.categories) {
    for (const sub of cat.subcategories) {
      for (const item of sub.items) {
        if (overrides.tagOverrides?.[item.id]) {
          item.tags = overrides.tagOverrides[item.id];
        }
      }
    }
  }
  return data;
}
```

`parseDocument` fonksiyonunun en sonunda, return etmeden önce:
```javascript
  const data = {
    categories: [
      { id: 'frontend', title: 'Frontend', subcategories: parseFrontend(frontendText) },
      { id: 'backend',  title: 'Backend',  subcategories: parseBackend(backendText) }
    ]
  };
  return applyOverrides(data, loadOverrides());
```

(Önceki return statement'ını sil ve yukarıdakiyle değiştir.)

- [ ] **Step 4: Slug eşleşmesi için test'i kalibre et**

Run: `npm run parse`
Çıktıyı incele. `src/data/qa.json`'ı aç ve Closure Q&A'in **gerçek `id`** değerini bul. Eğer `overrides.json`'daki slug ile eşleşmiyorsa, `overrides.json`'u güncelle.

Örnek: ID `closure-mantigi-nedir-avantaji-nedir` ise zaten doğru. Eğer farklı bir slug üretildiyse, `overrides.json`'daki anahtarı güncelle.

- [ ] **Step 5: Test'i çalıştır — geçmesi beklenir**

Run: `npm test`
Expected: PASS — toplam 9 test geçer.

- [ ] **Step 6: Commit**

Run:
```powershell
git add scripts/build-data.mjs scripts/overrides.json tests/parse.test.ts
git commit -m "feat(parse): wrap Java code blocks and apply tag overrides"
```

---

## Task 5: TypeScript Veri Tipleri

**Files:**
- Create: `src/types/qa.ts`

- [ ] **Step 1: Tipleri yaz**

Create `src/types/qa.ts`:
```typescript
export type QAData = {
  categories: Category[];
};

export type Category = {
  id: string;
  title: string;
  subcategories: Subcategory[];
};

export type Subcategory = {
  id: string;
  title: string;
  items: QAItem[];
};

export type QAItem = {
  id: string;
  question: string;
  answer: string;
  tags?: string[];
};

export type FlatQAItem = QAItem & {
  categoryId: string;
  categoryTitle: string;
  subcategoryId: string;
  subcategoryTitle: string;
};
```

- [ ] **Step 2: TypeScript kontrol**

Run: `npx tsc --noEmit`
Expected: Hata yok.

- [ ] **Step 3: Commit**

Run:
```powershell
git add src/types/qa.ts
git commit -m "feat(types): add QA data types"
```

---

## Task 6: predev/prebuild Hook'unu Geri Aç + Data Loader

**Files:**
- Modify: `package.json`
- Create: `src/lib/loadData.ts`

- [ ] **Step 1: package.json'a predev ve prebuild geri ekle**

Edit `package.json`, scripts bölümünü güncelle:
```json
"scripts": {
  "predev": "node scripts/build-data.mjs",
  "dev": "vite",
  "prebuild": "node scripts/build-data.mjs",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "parse": "node scripts/build-data.mjs --verbose",
  "test": "vitest run"
}
```

- [ ] **Step 2: Data loader yaz**

Create `src/lib/loadData.ts`:
```typescript
import type { QAData, FlatQAItem } from '../types/qa';
import data from '../data/qa.json';

export const qaData: QAData = data as QAData;

export const flatItems: FlatQAItem[] = qaData.categories.flatMap((cat) =>
  cat.subcategories.flatMap((sub) =>
    sub.items.map((item) => ({
      ...item,
      categoryId: cat.id,
      categoryTitle: cat.title,
      subcategoryId: sub.id,
      subcategoryTitle: sub.title
    }))
  )
);

export function findItemById(id: string): FlatQAItem | undefined {
  return flatItems.find((i) => i.id === id);
}
```

- [ ] **Step 3: TypeScript kontrol**

Run: `npx tsc --noEmit`
Expected: Hata yok. JSON import resolveJsonModule sayesinde çalışmalı.

- [ ] **Step 4: Commit**

Run:
```powershell
git add package.json src/lib/loadData.ts
git commit -m "feat: add data loader and re-enable parse hooks"
```

---

## Task 7: useFavorites Hook (TDD)

**Files:**
- Create: `src/hooks/useFavorites.ts`
- Create: `tests/useFavorites.test.ts`

- [ ] **Step 1: Failing test yaz**

Create `tests/useFavorites.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '../src/hooks/useFavorites';

beforeEach(() => {
  localStorage.clear();
});

describe('useFavorites', () => {
  it('starts with empty set', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.ids.size).toBe(0);
  });

  it('toggles favorites and persists to localStorage', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.toggle('closure-1'));
    expect(result.current.isFavorite('closure-1')).toBe(true);
    expect(JSON.parse(localStorage.getItem('qa-favorites')!)).toContain('closure-1');

    act(() => result.current.toggle('closure-1'));
    expect(result.current.isFavorite('closure-1')).toBe(false);
  });

  it('loads existing favorites on mount', () => {
    localStorage.setItem('qa-favorites', JSON.stringify(['a', 'b']));
    const { result } = renderHook(() => useFavorites());
    expect(result.current.ids.has('a')).toBe(true);
    expect(result.current.ids.has('b')).toBe(true);
  });

  it('handles invalid localStorage gracefully', () => {
    localStorage.setItem('qa-favorites', 'not-json');
    const { result } = renderHook(() => useFavorites());
    expect(result.current.ids.size).toBe(0);
  });
});
```

- [ ] **Step 2: Test deps kur**

Run: `npm install -D @testing-library/react @testing-library/jest-dom jsdom`

- [ ] **Step 3: Test'i çalıştır — fail beklenir**

Run: `npm test`
Expected: FAIL — useFavorites bulunamadı.

- [ ] **Step 4: Hook'u implement et**

Create `src/hooks/useFavorites.ts`:
```typescript
import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'qa-favorites';

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x) => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

export function useFavorites() {
  const [ids, setIds] = useState<Set<string>>(() => load());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
    } catch {
      /* private mode — sessizce yut */
    }
  }, [ids]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => ids.has(id), [ids]);

  return { ids, toggle, isFavorite };
}
```

- [ ] **Step 5: Test'i çalıştır — geçmesi beklenir**

Run: `npm test`
Expected: PASS — useFavorites testleri geçer.

- [ ] **Step 6: Commit**

Run:
```powershell
git add src/hooks/useFavorites.ts tests/useFavorites.test.ts package.json package-lock.json
git commit -m "feat(hooks): add useFavorites with localStorage persistence"
```

---

## Task 8: useTheme Hook

**Files:**
- Create: `src/hooks/useTheme.ts`

- [ ] **Step 1: Hook'u yaz**

Create `src/hooks/useTheme.ts`:
```typescript
import { useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'qa-theme';

function getInitial(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* ignore */ }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => getInitial());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch { /* ignore */ }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggle };
}
```

- [ ] **Step 2: TypeScript kontrol**

Run: `npx tsc --noEmit`
Expected: Hata yok.

- [ ] **Step 3: Commit**

Run:
```powershell
git add src/hooks/useTheme.ts
git commit -m "feat(hooks): add useTheme with system preference detection"
```

---

## Task 9: useSearch Hook (Fuse.js) — TDD

**Files:**
- Create: `src/hooks/useSearch.ts`
- Create: `tests/useSearch.test.ts`

- [ ] **Step 1: Failing test yaz**

Create `tests/useSearch.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { createSearchIndex } from '../src/hooks/useSearch';
import type { FlatQAItem } from '../src/types/qa';

const items: FlatQAItem[] = [
  {
    id: '1', question: 'Closure Nedir?', answer: 'Lexical scope', tags: ['closure', 'scope'],
    categoryId: 'frontend', categoryTitle: 'Frontend',
    subcategoryId: 'js', subcategoryTitle: 'JS'
  },
  {
    id: '2', question: 'Promise Nedir?', answer: 'Async işlemler için', tags: ['async'],
    categoryId: 'frontend', categoryTitle: 'Frontend',
    subcategoryId: 'js', subcategoryTitle: 'JS'
  },
  {
    id: '3', question: '@Autowired nedir?', answer: 'Spring DI', tags: ['spring', 'di'],
    categoryId: 'backend', categoryTitle: 'Backend',
    subcategoryId: 'spring', subcategoryTitle: 'Spring'
  }
];

describe('createSearchIndex', () => {
  it('finds exact match', () => {
    const fuse = createSearchIndex(items);
    const results = fuse.search('closure');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.id).toBe('1');
  });

  it('tolerates typos', () => {
    const fuse = createSearchIndex(items);
    const results = fuse.search('closre'); // typo
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.id).toBe('1');
  });

  it('matches via tags', () => {
    const fuse = createSearchIndex(items);
    const results = fuse.search('async');
    expect(results.map((r) => r.item.id)).toContain('2');
  });

  it('returns empty for nonsense', () => {
    const fuse = createSearchIndex(items);
    const results = fuse.search('xyzqqq123');
    expect(results.length).toBe(0);
  });
});
```

- [ ] **Step 2: Test'i çalıştır — fail beklenir**

Run: `npm test`
Expected: FAIL — createSearchIndex bulunamadı.

- [ ] **Step 3: Hook'u implement et**

Create `src/hooks/useSearch.ts`:
```typescript
import { useMemo } from 'react';
import Fuse from 'fuse.js';
import type { FlatQAItem } from '../types/qa';

export function createSearchIndex(items: FlatQAItem[]): Fuse<FlatQAItem> {
  return new Fuse(items, {
    keys: [
      { name: 'question', weight: 2 },
      { name: 'answer', weight: 0.5 },
      { name: 'tags', weight: 1.5 }
    ],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeMatches: true
  });
}

export function useSearch(items: FlatQAItem[]) {
  return useMemo(() => createSearchIndex(items), [items]);
}
```

- [ ] **Step 4: Test'i çalıştır — geçmesi beklenir**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

Run:
```powershell
git add src/hooks/useSearch.ts tests/useSearch.test.ts
git commit -m "feat(hooks): add useSearch with Fuse.js fuzzy matching"
```

---

## Task 10: Context Provider'lar

**Files:**
- Create: `src/contexts/ThemeContext.tsx`
- Create: `src/contexts/FavoritesContext.tsx`
- Create: `src/contexts/SearchContext.tsx`

- [ ] **Step 1: ThemeContext**

Create `src/contexts/ThemeContext.tsx`:
```tsx
import { createContext, useContext, ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';

type ThemeContextValue = ReturnType<typeof useTheme>;
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useTheme();
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider');
  return ctx;
}
```

- [ ] **Step 2: FavoritesContext**

Create `src/contexts/FavoritesContext.tsx`:
```tsx
import { createContext, useContext, ReactNode } from 'react';
import { useFavorites } from '../hooks/useFavorites';

type FavoritesContextValue = ReturnType<typeof useFavorites>;
const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const value = useFavorites();
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavoritesContext() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavoritesContext must be used within FavoritesProvider');
  return ctx;
}
```

- [ ] **Step 3: SearchContext**

Create `src/contexts/SearchContext.tsx`:
```tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type SearchContextValue = {
  isOpen: boolean;
  query: string;
  open: () => void;
  close: () => void;
  setQuery: (q: string) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => { setIsOpen(false); setQuery(''); }, []);

  return (
    <SearchContext.Provider value={{ isOpen, query, open, close, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearchContext must be used within SearchProvider');
  return ctx;
}
```

- [ ] **Step 4: TypeScript kontrol**

Run: `npx tsc --noEmit`
Expected: Hata yok.

- [ ] **Step 5: Commit**

Run:
```powershell
git add src/contexts
git commit -m "feat(contexts): add Theme, Favorites, Search providers"
```

---

## Task 11: CodeBlock — Shiki Entegrasyonu

**Files:**
- Create: `src/components/CodeBlock.tsx`

Shiki ağır olabilir, sadece ihtiyaç duyulan dilleri yükle.

- [ ] **Step 1: CodeBlock component'i**

Create `src/components/CodeBlock.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';
import { useThemeContext } from '../contexts/ThemeContext';

type Props = {
  code: string;
  language?: string;
};

export function CodeBlock({ code, language = 'java' }: Props) {
  const { theme } = useThemeContext();
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    codeToHtml(code, {
      lang: language,
      theme: theme === 'dark' ? 'github-dark' : 'github-light'
    }).then((result) => {
      if (!cancelled) setHtml(result);
    }).catch(() => {
      if (!cancelled) setHtml(`<pre>${escapeHtml(code)}</pre>`);
    });
    return () => { cancelled = true; };
  }, [code, language, theme]);

  if (!html) {
    return (
      <pre className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="my-3 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]!));
}
```

- [ ] **Step 2: TypeScript kontrol**

Run: `npx tsc --noEmit`
Expected: Hata yok.

- [ ] **Step 3: Commit**

Run:
```powershell
git add src/components/CodeBlock.tsx
git commit -m "feat(components): add CodeBlock with Shiki highlighter"
```

---

## Task 12: QACard — Soru-Cevap Kartı

**Files:**
- Create: `src/components/QACard.tsx`
- Create: `src/lib/renderAnswer.tsx`

Cevap markdown formatında — kod blokları (```\`\`\`java```) Shiki ile, geri kalan paragraflar normal text. Tam markdown parser overkill; basit bir parser yeterli.

- [ ] **Step 1: Cevap render fonksiyonu**

Create `src/lib/renderAnswer.tsx`:
```tsx
import { CodeBlock } from '../components/CodeBlock';

/**
 * Cevap metnini paragraflar + fenced code bloklarına böler.
 * ```lang ... ``` formatını tanır, geri kalanı paragraf yapar.
 */
export function renderAnswer(answer: string) {
  const parts: React.ReactNode[] = [];
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(answer)) !== null) {
    if (match.index > lastIndex) {
      const text = answer.slice(lastIndex, match.index);
      parts.push(renderParagraphs(text, key++));
    }
    parts.push(
      <CodeBlock key={key++} code={match[2].trim()} language={match[1] || 'java'} />
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < answer.length) {
    parts.push(renderParagraphs(answer.slice(lastIndex), key++));
  }
  return parts;
}

function renderParagraphs(text: string, key: number) {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim() !== '');
  return (
    <div key={key} className="space-y-3">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line">
          {p.trim()}
        </p>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: QACard component'i**

Create `src/components/QACard.tsx`:
```tsx
import { Star } from 'lucide-react';
import { useFavoritesContext } from '../contexts/FavoritesContext';
import { renderAnswer } from '../lib/renderAnswer';
import type { FlatQAItem } from '../types/qa';

type Props = { item: FlatQAItem };

export function QACard({ item }: Props) {
  const { toggle, isFavorite } = useFavoritesContext();
  const fav = isFavorite(item.id);

  return (
    <article className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm">
      <div className="text-xs text-neutral-500 mb-2">
        {item.categoryTitle} › {item.subcategoryTitle}
      </div>

      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-xl font-semibold flex-1">{item.question}</h1>
        <button
          onClick={() => toggle(item.id)}
          aria-label={fav ? 'Favoriden çıkar' : 'Favoriye ekle'}
          className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <Star
            size={20}
            className={fav ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-400'}
          />
        </button>
      </div>

      <div>{renderAnswer(item.answer)}</div>

      {item.tags && item.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
```

- [ ] **Step 3: TypeScript kontrol**

Run: `npx tsc --noEmit`
Expected: Hata yok.

- [ ] **Step 4: Commit**

Run:
```powershell
git add src/components/QACard.tsx src/lib/renderAnswer.tsx
git commit -m "feat(components): add QACard with favorite toggle and code rendering"
```

---

## Task 13: Sidebar — Kategori Ağacı

**Files:**
- Create: `src/components/Sidebar.tsx`

- [ ] **Step 1: Sidebar component'i**

Create `src/components/Sidebar.tsx`:
```tsx
import { useState } from 'react';
import { ChevronDown, ChevronRight, Star } from 'lucide-react';
import { qaData } from '../lib/loadData';
import { useFavoritesContext } from '../contexts/FavoritesContext';

type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  view: 'qa' | 'favorites';
  onViewChange: (v: 'qa' | 'favorites') => void;
};

export function Sidebar({ selectedId, onSelect, view, onViewChange }: Props) {
  const { ids: favIds } = useFavoritesContext();
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(qaData.categories.map((c) => c.id))
  );

  const toggleCategory = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <nav className="w-full md:w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto h-full">
      <div className="p-4">
        <button
          onClick={() => onViewChange('favorites')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm font-medium mb-4 ${
            view === 'favorites'
              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Star size={16} className={view === 'favorites' ? 'fill-yellow-400 text-yellow-400' : ''} />
          Favoriler ({favIds.size})
        </button>

        {qaData.categories.map((cat) => (
          <div key={cat.id} className="mb-2">
            <button
              onClick={() => toggleCategory(cat.id)}
              className="w-full flex items-center gap-1 px-2 py-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              {expanded.has(cat.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {cat.title}
            </button>
            {expanded.has(cat.id) && (
              <div className="ml-2 mt-1">
                {cat.subcategories.map((sub) => (
                  <div key={sub.id} className="mb-2">
                    <div className="text-xs font-medium text-neutral-500 px-2 py-1">{sub.title}</div>
                    <ul>
                      {sub.items.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => { onViewChange('qa'); onSelect(item.id); }}
                            className={`w-full text-left text-sm px-3 py-1.5 rounded transition ${
                              view === 'qa' && selectedId === item.id
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                            }`}
                          >
                            {item.question}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: TypeScript kontrol**

Run: `npx tsc --noEmit`
Expected: Hata yok.

- [ ] **Step 3: Commit**

Run:
```powershell
git add src/components/Sidebar.tsx
git commit -m "feat(components): add Sidebar with collapsible categories"
```

---

## Task 14: TopBar + ThemeToggle

**Files:**
- Create: `src/components/TopBar.tsx`
- Create: `src/components/ThemeToggle.tsx`

- [ ] **Step 1: ThemeToggle**

Create `src/components/ThemeToggle.tsx`:
```tsx
import { Sun, Moon } from 'lucide-react';
import { useThemeContext } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggle } = useThemeContext();
  return (
    <button
      onClick={toggle}
      aria-label="Tema değiştir"
      className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
```

- [ ] **Step 2: TopBar**

Create `src/components/TopBar.tsx`:
```tsx
import { Search, Menu, BookOpen } from 'lucide-react';
import { useSearchContext } from '../contexts/SearchContext';
import { ThemeToggle } from './ThemeToggle';

type Props = { onMenuClick: () => void };

export function TopBar({ onMenuClick }: Props) {
  const { open } = useSearchContext();

  return (
    <header className="h-14 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-4 gap-4 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        aria-label="Menu"
        className="md:hidden p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2 font-semibold">
        <BookOpen size={20} className="text-blue-500" />
        <span>Interview QA</span>
      </div>

      <button
        onClick={open}
        className="flex-1 max-w-md mx-auto flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded text-sm text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
      >
        <Search size={16} />
        <span>Ara...</span>
        <kbd className="ml-auto text-xs px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-600">Ctrl+K</kbd>
      </button>

      <ThemeToggle />
    </header>
  );
}
```

- [ ] **Step 3: TypeScript kontrol**

Run: `npx tsc --noEmit`
Expected: Hata yok.

- [ ] **Step 4: Commit**

Run:
```powershell
git add src/components/TopBar.tsx src/components/ThemeToggle.tsx
git commit -m "feat(components): add TopBar with search button and theme toggle"
```

---

## Task 15: SearchModal — Fuzzy Arama + Klavye Navigasyonu

**Files:**
- Create: `src/components/SearchModal.tsx`

- [ ] **Step 1: SearchModal component'i**

Create `src/components/SearchModal.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useSearchContext } from '../contexts/SearchContext';
import { useSearch } from '../hooks/useSearch';
import { flatItems } from '../lib/loadData';
import type { FlatQAItem } from '../types/qa';

type Props = {
  onSelect: (id: string) => void;
};

export function SearchModal({ onSelect }: Props) {
  const { isOpen, query, close, setQuery } = useSearchContext();
  const fuse = useSearch(flatItems);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const results: FlatQAItem[] = query.trim().length >= 2
    ? fuse.search(query).slice(0, 15).map((r) => r.item)
    : [];

  useEffect(() => {
    if (isOpen) {
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { close(); }
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIdx]) {
      onSelect(results[activeIdx].id);
      close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" onClick={close}>
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <Search size={18} className="text-neutral-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ara... (en az 2 karakter)"
            className="flex-1 bg-transparent outline-none text-base"
          />
          <button onClick={close} aria-label="Kapat" className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 && query.trim().length >= 2 && (
            <div className="p-6 text-center text-sm text-neutral-500">Sonuç bulunamadı.</div>
          )}
          {results.map((item, i) => (
            <button
              key={item.id}
              onClick={() => { onSelect(item.id); close(); }}
              onMouseEnter={() => setActiveIdx(i)}
              className={`w-full text-left px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-b-0 ${
                i === activeIdx ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <div className="text-xs text-neutral-500 mb-1">
                {item.categoryTitle} › {item.subcategoryTitle}
              </div>
              <div className="font-medium text-sm">{item.question}</div>
            </button>
          ))}
        </div>

        <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 flex justify-between">
          <span>{results.length} sonuç</span>
          <span>↑↓ gez • Enter aç • Esc kapat</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript kontrol**

Run: `npx tsc --noEmit`
Expected: Hata yok.

- [ ] **Step 3: Commit**

Run:
```powershell
git add src/components/SearchModal.tsx
git commit -m "feat(components): add SearchModal with keyboard navigation"
```

---

## Task 16: Welcome ve Favorites Görünümleri

**Files:**
- Create: `src/components/Welcome.tsx`
- Create: `src/components/FavoritesView.tsx`

- [ ] **Step 1: Welcome ekranı**

Create `src/components/Welcome.tsx`:
```tsx
import { Search, BookOpen, Star } from 'lucide-react';
import { flatItems, qaData } from '../lib/loadData';
import { useSearchContext } from '../contexts/SearchContext';

type Props = {
  onBrowse: () => void;
  onFavorites: () => void;
};

export function Welcome({ onBrowse, onFavorites }: Props) {
  const { open } = useSearchContext();
  const totalQA = flatItems.length;
  const totalSubs = qaData.categories.reduce((sum, c) => sum + c.subcategories.length, 0);

  return (
    <div className="max-w-2xl mx-auto py-16 px-6 text-center">
      <BookOpen size={48} className="mx-auto text-blue-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Mülakat Bilgi Tabanı</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8">
        {totalQA} soru • {totalSubs} alt-kategori
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={open}
          className="flex flex-col items-center gap-2 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
        >
          <Search size={24} className="text-blue-500" />
          <div className="font-semibold">Ara</div>
          <div className="text-xs text-neutral-500">Ctrl+K</div>
        </button>

        <button
          onClick={onBrowse}
          className="flex flex-col items-center gap-2 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
        >
          <BookOpen size={24} className="text-blue-500" />
          <div className="font-semibold">Kategorilere Göz At</div>
          <div className="text-xs text-neutral-500">Soldaki menü</div>
        </button>

        <button
          onClick={onFavorites}
          className="flex flex-col items-center gap-2 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition"
        >
          <Star size={24} className="text-yellow-500" />
          <div className="font-semibold">Favorilerim</div>
          <div className="text-xs text-neutral-500">İşaretlenmiş sorular</div>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: FavoritesView**

Create `src/components/FavoritesView.tsx`:
```tsx
import { Star } from 'lucide-react';
import { useFavoritesContext } from '../contexts/FavoritesContext';
import { flatItems } from '../lib/loadData';

type Props = { onSelect: (id: string) => void };

export function FavoritesView({ onSelect }: Props) {
  const { ids } = useFavoritesContext();
  const items = flatItems.filter((i) => ids.has(i.id));

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center">
        <Star size={48} className="mx-auto text-neutral-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Henüz favorin yok</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Bir soruyu favorilere eklemek için sağ üstündeki yıldıza tıkla.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Star className="fill-yellow-400 text-yellow-400" />
        Favoriler ({items.length})
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="text-left p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
          >
            <div className="text-xs text-neutral-500 mb-1">
              {item.categoryTitle} › {item.subcategoryTitle}
            </div>
            <div className="font-medium">{item.question}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: TypeScript kontrol**

Run: `npx tsc --noEmit`
Expected: Hata yok.

- [ ] **Step 4: Commit**

Run:
```powershell
git add src/components/Welcome.tsx src/components/FavoritesView.tsx
git commit -m "feat(components): add Welcome and FavoritesView screens"
```

---

## Task 17: App Composition — Her Şeyi Birleştir

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: App.tsx'i tam halini yaz**

Replace contents of `src/App.tsx`:
```tsx
import { useState, useEffect } from 'react';
import { ThemeProvider, useThemeContext } from './contexts/ThemeContext';
import { FavoritesProvider, useFavoritesContext } from './contexts/FavoritesContext';
import { SearchProvider, useSearchContext } from './contexts/SearchContext';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { SearchModal } from './components/SearchModal';
import { QACard } from './components/QACard';
import { Welcome } from './components/Welcome';
import { FavoritesView } from './components/FavoritesView';
import { findItemById } from './lib/loadData';

type View = 'welcome' | 'qa' | 'favorites';

function AppInner() {
  const [view, setView] = useState<View>('welcome');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { open: openSearch } = useSearchContext();
  const { toggle: toggleFav } = useFavoritesContext();
  const { toggle: toggleTheme } = useThemeContext();

  // Global klavye kısayolları
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      } else if (!isInput && e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      } else if (!isInput && e.key.toLowerCase() === 'f' && view === 'qa' && selectedId) {
        toggleFav(selectedId);
      } else if (!isInput && e.key.toLowerCase() === 't') {
        toggleTheme();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openSearch, toggleFav, toggleTheme, view, selectedId, sidebarOpen]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setView('qa');
    setSidebarOpen(false);
    sessionStorage.setItem('qa-last-viewed', id);
  };

  const handleBrowse = () => {
    const last = sessionStorage.getItem('qa-last-viewed');
    if (last && findItemById(last)) {
      handleSelect(last);
    } else {
      setSidebarOpen(true);
    }
  };

  const selected = selectedId ? findItemById(selectedId) : null;

  return (
    <div className="h-full flex flex-col">
      <TopBar onMenuClick={() => setSidebarOpen((o) => !o)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — mobile drawer + desktop static */}
        <div
          className={`fixed md:static inset-y-0 left-0 z-40 transition-transform md:transform-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <Sidebar
            selectedId={selectedId}
            onSelect={handleSelect}
            view={view === 'favorites' ? 'favorites' : 'qa'}
            onViewChange={(v) => { setView(v); setSidebarOpen(false); }}
          />
        </div>

        {/* Backdrop (mobile) */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto">
          {view === 'welcome' && (
            <Welcome
              onBrowse={handleBrowse}
              onFavorites={() => setView('favorites')}
            />
          )}
          {view === 'favorites' && (
            <FavoritesView onSelect={handleSelect} />
          )}
          {view === 'qa' && selected && (
            <div className="max-w-4xl mx-auto p-6">
              <QACard item={selected} />
            </div>
          )}
          {view === 'qa' && !selected && (
            <div className="p-6 text-center text-neutral-500">
              Soldaki menüden bir soru seç veya Ctrl+K ile ara.
            </div>
          )}
        </main>
      </div>

      <SearchModal onSelect={handleSelect} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <SearchProvider>
          <AppInner />
        </SearchProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 2: Dev server başlat ve test et**

Run: `npm run dev`
Expected: `http://localhost:5173` açılır. Welcome ekranı görünür.

Manuel test:
1. Welcome ekranında 3 buton görünüyor mu? ✓
2. "Ara" butonuna tıkla → SearchModal açılır mı? ✓
3. Modal'da "closure" yaz → sonuçlar listeleniyor mu? ✓
4. Bir sonuca tıkla → QACard görünür mü? ✓
5. Sol sidebar'da kategori ağacı görünüyor mu? ✓
6. Bir Q&A'in yıldızına tıkla → favori oluyor mu? ✓
7. Sidebar'daki "Favoriler" linkine tıkla → grid görünüm gelir mi? ✓
8. Sağ üstte tema toggle çalışıyor mu? ✓
9. Ctrl+K çalışıyor mu? ✓

Ctrl+C ile dev server'ı kapat.

- [ ] **Step 3: Commit**

Run:
```powershell
git add src/App.tsx
git commit -m "feat: wire up App with routing, providers, and keyboard shortcuts"
```

---

## Task 18: Mobile Responsive — Sidebar Drawer + Search Modal

**Files:**
- Modify: `src/App.tsx` (kısmen Task 17'de hallolmuştu)
- Modify: `src/components/Sidebar.tsx` (responsive genişlik)

Task 17'de sidebar drawer mantığı zaten eklendi. Bu task'ta DevTools mobile viewport'unda test et ve eksik responsive davranışları düzelt.

- [ ] **Step 1: Manuel mobile testi**

Run: `npm run dev`

Chrome DevTools → Device Toolbar (Ctrl+Shift+M) → iPhone 12 Pro seç.

Kontrol et:
- TopBar'da hamburger ikonu görünüyor mu? ✓
- Hamburger'a tıkla → sidebar drawer slide-in geliyor mu? ✓
- Drawer dışında bir yere tıkla → kapanıyor mu? ✓
- Welcome ekranında 3 buton tek sütunda mı (md:grid-cols-3 olduğu için)? ✓
- SearchModal full ekrana yakın mı, kullanılabilir mi? ✓
- QACard içeriği overflow olmadan görünüyor mu? ✓

- [ ] **Step 2: Eksik responsive davranışlar (varsa düzelt)**

Bu adım sadece test sırasında bulunan sorunlar içindir. Tipik düzeltmeler:

A) Sidebar'ın varsayılan görünmemesi (mobile) için, Sidebar'ı saran wrapper'ı kontrol et — App.tsx'de zaten `fixed md:static` var.

B) Eğer QACard'da kod blokları taşıyorsa, `CodeBlock.tsx`'deki `[&_pre]:overflow-x-auto` yeterli olmalı.

C) TopBar'daki arama butonu mobilde çok dar görünüyorsa, `max-w-md`'i `max-w-xs` yap:

```tsx
className="flex-1 max-w-xs sm:max-w-md mx-auto ..."
```

- [ ] **Step 3: Commit (varsa)**

```powershell
git add -A
git diff --cached
# eğer değişiklik varsa:
git commit -m "fix: refine mobile responsive behavior"
# yoksa atla
```

---

## Task 19: Build ve Production Smoke Test

**Files:**
- Modify: `vite.config.ts` (base path varsa)

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: `dist/` klasörü oluşur. Konsol output:
```
✓ qa.json yazıldı
vite v5.x.x building for production...
✓ X modules transformed.
dist/index.html ...
dist/assets/index-...js ...
✓ built in ...ms
```

Eğer TypeScript hatası varsa, ilgili dosyayı düzelt ve tekrar build'le.

- [ ] **Step 2: Production bundle'ı önizle**

Run: `npm run preview`
Expected: `http://localhost:4173` açılır. Tam dev'deki gibi çalışmalı.

Tüm akışları bir kez daha kontrol et:
- Ctrl+K → arama
- Kategoriye tıkla → Q&A açılır
- Favori ekle → yenile → favori duruyor
- Tema değiştir → yenile → tema duruyor

- [ ] **Step 3: Bundle boyutu kontrolü**

`dist/` içindeki `index-*.js` dosyasının boyutuna bak (gzip):

Run:
```powershell
Get-ChildItem dist/assets -Filter "*.js" | ForEach-Object { "{0}: {1:N0} bytes" -f $_.Name, $_.Length }
```

Expected: Ana bundle ~150-300 KB (gzip değil). Eğer çok büyükse Shiki dynamic import yapılabilir, ama 1MB altında ise kabul edilebilir.

- [ ] **Step 4: Commit**

```powershell
git add -A
git diff --cached
# değişiklik varsa commit
git commit -m "chore: production build verified"
```

---

## Task 20: README ve Son Rötuşlar

**Files:**
- Create: `README.md`

- [ ] **Step 1: README yaz**

Create `README.md`:
```markdown
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
| `Ctrl+K` | Arama modalı aç |
| `Esc` | Modalı kapat |
| `↑` `↓` | Arama sonuçlarında gezin |
| `Enter` | Seçili sonuca git |
| `F` | Açık Q&A'i favoriye toggle |

## Yapı

- `scripts/build-data.mjs` — txt → JSON parser
- `scripts/overrides.json` — parse hatalarını manuel düzeltmek için
- `src/` — React uygulama kaynağı

## Tasarım Dokümanı

[`docs/superpowers/specs/2026-05-26-interview-qa-design.md`](docs/superpowers/specs/2026-05-26-interview-qa-design.md)
```

- [ ] **Step 2: Final test'leri çalıştır**

Run: `npm test`
Expected: Tüm testler geçer.

- [ ] **Step 3: Commit**

```powershell
git add README.md
git commit -m "docs: add README with usage instructions"
```

- [ ] **Step 4: Final smoke test**

Run: `npm run dev`

Son kez **tüm akışı** kontrol et:
1. Welcome ekranı açılıyor
2. "Ara" → Ctrl+K modal → "promise" → ilk sonuca tıkla → QACard
3. Yıldıza tıkla → Sidebar'da Favoriler (1) yazıyor
4. Sidebar > Favoriler → kart-grid görünüm
5. Tema değiştir, sayfayı yenile → tema duruyor
6. Mobile viewport: hamburger → sidebar drawer açılıyor
7. Backend > Spring > @Autowired → kod bloğu syntax highlight'lı görünüyor (varsa)

Sorun yoksa **bitti.**

```powershell
git status
```
Hiç untracked dosya kalmamalı (qa.json hariç, o .gitignore'da).

---

## Tamamlama Kontrol Listesi

Plan bittikten sonra:
- [ ] Tüm testler yeşil (`npm test`)
- [ ] `npm run dev` çalışıyor
- [ ] `npm run build` hatasız bitiyor
- [ ] Welcome → Search → QACard → Favorites akışı çalışıyor
- [ ] Klavye kısayolları çalışıyor
- [ ] Dark/Light tema persistence çalışıyor
- [ ] Favoriler persistence çalışıyor
- [ ] Mobile drawer açılıyor
- [ ] Java kod blokları syntax-highlight'lı

İmplementasyon tamamlanınca **superpowers:finishing-a-development-branch** skill'i ile dağıtım/PR kararları için sıradaki adıma geç.
