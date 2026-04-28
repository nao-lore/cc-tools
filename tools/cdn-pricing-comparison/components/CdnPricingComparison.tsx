"use client";

import { useState, useMemo } from "react";

// ── 型定義 ────────────────────────────────────────────────────────────────────

type Provider = "Cloudflare" | "CloudFront" | "Fastly" | "BunnyCDN";
type Region = "NA_EU" | "Asia" | "AU";

// ── 為替レート ─────────────────────────────────────────────────────────────────

const USD_TO_JPY = 155;

// ── 料金定数 ──────────────────────────────────────────────────────────────────

// Cloudflare CDN (Pro plan for WAF etc; free plan has no data transfer cost)
// Free plan: unlimited bandwidth but no SLA / advanced features
// Pro: $20/month flat, unlimited bandwidth
// Business: $200/month
const CLOUDFLARE = {
  freeBandwidthGB: Infinity, // free plan: unlimited
  freeMonthly: 0,
  proMonthly: 20,
  businessMonthly: 200,
  // No per-GB transfer cost on any plan
  perGBCost: 0,
  waf: { free: true, pro: true, business: true },
  ddos: { free: true, pro: true, business: true },
  imageOptimization: { free: false, pro: true, business: true },
  analyticsRetentionDays: { free: 1, pro: 7, business: 30 },
};

// AWS CloudFront (2024 pricing)
const CLOUDFRONT = {
  // First 10 TB/month (NA/EU)
  tiers: [
    { upToGB: 10240, naEuPerGB: 0.0085, asiaPerGB: 0.014, auPerGB: 0.014 },
    { upToGB: 51200, naEuPerGB: 0.008, asiaPerGB: 0.013, auPerGB: 0.013 },
    { upToGB: 153600, naEuPerGB: 0.006, asiaPerGB: 0.009, auPerGB: 0.009 },
    { upToGB: Infinity, naEuPerGB: 0.005, asiaPerGB: 0.008, auPerGB: 0.008 },
  ] as { upToGB: number; naEuPerGB: number; asiaPerGB: number; auPerGB: number }[],
  freePerMonth: 1024, // 1TB free for first 12 months
  httpRequestPer10k: 0.0075,
  httpsRequestPer10k: 0.01,
  waf: false, // needs AWS WAF ($5/month + $1/rule/month + $0.60/million requests)
  ddos: true, // AWS Shield Standard included
  imageOptimization: false,
};

// Fastly
const FASTLY = {
  tiers: [
    { upToGB: 10240, naEuPerGB: 0.08, asiaPerGB: 0.16, auPerGB: 0.16 },
    { upToGB: 102400, naEuPerGB: 0.065, asiaPerGB: 0.13, auPerGB: 0.13 },
    { upToGB: Infinity, naEuPerGB: 0.05, asiaPerGB: 0.10, auPerGB: 0.10 },
  ] as { upToGB: number; naEuPerGB: number; asiaPerGB: number; auPerGB: number }[],
  minimumMonthly: 50, // $50/month minimum
  freePerMonth: 0,
  waf: false, // Next-Gen WAF is add-on ($190/month)
  ddos: true,
  imageOptimization: true, // Fastly Image Optimizer
};

// BunnyCDN
const BUNNY = {
  naEuPerGB: 0.005,
  asiaPerGB: 0.03,
  auPerGB: 0.06,
  // Volume discounts
  discounts: [
    { aboveGB: 500000, factor: 0.8 },
    { aboveGB: 100000, factor: 0.9 },
  ],
  freePerMonth: 0,
  minimumMonthly: 1,
  waf: false, // Perma-Cache add-on $9.99/month
  ddos: true,
  imageOptimization: true, // BunnyOptimizer $9.99/month
};

// ── 計算ロジック ───────────────────────────────────────────────────────────────

interface UserInput {
  trafficGB: number;
  region: Region;
  cloudflareFreePlan: boolean;
}

interface CostResult {
  provider: Provider;
  monthlyCost: number;
  breakdown: { label: string; cost: number }[];
  freeNote?: string;
  isCheapest?: boolean;
  hasFreeOption?: boolean;
}

