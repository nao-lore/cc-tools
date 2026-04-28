"use client";

import { useState, useMemo } from "react";

type Unit = "celsius" | "fahrenheit" | "gasmark";
type Lang = "ja" | "en";

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

const REFERENCE_TABLE: { label: string; labelEn: string; celsius: number; description: string; descriptionEn: string }[] = [
  { label: "低温", labelEn: "Low", celsius: 140, description: "メレンゲ乾燥・フルーツケーキ", descriptionEn: "Meringue drying / fruitcake" },
  { label: "低温", labelEn: "Low", celsius: 160, description: "スポンジケーキ・シュークリーム", descriptionEn: "Sponge cake / choux pastry" },
  { label: "中温", labelEn: "Medium", celsius: 180, description: "クッキー・マフィン・パウンドケーキ", descriptionEn: "Cookies / muffins / pound cake" },
  { label: "中温", labelEn: "Medium", celsius: 190, description: "タルト・ブラウニー", descriptionEn: "Tarts / brownies" },
  { label: "中高温", labelEn: "Med-High", celsius: 200, description: "ピザ・グラタン・フォカッチャ", descriptionEn: "Pizza / gratin / focaccia" },
  { label: "高温", labelEn: "High", celsius: 220, description: "パン・ロースト野菜", descriptionEn: "Bread / roasted vegetables" },
  { label: "高温", labelEn: "High", celsius: 230, description: "ピザ（本格）・ステーキ", descriptionEn: "Artisan pizza / steak" },
];

const T = {
  ja: {
    inputLabel: "変換元の単位と温度を入力",
    celsius: "℃ 摂氏",
    fahrenheit: "℉ 華氏",
    gasmark: "ガスマーク",
    gasPlaceholder: "1〜9",
    celsiusPlaceholder: "例: 180",
    fahrenheitPlaceholder: "例: 356",
    tempLabel: "温度",
    gasMarkTable: "ガスマーク対照表",
    gasHeader: "Gas",
    commonTemps: "よく使う温度",
  },
  en: {
    inputLabel: "Select unit and enter temperature",
    celsius: "℃ Celsius",
    fahrenheit: "℉ Fahrenheit",
    gasmark: "Gas Mark",
    gasPlaceholder: "1–9",
    celsiusPlaceholder: "e.g. 180",
    fahrenheitPlaceholder: "e.g. 356",
    tempLabel: "Temp",
    gasMarkTable: "Gas Mark Reference",
    gasHeader: "Gas",
    commonTemps: "Common Temperatures",
  },
} as const;

function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}

function celsiusToGasMark(c: number): number | null {
  let closest = GAS_MARK_TABLE[0];
  let minDiff = Math.abs(c - GAS_MARK_TABLE[0].celsius);
  for (const entry of GAS_MARK_TABLE) {
    const diff = Math.abs(c - entry.celsius);
    if (diff < minDiff) {
      minDiff = diff;
      closest = entry;
    }
  }
  if (minDiff <= 15) return closest.gas;
  return null;
}

function gasMarkToCelsius(gas: number): number | null {
  const entry = GAS_MARK_TABLE.find((e) => e.gas === gas);
  return entry ? entry.celsius : null;
}

function getTempGradient(celsius: number): string {
  if (celsius <= 150) return "from-blue-500 to-cyan-400";
  if (celsius <= 170) return "from-cyan-500 to-teal-400";
  if (celsius <= 190) return "from-green-500 to-emerald-400";
  if (celsius <= 210) return "from-yellow-500 to-amber-400";
  if (celsius <= 225) return "from-orange-500 to-amber-500";
  return "from-red-500 to-orange-500";
}

function getTempColor(celsius: number): string {
  if (celsius <= 150) return "text-blue-300";
  if (celsius <= 170) return "text-cyan-300";
  if (celsius <= 190) return "text-green-400";
  if (celsius <= 210) return "text-yellow-400";
  if (celsius <= 225) return "text-orange-400";
  return "text-red-400";
}

function getThermometerFill(celsius: number): number {
  const pct = Math.min(100, Math.max(0, ((celsius - 100) / 150) * 100));
  return pct;
}

