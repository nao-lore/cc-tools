"use client";

import { useState, useMemo } from "react";

// --- 職業別掛金上限 ---
type Occupation = "company-with-corp" | "company-no-corp" | "civil-servant" | "self-employed" | "homemaker";

const OCCUPATION_LIST: { value: Occupation; label: string; limit: number; note: string }[] = [
  {
    value: "company-with-corp",
    label: "会社員（企業年金あり）",
    limit: 12000,
    note: "DB・DCなど企業年金制度がある場合",
  },
  {
    value: "company-no-corp",
    label: "会社員（企業年金なし）",
    limit: 23000,
    note: "企業年金制度がない会社員・専業主婦の夫など",
  },
  {
    value: "civil-servant",
    label: "公務員",
    limit: 12000,
    note: "共済年金加入者（2022年10月〜加入可能）",
  },
  {
    value: "self-employed",
    label: "自営業・フリーランス",
    limit: 68000,
    note: "国民年金第1号被保険者（国民年金基金との合算上限）",
  },
  {
    value: "homemaker",
    label: "専業主婦（夫）",
    limit: 23000,
    note: "国民年金第3号被保険者",
  },
];

// --- 所得税率テーブル（課税所得ベース） ---
// 所得税率 × (1 + 0.021) = 実効税率（復興特別所得税込み）
const INCOME_TAX_BRACKETS: { min: number; max: number; rate: number; deduction: number }[] = [
  { min: 0, max: 1_950_000, rate: 0.05, deduction: 0 },
  { min: 1_950_000, max: 3_300_000, rate: 0.10, deduction: 97_500 },
  { min: 3_300_000, max: 6_950_000, rate: 0.20, deduction: 427_500 },
  { min: 6_950_000, max: 9_000_000, rate: 0.23, deduction: 636_000 },
  { min: 9_000_000, max: 18_000_000, rate: 0.33, deduction: 1_536_000 },
  { min: 18_000_000, max: 40_000_000, rate: 0.40, deduction: 2_796_000 },
  { min: 40_000_000, max: Infinity, rate: 0.45, deduction: 4_796_000 },
];

// 住民税率は一律10%
const RESIDENT_TAX_RATE = 0.10;

// 給与所得控除（年収→給与所得）
function calcEmploymentIncome(annualIncome: number): number {
  if (annualIncome <= 550_999) return 0;
  if (annualIncome <= 1_618_999) return annualIncome - 550_000;
  if (annualIncome <= 1_619_999) return 1_069_000;
  if (annualIncome <= 1_621_999) return 1_070_000;
  if (annualIncome <= 1_623_999) return 1_072_000;
  if (annualIncome <= 1_627_999) return 1_074_000;
  if (annualIncome <= 1_799_999) {
    return Math.floor(annualIncome / 4000) * 4000 * 0.4 - 100_000;
  }
  if (annualIncome <= 3_599_999) {
    return Math.floor(annualIncome / 4000) * 4000 * 0.3 + 80_000;
  }
  if (annualIncome <= 6_599_999) {
    return Math.floor(annualIncome / 4000) * 4000 * 0.2 + 440_000;
  }
  if (annualIncome <= 8_499_999) {
    return Math.floor(annualIncome / 4000) * 4000 * 0.1 + 1_100_000;
  }
  return annualIncome - 1_950_000 > 1_950_000
    ? annualIncome - 1_950_000
    : 1_950_000;
}

// 給与所得控除額を返す
function calcEmploymentDeduction(annualIncome: number): number {
  if (annualIncome <= 1_625_000) return 550_000;
  if (annualIncome <= 1_800_000) return Math.floor(annualIncome * 0.4) - 100_000;
  if (annualIncome <= 3_600_000) return Math.floor(annualIncome * 0.3) + 80_000;
  if (annualIncome <= 6_600_000) return Math.floor(annualIncome * 0.2) + 440_000;
  if (annualIncome <= 8_500_000) return Math.floor(annualIncome * 0.1) + 1_100_000;
  return 1_950_000;
}

// 所得税率の取得（課税所得から）
function getIncomeTaxRate(taxableIncome: number): number {
  const bracket = INCOME_TAX_BRACKETS.find(
    (b) => taxableIncome >= b.min && taxableIncome < b.max
  );
  return bracket ? bracket.rate : 0.45;
}

// 課税所得の概算（基礎控除48万円のみ考慮）
function calcApproxTaxableIncome(
  annualIncome: number,
  isSelfEmployed: boolean,
  monthlyContribution: number
): number {
  const BASIC_DEDUCTION = 480_000;
  let income: number;
  if (isSelfEmployed) {
    // 自営業: 年収=事業所得（控除なし）として概算
    income = annualIncome;
  } else {
    income = calcEmploymentIncome(annualIncome);
  }
  // iDeCo掛金は小規模企業共済等掛金控除として全額控除
  const taxable = income - BASIC_DEDUCTION - monthlyContribution * 12;
  return Math.max(0, taxable);
}

