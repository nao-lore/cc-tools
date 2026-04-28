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
  mde: number,
  alpha: number,
  power: number
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

// --- 翻訳定数 ---
type Lang = "ja" | "en";

const T = {
  ja: {
    // Tabs
    test: "有意差検定",
    samplesize: "サンプルサイズ",
    guide: "解説",
    // Section headings
    inputTitle: "A/B 両群のデータ入力",
    ssTitle: "必要サンプルサイズ計算",
    ssSubtitle: "「この改善効果を検出したい」という目標から、テストに必要な最低訪問数を算出します。",
    guideTitle: "使い方ガイド",
    faqTitle: "よくある質問",
    relatedTools: "関連ツール",
    ssRelationTitle: "サンプルサイズと検出力の関係",
    ssResult: "必要サンプルサイズ",
    ciInterpretTitle: "% 信頼区間の解釈",
    testResult: "検定結果",
    // Labels
    groupA: "コントロール群",
    groupB: "テスト群",
    visits: "訪問数（セッション数）",
    cvCount: "CV数（コンバージョン数）",
    significanceLevel: "有意水準",
    confidenceInterval: "信頼区間",
    cvrCompare: "CVR 比較",
    baselineCvr: "ベースラインCVR（現在のA群CVR）",
    minEffect: "検出したい最小改善効果（相対値）",
    alphaLabel: "有意水準（α）",
    powerLabel: "検定力（1−β）",
    // Result labels
    cvrA: "CVR A",
    cvrB: "CVR B",
    lift: "リフト率",
    pVal: "p値",
    zStat: "Z統計量",
    ciLabel: "% 信頼区間（差）",
    minPerGroup: "1群あたりの最低訪問数",
    totalVisits: "合計",
    totalVisitsSuffix: " 訪問（A+B）",
    // Buttons
    alpha5: "5%（標準）",
    alpha1: "1%（厳格）",
    power80: "80%（標準）",
    power90: "90%（高精度）",
    // Significant
    significant: "統計的に有意です",
    notSignificant: "有意差はありません",
    pValueLabel: "p値 = ",
    pValueSuffix: "　（有意水準 ",
    pValueSuffix2: "%・両側検定）",
    also1pct: "有意水準1%でも有意です（非常に強いエビデンス）",
    not1pct: "有意水準1%では有意ではありません（追加データ収集を検討）",
    // CI interpretation
    ciEstimate1: "B群のCVRはA群に対して、",
    ciEstimate2: "%の確率で",
    ciEstimate3: "の範囲にあると推定されます（pp = パーセンテージポイント差）。",
    ciAllPlus: "区間全体がプラス → B群の改善効果は確実と考えられます。",
    ciAllMinus: "区間全体がマイナス → B群はA群より悪いと考えられます。",
    ciCrossZero: "区間がゼロをまたいでいます → 差がない可能性を排除できません。",
    // Empty state
    emptyState: "有効な数値を入力してください（CV数は訪問数以下）",
    // SS details
    ssBaseRate: "ベースラインCVR",
    ssTargetCvr: "目標CVR（B群）",
    ssMinDiff: "最小検出差（絶対）",
    ssAlphaPower: "有意水準 / 検定力",
    ssRelation1: "検出したい効果が小さいほど、必要なサンプルが増えます。",
    ssRelation2: "改善効果5%を検出するには、20%を検出するより約16倍のサンプルが必要です。",
    ssRelation3: "テスト期間の目安: 日次訪問数 ÷ 1群必要数 で必要日数を計算できます。",
    mdeExample: "例: {mde}%改善 = CVR {base}% → {target}%",
    improve: "% 改善",
    // Guide steps
    guideSteps: [
      { step: "1", title: "A群・B群のデータを入力", desc: "「有意差検定」タブで、コントロール群（A）とテスト群（B）それぞれの訪問数とCV数を入力します。デフォルト値で動作確認できます。" },
      { step: "2", title: "有意水準を設定", desc: "一般的なWebテストでは5%（標準）、重要な意思決定には1%（厳格）を選びます。信頼区間は90/95/99%から選択できます。" },
      { step: "3", title: "結果を確認", desc: "p値・Z統計量・リフト率・信頼区間が表示されます。「統計的に有意です」と表示されれば差は偶然でない可能性が高いです。" },
      { step: "4", title: "サンプルサイズを事前計算", desc: "テスト前に「サンプルサイズ」タブで必要訪問数を計算しましょう。テスト期間の目安が立てられます。" },
    ],
    // Guide articles
    articles: [
      { title: "A/Bテストとは", body: "2つのバージョン（A: 現行, B: 変更案）をランダムにユーザーに見せ、どちらが目標指標（CVRなど）を改善するか統計的に判断する手法です。感覚や直感ではなくデータで意思決定できます。" },
      { title: "p値とは", body: "「帰無仮説（A=Bに差がない）が真であるとき、今回観測されたような差かそれ以上の差が偶然生じる確率」です。p < 0.05 なら、偶然である確率が5%未満 = 統計的に有意と判断します。p値は「B群が優れている確率」ではありません。" },
      { title: "信頼区間とは", body: "95%信頼区間は「同じ方法で繰り返し実験したとき、95%の確率で真の差が含まれる区間」です。区間全体がプラスなら改善確実、ゼロをまたぐなら結論を出すのに更なるデータが必要です。" },
      { title: "リフト率とは", body: "B群のCVRがA群に対して何%改善したかを示す相対指標です。例: A=2%, B=2.4% のとき、リフト率=+20%。ただしリフト率が高くても絶対差が小さい（0.4pp）場合は実用的意義が小さいこともあります。" },
      { title: "よくある間違い", body: "① 「p < 0.05 になるまで毎日チェックして止める」は偽陽性が増えます（Peekingと呼ばれる問題）。② サンプルサイズを決める前にテストを開始してはいけません。③ 統計的有意 ≠ 実務的に重要。効果が小さくても有意になることはあります。" },
      { title: "検定力（Power）とは", body: "真に差がある場合に、それを正しく検出できる確率です。80%は「本当に差があるとき、20回に1回は見落とす」ことを意味します。重要な判断ほど90%以上を推奨します。" },
    ],
    // FAQ
    faq: [
      { q: "ABテストの有意差とはどういう意味ですか？", a: "「A群とB群に差がない」という仮説（帰無仮説）を棄却できる統計的な根拠があることを意味します。p値が有意水準（通常5%）未満であれば、観測された差が偶然生じた確率が低いと判断します。" },
      { q: "p値が0.05未満でも採用しない方がいいですか？", a: "統計的有意 ≠ 実務的に重要です。リフト率が0.1%でも大規模なトラフィックがあればp値は小さくなります。信頼区間の幅と実際の効果量（pp差）を合わせて判断することが重要です。" },
      { q: "必要なサンプルサイズはどう決めますか？", a: "「サンプルサイズ」タブで現在のCVRと検出したい最小改善効果（例: 20%改善）を入力すると1群あたりの最低訪問数が計算されます。日次訪問数で割れば必要なテスト期間がわかります。" },
      { q: "テスト中に毎日p値を確認してもいいですか？", a: "推奨しません。「p < 0.05になったら止める」という方法はPeeking問題と呼ばれ、偽陽性（実際には差がないのに有意と判断）が大幅に増えます。事前に決めたサンプルサイズに達してから判断してください。" },
      { q: "カイ二乗検定との違いは何ですか？", a: "本ツールは二項比率の差のZ検定（両側）を使用しています。2×2の分割表に対するカイ二乗検定と数学的に等価であり、Z統計量の二乗がカイ二乗値に対応します。" },
    ],
    // Related
    relatedLinks: [
      { href: "/nps-score", icon: "📈", title: "NPS スコア計算" },
      { href: "/funnel-conversion", icon: "🔻", title: "ファネル コンバージョン計算" },
      { href: "/chi-square-test", icon: "📊", title: "カイ二乗検定" },
    ],
    footnote: "二項比率の差のZ検定（両側）。正規分布CDF: Abramowitz & Stegun近似を使用。",
    cvr: "CVR",
  },
  en: {
    // Tabs
    test: "Significance Test",
    samplesize: "Sample Size",
    guide: "Guide",
    // Section headings
    inputTitle: "Enter A/B Group Data",
    ssTitle: "Required Sample Size Calculator",
    ssSubtitle: "Calculate the minimum visits needed for your test based on the improvement you want to detect.",
    guideTitle: "How to Use",
    faqTitle: "FAQ",
    relatedTools: "Related Tools",
    ssRelationTitle: "Sample Size vs. Statistical Power",
    ssResult: "Required Sample Size",
    ciInterpretTitle: "% Confidence Interval Interpretation",
    testResult: "Test Results",
    // Labels
    groupA: "Control Group",
    groupB: "Test Group",
    visits: "Visits (Sessions)",
    cvCount: "Conversions",
    significanceLevel: "Significance Level",
    confidenceInterval: "Confidence Interval",
    cvrCompare: "CVR Comparison",
    baselineCvr: "Baseline CVR (current group A)",
    minEffect: "Minimum Detectable Effect (relative)",
    alphaLabel: "Significance Level (α)",
    powerLabel: "Statistical Power (1−β)",
    // Result labels
    cvrA: "CVR A",
    cvrB: "CVR B",
    lift: "Lift",
    pVal: "p-value",
    zStat: "Z Statistic",
    ciLabel: "% CI (difference)",
    minPerGroup: "Min. visits per group",
    totalVisits: "Total",
    totalVisitsSuffix: " visits (A+B)",
    // Buttons
    alpha5: "5% (standard)",
    alpha1: "1% (strict)",
    power80: "80% (standard)",
    power90: "90% (high)",
    // Significant
    significant: "Statistically Significant",
    notSignificant: "Not Significant",
    pValueLabel: "p = ",
    pValueSuffix: "　(α = ",
    pValueSuffix2: "%, two-tailed)",
    also1pct: "Also significant at 1% level (very strong evidence)",
    not1pct: "Not significant at 1% level — consider collecting more data",
    // CI interpretation
    ciEstimate1: "The CVR of group B vs group A is estimated to be in the range ",
    ciEstimate2: " with ",
    ciEstimate3: "% confidence (pp = percentage point difference).",
    ciAllPlus: "Entire interval is positive → B's improvement is reliable.",
    ciAllMinus: "Entire interval is negative → B appears worse than A.",
    ciCrossZero: "Interval crosses zero → cannot rule out no difference.",
    // Empty state
    emptyState: "Enter valid numbers (conversions must not exceed visits)",
    // SS details
    ssBaseRate: "Baseline CVR",
    ssTargetCvr: "Target CVR (group B)",
    ssMinDiff: "Min. detectable diff (absolute)",
    ssAlphaPower: "Significance / Power",
    ssRelation1: "Smaller effects require exponentially more samples.",
    ssRelation2: "Detecting a 5% improvement needs ~16x more samples than detecting 20%.",
    ssRelation3: "Estimate test duration: required per group ÷ daily visits.",
    mdeExample: "e.g. {mde}% improvement = CVR {base}% → {target}%",
    improve: "% improvement",
    // Guide steps
    guideSteps: [
      { step: "1", title: "Enter A/B data", desc: "In the 'Significance Test' tab, enter visits and conversions for both control (A) and test (B) groups. Default values are pre-filled." },
      { step: "2", title: "Set significance level", desc: "Use 5% for typical web tests, 1% for high-stakes decisions. Choose 90/95/99% confidence interval." },
      { step: "3", title: "Read results", desc: "p-value, Z-statistic, lift, and confidence interval are shown instantly. 'Statistically Significant' means the difference is unlikely to be random." },
      { step: "4", title: "Pre-calculate sample size", desc: "Before starting a test, use the 'Sample Size' tab to find the minimum visits needed. Divide by daily traffic to estimate test duration." },
    ],
    // Guide articles
    articles: [
      { title: "What is an A/B test?", body: "A/B testing randomly shows users two versions (A: control, B: variant) and uses statistics to determine which one better achieves a goal (e.g. higher CVR). It replaces gut feeling with data-driven decisions." },
      { title: "What is a p-value?", body: "The p-value is the probability of observing a difference as large as this one (or larger) by chance, assuming no real difference exists. p < 0.05 means there is less than a 5% chance the result is random. It is NOT the probability that B is better." },
      { title: "What is a confidence interval?", body: "A 95% confidence interval means: if you ran the same test many times, 95% of the intervals would contain the true difference. If the entire interval is positive, B's improvement is reliable. If it crosses zero, you need more data." },
      { title: "What is lift?", body: "Lift is the relative improvement of group B's CVR over group A. Example: A=2%, B=2.4% → lift=+20%. Even a high lift can have small practical impact if the absolute difference (0.4pp) is small." },
      { title: "Common mistakes", body: "① Stopping when p < 0.05 causes inflated false positives (Peeking problem). ② Never start a test without pre-determining sample size. ③ Statistical significance ≠ practical importance. Small effects can be significant at scale." },
      { title: "What is statistical power?", body: "Power is the probability of detecting a real effect when it exists. 80% means you'll miss 1 in 5 real effects. For high-stakes decisions, aim for 90% or higher." },
    ],
    // FAQ
    faq: [
      { q: "What does statistical significance mean in an A/B test?", a: "It means there is statistical evidence to reject the null hypothesis (no difference between A and B). If the p-value is below the significance level (typically 5%), the observed difference is unlikely to be due to chance." },
      { q: "Should I always adopt B when p < 0.05?", a: "Statistical significance does not equal practical importance. With large traffic, even a 0.1% lift can be significant. Always evaluate the confidence interval width and actual effect size (pp difference) alongside the p-value." },
      { q: "How do I determine the required sample size?", a: "Use the 'Sample Size' tab: enter your current CVR and the minimum improvement you want to detect (e.g. 20%). The tool calculates the minimum visits per group. Divide by daily traffic to estimate test duration." },
      { q: "Can I check the p-value every day during the test?", a: "Not recommended. Stopping as soon as p < 0.05 is the 'Peeking problem' and dramatically inflates false positives. Always wait until you reach the pre-calculated sample size." },
      { q: "How is this different from a chi-square test?", a: "This tool uses a two-tailed Z-test for the difference between two proportions, which is mathematically equivalent to the chi-square test on a 2×2 contingency table. Z² = χ²." },
    ],
    // Related
    relatedLinks: [
      { href: "/nps-score", icon: "📈", title: "NPS Score Calculator" },
      { href: "/funnel-conversion", icon: "🔻", title: "Funnel Conversion Calculator" },
      { href: "/chi-square-test", icon: "📊", title: "Chi-Square Test" },
    ],
    footnote: "Two-tailed Z-test for difference between two proportions. Normal CDF: Abramowitz & Stegun approximation.",
    cvr: "CVR",
  },
} as const;

