"use client";

import { useMemo, useState } from "react";

type Appliance = {
  id: string;
  name: string;
  watt: string;
  hours: string;
  daysPerMonth: string;
  quantity: string;
};

type ApplianceResult = {
  appliance: Appliance;
  watt: number;
  hours: number;
  daysPerMonth: number;
  quantity: number;
  dailyKwh: number;
  monthlyKwh: number;
  yearlyKwh: number;
  dailyCost: number;
  monthlyCost: number;
  yearlyCost: number;
};

type Totals = {
  dailyKwh: number;
  monthlyKwh: number;
  yearlyKwh: number;
  dailyCost: number;
  monthlyCost: number;
  yearlyCost: number;
};

type CopiedTarget = "summary" | "csv" | null;

const PRESETS = [
  { name: "エアコン", watt: "800", hours: "8", daysPerMonth: "30", quantity: "1" },
  { name: "冷蔵庫", watt: "150", hours: "24", daysPerMonth: "30", quantity: "1" },
  { name: "テレビ", watt: "100", hours: "4", daysPerMonth: "30", quantity: "1" },
  { name: "ドライヤー", watt: "1200", hours: "0.25", daysPerMonth: "30", quantity: "1" },
  { name: "電子レンジ", watt: "1000", hours: "0.17", daysPerMonth: "30", quantity: "1" },
  { name: "ノートPC", watt: "60", hours: "8", daysPerMonth: "22", quantity: "1" },
];

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function newAppliance(preset = PRESETS[0], id = createId()): Appliance {
  return {
    id,
    name: preset.name,
    watt: preset.watt,
    hours: preset.hours,
    daysPerMonth: preset.daysPerMonth,
    quantity: preset.quantity,
  };
}

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
    maximumFractionDigits: value < 100 ? 1 : 0,
  }).format(value);
}

