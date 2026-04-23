"use client";

import { useState, useCallback, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type IndentSize = 2 | 4;

interface ValidationError {
  line: number;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// ─── YAML utilities ───────────────────────────────────────────────────────────

function getIndent(line: string): number {
  let count = 0;
  for (const ch of line) {
    if (ch === " ") count++;
    else if (ch === "\t") count += 2; // tabs are flagged separately
    else break;
  }
  return count;
}

function isComment(trimmed: string): boolean {
  return trimmed.startsWith("#");
}

function isEmptyOrComment(line: string): boolean {
  const t = line.trim();
  return t === "" || isComment(t);
}

/**
 * Simplified YAML validator — no external deps.
 * Catches the most common structural mistakes.
 */
function validateYaml(text: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!text.trim()) {
    return { valid: false, errors: [{ line: 1, message: "Input is empty" }], warnings };
  }

  const lines = text.split("\n");
  const keyTracker: Map<string, number> = new Map(); // for duplicate key detection at top level
  let indentStack: number[] = [0];
  let inMultilineScalar = false;
  let multilineIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const raw = lines[i];
    const trimmed = raw.trim();

    // Skip empty lines and comments
    if (isEmptyOrComment(raw)) continue;

    // Handle YAML document markers
    if (trimmed === "---" || trimmed === "...") {
      inMultilineScalar = false;
      indentStack = [0];
      keyTracker.clear();
      continue;
    }

    // Detect tabs (YAML forbids tab indentation)
    if (/^\t/.test(raw)) {
      errors.push({ line: lineNum, message: "Tab character used for indentation (YAML requires spaces)" });
      continue;
    }

    const indent = getIndent(raw);

    // If we're in a multiline scalar, skip until indent drops back
    if (inMultilineScalar) {
      if (indent > multilineIndent || trimmed === "") continue;
      inMultilineScalar = false;
    }

    // Detect multiline scalar block indicators (| and >)
    const isListItem = trimmed.startsWith("- ");
    const isListMarker = trimmed === "-";
    const colonIdx = trimmed.indexOf(": ");
    const endsWithColon = trimmed.endsWith(":");
    const hasBlockScalar = / [|>][-+]?\s*$/.test(raw) || / [|>]\s*$/.test(raw);

    if (hasBlockScalar) {
      inMultilineScalar = true;
      multilineIndent = indent;
    }

    // Check key: value syntax (not a list item, not a comment)
    if (!isListItem && !isListMarker && !isComment(trimmed)) {
      // Should be a key: value pair or a bare key (mapping)
      if (colonIdx === -1 && !endsWithColon && !hasBlockScalar) {
        // Could be a bare scalar value (valid in sequences) — only warn if at root
        if (indent === 0 && indentStack.length === 1) {
          warnings.push({ line: lineNum, message: `Bare scalar at root level — expected "key: value" format` });
        }
      }

      // Check for missing space after colon (key:value — invalid)
      const colonNoSpace = /^[^'"#\[{].*[^\s]:(?!\s|$)/.test(trimmed);
      if (colonNoSpace && !trimmed.startsWith("http") && !trimmed.startsWith("https")) {
        // Heuristic: flag "key:value" without space unless it looks like a URL
        const match = trimmed.match(/^(\S+):(\S)/);
        if (match && !match[1].includes("/")) {
          warnings.push({ line: lineNum, message: `Missing space after colon in "${match[1]}:${match[2]}..." (should be "${match[1]}: ${match[2]}...")` });
        }
      }

      // Duplicate key detection (top level only, simple heuristic)
      if (indent === 0 && (colonIdx !== -1 || endsWithColon)) {
        const key = endsWithColon ? trimmed.slice(0, -1).trim() : trimmed.slice(0, colonIdx).trim();
        const cleanKey = key.replace(/^['"]|['"]$/g, "");
        if (keyTracker.has(cleanKey)) {
          warnings.push({
            line: lineNum,
            message: `Duplicate key "${cleanKey}" (first seen on line ${keyTracker.get(cleanKey)})`,
          });
        } else {
          keyTracker.set(cleanKey, lineNum);
        }
      }
    }

    // Check indentation consistency: must be a multiple of 2 or aligned with stack
    // Only enforce for non-list-item lines
    if (!isListItem && !isListMarker && indent > 0) {
      const topOfStack = indentStack[indentStack.length - 1];
      if (indent > topOfStack) {
        indentStack.push(indent);
      } else {
        // Pop back
        while (indentStack.length > 1 && indentStack[indentStack.length - 1] > indent) {
          indentStack.pop();
        }
        if (indentStack[indentStack.length - 1] !== indent) {
          errors.push({ line: lineNum, message: `Inconsistent indentation (${indent} spaces doesn't align with any parent level)` });
        }
      }
    }

    // Check unbalanced quotes on a single line
    const singleQuotes = (trimmed.match(/'/g) || []).length;
    const doubleQuotes = (trimmed.match(/"/g) || []).length;
    // Only flag clearly odd counts when the line is a scalar value (has colon)
    if (colonIdx !== -1) {
      const valuePart = trimmed.slice(colonIdx + 2).trim();
      const sq = (valuePart.match(/'/g) || []).length;
      const dq = (valuePart.match(/"/g) || []).length;
      if (sq % 2 !== 0 && !valuePart.startsWith('"')) {
        errors.push({ line: lineNum, message: `Unmatched single quote in value` });
      }
      if (dq % 2 !== 0 && !valuePart.startsWith("'")) {
        errors.push({ line: lineNum, message: `Unmatched double quote in value` });
      }
    }

    // Suppress unused var warnings
    void singleQuotes;
    void doubleQuotes;
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Pretty-print YAML by normalizing indentation.
 * Strategy: re-indent each line proportionally based on detected base indent.
 */
function prettyPrintYaml(text: string, indentSize: IndentSize): string {
  const lines = text.split("\n");
  const result: string[] = [];

  // Detect the predominant indent unit used in the source
  let detectedUnit = 0;
  for (const line of lines) {
    if (isEmptyOrComment(line)) continue;
    const ind = getIndent(line);
    if (ind > 0 && (detectedUnit === 0 || ind < detectedUnit)) {
      detectedUnit = ind;
    }
  }
  if (detectedUnit === 0) detectedUnit = 2;

  for (const line of lines) {
    if (line.trim() === "") {
      result.push("");
      continue;
    }
    if (isComment(line.trim())) {
      // Preserve comment indentation proportionally
      const ind = getIndent(line);
      const level = Math.round(ind / detectedUnit);
      result.push(" ".repeat(level * indentSize) + line.trim());
      continue;
    }

    const ind = getIndent(line);
    const level = Math.round(ind / detectedUnit);
    const newIndent = " ".repeat(level * indentSize);
    result.push(newIndent + line.trim());
  }

  // Trim trailing empty lines
  while (result.length > 0 && result[result.length - 1] === "") {
    result.pop();
  }

  return result.join("\n");
}

/**
 * Very basic YAML-to-JSON converter.
 * Handles: flat key-value, nested mappings, simple sequences.
 * Not a full YAML parser — covers the common 80% case.
 */
function yamlToJson(text: string): string {
  try {
    const lines = text.split("\n");
    const root = parseBlock(lines, 0, lines.length, 0);
    return JSON.stringify(root, null, 2);
  } catch (e) {
    throw new Error(`Conversion failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

function parseBlock(
  lines: string[],
  start: number,
  end: number,
  baseIndent: number
): unknown {
  // Collect non-empty, non-comment lines in range
  const relevant = lines
    .slice(start, end)
    .map((line, i) => ({ line, idx: start + i }))
    .filter(({ line }) => !isEmptyOrComment(line));

  if (relevant.length === 0) return null;

  const firstTrimmed = relevant[0].line.trim();

  // Sequence (list)
  if (firstTrimmed.startsWith("- ") || firstTrimmed === "-") {
    return parseSequence(lines, start, end, baseIndent);
  }

  // Mapping
  return parseMapping(lines, start, end, baseIndent);
}

function parseMapping(
  lines: string[],
  start: number,
  end: number,
  baseIndent: number
): Record<string, unknown> {
  const obj: Record<string, unknown> = {};

  // Find all top-level keys (lines at baseIndent level that have key:)
  let i = start;
  while (i < end) {
    const raw = lines[i];
    if (isEmptyOrComment(raw) || raw.trim() === "---" || raw.trim() === "...") {
      i++;
      continue;
    }
    const indent = getIndent(raw);
    if (indent < baseIndent) break;
    if (indent > baseIndent) { i++; continue; }

    const trimmed = raw.trim();
    const colonIdx = trimmed.indexOf(": ");
    const endsColon = trimmed.endsWith(":");

    if (colonIdx === -1 && !endsColon) { i++; continue; }

    let key: string;
    let inlineValue: string | null = null;

    if (endsColon && colonIdx === -1) {
      key = trimmed.slice(0, -1).trim().replace(/^['"]|['"]$/g, "");
    } else {
      key = trimmed.slice(0, colonIdx).trim().replace(/^['"]|['"]$/g, "");
      inlineValue = trimmed.slice(colonIdx + 2).trim();
    }

    // Find child block range (lines with indent > baseIndent, until next sibling)
    let childEnd = i + 1;
    while (childEnd < end) {
      const childRaw = lines[childEnd];
      if (isEmptyOrComment(childRaw)) { childEnd++; continue; }
      const childIndent = getIndent(childRaw);
      if (childIndent <= baseIndent) break;
      childEnd++;
    }

    if (inlineValue !== null && inlineValue !== "" && !inlineValue.startsWith("|") && !inlineValue.startsWith(">")) {
      obj[key] = parseScalar(inlineValue);
    } else {
      // Parse child block
      const child = parseBlock(lines, i + 1, childEnd, baseIndent + 2);
      obj[key] = child ?? (inlineValue ?? null);
    }

    i = childEnd;
  }

  return obj;
}

function parseSequence(
  lines: string[],
  start: number,
  end: number,
  baseIndent: number
): unknown[] {
  const arr: unknown[] = [];
  let i = start;

  while (i < end) {
    const raw = lines[i];
    if (isEmptyOrComment(raw)) { i++; continue; }
    const indent = getIndent(raw);
    if (indent < baseIndent) break;
    if (indent > baseIndent) { i++; continue; }

    const trimmed = raw.trim();
    if (!trimmed.startsWith("- ") && trimmed !== "-") { i++; continue; }

    const afterDash = trimmed.slice(2).trim();

    // Find child range
    let childEnd = i + 1;
    while (childEnd < end) {
      const childRaw = lines[childEnd];
      if (isEmptyOrComment(childRaw)) { childEnd++; continue; }
      const childIndent = getIndent(childRaw);
      if (childIndent <= baseIndent) break;
      childEnd++;
    }

    if (afterDash === "" || trimmed === "-") {
      // Value is in child block
      const child = parseBlock(lines, i + 1, childEnd, baseIndent + 2);
      arr.push(child);
    } else if (afterDash.includes(": ") || afterDash.endsWith(":")) {
      // Inline mapping
      const fakeLines = [`${" ".repeat(baseIndent + 2)}${afterDash}`];
      const child = parseMapping(fakeLines, 0, 1, baseIndent + 2);
      // Also parse any sub-children
      const subChild = parseBlock(lines, i + 1, childEnd, baseIndent + 2);
      if (subChild && typeof subChild === "object" && !Array.isArray(subChild)) {
        arr.push({ ...child, ...(subChild as Record<string, unknown>) });
      } else {
        arr.push(child);
      }
    } else {
      arr.push(parseScalar(afterDash));
    }

    i = childEnd;
  }

  return arr;
}

function parseScalar(value: string): unknown {
  if (value === "null" || value === "~") return null;
  if (value === "true" || value === "yes") return true;
  if (value === "false" || value === "no") return false;
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
  // Strip quotes
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text, disabled }: { text: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text || disabled) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text, disabled]);

  return (
    <button
      onClick={handleCopy}
      disabled={!text || disabled}
      className="text-xs px-3 py-1.5 rounded bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--muted-fg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Sample YAML ──────────────────────────────────────────────────────────────

const SAMPLE_YAML = `# Application configuration
server:
  host: localhost
  port: 8080
  debug: true

database:
  host: db.example.com
  port: 5432
  name: myapp_db
  credentials:
    user: admin
    password: "s3cr3t"

features:
  - name: auth
    enabled: true
  - name: notifications
    enabled: false

tags:
  - production
  - stable
`;

// ─── Main component ───────────────────────────────────────────────────────────

export default function YamlValidator() {
  const [input, setInput] = useState(SAMPLE_YAML);
  const [indentSize, setIndentSize] = useState<IndentSize>(2);
  const [outputMode, setOutputMode] = useState<"pretty" | "json">("pretty");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const validation = useMemo<ValidationResult>(() => validateYaml(input), [input]);

  const prettyOutput = useMemo(() => {
    if (!input.trim()) return "";
    return prettyPrintYaml(input, indentSize);
  }, [input, indentSize]);

  const jsonOutput = useMemo(() => {
    if (!input.trim()) return "";
    try {
      setJsonError(null);
      return yamlToJson(input);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : String(e));
      return "";
    }
  }, [input]);

  const output = outputMode === "pretty" ? prettyOutput : jsonOutput;

  const handleClear = () => {
    setInput("");
    setJsonError(null);
  };

  const handleSample = () => {
    setInput(SAMPLE_YAML);
    setJsonError(null);
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            YAML Input
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleSample}
              className="text-xs px-3 py-1.5 rounded bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--muted-fg)] transition-colors"
            >
              Load Sample
            </button>
            <button
              onClick={handleClear}
              className="text-xs px-3 py-1.5 rounded bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--muted-fg)] transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={14}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
          placeholder={"key: value\nlist:\n  - item1\n  - item2"}
          spellCheck={false}
        />
      </div>

      {/* Validation status */}
      {input.trim() && (
        <div className="space-y-2">
          {/* Status badge */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                validation.valid
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  validation.valid ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {validation.valid ? "Valid YAML" : `${validation.errors.length} error${validation.errors.length !== 1 ? "s" : ""}`}
            </span>
            {validation.warnings.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                {validation.warnings.length} warning{validation.warnings.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Error list */}
          {validation.errors.length > 0 && (
            <ul className="space-y-1">
              {validation.errors.map((err, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2"
                >
                  <span className="shrink-0 font-mono text-xs font-semibold bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded px-1.5 py-0.5 mt-0.5">
                    L{err.line}
                  </span>
                  <span>{err.message}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Warning list */}
          {validation.warnings.length > 0 && (
            <ul className="space-y-1">
              {validation.warnings.map((warn, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-3 py-2"
                >
                  <span className="shrink-0 font-mono text-xs font-semibold bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded px-1.5 py-0.5 mt-0.5">
                    L{warn.line}
                  </span>
                  <span>{warn.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Options */}
      <div className="flex flex-wrap gap-6 items-end">
        {/* Output mode */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Output
          </label>
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
            {(["pretty", "json"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setOutputMode(mode)}
                className={`px-4 py-1.5 text-sm transition-colors ${
                  outputMode === mode
                    ? "bg-blue-600 text-white"
                    : "bg-[var(--background)] text-[var(--muted-fg)] hover:bg-[var(--muted)]"
                }`}
              >
                {mode === "pretty" ? "Pretty-print" : "Convert to JSON"}
              </button>
            ))}
          </div>
        </div>

        {/* Indent size (only for pretty mode) */}
        {outputMode === "pretty" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Indent Size
            </label>
            <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
              {([2, 4] as IndentSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setIndentSize(size)}
                  className={`px-4 py-1.5 text-sm transition-colors ${
                    indentSize === size
                      ? "bg-blue-600 text-white"
                      : "bg-[var(--background)] text-[var(--muted-fg)] hover:bg-[var(--muted)]"
                  }`}
                >
                  {size} spaces
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            {outputMode === "pretty" ? "Formatted YAML" : "JSON Output"}
          </label>
          <CopyButton text={output} disabled={!output || !!jsonError} />
        </div>

        {jsonError ? (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {jsonError}
          </div>
        ) : (
          <pre className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm font-mono text-[var(--foreground)] overflow-x-auto whitespace-pre leading-relaxed min-h-[120px]">
            {output || (
              <span className="text-[var(--muted-fg)] italic text-xs not-italic">
                Output will appear here...
              </span>
            )}
          </pre>
        )}
      </div>

      {/* Ad placeholder */}
      <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)] flex items-center justify-center h-20 text-xs text-[var(--muted-fg)]">
        Advertisement
      </div>
    </div>
  );
}
