"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ValidationError {
  path: string;
  message: string;
  severity: "error" | "warning";
}

interface SchemaDiff {
  missingFields: string[];
  extraFields: string[];
  typeMismatches: { path: string; expected: string; actual: string }[];
}

interface RepairResult {
  repaired: string | null;
  parseError: string | null;
  steps: string[];
}

// ─── JSON repair utilities ────────────────────────────────────────────────────

function repairJson(raw: string): RepairResult {
  const steps: string[] = [];
  let text = raw;

  // Step 1: strip markdown fences
  const fenceMatch = text.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/m);
  if (fenceMatch) {
    text = fenceMatch[1];
    steps.push("マークダウンコードフェンスを除去");
  }

  // Step 2: trim surrounding whitespace
  text = text.trim();

  // Step 3: strip leading/trailing non-JSON text (common with LLMs)
  const jsonStartBrace = text.search(/[{[]/);
  const jsonEndBrace = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (jsonStartBrace > 0 || jsonEndBrace < text.length - 1) {
    if (jsonStartBrace !== -1 && jsonEndBrace !== -1) {
      text = text.slice(jsonStartBrace, jsonEndBrace + 1);
      steps.push("JSON前後の余分なテキストを除去");
    }
  }

  // Try parsing before heavy repairs
  try {
    const parsed = JSON.parse(text);
    return { repaired: JSON.stringify(parsed, null, 2), parseError: null, steps };
  } catch (_) {
    // continue with repairs
  }

  // Step 4: fix single quotes → double quotes (but not inside strings)
  const singleToDouble = fixSingleQuotes(text);
  if (singleToDouble !== text) {
    text = singleToDouble;
    steps.push("シングルクォートをダブルクォートに変換");
  }

  // Step 5: fix unquoted keys
  const quotedKeys = fixUnquotedKeys(text);
  if (quotedKeys !== text) {
    text = quotedKeys;
    steps.push("クォートなしのキーを修復");
  }

  // Step 6: fix trailing commas before } or ]
  const noTrailingCommas = text.replace(/,\s*([}\]])/g, "$1");
  if (noTrailingCommas !== text) {
    text = noTrailingCommas;
    steps.push("末尾カンマを除去");
  }

  // Step 7: fix missing commas between entries (basic heuristic)
  // "value"\n"key" or "value"\n{ or "value"\n[
  const addedCommas = text.replace(/(["}\]])\s*\n(\s*["[{])/g, (_, a, b) => {
    // skip if already has comma
    return `${a},\n${b}`;
  });
  if (addedCommas !== text) {
    text = addedCommas;
    steps.push("不足カンマを追加");
  }

  // Step 8: fix JavaScript-style comments
  const noComments = text
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  if (noComments !== text) {
    text = noComments;
    steps.push("JSコメントを除去");
  }

  // Step 9: fix undefined → null
  const noUndefined = text.replace(/\bundefined\b/g, "null");
  if (noUndefined !== text) {
    text = noUndefined;
    steps.push("undefined を null に変換");
  }

  try {
    const parsed = JSON.parse(text);
    return { repaired: JSON.stringify(parsed, null, 2), parseError: null, steps };
  } catch (e) {
    return {
      repaired: null,
      parseError: e instanceof Error ? e.message : "パースエラー",
      steps,
    };
  }
}

function fixSingleQuotes(text: string): string {
  // Replace single-quoted strings with double-quoted, avoiding escaped chars
  // Simple heuristic: replace 'value' patterns not inside double-quoted strings
  let result = "";
  let inDouble = false;
  let inSingle = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\" && (inDouble || inSingle)) {
      result += ch + (text[i + 1] ?? "");
      i += 2;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      result += ch;
    } else if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      result += '"';
    } else {
      result += ch;
    }
    i++;
  }
  return result;
}

