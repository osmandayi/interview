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
    setQueue((q) => {
      if (q.length === 0) {
        setStatus('finished');
        return q;
      }
      setCurrent(q[0]);
      setLastResult(null);
      setPhase('answering');
      return q.slice(1);
    });
  }, []);

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
