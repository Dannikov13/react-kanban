import { describe, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  it('update state and localStorage', () => {
    window.localStorage.clear();
    const initialValue = ['Task 1'];

    const { result } = renderHook(() => useLocalStorage('tasks', initialValue));
    const updatedValue = ['Task 2'];

    act(() => {
      result.current[1](updatedValue);
    });
    expect(result.current[0]).toEqual(updatedValue);

    expect(JSON.parse(window.localStorage.getItem('tasks')!)).toEqual(
      updatedValue,
    );
  });
});
