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
  gPerCup: number;  // 1カップ = 200ml あたりのg
  gPerTbsp: number; // 大さじ1 = 15ml あたりのg
};

const DENSITY_DB: Record<string, DensityEntry> = {
  // 粉類
  "小麦粉": { gPerCup: 110, gPerTbsp: 8 },
  "薄力粉": { gPerCup: 110, gPerTbsp: 8 },
  "強力粉": { gPerCup: 130, gPerTbsp: 10 },
  "片栗粉": { gPerCup: 130, gPerTbsp: 9 },
  "米粉": { gPerCup: 130, gPerTbsp: 9 },
  "ベーキングパウダー": { gPerCup: 230, gPerTbsp: 14 },
  "重曹": { gPerCup: 230, gPerTbsp: 14 },
  "ココアパウダー": { gPerCup: 100, gPerTbsp: 7 },
  "抹茶": { gPerCup: 100, gPerTbsp: 6 },
  // 砂糖・甘味料
  "砂糖": { gPerCup: 130, gPerTbsp: 9 },
  "上白糖": { gPerCup: 130, gPerTbsp: 9 },
  "グラニュー糖": { gPerCup: 180, gPerTbsp: 12 },
  "粉砂糖": { gPerCup: 110, gPerTbsp: 7 },
  "三温糖": { gPerCup: 130, gPerTbsp: 9 },
  "はちみつ": { gPerCup: 290, gPerTbsp: 21 },
  "メープルシロップ": { gPerCup: 260, gPerTbsp: 19 },
  // 塩・調味料
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
  // 油脂・乳製品
  "バター": { gPerCup: 220, gPerTbsp: 13 },
  "マーガリン": { gPerCup: 215, gPerTbsp: 13 },
  "サラダ油": { gPerCup: 180, gPerTbsp: 13 },
  "オリーブオイル": { gPerCup: 185, gPerTbsp: 14 },
  "ごま油": { gPerCup: 185, gPerTbsp: 14 },
  "牛乳": { gPerCup: 210, gPerTbsp: 16 },
  "生クリーム": { gPerCup: 210, gPerTbsp: 16 },
  "豆乳": { gPerCup: 205, gPerTbsp: 15 },
  // 水・液体
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
  servings: number;
  ingredients: Omit<Ingredient, "id">[];
};