function calcTieredCost(
  totalGB: number,
  tiers: { upToGB: number; naEuPerGB: number; asiaPerGB: number; auPerGB: number }[],
  region: Region
): number {
  let remaining = totalGB;
  let cost = 0;
  let prev = 0;

  for (const tier of tiers) {
    const tierGB = Math.min(remaining, tier.upToGB - prev);
    if (tierGB <= 0) break;

    const rate =
      region === "NA_EU"
        ? tier.naEuPerGB
        : region === "Asia"
        ? tier.asiaPerGB
        : tier.auPerGB;

    cost += tierGB * rate;
    remaining -= tierGB;
    prev = tier.upToGB;
    if (remaining <= 0) break;
  }
  return cost;
}

function calcCloudflare(input: UserInput): CostResult {
  const breakdown: { label: string; cost: number }[] = [];

  if (input.cloudflareFreePlan) {
    breakdown.push({ label: "帯域 (無制限・無料)", cost: 0 });
    return {
      provider: "Cloudflare",
      monthlyCost: 0,
      breakdown,
      freeNote: "無料プラン：帯域無制限",
      hasFreeOption: true,
    };
  }

  // Pro plan
  const base = CLOUDFLARE.proMonthly;
  breakdown.push({ label: "Pro プラン (帯域無制限)", cost: base });

  return {
    provider: "Cloudflare",
    monthlyCost: base,
    breakdown,
    freeNote: "帯域課金なし・固定料金",
  };
}

function calcCloudFront(input: UserInput): CostResult {
  const breakdown: { label: string; cost: number }[] = [];

  const billableGB = Math.max(0, input.trafficGB - CLOUDFRONT.freePerMonth);
  const transferCost = calcTieredCost(billableGB, CLOUDFRONT.tiers, input.region);

  if (CLOUDFRONT.freePerMonth > 0 && input.trafficGB <= CLOUDFRONT.freePerMonth) {
    breakdown.push({ label: `転送 (無料枠 ${CLOUDFRONT.freePerMonth / 1024}TB 以内)`, cost: 0 });
  } else {
    if (CLOUDFRONT.freePerMonth > 0) {
      breakdown.push({ label: `無料枠 ${CLOUDFRONT.freePerMonth / 1024}TB`, cost: 0 });
    }
    const regionLabel = input.region === "NA_EU" ? "NA/EU" : input.region === "Asia" ? "Asia" : "AU";
    breakdown.push({ label: `転送 ${billableGB.toLocaleString()}GB (${regionLabel})`, cost: transferCost });
  }

  // HTTP requests (仮: 1GB あたり約10万リクエスト、HTTPS比率80%)
  const estimatedRequests = input.trafficGB * 100000;
  const httpReqCost = estimatedRequests * 0.2 * (CLOUDFRONT.httpRequestPer10k / 10000);
  const httpsReqCost = estimatedRequests * 0.8 * (CLOUDFRONT.httpsRequestPer10k / 10000);
  const reqCost = httpReqCost + httpsReqCost;
  breakdown.push({ label: `リクエスト料金 (概算)`, cost: reqCost });

  const total = transferCost + reqCost;

  return {
    provider: "CloudFront",
    monthlyCost: total,
    breakdown,
    freeNote: input.trafficGB <= CLOUDFRONT.freePerMonth ? "初年度無料枠内" : undefined,
  };
}

function calcFastly(input: UserInput): CostResult {
  const breakdown: { label: string; cost: number }[] = [];

  const transferCost = calcTieredCost(input.trafficGB, FASTLY.tiers, input.region);
  const regionLabel = input.region === "NA_EU" ? "NA/EU" : input.region === "Asia" ? "Asia" : "AU";
  breakdown.push({ label: `転送 ${input.trafficGB.toLocaleString()}GB (${regionLabel})`, cost: transferCost });

  const total = Math.max(FASTLY.minimumMonthly, transferCost);
  if (transferCost < FASTLY.minimumMonthly) {
    breakdown.push({ label: `最低利用料金 $${FASTLY.minimumMonthly}/月`, cost: FASTLY.minimumMonthly - transferCost });
  }

  return {
    provider: "Fastly",
    monthlyCost: total,
    breakdown,
  };
}

