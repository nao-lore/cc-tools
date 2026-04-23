"use client";
import { useState, useMemo } from "react";

const DAYS = ["月", "火", "水", "木", "金", "土", "日"] as const;
type Day = typeof DAYS[number];

interface DaySchedule {
  enabled: boolean;
  workStart: string;
  workEnd: string;
  meetingHours: number;
  commuteHours: number;
  breakHours: number;
}

const DEFAULT_SCHEDULE: Record<Day, DaySchedule> = {
  月: { enabled: true, workStart: "09:00", workEnd: "18:00", meetingHours: 2, commuteHours: 1, breakHours: 1 },
  火: { enabled: true, workStart: "09:00", workEnd: "18:00", meetingHours: 1, commuteHours: 1, breakHours: 1 },
  水: { enabled: true, workStart: "09:00", workEnd: "18:00", meetingHours: 3, commuteHours: 1, breakHours: 1 },
  木: { enabled: true, workStart: "09:00", workEnd: "18:00", meetingHours: 1, commuteHours: 1, breakHours: 1 },
  金: { enabled: true, workStart: "09:00", workEnd: "18:00", meetingHours: 2, commuteHours: 1, breakHours: 1 },
  土: { enabled: false, workStart: "10:00", workEnd: "15:00", meetingHours: 0, commuteHours: 0, breakHours: 0.5 },
  日: { enabled: false, workStart: "10:00", workEnd: "12:00", meetingHours: 0, commuteHours: 0, breakHours: 0 },
};

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
}

function calcDeepWork(schedule: DaySchedule): number {
  if (!schedule.enabled) return 0;
  const total = parseTime(schedule.workEnd) - parseTime(schedule.workStart);
  const occupied = schedule.meetingHours + schedule.commuteHours + schedule.breakHours;
  return Math.max(0, total - occupied);
}