function fixUnquotedKeys(text: string): string {
  // Match unquoted keys: word chars followed by colon, not inside strings
  return text.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, (match, pre, key, colon) => {
    // If key is already quoted it won't match this pattern (no quotes around it)
    return `${pre}"${key}"${colon}`;
  });
}

// ─── Schema diff utilities ────────────────────────────────────────────────────

function flattenKeys(obj: unknown, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  if (obj === null) {
    result[prefix] = "null";
    return result;
  }
  if (Array.isArray(obj)) {
    result[prefix] = "array";
    if (obj.length > 0) {
      const sub = flattenKeys(obj[0], `${prefix}[0]`);
      Object.assign(result, sub);
    }
    return result;
  }
  if (typeof obj === "object") {
    result[prefix] = "object";
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const key = prefix ? `${prefix}.${k}` : k;
      Object.assign(result, flattenKeys(v, key));
    }
    return result;
  }
  result[prefix] = typeof obj;
  return result;
}

function computeDiff(actual: unknown, schema: unknown): SchemaDiff {
  const actualKeys = flattenKeys(actual);
  const schemaKeys = flattenKeys(schema);

  const missingFields: string[] = [];
  const extraFields: string[] = [];
  const typeMismatches: SchemaDiff["typeMismatches"] = [];

  for (const [key, expectedType] of Object.entries(schemaKeys)) {
    if (!(key in actualKeys)) {
      missingFields.push(key);
    } else if (actualKeys[key] !== expectedType && expectedType !== "object" && expectedType !== "array") {
      typeMismatches.push({ path: key, expected: expectedType, actual: actualKeys[key] });
    }
  }

  for (const key of Object.keys(actualKeys)) {
    if (!(key in schemaKeys)) {
      extraFields.push(key);
    }
  }

  return { missingFields, extraFields, typeMismatches };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AiOutputJsonValidator() {
  const [rawInput, setRawInput] = useState("");
  const [schemaInput, setSchemaInput] = useState("");
  const [result, setResult] = useState<RepairResult | null>(null);
  const [diff, setDiff] = useState<SchemaDiff | null>(null);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleValidate = useCallback(() => {
    if (!rawInput.trim()) return;

    const repairResult = repairJson(rawInput);
    setResult(repairResult);
    setDiff(null);
    setSchemaError(null);

    if (schemaInput.trim() && repairResult.repaired) {
      try {
        const schemaObj = JSON.parse(schemaInput.trim());
        const actualObj = JSON.parse(repairResult.repaired);
        setDiff(computeDiff(actualObj, schemaObj));
      } catch (e) {
        setSchemaError(e instanceof Error ? e.message : "スキーマのパースエラー");
      }
    }
  }, [rawInput, schemaInput]);

  const handleCopy = useCallback(() => {
    if (!result?.repaired) return;
    navigator.clipboard.writeText(result.repaired).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  const hasDiff = diff && (diff.missingFields.length > 0 || diff.extraFields.length > 0 || diff.typeMismatches.length > 0);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">AI出力 JSON整形・検証ツール</h1>
          <p className="text-gray-400 mt-1 text-sm">
            LLMが返した崩れたJSONを自動修復。スキーマ定義との差分を表示。
          </p>
        </div>

        {/* Input section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AI output */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              AI出力 JSON
              <span className="ml-2 text-xs text-gray-500">（壊れていてもOK）</span>
            </label>
            <textarea
              className="w-full h-56 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
              placeholder={'```json\n{\n  name: \'Alice\',\n  age: 30,\n}\n```'}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              spellCheck={false}
            />
          </div>

          {/* Schema */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              期待スキーマ
              <span className="ml-2 text-xs text-gray-500">（任意・正しいJSON）</span>
            </label>
            <textarea
              className="w-full h-56 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
              placeholder={'{\n  "name": "",\n  "age": 0,\n  "email": ""\n}'}
              value={schemaInput}
              onChange={(e) => setSchemaInput(e.target.value)}
              spellCheck={false}
            />
            {schemaError && (
              <p className="text-xs text-red-400">スキーマエラー: {schemaError}</p>
            )}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleValidate}
          disabled={!rawInput.trim()}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors text-sm"
        >
          修復・検証する
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Repair steps */}
            {result.steps.length > 0 && (
              <div className="bg-amber-950 border border-amber-800 rounded-lg px-4 py-3">
                <p className="text-xs font-medium text-amber-400 mb-1.5">自動修復ステップ</p>
                <ul className="space-y-0.5">
                  {result.steps.map((step, i) => (
                    <li key={i} className="text-xs text-amber-200 flex items-center gap-2">
                      <span className="text-amber-500">✓</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Parse error */}
            {result.parseError && (
              <div className="bg-red-950 border border-red-800 rounded-lg px-4 py-3">
                <p className="text-xs font-medium text-red-400 mb-1">修復に失敗しました</p>
                <p className="text-xs font-mono text-red-300">{result.parseError}</p>
                <p className="text-xs text-red-400 mt-2">
                  自動修復できませんでした。入力を手動で確認してください。
                </p>
              </div>
            )}

            {/* Repaired JSON */}
            {result.repaired && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    修復済み JSON
                    {result.steps.length === 0 && (
                      <span className="ml-2 text-xs text-green-400">（修復不要・有効なJSON）</span>
                    )}
                  </label>
                  <button
                    onClick={handleCopy}
                    className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-gray-300 transition-colors"
                  >
                    {copied ? "コピー済み!" : "コピー"}
                  </button>
                </div>
                <pre className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm font-mono text-green-300 overflow-x-auto whitespace-pre max-h-80 overflow-y-auto">
                  {result.repaired}
                </pre>
              </div>
            )}

            {/* Schema diff */}
            {diff && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-300">スキーマ差分</p>

                {!hasDiff && (
                  <div className="bg-green-950 border border-green-800 rounded-lg px-4 py-3">
                    <p className="text-sm text-green-400">スキーマと完全一致しています</p>
                  </div>
                )}

                {diff.missingFields.length > 0 && (
                  <div className="bg-red-950 border border-red-800 rounded-lg px-4 py-3 space-y-1.5">
                    <p className="text-xs font-medium text-red-400">不足フィールド（スキーマにあるがJSON出力にない）</p>
                    <ul className="space-y-0.5">
                      {diff.missingFields.map((f) => (
                        <li key={f} className="text-xs font-mono text-red-300 flex items-center gap-2">
                          <span className="text-red-500">−</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {diff.extraFields.length > 0 && (
                  <div className="bg-yellow-950 border border-yellow-800 rounded-lg px-4 py-3 space-y-1.5">
                    <p className="text-xs font-medium text-yellow-400">余分フィールド（JSON出力にあるがスキーマにない）</p>
                    <ul className="space-y-0.5">
                      {diff.extraFields.map((f) => (
                        <li key={f} className="text-xs font-mono text-yellow-300 flex items-center gap-2">
                          <span className="text-yellow-500">+</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {diff.typeMismatches.length > 0 && (
                  <div className="bg-orange-950 border border-orange-800 rounded-lg px-4 py-3 space-y-1.5">
                    <p className="text-xs font-medium text-orange-400">型の不一致</p>
                    <ul className="space-y-1">
                      {diff.typeMismatches.map((m) => (
                        <li key={m.path} className="text-xs font-mono text-orange-300 flex items-start gap-2">
                          <span className="text-orange-500 mt-0.5">!</span>
                          <span>
                            <span className="text-white">{m.path}</span>
                            {" — 期待: "}
                            <span className="text-green-400">{m.expected}</span>
                            {" / 実際: "}
                            <span className="text-red-400">{m.actual}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Ad placeholder */}
        <div className="mt-8 border border-dashed border-gray-700 rounded-lg h-24 flex items-center justify-center">
          <span className="text-xs text-gray-600">Advertisement</span>
        </div>
      </div>
    </div>
  );
}
