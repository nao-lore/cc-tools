"use client";

import { useMemo, useState } from "react";

type Direction = "volume-to-gram" | "gram-to-volume";

type Ingredient = {
  id: string;
  label: string;
  category: string;
  gramsPerMl: number;
  note: string;
};

type Unit = {
  id: string;
  label: string;
  ml: number;
};

const INGREDIENTS: Ingredient[] = [
  { id: "water", label: "水", category: "液体", gramsPerMl: 1.0, note: "大さじ1 約15g" },
  { id: "milk", label: "牛乳", category: "液体", gramsPerMl: 1.03, note: "水より少し重い" },
  { id: "soy-sauce", label: "醤油", category: "液体", gramsPerMl: 1.2, note: "大さじ1 約18g" },
  { id: "mirin", label: "みりん", category: "液体", gramsPerMl: 1.2, note: "大さじ1 約18g" },
  { id: "sake", label: "料理酒", category: "液体", gramsPerMl: 1.0, note: "大さじ1 約15g" },
  { id: "vinegar", label: "酢", category: "液体", gramsPerMl: 1.0, note: "大さじ1 約15g" },
  { id: "oil", label: "サラダ油", category: "油脂", gramsPerMl: 0.9, note: "大さじ1 約14g" },
  { id: "sesame-oil", label: "ごま油", category: "油脂", gramsPerMl: 0.9, note: "大さじ1 約14g" },
  { id: "honey", label: "はちみつ", category: "液体", gramsPerMl: 1.4, note: "大さじ1 約21g" },
  { id: "sugar-white", label: "砂糖（上白糖）", category: "粉類", gramsPerMl: 0.6, note: "大さじ1 約9g" },
  { id: "sugar-granulated", label: "グラニュー糖", category: "粉類", gramsPerMl: 0.8, note: "大さじ1 約12g" },
  { id: "salt", label: "塩", category: "粉類", gramsPerMl: 1.2, note: "大さじ1 約18g" },
  { id: "flour", label: "小麦粉（薄力粉）", category: "粉類", gramsPerMl: 0.5, note: "大さじ1 約8g" },
  { id: "starch", label: "片栗粉", category: "粉類", gramsPerMl: 0.6, note: "大さじ1 約9g" },
  { id: "baking-powder", label: "ベーキングパウダー", category: "粉類", gramsPerMl: 0.5, note: "大さじ1 約8g" },
  { id: "miso", label: "味噌", category: "ペースト", gramsPerMl: 1.1, note: "大さじ1 約17g" },
  { id: "butter", label: "バター", category: "油脂", gramsPerMl: 0.9, note: "大さじ1 約14g" },
  { id: "mayonnaise", label: "マヨネーズ", category: "ペースト", gramsPerMl: 0.9, note: "大さじ1 約14g" },
  { id: "ketchup", label: "ケチャップ", category: "ペースト", gramsPerMl: 1.1, note: "大さじ1 約17g" },
];

const UNITS: Unit[] = [
  { id: "tsp-half", label: "小さじ1/2", ml: 2.5 },
  { id: "tsp", label: "小さじ1", ml: 5 },
  { id: "tbsp-half", label: "大さじ1/2", ml: 7.5 },
  { id: "tbsp", label: "大さじ1", ml: 15 },
  { id: "tbsp-two", label: "大さじ2", ml: 30 },
  { id: "quarter-cup", label: "1/4カップ", ml: 50 },
  { id: "half-cup", label: "1/2カップ", ml: 100 },
  { id: "cup", label: "1カップ", ml: 200 },
];

const PRESETS = [
  { label: "醤油 大さじ1", ingredientId: "soy-sauce", unitId: "tbsp", value: "1", direction: "volume-to-gram" as const },
  { label: "薄力粉 100g", ingredientId: "flour", unitId: "tbsp", value: "100", direction: "gram-to-volume" as const },
  { label: "砂糖 1/2カップ", ingredientId: "sugar-white", unitId: "half-cup", value: "1", direction: "volume-to-gram" as const },
  { label: "塩 小さじ1", ingredientId: "salt", unitId: "tsp", value: "1", direction: "volume-to-gram" as const },
];

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function round(value: number, digits = 1) {
  return value.toLocaleString("ja-JP", { maximumFractionDigits: digits, minimumFractionDigits: value % 1 === 0 ? 0 : digits });
}

