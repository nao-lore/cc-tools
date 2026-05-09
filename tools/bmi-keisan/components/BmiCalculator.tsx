"use client";

import { useMemo, useState } from "react";

type BmiCategory = {
  label: string;
  shortLabel: string;
  tone: string;
  range: string;
  min: number;
  max: number;
  advice: string;
};

const BMI_CATEGORIES: BmiCategory[] = [
  {
    label: "低体重（やせ）",
    shortLabel: "低体重",
    tone: "text-sky-700 bg-sky-50 border-sky-200",
    range: "18.5 未満",
    min: 0,
    max: 18.5,
    advice: "体重だけで判断せず、食事量・筋肉量・体調の変化も確認してください。",
  },
  {
    label: "普通体重",
    shortLabel: "普通",
    tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
    range: "18.5 以上 25.0 未満",
    min: 18.5,
    max: 25,
    advice: "現在の範囲を維持しながら、体脂肪率や腹囲もあわせて見ると実用的です。",
  },
  {
    label: "肥満（1度）",
    shortLabel: "肥満1度",
    tone: "text-amber-700 bg-amber-50 border-amber-200",
    range: "25.0 以上 30.0 未満",
    min: 25,
    max: 30,
    advice: "生活習慣の見直し候補です。腹囲・血圧・血糖・脂質も一緒に確認してください。",
  },
  {
    label: "肥満（2度）",
    shortLabel: "肥満2度",
    tone: "text-orange-700 bg-orange-50 border-orange-200",
    range: "30.0 以上 35.0 未満",
    min: 30,
    max: 35,
    advice: "健康リスクの確認優先度が上がります。健診結果とあわせて判断してください。",
  },
  {
    label: "肥満（3度）",
    shortLabel: "肥満3度",
    tone: "text-red-700 bg-red-50 border-red-200",
    range: "35.0 以上 40.0 未満",
    min: 35,
    max: 40,
    advice: "高度肥満に含まれる範囲です。医療機関や専門家への相談も検討してください。",
  },
  {
    label: "肥満（4度）",
    shortLabel: "肥満4度",
    tone: "text-rose-800 bg-rose-50 border-rose-200",
    range: "40.0 以上",
    min: 40,
    max: Infinity,
    advice: "高度肥満に含まれる範囲です。自己判断だけでなく専門家に相談してください。",
  },
];

const EXAMPLES = [
  { label: "170cm / 65kg", height: "170", weight: "65" },
  { label: "160cm / 50kg", height: "160", weight: "50" },
  { label: "175cm / 82kg", height: "175", weight: "82" },
];

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function format(value: number, digits = 1) {
  return value.toFixed(digits);
}

function getCategory(bmi: number): BmiCategory {
  return BMI_CATEGORIES.find((category) => bmi >= category.min && bmi < category.max) ?? BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}

function getInputError(height: number, weight: number) {
  if (!height && !weight) return "";
  if (!height || !weight) return "身長と体重を両方入力してください。";
  if (height < 80 || height > 240) return "身長は 80〜240cm の範囲で入力してください。";
  if (weight < 20 || weight > 300) return "体重は 20〜300kg の範囲で入力してください。";
  return "";
}

function buildCopyText(result: BmiResult) {
  return [
    `BMI: ${format(result.bmi)}`,
    `判定: ${result.category.label}`,
    `標準体重: ${format(result.standardWeight)}kg`,
    `普通体重の目安: ${format(result.normalMin)}kg〜${format(result.normalMax)}kg未満`,
    `現在体重との差: ${result.diffFromStandard >= 0 ? "+" : ""}${format(result.diffFromStandard)}kg`,
  ].join("\n");
}

type BmiResult = {
  bmi: number;
  category: BmiCategory;
  standardWeight: number;
  normalMin: number;
  normalMax: number;
  diffFromStandard: number;
  distanceToNormal: string;
};

function BmiGauge({ bmi }: { bmi: number }) {
  const min = 14;
  const max = 42;
  const pct = Math.min(100, Math.max(0, ((bmi - min) / (max - min)) * 100));
  const segments = [
    { label: "低体重", from: min, to: 18.5, className: "bg-sky-400" },
    { label: "普通", from: 18.5, to: 25, className: "bg-emerald-400" },
    { label: "肥満1", from: 25, to: 30, className: "bg-amber-400" },
    { label: "肥満2", from: 30, to: 35, className: "bg-orange-400" },
    { label: "肥満3+", from: 35, to: max, className: "bg-red-500" },
  ];

  return (
    <div className="space-y-3">
      <div className="relative h-4 overflow-hidden rounded-full bg-slate-100">
        <div className="flex h-full">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className={segment.className}
              style={{ width: `${((segment.to - segment.from) / (max - min)) * 100}%` }}
            />
          ))}
        </div>
        <div
          className="absolute top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-slate-950 shadow"
          style={{ left: `calc(${pct}% - 2px)` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>14</span>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>35</span>
        <span>42</span>
      </div>
    </div>
  );
}

