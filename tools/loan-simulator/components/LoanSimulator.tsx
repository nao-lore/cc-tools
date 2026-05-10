"use client";

import { useMemo, useState } from "react";

type RepaymentType = "equal-installment" | "equal-principal";

type YearlyRow = {
  year: number;
  startBalance: number;
  principalPaid: number;
  interestPaid: number;
  bonusPaid: number;
  totalPaid: number;
  endBalance: number;
};

type Simulation = {
  monthlyPaymentLabel: string;
  monthlyPayment: number;
  firstPayment: number;
  finalPayment: number;
  totalPayment: number;
  totalInterest: number;
  payoffMonths: number;
  yearlyRows: YearlyRow[];
};

const PRESETS = [
  { label: "住宅 3,000万円", principal: "3000", rate: "1.2", years: "35", income: "600" },
  { label: "車 250万円", principal: "250", rate: "3.5", years: "5", income: "450" },
  { label: "教育 500万円", principal: "500", rate: "2.0", years: "10", income: "700" },
  { label: "短期 100万円", principal: "100", rate: "8.0", years: "3", income: "400" },
];

function parseManYen(value: string) {
  const parsed = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? Math.max(0, parsed) * 10_000 : 0;
}

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function yen(value: number) {
  return Math.round(value).toLocaleString("ja-JP");
}

function pct(value: number) {
  return `${value.toLocaleString("ja-JP", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function monthsToLabel(months: number) {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest}か月`;
  if (rest === 0) return `${years}年`;
  return `${years}年${rest}か月`;
}

