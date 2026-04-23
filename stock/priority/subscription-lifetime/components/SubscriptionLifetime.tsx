"use client";

import { useState, useMemo, useCallback } from "react";

// --- プリセット ---
type Preset = {
  name: string;
  monthlyJPY: number; // 月額（円換算済み）
  icon: string;
  usd?: boolean; // USD表示フラグ
};

const PRESETS: Preset[] = [
  { name: "Netflix", monthlyJPY: 1490, icon: "🎬" },
  { name: "Spotify", monthlyJPY: 980, icon: "🎵" },
  { name: "YouTube Premium", monthlyJPY: 1280, icon: "▶️" },
  { name: "Adobe CC", monthlyJPY: 6480, icon: "🎨" },
  { name: "Amazon Prime", monthlyJPY: 600, icon: "📦" },
  { name: "Apple Music", monthlyJPY: 1080, icon: "🍎" },
  { name: "iCloud+", monthlyJPY: 400, icon: "☁️" },
  { name: "ChatGPT Plus", monthlyJPY: 3000, icon: "🤖", usd: true }, // $20 × 150
  { name: "Cursor", monthlyJPY: 3000, icon: "💻", usd: true }, // $20 × 150
  { name: "Nintendo Switch Online", monthlyJPY: 200, icon: "🎮" }, // ¥2,400/年 ÷ 12
];

// --- 型 ---
type Subscription = {
  id: string;
  name: string;
  monthlyJPY: number;
  enabled: boolean;
};

