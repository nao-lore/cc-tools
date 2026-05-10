"use client";

import { useMemo, useState } from "react";

type DiscountMode = "percent" | "wari" | "amount";

type Item = {
  id: string;
  label: string;
  price: string;
  discount: string;
};

type DiscountResult = {
  originalPrice: number;
  discountAmount: number;
  discountedPrice: number;
  tax10: number;
  tax8: number;
  savingRate: number;
};

const MODE_OPTIONS = [
  { value: "percent" as const, label: "%OFF", hint: "20%OFF など" },
  { value: "wari" as const, label: "○割引", hint: "3割引 = 30%OFF" },
  { value: "amount" as const, label: "円引き", hint: "500円引き など" },
];

const PRESETS = [
  { label: "20%OFF", mode: "percent" as const, discount: "20" },
  { label: "3割引", mode: "wari" as const, discount: "3" },
  { label: "半額", mode: "percent" as const, discount: "50" },
  { label: "1,000円引き", mode: "amount" as const, discount: "1000" },
];

function createItem(index: number, price = "", discount = ""): Item {
  return {
    id: `item-${index}`,
    label: "",
    price,
    discount,
  };
}

function parseAmount(value: string) {
  const parsed = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function yen(value: number) {
  return Math.round(value).toLocaleString("ja-JP");
}

function pct(value: number) {
  return `${value.toLocaleString("ja-JP", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function calcDiscount(price: number, discount: number, mode: DiscountMode): DiscountResult {
  const safePrice = Math.max(0, price);
  let discountAmount = 0;

  if (mode === "percent") {
    discountAmount = safePrice * (Math.min(discount, 100) / 100);
  } else if (mode === "wari") {
    discountAmount = safePrice * (Math.min(discount, 10) / 10);
  } else {
    discountAmount = Math.min(discount, safePrice);
  }

  const discountedPrice = Math.max(0, safePrice - discountAmount);
  return {
    originalPrice: safePrice,
    discountAmount,
    discountedPrice,
    tax10: discountedPrice * 1.1,
    tax8: discountedPrice * 1.08,
    savingRate: safePrice > 0 ? (discountAmount / safePrice) * 100 : 0,
  };
}

function discountLabel(mode: DiscountMode, value: number) {
  if (mode === "percent") return `${value}%OFF`;
  if (mode === "wari") return `${value}割引`;
  return `${yen(value)}円引き`;
}

function buildCsv(rows: Array<Item & DiscountResult>, mode: DiscountMode) {
  const data = [
    ["item", "discount", "original_price_yen", "discount_amount_yen", "discounted_price_yen", "tax_10_yen", "tax_8_yen", "saving_rate_percent"],
    ...rows.map((row, index) => [
      row.label || `商品${index + 1}`,
      discountLabel(mode, parseAmount(row.discount)),
      String(Math.round(row.originalPrice)),
      String(Math.round(row.discountAmount)),
      String(Math.round(row.discountedPrice)),
      String(Math.round(row.tax10)),
      String(Math.round(row.tax8)),
      row.savingRate.toFixed(1),
    ]),
  ];
  return data.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadCsv(text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "discount-calculation.csv";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export default function DiscountCalculator() {
  const [mode, setMode] = useState<DiscountMode>("percent");
  const [items, setItems] = useState<Item[]>([createItem(1, "5000", "20")]);
  const [copied, setCopied] = useState(false);

  const rows = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        ...calcDiscount(parseAmount(item.price), parseAmount(item.discount), mode),
      })),
    [items, mode]
  );

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          originalPrice: acc.originalPrice + row.originalPrice,
          discountAmount: acc.discountAmount + row.discountAmount,
          discountedPrice: acc.discountedPrice + row.discountedPrice,
          tax10: acc.tax10 + row.tax10,
          tax8: acc.tax8 + row.tax8,
        }),
        { originalPrice: 0, discountAmount: 0, discountedPrice: 0, tax10: 0, tax8: 0 }
      ),
    [rows]
  );

  const hasResult = totals.originalPrice > 0;
  const savingRate = totals.originalPrice > 0 ? (totals.discountAmount / totals.originalPrice) * 100 : 0;
  const validationError = rows.some((row) => row.originalPrice <= 0)
    ? "価格が未入力の商品があります。計算したい商品の価格を入力してください。"
    : rows.some((row) => parseAmount(row.discount) < 0)
      ? "割引値は0以上で入力してください。"
      : "";

  function updateItem(id: string, updates: Partial<Item>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    setCopied(false);
  }

  function addItem() {
    setItems((current) => [...current, createItem(current.length + 1)]);
    setCopied(false);
  }

  function removeItem(id: string) {
    setItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));
    setCopied(false);
  }

  function reset() {
    setMode("percent");
    setItems([createItem(1, "5000", "20")]);
    setCopied(false);
  }

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setMode(preset.mode);
    setItems((current) => current.map((item, index) => (index === 0 ? { ...item, discount: preset.discount } : item)));
    setCopied(false);
  }

  async function copySummary() {
    const lines = [
      `割引: ${discountLabel(mode, parseAmount(items[0]?.discount || "0"))}`,
      `元値合計: ${yen(totals.originalPrice)}円`,
      `割引額合計: ${yen(totals.discountAmount)}円`,
      `割引後合計: ${yen(totals.discountedPrice)}円`,
      `税込10%: ${yen(totals.tax10)}円`,
      `税込8%: ${yen(totals.tax8)}円`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">割引条件</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">価格と割引を入力すると、割引後価格と税込額をブラウザ内で計算します。</p>
            </div>
            <button type="button" onClick={reset} className="w-fit rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              クリア
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">
            {MODE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                className={`rounded-lg px-2 py-2 text-sm font-semibold ${mode === option.value ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">{MODE_OPTIONS.find((option) => option.value === mode)?.hint}</p>

          <div className="mt-5 grid gap-4">
            {items.map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <label className="min-w-0 flex-1 text-sm font-medium text-slate-700" htmlFor={`${item.id}-label`}>
                    商品名
                    <input
                      id={`${item.id}-label`}
                      type="text"
                      value={item.label}
                      onChange={(event) => updateItem(item.id, { label: event.target.value })}
                      placeholder={`商品${index + 1}`}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-900"
                    />
                  </label>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(item.id)} className="mt-7 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white">
                      削除
                    </button>
                  )}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <MoneyInput id={`${item.id}-price`} label="元の価格" value={item.price} onChange={(value) => updateItem(item.id, { price: value })} suffix="円" />
                  <MoneyInput
                    id={`${item.id}-discount`}
                    label={mode === "percent" ? "割引率" : mode === "wari" ? "割引" : "割引額"}
                    value={item.discount}
                    onChange={(value) => updateItem(item.id, { discount: value })}
                    suffix={mode === "percent" ? "%" : mode === "wari" ? "割" : "円"}
                  />
                </div>
              </div>
            ))}

            <button type="button" onClick={addItem} className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-slate-900 hover:bg-slate-50">
              商品を追加
            </button>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button key={preset.label} type="button" onClick={() => applyPreset(preset)} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50">
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <p className={`min-h-5 text-sm ${validationError ? "text-red-600" : "text-slate-500"}`}>
              {validationError || "税率10%と8%は割引後の税抜価格に対して加算します。税込価格を入力した場合は、結果も税込ベースの割引額として扱ってください。"}
            </p>
          </div>
        </div>

        <div className="min-w-0 p-5 sm:p-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            <p className="text-sm font-medium opacity-80">割引後合計</p>
            <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <p className="font-mono text-4xl font-bold">{yen(totals.discountedPrice)}円</p>
              <p className="text-sm font-semibold">{pct(savingRate)} OFF</p>
            </div>
            <p className="mt-2 text-sm opacity-80">割引額合計 {yen(totals.discountAmount)}円。税込10%は {yen(totals.tax10)}円、税込8%は {yen(totals.tax8)}円です。</p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ResultCard label="元値合計" value={`${yen(totals.originalPrice)}円`} note="入力価格の合計" />
            <ResultCard label="割引額合計" value={`-${yen(totals.discountAmount)}円`} note={discountLabel(mode, parseAmount(items[0]?.discount || "0"))} tone="text-emerald-700" />
            <ResultCard label="税込10%" value={`${yen(totals.tax10)}円`} note="標準税率の目安" />
            <ResultCard label="税込8%" value={`${yen(totals.tax8)}円`} note="軽減税率の目安" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={copySummary} disabled={!hasResult} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300">
              {copied ? "コピー済み" : "結果をコピー"}
            </button>
            <button type="button" onClick={() => downloadCsv(buildCsv(rows, mode))} disabled={!hasResult} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300">
              CSVダウンロード
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-semibold text-slate-950">商品別の計算結果</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs text-slate-500">
                    <th className="border border-slate-200 px-3 py-2">商品</th>
                    <th className="border border-slate-200 px-3 py-2">元値</th>
                    <th className="border border-slate-200 px-3 py-2">割引額</th>
                    <th className="border border-slate-200 px-3 py-2">割引後</th>
                    <th className="border border-slate-200 px-3 py-2">お得度</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id} className="even:bg-slate-50">
                      <td className="border border-slate-200 px-3 py-2 font-semibold">{row.label || `商品${index + 1}`}</td>
                      <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-right">{yen(row.originalPrice)}円</td>
                      <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-right text-emerald-700">-{yen(row.discountAmount)}円</td>
                      <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-right font-semibold">{yen(row.discountedPrice)}円</td>
                      <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-right">{pct(row.savingRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MoneyInput({ id, label, value, onChange, suffix }: { id: string; label: string; value: string; onChange: (value: string) => void; suffix: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor={id}>
      {label}
      <div className="flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/[^0-9.]/g, ""))}
          className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
        />
        <span className="flex min-w-12 items-center justify-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{suffix}</span>
      </div>
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
