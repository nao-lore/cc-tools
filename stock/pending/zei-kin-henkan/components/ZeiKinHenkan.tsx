"use client";

import { useState, useMemo } from "react";

type Direction = "excl_to_incl" | "incl_to_excl";
type Rounding = "floor" | "round" | "ceil";
type TaxRate = 8 | 10;
type Lang = "ja" | "en";

const T = {
  ja: {
    directionLabel: "変換方向",
    exclToIncl: "税抜 → 税込",
    inclToExcl: "税込 → 税抜",
    roundingLabel: "端数処理",
    floor: "切り捨て",
    round: "四捨五入",
    ceil: "切り上げ",
    modeLabel: "モード",
    single: "1件",
    batch: "複数行（一括）",
    inputLabel: (dir: Direction) => dir === "excl_to_incl" ? "税抜金額（円）" : "税込金額（円）",
    inputPlaceholder: "例: 1000",
    taxRateLabel: "税率",
    exclLabel: "税抜",
    taxLabel: (rate: number) => `消費税（${rate}%）`,
    inclLabel: "税込",
    copyResult: "結果をコピー",
    copyDone: "コピーしました",
    batchListLabel: "金額リスト（1行1件）",
    defaultRateLabel: "デフォルト税率:",
    batchFormatNote: (rate: number) => `書式: 金額 または 金額 税率（例: 1000 8 または 1000 8%）。税率省略時は${rate}%を使用。`,
    inputCol: "入力",
    rateCol: "税率",
    exclCol: "税抜",
    taxCol: "消費税",
    inclCol: "税込",
    totalRow: "合計",
    emptyRow: "空行",
    invalidAmount: "無効な金額",
    copyBatch: "結果をコピー（タブ区切り）",
    adPlaceholder: "広告",
    guideTitle: "税込・税抜 変換ツールの使い方",
    guide: [
      { step: "1", title: "変換方向を選ぶ", body: "「税抜 → 税込」または「税込 → 税抜」を選択します。" },
      { step: "2", title: "端数処理を設定する", body: "「切り捨て」「四捨五入」「切り上げ」から選べます。" },
      { step: "3", title: "金額を入力する", body: "1件モードでは金額と税率（8%/10%）を選択。複数行モードでは1行に1件。" },
      { step: "4", title: "結果をコピーする", body: "「結果をコピー」ボタンでクリップボードに保存できます。" },
    ],
    faqTitle: "税込・税抜・消費税計算のよくある質問",
    faq: [
      { q: "税抜1,000円の税込価格はいくらですか？（消費税10%）", a: "税抜1,000円に消費税10%を加算すると、税込1,100円になります。消費税額は100円です。8%の場合は税込1,080円です。" },
      { q: "税込価格から税抜価格を逆算するにはどうすればいいですか？", a: "税込金額 ÷ 1.1（10%の場合）= 税抜金額です。例えば税込1,100円 ÷ 1.1 = 1,000円。8%の場合は ÷ 1.08 で計算します。" },
      { q: "軽減税率8%と標準税率10%の違いは何ですか？", a: "食料品（酒類・外食を除く）や定期購読の新聞には軽減税率8%が適用されます。それ以外は標準税率10%です。" },
      { q: "複数商品の税込合計を一括計算できますか？", a: "「複数行（一括）」モードで1行に1件ずつ金額を入力すると、税抜・消費税・税込の列と合計行が自動で計算されます。" },
    ],
    relatedTools: "関連ツール",
    related: [
      { href: "/tools/consumption-tax-choice", label: "消費税 課税区分チェッカー", desc: "軽減税率の対象かどうか判定" },
      { href: "/tools/waribiki-keisan", label: "割引計算ツール", desc: "値引き後の税込価格を計算" },
      { href: "/tools/invoice-qualified-checker", label: "インボイス 登録番号チェッカー", desc: "適格請求書の登録番号を確認" },
    ],
    ctaTitle: "消費税・インボイス対応のツールをまとめて活用",
    ctaDesc: "税込・税抜変換・課税区分チェック・インボイス対応など、経理・請求書作業を効率化するツールを無料で提供しています。",
    ctaBtn: "全ツール一覧を見る",
  },
  en: {
    directionLabel: "Conversion Direction",
    exclToIncl: "Ex-tax → Inc-tax",
    inclToExcl: "Inc-tax → Ex-tax",
    roundingLabel: "Rounding",
    floor: "Floor",
    round: "Round",
    ceil: "Ceil",
    modeLabel: "Mode",
    single: "Single",
    batch: "Multi-line (Batch)",
    inputLabel: (dir: Direction) => dir === "excl_to_incl" ? "Ex-tax Amount (¥)" : "Inc-tax Amount (¥)",
    inputPlaceholder: "e.g. 1000",
    taxRateLabel: "Tax Rate",
    exclLabel: "Ex-tax",
    taxLabel: (rate: number) => `Tax (${rate}%)`,
    inclLabel: "Inc-tax",
    copyResult: "Copy Result",
    copyDone: "Copied",
    batchListLabel: "Amount list (one per line)",
    defaultRateLabel: "Default rate:",
    batchFormatNote: (rate: number) => `Format: amount or amount rate (e.g. 1000 8 or 1000 8%). Default rate: ${rate}%.`,
    inputCol: "Input",
    rateCol: "Rate",
    exclCol: "Ex-tax",
    taxCol: "Tax",
    inclCol: "Inc-tax",
    totalRow: "Total",
    emptyRow: "Empty line",
    invalidAmount: "Invalid amount",
    copyBatch: "Copy Result (TSV)",
    adPlaceholder: "Advertisement",
    guideTitle: "How to Use the Tax Conversion Tool",
    guide: [
      { step: "1", title: "Select direction", body: "Choose 'Ex-tax → Inc-tax' or 'Inc-tax → Ex-tax'." },
      { step: "2", title: "Set rounding", body: "Choose floor, round, or ceil to match your counterpart's method." },
      { step: "3", title: "Enter amount", body: "Single mode: enter amount and rate. Batch mode: one amount per line." },
      { step: "4", title: "Copy the result", body: "Click Copy to save results to clipboard. Batch results are TSV for spreadsheets." },
    ],
    faqTitle: "FAQ about Tax Calculation",
    faq: [
      { q: "How much is ¥1,000 ex-tax at 10% consumption tax?", a: "¥1,000 × 1.10 = ¥1,100 inc-tax. Tax amount is ¥100. At 8%, inc-tax is ¥1,080." },
      { q: "How do I back-calculate ex-tax from inc-tax?", a: "Inc-tax ÷ 1.1 (for 10%) = ex-tax. E.g. ¥1,100 ÷ 1.1 = ¥1,000. For 8%, divide by 1.08." },
      { q: "What is the difference between 8% and 10% tax rates?", a: "Food (excluding alcohol and eating out) and some newspaper subscriptions use the reduced 8% rate. Everything else uses the standard 10%." },
      { q: "Can I calculate tax for multiple items at once?", a: "Yes. Use Batch mode and enter one amount per line. A total row is shown automatically." },
    ],
    relatedTools: "Related Tools",
    related: [
      { href: "/tools/consumption-tax-choice", label: "Tax Category Checker", desc: "Check if reduced rate applies" },
      { href: "/tools/waribiki-keisan", label: "Discount Calculator", desc: "Calculate discounted inc-tax price" },
      { href: "/tools/invoice-qualified-checker", label: "Invoice Number Checker", desc: "Validate qualified invoice numbers" },
    ],
    ctaTitle: "Tax & Invoice Tools",
    ctaDesc: "Free tools for tax conversion, category checks, invoice compliance, and more.",
    ctaBtn: "View All Tools",
  },
} as const;

