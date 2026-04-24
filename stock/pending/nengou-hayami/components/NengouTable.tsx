"use client";

import { useState, useMemo } from "react";

const CURRENT_YEAR = 2026;

type Era = {
  name: string;
  start: number;
  end: number;
  labelColor: string;
  bgColor: string;
  badgeColor: string;
};

const ERAS: Era[] = [
  { name: "令和", start: 2019, end: CURRENT_YEAR, labelColor: "text-purple-700", bgColor: "bg-purple-50", badgeColor: "bg-purple-100 text-purple-800" },
  { name: "平成", start: 1989, end: 2019, labelColor: "text-blue-700", bgColor: "bg-blue-50", badgeColor: "bg-blue-100 text-blue-800" },
  { name: "昭和", start: 1926, end: 1989, labelColor: "text-green-700", bgColor: "bg-green-50", badgeColor: "bg-green-100 text-green-800" },
  { name: "大正", start: 1912, end: 1926, labelColor: "text-orange-700", bgColor: "bg-orange-50", badgeColor: "bg-orange-100 text-orange-800" },
  { name: "明治", start: 1868, end: 1912, labelColor: "text-red-700", bgColor: "bg-red-50", badgeColor: "bg-red-100 text-red-800" },
];

function getEraForYear(year: number): { era: Era; eraYear: number } | null {
  for (const era of ERAS) {
    if (year >= era.start && year <= era.end) {
      return { era, eraYear: year - era.start + 1 };
    }
  }
  return null;
}

function formatEraYear(year: number): string {
  // 各元号の初年度は「元年」と表記
  if (ERAS.some((e) => e.start === year)) return "元年";
  return `${getEraForYear(year)?.eraYear ?? ""}年`;
}

function getEraLabel(year: number): string {
  const result = getEraForYear(year);
  if (!result) return "";
  const { era, eraYear } = result;
  return `${era.name}${eraYear === 1 ? "元" : eraYear}年`;
}

type Row = {
  westernYear: number;
  eraLabel: string;
  era: Era | null;
  age: number;
};

