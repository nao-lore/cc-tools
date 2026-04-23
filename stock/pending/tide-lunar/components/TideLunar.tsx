"use client";

import { useState, useMemo } from "react";

// Known new moon reference: 2000-01-06 18:14 UTC
const NEW_MOON_REF = new Date("2000-01-06T18:14:00Z").getTime();
const SYNODIC_MONTH_MS = 29.53059 * 24 * 60 * 60 * 1000;

function getMoonAge(date: Date): number {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0).getTime();
  const elapsed = dayStart - NEW_MOON_REF;
  const cycles = elapsed / SYNODIC_MONTH_MS;
  const age = (cycles - Math.floor(cycles)) * 29.53059;
  return Math.round(age * 10) / 10;
}

type TideName = "大潮" | "中潮" | "小潮" | "長潮" | "若潮";

function getTideName(moonAge: number): TideName {
  const a = Math.floor(moonAge);
  // Based on traditional Japanese tide naming by moon age
  if (a <= 2 || (a >= 28 && a <= 29)) return "大潮";
  if (a <= 6) return "中潮";
  if (a <= 9) return "小潮";
  if (a === 10) return "長潮";
  if (a <= 12) return "若潮";
  if (a <= 17) return "中潮";
  if (a <= 20) return "大潮";
  if (a <= 23) return "中潮";
  if (a <= 25) return "小潮";
  if (a === 26) return "長潮";
  if (a <= 27) return "若潮";
  return "大潮";
}

function getTideColor(name: TideName): string {
  switch (name) {
    case "大潮": return "bg-blue-600 text-white";
    case "中潮": return "bg-blue-400 text-white";
    case "小潮": return "bg-sky-300 text-gray-800";
    case "長潮": return "bg-purple-400 text-white";
    case "若潮": return "bg-teal-400 text-white";
  }
}

function getTideBadgeColor(name: TideName): string {
  switch (name) {
    case "大潮": return "bg-blue-100 text-blue-800 border-blue-300";
    case "中潮": return "bg-sky-100 text-sky-800 border-sky-300";
    case "小潮": return "bg-cyan-100 text-cyan-800 border-cyan-300";
    case "長潮": return "bg-purple-100 text-purple-800 border-purple-300";
    case "若潮": return "bg-teal-100 text-teal-800 border-teal-300";
  }
}

// Tokyo approx: lat=35.69, lon=139.69
// Sunrise/sunset approximation using Spencer's formula + hour angle
function getSunTimes(date: Date): { sunrise: string; sunset: string; dayLength: string } {
  const lat = 35.69 * (Math.PI / 180);
  const lon = 139.69;

  // Day of year
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (24 * 60 * 60 * 1000));

  // Solar declination (degrees)
  const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180);
  const decl = Math.asin(0.39779 * Math.sin(B));

  // Hour angle at sunrise/sunset
  const cosH = -Math.tan(lat) * Math.tan(decl);
  if (cosH < -1) return { sunrise: "終日昼", sunset: "終日昼", dayLength: "24h" };
  if (cosH > 1) return { sunrise: "終日夜", sunset: "終日夜", dayLength: "0h" };

  const H = Math.acos(cosH) * (180 / Math.PI); // degrees

  // Equation of time (minutes)
  const f = (279.575 + 0.9856 * dayOfYear) * (Math.PI / 180);
  const EqT = (-104.7 * Math.sin(f) + 596.2 * Math.sin(2 * f) + 4 * Math.sin(3 * f)
    - 12.79 * Math.sin(4 * f) - 429.3 * Math.cos(f) - 2 * Math.cos(2 * f) + 19.99 * Math.cos(3 * f)) / 3600;

  const lonCorrection = (lon - 135) / 15; // hours offset from JST meridian (135E)

  const sunriseH = 12 - H / 15 - lonCorrection + EqT;
  const sunsetH = 12 + H / 15 - lonCorrection + EqT;

  const fmt = (h: number) => {
    const totalMin = Math.round(h * 60);
    const hh = Math.floor(totalMin / 60) % 24;
    const mm = totalMin % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };

  const lengthH = (sunsetH - sunriseH);
  const lh = Math.floor(lengthH);
  const lm = Math.round((lengthH - lh) * 60);

  return {
    sunrise: fmt(sunriseH),
    sunset: fmt(sunsetH),
    dayLength: `${lh}h${String(lm).padStart(2, "0")}m`,
  };
}

