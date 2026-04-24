"use client";

import { useState, useCallback, useMemo } from "react";
import {
  TaxEntry,
  TaxResult,
  calculateEntry,
  formatCurrency,
  generateInvoiceText,
} from "../lib/tax";

function newEntry(): TaxEntry {
  return {
    id: crypto.randomUUID(),
    label: "",
    amount: "",
    taxMode: "exclusive",
  };
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
      <span className={highlight ? "text-primary" : ""}>{value}</span>
    </div>
  );
}

function EntryCard({
  entry,
  index,
  canRemove,
  onChange,
  onRemove,
  result,
}: {
  entry: TaxEntry;
  index: number;
  canRemove: boolean;
  onChange: (id: string, updates: Partial<TaxEntry>) => void;
  onRemove: (id: string) => void;
  result: TaxResult;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold">
            {index + 1}
          </span>
          <input
            type="text"
            placeholder={`項目名（例: デザイン制作費）`}
            value={entry.label}
            onChange={(e) => onChange(entry.id, { label: e.target.value })}
            className="flex-1 min-w-0 text-sm border-b border-border bg-transparent py-1 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        {canRemove && (
          <button
            onClick={() => onRemove(entry.id)}
            className="ml-3 text-muted hover:text-danger transition-colors text-lg leading-none"
            aria-label="項目を削除"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-xs text-muted mb-1">報酬額（円）</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={entry.amount}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "");
              onChange(entry.id, { amount: v });
            }}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent"
          />
        </div>
        <div className="sm:w-40">
          <label className="block text-xs text-muted mb-1">消費税の扱い</label>
          <select
            value={entry.taxMode}
            onChange={(e) =>
              onChange(entry.id, {
                taxMode: e.target.value as "inclusive" | "exclusive",
              })
            }
            className="w-full px-3 py-2.5 border border-border rounded-lg bg-accent focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="exclusive">税抜</option>
            <option value="inclusive">税込</option>
          </select>
        </div>
      </div>

      {parseFloat(entry.amount) > 0 && (
        <div className="bg-accent rounded-lg p-4 divide-y divide-border">
          <ResultRow
            label="報酬額（税抜）"
            value={`¥${formatCurrency(result.netAmount)}`}
          />
          <ResultRow
            label="消費税（10%）"
            value={`¥${formatCurrency(result.consumptionTax)}`}
          />
          <ResultRow
            label="報酬額（税込）"
            value={`¥${formatCurrency(result.grossAmount)}`}
          />
          <ResultRow
            label="源泉徴収税額"
            value={`¥${formatCurrency(result.withholdingTax)}`}
            highlight
          />
          <ResultRow
            label="差引支払額（手取り）"
            value={`¥${formatCurrency(result.takeHome)}`}
            large
          />
        </div>
      )}
    </div>
  );
}

export default function TaxCalculator() {
  const [entries, setEntries] = useState<TaxEntry[]>([newEntry()]);
  const [copied, setCopied] = useState(false);

  const handleChange = useCallback(
    (id: string, updates: Partial<TaxEntry>) => {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
      );
    },
    []
  );

  const handleRemove = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleAdd = useCallback(() => {
    setEntries((prev) => [...prev, newEntry()]);
  }, []);

  const results = useMemo(
    () => entries.map((e) => calculateEntry(e)),
    [entries]
  );

  const totals = useMemo<TaxResult>(() => {
    return results.reduce(
      (acc, r) => ({
        netAmount: acc.netAmount + r.netAmount,
        consumptionTax: acc.consumptionTax + r.consumptionTax,
        grossAmount: acc.grossAmount + r.grossAmount,
        withholdingTax: acc.withholdingTax + r.withholdingTax,
        takeHome: acc.takeHome + r.takeHome,
      }),
      {
        netAmount: 0,
        consumptionTax: 0,
        grossAmount: 0,
        withholdingTax: 0,
        takeHome: 0,
      }
    );
  }, [results]);

  const hasAnyAmount = results.some((r) => r.netAmount > 0);

  const handleCopy = useCallback(async () => {
    const validEntries = entries
      .map((e, i) => ({ label: e.label, result: results[i] }))
      .filter((e) => e.result.netAmount > 0);
    const text = generateInvoiceText(validEntries, totals);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [entries, results, totals]);

  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          index={i}
          canRemove={entries.length > 1}
          onChange={handleChange}
          onRemove={handleRemove}
          result={results[i]}
        />
      ))}

      <button
        onClick={handleAdd}
        className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted hover:border-primary hover:text-primary transition-colors text-sm font-medium"
      >
        ＋ 項目を追加
      </button>

      {hasAnyAmount && entries.length > 1 && (
        <div className="bg-card border-2 border-primary/20 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-base mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            年間合計
          </h3>
          <div className="divide-y divide-border">
            <ResultRow
              label="報酬額合計（税抜）"
              value={`¥${formatCurrency(totals.netAmount)}`}
            />
            <ResultRow
              label="消費税合計"
              value={`¥${formatCurrency(totals.consumptionTax)}`}
            />
            <ResultRow
              label="報酬額合計（税込）"
              value={`¥${formatCurrency(totals.grossAmount)}`}
            />
            <ResultRow
              label="源泉徴収税額合計"
              value={`¥${formatCurrency(totals.withholdingTax)}`}
              highlight
            />
            <ResultRow
              label="差引支払額合計（手取り）"
              value={`¥${formatCurrency(totals.takeHome)}`}
              large
            />
          </div>
        </div>
      )}

      {hasAnyAmount && (
        <button
          onClick={handleCopy}
          className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors text-sm"
        >
          {copied ? "✓ コピーしました" : "請求書用テキストをコピー"}
        </button>
      )}

      {/* FAQ */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            { q: "税込価格と税抜価格の計算方法は？", a: "税抜価格に消費税率を掛けて税額を計算します。税込価格から税抜価格を求める場合は「税込価格 ÷ (1 + 税率)」で計算します。日本の消費税率は標準10%、軽減税率は8%です。" },
            { q: "軽減税率8%が適用される商品は？", a: "飲食料品（酒類・外食を除く）と定期購読の新聞が対象です。テイクアウトは8%、イートインは10%となります。" },
            { q: "インボイス制度に対応した計算はできますか？", a: "本ツールでは消費税の基本的な計算に対応しています。インボイス制度では適格請求書に税率ごとの消費税額を記載する必要があります。税額は1円未満を切り捨て・切り上げ・四捨五入で処理します。" },
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
              { "@type": "Question", "name": "税込価格と税抜価格の計算方法は？", "acceptedAnswer": { "@type": "Answer", "text": "税抜価格に消費税率を掛けて税額を計算します。日本の消費税率は標準10%、軽減税率は8%です。" } },
              { "@type": "Question", "name": "軽減税率8%が適用される商品は？", "acceptedAnswer": { "@type": "Answer", "text": "飲食料品（酒類・外食を除く）と定期購読の新聞が対象です。テイクアウトは8%、イートインは10%となります。" } },
              { "@type": "Question", "name": "インボイス制度に対応した計算はできますか？", "acceptedAnswer": { "@type": "Answer", "text": "本ツールでは消費税の基本的な計算に対応しています。インボイス制度では適格請求書に税率ごとの消費税額を記載する必要があります。" } },
            ]
          }) }}
        />
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">関連ツール</p>
          <div className="flex flex-wrap gap-2">
            <a href="/waribiki-keisan" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">割引計算ツール</a>
            <a href="/tedori-keisan" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">手取り計算ツール</a>
          </div>
        </div>
      </div>
    </div>
  );
}
