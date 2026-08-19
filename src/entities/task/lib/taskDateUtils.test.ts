import { describe, expect, it } from 'vitest';
import {
  formatDateTimeLocal,
  formatDueDate,
  parseDateTimeLocal,
} from './taskDateUtils';

describe('taskDateUtils', () => {
  describe('parseDateTimeLocal', () => {
    it('returns undefined for an empty value', () => {
      expect(parseDateTimeLocal('')).toBeUndefined();
    });

    it('converts local date and time to epoch milliseconds', () => {
      const result = parseDateTimeLocal('2026-08-25T14:30');

      expect(result).toBeTypeOf('number');
    });

    it('preserves date and time in Europe/Kyiv timezone', () => {
      const value = '2026-08-25T14:30';

      const timestamp = parseDateTimeLocal(value);

      expect(formatDateTimeLocal(timestamp)).toBe(value);
    });
  });

  describe('formatDateTimeLocal', () => {
    it('returns empty string for undefined', () => {
      expect(formatDateTimeLocal(undefined)).toBe('');
    });

    it('formats timestamp for datetime-local input', () => {
      const timestamp = parseDateTimeLocal('2026-08-25T14:30');

      expect(formatDateTimeLocal(timestamp)).toBe('2026-08-25T14:30');
    });
  });

  describe('formatDueDate', () => {
    it('returns empty string for undefined', () => {
      expect(formatDueDate(undefined)).toBe('');
    });

    it('formats timestamp as a readable date and time', () => {
      const timestamp = parseDateTimeLocal('2026-08-25T14:30');

      expect(formatDueDate(timestamp)).toBe('25 Aug 2026, 14:30');
    });
  });
});
