"use client";

import { useState, useCallback, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalysisResult {
  charCount: number;
  lineCount: number;
  tokenEstimate: number;
  redundancies: RedundancyItem[];
  sections: SectionInfo[];
  modelComparisons: ModelComparison[];
  suggestions: string[];
}

interface RedundancyItem {
  type: "repeated-phrase" | "verbose-pattern" | "filler-line";
  original: string;
  suggestion: string;
  line?: number;
}

interface SectionInfo {
  name: string;
  detected: boolean;
  keywords: string[];
}

interface ModelComparison {
  name: string;
  contextTokens: number;
  percentUsed: number;
  status: "safe" | "warning" | "danger";
}

// ─── Analysis utilities ───────────────────────────────────────────────────────

const VERBOSE_PATTERNS: { pattern: RegExp; suggestion: string; label: string }[] = [
  {
    pattern: /please make sure to always/gi,
    suggestion: "Always",
    label: "Please make sure to always → Always",
  },
  {
    pattern: /please ensure that you always/gi,
    suggestion: "Always",
    label: "Please ensure that you always → Always",
  },
  {
    pattern: /it is important (that|to) (you )?/gi,
    suggestion: "",
    label: 'It is important that you → (remove)',
  },
  {
    pattern: /you should (always |never |make sure to )?/gi,
    suggestion: "",
    label: "You should always → Always",
  },
  {
    pattern: /please (note|remember|keep in mind) that/gi,
    suggestion: "Note:",
    label: "Please note/remember that → Note:",
  },
  {
    pattern: /in order to/gi,
    suggestion: "to",
    label: "In order to → to",
  },
  {
    pattern: /at all times/gi,
    suggestion: "always",
    label: "at all times → always",
  },
  {
    pattern: /make sure (to|that you)/gi,
    suggestion: "",
    label: "Make sure to → (remove)",
  },
  {
    pattern: /as (an|a) (AI|language model|assistant),? (you )?/gi,
    suggestion: "",
    label: "As an AI/assistant, you → (remove)",
  },
  {
    pattern: /\bvery\s+important\b/gi,
    suggestion: "important",
    label: "very important → important",
  },
];

const SECTION_DEFS: SectionInfo[] = [
  {
    name: "Role",
    detected: false,
    keywords: ["you are", "your role", "act as", "you act", "persona", "you are a"],
  },
  {
    name: "Rules",
    detected: false,
    keywords: ["rule", "must", "never", "always", "do not", "don't", "constraint", "restriction"],
  },
  {
    name: "Format",
    detected: false,
    keywords: ["format", "output", "respond in", "structure", "markdown", "json", "bullet", "list"],
  },
  {
    name: "Examples",
    detected: false,
    keywords: ["example", "e.g.", "for instance", "sample", "such as", "input:", "output:"],
  },
];

const MODELS: { name: string; contextTokens: number }[] = [
  { name: "GPT-4", contextTokens: 128_000 },
  { name: "Claude", contextTokens: 200_000 },
  { name: "Gemini", contextTokens: 1_000_000 },
];

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function detectRedundancies(text: string): RedundancyItem[] {
  const results: RedundancyItem[] = [];
  const lines = text.split("\n");

  // Verbose patterns
  for (const vp of VERBOSE_PATTERNS) {
    if (vp.pattern.test(text)) {
      vp.pattern.lastIndex = 0;
      results.push({
        type: "verbose-pattern",
        original: vp.label.split(" → ")[0],
        suggestion: vp.label.split(" → ")[1] ?? "",
      });
    }
    vp.pattern.lastIndex = 0;
  }

  // Empty/filler lines (3+ consecutive blank lines)
  let blankRun = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "") {
      blankRun++;
      if (blankRun === 3) {
        results.push({
          type: "filler-line",
          original: "3行以上の連続空白行",
          suggestion: "1行に削減",
          line: i + 1,
        });
      }
    } else {
      blankRun = 0;
    }
  }

  // Repeated phrases (4+ words that appear 3+ times)
  const phraseMap = new Map<string, number>();
  const words = text.toLowerCase().split(/\s+/);
  for (let i = 0; i <= words.length - 4; i++) {
    const phrase = words.slice(i, i + 4).join(" ");
    if (/^[a-z]/.test(phrase)) {
      phraseMap.set(phrase, (phraseMap.get(phrase) ?? 0) + 1);
    }
  }
  for (const [phrase, count] of phraseMap.entries()) {
    if (count >= 3) {
      results.push({
        type: "repeated-phrase",
        original: `"${phrase}" が ${count} 回繰り返されています`,
        suggestion: "変数化または統合を検討",
      });
    }
  }

  return results;
}

