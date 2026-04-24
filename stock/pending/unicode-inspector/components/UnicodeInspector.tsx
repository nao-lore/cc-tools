"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type UnicodeCategory =
  | "Letter"
  | "Digit"
  | "Punctuation"
  | "Symbol"
  | "Separator"
  | "Control"
  | "Other";

interface CharInfo {
  char: string;
  codepoint: number;
  codepointHex: string;
  name: string;
  category: UnicodeCategory;
  categoryCode: string;
  utf8Bytes: string[];
  byteCount: number;
  isInvisible: boolean;
  index: number;
}

// ─── Unicode utilities ────────────────────────────────────────────────────────

function getCategory(cp: number): { category: UnicodeCategory; code: string } {
  // Control characters
  if ((cp >= 0x0000 && cp <= 0x001f) || (cp >= 0x007f && cp <= 0x009f)) {
    return { category: "Control", code: "Cc" };
  }
  // Format / invisible Unicode specials
  if (
    cp === 0x00ad || // soft hyphen
    (cp >= 0x200b && cp <= 0x200f) || // zero-width spaces, joiners, marks
    (cp >= 0x2028 && cp <= 0x202f) || // line/paragraph separators, narrow no-break space
    (cp >= 0x2060 && cp <= 0x206f) || // word joiners, invisible operators
    cp === 0xfeff // BOM / zero-width no-break space
  ) {
    return { category: "Control", code: "Cf" };
  }
  // Separators
  if (cp === 0x0020 || cp === 0x00a0 || (cp >= 0x2000 && cp <= 0x200a) || cp === 0x3000) {
    return { category: "Separator", code: "Zs" };
  }
  if (cp === 0x2028) return { category: "Separator", code: "Zl" };
  if (cp === 0x2029) return { category: "Separator", code: "Zp" };

  // Digits 0-9 and fullwidth, Arabic-Indic, etc.
  if (
    (cp >= 0x0030 && cp <= 0x0039) || // ASCII digits
    (cp >= 0x0660 && cp <= 0x0669) || // Arabic-Indic
    (cp >= 0x06f0 && cp <= 0x06f9) || // Extended Arabic-Indic
    (cp >= 0xff10 && cp <= 0xff19)    // Fullwidth digits
  ) {
    return { category: "Digit", code: "Nd" };
  }

  // Basic Latin letters
  if (
    (cp >= 0x0041 && cp <= 0x005a) || // A-Z
    (cp >= 0x0061 && cp <= 0x007a) || // a-z
    (cp >= 0x00c0 && cp <= 0x024f) || // Latin Extended
    (cp >= 0x0370 && cp <= 0x03ff) || // Greek
    (cp >= 0x0400 && cp <= 0x04ff) || // Cyrillic
    (cp >= 0x0500 && cp <= 0x052f) || // Cyrillic Supplement
    (cp >= 0x0600 && cp <= 0x06ff) || // Arabic
    (cp >= 0x0900 && cp <= 0x097f) || // Devanagari
    (cp >= 0x4e00 && cp <= 0x9fff) || // CJK Unified Ideographs
    (cp >= 0x3040 && cp <= 0x30ff) || // Hiragana/Katakana
    (cp >= 0xac00 && cp <= 0xd7af) || // Hangul Syllables
    (cp >= 0x0080 && cp <= 0x00bf)    // Latin-1 Supplement letters
  ) {
    return { category: "Letter", code: "L" };
  }

  // Punctuation
  if (
    (cp >= 0x0021 && cp <= 0x002f) || // !"#$%&'()*+,-./
    (cp >= 0x003a && cp <= 0x0040) || // :;<=>?@
    (cp >= 0x005b && cp <= 0x0060) || // [\]^_`
    (cp >= 0x007b && cp <= 0x007e) || // {|}~
    (cp >= 0x2010 && cp <= 0x2027) || // General punctuation
    (cp >= 0x3000 && cp <= 0x303f)    // CJK Symbols and Punctuation
  ) {
    return { category: "Punctuation", code: "P" };
  }

  // Symbols (currency, math, emoji ranges)
  if (
    (cp >= 0x00a2 && cp <= 0x00b1) || // currency / math symbols
    (cp >= 0x2030 && cp <= 0x205e) || // per mille, prime, etc.
    (cp >= 0x2100 && cp <= 0x214f) || // Letterlike symbols
    (cp >= 0x2190 && cp <= 0x21ff) || // Arrows
    (cp >= 0x2200 && cp <= 0x22ff) || // Mathematical operators
    (cp >= 0x2300 && cp <= 0x23ff) || // Miscellaneous Technical
    (cp >= 0x2600 && cp <= 0x26ff) || // Miscellaneous Symbols
    (cp >= 0x2700 && cp <= 0x27bf) || // Dingbats
    (cp >= 0x1f300 && cp <= 0x1f9ff)  // Emoji
  ) {
    return { category: "Symbol", code: "S" };
  }

  return { category: "Other", code: "Lo" };
}

