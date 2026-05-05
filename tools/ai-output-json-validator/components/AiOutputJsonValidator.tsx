"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

type Lang = "ja" | "en";

// ─── Translations ─────────────────────────────────────────────────────────────

const T = {
  ja: {
    aiOutputLabel: "AI出力 JSON",
    aiOutputSub: "（壊れていてもOK）",
    schemaLabel: "期待スキーマ",
    schemaSub: "（任意・正しいJSON）",
    schemaError: "スキーマエラー: ",
    validateBtn: "修復・検証する",
    repairStepsTitle: "自動修復ステップ",
    repairFailed: "修復に失敗しました",
    repairFailedSub: "自動修復できませんでした。入力を手動で確認してください。",
    repairedLabel: "修復済み JSON",
    noRepairNeeded: "（修復不要・有効なJSON）",
    copyBtn: "コピー",
    copiedBtn: "コピー済み!",
    schemaDiffTitle: "スキーマ差分",
    schemaMatch: "スキーマと完全一致しています",
    missingFields: "不足フィールド（スキーマにあるがJSON出力にない）",
    extraFields: "余分フィールド（JSON出力にあるがスキーマにない）",
    typeMismatch: "型の不一致",
    expected: "期待: ",
    actual: " / 実際: ",
    adPlaceholder: "広告",
    guideTitle: "AI出力 JSON検証ツールの使い方",
    guide: [
      { step: "1", title: "AI出力JSONを貼り付ける", body: "LLMが返したテキストをそのまま左のテキストエリアに貼り付けてください。Markdownコードフェンス（```json）が付いていても自動除去します。" },
      { step: "2", title: "期待スキーマを入力する（任意）", body: "右のエリアに「正しいJSON構造のサンプル」を貼ると、フィールドの過不足・型の不一致を自動で検出します。" },
      { step: "3", title: "「修復・検証する」を押す", body: "自動修復ステップが実行され、修復済みJSONが表示されます。" },
      { step: "4", title: "結果をコピーして活用する", body: "修復済みJSONをコピーボタンで取得できます。スキーマ差分は3カテゴリで表示されます。" },
    ],
    faqTitle: "LLM JSON検証に関するよくある質問",
    faq: [
      { q: "LLMのJSON出力が壊れている場合、自動修復できますか？", a: "はい。Markdownフェンス除去・シングルクォート変換・末尾カンマ除去・未クォートキーの修復・JSコメント除去・undefinedのnull変換など、LLMに多いパターンを自動修復します。" },
      { q: "スキーマ検証はJSON Schemaに対応していますか？", a: "このツールはサンプルJSONをスキーマとして使うシンプルな差分チェックです。フィールドの過不足と型の不一致を検出しますが、JSON Schema仕様の完全検証には対応していません。" },
      { q: "どんなJSONの壊れ方に対応していますか？", a: "Markdownコードフェンス付き出力、シングルクォート使用、末尾カンマ、クォートなしキー、JavaScriptコメント、undefined値、前後の余分なテキストに対応しています。" },
      { q: "大きなJSONでも使えますか？", a: "ブラウザ上で動作するため、非常に大きなJSONは動作が遅くなる場合があります。通常のLLM出力サイズであれば問題なく動作します。" },
    ],
    relatedTools: "関連ツール",
    related: [
      { href: "/tools/prompt-chain-builder", label: "プロンプトチェーンビルダー", desc: "複数ステップのLLM呼び出しを設計" },
      { href: "/tools/ai-cost-calculator", label: "AI APIコスト計算ツール", desc: "トークン数からAPI費用を試算" },
    ],
    ctaTitle: "LLM開発を効率化するツール集",
    ctaDesc: "JSON検証・プロンプト設計・コスト試算など、AI開発を支援するツールをまとめて提供しています。",
    ctaBtn: "全ツール一覧を見る",
  },
  en: {
    aiOutputLabel: "AI Output JSON",
    aiOutputSub: "(broken is OK)",
    schemaLabel: "Expected Schema",
    schemaSub: "(optional, valid JSON)",
    schemaError: "Schema error: ",
    validateBtn: "Repair & Validate",
    repairStepsTitle: "Auto-Repair Steps",
    repairFailed: "Repair failed",
    repairFailedSub: "Could not auto-repair. Please check the input manually.",
    repairedLabel: "Repaired JSON",
    noRepairNeeded: "(no repair needed — valid JSON)",
    copyBtn: "Copy",
    copiedBtn: "Copied!",
    schemaDiffTitle: "Schema Diff",
    schemaMatch: "Matches schema perfectly",
    missingFields: "Missing fields (in schema but not in JSON output)",
    extraFields: "Extra fields (in JSON output but not in schema)",
    typeMismatch: "Type mismatches",
    expected: "expected: ",
    actual: " / actual: ",
    adPlaceholder: "Advertisement",
    guideTitle: "How to Use the AI Output JSON Validator",
    guide: [
      { step: "1", title: "Paste the AI output JSON", body: "Paste the raw LLM output into the left textarea. Markdown code fences (```json) are removed automatically." },
      { step: "2", title: "Enter expected schema (optional)", body: "Paste a correct JSON structure sample in the right area to auto-detect missing/extra fields and type mismatches." },
      { step: "3", title: "Click 'Repair & Validate'", body: "Auto-repair steps run and the repaired JSON is displayed." },
      { step: "4", title: "Copy and use the result", body: "Copy the repaired JSON with the copy button. Schema diffs are shown in 3 categories." },
    ],
    faqTitle: "FAQ about LLM JSON Validation",
    faq: [
      { q: "Can broken LLM JSON output be auto-repaired?", a: "Yes. We handle Markdown fence removal, single-to-double quote conversion, trailing comma removal, unquoted key repair, JS comment removal, and undefined→null conversion." },
      { q: "Does schema validation support JSON Schema?", a: "This tool uses a sample JSON as schema for a simple diff check. It detects missing/extra fields and type mismatches but does not fully implement JSON Schema spec." },
      { q: "What kinds of broken JSON are supported?", a: "Markdown code fence output, single quotes, trailing commas, unquoted keys, JavaScript comments, undefined values, and surrounding extra text." },
      { q: "Does it work with large JSON?", a: "Since it runs in the browser, very large JSON may be slow. It works fine for typical LLM output sizes." },
    ],
    relatedTools: "Related Tools",
    related: [
      { href: "/tools/prompt-chain-builder", label: "Prompt Chain Builder", desc: "Design multi-step LLM call chains" },
      { href: "/tools/ai-cost-calculator", label: "AI API Cost Calculator", desc: "Estimate API cost from token count" },
    ],
    ctaTitle: "Tools to Accelerate LLM Development",
    ctaDesc: "JSON validation, prompt design, cost estimation, and more — all free.",
    ctaBtn: "View All Tools",
  },
} as const;

