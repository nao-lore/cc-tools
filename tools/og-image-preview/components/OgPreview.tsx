"use client";

import { useState, useCallback } from "react";

interface OgData {
  title: string;
  description: string;
  imageUrl: string;
  siteName: string;
  url: string;
}

function CharIndicator({
  length,
  min,
  max,
  label,
}: {
  length: number;
  min: number;
  max: number;
  label: string;
}) {
  const color =
    length === 0
      ? "text-gray-400"
      : length < min
        ? "text-yellow-600"
        : length <= max
          ? "text-green-600"
          : "text-red-600";
  return (
    <span className={`text-xs ${color}`}>
      {length}/{max} {label}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border border-gray-300 transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

/* ── Preview Cards ── */

function FacebookPreview({
  data,
  dark,
}: {
  data: OgData;
  dark: boolean;
}) {
  const bg = dark ? "bg-[#242526]" : "bg-white";
  const border = dark ? "border-[#3a3b3c]" : "border-gray-200";
  const textPrimary = dark ? "text-[#e4e6eb]" : "text-gray-900";
  const textSecondary = dark ? "text-[#b0b3b8]" : "text-gray-500";
  const infoBg = dark ? "bg-[#3a3b3c]" : "bg-gray-50";

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 mb-2">
        Facebook / LinkedIn
      </h3>
      <div
        className={`${bg} border ${border} rounded-lg overflow-hidden max-w-[500px] shadow-sm`}
      >
        {data.imageUrl ? (
          <div className="w-full aspect-[1.91/1] bg-gray-100 relative overflow-hidden">
            <img
              src={data.imageUrl}
              alt="OG preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="w-full aspect-[1.91/1] bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            1200 x 630 image preview
          </div>
        )}
        <div className={`px-3 py-2.5 ${infoBg} border-t ${border}`}>
          <p
            className={`text-xs uppercase tracking-wide ${textSecondary} mb-0.5`}
          >
            {data.siteName || data.url || "example.com"}
          </p>
          <p className={`font-semibold text-sm ${textPrimary} line-clamp-2`}>
            {data.title || "Page Title"}
          </p>
          <p className={`text-xs ${textSecondary} line-clamp-1 mt-0.5`}>
            {data.description || "Page description will appear here."}
          </p>
        </div>
      </div>
    </div>
  );
}

function TwitterLargePreview({
  data,
  dark,
}: {
  data: OgData;
  dark: boolean;
}) {
  const bg = dark ? "bg-[#15202b]" : "bg-white";
  const border = dark ? "border-[#38444d]" : "border-gray-200";
  const textPrimary = dark ? "text-[#d9d9d9]" : "text-gray-900";
  const textSecondary = dark ? "text-[#8899a6]" : "text-gray-500";

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 mb-2">
        Twitter — summary_large_image
      </h3>
      <div
        className={`${bg} border ${border} rounded-2xl overflow-hidden max-w-[500px] shadow-sm`}
      >
        {data.imageUrl ? (
          <div className="w-full aspect-[2/1] bg-gray-100 relative overflow-hidden">
            <img
              src={data.imageUrl}
              alt="Twitter large preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="w-full aspect-[2/1] bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            Large image preview
          </div>
        )}
        <div className="px-3 py-2.5">
          <p className={`text-sm font-semibold ${textPrimary} line-clamp-1`}>
            {data.title || "Page Title"}
          </p>
          <p className={`text-xs ${textSecondary} line-clamp-2 mt-0.5`}>
            {data.description || "Page description will appear here."}
          </p>
          <p className={`text-xs ${textSecondary} mt-1 flex items-center gap-1`}>
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101"
              />
            </svg>
            {data.url || "example.com"}
          </p>
        </div>
      </div>
    </div>
  );
}

