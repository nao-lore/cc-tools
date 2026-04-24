"use client";
import { useState } from "react";

const FERTILIZER_PRESETS = [
  { name: "カスタム", concentration: null, ecFactor: null },
  { name: "ハイポネックス原液（6-10-5）", concentration: 100, ecFactor: 0.15 },
  { name: "ハイポネックス微粉（6.5-6-19）", concentration: 100, ecFactor: 0.17 },
  { name: "大塚ハウス1号（19-8-20）", concentration: 100, ecFactor: 0.20 },
  { name: "OATアグリオ花液（3-5-5）", concentration: 50, ecFactor: 0.10 },
  { name: "リキダス（腐植酸）", concentration: 50, ecFactor: 0.05 },
  { name: "液体カリグリーン（炭酸カリウム40%）", concentration: 50, ecFactor: 0.08 },
];

interface Fertilizer {
  id: number;
  presetIdx: number;
  name: string;
  stockConc: string; // 原液濃度 (倍)
  targetConc: string; // 目標濃度 (倍)
  totalVolume: string; // 作成量 (L)
}

let nextId = 1;

export default function YamoriHiryou() {
  const [fertilizers, setFertilizers] = useState<Fertilizer[]>([
    { id: nextId++, presetIdx: 1, name: "ハイポネックス原液", stockConc: "100", targetConc: "1000", totalVolume: "10" },
  ]);

  const addFertilizer = () => {
    setFertilizers(prev => [...prev, {
      id: nextId++,
      presetIdx: 0,
      name: "液肥名",
      stockConc: "100",
      targetConc: "1000",
      totalVolume: "10",
    }]);
  };

  const removeFertilizer = (id: number) => {
    setFertilizers(prev => prev.filter(f => f.id !== id));
  };

  const updateFertilizer = (id: number, field: keyof Fertilizer, value: string | number) => {
    setFertilizers(prev => prev.map(f => {
      if (f.id !== id) return f;
      if (field === "presetIdx") {
        const idx = value as number;
        const p = FERTILIZER_PRESETS[idx];
        return {
          ...f,
          presetIdx: idx,
          name: idx === 0 ? f.name : p.name,
          stockConc: p.concentration !== null ? String(p.concentration) : f.stockConc,
        };
      }
      return { ...f, [field]: value };
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">液肥設定</h2>
          <button
            onClick={addFertilizer}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            + 液肥を追加
          </button>
        </div>

        <div className="space-y-6">
          {fertilizers.map((f) => {
            const stockC = parseFloat(f.stockConc) || 0;
            const targetC = parseFloat(f.targetConc) || 0;
            const totalV = parseFloat(f.totalVolume) || 0;

            // 希釈倍率 = targetConc / 1 (target is dilution ratio)
            // originalVolume / totalVolume = 1 / dilutionRatio
            // dilutionRatio = targetConc (if stockConc = 100 times)
            // actualRatio = targetConc / stockConc
            const dilutionRatio = targetC / stockC;
            const stockVolumeL = totalV / dilutionRatio;
            const waterVolumeL = totalV - stockVolumeL;

            const stockVolumeMl = stockVolumeL * 1000;
            const waterVolumeMl = waterVolumeL * 1000;

            const isValid = stockC > 0 && targetC >= stockC && totalV > 0;
            const preset = FERTILIZER_PRESETS[f.presetIdx];

            return (
              <div key={f.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <select
                      value={f.presetIdx}
                      onChange={(e) => updateFertilizer(f.id, "presetIdx", parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white mb-2"
                    >
                      {FERTILIZER_PRESETS.map((p, i) => (
                        <option key={i} value={i}>{p.name}</option>
                      ))}
                    </select>
                    {f.presetIdx === 0 && (
                      <input
                        type="text"
                        value={f.name}
                        onChange={(e) => updateFertilizer(f.id, "name", e.target.value)}
                        placeholder="液肥の名前"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    )}
                  </div>
                  {fertilizers.length > 1 && (
                    <button
                      onClick={() => removeFertilizer(f.id)}
                      className="ml-3 text-red-400 hover:text-red-600 text-sm px-2 py-1"
                    >
                      削除
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      原液倍率
                      <span className="text-xs text-gray-400 ml-1">（原液をこの倍率で希釈したもの）</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={f.stockConc}
                        onChange={(e) => updateFertilizer(f.id, "stockConc", e.target.value)}
                        min={1}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <span className="absolute right-3 top-2.5 text-gray-400 text-sm">倍</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">目標希釈倍率</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={f.targetConc}
                        onChange={(e) => updateFertilizer(f.id, "targetConc", e.target.value)}
                        min={1}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                      <span className="absolute right-3 top-2.5 text-gray-400 text-sm">倍</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {dilutionRatio > 1 ? `原液の ${dilutionRatio.toFixed(0)} 倍希釈` : ""}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">作成量（L）</label>
                    <input
                      type="number"
                      value={f.totalVolume}
                      onChange={(e) => updateFertilizer(f.id, "totalVolume", e.target.value)}
                      min={0.1}
                      step={0.5}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                {isValid ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
                      <p className="text-xs text-green-600 font-medium">原液の量</p>
                      <p className="text-2xl font-bold font-mono text-green-700 mt-1">
                        {stockVolumeMl >= 1000
                          ? `${stockVolumeL.toFixed(3)} L`
                          : `${stockVolumeMl.toFixed(1)} mL`}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
                      <p className="text-xs text-blue-600 font-medium">加える水の量</p>
                      <p className="text-2xl font-bold font-mono text-blue-700 mt-1">
                        {waterVolumeMl >= 1000
                          ? `${waterVolumeL.toFixed(2)} L`
                          : `${waterVolumeMl.toFixed(0)} mL`}
                      </p>
                    </div>
                    <div className="col-span-2 bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 text-center">
                        作成手順: 原液 <strong>{stockVolumeMl.toFixed(1)} mL</strong> に水を加えて合計 <strong>{totalV} L</strong> にする
                        {preset.ecFactor && (
                          <span className="ml-2">（目安EC: {(preset.ecFactor * dilutionRatio / (targetC / stockC)).toFixed(2)} mS/cm）</span>
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3 text-gray-400 text-sm">
                    {!isValid && targetC < stockC ? "目標倍率は原液倍率以上にしてください" : "値を入力してください"}
                  </div>
                )}
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この液肥希釈倍率計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">液肥を目標濃度に希釈するための水量・原液量を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この液肥希釈倍率計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "液肥を目標濃度に希釈するための水量・原液量を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">よく使う希釈倍率の目安</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 text-gray-600">作物・用途</th>
                <th className="text-right px-3 py-2 text-gray-600">希釈倍率</th>
                <th className="text-right px-3 py-2 text-gray-600">10L作成時の原液量</th>
              </tr>
            </thead>
            <tbody>
              {[
                { use: "観葉植物（標準）", ratio: 1000 },
                { use: "野菜・果菜（標準）", ratio: 500 },
                { use: "水耕栽培（標準）", ratio: 300 },
                { use: "育苗期", ratio: 2000 },
                { use: "花卉（開花促進）", ratio: 500 },
              ].map((row) => (
                <tr key={row.use} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-700">{row.use}</td>
                  <td className="px-3 py-2 text-right font-mono text-gray-700">{row.ratio}倍</td>
                  <td className="px-3 py-2 text-right font-mono text-gray-700">{(10000 / row.ratio).toFixed(0)} mL</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">※ 希釈倍率は各製品の説明書を優先してください。上記は一般的な目安です。</p>
      </div>
    </div>
  );
}
