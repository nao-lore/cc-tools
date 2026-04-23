"use client";

import { useState, useMemo, useCallback } from "react";

// --- モデル定義 ---
type ModelDef = {
  id: string;
  name: string;
  provider: "openai" | "anthropic" | "google";
  inputPer1M: number;  // USD per 1M input tokens
  outputPer1M: number; // USD per 1M output tokens
  contextLength: number; // max context in tokens
  // トークン推定係数
  enWordsPerToken: number; // 英語: 1単語あたりのトークン数
  jaCharsPerToken: number; // 日本語: 1文字あたりのトークン数
};

const MODELS: ModelDef[] = [
  // OpenAI
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    inputPer1M: 2.5,
    outputPer1M: 10.0,
    contextLength: 128000,
    enWordsPerToken: 1.3,
    jaCharsPerToken: 1.7,
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    inputPer1M: 2.0,
    outputPer1M: 8.0,
    contextLength: 1047576,
    enWordsPerToken: 1.3,
    jaCharsPerToken: 1.7,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "openai",
    inputPer1M: 0.15,
    outputPer1M: 0.6,
    contextLength: 128000,
    enWordsPerToken: 1.3,
    jaCharsPerToken: 1.7,
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 mini",
    provider: "openai",
    inputPer1M: 0.4,
    outputPer1M: 1.6,
    contextLength: 1047576,
    enWordsPerToken: 1.3,
    jaCharsPerToken: 1.7,
  },
  // Anthropic
  {
    id: "claude-opus-4",
    name: "Claude Opus 4",
    provider: "anthropic",
    inputPer1M: 15.0,
    outputPer1M: 75.0,
    contextLength: 200000,
    enWordsPerToken: 1.3,
    jaCharsPerToken: 1.85,
  },
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "anthropic",
    inputPer1M: 3.0,
    outputPer1M: 15.0,
    contextLength: 200000,
    enWordsPerToken: 1.3,
    jaCharsPerToken: 1.85,
  },
  {
    id: "claude-haiku-3.5",
    name: "Claude Haiku 3.5",
    provider: "anthropic",
    inputPer1M: 0.8,
    outputPer1M: 4.0,
    contextLength: 200000,
    enWordsPerToken: 1.3,
    jaCharsPerToken: 1.85,
  },
  // Google
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "google",
    inputPer1M: 1.25,
    outputPer1M: 10.0,
    contextLength: 1048576,
    enWordsPerToken: 1.2,
    jaCharsPerToken: 1.5,
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    inputPer1M: 0.15,
    outputPer1M: 0.6,
    contextLength: 1048576,
    enWordsPerToken: 1.2,
    jaCharsPerToken: 1.5,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    inputPer1M: 0.1,
    outputPer1M: 0.4,
    contextLength: 1048576,
    enWordsPerToken: 1.2,
    jaCharsPerToken: 1.5,
  },
];

const PROVIDER_META: Record<
  string,
  { label: string; accentBg: string; accentText: string; accentBorder: string; dot: string }
> = {
  openai: {
    label: "OpenAI",
    accentBg: "bg-emerald-50",
    accentText: "text-emerald-700",
    accentBorder: "border-emerald-300",
    dot: "bg-emerald-400",
  },
  anthropic: {
    label: "Anthropic",
    accentBg: "bg-orange-50",
    accentText: "text-orange-700",
    accentBorder: "border-orange-300",
    dot: "bg-orange-400",
  },
  google: {
    label: "Google",
    accentBg: "bg-blue-50",
    accentText: "text-blue-700",
    accentBorder: "border-blue-300",
    dot: "bg-blue-400",
  },
};

// --- サンプルテキスト ---
const SAMPLES = {
  ja: `AIとは何か、その本質を問い直す時代が来ています。大規模言語モデルの登場により、私たちはテキスト生成・翻訳・要約・コード生成といった多様なタスクを自動化できるようになりました。しかし、これらのモデルがどのようにトークンを処理するかを理解することは、コスト最適化とプロンプト設計の両方において非常に重要です。このツールを使えば、日本語テキストのトークン数をリアルタイムで推定し、各モデルのAPI料金を即座に把握できます。`,
  en: `Large language models (LLMs) have transformed the way we interact with text. From summarization and translation to code generation and creative writing, these models handle an enormous variety of tasks. Understanding how tokens work is essential for optimizing your API costs. In English, one word typically corresponds to roughly 1.3 tokens, while punctuation and whitespace also consume tokens. Use this tool to estimate token counts in real time and compare API pricing across GPT, Claude, and Gemini models.`,
};

