"use client";

import { useState, useMemo, useCallback } from "react";

// --- Types ---

interface Tile {
  row: number;
  col: number;
  x: number;
  y: number;
  className: string;
  css: string;
}

// --- Helpers ---

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function buildTiles(
  sheetW: number,
  sheetH: number,
  tileW: number,
  tileH: number,
  gap: number
): Tile[] {
  if (tileW <= 0 || tileH <= 0 || sheetW <= 0 || sheetH <= 0) return [];
  const cols = Math.floor((sheetW + gap) / (tileW + gap));
  const rows = Math.floor((sheetH + gap) / (tileH + gap));
  if (cols <= 0 || rows <= 0) return [];

  const tiles: Tile[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * (tileW + gap);
      const y = r * (tileH + gap);
      tiles.push({
        row: r,
        col: c,
        x,
        y,
        className: `sprite-${r}-${c}`,
        css: `.sprite-${r}-${c} {\n  width: ${tileW}px;\n  height: ${tileH}px;\n  background-position: -${x}px -${y}px;\n}`,
      });
    }
  }
  return tiles;
}

// --- Number input ---

interface NumInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  unit?: string;
}

function NumInput({ label, value, min = 0, max = 9999, onChange, unit = "px" }: NumInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed)) {
      onChange(clamp(parsed, min, max));
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted">{label}</label>
      <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={handleChange}
          className="flex-1 bg-transparent text-foreground text-sm font-mono px-3 py-2 focus:outline-none w-20"
        />
        <span className="text-xs text-muted px-2 border-l border-border bg-surface/60 py-2 select-none">
          {unit}
        </span>
      </div>
    </div>
  );
}

// --- Palette of tile colors for grid preview ---

const TILE_COLORS = [
  "#7c5cfc", "#ff6b9d", "#36d399", "#fbbd23", "#3abff8",
  "#f87272", "#a3e635", "#818cf8", "#fb923c", "#34d399",
];

function tileColor(row: number, col: number, cols: number): string {
  return TILE_COLORS[(row * cols + col) % TILE_COLORS.length];
}

// --- Main component ---

const PREVIEW_MAX = 320; // max px for the grid preview

