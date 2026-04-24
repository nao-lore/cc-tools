"use client";

import { useState, useMemo } from "react";

type Mode = "angle" | "inverse";
type AngleUnit = "degrees" | "radians";

const COMMON_ANGLES = [
  { deg: 0,   label: "0°",   sin: "0",        cos: "1",        tan: "0"   },
  { deg: 30,  label: "30°",  sin: "1/2",      cos: "√3/2",     tan: "1/√3" },
  { deg: 45,  label: "45°",  sin: "√2/2",     cos: "√2/2",     tan: "1"   },
  { deg: 60,  label: "60°",  sin: "√3/2",     cos: "1/2",      tan: "√3"  },
  { deg: 90,  label: "90°",  sin: "1",        cos: "0",        tan: "∞"   },
  { deg: 120, label: "120°", sin: "√3/2",     cos: "-1/2",     tan: "-√3" },
  { deg: 180, label: "180°", sin: "0",        cos: "-1",       tan: "0"   },
  { deg: 270, label: "270°", sin: "-1",       cos: "0",        tan: "-∞"  },
];

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function fmt(n: number): string {
  if (!isFinite(n)) return "∞";
  if (Math.abs(n) < 1e-10) return "0";
  return parseFloat(n.toPrecision(8)).toString();
}

function fmtDeg(rad: number): string {
  const deg = (rad * 180) / Math.PI;
  return parseFloat(deg.toPrecision(6)).toString();
}

interface TrigValues {
  sin: number;
  cos: number;
  tan: number;
  sec: number;
  csc: number;
  cot: number;
}

function calcTrig(angleRad: number): TrigValues {
  const s = Math.sin(angleRad);
  const c = Math.cos(angleRad);
  const t = Math.tan(angleRad);
  return {
    sin: s,
    cos: c,
    tan: t,
    sec: 1 / c,
    csc: 1 / s,
    cot: c / s,
  };
}

// SVG unit circle props
const CX = 100;
const CY = 100;
const R = 72;

function UnitCircle({ angleRad }: { angleRad: number }) {
  const x = CX + R * Math.cos(angleRad);
  // SVG y-axis is flipped
  const y = CY - R * Math.sin(angleRad);

  // Reference triangle vertices
  const footX = CX + R * Math.cos(angleRad); // same x as point, but at center y
  const footY = CY;

  const sinLen = Math.abs(CY - y);
  const cosLen = Math.abs(footX - CX);

  return (
    <svg
      viewBox="0 0 200 200"
      width="200"
      height="200"
      className="mx-auto select-none"
    >
      {/* Axes */}
      <line x1="20" y1={CY} x2="180" y2={CY} stroke="#94a3b8" strokeWidth="1" />
      <line x1={CX} y1="20" x2={CX} y2="180" stroke="#94a3b8" strokeWidth="1" />
      {/* Axis labels */}
      <text x="175" y={CY - 4} fontSize="10" fill="#94a3b8">x</text>
      <text x={CX + 4} y="18" fontSize="10" fill="#94a3b8">y</text>

      {/* Unit circle */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#cbd5e1" strokeWidth="1.5" />

      {/* Reference triangle */}
      {/* Hypotenuse (angle line) */}
      <line
        x1={CX}
        y1={CY}
        x2={x}
        y2={y}
        stroke="#6366f1"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* cos leg (horizontal) */}
      <line
        x1={CX}
        y1={CY}
        x2={footX}
        y2={footY}
        stroke="#10b981"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />
      {/* sin leg (vertical) */}
      <line
        x1={footX}
        y1={footY}
        x2={x}
        y2={y}
        stroke="#f59e0b"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />

      {/* cos label */}
      {cosLen > 8 && (
        <text
          x={(CX + footX) / 2}
          y={CY + 12}
          fontSize="9"
          fill="#10b981"
          textAnchor="middle"
        >
          cos
        </text>
      )}
      {/* sin label */}
      {sinLen > 8 && (
        <text
          x={footX + (footX >= CX ? 10 : -10)}
          y={(CY + y) / 2 + 3}
          fontSize="9"
          fill="#f59e0b"
          textAnchor="middle"
        >
          sin
        </text>
      )}

      {/* Point on circle */}
      <circle cx={x} cy={y} r="4" fill="#6366f1" />

      {/* Quadrant labels */}
      <text x="145" y="55" fontSize="9" fill="#cbd5e1">I</text>
      <text x="48" y="55" fontSize="9" fill="#cbd5e1">II</text>
      <text x="45" y="155" fontSize="9" fill="#cbd5e1">III</text>
      <text x="145" y="155" fontSize="9" fill="#cbd5e1">IV</text>

      {/* Arc for angle */}
      {(() => {
        const arcR = 18;
        const startX = CX + arcR;
        const startY = CY;
        const endX = CX + arcR * Math.cos(angleRad);
        const endY = CY - arcR * Math.sin(angleRad);
        const largeArc = angleRad % (2 * Math.PI) > Math.PI ? 1 : 0;
        const sweep = angleRad >= 0 ? 0 : 1;
        return (
          <path
            d={`M ${startX} ${startY} A ${arcR} ${arcR} 0 ${largeArc} ${sweep} ${endX} ${endY}`}
            fill="none"
            stroke="#6366f1"
            strokeWidth="1.2"
            opacity="0.6"
          />
        );
      })()}
    </svg>
  );
}

