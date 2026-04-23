"use client";

import { useState } from "react";

// Conversion data: ingredient -> gram per tablespoon (大さじ1=15ml)
// 小さじ1=5ml, 1カップ=200ml
// All values in g/ml ratio
const INGREDIENTS: { label: string; gPerMl: number; category: string }[] = [
  { label: "水", gPerMl: 1.0, category: "液体" },
  { label: "牛乳", gPerMl: 1.03, category: "液体" },
  { label: "醤油", gPerMl: 1.2, category: "液体" },
  { label: "みりん", gPerMl: 1.2, category: "液体" },
  { label: "酒", gPerMl: 1.0, category: "液体" },
  { label: "酢", gPerMl: 1.0, category: "液体" },
  { label: "サラダ油", gPerMl: 0.9, category: "液体" },
  { label: "ごま油", gPerMl: 0.9, category: "液体" },
  { label: "はちみつ", gPerMl: 1.4, category: "液体" },
  { label: "砂糖（上白糖）", gPerMl: 0.6, category: "粉類" },
  { label: "砂糖（グラニュー糖）", gPerMl: 0.8, category: "粉類" },
  { label: "塩", gPerMl: 1.2, category: "粉類" },
  { label: "小麦粉（薄力粉）", gPerMl: 0.5, category: "粉類" },
  { label: "片栗粉", gPerMl: 0.6, category: "粉類" },
  { label: "ベーキングパウダー", gPerMl: 0.5, category: "粉類" },
  { label: "味噌", gPerMl: 1.1, category: "ペースト" },
  { label: "バター", gPerMl: 0.9, category: "ペースト" },
  { label: "マヨネーズ", gPerMl: 0.9, category: "ペースト" },
  { label: "ケチャップ", gPerMl: 1.1, category: "ペースト" },
];

const UNITS = [
  { label: "大さじ1", ml: 15 },
  { label: "大さじ2", ml: 30 },
  { label: "大さじ3", ml: 45 },
  { label: "小さじ1", ml: 5 },
  { label: "小さじ2", ml: 10 },
  { label: "小さじ1/2", ml: 2.5 },
  { label: "1カップ", ml: 200 },
  { label: "1/2カップ", ml: 100 },
  { label: "1/4カップ", ml: 50 },
];

export default function MeasuringConverter() {
  const [ingredient, setIngredient] = useState(INGREDIENTS[0]);
  const [inputType, setInputType] = useState<"volume" | "gram">("volume");
  const [value, setValue] = useState("");
  const [volumeUnit, setVolumeUnit] = useState(UNITS[0]);

  const num = parseFloat(value);
  const valid = !isNaN(num) && num > 0;

  // Results
  const grams = valid
    ? inputType === "volume"
      ? num * ingredient.gPerMl
      : num
    : null;

  const ml = valid
    ? inputType === "gram"
      ? num / ingredient.gPerMl
      : num
    : null;

  // Unit breakdown
  const unitBreakdown = ml !== null
    ? UNITS.map((u) => ({ ...u, count: ml / u.ml }))
    : [];

  return (
    <div className="space-y-5">
      {/* Ingredient selector */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-3">食材を選択</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {INGREDIENTS.map((ing) => (
            <button
              key={ing.label}
              onClick={() => setIngredient(ing)}
              className={`text-left px-3 py-2 border rounded-lg text-sm transition-colors ${
                ingredient.label === ing.label
                  ? "bg-primary text-white border-primary"
                  : "bg-accent border-border text-foreground hover:border-primary/50"
              }`}
            >
              <span className="block font-medium truncate">{ing.label}</span>
              <span className={`text-xs ${ingredient.label === ing.label ? "text-white/70" : "text-muted"}`}>{ing.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setInputType("volume")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              inputType === "volume" ? "bg-primary text-white" : "bg-accent text-muted hover:text-foreground"
            }`}
          >
            容量 → グラム
          </button>
          <button
            onClick={() => setInputType("gram")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              inputType === "gram" ? "bg-primary text-white" : "bg-accent text-muted hover:text-foreground"
            }`}
          >
            グラム → 容量
          </button>
        </div>

        {inputType === "volume" ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {UNITS.map((u) => (
                <button
                  key={u.label}
                  onClick={() => { setVolumeUnit(u); setValue("1"); }}
                  className={`py-2 px-2 border rounded-lg text-xs font-medium transition-colors ${
                    volumeUnit.label === u.label && value === "1"
                      ? "bg-primary text-white border-primary"
                      : "bg-accent border-border hover:border-primary/50"
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                placeholder="数量"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-24 px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
              />
              <span className="text-sm text-muted">{volumeUnit.label}</span>
              <span className="text-xs text-muted">= {valid ? (num * volumeUnit.ml).toFixed(1) : "—"} ml</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              placeholder="例: 100"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-32 px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
            />
            <span className="text-sm text-muted">g</span>
          </div>
        )}
      </div>

      {/* Result */}
      {valid && grams !== null && ml !== null && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
              <p className="text-xs text-muted mb-1">{ingredient.label} のグラム数</p>
              <p className="text-2xl font-bold font-mono text-primary">{grams.toFixed(1)}g</p>
            </div>
            <div className="bg-accent border border-border rounded-xl p-4">
              <p className="text-xs text-muted mb-1">容量（ml）</p>
              <p className="text-2xl font-bold font-mono text-foreground">{ml.toFixed(1)}ml</p>
            </div>
          </div>

          {/* Unit breakdown */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-sm mb-3">計量スプーン・カップ換算</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {unitBreakdown.map((u) => (
                <div key={u.label} className="bg-accent border border-border rounded-lg p-3">
                  <p className="text-xs text-muted">{u.label}</p>
                  <p className="font-mono font-bold text-foreground">{u.count.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
