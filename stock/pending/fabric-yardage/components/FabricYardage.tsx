"use client";
import { useState, useMemo } from "react";

// 生地必要量計算
// パーツ面積 × (1 + 縫い代係数) × レイアウト効率係数 = 必要面積
// 必要生地長さ = 必要面積 / 生地幅

const FABRIC_WIDTHS = [90, 110, 115, 130, 140, 150];

const GARMENT_PRESETS = [
  {
    name: "Tシャツ（S/M）",
    parts: [
      { name: "前身頃", w: 52, h: 68 },
      { name: "後身頃", w: 52, h: 68 },
      { name: "袖（左右）", w: 40, h: 58, qty: 2 },
    ],
    seamAllowance: 15,
  },
  {
    name: "Tシャツ（L/XL）",
    parts: [
      { name: "前身頃", w: 58, h: 74 },
      { name: "後身頃", w: 58, h: 74 },
      { name: "袖（左右）", w: 44, h: 62, qty: 2 },
    ],
    seamAllowance: 15,
  },
  {
    name: "フレアスカート",
    parts: [
      { name: "前スカート", w: 70, h: 70 },
      { name: "後スカート", w: 70, h: 70 },
      { name: "ウエストバンド", w: 80, h: 8 },
    ],
    seamAllowance: 20,
  },
  {
    name: "エコバッグ",
    parts: [
      { name: "本体（前後）", w: 40, h: 45, qty: 2 },
      { name: "持ち手", w: 6, h: 60, qty: 2 },
    ],
    seamAllowance: 15,
  },
  {
    name: "クッションカバー（45cm角）",
    parts: [
      { name: "表面", w: 47, h: 47 },
      { name: "裏面（左）", w: 47, h: 30 },
      { name: "裏面（右）", w: 47, h: 30 },
    ],
    seamAllowance: 15,
  },
  {
    name: "カスタム",
    parts: [],
    seamAllowance: 15,
  },
];

interface Part {
  id: number;
  name: string;
  w: number;   // cm
  h: number;   // cm
  qty: number;
}

let nextPartId = 100;

