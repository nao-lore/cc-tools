"use client";

import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChainStep {
  id: string;
  name: string;
  systemPrompt: string;
  userPrompt: string;
  expectedOutput: string;
}

type Lang = "ja" | "en";

// ---------------------------------------------------------------------------
// Translations
// ---------------------------------------------------------------------------

const T = {
  ja: {
    title: "プロンプトチェーン設計ツール",
    subtitle: "複数ステップのLLM呼び出しを視覚的に設計・連結",
    totalTokens: "チェーン合計トークン",
    stepCount: "ステップ数",
    dependencies: "依存関係",
    connected: "接続",
    reset: "リセット",
    export: "JSONエクスポート",
    copied: "JSONをコピーしました",
    downloaded: "ダウンロードしました",
    noSteps: "ステップがありません。「ステップを追加」から始めてください。",
    addStep: "ステップを追加",
    systemPrompt: "システムプロンプト",
    userPrompt: "ユーザープロンプト",
    expectedOutput: "期待する出力（説明）",
    insertPlaceholder: "+ {{previous_output}}",
    prevOutputRef: "の出力を",
    prevOutputRef2: "で参照",
    step: "ステップ",
    collapse: "折りたたむ",
    expand: "展開",
    moveUp: "上に移動",
    moveDown: "下に移動",
    delete: "削除",
    tok: "tok",
    output: "output",
    input: "input",
    systemPlaceholder: "AIの役割・制約・指示を記述...",
    userPlaceholder: "ユーザーからの入力・指示を記述...",
    outputPlaceholder: "このステップでAIが返すべき出力の形式・内容を説明...",
    confirmReset: "チェーンをリセットしますか？",
    adPlaceholder: "広告",
    guideTitle: "プロンプトチェーンビルダーの使い方",
    guide: [
      { step: "1", title: "ステップを追加・編集する", body: "デフォルトの3ステップを参考に、各ステップにシステムプロンプトとユーザープロンプトを入力します。" },
      { step: "2", title: "前のステップの出力を参照する", body: "ユーザープロンプトに {{previous_output}} を挿入すると、前ステップの出力を次ステップへ自動で引き渡せます。" },
      { step: "3", title: "ステップを並べ替え・削除する", body: "▲▼ボタンでステップの順序を変更、ゴミ箱ボタンで削除できます。" },
      { step: "4", title: "JSONエクスポートする", body: "完成したチェーンは「JSONエクスポート」ボタンでクリップボードにコピーできます。" },
    ],
    faqTitle: "プロンプトチェーンに関するよくある質問",
    faq: [
      { q: "プロンプトチェーンとは何ですか？", a: "複数のLLM呼び出しを連結し、前のステップの出力を次のステップの入力として使う設計パターンです。" },
      { q: "{{previous_output}} はどのように使いますか？", a: "ユーザープロンプト内に {{previous_output}} と記述すると、実行時に前ステップの出力テキストがそこに挿入されます。" },
      { q: "トークン数の目安はどう見ればいいですか？", a: "各ステップのトークン推定値はテキスト文字数÷4で概算しています。コンテキストウィンドウを超えないよう調整してください。" },
      { q: "エクスポートしたJSONはどう使いますか？", a: "JSON内の steps 配列には systemPrompt・userPrompt・expectedOutput が含まれます。Claude API・OpenAI APIのメッセージ配列にそのままマッピングして実装できます。" },
    ],
    relatedTools: "関連ツール",
    related: [
      { href: "/tools/few-shot-builder", label: "Few-Shot プロンプトビルダー", desc: "例示でAIの出力を制御" },
      { href: "/tools/temperature-top-p-tester", label: "Temperature / Top-P テスター", desc: "サンプリングパラメータを視覚化" },
      { href: "/tools/system-prompt-optimizer", label: "システムプロンプト最適化", desc: "プロンプトの構造を改善" },
    ],
    ctaTitle: "AIプロンプト設計ツールをもっと活用する",
    ctaDesc: "Few-Shot設計・システムプロンプト最適化など、プロンプトエンジニアリングを支援するツール集。",
    ctaBtn: "全ツール一覧を見る",
  },
  en: {
    title: "Prompt Chain Builder",
    subtitle: "Visually design and connect multi-step LLM call chains",
    totalTokens: "Chain Total Tokens",
    stepCount: "Steps",
    dependencies: "Dependencies",
    connected: "connected",
    reset: "Reset",
    export: "Export JSON",
    copied: "Copied to clipboard",
    downloaded: "Downloaded",
    noSteps: "No steps yet. Click \"Add Step\" to get started.",
    addStep: "Add Step",
    systemPrompt: "System Prompt",
    userPrompt: "User Prompt",
    expectedOutput: "Expected Output (description)",
    insertPlaceholder: "+ {{previous_output}}",
    prevOutputRef: "Step ",
    prevOutputRef2: " output referenced via",
    step: "Step",
    collapse: "Collapse",
    expand: "Expand",
    moveUp: "Move up",
    moveDown: "Move down",
    delete: "Delete",
    tok: "tok",
    output: "output",
    input: "input",
    systemPlaceholder: "Describe the AI role, constraints, instructions...",
    userPlaceholder: "Describe the user input or instructions...",
    outputPlaceholder: "Describe the expected output format and content...",
    confirmReset: "Reset the chain?",
    adPlaceholder: "Advertisement",
    guideTitle: "How to Use the Prompt Chain Builder",
    guide: [
      { step: "1", title: "Add & edit steps", body: "Use the default 3 steps as a reference and fill in system and user prompts for each step." },
      { step: "2", title: "Reference previous output", body: "Insert {{previous_output}} in a user prompt to automatically pass the previous step's output to the next step." },
      { step: "3", title: "Reorder & delete steps", body: "Use ▲▼ buttons to reorder steps and the trash button to delete them." },
      { step: "4", title: "Export as JSON", body: "Click \"Export JSON\" to copy the finished chain to your clipboard." },
    ],
    faqTitle: "FAQ about Prompt Chains",
    faq: [
      { q: "What is a prompt chain?", a: "A design pattern where multiple LLM calls are chained together, with each step's output used as the next step's input." },
      { q: "How do I use {{previous_output}}?", a: "Write {{previous_output}} inside a user prompt and the previous step's output text will be inserted there at runtime." },
      { q: "How should I interpret token counts?", a: "Token estimates are approximated as character count ÷ 4. Adjust steps to stay within the model's context window." },
      { q: "How do I use the exported JSON?", a: "The steps array contains systemPrompt, userPrompt, and expectedOutput. Map them directly to the message arrays for Claude API or OpenAI API." },
    ],
    relatedTools: "Related Tools",
    related: [
      { href: "/tools/few-shot-builder", label: "Few-Shot Prompt Builder", desc: "Control AI output with examples" },
      { href: "/tools/temperature-top-p-tester", label: "Temperature / Top-P Tester", desc: "Visualize sampling parameters" },
      { href: "/tools/system-prompt-optimizer", label: "System Prompt Optimizer", desc: "Improve prompt structure" },
    ],
    ctaTitle: "Get More from AI Prompt Tools",
    ctaDesc: "A toolkit for prompt engineering: few-shot design, system prompt optimization, and more.",
    ctaBtn: "View All Tools",
  },
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function totalStepTokens(step: ChainStep): number {
  return (
    estimateTokens(step.systemPrompt) +
    estimateTokens(step.userPrompt) +
    estimateTokens(step.expectedOutput)
  );
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

const PLACEHOLDER_TAG = "{{previous_output}}";

// ---------------------------------------------------------------------------
// Default steps
// ---------------------------------------------------------------------------

const DEFAULT_STEPS: ChainStep[] = [
  {
    id: makeId(),
    name: "ステップ1：情報収集",
    systemPrompt: "あなたは優秀なリサーチャーです。ユーザーの質問に対して、関連する情報を簡潔にまとめてください。",
    userPrompt: "以下のテーマについて重要なポイントを5つ挙げてください：\n[テーマをここに入力]",
    expectedOutput: "テーマに関する5つの重要ポイントのリスト",
  },
  {
    id: makeId(),
    name: "ステップ2：構造化",
    systemPrompt: "あなたは優秀なライターです。与えられた情報をわかりやすく構造化してください。",
    userPrompt: `前のステップの出力：\n${PLACEHOLDER_TAG}\n\n上記の情報を元に、読者向けのアウトラインを作成してください。`,
    expectedOutput: "見出しと小見出しを含む記事アウトライン",
  },
  {
    id: makeId(),
    name: "ステップ3：本文生成",
    systemPrompt: "あなたは経験豊富なコンテンツライターです。与えられたアウトラインを元に本文を執筆してください。",
    userPrompt: `アウトライン：\n${PLACEHOLDER_TAG}\n\n各セクションを300字程度で肉付けした本文を書いてください。`,
    expectedOutput: "完成した記事本文（各セクション300字程度）",
  },
];

// ---------------------------------------------------------------------------
// StepCard component
// ---------------------------------------------------------------------------

interface StepCardProps {
  step: ChainStep;
  index: number;
  total: number;
  lang: Lang;
  onChange: (id: string, patch: Partial<ChainStep>) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
}

function StepCard({ step, index, total, lang, onChange, onMoveUp, onMoveDown, onDelete }: StepCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const t = T[lang];
  const stepTokens = totalStepTokens(step);
  const hasPrevOutput = step.userPrompt.includes(PLACEHOLDER_TAG);

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-500/20 text-violet-200 text-xs font-bold flex items-center justify-center border border-violet-500/30">
          {index + 1}
        </span>
        <input
          type="text"
          value={step.name}
          onChange={(e) => onChange(step.id, { name: e.target.value })}
          placeholder={`${t.step}${index + 1}`}
          className="flex-1 text-sm font-semibold bg-transparent border-0 border-b border-transparent focus:border-violet-400/50 focus:outline-none text-white placeholder-violet-300/40 py-0.5"
        />
        <span className="flex-shrink-0 text-xs text-violet-200 glass-card px-2 py-0.5 rounded-full font-mono whitespace-nowrap">
          ~{stepTokens.toLocaleString()} {t.tok}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onMoveUp(step.id)}
            disabled={index === 0}
            title={t.moveUp}
            className="w-6 h-6 flex items-center justify-center rounded text-violet-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M8 3l5 5H3l5-5z" />
            </svg>
          </button>
          <button
            onClick={() => onMoveDown(step.id)}
            disabled={index === total - 1}
            title={t.moveDown}
            className="w-6 h-6 flex items-center justify-center rounded text-violet-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M8 13l-5-5h10l-5 5z" />
            </svg>
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? t.expand : t.collapse}
            className="w-6 h-6 flex items-center justify-center rounded text-violet-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className={`w-3.5 h-3.5 transition-transform ${collapsed ? "-rotate-90" : ""}`}>
              <path d="M8 10l-5-5h10l-5 5z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(step.id)}
            title={t.delete}
            className="w-6 h-6 flex items-center justify-center rounded text-violet-300 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M6 2h4a1 1 0 0 1 1 1v1h2v1H3V4h2V3a1 1 0 0 1 1-1zm0 1v1h4V3H6zM4 6h8l-.8 8H4.8L4 6zm2 1v6h1V7H6zm3 0v6h1V7H9z" />
            </svg>
          </button>
        </div>
      </div>

      {hasPrevOutput && index > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-cyan-300 glass-card rounded-lg px-2.5 py-1.5 border border-cyan-500/20">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.5 10.5h-1v-5h1v5zm0-6.5h-1V4h1v1z" />
          </svg>
          <span>
            {lang === "ja"
              ? `ステップ${index}の出力を `
              : `Step ${index} output referenced via `}
            <code className="font-mono bg-cyan-500/10 px-1 rounded">{PLACEHOLDER_TAG}</code>
            {lang === "ja" ? " で参照" : ""}
          </span>
        </div>
      )}

      {!collapsed && (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-violet-100 uppercase tracking-wide">{t.systemPrompt}</label>
              <span className="text-xs text-violet-200 font-mono">{estimateTokens(step.systemPrompt).toLocaleString()} {t.tok}</span>
            </div>
            <textarea
              value={step.systemPrompt}
              onChange={(e) => onChange(step.id, { systemPrompt: e.target.value })}
              placeholder={t.systemPlaceholder}
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg number-input text-white resize-y focus:outline-none neon-focus placeholder-violet-300/40 font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-violet-100 uppercase tracking-wide">{t.userPrompt}</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onChange(step.id, {
                      userPrompt: step.userPrompt + (step.userPrompt && !step.userPrompt.endsWith("\n") ? "\n" : "") + PLACEHOLDER_TAG,
                    })
                  }
                  className="text-xs text-violet-200 hover:text-white bg-violet-500/15 hover:bg-violet-500/25 px-2 py-0.5 rounded transition-colors cursor-pointer"
                >
                  {t.insertPlaceholder}
                </button>
                <span className="text-xs text-violet-200 font-mono">{estimateTokens(step.userPrompt).toLocaleString()} {t.tok}</span>
              </div>
            </div>
            <textarea
              value={step.userPrompt}
              onChange={(e) => onChange(step.id, { userPrompt: e.target.value })}
              placeholder={t.userPlaceholder}
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-lg number-input text-white resize-y focus:outline-none neon-focus placeholder-violet-300/40 font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-violet-100 uppercase tracking-wide">{t.expectedOutput}</label>
              <span className="text-xs text-violet-200 font-mono">{estimateTokens(step.expectedOutput).toLocaleString()} {t.tok}</span>
            </div>
            <textarea
              value={step.expectedOutput}
              onChange={(e) => onChange(step.id, { expectedOutput: e.target.value })}
              placeholder={t.outputPlaceholder}
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg number-input text-white resize-y focus:outline-none neon-focus placeholder-violet-300/40"
              style={{ background: "rgba(251,191,36,0.05)", borderColor: "rgba(251,191,36,0.15)" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Arrow connector
// ---------------------------------------------------------------------------

interface ConnectorProps {
  fromIndex: number;
  lang: Lang;
}

function Connector({ fromIndex, lang }: ConnectorProps) {
  const t = T[lang];
  return (
    <div className="flex flex-col items-center py-1 select-none">
      <div className="w-px h-3" style={{ background: "rgba(139,92,246,0.3)" }} />
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-4-4m4 4l4-4" />
        </svg>
        <span className="text-xs text-cyan-300 font-mono glass-card border border-violet-500/20 px-2 py-0.5 rounded-full mt-0.5">
          {t.output} {fromIndex + 1} → {t.input} {fromIndex + 2}
        </span>
      </div>
      <div className="w-px h-3" style={{ background: "rgba(139,92,246,0.3)" }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PromptChainBuilder() {
  const [steps, setSteps] = useState<ChainStep[]>(DEFAULT_STEPS);
  const [exportMsg, setExportMsg] = useState("");
  const [lang, setLang] = useState<Lang>("ja");

  const t = T[lang];

  const handleChange = useCallback((id: string, patch: Partial<ChainStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const handleAdd = useCallback(() => {
    const newIndex = steps.length + 1;
    setSteps((prev) => [
      ...prev,
      {
        id: makeId(),
        name: `ステップ${newIndex}`,
        systemPrompt: "",
        userPrompt: `前のステップの出力：\n${PLACEHOLDER_TAG}\n\n`,
        expectedOutput: "",
      },
    ]);
  }, [steps.length]);

  const handleDelete = useCallback((id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleMoveUp = useCallback((id: string) => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const handleMoveDown = useCallback((id: string) => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm(t.confirmReset)) {
      setSteps(DEFAULT_STEPS.map((s) => ({ ...s, id: makeId() })));
    }
  }, [t.confirmReset]);

  const handleExport = useCallback(async () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      totalTokenEstimate: steps.reduce((sum, s) => sum + totalStepTokens(s), 0),
      steps: steps.map((s, i) => ({
        index: i + 1,
        name: s.name,
        systemPrompt: s.systemPrompt,
        userPrompt: s.userPrompt,
        expectedOutput: s.expectedOutput,
        tokenEstimate: totalStepTokens(s),
        referencesPreviousOutput: s.userPrompt.includes(PLACEHOLDER_TAG),
      })),
    };
    const json = JSON.stringify(data, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setExportMsg(t.copied);
    } catch {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "prompt-chain.json";
      a.click();
      URL.revokeObjectURL(url);
      setExportMsg(t.downloaded);
    }
    setTimeout(() => setExportMsg(""), 2500);
  }, [steps, t.copied, t.downloaded]);

  const totalTokens = steps.reduce((sum, s) => sum + totalStepTokens(s), 0);
  const connectedSteps = steps.filter((s, i) => i > 0 && s.userPrompt.includes(PLACEHOLDER_TAG)).length;

  return (
    <div className="space-y-4">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1); }
          50% { box-shadow: 0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(139,92,246,0.2); }
        }
        @keyframes float-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes border-spin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .glass-card-bright {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .neon-focus:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(167,139,250,0.6), 0 0 20px rgba(167,139,250,0.2);
        }
        .glow-text {
          text-shadow: 0 0 30px rgba(196,181,253,0.6);
        }
        .result-card-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .tab-panel {
          animation: float-in 0.25s ease-out;
        }
        .gradient-border-box {
          position: relative;
        }
        .gradient-border-box::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(139,92,246,0.6), rgba(6,182,212,0.4), rgba(139,92,246,0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .number-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2d9f3;
        }
        .number-input::placeholder { color: rgba(196,181,253,0.4); }
        .table-row-stripe:hover {
          background: rgba(139,92,246,0.08);
          transition: background 0.2s ease;
        }
      `}</style>

      {/* Language toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 glass-card rounded-xl px-3 py-1.5">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-violet-300">
              <circle cx="8" cy="8" r="6" />
              <path strokeLinecap="round" d="M8 5v3l2 2" />
            </svg>
            <div>
              <div className="text-xs text-violet-200">{t.totalTokens}</div>
              <div className="text-sm font-bold text-white font-mono">~{totalTokens.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 glass-card rounded-xl px-3 py-1.5" style={{ background: "rgba(139,92,246,0.1)" }}>
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-violet-300">
              <path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h8v2H2v-2z" />
            </svg>
            <div>
              <div className="text-xs text-violet-200">{t.stepCount}</div>
              <div className="text-sm font-bold text-white">{steps.length}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 glass-card rounded-xl px-3 py-1.5" style={{ background: "rgba(6,182,212,0.08)" }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-cyan-300">
              <path strokeLinecap="round" d="M8 2v12M5 11l3 3 3-3" />
            </svg>
            <div>
              <div className="text-xs text-violet-200">{t.dependencies}</div>
              <div className="text-sm font-bold text-white">{connectedSteps} {t.connected}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs text-violet-200 hover:text-white glass-card rounded-lg transition-colors cursor-pointer"
          >
            {t.reset}
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors cursor-pointer"
          >
            {exportMsg || t.export}
          </button>
        </div>
      </div>

      {/* Chain flow */}
      <div className="space-y-0">
        {steps.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-violet-200">
            <p className="text-sm">{t.noSteps}</p>
          </div>
        ) : (
          steps.map((step, index) => (
            <div key={step.id}>
              <StepCard
                step={step}
                index={index}
                total={steps.length}
                lang={lang}
                onChange={handleChange}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onDelete={handleDelete}
              />
              {index < steps.length - 1 && <Connector fromIndex={index} lang={lang} />}
            </div>
          ))
        )}
      </div>

      {/* Add step button */}
      <button
        onClick={handleAdd}
        className="w-full py-3 rounded-2xl text-sm text-violet-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
        style={{ border: "2px dashed rgba(139,92,246,0.35)" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.6)"; (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.06)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.35)"; (e.currentTarget as HTMLElement).style.background = ""; }}
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
          <path d="M8 2a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2H9v4a1 1 0 1 1-2 0V9H3a1 1 0 1 1 0-2h4V3a1 1 0 0 1 1-1z" />
        </svg>
        {t.addStep}
      </button>

      {/* Ad placeholder */}
      <div className="glass-card rounded-2xl p-4 flex items-center justify-center min-h-[90px] text-violet-200/30 text-sm select-none">
        {t.adPlaceholder}
      </div>

      {/* Guide */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.guideTitle}</h2>
        <ol className="space-y-3.5">
          {t.guide.map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-violet-500/20 text-violet-200 text-sm font-bold flex items-center justify-center border border-violet-500/30">{item.step}</span>
              <div>
                <div className="font-medium text-white/90 text-sm">{item.title}</div>
                <div className="text-xs text-violet-200 mt-0.5">{item.body}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* FAQ */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.faqTitle}</h2>
        <div className="space-y-4">
          {t.faq.map((item, i) => (
            <details key={i} className="group glass-card rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-semibold text-white/90 hover:bg-white/5 list-none">
                <span>Q. {item.q}</span>
                <span className="text-violet-400 text-lg leading-none group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-4 pb-4 pt-1 text-sm text-violet-100 border-t border-white/6">{item.a}</div>
            </details>
          ))}
        </div>
      </div>

      {/* JSON-LD FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "プロンプトチェーンとは何ですか？", "acceptedAnswer": { "@type": "Answer", "text": "複数のLLM呼び出しを連結し、前ステップの出力を次ステップの入力として使う設計パターンです。" } },
              { "@type": "Question", "name": "{{previous_output}} はどのように使いますか？", "acceptedAnswer": { "@type": "Answer", "text": "ユーザープロンプト内に記述すると、実行時に前ステップの出力テキストがそこに挿入されます。" } },
              { "@type": "Question", "name": "エクスポートしたJSONはどう使いますか？", "acceptedAnswer": { "@type": "Answer", "text": "JSON内のsteps配列にsystemPrompt・userPrompt・expectedOutputが含まれます。Claude API・OpenAI APIのメッセージ配列にマッピングして実装できます。" } },
            ],
          }),
        }}
      />

      {/* Related tools */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedTools}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {t.related.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block p-4 rounded-xl border border-white/8 hover:border-violet-500/40 transition-all duration-200"
              style={{ background: "rgba(139,92,246,0)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0)"; }}
            >
              <div className="font-medium text-white/90 text-sm">{link.label}</div>
              <div className="text-xs text-violet-100 mt-1">{link.desc}</div>
            </a>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl p-5 text-white text-center space-y-3" style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.8), rgba(124,58,237,0.6))", border: "1px solid rgba(139,92,246,0.3)" }}>
        <p className="text-base font-bold">{t.ctaTitle}</p>
        <p className="text-xs opacity-80">{t.ctaDesc}</p>
        <a href="/tools" className="inline-block bg-white text-violet-700 text-sm font-bold px-5 py-2 rounded-xl hover:bg-violet-50 transition-colors">
          {t.ctaBtn}
        </a>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "プロンプトチェーン設計ツール",
  "description": "複数ステップのプロンプトを視覚的に連結、入出力依存関係を可視化",
  "url": "https://tools.loresync.dev/prompt-chain-builder",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "JPY" },
  "inLanguage": "ja"
}`
        }}
      />
    </div>
  );
}
