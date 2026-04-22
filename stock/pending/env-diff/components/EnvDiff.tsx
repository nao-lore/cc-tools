"use client";

import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RowStatus = "match" | "different" | "only-a" | "only-b";

interface DiffRow {
  key: string;
  status: RowStatus;
  valueA: string | null;
  valueB: string | null;
}

interface Stats {
  total: number;
  matching: number;
  different: number;
  onlyA: number;
  onlyB: number;
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

function parseEnv(raw: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    // Skip blank lines and comments
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) {
      // Key with no value
      map.set(trimmed, "");
      continue;
    }
    const key = trimmed.slice(0, eqIdx).trim();
    if (!key) continue;
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    map.set(key, value);
  }
  return map;
}

function buildDiff(mapA: Map<string, string>, mapB: Map<string, string>): DiffRow[] {
  const allKeys = new Set([...mapA.keys(), ...mapB.keys()]);
  const rows: DiffRow[] = [];

  for (const key of allKeys) {
    const inA = mapA.has(key);
    const inB = mapB.has(key);
    const valA = inA ? mapA.get(key)! : null;
    const valB = inB ? mapB.get(key)! : null;

    let status: RowStatus;
    if (inA && inB) {
      status = valA === valB ? "match" : "different";
    } else if (inA) {
      status = "only-a";
    } else {
      status = "only-b";
    }

    rows.push({ key, status, valueA: valA, valueB: valB });
  }

  // Sort: different first, then only-a, only-b, match
  const order: Record<RowStatus, number> = {
    different: 0,
    "only-a": 1,
    "only-b": 2,
    match: 3,
  };
  rows.sort((a, b) => {
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return a.key.localeCompare(b.key);
  });

  return rows;
}

function computeStats(rows: DiffRow[]): Stats {
  const s: Stats = { total: rows.length, matching: 0, different: 0, onlyA: 0, onlyB: 0 };
  for (const row of rows) {
    if (row.status === "match") s.matching++;
    else if (row.status === "different") s.different++;
    else if (row.status === "only-a") s.onlyA++;
    else s.onlyB++;
  }
  return s;
}

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

function statusStyles(status: RowStatus) {
  switch (status) {
    case "match":
      return {
        row: "bg-green-50",
        badge: "bg-green-100 text-green-700",
        label: "match",
        keyColor: "text-green-800",
        valueColor: "text-green-700",
      };
    case "different":
      return {
        row: "bg-yellow-50",
        badge: "bg-yellow-100 text-yellow-700",
        label: "different",
        keyColor: "text-yellow-800",
        valueColor: "text-yellow-700",
      };
    case "only-a":
      return {
        row: "bg-red-50",
        badge: "bg-red-100 text-red-600",
        label: "only in A",
        keyColor: "text-red-800",
        valueColor: "text-red-600",
      };
    case "only-b":
      return {
        row: "bg-red-50",
        badge: "bg-red-100 text-red-600",
        label: "only in B",
        keyColor: "text-red-800",
        valueColor: "text-red-600",
      };
  }
}

