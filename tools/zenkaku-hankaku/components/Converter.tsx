"use client";

import { useMemo, useState } from "react";
import { convert, type ConversionOptions } from "../lib/converter";

type Direction = "toHalf" | "toFull";

const SAMPLES = [
  {
    label: "住所・電話",
    text: "東京都渋谷区１－２－３　ＴＥＬ：０３－１２３４－５６７８",
  },
  {
    label: "半角カナ",
    text: "ﾄｳｷｮｳﾄ ｼﾌﾞﾔｸ ｶﾌﾞｼｷｶﾞｲｼｬ",
  },
  {
    label: "商品名",
    text: "Ａｐｐｌｅ　Ｗａｔｃｈ（４４ｍｍ）　カラー：ブラック",
  },
];

const OPTION_ITEMS: { key: keyof ConversionOptions; label: string; description: string }[] = [
  { key: "katakana", label: "カタカナ", description: "ア/ｱ、ガ/ｶﾞ など" },
  { key: "alphanumeric", label: "英数字", description: "ＡＢＣ１２３/ABC123" },
  { key: "symbol", label: "記号", description: "！？，（）/!?,()" },
  { key: "space", label: "スペース", description: "全角空白/半角空白" },
];

function countMatches(text: string) {
  return {
    fullwidth: [...text].filter((char) => /[^\u0000-\u00ff]/.test(char)).length,
    halfwidth: [...text].filter((char) => /[\u0020-\u007e\uff61-\uff9f]/.test(char)).length,
    fullwidthAlnum: (text.match(/[Ａ-Ｚａ-ｚ０-９]/g) ?? []).length,
    halfwidthKana: (text.match(/[\uff61-\uff9f]/g) ?? []).length,
    fullwidthSpaces: (text.match(/\u3000/g) ?? []).length,
    halfwidthSpaces: (text.match(/ /g) ?? []).length,
  };
}

