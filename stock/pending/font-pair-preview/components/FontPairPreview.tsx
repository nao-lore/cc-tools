"use client";

import { useState, useCallback } from "react";

interface FontConfig {
  family: string;
  genericFamily: string;
  size: number;
  weight: string;
  lineHeight: number;
}

interface Preset {
  name: string;
  heading: Pick<FontConfig, "family" | "genericFamily" | "weight">;
  body: Pick<FontConfig, "family" | "genericFamily" | "weight">;
  description: string;
}

const FONTS: { name: string; genericFamily: string }[] = [
  { name: "Georgia", genericFamily: "serif" },
  { name: "Palatino Linotype", genericFamily: "serif" },
  { name: "Book Antiqua", genericFamily: "serif" },
  { name: "Times New Roman", genericFamily: "serif" },
  { name: "Garamond", genericFamily: "serif" },
  { name: "Baskerville", genericFamily: "serif" },
  { name: "Didot", genericFamily: "serif" },
  { name: "Bodoni MT", genericFamily: "serif" },
  { name: "Arial", genericFamily: "sans-serif" },
  { name: "Helvetica", genericFamily: "sans-serif" },
  { name: "Verdana", genericFamily: "sans-serif" },
  { name: "Trebuchet MS", genericFamily: "sans-serif" },
  { name: "Gill Sans", genericFamily: "sans-serif" },
  { name: "Optima", genericFamily: "sans-serif" },
  { name: "Segoe UI", genericFamily: "sans-serif" },
  { name: "Calibri", genericFamily: "sans-serif" },
  { name: "Futura", genericFamily: "sans-serif" },
  { name: "Century Gothic", genericFamily: "sans-serif" },
  { name: "Franklin Gothic Medium", genericFamily: "sans-serif" },
  { name: "Impact", genericFamily: "sans-serif" },
  { name: "Tahoma", genericFamily: "sans-serif" },
  { name: "Geneva", genericFamily: "sans-serif" },
  { name: "Lucida Grande", genericFamily: "sans-serif" },
  { name: "Candara", genericFamily: "sans-serif" },
  { name: "Rockwell", genericFamily: "serif" },
  { name: "Courier New", genericFamily: "monospace" },
  { name: "Courier", genericFamily: "monospace" },
  { name: "Lucida Console", genericFamily: "monospace" },
  { name: "Monaco", genericFamily: "monospace" },
  { name: "Consolas", genericFamily: "monospace" },
];

const WEIGHTS = ["300", "400", "500", "600", "700", "800", "900"];

const PRESETS: Preset[] = [
  {
    name: "Classic Editorial",
    heading: { family: "Didot", genericFamily: "serif", weight: "700" },
    body: { family: "Georgia", genericFamily: "serif", weight: "400" },
    description: "Elegant serif pairing used in luxury magazines",
  },
  {
    name: "Modern Clean",
    heading: { family: "Futura", genericFamily: "sans-serif", weight: "700" },
    body: { family: "Gill Sans", genericFamily: "sans-serif", weight: "400" },
    description: "Geometric sans-serif for modern brands",
  },
  {
    name: "Corporate",
    heading: { family: "Segoe UI", genericFamily: "sans-serif", weight: "700" },
    body: { family: "Calibri", genericFamily: "sans-serif", weight: "400" },
    description: "Professional pairing for business documents",
  },
  {
    name: "Contrast Mix",
    heading: { family: "Palatino Linotype", genericFamily: "serif", weight: "700" },
    body: { family: "Verdana", genericFamily: "sans-serif", weight: "400" },
    description: "Serif heading with sans-serif body for strong contrast",
  },
  {
    name: "Tech Mono",
    heading: { family: "Consolas", genericFamily: "monospace", weight: "700" },
    body: { family: "Trebuchet MS", genericFamily: "sans-serif", weight: "400" },
    description: "Monospace heading for developer tools and docs",
  },
  {
    name: "Humanist",
    heading: { family: "Gill Sans", genericFamily: "sans-serif", weight: "800" },
    body: { family: "Georgia", genericFamily: "serif", weight: "400" },
    description: "Humanist sans paired with classic serif body",
  },
  {
    name: "Bold Impact",
    heading: { family: "Impact", genericFamily: "sans-serif", weight: "900" },
    body: { family: "Arial", genericFamily: "sans-serif", weight: "400" },
    description: "High-impact headings for posters and banners",
  },
  {
    name: "Elegant Script",
    heading: { family: "Book Antiqua", genericFamily: "serif", weight: "700" },
    body: { family: "Optima", genericFamily: "sans-serif", weight: "400" },
    description: "Old-style serif with elegant humanist body",
  },
  {
    name: "Newspaper",
    heading: { family: "Rockwell", genericFamily: "serif", weight: "700" },
    body: { family: "Times New Roman", genericFamily: "serif", weight: "400" },
    description: "Traditional slab serif pairing for editorial layouts",
  },
  {
    name: "Developer Docs",
    heading: { family: "Franklin Gothic Medium", genericFamily: "sans-serif", weight: "700" },
    body: { family: "Lucida Console", genericFamily: "monospace", weight: "400" },
    description: "Strong heading with monospace for technical documentation",
  },
];

