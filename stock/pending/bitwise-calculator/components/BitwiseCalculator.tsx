"use client";

import { useState, useCallback } from "react";

type Operation = "AND" | "OR" | "XOR" | "NOT" | "LEFT_SHIFT" | "RIGHT_SHIFT";

interface Result {
  decimal: number;
  hex: string;
  binary: string;
  unsigned: number;
}

const OPERATIONS: { value: Operation; label: string; symbol: string }[] = [
  { value: "AND", label: "AND", symbol: "&" },
  { value: "OR", label: "OR", symbol: "|" },
  { value: "XOR", label: "XOR", symbol: "^" },
  { value: "NOT", label: "NOT (A)", symbol: "~" },
  { value: "LEFT_SHIFT", label: "Left Shift", symbol: "<<" },
  { value: "RIGHT_SHIFT", label: "Right Shift", symbol: ">>" },
];

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

function parseInput(val: string): number | null {
  const t = val.trim();
  if (t === "" || t === "-") return null;
  if (/^-?0x[0-9a-fA-F]+$/.test(t)) return parseInt(t, 16);
  if (/^-?0b[01]+$/.test(t)) return parseInt(t.replace("0b", ""), 2) * (t.startsWith("-") ? -1 : 1);
  if (/^-?\d+$/.test(t)) return parseInt(t, 10);
  return null;
}

function toUnsigned32(n: number): number {
  return n >>> 0;
}

function toBinaryStr(n: number, bits: number): string {
  return toUnsigned32(n).toString(2).padStart(bits, "0").slice(-bits);
}

function computeResult(a: number, b: number, op: Operation): Result {
  let raw: number;
  switch (op) {
    case "AND": raw = (a & b) | 0; break;
    case "OR":  raw = (a | b) | 0; break;
    case "XOR": raw = (a ^ b) | 0; break;
    case "NOT": raw = (~a) | 0; break;
    case "LEFT_SHIFT":  raw = (a << (b & 31)) | 0; break;
    case "RIGHT_SHIFT": raw = (a >> (b & 31)) | 0; break;
    default: raw = 0;
  }
  const unsigned = toUnsigned32(raw);
  return {
    decimal: raw,
    hex: "0x" + unsigned.toString(16).toUpperCase().padStart(8, "0"),
    binary: toBinaryStr(raw, 32),
    unsigned,
  };
}

function BitDiagram({
  label,
  value,
  bits,
  highlightDiff,
}: {
  label: string;
  value: number;
  bits: 8 | 32;
  highlightDiff?: number;
}) {
  const binStr = toBinaryStr(value, bits);
  const diffStr = highlightDiff !== undefined ? toBinaryStr(highlightDiff, bits) : null;

  return (
    <div>
      <p className="text-xs text-gray-500 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-0.5">
        {binStr.split("").map((bit, i) => {
          const isDiff = diffStr !== null && diffStr[i] !== bit;
          const isOne = bit === "1";
          return (
            <div
              key={i}
              className={`w-5 h-7 flex items-center justify-center rounded text-xs font-mono font-bold border transition-colors ${
                isOne
                  ? isDiff
                    ? "bg-orange-500 border-orange-600 text-white"
                    : "bg-blue-600 border-blue-700 text-white"
                  : isDiff
                  ? "bg-orange-100 border-orange-300 text-orange-700"
                  : "bg-gray-100 border-gray-200 text-gray-400"
              }`}
              title={`bit ${bits - 1 - i} = ${bit}`}
            >
              {bit}
            </div>
          );
        })}
      </div>
      {bits === 32 && (
        <div className="flex mt-1 text-xs text-gray-400 font-mono">
          <span className="w-5 text-center">31</span>
          <span className="flex-1" />
          <span className="w-5 text-center">0</span>
        </div>
      )}
      {bits === 8 && (
        <div className="flex mt-1 text-xs text-gray-400 font-mono">
          <span className="w-5 text-center">7</span>
          <span className="flex-1" />
          <span className="w-5 text-center">0</span>
        </div>
      )}
    </div>
  );
}

