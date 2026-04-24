"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ParamType = "string" | "number" | "boolean" | "array" | "object";

interface Parameter {
  id: string;
  name: string;
  type: ParamType;
  description: string;
  required: boolean;
  enumValues: string; // comma-separated
}

interface FunctionDef {
  id: string;
  name: string;
  description: string;
  parameters: Parameter[];
}

type OutputTab = "openai" | "anthropic";

// ─── Utilities ────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function buildParamSchema(param: Parameter): Record<string, unknown> {
  const schema: Record<string, unknown> = { type: param.type };
  if (param.description.trim()) {
    schema.description = param.description.trim();
  }
  if (param.enumValues.trim()) {
    const values = param.enumValues
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (values.length > 0) schema.enum = values;
  }
  return schema;
}

function buildOpenAISchema(fn: FunctionDef): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const p of fn.parameters) {
    if (!p.name.trim()) continue;
    properties[p.name.trim()] = buildParamSchema(p);
    if (p.required) required.push(p.name.trim());
  }

  return {
    type: "function",
    function: {
      name: fn.name.trim() || "my_function",
      description: fn.description.trim() || undefined,
      parameters: {
        type: "object",
        properties,
        ...(required.length > 0 ? { required } : {}),
      },
    },
  };
}

function buildAnthropicSchema(fn: FunctionDef): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const p of fn.parameters) {
    if (!p.name.trim()) continue;
    properties[p.name.trim()] = buildParamSchema(p);
    if (p.required) required.push(p.name.trim());
  }

  return {
    name: fn.name.trim() || "my_function",
    description: fn.description.trim() || undefined,
    input_schema: {
      type: "object",
      properties,
      ...(required.length > 0 ? { required } : {}),
    },
  };
}

function makeFn(): FunctionDef {
  return { id: uid(), name: "", description: "", parameters: [] };
}

