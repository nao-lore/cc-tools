"use client";

import { useState, useCallback } from "react";

type IndentType = "2" | "4" | "tab";

function syntaxHighlight(json: string): string {
  const escaped = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}\[\],])/g,
    (match) => {
      let cls = "json-number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "json-key";
          // Remove the trailing colon for the span, add it back outside
          return `<span class="${cls}">${match.slice(0, -1)}</span>:`;
        } else {
          cls = "json-string";
        }
      } else if (/true|false/.test(match)) {
        cls = "json-boolean";
      } else if (/null/.test(match)) {
        cls = "json-null";
      } else if (/[{}\[\],]/.test(match)) {
        cls = "json-bracket";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

function getErrorPosition(error: string): number | null {
  const match = error.match(/position\s+(\d+)/i);
  if (match) return parseInt(match[1], 10);
  const colMatch = error.match(/column\s+(\d+)/i);
  if (colMatch) return parseInt(colMatch[1], 10);
  return null;
}

function positionToLine(text: string, position: number): number {
  const lines = text.substring(0, position).split("\n");
  return lines.length;
}

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [indentType, setIndentType] = useState<IndentType>("2");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState("");

  const getIndent = useCallback((): string | number => {
    if (indentType === "tab") return "\t";
    return parseInt(indentType, 10);
  }, [indentType]);

  const validate = useCallback((text: string): { valid: boolean; parsed?: unknown; error?: string } => {
    if (!text.trim()) return { valid: false, error: undefined };
    try {
      const parsed = JSON.parse(text);
      return { valid: true, parsed };
    } catch (e) {
      const msg = (e as Error).message;
      const pos = getErrorPosition(msg);
      const lineInfo = pos !== null ? ` (line ${positionToLine(text, pos)})` : "";
      return { valid: false, error: `${msg}${lineInfo}` };
    }
  }, []);

  const handleFormat = useCallback(() => {
    const result = validate(input);
    if (result.valid) {
      const formatted = JSON.stringify(result.parsed, null, getIndent());
      setOutput(formatted);
      setError(null);
    } else {
      setError(result.error || "Empty input");
      setOutput("");
    }
  }, [input, getIndent, validate]);

  const handleMinify = useCallback(() => {
    const result = validate(input);
    if (result.valid) {
      setOutput(JSON.stringify(result.parsed));
      setError(null);
    } else {
      setError(result.error || "Empty input");
      setOutput("");
    }
  }, [input, validate]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
  }, []);

  const isValid = input.trim() ? validate(input).valid : null;
  const charCount = input.length;
  const lineCount = input ? input.split("\n").length : 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleFormat}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Format
        </button>
        <button
          onClick={handleMinify}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Minify
        </button>
        <button
          onClick={handleCopy}
          disabled={!output}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {copied ? (
            <span className="checkmark-animate text-green-600">Copied!</span>
          ) : (
            "Copy"
          )}
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Clear
        </button>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-gray-500">Indent:</label>
          <select
            value={indentType}
            onChange={(e) => setIndentType(e.target.value as IndentType)}
            className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 cursor-pointer"
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </select>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 text-sm">
        {isValid !== null && (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isValid
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isValid ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {isValid ? "Valid JSON" : "Invalid JSON"}
          </span>
        )}
        <span className="text-gray-400 text-xs">
          {charCount.toLocaleString()} chars · {lineCount.toLocaleString()} lines
        </span>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-mono">
          {error}
        </div>
      )}

      {/* Editor panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Input
          </label>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder='Paste your JSON here...\n\n{"example": "value"}'
            spellCheck={false}
            className="w-full h-96 p-4 font-mono text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 placeholder-gray-400"
          />
        </div>

        {/* Output */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Output
          </label>
          <div className="w-full h-96 p-4 font-mono text-sm border border-gray-200 rounded-lg bg-white text-gray-800 overflow-auto">
            {output ? (
              <pre
                className="whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{
                  __html: syntaxHighlight(output),
                }}
              />
            ) : (
              <span className="text-gray-400">
                Formatted output will appear here...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