function TwitterSummaryPreview({
  data,
  dark,
}: {
  data: OgData;
  dark: boolean;
}) {
  const bg = dark ? "bg-[#15202b]" : "bg-white";
  const border = dark ? "border-[#38444d]" : "border-gray-200";
  const textPrimary = dark ? "text-[#d9d9d9]" : "text-gray-900";
  const textSecondary = dark ? "text-[#8899a6]" : "text-gray-500";

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 mb-2">
        Twitter — summary (small)
      </h3>
      <div
        className={`${bg} border ${border} rounded-2xl overflow-hidden max-w-[500px] shadow-sm flex`}
      >
        {data.imageUrl ? (
          <div className="w-[130px] min-h-[130px] bg-gray-100 flex-shrink-0 overflow-hidden">
            <img
              src={data.imageUrl}
              alt="Twitter summary preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="w-[130px] min-h-[130px] bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs text-center p-2">
            144x144
          </div>
        )}
        <div className="px-3 py-2.5 flex flex-col justify-center min-w-0">
          <p className={`text-xs ${textSecondary}`}>
            {data.url || "example.com"}
          </p>
          <p
            className={`text-sm font-semibold ${textPrimary} line-clamp-1 mt-0.5`}
          >
            {data.title || "Page Title"}
          </p>
          <p className={`text-xs ${textSecondary} line-clamp-2 mt-0.5`}>
            {data.description || "Page description will appear here."}
          </p>
        </div>
      </div>
    </div>
  );
}

function DiscordPreview({
  data,
  dark,
}: {
  data: OgData;
  dark: boolean;
}) {
  const bg = dark ? "bg-[#2f3136]" : "bg-[#f2f3f5]";
  const textPrimary = dark ? "text-[#00aff4]" : "text-[#0068e0]";
  const textDesc = dark ? "text-[#dcddde]" : "text-gray-700";
  const textSite = dark ? "text-[#b9bbbe]" : "text-gray-500";

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 mb-2">Discord</h3>
      <div
        className={`${bg} rounded max-w-[432px] border-l-4 border-l-[#5865f2] overflow-hidden`}
      >
        <div className="p-3">
          <p className={`text-xs font-semibold ${textSite} mb-1`}>
            {data.siteName || "Site Name"}
          </p>
          <p className={`text-sm font-semibold ${textPrimary} hover:underline line-clamp-1`}>
            {data.title || "Page Title"}
          </p>
          <p className={`text-sm ${textDesc} mt-1 line-clamp-3`}>
            {data.description || "Page description will appear here."}
          </p>
        </div>
        {data.imageUrl ? (
          <div className="px-3 pb-3">
            <div className="rounded overflow-hidden max-w-[400px]">
              <img
                src={data.imageUrl}
                alt="Discord preview"
                className="max-w-full max-h-[300px] object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </div>
        ) : (
          <div className="mx-3 mb-3 rounded bg-gray-200 aspect-[1.91/1] max-w-[400px] flex items-center justify-center text-gray-400 text-sm">
            Image preview
          </div>
        )}
      </div>
    </div>
  );
}