function buildCsv(input: string, output: string, direction: Direction, options: ConversionOptions) {
  const rows = [
    ["field", "value"],
    ["direction", direction],
    ["katakana", String(options.katakana)],
    ["alphanumeric", String(options.alphanumeric)],
    ["symbol", String(options.symbol)],
    ["space", String(options.space)],
    ["input", input],
    ["output", output],
  ];
  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadCsv(text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "zenkaku-hankaku.csv";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export default function Converter() {
  const [input, setInput] = useState(SAMPLES[0].text);
  const [direction, setDirection] = useState<Direction>("toHalf");
  const [autoConvert, setAutoConvert] = useState(true);
  const [manualOutput, setManualOutput] = useState("");
  const [copied, setCopied] = useState("");
  const [options, setOptions] = useState<ConversionOptions>({
    katakana: true,
    alphanumeric: true,
    symbol: true,
    space: true,
  });

  const computedOutput = useMemo(() => convert(input, direction, options), [direction, input, options]);
  const effectiveOutput = autoConvert ? computedOutput : manualOutput;
  const inputStats = useMemo(() => countMatches(input), [input]);
  const outputStats = useMemo(() => countMatches(effectiveOutput), [effectiveOutput]);
  const validationError = input.length > 100_000 ? "入力エラー: 10万文字を超えています。ブラウザが重い場合は分割してください。" : "";

  function toggleOption(key: keyof ConversionOptions) {
    setOptions((current) => ({ ...current, [key]: !current[key] }));
    if (!autoConvert) setManualOutput("");
    setCopied("");
  }

  function manualConvert() {
    setManualOutput(computedOutput);
    setCopied("");
  }

  function reset() {
    setInput("");
    setDirection("toHalf");
    setAutoConvert(true);
    setManualOutput("");
    setOptions({ katakana: true, alphanumeric: true, symbol: true, space: true });
    setCopied("");
  }

  async function copy(label: string, value: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1600);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">テキスト変換</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">全角・半角を文字種ごとに切り替えて変換します。</p>
            </div>
            <button type="button" onClick={reset} className="w-fit rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              クリア
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            {[
              { value: "toHalf" as const, label: "全角 → 半角" },
              { value: "toFull" as const, label: "半角 → 全角" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setDirection(item.value);
                  if (!autoConvert) setManualOutput("");
                  setCopied("");
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${direction === item.value ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {OPTION_ITEMS.map((item) => (
              <label key={item.key} className={`rounded-xl border p-3 ${options[item.key] ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700"}`}>
                <span className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={options[item.key]}
                    onChange={() => toggleOption(item.key)}
                    className="mt-1 h-4 w-4 rounded border-slate-300"
                  />
                  <span>
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className={`block text-xs leading-5 ${options[item.key] ? "text-white/70" : "text-slate-500"}`}>{item.description}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>

          <label className="mt-5 grid gap-2 text-sm font-medium text-slate-700" htmlFor="zenkaku-hankaku-input">
            変換前テキスト
            <textarea
              id="zenkaku-hankaku-input"
              value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  if (!autoConvert) setManualOutput("");
                  setCopied("");
                }}
              rows={8}
              className="resize-y rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-7 outline-none focus:border-slate-900"
              placeholder="ここにテキストを入力またはペーストしてください"
              spellCheck={false}
            />
          </label>

          <p className={`mt-3 min-h-5 text-sm ${validationError ? "text-red-600" : "text-slate-500"}`}>
            {validationError || "入力値はブラウザ内で処理され、外部に送信されません。住所、氏名、CSV前処理、フォーム入力用の文字幅調整に使えます。"}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={autoConvert}
                onChange={(event) => {
                  setAutoConvert(event.target.checked);
                  if (event.target.checked) setManualOutput("");
                  setCopied("");
                }}
                className="h-4 w-4 rounded border-slate-300"
              />
              自動変換
            </label>
            {!autoConvert && (
              <button type="button" onClick={manualConvert} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                変換する
              </button>
            )}
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SAMPLES.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => {
                    setInput(sample.text);
                    setCopied("");
                  }}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 bg-slate-50 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">変換結果</h2>
          <textarea
            value={effectiveOutput}
            readOnly
            rows={8}
            className="mt-4 w-full resize-y rounded-2xl border border-slate-300 bg-white p-4 text-sm leading-7 text-slate-950 outline-none"
            placeholder="変換結果がここに表示されます"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => copy("output", effectiveOutput)} disabled={!effectiveOutput} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300">
              {copied === "output" ? "コピー済み" : "結果をコピー"}
            </button>
            <button type="button" onClick={() => copy("input", input)} disabled={!input} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:text-slate-300">
              入力をコピー
            </button>
            <button type="button" onClick={() => downloadCsv(buildCsv(input, effectiveOutput, direction, options))} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
              CSVダウンロード
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-950">文字幅の変化</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <StatBlock title="入力" stats={inputStats} />
              <StatBlock title="出力" stats={outputStats} />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <p className="font-semibold">変換の注意</p>
            <p className="mt-1">
              半角カタカナは古いシステムや一部フォームで使われますが、文字化けの原因になる場合があります。提出先の指定がない場合は全角カタカナが無難です。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatBlock({ title, stats }: { title: string; stats: ReturnType<typeof countMatches> }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-2 grid gap-1 text-xs text-slate-600">
        <span>全角: <b className="text-slate-950">{stats.fullwidth.toLocaleString()}</b></span>
        <span>半角: <b className="text-slate-950">{stats.halfwidth.toLocaleString()}</b></span>
        <span>全角英数: <b className="text-slate-950">{stats.fullwidthAlnum.toLocaleString()}</b></span>
        <span>半角カナ: <b className="text-slate-950">{stats.halfwidthKana.toLocaleString()}</b></span>
        <span>全角空白: <b className="text-slate-950">{stats.fullwidthSpaces.toLocaleString()}</b></span>
        <span>半角空白: <b className="text-slate-950">{stats.halfwidthSpaces.toLocaleString()}</b></span>
      </div>
    </div>
  );
}