export default function SpriteCalculator() {
  const [sheetW, setSheetW] = useState(256);
  const [sheetH, setSheetH] = useState(256);
  const [tileW, setTileW] = useState(64);
  const [tileH, setTileH] = useState(64);
  const [gap, setGap] = useState(0);
  const [copied, setCopied] = useState(false);
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);

  const tiles = useMemo(
    () => buildTiles(sheetW, sheetH, tileW, tileH, gap),
    [sheetW, sheetH, tileW, tileH, gap]
  );

  const cols = useMemo(() => {
    if (tileW <= 0 || sheetW <= 0) return 0;
    return Math.floor((sheetW + gap) / (tileW + gap));
  }, [sheetW, tileW, gap]);

  const allCss = useMemo(() => {
    if (tiles.length === 0) return "";
    const base = `.sprite {\n  background-image: url('sprite-sheet.png');\n  display: inline-block;\n}\n\n`;
    return base + tiles.map((t) => t.css).join("\n\n");
  }, [tiles]);

  const copyAll = useCallback(() => {
    if (!allCss) return;
    navigator.clipboard.writeText(allCss).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [allCss]);

  // Scale factor for visual grid preview
  const scale = useMemo(() => {
    if (sheetW <= 0 || sheetH <= 0) return 1;
    return Math.min(1, PREVIEW_MAX / Math.max(sheetW, sheetH));
  }, [sheetW, sheetH]);

  const previewW = Math.round(sheetW * scale);
  const previewH = Math.round(sheetH * scale);

  const isValid = tiles.length > 0;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Sprite Sheet Settings</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <NumInput label="Sheet Width" value={sheetW} min={1} onChange={setSheetW} />
          <NumInput label="Sheet Height" value={sheetH} min={1} onChange={setSheetH} />
          <NumInput label="Tile Width" value={tileW} min={1} onChange={setTileW} />
          <NumInput label="Tile Height" value={tileH} min={1} onChange={setTileH} />
          <NumInput label="Gap (optional)" value={gap} min={0} onChange={setGap} />
        </div>

        {isValid && (
          <p className="mt-4 text-xs text-muted">
            {tiles.length} tile{tiles.length !== 1 ? "s" : ""} detected —{" "}
            {cols} column{cols !== 1 ? "s" : ""} ×{" "}
            {Math.ceil(tiles.length / cols)} row{Math.ceil(tiles.length / cols) !== 1 ? "s" : ""}
          </p>
        )}
        {!isValid && (
          <p className="mt-4 text-xs text-red-500">
            Tile dimensions must be smaller than the sheet dimensions.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual grid preview */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-medium text-foreground">Grid Preview</h3>
          </div>
          <div className="p-4 flex items-center justify-center min-h-48">
            {isValid ? (
              <div
                className="relative border border-border rounded"
                style={{ width: previewW, height: previewH }}
              >
                {tiles.map((tile) => {
                  const isHovered = hoveredTile === tile.className;
                  return (
                    <div
                      key={tile.className}
                      onMouseEnter={() => setHoveredTile(tile.className)}
                      onMouseLeave={() => setHoveredTile(null)}
                      title={`${tile.className}: -${tile.x}px -${tile.y}px`}
                      className="absolute border border-white/30 cursor-pointer transition-opacity"
                      style={{
                        left: Math.round(tile.x * scale),
                        top: Math.round(tile.y * scale),
                        width: Math.round(tileW * scale),
                        height: Math.round(tileH * scale),
                        backgroundColor: tileColor(tile.row, tile.col, cols),
                        opacity: isHovered ? 1 : 0.72,
                        outline: isHovered ? "2px solid white" : "none",
                        zIndex: isHovered ? 10 : 1,
                      }}
                    >
                      {Math.round(tileW * scale) > 28 && Math.round(tileH * scale) > 18 && (
                        <span
                          className="absolute inset-0 flex items-center justify-center text-white font-mono select-none"
                          style={{ fontSize: Math.max(8, Math.round(10 * scale)) }}
                        >
                          {tile.row},{tile.col}
                        </span>
                      )}
                    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this CSS Sprite Position Calculator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Calculate background-position values for CSS sprites. Just enter your values and get instant results.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">Is this tool free to use?</summary>
      <p className="mt-2 text-sm text-gray-600">Yes, completely free. No sign-up or account required.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">How accurate are the results?</summary>
      <p className="mt-2 text-sm text-gray-600">Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this CSS Sprite Position Calculator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Calculate background-position values for CSS sprites. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted text-sm">Enter valid dimensions to see the grid.</p>
            )}
          </div>
          {hoveredTile && (
            <div className="px-4 py-2 border-t border-border bg-surface/60">
              <p className="text-xs font-mono text-accent">
                {tiles.find((t) => t.className === hoveredTile)?.css.split("\n").slice(0, 3).join("  ")}
              </p>
            </div>
          )}
        </div>

        {/* Position table */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Position Table</h3>
            {isValid && (
              <span className="text-xs text-muted">{tiles.length} tiles</span>
            )}
          </div>
          <div className="overflow-auto max-h-72">
            {isValid ? (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-surface z-10">
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted">Row</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted">Col</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted">background-position</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted">Class</th>
                  </tr>
                </thead>
                <tbody>
                  {tiles.map((tile, i) => (
                    <tr
                      key={tile.className}
                      className={`${i < tiles.length - 1 ? "border-b border-border" : ""} ${
                        hoveredTile === tile.className ? "bg-accent/10" : ""
                      }`}
                      onMouseEnter={() => setHoveredTile(tile.className)}
                      onMouseLeave={() => setHoveredTile(null)}
                    >
                      <td className="px-4 py-2 text-foreground font-mono text-xs">{tile.row}</td>
                      <td className="px-4 py-2 text-foreground font-mono text-xs">{tile.col}</td>
                      <td className="px-4 py-2 font-mono text-xs text-accent">
                        -{tile.x}px -{tile.y}px
                      </td>
                      <td className="px-4 py-2 font-mono text-xs text-muted">.{tile.className}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted text-sm">
                No tiles to display.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Output */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">CSS Output</h3>
          <button
            onClick={copyAll}
            disabled={!isValid}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-white hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy All CSS
              </>
            )}
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-72">
          {isValid ? (
            <pre className="text-xs font-mono text-foreground whitespace-pre leading-relaxed">
              {allCss}
            </pre>
          ) : (
            <p className="text-muted text-sm">Enter valid dimensions to generate CSS.</p>
          )}
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CSS Sprite Position Calculator",
  "description": "Calculate background-position values for CSS sprites",
  "url": "https://tools.loresync.dev/css-sprite-generator",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
