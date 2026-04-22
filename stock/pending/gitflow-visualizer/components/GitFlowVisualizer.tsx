"use client";

import { useState, useMemo } from "react";

const SAMPLE_LOG = `* a1b2c3d (HEAD -> main) Merge branch 'feature/auth'
|\\
| * e4f5g6h (feature/auth) Add OAuth2 callback handler
| * i7j8k9l Add login page component
| * m1n2o3p (origin/feature/auth) Init auth module
|/
* q4r5s6t Merge branch 'feature/dashboard'
|\\
| * u7v8w9x (feature/dashboard) Add chart widgets
| * y1z2a3b Dashboard layout skeleton
|/
* c4d5e6f Fix typo in README
* g7h8i9j (origin/main, origin/HEAD) Release v1.2.0
* k1l2m3n Merge branch 'hotfix/crash'
|\\
| * o4p5q6r (hotfix/crash) Fix null pointer on startup
|/
* s7t8u9v Update dependencies
* w1x2y3z Initial commit`;

// Branch lane colors (Tailwind-safe hex values for SVG)
const LANE_COLORS = [
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f97316", // orange
  "#ec4899", // pink
  "#84cc16", // lime
  "#14b8a6", // teal
];

interface ParsedCommit {
  raw: string;
  graphPart: string;
  hash: string;
  refs: string[];
  message: string;
  lane: number;
  connectors: Connector[];
}

interface Connector {
  type: "vertical" | "merge-start" | "merge-end" | "branch-start" | "passthrough";
  lane: number;
}

function parseGitLog(input: string): ParsedCommit[] {
  const lines = input.split("\n").filter((l) => l.trim().length > 0);
  const commits: ParsedCommit[] = [];

  // Track active lanes: lane index -> branch identity (last hash seen)
  const activeLanes: (string | null)[] = [];

  for (const raw of lines) {
    // Find commit line: contains * followed by hash
    const commitMatch = raw.match(/^([*|\\/\\ ]+)\s+([0-9a-f]{6,40})\s*(.*)/);
    if (!commitMatch) {
      // Connector-only line — skip for now, handled via connectors
      continue;
    }

    const graphPart = commitMatch[1];
    const hash = commitMatch[2];
    const rest = commitMatch[3];

    // Parse refs (HEAD -> main, origin/main, etc.)
    const refs: string[] = [];
    let message = rest;
    const refsMatch = rest.match(/^\(([^)]+)\)\s*(.*)/);
    if (refsMatch) {
      refs.push(
        ...refsMatch[1].split(",").map((r) => r.trim())
      );
      message = refsMatch[2];
    }

    // Determine lane from position of * in graphPart
    const starPos = graphPart.indexOf("*");
    // Each character in the graph represents roughly half a lane width
    // Lanes are at positions 0, 2, 4, 6... (every other char)
    const lane = starPos >= 0 ? Math.floor(starPos / 2) : 0;

    // Ensure lane slot exists
    while (activeLanes.length <= lane) activeLanes.push(null);
    activeLanes[lane] = hash;

    // Detect connectors from graphPart (vertical bars and slashes)
    const connectors: Connector[] = [];
    for (let i = 0; i < graphPart.length; i++) {
      const ch = graphPart[i];
      const laneIdx = Math.floor(i / 2);
      if (ch === "|" && laneIdx !== lane) {
        connectors.push({ type: "passthrough", lane: laneIdx });
      } else if (ch === "/" || ch === "\\") {
        connectors.push({ type: "merge-start", lane: laneIdx });
      }
    }

    commits.push({ raw, graphPart, hash, refs, message, lane, connectors });
  }

  return commits;
}

function getLaneColor(lane: number): string {
  return LANE_COLORS[lane % LANE_COLORS.length];
}

// Determine max lane used across all commits
function maxLane(commits: ParsedCommit[]): number {
  return commits.reduce((max, c) => Math.max(max, c.lane), 0);
}

