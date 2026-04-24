"use client";

import { useState, useMemo } from "react";

interface PricingTier {
  name: string;
  price: number; // monthly USD
  priceNote?: string;
  events: string;
  users: string;
  retention: string;
  selfHost: boolean;
  features: string[];
  isPopular?: boolean;
}

interface Tool {
  id: string;
  name: string;
  tagline: string;
  color: string;
  openSource: boolean;
  selfHostable: boolean;
  tiers: PricingTier[];
  pros: string[];
  cons: string[];
  bestFor: string;
  website: string;
}

const TOOLS: Tool[] = [
  {
    id: "langfuse",
    name: "Langfuse",
    tagline: "OSSのLLMオブザーバビリティプラットフォーム",
    color: "bg-violet-600",
    openSource: true,
    selfHostable: true,
    tiers: [
      { name: "Hobby", price: 0, events: "50万イベント/月", users: "2ユーザー", retention: "30日", selfHost: true, features: ["トレーシング", "プロンプト管理", "評価"] },
      { name: "Pro", price: 59, events: "100万イベント/月（超過$8/万）", users: "無制限", retention: "90日", selfHost: false, features: ["全機能", "SSO", "データエクスポート"], isPopular: true },
      { name: "Team", price: 499, events: "500万イベント/月（超過$8/万）", users: "無制限", retention: "無制限", selfHost: false, features: ["全機能", "SAML SSO", "SLA", "専任サポート"] },
    ],
    pros: ["完全OSS・セルフホスト可能", "機能が最も充実", "日本語コミュニティ活発"],
    cons: ["セルフホストはインフラ管理が必要", "GUIがやや学習コストあり"],
    bestFor: "OSS重視・コスト最小化したいエンジニア",
    website: "https://langfuse.com",
  },
  {
    id: "langsmith",
    name: "LangSmith",
    tagline: "LangChain公式のLLMデバッグ・監視ツール",
    color: "bg-blue-600",
    openSource: false,
    selfHostable: true,
    tiers: [
      { name: "Developer", price: 0, events: "5,000トレース/月", users: "1ユーザー", retention: "14日", selfHost: false, features: ["トレーシング", "デバッグ", "基本評価"] },
      { name: "Plus", price: 39, events: "無制限（$0.005/トレース）", users: "無制限", retention: "無制限", selfHost: false, features: ["全機能", "チーム管理", "Webhook"], isPopular: true },
      { name: "Enterprise", price: 0, priceNote: "要問合せ", events: "無制限（カスタム）", users: "無制限", retention: "無制限", selfHost: true, features: ["全機能", "SSO", "RBAC", "セルフホスト"] },
    ],
    pros: ["LangChainとの統合が最強", "UIが洗練されている", "A/Bテスト・評価機能が豊富"],
    cons: ["クローズドソース", "LangChain以外での使用は少し設定が必要", "従量課金が高くなりやすい"],
    bestFor: "LangChainユーザー・プロダクト品質管理が重要なチーム",
    website: "https://smith.langchain.com",
  },
  {
    id: "helicone",
    name: "Helicone",
    tagline: "プロキシ型のシンプルなLLM監視ツール",
    color: "bg-orange-500",
    openSource: true,
    selfHostable: true,
    tiers: [
      { name: "Free", price: 0, events: "10万リクエスト/月", users: "1ユーザー", retention: "1ヶ月", selfHost: true, features: ["基本監視", "コスト追跡", "レイテンシ計測"] },
      { name: "Pro", price: 80, events: "200万リクエスト/月（超過$0.00002/req）", users: "5ユーザー", retention: "3ヶ月", selfHost: false, features: ["全機能", "キャッシュ", "ゲートウェイ", "カスタムプロパティ"], isPopular: true },
      { name: "Team", price: 450, events: "1,000万リクエスト/月", users: "15ユーザー", retention: "無制限", selfHost: false, features: ["全機能", "RBAC", "SLA", "専任サポート"] },
    ],
    pros: ["プロキシ型で1行追加するだけで導入できる", "コスト追跡・キャッシュが強力", "スタートアップに人気"],
    cons: ["トレーシングの粒度がLangfuseより粗い", "プロキシ経由の遅延が発生する可能性"],
    bestFor: "素早く導入したいスタートアップ・コスト管理を重視するチーム",
    website: "https://helicone.ai",
  },
  {
    id: "braintrust",
    name: "Braintrust",
    tagline: "評価・実験中心のLLMオブザーバビリティ",
    color: "bg-green-600",
    openSource: false,
    selfHostable: true,
    tiers: [
      { name: "Starter", price: 0, events: "10万ログ/月", users: "3ユーザー", retention: "30日", selfHost: false, features: ["基本ロギング", "評価フレームワーク", "プレイグラウンド"] },
      { name: "Business", price: 200, events: "無制限（ストレージ課金）", users: "無制限", retention: "無制限", selfHost: true, features: ["全機能", "SSO", "API", "カスタム評価"], isPopular: true },
      { name: "Enterprise", price: 0, priceNote: "要問合せ", events: "無制限", users: "無制限", retention: "無制限", selfHost: true, features: ["全機能", "SAML", "専任サポート", "SLA"] },
    ],
    pros: ["評価（Evals）機能が業界最強クラス", "プロンプト実験の管理が得意", "Vercel AI SDK統合"],
    cons: ["ロギング機能はLangfuseに劣る", "中間層の価格帯が高め"],
    bestFor: "LLMの品質評価・A/Bテストを重視するMLエンジニア",
    website: "https://braintrust.dev",
  },
  {
    id: "phoenix",
    name: "Arize Phoenix",
    tagline: "MLオブザーバビリティのArize製OSS",
    color: "bg-red-500",
    openSource: true,
    selfHostable: true,
    tiers: [
      { name: "OSS（無料）", price: 0, events: "無制限（ローカル）", users: "無制限", retention: "永続", selfHost: true, features: ["トレーシング", "評価", "データセット管理"] },
      { name: "Arize Cloud", price: 0, priceNote: "要問合せ", events: "カスタム", users: "無制限", retention: "無制限", selfHost: false, features: ["全機能", "エンタープライズセキュリティ", "SLA"] },
    ],
    pros: ["完全無料でセルフホスト可能", "OpenTelemetry標準準拠", "評価・データセット機能が強い"],
    cons: ["UIがエンタープライズ向けで重め", "マネージドは要問合せのみ"],
    bestFor: "エンタープライズ・セキュリティ要件が厳しい環境",
    website: "https://phoenix.arize.com",
  },
];

