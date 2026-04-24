"use client";

import { useState, useMemo } from "react";

type BillingCycle = "annual" | "monthly";

type Plan = {
  id: string;
  name: string;
  editorPriceMonthly: number | null;
  viewerPrice: number;
  maxEditors: number | null;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    editorPriceMonthly: 0,
    viewerPrice: 0,
    maxEditors: 2,
    description: "最大2編集者まで無料",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-300",
  },
  {
    id: "professional",
    name: "Professional",
    editorPriceMonthly: 15,
    viewerPrice: 0,
    maxEditors: null,
    description: "編集者数無制限、閲覧者無料",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  {
    id: "organization",
    name: "Organization",
    editorPriceMonthly: 45,
    viewerPrice: 0,
    maxEditors: null,
    description: "SSO・高度な管理機能付き",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    editorPriceMonthly: null,
    viewerPrice: 0,
    maxEditors: null,
    description: "カスタム価格・要問い合わせ",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
  },
];

function formatCurrency(
  usd: number,
  rate: number,
  showJpy: boolean
): string {
  if (showJpy) {
    return `¥${Math.round(usd * rate).toLocaleString()}`;
  }
  return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function FigmaSeatsCalculator() {
  const [editors, setEditors] = useState(5);
  const [viewers, setViewers] = useState(10);
  const [billing, setBilling] = useState<BillingCycle>("annual");
  const [usdJpy, setUsdJpy] = useState(150);
  const [showJpy, setShowJpy] = useState(true);

  const results = useMemo(() => {
    return PLANS.map((plan) => {
      if (plan.editorPriceMonthly === null) {
        return { plan, monthlyUsd: null, annualUsd: null, applicable: true };
      }

      const effectiveEditors =
        plan.maxEditors !== null ? Math.min(editors, plan.maxEditors) : editors;
      const billedEditors =
        plan.id === "starter"
          ? effectiveEditors <= 2
            ? 0
            : null
          : effectiveEditors;

      if (billedEditors === null) {
        return { plan, monthlyUsd: null, annualUsd: null, applicable: false };
      }

      const monthlyUsd = billedEditors * plan.editorPriceMonthly;
      const annualUsd =
        billing === "annual" ? monthlyUsd * 12 : monthlyUsd * 12 * 1.2;

      return { plan, monthlyUsd, annualUsd, applicable: true };
    });
  }, [editors, viewers, billing, usdJpy]);

  const recommendedPlan = useMemo(() => {
    if (editors <= 2) return "starter";
    if (editors < 3) return "professional";
    return "professional";
  }, [editors]);

  // Break-even: at what editor count does Org become cheaper than Pro?
  // Pro cost = editors * 15 * 12
  // Org cost = editors * 45 * 12
  // Org is always more expensive per editor — break-even doesn't apply on pure per-seat
  // However, if Org has flat fee or volume discount, it can cross over.
  // For Figma: Org is $45/editor vs Pro $15/editor — Org never cheaper on pure seat cost.
  // Instead, we show: at what editor count does the per-person cost make Org "worth it"
  // for the governance features. We chart annual cost for both plans 1..50.
  const breakEvenData = useMemo(() => {
    const data: Array<{
      count: number;
      proAnnual: number;
      orgAnnual: number;
    }> = [];
    for (let n = 1; n <= 50; n++) {
      const proAnnual = n * 15 * (billing === "annual" ? 12 : 14.4);
      const orgAnnual = n * 45 * (billing === "annual" ? 12 : 14.4);
      data.push({ count: n, proAnnual, orgAnnual });
    }
    return data;
  }, [billing]);

  const currentResult = results.find((r) => r.plan.id === "professional");
  const maxAnnual = Math.max(
    ...breakEvenData.map((d) => d.orgAnnual)
  );

  const chartWidth = 480;
  const chartHeight = 200;
  const paddingLeft = 60;
  const paddingBottom = 30;
  const paddingTop = 10;
  const paddingRight = 10;
  const innerW = chartWidth - paddingLeft - paddingRight;
  const innerH = chartHeight - paddingBottom - paddingTop;

  const toX = (count: number) =>
    paddingLeft + ((count - 1) / 49) * innerW;
  const toY = (val: number) =>
    paddingTop + innerH - (val / maxAnnual) * innerH;

  const proPath = breakEvenData
    .map((d, i) =>
      `${i === 0 ? "M" : "L"}${toX(d.count).toFixed(1)},${toY(d.proAnnual).toFixed(1)}`
    )
    .join(" ");

  const orgPath = breakEvenData
    .map((d, i) =>
      `${i === 0 ? "M" : "L"}${toX(d.count).toFixed(1)},${toY(d.orgAnnual).toFixed(1)}`
    )
    .join(" ");

  const currentEditorX = toX(Math.min(editors, 50));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Figma 料金計算ツール
          </h1>
          <p className="mt-1 text-gray-500 text-sm">
            編集者・閲覧者シート数を入力してプラン別コストを比較
          </p>
        </div>

        {/* Ad placeholder */}
        <div className="w-full h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-300">
          広告
        </div>

        {/* Inputs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">シート数と設定</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                編集者数
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={editors}
                onChange={(e) =>
                  setEditors(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Figmaファイルを編集できるメンバー
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                閲覧者数
              </label>
              <input
                type="number"
                min={0}
                max={10000}
                value={viewers}
                onChange={(e) =>
                  setViewers(Math.max(0, parseInt(e.target.value) || 0))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                全プランで閲覧者は無料
              </p>
            </div>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">請求サイクル:</span>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setBilling("annual")}
                className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                  billing === "annual"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                年払い
              </button>
              <button
                onClick={() => setBilling("monthly")}
                className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                  billing === "monthly"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                月払い (+20%)
              </button>
            </div>
          </div>

          {/* Currency */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">表示:</span>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setShowJpy(false)}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    !showJpy
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  USD
                </button>
                <button
                  onClick={() => setShowJpy(true)}
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                    showJpy
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  JPY
                </button>
              </div>
            </div>
            {showJpy && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">1USD =</span>
                <input
                  type="number"
                  min={100}
                  max={300}
                  value={usdJpy}
                  onChange={(e) =>
                    setUsdJpy(Math.max(1, parseInt(e.target.value) || 150))
                  }
                  className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">円</span>
              </div>
            )}
          </div>
        </div>

        {/* Plan comparison table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">プラン比較</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">
                    プラン
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-gray-600">
                    月額/編集者
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-gray-600">
                    月額合計
                  </th>
                  <th className="text-right py-2 pl-4 font-medium text-gray-600">
                    年額合計
                  </th>
                  <th className="text-right py-2 pl-4 font-medium text-gray-600">
                    1人あたり年額
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map(({ plan, monthlyUsd, annualUsd, applicable }) => {
                  const isRecommended = plan.id === recommendedPlan;
                  const notApplicable =
                    !applicable ||
                    (plan.id === "starter" && editors > 2);

                  return (
                    <tr
                      key={plan.id}
                      className={`${
                        isRecommended ? "bg-blue-50" : ""
                      } ${notApplicable ? "opacity-40" : ""}`}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${plan.color}`}
                          >
                            {plan.name}
                          </span>
                          {isRecommended && (
                            <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">
                              おすすめ
                            </span>
                          )}
                          {notApplicable && plan.id === "starter" && (
                            <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                              編集者3名以上は不可
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {plan.description}
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 font-mono text-gray-700">
                        {plan.editorPriceMonthly === null
                          ? "要問合"
                          : plan.editorPriceMonthly === 0
                          ? "無料"
                          : formatCurrency(
                              plan.editorPriceMonthly,
                              usdJpy,
                              showJpy
                            )}
                      </td>
                      <td className="text-right py-3 px-4 font-mono text-gray-700">
                        {monthlyUsd === null
                          ? "—"
                          : formatCurrency(monthlyUsd, usdJpy, showJpy)}
                      </td>
                      <td className="text-right py-3 pl-4 font-mono font-semibold text-gray-900">
                        {annualUsd === null
                          ? "—"
                          : formatCurrency(annualUsd, usdJpy, showJpy)}
                      </td>
                      <td className="text-right py-3 pl-4 font-mono text-gray-500">
                        {annualUsd === null || monthlyUsd === null
                          ? "—"
                          : editors === 0
                          ? "—"
                          : formatCurrency(
                              annualUsd / editors,
                              usdJpy,
                              showJpy
                            )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {viewers > 0 && (
            <p className="text-xs text-gray-400 mt-3">
              * 閲覧者 {viewers} 名はすべてのプランで無料です。
            </p>
          )}
        </div>

        {/* Recommended plan highlight */}
        <div className="bg-blue-600 text-white rounded-xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-sm font-medium opacity-80">
                あなたへのおすすめ
              </div>
              <div className="text-xl font-bold mt-0.5">
                {editors <= 2 ? "Starter（無料）" : "Professional プラン"}
              </div>
              <div className="text-sm opacity-80 mt-1">
                {editors <= 2
                  ? `編集者${editors}名・閲覧者${viewers}名まで完全無料`
                  : `編集者${editors}名で年額 ${
                      (() => {
                        const r = results.find((x) => x.plan.id === "professional");
                        if (!r || r.annualUsd === null) return "—";
                        return formatCurrency(r.annualUsd, usdJpy, showJpy);
                      })()
                    }`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {editors <= 2
                  ? "¥0"
                  : (() => {
                      const r = results.find((x) => x.plan.id === "professional");
                      if (!r || r.annualUsd === null) return "—";
                      return formatCurrency(r.annualUsd, usdJpy, showJpy);
                    })()}
              </div>
              <div className="text-sm opacity-70">
                {billing === "annual" ? "年払い" : "月払い×12ヶ月"}
              </div>
            </div>
          </div>
        </div>

        {/* Break-even chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-1">
            Pro vs Organization: 編集者数別コスト比較
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Organizationプランは常にProより高額（3倍）。ガバナンス機能が必要かで判断してください。
          </p>

          <div className="overflow-x-auto">
            <svg
              width={chartWidth}
              height={chartHeight}
              className="block"
              style={{ minWidth: 300 }}
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                const y = paddingTop + innerH * (1 - fraction);
                const label = Math.round(maxAnnual * fraction);
                return (
                  <g key={fraction}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth={1}
                    />
                    <text
                      x={paddingLeft - 4}
                      y={y + 4}
                      textAnchor="end"
                      fontSize={10}
                      fill="#9ca3af"
                    >
                      {showJpy
                        ? `¥${Math.round(label * usdJpy / 1000)}k`
                        : `$${Math.round(label / 100) * 100}`}
                    </text>
                  </g>
                );
              })}

              {/* X axis labels */}
              {[1, 10, 20, 30, 40, 50].map((n) => (
                <text
                  key={n}
                  x={toX(n)}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#9ca3af"
                >
                  {n}
                </text>
              ))}

              {/* Lines */}
              <path
                d={proPath}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <path
                d={orgPath}
                fill="none"
                stroke="#a855f7"
                strokeWidth={2}
              />

              {/* Current editor count marker */}
              {editors <= 50 && (
                <g>
                  <line
                    x1={currentEditorX}
                    y1={paddingTop}
                    x2={currentEditorX}
                    y2={chartHeight - paddingBottom}
                    stroke="#f97316"
                    strokeWidth={1.5}
                    strokeDasharray="4,3"
                  />
                  <text
                    x={currentEditorX + 3}
                    y={paddingTop + 12}
                    fontSize={10}
                    fill="#f97316"
                  >
                    現在({editors}名)
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-blue-500 rounded" />
              <span className="text-xs text-gray-600">Professional ($15/編集者)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-purple-500 rounded" />
              <span className="text-xs text-gray-600">Organization ($45/編集者)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-orange-500 rounded" style={{ borderStyle: "dashed" }} />
              <span className="text-xs text-gray-600">現在の設定</span>
            </div>
          </div>
        </div>

        {/* Plan feature summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">プラン機能比較</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">機能</th>
                  <th className="text-center py-2 px-3 font-medium text-gray-500">Starter</th>
                  <th className="text-center py-2 px-3 font-medium text-blue-600">Professional</th>
                  <th className="text-center py-2 px-3 font-medium text-purple-600">Organization</th>
                  <th className="text-center py-2 pl-3 font-medium text-orange-600">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {[
                  ["編集者数", "2名まで", "無制限", "無制限", "無制限"],
                  ["閲覧者数", "無制限", "無制限", "無制限", "無制限"],
                  ["プロジェクト数", "3まで", "無制限", "無制限", "無制限"],
                  ["バージョン履歴", "30日", "無制限", "無制限", "無制限"],
                  ["SSO / SAML", "✗", "✗", "✓", "✓"],
                  ["高度な権限管理", "✗", "✗", "✓", "✓"],
                  ["監査ログ", "✗", "✗", "✗", "✓"],
                  ["専任サポート", "✗", "✗", "✗", "✓"],
                ].map(([feature, ...values]) => (
                  <tr key={feature}>
                    <td className="py-2.5 pr-4 font-medium text-gray-600">{feature}</td>
                    {values.map((v, i) => (
                      <td key={i} className="text-center py-2.5 px-3">
                        <span
                          className={
                            v === "✓"
                              ? "text-green-600 font-bold"
                              : v === "✗"
                              ? "text-gray-300"
                              : "text-gray-700"
                          }
                        >
                          {v}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ad placeholder bottom */}
        <div className="w-full h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm border border-dashed border-gray-300">
          広告
        </div>

        <p className="text-center text-xs text-gray-400">
          料金は公式サイト掲載のUSD価格を参照。為替レートは概算です。最新情報は{" "}
          <a
            href="https://www.figma.com/pricing/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            figma.com/pricing
          </a>{" "}
          でご確認ください。
        </p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このFigma / FigJam 座席料金計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">編集者/閲覧者のシート数別年額試算、組織プランの損益分岐点。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このFigma / FigJam 座席料金計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "編集者/閲覧者のシート数別年額試算、組織プランの損益分岐点。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Figma / FigJam 座席料金計算",
  "description": "編集者/閲覧者のシート数別年額試算、組織プランの損益分岐点",
  "url": "https://tools.loresync.dev/figma-seats-calculator",
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
