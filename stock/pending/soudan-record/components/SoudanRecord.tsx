"use client";

import { useState, useMemo, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type PresetTemplate = "定例会議" | "プロジェクト会議" | "1on1";

interface ListItem {
  id: string;
  text: string;
}

interface FormState {
  meetingName: string;
  datetime: string;
  location: string;
  participants: ListItem[];
  agendaItems: ListItem[];
  nextMeetingDate: string;
}

// ── Preset Templates ──────────────────────────────────────────────────────────

const PRESETS: Record<PresetTemplate, Partial<FormState>> = {
  定例会議: {
    meetingName: "週次定例会議",
    location: "会議室A / オンライン",
    participants: [
      { id: "p1", text: "田中 太郎（ファシリテーター）" },
      { id: "p2", text: "山田 花子（書記）" },
      { id: "p3", text: "佐藤 一郎" },
    ],
    agendaItems: [
      { id: "a1", text: "前回議事録の確認" },
      { id: "a2", text: "進捗報告" },
      { id: "a3", text: "課題・リスクの共有" },
      { id: "a4", text: "次回アクションの確認" },
    ],
  },
  プロジェクト会議: {
    meetingName: "プロジェクトキックオフ会議",
    location: "大会議室",
    participants: [
      { id: "p1", text: "プロジェクトマネージャー" },
      { id: "p2", text: "開発リーダー" },
      { id: "p3", text: "デザイナー" },
      { id: "p4", text: "QAエンジニア" },
    ],
    agendaItems: [
      { id: "a1", text: "プロジェクト概要・目的の共有" },
      { id: "a2", text: "スケジュール・マイルストーン確認" },
      { id: "a3", text: "役割分担・責任者の確認" },
      { id: "a4", text: "リスク・懸念点の洗い出し" },
      { id: "a5", text: "今後の進め方" },
    ],
  },
  "1on1": {
    meetingName: "1on1ミーティング",
    location: "個室 / オンライン",
    participants: [
      { id: "p1", text: "マネージャー" },
      { id: "p2", text: "メンバー" },
    ],
    agendaItems: [
      { id: "a1", text: "近況・体調確認" },
      { id: "a2", text: "業務の進捗・困りごと" },
      { id: "a3", text: "キャリア・成長について" },
      { id: "a4", text: "フィードバック" },
    ],
  },
};

const DEFAULT_STATE: FormState = {
  meetingName: "",
  datetime: "",
  location: "",
  participants: [],
  agendaItems: [],
  nextMeetingDate: "",
};

// ── Markdown Generator ────────────────────────────────────────────────────────

function generateMarkdown(state: FormState): string {
  const lines: string[] = [];

  const name = state.meetingName || "（会議名未入力）";
  const dt = state.datetime
    ? new Date(state.datetime).toLocaleString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "（日時未入力）";
  const loc = state.location || "（場所未入力）";

  lines.push(`# ${name}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 基本情報");
  lines.push("");
  lines.push(`| 項目 | 内容 |`);
  lines.push(`|------|------|`);
  lines.push(`| 日時 | ${dt} |`);
  lines.push(`| 場所 | ${loc} |`);
  lines.push(
    `| 参加者 | ${
      state.participants.filter((p) => p.text.trim()).length > 0
        ? state.participants
            .filter((p) => p.text.trim())
            .map((p) => p.text)
            .join("、")
        : "（未入力）"
    } |`
  );
  lines.push("");

  lines.push("## 参加者");
  lines.push("");
  if (state.participants.filter((p) => p.text.trim()).length > 0) {
    for (const p of state.participants) {
      if (p.text.trim()) lines.push(`- ${p.text}`);
    }
  } else {
    lines.push("- （参加者未入力）");
  }
  lines.push("");

  lines.push("## アジェンダ");
  lines.push("");
  if (state.agendaItems.filter((a) => a.text.trim()).length > 0) {
    state.agendaItems
      .filter((a) => a.text.trim())
      .forEach((a, i) => {
        lines.push(`${i + 1}. ${a.text}`);
      });
  } else {
    lines.push("1. （アジェンダ未入力）");
  }
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push("## 議事内容");
  lines.push("");

  const items = state.agendaItems.filter((a) => a.text.trim());
  if (items.length > 0) {
    items.forEach((a, i) => {
      lines.push(`### ${i + 1}. ${a.text}`);
      lines.push("");
      lines.push("**議論内容**");
      lines.push("");
      lines.push("- ");
      lines.push("");
      lines.push("**決定事項**");
      lines.push("");
      lines.push("- ");
      lines.push("");
      lines.push("**ToDo**");
      lines.push("");
      lines.push("| タスク | 担当者 | 期限 |");
      lines.push("|--------|--------|------|");
      lines.push("|  |  |  |");
      lines.push("");
    });
  } else {
    lines.push("### 1. （アジェンダ未入力）");
    lines.push("");
    lines.push("**議論内容**");
    lines.push("");
    lines.push("- ");
    lines.push("");
    lines.push("**決定事項**");
    lines.push("");
    lines.push("- ");
    lines.push("");
    lines.push("**ToDo**");
    lines.push("");
    lines.push("| タスク | 担当者 | 期限 |");
    lines.push("|--------|--------|------|");
    lines.push("|  |  |  |");
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("## まとめ");
  lines.push("");
  lines.push("### 主な決定事項");
  lines.push("");
  lines.push("- ");
  lines.push("");
  lines.push("### 全体のToDo");
  lines.push("");
  lines.push("| タスク | 担当者 | 期限 |");
  lines.push("|--------|--------|------|");
  lines.push("|  |  |  |");
  lines.push("");

  lines.push("### 次回開催");
  lines.push("");
  lines.push(
    `- 日時：${state.nextMeetingDate ? new Date(state.nextMeetingDate).toLocaleString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" }) : "（未定）"}`
  );
  lines.push("- 場所：");
  lines.push("- 議題：");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`*作成日時：${new Date().toLocaleString("ja-JP")}*`);

  return lines.join("\n").trimEnd() + "\n";
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  placeholder: string;
}) {
  const addItem = () => {
    onChange([...items, { id: `${Date.now()}`, text: "" }]);
  };
  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };
  const updateItem = (id: string, text: string) => {
    onChange(items.map((i) => (i.id === id ? { ...i, text } : i)));
  };

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={item.id} className="flex gap-2 items-center">
          <span className="text-xs text-gray-400 w-5 text-right shrink-0">{idx + 1}.</span>
          <input
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={item.text}
            onChange={(e) => updateItem(item.id, e.target.value)}
            placeholder={placeholder}
          />
          <button
            onClick={() => removeItem(item.id)}
            className="px-2 py-1 text-gray-400 hover:text-red-500 transition-colors text-lg leading-none shrink-0"
            title="削除"
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        + 追加
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function SoudanRecord() {
  const [state, setState] = useState<FormState>(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState<PresetTemplate | null>(null);
  const [previewTab, setPreviewTab] = useState<"raw" | "rendered">("raw");

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyPreset = (preset: PresetTemplate) => {
    setActivePreset(preset);
    setState((prev) => ({
      ...prev,
      ...PRESETS[preset],
      // preserve datetime and nextMeetingDate
      datetime: prev.datetime,
      nextMeetingDate: prev.nextMeetingDate,
    }));
  };

  const markdown = useMemo(() => generateMarkdown(state), [state]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const sectionClass = "bg-white border border-gray-200 rounded-xl p-6 space-y-4";
  const sectionHeadClass = "text-base font-semibold text-gray-900";

  // Simple rendered preview: convert Markdown to basic HTML-like rendering
  const renderPreview = (md: string) => {
    return md.split("\n").map((line, i) => {
      if (line.startsWith("### ")) {
        return <h3 key={i} className="text-base font-semibold text-gray-900 mt-4 mb-1">{line.slice(4)}</h3>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={i} className="text-lg font-bold text-gray-900 mt-5 mb-2 border-b border-gray-200 pb-1">{line.slice(3)}</h2>;
      }
      if (line.startsWith("# ")) {
        return <h1 key={i} className="text-xl font-bold text-gray-900 mb-3">{line.slice(2)}</h1>;
      }
      if (line === "---") {
        return <hr key={i} className="my-3 border-gray-200" />;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return <li key={i} className="ml-4 text-sm text-gray-700 list-disc">{line.slice(2)}</li>;
      }
      if (/^\d+\. /.test(line)) {
        return <li key={i} className="ml-4 text-sm text-gray-700 list-decimal">{line.replace(/^\d+\. /, "")}</li>;
      }
      if (line.startsWith("|")) {
        return (
          <div key={i} className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-0.5">{line}</div>
        );
      }
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="text-sm font-semibold text-gray-800 mt-2">{line.slice(2, -2)}</p>;
      }
      if (line.startsWith("*") && line.endsWith("*")) {
        return <p key={i} className="text-xs italic text-gray-500">{line.slice(1, -1)}</p>;
      }
      if (line === "") {
        return <div key={i} className="h-1" />;
      }
      return <p key={i} className="text-sm text-gray-700">{line}</p>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Preset Selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">プリセットから始める</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PRESETS) as PresetTemplate[]).map((preset) => (
            <button
              key={preset}
              onClick={() => applyPreset(preset)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                activePreset === preset
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div className="space-y-4">
          {/* Basic Info */}
          <div className={sectionClass}>
            <h2 className={sectionHeadClass}>基本情報</h2>
            <div>
              <label className={labelClass}>会議名</label>
              <input
                className={inputClass}
                value={state.meetingName}
                onChange={(e) => set("meetingName", e.target.value)}
                placeholder="例: 週次定例会議"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>日時</label>
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={state.datetime}
                  onChange={(e) => set("datetime", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>場所</label>
                <input
                  className={inputClass}
                  value={state.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="例: 会議室A / Zoom"
                />
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className={sectionClass}>
            <h2 className={sectionHeadClass}>参加者</h2>
            <ListEditor
              items={state.participants}
              onChange={(items) => set("participants", items)}
              placeholder="例: 田中 太郎（ファシリテーター）"
            />
          </div>

          {/* Agenda */}
          <div className={sectionClass}>
            <h2 className={sectionHeadClass}>アジェンダ</h2>
            <p className="text-xs text-gray-500">各アジェンダに議論内容・決定事項・ToDoのセクションが自動生成されます</p>
            <ListEditor
              items={state.agendaItems}
              onChange={(items) => set("agendaItems", items)}
              placeholder="例: 進捗報告"
            />
          </div>

          {/* Next Meeting */}
          <div className={sectionClass}>
            <h2 className={sectionHeadClass}>次回開催日</h2>
            <div>
              <label className={labelClass}>次回開催日時（任意）</label>
              <input
                type="datetime-local"
                className={inputClass}
                value={state.nextMeetingDate}
                onChange={(e) => set("nextMeetingDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Preview */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex gap-1">
                <button
                  onClick={() => setPreviewTab("raw")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    previewTab === "raw"
                      ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Markdown
                </button>
                <button
                  onClick={() => setPreviewTab("rendered")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    previewTab === "rendered"
                      ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  プレビュー
                </button>
              </div>
              <button
                onClick={handleCopy}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  copied
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {copied ? "コピー完了!" : "Markdownをコピー"}
              </button>
            </div>

            {/* Content */}
            {previewTab === "raw" ? (
              <pre className="p-5 text-xs font-mono text-gray-800 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[70vh] overflow-y-auto bg-gray-50">
                {markdown}
              </pre>
            ) : (
              <div className="p-5 max-h-[70vh] overflow-y-auto">
                {renderPreview(markdown)}
              </div>
            )}
          </div>

          {/* Ad placeholder */}
          <div className="mt-4 border border-dashed border-gray-300 rounded-xl p-6 text-center text-sm text-gray-400 bg-gray-50">
            広告スペース
          </div>
        </div>
      </div>
    </div>
  );
}
