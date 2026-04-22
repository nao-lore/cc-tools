// CSS property -> Tailwind class mappings
// Covers top 60+ most-used CSS properties

export interface CssToTwEntry {
  property: string;
  values: Record<string, string>;
  /** For properties that use a numeric scale like spacing */
  pattern?: {
    regex: RegExp;
    toTw: (match: RegExpMatchArray) => string | null;
  };
}

// Spacing scale: px value -> Tailwind unit
const spacingMap: Record<string, string> = {
  "0": "0",
  "0px": "0",
  "1px": "px",
  "0.125rem": "0.5",
  "2px": "0.5",
  "0.25rem": "1",
  "4px": "1",
  "0.375rem": "1.5",
  "6px": "1.5",
  "0.5rem": "2",
  "8px": "2",
  "0.625rem": "2.5",
  "10px": "2.5",
  "0.75rem": "3",
  "12px": "3",
  "0.875rem": "3.5",
  "14px": "3.5",
  "1rem": "4",
  "16px": "4",
  "1.25rem": "5",
  "20px": "5",
  "1.5rem": "6",
  "24px": "6",
  "1.75rem": "7",
  "28px": "7",
  "2rem": "8",
  "32px": "8",
  "2.25rem": "9",
  "36px": "9",
  "2.5rem": "10",
  "40px": "10",
  "2.75rem": "11",
  "44px": "11",
  "3rem": "12",
  "48px": "12",
  "3.5rem": "14",
  "56px": "14",
  "4rem": "16",
  "64px": "16",
  "5rem": "20",
  "80px": "20",
  "6rem": "24",
  "96px": "24",
  "7rem": "28",
  "112px": "28",
  "8rem": "32",
  "128px": "32",
  "9rem": "36",
  "144px": "36",
  "10rem": "40",
  "160px": "40",
  "11rem": "44",
  "176px": "44",
  "12rem": "48",
  "192px": "48",
  "13rem": "52",
  "208px": "52",
  "14rem": "56",
  "224px": "56",
  "15rem": "60",
  "240px": "60",
  "16rem": "64",
  "256px": "64",
  "18rem": "72",
  "288px": "72",
  "20rem": "80",
  "320px": "80",
  "24rem": "96",
  "384px": "96",
  "auto": "auto",
  "100%": "full",
  "50%": "1/2",
  "33.333333%": "1/3",
  "66.666667%": "2/3",
  "25%": "1/4",
  "75%": "3/4",
};

function spacingToTw(value: string): string | null {
  const v = value.trim();
  if (spacingMap[v]) return spacingMap[v];
  // Try to match arbitrary value
  return null;
}

// Color mappings (common named colors)
const colorMap: Record<string, string> = {
  "transparent": "transparent",
  "currentColor": "current",
  "current": "current",
  "#000": "black",
  "#000000": "black",
  "black": "black",
  "#fff": "white",
  "#ffffff": "white",
  "white": "white",
  "inherit": "inherit",
};

// Font size mappings
const fontSizeMap: Record<string, string> = {
  "0.75rem": "text-xs",
  "12px": "text-xs",
  "0.875rem": "text-sm",
  "14px": "text-sm",
  "1rem": "text-base",
  "16px": "text-base",
  "1.125rem": "text-lg",
  "18px": "text-lg",
  "1.25rem": "text-xl",
  "20px": "text-xl",
  "1.5rem": "text-2xl",
  "24px": "text-2xl",
  "1.875rem": "text-3xl",
  "30px": "text-3xl",
  "2.25rem": "text-4xl",
  "36px": "text-4xl",
  "3rem": "text-5xl",
  "48px": "text-5xl",
  "3.75rem": "text-6xl",
  "60px": "text-6xl",
  "4.5rem": "text-7xl",
  "72px": "text-7xl",
  "6rem": "text-8xl",
  "96px": "text-8xl",
  "8rem": "text-9xl",
  "128px": "text-9xl",
};

// Font weight mappings
const fontWeightMap: Record<string, string> = {
  "100": "font-thin",
  "200": "font-extralight",
  "300": "font-light",
  "400": "font-normal",
  "500": "font-medium",
  "600": "font-semibold",
  "700": "font-bold",
  "800": "font-extrabold",
  "900": "font-black",
};

// Border radius mappings
const borderRadiusMap: Record<string, string> = {
  "0": "rounded-none",
  "0px": "rounded-none",
  "0.125rem": "rounded-sm",
  "2px": "rounded-sm",
  "0.25rem": "rounded",
  "4px": "rounded",
  "0.375rem": "rounded-md",
  "6px": "rounded-md",
  "0.5rem": "rounded-lg",
  "8px": "rounded-lg",
  "0.75rem": "rounded-xl",
  "12px": "rounded-xl",
  "1rem": "rounded-2xl",
  "16px": "rounded-2xl",
  "1.5rem": "rounded-3xl",
  "24px": "rounded-3xl",
  "9999px": "rounded-full",
  "50%": "rounded-full",
};

// Line height mappings
const lineHeightMap: Record<string, string> = {
  "1": "leading-none",
  "1.25": "leading-tight",
  "1.375": "leading-snug",
  "1.5": "leading-normal",
  "1.625": "leading-relaxed",
  "2": "leading-loose",
  "0.75rem": "leading-3",
  "1rem": "leading-4",
  "1.25rem": "leading-5",
  "1.5rem": "leading-6",
  "1.75rem": "leading-7",
  "2rem": "leading-8",
  "2.25rem": "leading-9",
  "2.5rem": "leading-10",
};

// Letter spacing mappings
const letterSpacingMap: Record<string, string> = {
  "-0.05em": "tracking-tighter",
  "-0.025em": "tracking-tight",
  "0": "tracking-normal",
  "0em": "tracking-normal",
  "0.025em": "tracking-wide",
  "0.05em": "tracking-wider",
  "0.1em": "tracking-widest",
};

// Box shadow mappings
const boxShadowMap: Record<string, string> = {
  "none": "shadow-none",
  "0 1px 2px 0 rgb(0 0 0 / 0.05)": "shadow-sm",
  "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)": "shadow",
  "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)": "shadow-md",
  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)": "shadow-lg",
  "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)": "shadow-xl",
  "0 25px 50px -12px rgb(0 0 0 / 0.25)": "shadow-2xl",
  "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)": "shadow-inner",
};

// Width/height special values
const sizeMap: Record<string, string> = {
  "auto": "auto",
  "100%": "full",
  "100vw": "screen",
  "100vh": "screen",
  "100dvh": "dvh",
  "100svh": "svh",
  "100lvh": "lvh",
  "min-content": "min",
  "max-content": "max",
  "fit-content": "fit",
  "50%": "1/2",
  "33.333333%": "1/3",
  "66.666667%": "2/3",
  "25%": "1/4",
  "75%": "3/4",
  "20%": "1/5",
  "40%": "2/5",
  "60%": "3/5",
  "80%": "4/5",
};

// Opacity mappings
const opacityMap: Record<string, string> = {
  "0": "opacity-0",
  "0.05": "opacity-5",
  "0.1": "opacity-10",
  "0.15": "opacity-15",
  "0.2": "opacity-20",
  "0.25": "opacity-25",
  "0.3": "opacity-30",
  "0.35": "opacity-35",
  "0.4": "opacity-40",
  "0.45": "opacity-45",
  "0.5": "opacity-50",
  "0.55": "opacity-55",
  "0.6": "opacity-60",
  "0.65": "opacity-65",
  "0.7": "opacity-70",
  "0.75": "opacity-75",
  "0.8": "opacity-80",
  "0.85": "opacity-85",
  "0.9": "opacity-90",
  "0.95": "opacity-95",
  "1": "opacity-100",
};

// Z-index mappings
const zIndexMap: Record<string, string> = {
  "0": "z-0",
  "10": "z-10",
  "20": "z-20",
  "30": "z-30",
  "40": "z-40",
  "50": "z-50",
  "auto": "z-auto",
};

// Transition property mappings
const transitionPropertyMap: Record<string, string> = {
  "none": "transition-none",
  "all": "transition-all",
  "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter": "transition",
  "color, background-color, border-color, text-decoration-color, fill, stroke": "transition-colors",
  "opacity": "transition-opacity",
  "box-shadow": "transition-shadow",
  "transform": "transition-transform",
};

