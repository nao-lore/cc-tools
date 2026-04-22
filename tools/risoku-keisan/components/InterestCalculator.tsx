"use client";

import { useState, useMemo } from "react";

type InterestType = "simple" | "compound";
type PeriodUnit = "year" | "month";
type CompoundFrequency = "annually" | "semiannually" | "quarterly" | "monthly";

interface Inputs {
  principal: string;
  annualRate: string;
  period: string;
  periodUnit: PeriodUnit;
  interestType: InterestType;
  compoundFrequency: CompoundFrequency;
}

interface YearlyRow {
  year: number;
  startBalance: number;
  interest: number;
  endBalance: number;
}

interface Result {
  principal: number;
  totalInterest: number;
  totalAmount: number;
  effectiveRate: number;
  yearlyRows: YearlyRow[];
}

function formatCurrency(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

function formatRate(n: number): string {
  return n.toFixed(4);
}

const COMPOUND_FREQ_LABELS: Record<CompoundFrequency, string> = {
  annually: "年1回",
  semiannually: "半年（年2回）",
  quarterly: "四半期（年4回）",
  monthly: "毎月（年12回）",
};

const COMPOUND_FREQ_N: Record<CompoundFrequency, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
};

function calculate(inputs: Inputs): Result | null {
  const principal = parseFloat(inputs.principal.replace(/,/g, ""));
  const annualRate = parseFloat(inputs.annualRate);
  const periodRaw = parseFloat(inputs.period);

  if (!principal || !annualRate || !periodRaw || principal <= 0 || annualRate <= 0 || periodRaw <= 0) {
    return null;
  }

  const years = inputs.periodUnit === "year" ? periodRaw : periodRaw / 12;
  const r = annualRate / 100;

  let totalAmount: number;
  let yearlyRows: YearlyRow[] = [];

  if (inputs.interestType === "simple") {
    totalAmount = principal * (1 + r * years);
    const totalInterestVal = totalAmount - principal;
    const annualInterest = principal * r;

    const fullYears = Math.floor(years);
    const fracYear = years - fullYears;

    let balance = principal;
    for (let y = 1; y <= fullYears; y++) {
      const interest = annualInterest;
      yearlyRows.push({
        year: y,
        startBalance: balance,
        interest,
        endBalance: balance + interest,
      });
      balance += interest;
    }
    if (fracYear > 0.001) {
      const interest = annualInterest * fracYear;
      yearlyRows.push({
        year: fullYears + 1,
        startBalance: balance,
        interest,
        endBalance: balance + interest,
      });
    }

    const totalInterest = totalAmount - principal;
    const effectiveRate = years > 0 ? (totalInterest / principal / years) * 100 : 0;

    return { principal, totalInterest, totalAmount, effectiveRate, yearlyRows };
  } else {
    // compound
    const n = COMPOUND_FREQ_N[inputs.compoundFrequency];
    const rPerPeriod = r / n;
    const periods = n * years;

    totalAmount = principal * Math.pow(1 + rPerPeriod, periods);

    const fullYears = Math.floor(years);
    const fracYear = years - fullYears;

    let balance = principal;
    for (let y = 1; y <= fullYears; y++) {
      const endBalance = balance * Math.pow(1 + rPerPeriod, n);
      const interest = endBalance - balance;
      yearlyRows.push({
        year: y,
        startBalance: balance,
        interest,
        endBalance,
      });
      balance = endBalance;
    }
    if (fracYear > 0.001) {
      const fracPeriods = n * fracYear;
      const endBalance = balance * Math.pow(1 + rPerPeriod, fracPeriods);
      const interest = endBalance - balance;
      yearlyRows.push({
        year: fullYears + 1,
        startBalance: balance,
        interest,
        endBalance,
      });
    }

    const totalInterest = totalAmount - principal;
    // effective annual rate
    const effectiveRate = (Math.pow(1 + rPerPeriod, n) - 1) * 100;

    return { principal, totalInterest, totalAmount, effectiveRate, yearlyRows };
  }
}