export default function BitwiseCalculator() {
  const [inputA, setInputA] = useState("60");
  const [inputB, setInputB] = useState("13");
  const [op, setOp] = useState<Operation>("AND");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const needsB = op !== "NOT";

  const handleCalculate = useCallback(() => {
    setError("");
    const a = parseInput(inputA);
    if (a === null) { setError("Input A is not a valid integer (decimal, 0x hex, or 0b binary)."); return; }

    let b = 0;
    if (needsB) {
      const bVal = parseInput(inputB);
      if (bVal === null) { setError("Input B is not a valid integer."); return; }
      if ((op === "LEFT_SHIFT" || op === "RIGHT_SHIFT") && (bVal < 0 || bVal > 31)) {
        setError("Shift amount must be between 0 and 31.");
        return;
      }
      b = bVal;
    }

    setResult(computeResult(a, b, op));
  }, [inputA, inputB, op, needsB]);

  const handleCopy = useCallback(async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }, []);

  const aVal = parseInput(inputA);
  const bVal = needsB ? parseInput(inputB) : 0;

  const resultRows = result
    ? [
        { label: "Decimal (signed)", key: "dec", value: result.decimal.toString() },
        { label: "Decimal (unsigned)", key: "udec", value: result.unsigned.toString() },
        { label: "Hexadecimal", key: "hex", value: result.hex },
        { label: "Binary (32-bit)", key: "bin", value: result.binary },
      ]
    : [];

  const opEntry = OPERATIONS.find((o) => o.value === op)!;

  return (
    <div className="space-y-8">
      {/* Inputs & Operation */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          {/* Input A */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Input A
            </label>
            <input
              type="text"
              value={inputA}
              onChange={(e) => { setInputA(e.target.value); setResult(null); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
              placeholder="e.g. 60 or 0x3C or 0b111100"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
              spellCheck={false}
              autoComplete="off"
            />
            {aVal !== null && (
              <p className="mt-1 text-xs text-gray-400 font-mono">
                = {toUnsigned32(aVal).toString(2).padStart(8, "0").slice(-8)} (8-bit low)
              </p>
            )}
          </div>

          {/* Operation */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Operation
            </label>
            <select
              value={op}
              onChange={(e) => { setOp(e.target.value as Operation); setResult(null); setError(""); }}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors bg-white"
            >
              {OPERATIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label} ({o.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Input B */}
          <div>
            <label className={`block text-sm font-semibold mb-1.5 ${needsB ? "text-gray-700" : "text-gray-400"}`}>
              Input B{!needsB && " (unused)"}
              {(op === "LEFT_SHIFT" || op === "RIGHT_SHIFT") && (
                <span className="ml-1 font-normal text-gray-400">(shift amount 0–31)</span>
              )}
            </label>
            <input
              type="text"
              value={inputB}
              onChange={(e) => { setInputB(e.target.value); setResult(null); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
              placeholder="e.g. 13"
              disabled={!needsB}
              className={`w-full px-3 py-2.5 border rounded-lg font-mono text-sm outline-none transition-colors ${
                needsB
                  ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
              }`}
              spellCheck={false}
              autoComplete="off"
            />
            {needsB && bVal !== null && (
              <p className="mt-1 text-xs text-gray-400 font-mono">
                = {toUnsigned32(bVal).toString(2).padStart(8, "0").slice(-8)} (8-bit low)
              </p>
            )}
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        <button
          onClick={handleCalculate}
          className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Calculate
        </button>
      </div>

      {/* Result */}
      {result && (
        <>
          {/* Expression summary */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-6 py-4 text-center">
            <p className="font-mono text-lg font-bold text-blue-800">
              {op === "NOT"
                ? `~${aVal} = ${result.decimal}`
                : `${aVal} ${opEntry.symbol} ${bVal} = ${result.decimal}`}
            </p>
            <p className="text-sm text-blue-600 mt-1">{result.hex} &nbsp;|&nbsp; {result.unsigned} unsigned</p>
          </div>

          {/* Result rows */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Result</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resultRows.map(({ label, key, value }) => (
                <div key={key} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5">
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-mono text-sm font-semibold text-gray-900 break-all">{value}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(key, value)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-2 shrink-0"
                    title={`Copy ${label}`}
                  >
                    {copiedKey === key ? CHECK_ICON : COPY_ICON}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 8-bit diagrams */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-5">8-bit Diagram (low byte)</h3>
            <div className="space-y-5">
              {aVal !== null && (
                <BitDiagram label={`A = ${aVal}`} value={aVal} bits={8} />
              )}
              {needsB && bVal !== null && (
                <BitDiagram label={`B = ${bVal}`} value={bVal} bits={8} />
              )}
              <div className="border-t border-gray-100 pt-4">
                <BitDiagram
                  label={`Result (${op === "NOT" ? `~A` : `A ${opEntry.symbol} B`}) = ${result.decimal}`}
                  value={result.decimal}
                  bits={8}
                  highlightDiff={aVal ?? 0}
                />
              </div>
            </div>
          </div>

          {/* 32-bit diagram */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-5">32-bit Diagram</h3>
            <div className="space-y-5 overflow-x-auto">
              {aVal !== null && (
                <BitDiagram label={`A = ${aVal}`} value={aVal} bits={32} />
              )}
              {needsB && bVal !== null && (
                <BitDiagram label={`B = ${bVal}`} value={bVal} bits={32} />
              )}
              <div className="border-t border-gray-100 pt-4">
                <BitDiagram
                  label={`Result = ${result.decimal}`}
                  value={result.decimal}
                  bits={32}
                  highlightDiff={aVal ?? 0}
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Orange bits differ from Input A. Blue = 1, gray = 0.
            </p>
          </div>
        </>
      )}

      {/* Quick reference */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Operation Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Op</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Symbol</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Truth (bit-by-bit)</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Use case</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {[
                { op: "AND", sym: "&",  truth: "1&1=1, 1&0=0, 0&0=0", use: "Masking bits" },
                { op: "OR",  sym: "|",  truth: "1|1=1, 1|0=1, 0|0=0", use: "Setting bits" },
                { op: "XOR", sym: "^",  truth: "1^1=0, 1^0=1, 0^0=0", use: "Toggle / difference" },
                { op: "NOT", sym: "~",  truth: "~1=0, ~0=1",           use: "Flip all bits" },
                { op: "<<",  sym: "<<", truth: "a << n",               use: "Multiply by 2^n" },
                { op: ">>",  sym: ">>", truth: "a >> n",               use: "Divide by 2^n (signed)" },
              ].map((row) => (
                <tr key={row.op} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-3 font-mono font-semibold text-blue-700">{row.op}</td>
                  <td className="py-2 px-3 font-mono text-gray-700">{row.sym}</td>
                  <td className="py-2 px-3 font-mono text-gray-600 text-xs">{row.truth}</td>
                  <td className="py-2 px-3 text-gray-600 text-xs">{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
