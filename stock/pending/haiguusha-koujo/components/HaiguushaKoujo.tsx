"use client";

import { useState, useMemo } from "react";

// 給与所得控除額の計算
function getEmploymentDeduction(income: number): number {
  if (income <= 1_625_000) return 550_000;
  if (income <= 1_800_000) return income * 0.4 - 100_000;
  if (income <= 3_600_000) return income * 0.3 + 80_000;
  if (income <= 6_600_000) return income * 0.2 + 440_000;
  if (income <= 8_500_000) return income * 0.1 + 1_100_000;
  return 1_950_000;
}

// 配偶者の合計所得金額
function getSpouseIncome(spouseAnnual: number): number {
  if (spouseAnnual <= 0) return 0;
  return Math.max(0, spouseAnnual - getEmploymentDeduction(spouseAnnual));
}

// 配偶者控除額（本人所得900万以下の場合）
// 配偶者所得 48万以下（年収103万以下）
function getSpouseDeduction(spouseIncome: number): number {
  if (spouseIncome <= 480_000) return 380_000;
  return 0;
}

// 配偶者特別控除額テーブル（本人所得900万以下の場合）
// 配偶者所得 48万超〜133万以下
function getSpouseSpecialDeduction(spouseIncome: number): number {
  if (spouseIncome <= 480_000) return 0; // 配偶者控除の対象
  if (spouseIncome <= 950_000) return 380_000;
  if (spouseIncome <= 1_000_000) return 360_000;
  if (spouseIncome <= 1_050_000) return 310_000;
  if (spouseIncome <= 1_100_000) return 260_000;
  if (spouseIncome <= 1_150_000) return 210_000;
  if (spouseIncome <= 1_200_000) return 160_000;
  if (spouseIncome <= 1_250_000) return 110_000;
  if (spouseIncome <= 1_300_000) return 60_000;
  if (spouseIncome <= 1_330_000) return 30_000;
  return 0; // 133万超は対象外
}

// 本人所得制限による控除額の逓減係数
// 900万以下 → 1.0、950万以下 → 2/3、1000万以下 → 1/3、1000万超 → 0
function getOwnerIncomeMultiplier(ownerIncome: number): number {
  if (ownerIncome <= 9_000_000) return 1;
  if (ownerIncome <= 9_500_000) return 2 / 3;
  if (ownerIncome <= 10_000_000) return 1 / 3;
  return 0;
}

// 所得税率（概算・速算表）
function getIncomeTaxRate(taxableIncome: number): number {
  if (taxableIncome <= 1_950_000) return 0.05;
  if (taxableIncome <= 3_300_000) return 0.10;
  if (taxableIncome <= 6_950_000) return 0.20;
  if (taxableIncome <= 9_000_000) return 0.23;
  if (taxableIncome <= 18_000_000) return 0.33;
  if (taxableIncome <= 40_000_000) return 0.40;
  return 0.45;
}

// 社会保険料控除（概算）
function getSocialInsuranceDeduction(income: number): number {
  return Math.round(income * 0.1497);
}

const BASIC_DEDUCTION = 480_000;

type DeductionType = "spouse" | "special" | "none_owner_limit" | "none_spouse_over";

interface Result {
  spouseAnnualIncome: number;
  spouseIncome: number;        // 配偶者の合計所得
  ownerIncome: number;         // 本人の合計所得
  type: DeductionType;
  baseDeduction: number;       // 逓減前の控除額
  finalDeduction: number;      // 逓減後の実際の控除額
  taxSaving: number;           // 節税効果概算（所得税＋住民税）
  ownerIncomeMultiplier: number;
}

function calculate(ownerAnnual: number, spouseAnnual: number): Result | null {
  if (ownerAnnual <= 0 || spouseAnnual < 0) return null;

  const ownerDeduction = getEmploymentDeduction(ownerAnnual);
  const socialInsurance = getSocialInsuranceDeduction(ownerAnnual);
  const ownerIncome = Math.max(0, ownerAnnual - ownerDeduction);
  const spouseIncome = getSpouseIncome(spouseAnnual);

  const multiplier = getOwnerIncomeMultiplier(ownerIncome);

  let type: DeductionType;
  let baseDeduction: number;

  if (multiplier === 0) {
    type = "none_owner_limit";
    baseDeduction = 0;
  } else if (spouseIncome <= 480_000) {
    type = "spouse";
    baseDeduction = getSpouseDeduction(spouseIncome);
  } else if (spouseIncome <= 1_330_000) {
    type = "special";
    baseDeduction = getSpouseSpecialDeduction(spouseIncome);
  } else {
    type = "none_spouse_over";
    baseDeduction = 0;
  }

  // 逓減適用（控除額は1万円単位で切り捨て）
  const finalDeduction = Math.floor((baseDeduction * multiplier) / 10_000) * 10_000;

  // 節税効果概算：所得税 + 住民税(10%)
  const taxableIncome = Math.max(
    0,
    ownerIncome - socialInsurance - BASIC_DEDUCTION
  );
  const incomeTaxRate = getIncomeTaxRate(taxableIncome);
  const taxSaving = Math.round(finalDeduction * (incomeTaxRate + 0.10));

  return {
    spouseAnnualIncome: spouseAnnual,
    spouseIncome,
    ownerIncome,
    type,
    baseDeduction,
    finalDeduction,
    taxSaving,
    ownerIncomeMultiplier: multiplier,
  };
}

