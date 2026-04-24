"use client";
import { useState } from "react";

const STYLE_PRESETS = [
  { name: "ライトラガー", og: 1.040, fg: 1.008, style: "ビール" },
  { name: "アメリカンIPA", og: 1.065, fg: 1.012, style: "ビール" },
  { name: "スタウト", og: 1.070, fg: 1.018, style: "ビール" },
  { name: "バーレーワイン", og: 1.100, fg: 1.020, style: "ビール" },
  { name: "白ワイン（辛口）", og: 1.090, fg: 0.994, style: "ワイン" },
  { name: "赤ワイン", og: 1.100, fg: 0.996, style: "ワイン" },
  { name: "甘口ワイン", og: 1.120, fg: 1.010, style: "ワイン" },
  { name: "シードル（辛口）", og: 1.055, fg: 1.000, style: "シードル" },
  { name: "ミード", og: 1.120, fg: 1.015, style: "ミード" },
  { name: "清酒（普通酒）", og: 1.060, fg: 1.000, style: "日本酒" },
];

const BRIX_TO_SG = (brix: number) => 1 + brix / (258.6 - ((brix / 258.2) * 227.1));

export default function AbvCalculator() {
  const [og, setOg] = useState<string>("1.050");
  const [fg, setFg] = useState<string>("1.010");
  const [inputMode, setInputMode] = useState<"sg" | "brix">("sg");
  const [ogBrix, setOgBrix] = useState<string>("12.4");
  const [fgBrix, setFgBrix] = useState<string>("2.5");
  const [volume, setVolume] = useState<string>("20");
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const getOG = () => {
    if (inputMode === "sg") return parseFloat(og) || 0;
    return BRIX_TO_SG(parseFloat(ogBrix) || 0);
  };

  const getFG = () => {
    if (inputMode === "sg") return parseFloat(fg) || 0;
    return BRIX_TO_SG(parseFloat(fgBrix) || 0);
  };

  const OG = getOG();
  const FG = getFG();

  // Standard formula
  const abvSimple = (OG - FG) * 131.25;
  // More precise formula (Balling)
  const abvPrecise = OG > 0 && FG > 0
    ? (76.08 * (OG - FG)) / (1.775 - OG) * (FG / 0.794)
    : 0;

  const attenuation = OG > 1 && FG > 0 ? ((OG - FG) / (OG - 1)) * 100 : 0;

  const calories100ml = FG > 0
    ? ((0.53 * abvSimple * FG * 1000) + (11.2 * ((FG - 1) * 1000 + abvSimple * 0.125)))
    : 0;

  const volNum = parseFloat(volume) || 0;
  const totalCalories = (calories100ml / 100) * volNum * 1000;

  const applyPreset = (idx: number) => {
    const p = STYLE_PRESETS[idx];
    setInputMode("sg");
    setOg(String(p.og));
    setFg(String(p.fg));
    setActivePreset(idx);
  };

  const styles = [...new Set(STYLE_PRESETS.map((p) => p.style))];

  const getAbvColor = (abv: number) => {
    if (abv < 4) return "text-green-600";
    if (abv < 7) return "text-yellow-600";
    if (abv < 12) return "text-orange-600";
    return "text-red-600";
  };

  const isValid = OG > 1 && FG > 0 && OG > FG;

  return (
    <div className="space-y-6">
      {/* Style Presets */}
      <div>
        <p className="text-xs text-gray-500 mb-2">醸造スタイルから選ぶ</p>
        {styles.map((style) => (
          <div key={style} className="mb-3">
            <p className="text-xs font-semibold text-gray-400 mb-1">{style}</p>
            <div className="flex flex-wrap gap-2">
              {STYLE_PRESETS.filter((p) => p.style === style).map((p, idx) => {
                const realIdx = STYLE_PRESETS.indexOf(p);
                return (
                  <button
                    key={idx}
                    onClick={() => applyPreset(realIdx)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      activePreset === realIdx
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-white text-gray-600 border-gray-300 hover:border-amber-300"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Input Mode */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setInputMode("sg")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            inputMode === "sg" ? "bg-amber-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          比重（SG）で入力
        </button>
        <button
          onClick={() => setInputMode("brix")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            inputMode === "brix" ? "bg-amber-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Brix（糖度）で入力
        </button>
      </div>

      {/* Inputs */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        {inputMode === "sg" ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                初期比重（OG）
              </label>
              <input
                type="number"
                value={og}
                onChange={(e) => { setOg(e.target.value); setActivePreset(null); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                step="0.001"
                min="1.000"
                max="1.200"
                placeholder="例: 1.050"
              />
              <p className="text-xs text-gray-400 mt-1">仕込み直後に測定（糖度計またはハイドロメーター）</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最終比重（FG）
              </label>
              <input
                type="number"
                value={fg}
                onChange={(e) => { setFg(e.target.value); setActivePreset(null); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                step="0.001"
                min="0.990"
                max="1.050"
                placeholder="例: 1.010"
              />
              <p className="text-xs text-gray-400 mt-1">発酵完了後に測定</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                初期Brix（°Bx）
              </label>
              <input
                type="number"
                value={ogBrix}
                onChange={(e) => setOgBrix(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                step="0.1"
                min="0"
                placeholder="例: 12.4"
              />
              <p className="text-xs text-gray-400 mt-1">換算SG: {OG > 0 ? OG.toFixed(3) : "—"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最終Brix（°Bx）
              </label>
              <input
                type="number"
                value={fgBrix}
                onChange={(e) => setFgBrix(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                step="0.1"
                min="0"
                placeholder="例: 2.5"
              />
              <p className="text-xs text-gray-400 mt-1">換算SG: {FG > 0 ? FG.toFixed(3) : "—"}</p>
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            醸造量（L）
          </label>
          <input
            type="number"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            step="1"
            min="0"
            placeholder="例: 20"
          />
        </div>
      </div>

      {/* Results */}
      {isValid ? (
        <div className="space-y-4">
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 text-center">
            <p className="text-sm text-amber-700 mb-1">アルコール度数（ABV）</p>
            <p className={`text-5xl font-bold ${getAbvColor(abvSimple)}`}>
              {abvSimple.toFixed(2)}<span className="text-2xl ml-1">%</span>
            </p>
            <p className="text-xs text-amber-600 mt-2">精密計算: {abvPrecise.toFixed(2)}%</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">見かけ発酵度</p>
              <p className="text-xl font-bold text-gray-800">{attenuation.toFixed(1)}<span className="text-sm">%</span></p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">残糖（概算）</p>
              <p className="text-xl font-bold text-gray-800">{((FG - 1) * 1000 * 0.4).toFixed(1)}<span className="text-sm">g/L</span></p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">カロリー</p>
              <p className="text-xl font-bold text-gray-800">{calories100ml.toFixed(0)}<span className="text-sm">kcal/L</span></p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">総カロリー({volume}L)</p>
              <p className="text-xl font-bold text-gray-800">{totalCalories.toFixed(0)}<span className="text-sm">kcal</span></p>
            </div>
          </div>

          {/* ABV Scale */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">度数の目安</h3>
            <div className="space-y-2 text-sm">
              {[
                { label: "ビール・発泡酒", range: "3〜8%", match: abvSimple >= 3 && abvSimple <= 8 },
                { label: "ワイン・日本酒", range: "10〜15%", match: abvSimple >= 10 && abvSimple <= 15 },
                { label: "スパークリングワイン", range: "10〜13%", match: abvSimple >= 10 && abvSimple <= 13 },
                { label: "ミード・シードル", range: "5〜15%", match: abvSimple >= 5 && abvSimple <= 15 },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center px-3 py-2 rounded-lg ${
                    item.match ? "bg-amber-100 text-amber-800 font-medium" : "text-gray-600"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-xs">{item.range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400">
          <p className="text-2xl mb-2">🧪</p>
          <p className="text-sm">初期比重と最終比重を入力してください</p>
          <p className="text-xs mt-1">OG &gt; FG である必要があります</p>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このアルコール度数計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">比重からアルコール度数を計算（自家醸造用）。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このアルコール度数計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "比重からアルコール度数を計算（自家醸造用）。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "アルコール度数計算",
  "description": "比重からアルコール度数を計算（自家醸造用）",
  "url": "https://tools.loresync.dev/abv-calc",
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
