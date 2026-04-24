"use client";
import { useState, useMemo } from "react";

// 照明計算: 必要照度(lux) × 床面積(m²) / (光束利用率 × 保守率) = 必要ルーメン
// 一般的な光束利用率: 0.4〜0.6、保守率: 0.7〜0.8

const ROOM_USES = [
  { name: "リビング・居間",        lux: 200,  icon: "🛋" },
  { name: "ダイニング",            lux: 200,  icon: "🍽" },
  { name: "キッチン（全体）",      lux: 200,  icon: "🍳" },
  { name: "キッチン（調理台）",    lux: 500,  icon: "🔪" },
  { name: "寝室",                  lux: 100,  icon: "🛏" },
  { name: "子供部屋・勉強",        lux: 500,  icon: "📚" },
  { name: "書斎・在宅ワーク",      lux: 750,  icon: "💻" },
  { name: "トイレ",               lux: 100,  icon: "🚻" },
  { name: "浴室",                  lux: 200,  icon: "🛁" },
  { name: "廊下・玄関",           lux: 100,  icon: "🚪" },
  { name: "階段",                  lux: 150,  icon: "🪜" },
  { name: "店舗・商業",            lux: 750,  icon: "🏪" },
] as const;

const LIGHT_TYPES = [
  { name: "シーリングライト", lumenPerUnit: 4000, watt: 32 },
  { name: "ダウンライト",     lumenPerUnit: 600,  watt: 8 },
  { name: "ペンダントライト", lumenPerUnit: 2500, watt: 20 },
  { name: "スポットライト",   lumenPerUnit: 800,  watt: 10 },
  { name: "蛍光灯（直管）",  lumenPerUnit: 3000, watt: 32 },
  { name: "LED電球（E26）",  lumenPerUnit: 810,  watt: 8 },
] as const;

const MAINTENANCE_FACTOR = 0.75;   // 保守率（汚れ・経年劣化）
const UTILIZATION_FACTOR = 0.5;    // 光束利用率（部屋・反射率の平均）

