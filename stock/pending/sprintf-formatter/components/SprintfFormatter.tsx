"use client";

import { useState, useCallback, useMemo } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Placeholder {
  index: number;       // position in the format string
  raw: string;         // full token, e.g. "%8.2f"
  spec: string;        // specifier letter, e.g. "f"
  width: string;       // e.g. "8"
  precision: string;   // e.g. "2"
  label: string;       // human-readable, e.g. "arg1 (float, width 8, precision 2)"
}

interface ArgValue {
  raw: string;
  parsed: number | string | null;
}

// ── Regex to detect placeholders ───────────────────────────────────────────
// Matches: %% (literal), or %[width][.precision]specifier
const PLACEHOLDER_RE = /%%|%(\d*)(\.?\d*)([dsfxXoObBeE])/g;

function parsePlaceholders(fmt: string): Placeholder[] {
  const result: Placeholder[] = [];
  let match: RegExpExecArray | null;
  PLACEHOLDER_RE.lastIndex = 0;
  let argIdx = 0;
  while ((match = PLACEHOLDER_RE.exec(fmt)) !== null) {
    if (match[0] === "%%") continue; // literal %, no arg
    const width = match[1] ?? "";
    const precision = match[2] ? match[2].slice(1) : ""; // strip leading dot
    const spec = match[3];

    const parts: string[] = [];
    if (width) parts.push(`width ${width}`);
    if (precision) parts.push(`precision .${precision}`);

    const typeLabel: Record<string, string> = {
      d: "int", s: "string", f: "float", x: "hex (lower)",
      X: "hex (upper)", o: "octal", O: "octal", b: "binary",
      B: "binary", e: "scientific (lower)", E: "scientific (upper)",
    };

    result.push({
      index: argIdx++,
      raw: match[0],
      spec,
      width,
      precision,
      label: `arg${argIdx} (${typeLabel[spec] ?? spec}${parts.length ? ", " + parts.join(", ") : ""})`,
    });
  }
  return result;
}

// ── sprintf implementation ─────────────────────────────────────────────────

function applyWidth(s: string, width: string, leftAlign = false): string {
  const w = parseInt(width, 10);
  if (!w || s.length >= w) return s;
  const pad = " ".repeat(w - s.length);
  return leftAlign ? s + pad : pad + s;
}

function formatValue(ph: Placeholder, argVal: ArgValue): string {
  const { spec, width, precision } = ph;

  if (spec === "s") {
    const s = argVal.raw ?? "";
    const prec = precision !== "" ? parseInt(precision, 10) : Infinity;
    const truncated = isFinite(prec) ? s.slice(0, prec) : s;
    return applyWidth(truncated, width);
  }

  const num = typeof argVal.parsed === "number" ? argVal.parsed : NaN;
  if (isNaN(num)) return "[NaN]";

  const int = Math.trunc(num);

  switch (spec) {
    case "d": {
      return applyWidth(int.toString(), width);
    }
    case "f": {
      const prec = precision !== "" ? parseInt(precision, 10) : 6;
      return applyWidth(num.toFixed(prec), width);
    }
    case "e": {
      const prec = precision !== "" ? parseInt(precision, 10) : 6;
      return applyWidth(num.toExponential(prec), width);
    }
    case "E": {
      const prec = precision !== "" ? parseInt(precision, 10) : 6;
      return applyWidth(num.toExponential(prec).toUpperCase(), width);
    }
    case "x": {
      const hex = (int >>> 0).toString(16);
      const padded = precision !== "" ? hex.padStart(parseInt(precision, 10), "0") : hex;
      return applyWidth(padded, width);
    }
    case "X": {
      const hex = (int >>> 0).toString(16).toUpperCase();
      const padded = precision !== "" ? hex.padStart(parseInt(precision, 10), "0") : hex;
      return applyWidth(padded, width);
    }
    case "o":
    case "O": {
      const oct = (int >>> 0).toString(8);
      const padded = precision !== "" ? oct.padStart(parseInt(precision, 10), "0") : oct;
      return applyWidth(padded, width);
    }
    case "b":
    case "B": {
      const bin = (int >>> 0).toString(2);
      const padded = precision !== "" ? bin.padStart(parseInt(precision, 10), "0") : bin;
      return applyWidth(padded, width);
    }
    default:
      return "[?]";
  }
}

