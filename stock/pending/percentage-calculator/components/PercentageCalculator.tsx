"use client";

import { useState } from "react";

type Mode = "x-pct-of-y" | "x-is-what-pct" | "pct-change";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function ResultBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-5 py-4 flex items-center justify-between gap-4 ${
        highlight
          ? "bg-blue-50 border-blue-200"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center">
        <span
          className={`text-xl font-bold ${
            highlight ? "text-blue-700" : "text-gray-800"
          }`}
        >
          {value}
        </span>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

function StepBox({ steps }: { steps: string[] }) {
  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white px-5 py-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Step-by-step
      </p>
      <ol className="space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm text-gray-700">
            <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
              {i + 1}
            </span>
            <span dangerouslySetInnerHTML={{ __html: s }} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function fmt(n: number, decimals = 4): string {
  // Remove trailing zeros up to `decimals` places
  return parseFloat(n.toFixed(decimals)).toString();
}

// ---- Mode 1: X% of Y ----
function XPctOfY() {
  const [pct, setPct] = useState("");
  const [num, setNum] = useState("");

  const p = parseFloat(pct);
  const y = parseFloat(num);
  const valid = !isNaN(p) && !isNaN(y);
  const result = valid ? (p / 100) * y : null;

  const steps =
    valid && result !== null
      ? [
          `Write the formula: <strong>result = (percent / 100) × number</strong>`,
          `Substitute values: result = (${fmt(p)} / 100) × ${fmt(y)}`,
          `Divide: ${fmt(p)} / 100 = ${fmt(p / 100)}`,
          `Multiply: ${fmt(p / 100)} × ${fmt(y)} = <strong>${fmt(result)}</strong>`,
        ]
      : [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Percent (%)
          </label>
          <input
            type="number"
            value={pct}
            onChange={(e) => setPct(e.target.value)}
            placeholder="e.g. 25"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number
          </label>
          <input
            type="number"
            value={num}
            onChange={(e) => setNum(e.target.value)}
            placeholder="e.g. 200"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {valid && result !== null ? (
        <>
          <ResultBox
            label={`${fmt(p)}% of ${fmt(y)} =`}
            value={fmt(result)}
            highlight
          />
          <StepBox steps={steps} />
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-6 text-center text-sm text-gray-400">
          Enter both values above to see the result
        </div>
      )}
    </div>
  );
}

// ---- Mode 2: X is what % of Y ----
function XIsWhatPct() {
  const [part, setPart] = useState("");
  const [whole, setWhole] = useState("");

  const x = parseFloat(part);
  const y = parseFloat(whole);
  const valid = !isNaN(x) && !isNaN(y) && y !== 0;
  const result = valid ? (x / y) * 100 : null;

  const steps =
    valid && result !== null
      ? [
          `Write the formula: <strong>percent = (part / whole) × 100</strong>`,
          `Substitute values: percent = (${fmt(x)} / ${fmt(y)}) × 100`,
          `Divide: ${fmt(x)} / ${fmt(y)} = ${fmt(x / y)}`,
          `Multiply by 100: ${fmt(x / y)} × 100 = <strong>${fmt(result)}%</strong>`,
        ]
      : [];

  const zeroWhole = !isNaN(parseFloat(whole)) && parseFloat(whole) === 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Part (X)
          </label>
          <input
            type="number"
            value={part}
            onChange={(e) => setPart(e.target.value)}
            placeholder="e.g. 50"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Whole (Y)
          </label>
          <input
            type="number"
            value={whole}
            onChange={(e) => setWhole(e.target.value)}
            placeholder="e.g. 200"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {zeroWhole ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          Cannot divide by zero — whole (Y) must not be 0.
        </div>
      ) : valid && result !== null ? (
        <>
          <ResultBox
            label={`${fmt(x)} is what % of ${fmt(y)}?`}
            value={`${fmt(result)}%`}
            highlight
          />
          <StepBox steps={steps} />
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-6 text-center text-sm text-gray-400">
          Enter both values above to see the result
        </div>
      )}
    </div>
  );
}

// ---- Mode 3: % Change from X to Y ----
function PctChange() {
  const [oldVal, setOldVal] = useState("");
  const [newVal, setNewVal] = useState("");

  const x = parseFloat(oldVal);
  const y = parseFloat(newVal);
  const valid = !isNaN(x) && !isNaN(y) && x !== 0;
  const result = valid ? ((y - x) / Math.abs(x)) * 100 : null;
  const isIncrease = result !== null && result > 0;
  const isDecrease = result !== null && result < 0;
  const isNoChange = result !== null && result === 0;

  const direction = isIncrease ? "increase" : isDecrease ? "decrease" : "no change";

  const steps =
    valid && result !== null
      ? [
          `Write the formula: <strong>% change = ((new − old) / |old|) × 100</strong>`,
          `Subtract: ${fmt(y)} − ${fmt(x)} = ${fmt(y - x)}`,
          `Absolute value of old: |${fmt(x)}| = ${fmt(Math.abs(x))}`,
          `Divide: ${fmt(y - x)} / ${fmt(Math.abs(x))} = ${fmt((y - x) / Math.abs(x))}`,
          `Multiply by 100: ${fmt((y - x) / Math.abs(x))} × 100 = <strong>${fmt(result)}%</strong> (${direction})`,
        ]
      : [];

  const zeroOld = !isNaN(parseFloat(oldVal)) && parseFloat(oldVal) === 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Original value (X)
          </label>
          <input
            type="number"
            value={oldVal}
            onChange={(e) => setOldVal(e.target.value)}
            placeholder="e.g. 100"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New value (Y)
          </label>
          <input
            type="number"
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            placeholder="e.g. 150"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {zeroOld ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          Cannot calculate percent change from 0 — original value must not be 0.
        </div>
      ) : valid && result !== null ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ResultBox
              label="Percent change"
              value={`${result >= 0 ? "+" : ""}${fmt(result)}%`}
              highlight
            />
            <ResultBox
              label="Direction"
              value={
                isIncrease
                  ? "Increase ▲"
                  : isDecrease
                  ? "Decrease ▼"
                  : "No change"
              }
            />
          </div>
          <StepBox steps={steps} />
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-6 text-center text-sm text-gray-400">
          Enter both values above to see the result
        </div>
      )}
    </div>
  );
}

const MODES: { key: Mode; label: string; desc: string }[] = [
  { key: "x-pct-of-y", label: "X% of Y", desc: "What is 25% of 200?" },
  { key: "x-is-what-pct", label: "X is what % of Y", desc: "50 is what % of 200?" },
  { key: "pct-change", label: "% Change", desc: "Change from 100 to 150?" },
];

export default function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("x-pct-of-y");

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              mode === m.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Active mode description */}
      <p className="text-sm text-gray-500">
        {MODES.find((m) => m.key === mode)?.desc}
      </p>

      {/* Calculator panel */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6">
        {mode === "x-pct-of-y" && <XPctOfY />}
        {mode === "x-is-what-pct" && <XIsWhatPct />}
        {mode === "pct-change" && <PctChange />}
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Percentage Calculator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Calculate percentages, percent change, and percent of total. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Percentage Calculator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Calculate percentages, percent change, and percent of total. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
