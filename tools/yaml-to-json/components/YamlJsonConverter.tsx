"use client";

import { useState, useCallback } from "react";

// ============================================================
// Simple YAML parser (no external dependencies)
// Handles: key-value, nested objects, arrays (- items),
// strings (quoted/unquoted), numbers, booleans, null,
// multiline strings (| and >)
// ============================================================

function parseYaml(input: string): unknown {
  const lines = input.split("\n");
  let pos = 0;

  function currentIndent(line: string): number {
    const match = line.match(/^( *)/);
    return match ? match[1].length : 0;
  }

  function skipEmpty() {
    while (pos < lines.length) {
      const line = lines[pos];
      if (line.trim() === "" || line.trim().startsWith("#")) {
        pos++;
      } else {
        break;
      }
    }
  }

  function parseValue(raw: string): unknown {
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed === "~" || trimmed === "null") return null;
    if (trimmed === "true" || trimmed === "True" || trimmed === "TRUE")
      return true;
    if (trimmed === "false" || trimmed === "False" || trimmed === "FALSE")
      return false;
    // Quoted strings
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }
    // Inline array [a, b, c]
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      const inner = trimmed.slice(1, -1);
      if (inner.trim() === "") return [];
      return inner.split(",").map((s) => parseValue(s));
    }
    // Inline object {a: b, c: d}
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const inner = trimmed.slice(1, -1);
      if (inner.trim() === "") return {};
      const obj: Record<string, unknown> = {};
      const pairs = inner.split(",");
      for (const pair of pairs) {
        const colonIdx = pair.indexOf(":");
        if (colonIdx !== -1) {
          const k = pair.slice(0, colonIdx).trim();
          const v = pair.slice(colonIdx + 1).trim();
          obj[k] = parseValue(v);
        }
      }
      return obj;
    }
    // Numbers
    if (/^-?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(trimmed)) {
      return Number(trimmed);
    }
    if (trimmed.startsWith("0x") && /^0x[\dA-Fa-f]+$/.test(trimmed)) {
      return parseInt(trimmed, 16);
    }
    return trimmed;
  }

  function collectMultilineString(baseIndent: number, fold: boolean): string {
    const collected: string[] = [];
    while (pos < lines.length) {
      const line = lines[pos];
      if (line.trim() === "") {
        collected.push("");
        pos++;
        continue;
      }
      if (currentIndent(line) <= baseIndent) break;
      collected.push(line.trimStart());
      pos++;
    }
    // Remove trailing empty lines
    while (collected.length > 0 && collected[collected.length - 1] === "") {
      collected.pop();
    }
    if (fold) {
      return collected.join(" ").replace(/ {2,}/g, " ");
    }
    return collected.join("\n");
  }

  function parseBlock(minIndent: number): unknown {
    skipEmpty();
    if (pos >= lines.length) return null;

    const firstLine = lines[pos];
    const firstIndent = currentIndent(firstLine);
    const trimmedFirst = firstLine.trim();

    // Is it an array?
    if (trimmedFirst.startsWith("- ") || trimmedFirst === "-") {
      const arr: unknown[] = [];
      while (pos < lines.length) {
        skipEmpty();
        if (pos >= lines.length) break;
        const line = lines[pos];
        const indent = currentIndent(line);
        const trimmed = line.trim();
        if (indent < firstIndent) break;
        if (indent === firstIndent && trimmed.startsWith("- ")) {
          const afterDash = trimmed.slice(2);
          // Check if it's a key-value after dash: "- key: value"
          const kvMatch = afterDash.match(/^([^:]+?):\s*(.*)/);
          if (kvMatch && !afterDash.startsWith('"') && !afterDash.startsWith("'")) {
            // It's an object item in array
            pos++;
            const obj: Record<string, unknown> = {};
            const key = kvMatch[1].trim();
            const val = kvMatch[2].trim();
            if (val === "" || val === "|" || val === ">") {
              if (val === "|" || val === ">") {
                obj[key] = collectMultilineString(indent + 2, val === ">");
              } else {
                obj[key] = parseBlock(indent + 2);
              }
            } else {
              obj[key] = parseValue(val);
            }
            // Parse remaining keys at deeper indent
            while (pos < lines.length) {
              skipEmpty();
              if (pos >= lines.length) break;
              const subLine = lines[pos];
              const subIndent = currentIndent(subLine);
              if (subIndent <= indent) break;
              const subTrimmed = subLine.trim();
              const subKv = subTrimmed.match(/^([^:]+?):\s*(.*)/);
              if (subKv) {
                pos++;
                const sk = subKv[1].trim();
                const sv = subKv[2].trim();
                if (sv === "" || sv === "|" || sv === ">") {
                  if (sv === "|" || sv === ">") {
                    obj[sk] = collectMultilineString(subIndent, sv === ">");
                  } else {
                    obj[sk] = parseBlock(subIndent + 2);
                  }
                } else {
                  obj[sk] = parseValue(sv);
                }
              } else {
                break;
              }
            }
            arr.push(obj);
          } else {
            pos++;
            if (afterDash === "") {
              arr.push(parseBlock(indent + 2));
            } else {
              arr.push(parseValue(afterDash));
            }
          }
        } else if (indent === firstIndent && trimmed === "-") {
          pos++;
          arr.push(parseBlock(indent + 2));
        } else {
          break;
        }
      }
      return arr;
    }

    // Is it an object?
    const kvMatch = trimmedFirst.match(/^([^:]+?):\s*(.*)/);
    if (kvMatch) {
      const obj: Record<string, unknown> = {};
      while (pos < lines.length) {
        skipEmpty();
        if (pos >= lines.length) break;
        const line = lines[pos];
        const indent = currentIndent(line);
        if (indent < firstIndent) break;
        if (indent !== firstIndent) break;
        const trimmed = line.trim();
        const kv = trimmed.match(/^([^:]+?):\s*(.*)/);
        if (!kv) break;
        pos++;
        const key = kv[1].trim();
        const val = kv[2].trim();
        if (val === "|" || val === ">") {
          obj[key] = collectMultilineString(indent, val === ">");
        } else if (val === "") {
          obj[key] = parseBlock(indent + 1);
        } else {
          obj[key] = parseValue(val);
        }
      }
      return obj;
    }

    // Scalar
    pos++;
    return parseValue(trimmedFirst);
  }

  skipEmpty();
  // Handle document separator
  if (pos < lines.length && lines[pos].trim() === "---") {
    pos++;
  }
  return parseBlock(0);
}

