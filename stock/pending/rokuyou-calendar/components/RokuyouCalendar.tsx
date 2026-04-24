"use client";

import { useState } from "react";

// 六曜の順序: 0=大安, 1=赤口, 2=先勝, 3=友引, 4=先負, 5=仏滅
const ROKUYOU_NAMES = ["大安", "赤口", "先勝", "友引", "先負", "仏滅"] as const;
type Rokuyou = (typeof ROKUYOU_NAMES)[number];

// 色設定
const ROKUYOU_STYLES: Record<Rokuyou, { badge: string; dot: string }> = {
  大安: { badge: "bg-red-100 text-red-700 border border-red-200", dot: "bg-red-500" },
  赤口: { badge: "bg-orange-100 text-orange-700 border border-orange-200", dot: "bg-orange-400" },
  先勝: { badge: "bg-green-100 text-green-700 border border-green-200", dot: "bg-green-500" },
  友引: { badge: "bg-blue-100 text-blue-700 border border-blue-200", dot: "bg-blue-500" },
  先負: { badge: "bg-purple-100 text-purple-700 border border-purple-200", dot: "bg-purple-500" },
  仏滅: { badge: "bg-gray-100 text-gray-500 border border-gray-200", dot: "bg-gray-400" },
};

const ROKUYOU_DESC: Record<Rokuyou, string> = {
  大安: "大吉日。何事も成功する。結婚式・開業に最適。",
  赤口: "凶日。正午のみ吉。葬儀・結婚式は避ける。",
  先勝: "午前吉・午後凶。急ぐことは午前中に。",
  友引: "友を引く。葬儀は避ける。結婚式は吉。",
  先負: "午前凶・午後吉。急ぐことを避け穏やかに。",
  仏滅: "大凶日。万事凶。結婚式・開業は避ける。",
};

/**
 * 旧暦の月・日を近似計算して六曜を求める
 * 旧暦(月 + 日) mod 6 で六曜が決まる（先勝=0を基準）
 * ただし月の繰り越しは旧暦月初に戻る。
 *
 * 実用的な近似: 天文計算ライブラリなしで旧暦月日を推定する。
 * 基準点: 2000年1月1日 = 旧暦1999年11月26日 (先勝)
 * 朔(新月)周期 ≈ 29.530589日
 */
const LUNATION_BASE = new Date(Date.UTC(2000, 0, 1)); // 2000-01-01 UTC
const LUNAR_MONTH = 29.530589; // 朔望月（日）
// 2000-01-01は旧暦1999年11月26日
// 旧暦月+日 = 11+26 = 37, 37 mod 6 = 1 → 赤口
// 実測: 2000-01-01は赤口(index=1)
// ROKUYOU_NAMES[1] = 赤口 → base offset = 1
const BASE_OFFSET = 1; // 基準日の六曜インデックス

