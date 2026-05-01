"use client";

import { useState } from "react";

type Model = {
  name: string;
  provider: string;
  contextTokens: number;
  maxOutputTokens: number;
  color: string;
};

const MODELS: Model[] = [
  { name: "Gemini 1.5 Pro", provider: "Google", contextTokens: 2_000_000, maxOutputTokens: 8_192, color: "bg-blue-500" },
  { name: "Gemini 1.5 Flash", provider: "Google", contextTokens: 1_000_000, maxOutputTokens: 8_192, color: "bg-blue-400" },
  { name: "Gemini 2.0 Flash", provider: "Google", contextTokens: 1_000_000, maxOutputTokens: 8_192, color: "bg-blue-300" },
  { name: "Claude 3.7 Sonnet", provider: "Anthropic", contextTokens: 200_000, maxOutputTokens: 64_000, color: "bg-orange-400" },
  { name: "Claude 3.5 Sonnet", provider: "Anthropic", contextTokens: 200_000, maxOutputTokens: 8_192, color: "bg-orange-300" },
  { name: "Claude 3 Opus", provider: "Anthropic", contextTokens: 200_000, maxOutputTokens: 4_096, color: "bg-orange-500" },
  { name: "Claude 3 Haiku", provider: "Anthropic", contextTokens: 200_000, maxOutputTokens: 4_096, color: "bg-amber-300" },
  { name: "GPT-4o", provider: "OpenAI", contextTokens: 128_000, maxOutputTokens: 16_384, color: "bg-green-500" },
  { name: "GPT-4.1", provider: "OpenAI", contextTokens: 1_000_000, maxOutputTokens: 32_768, color: "bg-green-600" },
  { name: "GPT-4 Turbo", provider: "OpenAI", contextTokens: 128_000, maxOutputTokens: 4_096, color: "bg-green-400" },
  { name: "GPT-3.5 Turbo", provider: "OpenAI", contextTokens: 16_385, maxOutputTokens: 4_096, color: "bg-emerald-300" },
  { name: "Llama 3.1 405B", provider: "Meta", contextTokens: 128_000, maxOutputTokens: 8_192, color: "bg-violet-500" },
  { name: "Mistral Large", provider: "Mistral", contextTokens: 128_000, maxOutputTokens: 8_192, color: "bg-purple-400" },
  { name: "Command R+", provider: "Cohere", contextTokens: 128_000, maxOutputTokens: 4_096, color: "bg-pink-400" },
];

const MAX_TOKENS = Math.max(...MODELS.map((m) => m.contextTokens));

// 1 token ≈ 0.75 English words ≈ 1.5 Japanese chars
// A4 page ≈ 800 Japanese chars ≈ 400 English words
const tokensToJaChars = (t: number) => Math.round(t * 1.5);
const tokensToEnWords = (t: number) => Math.round(t * 0.75);
const tokensToA4Pages = (t: number) => Math.round(t * 1.5 / 800);
const tokensToBooks = (t: number) => +(t * 1.5 / 200_000).toFixed(1); // ~200K chars per book

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

function formatTokens(t: number): string {
  if (t >= 1_000_000) return `${(t / 1_000_000).toFixed(1)}M tokens`;
  if (t >= 1_000) return `${(t / 1_000).toFixed(0)}K tokens`;
  return `${t.toLocaleString()} tokens`;
}

const PROVIDERS = ["すべて", "OpenAI", "Anthropic", "Google", "Meta", "Mistral", "Cohere"];

type SortKey = "context" | "output" | "name";

