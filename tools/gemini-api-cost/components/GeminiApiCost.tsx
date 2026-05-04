"use client";

import { useState, useMemo } from "react";

// --- 料金データ ---
type ContextTier = "standard" | "long";

type ModelPricing = {
  inputPer1M: Record<ContextTier, number>;
  outputPer1M: Record<ContextTier, number>;
  thinkingPer1M?: number;
  hasThinking: boolean;
  hasContextTiers: boolean;
};

type Model = {
  id: string;
  name: string;
  shortName: string;
  pricing: ModelPricing;
  tier: "high" | "mid" | "low";
  freeRpm: number;
  freeTpm: number;
  freeRpd: number;
};

const MODELS: Model[] = [
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    shortName: "2.5 Pro",
    tier: "high",
    pricing: {
      inputPer1M: { standard: 1.25, long: 2.50 },
      outputPer1M: { standard: 10.00, long: 15.00 },
      thinkingPer1M: 3.50,
      hasThinking: true,
      hasContextTiers: true,
    },
    freeRpm: 5,
    freeTpm: 1_000_000,
    freeRpd: 25,
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    shortName: "2.5 Flash",
    tier: "mid",
    pricing: {
      inputPer1M: { standard: 0.15, long: 0.30 },
      outputPer1M: { standard: 0.60, long: 1.20 },
      thinkingPer1M: 1.25,
      hasThinking: true,
      hasContextTiers: true,
    },
    freeRpm: 10,
    freeTpm: 1_000_000,
    freeRpd: 500,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    shortName: "2.0 Flash",
    tier: "low",
    pricing: {
      inputPer1M: { standard: 0.10, long: 0.10 },
      outputPer1M: { standard: 0.40, long: 0.40 },
      hasThinking: false,
      hasContextTiers: false,
    },
    freeRpm: 15,
    freeTpm: 1_000_000,
    freeRpd: 1500,
  },
];