function detectSections(text: string): SectionInfo[] {
  const lower = text.toLowerCase();
  return SECTION_DEFS.map((sec) => ({
    ...sec,
    detected: sec.keywords.some((kw) => lower.includes(kw)),
  }));
}

function computeModelComparisons(tokenEstimate: number): ModelComparison[] {
  return MODELS.map(({ name, contextTokens }) => {
    const pct = (tokenEstimate / contextTokens) * 100;
    return {
      name,
      contextTokens,
      percentUsed: pct,
      status: pct > 80 ? "danger" : pct > 50 ? "warning" : "safe",
    };
  });
}

function buildSuggestions(
  redundancies: RedundancyItem[],
  sections: SectionInfo[],
  tokenEstimate: number,
  charCount: number
): string[] {
  const suggestions: string[] = [];

  const verbose = redundancies.filter((r) => r.type === "verbose-pattern");
  if (verbose.length > 0) {
    suggestions.push(
      `冗長表現 ${verbose.length} 件を簡略化してください: ${verbose
        .slice(0, 3)
        .map((v) => `"${v.original}" → ${v.suggestion || "(削除)"}`)
        .join("、")}${verbose.length > 3 ? "…" : ""}`
    );
  }

  const repeated = redundancies.filter((r) => r.type === "repeated-phrase");
  if (repeated.length > 0) {
    suggestions.push(
      `繰り返しフレーズ ${repeated.length} 件を検出しました。共通ルールとしてまとめるか、一度だけ記述してください。`
    );
  }

  const fillers = redundancies.filter((r) => r.type === "filler-line");
  if (fillers.length > 0) {
    suggestions.push("連続空白行を整理してトークン数を削減してください。");
  }

  const missingsections = sections.filter((s) => !s.detected).map((s) => s.name);
  if (missingsections.length > 0) {
    suggestions.push(
      `未検出セクション: ${missingsections.join(", ")}。明示的に追加するとモデルの理解度が向上します。`
    );
  }

  if (tokenEstimate > 2000) {
    suggestions.push(
      "プロンプトが長めです。Examples セクションを別ファイルに分離するか、Few-shot 数を減らすことを検討してください。"
    );
  }

  if (tokenEstimate < 100) {
    suggestions.push(
      "プロンプトが短すぎます。Role（役割定義）と Rules（制約）を追加すると出力品質が向上します。"
    );
  }

  if (suggestions.length === 0) {
    suggestions.push("冗長表現は検出されませんでした。バランスの取れたプロンプトです。");
  }

  return suggestions;
}

function analyze(text: string): AnalysisResult {
  const charCount = text.length;
  const lineCount = text.split("\n").length;
  const tokenEstimate = estimateTokens(text);
  const redundancies = detectRedundancies(text);
  const sections = detectSections(text);
  const modelComparisons = computeModelComparisons(tokenEstimate);
  const suggestions = buildSuggestions(redundancies, sections, tokenEstimate, charCount);

  return { charCount, lineCount, tokenEstimate, redundancies, sections, modelComparisons, suggestions };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  );
}

