"use client";

import { useState, useMemo } from "react";

// 給与所得控除 (令和2年以降)
function getEmploymentDeduction(income: number): number {
  if (income <= 1_625_000) return 550_000;
  if (income <= 1_800_000) return income * 0.4 - 100_000;
  if (income <= 3_600_000) return income * 0.3 + 80_000;
  if (income <= 6_600_000) return income * 0.2 + 440_000;
  if (income <= 8_500_000) return income * 0.1 + 1_100_000;
  return 1_950_000;
}

// 住民税の基礎控除: 2,500万超で逓減・消失するが実務上43万固定で近似
const JUUMIN_KISO_KOUJYO = 430_000;

// 配偶者控除（住民税）: 33万円
const HAIGUSHA_KOUJYO = 330_000;

// 扶養控除（住民税、一般扶養16歳以上）: 33万円/人
const FUYOU_KOUJYO_PER = 330_000;

// 均等割
const KINTOU_WARI_TOTAL = 5_000; // 都道府県1,500 + 市町村3,500
const KINTOU_WARI_PREF = 1_500;
const KINTOU_WARI_CITY = 3_500;

// 所得割税率
const SHOTOKU_WARI_PREF = 0.04; // 都道府県民税4%
const SHOTOKU_WARI_CITY = 0.06; // 市町村民税6%
const SHOTOKU_WARI_TOTAL = 0.10; // 合計10%

interface Result {
  kyuyoShotoku: number;       // 給与所得
  employmentDeduction: number; // 給与所得控除
  kaisozeiShotoku: number;    // 課税所得
  shotokuWari: number;        // 所得割合計
  shotokuWariPref: number;    // 所得割（都道府県）
  shotokuWariCity: number;    // 所得割（市町村）
  kintouWari: number;         // 均等割合計
  kintouWariPref: number;     // 均等割（都道府県）
  kintouWariCity: number;     // 均等割（市町村）
  nenGaku: number;            // 合計年額
  tsukigaku: number;          // 月額（÷12）
}

function calculate(
  nenShu: number,
  shakaihokenRyo: number,
  hasSpouse: boolean,
  fuyouCount: number,
): Result | null {
  if (nenShu <= 0) return null;

  const employmentDeduction = getEmploymentDeduction(nenShu);
  const kyuyoShotoku = Math.max(0, nenShu - employmentDeduction);

  const haigushaDeduct = hasSpouse ? HAIGUSHA_KOUJYO : 0;
  const fuyouDeduct = fuyouCount * FUYOU_KOUJYO_PER;

  const totalDeductions =
    shakaihokenRyo +
    JUUMIN_KISO_KOUJYO +
    haigushaDeduct +
    fuyouDeduct;

  const kaisozeiShotoku = Math.max(0, Math.floor((kyuyoShotoku - totalDeductions) / 1_000) * 1_000);

  // 課税所得が0以下は均等割のみ（45万円以下非課税の自治体もあるが一般則として算出）
  const shotokuWariPref = Math.floor(kaisozeiShotoku * SHOTOKU_WARI_PREF);
  const shotokuWariCity = Math.floor(kaisozeiShotoku * SHOTOKU_WARI_CITY);
  const shotokuWari = shotokuWariPref + shotokuWariCity;

  // 均等割: 課税所得が発生しているとみなして計上（非課税判定は省略）
  const kintouWariPref = kaisozeiShotoku > 0 ? KINTOU_WARI_PREF : 0;
  const kintouWariCity = kaisozeiShotoku > 0 ? KINTOU_WARI_CITY : 0;
  const kintouWari = kintouWariPref + kintouWariCity;

  const nenGaku = shotokuWari + kintouWari;
  const tsukigaku = Math.round(nenGaku / 12);

  return {
    kyuyoShotoku,
    employmentDeduction,
    kaisozeiShotoku,
    shotokuWari,
    shotokuWariPref,
    shotokuWariCity,
    kintouWari,
    kintouWariPref,
    kintouWariCity,
    nenGaku,
    tsukigaku,
  };
}

function fmt(n: number): string {
  return n.toLocaleString("ja-JP");
}

