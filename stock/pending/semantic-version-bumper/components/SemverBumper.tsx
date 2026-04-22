"use client";

import { useState, useCallback } from "react";

type BumpType = "major" | "minor" | "patch" | "prerelease";
type Mode = "bump" | "compare";

interface ParsedSemver {
  major: number;
  minor: number;
  patch: number;
  prerelease: string;
  build: string;
  raw: string;
}

const SEMVER_REGEX =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

const COPY_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
  </svg>
);

const CHECK_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function parseSemver(input: string): ParsedSemver | null {
  const trimmed = input.trim().replace(/^v/, "");
  const match = SEMVER_REGEX.exec(trimmed);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] ?? "",
    build: match[5] ?? "",
    raw: trimmed,
  };
}

function bumpVersion(parsed: ParsedSemver, type: BumpType, preTag: string): string {
  let { major, minor, patch, prerelease } = parsed;
  const tag = preTag.trim() || "alpha";

  switch (type) {
    case "major":
      major += 1;
      minor = 0;
      patch = 0;
      prerelease = "";
      break;
    case "minor":
      minor += 1;
      patch = 0;
      prerelease = "";
      break;
    case "patch":
      patch += 1;
      prerelease = "";
      break;
    case "prerelease": {
      // If already a pre of same tag, bump the numeric suffix
      const match = prerelease.match(/^([a-zA-Z-]*)\.?(\d+)$/);
      if (match && match[1] === tag) {
        prerelease = `${tag}.${parseInt(match[2], 10) + 1}`;
      } else if (prerelease === tag) {
        prerelease = `${tag}.1`;
      } else {
        prerelease = tag;
      }
      break;
    }
  }

  let result = `${major}.${minor}.${patch}`;
  if (prerelease) result += `-${prerelease}`;
  return result;
}

// Compare two numeric-or-alphanumeric prerelease identifiers
function compareIdentifier(a: string, b: string): number {
  const aNum = /^\d+$/.test(a);
  const bNum = /^\d+$/.test(b);
  if (aNum && bNum) return parseInt(a, 10) - parseInt(b, 10);
  if (aNum) return -1; // numeric < alphanumeric
  if (bNum) return 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

function comparePrerelease(a: string, b: string): number {
  if (!a && !b) return 0;
  if (!a) return 1;  // no pre = release > pre
  if (!b) return -1;
  const aParts = a.split(".");
  const bParts = b.split(".");
  const len = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < len; i++) {
    if (i >= aParts.length) return -1;
    if (i >= bParts.length) return 1;
    const c = compareIdentifier(aParts[i], bParts[i]);
    if (c !== 0) return c;
  }
  return 0;
}

function compareSemver(a: ParsedSemver, b: ParsedSemver): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  return comparePrerelease(a.prerelease, b.prerelease);
}

