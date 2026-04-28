"use client";
import { useState, useCallback } from "react";

// ---- 単位定義 ----
type Unit =
  | "g" | "kg" | "ml" | "l"
  | "大さじ" | "小さじ" | "カップ"
  | "個" | "枚" | "本" | "切れ" | "袋" | "パック" | "適量";

const VOLUME_UNITS: Unit[] = ["大さじ", "小さじ", "カップ", "ml", "l"];
const WEIGHT_UNITS: Unit[] = ["g", "kg"];
const COUNT_UNITS: Unit[] = ["個", "枚", "本", "切れ", "袋", "パック", "適量"];
const ALL_UNITS: Unit[] = [...VOLUME_UNITS, ...WEIGHT_UNITS, ...COUNT_UNITS];

// ml換算（容量単位 → ml）
const TO_ML: Partial<Record<Unit, number>> = {
  大さじ: 15,
  小さじ: 5,
  カップ: 200,
  ml: 1,
  l: 1000,
};

// g換算（重量単位 → g）
const TO_G: Partial<Record<Unit, number>> = {
  g: 1,
  kg: 1000,
};

// ---- 食材密度データベース（g/カップ, g/大さじ）----
type DensityEntry = {
  gPerCup: number;
  gPerTbsp: number;
};

const DENSITY_DB: Record<string, DensityEntry> = {
  "小麦粉": { gPerCup: 110, gPerTbsp: 8 },
  "薄力粉": { gPerCup: 110, gPerTbsp: 8 },
  "強力粉": { gPerCup: 130, gPerTbsp: 10 },
  "片栗粉": { gPerCup: 130, gPerTbsp: 9 },
  "米粉": { gPerCup: 130, gPerTbsp: 9 },
  "ベーキングパウダー": { gPerCup: 230, gPerTbsp: 14 },
  "重曹": { gPerCup: 230, gPerTbsp: 14 },
  "ココアパウダー": { gPerCup: 100, gPerTbsp: 7 },
  "抹茶": { gPerCup: 100, gPerTbsp: 6 },
  "砂糖": { gPerCup: 130, gPerTbsp: 9 },
  "上白糖": { gPerCup: 130, gPerTbsp: 9 },
  "グラニュー糖": { gPerCup: 180, gPerTbsp: 12 },
  "粉砂糖": { gPerCup: 110, gPerTbsp: 7 },
  "三温糖": { gPerCup: 130, gPerTbsp: 9 },
  "はちみつ": { gPerCup: 290, gPerTbsp: 21 },
  "メープルシロップ": { gPerCup: 260, gPerTbsp: 19 },
  "塩": { gPerCup: 180, gPerTbsp: 15 },
  "醤油": { gPerCup: 230, gPerTbsp: 18 },
  "みりん": { gPerCup: 230, gPerTbsp: 17 },
  "酒": { gPerCup: 200, gPerTbsp: 15 },
  "酢": { gPerCup: 200, gPerTbsp: 15 },
  "みそ": { gPerCup: 230, gPerTbsp: 18 },
  "ケチャップ": { gPerCup: 270, gPerTbsp: 18 },
  "マヨネーズ": { gPerCup: 220, gPerTbsp: 14 },
  "ソース": { gPerCup: 240, gPerTbsp: 17 },
  "オイスターソース": { gPerCup: 280, gPerTbsp: 18 },
  "ポン酢": { gPerCup: 230, gPerTbsp: 17 },
  "バター": { gPerCup: 220, gPerTbsp: 13 },
  "マーガリン": { gPerCup: 215, gPerTbsp: 13 },
  "サラダ油": { gPerCup: 180, gPerTbsp: 13 },
  "オリーブオイル": { gPerCup: 185, gPerTbsp: 14 },
  "ごま油": { gPerCup: 185, gPerTbsp: 14 },
  "牛乳": { gPerCup: 210, gPerTbsp: 16 },
  "生クリーム": { gPerCup: 210, gPerTbsp: 16 },
  "豆乳": { gPerCup: 205, gPerTbsp: 15 },
  "水": { gPerCup: 200, gPerTbsp: 15 },
  "だし": { gPerCup: 200, gPerTbsp: 15 },
  "ブロス": { gPerCup: 200, gPerTbsp: 15 },
};

