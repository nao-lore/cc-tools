"use client";

import { useState, useMemo } from "react";

// --- 定数 ---
// 定額減税の単価
const INCOME_TAX_PER_PERSON = 30_000; // 所得税: 1人あたり3万円
const RESIDENT_TAX_PER_PERSON = 10_000; // 住民税: 1人あたり1万円
const REDUCTION_PER_PERSON = INCOME_TAX_PER_PERSON + RESIDENT_TAX_PER_PERSON; // 合計4万円

// 対象所得上限（合計所得1,805万円以下）
const INCOME_LIMIT = 18_050_000;
// 給与収入換算: 2,000万円超は対象外
const SALARY_LIMIT = 20_000_000;

// 月別給与反映シミュレーション用（6〜12月 = 7ヶ月）
const MONTHS = ["6月", "7月", "8月", "9月", "10月", "11月", "12月"];

// --- 税計算ユーティリティ ---
// 給与収入から給与所得を計算（簡易版）
function calcSalaryIncome(salary: number): number {
  if (salary <= 550_999) return 0;
  if (salary <= 1_618_999) return salary - 550_000;
  if (salary <= 1_619_999) return 1_069_000;
  if (salary <= 1_621_999) return 1_070_000;
  if (salary <= 1_623_999) return 1_072_000;
  if (salary <= 1_627_999) return 1_074_000;
  if (salary <= 1_799_999) return Math.floor(salary / 4_000) * 4_000 * 0.6;
  if (salary <= 3_599_999) return Math.floor(salary * 0.7) - 80_000;
  if (salary <= 6_599_999) return Math.floor(salary * 0.8) - 440_000;
  if (salary <= 8_499_999) return Math.floor(salary * 0.9) - 1_100_000;
  return salary - 1_950_000;
}

// 所得税の簡易試算（基礎控除48万円のみ適用した参考値）
function calcIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  // 課税所得に対する税率（所得税速算表）
  let tax = 0;
  if (taxableIncome <= 1_950_000) tax = taxableIncome * 0.05;
  else if (taxableIncome <= 3_300_000) tax = taxableIncome * 0.1 - 97_500;
  else if (taxableIncome <= 6_950_000) tax = taxableIncome * 0.2 - 427_500;
  else if (taxableIncome <= 9_000_000) tax = taxableIncome * 0.23 - 636_000;
  else if (taxableIncome <= 18_000_000) tax = taxableIncome * 0.33 - 1_536_000;
  else if (taxableIncome <= 40_000_000) tax = taxableIncome * 0.4 - 2_796_000;
  else tax = taxableIncome * 0.45 - 4_796_000;
  // 復興特別所得税（2.1%）
  return Math.floor(tax * 1.021);
}

