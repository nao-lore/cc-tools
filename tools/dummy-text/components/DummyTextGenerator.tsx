"use client";

import { useState, useCallback } from "react";

// Common English words for standard filler
const STANDARD_WORDS = [
  "the", "of", "and", "to", "in", "is", "that", "it", "was", "for", "on",
  "are", "with", "they", "be", "at", "one", "have", "this", "from", "by",
  "not", "but", "what", "all", "were", "when", "we", "there", "can", "an",
  "your", "which", "their", "will", "each", "about", "up", "out", "them",
  "then", "she", "many", "some", "so", "these", "would", "other", "into",
  "has", "her", "two", "like", "him", "its", "how", "long", "make", "thing",
  "see", "now", "way", "may", "down", "did", "get", "come", "made", "find",
  "back", "only", "just", "very", "take", "work", "well", "also", "use",
  "give", "most", "tell", "good", "great", "help", "put", "own", "say",
  "name", "still", "hand", "high", "last", "home", "keep", "never", "far",
  "real", "same", "left", "big", "old", "part", "small", "again", "does",
  "need", "show", "large", "under", "line", "must", "much", "place", "move",
  "live", "more", "between", "after", "new", "look", "those", "first",
  "over", "than", "year", "every", "another", "came", "right", "used",
  "around", "where", "should", "went", "world", "end", "might", "here",
  "think", "kind", "both", "next", "head", "started", "open", "while",
  "hard", "better", "mean", "before", "turn", "set", "play", "point",
  "young", "state", "side", "call", "start", "close", "yet", "walk",
  "night", "until", "along", "seem", "family", "enough", "such", "always",
  "few", "being", "against", "below", "house", "change", "since",
  "different", "man", "read", "land", "face", "food", "four", "group",
  "city", "sure", "done", "second", "study", "thought", "life", "near",
  "paper", "often", "found", "number", "above", "soon", "learn", "money",
  "story", "war", "form", "watch", "knew", "early", "page", "write",
  "plan", "water", "carry", "run", "saw", "stand", "list", "talk", "began",
  "sentence", "letter", "miss", "once", "heard", "best", "river",
  "question", "stay",
];

// Technical jargon words
const TECH_WORDS = [
  "algorithm", "database", "framework", "component", "interface", "module",
  "endpoint", "deployment", "container", "pipeline", "middleware", "cache",
  "runtime", "compiler", "debugging", "refactor", "repository", "branch",
  "merge", "commit", "server", "client", "protocol", "payload", "schema",
  "query", "index", "token", "session", "render", "async", "callback",
  "promise", "function", "variable", "constant", "parameter", "argument",
  "return", "iterate", "recursive", "binary", "stack", "queue", "hash",
  "node", "tree", "graph", "network", "socket", "stream", "buffer",
  "thread", "process", "memory", "storage", "cluster", "proxy", "gateway",
  "monitor", "logging", "testing", "staging", "production", "sandbox",
  "virtual", "instance", "snapshot", "backup", "restore", "migrate",
  "scale", "optimize", "benchmark", "profile", "trace", "debug",
  "validate", "parse", "serialize", "encrypt", "decrypt", "authenticate",
  "authorize", "configure", "initialize", "bootstrap", "provision",
  "orchestrate", "automate", "integrate", "implement", "execute",
  "process", "transform", "aggregate", "distribute", "replicate",
  "partition", "shard", "failover", "rollback", "webhook", "microservice",
  "monolith", "serverless", "edge", "latency", "throughput", "bandwidth",
];

// Business speak words
const BUSINESS_WORDS = [
  "strategy", "leverage", "synergy", "stakeholder", "deliverable",
  "milestone", "objective", "initiative", "alignment", "scalable",
  "optimize", "streamline", "innovate", "disrupt", "transform",
  "empower", "facilitate", "collaborate", "pipeline", "roadmap",
  "benchmark", "framework", "ecosystem", "paradigm", "value",
  "proposition", "competitive", "advantage", "market", "growth",
  "revenue", "margin", "portfolio", "acquisition", "retention",
  "engagement", "conversion", "analytics", "insight", "metric",
  "dashboard", "forecast", "projection", "quarter", "fiscal",
  "budget", "investment", "return", "capital", "asset", "resource",
  "allocation", "efficiency", "productivity", "performance", "outcome",
  "impact", "sustainable", "agile", "dynamic", "robust", "proactive",
  "strategic", "tactical", "operational", "holistic", "comprehensive",
  "integrated", "seamless", "turnkey", "enterprise", "solution",
  "platform", "vertical", "horizontal", "segment", "niche", "brand",
  "equity", "awareness", "positioning", "differentiation", "loyalty",
  "satisfaction", "experience", "journey", "touchpoint", "funnel",
  "lifecycle", "onboarding", "churn", "upsell", "cross-sell",
  "partnership", "alliance", "vendor", "procurement", "compliance",
  "governance", "transparency", "accountability", "leadership",
  "execution", "excellence", "innovation", "disruption", "transformation",
];

type TextStyle = "standard" | "technical" | "business";
type OutputFormat = "paragraphs" | "sentences" | "words";