// ============================================================
// JSON to YAML serializer
// ============================================================

function jsonToYaml(value: unknown, indent: number = 0): string {
  const prefix = "  ".repeat(indent);

  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    // Quote if it contains special chars or looks like a number/bool/null
    if (
      value === "" ||
      value === "true" ||
      value === "false" ||
      value === "null" ||
      value === "~" ||
      /^-?[\d.]+([eE][+-]?\d+)?$/.test(value) ||
      value.includes(": ") ||
      value.includes("#") ||
      value.includes("\n") ||
      value.startsWith("- ") ||
      value.startsWith("{") ||
      value.startsWith("[") ||
      value.startsWith("'") ||
      value.startsWith('"') ||
      value.startsWith("*") ||
      value.startsWith("&")
    ) {
      return JSON.stringify(value);
    }
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const lines: string[] = [];
    for (const item of value) {
      if (
        typeof item === "object" &&
        item !== null &&
        !Array.isArray(item)
      ) {
        const entries = Object.entries(item as Record<string, unknown>);
        if (entries.length > 0) {
          const [firstKey, firstVal] = entries[0];
          lines.push(
            `${prefix}- ${firstKey}: ${jsonToYaml(firstVal, indent + 2)}`
          );
          for (let i = 1; i < entries.length; i++) {
            const [k, v] = entries[i];
            lines.push(
              `${prefix}  ${k}: ${jsonToYaml(v, indent + 2)}`
            );
          }
        } else {
          lines.push(`${prefix}- {}`);
        }
      } else {
        lines.push(`${prefix}- ${jsonToYaml(item, indent + 1)}`);
      }
    }
    return lines.join("\n");
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    const lines: string[] = [];
    for (const [key, val] of entries) {
      if (
        typeof val === "object" &&
        val !== null &&
        (Array.isArray(val)
          ? val.length > 0
          : Object.keys(val).length > 0)
      ) {
        lines.push(`${prefix}${key}:`);
        lines.push(jsonToYaml(val, indent + 1));
      } else {
        lines.push(`${prefix}${key}: ${jsonToYaml(val, indent + 1)}`);
      }
    }
    return lines.join("\n");
  }

  return String(value);
}

