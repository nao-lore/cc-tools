"use client";

import { useState, useMemo } from "react";
import { JP_COLORS, CATEGORIES, SEASONS, hexToRgb, isLightColor, type JpColor } from "../lib/jp-colors";

export default function TraditionalColors() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("すべて");
  const [selectedSeason, setSelectedSeason] = useState<string>("すべて");
  const [selectedColor, setSelectedColor] = useState<JpColor | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    return JP_COLORS.filter((c) => {
      const matchSearch =
        search === "" ||
        c.name.includes(search) ||
        c.reading.includes(search) ||
        c.hex.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === "すべて" || c.category === selectedCategory;
      const matchSeason = selectedSeason === "すべて" || c.season === selectedSeason;
      return matchSearch && matchCategory && matchSeason;
    });
  }, [search, selectedCategory, selectedSeason]);

  const handleCopyHex = async (hex: string) => {
    await navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const rgb = selectedColor ? hexToRgb(selectedColor.hex) : null;
  const isLight = selectedColor ? isLightColor(selectedColor.hex) : true;

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <input
          type="text"
          placeholder="色名・読み・HEXで検索…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-wrap gap-1.5">
            {["すべて", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="w-full flex flex-wrap gap-1.5">
            {["すべて", ...SEASONS].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSeason(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedSeason === s
                    ? "bg-rose-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400">{filtered.length}色 表示中</p>
      </div>

      {/* Detail Card */}
      {selectedColor && (
        <div
          className="rounded-xl overflow-hidden border border-gray-200 shadow-md"
          style={{ backgroundColor: selectedColor.hex }}
        >
          <div className={`p-6 flex flex-col sm:flex-row gap-4 items-start ${isLight ? "text-gray-900" : "text-white"}`}>
            <div
              className="w-20 h-20 rounded-xl shadow-inner flex-shrink-0 border-2"
              style={{
                backgroundColor: selectedColor.hex,
                borderColor: isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.3)",
              }}
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-baseline gap-3">
                <h2 className="text-2xl font-bold">{selectedColor.name}</h2>
                <span className="text-sm opacity-70">{selectedColor.reading}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full ${isLight ? "bg-black/10" : "bg-white/20"}`}>
                  {selectedColor.category}
                </span>
                <span className={`px-2 py-0.5 rounded-full ${isLight ? "bg-black/10" : "bg-white/20"}`}>
                  {selectedColor.season}
                </span>
              </div>
              <p className="text-sm opacity-80 leading-relaxed">{selectedColor.description}</p>
              <div className="flex flex-wrap gap-3 text-sm font-mono">
                <button
                  onClick={() => handleCopyHex(selectedColor.hex)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    isLight
                      ? "bg-black/10 hover:bg-black/20"
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  {copied ? "コピー完了!" : selectedColor.hex.toUpperCase()}
                  {!copied && (
                    <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
                {rgb && (
                  <span className={`px-3 py-1.5 rounded-lg ${isLight ? "bg-black/10" : "bg-white/20"}`}>
                    rgb({rgb.r}, {rgb.g}, {rgb.b})
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedColor(null)}
              className={`text-xl leading-none opacity-60 hover:opacity-100 transition-opacity ${isLight ? "text-gray-900" : "text-white"}`}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Color Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🎨</p>
          <p>該当する色が見つかりませんでした</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {filtered.map((color) => {
            const light = isLightColor(color.hex);
            const isSelected = selectedColor?.name === color.name;
            return (
              <button
                key={color.name}
                onClick={() => setSelectedColor(isSelected ? null : color)}
                className={`group relative rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 ${
                  isSelected ? "ring-2 ring-indigo-500 ring-offset-2 shadow-md" : ""
                }`}
                title={`${color.name}（${color.reading}）`}
              >
                {/* Swatch */}
                <div
                  className="h-16 w-full"
                  style={{ backgroundColor: color.hex }}
                />
                {/* Label */}
                <div className="bg-white border border-gray-100 px-1.5 py-1.5 text-center">
                  <p className="text-xs font-medium text-gray-800 truncate">{color.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{color.reading}</p>
                  <p className="text-[10px] font-mono text-gray-500">{color.hex.toUpperCase()}</p>
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この日本の伝統色ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">日本の伝統色一覧とカラーコード検索。入力するだけで即座に結果を表示します。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">利用料金はかかりますか？</summary>
      <p className="mt-2 text-sm text-gray-600">完全無料でご利用いただけます。会員登録も不要です。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">計算結果は正確ですか？</summary>
      <p className="mt-2 text-sm text-gray-600">一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この日本の伝統色ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "日本の伝統色一覧とカラーコード検索。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
              </button>
            );
          })}
        </div>
      )}
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "日本の伝統色",
  "description": "日本の伝統色一覧とカラーコード検索",
  "url": "https://tools.loresync.dev/color-name-jp",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "ja"
}`
        }}
      />
      </div>
  );
}
