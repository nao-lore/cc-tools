"use client";

import { useState, useMemo } from "react";

// Conversion constants
const TSUBO_TO_SQM = 3.30579;

// Tatami sizes (㎡ per mat)
const TATAMI = {
  edo: { label: "江戸間", sqm: 1.548 },
  kyo: { label: "京間", sqm: 1.824 },
} as const;

type TatamiKey = keyof typeof TATAMI;

// Floor plan presets
type FloorPlan = {
  label: string;
  minSqm: number;
  maxSqm: number;
  description: string;
  color: string;
};

const FLOOR_PLANS: FloorPlan[] = [
  { label: "1R",   minSqm: 20, maxSqm: 25,  description: "居室1つ・キッチン一体",   color: "bg-blue-400" },
  { label: "1K",   minSqm: 23, maxSqm: 28,  description: "居室1つ・独立キッチン",   color: "bg-blue-500" },
  { label: "1DK",  minSqm: 25, maxSqm: 35,  description: "居室1つ・DK付き",         color: "bg-violet-500" },
  { label: "1LDK", minSqm: 30, maxSqm: 45,  description: "居室1つ・LDK付き",        color: "bg-violet-600" },
  { label: "2DK",  minSqm: 35, maxSqm: 50,  description: "居室2つ・DK付き",         color: "bg-emerald-500" },
  { label: "2LDK", minSqm: 50, maxSqm: 70,  description: "居室2つ・LDK付き",        color: "bg-emerald-600" },
  { label: "3LDK", minSqm: 65, maxSqm: 85,  description: "居室3つ・LDK付き",        color: "bg-orange-500" },
  { label: "4LDK", minSqm: 80, maxSqm: 100, description: "居室4つ・LDK付き",        color: "bg-orange-600" },
];

const MAX_SQM = FLOOR_PLANS[FLOOR_PLANS.length - 1].maxSqm;

function fmt(n: number, d = 1): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return n.toFixed(d);
}

function sqmToTsubo(sqm: number): number {
  return sqm / TSUBO_TO_SQM;
}

function sqmToTatami(sqm: number, key: TatamiKey): number {
  return sqm / TATAMI[key].sqm;
}

function guessFloorPlan(sqm: number): FloorPlan | null {
  // Return the plan whose midpoint is closest
  let best: FloorPlan | null = null;
  let bestDist = Infinity;
  for (const plan of FLOOR_PLANS) {
    const mid = (plan.minSqm + plan.maxSqm) / 2;
    const dist = Math.abs(sqm - mid);
    if (dist < bestDist) {
      bestDist = dist;
      best = plan;
    }
  }
  return best;
}

const labelClass = "text-xs text-muted mb-1 block";
const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-surface";

