"use client";

import { useState, useMemo } from "react";

const USD_TO_JPY = 150;

interface ClusterTier {
  name: string;
  vcpu: number;
  ramGB: number;
  storageGB: number;
  pricePerHourUSD: number;
  description: string;
  provider: string;
}

const CLUSTER_TIERS: ClusterTier[] = [
  { name: "M0 (Free)", vcpu: 0, ramGB: 0.5, storageGB: 5, pricePerHourUSD: 0, description: "開発・テスト用", provider: "共有" },
  { name: "M2", vcpu: 0, ramGB: 1, storageGB: 2, pricePerHourUSD: 0.013, description: "スモールアプリ", provider: "共有" },
  { name: "M5", vcpu: 0, ramGB: 2, storageGB: 5, pricePerHourUSD: 0.027, description: "小規模アプリ", provider: "共有" },
  { name: "M10", vcpu: 2, ramGB: 2, storageGB: 10, pricePerHourUSD: 0.08, description: "本番環境の入門", provider: "専有" },
  { name: "M20", vcpu: 2, ramGB: 4, storageGB: 20, pricePerHourUSD: 0.20, description: "小〜中規模アプリ", provider: "専有" },
  { name: "M30", vcpu: 2, ramGB: 8, storageGB: 40, pricePerHourUSD: 0.54, description: "中規模アプリ", provider: "専有" },
  { name: "M40", vcpu: 4, ramGB: 16, storageGB: 80, pricePerHourUSD: 1.04, description: "高トラフィック向け", provider: "専有" },
  { name: "M50", vcpu: 8, ramGB: 32, storageGB: 160, pricePerHourUSD: 2.00, description: "大規模アプリ", provider: "専有" },
  { name: "M60", vcpu: 16, ramGB: 64, storageGB: 320, pricePerHourUSD: 3.95, description: "エンタープライズ", provider: "専有" },
];

const STORAGE_PRICE_PER_GB_USD = 0.10; // per GB/month beyond included
const TRANSFER_PRICE_PER_GB_USD = 0.01; // per GB outbound

const REGIONS = [
  { name: "東京 (ap-northeast-1)", multiplier: 1.1 },
  { name: "シンガポール (ap-southeast-1)", multiplier: 1.05 },
  { name: "米国東部 (us-east-1)", multiplier: 1.0 },
  { name: "EU (eu-west-1)", multiplier: 1.08 },
];

