import { cssPropertyToTailwind, tailwindClassToCss } from "./mappings";

// ============================================================
// CSS -> Tailwind
// ============================================================

interface CssRule {
  selector: string;
  declarations: Array<{ property: string; value: string }>;
}

function parseCssInput(css: string): CssRule[] {
  const rules: CssRule[] = [];
  // Remove CSS comments
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, "");

  // Try to detect if it's just declarations (no selectors/braces)
  const hasBraces = cleaned.includes("{");

  if (!hasBraces) {
    // Treat as bare declarations
    const declarations = parseDeclarations(cleaned);
    if (declarations.length > 0) {
      rules.push({ selector: "", declarations });
    }
    return rules;
  }

  // Parse rules with selectors
  const ruleRegex = /([^{]+)\{([^}]*)\}/g;
  let match;
  while ((match = ruleRegex.exec(cleaned)) !== null) {
    const selector = match[1].trim();
    const declarations = parseDeclarations(match[2]);
    if (declarations.length > 0) {
      rules.push({ selector, declarations });
    }
  }

  return rules;
}

function parseDeclarations(
  block: string
): Array<{ property: string; value: string }> {
  const declarations: Array<{ property: string; value: string }> = [];
  // Split by semicolons but be careful with values that contain semicolons (rare)
  const parts = block.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;
    const property = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();
    // Remove trailing semicolons and !important
    const cleanValue = value.replace(/\s*!important\s*$/, "").trim();
    if (property && cleanValue) {
      declarations.push({ property, value: cleanValue });
    }
  }
  return declarations;
}

export function cssToTailwind(css: string): string {
  if (!css.trim()) return "";

  const rules = parseCssInput(css);
  const output: string[] = [];

  for (const rule of rules) {
    const classes: string[] = [];
    const unknowns: string[] = [];

    for (const { property, value } of rule.declarations) {
      const tw = cssPropertyToTailwind(property, value);
      if (tw) {
        // Some conversions may return space-separated classes
        classes.push(...tw.split(" "));
      } else {
        unknowns.push(`/* no direct Tailwind equivalent: ${property}: ${value} */`);
      }
    }

    if (rule.selector) {
      output.push(`/* ${rule.selector} */`);
    }

    if (classes.length > 0) {
      output.push(classes.join(" "));
    }

    if (unknowns.length > 0) {
      output.push(unknowns.join("\n"));
    }

    if (rule.selector) {
      output.push(""); // blank line between rules
    }
  }

  return output.join("\n").trim();
}

// ============================================================
// Tailwind -> CSS
// ============================================================

export function tailwindToCss(input: string): string {
  if (!input.trim()) return "";

  // Split classes by whitespace
  const classes = input
    .trim()
    .split(/\s+/)
    .filter((c) => c.length > 0);

  const cssLines: string[] = [];
  const unknowns: string[] = [];

  for (const cls of classes) {
    // Strip common prefixes like hover:, focus:, sm:, md:, lg:, etc.
    // We note them but convert the base class
    let prefix = "";
    let baseClass = cls;

    const prefixMatch = cls.match(
      /^((?:hover|focus|active|group-hover|focus-within|focus-visible|disabled|first|last|odd|even|dark|sm|md|lg|xl|2xl):)+(.+)$/
    );
    if (prefixMatch) {
      prefix = prefixMatch[1];
      baseClass = prefixMatch[2];
    }

    const css = tailwindClassToCss(baseClass);
    if (css) {
      if (prefix) {
        cssLines.push(`/* ${prefix} */ ${css}`);
      } else {
        cssLines.push(css);
      }
    } else {
      unknowns.push(`/* unknown class: ${cls} */`);
    }
  }

  const result: string[] = [];
  if (cssLines.length > 0) {
    result.push(cssLines.join("\n"));
  }
  if (unknowns.length > 0) {
    result.push(unknowns.join("\n"));
  }

  return result.join("\n").trim();
}
