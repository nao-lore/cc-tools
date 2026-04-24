"use client";

import { useState, useMemo } from "react";

// ---- Math helpers ----

function parseData(raw: string): number[] {
  return raw
    .split(/[\s,、]+/)
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map(Number)
    .filter((n) => !isNaN(n));
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function pearson(x: number[], y: number[]): number {
  const mx = mean(x);
  const my = mean(y);
  let num = 0;
  let dx2 = 0;
  let dy2 = 0;
  for (let i = 0; i < x.length; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom === 0 ? 0 : num / denom;
}

function rank(arr: number[]): number[] {
  const sorted = [...arr].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const ranks = new Array(arr.length);
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j < sorted.length && sorted[j].v === sorted[i].v) j++;
    const avgRank = (i + j - 1) / 2 + 1;
    for (let k = i; k < j; k++) ranks[sorted[k].i] = avgRank;
    i = j;
  }
  return ranks;
}

function spearman(x: number[], y: number[]): number {
  return pearson(rank(x), rank(y));
}

function kendall(x: number[], y: number[]): number {
  const n = x.length;
  let concordant = 0;
  let discordant = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const sx = Math.sign(x[j] - x[i]);
      const sy = Math.sign(y[j] - y[i]);
      const prod = sx * sy;
      if (prod > 0) concordant++;
      else if (prod < 0) discordant++;
    }
  }
  const denom = (n * (n - 1)) / 2;
  return denom === 0 ? 0 : (concordant - discordant) / denom;
}

// p-value approximation using t-distribution (two-tailed)
// t = r * sqrt((n-2)/(1-r^2)), df = n-2
// approximation via normal dist for large n, beta for small
function tDist_pval(t: number, df: number): number {
  // Use regularized incomplete beta function approximation
  const x = df / (df + t * t);
  // Approximation of I_x(df/2, 0.5) via continued fraction
  // For simplicity use a numerical integration approximation
  const abst = Math.abs(t);
  if (df <= 0) return 1;
  // Cornish-Fisher approximation for large df
  if (df >= 30) {
    // Use normal approx
    const z = abst * Math.sqrt(1 - 0.25 / df);
    return 2 * (1 - normalCDF(z));
  }
  // Use beta regularized incomplete function via continued fraction
  const ibeta = betaIncomplete(x, df / 2, 0.5);
  return Math.min(ibeta, 1);
}

function normalCDF(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = z < 0 ? -1 : 1;
  const absz = Math.abs(z);
  const t = 1 / (1 + p * absz);
  const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  return 0.5 * (1 + sign * (1 - poly * Math.exp(-absz * absz)));
}

function lnGamma(x: number): number {
  const c = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (const ci of c) ser += ci / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

function betaIncomplete(x: number, a: number, b: number): number {
  if (x < 0 || x > 1) return 0;
  if (x === 0) return 0;
  if (x === 1) return 1;
  const lbeta = lnGamma(a) + lnGamma(b) - lnGamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) / a;
  // Continued fraction
  const MAXIT = 100;
  const EPS = 3e-7;
  let qab = a + b;
  let qap = a + 1;
  let qam = a - 1;
  let c = 1;
  let d = 1 - qab * x / qap;
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return front * h;
}

function pvalFromR(r: number, n: number): number {
  if (n <= 2) return 1;
  const t = r * Math.sqrt((n - 2) / (1 - r * r + 1e-15));
  return tDist_pval(t, n - 2);
}

function strengthLabel(r: number): { label: string; color: string } {
  const abs = Math.abs(r);
  if (abs >= 0.7) return { label: "強い相関", color: "text-green-700" };
  if (abs >= 0.4) return { label: "中程度の相関", color: "text-blue-700" };
  if (abs >= 0.2) return { label: "弱い相関", color: "text-orange-600" };
  return { label: "相関なし", color: "text-gray-500" };
}

function formatR(r: number): string {
  return r.toFixed(4);
}

function formatP(p: number): string {
  if (p < 0.001) return "< 0.001";
  return p.toFixed(3);
}

// ---- Scatter plot ----

interface ScatterPlotProps {
  x: number[];
  y: number[];
}

function ScatterPlot({ x, y }: ScatterPlotProps) {
  const W = 200;
  const H = 200;
  const PAD = 20;

  const minX = Math.min(...x);
  const maxX = Math.max(...x);
  const minY = Math.min(...y);
  const maxY = Math.max(...y);

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const toSvgX = (v: number) => PAD + ((v - minX) / rangeX) * (W - 2 * PAD);
  const toSvgY = (v: number) => H - PAD - ((v - minY) / rangeY) * (H - 2 * PAD);

  // Regression line
  const mx = mean(x);
  const my = mean(y);
  let num = 0;
  let denom = 0;
  for (let i = 0; i < x.length; i++) {
    num += (x[i] - mx) * (y[i] - my);
    denom += (x[i] - mx) * (x[i] - mx);
  }
  const slope = denom === 0 ? 0 : num / denom;
  const intercept = my - slope * mx;

  const lineY1 = slope * minX + intercept;
  const lineY2 = slope * maxX + intercept;

  return (
    <svg
      width={W}
      height={H}
      className="border border-gray-200 rounded-lg bg-white"
      aria-label="散布図"
    >
      {/* Axes */}
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d1d5db" strokeWidth="1" />
      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#d1d5db" strokeWidth="1" />

      {/* Regression line */}
      <line
        x1={toSvgX(minX)}
        y1={toSvgY(lineY1)}
        x2={toSvgX(maxX)}
        y2={toSvgY(lineY2)}
        stroke="#3b82f6"
        strokeWidth="1.5"
        strokeDasharray="4,3"
        opacity="0.7"
      />

      {/* Points */}
      {x.map((xi, i) => (
        <circle
          key={i}
          cx={toSvgX(xi)}
          cy={toSvgY(y[i])}
          r="3"
          fill="#6366f1"
          opacity="0.7"
        />
      ))}
    </svg>
  );
}

