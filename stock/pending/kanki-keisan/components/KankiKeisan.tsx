"use client";
import { useState, useMemo } from "react";

// 建築基準法 換気計算
// 居室の換気設備: 換気口の面積は床面積の 1/20 以上 (自然換気)
// 機械換気: 必要換気量 = 床面積 × 天井高 × 換気回数

interface Room {
  id: number;
  name: string;
  area: number;       // m²
  ceilingH: number;   // m
  peopleCount: number; // 在室者数（CO2換気量計算用）
}

let nextRoomId = 2;

const ROOM_PRESETS = [
  { name: "居間・リビング", area: 20, ceilingH: 2.4, peopleCount: 4 },
  { name: "寝室", area: 10, ceilingH: 2.4, peopleCount: 2 },
  { name: "子供部屋", area: 8, ceilingH: 2.4, peopleCount: 1 },
  { name: "事務室", area: 30, ceilingH: 2.7, peopleCount: 6 },
];

// 第三種換気: 給気口 natural, 排気: 機械
// 第一種換気: 給排気とも機械

export default function KankiKeisan() {
  const [rooms, setRooms] = useState<Room[]>([
    { id: 1, name: "リビング", area: 20, ceilingH: 2.4, peopleCount: 4 },
  ]);
  const [ventType, setVentType] = useState<"natural" | "mechanical">("natural");
  const [exchangeRate, setExchangeRate] = useState(0.5); // 回/h

  function addRoom() {
    setRooms((prev) => [...prev, {
      id: nextRoomId++, name: `居室${prev.length + 1}`, area: 10, ceilingH: 2.4, peopleCount: 2,
    }]);
  }

  function removeRoom(id: number) {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  }

  function updateRoom(id: number, field: keyof Room, value: number | string) {
    setRooms((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
  }

  function applyPreset(presetIdx: number, roomId: number) {
    const p = ROOM_PRESETS[presetIdx];
    setRooms((prev) => prev.map((r) => r.id === roomId ? { ...r, ...p } : r));
  }

  const result = useMemo(() => {
    return rooms.map((r) => {
      const volume = r.area * r.ceilingH; // m³
      // 自然換気: 換気口面積 = 床面積 / 20
      const naturalVentArea_m2 = r.area / 20;
      const naturalVentArea_cm2 = naturalVentArea_m2 * 10000;
      // 機械換気: 必要換気量 = 体積 × 換気回数
      const mechanicalFlow_m3h = volume * exchangeRate;
      // CO2基準: 1人あたり 30m³/h (省エネ基準)
      const co2Flow_m3h = r.peopleCount * 30;
      const requiredFlow = Math.max(mechanicalFlow_m3h, co2Flow_m3h);
      // 換気回数
      const actualExchangeRate = requiredFlow / volume;
      return {
        ...r,
        volume,
        naturalVentArea_m2,
        naturalVentArea_cm2,
        mechanicalFlow_m3h,
        co2Flow_m3h,
        requiredFlow,
        actualExchangeRate,
      };
    });
  }, [rooms, exchangeRate]);

  const totals = useMemo(() => ({
    area: rooms.reduce((s, r) => s + r.area, 0),
    volume: result.reduce((s, r) => s + r.volume, 0),
    naturalVentArea_cm2: result.reduce((s, r) => s + r.naturalVentArea_cm2, 0),
    requiredFlow: result.reduce((s, r) => s + r.requiredFlow, 0),
  }), [rooms, result]);

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">換気方式</h2>
        <div className="flex gap-3 mb-4">
          <VentTypeBtn active={ventType === "natural"} onClick={() => setVentType("natural")} label="自然換気（窓・換気口）" />
          <VentTypeBtn active={ventType === "mechanical"} onClick={() => setVentType("mechanical")} label="機械換気（24時間換気）" />
        </div>
        {ventType === "mechanical" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              換気回数: {exchangeRate}回/h
            </label>
            <input
              type="range" min={0.1} max={3} step={0.1}
              value={exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0.1回/h（低）</span>
              <span>0.5回/h（基準）</span>
              <span>3回/h（高）</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">建築基準法の最低基準: 0.5回/h（シックハウス対策）</p>
          </div>
        )}
      </div>

      {/* Rooms */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">居室リスト</h2>
          <button onClick={addRoom} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            + 居室追加
          </button>
        </div>
        <div className="space-y-4">
          {rooms.map((r) => (
            <div key={r.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <input
                  className="text-sm font-semibold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 w-28"
                  value={r.name}
                  onChange={(e) => updateRoom(r.id, "name", e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <select
                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                    onChange={(e) => applyPreset(Number(e.target.value), r.id)}
                    defaultValue=""
                  >
                    <option value="" disabled>プリセット</option>
                    {ROOM_PRESETS.map((p, i) => (
                      <option key={i} value={i}>{p.name}</option>
                    ))}
                  </select>
                  {rooms.length > 1 && (
                    <button onClick={() => removeRoom(r.id)} className="text-red-400 hover:text-red-600 text-xs">削除</button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <RoomInput label="床面積（m²）" value={r.area} step={0.5} min={1}
                  onChange={(v) => updateRoom(r.id, "area", v)} />
                <RoomInput label="天井高（m）" value={r.ceilingH} step={0.1} min={1.8} max={6}
                  onChange={(v) => updateRoom(r.id, "ceilingH", v)} />
                <RoomInput label="在室人数" value={r.peopleCount} min={1} max={50}
                  onChange={(v) => updateRoom(r.id, "peopleCount", v)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results per room */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">計算結果</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600 text-xs">
                <th className="text-left py-2 pr-3">居室</th>
                <th className="text-right py-2 pr-3">体積</th>
                {ventType === "natural" ? (
                  <th className="text-right py-2">必要換気口面積</th>
                ) : (
                  <>
                    <th className="text-right py-2 pr-3">換気量（換気回数）</th>
                    <th className="text-right py-2 pr-3">換気量（CO₂）</th>
                    <th className="text-right py-2">必要換気量</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 pr-3 font-medium text-gray-800">{r.name}</td>
                  <td className="py-2 pr-3 text-right text-gray-600">{r.volume.toFixed(1)} m³</td>
                  {ventType === "natural" ? (
                    <td className="py-2 text-right font-semibold text-blue-700">
                      {r.naturalVentArea_cm2.toFixed(0)} cm²
                      <span className="text-xs text-gray-400 ml-1">({r.naturalVentArea_m2.toFixed(3)}m²)</span>
                    </td>
                  ) : (
                    <>
                      <td className="py-2 pr-3 text-right text-gray-600">{r.mechanicalFlow_m3h.toFixed(1)} m³/h</td>
                      <td className="py-2 pr-3 text-right text-gray-600">{r.co2Flow_m3h.toFixed(0)} m³/h</td>
                      <td className="py-2 text-right font-semibold text-blue-700">{r.requiredFlow.toFixed(1)} m³/h</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-300">
              <tr className="font-semibold">
                <td className="py-2 pr-3 text-gray-800">合計</td>
                <td className="py-2 pr-3 text-right text-gray-600">{totals.volume.toFixed(1)} m³</td>
                {ventType === "natural" ? (
                  <td className="py-2 text-right text-blue-700">{totals.naturalVentArea_cm2.toFixed(0)} cm²</td>
                ) : (
                  <>
                    <td className="py-2 pr-3" />
                    <td className="py-2 pr-3" />
                    <td className="py-2 text-right text-blue-700">{totals.requiredFlow.toFixed(1)} m³/h</td>
                  </>
                )}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="合計床面積" value={`${totals.area.toFixed(1)} m²`} />
        <SummaryCard label="合計室内容積" value={`${totals.volume.toFixed(1)} m³`} />
        {ventType === "natural"
          ? <SummaryCard label="合計必要換気口面積" value={`${totals.naturalVentArea_cm2.toFixed(0)} cm²`} highlight />
          : <SummaryCard label="合計必要換気量" value={`${totals.requiredFlow.toFixed(1)} m³/h`} highlight />
        }
      </div>

      {/* Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
        <p className="font-semibold mb-1">建築基準法 換気規定のポイント</p>
        <ul className="space-y-1 list-disc list-inside text-amber-700">
          <li>居室には床面積の1/20以上の換気口（自然換気）または機械換気設備が必要</li>
          <li>シックハウス対策として24時間換気（0.5回/h以上）が義務付けられています</li>
          <li>CO₂濃度基準: 在室者1人あたり30m³/h（学校環境衛生基準）</li>
          <li>計算結果は参考値です。確認申請には建築士による正式計算が必要です</li>
        </ul>
      </div>
    </div>
  );
}

function VentTypeBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
        active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
      }`}>
      {label}
    </button>
  );
}

function RoomInput({ label, value, onChange, step = 1, min, max }: {
  label: string; value: number; onChange: (v: number) => void;
  step?: number; min?: number; max?: number;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input type="number" step={step} min={min} max={max}
        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
        value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function SummaryCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${highlight ? "text-blue-700" : "text-gray-900"}`}>{value}</div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この換気計算（1/20ルール）ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">居室の必要換気量と換気開口面積を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この換気計算（1/20ルール）ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "居室の必要換気量と換気開口面積を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "換気計算（1/20ルール）",
  "description": "居室の必要換気量と換気開口面積を計算",
  "url": "https://tools.loresync.dev/kanki-keisan",
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
