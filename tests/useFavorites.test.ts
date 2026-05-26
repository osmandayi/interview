import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '../src/hooks/useFavorites';

beforeEach(() => {
  localStorage.clear();
});

describe('useFavorites', () => {
  it('starts with empty set', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.ids.size).toBe(0);
  });

  it('toggles favorites and persists to localStorage', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.toggle('closure-1'));
    expect(result.current.isFavorite('closure-1')).toBe(true);
    expect(JSON.parse(localStorage.getItem('qa-favorites')!)).toContain('closure-1');

    act(() => result.current.toggle('closure-1'));
    expect(result.current.isFavorite('closure-1')).toBe(false);
  });

  it('loads existing favorites on mount', () => {
    localStorage.setItem('qa-favorites', JSON.stringify(['a', 'b']));
    const { result } = renderHook(() => useFavorites());
    expect(result.current.ids.has('a')).toBe(true);
    expect(result.current.ids.has('b')).toBe(true);
  });

  it('handles invalid localStorage gracefully', () => {
    localStorage.setItem('qa-favorites', 'not-json');
    const { result } = renderHook(() => useFavorites());
    expect(result.current.ids.size).toBe(0);
  });
});
