"use client";
import { useState } from "react";

type InputField = "radius" | "diameter" | "area" | "circumference";

interface CircleValues {
  radius: number;
  diameter: number;
  area: number;
  circumference: number;
}

function calcFromRadius(r: number): CircleValues {
  return {
    radius: r,
    diameter: 2 * r,
    area: Math.PI * r * r,
    circumference: 2 * Math.PI * r,
  };
}

function calcFrom(field: InputField, value: number): CircleValues | null {
  if (value <= 0 || isNaN(value)) return null;
  switch (field) {
    case "radius": return calcFromRadius(value);
    case "diameter": return calcFromRadius(value / 2);
    case "area": return calcFromRadius(Math.sqrt(value / Math.PI));
    case "circumference": return calcFromRadius(value / (2 * Math.PI));
  }
}

const FIELDS: { id: InputField; label: string; formula: string; unit: string; color: string }[] = [
  { id: "radius", label: "半径 r", formula: "r", unit: "", color: "blue" },
  { id: "diameter", label: "直径 d", formula: "2r", unit: "", color: "green" },
  { id: "area", label: "面積 A", formula: "πr²", unit: "²", color: "purple" },
  { id: "circumference", label: "円周 C", formula: "2πr", unit: "", color: "orange" },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; ring: string }> = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", ring: "focus:ring-blue-500" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", ring: "focus:ring-green-500" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", ring: "focus:ring-purple-500" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", ring: "focus:ring-orange-500" },
};

const UNIT_OPTIONS = ["mm", "cm", "m", "inch", "ft"];

export default function CircleCalculator() {
  const [activeField, setActiveField] = useState<InputField>("radius");
  const [inputValue, setInputValue] = useState<string>("5");
  const [unit, setUnit] = useState("cm");
  const [sectorAngle, setSectorAngle] = useState<string>("90");
  const [precision, setPrecision] = useState<number>(4);

  const numVal = parseFloat(inputValue);
  const result = calcFrom(activeField, numVal);
  const angle = parseFloat(sectorAngle) || 0;

  const arcLength = result ? (result.circumference * angle) / 360 : null;
  const sectorArea = result ? (result.area * angle) / 360 : null;
  const chordLength = result ? 2 * result.radius * Math.sin((angle * Math.PI) / 360) : null;
  const segmentArea = result && arcLength !== null && chordLength !== null
    ? (result.area * angle) / 360 - 0.5 * result.radius * result.radius * Math.sin((angle * Math.PI) / 180)
    : null;

  const fmt = (n: number) => {
    if (n >= 1e9) return n.toExponential(precision);
    return n.toPrecision(precision + 1).replace(/\.?0+$/, "");
  };

  const handleFieldClick = (field: InputField) => {
    if (field === activeField) return;
    if (result) {
      const newVal = result[field];
      setInputValue(fmt(newVal));
    }
    setActiveField(field);
  };

  return (
    <div className="space-y-6">
      {/* 単位・精度設定 */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">単位:</label>
            <div className="flex gap-1">
              {UNIT_OPTIONS.map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                    unit === u ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">有効桁数:</label>
            <select
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2, 3, 4, 5, 6, 8].map(n => <option key={n} value={n}>{n}桁</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* メイン入力 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          入力値を選択して数値を入力
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FIELDS.map((f) => {
            const colors = COLOR_MAP[f.color];
            const isActive = activeField === f.id;
            const displayVal = isActive ? inputValue : result ? fmt(result[f.id]) : "";
            return (
              <div
                key={f.id}
                onClick={() => handleFieldClick(f.id)}
                className={`rounded-xl p-4 border-2 cursor-pointer transition-all ${
                  isActive
                    ? `${colors.bg} ${colors.border} shadow-sm`
                    : "border-gray-200 hover:border-gray-300 bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className={`text-sm font-semibold ${isActive ? colors.text : "text-gray-600"}`}>
                      {f.label}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">= {f.formula}</span>
                  </div>
                  {isActive && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border} font-medium`}>
                      入力中
                    </span>
                  )}
                </div>
                {isActive ? (
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      autoFocus
                      className={`w-full border rounded-lg px-3 py-2 pr-16 text-lg font-mono focus:outline-none focus:ring-2 ${colors.border} ${colors.ring} bg-white`}
                      placeholder="値を入力"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500 text-sm">{unit}{f.unit}</span>
                  </div>
                ) : (
                  <div className={`text-lg font-mono font-semibold ${result ? colors.text : "text-gray-300"} py-2`}>
                    {displayVal || "—"}
                    {displayVal && <span className="text-sm font-normal ml-1">{unit}{f.unit}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 扇形・弧の計算 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">扇形・弧の計算</h2>
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium text-gray-700">中心角 θ:</label>
          <div className="relative w-40">
            <input
              type="number"
              value={sectorAngle}
              onChange={(e) => setSectorAngle(e.target.value)}
              min={0}
              max={360}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-2.5 text-gray-400 text-sm">°</span>
          </div>
          <div className="flex gap-1">
            {[30, 45, 60, 90, 120, 180].map(a => (
              <button
                key={a}
                onClick={() => setSectorAngle(String(a))}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  sectorAngle === String(a) ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {a}°
              </button>
            ))}
          </div>
        </div>

        {result && angle > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "弧の長さ", value: arcLength, suf: unit },
              { label: "扇形の面積", value: sectorArea, suf: `${unit}²` },
              { label: "弦の長さ", value: chordLength, suf: unit },
              { label: "弓形の面積", value: segmentArea, suf: `${unit}²` },
            ].map(({ label, value, suf }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-base font-bold font-mono text-gray-800 mt-1">
                  {value !== null && value >= 0 ? `${fmt(value)} ${suf}` : "—"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">円のサイズと中心角を入力すると扇形の各値が計算されます</p>
        )}
      </div>

      {/* 倍率表 */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">倍率比較表（同比例の円）</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 px-3 py-2 text-left">倍率</th>
                  <th className="border border-gray-200 px-3 py-2 text-right">半径</th>
                  <th className="border border-gray-200 px-3 py-2 text-right">面積</th>
                  <th className="border border-gray-200 px-3 py-2 text-right">円周</th>
                </tr>
              </thead>
              <tbody>
                {[0.5, 1, 1.5, 2, 3, 5].map((scale) => {
                  const r = result.radius * scale;
                  const a = Math.PI * r * r;
                  const c = 2 * Math.PI * r;
                  const isCurrent = scale === 1;
                  return (
                    <tr key={scale} className={isCurrent ? "bg-blue-50 font-semibold" : "hover:bg-gray-50"}>
                      <td className="border border-gray-200 px-3 py-1.5">{scale}倍{isCurrent ? "（現在）" : ""}</td>
                      <td className="border border-gray-200 px-3 py-1.5 text-right font-mono">{fmt(r)} {unit}</td>
                      <td className="border border-gray-200 px-3 py-1.5 text-right font-mono">{fmt(a)} {unit}²</td>
                      <td className="border border-gray-200 px-3 py-1.5 text-right font-mono">{fmt(c)} {unit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
