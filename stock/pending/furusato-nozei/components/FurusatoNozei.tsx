"use client";

import { useState, useMemo } from "react";

// Simplified income tax rate brackets (after basic deductions)
// Returns marginal income tax rate based on taxable income estimate
function getIncomeTaxRate(taxableIncome: number): number {
  if (taxableIncome <= 1_950_000) return 0.05;
  if (taxableIncome <= 3_300_000) return 0.10;
  if (taxableIncome <= 6_950_000) return 0.20;
  if (taxableIncome <= 9_000_000) return 0.23;
  if (taxableIncome <= 18_000_000) return 0.33;
  if (taxableIncome <= 40_000_000) return 0.40;
  return 0.45;
}

// Simplified employment income deduction (給与所得控除)
function getEmploymentDeduction(income: number): number {
  if (income <= 1_625_000) return 550_000;
  if (income <= 1_800_000) return income * 0.4 - 100_000;
  if (income <= 3_600_000) return income * 0.3 + 80_000;
  if (income <= 6_600_000) return income * 0.2 + 440_000;
  if (income <= 8_500_000) return income * 0.1 + 1_100_000;
  return 1_950_000;
}

// Social insurance deduction estimate (~14.97% of income, capped roughly)
function getSocialInsuranceDeduction(income: number): number {
  return Math.round(income * 0.1497);
}

// Basic deduction (基礎控除): 480,000 for most people
const BASIC_DEDUCTION = 480_000;

// Spouse deduction (配偶者控除): simplified 380,000
const SPOUSE_DEDUCTION = 380_000;

// Dependent deduction per child (扶養控除): 380,000 per child (16歳以上想定)
// For simplicity we use 380,000 per child
const DEPENDENT_DEDUCTION_PER_CHILD = 380_000;

interface Result {
  limitDonation: number;      // 上限寄付額
  taxDeduction: number;       // 税控除額（住民税+所得税）
  selfBurden: number;         // 実質自己負担（常に2,000円）
  residenceTaxBase: number;   // 住民税所得割額（計算基礎）
}

function calculate(
  income: number,
  hasSpouse: boolean,
  numChildren: number,
  mortgageDeduction: number,
): Result | null {
  if (!income || income <= 0) return null;

  // 1. Employment income deduction
  const employmentDeduction = getEmploymentDeduction(income);

  // 2. Social insurance deduction
  const socialInsurance = getSocialInsuranceDeduction(income);

  // 3. Total deductions for income tax
  const spouseDeduct = hasSpouse ? SPOUSE_DEDUCTION : 0;
  const dependentDeduct = numChildren * DEPENDENT_DEDUCTION_PER_CHILD;

  const totalDeductions =
    employmentDeduction +
    socialInsurance +
    BASIC_DEDUCTION +
    spouseDeduct +
    dependentDeduct;

  // 4. Taxable income (所得税の課税所得)
  const taxableIncome = Math.max(0, income - totalDeductions);

  // 5. Income tax rate
  const incomeTaxRate = getIncomeTaxRate(taxableIncome);

  // 6. Residence tax income base (住民税所得割) ≈ taxableIncome × 10%
  //    Residence tax uses slightly different deductions but we use same for simplicity
  const residenceTaxBase = Math.round(taxableIncome * 0.1);

  // 7. Upper limit formula:
  //    上限 = (住民税所得割 × 20%) / (100% - 10% - 所得税率×1.021) + 2000
  const denominator = 1 - 0.10 - incomeTaxRate * 1.021;
  if (denominator <= 0) return null;

  let limitDonation = Math.floor(
    (residenceTaxBase * 0.2) / denominator + 2_000
  );

  // 8. Subtract mortgage deduction effect on residence tax
  //    Housing loan deduction reduces residence tax, which lowers furusato limit
  if (mortgageDeduction > 0) {
    const mortgageEffect = Math.floor(
      (mortgageDeduction * 0.2) / denominator
    );
    limitDonation = Math.max(2_000, limitDonation - mortgageEffect);
  }

  const taxDeduction = limitDonation - 2_000;
  const selfBurden = 2_000;

  return { limitDonation, taxDeduction, selfBurden, residenceTaxBase };
}

function fmt(n: number): string {
  return n.toLocaleString("ja-JP");
}

