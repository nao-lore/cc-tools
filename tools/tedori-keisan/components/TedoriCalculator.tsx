"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

type TedoriInput = {
  grossAnnual: string;
  age: string;
  dependents: string;
  socialInsurance: boolean;
  healthRate: string;
  careRate: string;
  childSupportRate: string;
  employmentRate: string;
};

type TedoriResult = {
  grossAnnualYen: number;
  grossMonthlyYen: number;
  salaryIncome: number;
  incomeTaxable: number;
  residentTaxable: number;
  incomeTax: number;
  residentTax: number;
  healthInsurance: number;
  pensionInsurance: number;
  employmentInsurance: number;
  totalSocialInsurance: number;
  totalDeduction: number;
  netAnnual: number;
  netMonthly: number;
  netRate: number;
  appliedHealthRate: number;
  appliedCareRate: number;
  appliedChildSupportRate: number;
  appliedEmploymentRate: number;
};

const DEFAULT_INPUT: TedoriInput = {
  grossAnnual: "500",
  age: "30",
  dependents: "0",
  socialInsurance: true,
  healthRate: "9.85",
  careRate: "1.62",
  childSupportRate: "0.23",
  employmentRate: "0.50",
};

const SAMPLES = [
  { label: "年収300万 / 25歳", grossAnnual: "300", age: "25", dependents: "0" },
  { label: "年収500万 / 35歳", grossAnnual: "500", age: "35", dependents: "0" },
  { label: "年収800万 / 45歳 / 扶養1", grossAnnual: "800", age: "45", dependents: "1" },
];

function toNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sanitizeInteger(value: string, maxLength = 4) {
  return value.replace(/[^\d]/g, "").slice(0, maxLength);
}

function sanitizeDecimal(value: string) {
  const next = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
  return next.slice(0, 6);
}

function fmt(value: number) {
  return Math.round(value).toLocaleString("ja-JP");
}

function salaryIncomeDeduction(gross: number) {
  if (gross <= 1_900_000) return Math.min(650_000, gross);
  if (gross <= 3_600_000) return Math.floor(gross * 0.3 + 80_000);
  if (gross <= 6_600_000) return Math.floor(gross * 0.2 + 440_000);
  if (gross <= 8_500_000) return Math.floor(gross * 0.1 + 1_100_000);
  return 1_950_000;
}

function incomeBasicDeduction(totalIncome: number) {
  if (totalIncome <= 1_320_000) return 950_000;
  if (totalIncome <= 3_360_000) return 880_000;
  if (totalIncome <= 4_890_000) return 680_000;
  if (totalIncome <= 6_550_000) return 630_000;
  if (totalIncome <= 23_500_000) return 580_000;
  if (totalIncome <= 24_000_000) return 480_000;
  if (totalIncome <= 24_500_000) return 320_000;
  if (totalIncome <= 25_000_000) return 160_000;
  return 0;
}

function residentBasicDeduction(totalIncome: number) {
  if (totalIncome <= 24_000_000) return 430_000;
  if (totalIncome <= 24_500_000) return 290_000;
  if (totalIncome <= 25_000_000) return 150_000;
  return 0;
}

function progressiveIncomeTax(taxable: number) {
  const rounded = Math.floor(taxable / 1000) * 1000;
  if (rounded <= 0) return 0;
  if (rounded <= 1_949_000) return rounded * 0.05;
  if (rounded <= 3_299_000) return rounded * 0.1 - 97_500;
  if (rounded <= 6_949_000) return rounded * 0.2 - 427_500;
  if (rounded <= 8_999_000) return rounded * 0.23 - 636_000;
  if (rounded <= 17_999_000) return rounded * 0.33 - 1_536_000;
  if (rounded <= 39_999_000) return rounded * 0.4 - 2_796_000;
  return rounded * 0.45 - 4_796_000;
}

function validate(input: TedoriInput) {
  const annual = toNumber(input.grossAnnual);
  const age = toNumber(input.age);
  const dependents = toNumber(input.dependents);

  if (!input.grossAnnual || !input.age) return "額面年収と年齢を入力してください。";
  if (annual < 50 || annual > 5000) return "額面年収は50万円〜5000万円の範囲で入力してください。";
  if (age < 15 || age > 75) return "年齢は15〜75歳の範囲で入力してください。";
  if (dependents < 0 || dependents > 5) return "扶養人数は0〜5人の範囲で指定してください。";
  if (input.socialInsurance) {
    for (const [label, value] of [
      ["健康保険料率", input.healthRate],
      ["介護保険料率", input.careRate],
      ["子ども・子育て支援金率", input.childSupportRate],
      ["雇用保険料率", input.employmentRate],
    ] as const) {
      const rate = toNumber(value);
      if (rate < 0 || rate > 30) return `${label}は0〜30%の範囲で入力してください。`;
    }
  }
  return "";
}

