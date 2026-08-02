import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  it('updates state and localStorage', () => {
    localStorage.clear();

    const initialValue = ['Task 1'];

    const { result } = renderHook(() => useLocalStorage('tasks', initialValue));

    const updatedValue = ['Task 2'];

    act(() => {
      result.current[1](updatedValue);
    });

    expect(result.current[0]).toEqual(updatedValue);

    expect(JSON.parse(localStorage.getItem('tasks')!)).toEqual(updatedValue);
  });
});
