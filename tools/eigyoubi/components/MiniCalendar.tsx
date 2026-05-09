"use client";

import { useMemo } from "react";
import {
  formatDate,
  getHolidayName,
  isJapaneseHoliday,
  isWeekend,
} from "../lib/holidays";

interface MiniCalendarProps {
  startDate: Date;
  endDate: Date;
  customHolidays: Set<string>;
}

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];
const MONTH_NAMES = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

function getMonthsBetween(start: Date, end: Date): Date[] {
  const months: Date[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (current <= endMonth && months.length < 14) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

export function MiniCalendar({
  startDate,
  endDate,
  customHolidays,
}: MiniCalendarProps) {
  const months = useMemo(() => getMonthsBetween(startDate, endDate), [startDate, endDate]);
  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);
  const todayStr = formatDate(new Date());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-950">カレンダー確認</h3>
        <div className="flex flex-wrap justify-end gap-2 text-[11px] text-slate-500">
          <Legend color="bg-emerald-100" label="営業日" />
          <Legend color="bg-slate-100" label="土日" />
          <Legend color="bg-red-100" label="祝日" />
        </div>
      </div>
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

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-2.5 w-2.5 rounded-full border border-white ${color}`} />
      {label}
    </span>
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
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h4 className="text-center text-sm font-semibold text-slate-950">
        {year}年{MONTH_NAMES[month]}
      </h4>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {DAY_NAMES.map((name, index) => (
          <div
            key={name}
            className={`text-center text-[11px] font-semibold ${
              index === 0 ? "text-red-500" : index === 6 ? "text-sky-500" : "text-slate-500"
            }`}
          >
            {name}
          </div>
        ))}
        {cells.map((day, index) => {
          if (day === null) return <div key={`empty-${index}`} className="aspect-square" />;

          const date = new Date(year, month, day);
          const dateStr = formatDate(date);
          const inRange = dateStr >= rangeStart && dateStr <= rangeEnd;
          const weekend = isWeekend(date);
          const holiday = isJapaneseHoliday(date);
          const customHoliday = customHolidays.has(dateStr);
          const isToday = dateStr === today;
          const holidayName = getHolidayName(date) ?? (customHoliday ? "カスタム休日" : "");

          let className = "bg-white text-slate-800";
          if (inRange) className = "bg-emerald-50 text-emerald-900";
          if (weekend) className = inRange ? "bg-slate-100 text-slate-500" : "bg-slate-50 text-slate-400";
          if (holiday || customHoliday) className = inRange ? "bg-red-100 text-red-700" : "bg-red-50 text-red-500";
          if (isToday) className += " ring-2 ring-slate-950 ring-inset";

          return (
            <div
              key={dateStr}
              title={holidayName || undefined}
              className={`relative flex aspect-square items-center justify-center rounded-lg text-xs font-medium ${className}`}
            >
              {day}
              {(holiday || customHoliday) && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
