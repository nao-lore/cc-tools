"use client";
import { useState, useMemo } from "react";

function calcTire(width: number, aspect: number, rim: number) {
  const sidewall = (width * aspect) / 100;
  const diameter = rim * 25.4 + sidewall * 2;
  const circumference = diameter * Math.PI;
  return { sidewall, diameter, circumference };
}

function speedError(origCirc: number, newCirc: number): number {
  return ((newCirc - origCirc) / origCirc) * 100;
}

function odometerError(origCirc: number, newCirc: number): number {
  return ((origCirc - newCirc) / origCirc) * 100;
}

const COMMON_SIZES = [
  { width: 165, aspect: 65, rim: 14 },
  { width: 175, aspect: 65, rim: 14 },
  { width: 185, aspect: 65, rim: 15 },
  { width: 195, aspect: 65, rim: 15 },
  { width: 205, aspect: 60, rim: 16 },
  { width: 215, aspect: 55, rim: 17 },
  { width: 225, aspect: 45, rim: 18 },
  { width: 235, aspect: 40, rim: 18 },
  { width: 245, aspect: 40, rim: 19 },
  { width: 255, aspect: 35, rim: 19 },
];

const WIDTHS = [145, 155, 165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285, 295];
const ASPECTS = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
const RIMS = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

