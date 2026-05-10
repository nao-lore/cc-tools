"use client";

import { useMemo, useState } from "react";

type ModelId = "gpt-image-2" | "gpt-image-1" | "dall-e-3";
type Quality = "low" | "medium" | "high" | "standard";
type Size = "square" | "portrait" | "landscape";

type ImageModel = {
  id: ModelId;
  name: string;
  label: string;
  textInput: number;
  cachedTextInput: number;
  imageInput: number;
  cachedImageInput: number;
  imageOutput: number;
  note: string;
};

const MODELS: ImageModel[] = [
  {
    id: "gpt-image-2",
    name: "GPT-image-2",
    label: "current flagship",
    textInput: 5,
    cachedTextInput: 1.25,
    imageInput: 8,
    cachedImageInput: 2,
    imageOutput: 30,
    note: "OpenAI API価格ページ掲載の最先端画像生成モデル。出力画像はimage output tokensで概算します。",
  },
  {
    id: "gpt-image-1",
    name: "GPT Image 1",
    label: "previous image model",
    textInput: 5,
    cachedTextInput: 1.25,
    imageInput: 10,
    cachedImageInput: 2.5,
    imageOutput: 40,
    note: "旧世代のGPT画像モデル。公式Docsに品質・サイズ別の1枚あたり参考単価があります。",
  },
  {
    id: "dall-e-3",
    name: "DALL·E 3",
    label: "legacy per-image",
    textInput: 0,
    cachedTextInput: 0,
    imageInput: 0,
    cachedImageInput: 0,
    imageOutput: 0,
    note: "旧世代の画像生成モデル。1枚あたりの固定単価で概算します。",
  },
];

const SIZES: Record<Size, { label: string; value: string }> = {
  square: { label: "1024×1024", value: "square" },
  portrait: { label: "1024×1536", value: "portrait" },
  landscape: { label: "1536×1024", value: "landscape" },
};

const GPT_IMAGE_1_PRICES: Record<Exclude<Quality, "standard">, Record<Size, number>> = {
  low: { square: 0.011, portrait: 0.016, landscape: 0.016 },
  medium: { square: 0.042, portrait: 0.063, landscape: 0.063 },
  high: { square: 0.167, portrait: 0.25, landscape: 0.25 },
};

const DALLE3_PRICES: Record<Size, number> = {
  square: 0.04,
  portrait: 0.08,
  landscape: 0.08,
};

const OUTPUT_TOKEN_PRESETS: Record<Exclude<Quality, "standard">, number> = {
  low: 350,
  medium: 1400,
  high: 5600,
};

const EXAMPLES = [
  { label: "LP素材100枚", modelId: "gpt-image-2" as const, quality: "medium" as const, size: "square" as const, count: "100", text: "180", image: "0" },
  { label: "商品画像編集", modelId: "gpt-image-2" as const, quality: "high" as const, size: "square" as const, count: "300", text: "250", image: "900" },
  { label: "SNS量産", modelId: "gpt-image-1" as const, quality: "low" as const, size: "square" as const, count: "1000", text: "120", image: "0" },
  { label: "DALL·E 3比較", modelId: "dall-e-3" as const, quality: "standard" as const, size: "square" as const, count: "100", text: "0", image: "0" },
];

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function sanitizeNumber(value: string) {
  return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
}

