"use client";
import { useState } from "react";

type PrevWeather = "sunny" | "rainy" | "cloudy";

interface Inputs {
  temp: string;
  wind: string;
  humidity: string;
  prevWeather: PrevWeather;
  month: string;
}

interface Result {
  sugiIndex: number;
  hinokiIndex: number;
  totalIndex: number;
  level: "少ない" | "やや多い" | "多い" | "非常に多い";
  color: string;
  bgColor: string;
  advice: string[];
}

function calcIndex(inputs: Inputs): Result | null {
  const temp = parseFloat(inputs.temp);
  const wind = parseFloat(inputs.wind);
  const humidity = parseFloat(inputs.humidity);
  const month = parseInt(inputs.month, 10);
  if (isNaN(temp) || isNaN(wind) || isNaN(humidity) || isNaN(month)) return null;

  // 気温スコア（10〜20℃が最大）
  const tempScore = temp < 5 ? 0 : temp < 10 ? 0.3 : temp < 15 ? 0.7 : temp < 20 ? 1.0 : temp < 25 ? 0.8 : 0.5;

  // 風速スコア（3〜8m/sが最適）
  const windScore = wind < 1 ? 0.2 : wind < 3 ? 0.5 : wind < 8 ? 1.0 : wind < 15 ? 0.7 : 0.4;

  // 湿度スコア（低湿度=飛びやすい）
  const humidScore = humidity < 40 ? 1.0 : humidity < 60 ? 0.7 : humidity < 80 ? 0.3 : 0.1;

  // 前日雨の翌日は特に多い
  const prevWeatherMult = inputs.prevWeather === "rainy" ? 1.5 : inputs.prevWeather === "sunny" ? 1.1 : 0.8;

  // 月による季節補正（スギ：2〜4月、ヒノキ：3〜5月）
  const sugiMonthMult = month === 2 ? 0.6 : month === 3 ? 1.0 : month === 4 ? 0.7 : month === 1 || month === 5 ? 0.2 : 0;
  const hinokiMonthMult = month === 3 ? 0.5 : month === 4 ? 1.0 : month === 5 ? 0.6 : month === 2 ? 0.1 : 0;

  const baseScore = tempScore * windScore * humidScore * prevWeatherMult;
  const sugiIndex = Math.min(100, Math.round(baseScore * 100 * sugiMonthMult));
  const hinokiIndex = Math.min(100, Math.round(baseScore * 100 * hinokiMonthMult));
  const totalIndex = Math.min(100, Math.round((sugiIndex + hinokiIndex) * 0.7));

  let level: Result["level"];
  let color: string;
  let bgColor: string;
  let advice: string[];

  if (totalIndex < 20) {
    level = "少ない";
    color = "text-green-700";
    bgColor = "bg-green-50 border-green-200";
    advice = ["花粉の飛散は少ない見込みです", "症状が軽い方は通常通り過ごせます"];
  } else if (totalIndex < 50) {
    level = "やや多い";
    color = "text-yellow-700";
    bgColor = "bg-yellow-50 border-yellow-200";
    advice = ["外出時はマスクを着用しましょう", "洗濯物の外干しは短時間にしましょう", "帰宅後は手洗い・うがいを"];
  } else if (totalIndex < 75) {
    level = "多い";
    color = "text-orange-700";
    bgColor = "bg-orange-50 border-orange-200";
    advice = ["不要不急の外出を控えましょう", "マスク・メガネで防御を", "窓を閉めてエアコンを使用", "帰宅時は衣服をよく払ってから入室", "抗アレルギー薬を服用している方は忘れず"];
  } else {
    level = "非常に多い";
    color = "text-red-700";
    bgColor = "bg-red-50 border-red-200";
    advice = ["外出はできるだけ避けてください", "やむを得ない外出にはマスク・メガネ必須", "換気は最小限に、空気清浄機を活用", "洗濯物の外干しは避けましょう", "症状がひどい場合は医療機関へ"];
  }

  return { sugiIndex, hinokiIndex, totalIndex, level, color, bgColor, advice };
}

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function KafunFlight() {
  const [inputs, setInputs] = useState<Inputs>({
    temp: "15",
    wind: "4",
    humidity: "50",
    prevWeather: "sunny",
    month: String(new Date().getMonth() + 1),
  });

  const set = (key: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setInputs((prev) => ({ ...prev, [key]: e.target.value }));

  const result = calcIndex(inputs);

  return (
    <div className="space-y-6">
      {/* 入力フォーム */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">気象条件を入力</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-gray-600 mb-1">月</label>
            <select
              value={inputs.month}
              onChange={set("month")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}月</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              気温 <span className="text-gray-400">（°C）</span>
            </label>
            <input
              type="number"
              value={inputs.temp}
              onChange={set("temp")}
              min={-10}
              max={40}
              step={0.5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              風速 <span className="text-gray-400">（m/s）</span>
            </label>
            <input
              type="number"
              value={inputs.wind}
              onChange={set("wind")}
              min={0}
              max={30}
              step={0.5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              湿度 <span className="text-gray-400">（%）</span>
            </label>
            <input
              type="number"
              value={inputs.humidity}
              onChange={set("humidity")}
              min={0}
              max={100}
              step={1}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-600 mb-2">前日の天気</label>
            <div className="flex gap-3">
              {([["sunny", "☀️ 晴れ"], ["cloudy", "☁️ 曇り"], ["rainy", "🌧️ 雨"]] as [PrevWeather, string][]).map(
                ([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setInputs((p) => ({ ...p, prevWeather: val }))}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      inputs.prevWeather === val
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
            {inputs.prevWeather === "rainy" && (
              <p className="text-xs text-orange-600 mt-1">⚠️ 雨の翌日は花粉が一気に飛散しやすくなります</p>
            )}
          </div>
        </div>
      </div>

      {/* 結果 */}
      {result && (
        <>
          <div className={`rounded-2xl border-2 p-6 ${result.bgColor}`}>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">総合飛散指数</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-bold ${result.color}`}>{result.totalIndex}</span>
                  <span className="text-gray-500">/ 100</span>
                </div>
              </div>
              <div className={`text-2xl font-bold px-6 py-3 rounded-xl bg-white shadow-sm ${result.color}`}>
                {result.level}
              </div>
            </div>
            <div className="h-4 bg-white rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  result.totalIndex < 20 ? "bg-green-500" :
                  result.totalIndex < 50 ? "bg-yellow-400" :
                  result.totalIndex < 75 ? "bg-orange-500" : "bg-red-500"
                }`}
                style={{ width: `${result.totalIndex}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "スギ花粉", index: result.sugiIndex, emoji: "🌲" },
              { name: "ヒノキ花粉", index: result.hinokiIndex, emoji: "🌳" },
            ].map((item) => (
              <div key={item.name} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="text-2xl mb-2">{item.emoji}</div>
                <div className="text-sm text-gray-600 mb-1">{item.name}</div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{item.index}</div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${item.index}%`,
                      backgroundColor: item.index < 20 ? "#22c55e" : item.index < 50 ? "#eab308" : item.index < 75 ? "#f97316" : "#ef4444",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-3">対策アドバイス</h3>
            <ul className="space-y-2">
              {result.advice.map((a) => (
                <li key={a} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-500 mt-0.5">✓</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="text-xs text-gray-400 text-center">
        ※ 本ツールは気象条件から飛散リスクを推計するものです。実際の飛散量は気象庁・各都道府県の情報をご確認ください。
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この花粉飛散指数計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">気温・風速・湿度・前日の天気を入力して、その日の花粉飛散リスク指数を予測。スギ・ヒノキ別の注意度も表示。。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この花粉飛散指数計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "気温・風速・湿度・前日の天気を入力して、その日の花粉飛散リスク指数を予測。スギ・ヒノキ別の注意度も表示。。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "花粉飛散指数計算",
  "description": "気温・風速・湿度・前日の天気を入力して、その日の花粉飛散リスク指数を予測。スギ・ヒノキ別の注意度も表示。",
  "url": "https://tools.loresync.dev/kafun-flight",
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
