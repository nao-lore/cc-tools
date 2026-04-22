"use client";

import { useState } from "react";
import {
  ERAS,
  warekiToWestern,
  westernToWareki,
  getZodiac,
  formatForResume,
} from "../lib/wareki";

export default function WarekiConverter() {
  // 和暦→西暦
  const [selectedEra, setSelectedEra] = useState("令和");
  const [eraYear, setEraYear] = useState("");
  const [warekiResult, setWarekiResult] = useState<string | null>(null);

  // 西暦→和暦
  const [westernYear, setWesternYear] = useState("");
  const [westernResult, setWesternResult] = useState<string | null>(null);

  const handleWarekiToWestern = () => {
    const year = parseInt(eraYear, 10);
    if (isNaN(year) || year < 1) {
      setWarekiResult("正しい年数を入力してください");
      return;
    }
    const result = warekiToWestern(selectedEra, year);
    if (result === null) {
      setWarekiResult("該当する西暦年がありません");
      return;
    }
    const zodiac = getZodiac(result);
    const resume = formatForResume(selectedEra, year);
    setWarekiResult(
      `西暦 ${result}年（${zodiac}）\n履歴書用: ${resume}`
    );
  };

  const handleWesternToWareki = () => {
    const year = parseInt(westernYear, 10);
    if (isNaN(year) || year < 1868 || year > new Date().getFullYear()) {
      setWesternResult("1868年〜現在の範囲で入力してください");
      return;
    }
    const results = westernToWareki(year);
    if (results.length === 0) {
      setWesternResult("該当する和暦がありません");
      return;
    }
    const zodiac = getZodiac(year);
    const lines = results.map(
      (r) => `${r.eraName}${r.eraYear === 1 ? "元" : r.eraYear}年`
    );
    setWesternResult(`${lines.join(" / ")}（${zodiac}）`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 和暦→西暦 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📅</span>
          和暦 → 西暦
        </h2>
        <div className="space-y-3">
          <div className="flex gap-2">
            <select
              value={selectedEra}
              onChange={(e) => setSelectedEra(e.target.value)}
              className="flex-shrink-0 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              value={eraYear}
              onChange={(e) => setEraYear(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleWarekiToWestern()}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="flex items-center text-gray-600">年</span>
          </div>
          <button
            onClick={handleWarekiToWestern}
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            変換する
          </button>
          {warekiResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 whitespace-pre-line text-sm">
              {warekiResult}
            </div>
          )}
        </div>
      </div>

      {/* 西暦→和暦 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔄</span>
          西暦 → 和暦
        </h2>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              min="1868"
              max={new Date().getFullYear()}
              placeholder="西暦（例: 2024）"
              value={westernYear}
              onChange={(e) => setWesternYear(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleWesternToWareki()}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span className="flex items-center text-gray-600">年</span>
          </div>
          <button
            onClick={handleWesternToWareki}
            className="w-full bg-green-600 text-white font-medium py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
          >
            変換する
          </button>
          {westernResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
              {westernResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
