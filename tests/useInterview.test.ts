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
    for (let guard = 0; guard < flatItems.length + 5; guard++) {
      if (result.current.status !== 'active' || !result.current.current) break;
      seen.push(result.current.current.id);
      act(() => result.current.submit(''));
      act(() => result.current.next());
    }
    expect(new Set(seen).size).toBe(seen.length);
    expect(seen.length).toBe(flatItems.length);
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
    act(() => result.current.submit(''));
    expect(result.current.averageScore).toBe(0);
  });
});