const SAMPLE_PARAGRAPH =
  "Typography is the art and technique of arranging type to make written language legible, readable, and appealing. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing. Good typography creates harmony between headings and body text, guiding the reader's eye through the content naturally and effortlessly.";

function fontStack(family: string, generic: string): string {
  return `"${family}", ${generic}`;
}

function buildCSS(heading: FontConfig, body: FontConfig): string {
  return `.heading {
  font-family: ${fontStack(heading.family, heading.genericFamily)};
  font-size: ${heading.size}px;
  font-weight: ${heading.weight};
  line-height: ${heading.lineHeight};
}

.body {
  font-family: ${fontStack(body.family, body.genericFamily)};
  font-size: ${body.size}px;
  font-weight: ${body.weight};
  line-height: ${body.lineHeight};
}`;
}

export default function FontPairPreview() {
  const [heading, setHeading] = useState<FontConfig>({
    family: "Georgia",
    genericFamily: "serif",
    size: 36,
    weight: "700",
    lineHeight: 1.2,
  });
  const [body, setBody] = useState<FontConfig>({
    family: "Verdana",
    genericFamily: "sans-serif",
    size: 16,
    weight: "400",
    lineHeight: 1.6,
  });
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const cssOutput = buildCSS(heading, body);

  const handleHeadingFont = useCallback((name: string) => {
    const font = FONTS.find((f) => f.name === name);
    if (!font) return;
    setHeading((h) => ({ ...h, family: font.name, genericFamily: font.genericFamily }));
    setActivePreset(null);
  }, []);

  const handleBodyFont = useCallback((name: string) => {
    const font = FONTS.find((f) => f.name === name);
    if (!font) return;
    setBody((b) => ({ ...b, family: font.name, genericFamily: font.genericFamily }));
    setActivePreset(null);
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setHeading((h) => ({
      ...h,
      family: preset.heading.family,
      genericFamily: preset.heading.genericFamily,
      weight: preset.heading.weight,
    }));
    setBody((b) => ({
      ...b,
      family: preset.body.family,
      genericFamily: preset.body.genericFamily,
      weight: preset.body.weight,
    }));
    setActivePreset(preset.name);
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(cssOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cssOutput]);

  return (
    <div className="space-y-8">
      {/* Presets */}
      <section>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
          Popular Pairings
        </h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              title={preset.description}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activePreset === preset.name
                  ? "bg-accent text-white border-accent"
                  : "border-border text-foreground hover:border-accent hover:text-accent bg-surface"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-6">
          {/* Heading Controls */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Heading Font
            </h2>

            <div>
              <label className="block text-xs text-muted mb-1">Font Family</label>
              <select
                value={heading.family}
                onChange={(e) => handleHeadingFont(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                {FONTS.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name} ({f.genericFamily})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">
                Font Size: <span className="text-foreground font-medium">{heading.size}px</span>
              </label>
              <input
                type="range"
                min={16}
                max={72}
                step={1}
                value={heading.size}
                onChange={(e) => {
                  setHeading((h) => ({ ...h, size: Number(e.target.value) }));
                  setActivePreset(null);
                }}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">Font Weight</label>
              <select
                value={heading.weight}
                onChange={(e) => {
                  setHeading((h) => ({ ...h, weight: e.target.value }));
                  setActivePreset(null);
                }}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                {WEIGHTS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">
                Line Height: <span className="text-foreground font-medium">{heading.lineHeight.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min={1.0}
                max={2.0}
                step={0.1}
                value={heading.lineHeight}
                onChange={(e) => {
                  setHeading((h) => ({ ...h, lineHeight: Number(e.target.value) }));
                  setActivePreset(null);
                }}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>
          </div>

          {/* Body Controls */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Body Font
            </h2>

            <div>
              <label className="block text-xs text-muted mb-1">Font Family</label>
              <select
                value={body.family}
                onChange={(e) => handleBodyFont(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                {FONTS.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name} ({f.genericFamily})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">
                Font Size: <span className="text-foreground font-medium">{body.size}px</span>
              </label>
              <input
                type="range"
                min={12}
                max={24}
                step={1}
                value={body.size}
                onChange={(e) => {
                  setBody((b) => ({ ...b, size: Number(e.target.value) }));
                  setActivePreset(null);
                }}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">Font Weight</label>
              <select
                value={body.weight}
                onChange={(e) => {
                  setBody((b) => ({ ...b, weight: e.target.value }));
                  setActivePreset(null);
                }}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                {WEIGHTS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">
                Line Height: <span className="text-foreground font-medium">{body.lineHeight.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min={1.0}
                max={2.5}
                step={0.1}
                value={body.lineHeight}
                onChange={(e) => {
                  setBody((b) => ({ ...b, lineHeight: Number(e.target.value) }));
                  setActivePreset(null);
                }}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>
          </div>
        </div>

        {/* Preview + CSS Output */}
        <div className="space-y-6">
          {/* Live Preview */}
          <div className="bg-white border border-border rounded-xl p-6 min-h-[280px]">
            <h3
              style={{
                fontFamily: fontStack(heading.family, heading.genericFamily),
                fontSize: `${heading.size}px`,
                fontWeight: heading.weight,
                lineHeight: heading.lineHeight,
              }}
              className="text-gray-900 mb-4"
            >
              The Quick Brown Fox Jumps Over the Lazy Dog
            </h3>
            <p
              style={{
                fontFamily: fontStack(body.family, body.genericFamily),
                fontSize: `${body.size}px`,
                fontWeight: body.weight,
                lineHeight: body.lineHeight,
              }}
              className="text-gray-700"
            >
              {SAMPLE_PARAGRAPH}
            </p>
          </div>

          {/* Font Labels */}
          <div className="flex gap-3">
            <div className="flex-1 bg-surface border border-border rounded-lg px-4 py-3">
              <p className="text-xs text-muted mb-0.5">Heading</p>
              <p className="text-sm font-medium text-foreground truncate">{heading.family}</p>
              <p className="text-xs text-muted">{heading.weight} / {heading.size}px</p>
            </div>
            <div className="flex-1 bg-surface border border-border rounded-lg px-4 py-3">
              <p className="text-xs text-muted mb-0.5">Body</p>
              <p className="text-sm font-medium text-foreground truncate">{body.family}</p>
              <p className="text-xs text-muted">{body.weight} / {body.size}px</p>
            </div>
          </div>

          {/* CSS Output */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">CSS Output</span>
              <button
                onClick={handleCopy}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                  copied
                    ? "bg-green-100 text-green-700"
                    : "bg-accent text-white hover:bg-accent/90"
                }`}
              >
                {copied ? "Copied!" : "Copy CSS"}
              </button>
            </div>
            <pre className="text-xs p-4 text-foreground font-mono overflow-x-auto whitespace-pre-wrap">
              {cssOutput}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
