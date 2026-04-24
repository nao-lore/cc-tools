"use client";

import { useState, useMemo } from "react";

type HardnessCategory = {
  label: string;
  range: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
  min: number;
  max: number;
};

const CATEGORIES: HardnessCategory[] = [
  {
    label: "軟水",
    range: "0〜60",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    badgeClass: "bg-blue-100 text-blue-700",
    min: 0,
    max: 60,
  },
  {
    label: "中程度の硬水",
    range: "60〜120",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    badgeClass: "bg-green-100 text-green-700",
    min: 60,
    max: 120,
  },
  {
    label: "硬水",
    range: "120〜180",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    badgeClass: "bg-yellow-100 text-yellow-700",
    min: 120,
    max: 180,
  },
  {
    label: "非常な硬水",
    range: "180〜",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    badgeClass: "bg-red-100 text-red-700",
    min: 180,
    max: Infinity,
  },
];

const REFERENCE_WATERS = [
  { name: "いろはす", hardness: 27 },
  { name: "南アルプス天然水", hardness: 30 },
  { name: "エビアン", hardness: 304 },
  { name: "コントレックス", hardness: 1468 },
];

function getCategory(hardness: number): HardnessCategory {
  return (
    CATEGORIES.find((c) => hardness >= c.min && hardness < c.max) ??
    CATEGORIES[CATEGORIES.length - 1]
  );
}

// Scale: 0–500 for display (clamp)
function gaugePosition(hardness: number): number {
  const scaleMax = 500;
  return Math.min(100, Math.max(0, (hardness / scaleMax) * 100));
}

const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent pr-16";

export default function WaterHardness() {
  const [ca, setCa] = useState("");
  const [mg, setMg] = useState("");

  const result = useMemo(() => {
    const caVal = parseFloat(ca);
    const mgVal = parseFloat(mg);
    if (isNaN(caVal) || isNaN(mgVal) || caVal < 0 || mgVal < 0) return null;
    if (ca === "" && mg === "") return null;
    const caSafe = isNaN(caVal) ? 0 : caVal;
    const mgSafe = isNaN(mgVal) ? 0 : mgVal;
    const hardness = caSafe * 2.5 + mgSafe * 4.1;
    const category = getCategory(hardness);
    return { hardness, category, gaugePos: gaugePosition(hardness) };
  }, [ca, mg]);

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h2 className="font-bold text-base mb-4">イオン濃度を入力</h2>

        <div className="space-y-4">
          {/* Calcium */}
          <div>
            <label className="block text-xs text-muted mb-1">
              カルシウム濃度（Ca²⁺）
            </label>
            <div className="relative max-w-[220px]">
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={ca}
                onChange={(e) => setCa(e.target.value.replace(/[^0-9.]/g, ""))}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                mg/L
              </span>
            </div>
          </div>

          {/* Magnesium */}
          <div>
            <label className="block text-xs text-muted mb-1">
              マグネシウム濃度（Mg²⁺）
            </label>
            <div className="relative max-w-[220px]">
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={mg}
                onChange={(e) => setMg(e.target.value.replace(/[^0-9.]/g, ""))}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                mg/L
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted mt-3">
          硬度 = Ca × 2.5 + Mg × 4.1（単位: mg/L as CaCO₃）
        </p>
      </div>

      {/* Result card */}
      {result && (
        <div
          className={`bg-surface rounded-2xl border-2 ${result.category.borderColor} p-4`}
        >
          {/* Main value */}
          <div
            className={`flex items-center justify-between mb-5 p-4 ${result.category.bgColor} rounded-xl`}
          >
            <div>
              <p className="text-xs text-muted mb-1">硬度</p>
              <p className={`text-4xl font-bold ${result.category.color}`}>
                {result.hardness % 1 === 0
                  ? result.hardness.toFixed(0)
                  : result.hardness.toFixed(1)}
              </p>
              <p className="text-xs text-muted">mg/L</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted mb-1">WHO分類</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${result.category.badgeClass}`}
              >
                {result.category.label}
              </span>
            </div>
          </div>

          {/* Gauge bar */}
          <div className="mb-2">
            <p className="text-xs text-muted mb-2">硬度スケール（0〜500+）</p>
            <div className="relative h-4 rounded-full overflow-hidden flex">
              {/* 軟水: 0–60 / 500 = 12% */}
              <div className="bg-blue-200" style={{ width: "12%" }} />
              {/* 中程度: 60–120 / 500 = 12% */}
              <div className="bg-green-300" style={{ width: "12%" }} />
              {/* 硬水: 120–180 / 500 = 12% */}
              <div className="bg-yellow-300" style={{ width: "12%" }} />
              {/* 非常な硬水: 180–500+ = 64% */}
              <div className="bg-red-300" style={{ width: "64%" }} />
            </div>
            <div className="relative h-4 -mt-4 pointer-events-none">
              <div
                className="absolute top-0 w-1 h-4 bg-gray-800 rounded-full shadow"
                style={{ left: `calc(${result.gaugePos}% - 2px)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>0</span>
              <span>60</span>
              <span>120</span>
              <span>180</span>
              <span>500+</span>
            </div>
          </div>
        </div>
      )}

      {/* WHO category reference */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="font-bold text-sm mb-3">WHO硬度分類</h3>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isActive = result?.category.label === cat.label;
            return (
              <div
                key={cat.label}
                className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? `${cat.bgColor} ${cat.borderColor} border font-bold`
                    : ""
                }`}
              >
                <span className={cat.color}>{cat.label}</span>
                <span className="text-muted text-xs">{cat.range} mg/L</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reference waters */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h3 className="font-bold text-sm mb-3">主なミネラルウォーターの硬度</h3>
        <div className="divide-y divide-border">
          {REFERENCE_WATERS.map((w) => {
            const cat = getCategory(w.hardness);
            return (
              <div
                key={w.name}
                className="flex items-center justify-between py-2.5"
              >
                <span className="text-sm">{w.name}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${cat.badgeClass}`}
                  >
                    {cat.label}
                  </span>
                  <span className="text-sm font-mono font-medium">
                    {w.hardness}
                  </span>
                </div>
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この水の硬度計算ツールツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">水のカルシウム・マグネシウム濃度から硬度を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この水の硬度計算ツールツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "水のカルシウム・マグネシウム濃度から硬度を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
            );
          })}
        </div>
        <p className="text-xs text-muted mt-3">
          ※ 数値はおおよその目安です。製品・ロットにより異なります。
        </p>
      </div>

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center h-20 text-xs text-muted">
        広告
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "水の硬度計算ツール",
  "description": "水のカルシウム・マグネシウム濃度から硬度を計算",
  "url": "https://tools.loresync.dev/water-hardness",
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
