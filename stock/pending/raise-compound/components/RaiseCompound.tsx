"use client";

import { useState, useMemo } from "react";

// --- 業界平均データ ---
type Industry = {
  id: string;
  name: string;
  rate: number;
  color: string;
  barColor: string;
};

const INDUSTRIES: Industry[] = [
  { id: "all", name: "全産業平均", rate: 2.0, color: "text-gray-700", barColor: "bg-gray-400" },
  { id: "it", name: "IT業界", rate: 3.5, color: "text-blue-700", barColor: "bg-blue-500" },
  { id: "manufacturing", name: "製造業", rate: 1.8, color: "text-orange-700", barColor: "bg-orange-400" },
];

// --- 比較シナリオ ---
const COMPARISON_RATES = [0, 1, 2, 3];

// 数値フォーマット
function fmtMan(n: number): string {
  return `${Math.round(n).toLocaleString("ja-JP")}万円`;
}

function fmtOku(n: number): string {
  if (n >= 10000) {
    const oku = n / 10000;
    return `${oku.toFixed(2)}億円`;
  }
  return fmtMan(n);
}

// 複利計算: 初年度年収から各年の年収テーブルを返す
function calcYearlyIncomes(baseMan: number, ratePercent: number, years: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < years; i++) {
    result.push(baseMan * Math.pow(1 + ratePercent / 100, i));
  }
  return result;
}

// 生涯年収合計
function calcLifetime(incomes: number[]): number {
  return incomes.reduce((a, b) => a + b, 0);
}

