"use client";

import { useState, useCallback, useEffect } from "react";

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function simplifyRatio(w: number, h: number): [number, number] {
  if (w <= 0 || h <= 0) return [0, 0];
  const d = gcd(w, h);
  return [w / d, h / d];
}

const PRESETS = [
  { label: "16:9", w: 16, h: 9 },
  { label: "4:3", w: 4, h: 3 },
  { label: "21:9", w: 21, h: 9 },
  { label: "1:1", w: 1, h: 1 },
  { label: "9:16", w: 9, h: 16 },
  { label: "3:2", w: 3, h: 2 },
];

const RESOLUTIONS = [
  { name: "SD (480p)", w: 640, h: 480, ratio: "4:3" },
  { name: "HD (720p)", w: 1280, h: 720, ratio: "16:9" },
  { name: "Full HD (1080p)", w: 1920, h: 1080, ratio: "16:9" },
  { name: "QHD (1440p)", w: 2560, h: 1440, ratio: "16:9" },
  { name: "4K UHD", w: 3840, h: 2160, ratio: "16:9" },
  { name: "5K", w: 5120, h: 2880, ratio: "16:9" },
  { name: "8K UHD", w: 7680, h: 4320, ratio: "16:9" },
  { name: "Ultrawide FHD", w: 2560, h: 1080, ratio: "21:9" },
  { name: "Ultrawide QHD", w: 3440, h: 1440, ratio: "21:9" },
  { name: "Instagram Post", w: 1080, h: 1080, ratio: "1:1" },
  { name: "Instagram Story", w: 1080, h: 1920, ratio: "9:16" },
  { name: "iPad (Standard)", w: 2048, h: 1536, ratio: "4:3" },
];

