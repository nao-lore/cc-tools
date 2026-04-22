"use client";

import { useState, useMemo } from "react";

// ── Pure math helpers ──────────────────────────────────────────────────────

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

interface Factor {
  base: number;
  exp: number;
}

function primeFactors(n: number): Factor[] {
  const factors: Factor[] = [];
  let d = 2;
  while (d * d <= n) {
    if (n % d === 0) {
      let exp = 0;
      while (n % d === 0) {
        exp++;
        n = Math.floor(n / d);
      }
      factors.push({ base: d, exp });
    }
    d++;
  }
  if (n > 1) factors.push({ base: n, exp: 1 });
  return factors;
}

// Sieve of Eratosthenes — returns all primes up to limit
function sieve(limit: number): number[] {
  if (limit < 2) return [];
  const composite = new Uint8Array(limit + 1);
  composite[0] = 1;
  composite[1] = 1;
  for (let i = 2; i * i <= limit; i++) {
    if (!composite[i]) {
      for (let j = i * i; j <= limit; j += i) {
        composite[j] = 1;
      }
    }
  }
  const primes: number[] = [];
  for (let i = 2; i <= limit; i++) {
    if (!composite[i]) primes.push(i);
  }
  return primes;
}

// ── Factorization tree display ─────────────────────────────────────────────

function FactorTree({ n, factors }: { n: number; factors: Factor[] }) {
  const parts = factors.map(({ base, exp }) =>
    exp === 1 ? String(base) : `${base}^${exp}`
  );
  return (
    <div className="font-mono text-lg text-gray-800 flex flex-wrap items-center gap-1">
      <span className="font-bold">{n}</span>
      <span className="text-gray-400">=</span>
      {factors.map(({ base, exp }, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-400">×</span>}
          <span className="inline-flex items-start">
            <span className="text-blue-700 font-semibold">{base}</span>
            {exp > 1 && (
              <sup className="text-blue-500 text-xs font-bold ml-0.5">{exp}</sup>
            )}
          </span>
        </span>
      ))}
      {/* notation string below */}
      <span className="w-full text-xs text-gray-500 mt-1">
        = {parts.join(" × ")}
      </span>
    </div>
  );
}

// ── Tabs ───────────────────────────────────────────────────────────────────

type Mode = "check" | "generate";

// ── Main component ─────────────────────────────────────────────────────────