// Transition duration mappings
const transitionDurationMap: Record<string, string> = {
  "0ms": "duration-0",
  "0s": "duration-0",
  "75ms": "duration-75",
  "100ms": "duration-100",
  "150ms": "duration-150",
  "200ms": "duration-200",
  "300ms": "duration-300",
  "500ms": "duration-500",
  "700ms": "duration-700",
  "1000ms": "duration-1000",
  "1s": "duration-1000",
};

// Cursor mappings
const cursorMap: Record<string, string> = {
  "auto": "cursor-auto",
  "default": "cursor-default",
  "pointer": "cursor-pointer",
  "wait": "cursor-wait",
  "text": "cursor-text",
  "move": "cursor-move",
  "help": "cursor-help",
  "not-allowed": "cursor-not-allowed",
  "none": "cursor-none",
  "crosshair": "cursor-crosshair",
  "grab": "cursor-grab",
  "grabbing": "cursor-grabbing",
};

// Max-width mappings
const maxWidthMap: Record<string, string> = {
  "none": "max-w-none",
  "0": "max-w-0",
  "20rem": "max-w-xs",
  "320px": "max-w-xs",
  "24rem": "max-w-sm",
  "384px": "max-w-sm",
  "28rem": "max-w-md",
  "448px": "max-w-md",
  "32rem": "max-w-lg",
  "512px": "max-w-lg",
  "36rem": "max-w-xl",
  "576px": "max-w-xl",
  "42rem": "max-w-2xl",
  "672px": "max-w-2xl",
  "48rem": "max-w-3xl",
  "768px": "max-w-3xl",
  "56rem": "max-w-4xl",
  "896px": "max-w-4xl",
  "64rem": "max-w-5xl",
  "1024px": "max-w-5xl",
  "72rem": "max-w-6xl",
  "1152px": "max-w-6xl",
  "80rem": "max-w-7xl",
  "1280px": "max-w-7xl",
  "100%": "max-w-full",
};

