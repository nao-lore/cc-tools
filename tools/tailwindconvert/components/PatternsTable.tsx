"use client";

import { useState } from "react";
import { commonPatterns } from "../lib/mappings";

const categories = Array.from(
  new Set(commonPatterns.map((p) => p.category))
);

export default function PatternsTable() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered =
    activeCategory === "all"
      ? commonPatterns
      : commonPatterns.filter((p) => p.category === activeCategory);

  return (
    <div>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            activeCategory === "all"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              activeCategory === cat
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-700 w-1/6">
                Category
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 w-5/12">
                CSS
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 w-5/12">
                Tailwind
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((pattern, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2.5">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                    {pattern.category}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <code className="text-xs bg-gray-900 text-gray-200 px-2 py-1 rounded font-mono">
                    {pattern.css}
                  </code>
                </td>
                <td className="px-4 py-2.5">
                  <code className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-mono">
                    {pattern.tailwind}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
