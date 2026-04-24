"use client";

import { useState, useMemo } from "react";

// --- Types ---
type TaishokuRiyu = "jiko" | "kaisha" | "tokutei";
type NenreiKbn = "u30" | "30-34" | "35-44" | "45-59" | "60-64";

// --- Constants ---

// 基本手当日額の給付率: 賃金日額に応じた給付率 (50%〜80%)
// 厚生労働省の算定式を簡略化: 賃金日額が低いほど高率、高いほど低率
// 上限・下限は令和6年度基準
const KYUFU_RATE_UPPER = 13580; // 賃金日額上限 (60歳未満)
const KYUFU_RATE_UPPER_60 = 11300; // 賃金日額上限 (60-64歳)
const KYUFU_RATE_LOWER = 2746; // 賃金日額下限

const NICHIGAKU_UPPER_U60 = 8490; // 基本手当日額上限 (60歳未満)
const NICHIGAKU_UPPER_60 = 7294; // 基本手当日額上限 (60-64歳)
const NICHIGAKU_LOWER = 2196; // 基本手当日額下限 (最低賃金80%)

// 給付率の算出 (賃金日額に応じた段階的計算)
function calcKyufuRate(wageDayAmt: number, is60over: boolean): number {
  const upper = is60over ? KYUFU_RATE_UPPER_60 : KYUFU_RATE_UPPER;
  // 正規化: 0〜1 の範囲で賃金日額の相対位置を計算
  const ratio = Math.min(1, Math.max(0, wageDayAmt / upper));
  // 高賃金 → 低率(50%)、低賃金 → 高率(80%)の線形補完
  if (is60over) {
    // 60-64歳: 45%〜80%
    return 0.8 - ratio * 0.35;
  }
  return 0.8 - ratio * 0.3;
}

// 基本手当日額の計算
function calcNichigaku(wageDayAmt: number, is60over: boolean): number {
  const rate = calcKyufuRate(wageDayAmt, is60over);
  const raw = wageDayAmt * rate;
  const upper = is60over ? NICHIGAKU_UPPER_60 : NICHIGAKU_UPPER_U60;
  return Math.round(Math.min(upper, Math.max(NICHIGAKU_LOWER, raw)));
}

// 所定給付日数テーブル (退職理由×年齢×被保険者期間)
// [被保険者期間区分: 1年未満, 1-5, 5-10, 10-20, 20年以上]
const KYUFU_DAYS: Record<TaishokuRiyu, Record<NenreiKbn, number[]>> = {
  // 自己都合・定年退職
  jiko: {
    "u30":  [  0,  90,  90, 120, 150],
    "30-34":[  0,  90,  90, 120, 180],
    "35-44":[  0,  90,  90, 150, 240],
    "45-59":[  0,  90, 180, 240, 270],
    "60-64":[  0,  90, 150, 180, 210],
  },
  // 会社都合 (特定受給資格者)
  kaisha: {
    "u30":  [ 90,  90, 120, 180, 240],
    "30-34":[ 90,  90, 180, 210, 240],
    "35-44":[ 90,  90, 180, 240, 270],
    "45-59":[ 90, 180, 240, 270, 330],
    "60-64":[ 90, 150, 180, 210, 240],
  },
  // 特定理由離職者 (育児・介護等やむを得ない事情)
  tokutei: {
    "u30":  [ 90,  90, 120, 180, 240],
    "30-34":[ 90,  90, 180, 210, 240],
    "35-44":[ 90,  90, 180, 240, 270],
    "45-59":[ 90, 180, 240, 270, 330],
    "60-64":[ 90, 150, 180, 210, 240],
  },
};

// 被保険者期間区分インデックスを返す
function getHokenKbn(years: number): number {
  if (years < 1)  return 0;
  if (years < 5)  return 1;
  if (years < 10) return 2;
  if (years < 20) return 3;
  return 4;
}

// 年齢区分ラベル
const NENREI_OPTIONS: { value: NenreiKbn; label: string }[] = [
  { value: "u30",   label: "30歳未満" },
  { value: "30-34", label: "30〜34歳" },
  { value: "35-44", label: "35〜44歳" },
  { value: "45-59", label: "45〜59歳" },
  { value: "60-64", label: "60〜64歳" },
];

