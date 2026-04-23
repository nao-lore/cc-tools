"use client";

import { useState, useMemo, useCallback } from "react";

type Currency = "JPY" | "USD" | "EUR";
type TxType = "domestic" | "international";

type Transaction = {
  id: number;
  amount: string;
  currency: Currency;
  txType: TxType;
};

// PayPal Japan fee rates
const DOMESTIC_RATE = 0.036; // 3.6%
const DOMESTIC_FIXED = 40; // 40 JPY
const INTERNATIONAL_RATE = 0.041; // 4.1%
const INTERNATIONAL_FIXED = 40; // 40 JPY
const CURRENCY_CONVERSION_RATE = 0.04; // 4%
const WITHDRAWAL_FEE = 250; // JPY (under 50,000 JPY)
const WITHDRAWAL_FREE_THRESHOLD = 50_000; // 5万円以上は無料

// Approximate exchange rates (for display only)
const APPROX_RATES: Record<Currency, number> = {
  JPY: 1,
  USD: 150,
  EUR: 162,
};

const radioClass = (active: boolean) =>
  `flex-1 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer text-center ${
    active
      ? "bg-accent text-white border-accent"
      : "bg-surface border-border text-muted hover:border-accent/50"
  }`;

const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-background";

const fmt = (n: number, decimals = 0) =>
  n.toLocaleString("ja-JP", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

function calcFees(
  amountJpy: number,
  txType: TxType,
  currency: Currency
): {
  commissionFee: number;
  conversionFee: number;
  totalFee: number;
  netAmount: number;
  withdrawalFee: number;
  netAfterWithdrawal: number;
  effectiveRate: number;
} {
  const rate = txType === "domestic" ? DOMESTIC_RATE : INTERNATIONAL_RATE;
  const fixed = txType === "domestic" ? DOMESTIC_FIXED : INTERNATIONAL_FIXED;

  // Commission fee (percentage + fixed)
  const commissionFee = Math.floor(amountJpy * rate) + fixed;

  // Currency conversion fee (only for non-JPY)
  const conversionFee =
    currency !== "JPY" ? Math.floor(amountJpy * CURRENCY_CONVERSION_RATE) : 0;

  const totalFee = commissionFee + conversionFee;
  const netAmount = amountJpy - totalFee;

  // Withdrawal fee: 250 JPY if net < 50,000 JPY
  const withdrawalFee = netAmount < WITHDRAWAL_FREE_THRESHOLD ? WITHDRAWAL_FEE : 0;
  const netAfterWithdrawal = Math.max(0, netAmount - withdrawalFee);

  const effectiveRate =
    amountJpy > 0 ? ((amountJpy - netAfterWithdrawal) / amountJpy) * 100 : 0;

  return {
    commissionFee,
    conversionFee,
    totalFee,
    netAmount,
    withdrawalFee,
    netAfterWithdrawal,
    effectiveRate,
  };
}

let nextId = 3;

export default function PaypalFeeJp() {
  // Single mode state
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("JPY");
  const [txType, setTxType] = useState<TxType>("domestic");

  // Multi mode
  const [multiMode, setMultiMode] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, amount: "", currency: "JPY", txType: "domestic" },
    { id: 2, amount: "", currency: "USD", txType: "international" },
  ]);

  const [copied, setCopied] = useState(false);

  // Single result
  const singleResult = useMemo(() => {
    const raw = parseFloat(amount.replace(/,/g, ""));
    if (!raw || raw <= 0) return null;
    const amountJpy =
      currency === "JPY" ? raw : Math.round(raw * APPROX_RATES[currency]);
    return { amountJpy, ...calcFees(amountJpy, txType, currency) };
  }, [amount, currency, txType]);

  // Multi result
  const multiResult = useMemo(() => {
    const valid = transactions
      .map((tx) => {
        const raw = parseFloat(tx.amount.replace(/,/g, ""));
        if (!raw || raw <= 0) return null;
        const amountJpy =
          tx.currency === "JPY"
            ? raw
            : Math.round(raw * APPROX_RATES[tx.currency]);
        return { ...tx, amountJpy, fees: calcFees(amountJpy, tx.txType, tx.currency) };
      })
      .filter(Boolean) as Array<{
      id: number;
      amount: string;
      currency: Currency;
      txType: TxType;
      amountJpy: number;
      fees: ReturnType<typeof calcFees>;
    }>;

    if (valid.length === 0) return null;

    const totalReceived = valid.reduce((s, tx) => s + tx.amountJpy, 0);
    const totalFees = valid.reduce((s, tx) => s + tx.fees.totalFee, 0);
    const totalWithdrawal = valid.reduce((s, tx) => s + tx.fees.withdrawalFee, 0);
    const totalNet = valid.reduce((s, tx) => s + tx.fees.netAfterWithdrawal, 0);
    const effectiveRate =
      totalReceived > 0
        ? ((totalReceived - totalNet) / totalReceived) * 100
        : 0;

    return { valid, totalReceived, totalFees, totalWithdrawal, totalNet, effectiveRate };
  }, [transactions]);

  const addTransaction = useCallback(() => {
    setTransactions((prev) => [
      ...prev,
      { id: nextId++, amount: "", currency: "JPY", txType: "domestic" },
    ]);
  }, []);

  const removeTransaction = useCallback((id: number) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  const updateTransaction = useCallback(
    (id: number, field: keyof Omit<Transaction, "id">, value: string) => {
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? { ...tx, [field]: value } : tx))
      );
    },
    []
  );

  const copyResult = useCallback(() => {
    let text = "";
    if (!multiMode && singleResult) {
      text = [
        "【PayPal手数料計算結果】",
        `受取金額: ¥${fmt(singleResult.amountJpy)}（${currency}建）`,
        `取引種類: ${txType === "domestic" ? "国内" : "海外"}`,
        "",
        `手数料（取引）: ¥${fmt(singleResult.commissionFee)}`,
        singleResult.conversionFee > 0
          ? `通貨換算手数料: ¥${fmt(singleResult.conversionFee)}`
          : null,
        `手数料合計: ¥${fmt(singleResult.totalFee)}`,
        `手取り額（引出前）: ¥${fmt(singleResult.netAmount)}`,
        `引出手数料: ¥${fmt(singleResult.withdrawalFee)}`,
        `手取り額（引出後）: ¥${fmt(singleResult.netAfterWithdrawal)}`,
        `実効手数料率: ${fmt(singleResult.effectiveRate, 2)}%`,
      ]
        .filter(Boolean)
        .join("\n");
    } else if (multiMode && multiResult) {
      const lines = ["【PayPal手数料計算結果（複数取引）】", ""];
      multiResult.valid.forEach((tx, i) => {
        lines.push(
          `取引${i + 1}: ¥${fmt(tx.amountJpy)}（${tx.currency}/${
            tx.txType === "domestic" ? "国内" : "海外"
          }）→ 手取り ¥${fmt(tx.fees.netAfterWithdrawal)}`
        );
      });
      lines.push("");
      lines.push(`受取合計: ¥${fmt(multiResult.totalReceived)}`);
      lines.push(`手数料合計: ¥${fmt(multiResult.totalFees)}`);
      lines.push(`引出手数料合計: ¥${fmt(multiResult.totalWithdrawal)}`);
      lines.push(`手取り合計: ¥${fmt(multiResult.totalNet)}`);
      lines.push(`実効手数料率: ${fmt(multiResult.effectiveRate, 2)}%`);
      text = lines.join("\n");
    }
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [singleResult, multiResult, multiMode, currency, txType]);

  const hasResult = !multiMode ? !!singleResult : !!multiResult;

  return (
    <div className="space-y-4">
      {/* Settings card */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
        {/* Multi mode toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">複数取引モード</span>
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

        {/* Single mode controls */}
        {!multiMode && (
          <>
            <div>
              <p className="text-xs text-muted mb-2">取引種類</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setTxType("domestic")}
                  className={radioClass(txType === "domestic")}
                >
                  国内（3.6% + 40円）
                </button>
                <button
                  onClick={() => setTxType("international")}
                  className={radioClass(txType === "international")}
                >
                  海外（4.1% + 40円）
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted mb-2">通貨</p>
              <div className="flex gap-2">
                {(["JPY", "USD", "EUR"] as Currency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={radioClass(currency === c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {currency !== "JPY" && (
                <p className="text-xs text-muted mt-1">
                  ※ 参考レート（{currency === "USD" ? "1USD≈150円" : "1EUR≈162円"}）で換算。通貨換算手数料4%が加算されます。
                </p>
              )}
            </div>

            <div>
              <p className="text-xs text-muted mb-1">受取金額（{currency}）</p>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">
                  {currency === "JPY" ? "¥" : currency === "USD" ? "$" : "€"}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="10000"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  className={`${inputClass} pl-7`}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Single result */}
      {!multiMode && singleResult && (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {[
              {
                label: "受取金額（JPY換算）",
                value: `¥${fmt(singleResult.amountJpy)}`,
                highlight: false,
                sub: currency !== "JPY" ? `${amount} ${currency}` : undefined,
              },
              {
                label: `取引手数料（${txType === "domestic" ? "3.6%" : "4.1%"} + 40円）`,
                value: `¥${fmt(singleResult.commissionFee)}`,
                highlight: false,
                negative: true,
              },
              ...(singleResult.conversionFee > 0
                ? [
                    {
                      label: "通貨換算手数料（4%）",
                      value: `¥${fmt(singleResult.conversionFee)}`,
                      highlight: false,
                      negative: true,
                    },
                  ]
                : []),
              {
                label: "手数料合計",
                value: `¥${fmt(singleResult.totalFee)}`,
                highlight: false,
                negative: true,
              },
              {
                label: "手取り額（引出前）",
                value: `¥${fmt(singleResult.netAmount)}`,
                highlight: false,
              },
              {
                label: `引出手数料${singleResult.withdrawalFee === 0 ? "（5万円以上・無料）" : "（5万円未満）"}`,
                value: `¥${fmt(singleResult.withdrawalFee)}`,
                highlight: false,
                negative: singleResult.withdrawalFee > 0,
              },
              {
                label: "手取り額（引出後）",
                value: `¥${fmt(singleResult.netAfterWithdrawal)}`,
                highlight: true,
              },
            ].map(({ label, value, highlight, negative, sub }) => (
              <div
                key={label}
                className={`flex justify-between items-center px-4 py-3 ${
                  highlight ? "bg-accent/10" : "bg-surface"
                }`}
              >
                <div>
                  <span className="text-sm text-muted">{label}</span>
                  {sub && (
                    <p className="text-xs text-muted/70">{sub}</p>
                  )}
                </div>
                <span
                  className={`font-mono font-bold ${
                    highlight
                      ? "text-accent text-xl"
                      : negative
                      ? "text-red-500 text-base"
                      : "text-base"
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}

            {/* Effective rate */}
            <div className="flex justify-between items-center px-4 py-3 bg-surface">
              <span className="text-sm text-muted">実効手数料率</span>
              <span className="font-mono font-bold text-base">
                {fmt(singleResult.effectiveRate, 2)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Multi mode */}
      {multiMode && (
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
          <h2 className="font-bold text-sm">取引リスト</h2>

          <div className="grid grid-cols-[1fr_80px_80px_32px] gap-2 text-xs text-muted px-1">
            <span>金額</span>
            <span className="text-center">通貨</span>
            <span className="text-center">種類</span>
            <span />
          </div>

          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="grid grid-cols-[1fr_80px_80px_32px] gap-2 items-center"
            >
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={tx.amount}
                  onChange={(e) =>
                    updateTransaction(
                      tx.id,
                      "amount",
                      e.target.value.replace(/[^0-9.]/g, "")
                    )
                  }
                  className="w-full pr-2 pl-2 py-2 border border-border rounded-lg text-sm text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                />
              </div>
              <select
                value={tx.currency}
                onChange={(e) =>
                  updateTransaction(tx.id, "currency", e.target.value)
                }
                className="py-2 px-1 border border-border rounded-lg text-sm focus:outline-none bg-background text-center"
              >
                <option value="JPY">JPY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              <select
                value={tx.txType}
                onChange={(e) =>
                  updateTransaction(tx.id, "txType", e.target.value)
                }
                className="py-2 px-1 border border-border rounded-lg text-sm focus:outline-none bg-background text-center"
              >
                <option value="domestic">国内</option>
                <option value="international">海外</option>
              </select>
              <button
                onClick={() => removeTransaction(tx.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                aria-label="削除"
              >
                ×
              </button>
            </div>
          ))}

          <button
            onClick={addTransaction}
            className="w-full py-2 border border-dashed border-border rounded-xl text-sm text-muted hover:border-accent hover:text-accent transition-colors"
          >
            + 取引を追加
          </button>

          {/* Per-transaction breakdown */}
          {multiResult && (
            <div className="space-y-2 mt-2">
              {multiResult.valid.map((tx, i) => (
                <div
                  key={tx.id}
                  className="rounded-xl border border-border overflow-hidden"
                >
                  <div className="bg-border/30 px-3 py-2 text-xs font-bold text-muted">
                    取引{i + 1}：{tx.currency} {tx.amount}（
                    {tx.txType === "domestic" ? "国内" : "海外"}）≈ ¥
                    {fmt(tx.amountJpy)}
                  </div>
                  <div className="divide-y divide-border">
                    {[
                      { label: "取引手数料", value: tx.fees.commissionFee, negative: true },
                      ...(tx.fees.conversionFee > 0
                        ? [{ label: "換算手数料", value: tx.fees.conversionFee, negative: true }]
                        : []),
                      { label: "引出手数料", value: tx.fees.withdrawalFee, negative: tx.fees.withdrawalFee > 0 },
                      { label: "手取り額", value: tx.fees.netAfterWithdrawal, negative: false },
                    ].map(({ label, value, negative }) => (
                      <div
                        key={label}
                        className="flex justify-between items-center px-3 py-2"
                      >
                        <span className="text-xs text-muted">{label}</span>
                        <span
                          className={`font-mono text-sm font-medium ${
                            negative && value > 0 ? "text-red-500" : ""
                          }`}
                        >
                          ¥{fmt(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Grand total */}
              <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                <div className="bg-border/30 px-3 py-2 text-xs font-bold text-muted">
                  合計
                </div>
                {[
                  { label: "受取合計", value: multiResult.totalReceived },
                  { label: "手数料合計", value: multiResult.totalFees, negative: true },
                  { label: "引出手数料合計", value: multiResult.totalWithdrawal, negative: multiResult.totalWithdrawal > 0 },
                ].map(({ label, value, negative }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center px-4 py-3"
                  >
                    <span className="text-sm text-muted">{label}</span>
                    <span
                      className={`font-mono font-medium ${
                        negative && value > 0 ? "text-red-500" : ""
                      }`}
                    >
                      ¥{fmt(value)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-3 bg-accent/10">
                  <span className="text-sm font-bold">手取り合計</span>
                  <span className="font-mono font-bold text-accent text-xl">
                    ¥{fmt(multiResult.totalNet)}
                  </span>
                </div>
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="text-sm text-muted">実効手数料率</span>
                  <span className="font-mono font-bold">
                    {fmt(multiResult.effectiveRate, 2)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fee reference */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <p className="text-xs font-bold text-muted mb-2">手数料レート参考</p>
        <div className="space-y-1 text-xs text-muted">
          <div className="flex justify-between">
            <span>国内商用取引</span>
            <span className="font-mono">3.6% + 40円</span>
          </div>
          <div className="flex justify-between">
            <span>海外商用取引</span>
            <span className="font-mono">4.1% + 40円</span>
          </div>
          <div className="flex justify-between">
            <span>通貨換算手数料（JPY以外）</span>
            <span className="font-mono">4.0%</span>
          </div>
          <div className="flex justify-between">
            <span>銀行口座引出（5万円未満）</span>
            <span className="font-mono">250円</span>
          </div>
          <div className="flex justify-between">
            <span>銀行口座引出（5万円以上）</span>
            <span className="font-mono">無料</span>
          </div>
        </div>
      </div>

      {/* Copy button */}
      {hasResult && (
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
    </div>
  );
}