function formatNumber(value: number, digits = 0) {
  return value.toLocaleString("ja-JP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function formatUsd(value: number) {
  if (value < 0.01) return `$${value.toFixed(4)}`;
  if (value < 100) return `$${value.toFixed(2)}`;
  return `$${formatNumber(value, 2)}`;
}

function formatJpy(value: number) {
  return `${Math.round(value).toLocaleString("ja-JP")}円`;
}

type CostResult = {
  imageCount: number;
  textInputUsd: number;
  imageInputUsd: number;
  imageOutputUsd: number;
  fixedGenerationUsd: number;
  totalUsd: number;
  totalJpy: number;
  perImageUsd: number;
};

function fixedGenerationPrice(modelId: ModelId, quality: Quality, size: Size) {
  if (modelId === "gpt-image-1" && quality !== "standard") return GPT_IMAGE_1_PRICES[quality][size];
  if (modelId === "dall-e-3") return DALLE3_PRICES[size];
  return 0;
}

function buildCopyText(result: CostResult, model: ImageModel, quality: Quality, size: Size) {
  return [
    "OpenAI Image API 料金概算",
    `モデル: ${model.name}`,
    `品質/サイズ: ${quality} / ${SIZES[size].label}`,
    `枚数: ${formatNumber(result.imageCount)}枚`,
    `合計: ${formatUsd(result.totalUsd)} / ${formatJpy(result.totalJpy)}`,
    `1枚あたり: ${formatUsd(result.perImageUsd)}`,
    "前提: OpenAI公式API価格、税・Batch API・組織別条件は別",
  ].join("\n");
}

function NumberField({
  id,
  label,
  value,
  suffix,
  onChange,
  help,
}: {
  id: string;
  label: string;
  value: string;
  suffix: string;
  onChange: (value: string) => void;
  help?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-emerald-600">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(sanitizeNumber(event.target.value))}
          className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
        />
        <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">{suffix}</span>
      </div>
      {help && <p className="mt-1 text-xs leading-5 text-slate-500">{help}</p>}
    </div>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold text-slate-950">{value}</p>
      {note && <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>}
    </div>
  );
}

export default function DallePricing() {
  const [modelId, setModelId] = useState<ModelId>("gpt-image-2");
  const [quality, setQuality] = useState<Quality>("medium");
  const [size, setSize] = useState<Size>("square");
  const [imageCount, setImageCount] = useState("100");
  const [textTokens, setTextTokens] = useState("180");
  const [imageInputTokens, setImageInputTokens] = useState("0");
  const [cachedInputPercent, setCachedInputPercent] = useState("0");
  const [exchangeRate, setExchangeRate] = useState("155");
  const [copied, setCopied] = useState(false);

  const model = MODELS.find((item) => item.id === modelId) ?? MODELS[0];
  const outputTokensPerImage = quality === "standard" ? 0 : OUTPUT_TOKEN_PRESETS[quality];
  const fixedPrice = fixedGenerationPrice(modelId, quality, size);

  const result = useMemo<CostResult>(() => {
    const count = Math.max(0, parseNumber(imageCount));
    const text = Math.max(0, parseNumber(textTokens)) * count;
    const imageInput = Math.max(0, parseNumber(imageInputTokens)) * count;
    const cachedRatio = Math.min(100, Math.max(0, parseNumber(cachedInputPercent))) / 100;
    const cachedText = text * cachedRatio;
    const uncachedText = text - cachedText;
    const cachedImage = imageInput * cachedRatio;
    const uncachedImage = imageInput - cachedImage;
    const textInputUsd = (uncachedText / 1_000_000) * model.textInput + (cachedText / 1_000_000) * model.cachedTextInput;
    const imageInputUsd = (uncachedImage / 1_000_000) * model.imageInput + (cachedImage / 1_000_000) * model.cachedImageInput;
    const tokenImageOutputUsd = modelId === "gpt-image-2" ? ((outputTokensPerImage * count) / 1_000_000) * model.imageOutput : 0;
    const fixedGenerationUsd = fixedPrice * count;
    const totalUsd = textInputUsd + imageInputUsd + tokenImageOutputUsd + fixedGenerationUsd;

    return {
      imageCount: count,
      textInputUsd,
      imageInputUsd,
      imageOutputUsd: tokenImageOutputUsd,
      fixedGenerationUsd,
      totalUsd,
      totalJpy: totalUsd * Math.max(0, parseNumber(exchangeRate)),
      perImageUsd: count ? totalUsd / count : 0,
    };
  }, [cachedInputPercent, exchangeRate, fixedPrice, imageCount, imageInputTokens, model, modelId, outputTokensPerImage, textTokens]);

  function applyExample(example: (typeof EXAMPLES)[number]) {
    setModelId(example.modelId);
    setQuality(example.quality);
    setSize(example.size);
    setImageCount(example.count);
    setTextTokens(example.text);
    setImageInputTokens(example.image);
    setCachedInputPercent("0");
    setCopied(false);
  }

  function reset() {
    setModelId("gpt-image-2");
    setQuality("medium");
    setSize("square");
    setImageCount("100");
    setTextTokens("180");
    setImageInputTokens("0");
    setCachedInputPercent("0");
    setExchangeRate("155");
    setCopied(false);
  }

  async function copyResult() {
    await navigator.clipboard.writeText(buildCopyText(result, model, quality, size));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const qualityOptions: Quality[] = modelId === "dall-e-3" ? ["standard"] : ["low", "medium", "high"];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">生成条件</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">モデル、枚数、プロンプト/参照画像トークンから概算します。</p>
            </div>
            <button type="button" onClick={reset} className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              クリア
            </button>
          </div>

          <div className="mt-5">
            <label htmlFor="image-model" className="text-sm font-semibold text-slate-800">
              モデル
            </label>
            <select
              id="image-model"
              value={modelId}
              onChange={(event) => {
                const next = event.target.value as ModelId;
                setModelId(next);
                setQuality(next === "dall-e-3" ? "standard" : "medium");
                setCopied(false);
              }}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600"
            >
              {MODELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumberField id="image-count" label="生成枚数" value={imageCount} suffix="枚" onChange={setImageCount} />
            <NumberField id="image-rate" label="為替レート" value={exchangeRate} suffix="円/USD" onChange={setExchangeRate} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-800">品質</p>
              <div className="mt-2 grid gap-2">
                {qualityOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuality(item)}
                    className={`rounded-xl border px-3 py-2 text-left text-sm font-medium ${quality === item ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                  >
                    {item === "standard" ? "standard" : item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">サイズ</p>
              <div className="mt-2 grid gap-2">
                {(Object.keys(SIZES) as Size[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSize(item)}
                    className={`rounded-xl border px-3 py-2 text-left text-sm font-medium ${size === item ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                  >
                    {SIZES[item].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumberField id="text-tokens" label="テキスト入力" value={textTokens} suffix="tokens/枚" onChange={setTextTokens} help="プロンプトや編集指示の平均トークン数。" />
            <NumberField id="image-input" label="参照画像入力" value={imageInputTokens} suffix="tokens/枚" onChange={setImageInputTokens} help="編集や参照画像を使う場合のimage input tokens。" />
            <div className="sm:col-span-2">
              <NumberField id="cached-input" label="キャッシュ入力率" value={cachedInputPercent} suffix="%" onChange={setCachedInputPercent} help="同じブランド指示や参照コンテキストを再利用できる割合。" />
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button key={example.label} type="button" onClick={() => applyExample(example)} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-emerald-600 hover:bg-emerald-50">
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">{model.name}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{model.note}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
              <span className="rounded-full bg-white px-3 py-1">{model.label}</span>
              {model.imageOutput > 0 && <span className="rounded-full bg-white px-3 py-1">${model.imageOutput} / 1M image output</span>}
              {fixedPrice > 0 && <span className="rounded-full bg-white px-3 py-1">{formatUsd(fixedPrice)} / image</span>}
              {modelId === "gpt-image-2" && <span className="rounded-full bg-white px-3 py-1">output preset: {formatNumber(outputTokensPerImage)} tokens/image</span>}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">見積もり</h2>
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-medium text-emerald-900">推定合計</p>
            <p className="mt-1 font-mono text-5xl font-bold tracking-tight text-emerald-950">{formatUsd(result.totalUsd)}</p>
            <p className="mt-2 text-sm text-emerald-900">約 {formatJpy(result.totalJpy)} / 1 USD = {formatNumber(parseNumber(exchangeRate), 2)}円</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatCard label="1枚あたり" value={formatUsd(result.perImageUsd)} note={`${formatNumber(result.imageCount)} images`} />
            <StatCard label="生成/出力画像" value={formatUsd(result.fixedGenerationUsd + result.imageOutputUsd)} note={modelId === "gpt-image-2" ? "image output tokens" : "per-image price"} />
            <StatCard label="テキスト入力" value={formatUsd(result.textInputUsd)} note={`${formatNumber(parseNumber(textTokens) * result.imageCount)} tokens`} />
            <StatCard label="参照画像入力" value={formatUsd(result.imageInputUsd)} note={`${formatNumber(parseNumber(imageInputTokens) * result.imageCount)} tokens`} />
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            GPT-image-2の画像出力はtoken量ベースの概算です。最終的な請求はAPI usageログとOpenAI公式価格ページで確認してください。
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              {copied ? "コピーしました" : "結果をコピー"}
            </button>
            <button type="button" onClick={reset} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              入力をクリア
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