function sprintf(fmt: string, placeholders: Placeholder[], args: ArgValue[]): string {
  let result = "";
  let lastIdx = 0;
  PLACEHOLDER_RE.lastIndex = 0;
  let argIdx = 0;
  let match: RegExpExecArray | null;
  while ((match = PLACEHOLDER_RE.exec(fmt)) !== null) {
    result += fmt.slice(lastIdx, match.index);
    if (match[0] === "%%") {
      result += "%";
    } else {
      const ph = placeholders[argIdx];
      const av = args[argIdx] ?? { raw: "", parsed: null };
      result += ph ? formatValue(ph, av) : "";
      argIdx++;
    }
    lastIdx = match.index + match[0].length;
  }
  result += fmt.slice(lastIdx);
  return result;
}

// ── Icons ──────────────────────────────────────────────────────────────────

const COPY_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
  </svg>
);

const CHECK_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Specifier reference table data ─────────────────────────────────────────

const SPECIFIER_ROWS = [
  { spec: "%d", type: "int",               example: "%5d",    exOut: "   42",    note: "Decimal integer, right-aligned by default" },
  { spec: "%s", type: "string",            example: "%-10s",  exOut: "hello     ", note: "String; left-align with - flag" },
  { spec: "%f", type: "float",             example: "%8.2f",  exOut: "    3.14", note: "Fixed-point float; default 6 decimal places" },
  { spec: "%e", type: "scientific",        example: "%.3e",   exOut: "3.142e+0", note: "Scientific notation (lowercase e)" },
  { spec: "%E", type: "scientific",        example: "%.3E",   exOut: "3.142E+0", note: "Scientific notation (uppercase E)" },
  { spec: "%x", type: "hex (lower)",       example: "%08x",   exOut: "0000002a", note: "Hexadecimal, lowercase; width pads with spaces" },
  { spec: "%X", type: "hex (upper)",       example: "%08X",   exOut: "0000002A", note: "Hexadecimal, uppercase" },
  { spec: "%o", type: "octal",             example: "%o",     exOut: "52",       note: "Octal representation of integer" },
  { spec: "%b", type: "binary",            example: "%b",     exOut: "101010",   note: "Binary (Go, Python 3.x; not C standard)" },
  { spec: "%%", type: "literal %",         example: "100%%",  exOut: "100%",     note: "Escaped percent sign; no argument consumed" },
];

// ── Main component ─────────────────────────────────────────────────────────

