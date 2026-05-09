"use client";

import { useMemo, useState } from "react";

type Gender = "male" | "female";
type Goal = "maintain" | "slow-loss" | "loss" | "gain";
type MacroPreset = "balanced" | "high-protein" | "low-fat";
type CopiedTarget = "summary" | "csv" | null;

type ActivityLevel = {
  key: string;
  label: string;
  description: string;
  multiplier: number;
};

type MacroRatio = {
  key: MacroPreset;
  label: string;
  protein: number;
  fat: number;
  carbs: number;
};

type Result = {
  bmr: number;
  tdee: number;
  targetCalories: number;
  weeklyChangeKcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

const ACTIVITY_LEVELS: ActivityLevel[] = [
  { key: "low", label: "低い", description: "座り仕事中心、運動はほぼなし", multiplier: 1.2 },
  { key: "light", label: "やや低い", description: "週1〜3回の軽い運動", multiplier: 1.375 },
  { key: "moderate", label: "ふつう", description: "週3〜5回の運動、よく歩く", multiplier: 1.55 },
  { key: "high", label: "高い", description: "週6回以上の運動、立ち仕事中心", multiplier: 1.725 },
  { key: "very-high", label: "かなり高い", description: "肉体労働、競技レベルの運動", multiplier: 1.9 },
];

const GOALS: Record<Goal, { label: string; adjustment: number; description: string }> = {
  maintain: { label: "維持", adjustment: 0, description: "TDEEをそのまま目安にします。" },
  "slow-loss": { label: "ゆるく減量", adjustment: -300, description: "TDEEから約300kcal引いた目安です。" },
  loss: { label: "減量", adjustment: -500, description: "TDEEから約500kcal引いた目安です。" },
  gain: { label: "増量", adjustment: 300, description: "TDEEに約300kcal足した目安です。" },
};

const MACRO_PRESETS: MacroRatio[] = [
  { key: "balanced", label: "標準", protein: 20, fat: 25, carbs: 55 },
  { key: "high-protein", label: "高たんぱく", protein: 25, fat: 25, carbs: 50 },
  { key: "low-fat", label: "脂質控えめ", protein: 20, fat: 20, carbs: 60 },
];

const EXAMPLES = [
  { label: "30歳 男性", gender: "male" as const, age: "30", height: "170", weight: "65", activity: 2 },
  { label: "35歳 女性", gender: "female" as const, age: "35", height: "160", weight: "52", activity: 1 },
  { label: "50歳 運動多め", gender: "male" as const, age: "50", height: "175", weight: "75", activity: 3 },
];

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString();
}

function formatGram(value: number) {
  return `${Math.round(value)}g`;
}

function calculateBmr(gender: Gender, age: number, height: number, weight: number) {
  if (gender === "male") {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  }
  return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
}

function getInputError(age: number, height: number, weight: number) {
  if (!age && !height && !weight) return "";
  if (!age || !height || !weight) return "年齢、身長、体重をすべて入力してください。";
  if (age < 18 || age > 100) return "このツールは18〜100歳の成人向け目安です。";
  if (height < 120 || height > 230) return "身長は120〜230cmの範囲で入力してください。";
  if (weight < 30 || weight > 250) return "体重は30〜250kgの範囲で入力してください。";
  return "";
}

function buildSummary(result: Result, gender: Gender, age: string, height: string, weight: string, activity: ActivityLevel, goal: Goal, macro: MacroRatio) {
  return [
    "カロリー計算結果",
    `性別: ${gender === "male" ? "男性" : "女性"}`,
    `年齢: ${age}歳 / 身長: ${height}cm / 体重: ${weight}kg`,
    `活動レベル: ${activity.label}（係数 ${activity.multiplier}）`,
    `基礎代謝量: ${formatNumber(result.bmr)} kcal/日`,
    `推定消費カロリー: ${formatNumber(result.tdee)} kcal/日`,
    `目標: ${GOALS[goal].label}`,
    `目標摂取カロリー: ${formatNumber(result.targetCalories)} kcal/日`,
    `PFC: P ${macro.protein}% / F ${macro.fat}% / C ${macro.carbs}%`,
    `たんぱく質: ${formatGram(result.protein)} / 脂質: ${formatGram(result.fat)} / 炭水化物: ${formatGram(result.carbs)}`,
  ].join("\n");
}

