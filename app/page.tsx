"use client";

import { useState, useMemo } from "react";

interface Tool {
  slug: string;
  url: string;
  name: string;
  description: string;
  market: "EN" | "JP";
}

interface Category {
  name: string;
  color: string;
  tools: Tool[];
}

const categories: Category[] = [
  {
    name: "Text & String Tools",
    color: "#3b82f6",
    tools: [
      { slug: "mdtable", url: "/mdtable", name: "Markdown Table Generator", description: "Create and edit Markdown tables visually", market: "EN" },
      { slug: "text-diff", url: "/text-diff", name: "Text Diff Checker", description: "Compare two texts and highlight differences", market: "EN" },
      { slug: "word-counter", url: "/word-counter", name: "Word & Character Counter", description: "Count words, characters, sentences, and paragraphs", market: "EN" },
      { slug: "markdown-preview", url: "/markdown-preview", name: "Markdown Live Preview", description: "Write Markdown and preview rendered output in real time", market: "EN" },
      { slug: "dummy-text", url: "/dummy-text", name: "Placeholder Text Generator", description: "Generate lorem ipsum and other placeholder text", market: "EN" },
      { slug: "ascii-art", url: "/ascii-art", name: "ASCII Art Generator", description: "Convert text into ASCII art with various fonts", market: "EN" },
    ],
  },
  {
    name: "Data Format Tools",
    color: "#10b981",
    tools: [
      { slug: "json-formatter", url: "/json-formatter", name: "JSON Formatter & Validator", description: "Format, validate, and beautify JSON data", market: "EN" },
      { slug: "json-to-csv", url: "/json-to-csv", name: "JSON to CSV Converter", description: "Convert JSON arrays to CSV format", market: "EN" },
      { slug: "yaml-to-json", url: "/yaml-to-json", name: "YAML to JSON Converter", description: "Convert between YAML and JSON formats", market: "EN" },
      { slug: "xml-formatter", url: "/xml-formatter", name: "XML Formatter", description: "Format and prettify XML documents", market: "EN" },
      { slug: "sql-formatter", url: "/sql-formatter", name: "SQL Formatter", description: "Format and beautify SQL queries", market: "EN" },
      { slug: "html-to-markdown", url: "/html-to-markdown", name: "HTML to Markdown", description: "Convert HTML markup to Markdown syntax", market: "EN" },
    ],
  },
  {
    name: "Encoding & Decoding",
    color: "#8b5cf6",
    tools: [
      { slug: "base64-tools", url: "/base64-tools", name: "Base64 Encoder/Decoder", description: "Encode and decode Base64 strings", market: "EN" },
      { slug: "url-encoder", url: "/url-encoder", name: "URL Encoder/Decoder", description: "Encode and decode URL components", market: "EN" },
      { slug: "html-entity", url: "/html-entity", name: "HTML Entity Encoder", description: "Encode and decode HTML entities", market: "EN" },
      { slug: "jwt-decoder", url: "/jwt-decoder", name: "JWT Decoder", description: "Decode and inspect JSON Web Tokens", market: "EN" },
      { slug: "image-to-base64", url: "/image-to-base64", name: "Image to Base64", description: "Convert images to Base64 encoded strings", market: "EN" },
      { slug: "hash-generator", url: "/hash-generator", name: "Hash Generator", description: "Generate MD5, SHA-1, SHA-256, and other hashes", market: "EN" },
      { slug: "binary-converter", url: "/binary-converter", name: "Binary/Decimal/Hex Converter", description: "Convert between binary, decimal, and hexadecimal", market: "EN" },
    ],
  },
  {
    name: "CSS Tools",
    color: "#f59e0b",
    tools: [
      { slug: "css-gradient", url: "/css-gradient", name: "CSS Gradient Generator", description: "Create linear and radial CSS gradients visually", market: "EN" },
      { slug: "css-box-shadow", url: "/css-box-shadow", name: "CSS Box Shadow", description: "Design box shadows with a visual editor", market: "EN" },
      { slug: "css-flexbox", url: "/css-flexbox", name: "CSS Flexbox Generator", description: "Build flexbox layouts with a visual playground", market: "EN" },
      { slug: "css-grid", url: "/css-grid", name: "CSS Grid Generator", description: "Create CSS Grid layouts visually", market: "EN" },
      { slug: "css-animation", url: "/css-animation", name: "CSS Animation Generator", description: "Build CSS keyframe animations with a visual editor", market: "EN" },
      { slug: "border-radius", url: "/border-radius", name: "Border Radius Generator", description: "Create custom border radius values visually", market: "EN" },
      { slug: "tailwindconvert", url: "/tailwindconvert", name: "CSS to Tailwind Converter", description: "Convert vanilla CSS to Tailwind CSS utility classes", market: "EN" },
      { slug: "px-to-rem", url: "/px-to-rem", name: "PX to REM Converter", description: "Convert pixel values to REM units", market: "EN" },
    ],
  },
  {
    name: "Color Tools",
    color: "#ec4899",
    tools: [
      { slug: "color-converter", url: "/color-converter", name: "Color Converter", description: "Convert between HEX, RGB, HSL, and other color formats", market: "EN" },
      { slug: "color-palette", url: "/color-palette", name: "Color Palette Generator", description: "Generate harmonious color palettes", market: "EN" },
    ],
  },
  {
    name: "Image Tools",
    color: "#06b6d4",
    tools: [
      { slug: "svg-to-png", url: "/svg-to-png", name: "SVG to PNG Converter", description: "Convert SVG files to PNG images", market: "EN" },
      { slug: "image-compressor", url: "/image-compressor", name: "Image Compressor", description: "Compress images without losing quality", market: "EN" },
      { slug: "favicon-generator", url: "/favicon-generator", name: "Favicon Generator", description: "Generate favicons from text, emoji, or images", market: "EN" },
      { slug: "placeholder-image", url: "/placeholder-image", name: "Placeholder Image Generator", description: "Create placeholder images with custom dimensions", market: "EN" },
      { slug: "qr-generator", url: "/qr-generator", name: "QR Code Generator", description: "Generate QR codes from text or URLs", market: "EN" },
    ],
  },
  {
    name: "Developer Tools",
    color: "#ef4444",
    tools: [
      { slug: "regex-tester", url: "/regex-tester", name: "Regex Tester", description: "Test and debug regular expressions with live matching", market: "EN" },
      { slug: "uuid-generator", url: "/uuid-generator", name: "UUID Generator", description: "Generate UUID v4 identifiers", market: "EN" },
      { slug: "cron-generator", url: "/cron-generator", name: "Cron Expression Generator", description: "Build and validate cron schedule expressions", market: "EN" },
      { slug: "epoch-converter", url: "/epoch-converter", name: "Unix Timestamp Converter", description: "Convert between Unix timestamps and dates", market: "EN" },
      { slug: "chmod-calculator", url: "/chmod-calculator", name: "Chmod Calculator", description: "Calculate file permission values", market: "EN" },
      { slug: "http-status", url: "/http-status", name: "HTTP Status Codes", description: "Reference for all HTTP status codes", market: "EN" },
      { slug: "password-generator", url: "/password-generator", name: "Password Generator", description: "Generate secure random passwords", market: "EN" },
    ],
  },
  {
    name: "SEO Tools",
    color: "#84cc16",
    tools: [
      { slug: "meta-tag-generator", url: "/meta-tag-generator", name: "Meta Tag Generator", description: "Generate HTML meta tags for SEO", market: "EN" },
      { slug: "og-image-preview", url: "/og-image-preview", name: "OG Image Preview", description: "Preview Open Graph images for social sharing", market: "EN" },
      { slug: "robots-txt-generator", url: "/robots-txt-generator", name: "Robots.txt Generator", description: "Generate robots.txt files for search engines", market: "EN" },
    ],
  },
  {
    name: "Minifier Tools",
    color: "#f97316",
    tools: [
      { slug: "minify-js", url: "/minify-js", name: "JavaScript Minifier", description: "Minify JavaScript code to reduce file size", market: "EN" },
      { slug: "minify-css", url: "/minify-css", name: "CSS Minifier", description: "Minify CSS stylesheets to reduce file size", market: "EN" },
    ],
  },
  {
    name: "Time & Date",
    color: "#6366f1",
    tools: [
      { slug: "timezone-converter", url: "/timezone-converter", name: "Time Zone Converter", description: "Convert times between different time zones", market: "EN" },
      { slug: "aspect-ratio", url: "/aspect-ratio", name: "Aspect Ratio Calculator", description: "Calculate and convert aspect ratios", market: "EN" },
    ],
  },
  {
    name: "Japanese Tools",
    color: "#e11d48",
    tools: [
      { slug: "eigyoubi", url: "/eigyoubi", name: "営業日数計算", description: "Calculate business days between dates", market: "JP" },
      { slug: "wareki-converter", url: "/wareki-converter", name: "和暦西暦変換", description: "Convert between Japanese and Western calendar years", market: "JP" },
      { slug: "zenkaku-hankaku", url: "/zenkaku-hankaku", name: "全角半角変換", description: "Convert between fullwidth and halfwidth characters", market: "JP" },
      { slug: "furigana", url: "/furigana", name: "ふりがな変換", description: "Add furigana readings to Japanese text", market: "JP" },
      { slug: "tax-calculator", url: "/tax-calculator", name: "税金計算", description: "Calculate Japanese consumption tax", market: "JP" },
    ],
  },
];

