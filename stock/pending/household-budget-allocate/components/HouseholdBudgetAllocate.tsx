"use client";

import { useState, useMemo } from "react";

const CATEGORIES = [
  {
    key: "needs",
    label: "必要支出",
    defaultRatio: 50,
    color: "bg-blue-500",
    colorLight: "bg-blue-100",
    colorText: "text-blue-700",
    colorBorder: "border-blue-300",
    description: "生活に必要な固定・変動費",
    examples: ["家賃・住宅ローン", "食費・日用品", "光熱費・水道代", "通信費", "保険料", "交通費"],
  },
  {
    key: "wants",
    label: "欲求支出",
    defaultRatio: 30,
    color: "bg-orange-400",
    colorLight: "bg-orange-100",
    colorText: "text-orange-700",
    colorBorder: "border-orange-300",
    description: "生活を豊かにする選択的な支出",
    examples: ["趣味・娯楽", "外食・カフェ", "旅行・レジャー", "サブスク・動画配信", "ファッション", "美容・エステ"],
  },
  {
    key: "savings",
    label: "貯蓄・投資",
    defaultRatio: 20,
    color: "bg-green-500",
    colorLight: "bg-green-100",
    colorText: "text-green-700",
    colorBorder: "border-green-300",
    description: "将来のための資産形成",
    examples: ["普通預金・定期預金", "NISA・iDeCo", "株式・投資信託", "奨学金・ローン返済", "緊急予備費", "教育資金"],
  },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

export default function HouseholdBudgetAllocate() {
  const [income, setIncome] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [ratios, setRatios] = useState<Record<CategoryKey, number>>({
    needs: 50,
    wants: 30,
    savings: 20,
  });

  const incomeValue = useMemo(() => {
    const v = parseFloat(income.replace(/,/g, ""));
    return isNaN(v) || v <= 0 ? 0 : v;
  }, [income]);

  const allocations = useMemo(() =>
    CATEGORIES.map((cat) => ({
      ...cat,
      ratio: ratios[cat.key],
      amount: incomeValue * (ratios[cat.key] / 100),
    })),
    [incomeValue, ratios]
  );

  const ratioSum = ratios.needs + ratios.wants + ratios.savings;
  const ratioValid = ratioSum === 100;

  function handleRatioChange(key: CategoryKey, value: number) {
    setRatios((prev) => ({ ...prev, [key]: value }));
  }

  function resetRatios() {
    setRatios({ needs: 50, wants: 30, savings: 20 });
  }

  const inputClass =
    "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-background pr-12";

  return (
    <div className="space-y-4">
      {/* Income input */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
        <h2 className="font-bold text-base mb-4">手取り月収を入力</h2>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            placeholder="250,000"
            value={income}
            onChange={(e) => setIncome(e.target.value.replace(/[^0-9,]/g, ""))}
            className={inputClass}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
            円
          </span>
        </div>
        <p className="text-xs text-muted mt-2">
          ※ 手取り = 給与から税金・社会保険料を引いた実際の受取額
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setCustomMode(false); resetRatios(); }}
          className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
            !customMode
              ? "bg-accent text-white border-accent"
              : "bg-background border-border text-muted hover:border-accent/50"
          }`}
        >
          50/30/20 ルール
        </button>
        <button
          onClick={() => setCustomMode(true)}
          className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
            customMode
              ? "bg-accent text-white border-accent"
              : "bg-background border-border text-muted hover:border-accent/50"
          }`}
        >
          カスタム比率
        </button>
      </div>

      {/* Custom ratio sliders */}
      {customMode && (
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-sm">比率を調整</h3>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                ratioValid
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              合計 {ratioSum}%{ratioValid ? " ✓" : " (100%にしてください)"}
            </span>
          </div>
          {CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <div className="flex justify-between text-xs mb-1">
                <span className={`font-medium ${cat.colorText}`}>{cat.label}</span>
                <span className="font-mono font-bold">{ratios[cat.key]}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={ratios[cat.key]}
                onChange={(e) => handleRatioChange(cat.key, Number(e.target.value))}
                className="w-full accent-current"
                style={{ accentColor: cat.key === "needs" ? "#3b82f6" : cat.key === "wants" ? "#fb923c" : "#22c55e" }}
              />
            </div>
          ))}
          <button
            onClick={resetRatios}
            className="text-xs text-muted underline underline-offset-2 hover:text-foreground transition-colors"
          >
            50/30/20にリセット
          </button>
        </div>
      )}

      {/* Pie chart */}
      {incomeValue > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
          <h3 className="font-bold text-sm mb-3">配分の内訳</h3>

          {/* Bar chart (div-based) */}
          <div className="flex rounded-xl overflow-hidden h-10 mb-4">
            {allocations.map((cat) => (
              <div
                key={cat.key}
                className={`${cat.color} flex items-center justify-center transition-all duration-300`}
                style={{ width: `${cat.ratio}%` }}
                title={`${cat.label}: ${cat.ratio}%`}
              >
                {cat.ratio >= 10 && (
                  <span className="text-white text-xs font-bold">{cat.ratio}%</span>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 mb-4">
            {allocations.map((cat) => (
              <div key={cat.key} className="flex items-center gap-1.5 text-xs">
                <span className={`w-3 h-3 rounded-sm ${cat.color} flex-shrink-0`} />
                <span className="text-muted">{cat.label}</span>
              </div>
            ))}
          </div>

          {/* Amount cards */}
          <div className="space-y-3">
            {allocations.map((cat) => (
              <div
                key={cat.key}
                className={`rounded-xl border ${cat.colorBorder} ${cat.colorLight} p-3`}
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className={`text-sm font-semibold ${cat.colorText}`}>
                    {cat.label}
                    <span className="ml-1.5 text-xs font-normal opacity-70">
                      ({cat.ratio}%)
                    </span>
                  </span>
                  <span className={`text-xl font-bold ${cat.colorText}`}>
                    {fmt(cat.amount)}
                    <span className="text-sm font-normal ml-0.5">円</span>
                  </span>
                </div>
                <p className="text-xs text-muted mb-2">{cat.description}</p>
                <div className="flex flex-wrap gap-1">
                  {cat.examples.map((ex) => (
                    <span
                      key={ex}
                      className={`text-xs px-2 py-0.5 rounded-full bg-white/70 ${cat.colorText} border ${cat.colorBorder}`}
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary table when income is entered */}
      {incomeValue > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
          <h3 className="font-bold text-sm mb-3">年間換算</h3>
          <div className="divide-y divide-border">
            {allocations.map((cat) => (
              <div key={cat.key} className="flex justify-between items-center py-2.5">
                <span className={`text-sm ${cat.colorText} font-medium`}>{cat.label}</span>
                <div className="text-right">
                  <div className="text-sm font-bold">{fmt(cat.amount * 12)} 円/年</div>
                  <div className="text-xs text-muted">{fmt(cat.amount)} 円/月</div>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm font-bold">手取り合計</span>
              <div className="text-right">
                <div className="text-sm font-bold">{fmt(incomeValue * 12)} 円/年</div>
                <div className="text-xs text-muted">{fmt(incomeValue)} 円/月</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
        <h3 className="font-bold text-sm mb-3">50/30/20 ルールとは</h3>
        <div className="space-y-2 text-xs text-muted">
          <p>
            アメリカの経済学者エリザベス・ウォーレンが提唱した家計管理の黄金比率。
            手取り収入を3つのカテゴリに分けるシンプルなルールです。
          </p>
          <div className="space-y-1.5 mt-2">
            <div className="flex gap-2">
              <span className="w-5 h-5 rounded bg-blue-500 flex-shrink-0" />
              <span><strong className="text-foreground">必要支出 50%</strong> — 生活に不可欠な支出。これを超えると生活が苦しくなります。</span>
            </div>
            <div className="flex gap-2">
              <span className="w-5 h-5 rounded bg-orange-400 flex-shrink-0" />
              <span><strong className="text-foreground">欲求支出 30%</strong> — 人生を豊かにする自由な使い道。削れるが削りすぎると継続困難。</span>
            </div>
            <div className="flex gap-2">
              <span className="w-5 h-5 rounded bg-green-500 flex-shrink-0" />
              <span><strong className="text-foreground">貯蓄・投資 20%</strong> — 将来の自分への投資。先取り貯蓄が成功の鍵。</span>
            </div>
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
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この家計予算配分（50/30/20ルール）ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">手取りから必要・欲求・貯蓄への配分を視覚化。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この家計予算配分（50/30/20ルール）ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "手取りから必要・欲求・貯蓄への配分を視覚化。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
