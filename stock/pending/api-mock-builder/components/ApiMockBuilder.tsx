"use client";

import { useState, useCallback, useId } from "react";

// ── Word lists for realistic fake data ────────────────────────────────────────

const FIRST_NAMES = [
  "Alice", "Bob", "Carol", "David", "Eva", "Frank", "Grace", "Henry",
  "Iris", "James", "Karen", "Liam", "Mia", "Noah", "Olivia", "Peter",
  "Quinn", "Rachel", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xander",
  "Yara", "Zoe",
];
const LAST_NAMES = [
  "Smith", "Jones", "Williams", "Brown", "Davis", "Miller", "Wilson",
  "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris",
  "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark",
];
const DOMAINS = [
  "example.com", "mail.io", "test.dev", "fakemail.net", "demo.org",
  "sample.co", "placeholder.io",
];
const WORDS = [
  "alpha", "beta", "gamma", "delta", "echo", "foxtrot", "gulf", "hotel",
  "india", "juliet", "kilo", "lima", "mike", "november", "oscar", "papa",
  "quebec", "romeo", "sierra", "tango", "uniform", "victor", "whiskey",
  "xray", "yankee", "zulu", "red", "blue", "green", "dark", "light",
  "fast", "slow", "big", "small", "open", "closed", "active", "pending",
];
const TLDS = [".com", ".net", ".org", ".io", ".dev", ".app"];
const PROTOCOLS = ["https://", "http://"];

// ── Types ────────────────────────────────────────────────────────────────────

type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "uuid"
  | "email"
  | "name"
  | "url"
  | "array"
  | "object";

interface Field {
  id: string;
  name: string;
  type: FieldType;
  arrayCount: number;
  nestedFields: Field[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function makeDate(): string {
  const start = new Date(2015, 0, 1).getTime();
  const end = Date.now();
  return new Date(start + Math.random() * (end - start))
    .toISOString()
    .slice(0, 10);
}

function generateValue(field: Field): unknown {
  switch (field.type) {
    case "string":
      return pick(WORDS) + "_" + randInt(1, 999);
    case "number":
      return randInt(1, 10000);
    case "boolean":
      return Math.random() > 0.5;
    case "date":
      return makeDate();
    case "uuid":
      return makeUUID();
    case "email": {
      const first = pick(FIRST_NAMES).toLowerCase();
      const last = pick(LAST_NAMES).toLowerCase();
      return `${first}.${last}@${pick(DOMAINS)}`;
    }
    case "name":
      return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    case "url": {
      const proto = pick(PROTOCOLS);
      const word = pick(WORDS);
      const tld = pick(TLDS);
      return `${proto}${word}${tld}`;
    }
    case "array":
      return Array.from({ length: field.arrayCount }, () =>
        pick(WORDS)
      );
    case "object":
      return generateRecord(field.nestedFields);
    default:
      return null;
  }
}

function generateRecord(fields: Field[]): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const field of fields) {
    const key = field.name.trim() || "field";
    record[key] = generateValue(field);
  }
  return record;
}

function makeField(id: string): Field {
  return { id, name: "", type: "string", arrayCount: 3, nestedFields: [] };
}

// ── Component ─────────────────────────────────────────────────────────────────

const FIELD_TYPES: FieldType[] = [
  "string", "number", "boolean", "date", "uuid", "email", "name", "url",
  "array", "object",
];

interface FieldRowProps {
  field: Field;
  depth: number;
  onChange: (updated: Field) => void;
  onRemove: () => void;
}

