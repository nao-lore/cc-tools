"use client";

import { useState, useCallback } from "react";

// ── 料金定数 ──────────────────────────────────────────────────────────────────

const PLANS = {
  hobby: {
    label: "Hobby",
    baseCost: 0,
    commercial: false,
    limits: {
      bandwidth: 100,        // GB
      buildHours: 100,       // hours/month
      fnGbHours: 100,        // GB-hours
      edgeInvocations: 500,  // K invocations
    },
  },
  pro: {
    label: "Pro",
    baseCost: 20,            // USD per user/month
    commercial: true,
    limits: {
      bandwidth: 1024,       // GB (1TB)
      buildHours: 100,       // hours/month
      fnGbHours: 1000,       // GB-hours
      edgeInvocations: 1000, // K invocations
    },
    overage: {
      bandwidth: 40 / 100,        // $40 per 100GB → per GB
      buildHours: 50 / 100,       // $50 per 100h → per h
      fnGbHours: 18 / 100,        // $18 per 100 GB-hours → per GB-h
      edgeInvocations: 2 / 1000,  // $2 per 1M → per K
      imageOpt: 5 / 1000,         // $5 per 1000 → per unit
      webAnalytics: 14 / 10,      // $14 per 10K events → per event
    },
    extras: {
      concurrentBuilds: 50,  // $50/additional slot
      imageOptFree: 5000,    // free units/month
      webAnalyticsFree: 25,  // K events free
    },
  },
} as const;

// ── 型 ───────────────────────────────────────────────────────────────────────

type Plan = "hobby" | "pro";

interface Usage {
  bandwidth: number;        // GB
  buildHours: number;       // hours
  fnGbHours: number;        // GB-hours
  edgeInvocations: number;  // K
  imageOpt: number;         // units (Pro only)
  webAnalytics: number;     // K events (Pro only)
  concurrentBuilds: number; // additional slots (Pro only)
}

interface CostBreakdown {
  base: number;
  bandwidthOverage: number;
  buildOverage: number;
  fnOverage: number;
  edgeOverage: number;
  imageOptOverage: number;
  webAnalyticsOverage: number;
  concurrentBuildsExtra: number;
  total: number;
}

// ── ユーティリティ ─────────────────────────────────────────────────────────────