const cardClass = "bg-surface rounded-2xl border border-border p-4";
const labelClass = "text-muted text-xs uppercase tracking-wide mb-1";
const valueClass = "font-mono text-sm font-semibold";

const inputClass =
  "w-full px-3 py-2 border border-border rounded-lg font-mono text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-surface transition-all";

export default function TrigonometryCalc() {
  const [mode, setMode] = useState<Mode>("angle");
  const [angleStr, setAngleStr] = useState("45");
  const [unit, setUnit] = useState<AngleUnit>("degrees");
  const [ratioStr, setRatioStr] = useState("0.5");

  const angleRad = useMemo(() => {
    const v = parseFloat(angleStr);
    if (isNaN(v)) return 0;
    return unit === "degrees" ? toRad(v) : v;
  }, [angleStr, unit]);

  const trig = useMemo(() => calcTrig(angleRad), [angleRad]);

  const ratio = useMemo(() => {
    const v = parseFloat(ratioStr);
    return isNaN(v) ? 0 : v;
  }, [ratioStr]);

  const inverseResults = useMemo(() => {
    return {
      arcsin:
        ratio >= -1 && ratio <= 1
          ? { rad: Math.asin(ratio), deg: fmtDeg(Math.asin(ratio)) }
          : null,
      arccos:
        ratio >= -1 && ratio <= 1
          ? { rad: Math.acos(ratio), deg: fmtDeg(Math.acos(ratio)) }
          : null,
      arctan: { rad: Math.atan(ratio), deg: fmtDeg(Math.atan(ratio)) },
    };
  }, [ratio]);

  const trigRows: { key: keyof TrigValues; label: string; color: string }[] = [
    { key: "sin", label: "sin", color: "text-amber-500" },
    { key: "cos", label: "cos", color: "text-emerald-500" },
    { key: "tan", label: "tan", color: "text-indigo-500" },
    { key: "sec", label: "sec", color: "text-rose-400" },
    { key: "csc", label: "csc", color: "text-sky-400" },
    { key: "cot", label: "cot", color: "text-purple-400" },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-4 p-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("angle")}
          className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-all ${
            mode === "angle"
              ? "bg-accent text-white"
              : "border border-border text-muted hover:bg-surface"
          }`}
        >
          Angle → Values
        </button>
        <button
          onClick={() => setMode("inverse")}
          className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-all ${
            mode === "inverse"
              ? "bg-accent text-white"
              : "border border-border text-muted hover:bg-surface"
          }`}
        >
          Inverse Trig
        </button>
      </div>

      {mode === "angle" ? (
        <>
          {/* Input */}
          <div className={cardClass}>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setUnit("degrees")}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  unit === "degrees"
                    ? "bg-accent text-white"
                    : "border border-border text-muted"
                }`}
              >
                Degrees
              </button>
              <button
                onClick={() => setUnit("radians")}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  unit === "radians"
                    ? "bg-accent text-white"
                    : "border border-border text-muted"
                }`}
              >
                Radians
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={angleStr}
                onChange={(e) => setAngleStr(e.target.value)}
                className={inputClass}
                placeholder={unit === "degrees" ? "Enter angle (°)" : "Enter angle (rad)"}
              />
              <span className="text-muted text-sm whitespace-nowrap">
                {unit === "degrees" ? "°" : "rad"}
              </span>
            </div>
            <p className="text-muted text-xs mt-2">
              {unit === "degrees"
                ? `= ${fmt(angleRad)} rad`
                : `= ${fmt((angleRad * 180) / Math.PI)}°`}
            </p>
          </div>

          {/* Unit circle */}
          <div className={cardClass}>
            <p className={labelClass}>Unit Circle</p>
            <UnitCircle angleRad={angleRad} />
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-0.5 bg-emerald-500 rounded" />
                <span className="text-muted">cos</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-0.5 bg-amber-500 rounded" />
                <span className="text-muted">sin</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-0.5 bg-indigo-500 rounded" />
                <span className="text-muted">hyp</span>
              </span>
            </div>
          </div>

          {/* Results grid */}
          <div className={cardClass}>
            <p className={labelClass}>Trig Functions</p>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {trigRows.map(({ key, label, color }) => (
                <div key={key} className="bg-surface border border-border rounded-xl p-3">
                  <p className={`text-xs font-semibold mb-1 ${color}`}>{label}</p>
                  <p className={`${valueClass} text-xs break-all`}>{fmt(trig[key])}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Common angles reference */}
          <div className={cardClass}>
            <p className={labelClass}>Common Angles Reference</p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted">
                    <th className="text-left py-1 pr-2">Angle</th>
                    <th className="text-right py-1 px-2">sin</th>
                    <th className="text-right py-1 px-2">cos</th>
                    <th className="text-right py-1 px-2">tan</th>
                  </tr>
                </thead>
                <tbody>
                  {COMMON_ANGLES.map((a) => (
                    <tr
                      key={a.deg}
                      className="border-t border-border cursor-pointer hover:bg-accent/5 transition-colors"
                      onClick={() => {
                        setUnit("degrees");
                        setAngleStr(String(a.deg));
                      }}
                    >
                      <td className="py-1.5 pr-2 font-semibold text-accent">{a.label}</td>
                      <td className="py-1.5 px-2 text-right font-mono text-amber-500">{a.sin}</td>
                      <td className="py-1.5 px-2 text-right font-mono text-emerald-500">{a.cos}</td>
                      <td className="py-1.5 px-2 text-right font-mono text-indigo-500">{a.tan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Inverse input */}
          <div className={cardClass}>
            <p className={labelClass}>Input Ratio</p>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                value={ratioStr}
                onChange={(e) => setRatioStr(e.target.value)}
                step="0.01"
                className={inputClass}
                placeholder="Enter value (e.g. 0.5)"
              />
            </div>
            <p className="text-muted text-xs mt-1">
              arcsin/arccos valid for −1 to 1; arctan accepts any value
            </p>
          </div>

          {/* Inverse results */}
          <div className={cardClass}>
            <p className={labelClass}>Inverse Results</p>
            <div className="space-y-3 mt-2">
              {(
                [
                  { key: "arcsin" as const, label: "arcsin", color: "text-amber-500" },
                  { key: "arccos" as const, label: "arccos", color: "text-emerald-500" },
                  { key: "arctan" as const, label: "arctan", color: "text-indigo-500" },
                ] as const
              ).map(({ key, label, color }) => {
                const res = inverseResults[key];
                return (
                  <div key={key} className="flex items-center justify-between border border-border rounded-xl p-3">
                    <span className={`font-semibold text-sm ${color}`}>{label}({ratioStr})</span>
                    {res ? (
                      <div className="text-right">
                        <p className={`${valueClass} text-sm`}>{res.deg}°</p>
                        <p className="text-muted text-xs font-mono">{fmt(res.rad)} rad</p>
                      </div>
                    ) : (
                      <span className="text-muted text-sm italic">out of range</span>
                    )}
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Trigonometry Calculator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Calculate all trig functions and inverse trig in degrees or radians. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Trigonometry Calculator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Calculate all trig functions and inverse trig in degrees or radians. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
                );
              })}
            </div>
          </div>

          {/* Unit circle for inverse — show arctan angle */}
          <div className={cardClass}>
            <p className={labelClass}>Unit Circle (arctan)</p>
            <UnitCircle angleRad={inverseResults.arctan.rad} />
          </div>
        </>
      )}

      {/* Ad placeholder */}
      <div className="rounded-2xl border border-border border-dashed flex items-center justify-center h-20 text-muted text-xs">
        Advertisement
      </div>
    </div>
  );
}
