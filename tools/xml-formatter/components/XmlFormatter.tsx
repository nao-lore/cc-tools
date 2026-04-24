"use client";

import { useState, useCallback, useRef } from "react";

type IndentType = "2" | "4" | "tab";

interface ValidationResult {
  valid: boolean;
  error?: string;
  line?: number;
  column?: number;
}

function validateXml(xml: string): ValidationResult {
  if (!xml.trim()) return { valid: true };
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    const text = errorNode.textContent || "Unknown XML error";
    const lineMatch = text.match(/line (\d+)/i);
    const colMatch = text.match(/column (\d+)/i);
    return {
      valid: false,
      error: text.split("\n")[0],
      line: lineMatch ? parseInt(lineMatch[1]) : undefined,
      column: colMatch ? parseInt(colMatch[1]) : undefined,
    };
  }
  return { valid: true };
}

function getIndent(indentType: IndentType): string {
  if (indentType === "tab") return "\t";
  return " ".repeat(parseInt(indentType));
}

function formatXml(xml: string, indentType: IndentType): string {
  const indent = getIndent(indentType);
  let formatted = "";
  let level = 0;
  const trimmed = xml.replace(/>\s*</g, "><").trim();

  // Tokenize
  const tokens: string[] = [];
  let i = 0;
  while (i < trimmed.length) {
    if (trimmed[i] === "<") {
      const end = trimmed.indexOf(">", i);
      if (end === -1) {
        tokens.push(trimmed.substring(i));
        break;
      }
      tokens.push(trimmed.substring(i, end + 1));
      i = end + 1;
    } else {
      const end = trimmed.indexOf("<", i);
      if (end === -1) {
        tokens.push(trimmed.substring(i));
        break;
      }
      const text = trimmed.substring(i, end);
      if (text.trim()) tokens.push(text);
      i = end;
    }
  }

  for (let t = 0; t < tokens.length; t++) {
    const token = tokens[t];
    if (token.startsWith("<?")) {
      // XML declaration
      formatted += indent.repeat(level) + token + "\n";
    } else if (token.startsWith("<!--")) {
      // Comment
      formatted += indent.repeat(level) + token + "\n";
    } else if (token.startsWith("<![CDATA[")) {
      formatted += indent.repeat(level) + token + "\n";
    } else if (token.startsWith("</")) {
      // Closing tag
      level = Math.max(0, level - 1);
      formatted += indent.repeat(level) + token + "\n";
    } else if (token.startsWith("<") && token.endsWith("/>")) {
      // Self-closing tag
      formatted += indent.repeat(level) + token + "\n";
    } else if (token.startsWith("<")) {
      // Opening tag - check if next token is text followed by closing tag
      const nextToken = t + 1 < tokens.length ? tokens[t + 1] : null;
      const nextNextToken = t + 2 < tokens.length ? tokens[t + 2] : null;
      if (
        nextToken &&
        !nextToken.startsWith("<") &&
        nextNextToken &&
        nextNextToken.startsWith("</")
      ) {
        // Inline: <tag>text</tag>
        formatted +=
          indent.repeat(level) + token + nextToken + nextNextToken + "\n";
        t += 2;
      } else {
        formatted += indent.repeat(level) + token + "\n";
        level++;
      }
    } else {
      // Text node
      formatted += indent.repeat(level) + token + "\n";
    }
  }

  return formatted.trimEnd();
}

function minifyXml(xml: string): string {
  return xml
    .replace(/>\s+</g, "><")
    .replace(/\s*\n\s*/g, "")
    .trim();
}

