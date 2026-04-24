"use client";

import { useState, useMemo } from "react";

// --- 料金定数 ---
const PLANS = {
  free: {
    id: "free",
    name: "Free",
    basePrice: 0,
    db: 0.5,          // GB
    storage: 1,        // GB
    bandwidth: 5,      // GB
    mau: 50_000,
    edgeFn: 500_000,
    realtime: 200,
    overageDb: null,
    overageStorage: null,
    overageBandwidth: null,
    overageMau: null,
    overageEdgeFn: null,
    overageRealtime: null,
  },
  pro: {
    id: "pro",
    name: "Pro",
    basePrice: 25,
    db: 8,
    storage: 100,
    bandwidth: 250,
    mau: 100_000,
    edgeFn: 2_000_000,
    realtime: 500,
    overageDb: 0.125,       // $/GB
    overageStorage: 0.021,  // $/GB
    overageBandwidth: 0.09, // $/GB
    overageMau: 0.00325,    // $/MAU
    overageEdgeFn: 2,       // $/1M invocations
    overageRealtime: 10,    // $/1,000 connections
  },
  team: {
    id: "team",
    name: "Team",
    basePrice: 599,
    db: 8,
    storage: 100,
    bandwidth: 250,
    mau: 100_000,
    edgeFn: 2_000_000,
    realtime: 500,
    overageDb: 0.125,
    overageStorage: 0.021,
    overageBandwidth: 0.09,
    overageMau: 0.00325,
    overageEdgeFn: 2,
    overageRealtime: 10,
  },
} as const;

type PlanId = keyof typeof PLANS;

const COMPUTE_ADDONS = [
  { id: "none", name: "なし（共有）", hourlyRate: 0, spec: "" },
  { id: "micro", name: "Micro（共有）", hourlyRate: 0.01344, spec: "共有CPU / 1GB RAM" },
  { id: "small", name: "Small", hourlyRate: 0.0206, spec: "1CPU / 2GB RAM" },
  { id: "medium", name: "Medium", hourlyRate: 0.0822, spec: "2CPU / 4GB RAM" },
  { id: "large", name: "Large", hourlyRate: 0.1517, spec: "4CPU / 8GB RAM" },
  { id: "xl", name: "XL", hourlyRate: 0.2877, spec: "8CPU / 16GB RAM" },
  { id: "2xl", name: "2XL", hourlyRate: 0.562, spec: "16CPU / 32GB RAM" },
] as const;

// --- ユーティリティ ---
function fmtUSD(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(3)}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtJPY(n: number): string {
  if (n < 1) return `${n.toFixed(2)}円`;
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function calcOverage(used: number, included: number, rate: number | null): number {
  if (rate === null || used <= included) return 0;
  return (used - included) * rate;
}

function calcEdgeFnOverage(used: number, included: number, rate: number | null): number {
  if (rate === null || used <= included) return 0;
  return ((used - included) / 1_000_000) * rate;
}

function calcRealtimeOverage(used: number, included: number, rate: number | null): number {
  if (rate === null || used <= included) return 0;
  return Math.ceil((used - included) / 1000) * rate;
}

// --- 入力コンポーネント ---
function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(value, max)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="number"
            min={min}
            step={step}
            value={value}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v) && v >= 0) onChange(v);
            }}
            className="w-28 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          {unit && <span className="text-sm text-gray-500 whitespace-nowrap">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

