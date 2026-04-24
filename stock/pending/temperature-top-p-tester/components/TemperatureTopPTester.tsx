"use client";

import { useState, useMemo } from "react";

// --- Types ---
interface TokenProb {
  token: string;
  logit: number;
}

// --- Seeded RNG for reproducible "sampling" ---
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// --- Softmax with temperature ---
function softmax(logits: number[], temperature: number): number[] {
  const t = Math.max(temperature, 0.01);
  const scaled = logits.map((l) => l / t);
  const maxS = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - maxS));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

// --- Top-p filtering ---
function applyTopP(probs: number[], topP: number): number[] {
  const indexed = probs.map((p, i) => ({ p, i })).sort((a, b) => b.p - a.p);
  let cumsum = 0;
  const kept = new Set<number>();
  for (const { p, i } of indexed) {
    cumsum += p;
    kept.add(i);
    if (cumsum >= topP) break;
  }
  const filtered = probs.map((p, i) => (kept.has(i) ? p : 0));
  const sum = filtered.reduce((a, b) => a + b, 0);
  return filtered.map((p) => p / sum);
}

// --- Sample from distribution ---
function sample(probs: number[], rng: () => number): number {
  const r = rng();
  let cumsum = 0;
  for (let i = 0; i < probs.length; i++) {
    cumsum += probs[i];
    if (r < cumsum) return i;
  }
  return probs.length - 1;
}

// --- Token sets for different scenarios ---
const SCENARIOS = [
  {
    name: "次の単語: 「The sky is _」",
    tokens: [
      { token: "blue", logit: 4.5 },
      { token: "clear", logit: 3.8 },
      { token: "beautiful", logit: 3.2 },
      { token: "dark", logit: 2.1 },
      { token: "falling", logit: 1.0 },
      { token: "red", logit: 0.5 },
      { token: "quantum", logit: -1.0 },
      { token: "pizza", logit: -3.0 },
    ],
  },
  {
    name: "感情分類: 「最高の映画！」",
    tokens: [
      { token: "Positive", logit: 5.0 },
      { token: "Neutral", logit: 1.5 },
      { token: "Negative", logit: -2.0 },
    ],
  },
  {
    name: "コード補完: 「console.」",
    tokens: [
      { token: "log", logit: 5.2 },
      { token: "error", logit: 4.0 },
      { token: "warn", logit: 3.5 },
      { token: "info", logit: 3.0 },
      { token: "debug", logit: 2.5 },
      { token: "table", logit: 1.5 },
      { token: "time", logit: 1.0 },
      { token: "assert", logit: 0.2 },
    ],
  },
];

const COLORS = [
  "bg-blue-500", "bg-teal-500", "bg-green-500", "bg-yellow-500",
  "bg-orange-500", "bg-red-500", "bg-purple-500", "bg-pink-500",
];

function formatPct(p: number): string {
  return (p * 100).toFixed(1) + "%";
}

