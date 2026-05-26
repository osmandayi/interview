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