function FieldRow({ field, depth, onChange, onRemove }: FieldRowProps) {
  const uid = useId();

  function update(patch: Partial<Field>) {
    onChange({ ...field, ...patch });
  }

  function addNested() {
    onChange({
      ...field,
      nestedFields: [
        ...field.nestedFields,
        makeField(`${Date.now()}-${Math.random()}`),
      ],
    });
  }

  function updateNested(index: number, updated: Field) {
    const next = [...field.nestedFields];
    next[index] = updated;
    onChange({ ...field, nestedFields: next });
  }

  function removeNested(index: number) {
    const next = field.nestedFields.filter((_, i) => i !== index);
    onChange({ ...field, nestedFields: next });
  }

  return (
    <div
      className="rounded-xl border border-border bg-surface"
      style={{ marginLeft: depth > 0 ? 16 : 0 }}
    >
      <div className="flex flex-wrap items-center gap-2 p-3">
        {/* Field name */}
        <input
          id={`${uid}-name`}
          type="text"
          value={field.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="field_name"
          className="flex-1 min-w-[120px] px-3 py-1.5 text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
          aria-label="Field name"
        />

        {/* Type dropdown */}
        <select
          value={field.type}
          onChange={(e) => update({ type: e.target.value as FieldType })}
          className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors cursor-pointer"
          aria-label="Field type"
        >
          {FIELD_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Array item count */}
        {field.type === "array" && (
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-muted whitespace-nowrap">
              items
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={field.arrayCount}
              onChange={(e) =>
                update({ arrayCount: Math.max(1, parseInt(e.target.value) || 1) })
              }
              className="w-16 px-2 py-1.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
              aria-label="Array item count"
            />
          </div>
        )}

        {/* Remove button */}
        <button
          onClick={onRemove}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted hover:text-foreground hover:border-foreground transition-colors text-sm"
          aria-label="Remove field"
          title="Remove field"
        >
          x
        </button>
      </div>

      {/* Nested fields for object type */}
      {field.type === "object" && (
        <div className="px-3 pb-3 space-y-2">
          {field.nestedFields.map((nf, i) => (
            <FieldRow
              key={nf.id}
              field={nf}
              depth={depth + 1}
              onChange={(updated) => updateNested(i, updated)}
              onRemove={() => removeNested(i)}
            />
          ))}
          <button
            onClick={addNested}
            className="w-full py-1.5 text-xs text-muted border border-dashed border-border rounded-lg hover:text-foreground hover:border-foreground transition-colors"
          >
            + Add nested field
          </button>
        </div>
      )}
    </div>
  );
}

export default function ApiMockBuilder() {
  const [fields, setFields] = useState<Field[]>([
    { id: "1", name: "id", type: "uuid", arrayCount: 3, nestedFields: [] },
    { id: "2", name: "name", type: "name", arrayCount: 3, nestedFields: [] },
    { id: "3", name: "email", type: "email", arrayCount: 3, nestedFields: [] },
    { id: "4", name: "createdAt", type: "date", arrayCount: 3, nestedFields: [] },
    { id: "5", name: "active", type: "boolean", arrayCount: 3, nestedFields: [] },
  ]);
  const [recordCount, setRecordCount] = useState(3);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function addField() {
    setFields((prev) => [
      ...prev,
      makeField(`${Date.now()}-${Math.random()}`),
    ]);
  }

  function updateField(index: number, updated: Field) {
    setFields((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  const generate = useCallback(() => {
    const count = Math.max(1, Math.min(100, recordCount));
    const records = Array.from({ length: count }, () =>
      generateRecord(fields)
    );
    setOutput(JSON.stringify(records, null, 2));
    setCopied(false);
  }, [fields, recordCount]);

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Schema builder */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted">Schema Fields</h3>

        <div className="space-y-2">
          {fields.map((field, i) => (
            <FieldRow
              key={field.id}
              field={field}
              depth={0}
              onChange={(updated) => updateField(i, updated)}
              onRemove={() => removeField(i)}
            />
          ))}
        </div>

        <button
          onClick={addField}
          className="w-full py-2 text-sm text-muted border border-dashed border-border rounded-xl hover:text-foreground hover:border-foreground transition-colors"
        >
          + Add field
        </button>
      </div>

      {/* Controls */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted">Record count (1–100)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={recordCount}
              onChange={(e) =>
                setRecordCount(
                  Math.max(1, Math.min(100, parseInt(e.target.value) || 1))
                )
              }
              className="w-24 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
              aria-label="Number of records to generate"
            />
          </div>

          <button
            onClick={generate}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent/80 transition-colors"
          >
            Generate
          </button>
        </div>
      </div>

      {/* Output */}
      {output && (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-medium text-muted">JSON Output</span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="p-4">
            <pre className="text-xs font-mono text-foreground bg-background rounded-lg border border-border p-4 overflow-x-auto max-h-96 leading-relaxed whitespace-pre">
              {output}
            </pre>
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
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this API Mock Response Builder tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Build fake API response JSON from a field schema. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this API Mock Response Builder tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Build fake API response JSON from a field schema. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "API Mock Response Builder",
  "description": "Build fake API response JSON from a field schema",
  "url": "https://tools.loresync.dev/api-mock-builder",
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
