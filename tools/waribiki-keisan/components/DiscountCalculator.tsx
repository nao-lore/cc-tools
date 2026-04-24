"use client";

import { useState, useCallback, useMemo } from "react";

type DiscountMode = "percent" | "amount" | "wari";

interface Item {
  id: string;
  label: string;
  price: string;
  discount: string;
}

function newItem(): Item {
  return {
    id: crypto.randomUUID(),
    label: "",
    price: "",
    discount: "",
  };
}

function formatCurrency(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

function calcDiscount(
  price: number,
  discount: number,
  mode: DiscountMode
): {
  discountAmount: number;
  discountedPrice: number;
  taxPrice10: number;
  taxPrice8: number;
  savingRate: number;
} {
  if (price <= 0 || discount < 0) {
    return {
      discountAmount: 0,
      discountedPrice: price,
      taxPrice10: price * 1.1,
      taxPrice8: price * 1.08,
      savingRate: 0,
    };
  }

  let discountAmount = 0;
  if (mode === "percent") {
    discountAmount = price * (Math.min(discount, 100) / 100);
  } else if (mode === "wari") {
    // 日本式: 3割引 = 30%OFF, 1割 = 10%
    discountAmount = price * (Math.min(discount, 10) / 10);
  } else {
    discountAmount = Math.min(discount, price);
  }

  const discountedPrice = Math.max(0, price - discountAmount);
  return {
    discountAmount,
    discountedPrice,
    taxPrice10: discountedPrice * 1.1,
    taxPrice8: discountedPrice * 1.08,
    savingRate: price > 0 ? (discountAmount / price) * 100 : 0,
  };
}

function getSavingLabel(rate: number): string {
  if (rate >= 70) return "超お得！";
  if (rate >= 50) return "かなりお得";
  if (rate >= 30) return "お得";
  if (rate >= 10) return "まあまあ";
  return "ちょっとだけ";
}

function ResultRow({
  label,
  value,
  highlight,
  large,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  large?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center py-2 ${large ? "text-lg font-bold" : ""} ${highlight ? "text-primary" : ""}`}
    >
      <span className="text-muted text-sm">{label}</span>
      <span className={highlight ? "text-primary font-semibold" : ""}>{value}</span>
    </div>
  );
}

function ItemCard({
  item,
  index,
  canRemove,
  mode,
  onChange,
  onRemove,
}: {
  item: Item;
  index: number;
  canRemove: boolean;
  mode: DiscountMode;
  onChange: (id: string, updates: Partial<Item>) => void;
  onRemove: (id: string) => void;
}) {
  const price = parseFloat(item.price.replace(/,/g, "")) || 0;
  const discount = parseFloat(item.discount) || 0;
  const result = calcDiscount(price, discount, mode);
  const hasValue = price > 0;

  const discountPlaceholder =
    mode === "percent" ? "20" : mode === "wari" ? "3" : "500";
  const discountUnit =
    mode === "percent" ? "%" : mode === "wari" ? "割引き" : "円引き";

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">
            {index + 1}
          </span>
          <input
            type="text"
            placeholder="商品名（例: ジャケット）"
            value={item.label}
            onChange={(e) => onChange(item.id, { label: e.target.value })}
            className="flex-1 min-w-0 text-sm border-b border-border bg-transparent py-1 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        {canRemove && (
          <button
            onClick={() => onRemove(item.id)}
            className="ml-3 text-muted hover:text-danger transition-colors text-lg leading-none"
            aria-label="項目を削除"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-xs text-muted mb-1">元の価格（円）</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={item.price}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "");
              onChange(item.id, { price: v });
            }}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
          />
        </div>
        <div className="sm:w-44">
          <label className="block text-xs text-muted mb-1">
            {mode === "percent"
              ? "割引率（%）"
              : mode === "wari"
                ? "割引き（例: 3=3割引）"
                : "割引額（円）"}
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              placeholder={discountPlaceholder}
              value={item.discount}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "");
                onChange(item.id, { discount: v });
              }}
              className="w-full px-3 py-2.5 pr-14 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted pointer-events-none">
              {discountUnit}
            </span>
          </div>
        </div>
      </div>

      {hasValue && (
        <div className="bg-accent rounded-lg p-4 divide-y divide-border">
          <ResultRow
            label="元の価格"
            value={`¥${formatCurrency(price)}`}
          />
          <ResultRow
            label="割引額"
            value={`-¥${formatCurrency(result.discountAmount)}`}
            highlight
          />
          <ResultRow
            label="割引後の価格"
            value={`¥${formatCurrency(result.discountedPrice)}`}
            large
          />
          <ResultRow
            label="税込（10%）"
            value={`¥${formatCurrency(result.taxPrice10)}`}
          />
          <ResultRow
            label="税込（8%・軽減税率）"
            value={`¥${formatCurrency(result.taxPrice8)}`}
          />
          <div className="flex justify-between items-center py-2">
            <span className="text-muted text-sm">お得度</span>
            <span className="text-sm font-medium">
              {result.savingRate.toFixed(1)}% OFF —{" "}
              <span className="text-primary">{getSavingLabel(result.savingRate)}</span>
            </span>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            { q: "「3割引」と「30%OFF」は同じですか？", a: "はい、同じです。日本語の「割」は10%を1割として表します。3割引＝30%OFFです。本ツールでは「割引き」入力にも対応しています。" },
            { q: "税込価格に割引を適用するには？", a: "税込価格を元の価格として入力して割引計算してください。割引後の税込価格が求められます。税抜価格で計算してから消費税を加算する場合は税計算ツールと組み合わせてご利用ください。" },
            { q: "複数商品の合計割引額を計算できますか？", a: "はい。「商品を追加」ボタンで複数商品を登録でき、それぞれに異なる割引率・割引額を設定して合計の節約額と支払額を計算できます。" },
          ].map(({ q, a }) => (
            <div key={q} className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-800 mb-1">Q. {q}</p>
              <p className="text-sm text-gray-600">A. {a}</p>
            </div>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "「3割引」と「30%OFF」は同じですか？", "acceptedAnswer": { "@type": "Answer", "text": "はい、同じです。日本語の「割」は10%を1割として表します。3割引＝30%OFFです。" } },
              { "@type": "Question", "name": "税込価格に割引を適用するには？", "acceptedAnswer": { "@type": "Answer", "text": "税込価格を元の価格として入力して割引計算してください。" } },
              { "@type": "Question", "name": "複数商品の合計割引額を計算できますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい。商品を追加ボタンで複数商品を登録でき、合計の節約額と支払額を計算できます。" } },
            ]
          }) }}
        />
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">関連ツール</p>
          <div className="flex flex-wrap gap-2">
            <a href="/tax-calculator" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">消費税計算ツール</a>
            <a href="/gacha-cost-ceiling" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">ガチャ天井計算</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiscountCalculator() {
  const [mode, setMode] = useState<DiscountMode>("percent");
  const [items, setItems] = useState<Item[]>([newItem()]);

  const handleChange = useCallback(
    (id: string, updates: Partial<Item>) => {
      setItems((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
      );
    },
    []
  );

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleAdd = useCallback(() => {
    setItems((prev) => [...prev, newItem()]);
  }, []);

  const results = useMemo(
    () =>
      items.map((item) => {
        const price = parseFloat(item.price.replace(/,/g, "")) || 0;
        const discount = parseFloat(item.discount) || 0;
        return calcDiscount(price, discount, mode);
      }),
    [items, mode]
  );

  const totals = useMemo(() => {
    return results.reduce(
      (acc, r) => ({
        discountAmount: acc.discountAmount + r.discountAmount,
        discountedPrice: acc.discountedPrice + r.discountedPrice,
        taxPrice10: acc.taxPrice10 + r.taxPrice10,
        taxPrice8: acc.taxPrice8 + r.taxPrice8,
      }),
      { discountAmount: 0, discountedPrice: 0, taxPrice10: 0, taxPrice8: 0 }
    );
  }, [results]);

  const hasAnyAmount = results.some((r) => r.discountedPrice > 0 || r.discountAmount > 0);

  const modeLabels: { value: DiscountMode; label: string }[] = [
    { value: "percent", label: "% 割引" },
    { value: "wari", label: "○割引き" },
    { value: "amount", label: "円引き" },
  ];

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs text-muted mb-2">割引の種類</p>
        <div className="flex gap-2">
          {modeLabels.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === value
                  ? "bg-primary text-white"
                  : "bg-accent text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {mode === "wari" && (
          <p className="text-xs text-muted mt-2">
            日本式: 3割引 = 30%OFF、5割引 = 50%OFF（半額）、1〜10の数字で入力
          </p>
        )}
      </div>

      {items.map((item, i) => (
        <ItemCard
          key={item.id}
          item={item}
          index={i}
          canRemove={items.length > 1}
          mode={mode}
          onChange={handleChange}
          onRemove={handleRemove}
        />
      ))}

      <button
        onClick={handleAdd}
        className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted hover:border-primary hover:text-primary transition-colors text-sm font-medium"
      >
        ＋ 商品を追加
      </button>

      {hasAnyAmount && items.length > 1 && (
        <div className="bg-card border-2 border-primary/20 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-base mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            合計
          </h3>
          <div className="divide-y divide-border">
            <ResultRow
              label="割引額合計"
              value={`-¥${formatCurrency(totals.discountAmount)}`}
              highlight
            />
            <ResultRow
              label="割引後合計"
              value={`¥${formatCurrency(totals.discountedPrice)}`}
              large
            />
            <ResultRow
              label="税込合計（10%）"
              value={`¥${formatCurrency(totals.taxPrice10)}`}
            />
            <ResultRow
              label="税込合計（8%）"
              value={`¥${formatCurrency(totals.taxPrice8)}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
