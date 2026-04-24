"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { EMOJIS, CATEGORIES, type Emoji, type EmojiCategory } from "../lib/emoji-data";

const RECENT_KEY = "emoji-search-recent";
const MAX_RECENT = 12;

function getCodepoint(emoji: string): string {
  return [...emoji]
    .map((c) => "U+" + c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0"))
    .join(" ");
}

function loadRecent(): Emoji[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const names: string[] = JSON.parse(raw);
    return names
      .map((name) => EMOJIS.find((e) => e.name === name))
      .filter(Boolean) as Emoji[];
  } catch {
    return [];
  }
}

function saveRecent(emoji: Emoji, current: Emoji[]): Emoji[] {
  const filtered = current.filter((e) => e.name !== emoji.name);
  const next = [emoji, ...filtered].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next.map((e) => e.name)));
  } catch {}
  return next;
}

interface ToastState {
  id: number;
  emoji: string;
}

export default function EmojiSearch() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<EmojiCategory | "All">("All");
  const [recent, setRecent] = useState<Emoji[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [hoveredEmoji, setHoveredEmoji] = useState<Emoji | null>(null);

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EMOJIS.filter((e) => {
      const matchCategory =
        activeCategory === "All" || e.category === activeCategory;
      if (!matchCategory) return false;
      if (!q) return true;
      return (
        e.name.includes(q) ||
        e.keywords.some((k) => k.includes(q))
      );
    });
  }, [query, activeCategory]);

  const handleCopy = useCallback(
    async (emoji: Emoji) => {
      try {
        await navigator.clipboard.writeText(emoji.emoji);
      } catch {
        // fallback: create temp input
        const el = document.createElement("textarea");
        el.value = emoji.emoji;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setRecent((prev) => saveRecent(emoji, prev));
      setToast({ id: Date.now(), emoji: emoji.emoji });
    },
    []
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="w-full">
      {/* Toast */}
      {toast && (
        <div
          key={toast.id}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg flex items-center gap-2 animate-fade-in"
        >
          <span className="text-xl">{toast.emoji}</span>
          <span>Copied!</span>
        </div>
      )}

      {/* Search */}
      <div className="mb-5">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1 0 3 9.5a7.5 7.5 0 0 0 13.65 7.15z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search emojis by name or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["All", ...CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat as EmojiCategory | "All")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recently Copied */}
      {recent.length > 0 && !query && activeCategory === "All" && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Recently Copied
          </h2>
          <div className="flex flex-wrap gap-2">
            {recent.map((e) => (
              <button
                key={e.name}
                onClick={() => handleCopy(e)}
                onMouseEnter={() => setHoveredEmoji(e)}
                onMouseLeave={() => setHoveredEmoji(null)}
                title={`${e.name} · ${getCodepoint(e.emoji)}`}
                className="w-12 h-12 flex items-center justify-center text-2xl rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
              >
                {e.emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Info Bar */}
      {hoveredEmoji && (
        <div className="mb-4 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
          <span className="text-3xl">{hoveredEmoji.emoji}</span>
          <div>
            <div className="font-semibold text-gray-800 capitalize">{hoveredEmoji.name}</div>
            <div className="text-xs text-gray-500 font-mono">{getCodepoint(hoveredEmoji.emoji)}</div>
          </div>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {hoveredEmoji.category}
          </span>
        </div>
      )}

      {/* Result Count */}
      <div className="text-sm text-gray-500 mb-3">
        {query || activeCategory !== "All"
          ? `${filtered.length} emoji${filtered.length !== 1 ? "s" : ""} found`
          : `${EMOJIS.length} emojis total`}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🔍</div>
          <p className="text-lg font-medium">No emojis found</p>
          <p className="text-sm">Try a different keyword</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-1.5">
          {filtered.map((e) => (
            <button
              key={e.name}
              onClick={() => handleCopy(e)}
              onMouseEnter={() => setHoveredEmoji(e)}
              onMouseLeave={() => setHoveredEmoji(null)}
              title={`${e.name} · ${getCodepoint(e.emoji)}`}
              className="w-14 h-14 flex items-center justify-center text-3xl rounded-xl hover:bg-gray-100 active:scale-95 transition cursor-pointer select-none"
            >
              {e.emoji}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease-out;
        }
      `}</style>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Emoji Search tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Search and copy emojis by name or keyword. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Emoji Search tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Search and copy emojis by name or keyword. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
