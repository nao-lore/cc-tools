"use client";

import { useState, useMemo } from "react";

// --- 型定義 ---
type Industry = {
  id: string;
  label: string;
  rate: number;
  description: string;
};

const INDUSTRIES: Industry[] = [
  { id: "1", label: "第1種（卸売業）", rate: 0.9, description: "他の事業者に商品を販売する事業" },
  { id: "2", label: "第2種（小売業）", rate: 0.8, description: "消費者に商品を販売する事業" },
  { id: "3", label: "第3種（製造業等）", rate: 0.7, description: "製造・建設・農業・林業・漁業・鉱業等" },
  { id: "4", label: "第4種（その他）", rate: 0.6, description: "飲食業、金融・保険業以外のその他の事業" },
  { id: "5", label: "第5種（サービス業等）", rate: 0.5, description: "情報通信、運輸、金融・保険、サービス業等" },
  { id: "6", label: "第6種（不動産業）", rate: 0.4, description: "不動産の貸付・売買等" },
];

type ResultMethod = "honzoku" | "kani" | "niwari" | null;

function fmtNum(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

function parseNum(s: string): number {
  const v = parseFloat(s.replace(/,/g, ""));
  return isNaN(v) || v < 0 ? 0 : v;
}

// --- 入力フィールド ---
function AmountField({
  label,
  sublabel,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-0.5">{label}</label>
      {sublabel && <p className="text-xs text-gray-400 mb-1">{sublabel}</p>}
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          step={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0"}
          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-right"
        />
        <span className="text-sm text-gray-500 whitespace-nowrap">円</span>
      </div>
    </div>
  );
}

// --- 課税方式カード ---
function MethodCard({
  label,
  badge,
  taxAmount,
  detail,
  isWinner,
  isDisabled,
  disabledReason,
  diff,
  diffLabel,
}: {
  label: string;
  badge: string;
  taxAmount: number | null;
  detail: string;
  isWinner: boolean;
  isDisabled: boolean;
  disabledReason?: string;
  diff?: number;
  diffLabel?: string;
}) {
  const borderClass = isDisabled
    ? "border-gray-200 bg-gray-50 opacity-60"
    : isWinner
    ? "border-amber-400 bg-amber-50 ring-2 ring-amber-300"
    : "border-gray-200 bg-white";

  return (
    <div className={`relative rounded-2xl border p-5 transition-all ${borderClass}`}>
      {isWinner && !isDisabled && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
            最も有利
          </span>
        </div>
      )}
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">{badge}</span>
          <p className="font-semibold text-gray-800 mt-0.5">{label}</p>
        </div>
        {isDisabled && (
          <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full ml-2 whitespace-nowrap">
            対象外
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-3">{detail}</p>
      {isDisabled ? (
        <p className="text-xs text-gray-400 italic">{disabledReason}</p>
      ) : taxAmount !== null ? (
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{fmtNum(taxAmount)}</span>
            <span className="text-sm text-gray-600">円</span>
          </div>
          {isWinner && diff !== undefined && diff > 0 && diffLabel && (
            <p className="mt-1 text-xs text-amber-700 font-medium">
              次点より {fmtNum(diff)} 円 節税（{diffLabel}比）
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-400">金額を入力してください</p>
      )}
    </div>
  );
}

// --- アコーディオン ---
function Accordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-medium text-gray-800 text-sm">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 text-sm text-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}

// --- メインコンポーネント ---
export default function ConsumptionTaxChoice() {
  const [salesStr, setSalesStr] = useState("");
  const [purchaseStr, setPurchaseStr] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("5");
  const [isInvoiceRegistrant, setIsInvoiceRegistrant] = useState<boolean | null>(null);
  const [salesOver5000, setSalesOver5000] = useState<boolean | null>(null);

  const sales = parseNum(salesStr);
  const purchase = parseNum(purchaseStr);
  const salesTax = sales * 0.1;
  const purchaseTax = purchase * 0.1;

  const industry = INDUSTRIES.find((i) => i.id === selectedIndustry)!;

  // --- 各方式の納税額 ---
  const honzokuTax = useMemo(() => salesTax - purchaseTax, [salesTax, purchaseTax]);
  const kaniTax = useMemo(
    () => salesTax - salesTax * industry.rate,
    [salesTax, industry.rate]
  );
  const niwariTax = useMemo(() => salesTax * 0.2, [salesTax]);

  // 簡易課税の適用可否
  const kaniEligible = salesOver5000 === false;
  // 2割特例の適用可否
  const niwariEligible = isInvoiceRegistrant === true;

  const hasInput = sales > 0;

  // --- 最有利方式の判定 ---
  const winner: ResultMethod = useMemo(() => {
    if (!hasInput) return null;
    const candidates: { method: ResultMethod; tax: number }[] = [
      { method: "honzoku", tax: honzokuTax },
    ];
    if (kaniEligible) candidates.push({ method: "kani", tax: kaniTax });
    if (niwariEligible) candidates.push({ method: "niwari", tax: niwariTax });

    candidates.sort((a, b) => a.tax - b.tax);
    return candidates[0].method;
  }, [hasInput, honzokuTax, kaniTax, niwariTax, kaniEligible, niwariEligible]);

  // --- 次点税額（差額計算用）---
  const secondBestTax = useMemo(() => {
    if (!hasInput) return null;
    const candidates: number[] = [honzokuTax];
    if (kaniEligible) candidates.push(kaniTax);
    if (niwariEligible) candidates.push(niwariTax);
    candidates.sort((a, b) => a - b);
    return candidates.length > 1 ? candidates[1] : null;
  }, [hasInput, honzokuTax, kaniTax, niwariTax, kaniEligible, niwariEligible]);

  const winnerTax =
    winner === "honzoku"
      ? honzokuTax
      : winner === "kani"
      ? kaniTax
      : winner === "niwari"
      ? niwariTax
      : null;

  const savingDiff =
    winnerTax !== null && secondBestTax !== null ? secondBestTax - winnerTax : 0;

  function getDiffLabel(winner: ResultMethod): string {
    if (winner === "honzoku") {
      const others = [];
      if (kaniEligible) others.push("簡易課税");
      if (niwariEligible) others.push("2割特例");
      return others.join("・");
    }
    if (winner === "kani") return "本則課税";
    if (winner === "niwari") return "本則課税";
    return "";
  }

  return (
    <div className="space-y-5">
      {/* ===== 入力セクション ===== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
        <h2 className="font-semibold text-gray-800">基本情報を入力</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AmountField
            label="課税売上高（税抜）"
            sublabel="年間の消費税対象売上"
            value={salesStr}
            onChange={setSalesStr}
            placeholder="例: 10000000"
          />
          <AmountField
            label="課税仕入高・経費（税抜）"
            sublabel="本則課税の仕入税額控除の計算に使用"
            value={purchaseStr}
            onChange={setPurchaseStr}
            placeholder="例: 6000000"
          />
        </div>

        {/* 業種選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            業種（みなし仕入率）
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.id}
                onClick={() => setSelectedIndustry(ind.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  selectedIndustry === ind.id
                    ? "border-amber-400 bg-amber-50 ring-1 ring-amber-300"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <span
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedIndustry === ind.id
                      ? "border-amber-500 bg-amber-500"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {selectedIndustry === ind.id && (
                    <span className="w-2 h-2 rounded-full bg-white" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800">
                    {ind.label}
                    <span className="ml-1.5 text-amber-600">
                      {Math.round(ind.rate * 100)}%
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{ind.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 要件チェック */}
        <div className="space-y-3 pt-1">
          <p className="text-sm font-medium text-gray-700">適用要件の確認</p>

          {/* 簡易課税の要件 */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-orange-800">
              簡易課税 — 基準期間の課税売上高が5,000万円以下ですか？
            </p>
            <p className="text-xs text-orange-600">
              ※基準期間 = 前々事業年度（個人は前々年）
            </p>
            <div className="flex gap-2">
              {[
                { val: false, label: "5,000万円以下（適用可）" },
                { val: true, label: "5,000万円超（適用不可）" },
              ].map(({ val, label }) => (
                <button
                  key={String(val)}
                  onClick={() => setSalesOver5000(val)}
                  className={`flex-1 px-3 py-2 text-xs rounded-lg border font-medium transition-all ${
                    salesOver5000 === val
                      ? val
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-orange-600 text-white border-orange-600"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 2割特例の要件 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-amber-800">
              2割特例 — インボイス登録により免税→課税になった事業者ですか？
            </p>
            <p className="text-xs text-amber-600">
              ※適用期間: 2023年10月〜2026年9月の課税期間のみ
            </p>
            <div className="flex gap-2">
              {[
                { val: true, label: "はい（対象）" },
                { val: false, label: "いいえ（対象外）" },
              ].map(({ val, label }) => (
                <button
                  key={String(val)}
                  onClick={() => setIsInvoiceRegistrant(val)}
                  className={`flex-1 px-3 py-2 text-xs rounded-lg border font-medium transition-all ${
                    isInvoiceRegistrant === val
                      ? val
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-gray-600 text-white border-gray-600"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== 計算結果 ===== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">課税方式の比較</h2>
          {hasInput && (
            <span className="text-xs text-gray-500">消費税率 10% で計算</span>
          )}
        </div>

        {/* 売上消費税の表示 */}
        {hasInput && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">売上消費税（共通）</span>
            <span className="font-bold text-gray-900 text-lg">
              {fmtNum(salesTax)} <span className="text-sm font-normal text-gray-500">円</span>
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 mt-2">
          {/* 本則課税 */}
          <MethodCard
            label="本則課税"
            badge="原則"
            taxAmount={hasInput ? honzokuTax : null}
            detail={`売上消費税 − 仕入消費税 / 実際の仕入・経費に基づく正確な控除`}
            isWinner={winner === "honzoku"}
            isDisabled={false}
            diff={winner === "honzoku" ? savingDiff : undefined}
            diffLabel={winner === "honzoku" ? getDiffLabel("honzoku") : undefined}
          />

          {/* 簡易課税 */}
          <MethodCard
            label="簡易課税"
            badge={`第${selectedIndustry}種 みなし仕入率 ${Math.round(industry.rate * 100)}%`}
            taxAmount={hasInput ? kaniTax : null}
            detail={`売上消費税 × (1 − ${Math.round(industry.rate * 100)}%) / 実際の仕入額は不問`}
            isWinner={winner === "kani"}
            isDisabled={!kaniEligible}
            disabledReason={
              salesOver5000 === true
                ? "基準期間の課税売上高が5,000万円超のため適用不可"
                : "「適用要件の確認」で条件を選択してください"
            }
            diff={winner === "kani" ? savingDiff : undefined}
            diffLabel={winner === "kani" ? getDiffLabel("kani") : undefined}
          />

          {/* 2割特例 */}
          <MethodCard
            label="2割特例"
            badge="経過措置 〜2026年9月"
            taxAmount={hasInput ? niwariTax : null}
            detail="売上消費税 × 20% / 控除額が売上消費税の80%になる特例"
            isWinner={winner === "niwari"}
            isDisabled={!niwariEligible}
            disabledReason={
              isInvoiceRegistrant === false
                ? "インボイス登録で免税→課税になった事業者以外は適用不可"
                : "「適用要件の確認」で条件を選択してください"
            }
            diff={winner === "niwari" ? savingDiff : undefined}
            diffLabel={winner === "niwari" ? getDiffLabel("niwari") : undefined}
          />
        </div>
      </div>

      {/* ===== 計算内訳 ===== */}
      {hasInput && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">計算内訳</h3>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span className="text-gray-500">課税売上高（税抜）</span>
              <span className="text-right font-medium text-gray-800">{fmtNum(sales)} 円</span>
              <span className="text-gray-500">売上消費税（×10%）</span>
              <span className="text-right font-medium text-gray-800">{fmtNum(salesTax)} 円</span>
              <span className="text-gray-500">課税仕入高（税抜）</span>
              <span className="text-right font-medium text-gray-800">{fmtNum(purchase)} 円</span>
              <span className="text-gray-500">仕入消費税（×10%）</span>
              <span className="text-right font-medium text-gray-800">{fmtNum(purchaseTax)} 円</span>
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">
                  本則課税 = {fmtNum(salesTax)} − {fmtNum(purchaseTax)}
                </span>
                <span className="font-semibold text-gray-900">{fmtNum(honzokuTax)} 円</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">
                  簡易課税 = {fmtNum(salesTax)} × (1 − {Math.round(industry.rate * 100)}%)
                </span>
                <span className="font-semibold text-gray-900">{fmtNum(kaniTax)} 円</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">
                  2割特例 = {fmtNum(salesTax)} × 20%
                </span>
                <span className="font-semibold text-gray-900">{fmtNum(niwariTax)} 円</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 届出要否 ===== */}
      {hasInput && winner && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5">
          <h3 className="font-semibold text-amber-900 mb-3 text-sm">手続きの注意点</h3>
          <ul className="space-y-2 text-xs text-amber-800">
            {winner === "kani" && kaniEligible && (
              <>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">!</span>
                  <span>
                    <strong>簡易課税を選択するには事前届出が必要です。</strong>
                    適用を受けようとする課税期間の初日の前日（通常は前事業年度末日）までに「消費税簡易課税制度選択届出書」を税務署に提出してください。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">!</span>
                  <span>
                    簡易課税を選択すると、原則として<strong>2年間は変更できません</strong>。翌年に仕入が大幅に増えても本則課税に戻せないため、長期的に有利かどうかも検討してください。
                  </span>
                </li>
              </>
            )}
            {winner === "niwari" && niwariEligible && (
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">!</span>
                <span>
                  2割特例は<strong>事前届出不要</strong>です。確定申告書に「2割特例の適用」を記載するだけで適用できます。ただし適用できるのは<strong>2026年9月末までの課税期間</strong>に限られます。
                </span>
              </li>
            )}
            {winner === "honzoku" && (
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">i</span>
                <span>
                  本則課税は<strong>特別な届出は不要</strong>です。ただし仕入税額控除を受けるには、インボイス（適格請求書）の保存が必要です。
                </span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* ===== 各方式の解説 ===== */}
      <div className="space-y-3">
        <Accordion title="本則課税とは">
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              原則的な消費税の計算方法です。売上にかかる消費税から、実際に支払った仕入・経費の消費税を差し引いて納税額を計算します。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-green-800 mb-1">メリット</p>
                <ul className="text-xs text-green-700 space-y-1 list-disc list-inside">
                  <li>仕入・経費が多い場合に有利</li>
                  <li>実態に即した正確な計算</li>
                  <li>設備投資が大きい期に有利</li>
                </ul>
              </div>
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-red-800 mb-1">デメリット</p>
                <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                  <li>仕入の証拠書類・インボイスの保存が必要</li>
                  <li>記帳・管理の負担が大きい</li>
                  <li>仕入率が低い業種では不利</li>
                </ul>
              </div>
            </div>
          </div>
        </Accordion>

        <Accordion title="簡易課税とは">
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              業種ごとに定められた「みなし仕入率」を使って仕入税額控除を計算する方法です。実際の仕入額に関わらず、売上消費税にみなし仕入率を掛けた額を控除できます。
            </p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-amber-50">
                    <th className="text-left px-3 py-2 font-semibold text-amber-800 border border-amber-100">業種</th>
                    <th className="text-center px-3 py-2 font-semibold text-amber-800 border border-amber-100">みなし仕入率</th>
                  </tr>
                </thead>
                <tbody>
                  {INDUSTRIES.map((ind) => (
                    <tr
                      key={ind.id}
                      className={`border border-gray-100 ${ind.id === selectedIndustry ? "bg-amber-50 font-semibold" : ""}`}
                    >
                      <td className="px-3 py-2 text-gray-700 border border-gray-100">{ind.label}</td>
                      <td className="px-3 py-2 text-center text-amber-700 font-medium border border-gray-100">
                        {Math.round(ind.rate * 100)}%
                        {ind.id === selectedIndustry && (
                          <span className="ml-1 text-xs text-amber-500">（選択中）</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-green-800 mb-1">メリット</p>
                <ul className="text-xs text-green-700 space-y-1 list-disc list-inside">
                  <li>記帳・管理が簡単</li>
                  <li>実際の仕入率が低い業種で有利</li>
                  <li>インボイス保存が不要</li>
                </ul>
              </div>
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-red-800 mb-1">デメリット</p>
                <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                  <li>事前届出が必要（前事業年度末まで）</li>
                  <li>選択後2年間は変更不可</li>
                  <li>基準期間5,000万円超は適用不可</li>
                </ul>
              </div>
            </div>
          </div>
        </Accordion>

        <Accordion title="2割特例とは">
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              インボイス制度の開始（2023年10月）を機に免税事業者から課税事業者に転換した事業者向けの経過措置です。売上消費税の20%だけを納税すればよいため、実質的に80%が控除されます。
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mt-2 space-y-1">
              <p className="font-semibold">適用要件</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>2023年10月〜2026年9月の課税期間であること</li>
                <li>インボイス登録によって免税事業者から課税事業者になったこと</li>
                <li>課税期間の途中で選択・変更可能（確定申告時に記載）</li>
              </ul>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-green-800 mb-1">メリット</p>
                <ul className="text-xs text-green-700 space-y-1 list-disc list-inside">
                  <li>事前届出が不要</li>
                  <li>みなし仕入率に関わらず実質80%控除</li>
                  <li>毎年有利な方式を選択可能</li>
                </ul>
              </div>
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-red-800 mb-1">デメリット</p>
                <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                  <li>2026年9月末で終了予定</li>
                  <li>新規に課税事業者になった人のみ対象</li>
                  <li>終了後は本則 or 簡易を再検討する必要あり</li>
                </ul>
              </div>
            </div>
          </div>
        </Accordion>
      </div>

      {/* ===== 免責 + リンク ===== */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3">
        <p className="text-xs text-gray-500">
          本ツールは参考用です。計算結果の正確性・適法性の保証はできません。実際の申告・届出については税理士または所轄の税務署にご相談ください。
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/invoice.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-900 hover:underline transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
            国税庁 インボイス制度
          </a>
          <a
            href="https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/pdf/0023006-031.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-900 hover:underline transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
            国税庁 2割特例について
          </a>
        </div>
      </div>
    </div>
  );
}
