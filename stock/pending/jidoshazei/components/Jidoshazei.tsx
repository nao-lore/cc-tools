"use client";

import { useState, useMemo } from "react";

// 自動車税額テーブル（2019年10月以降登録・新税率 / 以前登録・旧税率）
// 普通車: [排気量上限cc, 新税率, 旧税率]
const TAX_TABLE: { label: string; maxCc: number; newRate: number; oldRate: number }[] = [
  { label: "1,000cc以下",       maxCc: 1000, newRate: 25_000, oldRate: 29_500 },
  { label: "1,000〜1,500cc",    maxCc: 1500, newRate: 30_500, oldRate: 34_500 },
  { label: "1,500〜2,000cc",    maxCc: 2000, newRate: 36_000, oldRate: 39_500 },
  { label: "2,000〜2,500cc",    maxCc: 2500, newRate: 43_500, oldRate: 45_000 },
  { label: "2,500〜3,000cc",    maxCc: 3000, newRate: 50_000, oldRate: 51_000 },
  { label: "3,000〜3,500cc",    maxCc: 3500, newRate: 57_000, oldRate: 58_000 },
  { label: "3,500〜4,000cc",    maxCc: 4000, newRate: 65_500, oldRate: 66_500 },
  { label: "4,000〜4,500cc",    maxCc: 4500, newRate: 75_500, oldRate: 76_500 },
  { label: "4,500〜6,000cc",    maxCc: 6000, newRate: 87_000, oldRate: 88_000 },
  { label: "6,000cc超",         maxCc: Infinity, newRate: 110_000, oldRate: 111_000 },
];

// 軽自動車税
const KEI_TAX = 10_800;
// 13年超重課率
const JUUKA_RATE = 1.15;

type CarType = "futsuu" | "kei";
type RegistrationEra = "new" | "old";
type EvOption = "none" | "ev";

function fmt(n: number): string {
  return n.toLocaleString("ja-JP");
}

function calcTax(
  ccIndex: number,
  carType: CarType,
  era: RegistrationEra,
  juuka: boolean,
  ev: EvOption,
): number {
  if (carType === "kei") {
    let base = KEI_TAX;
    if (juuka) base = Math.floor(base * JUUKA_RATE);
    if (ev === "ev") base = Math.floor(base * 0.25);
    return base;
  }
  const row = TAX_TABLE[ccIndex];
  let base = era === "new" ? row.newRate : row.oldRate;
  if (juuka) base = Math.floor(base * JUUKA_RATE);
  if (ev === "ev") base = Math.floor(base * 0.25);
  return base;
}

const selectClass =
  "w-full px-3 py-2.5 border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-background";

const btnClass = (active: boolean) =>
  `flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
    active
      ? "bg-accent text-white border-accent"
      : "bg-background border-border text-muted hover:border-accent/50"
  }`;