function makeCsv(rows: string[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
}

export default function CalorieCalculator() {
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("30");
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("65");
  const [activityIndex, setActivityIndex] = useState(2);
  const [goal, setGoal] = useState<Goal>("maintain");
  const [macroPreset, setMacroPreset] = useState<MacroPreset>("balanced");
  const [copiedTarget, setCopiedTarget] = useState<CopiedTarget>(null);

  const ageValue = parseNumber(age);
  const heightValue = parseNumber(height);
  const weightValue = parseNumber(weight);
  const activity = ACTIVITY_LEVELS[activityIndex];
  const macro = MACRO_PRESETS.find((item) => item.key === macroPreset) ?? MACRO_PRESETS[0];
  const error = getInputError(ageValue, heightValue, weightValue);

  const result = useMemo<Result | null>(() => {
    if (error) return null;

    const bmr = calculateBmr(gender, ageValue, heightValue, weightValue);
    const tdee = bmr * activity.multiplier;
    const targetCalories = Math.max(1200, tdee + GOALS[goal].adjustment);
    const weeklyChangeKcal = GOALS[goal].adjustment * 7;
    const protein = (targetCalories * (macro.protein / 100)) / 4;
    const fat = (targetCalories * (macro.fat / 100)) / 9;
    const carbs = (targetCalories * (macro.carbs / 100)) / 4;

    return { bmr, tdee, targetCalories, weeklyChangeKcal, protein, fat, carbs };
  }, [activity.multiplier, ageValue, error, gender, goal, heightValue, macro.carbs, macro.fat, macro.protein, weightValue]);

  const summary = result ? buildSummary(result, gender, age, height, weight, activity, goal, macro) : "";
  const csv = result
    ? makeCsv([
        ["項目", "値"],
        ["性別", gender === "male" ? "男性" : "女性"],
        ["年齢", age],
        ["身長cm", height],
        ["体重kg", weight],
        ["活動レベル", activity.label],
        ["活動係数", String(activity.multiplier)],
        ["基礎代謝kcal", String(Math.round(result.bmr))],
        ["推定消費カロリーkcal", String(Math.round(result.tdee))],
        ["目標", GOALS[goal].label],
        ["目標摂取カロリーkcal", String(Math.round(result.targetCalories))],
        ["たんぱく質g", String(Math.round(result.protein))],
        ["脂質g", String(Math.round(result.fat))],
        ["炭水化物g", String(Math.round(result.carbs))],
      ])
    : "";

  function updateDecimal(setter: (value: string) => void, value: string) {
    setter(value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"));
    setCopiedTarget(null);
  }

  function reset() {
    setGender("male");
    setAge("30");
    setHeight("170");
    setWeight("65");
    setActivityIndex(2);
    setGoal("maintain");
    setMacroPreset("balanced");
    setCopiedTarget(null);
  }

  async function copyText(target: Exclude<CopiedTarget, null>, text: string) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedTarget(target);
    window.setTimeout(() => setCopiedTarget(null), 1600);
  }

  function downloadCsv() {
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "calorie-keisan.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">身体情報</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">成人向けの推定値です。医療・栄養指導の代替ではありません。</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              リセット
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            {(["male", "female"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setGender(item)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  gender === item ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {item === "male" ? "男性" : "女性"}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <NumberInput id="calorie-age" label="年齢" value={age} unit="歳" inputMode="numeric" onChange={(value) => updateDecimal(setAge, value)} />
            <NumberInput id="calorie-height" label="身長" value={height} unit="cm" inputMode="decimal" onChange={(value) => updateDecimal(setHeight, value)} />
            <NumberInput id="calorie-weight" label="体重" value={weight} unit="kg" inputMode="decimal" onChange={(value) => updateDecimal(setWeight, value)} />
          </div>

          <p className={`mt-3 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
            {error || "計算はブラウザ上で完結し、入力値を外部に送信しません。"}
          </p>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-950">活動レベル</p>
            <div className="mt-2 grid gap-2">
              {ACTIVITY_LEVELS.map((level, index) => (
                <button
                  key={level.key}
                  type="button"
                  onClick={() => setActivityIndex(index)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    activityIndex === index
                      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  <span className="font-semibold">{level.label}</span>
                  <span className="ml-2 text-xs opacity-75">{level.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-950">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => {
                    setGender(example.gender);
                    setAge(example.age);
                    setHeight(example.height);
                    setWeight(example.weight);
                    setActivityIndex(example.activity);
                    setCopiedTarget(null);
                  }}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Segmented
              title="目標"
              options={Object.entries(GOALS).map(([key, value]) => ({ key, label: value.label, description: value.description }))}
              value={goal}
              onChange={(value) => setGoal(value as Goal)}
            />
            <Segmented
              title="PFC"
              options={MACRO_PRESETS.map((item) => ({
                key: item.key,
                label: item.label,
                description: `P${item.protein}% / F${item.fat}% / C${item.carbs}%`,
              }))}
              value={macroPreset}
              onChange={(value) => setMacroPreset(value as MacroPreset)}
            />
          </div>

          {!result ? (
            <div className="mt-5 flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div>
                <p className="text-sm font-semibold text-slate-800">入力を確認してください</p>
                <p className="mt-1 text-sm text-slate-500">{error || "結果を表示するには身体情報を入力してください。"}</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">目標摂取カロリー</p>
                    <p className="mt-1 font-mono text-5xl font-bold tracking-tight text-emerald-950">
                      {formatNumber(result.targetCalories)}
                      <span className="ml-1 text-lg font-semibold">kcal</span>
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm font-medium text-emerald-700">目標</p>
                    <p className="mt-1 text-xl font-bold text-emerald-950">{GOALS[goal].label}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-emerald-800">
                  {GOALS[goal].description} 体重変化の実際は体組成、食事内容、運動量、体調によって変わります。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="基礎代謝量" value={`${formatNumber(result.bmr)} kcal`} note="Harris-Benedict改訂式" />
                <Metric label="推定消費カロリー" value={`${formatNumber(result.tdee)} kcal`} note={`活動係数 ${activity.multiplier}`} />
                <Metric label="週間差分" value={`${formatNumber(result.weeklyChangeKcal)} kcal`} note="目標設定による概算" />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-950">PFCバランス</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <MacroCard label="たんぱく質" value={formatGram(result.protein)} ratio={macro.protein} color="bg-red-400" />
                  <MacroCard label="脂質" value={formatGram(result.fat)} ratio={macro.fat} color="bg-amber-400" />
                  <MacroCard label="炭水化物" value={formatGram(result.carbs)} ratio={macro.carbs} color="bg-violet-400" />
                </div>
                <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-white">
                  <div className="bg-red-400" style={{ width: `${macro.protein}%` }} />
                  <div className="bg-amber-400" style={{ width: `${macro.fat}%` }} />
                  <div className="bg-violet-400" style={{ width: `${macro.carbs}%` }} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyText("summary", summary)}
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  {copiedTarget === "summary" ? "コピーしました" : "結果をコピー"}
                </button>
                <button
                  type="button"
                  onClick={() => copyText("csv", csv)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copiedTarget === "csv" ? "CSVをコピーしました" : "CSVをコピー"}
                </button>
                <button
                  type="button"
                  onClick={downloadCsv}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  CSVダウンロード
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function NumberInput({
  id,
  label,
  value,
  unit,
  inputMode,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  unit: string;
  inputMode: "numeric" | "decimal";
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 px-3 py-3 text-right font-mono text-lg outline-none"
        />
        <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

function Segmented({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { key: string; label: string; description: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <div className="mt-2 grid gap-2">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
              value === option.key ? "border-slate-900 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
            }`}
          >
            <span className="font-semibold">{option.label}</span>
            <span className="mt-0.5 block text-xs opacity-75">{option.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function MacroCard({ label, value, ratio, color }: { label: string; value: string; ratio: number; color: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{ratio}%</p>
    </div>
  );
}