// 年間節税額を計算
function calcTaxSaving(
  annualIncome: number,
  isSelfEmployed: boolean,
  monthlyContribution: number
): {
  taxableIncomeWith: number;
  taxableIncomeWithout: number;
  incomeTaxRate: number;
  incomeTaxSaving: number;
  residentTaxSaving: number;
  totalSaving: number;
  annualContribution: number;
} {
  const annualContribution = monthlyContribution * 12;
  const taxableWithout = calcApproxTaxableIncome(annualIncome, isSelfEmployed, 0);
  const taxableWith = calcApproxTaxableIncome(annualIncome, isSelfEmployed, monthlyContribution);

  const rate = getIncomeTaxRate(taxableWithout);
  // 復興特別所得税込み
  const effectiveRate = rate * 1.021;

  const incomeTaxSaving = Math.floor(annualContribution * effectiveRate);
  const residentTaxSaving = Math.floor(annualContribution * RESIDENT_TAX_RATE);
  const totalSaving = incomeTaxSaving + residentTaxSaving;

  return {
    taxableIncomeWith: taxableWith,
    taxableIncomeWithout: taxableWithout,
    incomeTaxRate: rate,
    incomeTaxSaving,
    residentTaxSaving,
    totalSaving,
    annualContribution,
  };
}

// 運用シミュレーション（複利）
function calcAssetAtAge(
  currentAge: number,
  monthlyContribution: number,
  annualReturn: number // 小数 例: 0.04
): { totalAsset: number; totalContribution: number; investmentReturn: number } {
  const retireAge = 60;
  const years = Math.max(0, retireAge - currentAge);
  const monthlyRate = annualReturn / 12;
  const months = years * 12;

  let totalAsset = 0;
  if (monthlyRate === 0) {
    totalAsset = monthlyContribution * months;
  } else {
    totalAsset = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  }

  const totalContribution = monthlyContribution * months;
  const investmentReturn = totalAsset - totalContribution;

  return {
    totalAsset: Math.floor(totalAsset),
    totalContribution: Math.floor(totalContribution),
    investmentReturn: Math.floor(investmentReturn),
  };
}

// 退職所得控除
function calcRetirementDeduction(years: number): number {
  if (years <= 20) return years * 400_000;
  return 8_000_000 + (years - 20) * 700_000;
}

