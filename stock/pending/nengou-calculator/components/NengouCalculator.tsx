"use client";

import { useState, useCallback, type KeyboardEvent } from "react";

type Mode = "seireki-to-nengou" | "nengou-to-seireki";

type Era = {
  name: string;
  start: number;
  end: number | null; // null = ongoing
};

const ERAS: Era[] = [
  { name: "令和", start: 2019, end: null },
  { name: "平成", start: 1989, end: 2019 },
  { name: "昭和", start: 1926, end: 1989 },
  { name: "大正", start: 1912, end: 1926 },
  { name: "明治", start: 1868, end: 1912 },
];

const CURRENT_YEAR = new Date().getFullYear();

const KANJI_DIGITS: string[] = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

function toKanjiNumber(n: number): string {
  if (n === 1) return "元";
  const s = n.toString();
  return s
    .split("")
    .map((d) => KANJI_DIGITS[parseInt(d, 10)])
    .join("");
}

function eraEndYear(era: Era): number {
  return era.end ?? CURRENT_YEAR;
}

function getErasForYear(year: number): Array<{ era: Era; eraYear: number }> {
  const results: Array<{ era: Era; eraYear: number }> = [];
  for (const era of ERAS) {
    const end = eraEndYear(era);
    if (year >= era.start && year <= end) {
      results.push({ era, eraYear: year - era.start + 1 });
    }
  }
  return results;
}

function formatEraYear(eraYear: number, useKanji: boolean): string {
  if (useKanji) return toKanjiNumber(eraYear);
  return eraYear === 1 ? "元" : String(eraYear);
}

