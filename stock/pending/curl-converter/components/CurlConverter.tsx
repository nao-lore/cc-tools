"use client";

import { useState, useCallback } from "react";
import { parseCurl } from "../lib/curl-parser";

type Language = "javascript" | "python" | "go" | "php" | "ruby";

const LANGUAGES: { id: Language; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "go", label: "Go" },
  { id: "php", label: "PHP" },
  { id: "ruby", label: "Ruby" },
];

const EXAMPLES = [
  {
    label: "GET request",
    curl: `curl https://api.example.com/users`,
  },
  {
    label: "POST JSON",
    curl: `curl -X POST https://api.example.com/users \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"Alice","email":"alice@example.com"}'`,
  },
  {
    label: "Auth + Headers",
    curl: `curl https://api.example.com/me \\\n  -H "Authorization: Bearer YOUR_TOKEN" \\\n  -H "Accept: application/json"`,
  },
  {
    label: "Basic Auth",
    curl: `curl -u admin:secret https://api.example.com/admin/users`,
  },
];

// --- Code generators ---

function toJavaScript(curl: string): string {
  const p = parseCurl(curl);
  if (!p.url) return "// Paste a cURL command above";

  const lines: string[] = [];
  const hasBody = p.body !== null;
  const hasHeaders = Object.keys(p.headers).length > 0;

  lines.push(`const response = await fetch('${p.url}', {`);
  lines.push(`  method: '${p.method}',`);

  if (p.auth) {
    const encoded = `btoa('${p.auth.user}:${p.auth.password}')`;
    lines.push(`  headers: {`);
    lines.push(`    'Authorization': \`Basic \${${encoded}}\`,`);
    for (const [k, v] of Object.entries(p.headers)) {
      lines.push(`    '${k}': '${v}',`);
    }
    lines.push(`  },`);
  } else if (hasHeaders) {
    lines.push(`  headers: {`);
    for (const [k, v] of Object.entries(p.headers)) {
      lines.push(`    '${k}': '${v}',`);
    }
    lines.push(`  },`);
  }

  if (hasBody) {
    lines.push(`  body: ${p.isJson ? `JSON.stringify(${p.body})` : `'${p.body}'`},`);
  }

  lines.push(`});`);
  lines.push(``);
  lines.push(`const data = await response.json();`);
  lines.push(`console.log(data);`);

  return lines.join("\n");
}

function toPython(curl: string): string {
  const p = parseCurl(curl);
  if (!p.url) return "# Paste a cURL command above";

  const lines: string[] = [];
  lines.push(`import requests`);
  lines.push(``);

  const hasHeaders = Object.keys(p.headers).length > 0 || p.auth;
  const hasBody = p.body !== null;

  if (p.auth) {
    lines.push(`auth = ('${p.auth.user}', '${p.auth.password}')`);
  }

  if (hasHeaders) {
    lines.push(`headers = {`);
    for (const [k, v] of Object.entries(p.headers)) {
      lines.push(`    '${k}': '${v}',`);
    }
    lines.push(`}`);
  }

  if (hasBody) {
    if (p.isJson) {
      lines.push(`data = ${p.body}`);
    } else {
      lines.push(`data = '${p.body}'`);
    }
  }

  lines.push(``);

  const method = p.method.toLowerCase();
  const args: string[] = [`'${p.url}'`];
  if (hasHeaders) args.push(`headers=headers`);
  if (hasBody) args.push(p.isJson ? `json=data` : `data=data`);
  if (p.auth) args.push(`auth=auth`);

  lines.push(`response = requests.${method}(`);
  for (const arg of args) {
    lines.push(`    ${arg},`);
  }
  lines.push(`)`);
  lines.push(``);
  lines.push(`print(response.json())`);

  return lines.join("\n");
}

