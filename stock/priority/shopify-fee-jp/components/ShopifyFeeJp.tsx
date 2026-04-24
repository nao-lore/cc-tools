"use client";

import { useState, useMemo } from "react";

// --- プラン定数 ---
type PlanId = "basic" | "shopify" | "advanced";

type Plan = {
  id: PlanId;
  name: string;
  monthlyUSD: number;
  monthlyJPY: number;
  cardRate: number;         // Shopify Payments カード手数料率
  txRate: number;           // 外部決済トランザクション手数料率
  color: string;
  badge?: string;
};

// 為替レート（固定・表示用）
const USD_JPY = 150;

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "ベーシック",
    monthlyUSD: 39,
    monthlyJPY: 39 * USD_JPY,
    cardRate: 0.0355,   // 3.55%
    txRate: 0.02,        // 2%
    color: "emerald",
    badge: "スモールスタート",
  },
  {
    id: "shopify",
    name: "スタンダード",
    monthlyUSD: 105,
    monthlyJPY: 105 * USD_JPY,
    cardRate: 0.034,    // 3.4%
    txRate: 0.01,        // 1%
    color: "green",
    badge: "人気No.1",
  },
  {
    id: "advanced",
    name: "アドバンスド",
    monthlyUSD: 399,
    monthlyJPY: 399 * USD_JPY,
    cardRate: 0.0325,   // 3.25%
    txRate: 0.006,       // 0.6%
    color: "teal",
    badge: "大規模向け",
  },
];

// BASE / STORES 比較データ
type CompetitorRow = {
  name: string;
  monthlyFee: string;
  cardRate: string;
  txFee: string;
  notes: string;
};

const COMPETITORS: CompetitorRow[] = [
  { name: "Shopify Basic",    monthlyFee: "¥5,850/月",  cardRate: "3.55%", txFee: "2%（外部）",  notes: "海外販売・多機能" },
  { name: "Shopify Standard", monthlyFee: "¥15,750/月", cardRate: "3.40%", txFee: "1%（外部）",  notes: "ほとんどのビジネスに最適" },
  { name: "Shopify Advanced", monthlyFee: "¥59,850/月", cardRate: "3.25%", txFee: "0.6%（外部）", notes: "高売上・上級レポート" },
  { name: "BASE",             monthlyFee: "無料（スタンダード）", cardRate: "3.0%+¥40/件", txFee: "なし", notes: "サービス料3%別途。スモールスタート向け" },
  { name: "STORES",           monthlyFee: "無料 or ¥3,480/月", cardRate: "5.0%（無料）/ 3.6%（有料）", txFee: "なし", notes: "シンプル操作、国内特化" },
];

type Tab = "calc" | "breakdown" | "breakeven" | "compare";