export default function NengouTable() {
  const [searchWestern, setSearchWestern] = useState("");
  const [searchEraName, setSearchEraName] = useState("令和");
  const [searchEraYear, setSearchEraYear] = useState("");
  const [westernResult, setWesternResult] = useState<string | null>(null);
  const [eraResult, setEraResult] = useState<string | null>(null);
  const [filterEra, setFilterEra] = useState<string>("all");

  const rows = useMemo<Row[]>(() => {
    const data: Row[] = [];
    for (let year = CURRENT_YEAR; year >= 1868; year--) {
      const result = getEraForYear(year);
      data.push({
        westernYear: year,
        eraLabel: getEraLabel(year),
        era: result?.era ?? null,
        age: CURRENT_YEAR - year,
      });
    }
    return data;
  }, []);

  const filteredRows = useMemo(() => {
    if (filterEra === "all") return rows;
    return rows.filter((r) => r.era?.name === filterEra);
  }, [rows, filterEra]);

  const handleWesternSearch = () => {
    const year = parseInt(searchWestern, 10);
    if (isNaN(year) || year < 1868 || year > CURRENT_YEAR) {
      setWesternResult("1868年〜" + CURRENT_YEAR + "年の範囲で入力してください");
      return;
    }
    setWesternResult(getEraLabel(year));
  };

  const handleEraSearch = () => {
    const y = parseInt(searchEraYear, 10);
    if (isNaN(y) || y < 1) {
      setEraResult("正しい年数を入力してください");
      return;
    }
    const era = ERAS.find((e) => e.name === searchEraName);
    if (!era) {
      setEraResult("年号を選択してください");
      return;
    }
    const western = era.start + y - 1;
    if (western > era.end || western > CURRENT_YEAR) {
      setEraResult(`${searchEraName}は${era.end - era.start + 1}年まで`);
      return;
    }
    setEraResult(`西暦 ${western}年（${CURRENT_YEAR - western}歳）`);
  };

  return (
    <div className="space-y-6">
      {/* 検索エリア */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 西暦 → 年号 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>📅</span>
            西暦 → 年号
          </h2>
          <div className="flex gap-2">
            <input
              type="number"
              min="1868"
              max={CURRENT_YEAR}
              placeholder="例: 1995"
              value={searchWestern}
              onChange={(e) => setSearchWestern(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleWesternSearch()}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <span className="flex items-center text-gray-600 text-sm">年</span>
            <button
              onClick={handleWesternSearch}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              変換
            </button>
          </div>
          {westernResult && (
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-blue-800 text-sm font-medium">
              {westernResult}
            </div>
          )}
        </div>

        {/* 年号 → 西暦 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>🔄</span>
            年号 → 西暦
          </h2>
          <div className="flex gap-2">
            <select
              value={searchEraName}
              onChange={(e) => setSearchEraName(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              {ERAS.map((era) => (
                <option key={era.name} value={era.name}>
                  {era.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              placeholder="年数"
              value={searchEraYear}
              onChange={(e) => setSearchEraYear(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEraSearch()}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            <span className="flex items-center text-gray-600 text-sm">年</span>
            <button
              onClick={handleEraSearch}
              className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
            >
              変換
            </button>
          </div>
          {eraResult && (
            <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-800 text-sm font-medium">
              {eraResult}
            </div>
          )}
        </div>
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-500 font-medium">絞り込み:</span>
        <button
          onClick={() => setFilterEra("all")}
          className={`text-sm px-3 py-1 rounded-full transition-colors cursor-pointer ${
            filterEra === "all"
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          全て
        </button>
        {ERAS.map((era) => (
          <button
            key={era.name}
            onClick={() => setFilterEra(era.name)}
            className={`text-sm px-3 py-1 rounded-full transition-colors cursor-pointer ${
              filterEra === era.name
                ? era.badgeColor + " font-bold"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {era.name}
          </button>
        ))}
      </div>

      {/* テーブル */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-2 text-left font-semibold">西暦</th>
                <th className="px-4 py-2 text-left font-semibold">年号</th>
                <th className="px-4 py-2 text-center font-semibold">年齢</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => {
                const isCurrentYear = row.westernYear === CURRENT_YEAR;
                // 年号の区切り行を挿入する（前の行と年号が変わった時）
                const prevEra = idx > 0 ? filteredRows[idx - 1].era?.name : null;
                const showDivider = filterEra === "all" && row.era?.name !== prevEra;

                return (
                  <>
                    {showDivider && row.era && (
                      <tr key={`divider-${row.era.name}`} className={row.era.bgColor}>
                        <td
                          colSpan={3}
                          className={`px-4 py-1.5 font-bold text-xs tracking-wider ${row.era.labelColor}`}
                        >
                          {row.era.name}（{row.era.start}年〜{row.era.end === CURRENT_YEAR ? "現在" : row.era.end + "年"}）
                        </td>
                      </tr>
                    )}
                    <tr
                      key={row.westernYear}
                      className={`border-t border-gray-100 ${
                        isCurrentYear
                          ? "bg-yellow-50 font-bold"
                          : row.era
                          ? "hover:" + row.era.bgColor
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-2 text-gray-800">
                        {row.westernYear}年
                        {isCurrentYear && (
                          <span className="ml-1 text-xs bg-yellow-300 text-yellow-900 px-1.5 py-0.5 rounded font-bold">
                            今年
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-2 font-medium ${row.era?.labelColor ?? "text-gray-600"}`}>
                        {row.eraLabel}
                      </td>
                      <td className="px-4 py-2 text-center text-gray-700">
                        {row.age === 0 ? (
                          <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold">
                            0歳
                          </span>
                        ) : (
                          `${row.age}歳`
                        )}
                      </td>
                    </tr>
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この年号早見表ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">西暦と年号(令和/平成/昭和/大正/明治)の一覧表。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この年号早見表ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "西暦と年号(令和/平成/昭和/大正/明治)の一覧表。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