function toGo(curl: string): string {
  const p = parseCurl(curl);
  if (!p.url) return "// Paste a cURL command above";

  const lines: string[] = [];
  const hasBody = p.body !== null;
  const hasHeaders = Object.keys(p.headers).length > 0 || p.auth;

  lines.push(`package main`);
  lines.push(``);
  lines.push(`import (`);
  lines.push(`\t"fmt"`);
  lines.push(`\t"io"`);
  if (hasBody) lines.push(`\t"strings"`);
  lines.push(`\t"net/http"`);
  lines.push(`)`);
  lines.push(``);
  lines.push(`func main() {`);

  if (hasBody) {
    const bodyStr = p.body?.replace(/"/g, '\\"') ?? '';
    lines.push(`\tbody := strings.NewReader("${bodyStr}")`);
    lines.push(`\treq, _ := http.NewRequest("${p.method}", "${p.url}", body)`);
  } else {
    lines.push(`\treq, _ := http.NewRequest("${p.method}", "${p.url}", nil)`);
  }

  for (const [k, v] of Object.entries(p.headers)) {
    lines.push(`\treq.Header.Set("${k}", "${v}")`);
  }

  if (p.auth) {
    lines.push(`\treq.SetBasicAuth("${p.auth.user}", "${p.auth.password}")`);
  }

  if (hasHeaders || p.auth) lines.push(``);

  lines.push(`\tclient := &http.Client{}`);
  lines.push(`\tresp, err := client.Do(req)`);
  lines.push(`\tif err != nil {`);
  lines.push(`\t\tpanic(err)`);
  lines.push(`\t}`);
  lines.push(`\tdefer resp.Body.Close()`);
  lines.push(``);
  lines.push(`\tbody2, _ := io.ReadAll(resp.Body)`);
  lines.push(`\tfmt.Println(string(body2))`);
  lines.push(`}`);

  return lines.join("\n");
}

function toPhp(curl: string): string {
  const p = parseCurl(curl);
  if (!p.url) return "<?php\n// Paste a cURL command above";

  const lines: string[] = [];
  lines.push(`<?php`);
  lines.push(``);
  lines.push(`$ch = curl_init();`);
  lines.push(``);
  lines.push(`curl_setopt($ch, CURLOPT_URL, '${p.url}');`);
  lines.push(`curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);`);
  lines.push(`curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${p.method}');`);

  if (p.auth) {
    lines.push(`curl_setopt($ch, CURLOPT_USERPWD, '${p.auth.user}:${p.auth.password}');`);
  }

  if (Object.keys(p.headers).length > 0) {
    lines.push(``);
    lines.push(`$headers = [`);
    for (const [k, v] of Object.entries(p.headers)) {
      lines.push(`    '${k}: ${v}',`);
    }
    lines.push(`];`);
    lines.push(`curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);`);
  }

  if (p.body !== null) {
    const escaped = p.body.replace(/'/g, "\\'");
    lines.push(``);
    lines.push(`curl_setopt($ch, CURLOPT_POSTFIELDS, '${escaped}');`);
  }

  lines.push(``);
  lines.push(`$response = curl_exec($ch);`);
  lines.push(`curl_close($ch);`);
  lines.push(``);
  lines.push(`echo $response;`);

  return lines.join("\n");
}

function toRuby(curl: string): string {
  const p = parseCurl(curl);
  if (!p.url) return "# Paste a cURL command above";

  const lines: string[] = [];
  const hasBody = p.body !== null;

  lines.push(`require 'net/http'`);
  lines.push(`require 'uri'`);
  if (p.isJson) lines.push(`require 'json'`);
  lines.push(``);

  lines.push(`uri = URI.parse('${p.url}')`);
  lines.push(`http = Net::HTTP.new(uri.host, uri.port)`);
  lines.push(`http.use_ssl = uri.scheme == 'https'`);
  lines.push(``);

  const methodMap: Record<string, string> = {
    GET: "Net::HTTP::Get",
    POST: "Net::HTTP::Post",
    PUT: "Net::HTTP::Put",
    PATCH: "Net::HTTP::Patch",
    DELETE: "Net::HTTP::Delete",
  };
  const rubyMethod = methodMap[p.method] ?? "Net::HTTP::Get";
  lines.push(`request = ${rubyMethod}.new(uri.request_uri)`);

  for (const [k, v] of Object.entries(p.headers)) {
    lines.push(`request['${k}'] = '${v}'`);
  }

  if (p.auth) {
    lines.push(`request.basic_auth('${p.auth.user}', '${p.auth.password}')`);
  }

  if (hasBody) {
    if (p.isJson) {
      lines.push(`request.body = ${p.body}.to_json`);
    } else {
      lines.push(`request.body = '${p.body}'`);
    }
  }

  lines.push(``);
  lines.push(`response = http.request(request)`);
  lines.push(`puts response.body`);

  return lines.join("\n");
}

function generateCode(lang: Language, curl: string): string {
  switch (lang) {
    case "javascript": return toJavaScript(curl);
    case "python": return toPython(curl);
    case "go": return toGo(curl);
    case "php": return toPhp(curl);
    case "ruby": return toRuby(curl);
  }
}

// --- Syntax highlighter ---

const KEYWORDS: Record<Language, string[]> = {
  javascript: ["const", "await", "async", "function", "return", "let", "var", "if", "else", "true", "false", "null"],
  python: ["import", "def", "return", "if", "else", "True", "False", "None", "async", "await", "print"],
  go: ["package", "import", "func", "var", "if", "else", "return", "nil", "defer", "true", "false"],
  php: ["echo", "if", "else", "return", "true", "false", "null", "function"],
  ruby: ["require", "def", "end", "if", "else", "return", "true", "false", "nil", "puts"],
};

function highlightCode(code: string, lang: Language): string {
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const keywords = KEYWORDS[lang];
  const kwPattern = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");

  return escaped
    // strings single
    .replace(/'([^']*)'/g, `<span class="hl-string">'$1'</span>`)
    // strings double
    .replace(/"([^"]*)"/g, `<span class="hl-string">"$1"</span>`)
    // backtick template literals
    .replace(/`([^`]*)`/g, `<span class="hl-string">\`$1\`</span>`)
    // comments
    .replace(/(\/\/[^\n]*|#[^\n]*)/g, `<span class="hl-comment">$1</span>`)
    // keywords
    .replace(kwPattern, `<span class="hl-keyword">$1</span>`);
}

export default function CurlConverter() {
  const [curl, setCurl] = useState("");
  const [activeTab, setActiveTab] = useState<Language>("javascript");
  const [copiedTab, setCopiedTab] = useState<Language | null>(null);

  const handleCopy = useCallback(async (lang: Language) => {
    const code = generateCode(lang, curl);
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedTab(lang);
    setTimeout(() => setCopiedTab(null), 2000);
  }, [curl]);

  const handleClear = useCallback(() => {
    setCurl("");
  }, []);

  const parsed = curl.trim() ? parseCurl(curl) : null;
  const code = generateCode(activeTab, curl);

  return (
    <div className="space-y-4">
      {/* Example buttons */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500 font-medium">Examples:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => setCurl(ex.curl)}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
          >
            {ex.label}
          </button>
        ))}
        {curl && (
          <button
            onClick={handleClear}
            className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors cursor-pointer ml-auto"
          >
            Clear
          </button>
        )}
      </div>

      {/* Input */}
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">
          cURL Command
        </label>
        <textarea
          value={curl}
          onChange={(e) => setCurl(e.target.value)}
          placeholder={"curl https://api.example.com/users \\\n  -H \"Authorization: Bearer TOKEN\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"name\": \"Alice\"}'"}
          spellCheck={false}
          className="w-full h-40 p-4 font-mono text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 placeholder-gray-400"
        />
      </div>

      {/* Parsed summary */}
      {parsed && parsed.url && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
            {parsed.method}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-mono max-w-sm truncate">
            {parsed.url}
          </span>
          {Object.keys(parsed.headers).length > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {Object.keys(parsed.headers).length} header{Object.keys(parsed.headers).length !== 1 ? "s" : ""}
            </span>
          )}
          {parsed.body && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              body
            </span>
          )}
          {parsed.auth && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
              basic auth
            </span>
          )}
        </div>
      )}

      {/* Output tabs */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setActiveTab(lang.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === lang.id
                  ? "bg-white text-gray-900 border-b-2 border-gray-900 -mb-px"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {lang.label}
            </button>
          ))}
          <div className="ml-auto flex items-center px-3">
            <button
              onClick={() => handleCopy(activeTab)}
              className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
            >
              {copiedTab === activeTab ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Code output */}
        <div className="p-4 bg-white overflow-auto min-h-48 max-h-96">
          <style>{`
            .hl-keyword { color: #7c3aed; font-weight: 600; }
            .hl-string  { color: #059669; }
            .hl-comment { color: #9ca3af; font-style: italic; }
          `}</style>
          <pre
            className="font-mono text-sm text-gray-800 whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{
              __html: highlightCode(code, activeTab),
            }}
          />
        </div>
      </div>
    </div>
  );
}
