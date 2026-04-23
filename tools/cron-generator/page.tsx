"use client";

import { useState, useCallback } from "react";

// ── 型定義 ──────────────────────────────────────────────────────────────────

interface CronExpression {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

type FieldMode = "wildcard" | "specific" | "range" | "interval" | "list";

interface FieldState {
  mode: FieldMode;
  specific: number;
  rangeStart: number;
  rangeEnd: number;
  interval: number;
  intervalStart: number;
  listValues: number[];
}

// ── 定数 ────────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "", "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];
const DAY_NAMES_FULL = ["日曜", "月曜", "火曜", "水曜", "木曜", "金曜", "土曜"];

const FIELD_CONFIG = [
  { key: "minute" as const, label: "分", labelEn: "MIN", min: 0, max: 59 },
  { key: "hour" as const, label: "時", labelEn: "HOUR", min: 0, max: 23 },
  { key: "dayOfMonth" as const, label: "日（月）", labelEn: "DOM", min: 1, max: 31 },
  { key: "month" as const, label: "月", labelEn: "MON", min: 1, max: 12 },
  { key: "dayOfWeek" as const, label: "曜日", labelEn: "DOW", min: 0, max: 7 },
];

const PRESETS: { label: string; expression: string; desc: string }[] = [
  { label: "毎分", expression: "* * * * *", desc: "毎分実行" },
  { label: "5分ごと", expression: "*/5 * * * *", desc: "5分おきに実行" },
  { label: "15分ごと", expression: "*/15 * * * *", desc: "15分おきに実行" },
  { label: "30分ごと", expression: "*/30 * * * *", desc: "30分おきに実行" },
  { label: "毎時0分", expression: "0 * * * *", desc: "毎時00分に実行" },
  { label: "6時間ごと", expression: "0 */6 * * *", desc: "6時間おきに実行" },
  { label: "毎日深夜0時", expression: "0 0 * * *", desc: "毎日午前0時に実行" },
  { label: "毎日正午", expression: "0 12 * * *", desc: "毎日12時に実行" },
  { label: "毎週月曜9時", expression: "0 9 * * 1", desc: "月曜日の午前9時に実行" },
  { label: "平日9時", expression: "0 9 * * 1-5", desc: "月〜金の午前9時に実行" },
  { label: "毎月1日", expression: "0 0 1 * *", desc: "毎月1日の深夜0時に実行" },
  { label: "毎年1月1日", expression: "0 0 1 1 *", desc: "1月1日の深夜0時に実行" },
];

const COMMON_EXAMPLES: { expr: string; desc: string }[] = [
  { expr: "* * * * *", desc: "毎分" },
  { expr: "*/5 * * * *", desc: "5分ごと" },
  { expr: "0 * * * *", desc: "毎時00分" },
  { expr: "0 0 * * *", desc: "毎日深夜0時" },
  { expr: "0 9 * * 1-5", desc: "平日の午前9時" },
  { expr: "0 0 1 * *", desc: "毎月1日の深夜0時" },
  { expr: "0 0 * * 0", desc: "毎週日曜の深夜0時" },
  { expr: "30 4 1,15 * *", desc: "毎月1日と15日の4時30分" },
  { expr: "0 22 * * 1-5", desc: "平日の22時" },
  { expr: "0 0 1 1 *", desc: "毎年1月1日の深夜0時" },
];

// ── ユーティリティ関数 ────────────────────────────────────────────────────

function expandField(field: string, min: number, max: number): number[] {
  if (field === "*") {
    const r: number[] = [];
    for (let i = min; i <= max; i++) r.push(i);
    return r;
  }
  if (field.includes("/")) {
    const [base, step] = field.split("/");
    const stepNum = parseInt(step, 10);
    const start = base === "*" ? min : parseInt(base, 10);
    const r: number[] = [];
    for (let i = start; i <= max; i += stepNum) r.push(i);
    return r;
  }
  if (field.includes(",")) {
    const r: number[] = [];
    field.split(",").forEach((part) => {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(Number);
        for (let i = a; i <= b; i++) r.push(i);
      } else {
        r.push(parseInt(part, 10));
      }
    });
    return [...new Set(r)].sort((a, b) => a - b);
  }
  if (field.includes("-")) {
    const [a, b] = field.split("-").map(Number);
    const r: number[] = [];
    for (let i = a; i <= b; i++) r.push(i);
    return r;
  }
  return [parseInt(field, 10)];
}