// Moon phase visual: returns shadow style for CSS circle
function getMoonPhaseStyle(moonAge: number): { background: string; boxShadow: string } {
  // Phase: 0=new, ~7.4=first quarter, ~14.7=full, ~22.1=last quarter
  const phase = moonAge / 29.53059; // 0..1

  if (phase < 0.05 || phase > 0.95) {
    // New moon - all dark
    return { background: "#1e293b", boxShadow: "none" };
  }
  if (Math.abs(phase - 0.5) < 0.05) {
    // Full moon
    return { background: "#fef9c3", boxShadow: "0 0 20px 4px rgba(254,240,138,0.6)" };
  }

  // Waxing: 0..0.5, Waning: 0.5..1
  // Use inset box-shadow to create the crescent/gibbous effect
  const waxing = phase < 0.5;
  const normalizedPhase = waxing ? phase * 2 : (phase - 0.5) * 2; // 0..1 within half

  // Shadow offset creates illusion of illuminated portion
  // For waxing: right side lit, shadow on left
  // For waning: left side lit, shadow on right
  const offset = Math.round((1 - normalizedPhase * 2) * 40); // px
  const shadowX = waxing ? -offset : offset;
  const shadowColor = "rgba(15,23,42,0.95)";

  return {
    background: "#fef9c3",
    boxShadow: `inset ${shadowX}px 0 0 ${Math.abs(offset) + 2}px ${shadowColor}`,
  };
}

function getMoonEmoji(moonAge: number): string {
  const phase = moonAge / 29.53059;
  if (phase < 0.0625) return "🌑";
  if (phase < 0.1875) return "🌒";
  if (phase < 0.3125) return "🌓";
  if (phase < 0.4375) return "🌔";
  if (phase < 0.5625) return "🌕";
  if (phase < 0.6875) return "🌖";
  if (phase < 0.8125) return "🌗";
  if (phase < 0.9375) return "🌘";
  return "🌑";
}

