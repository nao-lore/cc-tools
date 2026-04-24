"use client";

import { useState, useMemo } from "react";

// Flesch-Kincaid reading ease → grade level label
function readingLevel(wordCount: number, sentenceCount: number, syllableCount: number): string {
  if (wordCount === 0 || sentenceCount === 0) return "—";
  const asl = wordCount / sentenceCount; // avg sentence length
  const asw = syllableCount / wordCount; // avg syllables per word
  const score = 206.835 - 1.015 * asl - 84.6 * asw;
  if (score >= 90) return "5th grade (Very Easy)";
  if (score >= 80) return "6th grade (Easy)";
  if (score >= 70) return "7th grade (Fairly Easy)";
  if (score >= 60) return "8th–9th grade (Standard)";
  if (score >= 50) return "10th–12th grade (Fairly Difficult)";
  if (score >= 30) return "College (Difficult)";
  return "Professional (Very Difficult)";
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;
  const cleaned = w.replace(/e$/, "").replace(/[aeiou]{2}/g, "a");
  const matches = cleaned.match(/[aeiou]/g);
  return Math.max(1, matches ? matches.length : 1);
}

function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .match(/[a-z''-]+/g)
    ?.map((w) => w.replace(/^'+|'+$/g, ""))
    .filter((w) => w.length > 0) ?? [];
}

function tokenizeSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function tokenizeParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","are","was","were","be","been","being","have","has","had",
  "do","does","did","will","would","could","should","may","might","shall",
  "it","its","this","that","these","those","i","you","he","she","we","they",
  "me","him","her","us","them","my","your","his","our","their","not","no",
  "as","if","so","up","out","about","into","than","then","when","where",
  "who","how","what","which","there","here",
]);

interface Stats {
  wordCount: number;
  uniqueWordCount: number;
  lexicalDiversity: number;
  avgWordLength: number;
  avgSentenceLength: number;
  longestWord: string;
  shortestSentence: string;
  longestSentence: string;
  paragraphCount: number;
  readingLevelLabel: string;
  topWords: { word: string; count: number; pct: number }[];
  sentenceLengthBuckets: { label: string; count: number }[];
}

function analyze(text: string): Stats | null {
  if (text.trim().length === 0) return null;

  const words = tokenizeWords(text);
  const sentences = tokenizeSentences(text);
  const paragraphs = tokenizeParagraphs(text);

  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const paragraphCount = paragraphs.length;

  if (wordCount === 0) return null;

  const uniqueWords = new Set(words);
  const uniqueWordCount = uniqueWords.size;
  const lexicalDiversity = wordCount > 0 ? uniqueWordCount / wordCount : 0;

  const avgWordLength =
    words.reduce((sum, w) => sum + w.length, 0) / wordCount;

  const sentenceLengths = sentences.map(
    (s) => tokenizeWords(s).length
  );
  const avgSentenceLength =
    sentenceCount > 0
      ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceCount
      : 0;

  const sortedByLength = [...words].sort((a, b) => b.length - a.length);
  const longestWord = sortedByLength[0] ?? "";

  const sentencesSortedByLen = sentences
    .map((s, i) => ({ s, len: sentenceLengths[i] ?? 0 }))
    .sort((a, b) => a.len - b.len);
  const shortestSentence = sentencesSortedByLen[0]?.s ?? "";
  const longestSentence =
    sentencesSortedByLen[sentencesSortedByLen.length - 1]?.s ?? "";

  const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const readingLevelLabel = readingLevel(wordCount, sentenceCount, syllableCount);

  // Frequency map excluding stop words
  const freqMap = new Map<string, number>();
  for (const w of words) {
    if (!STOP_WORDS.has(w)) {
      freqMap.set(w, (freqMap.get(w) ?? 0) + 1);
    }
  }
  const topWords = [...freqMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({
      word,
      count,
      pct: Math.round((count / wordCount) * 100 * 10) / 10,
    }));

  // Sentence length distribution buckets
  const buckets = [
    { label: "1–5", min: 1, max: 5 },
    { label: "6–10", min: 6, max: 10 },
    { label: "11–20", min: 11, max: 20 },
    { label: "21–30", min: 21, max: 30 },
    { label: "31–50", min: 31, max: 50 },
    { label: "51+", min: 51, max: Infinity },
  ];
  const sentenceLengthBuckets = buckets.map(({ label, min, max }) => ({
    label,
    count: sentenceLengths.filter((l) => l >= min && l <= max).length,
  }));

  return {
    wordCount,
    uniqueWordCount,
    lexicalDiversity,
    avgWordLength,
    avgSentenceLength,
    longestWord,
    shortestSentence,
    longestSentence,
    paragraphCount,
    readingLevelLabel,
    topWords,
    sentenceLengthBuckets,
  };
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-xl font-bold text-foreground truncate">{value}</p>
      {sub && <p className="text-xs text-muted mt-0.5 truncate">{sub}</p>}
    </div>
  );
}

