/**
 * 源泉徴収税の計算ロジック
 *
 * - 100万円以下の部分: 10.21%
 * - 100万円超の部分: 20.42%
 */

export interface TaxEntry {
  id: string;
  label: string;
  amount: string; // 入力値は文字列で管理
  taxMode: "inclusive" | "exclusive"; // 税込 / 税抜
}

export interface TaxResult {
  /** 報酬額（税抜） */
  netAmount: number;
  /** 消費税額 */
  consumptionTax: number;
  /** 報酬額（税込） */
  grossAmount: number;
  /** 源泉徴収税額（税抜報酬に対して計算） */
  withholdingTax: number;
  /** 差引支払額（税込報酬 - 源泉徴収税） */
  takeHome: number;
}

const TAX_RATE_LOW = 0.1021;
const TAX_RATE_HIGH = 0.2042;
const THRESHOLD = 1_000_000;
const CONSUMPTION_TAX_RATE = 0.1;

export function calculateWithholding(netAmount: number): number {
  if (netAmount <= 0) return 0;
  if (netAmount <= THRESHOLD) {
    return Math.floor(netAmount * TAX_RATE_LOW);
  }
  const lowPart = Math.floor(THRESHOLD * TAX_RATE_LOW);
  const highPart = Math.floor((netAmount - THRESHOLD) * TAX_RATE_HIGH);
  return lowPart + highPart;
}

export function calculateEntry(entry: TaxEntry): TaxResult {
  const rawAmount = parseFloat(entry.amount) || 0;

  let netAmount: number;
  let consumptionTax: number;
  let grossAmount: number;

  if (entry.taxMode === "inclusive") {
    // 税込入力 → 税抜を逆算
    grossAmount = rawAmount;
    netAmount = Math.round(rawAmount / (1 + CONSUMPTION_TAX_RATE));
    consumptionTax = grossAmount - netAmount;
  } else {
    // 税抜入力
    netAmount = rawAmount;
    consumptionTax = Math.round(rawAmount * CONSUMPTION_TAX_RATE);
    grossAmount = netAmount + consumptionTax;
  }

  const withholdingTax = calculateWithholding(netAmount);
  const takeHome = grossAmount - withholdingTax;

  return {
    netAmount,
    consumptionTax,
    grossAmount,
    withholdingTax,
    takeHome,
  };
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("ja-JP");
}

export function generateInvoiceText(
  entries: { label: string; result: TaxResult }[],
  totals: TaxResult
): string {
  const lines: string[] = [];
  lines.push("【源泉徴収税 計算結果】");
  lines.push("");

  entries.forEach((e, i) => {
    const name = e.label || `項目${i + 1}`;
    lines.push(`■ ${name}`);
    lines.push(`  報酬額（税抜）: ¥${formatCurrency(e.result.netAmount)}`);
    lines.push(`  消費税（10%）: ¥${formatCurrency(e.result.consumptionTax)}`);
    lines.push(`  報酬額（税込）: ¥${formatCurrency(e.result.grossAmount)}`);
    lines.push(
      `  源泉徴収税額: ¥${formatCurrency(e.result.withholdingTax)}`
    );
    lines.push(`  差引支払額: ¥${formatCurrency(e.result.takeHome)}`);
    lines.push("");
  });

  if (entries.length > 1) {
    lines.push("■ 合計");
    lines.push(`  報酬額（税抜）: ¥${formatCurrency(totals.netAmount)}`);
    lines.push(`  消費税（10%）: ¥${formatCurrency(totals.consumptionTax)}`);
    lines.push(`  報酬額（税込）: ¥${formatCurrency(totals.grossAmount)}`);
    lines.push(
      `  源泉徴収税額: ¥${formatCurrency(totals.withholdingTax)}`
    );
    lines.push(`  差引支払額: ¥${formatCurrency(totals.takeHome)}`);
  }

  return lines.join("\n");
}
