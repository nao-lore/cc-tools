"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "error" | "warning";

interface Issue {
  line: number;
  rule: RuleId;
  severity: Severity;
  message: string;
  suggestion: string;
}

type RuleId =
  | "no-multiple-h1"
  | "no-heading-skip"
  | "no-bare-url"
  | "no-trailing-whitespace"
  | "no-missing-blank-around-heading"
  | "no-long-line"
  | "no-multiple-blank-lines"
  | "no-missing-trailing-newline"
  | "no-inconsistent-list-markers";

interface RuleDef {
  id: RuleId;
  label: string;
  severity: Severity;
  description: string;
}

// ─── Rule definitions ─────────────────────────────────────────────────────────

const RULES: RuleDef[] = [
  {
    id: "no-multiple-h1",
    label: "No multiple H1",
    severity: "error",
    description: "Document should have exactly one H1 heading.",
  },
  {
    id: "no-heading-skip",
    label: "No heading level skip",
    severity: "error",
    description: "Heading levels must increment by one (e.g. H1 → H3 is invalid).",
  },
  {
    id: "no-bare-url",
    label: "No bare URLs",
    severity: "warning",
    description: "URLs should use [text](url) link syntax.",
  },
  {
    id: "no-trailing-whitespace",
    label: "No trailing whitespace",
    severity: "warning",
    description: "Lines should not end with spaces or tabs.",
  },
  {
    id: "no-missing-blank-around-heading",
    label: "Blank lines around headings",
    severity: "warning",
    description: "Headings should be surrounded by blank lines.",
  },
  {
    id: "no-long-line",
    label: "No long lines (>120 chars)",
    severity: "warning",
    description: "Lines should not exceed 120 characters.",
  },
  {
    id: "no-multiple-blank-lines",
    label: "No multiple blank lines",
    severity: "error",
    description: "No more than one consecutive blank line.",
  },
  {
    id: "no-missing-trailing-newline",
    label: "Trailing newline",
    severity: "error",
    description: "File should end with a newline character.",
  },
  {
    id: "no-inconsistent-list-markers",
    label: "Consistent list markers",
    severity: "warning",
    description: "Unordered list markers should be consistent (all - or all *).",
  },
];

// ─── Linting logic ────────────────────────────────────────────────────────────

