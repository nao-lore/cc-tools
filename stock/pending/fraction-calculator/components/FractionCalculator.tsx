"use client";

import { useState } from "react";

type Operation = "+" | "-" | "×" | "÷";

interface Fraction {
  n: number;
  d: number;
}

interface Step {
  label: string;
  content: string;
}

interface Result {
  fraction: Fraction;
  decimal: number;
  mixed: string;
  steps: Step[];
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

function simplify(n: number, d: number): Fraction {
  if (d === 0) return { n, d };
  const g = gcd(Math.abs(n), Math.abs(d));
  const sn = n / g;
  const sd = d / g;
  // keep negative in numerator
  return sd < 0 ? { n: -sn, d: -sd } : { n: sn, d: sd };
}

function toMixed(n: number, d: number): string {
  if (d === 0) return "undefined";
  if (Math.abs(n) < Math.abs(d)) return `${n}/${d}`;
  const whole = Math.trunc(n / d);
  const rem = Math.abs(n % d);
  if (rem === 0) return `${whole}`;
  return `${whole} ${rem}/${Math.abs(d)}`;
}

function fractionStr(f: Fraction): string {
  return `${f.n}/${f.d}`;
}

function calculate(
  n1: number, d1: number,
  n2: number, d2: number,
  op: Operation
): Result {
  const steps: Step[] = [];

  steps.push({
    label: "Given",
    content: `${fractionStr({ n: n1, d: d1 })} ${op} ${fractionStr({ n: n2, d: d2 })}`,
  });

  let rn: number;
  let rd: number;

  if (op === "×") {
    steps.push({
      label: "Multiply numerators",
      content: `${n1} × ${n2} = ${n1 * n2}`,
    });
    steps.push({
      label: "Multiply denominators",
      content: `${d1} × ${d2} = ${d1 * d2}`,
    });
    rn = n1 * n2;
    rd = d1 * d2;
    steps.push({
      label: "Result before simplifying",
      content: fractionStr({ n: rn, d: rd }),
    });
  } else if (op === "÷") {
    steps.push({
      label: "Flip the second fraction (reciprocal)",
      content: `${fractionStr({ n: n2, d: d2 })} → ${fractionStr({ n: d2, d: n2 })}`,
    });
    steps.push({
      label: "Multiply by the reciprocal",
      content: `${fractionStr({ n: n1, d: d1 })} × ${fractionStr({ n: d2, d: n2 })}`,
    });
    rn = n1 * d2;
    rd = d1 * n2;
    steps.push({
      label: "Result before simplifying",
      content: fractionStr({ n: rn, d: rd }),
    });
  } else {
    // + or -
    const l = lcm(d1, d2);
    steps.push({
      label: "Find LCD (Least Common Denominator)",
      content: `LCD(${d1}, ${d2}) = ${l}`,
    });
    const mult1 = l / d1;
    const mult2 = l / d2;
    steps.push({
      label: "Convert to common denominator",
      content: `${fractionStr({ n: n1, d: d1 })} = ${fractionStr({ n: n1 * mult1, d: l })}   |   ${fractionStr({ n: n2, d: d2 })} = ${fractionStr({ n: n2 * mult2, d: l })}`,
    });
    const cn1 = n1 * mult1;
    const cn2 = n2 * mult2;
    rn = op === "+" ? cn1 + cn2 : cn1 - cn2;
    rd = l;
    steps.push({
      label: op === "+" ? "Add numerators" : "Subtract numerators",
      content: `${cn1} ${op} ${cn2} = ${rn}`,
    });
    steps.push({
      label: "Result before simplifying",
      content: fractionStr({ n: rn, d: rd }),
    });
  }

  const g = gcd(Math.abs(rn), Math.abs(rd));
  steps.push({
    label: "Find GCD to simplify",
    content: `GCD(${Math.abs(rn)}, ${Math.abs(rd)}) = ${g}`,
  });

  const simplified = simplify(rn, rd);
  steps.push({
    label: "Simplified",
    content: fractionStr(simplified),
  });

  const decimal = simplified.d !== 0 ? simplified.n / simplified.d : NaN;
  const mixed = toMixed(simplified.n, simplified.d);

  return { fraction: simplified, decimal, mixed, steps };
}

function parseInt2(val: string): number | null {
  const t = val.trim();
  if (t === "" || t === "-") return null;
  if (!/^-?\d+$/.test(t)) return null;
  return parseInt(t, 10);
}

function FractionInput({
  label,
  num,
  den,
  onNum,
  onDen,
}: {
  label: string;
  num: string;
  den: string;
  onNum: (v: string) => void;
  onDen: (v: string) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-sm text-muted font-medium mb-1">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        value={num}
        onChange={(e) => onNum(e.target.value)}
        placeholder="1"
        className="w-20 text-center text-lg font-mono border border-border rounded-lg px-2 py-1.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors bg-surface"
      />
      <div className="w-16 border-t-2 border-current" />
      <input
        type="text"
        inputMode="numeric"
        value={den}
        onChange={(e) => onDen(e.target.value)}
        placeholder="2"
        className="w-20 text-center text-lg font-mono border border-border rounded-lg px-2 py-1.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors bg-surface"
      />
    </div>
  );
}

const OPERATIONS: Operation[] = ["+", "-", "×", "÷"];

export default function FractionCalculator() {
  const [n1, setN1] = useState("1");
  const [d1, setD1] = useState("2");
  const [n2, setN2] = useState("1");
  const [d2, setD2] = useState("3");
  const [op, setOp] = useState<Operation>("+");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  function handleCalculate() {
    setError("");
    const pn1 = parseInt2(n1);
    const pd1 = parseInt2(d1);
    const pn2 = parseInt2(n2);
    const pd2 = parseInt2(d2);

    if (pn1 === null) { setError("First numerator is invalid."); return; }
    if (pd1 === null || pd1 === 0) { setError("First denominator must be a non-zero integer."); return; }
    if (pn2 === null) { setError("Second numerator is invalid."); return; }
    if (pd2 === null || pd2 === 0) { setError("Second denominator must be a non-zero integer."); return; }
    if (op === "÷" && pn2 === 0) { setError("Cannot divide by zero."); return; }

    setResult(calculate(pn1, pd1, pn2, pd2, op));
  }

  function handleReset() {
    setN1("1"); setD1("2");
    setN2("1"); setD2("3");
    setOp("+");
    setResult(null);
    setError("");
  }

  return (
    <div className="space-y-6">
      {/* Input card */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h2 className="text-sm font-semibold text-muted mb-4">Enter Fractions</h2>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <FractionInput label="Fraction 1" num={n1} den={d1} onNum={setN1} onDen={setD1} />

          {/* Operation selector */}
          <div className="flex flex-col items-center gap-2 pt-4">
            <span className="text-xs text-muted">Operation</span>
            <div className="flex gap-1">
              {OPERATIONS.map((o) => (
                <button
                  key={o}
                  onClick={() => { setOp(o); setResult(null); setError(""); }}
                  className={`w-10 h-10 rounded-lg text-lg font-bold transition-colors border ${
                    op === o
                      ? "bg-accent text-white border-accent"
                      : "bg-surface border-border text-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <FractionInput label="Fraction 2" num={n2} den={d2} onNum={setN2} onDen={setD2} />
        </div>

        {error && <p className="mt-3 text-sm text-red-500 text-center">{error}</p>}

        <div className="flex gap-2 mt-5 justify-center">
          <button
            onClick={handleCalculate}
            className="px-6 py-2.5 bg-accent text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Calculate
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 border border-border text-muted rounded-xl font-semibold text-sm hover:border-accent hover:text-accent transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Result card */}
      {result && (
        <>
          <div className="bg-surface rounded-2xl border border-border p-4">
            <h2 className="text-sm font-semibold text-muted mb-4">Result</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Simplified fraction */}
              <div className="flex flex-col items-center bg-accent/10 rounded-xl py-4 px-3">
                <span className="text-xs text-muted mb-2">Simplified Fraction</span>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold font-mono">{result.fraction.n}</span>
                  <div className="w-10 border-t-2 border-current my-1" />
                  <span className="text-2xl font-bold font-mono">{result.fraction.d}</span>
                </div>
              </div>

              {/* Decimal */}
              <div className="flex flex-col items-center justify-center bg-surface rounded-xl border border-border py-4 px-3">
                <span className="text-xs text-muted mb-2">Decimal</span>
                <span className="text-2xl font-bold font-mono">
                  {isNaN(result.decimal) ? "undefined" : result.decimal.toFixed(6).replace(/\.?0+$/, "")}
                </span>
              </div>

              {/* Mixed number */}
              <div className="flex flex-col items-center justify-center bg-surface rounded-xl border border-border py-4 px-3">
                <span className="text-xs text-muted mb-2">Mixed Number</span>
                <span className="text-2xl font-bold font-mono">{result.mixed}</span>
              </div>
            </div>
          </div>

          {/* Step-by-step card */}
          <div className="bg-surface rounded-2xl border border-border p-4">
            <h2 className="text-sm font-semibold text-muted mb-4">Step-by-Step Solution</h2>
            <ol className="space-y-3">
              {result.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs text-muted font-medium">{step.label}</p>
                    <p className="font-mono text-sm mt-0.5">{step.content}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center min-h-[90px] text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Fraction Calculator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Add, subtract, multiply, and divide fractions with step-by-step solutions. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Fraction Calculator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Add, subtract, multiply, and divide fractions with step-by-step solutions. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
