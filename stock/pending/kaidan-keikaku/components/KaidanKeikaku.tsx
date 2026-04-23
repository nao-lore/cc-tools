"use client";
import { useState, useMemo } from "react";

// 建築基準法 階段基準
// 住宅: 蹴上 230mm以下、踏面 150mm以上
// 共用廊下: 蹴上 200mm以下、踏面 240mm以上
// 特殊建築物: 蹴上 180mm以下、踏面 260mm以上

const STAIR_TYPES = [
  {
    label: "住宅（専用）",
    maxRiser: 230, minTread: 150,
    recRiser: 190, recTread: 210,
  },
  {
    label: "共用廊下・直通階段",
    maxRiser: 200, minTread: 240,
    recRiser: 180, recTread: 260,
  },
  {
    label: "特殊建築物",
    maxRiser: 180, minTread: 260,
    recRiser: 165, recTread: 280,
  },
] as const;

// 快適な階段の経験則: 2R + T = 600〜650mm
const COMFORT_MIN = 600;
const COMFORT_MAX = 650;

export default function KaidanKeikaku() {
  const [floorH, setFloorH] = useState(2800);    // 階高 mm
  const [steps, setSteps] = useState(14);          // 段数
  const [stairTypeIdx, setStairTypeIdx] = useState(0);
  const [width, setWidth] = useState(900);         // 有効幅 mm

  const st = STAIR_TYPES[stairTypeIdx];

  const result = useMemo(() => {
    const riser = floorH / steps;                  // 蹴上 mm
    const tread = 300;                             // 踏面（仮定値—ユーザーが調整後に表示）
    const slopeAngle = Math.atan(riser / tread) * (180 / Math.PI);
    const comfortFormula = 2 * riser + tread;

    const riserOk = riser <= st.maxRiser;
    const treadOk = tread >= st.minTread;
    const comfortOk = comfortFormula >= COMFORT_MIN && comfortFormula <= COMFORT_MAX;
    const widthOk = width >= (stairTypeIdx === 0 ? 750 : 1200);

    // Recommend optimal steps
    const optimalRiser = st.recRiser;
    const optimalSteps = Math.ceil(floorH / optimalRiser);
    const optimalRiserActual = floorH / optimalSteps;

    return { riser, tread, slopeAngle, comfortFormula, riserOk, treadOk, comfortOk, widthOk, optimalSteps, optimalRiserActual };
  }, [floorH, steps, stairTypeIdx, width, st]);

  // Visual: side view
  const scaleV = 0.12;
  const riserPx = result.riser * scaleV;
  const treadPx = result.tread * scaleV;
  const totalW = treadPx * steps;
  const totalH = riserPx * steps;
  const svgW = Math.min(totalW + 20, 400);
  const svgH = Math.min(totalH + 20, 250);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">階段仕様の入力</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">階高（mm）</label>
            <input
              type="number" min={2000} max={5000} step={10}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={floorH}
              onChange={(e) => setFloorH(Number(e.target.value))}
            />
            <p className="text-xs text-gray-400 mt-1">一般住宅: 2,700〜3,000mm</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">段数: {steps}段</label>
            <input
              type="range" min={10} max={25}
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
              className="w-full accent-blue-600 mt-2"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>10段</span><span>25段</span></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用途区分</label>
            <div className="space-y-2">
              {STAIR_TYPES.map((s, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="stairType" checked={stairTypeIdx === i}
                    onChange={() => setStairTypeIdx(i)} className="accent-blue-600" />
                  <span className="text-sm text-gray-700">{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">有効幅（mm）</label>
            <input
              type="number" min={600} max={2000} step={50}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
            <p className="text-xs text-gray-400 mt-1">住宅最低: 750mm / 共用最低: 1,200mm</p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ResultBox label="蹴上" value={`${result.riser.toFixed(1)} mm`}
          ok={result.riserOk} okText={`≤${st.maxRiser}mm`} ngText={`≤${st.maxRiser}mm 超過`} />
        <ResultBox label="踏面" value={`${result.tread} mm`}
          ok={result.treadOk} okText={`≥${st.minTread}mm`} ngText={`≥${st.minTread}mm 未満`} />
        <ResultBox label="勾配角度" value={`${result.slopeAngle.toFixed(1)}°`}
          ok={result.slopeAngle <= 45} okText="45°以下" ngText="急勾配" />
        <ResultBox label="有効幅" value={`${width} mm`}
          ok={result.widthOk} okText="基準以上" ngText="幅不足" />
      </div>

      {/* Comfort formula */}
      <div className={`rounded-2xl border-2 p-5 ${result.comfortOk ? "bg-green-50 border-green-400" : "bg-yellow-50 border-yellow-400"}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-sm font-semibold ${result.comfortOk ? "text-green-800" : "text-yellow-800"}`}>
              快適性の目安: 2R + T = {result.comfortFormula.toFixed(0)} mm
            </p>
            <p className={`text-xs mt-1 ${result.comfortOk ? "text-green-600" : "text-yellow-600"}`}>
              推奨範囲: 600〜650mm
              {result.comfortOk ? "快適な勾配です" : "やや快適範囲外です（基準は満たす場合あり）"}
            </p>
          </div>
          <span className={`text-2xl ${result.comfortOk ? "text-green-500" : "text-yellow-500"}`}>
            {result.comfortOk ? "✓" : "△"}
          </span>
        </div>
      </div>

      {/* Optimal suggestion */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">最適段数の提案</h3>
        <p className="text-sm text-blue-700">
          階高 {floorH}mm・蹴上推奨値 {st.recRiser}mm を基準にすると:
          <strong className="ml-1">{result.optimalSteps}段</strong>（蹴上 {result.optimalRiserActual.toFixed(1)}mm）が最適です。
          踏面は <strong>{st.recTread}mm</strong> を目安にしてください。
        </p>
      </div>

      {/* Side view SVG */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">断面イメージ（縮小）</h2>
        <div className="overflow-x-auto">
          <svg width={svgW} height={svgH + 10} className="block">
            <g transform={`translate(10, ${svgH - 10})`}>
              {Array.from({ length: steps }).map((_, i) => (
                <g key={i} transform={`translate(${i * treadPx}, ${-i * riserPx})`}>
                  {/* Riser (vertical) */}
                  <line x1={0} y1={0} x2={0} y2={riserPx} stroke="#6366f1" strokeWidth={1.5} />
                  {/* Tread (horizontal) */}
                  <line x1={0} y1={0} x2={treadPx} y2={0} stroke="#6366f1" strokeWidth={1.5} />
                </g>
              ))}
              {/* Floor line */}
              <line x1={0} y1={0} x2={svgW - 10} y2={0} stroke="#9ca3af" strokeWidth={1} />
            </g>
          </svg>
        </div>
        <div className="flex gap-6 mt-2 text-xs text-gray-500">
          <span>総水平長: {(result.tread * steps / 1000).toFixed(2)}m</span>
          <span>総高さ: {(floorH / 1000).toFixed(2)}m</span>
        </div>
      </div>

      {/* Law reference */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 overflow-x-auto">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">建築基準法 階段寸法基準（施行令23条）</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-300 text-gray-600">
              <th className="text-left py-1.5 pr-3">用途</th>
              <th className="text-right py-1.5 pr-3">蹴上（最大）</th>
              <th className="text-right py-1.5 pr-3">踏面（最小）</th>
              <th className="text-right py-1.5">有効幅（最小）</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr><td className="py-1.5 pr-3">住宅（専用）</td><td className="text-right pr-3">230mm</td><td className="text-right pr-3">150mm</td><td className="text-right">750mm</td></tr>
            <tr><td className="py-1.5 pr-3">共用廊下・直通階段</td><td className="text-right pr-3">200mm</td><td className="text-right pr-3">240mm</td><td className="text-right">1,200mm</td></tr>
            <tr><td className="py-1.5 pr-3">特殊建築物</td><td className="text-right pr-3">180mm</td><td className="text-right pr-3">260mm</td><td className="text-right">1,400mm</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResultBox({ label, value, ok, okText, ngText }: {
  label: string; value: string; ok: boolean; okText: string; ngText: string;
}) {
  return (
    <div className={`rounded-xl border-2 p-4 ${ok ? "bg-green-50 border-green-400" : "bg-red-50 border-red-400"}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className={`text-xs mt-1 font-medium ${ok ? "text-green-600" : "text-red-600"}`}>
        {ok ? `✓ ${okText}` : `✗ ${ngText}`}
      </div>
    </div>
  );
}
