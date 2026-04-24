"use client";

import { useState } from "react";
import Link from "next/link";
import { tools } from "@/lib/tools-config";

const POPULAR_TOOLS = [
  "json-formatter",
  "text-diff",
  "regex-tester",
  "base64-tools",
  "uuid-generator",
  "color-converter",
];

export default function NotFound() {
  const [query, setQuery] = useState("");

  const popularTools = POPULAR_TOOLS.map((slug) =>
    tools.find((t) => t.slug === slug)
  ).filter(Boolean) as typeof tools;

  const searchResults =
    query.trim().length > 0
      ? tools.filter(
          (t) =>
            t.name.toLowerCase().includes(query.toLowerCase()) ||
            t.description.toLowerCase().includes(query.toLowerCase()) ||
            t.slug.toLowerCase().includes(query.toLowerCase())
        )
      : [];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center px-4 py-16">
      {/* 404 heading */}
      <p className="text-7xl font-black text-gray-800 select-none mb-2">404</p>
      <h1 className="text-2xl font-bold text-gray-100 mb-1">
        ページが見つかりません
      </h1>
      <p className="text-gray-400 text-sm mb-8">
        このURLは存在しないか、移動された可能性があります。
      </p>

      {/* Search bar */}
      <div className="w-full max-w-md mb-8">
        <input
          type="text"
          placeholder="ツールを検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          autoFocus
        />

        {searchResults.length > 0 && (
          <ul className="mt-2 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-700">
            {searchResults.slice(0, 6).map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={`/${tool.slug}`}
                  className="flex flex-col px-4 py-3 hover:bg-gray-700 transition"
                >
                  <span className="text-sm font-medium text-gray-100">
                    {tool.name}
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5">
                    {tool.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {query.trim().length > 0 && searchResults.length === 0 && (
          <p className="mt-2 text-sm text-gray-500 text-center">
            「{query}」に一致するツールが見つかりませんでした。
          </p>
        )}
      </div>

      {/* Popular tools */}
      {query.trim().length === 0 && (
        <div className="w-full max-w-md">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            よく使われるツール
          </p>
          <div className="grid grid-cols-2 gap-2">
            {popularTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/${tool.slug}`}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg px-3 py-2.5 transition"
              >
                <p className="text-sm font-medium text-gray-200 truncate">
                  {tool.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back to home */}
      <Link
        href="/"
        className="mt-10 text-sm text-indigo-400 hover:text-indigo-300 transition"
      >
        ← ホームに戻る
      </Link>
    </div>
  );
}
