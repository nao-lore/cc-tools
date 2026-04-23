"use client";

import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "error" | "warning" | "info";

interface Issue {
  id: string;
  severity: Severity;
  message: string;
  suggestion: string;
}

interface LintResult {
  score: number;
  issues: Issue[];
  parsed: {
    type: string | null;
    scope: string | null;
    breaking: boolean;
    subject: string | null;
    body: string | null;
    footer: string | null;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_TYPES = [
  "feat", "fix", "docs", "style", "refactor",
  "test", "chore", "ci", "build", "perf",
];

const HEADER_REGEX =
  /^([a-z]+)(\([^)]*\))?(!)?:\s(.+)$/;

const FOOTER_LINE_REGEX =
  /^(BREAKING CHANGE|[\w-]+):\s.+$|^(Fixes|Closes|Refs)\s#\d+$/i;

// ─── Linter ───────────────────────────────────────────────────────────────────

function lint(raw: string): LintResult {
  const issues: Issue[] = [];
  const lines = raw.split("\n");
  const header = lines[0] ?? "";

  // --- Parse header ---
  const match = HEADER_REGEX.exec(header);
  const type = match ? match[1] : null;
  const scopeRaw = match ? match[2] : null;
  const scope = scopeRaw ? scopeRaw.slice(1, -1) : null; // strip parens
  const exclamation = match ? match[3] : null;
  const subject = match ? match[4] : null;

  const parsed = {
    type,
    scope,
    breaking: exclamation === "!" || raw.includes("BREAKING CHANGE:"),
    subject,
    body: lines.length > 2 ? lines.slice(2).join("\n").trim() : null,
    footer: null as string | null,
  };

  // --- Rule: header must parse ---
  if (!match) {
    // Try to give a more specific error
    if (!header.includes(":")) {
      issues.push({
        id: "missing-colon",
        severity: "error",
        message: "Header is missing a colon separator.",
        suggestion: 'Format: type(scope): subject — e.g. "feat: add login page"',
      });
    } else if (!/^[a-z]/.test(header)) {
      issues.push({
        id: "header-lowercase",
        severity: "error",
        message: "Type must start with a lowercase letter.",
        suggestion: 'Use lowercase type like "feat", "fix", "docs".',
      });
    } else {
      issues.push({
        id: "invalid-header",
        severity: "error",
        message: "Header does not match Conventional Commits format.",
        suggestion:
          'Expected: type(scope): subject — e.g. "feat(auth): add OAuth2 login"',
      });
    }
  }

  // --- Rule: valid type ---
  if (type !== null && !VALID_TYPES.includes(type)) {
    issues.push({
      id: "invalid-type",
      severity: "error",
      message: `Unknown type "${type}".`,
      suggestion: `Use one of: ${VALID_TYPES.join(", ")}.`,
    });
  }

  // --- Rule: no space after colon ---
  if (match && header.includes(":") && !/ /.test(header.split(":").slice(1).join(":").charAt(0))) {
    issues.push({
      id: "missing-space-after-colon",
      severity: "error",
      message: 'No space after colon in header.',
      suggestion: 'Add a space after the colon: "feat: subject" not "feat:subject".',
    });
  }

  // --- Rule: subject length ---
  const fullHeaderLen = header.length;
  if (fullHeaderLen > 72) {
    issues.push({
      id: "header-too-long",
      severity: "error",
      message: `Header is ${fullHeaderLen} characters (max 72).`,
      suggestion: `Shorten to ${72 - (fullHeaderLen - (subject?.length ?? 0))} chars or fewer for the subject.`,
    });
  } else if (fullHeaderLen > 50) {
    issues.push({
      id: "header-long-warning",
      severity: "warning",
      message: `Header is ${fullHeaderLen} characters (recommended max 50).`,
      suggestion: "Consider a shorter subject for better readability in git log.",
    });
  }

  // --- Rule: subject must not be empty ---
  if (match && (!subject || subject.trim() === "")) {
    issues.push({
      id: "empty-subject",
      severity: "error",
      message: "Subject is empty.",
      suggestion: "Add a brief description after the colon.",
    });
  }

  // --- Rule: subject should not end with period ---
  if (subject?.endsWith(".")) {
    issues.push({
      id: "subject-trailing-period",
      severity: "warning",
      message: "Subject ends with a period.",
      suggestion: "Remove the trailing period — subjects are not sentences.",
    });
  }

  // --- Rule: subject should use imperative mood hint ---
  if (subject) {
    const firstWord = subject.split(" ")[0].toLowerCase();
    const pastTensePatterns = /^(added|fixed|updated|removed|changed|deleted|created|implemented|refactored)$/;
    if (pastTensePatterns.test(firstWord)) {
      issues.push({
        id: "imperative-mood",
        severity: "warning",
        message: `Subject starts with past tense "${firstWord}".`,
        suggestion: `Use imperative mood: "${firstWord.replace(/ed$/, "")} ..." or "${firstWord.replace(/ed$/, "e")} ..."`,
      });
    }
  }

  // --- Rule: scope should be lowercase ---
  if (scope && scope !== scope.toLowerCase()) {
    issues.push({
      id: "scope-case",
      severity: "warning",
      message: `Scope "${scope}" is not lowercase.`,
      suggestion: `Use lowercase scope: "${scope.toLowerCase()}".`,
    });
  }

  // --- Rule: blank line between header and body ---
  if (lines.length > 1) {
    if (lines[1]?.trim() !== "") {
      issues.push({
        id: "missing-blank-line",
        severity: "error",
        message: "No blank line between header and body.",
        suggestion: "Add an empty line after the header before writing the body.",
      });
    }
  }

  // --- Rule: body line length ---
  if (lines.length > 2) {
    const bodyLines = lines.slice(2);
    const longBodyLines = bodyLines
      .map((l, i) => ({ line: i + 3, len: l.length }))
      .filter(({ len }) => len > 100);
    if (longBodyLines.length > 0) {
      issues.push({
        id: "body-line-too-long",
        severity: "warning",
        message: `Body has ${longBodyLines.length} line(s) exceeding 100 characters.`,
        suggestion: "Wrap body lines at 72–100 characters for readability.",
      });
    }
  }

  // --- Rule: footer format ---
  // Footer is typically the last paragraph (after a blank line from body)
  const fullText = raw.trim();
  const paragraphs = fullText.split(/\n\n+/);
  if (paragraphs.length > 1) {
    const lastPara = paragraphs[paragraphs.length - 1];
    const footerLines = lastPara.split("\n").filter((l) => l.trim());
    const badFooterLines = footerLines.filter(
      (l) => !FOOTER_LINE_REGEX.test(l) && lastPara !== paragraphs[1]
    );
    if (footerLines.some((l) => FOOTER_LINE_REGEX.test(l))) {
      parsed.footer = lastPara;
    } else if (paragraphs.length > 2) {
      // Has something that looks like it should be a footer
      const hasFooterKeyword = lastPara.match(/^(BREAKING CHANGE|Fixes|Closes|Refs)/im);
      if (hasFooterKeyword && badFooterLines.length > 0) {
        issues.push({
          id: "invalid-footer",
          severity: "warning",
          message: "Footer format looks incorrect.",
          suggestion:
            'Footer lines must use "token: value" or "Fixes #123" format. BREAKING CHANGE requires a colon.',
        });
      }
    }
  }

  // --- Rule: breaking change consistency ---
  if (exclamation === "!" && !raw.includes("BREAKING CHANGE:")) {
    issues.push({
      id: "breaking-change-footer-missing",
      severity: "info",
      message: 'Using "!" for breaking change without a BREAKING CHANGE footer.',
      suggestion:
        'Add a footer "BREAKING CHANGE: description" to explain the breaking change.',
    });
  }

  // --- Score calculation ---
  // Start at 100, deduct per issue
  const deductions: Record<Severity, number> = { error: 25, warning: 8, info: 3 };
  const raw_deduction = issues.reduce((acc, i) => acc + deductions[i.severity], 0);
  // Bonus for having scope, body, footer
  let bonus = 0;
  if (scope) bonus += 5;
  if (parsed.body) bonus += 5;
  if (parsed.footer) bonus += 5;

  const score = Math.max(0, Math.min(100, 100 - raw_deduction + (issues.length === 0 ? bonus : 0)));

  return { score, issues, parsed };
}

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700"
      : score >= 50
      ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-700"
      : "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-700";