function getPhaseName(moonAge: number): string {
  const phase = moonAge / 29.53059;
  if (phase < 0.0625) return "新月";
  if (phase < 0.1875) return "三日月";
  if (phase < 0.3125) return "上弦の月";
  if (phase < 0.4375) return "十三夜月";
  if (phase < 0.5625) return "満月";
  if (phase < 0.6875) return "十六夜月";
  if (phase < 0.8125) return "下弦の月";
  if (phase < 0.9375) return "有明月";
  return "新月";
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function TideLunar() {
  const todayStr = toLocalDateString(new Date());
  const [dateStr, setDateStr] = useState(todayStr);

  const selectedDate = useMemo(() => {
    const d = new Date(dateStr + "T12:00:00");
    return isNaN(d.getTime()) ? new Date() : d;
  }, [dateStr]);

  const moonAge = useMemo(() => getMoonAge(selectedDate), [selectedDate]);
  const tideName = useMemo(() => getTideName(moonAge), [moonAge]);
  const sunTimes = useMemo(() => getSunTimes(selectedDate), [selectedDate]);
  const phaseStyle = useMemo(() => getMoonPhaseStyle(moonAge), [moonAge]);
  const phaseName = useMemo(() => getPhaseName(moonAge), [moonAge]);
  const moonEmoji = useMemo(() => getMoonEmoji(moonAge), [moonAge]);

  // Week view: 3 days before, selected, 3 days after
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(selectedDate, i - 3);
      const age = getMoonAge(d);
      return {
        date: d,
        moonAge: age,
        tideName: getTideName(age),
        isSelected: i === 3,
      };
    });
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="max-w-lg mx-auto px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-center mb-1">月齢・潮見表</h1>
        <p className="text-slate-400 text-sm text-center mb-6">釣り・潮干狩りの計画に。東京基準。</p>

        {/* Date picker */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setDateStr(toLocalDateString(addDays(selectedDate, -1)))}
            className="w-9 h-9 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-lg transition-colors"
          >
            ‹
          </button>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-center text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={() => setDateStr(toLocalDateString(addDays(selectedDate, 1)))}
            className="w-9 h-9 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-lg transition-colors"
          >
            ›
          </button>
        </div>

        {/* Main card */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-4 shadow-xl border border-slate-700">
          <div className="flex items-start gap-6">
            {/* Moon visual */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className="w-20 h-20 rounded-full"
                style={phaseStyle}
              />
              <span className="text-2xl">{moonEmoji}</span>
              <span className="text-xs text-slate-400">{phaseName}</span>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div>
                <div className="text-xs text-slate-400 mb-1">月齢</div>
                <div className="text-4xl font-bold text-yellow-300">
                  {moonAge.toFixed(1)}
                  <span className="text-lg font-normal text-slate-400 ml-1">日</span>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400 mb-1">潮名</div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getTideBadgeColor(tideName)}`}>
                  {tideName}
                </span>
              </div>
            </div>
          </div>

          {/* Sun times */}
          <div className="mt-5 pt-4 border-t border-slate-700 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs text-slate-400 mb-1">🌅 日の出</div>
              <div className="text-lg font-semibold text-orange-300">{sunTimes.sunrise}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">☀️ 日照時間</div>
              <div className="text-lg font-semibold text-yellow-200">{sunTimes.dayLength}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">🌇 日の入り</div>
              <div className="text-lg font-semibold text-rose-300">{sunTimes.sunset}</div>
            </div>
          </div>
        </div>

        {/* Ad placeholder */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl h-16 flex items-center justify-center mb-4">
          <span className="text-slate-600 text-xs">広告</span>
        </div>

        {/* Week view */}
        <div className="bg-slate-800 rounded-2xl p-4 shadow-xl border border-slate-700 mb-4">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">前後3日の潮見表</h2>
          <div className="space-y-1">
            {weekDays.map(({ date, moonAge: age, tideName: tide, isSelected }) => {
              const wday = WEEKDAYS[date.getDay()];
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setDateStr(toLocalDateString(date))}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  {/* Date */}
                  <div className="w-16 shrink-0">
                    <span className="text-sm font-medium">
                      {date.getMonth() + 1}/{date.getDate()}
                    </span>
                    <span className={`ml-1 text-xs ${isWeekend ? (date.getDay() === 0 ? "text-red-400" : "text-sky-400") : "text-slate-500"}`}>
                      ({wday})
                    </span>
                  </div>

                  {/* Moon age */}
                  <div className="w-20 shrink-0">
                    <span className="text-lg mr-1">{getMoonEmoji(age)}</span>
                    <span className="text-xs text-slate-400">{age.toFixed(1)}日</span>
                  </div>

                  {/* Tide badge */}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                    isSelected ? "bg-blue-500 text-white border-blue-400" : getTideBadgeColor(tide)
                  }`}>
                    {tide}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tide guide */}
        <div className="bg-slate-800 rounded-2xl p-4 shadow-xl border border-slate-700 mb-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">潮名の目安</h2>
          <div className="space-y-2">
            {(["大潮", "中潮", "小潮", "長潮", "若潮"] as TideName[]).map((name) => {
              const descriptions: Record<TideName, string> = {
                大潮: "干満差が大きい。釣り・潮干狩りに最適",
                中潮: "標準的な潮。釣りに適している",
                小潮: "干満差が小さい。潮の動きが少ない",
                長潮: "最も干満差が小さい。潮の変化が緩やか",
                若潮: "長潮翌日。潮が戻り始める",
              };
              return (
                <div key={name} className="flex items-start gap-3">
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-bold border ${getTideBadgeColor(name)}`}>
                    {name}
                  </span>
                  <span className="text-xs text-slate-400">{descriptions[name]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 pb-8">
          ※ 月齢・潮名・日出入り時刻は概算です。精密な潮汐情報は気象庁をご確認ください。
        </p>
      </div>
    </div>
  );
}