function SectionBadge({ section }: { section: SectionInfo }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
        section.detected
          ? "bg-green-900 text-green-300 border border-green-700"
          : "bg-gray-800 text-gray-500 border border-gray-700"
      }`}
    >
      <span>{section.detected ? "✓" : "○"}</span>
      {section.name}
    </span>
  );
}

function ModelBar({ model }: { model: ModelComparison }) {
  const colorClass =
    model.status === "danger"
      ? "bg-red-500"
      : model.status === "warning"
      ? "bg-yellow-500"
      : "bg-green-500";

  const textClass =
    model.status === "danger"
      ? "text-red-400"
      : model.status === "warning"
      ? "text-yellow-400"
      : "text-green-400";

  const displayPct = Math.min(model.percentUsed, 100);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-300 font-medium">{model.name}</span>
        <span className={textClass}>
          {model.percentUsed < 0.01
            ? "<0.01%"
            : model.percentUsed < 1
            ? `${model.percentUsed.toFixed(2)}%`
            : `${model.percentUsed.toFixed(1)}%`}
          <span className="text-gray-600 ml-1">/ {(model.contextTokens / 1000).toFixed(0)}K ctx</span>
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className={`${colorClass} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${Math.max(displayPct, 0.5)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SystemPromptOptimizer() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = useCallback(() => {
    if (!input.trim()) return;
    setResult(analyze(input));
  }, [input]);

  const redundancyCount = result?.redundancies.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">System Prompt 最適化ツール</h1>
          <p className="text-gray-400 mt-1 text-sm">
            トークン数計測・冗長表現検出・モデル別コンテキスト比較。プロンプトエンジニアリング効率化。
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            System Prompt
            <span className="ml-2 text-xs text-gray-500">（解析したいプロンプトを貼り付け）</span>
          </label>
          <textarea
            className="w-full h-64 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
            placeholder={"You are a helpful assistant.\nAlways respond in Japanese.\nPlease make sure to always be concise and clear..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Action */}
        <button
          onClick={handleAnalyze}
          disabled={!input.trim()}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors text-sm"
        >
          解析する
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-5">

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="推定トークン数" value={result.tokenEstimate} />
              <StatCard label="文字数" value={result.charCount} />
              <StatCard label="行数" value={result.lineCount} />
            </div>

            {/* Section detector */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-4 space-y-3">
              <p className="text-sm font-medium text-gray-300">セクション検出</p>
              <div className="flex flex-wrap gap-2">
                {result.sections.map((sec) => (
                  <SectionBadge key={sec.name} section={sec} />
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Role / Rules / Format / Examples の4セクションが揃うと出力の一貫性が向上します。
              </p>
            </div>

            {/* Model context comparison */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-4 space-y-4">
              <p className="text-sm font-medium text-gray-300">モデル別コンテキスト使用率</p>
              <div className="space-y-3">
                {result.modelComparisons.map((m) => (
                  <ModelBar key={m.name} model={m} />
                ))}
              </div>
            </div>

            {/* Redundancy detection */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-300">冗長表現検出</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    redundancyCount === 0
                      ? "bg-green-900 text-green-300"
                      : "bg-amber-900 text-amber-300"
                  }`}
                >
                  {redundancyCount} 件
                </span>
              </div>

              {result.redundancies.length === 0 ? (
                <p className="text-sm text-green-400">冗長表現は検出されませんでした。</p>
              ) : (
                <ul className="space-y-2">
                  {result.redundancies.map((r, i) => (
                    <li
                      key={i}
                      className={`rounded-lg px-3 py-2 text-xs space-y-0.5 ${
                        r.type === "repeated-phrase"
                          ? "bg-blue-950 border border-blue-800"
                          : r.type === "filler-line"
                          ? "bg-gray-800 border border-gray-700"
                          : "bg-amber-950 border border-amber-800"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={
                            r.type === "repeated-phrase"
                              ? "text-blue-400"
                              : r.type === "filler-line"
                              ? "text-gray-400"
                              : "text-amber-400"
                          }
                        >
                          {r.type === "repeated-phrase" ? "↻" : r.type === "filler-line" ? "¶" : "!"}
                        </span>
                        <span
                          className={
                            r.type === "repeated-phrase"
                              ? "text-blue-200"
                              : r.type === "filler-line"
                              ? "text-gray-300"
                              : "text-amber-200"
                          }
                        >
                          {r.original}
                        </span>
                        {r.line && (
                          <span className="text-gray-500 ml-auto">L{r.line}</span>
                        )}
                      </div>
                      {r.suggestion && (
                        <div className="text-gray-400 pl-4">
                          推奨: <span className="text-green-300 font-mono">{r.suggestion}</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Suggestions */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-4 space-y-3">
              <p className="text-sm font-medium text-gray-300">改善提案</p>
              <ol className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-blue-900 text-blue-300 text-xs flex items-center justify-center font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>

          </div>
        )}

        {/* Ad placeholder */}
        <div className="mt-8 border border-dashed border-gray-700 rounded-lg h-24 flex items-center justify-center">
          <span className="text-xs text-gray-600">Advertisement</span>
        </div>

      </div>
    </div>
  );
}
