"use client";
import { useState, useMemo } from "react";

// 連量基準サイズ (四六判: 788×1091mm, A判: 625×880mm, B判: 765×1085mm)
const PAPER_TYPES = [
  { name: "四六判（788×1091mm）", baseArea: 788 * 1091 / 1e6, label: "四六" },
  { name: "A判（625×880mm）",     baseArea: 625 * 880  / 1e6, label: "A判" },
  { name: "B判（765×1085mm）",    baseArea: 765 * 1085 / 1e6, label: "B判" },
  { name: "菊判（636×939mm）",    baseArea: 636 * 939  / 1e6, label: "菊判" },
];

// 代表的な紙種と連量 → 厚み換算（μm/g/m²）
const PAPER_GRADES = [
  { name: "上質紙", densityFactor: 1.20 },
  { name: "コート紙", densityFactor: 1.35 },
  { name: "マット紙", densityFactor: 1.30 },
  { name: "クラフト紙", densityFactor: 1.10 },
  { name: "薄葉紙", densityFactor: 1.00 },
];

const PAPER_SIZES = [
  { name: "A4 (210×297mm)", w: 210, h: 297 },
  { name: "A3 (297×420mm)", w: 297, h: 420 },
  { name: "B4 (257×364mm)", w: 257, h: 364 },
  { name: "B5 (182×257mm)", w: 182, h: 257 },
  { name: "ハガキ (100×148mm)", w: 100, h: 148 },
  { name: "名刺 (91×55mm)", w: 91, h: 55 },
  { name: "カスタム", w: 0, h: 0 },
];

