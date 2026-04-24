"use client";

import { useState, useMemo, useCallback } from "react";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "shall", "can", "need", "dare",
  "ought", "used", "it", "its", "this", "that", "these", "those", "i",
  "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
  "yours", "yourself", "he", "him", "his", "himself", "she", "her",
  "hers", "herself", "they", "them", "their", "theirs", "themselves",
  "what", "which", "who", "whom", "when", "where", "why", "how", "all",
  "each", "every", "both", "few", "more", "most", "other", "some",
  "such", "no", "not", "only", "same", "so", "than", "too", "very",
  "just", "about", "above", "after", "before", "between", "into",
  "through", "during", "up", "down", "out", "off", "over", "under",
  "again", "then", "here", "there", "also", "as", "if", "while",
]);

interface WordEntry {
  word: string;
  count: number;
  density: number;
}

interface PhraseEntry {
  phrase: string;
  count: number;
  density: number;
}

interface AnalysisResult {
  wordCount: number;
  uniqueWords: number;
  avgWordLength: number;
  topWords: WordEntry[];
  topBigrams: PhraseEntry[];
  topTrigrams: PhraseEntry[];
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^['-]+|['-]+$/g, ""))
    .filter((w) => w.length > 0);
}

function countMap(tokens: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of tokens) {
    map.set(t, (map.get(t) ?? 0) + 1);
  }
  return map;
}

function topEntries(map: Map<string, number>, total: number, n: number): WordEntry[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([word, count]) => ({
      word,
      count,
      density: total > 0 ? (count / total) * 100 : 0,
    }));
}

function topPhraseEntries(
  tokens: string[],
  n: number,
  size: 2 | 3,
  filterStopWords: boolean
): PhraseEntry[] {
  const map = new Map<string, number>();
  for (let i = 0; i <= tokens.length - size; i++) {
    const slice = tokens.slice(i, i + size);
    if (filterStopWords && (STOP_WORDS.has(slice[0]) || STOP_WORDS.has(slice[size - 1]))) {
      continue;
    }
    const phrase = slice.join(" ");
    map.set(phrase, (map.get(phrase) ?? 0) + 1);
  }
  const total = tokens.length - size + 1;
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([phrase, count]) => ({
      phrase,
      count,
      density: total > 0 ? (count / total) * 100 : 0,
    }));
}

function analyze(text: string, filterStop: boolean): AnalysisResult | null {
  const tokens = tokenize(text);
  if (tokens.length === 0) return null;

  const wordCount = tokens.length;
  const avgWordLength =
    tokens.reduce((sum, w) => sum + w.length, 0) / wordCount;

  const filtered = filterStop ? tokens.filter((w) => !STOP_WORDS.has(w)) : tokens;
  const wordFreq = countMap(filtered);
  const uniqueWords = new Set(tokens).size;

  const topWords = topEntries(wordFreq, filtered.length, 20);
  const topBigrams = topPhraseEntries(tokens, 10, 2, filterStop);
  const topTrigrams = topPhraseEntries(tokens, 10, 3, filterStop);

  return { wordCount, uniqueWords, avgWordLength, topWords, topBigrams, topTrigrams };
}

