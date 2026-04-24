"use client";

import { useState, useCallback, useEffect } from "react";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

const AMBIGUOUS_CHARS = "0O1lI";

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  count: number;
}

interface StrengthResult {
  label: string;
  color: string;
  bgColor: string;
  width: string;
  entropy: number;
}

function getCharacterPool(options: PasswordOptions): string {
  let pool = "";
  if (options.uppercase) pool += UPPERCASE;
  if (options.lowercase) pool += LOWERCASE;
  if (options.numbers) pool += NUMBERS;
  if (options.symbols) pool += SYMBOLS;

  if (options.excludeAmbiguous) {
    pool = pool
      .split("")
      .filter((c) => !AMBIGUOUS_CHARS.includes(c))
      .join("");
  }

  return pool;
}

function generatePassword(options: PasswordOptions): string {
  const pool = getCharacterPool(options);
  if (pool.length === 0) return "";

  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);

  return Array.from(array, (v) => pool[v % pool.length]).join("");
}

function calculateEntropy(options: PasswordOptions): number {
  const pool = getCharacterPool(options);
  if (pool.length === 0) return 0;
  return Math.floor(options.length * Math.log2(pool.length));
}

function getStrength(entropy: number): StrengthResult {
  if (entropy < 40) {
    return {
      label: "弱",
      color: "text-red-500",
      bgColor: "bg-red-500",
      width: "25%",
      entropy,
    };
  }
  if (entropy < 60) {
    return {
      label: "普通",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500",
      width: "50%",
      entropy,
    };
  }
  if (entropy < 80) {
    return {
      label: "強",
      color: "text-blue-500",
      bgColor: "bg-blue-500",
      width: "75%",
      entropy,
    };
  }
  return {
    label: "最強",
    color: "text-green-500",
    bgColor: "bg-green-500",
    width: "100%",
    entropy,
  };
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
    </svg>
  );
}

