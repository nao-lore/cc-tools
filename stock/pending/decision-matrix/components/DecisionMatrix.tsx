"use client";

import { useState, useMemo } from "react";

interface Criterion {
  id: string;
  name: string;
  weight: number;
}

interface Option {
  id: string;
  name: string;
}

type Scores = Record<string, Record<string, number>>;

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const DEFAULT_CRITERIA: Criterion[] = [
  { id: uid(), name: "Cost", weight: 8 },
  { id: uid(), name: "Quality", weight: 7 },
  { id: uid(), name: "Speed", weight: 5 },
];

const DEFAULT_OPTIONS: Option[] = [
  { id: uid(), name: "Option A" },
  { id: uid(), name: "Option B" },
  { id: uid(), name: "Option C" },
];

function buildDefaultScores(options: Option[], criteria: Criterion[]): Scores {
  const s: Scores = {};
  for (const o of options) {
    s[o.id] = {};
    for (const c of criteria) {
      s[o.id][c.id] = 5;
    }
  }
  return s;
}

export default function DecisionMatrix() {
  const [criteria, setCriteria] = useState<Criterion[]>(DEFAULT_CRITERIA);
  const [options, setOptions] = useState<Option[]>(DEFAULT_OPTIONS);
  const [scores, setScores] = useState<Scores>(() =>
    buildDefaultScores(DEFAULT_OPTIONS, DEFAULT_CRITERIA)
  );

  // Derived: weighted totals per option
  const totals = useMemo(() => {
    return options.map((o) => {
      const total = criteria.reduce((sum, c) => {
        const score = scores[o.id]?.[c.id] ?? 5;
        return sum + score * c.weight;
      }, 0);
      return { id: o.id, name: o.name, total };
    });
  }, [options, criteria, scores]);

  const maxTotal = useMemo(() => Math.max(...totals.map((t) => t.total), 1), [totals]);
  const ranked = useMemo(
    () => [...totals].sort((a, b) => b.total - a.total),
    [totals]
  );
  const winnerId = ranked[0]?.id;

  // --- Handlers ---
  function addOption() {
    const newOpt: Option = { id: uid(), name: `Option ${options.length + 1}` };
    setOptions((prev) => [...prev, newOpt]);
    setScores((prev) => {
      const next = { ...prev, [newOpt.id]: {} };
      for (const c of criteria) next[newOpt.id][c.id] = 5;
      return next;
    });
  }

  function removeOption(id: string) {
    if (options.length <= 1) return;
    setOptions((prev) => prev.filter((o) => o.id !== id));
    setScores((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function updateOptionName(id: string, name: string) {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, name } : o)));
  }

  function addCriterion() {
    const newC: Criterion = { id: uid(), name: `Criterion ${criteria.length + 1}`, weight: 5 };
    setCriteria((prev) => [...prev, newC]);
    setScores((prev) => {
      const next = { ...prev };
      for (const o of options) {
        next[o.id] = { ...(next[o.id] ?? {}), [newC.id]: 5 };
      }
      return next;
    });
  }

  function removeCriterion(id: string) {
    if (criteria.length <= 1) return;
    setCriteria((prev) => prev.filter((c) => c.id !== id));
    setScores((prev) => {
      const next = { ...prev };
      for (const oid of Object.keys(next)) {
        const updated = { ...next[oid] };
        delete updated[id];
        next[oid] = updated;
      }
      return next;
    });
  }

  function updateCriterionName(id: string, name: string) {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  }

  function updateCriterionWeight(id: string, weight: number) {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, weight } : c)));
  }

  function updateScore(optionId: string, criterionId: string, value: number) {
    const clamped = Math.min(10, Math.max(1, value));
    setScores((prev) => ({
      ...prev,
      [optionId]: { ...(prev[optionId] ?? {}), [criterionId]: clamped },
    }));
  }

  function handleReset() {
    const opts = [
      { id: uid(), name: "Option A" },
      { id: uid(), name: "Option B" },
      { id: uid(), name: "Option C" },
    ];
    const crits = [
      { id: uid(), name: "Cost", weight: 8 },
      { id: uid(), name: "Quality", weight: 7 },
      { id: uid(), name: "Speed", weight: 5 },
    ];
    setOptions(opts);
    setCriteria(crits);
    setScores(buildDefaultScores(opts, crits));
  }

  function exportCSV() {
    const header = ["Option", ...criteria.map((c) => `${c.name} (w=${c.weight})`), "Weighted Total", "Rank"];
    const rows = ranked.map((r, i) => {
      const o = options.find((o) => o.id === r.id)!;
      const cols = criteria.map((c) => scores[o.id]?.[c.id] ?? 5);
      return [o.name, ...cols, r.total, i + 1];
    });
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "decision-matrix.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const scoreColor = (v: number) => {
    if (v >= 8) return "bg-green-100 text-green-800 border-green-300";
    if (v >= 5) return "bg-yellow-50 text-yellow-800 border-yellow-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <div className="space-y-6">
      {/* Criteria config */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Criteria &amp; Weights</h2>
          <button
            onClick={addCriterion}
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
          >
            + Add Criterion
          </button>
        </div>
        <div className="space-y-3">
          {criteria.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <input
                type="text"
                value={c.name}
                onChange={(e) => updateCriterionName(c.id, e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Criterion name"
              />
              <div className="flex items-center gap-2 min-w-[160px]">
                <span className="text-xs text-gray-500 w-14 text-right">Weight: {c.weight}</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={c.weight}
                  onChange={(e) => updateCriterionWeight(c.id, Number(e.target.value))}
                  className="flex-1 accent-indigo-600"
                />
              </div>
              <button
                onClick={() => removeCriterion(c.id)}
                disabled={criteria.length <= 1}
                className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg leading-none px-1"
                title="Remove criterion"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Options config */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Options</h2>
          <button
            onClick={addOption}
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
          >
            + Add Option
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {options.map((o) => (
            <div key={o.id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
              <input
                type="text"
                value={o.name}
                onChange={(e) => updateOptionName(o.id, e.target.value)}
                className="bg-transparent text-sm text-gray-800 focus:outline-none w-24"
                placeholder="Option name"
              />
              <button
                onClick={() => removeOption(o.id)}
                disabled={options.length <= 1}
                className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base leading-none"
                title="Remove option"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Score matrix */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4 overflow-x-auto">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Score Matrix (1–10)</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4 min-w-[120px]">Option</th>
              {criteria.map((c) => (
                <th key={c.id} className="text-center text-xs text-gray-500 font-medium pb-3 px-2 min-w-[90px]">
                  <div>{c.name}</div>
                  <div className="text-gray-400 font-normal">w={c.weight}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {options.map((o) => (
              <tr key={o.id}>
                <td className="py-2 pr-4 text-sm font-medium text-gray-800 truncate max-w-[140px]">
                  {o.name || "—"}
                </td>
                {criteria.map((c) => {
                  const v = scores[o.id]?.[c.id] ?? 5;
                  return (
                    <td key={c.id} className="py-2 px-2 text-center">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={v}
                        onChange={(e) => updateScore(o.id, c.id, Number(e.target.value))}
                        className={`w-16 rounded-lg border px-2 py-1.5 text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${scoreColor(v)}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Results + Bar chart */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Results — Ranked</h2>
        <div className="space-y-3">
          {ranked.map((r, i) => {
            const pct = (r.total / maxTotal) * 100;
            const isWinner = r.id === winnerId;
            return (
              <div key={r.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isWinner
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={`font-medium ${isWinner ? "text-indigo-700" : "text-gray-700"}`}>
                      {r.name || "—"}
                    </span>
                    {isWinner && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                        Winner
                      </span>
                    )}
                  </div>
                  <span className={`font-bold tabular-nums ${isWinner ? "text-indigo-700" : "text-gray-600"}`}>
                    {r.total}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isWinner ? "bg-indigo-500" : "bg-gray-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Decision Matrix tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Weighted decision matrix for comparing options across criteria. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Decision Matrix tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Weighted decision matrix for comparing options across criteria. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 justify-end">
        <button
          onClick={handleReset}
          className="text-sm px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={exportCSV}
          className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
        >
          Export CSV
        </button>
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Decision Matrix",
  "description": "Weighted decision matrix for comparing options across criteria",
  "url": "https://tools.loresync.dev/decision-matrix",
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
