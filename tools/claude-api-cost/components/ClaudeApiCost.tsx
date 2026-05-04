"use client";

import { useState, useMemo, useCallback } from "react";

// --- 料金データ ---
type CacheMode = "none" | "write" | "read";
type ApiMode = "standard" | "batch";

type Model = {
  id: string;
  name: string;
  inputPer1M: number;   // 通常API input
  outputPer1M: number;  // 通常API output
  tier: "high" | "mid" | "low";
  contextWindow: string;
};

const MODELS: Model[] = [
  {
    id: "claude-opus-4",
    name: "Claude Opus 4",
    inputPer1M: 15.0,
    outputPer1M: 75.0,
    tier: "high",
    contextWindow: "200K",
  },
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    inputPer1M: 3.0,
    outputPer1M: 15.0,
    tier: "mid",
    contextWindow: "200K",
  },
  {
    id: "claude-haiku-3.5",
    name: "Claude Haiku 3.5",
    inputPer1M: 0.8,
    outputPer1M: 4.0,
    tier: "low",
    contextWindow: "200K",
  },
];

// プロンプトキャッシュ倍率
const CACHE_MULTIPLIERS: Record<CacheMode, { input: number; label: string; desc: string }> = {
  none:  { input: 1.0,   label: "キャッシュなし",     desc: "通常の入力トークン料金" },
  write: { input: 1.25,  label: "キャッシュ書き込み", desc: "入力料金 × 1.25（初回キャッシュ時）" },
  read:  { input: 0.1,   label: "キャッシュ読み取り", desc: "入力料金 × 0.1（2回目以降）" },
};

