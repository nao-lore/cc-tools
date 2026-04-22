"use client";

import { useState, useCallback, useMemo } from "react";

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "that", "this", "are", "was",
  "were", "be", "been", "being", "have", "has", "had", "do", "does",
  "did", "will", "would", "could", "should", "may", "might", "shall",
  "can", "not", "no", "so", "if", "as", "its", "i", "my", "me", "we",
  "our", "you", "your", "he", "she", "they", "them", "their", "his",
  "her", "us", "am", "just", "than", "then", "also", "into", "about",
  "up", "out", "all", "more", "some", "any", "each", "which", "when",
  "what", "where", "who", "how", "there", "here",
]);

interface Stats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTime: string;
  speakingTime: string;
}

interface KeywordEntry {
  word: string;
  count: number;
  percentage: number;
}

interface SocialLimit {
  name: string;
  limit: number;
  used: number;
  percentage: number;
}

function computeStats(text: string): Stats {
  if (!text.trim()) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      readingTime: "0 min",
      speakingTime: "0 min",
    };
  }

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const lines = text.split(/\n/).length;

  const readingMinutes = Math.ceil(words / 200);
  const speakingMinutes = Math.ceil(words / 130);

  const readingTime =
    readingMinutes < 1 ? "< 1 min" : `${readingMinutes} min`;
  const speakingTime =
    speakingMinutes < 1 ? "< 1 min" : `${speakingMinutes} min`;

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    lines,
    readingTime,
    speakingTime,
  };
}

function computeKeywords(text: string): KeywordEntry[] {
  if (!text.trim()) return [];

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  const total = words.length;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({
      word,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }));
}

function computeSocialLimits(text: string): SocialLimit[] {
  const len = text.length;
  return [
    { name: "Twitter / X", limit: 280, used: len, percentage: Math.min(100, Math.round((len / 280) * 100)) },
    { name: "Instagram", limit: 2200, used: len, percentage: Math.min(100, Math.round((len / 2200) * 100)) },
    { name: "LinkedIn", limit: 3000, used: len, percentage: Math.min(100, Math.round((len / 3000) * 100)) },
  ];
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
      <div className="text-3xl font-bold" style={{ color: "var(--accent)" }}>
        {value}
      </div>
      <div className="mt-1 text-sm font-medium" style={{ color: "var(--muted)" }}>
        {label}
      </div>
    </div>
  );
}

export default function WordCounter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => computeStats(text), [text]);
  const keywords = useMemo(() => computeKeywords(text), [text]);
  const socialLimits = useMemo(() => computeSocialLimits(text), [text]);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  const handleClear = useCallback(() => {
    setText("");
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Words" value={stats.words} />
        <StatCard label="Characters" value={stats.characters} />
        <StatCard label="Characters (no spaces)" value={stats.charactersNoSpaces} />
        <StatCard label="Sentences" value={stats.sentences} />
        <StatCard label="Paragraphs" value={stats.paragraphs} />
        <StatCard label="Lines" value={stats.lines} />
        <StatCard label="Reading Time" value={stats.readingTime} />
        <StatCard label="Speaking Time" value={stats.speakingTime} />
      </div>

      {/* Textarea + Buttons */}
      <div>
        <div className="flex gap-2 mb-2 justify-end">
          <button
            onClick={handleCopy}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: copied ? "#22c55e" : "var(--accent)",
              color: "#ffffff",
            }}
          >
            {copied ? "Copied!" : "Copy Text"}
          </button>
          <button
            onClick={handleClear}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{
              borderColor: "var(--card-border)",
              color: "var(--foreground)",
            }}
          >
            Clear
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here..."
          className="w-full rounded-xl border p-4 text-base leading-relaxed outline-none transition-colors focus:ring-2"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--card-border)",
            color: "var(--foreground)",
            minHeight: "240px",
            resize: "vertical",
          }}
          autoFocus
        />
      </div>

      {/* Social Media Limits + Keyword Density side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Social Media Limits */}
        <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <h2 className="mb-4 text-lg font-semibold">Social Media Limits</h2>
          <div className="space-y-4">
            {socialLimits.map((s) => (
              <div key={s.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{s.name}</span>
                  <span style={{ color: "var(--muted)" }}>
                    {s.used.toLocaleString()} / {s.limit.toLocaleString()}
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full" style={{ backgroundColor: "var(--card-border)" }}>
                  <div
                    className="h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${s.percentage}%`,
                      backgroundColor: s.percentage >= 100 ? "#ef4444" : s.percentage >= 80 ? "#f59e0b" : "var(--accent)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Keyword Density */}
        <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <h2 className="mb-4 text-lg font-semibold">Keyword Density (Top 10)</h2>
          {keywords.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Start typing to see keyword density...
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: "var(--muted)" }}>
                  <th className="pb-2 text-left font-medium">Keyword</th>
                  <th className="pb-2 text-right font-medium">Count</th>
                  <th className="pb-2 text-right font-medium">Density</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((k) => (
                  <tr key={k.word} className="border-t" style={{ borderColor: "var(--card-border)" }}>
                    <td className="py-1.5">{k.word}</td>
                    <td className="py-1.5 text-right">{k.count}</td>
                    <td className="py-1.5 text-right">{k.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