const totalTools = categories.reduce((sum, cat) => sum + cat.tools.length, 0);

function ToolCard({ tool, categoryColor }: { tool: Tool; categoryColor: string }) {
  return (
    <a
      href={tool.url}
            
      className="group block rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {tool.name}
        </h3>
        <span
          className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: tool.market === "JP" ? "#fef2f2" : "#eff6ff",
            color: tool.market === "JP" ? "#dc2626" : "#2563eb",
          }}
        >
          {tool.market}
        </span>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">{tool.description}</p>
      <div
        className="mt-3 h-0.5 w-8 rounded-full opacity-60 group-hover:w-12 transition-all"
        style={{ backgroundColor: categoryColor }}
      />
    </a>
  );
}

function CategorySection({ category }: { category: Category }) {
  return (
    <section id={category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-1 h-6 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
        <span className="text-sm text-gray-400">{category.tools.length} tools</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {category.tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} categoryColor={category.color} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        tools: cat.tools.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.slug.toLowerCase().includes(q) ||
            cat.name.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.tools.length > 0);
  }, [search]);

  const visibleToolCount = filteredCategories.reduce(
    (sum, cat) => sum + cat.tools.length,
    0
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <header className="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
            </svg>
            {totalTools}+ Tools
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Free Online Tools
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-1">
            {totalTools}+ tools for developers and everyday tasks. No signup, no ads.
          </p>
          <p className="text-base text-gray-400 max-w-2xl mx-auto">
            開発・計算・変換・AI料金試算まで、すべて無料。登録不要。
          </p>

          {/* Search */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
              placeholder="Search tools... (e.g. json, css, color, base64)"
              className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-base text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {search && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                {visibleToolCount} result{visibleToolCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((cat) => (
              <a
                key={cat.name}
                href={`#${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Tool Grid */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-14">
          {filteredCategories.map((cat) => (
            <CategorySection key={cat.name} category={cat} />
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No tools found for &ldquo;{search}&rdquo;</p>
            <button
              onClick={() => setSearch("")}
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear search
            </button>
          </div>
        )}

        {/* SEO Content */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            About This Collection
          </h2>
          <div className="text-gray-600 leading-relaxed space-y-3">
            <p>
              A growing collection of {totalTools}+ free online tools for developers, creators, and
              everyday tasks. Format JSON, generate CSS, encode Base64, estimate AI API costs, and
              more — all running entirely in your browser. No signup, no ads, no data collection.
            </p>
            <p>
              開発者向けツール（JSON整形・CSS生成・正規表現テスト）から、日常の計算・変換ツール、
              AI API料金シミュレーターまで、すべてブラウザ上で動作します。
              データはサーバーに送信されません。
            </p>
            <p>
              Each tool loads instantly, works offline after first visit, and does one thing well.
              New tools are added daily.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              All tools are free, open source, and require no signup.
            </p>
            <p className="text-sm text-gray-500">
              Built with AI &mdash; interested in working together?{" "}
              <a
                href="mailto:nao@loresync.dev"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                nao@loresync.dev
              </a>
            </p>
            <a
              href="https://github.com/nao-lore"
                            
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
