"use client";

import { useState, useMemo } from "react";

const PLACEHOLDER_DIFF = `--- a/src/utils/format.ts
+++ b/src/utils/format.ts
@@ -1,7 +1,10 @@
 export function formatDate(date: Date): string {
-  return date.toISOString();
+  const pad = (n: number) => String(n).padStart(2, "0");
+  return \`\${date.getFullYear()}-\${pad(date.getMonth() + 1)}-\${pad(date.getDate())}\`;
 }

-export function slugify(text: string): string {
-  return text.toLowerCase().replace(/\\s+/g, "-");
+export function slugify(text: string, separator = "-"): string {
+  return text
+    .toLowerCase()
+    .trim()
+    .replace(/[^\\w\\s-]/g, "")
+    .replace(/[\\s_-]+/g, separator);
 }`;

function isValidDiff(diff: string): boolean {
  const hasHunk = /^@@\s+-\d+/m.test(diff);
  const hasMinus = /^---\s+/m.test(diff);
  const hasPlus = /^\+\+\+\s+/m.test(diff);
  return hasHunk && hasMinus && hasPlus;
}

function buildPatch(opts: {
  diff: string;
  author: string;
  email: string;
  date: string;
  subject: string;
}): string {
  const { diff, author, email, date, subject } = opts;

  const lines: string[] = [];

  // git format-patch header
  lines.push(`From 0000000000000000000000000000000000000000 Mon Sep 17 00:00:00 2001`);

  const authorLine =
    author || email
      ? `From: ${author || "Unknown"}${email ? ` <${email}>` : ""}`
      : `From: Unknown`;
  lines.push(authorLine);

  const dateLine = date
    ? `Date: ${new Date(date).toUTCString()}`
    : `Date: ${new Date().toUTCString()}`;
  lines.push(dateLine);

  const subjectLine = subject
    ? `Subject: [PATCH] ${subject}`
    : `Subject: [PATCH] Apply changes`;
  lines.push(subjectLine);

  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(diff.trimEnd());
  lines.push(``);
  lines.push(`--`);
  lines.push(`2.0.0`);
  lines.push(``);

  return lines.join("\n");
}

export default function DiffToPatch() {
  const [diff, setDiff] = useState("");
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [subject, setSubject] = useState("");
  const [copied, setCopied] = useState(false);

  const validationError = useMemo(() => {
    if (!diff.trim()) return null;
    if (!isValidDiff(diff)) {
      return "Invalid unified diff: missing ---/+++ headers or @@ hunk markers.";
    }
    return null;
  }, [diff]);

  const patch = useMemo(() => {
    if (!diff.trim() || validationError) return "";
    return buildPatch({ diff, author, email, date, subject });
  }, [diff, author, email, date, subject, validationError]);

  function handleCopy() {
    if (!patch) return;
    navigator.clipboard.writeText(patch).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    if (!patch) return;
    const filename = subject
      ? subject.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + ".patch"
      : "changes.patch";
    const blob = new Blob([patch], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Diff input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Unified Diff Input{" "}
          <span className="text-gray-400 font-normal">(required)</span>
        </label>
        <textarea
          value={diff}
          onChange={(e) => setDiff(e.target.value)}
          placeholder={PLACEHOLDER_DIFF}
          rows={12}
          className="w-full font-mono text-xs border border-gray-300 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
          spellCheck={false}
        />
        {validationError && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {validationError}
          </p>
        )}
      </div>

      {/* Optional fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Author Name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Jane Doe"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Author Email <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject / Commit Message{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Fix date formatting and improve slugify"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Output */}
      {patch && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              .patch Output
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download .patch
              </button>
            </div>
          </div>
          <pre className="w-full font-mono text-xs border border-gray-200 rounded-lg p-3 bg-gray-50 overflow-x-auto whitespace-pre">
            {patch}
          </pre>
        </div>
      )}

      {/* Empty state */}
      {!diff.trim() && (
        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400 text-sm">
          Paste a unified diff above to generate your .patch file
        </div>
      )}
    </div>
  );
}