function makeParam(): Parameter {
  return {
    id: uid(),
    name: "",
    type: "string",
    description: "",
    required: false,
    enumValues: "",
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ParameterRow({
  param,
  onChange,
  onRemove,
}: {
  param: Parameter;
  onChange: (updated: Parameter) => void;
  onRemove: () => void;
}) {
  const update = (patch: Partial<Parameter>) => onChange({ ...param, ...patch });

  return (
    <div className="grid grid-cols-12 gap-2 items-start bg-gray-900 border border-gray-700 rounded-lg p-3">
      {/* Name */}
      <div className="col-span-3">
        <input
          type="text"
          placeholder="param_name"
          value={param.name}
          onChange={(e) => update({ name: e.target.value })}
          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-xs font-mono text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500"
        />
      </div>
      {/* Type */}
      <div className="col-span-2">
        <select
          value={param.type}
          onChange={(e) => update({ type: e.target.value as ParamType })}
          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-xs text-gray-100 focus:outline-none focus:border-blue-500"
        >
          <option value="string">string</option>
          <option value="number">number</option>
          <option value="boolean">boolean</option>
          <option value="array">array</option>
          <option value="object">object</option>
        </select>
      </div>
      {/* Description */}
      <div className="col-span-4">
        <input
          type="text"
          placeholder="Description"
          value={param.description}
          onChange={(e) => update({ description: e.target.value })}
          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500"
        />
      </div>
      {/* Enum */}
      <div className="col-span-2">
        <input
          type="text"
          placeholder="enum (a,b,c)"
          value={param.enumValues}
          onChange={(e) => update({ enumValues: e.target.value })}
          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-xs text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500"
        />
      </div>
      {/* Required + Remove */}
      <div className="col-span-1 flex items-center gap-2 justify-end pt-1">
        <button
          onClick={() => update({ required: !param.required })}
          title="Toggle required"
          className={`text-xs px-1.5 py-0.5 rounded font-medium border transition-colors ${
            param.required
              ? "bg-blue-700 border-blue-500 text-blue-100"
              : "bg-gray-800 border-gray-600 text-gray-500 hover:border-gray-400"
          }`}
        >
          req
        </button>
        <button
          onClick={onRemove}
          className="text-gray-600 hover:text-red-400 transition-colors text-sm leading-none"
          title="Remove parameter"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function FunctionCard({
  fn,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  fn: FunctionDef;
  index: number;
  onChange: (updated: FunctionDef) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const updateFn = (patch: Partial<FunctionDef>) => onChange({ ...fn, ...patch });

  const addParam = () =>
    updateFn({ parameters: [...fn.parameters, makeParam()] });

  const updateParam = (id: string, updated: Parameter) =>
    updateFn({
      parameters: fn.parameters.map((p) => (p.id === id ? updated : p)),
    });

  const removeParam = (id: string) =>
    updateFn({ parameters: fn.parameters.filter((p) => p.id !== id) });

  return (
    <div className="border border-gray-700 rounded-xl p-4 space-y-4 bg-gray-950">
      {/* Function header */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 font-mono w-5">#{index + 1}</span>
        <input
          type="text"
          placeholder="function_name"
          value={fn.name}
          onChange={(e) => updateFn({ name: e.target.value })}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500"
        />
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none px-1"
            title="Remove function"
          >
            ×
          </button>
        )}
      </div>
      <textarea
        placeholder="Function description — what does this function do?"
        value={fn.description}
        onChange={(e) => updateFn({ description: e.target.value })}
        rows={2}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
      />

      {/* Parameters */}
      <div className="space-y-2">
        {fn.parameters.length > 0 && (
          <div className="grid grid-cols-12 gap-2 px-3 text-xs text-gray-500 font-medium">
            <div className="col-span-3">Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-2">Enum</div>
            <div className="col-span-1"></div>
          </div>
        )}
        {fn.parameters.map((p) => (
          <ParameterRow
            key={p.id}
            param={p}
            onChange={(updated) => updateParam(p.id, updated)}
            onRemove={() => removeParam(p.id)}
          />
        ))}
        <button
          onClick={addParam}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 mt-1"
        >
          <span>+</span> パラメータを追加
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FunctionCallingSchema() {
  const [functions, setFunctions] = useState<FunctionDef[]>([makeFn()]);
  const [activeTab, setActiveTab] = useState<OutputTab>("openai");
  const [copiedTab, setCopiedTab] = useState<OutputTab | null>(null);

  const updateFunction = useCallback(
    (id: string, updated: FunctionDef) =>
      setFunctions((fns) => fns.map((f) => (f.id === id ? updated : f))),
    []
  );

  const removeFunction = useCallback(
    (id: string) => setFunctions((fns) => fns.filter((f) => f.id !== id)),
    []
  );

  const addFunction = () => setFunctions((fns) => [...fns, makeFn()]);

  const openaiOutput = JSON.stringify(
    functions.map(buildOpenAISchema),
    null,
    2
  );

  const anthropicOutput = JSON.stringify(
    functions.map(buildAnthropicSchema),
    null,
    2
  );

  const currentOutput = activeTab === "openai" ? openaiOutput : anthropicOutput;

  const handleCopy = (tab: OutputTab) => {
    const text = tab === "openai" ? openaiOutput : anthropicOutput;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTab(tab);
      setTimeout(() => setCopiedTab(null), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            Function Calling スキーマビルダー
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            OpenAI / Anthropic 両対応の Tools 定義 JSON を視覚的に生成。
          </p>
        </div>

        {/* Function cards */}
        <div className="space-y-4">
          {functions.map((fn, i) => (
            <FunctionCard
              key={fn.id}
              fn={fn}
              index={i}
              onChange={(updated) => updateFunction(fn.id, updated)}
              onRemove={() => removeFunction(fn.id)}
              canRemove={functions.length > 1}
            />
          ))}
          <button
            onClick={addFunction}
            className="w-full py-2.5 border border-dashed border-gray-700 rounded-xl text-sm text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors"
          >
            + 関数を追加
          </button>
        </div>

        {/* Output */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex bg-gray-900 border border-gray-700 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setActiveTab("openai")}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "openai"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                OpenAI
              </button>
              <button
                onClick={() => setActiveTab("anthropic")}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "anthropic"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Anthropic
              </button>
            </div>

            {/* Format badge */}
            {activeTab === "openai" ? (
              <span className="text-xs text-gray-500 font-mono">
                {`{"type":"function","function":{...}}`}
              </span>
            ) : (
              <span className="text-xs text-gray-500 font-mono">
                {`{"name":...,"input_schema":{...}}`}
              </span>
            )}

            {/* Copy buttons */}
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => handleCopy("openai")}
                className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-gray-300 transition-colors"
              >
                {copiedTab === "openai" ? "Copied!" : "Copy OpenAI"}
              </button>
              <button
                onClick={() => handleCopy("anthropic")}
                className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-gray-300 transition-colors"
              >
                {copiedTab === "anthropic" ? "Copied!" : "Copy Anthropic"}
              </button>
            </div>
          </div>

          <pre className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-4 text-xs font-mono text-green-300 overflow-x-auto whitespace-pre max-h-96 overflow-y-auto">
            {currentOutput}
          </pre>
        </div>

        {/* Ad placeholder */}
        <div className="mt-8 border border-dashed border-gray-700 rounded-lg h-24 flex items-center justify-center">
          <span className="text-xs text-gray-600">Advertisement</span>
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このFunction Calling スキーマビルダーツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">OpenAI/Anthropic両対応のTools定義JSONを視覚的に生成。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このFunction Calling スキーマビルダーツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "OpenAI/Anthropic両対応のTools定義JSONを視覚的に生成。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
