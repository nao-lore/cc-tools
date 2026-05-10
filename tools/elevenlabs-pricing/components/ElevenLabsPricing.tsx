"use client";

import { useMemo, useState } from "react";

type Product = {
  id: string;
  label: string;
  family: string;
  unit: "characters" | "hours" | "minutes" | "generations";
  unitLabel: string;
  price: number;
  priceLabel: string;
  description: string;
  note: string;
};

const PRODUCTS: Product[] = [
  {
    id: "tts-flash",
    label: "Flash / Turbo TTS",
    family: "Text to Speech",
    unit: "characters",
    unitLabel: "文字",
    price: 0.05,
    priceLabel: "$0.05 / 1K characters",
    description: "低遅延の音声合成。アプリ内音声やリアルタイム寄りの読み上げ向け。",
    note: "Flash/Turbo系はヘルプ上、self-serveでは1文字=0.5 creditsの扱いです。",
  },
  {
    id: "tts-multilingual",
    label: "Multilingual v2 / v3 TTS",
    family: "Text to Speech",
    unit: "characters",
    unitLabel: "文字",
    price: 0.1,
    priceLabel: "$0.10 / 1K characters",
    description: "高品質な多言語音声合成。ナレーション、教材、長文読み上げ向け。",
    note: "Multilingual系は文字数ベースで見積もるのが分かりやすいです。",
  },
  {
    id: "scribe",
    label: "Scribe v1 / v2",
    family: "Speech to Text",
    unit: "hours",
    unitLabel: "時間",
    price: 0.22,
    priceLabel: "$0.22 / hour",
    description: "音声・動画の文字起こし。録音済みファイルの一括処理向け。",
    note: "Entity detectionやkeyterm promptingは追加単価があるため別途確認してください。",
  },
  {
    id: "scribe-realtime",
    label: "Scribe v2 Realtime",
    family: "Speech to Text",
    unit: "hours",
    unitLabel: "時間",
    price: 0.39,
    priceLabel: "$0.39 / hour",
    description: "リアルタイム文字起こし。低遅延の会話・配信・通話向け。",
    note: "リアルタイム処理は利用時間で見積もります。",
  },
  {
    id: "music",
    label: "Music Generation",
    family: "Audio Generation",
    unit: "minutes",
    unitLabel: "分",
    price: 0.3,
    priceLabel: "$0.30 / minute",
    description: "テキストから音楽を生成。BGMや短い楽曲案の作成向け。",
    note: "商用利用や長さ制限はプラン条件も確認してください。",
  },
  {
    id: "voice-isolator",
    label: "Voice Isolator",
    family: "Audio Processing",
    unit: "minutes",
    unitLabel: "分",
    price: 0.12,
    priceLabel: "$0.12 / minute",
    description: "ノイズや残響を減らして音声を分離する処理。",
    note: "入力ファイルの長さで見積もります。",
  },
  {
    id: "voice-changer",
    label: "Voice Changer",
    family: "Audio Processing",
    unit: "minutes",
    unitLabel: "分",
    price: 0.12,
    priceLabel: "$0.12 / minute",
    description: "音声の特徴を変換する処理。",
    note: "入力音声の分数に比例して見積もります。",
  },
  {
    id: "sound-effects",
    label: "Sound Effects",
    family: "Audio Generation",
    unit: "generations",
    unitLabel: "回",
    price: 0.12,
    priceLabel: "$0.12 / generation",
    description: "テキストから効果音を生成。",
    note: "生成回数で見積もります。",
  },
  {
    id: "dubbing",
    label: "Dubbing v1",
    family: "Dubbing",
    unit: "minutes",
    unitLabel: "分",
    price: 0.33,
    priceLabel: "$0.33 / minute",
    description: "音声・動画の自動吹き替え。",
    note: "ウォーターマーク有りの分単価です。条件により単価が変わる場合があります。",
  },
];

const SAMPLES = [
  { label: "5分動画ナレーション", productId: "tts-multilingual", quantity: "4500" },
  { label: "月100万文字アプリ音声", productId: "tts-flash", quantity: "1000000" },
  { label: "会議10時間の文字起こし", productId: "scribe", quantity: "10" },
  { label: "動画30分の吹き替え", productId: "dubbing", quantity: "30" },
];

