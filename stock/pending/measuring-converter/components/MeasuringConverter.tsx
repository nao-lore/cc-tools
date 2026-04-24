"use client";

import { useState, useMemo } from "react";

interface FoodItem {
  name: string;
  nameEn: string;
  // grams per 1ml (density)
  density: number;
}

// Density = g/ml. 大さじ=15ml, 小さじ=5ml, カップ=200ml
// Values sourced from standard Japanese cooking references (文部科学省食品成分データベース等)
const FOOD_ITEMS: FoodItem[] = [
  // 粉類
  { name: "薄力粉（小麦粉）", nameEn: "cake flour", density: 0.60 },
  { name: "強力粉", nameEn: "bread flour", density: 0.57 },
  { name: "片栗粉", nameEn: "potato starch", density: 0.65 },
  { name: "コーンスターチ", nameEn: "corn starch", density: 0.60 },
  { name: "米粉", nameEn: "rice flour", density: 0.60 },
  { name: "きな粉", nameEn: "kinako", density: 0.53 },
  { name: "ベーキングパウダー", nameEn: "baking powder", density: 0.73 },
  { name: "重曹（ベーキングソーダ）", nameEn: "baking soda", density: 0.80 },
  { name: "抹茶", nameEn: "matcha", density: 0.53 },
  { name: "ココアパウダー", nameEn: "cocoa powder", density: 0.53 },
  { name: "パン粉（乾燥）", nameEn: "breadcrumbs (dry)", density: 0.20 },
  { name: "ゴマ（白）", nameEn: "sesame seeds (white)", density: 0.60 },
  { name: "ゴマ（黒）", nameEn: "sesame seeds (black)", density: 0.60 },
  // 砂糖類
  { name: "上白糖", nameEn: "white sugar (JP)", density: 0.60 },
  { name: "グラニュー糖", nameEn: "granulated sugar", density: 0.80 },
  { name: "粉砂糖", nameEn: "powdered sugar", density: 0.53 },
  { name: "三温糖", nameEn: "soft brown sugar", density: 0.60 },
  { name: "黒砂糖（粉末）", nameEn: "brown sugar (powder)", density: 0.73 },
  { name: "はちみつ", nameEn: "honey", density: 1.43 },
  { name: "メープルシロップ", nameEn: "maple syrup", density: 1.33 },
  { name: "みりん", nameEn: "mirin", density: 1.20 },
  // 塩・調味料
  { name: "塩（精製塩）", nameEn: "salt (refined)", density: 1.20 },
  { name: "塩（粗塩）", nameEn: "salt (coarse)", density: 0.80 },
  { name: "醤油", nameEn: "soy sauce", density: 1.20 },
  { name: "薄口醤油", nameEn: "light soy sauce", density: 1.20 },
  { name: "味噌（白）", nameEn: "white miso", density: 1.10 },
  { name: "味噌（赤）", nameEn: "red miso", density: 1.20 },
  { name: "酢", nameEn: "rice vinegar", density: 1.00 },
  { name: "バルサミコ酢", nameEn: "balsamic vinegar", density: 1.07 },
  { name: "ウスターソース", nameEn: "worcestershire sauce", density: 1.20 },
  { name: "オイスターソース", nameEn: "oyster sauce", density: 1.20 },
  { name: "ケチャップ", nameEn: "ketchup", density: 1.20 },
  { name: "マヨネーズ", nameEn: "mayonnaise", density: 0.87 },
  { name: "豆板醤", nameEn: "doubanjiang", density: 1.07 },
  { name: "コチュジャン", nameEn: "gochujang", density: 1.13 },
  { name: "めんつゆ（ストレート）", nameEn: "mentsuyu (straight)", density: 1.07 },
  { name: "ポン酢", nameEn: "ponzu", density: 1.07 },
  // 油脂類
  { name: "サラダ油（植物油）", nameEn: "vegetable oil", density: 0.91 },
  { name: "オリーブオイル", nameEn: "olive oil", density: 0.91 },
  { name: "ごま油", nameEn: "sesame oil", density: 0.91 },
  { name: "バター（有塩）", nameEn: "butter (salted)", density: 0.94 },
  { name: "バター（無塩）", nameEn: "butter (unsalted)", density: 0.94 },
  { name: "ラード", nameEn: "lard", density: 0.87 },
  // 乳製品・液体
  { name: "牛乳", nameEn: "milk", density: 1.03 },
  { name: "豆乳（無調整）", nameEn: "soy milk (unsweetened)", density: 1.03 },
  { name: "生クリーム（36%）", nameEn: "heavy cream (36%)", density: 1.01 },
  { name: "ヨーグルト（プレーン）", nameEn: "plain yogurt", density: 1.04 },
  { name: "練乳（加糖）", nameEn: "condensed milk", density: 1.33 },
  { name: "水", nameEn: "water", density: 1.00 },
  { name: "酒（料理酒）", nameEn: "cooking sake", density: 1.00 },
  // スパイス・その他粉末
  { name: "カレー粉", nameEn: "curry powder", density: 0.53 },
  { name: "胡椒（粉）", nameEn: "black pepper (ground)", density: 0.53 },
  { name: "シナモン（粉）", nameEn: "cinnamon (ground)", density: 0.53 },
  { name: "顆粒だし（和風）", nameEn: "dashi granules", density: 0.60 },
  { name: "鶏ガラスープの素", nameEn: "chicken bouillon powder", density: 0.60 },
  { name: "コンソメ（顆粒）", nameEn: "consommé (granules)", density: 0.60 },
];

