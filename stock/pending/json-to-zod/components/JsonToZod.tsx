"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Options {
  schemaName: string;
  strict: boolean;
  optionalFields: boolean;
}

// ─── JSON to Zod conversion ───────────────────────────────────────────────────

function toCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, ch) => ch.toUpperCase())
    .replace(/^[A-Z]/, (ch) => ch.toLowerCase())
    || "schema";
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, ch) => ch.toUpperCase())
    .replace(/^[a-z]/, (ch) => ch.toUpperCase())
    || "Root";
}

function inferZodType(
  value: unknown,
  name: string,
  schemas: Map<string, string>,
  opts: Options
): string {
  if (value === null) return "z.null()";
  if (value === undefined) return "z.undefined()";
  if (typeof value === "boolean") return "z.boolean()";
  if (typeof value === "number") return "z.number()";
  if (typeof value === "string") return "z.string()";

  if (Array.isArray(value)) {
    if (value.length === 0) return "z.array(z.unknown())";
    const elementTypes = value.map((el) => inferZodType(el, name, schemas, opts));
    const unique = [...new Set(elementTypes)];
    if (unique.length === 1) {
      return `z.array(${unique[0]})`;
    }
    // mixed-type array → z.union
    const members = unique.map((t) => `  ${t}`).join(",\n");
    return `z.array(z.union([\n${members}\n]))`;
  }

  if (typeof value === "object") {
    const subName = toCamelCase(name) + "Schema";
    buildSchema(value as Record<string, unknown>, subName, schemas, opts);
    return subName;
  }

  return "z.unknown()";
}

function buildSchema(
  obj: Record<string, unknown>,
  name: string,
  schemas: Map<string, string>,
  opts: Options
): void {
  if (schemas.has(name)) return;
  // Reserve to prevent infinite recursion
  schemas.set(name, "");

  const lines: string[] = [];
  lines.push(`const ${name} = z.object({`);

  for (const [key, val] of Object.entries(obj)) {
    const propName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
      ? key
      : JSON.stringify(key);
    let zodType = inferZodType(val, toPascalCase(key), schemas, opts);

    // nullable: if val is null, wrap primitive inference with nullable
    // (already returns z.null() above — wrap the field as z.nullable for real usage)
    if (val === null) zodType = "z.nullable(z.unknown())";

    if (opts.optionalFields) {
      zodType = `${zodType}.optional()`;
    }

    lines.push(`  ${propName}: ${zodType},`);
  }

  const closing = opts.strict ? "}).strict();" : "});";
  lines.push(closing);

  schemas.set(name, lines.join("\n"));
}

function generateSchema(json: unknown, opts: Options): string {
  const schemas = new Map<string, string>();
  const rootName = (toCamelCase(opts.schemaName || "root")) + "Schema";

  if (
    json === null ||
    json === undefined ||
    typeof json !== "object" ||
    Array.isArray(json)
  ) {
    // Top-level primitive or array
    const zodType = inferZodType(json, toPascalCase(opts.schemaName || "root"), schemas, opts);
    const subSchemas: string[] = [];
    for (const [, body] of schemas) {
      if (body) subSchemas.push(body);
    }
    const all = [...subSchemas, `const ${rootName} = ${zodType};`];
    return all.join("\n\n");
  }

  buildSchema(json as Record<string, unknown>, rootName, schemas, opts);

  // Sub-schemas first, root last
  const order: string[] = [];
  for (const name of schemas.keys()) {
    if (name !== rootName) order.push(name);
  }
  order.push(rootName);

  return order
    .map((name) => schemas.get(name) ?? "")
    .filter(Boolean)
    .join("\n\n");
}

// ─── Syntax highlighting ──────────────────────────────────────────────────────

function highlight(code: string): string {
  if (!code) return "";

  return code
    // Escape HTML first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // z.* method calls — highlight the method name
    .replace(
      /\bz\.(object|array|string|number|boolean|null|undefined|unknown|union|nullable|optional)\b/g,
      '<span class="text-blue-600 dark:text-blue-400">z.$1</span>'
    )
    // .optional() .strict() .nullable() chained calls
    .replace(
      /\.(optional|strict|nullable|parse|safeParse)\(\)/g,
      '<span class="text-purple-500 dark:text-purple-400">.$1()</span>'
    )
    // const keyword
    .replace(
      /\b(const)\b/g,
      '<span class="text-purple-500 dark:text-purple-400">$1</span>'
    )
    // Schema variable names (camelCase ending in Schema)
    .replace(
      /\b([a-z][a-zA-Z0-9]*Schema)\b/g,
      '<span class="text-[var(--foreground)] font-medium">$1</span>'
    )
    // Property keys (lines with indent + identifier + colon)
    .replace(
      /^(\s{2})([a-zA-Z_$"[\]]+):/gm,
      '$1<span class="text-green-600 dark:text-green-400">$2</span>:'
    )
    // Punctuation
    .replace(
      /([{}(),[\]])/g,
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

const DEFAULT_OPTS: Options = {
  schemaName: "root",
  strict: false,
  optionalFields: false,
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function JsonToZod() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [opts, setOpts] = useState<Options>(DEFAULT_OPTS);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string>(() => {
    try {
      return generateSchema(JSON.parse(SAMPLE_JSON), DEFAULT_OPTS);
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
        setOutput(generateSchema(parsed, opts));
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
        setOutput(generateSchema(parsed, next));
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
          {/* Schema name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Schema Name
            </label>
            <input
              type="text"
              value={opts.schemaName}
              onChange={(e) =>
                handleOpts({ ...opts, schemaName: e.target.value })
              }
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
              placeholder="root"
              spellCheck={false}
            />
            <p className="text-xs text-[var(--muted-fg)]">
              Variable will be named{" "}
              <code className="bg-[var(--muted)] px-1 rounded">
                {toCamelCase(opts.schemaName || "root")}Schema
              </code>
            </p>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <Toggle
              label="Strict mode"
              checked={opts.strict}
              onChange={(v) => handleOpts({ ...opts, strict: v })}
              description="Reject unknown keys"
            />
            <Toggle
              label="Optional fields"
              checked={opts.optionalFields}
              onChange={(v) => handleOpts({ ...opts, optionalFields: v })}
              description="Append .optional() to all fields"
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
              Zod Schema
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
                Zod schema will appear here...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