function isValidField(field: string, min: number, max: number): boolean {
  if (field === "*") return true;
  if (field.includes("/")) {
    const [base, step] = field.split("/");
    const stepNum = parseInt(step, 10);
    if (isNaN(stepNum) || stepNum < 1) return false;
    if (base === "*") return true;
    const baseNum = parseInt(base, 10);
    return !isNaN(baseNum) && baseNum >= min && baseNum <= max;
  }
  if (field.includes(",")) {
    return field.split(",").every((v) => {
      const n = parseInt(v, 10);
      return !isNaN(n) && n >= min && n <= max;
    });
  }
  if (field.includes("-")) {
    const [a, b] = field.split("-").map(Number);
    return !isNaN(a) && !isNaN(b) && a >= min && b >= min && a <= max && b <= max;
  }
  const n = parseInt(field, 10);
  return !isNaN(n) && n >= min && n <= max;
}

function isValidCron(expression: string): boolean {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return false;
  const [min, hr, dom, mon, dow] = parts;
  return (
    isValidField(min, 0, 59) &&
    isValidField(hr, 0, 23) &&
    isValidField(dom, 1, 31) &&
    isValidField(mon, 1, 12) &&
    isValidField(dow, 0, 7)
  );
}

function parseCron(expression: string): CronExpression | null {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  return { minute: parts[0], hour: parts[1], dayOfMonth: parts[2], month: parts[3], dayOfWeek: parts[4] };
}