export default function LumenRoom() {
  const [width, setWidth] = useState(4.5);        // m
  const [depth, setDepth] = useState(4.0);        // m
  const [useIdx, setUseIdx] = useState(0);
  const [lightTypeIdx, setLightTypeIdx] = useState(0);
  const [ceilingH, setCeilingH] = useState(2.4);  // m
  const [wallColor, setWallColor] = useState<"dark" | "medium" | "light">("light");

  const roomUse = ROOM_USES[useIdx];
  const lightType = LIGHT_TYPES[lightTypeIdx];

  const wallReflectance = { dark: 0.35, medium: 0.5, light: 0.7 }[wallColor];
  const adjustedUtilization = UTILIZATION_FACTOR * (0.6 + wallReflectance * 0.4) / 0.88;

  const result = useMemo(() => {
    const area = width * depth;
    const requiredLumens = (roomUse.lux * area) / (adjustedUtilization * MAINTENANCE_FACTOR);
    const unitsNeeded = Math.ceil(requiredLumens / lightType.lumenPerUnit);
    const totalWatt = unitsNeeded * lightType.watt;
    const luxPerUnit = (lightType.lumenPerUnit * adjustedUtilization * MAINTENANCE_FACTOR) / area;
    // Room Index (K): for utilization factor estimation
    const roomIndex = (width * depth) / (ceilingH * (width + depth));
    // Annual power cost (8h/day, ¥31/kWh)
    const annualCost = totalWatt * 8 * 365 / 1000 * 31;
    return { area, requiredLumens, unitsNeeded, totalWatt, luxPerUnit, roomIndex, annualCost };
  }, [width, depth, roomUse, lightType, adjustedUtilization, ceilingH]);

  return (
    <div className="space-y-6">
      {/* Room settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">部屋の設定</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">幅（m）</label>
            <input type="number" step={0.1} min={1} max={30}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={width} onChange={(e) => setWidth(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">奥行（m）</label>
            <input type="number" step={0.1} min={1} max={30}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={depth} onChange={(e) => setDepth(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">天井高（m）</label>
            <input type="number" step={0.1} min={2} max={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={ceilingH} onChange={(e) => setCeilingH(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">壁・床の色調</label>
            <div className="flex gap-1">
              {(["dark", "medium", "light"] as const).map((c) => (
                <button key={c} onClick={() => setWallColor(c)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    wallColor === c ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"
                  }`}>
                  {c === "dark" ? "濃色" : c === "medium" ? "中間" : "明色"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">部屋の用途</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {ROOM_USES.map((u, i) => (
              <button key={i} onClick={() => setUseIdx(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-colors text-left ${
                  useIdx === i ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}>
                <span>{u.icon}</span>
                <span className="leading-tight">{u.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Light type */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">照明器具の種類</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {LIGHT_TYPES.map((l, i) => (
            <button key={i} onClick={() => setLightTypeIdx(i)}
              className={`p-3 rounded-xl border-2 text-left transition-colors ${
                lightTypeIdx === i ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
              }`}>
              <div className="text-sm font-semibold text-gray-800">{l.name}</div>
              <div className="text-xs text-gray-500 mt-1">{l.lumenPerUnit.toLocaleString()} lm / {l.watt}W</div>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <ResultTile label="必要照度" value={`${roomUse.lux}`} unit="lux" color="blue" />
        <ResultTile label="床面積" value={`${result.area.toFixed(1)}`} unit="m²" color="gray" />
        <ResultTile label="必要ルーメン" value={result.requiredLumens.toFixed(0)} unit="lm" color="yellow" />
        <ResultTile label="推奨器具数" value={`${result.unitsNeeded}`} unit="台" color="green" highlight />
        <ResultTile label="合計消費電力" value={`${result.totalWatt}`} unit="W" color="purple" />
        <ResultTile label="年間電気代（目安）" value={`¥${result.annualCost.toFixed(0)}`} unit="/年" color="orange" />
      </div>

      {/* Detail */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">計算詳細</h2>
        <div className="space-y-2 text-sm">
          <DetailRow label="部屋用途" value={roomUse.name} />
          <DetailRow label="推奨照度" value={`${roomUse.lux} lux`} />
          <DetailRow label="1台あたりのルーメン" value={`${lightType.lumenPerUnit.toLocaleString()} lm`} />
          <DetailRow label="ルームインデックス (K)" value={result.roomIndex.toFixed(2)} />
          <DetailRow label="光束利用率（推定）" value={(adjustedUtilization * 100).toFixed(0) + "%"} />
          <DetailRow label="保守率" value={`${(MAINTENANCE_FACTOR * 100).toFixed(0)}%`} />
          <div className="pt-2 border-t border-gray-100 mt-2">
            <p className="text-xs text-gray-400">
              計算式: 必要lm = 照度(lux) × 面積(m²) ÷ (光束利用率 × 保守率)
            </p>
          </div>
        </div>
      </div>

      {/* Reference */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 overflow-x-auto">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">用途別推奨照度（JIS Z 9110）</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-amber-300 text-amber-700">
              <th className="text-left py-1.5 pr-4">用途</th>
              <th className="text-right py-1.5">推奨照度</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-200">
            {ROOM_USES.map((u, i) => (
              <tr key={i} className={useIdx === i ? "bg-amber-100 font-semibold" : ""}>
                <td className="py-1 pr-4 text-amber-800">{u.icon} {u.name}</td>
                <td className="py-1 text-right text-amber-800">{u.lux} lux</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResultTile({ label, value, unit, color, highlight }: {
  label: string; value: string; unit: string; color: string; highlight?: boolean;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200",
    gray: "bg-gray-50 border-gray-200",
    yellow: "bg-yellow-50 border-yellow-200",
    green: highlight ? "bg-green-100 border-green-400 border-2" : "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    orange: "bg-orange-50 border-orange-200",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400">{unit}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この照明 ルーメン必要量計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">部屋の広さ・用途別に必要ルーメンを計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この照明 ルーメン必要量計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "部屋の広さ・用途別に必要ルーメンを計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
