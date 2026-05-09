"use client";

import { useMemo, useState } from "react";

type InterestType = "simple" | "compound";
type PeriodUnit = "year" | "month";
type CompoundFrequency = "annually" | "semiannually" | "quarterly" | "monthly" | "daily";
type CopiedTarget = "summary" | "csv" | null;

type Inputs = {
  principal: string;
  annualRate: string;
  period: string;
  periodUnit: PeriodUnit;
  interestType: InterestType;
  compoundFrequency: CompoundFrequency;
  taxEnabled: boolean;
  taxRate: string;
};

type YearlyRow = {
  label: string;
  startBalance: number;
  grossInterest: number;
  estimatedTax: number;
  endBalanceBeforeTax: number;
};

type Result = {
  principal: number;
  years: number;
  grossInterest: number;
  estimatedTax: number;
  netInterest: number;
  totalBeforeTax: number;
  totalAfterTax: number;
  effectiveAnnualRate: number;
  totalReturnRate: number;
  yearlyRows: YearlyRow[];
};

const DEFAULT_INPUTS: Inputs = {
  principal: "1000000",
  annualRate: "3",
  period: "10",
  periodUnit: "year",
  interestType: "compound",
  compoundFrequency: "annually",
  taxEnabled: true,
  taxRate: "20.315",
};

const EXAMPLES: Array<{ label: string; inputs: Inputs }> = [
  {
    label: "100万円を年3%で10年",
    inputs: { ...DEFAULT_INPUTS, principal: "1000000", annualRate: "3", period: "10", compoundFrequency: "annually" },
  },
  {
    label: "定期預金 300万円を0.25%で5年",
    inputs: { ...DEFAULT_INPUTS, principal: "3000000", annualRate: "0.25", period: "5", compoundFrequency: "annually" },
  },
  {
    label: "半年複利で20年運用",
    inputs: { ...DEFAULT_INPUTS, principal: "500000", annualRate: "4", period: "20", compoundFrequency: "semiannually" },
  },
];

const COMPOUND_FREQUENCIES: Record<CompoundFrequency, { label: string; periodsPerYear: number; note: string }> = {
  annually: { label: "年1回", periodsPerYear: 1, note: "定期預金などの比較に使いやすい" },
  semiannually: { label: "半年ごと", periodsPerYear: 2, note: "年2回利息を組み入れる想定" },
  quarterly: { label: "四半期ごと", periodsPerYear: 4, note: "年4回利息を組み入れる想定" },
  monthly: { label: "毎月", periodsPerYear: 12, note: "月次で利息を組み入れる想定" },
  daily: { label: "毎日", periodsPerYear: 365, note: "日次複利の概算" },
};

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function sanitizeDecimal(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [first, ...rest] = cleaned.split(".");
  return rest.length ? `${first}.${rest.join("")}` : first;
}

