"use client";

import { useState, useMemo } from "react";

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "shall",
  "should", "may", "might", "must", "can", "could", "to", "of", "in",
  "on", "at", "by", "for", "with", "about", "against", "between", "into",
  "through", "during", "before", "after", "above", "below", "from", "up",
  "down", "out", "off", "over", "under", "again", "then", "once", "and",
  "but", "or", "nor", "so", "yet", "both", "either", "neither", "not",
  "this", "that", "these", "those", "i", "me", "my", "myself", "we",
  "our", "ours", "you", "your", "he", "she", "it", "they", "them",
  "what", "which", "who", "whom", "its", "his", "her", "their",
]);

type SortKey = "count" | "alpha";

function processText(
  text: string,
  caseSensitive: boolean,
  stripPunctuation: boolean,
  filterStopWords: boolean
): Map<string, number> {
  let processed = text;
  if (stripPunctuation) {
    processed = processed.replace(/[^\w\s'-]/g, " ").replace(/[-']{2,}/g, " ");
  }
  const tokens = processed.split(/\s+/).filter(Boolean);
  const freq = new Map<string, number>();
  for (const raw of tokens) {
    let word = raw;
    if (stripPunctuation) {
      word = word.replace(/^[-']+|[-']+$/g, "");
    }
    if (!word) continue;
    const key = caseSensitive ? word : word.toLowerCase();
    if (!key) continue;
    if (filterStopWords && STOP_WORDS.has(key.toLowerCase())) continue;
    freq.set(key, (freq.get(key) ?? 0) + 1);
  }
  return freq;
}

export default function WordFrequency() {
  const [text, setText] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("count");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [stripPunctuation, setStripPunctuation] = useState(true);
  const [filterStopWords, setFilterStopWords] = useState(false);
  const [copied, setCopied] = useState(false);

  const freqMap = useMemo(
    () => processText(text, caseSensitive, stripPunctuation, filterStopWords),
    [text, caseSensitive, stripPunctuation, filterStopWords]
  );

  const sorted = useMemo(() => {
    const entries = Array.from(freqMap.entries());
    if (sortKey === "count") {
      entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    } else {
      entries.sort((a, b) => a[0].localeCompare(b[0]));
    }
    return entries;
  }, [freqMap, sortKey]);

  const totalWords = useMemo(() => {
    if (!text.trim()) return 0;
    let t = text;
    if (stripPunctuation) t = t.replace(/[^\w\s'-]/g, " ");
    return t.split(/\s+/).filter(Boolean).length;
  }, [text, stripPunctuation]);

  const uniqueWords = freqMap.size;
  const top20 = sorted.slice(0, 20);
  const maxCount = top20.length > 0 ? top20[0][1] : 1;

  const exportCSV = () => {
    const rows = [["word", "count"], ...sorted.map(([w, c]) => [w, String(c)])];
    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "word-frequency.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyTable = () => {
    const lines = sorted.map(([w, c]) => `${w}\t${c}`).join("\n");
    navigator.clipboard.writeText("word\tcount\n" + lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <label className="block text-xs text-muted mb-2">Paste or type your text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter any text here to analyze word frequency..."
          rows={6}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        {text.length > 0 && (
          <button
            onClick={() => setText("")}
            className="mt-2 text-xs text-muted hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Options */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <p className="text-xs text-muted mb-3">Options</p>
        <div className="flex flex-wrap gap-4">
          {(
            [
              { label: "Case-sensitive", value: caseSensitive, set: setCaseSensitive },
              { label: "Strip punctuation", value: stripPunctuation, set: setStripPunctuation },
              { label: "Filter stop words", value: filterStopWords, set: setFilterStopWords },
            ] as { label: string; value: boolean; set: (v: boolean) => void }[]
          ).map(({ label, value, set }) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
              <button
                role="switch"
                aria-checked={value}
                onClick={() => set(!value)}
                className={`relative w-9 h-5 rounded-full transition-colors ${
                  value ? "bg-primary" : "bg-accent"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    value ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm text-foreground">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stats */}
      {text.trim() && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm text-center">
              <p className="text-3xl font-bold text-primary">{totalWords.toLocaleString()}</p>
              <p className="text-xs text-muted mt-1">Total words</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm text-center">
              <p className="text-3xl font-bold text-foreground">{uniqueWords.toLocaleString()}</p>
              <p className="text-xs text-muted mt-1">Unique words</p>
            </div>
          </div>

          {/* Bar chart */}
          {top20.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                Top {top20.length} words
              </h2>
              <div className="space-y-2">
                {top20.map(([word, count]) => {
                  const pct = Math.round((count / maxCount) * 100);
                  return (
                    <div key={word} className="flex items-center gap-2 text-sm">
                      <span className="w-28 shrink-0 truncate text-right text-muted font-mono text-xs">
                        {word}
                      </span>
                      <div className="flex-1 bg-accent rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        >
                          {pct >= 15 && (
                            <span className="text-primary-foreground text-xs font-bold leading-none">
                              {count}
                            </span>
                          )}
                        </div>
                      </div>
                      {pct < 15 && (
                        <span className="text-xs text-muted w-6 text-left shrink-0">{count}</span>
                      )}
                    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Word Frequency Counter tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Count word frequency in any text and visualize with a bar chart. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Word Frequency Counter tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Count word frequency in any text and visualize with a bar chart. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Table */}
          {sorted.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Sort by:</span>
                  <button
                    onClick={() => setSortKey("count")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                      sortKey === "count"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted hover:border-primary/50"
                    }`}
                  >
                    Frequency
                  </button>
                  <button
                    onClick={() => setSortKey("alpha")}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                      sortKey === "alpha"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted hover:border-primary/50"
                    }`}
                  >
                    A–Z
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyTable}
                    className="px-3 py-1 rounded-lg text-xs border border-border text-muted hover:border-primary/50 transition-all"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={exportCSV}
                    className="px-3 py-1 rounded-lg text-xs border border-border text-muted hover:border-primary/50 transition-all"
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="overflow-auto max-h-80 rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-accent">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">#</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-muted">Word</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-muted">Count</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-muted">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map(([word, count], i) => (
                      <tr
                        key={word}
                        className="border-t border-border hover:bg-accent/50 transition-colors"
                      >
                        <td className="px-3 py-1.5 text-xs text-muted">{i + 1}</td>
                        <td className="px-3 py-1.5 font-mono text-foreground">{word}</td>
                        <td className="px-3 py-1.5 text-right font-bold text-primary">{count}</td>
                        <td className="px-3 py-1.5 text-right text-muted text-xs">
                          {totalWords > 0 ? ((count / totalWords) * 100).toFixed(1) : "0.0"}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!text.trim() && (
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm text-center text-muted text-sm">
          Paste any text above to count word frequency
        </div>
      )}

      {/* Ad placeholder */}
      <div className="bg-accent border border-border rounded-xl p-4 text-center text-muted text-xs">
        Advertisement
      </div>
    </div>
  );
}
