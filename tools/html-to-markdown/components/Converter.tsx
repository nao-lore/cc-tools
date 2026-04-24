"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { htmlToMarkdown } from "../lib/html-to-markdown";
import { markdownToHtml } from "../lib/markdown-to-html";

const SAMPLE_HTML = `<h1>Hello World</h1>
<p>This is a <strong>bold</strong> and <em>italic</em> text with a <a href="https://example.com">link</a>.</p>

<h2>Features</h2>
<ul>
  <li>Convert HTML to Markdown</li>
  <li>Live preview</li>
  <li>Copy to clipboard</li>
</ul>

<blockquote>
  <p>This is a blockquote with <code>inline code</code>.</p>
</blockquote>

<pre><code class="language-js">function hello() {
  console.log("Hello!");
}</code></pre>

<table>
  <thead>
    <tr><th>Name</th><th>Value</th></tr>
  </thead>
  <tbody>
    <tr><td>Alpha</td><td>1</td></tr>
    <tr><td>Beta</td><td>2</td></tr>
  </tbody>
</table>`;

export default function Converter() {
  const [html, setHtml] = useState(SAMPLE_HTML);
  const [markdown, setMarkdown] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const convert = useCallback((input: string) => {
    setMarkdown(htmlToMarkdown(input));
  }, []);

  // Initial conversion
  useEffect(() => {
    convert(html);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (value: string) => {
    setHtml(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      convert(value);
    }, 150);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = markdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes("text/html")) {
          const blob = await item.getType("text/html");
          const pastedHtml = await blob.text();
          setHtml(pastedHtml);
          convert(pastedHtml);
          setPasted(true);
          setTimeout(() => setPasted(false), 2000);
          return;
        }
        if (item.types.includes("text/plain")) {
          const blob = await item.getType("text/plain");
          const text = await blob.text();
          setHtml(text);
          convert(text);
          setPasted(true);
          setTimeout(() => setPasted(false), 2000);
          return;
        }
      }
    } catch {
      // Fallback to readText
      try {
        const text = await navigator.clipboard.readText();
        setHtml(text);
        convert(text);
        setPasted(true);
        setTimeout(() => setPasted(false), 2000);
      } catch {
        // Clipboard API not available
      }
    }
  };

  const handleClear = () => {
    setHtml("");
    setMarkdown("");
    textareaRef.current?.focus();
  };

  const previewHtml = showPreview ? markdownToHtml(markdown) : "";

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={handlePaste}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-accent text-white hover:bg-accent-hover transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {pasted ? "Pasted!" : "Paste HTML"}
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-accent text-white hover:bg-accent-hover transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {copied ? "Copied!" : "Copy Markdown"}
        </button>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
            showPreview
              ? "bg-accent text-white"
              : "bg-white text-foreground border border-border hover:bg-slate-50"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </button>
        <button
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-white text-foreground border border-border hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* HTML Input */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-slate-600 mb-1.5 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-orange-400" />
            HTML Input
          </label>
          <textarea
            ref={textareaRef}
            value={html}
            onChange={(e) => handleInputChange(e.target.value)}
            onPaste={(e) => {
              const htmlData = e.clipboardData.getData("text/html");
              if (htmlData) {
                e.preventDefault();
                setHtml(htmlData);
                convert(htmlData);
              }
            }}
            spellCheck={false}
            className="w-full h-[500px] p-4 rounded-lg bg-panel-bg text-panel-text text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 font-mono border border-slate-700/50"
            placeholder="Paste or type your HTML here..."
          />
        </div>

        {/* Markdown Output */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-slate-600 mb-1.5 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            {showPreview ? "Markdown Preview" : "Markdown Output"}
          </label>
          {showPreview ? (
            <div
              className="w-full h-[500px] p-4 rounded-lg bg-white text-foreground text-sm leading-relaxed overflow-auto border border-border markdown-preview"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <textarea
              value={markdown}
              readOnly
              className="w-full h-[500px] p-4 rounded-lg bg-panel-bg text-panel-text text-sm leading-relaxed resize-none focus:outline-none font-mono border border-slate-700/50"
              placeholder="Markdown will appear here..."
            />
          )}
        </div>
      </div>

      {/* FAQ */}
      <section className="bg-white border border-border rounded-xl shadow-sm p-6 mt-6">
        <h2 className="text-base font-bold text-foreground mb-3">よくある質問</h2>
        <div className="space-y-4">
          {[
            {
              q: "HTML を Markdown に変換するのはなぜ便利ですか？",
              a: "ブログ記事や CMS からコンテンツをエクスポートしたり、GitHub の README やドキュメントとして再利用するときに便利です。Markdown はプレーンテキストなので、バージョン管理や編集がしやすくなります。",
            },
            {
              q: "表や画像も変換できますか？",
              a: "はい。&lt;table&gt; は Markdown テーブル記法に、&lt;img&gt; は ![alt](url) 形式に自動変換されます。ただし複雑なスタイルやネスト構造は一部省略されることがあります。",
            },
            {
              q: "変換結果をそのままコピーして使えますか？",
              a: "「Copy Markdown」ボタンでクリップボードにコピーできます。また「Preview」ボタンで Markdown のレンダリング結果を確認してから利用することをお勧めします。",
            },
          ].map((faq, i) => (
            <div key={i} className="border-b border-border pb-3 last:border-0 last:pb-0">
              <p className="text-foreground font-bold text-sm mb-1">{faq.q}</p>
              <p className="text-foreground/60 text-xs leading-relaxed">{faq.a}</p>
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
                "name": "HTML を Markdown に変換するのはなぜ便利ですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "ブログ記事や CMS からコンテンツをエクスポートしたり、GitHub の README やドキュメントとして再利用するときに便利です。Markdown はプレーンテキストなので、バージョン管理や編集がしやすくなります。" },
              },
              {
                "@type": "Question",
                "name": "表や画像も変換できますか？",
                "acceptedAnswer": { "@type": "Answer", "text": "はい。table タグは Markdown テーブル記法に、img タグは ![alt](url) 形式に自動変換されます。ただし複雑なスタイルやネスト構造は一部省略されることがあります。" },
              },
              {
                "@type": "Question",
                "name": "変換結果をそのままコピーして使えますか？",
                "acceptedAnswer": { "@type": "Answer", "text": "「Copy Markdown」ボタンでクリップボードにコピーできます。また「Preview」ボタンで Markdown のレンダリング結果を確認してから利用することをお勧めします。" },
              },
            ],
          }),
        }}
      />

      {/* 関連ツール */}
      <section className="bg-white border border-border rounded-xl shadow-sm p-6 mt-4">
        <h2 className="text-base font-bold text-foreground mb-3">関連ツール</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: "/markdown-preview", label: "Markdown プレビュー", desc: "Markdown をリアルタイムでプレビュー" },
            { href: "/html-entity", label: "HTML エンティティ変換", desc: "HTML の特殊文字をエンティティに変換" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block bg-slate-50 hover:bg-slate-100 border border-border rounded-xl p-3 transition-colors"
            >
              <p className="text-foreground font-bold text-sm">{link.label}</p>
              <p className="text-foreground/60 text-xs mt-0.5">{link.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