// ---- プリセットレシピ ----
type Ingredient = {
  id: string;
  name: string;
  amount: string;
  unit: Unit;
};

type Preset = {
  name: string;
  nameEn: string;
  servings: number;
  ingredients: Omit<Ingredient, "id">[];
};

const PRESETS: Preset[] = [
  {
    name: "カレー",
    nameEn: "Curry",
    servings: 4,
    ingredients: [
      { name: "牛肉（豚肉）", amount: "400", unit: "g" },
      { name: "玉ねぎ", amount: "2", unit: "個" },
      { name: "じゃがいも", amount: "3", unit: "個" },
      { name: "にんじん", amount: "1", unit: "本" },
      { name: "カレールー", amount: "1", unit: "袋" },
      { name: "水", amount: "1", unit: "l" },
      { name: "サラダ油", amount: "大さじ1", unit: "大さじ" },
    ],
  },
  {
    name: "ハンバーグ",
    nameEn: "Hamburg",
    servings: 2,
    ingredients: [
      { name: "合いびき肉", amount: "300", unit: "g" },
      { name: "玉ねぎ", amount: "1", unit: "個" },
      { name: "卵", amount: "1", unit: "個" },
      { name: "パン粉", amount: "4", unit: "大さじ" },
      { name: "牛乳", amount: "2", unit: "大さじ" },
      { name: "塩", amount: "小さじ1/2", unit: "小さじ" },
      { name: "こしょう", amount: "適量", unit: "適量" },
    ],
  },
  {
    name: "パンケーキ",
    nameEn: "Pancakes",
    servings: 2,
    ingredients: [
      { name: "薄力粉", amount: "150", unit: "g" },
      { name: "ベーキングパウダー", amount: "小さじ2", unit: "小さじ" },
      { name: "砂糖", amount: "大さじ2", unit: "大さじ" },
      { name: "塩", amount: "ひとつまみ", unit: "適量" },
      { name: "卵", amount: "1", unit: "個" },
      { name: "牛乳", amount: "180", unit: "ml" },
      { name: "バター", amount: "20", unit: "g" },
    ],
  },
  {
    name: "唐揚げ",
    nameEn: "Karaage",
    servings: 2,
    ingredients: [
      { name: "鶏もも肉", amount: "400", unit: "g" },
      { name: "醤油", amount: "大さじ2", unit: "大さじ" },
      { name: "酒", amount: "大さじ2", unit: "大さじ" },
      { name: "おろしにんにく", amount: "小さじ1", unit: "小さじ" },
      { name: "おろし生姜", amount: "小さじ1", unit: "小さじ" },
      { name: "片栗粉", amount: "大さじ4", unit: "大さじ" },
      { name: "サラダ油", amount: "適量", unit: "適量" },
    ],
  },
];

// ---- 翻訳定数 ----
type Lang = "ja" | "en";

