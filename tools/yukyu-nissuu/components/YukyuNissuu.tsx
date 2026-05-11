"use client";

import { useMemo, useState } from "react";

type GrantRow = {
  months: number;
  label: string;
  days: number;
};

type WorkPattern = {
  weekDays: number;
  annualRange: string;
  rows: GrantRow[];
};

type Result = {
  tenureMonths: number;
  tenureLabel: string;
  isStandard: boolean;
  currentGrant: GrantRow | null;
  nextGrant: GrantRow | null;
  currentGrantDate: Date | null;
  nextGrantDate: Date | null;
  statutoryDays: number;
  previousGrantDays: number;
  carryoverCap: number;
  carryoverUsed: number;
  totalAvailable: number;
  remainingDays: number;
  obligationApplies: boolean;
  obligationShortfall: number;
};

const SOURCE_DATE = "2026-05-11";
const STANDARD_ROWS: GrantRow[] = [
  { months: 6, label: "6か月", days: 10 },
  { months: 18, label: "1年6か月", days: 11 },
  { months: 30, label: "2年6か月", days: 12 },
  { months: 42, label: "3年6か月", days: 14 },
  { months: 54, label: "4年6か月", days: 16 },
  { months: 66, label: "5年6か月", days: 18 },
  { months: 78, label: "6年6か月以上", days: 20 },
];

const PROPORTIONAL_PATTERNS: WorkPattern[] = [
  {
    weekDays: 4,
    annualRange: "169〜216日",
    rows: [
      { months: 6, label: "6か月", days: 7 },
      { months: 18, label: "1年6か月", days: 8 },
      { months: 30, label: "2年6か月", days: 9 },
      { months: 42, label: "3年6か月", days: 10 },
      { months: 54, label: "4年6か月", days: 12 },
      { months: 66, label: "5年6か月", days: 13 },
      { months: 78, label: "6年6か月以上", days: 15 },
    ],
  },
  {
    weekDays: 3,
    annualRange: "121〜168日",
    rows: [
      { months: 6, label: "6か月", days: 5 },
      { months: 18, label: "1年6か月", days: 6 },
      { months: 30, label: "2年6か月", days: 6 },
      { months: 42, label: "3年6か月", days: 8 },
      { months: 54, label: "4年6か月", days: 9 },
      { months: 66, label: "5年6か月", days: 10 },
      { months: 78, label: "6年6か月以上", days: 11 },
    ],
  },
  {
    weekDays: 2,
    annualRange: "73〜120日",
    rows: [
      { months: 6, label: "6か月", days: 3 },
      { months: 18, label: "1年6か月", days: 4 },
      { months: 30, label: "2年6か月", days: 4 },
      { months: 42, label: "3年6か月", days: 5 },
      { months: 54, label: "4年6か月", days: 6 },
      { months: 66, label: "5年6か月", days: 6 },
      { months: 78, label: "6年6か月以上", days: 7 },
    ],
  },
  {
    weekDays: 1,
    annualRange: "48〜72日",
    rows: [
      { months: 6, label: "6か月", days: 1 },
      { months: 18, label: "1年6か月", days: 2 },
      { months: 30, label: "2年6か月", days: 2 },
      { months: 42, label: "3年6か月", days: 2 },
      { months: 54, label: "4年6か月", days: 3 },
      { months: 66, label: "5年6か月", days: 3 },
      { months: 78, label: "6年6か月以上", days: 3 },
    ],
  },
];

const SAMPLES = [
  { label: "正社員 2年目", hireDate: "2024-04-01", baseDate: "2026-05-11", weekDays: 5, weeklyHours30: true },
  { label: "週4パート", hireDate: "2023-10-01", baseDate: "2026-05-11", weekDays: 4, weeklyHours30: false },
  { label: "週3アルバイト", hireDate: "2025-07-01", baseDate: "2026-05-11", weekDays: 3, weeklyHours30: false },
];

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function parseDate(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMonths(date: Date, months: number) {
  const result = new Date(date);
  const originalDay = result.getDate();
  result.setMonth(result.getMonth() + months);
  if (result.getDate() < originalDay) result.setDate(0);
  return result;
}

function diffFullMonths(from: Date, to: Date) {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) months -= 1;
  return months;
}

