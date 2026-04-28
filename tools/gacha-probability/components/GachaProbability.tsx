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
type Lang = "ja" | "en";

interface Preset {
  label: string;
  labelEn: string;
  rate: string;
  ceiling: string;
  emoji: string;
  color: string;
}

// ---- translations ----
const T = {
  ja: {
    presetTitle: "よくあるプリセット",
    tabs: { basic: "基本計算", reverse: "逆算", ceiling: "天井コスト", multi: "複数キャラ" },
    // BasicTab
    rate: "排出率 (%)",
    rolls: "試行回数 (回)",
    hitProb: (n: number) => `${n}回引いて1回以上当たる確率`,
    expected: "期待値（平均で当たるまでの回数）",
    exactProb: (n: number) => `ちょうど${n}回目に当たる確率`,
    swamp: "🔥 沼認定",
    swampDesc: (pct: string) => `あなたは上位 ${pct}% の不運です`,
    swampTimes: (expected: number, times: number) => `期待値${expected}回の${times}倍以上引いています`,
    chartTitle: "累積当選確率グラフ",
    chartMax: (n: number) => `※最大${n}回まで表示`,
    trialCount: (n: number) => `${n}回`,
    tableTrials: "試行回数",
    tableHit: "当選確率",
    tableMiss: "外れる確率",
    disclaimer: "⚠️ ガチャは独立試行です。前回の結果は次回に影響しません。",
    // ReverseTab
    targetProb: "目標確率 (%)",
    requiredRolls: (pct: string) => `${pct}%の確率で当たるのに必要な試行回数`,
    // CeilingTab
    ceilingRolls: "天井回数",
    stonesPerRoll: "1回あたりの石/ジェム数",
    stonePriceYen: "石1個の単価 (円)",
    ceilingCostLabel: "⚠️ 天井到達コスト",
    ceilingCostUnit: "円",
    ceilingCostSub: (stones: string, n: string) => `${stones}個の石 / ${n}回`,
    expectedRolls: "期待回数",
    halfCeilingProb: (n: number) => `天井半分(${n}回)で当たる確率`,
    expectedCostTitle: "期待コスト目安",
    cost50: "50%で当たるコスト",
    cost80: "80%で当たるコスト",
    cost90: "90%で当たるコスト",
    // MultiTab
    multiNote: "「AとBの両方引きたい」場合の計算（独立ガチャ想定）",
    rateA: "キャラA 排出率 (%)",
    rateB: "キャラB 排出率 (%)",
    commonRolls: "共通の試行回数 (回)",
    probA: "Aが当たる確率",
    probB: "Bが当たる確率",
    probBoth: "両方当たる確率",
    bothProb: (n: number) => `${n}回ずつ引いてAとB両方当たる確率`,
    both90Title: "両方90%で引くには？",
    both90: (a: number, b: number, total: number) => `A: ${a}回 / B: ${b}回 / 合計: ${total}回`,
    // Guide
    guideTitle: "使い方ガイド",
    guide: [
      { step: "1", title: "プリセットを選択", desc: "SSR 3%・ピックアップ 0.6% など代表的なガチャ設定を選ぶか、排出率を直接入力します。" },
      { step: "2", title: "基本計算タブで確率を確認", desc: "試行回数と排出率を入力すると、その回数で1回以上当たる累積確率・期待値・沼判定が表示されます。" },
      { step: "3", title: "逆算タブで必要回数を計算", desc: "「90% の確率で当てたい」など目標確率から必要な試行回数を逆算できます。" },
      { step: "4", title: "天井コストタブで課金額を試算", desc: "天井回数・石の単価を入力すると天井到達コストが円換算で表示されます。課金前の確認に活用してください。" },
    ],
    // FAQ
    faqTitle: "よくある質問（FAQ）",
    faq: [
      {
        q: "ガチャの排出率 3% とは？何回で当たる？",
        a: "排出率 3% は 1 回引くたびに 3% の確率で当たることを意味します。期待値（平均で当たるまでの回数）は約 34 回です。ただし 34 回引いても当たる確率は約 64% に過ぎず、90% に達するには約 76 回必要です。",
      },
      {
        q: "天井とは？天井コストの計算方法は？",
        a: "天井とは、指定回数（例：300 回）引くと必ず目的のキャラが手に入る保証システムです。天井コスト = 天井回数 × 1回あたりの石/ジェム数 × 石の単価（円）で計算できます。このツールの「天井コスト」タブで自動計算できます。",
      },
      {
        q: "前回外れたから次は当たりやすい？",
        a: "いいえ。通常のガチャは独立試行のため、前回の結果は次回に一切影響しません。「前回 50 回外れたから次は当たりやすい」は誤りです（ガンブラーの誤謬）。毎回同じ確率でリセットされます。",
      },
      {
        q: "複数キャラを同時に狙う場合の確率は？",
        a: "「複数キャラ」タブで計算できます。AとB両方引く確率は「Aが当たる確率 × Bが当たる確率」で求められます。例えば各 3% のキャラを 100 回ずつ引く場合、両方当たる確率は約 41% です。",
      },
    ],
    // Related
    relatedTitle: "関連ツール",
    relatedLinks: [
      { href: "/gacha-cost-ceiling", title: "ガチャ天井コスト計算", desc: "天井到達までの総課金額を詳細にシミュレーション。" },
      { href: "/goshugi-souba", title: "ご祝儀相場計算", desc: "結婚式のご祝儀・プレゼント相場を関係性別に計算。" },
    ],
  },
  en: {
    presetTitle: "Quick Presets",
    tabs: { basic: "Basic", reverse: "Reverse", ceiling: "Ceiling Cost", multi: "Multi-Char" },
    // BasicTab
    rate: "Drop Rate (%)",
    rolls: "Number of Rolls",
    hitProb: (n: number) => `Chance to hit at least once in ${n} rolls`,
    expected: "Expected value (avg rolls to hit)",
    exactProb: (n: number) => `Chance to hit exactly on roll ${n}`,
    swamp: "🔥 Bad Luck Detected",
    swampDesc: (pct: string) => `You are in the top ${pct}% unlucky`,
    swampTimes: (expected: number, times: number) => `You've pulled ${times}x the expected value of ${expected} rolls`,
    chartTitle: "Cumulative Probability Chart",
    chartMax: (n: number) => `* Up to ${n} rolls shown`,
    trialCount: (n: number) => `${n}x`,
    tableTrials: "Rolls",
    tableHit: "Hit Chance",
    tableMiss: "Miss Chance",
    disclaimer: "⚠️ Each pull is independent. Previous results do not affect future pulls.",
    // ReverseTab
    targetProb: "Target Probability (%)",
    requiredRolls: (pct: string) => `Rolls needed for ${pct}% chance to hit`,
    // CeilingTab
    ceilingRolls: "Ceiling (# of Rolls)",
    stonesPerRoll: "Gems per Roll",
    stonePriceYen: "Gem Price (¥ each)",
    ceilingCostLabel: "⚠️ Ceiling Cost",
    ceilingCostUnit: "¥",
    ceilingCostSub: (stones: string, n: string) => `${stones} gems / ${n} rolls`,
    expectedRolls: "Expected Rolls",
    halfCeilingProb: (n: number) => `Chance at half ceiling (${n} rolls)`,
    expectedCostTitle: "Expected Cost Estimates",
    cost50: "Cost for 50% chance",
    cost80: "Cost for 80% chance",
    cost90: "Cost for 90% chance",
    // MultiTab
    multiNote: "Calculate odds for pulling both A and B (independent banners assumed)",
    rateA: "Character A Drop Rate (%)",
    rateB: "Character B Drop Rate (%)",
    commonRolls: "Rolls (shared)",
    probA: "Chance to hit A",
    probB: "Chance to hit B",
    probBoth: "Chance to hit both",
    bothProb: (n: number) => `Chance to hit both A and B in ${n} rolls each`,
    both90Title: "Rolls needed for 90% on both?",
    both90: (a: number, b: number, total: number) => `A: ${a} rolls / B: ${b} rolls / Total: ${total} rolls`,
    // Guide
    guideTitle: "How to Use",
    guide: [
      { step: "1", title: "Choose a Preset", desc: "Select a common gacha setting like SSR 3% or Pickup 0.6%, or type in a custom drop rate." },
      { step: "2", title: "Check Basic Odds", desc: "Enter rolls and drop rate to see cumulative probability, expected value, and a bad-luck warning." },
      { step: "3", title: "Reverse Calculate", desc: "Enter your target probability (e.g. 90%) to find the number of rolls needed." },
      { step: "4", title: "Estimate Ceiling Cost", desc: "Input ceiling count and gem price to see the maximum spending required." },
    ],
    // FAQ
    faqTitle: "FAQ",
    faq: [
      {
        q: "What does a 3% drop rate mean? How many rolls to hit?",
        a: "A 3% rate means each pull has a 3% chance of success. The expected value is about 34 rolls. However, after 34 pulls you only have ~64% cumulative chance; 90% requires about 76 rolls.",
      },
      {
        q: "What is a ceiling and how is the cost calculated?",
        a: "A ceiling guarantees a character after a fixed number of pulls (e.g. 300). Ceiling cost = ceiling count × gems per roll × gem price (¥). Use the Ceiling Cost tab for automatic calculation.",
      },
      {
        q: "Does losing last time make the next pull more likely to hit?",
        a: "No. Standard gacha pulls are independent events — previous results have no effect on future pulls. This misconception is known as the Gambler's Fallacy.",
      },
      {
        q: "How do I calculate the odds of pulling multiple characters?",
        a: "Use the Multi-Char tab. The chance of hitting both A and B = P(A) × P(B). For example, two 3% characters pulled 100 times each gives roughly a 41% chance of getting both.",
      },
    ],
    // Related
    relatedTitle: "Related Tools",
    relatedLinks: [
      { href: "/gacha-cost-ceiling", title: "Gacha Ceiling Cost Calculator", desc: "Detailed simulation of total spending to reach the ceiling." },
      { href: "/goshugi-souba", title: "Wedding Gift Calculator", desc: "Calculate appropriate gift amounts by relationship type." },
    ],
  },
} as const;

