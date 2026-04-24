"use client";

import { useState } from "react";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function clean(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isPalindrome(text: string): boolean {
  const s = clean(text);
  return s.length > 0 && s === s.split("").reverse().join("");
}

function charFrequency(text: string): Record<string, number> {
  const s = clean(text);
  const freq: Record<string, number> = {};
  for (const ch of s) {
    freq[ch] = (freq[ch] ?? 0) + 1;
  }
  return freq;
}

function isAnagram(a: string, b: string): boolean {
  const fa = charFrequency(a);
  const fb = charFrequency(b);
  const keys = new Set([...Object.keys(fa), ...Object.keys(fb)]);
  for (const k of keys) {
    if ((fa[k] ?? 0) !== (fb[k] ?? 0)) return false;
  }
  return Object.keys(fa).length > 0 && Object.keys(fb).length > 0;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ResultBadge({ yes }: { yes: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold tracking-wide ${
        yes
          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      }`}
    >
      {yes ? "YES" : "NO"}
    </span>
  );
}

// ─── Palindrome section ────────────────────────────────────────────────────────

function PalindromeSection() {
  const [input, setInput] = useState("");

  const cleaned = clean(input);
  const reversed = cleaned.split("").reverse().join("");
  const checked = cleaned.length > 0;
  const result = checked && cleaned === reversed;

  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-[var(--foreground)]">
        Palindrome Checker
      </h2>
      <p className="text-sm text-[var(--muted-fg)]">
        Strips spaces, punctuation, and ignores case before checking.
      </p>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          Word or phrase
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. A man a plan a canal Panama"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {checked && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--muted-fg)] w-20 shrink-0">Result</span>
            <ResultBadge yes={result} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-sm text-[var(--muted-fg)] w-20 shrink-0">Cleaned</span>
            <code className="text-sm font-mono text-[var(--foreground)] break-all">{cleaned}</code>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-sm text-[var(--muted-fg)] w-20 shrink-0">Reversed</span>
            <code className="text-sm font-mono text-[var(--foreground)] break-all">{reversed}</code>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Anagram section ───────────────────────────────────────────────────────────

function AnagramSection() {
  const [wordA, setWordA] = useState("");
  const [wordB, setWordB] = useState("");

  const freqA = charFrequency(wordA);
  const freqB = charFrequency(wordB);
  const checked = Object.keys(freqA).length > 0 && Object.keys(freqB).length > 0;
  const result = checked && isAnagram(wordA, wordB);

  const allChars = Array.from(
    new Set([...Object.keys(freqA), ...Object.keys(freqB)])
  ).sort();

  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-[var(--foreground)]">
        Anagram Checker
      </h2>
      <p className="text-sm text-[var(--muted-fg)]">
        Compares character frequencies after removing spaces and punctuation.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Word / phrase A
          </label>
          <input
            type="text"
            value={wordA}
            onChange={(e) => setWordA(e.target.value)}
            placeholder="e.g. listen"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Word / phrase B
          </label>
          <input
            type="text"
            value={wordB}
            onChange={(e) => setWordB(e.target.value)}
            placeholder="e.g. silent"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {checked && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--muted-fg)]">Result</span>
            <ResultBadge yes={result} />
          </div>

          {/* Frequency table */}
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--muted-fg)] w-16">
                    Char
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-[var(--muted-fg)]">
                    A
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-[var(--muted-fg)]">
                    B
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-[var(--muted-fg)] w-16">
                    Match
                  </th>
                </tr>
              </thead>
              <tbody>
                {allChars.map((ch) => {
                  const a = freqA[ch] ?? 0;
                  const b = freqB[ch] ?? 0;
                  const match = a === b;
                  return (
                    <tr
                      key={ch}
                      className={`border-b border-[var(--border)] last:border-0 ${
                        match ? "" : "bg-red-50 dark:bg-red-950/30"
                      }`}
                    >
                      <td className="px-3 py-1.5 font-mono font-semibold text-[var(--foreground)]">
                        {ch}
                      </td>
                      <td className="px-3 py-1.5 text-center text-[var(--foreground)]">
                        {a || <span className="text-[var(--muted-fg)]">—</span>}
                      </td>
                      <td className="px-3 py-1.5 text-center text-[var(--foreground)]">
                        {b || <span className="text-[var(--muted-fg)]">—</span>}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        {match ? (
                          <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                        ) : (
                          <span className="text-red-500 font-bold">✗</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function PalindromeChecker() {
  return (
    <div className="space-y-8">
      <PalindromeSection />

      <hr className="border-[var(--border)]" />

      <AnagramSection />

      {/* Ad placeholder */}
      <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)] h-24 flex items-center justify-center">
        <span className="text-xs text-[var(--muted-fg)]">Advertisement</span>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Palindrome & Anagram Checker tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Check if a word or phrase is a palindrome, and find anagrams. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Palindrome & Anagram Checker tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Check if a word or phrase is a palindrome, and find anagrams. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
