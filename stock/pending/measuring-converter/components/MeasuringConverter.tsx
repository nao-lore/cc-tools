"use client";

import { useState, useMemo } from "react";

type Lang = "ja" | "en";

interface FoodItem {
  name: string;
  nameEn: string;
  density: number;
}

const FOOD_ITEMS: FoodItem[] = [
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
  { name: "上白糖", nameEn: "white sugar (JP)", density: 0.60 },
  { name: "グラニュー糖", nameEn: "granulated sugar", density: 0.80 },
  { name: "粉砂糖", nameEn: "powdered sugar", density: 0.53 },
  { name: "三温糖", nameEn: "soft brown sugar", density: 0.60 },
  { name: "黒砂糖（粉末）", nameEn: "brown sugar (powder)", density: 0.73 },
  { name: "はちみつ", nameEn: "honey", density: 1.43 },
  { name: "メープルシロップ", nameEn: "maple syrup", density: 1.33 },
  { name: "みりん", nameEn: "mirin", density: 1.20 },
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
  { name: "サラダ油（植物油）", nameEn: "vegetable oil", density: 0.91 },
  { name: "オリーブオイル", nameEn: "olive oil", density: 0.91 },
  { name: "ごま油", nameEn: "sesame oil", density: 0.91 },
  { name: "バター（有塩）", nameEn: "butter (salted)", density: 0.94 },
  { name: "バター（無塩）", nameEn: "butter (unsalted)", density: 0.94 },
  { name: "ラード", nameEn: "lard", density: 0.87 },
  { name: "牛乳", nameEn: "milk", density: 1.03 },
  { name: "豆乳（無調整）", nameEn: "soy milk (unsweetened)", density: 1.03 },
  { name: "生クリーム（36%）", nameEn: "heavy cream (36%)", density: 1.01 },
  { name: "ヨーグルト（プレーン）", nameEn: "plain yogurt", density: 1.04 },
  { name: "練乳（加糖）", nameEn: "condensed milk", density: 1.33 },
  { name: "水", nameEn: "water", density: 1.00 },
  { name: "酒（料理酒）", nameEn: "cooking sake", density: 1.00 },
  { name: "カレー粉", nameEn: "curry powder", density: 0.53 },
  { name: "胡椒（粉）", nameEn: "black pepper (ground)", density: 0.53 },
  { name: "シナモン（粉）", nameEn: "cinnamon (ground)", density: 0.53 },
  { name: "顆粒だし（和風）", nameEn: "dashi granules", density: 0.60 },
  { name: "鶏ガラスープの素", nameEn: "chicken bouillon powder", density: 0.60 },
  { name: "コンソメ（顆粒）", nameEn: "consommé (granules)", density: 0.60 },
];

const MEASURES = [
  { labelJa: "小さじ（5ml）", labelEn: "Tsp (5ml)", shortJa: "小さじ", shortEn: "Tsp", ml: 5 },
  { labelJa: "大さじ（15ml）", labelEn: "Tbsp (15ml)", shortJa: "大さじ", shortEn: "Tbsp", ml: 15 },
  { labelJa: "カップ（200ml）", labelEn: "Cup (200ml)", shortJa: "カップ", shortEn: "Cup", ml: 200 },
];

const T = {
  ja: {
    forwardMode: "大さじ → g",
    reverseMode: "g → 大さじ",
    selectFood: "食材を選ぶ",
    searchPlaceholder: "食材名で検索（例: 小麦粉、砂糖）",
    notFound: "見つかりません",
    density: "密度",
    measureUnit: "計量単位と量",
    amount: "量",
    resultLabel: "換算結果",
    grams: "g",
    enterAmount: "量を入力してください",
    gramsInput: "グラム数を入力",
    enterGrams: "グラム数を入力してください",
    cups: "杯",
  },
  en: {
    forwardMode: "Spoon → g",
    reverseMode: "g → Spoon",
    selectFood: "Select Ingredient",
    searchPlaceholder: "Search (e.g. flour, sugar)",
    notFound: "Not found",
    density: "Density",
    measureUnit: "Measure & Amount",
    amount: "Amount",
    resultLabel: "Result",
    grams: "g",
    enterAmount: "Enter an amount above",
    gramsInput: "Enter Grams",
    enterGrams: "Enter a gram value above",
    cups: "cups",
  },
} as const;

type Mode = "forward" | "reverse";

