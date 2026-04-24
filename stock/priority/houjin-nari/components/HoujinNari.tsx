"use client";

import { useState, useMemo } from "react";

// ────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────

// 所得税 累進課税（課税所得）
const INCOME_TAX_BRACKETS = [
  { limit: 1_950_000, rate: 0.05, deduction: 0 },
  { limit: 3_300_000, rate: 0.10, deduction: 97_500 },
  { limit: 6_950_000, rate: 0.20, deduction: 427_500 },
  { limit: 9_000_000, rate: 0.23, deduction: 636_000 },
  { limit: 18_000_000, rate: 0.33, deduction: 1_536_000 },
  { limit: 40_000_000, rate: 0.40, deduction: 2_796_000 },
  { limit: Infinity, rate: 0.45, deduction: 4_796_000 },
];

// 給与所得控除（役員報酬）
function calcKyuyoShotokuKojo(salary: number): number {
  if (salary <= 1_625_000) return 550_000;
  if (salary <= 1_800_000) return Math.floor(salary * 0.4) - 100_000;
  if (salary <= 3_600_000) return Math.floor(salary * 0.3) + 80_000;
  if (salary <= 6_600_000) return Math.floor(salary * 0.2) + 440_000;
  if (salary <= 8_500_000) return Math.floor(salary * 0.1) + 1_100_000;
  return 1_950_000;
}

// 所得税計算（課税所得から）
function calcIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  for (const b of INCOME_TAX_BRACKETS) {
    if (taxableIncome <= b.limit) {
      return Math.floor(taxableIncome * b.rate - b.deduction);
    }
  }
  return 0;
}

// 住民税（課税所得 × 10%、均等割5000円）
function calcJuminzei(taxableIncome: number): number {
  if (taxableIncome <= 0) return 5_000;
  return Math.floor(taxableIncome * 0.1) + 5_000;
}

// 国民健康保険（概算: 所得 × 9.5%、上限102万円）
function calcKokuhoHoken(income: number): number {
  const base = Math.max(0, income - 430_000); // 基礎控除相当
  return Math.min(Math.floor(base * 0.095), 1_020_000);
}

// 国民年金（月額16,980円 × 12）
const KOKUMIN_NENKIN = 16_980 * 12; // 203,760円

// 個人事業税（業種別税率）
const GYOSHU_OPTIONS = [
  { label: "第1種（5%）：小売・卸売・IT・コンサル等", rate: 0.05 },
  { label: "第2種（4%）：畜産業・水産業・薪炭製造業", rate: 0.04 },
  { label: "第3種（3%）：医療・歯科・弁護士・税理士等", rate: 0.03 },
  { label: "対象外（0%）：ライター・エンジニア等一部", rate: 0 },
];

// 個人事業税（所得 - 290万控除 × 税率）
function calcJigyozei(income: number, rate: number): number {
  const taxable = Math.max(0, income - 2_900_000);
  return Math.floor(taxable * rate);
}

// 社会保険（健保+厚生年金、労使折半）
// 標準報酬月額から計算（簡易版）
function calcShakaiHoken(annualSalary: number): number {
  const monthly = annualSalary / 12;
  // 健保 9.98%（本人負担）、厚生年金 9.15%（本人負担）、上限あり
  const kenpo = Math.min(monthly, 1_390_000) * 0.0998;
  const kousei = Math.min(monthly, 650_000) * 0.0915;
  return Math.floor((kenpo + kousei) * 12);
}

// 法人税実効税率（中小法人：800万以下15%、超過23.2%）
// 法人住民税（法人税 × 23.2% + 均等割7万）、法人事業税（所得割3.5%）
function calcHojinZei(corporateIncome: number): {
  hojinzei: number;
  hojinJuminzei: number;
  hojinJigyozei: number;
  total: number;
} {
  if (corporateIncome <= 0) {
    return { hojinzei: 0, hojinJuminzei: 70_000, hojinJigyozei: 0, total: 70_000 };
  }
  // 法人税
  const low = Math.min(corporateIncome, 8_000_000);
  const high = Math.max(0, corporateIncome - 8_000_000);
  const hojinzei = Math.floor(low * 0.15 + high * 0.232);
  // 法人住民税（法人税割 23.2% + 均等割7万）
  const hojinJuminzei = Math.floor(hojinzei * 0.232) + 70_000;
  // 法人事業税（所得割 3.5% 中小）
  const hojinJigyozei = Math.floor(corporateIncome * 0.035);
  const total = hojinzei + hojinJuminzei + hojinJigyozei;
  return { hojinzei, hojinJuminzei, hojinJigyozei, total };
}

