"use client";

import { useMemo, useState } from "react";

type TranscriptionModel = {
  id: string;
  name: string;
  pricePerMinute: number;
  inputPer1M?: number;
  outputPer1M?: number;
  note: string;
};

const MODELS: TranscriptionModel[] = [
  {
    id: "gpt-4o-transcribe",
    name: "GPT-4o Transcribe",
    pricePerMinute: 0.006,
    inputPer1M: 2.5,
    outputPer1M: 10,
    note: "OpenAIの高精度speech-to-textモデル。精度重視の文字起こしに向いています。",
  },
  {
    id: "gpt-4o-mini-transcribe",
    name: "GPT-4o mini Transcribe",
    pricePerMinute: 0.003,
    inputPer1M: 1.25,
    outputPer1M: 5,
    note: "低コストなspeech-to-textモデル。大量処理や下書き文字起こし向けです。",
  },
  {
    id: "whisper-1",
    name: "Whisper",
    pricePerMinute: 0.006,
    note: "従来のWhisper API。既存実装との比較用に残しています。",
  },
];

const EXAMPLES = [
  { label: "会議20本", modelId: "gpt-4o-transcribe", files: "20", minutes: "60", months: "1", exchange: "155" },
  { label: "Podcast週2本", modelId: "gpt-4o-transcribe", files: "8", minutes: "45", months: "1", exchange: "155" },
  { label: "コールセンター", modelId: "gpt-4o-mini-transcribe", files: "2000", minutes: "5", months: "1", exchange: "155" },
  { label: "年間アーカイブ", modelId: "gpt-4o-mini-transcribe", files: "500", minutes: "90", months: "12", exchange: "155" },
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

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}分`;
  if (mins === 0) return `${hours}時間`;
  return `${hours}時間${mins}分`;
}

type CostResult = {
  files: number;
  minutesPerFile: number;
  months: number;
  totalMinutes: number;
  totalHours: number;
  monthlyMinutes: number;
  monthlyUsd: number;
  monthlyJpy: number;
  totalUsd: number;
  totalJpy: number;
  perFileUsd: number;
};

function buildCopyText(result: CostResult, model: TranscriptionModel) {
  return [
    "OpenAI音声文字起こし 料金概算",
    `モデル: ${model.name}`,
    `ファイル数: ${formatNumber(result.files)}本`,
    `平均音声時間: ${formatDuration(result.minutesPerFile)}`,
    `対象期間: ${formatNumber(result.months)}か月`,
    `総音声時間: ${formatDuration(result.totalMinutes)} (${formatNumber(result.totalHours, 1)}時間)`,
    `月額: ${formatUsd(result.monthlyUsd)} / ${formatJpy(result.monthlyJpy)}`,
    `期間合計: ${formatUsd(result.totalUsd)} / ${formatJpy(result.totalJpy)}`,
    "前提: OpenAI公式価格、ファイル保存・要約・話者分離・後処理のLLM費用は別",
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
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-cyan-600">
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

export default function WhisperApiCost() {
  const [modelId, setModelId] = useState("gpt-4o-transcribe");
  const [files, setFiles] = useState("20");
  const [minutesPerFile, setMinutesPerFile] = useState("60");
  const [months, setMonths] = useState("1");
  const [exchangeRate, setExchangeRate] = useState("155");
  const [copied, setCopied] = useState(false);

  const model = MODELS.find((item) => item.id === modelId) ?? MODELS[0];

  const result = useMemo<CostResult>(() => {
    const fileCount = Math.max(0, parseNumber(files));
    const minutes = Math.max(0, parseNumber(minutesPerFile));
    const monthCount = Math.max(1, parseNumber(months));
    const totalMinutes = fileCount * minutes;
    const monthlyMinutes = totalMinutes / monthCount;
    const monthlyUsd = monthlyMinutes * model.pricePerMinute;
    const totalUsd = totalMinutes * model.pricePerMinute;
    const rate = Math.max(0, parseNumber(exchangeRate));

    return {
      files: fileCount,
      minutesPerFile: minutes,
      months: monthCount,
      totalMinutes,
      totalHours: totalMinutes / 60,
      monthlyMinutes,
      monthlyUsd,
      monthlyJpy: monthlyUsd * rate,
      totalUsd,
      totalJpy: totalUsd * rate,
      perFileUsd: minutes * model.pricePerMinute,
    };
  }, [exchangeRate, files, minutesPerFile, model.pricePerMinute, months]);

  function applyExample(example: (typeof EXAMPLES)[number]) {
    setModelId(example.modelId);
    setFiles(example.files);
    setMinutesPerFile(example.minutes);
    setMonths(example.months);
    setExchangeRate(example.exchange);
    setCopied(false);
  }

  function reset() {
    setModelId("gpt-4o-transcribe");
    setFiles("20");
    setMinutesPerFile("60");
    setMonths("1");
    setExchangeRate("155");
    setCopied(false);
  }

  async function copyResult() {
    await navigator.clipboard.writeText(buildCopyText(result, model));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">音声量</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">音声ファイル数、平均分数、対象期間から文字起こしAPI料金を概算します。</p>
            </div>
            <button type="button" onClick={reset} className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              クリア
            </button>
          </div>

          <div className="mt-5">
            <label htmlFor="transcription-model" className="text-sm font-semibold text-slate-800">
              モデル
            </label>
            <select
              id="transcription-model"
              value={modelId}
              onChange={(event) => {
                setModelId(event.target.value);
                setCopied(false);
              }}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-cyan-600"
            >
              {MODELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumberField id="audio-files" label="ファイル数" value={files} suffix="本" onChange={setFiles} />
            <NumberField id="audio-minutes" label="平均音声時間" value={minutesPerFile} suffix="分/本" onChange={setMinutesPerFile} />
            <NumberField id="audio-months" label="対象期間" value={months} suffix="か月" onChange={setMonths} />
            <NumberField id="audio-rate" label="為替レート" value={exchangeRate} suffix="円/USD" onChange={setExchangeRate} />
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button key={example.label} type="button" onClick={() => applyExample(example)} className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-cyan-600 hover:bg-cyan-50">
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">{model.name}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{model.note}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
              <span className="rounded-full bg-white px-3 py-1">{formatUsd(model.pricePerMinute)} / minute</span>
              {model.inputPer1M && <span className="rounded-full bg-white px-3 py-1">${model.inputPer1M} / 1M input tokens</span>}
              {model.outputPer1M && <span className="rounded-full bg-white px-3 py-1">${model.outputPer1M} / 1M output tokens</span>}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">見積もり</h2>
          <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
            <p className="text-sm font-medium text-cyan-900">推定月額</p>
            <p className="mt-1 font-mono text-5xl font-bold tracking-tight text-cyan-950">{formatUsd(result.monthlyUsd)}</p>
            <p className="mt-2 text-sm text-cyan-900">約 {formatJpy(result.monthlyJpy)} / 1 USD = {formatNumber(parseNumber(exchangeRate), 2)}円</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatCard label="期間合計" value={formatUsd(result.totalUsd)} note={formatJpy(result.totalJpy)} />
            <StatCard label="1本あたり" value={formatUsd(result.perFileUsd)} note={`${formatDuration(result.minutesPerFile)} / file`} />
            <StatCard label="総音声時間" value={formatDuration(result.totalMinutes)} note={`${formatNumber(result.totalHours, 1)} hours`} />
            <StatCard label="月間音声時間" value={formatDuration(result.monthlyMinutes)} note={`${formatNumber(result.monthlyMinutes)} minutes/month`} />
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            ファイル保存、話者分離、要約、翻訳、後処理LLM、Realtime APIの接続費用はこの概算に含めていません。
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
