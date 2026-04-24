"use client";
import { useState } from "react";

const USE_PRESETS = [
  { name: "住宅（居室）", liveLoad: 130, deadLoad: 130 },
  { name: "住宅（非居室・廊下）", liveLoad: 180, deadLoad: 130 },
  { name: "事務所", liveLoad: 290, deadLoad: 150 },
  { name: "百貨店・店舗", liveLoad: 490, deadLoad: 200 },
  { name: "倉庫（軽量）", liveLoad: 590, deadLoad: 150 },
  { name: "倉庫（重量）", liveLoad: 980, deadLoad: 200 },
  { name: "カスタム", liveLoad: null, deadLoad: null },
];

const SNOW_REGIONS = [
  { name: "積雪なし（非積雪地域）", snowLoad: 0 },
  { name: "一般地域（〜1m積雪）", snowLoad: 100 },
  { name: "多雪地域（1〜2m積雪）", snowLoad: 200 },
  { name: "特定多雪地域（2m以上）", snowLoad: 350 },
  { name: "カスタム", snowLoad: null },
];

export default function StructureWeight() {
  const [usePreset, setUsePreset] = useState(0);
  const [customLive, setCustomLive] = useState("130");
  const [customDead, setCustomDead] = useState("130");
  const [snowRegion, setSnowRegion] = useState(0);
  const [customSnow, setCustomSnow] = useState("0");
  const [floorArea, setFloorArea] = useState("30");
  const [includeWind, setIncludeWind] = useState(false);
  const [windLoad, setWindLoad] = useState("60");
  const [includeSeismic, setIncludeSeismic] = useState(false);
  const [seismicZone, setSeismicZone] = useState("1.0");

  const preset = USE_PRESETS[usePreset];
  const liveLoad = preset.liveLoad !== null ? preset.liveLoad : parseFloat(customLive) || 0;
  const deadLoad = preset.deadLoad !== null ? preset.deadLoad : parseFloat(customDead) || 0;
  const snowPreset = SNOW_REGIONS[snowRegion];
  const snowLoad = snowPreset.snowLoad !== null ? snowPreset.snowLoad : parseFloat(customSnow) || 0;
  const area = parseFloat(floorArea) || 0;
  const wind = includeWind ? parseFloat(windLoad) || 0 : 0;
  const seismic = includeSeismic ? parseFloat(seismicZone) || 1.0 : 1.0;

  const totalPerArea = liveLoad + deadLoad + snowLoad + wind;
  const totalLoad = (totalPerArea * area) / 100; // kN (kgf/m² → kN)
  const designLoad = totalLoad * seismic;

  const isValid = area > 0;

  const loads = [
    { label: "積載荷重（Live Load）", value: liveLoad, unit: "kgf/m²", color: "bg-blue-100 text-blue-800" },
    { label: "固定荷重（Dead Load）", value: deadLoad, unit: "kgf/m²", color: "bg-green-100 text-green-800" },
    { label: "積雪荷重（Snow Load）", value: snowLoad, unit: "kgf/m²", color: "bg-cyan-100 text-cyan-800" },
    ...(includeWind ? [{ label: "風荷重（Wind Load）", value: wind, unit: "kgf/m²", color: "bg-purple-100 text-purple-800" }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* 用途設定 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">建物用途・荷重設定</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">建物用途</label>
            <select
              value={usePreset}
              onChange={(e) => setUsePreset(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {USE_PRESETS.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">計算面積（m²）</label>
            <input
              type="number"
              value={floorArea}
              onChange={(e) => setFloorArea(e.target.value)}
              min={0.1}
              step={0.5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {USE_PRESETS[usePreset].liveLoad === null && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">積載荷重（kgf/m²）</label>
                <input
                  type="number"
                  value={customLive}
                  onChange={(e) => setCustomLive(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">固定荷重（kgf/m²）</label>
                <input
                  type="number"
                  value={customDead}
                  onChange={(e) => setCustomDead(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* 積雪・風・地震 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">地域荷重設定</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">積雪地域</label>
            <select
              value={snowRegion}
              onChange={(e) => setSnowRegion(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SNOW_REGIONS.map((r, i) => (
                <option key={i} value={i}>{r.name}</option>
              ))}
            </select>
            {SNOW_REGIONS[snowRegion].snowLoad === null && (
              <div className="mt-2">
                <label className="block text-xs text-gray-600 mb-1">積雪荷重（kgf/m²）</label>
                <input
                  type="number"
                  value={customSnow}
                  onChange={(e) => setCustomSnow(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                <input type="checkbox" checked={includeWind} onChange={(e) => setIncludeWind(e.target.checked)} className="rounded" />
                風荷重を含める
              </label>
              {includeWind && (
                <div className="relative">
                  <input
                    type="number"
                    value={windLoad}
                    onChange={(e) => setWindLoad(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 text-sm">kgf/m²</span>
                </div>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                <input type="checkbox" checked={includeSeismic} onChange={(e) => setIncludeSeismic(e.target.checked)} className="rounded" />
                地震地域係数を適用
              </label>
              {includeSeismic && (
                <select
                  value={seismicZone}
                  onChange={(e) => setSeismicZone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1.0">Z=1.0（標準地域）</option>
                  <option value="0.9">Z=0.9</option>
                  <option value="0.8">Z=0.8</option>
                  <option value="0.7">Z=0.7（沖縄等）</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 計算結果 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">荷重計算結果</h2>
        {isValid ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {loads.map((l) => (
                <div key={l.label} className={`rounded-lg p-3 ${l.color}`}>
                  <p className="text-xs font-medium opacity-80">{l.label}</p>
                  <p className="text-lg font-bold font-mono">{l.value.toLocaleString()}</p>
                  <p className="text-xs opacity-70">{l.unit}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
                <span className="text-gray-600 text-sm">合計単位荷重</span>
                <span className="font-mono font-semibold">{totalPerArea.toLocaleString()} kgf/m²</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
                <span className="text-gray-600 text-sm">計算面積</span>
                <span className="font-mono font-semibold">{area} m²</span>
              </div>
              <div className="flex justify-between items-center bg-blue-50 rounded-lg px-4 py-4 border border-blue-200">
                <span className="text-blue-800 font-semibold">合計設計荷重</span>
                <div className="text-right">
                  <span className="font-mono font-bold text-blue-700 text-xl">{totalLoad.toFixed(1)} kN</span>
                  <p className="text-blue-600 text-xs">= {(totalLoad * 1000 / 9.8).toFixed(0)} kgf</p>
                </div>
              </div>
              {includeSeismic && (
                <div className="flex justify-between items-center bg-orange-50 rounded-lg px-4 py-3 border border-orange-200">
                  <span className="text-orange-800 text-sm">地震係数適用後（Z={seismicZone}）</span>
                  <span className="font-mono font-semibold text-orange-700">{designLoad.toFixed(1)} kN</span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mt-2">
              <p className="text-xs text-gray-500">
                ※ 本計算は概算値です。実際の構造計算は建築士による正式な構造計算を行ってください。
                荷重値は建築基準法施行令第85条を参考にしています。
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">計算面積を入力してください</div>
        )}
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この構造荷重簡易計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">積載荷重・固定荷重・積雪荷重を合算して床・屋根の設計荷重を算出。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この構造荷重簡易計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "積載荷重・固定荷重・積雪荷重を合算して床・屋根の設計荷重を算出。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
