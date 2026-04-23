"use client";

import { useState, useMemo } from "react";

// 2025年度 雇用保険の育児休業給付金 上限額（賃金日額上限から算出）
// 賃金日額上限: 15,430円（2024年8月〜）
// 180日以内: 15,430 × 67% × 30 = 310,143円/月 → 実務上 314,460円が使われることが多いが
// ハローワーク公式: 上限額は定期改定。ここでは2024年度値を使用
const DAILY_WAGE_UPPER = 15_430; // 円/日（賃金日額上限）
const DAILY_WAGE_LOWER = 2_125;  // 円/日（賃金日額下限）

// 出生後休業支援給付（2025年4月〜）: 最初28日間、実質80%相当
// 育児休業給付金67% + 社会保険料免除相当で手取りベース80%
// ツールでは給付金部分のみ計算し、注記で説明する
const DAYS_HIGH_RATE = 180; // 67%適用日数
const DAYS_BIRTH_SUPPORT = 28; // 出生後休業支援給付の対象日数

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

function calcDailyWage(monthlyIncome: number): number {
  // 賃金日額 = 月収 × 6ヶ月 / 180日（雇用保険の標準的な計算）
  const raw = (monthlyIncome * 6) / 180;
  return Math.min(Math.max(raw, DAILY_WAGE_LOWER), DAILY_WAGE_UPPER);
}

interface MonthRow {
  month: number;
  startDay: number;
  endDay: number;
  days: number;
  rate: number;
  hasBirthSupport: boolean;
  benefitAmount: number; // 育児休業給付金（67%/50%）
  birthSupportDays: number; // 出生後休業支援給付対象日数
  birthSupportExtra: number; // 追加給付額（80%-67%=13%相当）
  totalAmount: number;
}

function calcMonthly(dailyWage: number, startDate: Date): MonthRow[] {
  const rows: MonthRow[] = [];
  let totalDays = 0;

  for (let m = 0; m < 12; m++) {
    const monthStart = new Date(startDate);
    monthStart.setMonth(monthStart.getMonth() + m);
    // その月の日数
    const daysInMonth = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0
    ).getDate();

    const startDay = totalDays + 1;
    const endDay = totalDays + daysInMonth;

    // 67%区間 (〜180日) と 50%区間 (181日〜) の日数を計算
    const highDays = Math.max(
      0,
      Math.min(endDay, DAYS_HIGH_RATE) - Math.max(startDay - 1, 0)
    );
    const lowDays = Math.max(
      0,
      endDay - Math.max(startDay - 1, DAYS_HIGH_RATE)
    );

    // 出生後休業支援給付の対象日数（最初28日）
    const birthSupportDays = Math.max(
      0,
      Math.min(endDay, DAYS_BIRTH_SUPPORT) - Math.max(startDay - 1, 0)
    );

    const highBenefit = dailyWage * 0.67 * highDays;
    const lowBenefit = dailyWage * 0.5 * lowDays;
    const benefitAmount = highBenefit + lowBenefit;

    // 出生後休業支援給付の追加分: 13%相当（80% - 67%）
    const birthSupportExtra = dailyWage * 0.13 * birthSupportDays;

    const totalAmount = benefitAmount + birthSupportExtra;

    const dominantDays = highDays >= lowDays ? highDays : lowDays;
    const rate = highDays >= lowDays ? 67 : 50;

    rows.push({
      month: m + 1,
      startDay,
      endDay,
      days: daysInMonth,
      rate,
      hasBirthSupport: birthSupportDays > 0,
      benefitAmount,
      birthSupportDays,
      birthSupportExtra,
      totalAmount,
    });

    totalDays += daysInMonth;
    void dominantDays;
  }

  return rows;
}

