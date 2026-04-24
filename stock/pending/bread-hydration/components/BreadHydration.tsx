"use client";
import { useState } from "react";

const BREAD_TYPES = [
  { name: "食パン", min: 65, max: 70, description: "ふんわりやわらか。日常的なサンドイッチ向き" },
  { name: "バゲット", min: 68, max: 75, description: "クラストがパリッと、気泡が大きめ" },
  { name: "カンパーニュ", min: 70, max: 80, description: "酸味があり、どっしり食感の田舎パン" },
  { name: "フォカッチャ", min: 75, max: 85, description: "オリーブオイルを多く含む平たいパン" },
  { name: "チャバタ", min: 75, max: 85, description: "イタリア発祥。大きな気泡が特徴" },
  { name: "ブリオッシュ", min: 50, max: 60, description: "卵・バター多め。リッチな甘みのあるパン" },
  { name: "ベーグル", min: 55, max: 62, description: "もちもち食感。茹でてから焼く" },
  { name: "ピタ", min: 60, max: 65, description: "中東発祥。ポケットができる平たいパン" },
  { name: "クロワッサン", min: 45, max: 55, description: "バター折り込み。サクサク層状の生地" },
  { name: "高加水パン", min: 80, max: 95, description: "極めて水分が多い。扱いに技術が必要" },
];

