"use client";

import { useMemo, useState } from "react";
import {
  addBusinessDays,
  countBusinessDays,
  formatDate,
  getHolidaysInRange,
  parseDate,
  type Holiday,
} from "../lib/holidays";
import { CustomHolidays } from "./CustomHolidays";
import { MiniCalendar } from "./MiniCalendar";

type Mode = "range" | "reverse";
type CopiedTarget = "summary" | "csv" | null;

const MIN_SUPPORTED_DATE = "2024-01-01";
const MAX_SUPPORTED_DATE = "2027-12-31";

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

const RANGE_EXAMPLES = [
  {
    label: "今月末まで",
    startOffset: 0,
    endOffset: 21,
  },
  {
    label: "月曜から金曜",
    start: "2026-05-11",
    end: "2026-05-15",
  },
  {
    label: "GWをまたぐ",
    start: "2026-04-27",
    end: "2026-05-08",
  },
];

const REVERSE_EXAMPLES = [
  { label: "5営業日後", days: 5 },
  { label: "10営業日後", days: 10 },
  { label: "20営業日後", days: 20 },
];

function todayStr() {
  return formatDate(new Date());
}

function addCalendarDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function defaultEndStr() {
  return formatDate(addCalendarDays(new Date(), 30));
}

function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return formatDate(parseDate(value)) === value;
}

function formatJaDate(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${DAY_NAMES[date.getDay()]}）`;
}

function formatShortDate(dateStr: string) {
  const date = parseDate(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}（${DAY_NAMES[date.getDay()]}）`;
}