// ============================================================
// Component
// ============================================================

type Mode = "yaml-to-json" | "json-to-yaml";

export default function YamlJsonConverter() {
  const [yamlText, setYamlText] = useState<string>(
    `name: John Doe\nage: 30\nactive: true\nskills:\n  - JavaScript\n  - TypeScript\n  - React\naddress:\n  city: Tokyo\n  country: Japan`
  );
  const [jsonText, setJsonText] = useState<string>("");
  const [mode, setMode] = useState<Mode>("yaml-to-json");
  const [error, setError] = useState<string>("");
  const [copiedSide, setCopiedSide] = useState<"yaml" | "json" | null>(null);

  // Initial conversion
  const doInitialConvert = useCallback(() => {
    try {
      const parsed = parseYaml(yamlText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setError("");
    } catch {
      // ignore on init
    }
  }, [yamlText]);

  // Run once on mount
  useState(() => {
    doInitialConvert();
  });

  const handleYamlChange = (value: string) => {
    setYamlText(value);
    if (mode === "yaml-to-json") {
      try {
        const parsed = parseYaml(value);
        setJsonText(JSON.stringify(parsed, null, 2));
        setError("");
      } catch (e) {
        setError(`YAML Error: ${e instanceof Error ? e.message : "Invalid YAML"}`);
      }
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonText(value);
    if (mode === "json-to-yaml") {
      try {
        const parsed = JSON.parse(value);
        setYamlText(jsonToYaml(parsed));
        setError("");
      } catch (e) {
        setError(`JSON Error: ${e instanceof Error ? e.message : "Invalid JSON"}`);
      }
    }
  };

  const toggleMode = () => {
    const newMode = mode === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json";
    setMode(newMode);
    setError("");
    // Re-convert in new direction
    if (newMode === "yaml-to-json") {
      try {
        const parsed = parseYaml(yamlText);
        setJsonText(JSON.stringify(parsed, null, 2));
      } catch {
        // keep as-is
      }
    } else {
      try {
        const parsed = JSON.parse(jsonText);
        setYamlText(jsonToYaml(parsed));
      } catch {
        // keep as-is
      }
    }
  };

  const formatYaml = () => {
    try {
      const parsed = parseYaml(yamlText);
      setYamlText(jsonToYaml(parsed));
      setError("");
    } catch (e) {
      setError(`YAML Error: ${e instanceof Error ? e.message : "Invalid YAML"}`);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (e) {
      setError(`JSON Error: ${e instanceof Error ? e.message : "Invalid JSON"}`);
    }
  };

  const copyToClipboard = async (text: string, side: "yaml" | "json") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSide(side);
      setTimeout(() => setCopiedSide(null), 2000);
    } catch {
      // fallback
    }
  };

  const download = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setYamlText("");
    setJsonText("");
    setError("");
  };

  const isSource = (side: "yaml" | "json") =>
    (mode === "yaml-to-json" && side === "yaml") ||
    (mode === "json-to-yaml" && side === "json");

  return (
    <div className="space-y-4">
      {/* Mode toggle + actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={toggleMode}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
        >
          {mode === "yaml-to-json" ? "YAML → JSON" : "JSON → YAML"}
        </button>
        <span className="text-xs text-gray-500">
          Click to switch direction
        </span>
        <div className="ml-auto">
          <button
            onClick={clearAll}
            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-mono">
          {error}
        </div>
      )}

      {/* Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* YAML side */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-700">YAML</h2>
              {isSource("yaml") && (
                <span className="text-[10px] font-medium text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                  SOURCE
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={formatYaml}
                className="px-2.5 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                title="Format YAML"
              >
                Format
              </button>
              <button
                onClick={() => copyToClipboard(yamlText, "yaml")}
                className="px-2.5 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                title="Copy YAML"
              >
                {copiedSide === "yaml" ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => download(yamlText, "data.yaml")}
                className="px-2.5 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                title="Download as .yaml"
              >
                Download
              </button>
            </div>
          </div>
          <textarea
            value={yamlText}
            onChange={(e) => handleYamlChange(e.target.value)}
            className="w-full h-80 lg:h-96 p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
            placeholder="Paste your YAML here..."
            spellCheck={false}
          />
        </div>

        {/* JSON side */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-700">JSON</h2>
              {isSource("json") && (
                <span className="text-[10px] font-medium text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                  SOURCE
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={formatJson}
                className="px-2.5 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                title="Format JSON"
              >
                Format
              </button>
              <button
                onClick={() => copyToClipboard(jsonText, "json")}
                className="px-2.5 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                title="Copy JSON"
              >
                {copiedSide === "json" ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => download(jsonText, "data.json")}
                className="px-2.5 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                title="Download as .json"
              >
                Download
              </button>
            </div>
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            className="w-full h-80 lg:h-96 p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all"
            placeholder="Paste your JSON here..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            { q: "YAMLとJSONの違いは何ですか？", a: "YAMLは人間が読みやすい形式で、コメントが書けてインデントでネストを表現します。JSONは波括弧・引用符を使いより厳密な構文を持ちます。DockerやKubernetesの設定はYAML、Web APIのレスポンスはJSONが一般的です。" },
            { q: "YAMLのコメントはJSON変換後も残りますか？", a: "いいえ。JSONはコメントをサポートしていないため、YAML内のコメント（#で始まる行）はJSON変換時に削除されます。" },
            { q: "JSONからYAMLへの逆変換もできますか？", a: "はい。変換方向を「JSON → YAML」に切り替えることでJSONをYAML形式に変換できます。設定ファイルの形式変換に便利です。" },
          ].map(({ q, a }) => (
            <div key={q} className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-800 mb-1">Q. {q}</p>
              <p className="text-sm text-gray-600">A. {a}</p>
            </div>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "YAMLとJSONの違いは何ですか？", "acceptedAnswer": { "@type": "Answer", "text": "YAMLは人間が読みやすくコメントが書ける形式です。JSONはより厳密な構文を持ちWeb APIで広く使われています。" } },
              { "@type": "Question", "name": "YAMLのコメントはJSON変換後も残りますか？", "acceptedAnswer": { "@type": "Answer", "text": "いいえ。JSONはコメントをサポートしていないため、YAML内のコメントはJSON変換時に削除されます。" } },
              { "@type": "Question", "name": "JSONからYAMLへの逆変換もできますか？", "acceptedAnswer": { "@type": "Answer", "text": "はい。変換方向をJSON → YAMLに切り替えることでJSONをYAML形式に変換できます。" } },
            ]
          }) }}
        />
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">関連ツール</p>
          <div className="flex flex-wrap gap-2">
            <a href="/json-formatter" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">JSON フォーマッター</a>
            <a href="/xml-formatter" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">XML フォーマッター</a>
          </div>
        </div>
      </div>
    </div>
  );
}