const T = {
  ja: {
    presetTitle: "プリセットレシピ",
    clear: "クリア",
    servingsTitle: "人数設定",
    originalServings: "元の人数",
    targetServings: "目標人数",
    scaleRatio: "スケール倍率",
    servingsUnit: "人前",
    ingredientsTitle: (n: number) => `材料（${n}人前）`,
    count: (n: number) => `${n}件`,
    scaledTitle: (n: number) => `スケール後（${n}人前）`,
    ingredientName: "材料名",
    amount: "量",
    addIngredient: "+ 材料を追加",
    copy: "コピー",
    copied: "コピー済み",
    emptyState: "材料名と量を入力すると表示されます",
    conversionTitle: "計量換算早見表",
    showDensity: "食材別グラム数を表示",
    showBasic: "基本換算を表示",
    unitCol: "単位",
    mlCol: "ml",
    tbspCol: "大さじ",
    tspCol: "小さじ",
    ingredientCol: "食材",
    tbsp1Col: "大さじ1",
    tsp1Col: "小さじ1",
    cup1Col: "カップ1",
    densityFooter: (n: number) => `全${n}食材のデータ収録`,
    footerNote: "※ 食材の密度は目安値です。実際の量は食材の状態によって異なります。",
    guideTitle: "使い方ガイド",
    guide: [
      { step: "1", title: "プリセットを選ぶかクリア", desc: "カレー・ハンバーグ・パンケーキ・唐揚げのプリセットを選ぶと材料が自動入力されます。自分のレシピを入力する場合は「クリア」から始めてください。" },
      { step: "2", title: "元の人数を設定", desc: "レシピに記載されている元の人数をスライダーまたは数値入力で設定します。0.5 人前単位で設定できます。" },
      { step: "3", title: "目標人数を設定", desc: "作りたい人数を設定します。倍率が自動計算され、材料の量がリアルタイムで更新されます。" },
      { step: "4", title: "結果をコピー", desc: "スケール後の材料一覧右上のコピーボタンを押すと、クリップボードにテキスト形式でコピーされます。メモアプリや買い物リストにそのまま貼り付け可能です。" },
    ],
    faqTitle: "よくある質問（FAQ）",
    faq: [
      {
        q: "レシピの人数を変えると材料の量はどう変わる？",
        a: "材料の量は人数の比率（倍率）に比例して変わります。例えば 2 人前を 6 人前にすると倍率は 3 倍になり、すべての材料が 3 倍の量に自動換算されます。大さじ・小さじは端数が自動で整理されます。",
      },
      {
        q: "大さじ・小さじの換算はどうすればいい？",
        a: "大さじ 1 = 小さじ 3 = 15ml です。カップ 1 = 200ml = 大さじ 13と1/3 です。このツールの計量換算早見表でも確認できます。スケール後の大さじに端数が出た場合は自動で「○と小さじ△」形式に変換されます。",
      },
      {
        q: "適量の材料はスケールできる？",
        a: "「適量」は分量が定まらないため、スケールしても「適量」のままとなります。塩こしょうなど加減が必要な調味料は味見しながら調整してください。",
      },
      {
        q: "1人前に換算したい場合は？",
        a: "元の人数を 2・目標を 1 に設定すると 1/2 倍の計算になります。0.5 人前単位での設定にも対応しています。",
      },
    ],
    relatedTitle: "関連ツール",
    relatedLinks: [
      { href: "/measuring-converter", title: "計量単位換算", desc: "g・ml・大さじ・カップなど料理で使う計量単位を相互換算。" },
      { href: "/oven-temp-converter", title: "オーブン温度換算", desc: "摂氏・華氏・ガス温度のオーブン設定を相互換算。" },
      { href: "/calorie-keisan", title: "カロリー計算", desc: "食材ごとのカロリーを計算して一食あたりの摂取量を把握。" },
    ],
    volumeOptgroup: "容量",
    weightOptgroup: "重量",
    countOptgroup: "個数・その他",
    deleteLabel: "削除",
  },
  en: {
    presetTitle: "Preset Recipes",
    clear: "Clear",
    servingsTitle: "Servings",
    originalServings: "Original Servings",
    targetServings: "Target Servings",
    scaleRatio: "Scale Ratio",
    servingsUnit: "servings",
    ingredientsTitle: (n: number) => `Ingredients (${n} servings)`,
    count: (n: number) => `${n} items`,
    scaledTitle: (n: number) => `Scaled Result (${n} servings)`,
    ingredientName: "Ingredient",
    amount: "Amount",
    addIngredient: "+ Add Ingredient",
    copy: "Copy",
    copied: "Copied!",
    emptyState: "Enter ingredient names and amounts to see results",
    conversionTitle: "Measurement Conversion",
    showDensity: "Show ingredient weights",
    showBasic: "Show basic conversion",
    unitCol: "Unit",
    mlCol: "ml",
    tbspCol: "Tbsp",
    tspCol: "Tsp",
    ingredientCol: "Ingredient",
    tbsp1Col: "1 Tbsp",
    tsp1Col: "1 Tsp",
    cup1Col: "1 Cup",
    densityFooter: (n: number) => `${n} ingredients in database`,
    footerNote: "* Ingredient density values are approximate. Actual amounts may vary by ingredient state.",
    guideTitle: "How to Use",
    guide: [
      { step: "1", title: "Select a preset or clear", desc: "Choose from Curry, Hamburg, Pancakes, or Karaage presets to auto-fill ingredients. Click 'Clear' to enter your own recipe." },
      { step: "2", title: "Set original servings", desc: "Set the number of servings as listed in the original recipe using the slider or number input. Supports 0.5-serving increments." },
      { step: "3", title: "Set target servings", desc: "Enter how many servings you want to make. The scale ratio is calculated automatically and ingredient amounts update in real time." },
      { step: "4", title: "Copy the result", desc: "Click the Copy button at the top right of the scaled result panel to copy all ingredients as plain text. Paste directly into a notes app or shopping list." },
    ],
    faqTitle: "FAQ",
    faq: [
      {
        q: "How do ingredient amounts change when I adjust servings?",
        a: "Amounts scale proportionally to the serving ratio. For example, scaling from 2 to 6 servings gives a 3x multiplier — all ingredients are tripled automatically. Fractional tablespoon amounts are formatted neatly.",
      },
      {
        q: "How do I convert between tablespoons and teaspoons?",
        a: "1 tablespoon = 3 teaspoons = 15ml. 1 cup = 200ml = 13⅓ tablespoons. The conversion table in this tool covers these and more. Fractional tablespoon results are auto-converted to 'X tbsp + Y tsp' format.",
      },
      {
        q: "Can 'to taste' ingredients be scaled?",
        a: "'To taste' (適量) amounts have no fixed quantity and remain as-is after scaling. Adjust salt, pepper and similar seasonings by tasting as you cook.",
      },
      {
        q: "How do I convert a recipe down to 1 serving?",
        a: "Set original servings to 2 and target to 1 for a 0.5x calculation. The tool supports 0.5-serving increments.",
      },
    ],
    relatedTitle: "Related Tools",
    relatedLinks: [
      { href: "/measuring-converter", title: "Measuring Unit Converter", desc: "Convert between g, ml, tbsp, cups, and more cooking units." },
      { href: "/oven-temp-converter", title: "Oven Temperature Converter", desc: "Convert between Celsius, Fahrenheit, and gas mark oven settings." },
      { href: "/calorie-keisan", title: "Calorie Calculator", desc: "Calculate calories per ingredient and track intake per meal." },
    ],
    volumeOptgroup: "Volume",
    weightOptgroup: "Weight",
    countOptgroup: "Count / Other",
    deleteLabel: "Delete",
  },
} as const;