// Main conversion function: single CSS declaration -> Tailwind class(es)
export function cssPropertyToTailwind(
  property: string,
  value: string
): string | null {
  const prop = property.trim().toLowerCase();
  const val = value.trim().toLowerCase();

  switch (prop) {
    // Display
    case "display":
      return (
        {
          block: "block",
          "inline-block": "inline-block",
          inline: "inline",
          flex: "flex",
          "inline-flex": "inline-flex",
          grid: "grid",
          "inline-grid": "inline-grid",
          none: "hidden",
          table: "table",
          "table-row": "table-row",
          "table-cell": "table-cell",
          contents: "contents",
          "list-item": "list-item",
          "flow-root": "flow-root",
        }[val] || null
      );

    // Position
    case "position":
      return (
        {
          static: "static",
          fixed: "fixed",
          absolute: "absolute",
          relative: "relative",
          sticky: "sticky",
        }[val] || null
      );

    // Top, Right, Bottom, Left
    case "top":
    case "right":
    case "bottom":
    case "left":
    case "inset": {
      const s = spacingToTw(val);
      if (s) return `${prop}-${s}`;
      if (val.startsWith("-")) {
        const pos = spacingToTw(val.slice(1));
        if (pos) return `-${prop}-${pos}`;
      }
      return null;
    }

    // Padding
    case "padding": {
      const s = spacingToTw(val);
      return s ? `p-${s}` : null;
    }
    case "padding-top": {
      const s = spacingToTw(val);
      return s ? `pt-${s}` : null;
    }
    case "padding-right": {
      const s = spacingToTw(val);
      return s ? `pr-${s}` : null;
    }
    case "padding-bottom": {
      const s = spacingToTw(val);
      return s ? `pb-${s}` : null;
    }
    case "padding-left": {
      const s = spacingToTw(val);
      return s ? `pl-${s}` : null;
    }
    case "padding-inline": {
      const s = spacingToTw(val);
      return s ? `px-${s}` : null;
    }
    case "padding-block": {
      const s = spacingToTw(val);
      return s ? `py-${s}` : null;
    }

    // Margin
    case "margin": {
      const s = spacingToTw(val);
      return s ? `m-${s}` : null;
    }
    case "margin-top": {
      const s = spacingToTw(val);
      if (s) return `mt-${s}`;
      if (val.startsWith("-")) {
        const pos = spacingToTw(val.slice(1));
        if (pos) return `-mt-${pos}`;
      }
      return null;
    }
    case "margin-right": {
      const s = spacingToTw(val);
      if (s) return `mr-${s}`;
      if (val.startsWith("-")) {
        const pos = spacingToTw(val.slice(1));
        if (pos) return `-mr-${pos}`;
      }
      return null;
    }
    case "margin-bottom": {
      const s = spacingToTw(val);
      if (s) return `mb-${s}`;
      if (val.startsWith("-")) {
        const pos = spacingToTw(val.slice(1));
        if (pos) return `-mb-${pos}`;
      }
      return null;
    }
    case "margin-left": {
      const s = spacingToTw(val);
      if (s) return `ml-${s}`;
      if (val.startsWith("-")) {
        const pos = spacingToTw(val.slice(1));
        if (pos) return `-ml-${pos}`;
      }
      return null;
    }
    case "margin-inline": {
      if (val === "auto") return "mx-auto";
      const s = spacingToTw(val);
      return s ? `mx-${s}` : null;
    }
    case "margin-block": {
      const s = spacingToTw(val);
      return s ? `my-${s}` : null;
    }

    // Width
    case "width": {
      const size = sizeMap[val];
      if (size) return `w-${size}`;
      const s = spacingToTw(val);
      return s ? `w-${s}` : null;
    }
    case "min-width": {
      const size = sizeMap[val];
      if (size) return `min-w-${size}`;
      const s = spacingToTw(val);
      return s ? `min-w-${s}` : null;
    }
    case "max-width": {
      const mw = maxWidthMap[val];
      if (mw) return mw;
      const size = sizeMap[val];
      if (size) return `max-w-${size}`;
      const s = spacingToTw(val);
      return s ? `max-w-${s}` : null;
    }

    // Height
    case "height": {
      const size = sizeMap[val];
      if (size) return `h-${size}`;
      const s = spacingToTw(val);
      return s ? `h-${s}` : null;
    }
    case "min-height": {
      const size = sizeMap[val];
      if (size) return `min-h-${size}`;
      const s = spacingToTw(val);
      return s ? `min-h-${s}` : null;
    }
    case "max-height": {
      const size = sizeMap[val];
      if (size) return `max-h-${size}`;
      const s = spacingToTw(val);
      return s ? `max-h-${s}` : null;
    }

    // Colors
    case "color": {
      const c = colorMap[val];
      return c ? `text-${c}` : null;
    }
    case "background-color": {
      const c = colorMap[val];
      return c ? `bg-${c}` : null;
    }
    case "border-color": {
      const c = colorMap[val];
      return c ? `border-${c}` : null;
    }

    // Font
    case "font-size": {
      return fontSizeMap[val] || null;
    }
    case "font-weight": {
      return fontWeightMap[val] || null;
    }
    case "font-style":
      return val === "italic" ? "italic" : val === "normal" ? "not-italic" : null;
    case "font-family": {
      if (val.includes("sans-serif") || val.includes("ui-sans-serif")) return "font-sans";
      if (val.includes("serif") && !val.includes("sans")) return "font-serif";
      if (val.includes("monospace") || val.includes("ui-monospace")) return "font-mono";
      return null;
    }

    // Text
    case "text-align":
      return (
        {
          left: "text-left",
          center: "text-center",
          right: "text-right",
          justify: "text-justify",
          start: "text-start",
          end: "text-end",
        }[val] || null
      );
    case "text-decoration":
    case "text-decoration-line":
      return (
        {
          underline: "underline",
          overline: "overline",
          "line-through": "line-through",
          none: "no-underline",
        }[val] || null
      );
    case "text-transform":
      return (
        {
          uppercase: "uppercase",
          lowercase: "lowercase",
          capitalize: "capitalize",
          none: "normal-case",
        }[val] || null
      );
    case "text-overflow":
      return val === "ellipsis" ? "text-ellipsis" : val === "clip" ? "text-clip" : null;
    case "vertical-align":
      return (
        {
          baseline: "align-baseline",
          top: "align-top",
          middle: "align-middle",
          bottom: "align-bottom",
          "text-top": "align-text-top",
          "text-bottom": "align-text-bottom",
          sub: "align-sub",
          super: "align-super",
        }[val] || null
      );
    case "white-space":
      return (
        {
          normal: "whitespace-normal",
          nowrap: "whitespace-nowrap",
          pre: "whitespace-pre",
          "pre-line": "whitespace-pre-line",
          "pre-wrap": "whitespace-pre-wrap",
          "break-spaces": "whitespace-break-spaces",
        }[val] || null
      );
    case "word-break":
      return (
        {
          "break-all": "break-all",
          "keep-all": "break-keep",
        }[val] || null
      );
    case "overflow-wrap":
      return val === "break-word" ? "break-words" : null;
    case "line-height":
      return lineHeightMap[val] || null;
    case "letter-spacing":
      return letterSpacingMap[val] || null;

    // Border
    case "border-width": {
      const bw: Record<string, string> = {
        "0": "border-0",
        "0px": "border-0",
        "1px": "border",
        "2px": "border-2",
        "4px": "border-4",
        "8px": "border-8",
      };
      return bw[val] || null;
    }
    case "border-style":
      return (
        {
          solid: "border-solid",
          dashed: "border-dashed",
          dotted: "border-dotted",
          double: "border-double",
          hidden: "border-hidden",
          none: "border-none",
        }[val] || null
      );
    case "border-radius":
      return borderRadiusMap[val] || null;

    // Box shadow
    case "box-shadow":
      return boxShadowMap[val] || null;

    // Flexbox
    case "flex-direction":
      return (
        {
          row: "flex-row",
          "row-reverse": "flex-row-reverse",
          column: "flex-col",
          "column-reverse": "flex-col-reverse",
        }[val] || null
      );
    case "flex-wrap":
      return (
        {
          wrap: "flex-wrap",
          "wrap-reverse": "flex-wrap-reverse",
          nowrap: "flex-nowrap",
        }[val] || null
      );
    case "flex": {
      const flexMap: Record<string, string> = {
        "1 1 0%": "flex-1",
        "1": "flex-1",
        "1 1 auto": "flex-auto",
        "auto": "flex-auto",
        "0 1 auto": "flex-initial",
        "initial": "flex-initial",
        "none": "flex-none",
        "0 0 auto": "flex-none",
      };
      return flexMap[val] || null;
    }
    case "flex-grow": {
      return val === "0" ? "grow-0" : val === "1" ? "grow" : null;
    }
    case "flex-shrink": {
      return val === "0" ? "shrink-0" : val === "1" ? "shrink" : null;
    }
    case "order": {
      const orderMap: Record<string, string> = {
        "1": "order-1",
        "2": "order-2",
        "3": "order-3",
        "4": "order-4",
        "5": "order-5",
        "6": "order-6",
        "7": "order-7",
        "8": "order-8",
        "9": "order-9",
        "10": "order-10",
        "11": "order-11",
        "12": "order-12",
        "-9999": "order-first",
        "9999": "order-last",
        "0": "order-none",
      };
      return orderMap[val] || null;
    }
    case "justify-content":
      return (
        {
          "flex-start": "justify-start",
          "flex-end": "justify-end",
          center: "justify-center",
          "space-between": "justify-between",
          "space-around": "justify-around",
          "space-evenly": "justify-evenly",
          start: "justify-start",
          end: "justify-end",
          stretch: "justify-stretch",
          normal: "justify-normal",
        }[val] || null
      );
    case "align-items":
      return (
        {
          "flex-start": "items-start",
          "flex-end": "items-end",
          center: "items-center",
          baseline: "items-baseline",
          stretch: "items-stretch",
          start: "items-start",
          end: "items-end",
        }[val] || null
      );
    case "align-self":
      return (
        {
          auto: "self-auto",
          "flex-start": "self-start",
          "flex-end": "self-end",
          center: "self-center",
          stretch: "self-stretch",
          baseline: "self-baseline",
          start: "self-start",
          end: "self-end",
        }[val] || null
      );
    case "align-content":
      return (
        {
          normal: "content-normal",
          center: "content-center",
          "flex-start": "content-start",
          "flex-end": "content-end",
          "space-between": "content-between",
          "space-around": "content-around",
          "space-evenly": "content-evenly",
          baseline: "content-baseline",
          stretch: "content-stretch",
          start: "content-start",
          end: "content-end",
        }[val] || null
      );
    case "gap": {
      const s = spacingToTw(val);
      return s ? `gap-${s}` : null;
    }
    case "row-gap": {
      const s = spacingToTw(val);
      return s ? `gap-y-${s}` : null;
    }
    case "column-gap": {
      const s = spacingToTw(val);
      return s ? `gap-x-${s}` : null;
    }

    // Grid
    case "grid-template-columns": {
      const match = val.match(/^repeat\((\d+),\s*minmax\(0,\s*1fr\)\)$/);
      if (match) return `grid-cols-${match[1]}`;
      const matchSimple = val.match(/^repeat\((\d+),\s*1fr\)$/);
      if (matchSimple) return `grid-cols-${matchSimple[1]}`;
      if (val === "none") return "grid-cols-none";
      if (val === "subgrid") return "grid-cols-subgrid";
      return null;
    }
    case "grid-template-rows": {
      const match = val.match(/^repeat\((\d+),\s*minmax\(0,\s*1fr\)\)$/);
      if (match) return `grid-rows-${match[1]}`;
      const matchSimple = val.match(/^repeat\((\d+),\s*1fr\)$/);
      if (matchSimple) return `grid-rows-${matchSimple[1]}`;
      if (val === "none") return "grid-rows-none";
      if (val === "subgrid") return "grid-rows-subgrid";
      return null;
    }
    case "grid-column": {
      const spanMatch = val.match(/^span\s+(\d+)\s*\/\s*span\s+\d+$/);
      if (spanMatch) return `col-span-${spanMatch[1]}`;
      if (val === "1 / -1") return "col-span-full";
      const startEnd = val.match(/^(\d+)\s*\/\s*(\d+)$/);
      if (startEnd) return `col-start-${startEnd[1]} col-end-${startEnd[2]}`;
      return null;
    }
    case "grid-column-start": {
      return val.match(/^\d+$/) ? `col-start-${val}` : null;
    }
    case "grid-column-end": {
      return val.match(/^\d+$/) ? `col-end-${val}` : null;
    }
    case "grid-row": {
      const spanMatch = val.match(/^span\s+(\d+)\s*\/\s*span\s+\d+$/);
      if (spanMatch) return `row-span-${spanMatch[1]}`;
      if (val === "1 / -1") return "row-span-full";
      return null;
    }
    case "place-items":
      return (
        {
          start: "place-items-start",
          end: "place-items-end",
          center: "place-items-center",
          baseline: "place-items-baseline",
          stretch: "place-items-stretch",
        }[val] || null
      );
    case "place-content":
      return (
        {
          center: "place-content-center",
          start: "place-content-start",
          end: "place-content-end",
          "space-between": "place-content-between",
          "space-around": "place-content-around",
          "space-evenly": "place-content-evenly",
          baseline: "place-content-baseline",
          stretch: "place-content-stretch",
        }[val] || null
      );

    // Overflow
    case "overflow":
      return (
        {
          auto: "overflow-auto",
          hidden: "overflow-hidden",
          clip: "overflow-clip",
          visible: "overflow-visible",
          scroll: "overflow-scroll",
        }[val] || null
      );
    case "overflow-x":
      return (
        {
          auto: "overflow-x-auto",
          hidden: "overflow-x-hidden",
          clip: "overflow-x-clip",
          visible: "overflow-x-visible",
          scroll: "overflow-x-scroll",
        }[val] || null
      );
    case "overflow-y":
      return (
        {
          auto: "overflow-y-auto",
          hidden: "overflow-y-hidden",
          clip: "overflow-y-clip",
          visible: "overflow-y-visible",
          scroll: "overflow-y-scroll",
        }[val] || null
      );

    // Opacity
    case "opacity":
      return opacityMap[val] || null;

    // Cursor
    case "cursor":
      return cursorMap[val] || null;

    // Z-index
    case "z-index":
      return zIndexMap[val] || null;

    // Object fit / position
    case "object-fit":
      return (
        {
          contain: "object-contain",
          cover: "object-cover",
          fill: "object-fill",
          none: "object-none",
          "scale-down": "object-scale-down",
        }[val] || null
      );
    case "object-position":
      return (
        {
          bottom: "object-bottom",
          center: "object-center",
          left: "object-left",
          "left bottom": "object-left-bottom",
          "left top": "object-left-top",
          right: "object-right",
          "right bottom": "object-right-bottom",
          "right top": "object-right-top",
          top: "object-top",
        }[val] || null
      );

    // Pointer events
    case "pointer-events":
      return val === "none" ? "pointer-events-none" : val === "auto" ? "pointer-events-auto" : null;

    // User select
    case "user-select":
      return (
        {
          none: "select-none",
          text: "select-text",
          all: "select-all",
          auto: "select-auto",
        }[val] || null
      );

    // Visibility
    case "visibility":
      return val === "visible" ? "visible" : val === "hidden" ? "invisible" : val === "collapse" ? "collapse" : null;

    // Transition
    case "transition-property":
      return transitionPropertyMap[val] || null;
    case "transition-duration":
      return transitionDurationMap[val] || null;
    case "transition-timing-function":
      return (
        {
          "linear": "ease-linear",
          "cubic-bezier(0.4, 0, 1, 1)": "ease-in",
          "cubic-bezier(0, 0, 0.2, 1)": "ease-out",
          "cubic-bezier(0.4, 0, 0.2, 1)": "ease-in-out",
          "ease": "ease-in-out",
        }[val] || null
      );

    // Transform
    case "transform": {
      if (val === "none") return "transform-none";
      return null;
    }

    // Resize
    case "resize":
      return (
        {
          none: "resize-none",
          both: "resize",
          vertical: "resize-y",
          horizontal: "resize-x",
        }[val] || null
      );

    // Appearance
    case "appearance":
      return val === "none" ? "appearance-none" : val === "auto" ? "appearance-auto" : null;

    // Outline
    case "outline":
    case "outline-style":
      return val === "none" || val === "0" ? "outline-none" : null;
    case "outline-offset": {
      const oo: Record<string, string> = {
        "0": "outline-offset-0",
        "0px": "outline-offset-0",
        "1px": "outline-offset-1",
        "2px": "outline-offset-2",
        "4px": "outline-offset-4",
        "8px": "outline-offset-8",
      };
      return oo[val] || null;
    }

    // List style
    case "list-style-type":
      return (
        {
          none: "list-none",
          disc: "list-disc",
          decimal: "list-decimal",
        }[val] || null
      );
    case "list-style-position":
      return val === "inside" ? "list-inside" : val === "outside" ? "list-outside" : null;

    // Background
    case "background-size":
      return val === "cover" ? "bg-cover" : val === "contain" ? "bg-contain" : val === "auto" ? "bg-auto" : null;
    case "background-position":
      return (
        {
          bottom: "bg-bottom",
          center: "bg-center",
          left: "bg-left",
          "left bottom": "bg-left-bottom",
          "left top": "bg-left-top",
          right: "bg-right",
          "right bottom": "bg-right-bottom",
          "right top": "bg-right-top",
          top: "bg-top",
        }[val] || null
      );
    case "background-repeat":
      return (
        {
          repeat: "bg-repeat",
          "no-repeat": "bg-no-repeat",
          "repeat-x": "bg-repeat-x",
          "repeat-y": "bg-repeat-y",
          round: "bg-repeat-round",
          space: "bg-repeat-space",
        }[val] || null
      );
    case "background-attachment":
      return val === "fixed" ? "bg-fixed" : val === "local" ? "bg-local" : val === "scroll" ? "bg-scroll" : null;

    // Table
    case "border-collapse":
      return val === "collapse" ? "border-collapse" : val === "separate" ? "border-separate" : null;
    case "table-layout":
      return val === "auto" ? "table-auto" : val === "fixed" ? "table-fixed" : null;

    // Mix blend mode
    case "mix-blend-mode":
      return (
        {
          normal: "mix-blend-normal",
          multiply: "mix-blend-multiply",
          screen: "mix-blend-screen",
          overlay: "mix-blend-overlay",
          darken: "mix-blend-darken",
          lighten: "mix-blend-lighten",
          "color-dodge": "mix-blend-color-dodge",
          "color-burn": "mix-blend-color-burn",
          "hard-light": "mix-blend-hard-light",
          "soft-light": "mix-blend-soft-light",
          difference: "mix-blend-difference",
          exclusion: "mix-blend-exclusion",
          hue: "mix-blend-hue",
          saturation: "mix-blend-saturation",
          color: "mix-blend-color",
          luminosity: "mix-blend-luminosity",
        }[val] || null
      );

    // Aspect ratio
    case "aspect-ratio":
      return (
        {
          auto: "aspect-auto",
          "1 / 1": "aspect-square",
          "16 / 9": "aspect-video",
        }[val] || null
      );

    // Box sizing
    case "box-sizing":
      return val === "border-box" ? "box-border" : val === "content-box" ? "box-content" : null;

    // Float / clear
    case "float":
      return (
        {
          right: "float-right",
          left: "float-left",
          none: "float-none",
          start: "float-start",
          end: "float-end",
        }[val] || null
      );
    case "clear":
      return (
        {
          left: "clear-left",
          right: "clear-right",
          both: "clear-both",
          none: "clear-none",
          start: "clear-start",
          end: "clear-end",
        }[val] || null
      );

    // Content
    case "content":
      return val === "none" || val === '""' || val === "''" ? "content-none" : null;

    // Isolation
    case "isolation":
      return val === "isolate" ? "isolate" : val === "auto" ? "isolation-auto" : null;

    // Break
    case "break-after":
    case "break-before":
      return (
        {
          auto: `break-${prop === "break-after" ? "after" : "before"}-auto`,
          avoid: `break-${prop === "break-after" ? "after" : "before"}-avoid`,
          all: `break-${prop === "break-after" ? "after" : "before"}-all`,
          "avoid-page": `break-${prop === "break-after" ? "after" : "before"}-avoid-page`,
          page: `break-${prop === "break-after" ? "after" : "before"}-page`,
          left: `break-${prop === "break-after" ? "after" : "before"}-left`,
          right: `break-${prop === "break-after" ? "after" : "before"}-right`,
          column: `break-${prop === "break-after" ? "after" : "before"}-column`,
        }[val] || null
      );
    case "break-inside":
      return (
        {
          auto: "break-inside-auto",
          avoid: "break-inside-avoid",
          "avoid-page": "break-inside-avoid-page",
          "avoid-column": "break-inside-avoid-column",
        }[val] || null
      );

    default:
      return null;
  }
}

