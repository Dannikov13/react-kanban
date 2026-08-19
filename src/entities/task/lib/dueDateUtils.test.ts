import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDueDateStatus } from './dueDateUtils';

const TIME_ZONE = 'Europe/Kyiv';

const createTimestamp = (value: string): number => {
  return Temporal.PlainDateTime.from(value).toZonedDateTime(TIME_ZONE)
    .epochMilliseconds;
};

describe('getDueDateStatus', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns none when due date is undefined', () => {
    expect(getDueDateStatus(undefined)).toBe('none');
  });

  it('returns overdue for a past date', () => {
    vi.setSystemTime(new Date('2026-08-19T12:00:00+03:00'));

    const timestamp = createTimestamp('2026-08-18T14:30');

    expect(getDueDateStatus(timestamp)).toBe('overdue');
  });

  it('returns today for today date', () => {
    vi.setSystemTime(new Date('2026-08-19T12:00:00+03:00'));

    const timestamp = createTimestamp('2026-08-19T14:30');

    expect(getDueDateStatus(timestamp)).toBe('today');
  });

  it('returns tomorrow for tomorrow date', () => {
    vi.setSystemTime(new Date('2026-08-19T12:00:00+03:00'));

    const timestamp = createTimestamp('2026-08-20T14:30');

    expect(getDueDateStatus(timestamp)).toBe('tomorrow');
  });

  it('returns upcoming for a future date', () => {
    vi.setSystemTime(new Date('2026-08-19T12:00:00+03:00'));

    const timestamp = createTimestamp('2026-08-25T14:30');

    expect(getDueDateStatus(timestamp)).toBe('upcoming');
  });
});
