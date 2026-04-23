"use client";

import { useState, useMemo } from "react";

// 厚労省 派遣労働者のマージン率等の情報提供状況（令和5年度）
// 全産業平均マージン率 約30〜35%
const MOL_MARGIN_AVG = 32; // %
const MOL_MARGIN_MIN = 28;
const MOL_MARGIN_MAX = 38;

type UnitType = "hourly" | "daily" | "monthly";

const inputClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-right text-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent pr-12";

const selectClass =
  "px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent";

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ja-JP");
}

function fmtRate(r: number): string {
  return r.toFixed(1) + "%";
}

// Convert any unit to monthly amount
function toMonthly(value: number, unit: UnitType, workHours: number): number {
  if (unit === "hourly") return value * workHours;
  if (unit === "daily") {
    const daysPerMonth = workHours / 8;
    return value * daysPerMonth;
  }
  return value; // monthly
}

// Convert monthly amount to hourly
function toHourly(monthlyAmount: number, workHours: number): number {
  if (workHours <= 0) return 0;
  return monthlyAmount / workHours;
}

const MARGIN_LEVELS = [20, 25, 30, 32, 35, 40];

export default function HakenHiryou() {
  const [mode, setMode] = useState<"forward" | "reverse">("forward");

  // Forward mode inputs
  const [unitPrice, setUnitPrice] = useState("");
  const [unitType, setUnitType] = useState<UnitType>("monthly");
  const [workHours, setWorkHours] = useState("160");
  const [staffWage, setStaffWage] = useState("");

  // Reverse mode inputs
  const [targetWage, setTargetWage] = useState("");
  const [revWorkHours, setRevWorkHours] = useState("160");

  const result = useMemo(() => {
    const price = parseFloat(unitPrice.replace(/,/g, ""));
    const hours = parseFloat(workHours) || 160;
    const wage = parseFloat(staffWage.replace(/,/g, ""));

    if (!price || price <= 0) return null;

    const monthlySales = toMonthly(price, unitType, hours);
    const hourlyBilling = toHourly(monthlySales, hours);

    if (!wage || wage <= 0) {
      return { monthlySales, hourlyBilling, hours, hasWage: false };
    }

    const monthlyLabor = wage * hours;
    const marginAmount = monthlySales - monthlyLabor;
    const marginRate = (marginAmount / monthlySales) * 100;

    return {
      monthlySales,
      hourlyBilling,
      monthlyLabor,
      marginAmount,
      marginRate,
      hours,
      hasWage: true,
    };
  }, [unitPrice, unitType, workHours, staffWage]);

  const reverseResult = useMemo(() => {
    const wage = parseFloat(targetWage.replace(/,/g, ""));
    const hours = parseFloat(revWorkHours) || 160;
    if (!wage || wage <= 0) return null;

    const monthlyLabor = wage * hours;
    return MARGIN_LEVELS.map((marginPct) => {
      const monthlySales = monthlyLabor / (1 - marginPct / 100);
      const hourlyBilling = toHourly(monthlySales, hours);
      return { marginPct, monthlySales, hourlyBilling };
    });
  }, [targetWage, revWorkHours]);

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("forward")}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === "forward"
                ? "bg-accent text-white"
                : "bg-accent/30 text-muted hover:bg-accent/50"
            }`}
          >
            通常モード
          </button>
          <button
            onClick={() => setMode("reverse")}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              mode === "reverse"
                ? "bg-accent text-white"
                : "bg-accent/30 text-muted hover:bg-accent/50"
            }`}
          >
            逆算モード
          </button>
        </div>
        <p className="text-xs text-muted mt-2">
          {mode === "forward"
            ? "派遣単価とスタッフ時給からマージン率を計算"
            : "希望時給からマージン率別の派遣単価を逆算"}
        </p>
      </div>

      {mode === "forward" ? (
        <>
          {/* Forward: inputs */}
          <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
            <h2 className="font-bold text-base mb-4">派遣単価を入力</h2>

            {/* 単価種別 */}
            <div className="mb-4">
              <label className="block text-xs text-muted mb-1">単価の種類</label>
              <div className="flex gap-2">
                {(["hourly", "daily", "monthly"] as UnitType[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnitType(u)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      unitType === u
                        ? "bg-accent text-white"
                        : "border border-border text-muted hover:bg-accent/20"
                    }`}
                  >
                    {u === "hourly" ? "時間" : u === "daily" ? "日" : "月"}単価
                  </button>
                ))}
              </div>
            </div>

            {/* 派遣単価 */}
            <div className="mb-4">
              <label className="block text-xs text-muted mb-1">
                派遣単価（
                {unitType === "hourly" ? "時間" : unitType === "daily" ? "日" : "月"}
                額）
              </label>
              <div className="relative max-w-[240px]">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={
                    unitType === "hourly"
                      ? "3,000"
                      : unitType === "daily"
                      ? "24,000"
                      : "480,000"
                  }
                  value={unitPrice}
                  onChange={(e) =>
                    setUnitPrice(e.target.value.replace(/[^0-9,]/g, ""))
                  }
                  className={inputClass}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                  円
                </span>
              </div>
            </div>

            {/* 稼働時間/月 */}
            <div className="mb-4">
              <label className="block text-xs text-muted mb-1">稼働時間 / 月</label>
              <div className="flex items-center gap-2">
                <select
                  value={workHours}
                  onChange={(e) => setWorkHours(e.target.value)}
                  className={selectClass}
                >
                  {[120, 140, 160, 168, 176, 180, 200].map((h) => (
                    <option key={h} value={h}>
                      {h}h / 月
                    </option>
                  ))}
                </select>
                <span className="text-xs text-muted">（デフォルト: 160h）</span>
              </div>
            </div>

            {/* スタッフ時給 */}
            <div>
              <label className="block text-xs text-muted mb-1">
                スタッフ時給
                <span className="ml-1 text-muted font-normal">（任意・マージン率計算に使用）</span>
              </label>
              <div className="relative max-w-[240px]">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1,800"
                  value={staffWage}
                  onChange={(e) =>
                    setStaffWage(e.target.value.replace(/[^0-9,]/g, ""))
                  }
                  className={inputClass}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                  円
                </span>
              </div>
            </div>
          </div>

          {/* Forward: results */}
          {result && (
            <>
              {/* 基本換算 */}
              <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
                <h3 className="font-bold text-sm mb-3">月額換算</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-accent/30 rounded-xl p-3">
                    <p className="text-xs text-muted mb-1">月額売上</p>
                    <p className="text-2xl font-bold">¥{fmt(result.monthlySales)}</p>
                    <p className="text-xs text-muted mt-0.5">年間 約¥{fmt(result.monthlySales * 12)}</p>
                  </div>
                  <div className="bg-accent/30 rounded-xl p-3">
                    <p className="text-xs text-muted mb-1">時給換算（請求）</p>
                    <p className="text-2xl font-bold">¥{fmt(result.hourlyBilling)}</p>
                    <p className="text-xs text-muted mt-0.5">{result.hours}h / 月</p>
                  </div>
                </div>
              </div>

              {/* マージン計算（時給入力時のみ） */}
              {result.hasWage && result.marginRate !== undefined && (
                <>
                  <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
                    <h3 className="font-bold text-sm mb-3">マージン率の内訳</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-border">
                          <tr>
                            <td className="py-2.5 text-muted">月額売上</td>
                            <td className="text-right py-2.5 font-mono font-medium">
                              ¥{fmt(result.monthlySales)}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 text-muted">月額人件費（時給 × 稼働時間）</td>
                            <td className="text-right py-2.5 font-mono font-medium text-red-500">
                              − ¥{fmt(result.monthlyLabor!)}
                            </td>
                          </tr>
                          <tr className="border-t-2 border-border">
                            <td className="py-2.5 font-semibold">マージン額</td>
                            <td className="text-right py-2.5 font-mono font-bold">
                              ¥{fmt(result.marginAmount!)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* マージン率の大きな表示 */}
                    <div className="mt-4 text-center">
                      <p className="text-xs text-muted mb-1">マージン率</p>
                      <p
                        className={`text-5xl font-bold ${
                          result.marginRate! > MOL_MARGIN_MAX
                            ? "text-red-500"
                            : result.marginRate! < MOL_MARGIN_MIN
                            ? "text-blue-500"
                            : "text-green-600"
                        }`}
                      >
                        {fmtRate(result.marginRate!)}
                      </p>
                    </div>
                  </div>

                  {/* 比較バーチャート */}
                  <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
                    <h3 className="font-bold text-sm mb-3">厚労省平均との比較</h3>
                    <div className="space-y-3">
                      {/* ユーザーのマージン率 */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted">あなたのマージン率</span>
                          <span className="font-mono font-semibold">
                            {fmtRate(result.marginRate!)}
                          </span>
                        </div>
                        <div className="h-4 bg-accent/20 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              result.marginRate! > MOL_MARGIN_MAX
                                ? "bg-red-500"
                                : result.marginRate! < MOL_MARGIN_MIN
                                ? "bg-blue-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(result.marginRate!, 60) / 60 * 100}%` }}
                          />
                        </div>
                      </div>
                      {/* 厚労省平均 */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted">厚労省平均（〜{MOL_MARGIN_AVG}%）</span>
                          <span className="font-mono font-semibold text-muted">
                            {MOL_MARGIN_MIN}〜{MOL_MARGIN_MAX}%
                          </span>
                        </div>
                        <div className="h-4 bg-accent/20 rounded-full overflow-hidden relative">
                          {/* 平均レンジ帯 */}
                          <div
                            className="h-full bg-gray-400/40 absolute"
                            style={{
                              left: `${MOL_MARGIN_MIN / 60 * 100}%`,
                              width: `${(MOL_MARGIN_MAX - MOL_MARGIN_MIN) / 60 * 100}%`,
                            }}
                          />
                          {/* 平均値ライン */}
                          <div
                            className="h-full w-0.5 bg-gray-500 absolute"
                            style={{ left: `${MOL_MARGIN_AVG / 60 * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted mt-3">
                      {result.marginRate! > MOL_MARGIN_MAX
                        ? `平均（${MOL_MARGIN_AVG}%）より高め。派遣先への単価交渉や時給アップの余地があります。`
                        : result.marginRate! < MOL_MARGIN_MIN
                        ? `平均（${MOL_MARGIN_AVG}%）より低め。採算性の確認を推奨します。`
                        : `厚労省平均（${MOL_MARGIN_MIN}〜${MOL_MARGIN_MAX}%）の範囲内です。`}
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {/* Reverse mode */}
          <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
            <h2 className="font-bold text-base mb-4">希望時給から逆算</h2>

            <div className="mb-4">
              <label className="block text-xs text-muted mb-1">スタッフ希望時給</label>
              <div className="relative max-w-[240px]">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1,800"
                  value={targetWage}
                  onChange={(e) =>
                    setTargetWage(e.target.value.replace(/[^0-9,]/g, ""))
                  }
                  className={inputClass}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                  円
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">稼働時間 / 月</label>
              <select
                value={revWorkHours}
                onChange={(e) => setRevWorkHours(e.target.value)}
                className={selectClass}
              >
                {[120, 140, 160, 168, 176, 180, 200].map((h) => (
                  <option key={h} value={h}>
                    {h}h / 月
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reverse: results table */}
          {reverseResult && (
            <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
              <h3 className="font-bold text-sm mb-3">
                マージン率別の必要派遣単価
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted font-medium">マージン率</th>
                      <th className="text-right py-2 text-muted font-medium">月額単価</th>
                      <th className="text-right py-2 text-muted font-medium">時間単価</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reverseResult.map(({ marginPct, monthlySales, hourlyBilling }) => {
                      const isAvg = marginPct === MOL_MARGIN_AVG;
                      const isInRange = marginPct >= MOL_MARGIN_MIN && marginPct <= MOL_MARGIN_MAX;
                      return (
                        <tr
                          key={marginPct}
                          className={isAvg ? "bg-accent/20" : ""}
                        >
                          <td className="py-2.5">
                            <span
                              className={`font-mono font-semibold ${
                                isAvg ? "text-green-600" : "text-foreground"
                              }`}
                            >
                              {marginPct}%
                            </span>
                            {isAvg && (
                              <span className="ml-1.5 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                                厚労省平均
                              </span>
                            )}
                            {isInRange && !isAvg && (
                              <span className="ml-1.5 text-xs text-muted">平均帯</span>
                            )}
                          </td>
                          <td className="text-right py-2.5 font-mono font-medium">
                            ¥{fmt(monthlySales)}
                          </td>
                          <td className="text-right py-2.5 font-mono">
                            ¥{fmt(hourlyBilling)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted mt-3">
                厚労省が情報公開を義務付けているマージン率は、賃金以外のすべてのコスト（社会保険・有給・管理費等）を含みます。
              </p>
            </div>
          )}
        </>
      )}

      {/* 注意書き */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <p className="text-xs text-muted leading-relaxed">
          ※ 厚労省平均マージン率は令和5年度の全産業平均（約{MOL_MARGIN_MIN}〜{MOL_MARGIN_MAX}%）を参考値として使用しています。実際のマージン率は業種・地域・契約形態により異なります。派遣元は労働者派遣法第23条に基づき、マージン率の情報公開が義務付けられています。
        </p>
      </div>

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center h-24 text-muted text-sm">
        広告
      </div>
    </div>
  );
}