function formatTime(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function describeField(field: string, unit: string, names?: string[]): string {
  if (field === "*") return `毎${unit}`;
  if (field.includes("/")) {
    const [base, step] = field.split("/");
    const s = parseInt(step, 10);
    const startLabel = names ? names[parseInt(base === "*" ? "0" : base)] : (base === "*" ? "" : base);
    if (base === "*" || base === "0") return `${s}${unit}ごと`;
    return `${startLabel}から${s}${unit}ごと`;
  }
  if (field.includes(",")) {
    const vals = field.split(",").map((v) => names ? names[parseInt(v)] : v);
    return vals.join("・");
  }
  if (field.includes("-")) {
    const [a, b] = field.split("-");
    const from = names ? names[parseInt(a)] : a;
    const to = names ? names[parseInt(b)] : b;
    return `${from}〜${to}`;
  }
  return names ? names[parseInt(field)] : field;
}

function explainCron(expression: string): string {
  if (!isValidCron(expression)) return "無効なcron式です";
  const cron = parseCron(expression)!;
  const { minute, hour, dayOfMonth, month, dayOfWeek } = cron;

  if (expression === "* * * * *") return "毎分実行";

  const parts: string[] = [];

  // 時刻
  if (minute !== "*" && hour !== "*" && !minute.includes("/") && !hour.includes("/")) {
    const hours = expandField(hour, 0, 23);
    const minutes = expandField(minute, 0, 59);
    if (hours.length === 1 && minutes.length === 1) {
      parts.push(`${formatTime(hours[0], minutes[0])}に`);
    } else if (minutes.length === 1) {
      parts.push(`${describeField(hour, "時")}の${minutes[0]}分に`);
    } else {
      parts.push(`${describeField(minute, "分")}、${describeField(hour, "時")}に`);
    }
  } else if (minute.includes("/")) {
    const step = minute.split("/")[1];
    if (hour !== "*") parts.push(`${describeField(hour, "時")}の間、${step}分ごとに`);
    else parts.push(`${step}分ごとに`);
  } else if (minute !== "*") {
    const mins = expandField(minute, 0, 59);
    if (mins.length === 1 && mins[0] === 0) {
      if (hour.includes("/")) parts.push(`${hour.split("/")[1]}時間ごとに`);
      else if (hour === "*") parts.push("毎時00分に");
    } else {
      parts.push(`${describeField(minute, "分")}に`);
    }
  } else if (hour.includes("/")) {
    parts.push(`${hour.split("/")[1]}時間ごとに`);
  }

  // 曜日
  if (dayOfWeek !== "*") {
    const norm = dayOfWeek === "7" ? "0" : dayOfWeek;
    if (norm === "1-5") parts.push("平日（月〜金）");
    else if (norm === "0,6" || norm === "6,0") parts.push("土日");
    else parts.push(describeField(norm, "曜日", DAY_NAMES_FULL) + "に");
  }

  // 日（月）
  if (dayOfMonth !== "*") parts.push(`毎月${describeField(dayOfMonth, "日")}に`);

  // 月
  if (month !== "*") parts.push(`${describeField(month, "月", MONTH_NAMES)}に`);

  return parts.length > 0 ? parts.join("") : "毎分実行";
}

function getNextRuns(expression: string, count: number): Date[] {
  if (!isValidCron(expression)) return [];
  const cron = parseCron(expression)!;
  const minutes = expandField(cron.minute, 0, 59);
  const hours = expandField(cron.hour, 0, 23);
  const daysOfMonth = expandField(cron.dayOfMonth, 1, 31);
  const months = expandField(cron.month, 1, 12);
  let daysOfWeek = expandField(cron.dayOfWeek, 0, 7);
  daysOfWeek = [...new Set(daysOfWeek.map((d) => (d === 7 ? 0 : d)))].sort((a, b) => a - b);

  const isDowRestricted = cron.dayOfWeek !== "*";
  const isDomRestricted = cron.dayOfMonth !== "*";

  const results: Date[] = [];
  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
  current.setMinutes(current.getMinutes() + 1);

  let iterations = 0;
  const maxIter = 525600 * 2;

  while (results.length < count && iterations < maxIter) {
    const m = current.getMinutes();
    const h = current.getHours();
    const dom = current.getDate();
    const mon = current.getMonth() + 1;
    const dow = current.getDay();

    const monthMatch = months.includes(mon);
    const minuteMatch = minutes.includes(m);
    const hourMatch = hours.includes(h);
    let dayMatch: boolean;
    if (isDowRestricted && isDomRestricted) {
      dayMatch = daysOfMonth.includes(dom) || daysOfWeek.includes(dow);
    } else if (isDowRestricted) {
      dayMatch = daysOfWeek.includes(dow);
    } else if (isDomRestricted) {
      dayMatch = daysOfMonth.includes(dom);
    } else {
      dayMatch = true;
    }

    if (monthMatch && dayMatch && hourMatch && minuteMatch) {
      results.push(new Date(current));
    }

    if (!monthMatch) {
      current.setMonth(current.getMonth() + 1, 1);
      current.setHours(0, 0, 0, 0);
      iterations += 1440;
    } else if (!dayMatch) {
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
      iterations += 1440;
    } else if (!hourMatch) {
      current.setHours(current.getHours() + 1, 0, 0, 0);
      iterations += 60;
    } else {
      current.setMinutes(current.getMinutes() + 1);
      iterations++;
    }
  }
  return results;
}

function getFiresPerHour(expression: string): number[] {
  if (!isValidCron(expression)) return new Array(24).fill(0);
  const cron = parseCron(expression)!;
  const minutes = expandField(cron.minute, 0, 59);
  const hours = expandField(cron.hour, 0, 23);
  const result = new Array(24).fill(0);
  hours.forEach((h) => { result[h] = minutes.length; });
  return result;
}

function fieldToString(state: FieldState): string {
  switch (state.mode) {
    case "wildcard": return "*";
    case "specific": return String(state.specific);
    case "range": return `${state.rangeStart}-${state.rangeEnd}`;
    case "interval":
      return state.intervalStart === 0
        ? `*/${state.interval}`
        : `${state.intervalStart}/${state.interval}`;
    case "list":
      return state.listValues.length > 0
        ? [...state.listValues].sort((a, b) => a - b).join(",")
        : "*";
    default: return "*";
  }
}

function createDefaultFieldState(min: number): FieldState {
  return {
    mode: "wildcard",
    specific: min,
    rangeStart: min,
    rangeEnd: min + 1,
    interval: 1,
    intervalStart: 0,
    listValues: [],
  };
}

function parseCronToFields(expression: string): Record<string, FieldState> | null {
  const cron = parseCron(expression);
  if (!cron) return null;
  const keys = ["minute", "hour", "dayOfMonth", "month", "dayOfWeek"] as const;
  const vals = [cron.minute, cron.hour, cron.dayOfMonth, cron.month, cron.dayOfWeek];
  const mins = [0, 0, 1, 1, 0];

  const result: Record<string, FieldState> = {};
  keys.forEach((key, i) => {
    const val = vals[i];
    const state = createDefaultFieldState(mins[i]);
    if (val === "*") {
      state.mode = "wildcard";
    } else if (val.includes("/")) {
      state.mode = "interval";
      const [base, step] = val.split("/");
      state.interval = parseInt(step, 10);
      state.intervalStart = base === "*" ? 0 : parseInt(base, 10);
    } else if (val.includes(",")) {
      state.mode = "list";
      state.listValues = val.split(",").map(Number);
    } else if (val.includes("-")) {
      state.mode = "range";
      const [a, b] = val.split("-").map(Number);
      state.rangeStart = a;
      state.rangeEnd = b;
    } else {
      state.mode = "specific";
      state.specific = parseInt(val, 10);
    }
    result[key] = state;
  });
  return result;
}

// ── サブコンポーネント（インライン定義）────────────────────────────────────

function FieldEditor({
  config,
  state,
  onChange,
}: {
  config: (typeof FIELD_CONFIG)[number];
  state: FieldState;
  onChange: (updates: Partial<FieldState>) => void;
}) {
  const modes: { value: FieldMode; label: string }[] = [
    { value: "wildcard", label: "すべて (*)" },
    { value: "specific", label: "指定" },
    { value: "range", label: "範囲" },
    { value: "interval", label: "間隔 (*/n)" },
    { value: "list", label: "リスト" },
  ];

  const options: number[] = [];
  for (let i = config.min; i <= config.max; i++) options.push(i);

  const getLabel = (val: number): string => {
    if (config.key === "dayOfWeek") return DAY_NAMES[val] ?? String(val);
    if (config.key === "month") return MONTH_NAMES[val] ?? String(val);
    return String(val);
  };

  const toggleListValue = (val: number) => {
    const current = state.listValues;
    onChange({
      listValues: current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val],
    });
  };

  const selectClass =
    "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {config.label}
      </label>
      <select
        value={state.mode}
        onChange={(e) => onChange({ mode: e.target.value as FieldMode })}
        className={selectClass + " mb-3"}
      >
        {modes.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>

      {state.mode === "specific" && (
        <select
          value={state.specific}
          onChange={(e) => onChange({ specific: parseInt(e.target.value) })}
          className={selectClass}
        >
          {options.map((v) => (
            <option key={v} value={v}>{getLabel(v)}</option>
          ))}
        </select>
      )}

      {state.mode === "range" && (
        <div className="flex items-center gap-2">
          <select
            value={state.rangeStart}
            onChange={(e) => onChange({ rangeStart: parseInt(e.target.value) })}
            className="flex-1 px-2 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {options.map((v) => <option key={v} value={v}>{getLabel(v)}</option>)}
          </select>
          <span className="text-slate-400 text-sm">〜</span>
          <select
            value={state.rangeEnd}
            onChange={(e) => onChange({ rangeEnd: parseInt(e.target.value) })}
            className="flex-1 px-2 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {options.map((v) => <option key={v} value={v}>{getLabel(v)}</option>)}
          </select>
        </div>
      )}

      {state.mode === "interval" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 shrink-0">間隔</span>
            <input
              type="number"
              value={state.interval}
              onChange={(e) => onChange({ interval: Math.max(1, parseInt(e.target.value) || 1) })}
              min={1}
              max={config.max}
              className="w-20 px-2 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 shrink-0">開始</span>
            <select
              value={state.intervalStart}
              onChange={(e) => onChange({ intervalStart: parseInt(e.target.value) })}
              className="flex-1 px-2 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {options.map((v) => <option key={v} value={v}>{getLabel(v)}</option>)}
            </select>
          </div>
        </div>
      )}

      {state.mode === "list" && (
        <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
          {options.map((v) => (
            <button
              key={v}
              onClick={() => toggleListValue(v)}
              className={`px-2 py-1 text-xs rounded cursor-pointer transition-colors ${
                state.listValues.includes(v)
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {getLabel(v)}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 text-center font-mono text-sm text-slate-500 bg-slate-50 rounded py-1">
        {fieldToString(state)}
      </div>
    </div>
  );
}

function Timeline({ firesPerHour }: { firesPerHour: number[] }) {
  const maxFires = Math.max(...firesPerHour, 1);
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-end gap-px h-20">
        {firesPerHour.map((count, hour) => {
          const height = count > 0 ? Math.max(15, (count / maxFires) * 100) : 0;
          return (
            <div key={hour} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className={`w-full rounded-t transition-all duration-200 ${
                  count > 0 ? "bg-blue-500" : "bg-slate-100"
                }`}
                style={{ height: `${height}%`, minHeight: count > 0 ? "4px" : "2px" }}
                title={`${hour}時台 — ${count}回実行`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-px mt-1">
        {firesPerHour.map((_, hour) => (
          <div key={hour} className="flex-1 text-center">
            {hour % 3 === 0 && <span className="text-[10px] text-slate-400">{hour}</span>}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1 text-xs text-slate-400">
        <span>深夜0時</span>
        <span>午前6時</span>
        <span>正午</span>
        <span>午後6時</span>
        <span>午後11時</span>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shrink-0"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
        </svg>
      )}
      {copied ? "コピー済み" : "コピー"}
    </button>
  );
}

// ── メインコンポーネント ────────────────────────────────────────────────────

export default function CronGeneratorPage() {
  const [fields, setFields] = useState<Record<string, FieldState>>({
    minute: createDefaultFieldState(0),
    hour: createDefaultFieldState(0),
    dayOfMonth: { ...createDefaultFieldState(1), rangeEnd: 2 },
    month: { ...createDefaultFieldState(1), rangeEnd: 2 },
    dayOfWeek: createDefaultFieldState(0),
  });

  const [reverseInput, setReverseInput] = useState("");
  const [mainCopied, setMainCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"builder" | "explain">("builder");

  const cronExpression: CronExpression = {
    minute: fieldToString(fields.minute),
    hour: fieldToString(fields.hour),
    dayOfMonth: fieldToString(fields.dayOfMonth),
    month: fieldToString(fields.month),
    dayOfWeek: fieldToString(fields.dayOfWeek),
  };

  const expressionStr = `${cronExpression.minute} ${cronExpression.hour} ${cronExpression.dayOfMonth} ${cronExpression.month} ${cronExpression.dayOfWeek}`;
  const explanation = explainCron(expressionStr);
  const nextRuns = getNextRuns(expressionStr, 5);
  const firesPerHour = getFiresPerHour(expressionStr);

  const applyPreset = useCallback((expression: string) => {
    const parsed = parseCronToFields(expression);
    if (parsed) setFields(parsed);
  }, []);

  const updateField = useCallback((key: string, updates: Partial<FieldState>) => {
    setFields((prev) => ({ ...prev, [key]: { ...prev[key], ...updates } }));
  }, []);

  const handleMainCopy = useCallback(() => {
    navigator.clipboard.writeText(expressionStr);
    setMainCopied(true);
    setTimeout(() => setMainCopied(false), 2000);
  }, [expressionStr]);

  const reverseExplanation =
    reverseInput.trim() && isValidCron(reverseInput.trim())
      ? explainCron(reverseInput.trim())
      : reverseInput.trim()
      ? "無効なcron式です"
      : "";

  const reverseValid = reverseInput.trim() && isValidCron(reverseInput.trim());

  const JP_WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Cron式ジェネレーター
          </h1>
          <p className="mt-2 text-slate-500 text-base sm:text-lg">
            cron式を視覚的に生成・解説。構文を暗記しなくてもOK。
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full space-y-10">

        {/* ── プリセット ── */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">よく使うプリセット</h2>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.expression}
                onClick={() => applyPreset(p.expression)}
                title={p.desc}
                className="px-3 py-1.5 text-sm rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── タブ切り替え ── */}
        <div className="flex gap-1 border-b border-slate-200">
          {(["builder", "explain"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors cursor-pointer ${
                activeTab === tab
                  ? "bg-white border border-b-white border-slate-200 text-blue-700 -mb-px"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "builder" ? "ビジュアルビルダー" : "cron式を解説"}
            </button>
          ))}
        </div>

        {/* ── ビルダータブ ── */}
        {activeTab === "builder" && (
          <>
            {/* フィールドエディタ */}
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {FIELD_CONFIG.map((config) => (
                  <FieldEditor
                    key={config.key}
                    config={config}
                    state={fields[config.key]}
                    onChange={(updates) => updateField(config.key, updates)}
                  />
                ))}
              </div>
            </section>

            {/* 生成結果 */}
            <section className="bg-slate-900 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                  生成されたcron式
                </h2>
                <button
                  onClick={handleMainCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {mainCopied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      コピー済み
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
                      </svg>
                      コピー
                    </>
                  )}
                </button>
              </div>

              <div className="font-mono text-2xl sm:text-4xl font-bold tracking-wider text-center py-4">
                {expressionStr.split(" ").map((part, i) => (
                  <span key={i}>
                    <span className="text-blue-400">{part}</span>
                    {i < 4 && <span className="text-slate-600 mx-2"> </span>}
                  </span>
                ))}
              </div>

              <div className="text-center text-slate-300 text-base sm:text-lg mt-2">
                {explanation}
              </div>

              <div className="flex justify-center gap-6 mt-4 text-xs text-slate-500 font-mono">
                {FIELD_CONFIG.map((f) => (
                  <span key={f.key}>{f.labelEn}</span>
                ))}
              </div>
            </section>

            {/* タイムライン */}
            <section>
              <h2 className="text-lg font-semibold text-slate-800 mb-3">24時間タイムライン</h2>
              <Timeline firesPerHour={firesPerHour} />
            </section>

            {/* 次の実行日時 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-800 mb-3">次の実行日時（5件）</h2>
              {nextRuns.length > 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                  {nextRuns.map((date, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-mono text-sm sm:text-base text-slate-700">
                        {date.getFullYear()}年
                        {date.getMonth() + 1}月
                        {date.getDate()}日
                        （{JP_WEEKDAYS[date.getDay()]}）{" "}
                        {formatTime(date.getHours(), date.getMinutes())}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">この式では次の実行日時を計算できません。</p>
              )}
            </section>
          </>
        )}

        {/* ── 解説タブ ── */}
        {activeTab === "explain" && (
          <section className="space-y-4">
            <p className="text-sm text-slate-500">
              cron式を貼り付けると、日本語で説明します。ビルダーに反映することもできます。
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={reverseInput}
                onChange={(e) => setReverseInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && reverseValid) applyPreset(reverseInput.trim());
                }}
                placeholder="例: */5 * * * *"
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={() => {
                  if (reverseValid) {
                    applyPreset(reverseInput.trim());
                    setActiveTab("builder");
                  }
                }}
                disabled={!reverseValid}
                className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ビルダーに反映
              </button>
            </div>
            {reverseExplanation && (
              <div
                className={`p-4 rounded-lg text-sm ${
                  reverseExplanation === "無効なcron式です"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-800 border border-green-200"
                }`}
              >
                {reverseExplanation === "無効なcron式です" ? (
                  <span>{reverseExplanation}</span>
                ) : (
                  <span>
                    <span className="font-semibold">{reverseInput.trim()}</span>
                    {" → "}
                    {reverseExplanation}
                  </span>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── よく使うcron式一覧 ── */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">よく使うcron式 一覧</h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">cron式</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600">説明</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-600 w-28 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COMMON_EXAMPLES.map(({ expr, desc }) => (
                    <tr key={expr} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm text-blue-700">{expr}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{desc}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <CopyButton text={expr} />
                          <button
                            onClick={() => { applyPreset(expr); setActiveTab("builder"); }}
                            className="px-3 py-1.5 text-xs rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                          >
                            使う
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── SEO解説セクション ── */}
        <article className="space-y-8 mt-4">
          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">cronとは？</h2>
            <p className="text-slate-600 leading-relaxed">
              <strong>cron</strong>はUnix系OSに搭載されたタスクスケジューラーです。
              ギリシャ語の「chronos（時間）」に由来し、指定したスケジュールでコマンドやスクリプトを自動実行します。
              データベースのバックアップ、ログのローテーション、定期メール送信、
              サーバーメンテナンスなど、繰り返し発生するタスクの自動化に広く使われています。
              クラウド環境（AWS CloudWatch Events、Google Cloud Scheduler、GitHub Actions など）でも
              cron構文が採用されており、インフラエンジニアや開発者にとって必須の知識です。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">cron式の構造</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              標準的なcron式は、空白区切りの<strong>5フィールド</strong>で構成されます。
              左から順に「分・時・日（月）・月・曜日」を表します。
            </p>
            <div className="bg-slate-900 text-slate-100 font-mono text-sm sm:text-base rounded-xl p-5 mb-4">
              <div className="flex gap-4 sm:gap-8 justify-center text-blue-400 text-base sm:text-xl font-bold mb-2">
                {["*", "*", "*", "*", "*"].map((s, i) => <span key={i}>{s}</span>)}
              </div>
              <div className="flex gap-4 sm:gap-8 justify-center text-slate-400 text-xs">
                {["分 (0-59)", "時 (0-23)", "日 (1-31)", "月 (1-12)", "曜日 (0-7)"].map((s, i) => (
                  <span key={i} className="text-center leading-tight">{s}</span>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200">フィールド</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200">使用できる値</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200">使える特殊文字</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200 hidden sm:table-cell">説明</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["分", "0-59", "* , - /", "コマンドを実行する分"],
                    ["時", "0-23", "* , - /", "コマンドを実行する時（0=深夜0時）"],
                    ["日（月）", "1-31", "* , - /", "コマンドを実行する日付"],
                    ["月", "1-12", "* , - /", "コマンドを実行する月（1=1月）"],
                    ["曜日", "0-7", "* , - /", "0と7は日曜、1=月曜〜6=土曜"],
                  ].map(([field, vals, chars, desc], i) => (
                    <tr key={i} className={i % 2 === 1 ? "bg-slate-50" : ""}>
                      <td className="px-4 py-3 font-mono text-sm border border-slate-200">{field}</td>
                      <td className="px-4 py-3 font-mono text-sm border border-slate-200">{vals}</td>
                      <td className="px-4 py-3 font-mono text-sm border border-slate-200">{chars}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 border border-slate-200 hidden sm:table-cell">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">特殊文字（*/,-）の意味</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  char: "* （アスタリスク）",
                  desc: "すべての値にマッチします。時フィールドの <code>*</code> は「毎時」を意味します。",
                  example: "* * * * * → 毎分実行",
                },
                {
                  char: ", （カンマ）",
                  desc: "値のリストを指定します。曜日フィールドの <code>1,3,5</code> は月・水・金を意味します。",
                  example: "0 9 * * 1,3,5 → 月水金の9時",
                },
                {
                  char: "- （ハイフン）",
                  desc: "範囲を指定します。時フィールドの <code>9-17</code> は9時〜17時（各時00分）を意味します。",
                  example: "0 9-17 * * * → 9〜17時の毎時00分",
                },
                {
                  char: "/ （スラッシュ）",
                  desc: "ステップ値を指定します。分フィールドの <code>*/15</code> は「15分ごと」を意味します。",
                  example: "*/15 * * * * → 15分ごと",
                },
              ].map(({ char, desc, example }) => (
                <div key={char} className="bg-white p-4 rounded-xl border border-slate-200">
                  <h3 className="font-mono text-base font-bold text-blue-600 mb-1">{char}</h3>
                  <p
                    className="text-sm text-slate-600 mb-2"
                    dangerouslySetInnerHTML={{ __html: desc }}
                  />
                  <p className="font-mono text-xs text-slate-400 bg-slate-50 rounded px-2 py-1">{example}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">cron設定のヒント</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>本番環境に適用する前に、必ず「次の実行日時」で動作を確認しましょう。</li>
              <li>曜日フィールドでは 0 と 7 の両方が日曜を表します。</li>
              <li>日（月）と曜日を同時に指定した場合、<strong>どちらかに一致すれば実行</strong>（OR条件）されます。</li>
              <li>均等な間隔には、値を列挙するより <code className="bg-slate-100 px-1 rounded">/</code>（ステップ値）を使う方がシンプルです。</li>
              <li>深夜0時や毎時00分など「区切り時刻」はジョブが集中しやすいため、少しずらすと負荷分散になります。</li>
              <li>cronはデフォルトでシステムのローカルタイムゾーンで動作します。サーバーのタイムゾーン設定を必ず確認しましょう。</li>
            </ul>
          </section>
        </article>

        {/* AdSense プレースホルダー */}
        <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-sm">
          広告スペース — Google AdSense
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-slate-200 mt-12 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Cron式ジェネレーター — 無料オンラインツール。登録不要。
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">関連ツール</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/epoch-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Epoch変換</a>
              <a href="/chmod-calculator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Chmod計算</a>
              <a href="/regex-tester" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">正規表現テスター</a>
              <a href="/uuid-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">UUIDジェネレーター</a>
              <a href="/timezone-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">タイムゾーン変換</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53以上の無料ツール →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