export default function SprintfFormatter() {
  const [format, setFormat] = useState('Hello, %s! You scored %d/%d (%.1f%%).');
  const [argValues, setArgValues] = useState<string[]>(["World", "42", "100", "42.0"]);
  const [copied, setCopied] = useState(false);

  const placeholders = useMemo(() => parsePlaceholders(format), [format]);

  // Sync arg array length when placeholders change
  const syncedArgs: ArgValue[] = useMemo(() => {
    return placeholders.map((ph, i) => {
      const raw = argValues[i] ?? "";
      let parsed: number | string | null = null;
      if (ph.spec === "s") {
        parsed = raw;
      } else {
        const n = Number(raw);
        parsed = isNaN(n) ? null : n;
      }
      return { raw, parsed };
    });
  }, [placeholders, argValues]);

  const output = useMemo(() => {
    try {
      return sprintf(format, placeholders, syncedArgs);
    } catch {
      return "[error]";
    }
  }, [format, placeholders, syncedArgs]);

  const handleArgChange = useCallback((i: number, val: string) => {
    setArgValues((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const inputTypeFor = (ph: Placeholder) =>
    ph.spec === "s" ? "text" : "number";

  const placeholderHintFor = (ph: Placeholder) => {
    switch (ph.spec) {
      case "d": return "e.g. 42";
      case "s": return "e.g. World";
      case "f": case "e": case "E": return "e.g. 3.14159";
      case "x": case "X": return "e.g. 255";
      case "o": return "e.g. 8";
      case "b": case "B": return "e.g. 10";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">

      {/* Format string input */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Format String
        </label>
        <input
          type="text"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          placeholder='e.g. "%s scored %d points (%.2f%%)"'
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
          spellCheck={false}
          autoComplete="off"
        />
        <p className="mt-2 text-xs text-gray-400">
          Detected{" "}
          <span className="font-semibold text-gray-600">{placeholders.length}</span>{" "}
          placeholder{placeholders.length !== 1 ? "s" : ""}.
          {placeholders.length === 0 && format.includes("%") && (
            <span className="text-amber-500 ml-1">No recognized specifiers found.</span>
          )}
        </p>
      </div>

      {/* Argument inputs */}
      {placeholders.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Arguments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {placeholders.map((ph, i) => (
              <div key={i}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  <span className="font-mono text-blue-700 mr-1">{ph.raw}</span>
                  <span className="text-gray-400">{ph.label}</span>
                </label>
                <input
                  type={inputTypeFor(ph)}
                  value={argValues[i] ?? ""}
                  onChange={(e) => handleArgChange(i, e.target.value)}
                  placeholder={placeholderHintFor(ph)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                  spellCheck={false}
                  autoComplete="off"
                />
                {ph.spec !== "s" && argValues[i] !== undefined && argValues[i] !== "" && syncedArgs[i]?.parsed === null && (
                  <p className="mt-1 text-xs text-red-400">Not a valid number</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Formatted Output</h3>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors"
          >
            {copied ? CHECK_ICON : COPY_ICON}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="bg-gray-900 rounded-lg px-4 py-4 overflow-x-auto">
          <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap break-all">
            {output || <span className="text-gray-500">Output will appear here…</span>}
          </pre>
        </div>

        {/* token breakdown */}
        {placeholders.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {placeholders.map((ph, i) => {
              const val = syncedArgs[i];
              const rendered = val ? formatValue(ph, val) : "?";
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-100 rounded text-xs font-mono"
                >
                  <span className="text-blue-600 font-semibold">{ph.raw}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-800">{rendered}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Reference table */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Format Specifier Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-600 whitespace-nowrap">Spec</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600 whitespace-nowrap">Type</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600 whitespace-nowrap">Example</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600 whitespace-nowrap">Output</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Notes</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {SPECIFIER_ROWS.map((row) => (
                <tr
                  key={row.spec}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2 px-3 font-mono font-semibold text-blue-700 whitespace-nowrap">{row.spec}</td>
                  <td className="py-2 px-3 text-gray-600 whitespace-nowrap">{row.type}</td>
                  <td className="py-2 px-3 font-mono text-gray-700 whitespace-nowrap">{row.example}</td>
                  <td className="py-2 px-3 font-mono text-green-700 whitespace-nowrap">{row.exOut}</td>
                  <td className="py-2 px-3 text-gray-500 text-xs">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Width / precision guide */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-semibold text-gray-700 mb-2">Width</p>
            <p className="mb-1"><span className="font-mono text-blue-700">%8d</span> — minimum field width 8, right-aligned</p>
            <p><span className="font-mono text-blue-700">%-8d</span> — left-aligned (pad right)</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-semibold text-gray-700 mb-2">Precision</p>
            <p className="mb-1"><span className="font-mono text-blue-700">%.2f</span> — 2 decimal places for floats</p>
            <p><span className="font-mono text-blue-700">%.5s</span> — max 5 characters for strings</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-semibold text-gray-700 mb-2">Combined</p>
            <p className="mb-1"><span className="font-mono text-blue-700">%10.3f</span> — width 10, 3 decimal places</p>
            <p><span className="font-mono text-blue-700">%08x</span> — note: 0-padding not yet in this tool</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-semibold text-gray-700 mb-2">Language conventions</p>
            <p className="mb-1"><span className="font-mono text-blue-700">%b</span> — binary: Go, Python 3.x (not ANSI C)</p>
            <p><span className="font-mono text-blue-700">%%</span> — literal % in all languages</p>
          </div>
        </div>
      </div>
    </div>
  );
}
