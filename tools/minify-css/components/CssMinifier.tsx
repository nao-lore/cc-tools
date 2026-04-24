"use client";

import { useState, useCallback, useRef } from "react";

function minifyCss(css: string): string {
  if (!css.trim()) return "";

  let result = css;

  // Remove comments (/* ... */) but preserve strings
  // We process character by character to handle strings correctly
  let output = "";
  let i = 0;
  while (i < result.length) {
    // Check for strings (single or double quotes)
    if (result[i] === '"' || result[i] === "'") {
      const quote = result[i];
      output += quote;
      i++;
      while (i < result.length && result[i] !== quote) {
        if (result[i] === "\\") {
          output += result[i];
          i++;
          if (i < result.length) {
            output += result[i];
            i++;
          }
        } else {
          output += result[i];
          i++;
        }
      }
      if (i < result.length) {
        output += result[i]; // closing quote
        i++;
      }
    }
    // Check for comments
    else if (result[i] === "/" && i + 1 < result.length && result[i + 1] === "*") {
      i += 2;
      while (i + 1 < result.length && !(result[i] === "*" && result[i + 1] === "/")) {
        i++;
      }
      i += 2; // skip */
    }
    else {
      output += result[i];
      i++;
    }
  }
  result = output;

  // Remove newlines and tabs
  result = result.replace(/[\n\r\t]/g, " ");

  // Collapse multiple spaces into one
  result = result.replace(/ {2,}/g, " ");

  // Remove spaces around { } : ; ,
  result = result.replace(/\s*\{\s*/g, "{");
  result = result.replace(/\s*\}\s*/g, "}");
  result = result.replace(/\s*;\s*/g, ";");
  result = result.replace(/\s*:\s*/g, ":");
  result = result.replace(/\s*,\s*/g, ",");

  // Remove last semicolon before closing brace
  result = result.replace(/;}/g, "}");

  // Remove leading/trailing whitespace
  result = result.trim();

  return result;
}