// --- フォーマット ---
function fmtJPY(n: number): string {
  if (n === 0) return "0円";
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function parseAmount(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  return parseInt(cleaned, 10);
}

// 年収別サンプルデータ
const INCOME_TABLE_ROWS = [200, 300, 400, 500, 600, 700, 800, 1000, 1200, 1500, 2000].map(
  (wan) => wan * 10_000
);

type IncomeType = "salary" | "business";

export default function TeigakuGenzei() {
  const [salaryInput, setSalaryInput] = useState<string>("");
  const [incomeType, setIncomeType] = useState<IncomeType>("salary");
  const [spouseCount, setSpouseCount] = useState<number>(0); // 配偶者（0 or 1）
  const [dependentCount, setDependentCount] = useState<number>(0); // 扶養親族数

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "").replace(/[^\d]/g, "");
    setSalaryInput(raw ? parseInt(raw, 10).toLocaleString("ja-JP") : "");
  };

  // 総人数（本人＋配偶者＋扶養親族）
  const totalPersons = 1 + spouseCount + dependentCount;

  // --- 計算 ---
  const result = useMemo(() => {
    const salary = parseAmount(salaryInput);
    if (!salary) return null;

    // 対象外チェック
    if (salary > SALARY_LIMIT) {
      return { outOfScope: true, salary };
    }

    // 減税額
    const incomeTaxReduction = INCOME_TAX_PER_PERSON * totalPersons;
    const residentTaxReduction = RESIDENT_TAX_PER_PERSON * totalPersons;
    const totalReduction = incomeTaxReduction + residentTaxReduction;

    // 所得税の簡易試算
    let annualIncomeTax = 0;
    if (incomeType === "salary") {
      const salaryIncome = calcSalaryIncome(salary);
      const taxableIncome = Math.max(0, salaryIncome - 480_000); // 基礎控除48万円
      annualIncomeTax = calcIncomeTax(taxableIncome);
    } else {
      // 事業所得は年収=事業所得として簡易計算
      const taxableIncome = Math.max(0, salary - 480_000);
      annualIncomeTax = calcIncomeTax(taxableIncome);
    }

    // 月額所得税（参考値）
    const monthlyIncomeTax = Math.floor(annualIncomeTax / 12);

    // 調整給付金（控除しきれない分）
    const canApplyIncomeTax = Math.min(incomeTaxReduction, annualIncomeTax);
    const residualIncomeTax = incomeTaxReduction - canApplyIncomeTax;
    // 住民税は年額から控除（住民税も簡易: 所得 × 10% 程度）
    const annualResidentTax = Math.floor(
      Math.max(0, (incomeType === "salary" ? calcSalaryIncome(salary) : salary) - 430_000) * 0.1
    );
    const canApplyResidentTax = Math.min(residentTaxReduction, annualResidentTax);
    const residualResidentTax = residentTaxReduction - canApplyResidentTax;
    const adjustmentPayment = residualIncomeTax + residualResidentTax;

    // 月別シミュレーション（6〜12月: 所得税部分を順次控除）
    const monthlyRows: { month: string; original: number; reduced: number; remaining: number }[] = [];
    let remainingReduction = incomeTaxReduction;
    for (const month of MONTHS) {
      if (remainingReduction <= 0) {
        monthlyRows.push({ month, original: monthlyIncomeTax, reduced: monthlyIncomeTax, remaining: 0 });
      } else if (remainingReduction >= monthlyIncomeTax) {
        monthlyRows.push({ month, original: monthlyIncomeTax, reduced: 0, remaining: remainingReduction - monthlyIncomeTax });
        remainingReduction -= monthlyIncomeTax;
      } else {
        monthlyRows.push({ month, original: monthlyIncomeTax, reduced: monthlyIncomeTax - remainingReduction, remaining: 0 });
        remainingReduction = 0;
      }
    }

    return {
      outOfScope: false,
      salary,
      totalPersons,
      incomeTaxReduction,
      residentTaxReduction,
      totalReduction,
      annualIncomeTax,
      monthlyIncomeTax,
      adjustmentPayment,
      canApplyIncomeTax,
      canApplyResidentTax,
      monthlyRows,
    };
  }, [salaryInput, incomeType, totalPersons]);

  return (
    <div className="space-y-6">
      {/* ===== 本人情報 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">本人情報を入力</h2>

        <div className="space-y-5">
          {/* 所得種別 */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">所得の種類</div>
            <div className="flex gap-2">
              {(["salary", "business"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setIncomeType(type)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                    incomeType === type
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {type === "salary" ? "給与所得者" : "事業所得者"}
                </button>
              ))}
            </div>
          </div>

          {/* 年収 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {incomeType === "salary" ? "年間給与収入（額面）" : "年間事業収入（売上）"}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={salaryInput}
                onChange={handleSalaryChange}
                placeholder="5,000,000"
                className="flex-1 px-4 py-3 text-right text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
              />
              <span className="text-gray-600 font-medium text-lg">円</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 扶養家族 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">扶養家族</h2>
        <p className="text-xs text-gray-500 mb-5">控除対象配偶者・扶養親族が対象（所得48万円以下の家族）</p>

        <div className="space-y-4">
          {/* 配偶者 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="text-sm font-medium text-gray-800">配偶者（控除対象）</div>
              <div className="text-xs text-gray-500 mt-0.5">合計所得48万円以下の配偶者</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSpouseCount(0)}
                disabled={spouseCount === 0}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-medium"
              >
                −
              </button>
              <span className="w-6 text-center text-lg font-bold text-gray-900">{spouseCount}</span>
              <button
                onClick={() => setSpouseCount(1)}
                disabled={spouseCount === 1}
                className="w-8 h-8 rounded-full border border-red-300 bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-100 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-medium"
              >
                ＋
              </button>
            </div>
          </div>

          {/* 扶養親族 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="text-sm font-medium text-gray-800">扶養親族</div>
              <div className="text-xs text-gray-500 mt-0.5">子・親・兄弟姉妹等（合計所得48万円以下）</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDependentCount((n) => Math.max(0, n - 1))}
                disabled={dependentCount === 0}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-medium"
              >
                −
              </button>
              <span className="w-6 text-center text-lg font-bold text-gray-900">{dependentCount}</span>
              <button
                onClick={() => setDependentCount((n) => n + 1)}
                className="w-8 h-8 rounded-full border border-red-300 bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-100 text-lg font-medium"
              >
                ＋
              </button>
            </div>
          </div>
        </div>

        {/* 合計人数サマリ */}
        <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
          <span className="text-sm text-red-800">減税対象人数（本人含む）</span>
          <span className="text-xl font-bold text-red-700">{totalPersons}人</span>
        </div>
      </div>

      {/* ===== 対象外 ===== */}
      {result?.outOfScope && (
        <div className="bg-gray-100 rounded-2xl border border-gray-300 p-6 text-center">
          <div className="text-2xl mb-2">対象外</div>
          <p className="text-gray-700 font-medium">給与収入2,000万円超のため、定額減税の対象外です。</p>
          <p className="text-sm text-gray-500 mt-2">
            合計所得金額1,805万円超（給与収入換算 約2,000万円超）は適用されません。
          </p>
        </div>
      )}

      {/* ===== 減税額サマリ ===== */}
      {result && !result.outOfScope && (
        <>
          {/* メインカード */}
          <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl shadow-lg p-6 text-white">
            <h2 className="text-base font-semibold opacity-90 mb-2">あなたの定額減税額</h2>
            <div className="text-5xl font-bold mb-1">{fmtJPY(result.totalReduction)}</div>
            <div className="text-sm opacity-75 mb-6">
              {totalPersons}人分（本人＋扶養{totalPersons - 1}人）× 4万円
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white bg-opacity-15 rounded-xl p-4">
                <div className="text-xs opacity-75 mb-1">所得税分</div>
                <div className="text-2xl font-bold">{fmtJPY(result.incomeTaxReduction)}</div>
                <div className="text-xs opacity-60 mt-1">{totalPersons}人 × 3万円</div>
              </div>
              <div className="bg-white bg-opacity-15 rounded-xl p-4">
                <div className="text-xs opacity-75 mb-1">住民税分</div>
                <div className="text-2xl font-bold">{fmtJPY(result.residentTaxReduction)}</div>
                <div className="text-xs opacity-60 mt-1">{totalPersons}人 × 1万円</div>
              </div>
            </div>
          </div>

          {/* 控除しきれるか判定 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">控除適用の見込み</h2>
            <p className="text-xs text-gray-500 mb-4">
              年間所得税（参考値）との比較。社会保険料・各種控除は考慮していません。
            </p>

            <div className="space-y-3">
              {/* 所得税 */}
              <div className="p-4 rounded-xl border border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">年間所得税（参考試算）</span>
                  <span className="font-semibold text-gray-900">{fmtJPY(result.annualIncomeTax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">所得税からの減税額</span>
                  <span className="font-semibold text-red-700">− {fmtJPY(result.incomeTaxReduction)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm font-medium">
                  <span className="text-gray-700">所得税控除適用額</span>
                  <span className={result.canApplyIncomeTax < result.incomeTaxReduction ? "text-amber-700" : "text-green-700"}>
                    {fmtJPY(result.canApplyIncomeTax)}
                  </span>
                </div>
              </div>

              {result.adjustmentPayment > 0 && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-start gap-2">
                    <div className="text-amber-600 text-lg leading-none">!</div>
                    <div>
                      <div className="text-sm font-medium text-amber-800 mb-1">調整給付金が支給される見込みです</div>
                      <div className="text-sm text-amber-700">
                        控除しきれない分 <span className="font-bold">{fmtJPY(result.adjustmentPayment)}</span> は
                        調整給付金として市区町村から支給されます。
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {result.adjustmentPayment === 0 && (
                <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs text-green-700">
                    所得税・住民税ともに全額控除できる見込みです（参考試算）。
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 月別反映シミュレーション */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">給与明細への反映シミュレーション</h2>
            <p className="text-xs text-gray-500 mb-4">
              給与所得者の場合、2024年6月〜の給与から所得税が順次控除されます（参考値）
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-3 text-gray-500 font-medium">月</th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">通常の所得税</th>
                    <th className="text-right py-2 px-3 text-red-600 font-medium">減税後</th>
                    <th className="text-right py-2 pl-3 text-gray-500 font-medium">残り減税枠</th>
                  </tr>
                </thead>
                <tbody>
                  {result.monthlyRows.map((row) => (
                    <tr key={row.month} className="border-b border-gray-50">
                      <td className="py-2.5 pr-3 font-medium text-gray-700">{row.month}</td>
                      <td className="py-2.5 px-3 text-right text-gray-600">{fmtJPY(row.original)}</td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${row.reduced < row.original ? "text-red-600" : "text-gray-700"}`}>
                        {fmtJPY(row.reduced)}
                        {row.reduced < row.original && (
                          <span className="text-xs text-red-400 ml-1">
                            (−{fmtJPY(row.original - row.reduced)})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pl-3 text-right text-gray-500">{fmtJPY(row.remaining)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-xs text-blue-700">
                月額所得税は年収・各種控除により異なります。実際の金額は給与明細をご確認ください。
                住民税分（{fmtJPY(result.residentTaxReduction)}）は2024年6月の住民税から一括控除されます。
              </p>
            </div>
          </div>

          {/* 年収別一覧表 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">年収別 減税効果一覧</h2>
            <p className="text-xs text-gray-500 mb-4">本人のみ（扶養なし）の場合の参考値</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-2 pr-3 text-gray-500 font-medium">年収</th>
                    <th className="text-right py-2 px-3 text-red-600 font-medium">減税額（本人）</th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">夫婦2人</th>
                    <th className="text-right py-2 pl-3 text-gray-500 font-medium">4人家族</th>
                  </tr>
                </thead>
                <tbody>
                  {INCOME_TABLE_ROWS.map((income) => {
                    const isOver = income > SALARY_LIMIT;
                    return (
                      <tr
                        key={income}
                        className={`border-b border-gray-50 ${
                          parseAmount(salaryInput) === income ? "bg-red-50" : ""
                        }`}
                      >
                        <td className="py-2 pr-3 text-right font-medium text-gray-700">
                          {income / 10_000}万円
                        </td>
                        <td className="py-2 px-3 text-right">
                          {isOver ? (
                            <span className="text-gray-400 text-xs">対象外</span>
                          ) : (
                            <span className="font-semibold text-red-700">{fmtJPY(REDUCTION_PER_PERSON)}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-600">
                          {isOver ? "—" : fmtJPY(REDUCTION_PER_PERSON * 2)}
                        </td>
                        <td className="py-2 pl-3 text-right text-gray-600">
                          {isOver ? "—" : fmtJPY(REDUCTION_PER_PERSON * 4)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ===== 制度説明 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">定額減税の仕組み</h2>

        <div className="space-y-3">
          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <div className="text-sm font-medium text-red-800 mb-2">減税額の計算式</div>
            <div className="text-sm text-red-700 space-y-1">
              <div>所得税：3万円 × （本人 ＋ 扶養親族数）</div>
              <div>住民税：1万円 × （本人 ＋ 扶養親族数）</div>
              <div className="font-bold pt-1 border-t border-red-200">合計：4万円 × 人数</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 border border-gray-200 rounded-xl">
              <div className="text-xs text-gray-500 font-medium mb-2">給与所得者の適用方法</div>
              <p className="text-sm text-gray-700">
                2024年6月以降の給与・賞与から源泉徴収される所得税が、減税額に達するまで控除されます。
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-xl">
              <div className="text-xs text-gray-500 font-medium mb-2">事業所得者の適用方法</div>
              <p className="text-sm text-gray-700">
                予定納税・確定申告での税額から控除されます。第1期分予定納税から控除適用。
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="text-xs font-medium text-amber-800 mb-1">調整給付金とは</div>
            <p className="text-xs text-amber-700">
              減税額が所得税・住民税の年税額を上回る場合（低所得者等）、控除しきれない分が
              調整給付金として市区町村から給付されます。
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-xs font-medium text-gray-700 mb-1">対象者</div>
            <p className="text-xs text-gray-600">
              2024年分の合計所得金額が1,805万円以下の居住者（給与収入換算: 2,000万円以下）
            </p>
          </div>
        </div>
      </div>

      {/* ===== 免責・参考リンク ===== */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
        <p className="text-xs text-gray-500 mb-2">
          本ツールは概算計算を目的としており、実際の減税額・税額と異なる場合があります。
          所得税試算は基礎控除のみ適用した参考値です。正確な判断は税理士等の専門家または市区町村にご確認ください。
        </p>
        <a
          href="https://www.nta.go.jp/users/gensen/teigakugenzei/index.htm"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-red-600 hover:text-red-700 underline"
        >
          国税庁「定額減税について」を確認する
        </a>
      </div>

      {/* 使い方ガイド */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">使い方ガイド</h2>
        <ol className="space-y-3">
          {[
            { step: "1", title: "所得の種類を選択", desc: "会社員・パートなどは「給与所得者」、フリーランス・個人事業主は「事業所得者」を選択します。" },
            { step: "2", title: "年収を入力", desc: "給与収入（額面）または年間事業収入を入力します。2,000万円超の場合は定額減税の対象外となります。" },
            { step: "3", title: "扶養家族を入力", desc: "控除対象配偶者と扶養親族の人数を入力します。1人増えるごとに減税額が4万円増えます。" },
            { step: "4", title: "減税額と月別反映を確認", desc: "合計減税額と、6〜12月の給与明細への反映シミュレーションが表示されます。" },
          ].map((item) => (
            <li key={item.step} className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-red-100 text-red-700 font-bold text-sm flex items-center justify-center">{item.step}</span>
              <div>
                <div className="font-medium text-gray-800 text-sm">{item.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            {
              q: "定額減税の金額はいくらですか？",
              a: "本人1人あたり所得税3万円＋住民税1万円の合計4万円です。扶養家族がいる場合は人数分追加されます。例えば夫婦と子1人の3人家族では合計12万円が減税されます。",
            },
            {
              q: "年収2,000万円以上の人は対象外ですか？",
              a: "はい。合計所得金額1,805万円超（給与収入換算で約2,000万円超）は定額減税の対象外です。本ツールでは給与収入2,000万円超と入力すると「対象外」と表示します。",
            },
            {
              q: "調整給付金とは何ですか？",
              a: "定額減税額が所得税・住民税の年税額を上回る場合（低所得者など）、控除しきれない差額が調整給付金として市区町村から給付されます。本ツールで自動判定して金額を表示します。",
            },
            {
              q: "給与明細のどこで確認できますか？",
              a: "2024年6月以降の給与明細の「源泉所得税」欄が通常より少なくなっているか、ゼロになっている場合に定額減税が適用されています。給与明細に「定額減税額」として記載されます。",
            },
          ].map((item, i) => (
            <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="font-medium text-gray-800 text-sm mb-1">Q. {item.q}</div>
              <div className="text-xs text-gray-600 leading-relaxed">A. {item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 関連ツール */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">関連ツール</h2>
        <div className="flex flex-wrap gap-2">
          <a href="/iryouhi-koujo" className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-red-300 hover:text-red-700 transition-colors">
            <span>🏥</span> 医療費控除 計算
          </a>
          <a href="/withholding-tax-calculator" className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-red-300 hover:text-red-700 transition-colors">
            <span>📋</span> 源泉徴収税 計算
          </a>
          <a href="/zangyou-dai" className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-red-300 hover:text-red-700 transition-colors">
            <span>⏰</span> 残業代 計算
          </a>
        </div>
      </div>

      {/* JSON-LD FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "定額減税の金額はいくらですか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "本人1人あたり所得税3万円＋住民税1万円の合計4万円です。扶養家族がいる場合は人数分追加されます。",
                },
              },
              {
                "@type": "Question",
                "name": "年収2,000万円以上の人は対象外ですか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "はい。合計所得金額1,805万円超（給与収入換算で約2,000万円超）は定額減税の対象外です。",
                },
              },
              {
                "@type": "Question",
                "name": "調整給付金とは何ですか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "定額減税額が所得税・住民税の年税額を上回る場合に、控除しきれない差額が調整給付金として市区町村から給付されます。",
                },
              },
              {
                "@type": "Question",
                "name": "給与明細のどこで確認できますか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "2024年6月以降の給与明細の「源泉所得税」欄が少なくなっているか、ゼロになっている場合に定額減税が適用されています。",
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