  const label = score >= 80 ? "Good" : score >= 50 ? "Needs Work" : "Poor";

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-mono ${color}`}>
      <span className="text-3xl font-bold tabular-nums">{score}</span>
      <div className="text-left">
        <div className="text-xs font-semibold uppercase tracking-wide">Score</div>
        <div className="text-xs">{label}</div>
      </div>
    </div>
  );
}

// ─── Issue row ────────────────────────────────────────────────────────────────

function IssueRow({ issue }: { issue: Issue }) {
  const styles: Record<Severity, { icon: string; row: string; badge: string }> = {
    error: {
      icon: "✕",
      row: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40",
      badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    },
    warning: {
      icon: "⚠",
      row: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/40",
      badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    },
    info: {
      icon: "i",
      row: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40",
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    },
  };

  const s = styles[issue.severity];

  return (
    <div className={`rounded-lg border p-3 ${s.row}`}>
      <div className="flex items-start gap-2">
        <span className={`shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${s.badge}`}>
          {s.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--foreground)]">{issue.message}</p>
          <p className="text-xs text-[var(--muted-fg)] mt-0.5">
            Fix: {issue.suggestion}
          </p>
        </div>
        <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded font-medium capitalize ${s.badge}`}>
          {issue.severity}
        </span>
      </div>
    </div>
  );
}

// ─── Parsed breakdown ─────────────────────────────────────────────────────────

