"use client";

import { useState, useMemo } from "react";

type Unit = "celsius" | "fahrenheit" | "gasmark";

const GAS_MARK_TABLE: { gas: number; celsius: number }[] = [
  { gas: 1, celsius: 140 },
  { gas: 2, celsius: 150 },
  { gas: 3, celsius: 160 },
  { gas: 4, celsius: 180 },
  { gas: 5, celsius: 190 },
  { gas: 6, celsius: 200 },
  { gas: 7, celsius: 220 },
  { gas: 8, celsius: 230 },
  { gas: 9, celsius: 240 },
];

const REFERENCE_TABLE: { label: string; celsius: number; description: string }[] = [
  { label: "低温", celsius: 140, description: "メレンゲ乾燥・フルーツケーキ" },
  { label: "低温", celsius: 160, description: "スポンジケーキ・シュークリーム" },
  { label: "中温", celsius: 180, description: "クッキー・マフィン・パウンドケーキ" },
  { label: "中温", celsius: 190, description: "タルト・ブラウニー" },
  { label: "中高温", celsius: 200, description: "ピザ・グラタン・フォカッチャ" },
  { label: "高温", celsius: 220, description: "パン・ロースト野菜" },
  { label: "高温", celsius: 230, description: "ピザ（本格）・ステーキ" },
];

function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}

function celsiusToGasMark(c: number): number | null {
  // Find closest gas mark
  let closest = GAS_MARK_TABLE[0];
  let minDiff = Math.abs(c - GAS_MARK_TABLE[0].celsius);
  for (const entry of GAS_MARK_TABLE) {
    const diff = Math.abs(c - entry.celsius);
    if (diff < minDiff) {
      minDiff = diff;
      closest = entry;
    }
  }
  // Only return if within 15°C of a gas mark
  if (minDiff <= 15) return closest.gas;
  return null;
}

function gasMarkToCelsius(gas: number): number | null {
  const entry = GAS_MARK_TABLE.find((e) => e.gas === gas);
  return entry ? entry.celsius : null;
}

function getTempColor(celsius: number): string {
  if (celsius <= 150) return "text-blue-500";
  if (celsius <= 170) return "text-cyan-500";
  if (celsius <= 190) return "text-green-500";
  if (celsius <= 210) return "text-yellow-500";
  if (celsius <= 225) return "text-orange-500";
  return "text-red-500";
}

function getThermometerFill(celsius: number): number {
  // 100°C = 0%, 250°C = 100%
  const pct = Math.min(100, Math.max(0, ((celsius - 100) / 150) * 100));
  return pct;
}

function getThermometerBg(celsius: number): string {
  if (celsius <= 150) return "bg-blue-400";
  if (celsius <= 170) return "bg-cyan-400";
  if (celsius <= 190) return "bg-green-400";
  if (celsius <= 210) return "bg-yellow-400";
  if (celsius <= 225) return "bg-orange-400";
  return "bg-red-500";
}