export default function AspectRatioCalculator() {
  const [width, setWidth] = useState<string>("1920");
  const [height, setHeight] = useState<string>("1080");
  const [locked, setLocked] = useState(false);
  const [lockedRatio, setLockedRatio] = useState<[number, number]>([16, 9]);
  const [lastChanged, setLastChanged] = useState<"w" | "h">("w");
  const [copied, setCopied] = useState<string | null>(null);

  const w = parseInt(width) || 0;
  const h = parseInt(height) || 0;
  const [ratioW, ratioH] = simplifyRatio(w, h);

  const ratioText =
    ratioW > 0 && ratioH > 0 ? `${ratioW}:${ratioH}` : "—";
  const decimalRatio = h > 0 ? (w / h).toFixed(4) : "—";

  const handleLock = useCallback(() => {
    if (!locked && w > 0 && h > 0) {
      setLockedRatio(simplifyRatio(w, h));
    }
    setLocked((prev) => !prev);
  }, [locked, w, h]);

  const handleWidthChange = useCallback(
    (val: string) => {
      setWidth(val);
      setLastChanged("w");
      if (locked) {
        const num = parseInt(val) || 0;
        if (num > 0 && lockedRatio[0] > 0) {
          setHeight(
            String(Math.round((num * lockedRatio[1]) / lockedRatio[0]))
          );
        }
      }
    },
    [locked, lockedRatio]
  );

  const handleHeightChange = useCallback(
    (val: string) => {
      setHeight(val);
      setLastChanged("h");
      if (locked) {
        const num = parseInt(val) || 0;
        if (num > 0 && lockedRatio[1] > 0) {
          setWidth(
            String(Math.round((num * lockedRatio[0]) / lockedRatio[1]))
          );
        }
      }
    },
    [locked, lockedRatio]
  );

  const applyPreset = useCallback(
    (pw: number, ph: number) => {
      setLockedRatio([pw, ph]);
      if (locked) {
        // keep current width, recalculate height
        const num = parseInt(width) || 1920;
        setWidth(String(num));
        setHeight(String(Math.round((num * ph) / pw)));
      } else {
        // set a sensible default resolution for the preset
        const base = 1920;
        setWidth(String(base));
        setHeight(String(Math.round((base * ph) / pw)));
      }
    },
    [locked, width]
  );

  const applyResolution = useCallback(
    (rw: number, rh: number) => {
      setWidth(String(rw));
      setHeight(String(rh));
      if (locked) {
        setLockedRatio(simplifyRatio(rw, rh));
      }
    },
    [locked]
  );

  const copyToClipboard = useCallback(
    (text: string, label: string) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(label);
        setTimeout(() => setCopied(null), 1500);
      });
    },
    []
  );

  // Preview box dimensions (max 240px on longest side)
  const maxPreview = 240;
  let previewW = maxPreview;
  let previewH = maxPreview;
  if (w > 0 && h > 0) {
    if (w >= h) {
      previewW = maxPreview;
      previewH = Math.round((maxPreview * h) / w);
    } else {
      previewH = maxPreview;
      previewW = Math.round((maxPreview * w) / h);
    }
  }

  return (
    <div className="space-y-8">
      {/* Main Calculator */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Inputs */}
          <div className="space-y-6">
            {/* Dimension inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Dimensions
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    Width
                  </label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    min="1"
                    placeholder="1920"
                  />
                </div>
                <button
                  onClick={handleLock}
                  title={locked ? "Unlock ratio" : "Lock ratio"}
                  className={`mt-5 p-2 rounded-lg border transition-colors ${
                    locked
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-400 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {locked ? (
                      <>
                        <rect
                          width="18"
                          height="11"
                          x="3"
                          y="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </>
                    ) : (
                      <>
                        <rect
                          width="18"
                          height="11"
                          x="3"
                          y="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                      </>
                    )}
                  </svg>
                </button>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">
                    Height
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    min="1"
                    placeholder="1080"
                  />
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Aspect Ratio</span>
                <button
                  onClick={() => copyToClipboard(ratioText, "ratio")}
                  className="text-xs text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                  {copied === "ratio" ? (
                    <span className="text-green-600">Copied!</span>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          width="14"
                          height="14"
                          x="8"
                          y="8"
                          rx="2"
                          ry="2"
                        />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-3xl font-bold text-gray-900">{ratioText}</p>
              <p className="text-sm text-gray-500 mt-1">
                Decimal: {decimalRatio}
              </p>
            </div>

            {/* Copy dimensions */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  copyToClipboard(`${w}x${h}`, "dims")
                }
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                {copied === "dims" ? (
                  <span className="text-green-600">Copied!</span>
                ) : (
                  `Copy ${w}x${h}`
                )}
              </button>
              <button
                onClick={() =>
                  copyToClipboard(`${w} x ${h} (${ratioText})`, "full")
                }
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                {copied === "full" ? (
                  <span className="text-green-600">Copied!</span>
                ) : (
                  "Copy with ratio"
                )}
              </button>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Common Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p.w, p.h)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      ratioW === p.w && ratioH === p.h
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex flex-col items-center justify-center">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Visual Preview
            </label>
            <div className="flex items-center justify-center w-full min-h-[280px]">
              <div
                className="border-2 border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center transition-all duration-300"
                style={{
                  width: `${previewW}px`,
                  height: `${previewH}px`,
                }}
              >
                <span className="text-sm text-gray-400 font-mono">
                  {ratioText}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {w > 0 && h > 0 ? `${w} x ${h} px` : "Enter dimensions"}
            </p>
          </div>
        </div>
      </div>

      {/* Resize Calculator */}
      <ResizeCalculator />

      {/* Resolution Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Common Resolutions
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-700">
                  Name
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">
                  Resolution
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">
                  Ratio
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">
                  Pixels
                </th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {RESOLUTIONS.map((r) => (
                <tr
                  key={r.name}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-2 px-3 text-gray-900">{r.name}</td>
                  <td className="py-2 px-3 text-gray-600 font-mono">
                    {r.w} x {r.h}
                  </td>
                  <td className="py-2 px-3 text-gray-600">{r.ratio}</td>
                  <td className="py-2 px-3 text-gray-600">
                    {(r.w * r.h).toLocaleString()}
                  </td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => applyResolution(r.w, r.h)}
                      className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Use
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ResizeCalculator() {
  const [ratio, setRatio] = useState("16:9");
  const [dimension, setDimension] = useState<"w" | "h">("w");
  const [value, setValue] = useState("1920");
  const [copied, setCopied] = useState(false);

  const parseRatio = (
    r: string
  ): [number, number] => {
    const parts = r.split(":").map((s) => parseInt(s.trim()));
    if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
      return [parts[0], parts[1]];
    }
    return [0, 0];
  };

  const [rw, rh] = parseRatio(ratio);
  const num = parseInt(value) || 0;

  let resultW = 0;
  let resultH = 0;
  if (rw > 0 && rh > 0 && num > 0) {
    if (dimension === "w") {
      resultW = num;
      resultH = Math.round((num * rh) / rw);
    } else {
      resultH = num;
      resultW = Math.round((num * rw) / rh);
    }
  }

  const resultText =
    resultW > 0 && resultH > 0 ? `${resultW} x ${resultH}` : "—";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Resize Calculator
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Given a ratio and one dimension, calculate the other.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Ratio</label>
          <input
            type="text"
            value={ratio}
            onChange={(e) => setRatio(e.target.value)}
            className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="16:9"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Known</label>
          <select
            value={dimension}
            onChange={(e) => setDimension(e.target.value as "w" | "h")}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
          >
            <option value="w">Width</option>
            <option value="h">Height</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Value (px)</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            min="1"
            placeholder="1920"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">=</span>
          <span className="text-base font-semibold text-gray-900 font-mono">
            {resultText}
          </span>
          {resultW > 0 && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${resultW}x${resultH}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors ml-1"
            >
              {copied ? (
                <span className="text-green-600">Copied!</span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
