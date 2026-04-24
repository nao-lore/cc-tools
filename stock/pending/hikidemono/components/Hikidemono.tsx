"use client";
import { useState } from "react";

const GOSHUGI_PRESETS = [10000, 20000, 30000, 50000, 70000, 100000];

type GuestType = "friend" | "colleague" | "family" | "relative";

const GUEST_LABELS: Record<GuestType, string> = {
  friend: "友人・知人",
  colleague: "同僚・上司",
  family: "家族・親族（近）",
  relative: "親族（遠縁）",
};

const RATIO_BY_TYPE: Record<GuestType, number> = {
  friend: 0.33,
  colleague: 0.35,
  family: 0.4,
  relative: 0.38,
};

interface Breakdown {
  hikidemono: number;
  hikigashi: number;
  engimono: number;
  total: number;
}

function calcBreakdown(goshugi: number, guestType: GuestType): Breakdown {
  const ratio = RATIO_BY_TYPE[guestType];
  const total = Math.round((goshugi * ratio) / 100) * 100;
  // 引き菓子は引き出物総額の30%程度、縁起物は15%程度
  const hikigashi = Math.round((total * 0.3) / 100) * 100;
  const engimono = Math.round((total * 0.15) / 100) * 100;
  const hikidemono = total - hikigashi - engimono;
  return { hikidemono, hikigashi, engimono, total };
}

function fmt(n: number) {
  return n.toLocaleString("ja-JP");
}

const HIKIDEMONO_SUGGESTIONS = [
  { range: [0, 5000], items: ["カタログギフト（プチ）", "タオルセット", "お菓子詰め合わせ"] },
  { range: [5001, 10000], items: ["カタログギフト（スタンダード）", "食器セット", "グルメギフト"] },
  { range: [10001, 20000], items: ["カタログギフト（プレミアム）", "ブランド食器", "高級食品セット"] },
  { range: [20001, Infinity], items: ["カタログギフト（最上位）", "高級ブランド品", "体験型ギフト"] },
];

export default function Hikidemono() {
  const [goshugi, setGoshugi] = useState(30000);
  const [customGoshugi, setCustomGoshugi] = useState("");
  const [guestType, setGuestType] = useState<GuestType>("friend");
  const [useCustom, setUseCustom] = useState(false);

  const effectiveGoshugi = useCustom
    ? parseInt(customGoshugi.replace(/,/g, ""), 10) || 0
    : goshugi;

  const bd = calcBreakdown(effectiveGoshugi, guestType);

  const suggestions = HIKIDEMONO_SUGGESTIONS.find(
    (s) => bd.hikidemono >= s.range[0] && bd.hikidemono <= s.range[1]
  )?.items ?? [];

  const hikigashiSuggestions =
    bd.hikigashi < 1500
      ? ["バウムクーヘン（小）", "マドレーヌ詰め合わせ"]
      : bd.hikigashi < 3000
      ? ["バウムクーヘン（中）", "焼き菓子アソート", "和菓子詰め合わせ"]
      : ["バウムクーヘン（大）", "高級ブランドスイーツ", "オリジナル引き菓子"];

  return (
    <div className="space-y-6">
      {/* ご祝儀額入力 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ご祝儀額を選択</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {GOSHUGI_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => { setGoshugi(p); setUseCustom(false); }}
              className={`rounded-lg py-2 px-3 text-sm font-medium border-2 transition-colors ${
                !useCustom && goshugi === p
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              {fmt(p)}円
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="custom"
            checked={useCustom}
            onChange={(e) => setUseCustom(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="custom" className="text-sm text-gray-600">金額を直接入力</label>
          {useCustom && (
            <input
              type="number"
              value={customGoshugi}
              onChange={(e) => setCustomGoshugi(e.target.value)}
              placeholder="例：40000"
              step={1000}
              className="border border-gray-300 rounded-lg px-3 py-1.5 w-36 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          {useCustom && <span className="text-gray-600 text-sm">円</span>}
        </div>
      </div>

      {/* ゲスト区分 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ゲストの区分</h2>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(GUEST_LABELS) as GuestType[]).map((type) => (
            <button
              key={type}
              onClick={() => setGuestType(type)}
              className={`rounded-xl py-3 px-4 text-sm font-medium border-2 transition-colors text-left ${
                guestType === type
                  ? "border-green-500 bg-green-50 text-green-800"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{GUEST_LABELS[type]}</span>
              <span className="block text-xs text-gray-400 mt-0.5">
                ご祝儀の約{Math.round(RATIO_BY_TYPE[type] * 100)}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 計算結果 */}
      {effectiveGoshugi > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">予算配分の目安</h2>
          <p className="text-sm text-gray-500 mb-5">
            ご祝儀 <strong className="text-gray-800">{fmt(effectiveGoshugi)}円</strong> ×{" "}
            {Math.round(RATIO_BY_TYPE[guestType] * 100)}%（{GUEST_LABELS[guestType]}相場）
          </p>

          <div className="space-y-4 mb-6">
            {[
              { label: "引き出物（メイン）", amount: bd.hikidemono, color: "bg-blue-500", pct: (bd.hikidemono / bd.total) * 100 },
              { label: "引き菓子", amount: bd.hikigashi, color: "bg-pink-400", pct: (bd.hikigashi / bd.total) * 100 },
              { label: "縁起物", amount: bd.engimono, color: "bg-amber-400", pct: (bd.engimono / bd.total) * 100 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <span className="font-semibold text-gray-900">{fmt(item.amount)}円</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
            <span className="font-semibold text-gray-700">合計予算</span>
            <span className="text-2xl font-bold text-gray-900">{fmt(bd.total)}円</span>
          </div>
        </div>
      )}

      {/* 品物提案 */}
      {effectiveGoshugi > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">おすすめの品物</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-blue-700 mb-2">引き出物（{fmt(bd.hikidemono)}円）</h3>
              <ul className="space-y-1">
                {suggestions.map((s) => (
                  <li key={s} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="text-blue-400">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-pink-700 mb-2">引き菓子（{fmt(bd.hikigashi)}円）</h3>
              <ul className="space-y-1">
                {hikigashiSuggestions.map((s) => (
                  <li key={s} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="text-pink-400">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 text-center">
        ※ 金額はあくまで一般的な相場の目安です。地域・家柄・状況により異なります。
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この引き出物予算配分ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">ご祝儀額に対する引き出物の適切な予算を計算。一般的な相場（ご祝儀の3分の1）を基準に、料理・引き菓子・縁起物の内訳も提案。。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この引き出物予算配分ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "ご祝儀額に対する引き出物の適切な予算を計算。一般的な相場（ご祝儀の3分の1）を基準に、料理・引き菓子・縁起物の内訳も提案。。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
