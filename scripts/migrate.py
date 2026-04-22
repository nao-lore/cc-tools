#!/usr/bin/env python3
"""
cc-factory monorepo migration script.
Copies 53 individual tool repos into cc-tools monorepo structure.
"""

import json
import os
import re
import shutil
from pathlib import Path

PROJECTS = Path.home() / "projects"
CC_TOOLS = PROJECTS / "cc-tools"
TOOLS_DIR = CC_TOOLS / "tools"
APP_DIR = CC_TOOLS / "app"

# All 53 tools with their metadata (from cc-tools page.tsx)
TOOLS = [
    # Text & String Tools
    {"slug": "mdtable", "name": "Markdown Table Generator", "desc": "Create and edit Markdown tables visually", "market": "EN", "category": "Text & String Tools", "url": "https://mdtable.vercel.app"},
    {"slug": "text-diff", "name": "Text Diff Checker", "desc": "Compare two texts and highlight differences", "market": "EN", "category": "Text & String Tools", "url": "https://text-diff-mu.vercel.app"},
    {"slug": "word-counter", "name": "Word & Character Counter", "desc": "Count words, characters, sentences, and paragraphs", "market": "EN", "category": "Text & String Tools", "url": "https://word-counter-seven-khaki.vercel.app"},
    {"slug": "markdown-preview", "name": "Markdown Live Preview", "desc": "Write Markdown and preview rendered output in real time", "market": "EN", "category": "Text & String Tools", "url": "https://markdown-preview-pi-sandy.vercel.app"},
    {"slug": "dummy-text", "name": "Placeholder Text Generator", "desc": "Generate lorem ipsum and other placeholder text", "market": "EN", "category": "Text & String Tools", "url": "https://dummy-text-murex.vercel.app"},
    {"slug": "ascii-art", "name": "ASCII Art Generator", "desc": "Convert text into ASCII art with various fonts", "market": "EN", "category": "Text & String Tools", "url": "https://ascii-art-mu.vercel.app"},
    # Data Format Tools
    {"slug": "json-formatter", "name": "JSON Formatter & Validator", "desc": "Format, validate, and beautify JSON data", "market": "EN", "category": "Data Format Tools", "url": "https://json-formatter-topaz-pi.vercel.app"},
    {"slug": "json-to-csv", "name": "JSON to CSV Converter", "desc": "Convert JSON arrays to CSV format", "market": "EN", "category": "Data Format Tools", "url": "https://json-to-csv-rho.vercel.app"},
    {"slug": "yaml-to-json", "name": "YAML to JSON Converter", "desc": "Convert between YAML and JSON formats", "market": "EN", "category": "Data Format Tools", "url": "https://yaml-to-json-theta.vercel.app"},
    {"slug": "xml-formatter", "name": "XML Formatter", "desc": "Format and prettify XML documents", "market": "EN", "category": "Data Format Tools", "url": "https://xml-formatter-xi.vercel.app"},
    {"slug": "sql-formatter", "name": "SQL Formatter", "desc": "Format and beautify SQL queries", "market": "EN", "category": "Data Format Tools", "url": "https://sql-formatter-liart.vercel.app"},
    {"slug": "html-to-markdown", "name": "HTML to Markdown", "desc": "Convert HTML markup to Markdown syntax", "market": "EN", "category": "Data Format Tools", "url": "https://html-to-markdown-kappa.vercel.app"},
    # Encoding & Decoding
    {"slug": "base64-tools", "name": "Base64 Encoder/Decoder", "desc": "Encode and decode Base64 strings", "market": "EN", "category": "Encoding & Decoding", "url": "https://base64-tools-three.vercel.app"},
    {"slug": "url-encoder", "name": "URL Encoder/Decoder", "desc": "Encode and decode URL components", "market": "EN", "category": "Encoding & Decoding", "url": "https://url-encoder-pi.vercel.app"},
    {"slug": "html-entity", "name": "HTML Entity Encoder", "desc": "Encode and decode HTML entities", "market": "EN", "category": "Encoding & Decoding", "url": "https://html-entity-sigma.vercel.app"},
    {"slug": "jwt-decoder", "name": "JWT Decoder", "desc": "Decode and inspect JSON Web Tokens", "market": "EN", "category": "Encoding & Decoding", "url": "https://jwt-decoder-five.vercel.app"},
    {"slug": "image-to-base64", "name": "Image to Base64", "desc": "Convert images to Base64 encoded strings", "market": "EN", "category": "Encoding & Decoding", "url": "https://image-to-base64-five.vercel.app"},
    {"slug": "hash-generator", "name": "Hash Generator", "desc": "Generate MD5, SHA-1, SHA-256, and other hashes", "market": "EN", "category": "Encoding & Decoding", "url": "https://hash-generator-coral.vercel.app"},
    {"slug": "binary-converter", "name": "Binary/Decimal/Hex Converter", "desc": "Convert between binary, decimal, and hexadecimal", "market": "EN", "category": "Encoding & Decoding", "url": "https://binary-converter-one.vercel.app"},
    # CSS Tools
    {"slug": "css-gradient", "name": "CSS Gradient Generator", "desc": "Create linear and radial CSS gradients visually", "market": "EN", "category": "CSS Tools", "url": "https://css-gradient-beta.vercel.app"},
    {"slug": "css-box-shadow", "name": "CSS Box Shadow", "desc": "Design box shadows with a visual editor", "market": "EN", "category": "CSS Tools", "url": "https://css-box-shadow-gamma.vercel.app"},
    {"slug": "css-flexbox", "name": "CSS Flexbox Generator", "desc": "Build flexbox layouts with a visual playground", "market": "EN", "category": "CSS Tools", "url": "https://css-flexbox-rho.vercel.app"},
    {"slug": "css-grid", "name": "CSS Grid Generator", "desc": "Create CSS Grid layouts visually", "market": "EN", "category": "CSS Tools", "url": "https://css-grid-two-mocha.vercel.app"},
    {"slug": "css-animation", "name": "CSS Animation Generator", "desc": "Build CSS keyframe animations with a visual editor", "market": "EN", "category": "CSS Tools", "url": "https://css-animation-tawny.vercel.app"},
    {"slug": "border-radius", "name": "Border Radius Generator", "desc": "Create custom border radius values visually", "market": "EN", "category": "CSS Tools", "url": "https://border-radius-nine.vercel.app"},
    {"slug": "tailwindconvert", "name": "CSS to Tailwind Converter", "desc": "Convert vanilla CSS to Tailwind CSS utility classes", "market": "EN", "category": "CSS Tools", "url": "https://tailwindconvert.vercel.app"},
    {"slug": "px-to-rem", "name": "PX to REM Converter", "desc": "Convert pixel values to REM units", "market": "EN", "category": "CSS Tools", "url": "https://px-to-rem-rust.vercel.app"},
    # Color Tools
    {"slug": "color-converter", "name": "Color Converter", "desc": "Convert between HEX, RGB, HSL, and other color formats", "market": "EN", "category": "Color Tools", "url": "https://color-converter-inky.vercel.app"},
    {"slug": "color-palette", "name": "Color Palette Generator", "desc": "Generate harmonious color palettes", "market": "EN", "category": "Color Tools", "url": "https://color-palette-sand.vercel.app"},
    # Image Tools
    {"slug": "svg-to-png", "name": "SVG to PNG Converter", "desc": "Convert SVG files to PNG images", "market": "EN", "category": "Image Tools", "url": "https://svg-to-png-six.vercel.app"},
    {"slug": "image-compressor", "name": "Image Compressor", "desc": "Compress images without losing quality", "market": "EN", "category": "Image Tools", "url": "https://image-compressor-eight-tawny.vercel.app"},
    {"slug": "favicon-generator", "name": "Favicon Generator", "desc": "Generate favicons from text, emoji, or images", "market": "EN", "category": "Image Tools", "url": "https://favicon-generator-psi.vercel.app"},
    {"slug": "placeholder-image", "name": "Placeholder Image Generator", "desc": "Create placeholder images with custom dimensions", "market": "EN", "category": "Image Tools", "url": "https://placeholder-image-fmq8sxvq6-naos-projects-52ff71e9.vercel.app"},
    {"slug": "qr-generator", "name": "QR Code Generator", "desc": "Generate QR codes from text or URLs", "market": "EN", "category": "Image Tools", "url": "https://qr-generator-ten-wheat.vercel.app"},
    # Developer Tools
    {"slug": "regex-tester", "name": "Regex Tester", "desc": "Test and debug regular expressions with live matching", "market": "EN", "category": "Developer Tools", "url": "https://regex-tester-three.vercel.app"},
    {"slug": "uuid-generator", "name": "UUID Generator", "desc": "Generate UUID v4 identifiers", "market": "EN", "category": "Developer Tools", "url": "https://uuid-generator-eight-psi.vercel.app"},
    {"slug": "cron-generator", "name": "Cron Expression Generator", "desc": "Build and validate cron schedule expressions", "market": "EN", "category": "Developer Tools", "url": "https://cron-generator-beryl.vercel.app"},
    {"slug": "epoch-converter", "name": "Unix Timestamp Converter", "desc": "Convert between Unix timestamps and dates", "market": "EN", "category": "Developer Tools", "url": "https://epoch-converter-eosin.vercel.app"},
    {"slug": "chmod-calculator", "name": "Chmod Calculator", "desc": "Calculate file permission values", "market": "EN", "category": "Developer Tools", "url": "https://chmod-calculator-gules.vercel.app"},
    {"slug": "http-status", "name": "HTTP Status Codes", "desc": "Reference for all HTTP status codes", "market": "EN", "category": "Developer Tools", "url": "https://http-status-eight.vercel.app"},
    {"slug": "password-generator", "name": "Password Generator", "desc": "Generate secure random passwords", "market": "EN", "category": "Developer Tools", "url": "https://password-generator-sepia-beta.vercel.app"},
    # SEO Tools
    {"slug": "meta-tag-generator", "name": "Meta Tag Generator", "desc": "Generate HTML meta tags for SEO", "market": "EN", "category": "SEO Tools", "url": "https://meta-tag-generator-indol.vercel.app"},
    {"slug": "og-image-preview", "name": "OG Image Preview", "desc": "Preview Open Graph images for social sharing", "market": "EN", "category": "SEO Tools", "url": "https://og-image-preview-eight.vercel.app"},
    {"slug": "robots-txt-generator", "name": "Robots.txt Generator", "desc": "Generate robots.txt files for search engines", "market": "EN", "category": "SEO Tools", "url": "https://robots-txt-generator-nine.vercel.app"},
    # Minifier Tools
    {"slug": "minify-js", "name": "JavaScript Minifier", "desc": "Minify JavaScript code to reduce file size", "market": "EN", "category": "Minifier Tools", "url": "https://minify-js.vercel.app"},
    {"slug": "minify-css", "name": "CSS Minifier", "desc": "Minify CSS stylesheets to reduce file size", "market": "EN", "category": "Minifier Tools", "url": "https://minify-css.vercel.app"},
    # Time & Date
    {"slug": "timezone-converter", "name": "Time Zone Converter", "desc": "Convert times between different time zones", "market": "EN", "category": "Time & Date", "url": "https://timezone-converter-rouge-two.vercel.app"},
    {"slug": "aspect-ratio", "name": "Aspect Ratio Calculator", "desc": "Calculate and convert aspect ratios", "market": "EN", "category": "Time & Date", "url": "https://aspect-ratio-pi.vercel.app"},
    # Japanese Tools
    {"slug": "eigyoubi", "name": "営業日数計算", "desc": "Calculate business days between dates", "market": "JP", "category": "Japanese Tools", "url": "https://eigyoubi.vercel.app"},
    {"slug": "wareki-converter", "name": "和暦西暦変換", "desc": "Convert between Japanese and Western calendar years", "market": "JP", "category": "Japanese Tools", "url": "https://wareki-converter-mu.vercel.app"},
    {"slug": "zenkaku-hankaku", "name": "全角半角変換", "desc": "Convert between fullwidth and halfwidth characters", "market": "JP", "category": "Japanese Tools", "url": "https://zenkaku-hankaku.vercel.app"},
    {"slug": "furigana", "name": "ふりがな変換", "desc": "Add furigana readings to Japanese text", "market": "JP", "category": "Japanese Tools", "url": "https://furigana-beta.vercel.app"},
    {"slug": "tax-calculator", "name": "税金計算", "desc": "Calculate Japanese consumption tax", "market": "JP", "category": "Japanese Tools", "url": "https://tax-calculator-lilac-three.vercel.app"},
]