function applyRounding(value: number, rounding: Rounding): number {
  if (rounding === "floor") return Math.floor(value);
  if (rounding === "ceil") return Math.ceil(value);
  return Math.round(value);
}

function calcFromExcl(excl: number, rate: TaxRate, rounding: Rounding) {
  const tax = applyRounding(excl * (rate / 100), rounding);
  return { excl, tax, incl: excl + tax };
}

function calcFromIncl(incl: number, rate: TaxRate, rounding: Rounding) {
  const excl = applyRounding(incl / (1 + rate / 100), rounding);
  const tax = incl - excl;
  return { excl, tax, incl };
}

function fmt(n: number): string {
  return n.toLocaleString("ja-JP");
}

interface BatchRow {
  original: string;
  amount: number;
  rate: TaxRate;
  excl: number;
  tax: number;
  incl: number;
  error?: string;
}

function parseBatchLine(line: string, defaultRate: TaxRate, direction: Direction, rounding: Rounding, t: typeof T["ja"]): BatchRow {
  const trimmed = line.trim();
  if (!trimmed) return { original: line, amount: 0, rate: defaultRate, excl: 0, tax: 0, incl: 0, error: t.emptyRow };
  const parts = trimmed.split(/\s+/);
  const amountStr = parts[0].replace(/,/g, "");
  const amount = Number(amountStr);
  if (isNaN(amount) || amount < 0) return { original: line, amount: 0, rate: defaultRate, excl: 0, tax: 0, incl: 0, error: t.invalidAmount };
  let rate: TaxRate = defaultRate;
  if (parts.length >= 2) {
    const rateStr = parts[1].replace("%", "");
    const parsed = Number(rateStr);
    if (parsed === 8 || parsed === 10) rate = parsed as TaxRate;
  }
  if (direction === "excl_to_incl") {
    return { original: line, amount, rate, ...calcFromExcl(amount, rate, rounding) };
  } else {
    return { original: line, amount, rate, ...calcFromIncl(amount, rate, rounding) };
  }
}

