import { useState } from 'react';
import {
  formatDueDate,
  parseDateTimeLocal,
} from '@/entities/task/lib/taskDateUtils';

interface DateTimePickerProps {
  value?: number;
  onChange: (value: number | undefined) => void;
}

const TIME_ZONE = 'Europe/Kyiv';

const DateTimePicker = ({ value, onChange }: DateTimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedDateTime = value
    ? Temporal.Instant.fromEpochMilliseconds(value)
        .toZonedDateTimeISO(TIME_ZONE)
        .toPlainDateTime()
    : undefined;

  const today = Temporal.Now.plainDateISO(TIME_ZONE);
  const now = Temporal.Now.plainTimeISO(TIME_ZONE);

  const selectedDate = selectedDateTime?.toPlainDate() ?? today;

  const [visibleMonth, setVisibleMonth] = useState(
    Temporal.PlainYearMonth.from({
      year: selectedDate.year,
      month: selectedDate.month,
    }),
  );

  const inputValue = formatDueDate(value);

  const selectedHour = selectedDateTime?.hour ?? now.hour;
  const selectedMinute = selectedDateTime?.minute ?? now.minute;

  const daysInMonth = visibleMonth.daysInMonth;

  const firstDay = Temporal.PlainDate.from({
    year: visibleMonth.year,
    month: visibleMonth.month,
    day: 1,
  });

  const firstDayOfWeek = firstDay.dayOfWeek;

  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  const monthFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const visibleMonthDate = new Date(
    visibleMonth.year,
    visibleMonth.month - 1,
    1,
  );

  const monthLabel = monthFormatter.format(visibleMonthDate);

  const handlePreviousMonth = () => {
    setVisibleMonth((prev) => prev.subtract({ months: 1 }));
  };

  const handleNextMonth = () => {
    setVisibleMonth((prev) => prev.add({ months: 1 }));
  };

  const updateDateTime = (
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
  ) => {
    const dateTime = Temporal.PlainDateTime.from({
      year,
      month,
      day,
      hour,
      minute,
    });

    const value = parseDateTimeLocal(
      `${dateTime.year.toString().padStart(4, '0')}-` +
        `${dateTime.month.toString().padStart(2, '0')}-` +
        `${dateTime.day.toString().padStart(2, '0')}T` +
        `${dateTime.hour.toString().padStart(2, '0')}:` +
        `${dateTime.minute.toString().padStart(2, '0')}`,
    );

    onChange(value);
  };

  const handleToday = () => {
    setVisibleMonth(
      Temporal.PlainYearMonth.from({
        year: today.year,
        month: today.month,
      }),
    );

    updateDateTime(
      today.year,
      today.month,
      today.day,
      selectedHour,
      selectedMinute,
    );
  };

  const handleSelectDay = (day: number) => {
    updateDateTime(
      visibleMonth.year,
      visibleMonth.month,
      day,
      selectedHour,
      selectedMinute,
    );
  };

  const handleHourChange = (hour: number) => {
    updateDateTime(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day,
      hour,
      selectedMinute,
    );
  };

  const handleMinuteChange = (minute: number) => {
    updateDateTime(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day,
      selectedHour,
      minute,
    );
  };

  const isSelectedDay = (day: number) => {
    return (
      selectedDate.year === visibleMonth.year &&
      selectedDate.month === visibleMonth.month &&
      selectedDate.day === day
    );
  };

  const isToday = (day: number) => {
    return (
      today.year === visibleMonth.year &&
      today.month === visibleMonth.month &&
      today.day === day
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-slate-700 outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      >
        <span>{inputValue || 'Select date & time'}</span>

        <span className="text-slate-400">▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-2 w-full min-w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePreviousMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
              aria-label="Previous month"
            >
              ←
            </button>

            <div className="flex flex-col items-center">
              <h3 className="text-sm font-semibold text-slate-900">
                {monthLabel}
              </h3>

              <button
                type="button"
                onClick={handleToday}
                className="mt-1 text-xs font-medium text-slate-500 transition hover:text-slate-900"
              >
                Today
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
              aria-label="Next month"
            >
              →
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-slate-400">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek - 1 }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleSelectDay(day)}
                className={`flex h-9 items-center justify-center rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-slate-200 ${
                  isSelectedDay(day)
                    ? 'bg-slate-900 font-semibold text-white'
                    : isToday(day)
                      ? 'bg-slate-100 font-semibold text-slate-900 hover:bg-slate-200'
                      : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-2 text-sm font-medium text-slate-700">Time</p>

            <div className="flex items-center gap-2">
              <select
                value={selectedHour}
                onChange={(e) => handleHourChange(Number(e.target.value))}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                aria-label="Hour"
              >
                {Array.from({ length: 24 }, (_, hour) => (
                  <option key={hour} value={hour}>
                    {hour.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>

              <span className="font-semibold text-slate-500">:</span>

              <select
                value={selectedMinute}
                onChange={(e) => handleMinuteChange(Number(e.target.value))}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                aria-label="Minute"
              >
                {Array.from({ length: 12 }, (_, index) => {
                  const minute = index * 5;

                  return (
                    <option key={minute} value={minute}>
                      {minute.toString().padStart(2, '0')}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setIsOpen(false);
              }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
