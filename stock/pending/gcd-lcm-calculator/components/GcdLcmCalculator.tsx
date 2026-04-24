"use client";

import { useState, useCallback } from "react";

// --- Math utilities ---

function gcd2(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function lcm2(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd2(a, b);
}

function gcdMany(nums: number[]): number {
  return nums.reduce((acc, n) => gcd2(acc, n));
}

function lcmMany(nums: number[]): number {
  return nums.reduce((acc, n) => lcm2(acc, n));
}

// Euclidean algorithm steps for two numbers
interface EuclidStep {
  a: number;
  b: number;
  quotient: number;
  remainder: number;
}

function euclidSteps(a: number, b: number): EuclidStep[] {
  const steps: EuclidStep[] = [];
  a = Math.abs(a);
  b = Math.abs(b);
  // ensure a >= b
  if (a < b) [a, b] = [b, a];
  while (b !== 0) {
    const quotient = Math.floor(a / b);
    const remainder = a % b;
    steps.push({ a, b, quotient, remainder });
    a = b;
    b = remainder;
  }
  return steps;
}

// Prime factorization
function primeFactors(n: number): Map<number, number> {
  const factors = new Map<number, number>();
  n = Math.abs(n);
  if (n < 2) return factors;
  for (let p = 2; p * p <= n; p++) {
    while (n % p === 0) {
      factors.set(p, (factors.get(p) ?? 0) + 1);
      n = n / p;
    }
  }
  if (n > 1) factors.set(n, (factors.get(n) ?? 0) + 1);
  return factors;
}

function formatFactorization(factors: Map<number, number>): string {
  if (factors.size === 0) return "1";
  return Array.from(factors.entries())
    .map(([p, e]) => (e === 1 ? `${p}` : `${p}^${e}`))
    .join(" × ");
}

// --- Component ---

interface NumberInput {
  id: number;
  value: string;
}

let nextId = 3;

export default function GcdLcmCalculator() {
  const [inputs, setInputs] = useState<NumberInput[]>([
    { id: 1, value: "12" },
    { id: 2, value: "18" },
  ]);
  const [copied, setCopied] = useState<"gcd" | "lcm" | null>(null);

  const addNumber = useCallback(() => {
    if (inputs.length >= 10) return;
    setInputs((prev) => [...prev, { id: nextId++, value: "" }]);
  }, [inputs.length]);

  const removeNumber = useCallback((id: number) => {
    setInputs((prev) => prev.filter((inp) => inp.id !== id));
  }, []);

  const updateValue = useCallback((id: number, value: string) => {
    setInputs((prev) =>
      prev.map((inp) => (inp.id === id ? { ...inp, value } : inp))
    );
  }, []);

  const copyToClipboard = useCallback(
    (text: string, kind: "gcd" | "lcm") => {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(kind);
        setTimeout(() => setCopied(null), 1500);
      });
    },
    []
  );

  // Parse valid numbers
  const validNums = inputs
    .map((inp) => parseInt(inp.value, 10))
    .filter((n) => !isNaN(n) && n > 0);

  const hasResult = validNums.length >= 2;
  const gcdResult = hasResult ? gcdMany(validNums) : null;
  const lcmResult = hasResult ? lcmMany(validNums) : null;

  // Euclidean steps: pairwise for display (show first pair reduction)
  const euclidPairs: Array<{ label: string; steps: EuclidStep[] }> = [];
  if (hasResult && validNums.length >= 2) {
    // Build the chain: gcd(gcd(a,b), c), ...
    let running = validNums[0];
    for (let i = 1; i < validNums.length; i++) {
      const a = running;
      const b = validNums[i];
      const steps = euclidSteps(a, b);
      euclidPairs.push({ label: `gcd(${a}, ${b})`, steps });
      running = gcd2(a, b);
    }
  }

  // Prime factorizations
  const factorMaps = validNums.map((n) => ({ n, factors: primeFactors(n) }));

  // All prime bases
  const allPrimes = Array.from(
    new Set(factorMaps.flatMap(({ factors }) => Array.from(factors.keys())))
  ).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Input section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Numbers</h2>
          <span className="text-sm text-gray-400">{inputs.length} / 10</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
          {inputs.map((inp, idx) => (
            <div key={inp.id} className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={inp.value}
                onChange={(e) => updateValue(inp.id, e.target.value)}
                placeholder={`Number ${idx + 1}`}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-7"
              />
              {inputs.length > 2 && (
                <button
                  onClick={() => removeNumber(inp.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-xs font-bold leading-none"
                  title="Remove"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addNumber}
          disabled={inputs.length >= 10}
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-300 disabled:cursor-not-allowed font-medium"
        >
          <span className="text-base leading-none">+</span> Add number
        </button>
      </div>

      {/* Results */}
      {hasResult && gcdResult !== null && lcmResult !== null && (
        <div className="grid sm:grid-cols-2 gap-4">
          {/* GCD */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">
                GCD (Greatest Common Divisor)
              </p>
              <button
                onClick={() => copyToClipboard(String(gcdResult), "gcd")}
                className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1 rounded border border-blue-200 hover:border-blue-400 transition-colors"
              >
                {copied === "gcd" ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-5xl font-bold text-blue-900 mt-2">
              {gcdResult}
            </p>
            <p className="text-xs text-blue-500 mt-2">
              gcd({validNums.join(", ")}) = {gcdResult}
            </p>
          </div>

          {/* LCM */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-emerald-700 uppercase tracking-wide">
                LCM (Least Common Multiple)
              </p>
              <button
                onClick={() => copyToClipboard(String(lcmResult), "lcm")}
                className="text-xs text-emerald-500 hover:text-emerald-700 px-2 py-1 rounded border border-emerald-200 hover:border-emerald-400 transition-colors"
              >
                {copied === "lcm" ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-5xl font-bold text-emerald-900 mt-2">
              {lcmResult}
            </p>
            <p className="text-xs text-emerald-500 mt-2">
              lcm({validNums.join(", ")}) = {lcmResult}
            </p>
          </div>
        </div>
      )}

      {!hasResult && (
        <div className="text-center py-8 text-gray-400 text-sm">
          Enter at least 2 positive integers to see results.
        </div>
      )}

      {/* Euclidean Algorithm Steps */}
      {hasResult && euclidPairs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Euclidean Algorithm — GCD Steps
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Repeatedly replace (a, b) with (b, a mod b) until remainder = 0.
          </p>

          <div className="space-y-5">
            {euclidPairs.map(({ label, steps }, pairIdx) => (
              <div key={pairIdx}>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {label}
                </p>
                {steps.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    Numbers are equal; GCD = {validNums[pairIdx]}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                          <th className="text-left px-3 py-2 border border-gray-100 font-medium">
                            Step
                          </th>
                          <th className="text-left px-3 py-2 border border-gray-100 font-medium">
                            Division
                          </th>
                          <th className="text-left px-3 py-2 border border-gray-100 font-medium">
                            Remainder
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {steps.map((s, i) => (
                          <tr
                            key={i}
                            className={
                              i % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-3 py-2 border border-gray-100 text-gray-500">
                              {i + 1}
                            </td>
                            <td className="px-3 py-2 border border-gray-100 font-mono">
                              {s.a} = {s.b} × {s.quotient} + {s.remainder}
                            </td>
                            <td className="px-3 py-2 border border-gray-100 font-mono">
                              {s.remainder === 0 ? (
                                <span className="text-blue-600 font-semibold">
                                  0 → GCD = {s.b}
                                </span>
                              ) : (
                                s.remainder
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prime Factorization */}
      {hasResult && factorMaps.length >= 2 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Prime Factorization Method
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            GCD uses the lowest exponents of common primes; LCM uses the
            highest exponents of all primes.
          </p>

          {/* Per-number factorizations */}
          <div className="mb-4 space-y-1">
            {factorMaps.map(({ n, factors }) => (
              <div key={n} className="flex items-baseline gap-2 text-sm">
                <span className="font-semibold text-gray-700 w-14 shrink-0">
                  {n} =
                </span>
                <span className="font-mono text-gray-600">
                  {formatFactorization(factors)}
                </span>
              </div>
            ))}
          </div>

          {/* Prime table */}
          {allPrimes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <th className="text-left px-3 py-2 border border-gray-100 font-medium">
                      Number
                    </th>
                    {allPrimes.map((p) => (
                      <th
                        key={p}
                        className="text-center px-3 py-2 border border-gray-100 font-medium"
                      >
                        {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {factorMaps.map(({ n, factors }, i) => (
                    <tr key={n} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 border border-gray-100 font-semibold text-gray-700">
                        {n}
                      </td>
                      {allPrimes.map((p) => {
                        const exp = factors.get(p) ?? 0;
                        return (
                          <td
                            key={p}
                            className="text-center px-3 py-2 border border-gray-100 font-mono"
                          >
                            {exp > 0 ? (
                              <span className="text-gray-800">
                                {exp === 1 ? p : `${p}^${exp}`}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* GCD row */}
                  <tr className="bg-blue-50 font-semibold">
                    <td className="px-3 py-2 border border-gray-100 text-blue-700">
                      GCD
                    </td>
                    {allPrimes.map((p) => {
                      const exps = factorMaps.map(
                        ({ factors }) => factors.get(p) ?? 0
                      );
                      const minExp = Math.min(...exps);
                      return (
                        <td
                          key={p}
                          className="text-center px-3 py-2 border border-gray-100 font-mono text-blue-700"
                        >
                          {minExp > 0 ? (
                            minExp === 1 ? p : `${p}^${minExp}`
                          ) : (
                            <span className="text-blue-200">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {/* LCM row */}
                  <tr className="bg-emerald-50 font-semibold">
                    <td className="px-3 py-2 border border-gray-100 text-emerald-700">
                      LCM
                    </td>
                    {allPrimes.map((p) => {
                      const exps = factorMaps.map(
                        ({ factors }) => factors.get(p) ?? 0
                      );
                      const maxExp = Math.max(...exps);
                      return (
                        <td
                          key={p}
                          className="text-center px-3 py-2 border border-gray-100 font-mono text-emerald-700"
                        >
                          {maxExp > 0 ? (
                            maxExp === 1 ? p : `${p}^${maxExp}`
                          ) : (
                            <span className="text-emerald-200">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Result equations */}
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm font-mono text-blue-800">
              GCD = {allPrimes
                .map((p) => {
                  const exps = factorMaps.map(({ factors }) => factors.get(p) ?? 0);
                  const minExp = Math.min(...exps);
                  return minExp > 0
                    ? minExp === 1 ? `${p}` : `${p}^${minExp}`
                    : null;
                })
                .filter(Boolean)
                .join(" × ") || "1"}{" "}
              = {gcdResult}
            </div>
            <div className="bg-emerald-50 rounded-lg px-4 py-3 text-sm font-mono text-emerald-800">
              LCM = {allPrimes
                .map((p) => {
                  const exps = factorMaps.map(({ factors }) => factors.get(p) ?? 0);
                  const maxExp = Math.max(...exps);
                  return maxExp > 0
                    ? maxExp === 1 ? `${p}` : `${p}^${maxExp}`
                    : null;
                })
                .filter(Boolean)
                .join(" × ") || "1"}{" "}
              = {lcmResult}
            </div>
          </div>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this GCD & LCM Calculator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Calculate Greatest Common Divisor and Least Common Multiple. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this GCD & LCM Calculator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Calculate Greatest Common Divisor and Least Common Multiple. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