function countCalendarDays(start: Date, end: Date) {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function makeCsv(rows: string[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
}

function supportedHolidayWarning(startDate: string, endDate: string) {
  if (!startDate || !endDate) return "";
  if (startDate < MIN_SUPPORTED_DATE || endDate > MAX_SUPPORTED_DATE) {
    return "祝日自動判定は2024年から2027年までの内閣府公表データに対応しています。範囲外の日付は土日判定のみになる可能性があります。";
  }
  return "";
}

function buildHolidayRows(holidays: Holiday[]) {
  if (!holidays.length) return [["除外された祝日・カスタム休日", "なし"]];
  return holidays.map((holiday) => [holiday.date, holiday.name]);
}

export function BusinessDaysCalculator() {
  const [mode, setMode] = useState<Mode>("range");
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndStr);
  const [businessDays, setBusinessDays] = useState("10");
  const [includeStartDate, setIncludeStartDate] = useState(true);
  const [customHolidays, setCustomHolidays] = useState<Set<string>>(new Set());
  const [copiedTarget, setCopiedTarget] = useState<CopiedTarget>(null);

  const start = useMemo(() => (isValidDateString(startDate) ? parseDate(startDate) : null), [startDate]);
  const end = useMemo(() => (isValidDateString(endDate) ? parseDate(endDate) : null), [endDate]);
  const requestedDays = Number.parseInt(businessDays, 10);

  const validation = useMemo(() => {
    if (!isValidDateString(startDate)) return "開始日を正しく入力してください。";
    if (mode === "range") {
      if (!isValidDateString(endDate)) return "終了日を正しく入力してください。";
      if (start && end && start > end) return "終了日は開始日以降の日付にしてください。";
      if (start && end && countCalendarDays(start, end) > 370) return "1回の計算範囲は370日以内にしてください。";
    }
    if (mode === "reverse") {
      if (!Number.isFinite(requestedDays) || requestedDays < 1) return "営業日数は1以上で入力してください。";
      if (requestedDays > 250) return "逆算できる営業日数は250日までです。";
    }
    return "";
  }, [end, endDate, mode, requestedDays, start, startDate]);

  const rangeResult = useMemo(() => {
    if (mode !== "range" || validation || !start || !end) return null;
    const countStart = includeStartDate ? start : addCalendarDays(start, 1);
    const result = countStart > end ? { count: 0, holidays: [] } : countBusinessDays(countStart, end, customHolidays);
    const calendarDays = countCalendarDays(start, end);
    return {
      businessDays: result.count,
      holidays: result.holidays,
      calendarDays,
      nonBusinessDays: calendarDays - result.count,
      start,
      end,
    };
  }, [customHolidays, end, includeStartDate, mode, start, validation]);

  const reverseResult = useMemo(() => {
    if (mode !== "reverse" || validation || !start) return null;
    const resultDate = addBusinessDays(start, requestedDays, customHolidays);
    const coveredStart = addCalendarDays(start, 1);
    const holidays = coveredStart <= resultDate ? countBusinessDays(coveredStart, resultDate, customHolidays).holidays : [];
    return {
      date: resultDate,
      dateStr: formatDate(resultDate),
      calendarDays: countCalendarDays(start, resultDate) - 1,
      holidays,
    };
  }, [customHolidays, mode, requestedDays, start, validation]);

  const calendarStart = start ?? new Date();
  const calendarEnd = mode === "range" && end ? end : reverseResult?.date ?? addCalendarDays(calendarStart, 30);
  const officialHolidays = useMemo(() => getHolidaysInRange(calendarStart, calendarEnd), [calendarEnd, calendarStart]);
  const warning = supportedHolidayWarning(formatDate(calendarStart), formatDate(calendarEnd));

  const summary = useMemo(() => {
    if (rangeResult) {
      return [
        "営業日数計算結果",
        `期間: ${formatJaDate(rangeResult.start)} 〜 ${formatJaDate(rangeResult.end)}`,
        `営業日数: ${rangeResult.businessDays}日`,
        `暦日数: ${rangeResult.calendarDays}日`,
        `除外日数: ${rangeResult.nonBusinessDays}日`,
        `開始日: ${includeStartDate ? "含める" : "含めない"}`,
      ].join("\n");
    }
    if (reverseResult && start) {
      return [
        "営業日逆算結果",
        `開始日: ${formatJaDate(start)}`,
        `営業日数: ${requestedDays}日後`,
        `到達日: ${formatJaDate(reverseResult.date)}`,
        `暦日数: ${reverseResult.calendarDays}日`,
      ].join("\n");
    }
    return "";
  }, [includeStartDate, rangeResult, requestedDays, reverseResult, start]);

  const csv = useMemo(() => {
    const rows = [["項目", "値"]];
    if (rangeResult) {
      rows.push(
        ["モード", "期間指定"],
        ["開始日", formatDate(rangeResult.start)],
        ["終了日", formatDate(rangeResult.end)],
        ["開始日を含める", includeStartDate ? "はい" : "いいえ"],
        ["営業日数", String(rangeResult.businessDays)],
        ["暦日数", String(rangeResult.calendarDays)],
        ["除外日数", String(rangeResult.nonBusinessDays)]
      );
      rows.push([], ["除外日", "名称"], ...buildHolidayRows(rangeResult.holidays));
    } else if (reverseResult && start) {
      rows.push(
        ["モード", "営業日数から逆算"],
        ["開始日", formatDate(start)],
        ["営業日数", String(requestedDays)],
        ["到達日", reverseResult.dateStr],
        ["暦日数", String(reverseResult.calendarDays)]
      );
      rows.push([], ["除外日", "名称"], ...buildHolidayRows(reverseResult.holidays));
    }
    return makeCsv(rows);
  }, [includeStartDate, rangeResult, requestedDays, reverseResult, start]);

  async function copyText(target: Exclude<CopiedTarget, null>, text: string) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedTarget(target);
    window.setTimeout(() => setCopiedTarget(null), 1600);
  }

  function downloadCsv() {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `eigyoubi-${mode}-${startDate}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setMode("range");
    setStartDate(todayStr());
    setEndDate(defaultEndStr());
    setBusinessDays("10");
    setIncludeStartDate(true);
    setCustomHolidays(new Set());
    setCopiedTarget(null);
  }

  function addCustomHoliday(date: string) {
    setCustomHolidays((prev) => {
      const next = new Set(prev);
      next.add(date);
      return next;
    });
  }

  function removeCustomHoliday(date: string) {
    setCustomHolidays((prev) => {
      const next = new Set(prev);
      next.delete(date);
      return next;
    });
  }

  function applyRangeExample(example: (typeof RANGE_EXAMPLES)[number]) {
    setMode("range");
    setIncludeStartDate(true);
    if ("start" in example && example.start && example.end) {
      setStartDate(example.start);
      setEndDate(example.end);
      return;
    }
    const base = new Date();
    setStartDate(formatDate(addCalendarDays(base, example.startOffset ?? 0)));
    setEndDate(formatDate(addCalendarDays(base, example.endOffset ?? 30)));
  }

  function applyReverseExample(example: (typeof REVERSE_EXAMPLES)[number]) {
    setMode("reverse");
    setBusinessDays(String(example.days));
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 xl:border-b-0 xl:border-r">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">計算条件</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                土日、国民の祝日、カスタム休日を除いて営業日を数えます。
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="w-fit whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              リセット
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("range")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                mode === "range" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
              }`}
            >
              期間指定
            </button>
            <button
              type="button"
              onClick={() => setMode("reverse")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                mode === "reverse" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
              }`}
            >
              逆算
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <DateInput id="business-start" label="開始日" value={startDate} onChange={setStartDate} />

            {mode === "range" ? (
              <>
                <DateInput id="business-end" label="終了日" value={endDate} onChange={setEndDate} />
                <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                  <span>
                    <span className="font-medium text-slate-800">開始日を営業日数に含める</span>
                    <span className="mt-0.5 block text-xs text-slate-500">納期の「当日含む/含まない」を切り替えます。</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={includeStartDate}
                    onChange={(event) => setIncludeStartDate(event.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-slate-950"
                  />
                </label>
              </>
            ) : (
              <div>
                <label htmlFor="business-days" className="text-sm font-medium text-slate-700">
                  営業日数
                </label>
                <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
                  <input
                    id="business-days"
                    type="text"
                    inputMode="numeric"
                    value={businessDays}
                    onChange={(event) => setBusinessDays(event.target.value.replace(/\D/g, ""))}
                    placeholder="10"
                    className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
                    aria-describedby="business-days-error"
                  />
                  <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">営業日後</span>
                </div>
              </div>
            )}
          </div>

          <p id="business-days-error" className={`mt-3 min-h-5 text-sm ${validation ? "text-red-600" : "text-slate-500"}`}>
            {validation || "計算はブラウザ上で完結し、入力した日付は外部に送信されません。"}
          </p>

          {warning && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              {warning}
            </div>
          )}

          <div className="mt-5 grid gap-4">
            <ExampleGroup title="サンプル: 期間指定">
              {RANGE_EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => applyRangeExample(example)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {example.label}
                </button>
              ))}
            </ExampleGroup>
            <ExampleGroup title="サンプル: 逆算">
              {REVERSE_EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => applyReverseExample(example)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {example.label}
                </button>
              ))}
            </ExampleGroup>
          </div>

          <div className="mt-5">
            <CustomHolidays customHolidays={customHolidays} onAdd={addCustomHoliday} onRemove={removeCustomHoliday} />
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <ResultPanel
            mode={mode}
            rangeResult={rangeResult}
            reverseResult={reverseResult}
            requestedDays={requestedDays}
            validation={validation}
          />

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText("summary", summary)}
              disabled={!summary}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copiedTarget === "summary" ? "コピーしました" : "結果をコピー"}
            </button>
            <button
              type="button"
              onClick={() => copyText("csv", csv)}
              disabled={!summary}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copiedTarget === "csv" ? "CSVをコピーしました" : "CSVをコピー"}
            </button>
            <button
              type="button"
              onClick={downloadCsv}
              disabled={!summary}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              CSVダウンロード
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="min-w-0">
              <MiniCalendar startDate={calendarStart} endDate={calendarEnd} customHolidays={customHolidays} />
            </div>
            <HolidayList holidays={mode === "range" ? rangeResult?.holidays ?? [] : reverseResult?.holidays ?? officialHolidays} />
          </div>
        </div>
      </div>
    </section>
  );
}

function DateInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
      />
    </div>
  );
}

function ExampleGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function ResultPanel({
  mode,
  rangeResult,
  reverseResult,
  requestedDays,
  validation,
}: {
  mode: Mode;
  rangeResult: {
    businessDays: number;
    calendarDays: number;
    nonBusinessDays: number;
    holidays: Holiday[];
    start: Date;
    end: Date;
  } | null;
  reverseResult: {
    date: Date;
    dateStr: string;
    calendarDays: number;
    holidays: Holiday[];
  } | null;
  requestedDays: number;
  validation: string;
}) {
  if (validation) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <div>
          <p className="text-sm font-semibold text-slate-800">入力を確認してください</p>
          <p className="mt-1 text-sm text-slate-500">{validation}</p>
        </div>
      </div>
    );
  }

  if (mode === "range" && rangeResult) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">営業日数</p>
            <p className="mt-1 font-mono text-5xl font-bold tracking-tight text-emerald-950">
              {rangeResult.businessDays}
              <span className="ml-1 text-lg font-semibold">日</span>
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-sm font-medium text-emerald-700">対象期間</p>
            <p className="mt-1 text-base font-semibold text-emerald-950">
              {formatShortDate(formatDate(rangeResult.start))} - {formatShortDate(formatDate(rangeResult.end))}
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric label="暦日数" value={`${rangeResult.calendarDays}日`} />
          <Metric label="除外日数" value={`${rangeResult.nonBusinessDays}日`} />
          <Metric label="祝日/カスタム休日" value={`${rangeResult.holidays.length}日`} />
        </div>
      </div>
    );
  }

  if (mode === "reverse" && reverseResult) {
    return (
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
        <div>
          <p className="text-sm font-medium text-sky-700">{requestedDays}営業日後</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-sky-950">{formatJaDate(reverseResult.date)}</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Metric label="暦日数" value={`${reverseResult.calendarDays}日後`} />
          <Metric label="除外された祝日" value={`${reverseResult.holidays.length}日`} />
          <Metric label="結果日" value={reverseResult.dateStr} />
        </div>
      </div>
    );
  }

  return null;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/70 bg-white/75 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function HolidayList({ holidays }: { holidays: Holiday[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-950">除外された祝日</h3>
      {holidays.length ? (
        <ul className="mt-3 max-h-[260px] space-y-2 overflow-auto pr-1">
          {holidays.map((holiday) => (
            <li key={`${holiday.date}-${holiday.name}`} className="rounded-lg bg-white px-3 py-2 text-sm">
              <div className="font-medium text-slate-800">{holiday.name}</div>
              <div className="mt-0.5 text-xs text-slate-500">{formatShortDate(holiday.date)}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-500">この範囲では祝日・カスタム休日による除外はありません。</p>
      )}
    </div>
  );
}
