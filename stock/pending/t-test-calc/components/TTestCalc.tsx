"use client";

import { useState, useMemo } from "react";

// ── Pure math helpers ────────────────────────────────────────────────────────

function parseNumbers(raw: string): number[] {
  return raw
    .split(/[\s,\n]+/)
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map(Number)
    .filter((n) => !isNaN(n));
}

function mean(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function sampleVariance(nums: number[], mu: number): number {
  if (nums.length < 2) return 0;
  return nums.reduce((acc, n) => acc + (n - mu) ** 2, 0) / (nums.length - 1);
}

function sampleSD(nums: number[], mu: number): number {
  return Math.sqrt(sampleVariance(nums, mu));
}

// Regularized incomplete beta function via continued fraction (Lentz's method)
// Used to compute the CDF of the t-distribution: p = I(df/(df+t²), df/2, 0.5)
function betaContinuedFraction(a: number, b: number, x: number): number {
  const MAXIT = 200;
  const EPS = 3e-7;
  const FPMIN = 1e-300;

  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    // even step
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    // odd step
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

function lnGamma(x: number): number {
  // Stirling series (Lanczos g=7)
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  }
  x -= 1;
  let a = c[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

// Regularized incomplete beta I_x(a,b)
function incBeta(a: number, b: number, x: number): number {
  if (x < 0 || x > 1) return NaN;
  if (x === 0) return 0;
  if (x === 1) return 1;

  const lbeta = lnGamma(a) + lnGamma(b) - lnGamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) / a;

  if (x < (a + 1) / (a + b + 2)) {
    return front * betaContinuedFraction(a, b, x);
  } else {
    return 1 - (Math.exp(Math.log(1 - x) * b + Math.log(x) * a - lbeta) / b) *
      betaContinuedFraction(b, a, 1 - x);
  }
}

// Two-tailed p-value from t-statistic and degrees of freedom
function tDistPValue(t: number, df: number): number {
  const x = df / (df + t * t);
  return incBeta(df / 2, 0.5, x);
}

// F-test for equal variances: returns p-value (two-tailed)
function fTestPValue(
  v1: number, n1: number,
  v2: number, n2: number,
): number {
  if (v1 === 0 && v2 === 0) return 1;
  const f = v1 / v2;
  const df1 = n1 - 1;
  const df2 = n2 - 1;
  // p = 2 * min(P(F <= f), P(F >= f))
  const x = df1 / (df1 + df2 * f);
  const p = incBeta(df1 / 2, df2 / 2, x);
  return 2 * Math.min(p, 1 - p);
}

// ── Result types ─────────────────────────────────────────────────────────────

interface GroupStats {
  n: number;
  mean: number;
  sd: number;
}

interface TTestResult {
  mode: "independent" | "paired";
  method: "student" | "welch" | "paired";
  groupA: GroupStats;
  groupB: GroupStats;
  tStat: number;
  df: number;
  pValue: number;
  cohensD: number;
  significant: boolean;
  fPValue: number | null; // only for independent
  equalVariance: boolean | null;
}

// ── Calculation logic ────────────────────────────────────────────────────────

function calcIndependent(a: number[], b: number[]): TTestResult {
  const nA = a.length;
  const nB = b.length;
  const mA = mean(a);
  const mB = mean(b);
  const sdA = sampleSD(a, mA);
  const sdB = sampleSD(b, mB);
  const vA = sampleVariance(a, mA);
  const vB = sampleVariance(b, mB);

  // F-test for equal variance
  // Use larger variance in numerator for stable F
  const [vNum, nNum, vDen, nDen] =
    vA >= vB ? [vA, nA, vB, nB] : [vB, nB, vA, nA];
  const fPValue = (vDen === 0) ? (vNum === 0 ? 1 : 0) : fTestPValue(vNum, nNum, vDen, nDen);
  const equalVariance = fPValue >= 0.05;

  let tStat: number;
  let df: number;
  let method: "student" | "welch";

  if (equalVariance) {
    // Student's t (pooled)
    method = "student";
    const sp2 = ((nA - 1) * vA + (nB - 1) * vB) / (nA + nB - 2);
    tStat = (mA - mB) / Math.sqrt(sp2 * (1 / nA + 1 / nB));
    df = nA + nB - 2;
  } else {
    // Welch's t
    method = "welch";
    const seA = vA / nA;
    const seB = vB / nB;
    tStat = (mA - mB) / Math.sqrt(seA + seB);
    // Welch–Satterthwaite df
    df = (seA + seB) ** 2 / (seA ** 2 / (nA - 1) + seB ** 2 / (nB - 1));
  }

  const pValue = tDistPValue(Math.abs(tStat), df);

  // Cohen's d (pooled SD)
  const sdPooled = Math.sqrt(((nA - 1) * vA + (nB - 1) * vB) / (nA + nB - 2));
  const cohensD = sdPooled === 0 ? 0 : Math.abs(mA - mB) / sdPooled;

  return {
    mode: "independent",
    method,
    groupA: { n: nA, mean: mA, sd: sdA },
    groupB: { n: nB, mean: mB, sd: sdB },
    tStat,
    df,
    pValue,
    cohensD,
    significant: pValue < 0.05,
    fPValue,
    equalVariance,
  };
}

function calcPaired(a: number[], b: number[]): TTestResult {
  const n = Math.min(a.length, b.length);
  const diff = Array.from({ length: n }, (_, i) => a[i] - b[i]);
  const mDiff = mean(diff);
  const sdDiff = sampleSD(diff, mDiff);
  const se = sdDiff / Math.sqrt(n);
  const tStat = mDiff / se;
  const df = n - 1;
  const pValue = tDistPValue(Math.abs(tStat), df);

  // Cohen's d for paired: d = mean(diff) / SD(diff)
  const cohensD = sdDiff === 0 ? 0 : Math.abs(mDiff) / sdDiff;

  const mA = mean(a.slice(0, n));
  const mB = mean(b.slice(0, n));
  const sdA = sampleSD(a.slice(0, n), mA);
  const sdB = sampleSD(b.slice(0, n), mB);

  return {
    mode: "paired",
    method: "paired",
    groupA: { n, mean: mA, sd: sdA },
    groupB: { n, mean: mB, sd: sdB },
    tStat,
    df,
    pValue,
    cohensD,
    significant: pValue < 0.05,
    fPValue: null,
    equalVariance: null,
  };
}

// ── UI helpers ───────────────────────────────────────────────────────────────

function fmt(n: number, digits = 4): string {
  return n.toLocaleString("ja-JP", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function fmtP(p: number): string {
  if (p < 0.0001) return "< 0.0001";
  return fmt(p, 4);
}

function effectLabel(d: number): string {
  if (d < 0.2) return "微小";
  if (d < 0.5) return "小";
  if (d < 0.8) return "中";
  return "大";
}

// ── Component ────────────────────────────────────────────────────────────────

type Mode = "independent" | "paired";

export default function TTestCalc() {
  const [mode, setMode] = useState<Mode>("independent");
  const [rawA, setRawA] = useState("");
  const [rawB, setRawB] = useState("");

  const numsA = useMemo(() => parseNumbers(rawA), [rawA]);
  const numsB = useMemo(() => parseNumbers(rawB), [rawB]);

  const error = useMemo<string | null>(() => {
    if (rawA.trim() === "" || rawB.trim() === "") return null;
    if (numsA.length < 2) return "グループAのデータが2件以上必要です";
    if (numsB.length < 2) return "グループBのデータが2件以上必要です";
    if (mode === "paired" && numsA.length !== numsB.length)
      return `対応ありt検定ではデータ件数を揃えてください（A: ${numsA.length}件, B: ${numsB.length}件）`;
    return null;
  }, [rawA, rawB, numsA, numsB, mode]);

  const result = useMemo<TTestResult | null>(() => {
    if (error !== null) return null;
    if (numsA.length < 2 || numsB.length < 2) return null;
    if (mode === "paired") {
      if (numsA.length !== numsB.length) return null;
      return calcPaired(numsA, numsB);
    }
    return calcIndependent(numsA, numsB);
  }, [mode, numsA, numsB, error]);

  const methodLabel: Record<string, string> = {
    student: "Student's t検定（等分散）",
    welch: "Welch's t検定（不等分散）",
    paired: "対応ありt検定",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">t検定計算ツール</h1>
          <p className="mt-1 text-sm text-gray-500">
            対応あり・なし、等分散・Welchを自動判別してp値とエフェクトサイズを算出します
          </p>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2">
          {(["independent", "paired"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {m === "independent" ? "対応なし（2群）" : "対応あり（paired）"}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              グループA のデータ
            </label>
            <p className="text-xs text-gray-400">カンマ・スペース・改行で区切って入力</p>
            <textarea
              value={rawA}
              onChange={(e) => setRawA(e.target.value)}
              placeholder="例: 12.3, 14.1, 11.8, 13.5, 12.9"
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            {numsA.length > 0 && (
              <p className="text-xs text-gray-400">{numsA.length}件認識</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              グループB のデータ
            </label>
            <p className="text-xs text-gray-400">カンマ・スペース・改行で区切って入力</p>
            <textarea
              value={rawB}
              onChange={(e) => setRawB(e.target.value)}
              placeholder="例: 10.2, 11.5, 9.8, 10.9, 11.2"
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-300 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            {numsB.length > 0 && (
              <p className="text-xs text-gray-400">{numsB.length}件認識</p>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            {/* Significance badge */}
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                  result.significant
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {result.significant ? "有意差あり (p < 0.05)" : "有意差なし (p ≥ 0.05)"}
              </span>
              <span className="text-xs text-gray-400">
                {methodLabel[result.method]}
              </span>
            </div>

            {/* Group stats */}
            <div className="grid grid-cols-2 gap-3">
              {(["groupA", "groupB"] as const).map((g, i) => (
                <div key={g} className="rounded-lg bg-gray-50 px-4 py-3 space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    グループ{i === 0 ? "A" : "B"}（n={result[g].n}）
                  </p>
                  <p className="text-sm text-gray-800">
                    平均: <span className="font-mono font-semibold">{fmt(result[g].mean, 4)}</span>
                  </p>
                  <p className="text-sm text-gray-800">
                    SD: <span className="font-mono">{fmt(result[g].sd, 4)}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Main stats */}
            <div className="rounded-lg border border-gray-100 divide-y divide-gray-100">
              <Row label="t統計量" value={fmt(result.tStat, 4)} />
              <Row
                label="自由度 (df)"
                value={result.df % 1 === 0 ? result.df.toString() : fmt(result.df, 2)}
              />
              <Row
                label="p値（両側）"
                value={fmtP(result.pValue)}
                highlight
              />
              <Row
                label={`Cohen's d（効果量）`}
                value={`${fmt(result.cohensD, 3)}（${effectLabel(result.cohensD)}）`}
              />
              {result.fPValue !== null && (
                <Row
                  label="等分散性F検定 p値"
                  value={fmtP(result.fPValue)}
                  sub={result.equalVariance ? "等分散と判定 → Student" : "不等分散と判定 → Welch"}
                />
              )}
            </div>
          </div>
        )}

        {/* Ad placeholder */}
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
          広告スペース
        </div>

        {/* Formula explanation */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-3 text-sm text-gray-600">
          <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">計算式</p>
          <ul className="space-y-1.5 text-xs leading-relaxed">
            <li>
              <span className="font-medium text-gray-700">等分散性判定</span>：F検定 (p &lt; 0.05 → Welch)
            </li>
            <li>
              <span className="font-medium text-gray-700">Student's t</span>：プール分散を使用、df = n₁+n₂−2
            </li>
            <li>
              <span className="font-medium text-gray-700">Welch's t</span>：Satterthwaite近似でdfを計算
            </li>
            <li>
              <span className="font-medium text-gray-700">対応ありt</span>：差分 d = A−B の平均をSDで除算
            </li>
            <li>
              <span className="font-medium text-gray-700">Cohen's d</span>：d &lt; 0.2 微小 / 0.2–0.5 小 / 0.5–0.8 中 / 0.8+ 大
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────

function Row({
  label,
  value,
  highlight,
  sub,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  sub?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <div>
        <span className="text-sm text-gray-600">{label}</span>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <span
        className={`font-mono text-sm font-semibold ${
          highlight ? "text-blue-700" : "text-gray-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
