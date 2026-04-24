"use client";
import { useState } from "react";

function cleanIsbn(input: string) {
  return input.replace(/[-\s]/g, "");
}

function validateIsbn10(isbn: string): { valid: boolean; check: string; expectedCheck: string; steps: string[] } {
  if (isbn.length !== 10) return { valid: false, check: "", expectedCheck: "", steps: [] };
  const digits = isbn.split("");
  const steps: string[] = [];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const d = parseInt(digits[i], 10);
    if (isNaN(d)) return { valid: false, check: "", expectedCheck: "", steps: [] };
    const product = d * (10 - i);
    sum += product;
    steps.push(`${d} × ${10 - i} = ${product}`);
  }
  const remainder = sum % 11;
  const checkVal = (11 - remainder) % 11;
  const expectedCheck = checkVal === 10 ? "X" : String(checkVal);
  const lastChar = digits[9].toUpperCase();
  const valid = lastChar === expectedCheck;
  steps.push(`合計: ${sum}`);
  steps.push(`${sum} mod 11 = ${remainder}`);
  steps.push(`チェックディジット = (11 - ${remainder}) mod 11 = ${checkVal === 10 ? "10 → X" : checkVal}`);
  return { valid, check: lastChar, expectedCheck, steps };
}

function validateIsbn13(isbn: string): { valid: boolean; check: string; expectedCheck: string; steps: string[] } {
  if (isbn.length !== 13) return { valid: false, check: "", expectedCheck: "", steps: [] };
  const digits = isbn.split("").map(Number);
  if (digits.some(isNaN)) return { valid: false, check: "", expectedCheck: "", steps: [] };
  const steps: string[] = [];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const weight = i % 2 === 0 ? 1 : 3;
    const product = digits[i] * weight;
    sum += product;
    steps.push(`${digits[i]} × ${weight} = ${product}`);
  }
  const remainder = sum % 10;
  const checkVal = remainder === 0 ? 0 : 10 - remainder;
  steps.push(`合計: ${sum}`);
  steps.push(`${sum} mod 10 = ${remainder}`);
  steps.push(`チェックディジット = ${remainder === 0 ? "0" : `10 - ${remainder} = ${checkVal}`}`);
  const valid = digits[12] === checkVal;
  return { valid, check: String(digits[12]), expectedCheck: String(checkVal), steps };
}

function validateJan(jan: string): { valid: boolean; check: string; expectedCheck: string; steps: string[] } {
  // JAN-13 = EAN-13, JAN-8 = EAN-8 (same algorithm)
  if (jan.length !== 13 && jan.length !== 8) return { valid: false, check: "", expectedCheck: "", steps: [] };
  const digits = jan.split("").map(Number);
  if (digits.some(isNaN)) return { valid: false, check: "", expectedCheck: "", steps: [] };
  const len = jan.length;
  const steps: string[] = [];
  let sum = 0;
  for (let i = 0; i < len - 1; i++) {
    const weight = jan.length === 13 ? (i % 2 === 0 ? 1 : 3) : (i % 2 === 0 ? 3 : 1);
    const product = digits[i] * weight;
    sum += product;
    steps.push(`${digits[i]} × ${weight} = ${product}`);
  }
  const remainder = sum % 10;
  const checkVal = remainder === 0 ? 0 : 10 - remainder;
  steps.push(`合計: ${sum}`, `mod 10 = ${remainder}`, `チェックディジット = ${checkVal}`);
  const valid = digits[len - 1] === checkVal;
  return { valid, check: String(digits[len - 1]), expectedCheck: String(checkVal), steps };
}

function isbn10to13(isbn10: string): string {
  const base = "978" + isbn10.slice(0, 9);
  const digits = base.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return base + check;
}

function isbn13to10(isbn13: string): string | null {
  if (!isbn13.startsWith("978")) return null;
  const base = isbn13.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(base[i], 10) * (10 - i);
  }
  const checkVal = (11 - (sum % 11)) % 11;
  const check = checkVal === 10 ? "X" : String(checkVal);
  return base + check;
}

function formatIsbn(isbn: string): string {
  // Simple format: add hyphens in standard positions
  if (isbn.length === 13) return `${isbn.slice(0, 3)}-${isbn.slice(3, 4)}-${isbn.slice(4, 10)}-${isbn.slice(10, 12)}-${isbn.slice(12)}`;
  if (isbn.length === 10) return `${isbn.slice(0, 1)}-${isbn.slice(1, 7)}-${isbn.slice(7, 9)}-${isbn.slice(9)}`;
  return isbn;
}

type DetectedType = "isbn10" | "isbn13" | "jan13" | "jan8" | "unknown";

function detectType(raw: string): DetectedType {
  if (raw.length === 10) return "isbn10";
  if (raw.length === 13 && (raw.startsWith("978") || raw.startsWith("979"))) return "isbn13";
  if (raw.length === 13) return "jan13";
  if (raw.length === 8) return "jan8";
  return "unknown";
}

