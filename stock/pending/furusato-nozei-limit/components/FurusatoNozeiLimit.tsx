"use client";

import { useState, useMemo } from "react";

function fmt(n: number) {
  return Math.round(n).toLocaleString("ja-JP");
}

// 所得税率テーブル
function getIncomeTaxRate(taxableIncome: number): { rate: number; deduction: number } {
  if (taxableIncome <= 1950000) return { rate: 0.05, deduction: 0 };
  if (taxableIncome <= 3300000) return { rate: 0.10, deduction: 97500 };
  if (taxableIncome <= 6950000) return { rate: 0.20, deduction: 427500 };
  if (taxableIncome <= 9000000) return { rate: 0.23, deduction: 636000 };
  if (taxableIncome <= 18000000) return { rate: 0.33, deduction: 1536000 };
  if (taxableIncome <= 40000000) return { rate: 0.40, deduction: 2796000 };
  return { rate: 0.45, deduction: 4796000 };
}

export default function FurusatoNozeiLimit() {
  const [businessIncome, setBusinessIncome] = useState("5000000");
  const [blueDeduction, setBlueDeduction] = useState("650000");
  const [hasBlue, setHasBlue] = useState(true);
  const [otherIncome, setOtherIncome] = useState("0");
  const [socialInsurance, setSocialInsurance] = useState("700000");
  const [dependents, setDependents] = useState("0");
  const [hasSpouse, setHasSpouse] = useState(false);

  const result = useMemo(() => {
    const biz = parseFloat(businessIncome) || 0;
    const blue = hasBlue ? parseFloat(blueDeduction) || 0 : 0;
    const other = parseFloat(otherIncome) || 0;
    const si = parseFloat(socialInsurance) || 0;
    const dep = parseInt(dependents) || 0;

    // 総所得金額
    const totalIncome = biz - blue + other;

    // 基礎控除
    const basicDeduction = totalIncome <= 24000000 ? 480000 : totalIncome <= 24500000 ? 320000 : totalIncome <= 25000000 ? 160000 : 0;

    // 扶養控除（一般扶養 38万円 × 人数）
    const dependentDeduction = dep * 380000;

    // 配偶者控除（簡略化: 38万円）
    const spouseDeduction = hasSpouse ? 380000 : 0;

    // 課税所得
    const taxableIncome = Math.max(0, totalIncome - si - basicDeduction - dependentDeduction - spouseDeduction);

    // 所得税
    const { rate: taxRate, deduction: taxDeduction } = getIncomeTaxRate(taxableIncome);
    const incomeTax = Math.max(0, taxableIncome * taxRate - taxDeduction);
    const incomeTaxWithSurtax = incomeTax * 1.021; // 復興税

    // 住民税所得割（簡略計算）
    const residenceTax = Math.max(0, taxableIncome * 0.10);

    // ふるさと納税控除上限の計算式
    // 上限 = (住民税所得割額 × 0.2) / (0.9 - 所得税率 × 1.021) + 2000
    const denominator = 0.9 - taxRate * 1.021;
    const furusatoLimit = denominator > 0
      ? Math.floor((residenceTax * 0.2) / denominator) + 2000
      : 0;

    // 実質負担額2000円を考慮した最終的な寄附推奨額
    const recommendedDonation = furusatoLimit;

    return {
      totalIncome,
      taxableIncome,
      incomeTax: incomeTaxWithSurtax,
      residenceTax,
      taxRate,
      furusatoLimit,
      recommendedDonation,
      basicDeduction,
      dependentDeduction,
      spouseDeduction,
    };
  }, [businessIncome, blueDeduction, hasBlue, otherIncome, socialInsurance, dependents, hasSpouse]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">収入・控除を入力</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">事業所得（青色控除前）<span className="text-gray-400 text-xs ml-1">円</span></label>
            <input type="number" value={businessIncome} onChange={(e) => setBusinessIncome(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="5000000" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">その他所得（給与・不動産等）<span className="text-gray-400 text-xs ml-1">円</span></label>
            <input type="number" value={otherIncome} onChange={(e) => setOtherIncome(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">社会保険料控除<span className="text-gray-400 text-xs ml-1">円</span></label>
            <input type="number" value={socialInsurance} onChange={(e) => setSocialInsurance(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="700000" />
            <p className="text-xs text-gray-400 mt-1">国民健康保険＋国民年金の合計</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">青色申告特別控除</label>
            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox" id="hasBlue" checked={hasBlue} onChange={(e) => setHasBlue(e.target.checked)} className="rounded" />
              <label htmlFor="hasBlue" className="text-sm text-gray-600">青色申告を利用している</label>
            </div>
            {hasBlue && (
              <select value={blueDeduction} onChange={(e) => setBlueDeduction(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="650000">65万円（電子申告・複式簿記）</option>
                <option value="550000">55万円（複式簿記のみ）</option>
                <option value="100000">10万円（簡易簿記）</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">扶養家族数（16歳以上）</label>
            <select value={dependents} onChange={(e) => setDependents(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}人</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="spouse" checked={hasSpouse} onChange={(e) => setHasSpouse(e.target.checked)} className="rounded" />
            <label htmlFor="spouse" className="text-sm font-medium text-gray-700">配偶者控除あり（配偶者所得48万円以下）</label>
          </div>
        </div>
      </div>

      {/* 結果 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">計算結果</h2>

        {/* 上限額メイン表示 */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center mb-6">
          <p className="text-sm text-orange-600 font-medium mb-1">ふるさと納税 控除上限額（目安）</p>
          <p className="text-5xl font-bold text-orange-700 mb-2">
            {fmt(result.furusatoLimit)} <span className="text-2xl font-normal">円</span>
          </p>
          <p className="text-xs text-orange-500">この金額まで寄附すると実質負担2,000円で全額控除されます</p>
        </div>

        {/* 内訳 */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">総所得金額</span>
            <span className="font-medium">{fmt(result.totalIncome)} 円</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">課税所得</span>
            <span className="font-medium">{fmt(result.taxableIncome)} 円</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">所得税率（限界税率）</span>
            <span className="font-medium">{(result.taxRate * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">住民税所得割（概算）</span>
            <span className="font-medium">{fmt(result.residenceTax)} 円</span>
          </div>
        </div>
      </div>

      {/* 目安表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">事業所得別 目安表（青色65万控除・独身・社保70万）</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 text-gray-600 font-medium">事業所得（青色前）</th>
                <th className="text-right px-3 py-2 text-gray-600 font-medium">控除上限目安</th>
              </tr>
            </thead>
            <tbody>
              {[
                { income: 3000000, limit: 18000 },
                { income: 4000000, limit: 35000 },
                { income: 5000000, limit: 61000 },
                { income: 6000000, limit: 77000 },
                { income: 7000000, limit: 109000 },
                { income: 8000000, limit: 129000 },
                { income: 10000000, limit: 180000 },
                { income: 15000000, limit: 389000 },
              ].map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2 text-gray-700">{fmt(row.income)} 円</td>
                  <td className="px-3 py-2 text-right font-medium text-orange-700">{fmt(row.limit)} 円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        <p className="font-semibold mb-1">注意事項</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>この計算は概算です。実際の上限額は個人の控除状況により異なります</li>
          <li>ワンストップ特例制度はフリーランスには適用できません（確定申告が必要）</li>
          <li>寄附先が6自治体以上になるとワンストップ利用不可</li>
        </ul>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このふるさと納税控除上限（フリーランス版）ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">事業所得ベースでふるさと納税の控除上限額を試算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このふるさと納税控除上限（フリーランス版）ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "事業所得ベースでふるさと納税の控除上限額を試算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
