/**
 * Maps each tool slug to a category slug.
 * Derived from the `category` field in tools-config.ts, mapped to the new slugs in categories.ts.
 */
export const toolCategoryMap: Record<string, string> = {
  // AI Tools
  "ai-coding-tool-comparison": "ai-tools",
  "ai-video-pricing": "ai-tools",

  // SaaS Pricing
  "auth-service-comparison": "saas-pricing",

  // CSS & Design
  "css-gradient": "css-design",
  "css-box-shadow": "css-design",
  "css-flexbox": "css-design",
  "css-grid": "css-design",
  "css-animation": "css-design",
  "border-radius": "css-design",
  "tailwindconvert": "css-design",
  "px-to-rem": "css-design",
  "color-converter": "css-design",
  "color-palette": "css-design",

  // Text & String Tools
  "mdtable": "text-tools",
  "text-diff": "text-tools",
  "word-counter": "text-tools",
  "markdown-preview": "text-tools",
  "dummy-text": "text-tools",
  "ascii-art": "text-tools",
  "moji-count": "text-tools",
  "zenkaku-hankaku": "text-tools",
  "furigana": "text-tools",

  // Data Format Tools
  "json-formatter": "data-format",
  "json-to-csv": "data-format",
  "yaml-to-json": "data-format",
  "xml-formatter": "data-format",
  "sql-formatter": "data-format",
  "html-to-markdown": "data-format",

  // Encoding & Decoding
  "base64-tools": "encoding",
  "url-encoder": "encoding",
  "html-entity": "encoding",
  "jwt-decoder": "encoding",
  "image-to-base64": "encoding",
  "hash-generator": "encoding",
  "binary-converter": "encoding",

  // Image Tools
  "svg-to-png": "image-tools",
  "image-compressor": "image-tools",
  "favicon-generator": "image-tools",
  "placeholder-image": "image-tools",
  "qr-generator": "image-tools",

  // Tax Tools
  "tax-calculator": "tax-tools",
  "aojiro-shinkoku-sim": "tax-tools",
  "tedori-keisan": "tax-tools",

  // Life & Money
  "bmi-keisan": "life-money",
  "waribiki-keisan": "life-money",
  "loan-simulator": "life-money",
  "risoku-keisan": "life-money",
  "tsumitate-sim": "life-money",
  "denki-keisan": "life-money",
  "calorie-keisan": "life-money",
  "nenrei-keisan": "life-money",
  "menseki-keisan": "life-money",
  "nissuu-keisan": "life-money",
  "eigyoubi": "life-money",
  "wareki-converter": "life-money",

  // Developer Tools
  "regex-tester": "dev-tools",
  "uuid-generator": "dev-tools",
  "cron-generator": "dev-tools",
  "epoch-converter": "dev-tools",
  "chmod-calculator": "dev-tools",
  "http-status": "dev-tools",
  "password-generator": "dev-tools",
  "meta-tag-generator": "dev-tools",
  "og-image-preview": "dev-tools",
  "robots-txt-generator": "dev-tools",
  "minify-js": "dev-tools",
  "minify-css": "dev-tools",
  "timezone-converter": "dev-tools",
  "aspect-ratio": "dev-tools",
  "ascii-flowchart": "dev-tools",

  // Math & Stats
  "ab-test-significance": "math-stats",
};

export function getCategorySlugForTool(toolSlug: string): string | undefined {
  return toolCategoryMap[toolSlug];
}