SLUG_TO_URL = {t["slug"]: t["url"] for t in TOOLS}


def detect_structure(tool_dir: Path) -> str:
    """Detect tool directory structure pattern."""
    if (tool_dir / "src" / "app" / "page.tsx").exists():
        return "src-app"
    elif (tool_dir / "app" / "page.tsx").exists():
        # Check if components are at root level (eigyoubi pattern)
        if (tool_dir / "components").exists() and not (tool_dir / "app" / "components").exists():
            return "app-root-components"
        return "app"
    return "unknown"


def get_source_files(tool_dir: Path, pattern: str) -> list[tuple[Path, Path]]:
    """
    Returns list of (source_path, relative_dest_path) tuples.
    Normalizes all structures to: page.tsx, components/*, lib/*
    """
    files = []

    if pattern == "app":
        # page.tsx
        files.append((tool_dir / "app" / "page.tsx", Path("page.tsx")))
        # app/components/*
        comp_dir = tool_dir / "app" / "components"
        if comp_dir.exists():
            for f in comp_dir.iterdir():
                if f.suffix in (".tsx", ".ts"):
                    files.append((f, Path("components") / f.name))
        # app/lib/*
        lib_dir = tool_dir / "app" / "lib"
        if lib_dir.exists():
            for f in lib_dir.iterdir():
                if f.suffix in (".tsx", ".ts"):
                    files.append((f, Path("lib") / f.name))

    elif pattern == "app-root-components":
        files.append((tool_dir / "app" / "page.tsx", Path("page.tsx")))
        # components at root level
        comp_dir = tool_dir / "components"
        if comp_dir.exists():
            for f in comp_dir.iterdir():
                if f.suffix in (".tsx", ".ts"):
                    files.append((f, Path("components") / f.name))
        # lib at root level
        lib_dir = tool_dir / "lib"
        if lib_dir.exists():
            for f in lib_dir.iterdir():
                if f.suffix in (".tsx", ".ts"):
                    files.append((f, Path("lib") / f.name))

    elif pattern == "src-app":
        files.append((tool_dir / "src" / "app" / "page.tsx", Path("page.tsx")))
        # src/app/components/*
        comp_dir = tool_dir / "src" / "app" / "components"
        if comp_dir.exists():
            for f in comp_dir.iterdir():
                if f.suffix in (".tsx", ".ts"):
                    files.append((f, Path("components") / f.name))
        # src/components/*
        comp_dir2 = tool_dir / "src" / "components"
        if comp_dir2.exists():
            for f in comp_dir2.iterdir():
                if f.suffix in (".tsx", ".ts"):
                    files.append((f, Path("components") / f.name))
        # src/lib/*
        lib_dir = tool_dir / "src" / "lib"
        if lib_dir.exists():
            for f in lib_dir.iterdir():
                if f.suffix in (".tsx", ".ts"):
                    files.append((f, Path("lib") / f.name))

    return files


