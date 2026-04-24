"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CmdType = "M" | "m" | "L" | "l" | "H" | "h" | "V" | "v" | "C" | "c" | "Q" | "q" | "A" | "a" | "Z" | "z";

interface PathCommand {
  id: string;
  type: CmdType;
  args: number[];
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

function tokenize(d: string): Array<{ type: CmdType; args: number[] }> {
  const results: Array<{ type: CmdType; args: number[] }> = [];
  const re = /([MmLlHhVvCcQqAaZz])|([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/g;
  let match: RegExpExecArray | null;
  let currentCmd: CmdType | null = null;
  let currentArgs: number[] = [];

  const flush = () => {
    if (currentCmd) {
      results.push({ type: currentCmd, args: currentArgs });
    }
    currentArgs = [];
  };

  while ((match = re.exec(d)) !== null) {
    if (match[1]) {
      flush();
      currentCmd = match[1] as CmdType;
      currentArgs = [];
    } else if (match[2] && currentCmd) {
      currentArgs.push(parseFloat(match[2]));
    }
  }
  flush();

  // Split implicit repeated commands
  const expanded: Array<{ type: CmdType; args: number[] }> = [];
  for (const cmd of results) {
    const argCount = argsPerCommand(cmd.type);
    if (argCount === 0 || cmd.args.length <= argCount) {
      expanded.push(cmd);
    } else {
      for (let i = 0; i < cmd.args.length; i += argCount) {
        const slice = cmd.args.slice(i, i + argCount);
        if (slice.length === argCount) {
          // After first M, implicit repeats are L/l
          let t = cmd.type;
          if (i > 0 && cmd.type === "M") t = "L";
          if (i > 0 && cmd.type === "m") t = "l";
          expanded.push({ type: t, args: slice });
        }
      }
    }
  }
  return expanded;
}

function argsPerCommand(type: CmdType): number {
  switch (type.toUpperCase()) {
    case "M": return 2;
    case "L": return 2;
    case "H": return 1;
    case "V": return 1;
    case "C": return 6;
    case "Q": return 4;
    case "A": return 7;
    case "Z": return 0;
    default: return 0;
  }
}

function parsePath(d: string): PathCommand[] {
  try {
    return tokenize(d).map((cmd, i) => ({
      id: `cmd-${i}-${Date.now()}`,
      type: cmd.type,
      args: cmd.args,
    }));
  } catch {
    return [];
  }
}

function serializePath(cmds: PathCommand[]): string {
  return cmds
    .map((cmd) => {
      if (cmd.args.length === 0) return cmd.type;
      const nums = cmd.args.map((n) => {
        const rounded = Math.round(n * 100) / 100;
        return rounded % 1 === 0 ? rounded.toString() : rounded.toString();
      });
      return `${cmd.type} ${nums.join(" ")}`;
    })
    .join(" ");
}

// ---------------------------------------------------------------------------
// Control point resolution (absolute coords for rendering handles)
// ---------------------------------------------------------------------------

interface ResolvedPoint {
  x: number;
  y: number;
}

function resolveControlPoints(cmds: PathCommand[]): Array<ResolvedPoint[]> {
  const resolved: Array<ResolvedPoint[]> = [];
  let cx = 0;
  let cy = 0;

  for (const cmd of cmds) {
    const pts: ResolvedPoint[] = [];
    const t = cmd.type;
    const upper = t.toUpperCase() as CmdType;
    const rel = t === t.toLowerCase() && t !== "Z" && t !== "z";

    const ax = rel ? cx : 0;
    const ay = rel ? cy : 0;

    switch (upper) {
      case "M":
      case "L":
        pts.push({ x: ax + cmd.args[0], y: ay + cmd.args[1] });
        cx = ax + cmd.args[0];
        cy = ay + cmd.args[1];
        break;
      case "H":
        pts.push({ x: ax + cmd.args[0], y: cy });
        cx = ax + cmd.args[0];
        break;
      case "V":
        pts.push({ x: cx, y: ay + cmd.args[0] });
        cy = ay + cmd.args[0];
        break;
      case "C":
        pts.push({ x: ax + cmd.args[0], y: ay + cmd.args[1] });
        pts.push({ x: ax + cmd.args[2], y: ay + cmd.args[3] });
        pts.push({ x: ax + cmd.args[4], y: ay + cmd.args[5] });
        cx = ax + cmd.args[4];
        cy = ay + cmd.args[5];
        break;
      case "Q":
        pts.push({ x: ax + cmd.args[0], y: ay + cmd.args[1] });
        pts.push({ x: ax + cmd.args[2], y: ay + cmd.args[3] });
        cx = ax + cmd.args[2];
        cy = ay + cmd.args[3];
        break;
      case "A":
        pts.push({ x: ax + cmd.args[5], y: ay + cmd.args[6] });
        cx = ax + cmd.args[5];
        cy = ay + cmd.args[6];
        break;
      case "Z":
        break;
    }
    resolved.push(pts);
  }
  return resolved;
}

// ---------------------------------------------------------------------------
// Sample presets
// ---------------------------------------------------------------------------

const PRESETS: Record<string, string> = {
  Heart:
    "M 12 21.593 C 6.585 15.794 1.5 11.249 1.5 6.5 A 4.5 4.5 0 0 1 12 4.606 A 4.5 4.5 0 0 1 22.5 6.5 C 22.5 11.249 17.415 15.794 12 21.593 Z",
  Arrow:
    "M 2 12 L 14 12 L 14 8 L 22 12 L 14 16 L 14 12",
  Star:
    "M 12 2 L 15.09 8.26 L 22 9.27 L 17 14.14 L 18.18 21.02 L 12 17.77 L 5.82 21.02 L 7 14.14 L 2 9.27 L 8.91 8.26 Z",
  Wave:
    "M 0 20 C 10 0 20 40 30 20 C 40 0 50 40 60 20",
};

// ---------------------------------------------------------------------------
// Arg labels per command
// ---------------------------------------------------------------------------

function argLabels(type: CmdType): string[] {
  switch (type.toUpperCase()) {
    case "M": return ["x", "y"];
    case "L": return ["x", "y"];
    case "H": return ["x"];
    case "V": return ["y"];
    case "C": return ["x1", "y1", "x2", "y2", "x", "y"];
    case "Q": return ["x1", "y1", "x", "y"];
    case "A": return ["rx", "ry", "rot", "large-arc", "sweep", "x", "y"];
    case "Z": return [];
    default: return [];
  }
}

// ---------------------------------------------------------------------------
// Canvas dimensions & viewBox
// ---------------------------------------------------------------------------

const CANVAS_W = 500;
const CANVAS_H = 380;
const VIEWBOX = "0 0 500 380";
const GRID_SIZE = 20;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SvgPathEditor() {
  const [dString, setDString] = useState(PRESETS.Heart);
  const [commands, setCommands] = useState<PathCommand[]>(() => parsePath(PRESETS.Heart));
  const [copied, setCopied] = useState(false);
  const [parseError, setParseError] = useState("");
  const [selectedCmd, setSelectedCmd] = useState<string | null>(null);

  // Drag state
  const draggingRef = useRef<{ cmdId: string; ptIdx: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Sync d-string → commands
  const handleDStringChange = useCallback((value: string) => {
    setDString(value);
    try {
      const cmds = parsePath(value);
      if (cmds.length === 0 && value.trim().length > 0) {
        setParseError("Could not parse path. Check syntax.");
      } else {
        setParseError("");
        setCommands(cmds);
      }
    } catch {
      setParseError("Invalid path data.");
    }
  }, []);

  // Sync commands → d-string
  const updateCommandArg = useCallback(
    (cmdId: string, argIdx: number, value: number) => {
      setCommands((prev) => {
        const next = prev.map((cmd) => {
          if (cmd.id !== cmdId) return cmd;
          const newArgs = [...cmd.args];
          newArgs[argIdx] = value;
          return { ...cmd, args: newArgs };
        });
        setDString(serializePath(next));
        setParseError("");
        return next;
      });
    },
    []
  );

  // Preset loader
  const loadPreset = useCallback((name: string) => {
    const d = PRESETS[name];
    const cmds = parsePath(d);
    setDString(d);
    setCommands(cmds);
    setParseError("");
    setSelectedCmd(null);
  }, []);

  // Copy
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(dString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [dString]);

  // Resolved control points for canvas
  const resolvedPoints = useMemo(() => resolveControlPoints(commands), [commands]);

  // ---------------------------------------------------------------------------
  // Drag handlers
  // ---------------------------------------------------------------------------

  const getSvgCoords = useCallback((e: MouseEvent | React.MouseEvent): { x: number; y: number } | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX * 10) / 10,
      y: Math.round((e.clientY - rect.top) * scaleY * 10) / 10,
    };
  }, []);

  const handlePointMouseDown = useCallback(
    (e: React.MouseEvent, cmdId: string, ptIdx: number) => {
      e.preventDefault();
      draggingRef.current = { cmdId, ptIdx };
      setSelectedCmd(cmdId);
    },
    []
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const coords = getSvgCoords(e);
      if (!coords) return;
      const { cmdId, ptIdx } = draggingRef.current;

      setCommands((prev) => {
        const next = prev.map((cmd) => {
          if (cmd.id !== cmdId) return cmd;
          const upper = cmd.type.toUpperCase() as CmdType;
          const rel = cmd.type === cmd.type.toLowerCase() && cmd.type !== "Z" && cmd.type !== "z";

          // Compute current cursor offset for relative
          let curX = 0;
          let curY = 0;
          if (rel) {
            // Walk up to find previous endpoint
            let cx = 0; let cy = 0;
            for (const c of prev) {
              if (c.id === cmd.id) break;
              const u = c.type.toUpperCase() as CmdType;
              const r = c.type === c.type.toLowerCase() && c.type !== "Z";
              const bx = r ? cx : 0;
              const by = r ? cy : 0;
              switch (u) {
                case "M": case "L": cx = bx + c.args[0]; cy = by + c.args[1]; break;
                case "H": cx = bx + c.args[0]; break;
                case "V": cy = by + c.args[0]; break;
                case "C": cx = bx + c.args[4]; cy = by + c.args[5]; break;
                case "Q": cx = bx + c.args[2]; cy = by + c.args[3]; break;
                case "A": cx = bx + c.args[5]; cy = by + c.args[6]; break;
              }
            }
            curX = cx; curY = cy;
          }

          const newArgs = [...cmd.args];
          const absX = coords.x - curX;
          const absY = coords.y - curY;
          const fx = rel ? absX : coords.x;
          const fy = rel ? absY : coords.y;

          switch (upper) {
            case "M": case "L":
              newArgs[0] = Math.round(fx * 10) / 10;
              newArgs[1] = Math.round(fy * 10) / 10;
              break;
            case "H":
              newArgs[0] = Math.round(fx * 10) / 10;
              break;
            case "V":
              newArgs[0] = Math.round(fy * 10) / 10;
              break;
            case "C":
              if (ptIdx === 0) { newArgs[0] = Math.round(fx * 10) / 10; newArgs[1] = Math.round(fy * 10) / 10; }
              else if (ptIdx === 1) { newArgs[2] = Math.round(fx * 10) / 10; newArgs[3] = Math.round(fy * 10) / 10; }
              else { newArgs[4] = Math.round(fx * 10) / 10; newArgs[5] = Math.round(fy * 10) / 10; }
              break;
            case "Q":
              if (ptIdx === 0) { newArgs[0] = Math.round(fx * 10) / 10; newArgs[1] = Math.round(fy * 10) / 10; }
              else { newArgs[2] = Math.round(fx * 10) / 10; newArgs[3] = Math.round(fy * 10) / 10; }
              break;
            case "A":
              newArgs[5] = Math.round(fx * 10) / 10;
              newArgs[6] = Math.round(fy * 10) / 10;
              break;
          }
          return { ...cmd, args: newArgs };
        });
        setDString(serializePath(next));
        return next;
      });
    };

    const onMouseUp = () => {
      draggingRef.current = null;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [getSvgCoords]);

  // ---------------------------------------------------------------------------
  // Grid lines
  // ---------------------------------------------------------------------------

  const gridLines = useMemo(() => {
    const lines: React.ReactNode[] = [];
    for (let x = 0; x <= CANVAS_W; x += GRID_SIZE) {
      lines.push(
        <line key={`v${x}`} x1={x} y1={0} x2={x} y2={CANVAS_H} stroke="#e5e7eb" strokeWidth={0.5} />
      );
    }
    for (let y = 0; y <= CANVAS_H; y += GRID_SIZE) {
      lines.push(
        <line key={`h${y}`} x1={0} y1={y} x2={CANVAS_W} y2={y} stroke="#e5e7eb" strokeWidth={0.5} />
      );
    }
    // Axis
    lines.push(
      <line key="ax" x1={0} y1={0} x2={0} y2={CANVAS_H} stroke="#d1d5db" strokeWidth={1} />,
      <line key="ay" x1={0} y1={0} x2={CANVAS_W} y2={0} stroke="#d1d5db" strokeWidth={1} />
    );
    return lines;
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Presets:</span>
        {Object.keys(PRESETS).map((name) => (
          <button
            key={name}
            onClick={() => loadPreset(name)}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {name}
          </button>
        ))}
      </div>

      {/* d-string input */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">
            Path <code className="font-mono text-xs bg-gray-100 px-1 rounded">d</code> attribute
          </label>
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            {copied ? "Copied!" : "Copy d-string"}
          </button>
        </div>
        <textarea
          value={dString}
          onChange={(e) => handleDStringChange(e.target.value)}
          spellCheck={false}
          rows={3}
          className="w-full p-3 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
          placeholder="Paste SVG path d-string here…"
        />
        {parseError && (
          <p className="mt-1 text-sm text-red-600">{parseError}</p>
        )}
      </div>

      {/* Main layout: canvas + command panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SVG Canvas */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Canvas{" "}
            <span className="text-xs font-normal text-gray-400">(drag points to move)</span>
          </p>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <svg
              ref={svgRef}
              viewBox={VIEWBOX}
              width="100%"
              className="block select-none"
              style={{ cursor: draggingRef.current ? "grabbing" : "default" }}
            >
              {/* Grid */}
              {gridLines}

              {/* Path */}
              {commands.length > 0 && (
                <path
                  d={dString}
                  fill="rgba(99,102,241,0.15)"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}

              {/* Control handles */}
              {commands.map((cmd, cmdIdx) => {
                const pts = resolvedPoints[cmdIdx] ?? [];
                const isSelected = cmd.id === selectedCmd;

                // Draw connecting lines for C/Q control handles
                const upper = cmd.type.toUpperCase() as CmdType;

                return (
                  <g key={cmd.id}>
                    {/* Bezier handle lines */}
                    {upper === "C" && pts.length === 3 && (() => {
                      // Previous end point
                      let prevX = 0; let prevY = 0;
                      if (cmdIdx > 0) {
                        const pp = resolvedPoints[cmdIdx - 1];
                        if (pp && pp.length > 0) {
                          const last = pp[pp.length - 1];
                          prevX = last.x; prevY = last.y;
                        }
                      }
                      return (
                        <>
                          <line x1={prevX} y1={prevY} x2={pts[0].x} y2={pts[0].y} stroke="#a5b4fc" strokeWidth={1} strokeDasharray="3 2" />
                          <line x1={pts[2].x} y1={pts[2].y} x2={pts[1].x} y2={pts[1].y} stroke="#a5b4fc" strokeWidth={1} strokeDasharray="3 2" />
                        </>
                      );
                    })()}
                    {upper === "Q" && pts.length === 2 && (() => {
                      let prevX = 0; let prevY = 0;
                      if (cmdIdx > 0) {
                        const pp = resolvedPoints[cmdIdx - 1];
                        if (pp && pp.length > 0) {
                          const last = pp[pp.length - 1];
                          prevX = last.x; prevY = last.y;
                        }
                      }
                      return (
                        <>
                          <line x1={prevX} y1={prevY} x2={pts[0].x} y2={pts[0].y} stroke="#a5b4fc" strokeWidth={1} strokeDasharray="3 2" />
                          <line x1={pts[1].x} y1={pts[1].y} x2={pts[0].x} y2={pts[0].y} stroke="#a5b4fc" strokeWidth={1} strokeDasharray="3 2" />
                        </>
                      );
                    })()}

                    {/* Control points */}
                    {pts.map((pt, ptIdx) => {
                      const isEndPt =
                        (upper === "C" && ptIdx === 2) ||
                        (upper === "Q" && ptIdx === 1) ||
                        upper === "M" ||
                        upper === "L" ||
                        upper === "H" ||
                        upper === "V" ||
                        upper === "A";
                      const isCtrl = !isEndPt;

                      return (
                        <g key={ptIdx}>
                          {isCtrl ? (
                            <rect
                              x={pt.x - 4}
                              y={pt.y - 4}
                              width={8}
                              height={8}
                              fill={isSelected ? "#6366f1" : "#fff"}
                              stroke={isSelected ? "#4f46e5" : "#6366f1"}
                              strokeWidth={1.5}
                              style={{ cursor: "grab" }}
                              onMouseDown={(e) => handlePointMouseDown(e, cmd.id, ptIdx)}
                            />
                          ) : (
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={5}
                              fill={isSelected ? "#6366f1" : "#fff"}
                              stroke={isSelected ? "#4f46e5" : "#6366f1"}
                              strokeWidth={2}
                              style={{ cursor: "grab" }}
                              onMouseDown={(e) => handlePointMouseDown(e, cmd.id, ptIdx)}
                            />
                          )}
                          {/* Coord label on hover via title */}
                          <title>{`(${Math.round(pt.x * 10) / 10}, ${Math.round(pt.y * 10) / 10})`}</title>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Command panel */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Commands{" "}
            <span className="text-xs font-normal text-gray-400">({commands.length} total)</span>
          </p>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="overflow-y-auto" style={{ maxHeight: "380px" }}>
              {commands.length === 0 && (
                <p className="text-sm text-gray-400 p-4 text-center">No commands. Paste a path above.</p>
              )}
              {commands.map((cmd, cmdIdx) => {
                const labels = argLabels(cmd.type);
                const isSelected = cmd.id === selectedCmd;

                return (
                  <div
                    key={cmd.id}
                    onClick={() => setSelectedCmd(cmd.id)}
                    className={`px-3 py-2 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                      isSelected ? "bg-indigo-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`font-mono text-sm font-bold w-6 text-center ${
                          isSelected ? "text-indigo-600" : "text-gray-800"
                        }`}
                      >
                        {cmd.type}
                      </span>
                      <span className="text-xs text-gray-400">#{cmdIdx + 1}</span>
                    </div>

                    {labels.length > 0 && (
                      <div className="flex flex-wrap gap-2 ml-8">
                        {labels.map((label, argIdx) => (
                          <div key={argIdx} className="flex flex-col items-start">
                            <span className="text-xs text-gray-400 mb-0.5">{label}</span>
                            <input
                              type="number"
                              value={cmd.args[argIdx] ?? 0}
                              step={label === "large-arc" || label === "sweep" ? 1 : 0.1}
                              min={label === "large-arc" || label === "sweep" ? 0 : undefined}
                              max={label === "large-arc" || label === "sweep" ? 1 : undefined}
                              onChange={(e) =>
                                updateCommandArg(cmd.id, argIdx, parseFloat(e.target.value) || 0)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="w-20 px-1.5 py-0.5 font-mono text-xs bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {cmd.type.toUpperCase() === "Z" && (
                      <span className="ml-8 text-xs text-gray-400 italic">Close path</span>
                    )}
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this SVG Path Editor tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Edit and visualize SVG path commands. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this SVG Path Editor tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Edit and visualize SVG path commands. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "SVG Path Editor",
  "description": "Edit and visualize SVG path commands",
  "url": "https://tools.loresync.dev/svg-path-editor",
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
