"use client";

import { useState, useMemo } from "react";

// --- 法定付与日数テーブル ---
// 通常労働者（週5日以上 or 週所定30時間以上）
const STANDARD_TABLE: { months: number; days: number }[] = [
  { months: 6,  days: 10 },
  { months: 18, days: 11 },
  { months: 30, days: 12 },
  { months: 42, days: 14 },
  { months: 54, days: 16 },
  { months: 66, days: 18 },
  { months: 78, days: 20 }, // 6.5年以上
];

// 比例付与テーブル: { weekDays, rows: [{months, days}] }
const PROPORTIONAL_TABLE: {
  weekDays: number;
  annualDays: number;
  rows: { months: number; days: number }[];
}[] = [
  {
    weekDays: 4,
    annualDays: 169,
    rows: [
      { months: 6,  days: 7  },
      { months: 18, days: 8  },
      { months: 30, days: 9  },
      { months: 42, days: 10 },
      { months: 54, days: 12 },
      { months: 66, days: 13 },
      { months: 78, days: 15 },
    ],
  },
  {
    weekDays: 3,
    annualDays: 121,
    rows: [
      { months: 6,  days: 5  },
      { months: 18, days: 6  },
      { months: 30, days: 6  },
      { months: 42, days: 8  },
      { months: 54, days: 9  },
      { months: 66, days: 10 },
      { months: 78, days: 11 },
    ],
  },
  {
    weekDays: 2,
    annualDays: 73,
    rows: [
      { months: 6,  days: 3  },
      { months: 18, days: 4  },
      { months: 30, days: 4  },
      { months: 42, days: 5  },
      { months: 54, days: 6  },
      { months: 66, days: 6  },
      { months: 78, days: 7  },
    ],
  },
  {
    weekDays: 1,
    annualDays: 48,
    rows: [
      { months: 6,  days: 1  },
      { months: 18, days: 2  },
      { months: 30, days: 2  },
      { months: 42, days: 2  },
      { months: 54, days: 3  },
      { months: 66, days: 3  },
      { months: 78, days: 3  },
    ],
  },
];

// 段階ラベル
const STAGE_LABELS = ["0.5年", "1.5年", "2.5年", "3.5年", "4.5年", "5.5年", "6.5年以上"];