export default function IsbnValidator() {
  const [input, setInput] = useState("");
  const [showSteps, setShowSteps] = useState(false);

  const raw = cleanIsbn(input);
  const type = detectType(raw);

  let result: { valid: boolean; check: string; expectedCheck: string; steps: string[] } | null = null;
  if (type === "isbn10") result = validateIsbn10(raw);
  else if (type === "isbn13") result = validateIsbn13(raw);
  else if (type === "jan13" || type === "jan8") result = validateJan(raw);

  const typeLabel: Record<DetectedType, string> = {
    isbn10: "ISBN-10",
    isbn13: "ISBN-13",
    jan13: "JAN-13 / EAN-13",
    jan8: "JAN-8 / EAN-8",
    unknown: "不明",
  };

  const isbn13version = type === "isbn10" && result?.valid ? isbn10to13(raw) : null;
  const isbn10version = type === "isbn13" && result?.valid ? isbn13to10(raw) : null;

  const SAMPLES = [
    { label: "ISBN-10（岩波文庫）", value: "4003101006" },
    { label: "ISBN-13（978始まり）", value: "9784003101001" },
    { label: "JAN-13", value: "4901234567890" },
  ];

  return (
    <div className="space-y-6">
      {/* 入力 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ISBNまたはJANコードを入力</h2>
        <div className="flex items-center gap-3 flex-wrap mb-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="例：978-4-00-310100-1"
            className="border border-gray-300 rounded-lg px-4 py-3 w-72 text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          <span className="text-sm text-gray-500">{raw.length}桁</span>
        </div>
        <div className="flex gap-3 flex-wrap">
          {SAMPLES.map((s) => (
            <button
              key={s.label}
              onClick={() => setInput(s.value)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              {s.label}
            </button>
          ))}
          <button onClick={() => setInput("")} className="text-xs text-gray-500 hover:text-gray-700 underline">クリア</button>
        </div>
      </div>

      {/* 検出タイプ */}
      {raw.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-mono">
              {typeLabel[type]}
            </span>
            <span className="text-sm text-gray-500">{raw.length}桁</span>
          </div>

          {result ? (
            <div className={`rounded-xl border-2 p-4 mb-4 ${result.valid ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{result.valid ? "✅" : "❌"}</span>
                <div>
                  <div className={`font-bold ${result.valid ? "text-green-800" : "text-red-800"}`}>
                    {result.valid ? "有効" : "無効"}
                  </div>
                  {!result.valid && result.expectedCheck && (
                    <div className="text-sm text-red-700">
                      入力チェックディジット: {result.check} / 期待値: {result.expectedCheck}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : type === "unknown" ? (
            <div className="text-sm text-gray-500">10桁・13桁・8桁のいずれかで入力してください</div>
          ) : null}

          {/* フォーマット */}
          {result?.valid && (
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-1">ハイフン付きフォーマット</div>
              <div className="font-mono text-lg text-gray-900 bg-gray-50 rounded-lg px-4 py-2 inline-block">
                {formatIsbn(raw)}
              </div>
            </div>
          )}

          {/* 変換 */}
          {isbn13version && (
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-xs text-blue-700 mb-1">ISBN-10 → ISBN-13 変換</div>
              <div className="font-mono text-lg font-bold text-blue-900">{formatIsbn(isbn13version)}</div>
            </div>
          )}
          {isbn10version && (
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-xs text-blue-700 mb-1">ISBN-13 → ISBN-10 変換</div>
              <div className="font-mono text-lg font-bold text-blue-900">{isbn10version ? formatIsbn(isbn10version) : "変換不可（979始まりのISBN-13）"}</div>
            </div>
          )}
        </div>
      )}

      {/* 計算過程 */}
      {result && result.steps.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800">チェックディジット計算過程</h2>
            <button onClick={() => setShowSteps(!showSteps)} className="text-sm text-blue-600 hover:text-blue-800">
              {showSteps ? "折りたたむ" : "表示"}
            </button>
          </div>
          {showSteps && (
            <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm space-y-1">
              {result.steps.map((s, i) => (
                <div key={i} className={i >= result.steps.length - 3 ? "text-blue-800 font-semibold" : "text-gray-700"}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 説明 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">各コードの概要</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div><strong>ISBN-10：</strong>2007年以前に使用。10桁。最後の桁が0〜9またはX（=10）。</div>
          <div><strong>ISBN-13：</strong>現在の標準。978または979始まりの13桁。EAN-13と同じアルゴリズム。</div>
          <div><strong>JAN-13：</strong>日本の商品コード。13桁のEAN-13。49または45始まりが日本の割り当て。</div>
          <div><strong>JAN-8：</strong>小型商品向け短縮コード。8桁のEAN-8。</div>
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このISBN・JANコードバリデーションツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">ISBN-10・ISBN-13・JANコードの検証とフォーマット変換。チェックディジットの計算過程を表示。。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このISBN・JANコードバリデーションツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "ISBN-10・ISBN-13・JANコードの検証とフォーマット変換。チェックディジットの計算過程を表示。。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ISBN・JANコードバリデーション",
  "description": "ISBN-10・ISBN-13・JANコードの検証とフォーマット変換。チェックディジットの計算過程を表示。",
  "url": "https://tools.loresync.dev/isbn-validator",
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