function pickRandom(words: string[]): string {
  return words[Math.floor(Math.random() * words.length)];
}

function generateSentence(words: string[], wordCount: number): string {
  const sentence: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    sentence.push(pickRandom(words));
  }
  sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1);
  return sentence.join(" ") + ".";
}

function generateParagraph(
  words: string[],
  sentenceCount: number,
  wordsPerSentence: number
): string {
  const sentences: string[] = [];
  for (let i = 0; i < sentenceCount; i++) {
    // Vary word count slightly for natural feel
    const variance = Math.floor(Math.random() * 5) - 2;
    const count = Math.max(3, wordsPerSentence + variance);
    sentences.push(generateSentence(words, count));
  }
  return sentences.join(" ");
}

function getWordList(style: TextStyle): string[] {
  switch (style) {
    case "technical":
      return [...TECH_WORDS, ...STANDARD_WORDS.slice(0, 40)];
    case "business":
      return [...BUSINESS_WORDS, ...STANDARD_WORDS.slice(0, 40)];
    default:
      return STANDARD_WORDS;
  }
}

export default function DummyTextGenerator() {
  const [style, setStyle] = useState<TextStyle>("standard");
  const [format, setFormat] = useState<OutputFormat>("paragraphs");
  const [paragraphCount, setParagraphCount] = useState(3);
  const [sentencesPerParagraph, setSentencesPerParagraph] = useState(5);
  const [wordsPerSentence, setWordsPerSentence] = useState(10);
  const [includeHtml, setIncludeHtml] = useState(false);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const words = getWordList(style);
    let result = "";

    if (format === "words") {
      const wordList: string[] = [];
      const totalWords = paragraphCount * sentencesPerParagraph * wordsPerSentence;
      for (let i = 0; i < totalWords; i++) {
        wordList.push(pickRandom(words));
      }
      result = wordList.join(" ");
    } else if (format === "sentences") {
      const sentences: string[] = [];
      const totalSentences = paragraphCount * sentencesPerParagraph;
      for (let i = 0; i < totalSentences; i++) {
        const variance = Math.floor(Math.random() * 5) - 2;
        const count = Math.max(3, wordsPerSentence + variance);
        sentences.push(generateSentence(words, count));
      }
      result = sentences.join(" ");
    } else {
      const paragraphs: string[] = [];
      for (let i = 0; i < paragraphCount; i++) {
        const p = generateParagraph(words, sentencesPerParagraph, wordsPerSentence);
        paragraphs.push(includeHtml ? `<p>${p}</p>` : p);
      }
      result = paragraphs.join(includeHtml ? "\n" : "\n\n");
    }

    setOutput(result);
    setCopied(false);
  }, [style, format, paragraphCount, sentencesPerParagraph, wordsPerSentence, includeHtml]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  // Stats
  const wordCount = output ? output.split(/\s+/).filter(Boolean).length : 0;
  const charCount = output.length;
  const paraCount = output
    ? output.split(includeHtml ? "\n" : "\n\n").filter(Boolean).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-5">
        {/* Text Style */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Text Style
          </label>
          <div className="flex gap-2">
            {(
              [
                ["standard", "Standard Filler"],
                ["technical", "Technical Jargon"],
                ["business", "Business Speak"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setStyle(value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  style === value
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Output Format */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Output Format
          </label>
          <div className="flex gap-2">
            {(
              [
                ["paragraphs", "Paragraphs"],
                ["sentences", "Sentences"],
                ["words", "Words Only"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFormat(value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  format === value
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paragraphs: {paragraphCount}
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={paragraphCount}
              onChange={(e) => setParagraphCount(Number(e.target.value))}
              className="w-full accent-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sentences per paragraph: {sentencesPerParagraph}
            </label>
            <input
              type="range"
              min={1}
              max={15}
              value={sentencesPerParagraph}
              onChange={(e) =>
                setSentencesPerParagraph(Number(e.target.value))
              }
              className="w-full accent-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Words per sentence: {wordsPerSentence}
            </label>
            <input
              type="range"
              min={3}
              max={25}
              value={wordsPerSentence}
              onChange={(e) => setWordsPerSentence(Number(e.target.value))}
              className="w-full accent-gray-900"
            />
          </div>
        </div>

        {/* HTML Tags Toggle */}
        {format === "paragraphs" && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeHtml"
              checked={includeHtml}
              onChange={(e) => setIncludeHtml(e.target.checked)}
              className="w-4 h-4 accent-gray-900 rounded"
            />
            <label
              htmlFor="includeHtml"
              className="text-sm text-gray-700"
            >
              Wrap in{" "}
              <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">
                &lt;p&gt;
              </code>{" "}
              tags
            </label>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generate}
          className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
        >
          Generate Text
        </button>
      </div>

      {/* Output */}
      {output && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Stats Bar */}
          <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-2">
            <div className="flex gap-4 text-sm text-gray-500">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
              {format === "paragraphs" && (
                <span>{paraCount} paragraphs</span>
              )}
            </div>
            <button
              onClick={copyToClipboard}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                copied
                  ? "bg-green-100 text-green-700"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Text Output */}
          <div className="p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
              {output}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
