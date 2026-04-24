"use client";
import { useState } from "react";

interface Plan {
  name: string;
  monthlyBase: number;
  perMember: number;
  initialFee: number;
}

interface SaasProduct {
  id: string;
  name: string;
  vendor: string;
  origin: "JP" | "US" | "EU";
  plans: Plan[];
  features: Record<string, boolean | string>;
  targetSize: string;
  url: string;
  notes: string;
}

const FEATURES = [
  { key: "memberMgmt", label: "会員管理" },
  { key: "reservation", label: "予約システム" },
  { key: "payment", label: "オンライン決済" },
  { key: "app", label: "会員アプリ" },
  { key: "attendance", label: "入退室管理" },
  { key: "shift", label: "スタッフシフト" },
  { key: "analytics", label: "売上分析" },
  { key: "pos", label: "POS/物販" },
  { key: "api", label: "API連携" },
  { key: "multiLocation", label: "多店舗対応" },
  { key: "trialFree", label: "無料トライアル" },
  { key: "support", label: "日本語サポート" },
];

const PRODUCTS: SaasProduct[] = [
  {
    id: "hacomono",
    name: "hacomono",
    vendor: "hacomono株式会社",
    origin: "JP",
    plans: [
      { name: "スタンダード", monthlyBase: 33000, perMember: 0, initialFee: 0 },
    ],
    features: { memberMgmt: true, reservation: true, payment: true, app: true, attendance: true, shift: true, analytics: true, pos: true, api: true, multiLocation: true, trialFree: true, support: true },
    targetSize: "中小〜大規模",
    url: "https://hacomono.jp",
    notes: "スポーツクラブ・ジム特化。入退室・予約・決済を一元管理。",
  },
  {
    id: "coubic",
    name: "Coubic",
    vendor: "Coubic株式会社",
    origin: "JP",
    plans: [
      { name: "フリー", monthlyBase: 0, perMember: 0, initialFee: 0 },
      { name: "スタンダード", monthlyBase: 9800, perMember: 0, initialFee: 0 },
      { name: "プロ", monthlyBase: 19800, perMember: 0, initialFee: 0 },
    ],
    features: { memberMgmt: true, reservation: true, payment: true, app: false, attendance: false, shift: false, analytics: true, pos: false, api: false, multiLocation: false, trialFree: true, support: true },
    targetSize: "小規模〜中規模",
    url: "https://coubic.com",
    notes: "予約管理に特化。フィットネス・ヨガスタジオに人気。",
  },
  {
    id: "mindbody",
    name: "Mindbody",
    vendor: "Mindbody Inc.",
    origin: "US",
    plans: [
      { name: "Starter", monthlyBase: 12900, perMember: 0, initialFee: 0 },
      { name: "Accelerate", monthlyBase: 25900, perMember: 0, initialFee: 0 },
      { name: "Ultimate", monthlyBase: 43900, perMember: 0, initialFee: 0 },
    ],
    features: { memberMgmt: true, reservation: true, payment: true, app: true, attendance: true, shift: true, analytics: true, pos: true, api: true, multiLocation: true, trialFree: false, support: false },
    targetSize: "中規模〜大規模",
    url: "https://www.mindbodyonline.com",
    notes: "グローバルスタンダード。多機能だが日本語サポートは限定的。",
  },
  {
    id: "gymmaster",
    name: "GymMaster",
    vendor: "Treshna Enterprises",
    origin: "US",
    plans: [
      { name: "Essential", monthlyBase: 8900, perMember: 0, initialFee: 30000 },
      { name: "Premium", monthlyBase: 19800, perMember: 0, initialFee: 30000 },
    ],
    features: { memberMgmt: true, reservation: true, payment: true, app: true, attendance: true, shift: false, analytics: true, pos: true, api: true, multiLocation: true, trialFree: true, support: false },
    targetSize: "小規模〜中規模",
    url: "https://gymmaster.com",
    notes: "24時間ジムに強い。入退室デバイス連携が充実。",
  },
  {
    id: "studio-director",
    name: "Studio Director",
    vendor: "The Studio Director",
    origin: "US",
    plans: [
      { name: "Basic", monthlyBase: 5900, perMember: 0, initialFee: 0 },
      { name: "Pro", monthlyBase: 11900, perMember: 0, initialFee: 0 },
    ],
    features: { memberMgmt: true, reservation: true, payment: true, app: false, attendance: false, shift: true, analytics: true, pos: false, api: false, multiLocation: false, trialFree: true, support: false },
    targetSize: "小規模",
    url: "https://www.thestudiodirector.com",
    notes: "ダンス・体操スタジオ向け。シンプルで低価格。",
  },
  {
    id: "fitbeat",
    name: "FitBeat",
    vendor: "FitBeat株式会社",
    origin: "JP",
    plans: [
      { name: "ライト", monthlyBase: 9800, perMember: 0, initialFee: 0 },
      { name: "スタンダード", monthlyBase: 29800, perMember: 0, initialFee: 0 },
    ],
    features: { memberMgmt: true, reservation: true, payment: true, app: true, attendance: true, shift: false, analytics: true, pos: false, api: false, multiLocation: false, trialFree: true, support: true },
    targetSize: "小規模〜中規模",
    url: "https://fitbeat.jp",
    notes: "国産ジム管理SaaS。QRコード入退室対応。",
  },
];

