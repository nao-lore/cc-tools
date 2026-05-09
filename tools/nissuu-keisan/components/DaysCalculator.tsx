"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  formatDate,
  getHolidaysInRange,
  parseDate,
  type Holiday,
} from "@/tools/eigyoubi/lib/holidays";

type Mode = "range" | "offset";
type Direction = "after" | "before";
type CopiedTarget = "summary" | "csv" | null;

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];
const MS_PER_DAY = 86_400_000;

const RANGE_EXAMPLES = [
  { label: "今日から30日", startOffset: 0, endOffset: 30 },
  { label: "今月末まで", startOffset: 0, endOfMonth: true },
  { label: "GWをまたぐ", start: "2026-04-27", end: "2026-05-08" },
];

const OFFSET_EXAMPLES = [
  { label: "30日後", days: "30", direction: "after" as const },
  { label: "90日後", days: "90", direction: "after" as const },
  { label: "14日前", days: "14", direction: "before" as const },
];

function todayStr() {
  return formatDate(new Date());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function defaultEndStr() {
  return formatDate(addDays(new Date(), 30));
}

function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return formatDate(parseDate(value)) === value;
}

function formatJaDate(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${DAY_NAMES[date.getDay()]}）`;
}

function diffDays(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
}

function daysInYear(year: number) {
  return new Date(year, 1, 29).getMonth() === 1 ? 366 : 365;
}

function dayOfYear(date: Date) {
  return diffDays(new Date(date.getFullYear(), 0, 1), date) + 1;
}

function durationParts(start: Date, end: Date) {
  let cursor = new Date(start);
  let years = 0;
  let months = 0;

  while (new Date(cursor.getFullYear() + 1, cursor.getMonth(), cursor.getDate()) <= end) {
    cursor = new Date(cursor.getFullYear() + 1, cursor.getMonth(), cursor.getDate());
    years++;
  }
  while (new Date(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate()) <= end) {
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
    months++;
  }

  return { years, months, days: diffDays(cursor, end) };
}

function supportedHolidayWarning(startDate: string, endDate: string) {
  if (startDate < "2024-01-01" || endDate > "2027-12-31") {
    return "祝日表示は2024年から2027年までの内閣府公表データに対応しています。範囲外の日付は祝日一覧に出ない可能性があります。";
  }
  return "";
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

function formatNumber(value: number) {
  return Math.round(value).toLocaleString();
}

export function DaysCalculator() {
  const [mode, setMode] = useState<Mode>("range");
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndStr);
  const [offsetDays, setOffsetDays] = useState("30");
  const [direction, setDirection] = useState<Direction>("after");
  const [includeEndDate, setIncludeEndDate] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState<CopiedTarget>(null);

  const start = useMemo(() => (isValidDateString(startDate) ? parseDate(startDate) : null), [startDate]);
  const end = useMemo(() => (isValidDateString(endDate) ? parseDate(endDate) : null), [endDate]);
  const offsetValue = Number.parseInt(offsetDays, 10);

  const validation = useMemo(() => {
    if (!isValidDateString(startDate)) return "開始日を正しく入力してください。";
    if (mode === "range") {
      if (!isValidDateString(endDate)) return "終了日を正しく入力してください。";
      if (start && end && start > end) return "終了日は開始日以降の日付にしてください。";
      if (start && end && diffDays(start, end) > 36_500) return "計算範囲は100年以内にしてください。";
    }
    if (mode === "offset") {
      if (!Number.isFinite(offsetValue) || offsetValue < 0) return "日数は0以上で入力してください。";
      if (offsetValue > 36_500) return "前後計算の日数は36,500日以内にしてください。";
    }
    return "";
  }, [end, endDate, mode, offsetValue, start, startDate]);

  const rangeResult = useMemo(() => {
    if (mode !== "range" || validation || !start || !end) return null;
    const elapsedDays = diffDays(start, end);
    const countedDays = includeEndDate ? elapsedDays + 1 : elapsedDays;
    const parts = durationParts(start, end);
    const holidays = getHolidaysInRange(start, end);
    return {
      start,
      end,
      elapsedDays,
      countedDays,
      weeks: Math.floor(countedDays / 7),
      remainingDays: countedDays % 7,
      hours: countedDays * 24,
      minutes: countedDays * 24 * 60,
      seconds: countedDays * 24 * 60 * 60,
      parts,
      holidays,
      dayOfYearStart: dayOfYear(start),
      dayOfYearEnd: dayOfYear(end),
    };
  }, [end, includeEndDate, mode, start, validation]);

  const offsetResult = useMemo(() => {
    if (mode !== "offset" || validation || !start) return null;
    const signed = direction === "after" ? offsetValue : -offsetValue;
    const date = addDays(start, signed);
    const rangeStart = direction === "after" ? start : date;
    const rangeEnd = direction === "after" ? date : start;
    return {
      base: start,
      date,
      dateStr: formatDate(date),
      holidays: getHolidaysInRange(rangeStart, rangeEnd),
      dayOfYear: dayOfYear(date),
      daysInYear: daysInYear(date.getFullYear()),
    };
  }, [direction, mode, offsetValue, start, validation]);

  const calendarStart = rangeResult?.start ?? offsetResult?.base ?? start ?? new Date();
  const calendarEnd = rangeResult?.end ?? offsetResult?.date ?? addDays(calendarStart, 30);
  const warning = supportedHolidayWarning(formatDate(calendarStart), formatDate(calendarEnd));

  const summary = useMemo(() => {
    if (rangeResult) {
      return [
        "日数計算結果",
        `開始日: ${formatJaDate(rangeResult.start)}`,
        `終了日: ${formatJaDate(rangeResult.end)}`,
        `日数: ${rangeResult.countedDays}日`,
        `経過日数: ${rangeResult.elapsedDays}日`,
        `週換算: ${rangeResult.weeks}週${rangeResult.remainingDays}日`,
        `年月日換算: ${rangeResult.parts.years}年${rangeResult.parts.months}ヶ月${rangeResult.parts.days}日`,
        `終了日を含める: ${includeEndDate ? "はい" : "いいえ"}`,
      ].join("\n");
    }
    if (offsetResult) {
      return [
        "日付前後計算結果",
        `基準日: ${formatJaDate(offsetResult.base)}`,
        `日数: ${offsetValue}日${direction === "after" ? "後" : "前"}`,
        `結果日: ${formatJaDate(offsetResult.date)}`,
        `年内通算日: ${offsetResult.dayOfYear}/${offsetResult.daysInYear}`,
      ].join("\n");
    }
    return "";
  }, [direction, includeEndDate, offsetResult, offsetValue, rangeResult]);

  const csv = useMemo(() => {
    const rows = [["項目", "値"]];
    if (rangeResult) {
      rows.push(
        ["モード", "日付間"],
        ["開始日", formatDate(rangeResult.start)],
        ["終了日", formatDate(rangeResult.end)],
        ["日数", String(rangeResult.countedDays)],
        ["経過日数", String(rangeResult.elapsedDays)],
        ["週", `${rangeResult.weeks}週${rangeResult.remainingDays}日`],
        ["年月日", `${rangeResult.parts.years}年${rangeResult.parts.months}ヶ月${rangeResult.parts.days}日`],
        ["時間", String(rangeResult.hours)],
        ["分", String(rangeResult.minutes)],
        ["秒", String(rangeResult.seconds)]
      );
      rows.push([], ["祝日", "名称"], ...rangeResult.holidays.map((holiday) => [holiday.date, holiday.name]));
    } else if (offsetResult) {
      rows.push(
        ["モード", "前後計算"],
        ["基準日", formatDate(offsetResult.base)],
        ["方向", direction === "after" ? "後" : "前"],
        ["日数", String(offsetValue)],
        ["結果日", offsetResult.dateStr],
        ["年内通算日", `${offsetResult.dayOfYear}/${offsetResult.daysInYear}`]
      );
      rows.push([], ["祝日", "名称"], ...offsetResult.holidays.map((holiday) => [holiday.date, holiday.name]));
    }
    return makeCsv(rows);
  }, [direction, offsetResult, offsetValue, rangeResult]);

  function reset() {
    setMode("range");
    setStartDate(todayStr());
    setEndDate(defaultEndStr());
    setOffsetDays("30");
    setDirection("after");
    setIncludeEndDate(false);
    setCopiedTarget(null);
  }

  async function copyText(target: Exclude<CopiedTarget, null>, text: string) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedTarget(target);
    window.setTimeout(() => setCopiedTarget(null), 1600);
  }

  function downloadCsv() {
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nissuu-keisan-${mode}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function applyRangeExample(example: (typeof RANGE_EXAMPLES)[number]) {
    setMode("range");
    setIncludeEndDate(false);
    if ("start" in example && example.start && example.end) {
      setStartDate(example.start);
      setEndDate(example.end);
      return;
    }
    const base = new Date();
    setStartDate(formatDate(addDays(base, example.startOffset ?? 0)));
    if ("endOfMonth" in example && example.endOfMonth) {
      setEndDate(formatDate(new Date(base.getFullYear(), base.getMonth() + 1, 0)));
    } else {
      setEndDate(formatDate(addDays(base, example.endOffset ?? 30)));
    }
  }

  function applyOffsetExample(example: (typeof OFFSET_EXAMPLES)[number]) {
    setMode("offset");
    setOffsetDays(example.days);
    setDirection(example.direction);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">日付条件</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">日付間の日数、または指定日からN日前後の日付を計算します。</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
              日付間
            </button>
            <button
              type="button"
              onClick={() => setMode("offset")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                mode === "offset" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
              }`}
            >
              前後計算
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <DateInput id="days-start" label={mode === "range" ? "開始日" : "基準日"} value={startDate} onChange={setStartDate} />

            {mode === "range" ? (
              <>
                <DateInput id="days-end" label="終了日" value={endDate} onChange={setEndDate} />
                <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                  <span>
                    <span className="font-medium text-slate-800">終了日を日数に含める</span>
                    <span className="mt-0.5 block text-xs text-slate-500">イベント日数や宿泊日数など、数え方に合わせて切り替えます。</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={includeEndDate}
                    onChange={(event) => setIncludeEndDate(event.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-slate-950"
                  />
                </label>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="offset-days" className="text-sm font-medium text-slate-700">
                    日数
                  </label>
                  <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
                    <input
                      id="offset-days"
                      type="text"
                      inputMode="numeric"
                      value={offsetDays}
                      onChange={(event) => setOffsetDays(event.target.value.replace(/\D/g, ""))}
                      className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
                    />
                    <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">日</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setDirection("after")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      direction === "after" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    後
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection("before")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      direction === "before" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
                    }`}
                  >
                    前
                  </button>
                </div>
              </>
            )}
          </div>

          <p className={`mt-3 min-h-5 text-sm ${validation ? "text-red-600" : "text-slate-500"}`}>
            {validation || "計算はブラウザ上で完結し、入力した日付は外部に送信されません。"}
          </p>

          {warning && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">{warning}</div>}

          <div className="mt-5 grid gap-4">
            <ExampleGroup title="サンプル: 日付間">
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
            <ExampleGroup title="サンプル: 前後計算">
              {OFFSET_EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => applyOffsetExample(example)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {example.label}
                </button>
              ))}
            </ExampleGroup>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <ResultPanel
            mode={mode}
            rangeResult={rangeResult}
            offsetResult={offsetResult}
            offsetValue={offsetValue}
            direction={direction}
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

          <div className="mt-6">
            <HolidayList holidays={rangeResult?.holidays ?? offsetResult?.holidays ?? []} />
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

function ExampleGroup({ title, children }: { title: string; children: ReactNode }) {
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
  offsetResult,
  offsetValue,
  direction,
  validation,
}: {
  mode: Mode;
  rangeResult: {
    start: Date;
    end: Date;
    elapsedDays: number;
    countedDays: number;
    weeks: number;
    remainingDays: number;
    hours: number;
    minutes: number;
    seconds: number;
    parts: { years: number; months: number; days: number };
    dayOfYearStart: number;
    dayOfYearEnd: number;
  } | null;
  offsetResult: {
    base: Date;
    date: Date;
    dateStr: string;
    dayOfYear: number;
    daysInYear: number;
  } | null;
  offsetValue: number;
  direction: Direction;
  validation: string;
}) {
  if (validation) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <div>
          <p className="text-sm font-semibold text-slate-800">入力エラーを確認してください</p>
          <p className="mt-1 text-sm text-slate-500">{validation}</p>
        </div>
      </div>
    );
  }

  if (mode === "range" && rangeResult) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">日数</p>
              <p className="mt-1 font-mono text-5xl font-bold tracking-tight text-emerald-950">
                {formatNumber(rangeResult.countedDays)}
                <span className="ml-1 text-lg font-semibold">日</span>
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-sm font-medium text-emerald-700">期間</p>
              <p className="mt-1 text-base font-bold text-emerald-950">
                {formatDate(rangeResult.start)} - {formatDate(rangeResult.end)}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-emerald-800">経過日数は {formatNumber(rangeResult.elapsedDays)} 日です。</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="週換算" value={`${rangeResult.weeks}週${rangeResult.remainingDays}日`} note="7日単位で換算" />
          <Metric label="年月日換算" value={`${rangeResult.parts.years}年${rangeResult.parts.months}ヶ月${rangeResult.parts.days}日`} note="暦に沿った概算" />
          <Metric label="年内通算日" value={`${rangeResult.dayOfYearStart} → ${rangeResult.dayOfYearEnd}`} note="開始日と終了日" />
          <Metric label="時間" value={`${formatNumber(rangeResult.hours)}時間`} note="24時間換算" />
          <Metric label="分" value={`${formatNumber(rangeResult.minutes)}分`} note="60分換算" />
          <Metric label="秒" value={`${formatNumber(rangeResult.seconds)}秒`} note="60秒換算" />
        </div>
      </div>
    );
  }

  if (mode === "offset" && offsetResult) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <p className="text-sm font-medium text-sky-700">
            {offsetValue}日{direction === "after" ? "後" : "前"}
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-sky-950">{formatJaDate(offsetResult.date)}</p>
          <p className="mt-3 text-sm leading-6 text-sky-800">基準日: {formatJaDate(offsetResult.base)}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="結果日" value={offsetResult.dateStr} note="YYYY-MM-DD" />
          <Metric label="年内通算日" value={`${offsetResult.dayOfYear}/${offsetResult.daysInYear}`} note="その年の何日目か" />
          <Metric label="曜日" value={`${DAY_NAMES[offsetResult.date.getDay()]}曜日`} note="結果日の曜日" />
        </div>
      </div>
    );
  }

  return null;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function HolidayList({ holidays }: { holidays: Holiday[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-950">期間内の祝日</h3>
      {holidays.length ? (
        <ul className="mt-3 max-h-[260px] space-y-2 overflow-auto pr-1">
          {holidays.map((holiday) => {
            const date = parseDate(holiday.date);
            return (
              <li key={`${holiday.date}-${holiday.name}`} className="rounded-lg bg-white px-3 py-2 text-sm">
                <div className="font-medium text-slate-800">{holiday.name}</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {date.getMonth() + 1}/{date.getDate()}（{DAY_NAMES[date.getDay()]}）
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-500">この範囲では祝日が見つかりません。</p>
      )}
    </div>
  );
}
