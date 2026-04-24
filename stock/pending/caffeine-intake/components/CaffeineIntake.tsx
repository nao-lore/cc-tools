"use client";
import { useState } from "react";

const BEVERAGES = [
  { name: "コーヒー（ドリップ）", caffeine: 90, volume: 150, emoji: "☕", category: "コーヒー" },
  { name: "エスプレッソ", caffeine: 60, volume: 30, emoji: "☕", category: "コーヒー" },
  { name: "カフェラテ（ショート）", caffeine: 75, volume: 240, emoji: "☕", category: "コーヒー" },
  { name: "インスタントコーヒー", caffeine: 60, volume: 150, emoji: "☕", category: "コーヒー" },
  { name: "緑茶", caffeine: 30, volume: 150, emoji: "🍵", category: "お茶" },
  { name: "抹茶", caffeine: 50, volume: 150, emoji: "🍵", category: "お茶" },
  { name: "紅茶", caffeine: 45, volume: 150, emoji: "🫖", category: "お茶" },
  { name: "ほうじ茶", caffeine: 20, volume: 150, emoji: "🍵", category: "お茶" },
  { name: "玄米茶", caffeine: 10, volume: 150, emoji: "🍵", category: "お茶" },
  { name: "コーラ（350ml）", caffeine: 34, volume: 350, emoji: "🥤", category: "炭酸飲料" },
  { name: "エナジードリンク（250ml）", caffeine: 80, volume: 250, emoji: "⚡", category: "エナジー" },
  { name: "エナジードリンク（500ml）", caffeine: 160, volume: 500, emoji: "⚡", category: "エナジー" },
  { name: "チョコレート（1枚50g）", caffeine: 25, volume: 50, emoji: "🍫", category: "食品" },
  { name: "栄養ドリンク（100ml）", caffeine: 50, volume: 100, emoji: "💊", category: "栄養" },
];

const DAILY_LIMITS = [
  { label: "一般成人", limit: 400, color: "text-green-600" },
  { label: "妊婦", limit: 200, color: "text-pink-600" },
  { label: "10代", limit: 100, color: "text-blue-600" },
];

interface DrinkEntry {
  bevId: number;
  count: number;
}

export default function CaffeineIntake() {
  const [entries, setEntries] = useState<DrinkEntry[]>([]);
  const [limitType, setLimitType] = useState(0);

  const addEntry = (bevId: number) => {
    setEntries((prev) => {
      const existing = prev.find((e) => e.bevId === bevId);
      if (existing) {
        return prev.map((e) => e.bevId === bevId ? { ...e, count: e.count + 1 } : e);
      }
      return [...prev, { bevId, count: 1 }];
    });
  };

  const removeEntry = (bevId: number) => {
    setEntries((prev) =>
      prev.map((e) => e.bevId === bevId ? { ...e, count: Math.max(0, e.count - 1) } : e)
        .filter((e) => e.count > 0)
    );
  };

  const totalCaffeine = entries.reduce((sum, e) => {
    const bev = BEVERAGES[e.bevId];
    return sum + bev.caffeine * e.count;
  }, 0);

  const limit = DAILY_LIMITS[limitType].limit;
  const percentage = Math.min((totalCaffeine / limit) * 100, 100);
  const remaining = Math.max(limit - totalCaffeine, 0);

  const getStatusColor = () => {
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    if (percentage < 100) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStatusText = () => {
    if (totalCaffeine === 0) return "";
    if (percentage < 50) return "安全範囲";
    if (percentage < 80) return "注意";
    if (percentage < 100) return "上限間近";
    return "上限超過！";
  };

  const categories = [...new Set(BEVERAGES.map((b) => b.category))];

  return (
    <div className="space-y-6">
      {/* Limit Selector */}
      <div>
        <p className="text-xs text-gray-500 mb-2">対象</p>
        <div className="flex gap-2">
          {DAILY_LIMITS.map((l, idx) => (
            <button
              key={idx}
              onClick={() => setLimitType(idx)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                limitType === idx
                  ? "bg-purple-500 text-white border-purple-500"
                  : "bg-white text-gray-600 border-gray-300 hover:border-purple-300"
              }`}
            >
              {l.label}
              <span className="ml-1 text-xs opacity-75">({l.limit}mg)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-3xl font-bold text-gray-800">{totalCaffeine}<span className="text-lg ml-1 text-gray-500">mg</span></p>
            <p className="text-sm text-gray-500">今日の摂取量</p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${percentage >= 100 ? "text-red-600" : "text-gray-600"}`}>
              {getStatusText()}
            </p>
            <p className="text-xs text-gray-400">上限 {limit}mg</p>
          </div>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getStatusColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0mg</span>
          <span>{limit / 2}mg</span>
          <span>{limit}mg</span>
        </div>
        {totalCaffeine > 0 && (
          <p className="text-sm mt-3 text-gray-600">
            {percentage < 100
              ? `残り <strong className="text-gray-800">${remaining}mg</strong> まで摂取可能`
              : `<strong className="text-red-600">${totalCaffeine - limit}mg 超過</strong> しています`}
          </p>
        )}
        {totalCaffeine > 0 && remaining > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            あとコーヒー約 {(remaining / 90).toFixed(1)} 杯分
          </p>
        )}
      </div>

      {/* Current entries */}
      {entries.length > 0 && (
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
          <h3 className="text-sm font-semibold text-purple-800 mb-3">今日の摂取ログ</h3>
          <div className="space-y-2">
            {entries.map((e) => {
              const bev = BEVERAGES[e.bevId];
              return (
                <div key={e.bevId} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-purple-100">
                  <div className="flex items-center gap-2">
                    <span>{bev.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{bev.name}</p>
                      <p className="text-xs text-gray-500">{bev.caffeine}mg × {e.count} = {bev.caffeine * e.count}mg</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeEntry(e.bevId)}
                      className="w-7 h-7 rounded-full border border-gray-300 text-gray-500 hover:bg-red-50 hover:border-red-300 hover:text-red-500 text-sm font-bold flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-bold text-gray-700">{e.count}</span>
                    <button
                      onClick={() => addEntry(e.bevId)}
                      className="w-7 h-7 rounded-full border border-gray-300 text-gray-500 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-500 text-sm font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setEntries([])}
            className="mt-3 text-xs text-red-500 hover:text-red-700"
          >
            リセット
          </button>
        </div>
      )}

      {/* Beverage List */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">飲料を追加</h3>
        {categories.map((cat) => (
          <div key={cat} className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{cat}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BEVERAGES.filter((b) => b.category === cat).map((bev, idx) => {
                const realIdx = BEVERAGES.indexOf(bev);
                const entry = entries.find((e) => e.bevId === realIdx);
                return (
                  <button
                    key={idx}
                    onClick={() => addEntry(realIdx)}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{bev.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{bev.name}</p>
                        <p className="text-xs text-gray-500">{bev.caffeine}mg / {bev.volume}ml</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {entry && (
                        <span className="bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {entry.count}
                        </span>
                      )}
                      <span className="text-purple-400 text-lg font-bold">+</span>
                    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このカフェイン摂取量計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">飲料別のカフェイン含有量と1日上限チェック。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このカフェイン摂取量計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "飲料別のカフェイン含有量と1日上限チェック。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Warning */}
      {totalCaffeine >= limit && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <p className="font-semibold mb-1">上限を超えています</p>
          <p>カフェインの過剰摂取は不眠・頭痛・動悸の原因になります。水を飲んでカフェインを控えてください。</p>
        </div>
      )}
    </div>
  );
}
