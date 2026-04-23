"use client";

import { useState, useMemo } from "react";

interface GamePreset {
  name: string;
  ceiling: number;
  ratePercent: number;
  costPerPull: number;
  currency: string;
}

const PRESETS: GamePreset[] = [
  { name: "原神", ceiling: 90, ratePercent: 0.6, costPerPull: 160, currency: "石" },
  { name: "スターレイル", ceiling: 90, ratePercent: 0.6, costPerPull: 160, currency: "星玉" },
  { name: "ブルアカ", ceiling: 200, ratePercent: 0.7, costPerPull: 120, currency: "ピロケット" },
  { name: "FGO", ceiling: 330, ratePercent: 1.0, costPerPull: 30, currency: "SQ" },
  { name: "カスタム", ceiling: 100, ratePercent: 1.0, costPerPull: 150, currency: "石" },
];

function calcExpectedPulls(ceiling: number, ratePercent: number): number {
  // Geometric distribution approximation (no pity scaling = simplest model)
  const p = ratePercent / 100;
  // Expected pulls until first success, capped at ceiling
  // E[X] = sum_{k=1}^{ceiling} k * (1-p)^(k-1) * p + ceiling * (1-p)^ceiling
  let expected = 0;
  let cumProb = 0;
  for (let k = 1; k <= ceiling; k++) {
    const prob = Math.pow(1 - p, k - 1) * p;
    expected += k * prob;
    cumProb += prob;
  }
  // Remaining probability goes to ceiling (pity)
  expected += ceiling * (1 - cumProb);
  return expected;
}

function formatNum(n: number): string {
  return n.toLocaleString("ja-JP", { maximumFractionDigits: 0 });
}

export default function GachaCostCeiling() {
  const [selectedPreset, setSelectedPreset] = useState<GamePreset>(PRESETS[0]);
  const [ceiling, setCeiling] = useState(String(PRESETS[0].ceiling));
  const [ratePercent, setRatePercent] = useState(String(PRESETS[0].ratePercent));
  const [costPerPull, setCostPerPull] = useState(String(PRESETS[0].costPerPull));
  const [jpyPerUnit, setJpyPerUnit] = useState("1"); // yen per currency unit
  const [targetCount, setTargetCount] = useState("1");
  const [currentPulls, setCurrentPulls] = useState("0");

  const applyPreset = (p: GamePreset) => {
    setSelectedPreset(p);
    setCeiling(String(p.ceiling));
    setRatePercent(String(p.ratePercent));
    setCostPerPull(String(p.costPerPull));
  };

  const result = useMemo(() => {
    const c = parseFloat(ceiling);
    const r = parseFloat(ratePercent);
    const cpp = parseFloat(costPerPull);
    const jpy = parseFloat(jpyPerUnit);
    const target = parseInt(targetCount) || 1;
    const current = parseInt(currentPulls) || 0;

    if (isNaN(c) || isNaN(r) || c <= 0 || r <= 0 || r > 100) return null;

    const expectedPerUnit = calcExpectedPulls(c, r);
    const ceilCost = c * cpp;
    const expectedCost = expectedPerUnit * cpp;
    const remainingToCeiling = Math.max(0, c - current);

    const totalCeilCost = ceilCost * target;
    const totalExpectedCost = expectedPerUnit * target * cpp;
    const remainingCeilCost = remainingToCeiling * cpp;

    const toJpy = (units: number) => isNaN(jpy) || jpy <= 0 ? null : units * jpy;

    return {
      expectedPerUnit,
      ceilCost,
      expectedCost,
      remainingToCeiling,
      remainingCeilCost,
      totalCeilCost,
      totalExpectedCost,
      toJpy,
    };
  }, [ceiling, ratePercent, costPerPull, jpyPerUnit, targetCount, currentPulls]);

  return (
    <div className="space-y-5">
      {/* Preset selector */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <p className="text-xs text-muted mb-2 font-medium">ゲームを選択（またはカスタム入力）</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                selectedPreset.name === p.name
                  ? "bg-primary text-white border-primary"
                  : "bg-accent border-border hover:border-primary/50"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">ガチャ設定</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1">天井（回数）</label>
            <input
              type="number"
              inputMode="numeric"
              value={ceiling}
              onChange={(e) => setCeiling(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">排出率（%）</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={ratePercent}
              onChange={(e) => setRatePercent(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">1回あたりのコスト（{selectedPreset.currency}）</label>
            <input
              type="number"
              inputMode="numeric"
              value={costPerPull}
              onChange={(e) => setCostPerPull(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">1{selectedPreset.currency}あたり（円）</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              placeholder="省略可"
              value={jpyPerUnit}
              onChange={(e) => setJpyPerUnit(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">目標キャラ数</label>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              value={targetCount}
              onChange={(e) => setTargetCount(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">現在の累積回数</label>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={currentPulls}
              onChange={(e) => setCurrentPulls(e.target.value)}
              className="w-full px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-accent"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
              <p className="text-xs text-muted mb-1">天井コスト（確定）</p>
              <p className="text-xl font-bold font-mono text-primary">
                {formatNum(result.ceilCost)} {selectedPreset.currency}
              </p>
              {result.toJpy(result.ceilCost) !== null && (
                <p className="text-xs text-muted mt-1">≈ ¥{formatNum(result.toJpy(result.ceilCost)!)}</p>
              )}
            </div>
            <div className="bg-accent border border-border rounded-xl p-4">
              <p className="text-xs text-muted mb-1">期待値（確率計算）</p>
              <p className="text-xl font-bold font-mono text-foreground">
                {formatNum(result.expectedCost)} {selectedPreset.currency}
              </p>
              <p className="text-xs text-muted mt-1">≈ {result.expectedPerUnit.toFixed(1)}回</p>
            </div>
            <div className="bg-accent border border-border rounded-xl p-4">
              <p className="text-xs text-muted mb-1">天井まであと</p>
              <p className="text-xl font-bold font-mono text-foreground">
                {result.remainingToCeiling}回
              </p>
              <p className="text-xs text-muted mt-1">{formatNum(result.remainingCeilCost)} {selectedPreset.currency}</p>
            </div>
          </div>

          {parseInt(targetCount) > 1 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted mb-2 font-medium">複数キャラ取得シミュレーション（{targetCount}体）</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted">最大コスト（全天井）</p>
                  <p className="font-bold font-mono text-lg">{formatNum(result.totalCeilCost)} {selectedPreset.currency}</p>
                  {result.toJpy(result.totalCeilCost) !== null && (
                    <p className="text-xs text-muted">≈ ¥{formatNum(result.toJpy(result.totalCeilCost)!)}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted">期待コスト</p>
                  <p className="font-bold font-mono text-lg">{formatNum(result.totalExpectedCost)} {selectedPreset.currency}</p>
                  {result.toJpy(result.totalExpectedCost) !== null && (
                    <p className="text-xs text-muted">≈ ¥{formatNum(result.toJpy(result.totalExpectedCost)!)}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