function fmt(n: number): string {
  return n.toLocaleString("ja-JP");
}

function fmtMan(n: number): string {
  return Math.round(n / 10_000).toLocaleString("ja-JP");
}

// 壁の位置を年収ベースで定義
const WALLS = [
  { income: 1_030_000, label: "103万の壁", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  { income: 1_500_000, label: "150万の壁", color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  { income: 2_010_000, label: "201万の壁", color: "text-red-600", bg: "bg-red-50 border-red-200" },
];

export default function HaiguushaKoujo() {
  const [ownerIncome, setOwnerIncome] = useState("");
  const [spouseIncome, setSpouseIncome] = useState("");

  const result = useMemo(() => {
    const owner = parseFloat(ownerIncome) * 10_000;
    const spouse = parseFloat(spouseIncome) * 10_000;
    if (isNaN(owner) || isNaN(spouse)) return null;
    return calculate(owner, spouse);
  }, [ownerIncome, spouseIncome]);

  const spouseAnnual = parseFloat(spouseIncome) * 10_000 || 0;

  const inputClass =
    "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-background pr-12";

  const typeLabel: Record<DeductionType, { label: string; color: string; bg: string }> = {
    spouse: { label: "配偶者控除 適用", color: "text-green-700", bg: "bg-green-50 border-green-200" },
    special: { label: "配偶者特別控除 適用", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    none_owner_limit: { label: "対象外（本人所得1,000万超）", color: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
    none_spouse_over: { label: "対象外（配偶者所得133万超）", color: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
  };

  return (
    <div className="space-y-4">
      {/* 入力カード */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
        <h2 className="font-bold text-base mb-4">年収を入力</h2>

        <div className="mb-4">
          <label className="block text-xs text-muted mb-1">本人の年収（給与所得）</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="600"
              value={ownerIncome}
              onChange={(e) => setOwnerIncome(e.target.value.replace(/[^0-9]/g, ""))}
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">万円</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">配偶者の年収（給与所得）</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="100"
              value={spouseIncome}
              onChange={(e) => setSpouseIncome(e.target.value.replace(/[^0-9]/g, ""))}
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">万円</span>
          </div>
        </div>
      </div>

      {/* 壁の図解 */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
        <h3 className="font-bold text-sm mb-3">配偶者の年収と控除の関係</h3>
        <div className="relative h-10 bg-gray-100 rounded-full overflow-hidden mb-3">
          {/* グラデーションバー */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-400" />
          {/* 配偶者年収の位置インジケーター */}
          {spouseAnnual > 0 && spouseAnnual <= 2_500_000 && (
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-md rounded-full transition-all"
              style={{ left: `${Math.min(98, (spouseAnnual / 2_500_000) * 100)}%` }}
            />
          )}
        </div>
        <div className="flex justify-between text-xs text-muted mb-3 px-1">
          <span>0万</span>
          <span>103万</span>
          <span>150万</span>
          <span>201万</span>
          <span>250万+</span>
        </div>
        {/* 壁の説明 */}
        <div className="space-y-2">
          {WALLS.map((wall) => (
            <div
              key={wall.label}
              className={`flex items-start gap-2 rounded-lg border p-2.5 ${
                spouseAnnual > 0 && spouseAnnual <= wall.income
                  ? wall.bg
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <span className={`text-xs font-bold whitespace-nowrap ${wall.color}`}>
                {wall.label}
              </span>
              <span className="text-xs text-muted leading-tight">
                {wall.income === 1_030_000 &&
                  "配偶者の所得が48万以下（年収103万以下）→ 配偶者控除38万が満額適用"}
                {wall.income === 1_500_000 &&
                  "103万〜150万の範囲では配偶者特別控除38万が満額。150万を超えると段階的に減少"}
                {wall.income === 2_010_000 &&
                  "201万（所得133万）を超えると控除がゼロに。この手前が特別控除の上限"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 結果カード */}
      {result && (
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm space-y-3">
          {/* 判定バッジ */}
          <div className={`rounded-xl border p-3 ${typeLabel[result.type].bg}`}>
            <p className={`text-sm font-bold ${typeLabel[result.type].color}`}>
              {typeLabel[result.type].label}
            </p>
            {result.ownerIncomeMultiplier < 1 && result.ownerIncomeMultiplier > 0 && (
              <p className="text-xs text-muted mt-0.5">
                本人所得が900万超のため控除額が逓減されています
              </p>
            )}
          </div>

          {/* メイン数値 */}
          <div className="bg-accent/10 rounded-xl p-4">
            <p className="text-xs text-muted mb-1">控除額（所得控除）</p>
            <p className="text-4xl font-bold text-accent">
              {fmt(result.finalDeduction)}
              <span className="text-xl ml-1 font-normal">円</span>
            </p>
            {result.baseDeduction !== result.finalDeduction && (
              <p className="text-xs text-muted mt-1">
                本来の控除額 {fmt(result.baseDeduction)}円 →逓減後 {fmt(result.finalDeduction)}円
              </p>
            )}
          </div>

          {/* 詳細行 */}
          <div className="divide-y divide-border">
            {[
              {
                label: "配偶者の合計所得",
                value: `${fmtMan(result.spouseIncome)}万円（年収${fmtMan(result.spouseAnnualIncome)}万円）`,
              },
              {
                label: "本人の合計所得（概算）",
                value: `${fmtMan(result.ownerIncome)}万円`,
              },
              {
                label: "節税効果の概算",
                value: `約${fmt(result.taxSaving)}円／年`,
                highlight: true,
              },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex justify-between items-center py-2.5 gap-2">
                <span className="text-sm text-muted shrink-0">{label}</span>
                <span className={`text-sm font-medium text-right ${highlight ? "text-accent font-bold" : ""}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted">
            ※ 節税効果は所得税率（概算）と住民税10%の合計で計算しています。社会保険料・他の控除は考慮していません。
          </p>
        </div>
      )}

      {/* 控除額の段階表 */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
        <h3 className="font-bold text-sm mb-3">配偶者特別控除の段階（本人所得900万以下）</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 text-muted font-medium">配偶者の年収</th>
                <th className="text-left py-1.5 text-muted font-medium">控除区分</th>
                <th className="text-right py-1.5 text-muted font-medium">控除額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {[
                { range: "〜103万円", type: "配偶者控除", amount: 380_000 },
                { range: "103万〜150万円", type: "配偶者特別控除", amount: 380_000 },
                { range: "150万〜155万円", type: "配偶者特別控除", amount: 360_000 },
                { range: "155万〜160万円", type: "配偶者特別控除", amount: 310_000 },
                { range: "160万〜167万円", type: "配偶者特別控除", amount: 260_000 },
                { range: "167万〜175万円", type: "配偶者特別控除", amount: 210_000 },
                { range: "175万〜183万円", type: "配偶者特別控除", amount: 160_000 },
                { range: "183万〜190万円", type: "配偶者特別控除", amount: 110_000 },
                { range: "190万〜197万円", type: "配偶者特別控除", amount: 60_000 },
                { range: "197万〜201万円", type: "配偶者特別控除", amount: 30_000 },
                { range: "201万円〜", type: "対象外", amount: 0 },
              ].map((row) => {
                const isCurrentRow =
                  result &&
                  (() => {
                    const sa = result.spouseAnnualIncome;
                    if (row.range === "〜103万円") return sa <= 1_030_000;
                    if (row.range === "103万〜150万円") return sa > 1_030_000 && sa <= 1_500_000;
                    if (row.range === "150万〜155万円") return sa > 1_500_000 && sa <= 1_550_000;
                    if (row.range === "155万〜160万円") return sa > 1_550_000 && sa <= 1_600_000;
                    if (row.range === "160万〜167万円") return sa > 1_600_000 && sa <= 1_670_000;
                    if (row.range === "167万〜175万円") return sa > 1_670_000 && sa <= 1_750_000;
                    if (row.range === "175万〜183万円") return sa > 1_750_000 && sa <= 1_830_000;
                    if (row.range === "183万〜190万円") return sa > 1_830_000 && sa <= 1_900_000;
                    if (row.range === "190万〜197万円") return sa > 1_900_000 && sa <= 1_970_000;
                    if (row.range === "197万〜201万円") return sa > 1_970_000 && sa <= 2_010_000;
                    if (row.range === "201万円〜") return sa > 2_010_000;
                    return false;
                  })();
                return (
                  <tr
                    key={row.range}
                    className={isCurrentRow ? "bg-accent/10 font-semibold" : ""}
                  >
                    <td className="py-1.5">{row.range}</td>
                    <td className="py-1.5 text-muted">{row.type}</td>
                    <td className="py-1.5 text-right">
                      {row.amount > 0 ? `${fmtMan(row.amount)}万円` : "−"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-2">
          ※ 本人の合計所得が900万超の場合は上記の2/3または1/3に逓減されます（1,000万超は適用なし）。
        </p>
      </div>

      {/* 広告プレースホルダー */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center h-20 text-xs text-muted">
        広告
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この配偶者控除・配偶者特別控除判定ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">夫婦の年収から適用可否・控除額を判定（150万の壁・103万の壁）。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この配偶者控除・配偶者特別控除判定ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "夫婦の年収から適用可否・控除額を判定（150万の壁・103万の壁）。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "配偶者控除・配偶者特別控除判定",
  "description": "夫婦の年収から適用可否・控除額を判定（150万の壁・103万の壁）",
  "url": "https://tools.loresync.dev/haiguusha-koujo",
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
