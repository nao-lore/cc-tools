"use client";

import { useState, useMemo } from "react";

// ─── Holiday calculation ───────────────────────────────────────────────────────

/** Returns the nth weekday of a given month (1-based weekday: 0=Sun,1=Mon,...,6=Sat) */
function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month - 1, 1);
  const diff = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month - 1, 1 + diff + (n - 1) * 7);
}

/** Vernal equinox approximation */
function vernalEquinox(year: number): number {
  if (year <= 1979) return Math.floor(20.8357 + 0.242194 * (year - 1980) - Math.floor((year - 1983) / 4));
  if (year <= 2099) return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  return Math.floor(21.851 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
}

/** Autumnal equinox approximation */
function autumnalEquinox(year: number): number {
  if (year <= 1979) return Math.floor(23.2588 + 0.242194 * (year - 1980) - Math.floor((year - 1983) / 4));
  if (year <= 2099) return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  return Math.floor(24.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface Holiday {
  date: Date;
  name: string;
  substitute: boolean;
}

function getHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];

  function add(date: Date, name: string, substitute = false) {
    holidays.push({ date, name, substitute });
  }

  // Fixed holidays
  add(new Date(year, 0, 1), "元日");
  add(new Date(year, 1, 11), "建国記念の日");
  add(new Date(year, 1, 23), "天皇誕生日");
  add(new Date(year, 3, 29), "昭和の日");
  add(new Date(year, 4, 3), "憲法記念日");
  add(new Date(year, 4, 4), "みどりの日");
  add(new Date(year, 4, 5), "こどもの日");
  add(new Date(year, 7, 11), "山の日");
  add(new Date(year, 10, 3), "文化の日");
  add(new Date(year, 10, 23), "勤労感謝の日");

  // Happy Monday
  add(nthWeekday(year, 1, 1, 2), "成人の日");   // 1月第2月曜
  add(nthWeekday(year, 7, 1, 3), "海の日");     // 7月第3月曜
  add(nthWeekday(year, 9, 1, 3), "敬老の日");   // 9月第3月曜
  add(nthWeekday(year, 10, 1, 2), "スポーツの日"); // 10月第2月曜

  // Vernal / autumnal equinox
  add(new Date(year, 2, vernalEquinox(year)), "春分の日");
  add(new Date(year, 8, autumnalEquinox(year)), "秋分の日");

  // Substitute holidays (振替休日): if a holiday falls on Sunday, next Monday is substitute
  const baseKeys = new Set(holidays.map((h) => dateKey(h.date)));
  const substitutes: Holiday[] = [];

  // Also handle consecutive holidays (国民の休日) and multi-day Sunday shifts
  // Simple rule: holiday on Sunday → following Monday becomes substitute
  for (const h of [...holidays]) {
    if (h.date.getDay() === 0) {
      // Find next Monday that isn't already a holiday
      let candidate = new Date(h.date);
      candidate.setDate(candidate.getDate() + 1);
      while (baseKeys.has(dateKey(candidate)) || substitutes.some((s) => dateKey(s.date) === dateKey(candidate))) {
        candidate = new Date(candidate);
        candidate.setDate(candidate.getDate() + 1);
      }
      substitutes.push({ date: new Date(candidate), name: `振替休日（${h.name}）`, substitute: true });
    }
  }

  const all = [...holidays, ...substitutes];
  all.sort((a, b) => a.date.getTime() - b.date.getTime());
  return all;
}

// ─── Business day helpers ─────────────────────────────────────────────────────

function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

function countBusinessDays(
  start: Date,
  end: Date,
  holidayKeys: Set<string>
): number {
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    if (!isWeekend(cur) && !holidayKeys.has(dateKey(cur))) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function countWeekends(year: number, month: number): number {
  let count = 0;
  const days = daysInMonth(year, month);
  for (let d = 1; d <= days; d++) {
    const day = new Date(year, month - 1, d).getDay();
    if (day === 0 || day === 6) count++;
  }
  return count;
}

// ─── Component ────────────────────────────────────────────────────────────────

const MONTH_NAMES = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
const WEEKDAY_NAMES = ["日","月","火","水","木","金","土"];

export default function KoyomiKeisan() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [yearInput, setYearInput] = useState<string>(String(currentYear));

  // Period calculator state
  const today = new Date();
  const todayStr = dateKey(today);
  const [periodStart, setPeriodStart] = useState<string>(todayStr);
  const [periodEnd, setPeriodEnd] = useState<string>(todayStr);

  const holidays = useMemo(() => getHolidays(year), [year]);
  const holidayKeys = useMemo(() => new Set(holidays.map((h) => dateKey(h.date))), [holidays]);

  // Monthly breakdown
  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const totalDays = daysInMonth(year, month);
      const weekendCount = countWeekends(year, month);
      const holidayCount = holidays.filter(
        (h) => h.date.getMonth() + 1 === month
      ).length;
      const businessDays = totalDays - weekendCount - holidayCount;
      return { month, totalDays, weekendCount, holidayCount, businessDays };
    });
  }, [year, holidays]);

  // Period business days
  const periodResult = useMemo(() => {
    if (!periodStart || !periodEnd) return null;
    const [sy, sm, sd] = periodStart.split("-").map(Number);
    const [ey, em, ed] = periodEnd.split("-").map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    if (start > end) return null;

    // Collect holidays for all years in range
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();
    const allHolidayKeys = new Set<string>();
    for (let y = startYear; y <= endYear; y++) {
      getHolidays(y).forEach((h) => allHolidayKeys.add(dateKey(h.date)));
    }

    const total = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
    const business = countBusinessDays(start, end, allHolidayKeys);
    return { total, business, weekend: total - business };
  }, [periodStart, periodEnd]);

  function handleYearSubmit() {
    const n = parseInt(yearInput, 10);
    if (!isNaN(n) && n >= 1970 && n <= 2100) setYear(n);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      {/* Year input */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h1 className="text-xl font-bold mb-4">祝日一覧・営業日数計算</h1>
        <div className="flex gap-2 items-center">
          <label className="text-muted text-sm whitespace-nowrap">対象年</label>
          <input
            type="number"
            value={yearInput}
            min={1970}
            max={2100}
            onChange={(e) => setYearInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleYearSubmit()}
            className="border border-border rounded-lg px-3 py-1.5 w-28 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={handleYearSubmit}
            className="bg-accent text-white rounded-lg px-4 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            表示
          </button>
          <span className="text-muted text-sm">{year}年 — 祝日 {holidays.length}日</span>
        </div>
      </div>

      {/* Holiday list */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h2 className="font-semibold mb-3">{year}年 祝日・休日一覧</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {holidays.map((h) => (
            <div
              key={dateKey(h.date)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 bg-muted/10"
            >
              <span className="text-muted text-xs w-20 shrink-0">
                {h.date.getMonth() + 1}月{h.date.getDate()}日
                （{WEEKDAY_NAMES[h.date.getDay()]}）
              </span>
              <span className={`text-sm ${h.substitute ? "text-muted" : "font-medium"}`}>
                {h.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly table */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h2 className="font-semibold mb-3">{year}年 月別営業日数</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted font-medium">月</th>
                <th className="text-right py-2 px-3 text-muted font-medium">祝日</th>
                <th className="text-right py-2 px-3 text-muted font-medium">土日</th>
                <th className="text-right py-2 px-3 text-muted font-medium">営業日数</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map(({ month, weekendCount, holidayCount, businessDays }) => (
                <tr key={month} className="border-b border-border/50 hover:bg-muted/5">
                  <td className="py-2 pr-4 font-medium">{MONTH_NAMES[month - 1]}</td>
                  <td className="text-right py-2 px-3 text-muted">{holidayCount}</td>
                  <td className="text-right py-2 px-3 text-muted">{weekendCount}</td>
                  <td className="text-right py-2 px-3 font-semibold">{businessDays}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-2 pr-4">合計</td>
                <td className="text-right py-2 px-3 text-muted">
                  {monthlyData.reduce((s, m) => s + m.holidayCount, 0)}
                </td>
                <td className="text-right py-2 px-3 text-muted">
                  {monthlyData.reduce((s, m) => s + m.weekendCount, 0)}
                </td>
                <td className="text-right py-2 px-3">
                  {monthlyData.reduce((s, m) => s + m.businessDays, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Period calculator */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h2 className="font-semibold mb-3">期間指定 営業日数計算</h2>
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <div className="flex items-center gap-2">
            <label className="text-muted text-sm">開始</label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <span className="text-muted">〜</span>
          <div className="flex items-center gap-2">
            <label className="text-muted text-sm">終了</label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
        {periodResult ? (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-muted/10 p-3 text-center">
              <div className="text-muted text-xs mb-1">総日数</div>
              <div className="text-2xl font-bold">{periodResult.total}</div>
              <div className="text-muted text-xs">日</div>
            </div>
            <div className="rounded-xl bg-muted/10 p-3 text-center">
              <div className="text-muted text-xs mb-1">土日・祝日</div>
              <div className="text-2xl font-bold">{periodResult.weekend}</div>
              <div className="text-muted text-xs">日</div>
            </div>
            <div className="rounded-xl bg-accent/10 border border-accent/30 p-3 text-center">
              <div className="text-accent text-xs mb-1 font-medium">営業日数</div>
              <div className="text-2xl font-bold text-accent">{periodResult.business}</div>
              <div className="text-accent text-xs">日</div>
            </div>
          </div>
        ) : (
          <p className="text-muted text-sm">開始日・終了日を選択してください（開始 ≦ 終了）</p>
        )}
      </div>

      {/* Ad placeholder */}
      <div className="rounded-2xl border border-border border-dashed p-6 text-center text-muted text-sm">
        広告
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この日本の祝日計算ツールツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">任意の年の祝日一覧と営業日数を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この日本の祝日計算ツールツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "任意の年の祝日一覧と営業日数を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "日本の祝日計算ツール",
  "description": "任意の年の祝日一覧と営業日数を計算",
  "url": "https://tools.loresync.dev/koyomi-keisan",
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
