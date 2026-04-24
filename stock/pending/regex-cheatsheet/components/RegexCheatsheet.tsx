"use client";

import { useState, useCallback } from "react";

const CATEGORIES = [
  {
    name: "Anchors",
    tokens: [
      { token: "^", desc: "Start of string / line" },
      { token: "$", desc: "End of string / line" },
      { token: "\\b", desc: "Word boundary" },
      { token: "\\B", desc: "Non-word boundary" },
    ],
  },
  {
    name: "Quantifiers",
    tokens: [
      { token: "*", desc: "0 or more" },
      { token: "+", desc: "1 or more" },
      { token: "?", desc: "0 or 1 (optional)" },
      { token: "{n}", desc: "Exactly n times" },
      { token: "{n,}", desc: "n or more times" },
      { token: "{n,m}", desc: "Between n and m times" },
      { token: "*?", desc: "0 or more (lazy)" },
      { token: "+?", desc: "1 or more (lazy)" },
    ],
  },
  {
    name: "Character Classes",
    tokens: [
      { token: "\\d", desc: "Digit [0-9]" },
      { token: "\\D", desc: "Non-digit" },
      { token: "\\w", desc: "Word char [a-zA-Z0-9_]" },
      { token: "\\W", desc: "Non-word char" },
      { token: "\\s", desc: "Whitespace" },
      { token: "\\S", desc: "Non-whitespace" },
      { token: "[abc]", desc: "Any of a, b, c" },
      { token: "[^abc]", desc: "Not a, b, or c" },
      { token: "[a-z]", desc: "Range a through z" },
      { token: ".", desc: "Any char except newline" },
    ],
  },
  {
    name: "Groups",
    tokens: [
      { token: "(abc)", desc: "Capturing group" },
      { token: "(?:abc)", desc: "Non-capturing group" },
      { token: "(?<name>)", desc: "Named capturing group" },
      { token: "a|b", desc: "Alternation (a or b)" },
    ],
  },
  {
    name: "Lookarounds",
    tokens: [
      { token: "(?=abc)", desc: "Positive lookahead" },
      { token: "(?!abc)", desc: "Negative lookahead" },
      { token: "(?<=abc)", desc: "Positive lookbehind" },
      { token: "(?<!abc)", desc: "Negative lookbehind" },
    ],
  },
  {
    name: "Flags",
    tokens: [
      { token: "g", desc: "Global — all matches" },
      { token: "i", desc: "Case insensitive" },
      { token: "m", desc: "Multiline (^ $ per line)" },
      { token: "s", desc: "Dotall (. matches \\n)" },
    ],
  },
];

const FLAG_LIST = ["g", "i", "m", "s"] as const;
type Flag = (typeof FLAG_LIST)[number];

interface MatchResult {
  match: string;
  index: number;
  groups: Record<string, string>;
}

