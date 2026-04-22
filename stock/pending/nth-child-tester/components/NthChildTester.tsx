"use client";

import { useState, useCallback } from "react";

type SelectorType = "nth-child" | "nth-last-child" | "nth-of-type";

interface ParsedExpression {
  a: number;
  b: number;
  valid: boolean;
  error?: string;
}

function parseExpression(expr: string): ParsedExpression {
  const trimmed = expr.trim().toLowerCase();

  if (trimmed === "odd") return { a: 2, b: 1, valid: true };
  if (trimmed === "even") return { a: 2, b: 0, valid: true };

  // Pure number: e.g. "3"
  if (/^-?\d+$/.test(trimmed)) {
    const b = parseInt(trimmed, 10);
    return { a: 0, b, valid: true };
  }

  // An+B forms: n, 2n, -n, 2n+1, 2n-1, -n+5, n+3, etc.
  const match = trimmed.match(/^(-?\d*)n([+-]\d+)?$/);
  if (match) {
    const aStr = match[1];
    const bStr = match[2];
    const a = aStr === "" ? 1 : aStr === "-" ? -1 : parseInt(aStr, 10);
    const b = bStr ? parseInt(bStr, 10) : 0;
    return { a, b, valid: true };
  }

  return { a: 0, b: 0, valid: false, error: "Invalid expression. Use An+B format, e.g. 2n+1, odd, even, -n+5" };
}

function getMatchingIndices(parsed: ParsedExpression, count: number, selectorType: SelectorType): Set<number> {
  const matched = new Set<number>();
  if (!parsed.valid) return matched;

  const { a, b } = parsed;

  for (let pos = 1; pos <= count; pos++) {
    // For nth-last-child, effective position is counted from end
    const effectivePos = selectorType === "nth-last-child" ? count - pos + 1 : pos;

    let matches = false;
    if (a === 0) {
      matches = effectivePos === b;
    } else {
      // effectivePos = a*n + b  =>  n = (effectivePos - b) / a
      const n = (effectivePos - b) / a;
      matches = Number.isInteger(n) && n >= 0;
    }

    if (matches) matched.add(pos);
  }

  return matched;
}

function getPlainEnglish(parsed: ParsedExpression, selectorType: SelectorType): string {
  if (!parsed.valid) return "";
  const { a, b } = parsed;

  const suffix = selectorType === "nth-last-child" ? " (counting from the end)" : "";

  if (a === 0) {
    if (b <= 0) return "No elements match";
    return `Only element ${b}${suffix}`;
  }

  if (a === 1) {
    if (b <= 0) return `Every element${suffix}`;
    return `Every element starting from element ${b}${suffix}`;
  }

  if (a === -1) {
    return b <= 0 ? "No elements match" : `Elements up to and including element ${b}${suffix}`;
  }

  if (a < 0) {
    return b <= 0 ? "No elements match" : `Every ${Math.abs(a)}${ordSuffix(Math.abs(a))} element, up to element ${b}${suffix}`;
  }

  // a >= 2
  if (b === 0) return `Every ${a}${ordSuffix(a)} element (${a}, ${a * 2}, ${a * 3}…)${suffix}`;
  if (b === 1) return `Every ${a}${ordSuffix(a)} element starting from the 1st (1, ${a + 1}, ${a * 2 + 1}…)${suffix}`;
  if (b < 0) {
    const first = a + b;
    return first <= 0
      ? `Every ${a}${ordSuffix(a)} element${suffix}`
      : `Every ${a}${ordSuffix(a)} element starting from element ${first}${suffix}`;
  }
  return `Every ${a}${ordSuffix(a)} element starting from element ${b} (${b}, ${a + b}, ${a * 2 + b}…)${suffix}`;
}

