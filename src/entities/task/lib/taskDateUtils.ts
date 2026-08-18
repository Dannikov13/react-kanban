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

  const plainDateTime = Temporal.Instant.fromEpochMilliseconds(timestamp)
    .toZonedDateTimeISO(TIME_ZONE)
    .toPlainDateTime();

  return (
    [
      plainDateTime.year.toString().padStart(4, '0'),
      plainDateTime.month.toString().padStart(2, '0'),
      plainDateTime.day.toString().padStart(2, '0'),
    ].join('-') +
    'T' +
    [
      plainDateTime.hour.toString().padStart(2, '0'),
      plainDateTime.minute.toString().padStart(2, '0'),
    ].join(':')
  );
};

export const parseDateTimeLocal = (value: string): number | undefined => {
  if (!value) {
    return undefined;
  }

  const dateTime = Temporal.PlainDateTime.from(value);

  return dateTime.toZonedDateTime(TIME_ZONE).epochMilliseconds;
};
