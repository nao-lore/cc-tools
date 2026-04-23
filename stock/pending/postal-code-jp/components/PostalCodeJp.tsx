"use client";

import { useState, useMemo } from "react";

const POSTAL_RE = /^\d{7}$/;

function normalizeDigits(input: string): string {
  // Strip all non-digit characters
  return input.replace(/\D/g, "");
}

function formatPostalCode(digits: string): string {
  if (digits.length !== 7) return digits;
  return `〒${digits.slice(0, 3)}-${digits.slice(3)}`;
}

function formatSingleInput(raw: string): string {
  const digits = normalizeDigits(raw);
  if (digits.length === 0) return "";
  if (digits.length !== 7) return raw; // partial — keep as-is while typing
  return formatPostalCode(digits);
}

interface BatchResult {
  original: string;
  digits: string;
  formatted: string;
  valid: boolean;
}

function parseBatch(text: string): BatchResult[] {
  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed === "") return null;
      const digits = normalizeDigits(trimmed);
      const valid = POSTAL_RE.test(digits);
      return {
        original: trimmed,
        digits,
        formatted: valid ? formatPostalCode(digits) : trimmed,
        valid,
      };
    })
    .filter((r): r is BatchResult => r !== null);
}

export default function PostalCodeJp() {
  const [singleInput, setSingleInput] = useState("");
  const [batchText, setBatchText] = useState("");
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [copied, setCopied] = useState(false);

  // Single mode: auto-format as user types
  const singleDisplay = useMemo(() => {
    const digits = normalizeDigits(singleInput);
    if (digits.length === 0) return "";
    if (digits.length > 7) return singleInput; // too many digits, don't mangle
    if (digits.length === 7) return formatPostalCode(digits);
    // Partial: show digits with hyphen once we have 4+
    if (digits.length > 3) return `〒${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `〒${digits}`;
  }, [singleInput]);

  const singleValid = useMemo(() => {
    const digits = normalizeDigits(singleInput);
    return POSTAL_RE.test(digits);
  }, [singleInput]);

  const singleHasInput = singleInput.trim().length > 0;

  // Batch mode
  const batchResults = useMemo(() => parseBatch(batchText), [batchText]);
  const validCount = batchResults.filter((r) => r.valid).length;
  const invalidCount = batchResults.filter((r) => !r.valid).length;

  const batchOutput = batchResults.map((r) => r.formatted).join("\n");

  function handleSingleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Accept digits, hyphens, 〒 — strip everything else for storage
    setSingleInput(raw);
  }

  function handleCopy() {
    const text = mode === "single" ? singleDisplay : batchOutput;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h1 className="text-lg font-bold text-gray-900 mb-1">
          郵便番号フォーマッター
        </h1>
        <p className="text-muted text-sm">
          数字7桁を〒xxx-xxxx形式に自動変換。ハイフンあり・なし両対応。複数行一括処理も可能。
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("single")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "single"
              ? "bg-blue-600 text-white"
              : "bg-surface border border-border text-gray-700 hover:bg-gray-50"
          }`}
        >
          1件入力
        </button>
        <button
          onClick={() => setMode("batch")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "batch"
              ? "bg-blue-600 text-white"
              : "bg-surface border border-border text-gray-700 hover:bg-gray-50"
          }`}
        >
          一括変換
        </button>
      </div>

      {mode === "single" ? (
        <>
          {/* Single input */}
          <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
            <div>
              <label className="text-muted text-xs block mb-1">
                郵便番号を入力（数字7桁）
              </label>
              <input
                type="text"
                value={singleInput}
                onChange={handleSingleChange}
                placeholder="1234567 または 123-4567"
                maxLength={12}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {singleHasInput && (
              <div className="space-y-3">
                {/* Formatted result */}
                <div
                  className={`rounded-xl border p-4 ${
                    singleValid
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted mb-1">変換結果</p>
                      <p
                        className={`text-2xl font-bold tabular-nums ${
                          singleValid ? "text-green-800" : "text-red-700"
                        }`}
                      >
                        {singleDisplay || "—"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          singleValid
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-700"
                        }`}
                      >
                        {singleValid ? "有効" : "無効"}
                      </span>
                      {singleValid && (
                        <button
                          onClick={handleCopy}
                          className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {copied ? "コピー済み" : "コピー"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {!singleValid && singleHasInput && (
                  <p className="text-xs text-red-600">
                    郵便番号は数字7桁で入力してください（ハイフンは自動除去されます）
                  </p>
                )}
              </div>
            )}

            {!singleHasInput && (
              <p className="text-muted text-sm text-center py-4">
                入力すると自動でフォーマットされます
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Batch input */}
          <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-muted text-xs">
                  1行1件で郵便番号を入力
                </label>
                {batchText && (
                  <button
                    onClick={() => setBatchText("")}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    クリア
                  </button>
                )}
              </div>
              <textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                rows={8}
                placeholder={"1234567\n123-4567\n〒1234567\n9000001"}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
              />
            </div>

            {/* Stats */}
            {batchResults.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "件数", value: batchResults.length, color: "text-gray-900" },
                  { label: "有効", value: validCount, color: "text-green-700" },
                  { label: "無効", value: invalidCount, color: "text-red-600" },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="bg-gray-50 rounded-xl border border-border p-3 text-center"
                  >
                    <p className="text-muted text-xs mb-1">{label}</p>
                    <p className={`text-2xl font-bold tabular-nums ${color}`}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Output */}
            {batchResults.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-muted text-xs">変換結果</label>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {copied ? "コピー済み" : "全コピー"}
                  </button>
                </div>
                <div className="w-full border border-border rounded-lg overflow-hidden divide-y divide-border">
                  {batchResults.map((r, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-3 py-2 text-sm ${
                        r.valid ? "bg-white" : "bg-red-50"
                      }`}
                    >
                      <span className="text-gray-500 font-mono text-xs w-8">
                        {i + 1}
                      </span>
                      <span className="flex-1 font-mono text-gray-500 text-xs">
                        {r.original}
                      </span>
                      <span className="mx-2 text-gray-300">→</span>
                      <span
                        className={`flex-1 font-mono text-sm font-semibold text-right ${
                          r.valid ? "text-green-800" : "text-red-600"
                        }`}
                      >
                        {r.formatted}
                      </span>
                      <span
                        className={`ml-3 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          r.valid
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {r.valid ? "OK" : "NG"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {batchResults.length === 0 && (
              <p className="text-muted text-sm text-center py-4">
                1行1件で入力すると一括変換されます
              </p>
            )}
          </div>
        </>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-20 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        広告スペース
      </div>
    </div>
  );
}