def rewrite_imports(content: str, dest_rel: Path, pattern: str) -> str:
    """Rewrite import paths to work in the monorepo tools/ structure."""
    # Determine how many levels deep this file is (page.tsx = 0, components/X.tsx = 1)
    depth = len(dest_rel.parts) - 1  # 0 for page.tsx, 1 for components/X.tsx or lib/X.tsx

    # Handle both single and double quotes: from "..." or from '...'
    q = r"""['"]"""  # matches ' or "

    if pattern == "app":
        # ./components/X stays as-is for page.tsx
        # No @/ imports in this pattern
        pass

    elif pattern == "app-root-components":
        # ../components/X → ./components/X (for page.tsx)
        if depth == 0:
            content = re.sub(r"""(from\s+['"])\.\./(components|lib)/""", r'\1./\2/', content)
        # @/components/X → ../components/X (for lib files)
        elif depth == 1:
            content = re.sub(r"""(from\s+['"])@/(components|lib)/""", r'\1../\2/', content)

    elif pattern == "src-app":
        if depth == 0:
            # @/components/X → ./components/X
            content = re.sub(r"""(from\s+['"])@/components/""", r'\1./components/', content)
            # @/lib/X → ./lib/X
            content = re.sub(r"""(from\s+['"])@/lib/""", r'\1./lib/', content)
            # ./components/X stays (src/app/components pattern)
        elif depth == 1:
            # @/lib/X → ../lib/X
            content = re.sub(r"""(from\s+['"])@/lib/""", r'\1../lib/', content)
            # @/components/X → ../components/X (rare but possible)
            content = re.sub(r"""(from\s+['"])@/components/""", r'\1../components/', content)

    return content


