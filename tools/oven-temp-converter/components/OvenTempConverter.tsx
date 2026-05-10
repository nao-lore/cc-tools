"use client";

import { useMemo, useState } from "react";

type Unit = "celsius" | "fahrenheit" | "gas";

type GasMark = {
  mark: number;
  celsius: number;
  label: string;
  use: string;
};

const GAS_MARKS: GasMark[] = [
  { mark: 1, celsius: 140, label: "低温", use: "メレンゲ、プリン、低温焼き" },
  { mark: 2, celsius: 150, label: "低温", use: "チーズケーキ、じっくり火入れ" },
  { mark: 3, celsius: 160, label: "やや低温", use: "パウンドケーキ、低温の焼き菓子" },
  { mark: 4, celsius: 180, label: "中温", use: "クッキー、スポンジケーキ" },
  { mark: 5, celsius: 190, label: "中温", use: "パン、グラタン" },
  { mark: 6, celsius: 200, label: "中高温", use: "鶏肉、ロースト野菜" },
  { mark: 7, celsius: 220, label: "高温", use: "ピザ、焼き色を付ける料理" },
  { mark: 8, celsius: 230, label: "高温", use: "短時間で強く焼く料理" },
  { mark: 9, celsius: 240, label: "高温", use: "高温ピザ、仕上げ焼き" },
];

const PRESETS = [
  { label: "チーズケーキ", celsius: 160, note: "低温でじっくり" },
  { label: "クッキー", celsius: 170, note: "焼き色を見ながら" },
  { label: "スポンジケーキ", celsius: 180, note: "標準的な中温" },
  { label: "パン", celsius: 190, note: "一般的な食パン" },
  { label: "チキン", celsius: 200, note: "外側を香ばしく" },
  { label: "ピザ", celsius: 250, note: "高温で短時間" },
];

function cToF(celsius: number) {
  return (celsius * 9) / 5 + 32;
}

function fToC(fahrenheit: number) {
  return ((fahrenheit - 32) * 5) / 9;
}

function nearestGasMark(celsius: number) {
  return GAS_MARKS.reduce((best, item) => (Math.abs(item.celsius - celsius) < Math.abs(best.celsius - celsius) ? item : best));
}

function gasToCelsius(value: number) {
  const rounded = Math.round(value);
  return GAS_MARKS.find((item) => item.mark === rounded)?.celsius ?? value;
}

function parseValue(value: string) {
  const parsed = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: number) {
  return Math.round(value).toLocaleString("ja-JP");
}

