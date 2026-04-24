"use client";

import { useState, useMemo } from "react";

// 国税庁仕様のチェックデジット計算
// body12: 13桁法人番号の2〜13桁目（12桁）
// Q: 左から0-indexedで偶数位置→2、奇数位置→1
// CD = 9 - (sum % 9)  ※sum%9===0のとき9
function calcCheckDigit(digits13: string): number {
  const body = digits13.slice(1); // 12桁（2〜13桁目）
  const sum = body
    .split("")
    .map((c, i) => parseInt(c, 10) * (i % 2 === 0 ? 2 : 1))
    .reduce((a, b) => a + b, 0);
  return 9 - (sum % 9);
}

interface ValidationResult {
  input: string;
  normalized: string;
  valid: boolean;
  error?: string;
  formatted?: string;
  checkDigit?: number;
  expectedCheckDigit?: number;
}

function normalize(input: string): string {
  // ハイフン・スペース・全角数字を除去・正規化
  return input
    .replace(/[－ー‐\-\s　]/g, "")
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
}

function formatHoujin(digits: string): string {
  // X-XXXX-XXXX-XXXX
  return `${digits[0]}-${digits.slice(1, 5)}-${digits.slice(5, 9)}-${digits.slice(9, 13)}`;
}

function validate(input: string): ValidationResult {
  const normalized = normalize(input.trim());

  if (!normalized) {
    return { input, normalized, valid: false, error: "番号を入力してください" };
  }

  if (!/^\d+$/.test(normalized)) {
    return { input, normalized, valid: false, error: "数字のみ入力してください" };
  }

  if (normalized.length !== 13) {
    return {
      input,
      normalized,
      valid: false,
      error: `桁数が違います（${normalized.length}桁 / 13桁必要）`,
    };
  }

  const expectedCheckDigit = calcCheckDigit(normalized);
  // チェックデジットは1〜9（sum%9===0のとき9）
  const actualCheckDigit = parseInt(normalized[0], 10);
  const valid = actualCheckDigit === expectedCheckDigit;

  return {
    input,
    normalized,
    valid,
    formatted: formatHoujin(normalized),
    checkDigit: actualCheckDigit,
    expectedCheckDigit,
    error: valid
      ? undefined
      : `チェックデジット不一致（先頭桁: ${actualCheckDigit}、期待値: ${expectedCheckDigit}）`,
  };
}