function calcBunny(input: UserInput): CostResult {
  const breakdown: { label: string; cost: number }[] = [];

  const rate =
    input.region === "NA_EU"
      ? BUNNY.naEuPerGB
      : input.region === "Asia"
      ? BUNNY.asiaPerGB
      : BUNNY.auPerGB;

  let transferCost = input.trafficGB * rate;

  // ボリュームディスカウント
  let discountLabel = "";
  for (const d of BUNNY.discounts) {
    if (input.trafficGB > d.aboveGB) {
      transferCost = transferCost * d.factor;
      discountLabel = ` (${Math.round((1 - d.factor) * 100)}%OFF)`;
      break;
    }
  }

  const regionLabel = input.region === "NA_EU" ? "NA/EU $0.005/GB" : input.region === "Asia" ? "Asia $0.03/GB" : "AU $0.06/GB";
  breakdown.push({ label: `転送 ${input.trafficGB.toLocaleString()}GB (${regionLabel})${discountLabel}`, cost: transferCost });

  const total = Math.max(BUNNY.minimumMonthly, transferCost);
  if (transferCost < BUNNY.minimumMonthly) {
    breakdown.push({ label: `最低利用料金 $${BUNNY.minimumMonthly}/月`, cost: BUNNY.minimumMonthly - transferCost });
  }

  return {
    provider: "BunnyCDN",
    monthlyCost: total,
    breakdown,
  };
}

// ── 定数: ブランドカラー ───────────────────────────────────────────────────────

const BRAND: Record<Provider, { bg: string; border: string; badge: string; text: string; dot: string }> = {
  Cloudflare: {
    bg: "bg-orange-50",
    border: "border-orange-300",
    badge: "bg-orange-100 text-orange-800",
    text: "text-orange-600",
    dot: "bg-orange-500",
  },
  CloudFront: {
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    badge: "bg-yellow-100 text-yellow-800",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  Fastly: {
    bg: "bg-red-50",
    border: "border-red-300",
    badge: "bg-red-100 text-red-800",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  BunnyCDN: {
    bg: "bg-teal-50",
    border: "border-teal-300",
    badge: "bg-teal-100 text-teal-800",
    text: "text-teal-700",
    dot: "bg-teal-500",
  },
};

// ── 機能比較データ ─────────────────────────────────────────────────────────────

const FEATURES = [
  { label: "WAF", cloudflare: "◎ 無料", cloudfront: "△ 別途$5〜", fastly: "△ 別途$190〜", bunny: "× なし" },
  { label: "DDoS保護", cloudflare: "◎ 無料", cloudfront: "◎ Shield標準", fastly: "◎ 標準", bunny: "◎ 標準" },
  { label: "画像最適化", cloudflare: "○ Pro〜", cloudfront: "× なし", fastly: "◎ 標準", bunny: "○ $9.99/月" },
  { label: "無料枠", cloudflare: "◎ 帯域無制限", cloudfront: "○ 初年1TB/月", fastly: "× なし", bunny: "× なし" },
  { label: "東京PoP", cloudflare: "◎ あり", cloudfront: "◎ あり", fastly: "◎ あり", bunny: "◎ あり" },
  { label: "Anycast", cloudflare: "◎ あり", cloudfront: "◎ あり", fastly: "◎ あり", bunny: "◎ あり" },
  { label: "HTTP/3", cloudflare: "◎ あり", cloudfront: "◎ あり", fastly: "◎ あり", bunny: "◎ あり" },
  { label: "最低料金", cloudflare: "$0〜", cloudfront: "$0〜", fastly: "$50/月", bunny: "$1/月" },
];

// ── スライダーコンポーネント ───────────────────────────────────────────────────

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
}) {
  const display = formatValue ? formatValue(value) : `${value.toLocaleString()}`;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-900 font-semibold tabular-nums">
          {display} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-teal-500 h-2 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min.toLocaleString()} {unit}</span>
        <span>{max.toLocaleString()} {unit}</span>
      </div>
    </div>
  );
}

