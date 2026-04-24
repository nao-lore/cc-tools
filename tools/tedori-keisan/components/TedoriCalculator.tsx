"use client";

import { useState, useMemo } from "react";

interface TedoriInput {
  grossAnnual: string; // 額面年収（万円）
  age: string;
  dependents: string; // 扶養家族数
  socialInsurance: boolean; // 社会保険加入
}

interface TedoriResult {
  grossAnnualYen: number;
  grossMonthlyYen: number;
  // 控除
  incomeTax: number; // 所得税（概算）
  residentTax: number; // 住民税（概算）
  healthInsurance: number; // 健康保険
  welfarePension: number; // 厚生年金
  employmentInsurance: number; // 雇用保険
  totalDeduction: number;
  // 手取り
  netAnnual: number;
  netMonthly: number;
  netRate: number; // 手取り率（%）
}

function calcTedori(input: TedoriInput): TedoriResult | null {
  const grossManEn = parseFloat(input.grossAnnual);
  const age = parseInt(input.age, 10);
  const dependents = parseInt(input.dependents, 10);

  if (!grossManEn || grossManEn <= 0 || isNaN(age) || isNaN(dependents)) return null;

  const grossAnnualYen = grossManEn * 10000;
  const grossMonthlyYen = grossAnnualYen / 12;

  // --- 社会保険料 ---
  let healthInsurance = 0;
  let welfarePension = 0;
  let employmentInsurance = 0;

  if (input.socialInsurance) {
    // 健康保険料：標準報酬月額 × 9.98% / 2（協会けんぽ・東京 2024年度、労使折半）
    const hyojunGeppo = Math.min(grossMonthlyYen, 1390000); // 上限139万円
    healthInsurance = Math.round(hyojunGeppo * 0.0998 / 2) * 12;

    // 厚生年金：標準報酬月額 × 18.3% / 2（上限65万円）
    const nenkinGeppo = Math.min(grossMonthlyYen, 650000);
    welfarePension = Math.round(nenkinGeppo * 0.183 / 2) * 12;

    // 雇用保険：年収 × 0.6%（一般の事業、被保険者負担）
    employmentInsurance = Math.round(grossAnnualYen * 0.006);
  }

  const totalSocialInsurance = healthInsurance + welfarePension + employmentInsurance;

  // --- 所得税（概算）---
  // 給与所得控除
  function kyuyoShotokuKojo(gross: number): number {
    if (gross <= 550000) return gross;
    if (gross <= 1625000) return 550000;
    if (gross <= 1800000) return Math.floor(gross * 0.4) - 100000;
    if (gross <= 3600000) return Math.floor(gross * 0.3) + 80000;
    if (gross <= 6600000) return Math.floor(gross * 0.2) + 440000;
    if (gross <= 8500000) return Math.floor(gross * 0.1) + 1100000;
    return 1950000;
  }

  const kyuyoShotoku = grossAnnualYen - kyuyoShotokuKojo(grossAnnualYen);

  // 基礎控除（48万円）
  const kisoKojo = 480000;

  // 扶養控除（一般扶養1人38万円）
  const fuyoKojo = dependents * 380000;

  // 社会保険料控除
  const socialKojo = totalSocialInsurance;

  const kazeiShotoku = Math.max(0, kyuyoShotoku - kisoKojo - fuyoKojo - socialKojo);

  // 所得税率（超過累進課税）
  function shotokuZeiritsu(taxable: number): number {
    if (taxable <= 1950000) return taxable * 0.05;
    if (taxable <= 3300000) return taxable * 0.1 - 97500;
    if (taxable <= 6950000) return taxable * 0.2 - 427500;
    if (taxable <= 9000000) return taxable * 0.23 - 636000;
    if (taxable <= 18000000) return taxable * 0.33 - 1536000;
    if (taxable <= 40000000) return taxable * 0.4 - 2796000;
    return taxable * 0.45 - 4796000;
  }

  // 復興特別所得税（2.1%加算）
  const incomeTax = Math.round(shotokuZeiritsu(kazeiShotoku) * 1.021);

  // --- 住民税（概算）---
  // 所得割10% + 均等割5000円（概算）
  // 住民税の課税所得は所得税と同じ控除とする（簡略化）
  const residentTaxableIncome = Math.max(0, kyuyoShotoku - kisoKojo - fuyoKojo - socialKojo);
  const residentTax = Math.round(residentTaxableIncome * 0.1) + 5000;

  // --- 合計控除・手取り ---
  const totalDeduction = incomeTax + residentTax + totalSocialInsurance;
  const netAnnual = Math.max(0, grossAnnualYen - totalDeduction);
  const netMonthly = Math.round(netAnnual / 12);
  const netRate = grossAnnualYen > 0 ? (netAnnual / grossAnnualYen) * 100 : 0;

  return {
    grossAnnualYen,
    grossMonthlyYen: Math.round(grossMonthlyYen),
    incomeTax,
    residentTax,
    healthInsurance,
    welfarePension,
    employmentInsurance,
    totalDeduction,
    netAnnual,
    netMonthly,
    netRate,
  };
}

