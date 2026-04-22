"use client";

import { useState, useMemo, useCallback } from "react";
import {
  countBusinessDays,
  addBusinessDays,
  parseDate,
  formatDate,
  getHolidaysInRange,
  type Holiday,
} from "../lib/holidays";
import { MiniCalendar } from "./MiniCalendar";
import { CustomHolidays } from "./CustomHolidays";

type Mode = "range" | "reverse";

function getTodayStr(): string {
  return formatDate(new Date());
}

function getDefaultEndStr(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return formatDate(d);
}

export function BusinessDaysCalculator() {
  const [mode, setMode] = useState<Mode>("range");
  const [startDate, setStartDate] = useState(getTodayStr);
  const [endDate, setEndDate] = useState(getDefaultEndStr);
  const [numDays, setNumDays] = useState(10);
  const [customHolidays, setCustomHolidays] = useState<Set<string>>(
    new Set()
  );

  const handleAddCustomHoliday = useCallback((date: string) => {
    setCustomHolidays((prev) => {
      const next = new Set(prev);
      next.add(date);
      return next;
    });
  }, []);

  const handleRemoveCustomHoliday = useCallback((date: string) => {
    setCustomHolidays((prev) => {
      const next = new Set(prev);
      next.delete(date);
      return next;
    });
  }, []);

  const rangeResult = useMemo(() => {
    if (mode !== "range" || !startDate || !endDate) return null;
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (start > end) return null;
    return countBusinessDays(start, end, customHolidays);
  }, [mode, startDate, endDate, customHolidays]);

  const reverseResult = useMemo(() => {
    if (mode !== "reverse" || !startDate || numDays < 1) return null;
    const start = parseDate(startDate);
    const resultDate = addBusinessDays(start, numDays, customHolidays);
    return {
      date: resultDate,
      dateStr: formatDate(resultDate),
    };
  }, [mode, startDate, numDays, customHolidays]);

  const calendarStart = useMemo(() => {
    if (!startDate) return new Date();
    return parseDate(startDate);
  }, [startDate]);

  const calendarEnd = useMemo(() => {
    if (mode === "range" && endDate) return parseDate(endDate);
    if (mode === "reverse" && reverseResult) return reverseResult.date;
    const d = new Date(calendarStart);
    d.setMonth(d.getMonth() + 1);
    return d;
  }, [mode, endDate, reverseResult, calendarStart]);

  const holidaysInRange = useMemo(() => {
    return getHolidaysInRange(calendarStart, calendarEnd);
  }, [calendarStart, calendarEnd]);

  const totalCalendarDays = useMemo(() => {
    if (!startDate) return 0;
    const start = parseDate(startDate);
    const end =
      mode === "range" && endDate
        ? parseDate(endDate)
        : mode === "reverse" && reverseResult
          ? reverseResult.date
          : start;
    return Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
  }, [mode, startDate, endDate, reverseResult]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Mode Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          onClick={() => setMode("range")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            mode === "range"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          期間指定で計算
        </button>
        <button
          onClick={() => setMode("reverse")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            mode === "reverse"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          営業日数から逆算
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              {mode === "range" ? "期間を入力" : "開始日と営業日数を入力"}
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="start-date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  開始日
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>

              {mode === "range" ? (
                <div>
                  <label
                    htmlFor="end-date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    終了日
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="num-days"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    営業日数
                  </label>
                  <input
                    id="num-days"
                    type="number"
                    min={1}
                    max={365}
                    value={numDays}
                    onChange={(e) =>
                      setNumDays(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Result */}
          <div className="bg-[var(--color-primary)] text-white rounded-lg p-6">
            {mode === "range" ? (
              rangeResult ? (
                <div className="text-center">
                  <p className="text-sm opacity-90 mb-1">営業日数</p>
                  <p className="text-5xl font-bold mb-2">
                    {rangeResult.count}
                    <span className="text-lg font-normal ml-1">日</span>
                  </p>
                  <p className="text-sm opacity-80">
                    （全{totalCalendarDays}日中 / 祝日
                    {rangeResult.holidays.length}日を除く）
                  </p>
                </div>
              ) : (
                <p className="text-center text-sm opacity-80">
                  正しい日付範囲を入力してください
                </p>
              )
            ) : reverseResult ? (
              <div className="text-center">
                <p className="text-sm opacity-90 mb-1">
                  {numDays}営業日後の日付
                </p>
                <p className="text-3xl font-bold mb-2">
                  {reverseResult.date.getFullYear()}年
                  {reverseResult.date.getMonth() + 1}月
                  {reverseResult.date.getDate()}日
                </p>
                <p className="text-sm opacity-80">
                  （
                  {["日", "月", "火", "水", "木", "金", "土"][
                    reverseResult.date.getDay()
                  ]}
                  曜日）
                </p>
              </div>
            ) : (
              <p className="text-center text-sm opacity-80">
                開始日と営業日数を入力してください
              </p>
            )}
          </div>

          {/* Holidays in range */}
          {holidaysInRange.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                期間内の祝日（{holidaysInRange.length}日）
              </h3>
              <ul className="space-y-1">
                {holidaysInRange.map((h) => (
                  <li
                    key={h.date}
                    className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-[var(--color-holiday-text)] font-medium">
                      {h.name}
                    </span>
                    <span className="text-gray-500">
                      {formatHolidayDate(h.date)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Custom Holidays */}
          <CustomHolidays
            customHolidays={customHolidays}
            onAdd={handleAddCustomHoliday}
            onRemove={handleRemoveCustomHoliday}
          />
        </div>

        {/* Calendar Section */}
        <div>
          <MiniCalendar
            startDate={calendarStart}
            endDate={calendarEnd}
            customHolidays={customHolidays}
          />
        </div>
      </div>
    </div>
  );
}

function formatHolidayDate(dateStr: string): string {
  const d = parseDate(dateStr);
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getMonth() + 1}/${d.getDate()}（${dayNames[d.getDay()]}）`;
}