export default function PrimeChecker() {
  const [mode, setMode] = useState<Mode>("check");

  // Check mode state
  const [checkInput, setCheckInput] = useState("60");
  const [copiedCheck, setCopiedCheck] = useState(false);

  // Generate mode state
  const [limitInput, setLimitInput] = useState("100");
  const [copiedGen, setCopiedGen] = useState(false);

  // ── Check mode computation ─────────────────────────────────────────────
  const checkResult = useMemo(() => {
    const raw = checkInput.trim();
    if (!raw) return null;
    const n = parseInt(raw, 10);
    if (isNaN(n) || n < 0 || String(n) !== raw) return { error: "Enter a non-negative integer." };
    if (n > 1e13) return { error: "Number too large. Maximum is 10,000,000,000,000." };
    const prime = isPrime(n);
    const factors = prime || n < 2 ? [] : primeFactors(n);
    return { n, prime, factors };
  }, [checkInput]);

  // ── Generate mode computation ──────────────────────────────────────────
  const genResult = useMemo(() => {
    const raw = limitInput.trim();
    if (!raw) return null;
    const limit = parseInt(raw, 10);
    if (isNaN(limit) || limit < 2) return { error: "Enter an integer ≥ 2." };
    if (limit > 10_000_000) return { error: "Limit too large. Maximum is 10,000,000." };
    const primes = sieve(limit);
    return { limit, primes, count: primes.length };
  }, [limitInput]);

  // ── Copy handlers ──────────────────────────────────────────────────────
  const handleCopyCheck = () => {
    if (!checkResult || "error" in checkResult) return;
    const { n, prime, factors } = checkResult;
    let text = `${n} is ${prime ? "prime" : "composite"}.`;
    if (!prime && factors.length > 0) {
      const factStr = factors.map(({ base, exp }) => (exp === 1 ? String(base) : `${base}^${exp}`)).join(" × ");
      text += `\nPrime factorization: ${n} = ${factStr}`;
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCheck(true);
      setTimeout(() => setCopiedCheck(false), 2000);
    });
  };

  const handleCopyGen = () => {
    if (!genResult || "error" in genResult) return;
    const text = `Primes up to ${genResult.limit} (${genResult.count} total):\n${genResult.primes.join(", ")}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedGen(true);
      setTimeout(() => setCopiedGen(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(["check", "generate"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {m === "check" ? "Check Number" : "Generate Primes"}
          </button>
        ))}
      </div>

      {/* ── Check mode ── */}
      {mode === "check" && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number to check
            </label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full px-4 py-3 text-lg font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={checkInput}
              onChange={(e) => setCheckInput(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 60"
            />
          </div>

          {checkResult && "error" in checkResult && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
              {checkResult.error}
            </div>
          )}

          {checkResult && !("error" in checkResult) && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              {/* Prime / Composite badge */}
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold ${
                    checkResult.prime
                      ? "bg-green-100 text-green-800"
                      : checkResult.n < 2
                      ? "bg-gray-100 text-gray-600"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {checkResult.n < 2
                    ? "Neither prime nor composite"
                    : checkResult.prime
                    ? "Prime"
                    : "Composite"}
                </span>
                <span className="text-gray-500 text-sm">
                  {checkResult.n < 2
                    ? `${checkResult.n} is a special case`
                    : checkResult.prime
                    ? `${checkResult.n} has no divisors other than 1 and itself`
                    : `${checkResult.n} can be factored`}
                </span>
              </div>

              {/* Factorization tree */}
              {!checkResult.prime && checkResult.n >= 2 && checkResult.factors.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Prime Factorization
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <FactorTree n={checkResult.n} factors={checkResult.factors} />
                  </div>
                  {/* Factor breakdown table */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {checkResult.factors.map(({ base, exp }) => (
                      <div
                        key={base}
                        className="flex flex-col items-center bg-blue-50 border border-blue-100 rounded-lg py-3"
                      >
                        <span className="text-xl font-bold text-blue-700">{base}</span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          prime factor
                          {exp > 1 && `, appears ${exp}×`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleCopyCheck}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {copiedCheck ? "Copied!" : "Copy Result"}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Generate mode ── */}
      {mode === "generate" && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Generate all primes up to
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Maximum: 10,000,000. Uses the Sieve of Eratosthenes.
            </p>
            <input
              type="text"
              inputMode="numeric"
              className="w-full px-4 py-3 text-lg font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 100"
            />
          </div>

          {genResult && "error" in genResult && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
              {genResult.error}
            </div>
          )}

          {genResult && !("error" in genResult) && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
              {/* Summary */}
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 rounded-lg px-5 py-3 text-center">
                  <span className="block text-2xl font-bold text-blue-700">
                    {genResult.count.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    prime{genResult.count !== 1 ? "s" : ""} found
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  There are <strong>{genResult.count.toLocaleString()}</strong> prime
                  numbers up to{" "}
                  <strong>{genResult.limit.toLocaleString()}</strong>.
                  {genResult.count > 0 && (
                    <> Largest: <strong>{genResult.primes[genResult.primes.length - 1].toLocaleString()}</strong>.</>
                  )}
                </p>
              </div>

              {/* Copy button */}
              <div className="flex justify-end">
                <button
                  onClick={handleCopyGen}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {copiedGen ? "Copied!" : "Copy All Primes"}
                </button>
              </div>

              {/* Prime list */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Prime List
                </p>
                <div
                  className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-4"
                >
                  {genResult.primes.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 text-xs font-mono bg-white border border-gray-200 text-gray-700 rounded"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                {genResult.count > 5000 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Showing all {genResult.count.toLocaleString()} primes. Scroll to see more.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