// ── メインコンポーネント ───────────────────────────────────────────────────────

export default function CdnPricingComparison() {
  const [trafficGB, setTrafficGB] = useState(1000);
  const [region, setRegion] = useState<Region>("NA_EU");
  const [cloudflareFreePlan, setCloudflareFreePlan] = useState(true);
  const [showJpy, setShowJpy] = useState(false);
  const [activeTab, setActiveTab] = useState<"calculator" | "features">("calculator");

  const input: UserInput = { trafficGB, region, cloudflareFreePlan };

  const results = useMemo<CostResult[]>(() => {
    const r = [
      calcCloudflare(input),
      calcCloudFront(input),
      calcFastly(input),
      calcBunny(input),
    ];
    const minCost = Math.min(...r.map((x) => x.monthlyCost));
    return r.map((x) => ({ ...x, isCheapest: x.monthlyCost === minCost }));
  }, [trafficGB, region, cloudflareFreePlan]);

  const fmt = (usd: number) => {
    if (showJpy) return `¥${Math.round(usd * USD_TO_JPY).toLocaleString()}`;
    return `$${usd.toFixed(2)}`;
  };

  const regionLabel = (r: Region) =>
    r === "NA_EU" ? "北米 / 欧州" : r === "Asia" ? "アジア" : "オーストラリア";

  return (
    <div className="space-y-6">
      {/* タブ + 通貨切替 */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(["calculator", "features"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "calculator" ? "料金計算" : "機能比較"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowJpy((v) => !v)}
          className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-200 text-gray-600 hover:bg-gray-300 transition-all"
        >
          {showJpy ? "USD表示" : "JPY表示"}
        </button>
      </div>

      {/* 料金計算タブ */}
      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 入力パネル */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-sm">
            <h2 className="font-semibold text-gray-800 text-lg">条件設定</h2>

            <Slider
              label="月間トラフィック"
              value={trafficGB}
              min={10}
              max={100000}
              step={10}
              unit="GB/月"
              onChange={setTrafficGB}
              formatValue={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}TB` : `${v}`}
            />

            {/* リージョン選択 */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">配信リージョン</span>
              <div className="flex flex-col gap-2">
                {(["NA_EU", "Asia", "AU"] as Region[]).map((r) => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="region"
                      value={r}
                      checked={region === r}
                      onChange={() => setRegion(r)}
                      className="accent-teal-500"
                    />
                    <span className="text-sm text-gray-700">{regionLabel(r)}</span>
                    {r === "Asia" && (
                      <span className="text-xs text-teal-600 font-medium">(日本含む)</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Cloudflareプラン */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <span className="text-sm font-medium text-gray-700">Cloudflare プラン</span>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cfplan"
                    checked={cloudflareFreePlan}
                    onChange={() => setCloudflareFreePlan(true)}
                    className="accent-teal-500"
                  />
                  <span className="text-sm text-gray-700">無料プラン ($0/月)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cfplan"
                    checked={!cloudflareFreePlan}
                    onChange={() => setCloudflareFreePlan(false)}
                    className="accent-teal-500"
                  />
                  <span className="text-sm text-gray-700">Pro プラン ($20/月)</span>
                </label>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              ※ 為替レート: 1 USD = {USD_TO_JPY} 円（概算）
            </p>
          </div>

          {/* 結果カード */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.map((r) => {
              const b = BRAND[r.provider];
              return (
                <div
                  key={r.provider}
                  className={`rounded-2xl border-2 p-5 shadow-sm transition-all ${
                    r.isCheapest ? `${b.bg} ${b.border}` : "bg-white border-gray-200"
                  }`}
                >
                  {/* ヘッダー */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${b.dot}`} />
                      <span className="font-bold text-gray-900">{r.provider}</span>
                    </div>
                    {r.isCheapest && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.badge}`}>
                        最安
                      </span>
                    )}
                  </div>

                  {/* 金額 */}
                  <div className="mb-3">
                    <span className={`text-3xl font-black ${r.isCheapest ? b.text : "text-gray-800"}`}>
                      {fmt(r.monthlyCost)}
                    </span>
                    <span className="text-gray-400 text-sm">/月</span>
                  </div>

                  {/* 無料・備考 */}
                  {r.hasFreeOption && (
                    <div className="mb-2 text-xs font-semibold text-green-700 bg-green-50 rounded-lg px-2 py-1 text-center">
                      無料枠対応
                    </div>
                  )}
                  {r.freeNote && (
                    <div className="mb-2 text-xs text-gray-400 text-center">{r.freeNote}</div>
                  )}

                  {/* 内訳 */}
                  <div className="space-y-1.5 border-t border-gray-100 pt-3">
                    {r.breakdown.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600">
                        <span className="truncate max-w-[150px]">{item.label}</span>
                        <span className="font-medium tabular-nums shrink-0 ml-1">
                          {fmt(item.cost)}
                        </span>
                      </div>
                    ))}
                  </div>
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このCDN 料金比較ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">主要CDN4社の料金をトラフィック量・リージョンから比較。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このCDN 料金比較ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "主要CDN4社の料金をトラフィック量・リージョンから比較。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 機能比較タブ */}
      {activeTab === "features" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-teal-50 border-b border-teal-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-32">機能</th>
                {(["Cloudflare", "CloudFront", "Fastly", "BunnyCDN"] as Provider[]).map((p) => (
                  <th key={p} className="text-center px-3 py-3 font-semibold text-gray-700">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${BRAND[p].dot}`} />
                      <span className="hidden sm:inline">{p}</span>
                      <span className="sm:hidden">{p.replace("CloudFront", "CF").replace("BunnyCDN", "Bunny")}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {FEATURES.map((row) => (
                <tr key={row.label} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">{row.label}</td>
                  <td className="px-3 py-3 text-center text-gray-600 text-xs">{row.cloudflare}</td>
                  <td className="px-3 py-3 text-center text-gray-600 text-xs">{row.cloudfront}</td>
                  <td className="px-3 py-3 text-center text-gray-600 text-xs">{row.fastly}</td>
                  <td className="px-3 py-3 text-center text-gray-600 text-xs">{row.bunny}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* リージョン別単価サマリ */}
          <div className="p-6 border-t border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">リージョン別転送単価</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs">
                    <th className="text-left pb-2">リージョン</th>
                    <th className="text-center pb-2">Cloudflare</th>
                    <th className="text-center pb-2">CloudFront</th>
                    <th className="text-center pb-2">Fastly</th>
                    <th className="text-center pb-2">BunnyCDN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { region: "北米 / 欧州", cf: "無料", cfront: "$0.0085/GB", fastly: "$0.08/GB", bunny: "$0.005/GB" },
                    { region: "アジア (日本)", cf: "無料", cfront: "$0.014/GB", fastly: "$0.16/GB", bunny: "$0.03/GB" },
                    { region: "オーストラリア", cf: "無料", cfront: "$0.014/GB", fastly: "$0.16/GB", bunny: "$0.06/GB" },
                  ].map((row) => (
                    <tr key={row.region} className="hover:bg-gray-50">
                      <td className="py-2 text-gray-700 font-medium text-xs">{row.region}</td>
                      <td className="py-2 text-center text-teal-600 font-semibold text-xs">{row.cf}</td>
                      <td className="py-2 text-center text-gray-600 text-xs">{row.cfront}</td>
                      <td className="py-2 text-center text-gray-600 text-xs">{row.fastly}</td>
                      <td className="py-2 text-center text-gray-600 text-xs">{row.bunny}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              ※ CloudFront は最初の10TB/月。Fastly は最初の10TB/月。BunnyCDN は定額制（大量割引あり）。
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        ※ 料金は2026年概算。最新情報は各社公式サイトを確認してください。Cloudflare 無料プランはSLAなし。
      </p>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CDN 料金比較",
  "description": "主要CDN4社の料金をトラフィック量・リージョンから比較",
  "url": "https://tools.loresync.dev/cdn-pricing-comparison",
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
