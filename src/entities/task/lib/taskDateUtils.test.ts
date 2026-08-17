import { describe, expect, it } from 'vitest';
import {
  formatDateTimeLocal,
  formatDueDate,
  parseDateTimeLocal,
} from './taskDateUtils';

describe('taskDateUtils', () => {
  const timestamp =
    Temporal.PlainDateTime.from('2026-08-21T15:30').toZonedDateTime(
      'Europe/Kyiv',
    ).epochMilliseconds;

  describe('formatDateTimeLocal', () => {
    it('formats timestamp for datetime-local input', () => {
      expect(formatDateTimeLocal(timestamp)).toBe('2026-08-21T15:30');
    });

    it('returns empty string for undefined timestamp', () => {
      expect(formatDateTimeLocal(undefined)).toBe('');
    });
  });

  describe('formatDueDate', () => {
    it('formats timestamp as readable date and time', () => {
      expect(formatDueDate(timestamp)).toBe('21 Aug 2026, 15:30');
    });

    it('returns empty string for undefined timestamp', () => {
      expect(formatDueDate(undefined)).toBe('');
    });
  });

  describe('parseDateTimeLocal', () => {
    it('converts datetime-local value to timestamp', () => {
      expect(parseDateTimeLocal('2026-08-21T15:30')).toBe(timestamp);
    });

    it('returns undefined for empty value', () => {
      expect(parseDateTimeLocal('')).toBeUndefined();
    });
  });
});