export default function GitFlowVisualizer() {
  const [input, setInput] = useState(SAMPLE_LOG);

  const commits = useMemo(() => parseGitLog(input), [input]);
  const totalLanes = useMemo(() => maxLane(commits) + 1, [commits]);

  // SVG layout constants
  const COMMIT_SPACING = 48;
  const LANE_WIDTH = 36;
  const DOT_R = 6;
  const PADDING_LEFT = 16;
  const PADDING_TOP = 24;
  const LABEL_LEFT = PADDING_LEFT + totalLanes * LANE_WIDTH + 16;
  const SVG_WIDTH = Math.max(800, LABEL_LEFT + 500);
  const SVG_HEIGHT = commits.length * COMMIT_SPACING + PADDING_TOP * 2;

  // Helper: x center of a lane
  const laneX = (lane: number) => PADDING_LEFT + lane * LANE_WIDTH + LANE_WIDTH / 2;
  // Helper: y center of commit row
  const commitY = (idx: number) => PADDING_TOP + idx * COMMIT_SPACING;

  // Build SVG paths for vertical lines between commits on the same lane
  function buildLaneLines(): React.ReactNode[] {
    const segments: React.ReactNode[] = [];

    // For each commit, draw a vertical line down to the next commit on the same lane
    for (let i = 0; i < commits.length - 1; i++) {
      const cur = commits[i];
      const next = commits[i + 1];

      // Draw vertical continuation for each lane that is active between row i and i+1
      // Determine which lanes are "alive" at this point
      const lanesAlive = new Set<number>();
      // Active from previous commits
      for (let j = 0; j <= i; j++) {
        lanesAlive.add(commits[j].lane);
      }
      // Remove lanes that end here (not present in future commits)
      // Simple heuristic: a lane is alive if it appears in rows > i
      const futureLanes = new Set(commits.slice(i + 1).map((c) => c.lane));

      // Merge connector lanes
      const connectorLanes = new Set<number>(cur.connectors.map((c) => c.lane));

      for (const lane of lanesAlive) {
        if (!futureLanes.has(lane) && lane !== cur.lane) continue;
        const x = laneX(lane);
        const y1 = commitY(i);
        const y2 = commitY(i + 1);

        // If next commit is on this lane, draw straight line
        if (futureLanes.has(lane)) {
          segments.push(
            <line
              key={`vline-${i}-${lane}`}
              x1={x}
              y1={y1}
              x2={x}
              y2={y2}
              stroke={getLaneColor(lane)}
              strokeWidth={2}
              opacity={0.7}
            />
          );
        }
      }

      // Draw merge/branch diagonal connectors
      // Detect: if current commit's graphPart has \ or / between lanes
      const graphPart = cur.graphPart;
      for (let gi = 0; gi < graphPart.length; gi++) {
        const ch = graphPart[gi];
        if (ch === "|") {
          const lane = Math.floor(gi / 2);
          if (lane !== cur.lane) {
            const x = laneX(lane);
            segments.push(
              <line
                key={`pass-${i}-${gi}`}
                x1={x}
                y1={commitY(i)}
                x2={x}
                y2={commitY(i + 1)}
                stroke={getLaneColor(lane)}
                strokeWidth={2}
                opacity={0.6}
              />
            );
          }
        }
      }

      // Check next line's graphPart for \ / connectors between commits
      const nextGraphPart = next.graphPart;
      for (let gi = 0; gi < nextGraphPart.length; gi++) {
        const ch = nextGraphPart[gi];
        if (ch === "/") {
          // Branch merging right-to-left: from lane gi/2 to lane (gi/2 - 1)
          const fromLane = Math.ceil(gi / 2);
          const toLane = Math.floor(gi / 2);
          if (fromLane !== toLane && fromLane >= 0 && toLane >= 0) {
            segments.push(
              <line
                key={`merge-${i}-${gi}`}
                x1={laneX(fromLane)}
                y1={commitY(i)}
                x2={laneX(toLane)}
                y2={commitY(i + 1)}
                stroke={getLaneColor(fromLane)}
                strokeWidth={2}
                opacity={0.7}
                strokeDasharray="4 2"
              />
            );
          }
        } else if (ch === "\\") {
          // Branch splitting left-to-right
          const fromLane = Math.floor(gi / 2);
          const toLane = Math.ceil(gi / 2);
          if (fromLane !== toLane) {
            segments.push(
              <line
                key={`branch-${i}-${gi}`}
                x1={laneX(fromLane)}
                y1={commitY(i)}
                x2={laneX(toLane)}
                y2={commitY(i + 1)}
                stroke={getLaneColor(toLane)}
                strokeWidth={2}
                opacity={0.7}
                strokeDasharray="4 2"
              />
            );
          }
        }
      }
    }

    return segments;
  }

  const laneColors = Array.from({ length: totalLanes }, (_, i) => getLaneColor(i));

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Git Log Output
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Run{" "}
          <code className="bg-gray-100 px-1 py-0.5 rounded">
            git log --oneline --graph --all
          </code>{" "}
          in your repo and paste the output below.
        </p>
        <textarea
          className="w-full h-48 font-mono text-xs bg-gray-950 text-green-400 border border-gray-700 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="Paste git log --oneline --graph output here..."
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setInput(SAMPLE_LOG)}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors"
          >
            Load Sample
          </button>
          <button
            onClick={() => setInput("")}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Diagram */}
      {commits.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">
          Paste git log output above to visualize the branch diagram.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Legend */}
          <div className="flex flex-wrap gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-xs font-semibold text-gray-500 self-center mr-1">
              Branches:
            </span>
            {laneColors.map((color, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                Lane {i + 1}
              </span>
            ))}
          </div>

          {/* SVG diagram */}
          <div className="overflow-x-auto">
            <svg
              width={SVG_WIDTH}
              height={SVG_HEIGHT}
              className="block"
              style={{ minWidth: SVG_WIDTH }}
            >
              {/* Lane background tracks */}
              {Array.from({ length: totalLanes }, (_, lane) => (
                <rect
                  key={`track-${lane}`}
                  x={laneX(lane) - DOT_R - 2}
                  y={0}
                  width={DOT_R * 2 + 4}
                  height={SVG_HEIGHT}
                  fill={getLaneColor(lane)}
                  opacity={0.04}
                />
              ))}

              {/* Connector lines */}
              {buildLaneLines()}

              {/* Commit dots and labels */}
              {commits.map((commit, idx) => {
                const cx = laneX(commit.lane);
                const cy = commitY(idx);
                const color = getLaneColor(commit.lane);
                return (
                  <g key={`commit-${idx}`}>
                    {/* Dot shadow */}
                    <circle cx={cx} cy={cy} r={DOT_R + 2} fill={color} opacity={0.15} />
                    {/* Dot */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={DOT_R}
                      fill={color}
                      stroke="white"
                      strokeWidth={2}
                    />

                    {/* Hash badge */}
                    <rect
                      x={LABEL_LEFT}
                      y={cy - 10}
                      width={58}
                      height={20}
                      rx={4}
                      fill={color}
                      opacity={0.12}
                    />
                    <text
                      x={LABEL_LEFT + 4}
                      y={cy + 4}
                      fontSize={11}
                      fontFamily="monospace"
                      fill={color}
                      fontWeight="600"
                    >
                      {commit.hash.slice(0, 7)}
                    </text>

                    {/* Message */}
                    <text
                      x={LABEL_LEFT + 66}
                      y={cy + 4}
                      fontSize={12}
                      fontFamily="ui-sans-serif, system-ui, sans-serif"
                      fill="#374151"
                    >
                      {commit.message.length > 55
                        ? commit.message.slice(0, 55) + "…"
                        : commit.message}
                    </text>

                    {/* Ref badges */}
                    {commit.refs.map((ref, ri) => {
                      const isHead = ref.startsWith("HEAD");
                      const isRemote = ref.startsWith("origin/") || ref.startsWith("upstream/");
                      const badgeColor = isHead
                        ? "#6366f1"
                        : isRemote
                        ? "#f59e0b"
                        : "#10b981";
                      const msgWidth = Math.min(commit.message.length, 55) * 7.2 + 4;
                      const badgeX = LABEL_LEFT + 66 + msgWidth + 8 + ri * 90;
                      return (
                        <g key={`ref-${idx}-${ri}`}>
                          <rect
                            x={badgeX}
                            y={cy - 9}
                            width={82}
                            height={18}
                            rx={9}
                            fill={badgeColor}
                            opacity={0.15}
                          />
                          <text
                            x={badgeX + 6}
                            y={cy + 4}
                            fontSize={10}
                            fontFamily="monospace"
                            fill={badgeColor}
                            fontWeight="700"
                          >
                            {ref.length > 14 ? ref.slice(0, 13) + "…" : ref}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Stats bar */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex gap-6 text-xs text-gray-500">
            <span>
              <span className="font-semibold text-gray-700">{commits.length}</span> commits
            </span>
            <span>
              <span className="font-semibold text-gray-700">{totalLanes}</span> lanes
            </span>
            <span>
              <span className="font-semibold text-gray-700">
                {commits.filter((c) => c.refs.length > 0).length}
              </span>{" "}
              labeled refs
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