function calcRokuyou(date: Date): Rokuyou {
  // 日付をUTC正午に固定して計算
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const diffDays = (utc - LUNATION_BASE.getTime()) / 86400000;

  // 直前の朔(新月)からの経過日数（旧暦の日）
  const lunarDay = ((diffDays % LUNAR_MONTH) + LUNAR_MONTH) % LUNAR_MONTH;
  const lunarDayInt = Math.floor(lunarDay); // 0-based (朔=0)

  // 旧暦日は1-indexed: lunarDayInt+1
  // 六曜は (旧暦月 + 旧暦日) mod 6 だが、月が不定のため
  // 実用上は朔ごとにずれることを利用: 朔の日のインデックスを連続計算
  // 朔の数を数えてオフセットを加算
  const lunarMonthsElapsed = Math.floor(
    (diffDays + LUNAR_MONTH / 2) / LUNAR_MONTH
  );
  const lunarMonthOffset = ((lunarMonthsElapsed % 6) + 6) % 6;

  const index = (BASE_OFFSET + lunarMonthOffset + lunarDayInt) % 6;
  return ROKUYOU_NAMES[index];
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

interface DayCell {
  day: number;
  rokuyou: Rokuyou;
  isToday: boolean;
  isSunday: boolean;
  isSaturday: boolean;
}

export default function RokuyouCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [filterDaian, setFilterDaian] = useState(false);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDow = getFirstDayOfWeek(year, month);

  const cells: (DayCell | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      const date = new Date(year, month, d);
      const rokuyou = calcRokuyou(date);
      return {
        day: d,
        rokuyou,
        isToday:
          d === today.getDate() &&
          month === today.getMonth() &&
          year === today.getFullYear(),
        isSunday: date.getDay() === 0,
        isSaturday: date.getDay() === 6,
      };
    }),
  ];

  // フィルター適用時: 大安の日だけ一覧表示
  const daianDays = cells
    .filter((c): c is DayCell => c !== null && c.rokuyou === "大安")
    .map((c) => c.day);

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  const monthLabel = `${year}年${month + 1}月`;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h1 className="text-lg font-bold text-gray-900 mb-1">六曜カレンダー</h1>
        <p className="text-muted text-sm">
          指定月の六曜を表示。結婚式・葬儀などの日取り検討にご活用ください。
        </p>
      </div>

      {/* Month selector */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={prevMonth}
            className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="前月"
          >
            ◀
          </button>

          <div className="flex items-center gap-2">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-2 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 11 }, (_, i) => today.getFullYear() - 5 + i).map((y) => (
                <option key={y} value={y}>
                  {y}年
                </option>
              ))}
            </select>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="px-2 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => i).map((m) => (
                <option key={m} value={m}>
                  {m + 1}月
                </option>
              ))}
            </select>
            <button
              onClick={goToday}
              className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-gray-50 transition-colors"
            >
              今月
            </button>
          </div>

          <button
            onClick={nextMonth}
            className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="翌月"
          >
            ▶
          </button>
        </div>

        {/* Filter toggle */}
        <div className="mt-3 flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
            <div
              className={`relative w-10 h-5 rounded-full transition-colors ${filterDaian ? "bg-red-500" : "bg-gray-300"}`}
              onClick={() => setFilterDaian((v) => !v)}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filterDaian ? "translate-x-5" : ""}`}
              />
            </div>
            大安のみ表示
          </label>
        </div>
      </div>

      {/* Calendar grid */}
      {!filterDaian && (
        <div className="bg-surface rounded-2xl border border-border p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-4 text-center">{monthLabel}</h2>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((w, i) => (
              <div
                key={w}
                className={`text-center text-xs font-semibold py-1 ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"}`}
              >
                {w}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) =>
              cell === null ? (
                <div key={`empty-${idx}`} />
              ) : (
                <div
                  key={cell.day}
                  className={`rounded-xl p-1.5 flex flex-col items-center gap-1 min-h-[64px] ${
                    cell.isToday
                      ? "ring-2 ring-blue-400 bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      cell.isSunday
                        ? "text-red-500"
                        : cell.isSaturday
                        ? "text-blue-500"
                        : "text-gray-800"
                    }`}
                  >
                    {cell.day}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full leading-tight ${ROKUYOU_STYLES[cell.rokuyou].badge}`}
                  >
                    {cell.rokuyou}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* 大安フィルター一覧 */}
      {filterDaian && (
        <div className="bg-surface rounded-2xl border border-border p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {monthLabel}の大安日
          </h2>
          {daianDays.length === 0 ? (
            <p className="text-muted text-sm">この月の大安日はありません。</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {daianDays.map((d) => {
                const date = new Date(year, month, d);
                const dow = WEEKDAYS[date.getDay()];
                const isSun = date.getDay() === 0;
                const isSat = date.getDay() === 6;
                return (
                  <div
                    key={d}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <span
                      className={`text-sm font-bold ${isSun ? "text-red-500" : isSat ? "text-blue-500" : "text-gray-800"}`}
                    >
                      {month + 1}/{d}（{dow}）
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                      大安
                    </span>
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この六曜カレンダーツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">指定月の大安・仏滅を表示、結婚式・葬儀の日取り検討。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この六曜カレンダーツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "指定月の大安・仏滅を表示、結婚式・葬儀の日取り検討。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">六曜の意味</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ROKUYOU_NAMES.map((r) => (
            <div key={r} className="flex items-start gap-2">
              <span
                className={`mt-0.5 shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${ROKUYOU_STYLES[r].badge}`}
              >
                {r}
              </span>
              <span className="text-xs text-gray-600">{ROKUYOU_DESC[r]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-20 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        広告スペース
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "六曜カレンダー",
  "description": "指定月の大安・仏滅を表示、結婚式・葬儀の日取り検討",
  "url": "https://tools.loresync.dev/rokuyou-calendar",
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
