const TIME_ZONE = 'Europe/Kyiv';

export const formatDueDate = (timestamp?: number): string => {
  if (timestamp === undefined) {
    return '';
  }

  const instant = Temporal.Instant.fromEpochMilliseconds(timestamp);

  return instant
    .toZonedDateTimeISO(TIME_ZONE)
    .toPlainDateTime()
    .toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
};

export const formatDateTimeLocal = (timestamp?: number): string => {
  if (timestamp === undefined) {
    return '';
  }

  const instant = Temporal.Instant.fromEpochMilliseconds(timestamp);

  return instant
    .toZonedDateTimeISO(TIME_ZONE)
    .toPlainDateTime()
    .toString()
    .slice(0, 16);
};

export const parseDateTimeLocal = (value: string): number | undefined => {
  if (!value) {
    return undefined;
  }

  const dateTime = Temporal.PlainDateTime.from(value);

  return dateTime.toZonedDateTime(TIME_ZONE).epochMilliseconds;
};
