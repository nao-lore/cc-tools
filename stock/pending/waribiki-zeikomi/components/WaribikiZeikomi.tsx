"use client";

import { useState, useMemo } from "react";

type DiscountType = "percent" | "yen";

type Discount = {
  id: number;
  type: DiscountType;
  value: string;
};

function fmt(n: number): string {
  return "¥" + Math.round(n).toLocaleString("ja-JP");
}

const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-surface";

let nextId = 1;

export default function WaribikiZeikomi() {
  const [mode, setMode] = useState<"normal" | "reverse">("normal");

  // Normal mode
  const [basePrice, setBasePrice] = useState("");
  const [taxRate, setTaxRate] = useState<10 | 8>(10);
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  // Reverse mode
  const [taxIncludedPrice, setTaxIncludedPrice] = useState("");
  const [reverseTaxRate, setReverseTaxRate] = useState<10 | 8>(10);

  function addDiscount() {
    setDiscounts((prev) => [
      ...prev,
      { id: nextId++, type: "percent", value: "" },
    ]);
  }

  function removeDiscount(id: number) {
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
  }

  function updateDiscount(id: number, field: keyof Discount, val: string) {
    setDiscounts((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, [field]: val } : d
      )
    );
  }

  const normalResult = useMemo(() => {
    const base = parseFloat(basePrice.replace(/,/g, ""));
    if (!base || base <= 0) return null;

    // Apply discounts sequentially
    let priceAfterDiscount = base;
    let totalDiscountYen = 0;

    for (const d of discounts) {
      const v = parseFloat(d.value);
      if (!v || v <= 0) continue;
      if (d.type === "percent") {
        const cut = priceAfterDiscount * (v / 100);
        priceAfterDiscount -= cut;
        totalDiscountYen += cut;
      } else {
        priceAfterDiscount = Math.max(0, priceAfterDiscount - v);
        totalDiscountYen += Math.min(priceAfterDiscount + v, v);
      }
    }

    const taxAmount = priceAfterDiscount * (taxRate / 100);
    const finalPrice = priceAfterDiscount + taxAmount;

    return {
      taxExclusive: priceAfterDiscount,
      taxAmount,
      taxInclusive: finalPrice,
      totalDiscount: totalDiscountYen,
      finalPrice,
    };
  }, [basePrice, taxRate, discounts]);

  const reverseResult = useMemo(() => {
    const included = parseFloat(taxIncludedPrice.replace(/,/g, ""));
    if (!included || included <= 0) return null;
    const divisor = 1 + reverseTaxRate / 100;
    const taxExclusive = included / divisor;
    const taxAmount = included - taxExclusive;
    return { taxExclusive, taxAmount, taxInclusive: included };
  }, [taxIncludedPrice, reverseTaxRate]);

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <label className="block text-xs text-muted mb-2">計算モード</label>
        <div className="flex gap-2">
          {(["normal", "reverse"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                mode === m
                  ? "bg-accent text-white border-accent"
                  : "bg-surface border-border text-muted hover:border-accent/50"
              }`}
            >
              {m === "normal" ? "通常計算" : "逆算（税込み→税抜き）"}
            </button>
          ))}
        </div>
      </div>

      {mode === "normal" ? (
        <>
          {/* Input card */}
          <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
            {/* Base price */}
            <div>
              <label className="block text-xs text-muted mb-1">本体価格（税抜き）</label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">¥</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="10,000"
                  value={basePrice}
                  onChange={(e) =>
                    setBasePrice(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  className={inputClass + " pl-7"}
                />
              </div>
            </div>

            {/* Tax rate */}
            <div>
              <label className="block text-xs text-muted mb-2">消費税率</label>
              <div className="flex gap-2">
                {([10, 8] as const).map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setTaxRate(rate)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                      taxRate === rate
                        ? "bg-accent text-white border-accent"
                        : "bg-surface border-border text-muted hover:border-accent/50"
                    }`}
                  >
                    {rate}%{rate === 8 ? "（軽減税率）" : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Discounts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs text-muted">割引</label>
                <button
                  onClick={addDiscount}
                  className="text-xs px-2.5 py-1 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-opacity"
                >
                  ＋ 割引を追加
                </button>
              </div>

              {discounts.length === 0 && (
                <p className="text-xs text-muted">割引なし</p>
              )}

              <div className="space-y-2">
                {discounts.map((d, i) => (
                  <div key={d.id} className="flex gap-2 items-center">
                    <span className="text-xs text-muted w-5 shrink-0">{i + 1}</span>
                    <select
                      value={d.type}
                      onChange={(e) =>
                        updateDiscount(d.id, "type", e.target.value)
                      }
                      className="px-2 py-2 border border-border rounded-lg text-sm bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="percent">% OFF</option>
                      <option value="yen">円引き</option>
                    </select>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder={d.type === "percent" ? "10" : "500"}
                        value={d.value}
                        onChange={(e) =>
                          updateDiscount(
                            d.id,
                            "value",
                            e.target.value.replace(/[^0-9.]/g, "")
                          )
                        }
                        className={inputClass}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                        {d.type === "percent" ? "%" : "円"}
                      </span>
                    </div>
                    <button
                      onClick={() => removeDiscount(d.id)}
                      className="text-muted hover:text-red-500 transition-colors text-lg leading-none px-1"
                      aria-label="削除"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Result card */}
          {normalResult && (
            <div className="bg-surface rounded-2xl border border-border p-4">
              <h2 className="font-bold text-sm mb-3">計算結果</h2>
              <div className="divide-y divide-border">
                {normalResult.totalDiscount > 0 && (
                  <Row
                    label="割引額"
                    value={"- " + fmt(normalResult.totalDiscount)}
                    valueClass="text-red-500"
                  />
                )}
                <Row
                  label="税抜き価格"
                  value={fmt(normalResult.taxExclusive)}
                />
                <Row
                  label={`消費税（${taxRate}%）`}
                  value={fmt(normalResult.taxAmount)}
                  valueClass="text-muted"
                />
                <Row
                  label="税込み価格"
                  value={fmt(normalResult.taxInclusive)}
                />
              </div>
              {/* Final highlight */}
              <div className="mt-4 bg-accent/10 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm font-medium">最終価格</span>
                <span className="text-2xl font-bold text-accent">
                  {fmt(normalResult.finalPrice)}
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Reverse mode input */}
          <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
            <div>
              <label className="block text-xs text-muted mb-1">税込み価格</label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">¥</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="11,000"
                  value={taxIncludedPrice}
                  onChange={(e) =>
                    setTaxIncludedPrice(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  className={inputClass + " pl-7"}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted mb-2">消費税率</label>
              <div className="flex gap-2">
                {([10, 8] as const).map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setReverseTaxRate(rate)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                      reverseTaxRate === rate
                        ? "bg-accent text-white border-accent"
                        : "bg-surface border-border text-muted hover:border-accent/50"
                    }`}
                  >
                    {rate}%{rate === 8 ? "（軽減税率）" : ""}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {reverseResult && (
            <div className="bg-surface rounded-2xl border border-border p-4">
              <h2 className="font-bold text-sm mb-3">計算結果</h2>
              <div className="divide-y divide-border">
                <Row label="税込み価格" value={fmt(reverseResult.taxInclusive)} />
                <Row
                  label={`消費税（${reverseTaxRate}%）`}
                  value={fmt(reverseResult.taxAmount)}
                  valueClass="text-muted"
                />
              </div>
              <div className="mt-4 bg-accent/10 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm font-medium">税抜き価格</span>
                <span className="text-2xl font-bold text-accent">
                  {fmt(reverseResult.taxExclusive)}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center h-20 text-xs text-muted">
        広告
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-sm text-muted">{label}</span>
      <span className={`text-sm font-medium font-mono ${valueClass}`}>{value}</span>
    </div>
  );
}
