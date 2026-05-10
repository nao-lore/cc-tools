"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  compressImage,
  formatBytes,
  type CompressOptions,
  type CompressResult,
} from "../lib/compressor";

type ImageItem = {
  id: string;
  file: File;
  originalUrl: string;
  status: "pending" | "compressing" | "done" | "error";
  result?: CompressResult;
  error?: string;
};

type Preset = {
  label: string;
  description: string;
  quality: number;
  format: CompressOptions["format"];
  maxWidth: string;
  maxHeight: string;
};

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const PRESETS: Preset[] = [
  {
    label: "Web掲載",
    description: "WebP 80%, 横幅1600px",
    quality: 80,
    format: "image/webp",
    maxWidth: "1600",
    maxHeight: "",
  },
  {
    label: "SNS投稿",
    description: "JPEG 85%, 1080px以内",
    quality: 85,
    format: "image/jpeg",
    maxWidth: "1080",
    maxHeight: "1080",
  },
  {
    label: "メール添付",
    description: "WebP 70%, 1280px以内",
    quality: 70,
    format: "image/webp",
    maxWidth: "1280",
    maxHeight: "1280",
  },
];

function parseLimit(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function percent(value: number) {
  return `${value > 0 ? "-" : "+"}${Math.abs(value)}%`;
}

function formatSignedBytes(bytes: number) {
  const formatted = formatBytes(Math.abs(bytes));
  return bytes < 0 ? `+${formatted}` : formatted;
}

function formatFormat(format: CompressOptions["format"]) {
  if (format === "image/jpeg") return "JPEG";
  if (format === "image/png") return "PNG";
  return "WebP";
}

function buildSummary(images: ImageItem[]) {
  const rows = images.filter((image) => image.result);
  if (!rows.length) return "";

  return rows
    .map((image) => {
      const result = image.result!;
      return [
        image.file.name,
        `${formatBytes(result.originalSize)} -> ${formatBytes(result.compressedSize)}`,
        percent(result.reductionPercent),
        `${result.width}x${result.height}`,
        result.fileName,
      ].join("\t");
    })
    .join("\n");
}

export default function ImageCompressor() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<CompressOptions["format"]>("image/webp");
  const [maxWidth, setMaxWidth] = useState("1600");
  const [maxHeight, setMaxHeight] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const trackedUrls = useRef(new Set<string>());

  const doneImages = images.filter((image) => image.status === "done" && image.result);
  const selected = images.find((image) => image.id === selectedId) ?? images[0];
  const totalOriginalSize = doneImages.reduce((sum, image) => sum + image.result!.originalSize, 0);
  const totalCompressedSize = doneImages.reduce((sum, image) => sum + image.result!.compressedSize, 0);
  const totalSaved = totalOriginalSize - totalCompressedSize;
  const totalReduction = totalOriginalSize > 0 ? Math.round((totalSaved / totalOriginalSize) * 100) : 0;

  const validationError = useMemo(() => {
    const width = maxWidth ? Number.parseInt(maxWidth, 10) : 0;
    const height = maxHeight ? Number.parseInt(maxHeight, 10) : 0;
    if (maxWidth && (!Number.isFinite(width) || width < 1 || width > 12000)) return "Max width must be 1-12000px.";
    if (maxHeight && (!Number.isFinite(height) || height < 1 || height > 12000)) return "Max height must be 1-12000px.";
    return "";
  }, [maxHeight, maxWidth]);

  function trackUrl(url: string) {
    trackedUrls.current.add(url);
    return url;
  }

  function revokeUrl(url: string | undefined) {
    if (!url || !trackedUrls.current.has(url)) return;
    URL.revokeObjectURL(url);
    trackedUrls.current.delete(url);
  }

  function markResultsStale() {
    setImages((current) =>
      current.map((image) => {
        if (image.result) revokeUrl(image.result.url);
        return image.result || image.status === "done" || image.status === "error"
          ? { ...image, status: "pending", result: undefined, error: undefined }
          : image;
      })
    );
    setCopied(false);
  }

  function updateQuality(value: number) {
    setQuality(value);
    markResultsStale();
  }

  function updateFormat(value: CompressOptions["format"]) {
    setFormat(value);
    markResultsStale();
  }

  function updateWidth(value: string) {
    setMaxWidth(value.replace(/[^\d]/g, ""));
    markResultsStale();
  }

  function updateHeight(value: string) {
    setMaxHeight(value.replace(/[^\d]/g, ""));
    markResultsStale();
  }

  function applyPreset(preset: Preset) {
    setQuality(preset.quality);
    setFormat(preset.format);
    setMaxWidth(preset.maxWidth);
    setMaxHeight(preset.maxHeight);
    markResultsStale();
  }

  const addFiles = useCallback((files: FileList | File[]) => {
    const incoming = Array.from(files);
    const accepted = incoming.filter((file) => ACCEPTED_TYPES.includes(file.type));
    const rejected = incoming.length - accepted.length;

    if (rejected > 0) {
      setMessage(`${rejected} file(s) were skipped. Use JPEG, PNG, or WebP.`);
    } else {
      setMessage("");
    }

    if (!accepted.length) return;

    const newItems: ImageItem[] = accepted.map((file) => ({
      id: crypto.randomUUID(),
      file,
      originalUrl: trackUrl(URL.createObjectURL(file)),
      status: "pending",
    }));

    setImages((current) => [...current, ...newItems]);
    setSelectedId((current) => current ?? newItems[0].id);
    setCopied(false);
  }, []);

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length > 0) addFiles(event.dataTransfer.files);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  async function compressAll() {
    if (!images.length || validationError || isProcessing) return;

    const options: CompressOptions = {
      quality,
      format,
      maxWidth: parseLimit(maxWidth),
      maxHeight: parseLimit(maxHeight),
    };

    setIsProcessing(true);
    setCopied(false);
    setMessage("");

    for (const image of images) {
      setImages((current) =>
        current.map((item) =>
          item.id === image.id
            ? { ...item, status: "compressing", error: undefined }
            : item
        )
      );

      try {
        const result = await compressImage(image.file, options);
        trackUrl(result.url);
        setImages((current) =>
          current.map((item) => {
            if (item.id !== image.id) return item;
            if (item.result) revokeUrl(item.result.url);
            return { ...item, status: "done", result };
          })
        );
      } catch (error) {
        setImages((current) =>
          current.map((item) =>
            item.id === image.id
              ? {
                  ...item,
                  status: "error",
                  result: undefined,
                  error: error instanceof Error ? error.message : "Compression failed",
                }
              : item
          )
        );
      }
    }

    setIsProcessing(false);
  }

  function downloadOne(item: ImageItem) {
    if (!item.result) return;
    const anchor = document.createElement("a");
    anchor.href = item.result.url;
    anchor.download = item.result.fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  function downloadAll() {
    doneImages.forEach(downloadOne);
  }

  async function copySummary() {
    const summary = buildSummary(images);
    if (!summary) return;
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function removeImage(id: string) {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      revokeUrl(target?.originalUrl);
      revokeUrl(target?.result?.url);
      const next = current.filter((image) => image.id !== id);
      setSelectedId((currentSelected) => (currentSelected === id ? next[0]?.id ?? null : currentSelected));
      return next;
    });
  }

  function clearAll() {
    images.forEach((image) => {
      revokeUrl(image.originalUrl);
      revokeUrl(image.result?.url);
    });
    setImages([]);
    setSelectedId(null);
    setMessage("");
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.55fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 text-center transition ${
              isDragging
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-300 bg-slate-50 hover:border-slate-500 hover:bg-white"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(event) => {
                if (event.target.files) addFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">画像を選択</div>
            <p className="mt-4 text-lg font-semibold text-slate-950">JPEG / PNG / WebP をここにドロップ</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              画像はブラウザ上で圧縮され、外部に送信されません。複数ファイルをまとめて処理できます。
            </p>
          </div>

          {message && <p className="mt-3 text-sm text-amber-700">{message}</p>}

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="rounded-xl border border-slate-200 p-4 text-left hover:border-slate-400 hover:bg-slate-50"
              >
                <span className="text-sm font-semibold text-slate-950">{preset.label}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">サンプル設定: {preset.description}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="image-quality" className="text-sm font-semibold text-slate-800">
                Quality: {quality}%
              </label>
              <input
                id="image-quality"
                type="range"
                min={1}
                max={100}
                value={quality}
                onChange={(event) => updateQuality(Number(event.target.value))}
                className="mt-3 w-full accent-slate-950"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>軽量</span>
                <span>高画質</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">Output format</p>
              <div className="mt-3 grid grid-cols-3 rounded-xl bg-slate-100 p-1">
                {(["image/webp", "image/jpeg", "image/png"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateFormat(option)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      format === option ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-950"
                    }`}
                  >
                    {formatFormat(option)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="image-max-width" className="text-sm font-semibold text-slate-800">
                Max width
              </label>
              <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 focus-within:border-slate-950">
                <input
                  id="image-max-width"
                  type="text"
                  inputMode="numeric"
                  value={maxWidth}
                  onChange={(event) => updateWidth(event.target.value)}
                  placeholder="No limit"
                  className="min-w-0 flex-1 px-3 py-2.5 text-right font-mono outline-none"
                />
                <span className="border-l border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">px</span>
              </div>
            </div>

            <div>
              <label htmlFor="image-max-height" className="text-sm font-semibold text-slate-800">
                Max height
              </label>
              <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 focus-within:border-slate-950">
                <input
                  id="image-max-height"
                  type="text"
                  inputMode="numeric"
                  value={maxHeight}
                  onChange={(event) => updateHeight(event.target.value)}
                  placeholder="No limit"
                  className="min-w-0 flex-1 px-3 py-2.5 text-right font-mono outline-none"
                />
                <span className="border-l border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">px</span>
              </div>
            </div>
          </div>

          <p className={`mt-3 min-h-5 text-sm ${validationError ? "text-red-600" : "text-slate-500"}`}>
            {validationError || "WebPはWeb向け、JPEGは写真互換、PNGは透過や線画向けです。"}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={compressAll}
              disabled={!images.length || Boolean(validationError) || isProcessing}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isProcessing ? "圧縮中..." : `圧縮する (${images.length})`}
            </button>
            <button
              type="button"
              onClick={downloadAll}
              disabled={!doneImages.length}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              まとめてダウンロード
            </button>
            <button
              type="button"
              onClick={copySummary}
              disabled={!doneImages.length}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              {copied ? "コピー済み" : "結果をコピー"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={!images.length}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              クリア
            </button>
          </div>
        </div>

        <aside className="p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">圧縮結果</h2>
          <div className="mt-4 grid gap-3">
            <Stat label="処理済み" value={`${doneImages.length} / ${images.length}`} />
            <Stat label="削減量" value={doneImages.length ? formatSignedBytes(totalSaved) : "-"} />
            <Stat label="削減率" value={doneImages.length ? percent(totalReduction) : "-"} />
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {!selected ? (
              <p className="text-sm leading-6 text-slate-500">画像を追加すると、元画像と圧縮後のプレビューを比較できます。</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="truncate text-sm font-semibold text-slate-950">{selected.file.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatBytes(selected.file.size)}</p>
                </div>
                <Preview title="Original" src={selected.originalUrl} alt={selected.file.name} />
                <Preview
                  title="Compressed"
                  src={selected.result?.url}
                  alt={`${selected.file.name} compressed`}
                  empty={
                    selected.status === "compressing"
                      ? "Compressing..."
                      : selected.status === "error"
                        ? selected.error ?? "Compression failed"
                        : "圧縮後に表示されます"
                  }
                />
                {selected.result && (
                  <div className="rounded-xl bg-white p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Size</span>
                      <span className="font-semibold text-slate-950">
                        {formatBytes(selected.result.originalSize)} {"->"} {formatBytes(selected.result.compressedSize)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-slate-500">Dimensions</span>
                      <span className="font-semibold text-slate-950">
                        {selected.result.width} x {selected.result.height}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadOne(selected)}
                      className="mt-3 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      この画像をダウンロード
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {images.length > 0 && (
        <div className="border-t border-slate-200 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">ファイル一覧</h2>
          <div className="mt-3 grid gap-2">
            {images.map((image) => (
              <div
                key={image.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(image.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedId(image.id);
                  }
                }}
                className={`grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border p-3 text-left ${
                  selectedId === image.id ? "border-slate-950 bg-slate-50" : "border-slate-200 hover:border-slate-400"
                }`}
              >
                <img src={image.originalUrl} alt="" className="h-11 w-11 rounded-lg object-cover" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-950">{image.file.name}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {image.status === "done" && image.result
                      ? `${percent(image.result.reductionPercent)} / ${formatBytes(image.result.compressedSize)}`
                      : image.status === "compressing"
                        ? "Compressing..."
                        : image.status === "error"
                          ? image.error
                          : formatBytes(image.file.size)}
                  </span>
                </span>
                <span className="flex gap-1">
                  {image.result && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        downloadOne(image);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          downloadOne(image);
                        }
                      }}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-white"
                    >
                      DL
                    </span>
                  )}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeImage(image.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        removeImage(image.id);
                      }
                    }}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-white"
                  >
                    削除
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function Preview({ title, src, alt, empty }: { title: string; src?: string; alt: string; empty?: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      </div>
      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
        {src ? (
          <img src={src} alt={alt} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="px-4 text-center text-sm text-slate-400">{empty}</span>
        )}
      </div>
    </div>
  );
}
