"use client";

import { useState, useCallback } from "react";

interface AgeResult {
  満年齢: number;
  数え年: number;
  干支: string;
  星座: string;
  生まれてから日数: number;
  次の誕生日まで: number;
  次の誕生日: string;
}

const 干支リスト = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

function get干支(year: number): string {
  // 1900年は庚子(ねずみ)年。干支は12年周期。
  return 干支リスト[((year - 1900) % 12 + 12) % 12];
}

function get星座(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "牡羊座 ♈";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "牡牛座 ♉";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "双子座 ♊";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "蟹座 ♋";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "獅子座 ♌";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "乙女座 ♍";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "天秤座 ♎";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "蠍座 ♏";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "射手座 ♐";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "山羊座 ♑";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "水瓶座 ♒";
  return "魚座 ♓";
}

function calculateAge(birthDate: Date, today: Date): AgeResult {
  const birthYear = birthDate.getFullYear();
  const birthMonth = birthDate.getMonth() + 1;
  const birthDay = birthDate.getDate();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  // 満年齢
  let age = todayYear - birthYear;
  if (todayMonth < birthMonth || (todayMonth === birthMonth && todayDay < birthDay)) {
    age--;
  }

  // 数え年（生まれた年を1歳とし、元旦に1歳加算）
  const 数え年 = todayYear - birthYear + 1;

  // 干支
  const 干支 = get干支(birthYear);

  // 星座
  const 星座 = get星座(birthMonth, birthDay);

  // 生まれてから何日
  const msPerDay = 1000 * 60 * 60 * 24;
  const 生まれてから日数 = Math.floor((today.getTime() - birthDate.getTime()) / msPerDay);

  // 次の誕生日
  let nextBirthday = new Date(todayYear, birthMonth - 1, birthDay);
  if (nextBirthday <= today) {
    nextBirthday = new Date(todayYear + 1, birthMonth - 1, birthDay);
  }
  const 次の誕生日まで = Math.ceil((nextBirthday.getTime() - today.getTime()) / msPerDay);
  const 次の誕生日 = `${nextBirthday.getFullYear()}年${nextBirthday.getMonth() + 1}月${nextBirthday.getDate()}日`;

  return { 満年齢: age, 数え年, 干支, 星座, 生まれてから日数, 次の誕生日まで, 次の誕生日 };
}

export default function AgeCalculator() {
  const today = new Date();
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [result, setResult] = useState<AgeResult | null>(null);
  const [error, setError] = useState("");

  const currentYear = today.getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = year && month ? new Date(Number(year), Number(month), 0).getDate() : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleCalculate = useCallback(() => {
    setError("");
    if (!year || !month || !day) {
      setError("生年月日をすべて選択してください。");
      return;
    }
    const birthDate = new Date(Number(year), Number(month) - 1, Number(day));
    if (birthDate > today) {
      setError("生年月日は今日以前の日付を選択してください。");
      return;
    }
    setResult(calculateAge(birthDate, today));
  }, [year, month, day]);

  const handleReset = () => {
    setYear("");
    setMonth("");
    setDay("");
    setResult(null);
    setError("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Input Section */}
      <div className="p-6 md:p-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">生年月日を入力</h2>

        <div className="flex flex-wrap gap-3 mb-6">
          {/* Year */}
          <div className="flex-1 min-w-[110px]">
            <label className="block text-xs text-gray-500 mb-1 font-medium">年</label>
            <select
              value={year}
              onChange={(e) => { setYear(e.target.value); setDay(""); setResult(null); }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
            >
              <option value="">年を選択</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div className="flex-1 min-w-[90px]">
            <label className="block text-xs text-gray-500 mb-1 font-medium">月</label>
            <select
              value={month}
              onChange={(e) => { setMonth(e.target.value); setDay(""); setResult(null); }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
            >
              <option value="">月を選択</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}月</option>
              ))}
            </select>
          </div>

          {/* Day */}
          <div className="flex-1 min-w-[90px]">
            <label className="block text-xs text-gray-500 mb-1 font-medium">日</label>
            <select
              value={day}
              onChange={(e) => { setDay(e.target.value); setResult(null); }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
            >
              <option value="">日を選択</option>
              {days.map((d) => (
                <option key={d} value={d}>{d}日</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleCalculate}
            className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 rounded-xl transition text-sm"
          >
            計算する
          </button>
          {result && (
            <button
              onClick={handleReset}
              className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-3 rounded-xl transition text-sm"
            >
              リセット
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="border-t border-gray-100 bg-gray-50 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">計算結果</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ResultCard
              label="満年齢"
              value={`${result.満年齢}歳`}
              sub="現在の年齢"
              color="blue"
            />
            <ResultCard
              label="数え年"
              value={`${result.数え年}歳`}
              sub="伝統的な年齢"
              color="indigo"
            />
            <ResultCard
              label="干支（えと）"
              value={result.干支}
              sub={`${year}年生まれ`}
              color="green"
            />
            <ResultCard
              label="星座"
              value={result.星座}
              sub={`${month}月${day}日生まれ`}
              color="purple"
            />
            <ResultCard
              label="生まれてから"
              value={`${result.生まれてから日数.toLocaleString()}日`}
              sub="経過日数"
              color="orange"
            />
            <ResultCard
              label="次の誕生日まで"
              value={`あと${result.次の誕生日まで}日`}
              sub={result.次の誕生日}
              color="pink"
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface ResultCardProps {
  label: string;
  value: string;
  sub: string;
  color: "blue" | "indigo" | "green" | "purple" | "orange" | "pink";
}

const colorMap: Record<ResultCardProps["color"], { bg: string; text: string; label: string }> = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-700",   label: "text-blue-500" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-700", label: "text-indigo-500" },
  green:  { bg: "bg-green-50",  text: "text-green-700",  label: "text-green-500" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", label: "text-purple-500" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", label: "text-orange-500" },
  pink:   { bg: "bg-pink-50",   text: "text-pink-700",   label: "text-pink-500" },
};

function ResultCard({ label, value, sub, color }: ResultCardProps) {
  const c = colorMap[color];
  return (
    <div className={`${c.bg} rounded-xl p-4`}>
      <p className={`text-xs font-medium ${c.label} mb-1`}>{label}</p>
      <p className={`text-xl font-bold ${c.text} leading-tight`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