function fmt(n: number): string {
  return n.toLocaleString("ja-JP");
}

function ResultRow({
  label,
  value,
  sub,
  highlight,
  large,
  negative,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  large?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center py-2.5 ${large ? "text-base font-bold" : "text-sm"}`}
    >
      <span className="text-muted">
        {label}
        {sub && <span className="text-xs ml-1 opacity-70">{sub}</span>}
      </span>
      <span
        className={`font-mono ${highlight ? "text-primary font-bold text-lg" : ""} ${negative ? "text-red-500" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function TedoriCalculator() {
  const [input, setInput] = useState<TedoriInput>({
    grossAnnual: "",
    age: "",
    dependents: "0",
    socialInsurance: true,
  });

  const result = useMemo(() => calcTedori(input), [input]);

  const set = (key: keyof TedoriInput, value: string | boolean) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-5">
      {/* Input Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="font-bold text-base">条件を入力</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 額面年収 */}
          <div>
            <label className="block text-xs text-muted mb-1">
              額面年収（万円）<span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                placeholder="例: 400"
                value={input.grossAnnual}
                onChange={(e) => set("grossAnnual", e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">万円</span>
            </div>
          </div>

          {/* 年齢 */}
          <div>
            <label className="block text-xs text-muted mb-1">
              年齢<span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                placeholder="例: 30"
                value={input.age}
                onChange={(e) => set("age", e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">歳</span>
            </div>
          </div>

          {/* 扶養家族数 */}
          <div>
            <label className="block text-xs text-muted mb-1">扶養家族数</label>
            <select
              value={input.dependents}
              onChange={(e) => set("dependents", e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-lg bg-accent focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={String(n)}>
                  {n}人
                </option>
              ))}
            </select>
          </div>

          {/* 社会保険 */}
          <div>
            <label className="block text-xs text-muted mb-1">社会保険</label>
            <div className="flex gap-2">
              {[
                { label: "加入（会社員）", value: true },
                { label: "未加入（国保等）", value: false },
              ].map(({ label, value }) => (
                <button
                  key={String(value)}
                  onClick={() => set("socialInsurance", value)}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    input.socialInsurance === value
                      ? "bg-primary text-white border-primary"
                      : "border-border bg-accent text-muted hover:border-primary/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Result Card */}
      {result ? (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          {/* 手取り金額（メイン） */}
          <div className="bg-accent rounded-xl p-4 text-center space-y-1">
            <p className="text-xs text-muted">手取り月額（概算）</p>
            <p className="text-3xl font-bold text-primary">
              ¥{fmt(result.netMonthly)}
              <span className="text-base font-normal text-muted ml-1">/ 月</span>
            </p>
            <p className="text-sm text-muted">
              年間手取り：¥{fmt(result.netAnnual)}
              <span className="ml-3 text-xs">
                （手取り率 <span className="font-bold text-foreground">{result.netRate.toFixed(1)}%</span>）
              </span>
            </p>
          </div>

          {/* 控除内訳 */}
          <div>
            <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              控除内訳（年額）
            </h3>
            <div className="divide-y divide-border">
              <ResultRow
                label="額面年収"
                value={`¥${fmt(result.grossAnnualYen)}`}
              />
              <ResultRow
                label="所得税"
                sub="（概算・復興特別所得税含む）"
                value={`-¥${fmt(result.incomeTax)}`}
                negative
              />
              <ResultRow
                label="住民税"
                sub="（概算）"
                value={`-¥${fmt(result.residentTax)}`}
                negative
              />
              {input.socialInsurance && (
                <>
                  <ResultRow
                    label="健康保険料"
                    sub="（協会けんぽ・東京 2024）"
                    value={`-¥${fmt(result.healthInsurance)}`}
                    negative
                  />
                  <ResultRow
                    label="厚生年金保険料"
                    value={`-¥${fmt(result.welfarePension)}`}
                    negative
                  />
                  <ResultRow
                    label="雇用保険料"
                    value={`-¥${fmt(result.employmentInsurance)}`}
                    negative
                  />
                </>
              )}
              <ResultRow
                label="控除合計"
                value={`-¥${fmt(result.totalDeduction)}`}
                negative
              />
              <ResultRow
                label="手取り年収"
                value={`¥${fmt(result.netAnnual)}`}
                large
                highlight
              />
            </div>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            ※ 本計算は2024年度税制をもとにした概算です。実際の金額は個人の状況や勤務先の保険組合等により異なります。
          </p>
        </div>
      ) : (
        <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm">
          額面年収と年齢を入力すると結果が表示されます
        </div>
      )}

      {/* FAQ */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            { q: "手取りとは何ですか？", a: "額面給与（総支給額）から所得税・住民税・社会保険料（健康保険・厚生年金・雇用保険）を差し引いた実際に受け取る金額です。一般的に額面の75〜85%程度になります。" },
            { q: "社会保険料はどうやって計算されますか？", a: "健康保険料は標準報酬月額に都道府県ごとの料率を掛けて計算されます。厚生年金保険料率は18.3%（労使折半）です。本ツールでは全国平均の料率で概算計算しています。" },
            { q: "住民税はなぜ翌年からの徴収になりますか？", a: "住民税は前年の所得に基づいて計算されるため、新社会人1年目は住民税が徴収されません。2年目以降から前年の収入に基づいた住民税が毎月差し引かれます。" },
          ].map(({ q, a }) => (
            <div key={q} className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-800 mb-1">Q. {q}</p>
              <p className="text-sm text-gray-600">A. {a}</p>
            </div>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "手取りとは何ですか？", "acceptedAnswer": { "@type": "Answer", "text": "額面給与から所得税・住民税・社会保険料を差し引いた実際に受け取る金額です。一般的に額面の75〜85%程度になります。" } },
              { "@type": "Question", "name": "社会保険料はどうやって計算されますか？", "acceptedAnswer": { "@type": "Answer", "text": "健康保険料は標準報酬月額に料率を掛けて計算されます。厚生年金保険料率は18.3%（労使折半）です。" } },
              { "@type": "Question", "name": "住民税はなぜ翌年からの徴収になりますか？", "acceptedAnswer": { "@type": "Answer", "text": "住民税は前年の所得に基づいて計算されるため、新社会人1年目は住民税が徴収されません。" } },
            ]
          }) }}
        />
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">関連ツール</p>
          <div className="flex flex-wrap gap-2">
            <a href="/tax-calculator" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">消費税計算ツール</a>
            <a href="/tsumitate-sim" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">積立シミュレーター</a>
          </div>
        </div>
      </div>
    </div>
  );
}