function calcScheduledPayment(principal: number, annualRate: number, months: number) {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

function simulateLoan({
  principal,
  annualRate,
  years,
  bonusAmount,
  type,
}: {
  principal: number;
  annualRate: number;
  years: number;
  bonusAmount: number;
  type: RepaymentType;
}): Simulation {
  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;
  const scheduledInstallment = calcScheduledPayment(principal, annualRate, months);
  const scheduledPrincipal = principal / months;
  let balance = principal;
  let totalPayment = 0;
  let totalInterest = 0;
  let payoffMonths = 0;
  let firstPayment = 0;
  let finalPayment = 0;
  const yearlyRows: YearlyRow[] = [];
  let currentYear: YearlyRow | null = null;

  for (let month = 1; month <= months && balance > 0.5; month++) {
    if ((month - 1) % 12 === 0) {
      currentYear = {
        year: Math.ceil(month / 12),
        startBalance: balance,
        principalPaid: 0,
        interestPaid: 0,
        bonusPaid: 0,
        totalPaid: 0,
        endBalance: balance,
      };
      yearlyRows.push(currentYear);
    }

    const interest = balance * monthlyRate;
    let principalPaid = type === "equal-installment" ? scheduledInstallment - interest : scheduledPrincipal;
    principalPaid = Math.max(0, Math.min(principalPaid, balance));
    balance -= principalPaid;

    const bonusPaid = month % 6 === 0 ? Math.min(bonusAmount, balance) : 0;
    balance -= bonusPaid;

    const monthlyPaid = interest + principalPaid + bonusPaid;
    totalPayment += monthlyPaid;
    totalInterest += interest;
    payoffMonths = month;
    finalPayment = monthlyPaid;
    if (month === 1) firstPayment = monthlyPaid;

    if (currentYear) {
      currentYear.principalPaid += principalPaid + bonusPaid;
      currentYear.interestPaid += interest;
      currentYear.bonusPaid += bonusPaid;
      currentYear.totalPaid += monthlyPaid;
      currentYear.endBalance = Math.max(0, balance);
    }
  }

  const monthlyPayment = type === "equal-installment" ? scheduledInstallment : firstPayment;
  const monthlyPaymentLabel = type === "equal-installment" ? "毎月返済額" : "初回返済額";

  return {
    monthlyPaymentLabel,
    monthlyPayment,
    firstPayment,
    finalPayment,
    totalPayment,
    totalInterest,
    payoffMonths,
    yearlyRows,
  };
}

function buildCsv(rows: YearlyRow[]) {
  const data = [
    ["year", "start_balance_yen", "principal_paid_yen", "interest_paid_yen", "bonus_paid_yen", "total_paid_yen", "end_balance_yen"],
    ...rows.map((row) => [
      String(row.year),
      String(Math.round(row.startBalance)),
      String(Math.round(row.principalPaid)),
      String(Math.round(row.interestPaid)),
      String(Math.round(row.bonusPaid)),
      String(Math.round(row.totalPaid)),
      String(Math.round(row.endBalance)),
    ]),
  ];
  return data.map((row) => row.join(",")).join("\n");
}

function downloadCsv(rows: YearlyRow[]) {
  const blob = new Blob([buildCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "loan-simulation.csv";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export default function LoanSimulator() {
  const [principal, setPrincipal] = useState("3000");
  const [annualRate, setAnnualRate] = useState("1.2");
  const [years, setYears] = useState("35");
  const [bonusAmount, setBonusAmount] = useState("0");
  const [annualIncome, setAnnualIncome] = useState("600");
  const [repaymentType, setRepaymentType] = useState<RepaymentType>("equal-installment");
  const [copied, setCopied] = useState(false);

  const principalYen = parseManYen(principal);
  const rateNum = parseNumber(annualRate);
  const yearsNum = Math.round(parseNumber(years));
  const bonusYen = parseManYen(bonusAmount);
  const incomeYen = parseManYen(annualIncome);
  const error =
    principalYen <= 0
      ? "借入金額を入力してください。"
      : yearsNum <= 0 || yearsNum > 50
        ? "返済期間は1〜50年で入力してください。"
        : rateNum < 0 || rateNum > 30
          ? "金利は0〜30%の範囲で入力してください。"
          : "";

  const result = useMemo(() => {
    if (error) return null;
    return simulateLoan({
      principal: principalYen,
      annualRate: rateNum,
      years: yearsNum,
      bonusAmount: bonusYen,
      type: repaymentType,
    });
  }, [bonusYen, error, principalYen, rateNum, repaymentType, yearsNum]);

  const repaymentRatio = result && incomeYen > 0 ? ((result.monthlyPayment * 12 + bonusYen * 2) / incomeYen) * 100 : null;
  const ratioTone = repaymentRatio === null ? "text-slate-500" : repaymentRatio <= 25 ? "text-emerald-700" : repaymentRatio <= 35 ? "text-amber-700" : "text-red-700";

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setPrincipal(preset.principal);
    setAnnualRate(preset.rate);
    setYears(preset.years);
    setAnnualIncome(preset.income);
    setBonusAmount("0");
    setCopied(false);
  }

  function reset() {
    setPrincipal("3000");
    setAnnualRate("1.2");
    setYears("35");
    setBonusAmount("0");
    setAnnualIncome("600");
    setRepaymentType("equal-installment");
    setCopied(false);
  }

  async function copyResult() {
    if (!result) return;
    const lines = [
      `返済方式: ${repaymentType === "equal-installment" ? "元利均等返済" : "元金均等返済"}`,
      `借入金額: ${yen(principalYen)}円`,
      `年利: ${annualRate}%`,
      `${result.monthlyPaymentLabel}: ${yen(result.monthlyPayment)}円`,
      `総返済額: ${yen(result.totalPayment)}円`,
      `利息総額: ${yen(result.totalInterest)}円`,
      `完済目安: ${monthsToLabel(result.payoffMonths)}`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">借入条件</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">金額は万円単位。入力値はブラウザ内で計算され、外部に送信されません。</p>
            </div>
            <button type="button" onClick={reset} className="w-fit rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              クリア
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            {[
              { value: "equal-installment" as const, label: "元利均等" },
              { value: "equal-principal" as const, label: "元金均等" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setRepaymentType(item.value)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  repaymentType === item.value ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4">
            <NumberInput id="loan-principal" label="借入金額" value={principal} onChange={setPrincipal} suffix="万円" step="100" />
            <NumberInput id="loan-rate" label="金利（年利）" value={annualRate} onChange={setAnnualRate} suffix="%" step="0.1" />
            <NumberInput id="loan-years" label="返済期間" value={years} onChange={setYears} suffix="年" step="1" />
            <NumberInput id="loan-bonus" label="ボーナス月の追加返済" value={bonusAmount} onChange={setBonusAmount} suffix="万円/回" step="10" note="6月・12月に追加で元金返済する前提です。" />
            <NumberInput id="loan-income" label="年収（返済比率用）" value={annualIncome} onChange={setAnnualIncome} suffix="万円" step="50" />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <p className={`min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
              {error || "概算シミュレーションです。実際の審査、保証料、団信、手数料、金利優遇、繰上返済手数料は金融機関ごとに異なります。"}
            </p>
          </div>
        </div>

        <div className="min-w-0 p-5 sm:p-6">
          {!result ? (
            <div className="flex min-h-96 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <div>
                <p className="text-sm font-semibold text-slate-700">入力を確認してください</p>
                <p className="mt-1 text-sm text-slate-500">条件を入れると返済額と残高推移が表示されます。</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5">
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-indigo-950">
                <p className="text-sm font-medium opacity-80">{result.monthlyPaymentLabel}</p>
                <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <p className="font-mono text-4xl font-bold">{yen(result.monthlyPayment)}円</p>
                  <p className="text-sm font-semibold">{monthsToLabel(result.payoffMonths)}で完済</p>
                </div>
                <p className="mt-2 text-sm opacity-80">
                  {repaymentType === "equal-installment" ? "毎月返済額が一定になる方式です。" : "元金返済が一定で、返済が進むほど月額が下がる方式です。"}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ResultCard label="総返済額" value={`${yen(result.totalPayment)}円`} note={`借入額との差額 ${yen(result.totalInterest)}円`} />
                <ResultCard label="利息総額" value={`${yen(result.totalInterest)}円`} note={`借入額比 ${pct((result.totalInterest / principalYen) * 100)}`} />
                <ResultCard label="最終月の返済" value={`${yen(result.finalPayment)}円`} note="ボーナス追加返済で短縮される場合があります" />
                <ResultCard label="返済比率" value={repaymentRatio === null ? "-" : pct(repaymentRatio)} note="年収に対する年間返済額の概算" tone={ratioTone} />
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyResult} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  {copied ? "コピー済み" : "結果をコピー"}
                </button>
                <button type="button" onClick={() => downloadCsv(result.yearlyRows)} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                  CSVダウンロード
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-base font-semibold text-slate-950">年次残高推移</h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[560px] border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-left text-xs text-slate-500">
                        <th className="border border-slate-200 px-3 py-2">年</th>
                        <th className="border border-slate-200 px-3 py-2">期首残高</th>
                        <th className="border border-slate-200 px-3 py-2">元金返済</th>
                        <th className="border border-slate-200 px-3 py-2">利息</th>
                        <th className="border border-slate-200 px-3 py-2">期末残高</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.yearlyRows.slice(0, 12).map((row) => (
                        <tr key={row.year} className="even:bg-slate-50">
                          <td className="whitespace-nowrap border border-slate-200 px-3 py-2 font-semibold">{row.year}年目</td>
                          <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-right">{yen(row.startBalance)}円</td>
                          <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-right">{yen(row.principalPaid)}円</td>
                          <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-right">{yen(row.interestPaid)}円</td>
                          <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-right">{yen(row.endBalance)}円</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-xs text-slate-500">表は先頭12年分を表示しています。全期間分はCSVで確認できます。</p>
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
  onChange,
  suffix,
  step,
  note,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix: string;
  step: string;
  note?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor={id}>
      {label}
      <div className="flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
        <input
          id={id}
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
        />
        <span className="flex min-w-16 items-center justify-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{suffix}</span>
      </div>
      {note && <span className="text-xs font-normal text-slate-500">{note}</span>}
    </label>
  );
}

function ResultCard({ label, value, note, tone = "text-slate-950" }: { label: string; value: string; note: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-bold ${tone}`}>{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
    </div>
  );
}
