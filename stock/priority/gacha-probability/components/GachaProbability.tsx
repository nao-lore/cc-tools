"use client";
import { useState, useCallback } from "react";

// ---- math ----
function calcCumulative(p: number, n: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  return 1 - Math.pow(1 - p, n);
}

function calcRequiredRolls(p: number, targetProb: number): number {
  if (p <= 0) return Infinity;
  if (p >= 1) return 1;
  // 1 - (1-p)^n >= targetProb  =>  n >= log(1-targetProb) / log(1-p)
  return Math.ceil(Math.log(1 - targetProb) / Math.log(1 - p));
}

// ---- types ----
type Tab = "basic" | "reverse" | "ceiling" | "multi";

interface Preset {
  label: string;
  rate: string;
  ceiling: string;
  emoji: string;
  color: string;
}

const PRESETS: Preset[] = [
  { label: "SSR 3%", rate: "3", ceiling: "100", emoji: "⭐", color: "#f59e0b" },
  { label: "ピックアップ 0.6%", rate: "0.6", ceiling: "300", emoji: "💎", color: "#a78bfa" },
  { label: "SR 12%", rate: "12", ceiling: "100", emoji: "🔵", color: "#38bdf8" },
  { label: "天井300回", rate: "0.6", ceiling: "300", emoji: "🏆", color: "#f43f5e" },
];

const PROB_TABLE_ROWS = [10, 50, 100, 150, 200, 300];

const NEON_PURPLE = "#a78bfa";
const NEON_CYAN = "#22d3ee";
const NEON_PINK = "#f472b6";
const NEON_YELLOW = "#fbbf24";

// ---- sub components ----

function NeonLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold mb-1" style={{ color: NEON_PURPLE }}>
      {children}
    </label>
  );
}

function NeonInput({
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className="w-full rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-2"
      style={{
        background: "#1e1b2e",
        border: "1px solid #4c1d95",
        focusRingColor: NEON_PURPLE,
      }}
    />
  );
}

