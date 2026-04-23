"use client";

import { useState, useMemo } from "react";

// 2024年度 標準報酬月額表（協会けんぽ 東京都）
const STANDARD_MONTHLY_SALARY_TABLE = [
  { grade: 1, standard: 58000, healthMin: 0, healthMax: 63000, pensionMin: 0, pensionMax: 63000 },
  { grade: 2, standard: 68000, healthMin: 63000, healthMax: 73000, pensionMin: 63000, pensionMax: 73000 },
  { grade: 3, standard: 78000, healthMin: 73000, healthMax: 83000, pensionMin: 73000, pensionMax: 83000 },
  { grade: 4, standard: 88000, healthMin: 83000, healthMax: 93000, pensionMin: 83000, pensionMax: 93000 },
  { grade: 5, standard: 98000, healthMin: 93000, healthMax: 101000, pensionMin: 93000, pensionMax: 101000 },
  { grade: 6, standard: 104000, healthMin: 101000, healthMax: 107000, pensionMin: 101000, pensionMax: 107000 },
  { grade: 7, standard: 110000, healthMin: 107000, healthMax: 114000, pensionMin: 107000, pensionMax: 114000 },
  { grade: 8, standard: 118000, healthMin: 114000, healthMax: 122000, pensionMin: 114000, pensionMax: 122000 },
  { grade: 9, standard: 126000, healthMin: 122000, healthMax: 130000, pensionMin: 122000, pensionMax: 130000 },
  { grade: 10, standard: 134000, healthMin: 130000, healthMax: 138000, pensionMin: 130000, pensionMax: 138000 },
  { grade: 11, standard: 142000, healthMin: 138000, healthMax: 146000, pensionMin: 138000, pensionMax: 146000 },
  { grade: 12, standard: 150000, healthMin: 146000, healthMax: 155000, pensionMin: 146000, pensionMax: 155000 },
  { grade: 13, standard: 160000, healthMin: 155000, healthMax: 165000, pensionMin: 155000, pensionMax: 165000 },
  { grade: 14, standard: 170000, healthMin: 165000, healthMax: 175000, pensionMin: 165000, pensionMax: 175000 },
  { grade: 15, standard: 180000, healthMin: 175000, healthMax: 185000, pensionMin: 175000, pensionMax: 185000 },
  { grade: 16, standard: 190000, healthMin: 185000, healthMax: 195000, pensionMin: 185000, pensionMax: 195000 },
  { grade: 17, standard: 200000, healthMin: 195000, healthMax: 210000, pensionMin: 195000, pensionMax: 210000 },
  { grade: 18, standard: 220000, healthMin: 210000, healthMax: 230000, pensionMin: 210000, pensionMax: 230000 },
  { grade: 19, standard: 240000, healthMin: 230000, healthMax: 250000, pensionMin: 230000, pensionMax: 250000 },
  { grade: 20, standard: 260000, healthMin: 250000, healthMax: 270000, pensionMin: 250000, pensionMax: 270000 },
  { grade: 21, standard: 280000, healthMin: 270000, healthMax: 290000, pensionMin: 270000, pensionMax: 290000 },
  { grade: 22, standard: 300000, healthMin: 290000, healthMax: 310000, pensionMin: 290000, pensionMax: 310000 },
  { grade: 23, standard: 320000, healthMin: 310000, healthMax: 330000, pensionMin: 310000, pensionMax: 330000 },
  { grade: 24, standard: 340000, healthMin: 330000, healthMax: 350000, pensionMin: 330000, pensionMax: 350000 },
  { grade: 25, standard: 360000, healthMin: 350000, healthMax: 370000, pensionMin: 350000, pensionMax: 370000 },
  { grade: 26, standard: 380000, healthMin: 370000, healthMax: 395000, pensionMin: 370000, pensionMax: 395000 },
  { grade: 27, standard: 410000, healthMin: 395000, healthMax: 425000, pensionMin: 395000, pensionMax: 425000 },
  { grade: 28, standard: 440000, healthMin: 425000, healthMax: 455000, pensionMin: 425000, pensionMax: 455000 },
  { grade: 29, standard: 470000, healthMin: 455000, healthMax: 485000, pensionMin: 455000, pensionMax: 485000 },
  { grade: 30, standard: 500000, healthMin: 485000, healthMax: 515000, pensionMin: 485000, pensionMax: 515000 },
  { grade: 31, standard: 530000, healthMin: 515000, healthMax: 545000, pensionMin: 515000, pensionMax: 545000 },
  { grade: 32, standard: 560000, healthMin: 545000, healthMax: 575000, pensionMin: 545000, pensionMax: 575000 },
  { grade: 33, standard: 590000, healthMin: 575000, healthMax: 605000, pensionMin: 575000, pensionMax: 605000 },
  { grade: 34, standard: 620000, healthMin: 605000, healthMax: 635000, pensionMin: 605000, pensionMax: 635000 },
  { grade: 35, standard: 650000, healthMin: 635000, healthMax: 665000, pensionMin: 635000, pensionMax: 665000 },
  { grade: 36, standard: 680000, healthMin: 665000, healthMax: 695000, pensionMin: 665000, pensionMax: 695000 },
  { grade: 37, standard: 710000, healthMin: 695000, healthMax: 730000, pensionMin: 695000, pensionMax: 730000 },
  { grade: 38, standard: 750000, healthMin: 730000, healthMax: 770000, pensionMin: 730000, pensionMax: 770000 },
  { grade: 39, standard: 790000, healthMin: 770000, healthMax: 810000, pensionMin: 770000, pensionMax: 810000 },
  { grade: 40, standard: 830000, healthMin: 810000, healthMax: 855000, pensionMin: 810000, pensionMax: 855000 },
  { grade: 41, standard: 880000, healthMin: 855000, healthMax: 905000, pensionMin: 855000, pensionMax: 905000 },
  { grade: 42, standard: 930000, healthMin: 905000, healthMax: 955000, pensionMin: 905000, pensionMax: 955000 },
  { grade: 43, standard: 980000, healthMin: 955000, healthMax: 1005000, pensionMin: 955000, pensionMax: 1005000 },
  { grade: 44, standard: 1030000, healthMin: 1005000, healthMax: 1055000, pensionMin: 1005000, pensionMax: 1055000 },
  { grade: 45, standard: 1090000, healthMin: 1055000, healthMax: 1115000, pensionMin: 1055000, pensionMax: 1115000 },
  { grade: 46, standard: 1150000, healthMin: 1115000, healthMax: 1175000, pensionMin: 1115000, pensionMax: 1175000 },
  { grade: 47, standard: 1210000, healthMin: 1175000, healthMax: 9999999, pensionMin: 1175000, pensionMax: 9999999 },
];

