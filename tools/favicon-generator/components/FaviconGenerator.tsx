"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FAVICON_SIZES,
  buildIco,
  downloadDataURL,
  generateEmojiFavicon,
  generateImageFavicon,
  generateMetaTags,
  generateTextFavicon,
} from "../lib/favicon";

type Mode = "text" | "emoji" | "image";
type PreviewMap = Partial<Record<(typeof FAVICON_SIZES)[number], string>>;

const FONTS = ["Arial", "Inter", "Georgia", "Verdana", "Impact", "Courier New", "Trebuchet MS", "Times New Roman"];

const POPULAR_EMOJIS = [
  "\u{1F680}",
  "\u{2B50}",
  "\u{1F525}",
  "\u{1F4A1}",
  "\u{2764}\u{FE0F}",
  "\u{26A1}",
  "\u{1F30D}",
  "\u{1F3AF}",
  "\u{1F527}",
  "\u{1F4BB}",
  "\u{1F3A8}",
  "\u{1F4DA}",
  "\u{2705}",
  "\u{1F389}",
  "\u{1F4E6}",
  "\u{1F916}",
  "\u{1F331}",
  "\u{1F48E}",
  "\u{1F50D}",
  "\u{1F3E0}",
];

const SIZE_LABELS: Record<number, string> = {
  16: "16 x 16 browser tab",
  32: "32 x 32 browser icon",
  48: "48 x 48 desktop icon",
  180: "180 x 180 Apple touch",
  192: "192 x 192 Android",
  512: "512 x 512 PWA",
};

const PRESETS = [
  { label: "SaaS", mode: "text" as const, text: "S", emoji: "\u{1F680}", font: "Inter", textColor: "#ffffff", bgColor: "#0f172a" },
  { label: "Launch", mode: "emoji" as const, text: "A", emoji: "\u{1F680}", font: "Arial", textColor: "#ffffff", bgColor: "#4f46e5" },
  { label: "Docs", mode: "emoji" as const, text: "D", emoji: "\u{1F4DA}", font: "Georgia", textColor: "#ffffff", bgColor: "#065f46" },
  { label: "Tool", mode: "text" as const, text: "</", emoji: "\u{1F527}", font: "Courier New", textColor: "#0f172a", bgColor: "#e0f2fe" },
];

function normalizeText(value: string) {
  return value.slice(0, 2);
}

function hasUsableText(value: string) {
  return value.trim().length > 0;
}