// 数値フォーマット
function fmtUSD(n: number): string {
  if (n === 0) return "$0.000000";
  if (n < 0.000001) return `$${n.toExponential(2)}`;
  if (n < 0.001) return `$${n.toFixed(6)}`;
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(3)}`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtJPY(n: number): string {
  if (n < 0.01) return `${n.toFixed(4)}円`;
  if (n < 1) return `${n.toFixed(2)}円`;
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

// トークン数推定
function estimateTokens(text: string, lang: "ja" | "en"): number {
  if (!text.trim()) return 0;
  if (lang === "ja") {
    return Math.round(text.length * 2);
  } else {
    const words = text.trim().split(/\s+/).length;
    return Math.round(words * 1.3);
  }
}

// --- サブコンポーネント ---
function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
  label,
  unit,
  accentClass,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  label: string;
  unit?: string;
  accentClass?: string;
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
          className={`flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${accentClass ?? "accent-amber-600"}`}
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
            className="w-28 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          {unit && <span className="text-sm text-gray-500 whitespace-nowrap">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

// --- コスト計算ロジック ---
function calcCost(
  inputTokens: number,
  outputTokens: number,
  requestsPerDay: number,
  model: Model,
  apiMode: ApiMode,
  cacheMode: CacheMode
) {
  const batchDiscount = apiMode === "batch" ? 0.5 : 1.0;
  const cacheMultiplier = CACHE_MULTIPLIERS[cacheMode].input;

  const inputCost = (inputTokens / 1_000_000) * model.inputPer1M * batchDiscount * cacheMultiplier;
  const outputCost = (outputTokens / 1_000_000) * model.outputPer1M * batchDiscount;
  const perRequest = inputCost + outputCost;
  const perDay = perRequest * requestsPerDay;

  return {
    perRequest,
    perDay,
    perMonth: perDay * 30,
    perYear: perDay * 365,
    inputCost,
    outputCost,
    batchDiscount,
    cacheMultiplier,
  };
}

// --- メインコンポーネント ---
export default function ClaudeApiCost() {
  const [modelId, setModelId] = useState<string>("claude-sonnet-4");
  const [inputTokens, setInputTokens] = useState<number>(1000);
  const [outputTokens, setOutputTokens] = useState<number>(500);
  const [requestsPerDay, setRequestsPerDay] = useState<number>(100);
  const [exchangeRate, setExchangeRate] = useState<number>(150);
  const [apiMode, setApiMode] = useState<ApiMode>("standard");
  const [cacheMode, setCacheMode] = useState<CacheMode>("none");

  // テキスト→トークン推定
  const [estimateText, setEstimateText] = useState<string>("");
  const [estimateLang, setEstimateLang] = useState<"ja" | "en">("ja");
  const [estimateTarget, setEstimateTarget] = useState<"input" | "output">("input");

  const model = MODELS.find((m) => m.id === modelId) ?? MODELS[1];

  const cost = useMemo(
    () => calcCost(inputTokens, outputTokens, requestsPerDay, model, apiMode, cacheMode),
    [inputTokens, outputTokens, requestsPerDay, model, apiMode, cacheMode]
  );

  // 3モデル比較
  const comparisonData = useMemo(() =>
    MODELS.map((m) => ({
      ...m,
      cost: calcCost(inputTokens, outputTokens, requestsPerDay, m, apiMode, cacheMode),
    })),
    [inputTokens, outputTokens, requestsPerDay, apiMode, cacheMode]
  );

  const estimatedTokenCount = useMemo(
    () => estimateTokens(estimateText, estimateLang),
    [estimateText, estimateLang]
  );

  const handleApplyEstimate = useCallback(() => {
    if (estimateTarget === "input") setInputTokens(estimatedTokenCount);
    else setOutputTokens(estimatedTokenCount);
  }, [estimatedTokenCount, estimateTarget]);

  const tierLabel: Record<string, string> = {
    high: "高性能",
    mid: "バランス",
    low: "高速・低コスト",
  };

  return (
    <div className="space-y-6">

      {/* ===== モデル選択 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">モデルを選択</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => setModelId(m.id)}
              className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                modelId === m.id
                  ? "bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-sm"
                  : "border-gray-200 hover:border-amber-200 hover:bg-amber-50/40"
              }`}
            >
              <div className="font-semibold text-gray-900 text-sm mb-1">{m.name}</div>
              <div className="text-xs text-amber-700 font-medium mb-2">{tierLabel[m.tier]}</div>
              <div className="text-xs text-gray-500 space-y-0.5">
                <div>入力: <span className="font-medium text-gray-700">${m.inputPer1M}/1M</span></div>
                <div>出力: <span className="font-medium text-gray-700">${m.outputPer1M}/1M</span></div>
                <div>コンテキスト: {m.contextWindow}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ===== API モード + キャッシュ設定 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">API設定</h2>
        <div className="space-y-4">

          {/* APIモード */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">APIモード</div>
            <div className="flex gap-2 flex-wrap">
              {([
                { id: "standard", label: "通常 API", desc: "リアルタイム処理" },
                { id: "batch", label: "バッチ API", desc: "50%割引・非同期処理" },
              ] as const).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setApiMode(opt.id)}
                  className={`flex flex-col px-4 py-2.5 rounded-lg border text-left transition-all ${
                    apiMode === opt.id
                      ? "bg-amber-50 border-amber-400 text-amber-800 shadow-sm"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-amber-50/30"
                  }`}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className="text-xs opacity-75">{opt.desc}</span>
                </button>
              ))}
            </div>
            {apiMode === "batch" && (
              <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5">
                バッチAPIは全モデルの入力・出力料金が50%割引になります。24時間以内に処理されます。
              </p>
            )}
          </div>

          {/* プロンプトキャッシュ */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">プロンプトキャッシュ</div>
            <div className="flex gap-2 flex-wrap">
              {(["none", "write", "read"] as CacheMode[]).map((mode) => {
                const info = CACHE_MULTIPLIERS[mode];
                return (
                  <button
                    key={mode}
                    onClick={() => setCacheMode(mode)}
                    className={`flex flex-col px-4 py-2.5 rounded-lg border text-left transition-all ${
                      cacheMode === mode
                        ? "bg-amber-50 border-amber-400 text-amber-800 shadow-sm"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-amber-50/30"
                    }`}
                  >
                    <span className="text-sm font-medium">{info.label}</span>
                    <span className="text-xs opacity-75">{info.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===== パラメーター設定 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
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
                className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <span className="text-sm text-gray-500">円</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== テキスト→トークン推定 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">テキスト → トークン数を推定</h2>
        <p className="text-xs text-gray-500 mb-4">
          テキストを貼り付けてトークン数を概算します（日本語: 1文字 ≈ 2トークン / 英語: 1単語 ≈ 1.3トークン）
        </p>
        <div className="flex gap-2 mb-3 flex-wrap">
          <div className="flex gap-1">
            {(["ja", "en"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setEstimateLang(lang)}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                  estimateLang === lang
                    ? "bg-amber-600 text-white border-amber-600"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-amber-50"
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
                    ? "bg-amber-600 text-white border-amber-600"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-amber-50"
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
          className="w-full h-28 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
        {estimateText && (
          <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm text-gray-700">
              推定トークン数:{" "}
              <span className="font-bold text-gray-900 text-base">
                {estimatedTokenCount.toLocaleString()}
              </span>{" "}
              tokens
            </span>
            <button
              onClick={handleApplyEstimate}
              className="px-4 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors"
            >
              {estimateTarget === "input" ? "入力トークンに適用" : "出力トークンに適用"}
            </button>
          </div>
        )}
      </div>

      {/* ===== 計算結果 ===== */}
      <div className="rounded-2xl shadow-sm border border-amber-300 p-6 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-gray-800">計算結果</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              {model.name}
            </span>
            {apiMode === "batch" && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800 border border-green-300">
                バッチ50%OFF
              </span>
            )}
            {cacheMode !== "none" && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                {CACHE_MULTIPLIERS[cacheMode].label}
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
        <div className="grid grid-cols-3 gap-3 mb-5">
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
        <div className="p-3 bg-white bg-opacity-50 rounded-xl text-xs text-gray-600 space-y-1.5">
          <div className="font-medium text-gray-700 mb-1.5">コスト内訳（1リクエスト）</div>
          <div className="flex justify-between">
            <span>
              入力 {inputTokens.toLocaleString()} tokens × ${model.inputPer1M}/1M
              {cacheMode !== "none" && ` × ${CACHE_MULTIPLIERS[cacheMode].input}（${CACHE_MULTIPLIERS[cacheMode].label}）`}
              {apiMode === "batch" && " × 0.5（バッチ）"}
            </span>
            <span className="font-medium ml-2 shrink-0">{fmtUSD(cost.inputCost)}</span>
          </div>
          <div className="flex justify-between">
            <span>
              出力 {outputTokens.toLocaleString()} tokens × ${model.outputPer1M}/1M
              {apiMode === "batch" && " × 0.5（バッチ）"}
            </span>
            <span className="font-medium ml-2 shrink-0">{fmtUSD(cost.outputCost)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1">
            <span>1日 {requestsPerDay.toLocaleString()} リクエスト × {fmtUSD(cost.perRequest)}</span>
            <span className="font-medium ml-2 shrink-0">{fmtUSD(cost.perDay)}/日</span>
          </div>
        </div>
      </div>

      {/* ===== 3モデル比較表 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">3モデル比較</h2>
        <p className="text-xs text-gray-500 mb-4">
          入力 {inputTokens.toLocaleString()} tokens / 出力 {outputTokens.toLocaleString()} tokens
          {apiMode === "batch" && "（バッチAPI 50%割引適用）"}
          {cacheMode !== "none" && `（${CACHE_MULTIPLIERS[cacheMode].label}適用）`}
        </p>

        {/* モバイル: カード形式 / デスクトップ: テーブル */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">モデル</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">1リクエスト</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">日額</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">月額</th>
                <th className="text-right py-2 text-xs text-gray-500 font-medium">年額</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((m) => {
                const isSelected = m.id === modelId;
                return (
                  <tr
                    key={m.id}
                    className={`border-b border-gray-50 cursor-pointer transition-colors ${
                      isSelected ? "bg-amber-50" : "hover:bg-amber-50/40"
                    }`}
                    onClick={() => setModelId(m.id)}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isSelected ? "text-amber-800" : "text-gray-700"}`}>
                          {m.name}
                        </span>
                        {isSelected && (
                          <span className="text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-medium">
                            選択中
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{tierLabel[m.tier]}</div>
                    </td>
                    <td className="py-3 pr-3 text-right font-semibold text-gray-900">
                      {fmtUSD(m.cost.perRequest)}
                    </td>
                    <td className="py-3 pr-3 text-right text-gray-700">{fmtUSD(m.cost.perDay)}</td>
                    <td className="py-3 pr-3 text-right text-gray-700">{fmtUSD(m.cost.perMonth)}</td>
                    <td className="py-3 text-right text-gray-700">{fmtUSD(m.cost.perYear)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-2">行をクリックするとそのモデルに切り替わります</p>
        </div>

        {/* モバイル用カード */}
        <div className="sm:hidden space-y-3">
          {comparisonData.map((m) => {
            const isSelected = m.id === modelId;
            return (
              <button
                key={m.id}
                onClick={() => setModelId(m.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-amber-50 border-amber-400 ring-1 ring-amber-300"
                    : "border-gray-200 hover:border-amber-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className={`font-semibold text-sm ${isSelected ? "text-amber-800" : "text-gray-800"}`}>
                      {m.name}
                    </span>
                    {isSelected && (
                      <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full">
                        選択中
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-gray-900">{fmtUSD(m.cost.perRequest)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                  <div>日: <span className="font-medium text-gray-700">{fmtUSD(m.cost.perDay)}</span></div>
                  <div>月: <span className="font-medium text-gray-700">{fmtUSD(m.cost.perMonth)}</span></div>
                  <div>年: <span className="font-medium text-gray-700">{fmtUSD(m.cost.perYear)}</span></div>
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このClaude API コスト計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">Anthropic Claude APIの各モデル（Opus 4, Sonnet 4, Haiku 3.5）の利用料金をトークン数から即座に計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このClaude API コスト計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "Anthropic Claude APIの各モデル（Opus 4, Sonnet 4, Haiku 3.5）の利用料金をトークン数から即座に計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== フッター注記 ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        料金は変更される場合があります。最新の料金は
        <a
          href="https://www.anthropic.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-amber-600 transition-colors"
        >
          Anthropic公式サイト
        </a>
        をご確認ください。
      </p>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Claude API コスト計算",
  "description": "Anthropic Claude APIの各モデル（Opus 4, Sonnet 4, Haiku 3.5）の利用料金をトークン数から即座に計算",
  "url": "https://tools.loresync.dev/claude-api-cost",
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