// ─── JSON repair utilities ────────────────────────────────────────────────────

function repairJson(raw: string): RepairResult {
  const steps: string[] = [];
  let text = raw;

  const fenceMatch = text.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/m);
  if (fenceMatch) {
    text = fenceMatch[1];
    steps.push("マークダウンコードフェンスを除去");
  }

  text = text.trim();

  const jsonStartBrace = text.search(/[{[]/);
  const jsonEndBrace = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (jsonStartBrace > 0 || jsonEndBrace < text.length - 1) {
    if (jsonStartBrace !== -1 && jsonEndBrace !== -1) {
      text = text.slice(jsonStartBrace, jsonEndBrace + 1);
      steps.push("JSON前後の余分なテキストを除去");
    }
  }

  try {
    const parsed = JSON.parse(text);
    return { repaired: JSON.stringify(parsed, null, 2), parseError: null, steps };
  } catch (_) {
    // continue
  }

  const singleToDouble = fixSingleQuotes(text);
  if (singleToDouble !== text) {
    text = singleToDouble;
    steps.push("シングルクォートをダブルクォートに変換");
  }

  const quotedKeys = fixUnquotedKeys(text);
  if (quotedKeys !== text) {
    text = quotedKeys;
    steps.push("クォートなしのキーを修復");
  }

  const noTrailingCommas = text.replace(/,\s*([}\]])/g, "$1");
  if (noTrailingCommas !== text) {
    text = noTrailingCommas;
    steps.push("末尾カンマを除去");
  }

  const addedCommas = text.replace(/(["}\]])\s*\n(\s*["[{])/g, (_, a, b) => `${a},\n${b}`);
  if (addedCommas !== text) {
    text = addedCommas;
    steps.push("不足カンマを追加");
  }

  const noComments = text.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
  if (noComments !== text) {
    text = noComments;
    steps.push("JSコメントを除去");
  }

  const noUndefined = text.replace(/\bundefined\b/g, "null");
  if (noUndefined !== text) {
    text = noUndefined;
    steps.push("undefined を null に変換");
  }

  try {
    const parsed = JSON.parse(text);
    return { repaired: JSON.stringify(parsed, null, 2), parseError: null, steps };
  } catch (e) {
    return { repaired: null, parseError: e instanceof Error ? e.message : "パースエラー", steps };
  }
}

function fixSingleQuotes(text: string): string {
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
  return text.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, (_, pre, key, colon) => `${pre}"${key}"${colon}`);
}

