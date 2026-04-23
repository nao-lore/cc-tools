"use client";

import { useState, useMemo } from "react";

// 給与収入 → 給与所得（給与所得控除後）
function kyuyoShotoku(kyuyo: number): number {
  if (kyuyo <= 550_000) return 0;
  if (kyuyo <= 1_625_000) return kyuyo - 550_000;
  if (kyuyo <= 1_800_000) return kyuyo * 0.6 - 100_000; // approx
  if (kyuyo <= 3_600_000) return kyuyo * 0.7 - 80_000;  // actually 0.7 + 80k subtracted
  if (kyuyo <= 6_600_000) return kyuyo * 0.8 - 440_000;
  if (kyuyo <= 8_500_000) return kyuyo * 0.9 - 1_100_000;
  return kyuyo - 1_950_000;
}

// 扶養区分
type FuyouCategory =
  | "nennsho"      // 年少扶養（16歳未満）→控除なし
  | "ippan"        // 一般扶養（16〜18歳）→38万
  | "tokutei"      // 特定扶養（19〜22歳）→63万
  | "ippan_elder"  // 一般扶養（23〜69歳）→38万
  | "roujin_doukyo"  // 老人扶養・同居（70歳以上）→58万
  | "rouijn_sonota";  // 老人扶養・その他（70歳以上）→48万

interface CategoryInfo {
  label: string;
  amount: number;
  description: string;
}

const CATEGORY_INFO: Record<FuyouCategory, CategoryInfo> = {
  nennsho: { label: "年少扶養", amount: 0, description: "16歳未満のため控除なし" },
  ippan: { label: "一般扶養", amount: 380_000, description: "16〜18歳" },
  tokutei: { label: "特定扶養", amount: 630_000, description: "19〜22歳（特定扶養）" },
  ippan_elder: { label: "一般扶養", amount: 380_000, description: "23〜69歳" },
  rouijn_sonota: { label: "老人扶養（同居以外）", amount: 480_000, description: "70歳以上・別居" },
  rouijn_doukyo: { label: "老人扶養（同居老親）", amount: 580_000, description: "70歳以上・同居" },
};

interface Dependent {
  id: number;
  name: string;
  ageMode: "dob" | "age"; // 入力モード
  dob: string;            // YYYY-MM-DD
  ageStr: string;         // 直接入力の年齢
  income: string;         // 年間給与収入（万円）
  doukyo: boolean;        // 同居かどうか（70歳以上のみ有効）
}

interface DependentResult {
  dependent: Dependent;
  age: number | null;
  category: FuyouCategory | null;
  incomeOk: boolean;
  applicable: boolean;
  amount: number;
}

function calcAge(dob: string): number | null {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age < 0 ? 0 : age;
}

function getCategory(age: number, doukyo: boolean): FuyouCategory {
  if (age < 16) return "nennsho";
  if (age <= 18) return "ippan";
  if (age <= 22) return "tokutei";
  if (age <= 69) return "ippan_elder";
  return doukyo ? "rouijn_doukyo" : "rouijn_sonota";
}

function checkIncome(incomeStr: string): { ok: boolean; shotoku: number | null } {
  if (!incomeStr) return { ok: true, shotoku: null }; // 未入力は不問
  const kyuyo = parseFloat(incomeStr) * 10_000;
  if (isNaN(kyuyo) || kyuyo < 0) return { ok: false, shotoku: null };
  const shotoku = kyuyoShotoku(kyuyo);
  // 所得48万以下（給与収入103万以下に相当）
  return { ok: shotoku <= 480_000, shotoku };
}

function fmt(n: number): string {
  return n.toLocaleString("ja-JP");
}

let nextId = 1;