export default function MeasuringConverter() {
  const [lang, setLang] = useState<Lang>("ja");
  const [mode, setMode] = useState<Mode>("forward");
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem>(FOOD_ITEMS[0]);
  const [measureIdx, setMeasureIdx] = useState(1);
  const [amount, setAmount] = useState("1");
  const [gramsInput, setGramsInput] = useState("100");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const t = T[lang];

  const filteredFoods = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return FOOD_ITEMS;
    return FOOD_ITEMS.filter(
      (f) => f.name.includes(q) || f.nameEn.toLowerCase().includes(q)
    );
  }, [search]);

  const measure = MEASURES[measureIdx];

  const forwardResult = useMemo(() => {
    const qty = parseFloat(amount);
    if (isNaN(qty) || qty <= 0) return null;
    const totalMl = qty * measure.ml;
    const grams = totalMl * selectedFood.density;
    return { grams: Math.round(grams * 10) / 10, totalMl };
  }, [amount, measure, selectedFood]);

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
    <div className="space-y-5">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1); }
          50% { box-shadow: 0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(139,92,246,0.2); }
        }
        @keyframes float-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes border-spin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .glass-card-bright {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .neon-focus:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(167,139,250,0.6), 0 0 20px rgba(167,139,250,0.2);
        }
        .glow-text {
          text-shadow: 0 0 30px rgba(196,181,253,0.6);
        }
        .result-card-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .float-in {
          animation: float-in 0.25s ease-out;
        }
        .gradient-border-box {
          position: relative;
        }
        .gradient-border-box::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(139,92,246,0.6), rgba(6,182,212,0.4), rgba(139,92,246,0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .number-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2d9f3;
        }
        .number-input::placeholder { color: rgba(196,181,253,0.4); }
        .number-input::-webkit-inner-spin-button,
        .number-input::-webkit-outer-spin-button { opacity: 0.3; }
        .preset-active {
          background: rgba(139,92,246,0.25);
          border-color: rgba(167,139,250,0.6);
          color: #c4b5fd;
          box-shadow: 0 0 10px rgba(139,92,246,0.3);
        }
        .dropdown-glass {
          background: rgba(15,10,26,0.95);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
        }
      `}</style>

      {/* Language toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* Mode toggle */}
      <div className="glass-card rounded-xl overflow-hidden flex">
        <button
          onClick={() => setMode("forward")}
          className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
            mode === "forward"
              ? "bg-violet-600 text-white"
              : "text-violet-200 hover:text-white hover:bg-white/5"
          }`}
        >
          {t.forwardMode}
        </button>
        <button
          onClick={() => setMode("reverse")}
          className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
            mode === "reverse"
              ? "bg-violet-600 text-white"
              : "text-violet-200 hover:text-white hover:bg-white/5"
          }`}
        >
          {t.reverseMode}
        </button>
      </div>

      {/* Food selector */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-xs font-semibold text-violet-100 uppercase tracking-widest">{t.selectFood}</h2>

        <div className="relative">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={dropdownOpen ? search : (lang === "ja" ? selectedFood.name : selectedFood.nameEn)}
            onFocus={() => {
              setSearch("");
              setDropdownOpen(true);
            }}
            onChange={(e) => {
              setSearch(e.target.value);
              setDropdownOpen(true);
            }}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            className="number-input w-full rounded-xl px-4 py-2.5 neon-focus transition-all"
          />
          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-full dropdown-glass rounded-xl shadow-2xl max-h-64 overflow-y-auto">
              {filteredFoods.length === 0 ? (
                <div className="px-4 py-3 text-sm text-violet-200/60">{t.notFound}</div>
              ) : (
                filteredFoods.map((food) => (
                  <button
                    key={food.name}
                    onMouseDown={() => handleSelectFood(food)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-violet-500/20 transition-colors ${
                      food.name === selectedFood.name ? "bg-violet-500/20 text-violet-100 font-medium" : "text-white/90"
                    }`}
                  >
                    {lang === "ja" ? food.name : food.nameEn}
                    <span className="text-xs text-violet-200/60 ml-2">{lang === "ja" ? food.nameEn : food.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="text-xs text-violet-200/60 font-mono">
          {t.density}: {selectedFood.density} g/ml
        </div>
      </div>

      {/* Forward mode */}
      {mode === "forward" && (
        <>
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <h2 className="text-xs font-semibold text-violet-100 uppercase tracking-widest">{t.measureUnit}</h2>

            <div className="flex gap-2">
              {MEASURES.map((m, i) => (
                <button
                  key={m.labelJa}
                  onClick={() => setMeasureIdx(i)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                    measureIdx === i
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "border-white/10 text-violet-100 hover:border-violet-500/40 hover:text-white"
                  }`}
                >
                  {lang === "ja" ? m.shortJa : m.shortEn}
                  <span className="block text-xs opacity-60">{m.ml}ml</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.amount}</label>
              <div className="flex gap-2 flex-wrap">
                {["0.5", "1", "2", "3"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(v)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150 font-mono ${
                      amount === v
                        ? "preset-active"
                        : "border-white/10 text-violet-100 hover:border-violet-500/40"
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
                  className="number-input flex-1 min-w-0 rounded-lg px-3 py-1.5 text-sm font-mono neon-focus"
                  placeholder="値を入力"
                />
              </div>
            </div>
          </div>

          {forwardResult ? (
            <div className="gradient-border-box glass-card-bright rounded-2xl p-6 space-y-4 result-card-glow float-in">
              <p className="text-xs font-semibold text-violet-100 uppercase tracking-widest">{t.resultLabel}</p>
              <div className="flex items-end gap-3">
                <p className="text-6xl font-extrabold text-white glow-text font-mono">{forwardResult.grams}</p>
                <p className="text-2xl font-bold text-violet-200 mb-1">{t.grams}</p>
              </div>
              <p className="text-sm text-violet-200">
                {lang === "ja" ? selectedFood.name : selectedFood.nameEn}{" "}
                {amount}{lang === "ja" ? measure.shortJa : measure.shortEn} ({forwardResult.totalMl}ml)
              </p>
              <div className="glass-card rounded-xl px-4 py-2 text-xs text-violet-200 font-mono">
                {forwardResult.totalMl}ml × {selectedFood.density} g/ml = {forwardResult.grams} g
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2">
                {MEASURES.map((m) => {
                  const g = Math.round(parseFloat(amount) * m.ml * selectedFood.density * 10) / 10;
                  if (isNaN(g)) return null;
                  return (
                    <div key={m.labelJa} className="glass-card rounded-xl p-3 text-center">
                      <p className="text-xs text-violet-200">{lang === "ja" ? m.shortJa : m.shortEn} {amount}</p>
                      <p className="text-lg font-bold text-white font-mono">{g}g</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl px-5 py-8 text-center text-sm text-violet-200/60">
              {t.enterAmount}
            </div>
          )}
        </>
      )}

      {/* Reverse mode */}
      {mode === "reverse" && (
        <>
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-semibold text-violet-100 uppercase tracking-widest">{t.gramsInput}</h2>
            <div>
              <div className="flex gap-2 mb-3 flex-wrap">
                {["50", "100", "200", "500"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setGramsInput(v)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all font-mono ${
                      gramsInput === v
                        ? "preset-active"
                        : "border-white/10 text-violet-100 hover:border-violet-500/40"
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
                  className="number-input w-full rounded-xl px-4 py-2.5 pr-12 font-mono neon-focus"
                  placeholder="例: 100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-violet-200 font-medium pointer-events-none">g</span>
              </div>
            </div>
          </div>

          {reverseResult ? (
            <div className="gradient-border-box glass-card-bright rounded-2xl p-6 space-y-4 result-card-glow float-in">
              <p className="text-xs font-semibold text-violet-100 uppercase tracking-widest">{t.resultLabel}</p>
              <p className="text-sm text-violet-100">
                {lang === "ja" ? selectedFood.name : selectedFood.nameEn} {gramsInput}g
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { labelJa: "小さじ", labelEn: "Tsp", val: reverseResult.小さじ },
                  { labelJa: "大さじ", labelEn: "Tbsp", val: reverseResult.大さじ },
                  { labelJa: "カップ", labelEn: "Cup", val: reverseResult.カップ },
                  { labelJa: "ml", labelEn: "ml", val: reverseResult.ml },
                ].map((item) => (
                  <div key={item.labelJa} className="glass-card rounded-xl p-4 text-center">
                    <p className="text-xs text-violet-200 mb-1">{lang === "ja" ? item.labelJa : item.labelEn}</p>
                    <p className="text-3xl font-extrabold text-white font-mono">{item.val}</p>
                    <p className="text-xs text-violet-200 mt-0.5">
                      {item.labelJa === "ml" ? "ml" : lang === "ja" ? "杯" : t.cups}
                    </p>
                  </div>
                ))}
              </div>

              <div className="glass-card rounded-xl px-4 py-2 text-xs text-violet-200 font-mono">
                {gramsInput}g ÷ {selectedFood.density} g/ml = {reverseResult.ml}ml
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl px-5 py-8 text-center text-sm text-violet-200/60">
              {t.enterGrams}
            </div>
          )}
        </>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "計量変換（大さじ・カップ→g）",
  "description": "食材別の正確な重量換算（小麦粉、砂糖、塩、油など100種）",
  "url": "https://tools.loresync.dev/measuring-converter",
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