export default function FabricYardage() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [fabricWidth, setFabricWidth] = useState(110);
  const [seamAllowance, setSeamAllowance] = useState(15);
  const [layoutEfficiency, setLayoutEfficiency] = useState(0.85);
  const [parts, setParts] = useState<Part[]>(
    GARMENT_PRESETS[0].parts.map((p, i) => ({
      id: i,
      name: p.name,
      w: p.w,
      h: p.h,
      qty: (p as { qty?: number }).qty ?? 1,
    }))
  );

  function applyPreset(idx: number) {
    setPresetIdx(idx);
    const preset = GARMENT_PRESETS[idx];
    if (preset.name === "カスタム") {
      setParts([{ id: nextPartId++, name: "パーツ1", w: 30, h: 40, qty: 1 }]);
    } else {
      setParts(
        preset.parts.map((p, i) => ({
          id: i + idx * 100,
          name: p.name,
          w: p.w,
          h: p.h,
          qty: (p as { qty?: number }).qty ?? 1,
        }))
      );
      setSeamAllowance(preset.seamAllowance);
    }
  }

  function addPart() {
    setParts((prev) => [...prev, { id: nextPartId++, name: `パーツ${prev.length + 1}`, w: 20, h: 30, qty: 1 }]);
  }

  function removePart(id: number) {
    setParts((prev) => prev.filter((p) => p.id !== id));
  }

  function updatePart(id: number, field: keyof Part, value: number | string) {
    setParts((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p));
  }

  const result = useMemo(() => {
    const partResults = parts.map((p) => {
      const wWithSeam = p.w + seamAllowance * 2 / 10; // seamAllowance in mm → cm
      const hWithSeam = p.h + seamAllowance * 2 / 10;
      const areaPerPiece = wWithSeam * hWithSeam; // cm²
      const totalArea = areaPerPiece * p.qty;
      return { ...p, wWithSeam, hWithSeam, areaPerPiece, totalArea };
    });

    const totalArea_cm2 = partResults.reduce((s, p) => s + p.totalArea, 0);
    const adjustedArea = totalArea_cm2 / layoutEfficiency;
    const fabricWidth_cm = fabricWidth;
    const requiredLength_cm = adjustedArea / fabricWidth_cm;
    const requiredLength_m = requiredLength_cm / 100;
    // Buffer: round up to nearest 0.1m
    const requiredLength_m_buy = Math.ceil(requiredLength_m * 10) / 10 + 0.1;
    // Yardage
    const requiredYards = requiredLength_m * 1.09361;

    return { partResults, totalArea_cm2, adjustedArea, requiredLength_cm, requiredLength_m, requiredLength_m_buy, requiredYards };
  }, [parts, fabricWidth, seamAllowance, layoutEfficiency]);

  return (
    <div className="space-y-6">
      {/* Preset */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">アイテムを選択</h2>
        <div className="flex flex-wrap gap-2">
          {GARMENT_PRESETS.map((p, i) => (
            <button key={i} onClick={() => applyPreset(i)}
              className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                presetIdx === i ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Fabric & settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">生地・縫い代の設定</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">生地幅（cm）</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {FABRIC_WIDTHS.map((w) => (
                <button key={w} onClick={() => setFabricWidth(w)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    fabricWidth === w ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"
                  }`}>
                  {w}cm
                </button>
              ))}
            </div>
            <input type="number" min={50} max={250} step={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={fabricWidth} onChange={(e) => setFabricWidth(Number(e.target.value))} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">縫い代（mm）: {seamAllowance}mm</label>
            <input type="range" min={5} max={30} step={5}
              value={seamAllowance}
              onChange={(e) => setSeamAllowance(Number(e.target.value))}
              className="w-full accent-blue-600 mt-2" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5mm</span><span>15mm（標準）</span><span>30mm</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              レイアウト効率: {(layoutEfficiency * 100).toFixed(0)}%
            </label>
            <input type="range" min={0.6} max={0.95} step={0.05}
              value={layoutEfficiency}
              onChange={(e) => setLayoutEfficiency(Number(e.target.value))}
              className="w-full accent-blue-600 mt-2" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>60%（悪い）</span><span>85%（標準）</span><span>95%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Parts list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">パーツ一覧</h2>
          <button onClick={addPart} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            + パーツ追加
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 text-xs">
                <th className="text-left py-2 pr-3">パーツ名</th>
                <th className="text-right py-2 pr-3">幅（cm）</th>
                <th className="text-right py-2 pr-3">高さ（cm）</th>
                <th className="text-right py-2 pr-3">枚数</th>
                <th className="text-right py-2 pr-3">縫い代込み面積</th>
                <th className="text-right py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.partResults.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 pr-3">
                    <input className="text-sm bg-transparent border-b border-gray-200 focus:outline-none focus:border-blue-400 w-24"
                      value={p.name} onChange={(e) => updatePart(p.id, "name", e.target.value)} />
                  </td>
                  <td className="py-2 pr-3 text-right">
                    <input type="number" min={1} step={1}
                      className="w-16 text-right border border-gray-200 rounded px-1 py-0.5 text-sm focus:outline-none focus:border-blue-400"
                      value={p.w} onChange={(e) => updatePart(p.id, "w", Number(e.target.value))} />
                  </td>
                  <td className="py-2 pr-3 text-right">
                    <input type="number" min={1} step={1}
                      className="w-16 text-right border border-gray-200 rounded px-1 py-0.5 text-sm focus:outline-none focus:border-blue-400"
                      value={p.h} onChange={(e) => updatePart(p.id, "h", Number(e.target.value))} />
                  </td>
                  <td className="py-2 pr-3 text-right">
                    <input type="number" min={1} max={20}
                      className="w-12 text-right border border-gray-200 rounded px-1 py-0.5 text-sm focus:outline-none focus:border-blue-400"
                      value={p.qty} onChange={(e) => updatePart(p.id, "qty", Number(e.target.value))} />
                  </td>
                  <td className="py-2 pr-3 text-right text-gray-600">
                    {p.totalArea.toFixed(0)} cm²
                  </td>
                  <td className="py-2 text-right">
                    {parts.length > 1 && (
                      <button onClick={() => removePart(p.id)} className="text-red-400 hover:text-red-600 text-xs">削除</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Final result */}
      <div className="bg-blue-600 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">必要生地量</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <FinalCard label="必要な長さ" value={`${result.requiredLength_m.toFixed(2)}m`} />
          <FinalCard label="購入推奨量" value={`${result.requiredLength_m_buy.toFixed(1)}m`} note="余裕込み" />
          <FinalCard label="ヤード換算" value={`${result.requiredYards.toFixed(2)}yd`} />
          <FinalCard label="総パーツ面積" value={`${(result.totalArea_cm2 / 10000).toFixed(3)}m²`} />
        </div>
        <div className="mt-4 pt-4 border-t border-blue-500 text-sm text-blue-200">
          生地幅 {fabricWidth}cm × {result.requiredLength_m_buy.toFixed(1)}m = 購入サイズ
        </div>
      </div>
    </div>
  );
}

function FinalCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="bg-blue-500 bg-opacity-50 rounded-xl p-3">
      <div className="text-xs text-blue-200 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {note && <div className="text-xs text-blue-300">{note}</div>}
    </div>
  );
}