def extract_metadata(tool_dir: Path, pattern: str) -> dict:
    """Extract title and description from layout.tsx."""
    if pattern == "src-app":
        layout_path = tool_dir / "src" / "app" / "layout.tsx"
    else:
        layout_path = tool_dir / "app" / "layout.tsx"

    if not layout_path.exists():
        return {}

    content = layout_path.read_text()

    title_match = re.search(r'title:\s*["\']([^"\']+)["\']', content)
    desc_match = re.search(r'description:\s*\n?\s*["\']([^"\']+)["\']', content)
    if not desc_match:
        desc_match = re.search(r'description:\s*["\']([^"\']+)["\']', content)

    return {
        "title": title_match.group(1) if title_match else "",
        "description": desc_match.group(1) if desc_match else "",
    }


def copy_tool(tool: dict) -> dict:
    """Copy a single tool into the monorepo."""
    slug = tool["slug"]
    tool_dir = PROJECTS / slug
    dest_dir = TOOLS_DIR / slug

    if not tool_dir.exists():
        print(f"  SKIP {slug} (dir not found)")
        return tool

    pattern = detect_structure(tool_dir)
    if pattern == "unknown":
        print(f"  SKIP {slug} (unknown structure)")
        return tool

    # Get source files
    source_files = get_source_files(tool_dir, pattern)

    # Create destination directory
    dest_dir.mkdir(parents=True, exist_ok=True)

    # Copy and rewrite files
    for src_path, rel_dest in source_files:
        dest_path = dest_dir / rel_dest
        dest_path.parent.mkdir(parents=True, exist_ok=True)

        content = src_path.read_text()
        content = rewrite_imports(content, rel_dest, pattern)
        dest_path.write_text(content)

    # Extract metadata
    meta = extract_metadata(tool_dir, pattern)
    tool["full_title"] = meta.get("title", tool["name"])
    tool["full_desc"] = meta.get("description", tool["desc"])

    file_count = len(source_files)
    print(f"  OK   {slug} ({pattern}, {file_count} files)")
    return tool