function buildCsv({
  ingredient,
  grams,
  ml,
}: {
  ingredient: Ingredient;
  grams: number;
  ml: number;
}) {
  const rows = [
    ["ingredient", "grams", "ml", "teaspoons", "tablespoons", "cups"],
    [ingredient.label, grams.toFixed(1), ml.toFixed(1), (ml / 5).toFixed(2), (ml / 15).toFixed(2), (ml / 200).toFixed(2)],
  ];
  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadCsv(text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "measuring-converter.csv";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export default function MeasuringConverter() {
  const [ingredientId, setIngredientId] = useState("soy-sauce");
  const [direction, setDirection] = useState<Direction>("volume-to-gram");
  const [unitId, setUnitId] = useState("tbsp");
  const [value, setValue] = useState("1");
  const [copied, setCopied] = useState(false);

  const ingredient = INGREDIENTS.find((item) => item.id === ingredientId) ?? INGREDIENTS[0];
  const unit = UNITS.find((item) => item.id === unitId) ?? UNITS[3];
  const amount = parseNumber(value);
  const inputMl = direction === "volume-to-gram" ? amount * unit.ml : amount / ingredient.gramsPerMl;
  const inputGrams = direction === "volume-to-gram" ? inputMl * ingredient.gramsPerMl : amount;
  const valid = amount > 0;

  const categories = useMemo(() => Array.from(new Set(INGREDIENTS.map((item) => item.category))), []);
  const unitBreakdown = [
    { label: "小さじ", value: inputMl / 5 },
    { label: "大さじ", value: inputMl / 15 },
    { label: "カップ", value: inputMl / 200 },
  ];

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setIngredientId(preset.ingredientId);
    setUnitId(preset.unitId);
    setDirection(preset.direction);
    setValue(preset.value);
    setCopied(false);
  }

  function reset() {
    setIngredientId("soy-sauce");
    setDirection("volume-to-gram");
    setUnitId("tbsp");
    setValue("1");
    setCopied(false);
  }

  async function copyResult() {
    const lines = [
      `食材: ${ingredient.label}`,
      `グラム: ${round(inputGrams)}g`,
      `容量: ${round(inputMl)}ml`,
      `小さじ: ${round(inputMl / 5, 2)}杯`,
      `大さじ: ${round(inputMl / 15, 2)}杯`,
      `カップ: ${round(inputMl / 200, 2)}杯`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">換算条件</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">食材ごとの重さの目安で、容量とグラムを相互換算します。</p>
            </div>
            <button type="button" onClick={reset} className="w-fit rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              クリア
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            {[
              { value: "volume-to-gram" as const, label: "容量 → g" },
              { value: "gram-to-volume" as const, label: "g → 容量" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setDirection(item.value)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${direction === item.value ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium text-slate-700">食材</p>
            <div className="mt-2 space-y-3">
              {categories.map((category) => (
                <div key={category}>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{category}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {INGREDIENTS.filter((item) => item.category === category).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setIngredientId(item.id)}
                        className={`rounded-xl border px-3 py-2 text-left text-sm ${ingredientId === item.id ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}
                      >
                        <span className="block truncate font-semibold">{item.label}</span>
                        <span className={`block truncate text-xs ${ingredientId === item.id ? "text-white/70" : "text-slate-500"}`}>{item.note}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {direction === "volume-to-gram" && (
              <div>
                <p className="text-sm font-medium text-slate-700">計量単位</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {UNITS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setUnitId(item.id)}
                      className={`rounded-xl border px-2 py-2 text-sm font-semibold ${unitId === item.id ? "border-emerald-700 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-700 hover:border-slate-400"}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="measuring-value">
              {direction === "volume-to-gram" ? "数量" : "グラム数"}
              <div className="flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
                <input
                  id="measuring-value"
                  type="text"
                  inputMode="decimal"
                  value={value}
                  onChange={(event) => setValue(event.target.value.replace(/[^0-9.]/g, ""))}
                  className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
                />
                <span className="flex min-w-20 items-center justify-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                  {direction === "volume-to-gram" ? unit.label : "g"}
                </span>
              </div>
            </label>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button key={preset.label} type="button" onClick={() => applyPreset(preset)} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50">
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <p className={`min-h-5 text-sm ${valid ? "text-slate-500" : "text-red-600"}`}>
              {valid ? "家庭用の計量目安です。粉の詰め方、粒度、メーカー、温度で実際の重量は変わります。" : "入力エラー: 数量を入力してください。"}
            </p>
          </div>
        </div>

        <div className="min-w-0 p-5 sm:p-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            <p className="text-sm font-medium opacity-80">{ingredient.label}</p>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <p className="font-mono text-4xl font-bold">{valid ? round(inputGrams) : "-"}g</p>
              <p className="text-sm font-semibold">{valid ? `${round(inputMl)}ml` : "容量 -"}</p>
            </div>
            <p className="mt-2 text-sm opacity-80">
              {direction === "volume-to-gram" ? `${round(amount)}${unit.label} = ${round(inputMl)}ml として換算。` : `${round(amount)}g を ${ingredient.label} の容量に逆換算。`}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {unitBreakdown.map((item) => (
              <ResultCard key={item.label} label={item.label} value={`${valid ? round(item.value, 2) : "-"}杯`} note={item.label === "カップ" ? "1カップ=200ml" : item.label === "大さじ" ? "大さじ1=15ml" : "小さじ1=5ml"} />
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} disabled={!valid} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300">
              {copied ? "コピー済み" : "結果をコピー"}
            </button>
            <button type="button" onClick={() => downloadCsv(buildCsv({ ingredient, grams: inputGrams, ml: inputMl }))} disabled={!valid} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300">
              CSVダウンロード
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-semibold text-slate-950">よく使う換算表</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs text-slate-500">
                    <th className="border border-slate-200 px-3 py-2">単位</th>
                    <th className="border border-slate-200 px-3 py-2">ml</th>
                    <th className="border border-slate-200 px-3 py-2">グラム</th>
                  </tr>
                </thead>
                <tbody>
                  {UNITS.map((item) => (
                    <tr key={item.id} className="even:bg-slate-50">
                      <td className="border border-slate-200 px-3 py-2 font-semibold">{item.label}</td>
                      <td className="border border-slate-200 px-3 py-2 text-right">{round(item.ml)}ml</td>
                      <td className="border border-slate-200 px-3 py-2 text-right">{round(item.ml * ingredient.gramsPerMl)}g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-500">{ingredient.label} は {ingredient.note} の目安で換算しています。</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
    </div>
  );
}