// フォーマット
function fmtJPY(n: number): string {
  if (n === 0) return "0円";
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function fmtMan(n: number): string {
  const man = Math.round(n / 10000);
  return `約${man.toLocaleString("ja-JP")}万円`;
}

function parseAmount(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  return parseInt(cleaned, 10);
}

// --- コンポーネント ---
export default function IdecoTaxSaving() {
  const [occupation, setOccupation] = useState<Occupation>("company-no-corp");
  const [incomeInput, setIncomeInput] = useState<string>("");
  const [contribInput, setContribInput] = useState<string>("");
  const [age, setAge] = useState<number>(35);
  const [returnRate, setReturnRate] = useState<number>(4);

  const occupationInfo = OCCUPATION_LIST.find((o) => o.value === occupation)!;
  const limitMonthly = occupationInfo.limit;
  const isSelfEmployed = occupation === "self-employed";

  const annualIncome = parseAmount(incomeInput);
  const monthlyContrib = parseAmount(contribInput);

  // 掛金を上限内にクランプ
  const clampedContrib = Math.min(monthlyContrib, limitMonthly);

  const result = useMemo(() => {
    if (!annualIncome || !clampedContrib) return null;
    return calcTaxSaving(annualIncome, isSelfEmployed, clampedContrib);
  }, [annualIncome, clampedContrib, isSelfEmployed]);

  const assetResult = useMemo(() => {
    if (!clampedContrib || age >= 60) return null;
    return calcAssetAtAge(age, clampedContrib, returnRate / 100);
  }, [clampedContrib, age, returnRate]);

  const retirementYears = Math.max(0, 60 - age);
  const retirementDeduction = calcRetirementDeduction(retirementYears);

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "").replace(/[^\d]/g, "");
    setIncomeInput(raw ? parseInt(raw, 10).toLocaleString("ja-JP") : "");
  };

  const handleContribChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "").replace(/[^\d]/g, "");
    const num = raw ? parseInt(raw, 10) : 0;
    setContribInput(num ? num.toLocaleString("ja-JP") : "");
  };

  const exceededLimit = monthlyContrib > limitMonthly;

  return (
    <div className="space-y-6">
      {/* ===== 入力 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">条件を入力</h2>

        <div className="space-y-5">
          {/* 職業 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">職業</label>
            <div className="space-y-2">
              {OCCUPATION_LIST.map((occ) => (
                <label key={occ.value} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="occupation"
                    checked={occupation === occ.value}
                    onChange={() => setOccupation(occ.value)}
                    className="mt-0.5 accent-teal-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-800">{occ.label}</span>
                      <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-medium">
                        上限 {occ.limit.toLocaleString()}円/月
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{occ.note}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 年収 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              年収（額面）
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={incomeInput}
                onChange={handleIncomeChange}
                placeholder="5,000,000"
                className="flex-1 px-4 py-3 text-right text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
              />
              <span className="text-gray-600 font-medium text-lg">円</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isSelfEmployed ? "事業収入（青色申告特別控除前）を入力してください" : "源泉徴収票の「支払金額」を入力してください"}
            </p>
          </div>

          {/* 月額掛金 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              月額掛金
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={contribInput}
                onChange={handleContribChange}
                placeholder={limitMonthly.toLocaleString()}
                className={`flex-1 px-4 py-3 text-right text-xl font-semibold border rounded-xl focus:outline-none focus:ring-2 ${
                  exceededLimit
                    ? "border-red-400 focus:ring-red-300 focus:border-red-400"
                    : "border-gray-300 focus:ring-teal-400 focus:border-teal-400"
                }`}
              />
              <span className="text-gray-600 font-medium text-lg">円</span>
            </div>
            {exceededLimit && (
              <p className="text-xs text-red-600 mt-1">
                上限 {limitMonthly.toLocaleString()}円/月を超えています。上限額で計算します。
              </p>
            )}
            {/* クイック選択 */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {[5000, 10000, 15000, 20000, limitMonthly].filter((v, i, arr) => arr.indexOf(v) === i && v <= limitMonthly).map((v) => (
                <button
                  key={v}
                  onClick={() => setContribInput(v.toLocaleString())}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    clampedContrib === v
                      ? "bg-teal-50 text-teal-700 border-teal-300"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {v === limitMonthly ? `上限 ${v.toLocaleString()}` : v.toLocaleString()}円
                </button>
              ))}
            </div>
          </div>

          {/* 現在の年齢 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              現在の年齢：<span className="text-teal-700 font-bold">{age}歳</span>
            </label>
            <input
              type="range"
              min={20}
              max={59}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full accent-teal-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>20歳</span>
              <span>59歳</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 節税額結果 ===== */}
      {result && (
        <>
          <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-2xl shadow-lg p-6 text-white">
            <h2 className="text-base font-semibold opacity-90 mb-5">年間節税額</h2>

            <div className="space-y-3">
              {/* 合計節税額 */}
              <div className="bg-white rounded-xl p-4 text-teal-900">
                <div className="text-xs text-teal-700 mb-1">年間節税額（合計）</div>
                <div className="text-4xl font-bold text-teal-700">{fmtJPY(result.totalSaving)}</div>
                <div className="text-xs text-teal-600 mt-1">
                  月換算 約{fmtJPY(Math.floor(result.totalSaving / 12))}の節税
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* 所得税節税 */}
                <div className="bg-white bg-opacity-15 rounded-xl p-4">
                  <div className="text-xs opacity-75 mb-1">所得税の節税</div>
                  <div className="text-2xl font-bold">{fmtJPY(result.incomeTaxSaving)}</div>
                  <div className="text-xs opacity-60 mt-1">
                    税率 {Math.round(result.incomeTaxRate * 100)}%
                    <span className="ml-1 opacity-80">（復興税込）</span>
                  </div>
                </div>

                {/* 住民税節税 */}
                <div className="bg-white bg-opacity-15 rounded-xl p-4">
                  <div className="text-xs opacity-75 mb-1">住民税の節税</div>
                  <div className="text-2xl font-bold">{fmtJPY(result.residentTaxSaving)}</div>
                  <div className="text-xs opacity-60 mt-1">税率 10%（一律）</div>
                </div>
              </div>

              {/* 30年累計 */}
              <div className="bg-white bg-opacity-10 rounded-xl p-4">
                <div className="text-xs opacity-75 mb-1">
                  {retirementYears}年間の累計節税額（{age}歳→60歳）
                </div>
                <div className="text-2xl font-bold">
                  {retirementYears > 0 ? fmtMan(result.totalSaving * retirementYears) : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* 計算根拠 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-3">計算根拠</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>年間掛金</span>
                <span className="font-medium text-gray-900">{fmtJPY(result.annualContribution)}</span>
              </div>
              <div className="flex justify-between">
                <span>適用所得税率（課税所得 {fmtMan(result.taxableIncomeWithout)} ベース）</span>
                <span className="font-medium text-gray-900">{Math.round(result.incomeTaxRate * 100)}%</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>所得税節税 = 掛金 × {Math.round(result.incomeTaxRate * 1.021 * 1000) / 10}%（復興特別所得税込）</span>
                <span>{fmtJPY(result.incomeTaxSaving)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>住民税節税 = 掛金 × 10%</span>
                <span>{fmtJPY(result.residentTaxSaving)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-medium">
                <span>年間節税額合計</span>
                <span className="text-teal-700">{fmtJPY(result.totalSaving)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              ※ 基礎控除（48万円）のみ考慮した概算。社会保険料控除・配偶者控除等は含みません。
            </p>
          </div>
        </>
      )}

      {/* ===== 運用シミュレーション ===== */}
      {clampedContrib > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">運用シミュレーション</h2>
          <p className="text-xs text-gray-500 mb-4">
            {age}歳から60歳まで（{retirementYears}年間）積み立てた場合の試算
          </p>

          {/* 利回り選択 */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              想定利回り：<span className="text-teal-700 font-bold">{returnRate}%</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7].map((r) => (
                <button
                  key={r}
                  onClick={() => setReturnRate(r)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    returnRate === r
                      ? "bg-teal-50 text-teal-700 border-teal-300"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          {assetResult && retirementYears > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-teal-50 rounded-xl p-4 text-center">
                  <div className="text-xs text-teal-700 mb-1">60歳時の資産額</div>
                  <div className="text-xl font-bold text-teal-800">{fmtMan(assetResult.totalAsset)}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-xs text-gray-600 mb-1">元本（掛金合計）</div>
                  <div className="text-xl font-bold text-gray-800">{fmtMan(assetResult.totalContribution)}</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <div className="text-xs text-emerald-700 mb-1">運用益（非課税）</div>
                  <div className="text-xl font-bold text-emerald-800">{fmtMan(assetResult.investmentReturn)}</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 mb-3">
                <div className="text-xs font-medium text-emerald-800 mb-1">運用益非課税メリット</div>
                <p className="text-xs text-emerald-700">
                  通常の投資では運用益に約20%の税金がかかりますが、iDeCoは運用益が非課税。
                  運用益 {fmtMan(assetResult.investmentReturn)} に対する節税効果は
                  <span className="font-bold"> {fmtMan(assetResult.investmentReturn * 0.2)}</span> 相当です。
                </p>
              </div>

              {/* 受取時の退職所得控除 */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-xs font-medium text-blue-800 mb-1">受取時の税優遇（一時金受取の場合）</div>
                <p className="text-xs text-blue-700">
                  iDeCoを一時金で受け取る際は退職所得控除が適用されます。
                  加入 {retirementYears} 年の場合、控除額は
                  <span className="font-bold"> {fmtMan(retirementDeduction)}</span>。
                  この金額以内の受取額は課税所得がゼロになります。
                </p>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500 text-center py-4">
              年齢が60歳以上の場合はシミュレーションできません
            </div>
          )}
        </div>
      )}

      {/* ===== iDeCo のメリット解説 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">iDeCo の3つの税優遇</h2>
        <div className="space-y-3">
          {[
            {
              step: "1",
              title: "掛金が全額所得控除",
              body: "毎月の掛金が小規模企業共済等掛金控除として全額控除され、所得税・住民税が軽減されます。",
              color: "teal",
            },
            {
              step: "2",
              title: "運用益が非課税",
              body: "通常の投資信託では運用益に約20.315%の税金がかかりますが、iDeCo口座内では非課税で再投資されます。",
              color: "emerald",
            },
            {
              step: "3",
              title: "受取時に税優遇",
              body: "一時金受取→退職所得控除、年金受取→公的年金等控除が適用され、受取時の税負担も軽減されます。",
              color: "green",
            },
          ].map((item) => (
            <div key={item.step} className={`flex gap-4 p-4 bg-${item.color}-50 rounded-xl`}>
              <div className={`w-7 h-7 rounded-full bg-${item.color}-600 text-white text-sm font-bold flex items-center justify-center shrink-0`}>
                {item.step}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">{item.title}</div>
                <div className="text-xs text-gray-600">{item.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 免責・参考リンク ===== */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
        <p className="text-xs text-gray-500 mb-2">
          本ツールは概算計算を目的としており、基礎控除のみ考慮した簡易計算です。
          社会保険料控除・配偶者控除・医療費控除等によって実際の節税額は異なります。
          正確な試算は税理士・ファイナンシャルプランナーにご相談ください。
        </p>
        <a
          href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/nenkin/nenkin/kyoshutsu/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-teal-600 hover:text-teal-700 underline"
        >
          厚生労働省「iDeCo（個人型確定拠出年金）」公式サイトを確認する
        </a>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このiDeCo 節税額シミュレーターツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">iDeCoの掛金から所得税+住民税の節税効果を計算。年齢・職業別の掛金上限対応。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このiDeCo 節税額シミュレーターツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "iDeCoの掛金から所得税+住民税の節税効果を計算。年齢・職業別の掛金上限対応。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
