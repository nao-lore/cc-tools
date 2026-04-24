"use client";

import { useState, useMemo, useCallback } from "react";

type Mode = "tax-in" | "tax-out";
type TaxRate = 10 | 8;
type Rounding = "floor" | "round" | "ceil";

type Item = {
  id: number;
  name: string;
  amount: string;
  taxRate: TaxRate;
};

function applyRounding(value: number, rounding: Rounding): number {
  if (rounding === "floor") return Math.floor(value);
  if (rounding === "round") return Math.round(value);
  return Math.ceil(value);
}

function calcTax(amount: number, rate: TaxRate, rounding: Rounding) {
  const taxRate = rate / 100;
  const taxEx = applyRounding(amount / (1 + taxRate), rounding);
  const taxIn = applyRounding(amount * (1 + taxRate), rounding);
  const taxAmountFromEx = applyRounding(amount * taxRate, rounding);
  const taxAmountFromIn = amount - taxEx;
  return { taxEx, taxIn, taxAmountFromEx, taxAmountFromIn };
}

const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-background";

const radioClass = (active: boolean) =>
  `flex-1 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer text-center ${
    active
      ? "bg-accent text-white border-accent"
      : "bg-surface border-border text-muted hover:border-accent/50"
  }`;

const fmt = (n: number) =>
  n.toLocaleString("ja-JP", { maximumFractionDigits: 0 });

let nextId = 4;