// スライダー + 数値入力の複合コンポーネント
function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-700"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v)) onChange(Math.min(Math.max(v, min), max));
            }}
            className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {unit && <span className="text-sm text-gray-500 whitespace-nowrap">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

export default function RaiseCompound() {
  const [baseIncome, setBaseIncome] = useState<number>(400);
  const [raiseRate, setRaiseRate] = useState<number>(2);
  const [workYears, setWorkYears] = useState<number>(30);
  const [showAllYears, setShowAllYears] = useState<boolean>(false);

  // ユーザー設定での年ごと年収
  const userIncomes = useMemo(
    () => calcYearlyIncomes(baseIncome, raiseRate, workYears),
    [baseIncome, raiseRate, workYears]
  );

  const userLifetime = useMemo(() => calcLifetime(userIncomes), [userIncomes]);

  // 最終年収
  const finalIncome = userIncomes[userIncomes.length - 1] ?? baseIncome;

  // 比較シナリオ
  const comparisons = useMemo(
    () =>
      COMPARISON_RATES.map((r) => {
        const incomes = calcYearlyIncomes(baseIncome, r, workYears);
        return { rate: r, lifetime: calcLifetime(incomes), finalIncome: incomes[incomes.length - 1] ?? baseIncome };
      }),
    [baseIncome, workYears]
  );

  // バーチャートの最大値（全シナリオ中）
  const maxIncome = useMemo(
    () => Math.max(...userIncomes, ...comparisons.map((c) => c.finalIncome)),
    [userIncomes, comparisons]
  );

  // 表示する年のリスト
  const displayYears = useMemo(() => {
    if (showAllYears) return userIncomes.map((v, i) => ({ year: i + 1, income: v }));
    // 5年刻み + 最終年
    const result: { year: number; income: number }[] = [];
    for (let i = 0; i < workYears; i++) {
      if ((i + 1) % 5 === 0 || i === 0 || i === workYears - 1) {
        result.push({ year: i + 1, income: userIncomes[i] });
      }
    }
    return result;
  }, [userIncomes, showAllYears, workYears]);

  return (
    <div className="space-y-6">
      {/* ===== 入力パラメーター ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">シミュレーション設定</h2>
        <div className="space-y-5">
          <NumberInput
            label="現在の年収"
            value={baseIncome}
            onChange={setBaseIncome}
            min={100}
            max={3000}
            step={10}
            unit="万円"
          />
          <NumberInput
            label="毎年の昇給率"
            value={raiseRate}
            onChange={setRaiseRate}
            min={0}
            max={15}
            step={0.1}
            unit="%"
          />
          <NumberInput
            label="勤続予定年数"
            value={workYears}
            onChange={setWorkYears}
            min={1}
            max={45}
            step={1}
            unit="年"
          />
        </div>
      </div>

      {/* ===== 計算結果サマリー ===== */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">シミュレーション結果</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-70 rounded-xl p-4 text-center shadow-sm">
            <div className="text-xs text-gray-500 mb-1">現在の年収</div>
            <div className="text-2xl font-bold text-gray-900">{fmtMan(baseIncome)}</div>
          </div>
          <div className="bg-white bg-opacity-70 rounded-xl p-4 text-center shadow-sm">
            <div className="text-xs text-gray-500 mb-1">{workYears}年後の年収</div>
            <div className="text-2xl font-bold text-emerald-700">{fmtMan(finalIncome)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {finalIncome > baseIncome
                ? `+${fmtMan(finalIncome - baseIncome)} (×${(finalIncome / baseIncome).toFixed(2)})`
                : "変化なし"}
            </div>
          </div>
          <div className="bg-white bg-opacity-70 rounded-xl p-4 text-center shadow-sm">
            <div className="text-xs text-gray-500 mb-1">生涯年収合計</div>
            <div className="text-2xl font-bold text-teal-700">{fmtOku(userLifetime)}</div>
            <div className="text-xs text-gray-500 mt-1">昇給率 {raiseRate}% / {workYears}年間</div>
          </div>
        </div>
      </div>

      {/* ===== 年ごとの年収バーチャート ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">年ごとの年収推移</h2>
          <button
            onClick={() => setShowAllYears((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {showAllYears ? "5年刻みで表示" : "全年表示"}
          </button>
        </div>

        <div className="space-y-2">
          {displayYears.map(({ year, income }) => {
            const pct = maxIncome > 0 ? (income / maxIncome) * 100 : 0;
            return (
              <div key={year} className="flex items-center gap-3">
                <div className="w-12 text-right text-xs text-gray-500 shrink-0">{year}年目</div>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  >
                    <span className="text-xs text-white font-medium whitespace-nowrap">
                      {fmtMan(income)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== 昇給率シナリオ比較 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">昇給率シナリオ比較</h2>
        <p className="text-xs text-gray-500 mb-4">
          現在年収 {fmtMan(baseIncome)} / {workYears}年間 での生涯年収比較
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">昇給率</th>
                <th className="text-right py-2 pr-4 text-xs text-gray-500 font-medium">{workYears}年後の年収</th>
                <th className="text-right py-2 text-xs text-gray-500 font-medium">生涯年収合計</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((c) => {
                const isUser = Math.abs(c.rate - raiseRate) < 0.05;
                return (
                  <tr key={c.rate} className={`border-b border-gray-50 ${isUser ? "bg-emerald-50" : ""}`}>
                    <td className="py-2.5 pr-4">
                      <span className={`font-semibold ${isUser ? "text-emerald-700" : "text-gray-700"}`}>
                        {c.rate}%
                        {isUser && <span className="ml-1.5 text-xs text-emerald-500">← 設定中</span>}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right text-gray-700">{fmtMan(c.finalIncome)}</td>
                    <td className="py-2.5 text-right font-semibold text-gray-900">{fmtOku(c.lifetime)}</td>
                  </tr>
                );
              })}
              {/* ユーザー設定が比較外の場合は追加行 */}
              {!COMPARISON_RATES.some((r) => Math.abs(r - raiseRate) < 0.05) && (
                <tr className="border-b border-emerald-100 bg-emerald-50">
                  <td className="py-2.5 pr-4">
                    <span className="font-semibold text-emerald-700">
                      {raiseRate}%
                      <span className="ml-1.5 text-xs text-emerald-500">← 設定中</span>
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right text-gray-700">{fmtMan(finalIncome)}</td>
                  <td className="py-2.5 text-right font-semibold text-gray-900">{fmtOku(userLifetime)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== 業界平均との比較 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">業界平均との比較</h2>
        <p className="text-xs text-gray-500 mb-4">
          現在年収 {fmtMan(baseIncome)} / {workYears}年間 での生涯年収差
        </p>

        <div className="space-y-4">
          {INDUSTRIES.map((ind) => {
            const indIncomes = calcYearlyIncomes(baseIncome, ind.rate, workYears);
            const indLifetime = calcLifetime(indIncomes);
            const diff = userLifetime - indLifetime;
            const indFinal = indIncomes[indIncomes.length - 1] ?? baseIncome;
            return (
              <div key={ind.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className={`font-semibold text-sm ${ind.color}`}>{ind.name}</span>
                    <span className="text-xs text-gray-400 ml-2">昇給率 {ind.rate}%</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{workYears}年後</div>
                    <div className={`text-sm font-medium ${ind.color}`}>{fmtMan(indFinal)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${ind.barColor} rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min((indLifetime / Math.max(userLifetime, indLifetime)) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-700 shrink-0 w-28 text-right">
                    {fmtOku(indLifetime)}
                  </div>
                </div>
                <div className="mt-1.5 text-xs text-right">
                  {diff > 0 ? (
                    <span className="text-emerald-600">あなたの方が +{fmtOku(Math.abs(diff))}</span>
                  ) : diff < 0 ? (
                    <span className="text-red-500">業界平均より -{fmtOku(Math.abs(diff))}</span>
                  ) : (
                    <span className="text-gray-400">同じ</span>
                  )}
                </div>
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この昇給率 複利計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">毎年%昇給を続けた時の生涯年収、業界平均比較。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この昇給率 複利計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "毎年%昇給を続けた時の生涯年収、業界平均比較。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
            );
          })}
        </div>
      </div>

      {/* ===== 広告プレースホルダー ===== */}
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-6 text-center text-gray-400 text-sm">
        広告スペース
      </div>

      {/* ===== フッター注記 ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        計算は毎年一定の昇給率を前提とした複利計算です。実際の昇給は業績・景気・個人評価により変動します。
      </p>
    </div>
  );
}