function BigResult({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl p-4 text-center" style={{ background: "#1e1b2e", border: `1px solid ${color ?? NEON_PURPLE}` }}>
      <div
        className="text-4xl font-black tracking-tight"
        style={{ color: color ?? NEON_PURPLE, textShadow: `0 0 20px ${color ?? NEON_PURPLE}88` }}
      >
        {value}
      </div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

// Bar chart with CSS only
function CumulativeChart({ rate }: { rate: number }) {
  const steps = [1, 5, 10, 20, 30, 50, 80, 100, 150, 200, 300];
  const maxN = steps[steps.length - 1];
  const data = steps.map((n) => ({ n, prob: calcCumulative(rate, n) }));

  return (
    <div className="rounded-xl p-4" style={{ background: "#1e1b2e", border: "1px solid #4c1d95" }}>
      <div className="text-xs font-semibold mb-3" style={{ color: NEON_CYAN }}>累積当選確率グラフ</div>
      <div className="space-y-1">
        {data.map(({ n, prob }) => {
          const pct = prob * 100;
          const barColor =
            pct >= 90 ? NEON_PINK : pct >= 50 ? NEON_PURPLE : NEON_CYAN;
          return (
            <div key={n} className="flex items-center gap-2">
              <div className="text-right text-xs text-gray-500 w-8 shrink-0">{n}回</div>
              <div className="flex-1 rounded-full overflow-hidden" style={{ background: "#2d2040", height: "10px" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(1, pct)}%`,
                    background: barColor,
                    boxShadow: `0 0 6px ${barColor}88`,
                  }}
                />
              </div>
              <div className="text-right text-xs w-12 shrink-0" style={{ color: barColor }}>
                {pct.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-xs text-gray-500 mt-2">※最大{maxN}回まで表示</div>
    </div>
  );
}

function ProbTable({ rate }: { rate: number }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #4c1d95" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "#2d2040" }}>
            <th className="py-2 px-3 text-left text-xs font-semibold" style={{ color: NEON_PURPLE }}>試行回数</th>
            <th className="py-2 px-3 text-right text-xs font-semibold" style={{ color: NEON_PURPLE }}>当選確率</th>
            <th className="py-2 px-3 text-right text-xs font-semibold" style={{ color: NEON_PURPLE }}>外れる確率</th>
          </tr>
        </thead>
        <tbody>
          {PROB_TABLE_ROWS.map((n, i) => {
            const prob = calcCumulative(rate, n);
            const pct = prob * 100;
            const color = pct >= 90 ? NEON_PINK : pct >= 50 ? NEON_PURPLE : NEON_CYAN;
            return (
              <tr
                key={n}
                style={{ background: i % 2 === 0 ? "#1a1630" : "#1e1b2e" }}
              >
                <td className="py-2 px-3 text-gray-300">{n}回</td>
                <td className="py-2 px-3 text-right font-bold" style={{ color }}>
                  {pct.toFixed(2)}%
                </td>
                <td className="py-2 px-3 text-right text-gray-500 text-xs">
                  {((1 - prob) * 100).toFixed(2)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---- tabs ----

function BasicTab() {
  const [rate, setRate] = useState("3");
  const [rolls, setRolls] = useState("10");

  const rateNum = parseFloat(rate) / 100;
  const rollsNum = parseInt(rolls, 10);

  const isValid = !isNaN(rateNum) && rateNum > 0 && rateNum <= 1 && !isNaN(rollsNum) && rollsNum > 0;
  const prob = isValid ? calcCumulative(rateNum, rollsNum) : null;
  const expected = isValid ? Math.ceil(1 / rateNum) : null;

  // 沼判定: 期待値の2倍以上引いてまだ当たってない
  const swamp = isValid && expected !== null && rollsNum >= expected * 2;
  const swampPct = isValid && expected !== null ? (calcCumulative(rateNum, rollsNum) * 100).toFixed(1) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <NeonLabel>排出率 (%)</NeonLabel>
          <NeonInput value={rate} onChange={setRate} placeholder="例: 3" min="0.001" max="100" step="0.1" />
        </div>
        <div>
          <NeonLabel>試行回数 (回)</NeonLabel>
          <NeonInput value={rolls} onChange={setRolls} placeholder="例: 10" min="1" step="1" />
        </div>
      </div>

      {isValid && prob !== null && expected !== null && (
        <>
          <BigResult
            value={`${(prob * 100).toFixed(2)}%`}
            label={`${rollsNum}回引いて1回以上当たる確率`}
            color={prob >= 0.9 ? NEON_PINK : prob >= 0.5 ? NEON_PURPLE : NEON_CYAN}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3 text-center" style={{ background: "#1e1b2e", border: "1px solid #2d2040" }}>
              <div className="text-2xl font-bold" style={{ color: NEON_YELLOW }}>{expected}回</div>
              <div className="text-xs text-gray-400 mt-1">期待値（平均で当たるまでの回数）</div>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ background: "#1e1b2e", border: "1px solid #2d2040" }}>
              <div className="text-2xl font-bold" style={{ color: NEON_CYAN }}>
                {(rateNum * (1 - rateNum) ** (rollsNum - 1) * 100).toFixed(3)}%
              </div>
              <div className="text-xs text-gray-400 mt-1">ちょうど{rollsNum}回目に当たる確率</div>
            </div>
          </div>

          {swamp && (
            <div className="rounded-xl p-3 text-center" style={{ background: "#1a0a0a", border: "1px solid #ef4444" }}>
              <div className="text-lg font-black" style={{ color: "#ef4444" }}>🔥 沼認定</div>
              <div className="text-xs text-gray-400 mt-1">
                あなたは上位 <span style={{ color: "#ef4444" }}>{(100 - parseFloat(swampPct!)).toFixed(1)}%</span> の不運です
              </div>
              <div className="text-xs text-gray-500 mt-1">
                期待値{expected}回の{Math.floor(rollsNum / expected)}倍以上引いています
              </div>
            </div>
          )}

          <CumulativeChart rate={rateNum} />
          <ProbTable rate={rateNum} />
        </>
      )}

      <div className="rounded-lg p-3 text-xs text-gray-500" style={{ background: "#1a1630", border: "1px solid #2d2040" }}>
        ⚠️ ガチャは独立試行です。前回の結果は次回に影響しません。
      </div>
    </div>
  );
}

function ReverseTab() {
  const [rate, setRate] = useState("3");
  const [targetProb, setTargetProb] = useState("90");

  const rateNum = parseFloat(rate) / 100;
  const targetProbNum = parseFloat(targetProb) / 100;

  const isValid =
    !isNaN(rateNum) && rateNum > 0 && rateNum <= 1 &&
    !isNaN(targetProbNum) && targetProbNum > 0 && targetProbNum < 1;

  const required = isValid ? calcRequiredRolls(rateNum, targetProbNum) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <NeonLabel>排出率 (%)</NeonLabel>
          <NeonInput value={rate} onChange={setRate} placeholder="例: 3" min="0.001" max="100" step="0.1" />
        </div>
        <div>
          <NeonLabel>目標確率 (%)</NeonLabel>
          <NeonInput value={targetProb} onChange={setTargetProb} placeholder="例: 90" min="1" max="99.9" step="1" />
        </div>
      </div>

      {isValid && required !== null && (
        <>
          <BigResult
            value={`${required}回`}
            label={`${targetProb}%の確率で当たるのに必要な試行回数`}
            color={NEON_CYAN}
          />

          <div className="grid grid-cols-3 gap-2">
            {[50, 80, 90, 95, 99].map((pct) => {
              const n = calcRequiredRolls(rateNum, pct / 100);
              const isTarget = Math.abs(pct - parseFloat(targetProb)) < 0.1;
              return (
                <div
                  key={pct}
                  className="rounded-lg p-2 text-center cursor-pointer transition-all"
                  style={{
                    background: isTarget ? "#2d1a4e" : "#1e1b2e",
                    border: `1px solid ${isTarget ? NEON_PURPLE : "#2d2040"}`,
                  }}
                  onClick={() => setTargetProb(String(pct))}
                >
                  <div className="text-sm font-bold" style={{ color: isTarget ? NEON_PURPLE : "#94a3b8" }}>
                    {pct}%
                  </div>
                  <div className="text-xs text-gray-400">{n}回</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="rounded-lg p-3 text-xs text-gray-500" style={{ background: "#1a1630", border: "1px solid #2d2040" }}>
        ⚠️ ガチャは独立試行です。前回の結果は次回に影響しません。
      </div>
    </div>
  );
}

function CeilingTab() {
  const [rate, setRate] = useState("0.6");
  const [ceilingRolls, setCeilingRolls] = useState("300");
  const [stonesPerRoll, setStonesPerRoll] = useState("150");
  const [stonePriceYen, setStonePriceYen] = useState("5");

  const rateNum = parseFloat(rate) / 100;
  const ceilingNum = parseInt(ceilingRolls, 10);
  const stonesNum = parseInt(stonesPerRoll, 10);
  const priceNum = parseFloat(stonePriceYen);

  const isValid =
    !isNaN(rateNum) && rateNum > 0 &&
    !isNaN(ceilingNum) && ceilingNum > 0 &&
    !isNaN(stonesNum) && stonesNum > 0 &&
    !isNaN(priceNum) && priceNum >= 0;

  const totalStones = isValid ? ceilingNum * stonesNum : null;
  const totalCost = isValid && totalStones !== null ? Math.ceil(totalStones * priceNum) : null;
  const prob50 = isValid ? calcCumulative(rateNum, Math.floor(ceilingNum / 2)) : null;
  const expected = isValid ? Math.ceil(1 / rateNum) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <NeonLabel>排出率 (%)</NeonLabel>
          <NeonInput value={rate} onChange={setRate} placeholder="例: 0.6" min="0.001" max="100" step="0.1" />
        </div>
        <div>
          <NeonLabel>天井回数</NeonLabel>
          <NeonInput value={ceilingRolls} onChange={setCeilingRolls} placeholder="例: 300" min="1" step="1" />
        </div>
        <div>
          <NeonLabel>1回あたりの石/ジェム数</NeonLabel>
          <NeonInput value={stonesPerRoll} onChange={setStonesPerRoll} placeholder="例: 150" min="1" step="1" />
        </div>
        <div>
          <NeonLabel>石1個の単価 (円)</NeonLabel>
          <NeonInput value={stonePriceYen} onChange={setStonePriceYen} placeholder="例: 5" min="0" step="0.1" />
        </div>
      </div>

      {isValid && totalStones !== null && totalCost !== null && expected !== null && prob50 !== null && (
        <>
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: "#1a0a0a", border: "1px solid #ef4444" }}
          >
            <div className="text-xs font-semibold mb-1" style={{ color: "#ef4444" }}>
              ⚠️ 天井到達コスト
            </div>
            <div
              className="text-4xl font-black"
              style={{ color: "#ef4444", textShadow: "0 0 20px #ef444488" }}
            >
              {totalCost.toLocaleString()}円
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {totalStones.toLocaleString()}個の石 / {ceilingNum}回
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3 text-center" style={{ background: "#1e1b2e", border: "1px solid #2d2040" }}>
              <div className="text-2xl font-bold" style={{ color: NEON_YELLOW }}>{expected}回</div>
              <div className="text-xs text-gray-400 mt-1">期待回数</div>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ background: "#1e1b2e", border: "1px solid #2d2040" }}>
              <div className="text-2xl font-bold" style={{ color: NEON_CYAN }}>
                {(prob50 * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400 mt-1">天井半分({Math.floor(ceilingNum / 2)}回)で当たる確率</div>
            </div>
          </div>

          <div className="rounded-lg p-3" style={{ background: "#1e1b2e", border: "1px solid #2d2040" }}>
            <div className="text-xs font-semibold mb-2" style={{ color: NEON_PURPLE }}>期待コスト目安</div>
            {[
              { label: "50%で当たるコスト", n: calcRequiredRolls(rateNum, 0.5) },
              { label: "80%で当たるコスト", n: calcRequiredRolls(rateNum, 0.8) },
              { label: "90%で当たるコスト", n: calcRequiredRolls(rateNum, 0.9) },
            ].map(({ label, n }) => {
              const cost = Math.min(n, ceilingNum) * stonesNum * priceNum;
              return (
                <div key={label} className="flex justify-between items-center py-1 text-sm">
                  <span className="text-gray-400 text-xs">{label}</span>
                  <span style={{ color: NEON_YELLOW }} className="font-bold">
                    {Math.ceil(cost).toLocaleString()}円
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="rounded-lg p-3 text-xs text-gray-500" style={{ background: "#1a1630", border: "1px solid #2d2040" }}>
        ⚠️ ガチャは独立試行です。前回の結果は次回に影響しません。
      </div>
    </div>
  );
}

function MultiTab() {
  const [rateA, setRateA] = useState("3");
  const [rateB, setRateB] = useState("3");
  const [rolls, setRolls] = useState("100");

  const rateANum = parseFloat(rateA) / 100;
  const rateBNum = parseFloat(rateB) / 100;
  const rollsNum = parseInt(rolls, 10);

  const isValid =
    !isNaN(rateANum) && rateANum > 0 && rateANum <= 1 &&
    !isNaN(rateBNum) && rateBNum > 0 && rateBNum <= 1 &&
    !isNaN(rollsNum) && rollsNum > 0;

  const probA = isValid ? calcCumulative(rateANum, rollsNum) : null;
  const probB = isValid ? calcCumulative(rateBNum, rollsNum) : null;
  const probBoth = isValid && probA !== null && probB !== null ? probA * probB : null;

  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-400 rounded-lg p-2" style={{ background: "#1a1630", border: "1px solid #2d2040" }}>
        「AとB両方引きたい」場合の計算（独立ガチャ想定）
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <NeonLabel>キャラA 排出率 (%)</NeonLabel>
          <NeonInput value={rateA} onChange={setRateA} placeholder="例: 3" min="0.001" max="100" step="0.1" />
        </div>
        <div>
          <NeonLabel>キャラB 排出率 (%)</NeonLabel>
          <NeonInput value={rateB} onChange={setRateB} placeholder="例: 3" min="0.001" max="100" step="0.1" />
        </div>
      </div>

      <div>
        <NeonLabel>共通の試行回数 (回)</NeonLabel>
        <NeonInput value={rolls} onChange={setRolls} placeholder="例: 100" min="1" step="1" />
      </div>

      {isValid && probA !== null && probB !== null && probBoth !== null && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg p-3 text-center" style={{ background: "#1e1b2e", border: "1px solid #2d2040" }}>
              <div className="text-xl font-bold" style={{ color: NEON_CYAN }}>
                {(probA * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400 mt-1">Aが当たる確率</div>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ background: "#1e1b2e", border: "1px solid #2d2040" }}>
              <div className="text-xl font-bold" style={{ color: NEON_PINK }}>
                {(probB * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400 mt-1">Bが当たる確率</div>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ background: "#2d1a4e", border: `1px solid ${NEON_PURPLE}` }}>
              <div className="text-xl font-bold" style={{ color: NEON_PURPLE }}>
                {(probBoth * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-gray-400 mt-1">両方当たる確率</div>
            </div>
          </div>

          <BigResult
            value={`${(probBoth * 100).toFixed(2)}%`}
            label={`${rollsNum}回ずつ引いてAとB両方当たる確率`}
            color={NEON_PURPLE}
          />

          <div className="rounded-lg p-3" style={{ background: "#1e1b2e", border: "1px solid #2d2040" }}>
            <div className="text-xs font-semibold mb-2" style={{ color: NEON_PURPLE }}>両方90%で引くには？</div>
            <div className="text-sm text-gray-300">
              A: <span style={{ color: NEON_CYAN }}>{calcRequiredRolls(rateANum, 0.9)}回</span>
              {" "}/ B: <span style={{ color: NEON_PINK }}>{calcRequiredRolls(rateBNum, 0.9)}回</span>
              {" "}/ 合計: <span style={{ color: NEON_PURPLE }}>
                {calcRequiredRolls(rateANum, 0.9) + calcRequiredRolls(rateBNum, 0.9)}回
              </span>
            </div>
          </div>
        </>
      )}

      <div className="rounded-lg p-3 text-xs text-gray-500" style={{ background: "#1a1630", border: "1px solid #2d2040" }}>
        ⚠️ ガチャは独立試行です。前回の結果は次回に影響しません。
      </div>
    </div>
  );
}

// ---- main ----

export default function GachaProbability() {
  const [tab, setTab] = useState<Tab>("basic");
  const [rate, setRate] = useState("3");
  const [ceilingRolls, setCeilingRolls] = useState("300");

  const applyPreset = useCallback((preset: Preset) => {
    setRate(preset.rate);
    setCeilingRolls(preset.ceiling);
    setTab("basic");
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: "basic", label: "基本計算" },
    { id: "reverse", label: "逆算" },
    { id: "ceiling", label: "天井コスト" },
    { id: "multi", label: "複数キャラ" },
  ];

  return (
    <div className="space-y-4">
      {/* プリセット */}
      <div>
        <div className="text-xs font-semibold mb-2" style={{ color: NEON_PURPLE }}>よくあるプリセット</div>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="rounded-lg px-3 py-2 text-left text-xs font-semibold transition-all active:scale-95"
              style={{
                background: "#1e1b2e",
                border: `1px solid ${preset.color}44`,
                color: preset.color,
              }}
            >
              <span className="mr-1">{preset.emoji}</span>
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* タブ */}
      <div className="flex rounded-lg overflow-hidden" style={{ background: "#1a1630", border: "1px solid #2d2040" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 text-xs font-semibold transition-all"
            style={{
              background: tab === t.id ? "#2d1a4e" : "transparent",
              color: tab === t.id ? NEON_PURPLE : "#6b7280",
              borderBottom: tab === t.id ? `2px solid ${NEON_PURPLE}` : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      <div>
        {tab === "basic" && <BasicTab />}
        {tab === "reverse" && <ReverseTab />}
        {tab === "ceiling" && <CeilingTab />}
        {tab === "multi" && <MultiTab />}
      </div>
    </div>
  );
}