export default function OvenTempConverter() {
  const [lang, setLang] = useState<Lang>("ja");
  const [inputValue, setInputValue] = useState("180");
  const [unit, setUnit] = useState<Unit>("celsius");

  const t = T[lang];

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
      const c = gasMarkToCelsius(Math.round(num));
      if (c === null) return null;
      celsius = c;
      fahrenheit = celsiusToFahrenheit(c);
      gasMark = Math.round(num);
    }

    return { celsius, fahrenheit, gasMark };
  }, [inputValue, unit]);

  const thermometerPct = result ? getThermometerFill(result.celsius) : 0;
  const tempColor = result ? getTempColor(result.celsius) : "text-violet-200";
  const tempGradient = result ? getTempGradient(result.celsius) : "from-gray-600 to-gray-500";

  const UNITS: { id: Unit; label: string }[] = [
    { id: "celsius", label: t.celsius },
    { id: "fahrenheit", label: t.fahrenheit },
    { id: "gasmark", label: t.gasmark },
  ];

  return (
    <div className="space-y-5">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1); }
          50% { box-shadow: 0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(139,92,246,0.2); }
        }
        @keyframes float-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes border-spin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .glass-card-bright {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .neon-focus:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(167,139,250,0.6), 0 0 20px rgba(167,139,250,0.2);
        }
        .glow-text {
          text-shadow: 0 0 30px rgba(196,181,253,0.6);
        }
        .result-card-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .float-in {
          animation: float-in 0.25s ease-out;
        }
        .gradient-border-box {
          position: relative;
        }
        .gradient-border-box::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(139,92,246,0.6), rgba(6,182,212,0.4), rgba(139,92,246,0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .number-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2d9f3;
        }
        .number-input::placeholder { color: rgba(196,181,253,0.4); }
        .number-input::-webkit-inner-spin-button,
        .number-input::-webkit-outer-spin-button { opacity: 0.3; }
        .preset-active {
          background: rgba(139,92,246,0.25);
          border-color: rgba(167,139,250,0.6);
          color: #c4b5fd;
          box-shadow: 0 0 10px rgba(139,92,246,0.3);
        }
        .table-row-stripe:hover {
          background: rgba(139,92,246,0.08);
          transition: background 0.2s ease;
        }
      `}</style>

      {/* Language toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* Input card */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <h2 className="text-xs font-semibold text-violet-100 uppercase tracking-widest">{t.inputLabel}</h2>

        {/* Unit selector */}
        <div className="glass-card rounded-xl overflow-hidden flex">
          {UNITS.map((u) => (
            <button
              key={u.id}
              onClick={() => setUnit(u.id)}
              className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${
                unit === u.id
                  ? "bg-violet-600 text-white"
                  : "text-violet-200 hover:text-white hover:bg-white/5"
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
            placeholder={unit === "gasmark" ? t.gasPlaceholder : unit === "celsius" ? t.celsiusPlaceholder : t.fahrenheitPlaceholder}
            className="number-input flex-1 rounded-xl px-4 py-3 text-2xl font-bold text-center font-mono neon-focus transition-all"
            min={unit === "gasmark" ? 1 : 50}
            max={unit === "gasmark" ? 9 : 300}
          />
          <span className="text-lg font-semibold text-violet-200 w-16 text-center">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 font-mono ${
                  inputValue === String(val)
                    ? "preset-active"
                    : "border-white/10 text-violet-100 hover:border-violet-500/40 hover:text-violet-200"
                }`}
              >
                {unit === "celsius" ? `${c}℃` : unit === "fahrenheit" ? `${val}℉` : `Gas ${val}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result card */}
      {result && (
        <div className="gradient-border-box glass-card-bright rounded-2xl p-6 flex gap-5 items-center result-card-glow float-in">
          {/* Thermometer */}
          <div className="flex flex-col items-center gap-1 select-none shrink-0">
            <div className="relative w-6 h-32 rounded-full glass-card overflow-hidden flex flex-col justify-end">
              <div
                className={`w-full rounded-full transition-all duration-500 bg-gradient-to-t ${tempGradient}`}
                style={{ height: `${thermometerPct}%` }}
              />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${tempGradient} opacity-80`} />
            <span className="text-[10px] text-violet-200 mt-1">{t.tempLabel}</span>
          </div>

          {/* Values */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-black tabular-nums font-mono glow-text ${tempColor}`}>
                {result.celsius % 1 === 0 ? result.celsius : result.celsius.toFixed(1)}
              </span>
              <span className="text-lg font-semibold text-violet-200">℃</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-white font-mono">
                {result.fahrenheit % 1 === 0 ? result.fahrenheit : result.fahrenheit.toFixed(1)}
              </span>
              <span className="text-base font-semibold text-violet-200">℉</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tabular-nums text-cyan-300 font-mono">
                {result.gasMark !== null ? `Gas ${result.gasMark}` : "—"}
              </span>
              {result.gasMark !== null && (
                <span className="text-sm text-violet-200">{lang === "ja" ? "ガスマーク" : "Gas Mark"}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gas mark reference table */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-4">{t.gasMarkTable}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="pb-2.5 pr-4 text-left text-xs text-violet-200 font-medium uppercase tracking-wider">{t.gasHeader}</th>
                <th className="pb-2.5 pr-4 text-left text-xs text-violet-200 font-medium uppercase tracking-wider">℃</th>
                <th className="pb-2.5 text-left text-xs text-violet-200 font-medium uppercase tracking-wider">℉</th>
              </tr>
            </thead>
            <tbody>
              {GAS_MARK_TABLE.map((row) => (
                <tr
                  key={row.gas}
                  className={`border-b border-white/5 table-row-stripe cursor-pointer transition-colors ${
                    result?.gasMark === row.gas ? "bg-violet-500/10" : ""
                  }`}
                  onClick={() => {
                    setUnit("gasmark");
                    setInputValue(String(row.gas));
                  }}
                >
                  <td className="py-2 pr-4 font-semibold text-white font-mono">{row.gas}</td>
                  <td className="py-2 pr-4 tabular-nums text-white/90 font-mono">{row.celsius}</td>
                  <td className="py-2 tabular-nums text-white/90 font-mono">
                    {Math.round(celsiusToFahrenheit(row.celsius))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Common temps reference */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-4">{t.commonTemps}</h2>
        <div className="flex flex-col gap-2">
          {REFERENCE_TABLE.map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-xl px-3 py-2 transition-colors"
              onClick={() => {
                setUnit("celsius");
                setInputValue(String(row.celsius));
              }}
            >
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  row.label === "低温"
                    ? "bg-blue-500/20 text-blue-300"
                    : row.label === "中温"
                    ? "bg-green-500/20 text-green-400"
                    : row.label === "中高温"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {lang === "ja" ? row.label : row.labelEn}
              </span>
              <span className="font-semibold tabular-nums text-sm w-16 shrink-0 text-white font-mono">
                {row.celsius}℃
              </span>
              <span className="text-xs text-violet-200 truncate">
                {lang === "ja" ? row.description : row.descriptionEn}
              </span>
            </div>
          ))}
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このオーブン温度 変換ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "℃/℉/ガス目盛相互変換、海外レシピ対応。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "オーブン温度 変換",
  "description": "℃/℉/ガス目盛相互変換、海外レシピ対応",
  "url": "https://tools.loresync.dev/oven-temp-converter",
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