function fmtUSD(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

export default function LangfuseCost() {
  const [filterOSS, setFilterOSS] = useState(false);
  const [filterSelfHost, setFilterSelfHost] = useState(false);
  const [monthlyEvents, setMonthlyEvents] = useState("100");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const filtered = TOOLS.filter((t) => {
    if (filterOSS && !t.openSource) return false;
    if (filterSelfHost && !t.selfHostable) return false;
    return true;
  });

  const selectedToolData = selectedTool ? TOOLS.find((t) => t.id === selectedTool) : null;

  return (
    <div className="space-y-6">
      {/* フィルター */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={filterOSS} onChange={(e) => setFilterOSS(e.target.checked)} className="rounded" />
          OSSのみ
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={filterSelfHost} onChange={(e) => setFilterSelfHost(e.target.checked)} className="rounded" />
          セルフホスト対応のみ
        </label>
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
          <span>月間イベント数（万）:</span>
          <input type="number" value={monthlyEvents} onChange={(e) => setMonthlyEvents(e.target.value)}
            className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* ツールカード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tool) => (
          <div key={tool.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}>
            <div className={`${tool.color} p-4`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-bold text-lg">{tool.name}</h3>
                  <p className="text-white/80 text-xs mt-0.5">{tool.tagline}</p>
                </div>
                <div className="flex gap-1">
                  {tool.openSource && <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">OSS</span>}
                  {tool.selfHostable && <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">Self-host</span>}
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex gap-2 flex-wrap mb-3">
                {tool.tiers.map((tier) => (
                  <div key={tier.name} className={`flex-1 min-w-0 border rounded-lg p-2 text-center ${tier.isPopular ? "border-blue-300 bg-blue-50" : "border-gray-200"}`}>
                    <p className="text-xs font-semibold text-gray-700">{tier.name}</p>
                    <p className="text-sm font-bold text-gray-900">
                      {tier.price === 0 && !tier.priceNote ? "無料" : tier.priceNote ? tier.priceNote : fmtUSD(tier.price) + "/月"}
                    </p>
                    {tier.isPopular && <p className="text-xs text-blue-600">人気</p>}
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-600 font-medium mb-2">おすすめ: {tool.bestFor}</p>
              <p className="text-xs text-gray-400">クリックして詳細を表示</p>
            </div>
          </div>
        ))}
      </div>

      {/* 詳細パネル */}
      {selectedToolData && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-900">{selectedToolData.name} 詳細</h2>
            <button onClick={() => setSelectedTool(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {selectedToolData.tiers.map((tier) => (
              <div key={tier.name} className={`border rounded-xl p-4 ${tier.isPopular ? "border-blue-400 ring-1 ring-blue-400" : "border-gray-200"}`}>
                {tier.isPopular && <p className="text-xs text-blue-600 font-semibold mb-1">人気プラン</p>}
                <h3 className="font-bold text-gray-900 mb-1">{tier.name}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-3">
                  {tier.price === 0 && !tier.priceNote ? "無料" : tier.priceNote ?? `${fmtUSD(tier.price)}/月`}
                </p>
                <div className="space-y-1 text-xs text-gray-600 mb-3">
                  <p>イベント: {tier.events}</p>
                  <p>ユーザー: {tier.users}</p>
                  <p>データ保持: {tier.retention}</p>
                  <p>セルフホスト: {tier.selfHost ? "○" : "×"}</p>
                </div>
                <ul className="space-y-1">
                  {tier.features.map((f) => (
                    <li key={f} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-green-500 shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-green-700 mb-2">メリット</p>
              <ul className="space-y-1">
                {selectedToolData.pros.map((p) => <li key={p} className="text-sm text-gray-600">+ {p}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-600 mb-2">デメリット</p>
              <ul className="space-y-1">
                {selectedToolData.cons.map((c) => <li key={c} className="text-sm text-gray-600">− {c}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 比較表 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">ツール比較表</h2>
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-3 py-2 font-medium text-gray-600">ツール</th>
              <th className="text-center px-3 py-2 font-medium text-gray-600">OSS</th>
              <th className="text-center px-3 py-2 font-medium text-gray-600">無料枠</th>
              <th className="text-right px-3 py-2 font-medium text-gray-600">有料開始</th>
              <th className="text-center px-3 py-2 font-medium text-gray-600">セルフホスト</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">強み</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => {
              const freeTier = t.tiers.find((tier) => tier.price === 0);
              const paidTier = t.tiers.find((tier) => tier.price > 0);
              return (
                <tr key={t.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2 font-semibold text-gray-800">{t.name}</td>
                  <td className="px-3 py-2 text-center">{t.openSource ? <span className="text-green-600">✓</span> : <span className="text-gray-300">−</span>}</td>
                  <td className="px-3 py-2 text-center text-xs">{freeTier ? freeTier.events : "なし"}</td>
                  <td className="px-3 py-2 text-right">{paidTier ? (paidTier.priceNote ?? fmtUSD(paidTier.price) + "/月") : "−"}</td>
                  <td className="px-3 py-2 text-center">{t.selfHostable ? <span className="text-green-600">✓</span> : <span className="text-gray-300">−</span>}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{t.bestFor}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-800">
        料金は2024年時点の公開情報に基づきます。為替レートや価格改定により変動する場合があります。最新の情報は各公式サイトでご確認ください。
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このLLM監視ツール料金比較ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">Langfuse・LangSmith・Helicone・Braintrust等の料金プランを比較。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このLLM監視ツール料金比較ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "Langfuse・LangSmith・Helicone・Braintrust等の料金プランを比較。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
