"use client";

import { useState, useMemo } from "react";

type Gyoshu = "一般" | "建設" | "農林水産";

const RATES: Record<Gyoshu, { worker: number; employer: number }> = {
  一般: { worker: 6 / 1000, employer: 9.5 / 1000 },
  建設: { worker: 7 / 1000, employer: 11.5 / 1000 },
  農林水産: { worker: 7 / 1000, employer: 10.5 / 1000 },
};

const GYOSHU_OPTIONS: Gyoshu[] = ["一般", "建設", "農林水産"];

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

export default function KoyouHokenTesuryou() {
  const [wage, setWage] = useState<string>("300000");
  const [gyoshu, setGyoshu] = useState<Gyoshu>("一般");

  const result = useMemo(() => {
    const w = Number(wage.replace(/,/g, ""));
    if (!w || w <= 0) return null;
    const { worker, employer } = RATES[gyoshu];
    const workerAmount = Math.floor(w * worker);
    const employerAmount = Math.floor(w * employer);
    const total = workerAmount + employerAmount;
    return {
      workerAmount,
      employerAmount,
      total,
      workerYearly: workerAmount * 12,
      employerYearly: employerAmount * 12,
      totalYearly: total * 12,
      workerRate: worker * 1000,
      employerRate: employer * 1000,
    };
  }, [wage, gyoshu]);

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">条件を入力</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1.5">
              月間賃金（円）
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={1000}
                value={wage}
                onChange={(e) => setWage(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent pr-8"
                placeholder="例: 300000"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                円
              </span>
            </div>
          </div>

          <OptionGroup
            label="業種"
            options={GYOSHU_OPTIONS}
            value={gyoshu}
            onChange={(v) => setGyoshu(v as Gyoshu)}
          />
        </div>
      </div>

      {/* Result card */}
      {result ? (
        <div className="bg-card border-2 border-primary/40 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <p className="text-xs text-muted mb-1">合計保険料（月額）</p>
            <p className="text-5xl font-bold text-primary">
              {result.total.toLocaleString()}
              <span className="text-2xl font-semibold ml-1">円</span>
            </p>
          </div>

          <div className="divide-y divide-border">
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-muted">
                労働者負担（{result.workerRate}‰）
              </span>
              <span className="text-sm font-medium">
                {result.workerAmount.toLocaleString()}円
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-muted">
                事業主負担（{result.employerRate}‰）
              </span>
              <span className="text-sm font-medium">
                {result.employerAmount.toLocaleString()}円
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-muted">年額合計</span>
              <span className="text-sm font-medium">
                {result.totalYearly.toLocaleString()}円
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-muted">労働者負担（年額）</span>
              <span className="text-sm font-medium">
                {result.workerYearly.toLocaleString()}円
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-muted">事業主負担（年額）</span>
              <span className="text-sm font-medium">
                {result.employerYearly.toLocaleString()}円
              </span>
            </div>
          </div>

          <p className="text-xs text-muted">
            ※ 2024年度の雇用保険料率を使用。1円未満切り捨て。賞与・通勤手当等も含む賃金総額が対象です。
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center justify-center h-32 text-sm text-muted">
          月間賃金を入力してください
        </div>
      )}

      {/* Rate table */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-3">2024年度 料率一覧</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted font-medium">業種</th>
                <th className="text-right py-2 text-muted font-medium">労働者</th>
                <th className="text-right py-2 text-muted font-medium">事業主</th>
                <th className="text-right py-2 text-muted font-medium">合計</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {GYOSHU_OPTIONS.map((g) => (
                <tr
                  key={g}
                  className={`transition-all ${
                    gyoshu === g ? "bg-primary/5 font-medium" : ""
                  }`}
                >
                  <td className="py-2">{g}</td>
                  <td className="text-right py-2">
                    {RATES[g].worker * 1000}‰
                  </td>
                  <td className="text-right py-2">
                    {RATES[g].employer * 1000}‰
                  </td>
                  <td className="text-right py-2">
                    {(RATES[g].worker + RATES[g].employer) * 1000}‰
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この雇用保険料 計算（労使折半）ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">賃金から労働者負担・事業主負担を分けて算出。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この雇用保険料 計算（労使折半）ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "賃金から労働者負担・事業主負担を分けて算出。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