function calculateTedori(input: TedoriInput): TedoriResult | null {
  if (validate(input)) return null;

  const grossAnnualYen = toNumber(input.grossAnnual) * 10_000;
  const age = toNumber(input.age);
  const dependents = toNumber(input.dependents);
  const grossMonthlyYen = grossAnnualYen / 12;
  const salaryIncome = Math.max(0, grossAnnualYen - salaryIncomeDeduction(grossAnnualYen));

  const healthRate = toNumber(input.healthRate);
  const careRate = age >= 40 && age < 65 ? toNumber(input.careRate) : 0;
  const childSupportRate = toNumber(input.childSupportRate);
  const employmentRate = toNumber(input.employmentRate);

  let healthInsurance = 0;
  let pensionInsurance = 0;
  let employmentInsurance = 0;

  if (input.socialInsurance) {
    const healthBaseMonthly = Math.min(grossMonthlyYen, 1_390_000);
    const pensionBaseMonthly = Math.min(grossMonthlyYen, 650_000);
    const healthTotalRate = (healthRate + careRate + childSupportRate) / 100 / 2;
    healthInsurance = Math.round(healthBaseMonthly * healthTotalRate) * 12;
    pensionInsurance = Math.round(pensionBaseMonthly * 0.183 / 2) * 12;
    employmentInsurance = Math.round(grossAnnualYen * (employmentRate / 100));
  }

  const totalSocialInsurance = healthInsurance + pensionInsurance + employmentInsurance;
  const incomeDependentDeduction = dependents * 380_000;
  const residentDependentDeduction = dependents * 330_000;

  const incomeTaxable = Math.max(0, salaryIncome - incomeBasicDeduction(salaryIncome) - incomeDependentDeduction - totalSocialInsurance);
  const residentTaxable = Math.max(0, salaryIncome - residentBasicDeduction(salaryIncome) - residentDependentDeduction - totalSocialInsurance);
  const incomeTax = Math.round(progressiveIncomeTax(incomeTaxable) * 1.021);
  const residentTax = residentTaxable > 0 ? Math.round(Math.floor(residentTaxable / 1000) * 1000 * 0.1) + 5000 : 0;
  const totalDeduction = incomeTax + residentTax + totalSocialInsurance;
  const netAnnual = Math.max(0, grossAnnualYen - totalDeduction);

  return {
    grossAnnualYen,
    grossMonthlyYen: Math.round(grossMonthlyYen),
    salaryIncome,
    incomeTaxable,
    residentTaxable,
    incomeTax,
    residentTax,
    healthInsurance,
    pensionInsurance,
    employmentInsurance,
    totalSocialInsurance,
    totalDeduction,
    netAnnual,
    netMonthly: Math.round(netAnnual / 12),
    netRate: grossAnnualYen ? (netAnnual / grossAnnualYen) * 100 : 0,
    appliedHealthRate: healthRate,
    appliedCareRate: careRate,
    appliedChildSupportRate: childSupportRate,
    appliedEmploymentRate: employmentRate,
  };
}

function buildCopyText(result: TedoriResult, input: TedoriInput) {
  return [
    `額面年収: ${fmt(result.grossAnnualYen)}円`,
    `年齢: ${input.age}歳`,
    `扶養人数: ${input.dependents}人`,
    `手取り年収: ${fmt(result.netAnnual)}円`,
    `手取り月額: ${fmt(result.netMonthly)}円`,
    `手取り率: ${result.netRate.toFixed(1)}%`,
    `所得税: ${fmt(result.incomeTax)}円`,
    `住民税: ${fmt(result.residentTax)}円`,
    `社会保険料: ${fmt(result.totalSocialInsurance)}円`,
  ].join("\n");
}

