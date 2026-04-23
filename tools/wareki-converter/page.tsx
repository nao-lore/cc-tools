"use client";

import { useState, useEffect, useMemo } from "react";

// ─── データ定義 ───────────────────────────────────────────────

interface EraDefinition {
  name: string;
  reading: string;
  startDate: string;
  endDate: string | null;
  startYear: number;
  endYear: number | null;
  emperor: string;
  origin: string;
  color: string;
  bgColor: string;
  borderColor: string;
  headerBg: string;
}

const ERAS: EraDefinition[] = [
  {
    name: "令和",
    reading: "れいわ",
    startDate: "2019-05-01",
    endDate: null,
    startYear: 2019,
    endYear: null,
    emperor: "第126代 天皇徳仁（令和天皇）",
    origin: "万葉集「梅花の歌」の序文「初春の令月にして、気淑く風和ぎ」より",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    headerBg: "bg-blue-600",
  },
  {
    name: "平成",
    reading: "へいせい",
    startDate: "1989-01-08",
    endDate: "2019-04-30",
    startYear: 1989,
    endYear: 2019,
    emperor: "第125代 上皇明仁（平成天皇）",
    origin: "「内平外成」「地平天成」より。内外・天地に平和が達成されるという意味",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    headerBg: "bg-green-600",
  },
  {
    name: "昭和",
    reading: "しょうわ",
    startDate: "1926-12-25",
    endDate: "1989-01-07",
    startYear: 1926,
    endYear: 1989,
    emperor: "第124代 昭和天皇（裕仁）",
    origin: "「百姓昭明、協和万邦」より。万民が明るく栄え、万国が協和するという意味",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    headerBg: "bg-orange-600",
  },
  {
    name: "大正",
    reading: "たいしょう",
    startDate: "1912-07-30",
    endDate: "1926-12-24",
    startYear: 1912,
    endYear: 1926,
    emperor: "第123代 大正天皇（嘉仁）",
    origin: "「大いに亨り正しきを以て天の道なり」より",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    headerBg: "bg-purple-600",
  },
  {
    name: "明治",
    reading: "めいじ",
    startDate: "1868-01-25",
    endDate: "1912-07-29",
    startYear: 1868,
    endYear: 1912,
    emperor: "第122代 明治天皇（睦仁）",
    origin: "「聖人南面して天下を聴き、明に嚮いて治む」より",
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    headerBg: "bg-gray-600",
  },
];

const ZODIAC_ANIMALS = [
  "子（ね）", "丑（うし）", "寅（とら）", "卯（う）",
  "辰（たつ）", "巳（み）", "午（うま）", "未（ひつじ）",
  "申（さる）", "酉（とり）", "戌（いぬ）", "亥（い）",
];
const ZODIAC_EMOJI = ["🐭","🐮","🐯","🐰","🐲","🐍","🐴","🐑","🐵","🐔","🐶","🐗"];

// ─── ユーティリティ関数 ──────────────────────────────────────

function getZodiac(westernYear: number): { label: string; emoji: string } {
  const index = ((westernYear - 4) % 12 + 12) % 12;
  return { label: ZODIAC_ANIMALS[index], emoji: ZODIAC_EMOJI[index] };
}

function getCurrentYear(): number {
  return new Date().getFullYear();
}

function getEraEndYear(era: EraDefinition): number {
  if (era.endYear !== null) return era.endYear;
  return getCurrentYear();
}

function warekiToWestern(eraName: string, eraYear: number): number | null {
  const era = ERAS.find((e) => e.name === eraName);
  if (!era) return null;
  const western = era.startYear + eraYear - 1;
  const endYear = getEraEndYear(era);
  if (western < era.startYear || western > endYear) return null;
  return western;
}

function westernToWareki(westernYear: number): { eraName: string; eraYear: number; era: EraDefinition }[] {
  const results: { eraName: string; eraYear: number; era: EraDefinition }[] = [];
  for (const era of ERAS) {
    const endYear = getEraEndYear(era);
    if (westernYear >= era.startYear && westernYear <= endYear) {
      results.push({ eraName: era.name, eraYear: westernYear - era.startYear + 1, era });
    }
  }
  return results;
}

function getEraDuration(era: EraDefinition): number {
  const end = era.endYear ?? getCurrentYear();
  return end - era.startYear;
}

function formatEraYear(eraYear: number): string {
  return eraYear === 1 ? "元" : String(eraYear);
}

