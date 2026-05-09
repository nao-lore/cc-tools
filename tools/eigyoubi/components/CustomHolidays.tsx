"use client";

import { useState } from "react";

interface CustomHolidaysProps {
  customHolidays: Set<string>;
  onAdd: (date: string) => void;
  onRemove: (date: string) => void;
}

export function CustomHolidays({
  customHolidays,
  onAdd,
  onRemove,
}: CustomHolidaysProps) {
  const [newDate, setNewDate] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const sorted = Array.from(customHolidays).sort();

  function addHoliday() {
    if (!newDate) return;
    onAdd(newDate);
    setNewDate("");
    setIsOpen(true);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span>
          <span className="block text-sm font-semibold text-slate-950">会社独自の休日</span>
          <span className="mt-0.5 block text-xs text-slate-500">年末年始、創立記念日、有給消化日などを追加できます。</span>
        </span>
        <span className="rounded-full border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600">
          {customHolidays.size}件
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="custom-holiday-date" className="text-xs font-medium text-slate-600">
              追加する休日
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="custom-holiday-date"
                type="date"
                value={newDate}
                onChange={(event) => setNewDate(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
              <button
                type="button"
                onClick={addHoliday}
                disabled={!newDate}
                className="whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                追加
              </button>
            </div>
          </div>

          {sorted.length > 0 ? (
            <ul className="space-y-2">
              {sorted.map((date) => (
                <li key={date} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm">
                  <span className="font-mono text-slate-800">{date}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(date)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    aria-label={`${date}を削除`}
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg bg-white px-3 py-2 text-sm text-slate-500">追加されたカスタム休日はありません。</p>
          )}
        </div>
      )}
    </div>
  );
}