function ParsedBreakdown({ parsed }: { parsed: LintResult["parsed"] }) {
  const fields: { label: string; value: string | null | boolean; mono?: boolean }[] = [
    { label: "Type", value: parsed.type, mono: true },
    { label: "Scope", value: parsed.scope ?? "—", mono: true },
    { label: "Subject", value: parsed.subject },
    { label: "Breaking", value: parsed.breaking ? "Yes" : "No" },
    { label: "Has Body", value: parsed.body ? "Yes" : "No" },
    { label: "Has Footer", value: parsed.footer ? "Yes" : "No" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {fields.map(({ label, value, mono }) => (
        <div
          key={label}
          className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2"
        >
          <div className="text-xs text-[var(--muted-fg)] mb-0.5">{label}</div>
          <div
            className={`text-sm font-medium text-[var(--foreground)] truncate ${
              mono ? "font-mono" : ""
            }`}
            title={typeof value === "string" ? value : undefined}
          >
            {value === null || value === "" ? (
              <span className="text-[var(--muted-fg)] italic font-normal text-xs">none</span>
            ) : (
              String(value)
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Sample messages ──────────────────────────────────────────────────────────

const SAMPLES: { label: string; value: string }[] = [
  {
    label: "Perfect",
    value:
      "feat(auth): add OAuth2 login with Google\n\nImplement OAuth2 authorization code flow using Google as provider.\nStores refresh token in httpOnly cookie.\n\nFixes #42",
  },
  {
    label: "Good",
    value: "fix(api): handle null response from payment gateway",
  },
  {
    label: "Bad type",
    value: "Feature: add dark mode support",
  },
  {
    label: "Too long",
    value:
      "feat: implement a completely new and totally revamped user onboarding experience with multi-step wizard",
  },
  {
    label: "No blank line",
    value: "docs: update README\nAdded installation instructions.",
  },
  {
    label: "Breaking",
    value:
      "feat!: remove deprecated /v1 API endpoints\n\nAll /v1 routes have been removed. Migrate to /v2.\n\nBREAKING CHANGE: /v1 endpoints are no longer available.",
  },
];

// ─── Main component ───────────────────────────────────────────────────────────

const PLACEHOLDER = `feat(auth): add OAuth2 login

Implement Google OAuth2 using authorization code flow.
Stores refresh token in httpOnly cookie.

Fixes #42`;

export default function GitCommitMessage() {
  const [message, setMessage] = useState("");

  const result = useMemo<LintResult | null>(() => {
    if (!message.trim()) return null;
    return lint(message);
  }, [message]);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Commit Message
          </label>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[var(--muted-fg)] mr-1">Samples:</span>
            {SAMPLES.map((s) => (
              <button
                key={s.label}
                onClick={() => setMessage(s.value)}
                className="text-xs px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--muted-fg)] hover:bg-[var(--muted)] transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
          placeholder={PLACEHOLDER}
          spellCheck={false}
        />
        <p className="text-xs text-[var(--muted-fg)]">
          Format:{" "}
          <code className="font-mono bg-[var(--muted)] px-1 rounded">
            type(scope): subject
          </code>{" "}
          — then optional blank line + body + footer.
        </p>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Score + status */}
          <div className="flex items-center gap-4 flex-wrap">
            <ScoreBadge score={result.score} />
            {result.issues.length === 0 ? (
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <span className="text-lg">✓</span>
                <span className="text-sm font-medium">All checks passed</span>
              </div>
            ) : (
              <div className="text-sm text-[var(--muted-fg)]">
                <span className="font-medium text-[var(--foreground)]">
                  {result.issues.filter((i) => i.severity === "error").length}
                </span>{" "}
                error(s),{" "}
                <span className="font-medium text-[var(--foreground)]">
                  {result.issues.filter((i) => i.severity === "warning").length}
                </span>{" "}
                warning(s),{" "}
                <span className="font-medium text-[var(--foreground)]">
                  {result.issues.filter((i) => i.severity === "info").length}
                </span>{" "}
                info
              </div>
            )}
          </div>

          {/* Parsed breakdown */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--foreground)]">Parsed Structure</h3>
            <ParsedBreakdown parsed={result.parsed} />
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-[var(--foreground)]">
                Issues & Suggestions
              </h3>
              <div className="space-y-2">
                {result.issues.map((issue) => (
                  <IssueRow key={issue.id} issue={issue} />
                ))}
              </div>
            </div>
          )}

          {/* All-pass checklist */}
          {result.issues.length === 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/40 p-4 space-y-1">
              {[
                "Valid Conventional Commits type",
                "Header within 72 characters",
                "Colon + space separator present",
                "Imperative subject line",
                "Blank line before body (if present)",
                "Footer format valid (if present)",
              ].map((check) => (
                <div key={check} className="flex items-center gap-2 text-sm text-green-800 dark:text-green-300">
                  <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                  {check}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && (
        <div className="rounded-lg border border-dashed border-[var(--border)] p-8 text-center">
          <div className="text-3xl mb-2">📝</div>
          <p className="text-sm text-[var(--muted-fg)]">
            Type or paste a commit message above to lint it.
          </p>
          <p className="text-xs text-[var(--muted-fg)] mt-1">
            Checks type, scope, subject length, body, and footer format.
          </p>
        </div>
      )}

      {/* Ad placeholder */}
      <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)] h-24 flex items-center justify-center">
        <span className="text-xs text-[var(--muted-fg)]">Advertisement</span>
      </div>
    </div>
  );
}
