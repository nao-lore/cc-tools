"use client";

import { useState, useMemo } from "react";

type Period = "once" | "monthly" | "yearly";
type Mode = "cost" | "reverse" | "compare";

interface CarSpec {
  label: string;
  distance: string;
  fuelEconomy: string;
}

const PERIOD_OPTIONS: { value: Period; label: string; multiplier: number }[] = [
  { value: "once", label: "1回", multiplier: 1 },
  { value: "monthly", label: "月間", multiplier: 1 },
  { value: "yearly", label: "年間", multiplier: 12 },
];

const PRICE_PRESETS = [155, 165, 170, 175, 185];

function calcFuel(distanceKm: number, fuelEconomyKmL: number): number {
  if (fuelEconomyKmL <= 0) return 0;
  return distanceKm / fuelEconomyKmL;
}

function calcCost(fuelL: number, pricePerL: number): number {
  return fuelL * pricePerL;
}

function calcDistanceFromBudget(budgetYen: number, fuelEconomyKmL: number, pricePerL: number): number {
  if (pricePerL <= 0) return 0;
  const fuelL = budgetYen / pricePerL;
  return fuelL * fuelEconomyKmL;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

function fmtDec(n: number, d = 2): string {
  return n.toFixed(d);
}

const inputClass =
  "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-right text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-white";

export default function FuelEconomy() {
  const [mode, setMode] = useState<Mode>("cost");
  const [period, setPeriod] = useState<Period>("once");

  // Cost mode inputs
  const [distance, setDistance] = useState("100");
  const [fuelEconomy, setFuelEconomy] = useState("15");
  const [pricePerL, setPricePerL] = useState("170");

  // Reverse mode inputs
  const [budget, setBudget] = useState("5000");
  const [revFuelEconomy, setRevFuelEconomy] = useState("15");
  const [revPricePerL, setRevPricePerL] = useState("170");

  // Compare mode: car A and car B
  const [carA, setCarA] = useState<CarSpec>({ label: "車A", distance: "1000", fuelEconomy: "15" });
  const [carB, setCarB] = useState<CarSpec>({ label: "車B", distance: "1000", fuelEconomy: "25" });
  const [cmpPricePerL, setCmpPricePerL] = useState("170");

  const periodMultiplier = PERIOD_OPTIONS.find((p) => p.value === period)?.multiplier ?? 1;
  const periodLabel = period === "once" ? "1回" : period === "monthly" ? "月間" : "年間";

  // Cost mode calc
  const costResult = useMemo(() => {
    const d = parseFloat(distance);
    const fe = parseFloat(fuelEconomy);
    const p = parseFloat(pricePerL);
    if (!d || !fe || !p || d <= 0 || fe <= 0 || p <= 0) return null;
    const trips = period === "once" ? 1 : period === "monthly" ? 1 : 12;
    const totalDistance = d * (period === "yearly" ? 12 : 1);
    const fuelL = calcFuel(totalDistance, fe);
    const cost = calcCost(fuelL, p);
    return { fuelL, cost, distanceTotal: totalDistance };
  }, [distance, fuelEconomy, pricePerL, period]);

  // Reverse mode calc
  const reverseResult = useMemo(() => {
    const b = parseFloat(budget);
    const fe = parseFloat(revFuelEconomy);
    const p = parseFloat(revPricePerL);
    if (!b || !fe || !p || b <= 0 || fe <= 0 || p <= 0) return null;
    const totalBudget = period === "yearly" ? b * 12 : b;
    const km = calcDistanceFromBudget(totalBudget, fe, p);
    const fuelL = totalBudget / p;
    return { km, fuelL, totalBudget };
  }, [budget, revFuelEconomy, revPricePerL, period]);

  // Compare mode calc
  const compareResult = useMemo(() => {
    const da = parseFloat(carA.distance);
    const fea = parseFloat(carA.fuelEconomy);
    const db = parseFloat(carB.distance);
    const feb = parseFloat(carB.fuelEconomy);
    const p = parseFloat(cmpPricePerL);
    if (!da || !fea || !db || !feb || !p || da <= 0 || fea <= 0 || db <= 0 || feb <= 0 || p <= 0) return null;
    const multA = period === "yearly" ? 12 : 1;
    const multB = period === "yearly" ? 12 : 1;
    const fuelA = calcFuel(da * multA, fea);
    const fuelB = calcFuel(db * multB, feb);
    const costA = calcCost(fuelA, p);
    const costB = calcCost(fuelB, p);
    return { fuelA, fuelB, costA, costB, diff: Math.abs(costA - costB), cheaper: costA <= costB ? "A" : "B" };
  }, [carA, carB, cmpPricePerL, period]);

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex gap-2 mb-5">
          {(
            [
              { value: "cost", label: "コスト計算" },
              { value: "reverse", label: "予算→距離" },
              { value: "compare", label: "車比較" },
            ] as { value: Mode; label: string }[]
          ).map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                mode === m.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-gray-200 text-gray-500 hover:border-blue-300"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Period toggle */}
        <div className="mb-5">
          <p className="text-xs text-gray-500 mb-2">期間</p>
          <div className="flex gap-2">
            {PERIOD_OPTIONS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  period === p.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-gray-200 text-gray-500 hover:border-blue-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ---- COST MODE ---- */}
        {mode === "cost" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                走行距離 ({period === "yearly" ? "月あたり km" : "km"})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className={inputClass}
                  placeholder="100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">km</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">燃費</label>
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={fuelEconomy}
                  onChange={(e) => setFuelEconomy(e.target.value)}
                  className={inputClass}
                  placeholder="15"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">km/L</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-500">ガソリン単価</label>
                <div className="flex gap-1">
                  {PRICE_PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPricePerL(String(p))}
                      className={`px-2 py-0.5 text-xs rounded border transition-all font-mono ${
                        pricePerL === String(p)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={pricePerL}
                  onChange={(e) => setPricePerL(e.target.value)}
                  className={inputClass}
                  placeholder="170"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">円/L</span>
              </div>
            </div>
          </div>
        )}

        {/* ---- REVERSE MODE ---- */}
        {mode === "reverse" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                予算 ({period === "yearly" ? "月あたり 円" : "円"})
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={inputClass}
                  placeholder="5000"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">円</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">燃費</label>
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={revFuelEconomy}
                  onChange={(e) => setRevFuelEconomy(e.target.value)}
                  className={inputClass}
                  placeholder="15"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">km/L</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-500">ガソリン単価</label>
                <div className="flex gap-1">
                  {PRICE_PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setRevPricePerL(String(p))}
                      className={`px-2 py-0.5 text-xs rounded border transition-all font-mono ${
                        revPricePerL === String(p)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={revPricePerL}
                  onChange={(e) => setRevPricePerL(e.target.value)}
                  className={inputClass}
                  placeholder="170"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">円/L</span>
              </div>
            </div>
          </div>
        )}

        {/* ---- COMPARE MODE ---- */}
        {mode === "compare" && (
          <div className="space-y-4">
            {(
              [
                { key: "A", spec: carA, setSpec: setCarA },
                { key: "B", spec: carB, setSpec: setCarB },
              ] as { key: string; spec: CarSpec; setSpec: (s: CarSpec) => void }[]
            ).map(({ key, spec, setSpec }) => (
              <div key={key} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">車 {key}</p>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    走行距離 ({period === "yearly" ? "月あたり km" : "km"})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={spec.distance}
                      onChange={(e) => setSpec({ ...spec, distance: e.target.value })}
                      className={inputClass}
                      placeholder="1000"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">km</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">燃費</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.1"
                      step="0.5"
                      value={spec.fuelEconomy}
                      onChange={(e) => setSpec({ ...spec, fuelEconomy: e.target.value })}
                      className={inputClass}
                      placeholder="15"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">km/L</span>
                  </div>
                </div>
              </div>
            ))}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-500">ガソリン単価（共通）</label>
                <div className="flex gap-1">
                  {PRICE_PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setCmpPricePerL(String(p))}
                      className={`px-2 py-0.5 text-xs rounded border transition-all font-mono ${
                        cmpPricePerL === String(p)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-50 border-gray-200 text-gray-500 hover:border-blue-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={cmpPricePerL}
                  onChange={(e) => setCmpPricePerL(e.target.value)}
                  className={inputClass}
                  placeholder="170"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">円/L</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---- RESULTS ---- */}

      {/* Cost result */}
      {mode === "cost" && costResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-1">
                ガソリン代（{periodLabel}）
              </p>
              <p className="text-5xl font-extrabold text-blue-700">
                ¥{fmt(costResult.cost)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {period === "yearly" ? `月 ¥${fmt(costResult.cost / 12)} × 12ヶ月` : ""}
              </p>
            </div>
            <div className="text-right text-sm text-gray-500 shrink-0">
              <p className="font-medium text-gray-700 mb-1">必要ガソリン量</p>
              <p className="text-2xl font-bold text-gray-800">{fmtDec(costResult.fuelL)} L</p>
              {period !== "once" && (
                <p className="text-xs mt-1">走行 {fmt(costResult.distanceTotal)} km</p>
              )}
            </div>
          </div>

          {/* Formula */}
          <div className="rounded-lg bg-white/60 border border-blue-100 px-4 py-2.5 text-xs text-gray-500 font-mono">
            {period === "yearly"
              ? `${distance} km × 12ヶ月 ÷ ${fuelEconomy} km/L × ¥${pricePerL}/L = ¥${fmt(costResult.cost)}`
              : `${distance} km ÷ ${fuelEconomy} km/L × ¥${pricePerL}/L = ¥${fmt(costResult.cost)}`}
          </div>

          {/* 年間コスト参考（onceや月間の場合） */}
          {period === "once" && (
            <div className="text-xs text-gray-500 text-right">
              月30回換算: <span className="font-semibold text-gray-700">¥{fmt(costResult.cost * 30)}</span> / 月
            </div>
          )}
          {period === "monthly" && (
            <div className="text-xs text-gray-500 text-right">
              年間: <span className="font-semibold text-gray-700">¥{fmt(costResult.cost * 12)}</span>
            </div>
          )}
        </div>
      )}

      {!costResult && mode === "cost" && (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center text-sm text-gray-400">
          値を入力すると計算結果が表示されます
        </div>
      )}

      {/* Reverse result */}
      {mode === "reverse" && reverseResult && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">
                走れる距離（{periodLabel}）
              </p>
              <p className="text-5xl font-extrabold text-green-700">
                {fmt(reverseResult.km)} <span className="text-2xl font-bold">km</span>
              </p>
            </div>
            <div className="text-right text-sm text-gray-500 shrink-0">
              <p className="font-medium text-gray-700 mb-1">使えるガソリン量</p>
              <p className="text-2xl font-bold text-gray-800">{fmtDec(reverseResult.fuelL)} L</p>
              {period === "yearly" && (
                <p className="text-xs mt-1">月 {fmt(reverseResult.km / 12)} km</p>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-white/60 border border-green-100 px-4 py-2.5 text-xs text-gray-500 font-mono">
            {period === "yearly"
              ? `¥${budget} × 12ヶ月 ÷ ¥${revPricePerL}/L × ${revFuelEconomy} km/L = ${fmt(reverseResult.km)} km`
              : `¥${budget} ÷ ¥${revPricePerL}/L × ${revFuelEconomy} km/L = ${fmt(reverseResult.km)} km`}
          </div>
        </div>
      )}

      {!reverseResult && mode === "reverse" && (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center text-sm text-gray-400">
          値を入力すると計算結果が表示されます
        </div>
      )}

      {/* Compare result */}
      {mode === "compare" && compareResult && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">比較結果（{periodLabel}）</h2>

          {(
            [
              { key: "A", spec: carA, fuel: compareResult.fuelA, cost: compareResult.costA },
              { key: "B", spec: carB, fuel: compareResult.fuelB, cost: compareResult.costB },
            ] as { key: string; spec: CarSpec; fuel: number; cost: number }[]
          ).map(({ key, spec, fuel, cost }) => {
            const maxCost = Math.max(compareResult.costA, compareResult.costB);
            const pct = maxCost > 0 ? (cost / maxCost) * 100 : 100;
            const isCheaper = compareResult.cheaper === key;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      車 {key}
                      {isCheaper && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">
                          お得
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {spec.distance} km / {spec.fuelEconomy} km/L
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-gray-800">¥{fmt(cost)}</span>
                    <span className="text-xs text-gray-400 ml-1">({fmtDec(fuel)} L)</span>
                  </div>
                </div>
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCheaper ? "bg-green-400" : "bg-gray-300"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この燃費・ガソリン代 計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">走行距離・燃費・単価から給油コスト、年間費用。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この燃費・ガソリン代 計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "走行距離・燃費・単価から給油コスト、年間費用。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
            );
          })}

          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">差額</span>
            <span className="text-lg font-bold text-gray-800">¥{fmt(compareResult.diff)}</span>
          </div>

          {/* Annual projection if not already yearly */}
          {period !== "yearly" && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-2.5 text-xs text-gray-500">
              年間換算: 車A ¥{fmt(compareResult.costA * 12)} / 車B ¥{fmt(compareResult.costB * 12)} (差額 ¥{fmt(compareResult.diff * 12)})
            </div>
          )}
        </div>
      )}

      {!compareResult && mode === "compare" && (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center text-sm text-gray-400">
          値を入力すると比較結果が表示されます
        </div>
      )}

      {/* Ad placeholder */}
      <div className="flex items-center justify-center h-[90px] bg-gray-100/60 border border-dashed border-gray-300 rounded-xl text-xs text-gray-400">
        Advertisement
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "燃費・ガソリン代 計算",
  "description": "走行距離・燃費・単価から給油コスト、年間費用",
  "url": "https://tools.loresync.dev/fuel-economy",
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
