"use client";
import { useState, useMemo, useEffect } from "react";

interface FocusEntry {
  date: string; // YYYY-MM-DD
  minutes: number;
  goal: number;
  note: string;
  completed: boolean;
}

const STORAGE_KEY = "focus-streak-tracker-v1";

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dayDiff(a: string, b: string): number {
  return Math.round((parseDate(a).getTime() - parseDate(b).getTime()) / 86400000);
}

function calcStreaks(entries: FocusEntry[]): { current: number; best: number } {
  const completed = entries.filter((e) => e.completed).map((e) => e.date).sort();
  if (completed.length === 0) return { current: 0, best: 0 };

  let best = 1;
  let cur = 1;
  for (let i = 1; i < completed.length; i++) {
    if (dayDiff(completed[i], completed[i - 1]) === 1) {
      cur++;
      best = Math.max(best, cur);
    } else {
      cur = 1;
    }
  }

  // Check if current streak is still alive (today or yesterday)
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));
  const last = completed[completed.length - 1];
  const currentStreak = (last === today || last === yesterday) ? cur : 0;

  return { current: currentStreak, best };
}

function getLast14Days(): string[] {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    days.push(formatDate(new Date(Date.now() - i * 86400000)));
  }
  return days;
}

const GOAL_PRESETS = [25, 45, 60, 90, 120];

const STREAK_EMOJI: Record<number, string> = { 0: "🌱", 1: "🌿", 3: "⚡", 7: "🔥", 14: "🏆", 30: "👑" };
function getStreakEmoji(streak: number): string {
  const thresholds = [30, 14, 7, 3, 1, 0];
  for (const t of thresholds) {
    if (streak >= t) return STREAK_EMOJI[t];
  }
  return STREAK_EMOJI[0];
}