function formatYen(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function formatNumber(value: number, digits = 2) {
  return new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function formatPercent(value: number, digits = 3) {
  return `${formatNumber(value, digits)}%`;
}

function validate(inputs: Inputs) {
  const principal = parseNumber(inputs.principal);
  const annualRate = parseNumber(inputs.annualRate);
  const period = parseNumber(inputs.period);
  const taxRate = parseNumber(inputs.taxRate);
  const years = inputs.periodUnit === "year" ? period : period / 12;

  if (!inputs.principal || principal <= 0) return "入力エラー: 元金は1円以上で入力してください。";
  if (principal > 1_000_000_000_000) return "入力エラー: 元金は1兆円以下で入力してください。";
  if (!inputs.annualRate && inputs.annualRate !== "0") return "入力エラー: 年利率を入力してください。";
  if (annualRate < -99 || annualRate > 100) return "入力エラー: 年利率は -99%〜100% の範囲で入力してください。";
  if (!inputs.period || period <= 0) return "入力エラー: 期間は0より大きい値で入力してください。";
  if (years > 200) return "入力エラー: 期間は200年以内で入力してください。";
  if (inputs.taxEnabled && (taxRate < 0 || taxRate > 100)) {
    return "入力エラー: 税率は0%〜100%の範囲で入力してください。";
  }

  const n = COMPOUND_FREQUENCIES[inputs.compoundFrequency].periodsPerYear;
  const base = 1 + annualRate / 100 / n;
  if (inputs.interestType === "compound" && base <= 0) {
    return "入力エラー: この年利率と複利頻度では計算できません。";
  }

  return "";
}

function calculate(inputs: Inputs): Result | null {
  const error = validate(inputs);
  if (error) return null;

  const principal = parseNumber(inputs.principal);
  const annualRate = parseNumber(inputs.annualRate);
  const period = parseNumber(inputs.period);
  const taxRate = inputs.taxEnabled ? parseNumber(inputs.taxRate) : 0;
  const years = inputs.periodUnit === "year" ? period : period / 12;
  const r = annualRate / 100;
  const n = COMPOUND_FREQUENCIES[inputs.compoundFrequency].periodsPerYear;
  const yearlyRows: YearlyRow[] = [];

  const totalBeforeTax =
    inputs.interestType === "simple"
      ? principal * (1 + r * years)
      : principal * Math.pow(1 + r / n, n * years);
  const grossInterest = totalBeforeTax - principal;
  const estimatedTax = inputs.taxEnabled ? Math.floor(Math.max(0, grossInterest) * (taxRate / 100)) : 0;
  const netInterest = grossInterest - estimatedTax;
  const totalAfterTax = principal + netInterest;
  const effectiveAnnualRate =
    inputs.interestType === "simple" ? annualRate : (Math.pow(1 + r / n, n) - 1) * 100;
  const totalReturnRate = principal > 0 ? (grossInterest / principal) * 100 : 0;

  const fullYears = Math.floor(years);
  const fractionalYear = years - fullYears;
  let startBalance = principal;
  const maxRows = Math.min(fullYears, 40);

  for (let year = 1; year <= maxRows; year += 1) {
    const endBalance =
      inputs.interestType === "simple"
        ? principal * (1 + r * year)
        : startBalance * Math.pow(1 + r / n, n);
    const gross = endBalance - startBalance;
    yearlyRows.push({
      label: `${year}年目`,
      startBalance,
      grossInterest: gross,
      estimatedTax: inputs.taxEnabled ? Math.floor(Math.max(0, gross) * (taxRate / 100)) : 0,
      endBalanceBeforeTax: endBalance,
    });
    startBalance = endBalance;
  }

  if (fullYears > maxRows) {
    yearlyRows.push({
      label: `${fullYears}年目まで省略`,
      startBalance,
      grossInterest: 0,
      estimatedTax: 0,
      endBalanceBeforeTax: inputs.interestType === "simple" ? principal * (1 + r * fullYears) : principal * Math.pow(1 + r / n, n * fullYears),
    });
    startBalance = yearlyRows[yearlyRows.length - 1].endBalanceBeforeTax;
  }

  if (fractionalYear > 0.0001) {
    const endBalance =
      inputs.interestType === "simple"
        ? principal * (1 + r * years)
        : startBalance * Math.pow(1 + r / n, n * fractionalYear);
    const gross = endBalance - startBalance;
    yearlyRows.push({
      label: `${formatNumber(years, 2)}年目`,
      startBalance,
      grossInterest: gross,
      estimatedTax: inputs.taxEnabled ? Math.floor(Math.max(0, gross) * (taxRate / 100)) : 0,
      endBalanceBeforeTax: endBalance,
    });
  }

  return {
    principal,
    years,
    grossInterest,
    estimatedTax,
    netInterest,
    totalBeforeTax,
    totalAfterTax,
    effectiveAnnualRate,
    totalReturnRate,
    yearlyRows,
  };
}

function makeCsv(result: Result, inputs: Inputs) {
  const rows = [
    ["項目", "値"],
    ["元金", Math.round(result.principal).toString()],
    ["年利率", `${inputs.annualRate}%`],
    ["期間", `${formatNumber(result.years, 3)}年`],
    ["計算方式", inputs.interestType === "simple" ? "単利" : "複利"],
    ["複利頻度", inputs.interestType === "compound" ? COMPOUND_FREQUENCIES[inputs.compoundFrequency].label : ""],
    ["利息合計(税引前)", Math.round(result.grossInterest).toString()],
    ["概算税額", Math.round(result.estimatedTax).toString()],
    ["利息合計(税引後)", Math.round(result.netInterest).toString()],
    ["元利合計(税引前)", Math.round(result.totalBeforeTax).toString()],
    ["元利合計(税引後)", Math.round(result.totalAfterTax).toString()],
    [],
    ["年", "期首残高", "利息(税引前)", "概算税額", "期末残高(税引前)"],
    ...result.yearlyRows.map((row) => [
      row.label,
      Math.round(row.startBalance).toString(),
      Math.round(row.grossInterest).toString(),
      Math.round(row.estimatedTax).toString(),
      Math.round(row.endBalanceBeforeTax).toString(),
    ]),
  ];

  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function buildSummary(result: Result, inputs: Inputs) {
  return [
    "利息計算結果",
    `元金: ${formatYen(result.principal)}`,
    `年利率: ${inputs.annualRate}%`,
    `期間: ${formatNumber(result.years, 3)}年`,
    `方式: ${inputs.interestType === "simple" ? "単利" : `複利（${COMPOUND_FREQUENCIES[inputs.compoundFrequency].label}）`}`,
    `利息合計（税引前）: ${formatYen(result.grossInterest)}`,
    `概算税額: ${formatYen(result.estimatedTax)}`,
    `利息合計（税引後）: ${formatYen(result.netInterest)}`,
    `元利合計（税引前）: ${formatYen(result.totalBeforeTax)}`,
    `元利合計（税引後）: ${formatYen(result.totalAfterTax)}`,
  ].join("\n");
}

export default function InterestCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [copiedTarget, setCopiedTarget] = useState<CopiedTarget>(null);
  const error = validate(inputs);
  const result = useMemo(() => calculate(inputs), [inputs]);
  const csv = result ? makeCsv(result, inputs) : "";
  const summary = result ? buildSummary(result, inputs) : "";

  function set<K extends keyof Inputs>(key: K, value: Inputs[K]) {
    setInputs((previous) => ({ ...previous, [key]: value }));
    setCopiedTarget(null);
  }

  async function copy(text: string, target: CopiedTarget) {
    if (!text || !target) return;
    await navigator.clipboard.writeText(text);
    setCopiedTarget(target);
    window.setTimeout(() => setCopiedTarget(null), 1600);
  }

  function downloadCsv() {
    if (!csv) return;
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "interest-calculation.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setInputs(DEFAULT_INPUTS);
    setCopiedTarget(null);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">シミュレーション条件</h2>
              <p className="mt-1 text-sm text-slate-500">単利・複利・概算税額をまとめて計算します。</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              リセット
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <NumberInput
              id="interest-principal"
              label="元金"
              suffix="円"
              value={inputs.principal}
              onChange={(value) => set("principal", sanitizeDecimal(value))}
              placeholder="1000000"
            />
            <NumberInput
              id="interest-rate"
              label="年利率"
              suffix="%"
              value={inputs.annualRate}
              onChange={(value) => set("annualRate", sanitizeDecimal(value))}
              placeholder="3"
            />
            <div>
              <label htmlFor="interest-period" className="text-sm font-medium text-slate-700">
                期間
              </label>
              <div className="mt-2 grid grid-cols-[minmax(0,1fr)_104px] gap-2">
                <input
                  id="interest-period"
                  type="text"
                  inputMode="decimal"
                  value={inputs.period}
                  onChange={(event) => set("period", sanitizeDecimal(event.target.value))}
                  className="min-w-0 rounded-xl border border-slate-300 px-4 py-3 text-right font-mono text-lg outline-none focus:border-slate-900"
                  aria-describedby="interest-input-error"
                />
                <select
                  value={inputs.periodUnit}
                  onChange={(event) => set("periodUnit", event.target.value as PeriodUnit)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-900"
                >
                  <option value="year">年</option>
                  <option value="month">ヶ月</option>
                </select>
              </div>
            </div>
          </div>

          <fieldset className="mt-5">
            <legend className="text-sm font-medium text-slate-700">計算方式</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["simple", "compound"] as InterestType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set("interestType", type)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                    inputs.interestType === type
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 text-slate-700 hover:border-slate-900"
                  }`}
                >
                  {type === "simple" ? "単利" : "複利"}
                </button>
              ))}
            </div>
          </fieldset>

          {inputs.interestType === "compound" && (
            <div className="mt-4">
              <label htmlFor="compound-frequency" className="text-sm font-medium text-slate-700">
                複利頻度
              </label>
              <select
                id="compound-frequency"
                value={inputs.compoundFrequency}
                onChange={(event) => set("compoundFrequency", event.target.value as CompoundFrequency)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-900"
              >
                {(Object.keys(COMPOUND_FREQUENCIES) as CompoundFrequency[]).map((frequency) => (
                  <option key={frequency} value={frequency}>
                    {COMPOUND_FREQUENCIES[frequency].label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">{COMPOUND_FREQUENCIES[inputs.compoundFrequency].note}</p>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex items-center justify-between gap-3 text-sm font-medium text-slate-800">
              <span>利息税を概算する</span>
              <input
                type="checkbox"
                checked={inputs.taxEnabled}
                onChange={(event) => set("taxEnabled", event.target.checked)}
                className="h-4 w-4 accent-slate-950"
              />
            </label>
            {inputs.taxEnabled && (
              <div className="mt-3">
                <NumberInput
                  id="interest-tax-rate"
                  label="概算税率"
                  suffix="%"
                  value={inputs.taxRate}
                  onChange={(value) => set("taxRate", sanitizeDecimal(value))}
                  placeholder="20.315"
                />
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  預貯金などの利子で一般的に使われる 20.315% を初期値にしています。商品や制度により扱いが異なるため、必要に応じて変更してください。
                </p>
              </div>
            )}
          </div>

          <p id="interest-input-error" className={`mt-3 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
            {error || "計算はブラウザ上で完結し、入力値を外部に送信しません。"}
          </p>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => {
                    setInputs(example.inputs);
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
          {!result ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <div>
                <p className="text-sm font-medium text-slate-700">入力を確認してください</p>
                <p className="mt-1 text-sm text-slate-500">元金、年利率、期間を入れると結果が表示されます。</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
                <p className="text-sm font-medium text-emerald-700">元利合計（税引後）</p>
                <p className="mt-1 text-4xl font-bold tracking-tight">{formatYen(result.totalAfterTax)}</p>
                <p className="mt-2 text-sm text-emerald-800">
                  税引前は {formatYen(result.totalBeforeTax)}、利息合計は {formatYen(result.grossInterest)} です。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard label="利息合計（税引前）" value={formatYen(result.grossInterest)} note={`総利回り ${formatPercent(result.totalReturnRate, 2)}`} />
                <ResultCard label="概算税額" value={formatYen(result.estimatedTax)} note={inputs.taxEnabled ? `税率 ${inputs.taxRate}%` : "税計算なし"} />
                <ResultCard label="利息合計（税引後）" value={formatYen(result.netInterest)} note="受取利息の概算" />
                <ResultCard label="実効年利率" value={formatPercent(result.effectiveAnnualRate)} note={inputs.interestType === "compound" ? "複利頻度を反映" : "単利の年率"} />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">計算メモ</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {inputs.interestType === "compound"
                    ? `複利は ${COMPOUND_FREQUENCIES[inputs.compoundFrequency].label} で利息を元本に組み入れる想定です。`
                    : "単利は元金に対してだけ利息が発生する想定です。"}
                  税額は利息合計に税率を掛けた概算で、1円未満を切り捨てています。
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copy(summary, "summary")}
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  {copiedTarget === "summary" ? "コピーしました" : "結果をコピー"}
                </button>
                <button
                  type="button"
                  onClick={() => copy(csv, "csv")}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copiedTarget === "csv" ? "CSVコピー済み" : "CSVをコピー"}
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

      {result && (
        <div className="border-t border-slate-200 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">年次推移</h2>
              <p className="mt-1 text-sm text-slate-500">表示は税引前残高です。税額は各年利息に税率を掛けた概算です。</p>
            </div>
            <p className="text-xs text-slate-500">長期の場合は最大40行まで表示します。</p>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-2 pr-3 text-left font-medium">年</th>
                  <th className="px-3 py-2 text-right font-medium">期首残高</th>
                  <th className="px-3 py-2 text-right font-medium">利息（税引前）</th>
                  <th className="px-3 py-2 text-right font-medium">概算税額</th>
                  <th className="py-2 pl-3 text-right font-medium">期末残高（税引前）</th>
                </tr>
              </thead>
              <tbody>
                {result.yearlyRows.map((row) => (
                  <tr key={row.label} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-3 text-slate-600">{row.label}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatYen(row.startBalance)}</td>
                    <td className="px-3 py-2 text-right font-mono text-emerald-700">+{formatYen(row.grossInterest)}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-600">{formatYen(row.estimatedTax)}</td>
                    <td className="py-2 pl-3 text-right font-mono font-semibold">{formatYen(row.endBalanceBeforeTax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function NumberInput({
  id,
  label,
  suffix,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  suffix: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
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
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
          aria-describedby="interest-input-error"
        />
        <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{suffix}</span>
      </div>
    </div>
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
