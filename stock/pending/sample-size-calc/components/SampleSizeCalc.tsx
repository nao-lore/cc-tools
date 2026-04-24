"use client";

import { useState, useMemo } from "react";

// Z-values for common significance levels (one-tailed)
const Z_ALPHA: Record<string, Record<string, number>> = {
  "0.05": { "two": 1.96, "one": 1.645 },
  "0.01": { "two": 2.576, "one": 2.326 },
};

// Z-values for power (1-β)
const Z_BETA: Record<string, number> = {
  "0.8": 0.842,
  "0.9": 1.282,
  "0.95": 1.645,
};

const EFFECT_PRESETS = [
  { label: "Small (0.2)", value: 0.2 },
  { label: "Medium (0.5)", value: 0.5 },
  { label: "Large (0.8)", value: 0.8 },
];

function calcN(za: number, zb: number, d: number): number {
  if (d <= 0) return NaN;
  return Math.ceil(((za + zb) / d) ** 2);
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ResultCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: "green" | "blue" | "orange" | "default";
}

function ResultCard({ label, value, sub, highlight = "default" }: ResultCardProps) {
  const colors: Record<string, string> = {
    green: "bg-green-50 border-green-200",
    blue: "bg-blue-50 border-blue-200",
    orange: "bg-orange-50 border-orange-200",
    default: "bg-gray-50 border-gray-200",
  };
  const textColors: Record<string, string> = {
    green: "text-green-700",
    blue: "text-blue-700",
    orange: "text-orange-700",
    default: "text-gray-800",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 ${colors[highlight]}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${textColors[highlight]}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function SampleSizeCalc() {
  const [alpha, setAlpha] = useState("0.05");
  const [power, setPower] = useState("0.8");
  const [effectMode, setEffectMode] = useState<"preset" | "custom">("preset");
  const [effectPreset, setEffectPreset] = useState("0.5");
  const [effectCustom, setEffectCustom] = useState("0.5");
  const [tails, setTails] = useState<"two" | "one">("two");

  const effectD = useMemo(() => {
    if (effectMode === "preset") return parseFloat(effectPreset);
    const v = parseFloat(effectCustom);
    return isNaN(v) || v <= 0 ? NaN : v;
  }, [effectMode, effectPreset, effectCustom]);

  const result = useMemo(() => {
    const za = Z_ALPHA[alpha]?.[tails];
    const zb = Z_BETA[power];
    if (!za || !zb || isNaN(effectD) || effectD <= 0) return null;
    const n = calcN(za, zb, effectD);
    return { n, total: n * 2, za, zb };
  }, [alpha, power, effectD, tails]);

  // Reference table: all combinations of current alpha/tails with fixed power
  const refTable = useMemo(() => {
    const za = Z_ALPHA[alpha]?.[tails];
    if (!za) return [];
    return Object.entries(Z_BETA).map(([p, zb]) => ({
      power: p,
      small: calcN(za, zb, 0.2),
      medium: calcN(za, zb, 0.5),
      large: calcN(za, zb, 0.8),
    }));
  }, [alpha, tails]);

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-5">
        <h2 className="text-base font-semibold text-gray-800">パラメータ設定</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SelectField
            label="有意水準 α"
            value={alpha}
            onChange={setAlpha}
            options={[
              { label: "0.05 (5%)", value: "0.05" },
              { label: "0.01 (1%)", value: "0.01" },
            ]}
          />
          <SelectField
            label="検定力 1−β"
            value={power}
            onChange={setPower}
            options={[
              { label: "0.80 (80%)", value: "0.8" },
              { label: "0.90 (90%)", value: "0.9" },
              { label: "0.95 (95%)", value: "0.95" },
            ]}
          />
          <SelectField
            label="検定種類"
            value={tails}
            onChange={(v) => setTails(v as "two" | "one")}
            options={[
              { label: "両側検定", value: "two" },
              { label: "片側検定", value: "one" },
            ]}
          />
        </div>

        {/* Effect size */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">効果量 d</label>
          <div className="flex gap-2 flex-wrap mb-3">
            {EFFECT_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  setEffectMode("preset");
                  setEffectPreset(String(p.value));
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  effectMode === "preset" && effectPreset === String(p.value)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => setEffectMode("custom")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                effectMode === "custom"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              カスタム
            </button>
          </div>
          {effectMode === "custom" && (
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={effectCustom}
              onChange={(e) => setEffectCustom(e.target.value)}
              placeholder="例: 0.3"
              className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Result */}
        {result ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard
                label="必要サンプルサイズ（グループあたり）"
                value={`${result.n.toLocaleString("ja-JP")} 件`}
                sub={`Zα=${result.za.toFixed(3)}, Zβ=${result.zb.toFixed(3)}, d=${effectD}`}
                highlight="blue"
              />
              <ResultCard
                label="合計サンプルサイズ（2グループ計）"
                value={`${result.total.toLocaleString("ja-JP")} 件`}
                sub="グループあたり × 2"
                highlight="green"
              />
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-1.5 text-sm text-gray-600">
              <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">計算式</p>
              <p>n = ⌈((Zα + Zβ) / d)²⌉</p>
              <p className="text-xs text-gray-400">
                Zα: 有意水準に対応するZ値（{tails === "two" ? "両側" : "片側"}）／
                Zβ: 検定力に対応するZ値／d: 効果量（Cohen's d）
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 px-5 py-6 text-center text-sm text-gray-400">
            有効な効果量を入力してください
          </div>
        )}
      </div>

      {/* Reference table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4">
        <h2 className="text-base font-semibold text-gray-800">
          参照表
          <span className="ml-2 text-xs font-normal text-gray-400">
            α={alpha}・{tails === "two" ? "両側" : "片側"}検定（グループあたり）
          </span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-xs font-medium text-gray-500">検定力 1−β</th>
                <th className="text-right py-2 px-4 text-xs font-medium text-gray-500">Small (d=0.2)</th>
                <th className="text-right py-2 px-4 text-xs font-medium text-gray-500">Medium (d=0.5)</th>
                <th className="text-right py-2 px-4 text-xs font-medium text-gray-500">Large (d=0.8)</th>
              </tr>
            </thead>
            <tbody>
              {refTable.map((row) => (
                <tr
                  key={row.power}
                  className={`border-b border-gray-100 ${row.power === power ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <td className="py-2 pr-4 font-medium text-gray-700">
                    {row.power === power && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 mb-0.5" />
                    )}
                    {(parseFloat(row.power) * 100).toFixed(0)}%
                  </td>
                  <td className="text-right py-2 px-4 text-gray-600">{row.small.toLocaleString("ja-JP")}</td>
                  <td className="text-right py-2 px-4 text-gray-600">{row.medium.toLocaleString("ja-JP")}</td>
                  <td className="text-right py-2 px-4 text-gray-600">{row.large.toLocaleString("ja-JP")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-gray-400">
          Cohen's d 目安: Small=0.2（小さな差）, Medium=0.5（中程度）, Large=0.8（大きな差）
        </p>
      </div>

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
        広告スペース
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このサンプルサイズ算出ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">検定力・効果量・有意水準から必要サンプル数を算出。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このサンプルサイズ算出ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "検定力・効果量・有意水準から必要サンプル数を算出。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