function ParsedDisplay({ parsed }: { parsed: ParsedSemver }) {
  const parts = [
    { label: "Major", value: parsed.major.toString(), color: "bg-blue-100 text-blue-800 border-blue-200" },
    { label: "Minor", value: parsed.minor.toString(), color: "bg-violet-100 text-violet-800 border-violet-200" },
    { label: "Patch", value: parsed.patch.toString(), color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    ...(parsed.prerelease
      ? [{ label: "Pre-release", value: parsed.prerelease, color: "bg-amber-100 text-amber-800 border-amber-200" }]
      : []),
    ...(parsed.build
      ? [{ label: "Build", value: parsed.build, color: "bg-gray-100 text-gray-700 border-gray-200" }]
      : []),
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {parts.map(({ label, value, color }) => (
        <div key={label} className={`border rounded-lg px-3 py-1.5 text-center min-w-[64px] ${color}`}>
          <p className="text-xs font-medium opacity-70">{label}</p>
          <p className="font-mono font-bold text-sm">{value}</p>
        </div>
      ))}
    </div>
  );
}

export default function SemverBumper() {
  const [mode, setMode] = useState<Mode>("bump");

  // Bump mode state
  const [currentVersion, setCurrentVersion] = useState("1.2.3");
  const [bumpType, setBumpType] = useState<BumpType>("patch");
  const [preTag, setPreTag] = useState("alpha");
  const [bumpResult, setBumpResult] = useState<string | null>(null);
  const [bumpError, setBumpError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Compare mode state
  const [versionA, setVersionA] = useState("1.2.3");
  const [versionB, setVersionB] = useState("1.3.0-alpha.1");
  const [compareResult, setCompareResult] = useState<{ cmp: number; a: ParsedSemver; b: ParsedSemver } | null>(null);
  const [compareError, setCompareError] = useState("");

  const handleBump = useCallback(() => {
    setBumpError("");
    setBumpResult(null);
    const parsed = parseSemver(currentVersion);
    if (!parsed) {
      setBumpError("Invalid semver string. Expected format: MAJOR.MINOR.PATCH[-prerelease][+build]");
      return;
    }
    setBumpResult(bumpVersion(parsed, bumpType, preTag));
  }, [currentVersion, bumpType, preTag]);

  const handleCompare = useCallback(() => {
    setCompareError("");
    setCompareResult(null);
    const a = parseSemver(versionA);
    const b = parseSemver(versionB);
    if (!a) { setCompareError("Version A is not valid semver."); return; }
    if (!b) { setCompareError("Version B is not valid semver."); return; }
    setCompareResult({ cmp: compareSemver(a, b), a, b });
  }, [versionA, versionB]);

  const handleCopy = useCallback(async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }, []);

  const parsedCurrent = parseSemver(currentVersion);
  const parsedA = parseSemver(versionA);
  const parsedB = parseSemver(versionB);

  const BUMP_TYPES: { value: BumpType; label: string; desc: string }[] = [
    { value: "major", label: "major", desc: "Breaking change" },
    { value: "minor", label: "minor", desc: "New feature" },
    { value: "patch", label: "patch", desc: "Bug fix" },
    { value: "prerelease", label: "prerelease", desc: "Pre-release tag" },
  ];

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(["bump", "compare"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors capitalize ${
              mode === m
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {m === "bump" ? "Bump Version" : "Compare Versions"}
          </button>
        ))}
      </div>

      {/* ── BUMP MODE ── */}
      {mode === "bump" && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
            {/* Current version input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Current Version
              </label>
              <input
                type="text"
                value={currentVersion}
                onChange={(e) => { setCurrentVersion(e.target.value); setBumpResult(null); setBumpError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleBump()}
                placeholder="e.g. 1.2.3 or 2.0.0-beta.1"
                className="w-full sm:w-80 px-3 py-2.5 border border-gray-300 rounded-lg font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                spellCheck={false}
                autoComplete="off"
              />
              {parsedCurrent ? (
                <ParsedDisplay parsed={parsedCurrent} />
              ) : currentVersion.trim() ? (
                <p className="mt-1.5 text-xs text-red-500">Not a valid semver string</p>
              ) : null}
            </div>

            {/* Bump type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bump Type
              </label>
              <div className="flex flex-wrap gap-2">
                {BUMP_TYPES.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => { setBumpType(value); setBumpResult(null); }}
                    className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                      bumpType === value
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600"
                    }`}
                  >
                    {label}
                    <span className={`ml-1.5 text-xs font-normal ${bumpType === value ? "text-blue-200" : "text-gray-400"}`}>
                      {desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pre-release tag (only for prerelease bump) */}
            {bumpType === "prerelease" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Pre-release Tag
                </label>
                <input
                  type="text"
                  value={preTag}
                  onChange={(e) => { setPreTag(e.target.value); setBumpResult(null); }}
                  placeholder="alpha, beta, rc…"
                  className="w-48 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                  spellCheck={false}
                />
              </div>
            )}

            {bumpError && <p className="text-xs text-red-500">{bumpError}</p>}

            <button
              onClick={handleBump}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Bump Version
            </button>
          </div>

          {/* Bump result */}
          {bumpResult && parsedCurrent && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-lg text-gray-500 line-through">{parsedCurrent.raw}</span>
                <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="font-mono text-2xl font-bold text-blue-700">{bumpResult}</span>
              </div>
              <div className="flex items-center gap-3">
                <code className="flex-1 font-mono text-sm bg-white border border-blue-200 rounded-lg px-4 py-2.5 text-blue-900 break-all">
                  {bumpResult}
                </code>
                <button
                  onClick={() => handleCopy("bump", bumpResult)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                  title="Copy version"
                >
                  {copiedKey === "bump" ? CHECK_ICON : COPY_ICON}
                </button>
              </div>
              {parseSemver(bumpResult) && (
                <ParsedDisplay parsed={parseSemver(bumpResult)!} />
              )}
            </div>
          )}
        </>
      )}

      {/* ── COMPARE MODE ── */}
      {mode === "compare" && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Version A */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Version A
                </label>
                <input
                  type="text"
                  value={versionA}
                  onChange={(e) => { setVersionA(e.target.value); setCompareResult(null); setCompareError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                  placeholder="e.g. 1.2.3"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                  spellCheck={false}
                  autoComplete="off"
                />
                {parsedA ? (
                  <ParsedDisplay parsed={parsedA} />
                ) : versionA.trim() ? (
                  <p className="mt-1.5 text-xs text-red-500">Not valid semver</p>
                ) : null}
              </div>

              {/* Version B */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Version B
                </label>
                <input
                  type="text"
                  value={versionB}
                  onChange={(e) => { setVersionB(e.target.value); setCompareResult(null); setCompareError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                  placeholder="e.g. 1.3.0-alpha.1"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                  spellCheck={false}
                  autoComplete="off"
                />
                {parsedB ? (
                  <ParsedDisplay parsed={parsedB} />
                ) : versionB.trim() ? (
                  <p className="mt-1.5 text-xs text-red-500">Not valid semver</p>
                ) : null}
              </div>
            </div>

            {compareError && <p className="text-xs text-red-500">{compareError}</p>}

            <button
              onClick={handleCompare}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Compare
            </button>
          </div>

          {/* Compare result */}
          {compareResult && (
            <div className={`border rounded-xl p-6 ${
              compareResult.cmp === 0
                ? "bg-gray-50 border-gray-200"
                : compareResult.cmp > 0
                ? "bg-blue-50 border-blue-100"
                : "bg-violet-50 border-violet-100"
            }`}>
              <div className="flex items-center gap-4 flex-wrap">
                <span className={`font-mono text-lg font-bold ${compareResult.cmp > 0 ? "text-blue-700" : "text-gray-500"}`}>
                  {compareResult.a.raw}
                </span>
                <span className={`text-2xl font-bold ${
                  compareResult.cmp === 0 ? "text-gray-500" : compareResult.cmp > 0 ? "text-blue-600" : "text-violet-600"
                }`}>
                  {compareResult.cmp > 0 ? ">" : compareResult.cmp < 0 ? "<" : "="}
                </span>
                <span className={`font-mono text-lg font-bold ${compareResult.cmp < 0 ? "text-violet-700" : "text-gray-500"}`}>
                  {compareResult.b.raw}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-700">
                {compareResult.cmp === 0
                  ? "Both versions are equal."
                  : compareResult.cmp > 0
                  ? `A (${compareResult.a.raw}) is newer than B (${compareResult.b.raw}).`
                  : `B (${compareResult.b.raw}) is newer than A (${compareResult.a.raw}).`}
              </p>

              {/* Sort order preview */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2 font-medium">Sort order (ascending)</p>
                <div className="flex gap-2 flex-wrap">
                  {[compareResult.a, compareResult.b]
                    .slice()
                    .sort((x, y) => compareSemver(x, y))
                    .map((v, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                        <span className="text-xs text-gray-400 font-mono">{i + 1}.</span>
                        <span className="font-mono text-sm font-semibold text-gray-800">{v.raw}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quick reference */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Semver Quick Reference</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Format</p>
            <code className="block font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800">
              MAJOR.MINOR.PATCH<br />
              <span className="text-amber-600">[-prerelease]</span>
              <span className="text-gray-400">[+build]</span>
            </code>
            <p className="text-xs text-gray-500 mt-2">Leading <code className="font-mono text-xs">v</code> prefix is accepted but stripped.</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Precedence Rules</p>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex gap-2"><span className="text-blue-500 font-bold shrink-0">1.</span> Compare MAJOR, then MINOR, then PATCH numerically</li>
              <li className="flex gap-2"><span className="text-blue-500 font-bold shrink-0">2.</span> A release version is always greater than its pre-release (1.0.0 &gt; 1.0.0-alpha)</li>
              <li className="flex gap-2"><span className="text-blue-500 font-bold shrink-0">3.</span> Numeric pre-release identifiers are compared as integers; alphanumeric lexically</li>
              <li className="flex gap-2"><span className="text-blue-500 font-bold shrink-0">4.</span> Build metadata is ignored for precedence</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Bump</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Example</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">When to use</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {[
                { bump: "major", ex: "1.2.3 → 2.0.0", when: "Breaking / incompatible API change" },
                { bump: "minor", ex: "1.2.3 → 1.3.0", when: "New backward-compatible feature" },
                { bump: "patch", ex: "1.2.3 → 1.2.4", when: "Backward-compatible bug fix" },
                { bump: "prerelease", ex: "1.2.3 → 1.2.3-alpha", when: "Unstable / work-in-progress release" },
              ].map((row) => (
                <tr key={row.bump} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-3 font-mono font-semibold text-blue-700">{row.bump}</td>
                  <td className="py-2 px-3 font-mono text-xs text-gray-600">{row.ex}</td>
                  <td className="py-2 px-3 text-xs text-gray-600">{row.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
