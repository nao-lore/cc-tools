"use client";

import { useState, useMemo } from "react";

// 協会けんぽ 健康保険料率（令和6年度、労使折半前の全体料率）
// 介護保険第2号被保険者（40-64歳）含む場合は介護保険料率が加算される
const KENPO_RATES: { label: string; value: string; rate: number }[] = [
  { label: "全国平均", value: "avg", rate: 0.1000 },
  { label: "東京都", value: "tokyo", rate: 0.0998 },
  { label: "大阪府", value: "osaka", rate: 0.1032 },
  { label: "愛知県", value: "aichi", rate: 0.1000 },
  { label: "神奈川県", value: "kanagawa", rate: 0.1002 },
  { label: "北海道", value: "hokkaido", rate: 0.1063 },
  { label: "福岡県", value: "fukuoka", rate: 0.1065 },
];

// 介護保険料率（令和6年度）- 全体料率
const KAIGO_RATE = 0.0182;

// 厚生年金保険料率（全体）
const KOSEI_NENKIN_RATE = 0.183;
// 厚生年金の上限標準報酬月額（令和6年度）
const NENKIN_MONTHLY_CAP = 650000;

// 雇用保険料率（一般の事業、労働者負担分）
const KOYO_RATE = 0.006;

// 所得税の簡易計算（月収ベース、給与所得控除後の簡易近似）
function calcIncomeTax(monthlyIncome: number): number {
  // 給与所得控除の簡易近似（年収ベース → 月割り）
  const annual = monthlyIncome * 12;
  let kyuyoShotoku: number;
  if (annual <= 1_625_000) {
    kyuyoShotoku = 550_000;
  } else if (annual <= 1_800_000) {
    kyuyoShotoku = annual * 0.4 - 100_000;
  } else if (annual <= 3_600_000) {
    kyuyoShotoku = annual * 0.3 + 80_000;
  } else if (annual <= 6_600_000) {
    kyuyoShotoku = annual * 0.2 + 440_000;
  } else if (annual <= 8_500_000) {
    kyuyoShotoku = annual * 0.1 + 1_100_000;
  } else {
    kyuyoShotoku = 1_950_000;
  }
  // 基礎控除（48万円）のみ適用した簡易計算
  const taxableAnnual = Math.max(0, kyuyoShotoku - 480_000);
  let annualTax: number;
  if (taxableAnnual <= 1_950_000) {
    annualTax = taxableAnnual * 0.05;
  } else if (taxableAnnual <= 3_300_000) {
    annualTax = taxableAnnual * 0.1 - 97_500;
  } else if (taxableAnnual <= 6_950_000) {
    annualTax = taxableAnnual * 0.2 - 427_500;
  } else if (taxableAnnual <= 9_000_000) {
    annualTax = taxableAnnual * 0.23 - 636_000;
  } else if (taxableAnnual <= 18_000_000) {
    annualTax = taxableAnnual * 0.33 - 1_536_000;
  } else if (taxableAnnual <= 40_000_000) {
    annualTax = taxableAnnual * 0.4 - 2_796_000;
  } else {
    annualTax = taxableAnnual * 0.45 - 4_796_000;
  }
  // 復興特別所得税（2.1%加算）
  return Math.max(0, (annualTax * 1.021) / 12);
}

const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent pr-12";

const selectClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent";

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

function fmtRate(r: number): string {
  return (r * 100).toFixed(2) + "%";
}

