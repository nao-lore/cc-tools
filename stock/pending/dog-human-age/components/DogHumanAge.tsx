"use client";

import { useState, useMemo } from "react";

type Size = "小型" | "中型" | "大型" | "超大型";

const SIZE_INCREMENT: Record<Size, number> = {
  小型: 4,
  中型: 5,
  大型: 6,
  超大型: 7,
};

// Convert dog age (supports 0.5 steps) to human age
// 1歳=15, 2歳=24, 以降はサイズ別に加算
function toHumanAge(dogAge: number, size: Size): number {
  if (dogAge <= 0) return 0;
  if (dogAge <= 1) return Math.round(15 * dogAge);
  if (dogAge <= 2) return Math.round(15 + 9 * (dogAge - 1));
  return Math.round(24 + SIZE_INCREMENT[size] * (dogAge - 2));
}

type LifeStage = "パピー" | "成犬" | "シニア" | "ハイシニア";

function getLifeStage(humanAge: number): LifeStage {
  if (humanAge < 18) return "パピー";
  if (humanAge < 50) return "成犬";
  if (humanAge < 75) return "シニア";
  return "ハイシニア";
}

const STAGE_COLOR: Record<LifeStage, string> = {
  パピー: "bg-yellow-50 border-yellow-300 text-yellow-700",
  成犬: "bg-green-50 border-green-300 text-green-700",
  シニア: "bg-orange-50 border-orange-300 text-orange-700",
  ハイシニア: "bg-red-50 border-red-300 text-red-700",
};

const DOG_AGES = Array.from({ length: 41 }, (_, i) => i * 0.5); // 0〜20, 0.5刻み
const SIZES: Size[] = ["小型", "中型", "大型", "超大型"];
const TABLE_AGES = Array.from({ length: 15 }, (_, i) => i + 1); // 1〜15

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

export default function DogHumanAge() {
  const [dogAge, setDogAge] = useState<number>(3);
  const [size, setSize] = useState<Size>("小型");

  const result = useMemo(() => {
    const humanAge = toHumanAge(dogAge, size);
    const stage = getLifeStage(humanAge);
    return { humanAge, stage };
  }, [dogAge, size]);

  const tableRows = useMemo(
    () =>
      TABLE_AGES.map((age) => ({
        dogAge: age,
        小型: toHumanAge(age, "小型"),
        中型: toHumanAge(age, "中型"),
        大型: toHumanAge(age, "大型"),
        超大型: toHumanAge(age, "超大型"),
      })),
    []
  );

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">犬の情報を選択</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1.5">
              犬の年齢: <span className="font-semibold text-foreground">{dogAge}歳</span>
            </label>
            <input
              type="range"
              min={0}
              max={20}
              step={0.5}
              value={dogAge}
              onChange={(e) => setDogAge(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>0歳</span>
              <span>10歳</span>
              <span>20歳</span>
            </div>
          </div>

          <OptionGroup
            label="犬のサイズ"
            options={SIZES}
            value={size}
            onChange={(v) => setSize(v as Size)}
          />
        </div>
      </div>

      {/* Result card */}
      <div className="bg-card border-2 border-primary/40 rounded-xl p-5 shadow-sm">
        <p className="text-xs text-muted mb-1">人間換算年齢</p>
        <p className="text-5xl font-bold text-primary mb-1">
          {result.humanAge}
          <span className="text-2xl font-semibold ml-1">歳</span>
        </p>

        <div className="mt-4">
          <div className="flex justify-between items-center py-2.5 border-b border-border">
            <span className="text-sm text-muted">犬の年齢</span>
            <span className="text-sm font-medium">{dogAge}歳</span>
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-border">
            <span className="text-sm text-muted">サイズ</span>
            <span className="text-sm font-medium">{size}犬</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-sm text-muted">ライフステージ</span>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border ${STAGE_COLOR[result.stage]}`}
            >
              {result.stage}
            </span>
          </div>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-border text-xs text-muted bg-muted/20">
        広告
      </div>

      {/* Comparison table */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm overflow-x-auto">
        <h3 className="font-bold text-sm mb-3">年齢比較表（1〜15歳）</h3>
        <table className="w-full text-sm text-center">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-2 text-left text-muted font-medium text-xs">犬齢</th>
              {SIZES.map((s) => (
                <th
                  key={s}
                  className={`py-2 px-2 text-xs font-medium ${
                    s === size ? "text-primary font-bold" : "text-muted"
                  }`}
                >
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr
                key={row.dogAge}
                className={`border-b border-border/50 transition-colors ${
                  row.dogAge === Math.floor(dogAge) && dogAge % 1 === 0
                    ? "bg-primary/5"
                    : "hover:bg-accent/50"
                }`}
              >
                <td className="py-2 px-2 text-left font-medium">{row.dogAge}歳</td>
                {SIZES.map((s) => (
                  <td
                    key={s}
                    className={`py-2 px-2 ${
                      s === size ? "text-primary font-semibold" : "text-foreground"
                    }`}
                  >
                    {row[s]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-muted mt-3">
          ※ 1歳=人間15歳、2歳=24歳、以降は小型+4・中型+5・大型+6・超大型+7歳/年で換算
        </p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この犬の年齢 人間換算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">犬種サイズ別で正確換算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この犬の年齢 人間換算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "犬種サイズ別で正確換算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
