"use client";

import { useState, useMemo } from "react";

// 干支 (eto) — 子=0 based on year % 12, anchor: 2020 (子年)
const ETO = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 星座 ranges [month, day, name]
const SEIZA: [number, number, string][] = [
  [1, 20, "水瓶座"],
  [2, 19, "魚座"],
  [3, 21, "牡羊座"],
  [4, 20, "牡牛座"],
  [5, 21, "双子座"],
  [6, 21, "蟹座"],
  [7, 23, "獅子座"],
  [8, 23, "乙女座"],
  [9, 23, "天秤座"],
  [10, 23, "蠍座"],
  [11, 22, "射手座"],
  [12, 22, "山羊座"],
];

function getSeiza(month: number, day: number): string {
  // month is 1-based
  for (const [m, d, name] of SEIZA) {
    if (month < m || (month === m && day < d)) return name;
  }
  return "山羊座"; // Dec 22+
}

function getEto(year: number): string {
  // 2020 is 子 (index 0)
  const idx = ((year - 2020) % 12 + 12) % 12;
  return ETO[idx];
}

// 学年: based on April 2 cutoff
// A child born Apr 2 of year Y enters 小1 in spring of year (Y+6)
// So their 小1 entry year = Y + 6 (if born Apr 2 or later) or Y + 5 (if born Apr 1 or earlier)
function getGakunen(birthDate: Date, today: Date): string {
  const birthYear = birthDate.getFullYear();
  const birthMonth = birthDate.getMonth() + 1; // 1-based
  const birthDay = birthDate.getDate();

  // April 2 cutoff: born Apr 2+ -> school year starts the following spring
  // "school cohort year" = the fiscal year in which they turn 6 by Apr 1
  // A child must turn 6 by April 1 to enter 小1 that April.
  // Born on or before Apr 1 of year Y: turns 6 by Apr 1 of year Y+6 → enters 小1 in Y+6
  // Born on Apr 2+ of year Y: turns 6 by Apr 1 of year Y+7 → enters 小1 in Y+7
  let shougakuStart: number;
  if (birthMonth < 4 || (birthMonth === 4 && birthDay <= 1)) {
    shougakuStart = birthYear + 6;
  } else {
    shougakuStart = birthYear + 7;
  }

  // Current fiscal year (April start)
  const todayMonth = today.getMonth() + 1;
  const todayYear = today.getFullYear();
  const fiscalYear = todayMonth >= 4 ? todayYear : todayYear - 1;

  const grade = fiscalYear - shougakuStart + 1; // 1 = 小1

  if (grade < 1) return "未就学";
  if (grade <= 6) return `小学${grade}年生`;
  if (grade <= 9) return `中学${grade - 6}年生`;
  if (grade <= 12) return `高校${grade - 9}年生`;
  if (grade <= 16) return `大学${grade - 12}年生`;
  return "社会人";
}

function calcMansai(birthDate: Date, today: Date): number {
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

function calcKazoe(birthDate: Date, today: Date): number {
  // 数え年 = 満年齢 + 1, but add another +1 before birthday in the calendar year
  const mansai = calcMansai(birthDate, today);
  const hasBirthdayPassedThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());
  return hasBirthdayPassedThisYear ? mansai + 1 : mansai + 2;
}

// Date when person will turn targetAge
function birthdayForAge(birthDate: Date, targetAge: number): Date {
  const d = new Date(birthDate);
  d.setFullYear(birthDate.getFullYear() + targetAge);
  return d;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function InfoCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-4 flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      {sub && <span className="text-xs text-muted">{sub}</span>}
    </div>
  );
}

export default function NenrekiJisan() {
  const today = new Date();
  const defaultBirth = `${today.getFullYear() - 25}-04-15`;

  const [birthInput, setBirthInput] = useState(defaultBirth);
  const [futureAge, setFutureAge] = useState("");

  const birthDate = useMemo(() => {
    if (!birthInput) return null;
    const d = new Date(birthInput);
    return isNaN(d.getTime()) ? null : d;
  }, [birthInput]);

  const results = useMemo(() => {
    if (!birthDate) return null;
    const mansai = calcMansai(birthDate, today);
    const kazoe = calcKazoe(birthDate, today);
    const gakunen = getGakunen(birthDate, today);
    const eto = getEto(birthDate.getFullYear());
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    const seiza = getSeiza(month, day);
    return { mansai, kazoe, gakunen, eto, seiza };
  }, [birthDate]);

  const futureResult = useMemo(() => {
    if (!birthDate || futureAge === "") return null;
    const age = parseInt(futureAge, 10);
    if (isNaN(age) || age < 0 || age > 150) return null;
    const d = birthdayForAge(birthDate, age);
    return { age, date: formatDate(d) };
  }, [birthDate, futureAge]);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted">生年月日</h3>
        <input
          type="date"
          value={birthInput}
          onChange={(e) => setBirthInput(e.target.value)}
          max={today.toISOString().slice(0, 10)}
          className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Results grid */}
      {results && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <InfoCard
              label="満年齢"
              value={`${results.mansai}歳`}
              sub="今日現在"
            />
            <InfoCard
              label="数え年"
              value={`${results.kazoe}歳`}
              sub="生まれた年を1歳と数える"
            />
            <InfoCard
              label="学年"
              value={results.gakunen}
              sub="4月2日区切り"
            />
            <InfoCard
              label="干支"
              value={results.eto}
              sub={`${birthDate!.getFullYear()}年生まれ`}
            />
            <InfoCard
              label="星座"
              value={results.seiza}
              sub={`${birthDate!.getMonth() + 1}月${birthDate!.getDate()}日生まれ`}
            />
          </div>

          {/* Future age calculator */}
          <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
            <h3 className="text-sm font-medium text-muted">
              何歳になる日を調べる
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={150}
                placeholder="例: 60"
                value={futureAge}
                onChange={(e) => setFutureAge(e.target.value)}
                className="w-28 px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
              />
              <span className="text-sm text-foreground">歳になる日</span>
            </div>
            {futureResult && (
              <div className="rounded-xl bg-accent/10 border border-accent/30 px-4 py-3">
                <p className="text-sm text-foreground">
                  <span className="font-semibold text-accent">
                    {futureResult.age}歳
                  </span>{" "}
                  になるのは{" "}
                  <span className="font-semibold">{futureResult.date}</span>{" "}
                  です
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    </div>
  );
}
