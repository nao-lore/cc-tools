"use client";

import { useState, useMemo } from "react";

const KISO_NENKIN_FULL = 816000; // 円/年 (2024年度)
const FULL_MONTHS = 480; // 40年 × 12ヶ月

function calcAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

function fmtWatate(n: number): string {
  return Math.round(n * 10) / 10 + "%";
}

// 手取り概算: 年金所得控除 → 所得税・住民税概算 → 介護保険料・国民健康保険概算
function calcTedori(nenkinNen: number): number {
  // 年金所得控除 (65歳以上、2020年改正後)
  let shotokuKojo: number;
  if (nenkinNen <= 1100000) {
    shotokuKojo = nenkinNen;
  } else if (nenkinNen <= 3300000) {
    shotokuKojo = nenkinNen * 0.75 - 275000;
  } else if (nenkinNen <= 4100000) {
    shotokuKojo = nenkinNen * 0.85 - 685000;
  } else if (nenkinNen <= 7700000) {
    shotokuKojo = nenkinNen * 0.95 - 1095000;
  } else {
    shotokuKojo = nenkinNen - 1955000;
  }
  const shotoku = Math.max(0, nenkinNen - shotokuKojo);

  // 基礎控除 48万円
  const kadozei = Math.max(0, shotoku - 480000);

  // 所得税（簡易）
  let shotokuZei = 0;
  if (kadozei <= 1950000) shotokuZei = kadozei * 0.05;
  else if (kadozei <= 3300000) shotokuZei = kadozei * 0.1 - 97500;
  else shotokuZei = kadozei * 0.2 - 427500;
  shotokuZei *= 1.021; // 復興特別所得税

  // 住民税（簡易）
  const juminZei = kadozei * 0.1 + 5000;

  // 社会保険料概算（介護保険 + 国民健康保険、年金額ベース粗算）
  const shakaihoken = nenkinNen * 0.08;

  return nenkinNen - shotokuZei - juminZei - shakaihoken;
}

type ReceiveAge = 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75;

interface AdjustedRow {
  age: ReceiveAge;
  label: string;
  rateChange: number; // % (negative = 減額)
  nenkinNen: number;
  nenkinTsuki: number;
  tedori: number;
}

function buildAdjustmentTable(baseNenNen: number): AdjustedRow[] {
  const rows: AdjustedRow[] = [];
  const ages: ReceiveAge[] = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75];

  for (const age of ages) {
    let rateChange = 0;
    if (age < 65) {
      // 繰上げ: 月0.4%減額
      const months = (65 - age) * 12;
      rateChange = -0.4 * months;
    } else if (age > 65) {
      // 繰下げ: 月0.7%増額
      const months = (age - 65) * 12;
      rateChange = 0.7 * months;
    }
    const multiplier = 1 + rateChange / 100;
    const nenkinNen = baseNenNen * multiplier;
    const nenkinTsuki = nenkinNen / 12;
    const tedori = calcTedori(nenkinNen) / 12;
    rows.push({
      age,
      label: age < 65 ? `繰上げ ${age}歳` : age === 65 ? `標準 65歳` : `繰下げ ${age}歳`,
      rateChange,
      nenkinNen,
      nenkinTsuki,
      tedori,
    });
  }
  return rows;
}

