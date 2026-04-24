"use client";

import { useState, useCallback, useMemo } from "react";

// Grade 1 (uncontracted) Braille Unicode mappings
// Braille Unicode block starts at U+2800
const BRAILLE_MAP: Record<string, string> = {
  a: "⠁", b: "⠃", c: "⠉", d: "⠙", e: "⠑",
  f: "⠋", g: "⠛", h: "⠓", i: "⠊", j: "⠚",
  k: "⠅", l: "⠇", m: "⠍", n: "⠝", o: "⠕",
  p: "⠏", q: "⠟", r: "⠗", s: "⠎", t: "⠞",
  u: "⠥", v: "⠧", w: "⠺", x: "⠭", y: "⠽",
  z: "⠵",
  // digits (preceded by number indicator ⠼ in full braille, shown standalone here)
  "0": "⠚", "1": "⠁", "2": "⠃", "3": "⠉", "4": "⠙",
  "5": "⠑", "6": "⠋", "7": "⠛", "8": "⠓", "9": "⠊",
  // punctuation
  " ": "⠀",
  ".": "⠲",
  ",": "⠂",
  "!": "⠖",
  "?": "⠦",
  "'": "⠄",
  "-": "⠤",
  ";": "⠆",
  ":": "⠒",
  "(": "⠦",
  ")": "⠴",
  "/": "⠌",
  "@": "⠈⠁",
};

// Reverse map: braille char → text char
const REVERSE_MAP: Record<string, string> = {};
for (const [ch, br] of Object.entries(BRAILLE_MAP)) {
  // Skip digits that share braille with letters (a-j)
  // Prioritize letters in reverse map
  if (!REVERSE_MAP[br] || /[a-z]/.test(ch)) {
    REVERSE_MAP[br] = ch;
  }
}

interface BrailleCell {
  original: string;
  braille: string;
}

function textToBraille(text: string): BrailleCell[] {
  return Array.from(text).map((ch) => {
    const lower = ch.toLowerCase();
    const braille = BRAILLE_MAP[lower] ?? "⠿";
    return { original: ch, braille };
  });
}

function brailleToText(input: string): string {
  // Split on spaces (⠀) and map each braille char
  return Array.from(input)
    .map((ch) => {
      if (ch === "⠀") return " ";
      const found = REVERSE_MAP[ch];
      return found ?? ch;
    })
    .join("");
}

export default function BrailleConverter() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("Hello World");
  const [copied, setCopied] = useState(false);

  const cells = useMemo<BrailleCell[]>(() => {
    if (mode === "encode") return textToBraille(input);
    return [];
  }, [mode, input]);

  const brailleOutput = useMemo(() => {
    if (mode === "encode") return cells.map((c) => c.braille).join("");
    return "";
  }, [mode, cells]);

  const textOutput = useMemo(() => {
    if (mode === "decode") return brailleToText(input);
    return "";
  }, [mode, input]);

  const copyOutput = useCallback(async () => {
    const out = mode === "encode" ? brailleOutput : textOutput;
    await navigator.clipboard.writeText(out);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [mode, brailleOutput, textOutput]);

  const handleModeSwitch = useCallback((next: "encode" | "decode") => {
    setMode(next);
    setInput("");
  }, []);

  const placeholder =
    mode === "encode"
      ? "Type English text here…"
      : "Paste Braille Unicode here…";

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">Mode</h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleModeSwitch("encode")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "encode"
                ? "bg-accent text-white"
                : "border border-border text-muted hover:text-foreground"
            }`}
          >
            Text → Braille
          </button>
          <button
            onClick={() => handleModeSwitch("decode")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "decode"
                ? "bg-accent text-white"
                : "border border-border text-muted hover:text-foreground"
            }`}
          >
            Braille → Text
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">
          {mode === "encode" ? "English Input" : "Braille Input"}
        </h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors resize-none"
          aria-label={mode === "encode" ? "English text input" : "Braille input"}
        />
      </div>

      {/* Output */}
      {mode === "encode" && input.length > 0 && (
        <>
          {/* Character grid */}
          <div className="bg-surface rounded-2xl border border-border p-4">
            <h3 className="text-sm font-medium text-muted mb-3">
              Braille Cells
            </h3>
            <div className="flex flex-wrap gap-2">
              {cells.map((cell, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-0.5 min-w-[2rem]"
                >
                  <span className="text-xs font-mono text-muted leading-none">
                    {cell.original === " " ? "·" : cell.original}
                  </span>
                  <span
                    className="text-2xl leading-none select-all"
                    aria-label={`Braille for ${cell.original}`}
                  >
                    {cell.braille}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Full braille string */}
          <div className="bg-surface rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted">Braille Output</h3>
              <button
                onClick={copyOutput}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-2xl leading-relaxed break-all font-mono select-all">
              {brailleOutput}
            </p>
          </div>
        </>
      )}

      {mode === "decode" && input.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted">Text Output</h3>
            <button
              onClick={copyOutput}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-lg font-mono text-foreground break-all select-all">
            {textOutput}
          </p>
        </div>
      )}

      {/* Reference */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="text-sm font-medium text-muted mb-3">
          Grade 1 Braille Reference (A–Z)
        </h3>
        <div className="flex flex-wrap gap-3">
          {"abcdefghijklmnopqrstuvwxyz".split("").map((ch) => (
            <div key={ch} className="flex flex-col items-center gap-0.5 w-8">
              <span className="text-xs font-mono text-muted uppercase leading-none">
                {ch}
              </span>
              <span className="text-xl leading-none">{BRAILLE_MAP[ch]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Braille Translator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Convert English text to Grade 1 Braille Unicode characters. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Braille Translator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Convert English text to Grade 1 Braille Unicode characters. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Braille Translator",
  "description": "Convert English text to Grade 1 Braille Unicode characters",
  "url": "https://tools.loresync.dev/braille-converter",
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