// 退職理由ラベル
const RIYU_OPTIONS: { value: TaishokuRiyu; label: string; desc: string }[] = [
  { value: "jiko",    label: "自己都合",   desc: "自ら希望して退職" },
  { value: "kaisha",  label: "会社都合",   desc: "解雇・倒産・雇止めなど" },
  { value: "tokutei", label: "特定理由",   desc: "育児・介護・病気等やむを得ない事情" },
];

const selectClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent";

const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent pr-12";

export default function ShitsugyouKyufu() {
  const [riyu, setRiyu] = useState<TaishokuRiyu>("jiko");
  const [nenrei, setNenrei] = useState<NenreiKbn>("30-34");
  const [chinginGoukei, setChinginGoukei] = useState("");
  const [hokenNen, setHokenNen] = useState("");

  const result = useMemo(() => {
    const chingin = parseFloat(chinginGoukei);
    const nen = parseFloat(hokenNen);

    if (!chingin || !nen || chingin <= 0 || nen < 0) return null;

    const wageDayAmt = chingin / 180;
    if (wageDayAmt < KYUFU_RATE_LOWER) return null;

    const is60over = nenrei === "60-64";
    const nichigaku = calcNichigaku(wageDayAmt, is60over);
    const hokenKbn = getHokenKbn(nen);
    const kyufuDays = KYUFU_DAYS[riyu][nenrei][hokenKbn];

    const sougaku = nichigaku * kyufuDays;

    const clampedWage = Math.min(
      wageDayAmt,
      is60over ? KYUFU_RATE_UPPER_60 : KYUFU_RATE_UPPER
    );
    const kyufuRate = calcKyufuRate(clampedWage, is60over);

    return {
      wageDayAmt,
      nichigaku,
      kyufuDays,
      sougaku,
      kyufuRate,
      hokenKbn,
    };
  }, [riyu, nenrei, chinginGoukei, hokenNen]);

  const fmt = (n: number) =>
    n.toLocaleString("ja-JP", { maximumFractionDigits: 0 });
  const fmtRate = (r: number) => `${Math.round(r * 100)}%`;

  // 給付日数区分ラベル
  const hokenKbnLabels = ["1年未満", "1〜5年", "5〜10年", "10〜20年", "20年以上"];

  return (
    <div className="space-y-4">
      {/* 入力カード */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">条件を入力</h2>

        {/* 退職理由 */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-2">退職理由</label>
          <div className="space-y-2">
            {RIYU_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRiyu(opt.value)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all ${
                  riyu === opt.value
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-card border-border text-foreground hover:border-primary/50"
                }`}
              >
                <span className="font-medium text-sm">{opt.label}</span>
                <span className="text-xs text-muted ml-2">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 年齢 */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-1">年齢区分（離職時）</label>
          <select
            value={nenrei}
            onChange={(e) => setNenrei(e.target.value as NenreiKbn)}
            className={selectClass}
          >
            {NENREI_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 離職前6ヶ月の賃金合計 */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-1">
            離職前6ヶ月の賃金合計
            <span className="ml-1 text-muted/70">（交通費・残業代含む総支給額）</span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="1800000"
              value={chinginGoukei}
              onChange={(e) => setChinginGoukei(e.target.value.replace(/[^0-9]/g, ""))}
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">円</span>
          </div>
        </div>

        {/* 被保険者期間 */}
        <div>
          <label className="block text-xs text-muted mb-1">雇用保険の被保険者期間（年）</label>
          <div className="relative max-w-[200px]">
            <input
              type="text"
              inputMode="decimal"
              placeholder="3"
              value={hokenNen}
              onChange={(e) => setHokenNen(e.target.value.replace(/[^0-9.]/g, ""))}
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">年</span>
          </div>
        </div>
      </div>

      {/* 結果カード */}
      {result && (
        <div className="bg-card border-2 border-primary/40 rounded-xl p-5 shadow-sm space-y-4">
          {/* メイン結果 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary/10 rounded-xl p-4 text-center">
              <p className="text-xs text-muted mb-1">基本手当日額</p>
              <p className="text-3xl font-bold text-primary">
                {fmt(result.nichigaku)}
              </p>
              <p className="text-xs text-muted mt-1">円 / 日</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-xs text-muted mb-1">所定給付日数</p>
              <p className="text-3xl font-bold text-green-600">
                {result.kyufuDays}
              </p>
              <p className="text-xs text-muted mt-1">日間</p>
            </div>
          </div>

          {/* 総支給額 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-xs text-muted mb-1">最大総支給額（概算）</p>
            <p className="text-4xl font-bold text-amber-700">
              {fmt(result.sougaku)}
            </p>
            <p className="text-xs text-muted mt-1">円</p>
          </div>

          {/* 計算内訳 */}
          <div className="divide-y divide-border">
            {[
              { label: "賃金日額（6ヶ月÷180日）", value: `${fmt(result.wageDayAmt)} 円` },
              { label: "給付率", value: fmtRate(result.kyufuRate) },
              { label: "被保険者期間区分", value: hokenKbnLabels[result.hokenKbn] },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2.5">
                <span className="text-sm text-muted">{label}</span>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>

          {result.kyufuDays === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              自己都合退職かつ被保険者期間が1年未満の場合、給付を受けられません。
            </div>
          )}
        </div>
      )}

      {/* 広告プレースホルダー */}
      <div className="bg-card border border-dashed border-border rounded-xl p-4 flex items-center justify-center h-24 text-xs text-muted">
        広告
      </div>

      {/* 給付日数参照テーブル */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-3">所定給付日数の早見表（日）</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted/20">
                <th className="text-left px-2 py-2 font-medium text-muted border border-border">退職理由</th>
                <th className="text-left px-2 py-2 font-medium text-muted border border-border">年齢</th>
                {hokenKbnLabels.map((l) => (
                  <th key={l} className="px-2 py-2 font-medium text-muted border border-border text-center">
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RIYU_OPTIONS.map((ropt) =>
                NENREI_OPTIONS.map((nopt, ni) => {
                  const isActive = riyu === ropt.value && nenrei === nopt.value;
                  return (
                    <tr
                      key={`${ropt.value}-${nopt.value}`}
                      className={isActive ? "bg-primary/10 font-bold" : ni % 2 === 0 ? "bg-card" : "bg-muted/5"}
                    >
                      {ni === 0 && (
                        <td
                          className="px-2 py-1.5 border border-border text-muted"
                          rowSpan={NENREI_OPTIONS.length}
                        >
                          {ropt.label}
                        </td>
                      )}
                      <td className="px-2 py-1.5 border border-border text-muted whitespace-nowrap">
                        {nopt.label}
                      </td>
                      {KYUFU_DAYS[ropt.value][nopt.value].map((d, di) => (
                        <td
                          key={di}
                          className={`px-2 py-1.5 border border-border text-center ${
                            isActive && di === result?.hokenKbn
                              ? "bg-primary text-primary-foreground rounded"
                              : d === 0
                              ? "text-muted/40"
                              : ""
                          }`}
                        >
                          {d === 0 ? "—" : d}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-3">
          出典: 厚生労働省「雇用保険制度」。令和6年度基準。特定受給資格者は45歳以上の上限緩和を含む。
        </p>
      </div>

      {/* 免責 */}
      <div className="bg-muted/10 border border-border rounded-xl p-4 text-xs text-muted space-y-1">
        <p className="font-semibold text-foreground/70">ご注意</p>
        <p>
          本ツールは概算を算出するものであり、実際の給付額は管轄のハローワークが決定します。
          賃金日額の上限・下限・給付率は毎年改定されます。正確な金額は離職後にハローワークへご確認ください。
        </p>
        <p>
          待機期間（7日間）および自己都合の場合の給付制限期間（原則2ヶ月）は考慮していません。
        </p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この失業給付金 計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">退職理由・年齢・賃金・被保険者期間から給付額と給付日数を算出。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この失業給付金 計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "退職理由・年齢・賃金・被保険者期間から給付額と給付日数を算出。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "失業給付金 計算",
  "description": "退職理由・年齢・賃金・被保険者期間から給付額と給付日数を算出",
  "url": "https://tools.loresync.dev/shitsugyou-kyufu",
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
