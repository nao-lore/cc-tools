"use client";

import { useState, useCallback } from "react";

// ── Word lists ────────────────────────────────────────────────────────────────

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
const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing",
  "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore",
  "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam",
  "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi",
  "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure",
  "reprehenderit", "voluptate", "velit", "esse", "cillum", "fugiat",
  "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat",
  "proident", "sunt", "culpa", "officia", "deserunt", "mollit", "anim",
  "id", "est", "laborum",
];
const TLDS = [".com", ".net", ".org", ".io", ".dev", ".app"];
const PROTOCOLS = ["https://", "http://"];
const STREETS = [
  "Main St", "Oak Ave", "Maple Dr", "Cedar Blvd", "Elm Way",
  "Pine Rd", "Washington St", "Park Ave", "Lake Dr", "River Rd",
];
const CITIES = [
  "Springfield", "Shelbyville", "Capital City", "Ogdenville", "Riverdale",
  "Greenwood", "Fairview", "Lakewood", "Maplewood", "Hillcrest",
];
const STATES = ["CA", "TX", "NY", "FL", "WA", "OR", "IL", "CO", "AZ", "GA"];

// ── Preset templates ──────────────────────────────────────────────────────────

const PRESETS: Record<string, string> = {
  User: `{
  "id": "{{uuid}}",
  "firstName": "{{firstName}}",
  "lastName": "{{lastName}}",
  "email": "{{email}}",
  "phone": "{{phone}}",
  "address": "{{address}}",
  "createdAt": "{{date}}",
  "active": "{{bool}}"
}`,
  Product: `{
  "id": "{{uuid}}",
  "name": "{{name}}",
  "price": "{{float(1,999)}}",
  "stock": "{{int(0,500)}}",
  "description": "{{lorem(10)}}",
  "url": "{{url}}",
  "createdAt": "{{date}}"
}`,
  Order: `{
  "orderId": "{{uuid}}",
  "customer": "{{name}}",
  "email": "{{email}}",
  "amount": "{{float(5,2000)}}",
  "quantity": "{{int(1,20)}}",
  "status": "{{bool}}",
  "placedAt": "{{date}}"
}`,
};

// ── Generators ────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
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

function makePhone(): string {
  const area = randInt(200, 999);
  const prefix = randInt(200, 999);
  const line = randInt(1000, 9999);
  return `+1-${area}-${prefix}-${line}`;
}

function makeAddress(): string {
  const num = randInt(1, 9999);
  return `${num} ${pick(STREETS)}, ${pick(CITIES)}, ${pick(STATES)} ${randInt(10000, 99999)}`;
}

function makeLorem(words: number): string {
  const count = Math.max(1, Math.min(200, words));
  return Array.from({ length: count }, () => pick(LOREM_WORDS)).join(" ");
}

function makeUrl(): string {
  const word = pick(LOREM_WORDS);
  return `${pick(PROTOCOLS)}${word}${pick(TLDS)}`;
}

// ── Placeholder resolver ──────────────────────────────────────────────────────

const PLACEHOLDER_RE =
  /\{\{(name|firstName|lastName|email|uuid|bool|date|url|phone|address|int\([^)]+\)|float\([^)]+\)|lorem\([^)]+\))\}\}/g;

function resolvePlaceholder(token: string): unknown {
  if (token === "name") return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  if (token === "firstName") return pick(FIRST_NAMES);
  if (token === "lastName") return pick(LAST_NAMES);
  if (token === "email") {
    const first = pick(FIRST_NAMES).toLowerCase();
    const last = pick(LAST_NAMES).toLowerCase();
    return `${first}.${last}@${pick(DOMAINS)}`;
  }
  if (token === "uuid") return makeUUID();
  if (token === "bool") return Math.random() > 0.5;
  if (token === "date") return makeDate();
  if (token === "url") return makeUrl();
  if (token === "phone") return makePhone();
  if (token === "address") return makeAddress();

  const intMatch = token.match(/^int\((-?\d+),(-?\d+)\)$/);
  if (intMatch) return randInt(Number(intMatch[1]), Number(intMatch[2]));

  const floatMatch = token.match(/^float\((-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)\)$/);
  if (floatMatch) return randFloat(Number(floatMatch[1]), Number(floatMatch[2]));

  const loremMatch = token.match(/^lorem\((\d+)\)$/);
  if (loremMatch) return makeLorem(Number(loremMatch[1]));

  return `{{${token}}}`;
}