export default function BmiCalculator() {
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("65");
  const [copied, setCopied] = useState(false);

  const heightValue = parseNumber(height);
  const weightValue = parseNumber(weight);
  const error = getInputError(heightValue, weightValue);

  const result = useMemo<BmiResult | null>(() => {
    if (error || !heightValue || !weightValue) return null;

    const meters = heightValue / 100;
    const bmi = weightValue / (meters * meters);
    const standardWeight = 22 * meters * meters;
    const normalMin = 18.5 * meters * meters;
    const normalMax = 25 * meters * meters;
    const diffFromStandard = weightValue - standardWeight;
    const category = getCategory(bmi);
    let distanceToNormal = "普通体重の範囲内です。";

    if (bmi < 18.5) {
      distanceToNormal = `普通体重の下限まで ${format(normalMin - weightValue)}kg です。`;
    } else if (bmi >= 25) {
      distanceToNormal = `普通体重の上限まで ${format(weightValue - normalMax)}kg です。`;
    }

    return { bmi, category, standardWeight, normalMin, normalMax, diffFromStandard, distanceToNormal };
  }, [error, heightValue, weightValue]);

  function updateNumber(setter: (value: string) => void, value: string) {
    setter(value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"));
    setCopied(false);
  }

  function reset() {
    setHeight("");
    setWeight("");
    setCopied(false);
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(buildCopyText(result));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">身長・体重</h2>
              <p className="mt-1 text-sm text-slate-500">成人向けのBMI、標準体重、普通体重範囲を計算します。</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              クリア
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <div>
              <label htmlFor="bmi-height" className="text-sm font-medium text-slate-700">
                身長
              </label>
              <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
                <input
                  id="bmi-height"
                  type="text"
                  inputMode="decimal"
                  value={height}
                  onChange={(event) => updateNumber(setHeight, event.target.value)}
                  placeholder="170"
                  className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
                  aria-describedby="bmi-input-error"
                />
                <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">cm</span>
              </div>
            </div>

            <div>
              <label htmlFor="bmi-weight" className="text-sm font-medium text-slate-700">
                体重
              </label>
              <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
                <input
                  id="bmi-weight"
                  type="text"
                  inputMode="decimal"
                  value={weight}
                  onChange={(event) => updateNumber(setWeight, event.target.value)}
                  placeholder="65"
                  className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
                  aria-describedby="bmi-input-error"
                />
                <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">kg</span>
              </div>
            </div>
          </div>

          <p id="bmi-input-error" className={`mt-3 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
            {error || "小数も入力できます。結果は端末内で計算され、外部に送信されません。"}
          </p>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => {
                    setHeight(example.height);
                    setWeight(example.weight);
                    setCopied(false);
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
          {!result ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <div>
                <p className="text-sm font-medium text-slate-700">入力を確認してください</p>
                <p className="mt-1 text-sm text-slate-500">身長と体重を入れると、判定と標準体重が表示されます。</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className={`rounded-2xl border p-5 ${result.category.tone}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-80">あなたのBMI</p>
                    <p className="mt-1 font-mono text-5xl font-bold tracking-tight">{format(result.bmi)}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm font-medium opacity-80">判定</p>
                    <p className="mt-1 text-2xl font-bold">{result.category.label}</p>
                  </div>
                </div>
                <div className="mt-5">
                  <BmiGauge bmi={result.bmi} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard label="標準体重" value={`${format(result.standardWeight)} kg`} note="BMI 22 を基準" />
                <ResultCard label="普通体重の範囲" value={`${format(result.normalMin)} - ${format(result.normalMax)} kg未満`} note="BMI 18.5以上25未満" />
                <ResultCard
                  label="標準体重との差"
                  value={`${result.diffFromStandard >= 0 ? "+" : ""}${format(result.diffFromStandard)} kg`}
                  note={result.diffFromStandard >= 0 ? "現在体重が標準より重い" : "現在体重が標準より軽い"}
                />
                <ResultCard label="普通体重まで" value={result.distanceToNormal} note="境界値との差分" />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">結果の見方</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{result.category.advice}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  {copied ? "コピーしました" : "結果をコピー"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  入力をクリア
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-slate-950">日本肥満学会のBMI判定基準</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {BMI_CATEGORIES.map((category) => (
            <div key={category.label} className={`rounded-xl border p-3 ${category.tone}`}>
              <div className="text-sm font-semibold">{category.label}</div>
              <div className="mt-1 text-xs opacity-80">BMI {category.range}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResultCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}
