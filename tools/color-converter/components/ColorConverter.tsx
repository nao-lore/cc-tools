"use client";

import { useState, useCallback } from "react";
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToCmyk,
  checkWCAG,
  clamp,
  parseHexInput,
  type RGB,
  type HSL,
  type CMYK,
  type WCAGResult,
} from "../lib/color-utils";
import { closestColorName } from "../lib/color-names";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={copy}
      className="ml-2 px-3 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors shrink-0"
      title={`Copy ${label}`}
      type="button"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function PassBadge({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        pass
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      }`}
    >
      {label}: {pass ? "Pass" : "Fail"}
    </span>
  );
}

export default function ColorConverter() {
  const [rgb, setRgbState] = useState<RGB>({ r: 59, g: 130, b: 246 });
  const [hexInput, setHexInput] = useState("#3b82f6");
  const [hsl, setHslState] = useState<HSL>(() => rgbToHsl({ r: 59, g: 130, b: 246 }));
  const [cmyk, setCmykState] = useState<CMYK>(() => rgbToCmyk({ r: 59, g: 130, b: 246 }));
  const [bgHex, setBgHex] = useState("#ffffff");
  const [bgRgb, setBgRgb] = useState<RGB>({ r: 255, g: 255, b: 255 });
  const [wcag, setWcag] = useState<WCAGResult>(() =>
    checkWCAG({ r: 59, g: 130, b: 246 }, { r: 255, g: 255, b: 255 })
  );
  const [history, setHistory] = useState<string[]>(["#3b82f6"]);

  const addToHistory = useCallback(
    (hex: string) => {
      setHistory((prev) => {
        const filtered = prev.filter((h) => h !== hex);
        return [hex, ...filtered].slice(0, 10);
      });
    },
    []
  );

  const updateFromRgb = useCallback(
    (newRgb: RGB) => {
      const r = clamp(newRgb.r, 0, 255);
      const g = clamp(newRgb.g, 0, 255);
      const b = clamp(newRgb.b, 0, 255);
      const clamped = { r, g, b };
      setRgbState(clamped);
      const hex = rgbToHex(clamped);
      setHexInput(hex);
      setHslState(rgbToHsl(clamped));
      setCmykState(rgbToCmyk(clamped));
      setWcag(checkWCAG(clamped, bgRgb));
      addToHistory(hex);
    },
    [bgRgb, addToHistory]
  );

  const updateFromHex = useCallback(
    (hex: string) => {
      setHexInput(hex);
      const parsed = hexToRgb(hex);
      if (parsed) {
        setRgbState(parsed);
        setHslState(rgbToHsl(parsed));
        setCmykState(rgbToCmyk(parsed));
        setWcag(checkWCAG(parsed, bgRgb));
        addToHistory(rgbToHex(parsed));
      }
    },
    [bgRgb, addToHistory]
  );

  const updateFromHsl = useCallback(
    (newHsl: HSL) => {
      const h = clamp(newHsl.h, 0, 360);
      const s = clamp(newHsl.s, 0, 100);
      const l = clamp(newHsl.l, 0, 100);
      const clamped = { h, s, l };
      setHslState(clamped);
      const newRgb = hslToRgb(clamped);
      setRgbState(newRgb);
      const hex = rgbToHex(newRgb);
      setHexInput(hex);
      setCmykState(rgbToCmyk(newRgb));
      setWcag(checkWCAG(newRgb, bgRgb));
      addToHistory(hex);
    },
    [bgRgb, addToHistory]
  );

  const updateBgColor = useCallback(
    (hex: string) => {
      setBgHex(hex);
      const parsed = hexToRgb(hex);
      if (parsed) {
        setBgRgb(parsed);
        setWcag(checkWCAG(rgb, parsed));
      }
    },
    [rgb]
  );

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFromHex(e.target.value);
  };

  const colorName = closestColorName(rgb);
  const hexStr = rgbToHex(rgb);
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  const cmykStr = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Color Preview + Picker */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
        <div
          className="h-48 sm:h-64 w-full relative transition-colors duration-200"
          style={{ backgroundColor: hexStr }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <label className="cursor-pointer">
              <input
                type="color"
                value={hexStr}
                onChange={handlePickerChange}
                className="absolute opacity-0 w-0 h-0"
              />
              <div className="bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg text-center">
                <p className="text-2xl font-bold tracking-wide" style={{ color: hexStr }}>
                  {hexStr.toUpperCase()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {colorName} &middot; Click to pick a color
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Format Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* HEX */}
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">HEX</h3>
            <CopyButton text={hexStr} label="HEX" />
          </div>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => updateFromHex(parseHexInput(e.target.value))}
            onBlur={() => setHexInput(hexStr)}
            className={inputClass}
            placeholder="#000000"
            maxLength={7}
          />
        </div>

        {/* RGB */}
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">RGB</h3>
            <CopyButton text={rgbStr} label="RGB" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={labelClass}>R</label>
              <input
                type="number"
                min={0}
                max={255}
                value={rgb.r}
                onChange={(e) => updateFromRgb({ ...rgb, r: Number(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>G</label>
              <input
                type="number"
                min={0}
                max={255}
                value={rgb.g}
                onChange={(e) => updateFromRgb({ ...rgb, g: Number(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>B</label>
              <input
                type="number"
                min={0}
                max={255}
                value={rgb.b}
                onChange={(e) => updateFromRgb({ ...rgb, b: Number(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* HSL */}
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">HSL</h3>
            <CopyButton text={hslStr} label="HSL" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={labelClass}>H</label>
              <input
                type="number"
                min={0}
                max={360}
                value={hsl.h}
                onChange={(e) => updateFromHsl({ ...hsl, h: Number(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>S%</label>
              <input
                type="number"
                min={0}
                max={100}
                value={hsl.s}
                onChange={(e) => updateFromHsl({ ...hsl, s: Number(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>L%</label>
              <input
                type="number"
                min={0}
                max={100}
                value={hsl.l}
                onChange={(e) => updateFromHsl({ ...hsl, l: Number(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* CMYK */}
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">CMYK</h3>
            <CopyButton text={cmykStr} label="CMYK" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(["c", "m", "y", "k"] as const).map((ch) => (
              <div key={ch}>
                <label className={labelClass}>{ch.toUpperCase()}%</label>
                <input
                  type="text"
                  value={cmyk[ch]}
                  readOnly
                  className={`${inputClass} bg-gray-50 dark:bg-gray-700 cursor-default`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contrast Checker */}
      <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-sm mb-3">Contrast Ratio Checker (WCAG)</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className={labelClass}>Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgHex}
                onChange={(e) => updateBgColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={bgHex}
                onChange={(e) => updateBgColor(parseHexInput(e.target.value))}
                className={inputClass}
                maxLength={7}
              />
            </div>
          </div>
          <div className="flex-1">
            <label className={labelClass}>Preview</label>
            <div
              className="rounded-lg p-4 text-center font-medium border border-gray-200 dark:border-gray-600"
              style={{ backgroundColor: bgHex, color: hexStr }}
            >
              Sample Text ({wcag.ratio}:1)
            </div>
          </div>
          <div className="flex-1">
            <label className={labelClass}>Results</label>
            <div className="flex flex-wrap gap-2">
              <PassBadge pass={wcag.aa} label="AA" />
              <PassBadge pass={wcag.aaLarge} label="AA Large" />
              <PassBadge pass={wcag.aaa} label="AAA" />
              <PassBadge pass={wcag.aaaLarge} label="AAA Large" />
            </div>
          </div>
        </div>
      </div>

      {/* Color History */}
      {history.length > 0 && (
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-sm mb-3">Recent Colors</h3>
          <div className="flex flex-wrap gap-2">
            {history.map((hex, i) => (
              <button
                key={`${hex}-${i}`}
                onClick={() => updateFromHex(hex)}
                className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 transition-colors shadow-sm"
                style={{ backgroundColor: hex }}
                title={hex}
                type="button"
              />
            ))}
          </div>
        </div>
      )}

      {/* AdSense Placeholder */}
      <div className="w-full h-24 rounded-xl bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs text-gray-400">
        Advertisement
      </div>
    </div>
  );
}
