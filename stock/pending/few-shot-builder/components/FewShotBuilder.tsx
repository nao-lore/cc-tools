"use client";

import { useState, useCallback } from "react";

// --- Types ---
interface Example {
  id: string;
  input: string;
  output: string;
}

type Format = "chatml" | "plaintext" | "json" | "xml";

// --- Helpers ---
function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function buildPrompt(
  systemPrompt: string,
  examples: Example[],
  userInput: string,
  format: Format
): string {
  if (format === "chatml") {
    const lines: string[] = [];
    if (systemPrompt) {
      lines.push(`<|im_start|>system\n${systemPrompt}\n<|im_end|>`);
    }
    for (const ex of examples) {
      if (!ex.input && !ex.output) continue;
      lines.push(`<|im_start|>user\n${ex.input}\n<|im_end|>`);
      lines.push(`<|im_start|>assistant\n${ex.output}\n<|im_end|>`);
    }
    if (userInput) {
      lines.push(`<|im_start|>user\n${userInput}\n<|im_end|>`);
      lines.push(`<|im_start|>assistant`);
    }
    return lines.join("\n");
  }

  if (format === "plaintext") {
    const lines: string[] = [];
    if (systemPrompt) {
      lines.push(`### System\n${systemPrompt}\n`);
    }
    for (const ex of examples) {
      if (!ex.input && !ex.output) continue;
      lines.push(`### Input\n${ex.input}\n\n### Output\n${ex.output}\n`);
    }
    if (userInput) {
      lines.push(`### Input\n${userInput}\n\n### Output`);
    }
    return lines.join("\n---\n\n");
  }

  if (format === "json") {
    const messages: object[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    for (const ex of examples) {
      if (!ex.input && !ex.output) continue;
      messages.push({ role: "user", content: ex.input });
      messages.push({ role: "assistant", content: ex.output });
    }
    if (userInput) {
      messages.push({ role: "user", content: userInput });
    }
    return JSON.stringify({ messages }, null, 2);
  }

  if (format === "xml") {
    const lines: string[] = ["<prompt>"];
    if (systemPrompt) {
      lines.push(`  <system>${systemPrompt}</system>`);
    }
    lines.push("  <examples>");
    for (const ex of examples) {
      if (!ex.input && !ex.output) continue;
      lines.push(`    <example>`);
      lines.push(`      <input>${ex.input}</input>`);
      lines.push(`      <output>${ex.output}</output>`);
      lines.push(`    </example>`);
    }
    lines.push("  </examples>");
    if (userInput) {
      lines.push(`  <user_input>${userInput}</user_input>`);
    }
    lines.push("</prompt>");
    return lines.join("\n");
  }

  return "";
}

const FORMAT_LABELS: Record<Format, string> = {
  chatml: "ChatML (OpenAI)",
  plaintext: "Plain Text",
  json: "JSON (Messages API)",
  xml: "XML (Claude style)",
};

const TEMPLATES = [
  {
    name: "翻訳 (英→日)",
    system: "あなたは優秀な翻訳者です。英語を自然な日本語に翻訳してください。",
    examples: [
      { input: "The early bird catches the worm.", output: "早起きは三文の徳。" },
      { input: "Time flies when you're having fun.", output: "楽しい時間はあっという間に過ぎる。" },
    ],
    userInput: "Actions speak louder than words.",
  },
  {
    name: "感情分類",
    system: "文章の感情をPositive / Negative / Neutralの3つに分類してください。",
    examples: [
      { input: "今日はとても良い天気で気分も最高です！", output: "Positive" },
      { input: "サービスが最悪で二度と行きたくない。", output: "Negative" },
      { input: "明日の会議は3時からです。", output: "Neutral" },
    ],
    userInput: "なかなか難しい問題ですが、頑張ってみます。",
  },
  {
    name: "要約",
    system: "与えられたテキストを1〜2文で簡潔に要約してください。",
    examples: [
      {
        input: "機械学習は人工知能の一分野であり、コンピュータがデータから自動的に学習し、経験を積むことで性能を向上させる技術です。",
        output: "機械学習とは、AIがデータから自動的に学習して性能を改善する技術です。",
      },
    ],
    userInput: "",
  },
];

export default function FewShotBuilder() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [examples, setExamples] = useState<Example[]>([
    { id: uid(), input: "", output: "" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [format, setFormat] = useState<Format>("json");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"build" | "preview">("build");

  const addExample = () =>
    setExamples((prev) => [...prev, { id: uid(), input: "", output: "" }]);

  const removeExample = (id: string) =>
    setExamples((prev) => prev.filter((e) => e.id !== id));

  const updateExample = (id: string, field: "input" | "output", value: string) =>
    setExamples((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );

  const loadTemplate = (t: typeof TEMPLATES[0]) => {
    setSystemPrompt(t.system);
    setExamples(t.examples.map((e) => ({ ...e, id: uid() })));
    setUserInput(t.userInput);
  };

  const output = useCallback(
    () => buildPrompt(systemPrompt, examples, userInput, format),
    [systemPrompt, examples, userInput, format]
  )();

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const tokenEstimate = Math.ceil(output.length / 4);

  return (
    <div className="space-y-5">
      {/* Templates */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="text-sm font-semibold text-gray-700 mb-2">テンプレートから開始</div>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.name}
              onClick={() => loadTemplate(t)}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm rounded-xl border border-indigo-200 font-medium transition-colors"
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("build")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === "build" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          編集
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === "preview" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          プレビュー
        </button>
      </div>

      {activeTab === "build" && (
        <>
          {/* System Prompt */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              システムプロンプト <span className="font-normal text-gray-400">（任意）</span>
            </label>
            <textarea
              className="w-full h-20 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="LLMへの役割・指示を入力..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
          </div>

          {/* Examples */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                Few-shot 例文 <span className="ml-1 text-gray-400">({examples.length}件)</span>
              </span>
              <button
                onClick={addExample}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                + 例文を追加
              </button>
            </div>
            {examples.map((ex, i) => (
              <div key={ex.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500">例文 {i + 1}</span>
                  {examples.length > 1 && (
                    <button
                      onClick={() => removeExample(ex.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      削除
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Input (User)</label>
                    <textarea
                      className="w-full h-24 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="入力例..."
                      value={ex.input}
                      onChange={(e) => updateExample(ex.id, "input", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Output (Assistant)</label>
                    <textarea
                      className="w-full h-24 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="期待する出力..."
                      value={ex.output}
                      onChange={(e) => updateExample(ex.id, "output", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* User Input */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              実際のユーザー入力 <span className="font-normal text-gray-400">（任意）</span>
            </label>
            <textarea
              className="w-full h-20 p-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="LLMに実際に渡したいユーザーの入力..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
          </div>
        </>
      )}

      {activeTab === "preview" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          {/* Format selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  format === f
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {FORMAT_LABELS[f]}
              </button>
            ))}
          </div>

          <div className="relative">
            <pre className="bg-gray-950 text-green-300 rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap max-h-96 font-mono leading-relaxed">
              {output || <span className="text-gray-600">（例文を追加するとここに表示されます）</span>}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="mt-2 flex justify-end gap-3 text-xs text-gray-400">
            <span>{output.length} chars</span>
            <span>≈ {tokenEstimate.toLocaleString()} tokens</span>
          </div>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このFew-shot例文ビルダーツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">LLM用のfew-shot promptを例文付きで構築できるツール。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このFew-shot例文ビルダーツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "LLM用のfew-shot promptを例文付きで構築できるツール。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Few-shot例文ビルダー",
  "description": "LLM用のfew-shot promptを例文付きで構築できるツール",
  "url": "https://tools.loresync.dev/few-shot-builder",
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
