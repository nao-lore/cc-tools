"use client";

import { useState, useMemo } from "react";

const USD_TO_JPY = 150;

interface Droplet {
  name: string;
  vcpu: number;
  ramGB: number;
  diskGB: number;
  bandwidthTB: number;
  pricePerMonthUSD: number;
  category: string;
}

const DROPLETS: Droplet[] = [
  { name: "Basic 1GB", vcpu: 1, ramGB: 1, diskGB: 25, bandwidthTB: 1, pricePerMonthUSD: 6, category: "Basic" },
  { name: "Basic 2GB", vcpu: 1, ramGB: 2, diskGB: 50, bandwidthTB: 2, pricePerMonthUSD: 12, category: "Basic" },
  { name: "Basic 4GB", vcpu: 2, ramGB: 4, diskGB: 80, bandwidthTB: 4, pricePerMonthUSD: 24, category: "Basic" },
  { name: "Basic 8GB", vcpu: 4, ramGB: 8, diskGB: 160, bandwidthTB: 5, pricePerMonthUSD: 48, category: "Basic" },
  { name: "General 8GB", vcpu: 2, ramGB: 8, diskGB: 25, bandwidthTB: 4, pricePerMonthUSD: 63, category: "General" },
  { name: "General 16GB", vcpu: 4, ramGB: 16, diskGB: 50, bandwidthTB: 5, pricePerMonthUSD: 126, category: "General" },
  { name: "CPU-Opt 4GB", vcpu: 2, ramGB: 4, diskGB: 25, bandwidthTB: 4, pricePerMonthUSD: 42, category: "CPU-Opt" },
  { name: "CPU-Opt 8GB", vcpu: 4, ramGB: 8, diskGB: 50, bandwidthTB: 5, pricePerMonthUSD: 84, category: "CPU-Opt" },
  { name: "Mem-Opt 16GB", vcpu: 2, ramGB: 16, diskGB: 50, bandwidthTB: 4, pricePerMonthUSD: 84, category: "Mem-Opt" },
  { name: "Mem-Opt 32GB", vcpu: 4, ramGB: 32, diskGB: 100, bandwidthTB: 5, pricePerMonthUSD: 168, category: "Mem-Opt" },
];

interface SpacesTier {
  name: string;
  storageGB: number;
  bandwidthGB: number;
  priceUSD: number;
}

const SPACES_TIERS: SpacesTier[] = [
  { name: "なし", storageGB: 0, bandwidthGB: 0, priceUSD: 0 },
  { name: "250GB / 1TB", storageGB: 250, bandwidthGB: 1024, priceUSD: 21 },
  { name: "500GB / 2TB", storageGB: 500, bandwidthGB: 2048, priceUSD: 42 },
];

interface ManagedDB {
  name: string;
  type: string;
  nodes: number;
  priceUSD: number;
}

const MANAGED_DBS: ManagedDB[] = [
  { name: "なし", type: "", nodes: 0, priceUSD: 0 },
  { name: "PostgreSQL 1GB (1node)", type: "PostgreSQL", nodes: 1, priceUSD: 15 },
  { name: "PostgreSQL 4GB (2node)", type: "PostgreSQL", nodes: 2, priceUSD: 60 },
  { name: "MySQL 1GB (1node)", type: "MySQL", nodes: 1, priceUSD: 15 },
  { name: "Redis 1GB (1node)", type: "Redis", nodes: 1, priceUSD: 15 },
  { name: "MongoDB 2GB (1node)", type: "MongoDB", nodes: 1, priceUSD: 30 },
];

const LOAD_BALANCER_USD = 12;

function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, string> = {
    Basic: "bg-gray-100 text-gray-600",
    General: "bg-blue-100 text-blue-700",
    "CPU-Opt": "bg-orange-100 text-orange-700",
    "Mem-Opt": "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${map[category] ?? "bg-gray-100 text-gray-600"}`}>
      {category}
    </span>
  );
}

