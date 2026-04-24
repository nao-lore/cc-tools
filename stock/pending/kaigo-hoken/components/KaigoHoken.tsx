"use client";

import { useState, useMemo } from "react";

// 協会けんぽ 介護保険料率 2024年度: 1.60% (労使折半: 各0.80%)
// ※ 実際の料率は毎年改定。2024年度実績値を使用。
const KENPO_RATE = 0.0160;

// 国保 介護納付金賦課 全国平均値（2024年度概算）
// 所得割: 1.65%, 均等割: 月額約2,200円（年26,400円）
const KOKUHO_SHOTOKU_RATE = 0.0165;
const KOKUHO_KINTOU_MONTHLY = 2200;

// 標準報酬月額 等級表（協会けんぽ）
// [下限, 標準報酬月額]
const HOKEN_GRADES: [number, number][] = [
  [0, 58000],
  [63000, 68000],
  [73000, 78000],
  [83000, 88000],
  [93000, 98000],
  [101000, 104000],
  [107000, 110000],
  [114000, 118000],
  [122000, 126000],
  [130000, 134000],
  [138000, 142000],
  [146000, 150000],
  [155000, 160000],
  [165000, 170000],
  [175000, 180000],
  [185000, 190000],
  [195000, 200000],
  [210000, 220000],
  [230000, 240000],
  [250000, 260000],
  [270000, 280000],
  [290000, 300000],
  [310000, 320000],
  [330000, 340000],
  [350000, 360000],
  [370000, 380000],
  [395000, 410000],
  [425000, 440000],
  [455000, 470000],
  [485000, 500000],
  [515000, 530000],
  [545000, 560000],
  [575000, 590000],
  [605000, 620000],
  [635000, 650000],
];

function getStandardMonthly(monthlyIncome: number): number {
  let grade = HOKEN_GRADES[0][1];
  for (const [lower, standard] of HOKEN_GRADES) {
    if (monthlyIncome >= lower) {
      grade = standard;
    } else {
      break;
    }
  }
  return grade;
}

function formatJPY(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

type InsuranceType = "kenpo" | "kokuho";
type Category = "second" | "first"; // 第2号: 40-64歳, 第1号: 65歳以上

interface ResultCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: "blue" | "green" | "orange" | "default";
}