export default function OvenTempConverter() {
  const [inputValue, setInputValue] = useState("180");
  const [unit, setUnit] = useState<Unit>("celsius");

  const result = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return null;

    let celsius: number;
    let fahrenheit: number;
    let gasMark: number | null;

    if (unit === "celsius") {
      celsius = num;
      fahrenheit = celsiusToFahrenheit(num);
      gasMark = celsiusToGasMark(num);
    } else if (unit === "fahrenheit") {
      celsius = fahrenheitToCelsius(num);
      fahrenheit = num;
      gasMark = celsiusToGasMark(celsius);
    } else {
      // gas mark
      const c = gasMarkToCelsius(Math.round(num));
      if (c === null) return null;
      celsius = c;
      fahrenheit = celsiusToFahrenheit(c);
      gasMark = Math.round(num);
    }

    return { celsius, fahrenheit, gasMark };
  }, [inputValue, unit]);

  const thermometerPct = result ? getThermometerFill(result.celsius) : 0;
  const thermometerColor = result ? getThermometerBg(result.celsius) : "bg-gray-300";
  const tempColor = result ? getTempColor(result.celsius) : "text-foreground";

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">オーブン温度変換</h1>
        <p className="text-sm text-muted mt-1">℃ · ℉ · ガスマーク を相互変換</p>
      </div>

      {/* Input card */}
      <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
        {/* Unit selector */}
        <div className="flex rounded-xl overflow-hidden border border-border">
          {(
            [
              { id: "celsius", label: "℃ 摂氏" },
              { id: "fahrenheit", label: "℉ 華氏" },
              { id: "gasmark", label: "ガスマーク" },
            ] as { id: Unit; label: string }[]
          ).map((u) => (
            <button
              key={u.id}
              onClick={() => setUnit(u.id)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                unit === u.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted hover:text-foreground hover:bg-muted/30"
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>

        {/* Number input */}
        <div className="flex gap-3 items-center">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={unit === "gasmark" ? "1〜9" : unit === "celsius" ? "例: 180" : "例: 356"}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary"
            min={unit === "gasmark" ? 1 : 50}
            max={unit === "gasmark" ? 9 : 300}
          />
          <span className="text-lg font-semibold text-muted w-16 text-center">
            {unit === "celsius" ? "℃" : unit === "fahrenheit" ? "℉" : "Gas"}
          </span>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-2">
          {[160, 170, 180, 190, 200, 220].map((c) => {
            const val =
              unit === "celsius"
                ? c
                : unit === "fahrenheit"
                ? Math.round(celsiusToFahrenheit(c))
                : celsiusToGasMark(c);
            if (val === null) return null;
            return (
              <button
                key={c}
                onClick={() => setInputValue(String(val))}
                className="px-3 py-1 rounded-lg text-xs font-medium border border-border bg-muted/20 hover:bg-muted/50 transition-colors"
              >
                {unit === "celsius" ? `${c}℃` : unit === "fahrenheit" ? `${val}℉` : `Gas ${val}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result card with thermometer */}
      {result && (
        <div className="rounded-2xl border border-border bg-card p-5 flex gap-5 items-center">
          {/* Thermometer */}
          <div className="flex flex-col items-center gap-1 select-none">
            <div className="relative w-6 h-36 rounded-full bg-muted/30 border border-border overflow-hidden flex flex-col justify-end">
              <div
                className={`w-full rounded-full transition-all duration-500 ${thermometerColor}`}
                style={{ height: `${thermometerPct}%` }}
              />
            </div>
            <div
              className={`w-8 h-8 rounded-full border-2 border-border flex items-center justify-center ${thermometerColor}`}
            />
            <span className="text-[10px] text-muted mt-1">温度</span>
          </div>

          {/* Values */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-black tabular-nums ${tempColor}`}>
                {result.celsius % 1 === 0
                  ? result.celsius
                  : result.celsius.toFixed(1)}
              </span>
              <span className="text-lg font-semibold text-muted">℃</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-foreground">
                {result.fahrenheit % 1 === 0
                  ? result.fahrenheit
                  : result.fahrenheit.toFixed(1)}
              </span>
              <span className="text-base font-semibold text-muted">℉</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tabular-nums text-foreground">
                {result.gasMark !== null ? `Gas ${result.gasMark}` : "—"}
              </span>
              {result.gasMark !== null && (
                <span className="text-sm text-muted">ガスマーク</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gas mark reference table */}
      <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">ガスマーク対照表</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-muted text-xs border-b border-border">
                <th className="pb-2 pr-4 font-medium">Gas</th>
                <th className="pb-2 pr-4 font-medium">℃</th>
                <th className="pb-2 font-medium">℉</th>
              </tr>
            </thead>
            <tbody>
              {GAS_MARK_TABLE.map((row) => (
                <tr
                  key={row.gas}
                  className={`border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/20 transition-colors ${
                    result?.gasMark === row.gas ? "bg-primary/10" : ""
                  }`}
                  onClick={() => {
                    setUnit("gasmark");
                    setInputValue(String(row.gas));
                  }}
                >
                  <td className="py-1.5 pr-4 font-semibold">{row.gas}</td>
                  <td className="py-1.5 pr-4 tabular-nums">{row.celsius}</td>
                  <td className="py-1.5 tabular-nums">
                    {Math.round(celsiusToFahrenheit(row.celsius))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Common temps reference */}
      <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">よく使う温度</h2>
        <div className="flex flex-col gap-2">
          {REFERENCE_TABLE.map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-3 cursor-pointer hover:bg-muted/20 rounded-lg px-2 py-1.5 transition-colors"
              onClick={() => {
                setUnit("celsius");
                setInputValue(String(row.celsius));
              }}
            >
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  row.label === "低温"
                    ? "bg-blue-100 text-blue-700"
                    : row.label === "中温"
                    ? "bg-green-100 text-green-700"
                    : row.label === "中高温"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {row.label}
              </span>
              <span className="font-semibold tabular-nums text-sm w-16 shrink-0">
                {row.celsius}℃
              </span>
              <span className="text-xs text-muted truncate">{row.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    </div>
  );
}