// --- タブ ---
type Tab = "test" | "samplesize" | "guide";

export default function AbTestSignificance() {
  const [activeTab, setActiveTab] = useState<Tab>("test");
  const [lang, setLang] = useState<Lang>("ja");

  const t = T[lang];

  // 検定入力
  const [nA, setNA] = useState<number>(10000);
  const [cvA, setCvA] = useState<number>(200);
  const [nB, setNB] = useState<number>(10000);
  const [cvB, setCvB] = useState<number>(240);
  const [alpha, setAlpha] = useState<0.05 | 0.01>(0.05);
  const [ciLevel, setCiLevel] = useState<90 | 95 | 99>(95);

  // サンプルサイズ入力
  const [ssBaseRate, setSsBaseRate] = useState<number>(2.0);
  const [ssMde, setSsMde] = useState<number>(20);
  const [ssPower, setSsPower] = useState<0.8 | 0.9>(0.8);
  const [ssAlpha, setSsAlpha] = useState<0.05 | 0.01>(0.05);

  // --- 計算 ---
  const result = useMemo(() => calcTest(nA, cvA, nB, cvB), [nA, cvA, nB, cvB]);

  const ssCiLow = useMemo(() => {
    const base = ssBaseRate / 100;
    const mde = base * (ssMde / 100);
    return calcSampleSize(base, mde, ssAlpha, ssPower);
  }, [ssBaseRate, ssMde, ssPower, ssAlpha]);

  const ci = useMemo(() => {
    if (!result) return null;
    if (ciLevel === 90) return { low: result.ciLow90, high: result.ciHigh90 };
    if (ciLevel === 99) return { low: result.ciLow99, high: result.ciHigh99 };
    return { low: result.ciLow95, high: result.ciHigh95 };
  }, [result, ciLevel]);

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "test", label: t.test, icon: "◎" },
    { id: "samplesize", label: t.samplesize, icon: "∿" },
    { id: "guide", label: t.guide, icon: "?" },
  ];

  const isSignificant = alpha === 0.05 ? result?.significant5 : result?.significant1;

  return (
    <div className="space-y-5">
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
        .result-card-glow {
          animation: pulse-glow 3s ease-in-out infinite;
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
        .preset-active {
          background: rgba(139,92,246,0.25);
          border-color: rgba(167,139,250,0.6);
          color: #c4b5fd;
          box-shadow: 0 0 10px rgba(139,92,246,0.3);
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
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 2px;
          background: rgba(139,92,246,0.3);
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a78bfa, #818cf8);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(139,92,246,0.5), 0 2px 6px rgba(0,0,0,0.4);
          border: 2px solid rgba(255,255,255,0.2);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 16px rgba(139,92,246,0.7), 0 2px 8px rgba(0,0,0,0.5);
        }
        .table-row-stripe:hover {
          background: rgba(139,92,246,0.08);
          transition: background 0.2s ease;
        }
        .sig-banner-yes {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.3);
        }
        .sig-banner-no {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
        }
      `}</style>

      {/* Language toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* タブ */}
      <div className="glass-card rounded-2xl p-1.5 flex gap-1 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-violet-600 text-white tab-active-glow"
                : "text-violet-200 hover:text-violet-100 hover:bg-white/5"
            }`}
          >
            <span className="text-xs opacity-70">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== 有意差検定 ===== */}
      {activeTab === "test" && (
        <div className="space-y-5 tab-panel">
          {/* 入力 */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.inputTitle}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* グループA */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-violet-200 text-xs font-bold border border-white/15">A</span>
                  <span className="font-medium text-white text-sm">{t.groupA}</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-violet-100 mb-1 uppercase tracking-wider">{t.visits}</label>
                  <input
                    type="number"
                    min={1}
                    step={100}
                    value={nA}
                    onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v > 0) setNA(v); }}
                    className="number-input w-full px-3 py-2 rounded-xl text-sm font-mono neon-focus transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-violet-100 mb-1 uppercase tracking-wider">{t.cvCount}</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={cvA}
                    onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v >= 0) setCvA(v); }}
                    className="number-input w-full px-3 py-2 rounded-xl text-sm font-mono neon-focus transition-all"
                  />
                </div>
                {nA > 0 && cvA >= 0 && (
                  <div className="text-xs text-violet-200">
                    {t.cvr}: <span className="font-semibold text-white font-mono">{fmtPct(cvA / nA)}</span>
                  </div>
                )}
              </div>

              {/* グループB */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-500/20 text-violet-200 text-xs font-bold border border-violet-500/40">B</span>
                  <span className="font-medium text-white text-sm">{t.groupB}</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-violet-100 mb-1 uppercase tracking-wider">{t.visits}</label>
                  <input
                    type="number"
                    min={1}
                    step={100}
                    value={nB}
                    onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v > 0) setNB(v); }}
                    className="number-input w-full px-3 py-2 rounded-xl text-sm font-mono neon-focus transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-violet-100 mb-1 uppercase tracking-wider">{t.cvCount}</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={cvB}
                    onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v >= 0) setCvB(v); }}
                    className="number-input w-full px-3 py-2 rounded-xl text-sm font-mono neon-focus transition-all"
                  />
                </div>
                {nB > 0 && cvB >= 0 && (
                  <div className="text-xs text-violet-200">
                    {t.cvr}: <span className="font-semibold text-white font-mono">{fmtPct(cvB / nB)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CVRバー比較 */}
            {result && (
              <div className="mt-5 space-y-2">
                <div className="text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.cvrCompare}</div>
                {[
                  { label: "A", pct: result.pA, color: "rgba(255,255,255,0.25)" },
                  { label: "B", pct: result.pB, color: "rgba(139,92,246,0.7)" },
                ].map(({ label, pct, color }) => {
                  const max = Math.max(result.pA, result.pB);
                  const barWidth = max > 0 ? (pct / max) * 100 : 0;
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xs font-bold w-4 text-violet-200">{label}</span>
                      <div className="flex-1 rounded-full h-4 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${barWidth}%`, background: color }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-white font-mono w-14 text-right">{fmtPct(pct)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* オプション */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/8">
              <div>
                <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.significanceLevel}</label>
                <div className="flex gap-2">
                  {([0.05, 0.01] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => setAlpha(a)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        alpha === a
                          ? "method-btn-active border-violet-500/60 text-violet-100"
                          : "border-white/10 text-violet-200 hover:border-violet-500/30"
                      }`}
                    >
                      {a === 0.05 ? t.alpha5 : t.alpha1}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.confidenceInterval}</label>
                <div className="flex gap-2">
                  {([90, 95, 99] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCiLevel(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        ciLevel === c
                          ? "method-btn-active border-violet-500/60 text-violet-100"
                          : "border-white/10 text-violet-200 hover:border-violet-500/30"
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
              <div className={`rounded-2xl p-5 flex items-center gap-4 ${isSignificant ? "sig-banner-yes" : "sig-banner-no"}`}>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${
                    isSignificant ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-white/5 border border-white/10"
                  }`}
                >
                  {isSignificant ? "✓" : "—"}
                </div>
                <div>
                  <div className={`font-bold text-lg ${isSignificant ? "text-emerald-400" : "text-white/60"}`}>
                    {isSignificant ? t.significant : t.notSignificant}
                  </div>
                  <div className="text-sm text-violet-200 mt-0.5">
                    {t.pValueLabel}{fmtPValue(result.pValue)}{t.pValueSuffix}{alpha * 100}{t.pValueSuffix2}
                  </div>
                </div>
              </div>

              {/* 数値カード */}
              <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow">
                <div className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-5">{t.testResult}</div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="glass-card rounded-xl p-3 text-center">
                    <div className="text-violet-200 text-xs mb-1.5">{t.cvrA}</div>
                    <div className="font-bold text-lg text-white font-mono">{fmtPct(result.pA)}</div>
                  </div>
                  <div className="glass-card rounded-xl p-3 text-center">
                    <div className="text-violet-200 text-xs mb-1.5">{t.cvrB}</div>
                    <div className="font-bold text-lg text-white font-mono">{fmtPct(result.pB)}</div>
                  </div>
                  <div className="glass-card rounded-xl p-3 text-center">
                    <div className="text-violet-200 text-xs mb-1.5">{t.lift}</div>
                    <div className={`font-bold text-lg font-mono ${result.lift >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {result.lift >= 0 ? "+" : ""}{(result.lift * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-3 text-center">
                    <div className="text-violet-200 text-xs mb-1.5">{t.pVal}</div>
                    <div className="font-bold text-lg text-white font-mono">{fmtPValue(result.pValue)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card rounded-xl p-3">
                    <div className="text-violet-200 text-xs mb-1.5">{t.zStat}</div>
                    <div className="font-semibold text-white font-mono">{result.zStat.toFixed(4)}</div>
                  </div>
                  <div className="glass-card rounded-xl p-3">
                    <div className="text-violet-200 text-xs mb-1.5">{ciLevel}{t.ciLabel}</div>
                    <div className="font-semibold text-sm text-cyan-300 font-mono">
                      {fmtDiff(ci.low)} 〜 {fmtDiff(ci.high)}
                    </div>
                  </div>
                </div>

                {alpha === 0.05 && result.significant5 && (
                  <div className="mt-3 text-xs text-violet-200 glass-card rounded-lg px-3 py-2">
                    {result.significant1 ? t.also1pct : t.not1pct}
                  </div>
                )}
              </div>

              {/* 信頼区間の解釈 */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-3">{ciLevel}{t.ciInterpretTitle}</h2>
                <div className="text-sm text-violet-100 leading-relaxed">
                  <p>
                    {lang === "ja"
                      ? <>{t.ciEstimate1}{ciLevel}{t.ciEstimate2}<span className="font-semibold text-cyan-300 mx-1">{fmtDiff(ci.low)} 〜 {fmtDiff(ci.high)}</span>{t.ciEstimate3}</>
                      : <>{t.ciEstimate1}<span className="font-semibold text-cyan-300 mx-1">{fmtDiff(ci.low)} to {fmtDiff(ci.high)}</span>{t.ciEstimate2}{ciLevel}{t.ciEstimate3}</>
                    }
                  </p>
                  {ci.low > 0 && (
                    <p className="mt-2 text-emerald-400 font-medium">{t.ciAllPlus}</p>
                  )}
                  {ci.high < 0 && (
                    <p className="mt-2 text-red-400 font-medium">{t.ciAllMinus}</p>
                  )}
                  {ci.low <= 0 && ci.high >= 0 && (
                    <p className="mt-2 text-violet-200">{t.ciCrossZero}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6 text-center text-violet-200 text-sm">
              {t.emptyState}
            </div>
          )}
        </div>
      )}

      {/* ===== サンプルサイズ ===== */}
      {activeTab === "samplesize" && (
        <div className="space-y-5 tab-panel">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-2">{t.ssTitle}</h2>
            <p className="text-xs text-violet-100 mb-5">{t.ssSubtitle}</p>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.baselineCvr}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0.01}
                    max={99.99}
                    step={0.1}
                    value={ssBaseRate}
                    onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v > 0 && v < 100) setSsBaseRate(v); }}
                    className="number-input w-32 px-3 py-2 rounded-xl text-sm font-mono neon-focus transition-all"
                  />
                  <span className="text-violet-200 text-sm">%</span>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[0.5, 1.0, 2.0, 3.0, 5.0, 10.0].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSsBaseRate(preset)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all font-mono ${
                        ssBaseRate === preset
                          ? "preset-active"
                          : "border-white/10 text-violet-100 hover:border-violet-500/40 hover:text-violet-200"
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.minEffect}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={ssMde}
                    onChange={(e) => setSsMde(Number(e.target.value))}
                    className="flex-1 cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={ssMde}
                      onChange={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v > 0) setSsMde(Math.min(v, 100)); }}
                      className="number-input w-20 px-2 py-1 text-right rounded-xl text-sm font-mono neon-focus"
                    />
                    <span className="text-sm text-violet-200 whitespace-nowrap">{t.improve}</span>
                  </div>
                </div>
                <div className="text-xs text-violet-200 mt-1">
                  {lang === "ja"
                    ? `例: ${ssMde}%改善 = CVR ${ssBaseRate}% → ${(ssBaseRate * (1 + ssMde / 100)).toFixed(2)}%`
                    : `e.g. ${ssMde}% improvement = CVR ${ssBaseRate}% → ${(ssBaseRate * (1 + ssMde / 100)).toFixed(2)}%`
                  }
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.alphaLabel}</label>
                  <div className="flex gap-2">
                    {([0.05, 0.01] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => setSsAlpha(a)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          ssAlpha === a
                            ? "method-btn-active border-violet-500/60 text-violet-100"
                            : "border-white/10 text-violet-200 hover:border-violet-500/30"
                        }`}
                      >
                        {a === 0.05 ? t.alpha5 : t.alpha1}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.powerLabel}</label>
                  <div className="flex gap-2">
                    {([0.8, 0.9] as const).map((pw) => (
                      <button
                        key={pw}
                        onClick={() => setSsPower(pw)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          ssPower === pw
                            ? "method-btn-active border-violet-500/60 text-violet-100"
                            : "border-white/10 text-violet-200 hover:border-violet-500/30"
                        }`}
                      >
                        {pw === 0.8 ? t.power80 : t.power90}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* サンプルサイズ結果 */}
          <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow">
            <div className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-5">{t.ssResult}</div>

            <div className="mb-5">
              <div className="text-violet-200 text-xs mb-2">{t.minPerGroup}</div>
              <div className="text-5xl font-bold text-white glow-text tracking-tight font-mono">
                {ssCiLow > 0 ? ssCiLow.toLocaleString() : "—"}
              </div>
              {ssCiLow > 0 && (
                <div className="text-violet-200 text-sm mt-1">
                  {t.totalVisits}: <span className="text-white font-mono">{(ssCiLow * 2).toLocaleString()}</span>{t.totalVisitsSuffix}
                </div>
              )}
            </div>

            {ssCiLow > 0 && (
              <div className="glass-card rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between text-violet-100">
                  <span>{t.ssBaseRate}</span>
                  <span className="font-mono text-white">{ssBaseRate}%</span>
                </div>
                <div className="flex justify-between text-violet-100">
                  <span>{t.ssTargetCvr}</span>
                  <span className="font-mono text-white">{(ssBaseRate * (1 + ssMde / 100)).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-violet-100">
                  <span>{t.ssMinDiff}</span>
                  <span className="font-mono text-cyan-300">{((ssBaseRate / 100) * (ssMde / 100) * 100).toFixed(3)}pp</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 mt-1 text-violet-100">
                  <span>{t.ssAlphaPower}</span>
                  <span className="font-mono text-white">{ssAlpha * 100}% / {ssPower * 100}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-3">{t.ssRelationTitle}</h3>
            <div className="text-xs text-violet-200 space-y-1.5">
              <p>{t.ssRelation1}</p>
              <p>{t.ssRelation2}</p>
              <p>{t.ssRelation3}</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== 解説 ===== */}
      {activeTab === "guide" && (
        <div className="space-y-4 tab-panel">
          {t.articles.map((item) => (
            <div key={item.title} className="glass-card rounded-2xl p-5 hover:border-violet-500/20 transition-all border border-transparent">
              <h3 className="font-semibold text-white mb-2 text-sm">{item.title}</h3>
              <p className="text-sm text-violet-100 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-violet-200 text-center pb-2">
        {t.footnote}
      </p>

      {/* 使い方ガイド */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.guideTitle}</h2>
        <ol className="space-y-3.5">
          {t.guideSteps.map((item) => (
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

      {/* FAQ */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.faqTitle}</h2>
        <div className="space-y-4">
          {t.faq.map((item, i) => (
            <div key={i} className="border-b border-white/6 pb-4 last:border-0 last:pb-0">
              <div className="font-bold text-white text-sm mb-1.5">Q. {item.q}</div>
              <div className="text-sm text-violet-100 leading-relaxed">A. {item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 関連ツール */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedTools}</h2>
        <div className="flex flex-wrap gap-2">
          {t.relatedLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-violet-100 hover:text-violet-100 transition-colors border border-white/8 hover:border-violet-500/40"
              style={{ background: "rgba(139,92,246,0)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0)"; }}
            >
              <span>{link.icon}</span> {link.title}
            </a>
          ))}
        </div>
      </div>

      {/* JSON-LD FAQPage (stays Japanese) */}
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
