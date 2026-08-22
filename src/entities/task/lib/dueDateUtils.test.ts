import { describe, expect, it } from 'vitest';
import { getDueDateStatus } from './dueDateUtils';

const TIME_ZONE = 'Europe/Kyiv';

const createTimestamp = (value: Temporal.PlainDateTime): number => {
  return value.toZonedDateTime(TIME_ZONE).epochMilliseconds;
};

const createDateTime = (
  date: Temporal.PlainDate,
  hour = 14,
  minute = 30,
): Temporal.PlainDateTime => {
  return date.toPlainDateTime({
    hour,
    minute,
  });
};

describe('getDueDateStatus', () => {
  it('returns none when due date is undefined', () => {
    expect(getDueDateStatus(undefined)).toBe('none');
  });

  it('returns overdue for a past date', () => {
    const today = Temporal.Now.plainDateISO(TIME_ZONE);
    const yesterday = today.subtract({ days: 1 });

    const timestamp = createTimestamp(createDateTime(yesterday));

    expect(getDueDateStatus(timestamp)).toBe('overdue');
  });

  it('returns today for today date', () => {
    const today = Temporal.Now.plainDateISO(TIME_ZONE);

    const timestamp = createTimestamp(createDateTime(today));

    expect(getDueDateStatus(timestamp)).toBe('today');
  });

  it('returns tomorrow for tomorrow date', () => {
    const today = Temporal.Now.plainDateISO(TIME_ZONE);
    const tomorrow = today.add({ days: 1 });

    const timestamp = createTimestamp(createDateTime(tomorrow));

    expect(getDueDateStatus(timestamp)).toBe('tomorrow');
  });

  it('returns upcoming for a future date', () => {
    const today = Temporal.Now.plainDateISO(TIME_ZONE);
    const futureDate = today.add({ days: 5 });

    const timestamp = createTimestamp(createDateTime(futureDate));

    expect(getDueDateStatus(timestamp)).toBe('upcoming');
  });
});
