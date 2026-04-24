"use client";

import { useState, useCallback, useMemo } from "react";

type Direction = "full-to-half" | "half-to-full";

interface ConvertTargets {
  alphanumeric: boolean;
  symbol: boolean;
  katakana: boolean;
}

// Fullwidth katakana → halfwidth katakana mapping
const FULL_KATA_TO_HALF: Record<string, string> = {
  ア: "ｱ", イ: "ｲ", ウ: "ｳ", エ: "ｴ", オ: "ｵ",
  カ: "ｶ", キ: "ｷ", ク: "ｸ", ケ: "ｹ", コ: "ｺ",
  サ: "ｻ", シ: "ｼ", ス: "ｽ", セ: "ｾ", ソ: "ｿ",
  タ: "ﾀ", チ: "ﾁ", ツ: "ﾂ", テ: "ﾃ", ト: "ﾄ",
  ナ: "ﾅ", ニ: "ﾆ", ヌ: "ﾇ", ネ: "ﾈ", ノ: "ﾉ",
  ハ: "ﾊ", ヒ: "ﾋ", フ: "ﾌ", ヘ: "ﾍ", ホ: "ﾎ",
  マ: "ﾏ", ミ: "ﾐ", ム: "ﾑ", メ: "ﾒ", モ: "ﾓ",
  ヤ: "ﾔ", ユ: "ﾕ", ヨ: "ﾖ",
  ラ: "ﾗ", リ: "ﾘ", ル: "ﾙ", レ: "ﾚ", ロ: "ﾛ",
  ワ: "ﾜ", ヲ: "ｦ", ン: "ﾝ",
  ァ: "ｧ", ィ: "ｨ", ゥ: "ｩ", ェ: "ｪ", ォ: "ｫ",
  ッ: "ｯ", ャ: "ｬ", ュ: "ｭ", ョ: "ｮ",
  ガ: "ｶﾞ", ギ: "ｷﾞ", グ: "ｸﾞ", ゲ: "ｹﾞ", ゴ: "ｺﾞ",
  ザ: "ｻﾞ", ジ: "ｼﾞ", ズ: "ｽﾞ", ゼ: "ｾﾞ", ゾ: "ｿﾞ",
  ダ: "ﾀﾞ", ヂ: "ﾁﾞ", ヅ: "ﾂﾞ", デ: "ﾃﾞ", ド: "ﾄﾞ",
  バ: "ﾊﾞ", ビ: "ﾋﾞ", ブ: "ﾌﾞ", ベ: "ﾍﾞ", ボ: "ﾎﾞ",
  パ: "ﾊﾟ", ピ: "ﾋﾟ", プ: "ﾌﾟ", ペ: "ﾍﾟ", ポ: "ﾎﾟ",
  ヴ: "ｳﾞ",
  ー: "ｰ", "。": "｡", "「": "｢", "」": "｣", "、": "､", "・": "･",
};

// Reverse: halfwidth katakana → fullwidth (single char only, dakuten handled separately)
const HALF_KATA_TO_FULL: Record<string, string> = {};
for (const [full, half] of Object.entries(FULL_KATA_TO_HALF)) {
  // Only map single-char half to full (multi-char like ｶﾞ handled in convert logic)
  if (half.length === 1) {
    HALF_KATA_TO_FULL[half] = full;
  }
}

// Dakuten (voiced) and handakuten (semi-voiced) combinations for halfwidth → fullwidth
const DAKUTEN_MAP: Record<string, string> = {
  ｶ: "ガ", ｷ: "ギ", ｸ: "グ", ｹ: "ゲ", ｺ: "ゴ",
  ｻ: "ザ", ｼ: "ジ", ｽ: "ズ", ｾ: "ゼ", ｿ: "ゾ",
  ﾀ: "ダ", ﾁ: "ヂ", ﾂ: "ヅ", ﾃ: "デ", ﾄ: "ド",
  ﾊ: "バ", ﾋ: "ビ", ﾌ: "ブ", ﾍ: "ベ", ﾎ: "ボ",
  ｳ: "ヴ",
};
const HANDAKUTEN_MAP: Record<string, string> = {
  ﾊ: "パ", ﾋ: "ピ", ﾌ: "プ", ﾍ: "ペ", ﾎ: "ポ",
};

const OFFSET = 0xfee0; // fullwidth offset from ASCII

function isFullwidthAlnum(code: number): boolean {
  // Fullwidth digits 0-9: FF10-FF19, letters A-Z: FF21-FF3A, a-z: FF41-FF5A
  return (
    (code >= 0xff10 && code <= 0xff19) ||
    (code >= 0xff21 && code <= 0xff3a) ||
    (code >= 0xff41 && code <= 0xff5a)
  );
}

function isFullwidthSymbol(code: number): boolean {
  // Fullwidth punctuation/symbols: FF01-FF0F, FF1A-FF20, FF3B-FF40, FF5B-FF5E
  return (
    (code >= 0xff01 && code <= 0xff0f) ||
    (code >= 0xff1a && code <= 0xff20) ||
    (code >= 0xff3b && code <= 0xff40) ||
    (code >= 0xff5b && code <= 0xff5e)
  );
}

function isHalfwidthAlnum(code: number): boolean {
  return (
    (code >= 0x30 && code <= 0x39) || // 0-9
    (code >= 0x41 && code <= 0x5a) || // A-Z
    (code >= 0x61 && code <= 0x7a)    // a-z
  );
}

