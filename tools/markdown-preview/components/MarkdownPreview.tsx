"use client";

import { useState, useMemo, useCallback } from "react";

const DEFAULT_MARKDOWN = `# Markdown Preview

Welcome to the **Markdown Preview** tool! This editor supports real-time rendering of your Markdown content.

## Features

- **Bold text** and *italic text*
- Inline \`code\` formatting
- [Links](https://example.com) and images
- Lists, blockquotes, tables, and more

## Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("World"));
\`\`\`

## Blockquote

> Markdown is a lightweight markup language that you can use to add formatting elements to plaintext documents.

## Table

| Feature | Supported | Notes |
|---------|-----------|-------|
| Headings | Yes | h1 through h6 |
| Bold/Italic | Yes | **bold** and *italic* |
| Links | Yes | [text](url) |
| Images | Yes | ![alt](url) |
| Code Blocks | Yes | With language hint |
| Tables | Yes | With alignment |
| Lists | Yes | Ordered and unordered |

## Ordered List

1. First item
2. Second item
3. Third item

---

### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

That's it! Start editing on the left to see your changes rendered in real time.
`;

function parseMarkdown(md: string): string {
  let html = "";
  const lines = md.split("\n");
  let i = 0;
  let inCodeBlock = false;
  let codeContent = "";
  let inList: "ul" | "ol" | null = null;

  function closeList() {
    if (inList) {
      html += inList === "ul" ? "</ul>" : "</ol>";
      inList = null;
    }
  }

  function parseInline(text: string): string {
    // Images ![alt](url)
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
    // Links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    // Bold **text** or __text__
    text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__(.+?)__/g, "<strong>$1</strong>");
    // Italic *text* or _text_
    text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
    text = text.replace(/(?<![a-zA-Z0-9])_(.+?)_(?![a-zA-Z0-9])/g, "<em>$1</em>");
    // Inline code `text`
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
    return text;
  }

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        closeList();
        inCodeBlock = true;
        codeContent = "";
        i++;
        continue;
      } else {
        inCodeBlock = false;
        const escaped = codeContent
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        html += `<pre><code>${escaped}</code></pre>`;
        i++;
        continue;
      }
    }

    if (inCodeBlock) {
      codeContent += (codeContent ? "\n" : "") + line;
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      closeList();
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
      closeList();
      html += "<hr />";
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      html += `<h${level}>${parseInline(headingMatch[2])}</h${level}>`;
      i++;
      continue;
    }

    // Table detection
    if (line.includes("|") && i + 1 < lines.length && /^\|?[\s-:|]+\|?$/.test(lines[i + 1].trim())) {
      closeList();
      // Parse header
      const headerCells = line.split("|").map((c) => c.trim()).filter((c) => c !== "");
      // Parse separator for alignment
      const sepCells = lines[i + 1].split("|").map((c) => c.trim()).filter((c) => c !== "");
      const aligns: string[] = sepCells.map((sep) => {
        if (sep.startsWith(":") && sep.endsWith(":")) return "center";
        if (sep.endsWith(":")) return "right";
        return "left";
      });

      html += "<table><thead><tr>";
      headerCells.forEach((cell, idx) => {
        const align = aligns[idx] || "left";
        html += `<th style="text-align:${align}">${parseInline(cell)}</th>`;
      });
      html += "</tr></thead><tbody>";

      i += 2; // skip header + separator
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        const rowCells = lines[i].split("|").map((c) => c.trim()).filter((c) => c !== "");
        html += "<tr>";
        rowCells.forEach((cell, idx) => {
          const align = aligns[idx] || "left";
          html += `<td style="text-align:${align}">${parseInline(cell)}</td>`;
        });
        html += "</tr>";
        i++;
      }
      html += "</tbody></table>";
      continue;
    }

    // Blockquote
    if (line.startsWith(">")) {
      closeList();
      let quoteContent = "";
      while (i < lines.length && lines[i].startsWith(">")) {
        quoteContent += (quoteContent ? " " : "") + lines[i].replace(/^>\s?/, "");
        i++;
      }
      html += `<blockquote><p>${parseInline(quoteContent)}</p></blockquote>`;
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
    if (ulMatch) {
      if (inList !== "ul") {
        closeList();
        html += "<ul>";
        inList = "ul";
      }
      html += `<li>${parseInline(ulMatch[1])}</li>`;
      i++;
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
    if (olMatch) {
      if (inList !== "ol") {
        closeList();
        html += "<ol>";
        inList = "ol";
      }
      html += `<li>${parseInline(olMatch[1])}</li>`;
      i++;
      continue;
    }

    // Paragraph
    closeList();
    html += `<p>${parseInline(line)}</p>`;
    i++;
  }

  // Close any remaining open code block
  if (inCodeBlock) {
    const escaped = codeContent
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    html += `<pre><code>${escaped}</code></pre>`;
  }

  closeList();
  return html;
}

type ViewMode = "split" | "edit" | "preview";

export default function MarkdownPreview() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  const htmlOutput = useMemo(() => parseMarkdown(markdown), [markdown]);

  const wordCount = useMemo(() => {
    const text = markdown.trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  }, [markdown]);

  const charCount = markdown.length;

  const copyHtml = useCallback(async () => {
    await navigator.clipboard.writeText(htmlOutput);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  }, [htmlOutput]);

  const copyMarkdown = useCallback(async () => {
    await navigator.clipboard.writeText(markdown);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  }, [markdown]);

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-200">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("edit")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              viewMode === "edit"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setViewMode("split")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              viewMode === "split"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Split
          </button>
          <button
            onClick={() => setViewMode("preview")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              viewMode === "preview"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Preview
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {wordCount} words &middot; {charCount} chars
          </span>
          <button
            onClick={copyMarkdown}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {copiedMd ? (
              <span className="checkmark-animate text-green-600">Copied!</span>
            ) : (
              "Copy MD"
            )}
          </button>
          <button
            onClick={copyHtml}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {copiedHtml ? (
              <span className="checkmark-animate text-green-600">Copied!</span>
            ) : (
              "Copy HTML"
            )}
          </button>
        </div>
      </div>

      {/* Editor + Preview */}
      <div
        className={`grid gap-4 ${
          viewMode === "split"
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1"
        }`}
        style={{ minHeight: "70vh" }}
      >
        {/* Editor */}
        {viewMode !== "preview" && (
          <div className="flex flex-col">
            <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Markdown
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="flex-1 w-full p-4 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
              style={{ minHeight: "60vh" }}
              spellCheck={false}
              placeholder="Type your Markdown here..."
            />
          </div>
        )}

        {/* Preview */}
        {viewMode !== "edit" && (
          <div className="flex flex-col">
            <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Preview
            </div>
            <div
              className="flex-1 w-full p-4 border border-gray-200 rounded-lg bg-white overflow-auto markdown-body"
              style={{ minHeight: "60vh" }}
              dangerouslySetInnerHTML={{ __html: htmlOutput }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