export default function TemperatureTopPTester() {
  const [temperature, setTemperature] = useState(1.0);
  const [topP, setTopP] = useState(1.0);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [samples, setSamples] = useState<string[]>([]);
  const [sampleSeed, setSampleSeed] = useState(42);

  const scenario = SCENARIOS[scenarioIdx];

  const probs = useMemo(() => {
    const logits = scenario.tokens.map((t) => t.logit);
    const afterTemp = softmax(logits, temperature);
    return applyTopP(afterTemp, topP);
  }, [scenario, temperature, topP]);

  const rawProbs = useMemo(() => {
    const logits = scenario.tokens.map((t) => t.logit);
    return softmax(logits, 1.0);
  }, [scenario]);

  const runSamples = () => {
    const rng = seededRng(sampleSeed + samples.length);
    const newSamples: string[] = [];
    for (let i = 0; i < 10; i++) {
      const idx = sample(probs, rng);
      newSamples.push(scenario.tokens[idx]?.token ?? "?");
    }
    setSamples((prev) => [...newSamples, ...prev].slice(0, 50));
    setSampleSeed((s) => s + 1);
  };

  const entropy = -probs.reduce((acc, p) => acc + (p > 0 ? p * Math.log2(p) : 0), 0);
  const maxEntropy = Math.log2(probs.filter((p) => p > 0).length);

  return (
    <div className="space-y-6">
      {/* Scenario selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="text-sm font-semibold text-gray-700 mb-2">シナリオを選択</div>
        <div className="flex flex-col sm:flex-row gap-2">
          {SCENARIOS.map((s, i) => (
            <button
              key={i}
              onClick={() => { setScenarioIdx(i); setSamples([]); }}
              className={`flex-1 py-2 px-3 text-xs rounded-xl font-medium border transition-colors ${
                scenarioIdx === i
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Temperature */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-semibold text-gray-700">Temperature</label>
            <span className="text-lg font-bold text-indigo-600">{temperature.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="2.5"
            step="0.01"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 (決定的)</span>
            <span>1.0 (標準)</span>
            <span>2.5 (ランダム)</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 bg-indigo-50 rounded-lg p-2">
            {temperature < 0.5
              ? "低: 最も確率の高いトークンが強調されます。出力が予測しやすくなります。"
              : temperature > 1.5
              ? "高: 分布が平坦化され、多様で予測不能な出力になります。"
              : "中: バランスの取れた多様性と一貫性。"}
          </div>
        </div>

        {/* Top-p */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-semibold text-gray-700">Top-p (Nucleus)</label>
            <span className="text-lg font-bold text-purple-600">{topP.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="1.0"
            step="0.01"
            value={topP}
            onChange={(e) => setTopP(parseFloat(e.target.value))}
            className="w-full accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0.01 (絞る)</span>
            <span>0.9 (推奨)</span>
            <span>1.0 (全部)</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 bg-purple-50 rounded-lg p-2">
            {topP < 0.5
              ? "狭: 累積確率が上位のトークンのみに絞り込みます。"
              : topP > 0.95
              ? "広: ほぼ全トークンが候補に残ります。"
              : "中: 上位トークンに適度に絞った選択。"}
          </div>
        </div>
      </div>

      {/* Distribution chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">確率分布</h2>
          <div className="flex gap-3 text-xs text-gray-500">
            <span>エントロピー: <strong className="text-indigo-600">{entropy.toFixed(2)} bits</strong></span>
            <span>最大: <strong>{maxEntropy.toFixed(2)} bits</strong></span>
          </div>
        </div>
        <div className="space-y-2">
          {scenario.tokens.map((t, i) => {
            const p = probs[i];
            const rawP = rawProbs[i];
            const isFiltered = p === 0 && rawP > 0;
            return (
              <div key={t.token} className={`transition-opacity ${isFiltered ? "opacity-30" : ""}`}>
                <div className="flex items-center justify-between text-sm mb-0.5">
                  <span className={`font-mono font-medium ${isFiltered ? "text-gray-400" : "text-gray-800"}`}>
                    {t.token}
                    {isFiltered && <span className="ml-1 text-xs">(top-p excluded)</span>}
                  </span>
                  <div className="flex gap-3 text-xs">
                    <span className="text-gray-400">raw: {formatPct(rawP)}</span>
                    <span className={`font-bold ${isFiltered ? "text-gray-400" : "text-indigo-600"}`}>
                      {formatPct(p)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-5 relative">
                  {/* Raw prob (ghost) */}
                  <div
                    className="absolute top-0 left-0 h-5 rounded-full bg-gray-200"
                    style={{ width: `${rawP * 100}%` }}
                  />
                  {/* Adjusted prob */}
                  <div
                    className={`absolute top-0 left-0 h-5 rounded-full transition-all duration-300 ${isFiltered ? "bg-gray-300" : COLORS[i % COLORS.length]}`}
                    style={{ width: `${p * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">薄いバーが temperature=1.0 の生の確率、色付きバーがパラメータ適用後の確率です。</p>
      </div>

      {/* Sampling */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">サンプリングシミュレーション</h2>
          <button
            onClick={runSamples}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            10回サンプル
          </button>
        </div>
        {samples.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              {samples.map((s, i) => {
                const idx = scenario.tokens.findIndex((t) => t.token === s);
                return (
                  <span
                    key={i}
                    className={`px-3 py-1 rounded-full text-white text-sm font-mono ${COLORS[idx % COLORS.length]}`}
                  >
                    {s}
                  </span>
                );
              })}
            </div>
            {/* Frequency count */}
            <div className="border-t pt-3">
              <div className="text-xs text-gray-500 mb-2">頻度カウント ({samples.length}回)</div>
              {scenario.tokens.map((t) => {
                const count = samples.filter((s) => s === t.token).length;
                const freq = samples.length > 0 ? count / samples.length : 0;
                return count > 0 ? (
                  <div key={t.token} className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs w-20 text-gray-700">{t.token}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-indigo-400 transition-all"
                        style={{ width: `${freq * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-14 text-right">{count}回 ({formatPct(freq)})</span>
                  </div>
                ) : null;
              })}
            </div>
            <button
              onClick={() => setSamples([])}
              className="mt-2 text-xs text-gray-400 hover:text-gray-600"
            >
              リセット
            </button>
          </>
        ) : (
          <p className="text-sm text-gray-400">「10回サンプル」を押すと、現在の設定で実際のサンプリングをシミュレートします。</p>
        )}
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このTemperature / Top-p 比較実験ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">LLMパラメータのTemperatureとTop-pの効果をビジュアルで理解。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このTemperature / Top-p 比較実験ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "LLMパラメータのTemperatureとTop-pの効果をビジュアルで理解。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
