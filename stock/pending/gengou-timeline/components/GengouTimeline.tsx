"use client";

import { useState } from "react";

const CURRENT_YEAR = new Date().getFullYear();

type Era = {
  name: string;
  kanji: string;
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number | null;
  endMonth: number | null;
  endDay: number | null;
  color: string;
  bgLight: string;
  border: string;
  text: string;
  badge: string;
};

const ERAS: Era[] = [
  {
    name: "明治",
    kanji: "明治",
    startYear: 1868, startMonth: 1, startDay: 25,
    endYear: 1912, endMonth: 7, endDay: 30,
    color: "bg-red-500",
    bgLight: "bg-red-50",
    border: "border-red-300",
    text: "text-red-700",
    badge: "bg-red-100 text-red-800",
  },
  {
    name: "大正",
    kanji: "大正",
    startYear: 1912, startMonth: 7, startDay: 30,
    endYear: 1926, endMonth: 12, endDay: 25,
    color: "bg-orange-500",
    bgLight: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-700",
    badge: "bg-orange-100 text-orange-800",
  },
  {
    name: "昭和",
    kanji: "昭和",
    startYear: 1926, startMonth: 12, startDay: 25,
    endYear: 1989, endMonth: 1, endDay: 8,
    color: "bg-green-500",
    bgLight: "bg-green-50",
    border: "border-green-300",
    text: "text-green-700",
    badge: "bg-green-100 text-green-800",
  },
  {
    name: "平成",
    kanji: "平成",
    startYear: 1989, startMonth: 1, startDay: 8,
    endYear: 2019, endMonth: 4, endDay: 30,
    color: "bg-blue-500",
    bgLight: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-800",
  },
  {
    name: "令和",
    kanji: "令和",
    startYear: 2019, startMonth: 5, startDay: 1,
    endYear: null, endMonth: null, endDay: null,
    color: "bg-purple-500",
    bgLight: "bg-purple-50",
    border: "border-purple-300",
    text: "text-purple-700",
    badge: "bg-purple-100 text-purple-800",
  },
];

const TIMELINE_START = 1868;
const TIMELINE_END = CURRENT_YEAR;
const TOTAL_YEARS = TIMELINE_END - TIMELINE_START;

function dateToDays(year: number, month: number, day: number): number {
  return year * 365.25 + (month - 1) * 30.44 + day;
}

function eraDuration(era: Era): number {
  const start = dateToDays(era.startYear, era.startMonth, era.startDay);
  const ey = era.endYear ?? CURRENT_YEAR;
  const em = era.endMonth ?? 12;
  const ed = era.endDay ?? 31;
  const end = dateToDays(ey, em, ed);
  return Math.round(end - start);
}

function getEraForYear(year: number): { era: Era; eraYear: number } | null {
  for (const era of ERAS) {
    const endY = era.endYear ?? CURRENT_YEAR + 1;
    if (year >= era.startYear && year < endY) {
      return { era, eraYear: year - era.startYear + 1 };
    }
  }
  return null;
}

function eraYearLabel(era: Era, year: number): string {
  const eraYear = year - era.startYear + 1;
  return `${era.name}${eraYear === 1 ? "元" : eraYear}年`;
}

