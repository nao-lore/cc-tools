"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Options {
  rootName: string;
  exportKeyword: boolean;
  optionalFields: boolean;
  readonly: boolean;
}

// ─── JSON to TypeScript conversion ───────────────────────────────────────────

function inferType(value: unknown, name: string, interfaces: Map<string, string>): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "string") return "string";

  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const elementTypes = value.map((el) => inferType(el, name, interfaces));
    const unique = [...new Set(elementTypes)];
    const elementType = unique.length === 1 ? unique[0] : unique.join(" | ");
    return `(${elementType})[]`;
  }

  if (typeof value === "object") {
    const interfaceName = toPascalCase(name);
    buildInterface(value as Record<string, unknown>, interfaceName, interfaces);
    return interfaceName;
  }

  return "unknown";
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, ch) => ch.toUpperCase())
    .replace(/^[a-z]/, (ch) => ch.toUpperCase())
    || "Root";
}

function buildInterface(
  obj: Record<string, unknown>,
  name: string,
  interfaces: Map<string, string>
): void {
  // Avoid re-defining the same interface name
  if (interfaces.has(name)) return;

  // Reserve name to prevent infinite recursion
  interfaces.set(name, "");

  const lines: string[] = [];
  lines.push(`interface ${name} {`);

  for (const [key, val] of Object.entries(obj)) {
    const propName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
    const type = inferType(val, toPascalCase(key), interfaces);
    lines.push(`  ${propName}: ${type};`);
  }

  lines.push("}");
  interfaces.set(name, lines.join("\n"));
}

function generateInterfaces(
  json: unknown,
  opts: Options
): string {
  const interfaces = new Map<string, string>();
  const rootName = toPascalCase(opts.rootName || "Root");

  if (json === null || json === undefined || typeof json !== "object" || Array.isArray(json)) {
    // Top-level is not an object — wrap it in a type alias
    const type = inferType(json, rootName, interfaces);
    const exportKw = opts.exportKeyword ? "export " : "";
    const result: string[] = [];
    // Collect any sub-interfaces first
    for (const [, body] of interfaces) {
      if (!body) continue;
      result.push(applyOptions(body, opts));
    }
    result.push(`${exportKw}type ${rootName} = ${type};`);
    return result.join("\n\n");
  }

  buildInterface(json as Record<string, unknown>, rootName, interfaces);

  // Order: root last, sub-interfaces first
  const order: string[] = [];
  for (const name of interfaces.keys()) {
    if (name !== rootName) order.push(name);
  }
  order.push(rootName);

  return order
    .map((name) => {
      const body = interfaces.get(name) ?? "";
      return applyOptions(body, opts);
    })
    .filter(Boolean)
    .join("\n\n");
}

