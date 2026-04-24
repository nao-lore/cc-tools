"use client";
import { useState, useMemo } from "react";

type AccessoryType = "bracelet" | "necklace" | "earring" | "anklet" | "custom";
type PatternType = "single" | "double" | "alternating" | "cluster";

interface BeadSize {
  label: string;
  mm: number;
}

const BEAD_SIZES: BeadSize[] = [
  { label: "2mm", mm: 2 },
  { label: "3mm", mm: 3 },
  { label: "4mm", mm: 4 },
  { label: "6mm", mm: 6 },
  { label: "8mm", mm: 8 },
  { label: "10mm", mm: 10 },
  { label: "12mm", mm: 12 },
  { label: "14mm", mm: 14 },
];

const ACCESSORY_TYPES: { type: AccessoryType; label: string; defaultLength: number }[] = [
  { type: "bracelet", label: "ブレスレット", defaultLength: 170 },
  { type: "necklace", label: "ネックレス", defaultLength: 400 },
  { type: "earring", label: "ピアス・イヤリング（片側）", defaultLength: 30 },
  { type: "anklet", label: "アンクレット", defaultLength: 220 },
  { type: "custom", label: "カスタムサイズ", defaultLength: 0 },
];

const PATTERN_MULTIPLIERS: Record<PatternType, { label: string; multiplier: number; note: string }> = {
  single: { label: "1連（シングル）", multiplier: 1, note: "標準的な1本通しデザイン" },
  double: { label: "2連（ダブル）", multiplier: 2, note: "糸を2本通すデザイン" },
  alternating: { label: "交互（2種類のビーズ）", multiplier: 1, note: "2種類のビーズを交互に使用" },
  cluster: { label: "クラスター", multiplier: 1.3, note: "中央に向けて多めに使用するデザイン" },
};

// Common bead materials for price reference
const BEAD_MATERIALS = [
  { label: "アクリル", pricePerBead: 5 },
  { label: "ガラス（小）", pricePerBead: 15 },
  { label: "ガラス（大）", pricePerBead: 30 },
  { label: "天然石", pricePerBead: 80 },
  { label: "淡水パール", pricePerBead: 60 },
  { label: "スワロフスキー", pricePerBead: 50 },
  { label: "木製", pricePerBead: 8 },
  { label: "シードビーズ", pricePerBead: 2 },
];

