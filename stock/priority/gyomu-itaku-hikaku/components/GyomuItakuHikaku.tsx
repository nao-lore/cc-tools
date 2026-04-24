"use client";
import { useState, useMemo } from "react";

// ---- 税率テーブル ----
const INCOME_TAX_BRACKETS = [
  { limit: 1_950_000, rate: 0.05, deduction: 0 },
  { limit: 3_300_000, rate: 0.10, deduction: 97_500 },
  { limit: 6_950_000, rate: 0.20, deduction: 427_500 },
  { limit: 9_000_000, rate: 0.23, deduction: 636_000 },
  { limit: 18_000_000, rate: 0.33, deduction: 1_536_000 },
  { limit: 40_000_000, rate: 0.40, deduction: 2_796_000 },
  { limit: Infinity, rate: 0.45, deduction: 4_796_000 },
];

function calcIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  for (const b of INCOME_TAX_BRACKETS) {
    if (taxableIncome <= b.limit) {
      return Math.floor(taxableIncome * b.rate - b.deduction);
    }
  }
  return 0;
}

// 給与所得控除
function calcKyuyoShotokuKojyo(gross: number): number {
  if (gross <= 1_625_000) return 550_000;
  if (gross <= 1_800_000) return Math.floor(gross * 0.4) - 100_000;
  if (gross <= 3_600_000) return Math.floor(gross * 0.3) + 80_000;
  if (gross <= 6_600_000) return Math.floor(gross * 0.2) + 440_000;
  if (gross <= 8_500_000) return Math.floor(gross * 0.1) + 1_100_000;
  return 1_950_000;
}

// 社会保険料（正社員：健保+介護+厚生年金+雇用）
function calcShakaihokenSeishain(gross: number): {
  kenpo: number;
  kaigo: number;
  kosei: number;
  koyo: number;
  total: number;
} {
  // 標準報酬月額（簡易計算）
  const monthly = gross / 12;
  // 健康保険 9.98% 折半 → 4.99%（協会けんぽ東京 2024）
  const kenpo = Math.floor(monthly * 0.0499) * 12;
  // 介護保険 1.82% 折半 → 0.91%（40歳以上想定）
  const kaigo = Math.floor(monthly * 0.0091) * 12;
  // 厚生年金 18.3% 折半 → 9.15%（上限あり: 標準報酬月額65万）
  const cappedMonthly = Math.min(monthly, 650_000);
  const kosei = Math.floor(cappedMonthly * 0.0915) * 12;
  // 雇用保険 1.55% → 被保険者負担 0.6%
  const koyo = Math.floor(gross * 0.006);
  return { kenpo, kaigo, kosei, koyo, total: kenpo + kaigo + kosei + koyo };
}

// 国民健康保険（業務委託）: 所得割 + 均等割（全国平均近似）
function calcKokuhoShahoken(jigyo_shotoku: number): number {
  // 所得割 8.0% + 均等割 約5万円（全国平均近似）
  const shotokuWari = Math.floor(Math.max(0, jigyo_shotoku - 430_000) * 0.08);
  const kintoWari = 50_000;
  return Math.min(shotokuWari + kintoWari, 1_060_000); // 上限106万
}

// 国民年金（業務委託）2024年度
const KOKUMIN_NENKIN_ANNUAL = 199_320; // 16_610 × 12

// 青色申告控除
const AOSHIRO_KOJYO = 650_000;

// 基礎控除
const KISO_KOJYO = 480_000;

// 住民税基礎控除
const JUMINZEI_KISO_KOJYO = 430_000;
// 住民税率（所得割10% + 均等割5,000円）
function calcJuminzei(taxableIncome: number): number {
  if (taxableIncome <= 0) return 5_000;
  return Math.floor(Math.max(0, taxableIncome) * 0.10) + 5_000;
}

