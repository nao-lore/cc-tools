"use client";

import { useState, useMemo, useCallback } from "react";

// --- 料金データ ---
type Model = {
  id: string;
  name: string;
  inputPer1M: number;
  outputPer1M: number;
  tier: "high" | "mid" | "low";
  notes?: string;
};

type Provider = {
  id: string;
  name: string;
  color: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  accentRing: string;
  models: Model[];
};

const PROVIDERS: Provider[] = [
  {
    id: "openai",
    name: "OpenAI",
    color: "green",
    accentBg: "bg-green-50",
    accentText: "text-green-700",
    accentBorder: "border-green-300",
    accentRing: "ring-green-400",
    models: [
      { id: "gpt-4o", name: "GPT-4o", inputPer1M: 2.5, outputPer1M: 10.0, tier: "high" },
      { id: "gpt-4o-mini", name: "GPT-4o mini", inputPer1M: 0.15, outputPer1M: 0.6, tier: "low" },
      { id: "gpt-4.1", name: "GPT-4.1", inputPer1M: 2.0, outputPer1M: 8.0, tier: "high" },
      { id: "gpt-4.1-mini", name: "GPT-4.1 mini", inputPer1M: 0.4, outputPer1M: 1.6, tier: "mid" },
      { id: "gpt-4.1-nano", name: "GPT-4.1 nano", inputPer1M: 0.1, outputPer1M: 0.4, tier: "low" },
      { id: "o3", name: "o3", inputPer1M: 10.0, outputPer1M: 40.0, tier: "high" },
      { id: "o3-mini", name: "o3-mini", inputPer1M: 1.1, outputPer1M: 4.4, tier: "mid" },
      { id: "o4-mini", name: "o4-mini", inputPer1M: 1.1, outputPer1M: 4.4, tier: "mid" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    color: "orange",
    accentBg: "bg-orange-50",
    accentText: "text-orange-700",
    accentBorder: "border-orange-300",
    accentRing: "ring-orange-400",
    models: [
      { id: "claude-opus-4", name: "Claude Opus 4", inputPer1M: 15.0, outputPer1M: 75.0, tier: "high" },
      { id: "claude-sonnet-4", name: "Claude Sonnet 4", inputPer1M: 3.0, outputPer1M: 15.0, tier: "mid" },
      { id: "claude-haiku-3.5", name: "Claude Haiku 3.5", inputPer1M: 0.8, outputPer1M: 4.0, tier: "low" },
    ],
  },
  {
    id: "google",
    name: "Google",
    color: "blue",
    accentBg: "bg-blue-50",
    accentText: "text-blue-700",
    accentBorder: "border-blue-300",
    accentRing: "ring-blue-400",
    models: [
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", inputPer1M: 1.25, outputPer1M: 10.0, tier: "high", notes: "200K tokens以下" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", inputPer1M: 0.15, outputPer1M: 0.6, tier: "mid" },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", inputPer1M: 0.1, outputPer1M: 0.4, tier: "low" },
    ],
  },
];

// トークン数を推定する
function estimateTokens(text: string, lang: "ja" | "en"): number {
  if (!text.trim()) return 0;
  if (lang === "ja") {
    // 日本語: 1文字 ≈ 1.7トークン
    return Math.round(text.length * 1.7);
  } else {
    // 英語: 1単語 ≈ 1.3トークン
    const words = text.trim().split(/\s+/).length;
    return Math.round(words * 1.3);
  }
}

// 数値フォーマット
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

function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
  label,
  unit,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
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
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-700"
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
            className="w-28 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          {unit && <span className="text-sm text-gray-500 whitespace-nowrap">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

export default function AiCostCalculator() {
  // 設定
  const [providerId, setProviderId] = useState<string>("anthropic");
  const [modelId, setModelId] = useState<string>("claude-sonnet-4");
  const [inputTokens, setInputTokens] = useState<number>(1000);
  const [outputTokens, setOutputTokens] = useState<number>(500);
  const [requestsPerDay, setRequestsPerDay] = useState<number>(100);
  const [exchangeRate, setExchangeRate] = useState<number>(150);

  // テキスト→トークン推定
  const [estimateText, setEstimateText] = useState<string>("");
  const [estimateLang, setEstimateLang] = useState<"ja" | "en">("ja");
  const [estimateTarget, setEstimateTarget] = useState<"input" | "output">("input");

  const provider = PROVIDERS.find((p) => p.id === providerId) ?? PROVIDERS[0];
  const model = provider.models.find((m) => m.id === modelId) ?? provider.models[0];

  // プロバイダー切り替え時にモデルをリセット
  const handleProviderChange = useCallback(
    (newProviderId: string) => {
      setProviderId(newProviderId);
      const newProvider = PROVIDERS.find((p) => p.id === newProviderId);
      if (newProvider) setModelId(newProvider.models[0].id);
    },
    []
  );

  // コスト計算
  const cost = useMemo(() => {
    const perRequest =
      (inputTokens / 1_000_000) * model.inputPer1M +
      (outputTokens / 1_000_000) * model.outputPer1M;
    const perDay = perRequest * requestsPerDay;
    const perMonth = perDay * 30;
    const perYear = perDay * 365;
    return { perRequest, perDay, perMonth, perYear };
  }, [inputTokens, outputTokens, requestsPerDay, model]);

  // 比較表: 全モデル
  const allModels = useMemo(() => {
    return PROVIDERS.flatMap((p) =>
      p.models.map((m) => ({
        ...m,
        provider: p,
        perRequest:
          (inputTokens / 1_000_000) * m.inputPer1M +
          (outputTokens / 1_000_000) * m.outputPer1M,
      }))
    ).sort((a, b) => a.perRequest - b.perRequest);
  }, [inputTokens, outputTokens]);

  // テキスト推定
  const estimatedTokenCount = useMemo(
    () => estimateTokens(estimateText, estimateLang),
    [estimateText, estimateLang]
  );

  const handleApplyEstimate = useCallback(() => {
    if (estimateTarget === "input") setInputTokens(estimatedTokenCount);
    else setOutputTokens(estimatedTokenCount);
  }, [estimatedTokenCount, estimateTarget]);

  const tierLabel: Record<string, string> = { high: "高性能", mid: "バランス", low: "高速・低コスト" };

  return (
    <div className="space-y-6">
      {/* ===== プロバイダー選択 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">モデルを選択</h2>

        {/* プロバイダータブ */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProviderChange(p.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                providerId === p.id
                  ? `${p.accentBg} ${p.accentText} ${p.accentBorder} shadow-sm`
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* モデル選択 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {provider.models.map((m) => (
            <button
              key={m.id}
              onClick={() => setModelId(m.id)}
              className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all ${
                modelId === m.id
                  ? `${provider.accentBg} ${provider.accentBorder} ring-2 ${provider.accentRing}`
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div>
                <div className="font-medium text-gray-900 text-sm">{m.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{tierLabel[m.tier]}</div>
                {m.notes && <div className="text-xs text-gray-400">{m.notes}</div>}
              </div>
              <div className="text-right ml-2 shrink-0">
                <div className="text-xs text-gray-600">${m.inputPer1M}/1M in</div>
                <div className="text-xs text-gray-600">${m.outputPer1M}/1M out</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ===== パラメーター設定 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">パラメーター設定</h2>

        <div className="space-y-5">
          <NumberInput
            label="入力トークン数（1リクエストあたり）"
            value={inputTokens}
            onChange={setInputTokens}
            min={100}
            max={200000}
            step={100}
            unit="tokens"
          />
          <NumberInput
            label="出力トークン数（1リクエストあたり）"
            value={outputTokens}
            onChange={setOutputTokens}
            min={100}
            max={32000}
            step={100}
            unit="tokens"
          />
          <NumberInput
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              為替レート
            </label>
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
                className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <span className="text-sm text-gray-500">円</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== テキスト→トークン推定 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">テキスト→トークン数を推定</h2>
        <p className="text-xs text-gray-500 mb-4">
          テキストを貼り付けると、おおよそのトークン数を計算します（日本語: 1文字≈1.7トークン / 英語: 1単語≈1.3トークン）
        </p>

        <div className="flex gap-2 mb-3 flex-wrap">
          <div className="flex gap-1">
            {(["ja", "en"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setEstimateLang(lang)}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                  estimateLang === lang
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {lang === "ja" ? "日本語" : "English"}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(["input", "output"] as const).map((target) => (
              <button
                key={target}
                onClick={() => setEstimateTarget(target)}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                  estimateTarget === target
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {target === "input" ? "入力に適用" : "出力に適用"}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={estimateText}
          onChange={(e) => setEstimateText(e.target.value)}
          placeholder="ここにテキストを貼り付け..."
          className="w-full h-28 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
        />

        {estimateText && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              推定トークン数:{" "}
              <span className="font-bold text-gray-900 text-base">
                {estimatedTokenCount.toLocaleString()}
              </span>{" "}
              tokens
            </span>
            <button
              onClick={handleApplyEstimate}
              className="px-4 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              {estimateTarget === "input" ? "入力トークンに適用" : "出力トークンに適用"}
            </button>
          </div>
        )}
      </div>

      {/* ===== 計算結果 ===== */}
      <div className={`rounded-2xl shadow-sm border p-6 ${provider.accentBg} ${provider.accentBorder}`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">計算結果</h2>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${provider.accentBg} ${provider.accentText} border ${provider.accentBorder}`}>
            {provider.name} / {model.name}
          </span>
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
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "日額", usd: cost.perDay, days: 1 },
            { label: "月額", usd: cost.perMonth, days: 30 },
            { label: "年額", usd: cost.perYear, days: 365 },
          ].map(({ label, usd }) => (
            <div key={label} className="bg-white bg-opacity-70 rounded-xl p-3 text-center shadow-sm">
              <div className="text-xs text-gray-500 mb-1">{label}</div>
              <div className="text-lg font-bold text-gray-900">{fmtUSD(usd)}</div>
              <div className="text-xs text-gray-600 mt-0.5">{fmtJPY(usd * exchangeRate)}</div>
            </div>
          ))}
        </div>

        {/* 内訳 */}
        <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-xl text-xs text-gray-600 space-y-1">
          <div className="font-medium text-gray-700 mb-1.5">コスト内訳</div>
          <div className="flex justify-between">
            <span>入力 {inputTokens.toLocaleString()} tokens × ${model.inputPer1M}/1M</span>
            <span className="font-medium">{fmtUSD((inputTokens / 1_000_000) * model.inputPer1M)}</span>
          </div>
          <div className="flex justify-between">
            <span>出力 {outputTokens.toLocaleString()} tokens × ${model.outputPer1M}/1M</span>
            <span className="font-medium">{fmtUSD((outputTokens / 1_000_000) * model.outputPer1M)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
            <span>1日 {requestsPerDay.toLocaleString()} リクエスト × 上記単価</span>
            <span className="font-medium">{fmtUSD(cost.perDay)}/日</span>
          </div>
        </div>
      </div>

      {/* ===== 全モデル比較表 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">全モデル比較</h2>
        <p className="text-xs text-gray-500 mb-4">
          現在の入力 {inputTokens.toLocaleString()} tokens / 出力 {outputTokens.toLocaleString()} tokens で1リクエストあたりのコストを比較
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-3 text-xs text-gray-500 font-medium">プロバイダー</th>
                <th className="text-left py-2 pr-3 text-xs text-gray-500 font-medium">モデル</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">input/1M</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">output/1M</th>
                <th className="text-right py-2 text-xs text-gray-500 font-medium">1リクエスト</th>
              </tr>
            </thead>
            <tbody>
              {allModels.map((m) => {
                const isSelected = m.id === modelId;
                const providerColors: Record<string, string> = {
                  openai: "text-green-700 bg-green-50",
                  anthropic: "text-orange-700 bg-orange-50",
                  google: "text-blue-700 bg-blue-50",
                };
                return (
                  <tr
                    key={m.id}
                    className={`border-b border-gray-50 cursor-pointer transition-colors ${
                      isSelected ? "bg-gray-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setProviderId(m.provider.id);
                      setModelId(m.id);
                    }}
                  >
                    <td className="py-2 pr-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          providerColors[m.provider.id] ?? "text-gray-600 bg-gray-100"
                        }`}
                      >
                        {m.provider.name}
                      </span>
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`font-medium ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                        {m.name}
                      </span>
                      {isSelected && (
                        <span className="ml-1.5 text-xs text-gray-400">← 選択中</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right text-gray-600">${m.inputPer1M}</td>
                    <td className="py-2 pr-3 text-right text-gray-600">${m.outputPer1M}</td>
                    <td className="py-2 text-right font-semibold text-gray-900">
                      {fmtUSD(m.perRequest)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-2">行をクリックするとそのモデルに切り替わります</p>
      </div>

      {/* ===== フッター注記 ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        料金は変更される場合があります。最新の料金は各社の公式サイトをご確認ください。
      </p>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このAI API コスト計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">ChatGPT、Claude、Geminiの各モデルのAPI利用料金をリアルタイムで計算。トークン数・リクエスト数から月額コストを試算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このAI API コスト計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "ChatGPT、Claude、Geminiの各モデルのAPI利用料金をリアルタイムで計算。トークン数・リクエスト数から月額コストを試算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
