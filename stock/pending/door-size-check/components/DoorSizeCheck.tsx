"use client";
import { useState } from "react";

type PassResult = "ok" | "ng" | "caution";

interface CheckResult {
  label: string;
  result: PassResult;
  message: string;
  detail?: string;
}

const FURNITURE_PRESETS = [
  { name: "カスタム", w: "", h: "", d: "" },
  { name: "シングルベッド", w: "97", h: "90", d: "195" },
  { name: "セミダブルベッド", w: "120", h: "90", d: "195" },
  { name: "ダブルベッド", w: "140", h: "90", d: "195" },
  { name: "ソファ（2人掛け）", w: "140", h: "85", d: "85" },
  { name: "ソファ（3人掛け）", w: "190", h: "85", d: "85" },
  { name: "冷蔵庫（400L級）", w: "65", h: "182", d: "70" },
  { name: "洗濯機（ドラム式）", w: "60", h: "105", d: "65" },
  { name: "食洗機（卓上）", w: "55", h: "60", d: "60" },
  { name: "デスク（一般的）", w: "120", h: "72", d: "60" },
];

function checkPassage(
  furnitureW: number,
  furnitureH: number,
  furnitureD: number,
  doorW: number,
  doorH: number,
  corridorW: number
): CheckResult[] {
  const results: CheckResult[] = [];
  const margin = 3; // cm clearance

  // ドアを縦向きに通過（幅×高さ）
  const canPassDoorUpright: PassResult =
    furnitureW + margin <= doorW && furnitureH + margin <= doorH ? "ok" :
    furnitureW + margin <= doorW + 5 || furnitureH + margin <= doorH + 5 ? "caution" : "ng";

  results.push({
    label: "ドア通過（正面・縦置き）",
    result: canPassDoorUpright,
    message: canPassDoorUpright === "ok"
      ? `クリアランス: 幅${(doorW - furnitureW).toFixed(0)}cm / 高さ${(doorH - furnitureH).toFixed(0)}cm`
      : canPassDoorUpright === "caution"
      ? "ギリギリです。養生が必要です"
      : `不足: 幅${Math.max(0, furnitureW - doorW + margin).toFixed(0)}cm / 高さ${Math.max(0, furnitureH - doorH + margin).toFixed(0)}cm`,
    detail: `家具: ${furnitureW}×${furnitureH}cm / ドア: ${doorW}×${doorH}cm`,
  });

  // 横倒しにしてドア通過（奥行×幅）
  const canPassDoorSide: PassResult =
    furnitureD + margin <= doorW && furnitureW + margin <= doorH ? "ok" :
    furnitureD + margin <= doorW + 5 ? "caution" : "ng";

  results.push({
    label: "ドア通過（横倒し）",
    result: canPassDoorSide,
    message: canPassDoorSide === "ok"
      ? `横倒しで通過可能（奥行き${furnitureD}cm → ドア幅${doorW}cm）`
      : canPassDoorSide === "caution"
      ? "横倒しでギリギリです"
      : `横倒しでも不可（奥行き${furnitureD}cm > ドア幅${doorW}cm）`,
  });

  // 廊下の幅（正面向き）
  const canPassCorridor: PassResult =
    furnitureD + margin <= corridorW ? "ok" :
    furnitureD + margin <= corridorW + 5 ? "caution" : "ng";

  results.push({
    label: "廊下通過（正面向き）",
    result: canPassCorridor,
    message: canPassCorridor === "ok"
      ? `廊下クリアランス: ${(corridorW - furnitureD).toFixed(0)}cm`
      : canPassCorridor === "caution"
      ? "ギリギリです。横向きに変更も検討を"
      : `廊下幅が不足（奥行き${furnitureD}cm vs 廊下${corridorW}cm）`,
    detail: `廊下幅: ${corridorW}cm / 家具奥行き: ${furnitureD}cm`,
  });

  // 廊下の幅（横向き）
  const canPassCorridorSide: PassResult =
    furnitureW + margin <= corridorW ? "ok" :
    furnitureW + margin <= corridorW + 5 ? "caution" : "ng";

  results.push({
    label: "廊下通過（横向き）",
    result: canPassCorridorSide,
    message: canPassCorridorSide === "ok"
      ? `横向きで廊下通過可能`
      : canPassCorridorSide === "caution"
      ? "横向きでもギリギリです"
      : `横向きでも廊下幅が不足（幅${furnitureW}cm vs 廊下${corridorW}cm）`,
  });

  return results;
}

