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
    <div className="relative min-w-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          flex w-full min-w-0 items-center justify-between gap-2
          rounded-xl border
          border-slate-300 bg-white
          px-4 py-3
          text-left text-sm text-slate-700
          outline-none
          transition
          hover:border-slate-400
          focus:border-blue-500
          focus:ring-2 focus:ring-blue-100
          dark:border-slate-600
          dark:bg-slate-900
          dark:text-slate-200
          dark:hover:border-slate-500
          dark:focus:border-blue-400
          dark:focus:ring-blue-900/40
        "
      >
        <span className="min-w-0 truncate">
          {inputValue || 'Select date & time'}
        </span>

        <span className="shrink-0 text-slate-400 dark:text-slate-500">▾</span>
      </button>

      {isOpen && (
        <div
          className="
            absolute left-0 top-full z-50 mt-2
            w-full max-w-full
            min-w-0
            overflow-hidden
            rounded-2xl border
            border-slate-200 bg-white
            p-3 shadow-xl
            dark:border-slate-700
            dark:bg-slate-800
            sm:p-4
          "
        >
          {/* Calendar header */}
          <div className="mb-4 flex min-w-0 items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePreviousMonth}
              className="
                flex h-9 w-9 shrink-0 items-center justify-center
                rounded-lg
                text-lg text-slate-500
                transition
                hover:bg-slate-100 hover:text-slate-900
                focus:outline-none focus:ring-2 focus:ring-slate-200
                dark:text-slate-400
                dark:hover:bg-slate-700 dark:hover:text-white
                dark:focus:ring-slate-600
              "
              aria-label="Previous month"
            >
              ←
            </button>

            <div className="min-w-0 flex-1 text-center">
              <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {monthLabel}
              </h3>

              <button
                type="button"
                onClick={handleToday}
                className="
                  mt-1 text-xs font-medium
                  text-slate-500
                  transition
                  hover:text-slate-900
                  dark:text-slate-400
                  dark:hover:text-white
                "
              >
                Today
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="
                flex h-9 w-9 shrink-0 items-center justify-center
                rounded-lg
                text-lg text-slate-500
                transition
                hover:bg-slate-100 hover:text-slate-900
                focus:outline-none focus:ring-2 focus:ring-slate-200
                dark:text-slate-400
                dark:hover:bg-slate-700 dark:hover:text-white
                dark:focus:ring-slate-600
              "
              aria-label="Next month"
            >
              →
            </button>
          </div>

          {/* Weekdays */}
          <div
            className="
              mb-2 grid min-w-0 grid-cols-7
              text-center text-xs font-medium
              text-slate-400
              dark:text-slate-500
            "
          >
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Days */}
          <div className="grid min-w-0 grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek - 1 }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleSelectDay(day)}
                className={`
                  flex aspect-square min-w-0 items-center justify-center
                  rounded-lg text-sm
                  transition
                  focus:outline-none focus:ring-2
                  focus:ring-slate-200
                  dark:focus:ring-slate-600
                  ${
                    isSelectedDay(day)
                      ? 'bg-slate-900 font-semibold text-white dark:bg-white dark:text-slate-900'
                      : isToday(day)
                        ? 'bg-slate-100 font-semibold text-slate-900 hover:bg-slate-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                  }
                `}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Time */}
          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700">
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Time
            </p>

            <div className="flex min-w-0 items-center gap-2">
              <select
                value={selectedHour}
                onChange={(e) => handleHourChange(Number(e.target.value))}
                className="
                  min-w-0 flex-1
                  rounded-lg border
                  border-slate-300 bg-white
                  px-2 py-2
                  text-slate-700
                  outline-none
                  transition
                  hover:border-slate-400
                  focus:border-blue-500
                  focus:ring-2 focus:ring-blue-100
                  dark:border-slate-600
                  dark:bg-slate-900
                  dark:text-slate-200
                  dark:hover:border-slate-500
                  dark:focus:border-blue-400
                  dark:focus:ring-blue-900/40
                "
                aria-label="Hour"
              >
                {Array.from({ length: 24 }, (_, hour) => (
                  <option key={hour} value={hour}>
                    {hour.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>

              <span className="shrink-0 font-semibold text-slate-500 dark:text-slate-400">
                :
              </span>

              <select
                value={selectedMinute}
                onChange={(e) => handleMinuteChange(Number(e.target.value))}
                className="
                  min-w-0 flex-1
                  rounded-lg border
                  border-slate-300 bg-white
                  px-2 py-2
                  text-slate-700
                  outline-none
                  transition
                  hover:border-slate-400
                  focus:border-blue-500
                  focus:ring-2 focus:ring-blue-100
                  dark:border-slate-600
                  dark:bg-slate-900
                  dark:text-slate-200
                  dark:hover:border-slate-500
                  dark:focus:border-blue-400
                  dark:focus:ring-blue-900/40
                "
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

          {/* Actions */}
          <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setIsOpen(false);
              }}
              className="
                rounded-lg px-3 py-2
                text-sm font-medium
                text-slate-600
                transition
                hover:bg-slate-100
                dark:text-slate-300
                dark:hover:bg-slate-700
              "
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="
                rounded-lg
                bg-slate-900
                px-3 py-2
                text-sm font-medium text-white
                transition
                hover:bg-slate-700
                focus:outline-none
                focus:ring-2 focus:ring-slate-300
                dark:bg-white
                dark:text-slate-900
                dark:hover:bg-slate-200
                dark:focus:ring-slate-500
              "
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