export default function TedoriCalculator() {
  const [input, setInput] = useState<TedoriInput>(DEFAULT_INPUT);
  const [copied, setCopied] = useState(false);
  const error = useMemo(() => validate(input), [input]);
  const result = useMemo(() => calculateTedori(input), [input]);

  function setField(key: keyof TedoriInput, value: string | boolean) {
    setInput((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  }

  function applySample(sample: (typeof SAMPLES)[number]) {
    setInput((prev) => ({
      ...prev,
      grossAnnual: sample.grossAnnual,
      age: sample.age,
      dependents: sample.dependents,
    }));
    setCopied(false);
  }

  function reset() {
    setInput(DEFAULT_INPUT);
    setCopied(false);
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(buildCopyText(result, input));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.72fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 xl:border-b-0 xl:border-r">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">給与条件</h2>
              <p className="mt-1 text-sm text-slate-500">会社員の給与所得者向けに、年収から手取りを概算します。</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="w-fit whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              リセット
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextField
              label="額面年収"
              value={input.grossAnnual}
              onChange={(value) => setField("grossAnnual", sanitizeInteger(value, 5))}
              suffix="万円"
              placeholder="500"
              required
            />
            <TextField
              label="年齢"
              value={input.age}
              onChange={(value) => setField("age", sanitizeInteger(value, 2))}
              suffix="歳"
              placeholder="30"
              required
            />
            <div>
              <label htmlFor="tedori-dependents" className="text-sm font-semibold text-slate-800">
                扶養人数
              </label>
              <select
                id="tedori-dependents"
                value={input.dependents}
                onChange={(event) => setField("dependents", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-950"
              >
                {[0, 1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={String(value)}>
                    {value}人
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-800">社会保険</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <ToggleButton active={input.socialInsurance} onClick={() => setField("socialInsurance", true)}>
                  加入
                </ToggleButton>
                <ToggleButton active={!input.socialInsurance} onClick={() => setField("socialInsurance", false)}>
                  未加入
                </ToggleButton>
              </div>
            </div>
          </div>

          <p className={`mt-3 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
            {error || "2026年度の公開料率を初期値にした概算です。入力値はブラウザ上で計算され、外部に送信されません。"}
          </p>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SAMPLES.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => applySample(sample)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-950 hover:bg-slate-50"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <details className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-800">料率の詳細設定</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <RateField label="健康保険料率" value={input.healthRate} onChange={(value) => setField("healthRate", sanitizeDecimal(value))} />
              <RateField label="介護保険料率" value={input.careRate} onChange={(value) => setField("careRate", sanitizeDecimal(value))} />
              <RateField label="子ども・子育て支援金率" value={input.childSupportRate} onChange={(value) => setField("childSupportRate", sanitizeDecimal(value))} />
              <RateField label="雇用保険料率（本人負担）" value={input.employmentRate} onChange={(value) => setField("employmentRate", sanitizeDecimal(value))} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              健康保険・介護保険・子ども子育て支援金は総料率を入力し、本人負担は半分として計算します。40歳以上65歳未満のときだけ介護保険料率を加算します。
            </p>
          </details>

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
              入力をクリア
            </button>
          </div>
        </div>

        <aside className="p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">計算結果</h2>
          {!result ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">入力値を確認してください。</div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
                <p className="text-sm font-medium opacity-80">手取り月額</p>
                <p className="mt-1 font-mono text-4xl font-bold">¥{fmt(result.netMonthly)}</p>
                <p className="mt-2 text-sm">年額 ¥{fmt(result.netAnnual)} / 手取り率 {result.netRate.toFixed(1)}%</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="額面年収" value={`¥${fmt(result.grossAnnualYen)}`} />
                <Metric label="給与所得" value={`¥${fmt(result.salaryIncome)}`} />
                <Metric label="所得税" value={`-¥${fmt(result.incomeTax)}`} negative />
                <Metric label="住民税" value={`-¥${fmt(result.residentTax)}`} negative />
                <Metric label="社会保険料" value={`-¥${fmt(result.totalSocialInsurance)}`} negative />
                <Metric label="控除合計" value={`-¥${fmt(result.totalDeduction)}`} negative />
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">社会保険料の内訳</p>
                <div className="mt-2 divide-y divide-slate-200 text-sm">
                  <Breakdown label={`健康保険等（${(result.appliedHealthRate + result.appliedCareRate + result.appliedChildSupportRate).toFixed(2)}% ÷ 2）`} value={result.healthInsurance} />
                  <Breakdown label="厚生年金（18.3% ÷ 2）" value={result.pensionInsurance} />
                  <Breakdown label={`雇用保険（${result.appliedEmploymentRate.toFixed(2)}%）`} value={result.employmentInsurance} />
                </div>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                賞与、通勤手当、標準報酬月額の等級、勤務先の健康保険組合、自治体独自の均等割は反映していません。給与明細や公式計算とは差が出ます。
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  suffix,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-950">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 px-3 py-3 text-right font-mono outline-none"
        />
        <span className="border-l border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">{suffix}</span>
      </div>
    </label>
  );
}

function RateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <div className="mt-1 flex overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-slate-950">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 px-3 py-2 text-right font-mono text-sm outline-none"
        />
        <span className="border-l border-slate-200 bg-slate-50 px-2 py-2 text-xs text-slate-500">%</span>
      </div>
    </label>
  );
}

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
        active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-950"
      }`}
    >
      {children}
    </button>
  );
}

function Metric({ label, value, negative = false }: { label: string; value: string; negative?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 font-mono text-lg font-semibold ${negative ? "text-red-600" : "text-slate-950"}`}>{value}</p>
    </div>
  );
}

function Breakdown({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-mono font-semibold text-red-600">-¥{fmt(value)}</span>
    </div>
  );
}
