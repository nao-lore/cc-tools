"use client";

import { useState, useCallback } from "react";

interface ConvertOptions {
  compactMode: boolean;
  arrayMode: boolean;
}

function xmlNodeToJson(node: Node, options: ConvertOptions): unknown {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? "").trim();
  }

  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return node.textContent ?? "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const el = node as Element;
  const obj: Record<string, unknown> = {};

  // Attributes with @ prefix
  if (el.attributes.length > 0) {
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      obj[`@${attr.name}`] = attr.value;
    }
  }

  // Children
  const childNodes = Array.from(el.childNodes);
  const elementChildren = childNodes.filter(
    (n) => n.nodeType === Node.ELEMENT_NODE
  );
  const textChildren = childNodes
    .filter((n) => n.nodeType === Node.TEXT_NODE || n.nodeType === Node.CDATA_SECTION_NODE)
    .map((n) => (n.textContent ?? "").trim())
    .filter((t) => t.length > 0);

  if (elementChildren.length === 0) {
    // Leaf node
    const textContent = textChildren.join("").trim();
    if (options.compactMode && el.attributes.length === 0) {
      return textContent || null;
    }
    if (textContent) {
      obj["#text"] = textContent;
    }
  } else {
    // Has element children - group by tag name
    const grouped: Record<string, unknown[]> = {};
    for (const child of elementChildren) {
      const childEl = child as Element;
      const tag = childEl.tagName;
      if (!grouped[tag]) grouped[tag] = [];
      grouped[tag].push(xmlNodeToJson(child, options));
    }

    for (const [tag, values] of Object.entries(grouped)) {
      if (options.arrayMode) {
        obj[tag] = values;
      } else {
        obj[tag] = values.length === 1 ? values[0] : values;
      }
    }

    // Mixed content text
    if (textChildren.length > 0) {
      obj["#text"] = textChildren.join(" ");
    }
  }

  // Compact: merge #text into value if only attr + #text
  if (options.compactMode) {
    const keys = Object.keys(obj);
    const attrKeys = keys.filter((k) => k.startsWith("@"));
    const hasText = "#text" in obj;
    const hasChildren = keys.some((k) => !k.startsWith("@") && k !== "#text");
    if (attrKeys.length === 0 && hasText && !hasChildren) {
      return obj["#text"];
    }
  }

  return Object.keys(obj).length === 0 ? null : obj;
}

function convertXmlToJson(xmlString: string, options: ConvertOptions): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");

  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    const msg = parseError.textContent ?? "Invalid XML";
    throw new Error(msg.replace(/\n+/g, " ").trim());
  }

  const root = doc.documentElement;
  const result: Record<string, unknown> = {};
  result[root.tagName] = xmlNodeToJson(root, options);

  return JSON.stringify(result, null, 2);
}

const EXAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book id="1" genre="fiction">
    <title>The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <price>9.99</price>
  </book>
  <book id="2" genre="non-fiction">
    <title>Sapiens</title>
    <author>Yuval Noah Harari</author>
    <price>14.99</price>
  </book>
</bookstore>`;

export default function XmlToJson() {
  const [input, setInput] = useState(EXAMPLE_XML);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [compactMode, setCompactMode] = useState(false);
  const [arrayMode, setArrayMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const convert = useCallback(() => {
    setError("");
    setOutput("");
    if (!input.trim()) {
      setError("Please enter XML to convert.");
      return;
    }
    try {
      const json = convertXmlToJson(input, { compactMode, arrayMode });
      setOutput(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse XML.");
    }
  }, [input, compactMode, arrayMode]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <div className="space-y-6">
      {/* Options */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={compactMode}
            onChange={(e) => setCompactMode(e.target.checked)}
            className="w-4 h-4 accent-[var(--primary)]"
          />
          <span className="text-sm font-medium">
            Compact mode
            <span className="text-[var(--muted-fg)] font-normal ml-1">
              (merge text + attrs into value when possible)
            </span>
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={arrayMode}
            onChange={(e) => setArrayMode(e.target.checked)}
            className="w-4 h-4 accent-[var(--primary)]"
          />
          <span className="text-sm font-medium">
            Array mode
            <span className="text-[var(--muted-fg)] font-normal ml-1">
              (always wrap children in arrays)
            </span>
          </span>
        </label>
      </div>

      {/* Input / Output grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* XML Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">XML Input</label>
            <button
              onClick={() => setInput("")}
              className="text-xs text-[var(--muted-fg)] hover:text-[var(--foreground)] transition-colors"
            >
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your XML here..."
            spellCheck={false}
            className="w-full h-80 font-mono text-sm p-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y"
          />
        </div>

        {/* JSON Output */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">JSON Output</label>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="text-xs px-2 py-1 rounded border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-40 transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!output}
                className="text-xs px-2 py-1 rounded border border-[var(--border)] hover:bg-[var(--muted)] disabled:opacity-40 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
          <div className="relative h-80">
            {error ? (
              <div className="w-full h-full font-mono text-sm p-3 rounded-lg border border-red-300 bg-red-50 text-red-700 overflow-auto whitespace-pre-wrap">
                {error}
              </div>
            ) : (
              <textarea
                readOnly
                value={output}
                placeholder="JSON output will appear here..."
                spellCheck={false}
                className="w-full h-full font-mono text-sm p-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] focus:outline-none resize-none"
              />
            )}
          </div>
        </div>
      </div>

      {/* Convert button */}
      <div className="flex justify-center">
        <button
          onClick={convert}
          className="px-8 py-2.5 bg-[var(--primary)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          Convert to JSON
        </button>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this XML to JSON Converter tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Convert XML documents to JSON representation. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this XML to JSON Converter tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Convert XML documents to JSON representation. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
