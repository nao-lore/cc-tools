"use client";

import { useState, useCallback } from "react";

// ── 料金定数 ──────────────────────────────────────────────────────────────────

const PLANS = {
  starter: {
    label: "Starter",
    baseCost: 0,
    limits: {
      bandwidth: 100,       // GB/月
      buildMinutes: 300,    // 分/月
      fnRequests: 125,      // K req/月
      fnRuntime: 125,       // K秒/月（sites pack相当）
      members: 1,
    },
  },
  pro: {
    label: "Pro",
    baseCost: 19,           // USD/メンバー/月
    limits: {
      bandwidth: 1000,      // GB/月 (1TB)
      buildMinutes: 25000,  // 分/月
      fnRequests: 125,      // K req/月 (基本同じ、追加パック購入)
      fnRuntime: 125,       // K秒/月
    },
    overage: {
      bandwidth: 20 / 100,        // $20/100GB → per GB
      buildMinutes: 7 / 500,      // $7/500分 → per 分
      fnPack: 25,                 // $25/site pack (500K req + 500K秒)
    },
  },
} as const;

// Vercel比較用定数
const VERCEL_PRO = {
  baseCost: 20,       // USD/メンバー/月
  bandwidth: 1024,    // GB
  buildHours: 100,    // hours = 6000分
};

// ── 型 ───────────────────────────────────────────────────────────────────────

type Plan = "starter" | "pro";

interface Usage {
  bandwidth: number;       // GB/月
  buildMinutes: number;    // 分/月
  fnRequests: number;      // K req/月
  fnRuntime: number;       // K秒/月
}

interface CostBreakdown {
  base: number;
  bandwidthOverage: number;
  buildOverage: number;
  fnPacks: number;
  fnPackCount: number;
  total: number;
}

// ── ユーティリティ ─────────────────────────────────────────────────────────────

function calcProCost(usage: Usage, members: number): CostBreakdown {
  const p = PLANS.pro;
  const lim = p.limits;
  const ov = p.overage;

  const base = p.baseCost * members;
  const bandwidthOverage = Math.max(0, usage.bandwidth - lim.bandwidth) * ov.bandwidth;
  const buildOverage = Math.max(0, usage.buildMinutes - lim.buildMinutes) * ov.buildMinutes;

  // Functions: 125K req無料、超過分は$25/site pack（500K req + 500K秒セット）
  const extraReqs = Math.max(0, usage.fnRequests - lim.fnRequests);
  const extraRuntime = Math.max(0, usage.fnRuntime - lim.fnRuntime);
  const packsByReq = Math.ceil(extraReqs / 500);
  const packsByRuntime = Math.ceil(extraRuntime / 500);
  const fnPackCount = Math.max(packsByReq, packsByRuntime);
  const fnPacks = fnPackCount * ov.fnPack;

  const total = base + bandwidthOverage + buildOverage + fnPacks;

  return {
    base,
    bandwidthOverage,
    buildOverage,
    fnPacks,
    fnPackCount,
    total,
  };
}

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtJPY(usd: number, rate: number): string {
  return Math.round(usd * rate).toLocaleString("ja-JP");
}

// ── サブコンポーネント ─────────────────────────────────────────────────────────

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  freeLimit: number | null;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, step, unit, freeLimit, onChange }: SliderRowProps) {
  const overLimit = freeLimit !== null && value > freeLimit;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
            className="w-24 text-right text-sm bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-white focus:outline-none focus:border-gray-400"
          />
          <span className="text-xs text-gray-500 w-20">{unit}</span>
          {freeLimit !== null && (
            <span
              className={`text-xs font-semibold w-16 text-right ${overLimit ? "text-red-400" : "text-green-400"}`}
            >
              {overLimit ? "超過" : "枠内"}
            </span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: freeLimit !== null
            ? `linear-gradient(to right, ${overLimit ? "#ef4444" : "#00C7B7"} ${(value / max) * 100}%, #374151 ${(value / max) * 100}%)`
            : `linear-gradient(to right, #00C7B7 ${(value / max) * 100}%, #374151 ${(value / max) * 100}%)`,
        }}
      />
      {freeLimit !== null && (
        <div className="flex justify-end">
          <span className="text-xs text-gray-600">無料枠: {freeLimit.toLocaleString()} {unit}</span>
        </div>
      )}
    </div>
  );
}

