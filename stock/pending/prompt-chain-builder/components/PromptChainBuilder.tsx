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
  onChange: (id: string, patch: Partial<ChainStep>) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
}

function StepCard({ step, index, total, onChange, onMoveUp, onMoveDown, onDelete }: StepCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const stepTokens = totalStepTokens(step);
  const hasPrevOutput = step.userPrompt.includes(PLACEHOLDER_TAG);

  return (
    <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        {/* Step number badge */}
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>

        {/* Step name */}
        <input
          type="text"
          value={step.name}
          onChange={(e) => onChange(step.id, { name: e.target.value })}
          placeholder={`ステップ${index + 1}の名前`}
          className="flex-1 text-sm font-semibold bg-transparent border-0 border-b border-transparent focus:border-indigo-300 focus:outline-none text-gray-800 placeholder-gray-400 py-0.5"
        />

        {/* Token badge */}
        <span className="flex-shrink-0 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-mono whitespace-nowrap">
          ~{stepTokens.toLocaleString()} tok
        </span>

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onMoveUp(step.id)}
            disabled={index === 0}
            title="上に移動"
            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M8 3l5 5H3l5-5z" />
            </svg>
          </button>
          <button
            onClick={() => onMoveDown(step.id)}
            disabled={index === total - 1}
            title="下に移動"
            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M8 13l-5-5h10l-5 5z" />
            </svg>
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "展開" : "折りたたむ"}
            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className={`w-3.5 h-3.5 transition-transform ${collapsed ? "-rotate-90" : ""}`}>
              <path d="M8 10l-5-5h10l-5 5z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(step.id)}
            title="削除"
            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M6 2h4a1 1 0 0 1 1 1v1h2v1H3V4h2V3a1 1 0 0 1 1-1zm0 1v1h4V3H6zM4 6h8l-.8 8H4.8L4 6zm2 1v6h1V7H6zm3 0v6h1V7H9z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Previous output indicator */}
      {hasPrevOutput && index > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.5 10.5h-1v-5h1v5zm0-6.5h-1V4h1v1z" />
          </svg>
          <span>ステップ{index}の出力を <code className="font-mono bg-emerald-100 px-1 rounded">{PLACEHOLDER_TAG}</code> で参照</span>
        </div>
      )}

      {!collapsed && (
        <div className="space-y-3">
          {/* System prompt */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                システムプロンプト
              </label>
              <span className="text-xs text-gray-400 font-mono">
                {estimateTokens(step.systemPrompt).toLocaleString()} tok
              </span>
            </div>
            <textarea
              value={step.systemPrompt}
              onChange={(e) => onChange(step.id, { systemPrompt: e.target.value })}
              placeholder="AIの役割・制約・指示を記述..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder-gray-400 font-mono"
            />
          </div>

          {/* User prompt */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                ユーザープロンプト
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onChange(step.id, {
                      userPrompt: step.userPrompt + (step.userPrompt && !step.userPrompt.endsWith("\n") ? "\n" : "") + PLACEHOLDER_TAG,
                    })
                  }
                  title="前のステップの出力を参照するプレースホルダーを挿入"
                  className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors cursor-pointer"
                >
                  + {PLACEHOLDER_TAG}
                </button>
                <span className="text-xs text-gray-400 font-mono">
                  {estimateTokens(step.userPrompt).toLocaleString()} tok
                </span>
              </div>
            </div>
            <textarea
              value={step.userPrompt}
              onChange={(e) => onChange(step.id, { userPrompt: e.target.value })}
              placeholder={`ユーザーからの入力・指示を記述...\n前のステップの結果を使う場合は ${PLACEHOLDER_TAG} を挿入`}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder-gray-400 font-mono"
            />
          </div>

          {/* Expected output */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                期待する出力（説明）
              </label>
              <span className="text-xs text-gray-400 font-mono">
                {estimateTokens(step.expectedOutput).toLocaleString()} tok
              </span>
            </div>
            <textarea
              value={step.expectedOutput}
              onChange={(e) => onChange(step.id, { expectedOutput: e.target.value })}
              placeholder="このステップでAIが返すべき出力の形式・内容を説明..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-amber-50 text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 placeholder-gray-400"
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
}

function Connector({ fromIndex }: ConnectorProps) {
  return (
    <div className="flex flex-col items-center py-1 select-none">
      <div className="w-px h-3 bg-gray-300" />
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-4-4m4 4l4-4" />
        </svg>
        <span className="text-xs text-indigo-500 font-mono bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full mt-0.5">
          output {fromIndex + 1} → input {fromIndex + 2}
        </span>
      </div>
      <div className="w-px h-3 bg-gray-300" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PromptChainBuilder() {
  const [steps, setSteps] = useState<ChainStep[]>(DEFAULT_STEPS);
  const [exportMsg, setExportMsg] = useState("");

  // --- Mutations ---

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
    if (window.confirm("チェーンをリセットしますか？")) {
      setSteps(DEFAULT_STEPS.map((s) => ({ ...s, id: makeId() })));
    }
  }, []);

  // --- Export ---

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
      setExportMsg("JSONをコピーしました");
    } catch {
      // Fallback: download
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "prompt-chain.json";
      a.click();
      URL.revokeObjectURL(url);
      setExportMsg("ダウンロードしました");
    }
    setTimeout(() => setExportMsg(""), 2500);
  }, [steps]);

  // --- Stats ---

  const totalTokens = steps.reduce((sum, s) => sum + totalStepTokens(s), 0);
  const connectedSteps = steps.filter((s, i) => i > 0 && s.userPrompt.includes(PLACEHOLDER_TAG)).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Total token estimate */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1.5">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-gray-500">
              <circle cx="8" cy="8" r="6" />
              <path strokeLinecap="round" d="M8 5v3l2 2" />
            </svg>
            <div>
              <div className="text-xs text-gray-500">チェーン合計トークン</div>
              <div className="text-sm font-bold text-gray-800 font-mono">~{totalTokens.toLocaleString()}</div>
            </div>
          </div>

          {/* Step count */}
          <div className="flex items-center gap-2 bg-indigo-50 rounded-xl px-3 py-1.5">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-indigo-500">
              <path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h8v2H2v-2z" />
            </svg>
            <div>
              <div className="text-xs text-indigo-500">ステップ数</div>
              <div className="text-sm font-bold text-indigo-800">{steps.length}</div>
            </div>
          </div>

          {/* Connected steps */}
          <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-1.5">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-emerald-600">
              <path strokeLinecap="round" d="M8 2v12M5 11l3 3 3-3" />
            </svg>
            <div>
              <div className="text-xs text-emerald-600">依存関係</div>
              <div className="text-sm font-bold text-emerald-800">{connectedSteps} 接続</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            リセット
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
          >
            {exportMsg || "JSONエクスポート"}
          </button>
        </div>
      </div>

      {/* Chain flow */}
      <div className="space-y-0">
        {steps.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-12 text-center text-gray-400">
            <p className="text-sm">ステップがありません。「ステップを追加」から始めてください。</p>
          </div>
        ) : (
          steps.map((step, index) => (
            <div key={step.id}>
              <StepCard
                step={step}
                index={index}
                total={steps.length}
                onChange={handleChange}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onDelete={handleDelete}
              />
              {index < steps.length - 1 && <Connector fromIndex={index} />}
            </div>
          ))
        )}
      </div>

      {/* Add step button */}
      <button
        onClick={handleAdd}
        className="w-full py-3 border-2 border-dashed border-indigo-200 rounded-2xl text-sm text-indigo-500 hover:border-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
          <path d="M8 2a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2H9v4a1 1 0 1 1-2 0V9H3a1 1 0 1 1 0-2h4V3a1 1 0 0 1 1-1z" />
        </svg>
        ステップを追加
      </button>

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center min-h-[90px] text-gray-300 text-sm select-none">
        広告
      </div>
    </div>
  );
}