export default function MongodbAtlasCost() {
  const [tierIdx, setTierIdx] = useState(3);
  const [extraStorageGB, setExtraStorageGB] = useState(0);
  const [transferGB, setTransferGB] = useState(10);
  const [regionIdx, setRegionIdx] = useState(0);
  const [replicaSetNodes, setReplicaSetNodes] = useState(3);
  const [usdRate, setUsdRate] = useState(USD_TO_JPY);

  const tier = CLUSTER_TIERS[tierIdx];
  const region = REGIONS[regionIdx];

  const result = useMemo(() => {
    const hoursPerMonth = 730;
    const clusterHourlyUSD = tier.pricePerHourUSD * replicaSetNodes * region.multiplier;
    const clusterMonthlyUSD = clusterHourlyUSD * hoursPerMonth;
    const storageMonthlyUSD = extraStorageGB * STORAGE_PRICE_PER_GB_USD;
    const transferMonthlyUSD = transferGB * TRANSFER_PRICE_PER_GB_USD;
    const totalUSD = clusterMonthlyUSD + storageMonthlyUSD + transferMonthlyUSD;
    const totalJPY = totalUSD * usdRate;

    return {
      clusterMonthlyUSD,
      storageMonthlyUSD,
      transferMonthlyUSD,
      totalUSD,
      totalJPY,
    };
  }, [tier, replicaSetNodes, region, extraStorageGB, transferGB, usdRate]);

  return (
    <div className="space-y-6">
      {/* Cluster selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">クラスタ設定</h2>

        <div className="mb-5">
          <label className="text-sm font-medium text-gray-700 block mb-2">クラスタティア</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {CLUSTER_TIERS.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setTierIdx(i)}
                className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                  tierIdx === i
                    ? "border-green-500 bg-green-50 text-green-800"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-gray-500">
                  {t.pricePerHourUSD === 0 ? "無料" : `$${t.pricePerHourUSD}/時間`} — {t.description}
                </div>
                {t.vcpu > 0 && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    {t.vcpu} vCPU / {t.ramGB}GB RAM
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">リージョン</label>
            <select
              value={regionIdx}
              onChange={(e) => setRegionIdx(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {REGIONS.map((r, i) => (
                <option key={r.name} value={i}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              レプリカセット ノード数
            </label>
            <select
              value={replicaSetNodes}
              onChange={(e) => setReplicaSetNodes(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value={1}>1ノード（シングル）</option>
              <option value={3}>3ノード（推奨・HA）</option>
              <option value={5}>5ノード（高可用性）</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">追加ストレージ</label>
              <span className="text-sm font-bold text-green-600">{extraStorageGB} GB</span>
            </div>
            <input
              type="range"
              min={0}
              max={500}
              step={10}
              value={extraStorageGB}
              onChange={(e) => setExtraStorageGB(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              基本ストレージ（{tier.storageGB}GB）を超えた分 × $0.10/GB
            </p>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">月間データ転送量</label>
              <span className="text-sm font-bold text-green-600">{transferGB} GB</span>
            </div>
            <input
              type="range"
              min={0}
              max={1000}
              step={10}
              value={transferGB}
              onChange={(e) => setTransferGB(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
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
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <span className="text-sm text-gray-600">円</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="font-semibold text-green-800 text-lg">{tier.name} × {replicaSetNodes}ノード</p>
            <p className="text-sm text-green-600">{region.name}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-900">
              {tier.pricePerHourUSD === 0 && extraStorageGB === 0 && transferGB === 0
                ? "無料"
                : `¥${Math.round(result.totalJPY).toLocaleString("ja-JP")}`}
            </p>
            <p className="text-sm text-green-600">/月</p>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">費用内訳</h3>
        <div className="space-y-3">
          {[
            {
              label: `クラスタ費用（${tier.name} × ${replicaSetNodes}ノード × 730h × ×${region.multiplier}）`,
              usd: result.clusterMonthlyUSD,
            },
            {
              label: `追加ストレージ（${extraStorageGB}GB × $0.10）`,
              usd: result.storageMonthlyUSD,
            },
            {
              label: `データ転送（${transferGB}GB × $0.01）`,
              usd: result.transferMonthlyUSD,
            },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-700">{item.label}</span>
              <div className="text-right ml-2 shrink-0">
                <div className="font-medium text-gray-900">
                  ¥{Math.round(item.usd * usdRate).toLocaleString("ja-JP")}
                </div>
                <div className="text-xs text-gray-400">${item.usd.toFixed(2)}</div>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-800">月額合計</span>
            <div className="text-right">
              <div className="text-xl font-bold text-green-700">
                ¥{Math.round(result.totalJPY).toLocaleString("ja-JP")}
              </div>
              <div className="text-xs text-gray-500">${result.totalUSD.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier comparison */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">ティア別スペック一覧</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-600">ティア</th>
                <th className="text-right px-4 py-2 text-gray-600">vCPU</th>
                <th className="text-right px-4 py-2 text-gray-600">RAM</th>
                <th className="text-right px-4 py-2 text-gray-600">ストレージ</th>
                <th className="text-right px-4 py-2 text-gray-600">時間単価</th>
                <th className="text-right px-4 py-2 text-gray-600">月額（3ノード）</th>
              </tr>
            </thead>
            <tbody>
              {CLUSTER_TIERS.map((t, i) => (
                <tr
                  key={t.name}
                  onClick={() => setTierIdx(i)}
                  className={`border-t border-gray-100 cursor-pointer transition-colors ${
                    tierIdx === i ? "bg-green-50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {t.name}
                    {tierIdx === i && <span className="ml-2 text-xs text-green-600">選択中</span>}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    {t.vcpu === 0 ? "共有" : t.vcpu}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-600">{t.ramGB}GB</td>
                  <td className="px-4 py-2 text-right text-gray-600">{t.storageGB}GB</td>
                  <td className="px-4 py-2 text-right text-gray-600">
                    {t.pricePerHourUSD === 0 ? "無料" : `$${t.pricePerHourUSD}`}
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-gray-900">
                    {t.pricePerHourUSD === 0
                      ? "無料"
                      : `¥${Math.round(t.pricePerHourUSD * 3 * 730 * usdRate).toLocaleString()}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
        <p>※ 料金はAWS東京リージョン基準の概算です。GCP・Azure・リージョンにより異なります。</p>
        <p>※ M0は共有クラスタのため本番環境での使用は非推奨です。</p>
        <p>※ バックアップ・監視・暗号化などオプション費用は含まれていません。</p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このMongoDB Atlas料金試算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">クラスタサイズ・ストレージ・転送量から月額試算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このMongoDB Atlas料金試算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "クラスタサイズ・ストレージ・転送量から月額試算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MongoDB Atlas料金試算",
  "description": "クラスタサイズ・ストレージ・転送量から月額試算",
  "url": "https://tools.loresync.dev/mongodb-atlas-cost",
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
