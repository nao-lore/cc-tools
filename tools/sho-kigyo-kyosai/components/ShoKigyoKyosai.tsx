"use client";

import { useMemo, useState } from "react";

const INCOME_TAX_BRACKETS = [
  { max: 1_950_000, rate: 0.05, deduction: 0 },
  { max: 3_300_000, rate: 0.1, deduction: 97_500 },
  { max: 6_950_000, rate: 0.2, deduction: 427_500 },
  { max: 9_000_000, rate: 0.23, deduction: 636_000 },
  { max: 18_000_000, rate: 0.33, deduction: 1_536_000 },
  { max: 40_000_000, rate: 0.4, deduction: 2_796_000 },
  { max: Infinity, rate: 0.45, deduction: 4_796_000 },
];

const EXAMPLES = [
  { label: "課税所得300万円", taxableIncome: "3000000", monthlyPremium: "30000", months: "12", years: "10" },
  { label: "課税所得600万円", taxableIncome: "6000000", monthlyPremium: "70000", months: "12", years: "20" },
  { label: "開業初年度", taxableIncome: "1500000", monthlyPremium: "10000", months: "6", years: "5" },
  { label: "法人化前の厚め積立", taxableIncome: "9000000", monthlyPremium: "70000", months: "12", years: "15" },
];

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function sanitizeNumber(value: string) {
  return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
}

function formatInput(value: string) {
  const number = parseNumber(value);
  return number ? Math.round(number).toLocaleString("ja-JP") : "";
}