export default function BeadsAmount() {
  const [accessoryType, setAccessoryType] = useState<AccessoryType>("bracelet");
  const [customLength, setCustomLength] = useState(170);
  const [beadMm, setBeadMm] = useState(6);
  const [pattern, setPattern] = useState<PatternType>("single");
  const [quantity, setQuantity] = useState(1);
  const [materialIdx, setMaterialIdx] = useState(1);
  const [sparePercent, setSparePercent] = useState(10);
  const [customBeadPrice, setCustomBeadPrice] = useState<number | null>(null);

  const selectedAccessory = ACCESSORY_TYPES.find((a) => a.type === accessoryType)!;
  const length = accessoryType === "custom" ? customLength : selectedAccessory.defaultLength;

  const result = useMemo(() => {
    if (beadMm <= 0 || length <= 0) return null;

    const baseCount = Math.ceil(length / beadMm);
    const patternInfo = PATTERN_MULTIPLIERS[pattern];
    const withPattern = Math.ceil(baseCount * patternInfo.multiplier);
    const spareCount = Math.ceil(withPattern * (sparePercent / 100));
    const totalPerPiece = withPattern + spareCount;
    const totalAll = totalPerPiece * quantity;

    const pricePerBead = customBeadPrice ?? BEAD_MATERIALS[materialIdx].pricePerBead;
    const costPerPiece = totalPerPiece * pricePerBead;
    const costAll = totalAll * pricePerBead;

    // String length needed (+ extra 10cm for tying)
    const stringLength = length + 100;

    return {
      baseCount,
      withPattern,
      spareCount,
      totalPerPiece,
      totalAll,
      costPerPiece,
      costAll,
      stringLength,
      pricePerBead,
    };
  }, [beadMm, length, pattern, quantity, sparePercent, materialIdx, customBeadPrice]);

  return (
    <div className="space-y-5">
      {/* Accessory type */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">アクセサリーの種類</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ACCESSORY_TYPES.map((a) => (
            <button
              key={a.type}
              onClick={() => setAccessoryType(a.type)}
              className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all text-left ${accessoryType === a.type ? "bg-rose-600 text-white border-rose-600 shadow" : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"}`}
            >
              {a.label}
              {a.defaultLength > 0 && (
                <span className={`block text-xs mt-0.5 ${accessoryType === a.type ? "text-rose-200" : "text-gray-400"}`}>
                  標準 {a.defaultLength}mm
                </span>
              )}
            </button>
          ))}
        </div>
        {accessoryType === "custom" && (
          <div className="mt-4">
            <label className="text-xs font-medium text-gray-600 block mb-1">カスタム長さ（mm）</label>
            <input
              type="number"
              min={10}
              max={2000}
              value={customLength}
              onChange={(e) => setCustomLength(Number(e.target.value))}
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        )}
      </div>

      {/* Bead size */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">ビーズの直径</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {BEAD_SIZES.map((b) => (
            <button
              key={b.mm}
              onClick={() => setBeadMm(b.mm)}
              className={`w-14 h-14 rounded-full border-2 font-medium text-sm flex flex-col items-center justify-center transition-all ${beadMm === b.mm ? "border-rose-500 bg-rose-50 text-rose-700" : "border-gray-200 text-gray-600 hover:border-gray-400"}`}
              style={{ fontSize: Math.max(8, b.mm * 1.5) > 16 ? "16px" : `${Math.max(8, b.mm * 1.5)}px` }}
            >
              <span>{b.mm}</span>
              <span className="text-xs" style={{ fontSize: "10px" }}>mm</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">その他：</span>
          <input
            type="number"
            min={1}
            max={50}
            step={0.5}
            value={beadMm}
            onChange={(e) => setBeadMm(Number(e.target.value))}
            className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          <span className="text-xs text-gray-500">mm</span>
        </div>
      </div>

      {/* Pattern & quantity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">デザインパターン</h2>
          <div className="space-y-2">
            {(Object.entries(PATTERN_MULTIPLIERS) as [PatternType, typeof PATTERN_MULTIPLIERS[PatternType]][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setPattern(key)}
                className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${pattern === key ? "bg-rose-50 border-rose-300 text-rose-800" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
              >
                <div className="font-medium">{val.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{val.note}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">制作数</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center text-lg">−</button>
              <span className="text-xl font-bold text-gray-800 w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(100, quantity + 1))} className="w-9 h-9 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center text-lg">+</button>
              <span className="text-sm text-gray-500">個</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">予備の割合</label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setSparePercent(pct)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${sparePercent === pct ? "bg-rose-600 text-white border-rose-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
                >
                  +{pct}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">ビーズ素材</label>
            <select
              value={materialIdx}
              onChange={(e) => { setMaterialIdx(Number(e.target.value)); setCustomBeadPrice(null); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              {BEAD_MATERIALS.map((m, i) => (
                <option key={i} value={i}>{m.label}（約{m.pricePerBead}円/個）</option>
              ))}
            </select>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">カスタム単価:</span>
              <input
                type="number"
                min={0}
                placeholder="円"
                value={customBeadPrice ?? ""}
                onChange={(e) => setCustomBeadPrice(e.target.value ? Number(e.target.value) : null)}
                className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              <span className="text-xs text-gray-500">円/個</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-gradient-to-br from-rose-600 to-pink-600 rounded-2xl p-6 text-white">
          <p className="text-rose-200 text-sm mb-4 text-center">計算結果</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-xs text-rose-200">1個あたり</p>
              <p className="text-2xl font-bold">{result.totalPerPiece}</p>
              <p className="text-xs text-rose-200">個</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-xs text-rose-200">合計（{quantity}個分）</p>
              <p className="text-2xl font-bold">{result.totalAll}</p>
              <p className="text-xs text-rose-200">個</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-xs text-rose-200">材料費/個</p>
              <p className="text-2xl font-bold">{result.costPerPiece.toLocaleString()}</p>
              <p className="text-xs text-rose-200">円</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-xs text-rose-200">材料費合計</p>
              <p className="text-2xl font-bold">{result.costAll.toLocaleString()}</p>
              <p className="text-xs text-rose-200">円</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-3 text-sm">
            <div className="grid grid-cols-2 gap-2 text-rose-100">
              <div>デザイン分: <span className="font-bold text-white">{result.withPattern}個</span></div>
              <div>予備({sparePercent}%): <span className="font-bold text-white">+{result.spareCount}個</span></div>
              <div>テグス目安: <span className="font-bold text-white">{(result.stringLength / 10).toFixed(0)}cm以上</span></div>
              <div>ビーズ単価: <span className="font-bold text-white">{result.pricePerBead}円/個</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">制作のヒント</h3>
        <ul className="space-y-1.5 text-xs text-gray-600">
          <li>予備は最低10%確保すると安心。特に天然石は欠け・ロスが出やすい</li>
          <li>テグスはアクセサリーの長さ+15〜20cm余裕をもって用意する</li>
          <li>6mm以上のビーズはニッパーの噛み込みに注意</li>
          <li>シードビーズは数え間違いが多いため20%予備推奨</li>
        </ul>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このビーズ必要数計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">デザインサイズ・ビーズサイズから必要個数を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このビーズ必要数計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "デザインサイズ・ビーズサイズから必要個数を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ビーズ必要数計算",
  "description": "デザインサイズ・ビーズサイズから必要個数を計算",
  "url": "https://tools.loresync.dev/beads-amount",
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