function formatDate(date: Date | null) {
  if (!date) return "-";
  return toDateInputValue(date).replaceAll("-", "/");
}

function formatTenure(months: number) {
  if (months < 0) return "未到来";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest}か月`;
  return rest === 0 ? `${years}年` : `${years}年${rest}か月`;
}

function readNumber(value: string, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
}

function rowsForPattern(weekDays: number, weeklyHours30: boolean) {
  if (weeklyHours30 || weekDays >= 5) return STANDARD_ROWS;
  return PROPORTIONAL_PATTERNS.find((pattern) => pattern.weekDays === weekDays)?.rows ?? STANDARD_ROWS;
}

function previousGrantFor(rows: GrantRow[], current: GrantRow | null) {
  if (!current) return 0;
  const currentIndex = rows.findIndex((row) => row.months === current.months);
  if (currentIndex <= 0) return 0;
  return rows[currentIndex - 1].days;
}

function findCurrentGrant(rows: GrantRow[], tenureMonths: number) {
  if (tenureMonths < 6) return null;
  return rows.reduce<GrantRow | null>((current, row) => (tenureMonths >= row.months ? row : current), null);
}

function findNextGrant(rows: GrantRow[], tenureMonths: number) {
  return rows.find((row) => tenureMonths < row.months) ?? rows[rows.length - 1];
}

function buildResult({
  hire,
  base,
  weekDays,
  weeklyHours30,
  attendance80,
  carryover,
  used,
}: {
  hire: Date | null;
  base: Date | null;
  weekDays: number;
  weeklyHours30: boolean;
  attendance80: boolean;
  carryover: number;
  used: number;
}): Result | null {
  if (!hire || !base || base < hire) return null;

  const tenureMonths = diffFullMonths(hire, base);
  const rows = rowsForPattern(weekDays, weeklyHours30);
  const currentGrant = attendance80 ? findCurrentGrant(rows, tenureMonths) : null;
  const nextGrant = findNextGrant(rows, tenureMonths);
  const previousGrantDays = previousGrantFor(rows, currentGrant);
  const carryoverCap = Math.min(20, previousGrantDays || carryover);
  const carryoverUsed = Math.min(carryover, carryoverCap);
  const statutoryDays = currentGrant?.days ?? 0;
  const totalAvailable = carryoverUsed + statutoryDays;
  const remainingDays = Math.max(0, totalAvailable - used);
  const currentGrantDate = currentGrant ? addMonths(hire, currentGrant.months) : null;
  let nextGrantDate = nextGrant ? addMonths(hire, nextGrant.months) : null;

  if (tenureMonths >= 78 && nextGrantDate && nextGrantDate <= base) {
    while (nextGrantDate <= base) {
      nextGrantDate = addMonths(nextGrantDate, 12);
    }
  }

  const obligationApplies = statutoryDays >= 10;
  const obligationShortfall = obligationApplies ? Math.max(0, 5 - used) : 0;

  return {
    tenureMonths,
    tenureLabel: formatTenure(tenureMonths),
    isStandard: weeklyHours30 || weekDays >= 5,
    currentGrant,
    nextGrant,
    currentGrantDate,
    nextGrantDate,
    statutoryDays,
    previousGrantDays,
    carryoverCap,
    carryoverUsed,
    totalAvailable,
    remainingDays,
    obligationApplies,
    obligationShortfall,
  };
}

export default function YukyuNissuu() {
  const [hireDate, setHireDate] = useState("2024-04-01");
  const [baseDate, setBaseDate] = useState(todayString());
  const [weekDays, setWeekDays] = useState(5);
  const [weeklyHours30, setWeeklyHours30] = useState(true);
  const [attendance80, setAttendance80] = useState(true);
  const [carryover, setCarryover] = useState("0");
  const [usedDays, setUsedDays] = useState("0");
  const [copied, setCopied] = useState(false);

  const hire = parseDate(hireDate);
  const base = parseDate(baseDate);
  const carryoverValue = readNumber(carryover);
  const usedValue = readNumber(usedDays);
  const result = useMemo(
    () =>
      buildResult({
        hire,
        base,
        weekDays,
        weeklyHours30,
        attendance80,
        carryover: carryoverValue,
        used: usedValue,
      }),
    [hire, base, weekDays, weeklyHours30, attendance80, carryoverValue, usedValue]
  );

  const rows = rowsForPattern(weekDays, weeklyHours30);
  const error = !hireDate
    ? "入社日を入力してください。"
    : !baseDate
    ? "基準日を入力してください。"
    : result === null
    ? "基準日は入社日以降の日付にしてください。"
    : "";

  async function copyResult() {
    if (!result) return;
    const lines = [
      "有給休暇 付与日数計算",
      `更新日: ${SOURCE_DATE}`,
      `入社日: ${hireDate}`,
      `基準日: ${baseDate}`,
      `勤続: ${result.tenureLabel}`,
      `区分: ${result.isStandard ? "通常付与" : `比例付与 週${weekDays}日`}`,
      `法定付与日数: ${result.statutoryDays}日`,
      `繰越反映: ${result.carryoverUsed}日`,
      `取得済み: ${usedValue}日`,
      `残日数目安: ${result.remainingDays}日`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function applySample(sample: (typeof SAMPLES)[number]) {
    setHireDate(sample.hireDate);
    setBaseDate(sample.baseDate);
    setWeekDays(sample.weekDays);
    setWeeklyHours30(sample.weeklyHours30);
    setAttendance80(true);
    setCarryover("0");
    setUsedDays("0");
    setCopied(false);
  }

  function clearInputs() {
    setHireDate("");
    setBaseDate(todayString());
    setWeekDays(5);
    setWeeklyHours30(true);
    setAttendance80(true);
    setCarryover("0");
    setUsedDays("0");
    setCopied(false);
  }

  return (
    <section className="space-y-6">
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">基本条件</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                入社日、基準日、週所定労働日数から法定付与日数を計算します。
              </p>
            </div>
            <button
              type="button"
              onClick={clearInputs}
              className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              クリア
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <DateInput id="yukyu-hire" label="入社日" value={hireDate} onChange={setHireDate} />
            <DateInput id="yukyu-base" label="基準日" value={baseDate} onChange={setBaseDate} />
            <div>
              <p className="text-sm font-medium text-slate-700">週所定労働日数</p>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => {
                      setWeekDays(days);
                      if (days >= 5) setWeeklyHours30(true);
                    }}
                    className={`rounded-xl border px-2 py-2 text-sm font-semibold ${
                      weekDays === days
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {days}日
                  </button>
                ))}
              </div>
            </div>

            <Toggle
              label="週所定労働時間が30時間以上"
              description="30時間以上なら、週4日以下でも通常付与として扱います。"
              checked={weeklyHours30}
              onChange={setWeeklyHours30}
            />
            <Toggle
              label="直前期間の出勤率が8割以上"
              description="8割未満の場合は、その基準日の法定付与なしとして表示します。"
              checked={attendance80}
              onChange={setAttendance80}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <DayInput id="yukyu-carryover" label="前年からの繰越残" value={carryover} onChange={setCarryover} />
              <DayInput id="yukyu-used" label="当年取得済み" value={usedDays} onChange={setUsedDays} />
            </div>
          </div>

          <p className={`mt-4 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
            {error || `計算はブラウザ上で完結し、入力情報は外部に送信されません。参照日: ${SOURCE_DATE}`}
          </p>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SAMPLES.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => applySample(sample)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
          <p className="text-sm font-medium text-slate-300">法定付与日数</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-5xl font-bold tracking-tight">{result?.statutoryDays ?? 0}日</p>
              <p className="mt-2 text-sm text-slate-300">
                {result ? (result.isStandard ? "通常付与" : `比例付与（週${weekDays}日）`) : "条件を入力してください"}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-sm text-slate-400">勤続</p>
              <p className="mt-1 text-2xl font-semibold">{result?.tenureLabel ?? "-"}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric label="今回付与日" value={formatDate(result?.currentGrantDate ?? null)} />
            <Metric label="次回付与日" value={formatDate(result?.nextGrantDate ?? null)} />
            <Metric label="残日数目安" value={`${result?.remainingDays ?? 0}日`} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!result || Boolean(error)}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied ? "コピーしました" : "結果をコピー"}
            </button>
            <a
              href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/faq/kijyunhou_6_00001.html"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              厚労省の表を見る
            </a>
          </div>
        </div>
      </div>

      {result && (
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="繰越反映" value={`${result.carryoverUsed}日`} note={`法定上の繰越目安上限: ${result.carryoverCap}日`} />
          <SummaryCard label="当年取得済み" value={`${usedValue}日`} note="本人取得・計画年休・時季指定分を合算" />
          <SummaryCard label="利用可能残" value={`${result.remainingDays}日`} note={`${result.carryoverUsed} + ${result.statutoryDays} - ${usedValue}`} />
        </div>
      )}

      {result?.obligationApplies && (
        <section
          className={`rounded-2xl border p-5 shadow-sm ${
            result.obligationShortfall === 0
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <h2 className="text-base font-semibold text-slate-950">年5日の取得義務</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            法定付与日数が10日以上なので、基準日から1年以内に5日分を取得させる義務の対象です。
            {result.obligationShortfall === 0
              ? " 入力上は5日以上取得済みです。"
              : ` 入力上はあと${result.obligationShortfall}日の取得が必要です。`}
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-slate-950">法定付与日数テーブル</h2>
        <p className="mt-1 text-sm text-slate-500">
          {weeklyHours30 || weekDays >= 5
            ? "週5日以上、週30時間以上、または年間217日以上は通常付与です。"
            : `週${weekDays}日・年間${PROPORTIONAL_PATTERNS.find((pattern) => pattern.weekDays === weekDays)?.annualRange}の比例付与です。`}
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">勤続期間</th>
                <th className="py-2 pr-4 text-right">通常付与</th>
                <th className="py-2 pr-4 text-right">週4日</th>
                <th className="py-2 pr-4 text-right">週3日</th>
                <th className="py-2 pr-4 text-right">週2日</th>
                <th className="py-2 text-right">週1日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {STANDARD_ROWS.map((row, index) => (
                <tr key={row.months} className={result?.currentGrant?.months === row.months ? "bg-sky-50" : undefined}>
                  <td className="py-3 pr-4 font-medium text-slate-900">{row.label}</td>
                  <td className="py-3 pr-4 text-right font-semibold text-slate-900">{row.days}日</td>
                  {PROPORTIONAL_PATTERNS.map((pattern) => (
                    <td key={pattern.weekDays} className="py-3 pr-4 text-right text-slate-700">
                      {pattern.rows[index].days}日
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold text-slate-950">計算上の注意点</h2>
        <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-600 md:grid-cols-3">
          <InfoBlock
            title="8割出勤が前提"
            body="年次有給休暇の付与には、雇入れから6か月継続勤務し、全労働日の8割以上出勤していることが必要です。"
          />
          <InfoBlock
            title="比例付与の対象"
            body="週30時間未満かつ週4日以下、または年間48〜216日の短時間労働者は比例付与表を使います。"
          />
          <InfoBlock
            title="時効は2年"
            body="年休権は発生日から2年間行使可能です。会社独自の上乗せ分や特別休暇は就業規則を確認してください。"
          />
        </div>
      </section>
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
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-slate-950"
      />
    </div>
  );
}

function DayInput({
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
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-950">
        <input
          id={id}
          type="number"
          min="0"
          step="0.5"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
        />
        <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">日</span>
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`rounded-2xl border p-4 text-left ${
        checked ? "border-slate-950 bg-slate-950 text-white" : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold">{label}</div>
        <div className={`h-5 w-9 rounded-full p-0.5 ${checked ? "bg-white" : "bg-slate-300"}`}>
          <div className={`h-4 w-4 rounded-full ${checked ? "translate-x-4 bg-slate-950" : "bg-white"} transition-transform`} />
        </div>
      </div>
      <p className={`mt-1 text-sm leading-6 ${checked ? "text-slate-300" : "text-slate-500"}`}>{description}</p>
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function SummaryCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{note}</p>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <p className="mt-1">{body}</p>
    </div>
  );
}
