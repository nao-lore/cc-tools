"use client";
import { useState, useMemo } from "react";

// 建築基準法 採光補正係数の計算
// D: 隣地境界線等からの距離(m), H: 窓中心から上部の建築物の各部分の高さ(m)
// 用途地域によって係数が異なる

const ZONE_TYPES = [
  { label: "住居系（第一種低層など）", a: 6, b: 1.4, limitLow: 0, limitHigh: 3 },
  { label: "工業系地域", a: 8, b: 1.0, limitLow: 0, limitHigh: 3 },
  { label: "商業系・近隣商業", a: 10, b: 1.0, limitLow: 0, limitHigh: 3 },
] as const;

interface Window {
  id: number;
  name: string;
  width: number;    // mm
  height: number;   // mm
  D: number;        // 隣地境界等からの距離 m
  H: number;        // 高さ m
  outdoor: boolean; // 屋外か否か (屋外なら補正係数=1)
}

let nextId = 2;

export default function SaikouKeisan() {
  const [roomArea, setRoomArea] = useState(15.0);    // 畳数 → m²
  const [zoneIdx, setZoneIdx] = useState(0);
  const [windows, setWindows] = useState<Window[]>([
    { id: 1, name: "南窓", width: 1800, height: 1200, D: 4.0, H: 2.5, outdoor: false },
  ]);

  const zone = ZONE_TYPES[zoneIdx];
  const requiredRatio = 1 / 7;

  const result = useMemo(() => {
    const requiredArea = roomArea * requiredRatio;
    const windowResults = windows.map((w) => {
      const actualArea = (w.width / 1000) * (w.height / 1000); // m²
      let correctionFactor: number;
      if (w.outdoor) {
        correctionFactor = 1.0;
      } else {
        const raw = (w.D / w.H) * zone.a - zone.b;
        correctionFactor = Math.max(zone.limitLow, Math.min(zone.limitHigh, raw));
      }
      const effectiveArea = actualArea * correctionFactor;
      return { ...w, actualArea, correctionFactor, effectiveArea };
    });

    const totalEffective = windowResults.reduce((sum, w) => sum + w.effectiveArea, 0);
    const passes = totalEffective >= requiredArea;
    const shortage = Math.max(0, requiredArea - totalEffective);

    return { requiredArea, windowResults, totalEffective, passes, shortage };
  }, [roomArea, zoneIdx, windows, zone]);

  function addWindow() {
    setWindows((prev) => [
      ...prev,
      { id: nextId++, name: `窓${prev.length + 1}`, width: 1200, height: 900, D: 3.0, H: 2.5, outdoor: false },
    ]);
  }

  function removeWindow(id: number) {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }

  function updateWindow(id: number, field: keyof Window, value: number | boolean | string) {
    setWindows((prev) => prev.map((w) => w.id === id ? { ...w, [field]: value } : w));
  }

  return (
    <div className="space-y-6">
      {/* Room */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">居室情報</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              居室床面積（m²）
            </label>
            <input
              type="number" step={0.1} min={1} max={200}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={roomArea}
              onChange={(e) => setRoomArea(Number(e.target.value))}
            />
            <p className="text-xs text-gray-400 mt-1">例: 6畳 ≈ 9.9m²、8畳 ≈ 13.2m²</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用途地域</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={zoneIdx}
              onChange={(e) => setZoneIdx(Number(e.target.value))}
            >
              {ZONE_TYPES.map((z, i) => (
                <option key={i} value={i}>{z.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Windows */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">窓の設定</h2>
          <button
            onClick={addWindow}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 窓を追加
          </button>
        </div>

        <div className="space-y-4">
          {windows.map((w) => (
            <div key={w.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <input
                  className="text-sm font-semibold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 w-24"
                  value={w.name}
                  onChange={(e) => updateWindow(w.id, "name", e.target.value)}
                />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={w.outdoor}
                      onChange={(e) => updateWindow(w.id, "outdoor", e.target.checked)}
                      className="accent-blue-600"
                    />
                    屋外（補正係数=1）
                  </label>
                  {windows.length > 1 && (
                    <button onClick={() => removeWindow(w.id)} className="text-red-400 hover:text-red-600 text-xs">削除</button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <LabelInput label="幅（mm）" value={w.width} onChange={(v) => updateWindow(w.id, "width", v)} min={100} max={5000} />
                <LabelInput label="高さ（mm）" value={w.height} onChange={(v) => updateWindow(w.id, "height", v)} min={100} max={3000} />
                {!w.outdoor && (
                  <>
                    <LabelInput label="D: 距離（m）" value={w.D} onChange={(v) => updateWindow(w.id, "D", v)} step={0.1} min={0.1} max={20} />
                    <LabelInput label="H: 高さ（m）" value={w.H} onChange={(v) => updateWindow(w.id, "H", v)} step={0.1} min={0.5} max={20} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className={`rounded-2xl border-2 p-6 ${result.passes ? "bg-green-50 border-green-400" : "bg-red-50 border-red-400"}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${result.passes ? "bg-green-500" : "bg-red-500"}`}>
            {result.passes ? "✓" : "✗"}
          </div>
          <h2 className={`text-xl font-bold ${result.passes ? "text-green-800" : "text-red-800"}`}>
            {result.passes ? "採光基準を満たしています" : "採光基準を満たしていません"}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <ResultNum label="必要有効採光面積" value={`${result.requiredArea.toFixed(2)} m²`} sub={`床面積 × 1/7`} />
          <ResultNum label="合計有効採光面積" value={`${result.totalEffective.toFixed(2)} m²`} sub="全窓の合計" />
          {!result.passes && (
            <ResultNum label="不足面積" value={`${result.shortage.toFixed(2)} m²`} sub="不足分" err />
          )}
        </div>

        {/* Per-window breakdown */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-gray-600">
                <th className="text-left py-2 pr-3">窓</th>
                <th className="text-right py-2 pr-3">実面積</th>
                <th className="text-right py-2 pr-3">補正係数</th>
                <th className="text-right py-2">有効採光面積</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {result.windowResults.map((w) => (
                <tr key={w.id}>
                  <td className="py-2 pr-3 font-medium text-gray-800">{w.name}</td>
                  <td className="py-2 pr-3 text-right text-gray-600">{w.actualArea.toFixed(3)} m²</td>
                  <td className="py-2 pr-3 text-right text-gray-600">{w.correctionFactor.toFixed(2)}</td>
                  <td className="py-2 text-right font-semibold text-gray-800">{w.effectiveArea.toFixed(3)} m²</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">計算式（建築基準法 第28条）</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>有効採光面積 = 窓面積 × 採光補正係数</p>
          <p>採光補正係数 = (D/H) × {zone.a} − {zone.b}　（{zone.limitLow}〜{zone.limitHigh}に制限）</p>
          <p>必要有効採光面積 = 床面積 × 1/7（居室の場合）</p>
        </div>
      </div>
    </div>
  );
}

function LabelInput({ label, value, onChange, step = 1, min, max }: {
  label: string; value: number; onChange: (v: number) => void;
  step?: number; min?: number; max?: number;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input
        type="number" step={step} min={min} max={max}
        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function ResultNum({ label, value, sub, err }: { label: string; value: string; sub: string; err?: boolean }) {
  return (
    <div className={`rounded-xl p-3 ${err ? "bg-red-100" : "bg-white bg-opacity-70"}`}>
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className={`text-xl font-bold ${err ? "text-red-700" : "text-gray-900"}`}>{value}</div>
      <div className="text-xs text-gray-400">{sub}</div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この採光計算（住宅用）ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">居室の採光面積が建築基準法を満たすか計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この採光計算（住宅用）ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "居室の採光面積が建築基準法を満たすか計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
