"use client";

import { useState, useCallback } from "react";

const KEYWORDS = [
  "SELECT",
  "DISTINCT",
  "FROM",
  "WHERE",
  "JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "INNER JOIN",
  "OUTER JOIN",
  "FULL JOIN",
  "CROSS JOIN",
  "ON",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "INSERT INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE FROM",
  "DELETE",
  "CREATE TABLE",
  "CREATE",
  "ALTER TABLE",
  "ALTER",
  "DROP TABLE",
  "DROP",
  "UNION",
  "UNION ALL",
  "AS",
  "AND",
  "OR",
  "NOT",
  "IN",
  "IS NULL",
  "IS NOT NULL",
  "BETWEEN",
  "LIKE",
  "EXISTS",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
];

const CLAUSE_COMMENTS: Record<string, string> = {
  SELECT: "-- selects columns to return",
  DISTINCT: "-- removes duplicate rows",
  FROM: "-- specifies the source table",
  WHERE: "-- filters rows by condition",
  "LEFT JOIN": "-- includes all rows from left table",
  "RIGHT JOIN": "-- includes all rows from right table",
  "INNER JOIN": "-- returns only matching rows",
  "OUTER JOIN": "-- includes unmatched rows from both tables",
  "FULL JOIN": "-- includes all rows from both tables",
  "CROSS JOIN": "-- returns cartesian product",
  JOIN: "-- joins another table",
  ON: "-- specifies join condition",
  "GROUP BY": "-- groups rows for aggregation",
  "ORDER BY": "-- sorts the result set",
  HAVING: "-- filters groups after aggregation",
  LIMIT: "-- caps the number of returned rows",
  OFFSET: "-- skips rows before returning results",
  "INSERT INTO": "-- inserts new rows into the table",
  VALUES: "-- provides values for the insert",
  UPDATE: "-- modifies existing rows",
  SET: "-- specifies columns to update",
  "DELETE FROM": "-- deletes rows from the table",
  DELETE: "-- deletes rows",
  "CREATE TABLE": "-- creates a new table",
  CREATE: "-- creates a database object",
  "ALTER TABLE": "-- modifies table structure",
  ALTER: "-- alters a database object",
  "DROP TABLE": "-- permanently removes the table",
  DROP: "-- removes a database object",
  UNION: "-- combines results of two queries (no duplicates)",
  "UNION ALL": "-- combines results including duplicates",
  CASE: "-- conditional expression",
  WHEN: "-- condition branch",
  THEN: "-- value when condition is true",
  ELSE: "-- default value",
  END: "-- ends the CASE expression",
};

// Clause keywords that trigger a new line + indent level
const NEWLINE_KEYWORDS = new Set([
  "SELECT",
  "DISTINCT",
  "FROM",
  "WHERE",
  "LEFT JOIN",
  "RIGHT JOIN",
  "INNER JOIN",
  "OUTER JOIN",
  "FULL JOIN",
  "CROSS JOIN",
  "JOIN",
  "ON",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "INSERT INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE FROM",
  "DELETE",
  "CREATE TABLE",
  "CREATE",
  "ALTER TABLE",
  "ALTER",
  "DROP TABLE",
  "DROP",
  "UNION",
  "UNION ALL",
]);

function uppercaseKeywords(sql: string): string {
  // Sort longest first to avoid partial replacements
  const sorted = [...KEYWORDS].sort((a, b) => b.length - a.length);
  let result = sql;
  for (const kw of sorted) {
    const regex = new RegExp(`\\b${kw.replace(/ /g, "\\s+")}\\b`, "gi");
    result = result.replace(regex, kw);
  }
  return result;
}

