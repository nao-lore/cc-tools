"use client";

import { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ParsedCron {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

interface FieldInfo {
  key: keyof ParsedCron;
  label: string;
  shortLabel: string;
  min: number;
  max: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FIELD_INFO: FieldInfo[] = [
  { key: "minute",     label: "Minute",       shortLabel: "MIN",  min: 0, max: 59 },
  { key: "hour",       label: "Hour",         shortLabel: "HOUR", min: 0, max: 23 },
  { key: "dayOfMonth", label: "Day of Month", shortLabel: "DOM",  min: 1, max: 31 },
  { key: "month",      label: "Month",        shortLabel: "MON",  min: 1, max: 12 },
  { key: "dayOfWeek",  label: "Day of Week",  shortLabel: "DOW",  min: 0, max: 7  },
];

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ALIASES: Record<string, string> = {
  "@yearly":   "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly":  "0 0 1 * *",
  "@weekly":   "0 0 * * 0",
  "@daily":    "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly":   "0 * * * *",
};

const EXAMPLES = [
  { label: "Every minute",      expr: "* * * * *" },
  { label: "Every 5 min",       expr: "*/5 * * * *" },
  { label: "Hourly",            expr: "0 * * * *" },
  { label: "Daily midnight",    expr: "0 0 * * *" },
  { label: "Daily at 3 AM",     expr: "0 3 * * *" },
  { label: "Weekdays 9 AM",     expr: "0 9 * * 1-5" },
  { label: "Weekly Mon",        expr: "0 9 * * 1" },
  { label: "Monthly 1st",       expr: "0 0 1 * *" },
  { label: "Yearly Jan 1",      expr: "0 0 1 1 *" },
  { label: "@daily",            expr: "@daily" },
  { label: "@hourly",           expr: "@hourly" },
  { label: "@weekly",           expr: "@weekly" },
];

// ─── Cron Logic ───────────────────────────────────────────────────────────────

function resolveAlias(expr: string): string {
  const trimmed = expr.trim().toLowerCase();
  return ALIASES[trimmed] ?? expr;
}

function parseCron(expression: string): ParsedCron | null {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  return {
    minute:     parts[0],
    hour:       parts[1],
    dayOfMonth: parts[2],
    month:      parts[3],
    dayOfWeek:  parts[4],
  };
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
      if (v.includes("-")) {
        const [a, b] = v.split("-").map(Number);
        return !isNaN(a) && !isNaN(b) && a >= min && a <= max && b >= min && b <= max;
      }
      const n = parseInt(v, 10);
      return !isNaN(n) && n >= min && n <= max;
    });
  }
  if (field.includes("-")) {
    const [a, b] = field.split("-").map(Number);
    return !isNaN(a) && !isNaN(b) && a >= min && a <= max && b >= min && b <= max;
  }
  const n = parseInt(field, 10);
  return !isNaN(n) && n >= min && n <= max;
}

function validateCron(expression: string): { valid: boolean; error?: string; resolved?: string } {
  const resolved = resolveAlias(expression);
  const cron = parseCron(resolved);
  if (!cron) {
    return { valid: false, error: "Must have exactly 5 fields: minute hour day month weekday" };
  }
  const checks = [
    { field: cron.minute,     min: 0, max: 59,  name: "Minute"       },
    { field: cron.hour,       min: 0, max: 23,  name: "Hour"         },
    { field: cron.dayOfMonth, min: 1, max: 31,  name: "Day of Month" },
    { field: cron.month,      min: 1, max: 12,  name: "Month"        },
    { field: cron.dayOfWeek,  min: 0, max: 7,   name: "Day of Week"  },
  ];
  for (const c of checks) {
    if (!isValidField(c.field, c.min, c.max)) {
      return { valid: false, error: `Invalid ${c.name} field: "${c.field}"` };
    }
  }
  return { valid: true, resolved };
}

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