export default function Ikujikyuugyou() {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [startDateStr, setStartDateStr] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [showBirthSupport, setShowBirthSupport] = useState(true);

  const result = useMemo(() => {
    const income = parseFloat(monthlyIncome.replace(/,/g, ""));
    if (!income || income <= 0) return null;

    const startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) return null;

    const dailyWage = calcDailyWage(income);
    const isUpperCapped = dailyWage >= DAILY_WAGE_UPPER;
    const isLowerCapped = dailyWage <= DAILY_WAGE_LOWER;
    const rows = calcMonthly(dailyWage, startDate);

    const total180 = rows.reduce((s, r) => s + r.benefitAmount, 0);
    const totalBirthSupport = rows.reduce((s, r) => s + r.birthSupportExtra, 0);
    const grandTotal = showBirthSupport ? total180 + totalBirthSupport : total180;

    return { dailyWage, isUpperCapped, isLowerCapped, rows, total180, totalBirthSupport, grandTotal };
  }, [monthlyIncome, startDateStr, showBirthSupport]);

  const startYear = startDateStr ? new Date(startDateStr).getFullYear() : 0;
  const has2025BirthSupport = startYear >= 2025;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">育児休業給付金シミュレーター</h1>
          <p className="text-sm text-gray-500 mt-1">
            67%/50%の給付率・上限額チェック・2025年出生後休業支援給付対応
          </p>
        </div>

        {/* Input */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              休業開始前の月収（額面）
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">¥</span>
              <input
                type="text"
                inputMode="numeric"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="例: 300000"
                className="w-full border border-gray-300 rounded-lg pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              直近6ヶ月の月収平均を入力してください
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              育休開始日
            </label>
            <input
              type="date"
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {has2025BirthSupport && (
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <input
                type="checkbox"
                id="birthSupport"
                checked={showBirthSupport}
                onChange={(e) => setShowBirthSupport(e.target.checked)}
                className="mt-0.5"
              />
              <label htmlFor="birthSupport" className="text-sm text-green-800 cursor-pointer">
                <span className="font-semibold">出生後休業支援給付（2025年〜）を含める</span>
                <br />
                <span className="text-xs text-green-700">
                  最初28日間、給付率が実質80%相当に引き上げ（育休給付金67%＋追加13%給付）
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Wage info */}
        {result && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">賃金日額</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">賃金日額</div>
                <div className="text-xl font-bold text-gray-900">
                  ¥{fmt(result.dailyWage)}<span className="text-sm font-normal text-gray-500">/日</span>
                </div>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">月収換算（×30日）</div>
                <div className="text-xl font-bold text-gray-900">
                  ¥{fmt(result.dailyWage * 30)}<span className="text-sm font-normal text-gray-500">/月</span>
                </div>
              </div>
            </div>
            {result.isUpperCapped && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                上限額が適用されています（賃金日額上限: ¥{fmt(DAILY_WAGE_UPPER)}/日）。実際の月収に関わらず上限額で計算されます。
              </p>
            )}
            {result.isLowerCapped && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                下限額が適用されています（賃金日額下限: ¥{fmt(DAILY_WAGE_LOWER)}/日）。
              </p>
            )}
          </div>
        )}

        {/* Summary */}
        {result && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-blue-700">受給額サマリー（12ヶ月）</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg border border-blue-100 p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">育児休業給付金（67%/50%）</div>
                <div className="text-lg font-bold text-blue-700">¥{fmt(result.total180)}</div>
              </div>
              {showBirthSupport && has2025BirthSupport && (
                <div className="bg-white rounded-lg border border-green-100 p-4 text-center">
                  <div className="text-xs text-gray-500 mb-1">出生後休業支援給付（追加分）</div>
                  <div className="text-lg font-bold text-green-600">+¥{fmt(result.totalBirthSupport)}</div>
                </div>
              )}
            </div>
            <div className="bg-blue-600 rounded-lg p-4 text-center">
              <div className="text-xs text-blue-200 mb-1">12ヶ月合計受給額</div>
              <div className="text-3xl font-extrabold text-white">¥{fmt(result.grandTotal)}</div>
            </div>
          </div>
        )}

        {/* Ad placeholder */}
        <div className="w-full h-20 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
          広告
        </div>

        {/* Monthly table */}
        {result && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">月別内訳</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-3 py-2 font-medium text-gray-600 border border-gray-200">月</th>
                    <th className="text-center px-3 py-2 font-medium text-gray-600 border border-gray-200">給付率</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-600 border border-gray-200">育休給付金</th>
                    {showBirthSupport && has2025BirthSupport && (
                      <th className="text-right px-3 py-2 font-medium text-gray-600 border border-gray-200">支援給付</th>
                    )}
                    <th className="text-right px-3 py-2 font-medium text-gray-600 border border-gray-200">合計</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr
                      key={row.month}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-3 py-2 text-gray-700 border border-gray-200">
                        {row.month}ヶ月目
                        {row.hasBirthSupport && (
                          <span className="ml-1 text-xs text-green-600 font-medium">★</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center border border-gray-200">
                        {row.rate === 67 && row.month > 1 ? (
                          <span className="text-blue-600 font-medium">{row.rate}%</span>
                        ) : row.rate === 67 ? (
                          <span className="text-blue-600 font-medium">{row.rate}%</span>
                        ) : (
                          <span className="text-gray-500">{row.rate}%</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900 border border-gray-200">
                        ¥{fmt(row.benefitAmount)}
                      </td>
                      {showBirthSupport && has2025BirthSupport && (
                        <td className="px-3 py-2 text-right text-green-600 border border-gray-200">
                          {row.birthSupportExtra > 0 ? `+¥${fmt(row.birthSupportExtra)}` : "—"}
                        </td>
                      )}
                      <td className="px-3 py-2 text-right font-bold text-blue-700 border border-gray-200">
                        ¥{fmt(row.totalAmount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-800 text-white font-bold">
                    <td colSpan={2} className="px-3 py-2 border border-gray-600">合計</td>
                    <td className="px-3 py-2 text-right border border-gray-600">
                      ¥{fmt(result.total180)}
                    </td>
                    {showBirthSupport && has2025BirthSupport && (
                      <td className="px-3 py-2 text-right text-green-300 border border-gray-600">
                        +¥{fmt(result.totalBirthSupport)}
                      </td>
                    )}
                    <td className="px-3 py-2 text-right text-blue-300 border border-gray-600">
                      ¥{fmt(result.grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {showBirthSupport && has2025BirthSupport && (
              <p className="text-xs text-gray-400">★ 出生後休業支援給付の対象期間（最初28日間）</p>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-600">免責事項・計算の前提</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>本ツールの計算結果は概算です。実際の給付額はハローワークが決定します。</li>
            <li>賃金日額は「月収×6ヶ月÷180日」で算出しています。残業・賞与は含みません。</li>
            <li>賃金日額の上限（¥{fmt(DAILY_WAGE_UPPER)}/日）・下限（¥{fmt(DAILY_WAGE_LOWER)}/日）は2024年度の値です。</li>
            <li>出生後休業支援給付（2025年4月〜）は男性の育休取得を対象とした追加給付です。要件は別途ご確認ください。</li>
            <li>給付金には所得税がかかりません。社会保険料は育休中免除されます（免除分は別途計算してください）。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