export default function RenryoWeight() {
  const [renryo, setRenryo] = useState(90);         // 連量 kg
  const [paperTypeIdx, setPaperTypeIdx] = useState(0);
  const [gradeIdx, setGradeIdx] = useState(0);
  const [paperSizeIdx, setPaperSizeIdx] = useState(0);
  const [customW, setCustomW] = useState(210);
  const [customH, setCustomH] = useState(297);
  const [sheets, setSheets] = useState(500);

  const pt = PAPER_TYPES[paperTypeIdx];
  const grade = PAPER_GRADES[gradeIdx];
  const ps = PAPER_SIZES[paperSizeIdx];
  const targetW = ps.name === "カスタム" ? customW : ps.w;
  const targetH = ps.name === "カスタム" ? customH : ps.h;

  const result = useMemo(() => {
    // 連量 → g/m² (basis weight per m²)
    // 1連 = 1000枚, 基準面積 = pt.baseArea m²
    const gsm = (renryo * 1000) / (1000 * pt.baseArea);
    // 1枚の重量 (g): targetW mm × targetH mm = targetW*targetH/1e6 m²
    const sheetAreaM2 = (targetW * targetH) / 1e6;
    const weightPerSheet_g = gsm * sheetAreaM2;
    const weightPerSheet_mg = weightPerSheet_g * 1000;
    // 厚み: gsm / density(g/cm³) → cm → μm
    // density ≈ grade.densityFactor g/cm³
    const thickness_cm = gsm / (grade.densityFactor * 10000); // gsm g/m² / (g/cm³) = cm * m²/cm² factor
    // simpler: thickness(mm) = gsm / (density_g_cm3 * 1000)
    const thickness_mm = gsm / (grade.densityFactor * 1000);
    const thickness_um = thickness_mm * 1000;
    // total weight for N sheets
    const totalWeight_g = weightPerSheet_g * sheets;
    const totalWeight_kg = totalWeight_g / 1000;
    return { gsm, weightPerSheet_g, weightPerSheet_mg, thickness_mm, thickness_um, totalWeight_g, totalWeight_kg };
  }, [renryo, pt, grade, targetW, targetH, sheets]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">入力</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 連量 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">連量（kg）</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={renryo}
              min={10}
              max={400}
              step={5}
              onChange={(e) => setRenryo(Number(e.target.value))}
            />
            <p className="text-xs text-gray-400 mt-1">一般的な範囲: 40〜200kg</p>
          </div>

          {/* 判型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">連量基準サイズ（判型）</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={paperTypeIdx}
              onChange={(e) => setPaperTypeIdx(Number(e.target.value))}
            >
              {PAPER_TYPES.map((pt, i) => (
                <option key={i} value={i}>{pt.name}</option>
              ))}
            </select>
          </div>

          {/* 紙種 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">紙種（厚み計算用）</label>
            <div className="flex flex-wrap gap-2">
              {PAPER_GRADES.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setGradeIdx(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    gradeIdx === i
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* 対象用紙サイズ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">対象サイズ（1枚重量計算用）</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={paperSizeIdx}
              onChange={(e) => setPaperSizeIdx(Number(e.target.value))}
            >
              {PAPER_SIZES.map((ps, i) => (
                <option key={i} value={i}>{ps.name}</option>
              ))}
            </select>
          </div>

          {PAPER_SIZES[paperSizeIdx].name === "カスタム" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">幅（mm）</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={customW} min={1} onChange={(e) => setCustomW(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">高さ（mm）</label>
                <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={customH} min={1} onChange={(e) => setCustomH(Number(e.target.value))} />
              </div>
            </>
          )}

          {/* 枚数 */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">枚数: {sheets.toLocaleString()}枚</label>
            <input
              type="range" min={100} max={10000} step={100}
              value={sheets}
              onChange={(e) => setSheets(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>100枚</span><span>10,000枚</span></div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <ResultCard label="坪量（g/m²）" value={result.gsm.toFixed(1)} unit="g/m²" color="blue" />
        <ResultCard label="1枚の重量" value={result.weightPerSheet_g < 1 ? result.weightPerSheet_mg.toFixed(1) : result.weightPerSheet_g.toFixed(2)} unit={result.weightPerSheet_g < 1 ? "mg" : "g"} color="green" />
        <ResultCard label="紙の厚み（概算）" value={result.thickness_um.toFixed(0)} unit="μm" color="purple" />
        <ResultCard label={`${sheets.toLocaleString()}枚の総重量`} value={result.totalWeight_kg >= 1 ? result.totalWeight_kg.toFixed(2) : result.totalWeight_g.toFixed(1)} unit={result.totalWeight_kg >= 1 ? "kg" : "g"} color="orange" />
        <ResultCard label="厚み（mm）" value={result.thickness_mm.toFixed(3)} unit="mm" color="teal" />
        <ResultCard label={`${sheets.toLocaleString()}枚の束厚`} value={(result.thickness_mm * sheets).toFixed(1)} unit="mm" color="red" />
      </div>

      {/* Reference table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よく使う連量の目安（四六判）</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 text-gray-600 font-medium">用途</th>
              <th className="text-right py-2 pr-4 text-gray-600 font-medium">連量</th>
              <th className="text-right py-2 text-gray-600 font-medium">坪量</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              ["新聞紙", "30〜40kg", "45〜55 g/m²"],
              ["コピー用紙・チラシ薄め", "55〜70kg", "73〜93 g/m²"],
              ["標準コピー用紙", "70kg", "93 g/m²"],
              ["チラシ・カタログ", "90〜110kg", "120〜148 g/m²"],
              ["厚口チラシ・冊子表紙", "135kg", "180 g/m²"],
              ["名刺・ハガキ", "180〜220kg", "240〜293 g/m²"],
              ["厚紙・パッケージ", "300kg以上", "400+ g/m²"],
            ].map(([use, ryo, gsm]) => (
              <tr key={use} className="hover:bg-gray-50">
                <td className="py-2 pr-4 text-gray-700">{use}</td>
                <td className="py-2 pr-4 text-right text-gray-700">{ryo}</td>
                <td className="py-2 text-right text-gray-700">{gsm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResultCard({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    teal: "bg-teal-50 border-teal-200 text-teal-800",
    red: "bg-red-50 border-red-200 text-red-800",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="text-xs font-medium opacity-70 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-60">{unit}</div>
    </div>
  );
}
