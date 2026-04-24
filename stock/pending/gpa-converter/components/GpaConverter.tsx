"use client";

import { useState, useMemo } from "react";

type GpaSystem = "JP" | "US" | "UK" | "ECTS";

type GradeRow = {
  label: string;
  jp: string;
  us: string;
  uk: string;
  ects: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
  // Numeric range for JP/US scale (used for input matching)
  usMin: number;
  usMax: number;
};

const GRADE_TABLE: GradeRow[] = [
  {
    label: "Excellent",
    jp: "4.0 – 3.7",
    us: "4.0 – 3.7",
    uk: "First (1st)",
    ects: "A (Excellent)",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    badgeClass: "bg-green-100 text-green-700",
    usMin: 3.7,
    usMax: 4.0,
  },
  {
    label: "Good",
    jp: "3.6 – 3.0",
    us: "3.6 – 3.0",
    uk: "Upper Second (2:1)",
    ects: "B (Good)",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    badgeClass: "bg-blue-100 text-blue-700",
    usMin: 3.0,
    usMax: 3.69,
  },
  {
    label: "Satisfactory",
    jp: "2.9 – 2.0",
    us: "2.9 – 2.0",
    uk: "Lower Second (2:2)",
    ects: "C (Satisfactory)",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    badgeClass: "bg-yellow-100 text-yellow-700",
    usMin: 2.0,
    usMax: 2.99,
  },
  {
    label: "Sufficient",
    jp: "1.9 – 1.0",
    us: "1.9 – 1.0",
    uk: "Third (3rd)",
    ects: "D (Sufficient)",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    badgeClass: "bg-orange-100 text-orange-700",
    usMin: 1.0,
    usMax: 1.99,
  },
  {
    label: "Fail",
    jp: "0.9 – 0.0",
    us: "0.9 – 0.0",
    uk: "Fail",
    ects: "F (Fail)",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    badgeClass: "bg-red-100 text-red-700",
    usMin: 0.0,
    usMax: 0.99,
  },
];

const CUM_LAUDE = [
  { title: "Summa Cum Laude", threshold: "3.9+", color: "text-yellow-600" },
  { title: "Magna Cum Laude", threshold: "3.7 – 3.89", color: "text-gray-600" },
  { title: "Cum Laude", threshold: "3.5 – 3.69", color: "text-amber-700" },
];

const SYSTEM_LABELS: Record<GpaSystem, string> = {
  JP: "日本 4.0",
  US: "US 4.0",
  UK: "UK (1st–3rd)",
  ECTS: "欧州 ECTS",
};

const UK_OPTIONS = ["First (1st)", "Upper Second (2:1)", "Lower Second (2:2)", "Third (3rd)", "Fail"];
const ECTS_OPTIONS = ["A (Excellent)", "B (Good)", "C (Satisfactory)", "D (Sufficient)", "F (Fail)"];

function findRowByUS(value: number): GradeRow | null {
  return GRADE_TABLE.find((r) => value >= r.usMin && value <= r.usMax) ?? null;
}

function findRowByUK(label: string): GradeRow | null {
  return GRADE_TABLE.find((r) => r.uk === label) ?? null;
}

function findRowByECTS(label: string): GradeRow | null {
  return GRADE_TABLE.find((r) => r.ects === label) ?? null;
}

const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent pr-12";

const selectClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent";