// ────────────────────────────────────────────
// 計算メイン
// ────────────────────────────────────────────

interface KojinResult {
  shotokuZei: number;
  fukkoZei: number;
  juminzei: number;
  jigyozei: number;
  kokuho: number;
  kokunenkin: number;
  seiriShutoku: number; // 課税所得
  totalTax: number;
  totalSocial: number;
  totalDeduction: number;
  tedate: number;
}

interface HojinResult {
  yakuinHoshu: number; // 役員報酬
  kyuyoKojo: number;
  shotokuZei: number;
  fukkoZei: number;
  juminzei: number;
  shakaiHoken: number; // 社保（個人負担）
  hojinZeiTotal: number;
  hojinZeiDetail: { hojinzei: number; hojinJuminzei: number; hojinJigyozei: number; total: number };
  setsuritsuHiyo: number; // 初年度のみ
  totalTax: number;
  totalSocial: number;
  totalDeduction: number;
  tedate: number;
  corporateIncome: number;
}

function calcKojin(profit: number, gyoshuRate: number): KojinResult {
  // 青色申告控除65万
  const aoshiro = 650_000;
  // 個人事業税（経費扱い）
  const jigyozei = calcJigyozei(profit, gyoshuRate);
  // 国民健康保険
  const kokuho = calcKokuhoHoken(profit - aoshiro);
  const kokunenkin = KOKUMIN_NENKIN;
  // 課税所得 = 利益 - 青色申告控除 - 社会保険料控除 - 事業税 - 基礎控除48万
  const kihonKojo = 480_000;
  const seiriShutoku = Math.max(0, profit - aoshiro - jigyozei - kokuho - kokunenkin - kihonKojo);
  const shotokuZei = calcIncomeTax(seiriShutoku);
  const fukkoZei = Math.floor(shotokuZei * 0.021);
  const juminzei = calcJuminzei(seiriShutoku);

  const totalTax = shotokuZei + fukkoZei + juminzei + jigyozei;
  const totalSocial = kokuho + kokunenkin;
  const totalDeduction = totalTax + totalSocial;
  const tedate = profit - totalDeduction;

  return { shotokuZei, fukkoZei, juminzei, jigyozei, kokuho, kokunenkin, seiriShutoku, totalTax, totalSocial, totalDeduction, tedate };
}

function calcHojin(profit: number, isFirstYear: boolean): HojinResult {
  // 役員報酬 = 利益全額（最適化なし・単純比較）
  const yakuinHoshu = profit;
  // 給与所得控除
  const kyuyoKojo = calcKyuyoShotokuKojo(yakuinHoshu);
  // 社会保険（本人負担分）
  const shakaiHoken = calcShakaiHoken(yakuinHoshu);
  // 課税所得 = 役員報酬 - 給与所得控除 - 社会保険料控除 - 基礎控除48万
  const kihonKojo = 480_000;
  const taxableIncome = Math.max(0, yakuinHoshu - kyuyoKojo - shakaiHoken - kihonKojo);
  const shotokuZei = calcIncomeTax(taxableIncome);
  const fukkoZei = Math.floor(shotokuZei * 0.021);
  const juminzei = calcJuminzei(taxableIncome);
  // 法人所得 = 利益 - 役員報酬（全額支給のため法人所得≒0、均等割のみ）
  const corporateIncome = 0; // 役員報酬=利益全額のケース
  const hojinZeiDetail = calcHojinZei(corporateIncome);
  const hojinZeiTotal = hojinZeiDetail.total;
  // 法人設立費用（初年度のみ）
  const setsuritsuHiyo = isFirstYear ? 250_000 : 0;

  const totalTax = shotokuZei + fukkoZei + juminzei + hojinZeiTotal;
  const totalSocial = shakaiHoken;
  const totalDeduction = totalTax + totalSocial + setsuritsuHiyo;
  const tedate = profit - totalDeduction;

  return {
    yakuinHoshu, kyuyoKojo, shotokuZei, fukkoZei, juminzei, shakaiHoken,
    hojinZeiTotal, hojinZeiDetail, setsuritsuHiyo,
    totalTax, totalSocial, totalDeduction, tedate, corporateIncome,
  };
}

// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

function fmtJPY(n: number): string {
  if (n === 0) return "0円";
  const abs = Math.abs(Math.round(n));
  if (abs >= 10_000) {
    const man = Math.floor(abs / 10_000);
    const remain = abs % 10_000;
    if (remain === 0) return `${n < 0 ? "-" : ""}${man.toLocaleString("ja-JP")}万円`;
    return `${n < 0 ? "-" : ""}${abs.toLocaleString("ja-JP")}円`;
  }
  return `${n < 0 ? "-" : ""}${abs.toLocaleString("ja-JP")}円`;
}

function fmtMan(n: number): string {
  return `${Math.round(n / 10_000).toLocaleString("ja-JP")}万円`;
}

function parseAmount(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  return parseInt(cleaned, 10);
}

// ────────────────────────────────────────────
// 比較表データ生成
// ────────────────────────────────────────────

const COMPARISON_PROFITS = [5_000_000, 7_000_000, 10_000_000, 12_000_000, 15_000_000, 20_000_000];

// ────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────

export default function HoujinNari() {
  const [profitInput, setProfitInput] = useState<string>("");
  const [gyoshuIdx, setGyoshuIdx] = useState<number>(0);
  const [isFirstYear, setIsFirstYear] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"result" | "table" | "guide">("result");

  const profit = parseAmount(profitInput);
  const gyoshuRate = GYOSHU_OPTIONS[gyoshuIdx].rate;

  const kojin = useMemo(() => profit > 0 ? calcKojin(profit, gyoshuRate) : null, [profit, gyoshuRate]);
  const hojin = useMemo(() => profit > 0 ? calcHojin(profit, isFirstYear) : null, [profit, isFirstYear]);

  const diff = kojin && hojin ? hojin.tedate - kojin.tedate : null;
  const breakEven = useMemo(() => {
    // 500万〜3000万の範囲で法人が初めて有利になる利益を二分探索
    let lo = 1_000_000, hi = 50_000_000;
    for (let i = 0; i < 50; i++) {
      const mid = Math.floor((lo + hi) / 2);
      const k = calcKojin(mid, gyoshuRate);
      const h = calcHojin(mid, false);
      if (h.tedate > k.tedate) hi = mid;
      else lo = mid;
    }
    return lo;
  }, [gyoshuRate]);

  const handleProfitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "").replace(/[^\d]/g, "");
    setProfitInput(raw ? parseInt(raw, 10).toLocaleString("ja-JP") : "");
  };

  const comparisonData = useMemo(() =>
    COMPARISON_PROFITS.map(p => ({
      profit: p,
      kojin: calcKojin(p, gyoshuRate),
      hojin: calcHojin(p, false),
    })),
    [gyoshuRate]
  );

  return (
    <div className="space-y-5">

      {/* ===== 入力エリア ===== */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-5">
        <h2 className="text-base font-semibold text-white">条件を入力</h2>

        {/* 年間利益 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            年間利益（売上 - 経費）
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={profitInput}
              onChange={handleProfitChange}
              placeholder="10,000,000"
              className="flex-1 px-4 py-3 text-right text-xl font-bold bg-slate-900 text-white border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-600"
            />
            <span className="text-slate-400 font-medium text-lg">円</span>
          </div>
          {profit > 0 && (
            <p className="text-xs text-slate-500 mt-1 text-right">{fmtMan(profit)}</p>
          )}
        </div>

        {/* 業種選択 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            業種（個人事業税率）
          </label>
          <div className="space-y-2">
            {GYOSHU_OPTIONS.map((g, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all"
                style={{
                  backgroundColor: gyoshuIdx === i ? "rgba(59,130,246,0.15)" : "transparent",
                  borderColor: gyoshuIdx === i ? "rgba(59,130,246,0.5)" : "rgba(71,85,105,0.5)",
                }}>
                <input
                  type="radio"
                  name="gyoshu"
                  checked={gyoshuIdx === i}
                  onChange={() => setGyoshuIdx(i)}
                  className="mt-0.5 accent-blue-500"
                />
                <span className="text-sm text-slate-300">{g.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 初年度フラグ */}
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-700 bg-slate-900">
          <input
            type="checkbox"
            checked={isFirstYear}
            onChange={e => setIsFirstYear(e.target.checked)}
            className="w-4 h-4 accent-blue-500"
          />
          <div>
            <div className="text-sm font-medium text-slate-300">法人設立初年度（設立費用 約25万円を加算）</div>
            <div className="text-xs text-slate-500">登録免許税・定款認証費用等。2年目以降はチェックを外してください。</div>
          </div>
        </label>
      </div>

      {/* ===== タブ ===== */}
      {profit > 0 && (
        <>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-1.5 flex gap-1.5">
            {(["result", "table", "guide"] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeTab === t ? "#3b82f6" : "transparent",
                  color: activeTab === t ? "white" : "#94a3b8",
                }}
              >
                {t === "result" ? "シミュレーション結果" : t === "table" ? "年利益別比較表" : "メリット・費用"}
              </button>
            ))}
          </div>

          {/* ===== 結果タブ ===== */}
          {activeTab === "result" && kojin && hojin && (
            <div className="space-y-5">

              {/* 損益分岐判定バナー */}
              <div className={`rounded-2xl p-5 border ${diff !== null && diff > 0 ? "bg-emerald-900/40 border-emerald-600/50" : "bg-red-900/40 border-red-600/50"}`}>
                <div className="text-xs font-medium mb-1" style={{ color: diff !== null && diff > 0 ? "#6ee7b7" : "#fca5a5" }}>
                  {diff !== null && diff > 0 ? "法人が有利" : "個人事業主が有利"}
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {diff !== null ? (
                    diff > 0
                      ? `法人の方が手取り ${fmtJPY(diff)} 多い`
                      : `個人の方が手取り ${fmtJPY(Math.abs(diff))} 多い`
                  ) : ""}
                </div>
                <div className="text-sm text-slate-400">
                  損益分岐点（通年）：年利益 <span className="text-white font-semibold">{fmtMan(breakEven)}</span> 以上で法人が有利
                </div>
                {isFirstYear && diff !== null && diff > 0 && (
                  <div className="mt-2 text-xs text-amber-300">
                    ※ 初年度は設立費用25万円を含む。2年目以降はさらに手取り増加。
                  </div>
                )}
              </div>

              {/* 手取り比較カード */}
              <div className="grid grid-cols-2 gap-3">
                {/* 個人 */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
                  <div className="text-xs text-slate-400 mb-1 font-medium">個人事業主</div>
                  <div className="text-2xl font-bold text-white mb-3">{fmtJPY(kojin.tedate)}</div>
                  <div className="space-y-1.5">
                    <BreakdownBar label="所得税+復興税" value={kojin.shotokuZei + kojin.fukkoZei} total={profit} color="#ef4444" />
                    <BreakdownBar label="住民税" value={kojin.juminzei} total={profit} color="#f97316" />
                    {kojin.jigyozei > 0 && <BreakdownBar label="個人事業税" value={kojin.jigyozei} total={profit} color="#eab308" />}
                    <BreakdownBar label="国民健康保険" value={kojin.kokuho} total={profit} color="#8b5cf6" />
                    <BreakdownBar label="国民年金" value={kojin.kokunenkin} total={profit} color="#6366f1" />
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700 space-y-1">
                    <Row label="税金合計" value={fmtJPY(kojin.totalTax)} highlight />
                    <Row label="社会保険合計" value={fmtJPY(kojin.totalSocial)} />
                    <Row label="控除合計" value={fmtJPY(kojin.totalDeduction)} highlight />
                  </div>
                </div>

                {/* 法人 */}
                <div className="bg-slate-800 rounded-2xl border border-blue-700/50 p-4">
                  <div className="text-xs text-blue-400 mb-1 font-medium">法人（1人社長）</div>
                  <div className="text-2xl font-bold text-white mb-3">{fmtJPY(hojin.tedate)}</div>
                  <div className="space-y-1.5">
                    <BreakdownBar label="所得税+復興税" value={hojin.shotokuZei + hojin.fukkoZei} total={profit} color="#ef4444" />
                    <BreakdownBar label="住民税" value={hojin.juminzei} total={profit} color="#f97316" />
                    <BreakdownBar label="法人税等" value={hojin.hojinZeiTotal} total={profit} color="#eab308" />
                    <BreakdownBar label="社会保険（本人）" value={hojin.shakaiHoken} total={profit} color="#8b5cf6" />
                    {hojin.setsuritsuHiyo > 0 && <BreakdownBar label="設立費用(初年)" value={hojin.setsuritsuHiyo} total={profit} color="#64748b" />}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-700 space-y-1">
                    <Row label="税金合計" value={fmtJPY(hojin.totalTax)} highlight />
                    <Row label="社会保険合計" value={fmtJPY(hojin.totalSocial)} />
                    <Row label="控除合計" value={fmtJPY(hojin.totalDeduction)} highlight />
                  </div>
                </div>
              </div>

              {/* 内訳詳細 */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
                <h3 className="text-sm font-semibold text-white mb-4">内訳詳細</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* 個人内訳 */}
                  <div>
                    <div className="text-xs font-medium text-slate-400 mb-2">個人事業主</div>
                    <div className="space-y-1.5 text-sm">
                      <DetailRow label="年間利益" value={fmtJPY(profit)} />
                      <DetailRow label="青色申告控除" value={`-${fmtJPY(650_000)}`} sub />
                      <DetailRow label="個人事業税" value={`-${fmtJPY(kojin.jigyozei)}`} sub />
                      <DetailRow label="社会保険料控除" value={`-${fmtJPY(kojin.kokuho + kojin.kokunenkin)}`} sub />
                      <DetailRow label="基礎控除" value={`-${fmtJPY(480_000)}`} sub />
                      <DetailRow label="課税所得" value={fmtJPY(kojin.seiriShutoku)} bold />
                      <div className="border-t border-slate-700 my-1.5" />
                      <DetailRow label="所得税" value={fmtJPY(kojin.shotokuZei)} />
                      <DetailRow label="復興特別所得税" value={fmtJPY(kojin.fukkoZei)} sub />
                      <DetailRow label="住民税" value={fmtJPY(kojin.juminzei)} />
                      <DetailRow label="個人事業税" value={fmtJPY(kojin.jigyozei)} />
                      <DetailRow label="国民健康保険" value={fmtJPY(kojin.kokuho)} />
                      <DetailRow label="国民年金" value={fmtJPY(kojin.kokunenkin)} />
                      <div className="border-t border-slate-700 my-1.5" />
                      <DetailRow label="手取り" value={fmtJPY(kojin.tedate)} bold highlight />
                    </div>
                  </div>

                  {/* 法人内訳 */}
                  <div>
                    <div className="text-xs font-medium text-blue-400 mb-2">法人（1人社長）</div>
                    <div className="space-y-1.5 text-sm">
                      <DetailRow label="年間利益（=役員報酬）" value={fmtJPY(profit)} />
                      <DetailRow label="給与所得控除" value={`-${fmtJPY(hojin.kyuyoKojo)}`} sub />
                      <DetailRow label="社会保険料控除" value={`-${fmtJPY(hojin.shakaiHoken)}`} sub />
                      <DetailRow label="基礎控除" value={`-${fmtJPY(480_000)}`} sub />
                      <div className="border-t border-slate-700 my-1.5" />
                      <DetailRow label="所得税" value={fmtJPY(hojin.shotokuZei)} />
                      <DetailRow label="復興特別所得税" value={fmtJPY(hojin.fukkoZei)} sub />
                      <DetailRow label="住民税" value={fmtJPY(hojin.juminzei)} />
                      <DetailRow label="法人税（均等割）" value={fmtJPY(hojin.hojinZeiDetail.hojinzei)} />
                      <DetailRow label="法人住民税" value={fmtJPY(hojin.hojinZeiDetail.hojinJuminzei)} sub />
                      <DetailRow label="法人事業税" value={fmtJPY(hojin.hojinZeiDetail.hojinJigyozei)} sub />
                      <DetailRow label="社会保険（本人）" value={fmtJPY(hojin.shakaiHoken)} />
                      {hojin.setsuritsuHiyo > 0 && <DetailRow label="設立費用（初年度）" value={fmtJPY(hojin.setsuritsuHiyo)} />}
                      <div className="border-t border-slate-700 my-1.5" />
                      <DetailRow label="手取り" value={fmtJPY(hojin.tedate)} bold highlight />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== 比較表タブ ===== */}
          {activeTab === "table" && (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-white">年利益別 手取り比較（通年、業種選択反映）</h3>
                <p className="text-xs text-slate-500 mt-1">法人は役員報酬=利益全額・設立費用除外</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-3 text-slate-400 font-medium">年利益</th>
                      <th className="text-right p-3 text-slate-400 font-medium">個人 手取り</th>
                      <th className="text-right p-3 text-slate-400 font-medium">法人 手取り</th>
                      <th className="text-right p-3 text-slate-400 font-medium">差額</th>
                      <th className="text-center p-3 text-slate-400 font-medium">有利</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map(({ profit: p, kojin: k, hojin: h }) => {
                      const d = h.tedate - k.tedate;
                      const hojinWins = d > 0;
                      return (
                        <tr key={p}
                          className="border-b border-slate-700/50 transition-colors hover:bg-slate-700/30"
                          style={{ backgroundColor: profit === p ? "rgba(59,130,246,0.1)" : undefined }}>
                          <td className="p-3 font-medium text-white">{fmtMan(p)}</td>
                          <td className="p-3 text-right text-slate-300">{fmtMan(k.tedate)}</td>
                          <td className="p-3 text-right text-slate-300">{fmtMan(h.tedate)}</td>
                          <td className={`p-3 text-right font-semibold ${hojinWins ? "text-emerald-400" : "text-red-400"}`}>
                            {hojinWins ? "+" : ""}{fmtMan(d)}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${hojinWins ? "bg-emerald-900/60 text-emerald-300" : "bg-slate-700 text-slate-400"}`}>
                              {hojinWins ? "法人" : "個人"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-slate-900/50 text-xs text-slate-500">
                損益分岐点（この業種）：年利益 <span className="text-white font-semibold">{fmtMan(breakEven)}</span> 前後
              </div>
            </div>
          )}

          {/* ===== ガイドタブ ===== */}
          {activeTab === "guide" && (
            <div className="space-y-4">
              {/* メリット */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
                <h3 className="text-sm font-semibold text-emerald-400 mb-3">法人成りのメリット</h3>
                <ul className="space-y-2">
                  {[
                    { title: "給与所得控除が使える", desc: "役員報酬に対して最大195万円の控除。個人にはない。" },
                    { title: "所得分散", desc: "家族を役員・従業員にして報酬を分散すると、所得税の累進を緩和できる。" },
                    { title: "経費の範囲が広い", desc: "社宅、出張日当、退職金など法人特有の節税スキームが使える。" },
                    { title: "社会的信用", desc: "取引先・金融機関への信用が高まり、融資や契約に有利。" },
                    { title: "消費税免税延長", desc: "個人→法人で免税期間がリセット（最大2年間免税）。" },
                    { title: "厚生年金に加入", desc: "国民年金より将来の年金受給額が増える。" },
                  ].map(({ title, desc }) => (
                    <li key={title} className="flex gap-3">
                      <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                      <div>
                        <span className="text-sm font-medium text-white">{title}</span>
                        <span className="text-xs text-slate-400 ml-2">{desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* デメリット */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
                <h3 className="text-sm font-semibold text-red-400 mb-3">法人成りのデメリット</h3>
                <ul className="space-y-2">
                  {[
                    { title: "設立費用がかかる", desc: "株式会社で約25万円（定款認証7万+登録免許税15万+その他）。" },
                    { title: "法人住民税均等割", desc: "赤字でも年間約7万円を納付しなければならない。" },
                    { title: "社会保険料が高くなる", desc: "厚生年金+健保で国民健康保険+国民年金より高くなるケースが多い。" },
                    { title: "事務負担の増加", desc: "決算・申告・議事録・登記変更など管理コストが増加。税理士費用が発生。" },
                    { title: "赤字の繰越期間", desc: "個人は3年、法人は10年繰越可能。" },
                  ].map(({ title, desc }) => (
                    <li key={title} className="flex gap-3">
                      <span className="text-red-500 mt-0.5 shrink-0">✗</span>
                      <div>
                        <span className="text-sm font-medium text-white">{title}</span>
                        <span className="text-xs text-slate-400 ml-2">{desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 費用一覧 */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
                <h3 className="text-sm font-semibold text-white mb-3">費用・コスト早見表</h3>
                <div className="space-y-2 text-sm">
                  <div className="text-xs text-slate-500 font-medium mb-1">【初期費用（設立時）】</div>
                  {[
                    ["定款認証費用（公証人）", "約5万円"],
                    ["登録免許税（株式会社）", "15万円"],
                    ["定款印紙代（電子定款で0円）", "0〜4万円"],
                    ["司法書士報酬（依頼時）", "5〜10万円"],
                    ["合計目安", "約15〜25万円"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-700 my-2" />
                  <div className="text-xs text-slate-500 font-medium mb-1">【ランニングコスト（年間）】</div>
                  {[
                    ["法人住民税均等割（最低）", "約7万円"],
                    ["税理士顧問料", "月1.5〜5万円"],
                    ["社会保険料（会社負担）", "役員報酬の約14.6%"],
                    ["決算申告費用（税理士）", "10〜30万円"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== 免責・参考リンク ===== */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-5">
        <p className="text-xs text-slate-500 mb-2">
          本ツールは概算計算を目的としており、実際の税額・手取りと異なる場合があります。
          役員報酬の最適化（所得税最小化）、退職金積立、家族への分散等は考慮していません。
          正確な判断は税理士等の専門家にご相談ください。
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/hojin/hojin.htm"
            target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 underline">
            国税庁「法人税のあらまし」
          </a>
          <a href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/shotoku.htm"
            target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 underline">
            国税庁「所得税」
          </a>
        </div>
      </div>

      {/* ===== 使い方ガイド ===== */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
        <h2 className="text-base font-semibold text-white mb-4">法人成り 損益分岐シミュレーターの使い方</h2>
        <ol className="space-y-4">
          {[
            { step: "1", title: "年間利益（売上 - 経費）を入力", desc: "個人事業主として得ている年間の利益（粗利ではなく経費控除後の金額）を入力します。法人に移したと仮定して計算します。" },
            { step: "2", title: "業種と個人事業税率を選択", desc: "個人事業主には業種に応じた個人事業税がかかります。IT・コンサルなど多くのサービス業は第1種（5%）ですが、一部は対象外（0%）です。" },
            { step: "3", title: "初年度設立費用の有無を選択", desc: "株式会社設立には定款認証・登録免許税等で約25万円かかります。初年度はこのコストが手取りを圧迫します。2年目以降はチェックを外してください。" },
            { step: "4", title: "シミュレーション結果と損益分岐点を確認", desc: "個人と法人の手取りを比較し、どちらが有利かと損益分岐となる利益額が表示されます。年利益別比較表タブも参考にしてください。" },
          ].map(({ step, title, desc }) => (
            <li key={step} className="flex gap-4">
              <span className="w-7 h-7 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center shrink-0">{step}</span>
              <div>
                <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ===== FAQ ===== */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-5">
        <h2 className="text-base font-semibold text-white">よくある質問（FAQ）</h2>
        {[
          {
            q: "法人成りを検討すべき年収（利益）の目安はどのくらいですか？",
            a: "一般的には年間利益が700〜1,000万円を超えるあたりから法人化のメリットが出始めます。ただし業種・役員報酬の設定・社会保険料負担によって異なります。このシミュレーターで損益分岐点を確認してください。",
          },
          {
            q: "法人化すると社会保険料が高くなると聞きましたが本当ですか？",
            a: "法人の役員になると厚生年金・健康保険（社会保険）への加入が強制となり、国民年金・国民健康保険より保険料が高くなるケースが多いです。ただし将来の年金受給額が増える・傷病手当金が出るなどのメリットもあります。",
          },
          {
            q: "個人事業主のままでも給与所得控除は使えますか？",
            a: "使えません。給与所得控除は給与所得者（役員含む）に適用される控除です。個人事業主の事業所得には給与所得控除がなく、代わりに青色申告特別控除（最大65万円）が使えます。",
          },
          {
            q: "法人成りしても消費税は免除されますか？",
            a: "個人事業主から法人に変更した場合、法人設立後2年間は原則として消費税の免税事業者になります（設立初年度の資本金が1,000万円未満の場合）。インボイス登録していない場合はこの免税期間を活用できます。",
          },
        ].map(({ q, a }) => (
          <div key={q} className="border-b border-slate-700 last:border-0 pb-4 last:pb-0">
            <p className="text-sm font-semibold text-blue-400 mb-1">Q. {q}</p>
            <p className="text-xs text-slate-400">A. {a}</p>
          </div>
        ))}
      </div>

      {/* ===== 関連ツール ===== */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">関連ツール</h2>
        <div className="space-y-2">
          {[
            { href: "/tools/aojiro-shinkoku-sim", label: "青色申告控除 節税シミュレーター", desc: "個人事業主の青色申告による節税効果を計算" },
            { href: "/tools/kojin-jigyo-zei", label: "個人事業税 計算ツール", desc: "業種別の個人事業税を自動計算" },
            { href: "/tools/gyomu-itaku-hikaku", label: "業務委託 vs 正社員 比較ツール", desc: "フリーランスと会社員の手取りを比較" },
          ].map(({ href, label, desc }) => (
            <a key={href} href={href} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-xl border border-slate-600 hover:border-blue-500 transition-colors group">
              <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-400 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-slate-300 group-hover:text-white">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </a>
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
            mainEntity: [
              {
                "@type": "Question",
                name: "法人成りを検討すべき年収（利益）の目安はどのくらいですか？",
                acceptedAnswer: { "@type": "Answer", text: "一般的には年間利益が700〜1,000万円を超えるあたりから法人化のメリットが出始めます。業種・役員報酬の設定・社会保険料負担によって異なります。" },
              },
              {
                "@type": "Question",
                name: "法人化すると社会保険料が高くなると聞きましたが本当ですか？",
                acceptedAnswer: { "@type": "Answer", text: "法人の役員になると厚生年金・健康保険への加入が強制となり、国民年金・国民健康保険より保険料が高くなるケースが多いです。ただし将来の年金受給額増加などのメリットもあります。" },
              },
              {
                "@type": "Question",
                name: "個人事業主のままでも給与所得控除は使えますか？",
                acceptedAnswer: { "@type": "Answer", text: "使えません。給与所得控除は給与所得者（役員含む）に適用される控除です。個人事業主には青色申告特別控除（最大65万円）が使えます。" },
              },
              {
                "@type": "Question",
                name: "法人成りしても消費税は免除されますか？",
                acceptedAnswer: { "@type": "Answer", text: "法人設立後2年間は原則として消費税の免税事業者になります（設立初年度の資本金が1,000万円未満の場合）。" },
              },
            ],
          }),
        }}
      />
    </div>
  );
}

// ────────────────────────────────────────────
// サブコンポーネント
// ────────────────────────────────────────────

function BreakdownBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-medium">{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-xs">
      <span className={highlight ? "text-slate-300 font-medium" : "text-slate-500"}>{label}</span>
      <span className={highlight ? "text-white font-semibold" : "text-slate-400"}>{value}</span>
    </div>
  );
}

function DetailRow({ label, value, sub, bold, highlight }: { label: string; value: string; sub?: boolean; bold?: boolean; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={`${sub ? "text-slate-500 pl-3" : "text-slate-400"} ${bold ? "font-semibold text-slate-300" : ""}`}>{label}</span>
      <span className={`${bold ? "font-bold" : "font-medium"} ${highlight ? "text-emerald-400" : "text-slate-300"}`}>{value}</span>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "法人成り 損益分岐シミュレーター",
  "description": "年収別に個人事業主と法人（1人社長）の手取り・税金・社会保険を比較",
  "url": "https://tools.loresync.dev/houjin-nari",
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