function newDependent(): Dependent {
  return {
    id: nextId++,
    name: "",
    ageMode: "age",
    dob: "",
    ageStr: "",
    income: "",
    doukyo: false,
  };
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40";
const selectClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40";

export default function FuyouKoujoHantei() {
  const [dependents, setDependents] = useState<Dependent[]>([newDependent()]);

  function update(id: number, patch: Partial<Dependent>) {
    setDependents((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
  }

  function addDependent() {
    setDependents((prev) => [...prev, newDependent()]);
  }

  function removeDependent(id: number) {
    setDependents((prev) => prev.filter((d) => d.id !== id));
  }

  const results: DependentResult[] = useMemo(() => {
    return dependents.map((d) => {
      // 年齢を確定
      let age: number | null = null;
      if (d.ageMode === "dob") {
        age = calcAge(d.dob);
      } else {
        const parsed = parseInt(d.ageStr, 10);
        age = isNaN(parsed) || parsed < 0 ? null : parsed;
      }

      if (age === null) {
        return { dependent: d, age: null, category: null, incomeOk: true, applicable: false, amount: 0 };
      }

      const category = getCategory(age, d.doukyo);
      const { ok: incomeOk } = checkIncome(d.income);
      const info = CATEGORY_INFO[category];
      const applicable = incomeOk && info.amount > 0;

      return {
        dependent: d,
        age,
        category,
        incomeOk,
        applicable,
        amount: applicable ? info.amount : 0,
      };
    });
  }, [dependents]);

  const totalAmount = useMemo(
    () => results.reduce((sum, r) => sum + r.amount, 0),
    [results]
  );

  const hasAnyResult = results.some((r) => r.age !== null);

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-8">
      {/* Header */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
        <h2 className="font-bold text-base mb-1">扶養控除 判定ツール</h2>
        <p className="text-xs text-muted">
          扶養親族の年齢・年収から、扶養控除の区分と控除額を自動判定します。
        </p>
      </div>

      {/* Dependents */}
      <div className="space-y-3">
        {dependents.map((d, idx) => (
          <div
            key={d.id}
            className="bg-surface rounded-2xl border border-border p-4 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">扶養親族 {idx + 1}</span>
              {dependents.length > 1 && (
                <button
                  onClick={() => removeDependent(d.id)}
                  className="text-xs text-muted hover:text-red-500 transition-colors"
                >
                  削除
                </button>
              )}
            </div>

            {/* 名前（任意） */}
            <div>
              <label className="block text-xs text-muted mb-1">氏名（任意）</label>
              <input
                type="text"
                placeholder="例：山田 太郎"
                value={d.name}
                onChange={(e) => update(d.id, { name: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* 年齢入力モード */}
            <div>
              <label className="block text-xs text-muted mb-1">年齢の入力方法</label>
              <div className="flex gap-2">
                {(["age", "dob"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => update(d.id, { ageMode: mode })}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                      d.ageMode === mode
                        ? "bg-accent text-white border-accent"
                        : "bg-background border-border text-muted hover:border-accent/50"
                    }`}
                  >
                    {mode === "age" ? "年齢を直接入力" : "生年月日から計算"}
                  </button>
                ))}
              </div>
            </div>

            {d.ageMode === "age" ? (
              <div>
                <label className="block text-xs text-muted mb-1">年齢</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={d.ageStr}
                    onChange={(e) =>
                      update(d.id, { ageStr: e.target.value.replace(/[^0-9]/g, "") })
                    }
                    className={inputClass}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                    歳
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs text-muted mb-1">生年月日</label>
                <input
                  type="date"
                  value={d.dob}
                  onChange={(e) => update(d.id, { dob: e.target.value })}
                  className={inputClass}
                />
              </div>
            )}

            {/* 同居フラグ（70歳以上のみ表示） */}
            {(() => {
              const age =
                d.ageMode === "dob"
                  ? calcAge(d.dob)
                  : parseInt(d.ageStr, 10) || null;
              if (age !== null && age >= 70) {
                return (
                  <div>
                    <label className="block text-xs text-muted mb-1">
                      同居の有無（70歳以上の場合）
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: false, label: "別居・その他" },
                        { value: true, label: "同居老親" },
                      ].map(({ value, label }) => (
                        <button
                          key={label}
                          onClick={() => update(d.id, { doukyo: value })}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                            d.doukyo === value
                              ? "bg-accent text-white border-accent"
                              : "bg-background border-border text-muted hover:border-accent/50"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* 年間収入 */}
            <div>
              <label className="block text-xs text-muted mb-1">
                年間給与収入（任意）
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="103以下で扶養対象"
                  value={d.income}
                  onChange={(e) =>
                    update(d.id, { income: e.target.value.replace(/[^0-9.]/g, "") })
                  }
                  className={inputClass}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                  万円
                </span>
              </div>
              <p className="text-xs text-muted mt-1">
                給与収入103万円以下（所得48万円以下）が扶養の条件
              </p>
            </div>

            {/* インライン結果 */}
            {(() => {
              const r = results[idx];
              if (r.age === null) return null;
              const info = r.category ? CATEGORY_INFO[r.category] : null;
              return (
                <div
                  className={`rounded-xl p-3 text-sm ${
                    r.applicable
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">
                      {info?.label ?? "—"}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        r.applicable
                          ? "bg-green-600 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {r.applicable ? "適用あり" : "適用なし"}
                    </span>
                  </div>
                  <div className="text-xs text-muted space-y-0.5">
                    <p>年齢: {r.age}歳 — {info?.description}</p>
                    {!r.incomeOk && (
                      <p className="text-red-600">収入が103万円を超えているため対象外</p>
                    )}
                    {r.category === "nennsho" && (
                      <p>16歳未満は扶養控除の対象外（児童手当の対象）</p>
                    )}
                    {r.applicable && (
                      <p className="text-green-700 font-semibold">
                        控除額: {fmt(r.amount)} 円
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        ))}
      </div>

      {/* Add button */}
      <button
        onClick={addDependent}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-sm text-muted hover:border-accent/50 hover:text-accent transition-all"
      >
        ＋ 扶養親族を追加
      </button>

      {/* Total */}
      {hasAnyResult && (
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs text-muted mb-1">扶養控除 合計額（目安）</p>
          <p className="text-4xl font-bold text-accent">
            {fmt(totalAmount)}
            <span className="text-xl ml-1 font-normal">円</span>
          </p>
          <div className="mt-3 divide-y divide-border">
            {results.map((r, idx) => {
              if (r.age === null) return null;
              const info = r.category ? CATEGORY_INFO[r.category] : null;
              const name = r.dependent.name || `扶養親族 ${idx + 1}`;
              return (
                <div key={r.dependent.id} className="flex justify-between items-center py-2.5">
                  <span className="text-sm text-muted">{name}（{r.age}歳・{info?.label}）</span>
                  <span className={`text-sm font-medium ${r.applicable ? "" : "text-muted line-through"}`}>
                    {fmt(r.amount)} 円
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted mt-3">
            ※ 所得税の扶養控除額の目安です。実際の節税額は税率によって異なります。
          </p>
        </div>
      )}

      {/* 区分早見表 */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
        <h3 className="font-bold text-sm mb-3">扶養控除 区分早見表</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted font-medium">区分</th>
                <th className="text-left py-2 text-muted font-medium">年齢</th>
                <th className="text-right py-2 text-muted font-medium">控除額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { label: "年少扶養", age: "16歳未満", amount: "0円（対象外）" },
                { label: "一般扶養", age: "16〜18歳", amount: "38万円" },
                { label: "特定扶養", age: "19〜22歳", amount: "63万円" },
                { label: "一般扶養", age: "23〜69歳", amount: "38万円" },
                { label: "老人扶養（別居）", age: "70歳以上", amount: "48万円" },
                { label: "老人扶養（同居）", age: "70歳以上", amount: "58万円" },
              ].map((row) => (
                <tr key={row.label + row.age}>
                  <td className="py-2">{row.label}</td>
                  <td className="py-2 text-muted">{row.age}</td>
                  <td className="py-2 text-right font-medium">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-2">
          ※ 収入条件：給与収入103万円以下（所得48万円以下）が必要
        </p>
      </div>

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center h-20 text-xs text-muted">
        広告
      </div>
    </div>
  );
}