function getTodayInfo(): { western: string; wareki: string; zodiac: { label: string; emoji: string } } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const results = westernToWareki(year);
  const primary = results[0];
  const western = `${year}年${month}月${day}日`;
  const wareki = primary
    ? `${primary.eraName}${formatEraYear(primary.eraYear)}年${month}月${day}日`
    : western;
  return { western, wareki, zodiac: getZodiac(year) };
}

// ─── 今日の日付バナー ────────────────────────────────────────

function TodayBanner() {
  const [info, setInfo] = useState<ReturnType<typeof getTodayInfo> | null>(null);
  useEffect(() => { setInfo(getTodayInfo()); }, []);
  if (!info) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl p-5 shadow-lg">
      <p className="text-xs font-medium opacity-80 mb-1 tracking-wide uppercase">今日の日付</p>
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight">{info.wareki}</span>
        <span className="text-base sm:text-lg opacity-85">{info.western}</span>
      </div>
      <p className="text-xs opacity-75 mt-2">
        {info.zodiac.emoji} 今年の干支：{info.zodiac.label}
      </p>
    </div>
  );
}

// ─── 変換パネル ──────────────────────────────────────────────

function ConverterPanel() {
  const currentYear = getCurrentYear();

  // 和暦 → 西暦
  const [selectedEra, setSelectedEra] = useState("令和");
  const [eraYear, setEraYear] = useState("");
  const [warekiResult, setWarekiResult] = useState<{
    western: number;
    zodiac: { label: string; emoji: string };
    age: number;
    resume: string;
  } | null>(null);
  const [warekiError, setWarekiError] = useState("");

  // 西暦 → 和暦
  const [westernYear, setWesternYear] = useState("");
  const [westernResult, setWesternResult] = useState<{
    lines: string[];
    zodiac: { label: string; emoji: string };
    age: number;
  } | null>(null);
  const [westernError, setWesternError] = useState("");

  function handleWarekiToWestern() {
    const y = parseInt(eraYear, 10);
    if (isNaN(y) || y < 1) {
      setWarekiError("正しい年数を入力してください");
      setWarekiResult(null);
      return;
    }
    const western = warekiToWestern(selectedEra, y);
    if (western === null) {
      setWarekiError("その元号・年数の組み合わせは存在しません");
      setWarekiResult(null);
      return;
    }
    setWarekiError("");
    setWarekiResult({
      western,
      zodiac: getZodiac(western),
      age: currentYear - western,
      resume: `${selectedEra}${formatEraYear(y)}年`,
    });
  }

  function handleWesternToWareki() {
    const y = parseInt(westernYear, 10);
    if (isNaN(y) || y < 1868 || y > currentYear) {
      setWesternError(`1868年〜${currentYear}年の範囲で入力してください`);
      setWesternResult(null);
      return;
    }
    const results = westernToWareki(y);
    if (results.length === 0) {
      setWesternError("該当する和暦が見つかりません");
      setWesternResult(null);
      return;
    }
    setWesternError("");
    setWesternResult({
      lines: results.map((r) => `${r.eraName}${formatEraYear(r.eraYear)}年`),
      zodiac: getZodiac(y),
      age: currentYear - y,
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
      {/* 和暦 → 西暦 */}
      <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-blue-600 px-5 py-3">
          <h2 className="text-white font-bold text-base">和暦 → 西暦 変換</h2>
          <p className="text-blue-100 text-xs mt-0.5">元号と年数を入力してください</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex gap-2 items-center">
            <select
              value={selectedEra}
              onChange={(e) => { setSelectedEra(e.target.value); setWarekiResult(null); setWarekiError(""); }}
              className="flex-shrink-0 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ERAS.map((era) => (
                <option key={era.name} value={era.name}>{era.name}（{era.reading}）</option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              placeholder="年数"
              value={eraYear}
              onChange={(e) => { setEraYear(e.target.value); setWarekiResult(null); setWarekiError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleWarekiToWestern()}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-600 text-sm font-medium">年</span>
          </div>
          <button
            onClick={handleWarekiToWestern}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm cursor-pointer"
          >
            変換する
          </button>
          {warekiError && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{warekiError}</p>
          )}
          {warekiResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-bold text-blue-800">西暦 {warekiResult.western}年</span>
                <span className="text-blue-600 text-sm">{warekiResult.zodiac.emoji} {warekiResult.zodiac.label}</span>
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                <p>今年で <strong>{warekiResult.age === 0 ? "0（今年生まれ）" : `${warekiResult.age}歳`}</strong></p>
                <p>履歴書表記：<strong>{warekiResult.resume}</strong></p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 西暦 → 和暦 */}
      <div className="bg-white border border-green-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-green-600 px-5 py-3">
          <h2 className="text-white font-bold text-base">西暦 → 和暦 変換</h2>
          <p className="text-green-100 text-xs mt-0.5">西暦年を入力してください（1868年〜）</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="1868"
              max={currentYear}
              placeholder={`例：${currentYear}`}
              value={westernYear}
              onChange={(e) => { setWesternYear(e.target.value); setWesternResult(null); setWesternError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleWesternToWareki()}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span className="text-gray-600 text-sm font-medium">年</span>
          </div>
          <button
            onClick={handleWesternToWareki}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm cursor-pointer"
          >
            変換する
          </button>
          {westernError && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{westernError}</p>
          )}
          {westernResult && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-bold text-green-800">{westernResult.lines.join(" / ")}</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p>{westernResult.zodiac.emoji} 干支：<strong>{westernResult.zodiac.label}</strong></p>
                <p>今年で <strong>{westernResult.age === 0 ? "0（今年生まれ）" : `${westernResult.age}歳`}</strong></p>
              </div>
              {westernResult.lines.length > 1 && (
                <p className="text-xs text-green-600 bg-green-100 rounded-lg px-2 py-1">
                  ※ 元号の切り替わり年のため、両方の表記が有効です
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 元号一覧表 ──────────────────────────────────────────────

function EraTable() {
  const currentYear = getCurrentYear();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">元号一覧表</h2>
        <p className="text-sm text-gray-500 mt-0.5">明治〜令和の各元号の期間・天皇・由来</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left">元号</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">読み</th>
              <th className="px-4 py-3 text-left">期間</th>
              <th className="px-4 py-3 text-center">年数</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">天皇</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ERAS.map((era) => {
              const endYear = era.endYear ?? currentYear;
              const duration = getEraDuration(era);
              return (
                <tr key={era.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 font-bold text-base ${era.color}`}>
                      {era.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{era.reading}</td>
                  <td className="px-4 py-3 text-gray-700">
                    <span>{era.startYear}年</span>
                    <span className="text-gray-400 mx-1">〜</span>
                    <span>{era.endYear === null ? "現在" : `${endYear}年`}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${era.bgColor} ${era.color}`}>
                      {era.endYear === null ? `${duration}年+` : `${duration}年`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell text-xs">{era.emperor}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-4 border-t border-gray-100 space-y-3">
        {ERAS.map((era) => (
          <div key={era.name} className={`rounded-xl p-4 ${era.bgColor} border ${era.borderColor}`}>
            <p className={`text-xs font-bold mb-1 ${era.color}`}>{era.name}（{era.reading}）の由来</p>
            <p className="text-xs text-gray-600 leading-relaxed">{era.origin}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 年齢早見表 ──────────────────────────────────────────────

function AgeTable() {
  const currentYear = getCurrentYear();
  const [filter, setFilter] = useState<"全て" | "令和" | "平成" | "昭和">("全て");

  const rows = useMemo(() => {
    const data: {
      westernYear: number;
      warekiLabel: string;
      age: number;
      zodiac: { label: string; emoji: string };
      color: string;
      bgColor: string;
      eraName: string;
    }[] = [];

    for (let year = currentYear; year >= 1926; year--) {
      const results = westernToWareki(year);
      const primary = results[0];
      if (!primary) continue;
      const warekiLabel = `${primary.eraName}${formatEraYear(primary.eraYear)}年`;
      data.push({
        westernYear: year,
        warekiLabel,
        age: currentYear - year,
        zodiac: getZodiac(year),
        color: primary.era.color,
        bgColor: primary.era.bgColor,
        eraName: primary.eraName,
      });
    }
    return data;
  }, [currentYear]);

  const filtered = filter === "全て" ? rows : rows.filter((r) => r.eraName === filter);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">年齢早見表 <span className="text-gray-400 font-normal text-sm">（{currentYear}年版）</span></h2>
          <p className="text-xs text-gray-500 mt-0.5">生まれ年から現在の年齢・干支・和暦をまとめて確認</p>
        </div>
        <div className="flex gap-2 sm:ml-auto flex-wrap">
          {(["全て", "令和", "平成", "昭和"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                filter === f
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="text-gray-600 text-xs">
              <th className="px-4 py-2.5 text-left font-semibold">西暦</th>
              <th className="px-4 py-2.5 text-left font-semibold">和暦</th>
              <th className="px-4 py-2.5 text-center font-semibold">年齢</th>
              <th className="px-4 py-2.5 text-left font-semibold">干支</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((row) => (
              <tr
                key={row.westernYear}
                className={`transition-colors ${
                  row.westernYear === currentYear
                    ? "bg-amber-50 font-semibold"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="px-4 py-2 text-gray-800 tabular-nums">{row.westernYear}年</td>
                <td className={`px-4 py-2 font-medium ${row.color}`}>{row.warekiLabel}</td>
                <td className="px-4 py-2 text-center tabular-nums">
                  {row.age === 0 ? (
                    <span className="inline-block bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold">
                      今年
                    </span>
                  ) : (
                    <span className="text-gray-800">{row.age}歳</span>
                  )}
                </td>
                <td className="px-4 py-2 text-gray-600 text-xs">
                  <span>{row.zodiac.emoji}</span>
                  <span className="ml-1 hidden sm:inline">{row.zodiac.label}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SEOコンテンツ ───────────────────────────────────────────

function SeoContent() {
  return (
    <section className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-800 mb-3">和暦・元号とは</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          和暦とは日本独自の紀年法で、天皇の即位や国の重要な節目に合わせて元号が定められます。現在は「令和」元号が使われており、2019年5月1日の天皇徳仁の即位に伴い始まりました。日本では公的文書・履歴書・確定申告・年金手続きなど、多くの場面で和暦が使われており、西暦との変換は日常的に必要とされています。
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-800 mb-3">和暦変換が必要な主な場面</h2>
        <ul className="text-sm text-gray-600 space-y-1.5">
          <li className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">•</span>履歴書・職務経歴書の学歴・職歴欄</li>
          <li className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">•</span>確定申告・年末調整などの税務書類</li>
          <li className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">•</span>年金・社会保険の各種手続き</li>
          <li className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">•</span>戸籍謄本・住民票など行政書類</li>
          <li className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">•</span>契約書・公正証書への記載</li>
          <li className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">•</span>年齢確認・生年月日の計算</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-3">履歴書での和暦の書き方</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            履歴書の学歴・職歴欄では和暦を使うのが一般的です。元号の最初の年は「元年」と表記します（例：令和元年）。履歴書内で和暦か西暦かを統一することが重要で、混在させないようにします。本ツールの変換結果をそのまま参照いただけます。
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-3">干支（十二支）について</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            干支は子・丑・寅・卯・辰・巳・午・未・申・酉・戌・亥の12種類で年を表す暦法です。中国から伝わり、年賀状・占い・年男・年女など日本文化に深く根付いています。12年ごとに同じ干支が巡ってきます。
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-800 mb-3">このツールの使い方</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-semibold text-gray-700 mb-1">和暦 → 西暦</p>
            <p>元号をプルダウンから選び、年数を入力して「変換する」ボタンを押すだけ。西暦・干支・今年の年齢・履歴書表記がまとめて表示されます。</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">西暦 → 和暦</p>
            <p>西暦年を入力すると対応する和暦が表示されます。昭和64年/平成元年のような切り替わり年は両方の表記が表示されます。</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── メインページ ────────────────────────────────────────────

export default function WarekiConverterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗓️</span>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                和暦西暦変換ツール
              </h1>
              <p className="text-xs text-gray-500">
                令和・平成・昭和・大正・明治 対応 | 年齢早見表・干支・元号一覧付き
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 今日の日付バナー */}
        <TodayBanner />

        {/* 変換ツール */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">変換ツール</h2>
          <ConverterPanel />
        </section>

        {/* 元号一覧表 */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">元号一覧</h2>
          <EraTable />
        </section>

        {/* 広告スペース */}
        <div className="bg-gray-100 border border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-sm">
          広告スペース
        </div>

        {/* 年齢早見表 */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">年齢早見表</h2>
          <AgeTable />
        </section>

        {/* SEOコンテンツ */}
        <SeoContent />
      </main>

      <footer className="border-t border-gray-200 mt-8 py-8 text-center bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            和暦西暦変換ツール — 登録不要・完全無料
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">関連ツール</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/eigyoubi" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1 bg-blue-50 rounded-full transition-colors">営業日計算</a>
              <a href="/zenkaku-hankaku" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1 bg-blue-50 rounded-full transition-colors">全角半角変換</a>
              <a href="/furigana" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1 bg-blue-50 rounded-full transition-colors">ふりがな変換</a>
              <a href="/tax-calculator" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1 bg-blue-50 rounded-full transition-colors">税額計算</a>
              <a href="/timezone-converter" className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1 bg-blue-50 rounded-full transition-colors">タイムゾーン変換</a>
            </div>
          </div>
          <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">53以上の無料ツール一覧 →</a>
        </div>
      </footer>
    </div>
  );
}
