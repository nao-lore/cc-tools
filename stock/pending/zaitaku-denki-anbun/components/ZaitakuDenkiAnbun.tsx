"use client";

import { useState, useMemo } from "react";

type AnbunMethod = "area" | "time" | "combined";

interface Inputs {
  denki: string;
  gas: string;
  suido: string;
  totalArea: string;
  workArea: string;
  totalHours: string;
  workHours: string;
  method: AnbunMethod;
}

function parseNum(s: string): number {
  const v = parseFloat(s);
  return isNaN(v) || v < 0 ? 0 : v;
}

function calcRate(inputs: Inputs): number {
  const totalArea = parseNum(inputs.totalArea);
  const workArea = parseNum(inputs.workArea);
  const totalHours = parseNum(inputs.totalHours);
  const workHours = parseNum(inputs.workHours);

  const areaRate = totalArea > 0 ? workArea / totalArea : 0;
  const timeRate = totalHours > 0 ? workHours / totalHours : 0;

  if (inputs.method === "area") return Math.min(areaRate, 1);
  if (inputs.method === "time") return Math.min(timeRate, 1);
  // combined: area × time
  return Math.min(areaRate * timeRate, 1);
}

const METHOD_OPTIONS: { value: AnbunMethod; label: string; desc: string }[] = [
  { value: "area", label: "面積按分", desc: "仕事部屋面積 ÷ 住居全体面積" },
  { value: "time", label: "時間按分", desc: "稼働時間 ÷ 月の総時間" },
  { value: "combined", label: "面積×時間（複合）", desc: "面積按分率 × 時間按分率" },
];

