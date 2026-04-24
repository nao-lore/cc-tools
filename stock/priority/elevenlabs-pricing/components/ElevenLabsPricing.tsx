"use client";

import { useState, useMemo } from "react";

// --- 料金定数 ---
const PLANS = [
  {
    id: "free",
    name: "Free",
    basePrice: 0,
    includedChars: 10_000,
    overageRate: null as number | null,
    color: "gray",
    description: "個人利用・試用",
  },
  {
    id: "starter",
    name: "Starter",
    basePrice: 5,
    includedChars: 30_000,
    overageRate: 0.30,
    color: "violet",
    description: "趣味・小規模",
  },
  {
    id: "creator",
    name: "Creator",
    basePrice: 22,
    includedChars: 100_000,
    overageRate: 0.30,
    color: "purple",
    description: "コンテンツ制作",
  },
  {
    id: "pro",
    name: "Pro",
    basePrice: 99,
    includedChars: 500_000,
    overageRate: 0.30,
    color: "fuchsia",
    description: "プロ・ビジネス",
  },
  {
    id: "scale",
    name: "Scale",
    basePrice: 330,
    includedChars: 2_000_000,
    overageRate: 0.30,
    color: "pink",
    description: "大規模・API連携",
  },
] as const;

type PlanId = (typeof PLANS)[number]["id"];

