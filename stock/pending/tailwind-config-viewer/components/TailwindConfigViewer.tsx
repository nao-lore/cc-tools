"use client";

import { useState, useMemo, useCallback } from "react";

// --- Default Tailwind theme (subset of v3 defaults) ---

const DEFAULT_CONFIG = `{
  "theme": {
    "colors": {
      "transparent": "transparent",
      "current": "currentColor",
      "black": "#000000",
      "white": "#ffffff",
      "slate": {
        "50": "#f8fafc", "100": "#f1f5f9", "200": "#e2e8f0",
        "300": "#cbd5e1", "400": "#94a3b8", "500": "#64748b",
        "600": "#475569", "700": "#334155", "800": "#1e293b", "900": "#0f172a"
      },
      "blue": {
        "50": "#eff6ff", "100": "#dbeafe", "200": "#bfdbfe",
        "300": "#93c5fd", "400": "#60a5fa", "500": "#3b82f6",
        "600": "#2563eb", "700": "#1d4ed8", "800": "#1e40af", "900": "#1e3a8a"
      },
      "green": {
        "50": "#f0fdf4", "100": "#dcfce7", "200": "#bbf7d0",
        "300": "#86efac", "400": "#4ade80", "500": "#22c55e",
        "600": "#16a34a", "700": "#15803d", "800": "#166534", "900": "#14532d"
      },
      "red": {
        "50": "#fef2f2", "100": "#fee2e2", "200": "#fecaca",
        "300": "#fca5a5", "400": "#f87171", "500": "#ef4444",
        "600": "#dc2626", "700": "#b91c1c", "800": "#991b1b", "900": "#7f1d1d"
      },
      "yellow": {
        "50": "#fefce8", "100": "#fef9c3", "200": "#fef08a",
        "300": "#fde047", "400": "#facc15", "500": "#eab308",
        "600": "#ca8a04", "700": "#a16207", "800": "#854d0e", "900": "#713f12"
      },
      "purple": {
        "50": "#faf5ff", "100": "#f3e8ff", "200": "#e9d5ff",
        "300": "#d8b4fe", "400": "#c084fc", "500": "#a855f7",
        "600": "#9333ea", "700": "#7e22ce", "800": "#6b21a8", "900": "#581c87"
      }
    },
    "spacing": {
      "0": "0px", "1": "0.25rem", "2": "0.5rem", "3": "0.75rem",
      "4": "1rem", "5": "1.25rem", "6": "1.5rem", "8": "2rem",
      "10": "2.5rem", "12": "3rem", "16": "4rem", "20": "5rem",
      "24": "6rem", "32": "8rem", "40": "10rem", "48": "12rem",
      "56": "14rem", "64": "16rem", "72": "18rem", "80": "20rem", "96": "24rem"
    },
    "fontSize": {
      "xs": ["0.75rem", { "lineHeight": "1rem" }],
      "sm": ["0.875rem", { "lineHeight": "1.25rem" }],
      "base": ["1rem", { "lineHeight": "1.5rem" }],
      "lg": ["1.125rem", { "lineHeight": "1.75rem" }],
      "xl": ["1.25rem", { "lineHeight": "1.75rem" }],
      "2xl": ["1.5rem", { "lineHeight": "2rem" }],
      "3xl": ["1.875rem", { "lineHeight": "2.25rem" }],
      "4xl": ["2.25rem", { "lineHeight": "2.5rem" }],
      "5xl": ["3rem", { "lineHeight": "1" }],
      "6xl": ["3.75rem", { "lineHeight": "1" }]
    },
    "borderRadius": {
      "none": "0px",
      "sm": "0.125rem",
      "DEFAULT": "0.25rem",
      "md": "0.375rem",
      "lg": "0.5rem",
      "xl": "0.75rem",
      "2xl": "1rem",
      "3xl": "1.5rem",
      "full": "9999px"
    },
    "boxShadow": {
      "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "DEFAULT": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      "md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
      "inner": "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
      "none": "none"
    }
  }
}`;

// --- Types ---

interface ParsedTheme {
  colors: ColorToken[];
  spacing: SimpleToken[];
  fontSize: FontSizeToken[];
  borderRadius: SimpleToken[];
  boxShadow: SimpleToken[];
}

interface ColorToken {
  key: string;
  value: string;
  group?: string;
}

interface SimpleToken {
  key: string;
  value: string;
}

