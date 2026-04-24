"use client";

import { useState, useMemo } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const SPAM_TRIGGERS = [
  "free", "urgent", "act now", "limited time", "winner", "guarantee",
  "click here", "buy now", "order now", "special offer", "exclusive deal",
  "100%", "no cost", "risk free", "risk-free", "amazing", "incredible",
  "unbelievable", "congratulations", "you've been selected", "cash",
  "prize", "earn money", "make money", "extra income", "double your",
  "lose weight", "miracle", "no obligation", "once in a lifetime",
  "bargain", "discount", "cheap", "lowest price", "save big",
];

const TRUNCATION_POINTS = [40, 60, 80] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Analysis {
  charCount: number;
  wordCount: number;
  emojiCount: number;
  emojis: string[];
  spamWords: string[];
  allCapsRatio: number;
  excessivePunctuation: boolean;
  truncations: Record<number, string>;
  score: "Good" | "Warning" | "Poor";
  scoreColor: string;
  issues: string[];
  tips: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractEmojis(text: string): string[] {
  const emojiRegex =
    /[\u{1F300}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}]/gu;
  return text.match(emojiRegex) ?? [];
}

function findSpamWords(text: string): string[] {
  const lower = text.toLowerCase();
  return SPAM_TRIGGERS.filter((trigger) => lower.includes(trigger));
}

function allCapsRatio(text: string): number {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length === 0) return 0;
  const upper = text.replace(/[^A-Z]/g, "");
  return upper.length / letters.length;
}

