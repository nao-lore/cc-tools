"use client";

import { useState, useMemo } from "react";

// --- 所得税率テーブル（速算表） ---
const PROGRESSIVE_TAX = [
  { max: 1_950_000,  rate: 0.05,  deduct: 0 },
  { max: 3_300_000,  rate: 0.10,  deduct: 97_500 },
  { max: 6_950_000,  rate: 0.20,  deduct: 427_500 },
  { max: 9_000_000,  rate: 0.23,  deduct: 636_000 },
  { max: 18_000_000, rate: 0.33,  deduct: 1_536_000 },
  { max: 40_000_000, rate: 0.40,  deduct: 2_796_000 },
  { max: Infinity,   rate: 0.45,  deduct: 4_796_000 },
] as const;

// 住民税率（概算）
const JUMIN_TAX_RATE = 0.10;
// 基礎控除
const BASIC_DEDUCTION = 480_000;

// --- 按分タイプ ---
type RatioMethod = "area" | "time" | "usage";

// --- 費目定義 ---
type ExpenseCategory =
  | "rent"
  | "electricity"
  | "gas"
  | "water"
  | "internet"
  | "phone"
  | "vehicle";

interface ExpenseItem {
  id: ExpenseCategory;
  name: string;
  icon: string;
  defaultMethod: RatioMethod;
  methodOptions: RatioMethod[];
  defaultRatio: number; // %
  ratioHint: string;
  placeholder: string;
}

const EXPENSE_ITEMS: ExpenseItem[] = [
  {
    id: "rent",
    name: "家賃",
    icon: "🏠",
    defaultMethod: "area",
    methodOptions: ["area"],
    defaultRatio: 20,
    ratioHint: "在宅フリーランスの一般的な目安: 15〜30%",
    placeholder: "80,000",
  },
  {
    id: "electricity",
    name: "電気代",
    icon: "⚡",
    defaultMethod: "time",
    methodOptions: ["time", "area"],
    defaultRatio: 30,
    ratioHint: "在宅フリーランスの一般的な目安: 20〜50%",
    placeholder: "8,000",
  },
  {
    id: "gas",
    name: "ガス代",
    icon: "🔥",
    defaultMethod: "usage",
    methodOptions: ["usage", "area"],
    defaultRatio: 5,
    ratioHint: "業務での使用は少ないため低め推奨: 5〜10%",
    placeholder: "5,000",
  },
  {
    id: "water",
    name: "水道代",
    icon: "💧",
    defaultMethod: "usage",
    methodOptions: ["usage", "area"],
    defaultRatio: 5,
    ratioHint: "業務での使用は少ないため低め推奨: 5〜10%",
    placeholder: "3,000",
  },
  {
    id: "internet",
    name: "通信費（インターネット）",
    icon: "🌐",
    defaultMethod: "time",
    methodOptions: ["time", "usage"],
    defaultRatio: 50,
    ratioHint: "業務利用が主なら高め: 50〜100%",
    placeholder: "5,500",
  },
  {
    id: "phone",
    name: "携帯電話",
    icon: "📱",
    defaultMethod: "usage",
    methodOptions: ["usage", "time"],
    defaultRatio: 50,
    ratioHint: "業務での通話・連絡割合で: 30〜70%",
    placeholder: "8,000",
  },
  {
    id: "vehicle",
    name: "車両費（ガソリン・保険・駐車場）",
    icon: "🚗",
    defaultMethod: "usage",
    methodOptions: ["usage"],
    defaultRatio: 30,
    ratioHint: "走行距離按分が推奨: 事業走行距離 ÷ 総走行距離",
    placeholder: "20,000",
  },
];

const METHOD_LABELS: Record<RatioMethod, string> = {
  area: "面積按分",
  time: "時間按分",
  usage: "使用量按分",
};

// --- 状態型 ---
interface ItemState {
  enabled: boolean;
  monthlyAmount: string;
  ratio: number; // %
  method: RatioMethod;
}