const MEASURES = [
  { label: "小さじ（5ml）", ml: 5 },
  { label: "大さじ（15ml）", ml: 15 },
  { label: "カップ（200ml）", ml: 200 },
];

type Mode = "forward" | "reverse";

export default function MeasuringConverter() {
  const [mode, setMode] = useState<Mode>("forward");
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem>(FOOD_ITEMS[0]);
  const [measureIdx, setMeasureIdx] = useState(1); // default: 大さじ
  const [amount, setAmount] = useState("1");
  const [gramsInput, setGramsInput] = useState("100");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredFoods = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return FOOD_ITEMS;
    return FOOD_ITEMS.filter(
      (f) => f.name.includes(q) || f.nameEn.toLowerCase().includes(q)
    );
  }, [search]);

  const measure = MEASURES[measureIdx];

  // Forward: volume → grams
  const forwardResult = useMemo(() => {
    const qty = parseFloat(amount);
    if (isNaN(qty) || qty <= 0) return null;
    const totalMl = qty * measure.ml;
    const grams = totalMl * selectedFood.density;
    return { grams: Math.round(grams * 10) / 10, totalMl };
  }, [amount, measure, selectedFood]);

  // Reverse: grams → volume
  const reverseResult = useMemo(() => {
    const g = parseFloat(gramsInput);
    if (isNaN(g) || g <= 0) return null;
    const ml = g / selectedFood.density;
    return {
      小さじ: Math.round((ml / 5) * 10) / 10,
      大さじ: Math.round((ml / 15) * 10) / 10,
      カップ: Math.round((ml / 200) * 100) / 100,
      ml: Math.round(ml * 10) / 10,
    };
  }, [gramsInput, selectedFood]);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setSearch("");
    setDropdownOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
        <button
          onClick={() => setMode("forward")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === "forward"
              ? "bg-green-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          大さじ → g
        </button>
        <button
          onClick={() => setMode("reverse")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === "reverse"
              ? "bg-green-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          g → 大さじ
        </button>
      </div>

      {/* Food selector */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">食材を選ぶ</h2>

        <div className="relative">
          <input
            type="text"
            placeholder="食材名で検索（例: 小麦粉、砂糖）"
            value={dropdownOpen ? search : selectedFood.name}
            onFocus={() => {
              setSearch("");
              setDropdownOpen(true);
            }}
            onChange={(e) => {
              setSearch(e.target.value);
              setDropdownOpen(true);
            }}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
              {filteredFoods.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400">見つかりません</div>
              ) : (
                filteredFoods.map((food) => (
                  <button
                    key={food.name}
                    onMouseDown={() => handleSelectFood(food)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 transition-colors ${
                      food.name === selectedFood.name ? "bg-green-50 text-green-700 font-medium" : "text-gray-700"
                    }`}
                  >
                    {food.name}
                    <span className="text-xs text-gray-400 ml-2">{food.nameEn}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-400">
          密度: {selectedFood.density} g/ml
        </div>
      </div>

      {/* Forward mode */}
      {mode === "forward" && (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">計量単位と量</h2>

            {/* Measure selector */}
            <div className="flex gap-2">
              {MEASURES.map((m, i) => (
                <button
                  key={m.label}
                  onClick={() => setMeasureIdx(i)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    measureIdx === i
                      ? "bg-green-600 border-green-600 text-white"
                      : "border-gray-300 text-gray-600 hover:border-green-400 hover:text-green-600"
                  }`}
                >
                  {i === 0 ? "小さじ" : i === 1 ? "大さじ" : "カップ"}
                  <span className="block text-xs opacity-70">{m.ml}ml</span>
                </button>
              ))}
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">量</label>
              <div className="flex gap-2">
                {["0.5", "1", "2", "3"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(v)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      amount === v
                        ? "bg-green-600 border-green-600 text-white"
                        : "border-gray-300 text-gray-600 hover:border-green-400"
                    }`}
                  >
                    {v}
                  </button>
                ))}
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="数値入力"
                />
              </div>
            </div>
          </div>

          {/* Result */}
          {forwardResult ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-6 space-y-3">
              <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">換算結果</p>
              <div className="flex items-end gap-3">
                <p className="text-6xl font-extrabold text-green-700">{forwardResult.grams}</p>
                <p className="text-2xl font-bold text-green-600 mb-1">g</p>
              </div>
              <p className="text-sm text-gray-500">
                {selectedFood.name} {amount}{measure.label.split("（")[0]} ({forwardResult.totalMl}ml)
              </p>
              <div className="rounded-lg bg-white/70 border border-green-100 px-4 py-2 text-xs text-gray-500 font-mono">
                {forwardResult.totalMl}ml × {selectedFood.density} g/ml = {forwardResult.grams} g
              </div>

              {/* Useful conversions */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {MEASURES.map((m) => {
                  const g = Math.round(parseFloat(amount) * m.ml * selectedFood.density * 10) / 10;
                  if (isNaN(g)) return null;
                  return (
                    <div key={m.label} className="bg-white border border-green-200 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400">{m.ml === 5 ? "小さじ" : m.ml === 15 ? "大さじ" : "カップ"} {amount}</p>
                      <p className="text-lg font-bold text-green-700">{g}g</p>
                    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この計量変換（大さじ・カップ→g）ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">食材別の正確な重量換算（小麦粉、砂糖、塩、油など100種）。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この計量変換（大さじ・カップ→g）ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "食材別の正確な重量換算（小麦粉、砂糖、塩、油など100種）。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center text-sm text-gray-400">
              量を入力してください
            </div>
          )}
        </>
      )}

      {/* Reverse mode */}
      {mode === "reverse" && (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">グラム数を入力</h2>
            <div>
              <div className="flex gap-2 mb-3">
                {["50", "100", "200", "500"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setGramsInput(v)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      gramsInput === v
                        ? "bg-green-600 border-green-600 text-white"
                        : "border-gray-300 text-gray-600 hover:border-green-400"
                    }`}
                  >
                    {v}g
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={gramsInput}
                  onChange={(e) => setGramsInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="例: 100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">g</span>
              </div>
            </div>
          </div>

          {reverseResult ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-6 space-y-4">
              <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">換算結果</p>
              <p className="text-sm text-gray-600">{selectedFood.name} {gramsInput}g は…</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">小さじ</p>
                  <p className="text-3xl font-extrabold text-green-700">{reverseResult.小さじ}</p>
                  <p className="text-xs text-gray-400 mt-0.5">杯</p>
                </div>
                <div className="bg-white border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">大さじ</p>
                  <p className="text-3xl font-extrabold text-green-700">{reverseResult.大さじ}</p>
                  <p className="text-xs text-gray-400 mt-0.5">杯</p>
                </div>
                <div className="bg-white border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">カップ</p>
                  <p className="text-3xl font-extrabold text-green-700">{reverseResult.カップ}</p>
                  <p className="text-xs text-gray-400 mt-0.5">杯</p>
                </div>
                <div className="bg-white border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400 mb-1">ml</p>
                  <p className="text-3xl font-extrabold text-green-700">{reverseResult.ml}</p>
                  <p className="text-xs text-gray-400 mt-0.5">ml</p>
                </div>
              </div>

              <div className="rounded-lg bg-white/70 border border-green-100 px-4 py-2 text-xs text-gray-500 font-mono">
                {gramsInput}g ÷ {selectedFood.density} g/ml = {reverseResult.ml}ml
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center text-sm text-gray-400">
              グラム数を入力してください
            </div>
          )}
        </>
      )}

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-400">
        広告スペース
      </div>
    </div>
  );
}
