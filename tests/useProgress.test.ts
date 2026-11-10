import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProgress, PROGRESS_KEY } from '../src/hooks/useProgress';
import { loadSessions, saveSession, SESSIONS_KEY } from '../src/lib/sessions';

beforeEach(() => {
  localStorage.clear();
});

describe('useProgress', () => {
  it('toggles read state and persists it', () => {
    const { result } = renderHook(() => useProgress());
    act(() => result.current.toggleRead('a'));
    expect(result.current.isRead('a')).toBe(true);
    expect(JSON.parse(localStorage.getItem(PROGRESS_KEY)!)).toEqual(['a']);
    act(() => result.current.toggleRead('a'));
    expect(result.current.isRead('a')).toBe(false);
  });

  it('counts read items within a given list', () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(['a', 'c']));
    const { result } = renderHook(() => useProgress());
    expect(result.current.countRead(['a', 'b', 'c', 'd'])).toBe(2);
  });

  it('ignores corrupt storage', () => {
    localStorage.setItem(PROGRESS_KEY, '{not json');
    const { result } = renderHook(() => useProgress());
    expect(result.current.readIds.size).toBe(0);
  });
});

describe('interview sessions', () => {
  const base = { finishedAt: 1, scope: 'Tüm havuz', count: 3, average: 50 };

  it('saves newest first and replaces a session with the same id', () => {
    saveSession({ id: '1', ...base });
    saveSession({ id: '2', ...base });
    saveSession({ id: '1', ...base, average: 80 });
    const s = loadSessions();
    expect(s.map((x) => x.id)).toEqual(['1', '2']);
    expect(s[0].average).toBe(80);
  });

  it('keeps at most 20 sessions', () => {
    for (let i = 0; i < 25; i++) saveSession({ id: String(i), ...base });
    expect(JSON.parse(localStorage.getItem(SESSIONS_KEY)!)).toHaveLength(20);
  });
});
