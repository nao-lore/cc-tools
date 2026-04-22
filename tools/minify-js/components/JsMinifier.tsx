"use client";

import { useState, useCallback } from "react";

function minifyJS(code: string): string {
  let result = "";
  let i = 0;
  const len = code.length;

  while (i < len) {
    const ch = code[i];

    // String literals - single quote
    if (ch === "'") {
      const end = readStringLiteral(code, i, "'");
      result += code.slice(i, end);
      i = end;
      continue;
    }

    // String literals - double quote
    if (ch === '"') {
      const end = readStringLiteral(code, i, '"');
      result += code.slice(i, end);
      i = end;
      continue;
    }

    // Template literals
    if (ch === "`") {
      const end = readTemplateLiteral(code, i);
      result += code.slice(i, end);
      i = end;
      continue;
    }

    // Single-line comment
    if (ch === "/" && i + 1 < len && code[i + 1] === "/") {
      // Skip until end of line
      while (i < len && code[i] !== "\n") i++;
      // Replace with a single space to avoid token merging
      if (result.length > 0 && result[result.length - 1] !== " " && result[result.length - 1] !== "\n" && result[result.length - 1] !== ";") {
        result += " ";
      }
      continue;
    }

    // Multi-line comment
    if (ch === "/" && i + 1 < len && code[i + 1] === "*") {
      i += 2;
      while (i < len && !(code[i] === "*" && i + 1 < len && code[i + 1] === "/")) {
        i++;
      }
      i += 2; // skip */
      // Replace with space to avoid token merging
      if (result.length > 0 && result[result.length - 1] !== " ") {
        result += " ";
      }
      continue;
    }

    // Regex literal - detect context where / starts a regex
    if (ch === "/" && isRegexContext(result)) {
      const end = readRegexLiteral(code, i);
      result += code.slice(i, end);
      i = end;
      continue;
    }

    // Whitespace
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      // Collapse whitespace
      while (i < len && (code[i] === " " || code[i] === "\t" || code[i] === "\n" || code[i] === "\r")) {
        i++;
      }
      // Only add space if needed to separate tokens
      if (result.length > 0 && i < len) {
        const last = result[result.length - 1];
        const next = code[i];
        if (needsSpace(last, next)) {
          result += " ";
        }
      }
      continue;
    }

    result += ch;
    i++;
  }

  return result.trim();
}

function readStringLiteral(code: string, start: number, quote: string): number {
  let i = start + 1;
  while (i < code.length) {
    if (code[i] === "\\") {
      i += 2; // skip escaped char
      continue;
    }
    if (code[i] === quote) {
      return i + 1;
    }
    i++;
  }
  return i;
}

function readTemplateLiteral(code: string, start: number): number {
  let i = start + 1;
  let depth = 0;
  while (i < code.length) {
    if (code[i] === "\\" && depth === 0) {
      i += 2;
      continue;
    }
    if (code[i] === "$" && i + 1 < code.length && code[i + 1] === "{" && depth === 0) {
      depth++;
      i += 2;
      continue;
    }
    if (code[i] === "{" && depth > 0) {
      depth++;
      i++;
      continue;
    }
    if (code[i] === "}" && depth > 0) {
      depth--;
      i++;
      continue;
    }
    if (code[i] === "`" && depth === 0) {
      return i + 1;
    }
    i++;
  }
  return i;
}

function readRegexLiteral(code: string, start: number): number {
  let i = start + 1;
  while (i < code.length) {
    if (code[i] === "\\") {
      i += 2;
      continue;
    }
    if (code[i] === "[") {
      // Character class - skip until ]
      i++;
      while (i < code.length && code[i] !== "]") {
        if (code[i] === "\\") i++;
        i++;
      }
      i++;
      continue;
    }
    if (code[i] === "/") {
      i++;
      // Read flags
      while (i < code.length && /[gimsuy]/.test(code[i])) i++;
      return i;
    }
    if (code[i] === "\n") return i; // Unterminated
    i++;
  }
  return i;
}

