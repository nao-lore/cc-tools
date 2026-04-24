"use client";

import { useState, useMemo } from "react";

interface AssetClass {
  id: string;
  name: string;
  amount: string;
  expectedReturn: string;
  risk: string;
  color: string;
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
];

const DEFAULT_ASSETS: AssetClass[] = [
  { id: "1", name: "国内株式", amount: "300", expectedReturn: "5", risk: "20", color: COLORS[0] },
  { id: "2", name: "海外株式", amount: "200", expectedReturn: "7", risk: "25", color: COLORS[1] },
  { id: "3", name: "国内債券", amount: "150", expectedReturn: "1", risk: "5", color: COLORS[2] },
  { id: "4", name: "海外債券", amount: "100", expectedReturn: "3", risk: "10", color: COLORS[3] },
  { id: "5", name: "現金", amount: "150", expectedReturn: "0.1", risk: "0", color: COLORS[4] },
  { id: "6", name: "暗号資産", amount: "100", expectedReturn: "20", risk: "80", color: COLORS[5] },
];

type Preset = "stable" | "balance" | "growth";

const PRESETS: Record<Preset, { label: string; description: string; amounts: number[] }> = {
  stable: {
    label: "安定型",
    description: "債券70% 株式20% 現金10%",
    amounts: [100, 100, 350, 350, 100, 0],
  },
  balance: {
    label: "バランス型",
    description: "株式50% 債券40% 現金10%",
    amounts: [300, 200, 200, 200, 100, 0],
  },
  growth: {
    label: "成長型",
    description: "株式80% 債券10% 現金10%",
    amounts: [500, 300, 50, 50, 100, 0],
  },
};

