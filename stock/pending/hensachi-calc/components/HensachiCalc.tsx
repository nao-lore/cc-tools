"use client";

import { useState, useMemo } from "react";

// ── Pure math ────────────────────────────────────────────────────────────────

function calcHensachi(score: number, avg: number, sd: number): number {
  if (sd === 0) return 50;
  return ((score - avg) / sd) * 10 + 50;
}

function parseNumbers(raw: string): number[] {
  return raw
    .split(/[\s,\n]+/)
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map(Number)
    .filter((n) => !isNaN(n));
}

// ── Rank helpers ─────────────────────────────────────────────────────────────

interface Rank {
  label: string;
  min: number;
  color: string;
  bg: string;
  border: string;
}

const RANKS: Rank[] = [
  { label: "最難関", min: 70, color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300" },
  { label: "難関",   min: 65, color: "text-red-700",    bg: "bg-red-50",    border: "border-red-300"    },
  { label: "上位",   min: 60, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-300" },
  { label: "中上位", min: 55, color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-300" },
  { label: "平均",   min: 45, color: "text-green-700",  bg: "bg-green-50",  border: "border-green-300"  },
  { label: "やや下位", min: 0, color: "text-gray-600",  bg: "bg-gray-50",   border: "border-gray-300"   },
];

function getRank(h: number): Rank {
  return RANKS.find((r) => h >= r.min) ?? RANKS[RANKS.length - 1];
}

// ── Gauge ────────────────────────────────────────────────────────────────────

function Gauge({ value }: { value: number }) {
  // clamp to 20–80 for display
  const clamped = Math.max(20, Math.min(80, value));
  const pct = ((clamped - 20) / 60) * 100;
  const rank = getRank(value);

  // color for fill
  const fillColor =
    value >= 70 ? "#7c3aed" :
    value >= 65 ? "#dc2626" :
    value >= 60 ? "#ea580c" :
    value >= 55 ? "#ca8a04" :
    value >= 45 ? "#16a34a" :
                  "#6b7280";

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-400">
        <span>20</span>
        <span>35</span>
        <span>50</span>
        <span>65</span>
        <span>80+</span>
      </div>
      <div className="relative h-4 rounded-full bg-gray-100 overflow-hidden">
        {/* gradient background */}
        <div
          className="absolute inset-0 opacity-20 rounded-full"
          style={{
            background: "linear-gradient(to right, #6b7280, #16a34a, #ca8a04, #ea580c, #dc2626, #7c3aed)",
          }}
        />
        {/* fill bar */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: fillColor, opacity: 0.85 }}
        />
        {/* thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow transition-all duration-500"
          style={{ left: `calc(${pct}% - 6px)`, backgroundColor: fillColor }}
        />
      </div>
      {/* rank band markers */}
      <div className="flex justify-between text-xs text-gray-300">
        {RANKS.slice().reverse().map((r) => (
          <span
            key={r.label}
            className={`font-medium transition-colors ${getRank(value).label === r.label ? rank.color : "text-gray-300"}`}
          >
            {r.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function HensachiCalc() {
  // Single mode inputs
  const [score, setScore] = useState("");
  const [avg, setAvg] = useState("");
  const [sd, setSd] = useState("");

  // Batch mode
  const [batchMode, setBatchMode] = useState(false);
  const [batchAvg, setBatchAvg] = useState("");
  const [batchSd, setBatchSd] = useState("");
  const [batchRaw, setBatchRaw] = useState("");

  // ── Single calc ──────────────────────────────────────────────────────────

  const singleResult = useMemo<{ value: number; rank: Rank } | null>(() => {
    const s = parseFloat(score);
    const a = parseFloat(avg);
    const d = parseFloat(sd);
    if (isNaN(s) || isNaN(a) || isNaN(d) || d < 0) return null;
    const h = calcHensachi(s, a, d);
    return { value: h, rank: getRank(h) };
  }, [score, avg, sd]);

  const singleError = useMemo<string | null>(() => {
    if (score === "" && avg === "" && sd === "") return null;
    const d = parseFloat(sd);
    if (!isNaN(d) && d < 0) return "標準偏差は0以上の値を入力してください";
    return null;
  }, [score, avg, sd]);

  // ── Batch calc ───────────────────────────────────────────────────────────

  const batchResults = useMemo<Array<{ score: number; hensachi: number; rank: Rank }> | null>(() => {
    if (!batchMode) return null;
    const a = parseFloat(batchAvg);
    const d = parseFloat(batchSd);
    if (isNaN(a) || isNaN(d) || d < 0) return null;
    const scores = parseNumbers(batchRaw);
    if (scores.length === 0) return null;
    return scores.map((s) => {
      const h = calcHensachi(s, a, d);
      return { score: s, hensachi: h, rank: getRank(h) };
    });
  }, [batchMode, batchAvg, batchSd, batchRaw]);

  const fmt1 = (n: number) => n.toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">偏差値計算ツール</h1>
          <p className="mt-1 text-sm text-gray-500">
            得点・平均点・標準偏差を入力して偏差値を算出。大学ランク帯の目安も表示します。
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setBatchMode(false)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              !batchMode
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            1件計算
          </button>
          <button
            onClick={() => setBatchMode(true)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              batchMode
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            一括計算（複数得点）
          </button>
        </div>

        {!batchMode ? (
          <>
            {/* Single mode inputs */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">あなたの得点</label>
                  <input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="例: 72"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">平均点</label>
                  <input
                    type="number"
                    value={avg}
                    onChange={(e) => setAvg(e.target.value)}
                    placeholder="例: 60"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">標準偏差</label>
                  <input
                    type="number"
                    value={sd}
                    onChange={(e) => setSd(e.target.value)}
                    placeholder="例: 12"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              </div>

              {singleError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {singleError}
                </div>
              )}
            </div>

            {/* Single result */}
            {singleResult && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
                {/* Big hensachi */}
                <div className="text-center space-y-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">偏差値</p>
                  <p className={`text-6xl font-bold tabular-nums ${singleResult.rank.color}`}>
                    {fmt1(singleResult.value)}
                  </p>
                  <span
                    className={`inline-block rounded-full px-4 py-1 text-sm font-bold border ${singleResult.rank.bg} ${singleResult.rank.color} ${singleResult.rank.border}`}
                  >
                    {singleResult.rank.label}
                  </span>
                </div>

                {/* Gauge */}
                <Gauge value={singleResult.value} />

                {/* Rank table */}
                <div className="rounded-lg border border-gray-100 divide-y divide-gray-100">
                  {RANKS.map((r) => (
                    <div
                      key={r.label}
                      className={`flex items-center justify-between px-4 py-2 ${
                        singleResult.rank.label === r.label ? r.bg : ""
                      }`}
                    >
                      <span className={`text-sm font-medium ${singleResult.rank.label === r.label ? r.color : "text-gray-600"}`}>
                        {r.label}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {r.min === 70 ? "70以上" : r.min === 0 ? "45未満" : `${r.min}〜${RANKS[RANKS.indexOf(r) - 1]?.min ?? 99}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Batch mode inputs */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">平均点</label>
                  <input
                    type="number"
                    value={batchAvg}
                    onChange={(e) => setBatchAvg(e.target.value)}
                    placeholder="例: 60"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">標準偏差</label>
                  <input
                    type="number"
                    value={batchSd}
                    onChange={(e) => setBatchSd(e.target.value)}
                    placeholder="例: 12"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">得点一覧</label>
                <p className="text-xs text-gray-400">カンマ・スペース・改行で区切って複数入力</p>
                <textarea
                  value={batchRaw}
                  onChange={(e) => setBatchRaw(e.target.value)}
                  placeholder="例: 55, 72, 48, 81, 63"
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Batch results */}
            {batchResults && batchResults.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-3 text-left font-medium text-gray-500">#</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">得点</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">偏差値</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500">ランク</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {batchResults.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2.5 text-gray-400 text-xs">{i + 1}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-gray-700">{row.score}</td>
                        <td className={`px-4 py-2.5 text-right font-mono font-semibold ${row.rank.color}`}>
                          {fmt1(row.hensachi)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold border ${row.rank.bg} ${row.rank.color} ${row.rank.border}`}
                          >
                            {row.rank.label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Ad placeholder */}
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
          広告スペース
        </div>

        {/* Formula explanation */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-3 text-sm text-gray-600">
          <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">計算式</p>
          <ul className="space-y-1.5 text-xs leading-relaxed">
            <li>
              <span className="font-medium text-gray-700">偏差値</span>：（得点 − 平均点）÷ 標準偏差 × 10 + 50
            </li>
            <li>
              <span className="font-medium text-gray-700">標準偏差が0のとき</span>：偏差値 = 50（全員同点）
            </li>
            <li>
              <span className="font-medium text-gray-700">ランク目安</span>：70以上 最難関 / 65以上 難関 / 60以上 上位 / 55以上 中上位 / 45以上 平均 / 45未満 やや下位
            </li>
          </ul>
        </div>

      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この偏差値 計算機ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">得点・平均点・標準偏差から偏差値算出、大学ランク帯表示。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この偏差値 計算機ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "得点・平均点・標準偏差から偏差値算出、大学ランク帯表示。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "偏差値 計算機",
  "description": "得点・平均点・標準偏差から偏差値算出、大学ランク帯表示",
  "url": "https://tools.loresync.dev/hensachi-calc",
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
