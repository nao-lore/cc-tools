"use client";

import { useMemo, useState } from "react";

type Mode = "encode" | "decode";
type EncodingType = "component" | "uri" | "strict";

type ParsedUrl = {
  protocol: string;
  host: string;
  path: string;
  queryParams: [string, string][];
  fragment: string;
};

type QueryParam = {
  id: number;
  key: string;
  value: string;
};

const EXAMPLES = [
  {
    label: "検索パラメータ",
    mode: "encode" as const,
    encodingType: "component" as const,
    input: "東京 カフェ&ランチ",
  },
  {
    label: "URL全体",
    mode: "encode" as const,
    encodingType: "uri" as const,
    input: "https://example.com/search?q=東京 カフェ&sort=new",
  },
  {
    label: "デコード",
    mode: "decode" as const,
    encodingType: "component" as const,
    input: "%E6%9D%B1%E4%BA%AC%20%E3%82%AB%E3%83%95%E3%82%A7%26%E3%83%A9%E3%83%B3%E3%83%81",
  },
];

const CHAR_REFERENCE = [
  ["空白", "%20", "URLSearchParamsでは+になる場合もあります"],
  ["#", "%23", "フラグメント開始記号"],
  ["%", "%25", "パーセント記号"],
  ["&", "%26", "クエリ区切り"],
  ["+", "%2B", "プラス記号"],
  ["/", "%2F", "パス区切り"],
  ["?", "%3F", "クエリ開始記号"],
  ["=", "%3D", "キーと値の区切り"],
  ["日本語", "%E6%97%A5...", "UTF-8バイト列で表現"],
];

function strictPercentEncode(value: string) {
  return Array.from(value)
    .map((char) => {
      if (/^[A-Za-z0-9_.~-]$/.test(char)) return char;
      return Array.from(new TextEncoder().encode(char))
        .map((byte) => `%${byte.toString(16).toUpperCase().padStart(2, "0")}`)
        .join("");
    })
    .join("");
}

function transform(input: string, mode: Mode, encodingType: EncodingType) {
  if (!input) return { output: "", error: "" };

  try {
    if (mode === "encode") {
      if (encodingType === "uri") return { output: encodeURI(input), error: "" };
      if (encodingType === "strict") return { output: strictPercentEncode(input), error: "" };
      return { output: encodeURIComponent(input), error: "" };
    }

    if (encodingType === "uri") return { output: decodeURI(input), error: "" };
    return { output: decodeURIComponent(input), error: "" };
  } catch (error) {
    return {
      output: "",
      error: error instanceof Error ? `入力エラー: ${error.message}` : "入力エラー: デコードできない文字列です。",
    };
  }
}

function parseUrl(input: string): ParsedUrl | null {
  try {
    const url = new URL(input);
    const queryParams: [string, string][] = [];
    url.searchParams.forEach((value, key) => queryParams.push([key, value]));
    return {
      protocol: url.protocol.replace(":", ""),
      host: url.host,
      path: url.pathname,
      queryParams,
      fragment: url.hash.replace("#", ""),
    };
  } catch {
    return null;
  }
}

