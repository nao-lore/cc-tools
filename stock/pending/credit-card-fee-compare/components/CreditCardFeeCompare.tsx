"use client";

import { useState, useMemo } from "react";

// --- 料金データ ---
type Service = {
  id: string;
  name: string;
  shortName: string;
  rate: number; // 決済手数料率 (0.0198 など)
  monthlyFee: number; // 月額固定費（円）
  perTransactionFee: number; // 1件あたり固定費（円）
  color: string;
  bgColor: string;
  borderColor: string;
  notes?: string;
};

const SERVICES: Service[] = [
  {
    id: "paypay",
    name: "PayPay",
    shortName: "PayPay",
    rate: 0.0198,
    monthlyFee: 0,
    perTransactionFee: 0,
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    notes: "QRコード決済",
  },
  {
    id: "airpay",
    name: "Airペイ",
    shortName: "Airペイ",
    rate: 0.0324,
    monthlyFee: 0,
    perTransactionFee: 0,
    color: "text-sky-700",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
    notes: "Visa/MC/JCB等",
  },
  {
    id: "rakutenpay",
    name: "楽天ペイ",
    shortName: "楽天Pay",
    rate: 0.0324,
    monthlyFee: 0,
    perTransactionFee: 0,
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    notes: "Visa/MC等",
  },
  {
    id: "stores",
    name: "STORES決済",
    shortName: "STORES",
    rate: 0.0324,
    monthlyFee: 0,
    perTransactionFee: 0,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    notes: "Visa/MC等",
  },
  {
    id: "stripe",
    name: "Stripe",
    shortName: "Stripe",
    rate: 0.036,
    monthlyFee: 0,
    perTransactionFee: 0,
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    notes: "国内カード",
  },
  {
    id: "square",
    name: "Square",
    shortName: "Square",
    rate: 0.0325,
    monthlyFee: 0,
    perTransactionFee: 0,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    notes: "Visa/MC等",
  },
];

