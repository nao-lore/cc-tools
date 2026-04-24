"use client";

import { useState, useMemo } from "react";

// Syllable counting heuristic
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length === 0) return 0;
  if (word.length <= 3) return 1;

  // Remove trailing e (silent e)
  word = word.replace(/e$/, "");

  // Count vowel groups
  const matches = word.match(/[aeiouy]+/g);
  let count = matches ? matches.length : 0;

  // Adjustments
  if (word.match(/le$/) && word.length > 2) count += 1;
  if (count === 0) count = 1;

  return count;
}

function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[.!?]+/g);
  return matches ? matches.length : 1;
}

function tokenizeWords(text: string): string[] {
  return text.match(/\b[a-zA-Z']+\b/g) ?? [];
}

// Complex words = 3+ syllables (for Gunning Fog)
function isComplexWord(word: string): boolean {
  // Exclude common suffixes that don't add complexity
  const w = word.toLowerCase();
  if (w.endsWith("ing") || w.endsWith("es") || w.endsWith("ed")) {
    const base = w.replace(/(ing|es|ed)$/, "");
    if (countSyllables(base) < 3) return false;
  }
  return countSyllables(word) >= 3;
}

interface ReadabilityStats {
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
}

function analyze(text: string): ReadabilityStats | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const words = tokenizeWords(trimmed);
  const wordCount = words.length;
  if (wordCount === 0) return null;

  const sentenceCount = Math.max(countSentences(trimmed), 1);
  const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const complexWordCount = words.filter(isComplexWord).length;

  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;

  // Flesch Reading Ease
  const fleschReadingEase =
    206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

  // Flesch-Kincaid Grade Level
  const fleschKincaidGrade =
    0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

  // Gunning Fog Index
  const gunningFog =
    0.4 * (avgWordsPerSentence + 100 * (complexWordCount / wordCount));

  return {
    wordCount,
    sentenceCount,
    syllableCount,
    avgWordsPerSentence,
    avgSyllablesPerWord,
    fleschReadingEase: Math.max(0, Math.min(100, fleschReadingEase)),
    fleschKincaidGrade: Math.max(0, fleschKincaidGrade),
    gunningFog: Math.max(0, gunningFog),
  };
}

function getFleschLabel(score: number): {
  label: string;
  description: string;
  color: string;
  bg: string;
  bar: string;
} {
  if (score >= 90)
    return {
      label: "Very Easy",
      description: "5th grade",
      color: "text-green-700",
      bg: "bg-green-100",
      bar: "bg-green-500",
    };
  if (score >= 80)
    return {
      label: "Easy",
      description: "6th grade",
      color: "text-green-600",
      bg: "bg-green-50",
      bar: "bg-green-400",
    };
  if (score >= 70)
    return {
      label: "Fairly Easy",
      description: "7th grade",
      color: "text-lime-700",
      bg: "bg-lime-50",
      bar: "bg-lime-500",
    };
  if (score >= 60)
    return {
      label: "Standard",
      description: "8th–9th grade",
      color: "text-yellow-700",
      bg: "bg-yellow-50",
      bar: "bg-yellow-500",
    };
  if (score >= 50)
    return {
      label: "Fairly Difficult",
      description: "10th–12th grade",
      color: "text-orange-700",
      bg: "bg-orange-50",
      bar: "bg-orange-500",
    };
  if (score >= 30)
    return {
      label: "Difficult",
      description: "College level",
      color: "text-red-600",
      bg: "bg-red-50",
      bar: "bg-red-500",
    };
  return {
    label: "Very Confusing",
    description: "College graduate",
    color: "text-red-800",
    bg: "bg-red-100",
    bar: "bg-red-700",
  };
}

function gradeLabel(grade: number): string {
  const g = Math.round(grade);
  if (g <= 0) return "Pre-K";
  if (g === 1) return "1st grade";
  if (g === 2) return "2nd grade";
  if (g === 3) return "3rd grade";
  if (g <= 12) return `${g}th grade`;
  if (g <= 14) return "College level";
  return "College graduate";
}

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. This simple sentence has been used for decades to test typewriters and keyboards. It contains every letter of the English alphabet at least once, making it an ideal pangram for font display and testing purposes. Writers and designers often rely on it as a placeholder when checking typography layouts.`;

export default function ReadabilityScore() {
  const [text, setText] = useState(SAMPLE_TEXT);

  const stats = useMemo(() => analyze(text), [text]);
  const flesch = stats ? getFleschLabel(stats.fleschReadingEase) : null;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paste or type your text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="Enter text to analyze…"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        />
        <p className="mt-1 text-xs text-gray-400">
          Analysis updates in real time as you type.
        </p>
      </div>

      {!stats && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Enter some text above to see readability scores.
        </div>
      )}

      {stats && flesch && (
        <>
          {/* Flesch Reading Ease — hero card */}
          <div className={`rounded-xl border p-6 ${flesch.bg}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Flesch Reading Ease
                </h2>
                <div className={`text-5xl font-bold ${flesch.color}`}>
                  {stats.fleschReadingEase.toFixed(1)}
                </div>
                <div className={`mt-1 text-sm font-medium ${flesch.color}`}>
                  {flesch.label} — {flesch.description}
                </div>
              </div>
              <div className="text-right text-xs text-gray-400">
                <div>0 = hardest</div>
                <div>100 = easiest</div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${flesch.bar}`}
                style={{
                  width: `${Math.max(2, stats.fleschReadingEase)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Very Confusing</span>
              <span>Very Easy</span>
            </div>
          </div>

          {/* Grade-level scores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Flesch-Kincaid Grade Level
              </h3>
              <div className="text-3xl font-bold text-gray-800">
                {stats.fleschKincaidGrade.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {gradeLabel(stats.fleschKincaidGrade)}
              </div>
              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                US school grade needed to understand this text.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                Gunning Fog Index
              </h3>
              <div className="text-3xl font-bold text-gray-800">
                {stats.gunningFog.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {gradeLabel(stats.gunningFog)}
              </div>
              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                Years of education needed to read on first pass.
              </p>
            </div>
          </div>

          {/* Text stats */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Text Statistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Stat label="Sentences" value={stats.sentenceCount.toString()} />
              <Stat label="Words" value={stats.wordCount.toString()} />
              <Stat label="Syllables" value={stats.syllableCount.toString()} />
              <Stat
                label="Avg Words / Sentence"
                value={stats.avgWordsPerSentence.toFixed(1)}
              />
              <Stat
                label="Avg Syllables / Word"
                value={stats.avgSyllablesPerWord.toFixed(2)}
              />
            </div>
          </div>

          {/* Scale reference */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Flesch Reading Ease Scale
            </h3>
            <div className="space-y-1 text-xs">
              {[
                { range: "90–100", label: "Very Easy", grade: "5th grade", color: "bg-green-500" },
                { range: "80–90", label: "Easy", grade: "6th grade", color: "bg-green-400" },
                { range: "70–80", label: "Fairly Easy", grade: "7th grade", color: "bg-lime-500" },
                { range: "60–70", label: "Standard", grade: "8th–9th grade", color: "bg-yellow-500" },
                { range: "50–60", label: "Fairly Difficult", grade: "10th–12th grade", color: "bg-orange-500" },
                { range: "30–50", label: "Difficult", grade: "College level", color: "bg-red-500" },
                { range: "0–30", label: "Very Confusing", grade: "College graduate", color: "bg-red-700" },
              ].map(({ range, label, grade, color }) => (
                <div key={range} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${color}`} />
                  <span className="w-16 text-gray-400">{range}</span>
                  <span className="font-medium text-gray-700 w-32">{label}</span>
                  <span className="text-gray-400">{grade}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Readability Score tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Calculate Flesch-Kincaid and other readability scores. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Readability Score tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Calculate Flesch-Kincaid and other readability scores. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