export default function FurusatoNozei() {
  const [income, setIncome] = useState("");
  const [hasSpouse, setHasSpouse] = useState(false);
  const [numChildren, setNumChildren] = useState(0);
  const [mortgage, setMortgage] = useState("");

  const result = useMemo(() => {
    const inc = parseFloat(income) * 10_000; // 万円 → 円
    const mort = parseFloat(mortgage) * 10_000 || 0;
    return calculate(inc, hasSpouse, numChildren, mort);
  }, [income, hasSpouse, numChildren, mortgage]);

  const inputClass =
    "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-background pr-12";

  const selectClass =
    "w-full px-3 py-2.5 border border-border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-background";

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
        <h2 className="font-bold text-base mb-4">条件を入力</h2>

        {/* 年収 */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-1">
            年収（給与所得）
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="500"
              value={income}
              onChange={(e) =>
                setIncome(e.target.value.replace(/[^0-9]/g, ""))
              }
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
              万円
            </span>
          </div>
        </div>

        {/* 配偶者 */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-2">配偶者</label>
          <div className="flex gap-2">
            {[
              { value: false, label: "無" },
              { value: true, label: "有（控除対象）" },
            ].map(({ value, label }) => (
              <button
                key={label}
                onClick={() => setHasSpouse(value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  hasSpouse === value
                    ? "bg-accent text-white border-accent"
                    : "bg-background border-border text-muted hover:border-accent/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 扶養子供 */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-1">
            扶養子供の人数
          </label>
          <select
            value={numChildren}
            onChange={(e) => setNumChildren(Number(e.target.value))}
            className={selectClass}
          >
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "なし" : `${n}人`}
              </option>
            ))}
          </select>
        </div>

        {/* 住宅ローン控除 */}
        <div>
          <label className="block text-xs text-muted mb-1">
            住宅ローン控除額（任意）
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={mortgage}
              onChange={(e) =>
                setMortgage(e.target.value.replace(/[^0-9]/g, ""))
              }
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
              万円
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            住宅ローン控除がある場合、上限額が下がります
          </p>
        </div>
      </div>

      {/* Result card */}
      {result && (
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm space-y-3">
          {/* Main result */}
          <div className="bg-accent/10 rounded-xl p-4">
            <p className="text-xs text-muted mb-1">上限寄付額（目安）</p>
            <p className="text-4xl font-bold text-accent">
              {fmt(result.limitDonation)}
              <span className="text-xl ml-1 font-normal">円</span>
            </p>
          </div>

          {/* Detail rows */}
          <div className="divide-y divide-border">
            {[
              {
                label: "実質自己負担",
                value: `${fmt(result.selfBurden)} 円`,
                highlight: true,
              },
              {
                label: "控除される税額",
                value: `${fmt(result.taxDeduction)} 円`,
                highlight: false,
              },
              {
                label: "住民税所得割（計算基礎）",
                value: `${fmt(result.residenceTaxBase)} 円`,
                highlight: false,
              },
            ].map(({ label, value, highlight }) => (
              <div
                key={label}
                className="flex justify-between items-center py-2.5"
              >
                <span className="text-sm text-muted">{label}</span>
                <span
                  className={`text-sm font-medium ${
                    highlight ? "text-accent font-bold" : ""
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted">
            ※ 上記はあくまで概算です。正確な上限額は源泉徴収票や確定申告書でご確認ください。
          </p>
        </div>
      )}

      {/* ワンストップ vs 確定申告 */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
        <h3 className="font-bold text-sm mb-3">
          ワンストップ特例 vs 確定申告
        </h3>
        <div className="space-y-3">
          <div className="rounded-xl border border-border p-3">
            <p className="text-sm font-semibold mb-1">ワンストップ特例</p>
            <ul className="text-xs text-muted space-y-1 list-disc list-inside">
              <li>寄付先が5自治体以内の場合に利用可能</li>
              <li>確定申告不要（会社員向け）</li>
              <li>控除が全額、住民税から差し引かれる</li>
              <li>寄付のたびに申請書を自治体へ郵送が必要</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-sm font-semibold mb-1">確定申告</p>
            <ul className="text-xs text-muted space-y-1 list-disc list-inside">
              <li>寄付先の数に制限なし</li>
              <li>所得税から還付 + 翌年の住民税から控除</li>
              <li>医療費控除など他の控除と合わせて申告可能</li>
              <li>副業・複数収入がある方は確定申告が必要</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center h-20 text-xs text-muted">
        広告
      </div>
    </div>
  );
}