function formatSQL(raw: string, explainMode: boolean): string {
  if (!raw.trim()) return "";

  // Normalize whitespace, uppercase keywords
  let sql = uppercaseKeywords(raw.trim());

  // Replace newlines/tabs with spaces, collapse multiple spaces
  sql = sql.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ");

  // Sort longest NEWLINE_KEYWORDS first to avoid partial match
  const sortedNewline = [...NEWLINE_KEYWORDS].sort(
    (a, b) => b.length - a.length
  );

  // Build a regex that matches any newline-triggering keyword
  const kwPattern = sortedNewline
    .map((k) => k.replace(/ /g, "\\s+"))
    .join("|");
  const kwRegex = new RegExp(`\\b(${kwPattern})\\b`, "g");

  // Split into tokens: [keyword, content, keyword, content, ...]
  const parts: { keyword: string | null; content: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = kwRegex.exec(sql)) !== null) {
    const before = sql.slice(lastIndex, match.index).trim();
    if (parts.length === 0 && before) {
      parts.push({ keyword: null, content: before });
    } else if (parts.length > 0 && before) {
      parts[parts.length - 1].content = parts[parts.length - 1].content
        ? parts[parts.length - 1].content + " " + before
        : before;
    }
    parts.push({ keyword: match[1].replace(/\s+/g, " "), content: "" });
    lastIndex = match.index + match[0].length;
  }

  const trailing = sql.slice(lastIndex).trim();
  if (parts.length > 0 && trailing) {
    parts[parts.length - 1].content = parts[parts.length - 1].content
      ? parts[parts.length - 1].content + " " + trailing
      : trailing;
  } else if (parts.length === 0 && trailing) {
    parts.push({ keyword: null, content: trailing });
  }

  // Render lines
  const lines: string[] = [];
  for (const part of parts) {
    if (part.keyword === null) {
      if (part.content) lines.push(part.content);
      continue;
    }

    const isJoin =
      part.keyword.includes("JOIN") || part.keyword === "ON";
    const indent = isJoin ? "  " : "";

    let line = indent + part.keyword;
    if (part.content) {
      line += " " + part.content;
    }

    if (explainMode && CLAUSE_COMMENTS[part.keyword]) {
      line += "  " + CLAUSE_COMMENTS[part.keyword];
    }

    lines.push(line);
  }

  return lines.join("\n");
}

export default function SqlQueryFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [explainMode, setExplainMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasFormatted, setHasFormatted] = useState(false);

  const handleFormat = useCallback(() => {
    const result = formatSQL(input, explainMode);
    setOutput(result);
    setHasFormatted(true);
  }, [input, explainMode]);

  const handleToggleExplain = useCallback(() => {
    const next = !explainMode;
    setExplainMode(next);
    if (hasFormatted && input.trim()) {
      setOutput(formatSQL(input, next));
    }
  }, [explainMode, hasFormatted, input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setHasFormatted(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted">SQL Input</h3>
          {input && (
            <button
              onClick={handleClear}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Paste your SQL here...\n\nExample:\nselect id, name from users where active = 1 order by name limit 10`}
          className="w-full h-44 px-3 py-2.5 text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors resize-none placeholder:text-muted/60"
          spellCheck={false}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleFormat}
          disabled={!input.trim()}
          className="px-5 py-2.5 text-sm font-medium rounded-xl bg-accent text-white hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Format SQL
        </button>

        <button
          onClick={handleToggleExplain}
          className={`px-5 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
            explainMode
              ? "bg-accent text-white border-accent"
              : "bg-surface border-border text-foreground hover:border-accent"
          }`}
        >
          {explainMode ? "Explain On" : "Explain Off"}
        </button>

        <span className="text-xs text-muted">
          {explainMode
            ? "Inline comments explain each clause"
            : "Toggle to add clause explanations"}
        </span>
      </div>

      {/* Output */}
      {hasFormatted && (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-medium text-muted">Formatted Output</h3>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="p-4">
            {output ? (
              <pre className="text-sm font-mono text-foreground bg-background rounded-lg border border-border p-4 overflow-x-auto leading-relaxed whitespace-pre">
                {output}
              </pre>
            ) : (
              <p className="text-sm text-muted text-center py-6">
                No SQL to display — check your input.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this SQL Query Beautifier with Explainer tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Format SQL and add inline comments explaining each clause. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this SQL Query Beautifier with Explainer tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Format SQL and add inline comments explaining each clause. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "SQL Query Beautifier with Explainer",
  "description": "Format SQL and add inline comments explaining each clause",
  "url": "https://tools.loresync.dev/sql-query-formatter",
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