// --- ユーティリティ ---
function fmtJPY(n: number): string {
  if (n === 0) return "0円";
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function fmtMan(n: number): string {
  const man = n / 10_000;
  if (man >= 1) return `${man.toFixed(1)}万円`;
  return fmtJPY(n);
}

function parseAmount(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  return parseInt(cleaned, 10);
}

function handleNumericInput(
  setter: (v: string) => void
): React.ChangeEventHandler<HTMLInputElement> {
  return (e) => {
    const raw = e.target.value.replace(/,/g, "").replace(/[^\d]/g, "");
    setter(raw ? parseInt(raw, 10).toLocaleString("ja-JP") : "");
  };
}

function calcProgressiveTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  const bracket = PROGRESSIVE_TAX.find((b) => taxableIncome <= b.max)!;
  return Math.max(0, Math.floor(taxableIncome * bracket.rate - bracket.deduct));
}

function getTaxRate(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0.05;
  const bracket = PROGRESSIVE_TAX.find((b) => taxableIncome <= b.max)!;
  return bracket.rate;
}

// --- デフォルト状態生成 ---
function buildDefaultState(): Record<ExpenseCategory, ItemState> {
  const result = {} as Record<ExpenseCategory, ItemState>;
  for (const item of EXPENSE_ITEMS) {
    result[item.id] = {
      enabled: ["rent", "electricity", "internet"].includes(item.id),
      monthlyAmount: "",
      ratio: item.defaultRatio,
      method: item.defaultMethod,
    };
  }
  return result;
}

