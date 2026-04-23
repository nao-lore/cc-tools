"use client";

import { useState, useMemo } from "react";

// --- 正規分布CDF（Abramowitz & Stegun 近似, 最大誤差 7.5e-8）---
function normalCDF(x: number): number {
  if (x < -8) return 0;
  if (x > 8) return 1;
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  const erf = 1.0 - poly * Math.exp(-absX * absX);
  return 0.5 * (1.0 + sign * erf);
}

// 標準正規分布の逆関数（二分探索）
function normalInv(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  let lo = -10, hi = 10;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (normalCDF(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// --- 計算関数 ---
type TestResult = {
  pA: number;
  pB: number;
  lift: number;
  pooledP: number;
  se: number;
  zStat: number;
  pValue: number;
  significant5: boolean;
  significant1: boolean;
  ciLow90: number;
  ciHigh90: number;
  ciLow95: number;
  ciHigh95: number;
  ciLow99: number;
  ciHigh99: number;
};

function calcTest(nA: number, cvA: number, nB: number, cvB: number): TestResult | null {
  if (nA <= 0 || nB <= 0 || cvA < 0 || cvB < 0) return null;
  if (cvA > nA || cvB > nB) return null;

  const pA = cvA / nA;
  const pB = cvB / nB;
  const lift = pA > 0 ? (pB - pA) / pA : 0;
  const pooledP = (cvA + cvB) / (nA + nB);
  const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / nA + 1 / nB));

  if (se === 0) return null;

  const zStat = (pB - pA) / se;
  const pValue = 2 * (1 - normalCDF(Math.abs(zStat)));

  // 信頼区間用SE（プール無し）
  const seCi = Math.sqrt(pA * (1 - pA) / nA + pB * (1 - pB) / nB);
  const diff = pB - pA;
  const z90 = normalInv(0.95);
  const z95 = normalInv(0.975);
  const z99 = normalInv(0.995);

  return {
    pA, pB, lift, pooledP, se, zStat, pValue,
    significant5: pValue < 0.05,
    significant1: pValue < 0.01,
    ciLow90: diff - z90 * seCi,
    ciHigh90: diff + z90 * seCi,
    ciLow95: diff - z95 * seCi,
    ciHigh95: diff + z95 * seCi,
    ciLow99: diff - z99 * seCi,
    ciHigh99: diff + z99 * seCi,
  };
}

// 必要サンプルサイズ
function calcSampleSize(
  baseRate: number,
  mde: number,         // minimum detectable effect (絶対差)
  alpha: number,       // 有意水準 (片側でなく両側なので alpha/2)
  power: number        // 検定力
): number {
  if (baseRate <= 0 || baseRate >= 1 || mde === 0) return 0;
  const p1 = baseRate;
  const p2 = baseRate + mde;
  if (p2 <= 0 || p2 >= 1) return 0;
  const zAlpha = normalInv(1 - alpha / 2);
  const zBeta = normalInv(power);
  const num = Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2));
  const den = Math.pow(mde, 2);
  return Math.ceil(num / den);
}

// --- フォーマット ---
function fmtPct(n: number, digits = 2): string {
  return `${(n * 100).toFixed(digits)}%`;
}

function fmtPValue(p: number): string {
  if (p < 0.0001) return "< 0.0001";
  return p.toFixed(4);
}