// ============================================================
// Tailwind -> CSS reverse mapping
// ============================================================

interface TwToCssEntry {
  css: string; // full CSS declaration(s)
}

const twToCssMap: Record<string, string> = {
  // Display
  block: "display: block;",
  "inline-block": "display: inline-block;",
  inline: "display: inline;",
  flex: "display: flex;",
  "inline-flex": "display: inline-flex;",
  grid: "display: grid;",
  "inline-grid": "display: inline-grid;",
  hidden: "display: none;",
  table: "display: table;",
  "table-row": "display: table-row;",
  "table-cell": "display: table-cell;",
  contents: "display: contents;",
  "list-item": "display: list-item;",
  "flow-root": "display: flow-root;",

  // Position
  static: "position: static;",
  fixed: "position: fixed;",
  absolute: "position: absolute;",
  relative: "position: relative;",
  sticky: "position: sticky;",

  // Flexbox direction
  "flex-row": "flex-direction: row;",
  "flex-row-reverse": "flex-direction: row-reverse;",
  "flex-col": "flex-direction: column;",
  "flex-col-reverse": "flex-direction: column-reverse;",
  "flex-wrap": "flex-wrap: wrap;",
  "flex-wrap-reverse": "flex-wrap: wrap-reverse;",
  "flex-nowrap": "flex-wrap: nowrap;",
  "flex-1": "flex: 1 1 0%;",
  "flex-auto": "flex: 1 1 auto;",
  "flex-initial": "flex: 0 1 auto;",
  "flex-none": "flex: none;",
  grow: "flex-grow: 1;",
  "grow-0": "flex-grow: 0;",
  shrink: "flex-shrink: 1;",
  "shrink-0": "flex-shrink: 0;",

  // Justify
  "justify-start": "justify-content: flex-start;",
  "justify-end": "justify-content: flex-end;",
  "justify-center": "justify-content: center;",
  "justify-between": "justify-content: space-between;",
  "justify-around": "justify-content: space-around;",
  "justify-evenly": "justify-content: space-evenly;",
  "justify-stretch": "justify-content: stretch;",
  "justify-normal": "justify-content: normal;",

  // Align items
  "items-start": "align-items: flex-start;",
  "items-end": "align-items: flex-end;",
  "items-center": "align-items: center;",
  "items-baseline": "align-items: baseline;",
  "items-stretch": "align-items: stretch;",

  // Align self
  "self-auto": "align-self: auto;",
  "self-start": "align-self: flex-start;",
  "self-end": "align-self: flex-end;",
  "self-center": "align-self: center;",
  "self-stretch": "align-self: stretch;",
  "self-baseline": "align-self: baseline;",

  // Align content
  "content-normal": "align-content: normal;",
  "content-center": "align-content: center;",
  "content-start": "align-content: flex-start;",
  "content-end": "align-content: flex-end;",
  "content-between": "align-content: space-between;",
  "content-around": "align-content: space-around;",
  "content-evenly": "align-content: space-evenly;",
  "content-baseline": "align-content: baseline;",
  "content-stretch": "align-content: stretch;",

  // Place
  "place-items-start": "place-items: start;",
  "place-items-end": "place-items: end;",
  "place-items-center": "place-items: center;",
  "place-items-baseline": "place-items: baseline;",
  "place-items-stretch": "place-items: stretch;",
  "place-content-center": "place-content: center;",
  "place-content-start": "place-content: start;",
  "place-content-end": "place-content: end;",
  "place-content-between": "place-content: space-between;",
  "place-content-around": "place-content: space-around;",
  "place-content-evenly": "place-content: space-evenly;",
  "place-content-baseline": "place-content: baseline;",
  "place-content-stretch": "place-content: stretch;",

  // Font size
  "text-xs": "font-size: 0.75rem; /* 12px */\nline-height: 1rem; /* 16px */",
  "text-sm": "font-size: 0.875rem; /* 14px */\nline-height: 1.25rem; /* 20px */",
  "text-base": "font-size: 1rem; /* 16px */\nline-height: 1.5rem; /* 24px */",
  "text-lg": "font-size: 1.125rem; /* 18px */\nline-height: 1.75rem; /* 28px */",
  "text-xl": "font-size: 1.25rem; /* 20px */\nline-height: 1.75rem; /* 28px */",
  "text-2xl": "font-size: 1.5rem; /* 24px */\nline-height: 2rem; /* 32px */",
  "text-3xl": "font-size: 1.875rem; /* 30px */\nline-height: 2.25rem; /* 36px */",
  "text-4xl": "font-size: 2.25rem; /* 36px */\nline-height: 2.5rem; /* 40px */",
  "text-5xl": "font-size: 3rem; /* 48px */\nline-height: 1;",
  "text-6xl": "font-size: 3.75rem; /* 60px */\nline-height: 1;",
  "text-7xl": "font-size: 4.5rem; /* 72px */\nline-height: 1;",
  "text-8xl": "font-size: 6rem; /* 96px */\nline-height: 1;",
  "text-9xl": "font-size: 8rem; /* 128px */\nline-height: 1;",

  // Font weight
  "font-thin": "font-weight: 100;",
  "font-extralight": "font-weight: 200;",
  "font-light": "font-weight: 300;",
  "font-normal": "font-weight: 400;",
  "font-medium": "font-weight: 500;",
  "font-semibold": "font-weight: 600;",
  "font-bold": "font-weight: 700;",
  "font-extrabold": "font-weight: 800;",
  "font-black": "font-weight: 900;",

  // Font style
  italic: "font-style: italic;",
  "not-italic": "font-style: normal;",

  // Font family
  "font-sans": 'font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";',
  "font-serif": 'font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;',
  "font-mono": 'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;',

  // Text alignment
  "text-left": "text-align: left;",
  "text-center": "text-align: center;",
  "text-right": "text-align: right;",
  "text-justify": "text-align: justify;",
  "text-start": "text-align: start;",
  "text-end": "text-align: end;",

  // Text decoration
  underline: "text-decoration-line: underline;",
  overline: "text-decoration-line: overline;",
  "line-through": "text-decoration-line: line-through;",
  "no-underline": "text-decoration-line: none;",

  // Text transform
  uppercase: "text-transform: uppercase;",
  lowercase: "text-transform: lowercase;",
  capitalize: "text-transform: capitalize;",
  "normal-case": "text-transform: none;",

  // Text overflow
  "text-ellipsis": "text-overflow: ellipsis;",
  "text-clip": "text-overflow: clip;",
  truncate: "overflow: hidden;\ntext-overflow: ellipsis;\nwhite-space: nowrap;",

  // Vertical align
  "align-baseline": "vertical-align: baseline;",
  "align-top": "vertical-align: top;",
  "align-middle": "vertical-align: middle;",
  "align-bottom": "vertical-align: bottom;",
  "align-text-top": "vertical-align: text-top;",
  "align-text-bottom": "vertical-align: text-bottom;",
  "align-sub": "vertical-align: sub;",
  "align-super": "vertical-align: super;",

  // Whitespace
  "whitespace-normal": "white-space: normal;",
  "whitespace-nowrap": "white-space: nowrap;",
  "whitespace-pre": "white-space: pre;",
  "whitespace-pre-line": "white-space: pre-line;",
  "whitespace-pre-wrap": "white-space: pre-wrap;",
  "whitespace-break-spaces": "white-space: break-spaces;",

  // Word break
  "break-all": "word-break: break-all;",
  "break-keep": "word-break: keep-all;",
  "break-words": "overflow-wrap: break-word;",

  // Line height
  "leading-none": "line-height: 1;",
  "leading-tight": "line-height: 1.25;",
  "leading-snug": "line-height: 1.375;",
  "leading-normal": "line-height: 1.5;",
  "leading-relaxed": "line-height: 1.625;",
  "leading-loose": "line-height: 2;",
  "leading-3": "line-height: 0.75rem; /* 12px */",
  "leading-4": "line-height: 1rem; /* 16px */",
  "leading-5": "line-height: 1.25rem; /* 20px */",
  "leading-6": "line-height: 1.5rem; /* 24px */",
  "leading-7": "line-height: 1.75rem; /* 28px */",
  "leading-8": "line-height: 2rem; /* 32px */",
  "leading-9": "line-height: 2.25rem; /* 36px */",
  "leading-10": "line-height: 2.5rem; /* 40px */",

  // Letter spacing
  "tracking-tighter": "letter-spacing: -0.05em;",
  "tracking-tight": "letter-spacing: -0.025em;",
  "tracking-normal": "letter-spacing: 0em;",
  "tracking-wide": "letter-spacing: 0.025em;",
  "tracking-wider": "letter-spacing: 0.05em;",
  "tracking-widest": "letter-spacing: 0.1em;",

  // Colors
  "text-black": "color: #000000;",
  "text-white": "color: #ffffff;",
  "text-transparent": "color: transparent;",
  "text-current": "color: currentColor;",
  "text-inherit": "color: inherit;",
  "bg-black": "background-color: #000000;",
  "bg-white": "background-color: #ffffff;",
  "bg-transparent": "background-color: transparent;",
  "bg-current": "background-color: currentColor;",
  "bg-inherit": "background-color: inherit;",
  "border-black": "border-color: #000000;",
  "border-white": "border-color: #ffffff;",
  "border-transparent": "border-color: transparent;",
  "border-current": "border-color: currentColor;",
  "border-inherit": "border-color: inherit;",

  // Border width
  "border-0": "border-width: 0px;",
  border: "border-width: 1px;",
  "border-2": "border-width: 2px;",
  "border-4": "border-width: 4px;",
  "border-8": "border-width: 8px;",

  // Border style
  "border-solid": "border-style: solid;",
  "border-dashed": "border-style: dashed;",
  "border-dotted": "border-style: dotted;",
  "border-double": "border-style: double;",
  "border-hidden": "border-style: hidden;",
  "border-none": "border-style: none;",

  // Border radius
  "rounded-none": "border-radius: 0px;",
  "rounded-sm": "border-radius: 0.125rem; /* 2px */",
  rounded: "border-radius: 0.25rem; /* 4px */",
  "rounded-md": "border-radius: 0.375rem; /* 6px */",
  "rounded-lg": "border-radius: 0.5rem; /* 8px */",
  "rounded-xl": "border-radius: 0.75rem; /* 12px */",
  "rounded-2xl": "border-radius: 1rem; /* 16px */",
  "rounded-3xl": "border-radius: 1.5rem; /* 24px */",
  "rounded-full": "border-radius: 9999px;",

  // Box shadow
  "shadow-sm": "box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);",
  shadow: "box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);",
  "shadow-md": "box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);",
  "shadow-lg": "box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);",
  "shadow-xl": "box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);",
  "shadow-2xl": "box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);",
  "shadow-inner": "box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);",
  "shadow-none": "box-shadow: 0 0 #0000;",

  // Overflow
  "overflow-auto": "overflow: auto;",
  "overflow-hidden": "overflow: hidden;",
  "overflow-clip": "overflow: clip;",
  "overflow-visible": "overflow: visible;",
  "overflow-scroll": "overflow: scroll;",
  "overflow-x-auto": "overflow-x: auto;",
  "overflow-x-hidden": "overflow-x: hidden;",
  "overflow-x-clip": "overflow-x: clip;",
  "overflow-x-visible": "overflow-x: visible;",
  "overflow-x-scroll": "overflow-x: scroll;",
  "overflow-y-auto": "overflow-y: auto;",
  "overflow-y-hidden": "overflow-y: hidden;",
  "overflow-y-clip": "overflow-y: clip;",
  "overflow-y-visible": "overflow-y: visible;",
  "overflow-y-scroll": "overflow-y: scroll;",

  // Opacity
  "opacity-0": "opacity: 0;",
  "opacity-5": "opacity: 0.05;",
  "opacity-10": "opacity: 0.1;",
  "opacity-15": "opacity: 0.15;",
  "opacity-20": "opacity: 0.2;",
  "opacity-25": "opacity: 0.25;",
  "opacity-30": "opacity: 0.3;",
  "opacity-35": "opacity: 0.35;",
  "opacity-40": "opacity: 0.4;",
  "opacity-45": "opacity: 0.45;",
  "opacity-50": "opacity: 0.5;",
  "opacity-55": "opacity: 0.55;",
  "opacity-60": "opacity: 0.6;",
  "opacity-65": "opacity: 0.65;",
  "opacity-70": "opacity: 0.7;",
  "opacity-75": "opacity: 0.75;",
  "opacity-80": "opacity: 0.8;",
  "opacity-85": "opacity: 0.85;",
  "opacity-90": "opacity: 0.9;",
  "opacity-95": "opacity: 0.95;",
  "opacity-100": "opacity: 1;",

  // Cursor
  "cursor-auto": "cursor: auto;",
  "cursor-default": "cursor: default;",
  "cursor-pointer": "cursor: pointer;",
  "cursor-wait": "cursor: wait;",
  "cursor-text": "cursor: text;",
  "cursor-move": "cursor: move;",
  "cursor-help": "cursor: help;",
  "cursor-not-allowed": "cursor: not-allowed;",
  "cursor-none": "cursor: none;",
  "cursor-crosshair": "cursor: crosshair;",
  "cursor-grab": "cursor: grab;",
  "cursor-grabbing": "cursor: grabbing;",

  // Z-index
  "z-0": "z-index: 0;",
  "z-10": "z-index: 10;",
  "z-20": "z-index: 20;",
  "z-30": "z-index: 30;",
  "z-40": "z-index: 40;",
  "z-50": "z-index: 50;",
  "z-auto": "z-index: auto;",

  // Object fit / position
  "object-contain": "object-fit: contain;",
  "object-cover": "object-fit: cover;",
  "object-fill": "object-fit: fill;",
  "object-none": "object-fit: none;",
  "object-scale-down": "object-fit: scale-down;",
  "object-bottom": "object-position: bottom;",
  "object-center": "object-position: center;",
  "object-left": "object-position: left;",
  "object-left-bottom": "object-position: left bottom;",
  "object-left-top": "object-position: left top;",
  "object-right": "object-position: right;",
  "object-right-bottom": "object-position: right bottom;",
  "object-right-top": "object-position: right top;",
  "object-top": "object-position: top;",

  // Pointer events
  "pointer-events-none": "pointer-events: none;",
  "pointer-events-auto": "pointer-events: auto;",

  // User select
  "select-none": "user-select: none;",
  "select-text": "user-select: text;",
  "select-all": "user-select: all;",
  "select-auto": "user-select: auto;",

  // Visibility
  visible: "visibility: visible;",
  invisible: "visibility: hidden;",
  collapse: "visibility: collapse;",

  // Transition
  "transition-none": "transition-property: none;",
  "transition-all": "transition-property: all;\ntransition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\ntransition-duration: 150ms;",
  transition: "transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;\ntransition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\ntransition-duration: 150ms;",
  "transition-colors": "transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;\ntransition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\ntransition-duration: 150ms;",
  "transition-opacity": "transition-property: opacity;\ntransition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\ntransition-duration: 150ms;",
  "transition-shadow": "transition-property: box-shadow;\ntransition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\ntransition-duration: 150ms;",
  "transition-transform": "transition-property: transform;\ntransition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\ntransition-duration: 150ms;",

  // Duration
  "duration-0": "transition-duration: 0s;",
  "duration-75": "transition-duration: 75ms;",
  "duration-100": "transition-duration: 100ms;",
  "duration-150": "transition-duration: 150ms;",
  "duration-200": "transition-duration: 200ms;",
  "duration-300": "transition-duration: 300ms;",
  "duration-500": "transition-duration: 500ms;",
  "duration-700": "transition-duration: 700ms;",
  "duration-1000": "transition-duration: 1000ms;",

  // Timing function
  "ease-linear": "transition-timing-function: linear;",
  "ease-in": "transition-timing-function: cubic-bezier(0.4, 0, 1, 1);",
  "ease-out": "transition-timing-function: cubic-bezier(0, 0, 0.2, 1);",
  "ease-in-out": "transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);",

  // Transform
  "transform-none": "transform: none;",

  // Resize
  "resize-none": "resize: none;",
  resize: "resize: both;",
  "resize-y": "resize: vertical;",
  "resize-x": "resize: horizontal;",

  // Appearance
  "appearance-none": "appearance: none;",
  "appearance-auto": "appearance: auto;",

  // Outline
  "outline-none": "outline: 2px solid transparent;\noutline-offset: 2px;",
  "outline-offset-0": "outline-offset: 0px;",
  "outline-offset-1": "outline-offset: 1px;",
  "outline-offset-2": "outline-offset: 2px;",
  "outline-offset-4": "outline-offset: 4px;",
  "outline-offset-8": "outline-offset: 8px;",

  // List
  "list-none": "list-style-type: none;",
  "list-disc": "list-style-type: disc;",
  "list-decimal": "list-style-type: decimal;",
  "list-inside": "list-style-position: inside;",
  "list-outside": "list-style-position: outside;",

  // Background
  "bg-cover": "background-size: cover;",
  "bg-contain": "background-size: contain;",
  "bg-auto": "background-size: auto;",
  "bg-bottom": "background-position: bottom;",
  "bg-center": "background-position: center;",
  "bg-left": "background-position: left;",
  "bg-left-bottom": "background-position: left bottom;",
  "bg-left-top": "background-position: left top;",
  "bg-right": "background-position: right;",
  "bg-right-bottom": "background-position: right bottom;",
  "bg-right-top": "background-position: right top;",
  "bg-top": "background-position: top;",
  "bg-repeat": "background-repeat: repeat;",
  "bg-no-repeat": "background-repeat: no-repeat;",
  "bg-repeat-x": "background-repeat: repeat-x;",
  "bg-repeat-y": "background-repeat: repeat-y;",
  "bg-repeat-round": "background-repeat: round;",
  "bg-repeat-space": "background-repeat: space;",
  "bg-fixed": "background-attachment: fixed;",
  "bg-local": "background-attachment: local;",
  "bg-scroll": "background-attachment: scroll;",

  // Table
  "border-collapse": "border-collapse: collapse;",
  "border-separate": "border-collapse: separate;",
  "table-auto": "table-layout: auto;",
  "table-fixed": "table-layout: fixed;",

  // Aspect ratio
  "aspect-auto": "aspect-ratio: auto;",
  "aspect-square": "aspect-ratio: 1 / 1;",
  "aspect-video": "aspect-ratio: 16 / 9;",

  // Box sizing
  "box-border": "box-sizing: border-box;",
  "box-content": "box-sizing: content-box;",

  // Float
  "float-right": "float: right;",
  "float-left": "float: left;",
  "float-none": "float: none;",
  "float-start": "float: inline-start;",
  "float-end": "float: inline-end;",

  // Clear
  "clear-left": "clear: left;",
  "clear-right": "clear: right;",
  "clear-both": "clear: both;",
  "clear-none": "clear: none;",
  "clear-start": "clear: inline-start;",
  "clear-end": "clear: inline-end;",

  // Content
  "content-none": 'content: none;',

  // Isolation
  isolate: "isolation: isolate;",
  "isolation-auto": "isolation: auto;",

  // Mix blend mode
  "mix-blend-normal": "mix-blend-mode: normal;",
  "mix-blend-multiply": "mix-blend-mode: multiply;",
  "mix-blend-screen": "mix-blend-mode: screen;",
  "mix-blend-overlay": "mix-blend-mode: overlay;",
  "mix-blend-darken": "mix-blend-mode: darken;",
  "mix-blend-lighten": "mix-blend-mode: lighten;",
  "mix-blend-color-dodge": "mix-blend-mode: color-dodge;",
  "mix-blend-color-burn": "mix-blend-mode: color-burn;",
  "mix-blend-hard-light": "mix-blend-mode: hard-light;",
  "mix-blend-soft-light": "mix-blend-mode: soft-light;",
  "mix-blend-difference": "mix-blend-mode: difference;",
  "mix-blend-exclusion": "mix-blend-mode: exclusion;",
  "mix-blend-hue": "mix-blend-mode: hue;",
  "mix-blend-saturation": "mix-blend-mode: saturation;",
  "mix-blend-color": "mix-blend-mode: color;",
  "mix-blend-luminosity": "mix-blend-mode: luminosity;",

  // Screen reader only
  "sr-only": "position: absolute;\nwidth: 1px;\nheight: 1px;\npadding: 0;\nmargin: -1px;\noverflow: hidden;\nclip: rect(0, 0, 0, 0);\nwhite-space: nowrap;\nborder-width: 0;",
  "not-sr-only": "position: static;\nwidth: auto;\nheight: auto;\npadding: 0;\nmargin: 0;\noverflow: visible;\nclip: auto;\nwhite-space: normal;",
};

