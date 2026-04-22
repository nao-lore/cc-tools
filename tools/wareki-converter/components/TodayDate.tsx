"use client";

import { useState, useEffect } from "react";
import { getTodayWareki } from "../lib/wareki";

export default function TodayDate() {
  const [today, setToday] = useState<{
    western: string;
    wareki: string;
  } | null>(null);

  useEffect(() => {
    setToday(getTodayWareki());
  }, []);

  if (!today) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-5 shadow-md">
      <h2 className="text-sm font-medium opacity-90 mb-2">今日の日付</h2>
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
        <span className="text-2xl font-bold">{today.wareki}</span>
        <span className="text-lg opacity-90">{today.western}</span>
      </div>
    </div>
  );
}