export default function DigitalOceanPricing() {
  const [dropletIdx, setDropletIdx] = useState(1);
  const [dropletCount, setDropletCount] = useState(1);
  const [spacesIdx, setSpacesIdx] = useState(0);
  const [dbIdx, setDbIdx] = useState(0);
  const [loadBalancer, setLoadBalancer] = useState(false);
  const [usdRate, setUsdRate] = useState(USD_TO_JPY);

  const droplet = DROPLETS[dropletIdx];
  const spaces = SPACES_TIERS[spacesIdx];
  const db = MANAGED_DBS[dbIdx];

  const result = useMemo(() => {
    const dropletUSD = droplet.pricePerMonthUSD * dropletCount;
    const spacesUSD = spaces.priceUSD;
    const dbUSD = db.priceUSD;
    const lbUSD = loadBalancer ? LOAD_BALANCER_USD : 0;
    const totalUSD = dropletUSD + spacesUSD + dbUSD + lbUSD;
    const totalJPY = totalUSD * usdRate;
    return { dropletUSD, spacesUSD, dbUSD, lbUSD, totalUSD, totalJPY };
  }, [droplet, dropletCount, spaces, db, loadBalancer, usdRate]);

  return (
    <div className="space-y-6">
      {/* Droplet */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Droplet（仮想マシン）</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {DROPLETS.map((d, i) => (
            <button
              key={d.name}
              onClick={() => setDropletIdx(i)}
              className={`flex items-center justify-between text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                dropletIdx === i
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div>
                <span className="font-medium mr-2">{d.name}</span>
                <CategoryBadge category={d.category} />
                <div className="text-xs text-gray-500 mt-0.5">
                  {d.vcpu} vCPU / {d.ramGB}GB RAM / {d.diskGB}GB SSD
                </div>
              </div>
              <div className="text-right ml-2 shrink-0">
                <div className="font-bold text-gray-900">${d.pricePerMonthUSD}</div>
                <div className="text-xs text-gray-500">/月</div>
              </div>
            </button>
          ))}
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">台数</label>
            <span className="text-sm font-bold text-blue-600">{dropletCount} 台</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={dropletCount}
            onChange={(e) => setDropletCount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* Options */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">オプションサービス</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Spaces (オブジェクトストレージ)</label>
            <select
              value={spacesIdx}
              onChange={(e) => setSpacesIdx(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {SPACES_TIERS.map((s, i) => (
                <option key={s.name} value={i}>
                  {s.name} {s.priceUSD > 0 ? `($${s.priceUSD}/月)` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Managed Database</label>
            <select
              value={dbIdx}
              onChange={(e) => setDbIdx(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {MANAGED_DBS.map((d, i) => (
                <option key={d.name} value={i}>
                  {d.name} {d.priceUSD > 0 ? `($${d.priceUSD}/月)` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">ロードバランサー</label>
            <button
              onClick={() => setLoadBalancer(!loadBalancer)}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                loadBalancer
                  ? "bg-blue-50 border-blue-400 text-blue-700"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {loadBalancer ? `あり（$${LOAD_BALANCER_USD}/月）` : "なし"}
            </button>
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

      {/* Total */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-blue-800 text-lg">月額合計</p>
            <p className="text-sm text-blue-600">${result.totalUSD.toFixed(2)} USD</p>
          </div>
          <p className="text-3xl font-bold text-blue-900">
            ¥{Math.round(result.totalJPY).toLocaleString("ja-JP")}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">費用内訳</h3>
        <div className="space-y-2.5 text-sm">
          {[
            {
              label: `Droplet: ${droplet.name} × ${dropletCount}台`,
              usd: result.dropletUSD,
              show: true,
            },
            {
              label: `Spaces: ${spaces.name}`,
              usd: result.spacesUSD,
              show: spaces.priceUSD > 0,
            },
            {
              label: `Managed DB: ${db.name}`,
              usd: result.dbUSD,
              show: db.priceUSD > 0,
            },
            {
              label: "ロードバランサー",
              usd: result.lbUSD,
              show: loadBalancer,
            },
          ]
            .filter((item) => item.show)
            .map((item) => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-700">{item.label}</span>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    ¥{Math.round(item.usd * usdRate).toLocaleString("ja-JP")}
                  </div>
                  <div className="text-xs text-gray-400">${item.usd.toFixed(2)}</div>
                </div>
              </div>
            ))}
          <div className="flex justify-between items-center pt-2">
            <span className="font-semibold text-gray-800">合計</span>
            <div className="text-right">
              <div className="text-xl font-bold text-blue-700">
                ¥{Math.round(result.totalJPY).toLocaleString("ja-JP")}
              </div>
              <div className="text-xs text-gray-400">${result.totalUSD.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
        <p>※ 料金は2024年時点のDigitalOcean公式料金をもとにした概算です。</p>
        <p>※ Dropletは1時間単位の課金です。月730時間で計算しています。</p>
        <p>※ 帯域幅超過料金（$0.01/GB）は含まれていません。</p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このDigitalOcean料金試算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">Droplet・Spaces・Managed DBの月額を試算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このDigitalOcean料金試算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "Droplet・Spaces・Managed DBの月額を試算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