// --- ユーティリティ ---
function detectJaRatio(text: string): number {
  if (!text) return 0;
  const jaChars = text.match(/[\u3000-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]/g) ?? [];
  return jaChars.length / text.length;
}

function estimateTokens(text: string, model: ModelDef): number {
  if (!text.trim()) return 0;
  const jaRatio = detectJaRatio(text);
  if (jaRatio > 0.2) {
    // 日本語主体: 文字数ベース
    return Math.round(text.length * model.jaCharsPerToken);
  } else {
    // 英語主体: 単語数ベース
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.round(words * model.enWordsPerToken);
  }
}

function countStats(text: string) {
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const lines = text === "" ? 0 : text.split("\n").length;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
  const paragraphs =
    text.trim() === ""
      ? 0
      : text
          .split(/\n\s*\n/)
          .filter((p) => p.trim().length > 0).length;
  const jaRatio = detectJaRatio(text);
  return { chars, charsNoSpace, lines, words, paragraphs, jaRatio };
}

function fmtUSD(n: number): string {
  if (n === 0) return "$0.000000";
  if (n < 0.001) return `$${n.toFixed(6)}`;
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(3)}`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtJPY(n: number): string {
  if (n < 1) return `${n.toFixed(3)}円`;
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function fmtNum(n: number): string {
  return n.toLocaleString("ja-JP");
}

function contextUsageColor(ratio: number): string {
  if (ratio < 0.5) return "bg-indigo-500";
  if (ratio < 0.8) return "bg-amber-500";
  return "bg-red-500";
}

// --- コンポーネント ---

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-indigo-100 p-4 flex flex-col gap-1">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className="text-2xl font-bold text-gray-900 leading-tight">{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function ModelRow({
  model,
  tokens,
  outputTokens,
  exchangeRate,
  outputRatio,
  selected,
  onSelect,
}: {
  model: ModelDef;
  tokens: number;
  outputTokens: number;
  exchangeRate: number;
  outputRatio: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const meta = PROVIDER_META[model.provider];
  const inputCost = (tokens / 1_000_000) * model.inputPer1M;
  const estimatedOutput = Math.round(tokens * outputRatio);
  const outputCost = (estimatedOutput / 1_000_000) * model.outputPer1M;
  const totalCost = inputCost + outputCost;
  const ctxRatio = Math.min(tokens / model.contextLength, 1);

  return (
    <tr
      onClick={onSelect}
      className={`border-b border-gray-50 cursor-pointer transition-colors ${
        selected ? "bg-indigo-50" : "hover:bg-gray-50"
      }`}
    >
      <td className="py-2.5 pr-3 pl-1">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.accentBg} ${meta.accentText}`}
        >
          {meta.label}
        </span>
      </td>
      <td className="py-2.5 pr-3">
        <span className={`text-sm font-medium ${selected ? "text-indigo-700" : "text-gray-800"}`}>
          {model.name}
        </span>
        {selected && <span className="ml-1.5 text-xs text-indigo-400">← 選択中</span>}
      </td>
      <td className="py-2.5 pr-3 text-right">
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-sm font-semibold text-gray-900">{fmtNum(tokens)}</span>
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${contextUsageColor(ctxRatio)}`}
              style={{ width: `${Math.max(ctxRatio * 100, 1)}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">{(ctxRatio * 100).toFixed(1)}%</span>
        </div>
      </td>
      <td className="py-2.5 text-right">
        <div className="font-semibold text-gray-900 text-sm">{fmtUSD(totalCost)}</div>
        <div className="text-xs text-gray-400">{fmtJPY(totalCost * exchangeRate)}</div>
      </td>
    </tr>
  );
}