function fmtUSD(value: number) {
  if (value < 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtJPY(value: number) {
  return `${Math.round(value).toLocaleString("ja-JP")}円`;
}

function fmtNumber(value: number) {
  return value.toLocaleString("ja-JP");
}

function sanitizeNumber(value: string) {
  return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1").slice(0, 12);
}

function calculateCost(product: Product, quantity: number) {
  if (product.unit === "characters") return (quantity / 1000) * product.price;
  return quantity * product.price;
}

function creditEstimate(product: Product, quantity: number) {
  if (product.id === "tts-flash") return quantity * 0.5;
  if (product.id === "tts-multilingual") return quantity;
  return null;
}

function buildCopyText(product: Product, quantity: number, totalUSD: number, exchangeRate: number) {
  return [
    `ElevenLabs API cost estimate`,
    `Product: ${product.label}`,
    `Usage: ${fmtNumber(quantity)} ${product.unitLabel}`,
    `Unit price: ${product.priceLabel}`,
    `Estimated cost: ${fmtUSD(totalUSD)} / ${fmtJPY(totalUSD * exchangeRate)}`,
    product.note,
  ].join("\n");
}

export default function ElevenLabsPricing() {
  const [productId, setProductId] = useState("tts-multilingual");
  const [quantity, setQuantity] = useState("100000");
  const [exchangeRate, setExchangeRate] = useState("155");
  const [copied, setCopied] = useState(false);

  const product = PRODUCTS.find((item) => item.id === productId) ?? PRODUCTS[0];
  const quantityNumber = Number.parseFloat(quantity) || 0;
  const exchangeRateNumber = Number.parseFloat(exchangeRate) || 0;
  const error = !quantity || quantityNumber <= 0 ? "利用量を入力してください。" : exchangeRateNumber <= 0 ? "為替レートを入力してください。" : "";

  const result = useMemo(() => {
    const totalUSD = calculateCost(product, quantityNumber);
    const totalJPY = totalUSD * exchangeRateNumber;
    const credits = creditEstimate(product, quantityNumber);
    return {
      totalUSD,
      totalJPY,
      credits,
      perThousandUSD: product.unit === "characters" ? product.price : null,
    };
  }, [exchangeRateNumber, product, quantityNumber]);

  function reset() {
    setProductId("tts-multilingual");
    setQuantity("100000");
    setExchangeRate("155");
    setCopied(false);
  }

  function applySample(sample: (typeof SAMPLES)[number]) {
    setProductId(sample.productId);
    setQuantity(sample.quantity);
    setCopied(false);
  }

  async function copyResult() {
    if (error) return;
    await navigator.clipboard.writeText(buildCopyText(product, quantityNumber, result.totalUSD, exchangeRateNumber));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.85fr)_minmax(380px,0.7fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">API使用量</h2>
              <p className="mt-1 text-sm text-slate-500">公式API単価を使って、文字数・時間・分数・生成回数から概算します。</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="w-fit whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              リセット
            </button>
          </div>

          <div className="mt-5 grid gap-4">
            <div>
              <label htmlFor="eleven-product" className="text-sm font-semibold text-slate-800">
                プロダクト
              </label>
              <select
                id="eleven-product"
                value={productId}
                onChange={(event) => {
                  setProductId(event.target.value);
                  setCopied(false);
                }}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-950"
              >
                {PRODUCTS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.family} - {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                label={`利用量（${product.unitLabel}）`}
                value={quantity}
                onChange={(value) => setQuantity(sanitizeNumber(value))}
                suffix={product.unitLabel}
                placeholder={product.unit === "characters" ? "100000" : "10"}
              />
              <NumberField
                label="為替レート"
                value={exchangeRate}
                onChange={(value) => setExchangeRate(sanitizeNumber(value))}
                suffix="円/USD"
                placeholder="155"
              />
            </div>
          </div>

          <p className={`mt-3 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
            {error || "料金は税抜き・公開単価ベースの概算です。入力値はブラウザ上で計算され、外部に送信されません。"}
          </p>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SAMPLES.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => applySample(sample)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-950 hover:bg-slate-50"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">{product.label}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{product.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-700">{product.priceLabel}</span>
              <span className="rounded-full bg-white px-3 py-1 text-slate-600">{product.family}</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{product.note}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={Boolean(error)}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {copied ? "コピーしました" : "結果をコピー"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              入力をクリア
            </button>
          </div>
        </div>

        <aside className="p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">見積もり</h2>
          {error ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">入力値を確認してください。</div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-indigo-950">
                <p className="text-sm font-medium opacity-80">推定月額</p>
                <p className="mt-1 font-mono text-4xl font-bold">{fmtUSD(result.totalUSD)}</p>
                <p className="mt-2 text-sm">約 {fmtJPY(result.totalJPY)} / 1 USD = {exchangeRateNumber}円</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric label="利用量" value={`${fmtNumber(quantityNumber)} ${product.unitLabel}`} />
                <Metric label="単価" value={product.priceLabel} />
                <Metric label="USD" value={fmtUSD(result.totalUSD)} />
                <Metric label="JPY換算" value={fmtJPY(result.totalJPY)} />
              </div>
              {result.credits !== null && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">クレジット目安</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-slate-950">{fmtNumber(result.credits)} credits</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Flash/Turboはself-serveで1文字=0.5 credits、Multilingual系は1文字=1 creditとして概算しています。
                  </p>
                </div>
              )}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                プラン同梱枠、超過課金、税金、Voice Libraryのカスタムレート、追加機能オプションは実際の請求で変わる場合があります。
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-950">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 px-3 py-3 text-right font-mono outline-none"
        />
        <span className="border-l border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">{suffix}</span>
      </div>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words font-mono text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}