// Reverse spacing map for TW -> CSS
const reverseSpacingMap: Record<string, string> = {};
for (const [px, tw] of Object.entries(spacingMap)) {
  // Prefer rem values over px
  if (!reverseSpacingMap[tw] || px.includes("rem") || px === "0" || px === "auto") {
    reverseSpacingMap[tw] = px;
  }
}
// Override specific ones for cleaner output
reverseSpacingMap["0"] = "0px";
reverseSpacingMap["px"] = "1px";
reverseSpacingMap["full"] = "100%";
reverseSpacingMap["1/2"] = "50%";
reverseSpacingMap["1/3"] = "33.333333%";
reverseSpacingMap["2/3"] = "66.666667%";
reverseSpacingMap["1/4"] = "25%";
reverseSpacingMap["3/4"] = "75%";
reverseSpacingMap["auto"] = "auto";

// Dynamic TW -> CSS patterns (spacing-based utilities)
function dynamicTwToCss(className: string): string | null {
  // Padding
  let match = className.match(/^p([trblxy]?)-(.+)$/);
  if (match) {
    const [, dir, size] = match;
    const val = reverseSpacingMap[size];
    if (!val) return null;
    const propMap: Record<string, string> = {
      "": `padding: ${val};`,
      t: `padding-top: ${val};`,
      r: `padding-right: ${val};`,
      b: `padding-bottom: ${val};`,
      l: `padding-left: ${val};`,
      x: `padding-left: ${val};\npadding-right: ${val};`,
      y: `padding-top: ${val};\npadding-bottom: ${val};`,
    };
    return propMap[dir] || null;
  }

  // Negative margin
  match = className.match(/^-m([trblxy]?)-(.+)$/);
  if (match) {
    const [, dir, size] = match;
    const val = reverseSpacingMap[size];
    if (!val) return null;
    const negVal = `-${val}`;
    const propMap: Record<string, string> = {
      "": `margin: ${negVal};`,
      t: `margin-top: ${negVal};`,
      r: `margin-right: ${negVal};`,
      b: `margin-bottom: ${negVal};`,
      l: `margin-left: ${negVal};`,
      x: `margin-left: ${negVal};\nmargin-right: ${negVal};`,
      y: `margin-top: ${negVal};\nmargin-bottom: ${negVal};`,
    };
    return propMap[dir] || null;
  }

  // Margin
  match = className.match(/^m([trblxy]?)-(.+)$/);
  if (match) {
    const [, dir, size] = match;
    const val = reverseSpacingMap[size];
    if (!val) return null;
    const propMap: Record<string, string> = {
      "": `margin: ${val};`,
      t: `margin-top: ${val};`,
      r: `margin-right: ${val};`,
      b: `margin-bottom: ${val};`,
      l: `margin-left: ${val};`,
      x: `margin-left: ${val};\nmargin-right: ${val};`,
      y: `margin-top: ${val};\nmargin-bottom: ${val};`,
    };
    return propMap[dir] || null;
  }

  // Gap
  match = className.match(/^gap-([xy]?)-?(.+)$/);
  if (match) {
    const [, axis, size] = match;
    const val = reverseSpacingMap[size];
    if (!val) return null;
    if (axis === "x") return `column-gap: ${val};`;
    if (axis === "y") return `row-gap: ${val};`;
    return `gap: ${val};`;
  }
  match = className.match(/^gap-(.+)$/);
  if (match) {
    const val = reverseSpacingMap[match[1]];
    if (val) return `gap: ${val};`;
  }

  // Width
  match = className.match(/^w-(.+)$/);
  if (match) {
    const size = match[1];
    const special: Record<string, string> = {
      full: "100%", screen: "100vw", svw: "100svw", lvw: "100lvw", dvw: "100dvw",
      min: "min-content", max: "max-content", fit: "fit-content",
      auto: "auto",
    };
    const val = special[size] || reverseSpacingMap[size];
    if (val) return `width: ${val};`;
  }

  // Height
  match = className.match(/^h-(.+)$/);
  if (match) {
    const size = match[1];
    const special: Record<string, string> = {
      full: "100%", screen: "100vh", svh: "100svh", lvh: "100lvh", dvh: "100dvh",
      min: "min-content", max: "max-content", fit: "fit-content",
      auto: "auto",
    };
    const val = special[size] || reverseSpacingMap[size];
    if (val) return `height: ${val};`;
  }

  // Min/Max width
  match = className.match(/^min-w-(.+)$/);
  if (match) {
    const val = reverseSpacingMap[match[1]];
    const special: Record<string, string> = { full: "100%", min: "min-content", max: "max-content", fit: "fit-content", "0": "0px" };
    const resolved = special[match[1]] || val;
    if (resolved) return `min-width: ${resolved};`;
  }

  match = className.match(/^max-w-(.+)$/);
  if (match) {
    const named: Record<string, string> = {
      none: "none", "0": "0rem", xs: "20rem", sm: "24rem", md: "28rem",
      lg: "32rem", xl: "36rem", "2xl": "42rem", "3xl": "48rem",
      "4xl": "56rem", "5xl": "64rem", "6xl": "72rem", "7xl": "80rem",
      full: "100%", min: "min-content", max: "max-content", fit: "fit-content",
      prose: "65ch", "screen-sm": "640px", "screen-md": "768px",
      "screen-lg": "1024px", "screen-xl": "1280px", "screen-2xl": "1536px",
    };
    if (named[match[1]]) return `max-width: ${named[match[1]]};`;
  }

  // Min/Max height
  match = className.match(/^min-h-(.+)$/);
  if (match) {
    const special: Record<string, string> = { full: "100%", screen: "100vh", svh: "100svh", lvh: "100lvh", dvh: "100dvh", min: "min-content", max: "max-content", fit: "fit-content", "0": "0px" };
    const val = special[match[1]] || reverseSpacingMap[match[1]];
    if (val) return `min-height: ${val};`;
  }

  match = className.match(/^max-h-(.+)$/);
  if (match) {
    const special: Record<string, string> = { full: "100%", screen: "100vh", svh: "100svh", lvh: "100lvh", dvh: "100dvh", min: "min-content", max: "max-content", fit: "fit-content", none: "none" };
    const val = special[match[1]] || reverseSpacingMap[match[1]];
    if (val) return `max-height: ${val};`;
  }

  // Inset / top / right / bottom / left
  match = className.match(/^(-?)inset-(.+)$/);
  if (match) {
    const neg = match[1] === "-" ? "-" : "";
    const val = reverseSpacingMap[match[2]];
    if (val) return `inset: ${neg}${val};`;
  }

  for (const dir of ["top", "right", "bottom", "left"] as const) {
    match = className.match(new RegExp(`^(-?)${dir}-(.+)$`));
    if (match) {
      const neg = match[1] === "-" ? "-" : "";
      const val = reverseSpacingMap[match[2]];
      if (val) return `${dir}: ${neg}${val};`;
    }
  }

  // Grid cols / rows
  match = className.match(/^grid-cols-(\d+)$/);
  if (match) return `grid-template-columns: repeat(${match[1]}, minmax(0, 1fr));`;
  if (className === "grid-cols-none") return "grid-template-columns: none;";
  if (className === "grid-cols-subgrid") return "grid-template-columns: subgrid;";

  match = className.match(/^grid-rows-(\d+)$/);
  if (match) return `grid-template-rows: repeat(${match[1]}, minmax(0, 1fr));`;
  if (className === "grid-rows-none") return "grid-template-rows: none;";
  if (className === "grid-rows-subgrid") return "grid-template-rows: subgrid;";

  // Col span
  match = className.match(/^col-span-(\d+)$/);
  if (match) return `grid-column: span ${match[1]} / span ${match[1]};`;
  if (className === "col-span-full") return "grid-column: 1 / -1;";

  match = className.match(/^col-start-(\d+)$/);
  if (match) return `grid-column-start: ${match[1]};`;
  match = className.match(/^col-end-(\d+)$/);
  if (match) return `grid-column-end: ${match[1]};`;

  // Row span
  match = className.match(/^row-span-(\d+)$/);
  if (match) return `grid-row: span ${match[1]} / span ${match[1]};`;
  if (className === "row-span-full") return "grid-row: 1 / -1;";

  // Order
  match = className.match(/^order-(\d+)$/);
  if (match) return `order: ${match[1]};`;
  if (className === "order-first") return "order: -9999;";
  if (className === "order-last") return "order: 9999;";
  if (className === "order-none") return "order: 0;";

  return null;
}

