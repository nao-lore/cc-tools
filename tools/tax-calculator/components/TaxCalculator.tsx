"use client";

import { useCallback, useMemo, useState } from "react";
import {
  calculateEntry,
  formatCurrency,
  generateInvoiceText,
  type TaxEntry,
  type TaxResult,
} from "../lib/tax";

type TaxMode = TaxEntry["taxMode"];

const TAX_MODE_LABELS: Record<TaxMode, string> = {
  exclusive: "税抜入力・消費税を区分",
  "inclusive-separated": "税込入力・消費税を区分",
  "inclusive-gross": "税込総額・区分なし",
};

const EXAMPLES = [
  { label: "デザイン制作", amount: "120000", taxMode: "exclusive" as TaxMode },
  { label: "記事執筆", amount: "55000", taxMode: "inclusive-separated" as TaxMode },
  { label: "講演料", amount: "1500000", taxMode: "exclusive" as TaxMode },
];

const INITIAL_ENTRY: TaxEntry = {
  id: "tax-entry-initial",
  label: "デザイン制作",
  amount: "100000",
  taxMode: "exclusive",
};

function createEntry(overrides: Partial<TaxEntry> = {}): TaxEntry {
  return {
    id: crypto.randomUUID(),
    label: "",
    amount: "",
    taxMode: "exclusive",
    ...overrides,
  };
}