function buildCsv(celsius: number, gas: GasMark) {
  const rows = [
    ["celsius", "fahrenheit", "gas_mark", "fan_oven_celsius", "band", "use"],
    [round(celsius), round(cToF(celsius)), String(gas.mark), round(Math.max(0, celsius - 20)), gas.label, gas.use],
  ];
  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadCsv(text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "oven-temperature-converter.csv";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function getValidationError(unit: Unit, amount: number) {
  if (!amount) return "入力エラー: 温度を入力してください。";
  if (unit === "celsius" && (amount < 60 || amount > 320)) return "入力エラー: 摂氏は60〜320°Cの範囲で入力してください。";
  if (unit === "fahrenheit" && (amount < 140 || amount > 610)) return "入力エラー: 華氏は140〜610°Fの範囲で入力してください。";
  if (unit === "gas" && (amount < 1 || amount > 9)) return "入力エラー: ガスマークは1〜9で入力してください。";
  return "";
}

export default function OvenTempConverter() {
  const [value, setValue] = useState("180");
  const [unit, setUnit] = useState<Unit>("celsius");
  const [copied, setCopied] = useState(false);

  const amount = parseValue(value);
  const validationError = getValidationError(unit, amount);
  const result = useMemo(() => {
    if (validationError) return null;
    const celsius = unit === "celsius" ? amount : unit === "fahrenheit" ? fToC(amount) : gasToCelsius(amount);
    const gas = nearestGasMark(celsius);
    return {
      celsius,
      fahrenheit: cToF(celsius),
      gas,
      fanCelsius: Math.max(0, celsius - 20),
      fanFahrenheit: cToF(Math.max(0, celsius - 20)),
    };
  }, [amount, unit, validationError]);

  function updateUnit(nextUnit: Unit) {
    if (!result) {
      setUnit(nextUnit);
      setValue("");
      setCopied(false);
      return;
    }
    setUnit(nextUnit);
    if (nextUnit === "celsius") setValue(String(round(result.celsius)));
    if (nextUnit === "fahrenheit") setValue(String(round(result.fahrenheit)));
    if (nextUnit === "gas") setValue(String(result.gas.mark));
    setCopied(false);
  }

  function reset() {
    setValue("180");
    setUnit("celsius");
    setCopied(false);
  }

  async function copyResult() {
    if (!result) return;
    const text = [
      `摂氏: ${round(result.celsius)}°C`,
      `華氏: ${round(result.fahrenheit)}°F`,
      `ガスマーク: ${result.gas.mark}`,
      `ファン付きオーブン目安: ${round(result.fanCelsius)}°C / ${round(result.fanFahrenheit)}°F`,
      `温度帯: ${result.gas.label}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">温度を入力</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">摂氏、華氏、ガスマークを相互換算します。</p>
            </div>
            <button type="button" onClick={reset} className="w-fit rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              クリア
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">
            {[
              { value: "celsius" as const, label: "摂氏" },
              { value: "fahrenheit" as const, label: "華氏" },
              { value: "gas" as const, label: "ガス" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => updateUnit(item.value)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${unit === item.value ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="mt-5 grid gap-2 text-sm font-medium text-slate-700" htmlFor="oven-temp-value">
            温度
            <div className="flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
              <input
                id="oven-temp-value"
                type="text"
                inputMode="decimal"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value.replace(/[^0-9.]/g, ""));
                  setCopied(false);
                }}
                placeholder={unit === "celsius" ? "180" : unit === "fahrenheit" ? "350" : "4"}
                className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
              />
              <span className="flex min-w-20 items-center justify-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                {unit === "celsius" ? "°C" : unit === "fahrenheit" ? "°F" : "番"}
              </span>
            </div>
          </label>

          <p className={`mt-3 min-h-5 text-sm ${validationError ? "text-red-600" : "text-slate-500"}`}>
            {validationError || "家庭用オーブンの温度換算目安です。庫内温度は機種や予熱状態で変わります。入力値はブラウザ内で処理され、外部に送信されません。"}
          </p>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setUnit("celsius");
                    setValue(String(preset.celsius));
                    setCopied(false);
                  }}
                  className="rounded-xl border border-slate-200 p-3 text-left hover:border-slate-400 hover:bg-slate-50"
                >
                  <span className="block text-sm font-semibold text-slate-950">{preset.label}</span>
                  <span className="block font-mono text-lg font-bold text-emerald-700">{preset.celsius}°C</span>
                  <span className="block text-xs text-slate-500">{preset.note}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 p-5 sm:p-6">
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-orange-950">
            <p className="text-sm font-medium opacity-80">換算結果</p>
            {result ? (
              <>
                <div className="mt-2 grid gap-3 sm:grid-cols-3">
                  <ResultCard label="摂氏" value={`${round(result.celsius)}°C`} active={unit === "celsius"} />
                  <ResultCard label="華氏" value={`${round(result.fahrenheit)}°F`} active={unit === "fahrenheit"} />
                  <ResultCard label="ガスマーク" value={`${result.gas.mark}番`} active={unit === "gas"} />
                </div>
                <div className="mt-4 rounded-xl border border-orange-200 bg-white/70 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold">温度帯: {result.gas.label}</p>
                      <p className="mt-1 text-sm opacity-80">{result.gas.use}</p>
                    </div>
                    <div className="rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
                      ファン付き目安: <span className="font-mono font-bold">{round(result.fanCelsius)}°C</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-orange-200 bg-white/60 p-6 text-sm">温度を入力すると換算結果が表示されます。</div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} disabled={!result} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300">
              {copied ? "コピー済み" : "結果をコピー"}
            </button>
            <button type="button" onClick={() => result && downloadCsv(buildCsv(result.celsius, result.gas))} disabled={!result} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300">
              CSVダウンロード
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-semibold text-slate-950">ガスマーク換算表</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm md:min-w-full">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs text-slate-500">
                    <th className="border border-slate-200 px-3 py-2">ガスマーク</th>
                    <th className="border border-slate-200 px-3 py-2">摂氏</th>
                    <th className="border border-slate-200 px-3 py-2">華氏</th>
                    <th className="border border-slate-200 px-3 py-2">温度帯</th>
                    <th className="border border-slate-200 px-3 py-2">用途</th>
                  </tr>
                </thead>
                <tbody>
                  {GAS_MARKS.map((item) => (
                    <tr key={item.mark} className="even:bg-slate-50">
                      <td className="border border-slate-200 px-3 py-2 font-semibold">{item.mark}番</td>
                      <td className="border border-slate-200 px-3 py-2 text-right font-mono">{item.celsius}°C</td>
                      <td className="border border-slate-200 px-3 py-2 text-right font-mono">{round(cToF(item.celsius))}°F</td>
                      <td className="border border-slate-200 px-3 py-2 align-top">{item.label}</td>
                      <td className="border border-slate-200 px-3 py-2 align-top leading-6">{item.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-500">ガスマークは主に英国系レシピで使われる目安です。機種差があるため焼き色を見ながら調整してください。</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultCard({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${active ? "border-orange-300 bg-white" : "border-orange-100 bg-white/70"}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold">{value}</p>
    </div>
  );
}
