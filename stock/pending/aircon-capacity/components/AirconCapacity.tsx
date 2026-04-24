"use client";

import { useState, useMemo } from "react";

type Tatami = 6 | 8 | 10 | 12 | 14 | 20;
type Direction = "南" | "東" | "西" | "北";
type Floor = "1階" | "2階以上" | "最上階";
type Insulation = "高断熱" | "普通" | "低断熱";
type CeilingHeight = "標準2.4m" | "高め2.7m+";

const BASE_KW: Record<Tatami, number> = {
  6: 2.2,
  8: 2.5,
  10: 2.8,
  12: 3.6,
  14: 4.0,
  20: 5.6,
};

// kW → 対応畳数目安（メーカー表記の上限畳数を逆引き）
const KW_TO_TATAMI: Array<{ maxKw: number; label: string }> = [
  { maxKw: 2.2, label: "〜6畳" },
  { maxKw: 2.5, label: "〜8畳" },
  { maxKw: 2.8, label: "〜10畳" },
  { maxKw: 3.6, label: "〜12畳" },
  { maxKw: 4.0, label: "〜14畳" },
  { maxKw: 5.0, label: "〜16畳" },
  { maxKw: 5.6, label: "〜18畳" },
  { maxKw: 7.1, label: "〜23畳" },
];

// 電気代目安: 冷房 1kWあたり約1,200円/月（夏期3ヶ月平均、COP3.0想定）
const KWH_PRICE = 1200;

function getTatamiLabel(kw: number): string {
  for (const entry of KW_TO_TATAMI) {
    if (kw <= entry.maxKw) return entry.label;
  }
  return "23畳超";
}

function calcKw(
  tatami: Tatami,
  direction: Direction,
  floor: Floor,
  insulation: Insulation,
  ceiling: CeilingHeight
): number {
  let kw = BASE_KW[tatami];

  if (direction === "西") kw *= 1.1;
  if (floor === "最上階") kw *= 1.1;
  if (insulation === "低断熱") kw *= 1.15;
  if (ceiling === "高め2.7m+") kw *= 1.1;

  return kw;
}

const selectClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent";

type OptionGroupProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
};

function OptionGroup({ label, options, value, onChange }: OptionGroupProps) {
  return (
    <div>
      <label className="block text-xs text-muted mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              value === opt
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-foreground hover:border-primary/50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AirconCapacity() {
  const [tatami, setTatami] = useState<Tatami>(10);
  const [direction, setDirection] = useState<Direction>("南");
  const [floor, setFloor] = useState<Floor>("2階以上");
  const [insulation, setInsulation] = useState<Insulation>("普通");
  const [ceiling, setCeiling] = useState<CeilingHeight>("標準2.4m");

  const result = useMemo(() => {
    const raw = calcKw(tatami, direction, floor, insulation, ceiling);
    // 切り上げて0.1kW単位
    const recommended = Math.ceil(raw * 10) / 10;
    const tatamiLabel = getTatamiLabel(recommended);
    const monthlyElec = Math.round(recommended * KWH_PRICE);
    return { recommended, tatamiLabel, monthlyElec };
  }, [tatami, direction, floor, insulation, ceiling]);

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">部屋の条件を選択</h2>

        <div className="space-y-4">
          <OptionGroup
            label="畳数"
            options={["6", "8", "10", "12", "14", "20"]}
            value={String(tatami)}
            onChange={(v) => setTatami(Number(v) as Tatami)}
          />

          <OptionGroup
            label="窓の向き"
            options={["南", "東", "西", "北"]}
            value={direction}
            onChange={(v) => setDirection(v as Direction)}
          />

          <OptionGroup
            label="階数"
            options={["1階", "2階以上", "最上階"]}
            value={floor}
            onChange={(v) => setFloor(v as Floor)}
          />

          <OptionGroup
            label="断熱性能"
            options={["高断熱", "普通", "低断熱"]}
            value={insulation}
            onChange={(v) => setInsulation(v as Insulation)}
          />

          <OptionGroup
            label="天井高"
            options={["標準2.4m", "高め2.7m+"]}
            value={ceiling}
            onChange={(v) => setCeiling(v as CeilingHeight)}
          />
        </div>
      </div>

      {/* Result card */}
      <div className="bg-card border-2 border-primary/40 rounded-xl p-5 shadow-sm">
        <p className="text-xs text-muted mb-1">推奨容量</p>
        <p className="text-5xl font-bold text-primary mb-1">
          {result.recommended.toFixed(1)}
          <span className="text-2xl font-semibold ml-1">kW</span>
        </p>

        <div className="divide-y divide-border mt-4">
          <div className="flex justify-between items-center py-2.5">
            <span className="text-sm text-muted">対応畳数目安</span>
            <span className="text-sm font-medium">{result.tatamiLabel}</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-sm text-muted">電気代目安（夏期・月）</span>
            <span className="text-sm font-medium">
              約 {result.monthlyElec.toLocaleString()}円
            </span>
          </div>
        </div>

        <p className="text-xs text-muted mt-3">
          ※ 電気代はCOP3.0・28円/kWh・冷房時を想定した目安です。実際は機種・使用時間で異なります。
        </p>
      </div>

      {/* Adjustment legend */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-3">補正係数の内訳</h3>
        <div className="space-y-1 text-sm">
          {[
            { cond: "西向き", adj: "+10%", active: direction === "西" },
            { cond: "最上階", adj: "+10%", active: floor === "最上階" },
            { cond: "低断熱", adj: "+15%", active: insulation === "低断熱" },
            { cond: "高め天井 2.7m+", adj: "+10%", active: ceiling === "高め2.7m+" },
          ].map(({ cond, adj, active }) => (
            <div
              key={cond}
              className={`flex justify-between px-3 py-2 rounded-lg transition-all ${
                active
                  ? "bg-orange-50 border border-orange-200 font-medium"
                  : "text-muted"
              }`}
            >
              <span>{cond}</span>
              <span className={active ? "text-orange-600" : ""}>{adj}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-border text-xs text-muted bg-muted/20">
        広告
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このエアコン適正容量 計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">部屋の畳数・向き・階・断熱から必要kWを算出。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このエアコン適正容量 計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "部屋の畳数・向き・階・断熱から必要kWを算出。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