function buildQuery(params: QueryParam[]) {
  const pairs = params.filter((param) => param.key.trim());
  if (!pairs.length) return "";
  return `?${pairs.map((param) => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`).join("&")}`;
}

function buildCsv(parsed: ParsedUrl | null, output: string, queryOutput: string) {
  const rows = [
    ["section", "key", "value"],
    ["converter", "output", output],
    ["query_builder", "query_string", queryOutput],
  ];
  if (parsed) {
    rows.push(["parsed_url", "protocol", parsed.protocol]);
    rows.push(["parsed_url", "host", parsed.host]);
    rows.push(["parsed_url", "path", parsed.path]);
    rows.push(["parsed_url", "fragment", parsed.fragment]);
    for (const [key, value] of parsed.queryParams) rows.push(["query_param", key, value]);
  }
  return rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadCsv(text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "url-encoder.csv";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export default function UrlEncoder() {
  const [mode, setMode] = useState<Mode>("encode");
  const [encodingType, setEncodingType] = useState<EncodingType>("component");
  const [input, setInput] = useState(EXAMPLES[0].input);
  const [urlInput, setUrlInput] = useState("https://example.com/search?q=%E6%9D%B1%E4%BA%AC&sort=new#top");
  const [queryParams, setQueryParams] = useState<QueryParam[]>([
    { id: 1, key: "q", value: "東京 カフェ" },
    { id: 2, key: "sort", value: "new" },
  ]);
  const [copied, setCopied] = useState("");

  const transformed = useMemo(() => transform(input, mode, encodingType), [input, mode, encodingType]);
  const parsedUrl = useMemo(() => parseUrl(urlInput), [urlInput]);
  const queryOutput = useMemo(() => buildQuery(queryParams), [queryParams]);

  function reset() {
    setMode("encode");
    setEncodingType("component");
    setInput("");
    setUrlInput("");
    setQueryParams([{ id: 1, key: "", value: "" }]);
    setCopied("");
  }

  async function copy(label: string, value: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1600);
  }

  function addParam() {
    const nextId = Math.max(0, ...queryParams.map((param) => param.id)) + 1;
    setQueryParams((current) => [...current, { id: nextId, key: "", value: "" }]);
  }

  function updateParam(id: number, field: "key" | "value", value: string) {
    setQueryParams((current) => current.map((param) => (param.id === id ? { ...param, [field]: value } : param)));
  }

  function removeParam(id: number) {
    setQueryParams((current) => (current.length === 1 ? [{ id: 1, key: "", value: "" }] : current.filter((param) => param.id !== id)));
  }

  function swap() {
    if (!transformed.output) return;
    setInput(transformed.output);
    setMode(mode === "encode" ? "decode" : "encode");
    setCopied("");
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">エンコード・デコード</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">URL全体、クエリ値、厳密なパーセントエンコードを切り替えられます。</p>
            </div>
            <button type="button" onClick={reset} className="w-fit rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              クリア
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            {[
              { value: "encode" as const, label: "Encode" },
              { value: "decode" as const, label: "Decode" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setMode(item.value);
                  setCopied("");
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === item.value ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="mt-5 grid gap-2 text-sm font-medium text-slate-700" htmlFor="url-encoding-type">
            変換方式
            <select
              id="url-encoding-type"
              value={encodingType}
              onChange={(event) => setEncodingType(event.target.value as EncodingType)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
            >
              <option value="component">encodeURIComponent: クエリ値・パス断片向け</option>
              <option value="uri">encodeURI: URL全体向け</option>
              <option value="strict">Strict percent: 予約文字もできるだけエンコード</option>
            </select>
          </label>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="url-encoder-input">
              入力
              <textarea
                id="url-encoder-input"
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  setCopied("");
                }}
                rows={9}
                spellCheck={false}
                className="min-h-48 resize-y rounded-2xl border border-slate-300 bg-white p-4 font-mono text-sm leading-6 outline-none focus:border-slate-900"
                placeholder={mode === "encode" ? "東京 カフェ&ランチ" : "%E6%9D%B1%E4%BA%AC"}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="url-encoder-output">
              出力
              <textarea
                id="url-encoder-output"
                value={transformed.error || transformed.output}
                readOnly
                rows={9}
                className={`min-h-48 resize-y rounded-2xl border bg-slate-50 p-4 font-mono text-sm leading-6 outline-none ${transformed.error ? "border-red-300 text-red-700" : "border-slate-300 text-slate-950"}`}
                placeholder="変換結果"
              />
            </label>
          </div>

          <p className={`mt-3 min-h-5 text-sm ${transformed.error ? "text-red-600" : "text-slate-500"}`}>
            {transformed.error || "入力値はブラウザ内で処理され、外部に送信されません。デコード時に壊れた%表記があると入力エラーを表示します。"}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => copy("input", input)} disabled={!input} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300">
              {copied === "input" ? "入力コピー済み" : "入力をコピー"}
            </button>
            <button type="button" onClick={() => copy("output", transformed.output)} disabled={!transformed.output} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300">
              {copied === "output" ? "出力コピー済み" : "出力をコピー"}
            </button>
            <button type="button" onClick={swap} disabled={!transformed.output} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300">
              入出力を入れ替え
            </button>
            <button type="button" onClick={() => downloadCsv(buildCsv(parsedUrl, transformed.output, queryOutput))} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              CSVダウンロード
            </button>
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => {
                    setMode(example.mode);
                    setEncodingType(example.encodingType);
                    setInput(example.input);
                    setCopied("");
                  }}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-semibold text-slate-950">URL分解</h2>
            <label className="mt-4 grid gap-2 text-sm font-medium text-slate-700" htmlFor="url-parser-input">
              URL
              <input
                id="url-parser-input"
                type="text"
                value={urlInput}
                onChange={(event) => setUrlInput(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-slate-900"
                placeholder="https://example.com/path?q=value#top"
                spellCheck={false}
              />
            </label>
            {urlInput && !parsedUrl && <p className="mt-2 text-sm text-red-600">入力エラー: https:// から始まる完全なURLを入力してください。</p>}
            {parsedUrl && (
              <div className="mt-4 grid gap-2 text-sm">
                <ParsedRow label="Protocol" value={parsedUrl.protocol} />
                <ParsedRow label="Host" value={parsedUrl.host} />
                <ParsedRow label="Path" value={parsedUrl.path} />
                <ParsedRow label="Fragment" value={parsedUrl.fragment || "-"} />
                {parsedUrl.queryParams.map(([key, value]) => (
                  <ParsedRow key={`${key}-${value}`} label={`Query: ${key}`} value={value} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 bg-slate-50 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">クエリ文字列ビルダー</h2>
          <div className="mt-4 grid gap-3">
            {queryParams.map((param) => (
              <div key={param.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <label className="grid gap-1 text-xs font-medium text-slate-500">
                  key
                  <input
                    type="text"
                    value={param.key}
                    onChange={(event) => updateParam(param.id, "key", event.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-950 outline-none focus:border-slate-900"
                    spellCheck={false}
                  />
                </label>
                <label className="grid gap-1 text-xs font-medium text-slate-500">
                  value
                  <input
                    type="text"
                    value={param.value}
                    onChange={(event) => updateParam(param.id, "value", event.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-950 outline-none focus:border-slate-900"
                    spellCheck={false}
                  />
                </label>
                <button type="button" onClick={() => removeParam(param.id)} className="self-end rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-white">
                  削除
                </button>
              </div>
            ))}
          </div>

          <button type="button" onClick={addParam} className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
            行を追加
          </button>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-950">生成結果</h2>
              <button type="button" onClick={() => copy("query", queryOutput)} disabled={!queryOutput} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:text-slate-300">
                {copied === "query" ? "コピー済み" : "コピー"}
              </button>
            </div>
            <code className="mt-3 block min-h-12 break-all rounded-xl bg-slate-950 p-3 font-mono text-xs leading-6 text-white">
              {queryOutput || "キーを入力するとクエリ文字列が生成されます。"}
            </code>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-950">よく使うエンコード表</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[360px] border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs text-slate-500">
                    <th className="border border-slate-200 px-3 py-2">文字</th>
                    <th className="border border-slate-200 px-3 py-2">変換後</th>
                    <th className="border border-slate-200 px-3 py-2">用途</th>
                  </tr>
                </thead>
                <tbody>
                  {CHAR_REFERENCE.map(([char, encoded, description]) => (
                    <tr key={`${char}-${encoded}`} className="even:bg-slate-50">
                      <td className="border border-slate-200 px-3 py-2 font-mono font-semibold">{char}</td>
                      <td className="border border-slate-200 px-3 py-2 font-mono">{encoded}</td>
                      <td className="border border-slate-200 px-3 py-2 text-xs leading-5 text-slate-600">{description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <p className="font-semibold">使い分けの目安</p>
            <p className="mt-1">
              クエリ値にはencodeURIComponent、URL全体にはencodeURIを使います。`&` や `=` を値として渡したい場合は必ずクエリ値としてエンコードしてください。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ParsedRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-xl bg-slate-50 p-3 sm:grid-cols-[120px_1fr]">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="break-all font-mono text-sm text-slate-950">{value}</span>
    </div>
  );
}
