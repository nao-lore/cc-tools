"use client";

import { useState, useMemo } from "react";

// --- 料金データ ---
type ModelId = "gpt-4o-mini" | "gpt-4o" | "gpt-4.1-mini";

type FTModel = {
  id: ModelId;
  name: string;
  trainingPer1M: number;    // 学習コスト $/1Mトークン
  inferenceInPer1M: number; // 推論入力 $/1Mトークン
  inferenceOutPer1M: number; // 推論出力 $/1Mトークン
  badge: string;
};

const MODELS: FTModel[] = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    trainingPer1M: 3.00,
    inferenceInPer1M: 0.30,
    inferenceOutPer1M: 1.20,
    badge: "コスパ最良",
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 mini",
    trainingPer1M: 1.00,
    inferenceInPer1M: 0.80,
    inferenceOutPer1M: 3.20,
    badge: "最安学習",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    trainingPer1M: 25.00,
    inferenceInPer1M: 3.75,
    inferenceOutPer1M: 15.00,
    badge: "高性能",
  },
];

// 通常推論（FTなし）の参考料金
const BASE_INFERENCE: Record<ModelId, { inPer1M: number; outPer1M: number; name: string }> = {
  "gpt-4o-mini":  { inPer1M: 0.15,  outPer1M: 0.60,  name: "GPT-4o mini（通常）" },
  "gpt-4.1-mini": { inPer1M: 0.40,  outPer1M: 1.60,  name: "GPT-4.1 mini（通常）" },
  "gpt-4o":       { inPer1M: 2.50,  outPer1M: 10.00, name: "GPT-4o（通常）" },
};