export default function TextStats() {
  const [text, setText] = useState("");

  const stats = useMemo(() => analyze(text), [text]);

  const maxTopCount = stats?.topWords[0]?.count ?? 1;
  const maxBucketCount = Math.max(
    1,
    ...(stats?.sentenceLengthBuckets.map((b) => b.count) ?? [1])
  );

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <label className="block text-xs text-muted mb-2">
          Paste or type your text below
        </label>
        <textarea
          className="w-full min-h-[180px] px-3 py-2.5 border border-border rounded-lg text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent resize-y font-mono"
          placeholder="Paste your text here to get instant statistics…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
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

      {!stats && (
        <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center text-muted text-sm">
          Results will appear here as you type
        </div>
      )}

      {stats && (
        <>
          {/* Dashboard cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Words" value={stats.wordCount.toLocaleString()} />
            <StatCard label="Unique Words" value={stats.uniqueWordCount.toLocaleString()} />
            <StatCard
              label="Lexical Diversity"
              value={`${(stats.lexicalDiversity * 100).toFixed(1)}%`}
              sub="unique ÷ total"
            />
            <StatCard
              label="Avg Word Length"
              value={`${stats.avgWordLength.toFixed(1)} chars`}
            />
            <StatCard
              label="Avg Sentence Length"
              value={`${stats.avgSentenceLength.toFixed(1)} words`}
            />
            <StatCard label="Paragraphs" value={stats.paragraphCount} />
            <StatCard
              label="Longest Word"
              value={stats.longestWord || "—"}
              sub={stats.longestWord ? `${stats.longestWord.length} chars` : undefined}
            />
            <StatCard
              label="Reading Level"
              value={stats.readingLevelLabel.split(" (")[0]}
              sub={stats.readingLevelLabel.match(/\((.+)\)/)?.[1]}
            />
          </div>

          {/* Shortest / Longest sentence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <p className="text-xs text-muted mb-2">Shortest Sentence</p>
              <p className="text-sm text-foreground leading-relaxed line-clamp-4">
                {stats.shortestSentence || "—"}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <p className="text-xs text-muted mb-2">Longest Sentence</p>
              <p className="text-sm text-foreground leading-relaxed line-clamp-4">
                {stats.longestSentence || "—"}
              </p>
            </div>
          </div>

          {/* Top 20 Word Frequency */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-sm mb-4">
              Top 20 Most Frequent Words
              <span className="text-xs text-muted font-normal ml-2">(stop words excluded)</span>
            </h3>
            {stats.topWords.length === 0 ? (
              <p className="text-sm text-muted">No content words found.</p>
            ) : (
              <div className="space-y-2">
                {stats.topWords.map(({ word, count, pct }) => {
                  const barW = Math.round((count / maxTopCount) * 100);
                  return (
                    <div key={word} className="flex items-center gap-3">
                      <span className="text-sm font-mono w-28 shrink-0 truncate text-foreground">
                        {word}
                      </span>
                      <div className="flex-1 h-5 bg-accent rounded overflow-hidden">
                        <div
                          className="h-full bg-primary/70 rounded transition-all duration-300"
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted w-16 shrink-0 text-right">
                        {count}× ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sentence Length Distribution */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-sm mb-4">Sentence Length Distribution</h3>
            <div className="flex items-end gap-2 h-36">
              {stats.sentenceLengthBuckets.map(({ label, count }) => {
                const heightPct =
                  maxBucketCount > 0
                    ? Math.round((count / maxBucketCount) * 100)
                    : 0;
                return (
                  <div
                    key={label}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-xs text-muted">{count > 0 ? count : ""}</span>
                    <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
                      <div
                        className="w-full bg-primary/60 rounded-t transition-all duration-300"
                        style={{
                          height: count > 0 ? `${Math.max(4, heightPct * 0.8)}px` : "2px",
                          opacity: count > 0 ? 1 : 0.2,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted text-center leading-tight">
                      {label}
                      <br />
                      <span className="text-[10px]">words</span>
                    </span>
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Text Statistics Dashboard tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Comprehensive text analytics: word frequency, sentence length, complexity. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Text Statistics Dashboard tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Comprehensive text analytics: word frequency, sentence length, complexity. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
                );
              })}
            </div>
            <p className="text-xs text-muted mt-3">
              Sentences grouped by word count. Shorter bars = fewer sentences in that range.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
