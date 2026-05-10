"use client";

import { useMemo, useState } from "react";

type AccountType = "nisa" | "taxable";
type ContributionTiming = "end" | "beginning";
type CopiedTarget = "summary" | "csv" | null;

type Inputs = {
  monthly: string;
  initial: string;
  annualRate: string;
  annualCost: string;
  years: string;
  accountType: AccountType;
  taxRate: string;
  contributionTiming: ContributionTiming;
};

type YearlyRow = {
  year: number;
  principal: number;
  grossGain: number;
  estimatedTax: number;
  totalBeforeTax: number;
  totalAfterTax: number;
};

type SimulationResult = {
  monthly: number;
  initial: number;
  years: number;
  netAnnualRate: number;
  totalPrincipal: number;
  grossGain: number;
  estimatedTax: number;
  netGain: number;
  finalBeforeTax: number;
  finalAfterTax: number;
  gainRate: number;
  nisaAnnualUsage: number;
  nisaLifetimeUsage: number;
  yearlyRows: YearlyRow[];
};

const DEFAULT_INPUTS: Inputs = {
  monthly: "50000",
  initial: "0",
  annualRate: "5",
  annualCost: "0.2",
  years: "20",
  accountType: "nisa",
  taxRate: "20.315",
  contributionTiming: "end",
};

const EXAMPLES: Array<{ label: string; inputs: Inputs }> = [
  {
    label: "月5万円を20年",
    inputs: { ...DEFAULT_INPUTS, monthly: "50000", annualRate: "5", annualCost: "0.2", years: "20" },
  },
  {
    label: "新NISA枠 月10万円",
    inputs: { ...DEFAULT_INPUTS, monthly: "100000", annualRate: "4", annualCost: "0.15", years: "15" },
  },
  {
    label: "課税口座で30年",
    inputs: { ...DEFAULT_INPUTS, accountType: "taxable", monthly: "30000", annualRate: "6", annualCost: "0.3", years: "30" },
  },
];

const NISA_ANNUAL_LIMIT = 1_200_000;
const NISA_LIFETIME_LIMIT = 18_000_000;

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