function beautifyCss(css: string): string {
  if (!css.trim()) return "";

  let result = css.trim();
  let output = "";
  let indent = 0;
  let i = 0;
  const indentStr = "  ";

  while (i < result.length) {
    // Handle strings
    if (result[i] === '"' || result[i] === "'") {
      const quote = result[i];
      output += quote;
      i++;
      while (i < result.length && result[i] !== quote) {
        if (result[i] === "\\") {
          output += result[i];
          i++;
          if (i < result.length) {
            output += result[i];
            i++;
          }
        } else {
          output += result[i];
          i++;
        }
      }
      if (i < result.length) {
        output += result[i];
        i++;
      }
      continue;
    }

    // Handle comments
    if (result[i] === "/" && i + 1 < result.length && result[i + 1] === "*") {
      output += "/* ";
      i += 2;
      while (i + 1 < result.length && !(result[i] === "*" && result[i + 1] === "/")) {
        output += result[i];
        i++;
      }
      output += " */\n" + indentStr.repeat(indent);
      i += 2;
      continue;
    }

    if (result[i] === "{") {
      output += " {\n";
      indent++;
      output += indentStr.repeat(indent);
      i++;
      // skip whitespace after {
      while (i < result.length && result[i] === " ") i++;
    } else if (result[i] === "}") {
      indent = Math.max(0, indent - 1);
      // remove trailing whitespace before }
      output = output.replace(/\s+$/, "");
      output += "\n" + indentStr.repeat(indent) + "}\n";
      if (indent > 0) {
        output += indentStr.repeat(indent);
      } else {
        output += "\n";
      }
      i++;
      // skip whitespace after }
      while (i < result.length && result[i] === " ") i++;
    } else if (result[i] === ";") {
      output += ";\n" + indentStr.repeat(indent);
      i++;
      // skip whitespace after ;
      while (i < result.length && result[i] === " ") i++;
    } else if (result[i] === ":") {
      output += ": ";
      i++;
      // skip whitespace after :
      while (i < result.length && result[i] === " ") i++;
    } else if (result[i] === ",") {
      output += ", ";
      i++;
      while (i < result.length && result[i] === " ") i++;
    } else {
      output += result[i];
      i++;
    }
  }

  // Clean up extra blank lines
  output = output.replace(/\n{3,}/g, "\n\n");
  output = output.trim() + "\n";

  return output;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function CssMinifier() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const minified = minifyCss(input);
  const originalBytes = new TextEncoder().encode(input).length;
  const minifiedBytes = new TextEncoder().encode(minified).length;
  const savings = originalBytes > 0 ? originalBytes - minifiedBytes : 0;
  const savingsPercent =
    originalBytes > 0 ? ((savings / originalBytes) * 100).toFixed(1) : "0.0";

  const handleCopy = useCallback(async () => {
    if (!minified) return;
    try {
      await navigator.clipboard.writeText(minified);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = minified;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [minified]);

  const handleClear = useCallback(() => {
    setInput("");
    textareaRef.current?.focus();
  }, []);

  const handleBeautify = useCallback(() => {
    if (!input.trim()) return;
    setInput(beautifyCss(input));
  }, [input]);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      {input.trim() && (
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          <span>
            Original: <strong className="text-gray-900">{formatBytes(originalBytes)}</strong>
          </span>
          <span>
            Minified: <strong className="text-gray-900">{formatBytes(minifiedBytes)}</strong>
          </span>
          <span>
            Savings:{" "}
            <strong className="text-green-700">
              {formatBytes(savings)} ({savingsPercent}%)
            </strong>
          </span>
        </div>
      )}

      {/* Editor panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Input CSS</label>

            <div className="flex gap-2">
              <button
                onClick={handleBeautify}
                disabled={!input.trim()}
                className="px-3 py-1 text-xs font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Beautify
              </button>
              <button
                onClick={handleClear}
                disabled={!input}
                className="px-3 py-1 text-xs font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`/* Paste your CSS here */\n\nbody {\n  margin: 0;\n  padding: 0;\n  font-family: sans-serif;\n}`}
            className="w-full h-80 p-4 font-mono text-sm border border-gray-300 rounded-lg bg-white resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 placeholder:text-gray-400"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Minified Output</label>
            <button
              onClick={handleCopy}
              disabled={!minified}
              className="px-3 py-1 text-xs font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {copied ? (
                <span className="text-green-600">Copied!</span>
              ) : (
                "Copy"
              )}
            </button>
          </div>
          <textarea
            value={minified}
            readOnly
            placeholder="Minified CSS will appear here..."
            className="w-full h-80 p-4 font-mono text-sm border border-gray-200 rounded-lg bg-gray-50 resize-y focus:outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* FAQ */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-4">
        <h2 className="text-base font-bold text-gray-800 mb-3">よくある質問</h2>
        <div className="space-y-4">
          {[
            {
              q: "CSS を圧縮するとどんなメリットがありますか？",
              a: "コメント・改行・余分なスペースを削除することでファイルサイズが小さくなり、ページの読み込み速度が向上します。数十KB〜数百KBの CSS を扱う場合、20〜40% 程度の削減が期待できます。CDN キャッシュとの組み合わせで特に効果的です。",
            },
            {
              q: "Beautify ボタンは何をしますか？",
              a: "Beautify は圧縮済みの CSS を読みやすく整形し直します。インデントや改行を追加してプロパティを一行ずつ並べるため、コードの確認・編集が容易になります。圧縮と整形を繰り返し使うことで、配布用と編集用を素早く切り替えられます。",
            },
            {
              q: "圧縮すると CSS が壊れることはありますか？",
              a: "このツールはセレクターやプロパティ値の意味を変えずにホワイトスペースとコメントのみを削除します。ただし、文字列内に改行を含む CSS（非常に稀なケース）や、ハック的な記述は意図しない挙動になる場合があります。変換後は必ずブラウザで動作確認してください。",
            },
          ].map((faq, i) => (
            <div key={i} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <p className="text-gray-800 font-bold text-sm mb-1">{faq.q}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "CSS を圧縮するとどんなメリットがありますか？",
                "acceptedAnswer": { "@type": "Answer", "text": "コメント・改行・余分なスペースを削除することでファイルサイズが小さくなり、ページの読み込み速度が向上します。数十KB〜数百KBの CSS を扱う場合、20〜40% 程度の削減が期待できます。CDN キャッシュとの組み合わせで特に効果的です。" },
              },
              {
                "@type": "Question",
                "name": "Beautify ボタンは何をしますか？",
                "acceptedAnswer": { "@type": "Answer", "text": "Beautify は圧縮済みの CSS を読みやすく整形し直します。インデントや改行を追加してプロパティを一行ずつ並べるため、コードの確認・編集が容易になります。圧縮と整形を繰り返し使うことで、配布用と編集用を素早く切り替えられます。" },
              },
              {
                "@type": "Question",
                "name": "圧縮すると CSS が壊れることはありますか？",
                "acceptedAnswer": { "@type": "Answer", "text": "このツールはセレクターやプロパティ値の意味を変えずにホワイトスペースとコメントのみを削除します。ただし、文字列内に改行を含む CSS（非常に稀なケース）や、ハック的な記述は意図しない挙動になる場合があります。変換後は必ずブラウザで動作確認してください。" },
              },
            ],
          }),
        }}
      />

      {/* 関連ツール */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-4">
        <h2 className="text-base font-bold text-gray-800 mb-3">関連ツール</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: "/minify-js", label: "JS 圧縮・整形", desc: "JavaScript を圧縮・Beautify するツール" },
            { href: "/html-entity", label: "HTML エンティティ変換", desc: "特殊文字を HTML エンティティに変換" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-3 transition-colors"
            >
              <p className="text-gray-800 font-bold text-sm">{link.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{link.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
