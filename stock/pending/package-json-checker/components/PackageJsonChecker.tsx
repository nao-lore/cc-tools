"use client";

import { useState, useMemo } from "react";

const SAMPLE = JSON.stringify(
  {
    name: "my-library",
    version: "1.0.0",
    description: "An example library",
    main: "dist/index.js",
    scripts: {
      build: "tsc && rollup",
      test: "jest",
      lint: "eslint src && prettier --check src",
    },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
      lodash: "~4.17.21",
    },
    devDependencies: {
      typescript: "^5.0.0",
      jest: "^29.0.0",
      lodash: "^4.17.21",
    },
  },
  null,
  2
);

type Severity = "error" | "warning" | "info";

type Issue = {
  severity: Severity;
  message: string;
};

type DepRow = {
  name: string;
  version: string;
  type: "dep" | "devDep" | "peer" | "optional";
};

function severityOrder(s: Severity) {
  return s === "error" ? 0 : s === "warning" ? 1 : 2;
}

function isValidSemver(v: string): boolean {
  // Basic semver: X.Y.Z with optional pre-release/build
  return /^\d+\.\d+\.\d+([-.+][a-zA-Z0-9.+\-]*)?$/.test(v);
}

function analyzePackageJson(raw: string): { issues: Issue[]; deps: DepRow[]; parsed: Record<string, unknown> | null } {
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return {
      issues: [{ severity: "error", message: `Invalid JSON: ${(e as Error).message}` }],
      deps: [],
      parsed: null,
    };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {
      issues: [{ severity: "error", message: "package.json must be a JSON object, not an array or primitive." }],
      deps: [],
      parsed: null,
    };
  }

  const issues: Issue[] = [];

  // --- Required fields ---
  if (!parsed.name) {
    issues.push({ severity: "error", message: 'Missing required field: "name"' });
  }
  if (!parsed.version) {
    issues.push({ severity: "error", message: 'Missing required field: "version"' });
  } else if (typeof parsed.version === "string") {
    if (!isValidSemver(parsed.version)) {
      issues.push({
        severity: "error",
        message: `Invalid version format "${parsed.version}". Expected semver like "1.0.0".`,
      });
    }
  }
  if (!parsed.description) {
    issues.push({ severity: "warning", message: 'Missing field: "description". Recommended for npm registry discoverability.' });
  }
  if (!parsed.license) {
    issues.push({ severity: "warning", message: 'Missing field: "license". Add an SPDX identifier (e.g. "MIT") or "UNLICENSED".' });
  }

  // --- Entry points (library hint) ---
  const hasMain = Boolean(parsed.main);
  const hasModule = Boolean(parsed.module);
  const hasTypes = Boolean(parsed.types || parsed.typings);
  const hasExports = Boolean(parsed.exports);

  if (!hasMain && !hasExports) {
    issues.push({ severity: "info", message: 'No "main" or "exports" field. Required for packages consumed as a module.' });
  }
  if (!hasModule && !hasExports) {
    issues.push({ severity: "info", message: 'No "module" field. Add it to support ESM-aware bundlers (Rollup, Vite, webpack).' });
  }
  if (!hasTypes) {
    issues.push({ severity: "info", message: 'No "types" or "typings" field. Add it so TypeScript consumers get type definitions.' });
  }

  // --- Scripts: && vs & ---
  if (parsed.scripts && typeof parsed.scripts === "object") {
    for (const [scriptName, scriptValue] of Object.entries(parsed.scripts as Record<string, string>)) {
      if (typeof scriptValue === "string" && /(?<![&])&(?![&])/.test(scriptValue)) {
        issues.push({
          severity: "warning",
          message: `Script "${scriptName}" uses single "&" (background operator). Did you mean "&&"?`,
        });
      }
    }
  }

  // --- Dependencies ---
  const deps = (parsed.dependencies as Record<string, string> | undefined) || {};
  const devDeps = (parsed.devDependencies as Record<string, string> | undefined) || {};
  const peerDeps = (parsed.peerDependencies as Record<string, string> | undefined) || {};
  const optDeps = (parsed.optionalDependencies as Record<string, string> | undefined) || {};

  // Duplicates across deps + devDeps
  const depKeys = new Set(Object.keys(deps));
  const devDepKeys = new Set(Object.keys(devDeps));
  for (const key of depKeys) {
    if (devDepKeys.has(key)) {
      issues.push({
        severity: "warning",
        message: `"${key}" appears in both "dependencies" and "devDependencies". Remove from one group.`,
      });
    }
  }

  // Mixed ^ and ~ in dependencies
  function checkMixedPrefixes(group: Record<string, string>, label: string) {
    const versions = Object.values(group).filter(v => typeof v === "string");
    const hasCarets = versions.some(v => v.startsWith("^"));
    const hasTildes = versions.some(v => v.startsWith("~"));
    if (hasCarets && hasTildes) {
      issues.push({
        severity: "warning",
        message: `"${label}" mixes "^" and "~" version prefixes. Standardize on one range strategy.`,
      });
    }
  }
  checkMixedPrefixes(deps, "dependencies");
  checkMixedPrefixes(devDeps, "devDependencies");

  // Build dep rows
  const depRows: DepRow[] = [
    ...Object.entries(deps).map(([name, version]) => ({ name, version, type: "dep" as const })),
    ...Object.entries(devDeps).map(([name, version]) => ({ name, version, type: "devDep" as const })),
    ...Object.entries(peerDeps).map(([name, version]) => ({ name, version, type: "peer" as const })),
    ...Object.entries(optDeps).map(([name, version]) => ({ name, version, type: "optional" as const })),
  ];

  issues.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));

  return { issues, deps: depRows, parsed };
}

