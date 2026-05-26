// @vitest-environment node
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
    const results = fuse.search('closre');
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