export default function FocusStreakTracker() {
  const [entries, setEntries] = useState<FocusEntry[]>([]);
  const [dailyGoal, setDailyGoal] = useState(60);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [todayNote, setTodayNote] = useState("");
  const [view, setView] = useState<"today" | "history" | "stats">("today");
  const [loaded, setLoaded] = useState(false);

  const today = formatDate(new Date());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setEntries(data.entries ?? []);
        setDailyGoal(data.dailyGoal ?? 60);
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries, dailyGoal }));
    } catch { /* ignore */ }
  }, [entries, dailyGoal, loaded]);

  useEffect(() => {
    const existing = entries.find((e) => e.date === today);
    if (existing) {
      setTodayMinutes(existing.minutes);
      setTodayNote(existing.note);
    }
  }, [loaded]);

  const { current: currentStreak, best: bestStreak } = useMemo(() => calcStreaks(entries), [entries]);

  const saveToday = () => {
    const completed = todayMinutes >= dailyGoal;
    setEntries((prev) => {
      const without = prev.filter((e) => e.date !== today);
      return [...without, { date: today, minutes: todayMinutes, goal: dailyGoal, note: todayNote, completed }];
    });
  };

  const last14 = getLast14Days();

  const weeklyData = useMemo(() => {
    const weeks: { week: string; total: number; days: number }[] = [];
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    let weekStart = "";
    let weekTotal = 0;
    let weekDays = 0;
    sorted.forEach((e) => {
      const d = parseDate(e.date);
      const wk = formatDate(new Date(d.getTime() - d.getDay() * 86400000));
      if (wk !== weekStart) {
        if (weekStart) weeks.push({ week: weekStart, total: weekTotal, days: weekDays });
        weekStart = wk;
        weekTotal = 0;
        weekDays = 0;
      }
      weekTotal += e.minutes;
      if (e.completed) weekDays++;
    });
    if (weekStart) weeks.push({ week: weekStart, total: weekTotal, days: weekDays });
    return weeks.slice(-6);
  }, [entries]);

  const stats = useMemo(() => {
    if (entries.length === 0) return null;
    const completed = entries.filter((e) => e.completed);
    const totalMinutes = entries.reduce((s, e) => s + e.minutes, 0);
    const avgMinutes = Math.round(totalMinutes / entries.length);
    const completionRate = Math.round((completed.length / entries.length) * 100);
    const maxMinutes = Math.max(...entries.map((e) => e.minutes));
    return { totalMinutes, avgMinutes, completionRate, maxMinutes, totalDays: entries.length, completedDays: completed.length };
  }, [entries]);

  const todayEntry = entries.find((e) => e.date === today);
  const progressPct = Math.min((todayMinutes / dailyGoal) * 100, 100);

  const clearAll = () => {
    if (confirm("全データを削除しますか？")) {
      setEntries([]);
      setTodayMinutes(0);
      setTodayNote("");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white text-center">
          <p className="text-emerald-200 text-xs mb-1">現在のストリーク</p>
          <p className="text-4xl font-bold">{currentStreak}</p>
          <p className="text-emerald-200 text-xs mt-1">{getStreakEmoji(currentStreak)} 日連続</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <p className="text-gray-500 text-xs mb-1">最長記録</p>
          <p className="text-4xl font-bold text-gray-800">{bestStreak}</p>
          <p className="text-gray-400 text-xs mt-1">🏆 日</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <p className="text-gray-500 text-xs mb-1">達成率</p>
          <p className="text-4xl font-bold text-gray-800">{stats?.completionRate ?? 0}%</p>
          <p className="text-gray-400 text-xs mt-1">{stats?.completedDays ?? 0}/{stats?.totalDays ?? 0}日</p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2">
        {(["today", "history", "stats"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${view === v ? "bg-emerald-600 text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            {v === "today" ? "今日の記録" : v === "history" ? "履歴" : "統計"}
          </button>
        ))}
      </div>

      {/* Today tab */}
      {view === "today" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">
              {today} の集中記録
            </h2>
            {todayEntry && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${todayEntry.completed ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                {todayEntry.completed ? "達成済み" : "記録済み"}
              </span>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">目標時間（分）</label>
            <div className="flex gap-2 mb-2">
              {GOAL_PRESETS.map((g) => (
                <button
                  key={g}
                  onClick={() => setDailyGoal(g)}
                  className={`flex-1 py-1.5 rounded-lg text-xs border font-medium transition-all ${dailyGoal === g ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"}`}
                >
                  {g}
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <span className="text-xs text-gray-500 ml-2">分/日</span>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">今日の集中時間（分）</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={1440}
                value={todayMinutes}
                onChange={(e) => setTodayMinutes(Number(e.target.value))}
                className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <span className="text-sm text-gray-500">分</span>
              <div className="flex gap-1">
                {[25, 45, 60, 90].map((m) => (
                  <button key={m} onClick={() => setTodayMinutes((prev) => prev + m)} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-100">+{m}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>今日の進捗</span>
              <span className={todayMinutes >= dailyGoal ? "text-emerald-600 font-bold" : ""}>
                {todayMinutes} / {dailyGoal}分 ({Math.round(progressPct)}%)
              </span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${todayMinutes >= dailyGoal ? "bg-emerald-500" : "bg-teal-400"}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {todayMinutes >= dailyGoal && (
              <p className="text-emerald-600 text-xs mt-1 font-medium">目標達成！ストリーク継続中</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">メモ（任意）</label>
            <input
              type="text"
              value={todayNote}
              onChange={(e) => setTodayNote(e.target.value)}
              placeholder="今日やったこと・気づきなど"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <button
            onClick={saveToday}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            記録を保存
          </button>
        </div>
      )}

      {/* History tab */}
      {view === "history" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">直近14日間</h2>
          <div className="grid grid-cols-7 gap-1.5">
            {last14.map((date) => {
              const entry = entries.find((e) => e.date === date);
              const isToday = date === today;
              const d = parseDate(date);
              const dayLabel = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
              return (
                <div key={date} className="text-center">
                  <p className="text-xs text-gray-400 mb-1">{dayLabel}</p>
                  <div
                    className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center border-2 ${
                      isToday ? "border-emerald-400" :
                      entry?.completed ? "border-emerald-300 bg-emerald-100" :
                      entry ? "border-yellow-200 bg-yellow-50" :
                      "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-700">{d.getDate()}</span>
                    {entry && <span className="text-xs text-gray-500">{entry.minutes}m</span>}
                    {entry?.completed && <span className="text-xs">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-100 border-2 border-emerald-300"></div>達成</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-50 border-2 border-yellow-200"></div>記録あり</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-50 border-2 border-gray-100"></div>未記録</div>
          </div>

          {entries.length > 0 && (
            <div className="mt-5 space-y-2 max-h-64 overflow-y-auto">
              {[...entries].sort((a, b) => b.date.localeCompare(a.date)).map((e) => (
                <div key={e.date} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${e.completed ? "bg-emerald-50" : "bg-gray-50"}`}>
                  <div>
                    <span className="font-medium text-gray-700">{e.date}</span>
                    {e.note && <span className="text-xs text-gray-400 ml-2">{e.note}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{e.minutes}分</span>
                    {e.completed ? <span className="text-emerald-600 text-xs font-medium">達成</span> : <span className="text-gray-400 text-xs">未達</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats tab */}
      {view === "stats" && (
        <div className="space-y-4">
          {stats ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "総集中時間", value: `${Math.floor(stats.totalMinutes / 60)}h${stats.totalMinutes % 60}m` },
                  { label: "平均集中時間", value: `${stats.avgMinutes}分/日` },
                  { label: "最長集中（1日）", value: `${stats.maxMinutes}分` },
                  { label: "目標達成日数", value: `${stats.completedDays}日` },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{s.value}</p>
                  </div>
                ))}
              </div>

              {weeklyData.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">週次トレンド</h3>
                  <div className="space-y-3">
                    {weeklyData.map((w) => {
                      const maxTotal = Math.max(...weeklyData.map((wd) => wd.total), 1);
                      return (
                        <div key={w.week}>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>{w.week}〜</span>
                            <span>{w.total}分（{w.days}日達成）</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${(w.total / maxTotal) * 100}%` }}
                            />
                          </div>
                        
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この集中ストリークトラッカーツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">連続集中日数記録、中断率分析。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この集中ストリークトラッカーツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "連続集中日数記録、中断率分析。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
              <p>まだデータがありません。</p>
              <p className="text-sm mt-1">「今日の記録」タブから記録を始めましょう。</p>
            </div>
          )}

          <button onClick={clearAll} className="w-full border border-red-200 text-red-500 hover:bg-red-50 py-2 rounded-xl text-sm transition-colors">
            全データをリセット
          </button>
        </div>
      )}
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "集中ストリークトラッカー",
  "description": "連続集中日数記録、中断率分析",
  "url": "https://tools.loresync.dev/focus-streak-tracker",
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
