"use client";

import { useState, useMemo } from "react";

const USD_TO_JPY = 150;

interface Plan {
  name: string;
  monthlyUSD: number;
  emailsPerMonth: number;
  contacts: number;
  features: string[];
  color: string;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    monthlyUSD: 0,
    emailsPerMonth: 100,
    contacts: 2000,
    features: ["1ユーザー", "メール送信100通/日", "基本テンプレート", "APIアクセス"],
    color: "gray",
  },
  {
    name: "Essentials 50k",
    monthlyUSD: 19.95,
    emailsPerMonth: 50000,
    contacts: 5000,
    features: ["1ユーザー", "メール分析", "カスタムドメイン認証", "チャットサポート"],
    color: "blue",
  },
  {
    name: "Essentials 100k",
    monthlyUSD: 35.95,
    emailsPerMonth: 100000,
    contacts: 5000,
    features: ["1ユーザー", "メール分析", "カスタムドメイン認証", "チャットサポート"],
    color: "blue",
  },
  {
    name: "Pro 100k",
    monthlyUSD: 89.95,
    emailsPerMonth: 100000,
    contacts: 10000,
    features: ["最大3ユーザー", "高度な分析", "専用IPアドレス", "電話サポート", "サブユーザー管理"],
    color: "indigo",
  },
  {
    name: "Pro 300k",
    monthlyUSD: 249,
    emailsPerMonth: 300000,
    contacts: 15000,
    features: ["最大3ユーザー", "高度な分析", "専用IPアドレス", "電話サポート", "サブユーザー管理"],
    color: "indigo",
  },
  {
    name: "Premier",
    monthlyUSD: 0,
    emailsPerMonth: 1500000,
    contacts: 200000,
    features: ["無制限ユーザー", "専任CSM", "カスタム契約", "SLA保証", "優先サポート"],
    color: "purple",
  },
];

const OVERAGE_USD_PER_1K = 1.0; // approximate overage rate

function getPlanColor(color: string) {
  const map: Record<string, string> = {
    gray: "border-gray-300 bg-gray-50",
    blue: "border-blue-300 bg-blue-50",
    indigo: "border-indigo-400 bg-indigo-50",
    purple: "border-purple-400 bg-purple-50",
  };
  return map[color] ?? "border-gray-200 bg-white";
}

function getBadgeColor(color: string) {
  const map: Record<string, string> = {
    gray: "bg-gray-100 text-gray-600",
    blue: "bg-blue-100 text-blue-700",
    indigo: "bg-indigo-100 text-indigo-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return map[color] ?? "bg-gray-100 text-gray-600";
}

export default function SendgridPricing() {
  const [monthlyEmails, setMonthlyEmails] = useState(50000);
  const [contacts, setContacts] = useState(5000);
  const [usdRate, setUsdRate] = useState(USD_TO_JPY);

  const results = useMemo(() => {
    return PLANS.map((plan) => {
      const emailOk = monthlyEmails <= plan.emailsPerMonth;
      const contactOk = contacts <= plan.contacts;
      const fits = emailOk && contactOk;

      let overage = 0;
      if (!emailOk && plan.monthlyUSD > 0) {
        const extraK = Math.ceil((monthlyEmails - plan.emailsPerMonth) / 1000);
        overage = extraK * OVERAGE_USD_PER_1K;
      }

      const totalUSD = plan.monthlyUSD + overage;
      const totalJPY = totalUSD * usdRate;

      return { ...plan, fits, overage, totalUSD, totalJPY, emailOk, contactOk };
    });
  }, [monthlyEmails, contacts, usdRate]);

  const recommended = results.find((r) => r.fits && r.monthlyUSD > 0) ?? results[results.length - 1];

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">利用条件を入力</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">月間メール送信数</label>
              <span className="text-sm font-bold text-blue-600">
                {monthlyEmails.toLocaleString("ja-JP")} 通
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={500000}
              step={1000}
              value={monthlyEmails}
              onChange={(e) => setMonthlyEmails(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>100</span><span>500,000</span>
            </div>
            <input
              type="number"
              value={monthlyEmails}
              min={100}
              step={1000}
              onChange={(e) => setMonthlyEmails(Number(e.target.value))}
              className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">コンタクト数（連絡先）</label>
              <span className="text-sm font-bold text-blue-600">
                {contacts.toLocaleString("ja-JP")} 件
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={200000}
              step={1000}
              value={contacts}
              onChange={(e) => setContacts(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0</span><span>200,000</span>
            </div>
            <input
              type="number"
              value={contacts}
              min={0}
              step={1000}
              onChange={(e) => setContacts(Number(e.target.value))}
              className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">為替レート（1 USD =）</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={usdRate}
              min={100}
              max={200}
              step={1}
              onChange={(e) => setUsdRate(Number(e.target.value))}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-sm text-gray-600">円</span>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-blue-600 text-xl">★</span>
          <span className="font-semibold text-blue-800">おすすめプラン</span>
        </div>
        <p className="text-2xl font-bold text-blue-900">
          {recommended.name} —{" "}
          {recommended.monthlyUSD === 0 && recommended.name === "Premier"
            ? "要問い合わせ"
            : `月¥${Math.round(recommended.totalJPY).toLocaleString("ja-JP")}`}
        </p>
        <p className="text-sm text-blue-700 mt-1">
          {monthlyEmails.toLocaleString()}通送信 / {contacts.toLocaleString()}コンタクトに対応
        </p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border-2 p-5 transition-all ${
              plan.name === recommended.name
                ? `${getPlanColor(plan.color)} border-opacity-100 shadow-md`
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-gray-900">{plan.name}</h3>
              {plan.name === recommended.name && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getBadgeColor(plan.color)}`}>
                  おすすめ
                </span>
              )}
            </div>

            <div className="text-2xl font-bold text-gray-900 mb-1">
              {plan.name === "Premier" ? (
                <span className="text-lg">要問い合わせ</span>
              ) : plan.monthlyUSD === 0 ? (
                "無料"
              ) : (
                <>¥{Math.round(plan.totalJPY).toLocaleString("ja-JP")}<span className="text-sm font-normal text-gray-500">/月</span></>
              )}
            </div>
            {plan.monthlyUSD > 0 && plan.name !== "Premier" && (
              <div className="text-xs text-gray-500 mb-3">${plan.totalUSD.toFixed(2)}/月</div>
            )}

            <div className="space-y-1.5 text-sm mb-3">
              <div className="flex justify-between">
                <span className="text-gray-600">送信上限</span>
                <span className={plan.emailOk ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                  {plan.emailsPerMonth.toLocaleString()}通/月
                  {!plan.emailOk && " ×"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">コンタクト上限</span>
                <span className={plan.contactOk ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                  {plan.contacts.toLocaleString()}件
                  {!plan.contactOk && " ×"}
                </span>
              </div>
              {plan.overage > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>超過料金</span>
                  <span>+¥{Math.round(plan.overage * usdRate).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="flex flex-wrap gap-1">
                {plan.features.map((f) => (
                  <span key={f} className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div
              className={`mt-3 text-center text-xs py-1.5 rounded-full font-medium ${
                plan.fits
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {plan.fits ? "条件に対応" : "条件を超過"}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
        <p>※ 料金は2024年時点のSendGrid公式料金をもとにした概算です。</p>
        <p>※ Premierプランは送信量・要件により個別見積となります。</p>
        <p>※ 超過料金は概算であり、実際の料金はプランによって異なります。</p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このSendGrid料金試算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">プラン別送信上限・コンタクト数からベストプラン判定。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このSendGrid料金試算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "プラン別送信上限・コンタクト数からベストプラン判定。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