function ResultRow({
  label,
  value,
  highlight,
  large,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  large?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center py-2.5 ${large ? "text-lg font-bold" : ""}`}
    >
      <span className="text-muted text-sm">{label}</span>
      <span className={highlight ? "text-primary font-semibold" : ""}>{value}</span>
    </div>
  );
}

export default function InterestCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    principal: "",
    annualRate: "",
    period: "",
    periodUnit: "year",
    interestType: "compound",
    compoundFrequency: "annually",
  });

  const set = (key: keyof Inputs, value: string) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(() => calculate(inputs), [inputs]);

  return (
    <div className="space-y-5">
      {/* Input Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="font-bold text-base flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary inline-block" />
          入力
        </h2>

        {/* 元金 */}
        <div>
          <label className="block text-xs text-muted mb-1">元金（円）</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="1,000,000"
            value={inputs.principal}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "");
              set("principal", v);
            }}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
          />
        </div>

        {/* 年利率 */}
        <div>
          <label className="block text-xs text-muted mb-1">年利率（%）</label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="3.0"
            min="0"
            step="0.01"
            value={inputs.annualRate}
            onChange={(e) => set("annualRate", e.target.value)}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
          />
        </div>

        {/* 期間 */}
        <div>
          <label className="block text-xs text-muted mb-1">期間</label>
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="10"
              min="0"
              step="1"
              value={inputs.period}
              onChange={(e) => set("period", e.target.value)}
              className="flex-1 px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
            />
            <select
              value={inputs.periodUnit}
              onChange={(e) => set("periodUnit", e.target.value as PeriodUnit)}
              className="w-24 px-3 py-2.5 border border-border rounded-lg bg-accent focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option value="year">年</option>
              <option value="month">ヶ月</option>
            </select>
          </div>
        </div>

        {/* 利息の種類 */}
        <div>
          <label className="block text-xs text-muted mb-2">利息の種類</label>
          <div className="flex gap-2">
            {(["simple", "compound"] as InterestType[]).map((t) => (
              <button
                key={t}
                onClick={() => set("interestType", t)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  inputs.interestType === t
                    ? "bg-primary text-white border-primary"
                    : "bg-accent border-border text-muted hover:border-primary hover:text-primary"
                }`}
              >
                {t === "simple" ? "単利" : "複利"}
              </button>
            ))}
          </div>
        </div>

        {/* 複利頻度 (複利の場合のみ) */}
        {inputs.interestType === "compound" && (
          <div>
            <label className="block text-xs text-muted mb-1">複利計算の頻度</label>
            <select
              value={inputs.compoundFrequency}
              onChange={(e) => set("compoundFrequency", e.target.value as CompoundFrequency)}
              className="w-full px-3 py-2.5 border border-border rounded-lg bg-accent focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              {(Object.keys(COMPOUND_FREQ_LABELS) as CompoundFrequency[]).map((k) => (
                <option key={k} value={k}>
                  {COMPOUND_FREQ_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Result Card */}
      {result && (
        <>
          <div className="bg-card border-2 border-primary/20 rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-base flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              計算結果
            </h2>
            <div className="divide-y divide-border">
              <ResultRow
                label="元金"
                value={`¥${formatCurrency(result.principal)}`}
              />
              <ResultRow
                label="利息額"
                value={`¥${formatCurrency(result.totalInterest)}`}
                highlight
              />
              <ResultRow
                label="元利合計"
                value={`¥${formatCurrency(result.totalAmount)}`}
                large
              />
              <ResultRow
                label={
                  inputs.interestType === "compound"
                    ? "実効年利率（EAR）"
                    : "実質利回り（年率）"
                }
                value={`${formatRate(result.effectiveRate)}%`}
              />
            </div>
          </div>

          {/* Yearly table */}
          {result.yearlyRows.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h2 className="font-bold text-base flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                年次推移
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-3 text-muted font-medium text-xs">年</th>
                      <th className="text-right py-2 px-2 text-muted font-medium text-xs">期首残高</th>
                      <th className="text-right py-2 px-2 text-muted font-medium text-xs text-primary">利息</th>
                      <th className="text-right py-2 pl-2 text-muted font-medium text-xs">期末残高</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearlyRows.map((row) => (
                      <tr key={row.year} className="border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors">
                        <td className="py-2 pr-3 text-muted text-xs">{row.year}年目</td>
                        <td className="py-2 px-2 text-right font-mono text-xs">
                          ¥{formatCurrency(row.startBalance)}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-xs text-primary">
                          +¥{formatCurrency(row.interest)}
                        </td>
                        <td className="py-2 pl-2 text-right font-mono text-xs font-semibold">
                          ¥{formatCurrency(row.endBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