export default function GymManagementComparison() {
  const [selectedIds, setSelectedIds] = useState<string[]>(["hacomono", "coubic", "mindbody"]);
  const [memberCount, setMemberCount] = useState(100);
  const [filterOrigin, setFilterOrigin] = useState<"all" | "JP" | "US">("all");
  const [highlightFeature, setHighlightFeature] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const filtered = PRODUCTS.filter((p) => filterOrigin === "all" || p.origin === filterOrigin);
  const selected = PRODUCTS.filter((p) => selectedIds.includes(p.id));

  const calcMonthly = (p: SaasProduct) => {
    const cheapest = p.plans.reduce((min, pl) => pl.monthlyBase < min.monthlyBase ? pl : min, p.plans[0]);
    return cheapest.monthlyBase + cheapest.perMember * memberCount;
  };

  const FeatureCell = ({ value }: { value: boolean | string }) => {
    if (value === true) return <span className="text-green-600 text-lg">✓</span>;
    if (value === false) return <span className="text-gray-300 text-lg">—</span>;
    return <span className="text-xs text-gray-600">{value}</span>;
  };

  const OriginBadge = ({ origin }: { origin: string }) => (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${origin === "JP" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{origin}</span>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">会員数</label>
            <div className="flex items-center gap-2">
              <input type="number" min={1} max={10000} value={memberCount} onChange={(e) => setMemberCount(Number(e.target.value))}
                className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <span className="text-sm text-gray-500">名</span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">国産/海外</label>
            <div className="flex gap-1">
              {(["all", "JP", "US"] as const).map((o) => (
                <button key={o} onClick={() => setFilterOrigin(o)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${filterOrigin === o ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  {o === "all" ? "すべて" : o}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {filtered.map((p) => (
            <label key={p.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${selectedIds.includes(p.id) ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
              <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="accent-blue-600" />
              <span className="text-sm font-medium text-gray-800">{p.name}</span>
              <OriginBadge origin={p.origin} />
            </label>
          ))}
        </div>
      </div>

      {/* Cost comparison */}
      {selected.length > 0 && (
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-800 mb-4">月額コスト比較 (会員{memberCount}名)</h2>
          <div className="space-y-3">
            {[...selected].sort((a, b) => calcMonthly(a) - calcMonthly(b)).map((p) => {
              const monthly = calcMonthly(p);
              const maxMonthly = Math.max(...selected.map(calcMonthly));
              return (
                <div key={p.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-800 flex items-center gap-2">{p.name} <OriginBadge origin={p.origin} /></span>
                    <span className="text-sm font-bold text-gray-900">{monthly === 0 ? "無料プランあり" : `¥${monthly.toLocaleString()}/月〜`}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: monthly === 0 ? "5%" : `${(monthly / maxMonthly) * 100}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{p.targetSize}</div>
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このジム管理システム比較ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">ジム・フィットネススタジオ向けSaaSの機能・料金を横断比較。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このジム管理システム比較ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "ジム・フィットネススタジオ向けSaaSの機能・料金を横断比較。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Feature comparison table */}
      {selected.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">機能比較</h2>
            <p className="text-xs text-gray-500 mt-0.5">機能名をクリックでハイライト</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600 min-w-[140px]">機能</th>
                  {selected.map((p) => (
                    <th key={p.id} className="px-4 py-3 text-center text-gray-700 min-w-[100px]">
                      <div>{p.name}</div>
                      <OriginBadge origin={p.origin} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f) => (
                  <tr key={f.key}
                    onClick={() => setHighlightFeature(highlightFeature === f.key ? null : f.key)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${highlightFeature === f.key ? "bg-yellow-50" : "hover:bg-gray-50"}`}>
                    <td className="px-4 py-2 font-medium text-gray-800">{f.label}</td>
                    {selected.map((p) => (
                      <td key={p.id} className="px-4 py-2 text-center">
                        <FeatureCell value={p.features[f.key]} />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="px-4 py-2 font-semibold text-gray-800">月額(最安)</td>
                  {selected.map((p) => (
                    <td key={p.id} className="px-4 py-2 text-center font-bold text-gray-900">
                      {calcMonthly(p) === 0 ? <span className="text-green-600">無料〜</span> : `¥${calcMonthly(p).toLocaleString()}`}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cards */}
      {selected.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selected.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{p.name}</h3>
                <OriginBadge origin={p.origin} />
              </div>
              <p className="text-xs text-gray-500 mb-2">{p.vendor} | {p.targetSize}</p>
              <p className="text-sm text-gray-700 mb-3">{p.notes}</p>
              <div className="space-y-1">
                {p.plans.map((pl) => (
                  <div key={pl.name} className="flex justify-between text-xs text-gray-600">
                    <span>{pl.name}</span>
                    <span className="font-medium">{pl.monthlyBase === 0 ? "無料" : `¥${pl.monthlyBase.toLocaleString()}/月`}{pl.initialFee > 0 ? ` + 初期¥${pl.initialFee.toLocaleString()}` : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
