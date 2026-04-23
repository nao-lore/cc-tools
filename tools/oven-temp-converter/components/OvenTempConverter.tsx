"use client";

import { useState } from "react";

type Unit = "C" | "F" | "gas";

const GAS_MARKS: { mark: number; celsius: number; label: string }[] = [
  { mark: 1, celsius: 140, label: "低温" },
  { mark: 2, celsius: 150, label: "低温" },
  { mark: 3, celsius: 165, label: "低温" },
  { mark: 4, celsius: 180, label: "中温" },
  { mark: 5, celsius: 190, label: "中温" },
  { mark: 6, celsius: 200, label: "中高温" },
  { mark: 7, celsius: 220, label: "高温" },
  { mark: 8, celsius: 230, label: "高温" },
  { mark: 9, celsius: 240, label: "高温" },
];

function cToF(c: number) { return c * 9 / 5 + 32; }
function fToC(f: number) { return (f - 32) * 5 / 9; }
function cToGas(c: number) {
  const closest = GAS_MARKS.reduce((a, b) =>
    Math.abs(b.celsius - c) < Math.abs(a.celsius - c) ? b : a
  );
  return closest.mark;
}

const PRESETS = [
  { label: "クッキー", celsius: 170, note: "焼き色を均一に" },
  { label: "スポンジケーキ", celsius: 180, note: "ふっくらと仕上げる" },
  { label: "チキン", celsius: 200, note: "外はパリ・中はジューシー" },
  { label: "パン", celsius: 190, note: "一般的な食パン" },
  { label: "ピザ", celsius: 250, note: "高温で短時間" },
  { label: "チーズケーキ", celsius: 160, note: "低温でじっくり" },
];

export default function OvenTempConverter() {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<Unit>("C");

  const num = parseFloat(value);
  const valid = !isNaN(num) && num > 0;

  const celsius = valid
    ? unit === "C" ? num
    : unit === "F" ? fToC(num)
    : (GAS_MARKS.find((g) => g.mark === Math.round(num))?.celsius ?? num * 27.5)
    : null;

  const fahrenheit = celsius !== null ? cToF(celsius) : null;
  const gasMark = celsius !== null ? cToGas(celsius) : null;

  const tempLabel = celsius !== null
    ? celsius < 160 ? "低温" : celsius < 190 ? "中温" : celsius < 220 ? "中高温" : "高温"
    : "";

  return (
    <div className="space-y-5">
      {/* Input */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="font-bold text-base">温度を入力</h2>

        {/* Unit selector */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(["C", "F", "gas"] as Unit[]).map((u) => (
            <button
              key={u}
              onClick={() => { setUnit(u); setValue(""); }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                unit === u ? "bg-primary text-white" : "bg-accent text-muted hover:text-foreground"
              }`}
            >
              {u === "C" ? "摂氏 (°C)" : u === "F" ? "華氏 (°F)" : "ガスマーク"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            inputMode="decimal"
            placeholder={unit === "C" ? "例: 180" : unit === "F" ? "例: 356" : "例: 4"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 px-3 py-2.5 border border-border rounded-lg text-right font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-accent text-foreground text-lg"
          />
          <span className="text-muted font-medium w-12 text-sm">
            {unit === "C" ? "°C" : unit === "F" ? "°F" : "番"}
          </span>
        </div>
      </div>

      {/* Results */}
      {valid && celsius !== null && (
        <div className="grid grid-cols-3 gap-3">
          <div className={`rounded-xl p-4 border ${unit === "C" ? "bg-primary/10 border-primary/30" : "bg-accent border-border"}`}>
            <p className="text-xs text-muted mb-1">摂氏</p>
            <p className={`text-2xl font-bold font-mono ${unit === "C" ? "text-primary" : "text-foreground"}`}>
              {Math.round(celsius)}°C
            </p>
          </div>
          <div className={`rounded-xl p-4 border ${unit === "F" ? "bg-primary/10 border-primary/30" : "bg-accent border-border"}`}>
            <p className="text-xs text-muted mb-1">華氏</p>
            <p className={`text-2xl font-bold font-mono ${unit === "F" ? "text-primary" : "text-foreground"}`}>
              {fahrenheit !== null ? Math.round(fahrenheit) : "—"}°F
            </p>
          </div>
          <div className={`rounded-xl p-4 border ${unit === "gas" ? "bg-primary/10 border-primary/30" : "bg-accent border-border"}`}>
            <p className="text-xs text-muted mb-1">ガスマーク</p>
            <p className={`text-2xl font-bold font-mono ${unit === "gas" ? "text-primary" : "text-foreground"}`}>
              {gasMark ?? "—"}番
            </p>
          </div>
          {tempLabel && (
            <div className="col-span-3 bg-accent border border-border rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="text-xs text-muted">温度帯</span>
              <span className="font-bold text-foreground">{tempLabel}</span>
              <span className="text-xs text-muted ml-auto">
                {celsius < 160 ? "メレンゲ・プリンなど繊細な焼き物に" :
                 celsius < 190 ? "ケーキ・クッキーなど一般的なお菓子に" :
                 celsius < 220 ? "パン・鶏肉など中火料理に" :
                 "ピザ・ステーキなど高温短時間調理に"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Presets */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-3">よく使われるオーブン温度</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => { setUnit("C"); setValue(String(p.celsius)); }}
              className="text-left border border-border rounded-lg p-3 hover:bg-accent transition-colors"
            >
              <p className="font-bold text-sm text-foreground">{p.label}</p>
              <p className="font-mono text-primary text-lg">{p.celsius}°C</p>
              <p className="text-xs text-muted">{p.note}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Gas mark table */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-3">ガスマーク換算表</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted pb-2">ガスマーク</th>
                <th className="text-right text-xs text-muted pb-2">摂氏 (°C)</th>
                <th className="text-right text-xs text-muted pb-2">華氏 (°F)</th>
                <th className="text-right text-xs text-muted pb-2">温度帯</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {GAS_MARKS.map((g) => (
                <tr key={g.mark} className="hover:bg-accent/50">
                  <td className="py-2 font-bold text-foreground">{g.mark}番</td>
                  <td className="py-2 text-right font-mono">{g.celsius}°C</td>
                  <td className="py-2 text-right font-mono">{Math.round(cToF(g.celsius))}°F</td>
                  <td className="py-2 text-right text-muted">{g.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