function buildHighlighted(text: string, matches: RegExpExecArray[]): React.ReactNode[] {
  if (matches.length === 0) return [text];
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  matches.forEach((m, i) => {
    const start = m.index;
    const end = start + m[0].length;
    if (start > cursor) nodes.push(text.slice(cursor, start));
    nodes.push(
      <mark
        key={i}
        className="bg-yellow-300 text-yellow-900 rounded px-0.5"
      >
        {m[0]}
      </mark>
    );
    cursor = end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export default function RegexCheatsheet() {
  const [pattern, setPattern] = useState("\\b\\w+\\b");
  const [testStr, setTestStr] = useState(
    "Hello, world! Regex is powerful.\nTest 123 and more."
  );
  const [flags, setFlags] = useState<Set<Flag>>(new Set(["g"]));
  const [error, setError] = useState<string | null>(null);

  const toggleFlag = useCallback((f: Flag) => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      return next;
    });
  }, []);

  const insertToken = useCallback((token: string) => {
    setPattern((prev) => prev + token);
  }, []);

  // Compute matches
  let matches: RegExpExecArray[] = [];
  let matchResults: MatchResult[] = [];
  const flagStr = Array.from(flags).join("");

  if (pattern) {
    try {
      const re = new RegExp(pattern, flagStr.includes("g") ? flagStr : flagStr + "g");
      let m: RegExpExecArray | null;
      while ((m = re.exec(testStr)) !== null) {
        matches.push(m);
        const groups: Record<string, string> = {};
        if (m.groups) {
          Object.entries(m.groups).forEach(([k, v]) => {
            groups[k] = v ?? "";
          });
        }
        m.slice(1).forEach((g, idx) => {
          if (!(String(idx + 1) in groups)) groups[String(idx + 1)] = g ?? "";
        });
        matchResults.push({ match: m[0], index: m.index, groups });
        if (m[0].length === 0) re.lastIndex++;
      }
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      matches = [];
      matchResults = [];
    }
  }

  const hasGroups = matchResults.some((r) => Object.keys(r.groups).length > 0);
  const highlighted = error ? null : buildHighlighted(testStr, matches);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Left Sidebar — Token Reference */}
      <aside className="lg:w-72 xl:w-80 shrink-0">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Token Reference
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Click to insert into pattern</p>
          </div>
          <div className="divide-y divide-gray-100 max-h-[680px] overflow-y-auto">
            {CATEGORIES.map((cat) => (
              <div key={cat.name} className="px-3 py-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {cat.name}
                </p>
                <div className="space-y-1">
                  {cat.tokens.map((t) => (
                    <button
                      key={t.token}
                      onClick={() => insertToken(t.token)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-indigo-50 hover:text-indigo-700 text-left transition-colors group"
                    >
                      <code className="text-xs font-mono bg-gray-100 group-hover:bg-indigo-100 text-gray-800 group-hover:text-indigo-800 px-1.5 py-0.5 rounded min-w-[72px] text-center">
                        {t.token}
                      </code>
                      <span className="text-xs text-gray-600 group-hover:text-indigo-600 leading-tight">
                        {t.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Right Panel — Tester */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Pattern Input */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pattern
          </label>
          <div className="flex items-center gap-0">
            <span className="border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50 text-gray-500 font-mono text-sm select-none">
              /
            </span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className={`flex-1 border-y border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                error ? "border-red-400 bg-red-50" : ""
              }`}
              placeholder="Enter regex pattern…"
              spellCheck={false}
            />
            <span className="border border-l-0 border-gray-300 rounded-r-lg px-3 py-2 bg-gray-50 text-gray-500 font-mono text-sm select-none">
              /{flagStr}
            </span>
          </div>
          {error && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
          )}

          {/* Flags */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Flags:
            </span>
            {FLAG_LIST.map((f) => (
              <button
                key={f}
                onClick={() => toggleFlag(f)}
                className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border transition-colors ${
                  flags.has(f)
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Test String */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Test String
          </label>
          <textarea
            value={testStr}
            onChange={(e) => setTestStr(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
            placeholder="Enter test string…"
            spellCheck={false}
          />
        </div>

        {/* Live Highlighted Preview */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Match Preview</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                matchResults.length > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {matchResults.length} match{matchResults.length !== 1 ? "es" : ""}
            </span>
          </div>
          <div className="font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 whitespace-pre-wrap break-all min-h-[60px]">
            {error ? (
              <span className="text-red-500">Invalid pattern</span>
            ) : testStr ? (
              highlighted
            ) : (
              <span className="text-gray-400">Enter a test string above</span>
            )}
          </div>
        </div>

        {/* Match Groups Table */}
        {matchResults.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Matches
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1.5 px-2 text-gray-500 font-semibold">#</th>
                    <th className="text-left py-1.5 px-2 text-gray-500 font-semibold">Match</th>
                    <th className="text-left py-1.5 px-2 text-gray-500 font-semibold">Index</th>
                    {hasGroups && (
                      <th className="text-left py-1.5 px-2 text-gray-500 font-semibold">Groups</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {matchResults.slice(0, 50).map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-1.5 px-2 text-gray-400">{i + 1}</td>
                      <td className="py-1.5 px-2">
                        <span className="bg-yellow-100 text-yellow-900 px-1 rounded">
                          {r.match || <em className="text-gray-400">empty</em>}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-gray-500">{r.index}</td>
                      {hasGroups && (
                        <td className="py-1.5 px-2 text-gray-600">
                          {Object.entries(r.groups).length > 0
                            ? Object.entries(r.groups)
                                .map(([k, v]) => `${k}: "${v}"`)
                                .join(", ")
                            : <span className="text-gray-400">—</span>}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {matchResults.length > 50 && (
                <p className="text-xs text-gray-400 mt-2 px-2">
                  Showing first 50 of {matchResults.length} matches.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Regex Cheatsheet & Tester tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Interactive regex reference with live match highlighting. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Regex Cheatsheet & Tester tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Interactive regex reference with live match highlighting. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Regex Cheatsheet & Tester",
  "description": "Interactive regex reference with live match highlighting",
  "url": "https://tools.loresync.dev/regex-cheatsheet",
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