function SlackPreview({
  data,
  dark,
}: {
  data: OgData;
  dark: boolean;
}) {
  const bg = dark ? "bg-[#1a1d21]" : "bg-white";
  const textPrimary = dark ? "text-[#1d9bd1]" : "text-[#1264a3]";
  const textDesc = dark ? "text-[#d1d2d3]" : "text-gray-700";
  const textSite = dark ? "text-[#ababad]" : "text-gray-500";
  const borderColor = dark ? "border-l-[#ababad]" : "border-l-gray-300";

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 mb-2">Slack</h3>
      <div
        className={`${bg} rounded max-w-[500px] border-l-4 ${borderColor} pl-3 py-2`}
      >
        <p className={`text-xs font-semibold ${textSite} mb-0.5`}>
          {data.siteName || "Site Name"}
        </p>
        <p className={`text-sm font-bold ${textPrimary} hover:underline line-clamp-1`}>
          {data.title || "Page Title"}
        </p>
        <p className={`text-sm ${textDesc} mt-0.5 line-clamp-2`}>
          {data.description || "Page description will appear here."}
        </p>
        {data.imageUrl ? (
          <div className="mt-2 rounded overflow-hidden inline-block">
            <img
              src={data.imageUrl}
              alt="Slack preview"
              className="max-w-[360px] max-h-[200px] object-contain rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="mt-2 rounded bg-gray-100 w-[360px] h-[180px] flex items-center justify-center text-gray-400 text-sm">
            Image preview
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Meta Tags Output ── */

function MetaTagsOutput({ data }: { data: OgData }) {
  const tags = `<!-- Open Graph -->
<meta property="og:title" content="${data.title}" />
<meta property="og:description" content="${data.description}" />
<meta property="og:image" content="${data.imageUrl}" />
<meta property="og:url" content="${data.url}" />
<meta property="og:site_name" content="${data.siteName}" />
<meta property="og:type" content="website" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${data.title}" />
<meta name="twitter:description" content="${data.description}" />
<meta name="twitter:image" content="${data.imageUrl}" />`;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-500">
          Generated Meta Tags
        </h3>
        <CopyButton text={tags} />
      </div>
      <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs font-mono text-gray-800 overflow-x-auto whitespace-pre-wrap">
        {tags}
      </pre>
    </div>
  );
}

/* ── Image Dimension Check ── */

function ImageDimensionCheck({ imageUrl }: { imageUrl: string }) {
  const [dims, setDims] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const [error, setError] = useState(false);
  const [checked, setChecked] = useState(false);

  const checkDimensions = useCallback(() => {
    if (!imageUrl) return;
    setError(false);
    setDims(null);
    setChecked(true);
    const img = new Image();
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => setError(true);
    img.src = imageUrl;
  }, [imageUrl]);

  if (!imageUrl) return null;

  const isGood = dims && dims.w >= 1200 && dims.h >= 630;
  const isOk = dims && dims.w >= 600 && dims.h >= 315;

  return (
    <div className="flex items-center gap-2 mt-1">
      <button
        onClick={checkDimensions}
        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border border-gray-300 transition-colors"
      >
        Check dimensions
      </button>
      {checked && error && (
        <span className="text-xs text-red-600">Could not load image</span>
      )}
      {dims && (
        <span
          className={`text-xs ${isGood ? "text-green-600" : isOk ? "text-yellow-600" : "text-red-600"}`}
        >
          {dims.w} x {dims.h}px
          {isGood
            ? " — Perfect"
            : isOk
              ? " — OK, but 1200x630 recommended"
              : " — Too small (min 600x315)"}
        </span>
      )}
    </div>
  );
}

/* ── Main Component ── */

export default function OgPreview() {
  const [data, setData] = useState<OgData>({
    title: "",
    description: "",
    imageUrl: "",
    siteName: "",
    url: "",
  });
  const [dark, setDark] = useState(false);

  const update = (field: keyof OgData, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-8">
      {/* Input Fields */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Enter OG Tag Values
          </h2>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <span>Dark preview</span>
            <button
              onClick={() => setDark(!dark)}
              className={`relative w-10 h-5 rounded-full transition-colors ${dark ? "bg-gray-700" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${dark ? "translate-x-5" : ""}`}
              />
            </button>
          </label>
        </div>

        {/* og:title */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">
              og:title
            </label>
            <CharIndicator
              length={data.title.length}
              min={30}
              max={90}
              label="chars (60-90 recommended)"
            />
          </div>
          <input
            type="text"
            value={data.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="My Awesome Page"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* og:description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">
              og:description
            </label>
            <CharIndicator
              length={data.description.length}
              min={70}
              max={200}
              label="chars (150-200 recommended)"
            />
          </div>
          <textarea
            value={data.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="A brief description of your page content."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* og:image */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">
              og:image
            </label>
            <span className="text-xs text-gray-400">
              1200 x 630px recommended
            </span>
          </div>
          <input
            type="url"
            value={data.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
            placeholder="https://example.com/og-image.png"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <ImageDimensionCheck imageUrl={data.imageUrl} />
        </div>

        {/* og:site_name + og:url */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              og:site_name
            </label>
            <input
              type="text"
              value={data.siteName}
              onChange={(e) => update("siteName", e.target.value)}
              placeholder="My Website"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              og:url
            </label>
            <input
              type="url"
              value={data.url}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://example.com/page"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Preview Cards */}
      <div className="space-y-8">
        <FacebookPreview data={data} dark={dark} />
        <TwitterLargePreview data={data} dark={dark} />
        <TwitterSummaryPreview data={data} dark={dark} />
        <DiscordPreview data={data} dark={dark} />
        <SlackPreview data={data} dark={dark} />
      </div>

      {/* Generated Meta Tags */}
      <MetaTagsOutput data={data} />
    </div>
  );
}