// ---- ユーティリティ ----
let idCounter = 0;
const newId = () => `ing-${++idCounter}`;

const parseAmount = (amount: string): number | null => {
  const cleaned = amount.replace(/[^\d./]/g, "");
  if (!cleaned) return null;
  if (cleaned.includes("/")) {
    const [n, d] = cleaned.split("/").map(Number);
    return d !== 0 ? n / d : null;
  }
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
};

const formatAmount = (value: number, unit: Unit): string => {
  if (unit === "適量") return "適量";
  if (Number.isInteger(value)) return String(value);

  if (unit === "大さじ") {
    const whole = Math.floor(value);
    const frac = value - whole;
    const tspFrac = Math.round(frac * 3);
    if (tspFrac === 0) return String(whole);
    if (tspFrac === 3) return String(whole + 1);
    if (whole === 0) return `小さじ${tspFrac}`;
    return `${whole}と小さじ${tspFrac}`;
  }

  if (unit === "小さじ") {
    const quarters = Math.round(value * 4) / 4;
    if (quarters === 0.25) return "1/4";
    if (quarters === 0.5) return "1/2";
    if (quarters === 0.75) return "3/4";
    if (Number.isInteger(quarters)) return String(quarters);
    return quarters.toFixed(1);
  }

  if (unit === "カップ") {
    const quarters = Math.round(value * 4) / 4;
    if (quarters === 0.25) return "1/4";
    if (quarters === 0.5) return "1/2";
    if (quarters === 0.75) return "3/4";
    if (Number.isInteger(quarters)) return String(quarters);
    return quarters.toFixed(1);
  }

  if (value < 10) return value.toFixed(1);
  return Math.round(value).toString();
};