function isRegexContext(result: string): boolean {
  const trimmed = result.trimEnd();
  if (trimmed.length === 0) return true;
  const last = trimmed[trimmed.length - 1];
  // After these characters, / is likely a regex
  return "=(:,;!&|?{[+->~^%".includes(last);
}

function needsSpace(last: string, next: string): boolean {
  const isIdChar = (c: string) => /[a-zA-Z0-9_$]/.test(c);
  // Need space between two identifier-like characters
  if (isIdChar(last) && isIdChar(next)) return true;
  // Some keyword/operator combos need space
  return false;
}

function beautifyJS(code: string): string {
  let result = "";
  let indent = 0;
  let i = 0;
  const indentStr = "  ";

  const addNewline = () => {
    result += "\n" + indentStr.repeat(indent);
  };

  while (i < code.length) {
    const ch = code[i];

    // String literals
    if (ch === "'" || ch === '"') {
      const end = readStringLiteral(code, i, ch);
      result += code.slice(i, end);
      i = end;
      continue;
    }

    // Template literals
    if (ch === "`") {
      const end = readTemplateLiteral(code, i);
      result += code.slice(i, end);
      i = end;
      continue;
    }

    if (ch === "{") {
      result += " {";
      indent++;
      addNewline();
      i++;
      // Skip whitespace after {
      while (i < code.length && (code[i] === " " || code[i] === "\t")) i++;
      continue;
    }

    if (ch === "}") {
      indent = Math.max(0, indent - 1);
      addNewline();
      result += "}";
      i++;
      // Add newline after } unless followed by else/catch/finally or , or ; or )
      if (i < code.length && code[i] !== "," && code[i] !== ";" && code[i] !== ")") {
        addNewline();
      }
      continue;
    }

    if (ch === ";") {
      result += ";";
      i++;
      // Skip whitespace
      while (i < code.length && (code[i] === " " || code[i] === "\t")) i++;
      if (i < code.length && code[i] !== "}") {
        addNewline();
      }
      continue;
    }

    result += ch;
    i++;
  }

  return result.trim();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  return (bytes / 1024).toFixed(1) + " KB";
}

export default function JsMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"minify" | "beautify">("minify");
  const [copied, setCopied] = useState(false);

  const originalSize = new Blob([input]).size;
  const outputSize = new Blob([output]).size;
  const savings = originalSize > 0 ? originalSize - outputSize : 0;
  const savingsPercent =
    originalSize > 0 ? ((savings / originalSize) * 100).toFixed(1) : "0";

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    setOutput(minifyJS(input));
    setMode("minify");
  }, [input]);

  const handleBeautify = useCallback(() => {
    if (!input.trim()) return;
    setOutput(beautifyJS(input));
    setMode("beautify");
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setCopied(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleMinify}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Minify
        </button>
        <button
          onClick={handleBeautify}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Beautify
        </button>
        <button
          onClick={handleCopy}
          disabled={!output}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {copied ? "Copied!" : "Copy Output"}
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* Editor panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Input JavaScript
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JavaScript code here..."
            spellCheck={false}
            className="w-full h-80 p-3 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
          />
        </div>

        {/* Output */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {mode === "minify" ? "Minified" : "Beautified"} Output
          </label>
          <textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            spellCheck={false}
            className="w-full h-80 p-3 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      {output && (
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <span>
            Original: <strong>{formatBytes(originalSize)}</strong>
          </span>
          <span>
            {mode === "minify" ? "Minified" : "Beautified"}:{" "}
            <strong>{formatBytes(outputSize)}</strong>
          </span>
          {mode === "minify" && savings > 0 && (
            <span className="text-green-700">
              Saved: <strong>{formatBytes(savings)}</strong> ({savingsPercent}%)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
