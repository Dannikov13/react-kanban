import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('updates state and localStorage', () => {
    const initialValue = ['Task 1'];

    const { result } = renderHook(() => useLocalStorage('tasks', initialValue));

    const updatedValue = ['Task 2'];

    act(() => {
      result.current[1](updatedValue);
    });

    expect(result.current[0]).toEqual(updatedValue);

    expect(JSON.parse(localStorage.getItem('tasks')!)).toEqual(updatedValue);
  });

  it('returns initial value when localStorage contains invalid JSON', () => {
    localStorage.setItem('tasks', '{invalid json');

    const initialValue = ['Initial task'];

    const { result } = renderHook(() => useLocalStorage('tasks', initialValue));

    expect(result.current[0]).toEqual(initialValue);
  });
});
