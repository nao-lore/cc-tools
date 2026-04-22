"use client";

import { useState, useCallback, useMemo } from "react";

type SizeUnit = "fr" | "px" | "auto" | "minmax";

interface TrackSize {
  value: number;
  unit: SizeUnit;
}

interface CellConfig {
  colSpan: number;
  rowSpan: number;
  area: string;
}

interface Preset {
  name: string;
  cols: TrackSize[];
  rows: TrackSize[];
  rowGap: number;
  colGap: number;
  areas: string[][];
}

const PRESETS: Preset[] = [
  {
    name: "Holy Grail",
    cols: [
      { value: 200, unit: "px" },
      { value: 1, unit: "fr" },
      { value: 200, unit: "px" },
    ],
    rows: [
      { value: 60, unit: "px" },
      { value: 1, unit: "fr" },
      { value: 60, unit: "px" },
    ],
    rowGap: 0,
    colGap: 0,
    areas: [
      ["header", "header", "header"],
      ["nav", "main", "aside"],
      ["footer", "footer", "footer"],
    ],
  },
  {
    name: "Dashboard",
    cols: [
      { value: 250, unit: "px" },
      { value: 1, unit: "fr" },
      { value: 1, unit: "fr" },
    ],
    rows: [
      { value: 60, unit: "px" },
      { value: 1, unit: "fr" },
      { value: 1, unit: "fr" },
    ],
    rowGap: 12,
    colGap: 12,
    areas: [
      ["sidebar", "header", "header"],
      ["sidebar", "card1", "card2"],
      ["sidebar", "card3", "card4"],
    ],
  },
  {
    name: "Gallery",
    cols: [
      { value: 1, unit: "fr" },
      { value: 1, unit: "fr" },
      { value: 1, unit: "fr" },
      { value: 1, unit: "fr" },
    ],
    rows: [
      { value: 200, unit: "px" },
      { value: 200, unit: "px" },
      { value: 200, unit: "px" },
    ],
    rowGap: 8,
    colGap: 8,
    areas: [
      ["a", "a", "b", "c"],
      ["d", "e", "b", "c"],
      ["d", "e", "f", "f"],
    ],
  },
  {
    name: "Sidebar Layout",
    cols: [
      { value: 280, unit: "px" },
      { value: 1, unit: "fr" },
    ],
    rows: [
      { value: 60, unit: "px" },
      { value: 1, unit: "fr" },
    ],
    rowGap: 0,
    colGap: 0,
    areas: [
      ["header", "header"],
      ["sidebar", "content"],
    ],
  },
];

function trackToString(t: TrackSize): string {
  if (t.unit === "auto") return "auto";
  return `${t.value}${t.unit}`;
}