function fmtUSD(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtJPY(n: number): string {
  if (n < 1) return `${n.toFixed(2)}円`;
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
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
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  format?: (v: number) => string;
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
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <div className="flex items-center gap-1 shrink-0">
          {format ? (
            <span className="w-28 px-2 py-1 text-right border border-gray-300 rounded-md text-sm bg-white font-medium text-gray-800">
              {format(value)}
            </span>
          ) : (
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
              className="w-28 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          )}
          {unit && <span className="text-sm text-gray-500 whitespace-nowrap">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

// --- メインコンポーネント ---
export default function FineTuningCost() {
  const [modelId, setModelId] = useState<ModelId>("gpt-4o-mini");
  const [numRows, setNumRows] = useState<number>(1000);
  const [avgTokensPerRow, setAvgTokensPerRow] = useState<number>(500);
  const [epochs, setEpochs] = useState<number>(3);
  const [inferenceInTokens, setInferenceInTokens] = useState<number>(500);
  const [inferenceOutTokens, setInferenceOutTokens] = useState<number>(200);
  const [inferenceRequestsPerDay, setInferenceRequestsPerDay] = useState<number>(100);
  const [exchangeRate, setExchangeRate] = useState<number>(150);

  const model = MODELS.find((m) => m.id === modelId) ?? MODELS[0];
  const baseInf = BASE_INFERENCE[modelId];

  const result = useMemo(() => {
    const totalTrainingTokens = numRows * avgTokensPerRow * epochs;
    const trainingCost = (totalTrainingTokens / 1_000_000) * model.trainingPer1M;

    // FT推論コスト（1リクエスト）
    const ftInfPerReq =
      (inferenceInTokens / 1_000_000) * model.inferenceInPer1M +
      (inferenceOutTokens / 1_000_000) * model.inferenceOutPer1M;

    // 通常推論コスト（1リクエスト）
    const baseInfPerReq =
      (inferenceInTokens / 1_000_000) * baseInf.inPer1M +
      (inferenceOutTokens / 1_000_000) * baseInf.outPer1M;

    const ftInfPerDay = ftInfPerReq * inferenceRequestsPerDay;
    const baseInfPerDay = baseInfPerReq * inferenceRequestsPerDay;

    // FT推論は通常より高い（差額）
    const inferencePremiumPerDay = ftInfPerDay - baseInfPerDay;

    // 損益分岐: 学習コスト ÷ (FT推論 - 通常推論) の1リクエスト差額
    // FT推論が通常より高い場合: 学習コストを推論で"節約"できない(別の価値で判断)
    // ただしFTは精度向上が目的なので、損益分岐は「FTコスト回収に何リクエスト必要か」
    // ここでは通常推論と同コストで使えると仮定した場合のシンプル計算として:
    // break-even = trainingCost / ftInfPerReq
    const breakEvenRequests = ftInfPerReq > 0 ? trainingCost / ftInfPerReq : Infinity;
    const breakEvenDays = inferenceRequestsPerDay > 0 ? breakEvenRequests / inferenceRequestsPerDay : Infinity;

    return {
      totalTrainingTokens,
      trainingCost,
      ftInfPerReq,
      baseInfPerReq,
      ftInfPerDay,
      ftInfPerMonth: ftInfPerDay * 30,
      baseInfPerDay,
      baseInfPerMonth: baseInfPerDay * 30,
      inferencePremiumPerDay,
      breakEvenRequests,
      breakEvenDays,
    };
  }, [model, numRows, avgTokensPerRow, epochs, inferenceInTokens, inferenceOutTokens, inferenceRequestsPerDay, baseInf]);

  return (
    <div className="space-y-6">

      {/* ===== モデル選択 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ファインチューニングするモデルを選択</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => setModelId(m.id)}
              className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                modelId === m.id
                  ? "bg-orange-50 border-orange-400 ring-2 ring-orange-300 shadow-sm"
                  : "border-gray-200 hover:border-orange-200 hover:bg-orange-50/40"
              }`}
            >
              <div className="font-semibold text-gray-900 text-sm mb-1">{m.name}</div>
              <div className="text-xs text-orange-700 font-medium mb-2">{m.badge}</div>
              <div className="text-xs text-gray-500 space-y-0.5">
                <div>学習: <span className="font-medium text-gray-700">${m.trainingPer1M}/1M tok</span></div>
                <div>推論入力: <span className="font-medium text-gray-700">${m.inferenceInPer1M}/1M</span></div>
                <div>推論出力: <span className="font-medium text-gray-700">${m.inferenceOutPer1M}/1M</span></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ===== トレーニングデータ設定 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">トレーニングデータ</h2>
        <p className="text-xs text-gray-500 mb-5">学習データ量とエポック数から学習コストを計算します</p>
        <div className="space-y-5">
          <SliderInput
            label="データ行数（サンプル数）"
            value={numRows}
            onChange={setNumRows}
            min={10}
            max={100000}
            step={10}
            unit="行"
          />
          <SliderInput
            label="平均トークン数/行"
            value={avgTokensPerRow}
            onChange={setAvgTokensPerRow}
            min={50}
            max={4096}
            step={50}
            unit="tokens"
          />
          <SliderInput
            label="エポック数"
            value={epochs}
            onChange={setEpochs}
            min={1}
            max={10}
            step={1}
            unit="エポック"
          />

          {/* 総トークン数の表示 */}
          <div className="p-3 bg-orange-50 rounded-xl flex flex-wrap gap-3 text-sm">
            <div>
              <span className="text-gray-500">総学習トークン数: </span>
              <span className="font-bold text-gray-900">{fmtNum(result.totalTrainingTokens)} tokens</span>
            </div>
            <div className="text-orange-400 hidden sm:block">|</div>
            <div>
              <span className="text-gray-500">{numRows.toLocaleString()} 行 × {avgTokensPerRow.toLocaleString()} tok × {epochs} epoch</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 推論設定 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">推論設定（学習後の利用想定）</h2>
        <p className="text-xs text-gray-500 mb-5">FT後のモデルを実際にどう使うかを設定します</p>
        <div className="space-y-5">
          <SliderInput
            label="推論 入力トークン数（1リクエストあたり）"
            value={inferenceInTokens}
            onChange={setInferenceInTokens}
            min={50}
            max={32000}
            step={50}
            unit="tokens"
          />
          <SliderInput
            label="推論 出力トークン数（1リクエストあたり）"
            value={inferenceOutTokens}
            onChange={setInferenceOutTokens}
            min={10}
            max={4096}
            step={10}
            unit="tokens"
          />
          <SliderInput
            label="1日あたりのリクエスト数"
            value={inferenceRequestsPerDay}
            onChange={setInferenceRequestsPerDay}
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
                className="w-24 px-2 py-1 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <span className="text-sm text-gray-500">円</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 学習コスト結果 ===== */}
      <div className="rounded-2xl shadow-sm border border-orange-300 p-6 bg-gradient-to-br from-orange-50 to-amber-50">
        <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
          学習コスト
          <span className="text-xs font-normal text-orange-700 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-full">
            {model.name}
          </span>
        </h2>

        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">合計学習コスト（1回のみ）</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-4xl font-bold text-gray-900">{fmtUSD(result.trainingCost)}</span>
            <span className="text-xl text-gray-600">{fmtJPY(result.trainingCost * exchangeRate)}</span>
          </div>
        </div>

        <div className="p-3 bg-white bg-opacity-60 rounded-xl text-xs text-gray-600 space-y-1.5">
          <div className="font-medium text-gray-700 mb-1">計算内訳</div>
          <div className="flex justify-between">
            <span>{fmtNum(result.totalTrainingTokens)} tokens × ${model.trainingPer1M}/1M</span>
            <span className="font-medium">{fmtUSD(result.trainingCost)}</span>
          </div>
          <div className="text-gray-400">
            （{numRows.toLocaleString()} 行 × {avgTokensPerRow.toLocaleString()} tok/行 × {epochs} エポック）
          </div>
        </div>
      </div>

      {/* ===== 推論コスト比較 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">推論コスト比較</h2>
        <p className="text-xs text-gray-500 mb-5">
          FT済みモデル vs. 通常モデルの推論コスト比較（1日 {inferenceRequestsPerDay.toLocaleString()} リクエスト）
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* FT推論 */}
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <div className="text-xs font-medium text-orange-700 mb-2">FT済みモデル（{model.name}）</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">1リクエスト</span>
                <span className="font-semibold text-gray-900">{fmtUSD(result.ftInfPerReq)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">日額</span>
                <span className="font-medium text-gray-800">{fmtUSD(result.ftInfPerDay)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">月額</span>
                <span className="font-medium text-gray-800">{fmtUSD(result.ftInfPerMonth)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">日額（円）</span>
                <span className="text-gray-600">{fmtJPY(result.ftInfPerDay * exchangeRate)}</span>
              </div>
            </div>
          </div>

          {/* 通常推論 */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-xs font-medium text-gray-500 mb-2">通常モデル（{baseInf.name}）</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">1リクエスト</span>
                <span className="font-semibold text-gray-900">{fmtUSD(result.baseInfPerReq)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">日額</span>
                <span className="font-medium text-gray-800">{fmtUSD(result.baseInfPerDay)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">月額</span>
                <span className="font-medium text-gray-800">{fmtUSD(result.baseInfPerMonth)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">日額（円）</span>
                <span className="text-gray-600">{fmtJPY(result.baseInfPerDay * exchangeRate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 差額 */}
        {result.inferencePremiumPerDay !== 0 && (
          <div className={`p-3 rounded-xl text-sm ${result.inferencePremiumPerDay > 0 ? "bg-amber-50 border border-amber-200 text-amber-800" : "bg-green-50 border border-green-200 text-green-800"}`}>
            {result.inferencePremiumPerDay > 0 ? (
              <span>
                FT推論は通常より 1日あたり <strong>{fmtUSD(result.inferencePremiumPerDay)}</strong> 高コスト（精度向上の対価）
              </span>
            ) : (
              <span>
                FT推論は通常より 1日あたり <strong>{fmtUSD(Math.abs(result.inferencePremiumPerDay))}</strong> 低コスト
              </span>
            )}
          </div>
        )}
      </div>

      {/* ===== 損益分岐 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">損益分岐点</h2>
        <p className="text-xs text-gray-500 mb-5">
          学習コストを推論コストで回収するのに何リクエスト必要か
        </p>

        {result.breakEvenRequests === Infinity ? (
          <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-500">
            推論コストが $0 のため計算できません
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 p-4 text-center">
                <div className="text-xs text-orange-700 mb-1">必要リクエスト数</div>
                <div className="text-3xl font-bold text-gray-900">
                  {result.breakEvenRequests >= 1_000_000_000
                    ? "1B+"
                    : fmtNum(Math.ceil(result.breakEvenRequests))}
                </div>
                <div className="text-xs text-gray-500 mt-1">リクエスト</div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 p-4 text-center">
                <div className="text-xs text-orange-700 mb-1">必要日数（{inferenceRequestsPerDay.toLocaleString()} req/日）</div>
                <div className="text-3xl font-bold text-gray-900">
                  {result.breakEvenDays >= 36500
                    ? "100年+"
                    : result.breakEvenDays < 1
                    ? "< 1"
                    : Math.ceil(result.breakEvenDays).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">日</div>
              </div>
            </div>

            <div className="p-3 bg-orange-50 rounded-xl text-xs text-orange-800">
              <strong>計算式:</strong> 学習コスト {fmtUSD(result.trainingCost)} ÷ FT推論コスト {fmtUSD(result.ftInfPerReq)}/req = {fmtNum(Math.ceil(result.breakEvenRequests))} req
            </div>

            <p className="text-xs text-gray-400">
              ※ FTの価値は推論コスト節約だけでなく、精度・応答品質の向上にもあります。本指標はコスト回収の目安です。
            </p>
          </div>
        )}
      </div>

      {/* ===== 全モデル比較 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">全モデル学習コスト比較</h2>
        <p className="text-xs text-gray-500 mb-4">
          同じデータ（{fmtNum(numRows * avgTokensPerRow)} tok × {epochs} epoch = {fmtNum(numRows * avgTokensPerRow * epochs)} tok）で比較
        </p>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">モデル</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">学習コスト</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">推論/req</th>
                <th className="text-right py-2 pr-3 text-xs text-gray-500 font-medium">推論/日</th>
                <th className="text-right py-2 text-xs text-gray-500 font-medium">損益分岐</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map((m) => {
                const totalTok = numRows * avgTokensPerRow * epochs;
                const tCost = (totalTok / 1_000_000) * m.trainingPer1M;
                const infPerReq =
                  (inferenceInTokens / 1_000_000) * m.inferenceInPer1M +
                  (inferenceOutTokens / 1_000_000) * m.inferenceOutPer1M;
                const infPerDay = infPerReq * inferenceRequestsPerDay;
                const be = infPerReq > 0 ? Math.ceil(tCost / infPerReq) : Infinity;
                const isSelected = m.id === modelId;
                return (
                  <tr
                    key={m.id}
                    className={`border-b border-gray-50 cursor-pointer transition-colors ${
                      isSelected ? "bg-orange-50" : "hover:bg-orange-50/40"
                    }`}
                    onClick={() => setModelId(m.id)}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isSelected ? "text-orange-800" : "text-gray-700"}`}>
                          {m.name}
                        </span>
                        {isSelected && (
                          <span className="text-xs bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full">
                            選択中
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{m.badge}</div>
                    </td>
                    <td className="py-3 pr-3 text-right font-semibold text-gray-900">{fmtUSD(tCost)}</td>
                    <td className="py-3 pr-3 text-right text-gray-700">{fmtUSD(infPerReq)}</td>
                    <td className="py-3 pr-3 text-right text-gray-700">{fmtUSD(infPerDay)}</td>
                    <td className="py-3 text-right text-gray-700">
                      {be === Infinity ? "—" : be >= 1_000_000_000 ? "1B+" : fmtNum(be) + " req"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-2">行をクリックするとそのモデルに切り替わります</p>
        </div>

        {/* モバイル用カード */}
        <div className="sm:hidden space-y-3">
          {MODELS.map((m) => {
            const totalTok = numRows * avgTokensPerRow * epochs;
            const tCost = (totalTok / 1_000_000) * m.trainingPer1M;
            const infPerReq =
              (inferenceInTokens / 1_000_000) * m.inferenceInPer1M +
              (inferenceOutTokens / 1_000_000) * m.inferenceOutPer1M;
            const be = infPerReq > 0 ? Math.ceil(tCost / infPerReq) : Infinity;
            const isSelected = m.id === modelId;
            return (
              <button
                key={m.id}
                onClick={() => setModelId(m.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-orange-50 border-orange-400 ring-1 ring-orange-300"
                    : "border-gray-200 hover:border-orange-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className={`font-semibold text-sm ${isSelected ? "text-orange-800" : "text-gray-800"}`}>
                      {m.name}
                    </span>
                    {isSelected && (
                      <span className="ml-2 text-xs bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full">
                        選択中
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-gray-900">{fmtUSD(tCost)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>推論/req: <span className="font-medium text-gray-700">{fmtUSD(infPerReq)}</span></div>
                  <div>損益分岐: <span className="font-medium text-gray-700">{be === Infinity ? "—" : fmtNum(be) + " req"}</span></div>
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このファインチューニング 料金計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">LLMファインチューニングの学習コスト+推論コストをトレーニングデータ量から試算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このファインチューニング 料金計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "LLMファインチューニングの学習コスト+推論コストをトレーニングデータ量から試算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
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
          href="https://openai.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-orange-600 transition-colors"
        >
          OpenAI公式サイト
        </a>
        をご確認ください。
      </p>
    </div>
  );
}
