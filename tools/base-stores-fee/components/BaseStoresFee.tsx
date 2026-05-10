"use client";

import { useMemo, useState } from "react";

type Billing = "annual" | "monthly";

type Plan = {
  id: string;
  service: "BASE" | "STORES";
  name: string;
  monthlyFee: number;
  rate: number;
  perOrderFee: number;
  note: string;
  tone: string;
};

type PlanResult = Plan & {
  variableFee: number;
  totalFee: number;
  effectiveRate: number;
};

const LAST_VERIFIED = "2026-05-10";

const SALES_PRESETS = [
  { label: "月商10万円", sales: "100000", avgPrice: "3000" },
  { label: "月商30万円", sales: "300000", avgPrice: "4000" },
  { label: "月商50万円", sales: "500000", avgPrice: "5000" },
  { label: "月商100万円", sales: "1000000", avgPrice: "6000" },
];

const SALES_STEPS = [100_000, 200_000, 300_000, 500_000, 800_000, 1_000_000, 2_000_000, 5_000_000];

function plansForBilling(billing: Billing): Plan[] {
  const baseGrowthMonthlyFee = billing === "annual" ? 16_580 : 19_980;

  return [
    {
      id: "base-standard",
      service: "BASE",
      name: "BASE スタンダード",
      monthlyFee: 0,
      rate: 0.066,
      perOrderFee: 40,
      note: "決済手数料3.6% + 40円 + サービス利用料3%",
      tone: "border-rose-200 bg-rose-50 text-rose-800",
    },
    {
      id: "base-growth",
      service: "BASE",
      name: "BASE グロース",
      monthlyFee: baseGrowthMonthlyFee,
      rate: 0.029,
      perOrderFee: 0,
      note: billing === "annual" ? "年払い換算 16,580円/月 + 2.9%" : "月払い 19,980円/月 + 2.9%",
      tone: "border-red-200 bg-red-50 text-red-800",
    },
    {
      id: "stores-free",
      service: "STORES",
      name: "STORES フリー",
      monthlyFee: 0,
      rate: 0.055,
      perOrderFee: 0,
      note: "決済手数料 5.5%〜",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
    {
      id: "stores-standard",
      service: "STORES",
      name: "STORES スタンダード",
      monthlyFee: 3_300,
      rate: 0.036,
      perOrderFee: 0,
      note: "月額 3,300円 + 決済手数料 3.6%〜",
      tone: "border-teal-200 bg-teal-50 text-teal-800",
    },
  ];
}

function parseAmount(value: string) {
  const parsed = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function yen(value: number) {
  return Math.round(value).toLocaleString("ja-JP");
}

function pct(value: number) {
  return `${value.toLocaleString("ja-JP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

function calcPlan(plan: Plan, sales: number, orders: number): PlanResult {
  const variableFee = Math.round(sales * plan.rate + orders * plan.perOrderFee);
  const totalFee = plan.monthlyFee + variableFee;
  const effectiveRate = sales > 0 ? (totalFee / sales) * 100 : 0;
  return { ...plan, variableFee, totalFee, effectiveRate };
}

function buildCsv(results: PlanResult[]) {
  const rows = [
    ["plan", "monthly_fee_yen", "variable_fee_yen", "total_fee_yen", "effective_rate_percent", "note"],
    ...results.map((result) => [
      result.name,
      String(result.monthlyFee),
      String(result.variableFee),
      String(result.totalFee),
      result.effectiveRate.toFixed(2),
      result.note,
    ]),
  ];

  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function breakEvenSales(monthlyFeeDiff: number, rateDiff: number, perOrderDiff: number, avgPrice: number) {
  const denominator = rateDiff + perOrderDiff / Math.max(avgPrice, 1);
  if (denominator <= 0) return null;
  return monthlyFeeDiff / denominator;
}

export default function BaseStoresFee() {
  const [sales, setSales] = useState("500000");
  const [avgPrice, setAvgPrice] = useState("5000");
  const [manualOrders, setManualOrders] = useState("");
  const [billing, setBilling] = useState<Billing>("annual");
  const [copied, setCopied] = useState(false);

  const salesNum = parseAmount(sales);
  const avgPriceNum = parseAmount(avgPrice);
  const autoOrders = salesNum > 0 && avgPriceNum > 0 ? Math.max(1, Math.round(salesNum / avgPriceNum)) : 0;
  const ordersNum = manualOrders ? Math.max(0, Math.round(parseAmount(manualOrders))) : autoOrders;
  const inputError = salesNum <= 0 ? "月間売上を入力してください。" : ordersNum <= 0 ? "注文件数を入力してください。" : "";

  const plans = useMemo(() => plansForBilling(billing), [billing]);
  const results = useMemo(() => plans.map((plan) => calcPlan(plan, salesNum, ordersNum)).sort((a, b) => a.totalFee - b.totalFee), [ordersNum, plans, salesNum]);
  const best = results[0];
  const second = results[1];
  const maxFee = Math.max(...results.map((result) => result.totalFee), 1);
  const baseGrowthFee = plans.find((plan) => plan.id === "base-growth")?.monthlyFee ?? 16_580;
  const baseSwitch = breakEvenSales(baseGrowthFee, 0.066 - 0.029, 40, avgPriceNum || 5_000);
  const storesSwitch = breakEvenSales(3_300, 0.055 - 0.036, 0, avgPriceNum || 5_000);

  function applyPreset(preset: (typeof SALES_PRESETS)[number]) {
    setSales(preset.sales);
    setAvgPrice(preset.avgPrice);
    setManualOrders("");
    setCopied(false);
  }

  function reset() {
    setSales("500000");
    setAvgPrice("5000");
    setManualOrders("");
    setBilling("annual");
    setCopied(false);
  }

  async function copySummary() {
    const lines = [
      `月間売上: ${yen(salesNum)}円`,
      `注文件数: ${yen(ordersNum)}件`,
      `最安: ${best.name} ${yen(best.totalFee)}円/月`,
      `2番手との差: ${yen(second.totalFee - best.totalFee)}円/月`,
      `検証日: ${LAST_VERIFIED}`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">売上条件</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">月商、平均単価、注文件数から4プランの総費用を比較します。</p>
            </div>
            <button type="button" onClick={reset} className="w-fit rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              クリア
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <NumberInput id="base-stores-sales" label="月間売上" value={sales} onChange={setSales} suffix="円" step="10000" />
            <NumberInput
              id="base-stores-average-price"
              label="平均注文単価"
              value={avgPrice}
              onChange={(value) => {
                setAvgPrice(value);
                setManualOrders("");
              }}
              suffix="円"
              step="500"
            />
            <NumberInput
              id="base-stores-orders"
              label="月間注文件数"
              value={manualOrders || (autoOrders ? String(autoOrders) : "")}
              onChange={setManualOrders}
              suffix="件"
              step="1"
              note={manualOrders ? "手入力中です。" : "売上÷平均単価で自動計算しています。"}
            />

            <div>
              <p className="text-sm font-medium text-slate-700">BASEグロースの月額</p>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                {[
                  { value: "annual" as const, label: "年払い換算", sub: "16,580円/月" },
                  { value: "monthly" as const, label: "月払い", sub: "19,980円/月" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setBilling(item.value)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                      billing === item.value ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <span className="block">{item.label}</span>
                    <span className="block text-xs font-normal">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SALES_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <p className={`min-h-5 text-sm ${inputError ? "text-red-600" : "text-slate-500"}`}>
              {inputError || `料金データ確認日: ${LAST_VERIFIED}。振込手数料、オプション、決済手段ごとの加算は含みません。`}
            </p>
          </div>
        </div>

        <div className="min-w-0 p-5 sm:p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">おすすめプラン</h2>
                <p className="mt-1 text-sm text-slate-500">入力条件で月間費用が最も低いプランです。</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copySummary}
                  disabled={Boolean(inputError)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  {copied ? "コピー済み" : "結果をコピー"}
                </button>
                <button
                  type="button"
                  onClick={() => downloadText("base-stores-fee.csv", buildCsv(results))}
                  disabled={Boolean(inputError)}
                  className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  CSVダウンロード
                </button>
              </div>
            </div>

            {!inputError && (
              <div className="mt-5 grid gap-4">
                <div className={`rounded-2xl border p-5 ${best.tone}`}>
                  <p className="text-sm font-medium opacity-80">最安</p>
                  <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <p className="text-2xl font-bold">{best.name}</p>
                    <p className="font-mono text-3xl font-bold">{yen(best.totalFee)}円</p>
                  </div>
                  <p className="mt-2 text-sm opacity-80">
                    実質 {pct(best.effectiveRate)}。2番手の {second.name} より {yen(second.totalFee - best.totalFee)}円/月 安い見込みです。
                  </p>
                </div>

                <div className="grid gap-3">
                  {results.map((result) => (
                    <div key={result.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-950">{result.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{result.note}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-mono text-lg font-bold text-slate-950">{yen(result.totalFee)}円/月</p>
                          <p className="text-xs text-slate-500">実質 {pct(result.effectiveRate)}</p>
                        </div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-slate-950" style={{ width: `${Math.max(6, (result.totalFee / maxFee) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <SwitchCard title="BASE内の乗り換え目安" value={baseSwitch ? `${yen(baseSwitch)}円/月` : "算出不可"} body="スタンダードよりグロースが安くなりやすい売上目安です。平均単価が低いほど40円/件の影響が大きくなります。" />
            <SwitchCard title="STORES内の乗り換え目安" value={storesSwitch ? `${yen(storesSwitch)}円/月` : "算出不可"} body="フリーよりスタンダードが安くなりやすい売上目安です。月額3,300円と料率差から算出しています。" />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-semibold text-slate-950">売上規模別の最安プラン</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs text-slate-500">
                    <th className="border border-slate-200 px-3 py-2">月間売上</th>
                    {plans.map((plan) => (
                      <th key={plan.id} className="border border-slate-200 px-3 py-2">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SALES_STEPS.map((step) => {
                    const orders = Math.max(1, Math.round(step / Math.max(avgPriceNum || 5_000, 1)));
                    const row = plans.map((plan) => calcPlan(plan, step, orders));
                    const min = Math.min(...row.map((item) => item.totalFee));
                    return (
                      <tr key={step} className="even:bg-slate-50">
                        <td className="whitespace-nowrap border border-slate-200 px-3 py-2 font-semibold text-slate-900">{yen(step)}円</td>
                        {row.map((item) => (
                          <td key={item.id} className={`whitespace-nowrap border border-slate-200 px-3 py-2 text-center ${item.totalFee === min ? "bg-amber-50 font-bold text-amber-800" : "text-slate-600"}`}>
                            {yen(item.totalFee)}円
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-500">黄色が各売上規模での最安。注文件数は現在の平均注文単価から概算しています。</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function NumberInput({
  id,
  label,
  value,
  onChange,
  suffix,
  step,
  note,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix: string;
  step: string;
  note?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor={id}>
      {label}
      <div className="flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
        <input
          id={id}
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
        />
        <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{suffix}</span>
      </div>
      {note && <span className="text-xs font-normal text-slate-500">{note}</span>}
    </label>
  );
}

function SwitchCard({ title, value, body }: { title: string; value: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-2 font-mono text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}
