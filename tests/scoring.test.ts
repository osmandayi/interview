import { describe, it, expect } from 'vitest';
import { normalize, levenshtein, tokensMatch } from '../src/lib/scoring';
import { extractKeywords } from '../src/lib/scoring';

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
    expect(tokensMatch('clojure', 'closure')).toBe(true);
    expect(tokensMatch('ecmascrpt', 'ecmascript')).toBe(true);
    expect(tokensMatch('cat', 'dog')).toBe(false);
  });
});

describe('extractKeywords', () => {
  it('drops stop-words and tokens shorter than 3 chars, dedupes', () => {
    const answer = 'ECMAScript, JavaScript için bir standartlar bütünüdür ve standart belirler.';
    const kw = extractKeywords(answer);
    expect(kw).toContain('ecmascript');
    expect(kw).toContain('javascript');
    expect(kw).toContain('standartlar');
    expect(kw).toContain('butunudur');
    expect(kw).not.toContain('icin');
    expect(kw).not.toContain('bir');
    expect(kw).not.toContain('ve');
    expect(kw.filter((k) => k === 'standart').length).toBeLessThanOrEqual(1);
  });

  it('uses the override list when provided', () => {
    const kw = extractKeywords('herhangi bir cevap metni', ['Closure', 'Scope']);
    expect(kw).toEqual(['closure', 'scope']);
  });
});

import { scoreAnswer } from '../src/lib/scoring';

describe('scoreAnswer', () => {
  const keywords = ['ecmascript', 'javascript', 'standart'];

  it('returns 100 when all keywords are present', () => {
    const r = scoreAnswer('ecmascript javascript standart', keywords);
    expect(r.score).toBe(100);
    expect(r.missed).toEqual([]);
  });

  it('counts each keyword at most once (duplicate ECMA problem)', () => {
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
