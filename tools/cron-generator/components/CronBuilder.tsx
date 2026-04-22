"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CronExpression,
  buildCronExpression,
  explainCron,
  getNextRuns,
  getFiresPerHour,
  isValidCron,
  PRESETS,
  parseCronExpression,
} from "../lib/cron";
import Timeline from "./Timeline";

const FIELD_CONFIG = [
  { key: "minute" as const, label: "Minute", min: 0, max: 59, common: [0, 5, 10, 15, 30] },
  { key: "hour" as const, label: "Hour", min: 0, max: 23, common: [0, 1, 6, 9, 12, 18] },
  { key: "dayOfMonth" as const, label: "Day (Month)", min: 1, max: 31, common: [1, 15] },
  { key: "month" as const, label: "Month", min: 1, max: 12, common: [1, 6, 12] },
  { key: "dayOfWeek" as const, label: "Day (Week)", min: 0, max: 7, common: [0, 1, 5] },
];

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

function fieldToString(state: FieldState): string {
  switch (state.mode) {
    case "wildcard":
      return "*";
    case "specific":
      return String(state.specific);
    case "range":
      return `${state.rangeStart}-${state.rangeEnd}`;
    case "interval":
      return state.intervalStart === 0
        ? `*/${state.interval}`
        : `${state.intervalStart}/${state.interval}`;
    case "list":
      return state.listValues.length > 0
        ? state.listValues.sort((a, b) => a - b).join(",")
        : "*";
    default:
      return "*";
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

export default function CronBuilder() {
  const [fields, setFields] = useState<Record<string, FieldState>>({
    minute: createDefaultFieldState(0),
    hour: createDefaultFieldState(0),
    dayOfMonth: { ...createDefaultFieldState(1), rangeEnd: 2 },
    month: { ...createDefaultFieldState(1), rangeEnd: 2 },
    dayOfWeek: createDefaultFieldState(0),
  });

  const [reverseInput, setReverseInput] = useState("");
  const [copied, setCopied] = useState(false);

  const cronExpression: CronExpression = {
    minute: fieldToString(fields.minute),
    hour: fieldToString(fields.hour),
    dayOfMonth: fieldToString(fields.dayOfMonth),
    month: fieldToString(fields.month),
    dayOfWeek: fieldToString(fields.dayOfWeek),
  };

  const expressionStr = buildCronExpression(cronExpression);
  const explanation = explainCron(expressionStr);
  const nextRuns = getNextRuns(expressionStr, 5);
  const firesPerHour = getFiresPerHour(expressionStr);

  const applyPreset = useCallback((expression: string) => {
    const parsed = parseCronExpression(expression);
    if (!parsed) return;

    const newFields: Record<string, FieldState> = {};
    const keys = ["minute", "hour", "dayOfMonth", "month", "dayOfWeek"] as const;
    const fieldVal = [parsed.minute, parsed.hour, parsed.dayOfMonth, parsed.month, parsed.dayOfWeek];

    keys.forEach((key, i) => {
      const val = fieldVal[i];
      const config = FIELD_CONFIG[i];
      const state = createDefaultFieldState(config.min);

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

      newFields[key] = state;
    });

    setFields(newFields);
  }, []);

  const updateField = useCallback((key: string, updates: Partial<FieldState>) => {
    setFields((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...updates },
    }));
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(expressionStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [expressionStr]);

  const handleReverseParse = useCallback(() => {
    if (reverseInput.trim() && isValidCron(reverseInput.trim())) {
      applyPreset(reverseInput.trim());
    }
  }, [reverseInput, applyPreset]);

  // Also parse on Enter key
  const handleReverseKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleReverseParse();
    },
    [handleReverseParse]
  );

  const reverseExplanation =
    reverseInput.trim() && isValidCron(reverseInput.trim())
      ? explainCron(reverseInput.trim())
      : reverseInput.trim()
        ? "Invalid cron expression"
        : "";

  return (
    <div className="space-y-8">
      {/* Presets */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Quick Presets</h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.expression}
              onClick={() => applyPreset(preset.expression)}
              className="px-3 py-1.5 text-sm rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors cursor-pointer"
              title={preset.description}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {/* Visual Builder */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Visual Builder</h2>
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

      {/* Expression Output */}
      <section className="bg-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Cron Expression
          </h2>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <CheckIcon />
                Copied!
              </>
            ) : (
              <>
                <CopyIcon />
                Copy
              </>
            )}
          </button>
        </div>
        <div className="font-mono text-3xl sm:text-4xl font-bold tracking-wider text-center py-4">
          {expressionStr.split(" ").map((part, i) => (
            <span key={i}>
              <span className="text-blue-400">{part}</span>
              {i < 4 && <span className="text-slate-600 mx-1"> </span>}
            </span>
          ))}
        </div>
        <div className="text-center text-slate-300 text-lg mt-2">
          {explanation}
        </div>
        <div className="flex justify-center gap-4 mt-4 text-xs text-slate-500 font-mono">
          <span>MIN</span>
          <span>HOUR</span>
          <span>DOM</span>
          <span>MON</span>
          <span>DOW</span>
        </div>
      </section>

      {/* Timeline */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">24-Hour Timeline</h2>
        <Timeline firesPerHour={firesPerHour} />
      </section>

      {/* Next 5 Runs */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Next 5 Scheduled Runs</h2>
        {nextRuns.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {nextRuns.map((date, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                  {i + 1}
                </span>
                <span className="font-mono text-slate-700">
                  {date.toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  {" at "}
                  {date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">Could not calculate next runs for this expression.</p>
        )}
      </section>

      {/* Reverse Parser */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Explain a Cron Expression
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={reverseInput}
            onChange={(e) => setReverseInput(e.target.value)}
            onKeyDown={handleReverseKeyDown}
            placeholder="Paste a cron expression (e.g. */5 * * * *)"
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleReverseParse}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Explain
          </button>
        </div>
        {reverseExplanation && (
          <div
            className={`mt-3 p-4 rounded-lg ${
              reverseExplanation === "Invalid cron expression"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-800 border border-green-200"
            }`}
          >
            {reverseExplanation}
          </div>
        )}
      </section>

      {/* AdSense Placeholder */}
      <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-sm">
        Ad Space — Google AdSense
      </div>
    </div>
  );
}

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
    { value: "wildcard", label: "Every (*)" },
    { value: "specific", label: "Specific" },
    { value: "range", label: "Range" },
    { value: "interval", label: "Interval (*/n)" },
    { value: "list", label: "List" },
  ];

  const toggleListValue = (val: number) => {
    const current = state.listValues;
    if (current.includes(val)) {
      onChange({ listValues: current.filter((v) => v !== val) });
    } else {
      onChange({ listValues: [...current, val] });
    }
  };

  // Generate select options
  const options: number[] = [];
  for (let i = config.min; i <= config.max; i++) options.push(i);

  const dayOfWeekLabels: Record<number, string> = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
    7: "Sun",
  };
  const monthLabels: Record<number, string> = {
    1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
    7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
  };

  const getLabel = (val: number): string => {
    if (config.key === "dayOfWeek") return dayOfWeekLabels[val] || String(val);
    if (config.key === "month") return monthLabels[val] || String(val);
    return String(val);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {config.label}
      </label>
      <select
        value={state.mode}
        onChange={(e) => onChange({ mode: e.target.value as FieldMode })}
        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {modes.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      {state.mode === "specific" && (
        <select
          value={state.specific}
          onChange={(e) => onChange({ specific: parseInt(e.target.value) })}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {options.map((v) => (
            <option key={v} value={v}>
              {getLabel(v)}
            </option>
          ))}
        </select>
      )}

      {state.mode === "range" && (
        <div className="flex items-center gap-2">
          <select
            value={state.rangeStart}
            onChange={(e) => onChange({ rangeStart: parseInt(e.target.value) })}
            className="flex-1 px-2 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {options.map((v) => (
              <option key={v} value={v}>
                {getLabel(v)}
              </option>
            ))}
          </select>
          <span className="text-slate-500 text-sm">to</span>
          <select
            value={state.rangeEnd}
            onChange={(e) => onChange({ rangeEnd: parseInt(e.target.value) })}
            className="flex-1 px-2 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {options.map((v) => (
              <option key={v} value={v}>
                {getLabel(v)}
              </option>
            ))}
          </select>
        </div>
      )}

      {state.mode === "interval" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Every</span>
            <input
              type="number"
              value={state.interval}
              onChange={(e) =>
                onChange({ interval: Math.max(1, parseInt(e.target.value) || 1) })
              }
              min={1}
              max={config.max}
              className="w-20 px-2 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">from</span>
            <select
              value={state.intervalStart}
              onChange={(e) => onChange({ intervalStart: parseInt(e.target.value) })}
              className="flex-1 px-2 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {options.map((v) => (
                <option key={v} value={v}>
                  {getLabel(v)}
                </option>
              ))}
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

function CopyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  );
}