function formatTime12(h: number, m: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

function describeField(field: string, unit: string, names?: string[]): string {
  if (field === "*") return `every ${unit}`;
  if (field.includes("/")) {
    const [base, step] = field.split("/");
    const n = parseInt(step);
    const plural = n > 1 ? "s" : "";
    if (base === "*" || base === "0") return `every ${step} ${unit}${plural}`;
    return `every ${step} ${unit}${plural} starting at ${names ? names[parseInt(base)] : base}`;
  }
  if (field.includes(",")) {
    const vals = field.split(",").map((v) => (names ? names[parseInt(v)] ?? v : v));
    if (vals.length === 2) return `${vals[0]} and ${vals[1]}`;
    return vals.slice(0, -1).join(", ") + ", and " + vals[vals.length - 1];
  }
  if (field.includes("-")) {
    const [a, b] = field.split("-");
    return `${names ? names[parseInt(a)] ?? a : a} through ${names ? names[parseInt(b)] ?? b : b}`;
  }
  return names ? (names[parseInt(field)] ?? field) : field;
}

function explainCron(expression: string): string {
  const cron = parseCron(expression);
  if (!cron) return "";
  const { minute, hour, dayOfMonth, month, dayOfWeek } = cron;

  if (expression === "* * * * *") return "Every minute";
  if (minute.includes("/") && hour === "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    const step = minute.split("/")[1];
    return `Every ${step} minute${parseInt(step) > 1 ? "s" : ""}`;
  }

  const parts: string[] = [];

  if (minute !== "*" && hour !== "*" && !minute.includes("/") && !hour.includes("/")) {
    const hours = expandField(hour, 0, 23);
    const minutes = expandField(minute, 0, 59);
    if (hours.length === 1 && minutes.length === 1) {
      parts.push(`At ${formatTime12(hours[0], minutes[0])}`);
    } else if (minutes.length === 1) {
      parts.push(`At minute ${minutes[0]} past ${describeField(hour, "hour")}`);
    } else {
      parts.push(`At ${describeField(minute, "minute")} past ${describeField(hour, "hour")}`);
    }
  } else if (minute !== "*" && !minute.includes("/")) {
    const mins = expandField(minute, 0, 59);
    if (mins.length === 1 && mins[0] === 0) {
      if (hour === "*") parts.push("At the start of every hour");
      else if (hour.includes("/")) parts.push(`Every ${hour.split("/")[1]} hours`);
    } else {
      parts.push(`At minute ${describeField(minute, "minute")}`);
    }
  } else if (minute.includes("/")) {
    const step = minute.split("/")[1];
    if (hour !== "*") parts.push(`Every ${step} minutes during hour ${describeField(hour, "hour")}`);
    else parts.push(`Every ${step} minutes`);
  } else if (hour !== "*") {
    if (hour.includes("/")) parts.push(`Every ${hour.split("/")[1]} hours`);
    else parts.push(`During hour ${describeField(hour, "hour")}`);
  }

  if (dayOfWeek !== "*") {
    const normalized = dayOfWeek === "7" ? "0" : dayOfWeek;
    if (normalized === "1-5") parts.push("on weekdays");
    else if (normalized === "0,6" || normalized === "6,0") parts.push("on weekends");
    else parts.push(`on ${describeField(normalized, "day", DAY_NAMES)}`);
  }

  if (dayOfMonth !== "*") {
    parts.push(`on day ${describeField(dayOfMonth, "day")} of the month`);
  }

  if (month !== "*") {
    parts.push(`in ${describeField(month, "month", MONTH_NAMES)}`);
  }

  return parts.length > 0 ? parts.join(" ") : "Every minute";
}

function getNextRuns(expression: string, count: number = 10): Date[] {
  const cron = parseCron(expression);
  if (!cron) return [];

  const minutes    = expandField(cron.minute,     0, 59);
  const hours      = expandField(cron.hour,       0, 23);
  const daysOfMonth = expandField(cron.dayOfMonth, 1, 31);
  const months     = expandField(cron.month,       1, 12);
  let daysOfWeek   = expandField(cron.dayOfWeek,  0, 7);
  daysOfWeek = [...new Set(daysOfWeek.map((d) => (d === 7 ? 0 : d)))].sort((a, b) => a - b);

  const isDowRestricted = cron.dayOfWeek !== "*";
  const isDomRestricted = cron.dayOfMonth !== "*";

  const results: Date[] = [];
  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
  current.setMinutes(current.getMinutes() + 1);

  const maxIterations = 525600 * 2;
  let iterations = 0;

  while (results.length < count && iterations < maxIterations) {
    const m   = current.getMinutes();
    const h   = current.getHours();
    const dom = current.getDate();
    const mon = current.getMonth() + 1;
    const dow = current.getDay();

    const monthMatch  = months.includes(mon);
    const minuteMatch = minutes.includes(m);
    const hourMatch   = hours.includes(h);

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

function describeFieldDetail(field: string, info: FieldInfo): string {
  if (field === "*") return `Any ${info.label.toLowerCase()} (${info.min}–${info.max})`;
  if (field.includes("/")) {
    const [base, step] = field.split("/");
    const start = base === "*" ? info.min : base;
    return `Every ${step} ${info.label.toLowerCase()}(s) starting from ${start}`;
  }
  if (field.includes(",")) {
    const vals = expandField(field, info.min, info.max);
    return `Specific values: ${vals.join(", ")}`;
  }
  if (field.includes("-")) {
    const [a, b] = field.split("-");
    return `Range from ${a} to ${b}`;
  }
  const n = parseInt(field, 10);
  if (info.key === "month" && MONTH_NAMES[n]) return `${MONTH_NAMES[n]} (${n})`;
  if (info.key === "dayOfWeek" && DAY_NAMES[n % 7] !== undefined) return `${DAY_NAMES[n % 7]} (${n})`;
  return `Specific value: ${n}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const FIELD_COLORS = [
  "text-violet-600 bg-violet-50 border-violet-200",
  "text-blue-600 bg-blue-50 border-blue-200",
  "text-emerald-600 bg-emerald-50 border-emerald-200",
  "text-amber-600 bg-amber-50 border-amber-200",
  "text-rose-600 bg-rose-50 border-rose-200",
];
const FIELD_HIGHLIGHT = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
];

export default function CrontabValidator() {
  const [input, setInput] = useState("*/5 * * * *");
  const [activeField, setActiveField] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const rawInput = input.trim();
  const isAlias = rawInput.toLowerCase() in ALIASES;
  const resolved = resolveAlias(rawInput);
  const validation = validateCron(rawInput);
  const cron = validation.valid ? parseCron(resolved) : null;
  const explanation = cron ? explainCron(resolved) : "";
  const nextRuns = cron ? getNextRuns(resolved, 10) : [];

  // Split resolved into parts for field highlighter
  const resolvedParts = resolved.trim().split(/\s+/);

  const handleExample = useCallback((expr: string) => {
    setInput(expr);
    setActiveField(null);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(resolved);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [resolved]);

  // Detect which field the cursor is in based on caret position
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setActiveField(null);
  }, []);

  const handleInputClick = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const pos = el.selectionStart ?? 0;
    const text = el.value;
    // Count spaces before cursor to find field index
    let spaceCount = 0;
    for (let i = 0; i < pos; i++) {
      if (text[i] === " ") spaceCount++;
    }
    setActiveField(Math.min(spaceCount, 4));
  }, []);

  const handleInputKeyUp = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const pos = el.selectionStart ?? 0;
    const text = el.value;
    let spaceCount = 0;
    for (let i = 0; i < pos; i++) {
      if (text[i] === " ") spaceCount++;
    }
    setActiveField(Math.min(spaceCount, 4));
  }, []);

  return (
    <div className="space-y-6">
      {/* Example Presets */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Examples</h2>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.expr}
              onClick={() => handleExample(ex.expr)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors cursor-pointer font-mono ${
                input === ex.expr
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
              }`}
              title={ex.expr}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </section>

      {/* Input */}
      <section>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Crontab Expression
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onClick={handleInputClick}
            onKeyUp={handleInputKeyUp}
            placeholder="*/5 * * * * or @daily"
            spellCheck={false}
            className={`flex-1 px-4 py-3 rounded-xl border font-mono text-lg text-slate-800 focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
              validation.valid
                ? "border-slate-300 focus:ring-blue-500"
                : rawInput.length > 0
                ? "border-red-300 focus:ring-red-400 bg-red-50"
                : "border-slate-300 focus:ring-blue-500"
            }`}
          />
          {validation.valid && (
            <button
              onClick={handleCopy}
              title="Copy expression"
              className="px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-2"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              <span className="text-sm hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
            </button>
          )}
        </div>

        {/* Field labels under input */}
        {!isAlias && (
          <div className="mt-2 flex gap-2 font-mono text-xs text-slate-400">
            {FIELD_INFO.map((f, i) => (
              <button
                key={f.key}
                onClick={() => setActiveField(activeField === i ? null : i)}
                className={`flex-1 text-center py-1 rounded transition-colors cursor-pointer ${
                  activeField === i
                    ? FIELD_COLORS[i] + " border font-semibold"
                    : "hover:text-slate-600"
                }`}
              >
                {f.shortLabel}
              </button>
            ))}
          </div>
        )}

        {/* Alias note */}
        {isAlias && (
          <p className="mt-2 text-sm text-slate-500">
            Alias resolved to: <span className="font-mono font-semibold text-slate-700">{resolved}</span>
          </p>
        )}
      </section>

      {/* Validation Result */}
      {rawInput.length > 0 && (
        <section
          className={`rounded-xl p-4 border ${
            validation.valid
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {validation.valid ? (
              <>
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white flex-shrink-0">
                  <CheckIcon />
                </span>
                <span className="font-semibold text-green-800">Valid crontab expression</span>
              </>
            ) : (
              <>
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white flex-shrink-0">
                  <XIcon />
                </span>
                <span className="font-semibold text-red-800">Invalid — {validation.error}</span>
              </>
            )}
          </div>
          {validation.valid && explanation && (
            <p className="mt-2 text-green-700 text-base font-medium pl-8">{explanation}</p>
          )}
        </section>
      )}

      {cron && (
        <>
          {/* Visual Field Highlighter */}
          <section className="bg-slate-900 rounded-xl p-6">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Expression Breakdown
            </h2>
            {/* Colored expression display */}
            <div className="flex items-center gap-2 sm:gap-4 justify-center mb-6">
              {resolvedParts.map((part, i) => (
                <button
                  key={i}
                  onClick={() => setActiveField(activeField === i ? null : i)}
                  className={`font-mono text-2xl sm:text-3xl font-bold px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    activeField === i
                      ? FIELD_HIGHLIGHT[i] + " text-white scale-110"
                      : activeField === null
                      ? "text-blue-300 hover:text-white"
                      : "text-slate-600 hover:text-slate-400"
                  }`}
                >
                  {part}
                </button>
              ))}
            </div>

            {/* Field labels */}
            <div className="flex gap-2 sm:gap-4 justify-center text-xs font-mono text-slate-500 mb-4">
              {FIELD_INFO.map((f, i) => (
                <span
                  key={f.key}
                  className={`flex-1 text-center transition-colors ${
                    activeField === i ? "text-white font-semibold" : ""
                  }`}
                >
                  {f.shortLabel}
                </span>
              ))}
            </div>

            {/* Active field detail */}
            {activeField !== null && (
              <div className={`mt-2 p-3 rounded-lg border text-sm ${FIELD_COLORS[activeField]}`}>
                <span className="font-semibold">{FIELD_INFO[activeField].label}: </span>
                {describeFieldDetail(resolvedParts[activeField] ?? "*", FIELD_INFO[activeField])}
              </div>
            )}
            {activeField === null && (
              <p className="text-center text-slate-500 text-xs mt-2">
                Click any field above for details
              </p>
            )}
          </section>

          {/* Field-by-field Breakdown Table */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Field Breakdown</h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 w-8">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Field</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Value</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Range</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {FIELD_INFO.map((f, i) => {
                    const val = resolvedParts[i] ?? "*";
                    return (
                      <tr
                        key={f.key}
                        className={`transition-colors cursor-pointer ${
                          activeField === i ? "bg-slate-50" : "hover:bg-slate-50"
                        }`}
                        onClick={() => setActiveField(activeField === i ? null : i)}
                      >
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white ${FIELD_HIGHLIGHT[i]}`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">{f.label}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block font-mono px-2 py-0.5 rounded border text-xs font-semibold ${FIELD_COLORS[i]}`}>
                            {val}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs hidden sm:table-cell">{f.min}–{f.max}</td>
                        <td className="px-4 py-3 text-slate-600">{describeFieldDetail(val, f)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Next 10 Run Times */}
          <section>
            <h2 className="text-lg font-semibold text-slate-800 mb-3">Next 10 Scheduled Runs</h2>
            {nextRuns.length > 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {nextRuns.map((date, i) => {
                  const isFirst = i === 0;
                  const now = new Date();
                  const diffMs = date.getTime() - now.getTime();
                  const diffMin = Math.round(diffMs / 60000);
                  const relLabel =
                    diffMin < 1
                      ? "< 1 min"
                      : diffMin < 60
                      ? `in ${diffMin} min`
                      : diffMin < 1440
                      ? `in ${Math.round(diffMin / 60)}h`
                      : `in ${Math.round(diffMin / 1440)}d`;

                  return (
                    <div
                      key={i}
                      className={`px-4 py-3 flex items-center gap-3 ${isFirst ? "bg-blue-50" : ""}`}
                    >
                      <span
                        className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold flex-shrink-0 ${
                          isFirst
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="font-mono text-slate-700 flex-1">
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
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isFirst ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                        {relLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500">Could not calculate next runs for this expression.</p>
            )}
          </section>
        </>
      )}

      {/* Alias Reference */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Supported Aliases</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Alias</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Equivalent</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(ALIASES).map(([alias, expr]) => (
                <tr
                  key={alias}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => handleExample(alias)}
                >
                  <td className="px-4 py-2.5 font-mono text-blue-600 font-semibold">{alias}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-600">{expr}</td>
                  <td className="px-4 py-2.5 text-slate-500 hidden sm:table-cell">{explainCron(expr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Ad placeholder */}
      <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-sm">
        Ad Space — Google AdSense
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Crontab Validator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Validate and explain crontab expressions with next run times. Just enter your values and get instant results.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">Is this tool free to use?</summary>
      <p className="mt-2 text-sm text-gray-600">Yes, completely free. No sign-up or account required.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">How accurate are the results?</summary>
      <p className="mt-2 text-sm text-gray-600">Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Crontab Validator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Validate and explain crontab expressions with next run times. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

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

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
