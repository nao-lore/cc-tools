"use client";
import HourlyToAnnual from "./components/HourlyToAnnual";

export default function HourlyToAnnualPage() {
  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ background: "linear-gradient(to bottom right, #0f0a1a, #1a1030, #0d0d2b)" }}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">時給 ↔ 年収 ↔ 月収 逆算</h1>
        <p className="text-violet-100 mb-8">正社員・パート・フリーランス対応。勤務時間・有給・残業込みで正確に換算</p>
        <HourlyToAnnual />
      </div>
    </div>
  );
}
