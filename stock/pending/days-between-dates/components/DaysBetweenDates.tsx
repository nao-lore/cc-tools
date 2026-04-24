"use client";

import { useState } from "react";

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseLocal(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function today(): string {
  return toDateString(new Date());
}

interface Breakdown {
  totalDays: number;
  weeks: number;
  remainderDays: number;
  months: number;
  remainderDaysAfterMonths: number;
  years: number;
  remainderMonths: number;
  remainderDaysAfterYears: number;
  workingDays: number;
  isFuture: boolean;
}

function calculate(startStr: string, endStr: string): Breakdown | null {
  if (!startStr || !endStr) return null;

  const start = parseLocal(startStr);
  const end = parseLocal(endStr);

  const msPerDay = 86400000;
  const diffMs = end.getTime() - start.getTime();
  const totalDays = Math.round(Math.abs(diffMs) / msPerDay);
  const isFuture = diffMs > 0;

  const weeks = Math.floor(totalDays / 7);
  const remainderDays = totalDays % 7;

  // Count working days
  let workingDays = 0;
  const earlier = diffMs <= 0 ? end : start;
  const later = diffMs <= 0 ? start : end;
  const cursor = new Date(earlier);
  while (cursor < later) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) workingDays++;
    cursor.setDate(cursor.getDate() + 1);
  }

  // Years + months + days breakdown
  let s = diffMs <= 0 ? end : start;
  let e = diffMs <= 0 ? start : end;
  let years = e.getFullYear() - s.getFullYear();
  let months = e.getMonth() - s.getMonth();
  let days = e.getDate() - s.getDate();
  if (days < 0) {
    months--;
    const prevMonth = new Date(e.getFullYear(), e.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  // Months + days breakdown
  let totalMonths = years * 12 + months;
  let remainderDaysAfterMonths = days;

  return {
    totalDays,
    weeks,
    remainderDays,
    months: totalMonths,
    remainderDaysAfterMonths,
    years,
    remainderMonths: months,
    remainderDaysAfterYears: days,
    workingDays,
    isFuture,
  };
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export default function DaysBetweenDates() {
  const [startDate, setStartDate] = useState<string>(today());
  const [endDate, setEndDate] = useState<string>(today());

  const result = calculate(startDate, endDate);

  function setFromToday() {
    setStartDate(today());
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Days Between Dates</h1>
          <p className="text-gray-500 text-sm mt-1">
            Calculate the exact number of days between two dates
          </p>
        </div>

        {/* Inputs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={setFromToday}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Set start to today
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-3">
            {/* Countdown banner for future dates */}
            {result.isFuture && result.totalDays > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
                <p className="text-blue-700 font-semibold text-lg">
                  {plural(result.totalDays, "day")} remaining
                </p>
                <p className="text-blue-500 text-xs mt-0.5">until the end date</p>
              </div>
            )}

            {result.totalDays === 0 && (
              <div className="bg-gray-100 rounded-2xl p-4 text-center">
                <p className="text-gray-600 font-medium">Same date — 0 days apart</p>
              </div>
            )}

            {result.totalDays > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                {/* Total days */}
                <div className="px-6 py-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total days</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {result.totalDays.toLocaleString()}
                  </span>
                </div>

                {/* Weeks + days */}
                <div className="px-6 py-3 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Weeks &amp; days</span>
                  <span className="text-sm font-medium text-gray-800">
                    {result.weeks > 0
                      ? `${plural(result.weeks, "week")}${result.remainderDays > 0 ? `, ${plural(result.remainderDays, "day")}` : ""}`
                      : plural(result.remainderDays, "day")}
                  </span>
                </div>

                {/* Months + days */}
                <div className="px-6 py-3 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Months &amp; days</span>
                  <span className="text-sm font-medium text-gray-800">
                    {result.months > 0
                      ? `${plural(result.months, "month")}${result.remainderDaysAfterMonths > 0 ? `, ${plural(result.remainderDaysAfterMonths, "day")}` : ""}`
                      : plural(result.remainderDaysAfterMonths, "day")}
                  </span>
                </div>

                {/* Years + months + days */}
                {result.years > 0 && (
                  <div className="px-6 py-3 flex justify-between items-center">
                    <span className="text-sm text-gray-600">Years, months &amp; days</span>
                    <span className="text-sm font-medium text-gray-800">
                      {plural(result.years, "year")}
                      {result.remainderMonths > 0 ? `, ${plural(result.remainderMonths, "month")}` : ""}
                      {result.remainderDaysAfterYears > 0
                        ? `, ${plural(result.remainderDaysAfterYears, "day")}`
                        : ""}
                    </span>
                  </div>
                )}

                {/* Working days */}
                <div className="px-6 py-3 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Working days</span>
                  <span className="text-sm font-medium text-gray-800">
                    {result.workingDays.toLocaleString()}
                    <span className="text-gray-400 font-normal ml-1">(excl. weekends)</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ad placeholder */}
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 h-24 flex items-center justify-center">
          <span className="text-xs text-gray-400 tracking-wide uppercase">Advertisement</span>
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Days Between Dates Calculator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Calculate the exact number of days between two dates. Just enter your values and get instant results.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">Is this tool free to use?</summary>
      <p className="mt-2 text-sm text-gray-600">Yes, completely free. No sign-up or account required.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">How accurate are the results?</summary>
      <p className="mt-2 text-sm text-gray-600">Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Days Between Dates Calculator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Calculate the exact number of days between two dates. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