// --- 超過表示バッジ ---
function UsageBadge({
  used,
  included,
  unit,
}: {
  used: number;
  included: number;
  unit: string;
}) {
  const over = used > included;
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        over
          ? "bg-red-100 text-red-700"
          : "bg-emerald-100 text-emerald-700"
      }`}
    >
      {over ? `+${(used - included).toLocaleString()} ${unit} 超過` : `枠内 (${included.toLocaleString()} ${unit}まで)`}
    </span>
  );
}

// --- メインコンポーネント ---
export default function SupabasePricing() {
  const [planId, setPlanId] = useState<PlanId>("pro");
  const [dbGb, setDbGb] = useState(8);
  const [storageGb, setStorageGb] = useState(50);
  const [bandwidthGb, setBandwidthGb] = useState(100);
  const [mau, setMau] = useState(50_000);
  const [edgeFn, setEdgeFn] = useState(1_000_000);
  const [realtimeConns, setRealtimeConns] = useState(200);
  const [computeId, setComputeId] = useState("none");
  const [exchangeRate, setExchangeRate] = useState(150);

  const plan = PLANS[planId];
  const compute = COMPUTE_ADDONS.find((c) => c.id === computeId) ?? COMPUTE_ADDONS[0];

  const result = useMemo(() => {
    const overageDb = calcOverage(dbGb, plan.db, plan.overageDb);
    const overageStorage = calcOverage(storageGb, plan.storage, plan.overageStorage);
    const overageBandwidth = calcOverage(bandwidthGb, plan.bandwidth, plan.overageBandwidth);
    const overageMau = calcOverage(mau, plan.mau, plan.overageMau);
    const overageEdgeFn = calcEdgeFnOverage(edgeFn, plan.edgeFn, plan.overageEdgeFn);
    const overageRealtime = calcRealtimeOverage(realtimeConns, plan.realtime, plan.overageRealtime);

    const totalOverage =
      overageDb + overageStorage + overageBandwidth + overageMau + overageEdgeFn + overageRealtime;

    const computeMonthly = compute.hourlyRate * 24 * 30;
    const total = plan.basePrice + totalOverage + computeMonthly;

    return {
      overageDb,
      overageStorage,
      overageBandwidth,
      overageMau,
      overageEdgeFn,
      overageRealtime,
      totalOverage,
      computeMonthly,
      total,
    };
  }, [planId, dbGb, storageGb, bandwidthGb, mau, edgeFn, realtimeConns, compute, plan]);

  // Free vs Pro 損益分岐点: どの使用量でProが元を取れるか
  const breakeven = useMemo(() => {
    // Pro固定費 $25 を超えるのはどの閾値か（最も超えやすいDB容量で計算）
    // Pro枠 8GB → 超過で $0.125/GB なので 25 / 0.125 = 200GB 超えたらProが得（他が0の場合）
    // 実際はユーザーの入力に基づいた比較を出す
    const proTotal = result.total;
    // Freeプランで同じ使用量だと？ → Freeは超過不可なので無限大、ただし枠内なら$0
    const allWithinFree =
      dbGb <= PLANS.free.db &&
      storageGb <= PLANS.free.storage &&
      bandwidthGb <= PLANS.free.bandwidth &&
      mau <= PLANS.free.mau &&
      edgeFn <= PLANS.free.edgeFn &&
      realtimeConns <= PLANS.free.realtime;

    return { allWithinFree, proTotal };
  }, [result, dbGb, storageGb, bandwidthGb, mau, edgeFn, realtimeConns]);

  const accentBg =
    planId === "free"
      ? "bg-gray-50 border-gray-200"
      : planId === "pro"
      ? "bg-emerald-50 border-emerald-200"
      : "bg-purple-50 border-purple-200";

  const accentText =
    planId === "free"
      ? "text-gray-700"
      : planId === "pro"
      ? "text-emerald-700"
      : "text-purple-700";

  return (
    <div className="space-y-6">
      {/* ===== プラン選択 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">プランを選択</h2>
        <div className="grid grid-cols-3 gap-3">
          {(Object.values(PLANS) as (typeof PLANS)[PlanId][]).map((p) => {
            const selected = planId === p.id;
            const colors =
              p.id === "free"
                ? selected
                  ? "bg-gray-100 border-gray-400 ring-2 ring-gray-400"
                  : "border-gray-200 hover:border-gray-300"
                : p.id === "pro"
                ? selected
                  ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400"
                  : "border-gray-200 hover:border-emerald-200"
                : selected
                ? "bg-purple-50 border-purple-400 ring-2 ring-purple-400"
                : "border-gray-200 hover:border-purple-200";

            return (
              <button
                key={p.id}
                onClick={() => setPlanId(p.id as PlanId)}
                className={`p-4 rounded-xl border text-left transition-all ${colors}`}
              >
                <div className="font-bold text-gray-900 text-base">{p.name}</div>
                <div className="text-2xl font-bold mt-1 text-gray-900">
                  {p.basePrice === 0 ? "無料" : `$${p.basePrice}`}
                  {p.basePrice > 0 && <span className="text-sm font-normal text-gray-500">/月</span>}
                </div>
                <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                  <div>DB: {p.db >= 1 ? `${p.db}GB` : `${p.db * 1000}MB`}</div>
                  <div>Storage: {p.storage}GB</div>
                  <div>MAU: {p.mau.toLocaleString()}</div>
                </div>
                {p.id === "team" && (
                  <div className="mt-2 text-xs text-purple-600 font-medium">SOC2・優先サポート</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== 使用量入力 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">使用量を入力</h2>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">データベース容量</span>
              <UsageBadge used={dbGb} included={plan.db} unit="GB" />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={Math.min(dbGb, 100)}
                onChange={(e) => setDbGb(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={dbGb}
                  onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v >= 0) setDbGb(v); }}
                  className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <span className="text-sm text-gray-500">GB</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">ストレージ</span>
              <UsageBadge used={storageGb} included={plan.storage} unit="GB" />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={500}
                step={1}
                value={Math.min(storageGb, 500)}
                onChange={(e) => setStorageGb(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={storageGb}
                  onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v >= 0) setStorageGb(v); }}
                  className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <span className="text-sm text-gray-500">GB</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">帯域幅（Egress）</span>
              <UsageBadge used={bandwidthGb} included={plan.bandwidth} unit="GB" />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={1000}
                step={5}
                value={Math.min(bandwidthGb, 1000)}
                onChange={(e) => setBandwidthGb(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={bandwidthGb}
                  onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v >= 0) setBandwidthGb(v); }}
                  className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <span className="text-sm text-gray-500">GB</span>
              </div>
            </div>
          </div>

          <NumberField
            label="月間アクティブユーザー（MAU）"
            value={mau}
            onChange={setMau}
            min={0}
            max={500_000}
            step={1000}
            unit="人"
            hint={`プラン枠: ${plan.mau.toLocaleString()} MAU`}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Edge Functions 実行回数</span>
              <UsageBadge used={edgeFn} included={plan.edgeFn} unit="回" />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={10_000_000}
                step={100_000}
                value={Math.min(edgeFn, 10_000_000)}
                onChange={(e) => setEdgeFn(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={0}
                  step={100_000}
                  value={edgeFn}
                  onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v >= 0) setEdgeFn(v); }}
                  className="w-32 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <span className="text-sm text-gray-500">回</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Realtime 同時接続数</span>
              <UsageBadge used={realtimeConns} included={plan.realtime} unit="接続" />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={5000}
                step={50}
                value={Math.min(realtimeConns, 5000)}
                onChange={(e) => setRealtimeConns(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={realtimeConns}
                  onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v >= 0) setRealtimeConns(v); }}
                  className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <span className="text-sm text-gray-500">接続</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== コンピュートアドオン ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">コンピュートアドオン（任意）</h2>
        <p className="text-xs text-gray-500 mb-4">専用インスタンスが必要な場合に選択。月額 = 時間単価 × 24h × 30日で計算。</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COMPUTE_ADDONS.map((c) => {
            const selected = computeId === c.id;
            const monthly = c.hourlyRate * 24 * 30;
            return (
              <button
                key={c.id}
                onClick={() => setComputeId(c.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selected
                    ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300"
                    : "border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30"
                }`}
              >
                <div className="font-medium text-gray-900 text-sm">{c.name}</div>
                {c.spec && <div className="text-xs text-gray-500 mt-0.5">{c.spec}</div>}
                <div className="text-sm font-bold text-gray-800 mt-1">
                  {monthly === 0 ? "無料" : `${fmtUSD(monthly)}/月`}
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このSupabase 料金試算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">Supabaseの月額料金をDB容量・ストレージ・MAU・Edge Functions数から試算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このSupabase 料金試算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "Supabaseの月額料金をDB容量・ストレージ・MAU・Edge Functions数から試算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== 計算結果 ===== */}
      <div className={`rounded-2xl shadow-sm border p-6 ${accentBg}`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">月額試算結果</h2>
          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${accentBg} ${accentText} border-current`}>
            {plan.name} プラン
          </span>
        </div>

        {/* 合計 */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-1">月額合計（税別・USD）</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-bold text-gray-900">{fmtUSD(result.total)}</span>
            <span className="text-xl text-gray-600">{fmtJPY(result.total * exchangeRate)}</span>
          </div>
        </div>

        {/* 内訳カード */}
        <div className="bg-white bg-opacity-70 rounded-xl p-4 space-y-2 text-sm mb-4">
          <div className="font-medium text-gray-700 mb-2">料金内訳</div>

          {/* プラン基本料金 */}
          <div className="flex justify-between text-gray-600">
            <span>プラン基本料金（{plan.name}）</span>
            <span className="font-medium text-gray-900">{fmtUSD(plan.basePrice)}</span>
          </div>

          {/* 超過料金 */}
          {result.overageDb > 0 && (
            <div className="flex justify-between text-red-600">
              <span>DB超過 ({(dbGb - plan.db).toFixed(1)}GB × $0.125)</span>
              <span className="font-medium">{fmtUSD(result.overageDb)}</span>
            </div>
          )}
          {result.overageStorage > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Storage超過 ({(storageGb - plan.storage).toFixed(1)}GB × $0.021)</span>
              <span className="font-medium">{fmtUSD(result.overageStorage)}</span>
            </div>
          )}
          {result.overageBandwidth > 0 && (
            <div className="flex justify-between text-red-600">
              <span>帯域超過 ({(bandwidthGb - plan.bandwidth).toFixed(1)}GB × $0.09)</span>
              <span className="font-medium">{fmtUSD(result.overageBandwidth)}</span>
            </div>
          )}
          {result.overageMau > 0 && (
            <div className="flex justify-between text-red-600">
              <span>MAU超過 ({(mau - plan.mau).toLocaleString()}人 × $0.00325)</span>
              <span className="font-medium">{fmtUSD(result.overageMau)}</span>
            </div>
          )}
          {result.overageEdgeFn > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Edge Fn超過 ({((edgeFn - plan.edgeFn) / 1_000_000).toFixed(1)}M × $2)</span>
              <span className="font-medium">{fmtUSD(result.overageEdgeFn)}</span>
            </div>
          )}
          {result.overageRealtime > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Realtime超過 ({(realtimeConns - plan.realtime).toLocaleString()}接続 × $10/1,000)</span>
              <span className="font-medium">{fmtUSD(result.overageRealtime)}</span>
            </div>
          )}

          {/* コンピュートアドオン */}
          {result.computeMonthly > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Compute ({compute.name} @ ${compute.hourlyRate}/h × 720h)</span>
              <span className="font-medium text-gray-900">{fmtUSD(result.computeMonthly)}</span>
            </div>
          )}

          {/* 超過なし表示 */}
          {result.totalOverage === 0 && (
            <div className="text-emerald-600 text-xs pt-1">すべて枠内に収まっています</div>
          )}

          <div className="border-t border-gray-200 pt-2 mt-1 flex justify-between font-semibold text-gray-900">
            <span>月額合計</span>
            <span>{fmtUSD(result.total)}</span>
          </div>
        </div>

        {/* 為替換算 */}
        <div className="flex items-center gap-3 mt-3">
          <span className="text-sm text-gray-500 whitespace-nowrap">1 USD =</span>
          <input
            type="number"
            min={50}
            max={300}
            step={1}
            value={exchangeRate}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v) && v > 0) setExchangeRate(v);
            }}
            className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <span className="text-sm text-gray-500">円</span>
          <span className="text-sm text-gray-700 font-medium ml-auto">
            ≈ {fmtJPY(result.total * exchangeRate)}/月
          </span>
        </div>
      </div>

      {/* ===== Free vs Pro 損益分岐 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Free vs Pro 判断ガイド</h2>
        {breakeven.allWithinFree ? (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="font-medium text-emerald-800 mb-1">現在の使用量は Free プランで収まります</div>
            <p className="text-sm text-emerald-700">
              すべてのリソースが Free プランの枠内に収まっています。まずは Free プランから始め、
              MAU が 50,000 を超えるか、DB が 500MB を超えたら Pro（$25/月）へ移行するのがおすすめです。
            </p>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="font-medium text-amber-800 mb-1">Free プランでは不足しています → Pro が必要です</div>
            <p className="text-sm text-amber-700">
              現在の使用量は Free プランの枠を超えています。Pro プラン（$25/月〜）で{" "}
              {fmtUSD(result.total)} になります。
            </p>
            {planId !== "pro" && planId !== "team" && (
              <button
                onClick={() => setPlanId("pro")}
                className="mt-2 text-xs font-medium text-amber-800 underline"
              >
                Pro プランに切り替える →
              </button>
            )}
          </div>
        )}

        {/* 比較テーブル */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">リソース</th>
                <th className="text-right py-2 pr-4 text-xs text-gray-500 font-medium">使用量</th>
                <th className="text-right py-2 pr-4 text-xs text-gray-500 font-medium">Free 枠</th>
                <th className="text-right py-2 pr-4 text-xs text-gray-500 font-medium">Pro 枠</th>
                <th className="text-right py-2 text-xs text-gray-500 font-medium">超過単価</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "DB", used: `${dbGb}GB`, free: "500MB", pro: "8GB", overage: "$0.125/GB" },
                { label: "Storage", used: `${storageGb}GB`, free: "1GB", pro: "100GB", overage: "$0.021/GB" },
                { label: "帯域幅", used: `${bandwidthGb}GB`, free: "5GB", pro: "250GB", overage: "$0.09/GB" },
                { label: "MAU", used: mau.toLocaleString(), free: "50,000", pro: "100,000", overage: "$0.00325" },
                { label: "Edge Fn", used: edgeFn >= 1_000_000 ? `${(edgeFn / 1_000_000).toFixed(1)}M` : `${(edgeFn / 1000).toFixed(0)}K`, free: "500K", pro: "2M", overage: "$2/1M" },
                { label: "Realtime", used: `${realtimeConns}`, free: "200", pro: "500", overage: "$10/1K" },
              ].map((row) => (
                <tr key={row.label} className="border-b border-gray-50">
                  <td className="py-2 pr-4 font-medium text-gray-700">{row.label}</td>
                  <td className="py-2 pr-4 text-right text-gray-900 font-semibold">{row.used}</td>
                  <td className="py-2 pr-4 text-right text-gray-500">{row.free}</td>
                  <td className="py-2 pr-4 text-right text-gray-500">{row.pro}</td>
                  <td className="py-2 text-right text-gray-400 text-xs">{row.overage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== 注記 ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        料金は変更される場合があります。最新の料金は{" "}
        <span className="underline">supabase.com/pricing</span> でご確認ください。
        コンピュートは 720h/月で計算。ベクトル機能（pgvector）は全プランで無制限。
      </p>
    </div>
  );
}
