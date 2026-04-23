"use client";

import { useState, useMemo } from "react";

// 標準報酬月額等級表（厚生年金、健康保険）
const GRADES = [
  { grade: 1, standard: 58000 },
  { grade: 2, standard: 68000 },
  { grade: 3, standard: 78000 },
  { grade: 4, standard: 88000 },
  { grade: 5, standard: 98000 },
  { grade: 6, standard: 104000 },
  { grade: 7, standard: 110000 },
  { grade: 8, standard: 118000 },
  { grade: 9, standard: 126000 },
  { grade: 10, standard: 134000 },
  { grade: 11, standard: 142000 },
  { grade: 12, standard: 150000 },
  { grade: 13, standard: 160000 },
  { grade: 14, standard: 170000 },
  { grade: 15, standard: 180000 },
  { grade: 16, standard: 190000 },
  { grade: 17, standard: 200000 },
  { grade: 18, standard: 220000 },
  { grade: 19, standard: 240000 },
  { grade: 20, standard: 260000 },
  { grade: 21, standard: 280000 },
  { grade: 22, standard: 300000 },
  { grade: 23, standard: 320000 },
  { grade: 24, standard: 340000 },
  { grade: 25, standard: 360000 },
  { grade: 26, standard: 380000 },
  { grade: 27, standard: 410000 },
  { grade: 28, standard: 440000 },
  { grade: 29, standard: 470000 },
  { grade: 30, standard: 500000 },
  { grade: 31, standard: 530000 },
  { grade: 32, standard: 560000 },
  { grade: 33, standard: 590000 },
  { grade: 34, standard: 620000 },
  { grade: 35, standard: 650000 },
  { grade: 36, standard: 680000 },
  { grade: 37, standard: 710000 },
  { grade: 38, standard: 750000 },
  { grade: 39, standard: 790000 },
  { grade: 40, standard: 830000 },
  { grade: 41, standard: 880000 },
  { grade: 42, standard: 930000 },
  { grade: 43, standard: 980000 },
  { grade: 44, standard: 1030000 },
  { grade: 45, standard: 1090000 },
  { grade: 46, standard: 1150000 },
  { grade: 47, standard: 1210000 },
];

function getGradeFromAmount(amount: number) {
  // 実際は報酬月額の範囲から等級を判定するが、簡略化して最近傍で判定
  let best = GRADES[0];
  let minDiff = Math.abs(amount - GRADES[0].standard);
  for (const g of GRADES) {
    const diff = Math.abs(amount - g.standard);
    if (diff < minDiff) {
      minDiff = diff;
      best = g;
    }
  }
  return best;
}

function fmt(n: number) {
  return Math.round(n).toLocaleString("ja-JP");
}

const PENSION_RATE = 0.183;
const HEALTH_RATE = 0.0998;

