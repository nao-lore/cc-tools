"use client";

import { useState, useMemo } from "react";

type Direction = "excl_to_incl" | "incl_to_excl";
type Rounding = "floor" | "round" | "ceil";
type TaxRate = 8 | 10;

function applyRounding(value: number, rounding: Rounding): number {
  if (rounding === "floor") return Math.floor(value);
  if (rounding === "ceil") return Math.ceil(value);
  return Math.round(value);
}

function calcFromExcl(
  excl: number,
  rate: TaxRate,
  rounding: Rounding
): { excl: number; tax: number; incl: number } {
  const tax = applyRounding(excl * (rate / 100), rounding);
  return { excl, tax, incl: excl + tax };
}

function calcFromIncl(
  incl: number,
  rate: TaxRate,
  rounding: Rounding
): { excl: number; tax: number; incl: number } {
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

function parseBatchLine(
  line: string,
  defaultRate: TaxRate,
  direction: Direction,
  rounding: Rounding
): BatchRow {
  const trimmed = line.trim();
  if (!trimmed) {
    return {
      original: line,
      amount: 0,
      rate: defaultRate,
      excl: 0,
      tax: 0,
      incl: 0,
      error: "空行",
    };
  }

  const parts = trimmed.split(/\s+/);
  const amountStr = parts[0].replace(/,/g, "");
  const amount = Number(amountStr);

  if (isNaN(amount) || amount < 0) {
    return {
      original: line,
      amount: 0,
      rate: defaultRate,
      excl: 0,
      tax: 0,
      incl: 0,
      error: "無効な金額",
    };
  }

  let rate: TaxRate = defaultRate;
  if (parts.length >= 2) {
    const rateStr = parts[1].replace("%", "");
    const parsed = Number(rateStr);
    if (parsed === 8 || parsed === 10) {
      rate = parsed as TaxRate;
    }
  }

  if (direction === "excl_to_incl") {
    const result = calcFromExcl(amount, rate, rounding);
    return { original: line, amount, rate, ...result };
  } else {
    const result = calcFromIncl(amount, rate, rounding);
    return { original: line, amount, rate, ...result };
  }
}

export default function ZeiKinHenkan() {
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [direction, setDirection] = useState<Direction>("excl_to_incl");
  const [rounding, setRounding] = useState<Rounding>("floor");

  // Single mode
  const [singleAmount, setSingleAmount] = useState("");
  const [singleRate, setSingleRate] = useState<TaxRate>(10);

  // Batch mode
  const [batchText, setBatchText] = useState("");
  const [defaultRate, setDefaultRate] = useState<TaxRate>(10);

  const [copied, setCopied] = useState(false);

  const singleResult = useMemo(() => {
    const raw = singleAmount.replace(/,/g, "");
    const amount = Number(raw);
    if (!raw || isNaN(amount) || amount < 0) return null;
    if (direction === "excl_to_incl") {
      return calcFromExcl(amount, singleRate, rounding);
    } else {
      return calcFromIncl(amount, singleRate, rounding);
    }
  }, [singleAmount, singleRate, direction, rounding]);

  const batchRows = useMemo<BatchRow[]>(() => {
    if (!batchText.trim()) return [];
    return batchText
      .split("\n")
      .filter((l) => l.trim())
      .map((line) => parseBatchLine(line, defaultRate, direction, rounding));
  }, [batchText, defaultRate, direction, rounding]);

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
      .map(
        (r) =>
          `${r.original.trim()}\t税抜: ¥${fmt(r.excl)}\t消費税: ¥${fmt(r.tax)}\t税込: ¥${fmt(r.incl)}`
      );
    lines.push("");
    lines.push(
      `合計\t税抜: ¥${fmt(batchTotals.excl)}\t消費税: ¥${fmt(batchTotals.tax)}\t税込: ¥${fmt(batchTotals.incl)}`
    );
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

  const dirLabel = direction === "excl_to_incl" ? "税抜 → 税込" : "税込 → 税抜";
  const inputLabel = direction === "excl_to_incl" ? "税抜金額" : "税込金額";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            税込 ⇔ 税抜 一括変換ツール
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            8%/10%軽減税率対応・レシート複数行一括計算・内税外税両対応
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          {/* Direction toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              変換方向
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setDirection("excl_to_incl")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  direction === "excl_to_incl"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                税抜 → 税込
              </button>
              <button
                onClick={() => setDirection("incl_to_excl")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  direction === "incl_to_excl"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                税込 → 税抜
              </button>
            </div>
          </div>

          {/* Rounding */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              端数処理
            </label>
            <div className="flex gap-2">
              {(
                [
                  ["floor", "切り捨て"],
                  ["round", "四捨五入"],
                  ["ceil", "切り上げ"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setRounding(val)}
                  className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium border transition-colors ${
                    rounding === val
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode tabs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              モード
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode("single")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  mode === "single"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                1件
              </button>
              <button
                onClick={() => setMode("batch")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  mode === "batch"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                複数行（一括）
              </button>
            </div>
          </div>
        </div>

        {/* Single mode */}
        {mode === "single" && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {inputLabel}（円）
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={singleAmount}
                  onChange={(e) => setSingleAmount(e.target.value)}
                  placeholder="例: 1000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  税率
                </label>
                <div className="flex gap-1 h-[38px] items-center">
                  {([8, 10] as TaxRate[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSingleRate(r)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        singleRate === r
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {singleResult && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">税抜</div>
                    <div className="text-lg font-bold text-gray-900">
                      ¥{fmt(singleResult.excl)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">
                      消費税（{singleRate}%）
                    </div>
                    <div className="text-lg font-bold text-orange-600">
                      ¥{fmt(singleResult.tax)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">税込</div>
                    <div className="text-lg font-bold text-blue-700">
                      ¥{fmt(singleResult.incl)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={copySingle}
                  className="w-full py-2 rounded-lg text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                >
                  {copied ? "コピーしました" : "結果をコピー"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Batch mode */}
        {mode === "batch" && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                金額リスト（1行1件）
              </label>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>デフォルト税率:</span>
                {([8, 10] as TaxRate[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setDefaultRate(r)}
                    className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
                      defaultRate === r
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
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
              placeholder={
                direction === "excl_to_incl"
                  ? "1000\n2500 8\n3000 10\n800 8%"
                  : "1080\n2700 8\n3300 10\n864 8%"
              }
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
            <p className="text-xs text-gray-400">
              書式: <code>金額</code> または{" "}
              <code>金額 税率</code>（例: <code>1000 8</code>{" "}
              または <code>1000 8%</code>）。税率省略時は{defaultRate}%を使用。
            </p>

            {batchRows.length > 0 && (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left px-3 py-2 font-medium text-gray-600 border border-gray-200">
                          入力
                        </th>
                        <th className="text-right px-3 py-2 font-medium text-gray-600 border border-gray-200">
                          税率
                        </th>
                        <th className="text-right px-3 py-2 font-medium text-gray-600 border border-gray-200">
                          税抜
                        </th>
                        <th className="text-right px-3 py-2 font-medium text-gray-600 border border-gray-200">
                          消費税
                        </th>
                        <th className="text-right px-3 py-2 font-medium text-gray-600 border border-gray-200">
                          税込
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchRows.map((row, i) => (
                        <tr
                          key={i}
                          className={
                            row.error
                              ? "bg-red-50"
                              : i % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50"
                          }
                        >
                          <td className="px-3 py-2 font-mono text-gray-700 border border-gray-200">
                            {row.original.trim()}
                          </td>
                          {row.error ? (
                            <td
                              colSpan={4}
                              className="px-3 py-2 text-red-500 border border-gray-200"
                            >
                              {row.error}
                            </td>
                          ) : (
                            <>
                              <td className="px-3 py-2 text-right text-gray-600 border border-gray-200">
                                {row.rate}%
                              </td>
                              <td className="px-3 py-2 text-right font-medium text-gray-900 border border-gray-200">
                                ¥{fmt(row.excl)}
                              </td>
                              <td className="px-3 py-2 text-right text-orange-600 border border-gray-200">
                                ¥{fmt(row.tax)}
                              </td>
                              <td className="px-3 py-2 text-right font-bold text-blue-700 border border-gray-200">
                                ¥{fmt(row.incl)}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                      {/* Totals row */}
                      <tr className="bg-gray-800 text-white font-bold">
                        <td
                          colSpan={2}
                          className="px-3 py-2 border border-gray-600"
                        >
                          合計
                        </td>
                        <td className="px-3 py-2 text-right border border-gray-600">
                          ¥{fmt(batchTotals.excl)}
                        </td>
                        <td className="px-3 py-2 text-right border border-gray-600 text-orange-300">
                          ¥{fmt(batchTotals.tax)}
                        </td>
                        <td className="px-3 py-2 text-right border border-gray-600 text-blue-300">
                          ¥{fmt(batchTotals.incl)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={copyBatch}
                  className="w-full py-2 rounded-lg text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                >
                  {copied ? "コピーしました" : "結果をコピー（タブ区切り）"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Ad placeholder */}
        <div className="w-full h-24 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
          広告
        </div>

        {/* ── SEO: 使い方ガイド ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">税込・税抜 変換ツールの使い方</h2>
          <ol className="space-y-3">
            {[
              { step: "1", title: "変換方向を選ぶ", body: "「税抜 → 税込」または「税込 → 税抜」を選択します。請求書作成時は税抜→税込、レシートから税抜を逆算したい場合は税込→税抜を選んでください。" },
              { step: "2", title: "端数処理を設定する", body: "「切り捨て」「四捨五入」「切り上げ」から選べます。事業者によって異なるので、取引先の処理方法に合わせて設定してください。" },
              { step: "3", title: "金額を入力する", body: "1件モードでは金額と税率（8%/10%）を選択。複数行モードでは1行に1件、税率を行末に追記できます（例: 1000 8）。" },
              { step: "4", title: "結果をコピーする", body: "「結果をコピー」ボタンでクリップボードに保存できます。複数行はタブ区切り形式でスプレッドシートに貼り付けて使えます。" },
            ].map(({ step, title, body }) => (
              <li key={step} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center">{step}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ── SEO: FAQ ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">税込・税抜・消費税計算のよくある質問</h2>
          <div className="space-y-4">
            {[
              {
                q: "税抜1,000円の税込価格はいくらですか？（消費税10%）",
                a: "税抜1,000円に消費税10%を加算すると、税込1,100円になります。消費税額は100円です。8%の場合は税込1,080円（消費税80円）です。",
              },
              {
                q: "税込価格から税抜価格を逆算するにはどうすればいいですか？",
                a: "税込金額 ÷ 1.1（10%の場合）= 税抜金額です。例えば税込1,100円 ÷ 1.1 = 1,000円。8%の場合は ÷ 1.08 で計算します。端数の扱いは切り捨て・四捨五入・切り上げで異なります。",
              },
              {
                q: "軽減税率8%と標準税率10%の違いは何ですか？",
                a: "食料品（酒類・外食を除く）や定期購読の新聞には軽減税率8%が適用されます。それ以外の商品・サービスには標準税率10%が適用されます。このツールでは行ごとに税率を指定できます。",
              },
              {
                q: "複数商品の税込合計を一括計算できますか？",
                a: "「複数行（一括）」モードで1行に1件ずつ金額を入力すると、税抜・消費税・税込の列と合計行が自動で計算されます。軽減税率商品は「金額 8」と行末に税率を追記してください。",
              },
            ].map(({ q, a }, i) => (
              <details key={i} className="group border border-gray-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-semibold text-gray-800 hover:bg-blue-50 list-none">
                  <span>Q. {q}</span>
                  <span className="text-blue-500 text-lg leading-none group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-4 pb-4 pt-1 text-sm text-gray-600 border-t border-gray-200">{a}</div>
              </details>
            ))}
          </div>
        </div>

        {/* ── SEO: JSON-LD FAQPage ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "税抜1,000円の税込価格はいくらですか？（消費税10%）",
                  "acceptedAnswer": { "@type": "Answer", "text": "税抜1,000円に消費税10%を加算すると、税込1,100円になります。消費税額は100円です。8%の場合は税込1,080円です。" },
                },
                {
                  "@type": "Question",
                  "name": "税込価格から税抜価格を逆算するにはどうすればいいですか？",
                  "acceptedAnswer": { "@type": "Answer", "text": "税込金額 ÷ 1.1（10%の場合）= 税抜金額です。例えば税込1,100円 ÷ 1.1 = 1,000円。8%の場合は ÷ 1.08 で計算します。" },
                },
                {
                  "@type": "Question",
                  "name": "軽減税率8%と標準税率10%の違いは何ですか？",
                  "acceptedAnswer": { "@type": "Answer", "text": "食料品（酒類・外食を除く）や定期購読の新聞には軽減税率8%が適用されます。それ以外は標準税率10%です。" },
                },
              ],
            }),
          }}
        />

        {/* ── SEO: 関連ツール ── */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-3">関連ツール</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { href: "/tools/consumption-tax-choice", label: "消費税 課税区分チェッカー", desc: "軽減税率の対象かどうか判定" },
              { href: "/tools/waribiki-keisan", label: "割引計算ツール", desc: "値引き後の税込価格を計算" },
              { href: "/tools/invoice-qualified-checker", label: "インボイス 登録番号チェッカー", desc: "適格請求書の登録番号を確認" },
            ].map(({ href, label, desc }) => (
              <a key={href} href={href} className="flex flex-col gap-0.5 bg-white rounded-xl p-3 border border-gray-200 hover:border-blue-300 transition-colors">
                <span className="text-sm font-semibold text-blue-700">{label}</span>
                <span className="text-xs text-gray-500">{desc}</span>
              </a>
            ))}
          </div>
        </div>

        {/* ── SEO: CTA ── */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-5 text-white text-center space-y-3">
          <p className="text-base font-bold">消費税・インボイス対応のツールをまとめて活用</p>
          <p className="text-xs opacity-80">税込・税抜変換・課税区分チェック・インボイス対応など、経理・請求書作業を効率化するツールを無料で提供しています。</p>
          <a href="/tools" className="inline-block bg-white text-blue-700 text-sm font-bold px-5 py-2 rounded-xl hover:bg-blue-50 transition-colors">
            全ツール一覧を見る
          </a>
        </div>
      </div>
    </div>
  );
}