export default function FaviconGenerator() {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("A");
  const [font, setFont] = useState("Inter");
  const [fontSize, setFontSize] = useState(72);
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#4f46e5");
  const [emoji, setEmoji] = useState("\u{1F680}");
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [uploadedLabel, setUploadedLabel] = useState("");
  const [previews, setPreviews] = useState<PreviewMap>({});
  const [baseUrl, setBaseUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validationError = useMemo(() => {
    if (mode === "text" && !hasUsableText(text)) return "Enter one or two characters before downloading.";
    if (mode === "emoji" && !hasUsableText(emoji)) return "Choose or type an emoji before downloading.";
    if (mode === "image" && !uploadedImage) return "Upload a square-ish image to generate favicon previews.";
    return "";
  }, [emoji, mode, text, uploadedImage]);

  const metaTags = useMemo(() => generateMetaTags(baseUrl || "/"), [baseUrl]);

  useEffect(() => {
    if (validationError) {
      setPreviews({});
      return;
    }

    const next: PreviewMap = {};
    for (const size of FAVICON_SIZES) {
      if (mode === "text") {
        next[size] = generateTextFavicon(size, {
          text: normalizeText(text),
          fontFamily: font,
          fontSize,
          textColor,
          bgColor,
        });
      }

      if (mode === "emoji") {
        next[size] = generateEmojiFavicon(size, { emoji, bgColor });
      }

      if (mode === "image" && uploadedImage) {
        next[size] = generateImageFavicon(size, { image: uploadedImage, bgColor });
      }
    }
    setPreviews(next);
  }, [bgColor, emoji, font, fontSize, mode, text, uploadedImage, validationError, textColor]);

  const hasPreviews = Object.keys(previews).length > 0;

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setMode(preset.mode);
    setText(preset.text);
    setEmoji(preset.emoji);
    setFont(preset.font);
    setTextColor(preset.textColor);
    setBgColor(preset.bgColor);
    setCopied(false);
    setFileError("");
  }

  function reset() {
    setMode("text");
    setText("A");
    setFont("Inter");
    setFontSize(72);
    setTextColor("#ffffff");
    setBgColor("#4f46e5");
    setEmoji("\u{1F680}");
    setUploadedImage(null);
    setUploadedLabel("");
    setFileError("");
    setCopied(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileError("");
    setUploadedImage(null);
    setUploadedLabel("");

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFileError("Choose a PNG, JPG, WebP, SVG, or another browser-readable image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("Keep the source image under 5 MB for reliable browser-side generation.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        setUploadedImage(image);
        setUploadedLabel(`${file.name} (${image.naturalWidth} x ${image.naturalHeight})`);
      };
      image.onerror = () => setFileError("The selected image could not be decoded by the browser.");
      image.src = String(reader.result || "");
    };
    reader.onerror = () => setFileError("The selected image could not be read.");
    reader.readAsDataURL(file);
  }

  function handleDownloadPng(size: number) {
    const dataURL = previews[size as keyof typeof previews];
    if (!dataURL) return;
    downloadDataURL(dataURL, `favicon-${size}x${size}.png`);
  }

  function handleDownloadIco() {
    const pngDataURLs = [16, 32, 48]
      .filter((size) => previews[size as keyof typeof previews])
      .map((size) => ({ size, dataURL: previews[size as keyof typeof previews] as string }));

    if (pngDataURLs.length === 0) return;

    const blob = buildIco(pngDataURLs);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "favicon.ico";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  async function copyMetaTags() {
    await navigator.clipboard.writeText(metaTags);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid min-w-0 gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="min-w-0 border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Source</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">Generate favicon files from text, emoji, or a local image.</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="w-fit whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>

          <div className="mt-5 grid min-w-0 grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">
            {(["text", "emoji", "image"] as Mode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setCopied(false);
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize ${
                  mode === item ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4">
            {mode === "text" && (
              <>
                <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="favicon-text">
                  Text
                  <input
                    id="favicon-text"
                    type="text"
                    maxLength={2}
                    value={text}
                    onChange={(event) => {
                      setText(normalizeText(event.target.value));
                      setCopied(false);
                    }}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl font-bold outline-none focus:border-slate-900"
                    placeholder="A"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="favicon-font">
                  Font
                  <select
                    id="favicon-font"
                    value={font}
                    onChange={(event) => setFont(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
                  >
                    {FONTS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="favicon-font-size">
                  Font size: {fontSize}%
                  <input
                    id="favicon-font-size"
                    type="range"
                    min={34}
                    max={96}
                    value={fontSize}
                    onChange={(event) => setFontSize(Number(event.target.value))}
                    className="w-full accent-slate-950"
                  />
                </label>

                <ColorInput id="favicon-text-color" label="Text color" value={textColor} onChange={setTextColor} />
              </>
            )}

            {mode === "emoji" && (
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="favicon-emoji">
                  Emoji
                </label>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {POPULAR_EMOJIS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setEmoji(item);
                        setCopied(false);
                      }}
                      className={`rounded-xl border p-2 text-2xl ${
                        emoji === item ? "border-slate-950 bg-slate-100" : "border-slate-200 hover:border-slate-400"
                      }`}
                      aria-label={`Use emoji ${item}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <input
                  id="favicon-emoji"
                  type="text"
                  value={emoji}
                  onChange={(event) => {
                    setEmoji(event.target.value);
                    setCopied(false);
                  }}
                  className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl outline-none focus:border-slate-900"
                  aria-label="Custom emoji"
                />
              </div>
            )}

            {mode === "image" && (
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="favicon-image">
                  Image file
                </label>
                <input
                  ref={fileInputRef}
                  id="favicon-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 flex min-h-28 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 hover:border-slate-500 hover:bg-white"
                >
                  <span className="font-semibold text-slate-900">{uploadedImage ? "Change image" : "Choose image"}</span>
                  <span className="mt-1 text-xs text-slate-500">PNG, JPG, WebP, SVG under 5 MB</span>
                </button>
                {uploadedLabel && <p className="mt-2 text-sm text-emerald-700">{uploadedLabel}</p>}
                {fileError && <p className="mt-2 text-sm text-red-600">{fileError}</p>}
              </div>
            )}

            <ColorInput id="favicon-bg-color" label="Background color" value={bgColor} onChange={setBgColor} allowTransparent />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sample presets</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <p className={`min-h-5 text-sm ${validationError ? "text-amber-700" : "text-slate-500"}`}>
              {validationError || "Local privacy: files and generated icons stay in your browser and are not uploaded."}
            </p>
          </div>
        </div>

        <div className="min-w-0 p-5 sm:p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Preview</h2>
                <p className="mt-1 text-sm text-slate-500">Check small browser sizes before downloading.</p>
              </div>
              <button
                type="button"
                onClick={handleDownloadIco}
                disabled={!hasPreviews}
                className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Download favicon.ico
              </button>
            </div>

            <div className="mt-5 flex min-h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white p-4">
              {previews[512] ? (
                <div className="checkerboard rounded-2xl p-3 shadow-inner">
                  <img src={previews[512]} alt="512 x 512 favicon preview" width={128} height={128} className="rounded-xl" />
                </div>
              ) : (
                <div className="text-center text-sm text-slate-500">
                  <p className="font-medium text-slate-700">Waiting for a valid source</p>
                  <p className="mt-1">Fix validation errors to generate previews.</p>
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {FAVICON_SIZES.map((size) => (
                <div key={size} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex h-14 items-center justify-center">
                    {previews[size] && (
                      <img
                        src={previews[size]}
                        alt={`${size} x ${size} favicon preview`}
                        width={Math.min(size, 48)}
                        height={Math.min(size, 48)}
                        style={{ imageRendering: size <= 32 ? "pixelated" : "auto" }}
                      />
                    )}
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-700">{SIZE_LABELS[size]}</p>
                  <button
                    type="button"
                    onClick={() => handleDownloadPng(size)}
                    disabled={!previews[size]}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                  >
                    PNG
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">HTML install tags</h2>
                <p className="mt-1 text-sm text-slate-500">Use these tags after placing the downloaded files in your public root.</p>
              </div>
              <button
                type="button"
                onClick={copyMetaTags}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {copied ? "Copied" : "Copy meta tags"}
              </button>
            </div>

            <label className="mt-4 grid gap-2 text-sm font-medium text-slate-700" htmlFor="favicon-base-url">
              Base URL
              <input
                id="favicon-base-url"
                type="url"
                placeholder="https://example.com"
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono text-sm outline-none focus:border-slate-900"
              />
            </label>

            <pre className="mt-4 max-h-52 min-w-0 overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-slate-100">
              <code>{metaTags}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function ColorInput({
  id,
  label,
  value,
  onChange,
  allowTransparent = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowTransparent?: boolean;
}) {
  const colorValue = value === "transparent" ? "#ffffff" : value;

  return (
    <div>
      <label className="text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          id={id}
          type="color"
          value={colorValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-12 shrink-0 rounded-lg border border-slate-300 bg-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 basis-40 rounded-xl border border-slate-300 px-3 py-2.5 font-mono text-sm outline-none focus:border-slate-900"
          aria-label={`${label} value`}
        />
        {allowTransparent && (
          <button
            type="button"
            onClick={() => onChange("transparent")}
            className="basis-full whitespace-nowrap rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:basis-auto"
          >
            Transparent
          </button>
        )}
      </div>
    </div>
  );
}
