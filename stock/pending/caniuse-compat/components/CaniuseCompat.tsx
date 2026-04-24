"use client";

import { useState, useMemo } from "react";

// --- Types ---

interface BrowserSupport {
  chrome: string;
  firefox: string;
  safari: string;
  edge: string;
}

interface Feature {
  name: string;
  category: string;
  support: BrowserSupport;
  notes: string;
  polyfill?: string;
  mdn?: string;
}

// --- Feature Data ---

const FEATURES: Feature[] = [
  // CSS Layout
  {
    name: "CSS Container Queries",
    category: "CSS Layout",
    support: { chrome: "105", firefox: "110", safari: "16", edge: "105" },
    notes: "Query parent container size instead of viewport. Use @container rule.",
    polyfill: "container-query-polyfill (Google)",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_container_queries",
  },
  {
    name: "CSS Subgrid",
    category: "CSS Layout",
    support: { chrome: "117", firefox: "71", safari: "16", edge: "117" },
    notes: "Grid items can participate in parent grid tracks via grid-template-columns: subgrid.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid",
  },
  {
    name: "CSS Grid Layout",
    category: "CSS Layout",
    support: { chrome: "57", firefox: "52", safari: "10.1", edge: "16" },
    notes: "Two-dimensional layout system. Widely supported.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout",
  },
  {
    name: "CSS Flexbox",
    category: "CSS Layout",
    support: { chrome: "29", firefox: "28", safari: "9", edge: "12" },
    notes: "One-dimensional layout. Fully supported across all modern browsers.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout",
  },
  {
    name: "CSS Masonry Layout",
    category: "CSS Layout",
    support: { chrome: "No", firefox: "No", safari: "17.4", edge: "No" },
    notes: "grid-template-rows: masonry. Experimental. Only in Safari and Firefox behind flag.",
    polyfill: "Use JavaScript masonry libraries (Masonry.js, Muuri)",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Masonry_layout",
  },
  // CSS Selectors
  {
    name: ":has() Selector",
    category: "CSS Selectors",
    support: { chrome: "105", firefox: "121", safari: "15.4", edge: "105" },
    notes: "Relational pseudo-class. Select element based on its descendants.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/:has",
  },
  {
    name: ":is() Selector",
    category: "CSS Selectors",
    support: { chrome: "88", firefox: "78", safari: "14", edge: "88" },
    notes: "Takes a forgiving selector list. Simplifies complex selectors.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/:is",
  },
  {
    name: ":where() Selector",
    category: "CSS Selectors",
    support: { chrome: "88", firefox: "78", safari: "14", edge: "88" },
    notes: "Like :is() but contributes zero specificity.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/:where",
  },
  {
    name: ":not() with complex args",
    category: "CSS Selectors",
    support: { chrome: "88", firefox: "84", safari: "9", edge: "88" },
    notes: "Level 4 :not() accepts complex selectors. Earlier only simple selectors.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/:not",
  },
  // CSS At-Rules
  {
    name: "@layer (Cascade Layers)",
    category: "CSS At-Rules",
    support: { chrome: "99", firefox: "97", safari: "15.4", edge: "99" },
    notes: "Declare cascade layers for explicit style ordering. Reduces specificity wars.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/@layer",
  },
  {
    name: "CSS Nesting",
    category: "CSS At-Rules",
    support: { chrome: "112", firefox: "117", safari: "16.5", edge: "112" },
    notes: "Native CSS nesting without preprocessors. Uses & selector.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting",
  },
  {
    name: "@scope",
    category: "CSS At-Rules",
    support: { chrome: "118", firefox: "No", safari: "17.4", edge: "118" },
    notes: "Limit styles to a specific DOM subtree. Firefox support in progress.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/@scope",
  },
  {
    name: "@property (Houdini)",
    category: "CSS At-Rules",
    support: { chrome: "85", firefox: "128", safari: "16.4", edge: "85" },
    notes: "Register custom properties with type, inheritance, and initial value.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/@property",
  },
  // CSS Colors
  {
    name: "color-mix()",
    category: "CSS Colors",
    support: { chrome: "111", firefox: "113", safari: "16.2", edge: "111" },
    notes: "Mix two colors in a given colorspace. e.g. color-mix(in srgb, red 50%, blue).",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix",
  },
  {
    name: "oklch() / oklab()",
    category: "CSS Colors",
    support: { chrome: "111", firefox: "113", safari: "15.4", edge: "111" },
    notes: "Perceptually uniform color spaces. Better for gradients and accessibility.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch",
  },
  {
    name: "color() Function",
    category: "CSS Colors",
    support: { chrome: "111", firefox: "113", safari: "15", edge: "111" },
    notes: "Access wide-gamut color spaces like display-p3, rec2020.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color",
  },
  {
    name: "Relative Color Syntax",
    category: "CSS Colors",
    support: { chrome: "119", firefox: "128", safari: "16.4", edge: "119" },
    notes: "Derive colors from existing values. e.g. oklch(from var(--color) l c h).",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors",
  },
  // CSS Animations
  {
    name: "View Transitions API",
    category: "CSS Animations",
    support: { chrome: "111", firefox: "No", safari: "18", edge: "111" },
    notes: "Animate between page states with document.startViewTransition(). Firefox support pending.",
    polyfill: "@view-transitions polyfill (limited)",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API",
  },
  {
    name: "Scroll-Driven Animations",
    category: "CSS Animations",
    support: { chrome: "115", firefox: "No", safari: "No", edge: "115" },
    notes: "animation-timeline: scroll(). Animate based on scroll position. Limited support.",
    polyfill: "scroll-driven-animations polyfill (Google)",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline",
  },
  {
    name: "CSS Transitions",
    category: "CSS Animations",
    support: { chrome: "26", firefox: "16", safari: "9", edge: "12" },
    notes: "Animate CSS property changes. Fully supported everywhere.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions",
  },
  {
    name: "CSS Animations",
    category: "CSS Animations",
    support: { chrome: "43", firefox: "16", safari: "9", edge: "12" },
    notes: "@keyframes animations. Fully supported in all modern browsers.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations",
  },
  // HTML Elements
  {
    name: "<dialog> Element",
    category: "HTML Elements",
    support: { chrome: "37", firefox: "98", safari: "15.4", edge: "79" },
    notes: "Native modal/dialog element with showModal() and close() methods.",
    polyfill: "dialog-polyfill (Google)",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog",
  },
  {
    name: "Popover API",
    category: "HTML Elements",
    support: { chrome: "114", firefox: "125", safari: "17", edge: "114" },
    notes: "popover attribute enables native popover behavior without JavaScript.",
    polyfill: "@oddbird/popover-polyfill",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/API/Popover_API",
  },
  {
    name: "<details> / <summary>",
    category: "HTML Elements",
    support: { chrome: "12", firefox: "49", safari: "6", edge: "79" },
    notes: "Native disclosure widget. No JavaScript needed for toggle.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details",
  },
  {
    name: "<picture> Element",
    category: "HTML Elements",
    support: { chrome: "38", firefox: "38", safari: "9.1", edge: "13" },
    notes: "Art direction and responsive images with multiple source elements.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture",
  },
  {
    name: "Lazy Loading (loading=lazy)",
    category: "HTML Elements",
    support: { chrome: "77", firefox: "75", safari: "15.4", edge: "79" },
    notes: "Native lazy loading for images and iframes. loading='lazy' attribute.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/loading",
  },
  // CSS Typography
  {
    name: "text-wrap: balance",
    category: "CSS Typography",
    support: { chrome: "114", firefox: "121", safari: "17.5", edge: "114" },
    notes: "Balance text across lines to avoid orphans. Great for headings.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap",
  },
  {
    name: "text-wrap: pretty",
    category: "CSS Typography",
    support: { chrome: "117", firefox: "No", safari: "No", edge: "117" },
    notes: "Prevent orphaned words on last line. Chrome only for now.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap",
  },
  {
    name: "Variable Fonts",
    category: "CSS Typography",
    support: { chrome: "66", firefox: "62", safari: "11", edge: "17" },
    notes: "font-variation-settings for axes like weight, width, slant in one file.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fonts/Variable_fonts_guide",
  },
  {
    name: "font-display",
    category: "CSS Typography",
    support: { chrome: "72", firefox: "58", safari: "11.1", edge: "79" },
    notes: "Control font loading behavior. swap, block, fallback, optional.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display",
  },
  // CSS Values
  {
    name: "CSS Custom Properties (vars)",
    category: "CSS Values",
    support: { chrome: "49", firefox: "31", safari: "9.1", edge: "15" },
    notes: "--custom-property syntax. Widely supported. Use @property for typed registration.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/--*",
  },
  {
    name: "CSS math functions (min/max/clamp)",
    category: "CSS Values",
    support: { chrome: "79", firefox: "75", safari: "11.1", edge: "79" },
    notes: "min(), max(), clamp() for responsive sizing without media queries.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/min",
  },
  {
    name: "CSS calc()",
    category: "CSS Values",
    support: { chrome: "26", firefox: "16", safari: "7", edge: "12" },
    notes: "Mathematical expressions in CSS values. Fully supported.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/calc",
  },
  {
    name: "Logical Properties",
    category: "CSS Values",
    support: { chrome: "89", firefox: "41", safari: "15", edge: "89" },
    notes: "margin-inline, padding-block, border-start. Writing-mode aware alternatives.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values",
  },
  // CSS Scroll
  {
    name: "CSS Scroll Snap",
    category: "CSS Scroll",
    support: { chrome: "69", firefox: "68", safari: "11", edge: "79" },
    notes: "scroll-snap-type and scroll-snap-align. Native carousel-like scrolling.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll_snap",
  },
  {
    name: "overscroll-behavior",
    category: "CSS Scroll",
    support: { chrome: "63", firefox: "59", safari: "16", edge: "18" },
    notes: "Control scroll chaining. overscroll-behavior: contain prevents parent scroll.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior",
  },
  // Web APIs
  {
    name: "Intersection Observer",
    category: "Web APIs",
    support: { chrome: "51", firefox: "55", safari: "12.1", edge: "15" },
    notes: "Observe element visibility. Use for lazy load, infinite scroll, animations.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API",
  },
  {
    name: "ResizeObserver",
    category: "Web APIs",
    support: { chrome: "64", firefox: "69", safari: "13.1", edge: "79" },
    notes: "Observe element size changes. Basis for container queries polyfills.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver",
  },
  {
    name: "Web Animations API",
    category: "Web APIs",
    support: { chrome: "36", firefox: "48", safari: "13.1", edge: "79" },
    notes: "element.animate(). Programmatic animations with full timeline control.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API",
  },
  {
    name: "CSS Houdini Paint API",
    category: "Web APIs",
    support: { chrome: "65", firefox: "No", safari: "No", edge: "79" },
    notes: "CSS.paintWorklet. Custom CSS paint functions. Limited to Chrome/Edge.",
    polyfill: "css-paint-polyfill (limited fidelity)",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/API/CSS_Painting_API",
  },
  // CSS Filters & Effects
  {
    name: "backdrop-filter",
    category: "CSS Filters & Effects",
    support: { chrome: "76", firefox: "103", safari: "9", edge: "17" },
    notes: "Apply blur, brightness etc. to area behind element. Glassmorphism effect.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter",
  },
  {
    name: "CSS filter()",
    category: "CSS Filters & Effects",
    support: { chrome: "53", firefox: "35", safari: "9.1", edge: "12" },
    notes: "blur(), brightness(), contrast(), drop-shadow() etc. on elements.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/filter",
  },
  {
    name: "mix-blend-mode",
    category: "CSS Filters & Effects",
    support: { chrome: "41", firefox: "32", safari: "8", edge: "79" },
    notes: "Blend element with content behind it. multiply, screen, overlay, etc.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode",
  },
  // CSS Sizing
  {
    name: "aspect-ratio",
    category: "CSS Sizing",
    support: { chrome: "88", firefox: "89", safari: "15", edge: "88" },
    notes: "aspect-ratio: 16/9. Native ratio without padding hack.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio",
  },
  {
    name: "gap (Grid & Flex)",
    category: "CSS Sizing",
    support: { chrome: "66", firefox: "61", safari: "12", edge: "16" },
    notes: "row-gap, column-gap, gap shorthand for both grid and flexbox.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/gap",
  },
  {
    name: "fit-content / min-content / max-content",
    category: "CSS Sizing",
    support: { chrome: "46", firefox: "66", safari: "11", edge: "79" },
    notes: "Intrinsic sizing keywords for width, height, grid tracks.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/fit-content",
  },
  // CSS Transforms
  {
    name: "Individual Transform Properties",
    category: "CSS Transforms",
    support: { chrome: "104", firefox: "72", safari: "14.1", edge: "104" },
    notes: "translate, rotate, scale as individual CSS properties (not in transform shorthand).",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/translate",
  },
  {
    name: "3D Transforms",
    category: "CSS Transforms",
    support: { chrome: "36", firefox: "16", safari: "9", edge: "12" },
    notes: "rotateX(), rotateY(), perspective(). Fully supported.",
    mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/transform",
  },
];