export default function GpaConverter() {
  const [system, setSystem] = useState<GpaSystem>("JP");
  const [numericValue, setNumericValue] = useState("");
  const [ukValue, setUkValue] = useState(UK_OPTIONS[0]);
  const [ectsValue, setEctsValue] = useState(ECTS_OPTIONS[0]);

  const result = useMemo((): GradeRow | null => {
    if (system === "JP" || system === "US") {
      const v = parseFloat(numericValue);
      if (isNaN(v) || v < 0 || v > 4.0) return null;
      return findRowByUS(v);
    }
    if (system === "UK") return findRowByUK(ukValue);
    if (system === "ECTS") return findRowByECTS(ectsValue);
    return null;
  }, [system, numericValue, ukValue, ectsValue]);

  const numericGpa = useMemo(() => {
    if (system === "JP" || system === "US") {
      const v = parseFloat(numericValue);
      return isNaN(v) ? null : v;
    }
    if (result) {
      // Midpoint of range for representative value
      return (result.usMin + result.usMax) / 2;
    }
    return null;
  }, [system, numericValue, result]);

  const cumulativeHonor = useMemo(() => {
    if (numericGpa === null) return null;
    if (numericGpa >= 3.9) return CUM_LAUDE[0];
    if (numericGpa >= 3.7) return CUM_LAUDE[1];
    if (numericGpa >= 3.5) return CUM_LAUDE[2];
    return null;
  }, [numericGpa]);

  return (
    <div className="space-y-4">
      {/* Ad placeholder */}
      <div className="w-full h-16 bg-muted/30 border border-dashed border-border rounded-lg flex items-center justify-center text-xs text-muted">
        広告スペース
      </div>

      {/* Input card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">GPAを入力してください</h2>

        {/* System selector */}
        <div className="mb-5">
          <label className="block text-xs text-muted mb-2">GPAスケールを選択</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(SYSTEM_LABELS) as GpaSystem[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSystem(s);
                  setNumericValue("");
                }}
                className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                  system === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted hover:border-primary/50"
                }`}
              >
                {SYSTEM_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Value input */}
        {(system === "JP" || system === "US") && (
          <div>
            <label className="block text-xs text-muted mb-1">GPA値（0.0 〜 4.0）</label>
            <div className="relative max-w-[200px]">
              <input
                type="text"
                inputMode="decimal"
                placeholder="3.5"
                value={numericValue}
                onChange={(e) => setNumericValue(e.target.value.replace(/[^0-9.]/g, ""))}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">/ 4.0</span>
            </div>
          </div>
        )}

        {system === "UK" && (
          <div>
            <label className="block text-xs text-muted mb-1">学位クラス</label>
            <select
              value={ukValue}
              onChange={(e) => setUkValue(e.target.value)}
              className={selectClass}
            >
              {UK_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        )}

        {system === "ECTS" && (
          <div>
            <label className="block text-xs text-muted mb-1">ECTSグレード</label>
            <select
              value={ectsValue}
              onChange={(e) => setEctsValue(e.target.value)}
              className={selectClass}
            >
              {ECTS_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Result card */}
      {result && (
        <div className={`bg-card border-2 ${result.borderColor} rounded-xl p-5 shadow-sm`}>
          <div className={`flex items-center justify-between mb-4 p-4 ${result.bgColor} rounded-lg`}>
            <div>
              <p className="text-xs text-muted mb-1">評価レベル</p>
              <p className={`text-2xl font-bold ${result.color}`}>{result.label}</p>
            </div>
            {cumulativeHonor && (
              <div className="text-right">
                <p className="text-xs text-muted mb-1">Cum Laude</p>
                <span className={`text-sm font-bold ${cumulativeHonor.color}`}>
                  {cumulativeHonor.title}
                </span>
              </div>
            )}
          </div>

          {/* Equivalents */}
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">各スケールでの相当値</h3>
          <div className="divide-y divide-border">
            {(
              [
                { system: "日本 4.0", value: result.jp },
                { system: "US 4.0", value: result.us },
                { system: "UK 学位クラス", value: result.uk },
                { system: "欧州 ECTS", value: result.ects },
              ] as { system: string; value: string }[]
            ).map(({ system: sys, value }) => (
              <div key={sys} className="flex justify-between items-center py-2.5">
                <span className="text-sm text-muted">{sys}</span>
                <span className={`text-sm font-semibold ${result.color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reference table */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-3">GPA対応表</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-2 text-muted font-medium">評価</th>
                <th className="text-center py-2 px-2 text-muted font-medium">日本/US</th>
                <th className="text-center py-2 px-2 text-muted font-medium">UK</th>
                <th className="text-center py-2 pl-2 text-muted font-medium">ECTS</th>
              </tr>
            </thead>
            <tbody>
              {GRADE_TABLE.map((row) => {
                const isActive = result?.label === row.label;
                return (
                  <tr
                    key={row.label}
                    className={`border-b border-border last:border-0 transition-all ${
                      isActive ? `${row.bgColor} font-bold` : ""
                    }`}
                  >
                    <td className={`py-2 pr-2 ${row.color}`}>{row.label}</td>
                    <td className="text-center py-2 px-2 font-mono">{row.jp}</td>
                    <td className="text-center py-2 px-2">{row.uk}</td>
                    <td className="text-center py-2 pl-2">{row.ects}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-3">
          ※ 換算は一般的な目安です。機関・国によって基準が異なります。
        </p>
      </div>

      {/* Cum laude thresholds */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-3">Cum Laude 基準（米国一般目安）</h3>
        <div className="space-y-2">
          {CUM_LAUDE.map((h) => (
            <div key={h.title} className="flex justify-between items-center">
              <span className={`text-sm font-medium ${h.color}`}>{h.title}</span>
              <span className="text-xs text-muted font-mono">{h.threshold}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-3">
          ※ 大学・学部によって閾値は異なります。
        </p>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-16 bg-muted/30 border border-dashed border-border rounded-lg flex items-center justify-center text-xs text-muted">
        広告スペース
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このGPA 変換（日米欧）ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">日本4.0スケール / US 4.0 / UK 1st-3rd / 欧州ECTSを相互変換。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このGPA 変換（日米欧）ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "日本4.0スケール / US 4.0 / UK 1st-3rd / 欧州ECTSを相互変換。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "GPA 変換（日米欧）",
  "description": "日本4.0スケール / US 4.0 / UK 1st-3rd / 欧州ECTSを相互変換",
  "url": "https://tools.loresync.dev/gpa-converter",
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
