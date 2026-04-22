"use client";

import { useState, useCallback, useMemo } from "react";

interface Rule {
  path: string;
  type: "Allow" | "Disallow";
}

interface UserAgentBlock {
  id: string;
  userAgent: string;
  customAgent: string;
  rules: Rule[];
  crawlDelay: string;
}

interface ValidationIssue {
  level: "error" | "warning";
  message: string;
}

const PRESET_AGENTS = [
  { label: "All bots (*)", value: "*" },
  { label: "Googlebot", value: "Googlebot" },
  { label: "Bingbot", value: "Bingbot" },
  { label: "GPTBot", value: "GPTBot" },
  { label: "ChatGPT-User", value: "ChatGPT-User" },
  { label: "Google-Extended", value: "Google-Extended" },
  { label: "CCBot", value: "CCBot" },
  { label: "Slurp (Yahoo)", value: "Slurp" },
  { label: "DuckDuckBot", value: "DuckDuckBot" },
  { label: "Baiduspider", value: "Baiduspider" },
  { label: "YandexBot", value: "YandexBot" },
  { label: "facebookexternalhit", value: "facebookexternalhit" },
  { label: "Twitterbot", value: "Twitterbot" },
  { label: "Custom...", value: "__custom__" },
];

const PRESETS = {
  allowAll: {
    label: "Allow All",
    description: "Allow all bots to crawl everything",
    blocks: [
      {
        id: "1",
        userAgent: "*",
        customAgent: "",
        rules: [{ path: "/", type: "Allow" as const }],
        crawlDelay: "",
      },
    ],
    sitemapUrl: "",
  },
  blockAll: {
    label: "Block All",
    description: "Block all bots from crawling",
    blocks: [
      {
        id: "1",
        userAgent: "*",
        customAgent: "",
        rules: [{ path: "/", type: "Disallow" as const }],
        crawlDelay: "",
      },
    ],
    sitemapUrl: "",
  },
  blockAiBots: {
    label: "Block AI Bots",
    description: "Block AI training crawlers",
    blocks: [
      {
        id: "1",
        userAgent: "*",
        customAgent: "",
        rules: [{ path: "/", type: "Allow" as const }],
        crawlDelay: "",
      },
      {
        id: "2",
        userAgent: "GPTBot",
        customAgent: "",
        rules: [{ path: "/", type: "Disallow" as const }],
        crawlDelay: "",
      },
      {
        id: "3",
        userAgent: "ChatGPT-User",
        customAgent: "",
        rules: [{ path: "/", type: "Disallow" as const }],
        crawlDelay: "",
      },
      {
        id: "4",
        userAgent: "CCBot",
        customAgent: "",
        rules: [{ path: "/", type: "Disallow" as const }],
        crawlDelay: "",
      },
      {
        id: "5",
        userAgent: "Google-Extended",
        customAgent: "",
        rules: [{ path: "/", type: "Disallow" as const }],
        crawlDelay: "",
      },
    ],
    sitemapUrl: "",
  },
  standardSeo: {
    label: "Standard SEO",
    description: "Common SEO-friendly configuration",
    blocks: [
      {
        id: "1",
        userAgent: "*",
        customAgent: "",
        rules: [
          { path: "/", type: "Allow" as const },
          { path: "/api/", type: "Disallow" as const },
          { path: "/admin/", type: "Disallow" as const },
          { path: "/private/", type: "Disallow" as const },
          { path: "/*.json$", type: "Disallow" as const },
        ],
        crawlDelay: "",
      },
    ],
    sitemapUrl: "https://example.com/sitemap.xml",
  },
};

let idCounter = 10;
function nextId() {
  return String(++idCounter);
}

function createBlock(): UserAgentBlock {
  return {
    id: nextId(),
    userAgent: "*",
    customAgent: "",
    rules: [{ path: "/", type: "Disallow" }],
    crawlDelay: "",
  };
}