function highlight(text: string, keyword: string): React.ReactNode[] {
  if (!keyword) return [text];
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function KeywordDensity() {
  const [text, setText] = useState("");
  const [filterStop, setFilterStop] = useState(true);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [activeTab, setActiveTab] = useState<"words" | "bigrams" | "trigrams">("words");

  const result = useMemo(() => analyze(text, filterStop), [text, filterStop]);

  const handleSelectKeyword = useCallback((word: string) => {
    setSelectedKeyword((prev) => (prev === word ? "" : word));
  }, []);

  const highlightedText = useMemo(
    () => (selectedKeyword && text ? highlight(text, selectedKeyword) : null),
    [text, selectedKeyword]
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Input */}
      <div
        className="rounded-xl border p-5 space-y-3"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <label className="font-semibold text-sm">Paste your text</label>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <div
              onClick={() => setFilterStop((v) => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                filterStop ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  filterStop ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
            Filter stop words
          </label>
        </div>
        <textarea
          className="w-full h-48 rounded-lg border p-3 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
          placeholder="Paste or type any text here to analyze keyword density..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSelectedKeyword("");
          }}
        />
        {text && (
          <button
            onClick={() => { setText(""); setSelectedKeyword(""); }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Stats */}
      {result && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Words", value: result.wordCount.toLocaleString() },
              { label: "Unique Words", value: result.uniqueWords.toLocaleString() },
              { label: "Avg Word Length", value: result.avgWordLength.toFixed(1) + " chars" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border p-4 text-center"
                style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
              >
                <div className="text-2xl font-bold tabular-nums">{s.value}</div>
                <div className="text-xs opacity-60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
              {(["words", "bigrams", "trigrams"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {tab === "words" ? "Single Words" : tab === "bigrams" ? "2-Word Phrases" : "3-Word Phrases"}
                </button>
              ))}
            </div>

            <div className="p-1">
              {activeTab === "words" && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs opacity-50 uppercase">
                      <th className="text-left px-3 py-2 font-medium">#</th>
                      <th className="text-left px-3 py-2 font-medium">Word</th>
                      <th className="text-right px-3 py-2 font-medium">Count</th>
                      <th className="text-right px-3 py-2 font-medium">Density</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.topWords.map((entry, i) => (
                      <tr
                        key={entry.word}
                        className={`border-t transition-colors hover:opacity-80 cursor-pointer ${
                          selectedKeyword === entry.word ? "bg-yellow-50" : ""
                        }`}
                        style={{ borderColor: "var(--border)" }}
                        onClick={() => handleSelectKeyword(entry.word)}
                      >
                        <td className="px-3 py-2 text-xs opacity-40 tabular-nums">{i + 1}</td>
                        <td className="px-3 py-2 font-mono font-medium">{entry.word}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{entry.count}</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {entry.density.toFixed(2)}%
                        </td>
                        <td className="px-3 py-2 w-24">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (entry.density /
                                    (result.topWords[0]?.density || 1)) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "bigrams" && (
                <PhraseTable entries={result.topBigrams} />
              )}

              {activeTab === "trigrams" && (
                <PhraseTable entries={result.topTrigrams} />
              )}
            </div>
          </div>

          {/* Highlighted preview */}
          {selectedKeyword && (
            <div
              className="rounded-xl border p-5 space-y-2"
              style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  Highlighting:{" "}
                  <span className="font-mono text-blue-600">{selectedKeyword}</span>
                </span>
                <button
                  onClick={() => setSelectedKeyword("")}
                  className="text-xs opacity-40 hover:opacity-70 transition-opacity"
                >
                  Clear
                </button>
              </div>
              <div
                className="text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto rounded-lg border p-3"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                }}
              >
                {highlightedText}
              </div>
            </div>
          )}

          {activeTab === "words" && result.topWords.length > 0 && !selectedKeyword && (
            <p className="text-xs opacity-50 text-center">
              Click any word row to highlight it in your text
            </p>
          )}
        </>
      )}

      {!result && text.trim().length > 0 && (
        <div className="text-center text-sm opacity-50 py-6">
          No words found. Try entering more text.
        </div>
      )}
    </div>
  );
}

function PhraseTable({ entries }: { entries: PhraseEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center text-sm opacity-50 py-8">
        Not enough text for phrase analysis.
      </div>
    );
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs opacity-50 uppercase">
          <th className="text-left px-3 py-2 font-medium">#</th>
          <th className="text-left px-3 py-2 font-medium">Phrase</th>
          <th className="text-right px-3 py-2 font-medium">Count</th>
          <th className="text-right px-3 py-2 font-medium">Density</th>
          <th className="px-3 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, i) => (
          <tr
            key={entry.phrase}
            className="border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <td className="px-3 py-2 text-xs opacity-40 tabular-nums">{i + 1}</td>
            <td className="px-3 py-2 font-mono font-medium">{entry.phrase}</td>
            <td className="px-3 py-2 text-right tabular-nums">{entry.count}</td>
            <td className="px-3 py-2 text-right tabular-nums">
              {entry.density.toFixed(2)}%
            </td>
            <td className="px-3 py-2 w-24">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (entry.density / (entries[0]?.density || 1)) * 100
                    )}%`,
                  }}
                />
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Keyword Density Analyzer tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Analyze keyword frequency and density in any text. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Keyword Density Analyzer tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Analyze keyword frequency and density in any text. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