const TIPS = [
  { threshold: 20, label: "excellent", text: "素晴らしい！Cal Newport推奨の週20h以上のディープワーク時間を確保できています。", color: "text-green-700 bg-green-50 border-green-200" },
  { threshold: 15, label: "good", text: "良好。週15h以上の集中作業が可能です。さらに会議を減らすと生産性が上がります。", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { threshold: 8, label: "moderate", text: "週8〜14hは平均的。会議の連続を避け、午前中に集中ブロックを設けましょう。", color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  { threshold: 0, label: "low", text: "週8h未満は危険水域。会議の削減・リモートワーク活用を検討してください。", color: "text-red-700 bg-red-50 border-red-200" },
];

export default function DeepWorkCalculator() {
  const [schedule, setSchedule] = useState<Record<Day, DaySchedule>>(DEFAULT_SCHEDULE);
  const [targetHours, setTargetHours] = useState(20);
  const [blockSize, setBlockSize] = useState(90);

  const dayResults = useMemo(
    () =>
      DAYS.map((day) => ({
        day,
        deepWork: calcDeepWork(schedule[day]),
        enabled: schedule[day].enabled,
      })),
    [schedule]
  );

  const totalDeepWork = dayResults.reduce((s, r) => s + r.deepWork, 0);
  const maxDayDeepWork = Math.max(...dayResults.map((r) => r.deepWork), 1);
  const pct = Math.min(100, (totalDeepWork / targetHours) * 100);
  const blocksPerWeek = Math.floor((totalDeepWork * 60) / blockSize);

  const tip = TIPS.find((t) => totalDeepWork >= t.threshold) || TIPS[TIPS.length - 1];

  const updateDay = (day: Day, field: keyof DaySchedule, value: string | number | boolean) => {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  return (
    <div className="space-y-6">
      {/* Weekly schedule */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">週間スケジュールの設定</h2>
        <div className="space-y-3">
          {DAYS.map((day) => {
            const s = schedule[day];
            const dw = calcDeepWork(s);
            return (
              <div
                key={day}
                className={`rounded-xl border p-4 transition-colors ${s.enabled ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"}`}
              >
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={s.enabled}
                      onChange={(e) => updateDay(day, "enabled", e.target.checked)}
                      className="accent-indigo-600"
                    />
                    <span className="font-semibold text-gray-800 w-4">{day}</span>
                  </label>
                  <div className="flex items-center gap-1 text-sm">
                    <input
                      type="time"
                      value={s.workStart}
                      onChange={(e) => updateDay(day, "workStart", e.target.value)}
                      disabled={!s.enabled}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
                    />
                    <span className="text-gray-400">〜</span>
                    <input
                      type="time"
                      value={s.workEnd}
                      onChange={(e) => updateDay(day, "workEnd", e.target.value)}
                      disabled={!s.enabled}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
                    />
                  </div>
                  {s.enabled && (
                    <span className="ml-auto text-sm font-bold text-indigo-600">{dw.toFixed(1)}h 確保</span>
                  )}
                </div>
                {s.enabled && (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "会議 (h)", field: "meetingHours" as const },
                      { label: "通勤 (h)", field: "commuteHours" as const },
                      { label: "休憩 (h)", field: "breakHours" as const },
                    ].map(({ label, field }) => (
                      <div key={field}>
                        <label className="block text-xs text-gray-500 mb-1">{label}</label>
                        <input
                          type="number"
                          value={s[field]}
                          onChange={(e) => updateDay(day, field, Number(e.target.value))}
                          min={0}
                          step={0.5}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-lg font-semibold text-gray-800">週間ディープワーク時間</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">目標時間:</label>
            <input
              type="number"
              value={targetHours}
              onChange={(e) => setTargetHours(Number(e.target.value))}
              min={1}
              className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-500">h/週</span>
          </div>
        </div>

        {/* Day bars */}
        <div className="space-y-2 mb-6">
          {dayResults.filter((r) => r.enabled).map((r) => (
            <div key={r.day} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 w-4">{r.day}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-5 relative">
                <div
                  className="h-5 rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${(r.deepWork / maxDayDeepWork) * 100}%` }}
                />
              </div>
              <span className="text-sm text-indigo-700 font-medium w-12 text-right">{r.deepWork.toFixed(1)}h</span>
            </div>
          ))}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-indigo-700">{totalDeepWork.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">h/週</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-800">{(totalDeepWork / Math.max(dayResults.filter((r) => r.enabled).length, 1)).toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">h/日（平均）</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-800">{blocksPerWeek}</p>
            <p className="text-xs text-gray-500 mt-1">{blockSize}分ブロック数/週</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-800">{Math.round(totalDeepWork * 52)}</p>
            <p className="text-xs text-gray-500 mt-1">h/年</p>
          </div>
        </div>

        {/* Target progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>目標達成率</span>
            <span>{pct.toFixed(0)}%（目標 {targetHours}h）</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${pct >= 100 ? "bg-green-500" : pct >= 70 ? "bg-indigo-500" : "bg-yellow-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Block size control */}
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm text-gray-600">集中ブロック時間:</label>
          {[60, 90, 120].map((m) => (
            <button
              key={m}
              onClick={() => setBlockSize(m)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${blockSize === m ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {m}分
            </button>
          ))}
        </div>

        {/* Tip */}
        <div className={`rounded-xl border p-4 text-sm ${tip.color}`}>
          {tip.text}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">改善のヒント</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span><strong>会議のバッチ処理：</strong>午後にまとめて会議を入れ、午前中を丸ごと集中タイムに</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span><strong>通知オフ：</strong>Slackの自動応答を設定し、集中ブロック中は通知をゼロに</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span><strong>週に1日の「会議なし日」：</strong>水曜をノーミーティングデーにする企業が増加中</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-500 mt-0.5">•</span>
            <span><strong>段階的増加：</strong>いきなり4hブロックは難しい。25分×4セットから始める</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
