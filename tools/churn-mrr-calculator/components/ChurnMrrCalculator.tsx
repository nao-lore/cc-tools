"use client";

import { useState, useMemo } from "react";

function fmt(n: number, digits = 1): string {
  return n.toLocaleString("ja-JP", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

function InputField({
  label,
  value,
  onChange,
  suffix,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
        {hint && <span className="ml-1 text-gray-400 font-normal">{hint}</span>}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {suffix && <span className="text-xs text-gray-500 whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  );
}

type BadgeLevel = "excellent" | "good" | "warning" | "danger";

function badge(level: BadgeLevel): string {
  const map: Record<BadgeLevel, string> = {
    excellent: "bg-green-100 text-green-800",
    good: "bg-blue-100 text-blue-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
  };
  return map[level];
}

function badgeLabel(level: BadgeLevel): string {
  const map: Record<BadgeLevel, string> = {
    excellent: "Excellent",
    good: "Good",
    warning: "要注意",
    danger: "危険",
  };
  return map[level];
}

function churnLevel(rate: number): BadgeLevel {
  if (rate < 1) return "excellent";
  if (rate < 3) return "good";
  if (rate < 7) return "warning";
  return "danger";
}

function nrrLevel(nrr: number): BadgeLevel {
  if (nrr >= 120) return "excellent";
  if (nrr >= 100) return "good";
  if (nrr >= 90) return "warning";
  return "danger";
}

interface Metrics {
  customerChurnRate: number;
  revenueChurnRate: number;
  netMrr: number;
  nrr: number;
}

function calcMetrics(
  startCustomers: number,
  churned: number,
  newCustomers: number,
  startMrr: number,
  churnMrr: number,
  expansionMrr: number,
  newMrr: number
): Metrics | null {
  if (startCustomers <= 0 || startMrr <= 0) return null;

  const customerChurnRate = (churned / startCustomers) * 100;
  const revenueChurnRate = (churnMrr / startMrr) * 100;
  const netMrr = startMrr - churnMrr + expansionMrr + newMrr;
  const nrr = ((startMrr - churnMrr + expansionMrr) / startMrr) * 100;

  return { customerChurnRate, revenueChurnRate, netMrr, nrr };
}

function projectMonths(
  startCustomers: number,
  churned: number,
  newCustomers: number,
  startMrr: number,
  churnMrr: number,
  expansionMrr: number,
  newMrr: number,
  months: number
): Array<{ month: number; customers: number; mrr: number }> {
  const rows = [];
  let customers = startCustomers;
  let mrr = startMrr;

  const churnRate = startCustomers > 0 ? churned / startCustomers : 0;
  const netCustomerGain = newCustomers - churned;
  const revenueChurnRate = startMrr > 0 ? churnMrr / startMrr : 0;
  const netMrrGain = expansionMrr + newMrr - churnMrr;

  for (let i = 1; i <= months; i++) {
    customers = Math.max(0, customers + netCustomerGain);
    const churnThisMonth = mrr * revenueChurnRate;
    mrr = Math.max(0, mrr - churnThisMonth + expansionMrr + newMrr);
    rows.push({ month: i, customers: Math.round(customers), mrr });
  }

  return rows;
}

export default function ChurnMrrCalculator() {
  const [startCustomers, setStartCustomers] = useState("500");
  const [churned, setChurned] = useState("10");
  const [newCustomers, setNewCustomers] = useState("30");
  const [startMrr, setStartMrr] = useState("5000000");
  const [churnMrr, setChurnMrr] = useState("100000");
  const [expansionMrr, setExpansionMrr] = useState("80000");
  const [newMrr, setNewMrr] = useState("300000");

  const sc = parseFloat(startCustomers);
  const ch = parseFloat(churned);
  const nc = parseFloat(newCustomers);
  const sm = parseFloat(startMrr);
  const cm = parseFloat(churnMrr);
  const em = parseFloat(expansionMrr);
  const nm = parseFloat(newMrr);

  const valid =
    !isNaN(sc) && sc > 0 &&
    !isNaN(ch) && ch >= 0 &&
    !isNaN(nc) && nc >= 0 &&
    !isNaN(sm) && sm > 0 &&
    !isNaN(cm) && cm >= 0 &&
    !isNaN(em) && em >= 0 &&
    !isNaN(nm) && nm >= 0;

  const metrics = useMemo(
    () => (valid ? calcMetrics(sc, ch, nc, sm, cm, em, nm) : null),
    [sc, ch, nc, sm, cm, em, nm, valid]
  );

  const forecast = useMemo(
    () => (valid ? projectMonths(sc, ch, nc, sm, cm, em, nm, 12) : []),
    [sc, ch, nc, sm, cm, em, nm, valid]
  );

  return (
    <div className="space-y-6">
      {/* Inputs: Customers */}
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">顧客数（月初）</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField label="月初顧客数" value={startCustomers} onChange={setStartCustomers} suffix="社" />
          <InputField label="解約数" value={churned} onChange={setChurned} suffix="社" />
          <InputField label="新規獲得数" value={newCustomers} onChange={setNewCustomers} suffix="社" />
        </div>
      </div>

      {/* Inputs: MRR */}
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">MRR（月初）</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="月初MRR" value={startMrr} onChange={setStartMrr} suffix="円" />
          <InputField label="解約MRR" value={churnMrr} onChange={setChurnMrr} suffix="円" hint="（解約で失った分）" />
          <InputField label="拡張MRR" value={expansionMrr} onChange={setExpansionMrr} suffix="円" hint="（アップセル等）" />
          <InputField label="新規MRR" value={newMrr} onChange={setNewMrr} suffix="円" hint="（新規顧客分）" />
        </div>
      </div>

      {/* Results */}
      {metrics ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Customer Churn Rate */}
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm text-center">
              <p className="text-xs text-gray-500 mb-1">顧客解約率</p>
              <p className="text-2xl font-bold text-gray-900">{fmt(metrics.customerChurnRate)}%</p>
              <span
                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${badge(churnLevel(metrics.customerChurnRate))}`}
              >
                {badgeLabel(churnLevel(metrics.customerChurnRate))}
              </span>
            </div>

            {/* Revenue Churn Rate */}
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm text-center">
              <p className="text-xs text-gray-500 mb-1">収益解約率</p>
              <p className="text-2xl font-bold text-gray-900">{fmt(metrics.revenueChurnRate)}%</p>
              <span
                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${badge(churnLevel(metrics.revenueChurnRate))}`}
              >
                {badgeLabel(churnLevel(metrics.revenueChurnRate))}
              </span>
            </div>

            {/* Net MRR */}
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm text-center">
              <p className="text-xs text-gray-500 mb-1">純増MRR</p>
              <p
                className={`text-2xl font-bold ${
                  metrics.netMrr >= parseFloat(startMrr) ? "text-green-600" : "text-red-600"
                }`}
              >
                ¥{fmtInt(metrics.netMrr)}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {metrics.netMrr >= sm
                  ? `+¥${fmtInt(metrics.netMrr - sm)}`
                  : `-¥${fmtInt(sm - metrics.netMrr)}`}
              </p>
            </div>

            {/* NRR */}
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm text-center">
              <p className="text-xs text-gray-500 mb-1">NRR</p>
              <p className="text-2xl font-bold text-gray-900">{fmt(metrics.nrr)}%</p>
              <span
                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${badge(nrrLevel(metrics.nrr))}`}
              >
                {badgeLabel(nrrLevel(metrics.nrr))}
              </span>
            </div>
          </div>

          {/* Health summary */}
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              metrics.nrr >= 100
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {metrics.nrr >= 120
              ? `NRR ${fmt(metrics.nrr)}% — 既存顧客だけで拡大中。理想的な成長エンジンです。`
              : metrics.nrr >= 100
              ? `NRR ${fmt(metrics.nrr)}% — 既存顧客からの収益は維持できています。拡張MRRをさらに伸ばしましょう。`
              : `NRR ${fmt(metrics.nrr)}% — 既存顧客の収益が縮小しています。解約対策・アップセルが急務です。`}
          </div>

          {/* 12-month forecast */}
          <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5 shadow-sm space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">12ヶ月予測</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2 pr-4 text-xs font-semibold text-gray-500">月</th>
                    <th className="pb-2 pr-4 text-xs font-semibold text-gray-500 text-right">顧客数</th>
                    <th className="pb-2 text-xs font-semibold text-gray-500 text-right">MRR</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.map((row) => (
                    <tr key={row.month} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-1.5 pr-4 text-gray-600">{row.month}ヶ月後</td>
                      <td className="py-1.5 pr-4 text-right text-gray-900 font-medium tabular-nums">
                        {row.customers.toLocaleString("ja-JP")}社
                      </td>
                      <td
                        className={`py-1.5 text-right font-medium tabular-nums ${
                          row.mrr >= sm ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ¥{fmtInt(row.mrr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-6 text-center text-sm text-gray-400">
          有効な値を入力してください（月初顧客数・月初MRRは1以上）
        </div>
      )}

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
        広告スペース
      </div>

      {/* Formula explanation */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-2 text-sm text-gray-600">
        <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">計算式</p>
        <p>顧客解約率 = 解約数 ÷ 月初顧客数 × 100</p>
        <p>収益解約率 = 解約MRR ÷ 月初MRR × 100</p>
        <p>純増MRR = 月初MRR − 解約MRR + 拡張MRR + 新規MRR</p>
        <p>NRR（ネットレベニューリテンション）= (月初MRR − 解約MRR + 拡張MRR) ÷ 月初MRR × 100</p>
        <p className="text-xs text-gray-400 pt-1">NRR 100%以上 = 新規獲得なしでも収益成長。120%以上がトップSaaSの目安。</p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このChurn率 / MRR 計算機ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">月次解約率・純増MRR・ネットレベニューリテンションを可視化。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このChurn率 / MRR 計算機ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "月次解約率・純増MRR・ネットレベニューリテンションを可視化。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Churn率 / MRR 計算機",
  "description": "月次解約率・純増MRR・ネットレベニューリテンションを可視化",
  "url": "https://tools.loresync.dev/churn-mrr-calculator",
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