export default function PromptTokenCounter() {
  const [text, setText] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("claude-sonnet-4");
  const [exchangeRate, setExchangeRate] = useState(150);
  const [outputRatio, setOutputRatio] = useState(1.0);
  const [copied, setCopied] = useState(false);

  const selectedModel = MODELS.find((m) => m.id === selectedModelId) ?? MODELS[0];

  // --- 統計 ---
  const stats = useMemo(() => countStats(text), [text]);

  // --- トークン推定（選択モデル） ---
  const tokens = useMemo(() => estimateTokens(text, selectedModel), [text, selectedModel]);

  // --- コンテキスト使用率 ---
  const ctxRatio = useMemo(
    () => Math.min(tokens / selectedModel.contextLength, 1),
    [tokens, selectedModel]
  );

  // --- 料金計算 ---
  const cost = useMemo(() => {
    const estimatedOutput = Math.round(tokens * outputRatio);
    const inputCost = (tokens / 1_000_000) * selectedModel.inputPer1M;
    const outputCost = (estimatedOutput / 1_000_000) * selectedModel.outputPer1M;
    const total = inputCost + outputCost;
    return { inputCost, outputCost, total, estimatedOutput };
  }, [tokens, outputRatio, selectedModel]);

  // --- コピー ---
  const handleCopy = useCallback(async () => {
    const isJa = stats.jaRatio > 0.2;
    const summary = [
      `【テキスト統計】`,
      `文字数: ${fmtNum(stats.chars)}字（スペース除く: ${fmtNum(stats.charsNoSpace)}字）`,
      `行数: ${fmtNum(stats.lines)}行　段落数: ${fmtNum(stats.paragraphs)}段落`,
      isJa
        ? `日本語文字数: ${fmtNum(Math.round(stats.chars * stats.jaRatio))}字`
        : `単語数: ${fmtNum(stats.words)}語`,
      ``,
      `【トークン推定（${selectedModel.name}）】`,
      `推定トークン数: ${fmtNum(tokens)} tokens`,
      `コンテキスト使用率: ${(ctxRatio * 100).toFixed(1)}% / ${fmtNum(selectedModel.contextLength)} tokens`,
      ``,
      `【API料金推定（1回）】`,
      `入力: ${fmtUSD(cost.inputCost)} / 出力: ${fmtUSD(cost.outputCost)}`,
      `合計: ${fmtUSD(cost.total)}（${fmtJPY(cost.total * exchangeRate)}）`,
      `為替レート: 1 USD = ${exchangeRate}円`,
    ].join("\n");
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [stats, tokens, ctxRatio, cost, exchangeRate, selectedModel]);

  // --- サンプル挿入 ---
  const insertSample = useCallback((lang: "ja" | "en") => {
    setText(SAMPLES[lang]);
  }, []);

  const isJaMain = stats.jaRatio > 0.2;

  return (
    <div className="space-y-6">
      {/* ===== メインレイアウト ===== */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左: テキスト入力 */}
        <div className="lg:w-1/2 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-semibold text-gray-800">テキストを入力</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">サンプル:</span>
              <button
                onClick={() => insertSample("ja")}
                className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
              >
                日本語
              </button>
              <button
                onClick={() => insertSample("en")}
                className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
              >
                English
              </button>
              {text && (
                <button
                  onClick={() => setText("")}
                  className="px-2.5 py-1 text-xs bg-gray-50 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  クリア
                </button>
              )}
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="ここにプロンプトやテキストを貼り付けてください..."
            className="w-full flex-1 min-h-[320px] lg:min-h-[460px] px-4 py-3 border border-indigo-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none leading-relaxed bg-white"
          />

          {/* 言語判定バッジ */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span
              className={`px-2 py-0.5 rounded-full font-medium ${
                text
                  ? isJaMain
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-600"
                  : "bg-gray-50 text-gray-400"
              }`}
            >
              {text
                ? isJaMain
                  ? `日本語モード（日本語比率 ${Math.round(stats.jaRatio * 100)}%）`
                  : `英語モード（日本語比率 ${Math.round(stats.jaRatio * 100)}%）`
                : "テキストを入力してください"}
            </span>
          </div>
        </div>

        {/* 右: 統計パネル */}
        <div className="lg:w-1/2 flex flex-col gap-4">
          {/* 基本統計 */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">テキスト統計</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
              <StatCard
                label="文字数"
                value={fmtNum(stats.chars)}
                sub={`スペース除く: ${fmtNum(stats.charsNoSpace)}`}
              />
              <StatCard
                label={isJaMain ? "日本語文字数" : "単語数（英語）"}
                value={
                  isJaMain
                    ? fmtNum(Math.round(stats.chars * stats.jaRatio))
                    : fmtNum(stats.words)
                }
                sub={isJaMain ? "漢字・かな・カナ" : "words"}
              />
              <StatCard label="行数" value={fmtNum(stats.lines)} sub={`段落: ${fmtNum(stats.paragraphs)}`} />
            </div>
          </div>

          {/* モデル選択 */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">計算モデルを選択</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MODELS.map((m) => {
                const meta = PROVIDER_META[m.provider];
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModelId(m.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                      selectedModelId === m.id
                        ? "border-indigo-400 bg-indigo-50 ring-2 ring-indigo-300"
                        : "border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/40"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{m.name}</div>
                      <div className="text-xs text-gray-400">{meta.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* トークン推定（大きく表示） */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white">
            <div className="text-xs font-medium text-indigo-200 mb-1">推定トークン数</div>
            <div className="text-5xl font-bold tracking-tight mb-1">
              {fmtNum(tokens)}
            </div>
            <div className="text-sm text-indigo-200">
              tokens — {selectedModel.name}
            </div>

            {/* コンテキスト使用率 */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-indigo-200 mb-1">
                <span>コンテキスト使用率</span>
                <span>
                  {fmtNum(tokens)} / {fmtNum(selectedModel.contextLength)}
                </span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    ctxRatio < 0.5
                      ? "bg-green-400"
                      : ctxRatio < 0.8
                      ? "bg-amber-400"
                      : "bg-red-400"
                  }`}
                  style={{ width: `${Math.max(ctxRatio * 100, 0.5)}%` }}
                />
              </div>
              <div className="text-right text-xs text-indigo-200 mt-1">
                {(ctxRatio * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 料金設定 + 計算結果 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">API料金推定</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          {/* 為替レート */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              為替レート
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">1 USD =</span>
              <input
                type="number"
                min={50}
                max={300}
                step={1}
                value={exchangeRate}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!isNaN(v) && v > 0) setExchangeRate(v);
                }}
                className="w-24 px-2 py-1.5 text-right border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <span className="text-sm text-gray-500">円</span>
            </div>
          </div>

          {/* 入出力比率 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              出力トークン倍率（入力の何倍出力するか）
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0.1}
                max={5}
                step={0.1}
                value={outputRatio}
                onChange={(e) => setOutputRatio(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={0.1}
                  max={5}
                  step={0.1}
                  value={outputRatio}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!isNaN(v) && v > 0) setOutputRatio(Math.min(Math.max(v, 0.1), 5));
                  }}
                  className="w-16 px-2 py-1.5 text-right border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <span className="text-sm text-gray-500">倍</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              出力推定: 約 {fmtNum(cost.estimatedOutput)} tokens
            </p>
          </div>
        </div>

        {/* 料金カード */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <div className="text-xs text-indigo-600 font-medium mb-1">入力コスト</div>
            <div className="text-2xl font-bold text-gray-900">{fmtUSD(cost.inputCost)}</div>
            <div className="text-sm text-gray-500 mt-0.5">{fmtJPY(cost.inputCost * exchangeRate)}</div>
            <div className="text-xs text-gray-400 mt-1.5">
              {fmtNum(tokens)} tokens × ${selectedModel.inputPer1M}/1M
            </div>
          </div>

          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
            <div className="text-xs text-violet-600 font-medium mb-1">出力コスト</div>
            <div className="text-2xl font-bold text-gray-900">{fmtUSD(cost.outputCost)}</div>
            <div className="text-sm text-gray-500 mt-0.5">{fmtJPY(cost.outputCost * exchangeRate)}</div>
            <div className="text-xs text-gray-400 mt-1.5">
              {fmtNum(cost.estimatedOutput)} tokens × ${selectedModel.outputPer1M}/1M
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-4 text-white">
            <div className="text-xs text-indigo-200 font-medium mb-1">合計（1回あたり）</div>
            <div className="text-2xl font-bold">{fmtUSD(cost.total)}</div>
            <div className="text-sm text-indigo-200 mt-0.5">{fmtJPY(cost.total * exchangeRate)}</div>
            <div className="text-xs text-indigo-300 mt-1.5">
              入力 + 出力 合算
            </div>
          </div>
        </div>

        {/* コピーボタン */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={handleCopy}
            disabled={!text}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              copied
                ? "bg-green-500 text-white"
                : text
                ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                コピー完了
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                統計をコピー
              </>
            )}
          </button>
        </div>
      </div>

      {/* ===== 全モデル比較表 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">全モデル比較</h2>
        <p className="text-xs text-gray-500 mb-4">
          現在のテキスト（推定 {fmtNum(tokens)} tokens）で各モデルのAPI料金を比較。行をクリックして選択。
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-3 pl-1 text-xs text-gray-500 font-medium">プロバイダー</th>
                <th className="text-left py-2 pr-3 text-xs text-gray-500 font-medium">モデル</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">トークン / コンテキスト</th>
                <th className="text-right py-2 text-xs text-gray-500 font-medium">往復コスト</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map((m) => {
                const modelTokens = estimateTokens(text, m);
                return (
                  <ModelRow
                    key={m.id}
                    model={m}
                    tokens={modelTokens}
                    outputTokens={Math.round(modelTokens * outputRatio)}
                    exchangeRate={exchangeRate}
                    outputRatio={outputRatio}
                    selected={m.id === selectedModelId}
                    onSelect={() => setSelectedModelId(m.id)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          ※ トークン数はモデルにより推定係数が異なります。実際の値はAPIレスポンスで確認してください。
        </p>
      </div>

      {/* ===== フッター注記 ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        トークン数は近似値です。料金は変更される場合があります。最新情報は各社の公式ページをご確認ください。
      </p>
    </div>
  );
}