export default function RobotsTxtGenerator() {
  const [blocks, setBlocks] = useState<UserAgentBlock[]>([
    {
      id: "1",
      userAgent: "*",
      customAgent: "",
      rules: [{ path: "/", type: "Allow" }],
      crawlDelay: "",
    },
  ]);
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const updateBlock = useCallback(
    (blockId: string, updater: (b: UserAgentBlock) => UserAgentBlock) => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? updater(b) : b))
      );
    },
    []
  );

  const addBlock = useCallback(() => {
    setBlocks((prev) => [...prev, createBlock()]);
  }, []);

  const removeBlock = useCallback((blockId: string) => {
    setBlocks((prev) => (prev.length > 1 ? prev.filter((b) => b.id !== blockId) : prev));
  }, []);

  const addRule = useCallback((blockId: string) => {
    updateBlock(blockId, (b) => ({
      ...b,
      rules: [...b.rules, { path: "/", type: "Disallow" }],
    }));
  }, [updateBlock]);

  const removeRule = useCallback(
    (blockId: string, ruleIndex: number) => {
      updateBlock(blockId, (b) => ({
        ...b,
        rules: b.rules.length > 1 ? b.rules.filter((_, i) => i !== ruleIndex) : b.rules,
      }));
    },
    [updateBlock]
  );

  const applyPreset = useCallback((presetKey: keyof typeof PRESETS) => {
    const preset = PRESETS[presetKey];
    idCounter = 10;
    setBlocks(
      preset.blocks.map((b) => ({ ...b, id: nextId() }))
    );
    setSitemapUrl(preset.sitemapUrl);
  }, []);

  const generatedText = useMemo(() => {
    const lines: string[] = [];

    blocks.forEach((block, idx) => {
      if (idx > 0) lines.push("");
      const agent =
        block.userAgent === "__custom__" ? block.customAgent || "*" : block.userAgent;
      lines.push(`User-agent: ${agent}`);

      block.rules.forEach((rule) => {
        lines.push(`${rule.type}: ${rule.path}`);
      });

      if (block.crawlDelay && Number(block.crawlDelay) > 0) {
        lines.push(`Crawl-delay: ${block.crawlDelay}`);
      }
    });

    if (sitemapUrl.trim()) {
      lines.push("");
      lines.push(`Sitemap: ${sitemapUrl.trim()}`);
    }

    return lines.join("\n");
  }, [blocks, sitemapUrl]);

  const validationIssues = useMemo<ValidationIssue[]>(() => {
    const issues: ValidationIssue[] = [];

    const agents = blocks.map((b) =>
      b.userAgent === "__custom__" ? b.customAgent : b.userAgent
    );
    const duplicates = agents.filter((a, i) => agents.indexOf(a) !== i);
    if (duplicates.length > 0) {
      issues.push({
        level: "warning",
        message: `Duplicate user-agent: ${[...new Set(duplicates)].join(", ")}`,
      });
    }

    blocks.forEach((block) => {
      const agent =
        block.userAgent === "__custom__" ? block.customAgent : block.userAgent;
      if (!agent || agent.trim() === "") {
        issues.push({
          level: "error",
          message: "Empty user-agent name found",
        });
      }

      block.rules.forEach((rule) => {
        if (!rule.path.startsWith("/") && rule.path !== "") {
          issues.push({
            level: "error",
            message: `Path "${rule.path}" should start with /`,
          });
        }
        if (rule.path === "") {
          issues.push({
            level: "warning",
            message: `Empty path in ${agent} rules (equivalent to allowing all)`,
          });
        }
      });

      if (block.crawlDelay && (isNaN(Number(block.crawlDelay)) || Number(block.crawlDelay) < 0)) {
        issues.push({
          level: "error",
          message: `Invalid crawl-delay value: ${block.crawlDelay}`,
        });
      }
    });

    if (sitemapUrl.trim() && !sitemapUrl.trim().startsWith("http")) {
      issues.push({
        level: "error",
        message: "Sitemap URL should start with http:// or https://",
      });
    }

    const hasWildcard = blocks.some((b) => b.userAgent === "*");
    if (!hasWildcard) {
      issues.push({
        level: "warning",
        message: 'No wildcard (*) user-agent rule. Unmatched bots will have no directives.',
      });
    }

    return issues;
  }, [blocks, sitemapUrl]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedText]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([generatedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "robots.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [generatedText]);

  const highlightedPreview = useMemo(() => {
    return generatedText.split("\n").map((line, i) => {
      if (line.startsWith("User-agent:")) {
        const [dir, ...rest] = line.split(": ");
        return (
          <div key={i}>
            <span className="directive">{dir}:</span>{" "}
            <span className="user-agent">{rest.join(": ")}</span>
          </div>
        );
      }
      if (line.startsWith("Allow:") || line.startsWith("Disallow:") || line.startsWith("Crawl-delay:") || line.startsWith("Sitemap:")) {
        const [dir, ...rest] = line.split(": ");
        return (
          <div key={i}>
            <span className="directive">{dir}:</span>{" "}
            <span className="value">{rest.join(": ")}</span>
          </div>
        );
      }
      if (line.startsWith("#")) {
        return (
          <div key={i} className="comment">{line}</div>
        );
      }
      return <div key={i}>{line || "\u00A0"}</div>;
    });
  }, [generatedText]);

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Presets</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key as keyof typeof PRESETS)}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
              title={preset.description}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>

          {blocks.map((block, blockIdx) => (
            <div
              key={block.id}
              className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Rule Group {blockIdx + 1}
                </span>
                {blocks.length > 1 && (
                  <button
                    onClick={() => removeBlock(block.id)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* User-Agent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User-Agent
                </label>
                <select
                  value={block.userAgent}
                  onChange={(e) =>
                    updateBlock(block.id, (b) => ({
                      ...b,
                      userAgent: e.target.value,
                      customAgent:
                        e.target.value === "__custom__" ? b.customAgent : "",
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {PRESET_AGENTS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
                {block.userAgent === "__custom__" && (
                  <input
                    type="text"
                    value={block.customAgent}
                    onChange={(e) =>
                      updateBlock(block.id, (b) => ({
                        ...b,
                        customAgent: e.target.value,
                      }))
                    }
                    placeholder="Enter bot name..."
                    className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>

              {/* Rules */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rules
                </label>
                <div className="space-y-2">
                  {block.rules.map((rule, ruleIdx) => (
                    <div key={ruleIdx} className="flex items-center gap-2">
                      <select
                        value={rule.type}
                        onChange={(e) =>
                          updateBlock(block.id, (b) => ({
                            ...b,
                            rules: b.rules.map((r, i) =>
                              i === ruleIdx
                                ? { ...r, type: e.target.value as "Allow" | "Disallow" }
                                : r
                            ),
                          }))
                        }
                        className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Allow">Allow</option>
                        <option value="Disallow">Disallow</option>
                      </select>
                      <input
                        type="text"
                        value={rule.path}
                        onChange={(e) =>
                          updateBlock(block.id, (b) => ({
                            ...b,
                            rules: b.rules.map((r, i) =>
                              i === ruleIdx ? { ...r, path: e.target.value } : r
                            ),
                          }))
                        }
                        placeholder="/path"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {block.rules.length > 1 && (
                        <button
                          onClick={() => removeRule(block.id, ruleIdx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove rule"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addRule(block.id)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  + Add Rule
                </button>
              </div>

              {/* Crawl-delay */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crawl-delay (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={block.crawlDelay}
                  onChange={(e) =>
                    updateBlock(block.id, (b) => ({
                      ...b,
                      crawlDelay: e.target.value,
                    }))
                  }
                  placeholder="Optional"
                  className="w-32 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          ))}

          <button
            onClick={addBlock}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            + Add User-Agent Group
          </button>

          {/* Sitemap */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sitemap URL
            </label>
            <input
              type="url"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              placeholder="https://example.com/sitemap.xml"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 checkmark-animate" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>

          {/* Syntax highlighted preview */}
          <div className="robots-preview bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm leading-relaxed min-h-[200px] overflow-x-auto">
            {highlightedPreview}
          </div>

          {/* Validation */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Validation</h3>
            {validationIssues.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No issues found. Your robots.txt looks good.
              </div>
            ) : (
              <ul className="space-y-1.5">
                {validationIssues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    {issue.level === "error" ? (
                      <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )}
                    <span className={issue.level === "error" ? "text-red-700" : "text-yellow-700"}>
                      {issue.message}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
