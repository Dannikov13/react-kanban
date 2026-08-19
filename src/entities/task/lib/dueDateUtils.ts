const TIME_ZONE = 'Europe/Kyiv';

export type DueDateStatus =
  'none' | 'overdue' | 'today' | 'tomorrow' | 'upcoming';

export const getDueDateStatus = (timestamp?: number): DueDateStatus => {
  if (timestamp === undefined) {
    return 'none';
  }

  const dueDate = Temporal.Instant.fromEpochMilliseconds(timestamp)
    .toZonedDateTimeISO(TIME_ZONE)
    .toPlainDate();

  const today = Temporal.Now.plainDateISO(TIME_ZONE);

  if (Temporal.PlainDate.compare(dueDate, today) < 0) {
    return 'overdue';
  }

  if (Temporal.PlainDate.compare(dueDate, today) === 0) {
    return 'today';
  }

  const tomorrow = today.add({ days: 1 });

  if (Temporal.PlainDate.compare(dueDate, tomorrow) === 0) {
    return 'tomorrow';
  }

  return 'upcoming';
};