export function tailwindClassToCss(className: string): string | null {
  // Check static map first
  if (twToCssMap[className]) return twToCssMap[className];
  // Try dynamic patterns
  return dynamicTwToCss(className);
}

// Common patterns for reference table
export const commonPatterns: Array<{ css: string; tailwind: string; category: string }> = [
  // Layout
  { css: "display: flex", tailwind: "flex", category: "Layout" },
  { css: "display: grid", tailwind: "grid", category: "Layout" },
  { css: "display: none", tailwind: "hidden", category: "Layout" },
  { css: "display: block", tailwind: "block", category: "Layout" },
  { css: "position: relative", tailwind: "relative", category: "Layout" },
  { css: "position: absolute", tailwind: "absolute", category: "Layout" },
  { css: "position: fixed", tailwind: "fixed", category: "Layout" },
  { css: "position: sticky", tailwind: "sticky", category: "Layout" },

  // Flexbox
  { css: "flex-direction: column", tailwind: "flex-col", category: "Flexbox" },
  { css: "justify-content: center", tailwind: "justify-center", category: "Flexbox" },
  { css: "justify-content: space-between", tailwind: "justify-between", category: "Flexbox" },
  { css: "align-items: center", tailwind: "items-center", category: "Flexbox" },
  { css: "flex-wrap: wrap", tailwind: "flex-wrap", category: "Flexbox" },
  { css: "flex: 1 1 0%", tailwind: "flex-1", category: "Flexbox" },
  { css: "gap: 1rem", tailwind: "gap-4", category: "Flexbox" },

  // Spacing
  { css: "padding: 1rem", tailwind: "p-4", category: "Spacing" },
  { css: "padding: 0.5rem 1rem", tailwind: "px-4 py-2", category: "Spacing" },
  { css: "margin: 0 auto", tailwind: "mx-auto", category: "Spacing" },
  { css: "margin-top: 1rem", tailwind: "mt-4", category: "Spacing" },
  { css: "margin-bottom: 2rem", tailwind: "mb-8", category: "Spacing" },

  // Sizing
  { css: "width: 100%", tailwind: "w-full", category: "Sizing" },
  { css: "height: 100%", tailwind: "h-full", category: "Sizing" },
  { css: "max-width: 80rem", tailwind: "max-w-7xl", category: "Sizing" },
  { css: "min-height: 100vh", tailwind: "min-h-screen", category: "Sizing" },

  // Typography
  { css: "font-size: 0.875rem", tailwind: "text-sm", category: "Typography" },
  { css: "font-size: 1.25rem", tailwind: "text-xl", category: "Typography" },
  { css: "font-size: 1.5rem", tailwind: "text-2xl", category: "Typography" },
  { css: "font-weight: 700", tailwind: "font-bold", category: "Typography" },
  { css: "font-weight: 600", tailwind: "font-semibold", category: "Typography" },
  { css: "text-align: center", tailwind: "text-center", category: "Typography" },
  { css: "text-transform: uppercase", tailwind: "uppercase", category: "Typography" },
  { css: "line-height: 1.5", tailwind: "leading-normal", category: "Typography" },

  // Borders
  { css: "border-radius: 0.5rem", tailwind: "rounded-lg", category: "Borders" },
  { css: "border-radius: 9999px", tailwind: "rounded-full", category: "Borders" },
  { css: "border-width: 1px", tailwind: "border", category: "Borders" },
  { css: "border-style: solid", tailwind: "border-solid", category: "Borders" },

  // Effects
  { css: "box-shadow: 0 1px 3px ...", tailwind: "shadow", category: "Effects" },
  { css: "box-shadow: 0 10px 15px ...", tailwind: "shadow-lg", category: "Effects" },
  { css: "opacity: 0.5", tailwind: "opacity-50", category: "Effects" },

  // Misc
  { css: "cursor: pointer", tailwind: "cursor-pointer", category: "Interactivity" },
  { css: "overflow: hidden", tailwind: "overflow-hidden", category: "Interactivity" },
  { css: "user-select: none", tailwind: "select-none", category: "Interactivity" },
  { css: "transition-property: all", tailwind: "transition-all", category: "Transitions" },
  { css: "transition-duration: 300ms", tailwind: "duration-300", category: "Transitions" },
];
