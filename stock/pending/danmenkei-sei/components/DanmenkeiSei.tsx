"use client";
import { useState } from "react";

type SectionType = "rect" | "circle" | "hollow_rect" | "h_section" | "i_section";

const SECTION_TYPES: { id: SectionType; label: string; desc: string }[] = [
  { id: "rect", label: "矩形断面", desc: "幅×高さの長方形" },
  { id: "circle", label: "円形断面", desc: "丸棒・円管（中実）" },
  { id: "hollow_rect", label: "中空矩形", desc: "角パイプ・中空断面" },
  { id: "h_section", label: "H形断面", desc: "H鋼・H型鋼" },
  { id: "i_section", label: "I形断面", desc: "I形断面梁" },
];

const MATERIALS = [
  { name: "木材（ヒノキ）", E: 9000 },
  { name: "木材（スギ）", E: 7000 },
  { name: "木材（集成材）", E: 10000 },
  { name: "鉄骨（SS400）", E: 205000 },
  { name: "アルミ合金", E: 70000 },
  { name: "コンクリート（普通）", E: 24000 },
  { name: "カスタム", E: null },
];

function calcSection(type: SectionType, dims: Record<string, number>) {
  let I = 0; // 断面二次モーメント (mm⁴)
  let A = 0; // 断面積 (mm²)
  let y = 0; // 中立軸から端まで距離 (mm)

  switch (type) {
    case "rect": {
      const { b, h } = dims;
      I = (b * Math.pow(h, 3)) / 12;
      A = b * h;
      y = h / 2;
      break;
    }
    case "circle": {
      const { d } = dims;
      I = (Math.PI * Math.pow(d, 4)) / 64;
      A = (Math.PI * Math.pow(d, 2)) / 4;
      y = d / 2;
      break;
    }
    case "hollow_rect": {
      const { B, H, t } = dims;
      const b = B - 2 * t;
      const h = H - 2 * t;
      I = (B * Math.pow(H, 3) - b * Math.pow(h, 3)) / 12;
      A = B * H - b * h;
      y = H / 2;
      break;
    }
    case "h_section": {
      const { B, H, tw, tf } = dims;
      const hw = H - 2 * tf;
      I = (B * Math.pow(H, 3) - (B - tw) * Math.pow(hw, 3)) / 12;
      A = 2 * B * tf + hw * tw;
      y = H / 2;
      break;
    }
    case "i_section": {
      const { B, H, tw, tf } = dims;
      const hw = H - 2 * tf;
      I = (B * Math.pow(H, 3) - (B - tw) * Math.pow(hw, 3)) / 12;
      A = 2 * B * tf + hw * tw;
      y = H / 2;
      break;
    }
  }

  const Z = y > 0 ? I / y : 0; // 断面係数 (mm³)
  return { I, Z, A, y };
}

