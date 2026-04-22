"use client";

import { useState, useMemo } from "react";

interface Holiday {
  date: string;
  name: string;
}

const JAPANESE_HOLIDAYS: Holiday[] = [
  // 2024
  { date: "2024-01-01", name: "元日" },
  { date: "2024-01-08", name: "成人の日" },
  { date: "2024-02-11", name: "建国記念の日" },
  { date: "2024-02-12", name: "振替休日（建国記念の日）" },
  { date: "2024-02-23", name: "天皇誕生日" },
  { date: "2024-03-20", name: "春分の日" },
  { date: "2024-04-29", name: "昭和の日" },
  { date: "2024-05-03", name: "憲法記念日" },
  { date: "2024-05-04", name: "みどりの日" },
  { date: "2024-05-05", name: "こどもの日" },
  { date: "2024-05-06", name: "振替休日（こどもの日）" },
  { date: "2024-07-15", name: "海の日" },
  { date: "2024-08-11", name: "山の日" },
  { date: "2024-08-12", name: "振替休日（山の日）" },
  { date: "2024-09-16", name: "敬老の日" },
  { date: "2024-09-22", name: "秋分の日" },
  { date: "2024-09-23", name: "振替休日（秋分の日）" },
  { date: "2024-10-14", name: "スポーツの日" },
  { date: "2024-11-03", name: "文化の日" },
  { date: "2024-11-04", name: "振替休日（文化の日）" },
  { date: "2024-11-23", name: "勤労感謝の日" },
  // 2025
  { date: "2025-01-01", name: "元日" },
  { date: "2025-01-13", name: "成人の日" },
  { date: "2025-02-11", name: "建国記念の日" },
  { date: "2025-02-23", name: "天皇誕生日" },
  { date: "2025-02-24", name: "振替休日（天皇誕生日）" },
  { date: "2025-03-20", name: "春分の日" },
  { date: "2025-04-29", name: "昭和の日" },
  { date: "2025-05-03", name: "憲法記念日" },
  { date: "2025-05-04", name: "みどりの日" },
  { date: "2025-05-05", name: "こどもの日" },
  { date: "2025-05-06", name: "振替休日（こどもの日）" },
  { date: "2025-07-21", name: "海の日" },
  { date: "2025-08-11", name: "山の日" },
  { date: "2025-09-15", name: "敬老の日" },
  { date: "2025-09-23", name: "秋分の日" },
  { date: "2025-10-13", name: "スポーツの日" },
  { date: "2025-11-03", name: "文化の日" },
  { date: "2025-11-23", name: "勤労感謝の日" },
  { date: "2025-11-24", name: "振替休日（勤労感謝の日）" },
  // 2026
  { date: "2026-01-01", name: "元日" },
  { date: "2026-01-12", name: "成人の日" },
  { date: "2026-02-11", name: "建国記念の日" },
  { date: "2026-02-23", name: "天皇誕生日" },
  { date: "2026-03-20", name: "春分の日" },
  { date: "2026-04-29", name: "昭和の日" },
  { date: "2026-05-03", name: "憲法記念日" },
  { date: "2026-05-04", name: "みどりの日" },
  { date: "2026-05-05", name: "こどもの日" },
  { date: "2026-05-06", name: "振替休日（こどもの日）" },
  { date: "2026-07-20", name: "海の日" },
  { date: "2026-08-11", name: "山の日" },
  { date: "2026-09-21", name: "敬老の日" },
  { date: "2026-09-23", name: "秋分の日" },
  { date: "2026-10-12", name: "スポーツの日" },
  { date: "2026-11-03", name: "文化の日" },
  { date: "2026-11-23", name: "勤労感謝の日" },
  // 2027
  { date: "2027-01-01", name: "元日" },
  { date: "2027-01-11", name: "成人の日" },
  { date: "2027-02-11", name: "建国記念の日" },
  { date: "2027-02-23", name: "天皇誕生日" },
  { date: "2027-03-21", name: "春分の日" },
  { date: "2027-03-22", name: "振替休日（春分の日）" },
  { date: "2027-04-29", name: "昭和の日" },
  { date: "2027-05-03", name: "憲法記念日" },
  { date: "2027-05-04", name: "みどりの日" },
  { date: "2027-05-05", name: "こどもの日" },
  { date: "2027-07-19", name: "海の日" },
  { date: "2027-08-11", name: "山の日" },
  { date: "2027-09-20", name: "敬老の日" },
  { date: "2027-09-23", name: "秋分の日" },
  { date: "2027-10-11", name: "スポーツの日" },
  { date: "2027-11-03", name: "文化の日" },
  { date: "2027-11-23", name: "勤労感謝の日" },
];