interface CostLineProps {
  label: string;
  value: number;
  rate: number;
  highlight?: boolean;
  note?: string;
}

function CostLine({ label, value, rate, highlight, note }: CostLineProps) {
  if (value === 0 && !highlight) return null;
  return (
    <div className={`flex justify-between text-sm text-gray-300 ${highlight ? "font-bold text-white text-base border-t border-gray-700 pt-3 mt-1" : ""}`}>
      <span>{label}{note && <span className="text-xs text-gray-600 ml-1">{note}</span>}</span>
      <span className={value > 0 && !highlight ? "text-red-400" : ""}>
        ${fmt(value)} <span className="text-gray-500 text-xs">（¥{fmtJPY(value, rate)}）</span>
      </span>
    </div>
  );
}

// ── メインコンポーネント ──────────────────────────────────────────────────────

export default function NetlifyPricing() {
  const [plan, setPlan] = useState<Plan>("pro");
  const [members, setMembers] = useState(1);
  const [exchangeRate, setExchangeRate] = useState(150);
  const [usage, setUsage] = useState<Usage>({
    bandwidth: 200,
    buildMinutes: 500,
    fnRequests: 200,
    fnRuntime: 150,
  });

  const setField = useCallback(<K extends keyof Usage>(key: K) => (v: number) => {
    setUsage((prev) => ({ ...prev, [key]: v }));
  }, []);

  const proCost = calcProCost(usage, members);

  const starterLimits = PLANS.starter.limits;
  const proLimits = PLANS.pro.limits;

  // Vercel Pro との月額比較（同じ使用量・同じ人数）
  const vercelBase = VERCEL_PRO.baseCost * members;
  const vercelBandwidthOverage = Math.max(0, usage.bandwidth - VERCEL_PRO.bandwidth) * (40 / 100);
  const vercelBuildOverage = Math.max(0, usage.buildMinutes / 60 - VERCEL_PRO.buildHours) * (50 / 100);
  const vercelTotal = vercelBase + vercelBandwidthOverage + vercelBuildOverage;

  return (
    <div className="space-y-6">
      {/* プラン選択 */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">プラン選択</h2>
        <div className="flex gap-3 flex-wrap">
          {(["starter", "pro"] as Plan[]).map((p) => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                plan === p
                  ? "bg-[#00C7B7] text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
              }`}
            >
              {PLANS[p].label}
              {p === "starter" && (
                <span className="ml-2 text-xs font-normal opacity-70">無料</span>
              )}
              {p === "pro" && (
                <span className="ml-2 text-xs font-normal opacity-70">$19/メンバー/月</span>
              )}
            </button>
          ))}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 opacity-50 cursor-not-allowed">
            <span className="text-sm text-gray-400">Enterprise</span>
            <span className="text-xs text-gray-600">要問合せ</span>
          </div>
        </div>

        {plan === "pro" && (
          <div className="mt-4 flex items-center gap-3">
            <label className="text-sm text-gray-400">チームメンバー数</label>
            <input
              type="number"
              min={1}
              max={100}
              value={members}
              onChange={(e) => setMembers(Math.max(1, Number(e.target.value)))}
              className="w-20 text-center bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-gray-400"
            />
            <span className="text-xs text-gray-500">人 × $19 = ${members * 19}/月</span>
          </div>
        )}
      </div>

      {/* 為替レート */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-400 whitespace-nowrap">USD/JPY 為替レート</label>
          <input
            type="number"
            min={100}
            max={200}
            step={1}
            value={exchangeRate}
            onChange={(e) => setExchangeRate(Math.max(100, Math.min(200, Number(e.target.value))))}
            className="w-24 text-center bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-gray-400"
          />
          <span className="text-xs text-gray-500">円/USD（デフォルト: 150円）</span>
        </div>
      </div>

      {/* リソース使用量 */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">リソース使用量</h2>
        <div className="space-y-6">
          <SliderRow
            label="帯域幅（Bandwidth）"
            value={usage.bandwidth}
            min={0}
            max={plan === "starter" ? 500 : 5000}
            step={10}
            unit="GB/月"
            freeLimit={plan === "starter" ? starterLimits.bandwidth : proLimits.bandwidth}
            onChange={setField("bandwidth")}
          />
          <SliderRow
            label="ビルド時間（Build Minutes）"
            value={usage.buildMinutes}
            min={0}
            max={plan === "starter" ? 1000 : 50000}
            step={50}
            unit="分/月"
            freeLimit={plan === "starter" ? starterLimits.buildMinutes : proLimits.buildMinutes}
            onChange={setField("buildMinutes")}
          />
          <SliderRow
            label="Functions リクエスト数"
            value={usage.fnRequests}
            min={0}
            max={plan === "starter" ? 500 : 3000}
            step={25}
            unit="K req/月"
            freeLimit={plan === "starter" ? starterLimits.fnRequests : proLimits.fnRequests}
            onChange={setField("fnRequests")}
          />
          <SliderRow
            label="Functions 実行時間"
            value={usage.fnRuntime}
            min={0}
            max={plan === "starter" ? 500 : 3000}
            step={25}
            unit="K秒/月"
            freeLimit={plan === "starter" ? starterLimits.fnRuntime : proLimits.fnRuntime}
            onChange={setField("fnRuntime")}
          />
        </div>
      </div>

      {/* 料金計算結果 */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">料金内訳</h2>

        {plan === "starter" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "帯域幅", used: usage.bandwidth, limit: starterLimits.bandwidth, unit: "GB" },
                { label: "ビルド時間", used: usage.buildMinutes, limit: starterLimits.buildMinutes, unit: "分" },
                { label: "Functions リクエスト", used: usage.fnRequests, limit: starterLimits.fnRequests, unit: "K req" },
                { label: "Functions 実行時間", used: usage.fnRuntime, limit: starterLimits.fnRuntime, unit: "K秒" },
              ].map(({ label, used, limit, unit }) => {
                const over = used > limit;
                return (
                  <div
                    key={label}
                    className={`p-3 rounded-lg border ${over ? "border-red-800 bg-red-900/20" : "border-[#00C7B7]/30 bg-[#00C7B7]/5"}`}
                  >
                    <div className="text-xs text-gray-400 mb-1">{label}</div>
                    <div className={`text-sm font-semibold ${over ? "text-red-400" : "text-[#00C7B7]"}`}>
                      {used.toLocaleString()} / {limit.toLocaleString()} {unit}
                    </div>
                    <div className="text-xs mt-1">
                      {over ? (
                        <span className="text-red-500">+{(used - limit).toLocaleString()} {unit} 超過</span>
                      ) : (
                        <span className="text-gray-600">残り {(limit - used).toLocaleString()} {unit}</span>
                      )}
                    </div>
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このNetlify 料金試算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">Netlifyの月額料金をビルド時間・帯域・Functions実行数から試算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このNetlify 料金試算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "Netlifyの月額料金をビルド時間・帯域・Functions実行数から試算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 rounded-lg bg-gray-800 text-center">
              <div className="text-3xl font-bold text-white">$0</div>
              <div className="text-gray-500 text-sm mt-1">¥0 / 月</div>
              <div className="text-xs text-gray-600 mt-2">
                ※ 無料枠を超えた場合、Proプランへのアップグレードが必要です
              </div>
            </div>
          </div>
        )}

        {plan === "pro" && (
          <div className="space-y-2">
            <CostLine label={`基本料金（$19 × ${members}人）`} value={proCost.base} rate={exchangeRate} />
            <CostLine label="帯域幅 超過料金" value={proCost.bandwidthOverage} rate={exchangeRate} />
            <CostLine label="ビルド時間 超過料金" value={proCost.buildOverage} rate={exchangeRate} />
            <CostLine
              label={`Functions 追加パック`}
              value={proCost.fnPacks}
              rate={exchangeRate}
              note={proCost.fnPackCount > 0 ? `× ${proCost.fnPackCount}パック（500K req + 500K秒）` : undefined}
            />
            <div className="mt-4 p-4 rounded-lg bg-gray-800">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-300 font-semibold">月額合計</span>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">${fmt(proCost.total)}</div>
                  <div className="text-gray-400 text-sm">¥{fmtJPY(proCost.total, exchangeRate)} / 月</div>
                </div>
              </div>
              {proCost.total > proCost.base && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">うち超過料金</span>
                    <span className="text-red-400">${fmt(proCost.total - proCost.base)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Vercelとの比較 */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Vercel Pro との比較（同じ使用量）
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 font-normal pb-2">項目</th>
                <th className="text-center pb-2">
                  <span className="text-[#00C7B7] font-semibold">Netlify Pro</span>
                </th>
                <th className="text-center pb-2">
                  <span className="text-white font-semibold">Vercel Pro</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              <tr>
                <td className="py-2 text-gray-400">基本料金/メンバー</td>
                <td className="py-2 text-center text-[#00C7B7]">$19/月</td>
                <td className="py-2 text-center text-gray-300">$20/月</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-400">帯域幅（無料枠）</td>
                <td className="py-2 text-center text-gray-300">1 TB/月</td>
                <td className="py-2 text-center text-gray-300">1 TB/月</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-400">ビルド時間（無料枠）</td>
                <td className="py-2 text-center text-gray-300">25,000 分/月</td>
                <td className="py-2 text-center text-gray-300">6,000 分/月</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-400">Functions 無料枠</td>
                <td className="py-2 text-center text-gray-300">125K req / 125K秒</td>
                <td className="py-2 text-center text-gray-300">1M GB-hours</td>
              </tr>
              <tr className="border-t-2 border-gray-700">
                <td className="py-3 text-gray-300 font-semibold">
                  現在の使用量での月額
                </td>
                <td className="py-3 text-center">
                  <span className={`font-bold text-lg ${plan === "pro" && proCost.total <= vercelTotal ? "text-[#00C7B7]" : "text-gray-300"}`}>
                    ${fmt(plan === "pro" ? proCost.total : 0)}
                  </span>
                  {plan === "pro" && proCost.total <= vercelTotal && (
                    <span className="block text-xs text-[#00C7B7] mt-0.5">お得</span>
                  )}
                </td>
                <td className="py-3 text-center">
                  <span className={`font-bold text-lg ${vercelTotal < (plan === "pro" ? proCost.total : 0) ? "text-white" : "text-gray-300"}`}>
                    ${fmt(vercelTotal)}
                  </span>
                  {vercelTotal < (plan === "pro" ? proCost.total : Infinity) && (
                    <span className="block text-xs text-white mt-0.5">お得</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          ※ ビルド時間はNetlifyが「分」単位、Vercelが「時間」単位で課金。Netlifyの無料枠は大幅に多い。
        </p>
      </div>

      {/* プラン比較表 */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">プラン比較</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 font-normal pb-2">リソース</th>
                <th className="text-center text-gray-400 font-semibold pb-2">Starter</th>
                <th className="text-center text-gray-400 font-semibold pb-2">Pro</th>
                <th className="text-center text-gray-500 font-normal pb-2 text-xs">Pro超過単価</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {[
                {
                  label: "基本料金",
                  starter: "無料",
                  pro: "$19/メンバー/月",
                  overage: "—",
                },
                {
                  label: "帯域幅",
                  starter: "100 GB/月",
                  pro: "1 TB/月",
                  overage: "$20/100GB",
                },
                {
                  label: "ビルド時間",
                  starter: "300 分/月",
                  pro: "25,000 分/月",
                  overage: "$7/500分",
                },
                {
                  label: "Functions リクエスト",
                  starter: "125K req/月",
                  pro: "125K req/月",
                  overage: "$25/site pack",
                },
                {
                  label: "Functions 実行時間",
                  starter: "125K秒/月",
                  pro: "125K秒/月",
                  overage: "（pack込み）",
                },
                {
                  label: "Functions pack内容",
                  starter: "—",
                  pro: "—",
                  overage: "+500K req / +500K秒",
                },
                {
                  label: "同時ビルド数",
                  starter: "1",
                  pro: "3",
                  overage: "要問合せ",
                },
              ].map((row) => (
                <tr key={row.label}>
                  <td className="py-2 text-gray-400">{row.label}</td>
                  <td className="py-2 text-center text-gray-300">{row.starter}</td>
                  <td className="py-2 text-center text-gray-300">{row.pro}</td>
                  <td className="py-2 text-center text-gray-600 text-xs">{row.overage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 注記 */}
      <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
        <p className="text-xs text-gray-600 leading-relaxed">
          ※ 本ツールは2026年時点の公開情報をもとに作成しています。実際の料金はNetlify公式サイトをご確認ください。
          Enterpriseプランは要問合せのため非対応です。為替レートは変動しますので参考値としてご利用ください。
          Functions超過はsite pack単位での課金となります（リクエスト数・実行時間の多い方が適用）。
        </p>
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Netlify 料金試算",
  "description": "Netlifyの月額料金をビルド時間・帯域・Functions実行数から試算",
  "url": "https://tools.loresync.dev/netlify-pricing",
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