// ─── Schema diff utilities ────────────────────────────────────────────────────

function flattenKeys(obj: unknown, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  if (obj === null) { result[prefix] = "null"; return result; }
  if (Array.isArray(obj)) {
    result[prefix] = "array";
    if (obj.length > 0) Object.assign(result, flattenKeys(obj[0], `${prefix}[0]`));
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
    if (!(key in schemaKeys)) extraFields.push(key);
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
  const [lang, setLang] = useState<Lang>("ja");

  const t = T[lang];

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

      {/* Input section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-violet-100 uppercase tracking-wider">
            {t.aiOutputLabel}
            <span className="ml-2 text-violet-200 normal-case">{t.aiOutputSub}</span>
          </label>
          <textarea
            className="w-full h-56 number-input rounded-xl px-3 py-2 text-sm font-mono placeholder-violet-300/40 focus:outline-none neon-focus resize-none"
            placeholder={'```json\n{\n  name: \'Alice\',\n  age: 30,\n}\n```'}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-medium text-violet-100 uppercase tracking-wider">
            {t.schemaLabel}
            <span className="ml-2 text-violet-200 normal-case">{t.schemaSub}</span>
          </label>
          <textarea
            className="w-full h-56 number-input rounded-xl px-3 py-2 text-sm font-mono placeholder-violet-300/40 focus:outline-none neon-focus resize-none"
            placeholder={'{\n  "name": "",\n  "age": 0,\n  "email": ""\n}'}
            value={schemaInput}
            onChange={(e) => setSchemaInput(e.target.value)}
            spellCheck={false}
          />
          {schemaError && (
            <p className="text-xs text-red-400">{t.schemaError}{schemaError}</p>
          )}
        </div>
      </div>

      {/* Action button */}
      <button
        onClick={handleValidate}
        disabled={!rawInput.trim()}
        className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-sm"
      >
        {t.validateBtn}
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {result.steps.length > 0 && (
            <div className="glass-card rounded-xl px-4 py-3" style={{ borderColor: "rgba(251,191,36,0.25)", background: "rgba(251,191,36,0.05)" }}>
              <p className="text-xs font-medium text-amber-300 mb-1.5">{t.repairStepsTitle}</p>
              <ul className="space-y-0.5">
                {result.steps.map((step, i) => (
                  <li key={i} className="text-xs text-amber-200 flex items-center gap-2">
                    <span className="text-amber-400">✓</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.parseError && (
            <div className="glass-card rounded-xl px-4 py-3" style={{ borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.05)" }}>
              <p className="text-xs font-medium text-red-400 mb-1">{t.repairFailed}</p>
              <p className="text-xs font-mono text-red-300">{result.parseError}</p>
              <p className="text-xs text-red-400 mt-2">{t.repairFailedSub}</p>
            </div>
          )}

          {result.repaired && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-violet-100 uppercase tracking-wider">
                  {t.repairedLabel}
                  {result.steps.length === 0 && (
                    <span className="ml-2 text-cyan-300 normal-case">{t.noRepairNeeded}</span>
                  )}
                </label>
                <button
                  onClick={handleCopy}
                  className="text-xs px-3 py-1 glass-card rounded text-violet-200 hover:text-white transition-colors"
                >
                  {copied ? t.copiedBtn : t.copyBtn}
                </button>
              </div>
              <pre className="w-full glass-card rounded-xl px-4 py-3 text-sm font-mono text-cyan-300 overflow-x-auto whitespace-pre max-h-80 overflow-y-auto">
                {result.repaired}
              </pre>
            </div>
          )}

          {diff && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-violet-100 uppercase tracking-wider">{t.schemaDiffTitle}</p>

              {!hasDiff && (
                <div className="glass-card rounded-xl px-4 py-3" style={{ borderColor: "rgba(52,211,153,0.25)", background: "rgba(52,211,153,0.05)" }}>
                  <p className="text-sm text-emerald-400">{t.schemaMatch}</p>
                </div>
              )}

              {diff.missingFields.length > 0 && (
                <div className="glass-card rounded-xl px-4 py-3 space-y-1.5" style={{ borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.05)" }}>
                  <p className="text-xs font-medium text-red-400">{t.missingFields}</p>
                  <ul className="space-y-0.5">
                    {diff.missingFields.map((f) => (
                      <li key={f} className="text-xs font-mono text-red-300 flex items-center gap-2">
                        <span className="text-red-500">−</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {diff.extraFields.length > 0 && (
                <div className="glass-card rounded-xl px-4 py-3 space-y-1.5" style={{ borderColor: "rgba(234,179,8,0.25)", background: "rgba(234,179,8,0.05)" }}>
                  <p className="text-xs font-medium text-yellow-400">{t.extraFields}</p>
                  <ul className="space-y-0.5">
                    {diff.extraFields.map((f) => (
                      <li key={f} className="text-xs font-mono text-yellow-300 flex items-center gap-2">
                        <span className="text-yellow-500">+</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {diff.typeMismatches.length > 0 && (
                <div className="glass-card rounded-xl px-4 py-3 space-y-1.5" style={{ borderColor: "rgba(249,115,22,0.25)", background: "rgba(249,115,22,0.05)" }}>
                  <p className="text-xs font-medium text-orange-400">{t.typeMismatch}</p>
                  <ul className="space-y-1">
                    {diff.typeMismatches.map((m) => (
                      <li key={m.path} className="text-xs font-mono text-orange-300 flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">!</span>
                        <span>
                          <span className="text-white">{m.path}</span>
                          {" — "}{t.expected}<span className="text-cyan-300">{m.expected}</span>
                          {t.actual}<span className="text-red-400">{m.actual}</span>
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
              { "@type": "Question", "name": "LLMのJSON出力が壊れている場合、自動修復できますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい。Markdownフェンス除去・シングルクォート変換・末尾カンマ除去・未クォートキー修復・JSコメント除去・undefinedのnull変換など、LLMに多いパターンを自動修復します。" } },
              { "@type": "Question", "name": "スキーマ検証はJSON Schemaに対応していますか？", "acceptedAnswer": { "@type": "Answer", "text": "サンプルJSONをスキーマとして使うシンプルな差分チェックです。フィールドの過不足と型の不一致を検出しますが、JSON Schema仕様の完全検証には対応していません。" } },
              { "@type": "Question", "name": "どんなJSONの壊れ方に対応していますか？", "acceptedAnswer": { "@type": "Answer", "text": "Markdownコードフェンス付き出力、シングルクォート使用、末尾カンマ、クォートなしキー、JavaScriptコメント、undefined値、前後の余分なテキストに対応しています。" } },
            ],
          }),
        }}
      />

      {/* Related tools */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedTools}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
  "name": "AI出力 JSON整形・スキーマ検証",
  "description": "LLMが返した崩れたJSONを自動修復＋事前定義スキーマとの差分表示",
  "url": "https://tools.loresync.dev/ai-output-json-validator",
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
