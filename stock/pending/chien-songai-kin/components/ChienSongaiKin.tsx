"use client";

import { useState, useMemo } from "react";

type RateType = "civil" | "commercial" | "wage" | "custom";

const RATE_OPTIONS: { key: RateType; label: string; rate: number }[] = [
  { key: "civil", label: "民法（年3%）", rate: 3 },
  { key: "commercial", label: "商事（年3%）", rate: 3 },
  { key: "wage", label: "賃金・労働（年14.6%）", rate: 14.6 },
  { key: "custom", label: "カスタム", rate: 0 },
];

function formatJPY(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface ResultCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: "green" | "blue" | "red" | "default";
}

function ResultCard({ label, value, sub, highlight = "default" }: ResultCardProps) {
  const colors: Record<string, string> = {
    green: "bg-green-50 border-green-200",
    blue: "bg-blue-50 border-blue-200",
    red: "bg-red-50 border-red-200",
    default: "bg-gray-50 border-gray-200",
  };
  const textColors: Record<string, string> = {
    green: "text-green-700",
    blue: "text-blue-700",
    red: "text-red-700",
    default: "text-gray-800",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 ${colors[highlight]}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${textColors[highlight]}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function ChienSongaiKin() {
  const [principal, setPrincipal] = useState("1000000");
  const [dueDate, setDueDate] = useState("");
  const [calcDate, setCalcDate] = useState(todayString());
  const [rateType, setRateType] = useState<RateType>("civil");
  const [customRate, setCustomRate] = useState("5");

  const effectiveRate = useMemo(() => {
    if (rateType === "custom") return parseFloat(customRate);
    return RATE_OPTIONS.find((o) => o.key === rateType)?.rate ?? 3;
  }, [rateType, customRate]);

  const result = useMemo(() => {
    const p = parseFloat(principal.replace(/,/g, ""));
    const rate = effectiveRate;
    if (!dueDate || !calcDate) return null;
    if (isNaN(p) || p <= 0 || isNaN(rate) || rate <= 0) return null;

    const due = new Date(dueDate);
    const calc = new Date(calcDate);
    const diffMs = calc.getTime() - due.getTime();
    if (diffMs <= 0) return null;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const damage = p * (rate / 100) * (days / 365);
    const total = p + damage;

    return { days, damage, total };
  }, [principal, dueDate, calcDate, effectiveRate]);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 space-y-5">
        <h2 className="text-base font-semibold text-gray-800">遅延損害金 計算ツール</h2>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 元本 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">元本（円）</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="1"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="1000000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-xs text-gray-500 whitespace-nowrap">円</span>
            </div>
          </div>

          {/* 利率 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">利率区分</label>
            <select
              value={rateType}
              onChange={(e) => setRateType(e.target.value as RateType)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {RATE_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* 支払期日 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">支払期日</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 計算日 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">計算日</label>
            <input
              type="date"
              value={calcDate}
              onChange={(e) => setCalcDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* カスタム利率 */}
          {rateType === "custom" && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">カスタム利率（年率%）</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  placeholder="5"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-xs text-gray-500 whitespace-nowrap">%</span>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {result ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ResultCard
                label="遅延日数"
                value={`${result.days.toLocaleString("ja-JP")} 日`}
                sub={`年率 ${effectiveRate}%`}
                highlight="blue"
              />
              <ResultCard
                label="損害金額"
                value={`¥${formatJPY(result.damage)}`}
                sub={`元本 × ${effectiveRate}% × ${result.days}日 ÷ 365`}
                highlight="red"
              />
              <ResultCard
                label="元本 + 損害金 合計"
                value={`¥${formatJPY(result.total)}`}
                sub={`元本 ¥${formatJPY(parseFloat(principal))} + 損害金`}
                highlight="green"
              />
            </div>

            {/* Formula breakdown */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-1.5 text-sm text-gray-600">
              <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">計算内訳</p>
              <p>
                遅延損害金 = 元本（¥{formatJPY(parseFloat(principal))}）× 年率{effectiveRate}% × {result.days}日 ÷ 365日
              </p>
              <p>= ¥{formatJPY(result.damage)}</p>
              <p className="font-medium text-gray-700">
                合計請求額 = ¥{formatJPY(parseFloat(principal))} + ¥{formatJPY(result.damage)} = ¥{formatJPY(result.total)}
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 px-5 py-6 text-center text-sm text-gray-400">
            {!dueDate || !calcDate
              ? "支払期日と計算日を入力してください"
              : result === null && dueDate && calcDate && new Date(calcDate) <= new Date(dueDate)
              ? "計算日は支払期日より後の日付を指定してください"
              : "有効な値を入力してください"}
          </div>
        )}

        {/* Rate reference */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 space-y-1.5 text-sm text-gray-600">
          <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide">利率の目安</p>
          <p>民法（法定利率）：年3%（2020年4月改正）</p>
          <p>商事法定利率：年3%（民法改正に合わせ廃止→民法適用）</p>
          <p>賃金・労働債権：年14.6%（賃確法第6条）</p>
          <p>消費者金融など：契約書記載の利率（上限年20%）</p>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-xs text-yellow-800 leading-relaxed">
          <p className="font-semibold mb-1">免責事項</p>
          <p>
            本ツールの計算結果は参考情報です。実際の請求・訴訟手続きにおいては、適用される法律・契約条件・遅延の起算日等が異なる場合があります。正確な金額については弁護士等の専門家にご相談ください。
          </p>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-300">
        広告スペース
      </div>
    </div>
  );
}