export default function JouuMenseki() {
  const [tatamiKey, setTatamiKey] = useState<TatamiKey>("edo");
  const [inputSqm, setInputSqm] = useState("");

  const inputVal = parseFloat(inputSqm);
  const hasInput = !isNaN(inputVal) && inputVal > 0;

  const guessed = useMemo(() => {
    if (!hasInput) return null;
    return guessFloorPlan(inputVal);
  }, [inputVal, hasInput]);

  const tabClass = (key: TatamiKey) =>
    `flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
      tatamiKey === key
        ? "bg-accent text-white border-accent"
        : "bg-surface border-border text-muted hover:border-primary"
    }`;

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* ㎡ input → 間取り推定 */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <h2 className="font-semibold text-base">面積から間取りを推定</h2>
        <div>
          <label className={labelClass}>物件の専有面積（㎡）</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.1"
              className={inputClass + " pr-10"}
              value={inputSqm}
              onChange={(e) => setInputSqm(e.target.value)}
              placeholder="例：55.0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">
              ㎡
            </span>
          </div>
        </div>

        {hasInput && (
          <div className="space-y-2 pt-1">
            {/* Converted values */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-border p-3 text-center">
                <div className="text-xs text-muted mb-0.5">㎡</div>
                <div className="text-lg font-mono font-semibold">{fmt(inputVal, 2)}</div>
              </div>
              <div className="rounded-xl border border-border p-3 text-center">
                <div className="text-xs text-muted mb-0.5">坪</div>
                <div className="text-lg font-mono font-semibold">{fmt(sqmToTsubo(inputVal), 2)}</div>
              </div>
              <div className="rounded-xl border border-border p-3 text-center">
                <div className="text-xs text-muted mb-0.5">
                  畳（{TATAMI[tatamiKey].label}）
                </div>
                <div className="text-lg font-mono font-semibold">
                  {fmt(sqmToTatami(inputVal, tatamiKey), 1)}
                </div>
              </div>
            </div>

            {/* Guess result */}
            {guessed && (
              <div className="flex items-center gap-3 rounded-xl border border-accent bg-accent/5 px-4 py-3">
                <span className="text-2xl font-bold text-accent">{guessed.label}</span>
                <div className="text-sm">
                  <div className="font-medium">に相当する広さです</div>
                  <div className="text-muted text-xs">{guessed.description}（目安：{guessed.minSqm}〜{guessed.maxSqm}㎡）</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tatami type selector */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">間取り別 面積早見表</h2>
          <div className="flex gap-1.5">
            {(Object.keys(TATAMI) as TatamiKey[]).map((key) => (
              <button key={key} className={tabClass(key)} onClick={() => setTatamiKey(key)}>
                {TATAMI[key].label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-muted font-medium w-16">間取り</th>
                <th className="text-right py-2 px-2 text-muted font-medium">㎡ (目安)</th>
                <th className="text-right py-2 px-2 text-muted font-medium">坪</th>
                <th className="text-right py-2 px-2 text-muted font-medium">畳数</th>
                <th className="px-2 w-40"></th>
              </tr>
            </thead>
            <tbody>
              {FLOOR_PLANS.map((plan) => {
                const midSqm = (plan.minSqm + plan.maxSqm) / 2;
                const minTsubo = sqmToTsubo(plan.minSqm);
                const maxTsubo = sqmToTsubo(plan.maxSqm);
                const minTatami = sqmToTatami(plan.minSqm, tatamiKey);
                const maxTatami = sqmToTatami(plan.maxSqm, tatamiKey);
                const barWidth = Math.round((midSqm / MAX_SQM) * 100);
                const isGuessed = guessed?.label === plan.label;

                return (
                  <tr
                    key={plan.label}
                    className={`border-b border-border/50 transition-colors ${
                      isGuessed ? "bg-accent/5" : "hover:bg-surface/50"
                    }`}
                  >
                    <td className="py-2.5 px-2">
                      <span
                        className={`inline-block font-bold text-sm ${
                          isGuessed ? "text-accent" : ""
                        }`}
                      >
                        {plan.label}
                        {isGuessed && (
                          <span className="ml-1 text-[10px] bg-accent text-white rounded px-1">推定</span>
                        )}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-xs">
                      {plan.minSqm}〜{plan.maxSqm}
                      <span className="text-muted ml-0.5">㎡</span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-xs">
                      {fmt(minTsubo, 1)}〜{fmt(maxTsubo, 1)}
                      <span className="text-muted ml-0.5">坪</span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-xs">
                      {fmt(minTatami, 1)}〜{fmt(maxTatami, 1)}
                      <span className="text-muted ml-0.5">畳</span>
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="relative h-4 rounded overflow-hidden bg-border/30">
                        <div
                          className={`absolute left-0 top-0 h-full rounded ${plan.color} opacity-70 transition-all`}
                          style={{ width: `${barWidth}%` }}
                        />
                      
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この間取り面積 早見表ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">1R〜4LDKの間取り別の標準面積と畳数を一覧表示。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この間取り面積 早見表ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "1R〜4LDKの間取り別の標準面積と畳数を一覧表示。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted">
          ※ 畳数は{TATAMI[tatamiKey].label}（1畳={TATAMI[tatamiKey].sqm}㎡）で計算。㎡範囲は一般的な目安です。
        </p>
      </div>

      {/* Regional tatami reference */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h2 className="font-semibold text-base mb-3">地域別畳サイズ</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "京間（本間）",   sqm: 1.824, region: "関西・西日本", width: "955×1910mm" },
            { label: "中京間（三六間）", sqm: 1.656, region: "中部・東北など", width: "910×1820mm" },
            { label: "江戸間（関東間）", sqm: 1.548, region: "関東・東日本", width: "880×1760mm" },
            { label: "団地間（公団間）", sqm: 1.445, region: "公団・集合住宅", width: "850×1700mm" },
          ].map((t) => (
            <div key={t.label} className="rounded-xl border border-border p-3">
              <div className="font-medium text-sm">{t.label}</div>
              <div className="text-xs text-muted mt-0.5">{t.region}</div>
              <div className="text-xs text-muted">{t.width}</div>
              <div className="text-base font-mono font-semibold mt-1">
                {t.sqm}
                <span className="text-xs font-normal text-muted">㎡/枚</span>
              </div>
              {/* Visual mat size bar */}
              <div className="mt-2 relative h-2 rounded bg-border/30 overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full rounded bg-accent/60"
                  style={{ width: `${Math.round((t.sqm / 1.824) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-2">
          ※ バーは京間を100%とした相対サイズ。同じ「6畳」でも地域により実面積が異なります。
        </p>
      </div>

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 text-center text-muted text-sm h-24 flex items-center justify-center">
        広告
      </div>
    </div>
  );
}