function formatNumber(value: number, digits = 1) {
  return new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function formatPercent(value: number, digits = 2) {
  return `${formatNumber(value, digits)}%`;
}

function validate(inputs: Inputs) {
  const monthly = parseNumber(inputs.monthly);
  const initial = parseNumber(inputs.initial);
  const annualRate = parseNumber(inputs.annualRate);
  const annualCost = parseNumber(inputs.annualCost);
  const years = parseNumber(inputs.years);
  const taxRate = parseNumber(inputs.taxRate);

  if (!inputs.monthly || monthly <= 0) return "入力エラー: 毎月の積立額は1円以上で入力してください。";
  if (monthly > 10_000_000) return "入力エラー: 毎月の積立額は1,000万円以下で入力してください。";
  if (initial < 0 || initial > 1_000_000_000) return "入力エラー: 初期投資額は0円〜10億円の範囲で入力してください。";
  if (!inputs.annualRate && inputs.annualRate !== "0") return "入力エラー: 想定年利を入力してください。";
  if (annualRate < -50 || annualRate > 50) return "入力エラー: 想定年利は -50%〜50% の範囲で入力してください。";
  if (annualCost < 0 || annualCost > 10) return "入力エラー: 年コストは0%〜10%の範囲で入力してください。";
  if (!inputs.years || years <= 0) return "入力エラー: 積立期間は0より大きい値で入力してください。";
  if (years > 80) return "入力エラー: 積立期間は80年以内で入力してください。";
  if (inputs.accountType === "taxable" && (taxRate < 0 || taxRate > 100)) {
    return "入力エラー: 税率は0%〜100%の範囲で入力してください。";
  }
  if (1 + (annualRate - annualCost) / 100 / 12 <= 0) return "入力エラー: 年利とコストの組み合わせで計算できません。";

  return "";
}

function calculate(inputs: Inputs): SimulationResult | null {
  const error = validate(inputs);
  if (error) return null;

  const monthly = parseNumber(inputs.monthly);
  const initial = parseNumber(inputs.initial);
  const annualRate = parseNumber(inputs.annualRate);
  const annualCost = parseNumber(inputs.annualCost);
  const years = Math.floor(parseNumber(inputs.years));
  const taxRate = inputs.accountType === "taxable" ? parseNumber(inputs.taxRate) : 0;
  const netAnnualRate = annualRate - annualCost;
  const monthlyRate = netAnnualRate / 100 / 12;
  const yearlyRows: YearlyRow[] = [];

  let balance = initial;
  let principal = initial;

  for (let year = 1; year <= years; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      if (inputs.contributionTiming === "beginning") {
        balance += monthly;
        principal += monthly;
        balance *= 1 + monthlyRate;
      } else {
        balance *= 1 + monthlyRate;
        balance += monthly;
        principal += monthly;
      }
    }

    const grossGain = balance - principal;
    const estimatedTax = inputs.accountType === "taxable" ? Math.floor(Math.max(0, grossGain) * (taxRate / 100)) : 0;
    yearlyRows.push({
      year,
      principal,
      grossGain,
      estimatedTax,
      totalBeforeTax: balance,
      totalAfterTax: principal + grossGain - estimatedTax,
    });
  }

  const totalPrincipal = principal;
  const grossGain = balance - totalPrincipal;
  const estimatedTax = inputs.accountType === "taxable" ? Math.floor(Math.max(0, grossGain) * (taxRate / 100)) : 0;
  const netGain = grossGain - estimatedTax;
  const finalBeforeTax = balance;
  const finalAfterTax = totalPrincipal + netGain;
  const gainRate = totalPrincipal > 0 ? (grossGain / totalPrincipal) * 100 : 0;
  const nisaAnnualUsage = monthly * 12;
  const nisaLifetimeUsage = monthly * 12 * years + initial;

  return {
    monthly,
    initial,
    years,
    netAnnualRate,
    totalPrincipal,
    grossGain,
    estimatedTax,
    netGain,
    finalBeforeTax,
    finalAfterTax,
    gainRate,
    nisaAnnualUsage,
    nisaLifetimeUsage,
    yearlyRows,
  };
}