function cleanAmount(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function yen(value: number) {
  return `¥${formatCurrency(value)}`;
}

function getEntryError(entry: TaxEntry) {
  if (!entry.amount) return "";
  const amount = Number.parseInt(entry.amount, 10);
  if (!Number.isFinite(amount) || amount <= 0) return "報酬額は1円以上で入力してください。";
  if (amount > 99_999_999) return "報酬額は99,999,999円以下を目安に入力してください。";
  return "";
}

export default function TaxCalculator() {
  const [entries, setEntries] = useState<TaxEntry[]>([INITIAL_ENTRY]);
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => entries.map((entry) => calculateEntry(entry)), [entries]);
  const totals = useMemo<TaxResult>(() => {
    return results.reduce(
      (acc, result) => ({
        netAmount: acc.netAmount + result.netAmount,
        consumptionTax: acc.consumptionTax + result.consumptionTax,
        grossAmount: acc.grossAmount + result.grossAmount,
        withholdingBase: acc.withholdingBase + result.withholdingBase,
        withholdingTax: acc.withholdingTax + result.withholdingTax,
        takeHome: acc.takeHome + result.takeHome,
      }),
      {
        netAmount: 0,
        consumptionTax: 0,
        grossAmount: 0,
        withholdingBase: 0,
        withholdingTax: 0,
        takeHome: 0,
      }
    );
  }, [results]);

  const errors = useMemo(() => entries.map((entry) => getEntryError(entry)), [entries]);
  const hasAmount = results.some((result) => result.grossAmount > 0);
  const hasError = errors.some(Boolean);

  const updateEntry = useCallback((id: string, updates: Partial<TaxEntry>) => {
    setEntries((current) => current.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)));
    setCopied(false);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((current) => (current.length > 1 ? current.filter((entry) => entry.id !== id) : current));
    setCopied(false);
  }, []);

  function addEntry() {
    setEntries((current) => [...current, createEntry()]);
    setCopied(false);
  }

  function reset() {
    setEntries([{ ...INITIAL_ENTRY }]);
    setCopied(false);
  }

  function applyExample(example: (typeof EXAMPLES)[number]) {
    setEntries([createEntry(example)]);
    setCopied(false);
  }

  async function copyResult() {
    if (!hasAmount || hasError) return;
    const validEntries = entries
      .map((entry, index) => ({ label: entry.label, result: results[index] }))
      .filter((entry) => entry.result.grossAmount > 0);
    await navigator.clipboard.writeText(generateInvoiceText(validEntries, totals));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">報酬明細</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                報酬・料金の源泉徴収税額、消費税、差引支払額を複数行で計算します。
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              クリア
            </button>
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => applyExample(example)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {example.label} <span className="text-slate-400">{yen(Number.parseInt(example.amount, 10))}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {entries.map((entry, index) => (
              <EntryForm
                key={entry.id}
                entry={entry}
                index={index}
                result={results[index]}
                error={errors[index]}
                canRemove={entries.length > 1}
                onChange={updateEntry}
                onRemove={removeEntry}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addEntry}
            className="mt-4 w-full rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 hover:border-slate-900 hover:text-slate-950"
          >
            項目を追加
          </button>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            対象報酬かどうか、消費税を明確に区分できているかで源泉徴収対象額が変わります。迷う場合は国税庁の案内や税理士に確認してください。
          </div>
        </div>

        <aside className="p-5 sm:p-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-800">差引支払額</p>
            <p className="mt-1 font-mono text-4xl font-bold tracking-tight text-emerald-950">
              {yen(totals.takeHome)}
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-800">
              税込報酬合計から源泉徴収税額を差し引いた概算です。
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            <SummaryCard label="報酬額（税抜）" value={yen(totals.netAmount)} note="消費税抜きの報酬合計" />
            <SummaryCard label="消費税（10%）" value={yen(totals.consumptionTax)} note="標準税率10%で概算" />
            <SummaryCard label="報酬額（税込）" value={yen(totals.grossAmount)} note="支払総額" />
            <SummaryCard label="源泉徴収対象額" value={yen(totals.withholdingBase)} note="税区分により税抜または税込" />
            <SummaryCard label="源泉徴収税額" value={yen(totals.withholdingTax)} note="10.21% / 20.42%" />
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-950">計算式</h2>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <p>100万円以下: A × 10.21%</p>
              <p>100万円超: (A - 100万円) × 20.42% + 102,100円</p>
              <p>端数: 1円未満切り捨て</p>
            </div>
          </div>

          <button
            type="button"
            onClick={copyResult}
            disabled={!hasAmount || hasError}
            className="mt-5 w-full rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? "コピーしました" : "請求書用テキストをコピー"}
          </button>
        </aside>
      </div>
    </section>
  );
}

function EntryForm({
  entry,
  index,
  result,
  error,
  canRemove,
  onChange,
  onRemove,
}: {
  entry: TaxEntry;
  index: number;
  result: TaxResult;
  error: string;
  canRemove: boolean;
  onChange: (id: string, updates: Partial<TaxEntry>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <label htmlFor={`tax-label-${entry.id}`} className="sr-only">
              項目名
            </label>
            <input
              id={`tax-label-${entry.id}`}
              type="text"
              value={entry.label}
              onChange={(event) => onChange(entry.id, { label: event.target.value })}
              placeholder="項目名（例: デザイン制作費）"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(entry.id)}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-slate-600 hover:bg-white"
            aria-label="項目を削除"
          >
            削除
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <label htmlFor={`tax-amount-${entry.id}`} className="text-sm font-medium text-slate-700">
            報酬額
          </label>
          <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
            <input
              id={`tax-amount-${entry.id}`}
              type="text"
              inputMode="numeric"
              value={entry.amount}
              onChange={(event) => onChange(entry.id, { amount: cleanAmount(event.target.value) })}
              className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
              aria-describedby={`tax-error-${entry.id}`}
              placeholder="100000"
            />
            <span className="flex min-w-14 items-center justify-center border-l border-slate-200 bg-white px-3 text-sm text-slate-500">
              円
            </span>
          </div>
        </div>
        <div>
          <label htmlFor={`tax-mode-${entry.id}`} className="text-sm font-medium text-slate-700">
            消費税と源泉対象
          </label>
          <select
            id={`tax-mode-${entry.id}`}
            value={entry.taxMode}
            onChange={(event) => onChange(entry.id, { taxMode: event.target.value as TaxMode })}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-900"
          >
            {Object.entries(TAX_MODE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p id={`tax-error-${entry.id}`} className={`mt-2 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
        {error || TAX_MODE_LABELS[entry.taxMode]}
      </p>

      {result.grossAmount > 0 && !error && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <MiniResult label="税抜報酬" value={yen(result.netAmount)} />
          <MiniResult label="税込報酬" value={yen(result.grossAmount)} />
          <MiniResult label="源泉対象額" value={yen(result.withholdingBase)} />
          <MiniResult label="差引支払額" value={yen(result.takeHome)} strong />
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function MiniResult({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-0.5 font-mono text-sm ${strong ? "font-bold text-emerald-700" : "font-semibold text-slate-900"}`}>{value}</p>
    </div>
  );
}