const statusStyles: Record<PassResult, { bg: string; text: string; badge: string; icon: string }> = {
  ok: { bg: "bg-green-50 border-green-200", text: "text-green-800", badge: "bg-green-100 text-green-700", icon: "OK" },
  caution: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", badge: "bg-amber-100 text-amber-700", icon: "注意" },
  ng: { bg: "bg-red-50 border-red-200", text: "text-red-800", badge: "bg-red-100 text-red-700", icon: "NG" },
};

export default function DoorSizeCheck() {
  const [preset, setPreset] = useState(0);
  const [furnitureW, setFurnitureW] = useState("97");
  const [furnitureH, setFurnitureH] = useState("90");
  const [furnitureD, setFurnitureD] = useState("195");
  const [doorW, setDoorW] = useState("80");
  const [doorH, setDoorH] = useState("200");
  const [corridorW, setCorridorW] = useState("90");

  const handlePreset = (idx: number) => {
    setPreset(idx);
    const p = FURNITURE_PRESETS[idx];
    if (p.w) setFurnitureW(p.w);
    if (p.h) setFurnitureH(p.h);
    if (p.d) setFurnitureD(p.d);
  };

  const fw = parseFloat(furnitureW) || 0;
  const fh = parseFloat(furnitureH) || 0;
  const fd = parseFloat(furnitureD) || 0;
  const dw = parseFloat(doorW) || 0;
  const dh = parseFloat(doorH) || 0;
  const cw = parseFloat(corridorW) || 0;

  const isValid = fw > 0 && fh > 0 && fd > 0 && dw > 0 && dh > 0 && cw > 0;
  const results = isValid ? checkPassage(fw, fh, fd, dw, dh, cw) : [];
  const allOk = results.every((r) => r.result === "ok");
  const hasNg = results.some((r) => r.result === "ng");

  return (
    <div className="space-y-6">
      {/* 家具サイズ */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">家具のサイズ（cm）</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">プリセット</label>
          <select
            value={preset}
            onChange={(e) => handlePreset(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {FURNITURE_PRESETS.map((p, i) => (
              <option key={i} value={i}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "幅（W）", value: furnitureW, set: setFurnitureW },
            { label: "高さ（H）", value: furnitureH, set: setFurnitureH },
            { label: "奥行き（D）", value: furnitureD, set: setFurnitureD },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div className="relative">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => { setPreset(0); set(e.target.value); }}
                  min={1}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 text-sm">cm</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 搬入経路 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">搬入経路のサイズ（cm）</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "ドア幅（有効開口）", value: doorW, set: setDoorW, hint: "一般的な室内ドア: 75〜80cm" },
            { label: "ドア高さ（有効開口）", value: doorH, set: setDoorH, hint: "一般的な室内ドア: 200〜210cm" },
            { label: "廊下幅", value: corridorW, set: setCorridorW, hint: "一般的な廊下: 80〜90cm" },
          ].map(({ label, value, set, hint }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div className="relative">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  min={1}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 text-sm">cm</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 判定結果 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">搬入可否判定</h2>
        {isValid ? (
          <div className="space-y-3">
            <div className={`rounded-lg p-4 mb-4 border ${allOk ? "bg-green-50 border-green-300" : hasNg ? "bg-red-50 border-red-300" : "bg-amber-50 border-amber-300"}`}>
              <p className={`font-bold text-lg ${allOk ? "text-green-700" : hasNg ? "text-red-700" : "text-amber-700"}`}>
                {allOk ? "全パターンで搬入可能です" : hasNg ? "一部のパターンで搬入困難です" : "ギリギリのパターンがあります。要注意"}
              </p>
            </div>
            {results.map((r, i) => {
              const s = statusStyles[r.result];
              return (
                <div key={i} className={`rounded-lg p-4 border ${s.bg}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium ${s.text}`}>{r.label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{s.icon}</span>
                  </div>
                  <p className={`text-sm ${s.text}`}>{r.message}</p>
                  {r.detail && <p className={`text-xs mt-1 opacity-70 ${s.text}`}>{r.detail}</p>}
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この搬入ドアサイズチェッカーツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">家具サイズと搬入経路（ドア・廊下・階段）の通過可否を判定。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この搬入ドアサイズチェッカーツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "家具サイズと搬入経路（ドア・廊下・階段）の通過可否を判定。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
              );
            })}
            <div className="bg-gray-50 rounded-lg p-4 mt-2">
              <p className="text-xs text-gray-500">
                ※ 余裕は3cmとして計算しています。実際の搬入時は養生・梱包材を考慮して追加で5〜10cmの余裕を確保することを推奨します。
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            家具と搬入経路のサイズを入力してください
          </div>
        )}
      </div>
    </div>
  );
}
