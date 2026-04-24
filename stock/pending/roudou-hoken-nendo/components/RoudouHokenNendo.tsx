"use client";

import { useState, useMemo } from "react";

type Gyoshu = "ippan" | "kensetsu" | "norin";

const GYOSHU_OPTIONS: { value: Gyoshu; label: string; rousaiRate: number; rousaiLabel: string }[] = [
  { value: "ippan", label: "一般業種", rousaiRate: 3 / 1000, rousaiLabel: "3/1000" },
  { value: "kensetsu", label: "建設業", rousaiRate: 9.5 / 1000, rousaiLabel: "9.5/1000（元請一括）" },
  { value: "norin", label: "農林水産業", rousaiRate: 62 / 1000, rousaiLabel: "62/1000（林業）" },
];

// 雇用保険料率（令和6年度）
// 一般の事業: 事業主 9.5/1000、労働者 6/1000 → 合計 15.5/1000
const KOYOU_JIGYONUSHI_RATE = 9.5 / 1000;
const KOYOU_RODOSHA_RATE = 6 / 1000;
const KOYOU_TOTAL_RATE = KOYOU_JIGYONUSHI_RATE + KOYOU_RODOSHA_RATE;

function formatYen(n: number): string {
  return Math.round(n).toLocaleString("ja-JP") + " 円";
}