function formatNumber(value: number, digits = 2) {
  return new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function validateUnitPrice(unitPrice: string) {
  const price = parseNumber(unitPrice);
  if (!unitPrice || price <= 0) return "入力エラー: 電気料金単価は0より大きい値で入力してください。";
  if (price > 200) return "入力エラー: 電気料金単価は200円/kWh以下で入力してください。";
  return "";
}

function isComplete(appliance: Appliance) {
  return parseNumber(appliance.watt) > 0 && parseNumber(appliance.hours) > 0 && parseNumber(appliance.daysPerMonth) > 0;
}

function validateAppliance(appliance: Appliance) {
  const watt = parseNumber(appliance.watt);
  const hours = parseNumber(appliance.hours);
  const daysPerMonth = parseNumber(appliance.daysPerMonth);
  const quantity = parseNumber(appliance.quantity) || 1;

  if (!isComplete(appliance)) return "";
  if (watt > 20_000) return `${appliance.name || "家電"}: 消費電力は20,000W以下で入力してください。`;
  if (hours > 24) return `${appliance.name || "家電"}: 使用時間は24時間以内で入力してください。`;
  if (daysPerMonth > 31) return `${appliance.name || "家電"}: 使用日数は31日以内で入力してください。`;
  if (quantity > 100) return `${appliance.name || "家電"}: 台数は100台以内で入力してください。`;
  return "";
}

function calcAppliance(appliance: Appliance, unitPrice: number): ApplianceResult | null {
  if (!isComplete(appliance)) return null;

  const watt = parseNumber(appliance.watt);
  const hours = parseNumber(appliance.hours);
  const daysPerMonth = parseNumber(appliance.daysPerMonth);
  const quantity = parseNumber(appliance.quantity) || 1;
  const dailyKwh = (watt * hours * quantity) / 1000;
  const monthlyKwh = dailyKwh * daysPerMonth;
  const yearlyKwh = monthlyKwh * 12;
  const dailyCost = dailyKwh * unitPrice;
  const monthlyCost = monthlyKwh * unitPrice;
  const yearlyCost = yearlyKwh * unitPrice;

  return { appliance, watt, hours, daysPerMonth, quantity, dailyKwh, monthlyKwh, yearlyKwh, dailyCost, monthlyCost, yearlyCost };
}

function makeCsv(results: ApplianceResult[], totals: Totals, unitPrice: string) {
  const rows = [
    ["項目", "値"],
    ["電気料金単価", `${unitPrice}円/kWh`],
    ["1日の合計電力量", `${formatNumber(totals.dailyKwh)}kWh`],
    ["1ヶ月の合計電力量", `${formatNumber(totals.monthlyKwh)}kWh`],
    ["1年の合計電力量", `${formatNumber(totals.yearlyKwh)}kWh`],
    ["1日の合計電気代", Math.round(totals.dailyCost).toString()],
    ["1ヶ月の合計電気代", Math.round(totals.monthlyCost).toString()],
    ["1年の合計電気代", Math.round(totals.yearlyCost).toString()],
    [],
    ["家電名", "消費電力W", "使用時間/日", "使用日数/月", "台数", "kWh/月", "電気代/月", "電気代/年"],
    ...results.map((result) => [
      result.appliance.name || "家電",
      result.watt.toString(),
      result.hours.toString(),
      result.daysPerMonth.toString(),
      result.quantity.toString(),
      formatNumber(result.monthlyKwh),
      Math.round(result.monthlyCost).toString(),
      Math.round(result.yearlyCost).toString(),
    ]),
  ];

  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function buildSummary(results: ApplianceResult[], totals: Totals, unitPrice: string) {
  return [
    "電気代計算結果",
    `電気料金単価: ${unitPrice}円/kWh`,
    `1日の合計: ${formatYen(totals.dailyCost)} / ${formatNumber(totals.dailyKwh)}kWh`,
    `1ヶ月の合計: ${formatYen(totals.monthlyCost)} / ${formatNumber(totals.monthlyKwh)}kWh`,
    `1年の合計: ${formatYen(totals.yearlyCost)} / ${formatNumber(totals.yearlyKwh)}kWh`,
    "",
    ...results.map(
      (result) =>
        `${result.appliance.name || "家電"}: ${result.watt}W × ${result.hours}時間/日 × ${result.daysPerMonth}日/月 × ${result.quantity}台 = ${formatYen(result.monthlyCost)}/月`
    ),
  ].join("\n");
}

export default function DenkiCalculator() {
  const [unitPrice, setUnitPrice] = useState("31");
  const [appliances, setAppliances] = useState<Appliance[]>([newAppliance(PRESETS[0], "appliance-1")]);
  const [copiedTarget, setCopiedTarget] = useState<CopiedTarget>(null);
  const priceError = validateUnitPrice(unitPrice);
  const applianceErrors = appliances.map(validateAppliance).filter(Boolean);
  const unitPriceValue = parseNumber(unitPrice) || 31;
  const results = useMemo(
    () => appliances.map((appliance) => calcAppliance(appliance, unitPriceValue)).filter((result): result is ApplianceResult => result !== null),
    [appliances, unitPriceValue]
  );
  const totals = useMemo<Totals>(
    () =>
      results.reduce(
        (acc, result) => ({
          dailyKwh: acc.dailyKwh + result.dailyKwh,
          monthlyKwh: acc.monthlyKwh + result.monthlyKwh,
          yearlyKwh: acc.yearlyKwh + result.yearlyKwh,
          dailyCost: acc.dailyCost + result.dailyCost,
          monthlyCost: acc.monthlyCost + result.monthlyCost,
          yearlyCost: acc.yearlyCost + result.yearlyCost,
        }),
        { dailyKwh: 0, monthlyKwh: 0, yearlyKwh: 0, dailyCost: 0, monthlyCost: 0, yearlyCost: 0 }
      ),
    [results]
  );
  const error = priceError || applianceErrors[0] || (results.length === 0 ? "入力エラー: 消費電力、使用時間、使用日数を入力してください。" : "");
  const csv = results.length ? makeCsv(results, totals, unitPrice) : "";
  const summary = results.length ? buildSummary(results, totals, unitPrice) : "";

  function updateAppliance(id: string, updates: Partial<Appliance>) {
    setAppliances((previous) => previous.map((appliance) => (appliance.id === id ? { ...appliance, ...updates } : appliance)));
    setCopiedTarget(null);
  }

  function addPreset(preset: (typeof PRESETS)[number]) {
    setAppliances((previous) => [...previous, newAppliance(preset)]);
    setCopiedTarget(null);
  }

  function removeAppliance(id: string) {
    setAppliances((previous) => previous.filter((appliance) => appliance.id !== id));
    setCopiedTarget(null);
  }

  function reset() {
    setUnitPrice("31");
    setAppliances([newAppliance(PRESETS[0], "appliance-1")]);
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
    a.download = "electricity-cost.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">使用条件</h2>
              <p className="mt-1 text-sm text-slate-500">家電ごとの消費電力、時間、日数、台数を入力します。</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              リセット
            </button>
          </div>

          <div className="mt-5">
            <NumberInput
              id="denki-unit-price"
              label="電気料金単価"
              suffix="円/kWh"
              value={unitPrice}
              onChange={(value) => {
                setUnitPrice(sanitizeDecimal(value));
                setCopiedTarget(null);
              }}
              placeholder="31"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              家電公取協の目安単価31円/kWhを初期値にしています。実際の単価は契約プランや燃料費調整で変わります。
            </p>
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプルプリセット</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => addPreset(preset)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <p id="denki-input-error" className={`mt-3 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
            {error || "計算はブラウザ上で完結し、入力値を外部に送信しません。"}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="space-y-4">
            {appliances.map((appliance, index) => (
              <ApplianceCard
                key={appliance.id}
                appliance={appliance}
                index={index}
                canRemove={appliances.length > 1}
                onChange={updateAppliance}
                onRemove={removeAppliance}
              />
            ))}
            <button
              type="button"
              onClick={() => addPreset({ name: "", watt: "", hours: "", daysPerMonth: "30", quantity: "1" })}
              className="w-full rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 hover:border-slate-900 hover:text-slate-950"
            >
              家電を追加
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 p-5 sm:p-6">
        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm font-medium text-slate-700">家電の情報を入力してください</p>
            <p className="mt-1 text-sm text-slate-500">消費電力、使用時間、使用日数を入れると合計が表示されます。</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
              <p className="text-sm font-medium text-emerald-700">1ヶ月の合計電気代</p>
              <p className="mt-1 text-4xl font-bold tracking-tight">{formatYen(totals.monthlyCost)}</p>
              <p className="mt-2 text-sm text-emerald-800">
                1日 {formatYen(totals.dailyCost)}、1年 {formatYen(totals.yearlyCost)}。月間消費電力量は {formatNumber(totals.monthlyKwh)}kWh です。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <ResultCard label="1日の電気代" value={formatYen(totals.dailyCost)} note={`${formatNumber(totals.dailyKwh)}kWh/日`} />
              <ResultCard label="1ヶ月の電気代" value={formatYen(totals.monthlyCost)} note={`${formatNumber(totals.monthlyKwh)}kWh/月`} />
              <ResultCard label="1年の電気代" value={formatYen(totals.yearlyCost)} note={`${formatNumber(totals.yearlyKwh)}kWh/年`} />
              <ResultCard label="登録家電" value={`${results.length}件`} note={`${unitPrice}円/kWhで計算`} />
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

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="py-2 pr-3 text-left font-medium">家電</th>
                    <th className="px-3 py-2 text-right font-medium">条件</th>
                    <th className="px-3 py-2 text-right font-medium">kWh/月</th>
                    <th className="px-3 py-2 text-right font-medium">1日</th>
                    <th className="px-3 py-2 text-right font-medium">1ヶ月</th>
                    <th className="py-2 pl-3 text-right font-medium">1年</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.appliance.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-3 font-medium text-slate-800">{result.appliance.name || "家電"}</td>
                      <td className="px-3 py-2 text-right text-xs text-slate-500">
                        {result.watt}W × {result.hours}h × {result.daysPerMonth}日 × {result.quantity}台
                      </td>
                      <td className="px-3 py-2 text-right font-mono">{formatNumber(result.monthlyKwh)}</td>
                      <td className="px-3 py-2 text-right font-mono">{formatYen(result.dailyCost)}</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-emerald-700">{formatYen(result.monthlyCost)}</td>
                      <td className="py-2 pl-3 text-right font-mono">{formatYen(result.yearlyCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ApplianceCard({
  appliance,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  appliance: Appliance;
  index: number;
  canRemove: boolean;
  onChange: (id: string, updates: Partial<Appliance>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
            {index + 1}
          </span>
          <input
            type="text"
            value={appliance.name}
            onChange={(event) => onChange(appliance.id, { name: event.target.value })}
            placeholder="家電名"
            className="min-w-0 flex-1 border-b border-slate-200 py-1 text-sm font-semibold outline-none focus:border-slate-900"
          />
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(appliance.id)}
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50"
            aria-label={`${appliance.name || "家電"}を削除`}
          >
            削除
          </button>
        )}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <SmallNumberInput id={`${appliance.id}-watt`} label="消費電力" suffix="W" value={appliance.watt} onChange={(value) => onChange(appliance.id, { watt: sanitizeDecimal(value) })} />
        <SmallNumberInput id={`${appliance.id}-hours`} label="使用時間/日" suffix="時間" value={appliance.hours} onChange={(value) => onChange(appliance.id, { hours: sanitizeDecimal(value) })} />
        <SmallNumberInput id={`${appliance.id}-days`} label="使用日数/月" suffix="日" value={appliance.daysPerMonth} onChange={(value) => onChange(appliance.id, { daysPerMonth: sanitizeDecimal(value) })} />
        <SmallNumberInput id={`${appliance.id}-quantity`} label="台数" suffix="台" value={appliance.quantity} onChange={(value) => onChange(appliance.id, { quantity: sanitizeDecimal(value) })} />
      </div>
    </div>
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
          aria-describedby="denki-input-error"
        />
        <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{suffix}</span>
      </div>
    </div>
  );
}

function SmallNumberInput({
  id,
  label,
  suffix,
  value,
  onChange,
}: {
  id: string;
  label: string;
  suffix: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-slate-500">
        {label}
      </label>
      <div className="mt-1 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 px-3 py-2 text-right font-mono outline-none"
          aria-describedby="denki-input-error"
        />
        <span className="flex items-center border-l border-slate-200 bg-slate-50 px-2 text-xs text-slate-500">{suffix}</span>
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