const CATEGORIES = Array.from(new Set(FEATURES.map((f) => f.category)));

// --- Support badge ---

type SupportLevel = "full" | "partial" | "none";

function getSupportLevel(version: string): SupportLevel {
  if (version === "No") return "none";
  const num = parseFloat(version);
  if (isNaN(num)) return "none";
  return num > 0 ? "full" : "none";
}

interface BadgeProps {
  version: string;
  browser: string;
}

const BROWSER_ICONS: Record<string, string> = {
  chrome: "C",
  firefox: "F",
  safari: "S",
  edge: "E",
};

function SupportBadge({ version, browser }: BadgeProps) {
  const level = getSupportLevel(version);

  const colors: Record<SupportLevel, string> = {
    full: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    partial: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    none: "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  };

  return (
    <div className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg border text-xs font-medium ${colors[level]}`}>
      <span className="font-bold text-[10px] uppercase tracking-wide opacity-70">
        {BROWSER_ICONS[browser]}
      </span>
      <span className="font-mono text-[11px] leading-none">
        {version === "No" ? "✗" : version}
      </span>
    </div>
  );
}

// --- Feature row ---

interface FeatureRowProps {
  feature: Feature;
  isExpanded: boolean;
  onToggle: () => void;
}

function FeatureRow({ feature, isExpanded, onToggle }: FeatureRowProps) {
  const browsers = ["chrome", "firefox", "safari", "edge"] as const;
  const supportValues = browsers.map((b) => feature.support[b]);
  const noneCount = supportValues.filter((v) => v === "No").length;
  const allSupported = noneCount === 0;
  const noneSupported = noneCount === 4;

  const statusDot = noneSupported
    ? "bg-red-500"
    : noneCount > 1
    ? "bg-amber-400"
    : allSupported
    ? "bg-emerald-500"
    : "bg-amber-400";

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-hover transition-colors text-left"
      >
        {/* Status dot */}
        <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot}`} />

        {/* Feature name */}
        <span className="flex-1 text-sm font-medium text-foreground">{feature.name}</span>

        {/* Support badges */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          {browsers.map((b) => (
            <SupportBadge key={b} version={feature.support[b]} browser={b} />
          ))}
        </div>

        {/* Expand chevron */}
        <svg
          className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Mobile badges */}
      <div className="sm:hidden px-4 pb-2 flex items-center gap-1.5">
        {browsers.map((b) => (
          <SupportBadge key={b} version={feature.support[b]} browser={b} />
        ))}
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-sm text-muted leading-relaxed">{feature.notes}</p>

          {feature.polyfill && (
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                Polyfill:
              </span>
              <span className="text-xs text-muted">{feature.polyfill}</span>
            </div>
          )}

          {feature.mdn && (
            <a
              href={feature.mdn}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              MDN Docs
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// --- Main component ---

export default function CaniuseCompat() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (name: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return FEATURES.filter((f) => {
      const matchesCategory = selectedCategory === "All" || f.category === selectedCategory;
      const matchesQuery =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.notes.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory]);

  const grouped = useMemo(() => {
    const map: Record<string, Feature[]> = {};
    for (const f of filtered) {
      if (!map[f.category]) map[f.category] = [];
      map[f.category].push(f);
    }
    return map;
  }, [filtered]);

  const browsers = ["chrome", "firefox", "safari", "edge"] as const;
  const BROWSER_LABELS: Record<string, string> = {
    chrome: "Chrome",
    firefox: "Firefox",
    safari: "Safari",
    edge: "Edge",
  };

  return (
    <div className="space-y-6">
      {/* Search & filter */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search features... (e.g. container, :has, dialog)"
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-accent text-white"
                  : "bg-background border border-border text-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted px-1">
        <span className="font-medium text-foreground">Support key:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Supported (version number shown)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Not supported
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-[10px]">C F S E</span>
          = Chrome, Firefox, Safari, Edge
        </span>
      </div>

      {/* Browser header */}
      <div className="hidden sm:flex items-center gap-3 px-4 text-xs text-muted">
        <span className="w-2 h-2 shrink-0" />
        <span className="flex-1 font-medium">Feature</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {browsers.map((b) => (
            <div key={b} className="w-[52px] text-center font-semibold">
              {BROWSER_LABELS[b]}
            </div>
          ))}
        </div>
        <span className="w-4" />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border px-4 py-10 text-center">
          <p className="text-muted text-sm">No features found for &ldquo;{query}&rdquo;</p>
        </div>
      ) : (
        Object.entries(grouped).map(([category, features]) => (
          <div key={category} className="bg-surface rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">{category}</h2>
              <span className="text-xs text-muted">{features.length} feature{features.length !== 1 ? "s" : ""}</span>
            </div>
            <div>
              {features.map((feature) => (
                <FeatureRow
                  key={feature.name}
                  feature={feature}
                  isExpanded={expandedIds.has(feature.name)}
                  onToggle={() => toggleExpanded(feature.name)}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this CSS Feature Compatibility Checker tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Check browser support for CSS properties and HTML features. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this CSS Feature Compatibility Checker tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Check browser support for CSS properties and HTML features. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CSS Feature Compatibility Checker",
  "description": "Check browser support for CSS properties and HTML features",
  "url": "https://tools.loresync.dev/caniuse-compat",
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