export default function ShohiZeiKeisan() {
  const [mode, setMode] = useState<Mode>("tax-out");
  const [amount, setAmount] = useState("");
  const [taxRate, setTaxRate] = useState<TaxRate>(10);
  const [rounding, setRounding] = useState<Rounding>("floor");
  const [multiMode, setMultiMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: "", amount: "", taxRate: 10 },
    { id: 2, name: "", amount: "", taxRate: 10 },
    { id: 3, name: "", amount: "", taxRate: 8 },
  ]);

  // Single item calculation
  const singleResult = useMemo(() => {
    const n = parseFloat(amount.replace(/,/g, ""));
    if (!n || n <= 0 || n > 1_000_000_000) return null;
    const rate = taxRate / 100;
    if (mode === "tax-out") {
      // 税抜き → 税込み
      const taxAmount = applyRounding(n * rate, rounding);
      const taxIn = n + taxAmount;
      return { taxEx: n, taxIn, taxAmount };
    } else {
      // 税込み → 税抜き
      const taxEx = applyRounding(n / (1 + rate), rounding);
      const taxAmount = n - taxEx;
      return { taxEx, taxIn: n, taxAmount };
    }
  }, [amount, taxRate, rounding, mode]);

  // Multi-item invoice calculation
  const multiResult = useMemo(() => {
    const validItems = items
      .map((item) => ({
        ...item,
        amountNum: parseFloat(item.amount.replace(/,/g, "")),
      }))
      .filter((item) => item.amountNum > 0);

    if (validItems.length === 0) return null;

    // Group by tax rate for invoice display
    const groups: Record<
      TaxRate,
      { subtotalEx: number; tax: number; items: typeof validItems }
    > = {
      10: { subtotalEx: 0, tax: 0, items: [] },
      8: { subtotalEx: 0, tax: 0, items: [] },
    };

    for (const item of validItems) {
      const rate = item.taxRate / 100;
      let amountEx: number;
      let taxAmount: number;

      if (mode === "tax-out") {
        amountEx = item.amountNum;
        taxAmount = applyRounding(item.amountNum * rate, rounding);
      } else {
        amountEx = applyRounding(item.amountNum / (1 + rate), rounding);
        taxAmount = item.amountNum - amountEx;
      }

      groups[item.taxRate].subtotalEx += amountEx;
      groups[item.taxRate].tax += taxAmount;
      groups[item.taxRate].items.push(item);
    }

    const total10Ex = groups[10].subtotalEx;
    const tax10 = applyRounding(groups[10].subtotalEx * 0.1, rounding);
    const total10In = total10Ex + tax10;

    const total8Ex = groups[8].subtotalEx;
    const tax8 = applyRounding(groups[8].subtotalEx * 0.08, rounding);
    const total8In = total8Ex + tax8;

    const grandTotalEx = total10Ex + total8Ex;
    const grandTax = tax10 + tax8;
    const grandTotalIn = grandTotalEx + grandTax;

    return {
      groups,
      total10Ex,
      tax10,
      total10In,
      total8Ex,
      tax8,
      total8In,
      grandTotalEx,
      grandTax,
      grandTotalIn,
      has10: groups[10].items.length > 0,
      has8: groups[8].items.length > 0,
    };
  }, [items, mode, rounding]);

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { id: nextId++, name: "", amount: "", taxRate: 10 },
    ]);
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItem = useCallback(
    (id: number, field: keyof Omit<Item, "id">, value: string | TaxRate) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  const copyResult = useCallback(() => {
    if (!singleResult && !multiResult) return;
    let text = "";
    if (!multiMode && singleResult) {
      text = [
        `【消費税計算結果】`,
        `税率: ${taxRate}%`,
        `税抜き金額: ¥${fmt(singleResult.taxEx)}`,
        `消費税額: ¥${fmt(singleResult.taxAmount)}`,
        `税込み金額: ¥${fmt(singleResult.taxIn)}`,
      ].join("\n");
    } else if (multiMode && multiResult) {
      const lines = ["【インボイス計算結果】", ""];
      if (multiResult.has10) {
        lines.push(`■ 標準税率（10%）`);
        lines.push(`  税抜き小計: ¥${fmt(multiResult.total10Ex)}`);
        lines.push(`  消費税（10%）: ¥${fmt(multiResult.tax10)}`);
        lines.push(`  税込み小計: ¥${fmt(multiResult.total10In)}`);
        lines.push("");
      }
      if (multiResult.has8) {
        lines.push(`■ 軽減税率（8%）`);
        lines.push(`  税抜き小計: ¥${fmt(multiResult.total8Ex)}`);
        lines.push(`  消費税（8%）: ¥${fmt(multiResult.tax8)}`);
        lines.push(`  税込み小計: ¥${fmt(multiResult.total8In)}`);
        lines.push("");
      }
      lines.push(`■ 合計`);
      lines.push(`  税抜き合計: ¥${fmt(multiResult.grandTotalEx)}`);
      lines.push(`  消費税合計: ¥${fmt(multiResult.grandTax)}`);
      lines.push(`  税込み合計: ¥${fmt(multiResult.grandTotalIn)}`);
      text = lines.join("\n");
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [singleResult, multiResult, multiMode, taxRate]);

  return (
    <div className="space-y-4">
      {/* Mode + settings card */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
        {/* 計算モード */}
        <div>
          <p className="text-xs text-muted mb-2">計算モード</p>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("tax-out")}
              className={radioClass(mode === "tax-out")}
            >
              税抜き → 税込み
            </button>
            <button
              onClick={() => setMode("tax-in")}
              className={radioClass(mode === "tax-in")}
            >
              税込み → 税抜き
            </button>
          </div>
        </div>

        {/* 端数処理 */}
        <div>
          <p className="text-xs text-muted mb-2">端数処理</p>
          <div className="flex gap-2">
            {(
              [
                ["floor", "切り捨て"],
                ["round", "四捨五入"],
                ["ceil", "切り上げ"],
              ] as [Rounding, string][]
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setRounding(val)}
                className={radioClass(rounding === val)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 複数商品モード toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">複数商品モード（インボイス）</span>
          <button
            onClick={() => setMultiMode((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              multiMode ? "bg-accent" : "bg-border"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                multiMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Single item input */}
      {!multiMode && (
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
          <h2 className="font-bold text-sm">
            {mode === "tax-out" ? "税抜き金額を入力" : "税込み金額を入力"}
          </h2>

          {/* Tax rate */}
          <div>
            <p className="text-xs text-muted mb-2">税率</p>
            <div className="flex gap-2">
              {([10, 8] as TaxRate[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setTaxRate(r)}
                  className={radioClass(taxRate === r)}
                >
                  {r}%{r === 8 ? "（軽減）" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <p className="text-xs text-muted mb-1">
              {mode === "tax-out" ? "税抜き金額（円）" : "税込み金額（円）"}
            </p>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">
                ¥
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="10000"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^0-9]/g, ""))
                }
                className={`${inputClass} pl-7`}
              />
            </div>
          </div>

          {/* Result */}
          {singleResult && (
            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
              {[
                { label: "税抜き金額", value: singleResult.taxEx, highlight: mode === "tax-in" },
                { label: `消費税額（${taxRate}%）`, value: singleResult.taxAmount, highlight: false },
                { label: "税込み金額", value: singleResult.taxIn, highlight: mode === "tax-out" },
              ].map(({ label, value, highlight }) => (
                <div
                  key={label}
                  className={`flex justify-between items-center px-4 py-3 ${
                    highlight ? "bg-accent/10" : "bg-surface"
                  }`}
                >
                  <span className="text-sm text-muted">{label}</span>
                  <span
                    className={`font-mono font-bold ${
                      highlight ? "text-accent text-xl" : "text-base"
                    }`}
                  >
                    ¥{fmt(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Multi-item input */}
      {multiMode && (
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
          <h2 className="font-bold text-sm">
            商品リスト（{mode === "tax-out" ? "税抜き" : "税込み"}金額を入力）
          </h2>

          {/* Header */}
          <div className="grid grid-cols-[1fr_120px_80px_32px] gap-2 text-xs text-muted px-1">
            <span>商品名</span>
            <span className="text-right">金額（円）</span>
            <span className="text-center">税率</span>
            <span />
          </div>

          {/* Item rows */}
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_120px_80px_32px] gap-2 items-center"
            >
              <input
                type="text"
                placeholder="商品名"
                value={item.name}
                onChange={(e) => updateItem(item.id, "name", e.target.value)}
                className="px-2 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
              />
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted text-xs">
                  ¥
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={item.amount}
                  onChange={(e) =>
                    updateItem(
                      item.id,
                      "amount",
                      e.target.value.replace(/[^0-9]/g, "")
                    )
                  }
                  className="w-full pl-5 pr-2 py-2 border border-border rounded-lg text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                />
              </div>
              <select
                value={item.taxRate}
                onChange={(e) =>
                  updateItem(item.id, "taxRate", Number(e.target.value) as TaxRate)
                }
                className="py-2 px-1 border border-border rounded-lg text-sm focus:outline-none bg-background text-center"
              >
                <option value={10}>10%</option>
                <option value={8}>8%</option>
              </select>
              <button
                onClick={() => removeItem(item.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                aria-label="削除"
              >
                ×
              </button>
            </div>
          ))}

          <button
            onClick={addItem}
            className="w-full py-2 border border-dashed border-border rounded-xl text-sm text-muted hover:border-accent hover:text-accent transition-colors"
          >
            + 商品を追加
          </button>

          {/* Invoice result */}
          {multiResult && (
            <div className="mt-2 rounded-xl border border-border overflow-hidden divide-y divide-border">
              {/* 10% group */}
              {multiResult.has10 && (
                <div className="p-3 bg-surface">
                  <p className="text-xs font-bold text-muted mb-2">
                    ■ 標準税率（10%）
                  </p>
                  <div className="space-y-1">
                    {[
                      { label: "税抜き小計", value: multiResult.total10Ex },
                      { label: "消費税（10%）", value: multiResult.tax10 },
                      { label: "税込み小計", value: multiResult.total10In },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted">{label}</span>
                        <span className="font-mono">¥{fmt(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8% group */}
              {multiResult.has8 && (
                <div className="p-3 bg-surface">
                  <p className="text-xs font-bold text-muted mb-2">
                    ■ 軽減税率（8%）
                  </p>
                  <div className="space-y-1">
                    {[
                      { label: "税抜き小計", value: multiResult.total8Ex },
                      { label: "消費税（8%）", value: multiResult.tax8 },
                      { label: "税込み小計", value: multiResult.total8In },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted">{label}</span>
                        <span className="font-mono">¥{fmt(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grand total */}
              <div className="p-3 bg-accent/10">
                <div className="space-y-1">
                  {[
                    { label: "税抜き合計", value: multiResult.grandTotalEx },
                    { label: "消費税合計", value: multiResult.grandTax },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted">{label}</span>
                      <span className="font-mono">¥{fmt(value)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-1 border-t border-border">
                    <span className="text-sm font-bold">税込み合計</span>
                    <span className="font-mono font-bold text-accent text-xl">
                      ¥{fmt(multiResult.grandTotalIn)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Copy button */}
      {(singleResult || multiResult) && (
        <button
          onClick={copyResult}
          className="w-full py-3 bg-accent text-white rounded-2xl font-medium text-sm transition-all hover:opacity-90 active:scale-95"
        >
          {copied ? "コピーしました！" : "結果をコピー"}
        </button>
      )}

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center h-24 text-xs text-muted">
        広告
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この消費税計算ツールツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">消費税込み・抜き・税額を瞬時に計算。入力するだけで即座に結果を表示します。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">利用料金はかかりますか？</summary>
      <p className="mt-2 text-sm text-gray-600">完全無料でご利用いただけます。会員登録も不要です。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">計算結果は正確ですか？</summary>
      <p className="mt-2 text-sm text-gray-600">一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この消費税計算ツールツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "消費税込み・抜き・税額を瞬時に計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "消費税計算ツール",
  "description": "消費税込み・抜き・税額を瞬時に計算",
  "url": "https://tools.loresync.dev/shohi-zei-keisan",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "ja"
}`
        }}
      />
      </div>
  );
}
