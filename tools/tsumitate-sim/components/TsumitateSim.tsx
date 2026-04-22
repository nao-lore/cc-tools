"use client";

import { useState, useMemo } from "react";

interface SimInputs {
  monthly: string;
  annualRate: string;
  years: string;
  initial: string;
}

interface YearlyRow {
  year: number;
  principal: number;
  gain: number;
  total: number;
}

function formatCurrency(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

function calcSimulation(inputs: SimInputs): {
  finalAmount: number;
  totalPrincipal: number;
  totalGain: number;
  gainRate: number;
  yearlyRows: YearlyRow[];
} | null {
  const monthly = parseFloat(inputs.monthly) || 0;
  const annualRate = parseFloat(inputs.annualRate) || 0;
  const years = parseInt(inputs.years) || 0;
  const initial = parseFloat(inputs.initial) || 0;

  if (monthly <= 0 || annualRate < 0 || years <= 0) return null;

  const monthlyRate = annualRate / 100 / 12;
  const yearlyRows: YearlyRow[] = [];

  let balance = initial;
  let principalSoFar = initial;

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyRate) + monthly;
      principalSoFar += monthly;
    }
    yearlyRows.push({
      year: y,
      principal: principalSoFar,
      gain: balance - principalSoFar,
      total: balance,
    });
  }

  const totalPrincipal = principalSoFar;
  const finalAmount = balance;
  const totalGain = finalAmount - totalPrincipal;
  const gainRate = totalPrincipal > 0 ? (totalGain / totalPrincipal) * 100 : 0;

  return { finalAmount, totalPrincipal, totalGain, gainRate, yearlyRows };
}

function ResultCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-card border rounded-xl p-4 ${highlight ? "border-primary/40 bg-primary/5" : "border-border"}`}
    >
      <p className="text-xs text-muted mb-1">{label}</p>
      <p
        className={`text-xl font-bold font-mono ${highlight ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

export default function TsumitateSim() {
  const [inputs, setInputs] = useState<SimInputs>({
    monthly: "33333",
    annualRate: "5",
    years: "20",
    initial: "",
  });
  const [showFullTable, setShowFullTable] = useState(false);

  const set = (key: keyof SimInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    setInputs((prev) => ({ ...prev, [key]: raw }));
  };

  const result = useMemo(() => calcSimulation(inputs), [inputs]);

  const displayRows = useMemo(() => {
    if (!result) return [];
    return showFullTable ? result.yearlyRows : result.yearlyRows.slice(0, 10);
  }, [result, showFullTable]);

  const monthlyNum = parseFloat(inputs.monthly) || 0;
  const isNisaRange = monthlyNum > 0 && monthlyNum <= 33333;

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="font-bold text-base">シミュレーション条件</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1">
              毎月の積立額（円）
              <span className="ml-1 text-primary font-medium">必須</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="33,333"
              value={inputs.monthly}
              onChange={set("monthly")}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
            />
            {isNisaRange && (
              <p className="text-xs text-primary mt-1">
                つみたてNISA枠内（月33,333円 / 年40万円以内）
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">
              想定年利（%）
              <span className="ml-1 text-primary font-medium">必須</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="5.0"
              value={inputs.annualRate}
              onChange={set("annualRate")}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
            />
            <p className="text-xs text-muted mt-1">参考: 全世界株式インデックス 年4〜7%</p>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">
              積立期間（年）
              <span className="ml-1 text-primary font-medium">必須</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="20"
              value={inputs.years}
              onChange={set("years")}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">
              初期投資額（円）
              <span className="ml-1 text-muted">任意</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={inputs.initial}
              onChange={set("initial")}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
            />
          </div>
        </div>

        {/* NISA note */}
        <div className="bg-accent rounded-lg px-4 py-3 text-xs text-muted border border-border">
          <span className="font-medium text-foreground">つみたてNISA参考：</span>
          年間40万円（月33,333円）まで非課税。新NISAのつみたて投資枠は年120万円（月10万円）まで。
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ResultCard
              label="最終積立額"
              value={`¥${formatCurrency(result.finalAmount)}`}
              highlight
            />
            <ResultCard
              label="元本合計"
              value={`¥${formatCurrency(result.totalPrincipal)}`}
            />
            <ResultCard
              label="運用益"
              value={`¥${formatCurrency(result.totalGain)}`}
            />
            <ResultCard
              label="運用益率"
              value={`${result.gainRate.toFixed(1)}%`}
              sub={`元本の${result.gainRate.toFixed(1)}%増`}
            />
          </div>

          {/* Bar visualization */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-sm mb-3">元本 vs 運用益</h3>
            <div className="flex rounded-full overflow-hidden h-6 text-xs font-medium">
              <div
                className="bg-primary/70 flex items-center justify-center text-white truncate px-2"
                style={{
                  width: `${(result.totalPrincipal / result.finalAmount) * 100}%`,
                }}
              >
                元本
              </div>
              <div
                className="bg-primary flex items-center justify-center text-white truncate px-2"
                style={{
                  width: `${(result.totalGain / result.finalAmount) * 100}%`,
                }}
              >
                運用益
              </div>
            </div>
            <div className="flex gap-4 mt-2 text-xs text-muted">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm bg-primary/70" />
                元本 {((result.totalPrincipal / result.finalAmount) * 100).toFixed(1)}%
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-sm bg-primary" />
                運用益 {((result.totalGain / result.finalAmount) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Yearly table */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-sm mb-3">年次推移</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted">
                    <th className="pb-2 text-left font-medium">年</th>
                    <th className="pb-2 text-right font-medium">元本累計</th>
                    <th className="pb-2 text-right font-medium">運用益</th>
                    <th className="pb-2 text-right font-medium">合計</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayRows.map((row) => (
                    <tr key={row.year} className="hover:bg-accent/50 transition-colors">
                      <td className="py-2 text-muted">{row.year}年目</td>
                      <td className="py-2 text-right font-mono">
                        ¥{formatCurrency(row.principal)}
                      </td>
                      <td className="py-2 text-right font-mono text-primary">
                        ¥{formatCurrency(row.gain)}
                      </td>
                      <td className="py-2 text-right font-mono font-bold">
                        ¥{formatCurrency(row.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.yearlyRows.length > 10 && (
              <button
                onClick={() => setShowFullTable((v) => !v)}
                className="mt-3 w-full py-2 text-xs text-muted hover:text-primary border border-dashed border-border rounded-lg transition-colors"
              >
                {showFullTable
                  ? "折りたたむ"
                  : `全${result.yearlyRows.length}年分を表示`}
              </button>
            )}
          </div>
        </>
      )}

      {!result && (
        <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm">
          積立額・年利・期間を入力すると結果が表示されます
        </div>
      )}
    </div>
  );
}
