"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
  username: string | null;
  password: string | null;
}

type Tab = "fetch" | "axios";

// ── Parser ────────────────────────────────────────────────────────────────────

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      i++;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      i++;
      continue;
    }
    if (!inSingle && !inDouble && ch === "\\") {
      // line continuation or escape — skip next char if newline
      if (input[i + 1] === "\n" || input[i + 1] === "\r") {
        i += 2;
        continue;
      }
      i++;
      if (i < input.length) {
        current += input[i];
        i++;
      }
      continue;
    }
    if (!inSingle && !inDouble && /\s/.test(ch)) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      i++;
      continue;
    }
    current += ch;
    i++;
  }

  if (current.length > 0) tokens.push(current);
  return tokens;
}

function parseCurl(input: string): ParsedCurl {
  const trimmed = input.trim();
  if (!trimmed.startsWith("curl")) {
    throw new Error('Command must start with "curl"');
  }

  const tokens = tokenize(trimmed);
  // remove 'curl'
  tokens.shift();

  const result: ParsedCurl = {
    method: "GET",
    url: "",
    headers: {},
    body: null,
    username: null,
    password: null,
  };

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];

    if (tok === "-X" || tok === "--request") {
      result.method = tokens[++i]?.toUpperCase() ?? "GET";
    } else if (tok === "-H" || tok === "--header") {
      const raw = tokens[++i] ?? "";
      const colon = raw.indexOf(":");
      if (colon !== -1) {
        const key = raw.slice(0, colon).trim();
        const val = raw.slice(colon + 1).trim();
        result.headers[key] = val;
      }
    } else if (tok === "-d" || tok === "--data" || tok === "--data-raw" || tok === "--data-binary") {
      result.body = tokens[++i] ?? null;
      // infer method
      if (result.method === "GET") result.method = "POST";
    } else if (tok === "-u" || tok === "--user") {
      const raw = tokens[++i] ?? "";
      const colon = raw.indexOf(":");
      if (colon !== -1) {
        result.username = raw.slice(0, colon);
        result.password = raw.slice(colon + 1);
      } else {
        result.username = raw;
        result.password = null;
      }
    } else if (tok === "-G" || tok === "--get") {
      result.method = "GET";
    } else if (tok === "--head" || tok === "-I") {
      result.method = "HEAD";
    } else if (!tok.startsWith("-")) {
      // likely the URL
      if (!result.url) result.url = tok;
    }
    // skip unknown flags that take a value (--compressed, --silent, etc.)
    i++;
  }

  if (!result.url) throw new Error("No URL found in the cURL command.");

  return result;
}

// ── Code generators ───────────────────────────────────────────────────────────

function toFetch(p: ParsedCurl): string {
  const lines: string[] = [];
  lines.push("const response = await fetch(");
  lines.push(`  "${p.url}",`);
  lines.push("  {");

  if (p.method !== "GET") {
    lines.push(`    method: "${p.method}",`);
  }

  // Build headers, injecting Basic auth from -u if present
  const headers = { ...p.headers };
  if (p.username !== null) {
    const creds = p.password !== null ? `${p.username}:${p.password}` : p.username;
    headers["Authorization"] = `__BTOA__${creds}__BTOA__`;
  }

  const headerEntries = Object.entries(headers);
  if (headerEntries.length > 0) {
    lines.push("    headers: {");
    for (const [k, v] of headerEntries) {
      if (v.startsWith("__BTOA__") && v.endsWith("__BTOA__")) {
        const creds = v.slice(8, -8);
        lines.push(`      "${k}": \`Basic \${btoa("${creds}")}\`,`);
      } else {
        lines.push(`      "${k}": "${v}",`);
      }
    }
    lines.push("    },");
  }

  if (p.body !== null) {
    lines.push(`    body: ${JSON.stringify(p.body)},`);
  }

  lines.push("  }");
  lines.push(");");
  lines.push("");
  lines.push("const data = await response.json();");
  lines.push("console.log(data);");

  return lines.join("\n");
}

