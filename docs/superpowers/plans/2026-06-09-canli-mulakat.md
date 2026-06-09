# Canlı Mülakat Modu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mevcut Q&A SPA'sına, sistemin tekrarsız soru sorduğu, kullanıcının yazdığı cevabı esnek anahtar-kelime eşleşmesiyle yüzde olarak puanlayan ve gerçek cevabı gösteren bir "canlı mülakat" modu eklemek.

**Architecture:** Saf client-side. Puanlama saf fonksiyonlar (`src/lib/scoring.ts`), oturum state'i bir hook (`src/hooks/useInterview.ts`), UI üç component (`InterviewSetup`, `InterviewView`, `InterviewSummary`) + `App.tsx`'te yeni `'interview'` view. Backend yok.

**Tech Stack:** Vite + React 18 + TypeScript + Tailwind + lucide-react + Vitest. Testler `tests/` klasöründe, `../src/...`'ten import eder; `npx vitest run <dosya>` ile çalışır.

---

## File Structure

- **Create** `src/lib/scoring.ts` — saf puanlama fonksiyonları: `normalize`, `levenshtein`, `tokensMatch`, `extractKeywords`, `scoreAnswer`. UI'dan bağımsız.
- **Create** `tests/scoring.test.ts` — scoring birim testleri.
- **Create** `src/hooks/useInterview.ts` — oturum state makinesi (setup/active/finished, havuz, tekrarsız çekme, skor geçmişi).
- **Create** `tests/useInterview.test.ts` — hook testleri.
- **Create** `src/components/InterviewSetup.tsx` — kapsam seçimi + başlat.
- **Create** `src/components/InterviewView.tsx` — soru + cevap + feedback paneli.
- **Create** `src/components/InterviewSummary.tsx` — oturum özeti.
- **Modify** `src/types/qa.ts` — `QAItem`'a opsiyonel `keywords?: string[]`.
- **Modify** `scripts/build-data.mjs` — `keywordOverrides` desteği (`applyOverrides` içinde).
- **Modify** `src/App.tsx` — `'interview'` view + giriş noktası.
- **Modify** `src/components/Welcome.tsx` — "Canlı Mülakat" kartı.
- **Modify** `src/components/Sidebar.tsx` — "Canlı Mülakat" menü girişi.

---

## Task 1: Puanlama temelleri — normalize, levenshtein, tokensMatch

**Files:**
- Create: `src/lib/scoring.ts`
- Test: `tests/scoring.test.ts`

- [ ] **Step 1: Write the failing test**

`tests/scoring.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { normalize, levenshtein, tokensMatch } from '../src/lib/scoring';

describe('normalize', () => {
  it('lowercases, folds Turkish chars, strips punctuation, tokenizes', () => {
    expect(normalize('ECMAScript, JavaScript’in temelidir.')).toEqual([
      'ecmascript', 'javascript', 'in', 'temelidir'
    ]);
  });

  it('folds İ/I correctly and drops empty tokens', () => {
    expect(normalize('İçin   ŞART')).toEqual(['icin', 'sart']);
  });
});

describe('levenshtein', () => {
  it('counts single-char edits', () => {
    expect(levenshtein('standart', 'standrt')).toBe(1);
    expect(levenshtein('abc', 'abc')).toBe(0);
  });
});

describe('tokensMatch', () => {
  it('matches exact', () => {
    expect(tokensMatch('closure', 'closure')).toBe(true);
  });
  it('matches stem/prefix when shorter is >= 4 chars', () => {
    expect(tokensMatch('standart', 'standartlar')).toBe(true);
    expect(tokensMatch('standartlar', 'standart')).toBe(true);
  });
  it('does not prefix-match very short tokens', () => {
    expect(tokensMatch('ja', 'java')).toBe(false);
  });
  it('tolerates 1 typo on short words, 2 on long words', () => {
    expect(tokensMatch('clojure', 'closure')).toBe(true);   // 1 edit
    expect(tokensMatch('ecmascrpt', 'ecmascript')).toBe(true); // 1 edit, long
    expect(tokensMatch('cat', 'dog')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/scoring.test.ts`
