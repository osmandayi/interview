import { useEffect, useState, useCallback } from 'react';
import { readJSON, writeJSON } from '../lib/storage';

export const PROGRESS_KEY = 'qa-read';

function load(): Set<string> {
  const arr = readJSON<unknown>(PROGRESS_KEY, []);
  if (!Array.isArray(arr)) return new Set();
  return new Set(arr.filter((x): x is string => typeof x === 'string'));
}

/** Okundu olarak işaretlenen soruları tutar (localStorage'da kalıcı). */
export function useProgress() {
  const [readIds, setReadIds] = useState<Set<string>>(() => load());

  useEffect(() => {
    writeJSON(PROGRESS_KEY, Array.from(readIds));
  }, [readIds]);

  const toggleRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isRead = useCallback((id: string) => readIds.has(id), [readIds]);

  const countRead = useCallback(
    (ids: string[]) => ids.reduce((n, id) => (readIds.has(id) ? n + 1 : n), 0),
    [readIds]
  );

  return { readIds, toggleRead, isRead, countRead };
}
