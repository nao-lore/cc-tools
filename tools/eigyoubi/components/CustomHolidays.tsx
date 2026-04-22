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

  const handleAdd = () => {
    if (newDate) {
      onAdd(newDate);
      setNewDate("");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-700"
      >
        <span>カスタム休日（{customHolidays.size}件）</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-gray-500">
            会社独自の休業日や有給休暇など、追加の休日を設定できます。
          </p>
          <div className="flex gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />
            <button
              onClick={handleAdd}
              disabled={!newDate}
              className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm rounded-md hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              追加
            </button>
          </div>

          {sorted.length > 0 && (
            <ul className="space-y-1">
              {sorted.map((date) => (
                <li
                  key={date}
                  className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded text-sm"
                >
                  <span>{date}</span>
                  <button
                    onClick={() => onRemove(date)}
                    className="text-red-500 hover:text-red-700 text-xs"
                    aria-label={`${date}を削除`}
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