export default function ShakaiHoken() {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [age, setAge] = useState("");
  const [prefecture, setPrefecture] = useState("avg");

  const result = useMemo(() => {
    const income = parseFloat(monthlyIncome.replace(/,/g, ""));
    const ageNum = parseInt(age, 10);
    if (!income || income <= 0 || !ageNum || ageNum <= 0) return null;

    const kenpoEntry = KENPO_RATES.find((r) => r.value === prefecture) ?? KENPO_RATES[0];
    const kenpoFullRate = kenpoEntry.rate;

    // 健康保険（労使折半、本人負担は半額）
    const kenpoRate = kenpoFullRate / 2;
    const kenpoAmount = income * kenpoRate;

    // 介護保険（40歳以上65歳未満）
    const needsKaigo = ageNum >= 40 && ageNum < 65;
    const kaigoRate = needsKaigo ? KAIGO_RATE / 2 : 0;
    const kaigoAmount = needsKaigo ? income * kaigoRate : 0;

    // 厚生年金（標準報酬月額に上限あり）
    const nenkinBase = Math.min(income, NENKIN_MONTHLY_CAP);
    const nenkinRate = KOSEI_NENKIN_RATE / 2;
    const nenkinAmount = nenkinBase * nenkinRate;

    // 雇用保険（労働者負担分）
    const koyoAmount = income * KOYO_RATE;

    // 所得税概算
    const incomeTax = calcIncomeTax(income);

    const totalShakai = kenpoAmount + kaigoAmount + nenkinAmount + koyoAmount;
    const totalDeductions = totalShakai + incomeTax;
    const takeHome = income - totalDeductions;

    return {
      income,
      kenpoRate,
      kenpoAmount,
      kenpoFullRate,
      needsKaigo,
      kaigoRate,
      kaigoAmount,
      nenkinRate,
      nenkinAmount,
      koyoAmount,
      incomeTax,
      totalShakai,
      totalDeductions,
      takeHome,
      prefecture: kenpoEntry.label,
    };
  }, [monthlyIncome, age, prefecture]);

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
        <h2 className="font-bold text-base mb-4">基本情報を入力</h2>

        {/* 月収 */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-1">月収（額面）</label>
          <div className="relative max-w-[240px]">
            <input
              type="text"
              inputMode="numeric"
              placeholder="300,000"
              value={monthlyIncome}
              onChange={(e) =>
                setMonthlyIncome(e.target.value.replace(/[^0-9,]/g, ""))
              }
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
              円
            </span>
          </div>
        </div>

        {/* 年齢 */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-1">
            年齢
            <span className="ml-1 text-muted font-normal">（介護保険の適用判定に使用）</span>
          </label>
          <div className="relative max-w-[120px]">
            <input
              type="text"
              inputMode="numeric"
              placeholder="35"
              value={age}
              onChange={(e) =>
                setAge(e.target.value.replace(/[^0-9]/g, ""))
              }
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
              歳
            </span>
          </div>
        </div>

        {/* 都道府県 */}
        <div>
          <label className="block text-xs text-muted mb-1">
            都道府県
            <span className="ml-1 text-muted font-normal">（協会けんぽ料率）</span>
          </label>
          <div className="max-w-[240px]">
            <select
              value={prefecture}
              onChange={(e) => setPrefecture(e.target.value)}
              className={selectClass}
            >
              {KENPO_RATES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}（{fmtRate(r.rate)}）
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Result card */}
      {result && (
        <>
          {/* 控除明細 */}
          <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
            <h3 className="font-bold text-sm mb-3">控除明細</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted font-medium">項目</th>
                    <th className="text-right py-2 text-muted font-medium">料率（本人）</th>
                    <th className="text-right py-2 text-muted font-medium">金額（月）</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2.5">
                      健康保険
                      <span className="ml-1 text-xs text-muted">（{result.prefecture}）</span>
                    </td>
                    <td className="text-right py-2.5 font-mono">{fmtRate(result.kenpoRate)}</td>
                    <td className="text-right py-2.5 font-mono font-medium">
                      ¥{fmt(result.kenpoAmount)}
                    </td>
                  </tr>
                  {result.needsKaigo && (
                    <tr>
                      <td className="py-2.5">
                        介護保険
                        <span className="ml-1 text-xs text-muted">（40〜64歳）</span>
                      </td>
                      <td className="text-right py-2.5 font-mono">{fmtRate(result.kaigoRate)}</td>
                      <td className="text-right py-2.5 font-mono font-medium">
                        ¥{fmt(result.kaigoAmount)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2.5">
                      厚生年金
                      {result.income > 650000 && (
                        <span className="ml-1 text-xs text-muted">（上限65万円適用）</span>
                      )}
                    </td>
                    <td className="text-right py-2.5 font-mono">{fmtRate(result.nenkinRate)}</td>
                    <td className="text-right py-2.5 font-mono font-medium">
                      ¥{fmt(result.nenkinAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5">雇用保険</td>
                    <td className="text-right py-2.5 font-mono">{fmtRate(KOYO_RATE)}</td>
                    <td className="text-right py-2.5 font-mono font-medium">
                      ¥{fmt(result.koyoAmount)}
                    </td>
                  </tr>
                  <tr className="border-t border-border/50">
                    <td className="py-2.5 text-muted text-xs" colSpan={2}>
                      社会保険料合計
                    </td>
                    <td className="text-right py-2.5 font-mono font-bold">
                      ¥{fmt(result.totalShakai)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5">
                      所得税
                      <span className="ml-1 text-xs text-muted">（概算・基礎控除のみ）</span>
                    </td>
                    <td className="text-right py-2.5 font-mono text-muted text-xs">—</td>
                    <td className="text-right py-2.5 font-mono font-medium">
                      ¥{fmt(result.incomeTax)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* サマリーカード */}
          <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-accent/30 rounded-xl p-3">
                <p className="text-xs text-muted mb-1">総控除額（月）</p>
                <p className="text-2xl font-bold text-red-500">
                  ¥{fmt(result.totalDeductions)}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  月収の{((result.totalDeductions / result.income) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-accent/30 rounded-xl p-3">
                <p className="text-xs text-muted mb-1">手取り概算（月）</p>
                <p className="text-2xl font-bold text-green-600">
                  ¥{fmt(result.takeHome)}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  年収換算 約¥{fmt(result.takeHome * 12)}
                </p>
              </div>
            </div>
          </div>

          {/* 注意書き */}
          <div className="bg-surface rounded-2xl border border-border p-4">
            <p className="text-xs text-muted leading-relaxed">
              ※ この計算はあくまで概算です。実際の保険料は標準報酬月額の等級・勤務先の健保組合・雇用形態等によって異なります。住民税（約10%）は含まれていません。所得税は基礎控除（48万円）のみを適用した簡易計算です。正確な金額は給与明細または社労士にご確認ください。
            </p>
          </div>
        </>
      )}

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center h-24 text-muted text-sm">
        広告
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この社会保険料 概算計算ツールツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">月収から社会保険料（健康保険・年金・雇用保険）の概算を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この社会保険料 概算計算ツールツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "月収から社会保険料（健康保険・年金・雇用保険）の概算を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