function fmtJPY(n: number): string {
  return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

function fmtRate(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

function planColor(plan: Plan, type: "bg" | "ring" | "text" | "badge") {
  const map: Record<string, Record<string, string>> = {
    emerald: { bg: "bg-emerald-50", ring: "ring-emerald-400 border-emerald-300", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
    green:   { bg: "bg-green-50",   ring: "ring-green-400 border-green-300",     text: "text-green-700",   badge: "bg-green-100 text-green-700" },
    teal:    { bg: "bg-teal-50",     ring: "ring-teal-400 border-teal-300",       text: "text-teal-700",    badge: "bg-teal-100 text-teal-700" },
  };
  return map[plan.color][type];
}

export default function ShopifyFeeJp() {
  const [activeTab, setActiveTab] = useState<Tab>("calc");

  // 手数料計算タブ
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("shopify");
  const [monthlySales, setMonthlySales] = useState<number>(500000);
  const [useShopifyPayments, setUseShopifyPayments] = useState<boolean>(true);

  // 損益分岐タブ
  const [breakSales, setBreakSales] = useState<number>(1000000);

  const plan = PLANS.find((p) => p.id === selectedPlan)!;

  // --- 計算 ---
  const cardFee = useMemo(
    () => monthlySales * plan.cardRate,
    [monthlySales, plan]
  );
  const txFee = useMemo(
    () => (useShopifyPayments ? 0 : monthlySales * plan.txRate),
    [monthlySales, plan, useShopifyPayments]
  );
  const totalFee = useMemo(
    () => plan.monthlyJPY + cardFee + txFee,
    [plan.monthlyJPY, cardFee, txFee]
  );
  const netRevenue = useMemo(() => monthlySales - totalFee, [monthlySales, totalFee]);
  const effectiveRate = useMemo(
    () => (monthlySales > 0 ? totalFee / monthlySales : 0),
    [totalFee, monthlySales]
  );

  // 損益分岐：BasicよりStandardが有利になる売上
  // Basic月額 + Basic手数料 = Standard月額 + Standard手数料
  // 差額 = (Standard月額 - Basic月額) / (Basic手数料率 - Standard手数料率)
  const breakEvenBasicVsStandard = useMemo(() => {
    const basic = PLANS[0];
    const std = PLANS[1];
    const rateDiff = (useShopifyPayments ? basic.cardRate - std.cardRate : basic.txRate - std.txRate);
    if (rateDiff <= 0) return null;
    return (std.monthlyJPY - basic.monthlyJPY) / rateDiff;
  }, [useShopifyPayments]);

  const breakEvenStandardVsAdvanced = useMemo(() => {
    const std = PLANS[1];
    const adv = PLANS[2];
    const rateDiff = (useShopifyPayments ? std.cardRate - adv.cardRate : std.txRate - adv.txRate);
    if (rateDiff <= 0) return null;
    return (adv.monthlyJPY - std.monthlyJPY) / rateDiff;
  }, [useShopifyPayments]);

  // 3プランの月間総コスト比較（breakSalesベース）
  const planCosts = useMemo(() =>
    PLANS.map((p) => {
      const card = breakSales * p.cardRate;
      const tx = useShopifyPayments ? 0 : breakSales * p.txRate;
      return { plan: p, total: p.monthlyJPY + card + tx };
    }),
    [breakSales, useShopifyPayments]
  );
  const cheapestPlan = useMemo(() => {
    return planCosts.reduce((a, b) => (a.total < b.total ? a : b));
  }, [planCosts]);

  const TABS: { id: Tab; label: string }[] = [
    { id: "calc",      label: "手数料計算" },
    { id: "breakdown", label: "内訳詳細" },
    { id: "breakeven", label: "損益分岐" },
    { id: "compare",   label: "他社比較" },
  ];

  return (
    <div className="space-y-6">
      {/* タブ */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              activeTab === tab.id
                ? "bg-green-700 text-white border-green-700 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== 手数料計算 ===== */}
      {activeTab === "calc" && (
        <div className="space-y-5">
          {/* プラン選択 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">プランを選択</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedPlan === p.id
                      ? `${planColor(p, "bg")} ${planColor(p, "ring")} ring-2`
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {p.badge && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full mb-2 inline-block ${planColor(p, "badge")}`}>
                      {p.badge}
                    </span>
                  )}
                  <div className="font-bold text-gray-900 text-base">{p.name}</div>
                  <div className={`text-sm font-semibold mt-1 ${planColor(p, "text")}`}>
                    {fmtJPY(p.monthlyJPY)}<span className="text-xs font-normal text-gray-500">/月</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                    <div>カード手数料: {fmtRate(p.cardRate)}</div>
                    <div>外部決済TX: {fmtRate(p.txRate)}</div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">※ 月額は$1=¥{USD_JPY}換算。実際はドル建て請求です。</p>
          </div>

          {/* 売上入力 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">月間売上と決済設定</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">月間売上</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">¥</span>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={monthlySales}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v >= 0) setMonthlySales(v);
                    }}
                    className="w-52 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[100000, 300000, 500000, 1000000, 3000000, 5000000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setMonthlySales(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        monthlySales === preset
                          ? "bg-green-50 text-green-700 border-green-300"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {preset >= 1000000 ? `${preset / 10000}万` : `${(preset / 10000).toFixed(0)}万`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">決済方法</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setUseShopifyPayments(true)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      useShopifyPayments
                        ? "bg-green-50 border-green-400 ring-2 ring-green-400"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-semibold text-gray-900 text-sm">Shopify Payments</div>
                    <div className="text-xs text-green-700 font-medium mt-1">トランザクション手数料 0%</div>
                    <div className="text-xs text-gray-500 mt-1">カード手数料のみ発生</div>
                  </button>
                  <button
                    onClick={() => setUseShopifyPayments(false)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      !useShopifyPayments
                        ? "bg-amber-50 border-amber-400 ring-2 ring-amber-400"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-semibold text-gray-900 text-sm">外部決済（Stripe等）</div>
                    <div className="text-xs text-amber-700 font-medium mt-1">TX手数料 {fmtRate(plan.txRate)} 追加</div>
                    <div className="text-xs text-gray-500 mt-1">カード手数料は外部サービスに別途発生</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 結果 */}
          <div className="bg-gradient-to-br from-green-700 to-emerald-800 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-base font-semibold text-green-100 mb-4">月間コスト試算</h2>

            <div className="mb-5">
              <div className="text-green-200 text-xs mb-1">月間実収入（手数料・月額差し引き後）</div>
              <div className="text-5xl font-bold">{fmtJPY(netRevenue)}</div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
                <div className="text-green-200 text-xs mb-1">月間売上</div>
                <div className="font-bold text-lg">{fmtJPY(monthlySales)}</div>
              </div>
              <div className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
                <div className="text-green-200 text-xs mb-1">コスト合計</div>
                <div className="font-bold text-lg text-red-300">{fmtJPY(totalFee)}</div>
              </div>
              <div className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
                <div className="text-green-200 text-xs mb-1">実効コスト率</div>
                <div className="font-bold text-lg">{fmtRate(effectiveRate)}</div>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 rounded-xl p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span>月額プラン（{plan.name}）</span>
                <span>{fmtJPY(plan.monthlyJPY)}</span>
              </div>
              <div className="flex justify-between">
                <span>カード手数料（{fmtRate(plan.cardRate)} × {fmtJPY(monthlySales)}）</span>
                <span>{fmtJPY(cardFee)}</span>
              </div>
              {!useShopifyPayments && (
                <div className="flex justify-between">
                  <span>トランザクション手数料（{fmtRate(plan.txRate)} × {fmtJPY(monthlySales)}）</span>
                  <span className="text-red-300">{fmtJPY(txFee)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white border-opacity-20 pt-1.5 font-semibold">
                <span>合計コスト</span>
                <span>{fmtJPY(totalFee)}</span>
              </div>
            </div>

            {!useShopifyPayments && (
              <div className="mt-3 bg-amber-500 bg-opacity-30 rounded-lg px-3 py-2 text-xs text-amber-200">
                外部決済はカード手数料が別途かかります（Stripe: 3.6%等）。上記はShopifyのTX手数料のみです。
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== 内訳詳細 ===== */}
      {activeTab === "breakdown" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">プラン別 料金一覧</h2>
            <p className="text-xs text-gray-500 mb-5">$1=¥{USD_JPY}換算。Shopify Paymentsご利用時のカード手数料。</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-3 text-xs text-gray-500 font-medium">プラン</th>
                    <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">月額(USD)</th>
                    <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">月額(JPY目安)</th>
                    <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">カード手数料</th>
                    <th className="text-right py-2 text-xs text-gray-500 font-medium">外部決済TX</th>
                  </tr>
                </thead>
                <tbody>
                  {PLANS.map((p) => (
                    <tr key={p.id} className={`border-b border-gray-50 ${selectedPlan === p.id ? "bg-green-50" : ""}`}>
                      <td className="py-3 pr-3">
                        <span className={`font-semibold text-sm ${selectedPlan === p.id ? "text-green-700" : "text-gray-900"}`}>
                          {p.name}
                          {selectedPlan === p.id && <span className="ml-1.5 text-xs font-normal text-green-500">← 選択中</span>}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right text-gray-700">${p.monthlyUSD}</td>
                      <td className="py-3 pr-3 text-right text-gray-700">{fmtJPY(p.monthlyJPY)}</td>
                      <td className="py-3 pr-3 text-right text-gray-700">{fmtRate(p.cardRate)}</td>
                      <td className="py-3 text-right text-gray-700">{fmtRate(p.txRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              月額はドル建て請求のため、為替レートにより変動します。
            </p>
          </div>

          {/* Shopify Payments解説 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Shopify Payments とは</h2>
            <div className="space-y-3">
              {[
                { icon: "✅", title: "トランザクション手数料が0%", desc: "Shopify純正の決済機能を使うとTX手数料が発生しない。外部決済（Stripe等）を使うと2%/1%/0.6%が別途かかる。" },
                { icon: "💳", title: "カード手数料はプラン依存", desc: "Basic 3.55% / Standard 3.4% / Advanced 3.25%。売上が多いほど上位プランのメリットが大きい。" },
                { icon: "🔒", title: "日本では一部制限あり", desc: "Shopify Paymentsは2023年より日本でも利用可能。ただし対応カードや機能が海外版と異なる場合がある。" },
                { icon: "🏦", title: "外部決済との比較", desc: "Stripeを外部決済で使うと、Shopify TX手数料＋Stripeカード手数料（3.6%等）の二重コストが発生する。" },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="text-lg mt-0.5">{item.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== 損益分岐 ===== */}
      {activeTab === "breakeven" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">プランアップグレードの損益分岐</h2>
            <p className="text-xs text-gray-500 mb-5">月間売上がいくらを超えると上位プランが有利になるかを計算します。</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">決済方法</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setUseShopifyPayments(true)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    useShopifyPayments
                      ? "bg-green-50 border-green-400 text-green-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Shopify Payments
                </button>
                <button
                  onClick={() => setUseShopifyPayments(false)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    !useShopifyPayments
                      ? "bg-amber-50 border-amber-400 text-amber-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  外部決済
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="font-semibold text-gray-800 text-sm">ベーシック → スタンダード</span>
                </div>
                {breakEvenBasicVsStandard !== null ? (
                  <>
                    <div className="text-2xl font-bold text-green-700 mb-1">
                      {fmtJPY(breakEvenBasicVsStandard)}/月
                    </div>
                    <div className="text-xs text-gray-500">
                      この売上を超えるとスタンダードの月額増加分をカード手数料差額が上回ります。
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">計算できません</div>
                )}
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500 inline-block"></span>
                  <span className="font-semibold text-gray-800 text-sm">スタンダード → アドバンスド</span>
                </div>
                {breakEvenStandardVsAdvanced !== null ? (
                  <>
                    <div className="text-2xl font-bold text-teal-700 mb-1">
                      {fmtJPY(breakEvenStandardVsAdvanced)}/月
                    </div>
                    <div className="text-xs text-gray-500">
                      この売上を超えるとアドバンスドの月額増加分をカード手数料差額が上回ります。
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">計算できません</div>
                )}
              </div>
            </div>
          </div>

          {/* 売上別コスト比較 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">売上別プランコスト比較</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">月間売上</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">¥</span>
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={breakSales}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!isNaN(v) && v >= 0) setBreakSales(v);
                  }}
                  className="w-52 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {[300000, 500000, 1000000, 3000000, 5000000, 10000000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setBreakSales(preset)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      breakSales === preset
                        ? "bg-green-50 text-green-700 border-green-300"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {preset >= 1000000 ? `${preset / 10000}万` : `${preset / 10000}万`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {planCosts.map(({ plan: p, total }) => {
                const isCheapest = cheapestPlan.plan.id === p.id;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      isCheapest ? `${planColor(p, "bg")} ${planColor(p, "ring")} border-2 ring-2` : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div>
                      <span className={`font-semibold text-sm ${isCheapest ? planColor(p, "text") : "text-gray-700"}`}>
                        {p.name}
                      </span>
                      {isCheapest && (
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${planColor(p, "badge")}`}>
                          最安
                        </span>
                      )}
                    </div>
                    <div className={`font-bold text-base ${isCheapest ? planColor(p, "text") : "text-gray-700"}`}>
                      {fmtJPY(total)}<span className="text-xs font-normal text-gray-500">/月</span>
                    </div>
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このShopify 日本円手数料計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">Shopifyの日本向けプラン別月額・トランザクション手数料・決済手数料を統合計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このShopify 日本円手数料計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "Shopifyの日本向けプラン別月額・トランザクション手数料・決済手数料を統合計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              ※ 外部決済選択時はShopifyのTX手数料のみ加算。外部サービスのカード手数料は含みません。
            </p>
          </div>
        </div>
      )}

      {/* ===== 他社比較 ===== */}
      {activeTab === "compare" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">BASE / STORES との比較</h2>
            <p className="text-xs text-gray-500 mb-5">日本向けECプラットフォーム主要3サービスの料金比較</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-3 text-xs text-gray-500 font-medium">サービス</th>
                    <th className="text-left py-2 pr-3 text-xs text-gray-500 font-medium">月額</th>
                    <th className="text-left py-2 pr-3 text-xs text-gray-500 font-medium">カード手数料</th>
                    <th className="text-left py-2 pr-3 text-xs text-gray-500 font-medium">TX手数料</th>
                    <th className="text-left py-2 text-xs text-gray-500 font-medium">特徴</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPETITORS.map((row, i) => (
                    <tr
                      key={row.name}
                      className={`border-b border-gray-50 ${i < 3 ? "bg-green-50" : ""}`}
                    >
                      <td className="py-3 pr-3">
                        <span className={`font-semibold text-sm ${i < 3 ? "text-green-700" : "text-gray-900"}`}>
                          {row.name}
                          {i === 0 && <span className="ml-1 text-xs font-normal text-green-500">← Shopify</span>}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-gray-700 text-xs">{row.monthlyFee}</td>
                      <td className="py-3 pr-3 text-gray-700 text-xs">{row.cardRate}</td>
                      <td className="py-3 pr-3 text-gray-700 text-xs">{row.txFee}</td>
                      <td className="py-3 text-gray-500 text-xs">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              料金は2026年時点の公開情報を基にしています。最新情報は各社公式サイトをご確認ください。
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">選び方の目安</h2>
            <div className="space-y-3">
              {[
                { icon: "🟢", title: "BASE がおすすめ", desc: "月数万円以下のスモールスタート。初期コストゼロで試したい場合。ただしサービス料3%に注意。" },
                { icon: "🟡", title: "STORES がおすすめ", desc: "シンプルに運営したい国内向けショップ。有料プランで手数料が下がる。" },
                { icon: "🟩", title: "Shopify がおすすめ", desc: "月売上50万円〜の本格運営。海外販売、複数チャネル管理、豊富なアプリ連携が必要な場合。" },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="text-lg mt-0.5">{item.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pb-4">
        料金は2026年時点の情報です。最新の料金はShopify公式サイトをご確認ください。
      </p>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Shopify 日本円手数料計算",
  "description": "Shopifyの日本向けプラン別月額・トランザクション手数料・決済手数料を統合計算",
  "url": "https://tools.loresync.dev/shopify-fee-jp",
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
