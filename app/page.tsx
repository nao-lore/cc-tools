"use client";

import { useState, useMemo } from "react";
import { tools } from "@/lib/tools-config";
import type { Tool } from "@/lib/tools-config";

const totalTools = tools.length;

// ── Category definitions ────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "AI・LLM ツール",   slug: "ai-tools",      icon: "✦", color: "#a78bfa" },
  { label: "SaaS 料金計算",    slug: "saas-pricing",   icon: "💲", color: "#34d399" },
  { label: "CSS・デザイン",    slug: "css-design",     icon: "🎨", color: "#fb923c" },
  { label: "テキスト・文字列", slug: "text-tools",     icon: "T",  color: "#60a5fa" },
  { label: "データ変換",       slug: "data-format",    icon: "⇄",  color: "#10b981" },
  { label: "エンコード・暗号", slug: "encoding",       icon: "#",  color: "#c084fc" },
  { label: "画像ツール",       slug: "image-tools",    icon: "⬜", color: "#22d3ee" },
  { label: "税金・確定申告",   slug: "tax-tools",      icon: "¥",  color: "#f87171" },
  { label: "生活・お金",       slug: "life-money",     icon: "🏠", color: "#fbbf24" },
  { label: "EC・配送",         slug: "ec-shipping",    icon: "📦", color: "#a3e635" },
  { label: "開発者ツール",     slug: "dev-tools",      icon: "</>" , color: "#ef4444" },
  { label: "数学・統計",       slug: "math-stats",     icon: "∑",  color: "#6366f1" },
] as const;

// Map config category strings → our slugs for the "全ツール一覧" badges
const CAT_SLUG_MAP: Record<string, string> = {
  "AI Tools":        "ai-tools",
  "SaaS Pricing":    "saas-pricing",
  "CSS Tools":       "css-design",
  "Color Tools":     "css-design",
  "Text & String Tools": "text-tools",
  "Data Format Tools":   "data-format",
  "Encoding & Decoding": "encoding",
  "Image Tools":         "image-tools",
  "Tax Tools":           "tax-tools",
  "Japanese Tools":      "life-money",
  "Business Tools":      "math-stats",
  "Developer Tools":     "dev-tools",
  "SEO Tools":           "dev-tools",
  "Minifier Tools":      "dev-tools",
  "Time & Date":         "dev-tools",
};

// ── Popular tools (hand-picked, diverse) ────────────────────────────────────
const POPULAR_SLUGS = [
  "json-formatter",
  "css-gradient",
  "regex-tester",
  "base64-tools",
  "password-generator",
  "qr-generator",
  "color-palette",
  "uuid-generator",
  "tax-calculator",
  "ai-coding-tool-comparison",
];

const popularTools = POPULAR_SLUGS
  .map((s) => tools.find((t) => t.slug === s))
  .filter((t): t is Tool => Boolean(t));

// ── Helpers ──────────────────────────────────────────────────────────────────
function MarketBadge({ market }: { market: "EN" | "JP" }) {
  return (
    <span
      className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
      style={
        market === "JP"
          ? { background: "rgba(239,68,68,0.15)", color: "#fca5a5" }
          : { background: "rgba(96,165,250,0.15)", color: "#93c5fd" }
      }
    >
      {market}
    </span>
  );
}

// ── Components ───────────────────────────────────────────────────────────────

function PopularCard({ tool }: { tool: Tool }) {
  const cat = CATEGORIES.find((c) => c.slug === CAT_SLUG_MAP[tool.category]);
  const accent = cat?.color ?? "#6366f1";
  return (
    <a
      href={`/${tool.slug}`}
      className="group flex flex-col gap-2 rounded-xl border border-white/[0.07] bg-gray-900 p-5 transition-all hover:border-white/20 hover:bg-gray-800"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-100 leading-snug group-hover:text-white transition-colors">
          {tool.name}
        </h3>
        <MarketBadge market={tool.market} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed flex-1">{tool.description}</p>
      <div
        className="h-0.5 rounded-full opacity-50 group-hover:opacity-80 transition-all"
        style={{ width: "2rem", background: accent }}
      />
    </a>
  );
}