const holidaySet = new Set(JAPANESE_HOLIDAYS.map((h) => h.date));

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getTodayStr(): string {
  return formatDate(new Date());
}

function getDefaultEndStr(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return formatDate(d);
}

function getHolidaysInRange(start: Date, end: Date): Holiday[] {
  const s = formatDate(start);
  const e = formatDate(end);
  return JAPANESE_HOLIDAYS.filter((h) => h.date >= s && h.date <= e);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function formatJpDate(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${DAY_NAMES[date.getDay()]}）`;
}

interface RangeResult {
  totalDays: number;
  weeks: number;
  remainingDays: number;
  months: number;
  remainingDaysAfterMonths: number;
  years: number;
  remainingMonths: number;
  finalRemainingDays: number;
  hours: number;
  minutes: number;
  seconds: number;
  holidays: Holiday[];
}

function calcRange(start: Date, end: Date): RangeResult {
  const diffMs = end.getTime() - start.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const weeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;

  // months diff
  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  const monthsEnd = new Date(start.getFullYear(), start.getMonth() + months, start.getDate());
  if (monthsEnd > end) months--;
  const afterMonths = new Date(start.getFullYear(), start.getMonth() + months, start.getDate());
  const remainingDaysAfterMonths = Math.floor(
    (end.getTime() - afterMonths.getTime()) / (1000 * 60 * 60 * 24)
  );

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const afterYears = new Date(start.getFullYear() + years, start.getMonth() + remainingMonths, start.getDate());
  const finalRemainingDays = Math.floor(
    (end.getTime() - afterYears.getTime()) / (1000 * 60 * 60 * 24)
  );

  const hours = totalDays * 24;
  const minutes = hours * 60;
  const seconds = minutes * 60;

  const holidays = getHolidaysInRange(start, end);

  return {
    totalDays,
    weeks,
    remainingDays,
    months,
    remainingDaysAfterMonths,
    years,
    remainingMonths,
    finalRemainingDays,
    hours,
    minutes,
    seconds,
    holidays,
  };
}

type Mode = "range" | "offset";
type Direction = "after" | "before";

export function DaysCalculator() {
  const [mode, setMode] = useState<Mode>("range");
  const [startDate, setStartDate] = useState(getTodayStr);
  const [endDate, setEndDate] = useState(getDefaultEndStr);
  const [offsetDays, setOffsetDays] = useState(30);
  const [direction, setDirection] = useState<Direction>("after");

  const rangeResult = useMemo((): RangeResult | null => {
    if (!startDate || !endDate) return null;
    const s = parseDate(startDate);
    const e = parseDate(endDate);
    if (s >= e) return null;
    return calcRange(s, e);
  }, [startDate, endDate]);

  const offsetResult = useMemo((): { date: Date; holidays: Holiday[] } | null => {
    if (!startDate || offsetDays < 1) return null;
    const s = parseDate(startDate);
    const delta = direction === "after" ? offsetDays : -offsetDays;
    const resultDate = addDays(s, delta);
    const rangeStart = direction === "after" ? s : resultDate;
    const rangeEnd = direction === "after" ? resultDate : s;
    const holidays = getHolidaysInRange(rangeStart, rangeEnd);
    return { date: resultDate, holidays };
  }, [startDate, offsetDays, direction]);

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
          2つの日付間の日数
        </button>
        <button
          onClick={() => setMode("offset")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            mode === "offset"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          ○日後・○日前の日付
        </button>
      </div>

      <div className="space-y-6">
        {/* Input Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {mode === "range" ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">期間を入力</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
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
                <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
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
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold mb-4">基準日と日数を入力</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="base-date" className="block text-sm font-medium text-gray-700 mb-1">
                    基準日
                  </label>
                  <input
                    id="base-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="offset-days" className="block text-sm font-medium text-gray-700 mb-1">
                    日数
                  </label>
                  <input
                    id="offset-days"
                    type="number"
                    min={1}
                    max={36500}
                    value={offsetDays}
                    onChange={(e) => setOffsetDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">方向</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDirection("after")}
                      className={`flex-1 py-2 text-sm rounded-md border transition-colors ${
                        direction === "after"
                          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                          : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      後
                    </button>
                    <button
                      onClick={() => setDirection("before")}
                      className={`flex-1 py-2 text-sm rounded-md border transition-colors ${
                        direction === "before"
                          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                          : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      前
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        {mode === "range" ? (
          rangeResult ? (
            <div className="space-y-4">
              {/* Primary result */}
              <div className="bg-[var(--color-primary)] text-white rounded-lg p-6 text-center">
                <p className="text-sm opacity-90 mb-1">日数</p>
                <p className="text-6xl font-bold mb-1">
                  {rangeResult.totalDays.toLocaleString()}
                  <span className="text-xl font-normal ml-1">日</span>
                </p>
                <p className="text-sm opacity-80">
                  {formatJpDate(parseDate(startDate))} 〜 {formatJpDate(parseDate(endDate))}
                </p>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <ResultCard
                  label="週数 + 日数"
                  value={`${rangeResult.weeks}週 ${rangeResult.remainingDays}日`}
                />
                <ResultCard
                  label="月数 + 日数"
                  value={`${rangeResult.months}ヶ月 ${rangeResult.remainingDaysAfterMonths}日`}
                />
                <ResultCard
                  label="年数 + 月数 + 日数"
                  value={`${rangeResult.years}年 ${rangeResult.remainingMonths}ヶ月 ${rangeResult.finalRemainingDays}日`}
                />
                <ResultCard
                  label="時間数"
                  value={`${rangeResult.hours.toLocaleString()}時間`}
                />
                <ResultCard
                  label="分数"
                  value={`${rangeResult.minutes.toLocaleString()}分`}
                />
                <ResultCard
                  label="秒数"
                  value={`${rangeResult.seconds.toLocaleString()}秒`}
                />
              </div>

              {/* Holidays */}
              {rangeResult.holidays.length > 0 && (
                <HolidayList holidays={rangeResult.holidays} />
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-400 text-sm">
              開始日と終了日を入力してください（終了日は開始日より後の日付）
            </div>
          )
        ) : offsetResult ? (
          <div className="space-y-4">
            <div className="bg-[var(--color-primary)] text-white rounded-lg p-6 text-center">
              <p className="text-sm opacity-90 mb-1">
                {formatJpDate(parseDate(startDate))} の {offsetDays}日{direction === "after" ? "後" : "前"}
              </p>
              <p className="text-3xl font-bold mb-1">
                {formatJpDate(offsetResult.date)}
              </p>
              <p className="text-sm opacity-80">
                {offsetResult.date.getFullYear()}年 第{Math.ceil((Math.floor((offsetResult.date.getTime() - new Date(offsetResult.date.getFullYear(), 0, 0).getTime()) / 86400000)) / 7)}週
              </p>
            </div>

            {offsetResult.holidays.length > 0 && (
              <HolidayList holidays={offsetResult.holidays} />
            )}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-400 text-sm">
            基準日と日数を入力してください
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-base font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function HolidayList({ holidays }: { holidays: Holiday[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        期間内の祝日（{holidays.length}日）
      </h3>
      <ul className="space-y-1">
        {holidays.map((h) => {
          const d = parseDate(h.date);
          return (
            <li
              key={h.date}
              className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0"
            >
              <span className="text-red-600 font-medium">{h.name}</span>
              <span className="text-gray-500">
                {d.getMonth() + 1}/{d.getDate()}（{DAY_NAMES[d.getDay()]}）
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
