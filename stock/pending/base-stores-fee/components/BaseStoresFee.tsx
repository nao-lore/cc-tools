"use client";

import { useState, useMemo } from "react";

// ---- Plan definitions ----

interface Plan {
  service: "BASE" | "STORES";
  label: string;
  monthlyFee: number;       // 固定費（円/月）
  txRate: number;           // 決済手数料率（小数）
  txFixed: number;          // 決済手数料固定（円/件）
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

const PLANS: Plan[] = [
  {
    service: "BASE",
    label: "BASE フリー",
    monthlyFee: 0,
    txRate: 0.066,
    txFixed: 40,
    color: "#e74c3c",
    bgClass: "bg-red-50",
    borderClass: "border-red-200",
    textClass: "text-red-700",
  },
  {
    service: "BASE",
    label: "BASE グロース",
    monthlyFee: 16580,
    txRate: 0.029,
    txFixed: 0,
    color: "#c0392b",
    bgClass: "bg-red-50",
    borderClass: "border-red-100",
    textClass: "text-red-600",
  },
  {
    service: "STORES",
    label: "STORES フリー",
    monthlyFee: 0,
    txRate: 0.05,
    txFixed: 0,
    color: "#27ae60",
    bgClass: "bg-green-50",
    borderClass: "border-green-200",
    textClass: "text-green-700",
  },
  {
    service: "STORES",
    label: "STORES スタンダード",
    monthlyFee: 2980,
    txRate: 0.036,
    txFixed: 0,
    color: "#1e8449",
    bgClass: "bg-green-50",
    borderClass: "border-green-100",
    textClass: "text-green-600",
  },
];

// ---- Calculation ----

function calcFee(plan: Plan, sales: number, orders: number): number {
  return plan.monthlyFee + sales * plan.txRate + orders * plan.txFixed;
}

function calcEffectiveRate(plan: Plan, sales: number, orders: number): number {
  if (sales === 0) return 0;
  return (calcFee(plan, sales, orders) / sales) * 100;
}

// ---- Formatting ----

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

function fmtPct(n: number): string {
  return n.toLocaleString("ja-JP", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
}

// ---- Bar chart component ----

function FeeBar({
  plans,
  sales,
  orders,
}: {
  plans: Plan[];
  sales: number;
  orders: number;
}) {
  const fees = plans.map((p) => ({ plan: p, fee: calcFee(p, sales, orders) }));
  const maxFee = Math.max(...fees.map((f) => f.fee), 1);

  return (
    <div className="space-y-3">
      {fees.map(({ plan, fee }) => {
        const pct = Math.min((fee / maxFee) * 100, 100);
        const effectiveRate = calcEffectiveRate(plan, sales, orders);
        return (
          <div key={plan.label} className="flex items-center gap-3 text-sm">
            <span className="w-36 shrink-0 text-xs text-gray-600 font-medium">{plan.label}</span>
            <div className="flex-1 relative h-7 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%`, backgroundColor: plan.color }}
              />
            </div>
            <span className="w-28 text-right text-xs font-semibold text-gray-700 shrink-0">
              ¥{fmt(fee)}<span className="font-normal text-gray-400 ml-1">({fmtPct(effectiveRate)})</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---- Break-even table ----

const SALES_STEPS = [50_000, 100_000, 200_000, 300_000, 500_000, 1_000_000, 2_000_000, 5_000_000];

function BreakEvenTable({ avgPrice }: { avgPrice: number }) {
  const price = avgPrice > 0 ? avgPrice : 3000;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left px-3 py-2 font-semibold text-gray-600 border border-gray-200">月間売上</th>
            <th className="px-3 py-2 font-semibold text-red-600 border border-gray-200">BASE フリー</th>
            <th className="px-3 py-2 font-semibold text-red-700 border border-gray-200">BASE グロース</th>
            <th className="px-3 py-2 font-semibold text-green-600 border border-gray-200">STORES フリー</th>
            <th className="px-3 py-2 font-semibold text-green-700 border border-gray-200">STORES スタンダード</th>
          </tr>
        </thead>
        <tbody>
          {SALES_STEPS.map((sales) => {
            const orders = Math.max(1, Math.round(sales / price));
            const fees = PLANS.map((p) => calcFee(p, sales, orders));
            const minFee = Math.min(...fees);
            return (
              <tr key={sales} className="even:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-700 border border-gray-200 whitespace-nowrap">
                  ¥{fmt(sales)}
                </td>
                {fees.map((fee, i) => (
                  <td
                    key={i}
                    className={`px-3 py-2 text-center border border-gray-200 whitespace-nowrap font-semibold ${
                      fee === minFee ? "bg-yellow-50 text-yellow-800" : "text-gray-600"
                    }`}
                  >
                    ¥{fmt(fee)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-[10px] text-gray-400 mt-1">注文件数は平均単価から自動計算。黄色が最安プラン。</p>
    </div>
  );
}

// ---- Break-even point between BASE Growth and STORES Standard ----
// BASE Growth vs STORES Free: find sales where costs equal
// BASE Growth: 16580 + sales*0.029
// STORES Free: sales*0.05
// 16580 + 0.029s = 0.05s → s = 16580/0.021

function BreakEvenPoints({ avgPrice }: { avgPrice: number }) {
  const price = avgPrice > 0 ? avgPrice : 3000;

  // BASE Growth vs BASE Free: 16580 + s*0.029 + 0*(orders) = s*0.066 + 40*orders
  // With orders = s/price:
  // 16580 + 0.029s = 0.066s + 40*(s/price)
  // 16580 = s*(0.066 - 0.029 + 40/price)
  const beFreeVsGrowth = 16580 / (0.037 + 40 / price);

  // STORES Standard vs STORES Free: 2980 + s*0.036 = s*0.05
  const beStoresFreeVsStd = 2980 / (0.05 - 0.036);

  // BASE Free vs STORES Free: s*0.066 + 40*(s/price) = s*0.05
  // s*(0.066 + 40/price - 0.05) = 0
  // BASE Free is always more expensive than STORES Free when positive (no crossover unless negative)
  // So for "which is cheaper overall" comparison, compare best BASE vs best STORES:
  // best BASE: min(BASE Free, BASE Growth) vs best STORES: min(STORES Free, STORES Std)

  const points = [
    {
      label: "BASE フリー → グロース 乗り換え目安",
      sales: beFreeVsGrowth,
      desc: "この売上を超えるとグロースの方が手数料が安くなります",
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
    },
    {
      label: "STORES フリー → スタンダード 乗り換え目安",
      sales: beStoresFreeVsStd,
      desc: "この売上を超えるとスタンダードの方が手数料が安くなります",
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-200",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {points.map((p) => (
        <div key={p.label} className={`rounded-xl border ${p.border} ${p.bg} px-4 py-3`}>
          <p className={`text-xs font-semibold ${p.color} mb-1`}>{p.label}</p>
          <p className="text-2xl font-bold text-gray-800">¥{fmt(p.sales)}<span className="text-sm font-normal text-gray-500">/月</span></p>
          <p className="text-[11px] text-gray-500 mt-1">{p.desc}</p>
        </div>
      ))}
    </div>
  );
}

// ---- Recommendation ----

function Recommendation({ sales, orders }: { sales: number; orders: number }) {
  if (sales === 0) return null;

  const fees = PLANS.map((p) => ({ plan: p, fee: calcFee(p, sales, orders) }));
  fees.sort((a, b) => a.fee - b.fee);
  const best = fees[0];
  const second = fees[1];
  const saving = second.fee - best.fee;

  const serviceColor =
    best.plan.service === "BASE" ? "text-red-700" : "text-green-700";
  const serviceBg =
    best.plan.service === "BASE" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200";

  return (
    <div className={`rounded-xl border ${serviceBg} px-5 py-4`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">おすすめプラン</p>
      <p className={`text-xl font-bold ${serviceColor}`}>{best.plan.label}</p>
      <p className="text-sm text-gray-600 mt-1">
        月間手数料 <span className="font-semibold text-gray-800">¥{fmt(best.fee)}</span>（実質手数料率 {fmtPct(calcEffectiveRate(best.plan, sales, orders))}）
      </p>
      {saving > 0 && (
        <p className="text-sm text-gray-500 mt-1">
          2番目に安いプラン（{second.plan.label}）より <span className="font-semibold text-gray-700">¥{fmt(saving)}/月</span> お得
        </p>
      )}
    </div>
  );
}

// ---- Main component ----

export default function BaseStoresFee() {
  const [sales, setSales] = useState("200000");
  const [avgPrice, setAvgPrice] = useState("3000");
  const [manualOrders, setManualOrders] = useState("");

  const salesNum = useMemo(() => Math.max(0, parseFloat(sales) || 0), [sales]);
  const avgPriceNum = useMemo(() => Math.max(0, parseFloat(avgPrice) || 0), [avgPrice]);
  const autoOrders = useMemo(
    () => (avgPriceNum > 0 ? Math.max(1, Math.round(salesNum / avgPriceNum)) : 0),
    [salesNum, avgPriceNum]
  );
  const ordersNum = useMemo(() => {
    const m = parseFloat(manualOrders);
    return manualOrders !== "" && !isNaN(m) && m > 0 ? Math.round(m) : autoOrders;
  }, [manualOrders, autoOrders]);

  const isValid = salesNum > 0 && ordersNum > 0;

  return (
    <div className="space-y-6">
      {/* Input section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">売上条件を入力</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {/* Sales */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">月間売上（円）</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="10000"
                value={sales}
                onChange={(e) => setSales(e.target.value)}
                placeholder="200000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-xs text-gray-400 shrink-0">円</span>
            </div>
          </div>

          {/* Avg price */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">平均単価（円）</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                step="100"
                value={avgPrice}
                onChange={(e) => { setAvgPrice(e.target.value); setManualOrders(""); }}
                placeholder="3000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-xs text-gray-400 shrink-0">円</span>
            </div>
          </div>

          {/* Orders */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              月間注文件数
              <span className="ml-1 text-gray-400 font-normal">（自動計算 or 手入力）</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={manualOrders !== "" ? manualOrders : autoOrders > 0 ? String(autoOrders) : ""}
                onChange={(e) => setManualOrders(e.target.value)}
                placeholder={autoOrders > 0 ? String(autoOrders) : "件数"}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-xs text-gray-400 shrink-0">件</span>
            </div>
            {manualOrders === "" && autoOrders > 0 && (
              <p className="text-[10px] text-gray-400 mt-0.5">売上÷単価で自動計算中</p>
            )}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      {isValid && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-gray-700">月間手数料 比較</h2>
            <span className="text-xs text-gray-400">
              売上 ¥{fmt(salesNum)} / {fmt(ordersNum)}件
            </span>
          </div>
          <FeeBar plans={PLANS} sales={salesNum} orders={ordersNum} />

          {/* Plan detail table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse mt-2">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 font-semibold text-gray-500 border border-gray-200">プラン</th>
                  <th className="px-3 py-2 font-semibold text-gray-500 border border-gray-200">固定費</th>
                  <th className="px-3 py-2 font-semibold text-gray-500 border border-gray-200">決済手数料</th>
                  <th className="px-3 py-2 font-semibold text-gray-500 border border-gray-200">合計</th>
                  <th className="px-3 py-2 font-semibold text-gray-500 border border-gray-200">実質レート</th>
                </tr>
              </thead>
              <tbody>
                {PLANS.map((p) => {
                  const txCost = salesNum * p.txRate + ordersNum * p.txFixed;
                  const total = p.monthlyFee + txCost;
                  const rate = calcEffectiveRate(p, salesNum, ordersNum);
                  return (
                    <tr key={p.label} className="even:bg-gray-50">
                      <td className={`px-3 py-2 font-medium border border-gray-200 ${p.textClass}`}>{p.label}</td>
                      <td className="px-3 py-2 text-center text-gray-600 border border-gray-200">
                        {p.monthlyFee > 0 ? `¥${fmt(p.monthlyFee)}` : "無料"}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-600 border border-gray-200">¥{fmt(txCost)}</td>
                      <td className="px-3 py-2 text-center font-bold text-gray-800 border border-gray-200">¥{fmt(total)}</td>
                      <td className="px-3 py-2 text-center text-gray-600 border border-gray-200">{fmtPct(rate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recommendation */}
      {isValid && (
        <Recommendation sales={salesNum} orders={ordersNum} />
      )}

      {/* Break-even points */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">プラン乗り換え目安（損益分岐点）</h2>
        <BreakEvenPoints avgPrice={avgPriceNum} />
      </div>

      {/* Scale comparison table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">売上規模別 手数料一覧</h2>
        <BreakEvenTable avgPrice={avgPriceNum} />
      </div>

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
        広告スペース
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-2 text-sm text-gray-600">
        <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">料金の前提</p>
        <ul className="space-y-1 text-xs list-disc list-inside text-gray-500">
          <li>BASE フリー: 決済手数料 6.6% + 40円/件（振込手数料別）</li>
          <li>BASE グロース: 月額 16,580円 + 決済手数料 2.9%（振込手数料別）</li>
          <li>STORES フリー: 決済手数料 5%</li>
          <li>STORES スタンダード: 月額 2,980円 + 決済手数料 3.6%</li>
          <li>振込手数料・オプション費用は含みません。最新料金は各公式サイトを確認してください。</li>
        </ul>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このBASE / STORES 手数料比較ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">売上規模別の両サービスの実質手数料と損益分岐点。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このBASE / STORES 手数料比較ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "売上規模別の両サービスの実質手数料と損益分岐点。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