// 用途別文字数目安
const USE_CASES = [
  { id: "narration", label: "ナレーション（5分動画）", chars: 4_500, icon: "🎙" },
  { id: "podcast", label: "ポッドキャスト（30分）", chars: 27_000, icon: "🎧" },
  { id: "article", label: "記事読み上げ（2,000字）", chars: 2_000, icon: "📄" },
  { id: "app_small", label: "アプリ音声（小規模・月間）", chars: 50_000, icon: "📱" },
  { id: "app_medium", label: "アプリ音声（中規模・月間）", chars: 300_000, icon: "🚀" },
  { id: "app_large", label: "アプリ音声（大規模・月間）", chars: 1_500_000, icon: "⚡" },
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

function fmtChars(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M文字`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K文字`;
  return `${n.toLocaleString()}文字`;
}

function calcCost(chars: number, plan: (typeof PLANS)[number]): number {
  const overage = Math.max(0, chars - plan.includedChars);
  const overageCost = plan.overageRate !== null ? (overage / 1_000) * plan.overageRate : 0;
  return plan.basePrice + overageCost;
}

function costPerChar(chars: number, plan: (typeof PLANS)[number]): number {
  if (chars === 0) return 0;
  return calcCost(chars, plan) / chars;
}

// プランカラー定義
const PLAN_COLORS: Record<string, { bg: string; border: string; ring: string; text: string; badge: string }> = {
  gray: {
    bg: "bg-gray-800/60",
    border: "border-gray-600",
    ring: "ring-gray-500",
    text: "text-gray-300",
    badge: "bg-gray-700 text-gray-200",
  },
  violet: {
    bg: "bg-violet-900/60",
    border: "border-violet-500",
    ring: "ring-violet-400",
    text: "text-violet-300",
    badge: "bg-violet-800 text-violet-200",
  },
  purple: {
    bg: "bg-purple-900/60",
    border: "border-purple-500",
    ring: "ring-purple-400",
    text: "text-purple-300",
    badge: "bg-purple-800 text-purple-200",
  },
  fuchsia: {
    bg: "bg-fuchsia-900/60",
    border: "border-fuchsia-500",
    ring: "ring-fuchsia-400",
    text: "text-fuchsia-300",
    badge: "bg-fuchsia-800 text-fuchsia-200",
  },
  pink: {
    bg: "bg-pink-900/60",
    border: "border-pink-500",
    ring: "ring-pink-400",
    text: "text-pink-300",
    badge: "bg-pink-800 text-pink-200",
  },
};

// --- 最適プラン判定 ---
function findOptimalPlan(chars: number): (typeof PLANS)[number] {
  // コストが最小のプランを返す（Free は超過不可なので枠内のみ）
  let best = PLANS[0];
  let bestCost = Infinity;

  for (const plan of PLANS) {
    if (plan.overageRate === null && chars > plan.includedChars) continue; // Free枠超過は不可
    const cost = calcCost(chars, plan);
    if (cost < bestCost) {
      bestCost = cost;
      best = plan;
    }
  }
  return best;
}

// --- メインコンポーネント ---
export default function ElevenLabsPricing() {
  const [monthlyChars, setMonthlyChars] = useState(50_000);
  const [exchangeRate, setExchangeRate] = useState(150);
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>("creator");

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) ?? PLANS[2];
  const optimalPlan = useMemo(() => findOptimalPlan(monthlyChars), [monthlyChars]);

  const result = useMemo(() => {
    const plan = selectedPlan;
    const overageChars = Math.max(0, monthlyChars - plan.includedChars);
    const overageCost =
      plan.overageRate !== null ? (overageChars / 1_000) * plan.overageRate : 0;
    const totalUSD = plan.basePrice + overageCost;
    const perCharUSD = costPerChar(monthlyChars, plan);
    const usageRatio = plan.includedChars > 0 ? Math.min(monthlyChars / plan.includedChars, 1) : 0;

    return { overageChars, overageCost, totalUSD, perCharUSD, usageRatio };
  }, [monthlyChars, selectedPlan]);

  // 全プランのコスト比較
  const allPlanCosts = useMemo(() =>
    PLANS.map((p) => ({
      ...p,
      cost: p.overageRate === null && monthlyChars > p.includedChars ? null : calcCost(monthlyChars, p),
    })),
    [monthlyChars]
  );

  const accentColors = PLAN_COLORS[selectedPlan.color] ?? PLAN_COLORS.violet;

  return (
    <div className="space-y-6">
      {/* ===== 月間文字数入力 ===== */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
        <h2 className="text-lg font-semibold text-white mb-1">月間使用文字数</h2>
        <p className="text-xs text-violet-300 mb-5">1文字 ≈ 英数字1文字・日本語1文字（どちらも同じカウント）</p>

        <div className="flex items-center gap-3 mb-4">
          <input
            type="range"
            min={0}
            max={3_000_000}
            step={5_000}
            value={Math.min(monthlyChars, 3_000_000)}
            onChange={(e) => setMonthlyChars(Number(e.target.value))}
            className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-violet-400"
          />
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="number"
              min={0}
              step={1000}
              value={monthlyChars}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!isNaN(v) && v >= 0) setMonthlyChars(v);
              }}
              className="w-32 px-2 py-1 text-right bg-white/10 border border-white/30 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <span className="text-sm text-violet-300 whitespace-nowrap">文字</span>
          </div>
        </div>

        {/* 用途別プリセット */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {USE_CASES.map((uc) => (
            <button
              key={uc.id}
              onClick={() => setMonthlyChars(uc.chars)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                monthlyChars === uc.chars
                  ? "bg-violet-600/50 border-violet-400 ring-1 ring-violet-400"
                  : "bg-white/5 border-white/15 hover:border-violet-400/50 hover:bg-white/10"
              }`}
            >
              <div className="text-base mb-0.5">{uc.icon}</div>
              <div className="text-xs font-medium text-white leading-tight">{uc.label}</div>
              <div className="text-xs text-violet-300 mt-0.5">{fmtChars(uc.chars)}</div>
            </button>
          ))}
        </div>

        {/* 最適プランバナー */}
        {optimalPlan.id !== selectedPlanId && (
          <div className="mt-4 p-3 bg-amber-500/20 border border-amber-400/50 rounded-xl flex items-center justify-between gap-3">
            <div>
              <span className="text-amber-300 text-xs font-medium">最安プランは </span>
              <span className="text-white text-sm font-bold">{optimalPlan.name}</span>
              <span className="text-amber-300 text-xs font-medium">
                {" "}（{optimalPlan.basePrice === 0 ? "無料" : fmtUSD(calcCost(monthlyChars, optimalPlan))}）
              </span>
            </div>
            <button
              onClick={() => setSelectedPlanId(optimalPlan.id)}
              className="shrink-0 text-xs font-medium text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1.5 rounded-lg border border-amber-400/40 transition-colors"
            >
              切り替える
            </button>
          </div>
        )}
      </div>

      {/* ===== プラン選択 ===== */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">プランを選択</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PLANS.map((p) => {
            const selected = selectedPlanId === p.id;
            const cost = p.overageRate === null && monthlyChars > p.includedChars ? null : calcCost(monthlyChars, p);
            const colors = PLAN_COLORS[p.color];
            const isOptimal = optimalPlan.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                className={`relative p-4 rounded-xl border text-left transition-all ${
                  selected
                    ? `${colors.bg} ${colors.border} ring-2 ${colors.ring}`
                    : "bg-white/5 border-white/15 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                {isOptimal && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                    最安
                  </div>
                )}
                <div className={`font-bold text-base ${selected ? colors.text : "text-white"}`}>{p.name}</div>
                <div className="text-xl font-bold text-white mt-1">
                  {p.basePrice === 0 ? "無料" : `$${p.basePrice}`}
                  {p.basePrice > 0 && <span className="text-xs font-normal text-white/60">/月</span>}
                </div>
                <div className="text-xs text-white/50 mt-1">{fmtChars(p.includedChars)}/月</div>
                {cost !== null ? (
                  <div className={`text-xs font-semibold mt-2 ${selected ? colors.text : "text-violet-300"}`}>
                    この使用量: {cost === 0 ? "無料" : fmtUSD(cost)}
                  </div>
                ) : (
                  <div className="text-xs text-red-400 mt-2">枠超過・不可</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== 計算結果 ===== */}
      <div className={`rounded-2xl border p-6 ${accentColors.bg} ${accentColors.border}`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">月額試算結果</h2>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${accentColors.badge}`}>
            {selectedPlan.name} プラン
          </span>
        </div>

        {/* 合計 */}
        <div className="mb-6">
          <div className="text-xs text-white/50 mb-1">月額合計（税別・USD）</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-bold text-white">
              {result.totalUSD === 0 ? "無料" : fmtUSD(result.totalUSD)}
            </span>
            {result.totalUSD > 0 && (
              <span className="text-xl text-white/70">{fmtJPY(result.totalUSD * exchangeRate)}</span>
            )}
          </div>
        </div>

        {/* 内訳 */}
        <div className="bg-black/20 rounded-xl p-4 space-y-2 text-sm mb-4">
          <div className="font-medium text-white/80 mb-2">料金内訳</div>

          <div className="flex justify-between text-white/70">
            <span>プラン基本料金（{selectedPlan.name}）</span>
            <span className="font-medium text-white">
              {selectedPlan.basePrice === 0 ? "無料" : fmtUSD(selectedPlan.basePrice)}
            </span>
          </div>

          <div className="flex justify-between text-white/70">
            <span>含まれる文字数</span>
            <span className="font-medium text-white">{fmtChars(selectedPlan.includedChars)}/月</span>
          </div>

          <div className="flex justify-between text-white/70">
            <span>使用文字数</span>
            <span className="font-medium text-white">{fmtChars(monthlyChars)}</span>
          </div>

          {/* 使用量バー */}
          <div className="pt-1 pb-1">
            <div className="flex justify-between text-xs text-white/50 mb-1">
              <span>使用率</span>
              <span>{monthlyChars > selectedPlan.includedChars ? "超過" : `${Math.round(result.usageRatio * 100)}%`}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  monthlyChars > selectedPlan.includedChars
                    ? "bg-red-400"
                    : result.usageRatio > 0.8
                    ? "bg-amber-400"
                    : "bg-violet-400"
                }`}
                style={{ width: `${Math.min(result.usageRatio * 100, 100)}%` }}
              />
            </div>
          </div>

          {result.overageChars > 0 && (
            <div className="flex justify-between text-red-400">
              <span>
                超過分（{fmtChars(result.overageChars)} × $0.30/1K文字）
              </span>
              <span className="font-medium">{fmtUSD(result.overageCost)}</span>
            </div>
          )}

          {result.overageChars === 0 && (
            <div className="text-violet-400 text-xs pt-1">枠内に収まっています</div>
          )}

          <div className="border-t border-white/10 pt-2 mt-1 flex justify-between font-semibold text-white">
            <span>月額合計</span>
            <span>{result.totalUSD === 0 ? "無料" : fmtUSD(result.totalUSD)}</span>
          </div>
        </div>

        {/* 1文字あたりのコスト */}
        <div className="bg-black/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-white/50 mb-0.5">1文字あたりのコスト</div>
            <div className="text-xl font-bold text-white">
              {monthlyChars === 0 ? "—" : `$${result.perCharUSD.toFixed(6)}`}
            </div>
            {monthlyChars > 0 && (
              <div className="text-xs text-white/50 mt-0.5">
                ≈ {(result.perCharUSD * exchangeRate * 1000).toFixed(4)}円/1,000文字
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-white/50 mb-0.5">1,000文字あたり</div>
            <div className="text-xl font-bold text-white">
              {monthlyChars === 0 ? "—" : fmtUSD(result.perCharUSD * 1_000)}
            </div>
          </div>
        </div>

        {/* 為替換算 */}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-sm text-white/50 whitespace-nowrap">1 USD =</span>
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
            className="w-24 px-2 py-1 text-right bg-black/30 border border-white/20 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <span className="text-sm text-white/50">円</span>
          {result.totalUSD > 0 && (
            <span className="text-sm text-white font-medium ml-auto">
              ≈ {fmtJPY(result.totalUSD * exchangeRate)}/月
            </span>
          )}
        </div>
      </div>

      {/* ===== プラン比較テーブル ===== */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">プラン別コスト比較</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 pr-4 text-xs text-white/50 font-medium">プラン</th>
                <th className="text-right py-2 pr-4 text-xs text-white/50 font-medium">月額</th>
                <th className="text-right py-2 pr-4 text-xs text-white/50 font-medium">含む文字数</th>
                <th className="text-right py-2 pr-4 text-xs text-white/50 font-medium">この使用量の費用</th>
                <th className="text-right py-2 text-xs text-white/50 font-medium">1K文字単価</th>
              </tr>
            </thead>
            <tbody>
              {allPlanCosts.map((p) => {
                const isSelected = p.id === selectedPlanId;
                const isOptimalRow = p.id === optimalPlan.id;
                const perK = p.cost !== null && monthlyChars > 0 ? (p.cost / monthlyChars) * 1_000 : null;
                const colors = PLAN_COLORS[p.color];
                return (
                  <tr
                    key={p.id}
                    onClick={() => p.cost !== null && setSelectedPlanId(p.id)}
                    className={`border-b border-white/5 cursor-pointer transition-colors ${
                      isSelected ? `${colors.bg}` : "hover:bg-white/5"
                    } ${p.cost === null ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isSelected ? colors.text : "text-white"}`}>{p.name}</span>
                        {isOptimalRow && (
                          <span className="text-xs bg-amber-500/80 text-white px-1.5 py-0.5 rounded-full">最安</span>
                        )}
                        {isSelected && !isOptimalRow && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${colors.badge}`}>選択中</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-right text-white/70">
                      {p.basePrice === 0 ? "無料" : `$${p.basePrice}/月`}
                    </td>
                    <td className="py-2.5 pr-4 text-right text-white/70">
                      {fmtChars(p.includedChars)}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-semibold text-white">
                      {p.cost === null
                        ? "—（枠超過）"
                        : p.cost === 0
                        ? "無料"
                        : fmtUSD(p.cost)}
                    </td>
                    <td className="py-2.5 text-right text-white/60 text-xs">
                      {perK !== null && monthlyChars > 0
                        ? `$${perK.toFixed(4)}`
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-white/30 mt-3">
          テーブルの行をクリックするとプランが切り替わります。超過料金は $0.30/1,000文字（全有料プラン共通）。
        </p>
      </div>

      {/* ===== 用途別文字数ガイド ===== */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">用途別・月間文字数の目安</h2>
        <div className="space-y-3">
          {USE_CASES.map((uc) => {
            const optimal = findOptimalPlan(uc.chars);
            const cost = calcCost(uc.chars, optimal);
            const ratio = uc.chars / 3_000_000;
            return (
              <div key={uc.id} className="flex items-center gap-4">
                <div className="text-xl w-8 shrink-0">{uc.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-medium truncate">{uc.label}</span>
                    <span className="text-xs text-violet-300 shrink-0 ml-2">{fmtChars(uc.chars)}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                      style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0 w-28">
                  <div className="text-xs text-white/50">最安: {optimal.name}</div>
                  <div className="text-sm font-semibold text-white">{cost === 0 ? "無料" : fmtUSD(cost)}</div>
                </div>
                <button
                  onClick={() => {
                    setMonthlyChars(uc.chars);
                    setSelectedPlanId(optimal.id);
                  }}
                  className="shrink-0 text-xs text-violet-300 hover:text-white bg-violet-600/30 hover:bg-violet-600/50 px-2.5 py-1.5 rounded-lg border border-violet-500/30 transition-colors"
                >
                  試算
                </button>
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このElevenLabs 料金試算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">ElevenLabsの音声合成料金を文字数・プラン別に計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このElevenLabs 料金試算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "ElevenLabsの音声合成料金を文字数・プラン別に計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
            );
          })}
        </div>
      </div>

      {/* ===== 注記 ===== */}
      <p className="text-xs text-white/30 text-center pb-4">
        料金は変更される場合があります。最新の料金は{" "}
        <span className="underline">elevenlabs.io/pricing</span> でご確認ください。
        超過料金 $0.30/1,000文字は全有料プラン共通。Freeプランは超過不可（月10,000文字まで）。
      </p>
    </div>
  );
}
