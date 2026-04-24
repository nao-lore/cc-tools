"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DetectedFormat = "chatgpt" | "claude" | "jsonl" | "unknown";
type OutputFormat = "markdown" | "plaintext" | "csv";

interface Message {
  role: "user" | "assistant" | "system" | string;
  content: string;
}

interface ParseResult {
  format: DetectedFormat;
  messages: Message[];
  error: string | null;
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

function detectFormat(raw: string): DetectedFormat {
  try {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      const parsed = JSON.parse(trimmed);
      // ChatGPT: array of objects with `mapping` field, or object with `mapping`
      if (Array.isArray(parsed)) {
        if (parsed[0]?.mapping) return "chatgpt";
        if (parsed[0]?.chat_messages) return "claude";
      } else {
        if (parsed.mapping) return "chatgpt";
        if (parsed.chat_messages) return "claude";
      }
      return "unknown";
    }
    // JSONL: each line is a JSON object
    const lines = trimmed.split("\n").filter((l) => l.trim());
    if (lines.every((l) => { try { JSON.parse(l); return true; } catch { return false; } })) {
      return "jsonl";
    }
  } catch {
    // fall through
  }
  return "unknown";
}

function parseChatGPT(raw: string): Message[] {
  const data = JSON.parse(raw);
  const conversations = Array.isArray(data) ? data : [data];
  const messages: Message[] = [];

  for (const conv of conversations) {
    if (!conv.mapping) continue;
    // Build ordered list from mapping
    const nodes = Object.values(conv.mapping) as Array<{
      id: string;
      parent: string | null;
      children: string[];
      message?: {
        author?: { role?: string };
        content?: { parts?: (string | { text?: string })[] };
      };
    }>;

    // Find root node (no parent or parent is null)
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const rootNode = nodes.find((n) => !n.parent || !nodeMap.get(n.parent ?? ""));

    // Walk tree depth-first following first child
    const visited = new Set<string>();
    const walk = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);
      const node = nodeMap.get(id);
      if (!node) return;
      const msg = node.message;
      if (msg?.author?.role && msg.content?.parts) {
        const role = msg.author.role;
        if (role === "user" || role === "assistant" || role === "system") {
          const content = msg.content.parts
            .map((p) => (typeof p === "string" ? p : p?.text ?? ""))
            .join("");
          if (content.trim()) {
            messages.push({ role, content });
          }
        }
      }
      for (const childId of node.children ?? []) {
        walk(childId);
      }
    };

    if (rootNode) walk(rootNode.id);
  }

  return messages;
}

function parseClaude(raw: string): Message[] {
  const data = JSON.parse(raw);
  const conversations = Array.isArray(data) ? data : [data];
  const messages: Message[] = [];

  for (const conv of conversations) {
    const chatMessages: Array<{ sender?: string; role?: string; text?: string; content?: string | { text?: string }[] }> =
      conv.chat_messages ?? [];
    for (const m of chatMessages) {
      const role = (m.sender ?? m.role ?? "unknown") as string;
      let content = "";
      if (typeof m.text === "string") {
        content = m.text;
      } else if (typeof m.content === "string") {
        content = m.content;
      } else if (Array.isArray(m.content)) {
        content = m.content.map((c) => (typeof c === "string" ? c : c?.text ?? "")).join("");
      }
      if (content.trim()) {
        messages.push({ role: role === "human" ? "user" : role, content });
      }
    }
  }

  return messages;
}

function parseJSONL(raw: string): Message[] {
  const lines = raw.trim().split("\n").filter((l) => l.trim());
  const messages: Message[] = [];
  for (const line of lines) {
    try {
      const obj = JSON.parse(line) as { role?: string; content?: string; text?: string; message?: string };
      const role = obj.role ?? "unknown";
      const content = obj.content ?? obj.text ?? obj.message ?? "";
      if (content.trim()) {
        messages.push({ role, content });
      }
    } catch {
      // skip malformed lines
    }
  }
  return messages;
}

function parseInput(raw: string): ParseResult {
  const format = detectFormat(raw);
  try {
    let messages: Message[] = [];
    if (format === "chatgpt") messages = parseChatGPT(raw);
    else if (format === "claude") messages = parseClaude(raw);
    else if (format === "jsonl") messages = parseJSONL(raw);
    else return { format, messages: [], error: "フォーマットを認識できませんでした。ChatGPT / Claude / JSONL のいずれかのエクスポートを貼り付けてください。" };
    return { format, messages, error: null };
  } catch (e) {
    return { format, messages: [], error: `パースエラー: ${(e as Error).message}` };
  }
}

// ─── Converters ───────────────────────────────────────────────────────────────

function roleLabel(role: string): string {
  if (role === "user") return "User";
  if (role === "assistant") return "Assistant";
  if (role === "system") return "System";
  return role;
}

function toMarkdown(messages: Message[]): string {
  return messages
    .map((m) => `# ${roleLabel(m.role)}\n\n${m.content}`)
    .join("\n\n---\n\n");
}

function toPlainText(messages: Message[]): string {
  return messages
    .map((m) => `[${roleLabel(m.role)}]\n${m.content}`)
    .join("\n\n");
}

function toCsv(messages: Message[]): string {
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const header = "role,content";
  const rows = messages.map((m) => `${escape(roleLabel(m.role))},${escape(m.content)}`);
  return [header, ...rows].join("\n");
}