// ---- Result card ----

interface CoefCardProps {
  method: string;
  symbol: string;
  value: number;
  pval: number;
  n: number;
}

function CoefCard({ method, symbol, value, pval, n }: CoefCardProps) {
  const { label, color } = strengthLabel(value);
  const sig = pval < 0.05;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500">{method}</p>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sig ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {sig ? "有意 p<0.05" : "非有意"}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {symbol} = <span className={value >= 0 ? "text-blue-700" : "text-red-600"}>{formatR(value)}</span>
      </p>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className={`font-medium ${color}`}>{label}</span>
        <span>p = {formatP(pval)}</span>
        <span>n = {n}</span>
      </div>
    </div>
  );
}

// ---- Main component ----

const SAMPLE_X = "12, 15, 18, 22, 25, 28, 30, 35, 40, 42";
const SAMPLE_Y = "20, 24, 30, 35, 38, 42, 45, 52, 60, 65";

export default function CorrelationCoef() {
  const [rawX, setRawX] = useState(SAMPLE_X);
  const [rawY, setRawY] = useState(SAMPLE_Y);

  const result = useMemo(() => {
    const x = parseData(rawX);
    const y = parseData(rawY);
    if (x.length < 3 || y.length < 3) return null;
    const n = Math.min(x.length, y.length);
    const xs = x.slice(0, n);
    const ys = y.slice(0, n);

    const pr = pearson(xs, ys);
    const sp = spearman(xs, ys);
    const kn = kendall(xs, ys);

    return {
      xs,
      ys,
      n,
      pearsonR: pr,
      pearsonP: pvalFromR(pr, n),
      spearmanRho: sp,
      spearmanP: pvalFromR(sp, n),
      kendallTau: kn,
      kendallP: pvalFromR(kn, n),
    };
  }, [rawX, rawY]);

  const xLen = parseData(rawX).length;
  const yLen = parseData(rawY).length;
  const mismatch = xLen > 0 && yLen > 0 && xLen !== yLen;

  return (
    <div className="space-y-5">
      {/* Input */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">データ入力</h2>
        <p className="text-xs text-gray-400">カンマ・スペース・改行で区切って入力してください</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              X データ <span className="text-gray-400">({xLen}件)</span>
            </label>
            <textarea
              value={rawX}
              onChange={(e) => setRawX(e.target.value)}
              rows={3}
              placeholder="例: 1, 2, 3, 4, 5"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Y データ <span className="text-gray-400">({yLen}件)</span>
            </label>
            <textarea
              value={rawY}
              onChange={(e) => setRawY(e.target.value)}
              rows={3}
              placeholder="例: 2, 4, 6, 8, 10"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono"
            />
          </div>
        </div>

        {mismatch && (
          <p className="text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2">
            データ数が異なります（X: {xLen}件, Y: {yLen}件）。短い方に合わせて計算します。
          </p>
        )}
      </div>

      {/* Results */}
      {result ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <CoefCard
              method="Pearson（ピアソン）"
              symbol="r"
              value={result.pearsonR}
              pval={result.pearsonP}
              n={result.n}
            />
            <CoefCard
              method="Spearman（スピアマン）"
              symbol="ρ"
              value={result.spearmanRho}
              pval={result.spearmanP}
              n={result.n}
            />
            <CoefCard
              method="Kendall（ケンドール）"
              symbol="τ"
              value={result.kendallTau}
              pval={result.kendallP}
              n={result.n}
            />
          </div>

          {/* Scatter plot */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">散布図（Pearson 回帰直線付き）</h3>
            <div className="flex justify-center">
              <ScatterPlot x={result.xs} y={result.ys} />
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 justify-center">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-indigo-500 opacity-70" /> データ点
              </span>
              <span className="flex items-center gap-1">
                <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,3" /></svg>
                回帰直線
              </span>
            </div>
          </div>

          {/* Formula reference */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-2 text-xs text-gray-600">
            <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">各手法の特徴</p>
            <p><span className="font-medium text-gray-700">Pearson:</span> 線形関係を前提。正規分布データに最適。</p>
            <p><span className="font-medium text-gray-700">Spearman:</span> 順位ベース。外れ値に強い。非線形でも有効。</p>
            <p><span className="font-medium text-gray-700">Kendall:</span> ペア比較ベース。小サンプルや順位データに有効。</p>
            <p className="text-gray-400 pt-1">p値はt分布近似。n ≥ 30 は正規近似を使用。</p>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center text-sm text-gray-400">
          X・Yそれぞれ3件以上のデータを入力してください
        </div>
      )}

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
        広告スペース
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この相関係数 計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">Pearson/Spearman/Kendallの3種、散布図付き。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この相関係数 計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "Pearson/Spearman/Kendallの3種、散布図付き。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "相関係数 計算",
  "description": "Pearson/Spearman/Kendallの3種、散布図付き",
  "url": "https://tools.loresync.dev/correlation-coef",
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