// --- ユーティリティ ---
function fmtJPY(n: number): string {
  if (n >= 10000) {
    const man = n / 10000;
    if (Number.isInteger(man) || man >= 10) {
      return `¥${Math.round(man).toLocaleString("ja-JP")}万`;
    }
    return `¥${man.toFixed(1)}万`;
  }
  return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

function fmtJPYExact(n: number): string {
  return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

// S&P500 複利計算（月次積立）
function calcInvestment(monthlyAmount: number, years: number, annualRate: number): number {
  if (monthlyAmount <= 0) return 0;
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  // FV of annuity: PMT × ((1+r)^n - 1) / r
  return monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

// 累積コスト（単純積み上げ）
function calcCumulative(monthlyTotal: number, years: number): number {
  return monthlyTotal * 12 * years;
}

// 金額によってバーの色を決める
function barColorClass(amount: number, maxAmount: number): string {
  const ratio = maxAmount > 0 ? amount / maxAmount : 0;
  if (ratio >= 0.8) return "bg-red-500";
  if (ratio >= 0.5) return "bg-orange-400";
  if (ratio >= 0.3) return "bg-amber-400";
  return "bg-teal-500";
}

let nextId = 1;
function genId(): string {
  return `sub_${nextId++}`;
}

const TIMELINE_YEARS = [1, 3, 5, 10, 20];

export default function SubscriptionLifetime() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [newName, setNewName] = useState("");
  const [newMonthly, setNewMonthly] = useState<string>("");
  const [fxRate, setFxRate] = useState<number>(150);
  const [copiedShare, setCopiedShare] = useState(false);

  // --- 合計計算 ---
  const enabledSubs = useMemo(() => subscriptions.filter((s) => s.enabled), [subscriptions]);
  const monthlyTotal = useMemo(
    () => enabledSubs.reduce((sum, s) => sum + s.monthlyJPY, 0),
    [enabledSubs]
  );
  const yearlyTotal = useMemo(() => monthlyTotal * 12, [monthlyTotal]);

  // タイムライン
  const timeline = useMemo(
    () =>
      TIMELINE_YEARS.map((y) => ({
        years: y,
        cost: calcCumulative(monthlyTotal, y),
        investment: calcInvestment(monthlyTotal, y, 0.07),
      })),
    [monthlyTotal]
  );

  const maxCost = useMemo(() => (timeline.length > 0 ? timeline[timeline.length - 1].cost : 1), [timeline]);

  // 円グラフ用の割合
  const subsWithRatio = useMemo(
    () =>
      enabledSubs.map((s) => ({
        ...s,
        ratio: monthlyTotal > 0 ? s.monthlyJPY / monthlyTotal : 0,
      })),
    [enabledSubs, monthlyTotal]
  );

  // --- 操作 ---
  const addSubscription = useCallback(
    (name: string, monthly: number) => {
      if (!name.trim() || monthly <= 0) return;
      setSubscriptions((prev) => [
        ...prev,
        { id: genId(), name: name.trim(), monthlyJPY: Math.round(monthly), enabled: true },
      ]);
    },
    []
  );

  const addFromForm = useCallback(() => {
    const v = parseFloat(newMonthly);
    if (!newName.trim() || isNaN(v) || v <= 0) return;
    addSubscription(newName, v);
    setNewName("");
    setNewMonthly("");
  }, [newName, newMonthly, addSubscription]);

  const addFromPreset = useCallback(
    (preset: Preset) => {
      const alreadyAdded = subscriptions.some((s) => s.name === preset.name);
      if (alreadyAdded) return;
      addSubscription(preset.name, preset.monthlyJPY);
    },
    [subscriptions, addSubscription]
  );

  const toggleSub = useCallback((id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }, []);

  const removeSub = useCallback((id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const copyShareText = useCallback(() => {
    const text = `私のサブスク年間総額は${fmtJPYExact(yearlyTotal)}（月額${fmtJPYExact(monthlyTotal)}）。10年で${fmtJPYExact(calcCumulative(monthlyTotal, 10))}が消える… #サブスク断捨離`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    });
  }, [yearlyTotal, monthlyTotal]);

  // セグメント色（円グラフ用）
  const PIE_COLORS = [
    "bg-teal-500",
    "bg-cyan-400",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];

  return (
    <div className="space-y-6">
      {/* 為替レート */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <span className="text-sm text-gray-600">USD/JPY 為替レート</span>
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-500">$1 =</span>
          <input
            type="number"
            min={1}
            step={1}
            value={fxRate}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v) && v > 0) setFxRate(v);
            }}
            className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 text-right"
          />
          <span className="text-sm text-gray-500">円</span>
        </div>
        <span className="text-xs text-gray-400 ml-auto">海外サービスのUSD換算に使用</span>
      </div>

      {/* プリセット */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">プリセットから追加</h2>
        <p className="text-xs text-gray-500 mb-4">タップで即追加。追加済みはグレーアウト。</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const monthlyPrice = preset.usd
              ? Math.round((preset.monthlyJPY / 150) * fxRate)
              : preset.monthlyJPY;
            const alreadyAdded = subscriptions.some((s) => s.name === preset.name);
            return (
              <button
                key={preset.name}
                onClick={() => addFromPreset({ ...preset, monthlyJPY: monthlyPrice })}
                disabled={alreadyAdded}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-all ${
                  alreadyAdded
                    ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 hover:border-teal-300"
                }`}
              >
                <span>{preset.icon}</span>
                <span className="font-medium">{preset.name}</span>
                <span className="text-xs opacity-75">{fmtJPYExact(monthlyPrice)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 手動追加 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">サービスを追加</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="サービス名"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFromForm()}
            className="flex-1 min-w-32 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <div className="flex items-center gap-1">
            <span className="text-gray-500 text-sm">¥</span>
            <input
              type="number"
              placeholder="月額"
              min={1}
              value={newMonthly}
              onChange={(e) => setNewMonthly(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFromForm()}
              className="w-28 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <button
            onClick={addFromForm}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            + 追加
          </button>
        </div>
      </div>

      {/* 登録済みリスト */}
      {subscriptions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            登録済み
            <span className="text-sm font-normal text-gray-500 ml-2">{subscriptions.length}件</span>
          </h2>
          <div className="space-y-2">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                  sub.enabled
                    ? "border-gray-200 bg-white"
                    : "border-gray-100 bg-gray-50 opacity-60"
                }`}
              >
                <button
                  onClick={() => toggleSub(sub.id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    sub.enabled
                      ? "bg-teal-500 border-teal-500 text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {sub.enabled && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className="flex-1 text-sm font-medium text-gray-800">{sub.name}</span>
                <span className={`text-sm font-bold ${sub.enabled ? "text-gray-900" : "text-gray-400"}`}>
                  {fmtJPYExact(sub.monthlyJPY)}<span className="text-xs font-normal text-gray-400">/月</span>
                </span>
                <span className="text-xs text-gray-400">
                  年{fmtJPYExact(sub.monthlyJPY * 12)}
                </span>
                <button
                  onClick={() => removeSub(sub.id)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* メインサマリー */}
      {subscriptions.length > 0 && (
        <>
          <div className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-teal-200 text-xs mb-1">月額合計</div>
                <div className="text-5xl font-bold">{fmtJPYExact(monthlyTotal)}</div>
              </div>
              <div className="text-right">
                <div className="text-teal-200 text-xs mb-1">年額合計</div>
                <div className="text-3xl font-bold">{fmtJPYExact(yearlyTotal)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white bg-opacity-15 rounded-xl p-4">
                <div className="text-teal-200 text-xs mb-1">5年で消える金額</div>
                <div className="text-2xl font-bold">{fmtJPY(calcCumulative(monthlyTotal, 5))}</div>
              </div>
              <div className="bg-white bg-opacity-15 rounded-xl p-4">
                <div className="text-teal-200 text-xs mb-1">10年で消える金額</div>
                <div className={`text-2xl font-bold ${calcCumulative(monthlyTotal, 10) >= 1000000 ? "text-red-300" : ""}`}>
                  {fmtJPY(calcCumulative(monthlyTotal, 10))}
                </div>
              </div>
            </div>
          </div>

          {/* タイムライングラフ */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">累積コストの推移</h2>
            <p className="text-xs text-gray-500 mb-5">右肩上がりで積み上がる「ヤバさ」を可視化</p>
            <div className="space-y-3">
              {timeline.map(({ years, cost }) => {
                const widthPct = maxCost > 0 ? Math.round((cost / maxCost) * 100) : 0;
                const colorClass = barColorClass(cost, maxCost);
                return (
                  <div key={years} className="flex items-center gap-3">
                    <div className="w-10 text-sm text-gray-500 text-right flex-shrink-0">{years}年</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                        style={{ width: `${widthPct}%`, minWidth: cost > 0 ? "2%" : "0%" }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs font-bold text-white drop-shadow">
                          {fmtJPYExact(cost)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              ※ 解約なし・料金変動なしの単純積算
            </p>
          </div>

          {/* 投資シミュレーション */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">もし投資に回したら？</h2>
            <p className="text-xs text-gray-500 mb-5">
              月額合計をS&amp;P500平均リターン（年7%）で運用した場合の想定資産額
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {timeline.map(({ years, investment }) => (
                <div key={years} className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                  <div className="text-xs text-emerald-600 mb-1">{years}年後</div>
                  <div className="text-xl font-bold text-emerald-700">{fmtJPY(investment)}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    元本 {fmtJPY(monthlyTotal * 12 * years)} → 利益 {fmtJPY(investment - monthlyTotal * 12 * years)}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              ※ 税金・手数料除く。投資は元本割れリスクあり。
            </p>
          </div>

          {/* 内訳グラフ（CSS円グラフ風） */}
          {subsWithRatio.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">サービス別の割合</h2>
              <p className="text-xs text-gray-500 mb-5">月額合計に占める各サービスのシェア</p>
              <div className="space-y-2">
                {[...subsWithRatio]
                  .sort((a, b) => b.monthlyJPY - a.monthlyJPY)
                  .map((sub, i) => (
                    <div key={sub.id} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${PIE_COLORS[i % PIE_COLORS.length]}`} />
                      <div className="w-32 text-sm text-gray-700 truncate flex-shrink-0">{sub.name}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${PIE_COLORS[i % PIE_COLORS.length]}`}
                          style={{ width: `${Math.round(sub.ratio * 100)}%`, minWidth: sub.ratio > 0 ? "1%" : "0%" }}
                        />
                      </div>
                      <div className="text-sm text-gray-600 w-10 text-right flex-shrink-0">
                        {Math.round(sub.ratio * 100)}%
                      </div>
                      <div className="text-sm font-medium text-gray-800 w-20 text-right flex-shrink-0">
                        {fmtJPYExact(sub.monthlyJPY)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 削減シミュレーション */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">削減シミュレーション</h2>
            <p className="text-xs text-gray-500 mb-4">
              チェックを外すと「年間いくら浮くか」を確認できます
            </p>
            <div className="space-y-2">
              {[...subscriptions]
                .filter((s) => s.monthlyJPY > 0)
                .sort((a, b) => b.monthlyJPY - a.monthlyJPY)
                .map((sub) => {
                  const saving = sub.monthlyJPY * 12;
                  return (
                    <div
                      key={sub.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                        !sub.enabled
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                      onClick={() => toggleSub(sub.id)}
                    >
                      <button
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          sub.enabled
                            ? "bg-teal-500 border-teal-500 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {sub.enabled && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className={`flex-1 text-sm font-medium ${!sub.enabled ? "text-gray-400 line-through" : "text-gray-800"}`}>
                        {sub.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {fmtJPYExact(sub.monthlyJPY)}/月
                      </span>
                      {!sub.enabled && (
                        <span className="text-sm font-bold text-green-600">
                          年+{fmtJPYExact(saving)} 節約
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
            {subscriptions.some((s) => !s.enabled) && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="text-green-700 text-sm font-medium">
                  OFFにしたサービスで年間{" "}
                  <span className="text-xl font-bold">
                    {fmtJPYExact(
                      subscriptions
                        .filter((s) => !s.enabled)
                        .reduce((sum, s) => sum + s.monthlyJPY * 12, 0)
                    )}
                  </span>{" "}
                  節約できます
                </div>
              </div>
            )}
          </div>

          {/* X投稿用シェアテキスト */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
            <h2 className="text-base font-semibold text-gray-300 mb-3">X(Twitter)でシェア</h2>
            <div className="bg-white bg-opacity-10 rounded-xl p-4 mb-4 text-sm text-gray-200 leading-relaxed">
              私のサブスク年間総額は{fmtJPYExact(yearlyTotal)}（月額{fmtJPYExact(monthlyTotal)}）。
              10年で{fmtJPYExact(calcCumulative(monthlyTotal, 10))}が消える… #サブスク断捨離
            </div>
            <button
              onClick={copyShareText}
              className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${
                copiedShare
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-900 hover:bg-gray-100"
              }`}
            >
              {copiedShare ? "コピーしました！" : "テキストをコピー"}
            </button>
          </div>
        </>
      )}

      {/* 空の状態 */}
      {subscriptions.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <div className="text-base font-medium">サブスクを追加してください</div>
          <div className="text-sm mt-1">プリセットか手動で登録すると生涯コストが表示されます</div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pb-4">
        料金は参考値です。最新の価格は各サービス公式サイトをご確認ください。
      </p>
    </div>
  );
}
