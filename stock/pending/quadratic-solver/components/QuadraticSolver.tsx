"use client";

import { useState, useCallback, useMemo } from "react";

interface Roots {
  type: "two-real" | "one-real" | "complex";
  r1: string;
  r2: string;
}

function fmt(n: number, digits = 4): string {
  const s = parseFloat(n.toFixed(digits));
  return String(s);
}

function sqrt(n: number): number {
  return Math.sqrt(Math.abs(n));
}

function computeRoots(a: number, b: number, c: number): Roots {
  const disc = b * b - 4 * a * c;
  if (disc > 0) {
    const r1 = (-b + Math.sqrt(disc)) / (2 * a);
    const r2 = (-b - Math.sqrt(disc)) / (2 * a);
    return { type: "two-real", r1: fmt(r1), r2: fmt(r2) };
  } else if (disc === 0) {
    const r = -b / (2 * a);
    return { type: "one-real", r1: fmt(r), r2: fmt(r) };
  } else {
    const re = -b / (2 * a);
    const im = sqrt(disc) / (2 * Math.abs(a));
    const reStr = fmt(re);
    const imStr = fmt(im);
    return {
      type: "complex",
      r1: `${reStr} + ${imStr}i`,
      r2: `${reStr} − ${imStr}i`,
    };
  }
}

function computeVertex(a: number, b: number, c: number): { x: number; y: number } {
  const x = -b / (2 * a);
  const y = a * x * x + b * x + c;
  return { x, y };
}

function ParabolaSVG({
  a,
  b,
  c,
  roots,
  vertex,
  disc,
}: {
  a: number;
  b: number;
  c: number;
  roots: Roots;
  vertex: { x: number; y: number };
  disc: number;
}) {
  const W = 400;
  const H = 280;
  const PAD = 32;

  // Determine x range around vertex
  const spread = Math.max(3, Math.abs(roots.type !== "complex" ? parseFloat(roots.r1) - parseFloat(roots.r2) : 4) * 0.8 + 2);
  const xMin = vertex.x - spread;
  const xMax = vertex.x + spread;

  // Sample y values to determine y range
  const xs: number[] = [];
  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    xs.push(xMin + (i / steps) * (xMax - xMin));
  }
  const ys = xs.map((x) => a * x * x + b * x + c);
  let yMin = Math.min(...ys);
  let yMax = Math.max(...ys);
  if (yMin === yMax) { yMin -= 1; yMax += 1; }
  const yPad = (yMax - yMin) * 0.15;
  yMin -= yPad;
  yMax += yPad;

  const toSVG = (x: number, y: number): [number, number] => {
    const sx = PAD + ((x - xMin) / (xMax - xMin)) * (W - 2 * PAD);
    const sy = PAD + ((yMax - y) / (yMax - yMin)) * (H - 2 * PAD);
    return [sx, sy];
  };

  // Build polyline points
  const points = xs.map((x, i) => toSVG(x, ys[i]).join(",")).join(" ");

  // Axes
  const [axisX0, axisX1] = [PAD, W - PAD];
  const [axisY0, axisY1] = [PAD, H - PAD];

  // y=0 line position
  const yZeroSY = toSVG(0, 0)[1];
  const xZeroSX = toSVG(0, 0)[0];

  const showXAxis = yZeroSY > PAD && yZeroSY < H - PAD;
  const showYAxis = xZeroSX > PAD && xZeroSX < W - PAD;

  // Vertex dot
  const [vx, vy] = toSVG(vertex.x, vertex.y);

  // Root dots
  const rootDots: [number, number][] = [];
  if (roots.type !== "complex") {
    const r1 = parseFloat(roots.r1);
    const r2 = parseFloat(roots.r2);
    rootDots.push(toSVG(r1, 0));
    if (roots.type === "two-real") rootDots.push(toSVG(r2, 0));
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full rounded-xl bg-gray-50 border border-border"
      aria-label="Parabola graph"
    >
      {/* Grid lines */}
      {showXAxis && (
        <line x1={axisX0} y1={yZeroSY} x2={axisX1} y2={yZeroSY} stroke="#d1d5db" strokeWidth="1" />
      )}
      {showYAxis && (
        <line x1={xZeroSX} y1={axisY0} x2={xZeroSX} y2={axisY1} stroke="#d1d5db" strokeWidth="1" />
      )}
      {/* Axis labels */}
      {showXAxis && <text x={axisX1 - 4} y={yZeroSY - 4} fontSize="10" fill="#9ca3af" textAnchor="end">x</text>}
      {showYAxis && <text x={xZeroSX + 4} y={axisY0 + 10} fontSize="10" fill="#9ca3af">y</text>}

      {/* Axis of symmetry */}
      <line
        x1={vx} y1={PAD} x2={vx} y2={H - PAD}
        stroke="#a5b4fc" strokeWidth="1" strokeDasharray="4 3"
      />

      {/* Parabola */}
      <polyline
        points={points}
        fill="none"
        stroke="#6366f1"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Root dots */}
      {rootDots.map(([rx, ry], i) => (
        <g key={i}>
          <circle cx={rx} cy={ry} r="5" fill="#f59e0b" stroke="white" strokeWidth="1.5" />
          <text x={rx} y={ry - 8} fontSize="9" fill="#b45309" textAnchor="middle">
            x{i + 1}
          </text>
        </g>
      ))}

      {/* Vertex dot */}
      <circle cx={vx} cy={vy} r="5" fill="#10b981" stroke="white" strokeWidth="1.5" />
      <text x={vx + 7} y={vy + 4} fontSize="9" fill="#065f46">V</text>

      {/* Legend */}
      <g>
        <circle cx={PAD + 4} cy={H - 10} r="4" fill="#10b981" />
        <text x={PAD + 11} y={H - 6} fontSize="9" fill="#6b7280">Vertex</text>
        <circle cx={PAD + 55} cy={H - 10} r="4" fill="#f59e0b" />
        <text x={PAD + 62} y={H - 6} fontSize="9" fill="#6b7280">Root(s)</text>
      </g>
    </svg>
  );
}

