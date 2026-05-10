"use client";

import { useMemo, useState } from "react";

type GamePreset = {
  name: string;
  ceiling: number;
  ratePercent: number;
  costPerPull: number;
  currency: string;
};

const PRESETS: GamePreset[] = [
  { name: "90連天井", ceiling: 90, ratePercent: 0.6, costPerPull: 160, currency: "石" },
  { name: "200連天井", ceiling: 200, ratePercent: 0.7, costPerPull: 120, currency: "石" },
  { name: "330連天井", ceiling: 330, ratePercent: 1, costPerPull: 30, currency: "個" },
  { name: "カスタム", ceiling: 100, ratePercent: 1, costPerPull: 150, currency: "石" },
];

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number, digits = 0) {
  return value.toLocaleString("ja-JP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function calcExpectedPulls(ceiling: number, ratePercent: number) {
  const probability = ratePercent / 100;
  let expected = 0;
  let successBeforeCeiling = 0;

  for (let pull = 1; pull <= ceiling; pull += 1) {
    const chance = Math.pow(1 - probability, pull - 1) * probability;
    expected += pull * chance;
    successBeforeCeiling += chance;
  }

  expected += ceiling * Math.max(0, 1 - successBeforeCeiling);
  return expected;
}

function getValidationError({
  ceiling,
  ratePercent,
  costPerPull,
  jpyPerUnit,
  targetCount,
  currentPulls,
}: {
  ceiling: number;
  ratePercent: number;
  costPerPull: number;
  jpyPerUnit: number;
  targetCount: number;
  currentPulls: number;
}) {
  if (ceiling < 1 || ceiling > 1000) return "天井回数は 1〜1000 の範囲で入力してください。";
  if (ratePercent <= 0 || ratePercent > 100) return "排出率は 0 より大きく 100 以下で入力してください。";
  if (costPerPull < 0) return "1回あたりのコストは 0 以上で入力してください。";
  if (jpyPerUnit < 0) return "円換算レートは 0 以上で入力してください。";
  if (targetCount < 1 || targetCount > 20) return "目標数は 1〜20 の範囲で入力してください。";
  if (currentPulls < 0 || currentPulls > ceiling) return "現在の累積回数は 0〜天井回数の範囲で入力してください。";
  return "";
}

export default function GachaCostCeiling() {
  const [presetName, setPresetName] = useState(PRESETS[0].name);
  const [ceiling, setCeiling] = useState(String(PRESETS[0].ceiling));
  const [ratePercent, setRatePercent] = useState(String(PRESETS[0].ratePercent));
  const [costPerPull, setCostPerPull] = useState(String(PRESETS[0].costPerPull));
  const [currency, setCurrency] = useState(PRESETS[0].currency);
  const [jpyPerUnit, setJpyPerUnit] = useState("");
  const [targetCount, setTargetCount] = useState("1");
  const [currentPulls, setCurrentPulls] = useState("0");
  const [copied, setCopied] = useState(false);

  const numbers = {
    ceiling: parseInteger(ceiling),
    ratePercent: parseNumber(ratePercent),
    costPerPull: parseNumber(costPerPull),
    jpyPerUnit: parseNumber(jpyPerUnit),
    targetCount: parseInteger(targetCount) || 1,
    currentPulls: parseInteger(currentPulls),
  };

  const validationError = getValidationError(numbers);

  const result = useMemo(() => {
    if (validationError) return null;

    const expectedPulls = calcExpectedPulls(numbers.ceiling, numbers.ratePercent);
    const ceilingCost = numbers.ceiling * numbers.costPerPull;
    const expectedCost = expectedPulls * numbers.costPerPull;
    const remainingPulls = Math.max(0, numbers.ceiling - numbers.currentPulls);
    const remainingCeilingCost = remainingPulls * numbers.costPerPull;
    const totalCeilingCost = ceilingCost * numbers.targetCount;
    const totalExpectedCost = expectedCost * numbers.targetCount;
    const chanceBeforeCeiling = (1 - Math.pow(1 - numbers.ratePercent / 100, numbers.ceiling)) * 100;
    const toJpy = (value: number) => (numbers.jpyPerUnit > 0 ? value * numbers.jpyPerUnit : null);

    return {
      expectedPulls,
      ceilingCost,
      expectedCost,
      remainingPulls,
      remainingCeilingCost,
      totalCeilingCost,
      totalExpectedCost,
      chanceBeforeCeiling,
      toJpy,
    };
  }, [numbers.ceiling, numbers.costPerPull, numbers.currentPulls, numbers.jpyPerUnit, numbers.ratePercent, numbers.targetCount, validationError]);

  function applyPreset(preset: GamePreset) {
    setPresetName(preset.name);
    setCeiling(String(preset.ceiling));
    setRatePercent(String(preset.ratePercent));
    setCostPerPull(String(preset.costPerPull));
    setCurrency(preset.currency);
    setCopied(false);
  }

  function reset() {
    applyPreset(PRESETS[0]);
    setJpyPerUnit("");
    setTargetCount("1");
    setCurrentPulls("0");
  }

  async function copyResult() {
    if (!result) return;
    const lines = [
      `天井回数: ${numbers.ceiling}回`,
      `排出率: ${numbers.ratePercent}%`,
      `1回コスト: ${numbers.costPerPull}${currency}`,
      `天井コスト: ${formatNumber(result.ceilingCost)}${currency}`,
      `期待値: ${formatNumber(result.expectedPulls, 1)}回 / ${formatNumber(result.expectedCost)}${currency}`,
      `天井まで残り: ${result.remainingPulls}回 / ${formatNumber(result.remainingCeilingCost)}${currency}`,
      `目標${numbers.targetCount}体の最大コスト: ${formatNumber(result.totalCeilingCost)}${currency}`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.6fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div>
            <h2 className="text-base font-semibold text-slate-950">ガチャ設定</h2>
            <p className="mt-1 text-sm text-slate-500">天井回数、排出率、1回コストを入れて最大コストと期待値を計算します。</p>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-800">サンプル設定</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                    presetName === preset.name
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 text-slate-700 hover:border-slate-950 hover:bg-slate-50"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">プリセットは編集用の例です。実際の排出率や天井仕様はゲーム内の最新表記を優先してください。</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NumberField label="天井回数" value={ceiling} onChange={setCeiling} suffix="回" />
            <NumberField label="排出率" value={ratePercent} onChange={setRatePercent} suffix="%" decimal />
            <NumberField label="1回コスト" value={costPerPull} onChange={setCostPerPull} suffix={currency} />
            <TextField label="通貨単位" value={currency} onChange={setCurrency} placeholder="石" />
            <NumberField label={`1${currency || "単位"}あたり`} value={jpyPerUnit} onChange={setJpyPerUnit} suffix="円" decimal placeholder="任意" />
            <NumberField label="目標数" value={targetCount} onChange={setTargetCount} suffix="体" />
            <NumberField label="現在の累積" value={currentPulls} onChange={setCurrentPulls} suffix="回" />
          </div>

          <p className={`mt-3 min-h-5 text-sm ${validationError ? "text-red-600" : "text-slate-500"}`}>
            {validationError || "ソフト天井、すり抜け、確定枠、交換ポイントなどの特殊仕様は必要に応じて設定を調整してください。"}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!result}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {copied ? "コピーしました" : "結果をコピー"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              リセット
            </button>
          </div>
        </div>

        <aside className="p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">計算結果</h2>
          {!result ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">入力値を確認してください。</div>
          ) : (
            <div className="mt-4 space-y-3">
              <ResultCard
                label="天井コスト"
                value={`${formatNumber(result.ceilingCost)} ${currency}`}
                note={result.toJpy(result.ceilingCost) === null ? "最悪ケースの目安" : `約 ${formatNumber(result.toJpy(result.ceilingCost)!)}円`}
                strong
              />
              <ResultCard
                label="期待値"
                value={`${formatNumber(result.expectedPulls, 1)} 回`}
                note={`${formatNumber(result.expectedCost)} ${currency}`}
              />
              <ResultCard
                label="天井まで残り"
                value={`${result.remainingPulls} 回`}
                note={`${formatNumber(result.remainingCeilingCost)} ${currency}`}
              />
              <ResultCard
                label={`目標${numbers.targetCount}体の最大`}
                value={`${formatNumber(result.totalCeilingCost)} ${currency}`}
                note={result.toJpy(result.totalCeilingCost) === null ? "全天井時" : `約 ${formatNumber(result.toJpy(result.totalCeilingCost)!)}円`}
              />
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                この計算は単純な確率モデルです。確定枠、すり抜け保証、ソフト天井、交換ポイント、無料石は反映していません。
              </div>
            </div>
          )}
        </aside>
      </div>

      {result && (
        <div className="border-t border-slate-200 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">確率の目安</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <ResultCard label="天井前に引ける確率" value={`${formatNumber(result.chanceBeforeCeiling, 1)}%`} note="単純確率モデル" />
            <ResultCard label="1体の期待コスト" value={`${formatNumber(result.expectedCost)} ${currency}`} note="平均的な目安" />
            <ResultCard label={`目標${numbers.targetCount}体の期待`} value={`${formatNumber(result.totalExpectedCost)} ${currency}`} note="期待値の単純合計" />
          </div>
        </div>
      )}
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  decimal = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix: string;
  decimal?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-950">
        <input
          type="text"
          inputMode={decimal ? "decimal" : "numeric"}
          value={value}
          onChange={(event) => onChange(event.target.value.replace(decimal ? /[^0-9.]/g : /[^\d]/g, ""))}
          placeholder={placeholder}
          className="min-w-0 flex-1 px-3 py-2.5 text-right font-mono outline-none"
        />
        <span className="border-l border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">{suffix}</span>
      </div>
    </label>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value.slice(0, 8))}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-950"
      />
    </label>
  );
}

function ResultCard({ label, value, note, strong = false }: { label: string; value: string; note: string; strong?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${strong ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-white"}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 font-semibold text-slate-950 ${strong ? "text-2xl" : "text-lg"}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}