function fmtDiff(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${(n * 100).toFixed(3)}pp`;
}

// --- タブ ---
type Tab = "test" | "samplesize" | "guide";

export default function AbTestSignificance() {
  const [activeTab, setActiveTab] = useState<Tab>("test");

  // 検定入力
  const [nA, setNA] = useState<number>(10000);
  const [cvA, setCvA] = useState<number>(200);
  const [nB, setNB] = useState<number>(10000);
  const [cvB, setCvB] = useState<number>(240);
  const [alpha, setAlpha] = useState<0.05 | 0.01>(0.05);
  const [ciLevel, setCiLevel] = useState<90 | 95 | 99>(95);

  // サンプルサイズ入力
  const [ssBaseRate, setSsBaseRate] = useState<number>(2.0);   // %
  const [ssMde, setSsMde] = useState<number>(20);              // 相対% (e.g. 20% improvement)
  const [ssPower, setSsPower] = useState<0.8 | 0.9>(0.8);
  const [ssAlpha, setSsAlpha] = useState<0.05 | 0.01>(0.05);

  // --- 計算 ---
  const result = useMemo(() => calcTest(nA, cvA, nB, cvB), [nA, cvA, nB, cvB]);

  const ssCiLow = useMemo(() => {
    const base = ssBaseRate / 100;
    const mde = base * (ssMde / 100);
    return calcSampleSize(base, mde, ssAlpha, ssPower);
  }, [ssBaseRate, ssMde, ssPower, ssAlpha]);

  // 信頼区間値の選択
  const ci = useMemo(() => {
    if (!result) return null;
    if (ciLevel === 90) return { low: result.ciLow90, high: result.ciHigh90 };
    if (ciLevel === 99) return { low: result.ciLow99, high: result.ciHigh99 };
    return { low: result.ciLow95, high: result.ciHigh95 };
  }, [result, ciLevel]);

  const TABS: { id: Tab; label: string }[] = [
    { id: "test", label: "有意差検定" },
    { id: "samplesize", label: "サンプルサイズ" },
    { id: "guide", label: "解説" },
  ];

  return (
    <div className="space-y-6">
      {/* タブ */}
      <div className="flex gap-1.5 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== 有意差検定 ===== */}
      {activeTab === "test" && (
        <div className="space-y-5">
          {/* 入力 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">A/B 両群のデータ入力</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* グループA */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-bold">A</span>
                  <span className="font-medium text-gray-800 text-sm">コントロール群</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">訪問数（セッション数）</label>
                  <input
                    type="number"
                    min={1}
                    step={100}
                    value={nA}
                    onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v > 0) setNA(v); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CV数（コンバージョン数）</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={cvA}
                    onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v >= 0) setCvA(v); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                {nA > 0 && cvA >= 0 && (
                  <div className="text-xs text-gray-500">
                    CVR: <span className="font-semibold text-gray-700">{fmtPct(cvA / nA)}</span>
                  </div>
                )}
              </div>

              {/* グループB */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">B</span>
                  <span className="font-medium text-gray-800 text-sm">テスト群</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">訪問数（セッション数）</label>
                  <input
                    type="number"
                    min={1}
                    step={100}
                    value={nB}
                    onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v > 0) setNB(v); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CV数（コンバージョン数）</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={cvB}
                    onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v >= 0) setCvB(v); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                {nB > 0 && cvB >= 0 && (
                  <div className="text-xs text-gray-500">
                    CVR: <span className="font-semibold text-gray-700">{fmtPct(cvB / nB)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CVRバー比較 */}
            {result && (
              <div className="mt-5 space-y-2">
                <div className="text-xs font-medium text-gray-600 mb-2">CVR 比較</div>
                {[
                  { label: "A", pct: result.pA, color: "bg-gray-400" },
                  { label: "B", pct: result.pB, color: "bg-indigo-500" },
                ].map(({ label, pct, color }) => {
                  const max = Math.max(result.pA, result.pB);
                  const barWidth = max > 0 ? (pct / max) * 100 : 0;
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xs font-bold w-4 text-gray-500">{label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className={`${color} h-full rounded-full transition-all duration-300`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-14 text-right">{fmtPct(pct)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* オプション */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">有意水準</label>
                <div className="flex gap-2">
                  {([0.05, 0.01] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => setAlpha(a)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        alpha === a
                          ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {a === 0.05 ? "5%（標準）" : "1%（厳格）"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">信頼区間</label>
                <div className="flex gap-2">
                  {([90, 95, 99] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCiLevel(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        ciLevel === c
                          ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {c}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 結果 */}
          {result && ci ? (
            <div className="space-y-4">
              {/* 判定バナー */}
              <div
                className={`rounded-2xl p-5 flex items-center gap-4 shadow-sm ${
                  (alpha === 0.05 ? result.significant5 : result.significant1)
                    ? "bg-green-50 border border-green-200"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${
                    (alpha === 0.05 ? result.significant5 : result.significant1)
                      ? "bg-green-100"
                      : "bg-gray-200"
                  }`}
                >
                  {(alpha === 0.05 ? result.significant5 : result.significant1) ? "✓" : "—"}
                </div>
                <div>
                  <div
                    className={`font-bold text-lg ${
                      (alpha === 0.05 ? result.significant5 : result.significant1)
                        ? "text-green-700"
                        : "text-gray-600"
                    }`}
                  >
                    {(alpha === 0.05 ? result.significant5 : result.significant1)
                      ? "統計的に有意です"
                      : "有意差はありません"}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    p値 = {fmtPValue(result.pValue)}　（有意水準 {alpha * 100}%・両側検定）
                  </div>
                </div>
              </div>

              {/* 数値カード */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
                <h2 className="text-base font-semibold text-indigo-100 mb-4">検定結果</h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
                    <div className="text-indigo-200 text-xs mb-1">CVR A</div>
                    <div className="font-bold text-lg">{fmtPct(result.pA)}</div>
                  </div>
                  <div className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
                    <div className="text-indigo-200 text-xs mb-1">CVR B</div>
                    <div className="font-bold text-lg">{fmtPct(result.pB)}</div>
                  </div>
                  <div className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
                    <div className="text-indigo-200 text-xs mb-1">リフト率</div>
                    <div className={`font-bold text-lg ${result.lift >= 0 ? "text-green-300" : "text-red-300"}`}>
                      {result.lift >= 0 ? "+" : ""}{(result.lift * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
                    <div className="text-indigo-200 text-xs mb-1">p値</div>
                    <div className="font-bold text-lg">{fmtPValue(result.pValue)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white bg-opacity-10 rounded-xl p-3">
                    <div className="text-indigo-200 text-xs mb-1">Z統計量</div>
                    <div className="font-semibold">{result.zStat.toFixed(4)}</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-xl p-3">
                    <div className="text-indigo-200 text-xs mb-1">{ciLevel}% 信頼区間（差）</div>
                    <div className="font-semibold text-sm">
                      {fmtDiff(ci.low)} 〜 {fmtDiff(ci.high)}
                    </div>
                  </div>
                </div>

                {/* 有意水準1%での追加判定 */}
                {alpha === 0.05 && result.significant5 && (
                  <div className="mt-3 text-xs text-indigo-200 bg-white bg-opacity-10 rounded-lg px-3 py-2">
                    {result.significant1
                      ? "有意水準1%でも有意です（非常に強いエビデンス）"
                      : "有意水準1%では有意ではありません（追加データ収集を検討）"}
                  </div>
                )}
              </div>

              {/* 信頼区間の解釈 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-3">{ciLevel}% 信頼区間の解釈</h2>
                <div className="text-sm text-gray-600 leading-relaxed">
                  <p>
                    B群のCVRはA群に対して、{ciLevel}%の確率で
                    <span className="font-semibold text-indigo-700 mx-1">{fmtDiff(ci.low)} 〜 {fmtDiff(ci.high)}</span>
                    の範囲にあると推定されます（pp = パーセンテージポイント差）。
                  </p>
                  {ci.low > 0 && (
                    <p className="mt-2 text-green-700 font-medium">
                      区間全体がプラス → B群の改善効果は確実と考えられます。
                    </p>
                  )}
                  {ci.high < 0 && (
                    <p className="mt-2 text-red-600 font-medium">
                      区間全体がマイナス → B群はA群より悪いと考えられます。
                    </p>
                  )}
                  {ci.low <= 0 && ci.high >= 0 && (
                    <p className="mt-2 text-gray-500">
                      区間がゼロをまたいでいます → 差がない可能性を排除できません。
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
              有効な数値を入力してください（CV数は訪問数以下）
            </div>
          )}
        </div>
      )}

      {/* ===== サンプルサイズ ===== */}
      {activeTab === "samplesize" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">必要サンプルサイズ計算</h2>
            <p className="text-xs text-gray-500 mb-5">
              「この改善効果を検出したい」という目標から、テストに必要な最低訪問数を算出します。
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ベースラインCVR（現在のA群CVR）
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0.01}
                    max={99.99}
                    step={0.1}
                    value={ssBaseRate}
                    onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v > 0 && v < 100) setSsBaseRate(v); }}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <span className="text-gray-500 text-sm">%</span>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[0.5, 1.0, 2.0, 3.0, 5.0, 10.0].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSsBaseRate(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        ssBaseRate === preset
                          ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  検出したい最小改善効果（相対値）
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={ssMde}
                    onChange={(e) => setSsMde(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={ssMde}
                      onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v > 0) setSsMde(Math.min(v, 100)); }}
                      className="w-20 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <span className="text-sm text-gray-500 whitespace-nowrap">% 改善</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  例: 20%改善 = CVR {ssBaseRate}% → {(ssBaseRate * (1 + ssMde / 100)).toFixed(2)}%
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">有意水準（α）</label>
                  <div className="flex gap-2">
                    {([0.05, 0.01] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => setSsAlpha(a)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          ssAlpha === a
                            ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {a === 0.05 ? "5%（標準）" : "1%（厳格）"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">検定力（1−β）</label>
                  <div className="flex gap-2">
                    {([0.8, 0.9] as const).map((pw) => (
                      <button
                        key={pw}
                        onClick={() => setSsPower(pw)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          ssPower === pw
                            ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {pw === 0.8 ? "80%（標準）" : "90%（高精度）"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* サンプルサイズ結果 */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-base font-semibold text-indigo-100 mb-4">必要サンプルサイズ</h2>

            <div className="mb-5">
              <div className="text-indigo-200 text-xs mb-1">1群あたりの最低訪問数</div>
              <div className="text-5xl font-bold">
                {ssCiLow > 0 ? ssCiLow.toLocaleString() : "—"}
              </div>
              {ssCiLow > 0 && (
                <div className="text-indigo-200 text-sm mt-1">
                  合計: {(ssCiLow * 2).toLocaleString()} 訪問（A+B）
                </div>
              )}
            </div>

            {ssCiLow > 0 && (
              <div className="bg-white bg-opacity-10 rounded-xl p-4 text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-indigo-200">ベースラインCVR</span>
                  <span>{ssBaseRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-200">目標CVR（B群）</span>
                  <span>{(ssBaseRate * (1 + ssMde / 100)).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-200">最小検出差（絶対）</span>
                  <span>{((ssBaseRate / 100) * (ssMde / 100) * 100).toFixed(3)}pp</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-200">有意水準 / 検定力</span>
                  <span>{ssAlpha * 100}% / {ssPower * 100}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">サンプルサイズと検出力の関係</h3>
            <div className="text-xs text-gray-500 space-y-1.5">
              <p>検出したい効果が小さいほど、必要なサンプルが増えます。</p>
              <p>改善効果5%を検出するには、20%を検出するより約16倍のサンプルが必要です。</p>
              <p>テスト期間の目安: 日次訪問数 ÷ 1群必要数 で必要日数を計算できます。</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== 解説 ===== */}
      {activeTab === "guide" && (
        <div className="space-y-4">
          {[
            {
              title: "A/Bテストとは",
              body: "2つのバージョン（A: 現行, B: 変更案）をランダムにユーザーに見せ、どちらが目標指標（CVRなど）を改善するか統計的に判断する手法です。感覚や直感ではなくデータで意思決定できます。",
            },
            {
              title: "p値とは",
              body: "「帰無仮説（A=Bに差がない）が真であるとき、今回観測されたような差かそれ以上の差が偶然生じる確率」です。p < 0.05 なら、偶然である確率が5%未満 = 統計的に有意と判断します。p値は「B群が優れている確率」ではありません。",
            },
            {
              title: "信頼区間とは",
              body: "95%信頼区間は「同じ方法で繰り返し実験したとき、95%の確率で真の差が含まれる区間」です。区間全体がプラスなら改善確実、ゼロをまたぐなら結論を出すのに更なるデータが必要です。",
            },
            {
              title: "リフト率とは",
              body: "B群のCVRがA群に対して何%改善したかを示す相対指標です。例: A=2%, B=2.4% のとき、リフト率=+20%。ただしリフト率が高くても絶対差が小さい（0.4pp）場合は実用的意義が小さいこともあります。",
            },
            {
              title: "よくある間違い",
              body: "① 「p < 0.05 になるまで毎日チェックして止める」は偽陽性が増えます（Peekingと呼ばれる問題）。② サンプルサイズを決める前にテストを開始してはいけません。③ 統計的有意 ≠ 実務的に重要。効果が小さくても有意になることはあります。",
            },
            {
              title: "検定力（Power）とは",
              body: "真に差がある場合に、それを正しく検出できる確率です。80%は「本当に差があるとき、20回に1回は見落とす」ことを意味します。重要な判断ほど90%以上を推奨します。",
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pb-4">
        二項比率の差のZ検定（両側）。正規分布CDF: Abramowitz &amp; Stegun近似を使用。
      </p>

      {/* 使い方ガイド */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">使い方ガイド</h2>
        <ol className="space-y-3">
          {[
            { step: "1", title: "A群・B群のデータを入力", desc: "「有意差検定」タブで、コントロール群（A）とテスト群（B）それぞれの訪問数とCV数を入力します。デフォルト値で動作確認できます。" },
            { step: "2", title: "有意水準を設定", desc: "一般的なWebテストでは5%（標準）、重要な意思決定には1%（厳格）を選びます。信頼区間は90/95/99%から選択できます。" },
            { step: "3", title: "結果を確認", desc: "p値・Z統計量・リフト率・信頼区間が表示されます。「統計的に有意です」と表示されれば差は偶然でない可能性が高いです。" },
            { step: "4", title: "サンプルサイズを事前計算", desc: "テスト前に「サンプルサイズ」タブで必要訪問数を計算しましょう。テスト期間の目安が立てられます。" },
          ].map((item) => (
            <li key={item.step} className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">{item.step}</span>
              <div>
                <div className="font-medium text-gray-800 text-sm">{item.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            {
              q: "ABテストの有意差とはどういう意味ですか？",
              a: "「A群とB群に差がない」という仮説（帰無仮説）を棄却できる統計的な根拠があることを意味します。p値が有意水準（通常5%）未満であれば、観測された差が偶然生じた確率が低いと判断します。",
            },
            {
              q: "p値が0.05未満でも採用しない方がいいですか？",
              a: "統計的有意 ≠ 実務的に重要です。リフト率が0.1%でも大規模なトラフィックがあればp値は小さくなります。信頼区間の幅と実際の効果量（pp差）を合わせて判断することが重要です。",
            },
            {
              q: "必要なサンプルサイズはどう決めますか？",
              a: "「サンプルサイズ」タブで現在のCVRと検出したい最小改善効果（例: 20%改善）を入力すると1群あたりの最低訪問数が計算されます。日次訪問数で割れば必要なテスト期間がわかります。",
            },
            {
              q: "テスト中に毎日p値を確認してもいいですか？",
              a: "推奨しません。「p < 0.05になったら止める」という方法はPeeking問題と呼ばれ、偽陽性（実際には差がないのに有意と判断）が大幅に増えます。事前に決めたサンプルサイズに達してから判断してください。",
            },
            {
              q: "カイ二乗検定との違いは何ですか？",
              a: "本ツールは二項比率の差のZ検定（両側）を使用しています。2×2の分割表に対するカイ二乗検定と数学的に等価であり、Z統計量の二乗がカイ二乗値に対応します。",
            },
          ].map((item, i) => (
            <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="font-medium text-gray-800 text-sm mb-1">Q. {item.q}</div>
              <div className="text-xs text-gray-600 leading-relaxed">A. {item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 関連ツール */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">関連ツール</h2>
        <div className="flex flex-wrap gap-2">
          <a href="/nps-score" className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors">
            <span>📈</span> NPS スコア計算
          </a>
          <a href="/funnel-conversion" className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors">
            <span>🔻</span> ファネル コンバージョン計算
          </a>
          <a href="/chi-square-test" className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors">
            <span>📊</span> カイ二乗検定
          </a>
        </div>
      </div>

      {/* JSON-LD FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "ABテストの有意差とはどういう意味ですか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A群とB群に差がないという仮説を棄却できる統計的な根拠があることです。p値が有意水準（通常5%）未満であれば統計的に有意と判断します。",
                },
              },
              {
                "@type": "Question",
                "name": "必要なサンプルサイズはどう決めますか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "サンプルサイズタブで現在のCVRと検出したい最小改善効果を入力すると1群あたりの最低訪問数が計算されます。",
                },
              },
              {
                "@type": "Question",
                "name": "テスト中に毎日p値を確認してもいいですか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "推奨しません。Peeking問題と呼ばれ偽陽性が増えます。事前に決めたサンプルサイズに達してから判断してください。",
                },
              },
              {
                "@type": "Question",
                "name": "カイ二乗検定との違いは何ですか？",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "本ツールは二項比率の差のZ検定（両側）を使用しています。2×2の分割表に対するカイ二乗検定と数学的に等価です。",
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
