"use client";

import { useState, useCallback, useRef } from "react";

// ── SCSS compiler ─────────────────────────────────────────────────────────────

interface CompileResult {
  css: string;
  error: string | null;
}

function evaluateMath(expr: string): string {
  // Evaluate simple arithmetic: 10px + 5px, 100% / 3, etc.
  // Extract unit from first/last operand
  const unitMatch = expr.match(/([a-z%]+)$/i);
  const unit = unitMatch ? unitMatch[1] : "";
  const numeric = expr.replace(/[a-z%]+/gi, "").trim();
  try {
    // Only allow safe characters
    if (!/^[\d\s+\-*/().]+$/.test(numeric)) return expr;
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${numeric})`)() as number;
    if (!isFinite(result)) return expr;
    const rounded = parseFloat(result.toFixed(4));
    return `${rounded}${unit}`;
  } catch {
    return expr;
  }
}

function resolveVariables(
  value: string,
  vars: Map<string, string>
): string {
  return value.replace(/\$[\w-]+/g, (match) => vars.get(match) ?? match);
}

function compileSass(input: string): CompileResult {
  const lines = input.split("\n");
  const variables = new Map<string, string>();

  // First pass: collect variables
  for (const line of lines) {
    const varMatch = line.match(/^\s*(\$[\w-]+)\s*:\s*(.+?)\s*;?\s*$/);
    if (varMatch) {
      variables.set(varMatch[1], varMatch[2].trim());
    }
  }

  // Resolve variable references in variable values (one level deep)
  for (const [key, val] of variables) {
    variables.set(key, resolveVariables(val, variables));
  }

  // Second pass: compile nesting
  interface Block {
    selector: string;
    props: string[];
    children: Block[];
  }

  const rootBlock: Block = { selector: "", props: [], children: [] };
  const stack: Block[] = [rootBlock];
  let currentBlock = rootBlock;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line || line.startsWith("//")) continue;

    // Variable declaration — skip (already collected)
    if (/^\$[\w-]+\s*:/.test(line)) continue;

    if (line.endsWith("{")) {
      const selector = line.slice(0, -1).trim();
      const newBlock: Block = { selector, props: [], children: [] };
      currentBlock.children.push(newBlock);
      stack.push(newBlock);
      currentBlock = newBlock;
      continue;
    }

    if (line === "}") {
      stack.pop();
      currentBlock = stack[stack.length - 1] ?? rootBlock;
      continue;
    }

    // Property declaration
    if (line.includes(":") && !line.endsWith("{")) {
      // Resolve variables and evaluate math
      let resolved = resolveVariables(line, variables);
      // Evaluate math inside calc-like expressions (basic)
      resolved = resolved.replace(
        /:\s*(.+?)\s*;?\s*$/,
        (_, val) => {
          const evaled = val.replace(
            /(\d+(?:\.\d+)?[a-z%]*)\s*([+\-*/])\s*(\d+(?:\.\d+)?[a-z%]*)/g,
            (m: string, a: string, op: string, b: string) =>
              evaluateMath(`${a}${op}${b}`)
          );
          return `: ${evaled.replace(/;$/, "")};`;
        }
      );
      currentBlock.props.push(resolved.replace(/;?\s*$/, ";"));
    }
  }

  // Render blocks to CSS
  const outputLines: string[] = [];

  function renderBlock(block: Block, parentSelector: string) {
    // Resolve the selector (handle & for parent reference)
    let selector = block.selector;
    if (parentSelector) {
      if (selector.includes("&")) {
        selector = selector.replace(/&/g, parentSelector);
      } else {
        selector = `${parentSelector} ${selector}`;
      }
    }

    if (block.props.length > 0 && selector) {
      outputLines.push(`${selector} {`);
      for (const prop of block.props) {
        outputLines.push(`  ${prop}`);
      }
      outputLines.push(`}`);
      if (block.children.length > 0) outputLines.push("");
    }

    for (const child of block.children) {
      renderBlock(child, selector);
    }
  }

  // Root-level props (rare but handle)
  if (rootBlock.props.length > 0) {
    for (const prop of rootBlock.props) {
      outputLines.push(prop);
    }
    outputLines.push("");
  }

  for (let i = 0; i < rootBlock.children.length; i++) {
    renderBlock(rootBlock.children[i], "");
    if (i < rootBlock.children.length - 1) {
      outputLines.push("");
    }
  }

  const css = outputLines.join("\n").trim();
  return { css: css || "/* No output */" , error: null };
}

// ── Component ─────────────────────────────────────────────────────────────────

const PLACEHOLDER = `// SCSS example
$primary: #6366f1;
$padding-base: 1rem;
$font-size: 14px;

.card {
  background: $primary;
  padding: $padding-base;
  border-radius: 0.5rem;

  &:hover {
    opacity: 0.9;
  }

  .title {
    font-size: $font-size * 1.5;
    font-weight: bold;
    color: white;
  }

  .body {
    font-size: $font-size;
    color: rgba(255, 255, 255, 0.8);
    margin-top: $padding-base / 2;
  }
}`;

export default function SassConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const compile = useCallback((text: string) => {
    if (!text.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      const result = compileSass(text);
      if (result.error) {
        setError(result.error);
        setOutput("");
      } else {
        setError(null);
        setOutput(result.css);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parse error");
      setOutput("");
    }
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setInput(value);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => compile(value), 200);
    },
    [compile]
  );

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = output;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Error Banner */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm font-mono">
          <span className="font-semibold text-red-400">Error: </span>
          {error}
        </div>
      )}

      {/* Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Panel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-lg">
            <span className="text-sm font-medium text-gray-300">SCSS Input</span>
            <button
              onClick={() => {
                setInput("");
                setOutput("");
                setError(null);
              }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={PLACEHOLDER}
            className="w-full h-72 sm:h-80 lg:h-96 p-4 bg-gray-900 text-gray-100 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-b-lg placeholder:text-gray-600"
            spellCheck={false}
          />
        </div>

        {/* Output Panel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-lg">
            <span className="text-sm font-medium text-gray-300">CSS Output</span>
            <button
              onClick={handleCopy}
              disabled={!output}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-all duration-200 ${
                copied
                  ? "bg-green-600 text-white"
                  : output
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              {copied ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                    <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="w-full h-72 sm:h-80 lg:h-96 p-4 bg-gray-900 text-green-400 font-mono text-sm leading-relaxed overflow-auto rounded-b-lg whitespace-pre-wrap">
            {output || (
              <span className="text-gray-600">Compiled CSS will appear here...</span>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