function applyOptions(body: string, opts: Options): string {
  if (!body) return "";
  let result = body;

  // Apply readonly to each property line
  if (opts.readonly) {
    result = result.replace(/^(\s{2})(\S)/gm, "$1readonly $2");
  }

  // Apply optional to each property line (after readonly if present)
  if (opts.optionalFields) {
    result = result.replace(
      /^(\s{2}(?:readonly )?)([\w"]+):/gm,
      "$1$2?:"
    );
  }

  // Apply export keyword
  if (opts.exportKeyword) {
    result = result.replace(/^interface /, "export interface ");
  }

  return result;
}

// ─── Syntax highlighting ──────────────────────────────────────────────────────

function highlight(code: string): string {
  if (!code) return "";

  return code
    // Escape HTML first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Keywords
    .replace(
      /\b(export|interface|type|readonly)\b/g,
      '<span class="text-purple-500 dark:text-purple-400">$1</span>'
    )
    // Type names (PascalCase identifiers not preceded by ".")
    .replace(
      /(?<![.\w])([A-Z][a-zA-Z0-9]*)/g,
      '<span class="text-blue-600 dark:text-blue-400">$1</span>'
    )
    // Primitive types
    .replace(
      /\b(string|number|boolean|null|undefined|unknown)\b/g,
      '<span class="text-green-600 dark:text-green-400">$1</span>'
    )
    // Property keys (lines with indent + identifier + optional ? + colon)
    .replace(
      /^(\s{2}(?:<[^>]+>)*)([a-zA-Z_$"[\]]+\??:)/gm,
      '$1<span class="text-[var(--foreground)]">$2</span>'
    )
    // Punctuation
    .replace(
      /([{}|[\]();])/g,
      '<span class="text-[var(--muted-fg)]">$1</span>'
    );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className="text-xs px-3 py-1.5 rounded bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--muted-fg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none group">
      <div className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`w-9 h-5 rounded-full transition-colors ${
            checked ? "bg-blue-600" : "bg-[var(--border)]"
          }`}
        />
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
      <div>
        <div className="text-sm font-medium text-[var(--foreground)]">{label}</div>
        {description && (
          <div className="text-xs text-[var(--muted-fg)]">{description}</div>
        )}
      </div>
    </label>
  );
}

// ─── Sample JSON ──────────────────────────────────────────────────────────────

const SAMPLE_JSON = `{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "age": 30,
  "isActive": true,
  "score": null,
  "tags": ["admin", "user"],
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zip": "10001"
  },
  "orders": [
    {
      "orderId": "ORD-001",
      "total": 49.99,
      "items": ["Book", "Pen"]
    }
  ]
}`;

// ─── Main component ───────────────────────────────────────────────────────────

export default function JsonToTypescript() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [opts, setOpts] = useState<Options>({
    rootName: "Root",
    exportKeyword: true,
    optionalFields: false,
    readonly: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string>(() => {
    try {
      return generateInterfaces(JSON.parse(SAMPLE_JSON), {
        rootName: "Root",
        exportKeyword: true,
        optionalFields: false,
        readonly: false,
      });
    } catch {
      return "";
    }
  });

  const handleInput = useCallback(
    (text: string) => {
      setInput(text);
      if (!text.trim()) {
        setOutput("");
        setError(null);
        return;
      }
      try {
        const parsed = JSON.parse(text);
        setOutput(generateInterfaces(parsed, opts));
        setError(null);
      } catch (e) {
        setError((e as Error).message);
        setOutput("");
      }
    },
    [opts]
  );

  const handleOpts = useCallback(
    (next: Options) => {
      setOpts(next);
      if (!input.trim()) return;
      try {
        const parsed = JSON.parse(input);
        setOutput(generateInterfaces(parsed, next));
        setError(null);
      } catch (e) {
        setError((e as Error).message);
        setOutput("");
      }
    },
    [input]
  );

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input]);

  return (
    <div className="space-y-6">
      {/* Options */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 space-y-4">
        <div className="flex flex-wrap gap-6 items-end">
          {/* Root interface name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Root Interface Name
            </label>
            <input
              type="text"
              value={opts.rootName}
              onChange={(e) =>
                handleOpts({ ...opts, rootName: e.target.value })
              }
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
              placeholder="Root"
              spellCheck={false}
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <Toggle
              label="export"
              checked={opts.exportKeyword}
              onChange={(v) => handleOpts({ ...opts, exportKeyword: v })}
              description="Add export keyword"
            />
            <Toggle
              label="Optional fields"
              checked={opts.optionalFields}
              onChange={(v) => handleOpts({ ...opts, optionalFields: v })}
              description="Mark all props with ?"
            />
            <Toggle
              label="Readonly"
              checked={opts.readonly}
              onChange={(v) => handleOpts({ ...opts, readonly: v })}
              description="Add readonly modifier"
            />
          </div>
        </div>
      </div>

      {/* Two-pane layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              JSON Input
            </label>
            <button
              onClick={handleFormat}
              disabled={!input.trim()}
              className="text-xs px-3 py-1.5 rounded bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--muted-fg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Format JSON
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            rows={24}
            className={`w-full rounded-lg border bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-fg)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono ${
              error
                ? "border-red-400 focus:ring-red-400"
                : "border-[var(--border)]"
            }`}
            placeholder={'{\n  "name": "Alice",\n  "age": 30\n}'}
            spellCheck={false}
          />
          {error && (
            <p className="text-xs text-red-500 font-mono bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              TypeScript Interfaces
            </label>
            <CopyButton text={output} />
          </div>
          <div
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm font-mono text-[var(--foreground)] overflow-auto min-h-[568px] leading-relaxed"
            style={{ tabSize: 2 }}
          >
            {output ? (
              <pre
                className="whitespace-pre"
                dangerouslySetInnerHTML={{ __html: highlight(output) }}
              />
            ) : (
              <span className="text-[var(--muted-fg)] italic text-xs not-italic">
                TypeScript interfaces will appear here...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