export default function RoudouHokenNendo() {
  const [chinginStr, setChinginStr] = useState("");
  const [gyoshu, setGyoshu] = useState<Gyoshu>("ippan");
  const [koyouNinzuStr, setKoyouNinzuStr] = useState("");

  const selected = GYOSHU_OPTIONS.find((g) => g.value === gyoshu)!;

  const result = useMemo(() => {
    const chingin = parseFloat(chinginStr.replace(/,/g, ""));
    const koyouNinzu = parseInt(koyouNinzuStr, 10);

    if (!chingin || chingin <= 0) return null;

    // 労災保険料（全額事業主負担）
    const rousaiRyo = chingin * selected.rousaiRate;

    // 雇用保険料
    const koyouJigyonushi = chingin * KOYOU_JIGYONUSHI_RATE;
    const koyouRodosha = chingin * KOYOU_RODOSHA_RATE;
    const koyouTotal = chingin * KOYOU_TOTAL_RATE;

    // 事業主負担合計（労災全額 + 雇用事業主分）
    const jigyonushiTotal = rousaiRyo + koyouJigyonushi;

    // 概算保険料合計（事業主実負担 = 労災 + 雇用事業主分）
    // ※労働者負担分は給与から天引き
    const gaisanTotal = rousaiRyo + koyouTotal; // 申告書上の合計保険料

    // 月額概算（事業主負担）
    const monthlyJigyonushi = jigyonushiTotal / 12;

    // 雇用保険対象者1人あたり月額（参考）
    const perPersonMonthly =
      koyouNinzu && koyouNinzu > 0
        ? (chingin / koyouNinzu / 12) * KOYOU_RODOSHA_RATE
        : null;

    return {
      rousaiRyo,
      koyouJigyonushi,
      koyouRodosha,
      koyouTotal,
      jigyonushiTotal,
      gaisanTotal,
      monthlyJigyonushi,
      perPersonMonthly,
    };
  }, [chinginStr, selected, koyouNinzuStr]);

  const inputClass =
    "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent pr-10";

  const rowClass = "flex justify-between items-center py-2.5";
  const labelClass = "text-sm text-muted";
  const valueClass = "text-sm font-medium tabular-nums";

  return (
    <div className="space-y-4">
      {/* 入力カード */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">事業情報を入力</h2>

        {/* 年間賃金総額 */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-1">
            年間賃金総額（円）
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="50,000,000"
              value={chinginStr}
              onChange={(e) =>
                setChinginStr(e.target.value.replace(/[^0-9,]/g, ""))
              }
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
              円
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            ※ 4月1日〜翌3月31日の全従業員（パート含む）の賃金総額
          </p>
        </div>

        {/* 業種 */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-2">業種</label>
          <div className="flex flex-col gap-2">
            {GYOSHU_OPTIONS.map((g) => (
              <button
                key={g.value}
                onClick={() => setGyoshu(g.value)}
                className={`flex justify-between items-center px-4 py-2.5 rounded-lg text-sm border transition-all text-left ${
                  gyoshu === g.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-foreground hover:border-primary/50"
                }`}
              >
                <span className="font-medium">{g.label}</span>
                <span className={`text-xs ${gyoshu === g.value ? "text-primary-foreground/70" : "text-muted"}`}>
                  労災料率 {g.rousaiLabel}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 雇用保険対象者数 */}
        <div>
          <label className="block text-xs text-muted mb-1">
            雇用保険対象者数（人）
            <span className="ml-1 text-muted/70">任意・1人あたり参考額の計算に使用</span>
          </label>
          <div className="relative max-w-[160px]">
            <input
              type="text"
              inputMode="numeric"
              placeholder="10"
              value={koyouNinzuStr}
              onChange={(e) =>
                setKoyouNinzuStr(e.target.value.replace(/[^0-9]/g, ""))
              }
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
              人
            </span>
          </div>
        </div>
      </div>

      {/* 結果カード */}
      {result && (
        <div className="bg-card border-2 border-primary/40 rounded-xl p-5 shadow-sm space-y-4">
          {/* 合計ハイライト */}
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted">概算保険料合計（申告書記載額）</p>
            </div>
            <p className="text-3xl font-bold text-primary tabular-nums">
              {formatYen(result.gaisanTotal)}
            </p>
            <p className="text-xs text-muted mt-1">
              うち事業主負担：
              <span className="font-semibold text-foreground">
                {formatYen(result.jigyonushiTotal)}
              </span>
            </p>
          </div>

          {/* 労災保険 */}
          <div>
            <h3 className="text-xs font-bold text-muted uppercase tracking-wide mb-1">
              労災保険料
            </h3>
            <div className="divide-y divide-border">
              <div className={rowClass}>
                <span className={labelClass}>料率（{selected.rousaiLabel}）</span>
                <span className={valueClass}>{formatYen(result.rousaiRyo)}</span>
              </div>
              <div className={rowClass}>
                <span className={labelClass}>負担者</span>
                <span className="text-xs text-muted">全額事業主負担</span>
              </div>
            </div>
          </div>

          {/* 雇用保険 */}
          <div>
            <h3 className="text-xs font-bold text-muted uppercase tracking-wide mb-1">
              雇用保険料
            </h3>
            <div className="divide-y divide-border">
              <div className={rowClass}>
                <span className={labelClass}>事業主負担分（9.5/1000）</span>
                <span className={valueClass}>{formatYen(result.koyouJigyonushi)}</span>
              </div>
              <div className={rowClass}>
                <span className={labelClass}>労働者負担分（6/1000）</span>
                <span className={valueClass}>{formatYen(result.koyouRodosha)}</span>
              </div>
              <div className={rowClass}>
                <span className={`${labelClass} font-medium`}>雇用保険料計（15.5/1000）</span>
                <span className={`${valueClass} font-semibold`}>{formatYen(result.koyouTotal)}</span>
              </div>
            </div>
          </div>

          {/* 月額概算 */}
          <div className="bg-accent rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">月額概算（事業主負担）</span>
              <span className="text-base font-bold tabular-nums">
                {formatYen(result.monthlyJigyonushi / 1)} / 月
              </span>
            </div>
            {result.perPersonMonthly !== null && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-muted">
                  労働者1人あたり月額天引き目安
                </span>
                <span className="text-xs font-medium tabular-nums">
                  約 {formatYen(result.perPersonMonthly)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 料率早見表 */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-3">保険料率早見表（令和6年度）</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-2 font-medium text-muted">業種</th>
                <th className="text-right py-2 px-2 font-medium text-muted">労災料率</th>
                <th className="text-right py-2 px-2 font-medium text-muted">雇用（事業主）</th>
                <th className="text-right py-2 pl-2 font-medium text-muted">雇用（労働者）</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {GYOSHU_OPTIONS.map((g) => (
                <tr
                  key={g.value}
                  className={gyoshu === g.value ? "bg-primary/5 font-semibold" : ""}
                >
                  <td className="py-2 pr-2">{g.label}</td>
                  <td className="text-right py-2 px-2 tabular-nums">{g.rousaiLabel}</td>
                  <td className="text-right py-2 px-2 tabular-nums">9.5/1000</td>
                  <td className="text-right py-2 pl-2 tabular-nums">6/1000</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-3">
          ※ 建設業の労災料率は工事の種類により異なります（9.5〜62/1000）。
          農林水産業は事業形態により異なります。正確な料率は最寄りの労働基準監督署にご確認ください。
        </p>
      </div>

      {/* 免責事項 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-bold">免責事項：</span>
          本ツールは令和6年度の標準的な保険料率をもとにした概算計算ツールです。
          実際の保険料は業種・事業形態・雇用形態により異なります。
          確定申告・概算保険料の申告は所轄の都道府県労働局または労働基準監督署にお問い合わせください。
          本ツールの計算結果を根拠とした損害について一切の責任を負いません。
        </p>
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
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この労働保険 年度更新計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">年1回の労災保険・雇用保険概算・確定保険料を一括計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この労働保険 年度更新計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "年1回の労災保険・雇用保険概算・確定保険料を一括計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
