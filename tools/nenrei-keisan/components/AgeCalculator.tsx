"use client";

import { useMemo, useState } from "react";

type AgeResult = {
  fullAge: number;
  traditionalAge: number;
  zodiac: string;
  constellation: string;
  livedDays: number;
  nextBirthdayDate: Date;
  daysUntilBirthday: number;
};

const ZODIAC = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const SAMPLES = [
  { label: "1990/4/1", year: "1990", month: "4", day: "1" },
  { label: "2000/1/1", year: "2000", month: "1", day: "1" },
  { label: "うるう日", year: "2000", month: "2", day: "29" },
];

function todayAtMidnight() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isLeapYear(year: number) {
  return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function birthdayInYear(year: number, month: number, day: number) {
  if (month === 2 && day === 29 && !isLeapYear(year)) {
    return new Date(year, 1, 28);
  }
  return new Date(year, month - 1, day);
}

function getZodiac(year: number) {
  return ZODIAC[((year - 1900) % 12 + 12) % 12];
}

function getConstellation(month: number, day: number) {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "牡羊座";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "牡牛座";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "双子座";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "蟹座";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "獅子座";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "乙女座";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "天秤座";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "蠍座";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "射手座";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "山羊座";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "水瓶座";
  return "魚座";
}

function formatDate(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function calculateAge(year: number, month: number, day: number, today: Date): AgeResult {
  const birthDate = new Date(year, month - 1, day);
  let birthdayThisYear = birthdayInYear(today.getFullYear(), month, day);
  let fullAge = today.getFullYear() - year;

  if (today < birthdayThisYear) {
    fullAge -= 1;
  }

  if (birthdayThisYear <= today) {
    birthdayThisYear = birthdayInYear(today.getFullYear() + 1, month, day);
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const livedDays = Math.floor((today.getTime() - birthDate.getTime()) / msPerDay);
  const daysUntilBirthday = Math.ceil((birthdayThisYear.getTime() - today.getTime()) / msPerDay);

  return {
    fullAge,
    traditionalAge: today.getFullYear() - year + 1,
    zodiac: getZodiac(year),
    constellation: getConstellation(month, day),
    livedDays,
    nextBirthdayDate: birthdayThisYear,
    daysUntilBirthday,
  };
}

function buildCopyText(result: AgeResult, year: string, month: string, day: string) {
  return [
    `生年月日: ${year}年${month}月${day}日`,
    `満年齢: ${result.fullAge}歳`,
    `数え年: ${result.traditionalAge}歳`,
    `干支: ${result.zodiac}`,
    `星座: ${result.constellation}`,
    `生まれてから: ${result.livedDays.toLocaleString("ja-JP")}日`,
    `次の誕生日: ${formatDate(result.nextBirthdayDate)}（あと${result.daysUntilBirthday}日）`,
  ].join("\n");
}

export default function AgeCalculator() {
  const today = useMemo(() => todayAtMidnight(), []);
  const currentYear = today.getFullYear();
  const [year, setYear] = useState("1990");
  const [month, setMonth] = useState("4");
  const [day, setDay] = useState("1");
  const [copied, setCopied] = useState(false);

  const yearNumber = Number.parseInt(year, 10);
  const monthNumber = Number.parseInt(month, 10);
  const dayNumber = Number.parseInt(day, 10);
  const maxDay = Number.isFinite(yearNumber) && Number.isFinite(monthNumber) ? daysInMonth(yearNumber, monthNumber) : 31;

  const error = useMemo(() => {
    if (!year || !month || !day) return "生年月日をすべて入力してください。";
    if (yearNumber < 1900 || yearNumber > currentYear) return `年は1900〜${currentYear}の範囲で入力してください。`;
    if (monthNumber < 1 || monthNumber > 12) return "月は1〜12の範囲で入力してください。";
    if (dayNumber < 1 || dayNumber > maxDay) return `${yearNumber}年${monthNumber}月は${maxDay}日までです。`;
    const birthDate = new Date(yearNumber, monthNumber - 1, dayNumber);
    if (birthDate > today) return "未来の日付は指定できません。";
    return "";
  }, [currentYear, day, dayNumber, maxDay, month, monthNumber, today, year, yearNumber]);

  const result = useMemo(() => {
    if (error) return null;
    return calculateAge(yearNumber, monthNumber, dayNumber, today);
  }, [dayNumber, error, monthNumber, today, yearNumber]);

  function updateYear(value: string) {
    setYear(value.replace(/[^\d]/g, "").slice(0, 4));
    setCopied(false);
  }

  function updateMonth(value: string) {
    setMonth(value.replace(/[^\d]/g, "").slice(0, 2));
    setCopied(false);
  }

  function updateDay(value: string) {
    setDay(value.replace(/[^\d]/g, "").slice(0, 2));
    setCopied(false);
  }

  function applySample(sample: (typeof SAMPLES)[number]) {
    setYear(sample.year);
    setMonth(sample.month);
    setDay(sample.day);
    setCopied(false);
  }

  function reset() {
    setYear("");
    setMonth("");
    setDay("");
    setCopied(false);
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(buildCopyText(result, year, month, day));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.85fr)_minmax(360px,0.65fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <h2 className="text-base font-semibold text-slate-950">生年月日</h2>
          <p className="mt-1 text-sm text-slate-500">満年齢、数え年、干支、星座、次の誕生日までの日数を計算します。</p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <NumberField label="年" value={year} onChange={updateYear} suffix="年" placeholder="1990" />
            <NumberField label="月" value={month} onChange={updateMonth} suffix="月" placeholder="4" />
            <NumberField label="日" value={day} onChange={updateDay} suffix="日" placeholder="1" />
          </div>

          <p className={`mt-3 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
            {error || `今日（${formatDate(today)}）時点で計算します。2月29日生まれは平年では2月28日を次の誕生日として扱います。`}
          </p>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SAMPLES.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => applySample(sample)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-950 hover:bg-slate-50"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!result}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {copied ? "コピーしました" : "結果をコピー"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              リセット
            </button>
          </div>
        </div>

        <aside className="p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">計算結果</h2>
          {!result ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">入力値を確認してください。</div>
          ) : (
            <div className="mt-4 grid gap-3">
              <ResultCard label="満年齢" value={`${result.fullAge}歳`} note="誕生日を迎えるごとに加算" strong />
              <ResultCard label="数え年" value={`${result.traditionalAge}歳`} note="生まれた年を1歳として計算" />
              <ResultCard label="干支" value={result.zodiac} note={`${year}年生まれ`} />
              <ResultCard label="星座" value={result.constellation} note={`${month}月${day}日生まれ`} />
              <ResultCard label="生まれてから" value={`${result.livedDays.toLocaleString("ja-JP")}日`} note="日付差で計算" />
              <ResultCard label="次の誕生日まで" value={`あと${result.daysUntilBirthday}日`} note={formatDate(result.nextBirthdayDate)} />
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function NumberField({ label, value, onChange, suffix, placeholder }: { label: string; value: string; onChange: (value: string) => void; suffix: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-950">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 px-3 py-2.5 text-right font-mono outline-none"
        />
        <span className="border-l border-slate-200 bg-slate-50 px-2 py-2.5 text-sm text-slate-500">{suffix}</span>
      </div>
    </label>
  );
}

function ResultCard({ label, value, note, strong = false }: { label: string; value: string; note: string; strong?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${strong ? "border-sky-200 bg-sky-50" : "border-slate-200 bg-white"}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 font-semibold text-slate-950 ${strong ? "text-3xl" : "text-lg"}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}
