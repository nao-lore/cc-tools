"use client";

import { useState, useMemo } from "react";

function formatJPY(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

function formatNum(n: number, digits = 1): string {
  return n.toLocaleString("ja-JP", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  step?: string;
}

function InputField({ label, value, onChange, placeholder, suffix, step = "1" }: InputFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        {suffix && (
          <span className="text-xs text-gray-500 whitespace-nowrap">{suffix}</span>
        )}
      </div>
    </div>
  );
}

interface ResultCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: "green" | "blue" | "orange" | "default";
}

function ResultCard({ label, value, sub, highlight = "default" }: ResultCardProps) {
  const colors: Record<string, string> = {
    green: "bg-green-50 border-green-200",
    blue: "bg-blue-50 border-blue-200",
    orange: "bg-orange-50 border-orange-200",
    default: "bg-gray-50 border-gray-200",
  };
  const textColors: Record<string, string> = {
    green: "text-green-700",
    blue: "text-blue-700",
    orange: "text-orange-700",
    default: "text-gray-800",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 ${colors[highlight]}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${textColors[highlight]}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// FIRE reference table: savings rate -> approximate years (at 5% return, starting from zero)
const FIRE_TABLE: { rate: number; years: number }[] = [
  { rate: 10, years: 51 },
  { rate: 20, years: 37 },
  { rate: 30, years: 28 },
  { rate: 40, years: 22 },
  { rate: 50, years: 17 },
  { rate: 60, years: 13 },
  { rate: 70, years: 9 },
  { rate: 75, years: 7 },
  { rate: 80, years: 6 },
];

export default function SavingsRate() {
  const [income, setIncome] = useState("350000");
  const [expense, setExpense] = useState("220000");
  const [returnRate, setReturnRate] = useState("5");

  const result = useMemo(() => {
    const inc = parseFloat(income);
    const exp = parseFloat(expense);
    const r = parseFloat(returnRate) / 100;

    if ([inc, exp, r].some((v) => isNaN(v) || v <= 0)) return null;
    if (exp >= inc) return null;

    const monthlySavings = inc - exp;
    const annualSavings = monthlySavings * 12;
    const annualExpense = exp * 12;
    const savingsRate = (monthlySavings / inc) * 100;
    const targetAsset = annualExpense * 25;

    // years = ln(1 + targetAsset * r / annualSavings) / ln(1 + r)
    let fireYears: number | null = null;
    if (annualSavings > 0 && r > 0) {
      const inner = 1 + (targetAsset * r) / annualSavings;
      if (inner > 0) {
        fireYears = Math.log(inner) / Math.log(1 + r);
      }
    }

    return { monthlySavings, annualSavings, annualExpense, savingsRate, targetAsset, fireYears };
  }, [income, expense, returnRate]);

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700">基本情報を入力</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InputField
            label="手取り月収"
            value={income}
            onChange={setIncome}
            placeholder="350000"
            suffix="円"
          />
          <InputField
            label="月間支出"
            value={expense}
            onChange={setExpense}
            placeholder="220000"
            suffix="円"
          />
          <InputField
            label="投資リターン（年率）"
            value={returnRate}
            onChange={setReturnRate}
            placeholder="5"
            suffix="%"
            step="0.1"
          />
        </div>

        {result ? (
          <>
            {/* Key results */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ResultCard
                label="貯蓄率"
                value={`${formatNum(result.savingsRate, 1)}%`}
                sub={`月${formatJPY(result.monthlySavings)}円 貯蓄`}
                highlight="green"
              />
              <ResultCard
                label="月間貯蓄額"
                value={`¥${formatJPY(result.monthlySavings)}`}
                sub="手取り − 支出"
                highlight="blue"
              />
              <ResultCard
                label="年間貯蓄額"
                value={`¥${formatJPY(result.annualSavings)}`}
                sub="月間貯蓄 × 12"
                highlight="blue"
              />
              <ResultCard
                label="FIRE目標資産"
                value={`¥${formatJPY(result.targetAsset)}`}
                sub="年間支出 × 25倍"
                highlight="orange"
              />
            </div>

            {/* FIRE years highlight */}
            {result.fireYears !== null && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex-1">
                  <p className="text-xs text-emerald-600 font-medium mb-0.5">FIRE到達まで（現在の資産ゼロ想定）</p>
                  <p className="text-3xl font-bold text-emerald-700">
                    {result.fireYears < 1
                      ? `${Math.round(result.fireYears * 12)}ヶ月`
                      : `約${formatNum(result.fireYears, 1)}年`}
                  </p>
                </div>
                <div className="text-xs text-emerald-600 sm:text-right">
                  <p>年率{returnRate}%で運用</p>
                  <p>目標額 ¥{formatJPY(result.targetAsset)}</p>
                </div>
              </div>
            )}

            {/* Formula explanation */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-1.5 text-sm text-gray-600">
              <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">計算式</p>
              <p>貯蓄率 = (手取り − 支出) ÷ 手取り × 100</p>
              <p>FIRE目標資産 = 年間支出 × 25（4%ルール）</p>
              <p>FIRE年数 = ln(1 + 目標資産 × r ÷ 年間貯蓄) ÷ ln(1 + r)</p>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 px-5 py-6 text-center text-sm text-gray-400">
            {parseFloat(expense) >= parseFloat(income)
              ? "支出が手取りを超えています。値を見直してください。"
              : "有効な値を入力してください"}
          </div>
        )}
      </div>

      {/* FIRE reference table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">貯蓄率 × FIRE年数 早見表</h2>
        <p className="text-xs text-gray-400">年率5%運用・資産ゼロスタート想定</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs text-gray-500 font-medium pb-2 pr-4">貯蓄率</th>
                <th className="text-left text-xs text-gray-500 font-medium pb-2 pr-4">FIRE到達年数</th>
                <th className="text-left text-xs text-gray-500 font-medium pb-2">評価</th>
              </tr>
            </thead>
            <tbody>
              {FIRE_TABLE.map(({ rate, years }) => {
                const isCurrentRange =
                  result &&
                  result.savingsRate >= rate - 5 &&
                  result.savingsRate < rate + 5;
                return (
                  <tr
                    key={rate}
                    className={`border-b border-gray-100 ${isCurrentRange ? "bg-emerald-50" : ""}`}
                  >
                    <td className={`py-2 pr-4 font-medium ${isCurrentRange ? "text-emerald-700" : "text-gray-700"}`}>
                      {rate}%
                      {isCurrentRange && (
                        <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-600 rounded px-1 py-0.5">あなた</span>
                      )}
                    </td>
                    <td className={`py-2 pr-4 ${isCurrentRange ? "text-emerald-700 font-bold" : "text-gray-600"}`}>
                      {years}年
                    </td>
                    <td className="py-2 text-xs text-gray-400">
                      {years >= 40 ? "もう少し絞ろう" : years >= 25 ? "平均的" : years >= 15 ? "優秀" : "FIRE圏内"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
        広告スペース
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この貯蓄率 計算（FIRE向け）ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">手取り・支出から貯蓄率、FIRE到達年数を算出。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この貯蓄率 計算（FIRE向け）ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "手取り・支出から貯蓄率、FIRE到達年数を算出。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