const PRESETS: Preset[] = [
  {
    name: "カレー",
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

// ---- ユーティリティ ----
let idCounter = 0;
const newId = () => `ing-${++idCounter}`;

const parseAmount = (amount: string): number | null => {
  // 「大さじ1」「小さじ1/2」等のテキスト混じりはnull
  const cleaned = amount.replace(/[^\d./]/g, "");
  if (!cleaned) return null;
  if (cleaned.includes("/")) {
    const [n, d] = cleaned.split("/").map(Number);
    return d !== 0 ? n / d : null;
  }
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
};

// 端数を実用的な表記に変換
const formatAmount = (value: number, unit: Unit): string => {
  if (unit === "適量") return "適量";

  // 整数なら整数表示
  if (Number.isInteger(value)) return String(value);

  // 大さじ・小さじの端数変換
  if (unit === "大さじ") {
    const whole = Math.floor(value);
    const frac = value - whole;
    // 余りを小さじに変換（1大さじ = 3小さじ）
    const tspFrac = Math.round(frac * 3);
    if (tspFrac === 0) return String(whole);
    if (tspFrac === 3) return String(whole + 1);
    if (whole === 0) return `小さじ${tspFrac}`;
    return `${whole}と小さじ${tspFrac}`;
  }

  if (unit === "小さじ") {
    // 1/4, 1/2, 3/4 に丸める
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

  // g, ml等：小数点1桁
  if (value < 10) return value.toFixed(1);
  return Math.round(value).toString();
};

// スケーリング計算
const scaleAmount = (
  amount: string,
  unit: Unit,
  ratio: number
): string => {
  if (unit === "適量") return "適量";
  const num = parseAmount(amount);
  if (num === null) return amount; // パース不可はそのまま
  const scaled = num * ratio;
  return formatAmount(scaled, unit);
};

// ---- コンポーネント ----
export default function RecipeScaling() {
  const [originalServings, setOriginalServings] = useState(2);
  const [targetServings, setTargetServings] = useState(4);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: newId(), name: "", amount: "", unit: "g" },
  ]);
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const ratio = originalServings > 0 ? targetServings / originalServings : 1;

  // 材料の追加
  const addIngredient = () => {
    setIngredients((prev) => [...prev, { id: newId(), name: "", amount: "", unit: "g" }]);
  };

  // 材料の削除
  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  // フィールド更新
  const updateIngredient = (id: string, field: keyof Omit<Ingredient, "id">, value: string) => {
    setIngredients((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  // プリセット読み込み
  const loadPreset = (preset: Preset) => {
    setOriginalServings(preset.servings);
    setTargetServings(preset.servings);
    setIngredients(
      preset.ingredients.map((ing) => ({ ...ing, id: newId() }))
    );
    setActivePreset(preset.name);
  };

  // コピー
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
    <div className="space-y-6">
      {/* プリセット */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-3">プリセットレシピ</h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => loadPreset(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                activePreset === p.name
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-600"
              }`}
            >
              {p.name}（{p.servings}人前）
            </button>
          ))}
          <button
            onClick={() => {
              setIngredients([{ id: newId(), name: "", amount: "", unit: "g" }]);
              setOriginalServings(2);
              setTargetServings(4);
              setActivePreset(null);
            }}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-dashed border-gray-300 text-gray-400 hover:border-orange-300 hover:text-orange-400 transition-all"
          >
            クリア
          </button>
        </div>
      </div>

      {/* 人数設定 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">人数設定</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ServingsInput
            label="元の人数"
            value={originalServings}
            onChange={setOriginalServings}
            color="orange"
          />
          <ServingsInput
            label="目標人数"
            value={targetServings}
            onChange={setTargetServings}
            color="amber"
          />
        </div>

        {/* 倍率表示 */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-2.5 text-center">
            <span className="text-xs text-orange-600 font-medium">スケール倍率</span>
            <div className="text-2xl font-extrabold text-orange-500 leading-tight">
              {ratio % 1 === 0 ? ratio.toFixed(0) : ratio.toFixed(2)}
              <span className="text-base font-semibold ml-0.5">×</span>
            </div>
          </div>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
      </div>

      {/* 材料入力 + スケール結果（並列表示） */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 材料入力 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              材料（{originalServings}人前）
            </h2>
            <span className="text-xs text-gray-400">{ingredients.length}件</span>
          </div>

          <div className="space-y-3">
            {ingredients.map((ing, idx) => (
              <div key={ing.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-5 text-right shrink-0">{idx + 1}</span>
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => updateIngredient(ing.id, "name", e.target.value)}
                  placeholder="材料名"
                  className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  type="text"
                  value={ing.amount}
                  onChange={(e) => updateIngredient(ing.id, "amount", e.target.value)}
                  placeholder="量"
                  className="w-16 border border-gray-200 rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <select
                  value={ing.unit}
                  onChange={(e) => updateIngredient(ing.id, "unit", e.target.value as Unit)}
                  className="w-20 border border-gray-200 rounded-xl px-1 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <optgroup label="容量">
                    {VOLUME_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </optgroup>
                  <optgroup label="重量">
                    {WEIGHT_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </optgroup>
                  <optgroup label="個数・その他">
                    {COUNT_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </optgroup>
                </select>
                <button
                  onClick={() => removeIngredient(ing.id)}
                  disabled={ingredients.length === 1}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 disabled:opacity-30 transition-all"
                  aria-label="削除"
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
            className="mt-4 w-full py-2.5 rounded-xl border-2 border-dashed border-orange-200 text-orange-400 text-sm font-medium hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all"
          >
            + 材料を追加
          </button>
        </div>

        {/* スケーリング結果 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              スケール後（{targetServings}人前）
            </h2>
            {hasIngredients && (
              <button
                onClick={copyResult}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  copied
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200"
                }`}
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    コピー済み
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                      <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                    </svg>
                    コピー
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
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-orange-50 border border-orange-100"
                    >
                      <span className="text-sm text-gray-700 font-medium">{ing.name}</span>
                      <div className="flex items-center gap-1.5">
                        {changed && (
                          <span className="text-xs text-gray-400 line-through">
                            {ing.amount}{ing.unit === "適量" ? "" : ing.unit}
                          </span>
                        )}
                        <span className={`text-sm font-bold ${changed ? "text-orange-600" : "text-gray-600"}`}>
                          {scaled}
                          {ing.unit === "適量" ? "" : ing.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              材料名と量を入力すると表示されます
            </div>
          )}
        </div>
      </div>

      {/* 計量換算早見表 */}
      <ConversionTable />

      {/* 注記 */}
      <p className="text-xs text-gray-400 text-center pb-4">
        ※ 食材の密度は目安値です。実際の量は食材の状態によって異なります。
      </p>

      {/* ===== 使い方ガイド ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">使い方ガイド</h2>
        <ol className="space-y-3">
          {[
            { step: "1", title: "プリセットを選ぶかクリア", desc: "カレー・ハンバーグ・パンケーキ・唐揚げのプリセットを選ぶと材料が自動入力されます。自分のレシピを入力する場合は「クリア」から始めてください。" },
            { step: "2", title: "元の人数を設定", desc: "レシピに記載されている元の人数をスライダーまたは数値入力で設定します。0.5 人前単位で設定できます。" },
            { step: "3", title: "目標人数を設定", desc: "作りたい人数を設定します。倍率が自動計算され、材料の量がリアルタイムで更新されます。" },
            { step: "4", title: "結果をコピー", desc: "スケール後の材料一覧右上のコピーボタンを押すと、クリップボードにテキスト形式でコピーされます。メモアプリや買い物リストにそのまま貼り付け可能です。" },
          ].map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-700 text-sm font-bold flex items-center justify-center">{item.step}</span>
              <div>
                <div className="font-medium text-gray-800 text-sm">{item.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ===== FAQ ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問（FAQ）</h2>
        <div className="space-y-4">
          {[
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
          ].map((item, i) => (
            <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="font-bold text-gray-800 text-sm mb-1">{item.q}</div>
              <div className="text-sm text-gray-600">{item.a}</div>
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">関連ツール</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: "/measuring-converter", title: "計量単位換算", desc: "g・ml・大さじ・カップなど料理で使う計量単位を相互換算。" },
            { href: "/oven-temp-converter", title: "オーブン温度換算", desc: "摂氏・華氏・ガス温度のオーブン設定を相互換算。" },
            { href: "/calorie-keisan", title: "カロリー計算", desc: "食材ごとのカロリーを計算して一食あたりの摂取量を把握。" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all group"
            >
              <div className="font-medium text-gray-800 text-sm group-hover:text-orange-700">{link.title}</div>
              <div className="text-xs text-gray-500 mt-1">{link.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- 人数入力コンポーネント ----
function ServingsInput({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: "orange" | "amber";
}) {
  const ringColor = color === "orange" ? "focus:ring-orange-400" : "focus:ring-amber-400";
  const accentColor = color === "orange" ? "text-orange-500" : "text-amber-500";
  const sliderClass =
    color === "orange"
      ? "accent-orange-500"
      : "accent-amber-500";

  const quickValues = [1, 2, 3, 4, 5, 6, 8, 10];

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-3 mb-2">
        <input
          type="range"
          min={0.5}
          max={20}
          step={0.5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`flex-1 h-2 rounded-full ${sliderClass}`}
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
            className={`w-16 border border-gray-200 rounded-xl px-2 py-1.5 text-center text-sm font-semibold ${accentColor} focus:outline-none focus:ring-2 ${ringColor}`}
          />
          <span className="text-xs text-gray-500">人前</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {quickValues.map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              value === v
                ? color === "orange"
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-amber-500 text-white border-amber-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
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
function ConversionTable() {
  const [showDensity, setShowDensity] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">計量換算早見表</h2>
        <button
          onClick={() => setShowDensity((v) => !v)}
          className="text-xs text-orange-500 font-medium hover:text-orange-700 transition-colors"
        >
          {showDensity ? "基本換算を表示" : "食材別グラム数を表示"}
        </button>
      </div>

      {!showDensity ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-semibold text-gray-600">単位</th>
                <th className="text-center py-2 px-3 font-semibold text-orange-600">ml</th>
                <th className="text-center py-2 px-3 font-semibold text-amber-600">大さじ</th>
                <th className="text-center py-2 px-3 font-semibold text-yellow-600">小さじ</th>
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
                <tr key={row.label} className="border-b border-gray-50 hover:bg-orange-50/40">
                  <td className="py-3 pr-4 text-gray-700 font-medium">{row.label}</td>
                  <td className="text-center py-3 px-3 text-gray-600">{row.ml}ml</td>
                  <td className="text-center py-3 px-3 text-gray-600">大さじ{row.tbsp}</td>
                  <td className="text-center py-3 px-3 text-gray-600">小さじ{row.tsp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-semibold text-gray-600">食材</th>
                <th className="text-center py-2 px-3 font-semibold text-orange-600">大さじ1</th>
                <th className="text-center py-2 px-3 font-semibold text-amber-600">小さじ1</th>
                <th className="text-center py-2 px-3 font-semibold text-yellow-600">カップ1</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(DENSITY_DB)
                .slice(0, 20)
                .map(([name, d]) => (
                  <tr key={name} className="border-b border-gray-50 hover:bg-orange-50/40">
                    <td className="py-2.5 pr-4 text-gray-700 font-medium">{name}</td>
                    <td className="text-center py-2.5 px-3 text-gray-600">{d.gPerTbsp}g</td>
                    <td className="text-center py-2.5 px-3 text-gray-600">{Math.round(d.gPerTbsp / 3)}g</td>
                    <td className="text-center py-2.5 px-3 text-gray-600">{d.gPerCup}g</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-2 text-center">全{Object.keys(DENSITY_DB).length}食材のデータ収録</p>
        </div>
      )}
    </div>
  );
}