export default function TireSizeConverter() {
  const [origWidth, setOrigWidth] = useState(195);
  const [origAspect, setOrigAspect] = useState(65);
  const [origRim, setOrigRim] = useState(15);
  const [newWidth, setNewWidth] = useState(205);
  const [newAspect, setNewAspect] = useState(60);
  const [newRim, setNewRim] = useState(16);

  const orig = useMemo(() => calcTire(origWidth, origAspect, origRim), [origWidth, origAspect, origRim]);
  const nw = useMemo(() => calcTire(newWidth, newAspect, newRim), [newWidth, newAspect, newRim]);

  const diamDiff = nw.diameter - orig.diameter;
  const speedErr = speedError(orig.circumference, nw.circumference);
  const odoErr = odometerError(orig.circumference, nw.circumference);

  const isCompatible = Math.abs(diamDiff) <= 15 && Math.abs(speedErr) <= 3;

  const getSuggestions = () => {
    return COMMON_SIZES.filter((s) => {
      const t = calcTire(s.width, s.aspect, s.rim);
      const diff = Math.abs(t.diameter - orig.diameter);
      return diff <= 12 && !(s.width === origWidth && s.aspect === origAspect && s.rim === origRim);
    }).slice(0, 6);
  };

  const suggestions = getSuggestions();

  const SelectField = ({
    label,
    value,
    options,
    onChange,
    suffix,
  }: {
    label: string;
    value: number;
    options: number[];
    onChange: (v: number) => void;
    suffix: string;
  }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}{suffix}
          </option>
        ))}
      </select>
    </div>
  );

  const TireViz = ({ diameter, color }: { diameter: number; color: string }) => {
    const scale = 60 / 700;
    const px = diameter * scale;
    const rimPx = px * 0.6;
    return (
      <div className="flex items-center justify-center" style={{ width: 80, height: 80 }}>
        <div
          className={`rounded-full border-8 ${color} flex items-center justify-center`}
          style={{ width: px, height: px }}
        >
          <div className="rounded-full bg-gray-300" style={{ width: rimPx * 0.4, height: rimPx * 0.4 }} />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              純正サイズ
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <SelectField label="幅 (mm)" value={origWidth} options={WIDTHS} onChange={setOrigWidth} suffix="" />
              <SelectField label="扁平率 (%)" value={origAspect} options={ASPECTS} onChange={setOrigAspect} suffix="" />
              <SelectField label="リム径 (inch)" value={origRim} options={RIMS} onChange={setOrigRim} suffix="\"" />
            </div>
            <div className="mt-3 text-center">
              <span className="text-xl font-bold text-blue-700">
                {origWidth}/{origAspect}R{origRim}
              </span>
            </div>
          </div>

          {/* New */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
              変更後サイズ
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <SelectField label="幅 (mm)" value={newWidth} options={WIDTHS} onChange={setNewWidth} suffix="" />
              <SelectField label="扁平率 (%)" value={newAspect} options={ASPECTS} onChange={setNewAspect} suffix="" />
              <SelectField label="リム径 (inch)" value={newRim} options={RIMS} onChange={setNewRim} suffix="\"" />
            </div>
            <div className="mt-3 text-center">
              <span className="text-xl font-bold text-orange-600">
                {newWidth}/{newAspect}R{newRim}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">外径の比較</h2>
        <div className="flex items-end justify-center gap-8">
          <div className="text-center">
            <TireViz diameter={orig.diameter} color="border-blue-400" />
            <p className="text-sm text-blue-700 font-medium mt-2">{orig.diameter.toFixed(1)} mm</p>
            <p className="text-xs text-gray-500">純正</p>
          </div>
          <div className="text-center text-gray-400 text-2xl mb-8">vs</div>
          <div className="text-center">
            <TireViz diameter={nw.diameter} color="border-orange-400" />
            <p className="text-sm text-orange-600 font-medium mt-2">{nw.diameter.toFixed(1)} mm</p>
            <p className="text-xs text-gray-500">変更後</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">詳細比較</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="pb-2 font-medium text-gray-600">項目</th>
                <th className="pb-2 font-medium text-blue-600">純正</th>
                <th className="pb-2 font-medium text-orange-600">変更後</th>
                <th className="pb-2 font-medium text-gray-600">差分</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-2 text-gray-700">外径 (mm)</td>
                <td className="py-2 font-medium">{orig.diameter.toFixed(1)}</td>
                <td className="py-2 font-medium">{nw.diameter.toFixed(1)}</td>
                <td className={`py-2 font-medium ${Math.abs(diamDiff) > 15 ? "text-red-600" : "text-green-600"}`}>
                  {diamDiff > 0 ? "+" : ""}{diamDiff.toFixed(1)}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-700">サイドウォール高さ (mm)</td>
                <td className="py-2 font-medium">{orig.sidewall.toFixed(1)}</td>
                <td className="py-2 font-medium">{nw.sidewall.toFixed(1)}</td>
                <td className="py-2 font-medium">{(nw.sidewall - orig.sidewall) > 0 ? "+" : ""}{(nw.sidewall - orig.sidewall).toFixed(1)}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-700">周長 (mm)</td>
                <td className="py-2 font-medium">{orig.circumference.toFixed(0)}</td>
                <td className="py-2 font-medium">{nw.circumference.toFixed(0)}</td>
                <td className="py-2 font-medium">{(nw.circumference - orig.circumference) > 0 ? "+" : ""}{(nw.circumference - orig.circumference).toFixed(0)}</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-700">速度計誤差</td>
                <td className="py-2 font-medium">—</td>
                <td className="py-2 font-medium">—</td>
                <td className={`py-2 font-medium ${Math.abs(speedErr) > 3 ? "text-red-600" : "text-green-600"}`}>
                  {speedErr > 0 ? "+" : ""}{speedErr.toFixed(2)}%
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-700">走行距離誤差</td>
                <td className="py-2 font-medium">—</td>
                <td className="py-2 font-medium">—</td>
                <td className={`py-2 font-medium ${Math.abs(odoErr) > 3 ? "text-red-600" : "text-green-600"}`}>
                  {odoErr > 0 ? "+" : ""}{odoErr.toFixed(2)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={`mt-4 rounded-xl p-4 text-sm font-medium border ${isCompatible ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          {isCompatible
            ? "互換性あり：外径差・速度誤差ともに許容範囲内です"
            : `互換性に問題あり：外径差 ${Math.abs(diamDiff).toFixed(1)}mm（推奨15mm以内）、速度誤差 ${Math.abs(speedErr).toFixed(1)}%（推奨3%以内）`}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">互換サイズの候補</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {suggestions.map((s) => {
              const t = calcTire(s.width, s.aspect, s.rim);
              const d = t.diameter - orig.diameter;
              const se = speedError(orig.circumference, t.circumference);
              return (
                <button
                  key={`${s.width}/${s.aspect}R${s.rim}`}
                  onClick={() => { setNewWidth(s.width); setNewAspect(s.aspect); setNewRim(s.rim); }}
                  className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-left"
                >
                  <p className="font-bold text-gray-900">{s.width}/{s.aspect}R{s.rim}</p>
                  <p className="text-xs text-gray-500 mt-1">外径差: {d > 0 ? "+" : ""}{d.toFixed(1)}mm</p>
                  <p className={`text-xs mt-0.5 ${Math.abs(se) <= 2 ? "text-green-600" : "text-orange-500"}`}>
                    速度誤差: {se > 0 ? "+" : ""}{se.toFixed(1)}%
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