function isHalfwidthSymbol(code: number): boolean {
  return (
    (code >= 0x21 && code <= 0x2f) ||
    (code >= 0x3a && code <= 0x40) ||
    (code >= 0x5b && code <= 0x60) ||
    (code >= 0x7b && code <= 0x7e)
  );
}

function isFullwidthKatakana(ch: string): boolean {
  return ch in FULL_KATA_TO_HALF;
}

function isHalfwidthKatakana(ch: string): boolean {
  return ch in HALF_KATA_TO_FULL || ch === "ﾞ" || ch === "ﾟ";
}

interface Token {
  char: string;
  changed: boolean;
}

function convertText(
  input: string,
  direction: Direction,
  targets: ConvertTargets
): Token[] {
  const tokens: Token[] = [];

  if (direction === "full-to-half") {
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      const code = ch.charCodeAt(0);

      if (targets.alphanumeric && isFullwidthAlnum(code)) {
        tokens.push({ char: String.fromCharCode(code - OFFSET), changed: true });
      } else if (targets.symbol && isFullwidthSymbol(code)) {
        tokens.push({ char: String.fromCharCode(code - OFFSET), changed: true });
      } else if (targets.katakana && isFullwidthKatakana(ch)) {
        tokens.push({ char: FULL_KATA_TO_HALF[ch], changed: true });
      } else {
        tokens.push({ char: ch, changed: false });
      }
    }
  } else {
    // half-to-full
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      const code = ch.charCodeAt(0);

      if (targets.katakana && isHalfwidthKatakana(ch)) {
        // Look ahead for dakuten/handakuten
        const next = input[i + 1];
        if (next === "ﾞ" && DAKUTEN_MAP[ch]) {
          tokens.push({ char: DAKUTEN_MAP[ch], changed: true });
          i++; // consume dakuten
        } else if (next === "ﾟ" && HANDAKUTEN_MAP[ch]) {
          tokens.push({ char: HANDAKUTEN_MAP[ch], changed: true });
          i++; // consume handakuten
        } else if (ch in HALF_KATA_TO_FULL) {
          tokens.push({ char: HALF_KATA_TO_FULL[ch], changed: true });
        } else {
          tokens.push({ char: ch, changed: false });
        }
      } else if (targets.alphanumeric && isHalfwidthAlnum(code)) {
        tokens.push({ char: String.fromCharCode(code + OFFSET), changed: true });
      } else if (targets.symbol && isHalfwidthSymbol(code)) {
        tokens.push({ char: String.fromCharCode(code + OFFSET), changed: true });
      } else {
        tokens.push({ char: ch, changed: false });
      }
    }
  }

  return tokens;
}

export default function HanZenConverter() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("full-to-half");
  const [targets, setTargets] = useState<ConvertTargets>({
    alphanumeric: true,
    symbol: false,
    katakana: true,
  });
  const [copied, setCopied] = useState(false);

  const tokens = useMemo(
    () => (input ? convertText(input, direction, targets) : []),
    [input, direction, targets]
  );

  const outputText = useMemo(
    () => tokens.map((t) => t.char).join(""),
    [tokens]
  );

  const changedCount = useMemo(
    () => tokens.filter((t) => t.changed).length,
    [tokens]
  );

  const handleCopy = useCallback(async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [outputText]);

  const toggleTarget = useCallback((key: keyof ConvertTargets) => {
    setTargets((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Direction selector */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">変換方向</h3>
        <div className="flex gap-2">
          {(
            [
              { value: "full-to-half", label: "全角 → 半角" },
              { value: "half-to-full", label: "半角 → 全角" },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setDirection(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                direction === value
                  ? "bg-accent text-white"
                  : "border border-border text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Target checkboxes */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">変換対象</h3>
        <div className="flex flex-wrap gap-4">
          {(
            [
              { key: "alphanumeric", label: "英数字のみ" },
              { key: "symbol", label: "記号のみ" },
              { key: "katakana", label: "カタカナのみ" },
            ] as const
          ).map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={targets[key]}
                onChange={() => toggleTarget(key)}
                className="w-4 h-4 accent-accent"
              />
              <span className="text-sm text-foreground">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">入力テキスト</h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          placeholder="変換したいテキストを入力してください…"
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors resize-y font-sans"
        />
      </div>

      {/* Output */}
      {input && (
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted">変換結果</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">
                変換箇所: <span className="font-semibold text-foreground">{changedCount}</span> 文字
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors"
              >
                {copied ? "コピー済み" : "コピー"}
              </button>
            </div>
          </div>
          <div className="w-full min-h-[7.5rem] px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground leading-relaxed break-all whitespace-pre-wrap font-sans">
            {tokens.map((token, i) =>
              token.changed ? (
                <span key={i} className="bg-yellow-200 dark:bg-yellow-800/60 rounded-sm">
                  {token.char}
                </span>
              ) : (
                <span key={i}>{token.char}</span>
              )
            )}
          </div>
        </div>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この全角・半角文字変換ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">英数字・記号・カタカナの全角↔半角を一括変換。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この全角・半角文字変換ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "英数字・記号・カタカナの全角↔半角を一括変換。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "全角・半角文字変換",
  "description": "英数字・記号・カタカナの全角↔半角を一括変換",
  "url": "https://tools.loresync.dev/han-zen-converter",
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
