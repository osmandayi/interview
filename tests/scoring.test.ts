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
    expect(tokensMatch('clojure', 'closure')).toBe(true);
    expect(tokensMatch('ecmascrpt', 'ecmascript')).toBe(true);
    expect(tokensMatch('cat', 'dog')).toBe(false);
  });
});