// --- ユーティリティ ---
function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function monthDiff(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

function formatTenure(months: number): string {
  if (months < 0) return "—";
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m}ヶ月`;
  if (m === 0) return `${y}年`;
  return `${y}年${m}ヶ月`;
}

// 付与日数取得（テーブル参照）
function getGrantDays(tenureMonths: number, rows: { months: number; days: number }[]): number {
  if (tenureMonths < 6) return 0;
  let result = 0;
  for (const row of rows) {
    if (tenureMonths >= row.months) result = row.days;
  }
  return result;
}

// 次回付与までの残月
function nextGrantMonths(tenureMonths: number): number {
  const stages = [6, 18, 30, 42, 54, 66, 78];
  for (const s of stages) {
    if (tenureMonths < s) return s - tenureMonths;
  }
  return 12 - ((tenureMonths - 78) % 12); // 6.5年超は毎年
}

// --- メインコンポーネント ---
export default function YukyuNissuu() {
  const today = new Date().toISOString().slice(0, 10);

  const [joinDate, setJoinDate] = useState("");
  const [baseDate, setBaseDate] = useState(today);
  const [weekDays, setWeekDays] = useState<number>(5);
  const [prevRemaining, setPrevRemaining] = useState(""); // 前年繰越残
  const [usedDays, setUsedDays] = useState(""); // 当年取得済み

  // --- 勤続月数 ---
  const tenureMonths = useMemo(() => {
    const join = parseDate(joinDate);
    const base = parseDate(baseDate) ?? new Date();
    if (!join || base < join) return -1;
    return monthDiff(join, base);
  }, [joinDate, baseDate]);

  // --- 通常 or 比例付与 ---
  const isStandard = weekDays >= 5;

  // --- 今回付与日数 ---
  const currentGrantDays = useMemo(() => {
    if (tenureMonths < 0) return 0;
    if (isStandard) {
      return getGrantDays(tenureMonths, STANDARD_TABLE);
    }
    const tbl = PROPORTIONAL_TABLE.find((t) => t.weekDays === weekDays);
    if (!tbl) return 0;
    return getGrantDays(tenureMonths, tbl.rows);
  }, [tenureMonths, isStandard, weekDays]);

  // --- 繰越計算 ---
  const prev = parseFloat(prevRemaining) || 0;
  const used = parseFloat(usedDays) || 0;
  // 繰越上限: 前年付与分（前々年分は時効消滅）
  // 残有給 = 繰越 + 今回付与 - 取得済み
  const totalDays = Math.max(0, prev + currentGrantDays);
  const remainingDays = Math.max(0, totalDays - used);

  // 年5日取得義務（10日以上付与の場合）
  const obligationApplies = currentGrantDays >= 10;
  const obligationMet = used >= 5;
  const obligationShortfall = Math.max(0, 5 - used);

  // 次回付与
  const nextMonths = tenureMonths >= 0 ? nextGrantMonths(tenureMonths) : null;

  // --- 全段階テーブル（表示用） ---
  const displayRows = useMemo(() => {
    const rows = isStandard
      ? STANDARD_TABLE
      : PROPORTIONAL_TABLE.find((t) => t.weekDays === weekDays)?.rows ?? STANDARD_TABLE;

    return STAGE_LABELS.map((label, i) => ({
      label,
      months: rows[i].months,
      days: rows[i].days,
      isCurrent: tenureMonths >= 0 && tenureMonths >= rows[i].months &&
        (i === rows.length - 1 || tenureMonths < rows[i + 1].months),
    }));
  }, [isStandard, weekDays, tenureMonths]);

  const hasResult = tenureMonths >= 6;

  return (
    <div className="space-y-6">
      {/* 入力セクション */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">基本情報</h2>

        <div className="space-y-5">
          {/* 入社日 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              入社日
            </label>
            <input
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              max={today}
              className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-blue-800"
              style={{ colorScheme: "light" }}
            />
          </div>

          {/* 基準日 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              基準日
              <span className="text-xs text-gray-400 ml-1.5">（付与日 or 本日）</span>
            </label>
            <input
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-blue-800"
              style={{ colorScheme: "light" }}
            />
          </div>

          {/* 週所定労働日数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              週所定労働日数
            </label>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setWeekDays(d)}
                  className={`flex-1 min-w-0 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    weekDays === d
                      ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                      : "text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {d}日
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {weekDays >= 5
                ? "週5日以上（または週30時間以上）→ 通常付与"
                : `週${weekDays}日 → 比例付与`}
            </p>
          </div>
        </div>

        {/* 勤続年数バッジ */}
        {tenureMonths >= 0 && (
          <div
            className="mt-5 rounded-xl p-4 border"
            style={{ background: "#0f172a", borderColor: "#1e3a5f" }}
          >
            <div className="text-xs font-medium mb-1" style={{ color: "#93c5fd" }}>
              勤続年数（自動計算）
            </div>
            <div className="text-2xl font-bold text-white">
              {formatTenure(tenureMonths)}
            </div>
            {tenureMonths < 6 && (
              <div className="text-xs mt-1" style={{ color: "#fbbf24" }}>
                初回付与まであと{6 - tenureMonths}ヶ月
              </div>
            )}
          </div>
        )}
      </div>

      {/* 結果カード */}
      {hasResult && (
        <div
          className="rounded-2xl shadow-lg p-6 text-white"
          style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)" }}
        >
          <div className="text-base font-semibold opacity-90 mb-4">今回の法定付与日数</div>
          <div className="text-5xl font-bold mb-1">
            {currentGrantDays}
            <span className="text-2xl font-medium ml-1 opacity-80">日</span>
          </div>
          <div className="text-blue-200 text-sm mt-1">
            {isStandard ? "通常労働者（週5日以上）" : `比例付与（週${weekDays}日）`}
            {" · "}
            勤続{formatTenure(tenureMonths)}
          </div>
          {nextMonths !== null && (
            <div
              className="mt-3 px-3 py-2 rounded-xl text-xs"
              style={{ background: "rgba(255,255,255,0.12)", color: "#bfdbfe" }}
            >
              次回付与まであと約{nextMonths}ヶ月
            </div>
          )}
        </div>
      )}

      {/* 繰越・残日数 */}
      {hasResult && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">繰越・残日数</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                前年繰越残日数
                <span className="text-xs text-gray-400 ml-1.5">（2年時効のため前年分のみ）</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={prevRemaining}
                  onChange={(e) => setPrevRemaining(e.target.value)}
                  placeholder="0"
                  className="flex-1 px-4 py-2.5 text-right text-base font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
                <span className="text-gray-600 font-medium text-sm w-8 shrink-0">日</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                当年取得済み日数
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={usedDays}
                  onChange={(e) => setUsedDays(e.target.value)}
                  placeholder="0"
                  className="flex-1 px-4 py-2.5 text-right text-base font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
                <span className="text-gray-600 font-medium text-sm w-8 shrink-0">日</span>
              </div>
            </div>
          </div>

          {/* サマリー */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl p-4 text-center" style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
              <div className="text-xs font-medium mb-1" style={{ color: "#0369a1" }}>前年繰越</div>
              <div className="text-xl font-bold" style={{ color: "#0c4a6e" }}>{prev}<span className="text-sm ml-0.5">日</span></div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <div className="text-xs font-medium mb-1" style={{ color: "#1d4ed8" }}>今回付与</div>
              <div className="text-xl font-bold" style={{ color: "#1e3a8a" }}>{currentGrantDays}<span className="text-sm ml-0.5">日</span></div>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "#0f172a", border: "1px solid #1e3a5f" }}>
              <div className="text-xs font-medium mb-1" style={{ color: "#93c5fd" }}>残日数</div>
              <div className="text-xl font-bold text-white">{remainingDays}<span className="text-sm ml-0.5">日</span></div>
            </div>
          </div>

          {/* 計算式 */}
          <div className="mt-3 text-xs text-gray-500 text-center">
            {prev}日（繰越）+ {currentGrantDays}日（付与）− {used}日（取得済み）= {remainingDays}日
          </div>

          {/* 時効注意 */}
          <div
            className="mt-4 p-3 rounded-xl text-xs"
            style={{ background: "#fefce8", border: "1px solid #fde68a", color: "#92400e" }}
          >
            <span className="font-medium">時効（2年）：</span>
            付与日から2年経過で消滅します。前年付与分は今年度末まで有効です。
          </div>
        </div>
      )}

      {/* 年5日取得義務 */}
      {hasResult && obligationApplies && (
        <div
          className="rounded-2xl shadow-sm p-5 border"
          style={
            obligationMet
              ? { background: "#f0fdf4", borderColor: "#bbf7d0" }
              : { background: "#fff7ed", borderColor: "#fed7aa" }
          }
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{obligationMet ? "✓" : "⚠️"}</span>
            <span
              className="font-semibold text-sm"
              style={{ color: obligationMet ? "#166534" : "#9a3412" }}
            >
              年5日取得義務（労基法39条7項）
            </span>
          </div>
          <p className="text-xs" style={{ color: obligationMet ? "#15803d" : "#c2410c" }}>
            {obligationMet
              ? `取得済み${used}日 — 年5日の義務を満たしています。`
              : `取得済み${used}日 — あと${obligationShortfall}日の取得が必要です。`}
          </p>
          <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>
            10日以上付与された労働者は付与日から1年以内に5日取得が義務。違反時は使用者に罰則。
          </p>
        </div>
      )}

      {/* 付与日数テーブル */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">法定付与日数テーブル</h2>
        <p className="text-xs text-gray-500 mb-4">
          {isStandard
            ? "通常労働者（週5日以上 / 週所定30時間以上）"
            : `比例付与 — 週${weekDays}日（年間所定日数${PROPORTIONAL_TABLE.find((t) => t.weekDays === weekDays)?.annualDays ?? "—"}日以下）`}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th className="text-left pb-2 text-gray-600 font-medium">勤続年数</th>
                <th className="text-right pb-2 text-gray-600 font-medium">付与日数</th>
                <th className="text-right pb-2 text-gray-600 font-medium">累計上限</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, i) => {
                const cumulative = displayRows.slice(0, i + 1).reduce((sum, r) => sum + r.days, 0);
                return (
                  <tr
                    key={row.label}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      background: row.isCurrent ? "#eff6ff" : "transparent",
                    }}
                  >
                    <td className="py-2.5 font-medium" style={{ color: row.isCurrent ? "#1d4ed8" : "#374151" }}>
                      {row.label}
                      {row.isCurrent && (
                        <span
                          className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold"
                          style={{ background: "#1e40af", color: "white" }}
                        >
                          現在
                        </span>
                      )}
                    </td>
                    <td
                      className="py-2.5 text-right font-bold text-lg"
                      style={{ color: row.isCurrent ? "#1d4ed8" : "#111827" }}
                    >
                      {row.days}日
                    </td>
                    <td className="py-2.5 text-right text-xs text-gray-400">
                      /{cumulative}日
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!isStandard && (
          <div
            className="mt-4 p-3 rounded-xl text-xs"
            style={{ background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0369a1" }}
          >
            <span className="font-medium">比例付与の適用条件：</span>
            週所定労働日数が4日以下かつ年間所定労働日数が216日以下の短時間労働者に適用。
            週所定30時間以上の場合は週4日でも通常付与。
          </div>
        )}
      </div>

      {/* 全区分テーブル（週5日のみ並列表示） */}
      {weekDays < 5 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">比例付与 全区分一覧</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th className="text-left pb-2 text-gray-600 font-medium">勤続</th>
                  {PROPORTIONAL_TABLE.map((t) => (
                    <th
                      key={t.weekDays}
                      className="text-right pb-2 font-medium"
                      style={{ color: t.weekDays === weekDays ? "#1d4ed8" : "#6b7280" }}
                    >
                      週{t.weekDays}日
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STAGE_LABELS.map((label, i) => (
                  <tr key={label} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td className="py-2 text-gray-700 font-medium">{label}</td>
                    {PROPORTIONAL_TABLE.map((t) => (
                      <td
                        key={t.weekDays}
                        className="py-2 text-right font-semibold"
                        style={{ color: t.weekDays === weekDays ? "#1d4ed8" : "#374151" }}
                      >
                        {t.rows[i].days}日
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 免責・参考リンク */}
      <div className="rounded-2xl border border-gray-200 p-5" style={{ background: "#f9fafb" }}>
        <p className="text-xs text-gray-500 mb-2">
          本ツールは概算計算を目的としており、実際の付与日数は就業規則・雇用契約等により異なる場合があります。
          正確な判断は社会保険労務士等の専門家にご相談ください。
          労働基準法第39条（2024年現在）に基づいて計算しています。
        </p>
        <a
          href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/zigyonushi/yukyu/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs underline"
          style={{ color: "#1d4ed8" }}
        >
          厚生労働省「年次有給休暇の付与日数は法律で決まっています」を確認する
        </a>
      </div>
    </div>
  );
}