function ordSuffix(n: number): string {
  const abs = Math.abs(n);
  if (abs % 100 >= 11 && abs % 100 <= 13) return "th";
  switch (abs % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

const PRESETS = [
  { label: "odd", value: "odd" },
  { label: "even", value: "even" },
  { label: "3n", value: "3n" },
  { label: "3n+1", value: "3n+1" },
  { label: "first 5", value: "-n+5" },
  { label: "last 3", value: "-n+3" },
];

export default function NthChildTester() {
  const [expression, setExpression] = useState("2n+1");
  const [count, setCount] = useState(12);
  const [selectorType, setSelectorType] = useState<SelectorType>("nth-child");
  const [copied, setCopied] = useState(false);

  const parsed = parseExpression(expression);
  const matched = getMatchingIndices(parsed, count, selectorType);
  const explanation = getPlainEnglish(parsed, selectorType);
  const matchedList = Array.from(matched).sort((a, b) => a - b);
  const cssRule = `li:${selectorType}(${expression || "2n+1"}) {\n  /* your styles */\n}`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(cssRule).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [cssRule]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-5">
        {/* Expression input */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Expression <span className="text-muted font-normal">(An+B format)</span>
          </label>
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="e.g. 2n+1, odd, even, -n+5"
            className={`w-full px-4 py-2.5 rounded-lg border font-mono text-foreground bg-background focus:outline-none focus:ring-2 transition-colors ${
              parsed.valid || expression === ""
                ? "border-border focus:ring-accent/40"
                : "border-red-400 focus:ring-red-300"
            }`}
          />
          {!parsed.valid && expression !== "" && (
            <p className="mt-1 text-sm text-red-500">{parsed.error}</p>
          )}
        </div>

        {/* Presets */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Quick presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setExpression(preset.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono border transition-colors ${
                  expression === preset.value
                    ? "bg-accent text-white border-accent"
                    : "bg-surface border-border text-foreground hover:border-accent hover:text-accent"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selector type */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Selector type</p>
          <div className="flex flex-wrap gap-2">
            {(["nth-child", "nth-last-child", "nth-of-type"] as SelectorType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSelectorType(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono border transition-colors ${
                  selectorType === type
                    ? "bg-accent text-white border-accent"
                    : "bg-surface border-border text-foreground hover:border-accent hover:text-accent"
                }`}
              >
                :{type}
              </button>
            ))}
          </div>
        </div>

        {/* Element count */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Element count: <span className="text-accent font-mono">{count}</span>
          </label>
          <input
            type="range"
            min={5}
            max={30}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-[#7c5cfc]"
          />
          <div className="flex justify-between text-xs text-muted mt-0.5">
            <span>5</span>
            <span>30</span>
          </div>
        </div>
      </div>

      {/* Plain English explanation */}
      {parsed.valid && explanation && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl px-5 py-4">
          <p className="text-sm font-medium text-accent mb-0.5">Plain English</p>
          <p className="text-foreground">{explanation}</p>
        </div>
      )}

      {/* Visual grid */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <p className="text-sm font-medium text-foreground mb-4">
          Visual preview —{" "}
          <span className="text-accent font-mono">{matched.size}</span> of{" "}
          <span className="font-mono">{count}</span> elements matched
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: count }, (_, i) => {
            const pos = i + 1;
            const isMatched = matched.has(pos);
            return (
              <div
                key={pos}
                title={`Element ${pos}${isMatched ? " — matched" : ""}`}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-mono font-semibold border-2 transition-all select-none ${
                  isMatched
                    ? "bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d] text-white border-transparent shadow-md scale-105"
                    : "bg-background text-muted border-border"
                }`}
              >
                {pos}
              </div>
            );
          })}
        </div>
      </div>

      {/* Matching indices */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-sm font-medium text-foreground mb-3">Matching indices</p>
          {matchedList.length === 0 ? (
            <p className="text-muted text-sm">No elements match</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {matchedList.map((idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-accent/15 text-accent text-sm font-mono"
                >
                  {idx}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CSS rule output */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-foreground">CSS rule</p>
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1 rounded-lg border border-border hover:border-accent hover:text-accent transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="text-sm font-mono text-accent bg-background rounded-lg p-3 overflow-x-auto whitespace-pre">
            {cssRule}
          </pre>
        </div>
      </div>
    </div>
  );
}
