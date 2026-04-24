"use client";

import { useState, useCallback } from "react";

interface Options {
  removeComments: boolean;
  collapseWhitespace: boolean;
  removeOptionalTags: boolean;
  removeAttributeQuotes: boolean;
}

// Tags whose closing tag is optional per the HTML spec
const OPTIONAL_CLOSING_TAGS = new Set([
  "li",
  "dt",
  "dd",
  "p",
  "rt",
  "rp",
  "optgroup",
  "option",
  "colgroup",
  "caption",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "td",
  "th",
]);

// Tags whose content must not be touched (pre, script, style, textarea)
const RAW_CONTENT_TAGS = new Set(["pre", "script", "style", "textarea"]);

function minifyHTML(html: string, options: Options): string {
  let result = html;

  // Remove HTML comments (but not conditional comments <!--[if ...)
  if (options.removeComments) {
    result = result.replace(/<!--(?!\[if\s)[^]*?-->/g, "");
  }

  // Process raw-content tags separately so we don't collapse whitespace inside them
  // We replace them with placeholders, process the rest, then restore.
  const rawBlocks: string[] = [];
  result = result.replace(
    /<(pre|script|style|textarea)(\s[^>]*)?>[\s\S]*?<\/\1>/gi,
    (match) => {
      rawBlocks.push(match);
      return `\x00RAW${rawBlocks.length - 1}\x00`;
    }
  );

  if (options.collapseWhitespace) {
    // Collapse runs of whitespace (spaces, tabs, newlines) to a single space
    result = result.replace(/\s+/g, " ");
    // Remove space around block-level and void tags
    result = result.replace(/\s*(<[^>]+>)\s*/g, (_, tag) => {
      const tagName = tag.match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)/)?.[1]?.toLowerCase();
      const blockTags = new Set([
        "html","head","body","div","p","ul","ol","li","table","thead","tbody","tfoot",
        "tr","th","td","h1","h2","h3","h4","h5","h6","header","footer","main","nav",
        "section","article","aside","figure","figcaption","form","fieldset","legend",
        "details","summary","dialog","template","slot","link","meta","script","style",
        "title","base","br","hr","img","input","area","col","embed","source","track","wbr",
      ]);
      if (tagName && blockTags.has(tagName)) {
        return tag;
      }
      return ` ${tag} `;
    });
    // Clean up multiple spaces again after tag processing
    result = result.replace(/  +/g, " ").trim();
  }

  if (options.removeOptionalTags) {
    // Remove optional closing tags
    result = result.replace(/<\/([a-zA-Z]+)>/g, (match, tagName) => {
      if (OPTIONAL_CLOSING_TAGS.has(tagName.toLowerCase())) {
        return "";
      }
      return match;
    });
  }

  if (options.removeAttributeQuotes) {
    // Remove quotes from attribute values that are safe (no spaces, <, >, ", `, =, &)
    result = result.replace(
      /(<[a-zA-Z][^>]*?\s)([a-zA-Z:_][a-zA-Z0-9:_.-]*)="([^"'`=<>\s]+)"/g,
      (match, prefix, attrName, attrValue) => {
        // Keep quotes if value could be confused with boolean attr or contains special chars
        if (/[=<>`\s'"]/.test(attrValue)) return match;
        return `${prefix}${attrName}=${attrValue}`;
      }
    );
  }

  // Restore raw blocks
  result = result.replace(/\x00RAW(\d+)\x00/g, (_, idx) => rawBlocks[parseInt(idx)]);

  return result.trim();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  return (bytes / 1024).toFixed(1) + " KB";
}

export default function HtmlMinifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<Options>({
    removeComments: true,
    collapseWhitespace: true,
    removeOptionalTags: false,
    removeAttributeQuotes: false,
  });

  const originalSize = new Blob([input]).size;
  const outputSize = new Blob([output]).size;
  const savings = originalSize > 0 ? originalSize - outputSize : 0;
  const savingsPercent =
    originalSize > 0 ? ((savings / originalSize) * 100).toFixed(1) : "0";

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    setOutput(minifyHTML(input, options));
  }, [input, options]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "minified.html";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setCopied(false);
  }, []);

  const toggleOption = useCallback((key: keyof Options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div className="space-y-4">
      {/* Options */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={options.removeComments}
            onChange={() => toggleOption("removeComments")}
            className="rounded border-gray-300 text-gray-900 focus:ring-gray-400 cursor-pointer"
          />
          Remove comments
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={options.collapseWhitespace}
            onChange={() => toggleOption("collapseWhitespace")}
            className="rounded border-gray-300 text-gray-900 focus:ring-gray-400 cursor-pointer"
          />
          Collapse whitespace
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={options.removeOptionalTags}
            onChange={() => toggleOption("removeOptionalTags")}
            className="rounded border-gray-300 text-gray-900 focus:ring-gray-400 cursor-pointer"
          />
          Remove optional closing tags
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={options.removeAttributeQuotes}
            onChange={() => toggleOption("removeAttributeQuotes")}
            className="rounded border-gray-300 text-gray-900 focus:ring-gray-400 cursor-pointer"
          />
          Remove attribute quotes (when safe)
        </label>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleMinify}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Minify
        </button>
        <button
          onClick={handleCopy}
          disabled={!output}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {copied ? "Copied!" : "Copy Output"}
        </button>
        <button
          onClick={handleDownload}
          disabled={!output}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Download
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* Editor panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Input HTML
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your HTML here..."
            spellCheck={false}
            className="w-full h-80 p-3 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
          />
        </div>

        {/* Output */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minified Output
          </label>
          <textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            spellCheck={false}
            className="w-full h-80 p-3 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      {output && (
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <span>
            Original: <strong>{formatBytes(originalSize)}</strong>
          </span>
          <span>
            Minified: <strong>{formatBytes(outputSize)}</strong>
          </span>
          {savings > 0 && (
            <span className="text-green-700">
              Saved: <strong>{formatBytes(savings)}</strong> ({savingsPercent}%)
            </span>
          )}
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this HTML Minifier tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Minify HTML by removing whitespace and comments. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this HTML Minifier tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Minify HTML by removing whitespace and comments. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