function toAxios(p: ParsedCurl): string {
  const lines: string[] = [];
  const method = p.method.toLowerCase();

  const headers = { ...p.headers };
  if (p.username !== null) {
    const creds = p.password !== null ? `${p.username}:${p.password}` : p.username;
    headers["Authorization"] = `Basic \${btoa("${creds}")}`;
  }

  const hasHeaders = Object.keys(headers).length > 0;
  const hasBody = p.body !== null;
  const isBasicAuth = p.username !== null;

  if (method === "get" || method === "head" || method === "delete") {
    lines.push(`const { data } = await axios.${method}(`);
    lines.push(`  "${p.url}",`);
    if (hasHeaders || isBasicAuth) {
      lines.push("  {");
      lines.push("    headers: {");
      for (const [k, v] of Object.entries(headers)) {
        lines.push(`      "${k}": "${v}",`);
      }
      lines.push("    },");
      if (isBasicAuth) {
        lines.push("    auth: {");
        lines.push(`      username: "${p.username}",`);
        if (p.password !== null) lines.push(`      password: "${p.password}",`);
        lines.push("    },");
      }
      lines.push("  }");
    }
    lines.push(");");
  } else {
    lines.push(`const { data } = await axios.${method}(`);
    lines.push(`  "${p.url}",`);
    lines.push(`  ${hasBody ? JSON.stringify(p.body) : "null"},`);
    lines.push("  {");
    if (hasHeaders) {
      lines.push("    headers: {");
      for (const [k, v] of Object.entries(headers)) {
        lines.push(`      "${k}": "${v}",`);
      }
      lines.push("    },");
    }
    if (isBasicAuth) {
      lines.push("    auth: {");
      lines.push(`      username: "${p.username}",`);
      if (p.password !== null) lines.push(`      password: "${p.password}",`);
      lines.push("    },");
    }
    lines.push("  }");
    lines.push(");");
  }

  lines.push("console.log(data);");

  return lines.join("\n");
}

// ── Component ─────────────────────────────────────────────────────────────────

const EXAMPLE = `curl -X POST "https://api.example.com/users" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"name":"Alice","email":"alice@example.com"}'`;

export default function CurlToFetch() {
  const [input, setInput] = useState(EXAMPLE);
  const [tab, setTab] = useState<Tab>("fetch");
  const [fetchCode, setFetchCode] = useState("");
  const [axiosCode, setAxiosCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedFetch, setCopiedFetch] = useState(false);
  const [copiedAxios, setCopiedAxios] = useState(false);

  function convert() {
    setError(null);
    setFetchCode("");
    setAxiosCode("");
    try {
      const parsed = parseCurl(input);
      setFetchCode(toFetch(parsed));
      setAxiosCode(toAxios(parsed));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse cURL command.");
    }
  }

  async function copyFetch() {
    await navigator.clipboard.writeText(fetchCode);
    setCopiedFetch(true);
    setTimeout(() => setCopiedFetch(false), 2000);
  }

  async function copyAxios() {
    await navigator.clipboard.writeText(axiosCode);
    setCopiedAxios(true);
    setTimeout(() => setCopiedAxios(false), 2000);
  }

  const hasOutput = fetchCode || axiosCode;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted">cURL Command</h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`curl -X GET "https://api.example.com/data" -H "Authorization: Bearer token"`}
          rows={6}
          className="w-full px-3 py-2 text-sm font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors resize-y"
          aria-label="cURL command input"
          spellCheck={false}
        />
        <button
          onClick={convert}
          className="px-5 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent/80 transition-colors"
        >
          Convert
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-surface rounded-2xl border border-red-400/40 p-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Output */}
      {hasOutput && (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setTab("fetch")}
              className={`px-5 py-3 text-sm font-medium transition-colors ${
                tab === "fetch"
                  ? "text-accent border-b-2 border-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              fetch()
            </button>
            <button
              onClick={() => setTab("axios")}
              className={`px-5 py-3 text-sm font-medium transition-colors ${
                tab === "axios"
                  ? "text-accent border-b-2 border-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Axios
            </button>
          </div>

          {/* Fetch tab */}
          {tab === "fetch" && (
            <div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-xs text-muted font-mono">async/await · fetch API</span>
                <button
                  onClick={copyFetch}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors"
                >
                  {copiedFetch ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="p-4">
                <pre className="text-xs font-mono text-foreground bg-background rounded-lg border border-border p-4 overflow-x-auto max-h-96 leading-relaxed whitespace-pre">
                  {fetchCode}
                </pre>
              </div>
            </div>
          )}

          {/* Axios tab */}
          {tab === "axios" && (
            <div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-xs text-muted font-mono">async/await · axios</span>
                <button
                  onClick={copyAxios}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent text-white hover:bg-accent/80 transition-colors"
                >
                  {copiedAxios ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="p-4">
                <pre className="text-xs font-mono text-foreground bg-background rounded-lg border border-border p-4 overflow-x-auto max-h-96 leading-relaxed whitespace-pre">
                  {axiosCode}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    </div>
  );
}