function highlightXml(xml: string): string {
  return xml
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // XML declaration <?...?>
    .replace(
      /(&lt;\?[\s\S]*?\?&gt;)/g,
      '<span class="xml-declaration">$1</span>'
    )
    // Comments <!--...-->
    .replace(
      /(&lt;!--[\s\S]*?--&gt;)/g,
      '<span class="xml-comment">$1</span>'
    )
    // CDATA
    .replace(
      /(&lt;!\[CDATA\[[\s\S]*?\]\]&gt;)/g,
      '<span class="xml-cdata">$1</span>'
    )
    // Attribute values
    .replace(
      /(\w+)(=)(&quot;|")(.*?)(\3)/g,
      '<span class="xml-attr-name">$1</span>$2<span class="xml-attr-value">$3$4$5</span>'
    )
    // Self-closing tags
    .replace(
      /(&lt;)(\/?)(\w[\w\-.]*)(.*?)(\/?)(&gt;)/g,
      '$1$2<span class="xml-tag">$3</span>$4$5$6'
    );
}

export default function XmlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indentType, setIndentType] = useState<IndentType>("2");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLPreElement>(null);

  const inputLines = input.split("\n").length;
  const inputChars = input.length;
  const outputLines = output.split("\n").length;
  const outputChars = output.length;

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    const result = validateXml(input);
    setValidation(result);
    if (result.valid) {
      setOutput(formatXml(input, indentType));
    } else {
      setOutput("");
    }
  }, [input, indentType]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    const result = validateXml(input);
    setValidation(result);
    if (result.valid) {
      setOutput(minifyXml(input));
    } else {
      setOutput("");
    }
  }, [input]);

  const handleValidate = useCallback(() => {
    if (!input.trim()) {
      setValidation({ valid: true });
      return;
    }
    setValidation(validateXml(input));
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setValidation(null);
    setCopied(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleFormat}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Format
        </button>
        <button
          onClick={handleMinify}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Minify
        </button>
        <button
          onClick={handleValidate}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Validate
        </button>

        <div className="h-6 w-px bg-gray-200" />

        <label className="flex items-center gap-2 text-sm text-gray-600">
          Indent:
          <select
            value={indentType}
            onChange={(e) => setIndentType(e.target.value as IndentType)}
            className="px-2 py-1.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </select>
        </label>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={handleCopy}
            disabled={!output}
            className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {copied ? (
              <span className="checkmark-animate inline-flex items-center gap-1">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </span>
            ) : (
              "Copy"
            )}
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Validation result */}
      {validation && (
        <div
          className={`px-4 py-2.5 rounded-lg text-sm ${
            validation.valid
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {validation.valid ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Valid XML
            </span>
          ) : (
            <span className="flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>
                {validation.error}
                {validation.line && (
                  <span className="ml-2 text-red-500">
                    (Line {validation.line}
                    {validation.column && `, Column ${validation.column}`})
                  </span>
                )}
              </span>
            </span>
          )}
        </div>
      )}

      {/* Editor panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Input</span>
            <span className="text-xs text-gray-400">
              {inputChars} chars / {inputLines} lines
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste your XML here...\n\n<?xml version="1.0"?>\n<root>\n  <item id="1">Hello</item>\n</root>`}
            className="w-full h-80 p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 placeholder-gray-400"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Output</span>
            <span className="text-xs text-gray-400">
              {output ? `${outputChars} chars / ${outputLines} lines` : ""}
            </span>
          </div>
          <div className="w-full h-80 bg-gray-50 border border-gray-200 rounded-lg overflow-auto">
            {output ? (
              <pre
                ref={outputRef}
                className="p-4 font-mono text-sm leading-relaxed whitespace-pre"
                dangerouslySetInnerHTML={{ __html: highlightXml(output) }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                Formatted XML will appear here
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">よくある質問</h2>
        <div className="space-y-4">
          {[
            { q: "XMLとJSONの違いは何ですか？", a: "XMLはタグベースのマークアップ言語で、コメントや属性、名前空間などの機能を持ちます。JSONはより軽量でJavaScriptとの親和性が高く、Web APIで広く使われています。設定ファイルやSOAP通信ではXMLが今も使われています。" },
            { q: "XMLのバリデーションとは何ですか？", a: "XML文書が正しい構文に従っているかどうかを検証することです。タグの対応・属性の形式・文字エンコードなどをチェックします。本ツールでは構文エラーをリアルタイムで検出・表示します。" },
            { q: "インデントのサイズはどう変更しますか？", a: "ツール上部の設定から「2スペース」「4スペース」「タブ」を選択できます。プロジェクトのコーディング規約に合わせて選択してください。" },
          ].map(({ q, a }) => (
            <div key={q} className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-gray-800 mb-1">Q. {q}</p>
              <p className="text-sm text-gray-600">A. {a}</p>
            </div>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "XMLとJSONの違いは何ですか？", "acceptedAnswer": { "@type": "Answer", "text": "XMLはタグベースのマークアップ言語で、コメントや属性、名前空間などの機能を持ちます。JSONはより軽量でWeb APIで広く使われています。" } },
              { "@type": "Question", "name": "XMLのバリデーションとは何ですか？", "acceptedAnswer": { "@type": "Answer", "text": "XML文書が正しい構文に従っているかどうかを検証することです。本ツールでは構文エラーをリアルタイムで検出・表示します。" } },
              { "@type": "Question", "name": "インデントのサイズはどう変更しますか？", "acceptedAnswer": { "@type": "Answer", "text": "ツール上部の設定から「2スペース」「4スペース」「タブ」を選択できます。" } },
            ]
          }) }}
        />
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-2">関連ツール</p>
          <div className="flex flex-wrap gap-2">
            <a href="/json-formatter" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">JSON フォーマッター</a>
            <a href="/yaml-to-json" className="text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">YAML → JSON 変換</a>
          </div>
        </div>
      </div>
    </div>
  );
}