function getRiskLabel(risk: number): { label: string; color: string; bg: string } {
  if (risk < 10) return { label: "低リスク", color: "text-green-700", bg: "bg-green-50 border-green-200" };
  if (risk < 25) return { label: "中リスク", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" };
  if (risk < 50) return { label: "高リスク", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" };
  return { label: "超高リスク", color: "text-red-700", bg: "bg-red-50 border-red-200" };
}

function PieChart({ segments }: { segments: { pct: number; color: string; name: string }[] }) {
  const validSegments = segments.filter((s) => s.pct > 0);
  if (validSegments.length === 0) {
    return (
      <div className="w-48 h-48 rounded-full bg-gray-100 flex items-center justify-center">
        <span className="text-xs text-gray-400">データなし</span>
      </div>
    );
  }

  // Build conic-gradient stops
  let cumulative = 0;
  const stops = validSegments.map((seg) => {
    const start = cumulative;
    cumulative += seg.pct;
    return `${seg.color} ${start.toFixed(2)}% ${cumulative.toFixed(2)}%`;
  });

  const gradient = `conic-gradient(${stops.join(", ")})`;

  return (
    <div className="relative">
      <div
        className="w-48 h-48 rounded-full"
        style={{ background: gradient }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center"
        />
      </div>
    </div>
  );
}

export default function AssetAllocation() {
  const [assets, setAssets] = useState<AssetClass[]>(DEFAULT_ASSETS);

  const totalAmount = useMemo(
    () => assets.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0),
    [assets]
  );

  const segments = useMemo(
    () =>
      assets.map((a) => ({
        pct: totalAmount > 0 ? ((parseFloat(a.amount) || 0) / totalAmount) * 100 : 0,
        color: a.color,
        name: a.name,
      })),
    [assets, totalAmount]
  );

  const weightedReturn = useMemo(() => {
    if (totalAmount === 0) return 0;
    return assets.reduce((sum, a) => {
      const amt = parseFloat(a.amount) || 0;
      const ret = parseFloat(a.expectedReturn) || 0;
      return sum + (amt / totalAmount) * ret;
    }, 0);
  }, [assets, totalAmount]);

  const weightedRisk = useMemo(() => {
    if (totalAmount === 0) return 0;
    return assets.reduce((sum, a) => {
      const amt = parseFloat(a.amount) || 0;
      const risk = parseFloat(a.risk) || 0;
      return sum + (amt / totalAmount) * risk;
    }, 0);
  }, [assets, totalAmount]);

  const riskLabel = getRiskLabel(weightedRisk);

  function updateAsset(id: string, field: keyof AssetClass, value: string) {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  }

  function applyPreset(preset: Preset) {
    const { amounts } = PRESETS[preset];
    setAssets((prev) =>
      prev.map((a, i) => ({ ...a, amount: String(amounts[i] ?? 0) }))
    );
  }

  function resetToDefault() {
    setAssets(DEFAULT_ASSETS);
  }

  return (
    <div className="space-y-5">
      {/* Presets */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm font-semibold text-gray-700">プリセット</p>
          <button
            onClick={resetToDefault}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            リセット
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(Object.entries(PRESETS) as [Preset, typeof PRESETS[Preset]][]).map(([key, p]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className="flex flex-col items-start px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
            >
              <span className="text-sm font-medium text-gray-800">{p.label}</span>
              <span className="text-[11px] text-gray-400">{p.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Asset input table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4">
        <p className="text-sm font-semibold text-gray-700">資産クラス設定</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left pb-2 font-medium w-4" />
                <th className="text-left pb-2 font-medium">資産クラス</th>
                <th className="text-right pb-2 font-medium">金額（万円）</th>
                <th className="text-right pb-2 font-medium">期待リターン（%）</th>
                <th className="text-right pb-2 font-medium">リスク（%）</th>
                <th className="text-right pb-2 font-medium">配分比率</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assets.map((asset) => {
                const pct =
                  totalAmount > 0
                    ? ((parseFloat(asset.amount) || 0) / totalAmount) * 100
                    : 0;
                return (
                  <tr key={asset.id} className="group">
                    <td className="py-2 pr-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: asset.color }}
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        value={asset.name}
                        onChange={(e) => updateAsset(asset.id, "name", e.target.value)}
                        className="w-full text-sm text-gray-800 bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none py-0.5 transition-colors"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={asset.amount}
                        onChange={(e) => updateAsset(asset.id, "amount", e.target.value)}
                        className="w-24 text-right rounded-lg border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ml-auto block"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={asset.expectedReturn}
                        onChange={(e) => updateAsset(asset.id, "expectedReturn", e.target.value)}
                        className="w-20 text-right rounded-lg border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ml-auto block"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={asset.risk}
                        onChange={(e) => updateAsset(asset.id, "risk", e.target.value)}
                        className="w-20 text-right rounded-lg border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ml-auto block"
                      />
                    </td>
                    <td className="py-2 pl-3 text-right">
                      <span className="text-sm font-semibold text-gray-700">
                        {pct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart + Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Pie chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 flex flex-col items-center gap-4">
          <p className="text-sm font-semibold text-gray-700 self-start">配分チャート</p>
          <PieChart segments={segments} />
          {/* Legend */}
          <div className="w-full space-y-1.5">
            {assets
              .filter((a) => (parseFloat(a.amount) || 0) > 0)
              .map((asset) => {
                const pct =
                  totalAmount > 0
                    ? ((parseFloat(asset.amount) || 0) / totalAmount) * 100
                    : 0;
                return (
                  <div key={asset.id} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: asset.color }}
                    />
                    <span className="text-xs text-gray-600 flex-1">{asset.name}</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          {/* Total */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-3">
            <p className="text-sm font-semibold text-gray-700">サマリー</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">合計資産</span>
                <span className="text-lg font-bold text-gray-900">
                  {totalAmount.toLocaleString("ja-JP")}万円
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">加重平均リターン</span>
                <span className="text-base font-bold text-emerald-600">
                  +{weightedReturn.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">加重平均リスク（標準偏差目安）</span>
                <span className="text-base font-bold text-orange-600">
                  ±{weightedRisk.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Risk assessment */}
          <div className={`rounded-2xl border px-6 py-5 space-y-2 ${riskLabel.bg}`}>
            <p className="text-sm font-semibold text-gray-700">リスク評価</p>
            <p className={`text-xl font-bold ${riskLabel.color}`}>{riskLabel.label}</p>
            <p className="text-xs text-gray-500">
              加重平均リスク {weightedRisk.toFixed(1)}% は、1年間で資産が約±{weightedRisk.toFixed(0)}%変動する可能性を示します。
            </p>
          </div>

          {/* Expected range */}
          {totalAmount > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-3">
              <p className="text-sm font-semibold text-gray-700">1年後の想定レンジ（目安）</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">楽観シナリオ（+1σ）</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {Math.round(totalAmount * (1 + (weightedReturn + weightedRisk) / 100)).toLocaleString("ja-JP")}万円
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">中央値</span>
                  <span className="text-sm font-bold text-gray-700">
                    {Math.round(totalAmount * (1 + weightedReturn / 100)).toLocaleString("ja-JP")}万円
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">悲観シナリオ（-1σ）</span>
                  <span className="text-sm font-bold text-red-600">
                    {Math.round(totalAmount * (1 + (weightedReturn - weightedRisk) / 100)).toLocaleString("ja-JP")}万円
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400">
                ※ 正規分布を仮定した参考値です。実際の運用結果を保証するものではありません。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bar breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4">
        <p className="text-sm font-semibold text-gray-700">配分バー</p>
        <div className="space-y-2">
          {assets
            .filter((a) => (parseFloat(a.amount) || 0) > 0)
            .map((asset) => {
              const pct =
                totalAmount > 0
                  ? ((parseFloat(asset.amount) || 0) / totalAmount) * 100
                  : 0;
              return (
                <div key={asset.id} className="flex items-center gap-3">
                  <div className="w-20 text-right text-xs text-gray-500 shrink-0">
                    {asset.name}
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: asset.color,
                      }}
                    />
                  </div>
                  <div className="w-16 text-xs font-semibold text-gray-700 shrink-0">
                    {pct.toFixed(1)}%
                  </div>
                  <div className="w-20 text-xs text-gray-400 shrink-0 text-right">
                    {(parseFloat(asset.amount) || 0).toLocaleString("ja-JP")}万円
                  </div>
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このアセットアロケーション 可視化ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">株・債券・現金・暗号資産の配分を円グラフ、リスク目安表示。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このアセットアロケーション 可視化ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "株・債券・現金・暗号資産の配分を円グラフ、リスク目安表示。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
              );
            })}
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
        広告スペース
      </div>
    </div>
  );
}