interface FontSizeToken {
  key: string;
  size: string;
  lineHeight?: string;
}

// --- Parse helpers ---

function flattenColors(obj: unknown, prefix = ""): ColorToken[] {
  if (typeof obj === "string") {
    return [{ key: prefix, value: obj }];
  }
  if (typeof obj !== "object" || obj === null) return [];
  const result: ColorToken[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const fullKey = prefix ? `${prefix}-${k}` : k;
    if (typeof v === "string") {
      result.push({ key: fullKey, value: v, group: prefix || k });
    } else if (typeof v === "object" && v !== null) {
      result.push(...flattenColors(v, fullKey));
    }
  }
  return result;
}

function flattenSimple(obj: unknown): SimpleToken[] {
  if (typeof obj !== "object" || obj === null) return [];
  return Object.entries(obj as Record<string, unknown>)
    .filter(([, v]) => typeof v === "string")
    .map(([k, v]) => ({ key: k, value: v as string }));
}

function flattenFontSize(obj: unknown): FontSizeToken[] {
  if (typeof obj !== "object" || obj === null) return [];
  return Object.entries(obj as Record<string, unknown>).map(([k, v]) => {
    if (typeof v === "string") return { key: k, size: v };
    if (Array.isArray(v)) {
      const size = typeof v[0] === "string" ? v[0] : "";
      const lh =
        typeof v[1] === "object" && v[1] !== null
          ? (v[1] as Record<string, string>).lineHeight
          : typeof v[1] === "string"
          ? v[1]
          : undefined;
      return { key: k, size, lineHeight: lh };
    }
    return { key: k, size: "" };
  });
}

function parseConfig(raw: string): { theme: ParsedTheme; error: string | null } {
  const empty: ParsedTheme = {
    colors: [],
    spacing: [],
    fontSize: [],
    borderRadius: [],
    boxShadow: [],
  };
  try {
    const parsed = JSON.parse(raw);
    const theme = parsed?.theme ?? parsed;
    return {
      theme: {
        colors: flattenColors(theme?.colors ?? {}),
        spacing: flattenSimple(theme?.spacing ?? {}),
        fontSize: flattenFontSize(theme?.fontSize ?? {}),
        borderRadius: flattenSimple(theme?.borderRadius ?? {}),
        boxShadow: flattenSimple(theme?.boxShadow ?? {}),
      },
      error: null,
    };
  } catch (e) {
    return { theme: empty, error: (e as Error).message };
  }
}

// --- Helpers ---

function isLightColor(hex: string): boolean {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return true;
  const n = parseInt(clean, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 128;
}

function isHex(val: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val.trim());
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// --- Sub-components ---

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    copyToClipboard(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <button
      onClick={handle}
      className="text-xs px-2 py-0.5 rounded border border-border bg-background hover:bg-surface text-muted hover:text-foreground transition-colors font-mono shrink-0"
      title={`Copy ${value}`}
    >
      {copied ? "✓" : label ?? "copy"}
    </button>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <span className="text-xs font-mono text-muted bg-surface border border-border rounded-full px-2 py-0.5">
        {count}
      </span>
    </div>
  );
}

// --- Section: Colors ---