// ---- 正社員計算 ----
function calcSeishain(gross: number) {
  const shakai = calcShakaihokenSeishain(gross);
  const kyuyoKojyo = calcKyuyoShotokuKojyo(gross);
  // 課税所得（所得税）
  const taxableIncome = Math.max(0, gross - shakai.total - kyuyoKojyo - KISO_KOJYO);
  const shotokuZei = Math.max(0, calcIncomeTax(taxableIncome));
  const fukkoZei = Math.floor(shotokuZei * 0.021); // 復興特別所得税
  // 住民税課税所得
  const juminTaxable = Math.max(0, gross - shakai.total - kyuyoKojyo - JUMINZEI_KISO_KOJYO);
  const juminZei = calcJuminzei(juminTaxable);

  const totalDeduction = shakai.total + shotokuZei + fukkoZei + juminZei;
  const takeHome = gross - totalDeduction;

  // 将来年金（厚生年金: 加入期間40年想定）
  // 厚生年金: (平均標準報酬月額 × 5.481/1000 × 加入月数) + 国民年金基礎部分
  const hyojunHoshyuMonthly = Math.min(gross / 12, 650_000);
  const kosei_nenkin_monthly = Math.floor(hyojunHoshyuMonthly * 0.005481 * 480 / 12);
  const kiso_nenkin_monthly = Math.floor(795_000 / 12); // 2024年満額 ÷12
  const future_nenkin_monthly = kosei_nenkin_monthly + kiso_nenkin_monthly;

  return {
    gross,
    shakai,
    shotokuZei,
    fukkoZei,
    juminZei,
    totalDeduction,
    takeHome,
    future_nenkin_monthly,
    taxableIncome,
  };
}

// ---- 業務委託計算 ----
function calcGyomuItaku(gross: number) {
  // 事業所得 = 額面 - 青色申告控除（経費0前提）
  const jigyoShotoku = Math.max(0, gross - AOSHIRO_KOJYO);

  const kokuho = calcKokuhoShahoken(jigyoShotoku);
  const kokumin = KOKUMIN_NENKIN_ANNUAL;
  const shakai_total = kokuho + kokumin;

  // 課税所得（所得税）
  const taxableIncome = Math.max(0, jigyoShotoku - shakai_total - KISO_KOJYO);
  const shotokuZei = Math.max(0, calcIncomeTax(taxableIncome));
  const fukkoZei = Math.floor(shotokuZei * 0.021);

  // 住民税
  const juminTaxable = Math.max(0, jigyoShotoku - shakai_total - JUMINZEI_KISO_KOJYO);
  const juminZei = calcJuminzei(juminTaxable);

  const totalDeduction = shakai_total + shotokuZei + fukkoZei + juminZei;
  const takeHome = gross - totalDeduction;

  // 将来年金（国民年金のみ）
  const future_nenkin_monthly = Math.floor(795_000 / 12); // 基礎年金のみ

  return {
    gross,
    jigyoShotoku,
    kokuho,
    kokumin,
    shakai_total,
    shotokuZei,
    fukkoZei,
    juminZei,
    totalDeduction,
    takeHome,
    future_nenkin_monthly,
    taxableIncome,
  };
}

// ---- フォーマット ----
function yen(n: number): string {
  return n.toLocaleString("ja-JP") + "円";
}
function man(n: number): string {
  return Math.round(n / 10_000).toLocaleString("ja-JP") + "万円";
}