function convert(messages: Message[], format: OutputFormat): string {
  if (format === "markdown") return toMarkdown(messages);
  if (format === "plaintext") return toPlainText(messages);
  return toCsv(messages);
}

// ─── Format badge ─────────────────────────────────────────────────────────────

const FORMAT_LABELS: Record<DetectedFormat, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  jsonl: "JSONL",
  unknown: "不明",
};

const FORMAT_COLORS: Record<DetectedFormat, string> = {
  chatgpt: "bg-green-100 text-green-800",
  claude: "bg-orange-100 text-orange-800",
  jsonl: "bg-blue-100 text-blue-800",
  unknown: "bg-gray-100 text-gray-600",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatExportConverter() {
  const [input, setInput] = useState("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("markdown");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(() => {
    if (!input.trim()) return;
    const parsed = parseInput(input.trim());
    setResult(parsed);
    setCopied(false);
  }, [input]);

  const output = result && result.messages.length > 0 ? convert(result.messages, outputFormat) : "";

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const ext = outputFormat === "csv" ? "csv" : outputFormat === "markdown" ? "md" : "txt";
    const mime = outputFormat === "csv" ? "text/csv" : "text/plain";
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, outputFormat]);

  const handleClear = () => {
    setInput("");
    setResult(null);
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">AI会話ログ 変換ツール</h1>
          <p className="text-sm text-gray-500">
            ChatGPT / Claude / JSONL のエクスポートを Markdown・テキスト・CSV に変換
          </p>
        </div>

        {/* Ad placeholder */}
        <div className="w-full h-16 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-400">
          広告スペース
        </div>

        {/* Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              エクスポートJSON を貼り付け
            </label>
            {input && (
              <button
                onClick={handleClear}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                クリア
              </button>
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`ChatGPT: conversations.json の内容\nClaude: エクスポートJSONの内容\nJSONL: 1行1メッセージ形式`}
            className="w-full h-48 text-sm font-mono border border-gray-200 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 placeholder-gray-300"
            spellCheck={false}
          />
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">出力形式:</span>
              {(["markdown", "plaintext", "csv"] as OutputFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setOutputFormat(f)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    outputFormat === f
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {f === "markdown" ? "Markdown" : f === "plaintext" ? "プレーンテキスト" : "CSV"}
                </button>
              ))}
            </div>
            <button
              onClick={handleConvert}
              disabled={!input.trim()}
              className="ml-auto px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              変換する
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
            {/* Status bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${FORMAT_COLORS[result.format]}`}>
                {FORMAT_LABELS[result.format]}
              </span>
              {result.error ? (
                <span className="text-sm text-red-500">{result.error}</span>
              ) : (
                <span className="text-sm text-gray-500">
                  {result.messages.length} メッセージ検出
                </span>
              )}
              {!result.error && result.messages.length > 0 && (
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                  >
                    {copied ? "コピー済み!" : "コピー"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="text-xs px-3 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    ダウンロード
                  </button>
                </div>
              )}
            </div>

            {/* Preview */}
            {!result.error && result.messages.length > 0 && (
              <>
                {/* Conversation preview (first 3 messages) */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">プレビュー</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {result.messages.slice(0, 5).map((m, i) => (
                      <div
                        key={i}
                        className={`rounded-lg p-3 text-sm ${
                          m.role === "user"
                            ? "bg-blue-50 border border-blue-100"
                            : m.role === "system"
                            ? "bg-yellow-50 border border-yellow-100"
                            : "bg-gray-50 border border-gray-100"
                        }`}
                      >
                        <span className={`text-xs font-semibold mr-2 ${
                          m.role === "user" ? "text-blue-600" : m.role === "system" ? "text-yellow-700" : "text-gray-500"
                        }`}>
                          {roleLabel(m.role)}
                        </span>
                        <span className="text-gray-700 line-clamp-2 whitespace-pre-wrap">
                          {m.content.slice(0, 200)}{m.content.length > 200 ? "…" : ""}
                        </span>
                      </div>
                    ))}
                    {result.messages.length > 5 && (
                      <p className="text-xs text-gray-400 text-center py-1">
                        他 {result.messages.length - 5} 件のメッセージ（出力に含まれます）
                      </p>
                    )}
                  </div>
                </div>

                {/* Output text */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">出力</p>
                  <pre className="text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-72 overflow-auto whitespace-pre-wrap break-words text-gray-700">
                    {output}
                  </pre>
                </div>
              </>
            )}
          </div>
        )}

        {/* Ad placeholder */}
        <div className="w-full h-16 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-400">
          広告スペース
        </div>

        {/* How to use */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">使い方</h2>
          <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
            <li>
              <span className="font-medium">ChatGPT</span>: 設定 → データをエクスポート → 届いたメールの
              <code className="text-xs bg-gray-100 px-1 rounded">conversations.json</code> の中身を貼り付け
            </li>
            <li>
              <span className="font-medium">Claude</span>: 設定 → Privacy → Export data → JSONファイルの中身を貼り付け
            </li>
            <li>
              <span className="font-medium">JSONL</span>: 1行につき <code className="text-xs bg-gray-100 px-1 rounded">{"{"}"role":"user","content":"..."{"}"}</code> 形式
            </li>
          </ul>
        </div>

      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このAI会話ログ 相互変換ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">ChatGPT/Claude/Geminiのエクスポート形式を相互変換＋Markdown化。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このAI会話ログ 相互変換ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "ChatGPT/Claude/Geminiのエクスポート形式を相互変換＋Markdown化。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