export default function GetsugakuHenkou() {
  const [currentStandard, setCurrentStandard] = useState("300000");
  const [m1, setM1] = useState("350000");
  const [m2, setM2] = useState("360000");
  const [m3, setM3] = useState("340000");
  const [m1Days, setM1Days] = useState("31");
  const [m2Days, setM2Days] = useState("28");
  const [m3Days, setM3Days] = useState("31");
  const [changeType, setChangeType] = useState("up");

  const result = useMemo(() => {
    const current = parseFloat(currentStandard) || 0;
    const currentGrade = getGradeFromAmount(current);

    const months = [
      { amount: parseFloat(m1) || 0, days: parseFloat(m1Days) || 0 },
      { amount: parseFloat(m2) || 0, days: parseFloat(m2Days) || 0 },
      { amount: parseFloat(m3) || 0, days: parseFloat(m3Days) || 0 },
    ];

    // 17日以上の月のみ対象
    const validMonths = months.filter((m) => m.days >= 17);
    if (validMonths.length < 3) {
      return { error: "変動後3ヶ月すべての支払基礎日数が17日以上必要です" };
    }

    const avg = validMonths.reduce((s, m) => s + m.amount, 0) / 3;
    const newGrade = getGradeFromAmount(avg);

    const gradeDiff = Math.abs(newGrade.grade - currentGrade.grade);
    const isApplicable = gradeDiff >= 2;

    // 保険料変動
    const oldHealthPremium = Math.round(currentGrade.standard * HEALTH_RATE / 2);
    const newHealthPremium = Math.round(newGrade.standard * HEALTH_RATE / 2);
    const oldPensionPremium = Math.round(currentGrade.standard * PENSION_RATE / 2);
    const newPensionPremium = Math.round(newGrade.standard * PENSION_RATE / 2);

    return {
      avg,
      currentGrade,
      newGrade,
      gradeDiff,
      isApplicable,
      oldHealthPremium,
      newHealthPremium,
      oldPensionPremium,
      newPensionPremium,
      healthDiff: newHealthPremium - oldHealthPremium,
      pensionDiff: newPensionPremium - oldPensionPremium,
    };
  }, [currentStandard, m1, m2, m3, m1Days, m2Days, m3Days, changeType]);

  return (
    <div className="space-y-6">
      {/* 入力 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">現在の状況を入力</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">固定的賃金の変動方向</label>
          <div className="flex gap-3">
            {[{ value: "up", label: "昇給（増加）" }, { value: "down", label: "降給（減少）" }].map((opt) => (
              <button key={opt.value} onClick={() => setChangeType(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${changeType === opt.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">現在の標準報酬月額<span className="text-gray-400 text-xs ml-1">円</span></label>
          <select value={currentStandard} onChange={(e) => setCurrentStandard(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {GRADES.map((g) => (
              <option key={g.grade} value={g.standard}>第{g.grade}等級 {fmt(g.standard)}円</option>
            ))}
          </select>
        </div>

        <p className="text-sm font-medium text-gray-700 mb-3">固定的賃金変動後の3ヶ月間の報酬</p>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: "1ヶ月目", val: m1, setVal: setM1, days: m1Days, setDays: setM1Days },
            { label: "2ヶ月目", val: m2, setVal: setM2, days: m2Days, setDays: setM2Days },
            { label: "3ヶ月目", val: m3, setVal: setM3, days: m3Days, setDays: setM3Days },
          ].map(({ label, val, setVal, days, setDays }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-600 mb-2">{label}</p>
              <div className="mb-2">
                <label className="block text-xs text-gray-500 mb-1">報酬額（円）</label>
                <input type="number" value={val} onChange={(e) => setVal(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">支払基礎日数</label>
                <input type="number" value={days} onChange={(e) => setDays(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 結果 */}
      {"error" in result ? (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
          <p className="text-orange-700">{result.error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">判定結果</h2>

          {/* 判定バナー */}
          <div className={`rounded-xl p-5 text-center mb-6 ${result.isApplicable ? "bg-red-50 border-2 border-red-300" : "bg-green-50 border-2 border-green-300"}`}>
            <p className={`text-2xl font-bold ${result.isApplicable ? "text-red-700" : "text-green-700"}`}>
              {result.isApplicable ? "月額変更届 提出が必要です" : "月額変更届 不要（2等級差未満）"}
            </p>
            <p className={`text-sm mt-1 ${result.isApplicable ? "text-red-600" : "text-green-600"}`}>
              等級差: {result.gradeDiff}等級（2等級以上で提出必要）
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">変動前 標準報酬月額</p>
              <p className="text-2xl font-bold text-gray-700">{fmt(result.currentGrade.standard)}<span className="text-sm font-normal ml-1">円</span></p>
              <p className="text-xs text-gray-500">第{result.currentGrade.grade}等級</p>
            </div>
            <div className={`rounded-xl p-4 ${result.isApplicable ? "bg-blue-50" : "bg-gray-50"}`}>
              <p className="text-xs text-gray-500 mb-1">変動後 標準報酬月額（新）</p>
              <p className="text-2xl font-bold text-blue-700">{fmt(result.newGrade.standard)}<span className="text-sm font-normal ml-1">円</span></p>
              <p className="text-xs text-gray-500">第{result.newGrade.grade}等級 / 3ヶ月平均: {fmt(Math.round(result.avg))}円</p>
            </div>
          </div>

          {result.isApplicable && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2 text-gray-600 font-medium">保険種別</th>
                    <th className="text-right px-3 py-2 text-gray-600 font-medium">変動前</th>
                    <th className="text-right px-3 py-2 text-gray-600 font-medium">変動後</th>
                    <th className="text-right px-3 py-2 text-gray-600 font-medium">差額（月）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-2">健康保険（折半）</td>
                    <td className="px-3 py-2 text-right">{fmt(result.oldHealthPremium)} 円</td>
                    <td className="px-3 py-2 text-right">{fmt(result.newHealthPremium)} 円</td>
                    <td className={`px-3 py-2 text-right font-semibold ${result.healthDiff > 0 ? "text-red-600" : "text-green-600"}`}>
                      {result.healthDiff > 0 ? "+" : ""}{fmt(result.healthDiff)} 円
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-2">厚生年金（折半）</td>
                    <td className="px-3 py-2 text-right">{fmt(result.oldPensionPremium)} 円</td>
                    <td className="px-3 py-2 text-right">{fmt(result.newPensionPremium)} 円</td>
                    <td className={`px-3 py-2 text-right font-semibold ${result.pensionDiff > 0 ? "text-red-600" : "text-green-600"}`}>
                      {result.pensionDiff > 0 ? "+" : ""}{fmt(result.pensionDiff)} 円
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        <p className="font-semibold mb-1">月額変更届の提出条件（3つすべて必要）</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>固定的賃金（基本給・手当）に変動があった</li>
          <li>変動後3ヶ月間の報酬月額の平均が2等級以上変わった</li>
          <li>変動後3ヶ月間すべての支払基礎日数が17日以上</li>
        </ul>
      </div>
    </div>
  );
}