function formatYen(value: number) {
  return `${Math.round(value).toLocaleString("ja-JP")}円`;
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function calcIncomeTax(taxableIncome: number) {
  if (taxableIncome <= 0) return 0;
  const bracket = INCOME_TAX_BRACKETS.find((item) => taxableIncome <= item.max) ?? INCOME_TAX_BRACKETS[0];
  return Math.max(0, Math.floor(taxableIncome * bracket.rate - bracket.deduction));
}

function getBracketRate(taxableIncome: number) {
  return (INCOME_TAX_BRACKETS.find((item) => taxableIncome <= item.max) ?? INCOME_TAX_BRACKETS[0]).rate;
}

type Result = {
  monthlyPremium: number;
  paidMonths: number;
  taxableBefore: number;
  annualDeduction: number;
  taxableAfter: number;
  incomeTaxSaving: number;
  reconstructionSaving: number;
  residentTaxSaving: number;
  totalSaving: number;
  effectiveAnnualBurden: number;
  effectiveMonthlyBurden: number;
  effectiveSavingRate: number;
  marginalRate: number;
  totalPaidOverYears: number;
  totalSavingOverYears: number;
  effectiveBurdenOverYears: number;
};

function buildCopyText(result: Result) {
  return [
    "小規模企業共済 掛金控除の節税概算",
    `月額掛金: ${formatYen(result.monthlyPremium)}`,
    `年間掛金: ${formatYen(result.annualDeduction)}`,
    `控除前の課税所得: ${formatYen(result.taxableBefore)}`,
    `控除後の課税所得: ${formatYen(result.taxableAfter)}`,
    `所得税軽減: ${formatYen(result.incomeTaxSaving)}`,
    `復興特別所得税軽減: ${formatYen(result.reconstructionSaving)}`,
    `住民税軽減: ${formatYen(result.residentTaxSaving)}`,
    `年間節税額: ${formatYen(result.totalSaving)}`,
    `実質年間負担: ${formatYen(result.effectiveAnnualBurden)}`,
    "前提: 掛金全額所得控除、住民税10%の概算。共済金受取時の税金・加入資格・前納減額金は別確認。",
  ].join("\n");
}

function NumberField({
  id,
  label,
  value,
  suffix,
  onChange,
  help,
}: {
  id: string;
  label: string;
  value: string;
  suffix: string;
  onChange: (value: string) => void;
  help?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-emerald-600">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(sanitizeNumber(event.target.value))}
          onBlur={(event) => onChange(formatInput(event.target.value))}
          className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
        />
        <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{suffix}</span>
      </div>
      {help && <p className="mt-1 text-xs leading-5 text-slate-500">{help}</p>}
    </div>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold text-slate-950">{value}</p>
      {note && <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>}
    </div>
  );
}

export default function ShoKigyoKyosai() {
  const [taxableIncome, setTaxableIncome] = useState("3,000,000");
  const [monthlyPremium, setMonthlyPremium] = useState("30,000");
  const [months, setMonths] = useState("12");
  const [years, setYears] = useState("10");
  const [includeResidentTax, setIncludeResidentTax] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo<Result>(() => {
    const monthly = Math.min(70_000, Math.max(1_000, Math.round(parseNumber(monthlyPremium) / 500) * 500));
    const paidMonths = Math.min(12, Math.max(1, Math.round(parseNumber(months) || 12)));
    const taxableBefore = Math.max(0, parseNumber(taxableIncome));
    const annualDeduction = monthly * paidMonths;
    const taxableAfter = Math.max(0, taxableBefore - annualDeduction);
    const incomeTaxSaving = calcIncomeTax(taxableBefore) - calcIncomeTax(taxableAfter);
    const reconstructionSaving = Math.floor(incomeTaxSaving * 0.021);
    const residentTaxSaving = includeResidentTax ? Math.floor((taxableBefore - taxableAfter) * 0.1) : 0;
    const totalSaving = incomeTaxSaving + reconstructionSaving + residentTaxSaving;
    const effectiveAnnualBurden = Math.max(0, annualDeduction - totalSaving);
    const projectionYears = Math.min(40, Math.max(1, Math.round(parseNumber(years) || 10)));

    return {
      monthlyPremium: monthly,
      paidMonths,
      taxableBefore,
      annualDeduction,
      taxableAfter,
      incomeTaxSaving,
      reconstructionSaving,
      residentTaxSaving,
      totalSaving,
      effectiveAnnualBurden,
      effectiveMonthlyBurden: effectiveAnnualBurden / paidMonths,
      effectiveSavingRate: annualDeduction ? totalSaving / annualDeduction : 0,
      marginalRate: getBracketRate(taxableBefore),
      totalPaidOverYears: annualDeduction * projectionYears,
      totalSavingOverYears: totalSaving * projectionYears,
      effectiveBurdenOverYears: effectiveAnnualBurden * projectionYears,
    };
  }, [includeResidentTax, monthlyPremium, months, taxableIncome, years]);

  function applyExample(example: (typeof EXAMPLES)[number]) {
    setTaxableIncome(formatInput(example.taxableIncome));
    setMonthlyPremium(formatInput(example.monthlyPremium));
    setMonths(example.months);
    setYears(example.years);
    setIncludeResidentTax(true);
    setCopied(false);
  }

  function reset() {
    setTaxableIncome("3,000,000");
    setMonthlyPremium("30,000");
    setMonths("12");
    setYears("10");
    setIncludeResidentTax(true);
    setCopied(false);
  }

  async function copyResult() {
    await navigator.clipboard.writeText(buildCopyText(result));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const warning = result.annualDeduction > result.taxableBefore
    ? "掛金控除が課税所得を上回っています。この場合、控除しきれない部分の節税効果は出ません。"
    : "共済金の受取時課税、加入資格、前納減額金、事業廃止時の扱いはこの概算に含めていません。";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">掛金と課税所得</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">小規模企業共済等掛金控除による所得税・住民税の軽減額を概算します。</p>
            </div>
            <button type="button" onClick={reset} className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              クリア
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumberField
              id="taxable-income"
              label="控除前の課税所得"
              value={taxableIncome}
              suffix="円"
              onChange={setTaxableIncome}
              help="ほかの所得控除を引いた後、小規模企業共済控除を入れる前の課税所得です。"
            />
            <NumberField
              id="monthly-premium"
              label="月額掛金"
              value={monthlyPremium}
              suffix="円"
              onChange={setMonthlyPremium}
              help="公式範囲は月1,000円から70,000円、500円単位です。"
            />
            <NumberField id="paid-months" label="今年払う月数" value={months} suffix="か月" onChange={setMonths} />
            <NumberField id="projection-years" label="累計を見る年数" value={years} suffix="年" onChange={setYears} />
          </div>

          <label className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <input type="checkbox" checked={includeResidentTax} onChange={(event) => setIncludeResidentTax(event.target.checked)} className="mt-1" />
            <span>
              <span className="block font-semibold text-slate-900">住民税10%も含める</span>
              <span className="mt-1 block text-slate-600">所得税、復興特別所得税、住民税を合わせた年間軽減額を表示します。</span>
            </span>
          </label>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button key={example.label} type="button" onClick={() => applyExample(example)} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-emerald-600 hover:bg-emerald-50">
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">公式制度の前提</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              掛金は月額1,000円から70,000円の範囲で選べ、支払った掛金は小規模企業共済等掛金控除として全額所得控除の対象です。
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
              <span className="rounded-full bg-white px-3 py-1">500円単位</span>
              <span className="rounded-full bg-white px-3 py-1">年間控除 {formatYen(result.annualDeduction)}</span>
              <span className="rounded-full bg-white px-3 py-1">所得税率 {formatPercent(result.marginalRate)}</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">見積もり</h2>
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-medium text-emerald-900">年間節税額</p>
            <p className="mt-1 font-mono text-5xl font-bold tracking-tight text-emerald-950">{formatYen(result.totalSaving)}</p>
            <p className="mt-2 text-sm text-emerald-900">掛金 {formatYen(result.annualDeduction)} に対して実質軽減率 {formatPercent(result.effectiveSavingRate)}</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatCard label="所得税軽減" value={formatYen(result.incomeTaxSaving)} note="国税庁の速算表で概算" />
            <StatCard label="復興特別所得税" value={formatYen(result.reconstructionSaving)} note="所得税軽減額 × 2.1%" />
            <StatCard label="住民税軽減" value={formatYen(result.residentTaxSaving)} note={includeResidentTax ? "課税所得減少額 × 10%" : "未計算"} />
            <StatCard label="実質月額負担" value={formatYen(result.effectiveMonthlyBurden)} note={`額面掛金 ${formatYen(result.monthlyPremium)}/月`} />
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">累計イメージ</p>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-3">
                <span>累計掛金</span>
                <span className="font-mono text-slate-950">{formatYen(result.totalPaidOverYears)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>累計節税額</span>
                <span className="font-mono text-slate-950">{formatYen(result.totalSavingOverYears)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>税効果後の実質負担</span>
                <span className="font-mono text-slate-950">{formatYen(result.effectiveBurdenOverYears)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">{warning}</div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              {copied ? "コピーしました" : "結果をコピー"}
            </button>
            <button type="button" onClick={reset} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              入力をクリア
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