Expected: FAIL — "Failed to resolve import '../src/lib/scoring'".

- [ ] **Step 3: Write minimal implementation**

`src/lib/scoring.ts`:

```ts
const TR_FOLD: Record<string, string> = {
  'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
  'â': 'a', 'î': 'i', 'û': 'u'
};

export function normalize(text: string): string[] {
  const lower = text.toLocaleLowerCase('tr');
  const folded = lower.replace(/[çğıöşüâîû]/g, (c) => TR_FOLD[c] ?? c);
  return folded
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export function tokensMatch(userToken: string, keyword: string): boolean {
  if (userToken === keyword) return true;

  // Stem/prefix: the shorter token is a prefix of the longer, and is long
  // enough to be meaningful (avoids "ja" matching "java").
  const [short, long] =
    userToken.length <= keyword.length ? [userToken, keyword] : [keyword, userToken];
  if (short.length >= 4 && long.startsWith(short)) return true;

  // Typo tolerance: 2 edits for longer keywords, 1 for short ones.
  const tol = keyword.length >= 6 ? 2 : 1;
  if (Math.abs(userToken.length - keyword.length) <= tol &&
      levenshtein(userToken, keyword) <= tol) {
    return true;
  }
  return false;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/scoring.test.ts`
Expected: PASS (all `normalize`, `levenshtein`, `tokensMatch` tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring.ts tests/scoring.test.ts
git commit -m "feat(scoring): add normalize, levenshtein, token matching"
```

---

## Task 2: Anahtar kelime ayıklama — extractKeywords

**Files:**
- Modify: `src/lib/scoring.ts`
- Test: `tests/scoring.test.ts`

- [ ] **Step 1: Write the failing test** (append to `tests/scoring.test.ts`)

```ts
import { extractKeywords } from '../src/lib/scoring';

describe('extractKeywords', () => {
  it('drops stop-words and tokens shorter than 3 chars, dedupes', () => {
    const answer = 'ECMAScript, JavaScript için bir standartlar bütünüdür ve standart belirler.';
    const kw = extractKeywords(answer);
    expect(kw).toContain('ecmascript');
    expect(kw).toContain('javascript');
    expect(kw).toContain('standartlar');
    expect(kw).toContain('butunudur');
    expect(kw).not.toContain('icin'); // stop-word
    expect(kw).not.toContain('bir');  // stop-word
    expect(kw).not.toContain('ve');   // stop-word
    // dedupe: appears once even if repeated
    expect(kw.filter((k) => k === 'standart').length).toBeLessThanOrEqual(1);
  });

  it('uses the override list when provided', () => {
    const kw = extractKeywords('herhangi bir cevap metni', ['Closure', 'Scope']);
    expect(kw).toEqual(['closure', 'scope']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/scoring.test.ts`
Expected: FAIL — "extractKeywords is not a function" / import error.

- [ ] **Step 3: Write minimal implementation** (append to `src/lib/scoring.ts`)

```ts
// Normalized (Turkish-folded) Turkish stop-words.
const STOP_WORDS = new Set([
  'bir', 've', 'ile', 'icin', 'olan', 'bu', 'su', 'da', 'de', 'ki', 'gibi',
  'daha', 'cok', 'en', 'ama', 'veya', 'ya', 'her', 'ise', 'gore', 'kadar',
  'sonra', 'once', 'hem', 'yani', 'tum', 'ancak', 'fakat', 'cunku', 'eger',
  'ayrica', 'hangi', 'nedir', 'olarak', 'ise', 'yine', 'cok'
]);

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

export function extractKeywords(answer: string, override?: string[]): string[] {
  if (override && override.length > 0) {
    return dedupe(override.flatMap((k) => normalize(k)));
  }
  const tokens = normalize(answer);
  return dedupe(tokens.filter((t) => t.length >= 3 && !STOP_WORDS.has(t)));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/scoring.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring.ts tests/scoring.test.ts
git commit -m "feat(scoring): add keyword extraction with stop-words and overrides"
```

---

## Task 3: Puanlama — scoreAnswer

**Files:**
- Modify: `src/lib/scoring.ts`
- Test: `tests/scoring.test.ts`

- [ ] **Step 1: Write the failing test** (append to `tests/scoring.test.ts`)

```ts
import { scoreAnswer } from '../src/lib/scoring';

describe('scoreAnswer', () => {
  const keywords = ['ecmascript', 'javascript', 'standart'];

  it('returns 100 when all keywords are present', () => {
    const r = scoreAnswer('ecmascript javascript standart', keywords);
    expect(r.score).toBe(100);
    expect(r.missed).toEqual([]);
  });

  it('counts each keyword at most once (duplicate ECMA problem)', () => {
    // user writes ecmascript twice; only 1 of 3 keywords covered -> 33
    const r = scoreAnswer('ecmascript ecmascript', keywords);
    expect(r.matched).toEqual(['ecmascript']);
    expect(r.score).toBe(33);
  });

  it('tolerates typos and inflections', () => {
    const r = scoreAnswer('ecmascrpt javascriptin standartlar', keywords);
    expect(r.score).toBe(100);
  });

  it('returns 0 for empty answer', () => {
    const r = scoreAnswer('', keywords);
    expect(r.score).toBe(0);
    expect(r.matched).toEqual([]);
    expect(r.missed).toEqual(keywords);
  });

  it('returns 0 when there are no keywords', () => {
    expect(scoreAnswer('anything', []).score).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/scoring.test.ts`
Expected: FAIL — "scoreAnswer is not a function".

- [ ] **Step 3: Write minimal implementation** (append to `src/lib/scoring.ts`)

```ts
export type ScoreResult = {
  score: number;       // 0-100
  matched: string[];   // keywords the user covered
  missed: string[];    // keywords the user missed
};

export function scoreAnswer(userText: string, keywords: string[]): ScoreResult {
  const userTokens = dedupe(normalize(userText));
  const matched: string[] = [];
  const missed: string[] = [];

  for (const kw of keywords) {
    if (userTokens.some((ut) => tokensMatch(ut, kw))) matched.push(kw);
    else missed.push(kw);
  }

  const score = keywords.length === 0
    ? 0
    : Math.round((matched.length / keywords.length) * 100);

  return { score, matched, missed };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/scoring.test.ts`
Expected: PASS (all scoring tests green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring.ts tests/scoring.test.ts
git commit -m "feat(scoring): add scoreAnswer with set-based keyword coverage"
```

---

## Task 4: Opsiyonel keyword override — type + build script

**Files:**
- Modify: `src/types/qa.ts:17-22`
- Modify: `scripts/build-data.mjs:325-336` (`applyOverrides`)

- [ ] **Step 1: Add the `keywords` field to the type**

In `src/types/qa.ts`, change the `QAItem` type to:

```ts
export type QAItem = {
  id: string;
  question: string;
  answer: string;
  tags?: string[];
  keywords?: string[];
};
```

- [ ] **Step 2: Support `keywordOverrides` in the build script**

In `scripts/build-data.mjs`, replace the `applyOverrides` function (currently lines 325-336) with:

```js
function applyOverrides(data, overrides) {
  for (const cat of data.categories) {
    for (const sub of cat.subcategories) {
      for (const item of sub.items) {
        if (overrides.tagOverrides?.[item.id]) {
          item.tags = overrides.tagOverrides[item.id];
        }
        if (overrides.keywordOverrides?.[item.id]) {
          item.keywords = overrides.keywordOverrides[item.id];
        }
      }
    }
  }
  return data;
}
```

- [ ] **Step 3: Regenerate the data and confirm it still builds**

Run: `npm run parse`
Expected: prints `✓ Parsed:` tree and `✓ Yazıldı: ...qa.json` with no errors. (No `keywordOverrides` defined yet, so output is unchanged — this only proves the new code path is safe.)

- [ ] **Step 4: Confirm existing parse tests still pass**

Run: `npx vitest run tests/parse.test.ts`
Expected: PASS (existing parse suite unaffected).

- [ ] **Step 5: Commit**

```bash
git add src/types/qa.ts scripts/build-data.mjs
git commit -m "feat(data): support optional per-question keyword overrides"
```

---

## Task 5: Oturum hook — useInterview

**Files:**
- Create: `src/hooks/useInterview.ts`
- Test: `tests/useInterview.test.ts`

- [ ] **Step 1: Write the failing test**

`tests/useInterview.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInterview } from '../src/hooks/useInterview';
import { flatItems } from '../src/lib/loadData';

describe('useInterview', () => {
  it('starts in setup, then becomes active with a current question', () => {
    const { result } = renderHook(() => useInterview());
    expect(result.current.status).toBe('setup');
    act(() => result.current.start({}));
    expect(result.current.status).toBe('active');
    expect(result.current.current).not.toBeNull();
    expect(result.current.phase).toBe('answering');
  });

  it('submit records score and enters feedback phase', () => {
    const { result } = renderHook(() => useInterview());
    act(() => result.current.start({}));
    act(() => result.current.submit('some answer text'));
    expect(result.current.phase).toBe('feedback');
    expect(result.current.lastResult).not.toBeNull();
    expect(result.current.history).toHaveLength(1);
  });

  it('never repeats a question and covers the whole pool', () => {
    const { result } = renderHook(() => useInterview());
    act(() => result.current.start({}));
    const seen: string[] = [];
    // Walk the entire session: submit + next until finished.
    for (let guard = 0; guard < flatItems.length + 5; guard++) {
      if (result.current.status !== 'active' || !result.current.current) break;
      seen.push(result.current.current.id);
      act(() => result.current.submit(''));
      act(() => result.current.next());
    }
    expect(new Set(seen).size).toBe(seen.length);   // no repeats
    expect(seen.length).toBe(flatItems.length);     // full pool
    expect(result.current.status).toBe('finished');
  });

  it('filters the pool by categoryId', () => {
    const { result } = renderHook(() => useInterview());
    act(() => result.current.start({ categoryId: 'frontend' }));
    const seen: string[] = [];
    for (let guard = 0; guard < flatItems.length + 5; guard++) {
      if (result.current.status !== 'active' || !result.current.current) break;
      seen.push(result.current.current.categoryId);
      act(() => result.current.submit(''));
      act(() => result.current.next());
    }
    expect(seen.every((c) => c === 'frontend')).toBe(true);
    expect(seen.length).toBeGreaterThan(0);
  });

  it('sets setupError when the filter yields an empty pool', () => {
    const { result } = renderHook(() => useInterview());
    act(() => result.current.start({ categoryId: 'does-not-exist' }));
    expect(result.current.status).toBe('setup');
    expect(result.current.setupError).not.toBeNull();
  });

  it('computes averageScore from history', () => {
    const { result } = renderHook(() => useInterview());
    act(() => result.current.start({}));
    act(() => result.current.submit(''));        // score 0
    expect(result.current.averageScore).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/useInterview.test.ts`
Expected: FAIL — "Failed to resolve import '../src/hooks/useInterview'".

- [ ] **Step 3: Write minimal implementation**

`src/hooks/useInterview.ts`:

```ts
import { useState, useCallback, useMemo } from 'react';
import { flatItems } from '../lib/loadData';
import { extractKeywords, scoreAnswer } from '../lib/scoring';
import type { ScoreResult } from '../lib/scoring';
import type { FlatQAItem } from '../types/qa';

export type InterviewFilter = { categoryId?: string; subcategoryId?: string };
export type InterviewStatus = 'setup' | 'active' | 'finished';
export type InterviewPhase = 'answering' | 'feedback';
export type AnswerRecord = { itemId: string; score: number };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPool(filter: InterviewFilter): FlatQAItem[] {
  return flatItems.filter((it) => {
    if (filter.categoryId && it.categoryId !== filter.categoryId) return false;
    if (filter.subcategoryId && it.subcategoryId !== filter.subcategoryId) return false;
    return true;
  });
}

export function useInterview() {
  const [status, setStatus] = useState<InterviewStatus>('setup');
  const [phase, setPhase] = useState<InterviewPhase>('answering');
  const [queue, setQueue] = useState<FlatQAItem[]>([]);
  const [current, setCurrent] = useState<FlatQAItem | null>(null);
  const [history, setHistory] = useState<AnswerRecord[]>([]);
  const [lastResult, setLastResult] = useState<ScoreResult | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

  const start = useCallback((filter: InterviewFilter) => {
    const pool = shuffle(buildPool(filter));
    if (pool.length === 0) {
      setSetupError('Bu kapsamda soru bulunamadı.');
      return;
    }
    const [first, ...rest] = pool;
    setSetupError(null);
    setQueue(rest);
    setCurrent(first);
    setHistory([]);
    setLastResult(null);
    setPhase('answering');
    setStatus('active');
  }, []);

  const submit = useCallback((userText: string) => {
    if (!current) return;
    const keywords = extractKeywords(current.answer, current.keywords);
    const result = scoreAnswer(userText, keywords);
    setLastResult(result);
    setHistory((h) => [...h, { itemId: current.id, score: result.score }]);
    setPhase('feedback');
  }, [current]);

  const next = useCallback(() => {
    if (queue.length === 0) {
      setStatus('finished');
      return;
    }
    setCurrent(queue[0]);
    setQueue((q) => q.slice(1));
    setLastResult(null);
    setPhase('answering');
  }, [queue]);

  const end = useCallback(() => setStatus('finished'), []);

  const reset = useCallback(() => {
    setStatus('setup');
    setPhase('answering');
    setQueue([]);
    setCurrent(null);
    setHistory([]);
    setLastResult(null);
    setSetupError(null);
  }, []);

  const remaining = queue.length;
  const averageScore = useMemo(
    () => (history.length === 0
      ? 0
      : Math.round(history.reduce((s, r) => s + r.score, 0) / history.length)),
    [history]
  );

  return {
    status, phase, current, lastResult, history, remaining,
    averageScore, setupError,
    start, submit, next, end, reset
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/useInterview.test.ts`
Expected: PASS (all useInterview tests).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useInterview.ts tests/useInterview.test.ts
git commit -m "feat(interview): add useInterview session hook"
```

---

## Task 6: Setup ekranı — InterviewSetup

**Files:**
- Create: `src/components/InterviewSetup.tsx`

- [ ] **Step 1: Implement the component**

`src/components/InterviewSetup.tsx`:

```tsx
import { useState } from 'react';
import { Play } from 'lucide-react';
import { qaData } from '../lib/loadData';
import type { InterviewFilter } from '../hooks/useInterview';

type Props = {
  onStart: (filter: InterviewFilter) => void;
  error: string | null;
};

export function InterviewSetup({ onStart, error }: Props) {
  // scope value: '' = all, 'cat:<id>' = category, 'sub:<id>' = subcategory
  const [scope, setScope] = useState('');

  const handleStart = () => {
    if (scope.startsWith('cat:')) onStart({ categoryId: scope.slice(4) });
    else if (scope.startsWith('sub:')) onStart({ subcategoryId: scope.slice(4) });
    else onStart({});
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-6">
      <h1 className="text-2xl font-bold mb-2">Canlı Mülakat</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
        Sistem sana tekrarsız sorular soracak. Cevabını yaz, anahtar kelime
        kapsamına göre yüzde puan al, gerçek cevabı gör.
      </p>

      <label className="block text-sm font-medium mb-2">Kapsam</label>
      <select
        value={scope}
        onChange={(e) => setScope(e.target.value)}
        className="w-full mb-6 px-3 py-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
      >
        <option value="">Tüm havuz</option>
        {qaData.categories.map((cat) => [
          <option key={cat.id} value={`cat:${cat.id}`}>{cat.title} (tümü)</option>,
          ...cat.subcategories.map((sub) => (
            <option key={sub.id} value={`sub:${sub.id}`}>
              &nbsp;&nbsp;{cat.title} › {sub.title}
            </option>
          ))
        ])}
      </select>

      {error && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        onClick={handleStart}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
      >
        <Play size={18} /> Başla
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/InterviewSetup.tsx
git commit -m "feat(interview): add InterviewSetup scope selection screen"
```

---

## Task 7: Mülakat ekranı — InterviewView

**Files:**
- Create: `src/components/InterviewView.tsx`

- [ ] **Step 1: Implement the component**

`src/components/InterviewView.tsx`:

```tsx
import { useState } from 'react';
import { Send, ArrowRight, Square } from 'lucide-react';
import { renderAnswer } from '../lib/renderAnswer';
import type { FlatQAItem } from '../types/qa';
import type { ScoreResult } from '../lib/scoring';
import type { InterviewPhase } from '../hooks/useInterview';

type Props = {
  item: FlatQAItem;
  phase: InterviewPhase;
  result: ScoreResult | null;
  remaining: number;
  onSubmit: (text: string) => void;
  onNext: () => void;
  onEnd: () => void;
};

function scoreColor(score: number): string {
  if (score >= 70) return 'text-green-600 dark:text-green-400';
  if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function InterviewView({ item, phase, result, remaining, onSubmit, onNext, onEnd }: Props) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    onSubmit(text);
  };

  const handleNext = () => {
    setText('');
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-xs text-neutral-500 mb-2">
        {item.categoryTitle} › {item.subcategoryTitle}
        {' · '}Kalan soru: {remaining}
      </div>
      <h1 className="text-xl font-semibold mb-4">{item.question}</h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={phase === 'feedback'}
        rows={6}
        placeholder="Cevabını buraya yaz..."
        className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 disabled:opacity-60 mb-4"
      />

      {phase === 'answering' && (
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            <Send size={18} /> Gönder
          </button>
          <button
            onClick={onEnd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <Square size={16} /> Bitir
          </button>
        </div>
      )}

      {phase === 'feedback' && result && (
        <div className="mt-2">
          <div className="flex items-baseline gap-3 mb-4">
            <span className={`text-4xl font-bold ${scoreColor(result.score)}`}>
              %{result.score}
            </span>
            <span className="text-sm text-neutral-500">
              {result.matched.length}/{result.matched.length + result.missed.length} anahtar kelime
            </span>
          </div>

          {result.matched.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-neutral-500 mb-1">Yakaladıkların</div>
              <div className="flex flex-wrap gap-2">
                {result.matched.map((k) => (
                  <span key={k} className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.missed.length > 0 && (
            <div className="mb-5">
              <div className="text-xs font-medium text-neutral-500 mb-1">Kaçırdıkların</div>
              <div className="flex flex-wrap gap-2">
                {result.missed.map((k) => (
                  <span key={k} className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 mb-5">
            <div className="text-xs font-medium text-neutral-500 mb-2">Gerçek cevap</div>
            <div>{renderAnswer(item.answer)}</div>
          </div>

          <div className="flex gap-3">
            {remaining > 0 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                Sonraki soru <ArrowRight size={18} />
              </button>
            ) : (
              <span className="text-sm text-neutral-500 self-center">Havuzdaki tüm sorular bitti.</span>
            )}
            <button
              onClick={onEnd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <Square size={16} /> Bitir ve özeti gör
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/InterviewView.tsx
git commit -m "feat(interview): add InterviewView question and feedback screen"
```

---

## Task 8: Özet ekranı — InterviewSummary

**Files:**
- Create: `src/components/InterviewSummary.tsx`

- [ ] **Step 1: Implement the component**

`src/components/InterviewSummary.tsx`:

```tsx
import { RotateCcw, Home } from 'lucide-react';
import type { AnswerRecord } from '../hooks/useInterview';

type Props = {
  history: AnswerRecord[];
  averageScore: number;
  onRestart: () => void;
  onHome: () => void;
};

export function InterviewSummary({ history, averageScore, onRestart, onHome }: Props) {
  return (
    <div className="max-w-xl mx-auto py-16 px-6 text-center">
      <h1 className="text-2xl font-bold mb-6">Mülakat Özeti</h1>

      <div className="flex justify-center gap-10 mb-8">
        <div>
          <div className="text-4xl font-bold">{history.length}</div>
          <div className="text-sm text-neutral-500">cevaplanan soru</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">%{averageScore}</div>
          <div className="text-sm text-neutral-500">ortalama skor</div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          <RotateCcw size={18} /> Yeni oturum
        </button>
        <button
          onClick={onHome}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <Home size={18} /> Ana sayfa
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/InterviewSummary.tsx
git commit -m "feat(interview): add InterviewSummary screen"
```

---

## Task 9: Entegrasyon — App, Welcome, Sidebar

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Welcome.tsx`
- Modify: `src/components/Sidebar.tsx`

- [ ] **Step 1: Wire the interview view into `App.tsx`**

In `src/App.tsx`:

1. Add imports near the other component imports:

```tsx
import { InterviewSetup } from './components/InterviewSetup';
import { InterviewView } from './components/InterviewView';
import { InterviewSummary } from './components/InterviewSummary';
import { useInterview } from './hooks/useInterview';
```

2. Change the `View` type (line 13) to include `'interview'`:

```tsx
type View = 'welcome' | 'qa' | 'favorites' | 'interview';
```

3. Inside `AppInner`, after the existing context hooks (after line 21), add:

```tsx
  const interview = useInterview();
```

4. In `handleHome` (lines 60-65), reset the interview too:

```tsx
  const handleHome = () => {
    setView('welcome');
    setSelectedId(null);
    setSidebarOpen(false);
    interview.reset();
    sessionStorage.removeItem('qa-last-viewed');
  };
```

5. Add the interview rendering branch inside `<main>`, right after the `view === 'favorites'` block (after line 101):

```tsx
          {view === 'interview' && interview.status === 'setup' && (
            <InterviewSetup
              onStart={(f) => interview.start(f)}
              error={interview.setupError}
            />
          )}
          {view === 'interview' && interview.status === 'active' && interview.current && (
            <InterviewView
              item={interview.current}
              phase={interview.phase}
              result={interview.lastResult}
              remaining={interview.remaining}
              onSubmit={interview.submit}
              onNext={interview.next}
              onEnd={interview.end}
            />
          )}
          {view === 'interview' && interview.status === 'finished' && (
            <InterviewSummary
              history={interview.history}
              averageScore={interview.averageScore}
              onRestart={() => interview.reset()}
              onHome={handleHome}
            />
          )}
```

- [ ] **Step 2: Add the entry point in `Welcome.tsx`**

In `src/components/Welcome.tsx`:

1. Add `Mic` to the lucide import (line 1):

```tsx
import { Search, BookOpen, Star, Mic } from 'lucide-react';
```

2. Add `onInterview: () => void;` to the `Props` type (lines 5-8):

```tsx
type Props = {
  onBrowse: () => void;
  onFavorites: () => void;
  onInterview: () => void;
};
```

3. Update the destructure (line 10):

```tsx
export function Welcome({ onBrowse, onFavorites, onInterview }: Props) {
```

4. Change the grid to 4 columns and add an "Canlı Mülakat" card. Replace the grid wrapper opening tag (line 23):

```tsx
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
```

5. Add this card as the last child inside that grid (after the Favoriler button, before the closing `</div>` on line 50):

```tsx
        <button
          onClick={onInterview}
          className="flex flex-col items-center gap-2 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
        >
          <Mic size={24} className="text-green-500" />
          <div className="font-semibold">Canlı Mülakat</div>
          <div className="text-xs text-neutral-500">Sorulara cevap ver</div>
        </button>
```

- [ ] **Step 3: Pass `onInterview` from `App.tsx` to `Welcome`**

In `src/App.tsx`, update the `<Welcome ... />` usage (lines 94-97):

```tsx
            <Welcome
              onBrowse={handleBrowse}
              onFavorites={() => setView('favorites')}
              onInterview={() => { interview.reset(); setView('interview'); }}
            />
```

- [ ] **Step 4: Add a Sidebar entry point**

In `src/components/Sidebar.tsx`:

1. Add `Mic` to the lucide import (line 2):

```tsx
import { ChevronDown, ChevronRight, Star, Mic } from 'lucide-react';
```

2. Add `onInterview: () => void;` to the `Props` type (lines 6-11):

```tsx
type Props = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  view: 'qa' | 'favorites';
  onViewChange: (v: 'qa' | 'favorites') => void;
  onInterview: () => void;
};
```

3. Update the destructure (line 13):

```tsx
export function Sidebar({ selectedId, onSelect, view, onViewChange, onInterview }: Props) {
```

4. Add a "Canlı Mülakat" button right after the Favoriler button (after line 41, before the `qaData.categories.map`):

```tsx
        <button
          onClick={onInterview}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm font-medium mb-4 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <Mic size={16} className="text-green-500" />
          Canlı Mülakat
        </button>
```

- [ ] **Step 5: Pass `onInterview` to `Sidebar` from `App.tsx`**

In `src/App.tsx`, update the `<Sidebar ... />` usage (lines 77-82):

```tsx
          <Sidebar
            selectedId={selectedId}
            onSelect={handleSelect}
            view={view === 'favorites' ? 'favorites' : 'qa'}
            onViewChange={(v) => { setView(v); setSidebarOpen(false); }}
            onInterview={() => { interview.reset(); setView('interview'); setSidebarOpen(false); }}
          />
```

- [ ] **Step 6: Typecheck and run the full test suite**

Run: `npx tsc -b --noEmit`
Expected: no errors.

Run: `npm test`
Expected: all suites PASS (existing 17 + scoring + useInterview).

- [ ] **Step 7: Manual smoke test**

Run: `npm run dev`, open the app, click "Canlı Mülakat", start with "Tüm havuz", answer a question, verify the score / matched / missed / real answer panel appears, click "Sonraki soru", then "Bitir ve özeti gör" and confirm the summary shows count + average.

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx src/components/Welcome.tsx src/components/Sidebar.tsx
git commit -m "feat(interview): wire live interview mode into app navigation"
```

---

## Notes / Constraints

- **No component unit tests:** the existing suite tests only `lib/` and `hooks/` (see `tests/`). Components are verified by typecheck + manual smoke test, matching the established pattern. Do not add a component-testing harness for this feature.
- **Display forms:** `matched`/`missed` keywords are shown in their normalized (Turkish-folded, lowercased) form. This is intentional for v1 — the full real answer is shown below for context.
- **Keyboard shortcuts:** `App.tsx` already guards shortcuts behind an `isInput` check (INPUT/TEXTAREA), so typing in the interview textarea will not trigger `f`/`t` shortcuts. No change needed.
- **Out of scope (YAGNI):** semantic/synonym matching, persistent score history, multi-user.