export default function BreadHydration() {
  const [flourWeight, setFlourWeight] = useState<string>("300");
  const [hydration, setHydration] = useState<string>("70");
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [mode, setMode] = useState<"from-flour" | "from-water">("from-flour");
  const [waterWeight, setWaterWeight] = useState<string>("210");

  const flour = parseFloat(flourWeight) || 0;
  const hydPct = parseFloat(hydration) || 0;
  const water = parseFloat(waterWeight) || 0;

  const calculatedWater = (flour * hydPct) / 100;
  const calculatedFlour = hydPct > 0 ? (water / hydPct) * 100 : 0;
  const calculatedHydration = flour > 0 ? (water / flour) * 100 : 0;

  const selectedBread = selectedType !== null ? BREAD_TYPES[selectedType] : null;
  const isInRange = selectedBread
    ? hydPct >= selectedBread.min && hydPct <= selectedBread.max
    : null;

  const getHydrationColor = (pct: number) => {
    if (pct < 55) return "text-blue-600";
    if (pct < 70) return "text-green-600";
    if (pct < 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getHydrationLabel = (pct: number) => {
    if (pct < 55) return "低加水";
    if (pct < 70) return "標準";
    if (pct < 80) return "高加水";
    return "超高加水";
  };

  return (
    <div className="space-y-6">
      {/* Mode Switch */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setMode("from-flour")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === "from-flour"
              ? "bg-amber-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          粉量 → 水分量を計算
        </button>
        <button
          onClick={() => setMode("from-water")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === "from-water"
              ? "bg-amber-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          水分量 → 加水率を計算
        </button>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        {mode === "from-flour" ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                粉の量（g）
              </label>
              <input
                type="number"
                value={flourWeight}
                onChange={(e) => setFlourWeight(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="例: 300"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                加水率（%）
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={hydration}
                  onChange={(e) => setHydration(e.target.value)}
                  className="flex-1 accent-amber-500"
                />
                <input
                  type="number"
                  value={hydration}
                  onChange={(e) => setHydration(e.target.value)}
                  className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                粉の量（g）
              </label>
              <input
                type="number"
                value={flourWeight}
                onChange={(e) => setFlourWeight(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="例: 300"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                水分の量（g）
              </label>
              <input
                type="number"
                value={waterWeight}
                onChange={(e) => setWaterWeight(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="例: 210"
                min="0"
              />
            </div>
          </>
        )}
      </div>

      {/* Result */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
        {mode === "from-flour" ? (
          <div className="text-center">
            <p className="text-sm text-amber-700 mb-1">必要な水分量</p>
            <p className="text-5xl font-bold text-amber-600">
              {flour > 0 ? calculatedWater.toFixed(1) : "—"}
              <span className="text-2xl ml-1">g</span>
            </p>
            <p className={`mt-2 text-sm font-medium ${getHydrationColor(hydPct)}`}>
              {hydPct > 0 ? getHydrationLabel(hydPct) : ""}（加水率 {hydPct}%）
            </p>
            {flour > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3 border border-amber-100">
                  <p className="text-gray-500">粉</p>
                  <p className="font-semibold text-gray-800">{flour.toFixed(0)}g</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-amber-100">
                  <p className="text-gray-500">水</p>
                  <p className="font-semibold text-gray-800">{calculatedWater.toFixed(1)}g</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-amber-100">
                  <p className="text-gray-500">合計生地量</p>
                  <p className="font-semibold text-gray-800">{(flour + calculatedWater).toFixed(1)}g</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-amber-100">
                  <p className="text-gray-500">加水率</p>
                  <p className={`font-semibold ${getHydrationColor(hydPct)}`}>{hydPct}%</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-amber-700 mb-1">加水率</p>
            <p className={`text-5xl font-bold ${getHydrationColor(calculatedHydration)}`}>
              {flour > 0 ? calculatedHydration.toFixed(1) : "—"}
              <span className="text-2xl ml-1">%</span>
            </p>
            <p className={`mt-2 text-sm font-medium ${getHydrationColor(calculatedHydration)}`}>
              {flour > 0 ? getHydrationLabel(calculatedHydration) : ""}
            </p>
          </div>
        )}
      </div>

      {/* Bread Type Selector */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">パン種類別 推奨加水率</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BREAD_TYPES.map((bread, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedType(idx === selectedType ? null : idx);
                if (idx !== selectedType) {
                  const mid = Math.round((bread.min + bread.max) / 2);
                  setHydration(String(mid));
                }
              }}
              className={`text-left p-3 rounded-lg border transition-all text-sm ${
                selectedType === idx
                  ? "border-amber-400 bg-amber-50 ring-1 ring-amber-400"
                  : "border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/40"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">{bread.name}</span>
                <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                  {bread.min}〜{bread.max}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{bread.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Range check */}
      {selectedBread && mode === "from-flour" && flour > 0 && (
        <div
          className={`rounded-lg p-4 border text-sm ${
            isInRange
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-orange-50 border-orange-200 text-orange-800"
          }`}
        >
          {isInRange ? (
            <p>現在の加水率 {hydPct}% は<strong>{selectedBread.name}</strong>の推奨範囲（{selectedBread.min}〜{selectedBread.max}%）内です。</p>
          ) : (
            <p>現在の加水率 {hydPct}% は<strong>{selectedBread.name}</strong>の推奨範囲（{selectedBread.min}〜{selectedBread.max}%）外です。スライダーで調整してください。</p>
          )}
        </div>
      )}

      {/* Hydration Scale */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">加水率の目安スケール</h3>
        <div className="relative h-6 rounded-full overflow-hidden bg-gradient-to-r from-blue-200 via-green-200 via-yellow-200 to-red-300">
          {mode === "from-flour" && hydPct > 0 && (
            <div
              className="absolute top-0 bottom-0 w-1 bg-gray-800 rounded-full"
              style={{ left: `${Math.min(Math.max(((hydPct - 40) / 60) * 100, 0), 100)}%` }}
            />
          )}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>40%（低）</span>
          <span>60%（標準）</span>
          <span>80%（高）</span>
          <span>100%（超高）</span>
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このパン加水率計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">粉量から水分量を逆算、パン種類別推奨加水率。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このパン加水率計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "粉量から水分量を逆算、パン種類別推奨加水率。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "パン加水率計算",
  "description": "粉量から水分量を逆算、パン種類別推奨加水率",
  "url": "https://tools.loresync.dev/bread-hydration",
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