export default function QuadraticSolver() {
  const [aStr, setAStr] = useState("1");
  const [bStr, setBStr] = useState("-3");
  const [cStr, setCStr] = useState("2");
  const [solved, setSolved] = useState(false);
  const [error, setError] = useState("");

  const parseCoeff = (s: string): number | null => {
    const t = s.trim();
    if (t === "" || t === "-" || t === ".") return null;
    const n = parseFloat(t);
    return isNaN(n) ? null : n;
  };

  const handleSolve = useCallback(() => {
    setError("");
    const a = parseCoeff(aStr);
    const b = parseCoeff(bStr);
    const c = parseCoeff(cStr);
    if (a === null) { setError("a must be a valid number."); return; }
    if (a === 0) { setError("a ≠ 0. Use a linear equation solver for a=0."); return; }
    if (b === null) { setError("b must be a valid number."); return; }
    if (c === null) { setError("c must be a valid number."); return; }
    setSolved(true);
  }, [aStr, bStr, cStr]);

  const a = parseCoeff(aStr) ?? 1;
  const b = parseCoeff(bStr) ?? 0;
  const c = parseCoeff(cStr) ?? 0;
  const disc = b * b - 4 * a * c;
  const roots = useMemo(() => computeRoots(a, b, c), [a, b, c]);
  const vertex = useMemo(() => computeVertex(a, b, c), [a, b, c]);

  const eqStr = useMemo(() => {
    const aFmt = a === 1 ? "" : a === -1 ? "-" : `${fmt(a)}`;
    const bSign = b >= 0 ? "+" : "−";
    const cSign = c >= 0 ? "+" : "−";
    return `${aFmt}x² ${bSign} ${fmt(Math.abs(b))}x ${cSign} ${fmt(Math.abs(c))} = 0`;
  }, [a, b, c]);

  const openCard = "bg-surface rounded-2xl border border-border p-4";

  return (
    <div className="space-y-4">
      {/* Coefficient inputs */}
      <div className={openCard}>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Equation: ax² + bx + c = 0</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "a (x² coefficient)", val: aStr, set: setAStr },
            { label: "b (x coefficient)", val: bStr, set: setBStr },
            { label: "c (constant)", val: cStr, set: setCStr },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className="block text-xs text-muted mb-1">{label}</label>
              <input
                type="text"
                value={val}
                onChange={(e) => { set(e.target.value); setSolved(false); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSolve()}
                className="w-full px-3 py-2 border border-border rounded-lg font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors bg-white"
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          ))}
        </div>

        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

        <button
          onClick={handleSolve}
          className="mt-4 px-5 py-2 bg-accent text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
        >
          Solve
        </button>
      </div>

      {solved && (
        <>
          {/* Equation display */}
          <div className={`${openCard} text-center`}>
            <p className="text-xs text-muted mb-1">Equation</p>
            <p className="font-mono text-lg font-bold text-gray-800">{eqStr}</p>
          </div>

          {/* Key values grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Discriminant */}
            <div className={openCard}>
              <p className="text-xs text-muted mb-1">Discriminant (Δ = b² − 4ac)</p>
              <p className="font-mono text-xl font-bold text-gray-900">{fmt(disc)}</p>
              <p className="text-xs text-muted mt-1">
                {disc > 0 ? "Δ > 0 → two real roots" : disc === 0 ? "Δ = 0 → one real root" : "Δ < 0 → complex roots"}
              </p>
            </div>

            {/* Vertex */}
            <div className={openCard}>
              <p className="text-xs text-muted mb-1">Vertex</p>
              <p className="font-mono text-xl font-bold text-gray-900">
                ({fmt(vertex.x)}, {fmt(vertex.y)})
              </p>
              <p className="text-xs text-muted mt-1">
                {a > 0 ? "Opens upward (minimum)" : "Opens downward (maximum)"}
              </p>
            </div>

            {/* Axis of symmetry */}
            <div className={openCard}>
              <p className="text-xs text-muted mb-1">Axis of Symmetry</p>
              <p className="font-mono text-xl font-bold text-gray-900">x = {fmt(vertex.x)}</p>
              <p className="text-xs text-muted mt-1">x = −b / 2a</p>
            </div>
          </div>

          {/* Roots */}
          <div className={openCard}>
            <p className="text-xs text-muted mb-2">
              Roots ({roots.type === "two-real" ? "two real" : roots.type === "one-real" ? "one real (repeated)" : "complex conjugates"})
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-border">
                <p className="text-xs text-muted">x₁</p>
                <p className="font-mono text-base font-bold text-gray-900">{roots.r1}</p>
              </div>
              {roots.type === "two-real" || roots.type === "complex" ? (
                <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-border">
                  <p className="text-xs text-muted">x₂</p>
                  <p className="font-mono text-base font-bold text-gray-900">{roots.r2}</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Step-by-step */}
          <div className={openCard}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Step-by-step Solution</h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">1</span>
                <span>
                  Identify coefficients: <span className="font-mono">a = {fmt(a)}</span>,{" "}
                  <span className="font-mono">b = {fmt(b)}</span>,{" "}
                  <span className="font-mono">c = {fmt(c)}</span>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">2</span>
                <span>
                  Calculate discriminant:{" "}
                  <span className="font-mono">Δ = {fmt(b)}² − 4 × {fmt(a)} × {fmt(c)} = {fmt(b * b)} − {fmt(4 * a * c)} = {fmt(disc)}</span>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">3</span>
                <span>
                  Apply quadratic formula:{" "}
                  <span className="font-mono">x = (−b ± √Δ) / 2a = (−({fmt(b)}) ± √{fmt(disc)}) / (2 × {fmt(a)})</span>
                </span>
              </li>
              {roots.type === "complex" ? (
                <li className="flex gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">4</span>
                  <span>
                    Δ &lt; 0, so roots are complex:{" "}
                    <span className="font-mono">x = {fmt(-b / (2 * a))} ± {fmt(Math.sqrt(-disc) / (2 * Math.abs(a)))}i</span>
                  </span>
                </li>
              ) : (
                <li className="flex gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">4</span>
                  <span>
                    <span className="font-mono">x₁ = {roots.r1}</span>
                    {roots.type === "two-real" && <>, <span className="font-mono">x₂ = {roots.r2}</span></>}
                  </span>
                </li>
              )}
              <li className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">5</span>
                <span>
                  Vertex at{" "}
                  <span className="font-mono">x = −b / 2a = −({fmt(b)}) / (2 × {fmt(a)}) = {fmt(vertex.x)}</span>,{" "}
                  <span className="font-mono">y = {fmt(vertex.y)}</span>
                </span>
              </li>
            </ol>
          </div>

          {/* Parabola graph */}
          <div className={openCard}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Parabola Graph</h3>
            <ParabolaSVG a={a} b={b} c={c} roots={roots} vertex={vertex} disc={disc} />
            <p className="text-xs text-muted mt-2">
              Green dot = vertex, amber dot(s) = root(s), dashed line = axis of symmetry x = {fmt(vertex.x)}
            </p>
          </div>
        </>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Quadratic Equation Solver tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Solve quadratic equations and visualize the parabola. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Quadratic Equation Solver tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Solve quadratic equations and visualize the parabola. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Quadratic Equation Solver",
  "description": "Solve quadratic equations and visualize the parabola",
  "url": "https://tools.loresync.dev/quadratic-solver",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
