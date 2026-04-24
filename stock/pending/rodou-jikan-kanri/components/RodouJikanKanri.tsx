"use client";

import { useState, useMemo } from "react";

// 36協定 上限規制
const GENRI = { month: 45, year: 360 } as const;
const TOKUBETSU = { month: 100, year: 720, avg: 80 } as const;

const MONTH_NAMES = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

type Mode = "simple" | "monthly";

type Violation =
  | "genri-month"
  | "genri-year"
  | "tokubetsu-month"
  | "tokubetsu-year"
  | "tokubetsu-avg"
  | "ok";

function getViolations(monthOT: number, yearOT: number, maxAvg: number): Violation[] {
  const vs: Violation[] = [];
  if (monthOT >= TOKUBETSU.month) vs.push("tokubetsu-month");
  else if (monthOT > GENRI.month) vs.push("genri-month");
  if (yearOT > TOKUBETSU.year) vs.push("tokubetsu-year");
  else if (yearOT > GENRI.year) vs.push("genri-year");
  if (maxAvg > TOKUBETSU.avg) vs.push("tokubetsu-avg");
  return vs.length === 0 ? ["ok"] : vs;
}

function StatusBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
        ok
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      <span>{ok ? "✓" : "✗"}</span>
      {label}
    </span>
  );
}

