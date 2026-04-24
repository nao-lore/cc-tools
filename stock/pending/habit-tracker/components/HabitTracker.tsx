"use client";

import { useState, useEffect, useCallback } from "react";

interface Habit {
  id: string;
  name: string;
  color: string;
  completions: string[]; // ISO date strings "YYYY-MM-DD"
  createdAt: string;
}

const COLORS = [
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#a855f7" },
  { label: "Orange", value: "#f97316" },
  { label: "Red", value: "#ef4444" },
  { label: "Pink", value: "#ec4899" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Yellow", value: "#eab308" },
];

const STORAGE_KEY = "habit-tracker-habits";

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function today(): string {
  return toDateStr(new Date());
}

function getStats(habit: Habit) {
  const sorted = [...habit.completions].sort();
  const total = sorted.length;

  // Current streak: consecutive days ending on today or yesterday
  let currentStreak = 0;
  const todayStr = today();
  const todayDate = new Date(todayStr);
  let check = new Date(todayDate);

  while (true) {
    const s = toDateStr(check);
    if (sorted.includes(s)) {
      currentStreak++;
      check.setDate(check.getDate() - 1);
    } else {
      // Allow today to be incomplete — check if yesterday completed
      if (s === todayStr) {
        check.setDate(check.getDate() - 1);
        continue;
      }
      break;
    }
  }

  // Longest streak
  let longestStreak = 0;
  let run = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      run = 1;
    } else {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diff = (curr.getTime() - prev.getTime()) / 86400000;
      if (diff === 1) {
        run++;
      } else {
        run = 1;
      }
    }
    if (run > longestStreak) longestStreak = run;
  }

  // Completion rate: last 30 days
  const rate30Days = (() => {
    let count = 0;
    const d = new Date(todayDate);
    for (let i = 0; i < 30; i++) {
      if (sorted.includes(toDateStr(d))) count++;
      d.setDate(d.getDate() - 1);
    }
    return Math.round((count / 30) * 100);
  })();

  return { total, currentStreak, longestStreak, rate30Days };
}