export default function ZaitakuDenkiAnbun() {
  const [inputs, setInputs] = useState<Inputs>({
    denki: "",
    gas: "",
    suido: "",
    totalArea: "",
    workArea: "",
    totalHours: "720",
    workHours: "",
    method: "combined",
  });

  const set = (key: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setInputs((prev) => ({ ...prev, [key]: e.target.value }));

  const rate = useMemo(() => calcRate(inputs), [inputs]);

  const denki = parseNum(inputs.denki);
  const gas = parseNum(inputs.gas);
  const suido = parseNum(inputs.suido);

  const denkiAnbun = Math.round(denki * rate);
  const gasAnbun = Math.round(gas * rate);
  const suidoAnbun = Math.round(suido * rate);
  const totalMonth = denkiAnbun + gasAnbun + suidoAnbun;
  const totalYear = totalMonth * 12;

  const ratePct = (rate * 100).toFixed(1);
  const hasInputs = denki > 0 || gas > 0 || suido > 0;
  const hasRate = rate > 0;
  const valid = hasInputs && hasRate;

  const areaRate = (() => {
    const t = parseNum(inputs.totalArea);
    const w = parseNum(inputs.workArea);
    return t > 0 ? (w / t) * 100 : null;
  })();

  const timeRate = (() => {
    const t = parseNum(inputs.totalHours);
    const w = parseNum(inputs.workHours);
    return t > 0 ? (w / t) * 100 : null;
  })();

  return (
    <div className="space-y-6">
      {/* 按分方法 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">按分方法</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {METHOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setInputs((prev) => ({ ...prev, method: opt.value }))}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                inputs.method === opt.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
              }`}
            >
              <p className="text-sm font-semibold">{opt.label}</p>
              <p className="text-xs mt-0.5 opacity-75">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 光熱費入力 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">月の光熱費</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: "denki" as const, label: "電気代", placeholder: "例: 8000" },
            { key: "gas" as const, label: "ガス代", placeholder: "例: 4000" },
            { key: "suido" as const, label: "水道代", placeholder: "例: 3000" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">¥</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={inputs[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-gray-300 pl-7 pr-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 面積・時間入力 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">按分の根拠</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 面積 */}
          <div
            className={`space-y-3 rounded-xl p-4 border ${
              inputs.method === "time" ? "border-gray-100 bg-gray-50 opacity-50" : "border-blue-100 bg-blue-50/40"
            }`}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">面積</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">住居全体面積</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={inputs.totalArea}
                  onChange={set("totalArea")}
                  placeholder="例: 60"
                  disabled={inputs.method === "time"}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">㎡</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">仕事用面積</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={inputs.workArea}
                  onChange={set("workArea")}
                  placeholder="例: 12"
                  disabled={inputs.method === "time"}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">㎡</span>
              </div>
            </div>
            {areaRate !== null && inputs.method !== "time" && (
              <p className="text-xs text-blue-600 font-medium">面積按分率: {areaRate.toFixed(1)}%</p>
            )}
          </div>

          {/* 時間 */}
          <div
            className={`space-y-3 rounded-xl p-4 border ${
              inputs.method === "area" ? "border-gray-100 bg-gray-50 opacity-50" : "border-blue-100 bg-blue-50/40"
            }`}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">時間</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">月の総時間</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={inputs.totalHours}
                  onChange={set("totalHours")}
                  disabled={inputs.method === "area"}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-8 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">h</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">月の稼働時間</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={inputs.workHours}
                  onChange={set("workHours")}
                  placeholder="例: 160"
                  disabled={inputs.method === "area"}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-8 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">h</span>
              </div>
            </div>
            {timeRate !== null && inputs.method !== "area" && (
              <p className="text-xs text-blue-600 font-medium">時間按分率: {timeRate.toFixed(1)}%</p>
            )}
          </div>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 h-20 flex items-center justify-center text-xs text-gray-300">
        AD
      </div>

      {/* 結果 */}
      {valid ? (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-6 py-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">按分結果</h2>
            <span className="px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-sm font-bold">
              按分率 {ratePct}%
            </span>
          </div>

          {/* 内訳 */}
          <div className="space-y-3">
            {[
              { label: "電気代", total: denki, anbun: denkiAnbun },
              { label: "ガス代", total: gas, anbun: gasAnbun },
              { label: "水道代", total: suido, anbun: suidoAnbun },
            ].map(({ label, total, anbun }) => (
              <div key={label} className="bg-white rounded-xl border border-blue-100 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-700">¥{anbun.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 ml-2">/ ¥{total.toLocaleString()}</span>
                  </div>
                </div>
                {total > 0 && (
                  <div className="h-1.5 rounded-full bg-blue-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-400 transition-all duration-300"
                      style={{ width: `${rate * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 合計 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-blue-200 px-4 py-4 text-center">
              <p className="text-xs text-gray-500 mb-1">月額 経費</p>
              <p className="text-2xl font-extrabold text-blue-700">¥{totalMonth.toLocaleString()}</p>
            </div>
            <div className="bg-blue-600 rounded-xl px-4 py-4 text-center">
              <p className="text-xs text-blue-200 mb-1">年額 経費</p>
              <p className="text-2xl font-extrabold text-white">¥{totalYear.toLocaleString()}</p>
            </div>
          </div>

          {/* 計算根拠メモ */}
          <div className="rounded-lg bg-white/70 border border-blue-100 px-4 py-3 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-600 mb-1">計算根拠（確定申告メモ）</p>
            {inputs.method === "area" && areaRate !== null && (
              <p>面積按分: {inputs.workArea}㎡ ÷ {inputs.totalArea}㎡ = {areaRate.toFixed(1)}%</p>
            )}
            {inputs.method === "time" && timeRate !== null && (
              <p>時間按分: {inputs.workHours}h ÷ {inputs.totalHours}h = {timeRate.toFixed(1)}%</p>
            )}
            {inputs.method === "combined" && areaRate !== null && timeRate !== null && (
              <>
                <p>面積按分: {inputs.workArea}㎡ ÷ {inputs.totalArea}㎡ = {areaRate.toFixed(1)}%</p>
                <p>時間按分: {inputs.workHours}h ÷ {inputs.totalHours}h = {timeRate.toFixed(1)}%</p>
                <p>複合按分率: {areaRate.toFixed(1)}% × {timeRate.toFixed(1)}% = {ratePct}%</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center text-sm text-gray-400">
          光熱費と按分の根拠を入力すると結果が表示されます
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この在宅勤務 光熱費按分ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">稼働時間・部屋面積から在宅での電気・ガス・水道負担を按分。入力するだけで即座に結果を表示します。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">利用料金はかかりますか？</summary>
      <p className="mt-2 text-sm text-gray-600">完全無料でご利用いただけます。会員登録も不要です。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">計算結果は正確ですか？</summary>
      <p className="mt-2 text-sm text-gray-600">一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この在宅勤務 光熱費按分ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "稼働時間・部屋面積から在宅での電気・ガス・水道負担を按分。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "在宅勤務 光熱費按分",
  "description": "稼働時間・部屋面積から在宅での電気・ガス・水道負担を按分",
  "url": "https://tools.loresync.dev/zaitaku-denki-anbun",
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