export default function GridGenerator() {
  const [cols, setCols] = useState<TrackSize[]>([
    { value: 1, unit: "fr" },
    { value: 1, unit: "fr" },
    { value: 1, unit: "fr" },
  ]);
  const [rows, setRows] = useState<TrackSize[]>([
    { value: 1, unit: "fr" },
    { value: 1, unit: "fr" },
    { value: 1, unit: "fr" },
  ]);
  const [rowGap, setRowGap] = useState(8);
  const [colGap, setColGap] = useState(8);
  const [areas, setAreas] = useState<string[][]>(() =>
    Array.from({ length: 3 }, (_, r) =>
      Array.from({ length: 3 }, (_, c) => `cell${r * 3 + c + 1}`)
    )
  );
  const [cells, setCells] = useState<Record<string, CellConfig>>({});
  const [editingArea, setEditingArea] = useState<{ r: number; c: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [useAreas, setUseAreas] = useState(false);

  const updateTrack = useCallback(
    (
      type: "cols" | "rows",
      index: number,
      field: "value" | "unit",
      val: string
    ) => {
      const setter = type === "cols" ? setCols : setRows;
      setter((prev) => {
        const next = [...prev];
        if (field === "value") {
          next[index] = { ...next[index], value: Math.max(0, Number(val) || 0) };
        } else {
          next[index] = { ...next[index], unit: val as SizeUnit };
        }
        return next;
      });
    },
    []
  );

  const addTrack = useCallback(
    (type: "cols" | "rows") => {
      if (type === "cols") {
        setCols((prev) => [...prev, { value: 1, unit: "fr" }]);
        setAreas((prev) =>
          prev.map((row, ri) => [
            ...row,
            `cell${ri * (row.length + 1) + row.length + 1}`,
          ])
        );
      } else {
        setRows((prev) => [...prev, { value: 1, unit: "fr" }]);
        setAreas((prev) => {
          const colCount = prev[0]?.length || cols.length;
          return [
            ...prev,
            Array.from(
              { length: colCount },
              (_, c) => `cell${prev.length * colCount + c + 1}`
            ),
          ];
        });
      }
    },
    [cols.length]
  );

  const removeTrack = useCallback(
    (type: "cols" | "rows", index: number) => {
      if (type === "cols") {
        if (cols.length <= 1) return;
        setCols((prev) => prev.filter((_, i) => i !== index));
        setAreas((prev) => prev.map((row) => row.filter((_, i) => i !== index)));
      } else {
        if (rows.length <= 1) return;
        setRows((prev) => prev.filter((_, i) => i !== index));
        setAreas((prev) => prev.filter((_, i) => i !== index));
      }
    },
    [cols.length, rows.length]
  );

  const startEditArea = useCallback((r: number, c: number) => {
    setEditingArea({ r, c });
    setEditValue("");
  }, []);

  const commitAreaEdit = useCallback(() => {
    if (editingArea && editValue.trim()) {
      setAreas((prev) => {
        const next = prev.map((row) => [...row]);
        next[editingArea.r][editingArea.c] = editValue.trim().replace(/\s+/g, "-");
        return next;
      });
    }
    setEditingArea(null);
    setEditValue("");
  }, [editingArea, editValue]);

  const applyPreset = useCallback((preset: Preset) => {
    setCols([...preset.cols]);
    setRows([...preset.rows]);
    setRowGap(preset.rowGap);
    setColGap(preset.colGap);
    setAreas(preset.areas.map((r) => [...r]));
    setCells({});
    setUseAreas(true);
  }, []);

  const generatedCSS = useMemo(() => {
    const lines: string[] = [];
    lines.push(".container {");
    lines.push("  display: grid;");
    lines.push(
      `  grid-template-columns: ${cols.map(trackToString).join(" ")};`
    );
    lines.push(
      `  grid-template-rows: ${rows.map(trackToString).join(" ")};`
    );

    if (rowGap === colGap) {
      if (rowGap > 0) lines.push(`  gap: ${rowGap}px;`);
    } else {
      lines.push(`  gap: ${rowGap}px ${colGap}px;`);
    }

    if (useAreas) {
      lines.push("  grid-template-areas:");
      areas.forEach((row, i) => {
        const quote = `    "${row.join(" ")}"`;
        lines.push(quote + (i < areas.length - 1 ? "" : ";"));
      });
    }

    lines.push("}");

    // Generate area-specific rules if using areas
    if (useAreas) {
      const uniqueAreas = new Set(areas.flat());
      uniqueAreas.forEach((area) => {
        lines.push("");
        lines.push(`.${area} {`);
        lines.push(`  grid-area: ${area};`);
        lines.push("}");
      });
    }

    // Generate cell-specific rules for spans
    Object.entries(cells).forEach(([key, cell]) => {
      if (cell.colSpan > 1 || cell.rowSpan > 1) {
        lines.push("");
        lines.push(`/* ${key} */`);
        if (cell.colSpan > 1) {
          lines.push(`  grid-column: span ${cell.colSpan};`);
        }
        if (cell.rowSpan > 1) {
          lines.push(`  grid-row: span ${cell.rowSpan};`);
        }
      }
    });

    return lines.join("\n");
  }, [cols, rows, rowGap, colGap, areas, useAreas, cells]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedCSS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [generatedCSS]);

  // Compute merged cells for visual preview
  const mergedCells = useMemo(() => {
    if (!useAreas) return null;
    const visited = new Set<string>();
    const result: {
      area: string;
      r: number;
      c: number;
      rowSpan: number;
      colSpan: number;
    }[] = [];

    for (let r = 0; r < areas.length; r++) {
      for (let c = 0; c < (areas[r]?.length || 0); c++) {
        const key = `${r}-${c}`;
        if (visited.has(key)) continue;
        const area = areas[r][c];
        // find extent
        let maxC = c;
        while (maxC + 1 < areas[r].length && areas[r][maxC + 1] === area) {
          maxC++;
        }
        let maxR = r;
        outer: while (maxR + 1 < areas.length) {
          for (let cc = c; cc <= maxC; cc++) {
            if (areas[maxR + 1]?.[cc] !== area) break outer;
          }
          maxR++;
        }
        for (let rr = r; rr <= maxR; rr++) {
          for (let cc = c; cc <= maxC; cc++) {
            visited.add(`${rr}-${cc}`);
          }
        }
        result.push({
          area,
          r,
          c,
          rowSpan: maxR - r + 1,
          colSpan: maxC - c + 1,
        });
      }
    }
    return result;
  }, [areas, useAreas]);

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-500 self-center mr-1">
          Presets:
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => applyPreset(p)}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors cursor-pointer"
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="space-y-5">
          {/* Columns */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Columns</h3>
              <button
                onClick={() => addTrack("cols")}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors cursor-pointer"
              >
                + Add Column
              </button>
            </div>
            <div className="space-y-1.5">
              {cols.map((col, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                  <input
                    type="number"
                    value={col.unit === "auto" ? "" : col.value}
                    disabled={col.unit === "auto"}
                    onChange={(e) =>
                      updateTrack("cols", i, "value", e.target.value)
                    }
                    className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <select
                    value={col.unit}
                    onChange={(e) =>
                      updateTrack("cols", i, "unit", e.target.value)
                    }
                    className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-400 bg-white cursor-pointer"
                  >
                    <option value="fr">fr</option>
                    <option value="px">px</option>
                    <option value="auto">auto</option>
                  </select>
                  {cols.length > 1 && (
                    <button
                      onClick={() => removeTrack("cols", i)}
                      className="text-gray-400 hover:text-red-500 text-sm transition-colors cursor-pointer"
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Rows</h3>
              <button
                onClick={() => addTrack("rows")}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors cursor-pointer"
              >
                + Add Row
              </button>
            </div>
            <div className="space-y-1.5">
              {rows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                  <input
                    type="number"
                    value={row.unit === "auto" ? "" : row.value}
                    disabled={row.unit === "auto"}
                    onChange={(e) =>
                      updateTrack("rows", i, "value", e.target.value)
                    }
                    className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <select
                    value={row.unit}
                    onChange={(e) =>
                      updateTrack("rows", i, "unit", e.target.value)
                    }
                    className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-400 bg-white cursor-pointer"
                  >
                    <option value="fr">fr</option>
                    <option value="px">px</option>
                    <option value="auto">auto</option>
                  </select>
                  {rows.length > 1 && (
                    <button
                      onClick={() => removeTrack("rows", i)}
                      className="text-gray-400 hover:text-red-500 text-sm transition-colors cursor-pointer"
                    >
                      x
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Gap */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Gap</h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                Row
                <input
                  type="number"
                  value={rowGap}
                  onChange={(e) => setRowGap(Math.max(0, Number(e.target.value) || 0))}
                  className="w-16 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-400"
                />
                <span className="text-xs text-gray-400">px</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                Column
                <input
                  type="number"
                  value={colGap}
                  onChange={(e) => setColGap(Math.max(0, Number(e.target.value) || 0))}
                  className="w-16 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-400"
                />
                <span className="text-xs text-gray-400">px</span>
              </label>
            </div>
          </div>

          {/* Template Areas toggle */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={useAreas}
                onChange={(e) => setUseAreas(e.target.checked)}
                className="rounded border-gray-300 cursor-pointer"
              />
              Use grid-template-areas
            </label>
          </div>
        </div>

        {/* Right: Visual Preview */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Preview
            {useAreas && (
              <span className="ml-2 text-xs font-normal text-gray-400">
                Click a cell to rename its area
              </span>
            )}
          </h3>
          <div
            className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[280px]"
            style={{
              display: "grid",
              gridTemplateColumns: cols.map(trackToString).join(" "),
              gridTemplateRows: rows.map(trackToString).join(" "),
              gap: `${rowGap}px ${colGap}px`,
              ...(useAreas
                ? {
                    gridTemplateAreas: areas
                      .map((row) => `"${row.join(" ")}"`)
                      .join(" "),
                  }
                : {}),
            }}
          >
            {useAreas && mergedCells
              ? mergedCells.map((cell) => (
                  <div
                    key={`${cell.r}-${cell.c}`}
                    style={{ gridArea: cell.area }}
                    onClick={() => startEditArea(cell.r, cell.c)}
                    className="bg-white border border-gray-300 rounded flex items-center justify-center text-xs text-gray-600 font-mono cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors min-h-[48px]"
                  >
                    {editingArea &&
                    editingArea.r === cell.r &&
                    editingArea.c === cell.c ? (
                      <input
                        autoFocus
                        value={editValue}
                        placeholder={cell.area}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={commitAreaEdit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitAreaEdit();
                          if (e.key === "Escape") {
                            setEditingArea(null);
                            setEditValue("");
                          }
                        }}
                        className="w-full text-center text-xs bg-transparent outline-none border-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      cell.area
                    )}
                  </div>
                ))
              : Array.from({ length: rows.length * cols.length }, (_, i) => {
                  const r = Math.floor(i / cols.length);
                  const c = i % cols.length;
                  const key = `${r}-${c}`;
                  const cellConfig = cells[key];
                  return (
                    <div
                      key={key}
                      style={{
                        ...(cellConfig?.colSpan && cellConfig.colSpan > 1
                          ? { gridColumn: `span ${cellConfig.colSpan}` }
                          : {}),
                        ...(cellConfig?.rowSpan && cellConfig.rowSpan > 1
                          ? { gridRow: `span ${cellConfig.rowSpan}` }
                          : {}),
                      }}
                      className="bg-white border border-gray-300 rounded flex items-center justify-center text-xs text-gray-500 font-mono min-h-[48px]"
                    >
                      {r + 1},{c + 1}
                    </div>
                  );
                })}
          </div>
        </div>
      </div>

      {/* CSS Output */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">
            Generated CSS
          </h3>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-900 hover:bg-gray-800 text-white rounded-md transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <svg
                  className="w-4 h-4 checkmark-animate"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy CSS
              </>
            )}
          </button>
        </div>
        <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono text-gray-800 overflow-x-auto whitespace-pre leading-relaxed">
          {generatedCSS}
        </pre>
      </div>
    </div>
  );
}