function ColorsSection({ tokens, search }: { tokens: ColorToken[]; search: string }) {
  const filtered = useMemo(() => {
    if (!search.trim()) return tokens;
    const q = search.toLowerCase();
    return tokens.filter(
      (t) => t.key.toLowerCase().includes(q) || t.value.toLowerCase().includes(q)
    );
  }, [tokens, search]);

  if (tokens.length === 0) return null;

  // Group by top-level color family
  const groups = useMemo(() => {
    const map = new Map<string, ColorToken[]>();
    for (const t of filtered) {
      const parts = t.key.split("-");
      const groupKey = parts.length > 1 ? parts.slice(0, -1).join("-") : t.key;
      if (!map.has(groupKey)) map.set(groupKey, []);
      map.get(groupKey)!.push(t);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <section>
      <SectionHeader title="Colors" count={filtered.length} />
      <div className="space-y-4">
        {groups.map(([group, items]) => (
          <div key={group}>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 capitalize">
              {group}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((t) => {
                const hex = isHex(t.value) ? t.value : null;
                const textCol = hex
                  ? isLightColor(hex)
                    ? "#111827"
                    : "#f9fafb"
                  : undefined;
                return (
                  <div
                    key={t.key}
                    className="group relative flex flex-col items-center gap-1"
                    title={`${t.key}: ${t.value}`}
                  >
                    {hex ? (
                      <div
                        className="w-10 h-10 rounded-lg border border-border/50 shadow-sm flex items-end justify-end p-0.5"
                        style={{ backgroundColor: hex }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg border border-dashed border-border flex items-center justify-center text-xs text-muted">
                        {t.value === "transparent" ? "transp" : t.value.slice(0, 4)}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted font-mono truncate max-w-[72px]">
                        {t.key.split("-").pop()}
                      </span>
                      <CopyButton value={t.value} label="⧉" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Section: Spacing ---

function SpacingSection({ tokens, search }: { tokens: SimpleToken[]; search: string }) {
  const filtered = useMemo(() => {
    if (!search.trim()) return tokens;
    const q = search.toLowerCase();
    return tokens.filter(
      (t) => t.key.toLowerCase().includes(q) || t.value.toLowerCase().includes(q)
    );
  }, [tokens, search]);

  if (tokens.length === 0) return null;

  const MAX_REM = 10;
  const maxVal = Math.max(
    ...filtered.map((t) => {
      const rem = parseFloat(t.value);
      return isNaN(rem) ? 0 : rem;
    }),
    1
  );

  return (
    <section>
      <SectionHeader title="Spacing" count={filtered.length} />
      <div className="space-y-2">
        {filtered.map((t) => {
          const rem = parseFloat(t.value);
          const px = isNaN(rem) ? 0 : rem * 16;
          const pct = isNaN(rem) ? 0 : Math.min((rem / Math.min(maxVal, MAX_REM)) * 100, 100);
          return (
            <div key={t.key} className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted w-8 shrink-0 text-right">{t.key}</span>
              <div className="flex-1 bg-surface border border-border rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-accent/60 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-mono text-foreground w-16 shrink-0">{t.value}</span>
              {!isNaN(px) && px > 0 && (
                <span className="text-xs font-mono text-muted w-12 shrink-0">{px}px</span>
              )}
              <CopyButton value={t.value} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

// --- Section: Font Sizes ---

function FontSizeSection({ tokens, search }: { tokens: FontSizeToken[]; search: string }) {
  const filtered = useMemo(() => {
    if (!search.trim()) return tokens;
    const q = search.toLowerCase();
    return tokens.filter(
      (t) => t.key.toLowerCase().includes(q) || t.size.toLowerCase().includes(q)
    );
  }, [tokens, search]);

  if (tokens.length === 0) return null;

  return (
    <section>
      <SectionHeader title="Font Sizes" count={filtered.length} />
      <div className="space-y-3">
        {filtered.map((t) => (
          <div
            key={t.key}
            className="flex items-baseline gap-4 bg-surface border border-border rounded-xl px-4 py-3"
          >
            <span
              className="font-semibold text-foreground shrink-0"
              style={{ fontSize: t.size, lineHeight: t.lineHeight ?? "1.5" }}
            >
              Aa
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono text-foreground">{t.key}</p>
              <p className="text-xs font-mono text-muted">
                {t.size}
                {t.lineHeight ? ` / ${t.lineHeight}` : ""}
              </p>
            </div>
            <CopyButton value={t.size} />
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Section: Border Radius ---

function BorderRadiusSection({ tokens, search }: { tokens: SimpleToken[]; search: string }) {
  const filtered = useMemo(() => {
    if (!search.trim()) return tokens;
    const q = search.toLowerCase();
    return tokens.filter(
      (t) => t.key.toLowerCase().includes(q) || t.value.toLowerCase().includes(q)
    );
  }, [tokens, search]);

  if (tokens.length === 0) return null;

  return (
    <section>
      <SectionHeader title="Border Radius" count={filtered.length} />
      <div className="flex flex-wrap gap-4">
        {filtered.map((t) => (
          <div key={t.key} className="flex flex-col items-center gap-2">
            <div
              className="w-14 h-14 bg-accent/20 border-2 border-accent/50"
              style={{ borderRadius: t.value === "9999px" ? "9999px" : t.value }}
            />
            <div className="text-center">
              <p className="text-xs font-mono text-foreground">{t.key}</p>
              <p className="text-xs font-mono text-muted">{t.value}</p>
              <CopyButton value={t.value} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Section: Box Shadows ---

function BoxShadowSection({ tokens, search }: { tokens: SimpleToken[]; search: string }) {
  const filtered = useMemo(() => {
    if (!search.trim()) return tokens;
    const q = search.toLowerCase();
    return tokens.filter(
      (t) => t.key.toLowerCase().includes(q) || t.value.toLowerCase().includes(q)
    );
  }, [tokens, search]);

  if (tokens.length === 0) return null;

  return (
    <section>
      <SectionHeader title="Shadows" count={filtered.length} />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((t) => (
          <div key={t.key} className="flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 bg-background rounded-xl"
              style={{ boxShadow: t.value === "none" ? "none" : t.value }}
            />
            <div className="text-center space-y-1 w-full">
              <p className="text-xs font-mono text-foreground">{t.key}</p>
              <p
                className="text-xs font-mono text-muted break-all leading-tight"
                style={{ fontSize: "0.65rem" }}
              >
                {t.value.slice(0, 40)}
                {t.value.length > 40 ? "…" : ""}
              </p>
              <CopyButton value={t.value} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Tabs ---

type Tab = "colors" | "spacing" | "fontSize" | "borderRadius" | "boxShadow";

const TABS: { id: Tab; label: string }[] = [
  { id: "colors", label: "Colors" },
  { id: "spacing", label: "Spacing" },
  { id: "fontSize", label: "Font Sizes" },
  { id: "borderRadius", label: "Border Radius" },
  { id: "boxShadow", label: "Shadows" },
];

// --- Main component ---

export default function TailwindConfigViewer() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<Tab>("colors");
  const [search, setSearch] = useState("");

  const { theme, error } = useMemo(() => parseConfig(config), [config]);

  const totalTokens =
    theme.colors.length +
    theme.spacing.length +
    theme.fontSize.length +
    theme.borderRadius.length +
    theme.boxShadow.length;

  const tabCount = useCallback(
    (tab: Tab): number => {
      if (tab === "colors") return theme.colors.length;
      if (tab === "spacing") return theme.spacing.length;
      if (tab === "fontSize") return theme.fontSize.length;
      if (tab === "borderRadius") return theme.borderRadius.length;
      if (tab === "boxShadow") return theme.boxShadow.length;
      return 0;
    },
    [theme]
  );

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setSearch("");
  };

  return (
    <div className="space-y-6">
      {/* Config input */}
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
            Tailwind Config (theme section as JSON)
          </h2>
          <div className="flex items-center gap-2">
            {!error && totalTokens > 0 && (
              <span className="text-xs font-mono text-muted bg-background border border-border rounded-full px-2 py-0.5">
                {totalTokens} tokens
              </span>
            )}
            <button
              onClick={handleReset}
              className="text-xs text-muted hover:text-foreground transition-colors underline underline-offset-2"
            >
              Reset to default
            </button>
          </div>
        </div>

        <textarea
          value={config}
          onChange={(e) => {
            setConfig(e.target.value);
            setSearch("");
          }}
          rows={10}
          spellCheck={false}
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-y"
          placeholder='Paste your Tailwind config JSON here (the "theme" section)...'
          aria-label="Tailwind config JSON input"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-mono text-red-700">
            Parse error: {error}
          </div>
        )}
      </div>

      {!error && totalTokens > 0 && (
        <>
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tokens..."
              className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              aria-label="Search tokens"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-sm text-muted hover:text-foreground transition-colors px-3"
              >
                Clear
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 overflow-x-auto">
            {TABS.map((tab) => {
              const count = tabCount(tab.id);
              if (count === 0) return null;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-max flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  <span className="text-xs font-mono opacity-60">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            {activeTab === "colors" && (
              <ColorsSection tokens={theme.colors} search={search} />
            )}
            {activeTab === "spacing" && (
              <SpacingSection tokens={theme.spacing} search={search} />
            )}
            {activeTab === "fontSize" && (
              <FontSizeSection tokens={theme.fontSize} search={search} />
            )}
            {activeTab === "borderRadius" && (
              <BorderRadiusSection tokens={theme.borderRadius} search={search} />
            )}
            {activeTab === "boxShadow" && (
              <BoxShadowSection tokens={theme.boxShadow} search={search} />
            )}
          </div>

          {/* Ad placeholder */}
          <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
            Advertisement
          </div>
        </>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Tailwind Config Viewer tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Paste a Tailwind config and browse all generated tokens. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Tailwind Config Viewer tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Paste a Tailwind config and browse all generated tokens. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