// --- メインコンポーネント ---
export default function KajiAnbun() {
  const [items, setItems] = useState<Record<ExpenseCategory, ItemState>>(buildDefaultState);
  const [incomeInput, setIncomeInput] = useState("");
  const [showHints, setShowHints] = useState<ExpenseCategory | null>(null);

  const income = parseAmount(incomeInput);

  // 各費目の按分計算
  const calculated = useMemo(() => {
    return EXPENSE_ITEMS.map((item) => {
      const state = items[item.id];
      const monthly = parseAmount(state.monthlyAmount);
      const ratio = state.ratio / 100;
      const monthlyExpense = Math.floor(monthly * ratio);
      const annualExpense = monthlyExpense * 12;
      return {
        id: item.id,
        monthly,
        ratio: state.ratio,
        monthlyExpense,
        annualExpense,
        enabled: state.enabled,
      };
    });
  }, [items]);

  // 合計
  const totals = useMemo(() => {
    const enabled = calculated.filter((c) => c.enabled);
    const monthlyTotal = enabled.reduce((s, c) => s + c.monthlyExpense, 0);
    const annualTotal = enabled.reduce((s, c) => s + c.annualExpense, 0);
    return { monthlyTotal, annualTotal };
  }, [calculated]);

  // 節税効果計算
  const taxEffect = useMemo(() => {
    if (income <= 0 || totals.annualTotal <= 0) return null;
    const taxableWithout = Math.max(0, income - BASIC_DEDUCTION);
    const taxableWith = Math.max(0, income - totals.annualTotal - BASIC_DEDUCTION);
    const taxWithout = calcProgressiveTax(taxableWithout) + Math.floor(taxableWithout * JUMIN_TAX_RATE);
    const taxWith = calcProgressiveTax(taxableWith) + Math.floor(taxableWith * JUMIN_TAX_RATE);
    const savings = Math.max(0, taxWithout - taxWith);
    const marginalRate = getTaxRate(taxableWithout) + JUMIN_TAX_RATE;
    return { taxWithout, taxWith, savings, marginalRate };
  }, [income, totals.annualTotal]);

  function updateItem(id: ExpenseCategory, patch: Partial<ItemState>) {
    setItems((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  return (
    <div className="space-y-6">

      {/* ===== 費目リスト ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shrink-0">1</span>
          <h2 className="text-lg font-semibold text-gray-800">費目と月額・按分率を入力</h2>
        </div>
        <p className="text-xs text-gray-500 mb-5 ml-9">経費にする費目をONにして月額と按分率を設定してください</p>

        <div className="space-y-3">
          {EXPENSE_ITEMS.map((item) => {
            const state = items[item.id];
            const calc = calculated.find((c) => c.id === item.id)!;
            const isHintOpen = showHints === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-xl border-2 transition-all ${
                  state.enabled
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-gray-200 bg-gray-50 opacity-60"
                }`}
              >
                {/* ヘッダー行 */}
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* トグル */}
                  <button
                    onClick={() => updateItem(item.id, { enabled: !state.enabled })}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                      state.enabled ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                    aria-label={state.enabled ? "無効にする" : "有効にする"}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        state.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>

                  <span className="text-xl shrink-0">{item.icon}</span>
                  <span className="font-semibold text-gray-800 text-sm flex-1">{item.name}</span>

                  {state.enabled && calc.annualExpense > 0 && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full shrink-0">
                      年 {fmtMan(calc.annualExpense)}
                    </span>
                  )}
                </div>

                {/* 入力行（有効時のみ） */}
                {state.enabled && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {/* 月額入力 */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">月額</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={state.monthlyAmount}
                            onChange={handleNumericInput((v) => updateItem(item.id, { monthlyAmount: v }))}
                            placeholder={item.placeholder}
                            className="flex-1 min-w-0 px-3 py-2 text-right font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-sm bg-white"
                          />
                          <span className="text-gray-500 text-xs shrink-0">円</span>
                        </div>
                      </div>

                      {/* 按分率 */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-gray-600">
                            {METHOD_LABELS[state.method]}
                          </label>
                          <button
                            onClick={() => setShowHints(isHintOpen ? null : item.id)}
                            className="text-xs text-emerald-600 hover:text-emerald-800 underline"
                          >
                            目安
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={state.ratio}
                            onChange={(e) => updateItem(item.id, { ratio: parseInt(e.target.value) })}
                            className="flex-1 accent-emerald-500"
                          />
                          <span className="text-sm font-bold text-emerald-700 w-10 text-right shrink-0">
                            {state.ratio}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 按分方式選択（複数ある場合） */}
                    {item.methodOptions.length > 1 && (
                      <div className="flex gap-2">
                        {item.methodOptions.map((method) => (
                          <button
                            key={method}
                            onClick={() => updateItem(item.id, { method })}
                            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                              state.method === method
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white text-gray-600 border-gray-300 hover:border-emerald-400"
                            }`}
                          >
                            {METHOD_LABELS[method]}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* 目安ヒント */}
                    {isHintOpen && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                        {item.ratioHint}
                      </div>
                    )}

                    {/* 計算結果行 */}
                    {calc.monthly > 0 && (
                      <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-emerald-200">
                        <span className="text-xs text-gray-500">
                          {fmtJPY(calc.monthly)} × {state.ratio}%
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-emerald-700">
                            月 {fmtJPY(calc.monthlyExpense)}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">
                            / 年 {fmtMan(calc.annualExpense)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== 合計表示 ===== */}
      {totals.annualTotal > 0 && (
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white">
          <h2 className="text-base font-semibold opacity-90 mb-4">経費計上できる金額（按分後）</h2>

          <div className="text-center mb-5">
            <div className="text-xs opacity-75 mb-1">年間経費合計</div>
            <div className="text-5xl font-bold">{fmtMan(totals.annualTotal)}</div>
            <div className="text-sm opacity-75 mt-1">月額 {fmtJPY(totals.monthlyTotal)}</div>
          </div>

          {/* 費目別内訳 */}
          <div className="space-y-2 mb-4">
            {calculated
              .filter((c) => c.enabled && c.annualExpense > 0)
              .map((c) => {
                const item = EXPENSE_ITEMS.find((i) => i.id === c.id)!;
                const barW = Math.min(100, Math.round((c.annualExpense / totals.annualTotal) * 100));
                return (
                  <div key={c.id} className="bg-white bg-opacity-15 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium flex items-center gap-1.5">
                        <span>{item.icon}</span>
                        {item.name}
                        <span className="text-xs opacity-75">({c.ratio}%)</span>
                      </span>
                      <span className="text-sm font-bold">{fmtMan(c.annualExpense)}</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-20 rounded-full h-1.5">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${barW}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ===== 節税効果 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center shrink-0">2</span>
          <h2 className="text-lg font-semibold text-gray-800">節税効果を確認（任意）</h2>
        </div>
        <p className="text-xs text-gray-500 mb-5 ml-9">年間事業所得（経費計上前）を入力すると節税額を概算します</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">年間事業所得（経費計上前）</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={incomeInput}
              onChange={handleNumericInput(setIncomeInput)}
              placeholder="5,000,000"
              className="flex-1 px-4 py-3 text-right text-xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            />
            <span className="text-gray-600 font-medium text-lg shrink-0">円</span>
          </div>
        </div>

        {taxEffect && totals.annualTotal > 0 && (
          <div className="mt-4 space-y-3">
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-center">
              <div className="text-xs text-emerald-700 mb-1">年間節税額（所得税+住民税・概算）</div>
              <div className="text-4xl font-bold text-emerald-700">{fmtMan(taxEffect.savings)}</div>
              <div className="text-xs text-emerald-600 mt-1">
                実効税率 {Math.round(taxEffect.marginalRate * 100)}% × 経費 {fmtMan(totals.annualTotal)}
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: "経費計上なしの場合の税負担", value: taxEffect.taxWithout, highlight: false },
                { label: `家事按分 ${fmtMan(totals.annualTotal)} を経費計上後`, value: taxEffect.taxWith, highlight: true },
              ].map(({ label, value, highlight }) => (
                <div
                  key={label}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                    highlight ? "bg-emerald-50 border border-emerald-200" : "bg-gray-50"
                  }`}
                >
                  <span className={`text-sm ${highlight ? "font-semibold text-emerald-800" : "text-gray-600"}`}>
                    {label}
                  </span>
                  <span className={`text-sm font-bold ${highlight ? "text-emerald-700" : "text-gray-800"}`}>
                    {fmtJPY(value)}
                  </span>
                </div>
              ))}

              <div className="flex items-center justify-between px-4 py-3 bg-emerald-600 rounded-xl text-white">
                <span className="text-sm font-bold">節税額（概算）</span>
                <span className="text-lg font-bold">{fmtMan(taxEffect.savings)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              ※ 所得税（累進課税）+ 住民税（所得割10%）の概算。基礎控除48万円のみ適用。
            </p>
          </div>
        )}

        {totals.annualTotal === 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-400">
            費目の月額を入力すると節税効果が表示されます
          </div>
        )}
      </div>

      {/* ===== 按分の考え方ガイド ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">按分の考え方（国税庁準拠）</h2>

        <div className="space-y-3">
          {[
            {
              method: "面積按分",
              icon: "📐",
              desc: "事業専用スペースの面積 ÷ 自宅の総面積",
              example: "例: 部屋6畳 / 自宅30畳 = 20%",
              color: "bg-blue-50 border-blue-200 text-blue-800",
            },
            {
              method: "時間按分",
              icon: "⏱️",
              desc: "事業での使用時間 ÷ 総使用可能時間",
              example: "例: 業務8時間 / 在宅16時間 = 50%",
              color: "bg-purple-50 border-purple-200 text-purple-800",
            },
            {
              method: "使用量按分",
              icon: "📊",
              desc: "事業での使用量 ÷ 総使用量（走行距離・通話時間等）",
              example: "例: 事業走行100km / 総走行300km = 33%",
              color: "bg-amber-50 border-amber-200 text-amber-800",
            },
          ].map(({ method, icon, desc, example, color }) => (
            <div key={method} className={`p-4 rounded-xl border ${color}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{icon}</span>
                <span className="font-semibold text-sm">{method}</span>
              </div>
              <p className="text-xs mb-1 ml-7">{desc}</p>
              <p className="text-xs opacity-75 ml-7">{example}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
          <p className="font-semibold">税務調査での注意点</p>
          <p>按分の根拠（面積図面・タイムシート・走行距録等）を記録・保存しておくことを推奨します。事業専用スペースがない場合でも、使用実態に合った合理的な割合であれば認められます。</p>
        </div>
      </div>

      {/* ===== 免責 + 国税庁リンク ===== */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3">
        <p className="text-xs text-gray-500">
          本ツールは概算計算を目的としており、実際の経費計上額・税額と異なる場合があります。
          節税効果は所得税（累進課税）と住民税（所得割）の簡易計算です。社会保険料控除・配偶者控除等は考慮していません。
          正確な判断は税理士等の専門家または国税庁の確定申告書等作成コーナーをご利用ください。
        </p>
        <div className="flex flex-col gap-1.5">
          {[
            {
              href: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2210.htm",
              label: "国税庁「必要経費」（家事費との区分）を確認する",
            },
            {
              href: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2210_qa.htm",
              label: "国税庁「家事関連費の必要経費算入」Q&Aを確認する",
            },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-800 hover:underline transition-colors"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
