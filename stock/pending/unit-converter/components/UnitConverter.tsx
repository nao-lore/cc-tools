"use client";

import { useState, useCallback } from "react";
import {
  CATEGORIES,
  CategoryKey,
  convertLinear,
  convertTemperature,
  formatNumber,
} from "../lib/units";

function ArrowsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path
        fillRule="evenodd"
        d="M13.2 2.24a.75.75 0 0 0 .04 1.06l2.1 1.95H6.75a.75.75 0 0 0 0 1.5h8.59l-2.1 1.95a.75.75 0 1 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 0 0-1.06.04Zm-6.4 8a.75.75 0 0 0-1.06-.04l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 1 0 1.02-1.1l-2.1-1.95h8.59a.75.75 0 0 0 0-1.5H4.66l2.1-1.95a.75.75 0 0 0 .04-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function UnitConverter() {
  const [activeCat, setActiveCat] = useState<CategoryKey>("length");
  const [fromKey, setFromKey] = useState<string>("m");
  const [toKey, setToKey] = useState<string>("ft");
  const [fromVal, setFromVal] = useState<string>("");
  const [toVal, setToVal] = useState<string>("");

  const category = CATEGORIES.find((c) => c.key === activeCat)!;

  // Resolve selected units (fallback to first two when category changes)
  const fromUnit = category.units.find((u) => u.key === fromKey) ?? category.units[0];
  const toUnit = category.units.find((u) => u.key === toKey) ?? category.units[1];

  const doConvert = useCallback(
    (value: string, direction: "from" | "to") => {
      const num = parseFloat(value);
      if (value === "" || isNaN(num)) {
        if (direction === "from") setToVal("");
        else setFromVal("");
        return;
      }

      if (category.isTemperature) {
        if (direction === "from") {
          const result = convertTemperature(num, fromUnit.key, toUnit.key);
          setToVal(formatNumber(result));
        } else {
          const result = convertTemperature(num, toUnit.key, fromUnit.key);
          setFromVal(formatNumber(result));
        }
      } else {
        if (direction === "from") {
          const result = convertLinear(num, fromUnit, toUnit);
          setToVal(formatNumber(result));
        } else {
          const result = convertLinear(num, toUnit, fromUnit);
          setFromVal(formatNumber(result));
        }
      }
    },
    [category, fromUnit, toUnit]
  );

  const handleFromChange = (v: string) => {
    setFromVal(v);
    doConvert(v, "from");
  };

  const handleToChange = (v: string) => {
    setToVal(v);
    doConvert(v, "to");
  };

  const handleSwap = () => {
    setFromKey(toUnit.key);
    setToKey(fromUnit.key);
    setFromVal(toVal);
    // Recalculate: new "from" value converts to new "to"
    const num = parseFloat(toVal);
    if (!isNaN(num) && toVal !== "") {
      const newFrom = category.units.find((u) => u.key === toUnit.key)!;
      const newTo = category.units.find((u) => u.key === fromUnit.key)!;
      if (category.isTemperature) {
        setToVal(formatNumber(convertTemperature(num, newFrom.key, newTo.key)));
      } else {
        setToVal(formatNumber(convertLinear(num, newFrom, newTo)));
      }
    } else {
      setToVal("");
    }
  };

  const handleCategoryChange = (key: CategoryKey) => {
    setActiveCat(key);
    const cat = CATEGORIES.find((c) => c.key === key)!;
    setFromKey(cat.units[0].key);
    setToKey(cat.units[1].key);
    setFromVal("");
    setToVal("");
  };

  const handleFromUnitChange = (key: string) => {
    setFromKey(key);
    // Recompute toVal from current fromVal
    const num = parseFloat(fromVal);
    if (!isNaN(num) && fromVal !== "") {
      const newFrom = category.units.find((u) => u.key === key)!;
      if (category.isTemperature) {
        setToVal(formatNumber(convertTemperature(num, newFrom.key, toUnit.key)));
      } else {
        setToVal(formatNumber(convertLinear(num, newFrom, toUnit)));
      }
    }
  };

  const handleToUnitChange = (key: string) => {
    setToKey(key);
    // Recompute toVal from current fromVal
    const num = parseFloat(fromVal);
    if (!isNaN(num) && fromVal !== "") {
      const newTo = category.units.find((u) => u.key === key)!;
      if (category.isTemperature) {
        setToVal(formatNumber(convertTemperature(num, fromUnit.key, newTo.key)));
      } else {
        setToVal(formatNumber(convertLinear(num, fromUnit, newTo)));
      }
    }
  };

  // Quick reference: all units converted from the current fromVal
  const quickRefValue = parseFloat(fromVal);
  const hasQuickRef = !isNaN(quickRefValue) && fromVal !== "";

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCat === cat.key
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Converter card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-700 mb-5">
          {category.label} Converter
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {/* From */}
          <div className="flex-1 space-y-2">
            <select
              value={fromUnit.key}
              onChange={(e) => handleFromUnitChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              {category.units.map((u) => (
                <option key={u.key} value={u.key}>
                  {u.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={fromVal}
              onChange={(e) => handleFromChange(e.target.value)}
              placeholder="Enter value"
              className="w-full font-mono text-xl px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Swap button */}
          <div className="flex items-center justify-center sm:pt-8">
            <button
              onClick={handleSwap}
              className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors border border-blue-200"
              title="Swap units"
            >
              <ArrowsIcon />
            </button>
          </div>

          {/* To */}
          <div className="flex-1 space-y-2">
            <select
              value={toUnit.key}
              onChange={(e) => handleToUnitChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              {category.units.map((u) => (
                <option key={u.key} value={u.key}>
                  {u.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={toVal}
              onChange={(e) => handleToChange(e.target.value)}
              placeholder="Result"
              className="w-full font-mono text-xl px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Quick reference */}
      {hasQuickRef && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Quick Reference — {formatNumber(quickRefValue)} {fromUnit.label}
          </h3>
          <div className="divide-y divide-gray-100">
            {category.units
              .filter((u) => u.key !== fromUnit.key)
              .map((u) => {
                let result: number;
                if (category.isTemperature) {
                  result = convertTemperature(quickRefValue, fromUnit.key, u.key);
                } else {
                  result = convertLinear(quickRefValue, fromUnit, u);
                }
                return (
                  <div
                    key={u.key}
                    className={`flex items-center justify-between py-2.5 ${
                      u.key === toUnit.key ? "text-blue-700 font-semibold" : "text-gray-700"
                    }`}
                  >
                    <span className="text-sm">{u.label}</span>
                    <span className="font-mono text-sm tabular-nums">
                      {formatNumber(result)}
                    </span>
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Unit Converter tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Convert between various units of measurement. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Unit Converter tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Convert between various units of measurement. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