export default function ZeiKinHenkan() {
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [direction, setDirection] = useState<Direction>("excl_to_incl");
  const [rounding, setRounding] = useState<Rounding>("floor");
  const [singleAmount, setSingleAmount] = useState("");
  const [singleRate, setSingleRate] = useState<TaxRate>(10);
  const [batchText, setBatchText] = useState("");
  const [defaultRate, setDefaultRate] = useState<TaxRate>(10);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<Lang>("ja");

  const t = T[lang];

  const singleResult = useMemo(() => {
    const raw = singleAmount.replace(/,/g, "");
    const amount = Number(raw);
    if (!raw || isNaN(amount) || amount < 0) return null;
    return direction === "excl_to_incl"
      ? calcFromExcl(amount, singleRate, rounding)
      : calcFromIncl(amount, singleRate, rounding);
  }, [singleAmount, singleRate, direction, rounding]);

  const batchRows = useMemo<BatchRow[]>(() => {
    if (!batchText.trim()) return [];
    return batchText.split("\n").filter((l) => l.trim()).map((line) => parseBatchLine(line, defaultRate, direction, rounding, t));
  }, [batchText, defaultRate, direction, rounding, t]);

  const batchTotals = useMemo(() => {
    const valid = batchRows.filter((r) => !r.error);
    return {
      excl: valid.reduce((s, r) => s + r.excl, 0),
      tax: valid.reduce((s, r) => s + r.tax, 0),
      incl: valid.reduce((s, r) => s + r.incl, 0),
    };
  }, [batchRows]);

  function copyBatch() {
    const lines = batchRows
      .filter((r) => !r.error)
      .map((r) => `${r.original.trim()}\t税抜: ¥${fmt(r.excl)}\t消費税: ¥${fmt(r.tax)}\t税込: ¥${fmt(r.incl)}`);
    lines.push("");
    lines.push(`合計\t税抜: ¥${fmt(batchTotals.excl)}\t消費税: ¥${fmt(batchTotals.tax)}\t税込: ¥${fmt(batchTotals.incl)}`);
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function copySingle() {
    if (!singleResult) return;
    const text = `税抜: ¥${fmt(singleResult.excl)}  消費税: ¥${fmt(singleResult.tax)}  税込: ¥${fmt(singleResult.incl)}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-5">
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1); }
          50% { box-shadow: 0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(139,92,246,0.2); }
        }
        @keyframes float-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes border-spin { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .glass-card-bright {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .neon-focus:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(167,139,250,0.6), 0 0 20px rgba(167,139,250,0.2);
        }
        .glow-text { text-shadow: 0 0 30px rgba(196,181,253,0.6); }
        .result-card-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .gradient-border-box { position: relative; }
        .gradient-border-box::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(139,92,246,0.6), rgba(6,182,212,0.4), rgba(139,92,246,0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .number-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2d9f3;
        }
        .number-input::placeholder { color: rgba(196,181,253,0.4); }
        .table-row-stripe:hover { background: rgba(139,92,246,0.08); transition: background 0.2s ease; }
      `}</style>

      {/* Language toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* Controls */}
      <div className="glass-card rounded-2xl p-4 space-y-4">
        {/* Direction */}
        <div>
          <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.directionLabel}</label>
          <div className="flex gap-2">
            {(["excl_to_incl", "incl_to_excl"] as Direction[]).map((d) => (
              <button
                key={d}
                onClick={() => setDirection(d)}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  direction === d ? "bg-violet-600 text-white" : "glass-card text-violet-200 hover:text-white"
                }`}
              >
                {d === "excl_to_incl" ? t.exclToIncl : t.inclToExcl}
              </button>
            ))}
          </div>
        </div>

        {/* Rounding */}
        <div>
          <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.roundingLabel}</label>
          <div className="flex gap-2">
            {(["floor", "round", "ceil"] as Rounding[]).map((r) => (
              <button
                key={r}
                onClick={() => setRounding(r)}
                className={`flex-1 py-2 px-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  rounding === r ? "bg-indigo-600 text-white" : "glass-card text-violet-200 hover:text-white"
                }`}
              >
                {r === "floor" ? t.floor : r === "round" ? t.round : t.ceil}
              </button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <div>
          <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.modeLabel}</label>
          <div className="flex gap-2">
            {(["single", "batch"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  mode === m ? "bg-white/10 text-white border border-white/20" : "glass-card text-violet-200 hover:text-white"
                }`}
              >
                {m === "single" ? t.single : t.batch}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Single mode */}
      {mode === "single" && (
        <div className="glass-card rounded-2xl p-4 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.inputLabel(direction)}</label>
              <input
                type="text"
                inputMode="numeric"
                value={singleAmount}
                onChange={(e) => setSingleAmount(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="w-full number-input rounded-xl px-3 py-2 text-sm focus:outline-none neon-focus"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.taxRateLabel}</label>
              <div className="flex gap-1 h-[38px] items-center">
                {([8, 10] as TaxRate[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSingleRate(r)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      singleRate === r ? "bg-emerald-600 text-white" : "glass-card text-violet-200 hover:text-white"
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {singleResult && (
            <div className="gradient-border-box glass-card-bright rounded-xl p-4 result-card-glow space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-card rounded-xl p-3 text-center">
                  <div className="text-xs text-violet-200 mb-1.5">{t.exclLabel}</div>
                  <div className="text-lg font-bold text-white font-mono">¥{fmt(singleResult.excl)}</div>
                </div>
                <div className="glass-card rounded-xl p-3 text-center">
                  <div className="text-xs text-violet-200 mb-1.5">{t.taxLabel(singleRate)}</div>
                  <div className="text-lg font-bold text-red-400 font-mono">¥{fmt(singleResult.tax)}</div>
                </div>
                <div className="glass-card rounded-xl p-3 text-center">
                  <div className="text-xs text-violet-200 mb-1.5">{t.inclLabel}</div>
                  <div className="text-lg font-bold text-cyan-300 font-mono">¥{fmt(singleResult.incl)}</div>
                </div>
              </div>
              <button
                onClick={copySingle}
                className="w-full py-2 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors"
              >
                {copied ? t.copyDone : t.copyResult}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Batch mode */}
      {mode === "batch" && (
        <div className="glass-card rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-violet-100 uppercase tracking-wider">{t.batchListLabel}</label>
            <div className="flex items-center gap-2 text-xs text-violet-200">
              <span>{t.defaultRateLabel}</span>
              {([8, 10] as TaxRate[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setDefaultRate(r)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all ${
                    defaultRate === r ? "bg-emerald-600 text-white" : "glass-card text-violet-200 hover:text-white"
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            placeholder={direction === "excl_to_incl" ? "1000\n2500 8\n3000 10\n800 8%" : "1080\n2700 8\n3300 10\n864 8%"}
            rows={6}
            className="w-full number-input rounded-xl px-3 py-2 text-sm font-mono focus:outline-none neon-focus resize-y"
          />
          <p className="text-xs text-violet-200">{t.batchFormatNote(defaultRate)}</p>

          {batchRows.length > 0 && (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="glass-card">
                      <th className="text-left px-3 py-2 font-medium text-violet-100 border border-white/8">{t.inputCol}</th>
                      <th className="text-right px-3 py-2 font-medium text-violet-100 border border-white/8">{t.rateCol}</th>
                      <th className="text-right px-3 py-2 font-medium text-violet-100 border border-white/8">{t.exclCol}</th>
                      <th className="text-right px-3 py-2 font-medium text-violet-100 border border-white/8">{t.taxCol}</th>
                      <th className="text-right px-3 py-2 font-medium text-violet-100 border border-white/8">{t.inclCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchRows.map((row, i) => (
                      <tr key={i} className={`table-row-stripe ${row.error ? "" : ""}`}>
                        <td className="px-3 py-2 font-mono text-white/90 border border-white/6">{row.original.trim()}</td>
                        {row.error ? (
                          <td colSpan={4} className="px-3 py-2 text-red-400 border border-white/6">{row.error}</td>
                        ) : (
                          <>
                            <td className="px-3 py-2 text-right text-violet-200 border border-white/6">{row.rate}%</td>
                            <td className="px-3 py-2 text-right font-medium text-white/90 border border-white/6 font-mono">¥{fmt(row.excl)}</td>
                            <td className="px-3 py-2 text-right text-red-400 border border-white/6 font-mono">¥{fmt(row.tax)}</td>
                            <td className="px-3 py-2 text-right font-bold text-cyan-300 border border-white/6 font-mono">¥{fmt(row.incl)}</td>
                          </>
                        )}
                      </tr>
                    ))}
                    <tr style={{ background: "rgba(139,92,246,0.2)" }} className="font-bold">
                      <td colSpan={2} className="px-3 py-2 border border-white/10 text-white">{t.totalRow}</td>
                      <td className="px-3 py-2 text-right border border-white/10 font-mono text-white">¥{fmt(batchTotals.excl)}</td>
                      <td className="px-3 py-2 text-right border border-white/10 font-mono text-red-300">¥{fmt(batchTotals.tax)}</td>
                      <td className="px-3 py-2 text-right border border-white/10 font-mono text-cyan-300">¥{fmt(batchTotals.incl)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button
                onClick={copyBatch}
                className="w-full py-2 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors"
              >
                {copied ? t.copyDone : t.copyBatch}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ad placeholder */}
      <div className="glass-card rounded-xl flex items-center justify-center h-24 text-violet-200/30 text-sm select-none">
        {t.adPlaceholder}
      </div>

      {/* Guide */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.guideTitle}</h2>
        <ol className="space-y-3.5">
          {t.guide.map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-violet-500/20 text-violet-200 text-sm font-bold flex items-center justify-center border border-violet-500/30">{item.step}</span>
              <div>
                <div className="font-medium text-white/90 text-sm">{item.title}</div>
                <div className="text-xs text-violet-200 mt-0.5">{item.body}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* FAQ */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.faqTitle}</h2>
        <div className="space-y-4">
          {t.faq.map((item, i) => (
            <details key={i} className="group glass-card rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-semibold text-white/90 hover:bg-white/5 list-none">
                <span>Q. {item.q}</span>
                <span className="text-violet-400 text-lg leading-none group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-4 pb-4 pt-1 text-sm text-violet-100 border-t border-white/6">{item.a}</div>
            </details>
          ))}
        </div>
      </div>

      {/* JSON-LD FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "税抜1,000円の税込価格はいくらですか？（消費税10%）", "acceptedAnswer": { "@type": "Answer", "text": "税抜1,000円に消費税10%を加算すると、税込1,100円になります。消費税額は100円です。8%の場合は税込1,080円です。" } },
              { "@type": "Question", "name": "税込価格から税抜価格を逆算するにはどうすればいいですか？", "acceptedAnswer": { "@type": "Answer", "text": "税込金額 ÷ 1.1（10%の場合）= 税抜金額です。例えば税込1,100円 ÷ 1.1 = 1,000円。8%の場合は ÷ 1.08 で計算します。" } },
              { "@type": "Question", "name": "軽減税率8%と標準税率10%の違いは何ですか？", "acceptedAnswer": { "@type": "Answer", "text": "食料品（酒類・外食を除く）や定期購読の新聞には軽減税率8%が適用されます。それ以外は標準税率10%です。" } },
            ],
          }),
        }}
      />

      {/* Related tools */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedTools}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {t.related.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block p-4 rounded-xl border border-white/8 hover:border-violet-500/40 transition-all duration-200"
              style={{ background: "rgba(139,92,246,0)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0)"; }}
            >
              <div className="font-medium text-white/90 text-sm">{link.label}</div>
              <div className="text-xs text-violet-100 mt-1">{link.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl p-5 text-white text-center space-y-3" style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.8), rgba(124,58,237,0.6))", border: "1px solid rgba(139,92,246,0.3)" }}>
        <p className="text-base font-bold">{t.ctaTitle}</p>
        <p className="text-xs opacity-80">{t.ctaDesc}</p>
        <a href="/tools" className="inline-block bg-white text-violet-700 text-sm font-bold px-5 py-2 rounded-xl hover:bg-violet-50 transition-colors">
          {t.ctaBtn}
        </a>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "税込 ↔ 税抜 変換（軽減税率対応）",
  "description": "8%/10%切替、レシート複数行をまとめて計算、内税外税両対応",
  "url": "https://tools.loresync.dev/zei-kin-henkan",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "JPY" },
  "inLanguage": "ja"
}`
        }}
      />
    </div>
  );
}