function HeatmapGrid({ habit }: { habit: Habit }) {
  const completionSet = new Set(habit.completions);

  // Build 52 weeks × 7 days grid ending today
  const todayDate = new Date(today());
  // Start from Sunday of the week 51 weeks ago
  const startDate = new Date(todayDate);
  startDate.setDate(startDate.getDate() - 363); // 52 weeks back
  // Align to Sunday
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const weeks: Array<Array<{ date: string; inRange: boolean }>> = [];
  const cursor = new Date(startDate);
  const todayStr = today();
  const createdStr = habit.createdAt.slice(0, 10);

  for (let w = 0; w < 52; w++) {
    const week: Array<{ date: string; inRange: boolean }> = [];
    for (let d = 0; d < 7; d++) {
      const ds = toDateStr(cursor);
      const inRange = ds >= createdStr && ds <= todayStr;
      week.push({ date: ds, inRange });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  // Month labels
  const monthLabels: Array<{ label: string; col: number }> = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const m = new Date(week[0].date).getMonth();
    if (m !== lastMonth) {
      monthLabels.push({
        label: new Date(week[0].date).toLocaleString("en", { month: "short" }),
        col: wi,
      });
      lastMonth = m;
    }
  });

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Month labels */}
        <div className="flex mb-1 ml-8">
          {weeks.map((_, wi) => {
            const ml = monthLabels.find((m) => m.col === wi);
            return (
              <div key={wi} className="w-3 mr-0.5 text-xs text-gray-400 leading-none">
                {ml ? ml.label : ""}
              </div>
            );
          })}
        </div>
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col mr-1">
            {dayLabels.map((d, i) => (
              <div key={d} className="h-3 mb-0.5 text-xs text-gray-400 leading-none w-7 flex items-center">
                {i % 2 === 1 ? d.slice(0, 1) : ""}
              </div>
            ))}
          </div>
          {/* Grid */}
          <div className="flex gap-0.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map(({ date, inRange }) => {
                  const done = completionSet.has(date);
                  const isToday = date === todayStr;
                  return (
                    <div
                      key={date}
                      title={`${date}${done ? " ✓" : ""}`}
                      className={`w-3 h-3 rounded-sm border ${
                        isToday ? "border-gray-500" : "border-transparent"
                      }`}
                      style={{
                        backgroundColor: done
                          ? habit.color
                          : inRange
                          ? "#e5e7eb"
                          : "#f3f4f6",
                        opacity: inRange ? 1 : 0.3,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0].value);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHabits(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const save = useCallback((updated: Habit[]) => {
    setHabits(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  function addHabit() {
    const name = newName.trim();
    if (!name || habits.length >= 10) return;
    const habit: Habit = {
      id: crypto.randomUUID(),
      name,
      color: newColor,
      completions: [],
      createdAt: new Date().toISOString(),
    };
    save([...habits, habit]);
    setNewName("");
  }

  function toggleToday(id: string) {
    const todayStr = today();
    save(
      habits.map((h) => {
        if (h.id !== id) return h;
        const has = h.completions.includes(todayStr);
        return {
          ...h,
          completions: has
            ? h.completions.filter((d) => d !== todayStr)
            : [...h.completions, todayStr],
        };
      })
    );
  }

  function deleteHabit(id: string) {
    save(habits.filter((h) => h.id !== id));
    setDeleteConfirm(null);
    if (expanded === id) setExpanded(null);
  }

  const todayStr = today();

  return (
    <div className="space-y-6">
      {/* Add habit */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Add Habit</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="Habit name (e.g. Read 30 min)"
            maxLength={50}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setNewColor(c.value)}
                title={c.label}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  newColor === c.value ? "border-gray-800 scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
          <button
            onClick={addHabit}
            disabled={!newName.trim() || habits.length >= 10}
            className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            Add
          </button>
        </div>
        {habits.length >= 10 && (
          <p className="text-xs text-orange-500 mt-2">Maximum 10 habits reached.</p>
        )}
      </div>

      {/* Habit list */}
      {habits.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-sm">No habits yet. Add one above to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => {
            const stats = getStats(habit);
            const doneToday = habit.completions.includes(todayStr);
            const isExpanded = expanded === habit.id;

            return (
              <div
                key={habit.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Top row */}
                <div className="flex items-center gap-3 p-4">
                  {/* Color dot + name */}
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: habit.color }}
                  />
                  <span className="font-semibold text-gray-800 flex-1 truncate">{habit.name}</span>

                  {/* Stats row */}
                  <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 shrink-0">
                    <span title="Current streak">🔥 {stats.currentStreak}d</span>
                    <span title="Longest streak">🏆 {stats.longestStreak}d</span>
                    <span title="30-day completion rate">📊 {stats.rate30Days}%</span>
                    <span title="Total completions">✅ {stats.total}</span>
                  </div>

                  {/* Toggle today */}
                  <button
                    onClick={() => toggleToday(habit.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                      doneToday
                        ? "border-transparent text-white"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                    style={doneToday ? { backgroundColor: habit.color } : {}}
                    title={doneToday ? "Mark incomplete" : "Mark complete for today"}
                  >
                    {doneToday ? "✓ Done" : "Mark Done"}
                  </button>

                  {/* Expand heatmap */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : habit.id)}
                    className="text-gray-400 hover:text-gray-600 text-sm px-1"
                    title="Toggle heatmap"
                  >
                    {isExpanded ? "▲" : "▼"}
                  </button>

                  {/* Delete */}
                  {deleteConfirm === habit.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="text-xs text-red-600 font-semibold px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs text-gray-500 px-2 py-1 border border-gray-200 rounded hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(habit.id)}
                      className="text-gray-300 hover:text-red-400 text-sm px-1"
                      title="Delete habit"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Mobile stats */}
                <div className="flex sm:hidden items-center gap-4 text-xs text-gray-500 px-4 pb-3">
                  <span>🔥 {stats.currentStreak}d streak</span>
                  <span>🏆 {stats.longestStreak}d best</span>
                  <span>📊 {stats.rate30Days}%</span>
                  <span>✅ {stats.total}</span>
                </div>

                {/* Heatmap */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pt-4 pb-5 bg-gray-50">
                    <p className="text-xs font-medium text-gray-500 mb-3">Last 52 weeks</p>
                    <HeatmapGrid habit={habit} />
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                      <span>Less</span>
                      <div className="w-3 h-3 rounded-sm bg-gray-200" />
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: habit.color, opacity: 0.4 }}
                      />
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: habit.color, opacity: 0.7 }}
                      />
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: habit.color }}
                      />
                      <span>More</span>
                    </div>
                  </div>
                )}
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Habit Tracker tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Track daily habits with a visual streak calendar. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Habit Tracker tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Track daily habits with a visual streak calendar. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
            );
          })}
        </div>
      )}
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Habit Tracker",
  "description": "Track daily habits with a visual streak calendar",
  "url": "https://tools.loresync.dev/habit-tracker",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