export default function PasswordGenerator() {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: false,
    count: 5,
  });

  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generate = useCallback(() => {
    const pool = getCharacterPool(options);
    if (pool.length === 0) {
      setPasswords([]);
      return;
    }
    const newPasswords = Array.from({ length: options.count }, () =>
      generatePassword(options)
    );
    setPasswords(newPasswords);
  }, [options]);

  useEffect(() => {
    generate();
  }, [generate]);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    }
  };

  const entropy = calculateEntropy(options);
  const strength = getStrength(entropy);
  const hasPool = getCharacterPool(options).length > 0;

  const toggleOption = (key: keyof PasswordOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Controls */}
      <div
        className="rounded-xl p-6 mb-6 shadow-sm border"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        {/* Length slider */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium text-sm">パスワードの長さ</label>
            <span
              className="font-mono font-bold text-lg px-3 py-1 rounded-lg"
              style={{ backgroundColor: "var(--background)" }}
            >
              {options.length}
            </span>
          </div>
          <input
            type="range"
            min={8}
            max={128}
            value={options.length}
            onChange={(e) =>
              setOptions((prev) => ({
                ...prev,
                length: parseInt(e.target.value),
              }))
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs opacity-50 mt-1">
            <span>8</span>
            <span>128</span>
          </div>
        </div>

        {/* Character type toggles */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <ToggleButton
            active={options.uppercase}
            onClick={() => toggleOption("uppercase")}
            label="大文字 (A-Z)"
          />
          <ToggleButton
            active={options.lowercase}
            onClick={() => toggleOption("lowercase")}
            label="小文字 (a-z)"
          />
          <ToggleButton
            active={options.numbers}
            onClick={() => toggleOption("numbers")}
            label="数字 (0-9)"
          />
          <ToggleButton
            active={options.symbols}
            onClick={() => toggleOption("symbols")}
            label="記号 (!@#$%...)"
          />
        </div>

        {/* Exclude ambiguous */}
        <label className="flex items-center gap-2 text-sm cursor-pointer mb-5">
          <input
            type="checkbox"
            checked={options.excludeAmbiguous}
            onChange={() => toggleOption("excludeAmbiguous")}
            className="w-4 h-4 rounded accent-blue-500"
          />
          <span>紛らわしい文字を除外 (0/O, 1/l/I)</span>
        </label>

        {/* Strength meter */}
        {hasPool && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">パスワード強度</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${strength.color}`}>
                  {strength.label}
                </span>
                <span className="text-xs opacity-60 font-mono">
                  {entropy} bits
                </span>
              </div>
            </div>
            <div
              className="h-2.5 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--border)" }}
            >
              <div
                className={`strength-bar h-full rounded-full ${strength.bgColor}`}
                style={{ width: strength.width }}
              />
            </div>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={!hasPool}
          className="w-full py-3 px-4 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: hasPool ? "var(--accent)" : undefined,
          }}
        >
          <RefreshIcon />
          パスワードを生成
        </button>
      </div>

      {/* Password list */}
      {!hasPool && (
        <p className="text-center text-sm opacity-60 mb-4">
          少なくとも1つの文字種を選択してください
        </p>
      )}

      <div className="space-y-3">
        {passwords.map((pw, i) => (
          <div
            key={`${pw}-${i}`}
            className="flex items-center gap-3 rounded-lg p-4 border group"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <code className="flex-1 font-mono text-sm break-all select-all leading-relaxed">
              {pw}
            </code>
            <button
              onClick={() => copyToClipboard(pw, i)}
              className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                copiedIndex === i
                  ? "text-green-500 bg-green-50 dark:bg-green-950 copy-success"
                  : "opacity-50 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="コピー"
            >
              {copiedIndex === i ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-8 rounded-xl p-6 border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="text-lg font-semibold mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            { q: "安全なパスワードの長さはどのくらいですか？", a: "最低12文字以上、できれば16文字以上が推奨されます。大文字・小文字・数字・記号を組み合わせることでエントロピーが高まり、ブルートフォース攻撃への耐性が増します。" },
            { q: "生成されたパスワードはサーバーに保存されますか？", a: "いいえ。このツールはすべてブラウザ上で動作しており、生成されたパスワードがサーバーに送信・保存されることは一切ありません。" },
            { q: "「紛らわしい文字を除外」とはどういう意味ですか？", a: "0（ゼロ）とO（大文字O）、1（数字）とl（小文字L）とI（大文字i）など、見た目が似ている文字を除外します。手入力する際の入力ミスを防ぐことができます。" },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-lg p-4" style={{ backgroundColor: "var(--background)" }}>
              <p className="font-medium mb-1">Q. {q}</p>
              <p className="text-sm opacity-70">A. {a}</p>
            </div>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "安全なパスワードの長さはどのくらいですか？", "acceptedAnswer": { "@type": "Answer", "text": "最低12文字以上、できれば16文字以上が推奨されます。大文字・小文字・数字・記号を組み合わせることでエントロピーが高まります。" } },
              { "@type": "Question", "name": "生成されたパスワードはサーバーに保存されますか？", "acceptedAnswer": { "@type": "Answer", "text": "いいえ。このツールはすべてブラウザ上で動作しており、生成されたパスワードがサーバーに送信・保存されることは一切ありません。" } },
              { "@type": "Question", "name": "「紛らわしい文字を除外」とはどういう意味ですか？", "acceptedAnswer": { "@type": "Answer", "text": "0とO、1とlとIなど見た目が似ている文字を除外します。手入力時の入力ミスを防ぐことができます。" } },
            ]
          }) }}
        />
        <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-medium opacity-50 mb-2">関連ツール</p>
          <div className="flex flex-wrap gap-2">
            <a href="/hash-generator" className="text-sm text-blue-500 hover:underline bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-lg">ハッシュ生成ツール</a>
            <a href="/uuid-generator" className="text-sm text-blue-500 hover:underline bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-lg">UUID ジェネレーター</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-colors border ${
        active
          ? "bg-blue-500 text-white border-blue-500"
          : "border-current opacity-30 hover:opacity-60"
      }`}
    >
      {label}
    </button>
  );
}