const BARE_URL_RE = /(?<![(\["`])(https?:\/\/[^\s)>\]"`,]+)/g;
const HEADING_RE = /^(#{1,6})\s/;
const LIST_MARKER_RE = /^(\s*)([-*+])\s/;

function lint(markdown: string, enabled: Set<RuleId>): Issue[] {
  const issues: Issue[] = [];
  const lines = markdown.split("\n");
  const totalLines = lines.length;

  // Track heading levels for skip detection and multiple-h1
  let prevHeadingLevel = 0;
  let h1Count = 0;

  // Track list markers
  const listMarkers = new Set<string>();

  // Track consecutive blank lines
  let consecutiveBlanks = 0;

  for (let i = 0; i < totalLines; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const trimmed = line.trim();
    const isBlank = trimmed === "";

    // ── no-multiple-blank-lines ──────────────────────────────────────────────
    if (isBlank) {
      consecutiveBlanks++;
      if (consecutiveBlanks > 1 && enabled.has("no-multiple-blank-lines")) {
        issues.push({
          line: lineNum,
          rule: "no-multiple-blank-lines",
          severity: "error",
          message: "Multiple consecutive blank lines.",
          suggestion: "Remove extra blank lines; keep at most one.",
        });
      }
    } else {
      consecutiveBlanks = 0;
    }

    // ── Heading checks ───────────────────────────────────────────────────────
    const headingMatch = trimmed.match(HEADING_RE);
    if (headingMatch) {
      const level = headingMatch[1].length;

      if (level === 1) h1Count++;

      if (enabled.has("no-multiple-h1") && level === 1 && h1Count > 1) {
        issues.push({
          line: lineNum,
          rule: "no-multiple-h1",
          severity: "error",
          message: "More than one H1 heading in the document.",
          suggestion: "Ensure only one # heading exists; use ## or deeper for subsections.",
        });
      }

      if (enabled.has("no-heading-skip") && prevHeadingLevel > 0 && level > prevHeadingLevel + 1) {
        issues.push({
          line: lineNum,
          rule: "no-heading-skip",
          severity: "error",
          message: `Heading skips from H${prevHeadingLevel} to H${level}.`,
          suggestion: `Use H${prevHeadingLevel + 1} instead of H${level} here.`,
        });
      }

      prevHeadingLevel = level;

      // ── no-missing-blank-around-heading ───────────────────────────────────
      if (enabled.has("no-missing-blank-around-heading")) {
        const prevLine = i > 0 ? lines[i - 1].trim() : "";
        const nextLine = i < totalLines - 1 ? lines[i + 1].trim() : "";
        if (i > 0 && prevLine !== "") {
          issues.push({
            line: lineNum,
            rule: "no-missing-blank-around-heading",
            severity: "warning",
            message: "No blank line before heading.",
            suggestion: "Add a blank line before this heading.",
          });
        }
        if (i < totalLines - 1 && nextLine !== "") {
          issues.push({
            line: lineNum,
            rule: "no-missing-blank-around-heading",
            severity: "warning",
            message: "No blank line after heading.",
            suggestion: "Add a blank line after this heading.",
          });
        }
      }
    }

    // ── no-trailing-whitespace ───────────────────────────────────────────────
    if (enabled.has("no-trailing-whitespace") && /[ \t]+$/.test(line)) {
      issues.push({
        line: lineNum,
        rule: "no-trailing-whitespace",
        severity: "warning",
        message: "Line has trailing whitespace.",
        suggestion: "Remove spaces or tabs at the end of the line.",
      });
    }

    // ── no-long-line ─────────────────────────────────────────────────────────
    if (enabled.has("no-long-line") && line.length > 120) {
      issues.push({
        line: lineNum,
        rule: "no-long-line",
        severity: "warning",
        message: `Line is ${line.length} characters (limit: 120).`,
        suggestion: "Break the line into multiple shorter lines.",
      });
    }

    // ── no-bare-url ──────────────────────────────────────────────────────────
    if (enabled.has("no-bare-url") && !isBlank) {
      BARE_URL_RE.lastIndex = 0;
      let match;
      while ((match = BARE_URL_RE.exec(line)) !== null) {
        issues.push({
          line: lineNum,
          rule: "no-bare-url",
          severity: "warning",
          message: `Bare URL: ${match[0].slice(0, 60)}${match[0].length > 60 ? "…" : ""}`,
          suggestion: `Wrap as [link text](${match[0]}) for better accessibility.`,
        });
      }
    }

    // ── no-inconsistent-list-markers ─────────────────────────────────────────
    if (enabled.has("no-inconsistent-list-markers")) {
      const listMatch = trimmed.match(LIST_MARKER_RE);
      if (listMatch) {
        const marker = listMatch[2];
        listMarkers.add(marker);
        if (listMarkers.size > 1) {
          issues.push({
            line: lineNum,
            rule: "no-inconsistent-list-markers",
            severity: "warning",
            message: `Mixed list markers: found "${marker}" but other markers also used.`,
            suggestion: "Use a single list marker style throughout the document (- or *).",
          });
        }
      }
    }
  }

  // ── no-missing-trailing-newline ────────────────────────────────────────────
  if (
    enabled.has("no-missing-trailing-newline") &&
    markdown.length > 0 &&
    !markdown.endsWith("\n")
  ) {
    issues.push({
      line: totalLines,
      rule: "no-missing-trailing-newline",
      severity: "error",
      message: "File does not end with a newline.",
      suggestion: "Add a newline character at the end of the file.",
    });
  }

  // Sort by line number
  issues.sort((a, b) => a.line - b.line);

  return issues;
}

// ─── Sample Markdown ──────────────────────────────────────────────────────────

const SAMPLE = `# My Project

This is the introduction.
## Getting Started
Install dependencies:

\`\`\`
npm install
\`\`\`

### Installation


Check the docs at https://example.com for more info.

#### Configuration

Use \`config.json\`:

- Set the API key
* Set the base URL
- Run the server

This line is intentionally very long to trigger the line length warning because it exceeds one hundred and twenty characters in total length here.
Trailing spaces here:
`;

// ─── Component ────────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<Severity, { badge: string; row: string; icon: string }> = {
  error: {
    badge: "bg-red-100 text-red-700 border border-red-200",
    row: "border-l-4 border-red-400 bg-red-50",
    icon: "●",
  },
  warning: {
    badge: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    row: "border-l-4 border-yellow-400 bg-yellow-50",
    icon: "▲",
  },
};

export default function MarkdownLint() {
  const [input, setInput] = useState(SAMPLE);
  const [enabledRules, setEnabledRules] = useState<Set<RuleId>>(
    new Set(RULES.map((r) => r.id))
  );
  const [showRules, setShowRules] = useState(false);

  const issues = useCallback(() => lint(input, enabledRules), [input, enabledRules])();

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  const toggleRule = (id: RuleId) => {
    setEnabledRules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (on: boolean) => {
    setEnabledRules(on ? new Set(RULES.map((r) => r.id)) : new Set());
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-[var(--foreground)]">
            Markdown Input
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setInput(SAMPLE)}
              className="text-xs px-2 py-1 rounded bg-[var(--muted)] hover:bg-[var(--muted-hover)] text-[var(--muted-fg)] transition-colors"
            >
              Load sample
            </button>
            <button
              onClick={() => setInput("")}
              className="text-xs px-2 py-1 rounded bg-[var(--muted)] hover:bg-[var(--muted-hover)] text-[var(--muted-fg)] transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-64 font-mono text-sm p-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Paste your Markdown here…"
          spellCheck={false}
        />
      </div>

      {/* Rules toggle panel */}
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <button
          onClick={() => setShowRules((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[var(--muted)] hover:bg-[var(--muted-hover)] transition-colors text-sm font-medium text-[var(--foreground)]"
        >
          <span>Rules ({enabledRules.size}/{RULES.length} enabled)</span>
          <span className="text-[var(--muted-fg)]">{showRules ? "▲ Hide" : "▼ Show"}</span>
        </button>

        {showRules && (
          <div className="p-4 space-y-2 bg-[var(--background)]">
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => toggleAll(true)}
                className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
              >
                Enable all
              </button>
              <button
                onClick={() => toggleAll(false)}
                className="text-xs px-2 py-1 rounded bg-[var(--muted)] hover:bg-[var(--muted-hover)] text-[var(--muted-fg)] transition-colors"
              >
                Disable all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {RULES.map((rule) => (
                <label
                  key={rule.id}
                  className="flex items-start gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={enabledRules.has(rule.id)}
                    onChange={() => toggleRule(rule.id)}
                    className="mt-0.5 accent-blue-600"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-sm text-[var(--foreground)]">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          rule.severity === "error"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {rule.severity}
                      </span>
                      {rule.label}
                    </div>
                    <p className="text-xs text-[var(--muted-fg)] mt-0.5">{rule.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary bar */}
      {input.trim() && (
        <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-[var(--muted)] text-sm">
          <span className="font-medium text-[var(--foreground)]">
            {issues.length === 0 ? "No issues found" : `${issues.length} issue${issues.length !== 1 ? "s" : ""} found`}
          </span>
          {errorCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS.error.badge}`}>
              {errorCount} error{errorCount !== 1 ? "s" : ""}
            </span>
          )}
          {warningCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS.warning.badge}`}>
              {warningCount} warning{warningCount !== 1 ? "s" : ""}
            </span>
          )}
          {issues.length === 0 && (
            <span className="text-green-600 font-medium">All checks passed</span>
          )}
        </div>
      )}

      {/* Issues list */}
      {issues.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Issues</h2>
          <div className="space-y-1.5">
            {issues.map((issue, idx) => {
              const colors = SEVERITY_COLORS[issue.severity];
              return (
                <div
                  key={idx}
                  className={`${colors.row} rounded-r-lg px-4 py-3`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`shrink-0 mt-0.5 text-xs font-mono px-2 py-0.5 rounded ${colors.badge}`}
                    >
                      L{issue.line}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${colors.badge}`}
                        >
                          {issue.severity}
                        </span>
                        <code className="text-xs bg-white/60 px-1.5 py-0.5 rounded font-mono text-[var(--foreground)]">
                          {issue.rule}
                        </code>
                      </div>
                      <p className="text-sm text-[var(--foreground)] mt-1 font-medium">
                        {issue.message}
                      </p>
                      <p className="text-xs text-[var(--muted-fg)] mt-0.5">
                        Fix: {issue.suggestion}
                      </p>
                    </div>
                  </div>
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Markdown Linter tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Lint Markdown for common style and syntax issues. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Markdown Linter tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Lint Markdown for common style and syntax issues. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!input.trim() && (
        <div className="text-center py-16 text-[var(--muted-fg)] text-sm">
          Paste Markdown above to start linting.
        </div>
      )}
    </div>
  );
}