def generate_wrapper(tool: dict):
    """Generate app/[slug]/page.tsx wrapper."""
    slug = tool["slug"]
    wrapper_dir = APP_DIR / slug
    wrapper_dir.mkdir(parents=True, exist_ok=True)

    title = tool.get("full_title", tool["name"])
    desc = tool.get("full_desc", tool["desc"])

    # Escape quotes in strings
    title_escaped = title.replace('"', '\\"')
    desc_escaped = desc.replace('"', '\\"')

    content = f'''import type {{ Metadata }} from "next";
import ToolPage from "@/tools/{slug}/page";

export const metadata: Metadata = {{
  title: "{title_escaped}",
  description: "{desc_escaped}",
  alternates: {{ canonical: "https://tools.loresync.dev/{slug}" }},
}};

export default function Page() {{
  return <ToolPage />;
}}
'''
    (wrapper_dir / "page.tsx").write_text(content)


def generate_tools_config():
    """Generate lib/tools-config.ts."""
    lib_dir = CC_TOOLS / "lib"
    lib_dir.mkdir(parents=True, exist_ok=True)

    # Group by category
    categories = {}
    for t in TOOLS:
        cat = t["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(t)

    lines = [
        'export interface Tool {',
        '  slug: string;',
        '  name: string;',
        '  description: string;',
        '  market: "EN" | "JP";',
        '  category: string;',
        '  oldUrl: string;',
        '}',
        '',
        'export const tools: Tool[] = [',
    ]

    for t in TOOLS:
        lines.append(f'  {{ slug: "{t["slug"]}", name: "{t["name"]}", description: "{t["desc"]}", market: "{t["market"]}", category: "{t["category"]}", oldUrl: "{t["url"]}" }},')

    lines.append('];')
    lines.append('')
    lines.append('export const categories = [...new Set(tools.map(t => t.category))];')
    lines.append('')
    lines.append('export function getToolsByCategory(category: string): Tool[] {')
    lines.append('  return tools.filter(t => t.category === category);')
    lines.append('}')
    lines.append('')
    lines.append('export function getRelatedTools(slug: string, limit = 5): Tool[] {')
    lines.append('  const tool = tools.find(t => t.slug === slug);')
    lines.append('  if (!tool) return [];')
    lines.append('  return tools.filter(t => t.slug !== slug && t.category === tool.category).slice(0, limit);')
    lines.append('}')
    lines.append('')
    lines.append('export function getAllSlugs(): string[] {')
    lines.append('  return tools.map(t => t.slug);')
    lines.append('}')

    (lib_dir / "tools-config.ts").write_text('\n'.join(lines) + '\n')


def generate_sitemap():
    """Generate app/sitemap.ts."""
    content = '''import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://tools.loresync.dev";

  const toolPages = tools.map((tool) => ({
    url: `${baseUrl}/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    ...toolPages,
  ];
}
'''
    (APP_DIR / "sitemap.ts").write_text(content)


def generate_robots():
    """Generate app/robots.ts."""
    content = '''import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://tools.loresync.dev/sitemap.xml",
  };
}
'''
    (APP_DIR / "robots.ts").write_text(content)


def generate_redirects():
    """Generate redirect entries for next.config.ts."""
    redirects = []
    # We'll output the redirects as a JSON file for manual inclusion
    for t in TOOLS:
        old_url = t["url"]
        # Extract the hostname
        host = old_url.replace("https://", "").replace("http://", "")
        redirects.append({
            "source": "/:path*",
            "has": [{"type": "host", "value": host}],
            "destination": f"https://tools.loresync.dev/{t['slug']}",
            "permanent": True,
        })

    redirects_file = CC_TOOLS / "scripts" / "redirects.json"
    with open(redirects_file, "w") as f:
        json.dump(redirects, f, indent=2)
    print(f"\n  Redirects written to {redirects_file}")


def main():
    print("=" * 60)
    print("cc-factory monorepo migration")
    print("=" * 60)

    # Clean existing tools directory
    if TOOLS_DIR.exists():
        shutil.rmtree(TOOLS_DIR)
    TOOLS_DIR.mkdir(parents=True)

    print("\n[1/5] Copying tool source files...")
    for tool in TOOLS:
        copy_tool(tool)

    print(f"\n[2/5] Generating {len(TOOLS)} route wrappers...")
    for tool in TOOLS:
        generate_wrapper(tool)
    print(f"  OK   {len(TOOLS)} wrappers in app/*/page.tsx")

    print("\n[3/5] Generating tools-config.ts...")
    generate_tools_config()
    print("  OK   lib/tools-config.ts")

    print("\n[4/5] Generating sitemap.ts and robots.ts...")
    generate_sitemap()
    generate_robots()
    print("  OK   app/sitemap.ts + app/robots.ts")

    print("\n[5/5] Generating redirect mappings...")
    generate_redirects()

    print("\n" + "=" * 60)
    print(f"Migration complete! {len(TOOLS)} tools copied.")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Update tsconfig.json paths: @/tools/* → ./tools/*")
    print("  2. Update app/layout.tsx (shared layout)")
    print("  3. npm run build to verify")
    print("  4. Deploy to Vercel")


if __name__ == "__main__":
    main()