/**
 * Parse a template JSON string and replace all {{placeholder}} tokens
 * with generated values, producing a valid JS object.
 */
function generateFromTemplate(template: string): unknown {
  // First, replace all placeholders with sentinel strings so we can
  // JSON.parse, then swap real values in.
  const generated: Map<string, unknown> = new Map();
  let idx = 0;

  const sentineled = template.replace(PLACEHOLDER_RE, (_match, token) => {
    const key = `"__PH_${idx++}__"`;
    generated.set(`__PH_${idx - 1}__`, resolvePlaceholder(token));
    return key;
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(sentineled);
  } catch {
    throw new Error("Invalid JSON template. Check your template syntax.");
  }

  function swap(val: unknown): unknown {
    if (typeof val === "string" && generated.has(val)) {
      return generated.get(val);
    }
    if (Array.isArray(val)) return val.map(swap);
    if (val !== null && typeof val === "object") {
      const obj: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        obj[k] = swap(v);
      }
      return obj;
    }
    return val;
  }

  return swap(parsed);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoremJson() {
  const [template, setTemplate] = useState(PRESETS.User);
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    setError("");
    try {
      const n = Math.max(1, Math.min(100, count));
      const records = Array.from({ length: n }, () =>
        generateFromTemplate(template)
      );
      setOutput(JSON.stringify(records, null, 2));
      setCopied(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
      setOutput("");
    }
  }, [template, count]);

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lorem-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function applyPreset(name: string) {
    setTemplate(PRESETS[name]);
    setOutput("");
    setError("");
  }

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted">Preset Templates</h3>
        <div className="flex flex-wrap gap-2">
          {Object.keys(PRESETS).map((name) => (
            <button
              key={name}
              onClick={() => applyPreset(name)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-foreground hover:border-accent hover:text-accent transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Template editor */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted">JSON Template</h3>
          <span className="text-xs text-muted">
            Use placeholders like{" "}
            <code className="px-1 py-0.5 bg-background border border-border rounded text-xs font-mono">
              {"{{"}<span>name</span>{"}}"}
            </code>
          </span>
        </div>
        <textarea
          value={template}
          onChange={(e) => {
            setTemplate(e.target.value);
            setOutput("");
            setError("");
          }}
          rows={14}
          spellCheck={false}
          className="w-full px-3 py-2.5 text-sm font-mono bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-accent transition-colors resize-y"
          aria-label="JSON template"
          placeholder={'{\n  "id": "{{uuid}}",\n  "name": "{{name}}"\n}'}
        />

        {/* Placeholder reference */}
        <div className="flex flex-wrap gap-1.5">
          {[
            "{{name}}", "{{firstName}}", "{{lastName}}", "{{email}}",
            "{{uuid}}", "{{bool}}", "{{date}}", "{{url}}", "{{phone}}",
            "{{address}}", "{{int(1,100)}}", "{{float(0,9.99)}}", "{{lorem(8)}}",
          ].map((ph) => (
            <button
              key={ph}
              onClick={() => {
                setTemplate((t) => t + ph);
                setError("");
              }}
              className="px-2 py-0.5 text-xs font-mono bg-background border border-border rounded text-muted hover:text-foreground hover:border-foreground transition-colors"
              title={`Insert ${ph}`}
            >
              {ph}
            </button>
          ))}
        </div>
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
              value={count}
              onChange={(e) =>
                setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))
              }
              className="w-24 px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
              aria-label="Number of records"
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

      {/* Error */}
      {error && (
        <div className="bg-surface rounded-2xl border border-red-400 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-medium text-muted">JSON Output</span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-border text-foreground hover:border-accent hover:text-accent transition-colors"
              >
                Download
              </button>
            </div>
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
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Lorem JSON Generator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Generate structured fake JSON data from a template schema. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Lorem JSON Generator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Generate structured fake JSON data from a template schema. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Lorem JSON Generator",
  "description": "Generate structured fake JSON data from a template schema",
  "url": "https://tools.loresync.dev/lorem-json",
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