export default function NengouCalculator() {
  const [mode, setMode] = useState<Mode>("seireki-to-nengou");

  // 西暦→元号
  const [seireki, setSeireki] = useState("");
  const [seireki2nengouResults, setSeireki2nengouResults] = useState<
    Array<{ era: Era; eraYear: number }> | null
  >(null);
  const [seireki2nengouError, setSeireki2nengouError] = useState("");

  // 元号→西暦
  const [selectedEra, setSelectedEra] = useState<string>("令和");
  const [eraYearInput, setEraYearInput] = useState("");
  const [nengou2seireki, setNengou2seireki] = useState<number | null>(null);
  const [nengou2seirékiError, setNengou2seireikiError] = useState("");

  // 漢数字オプション
  const [useKanji, setUseKanji] = useState(false);

  const handleModeChange = useCallback((m: Mode) => {
    setMode(m);
    setSeireki2nengouResults(null);
    setSeireki2nengouError("");
    setNengou2seireki(null);
    setNengou2seireikiError("");
  }, []);

  const handleSeirekiConvert = useCallback(() => {
    const year = parseInt(seireki, 10);
    if (isNaN(year)) {
      setSeireki2nengouError("数値を入力してください");
      setSeireki2nengouResults(null);
      return;
    }
    if (year < 1868 || year > CURRENT_YEAR) {
      setSeireki2nengouError(`1868〜${CURRENT_YEAR}年の範囲で入力してください`);
      setSeireki2nengouResults(null);
      return;
    }
    const results = getErasForYear(year);
    if (results.length === 0) {
      setSeireki2nengouError("対応する元号が見つかりません");
      setSeireki2nengouResults(null);
      return;
    }
    setSeireki2nengouError("");
    setSeireki2nengouResults(results);
  }, [seireki]);

  const handleNengouConvert = useCallback(() => {
    const era = ERAS.find((e) => e.name === selectedEra);
    if (!era) {
      setNengou2seireikiError("元号を選択してください");
      return;
    }
    const y = parseInt(eraYearInput, 10);
    if (isNaN(y) || y < 1) {
      setNengou2seireikiError("正しい年数（1以上）を入力してください");
      setNengou2seireki(null);
      return;
    }
    const maxYear = eraEndYear(era) - era.start + 1;
    if (y > maxYear) {
      setNengou2seireikiError(
        `${era.name}は${maxYear}年（${eraEndYear(era)}年）までです`
      );
      setNengou2seireki(null);
      return;
    }
    const western = era.start + y - 1;
    setNengou2seireikiError("");
    setNengou2seireki(western);
  }, [selectedEra, eraYearInput]);

  const handleSeirekiKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") handleSeirekiConvert();
    },
    [handleSeirekiConvert]
  );

  const handleNengouKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") handleNengouConvert();
    },
    [handleNengouConvert]
  );

  const selectedEraData = ERAS.find((e) => e.name === selectedEra);
  const maxEraYear = selectedEraData ? eraEndYear(selectedEraData) - selectedEraData.start + 1 : 99;

  return (
    <div className="bg-surface rounded-2xl border border-border p-4 space-y-6">
      {/* Mode Toggle */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">変換モード</p>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "seireki-to-nengou", label: "西暦 → 元号", sub: "例: 1995 → 平成7年" },
              { value: "nengou-to-seireki", label: "元号 → 西暦", sub: "例: 令和3年 → 2021" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleModeChange(opt.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                mode === opt.value
                  ? "border-indigo-500 bg-indigo-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <span className="block text-sm font-semibold text-gray-800">{opt.label}</span>
              <span className="block text-xs text-gray-500 mt-1">{opt.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Kanji option */}
      <div className="flex items-center gap-2">
        <input
          id="kanji-toggle"
          type="checkbox"
          checked={useKanji}
          onChange={(e) => setUseKanji(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-indigo-600 cursor-pointer"
        />
        <label htmlFor="kanji-toggle" className="text-sm text-gray-700 cursor-pointer select-none">
          漢数字で表示（例: 平成七年）
        </label>
      </div>

      {/* 西暦→元号 */}
      {mode === "seireki-to-nengou" && (
        <div className="space-y-4">
          <div>
            <label htmlFor="seireki-input" className="block text-sm font-semibold text-gray-700 mb-2">
              西暦を入力
            </label>
            <div className="flex gap-2 items-center">
              <input
                id="seireki-input"
                type="number"
                min="1868"
                max={CURRENT_YEAR}
                placeholder="例: 1995"
                value={seireki}
                onChange={(e) => {
                  setSeireki(e.target.value);
                  setSeireki2nengouResults(null);
                  setSeireki2nengouError("");
                }}
                onKeyDown={handleSeirekiKeyDown}
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-colors text-base"
              />
              <span className="text-gray-600 text-sm font-medium">年</span>
            </div>
            {seireki2nengouError && (
              <p className="mt-2 text-sm text-red-600">{seireki2nengouError}</p>
            )}
          </div>

          <button
            onClick={handleSeirekiConvert}
            disabled={!seireki.trim()}
            className="w-full py-3 px-6 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-base shadow-sm"
          >
            変換する
          </button>

          {seireki2nengouResults && seireki2nengouResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">変換結果</p>
              {seireki2nengouResults.map(({ era, eraYear }) => (
                <div
                  key={era.name}
                  className="flex items-center justify-between bg-white border-2 border-indigo-100 rounded-xl px-5 py-4"
                >
                  <span className="text-sm text-gray-500 font-medium">{era.name}</span>
                  <span className="text-2xl font-bold text-indigo-700 tracking-wide">
                    {era.name}
                    {formatEraYear(eraYear, useKanji)}年
                  </span>
                </div>
              ))}
              <p className="text-xs text-gray-400 text-center">
                ※ 元号が切り替わる年は複数表示されます
              </p>
            </div>
          )}
        </div>
      )}

      {/* 元号→西暦 */}
      {mode === "nengou-to-seireki" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              元号と年数を入力
            </label>
            <div className="flex gap-2 items-center">
              <select
                value={selectedEra}
                onChange={(e) => {
                  setSelectedEra(e.target.value);
                  setNengou2seireki(null);
                  setNengou2seireikiError("");
                }}
                className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-colors text-base"
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
                max={maxEraYear}
                placeholder="年数"
                value={eraYearInput}
                onChange={(e) => {
                  setEraYearInput(e.target.value);
                  setNengou2seireki(null);
                  setNengou2seireikiError("");
                }}
                onKeyDown={handleNengouKeyDown}
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-colors text-base"
              />
              <span className="text-gray-600 text-sm font-medium">年</span>
            </div>
            {selectedEraData && (
              <p className="mt-1.5 text-xs text-gray-400">
                {selectedEraData.name}: {selectedEraData.start}年〜
                {selectedEraData.end ? selectedEraData.end + "年" : "現在"}
                （1〜{maxEraYear}年）
              </p>
            )}
            {nengou2seirékiError && (
              <p className="mt-2 text-sm text-red-600">{nengou2seirékiError}</p>
            )}
          </div>

          <button
            onClick={handleNengouConvert}
            disabled={!eraYearInput.trim()}
            className="w-full py-3 px-6 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-base shadow-sm"
          >
            変換する
          </button>

          {nengou2seireki !== null && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">変換結果</p>
              <div className="flex items-center justify-between bg-white border-2 border-indigo-100 rounded-xl px-5 py-4">
                <span className="text-sm text-gray-500 font-medium">
                  {selectedEra}
                  {formatEraYear(parseInt(eraYearInput, 10), useKanji)}年
                </span>
                <span className="text-2xl font-bold text-indigo-700 tracking-wide">
                  西暦 {nengou2seireki}年
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ad placeholder */}
      <div className="mt-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center h-20 text-xs text-gray-400 select-none">
        広告
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この元号・西暦変換ツールツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">元号（令和・平成・昭和・大正・明治）と西暦を双方向変換。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この元号・西暦変換ツールツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "元号（令和・平成・昭和・大正・明治）と西暦を双方向変換。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "元号・西暦変換ツール",
  "description": "元号（令和・平成・昭和・大正・明治）と西暦を双方向変換",
  "url": "https://tools.loresync.dev/nengou-calculator",
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
