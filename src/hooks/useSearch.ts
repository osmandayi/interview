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