function ResultCard({ label, value, sub, highlight = "default" }: ResultCardProps) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    orange: "bg-orange-50 border-orange-200",
    default: "bg-gray-50 border-gray-200",
  };
  const textColors: Record<string, string> = {
    blue: "text-blue-700",
    green: "text-green-700",
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

export default function KaigoHoken() {
  const [age, setAge] = useState("50");
  const [monthlyIncome, setMonthlyIncome] = useState("30");
  const [insuranceType, setInsuranceType] = useState<InsuranceType>("kenpo");

  const category: Category = useMemo(() => {
    const a = parseInt(age, 10);
    return a >= 65 ? "first" : "second";
  }, [age]);

  const result = useMemo(() => {
    const monthly = parseFloat(monthlyIncome) * 10000;
    if (isNaN(monthly) || monthly <= 0) return null;

    const a = parseInt(age, 10);
    if (isNaN(a) || a < 40) return null;

    if (insuranceType === "kenpo") {
      // 協会けんぽ: 標準報酬月額 × 料率 ÷ 2（労使折半）
      const standard = getStandardMonthly(monthly);
      const totalMonthly = Math.floor(standard * KENPO_RATE);
      // 1円未満切捨て、50銭以上切上げの実務があるが簡略化
      const employeeMonthly = Math.floor(totalMonthly / 2);
      const employerMonthly = totalMonthly - employeeMonthly;
      const employeeYearly = employeeMonthly * 12;
      const employerYearly = employerMonthly * 12;
      const totalYearly = totalMonthly * 12;

      return {
        type: "kenpo" as const,
        standard,
        employeeMonthly,
        employerMonthly,
        totalMonthly,
        employeeYearly,
        employerYearly,
        totalYearly,
        rate: KENPO_RATE * 100,
      };
    } else {
      // 国保: 所得割 + 均等割（全国平均）
      // 所得割の基準: 前年所得 = 月収 × 12 - 基礎控除43万円
      const annualIncome = monthly * 12;
      const baseDeduction = 430000;
      const taxableIncome = Math.max(annualIncome - baseDeduction, 0);
      const shotokuMonthly = Math.floor((taxableIncome * KOKUHO_SHOTOKU_RATE) / 12);
      const kintouMonthly = KOKUHO_KINTOU_MONTHLY;
      const totalMonthly = shotokuMonthly + kintouMonthly;
      const totalYearly = totalMonthly * 12;

      return {
        type: "kokuho" as const,
        annualIncome,
        taxableIncome,
        shotokuMonthly,
        kintouMonthly,
        totalMonthly,
        totalYearly,
        shotokuRate: KOKUHO_SHOTOKU_RATE * 100,
      };
    }
  }, [age, monthlyIncome, insuranceType]);

  return (
    <div className="space-y-5">
      {/* 入力パネル */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-5">
        <h2 className="text-base font-semibold text-gray-800">介護保険料を計算する</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 年齢 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              年齢（40歳以上）
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="40"
                max="100"
                step="1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="50"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-xs text-gray-500 whitespace-nowrap">歳</span>
            </div>
          </div>

          {/* 月収 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              月収（額面）
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="1"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="30"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-xs text-gray-500 whitespace-nowrap">万円</span>
            </div>
          </div>

          {/* 保険種別 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              加入保険
            </label>
            <select
              value={insuranceType}
              onChange={(e) => setInsuranceType(e.target.value as InsuranceType)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="kenpo">協会けんぽ（会社員）</option>
              <option value="kokuho">国民健康保険（自営業・無職）</option>
            </select>
          </div>
        </div>

        {/* 被保険者区分バッジ */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              category === "second"
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {category === "second"
              ? "第2号被保険者（40〜64歳）"
              : "第1号被保険者（65歳以上）"}
          </span>
          <span className="text-xs text-gray-400">
            {category === "second"
              ? "特定疾病に限り給付対象"
              : "要支援・要介護で給付対象"}
          </span>
        </div>

        {/* 結果 */}
        {result === null ? (
          <div className="rounded-xl border border-dashed border-gray-300 px-5 py-6 text-center text-sm text-gray-400">
            年齢（40歳以上）と月収を入力してください
          </div>
        ) : result.type === "kenpo" ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <ResultCard
                label="本人負担（月額）"
                value={`¥${formatJPY(result.employeeMonthly)}`}
                sub={`標準報酬月額 ¥${formatJPY(result.standard)} × ${(KENPO_RATE / 2 * 100).toFixed(3)}%`}
                highlight="blue"
              />
              <ResultCard
                label="本人負担（年額）"
                value={`¥${formatJPY(result.employeeYearly)}`}
                sub="月額 × 12ヶ月"
                highlight="green"
              />
              <ResultCard
                label="会社負担（月額）"
                value={`¥${formatJPY(result.employerMonthly)}`}
                sub="労使折半"
                highlight="default"
              />
            </div>

            {/* 労使折半 内訳 */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                労使折半 内訳
              </p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">本人負担</p>
                  <p className="font-bold text-blue-700">¥{formatJPY(result.employeeMonthly)}/月</p>
                  <p className="text-xs text-gray-400">¥{formatJPY(result.employeeYearly)}/年</p>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-gray-300 text-2xl">＋</span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">会社負担</p>
                  <p className="font-bold text-gray-700">¥{formatJPY(result.employerMonthly)}/月</p>
                  <p className="text-xs text-gray-400">¥{formatJPY(result.employerYearly)}/年</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 text-center">
                <p className="text-xs text-gray-500 mb-0.5">合計（労使合計）</p>
                <p className="font-bold text-gray-800">
                  ¥{formatJPY(result.totalMonthly)}/月 ／ ¥{formatJPY(result.totalYearly)}/年
                </p>
              </div>
            </div>

            {/* 計算式 */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-1.5 text-sm text-gray-600">
              <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">計算式（協会けんぽ）</p>
              <p>標準報酬月額 = ¥{formatJPY(result.standard)}（月収 ¥{formatJPY(parseFloat(monthlyIncome) * 10000)} の等級）</p>
              <p>月額保険料 = 標準報酬月額 × {result.rate.toFixed(2)}%</p>
              <p>本人負担 = 月額保険料 ÷ 2（労使折半）</p>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <ResultCard
                label="介護分 月額"
                value={`¥${formatJPY(result.totalMonthly)}`}
                sub="所得割 + 均等割"
                highlight="blue"
              />
              <ResultCard
                label="介護分 年額"
                value={`¥${formatJPY(result.totalYearly)}`}
                sub="月額 × 12ヶ月"
                highlight="green"
              />
              <ResultCard
                label="うち均等割（月）"
                value={`¥${formatJPY(result.kintouMonthly)}`}
                sub="全国平均・一人あたり"
                highlight="default"
              />
            </div>

            {/* 内訳 */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                内訳
              </p>
              <div className="space-y-1.5 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">所得割</span>
                  <span className="font-semibold">¥{formatJPY(result.shotokuMonthly)}/月</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">均等割（全国平均）</span>
                  <span className="font-semibold">¥{formatJPY(result.kintouMonthly)}/月</span>
                </div>
                <div className="border-t border-gray-200 pt-1.5 flex justify-between font-bold">
                  <span>合計</span>
                  <span>¥{formatJPY(result.totalMonthly)}/月</span>
                </div>
              </div>
            </div>

            {/* 計算式 */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-1.5 text-sm text-gray-600">
              <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">計算式（国保・全国平均）</p>
              <p>年収 = 月収 × 12 = ¥{formatJPY(result.annualIncome)}</p>
              <p>賦課基準額 = 年収 − 基礎控除43万円 = ¥{formatJPY(result.taxableIncome)}</p>
              <p>所得割（年） = 賦課基準額 × {result.shotokuRate.toFixed(2)}%</p>
              <p>均等割（年） = ¥{formatJPY(result.kintouMonthly * 12)}（全国平均）</p>
            </div>
          </>
        )}
      </div>

      {/* 注意書き */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 space-y-1.5 text-sm text-amber-800">
        <p className="font-semibold text-xs uppercase tracking-wide">免責事項</p>
        <ul className="space-y-1 text-xs list-disc list-inside text-amber-700">
          <li>協会けんぽの料率は2024年度（1.60%）を使用しています。都道府県・年度により異なります。</li>
          <li>国保の均等割・所得割は全国平均の概算値です。実際の保険料は市区町村により大幅に異なります。</li>
          <li>65歳以上（第1号被保険者）の介護保険料は、原則として市区町村が年金から天引き（特別徴収）します。</li>
          <li>本ツールの計算結果は参考値です。正確な保険料は加入保険者・市区町村にお問い合わせください。</li>
        </ul>
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
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この介護保険料 計算（40歳以上）ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">年収・地域から介護保険料を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この介護保険料 計算（40歳以上）ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "年収・地域から介護保険料を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