// 厚生年金は32等級まで上限
const PENSION_MAX_GRADE = 32;
// 協会けんぽ東京都 2024年度 健康保険料率（介護保険なし）
const HEALTH_RATE = 0.0998; // 9.98%
const HEALTH_RATE_KAIGO = 0.1168; // 11.68%（40歳以上）
// 厚生年金保険料率
const PENSION_RATE = 0.183;

function fmt(n: number) {
  return Math.round(n).toLocaleString("ja-JP");
}

function getGrade(avgSalary: number) {
  for (const row of STANDARD_MONTHLY_SALARY_TABLE) {
    if (avgSalary < row.healthMax || row === STANDARD_MONTHLY_SALARY_TABLE[STANDARD_MONTHLY_SALARY_TABLE.length - 1]) {
      return row;
    }
  }
  return STANDARD_MONTHLY_SALARY_TABLE[STANDARD_MONTHLY_SALARY_TABLE.length - 1];
}

export default function SanteiKisoTodoke() {
  const [apr, setApr] = useState("300000");
  const [may, setMay] = useState("310000");
  const [jun, setJun] = useState("320000");
  const [aprDays, setAprDays] = useState("30");
  const [mayDays, setMayDays] = useState("31");
  const [junDays, setJunDays] = useState("30");
  const [isKaigo, setIsKaigo] = useState(false);

  const result = useMemo(() => {
    const aprN = parseFloat(apr) || 0;
    const mayN = parseFloat(may) || 0;
    const junN = parseFloat(jun) || 0;
    const aprD = parseFloat(aprDays) || 1;
    const mayD = parseFloat(mayDays) || 1;
    const junD = parseFloat(junDays) || 1;

    // 支払基礎日数17日以上の月のみを算定対象
    const validMonths = [
      { amount: aprN, days: aprD, name: "4月" },
      { amount: mayN, days: mayD, name: "5月" },
      { amount: junN, days: junD, name: "6月" },
    ].filter((m) => m.days >= 17);

    if (validMonths.length === 0) return null;

    const totalAmount = validMonths.reduce((sum, m) => sum + m.amount, 0);
    const avgSalary = totalAmount / validMonths.length;

    const grade = getGrade(avgSalary);

    // 厚生年金は上限等級
    const pensionGrade = STANDARD_MONTHLY_SALARY_TABLE[Math.min(grade.grade - 1, PENSION_MAX_GRADE - 1)];

    const healthRate = isKaigo ? HEALTH_RATE_KAIGO : HEALTH_RATE;
    const healthPremium = Math.round(grade.standard * healthRate / 2); // 折半額
    const pensionPremium = Math.round(pensionGrade.standard * PENSION_RATE / 2); // 折半額

    return {
      validMonths,
      totalAmount,
      avgSalary,
      grade,
      pensionGrade,
      healthPremium,
      pensionPremium,
      totalPremium: healthPremium + pensionPremium,
    };
  }, [apr, may, jun, aprDays, mayDays, junDays, isKaigo]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">4〜6月の報酬を入力</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "4月分 報酬", val: apr, setVal: setApr, days: aprDays, setDays: setAprDays },
            { label: "5月分 報酬", val: may, setVal: setMay, days: mayDays, setDays: setMayDays },
            { label: "6月分 報酬", val: jun, setVal: setJun, days: junDays, setDays: setJunDays },
          ].map(({ label, val, setVal, days, setDays }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">{label}</p>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">報酬額（円）</label>
                <input type="number" value={val} onChange={(e) => setVal(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">支払基礎日数</label>
                <input type="number" value={days} onChange={(e) => setDays(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {parseFloat(days) < 17 && (
                  <p className="text-xs text-orange-500 mt-1">17日未満のため算定除外</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input type="checkbox" id="kaigo" checked={isKaigo} onChange={(e) => setIsKaigo(e.target.checked)} className="rounded" />
          <label htmlFor="kaigo" className="text-sm text-gray-600">40歳以上（介護保険第2号被保険者）</label>
        </div>
      </div>

      {result === null ? (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
          <p className="text-orange-700 font-semibold">算定対象月がありません</p>
          <p className="text-orange-600 text-sm mt-1">支払基礎日数が17日以上の月がない場合、前年の標準報酬月額が継続されます</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">判定結果</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-xs text-blue-600 mb-1">算定対象月 平均報酬月額</p>
              <p className="text-3xl font-bold text-blue-700">{fmt(Math.round(result.avgSalary))}<span className="text-base font-normal ml-1">円</span></p>
              <p className="text-xs text-blue-500 mt-1">対象月: {result.validMonths.map(m => m.name).join("・")}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-xs text-green-600 mb-1">標準報酬月額（健康保険）</p>
              <p className="text-3xl font-bold text-green-700">{fmt(result.grade.standard)}<span className="text-base font-normal ml-1">円</span></p>
              <p className="text-xs text-green-500 mt-1">第{result.grade.grade}等級</p>
            </div>
          </div>

          {/* 保険料 */}
          <div className="space-y-3 mb-4">
            <h3 className="text-sm font-semibold text-gray-700">月額保険料（被保険者負担分）</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2 text-gray-600 font-medium">保険種別</th>
                    <th className="text-right px-3 py-2 text-gray-600 font-medium">標準報酬月額</th>
                    <th className="text-right px-3 py-2 text-gray-600 font-medium">保険料率</th>
                    <th className="text-right px-3 py-2 text-gray-600 font-medium">被保険者負担（折半）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-2">健康保険{isKaigo ? "（介護含む）" : ""}</td>
                    <td className="px-3 py-2 text-right">{fmt(result.grade.standard)} 円</td>
                    <td className="px-3 py-2 text-right">{isKaigo ? "11.68" : "9.98"}%</td>
                    <td className="px-3 py-2 text-right font-semibold">{fmt(result.healthPremium)} 円</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-2">厚生年金保険</td>
                    <td className="px-3 py-2 text-right">{fmt(result.pensionGrade.standard)} 円{result.grade.grade > PENSION_MAX_GRADE && <span className="text-xs text-orange-500 ml-1">（上限）</span>}</td>
                    <td className="px-3 py-2 text-right">18.3%</td>
                    <td className="px-3 py-2 text-right font-semibold">{fmt(result.pensionPremium)} 円</td>
                  </tr>
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-3 py-2" colSpan={3}>合計（月額）</td>
                    <td className="px-3 py-2 text-right text-blue-700">{fmt(result.totalPremium)} 円</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-3 py-2 text-gray-500" colSpan={3}>年間合計（概算）</td>
                    <td className="px-3 py-2 text-right text-gray-600">{fmt(result.totalPremium * 12)} 円</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
            <p>※ 協会けんぽ東京都 2024年度料率。都道府県・健保組合によって料率が異なります。</p>
            <p>※ 9月分（10月納付）から新等級が適用されます。</p>
          </div>
        </div>
      )}
    </div>
  );
}
