"use client";

import { useState, useMemo } from "react";

const SAMPLE_TEXT = `banana
Apple
cherry
date
apple
BANANA
elderberry
fig
cherry
grape
`;

type SortMode = "az" | "za" | "numeric" | "random";

const SORT_MODES: { id: SortMode; label: string }[] = [
  { id: "az", label: "A → Z" },
  { id: "za", label: "Z → A" },
  { id: "numeric", label: "Numeric" },
  { id: "random", label: "Random Shuffle" },
];

function extractLeadingNumber(line: string): number {
  const match = line.match(/^-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : Infinity;
}

function sortLines(
  lines: string[],
  mode: SortMode,
  caseInsensitive: boolean
): string[] {
  const arr = [...lines];
  if (mode === "az") {
    arr.sort((a, b) =>
      caseInsensitive
        ? a.toLowerCase().localeCompare(b.toLowerCase())
        : a.localeCompare(b)
    );
  } else if (mode === "za") {
    arr.sort((a, b) =>
      caseInsensitive
        ? b.toLowerCase().localeCompare(a.toLowerCase())
        : b.localeCompare(a)
    );
  } else if (mode === "numeric") {
    arr.sort((a, b) => extractLeadingNumber(a) - extractLeadingNumber(b));
  } else {
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  return arr;
}

function copyToClipboard(text: string, setCopied: (v: boolean) => void) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  });
}

export default function TextLineSorter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<SortMode>("az");
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [copied, setCopied] = useState(false);
  // Keep a stable shuffle result until mode/options/input change
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const { output, totalLines, uniqueLines, duplicatesRemoved } = useMemo(() => {
    // Reference shuffleSeed so useMemo re-runs when reshuffle is triggered
    void shuffleSeed;

    if (!input.trim()) {
      return { output: "", totalLines: 0, uniqueLines: 0, duplicatesRemoved: 0 };
    }

    let lines = input.split("\n");

    if (trimWhitespace) {
      lines = lines.map(l => l.trim());
    }

    if (removeEmpty) {
      lines = lines.filter(l => l.trim() !== "");
    }

    const totalLines = lines.length;

    if (removeDuplicates) {
      const seen = new Set<string>();
      lines = lines.filter(l => {
        const key = caseInsensitive ? l.toLowerCase() : l;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    const uniqueLines = lines.length;
    const duplicatesRemoved = totalLines - uniqueLines;

    const sorted = sortLines(lines, mode, caseInsensitive);

    return {
      output: sorted.join("\n"),
      totalLines,
      uniqueLines,
      duplicatesRemoved,
    };
  }, [input, mode, caseInsensitive, trimWhitespace, removeEmpty, removeDuplicates, shuffleSeed]);

  const hasInput = input.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">Input Text</span>
          <button
            onClick={() => setInput(SAMPLE_TEXT)}
            className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            Load Sample
          </button>
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={"Paste your text here, one item per line...\n\nExample:\nbanana\napple\ncherry\napple"}
          className="w-full h-48 px-4 py-3 font-mono text-sm text-gray-800 placeholder-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
          spellCheck={false}
        />
      </div>

      {/* Sort mode + Options */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
        {/* Sort modes */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Sort Mode</p>
          <div className="flex flex-wrap gap-2">
            {SORT_MODES.map(m => (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id);
                  if (m.id === "random") setShuffleSeed(s => s + 1);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  mode === m.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {m.label}
              </button>
            ))}
            {mode === "random" && (
              <button
                onClick={() => setShuffleSeed(s => s + 1)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Re-shuffle
              </button>
            )}
          </div>
        </div>

        {/* Options */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Options</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { label: "Case-insensitive", value: caseInsensitive, set: setCaseInsensitive },
              { label: "Trim whitespace", value: trimWhitespace, set: setTrimWhitespace },
              { label: "Remove empty lines", value: removeEmpty, set: setRemoveEmpty },
              { label: "Remove duplicates", value: removeDuplicates, set: setRemoveDuplicates },
            ].map(opt => (
              <label key={opt.label} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={opt.value}
                  onChange={e => opt.set(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      {hasInput && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{totalLines}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Lines</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{uniqueLines}</div>
            <div className="text-xs text-gray-500 mt-0.5">Unique Lines</div>
          </div>
          <div className={`border rounded-lg px-4 py-3 text-center shadow-sm ${duplicatesRemoved > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`}>
            <div className={`text-2xl font-bold ${duplicatesRemoved > 0 ? "text-amber-600" : "text-gray-900"}`}>
              {duplicatesRemoved}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Duplicates Removed</div>
          </div>
        </div>
      )}

      {/* Output */}
      {hasInput && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">Sorted Output</span>
            <button
              onClick={() => copyToClipboard(output, setCopied)}
              className={`text-xs px-3 py-1 rounded-md transition-colors ${
                copied
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800"
              }`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            className="w-full h-48 px-4 py-3 font-mono text-sm text-gray-800 resize-y focus:outline-none bg-white"
            spellCheck={false}
          />
        </div>
      )}

      {/* Empty state */}
      {!hasInput && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Paste text above or click <strong>Load Sample</strong> to try it out.
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Text Line Sorter & Deduplicator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Sort lines alphabetically, numerically, or randomly; remove duplicates. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Text Line Sorter & Deduplicator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Sort lines alphabetically, numerically, or randomly; remove duplicates. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