export default function ContextWindowVisualizer() {
  const [inputChars, setInputChars] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("すべて");
  const [sortKey, setSortKey] = useState<SortKey>("context");
  const [viewMode, setViewMode] = useState<"context" | "output">("context");

  const inputTokens = inputChars ? Math.round(Number(inputChars) / 1.5) : 0;

  const filteredModels = MODELS.filter(
    (m) => selectedProvider === "すべて" || m.provider === selectedProvider
  ).sort((a, b) => {
    if (sortKey === "context") return b.contextTokens - a.contextTokens;
    if (sortKey === "output") return b.maxOutputTokens - a.maxOutputTokens;
    return a.name.localeCompare(b.name);
  });

  const maxBar = viewMode === "context"
    ? Math.max(...filteredModels.map((m) => m.contextTokens))
    : Math.max(...filteredModels.map((m) => m.maxOutputTokens));

  return (
    <div className="space-y-6">
      {/* 換算カード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "最大コンテキスト", value: formatTokens(MAX_TOKENS), sub: "Gemini 1.5 Pro" },
          { label: "日本語文字数換算", value: `約${formatNum(tokensToJaChars(MAX_TOKENS))}字`, sub: "1 token ≈ 1.5文字" },
          { label: "A4ページ数換算", value: `約${formatNum(tokensToA4Pages(MAX_TOKENS))}ページ`, sub: "800字/ページ" },
          { label: "本の冊数換算", value: `約${tokensToBooks(MAX_TOKENS)}冊`, sub: "20万字/冊" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white/70 backdrop-blur rounded-xl p-4 border border-indigo-100 shadow-sm"
          >
            <div className="text-xs text-indigo-400 font-medium mb-1">{card.label}</div>
            <div className="text-xl font-bold text-indigo-900">{card.value}</div>
            <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* テキスト判定 */}
      <div className="bg-white/70 backdrop-blur rounded-xl p-5 border border-indigo-100 shadow-sm">
        <div className="text-sm font-semibold text-indigo-800 mb-3">
          このテキストはどのモデルに収まるか？
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <input
            type="number"
            min={0}
            value={inputChars}
            onChange={(e) => setInputChars(e.target.value)}
            placeholder="日本語文字数を入力（例: 50000）"
            className="flex-1 min-w-[200px] border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {inputChars && (
            <span className="text-sm text-indigo-600 font-medium">
              ≈ {formatTokens(inputTokens)}
            </span>
          )}
        </div>
        {inputChars && inputTokens > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs text-gray-500 mb-2">収まるモデル / 収まらないモデル</div>
            <div className="flex flex-wrap gap-2">
              {MODELS.map((m) => {
                const fits = m.contextTokens >= inputTokens;
                return (
                  <span
                    key={m.name}
                    className={`text-xs px-2 py-1 rounded-full font-medium border ${
                      fits
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-400 border-red-200 line-through"
                    }`}
                  >
                    {m.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* チャート */}
      <div className="bg-white/70 backdrop-blur rounded-xl p-5 border border-indigo-100 shadow-sm">
        {/* コントロール */}
        <div className="flex flex-wrap gap-3 items-center justify-between mb-5">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("context")}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === "context"
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              }`}
            >
              コンテキスト長
            </button>
            <button
              onClick={() => setViewMode("output")}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === "output"
                  ? "bg-purple-600 text-white"
                  : "bg-purple-50 text-purple-600 hover:bg-purple-100"
              }`}
            >
              最大出力
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="text-xs border border-indigo-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="text-xs border border-indigo-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="context">コンテキスト順</option>
              <option value="output">出力順</option>
              <option value="name">名前順</option>
            </select>
          </div>
        </div>

        {/* バーチャート */}
        <div className="space-y-3">
          {filteredModels.map((model) => {
            const tokenValue = viewMode === "context" ? model.contextTokens : model.maxOutputTokens;
            const barPct = Math.max((tokenValue / maxBar) * 100, 1.5);
            const fitsInput = inputTokens > 0 && viewMode === "context" && model.contextTokens >= inputTokens;
            const doesntFit = inputTokens > 0 && viewMode === "context" && model.contextTokens < inputTokens;

            return (
              <div key={model.name} className="group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400 w-16 shrink-0">{model.provider}</span>
                  <span className={`text-sm font-medium ${doesntFit ? "text-gray-300" : "text-gray-800"}`}>
                    {model.name}
                  </span>
                  {fitsInput && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">収まる</span>
                  )}
                  {doesntFit && (
                    <span className="text-xs bg-red-100 text-red-400 px-1.5 py-0.5 rounded-full">超過</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        doesntFit ? "opacity-30 " : ""
                      }${model.color}`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                  <div className="text-right shrink-0 w-28">
                    <span className="text-xs font-semibold text-indigo-800">
                      {formatTokens(tokenValue)}
                    </span>
                  </div>
                </div>
                {/* ホバー時の換算 */}
                <div className="hidden group-hover:flex gap-4 mt-1 ml-[74px] text-xs text-gray-400">
                  {viewMode === "context" && (
                    <>
                      <span>日本語: 約{formatNum(tokensToJaChars(tokenValue))}字</span>
                      <span>英語: 約{formatNum(tokensToEnWords(tokenValue))}語</span>
                      <span>A4: 約{formatNum(tokensToA4Pages(tokenValue))}ページ</span>
                    </>
                  )}
                  {viewMode === "output" && (
                    <>
                      <span>日本語: 約{formatNum(tokensToJaChars(tokenValue))}字</span>
                      <span>英語: 約{formatNum(tokensToEnWords(tokenValue))}語</span>
                    </>
                  )}
                </div>
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このコンテキストウィンドウ 可視化ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">主要LLMモデルのコンテキスト長をトークン・文字数・ページ数で視覚化。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このコンテキストウィンドウ 可視化ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "主要LLMモデルのコンテキスト長をトークン・文字数・ページ数で視覚化。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
            );
          })}
        </div>

        {/* 凡例 */}
        <div className="mt-5 pt-4 border-t border-indigo-50 flex flex-wrap gap-x-4 gap-y-1">
          {[
            { label: "OpenAI", color: "bg-green-500" },
            { label: "Anthropic", color: "bg-orange-400" },
            { label: "Google", color: "bg-blue-500" },
            { label: "Meta", color: "bg-violet-500" },
            { label: "Mistral", color: "bg-purple-400" },
            { label: "Cohere", color: "bg-pink-400" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="text-xs text-gray-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 換算基準の注記 */}
      <div className="text-xs text-gray-400 text-center space-y-1">
        <p>換算基準: 1 token ≈ 日本語1.5文字 / 英語0.75語。A4ページ ≈ 800日本語文字。書籍 ≈ 20万文字。</p>
        <p>コンテキスト長・最大出力は各社公式発表値。実際の制限は利用プランにより異なる場合があります。</p>
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "コンテキストウィンドウ 可視化",
  "description": "主要LLMモデルのコンテキスト長をトークン・文字数・ページ数で視覚化",
  "url": "https://tools.loresync.dev/context-window-visualizer",
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