function makeCsv(result: SimulationResult, inputs: Inputs) {
  const rows = [
    ["項目", "値"],
    ["毎月の積立額", Math.round(result.monthly).toString()],
    ["初期投資額", Math.round(result.initial).toString()],
    ["想定年利", `${inputs.annualRate}%`],
    ["年コスト", `${inputs.annualCost}%`],
    ["実質年利", `${formatNumber(result.netAnnualRate, 3)}%`],
    ["積立期間", `${result.years}年`],
    ["口座区分", inputs.accountType === "nisa" ? "NISA/非課税" : "課税口座"],
    ["元本合計", Math.round(result.totalPrincipal).toString()],
    ["運用益(税引前)", Math.round(result.grossGain).toString()],
    ["概算税額", Math.round(result.estimatedTax).toString()],
    ["運用益(税引後)", Math.round(result.netGain).toString()],
    ["最終金額(税引前)", Math.round(result.finalBeforeTax).toString()],
    ["最終金額(税引後)", Math.round(result.finalAfterTax).toString()],
    [],
    ["年", "元本累計", "運用益(税引前)", "概算税額", "合計(税引前)", "合計(税引後)"],
    ...result.yearlyRows.map((row) => [
      `${row.year}年目`,
      Math.round(row.principal).toString(),
      Math.round(row.grossGain).toString(),
      Math.round(row.estimatedTax).toString(),
      Math.round(row.totalBeforeTax).toString(),
      Math.round(row.totalAfterTax).toString(),
    ]),
  ];

  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function buildSummary(result: SimulationResult, inputs: Inputs) {
  return [
    "積立シミュレーション結果",
    `毎月の積立額: ${formatYen(result.monthly)}`,
    `初期投資額: ${formatYen(result.initial)}`,
    `想定年利: ${inputs.annualRate}%`,
    `年コスト: ${inputs.annualCost}%`,
    `実質年利: ${formatPercent(result.netAnnualRate)}`,
    `積立期間: ${result.years}年`,
    `口座区分: ${inputs.accountType === "nisa" ? "NISA/非課税" : "課税口座"}`,
    `元本合計: ${formatYen(result.totalPrincipal)}`,
    `運用益（税引前）: ${formatYen(result.grossGain)}`,
    `概算税額: ${formatYen(result.estimatedTax)}`,
    `最終金額（税引後）: ${formatYen(result.finalAfterTax)}`,
  ].join("\n");
}

export default function TsumitateSim() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [copiedTarget, setCopiedTarget] = useState<CopiedTarget>(null);
  const [showFullTable, setShowFullTable] = useState(false);
  const error = validate(inputs);
  const result = useMemo(() => calculate(inputs), [inputs]);
  const csv = result ? makeCsv(result, inputs) : "";
  const summary = result ? buildSummary(result, inputs) : "";
  const displayRows = result ? (showFullTable ? result.yearlyRows : result.yearlyRows.slice(0, 12)) : [];

  function set<K extends keyof Inputs>(key: K, value: Inputs[K]) {
    setInputs((previous) => ({ ...previous, [key]: value }));
    setCopiedTarget(null);
  }

  function reset() {
    setInputs(DEFAULT_INPUTS);
    setCopiedTarget(null);
    setShowFullTable(false);
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
    a.download = "tsumitate-simulation.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const annualUsagePercent = result ? Math.min(100, (result.nisaAnnualUsage / NISA_ANNUAL_LIMIT) * 100) : 0;
  const lifetimeUsagePercent = result ? Math.min(100, (result.nisaLifetimeUsage / NISA_LIFETIME_LIMIT) * 100) : 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">積立条件</h2>
              <p className="mt-1 text-sm text-slate-500">NISA/課税口座、コスト、税額を含めて試算します。</p>
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
              id="tsumitate-monthly"
              label="毎月の積立額"
              suffix="円"
              value={inputs.monthly}
              onChange={(value) => set("monthly", sanitizeDecimal(value))}
              placeholder="50000"
            />
            <NumberInput
              id="tsumitate-initial"
              label="初期投資額"
              suffix="円"
              value={inputs.initial}
              onChange={(value) => set("initial", sanitizeDecimal(value))}
              placeholder="0"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberInput
                id="tsumitate-rate"
                label="想定年利"
                suffix="%"
                value={inputs.annualRate}
                onChange={(value) => set("annualRate", sanitizeDecimal(value))}
                placeholder="5"
              />
              <NumberInput
                id="tsumitate-cost"
                label="年コスト"
                suffix="%"
                value={inputs.annualCost}
                onChange={(value) => set("annualCost", sanitizeDecimal(value))}
                placeholder="0.2"
              />
            </div>
            <NumberInput
              id="tsumitate-years"
              label="積立期間"
              suffix="年"
              value={inputs.years}
              onChange={(value) => set("years", sanitizeDecimal(value))}
              placeholder="20"
            />
          </div>

          <fieldset className="mt-5">
            <legend className="text-sm font-medium text-slate-700">口座区分</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["nisa", "taxable"] as AccountType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set("accountType", type)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                    inputs.accountType === type
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-300 text-slate-700 hover:border-slate-900"
                  }`}
                >
                  {type === "nisa" ? "NISA/非課税" : "課税口座"}
                </button>
              ))}
            </div>
          </fieldset>

          {inputs.accountType === "taxable" && (
            <div className="mt-4">
              <NumberInput
                id="tsumitate-tax-rate"
                label="運用益の概算税率"
                suffix="%"
                value={inputs.taxRate}
                onChange={(value) => set("taxRate", sanitizeDecimal(value))}
                placeholder="20.315"
              />
            </div>
          )}

          <fieldset className="mt-5">
            <legend className="text-sm font-medium text-slate-700">積立タイミング</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["end", "beginning"] as ContributionTiming[]).map((timing) => (
                <button
                  key={timing}
                  type="button"
                  onClick={() => set("contributionTiming", timing)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                    inputs.contributionTiming === timing
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-slate-300 text-slate-700 hover:border-emerald-700"
                  }`}
                >
                  {timing === "end" ? "月末積立" : "月初積立"}
                </button>
              ))}
            </div>
          </fieldset>

          <p id="tsumitate-input-error" className={`mt-3 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
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
                    setShowFullTable(false);
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
                <p className="mt-1 text-sm text-slate-500">積立額、想定年利、期間を入れると結果が表示されます。</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
                <p className="text-sm font-medium text-emerald-700">最終金額（税引後）</p>
                <p className="mt-1 text-4xl font-bold tracking-tight">{formatYen(result.finalAfterTax)}</p>
                <p className="mt-2 text-sm text-emerald-800">
                  元本 {formatYen(result.totalPrincipal)}、運用益（税引前） {formatYen(result.grossGain)} の試算です。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard label="元本合計" value={formatYen(result.totalPrincipal)} note={`毎月 ${formatYen(result.monthly)} × ${result.years}年`} />
                <ResultCard label="運用益（税引前）" value={formatYen(result.grossGain)} note={`運用益率 ${formatPercent(result.gainRate)}`} />
                <ResultCard label="概算税額" value={formatYen(result.estimatedTax)} note={inputs.accountType === "nisa" ? "NISA/非課税として計算" : `税率 ${inputs.taxRate}%`} />
                <ResultCard label="実質年利" value={formatPercent(result.netAnnualRate)} note="想定年利から年コストを控除" />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">新NISA枠の目安</p>
                <div className="mt-3 space-y-3">
                  <UsageBar label="つみたて投資枠 年120万円" value={result.nisaAnnualUsage} limit={NISA_ANNUAL_LIMIT} percent={annualUsagePercent} />
                  <UsageBar label="生涯投資枠 1,800万円" value={result.nisaLifetimeUsage} limit={NISA_LIFETIME_LIMIT} percent={lifetimeUsagePercent} />
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  NISA制度の枠管理は取得価額ベースです。実際の買付可否は口座状況と金融機関の設定を確認してください。
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
              <p className="mt-1 text-sm text-slate-500">運用益と税引後金額の推移を年ごとに確認できます。</p>
            </div>
            {result.yearlyRows.length > 12 && (
              <button
                type="button"
                onClick={() => setShowFullTable((value) => !value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {showFullTable ? "12年分だけ表示" : `全${result.yearlyRows.length}年分を表示`}
              </button>
            )}
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-2 pr-3 text-left font-medium">年</th>
                  <th className="px-3 py-2 text-right font-medium">元本累計</th>
                  <th className="px-3 py-2 text-right font-medium">運用益</th>
                  <th className="px-3 py-2 text-right font-medium">概算税額</th>
                  <th className="px-3 py-2 text-right font-medium">合計（税引前）</th>
                  <th className="py-2 pl-3 text-right font-medium">合計（税引後）</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row) => (
                  <tr key={row.year} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-3 text-slate-600">{row.year}年目</td>
                    <td className="px-3 py-2 text-right font-mono">{formatYen(row.principal)}</td>
                    <td className="px-3 py-2 text-right font-mono text-emerald-700">{formatYen(row.grossGain)}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-600">{formatYen(row.estimatedTax)}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatYen(row.totalBeforeTax)}</td>
                    <td className="py-2 pl-3 text-right font-mono font-semibold">{formatYen(row.totalAfterTax)}</td>
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
          aria-describedby="tsumitate-input-error"
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

function UsageBar({
  label,
  value,
  limit,
  percent,
}: {
  label: string;
  value: number;
  limit: number;
  percent: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
        <span>{label}</span>
        <span>
          {formatYen(value)} / {formatYen(limit)}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