const PRESETS: Preset[] = [
  { label: "SSR 3%", labelEn: "SSR 3%", rate: "3", ceiling: "100", emoji: "⭐", color: "#f59e0b" },
  { label: "ピックアップ 0.6%", labelEn: "Pickup 0.6%", rate: "0.6", ceiling: "300", emoji: "💎", color: "#a78bfa" },
  { label: "SR 12%", labelEn: "SR 12%", rate: "12", ceiling: "100", emoji: "🔵", color: "#38bdf8" },
  { label: "天井300回", labelEn: "Ceiling 300", rate: "0.6", ceiling: "300", emoji: "🏆", color: "#f43f5e" },
];

const PROB_TABLE_ROWS = [10, 50, 100, 150, 200, 300];

const NEON_PURPLE = "#a78bfa";
const NEON_CYAN = "#22d3ee";
const NEON_PINK = "#f472b6";
const NEON_YELLOW = "#fbbf24";

// ---- sub components ----

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
      className="number-input w-full px-3 py-2 rounded-xl text-sm font-mono neon-focus transition-all"
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
    <div className="glass-card rounded-xl p-4 text-center" style={{ borderColor: `${color ?? NEON_PURPLE}44` }}>
      <div
        className="text-4xl font-black tracking-tight font-mono"
        style={{ color: color ?? NEON_PURPLE, textShadow: `0 0 20px ${color ?? NEON_PURPLE}88` }}
      >
        {value}
      </div>
      <div className="text-xs text-violet-200 mt-1">{label}</div>
    </div>
  );
}

