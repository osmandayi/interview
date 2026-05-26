// @vitest-environment node
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
    expect(isSorted!.answer).toMatch(/```\s*$/m);
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