function SeverityIcon({ severity }: { severity: Severity }) {
  if (severity === "error") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 flex-shrink-0 text-xs font-bold">
        ✕
      </span>
    );
  }
  if (severity === "warning") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex-shrink-0 text-xs font-bold">
        !
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex-shrink-0 text-xs font-bold">
      i
    </span>
  );
}

function DepTypeBadge({ type }: { type: DepRow["type"] }) {
  const styles: Record<DepRow["type"], string> = {
    dep: "bg-green-100 text-green-700",
    devDep: "bg-purple-100 text-purple-700",
    peer: "bg-sky-100 text-sky-700",
    optional: "bg-gray-100 text-gray-600",
  };
  const labels: Record<DepRow["type"], string> = {
    dep: "dep",
    devDep: "devDep",
    peer: "peer",
    optional: "optional",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

export default function PackageJsonChecker() {
  const [input, setInput] = useState("");

  const { issues, deps, parsed } = useMemo(
    () => (input.trim() ? analyzePackageJson(input) : { issues: [], deps: [], parsed: null }),
    [input]
  );

  const hasInput = input.trim().length > 0;

  const errorCount = issues.filter(i => i.severity === "error").length;
  const warningCount = issues.filter(i => i.severity === "warning").length;
  const infoCount = issues.filter(i => i.severity === "info").length;

  const totalDeps = deps.filter(d => d.type === "dep").length;
  const totalDevDeps = deps.filter(d => d.type === "devDep").length;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-sm font-medium text-gray-700">package.json Content</span>
          <div className="flex gap-2">
            {hasInput && (
              <button
                onClick={() => setInput("")}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setInput(SAMPLE)}
              className="text-xs text-blue-600 hover:text-blue-800 px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              Load Sample
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={"Paste your package.json content here...\n\nExample:\n{\n  \"name\": \"my-app\",\n  \"version\": \"1.0.0\"\n}"}
          className="w-full h-56 px-4 py-3 font-mono text-sm text-gray-800 placeholder-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
          spellCheck={false}
        />
      </div>

      {/* Stats bar */}
      {hasInput && parsed !== null && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`border rounded-lg px-4 py-3 text-center shadow-sm ${errorCount > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
            <div className={`text-2xl font-bold ${errorCount > 0 ? "text-red-600" : "text-gray-900"}`}>{errorCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">Errors</div>
          </div>
          <div className={`border rounded-lg px-4 py-3 text-center shadow-sm ${warningCount > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`}>
            <div className={`text-2xl font-bold ${warningCount > 0 ? "text-amber-600" : "text-gray-900"}`}>{warningCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">Warnings</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{totalDeps}</div>
            <div className="text-xs text-gray-500 mt-0.5">Dependencies</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{totalDevDeps}</div>
            <div className="text-xs text-gray-500 mt-0.5">devDependencies</div>
          </div>
        </div>
      )}

      {/* Parse error state */}
      {hasInput && parsed === null && issues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <SeverityIcon severity="error" />
          <p className="text-sm text-red-700 font-medium">{issues[0].message}</p>
        </div>
      )}

      {/* Issues list */}
      {hasInput && parsed !== null && issues.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Issues</span>
            <span className="text-xs text-gray-400">({issues.length})</span>
            {infoCount > 0 && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded ml-auto">
                {infoCount} info
              </span>
            )}
          </div>
          <ul className="divide-y divide-gray-100">
            {issues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-3 px-4 py-3">
                <SeverityIcon severity={issue.severity} />
                <span className="text-sm text-gray-700 leading-snug">{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No issues success state */}
      {hasInput && parsed !== null && issues.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 flex-shrink-0 text-xs font-bold">
            ✓
          </span>
          <p className="text-sm text-green-700 font-medium">No issues found. Your package.json looks good!</p>
        </div>
      )}

      {/* Dependencies table */}
      {hasInput && parsed !== null && deps.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Dependencies</span>
            <span className="text-xs text-gray-400">({deps.length} total)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Package</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Version</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Type</th>
                </tr>
              </thead>
              <tbody>
                {deps.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 font-mono text-xs text-gray-800 font-medium">{row.name}</td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-600">{row.version}</td>
                    <td className="px-4 py-2">
                      <DepTypeBadge type={row.type} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasInput && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Paste your <span className="font-mono">package.json</span> above or click{" "}
          <strong>Load Sample</strong> to try it out.
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this package.json Linter tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Validate and analyze package.json for common issues. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this package.json Linter tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Validate and analyze package.json for common issues. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "package.json Linter",
  "description": "Validate and analyze package.json for common issues",
  "url": "https://tools.loresync.dev/package-json-checker",
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