export default function DanmenkeiSei() {
  const [sectionType, setSectionType] = useState<SectionType>("rect");
  const [materialIdx, setMaterialIdx] = useState(0);
  const [customE, setCustomE] = useState("10000");
  const [spanL, setSpanL] = useState("3000");

  // dimensions
  const [b, setB] = useState("100");
  const [h, setH] = useState("150");
  const [d, setD] = useState("100");
  const [B, setLB] = useState("100");
  const [H, setLH] = useState("150");
  const [t, setT] = useState("5");
  const [tw, setTw] = useState("8");
  const [tf, setTf] = useState("13");

  const getDims = (): Record<string, number> => {
    switch (sectionType) {
      case "rect": return { b: parseFloat(b) || 0, h: parseFloat(h) || 0 };
      case "circle": return { d: parseFloat(d) || 0 };
      case "hollow_rect": return { B: parseFloat(B) || 0, H: parseFloat(H) || 0, t: parseFloat(t) || 0 };
      case "h_section":
      case "i_section": return { B: parseFloat(B) || 0, H: parseFloat(H) || 0, tw: parseFloat(tw) || 0, tf: parseFloat(tf) || 0 };
    }
  };

  const E = MATERIALS[materialIdx].E !== null ? MATERIALS[materialIdx].E! : parseFloat(customE) || 0;
  const L = parseFloat(spanL) || 0;
  const dims = getDims();
  const { I, Z, A } = calcSection(sectionType, dims);

  const isValid = I > 0 && Z > 0;

  // 単純梁の最大たわみ係数（等分布荷重 w kN/m、スパン L mm）
  // δ_max = 5wL⁴ / (384EI)
  // For display: show for w=1 kN/m
  const deflectionPerW = L > 0 && E > 0 && I > 0
    ? (5 * 1 * Math.pow(L, 4)) / (384 * (E) * I) // mm per kN/m (E in N/mm²=MPa, w in N/mm=kN/m)
    : 0;

  const fmt = (n: number, dec = 1) => n.toLocaleString("ja-JP", { maximumFractionDigits: dec, minimumFractionDigits: dec });

  return (
    <div className="space-y-6">
      {/* 断面形状選択 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">断面形状</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
          {SECTION_TYPES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSectionType(s.id)}
              className={`rounded-lg p-3 text-center border-2 transition-colors ${
                sectionType === s.id
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <div className="font-medium text-sm">{s.label}</div>
              <div className="text-xs opacity-70 mt-0.5">{s.desc}</div>
            </button>
          ))}
        </div>

        {/* 寸法入力 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sectionType === "rect" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">幅 b（mm）</label>
                <input type="number" value={b} onChange={(e) => setB(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">高さ h（mm）</label>
                <input type="number" value={h} onChange={(e) => setH(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}
          {sectionType === "circle" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">直径 d（mm）</label>
              <input type="number" value={d} onChange={(e) => setD(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          {sectionType === "hollow_rect" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">外幅 B（mm）</label>
                <input type="number" value={B} onChange={(e) => setLB(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">外高 H（mm）</label>
                <input type="number" value={H} onChange={(e) => setLH(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">板厚 t（mm）</label>
                <input type="number" value={t} onChange={(e) => setT(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}
          {(sectionType === "h_section" || sectionType === "i_section") && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">フランジ幅 B（mm）</label>
                <input type="number" value={B} onChange={(e) => setLB(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">全高 H（mm）</label>
                <input type="number" value={H} onChange={(e) => setLH(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ウェブ厚 tw（mm）</label>
                <input type="number" value={tw} onChange={(e) => setTw(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">フランジ厚 tf（mm）</label>
                <input type="number" value={tf} onChange={(e) => setTf(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* 材料・スパン */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">材料・スパン（たわみ計算用）</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">材料（ヤング係数）</label>
            <select
              value={materialIdx}
              onChange={(e) => setMaterialIdx(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MATERIALS.map((m, i) => (
                <option key={i} value={i}>{m.name}{m.E ? ` (E=${m.E} N/mm²)` : ""}</option>
              ))}
            </select>
            {MATERIALS[materialIdx].E === null && (
              <div className="mt-2">
                <label className="block text-xs text-gray-600 mb-1">ヤング係数 E（N/mm²）</label>
                <input type="number" value={customE} onChange={(e) => setCustomE(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">スパン L（mm）</label>
            <input type="number" value={spanL} onChange={(e) => setSpanL(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* 計算結果 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">断面計算結果</h2>
        {isValid ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-blue-600 font-medium">断面二次モーメント I</p>
                <p className="text-xl font-bold font-mono text-blue-800 mt-1">{fmt(I / 1e4, 2)} cm⁴</p>
                <p className="text-xs text-blue-500 mt-1">{fmt(I, 0)} mm⁴</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-xs text-green-600 font-medium">断面係数 Z</p>
                <p className="text-xl font-bold font-mono text-green-800 mt-1">{fmt(Z / 1e3, 2)} cm³</p>
                <p className="text-xs text-green-500 mt-1">{fmt(Z, 0)} mm³</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-xs text-purple-600 font-medium">断面積 A</p>
                <p className="text-xl font-bold font-mono text-purple-800 mt-1">{fmt(A / 100, 2)} cm²</p>
                <p className="text-xs text-purple-500 mt-1">{fmt(A, 0)} mm²</p>
              </div>
            </div>

            {L > 0 && E > 0 && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mt-2">
                <p className="text-sm font-medium text-amber-800 mb-2">等分布荷重 1 kN/m 時の最大たわみ（単純梁）</p>
                <p className="text-2xl font-bold font-mono text-amber-700">{deflectionPerW.toFixed(2)} mm</p>
                <p className="text-xs text-amber-600 mt-1">
                  δ_max = 5wL⁴ / (384EI) — スパン {(L / 1000).toFixed(2)} m、E={E.toLocaleString()} N/mm²
                </p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500">
                ※ 本計算は強軸（x軸）回りの値です。実際の設計では許容曲げ応力度、許容たわみ量（スパン/300等）との照合が必要です。
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">断面寸法を入力してください</div>
        )}
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この断面係数計算（梁）ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">梁の断面形状から断面係数・断面二次モーメント・断面積を算出。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この断面係数計算（梁）ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "梁の断面形状から断面係数・断面二次モーメント・断面積を算出。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
