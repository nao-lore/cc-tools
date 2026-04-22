"use client";

import { useMemo } from "react";
import {
  isWeekend,
  isJapaneseHoliday,
  getHolidayName,
  formatDate,
} from "../lib/holidays";

interface MiniCalendarProps {
  startDate: Date;
  endDate: Date;
  customHolidays: Set<string>;
}

function getMonthsBetween(start: Date, end: Date): Date[] {
  const months: Date[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (current <= endMonth) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function MiniCalendar({
  startDate,
  endDate,
  customHolidays,
}: MiniCalendarProps) {
  const months = useMemo(
    () => getMonthsBetween(startDate, endDate),
    [startDate, endDate]
  );

  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);
  const todayStr = formatDate(new Date());

  return (
    <div className="space-y-4">
      {months.map((monthDate) => (
        <MonthView
          key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`}
          year={monthDate.getFullYear()}
          month={monthDate.getMonth()}
          rangeStart={startStr}
          rangeEnd={endStr}
          today={todayStr}
          customHolidays={customHolidays}
        />
      ))}
    </div>
  );
}

interface MonthViewProps {
  year: number;
  month: number;
  rangeStart: string;
  rangeEnd: string;
  today: string;
  customHolidays: Set<string>;
}

function MonthView({
  year,
  month,
  rangeStart,
  rangeEnd,
  today,
  customHolidays,
}: MonthViewProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
  const monthNames = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-center font-semibold text-sm mb-3">
        {year}年{monthNames[month]}
      </h3>
      <div className="grid grid-cols-7 gap-0">
        {dayNames.map((name, i) => (
          <div
            key={name}
            className={`text-center text-xs font-medium py-1 ${
              i === 0
                ? "text-red-500"
                : i === 6
                  ? "text-blue-500"
                  : "text-gray-500"
            }`}
          >
            {name}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="p-1" />;
          }

          const date = new Date(year, month, day);
          const dateStr = formatDate(date);
          const inRange = dateStr >= rangeStart && dateStr <= rangeEnd;
          const weekend = isWeekend(date);
          const holiday = isJapaneseHoliday(date);
          const customHoliday = customHolidays.has(dateStr);
          const isToday = dateStr === today;
          const holidayName = getHolidayName(date);
          const dayOfWeek = date.getDay();

          let bgClass = "";
          let textClass = "text-gray-900";

          if (inRange) {
            bgClass = "bg-blue-50";
          }

          if (holiday || customHoliday) {
            bgClass = inRange ? "bg-red-100" : "bg-red-50";
            textClass = "text-red-600";
          } else if (weekend) {
            bgClass = inRange ? "bg-gray-100" : "bg-gray-50";
            textClass = dayOfWeek === 0 ? "text-red-400" : "text-blue-400";
          }

          if (isToday) {
            bgClass += " ring-2 ring-[var(--color-primary)] ring-inset";
          }

          return (
            <div
              key={dateStr}
              className={`relative p-1 text-center rounded-md ${bgClass}`}
              title={
                holidayName ||
                (customHoliday ? "カスタム休日" : undefined)
              }
            >
              <span className={`text-xs ${textClass}`}>{day}</span>
              {(holiday || customHoliday) && inRange && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500" />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-3 text-[10px] text-gray-500 justify-center">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-blue-50 border border-gray-200" />
          営業日
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-gray-100 border border-gray-200" />
          土日
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-red-100 border border-gray-200" />
          祝日
        </span>
      </div>
    </div>
  );
}