function fmtJPY(n: number): string {
  if (n < 1) return "0円";
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function fmtRate(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

const PRESETS = [
  { label: "10万円", value: 100_000 },
  { label: "30万円", value: 300_000 },
  { label: "50万円", value: 500_000 },
  { label: "100万円", value: 1_000_000 },
  { label: "300万円", value: 3_000_000 },
];

export default function CreditCardFeeCompare() {
  const [monthlySales, setMonthlySales] = useState<number>(500_000);
  const [inputRaw, setInputRaw] = useState<string>("500000");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    setInputRaw(raw);
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 0) setMonthlySales(n);
  };

  const handlePreset = (value: number) => {
    setMonthlySales(value);
    setInputRaw(value.toString());
  };

  // コスト計算（昇順ソート）
  const results = useMemo(() => {
    return SERVICES.map((s) => {
      const feeCost = monthlySales * s.rate;
      const totalCost = feeCost + s.monthlyFee;
      const netRevenue = monthlySales - totalCost;
      return { ...s, feeCost, totalCost, netRevenue };
    }).sort((a, b) => a.totalCost - b.totalCost);
  }, [monthlySales]);

  const cheapest = results[0];
  const maxCost = results[results.length - 1].totalCost;

  return (
    <div className="space-y-6">
      {/* ===== 入力 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">月間決済額を入力</h2>

        {/* プリセット */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePreset(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                monthlySales === p.value
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* 手入力 */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={inputRaw}
            onChange={handleInputChange}
            className="w-48 px-3 py-2 text-right border border-gray-300 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <span className="text-gray-600 font-medium">円 / 月</span>
        </div>

        {monthlySales > 0 && (
          <p className="mt-3 text-sm text-gray-500">
            月間売上:{" "}
            <span className="font-semibold text-gray-800">{fmtJPY(monthlySales)}</span>
          </p>
        )}
      </div>

      {/* ===== 最安値ハイライト ===== */}
      {monthlySales > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
            最安サービス
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-2xl font-bold text-gray-900">{cheapest.name}</span>
            <span className="text-lg text-green-700 font-semibold">{fmtJPY(cheapest.totalCost)} / 月</span>
            <span className="text-sm text-gray-500">（手数料率 {fmtRate(cheapest.rate)}）</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            手取り: <span className="font-medium text-gray-700">{fmtJPY(cheapest.netRevenue)}</span>
          </p>
        </div>
      )}

      {/* ===== 比較表 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">サービス比較（安い順）</h2>
        <p className="text-xs text-gray-500 mb-4">
          月間 {fmtJPY(monthlySales)} の決済時の月額コスト
        </p>

        <div className="space-y-3">
          {results.map((s, i) => {
            const barWidth = maxCost > 0 ? (s.totalCost / maxCost) * 100 : 0;
            const isCheapest = i === 0;

            return (
              <div
                key={s.id}
                className={`rounded-xl border p-4 ${isCheapest ? `${s.bgColor} ${s.borderColor}` : "border-gray-100"}`}
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isCheapest ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="font-semibold text-gray-900">{s.name}</span>
                    {s.notes && (
                      <span className="text-xs text-gray-400 hidden sm:inline">{s.notes}</span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-gray-900">{fmtJPY(s.totalCost)}</div>
                    <div className="text-xs text-gray-500">手取り {fmtJPY(s.netRevenue)}</div>
                  </div>
                </div>

                {/* バーチャート */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCheapest ? "bg-green-400" : "bg-gray-300"
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {/* 内訳 */}
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                  <span>手数料率: <span className="font-medium text-gray-700">{fmtRate(s.rate)}</span></span>
                  <span>決済手数料: <span className="font-medium text-gray-700">{fmtJPY(s.feeCost)}</span></span>
                  {s.monthlyFee > 0 && (
                    <span>月額固定: <span className="font-medium text-gray-700">{fmtJPY(s.monthlyFee)}</span></span>
                  )}
                  {s.perTransactionFee > 0 && (
                    <span>1件固定: <span className="font-medium text-gray-700">{fmtJPY(s.perTransactionFee)}</span></span>
                  )}
                </div>
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この決済サービス加盟店手数料比較ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">Stripe/Square/Airペイ/PayPay等の手数料比較（加盟店側）。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この決済サービス加盟店手数料比較ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "Stripe/Square/Airペイ/PayPay等の手数料比較（加盟店側）。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
            );
          })}
        </div>
      </div>

      {/* ===== 一覧テーブル ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">手数料率一覧</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">サービス</th>
                <th className="text-right py-2 pr-4 text-xs text-gray-500 font-medium">手数料率</th>
                <th className="text-right py-2 pr-4 text-xs text-gray-500 font-medium">月額固定</th>
                <th className="text-right py-2 text-xs text-gray-500 font-medium">備考</th>
              </tr>
            </thead>
            <tbody>
              {SERVICES.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.bgColor} ${s.color} border ${s.borderColor}`}>
                      {s.shortName}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right font-semibold text-gray-800">
                    {fmtRate(s.rate)}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-gray-600">
                    {s.monthlyFee === 0 ? "無料" : fmtJPY(s.monthlyFee)}
                  </td>
                  <td className="py-2.5 text-right text-gray-400 text-xs">
                    {s.notes ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== 広告プレースホルダー ===== */}
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center h-24 text-gray-400 text-sm">
        広告
      </div>

      {/* ===== 注記 ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        手数料率は2024年時点の情報です。キャンペーン・業種・売上規模により異なる場合があります。最新情報は各サービスの公式サイトをご確認ください。
      </p>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "決済サービス加盟店手数料比較",
  "description": "Stripe/Square/Airペイ/PayPay等の手数料比較（加盟店側）",
  "url": "https://tools.loresync.dev/credit-card-fee-compare",
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