export default function GengouTimeline() {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [inputYear, setInputYear] = useState("");
  const [convertResult, setConvertResult] = useState<string | null>(null);
  const [selectedEra, setSelectedEra] = useState<Era | null>(null);

  const handleConvert = () => {
    const y = parseInt(inputYear, 10);
    if (isNaN(y)) {
      setConvertResult("数字を入力してください");
      return;
    }
    if (y < TIMELINE_START || y > TIMELINE_END) {
      setConvertResult(`${TIMELINE_START}〜${TIMELINE_END}の範囲で入力してください`);
      return;
    }
    const result = getEraForYear(y);
    if (!result) {
      setConvertResult("該当する元号が見つかりません");
      return;
    }
    setConvertResult(`西暦${y}年 = ${eraYearLabel(result.era, y)}`);
  };

  // Calculate bar widths proportional to year span (simplified to year boundaries for display)
  const eraBars = ERAS.map((era) => {
    const start = era.startYear - TIMELINE_START;
    const end = (era.endYear ?? CURRENT_YEAR) - TIMELINE_START;
    const leftPct = (start / TOTAL_YEARS) * 100;
    const widthPct = ((end - start) / TOTAL_YEARS) * 100;
    return { era, leftPct, widthPct };
  });

  // Year ticks every 10 years
  const ticks: number[] = [];
  for (let y = Math.ceil(TIMELINE_START / 10) * 10; y <= TIMELINE_END; y += 10) {
    ticks.push(y);
  }

  const hoveredEraResult = hoveredYear !== null ? getEraForYear(hoveredYear) : null;

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-800 mb-4">元号タイムライン（{TIMELINE_START}〜{TIMELINE_END}年）</h2>

        {/* Bar chart */}
        <div className="relative h-16 mb-2">
          {eraBars.map(({ era, leftPct, widthPct }) => (
            <div
              key={era.name}
              className={`absolute top-0 h-full ${era.color} cursor-pointer transition-opacity hover:opacity-90 flex items-center justify-center overflow-hidden rounded-sm`}
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              onClick={() => setSelectedEra(selectedEra?.name === era.name ? null : era)}
              title={era.name}
            >
              <span className="text-white font-bold text-sm select-none drop-shadow px-1 truncate">
                {era.kanji}
              </span>
            </div>
          ))}
        </div>

        {/* Year axis */}
        <div className="relative h-6 mb-4">
          {ticks.map((y) => {
            const leftPct = ((y - TIMELINE_START) / TOTAL_YEARS) * 100;
            return (
              <div
                key={y}
                className="absolute text-xs text-gray-400 -translate-x-1/2"
                style={{ left: `${leftPct}%` }}
              >
                {y}
              </div>
            );
          })}
          {/* Current year marker */}
          <div
            className="absolute top-0 h-full flex flex-col items-center"
            style={{ left: `${((CURRENT_YEAR - TIMELINE_START) / TOTAL_YEARS) * 100}%` }}
          >
            <div className="w-0.5 h-3 bg-yellow-500" />
            <span className="text-xs text-yellow-600 font-bold -translate-x-1/2 whitespace-nowrap">
              {CURRENT_YEAR}
            </span>
          </div>
        </div>

        {/* Interactive year scrubber */}
        <div className="mt-2">
          <label className="text-sm text-gray-500 mb-1 block">
            年をドラッグして元号を確認:
          </label>
          <input
            type="range"
            min={TIMELINE_START}
            max={TIMELINE_END}
            value={hoveredYear ?? CURRENT_YEAR}
            onChange={(e) => setHoveredYear(parseInt(e.target.value, 10))}
            className="w-full accent-purple-600"
          />
          {hoveredYear !== null && hoveredEraResult && (
            <div className={`mt-2 px-3 py-2 rounded-lg text-sm font-medium ${hoveredEraResult.era.badge} border ${hoveredEraResult.era.border}`}>
              西暦 {hoveredYear}年 = {eraYearLabel(hoveredEraResult.era, hoveredYear)}
            </div>
          )}
        </div>
      </div>

      {/* Year converter */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-800 mb-3">西暦 → 元号 変換</h2>
        <div className="flex gap-2">
          <input
            type="number"
            min={TIMELINE_START}
            max={TIMELINE_END}
            placeholder={`例: 1995`}
            value={inputYear}
            onChange={(e) => setInputYear(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConvert()}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <span className="flex items-center text-gray-600 text-sm">年</span>
          <button
            onClick={handleConvert}
            className="bg-purple-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
          >
            変換
          </button>
        </div>
        {convertResult && (
          <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-purple-800 text-sm font-medium">
            {convertResult}
          </div>
        )}
      </div>

      {/* Era stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ERAS.map((era) => {
          const days = eraDuration(era);
          const endLabel = era.endYear
            ? `${era.endYear}年${era.endMonth}月${era.endDay}日`
            : "現在";
          const isActive = !era.endYear;
          const isSelected = selectedEra?.name === era.name;

          return (
            <div
              key={era.name}
              onClick={() => setSelectedEra(isSelected ? null : era)}
              className={`border rounded-xl p-4 cursor-pointer transition-all shadow-sm ${
                isSelected
                  ? `${era.bgLight} ${era.border} ring-2 ring-offset-1 ${era.border.replace("border-", "ring-")}`
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${era.color}`} />
                  <span className={`font-bold text-lg ${era.text}`}>{era.name}</span>
                </div>
                {isActive && (
                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-bold">
                    現在
                  </span>
                )}
              </div>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">開始日</dt>
                  <dd className="text-gray-800 font-medium">
                    {era.startYear}年{era.startMonth}月{era.startDay}日
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">終了日</dt>
                  <dd className="text-gray-800 font-medium">{endLabel}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">在位日数</dt>
                  <dd className={`font-bold ${era.text}`}>
                    {days.toLocaleString()}日
                    {isActive && <span className="text-gray-400 font-normal">（以上）</span>}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">期間</dt>
                  <dd className="text-gray-800 font-medium">
                    {(era.endYear ?? CURRENT_YEAR) - era.startYear}年間
                    {isActive && "+"}
                  </dd>
                </div>
              </dl>
            
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この元号タイムラインツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">明治以降の元号を視覚的なタイムラインで表示。入力するだけで即座に結果を表示します。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">利用料金はかかりますか？</summary>
      <p className="mt-2 text-sm text-gray-600">完全無料でご利用いただけます。会員登録も不要です。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">計算結果は正確ですか？</summary>
      <p className="mt-2 text-sm text-gray-600">一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この元号タイムラインツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "明治以降の元号を視覚的なタイムラインで表示。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
          );
        })}
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 bg-gray-100 border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 text-sm">
        広告
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "元号タイムライン",
  "description": "明治以降の元号を視覚的なタイムラインで表示",
  "url": "https://tools.loresync.dev/gengou-timeline",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "ja"
}`
        }}
      />
      </div>
  );
}