// ---- コンポーネント ----
export default function GyomuItakuHikaku() {
  const [grossInput, setGrossInput] = useState("600");
  const [age, setAge] = useState<"under40" | "over40">("under40");

  const gross = useMemo(() => {
    const v = parseFloat(grossInput.replace(/,/g, ""));
    return isNaN(v) || v <= 0 ? 0 : Math.round(v * 10_000);
  }, [grossInput]);

  const seishain = useMemo(() => calcSeishain(gross), [gross]);
  const gyomu = useMemo(() => calcGyomuItaku(gross), [gross]);

  const diff = gyomu.takeHome - seishain.takeHome;
  const nenkinDiff = seishain.future_nenkin_monthly - gyomu.future_nenkin_monthly;
  // 損益分岐点: 業務委託で正社員と同じ手取りを得るために必要な額面
  const breakEvenRatio = gross > 0 ? seishain.takeHome / gross : 0;

  const presets = [300, 400, 500, 600, 700, 800, 1000, 1200, 1500];

  return (
    <div className="space-y-6">
      {/* 入力パネル */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">年収を入力（額面）</h2>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <input
              type="number"
              min="100"
              max="5000"
              step="10"
              value={grossInput}
              onChange={(e) => setGrossInput(e.target.value)}
              className="w-full border border-blue-200 rounded-xl px-4 py-3 text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-14"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">万円</span>
          </div>
          <div className="text-gray-400 text-sm">= {gross > 0 ? yen(gross) : "—"}</div>
        </div>

        {/* プリセット */}
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setGrossInput(String(p))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                grossInput === String(p)
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              {p}万
            </button>
          ))}
        </div>

        {/* 年齢（介護保険） */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600 font-medium">年齢：</span>
          {(["under40", "over40"] as const).map((v) => (
            <label key={v} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="age"
                value={v}
                checked={age === v}
                onChange={() => setAge(v)}
                className="accent-blue-600"
              />
              <span className="text-gray-700">{v === "under40" ? "40歳未満" : "40歳以上（介護保険あり）"}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">※ 介護保険は現時点では計算に含まれています（40歳以上想定）。目安値です。</p>
      </div>

      {/* 手取り比較カード */}
      {gross > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 正社員カード */}
            <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏢</span>
                <h3 className="text-lg font-bold text-indigo-700">正社員</h3>
              </div>
              <div className="text-center py-3 mb-4 bg-indigo-50 rounded-xl">
                <div className="text-sm text-indigo-500 mb-1">手取り年収</div>
                <div className="text-4xl font-bold text-indigo-700">{man(seishain.takeHome)}</div>
                <div className="text-sm text-indigo-400 mt-1">{yen(seishain.takeHome)}</div>
              </div>
              <div className="text-center mb-4">
                <div className="text-sm text-gray-500 mb-1">手取り率</div>
                <div className="text-2xl font-semibold text-gray-700">
                  {gross > 0 ? Math.round((seishain.takeHome / gross) * 100) : 0}%
                </div>
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  <Row label="給与所得控除" value={yen(calcKyuyoShotokuKojyo(gross))} muted />
                  <Row label="健康保険（折半）" value={yen(seishain.shakai.kenpo)} />
                  <Row label="介護保険（折半）" value={yen(seishain.shakai.kaigo)} />
                  <Row label="厚生年金（折半）" value={yen(seishain.shakai.kosei)} />
                  <Row label="雇用保険" value={yen(seishain.shakai.koyo)} />
                  <Row label="所得税" value={yen(seishain.shotokuZei + seishain.fukkoZei)} />
                  <Row label="住民税" value={yen(seishain.juminZei)} />
                  <Row label="控除合計" value={yen(seishain.totalDeduction)} bold />
                </tbody>
              </table>
            </div>

            {/* 業務委託カード */}
            <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💼</span>
                <h3 className="text-lg font-bold text-sky-700">業務委託（個人事業主）</h3>
              </div>
              <div className="text-center py-3 mb-4 bg-sky-50 rounded-xl">
                <div className="text-sm text-sky-500 mb-1">手取り年収</div>
                <div className="text-4xl font-bold text-sky-700">{man(gyomu.takeHome)}</div>
                <div className="text-sm text-sky-400 mt-1">{yen(gyomu.takeHome)}</div>
              </div>
              <div className="text-center mb-4">
                <div className="text-sm text-gray-500 mb-1">手取り率</div>
                <div className="text-2xl font-semibold text-gray-700">
                  {gross > 0 ? Math.round((gyomu.takeHome / gross) * 100) : 0}%
                </div>
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  <Row label="青色申告控除" value={yen(AOSHIRO_KOJYO)} muted />
                  <Row label="国民健康保険" value={yen(gyomu.kokuho)} />
                  <Row label="国民年金" value={yen(gyomu.kokumin)} />
                  <Row label="所得税" value={yen(gyomu.shotokuZei + gyomu.fukkoZei)} />
                  <Row label="住民税" value={yen(gyomu.juminZei)} />
                  <Row label="控除合計" value={yen(gyomu.totalDeduction)} bold />
                </tbody>
              </table>
            </div>
          </div>

          {/* 差額バナー */}
          <div
            className={`rounded-2xl p-5 text-center shadow-sm ${
              diff >= 0
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white"
                : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white"
            }`}
          >
            <div className="text-sm opacity-80 mb-1">
              {diff >= 0 ? "業務委託の方が手取りが多い" : "正社員の方が手取りが多い"}
            </div>
            <div className="text-4xl font-bold mb-1">
              {diff >= 0 ? "+" : ""}{man(diff)}
            </div>
            <div className="text-sm opacity-70">{yen(Math.abs(diff))} の差</div>
          </div>

          {/* 将来年金比較 */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">将来年金の見込み（月額）</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-xl">
                <div className="text-sm text-indigo-500 mb-1">正社員（厚生年金+基礎）</div>
                <div className="text-3xl font-bold text-indigo-700">
                  {Math.round(seishain.future_nenkin_monthly / 1000)}千円
                </div>
                <div className="text-xs text-indigo-400 mt-1">約{yen(seishain.future_nenkin_monthly)}/月</div>
              </div>
              <div className="text-center p-4 bg-sky-50 rounded-xl">
                <div className="text-sm text-sky-500 mb-1">業務委託（基礎年金のみ）</div>
                <div className="text-3xl font-bold text-sky-700">
                  {Math.round(gyomu.future_nenkin_monthly / 1000)}千円
                </div>
                <div className="text-xs text-sky-400 mt-1">約{yen(gyomu.future_nenkin_monthly)}/月</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-50 rounded-xl text-sm text-amber-700">
              <span className="font-semibold">月{Math.round(nenkinDiff / 1000)}千円の差</span>
              （年間{man(nenkinDiff * 12)}、20年間で{man(nenkinDiff * 12 * 20)}）
            </div>
            <p className="text-xs text-gray-400 mt-2">※ 加入期間40年・現在の標準報酬で継続した場合の目安。iDeCoや国民年金基金で補完可能。</p>
          </div>

          {/* 損益分岐点 */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">損益分岐点</h3>
            <p className="text-gray-600 text-sm mb-4">
              正社員と同じ手取り（{man(seishain.takeHome)}）を業務委託で得るために必要な額面年収
            </p>
            <BreakEvenCalc seishainTakeHome={seishain.takeHome} />
          </div>

          {/* メリット・デメリット */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MeritCard
              title="業務委託のメリット"
              icon="✅"
              color="sky"
              items={[
                "単価が高ければ手取りが増える",
                "経費を事業経費として控除できる",
                "青色申告で最大65万円控除",
                "働き方・契約先を自由に選べる",
                "副業・掛け持ちがしやすい",
              ]}
            />
            <MeritCard
              title="業務委託のデメリット"
              icon="⚠️"
              color="amber"
              items={[
                "国保・国民年金を全額自己負担",
                "厚生年金がなく将来年金が減る",
                "雇用保険（失業給付）がない",
                "確定申告が必要",
                "収入が不安定になりやすい",
                "住宅ローン審査が通りにくい場合も",
              ]}
            />
          </div>

          {/* 注釈 */}
          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
            <p className="font-semibold text-gray-600 mb-1">計算の前提・注意事項</p>
            <ul className="list-disc list-inside space-y-1">
              <li>正社員：協会けんぽ（東京）2024年度保険料率を使用。介護保険料を含む（40歳以上想定）。</li>
              <li>業務委託：国民健康保険は全国平均近似値。実際の保険料は自治体によって大きく異なります。</li>
              <li>業務委託：青色申告特別控除65万円を適用。実際の経費・控除は申告内容によって異なります。</li>
              <li>住民税は翌年課税のため、初年度の負担は異なります。</li>
              <li>将来年金は現行制度・現在の報酬で継続加入した場合の目安です。制度改正により変わる可能性があります。</li>
              <li>本ツールは目安算出用です。正確な金額は税理士・社会保険労務士にご相談ください。</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

// ---- 損益分岐点計算コンポーネント ----
function BreakEvenCalc({ seishainTakeHome }: { seishainTakeHome: number }) {
  // 二分探索で業務委託の手取りが seishainTakeHome になる額面を求める
  let lo = seishainTakeHome;
  let hi = seishainTakeHome * 3;
  for (let i = 0; i < 60; i++) {
    const mid = Math.round((lo + hi) / 2);
    const th = calcGyomuItaku(mid).takeHome;
    if (th < seishainTakeHome) lo = mid;
    else hi = mid;
  }
  const breakEven = Math.round(hi / 10_000) * 10_000;
  const gyomuResult = calcGyomuItaku(breakEven);
  const diffPct = seishainTakeHome > 0
    ? Math.round(((breakEven - seishainTakeHome) / seishainTakeHome) * 100)
    : 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl flex-1">
        <div className="text-sm text-blue-500 mb-1">必要な業務委託額面</div>
        <div className="text-4xl font-bold text-blue-700">{man(breakEven)}</div>
        <div className="text-xs text-blue-400 mt-1">{yen(breakEven)}</div>
      </div>
      <div className="text-gray-400 text-2xl hidden sm:block">→</div>
      <div className="text-center flex-1">
        <div className="text-sm text-gray-500 mb-1">正社員比 +{diffPct}%</div>
        <div className="text-2xl font-semibold text-gray-700">{man(breakEven - seishainTakeHome)} 多く稼ぐ必要あり</div>
      </div>
    </div>
  );
}

// ---- 小コンポーネント ----
function Row({
  label,
  value,
  muted,
  bold,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <tr>
      <td className={`py-1.5 ${muted ? "text-gray-400" : "text-gray-600"}`}>{label}</td>
      <td className={`py-1.5 text-right font-mono ${bold ? "font-bold text-gray-900" : muted ? "text-gray-400" : "text-gray-800"}`}>
        {value}
      </td>
    </tr>
  );
}

function MeritCard({
  title,
  icon,
  color,
  items,
}: {
  title: string;
  icon: string;
  color: "sky" | "amber";
  items: string[];
}) {
  const colors = {
    sky: {
      border: "border-sky-100",
      title: "text-sky-700",
      bg: "bg-sky-50",
      dot: "text-sky-400",
    },
    amber: {
      border: "border-amber-100",
      title: "text-amber-700",
      bg: "bg-amber-50",
      dot: "text-amber-400",
    },
  };
  const c = colors[color];
  return (
    <div className={`bg-white rounded-2xl shadow-sm border ${c.border} p-5`}>
      <h3 className={`text-base font-semibold ${c.title} mb-3`}>
        {icon} {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className={`${c.dot} mt-0.5`}>•</span>
            {item}
          </li>
        ))}
      </ul>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この業務委託 vs 正社員 手取り比較ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">同じ額面で業務委託と正社員の手取り・社会保障・将来年金を比較。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この業務委託 vs 正社員 手取り比較ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "同じ額面で業務委託と正社員の手取り・社会保障・将来年金を比較。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "業務委託 vs 正社員 手取り比較",
  "description": "同じ額面で業務委託と正社員の手取り・社会保障・将来年金を比較",
  "url": "https://tools.loresync.dev/gyomu-itaku-hikaku",
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