const scaleAmount = (amount: string, unit: Unit, ratio: number): string => {
  if (unit === "適量") return "適量";
  const num = parseAmount(amount);
  if (num === null) return amount;
  const scaled = num * ratio;
  return formatAmount(scaled, unit);
};

// ---- コンポーネント ----
export default function RecipeScaling() {
  const [lang, setLang] = useState<Lang>("ja");
  const t = T[lang];

  const [originalServings, setOriginalServings] = useState(2);
  const [targetServings, setTargetServings] = useState(4);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: newId(), name: "", amount: "", unit: "g" },
  ]);
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const ratio = originalServings > 0 ? targetServings / originalServings : 1;

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { id: newId(), name: "", amount: "", unit: "g" }]);
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const updateIngredient = (id: string, field: keyof Omit<Ingredient, "id">, value: string) => {
    setIngredients((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const loadPreset = (preset: Preset) => {
    setOriginalServings(preset.servings);
    setTargetServings(preset.servings);
    setIngredients(preset.ingredients.map((ing) => ({ ...ing, id: newId() })));
    setActivePreset(preset.name);
  };

  const copyResult = useCallback(() => {
    const lines = ingredients
      .filter((i) => i.name)
      .map((i) => {
        const scaled = scaleAmount(i.amount, i.unit, ratio);
        return `${i.name}　${scaled}${i.unit === "適量" ? "" : i.unit}`;
      })
      .join("\n");
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [ingredients, ratio]);

  const hasIngredients = ingredients.some((i) => i.name && i.amount);

  return (
    <div className="space-y-5">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1); }
          50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.2); }
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
        .tab-panel {
          animation: float-in 0.25s ease-out;
        }
        .result-card-glow {
          animation: pulse-glow 3s ease-in-out infinite;
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
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 2px;
          background: rgba(139,92,246,0.3);
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a78bfa, #818cf8);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(139,92,246,0.5), 0 2px 6px rgba(0,0,0,0.4);
          border: 2px solid rgba(255,255,255,0.2);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 16px rgba(139,92,246,0.7), 0 2px 8px rgba(0,0,0,0.5);
        }
        .table-row-stripe:hover {
          background: rgba(139,92,246,0.08);
          transition: background 0.2s ease;
        }
        select.glass-select {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2d9f3;
        }
        select.glass-select option {
          background: #1a1030;
          color: #e2d9f3;
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

      {/* プリセット */}
      <div className="glass-card rounded-2xl p-5 tab-panel">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-3">{t.presetTitle}</h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => loadPreset(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                activePreset === p.name
                  ? "preset-active"
                  : "border-white/10 text-violet-100 hover:border-violet-500/40 hover:text-violet-200"
              }`}
            >
              {lang === "ja" ? p.name : p.nameEn}（{p.servings}{lang === "ja" ? "人前" : " svgs"}）
            </button>
          ))}
          <button
            onClick={() => {
              setIngredients([{ id: newId(), name: "", amount: "", unit: "g" }]);
              setOriginalServings(2);
              setTargetServings(4);
              setActivePreset(null);
            }}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-dashed border-white/20 text-violet-300 hover:border-violet-500/40 hover:text-violet-200 transition-all"
          >
            {t.clear}
          </button>
        </div>
      </div>

      {/* 人数設定 */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.servingsTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ServingsInput
            label={t.originalServings}
            value={originalServings}
            onChange={setOriginalServings}
            servingsUnit={t.servingsUnit}
          />
          <ServingsInput
            label={t.targetServings}
            value={targetServings}
            onChange={setTargetServings}
            servingsUnit={t.servingsUnit}
          />
        </div>

        {/* 倍率表示 */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="flex-1 h-px" style={{ background: "rgba(167,139,250,0.15)" }} />
          <div className="gradient-border-box glass-card-bright rounded-2xl px-5 py-2.5 text-center">
            <span className="text-xs text-violet-200 font-medium uppercase tracking-wider">{t.scaleRatio}</span>
            <div className="text-2xl font-extrabold text-white glow-text leading-tight">
              {ratio % 1 === 0 ? ratio.toFixed(0) : ratio.toFixed(2)}
              <span className="text-base font-semibold ml-0.5 text-cyan-300">×</span>
            </div>
          </div>
          <div className="flex-1 h-px" style={{ background: "rgba(167,139,250,0.15)" }} />
        </div>
      </div>

      {/* 材料入力 + スケール結果 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 材料入力 */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest">
              {t.ingredientsTitle(originalServings)}
            </h2>
            <span className="text-xs text-violet-200">{t.count(ingredients.length)}</span>
          </div>

          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={ing.id} className="flex items-center gap-2">
                <span className="text-xs text-violet-200 w-5 text-right shrink-0">{idx + 1}</span>
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => updateIngredient(ing.id, "name", e.target.value)}
                  placeholder={t.ingredientName}
                  className="number-input flex-1 min-w-0 rounded-xl px-3 py-2 text-sm neon-focus transition-all"
                />
                <input
                  type="text"
                  value={ing.amount}
                  onChange={(e) => updateIngredient(ing.id, "amount", e.target.value)}
                  placeholder={t.amount}
                  className="number-input w-16 rounded-xl px-2 py-2 text-sm text-center neon-focus transition-all"
                />
                <select
                  value={ing.unit}
                  onChange={(e) => updateIngredient(ing.id, "unit", e.target.value as Unit)}
                  className="glass-select w-20 rounded-xl px-1 py-2 text-sm neon-focus"
                >
                  <optgroup label={t.volumeOptgroup}>
                    {VOLUME_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </optgroup>
                  <optgroup label={t.weightOptgroup}>
                    {WEIGHT_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </optgroup>
                  <optgroup label={t.countOptgroup}>
                    {COUNT_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </optgroup>
                </select>
                <button
                  onClick={() => removeIngredient(ing.id)}
                  disabled={ingredients.length === 1}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-violet-300/50 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 transition-all"
                  aria-label={t.deleteLabel}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addIngredient}
            className="mt-4 w-full py-2.5 rounded-xl border border-dashed border-violet-500/30 text-violet-300 text-sm font-medium hover:border-violet-500/60 hover:text-violet-200 hover:bg-violet-500/5 transition-all"
          >
            {t.addIngredient}
          </button>
        </div>

        {/* スケーリング結果 */}
        <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest">
              {t.scaledTitle(targetServings)}
            </h2>
            {hasIngredients && (
              <button
                onClick={copyResult}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  copied
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "glass-card text-violet-200 hover:text-white border-violet-500/20"
                }`}
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    {t.copied}
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                      <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                    </svg>
                    {t.copy}
                  </>
                )}
              </button>
            )}
          </div>

          {hasIngredients ? (
            <div className="space-y-2">
              {ingredients
                .filter((i) => i.name)
                .map((ing) => {
                  const scaled = scaleAmount(ing.amount, ing.unit, ratio);
                  const changed = scaled !== ing.amount && ing.unit !== "適量";
                  return (
                    <div
                      key={ing.id}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl glass-card"
                    >
                      <span className="text-sm text-white font-medium">{ing.name}</span>
                      <div className="flex items-center gap-1.5">
                        {changed && (
                          <span className="text-xs text-violet-200/50 line-through font-mono">
                            {ing.amount}{ing.unit === "適量" ? "" : ing.unit}
                          </span>
                        )}
                        <span className={`text-sm font-bold font-mono ${changed ? "text-cyan-300" : "text-white/80"}`}>
                          {scaled}
                          {ing.unit === "適量" ? "" : ing.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-violet-200 text-sm">
              {t.emptyState}
            </div>
          )}
        </div>
      </div>

      {/* 計量換算早見表 */}
      <ConversionTable t={t} />

      {/* 注記 */}
      <p className="text-xs text-violet-200 text-center pb-2">
        {t.footerNote}
      </p>

      {/* ===== 使い方ガイド ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.guideTitle}</h2>
        <ol className="space-y-3.5">
          {t.guide.map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-violet-500/20 text-violet-200 text-sm font-bold flex items-center justify-center border border-violet-500/30">{item.step}</span>
              <div>
                <div className="font-medium text-white text-sm">{item.title}</div>
                <div className="text-xs text-violet-200 mt-0.5">{item.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ===== FAQ ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.faqTitle}</h2>
        <div className="space-y-4">
          {t.faq.map((item, i) => (
            <div key={i} className="border-b border-white/6 pb-4 last:border-0 last:pb-0">
              <div className="font-bold text-white text-sm mb-1.5">{item.q}</div>
              <div className="text-sm text-violet-100 leading-relaxed">{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== JSON-LD FAQPage ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "レシピの人数を変えると材料の量はどう変わる？",
                "acceptedAnswer": { "@type": "Answer", "text": "材料の量は人数の比率に比例して変わります。2 人前を 6 人前にすると倍率 3 倍で全材料が自動換算されます。" },
              },
              {
                "@type": "Question",
                "name": "大さじ・小さじの換算はどうすればいい？",
                "acceptedAnswer": { "@type": "Answer", "text": "大さじ 1 = 小さじ 3 = 15ml。カップ 1 = 200ml。スケール後の端数は「○と小さじ△」形式に自動変換されます。" },
              },
              {
                "@type": "Question",
                "name": "適量の材料はスケールできる？",
                "acceptedAnswer": { "@type": "Answer", "text": "「適量」はスケールしても「適量」のままです。塩こしょうなどは味見しながら調整してください。" },
              },
              {
                "@type": "Question",
                "name": "1人前に換算したい場合は？",
                "acceptedAnswer": { "@type": "Answer", "text": "元の人数を 2・目標を 1 に設定すると 1/2 倍の計算になります。0.5 人前単位での設定にも対応しています。" },
              },
            ],
          }),
        }}
      />

      {/* ===== 関連ツール ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {t.relatedLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block p-4 rounded-xl border border-white/8 hover:border-violet-500/40 transition-all duration-200 group"
              style={{ background: "rgba(139,92,246,0)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0)"; }}
            >
              <div className="font-medium text-white text-sm group-hover:text-violet-100 transition-colors">{link.title}</div>
              <div className="text-xs text-violet-100 mt-1">{link.desc}</div>
            </a>
          ))}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "レシピ 分量スケーリング",
  "description": "レシピの人数を変えた時の材料分量を自動計算。分数・小数・計量単位変換対応",
  "url": "https://tools.loresync.dev/recipe-scaling",
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

// ---- 人数入力コンポーネント ----
function ServingsInput({
  label,
  value,
  onChange,
  servingsUnit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  servingsUnit: string;
}) {
  const quickValues = [1, 2, 3, 4, 5, 6, 8, 10];

  return (
    <div>
      <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-3 mb-2">
        <input
          type="range"
          min={0.5}
          max={20}
          step={0.5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 cursor-pointer"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0.5}
            max={99}
            step={0.5}
            value={value}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v > 0) onChange(v);
            }}
            className="number-input w-16 rounded-xl px-2 py-1.5 text-center text-sm font-semibold font-mono neon-focus"
          />
          <span className="text-xs text-violet-200">{servingsUnit}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {quickValues.map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              value === v
                ? "preset-active"
                : "border-white/10 text-violet-100 hover:border-violet-500/40 hover:text-violet-200"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- 計量換算早見表 ----
type ConversionT = {
  conversionTitle: string;
  showDensity: string;
  showBasic: string;
  unitCol: string;
  mlCol: string;
  tbspCol: string;
  tspCol: string;
  ingredientCol: string;
  tbsp1Col: string;
  tsp1Col: string;
  cup1Col: string;
  densityFooter: (n: number) => string;
};

function ConversionTable({ t }: { t: ConversionT }) {
  const [showDensity, setShowDensity] = useState(false);

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest">{t.conversionTitle}</h2>
        <button
          onClick={() => setShowDensity((v) => !v)}
          className="text-xs text-cyan-300 font-medium hover:text-cyan-200 transition-colors"
        >
          {showDensity ? t.showBasic : t.showDensity}
        </button>
      </div>

      {!showDensity ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left py-2.5 pr-4 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.unitCol}</th>
                <th className="text-center py-2.5 px-3 text-xs text-cyan-300 font-medium uppercase tracking-wider">{t.mlCol}</th>
                <th className="text-center py-2.5 px-3 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.tbspCol}</th>
                <th className="text-center py-2.5 px-3 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.tspCol}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "大さじ1", ml: 15, tbsp: 1, tsp: 3 },
                { label: "小さじ1", ml: 5, tbsp: "1/3", tsp: 1 },
                { label: "カップ1", ml: 200, tbsp: "13と1/3", tsp: 40 },
                { label: "カップ1/2", ml: 100, tbsp: "6と2/3", tsp: 20 },
                { label: "カップ1/4", ml: 50, tbsp: "3と1/3", tsp: 10 },
              ].map((row) => (
                <tr key={row.label} className="border-b border-white/5 table-row-stripe">
                  <td className="py-3 pr-4 text-white font-medium">{row.label}</td>
                  <td className="text-center py-3 px-3 text-cyan-300 font-mono">{row.ml}ml</td>
                  <td className="text-center py-3 px-3 text-violet-100 font-mono">{row.tbsp}</td>
                  <td className="text-center py-3 px-3 text-violet-100 font-mono">{row.tsp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left py-2.5 pr-4 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.ingredientCol}</th>
                <th className="text-center py-2.5 px-3 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.tbsp1Col}</th>
                <th className="text-center py-2.5 px-3 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.tsp1Col}</th>
                <th className="text-center py-2.5 px-3 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.cup1Col}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(DENSITY_DB)
                .slice(0, 20)
                .map(([name, d]) => (
                  <tr key={name} className="border-b border-white/5 table-row-stripe">
                    <td className="py-2.5 pr-4 text-white font-medium">{name}</td>
                    <td className="text-center py-2.5 px-3 text-violet-100 font-mono">{d.gPerTbsp}g</td>
                    <td className="text-center py-2.5 px-3 text-violet-100 font-mono">{Math.round(d.gPerTbsp / 3)}g</td>
                    <td className="text-center py-2.5 px-3 text-violet-100 font-mono">{d.gPerCup}g</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <p className="text-xs text-violet-200 mt-2 text-center">{t.densityFooter(Object.keys(DENSITY_DB).length)}</p>
        </div>
      )}
    </div>
  );
}
