"use client";

import { useState, useMemo, useCallback } from "react";

interface MatchResult {
  match: string;
  index: number;
  groups: string[];
}

const COMMON_PATTERNS: { label: string; pattern: string; flags: string }[] = [
  {
    label: "Email",
    pattern: "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}",
    flags: "g",
  },
  {
    label: "URL",
    pattern: "https?://[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+",
    flags: "g",
  },
  {
    label: "Phone",
    pattern: "\\+?\\d{1,4}[\\s\\-]?\\(?\\d{1,4}\\)?[\\s\\-]?\\d{1,4}[\\s\\-]?\\d{1,9}",
    flags: "g",
  },
  {
    label: "IPv4",
    pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
    flags: "g",
  },
  {
    label: "Date (YYYY-MM-DD)",
    pattern: "\\d{4}-\\d{2}-\\d{2}",
    flags: "g",
  },
];

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [replaceWith, setReplaceWith] = useState("");
  const [flags, setFlags] = useState<Record<string, boolean>>({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
  });

  const flagString = useMemo(() => {
    return Object.entries(flags)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join("");
  }, [flags]);

  const toggleFlag = useCallback((flag: string) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }, []);

  const { regex, error } = useMemo(() => {
    if (!pattern) return { regex: null, error: null };
    try {
      const r = new RegExp(pattern, flagString);
      return { regex: r, error: null };
    } catch (e) {
      return { regex: null, error: (e as Error).message };
    }
  }, [pattern, flagString]);

  const matches: MatchResult[] = useMemo(() => {
    if (!regex || !testString) return [];
    const results: MatchResult[] = [];
    if (flagString.includes("g")) {
      let m: RegExpExecArray | null;
      const r = new RegExp(regex.source, regex.flags);
      while ((m = r.exec(testString)) !== null) {
        results.push({
          match: m[0],
          index: m.index,
          groups: m.slice(1),
        });
        if (m[0].length === 0) r.lastIndex++;
      }
    } else {
      const m = regex.exec(testString);
      if (m) {
        results.push({
          match: m[0],
          index: m.index,
          groups: m.slice(1),
        });
      }
    }
    return results;
  }, [regex, testString, flagString]);

  const highlightedParts = useMemo(() => {
    if (!regex || !testString || matches.length === 0) return null;
    const parts: { text: string; isMatch: boolean }[] = [];
    let lastIndex = 0;

    const sortedMatches = [...matches].sort((a, b) => a.index - b.index);
    for (const m of sortedMatches) {
      if (m.index > lastIndex) {
        parts.push({ text: testString.slice(lastIndex, m.index), isMatch: false });
      }
      parts.push({ text: m.match, isMatch: true });
      lastIndex = m.index + m.match.length;
    }
    if (lastIndex < testString.length) {
      parts.push({ text: testString.slice(lastIndex), isMatch: false });
    }
    return parts;
  }, [regex, testString, matches]);

  const replaceResult = useMemo(() => {
    if (!regex || !testString || !replaceWith) return null;
    try {
      return testString.replace(regex, replaceWith);
    } catch {
      return null;
    }
  }, [regex, testString, replaceWith]);

  const applyPreset = useCallback(
    (preset: (typeof COMMON_PATTERNS)[number]) => {
      setPattern(preset.pattern);
      const newFlags: Record<string, boolean> = {
        g: false,
        i: false,
        m: false,
        s: false,
        u: false,
      };
      for (const f of preset.flags) {
        newFlags[f] = true;
      }
      setFlags(newFlags);
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* Pattern Input */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Pattern
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-mono text-lg">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            className="flex-1 font-mono text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            spellCheck={false}
          />
          <span className="text-gray-400 font-mono text-lg">
            /{flagString}
          </span>
        </div>

        {/* Flags */}
        <div className="flex items-center gap-4 mt-3">
          <span className="text-sm text-gray-500">Flags:</span>
          {Object.keys(flags).map((flag) => (
            <label
              key={flag}
              className="flex items-center gap-1 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={flags[flag]}
                onChange={() => toggleFlag(flag)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-mono text-gray-700">{flag}</span>
            </label>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}
      </div>

      {/* Common Patterns */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500">Quick patterns:</span>
        {COMMON_PATTERNS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full border border-gray-200 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Test String */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Test String
        </label>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter test string..."
          rows={6}
          className="w-full font-mono text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
          spellCheck={false}
        />
      </div>

      {/* Highlighted Output */}
      {highlightedParts && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Match Highlighting
          </label>
          <div className="font-mono text-sm whitespace-pre-wrap break-all bg-gray-50 rounded p-3 border border-gray-100">
            {highlightedParts.map((part, i) =>
              part.isMatch ? (
                <span
                  key={i}
                  className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5"
                >
                  {part.text}
                </span>
              ) : (
                <span key={i}>{part.text}</span>
              )
            )}
          </div>
        </div>
      )}

      {/* Match Results */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Match Results{" "}
          <span className="font-normal text-gray-500">
            ({matches.length} match{matches.length !== 1 ? "es" : ""})
          </span>
        </label>
        {matches.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            {pattern ? "No matches found." : "Enter a pattern to see results."}
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {matches.map((m, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 bg-gray-50 rounded p-2 border border-gray-100 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs font-mono w-6">
                    #{i + 1}
                  </span>
                  <span className="font-mono text-blue-700 font-medium">
                    &quot;{m.match}&quot;
                  </span>
                  <span className="text-gray-400 text-xs">
                    index: {m.index}
                  </span>
                </div>
                {m.groups.length > 0 && (
                  <div className="ml-9 flex flex-wrap gap-2">
                    {m.groups.map((g, gi) => (
                      <span
                        key={gi}
                        className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded px-2 py-0.5 font-mono"
                      >
                        Group {gi + 1}: &quot;{g ?? ""}&quot;
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Replace */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Replace
        </label>
        <input
          type="text"
          value={replaceWith}
          onChange={(e) => setReplaceWith(e.target.value)}
          placeholder="Replacement string (supports $1, $2, etc.)..."
          className="w-full font-mono text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
          spellCheck={false}
        />
        {replaceResult !== null && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Replace Result:
            </label>
            <div className="font-mono text-sm whitespace-pre-wrap break-all bg-gray-50 rounded p-3 border border-gray-100">
              {replaceResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