function maskValue(v: string): string {
  if (v === "") return "(empty)";
  // Mask secrets: show first 3 chars then asterisks
  if (v.length <= 3) return "•".repeat(v.length);
  return v.slice(0, 3) + "•".repeat(Math.min(v.length - 3, 8));
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const SAMPLE_A = `# .env.example
NODE_ENV=development
DATABASE_URL=postgres://localhost:5432/mydb
API_KEY=
SECRET_KEY=changeme
PORT=3000
REDIS_URL=redis://localhost:6379
DEBUG=true`;

const SAMPLE_B = `# .env.production
NODE_ENV=production
DATABASE_URL=postgres://prod-host:5432/mydb
API_KEY=sk-prod-abc123xyz
SECRET_KEY=s3cr3t-pr0d-k3y
PORT=8080
SENTRY_DSN=https://abc@sentry.io/123`;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function EnvDiff() {
  const [envA, setEnvA] = useState("");
  const [envB, setEnvB] = useState("");
  const [rows, setRows] = useState<DiffRow[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [maskValues, setMaskValues] = useState(true);
  const [filterStatus, setFilterStatus] = useState<RowStatus | "all">("all");
  const [copiedA, setCopiedA] = useState(false);
  const [copiedB, setCopiedB] = useState(false);

  const handleCompare = useCallback(() => {
    const mapA = parseEnv(envA);
    const mapB = parseEnv(envB);
    const diffRows = buildDiff(mapA, mapB);
    setRows(diffRows);
    setStats(computeStats(diffRows));
    setFilterStatus("all");
  }, [envA, envB]);

  const handleLoadSample = useCallback(() => {
    setEnvA(SAMPLE_A);
    setEnvB(SAMPLE_B);
    setRows(null);
    setStats(null);
    setFilterStatus("all");
  }, []);

  const handleClear = useCallback(() => {
    setEnvA("");
    setEnvB("");
    setRows(null);
    setStats(null);
    setFilterStatus("all");
  }, []);

  const copyMissingFromA = useCallback(() => {
    if (!rows) return;
    const missing = rows
      .filter((r) => r.status === "only-b")
      .map((r) => `${r.key}=`)
      .join("\n");
    navigator.clipboard.writeText(missing).then(() => {
      setCopiedA(true);
      setTimeout(() => setCopiedA(false), 2000);
    });
  }, [rows]);

  const copyMissingFromB = useCallback(() => {
    if (!rows) return;
    const missing = rows
      .filter((r) => r.status === "only-a")
      .map((r) => `${r.key}=`)
      .join("\n");
    navigator.clipboard.writeText(missing).then(() => {
      setCopiedB(true);
      setTimeout(() => setCopiedB(false), 2000);
    });
  }, [rows]);

  const visibleRows = rows
    ? filterStatus === "all"
      ? rows
      : rows.filter((r) => r.status === filterStatus)
    : null;

  const missingFromA = stats?.onlyB ?? 0;
  const missingFromB = stats?.onlyA ?? 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleCompare}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Compare
        </button>
        <button
          onClick={handleLoadSample}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Load Sample
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* Input panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            .env A (e.g. .env.example)
          </label>
          <textarea
            value={envA}
            onChange={(e) => {
              setEnvA(e.target.value);
              setRows(null);
              setStats(null);
            }}
            placeholder={"Paste your .env file here...\n\nAPI_KEY=\nDATABASE_URL=postgres://localhost/db\nNODE_ENV=development"}
            spellCheck={false}
            className="w-full h-56 p-4 font-mono text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 placeholder-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">
            .env B (e.g. production)
          </label>
          <textarea
            value={envB}
            onChange={(e) => {
              setEnvB(e.target.value);
              setRows(null);
              setStats(null);
            }}
            placeholder={"Paste your .env file here...\n\nAPI_KEY=sk-abc123\nDATABASE_URL=postgres://prod/db\nNODE_ENV=production"}
            spellCheck={false}
            className="w-full h-56 p-4 font-mono text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Results */}
      {rows !== null && stats !== null && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Stats bar */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-sm font-medium text-gray-700">
                {stats.total} variable{stats.total !== 1 ? "s" : ""} total
              </span>
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  filterStatus === "all"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilterStatus("match")}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  filterStatus === "match"
                    ? "bg-green-700 text-white"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                Match ({stats.matching})
              </button>
              <button
                onClick={() => setFilterStatus("different")}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  filterStatus === "different"
                    ? "bg-yellow-600 text-white"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                }`}
              >
                Different ({stats.different})
              </button>
              <button
                onClick={() => setFilterStatus("only-a")}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  filterStatus === "only-a"
                    ? "bg-red-700 text-white"
                    : "bg-red-100 text-red-600 hover:bg-red-200"
                }`}
              >
                Only in A ({stats.onlyA})
              </button>
              <button
                onClick={() => setFilterStatus("only-b")}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  filterStatus === "only-b"
                    ? "bg-red-700 text-white"
                    : "bg-red-100 text-red-600 hover:bg-red-200"
                }`}
              >
                Only in B ({stats.onlyB})
              </button>

              <label className="ml-auto flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={maskValues}
                  onChange={(e) => setMaskValues(e.target.checked)}
                  className="rounded"
                />
                Mask values
              </label>
            </div>

            {/* Copy actions */}
            <div className="flex flex-wrap gap-2">
              {missingFromA > 0 && (
                <button
                  onClick={copyMissingFromA}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {copiedA ? (
                    <span className="text-green-600">Copied!</span>
                  ) : (
                    <>
                      <span>Copy {missingFromA} missing from A</span>
                    </>
                  )}
                </button>
              )}
              {missingFromB > 0 && (
                <button
                  onClick={copyMissingFromB}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {copiedB ? (
                    <span className="text-green-600">Copied!</span>
                  ) : (
                    <>
                      <span>Copy {missingFromB} missing from B</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-0 bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div className="px-4 py-2">Key</div>
            <div className="px-4 py-2">Status</div>
            <div className="px-4 py-2">Value A</div>
            <div className="px-4 py-2">Value B</div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-gray-100">
            {visibleRows && visibleRows.length > 0 ? (
              visibleRows.map((row) => {
                const s = statusStyles(row.status);
                return (
                  <div
                    key={row.key}
                    className={`grid grid-cols-[2fr_1fr_1fr_1fr] gap-0 text-sm font-mono ${s.row}`}
                  >
                    {/* Key */}
                    <div className={`px-4 py-2.5 font-semibold truncate ${s.keyColor}`}>
                      {row.key}
                    </div>
                    {/* Status badge */}
                    <div className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.badge}`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {/* Value A */}
                    <div className={`px-4 py-2.5 truncate ${row.valueA === null ? "text-gray-300 italic" : s.valueColor}`}>
                      {row.valueA === null
                        ? "—"
                        : maskValues
                        ? maskValue(row.valueA)
                        : row.valueA === ""
                        ? "(empty)"
                        : row.valueA}
                    </div>
                    {/* Value B */}
                    <div className={`px-4 py-2.5 truncate ${row.valueB === null ? "text-gray-300 italic" : s.valueColor}`}>
                      {row.valueB === null
                        ? "—"
                        : maskValues
                        ? maskValue(row.valueB)
                        : row.valueB === ""
                        ? "(empty)"
                        : row.valueB}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-10 text-center text-gray-400 text-sm">
                No results for this filter.
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-400 inline-block" /> Match
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-yellow-400 inline-block" /> Different
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-400 inline-block" /> Missing
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