function ProgressBar({
  value,
  max,
  danger,
  label,
  unit = "h",
}: {
  value: number;
  max: number;
  danger: boolean;
  label: string;
  unit?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-muted">{label}</span>
        <span className={`text-xs font-mono font-medium ${danger ? "text-red-600" : "text-green-700"}`}>
          {value.toFixed(0)}{unit} / {max}{unit}
        </span>
      </div>
      <div className="h-3 bg-accent rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${danger ? "bg-red-500" : "bg-green-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function RodouJikanKanri() {
  const [mode, setMode] = useState<Mode>("simple");

  // Simple mode
  const [simpleMonth, setSimpleMonth] = useState("");
  const [simpleYear, setSimpleYear] = useState("");

  // Monthly mode — 12 months of overtime hours
  const [monthly, setMonthly] = useState<string[]>(Array(12).fill(""));

  const inputClass =
    "w-full px-3 py-2 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent";

  // Compute moving averages for 2-6 consecutive months
  function computeMaxAvg(hours: number[]): number {
    let max = 0;
    for (let span = 2; span <= 6; span++) {
      for (let start = 0; start <= hours.length - span; start++) {
        const slice = hours.slice(start, start + span);
        const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
        if (avg > max) max = avg;
      }
    }
    return max;
  }

  const result = useMemo(() => {
    if (mode === "simple") {
      const m = parseFloat(simpleMonth);
      const y = parseFloat(simpleYear);
      if (isNaN(m) || isNaN(y) || m < 0 || y < 0) return null;
      // No monthly detail → avg not computable, set to 0
      const violations = getViolations(m, y, 0);
      return { monthOT: m, yearOT: y, maxAvg: null, violations };
    } else {
      const hours = monthly.map((v) => parseFloat(v) || 0);
      const yearOT = hours.reduce((a, b) => a + b, 0);
      // Use highest month as representative month value for display
      const monthOT = Math.max(...hours);
      const maxAvg = computeMaxAvg(hours);
      const violations = getViolations(monthOT, yearOT, maxAvg);
      return { monthOT, yearOT, maxAvg, violations, hours };
    }
  }, [mode, simpleMonth, simpleYear, monthly]);

  const hasViolation = result !== null && !result.violations.includes("ok");
  const isOk = result !== null && result.violations.includes("ok");

  function setMonthValue(i: number, val: string) {
    setMonthly((prev) => {
      const next = [...prev];
      next[i] = val.replace(/[^0-9.]/g, "");
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">入力モード</h2>
        <div className="flex gap-2">
          {([["simple", "簡易入力（月・年）"], ["monthly", "月別入力（12ヶ月）"]] as [Mode, string][]).map(
            ([m, label]) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  mode === m
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted hover:border-primary/50"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Simple input */}
      {mode === "simple" && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="font-bold text-base mb-4">残業時間を入力</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">月の残業時間（時間）</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="45"
                  value={simpleMonth}
                  onChange={(e) => setSimpleMonth(e.target.value.replace(/[^0-9.]/g, ""))}
                  className={inputClass + " pr-8"}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">h</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">年間の残業時間（時間）</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="360"
                  value={simpleYear}
                  onChange={(e) => setSimpleYear(e.target.value.replace(/[^0-9.]/g, ""))}
                  className={inputClass + " pr-8"}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">h</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted mt-3">
            ※ 2-6ヶ月平均の判定は月別入力モードで行えます。
          </p>
        </div>
      )}

      {/* Monthly input */}
      {mode === "monthly" && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="font-bold text-base mb-4">月別残業時間を入力（時間）</h2>
          <div className="grid grid-cols-3 gap-3">
            {MONTH_NAMES.map((name, i) => (
              <div key={name}>
                <label className="block text-xs text-muted mb-1">{name}</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={monthly[i]}
                    onChange={(e) => setMonthValue(i, e.target.value)}
                    className={inputClass + " pr-6 text-sm"}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted">h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`bg-card border-2 rounded-xl p-5 shadow-sm ${
            hasViolation ? "border-red-300" : "border-green-300"
          }`}
        >
          {/* Overall badge */}
          <div
            className={`flex items-center justify-between mb-4 p-4 rounded-lg ${
              hasViolation ? "bg-red-50" : "bg-green-50"
            }`}
          >
            <div>
              <p className="text-xs text-muted mb-1">総合判定</p>
              <p className={`text-2xl font-bold ${hasViolation ? "text-red-600" : "text-green-700"}`}>
                {hasViolation ? "上限規制に抵触" : "適正"}
              </p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              {result.violations.map((v) => {
                const labels: Record<string, string> = {
                  "genri-month": "原則月45h超過",
                  "genri-year": "原則年360h超過",
                  "tokubetsu-month": "特別条項月100h以上",
                  "tokubetsu-year": "特別条項年720h超過",
                  "tokubetsu-avg": "2-6ヶ月平均80h超過",
                  ok: "適正",
                };
                return (
                  <StatusBadge key={v} label={labels[v] ?? v} ok={v === "ok"} />
                );
              })}
            </div>
          </div>

          {/* Progress bars */}
          <div className="mb-2">
            <ProgressBar
              value={result.monthOT}
              max={TOKUBETSU.month}
              danger={result.monthOT >= TOKUBETSU.month}
              label={mode === "monthly" ? "最大月残業時間（特別条項上限）" : "月残業時間（特別条項上限）"}
            />
            <div className="relative mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted">
                  {mode === "monthly" ? "最大月残業時間（原則上限）" : "月残業時間（原則上限）"}
                </span>
                <span className={`text-xs font-mono font-medium ${result.monthOT > GENRI.month ? "text-yellow-600" : "text-green-700"}`}>
                  {result.monthOT.toFixed(0)}h / {GENRI.month}h
                </span>
              </div>
              <div className="h-3 bg-accent rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${result.monthOT > GENRI.month ? "bg-yellow-400" : "bg-green-500"}`}
                  style={{ width: `${Math.min((result.monthOT / GENRI.month) * 100, 100)}%` }}
                />
              </div>
            </div>
            <ProgressBar
              value={result.yearOT}
              max={TOKUBETSU.year}
              danger={result.yearOT > TOKUBETSU.year}
              label="年間残業時間（特別条項上限720h）"
            />
            <div className="relative mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted">年間残業時間（原則上限360h）</span>
                <span className={`text-xs font-mono font-medium ${result.yearOT > GENRI.year ? "text-yellow-600" : "text-green-700"}`}>
                  {result.yearOT.toFixed(0)}h / {GENRI.year}h
                </span>
              </div>
              <div className="h-3 bg-accent rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${result.yearOT > GENRI.year ? "bg-yellow-400" : "bg-green-500"}`}
                  style={{ width: `${Math.min((result.yearOT / GENRI.year) * 100, 100)}%` }}
                />
              </div>
            </div>
            {result.maxAvg !== null && (
              <ProgressBar
                value={result.maxAvg}
                max={TOKUBETSU.avg}
                danger={result.maxAvg > TOKUBETSU.avg}
                label="2-6ヶ月平均残業時間（特別条項上限80h）"
              />
            )}
          </div>

          {/* Monthly breakdown table */}
          {mode === "monthly" && result.hours && (
            <div className="mt-4 border-t border-border pt-4">
              <h3 className="text-sm font-bold mb-2">月別内訳</h3>
              <div className="grid grid-cols-4 gap-1 text-xs">
                {MONTH_NAMES.map((name, i) => {
                  const h = result.hours![i];
                  const over45 = h > GENRI.month;
                  const over100 = h >= TOKUBETSU.month;
                  return (
                    <div
                      key={name}
                      className={`flex justify-between px-2 py-1.5 rounded ${
                        over100
                          ? "bg-red-50 text-red-700"
                          : over45
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-accent text-muted"
                      }`}
                    >
                      <span>{name}</span>
                      <span className="font-mono font-medium">{h.toFixed(0)}h</span>
                    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この労働時間上限チェック（36協定）ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">週・月・年の労働時間から上限規制の抵触判定。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この労働時間上限チェック（36協定）ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "週・月・年の労働時間から上限規制の抵触判定。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-muted">
                  <span className="inline-block w-3 h-3 bg-yellow-200 rounded" />
                  45h超
                </span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  <span className="inline-block w-3 h-3 bg-red-200 rounded" />
                  100h以上
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reference table */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-3">36協定 上限規制一覧</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-3 text-muted font-medium">区分</th>
                <th className="text-right py-2 px-3 text-muted font-medium">月上限</th>
                <th className="text-right py-2 px-3 text-muted font-medium">年上限</th>
                <th className="text-right py-2 pl-3 text-muted font-medium">2-6月平均</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-2 pr-3 font-medium">原則</td>
                <td className="text-right py-2 px-3 font-mono">45h</td>
                <td className="text-right py-2 px-3 font-mono">360h</td>
                <td className="text-right py-2 pl-3 text-muted">—</td>
              </tr>
              <tr>
                <td className="py-2 pr-3 font-medium">特別条項</td>
                <td className="text-right py-2 px-3 font-mono text-red-600">100h未満</td>
                <td className="text-right py-2 px-3 font-mono text-red-600">720h</td>
                <td className="text-right py-2 pl-3 font-mono text-red-600">80h以下</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-2">
          ※ 特別条項の適用は年6回まで。月100h・2-6月平均80hは休日労働を含む。
        </p>
      </div>

      {/* Ad placeholder */}
      <div className="flex items-center justify-center h-20 bg-accent border border-dashed border-border rounded-xl text-xs text-muted">
        広告
      </div>

      {/* Disclaimer */}
      <div className="bg-accent border border-border rounded-xl p-4">
        <p className="text-xs text-muted leading-relaxed">
          【免責事項】本ツールは労働基準法・36協定に基づく参考情報を提供するものです。
          建設業・自動車運転・医師等の特例業種、2024年問題対応の経過措置については別途確認が必要です。
          実際の適法性判断は必ず専門家（社会保険労務士等）または所轄労働基準監督署にご相談ください。
          本ツールの利用により生じた損害について、開発者は一切の責任を負いません。
        </p>
      </div>
    </div>
  );
}