// Bar chart with CSS only
function CumulativeChart({ rate, lang }: { rate: number; lang: Lang }) {
  const t = T[lang];
  const steps = [1, 5, 10, 20, 30, 50, 80, 100, 150, 200, 300];
  const maxN = steps[steps.length - 1];
  const data = steps.map((n) => ({ n, prob: calcCumulative(rate, n) }));

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="text-xs font-semibold mb-3 text-cyan-300">{t.chartTitle}</div>
      <div className="space-y-1">
        {data.map(({ n, prob }) => {
          const pct = prob * 100;
          const barColor =
            pct >= 90 ? NEON_PINK : pct >= 50 ? NEON_PURPLE : NEON_CYAN;
          return (
            <div key={n} className="flex items-center gap-2">
              <div className="text-right text-xs text-violet-200 w-8 shrink-0">{t.trialCount(n)}</div>
              <div className="flex-1 rounded-full overflow-hidden" style={{ background: "rgba(45,32,64,0.6)", height: "10px" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(1, pct)}%`,
                    background: barColor,
                    boxShadow: `0 0 6px ${barColor}88`,
                  }}
                />
              </div>
              <div className="text-right text-xs w-12 shrink-0 font-mono" style={{ color: barColor }}>
                {pct.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-xs text-violet-200 mt-2">{t.chartMax(maxN)}</div>
    </div>
  );
}

function ProbTable({ rate, lang }: { rate: number; lang: Lang }) {
  const t = T[lang];
  return (
    <div className="rounded-xl overflow-hidden glass-card">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "rgba(45,32,64,0.8)" }}>
            <th className="py-2 px-3 text-left text-xs font-semibold text-violet-200 uppercase tracking-wider">{t.tableTrials}</th>
            <th className="py-2 px-3 text-right text-xs font-semibold text-violet-200 uppercase tracking-wider">{t.tableHit}</th>
            <th className="py-2 px-3 text-right text-xs font-semibold text-violet-200 uppercase tracking-wider">{t.tableMiss}</th>
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
                className="table-row-stripe"
                style={{ background: i % 2 === 0 ? "rgba(26,22,48,0.6)" : "rgba(30,27,46,0.6)" }}
              >
                <td className="py-2 px-3 text-violet-100">{t.trialCount(n)}</td>
                <td className="py-2 px-3 text-right font-bold font-mono" style={{ color }}>
                  {pct.toFixed(2)}%
                </td>
                <td className="py-2 px-3 text-right text-violet-200 text-xs font-mono">
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

function BasicTab({ lang }: { lang: Lang }) {
  const t = T[lang];
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
    <div className="space-y-4 tab-panel">
      <div className="glass-card rounded-2xl p-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.rate}</label>
            <NeonInput value={rate} onChange={setRate} placeholder="3" min="0.001" max="100" step="0.1" />
          </div>
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.rolls}</label>
            <NeonInput value={rolls} onChange={setRolls} placeholder="10" min="1" step="1" />
          </div>
        </div>
      </div>

      {isValid && prob !== null && expected !== null && (
        <>
          <BigResult
            value={`${(prob * 100).toFixed(2)}%`}
            label={t.hitProb(rollsNum)}
            color={prob >= 0.9 ? NEON_PINK : prob >= 0.5 ? NEON_PURPLE : NEON_CYAN}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-xl p-3 text-center">
              <div className="text-2xl font-bold font-mono" style={{ color: NEON_YELLOW }}>{expected}{lang === "ja" ? "回" : "x"}</div>
              <div className="text-xs text-violet-200 mt-1">{t.expected}</div>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <div className="text-2xl font-bold font-mono" style={{ color: NEON_CYAN }}>
                {(rateNum * (1 - rateNum) ** (rollsNum - 1) * 100).toFixed(3)}%
              </div>
              <div className="text-xs text-violet-200 mt-1">{t.exactProb(rollsNum)}</div>
            </div>
          </div>

          {swamp && (
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(26,10,10,0.8)", border: "1px solid #ef4444" }}>
              <div className="text-lg font-black" style={{ color: "#ef4444" }}>{t.swamp}</div>
              <div className="text-xs text-violet-200 mt-1">
                {t.swampDesc((100 - parseFloat(swampPct!)).toFixed(1))}
              </div>
              <div className="text-xs text-violet-200 mt-1">
                {t.swampTimes(expected, Math.floor(rollsNum / expected))}
              </div>
            </div>
          )}

          <CumulativeChart rate={rateNum} lang={lang} />
          <ProbTable rate={rateNum} lang={lang} />
        </>
      )}

      <div className="glass-card rounded-xl px-4 py-2.5 text-xs text-violet-200">
        {t.disclaimer}
      </div>
    </div>
  );
}

function ReverseTab({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [rate, setRate] = useState("3");
  const [targetProb, setTargetProb] = useState("90");

  const rateNum = parseFloat(rate) / 100;
  const targetProbNum = parseFloat(targetProb) / 100;

  const isValid =
    !isNaN(rateNum) && rateNum > 0 && rateNum <= 1 &&
    !isNaN(targetProbNum) && targetProbNum > 0 && targetProbNum < 1;

  const required = isValid ? calcRequiredRolls(rateNum, targetProbNum) : null;

  return (
    <div className="space-y-4 tab-panel">
      <div className="glass-card rounded-2xl p-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.rate}</label>
            <NeonInput value={rate} onChange={setRate} placeholder="3" min="0.001" max="100" step="0.1" />
          </div>
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.targetProb}</label>
            <NeonInput value={targetProb} onChange={setTargetProb} placeholder="90" min="1" max="99.9" step="1" />
          </div>
        </div>
      </div>

      {isValid && required !== null && (
        <>
          <BigResult
            value={`${required}${lang === "ja" ? "回" : "x"}`}
            label={t.requiredRolls(targetProb)}
            color={NEON_CYAN}
          />

          <div className="glass-card rounded-2xl p-4">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {[50, 80, 90, 95, 99].map((pct) => {
                const n = calcRequiredRolls(rateNum, pct / 100);
                const isTarget = Math.abs(pct - parseFloat(targetProb)) < 0.1;
                return (
                  <button
                    key={pct}
                    className={`rounded-xl p-2 text-center transition-all method-btn ${isTarget ? "method-btn-active" : ""}`}
                    style={{ border: `1px solid ${isTarget ? NEON_PURPLE : "rgba(255,255,255,0.08)"}` }}
                    onClick={() => setTargetProb(String(pct))}
                  >
                    <div className="text-sm font-bold" style={{ color: isTarget ? NEON_PURPLE : "#94a3b8" }}>
                      {pct}%
                    </div>
                    <div className="text-xs text-violet-200 font-mono">{n}{lang === "ja" ? "回" : "x"}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="glass-card rounded-xl px-4 py-2.5 text-xs text-violet-200">
        {t.disclaimer}
      </div>
    </div>
  );
}

function CeilingTab({ lang }: { lang: Lang }) {
  const t = T[lang];
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
    <div className="space-y-4 tab-panel">
      <div className="glass-card rounded-2xl p-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.rate}</label>
            <NeonInput value={rate} onChange={setRate} placeholder="0.6" min="0.001" max="100" step="0.1" />
          </div>
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.ceilingRolls}</label>
            <NeonInput value={ceilingRolls} onChange={setCeilingRolls} placeholder="300" min="1" step="1" />
          </div>
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.stonesPerRoll}</label>
            <NeonInput value={stonesPerRoll} onChange={setStonesPerRoll} placeholder="150" min="1" step="1" />
          </div>
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.stonePriceYen}</label>
            <NeonInput value={stonePriceYen} onChange={setStonePriceYen} placeholder="5" min="0" step="0.1" />
          </div>
        </div>
      </div>

      {isValid && totalStones !== null && totalCost !== null && expected !== null && prob50 !== null && (
        <>
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: "rgba(26,10,10,0.8)", border: "1px solid #ef4444" }}
          >
            <div className="text-xs font-semibold mb-1" style={{ color: "#ef4444" }}>
              {t.ceilingCostLabel}
            </div>
            <div
              className="text-4xl font-black font-mono"
              style={{ color: "#ef4444", textShadow: "0 0 20px #ef444488" }}
            >
              {lang === "en" ? "¥" : ""}{totalCost.toLocaleString()}{lang === "ja" ? t.ceilingCostUnit : ""}
            </div>
            <div className="text-xs text-violet-200 mt-1">
              {t.ceilingCostSub(totalStones.toLocaleString(), ceilingNum.toString())}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-xl p-3 text-center">
              <div className="text-2xl font-bold font-mono" style={{ color: NEON_YELLOW }}>{expected}{lang === "ja" ? "回" : "x"}</div>
              <div className="text-xs text-violet-200 mt-1">{t.expectedRolls}</div>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <div className="text-2xl font-bold font-mono" style={{ color: NEON_CYAN }}>
                {(prob50 * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-violet-200 mt-1">{t.halfCeilingProb(Math.floor(ceilingNum / 2))}</div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="text-xs font-semibold mb-3 text-violet-100 uppercase tracking-wider">{t.expectedCostTitle}</div>
            {[
              { label: t.cost50, n: calcRequiredRolls(rateNum, 0.5) },
              { label: t.cost80, n: calcRequiredRolls(rateNum, 0.8) },
              { label: t.cost90, n: calcRequiredRolls(rateNum, 0.9) },
            ].map(({ label, n }) => {
              const cost = Math.min(n, ceilingNum) * stonesNum * priceNum;
              return (
                <div key={label} className="flex justify-between items-center py-1.5 text-sm border-b border-white/5 last:border-0">
                  <span className="text-violet-200 text-xs">{label}</span>
                  <span style={{ color: NEON_YELLOW }} className="font-bold font-mono">
                    {lang === "en" ? "¥" : ""}{Math.ceil(cost).toLocaleString()}{lang === "ja" ? "円" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="glass-card rounded-xl px-4 py-2.5 text-xs text-violet-200">
        {t.disclaimer}
      </div>
    </div>
  );
}

function MultiTab({ lang }: { lang: Lang }) {
  const t = T[lang];
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
    <div className="space-y-4 tab-panel">
      <div className="glass-card rounded-2xl p-5">
        <div className="glass-card rounded-xl px-4 py-2.5 text-xs text-violet-100 mb-4">
          {t.multiNote}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.rateA}</label>
            <NeonInput value={rateA} onChange={setRateA} placeholder="3" min="0.001" max="100" step="0.1" />
          </div>
          <div>
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.rateB}</label>
            <NeonInput value={rateB} onChange={setRateB} placeholder="3" min="0.001" max="100" step="0.1" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.commonRolls}</label>
          <NeonInput value={rolls} onChange={setRolls} placeholder="100" min="1" step="1" />
        </div>
      </div>

      {isValid && probA !== null && probB !== null && probBoth !== null && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="glass-card rounded-xl p-3 text-center">
              <div className="text-xl font-bold font-mono" style={{ color: NEON_CYAN }}>
                {(probA * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-violet-200 mt-1">{t.probA}</div>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <div className="text-xl font-bold font-mono" style={{ color: NEON_PINK }}>
                {(probB * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-violet-200 mt-1">{t.probB}</div>
            </div>
            <div className="glass-card-bright rounded-xl p-3 text-center" style={{ border: `1px solid ${NEON_PURPLE}44` }}>
              <div className="text-xl font-bold font-mono" style={{ color: NEON_PURPLE }}>
                {(probBoth * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-violet-200 mt-1">{t.probBoth}</div>
            </div>
          </div>

          <BigResult
            value={`${(probBoth * 100).toFixed(2)}%`}
            label={t.bothProb(rollsNum)}
            color={NEON_PURPLE}
          />

          <div className="glass-card rounded-xl p-4">
            <div className="text-xs font-semibold mb-2 text-violet-100 uppercase tracking-wider">{t.both90Title}</div>
            <div className="text-sm text-violet-100 font-mono">
              {t.both90(
                calcRequiredRolls(rateANum, 0.9),
                calcRequiredRolls(rateBNum, 0.9),
                calcRequiredRolls(rateANum, 0.9) + calcRequiredRolls(rateBNum, 0.9)
              )}
            </div>
          </div>
        </>
      )}

      <div className="glass-card rounded-xl px-4 py-2.5 text-xs text-violet-200">
        {t.disclaimer}
      </div>
    </div>
  );
}

// ---- main ----

export default function GachaProbability() {
  const [tab, setTab] = useState<Tab>("basic");
  const [lang, setLang] = useState<Lang>("ja");
  const [rate, setRate] = useState("3");
  const [ceilingRolls, setCeilingRolls] = useState("300");

  const t = T[lang];

  const applyPreset = useCallback((preset: Preset) => {
    setRate(preset.rate);
    setCeilingRolls(preset.ceiling);
    setTab("basic");
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: "basic", label: t.tabs.basic },
    { id: "reverse", label: t.tabs.reverse },
    { id: "ceiling", label: t.tabs.ceiling },
    { id: "multi", label: t.tabs.multi },
  ];

  // suppress unused warning — rate/ceilingRolls are set via applyPreset
  void rate; void ceilingRolls;

  return (
    <div className="space-y-4">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1); }
          50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.2); }
        }
        @keyframes float-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes border-spin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .glass-card-bright {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .neon-focus:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(167,139,250,0.6), 0 0 20px rgba(167,139,250,0.2);
        }
        .glow-text {
          text-shadow: 0 0 30px rgba(196,181,253,0.6);
        }
        .tab-active-glow {
          box-shadow: 0 0 16px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .tab-panel {
          animation: float-in 0.25s ease-out;
        }
        .method-btn:hover {
          box-shadow: 0 0 16px rgba(167,139,250,0.2);
        }
        .method-btn-active {
          box-shadow: 0 0 20px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
          background: rgba(139,92,246,0.2);
          border-color: rgba(167,139,250,0.6) !important;
        }
        .number-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2d9f3;
        }
        .number-input::placeholder { color: rgba(196,181,253,0.4); }
        .number-input::-webkit-inner-spin-button,
        .number-input::-webkit-outer-spin-button { opacity: 0.3; }
        .gradient-border-box {
          position: relative;
        }
        .gradient-border-box::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(139,92,246,0.6), rgba(6,182,212,0.4), rgba(139,92,246,0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .table-row-stripe:hover {
          background: rgba(139,92,246,0.08) !important;
          transition: background 0.2s ease;
        }
      `}</style>

      {/* Language toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* プリセット */}
      <div className="glass-card rounded-2xl p-4">
        <div className="text-xs font-semibold mb-3 text-violet-100 uppercase tracking-wider">{t.presetTitle}</div>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all active:scale-95 method-btn"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${preset.color}44`,
                color: preset.color,
              }}
            >
              <span className="mr-1">{preset.emoji}</span>
              {lang === "ja" ? preset.label : preset.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* タブ */}
      <div className="glass-card rounded-2xl p-1.5 flex gap-1">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              tab === tabItem.id
                ? "bg-violet-600 text-white tab-active-glow"
                : "text-violet-200 hover:text-violet-100 hover:bg-white/5"
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      <div>
        {tab === "basic" && <BasicTab lang={lang} />}
        {tab === "reverse" && <ReverseTab lang={lang} />}
        {tab === "ceiling" && <CeilingTab lang={lang} />}
        {tab === "multi" && <MultiTab lang={lang} />}
      </div>

      {/* ===== 使い方ガイド ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.guideTitle}</h2>
        <ol className="space-y-3.5">
          {t.guide.map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-violet-500/20 text-violet-200 text-sm font-bold flex items-center justify-center border border-violet-500/30">{item.step}</span>
              <div>
                <div className="font-medium text-white text-sm">{item.title}</div>
                <div className="text-xs text-violet-200 mt-0.5">{item.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ===== FAQ ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.faqTitle}</h2>
        <div className="space-y-4">
          {t.faq.map((item, i) => (
            <div key={i} className="border-b border-white/6 pb-4 last:border-0 last:pb-0">
              <div className="font-bold text-white text-sm mb-1.5">{item.q}</div>
              <div className="text-sm text-violet-100 leading-relaxed">{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== JSON-LD FAQPage ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "ガチャの排出率 3% とは？何回で当たる？",
                "acceptedAnswer": { "@type": "Answer", "text": "排出率 3% は 1 回引くたびに 3% の確率。期待値は約 34 回。90% に達するには約 76 回必要です。" },
              },
              {
                "@type": "Question",
                "name": "天井とは？天井コストの計算方法は？",
                "acceptedAnswer": { "@type": "Answer", "text": "天井は指定回数引くと必ず当たる保証システム。天井コスト = 天井回数 × 1回あたりの石数 × 石の単価で計算できます。" },
              },
              {
                "@type": "Question",
                "name": "前回外れたから次は当たりやすい？",
                "acceptedAnswer": { "@type": "Answer", "text": "いいえ。ガチャは独立試行のため前回の結果は次回に影響しません。毎回同じ確率でリセットされます。" },
              },
              {
                "@type": "Question",
                "name": "複数キャラを同時に狙う場合の確率は？",
                "acceptedAnswer": { "@type": "Answer", "text": "AとB両方引く確率 = Aが当たる確率 × Bが当たる確率。「複数キャラ」タブで計算できます。" },
              },
            ],
          }),
        }}
      />

      {/* ===== 関連ツール ===== */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {t.relatedLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block p-4 rounded-xl border border-white/8 hover:border-violet-500/40 transition-all duration-200 group"
              style={{ background: "rgba(139,92,246,0)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0)"; }}
            >
              <div className="font-medium text-white text-sm group-hover:text-violet-100 transition-colors">{link.title}</div>
              <div className="text-xs text-violet-100 mt-1">{link.desc}</div>
            </a>
          ))}
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ガチャ確率 計算",
  "description": "ソシャゲのガチャ排出率と試行回数から、目当てのキャラ・装備を引ける確率を計算",
  "url": "https://tools.loresync.dev/gacha-probability",
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