function getCharName(cp: number): string {
  // Named control characters
  const controlNames: Record<number, string> = {
    0x0000: "NULL", 0x0001: "START OF HEADING", 0x0002: "START OF TEXT",
    0x0003: "END OF TEXT", 0x0004: "END OF TRANSMISSION", 0x0005: "ENQUIRY",
    0x0006: "ACKNOWLEDGE", 0x0007: "BELL", 0x0008: "BACKSPACE",
    0x0009: "CHARACTER TABULATION", 0x000a: "LINE FEED", 0x000b: "LINE TABULATION",
    0x000c: "FORM FEED", 0x000d: "CARRIAGE RETURN", 0x000e: "SHIFT OUT",
    0x000f: "SHIFT IN", 0x001b: "ESCAPE", 0x001c: "INFORMATION SEPARATOR FOUR",
    0x001d: "INFORMATION SEPARATOR THREE", 0x001e: "INFORMATION SEPARATOR TWO",
    0x001f: "INFORMATION SEPARATOR ONE", 0x007f: "DELETE",
    0x00a0: "NO-BREAK SPACE", 0x00ad: "SOFT HYPHEN",
    0x200b: "ZERO WIDTH SPACE", 0x200c: "ZERO WIDTH NON-JOINER",
    0x200d: "ZERO WIDTH JOINER", 0x200e: "LEFT-TO-RIGHT MARK",
    0x200f: "RIGHT-TO-LEFT MARK", 0x2028: "LINE SEPARATOR",
    0x2029: "PARAGRAPH SEPARATOR", 0x202a: "LEFT-TO-RIGHT EMBEDDING",
    0x202b: "RIGHT-TO-LEFT EMBEDDING", 0x202c: "POP DIRECTIONAL FORMATTING",
    0x202d: "LEFT-TO-RIGHT OVERRIDE", 0x202e: "RIGHT-TO-LEFT OVERRIDE",
    0x2060: "WORD JOINER", 0xfeff: "ZERO WIDTH NO-BREAK SPACE (BOM)",
  };
  if (controlNames[cp]) return controlNames[cp];

  // Common named characters
  const namedChars: Record<number, string> = {
    0x0020: "SPACE", 0x0021: "EXCLAMATION MARK", 0x0022: "QUOTATION MARK",
    0x0023: "NUMBER SIGN", 0x0024: "DOLLAR SIGN", 0x0025: "PERCENT SIGN",
    0x0026: "AMPERSAND", 0x0027: "APOSTROPHE", 0x0028: "LEFT PARENTHESIS",
    0x0029: "RIGHT PARENTHESIS", 0x002a: "ASTERISK", 0x002b: "PLUS SIGN",
    0x002c: "COMMA", 0x002d: "HYPHEN-MINUS", 0x002e: "FULL STOP",
    0x002f: "SOLIDUS", 0x003a: "COLON", 0x003b: "SEMICOLON",
    0x003c: "LESS-THAN SIGN", 0x003d: "EQUALS SIGN", 0x003e: "GREATER-THAN SIGN",
    0x003f: "QUESTION MARK", 0x0040: "COMMERCIAL AT",
    0x005b: "LEFT SQUARE BRACKET", 0x005c: "REVERSE SOLIDUS",
    0x005d: "RIGHT SQUARE BRACKET", 0x005e: "CIRCUMFLEX ACCENT",
    0x005f: "LOW LINE", 0x0060: "GRAVE ACCENT",
    0x007b: "LEFT CURLY BRACKET", 0x007c: "VERTICAL LINE",
    0x007d: "RIGHT CURLY BRACKET", 0x007e: "TILDE",
    0x00a9: "COPYRIGHT SIGN", 0x00ae: "REGISTERED SIGN",
    0x00b0: "DEGREE SIGN", 0x00b1: "PLUS-MINUS SIGN",
    0x00d7: "MULTIPLICATION SIGN", 0x00f7: "DIVISION SIGN",
    0x2014: "EM DASH", 0x2013: "EN DASH", 0x2018: "LEFT SINGLE QUOTATION MARK",
    0x2019: "RIGHT SINGLE QUOTATION MARK", 0x201c: "LEFT DOUBLE QUOTATION MARK",
    0x201d: "RIGHT DOUBLE QUOTATION MARK", 0x2026: "HORIZONTAL ELLIPSIS",
    0x20ac: "EURO SIGN", 0x00a3: "POUND SIGN", 0x00a5: "YEN SIGN",
    0x2764: "HEAVY BLACK HEART", 0x2665: "BLACK HEART SUIT",
    0x2605: "BLACK STAR", 0x2606: "WHITE STAR",
    0x1f600: "GRINNING FACE", 0x1f601: "GRINNING FACE WITH SMILING EYES",
    0x1f602: "FACE WITH TEARS OF JOY", 0x1f603: "SMILING FACE WITH OPEN MOUTH",
    0x1f604: "SMILING FACE WITH OPEN MOUTH AND SMILING EYES",
    0x1f605: "SMILING FACE WITH OPEN MOUTH AND COLD SWEAT",
    0x1f606: "SMILING FACE WITH OPEN MOUTH AND TIGHTLY-CLOSED EYES",
    0x1f607: "SMILING FACE WITH HALO",
    0x1f608: "SMILING FACE WITH HORNS",
    0x1f609: "WINKING FACE", 0x1f60a: "SMILING FACE WITH SMILING EYES",
    0x1f60d: "SMILING FACE WITH HEART-SHAPED EYES",
    0x1f614: "PENSIVE FACE", 0x1f621: "POUTING FACE",
    0x1f622: "CRYING FACE", 0x1f62d: "LOUDLY CRYING FACE",
    0x1f44d: "THUMBS UP SIGN", 0x1f44e: "THUMBS DOWN SIGN",
    0x1f44f: "CLAPPING HANDS SIGN", 0x1f4af: "HUNDRED POINTS SYMBOL",
    0x1f525: "FIRE", 0x1f4a9: "PILE OF POO",
    0x2603: "SNOWMAN", 0x2764: "HEAVY BLACK HEART",
    0x2611: "BALLOT BOX WITH CHECK", 0x2612: "BALLOT BOX WITH X",
  };
  if (namedChars[cp]) return namedChars[cp];

  // ASCII letters / digits
  if (cp >= 0x0041 && cp <= 0x005a) return `LATIN CAPITAL LETTER ${String.fromCodePoint(cp)}`;
  if (cp >= 0x0061 && cp <= 0x007a) return `LATIN SMALL LETTER ${String.fromCodePoint(cp).toUpperCase()}`;
  if (cp >= 0x0030 && cp <= 0x0039) return `DIGIT ${String.fromCodePoint(cp)}`;

  return `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
}

function toUtf8Bytes(cp: number): string[] {
  const bytes: number[] = [];
  if (cp <= 0x7f) {
    bytes.push(cp);
  } else if (cp <= 0x7ff) {
    bytes.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
  } else if (cp <= 0xffff) {
    bytes.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
  } else {
    bytes.push(
      0xf0 | (cp >> 18),
      0x80 | ((cp >> 12) & 0x3f),
      0x80 | ((cp >> 6) & 0x3f),
      0x80 | (cp & 0x3f)
    );
  }
  return bytes.map((b) => b.toString(16).toUpperCase().padStart(2, "0"));
}

function isInvisibleChar(cp: number): boolean {
  return (
    (cp >= 0x0000 && cp <= 0x0008) ||
    (cp >= 0x000b && cp <= 0x001f) ||
    cp === 0x007f ||
    (cp >= 0x0080 && cp <= 0x009f) ||
    cp === 0x00ad ||
    (cp >= 0x200b && cp <= 0x200f) ||
    (cp >= 0x2028 && cp <= 0x202f) ||
    (cp >= 0x2060 && cp <= 0x206f) ||
    cp === 0xfeff
  );
}

function analyzeString(input: string): CharInfo[] {
  const result: CharInfo[] = [];
  let index = 0;
  for (const char of input) {
    const cp = char.codePointAt(0)!;
    const hex = cp.toString(16).toUpperCase().padStart(4, "0");
    const { category, code } = getCategory(cp);
    const utf8 = toUtf8Bytes(cp);
    result.push({
      char,
      codepoint: cp,
      codepointHex: `U+${hex}`,
      name: getCharName(cp),
      category,
      categoryCode: code,
      utf8Bytes: utf8,
      byteCount: utf8.length,
      isInvisible: isInvisibleChar(cp),
      index,
    });
    index++;
  }
  return result;
}

// ─── Category badge colors ────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<UnicodeCategory, string> = {
  Letter: "bg-blue-100 text-blue-700",
  Digit: "bg-green-100 text-green-700",
  Punctuation: "bg-yellow-100 text-yellow-700",
  Symbol: "bg-purple-100 text-purple-700",
  Separator: "bg-gray-100 text-gray-600",
  Control: "bg-red-100 text-red-700",
  Other: "bg-orange-100 text-orange-700",
};

// ─── Component ────────────────────────────────────────────────────────────────

const PLACEHOLDER = `Hello, 世界! 🌍\nZero\u200Bwidth\u200Bspace`;

export default function UnicodeInspector() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  const chars = analyzeString(input);

  // Stats
  const uniqueChars = new Set(chars.map((c) => c.codepoint)).size;
  const categoryCounts = chars.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});

  const handleCopy = useCallback((char: string, index: number) => {
    navigator.clipboard.writeText(char).then(() => {
      setCopied(index);
      setTimeout(() => setCopied(null), 1200);
    });
  }, []);

  const displayChar = (info: CharInfo) => {
    if (info.isInvisible) {
      return (
        <span className="text-red-500 font-mono text-xs bg-red-50 px-1 rounded border border-red-200">
          {info.codepointHex}
        </span>
      );
    }
    if (info.char === " ") {
      return (
        <span className="font-mono text-gray-400 text-xl border border-dashed border-gray-300 px-1 rounded">
          ·
        </span>
      );
    }
    return <span className="font-mono text-xl">{info.char}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Input String
        </label>
        <textarea
          className="w-full h-32 px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={PLACEHOLDER}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
        />
        <p className="text-xs text-[var(--muted-fg)] mt-1">
          Paste any text — emoji, CJK, special characters, invisible codes.
        </p>
      </div>

      {/* Stats bar */}
      {chars.length > 0 && (
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="bg-[var(--muted)] px-3 py-1.5 rounded-lg">
            <span className="font-semibold">{chars.length}</span>
            <span className="text-[var(--muted-fg)] ml-1">chars</span>
          </div>
          <div className="bg-[var(--muted)] px-3 py-1.5 rounded-lg">
            <span className="font-semibold">{uniqueChars}</span>
            <span className="text-[var(--muted-fg)] ml-1">unique</span>
          </div>
          {(Object.entries(categoryCounts) as [UnicodeCategory, number][]).map(
            ([cat, count]) => (
              <div
                key={cat}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${CATEGORY_COLORS[cat]}`}
              >
                {cat}: {count}
              </div>
            )
          )}
        </div>
      )}

      {/* Table */}
      {chars.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--muted)] text-[var(--muted-fg)] text-xs uppercase tracking-wide">
                <th className="px-3 py-2 text-left font-medium w-12">#</th>
                <th className="px-3 py-2 text-left font-medium w-16">Char</th>
                <th className="px-3 py-2 text-left font-medium">Codepoint</th>
                <th className="px-3 py-2 text-left font-medium">Name</th>
                <th className="px-3 py-2 text-left font-medium">Category</th>
                <th className="px-3 py-2 text-left font-medium">UTF-8 Bytes</th>
                <th className="px-3 py-2 text-center font-medium w-14">Bytes</th>
              </tr>
            </thead>
            <tbody>
              {chars.map((info) => (
                <tr
                  key={info.index}
                  onClick={() => handleCopy(info.char, info.index)}
                  title="Click to copy character"
                  className={`border-t border-[var(--border)] cursor-pointer transition-colors ${
                    info.isInvisible
                      ? "bg-red-50 hover:bg-red-100"
                      : "hover:bg-[var(--muted)]"
                  } ${copied === info.index ? "bg-green-50" : ""}`}
                >
                  <td className="px-3 py-2 text-[var(--muted-fg)] font-mono text-xs">
                    {info.index}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {displayChar(info)}
                      {copied === info.index && (
                        <span className="text-green-600 text-xs ml-1">Copied!</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-[var(--muted-fg)]">
                    {info.codepointHex}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {info.name}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        CATEGORY_COLORS[info.category]
                      }`}
                    >
                      {info.category}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-[var(--muted-fg)]">
                    {info.utf8Bytes.join(" ")}
                  </td>
                  <td className="px-3 py-2 text-center font-mono text-xs">
                    {info.byteCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {chars.length === 0 && (
        <div className="text-center py-16 text-[var(--muted-fg)] text-sm border border-dashed border-[var(--border)] rounded-lg">
          Type or paste text above to inspect its Unicode characters.
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Unicode Inspector tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Inspect every character in a string: codepoint, name, category. Just enter your values and get instant results.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">Is this tool free to use?</summary>
      <p className="mt-2 text-sm text-gray-600">Yes, completely free. No sign-up or account required.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">How accurate are the results?</summary>
      <p className="mt-2 text-sm text-gray-600">Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Unicode Inspector tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Inspect every character in a string: codepoint, name, category. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Unicode Inspector",
  "description": "Inspect every character in a string: codepoint, name, category",
  "url": "https://tools.loresync.dev/unicode-inspector",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