function analyzeSubject(subject: string): Analysis {
  const charCount = subject.length;
  const wordCount = subject.trim() === "" ? 0 : subject.trim().split(/\s+/).length;
  const emojis = extractEmojis(subject);
  const emojiCount = emojis.length;
  const spamWords = findSpamWords(subject);
  const capsRatio = allCapsRatio(subject);
  const excessivePunctuation = /[!?]{2,}/.test(subject);

  const truncations: Record<number, string> = {};
  for (const pt of TRUNCATION_POINTS) {
    truncations[pt] = subject.length > pt ? subject.slice(0, pt) + "…" : subject;
  }

  const issues: string[] = [];
  const tips: string[] = [];

  // Issues
  if (charCount === 0) {
    issues.push("Subject line is empty");
  }
  if (charCount > 80) {
    issues.push(`Too long (${charCount} chars) — truncated on most clients`);
  } else if (charCount > 60) {
    issues.push(`Long (${charCount} chars) — may truncate on mobile`);
  } else if (charCount < 20 && charCount > 0) {
    issues.push("Very short — may lack context");
  }
  if (spamWords.length > 0) {
    issues.push(`Spam trigger words: ${spamWords.map((w) => `"${w}"`).join(", ")}`);
  }
  if (capsRatio > 0.5 && charCount > 0) {
    issues.push(`High ALL CAPS ratio (${Math.round(capsRatio * 100)}%) — looks like shouting`);
  }
  if (excessivePunctuation) {
    issues.push('Excessive punctuation (!! or ??) detected');
  }
  if (emojiCount > 3) {
    issues.push(`Too many emojis (${emojiCount}) — reduces professionalism`);
  }

  // Tips
  if (charCount > 0 && charCount <= 40) {
    tips.push("Great length — fits all inboxes without truncation");
  }
  if (emojiCount === 1) {
    tips.push("One emoji adds personality without overdoing it");
  }
  if (spamWords.length === 0 && charCount > 0) {
    tips.push("No spam trigger words detected");
  }
  if (capsRatio <= 0.2 && charCount > 0) {
    tips.push("Good use of capitalization");
  }

  // Score
  let score: "Good" | "Warning" | "Poor";
  let scoreColor: string;

  const criticalIssues = [
    spamWords.length > 2,
    capsRatio > 0.7 && charCount > 0,
    charCount > 80,
    charCount === 0,
  ].filter(Boolean).length;

  const minorIssues = [
    spamWords.length > 0,
    capsRatio > 0.5,
    charCount > 60,
    excessivePunctuation,
    emojiCount > 3,
  ].filter(Boolean).length;

  if (criticalIssues >= 1) {
    score = "Poor";
    scoreColor = "text-red-600 dark:text-red-400";
  } else if (minorIssues >= 2) {
    score = "Warning";
    scoreColor = "text-yellow-600 dark:text-yellow-400";
  } else if (charCount === 0) {
    score = "Poor";
    scoreColor = "text-red-600 dark:text-red-400";
  } else {
    score = "Good";
    scoreColor = "text-green-600 dark:text-green-400";
  }

  return {
    charCount,
    wordCount,
    emojiCount,
    emojis,
    spamWords,
    allCapsRatio: capsRatio,
    excessivePunctuation,
    truncations,
    score,
    scoreColor,
    issues,
    tips,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBadge({ score, color }: { score: string; color: string }) {
  const bg =
    score === "Good"
      ? "bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700"
      : score === "Warning"
      ? "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-300 dark:border-yellow-700"
      : "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700";

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-semibold ${bg} ${color}`}>
      {score === "Good" ? "✓ Good" : score === "Warning" ? "⚠ Warning" : "✗ Poor"}
    </span>
  );
}

function StatPill({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`flex flex-col items-center px-4 py-2 rounded-lg border ${highlight ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20" : "border-[var(--border)] bg-[var(--muted)]"}`}>
      <span className="text-lg font-bold text-[var(--foreground)]">{value}</span>
      <span className="text-xs text-[var(--muted-fg)]">{label}</span>
    </div>
  );
}

function MobilePreview({ subject }: { subject: string }) {
  const display = subject.length > 60 ? subject.slice(0, 60) + "…" : subject || "Your subject line";

  return (
    <div className="flex flex-col items-center">
      {/* Phone shell */}
      <div className="w-[240px] rounded-[24px] border-[3px] border-[var(--foreground)] bg-[var(--background)] overflow-hidden shadow-lg">
        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-[var(--muted)]">
          <span className="text-[10px] font-semibold text-[var(--muted-fg)]">9:41</span>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-1.5 rounded-sm border border-[var(--muted-fg)]">
              <div className="w-2/3 h-full bg-[var(--muted-fg)] rounded-sm" />
            </div>
          </div>
        </div>
        {/* Email app header */}
        <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--background)]">
          <p className="text-[10px] font-bold text-[var(--muted-fg)] uppercase tracking-wide">Inbox</p>
        </div>
        {/* Email row */}
        <div className="px-3 py-3 border-b border-[var(--border)] bg-[var(--background)] flex gap-2">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="text-[10px] font-semibold text-[var(--foreground)] truncate">Sender Name</span>
              <span className="text-[9px] text-[var(--muted-fg)] shrink-0 ml-1">Now</span>
            </div>
            <p className="text-[10px] font-medium text-[var(--foreground)] leading-tight break-words line-clamp-2">
              {display}
            </p>
            <p className="text-[9px] text-[var(--muted-fg)] mt-0.5 truncate">Preview text goes here...</p>
          </div>
        </div>
        {/* Dimmed rows below */}
        {[1, 2].map((i) => (
          <div key={i} className="px-3 py-3 border-b border-[var(--border)] flex gap-2 opacity-30">
            <div className="w-8 h-8 rounded-full bg-[var(--muted)] shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-2 bg-[var(--muted)] rounded w-3/4" />
              <div className="h-2 bg-[var(--muted)] rounded w-full" />
              <div className="h-1.5 bg-[var(--muted)] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--muted-fg)] mt-2">Mobile inbox preview</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function EmailSubjectLineTester() {
  const [subject, setSubject] = useState("🚀 Free offer — Act NOW! Limited time deal!!!!");

  const analysis = useMemo(() => analyzeSubject(subject), [subject]);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Email Subject Line
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter your email subject line..."
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base text-[var(--foreground)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={200}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--muted-fg)]">
            Type or paste your subject line above
          </p>
          <span className={`text-xs font-mono ${analysis.charCount > 80 ? "text-red-500" : analysis.charCount > 60 ? "text-yellow-500" : "text-[var(--muted-fg)]"}`}>
            {analysis.charCount} / 80
          </span>
        </div>
      </div>

      {/* Score + Stats row */}
      <div className="flex flex-wrap items-start gap-4">
        {/* Score */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[var(--muted-fg)]">Overall Score</span>
          <ScoreBadge score={analysis.score} color={analysis.scoreColor} />
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-2">
          <StatPill label="Characters" value={analysis.charCount} highlight={analysis.charCount > 60} />
          <StatPill label="Words" value={analysis.wordCount} />
          <StatPill label="Emojis" value={analysis.emojiCount} highlight={analysis.emojiCount > 3} />
          <StatPill
            label="CAPS %"
            value={`${Math.round(analysis.allCapsRatio * 100)}%`}
            highlight={analysis.allCapsRatio > 0.5}
          />
          <StatPill
            label="Spam Words"
            value={analysis.spamWords.length}
            highlight={analysis.spamWords.length > 0}
          />
        </div>
      </div>

      {/* Issues + Tips */}
      {(analysis.issues.length > 0 || analysis.tips.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {analysis.issues.length > 0 && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 space-y-2">
              <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Issues Found</h3>
              <ul className="space-y-1">
                {analysis.issues.map((issue, i) => (
                  <li key={i} className="text-xs text-red-600 dark:text-red-300 flex gap-2">
                    <span className="shrink-0">✗</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.tips.length > 0 && (
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 space-y-2">
              <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">What's Working</h3>
              <ul className="space-y-1">
                {analysis.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-green-600 dark:text-green-300 flex gap-2">
                    <span className="shrink-0">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Truncation Previews */}
      {analysis.charCount > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-[var(--foreground)]">Truncation Preview</h3>
          <div className="rounded-lg border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
            {TRUNCATION_POINTS.map((pt) => {
              const isTruncated = analysis.charCount > pt;
              return (
                <div key={pt} className="flex items-start gap-4 px-4 py-3 bg-[var(--background)]">
                  <div className="flex flex-col items-center shrink-0 w-14">
                    <span className="text-xs font-mono font-semibold text-[var(--foreground)]">{pt} ch</span>
                    <span className={`text-[10px] mt-0.5 ${isTruncated ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}`}>
                      {isTruncated ? "cut off" : "fits"}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--foreground)] font-mono break-all leading-relaxed">
                    {analysis.truncations[pt]}
                  </p>
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Email Subject Line Tester tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Analyze email subject lines for length, emojis, and spam triggers. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Email Subject Line Tester tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Analyze email subject lines for length, emojis, and spam triggers. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
              );
            })}
          </div>
          <p className="text-xs text-[var(--muted-fg)]">
            40 chars: smartwatch · 60 chars: most mobile clients · 80 chars: desktop clients
          </p>
        </div>
      )}

      {/* Mobile Preview + Emojis */}
      <div className="flex flex-wrap gap-8 items-start">
        <MobilePreview subject={subject} />

        {analysis.emojiCount > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--foreground)]">Emojis Detected</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.emojis.map((emoji, i) => (
                <span
                  key={i}
                  className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--muted)]"
                  title={`Emoji ${i + 1}`}
                >
                  {emoji}
                </span>
              ))}
            </div>
            {analysis.emojiCount > 3 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Consider using 1-2 emojis max for best deliverability
              </p>
            )}
          </div>
        )}

        {analysis.spamWords.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--foreground)]">Spam Triggers</h3>
            <div className="flex flex-wrap gap-1.5">
              {analysis.spamWords.map((word, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-xs font-mono bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ad placeholder */}
      <div className="mt-4 flex items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)] h-20 text-xs text-[var(--muted-fg)]">
        Advertisement
      </div>
    </div>
  );
}
