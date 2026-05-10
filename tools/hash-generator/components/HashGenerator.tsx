"use client";

import { useMemo, useRef, useState } from "react";
import { computeAllHashes, type HashResult } from "../lib/hash";

const SAMPLES = [
  { label: "hello", value: "hello" },
  { label: "JSON", value: '{"user":"nao","role":"developer"}' },
  { label: "日本語", value: "こんにちは、世界" },
];

function formatHash(hash: string, uppercase: boolean) {
  return uppercase ? hash.toUpperCase() : hash;
}

function buildOutput(results: HashResult[], uppercase: boolean) {
  return results.map((item) => `${item.algorithm}\t${formatHash(item.hash, uppercase)}`).join("\n");
}

function downloadText(fileName: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function HashGenerator() {
  const [input, setInput] = useState(SAMPLES[0].value);
  const [textResults, setTextResults] = useState<HashResult[]>([]);
  const [fileResults, setFileResults] = useState<HashResult[]>([]);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const [uppercase, setUppercase] = useState(false);
  const [computing, setComputing] = useState<"text" | "file" | null>(null);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeResults = fileResults.length ? fileResults : textResults;
  const activeLabel = fileResults.length ? fileName : "Text input";
  const compareReady = compareA.trim() && compareB.trim();
  const compareMatch = compareReady && compareA.trim().toLowerCase() === compareB.trim().toLowerCase();
  const outputText = useMemo(() => buildOutput(activeResults, uppercase), [activeResults, uppercase]);

  async function computeText(value = input) {
    const target = value.trim() ? value : "";
    if (!target) {
      setError("テキストを入力してください。");
      return;
    }

    setComputing("text");
    setError("");
    setFileResults([]);
    setFileName("");
    setFileSize(0);

    try {
      const data = new TextEncoder().encode(target);
      setTextResults(await computeAllHashes(data));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Hash generation failed.");
    } finally {
      setComputing(null);
    }
  }

  async function computeFile(file: File) {
    setComputing("file");
    setError("");
    setTextResults([]);
    setFileName(file.name);
    setFileSize(file.size);

    try {
      const data = new Uint8Array(await file.arrayBuffer());
      setFileResults(await computeAllHashes(data));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "File hash generation failed.");
    } finally {
      setComputing(null);
    }
  }

  async function copy(value: string, label: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1500);
  }

  function reset() {
    setInput("");
    setTextResults([]);
    setFileResults([]);
    setFileName("");
    setFileSize(0);
    setCompareA("");
    setCompareB("");
    setError("");
    setCopied("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function applySample(value: string) {
    setInput(value);
    setFileResults([]);
    setFileName("");
    setFileSize(0);
    setCopied("");
    void computeText(value);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">入力</h2>
              <p className="mt-1 text-sm text-slate-500">テキストまたはファイルから、主要ハッシュをまとめて生成します。</p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(event) => setUppercase(event.target.checked)}
                className="h-4 w-4 accent-slate-950"
              />
              Uppercase
            </label>
          </div>

          <div className="mt-5">
            <label htmlFor="hash-input" className="text-sm font-semibold text-slate-800">
              Text
            </label>
            <textarea
              id="hash-input"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setFileResults([]);
                setFileName("");
                setFileSize(0);
              }}
              rows={7}
              placeholder="Hashにしたいテキストを入力"
              className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white p-4 font-mono text-sm text-slate-950 outline-none focus:border-slate-950"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {SAMPLES.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => applySample(sample.value)}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-950 hover:bg-slate-50"
              >
                サンプル: {sample.label}
              </button>
            ))}
          </div>

          <div
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files[0];
              if (file) void computeFile(file);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-5 cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition ${
              dragging ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-slate-50 hover:border-slate-500"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void computeFile(file);
              }}
              className="sr-only"
            />
            <p className="text-sm font-semibold text-slate-950">ファイルを選択またはドロップ</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">ファイルの内容はブラウザ上で読み取られ、外部に送信されません。</p>
            {fileName && (
              <p className="mt-2 truncate font-mono text-xs text-emerald-700">
                {fileName} / {fileSize.toLocaleString()} bytes
              </p>
            )}
          </div>

          <p className={`mt-3 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
            {error || "MD5とSHA-1は互換性確認向けです。セキュリティ用途ではSHA-256以上を使ってください。"}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void computeText()}
              disabled={computing !== null || !input.trim()}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {computing === "text" ? "生成中..." : "テキストから生成"}
            </button>
            <button
              type="button"
              onClick={() => copy(outputText, "all")}
              disabled={!activeResults.length}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              {copied === "all" ? "コピー済み" : "結果をコピー"}
            </button>
            <button
              type="button"
              onClick={() => downloadText("hash-results.txt", outputText)}
              disabled={!activeResults.length}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              TXTダウンロード
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              リセット
            </button>
          </div>
        </div>

        <aside className="p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">Hash results</h2>
          <p className="mt-1 truncate text-sm text-slate-500">{activeLabel}</p>
          {activeResults.length ? (
            <div className="mt-4 space-y-3">
              {activeResults.map((result) => (
                <div key={result.algorithm} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-950">{result.algorithm}</span>
                    <button
                      type="button"
                      onClick={() => copy(formatHash(result.hash, uppercase), result.algorithm)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-white"
                    >
                      {copied === result.algorithm ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="mt-2 break-all font-mono text-xs leading-5 text-slate-700">{formatHash(result.hash, uppercase)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              ハッシュ生成後に MD5 / SHA-1 / SHA-256 / SHA-384 / SHA-512 が表示されます。
            </div>
          )}
        </aside>
      </div>

      <div className="border-t border-slate-200 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-950">Hash comparison</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Hash A</span>
            <textarea
              value={compareA}
              onChange={(event) => setCompareA(event.target.value)}
              rows={3}
              className="mt-2 w-full resize-y rounded-xl border border-slate-300 p-3 font-mono text-xs outline-none focus:border-slate-950"
              placeholder="1つ目のハッシュ値"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Hash B</span>
            <textarea
              value={compareB}
              onChange={(event) => setCompareB(event.target.value)}
              rows={3}
              className="mt-2 w-full resize-y rounded-xl border border-slate-300 p-3 font-mono text-xs outline-none focus:border-slate-950"
              placeholder="2つ目のハッシュ値"
            />
          </label>
        </div>
        <div
          className={`mt-3 rounded-xl border p-3 text-sm font-semibold ${
            !compareReady
              ? "border-slate-200 bg-slate-50 text-slate-500"
              : compareMatch
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {!compareReady ? "2つのハッシュ値を入力すると、大文字小文字を無視して照合します。" : compareMatch ? "一致しています。" : "一致していません。"}
        </div>
      </div>
    </section>
  );
}