export default function JuuminZei() {
  const [nenShuMan, setNenShuMan] = useState("");
  const [shakaihokenMan, setShakaihokenMan] = useState("");
  const [hasSpouse, setHasSpouse] = useState(false);
  const [fuyouCount, setFuyouCount] = useState(0);

  const nenShu = parseFloat(nenShuMan) * 10_000 || 0;
  const shakaihokenRyo = parseFloat(shakaihokenMan) * 10_000 || 0;

  // Auto-calc 給与所得控除 for display
  const autoEmploymentDeduction = nenShu > 0 ? getEmploymentDeduction(nenShu) : 0;

  const result = useMemo(
    () => calculate(nenShu, shakaihokenRyo, hasSpouse, fuyouCount),
    [nenShu, shakaihokenRyo, hasSpouse, fuyouCount],
  );

  const inputClass =
    "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-background pr-12";

  const selectClass =
    "w-full px-3 py-2.5 border border-border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-background";

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
        <h2 className="font-bold text-base mb-4">条件を入力</h2>

        {/* 年収 */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-1">年収（給与収入）</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="500"
              value={nenShuMan}
              onChange={(e) => setNenShuMan(e.target.value.replace(/[^0-9]/g, ""))}
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
              万円
            </span>
          </div>
          {nenShu > 0 && (
            <p className="text-xs text-muted mt-1">
              給与所得控除（自動計算）: {fmt(autoEmploymentDeduction)} 円
            </p>
          )}
        </div>

        {/* 社会保険料控除 */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-1">
            社会保険料控除額
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="70"
              value={shakaihokenMan}
              onChange={(e) => setShakaihokenMan(e.target.value.replace(/[^0-9]/g, ""))}
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
              万円
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            源泉徴収票の「社会保険料等の金額」を入力してください
          </p>
        </div>

        {/* 基礎控除 */}
        <div className="mb-4">
          <div className="flex justify-between items-center px-3 py-2.5 border border-border rounded-lg bg-background/60">
            <span className="text-sm text-muted">基礎控除（固定）</span>
            <span className="text-lg font-mono text-foreground">
              {fmt(JUUMIN_KISO_KOUJYO)} 円
            </span>
          </div>
        </div>

        {/* 配偶者控除 */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-2">配偶者控除</label>
          <div className="flex gap-2">
            {[
              { value: false, label: "なし" },
              { value: true, label: "あり（33万円）" },
            ].map(({ value, label }) => (
              <button
                key={label}
                onClick={() => setHasSpouse(value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  hasSpouse === value
                    ? "bg-accent text-white border-accent"
                    : "bg-background border-border text-muted hover:border-accent/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 扶養控除人数 */}
        <div>
          <label className="block text-xs text-muted mb-1">
            扶養控除の人数（16歳以上の一般扶養）
          </label>
          <select
            value={fuyouCount}
            onChange={(e) => setFuyouCount(Number(e.target.value))}
            className={selectClass}
          >
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n === 0 ? "なし" : `${n}人（${fmt(n * FUYOU_KOUJYO_PER)}円控除）`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result card */}
      {result && (
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm space-y-3">
          {/* Main result */}
          <div className="bg-accent/10 rounded-xl p-4">
            <p className="text-xs text-muted mb-1">住民税 合計年額（目安）</p>
            <p className="text-4xl font-bold text-accent">
              {fmt(result.nenGaku)}
              <span className="text-xl ml-1 font-normal">円</span>
            </p>
            <p className="text-sm text-muted mt-1">
              月額換算: 約 {fmt(result.tsukigaku)} 円
            </p>
          </div>

          {/* 課税所得 */}
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted">課税所得</span>
            <span className="text-sm font-medium">{fmt(result.kaisozeiShotoku)} 円</span>
          </div>

          {/* 所得割の内訳 */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">所得割（課税所得 × 10%）</p>
            <div className="space-y-1">
              {[
                { label: "都道府県民税（4%）", value: result.shotokuWariPref },
                { label: "市町村民税（6%）", value: result.shotokuWariCity },
                { label: "所得割 合計", value: result.shotokuWari, bold: true },
              ].map(({ label, value, bold }) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-b-0">
                  <span className={`text-sm ${bold ? "font-semibold text-foreground" : "text-muted"}`}>
                    {label}
                  </span>
                  <span className={`text-sm font-mono ${bold ? "font-bold" : ""}`}>
                    {fmt(value)} 円
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 均等割の内訳 */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">均等割（定額）</p>
            <div className="space-y-1">
              {[
                { label: "都道府県民税", value: result.kintouWariPref },
                { label: "市町村民税", value: result.kintouWariCity },
                { label: "均等割 合計", value: result.kintouWari, bold: true },
              ].map(({ label, value, bold }) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-b-0">
                  <span className={`text-sm ${bold ? "font-semibold text-foreground" : "text-muted"}`}>
                    {label}
                  </span>
                  <span className={`text-sm font-mono ${bold ? "font-bold" : ""}`}>
                    {fmt(value)} 円
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted pt-1">
            ※ 本計算は標準的な控除のみを適用した概算です。実際の住民税は各自治体の賦課決定通知書をご確認ください。
          </p>
        </div>
      )}

      {/* 住民税の仕組み説明 */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
        <h3 className="font-bold text-sm mb-3">住民税のしくみ</h3>
        <div className="space-y-3">
          <div className="rounded-xl border border-border p-3">
            <p className="text-sm font-semibold mb-1">所得割</p>
            <p className="text-xs text-muted">
              課税所得に対して一律10%（都道府県民税4% + 市町村民税6%）が課税されます。
            </p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-sm font-semibold mb-1">均等割</p>
            <p className="text-xs text-muted">
              所得に関わらず定額で課税されます。標準税額は年5,000円（都道府県1,500円 + 市町村3,500円）です。
            </p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-sm font-semibold mb-1">納付時期</p>
            <p className="text-xs text-muted">
              前年の所得に対して翌年6月から課税。給与所得者は毎月の給与から特別徴収（天引き）されます。
            </p>
          </div>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center h-20 text-xs text-muted">
        広告
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この住民税 計算機ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">所得・控除から均等割・所得割を算出。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この住民税 計算機ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "所得・控除から均等割・所得割を算出。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