function Badge({ valid }: { valid: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
        valid
          ? "bg-green-100 text-green-700 border border-green-300"
          : "bg-red-100 text-red-700 border border-red-300"
      }`}
    >
      {valid ? "✓ 有効" : "✗ 無効"}
    </span>
  );
}

interface BatchRow {
  input: string;
  result: ValidationResult;
}

export default function HoujinBangouValidator() {
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [singleInput, setSingleInput] = useState("");
  const [batchText, setBatchText] = useState("");
  const [copied, setCopied] = useState(false);

  const singleResult = useMemo<ValidationResult | null>(() => {
    if (!singleInput.trim()) return null;
    return validate(singleInput);
  }, [singleInput]);

  const batchRows = useMemo<BatchRow[]>(() => {
    if (!batchText.trim()) return [];
    return batchText
      .split("\n")
      .filter((l) => l.trim())
      .map((line) => ({ input: line, result: validate(line) }));
  }, [batchText]);

  const batchStats = useMemo(() => {
    const total = batchRows.length;
    const valid = batchRows.filter((r) => r.result.valid).length;
    return { total, valid, invalid: total - valid };
  }, [batchRows]);

  function copyBatch() {
    const lines = batchRows.map((r) => {
      const res = r.result;
      if (res.valid) {
        return `${res.normalized}\t${res.formatted}\t有効`;
      }
      return `${r.input.trim()}\t-\t無効: ${res.error}`;
    });
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            法人番号チェックツール
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            13桁法人番号のチェックデジット検証・フォーマット確認
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode("single")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
              mode === "single"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            1件チェック
          </button>
          <button
            onClick={() => setMode("batch")}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
              mode === "batch"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            一括チェック
          </button>
        </div>

        {/* Single mode */}
        {mode === "single" && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                法人番号（13桁）
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={singleInput}
                onChange={(e) => setSingleInput(e.target.value)}
                placeholder="例: 1234567890123"
                maxLength={17}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                ハイフンあり（1-2345-6789-0123）でも入力可
              </p>
            </div>

            {singleResult && (
              <div className="space-y-3">
                {/* Result badge */}
                <div className="flex items-center gap-3">
                  <Badge valid={singleResult.valid} />
                  {singleResult.formatted && (
                    <span className="font-mono text-gray-700 text-sm">
                      {singleResult.formatted}
                    </span>
                  )}
                </div>

                {/* Error message */}
                {!singleResult.valid && singleResult.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                    {singleResult.error}
                  </div>
                )}

                {/* Check digit explanation */}
                {singleResult.normalized.length === 13 && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="font-medium text-gray-700">
                      チェックデジット解説
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
                      <span>先頭1桁（チェックデジット）</span>
                      <span className="font-mono font-bold">
                        {singleResult.checkDigit}
                      </span>
                      <span>期待されるチェックデジット</span>
                      <span className="font-mono font-bold">
                        {singleResult.expectedCheckDigit}
                      </span>
                      <span>本体部分（2〜13桁目）</span>
                      <span className="font-mono text-xs break-all">
                        {singleResult.normalized.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      算出方法: 9 − (各桁 × 交互係数1/2 の合計 mod 9)
                      ※国税庁仕様
                    </p>
                  </div>
                )}

                {/* Link to NTA */}
                {singleResult.valid && (
                  <a
                    href={`https://www.houjin-bangou.nta.go.jp/henkorireki-johoto.html?selHoujinNo=${singleResult.normalized}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  >
                    国税庁法人番号公表サイトで確認
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Batch mode */}
        {mode === "batch" && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                法人番号リスト（1行1件）
              </label>
              <textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder={"1234567890123\n9876543210987\n1-2345-6789-0123"}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
              <p className="text-xs text-gray-400 mt-1">
                ハイフンあり・なし両対応。1行に1法人番号。
              </p>
            </div>

            {batchRows.length > 0 && (
              <div className="space-y-3">
                {/* Stats */}
                <div className="flex gap-3 text-sm">
                  <span className="text-gray-600">
                    合計: <strong>{batchStats.total}</strong>件
                  </span>
                  <span className="text-green-700">
                    有効: <strong>{batchStats.valid}</strong>件
                  </span>
                  <span className="text-red-600">
                    無効: <strong>{batchStats.invalid}</strong>件
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left px-3 py-2 font-medium text-gray-600 border border-gray-200">
                          入力
                        </th>
                        <th className="text-left px-3 py-2 font-medium text-gray-600 border border-gray-200">
                          フォーマット
                        </th>
                        <th className="text-center px-3 py-2 font-medium text-gray-600 border border-gray-200">
                          結果
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchRows.map((row, i) => (
                        <tr
                          key={i}
                          className={
                            row.result.valid
                              ? i % 2 === 0
                                ? "bg-white"
                                : "bg-gray-50"
                              : "bg-red-50"
                          }
                        >
                          <td className="px-3 py-2 font-mono text-xs text-gray-700 border border-gray-200 max-w-[140px] truncate">
                            {row.input.trim()}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs border border-gray-200">
                            {row.result.formatted ?? (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center border border-gray-200">
                            {row.result.valid ? (
                              <span className="text-green-700 font-bold text-xs">
                                ✓ 有効
                              </span>
                            ) : (
                              <span
                                className="text-red-600 text-xs"
                                title={row.result.error}
                              >
                                ✗{" "}
                                {row.result.error && row.result.error.length > 20
                                  ? row.result.error.slice(0, 20) + "…"
                                  : row.result.error}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
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

        {/* Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 text-sm text-gray-600">
          <div className="font-medium text-gray-800">法人番号について</div>
          <ul className="list-disc list-inside space-y-1 text-xs text-gray-500">
            <li>
              法人番号は全13桁。先頭1桁がチェックデジット、残り12桁が本体番号。
            </li>
            <li>
              チェックデジットはモジュラス9方式（国税庁仕様）で算出。
            </li>
            <li>
              表示形式: X-XXXX-XXXX-XXXX（先頭1桁 + 4桁 + 4桁 + 4桁）
            </li>
            <li>
              法人番号の正式な確認は
              <a
                href="https://www.houjin-bangou.nta.go.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                国税庁法人番号公表サイト
              </a>
              で行ってください。
            </li>
          </ul>
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この法人番号 バリデーションツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">13桁法人番号のチェックデジット検証。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この法人番号 バリデーションツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "13桁法人番号のチェックデジット検証。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "法人番号 バリデーション",
  "description": "13桁法人番号のチェックデジット検証",
  "url": "https://tools.loresync.dev/houjin-bangou-validator",
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