function CategoryCard({ cat }: { cat: (typeof CATEGORIES)[number] }) {
  const count = tools.filter(
    (t) => CAT_SLUG_MAP[t.category] === cat.slug
  ).length;
  return (
    <a
      href={`/category/${cat.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-gray-900 px-4 py-3.5 transition-all hover:border-white/20 hover:bg-gray-800"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base font-bold"
        style={{ background: cat.color + "22", color: cat.color }}
      >
        {cat.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors truncate">
          {cat.label}
        </div>
        <div className="text-xs text-gray-600">{count} tools</div>
      </div>
      <svg
        className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}

function AllToolCard({ tool }: { tool: Tool }) {
  const cat = CATEGORIES.find((c) => c.slug === CAT_SLUG_MAP[tool.category]);
  const accent = cat?.color ?? "#6366f1";
  return (
    <a
      href={`/${tool.slug}`}
      className="group flex flex-col gap-1.5 rounded-lg border border-white/[0.06] bg-gray-900 p-4 transition-all hover:border-white/15 hover:bg-gray-800/80"
    >
      <div className="flex items-start justify-between gap-1.5">
        <h3
          className="text-sm font-medium text-gray-300 leading-snug group-hover:text-white transition-colors"
          style={{ wordBreak: "break-word" }}
        >
          {tool.name}
        </h3>
        <MarketBadge market={tool.market} />
      </div>
      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
        {tool.description}
      </p>
      <div
        className="mt-auto h-px rounded-full opacity-30 group-hover:opacity-60 transition-opacity"
        style={{ background: accent }}
      />
    </a>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [search, setSearch] = useState("");

  const filteredTools = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [search]);

  const isSearching = search.trim().length > 0;

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "無料オンラインツール集 — tools.loresync.dev",
            description: `${totalTools}以上の無料Webツール。開発・変換・計算・CSS生成まで登録不要。`,
            url: "https://tools.loresync.dev",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://tools.loresync.dev/?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">

        {/* ── Hero ── */}
        <header className="relative overflow-hidden border-b border-white/[0.06]">
          {/* subtle radial glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%)",
            }}
          />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              {totalTools}+ ツール — 登録不要・完全無料
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
              <span className="text-white">無料オンラインツール</span>
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl max-w-xl mx-auto mb-2">
              開発・変換・計算・デザインまで、すべてブラウザ上で完結。
            </p>
            <p className="text-gray-600 text-sm max-w-xl mx-auto">
              No signup · No ads · Data stays in your browser
            </p>

            {/* Search bar */}
            <div className="mt-10 max-w-2xl mx-auto relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ツールを検索… (例: json, css, base64, 税金)"
                className="w-full rounded-2xl border border-white/10 bg-gray-900 py-4 pl-12 pr-16 text-base text-gray-100 placeholder-gray-600 shadow-lg transition-all focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {filteredTools.length} 件 ✕
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1">
          {/* ── Show all-tools filtered grid when searching ── */}
          {isSearching ? (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {filteredTools.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-gray-500 text-lg">
                    &ldquo;{search}&rdquo; に一致するツールが見つかりません
                  </p>
                  <button
                    onClick={() => setSearch("")}
                    className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                  >
                    検索をクリア
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-6">
                    {filteredTools.length} 件のツールが見つかりました
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredTools.map((t) => (
                      <AllToolCard key={t.slug} tool={t} />
                    ))}
                  </div>
                </>
              )}
            </section>
          ) : (
            <>
              {/* ── 人気ツール ── */}
              <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-5 w-1 rounded-full bg-indigo-500" />
                  <h2 className="text-lg font-bold text-white">人気ツール</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {popularTools.map((t) => (
                    <PopularCard key={t.slug} tool={t} />
                  ))}
                </div>
              </section>

              {/* divider */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="border-t border-white/[0.05]" />
              </div>

              {/* ── カテゴリ ── */}
              <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-5 w-1 rounded-full bg-emerald-500" />
                  <h2 className="text-lg font-bold text-white">カテゴリ</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {CATEGORIES.map((cat) => (
                    <CategoryCard key={cat.slug} cat={cat} />
                  ))}
                </div>
              </section>

              {/* divider */}
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="border-t border-white/[0.05]" />
              </div>

              {/* ── 全ツール一覧 ── */}
              <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-1 rounded-full bg-amber-500" />
                    <h2 className="text-lg font-bold text-white">全ツール一覧</h2>
                  </div>
                  <span className="text-sm text-gray-600">{totalTools} tools</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {tools.map((t) => (
                    <AllToolCard key={t.slug} tool={t} />
                  ))}
                </div>
              </section>
            </>
          )}
        </main>

        {/* ── Footer ── */}
        <footer className="border-t border-white/[0.06] bg-gray-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-semibold text-gray-400">tools.loresync.dev</span>
                <span>·</span>
                <span>{totalTools}+ 無料ツール</span>
                <span>·</span>
                <span>Built with AI</span>
              </div>
              <div className="flex items-center gap-5 text-sm">
                <a
                  href="https://loresync.dev"
                  className="text-gray-600 hover:text-gray-300 transition-colors"
                >
                  loresync.dev
                </a>
                <a
                  href="mailto:nao@loresync.dev"
                  className="text-gray-600 hover:text-gray-300 transition-colors"
                >
                  nao@loresync.dev
                </a>
                <a
                  href="https://github.com/nao-lore"
                  className="text-gray-600 hover:text-gray-300 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
