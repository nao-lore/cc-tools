"use client";

import { useState, useMemo } from "react";

function formatJPY(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

function formatDecimal(n: number, digits = 1): string {
  return n.toLocaleString("ja-JP", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

interface Inputs {
  arpu: string;
  churnRate: string;
  cac: string;
  grossMargin: string;
}

interface Results {
  ltv: number;
  ratio: number;
  paybackMonths: number;
}

function calcResults(inputs: Inputs): Results | null {
  const arpu = parseFloat(inputs.arpu);
  const churnRate = parseFloat(inputs.churnRate) / 100;
  const cac = parseFloat(inputs.cac);
  const grossMargin = parseFloat(inputs.grossMargin) / 100;

  if (
    isNaN(arpu) || arpu <= 0 ||
    isNaN(churnRate) || churnRate <= 0 || churnRate >= 1 ||
    isNaN(cac) || cac <= 0 ||
    isNaN(grossMargin) || grossMargin <= 0 || grossMargin > 1
  ) {
    return null;
  }

  const ltv = (arpu * grossMargin) / churnRate;
  const ratio = ltv / cac;
  const paybackMonths = cac / (arpu * grossMargin);

  return { ltv, ratio, paybackMonths };
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
        {hint && <span className="ml-1 text-gray-400 font-normal">{hint}</span>}
      </label>
      <div className="flex items-center">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {suffix && (
          <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function HealthBadge({ ratio }: { ratio: number }) {
  if (ratio > 3) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
        ✓ 健全
      </span>
    );
  }
  if (ratio >= 1) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
        △ 要注意
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
      ✕ 危険
    </span>
  );
}

function RatioGauge({ ratio }: { ratio: number }) {
  // Display range 0–6 (anything above 6 is capped visually)
  const pct = Math.min((ratio / 6) * 100, 100);
  const color =
    ratio > 3 ? "bg-green-500" : ratio >= 1 ? "bg-yellow-400" : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>0</span>
        <span>1x</span>
        <span>3x</span>
        <span>6x+</span>
      </div>
      <div className="relative h-3 rounded-full bg-gray-100 overflow-hidden">
        {/* threshold markers */}
        <div className="absolute top-0 left-[16.67%] h-full w-px bg-gray-300" />
        <div className="absolute top-0 left-[50%] h-full w-px bg-gray-300" />
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>危険</span>
        <span className="ml-auto mr-4">要注意</span>
        <span>健全</span>
      </div>
    </div>
  );
}

const defaultInputs: Inputs = {
  arpu: "5000",
  churnRate: "3",
  cac: "30000",
  grossMargin: "70",
};

export default function LtvCacCalculator() {
  const [inputs, setInputs] = useState<Inputs>(defaultInputs);

  const set = (field: keyof Inputs) => (v: string) =>
    setInputs((prev) => ({ ...prev, [field]: v }));

  const results = useMemo(() => calcResults(inputs), [inputs]);

  const ratioColor =
    results === null
      ? "text-gray-400"
      : results.ratio > 3
      ? "text-green-700"
      : results.ratio >= 1
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="space-y-5">
      {/* Input card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">パラメータ入力</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InputField
            label="平均月額単価"
            value={inputs.arpu}
            onChange={set("arpu")}
            placeholder="5000"
            suffix="円/月"
          />
          <InputField
            label="月次解約率"
            value={inputs.churnRate}
            onChange={set("churnRate")}
            placeholder="3"
            suffix="%"
            hint="(Churn Rate)"
          />
          <InputField
            label="顧客獲得コスト"
            value={inputs.cac}
            onChange={set("cac")}
            placeholder="30000"
            suffix="円"
            hint="(CAC)"
          />
          <InputField
            label="粗利率"
            value={inputs.grossMargin}
            onChange={set("grossMargin")}
            placeholder="70"
            suffix="%"
          />
        </div>
      </div>

      {/* Results card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700">計算結果</h2>

        {results ? (
          <>
            {/* KPI grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">LTV（顧客生涯価値）</p>
                <p className="text-xl font-bold text-gray-800">
                  ¥{formatJPY(results.ltv)}
                </p>
              </div>
              <div
                className={`rounded-xl border px-4 py-3 ${
                  results.ratio > 3
                    ? "bg-green-50 border-green-200"
                    : results.ratio >= 1
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <p className="text-xs text-gray-500 mb-1">LTV : CAC 比率</p>
                <div className="flex items-center gap-2">
                  <p className={`text-xl font-bold ${ratioColor}`}>
                    {formatDecimal(results.ratio)}x
                  </p>
                  <HealthBadge ratio={results.ratio} />
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">CAC回収期間</p>
                <p className="text-xl font-bold text-gray-800">
                  {formatDecimal(results.paybackMonths)}ヶ月
                </p>
              </div>
            </div>

            {/* Gauge */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                LTV:CAC 健全性ゲージ
              </p>
              <RatioGauge ratio={results.ratio} />
            </div>

            {/* Verdict */}
            <div
              className={`rounded-xl px-4 py-3 text-sm font-medium ${
                results.ratio > 3
                  ? "bg-green-100 text-green-800"
                  : results.ratio >= 1
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {results.ratio > 3
                ? `LTV:CAC比率 ${formatDecimal(results.ratio)}x — 投資効率が高く、持続的な成長が期待できます。CAC回収まで${formatDecimal(results.paybackMonths)}ヶ月。`
                : results.ratio >= 1
                ? `LTV:CAC比率 ${formatDecimal(results.ratio)}x — 利益は出ていますが、3x以上を目指して解約率低下や単価向上を検討してください。`
                : `LTV:CAC比率 ${formatDecimal(results.ratio)}x — 獲得コストがLTVを上回っています。解約率・単価・獲得コストを見直してください。`}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 px-5 py-6 text-center text-sm text-gray-400">
            有効な値を入力してください
          </div>
        )}
      </div>

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
        広告スペース
      </div>

      {/* Formula explanation */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-2 text-sm text-gray-600">
        <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">計算式</p>
        <p>LTV = 平均月額単価 × 粗利率 ÷ 月次解約率</p>
        <p>LTV:CAC比率 = LTV ÷ CAC</p>
        <p>CAC回収期間 = CAC ÷ (平均月額単価 × 粗利率)</p>
        <p className="text-xs text-gray-400 pt-1">
          目安：比率 &gt; 3x = 健全 / 1〜3x = 要注意 / &lt; 1x = 危険
        </p>
      </div>
    </div>
  );
}
