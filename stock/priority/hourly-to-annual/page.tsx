"use client";
import HourlyToAnnual from "./components/HourlyToAnnual";

export default function HourlyToAnnualPage() {
  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)" }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">時給 ↔ 年収 ↔ 月収 逆算</h1>
        <p className="text-gray-600 mb-8">正社員・パート・フリーランス対応。勤務時間・有給・残業込みで正確に換算</p>
        <HourlyToAnnual />
      </div>
    </div>
  );
}
