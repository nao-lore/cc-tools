"use client";

import { useState, useMemo } from "react";

// --- Types ---
interface Subject {
  id: string;
  name: string;
  totalHours: number;
  priority: "high" | "medium" | "low";
  currentLevel: number; // 0-100%
}

interface DayPlan {
  date: string;
  dayOfWeek: string;
  subjects: { name: string; hours: number; color: string }[];
  totalHours: number;
  isToday: boolean;
  isPast: boolean;
}

// --- Helpers ---
function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function getDayOfWeek(date: Date): string {
  return ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
}

function formatDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

const PRIORITY_ORDER: Record<Subject["priority"], number> = { high: 3, medium: 2, low: 1 };
const PRIORITY_LABELS: Record<Subject["priority"], string> = { high: "高", medium: "中", low: "低" };
const PRIORITY_COLORS: Record<Subject["priority"], string> = {
  high: "text-red-600 bg-red-50 border-red-200",
  medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  low: "text-green-600 bg-green-50 border-green-200",
};
const SUBJECT_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500",
  "bg-pink-500", "bg-teal-500", "bg-red-500", "bg-indigo-500",
];

function generateSchedule(
  subjects: Subject[],
  examDate: Date,
  startDate: Date,
  dailyHours: number,
  offDays: number[] // 0=Sun, 6=Sat
): DayPlan[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: DayPlan[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const exam = new Date(examDate);
  exam.setHours(0, 0, 0, 0);

  // Sort subjects by priority * remaining hours needed
  const sortedSubjects = [...subjects].sort((a, b) => {
    const aScore = PRIORITY_ORDER[a.priority] * (a.totalHours * (1 - a.currentLevel / 100));
    const bScore = PRIORITY_ORDER[b.priority] * (b.totalHours * (1 - b.currentLevel / 100));
    return bScore - aScore;
  });

  // Track remaining hours per subject
  const remaining: Record<string, number> = {};
  for (const s of subjects) {
    remaining[s.id] = s.totalHours * (1 - s.currentLevel / 100);
  }

  while (current < exam) {
    const dow = current.getDay();
    const isOff = offDays.includes(dow);

    if (!isOff) {
      let hoursLeft = dailyHours;
      const daySubjects: { name: string; hours: number; color: string }[] = [];

      for (let i = 0; i < sortedSubjects.length && hoursLeft > 0; i++) {
        const s = sortedSubjects[i];
        if (remaining[s.id] <= 0) continue;
        const alloc = Math.min(remaining[s.id], hoursLeft, dailyHours * 0.6);
        const rounded = Math.round(alloc * 2) / 2; // round to 0.5
        if (rounded <= 0) continue;
        daySubjects.push({ name: s.name, hours: rounded, color: SUBJECT_COLORS[subjects.indexOf(s) % SUBJECT_COLORS.length] });
        remaining[s.id] -= rounded;
        hoursLeft -= rounded;
      }

      const dateStr = formatDate(current);
      const isToday = current.getTime() === today.getTime();
      const isPast = current < today;

      days.push({
        date: dateStr,
        dayOfWeek: getDayOfWeek(current),
        subjects: daySubjects,
        totalHours: daySubjects.reduce((s, d) => s + d.hours, 0),
        isToday,
        isPast,
      });
    }

    current.setDate(current.getDate() + 1);
    if (days.length > 90) break; // safety limit
  }

  return days;
}

// --- Component ---
export default function StudySchedule() {
  const today = new Date();
  const defaultExam = new Date(today);
  defaultExam.setDate(defaultExam.getDate() + 30);

  const [examDateStr, setExamDateStr] = useState(defaultExam.toISOString().split("T")[0]);
  const [startDateStr, setStartDateStr] = useState(today.toISOString().split("T")[0]);
  const [dailyHours, setDailyHours] = useState(3);
  const [offDays, setOffDays] = useState<number[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: uid(), name: "数学", totalHours: 40, priority: "high", currentLevel: 30 },
    { id: uid(), name: "英語", totalHours: 30, priority: "high", currentLevel: 50 },
    { id: uid(), name: "理科", totalHours: 20, priority: "medium", currentLevel: 20 },
  ]);
  const [generated, setGenerated] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const addSubject = () =>
    setSubjects((prev) => [...prev, { id: uid(), name: "", totalHours: 10, priority: "medium", currentLevel: 0 }]);

  const updateSubject = <K extends keyof Subject>(id: string, key: K, val: Subject[K]) =>
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: val } : s)));

  const removeSubject = (id: string) =>
    setSubjects((prev) => prev.filter((s) => s.id !== id));

  const toggleOffDay = (day: number) =>
    setOffDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);

  const schedule = useMemo(() => {
    if (!generated) return [];
    const examDate = new Date(examDateStr + "T00:00:00");
    const startDate = new Date(startDateStr + "T00:00:00");
    return generateSchedule(subjects.filter((s) => s.name), examDate, startDate, dailyHours, offDays);
  }, [generated, examDateStr, startDateStr, dailyHours, offDays, subjects]);

  const totalDays = schedule.length;
  const totalStudyHours = schedule.reduce((s, d) => s + d.totalHours, 0);
  const daysUntilExam = Math.ceil(
    (new Date(examDateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const DAYS = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="space-y-5">
      {/* Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700">基本設定</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">試験日</label>
            <input
              type="date"
              value={examDateStr}
              onChange={(e) => setExamDateStr(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">学習開始日</label>
            <input
              type="date"
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-500">1日の学習時間</label>
            <span className="text-sm font-bold text-blue-600">{dailyHours}時間</span>
          </div>
          <input
            type="range" min="1" max="12" step="0.5"
            value={dailyHours}
            onChange={(e) => setDailyHours(parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-2 block">休日（勉強しない曜日）</label>
          <div className="flex gap-2">
            {DAYS.map((d, i) => (
              <button
                key={i}
                onClick={() => toggleOffDay(i)}
                className={`w-9 h-9 rounded-full text-xs font-semibold border transition-colors ${
                  offDays.includes(i)
                    ? "bg-gray-400 text-white border-gray-400"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">科目設定</h2>
          <button
            onClick={addSubject}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + 科目追加
          </button>
        </div>
        <div className="space-y-3">
          {subjects.map((s, i) => (
            <div key={s.id} className="grid grid-cols-1 sm:grid-cols-[1fr,80px,90px,80px,auto] gap-2 items-center p-3 bg-gray-50 rounded-xl">
              <input
                type="text"
                value={s.name}
                onChange={(e) => updateSubject(s.id, "name", e.target.value)}
                placeholder="科目名"
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <div>
                <div className="text-xs text-gray-400 mb-0.5">必要時間</div>
                <input
                  type="number"
                  value={s.totalHours}
                  min={1}
                  max={500}
                  onChange={(e) => updateSubject(s.id, "totalHours", parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none text-center"
                />
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">優先度</div>
                <select
                  value={s.priority}
                  onChange={(e) => updateSubject(s.id, "priority", e.target.value as Subject["priority"])}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none"
                >
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">現在度 {s.currentLevel}%</div>
                <input
                  type="range" min={0} max={90} step={5}
                  value={s.currentLevel}
                  onChange={(e) => updateSubject(s.id, "currentLevel", parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
              <button
                onClick={() => removeSubject(s.id)}
                className="text-gray-400 hover:text-red-500 text-sm px-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={() => setGenerated(true)}
        disabled={subjects.filter((s) => s.name).length === 0}
        className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        学習計画を生成
      </button>

      {/* Results */}
      {generated && schedule.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "試験まで", value: `${daysUntilExam}日`, color: "text-red-600" },
              { label: "学習日数", value: `${totalDays}日`, color: "text-blue-600" },
              { label: "総学習時間", value: `${totalStudyHours}h`, color: "text-green-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${viewMode === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              リスト表示
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${viewMode === "calendar" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
            >
              週別表示
            </button>
          </div>

          {/* Schedule list */}
          {viewMode === "list" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {schedule.map((day, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border ${
                      day.isToday
                        ? "border-blue-400 bg-blue-50"
                        : day.isPast
                        ? "border-gray-100 bg-gray-50 opacity-60"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-semibold ${day.isToday ? "text-blue-700" : "text-gray-700"}`}>
                        {day.date}({day.dayOfWeek})
                        {day.isToday && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">今日</span>}
                      </span>
                      <span className="text-xs text-gray-500">{day.totalHours}h</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {day.subjects.map((sub, j) => (
                        <span key={j} className={`px-2 py-0.5 rounded-full text-white text-xs font-medium ${sub.color}`}>
                          {sub.name} {sub.hours}h
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === "calendar" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                {DAYS.map((d) => <div key={d} className="font-semibold">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const startDate = new Date(startDateStr + "T00:00:00");
                  const firstDow = startDate.getDay();
                  const cells: JSX.Element[] = [];
                  // Empty cells before start
                  for (let i = 0; i < firstDow; i++) {
                    cells.push(<div key={`e${i}`} />);
                  }
                  for (const day of schedule) {
                    const hasStudy = day.subjects.length > 0;
                    cells.push(
                      <div
                        key={day.date}
                        className={`aspect-square rounded-lg p-1 text-center text-xs ${
                          day.isToday ? "ring-2 ring-blue-500" : ""
                        } ${hasStudy ? "bg-blue-50 border border-blue-200" : "bg-gray-50"}`}
                      >
                        <div className={`font-semibold ${day.isToday ? "text-blue-600" : "text-gray-600"}`}>
                          {day.date.split("/")[1]}
                        </div>
                        {hasStudy && (
                          <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                            {day.subjects.slice(0, 3).map((sub, j) => (
                              <div key={j} className={`w-2 h-2 rounded-full ${sub.color}`} title={sub.name} />
                            ))}
                          </div>
                        )}
                      
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この試験日逆算 学習計画ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">試験日から逆算して最適な学習計画を自動生成するツール。入力するだけで即座に結果を表示します。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">利用料金はかかりますか？</summary>
      <p className="mt-2 text-sm text-gray-600">完全無料でご利用いただけます。会員登録も不要です。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">計算結果は正確ですか？</summary>
      <p className="mt-2 text-sm text-gray-600">一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この試験日逆算 学習計画ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "試験日から逆算して最適な学習計画を自動生成するツール。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                    );
                  }
                  return cells;
                })()}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-2 mt-3">
                {subjects.filter(s => s.name).map((s, i) => (
                  <div key={s.id} className="flex items-center gap-1 text-xs text-gray-600">
                    <div className={`w-3 h-3 rounded-full ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}`} />
                    {s.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "試験日逆算 学習計画",
  "description": "試験日から逆算して最適な学習計画を自動生成するツール",
  "url": "https://tools.loresync.dev/study-schedule",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "ja"
}`
        }}
      />
      </div>
  );
}