// --- フォーマット ---
function fmtUSD(n: number): string {
  if (n < 0.001) return `$${n.toFixed(6)}`;
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(3)}`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtJPY(n: number): string {
  if (n < 1) return `${n.toFixed(2)}円`;
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function fmtNum(n: number): string {
  return n.toLocaleString("ja-JP");
}

// --- サブコンポーネント ---
function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v)) onChange(Math.min(Math.max(v, min), max));
            }}
            className="w-28 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {unit && <span className="text-sm text-gray-500 whitespace-nowrap">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

// --- メインコンポーネント ---
export default function GeminiApiCost() {
  const [modelId, setModelId] = useState<string>("gemini-2.5-pro");
  const [contextTier, setContextTier] = useState<ContextTier>("standard");
  const [inputTokens, setInputTokens] = useState<number>(10000);
  const [outputTokens, setOutputTokens] = useState<number>(2000);
  const [thinkingTokens, setThinkingTokens] = useState<number>(5000);
  const [useThinking, setUseThinking] = useState<boolean>(false);
  const [requestsPerDay, setRequestsPerDay] = useState<number>(100);
  const [exchangeRate, setExchangeRate] = useState<number>(150);

  const model = MODELS.find((m) => m.id === modelId) ?? MODELS[0];

  // コスト計算
  const cost = useMemo(() => {
    const p = model.pricing;
    const tier = model.pricing.hasContextTiers ? contextTier : "standard";

    const inputCost = (inputTokens / 1_000_000) * p.inputPer1M[tier];
    const outputCost = (outputTokens / 1_000_000) * p.outputPer1M[tier];
    const thinkingCost =
      useThinking && p.hasThinking && p.thinkingPer1M
        ? (thinkingTokens / 1_000_000) * p.thinkingPer1M
        : 0;

    const perRequest = inputCost + outputCost + thinkingCost;
    const perDay = perRequest * requestsPerDay;
    const perMonth = perDay * 30;
    const perYear = perDay * 365;

    return { perRequest, perDay, perMonth, perYear, inputCost, outputCost, thinkingCost };
  }, [model, contextTier, inputTokens, outputTokens, thinkingTokens, useThinking, requestsPerDay]);

  // 3モデル比較
  const comparison = useMemo(() => {
    return MODELS.map((m) => {
      const tier = m.pricing.hasContextTiers ? contextTier : "standard";
      const ic = (inputTokens / 1_000_000) * m.pricing.inputPer1M[tier];
      const oc = (outputTokens / 1_000_000) * m.pricing.outputPer1M[tier];
      const tc =
        useThinking && m.pricing.hasThinking && m.pricing.thinkingPer1M
          ? (thinkingTokens / 1_000_000) * m.pricing.thinkingPer1M
          : 0;
      const perRequest = ic + oc + tc;
      return { ...m, perRequest, perDay: perRequest * requestsPerDay };
    });
  }, [contextTier, inputTokens, outputTokens, thinkingTokens, useThinking, requestsPerDay]);

  const tierLabel: Record<string, string> = {
    high: "高性能",
    mid: "バランス",
    low: "高速・低コスト",
  };

  const tierBadgeClass: Record<string, string> = {
    high: "bg-purple-50 text-purple-700 border-purple-200",
    mid: "bg-blue-50 text-blue-700 border-blue-200",
    low: "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <div className="space-y-6">
      {/* ===== モデル選択 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">モデルを選択</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODELS.map((m) => {
            const isSelected = modelId === m.id;
            const tier = m.pricing.hasContextTiers ? contextTier : "standard";
            return (
              <button
                key={m.id}
                onClick={() => setModelId(m.id)}
                className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-blue-50 border-blue-300 ring-2 ring-blue-400"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-semibold text-gray-900 text-sm">{m.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tierBadgeClass[m.tier]}`}>
                    {tierLabel[m.tier]}
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-0.5">
                  <div>in: ${m.pricing.inputPer1M[tier]}/1M</div>
                  <div>out: ${m.pricing.outputPer1M[tier]}/1M</div>
                  {m.pricing.hasThinking && (
                    <div>thinking: ${m.pricing.thinkingPer1M}/1M</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== コンテキスト長選択 ===== */}
      {model.pricing.hasContextTiers && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">コンテキスト長</h2>
          <p className="text-xs text-gray-500 mb-4">
            200K トークンを境に料金が変わります。入力+出力+thinking の合計コンテキスト長で選択してください。
          </p>
          <div className="flex gap-3 flex-wrap">
            {(["standard", "long"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setContextTier(t)}
                className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  contextTier === t
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {t === "standard" ? "200K以下（通常料金）" : "200K超（長文コンテキスト）"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== パラメーター設定 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">パラメーター設定</h2>
        <div className="space-y-5">
          <SliderInput
            label="入力トークン数（1リクエストあたり）"
            value={inputTokens}
            onChange={setInputTokens}
            min={100}
            max={500000}
            step={100}
            unit="tokens"
          />
          <SliderInput
            label="出力トークン数（1リクエストあたり）"
            value={outputTokens}
            onChange={setOutputTokens}
            min={100}
            max={65536}
            step={100}
            unit="tokens"
          />

          {/* Thinking tokens */}
          {model.pricing.hasThinking && (
            <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/40">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">Thinking トークン</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Gemini 2.5 のThinking機能（内部推論）を使う場合
                  </div>
                </div>
                <button
                  onClick={() => setUseThinking((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    useThinking ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      useThinking ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              {useThinking && (
                <SliderInput
                  label="Thinkingトークン数（1リクエストあたり）"
                  value={thinkingTokens}
                  onChange={setThinkingTokens}
                  min={100}
                  max={32768}
                  step={100}
                  unit="tokens"
                />
              )}
            </div>
          )}

          <SliderInput
            label="1日あたりのリクエスト数"
            value={requestsPerDay}
            onChange={setRequestsPerDay}
            min={1}
            max={100000}
            step={1}
            unit="回/日"
          />

          {/* 為替レート */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">為替レート</label>
            <div className="flex items-center gap-2 w-fit">
              <span className="text-sm text-gray-500">1 USD =</span>
              <input
                type="number"
                min={50}
                max={300}
                step={1}
                value={exchangeRate}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!isNaN(v) && v > 0) setExchangeRate(v);
                }}
                className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-sm text-gray-500">円</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 計算結果 ===== */}
      <div className="rounded-2xl shadow-sm border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-gray-800">計算結果</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {model.name}
            </span>
            {model.pricing.hasContextTiers && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white text-gray-600 border border-gray-200">
                {contextTier === "standard" ? "200K以下" : "200K超"}
              </span>
            )}
          </div>
        </div>

        {/* 1リクエストあたり */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-1">1リクエストあたり</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-bold text-gray-900">{fmtUSD(cost.perRequest)}</span>
            <span className="text-xl text-gray-600">{fmtJPY(cost.perRequest * exchangeRate)}</span>
          </div>
        </div>

        {/* 日/月/年 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "日額", usd: cost.perDay },
            { label: "月額", usd: cost.perMonth },
            { label: "年額", usd: cost.perYear },
          ].map(({ label, usd }) => (
            <div key={label} className="bg-white bg-opacity-70 rounded-xl p-3 text-center shadow-sm">
              <div className="text-xs text-gray-500 mb-1">{label}</div>
              <div className="text-lg font-bold text-gray-900">{fmtUSD(usd)}</div>
              <div className="text-xs text-gray-600 mt-0.5">{fmtJPY(usd * exchangeRate)}</div>
            </div>
          ))}
        </div>

        {/* コスト内訳 */}
        <div className="p-3 bg-white bg-opacity-50 rounded-xl text-xs text-gray-600 space-y-1">
          <div className="font-medium text-gray-700 mb-1.5">コスト内訳（1リクエスト）</div>
          <div className="flex justify-between">
            <span>入力 {fmtNum(inputTokens)} tokens × ${model.pricing.inputPer1M[model.pricing.hasContextTiers ? contextTier : "standard"]}/1M</span>
            <span className="font-medium">{fmtUSD(cost.inputCost)}</span>
          </div>
          <div className="flex justify-between">
            <span>出力 {fmtNum(outputTokens)} tokens × ${model.pricing.outputPer1M[model.pricing.hasContextTiers ? contextTier : "standard"]}/1M</span>
            <span className="font-medium">{fmtUSD(cost.outputCost)}</span>
          </div>
          {useThinking && model.pricing.hasThinking && cost.thinkingCost > 0 && (
            <div className="flex justify-between">
              <span>Thinking {fmtNum(thinkingTokens)} tokens × ${model.pricing.thinkingPer1M}/1M</span>
              <span className="font-medium">{fmtUSD(cost.thinkingCost)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
            <span>1日 {fmtNum(requestsPerDay)} リクエスト × 上記単価</span>
            <span className="font-medium">{fmtUSD(cost.perDay)}/日</span>
          </div>
        </div>
      </div>

      {/* ===== 3モデル比較表 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">3モデル比較</h2>
        <p className="text-xs text-gray-500 mb-4">
          現在の設定（入力 {fmtNum(inputTokens)} / 出力 {fmtNum(outputTokens)} tokens
          {useThinking ? ` / thinking ${fmtNum(thinkingTokens)}` : ""}）で1リクエストあたりのコストを比較
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-3 text-xs text-gray-500 font-medium">モデル</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">input/1M</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">output/1M</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">thinking/1M</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">1リクエスト</th>
                <th className="text-right py-2 text-xs text-gray-500 font-medium">日額</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((m) => {
                const isSelected = m.id === modelId;
                const tier = m.pricing.hasContextTiers ? contextTier : "standard";
                return (
                  <tr
                    key={m.id}
                    onClick={() => setModelId(m.id)}
                    className={`border-b border-gray-50 cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="py-2.5 pr-3">
                      <div className={`font-medium ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                        {m.name}
                      </div>
                      {isSelected && (
                        <div className="text-xs text-blue-400 mt-0.5">選択中
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このGemini API コスト計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">Google Gemini APIの各モデル（2.5 Pro, 2.5 Flash, 2.0 Flash）の利用料金をトークン数から計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このGemini API コスト計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "Google Gemini APIの各モデル（2.5 Pro, 2.5 Flash, 2.0 Flash）の利用料金をトークン数から計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-gray-600">${m.pricing.inputPer1M[tier]}</td>
                    <td className="py-2.5 pr-3 text-right text-gray-600">${m.pricing.outputPer1M[tier]}</td>
                    <td className="py-2.5 pr-3 text-right text-gray-500">
                      {m.pricing.thinkingPer1M ? `$${m.pricing.thinkingPer1M}` : "—"}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-semibold text-gray-900">
                      {fmtUSD(m.perRequest)}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-gray-900">
                      {fmtUSD(m.perDay)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">行をクリックするとそのモデルに切り替わります</p>
      </div>

      {/* ===== 無料枠 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">無料利用枠（Google AI Studio）</h2>
        <p className="text-xs text-gray-500 mb-4">
          Google AI Studio では各モデルに無料枠が設定されています。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-3 text-xs text-gray-500 font-medium">モデル</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">RPM</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">TPM</th>
                <th className="text-right py-2 text-xs text-gray-500 font-medium">RPD</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map((m) => (
                <tr key={m.id} className="border-b border-gray-50">
                  <td className="py-2.5 pr-3 font-medium text-gray-700">{m.name}</td>
                  <td className="py-2.5 pr-3 text-right text-gray-600">{fmtNum(m.freeRpm)}</td>
                  <td className="py-2.5 pr-3 text-right text-gray-600">{fmtNum(m.freeTpm)}</td>
                  <td className="py-2.5 text-right text-gray-600">{fmtNum(m.freeRpd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          RPM: 1分あたりリクエスト数 / TPM: 1分あたりトークン数 / RPD: 1日あたりリクエスト数
        </p>
      </div>

      {/* ===== フッター注記 ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        料金は変更される場合があります。最新の料金はGoogle AI公式サイトをご確認ください。
      </p>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Gemini API コスト計算",
  "description": "Google Gemini APIの各モデル（2.5 Pro, 2.5 Flash, 2.0 Flash）の利用料金をトークン数から計算",
  "url": "https://tools.loresync.dev/gemini-api-cost",
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
