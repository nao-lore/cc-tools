"use client";

import { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Rule {
  type: "Allow" | "Disallow";
  path: string;
}

interface AgentBlock {
  userAgents: string[];
  rules: Rule[];
  crawlDelay?: string;
}

interface ParsedRobots {
  agents: AgentBlock[];
  sitemaps: string[];
  host?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SAMPLE_ROBOTS = `User-agent: *
Disallow: /admin/
Disallow: /private/
Disallow: /tmp/
Allow: /public/
Crawl-delay: 10

User-agent: Googlebot
Allow: /
Disallow: /no-google/
Disallow: /search?

User-agent: Bingbot
Disallow: /no-bing/
Allow: /

Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-news.xml
Host: example.com`;

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseRobots(text: string): ParsedRobots {
  const lines = text.split(/\r?\n/);
  const agents: AgentBlock[] = [];
  const sitemaps: string[] = [];
  let host: string | undefined;

  let current: AgentBlock | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const value = line.slice(colonIdx + 1).trim();

    if (key === "user-agent") {
      if (current && current.userAgents.length > 0 && current.rules.length === 0 && !current.crawlDelay) {
        // Consecutive user-agent lines — merge into current block
        current.userAgents.push(value);
      } else {
        current = { userAgents: [value], rules: [] };
        agents.push(current);
      }
    } else if (key === "allow" && current) {
      current.rules.push({ type: "Allow", path: value || "/" });
    } else if (key === "disallow" && current) {
      if (value !== "") {
        current.rules.push({ type: "Disallow", path: value });
      }
    } else if (key === "crawl-delay" && current) {
      current.crawlDelay = value;
    } else if (key === "sitemap") {
      sitemaps.push(value);
    } else if (key === "host") {
      host = value;
    }
  }

  return { agents, sitemaps, host };
}

// ─── URL Tester ───────────────────────────────────────────────────────────────

function testUrl(
  parsed: ParsedRobots,
  url: string,
  userAgent: string
): { allowed: boolean; matchedRule: Rule | null; matchedAgent: string } {
  // Normalize URL to path only
  let path = url;
  try {
    const u = new URL(url.startsWith("http") ? url : "https://example.com" + url);
    path = u.pathname + u.search;
  } catch {
    path = url.startsWith("/") ? url : "/" + url;
  }

  const ua = userAgent.toLowerCase();

  // Find matching agent blocks: specific first, then wildcard
  const specificBlocks = parsed.agents.filter((b) =>
    b.userAgents.some((a) => a.toLowerCase() === ua)
  );
  const wildcardBlocks = parsed.agents.filter((b) =>
    b.userAgents.some((a) => a === "*")
  );

  const blocksToCheck = specificBlocks.length > 0 ? specificBlocks : wildcardBlocks;
  const matchedAgentLabel =
    specificBlocks.length > 0
      ? specificBlocks[0].userAgents.find((a) => a.toLowerCase() === ua) ?? userAgent
      : "*";

  let bestRule: Rule | null = null;
  let bestLength = -1;

  for (const block of blocksToCheck) {
    for (const rule of block.rules) {
      const pattern = rule.path;
      // Simple prefix match with $ anchor support
      const isMatch = pattern.endsWith("$")
        ? path === pattern.slice(0, -1)
        : path.startsWith(pattern);

      if (isMatch && pattern.length > bestLength) {
        bestLength = pattern.length;
        bestRule = rule;
      }
    }
  }

  if (bestRule === null) {
    return { allowed: true, matchedRule: null, matchedAgent: matchedAgentLabel };
  }

  return {
    allowed: bestRule.type === "Allow",
    matchedRule: bestRule,
    matchedAgent: matchedAgentLabel,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RobotsTxtParser() {
  const [input, setInput] = useState(SAMPLE_ROBOTS);
  const [testUrl_, setTestUrl] = useState("/admin/dashboard");
  const [testAgent, setTestAgent] = useState("*");

  const parsed = parseRobots(input);

  const allAgents = Array.from(
    new Set(parsed.agents.flatMap((b) => b.userAgents))
  );

  const testResult =
    testUrl_.trim() && input.trim()
      ? testUrl(parsed, testUrl_.trim(), testAgent)
      : null;

  const handleLoadSample = useCallback(() => {
    setInput(SAMPLE_ROBOTS);
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
  }, []);

  return (
    <div className="space-y-6">
      {/* Input */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-700">
            robots.txt Content
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleLoadSample}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors cursor-pointer"
            >
              Load Sample
            </button>
            <button
              onClick={handleClear}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          spellCheck={false}
          placeholder="Paste your robots.txt content here..."
          className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y bg-white"
        />
        {input.trim() && (
          <p className="mt-1.5 text-xs text-slate-400">
            {parsed.agents.length} user-agent block{parsed.agents.length !== 1 ? "s" : ""} detected
            {parsed.sitemaps.length > 0 ? ` · ${parsed.sitemaps.length} sitemap URL${parsed.sitemaps.length !== 1 ? "s" : ""}` : ""}
            {parsed.host ? ` · Host: ${parsed.host}` : ""}
          </p>
        )}
      </section>

      {/* URL Tester */}
      <section className="bg-slate-50 rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
          URL Access Tester
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">URL or Path</label>
            <input
              type="text"
              value={testUrl_}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="/path/to/page"
              spellCheck={false}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
          <div className="sm:w-48">
            <label className="block text-xs font-medium text-slate-500 mb-1">User-agent</label>
            <div className="relative">
              <input
                type="text"
                value={testAgent}
                onChange={(e) => setTestAgent(e.target.value)}
                placeholder="* or Googlebot"
                spellCheck={false}
                list="agent-list"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
              <datalist id="agent-list">
                {allAgents.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {testResult && testUrl_.trim() && (
          <div
            className={`mt-4 rounded-xl p-4 border ${
              testResult.allowed
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.allowed ? (
                <>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white flex-shrink-0">
                    <CheckIcon />
                  </span>
                  <span className="font-semibold text-green-800">Allowed</span>
                </>
              ) : (
                <>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white flex-shrink-0">
                    <XIcon />
                  </span>
                  <span className="font-semibold text-red-800">Disallowed</span>
                </>
              )}
              <span className="text-sm text-slate-500 ml-auto">
                Matched agent:{" "}
                <span className="font-mono font-semibold text-slate-700">
                  {testResult.matchedAgent}
                </span>
              </span>
            </div>
            {testResult.matchedRule ? (
              <p className="mt-2 text-sm pl-8">
                <span className={testResult.allowed ? "text-green-700" : "text-red-700"}>
                  Matched rule:{" "}
                  <span className="font-mono font-semibold">
                    {testResult.matchedRule.type}: {testResult.matchedRule.path}
                  </span>
                </span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500 pl-8">
                No matching rule — access allowed by default.
              </p>
            )}
          </div>
        )}

        {!testUrl_.trim() && (
          <p className="mt-3 text-xs text-slate-400">Enter a URL or path above to test access.</p>
        )}
      </section>

      {/* Parsed Rules by Agent */}
      {parsed.agents.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Rules by User-agent</h2>
          <div className="space-y-4">
            {parsed.agents.map((block, bi) => (
              <div key={bi} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Agent header */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
                    User-agent
                  </span>
                  {block.userAgents.map((ua) => (
                    <span
                      key={ua}
                      className={`inline-block font-mono text-sm font-semibold px-2.5 py-0.5 rounded-full border ${
                        ua === "*"
                          ? "bg-slate-800 text-white border-slate-800"
                          : "bg-blue-600 text-white border-blue-600"
                      }`}
                    >
                      {ua}
                    </span>
                  ))}
                  {block.crawlDelay && (
                    <span className="ml-auto text-xs text-slate-500 font-mono">
                      Crawl-delay: <span className="font-semibold text-slate-700">{block.crawlDelay}</span>
                    </span>
                  )}
                </div>

                {/* Rules table */}
                {block.rules.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-4 py-2.5 font-semibold text-slate-500 w-28">Type</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-slate-500">Path</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {block.rules.map((rule, ri) => (
                        <tr key={ri} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2.5">
                            <span
                              className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                                rule.type === "Allow"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {rule.type}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-slate-700">{rule.path}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="px-4 py-3 text-sm text-slate-400 italic">No rules defined (all paths allowed).</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sitemaps */}
      {parsed.sitemaps.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Sitemap URLs
            <span className="ml-2 text-sm font-normal text-slate-400">({parsed.sitemaps.length})</span>
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {parsed.sitemaps.map((url, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                >
                  {url}
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Host */}
      {parsed.host && (
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Host Directive</h2>
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <span className="font-mono text-sm text-slate-700">{parsed.host}</span>
          </div>
        </section>
      )}

      {/* Empty state */}
      {input.trim() && parsed.agents.length === 0 && parsed.sitemaps.length === 0 && !parsed.host && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
          <p className="text-amber-700 font-medium">No valid robots.txt directives found.</p>
          <p className="text-amber-600 text-sm mt-1">Check the format — each directive should be on its own line as <span className="font-mono">Key: Value</span>.</p>
        </section>
      )}

      {/* Ad placeholder */}
      <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-sm">
        Ad Space — Google AdSense
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this robots.txt Parser tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Parse and visualize a robots.txt file as a structured table. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this robots.txt Parser tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Parse and visualize a robots.txt file as a structured table. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