export default function TeinengoNenkin() {
  const [heikinhoshu, setHeikinhoshu] = useState("");
  const [koseiMonths, setKoseiMonths] = useState("");
  const [kokuminMonths, setKokuminMonths] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [showAll, setShowAll] = useState(false);

  const age = calcAge(birthDate);

  const result = useMemo(() => {
    const hoshu = parseInt(heikinhoshu.replace(/,/g, ""), 10);
    const kMonths = parseInt(koseiMonths, 10);
    const nMonths = parseInt(kokuminMonths, 10);

    if (!hoshu || hoshu <= 0 || !kMonths || kMonths < 0 || !nMonths || nMonths < 0) return null;

    // 老齢基礎年金 (厚生+国民の合算、上限480月)
    const totalMonths = Math.min(kMonths + nMonths, FULL_MONTHS);
    const kisoNen = (KISO_NENKIN_FULL * totalMonths) / FULL_MONTHS;
    const kisoTsuki = kisoNen / 12;

    // 老齢厚生年金 (報酬比例部分)
    const koseiNen = hoshu * (5.481 / 1000) * kMonths;
    const koseiTsuki = koseiNen / 12;

    const goukeiNen = kisoNen + koseiNen;
    const goukeiTsuki = goukeiNen / 12;
    const tedoriTsuki = calcTedori(goukeiNen) / 12;

    const table = buildAdjustmentTable(goukeiNen);

    return { kisoNen, kisoTsuki, koseiNen, koseiTsuki, goukeiNen, goukeiTsuki, tedoriTsuki, table };
  }, [heikinhoshu, koseiMonths, kokuminMonths]);

  const displayTable = result
    ? showAll
      ? result.table
      : result.table.filter((r) => [60, 62, 64, 65, 67, 70, 75].includes(r.age))
    : [];

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
        <h2 className="text-sm font-bold text-foreground">基本情報を入力</h2>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-muted">
            平均標準報酬月額（円）
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="例: 300000"
            value={heikinhoshu}
            onChange={(e) => setHeikinhoshu(e.target.value.replace(/[^\d,]/g, ""))}
            className="w-full border border-border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent/40 text-foreground bg-white"
          />
          <p className="text-[11px] text-muted">在職中の月収の目安（賞与含まない場合が多い）</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-muted">
              厚生年金 納付月数
            </label>
            <input
              type="number"
              min={0}
              max={600}
              placeholder="例: 360"
              value={koseiMonths}
              onChange={(e) => setKoseiMonths(e.target.value)}
              className="w-full border border-border rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent/40 text-foreground bg-white"
            />
            <p className="text-[11px] text-muted">会社員・公務員期間</p>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-muted">
              国民年金 納付月数
            </label>
            <input
              type="number"
              min={0}
              max={480}
              placeholder="例: 120"
              value={kokuminMonths}
              onChange={(e) => setKokuminMonths(e.target.value)}
              className="w-full border border-border rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent/40 text-foreground bg-white"
            />
            <p className="text-[11px] text-muted">自営業・学生期間等</p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-muted">
            生年月日（任意・年齢表示用）
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent/40 text-foreground bg-white"
          />
          {age !== null && (
            <p className="text-[11px] text-muted">現在 {age} 歳</p>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="bg-surface rounded-2xl border border-border p-4 space-y-4">
            <h2 className="text-sm font-bold text-foreground">試算結果（65歳受給開始の場合）</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-border p-3">
                <p className="text-[11px] text-muted mb-1">老齢基礎年金（月額）</p>
                <p className="text-xl font-bold text-foreground">{fmt(result.kisoTsuki)}<span className="text-xs text-muted font-normal ml-1">円</span></p>
                <p className="text-[11px] text-muted mt-1">年額 {fmt(result.kisoNen)} 円</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-3">
                <p className="text-[11px] text-muted mb-1">老齢厚生年金（月額）</p>
                <p className="text-xl font-bold text-foreground">{fmt(result.koseiTsuki)}<span className="text-xs text-muted font-normal ml-1">円</span></p>
                <p className="text-[11px] text-muted mt-1">年額 {fmt(result.koseiNen)} 円</p>
              </div>
            </div>

            <div className="bg-accent/10 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">合計（月額）</span>
                <span className="text-2xl font-bold text-accent">{fmt(result.goukeiTsuki)}<span className="text-sm font-normal ml-1">円</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">合計（年額）</span>
                <span className="text-base font-semibold text-foreground">{fmt(result.goukeiNen)}<span className="text-xs text-muted font-normal ml-1">円</span></span>
              </div>
              <div className="flex items-center justify-between border-t border-accent/20 pt-2 mt-2">
                <span className="text-xs text-muted">手取り概算（月額）</span>
                <span className="text-base font-semibold text-foreground">{fmt(result.tedoriTsuki)}<span className="text-xs text-muted font-normal ml-1">円</span></span>
              </div>
            </div>
          </div>

          {/* Adjustment table */}
          <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">繰上げ・繰下げ受給比較</h2>
              <button
                onClick={() => setShowAll((v) => !v)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium bg-accent text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                {showAll ? "主要のみ表示" : "全年齢表示"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted border-b border-border">
                    <th className="text-left pb-2 font-medium">受給開始</th>
                    <th className="text-right pb-2 font-medium">増減率</th>
                    <th className="text-right pb-2 font-medium">月額</th>
                    <th className="text-right pb-2 font-medium">手取月額</th>
                  </tr>
                </thead>
                <tbody>
                  {displayTable.map((row) => (
                    <tr
                      key={row.age}
                      className={`border-b border-border/50 ${row.age === 65 ? "bg-accent/5 font-semibold" : ""}`}
                    >
                      <td className="py-2 text-foreground">
                        {row.label}
                        {age !== null && row.age > age && (
                          <span className="ml-1 text-[10px] text-muted">({row.age - age}年後)</span>
                        )}
                      </td>
                      <td className={`py-2 text-right ${row.rateChange < 0 ? "text-red-500" : row.rateChange > 0 ? "text-green-600" : "text-foreground"}`}>
                        {row.rateChange === 0 ? "±0%" : row.rateChange > 0 ? `+${fmtWatate(row.rateChange)}` : `${fmtWatate(row.rateChange)}`}
                      </td>
                      <td className="py-2 text-right text-foreground">{fmt(row.nenkinTsuki)}</td>
                      <td className="py-2 text-right text-foreground">{fmt(row.tedori)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-muted">
              ※ 繰上げ: 1ヶ月あたり0.4%減額（60〜64歳） / 繰下げ: 1ヶ月あたり0.7%増額（66〜75歳）
            </p>
          </div>
        </>
      )}

      {/* Disclaimer */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <p className="text-[11px] text-muted leading-relaxed">
          <span className="font-semibold">免責事項:</span> 本ツールは概算値を提供するものです。実際の受給額は日本年金機構の記録・法改正・各種加算・在職老齢年金の調整等により異なります。正確な金額はねんきんネットまたは年金事務所にお問い合わせください。手取り概算は65歳以上・単身・所得控除が基礎控除のみの場合を前提としています。
        </p>
      </div>

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center h-24 text-muted text-sm">
        広告
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この老齢年金 受給額試算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">納付期間と平均月収から老齢厚生年金・基礎年金の概算を試算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この老齢年金 受給額試算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "納付期間と平均月収から老齢厚生年金・基礎年金の概算を試算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "老齢年金 受給額試算",
  "description": "納付期間と平均月収から老齢厚生年金・基礎年金の概算を試算",
  "url": "https://tools.loresync.dev/teinengo-nenkin",
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