function calcProCost(usage: Usage, members: number): CostBreakdown {
  const p = PLANS.pro;
  const lim = p.limits;
  const ov = p.overage;
  const ext = p.extras;

  const base = p.baseCost * members;
  const bandwidthOverage = Math.max(0, usage.bandwidth - lim.bandwidth) * ov.bandwidth;
  const buildOverage = Math.max(0, usage.buildHours - lim.buildHours) * ov.buildHours;
  const fnOverage = Math.max(0, usage.fnGbHours - lim.fnGbHours) * ov.fnGbHours;
  const edgeOverage = Math.max(0, usage.edgeInvocations - lim.edgeInvocations) * ov.edgeInvocations;
  const imageOptOverage = Math.max(0, usage.imageOpt - ext.imageOptFree) * ov.imageOpt;
  const webAnalyticsOverage = Math.max(0, usage.webAnalytics - ext.webAnalyticsFree) * 1000 * ov.webAnalytics;
  const concurrentBuildsExtra = usage.concurrentBuilds * ext.concurrentBuilds;

  const total =
    base + bandwidthOverage + buildOverage + fnOverage + edgeOverage +
    imageOptOverage + webAnalyticsOverage + concurrentBuildsExtra;

  return {
    base,
    bandwidthOverage,
    buildOverage,
    fnOverage,
    edgeOverage,
    imageOptOverage,
    webAnalyticsOverage,
    concurrentBuildsExtra,
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
            ? `linear-gradient(to right, ${overLimit ? "#ef4444" : "#22c55e"} ${(value / max) * 100}%, #374151 ${(value / max) * 100}%)`
            : `linear-gradient(to right, #6366f1 ${(value / max) * 100}%, #374151 ${(value / max) * 100}%)`,
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
  dim?: boolean;
}

function CostLine({ label, value, rate, highlight, dim }: CostLineProps) {
  if (value === 0 && !highlight) return null;
  return (
    <div className={`flex justify-between text-sm ${dim ? "text-gray-600" : "text-gray-300"} ${highlight ? "font-bold text-white text-base border-t border-gray-700 pt-3 mt-1" : ""}`}>
      <span>{label}</span>
      <span className={value > 0 && !highlight ? "text-red-400" : ""}>
        ${fmt(value)} <span className="text-gray-500 text-xs">（¥{fmtJPY(value, rate)}）</span>
      </span>
    </div>
  );
}

// ── メインコンポーネント ──────────────────────────────────────────────────────

export default function VercelPricing() {
  const [plan, setPlan] = useState<Plan>("pro");
  const [members, setMembers] = useState(1);
  const [exchangeRate, setExchangeRate] = useState(150);
  const [usage, setUsage] = useState<Usage>({
    bandwidth: 200,
    buildHours: 80,
    fnGbHours: 500,
    edgeInvocations: 800,
    imageOpt: 3000,
    webAnalytics: 20,
    concurrentBuilds: 0,
  });

  const setField = useCallback(<K extends keyof Usage>(key: K) => (v: number) => {
    setUsage((prev) => ({ ...prev, [key]: v }));
  }, []);

  const proCost = calcProCost(usage, members);

  // 損益分岐点: Proに移行すべきタイミング（Hobbyの超過を想定）
  // Hobbyは商用不可なので比較は参考値として帯域幅ベースで算出
  const breakEvenBandwidth = PLANS.pro.limits.bandwidth + (PLANS.pro.baseCost * members) / PLANS.pro.overage.bandwidth;
  const breakEvenFnGbHours = PLANS.pro.limits.fnGbHours + (PLANS.pro.baseCost * members) / PLANS.pro.overage.fnGbHours;

  const hobbyLimits = PLANS.hobby.limits;
  const proLimits = PLANS.pro.limits;

  return (
    <div className="space-y-6">
      {/* プラン選択 */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">プラン選択</h2>
        <div className="flex gap-3 flex-wrap">
          {(["hobby", "pro"] as Plan[]).map((p) => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                plan === p
                  ? "bg-white text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
              }`}
            >
              {PLANS[p].label}
              {p === "hobby" && (
                <span className="ml-2 text-xs font-normal text-gray-500">無料</span>
              )}
              {p === "pro" && (
                <span className="ml-2 text-xs font-normal text-gray-400">$20/user/月</span>
              )}
            </button>
          ))}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 opacity-50 cursor-not-allowed">
            <span className="text-sm text-gray-400">Enterprise</span>
            <span className="text-xs text-gray-600">要問合せ</span>
          </div>
        </div>

        {plan === "hobby" && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-900/30 border border-yellow-800/50">
            <p className="text-xs text-yellow-400">
              ⚠️ Hobbyプランは個人・非商用利用限定です。商用プロジェクトにはProプランが必要です。
            </p>
          </div>
        )}

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
            <span className="text-xs text-gray-500">人 × $20 = ${members * 20}/月</span>
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
            max={plan === "hobby" ? 500 : 5000}
            step={10}
            unit="GB/月"
            freeLimit={plan === "hobby" ? hobbyLimits.bandwidth : proLimits.bandwidth}
            onChange={setField("bandwidth")}
          />
          <SliderRow
            label="ビルド時間（Build Time）"
            value={usage.buildHours}
            min={0}
            max={plan === "hobby" ? 200 : 500}
            step={5}
            unit="時間/月"
            freeLimit={plan === "hobby" ? hobbyLimits.buildHours : proLimits.buildHours}
            onChange={setField("buildHours")}
          />
          <SliderRow
            label="サーバーレス関数（Serverless Functions）"
            value={usage.fnGbHours}
            min={0}
            max={plan === "hobby" ? 500 : 5000}
            step={50}
            unit="GB-hours/月"
            freeLimit={plan === "hobby" ? hobbyLimits.fnGbHours : proLimits.fnGbHours}
            onChange={setField("fnGbHours")}
          />
          <SliderRow
            label="Edge 関数呼び出し（Edge Invocations）"
            value={usage.edgeInvocations}
            min={0}
            max={plan === "hobby" ? 2000 : 10000}
            step={100}
            unit="K回/月"
            freeLimit={plan === "hobby" ? hobbyLimits.edgeInvocations : proLimits.edgeInvocations}
            onChange={setField("edgeInvocations")}
          />
          {plan === "pro" && (
            <>
              <SliderRow
                label="画像最適化（Image Optimization）"
                value={usage.imageOpt}
                min={0}
                max={50000}
                step={500}
                unit="枚/月"
                freeLimit={5000}
                onChange={setField("imageOpt")}
              />
              <SliderRow
                label="ウェブ分析（Web Analytics）"
                value={usage.webAnalytics}
                min={0}
                max={200}
                step={5}
                unit="K events/月"
                freeLimit={25}
                onChange={setField("webAnalytics")}
              />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">追加同時ビルドスロット</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={usage.concurrentBuilds}
                      min={0}
                      max={10}
                      onChange={(e) => setField("concurrentBuilds")(Math.max(0, Math.min(10, Number(e.target.value))))}
                      className="w-24 text-right text-sm bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-white focus:outline-none focus:border-gray-400"
                    />
                    <span className="text-xs text-gray-500 w-20">スロット</span>
                    <span className="text-xs text-gray-600 w-16 text-right">$50/slot</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-gray-600">標準: 1スロット（含む）</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 料金計算結果 */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">料金内訳</h2>

        {plan === "hobby" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "帯域幅", used: usage.bandwidth, limit: hobbyLimits.bandwidth, unit: "GB" },
                { label: "ビルド時間", used: usage.buildHours, limit: hobbyLimits.buildHours, unit: "h" },
                { label: "サーバーレス関数", used: usage.fnGbHours, limit: hobbyLimits.fnGbHours, unit: "GB-h" },
                { label: "Edge 関数", used: usage.edgeInvocations, limit: hobbyLimits.edgeInvocations, unit: "K" },
              ].map(({ label, used, limit, unit }) => {
                const over = used > limit;
                return (
                  <div
                    key={label}
                    className={`p-3 rounded-lg border ${over ? "border-red-800 bg-red-900/20" : "border-green-800 bg-green-900/20"}`}
                  >
                    <div className="text-xs text-gray-400 mb-1">{label}</div>
                    <div className={`text-sm font-semibold ${over ? "text-red-400" : "text-green-400"}`}>
                      {used.toLocaleString()} / {limit.toLocaleString()} {unit}
                    </div>
                    <div className="text-xs mt-1">
                      {over ? (
                        <span className="text-red-500">+{(used - limit).toLocaleString()} {unit} 超過</span>
                      ) : (
                        <span className="text-green-600">残り {(limit - used).toLocaleString()} {unit}</span>
                      )}
                    </div>
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
            <CostLine label={`基本料金（$20 × ${members}人）`} value={proCost.base} rate={exchangeRate} />
            <CostLine label="帯域幅 超過料金" value={proCost.bandwidthOverage} rate={exchangeRate} />
            <CostLine label="ビルド時間 超過料金" value={proCost.buildOverage} rate={exchangeRate} />
            <CostLine label="サーバーレス関数 超過料金" value={proCost.fnOverage} rate={exchangeRate} />
            <CostLine label="Edge 関数 超過料金" value={proCost.edgeOverage} rate={exchangeRate} />
            <CostLine label="画像最適化 超過料金" value={proCost.imageOptOverage} rate={exchangeRate} />
            <CostLine label="ウェブ分析 超過料金" value={proCost.webAnalyticsOverage} rate={exchangeRate} />
            <CostLine label="追加同時ビルドスロット" value={proCost.concurrentBuildsExtra} rate={exchangeRate} />
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

      {/* 損益分岐点 */}
      {plan === "pro" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Proに移行すべきタイミング
          </h2>
          <div className="space-y-3 text-sm text-gray-400">
            <p className="text-gray-300 font-medium">以下のいずれかを超えたらProが必要になります：</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">帯域幅の損益分岐点</div>
                <div className="text-white font-semibold">
                  {breakEvenBandwidth.toLocaleString("en-US", { maximumFractionDigits: 0 })} GB/月
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Hobby上限 100GB + 基本料金相当分
                </div>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">関数実行の損益分岐点</div>
                <div className="text-white font-semibold">
                  {breakEvenFnGbHours.toLocaleString("en-US", { maximumFractionDigits: 0 })} GB-hours/月
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Hobby上限 100 GB-hours + 基本料金相当分
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 pt-2">
              ※ Hobbyは商用利用不可のため、収益化した時点でProが必須です。
              上記は技術的な超過ラインの目安です。
            </p>
          </div>
        </div>
      )}

      {/* プラン比較表 */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">プラン比較</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 font-normal pb-2">リソース</th>
                <th className="text-center text-gray-400 font-semibold pb-2">Hobby</th>
                <th className="text-center text-gray-400 font-semibold pb-2">Pro</th>
                <th className="text-center text-gray-500 font-normal pb-2 text-xs">Pro超過単価</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {[
                {
                  label: "基本料金",
                  hobby: "無料",
                  pro: "$20/user/月",
                  overage: "—",
                },
                {
                  label: "帯域幅",
                  hobby: "100 GB/月",
                  pro: "1 TB/月",
                  overage: "$40/100GB",
                },
                {
                  label: "ビルド時間",
                  hobby: "100 時間/月",
                  pro: "100 時間/月",
                  overage: "$50/100h",
                },
                {
                  label: "サーバーレス関数",
                  hobby: "100 GB-hours",
                  pro: "1,000 GB-hours",
                  overage: "$18/100 GB-h",
                },
                {
                  label: "Edge 関数",
                  hobby: "500K 回",
                  pro: "1M 回",
                  overage: "$2/1M",
                },
                {
                  label: "画像最適化",
                  hobby: "—",
                  pro: "5,000/月",
                  overage: "$5/1,000",
                },
                {
                  label: "ウェブ分析",
                  hobby: "—",
                  pro: "25K events/月",
                  overage: "$14/10K",
                },
                {
                  label: "商用利用",
                  hobby: "❌",
                  pro: "✅",
                  overage: "—",
                },
              ].map((row) => (
                <tr key={row.label}>
                  <td className="py-2 text-gray-400">{row.label}</td>
                  <td className="py-2 text-center text-gray-300">{row.hobby}</td>
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
          ※ 本ツールは2026年時点の公開情報をもとに作成しています。実際の料金はVercel公式サイトをご確認ください。
          Enterpriseプランは要問合せのため非対応です。為替レートは変動しますので参考値としてご利用ください。
        </p>
      </div>
    </div>
  );
}