export default function Jidoshazei() {
  const [ccIndex, setCcIndex] = useState(1); // デフォルト: 1000〜1500cc
  const [carType, setCarType] = useState<CarType>("futsuu");
  const [era, setEra] = useState<RegistrationEra>("new");
  const [juuka, setJuuka] = useState(false);
  const [ev, setEv] = useState<EvOption>("none");

  const result = useMemo(
    () => calcTax(ccIndex, carType, era, juuka, ev),
    [ccIndex, carType, era, juuka, ev],
  );

  // 参考: 減免なし・重課なしの基準額
  const baseAmount = useMemo(() => {
    if (carType === "kei") return KEI_TAX;
    const row = TAX_TABLE[ccIndex];
    return era === "new" ? row.newRate : row.oldRate;
  }, [ccIndex, carType, era]);

  const showEvNote = ev === "ev";
  const showJuukaNote = juuka;

  return (
    <div className="space-y-4">
      {/* 入力カード */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm space-y-4">
        <h2 className="font-bold text-base">条件を入力</h2>

        {/* 車種 */}
        <div>
          <p className="text-xs text-muted mb-2">車種</p>
          <div className="flex gap-2">
            <button onClick={() => setCarType("futsuu")} className={btnClass(carType === "futsuu")}>
              普通車
            </button>
            <button onClick={() => setCarType("kei")} className={btnClass(carType === "kei")}>
              軽自動車
            </button>
          </div>
        </div>

        {/* 排気量（普通車のみ） */}
        {carType === "futsuu" && (
          <div>
            <label className="block text-xs text-muted mb-1">排気量</label>
            <select
              value={ccIndex}
              onChange={(e) => setCcIndex(Number(e.target.value))}
              className={selectClass}
            >
              {TAX_TABLE.map((row, i) => (
                <option key={i} value={i}>
                  {row.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 登録年（普通車のみ） */}
        {carType === "futsuu" && (
          <div>
            <p className="text-xs text-muted mb-2">初回登録年</p>
            <div className="flex gap-2">
              <button onClick={() => setEra("new")} className={btnClass(era === "new")}>
                2019年10月以降
              </button>
              <button onClick={() => setEra("old")} className={btnClass(era === "old")}>
                2019年9月以前
              </button>
            </div>
          </div>
        )}

        {/* 13年超重課 */}
        <div>
          <p className="text-xs text-muted mb-2">車齢</p>
          <div className="flex gap-2">
            <button onClick={() => setJuuka(false)} className={btnClass(!juuka)}>
              13年以内
            </button>
            <button onClick={() => setJuuka(true)} className={btnClass(juuka)}>
              13年超（重課+15%）
            </button>
          </div>
        </div>

        {/* EV/PHEV減免 */}
        <div>
          <p className="text-xs text-muted mb-2">EV・PHEV（グリーン化特例）</p>
          <div className="flex gap-2">
            <button onClick={() => setEv("none")} className={btnClass(ev === "none")}>
              該当なし
            </button>
            <button onClick={() => setEv("ev")} className={btnClass(ev === "ev")}>
              EV・PHEV（概算75%減）
            </button>
          </div>
          {showEvNote && (
            <p className="text-xs text-muted mt-1">
              ※ グリーン化特例は翌年度のみ適用。減免率は車両により異なります。
            </p>
          )}
        </div>
      </div>

      {/* 結果カード */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm space-y-3">
        <div className="bg-accent/10 rounded-xl p-4">
          <p className="text-xs text-muted mb-1">自動車税 年額（目安）</p>
          <p className="text-4xl font-bold text-accent">
            {fmt(result)}
            <span className="text-xl ml-1 font-normal">円</span>
          </p>
          <p className="text-sm text-muted mt-1">
            月額換算: 約 {fmt(Math.round(result / 12))} 円
          </p>
        </div>

        {/* 内訳 */}
        <div className="space-y-1">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm text-muted">基準税額</span>
            <span className="text-sm font-mono">{fmt(baseAmount)} 円</span>
          </div>
          {showJuukaNote && (
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted">13年超重課（+15%）</span>
              <span className="text-sm font-mono text-red-500">
                +{fmt(Math.floor(baseAmount * 0.15))} 円
              </span>
            </div>
          )}
          {showEvNote && (
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted">EV・PHEV減免（概算75%減）</span>
              <span className="text-sm font-mono text-green-600">
                -{fmt(baseAmount - result + (juuka ? Math.floor(baseAmount * 0.15) : 0))} 円
              </span>
            </div>
          )}
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-semibold">合計年額</span>
            <span className="text-sm font-mono font-bold">{fmt(result)} 円</span>
          </div>
        </div>

        <p className="text-xs text-muted">
          ※ 本計算は概算です。実際の税額は都道府県の納税通知書をご確認ください。
        </p>
      </div>

      {/* 税率一覧（普通車） */}
      {carType === "futsuu" && (
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
          <h3 className="font-bold text-sm mb-3">普通車 税率一覧</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 text-muted font-medium">排気量</th>
                  <th className="text-right py-1.5 text-muted font-medium">新税率<br/><span className="font-normal">（19年10月以降）</span></th>
                  <th className="text-right py-1.5 text-muted font-medium">旧税率<br/><span className="font-normal">（19年9月以前）</span></th>
                </tr>
              </thead>
              <tbody>
                {TAX_TABLE.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-border/50 last:border-b-0 ${
                      i === ccIndex ? "bg-accent/10" : ""
                    }`}
                  >
                    <td className="py-1.5 text-foreground">{row.label}</td>
                    <td className="py-1.5 text-right font-mono">{fmt(row.newRate)}円</td>
                    <td className="py-1.5 text-right font-mono text-muted">{fmt(row.oldRate)}円</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 自動車税の仕組み */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
        <h3 className="font-bold text-sm mb-3">自動車税のしくみ</h3>
        <div className="space-y-3">
          <div className="rounded-xl border border-border p-3">
            <p className="text-sm font-semibold mb-1">新税率（2019年10月以降）</p>
            <p className="text-xs text-muted">
              2019年10月の消費税増税と同時に引き下げ。初回登録が2019年10月1日以降の車両に適用。
            </p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-sm font-semibold mb-1">13年超重課</p>
            <p className="text-xs text-muted">
              初回登録から13年を超えた車両は税額が約15%増となります（電気自動車等を除く）。
            </p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-sm font-semibold mb-1">グリーン化特例（EV・PHEV）</p>
            <p className="text-xs text-muted">
              電気自動車・プラグインハイブリッド車は取得翌年度の税額が概算75%軽減されます。適用は翌年度1年間のみ。
            </p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-sm font-semibold mb-1">納付時期</p>
            <p className="text-xs text-muted">
              毎年4月1日時点の所有者に課税。5月末が納期限（都道府県によって異なる場合あり）。
            </p>
          </div>
        </div>
      </div>

      {/* 広告プレースホルダー */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center h-20 text-xs text-muted">
        広告
      </div>
    </div>
  );
}
