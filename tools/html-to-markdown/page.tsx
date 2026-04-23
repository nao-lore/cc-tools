import type { Metadata } from "next";
import Converter from "./components/Converter";

export const metadata: Metadata = {
  title: "HTML to Markdown Converter - Convert HTML to MD Online | html-to-markdown",
  description:
    "Free online HTML to Markdown converter. Paste HTML code and instantly get clean Markdown syntax. Supports headings, links, images, tables, code blocks, lists, and more. No signup required.",
  keywords: [
    "html to markdown",
    "html to md",
    "convert html to markdown online",
    "html markdown converter",
    "html to md converter",
    "markdown converter",
    "html converter",
  ],
  openGraph: {
    title: "HTML to Markdown Converter - Convert HTML to MD Online",
    description:
      "Free online tool to convert HTML code to clean Markdown syntax. Supports tables, code blocks, lists, and 20+ HTML elements.",
    url: "https://html-to-markdown.vercel.app",
    siteName: "HTML to Markdown Converter",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTML to Markdown Converter - Convert HTML to MD Online",
    description:
      "Free online tool to convert HTML code to clean Markdown syntax. Supports tables, code blocks, lists, and 20+ HTML elements.",
  },
  alternates: {
    canonical: "https://html-to-markdown.vercel.app",
  },
  verification: {
    google: "uRTAz7j8N8jDW5BzJaGn-wzrFY5C7KNStVLMKlGzo_4",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "HTML to Markdown Converter",
  url: "https://html-to-markdown.vercel.app",
  description:
    "Free online HTML to Markdown converter. Paste HTML and get clean Markdown instantly.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "HTML to Markdown conversion",
    "Live preview",
    "Clipboard paste support",
    "Table conversion",
    "Code block support",
    "No signup required",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-lg text-foreground">
                  html-to-markdown
                </span>
              </div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-500 hover:text-accent transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                HTML to Markdown Converter
              </h1>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Paste your HTML code and instantly convert it to clean, readable
                Markdown syntax. Free, fast, and runs entirely in your browser.
              </p>
            </div>

            {/* Converter */}
            <Converter />

            {/* Ad Placeholder */}
            <div className="mt-8 p-4 border-2 border-dashed border-slate-200 rounded-lg text-center text-slate-400 text-sm">
              Advertisement Space
            </div>

            {/* SEO Content */}
            <article className="mt-16 max-w-4xl mx-auto prose prose-slate">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                What is Markdown?
              </h2>
              <p className="text-slate-600 mb-4">
                Markdown is a lightweight markup language created by John Gruber
                in 2004. It allows you to write formatted text using a simple,
                plain-text syntax that is easy to read and write. Markdown files
                use the <code className="text-sm bg-slate-100 px-1.5 py-0.5 rounded">.md</code> extension and are widely used in
                documentation, README files, blogs, forums, and messaging
                platforms. Unlike HTML, Markdown focuses on readability - the
                source text looks almost like the final formatted output.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">
                Why Convert HTML to Markdown?
              </h2>
              <p className="text-slate-600 mb-4">
                There are many situations where you need to convert HTML to
                Markdown. You might be migrating content from a website to a
                static site generator like Jekyll, Hugo, or Astro that uses
                Markdown files. Or you might want to clean up HTML content for
                use in a GitHub README, a wiki, or a note-taking app like
                Obsidian or Notion. Converting HTML to Markdown also makes
                content more portable and easier to version control with Git,
                since Markdown diffs are much cleaner than HTML diffs.
              </p>
              <p className="text-slate-600 mb-4">
                This tool runs entirely in your browser using the DOMParser API,
                which means your HTML content is never sent to any server. The
                conversion happens instantly as you type, with support for
                debounced live updates. You can also paste rich text directly
                from web pages, and the tool will capture the underlying HTML
                for conversion.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">
                Supported HTML Elements
              </h2>
              <p className="text-slate-600 mb-4">
                This converter handles over 20 common HTML elements and
                converts them to their Markdown equivalents. The following table
                shows the mapping between HTML tags and Markdown syntax:
              </p>

              <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left p-3 border border-slate-200 font-semibold">
                        HTML Element
                      </th>
                      <th className="text-left p-3 border border-slate-200 font-semibold">
                        Markdown Syntax
                      </th>
                      <th className="text-left p-3 border border-slate-200 font-semibold">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600">
                    <tr>
                      <td className="p-3 border border-slate-200">
                        <code className="text-xs bg-slate-100 px-1 rounded">&lt;h1&gt;</code> to{" "}
                        <code className="text-xs bg-slate-100 px-1 rounded">&lt;h6&gt;</code>
                      </td>
                      <td className="p-3 border border-slate-200 font-mono text-xs">
                        # to ######
                      </td>
                      <td className="p-3 border border-slate-200">
                        Headings (levels 1-6)
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-slate-200">
                        <code className="text-xs bg-slate-100 px-1 rounded">&lt;p&gt;</code>
                      </td>
                      <td className="p-3 border border-slate-200 font-mono text-xs">
                        Plain text with blank lines
                      </td>
                      <td className="p-3 border border-slate-200">Paragraphs</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-slate-200">
                        <code className="text-xs bg-slate-100 px-1 rounded">&lt;strong&gt;</code>,{" "}
                        <code className="text-xs bg-slate-100 px-1 rounded">&lt;b&gt;</code>
                      </td>
                      <td className="p-3 border border-slate-200 font-mono text-xs">
                        **text**
                      </td>
                      <td className="p-3 border border-slate-200">Bold text</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-slate-200">
                        <code className="text-xs bg-slate-100 px-1 rounded">&lt;em&gt;</code>,{" "}
                        <code className="text-xs bg-slate-100 px-1 rounded">&lt;i&gt;</code>
                      </td>
                      <td className="p-3 border border-slate-200 font-mono text-xs">
                        *text*
                      </td>
                      <td className="p-3 border border-slate-200">Italic text</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-slate-200">
                        <code className="text-xs bg-slate-100 px-1 rounded">&lt;a&gt;</code>
                      </td>
                      <td className="p-3 border border-slate-200 font-mono text-xs">
                        [text](url)
                      </td>
                      <td className="p-3 border border-slate-200">Hyperlinks</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-slate-200">
                        <code className="text-xs bg-slate-100 px-1 rounded">&lt;img&gt;</code>
                      </td>
                      <td className="p-3 border border-slate-200 font-mono text-xs">
                        ![alt](src)
                      </td>
                      <td className="p-3 border border-slate-200">Images</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-slate-200">
                        <code className="text-xs bg-slate-100 px-1 rounded">&lt;ul&gt;</code>,{" "}
                        <code className="text-xs bg-slate-100 px-1 rounded">&lt;ol&gt;</code>
                      </td>
                      <td className="p-3 border border-slate-200 font-mono text-xs">
                        - item / 1. item
                      </td>
                      <td className="p-3 border border-slate-200">Lists (unordered and ordered)</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-slate-200">
                        <code className="text-xs bg-slate-100 px-1 rounded">&lt;blockquote&gt;</code>
                      </td>
                      <td className="p-3 border border-slate-200 font-mono text-xs">
                        &gt; text
                      </td>
                      <td className="p-3 border border-slate-200">Blockquotes</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-slate-200">
                        <code className="text-xs bg-slate-100 px-1 rounded">&lt;code&gt;</code>
                      </td>
                      <td className="p-3 border border-slate-200 font-mono text-xs">
                        `code`
                      </td>
                      <td className="p-3 border border-slate-200">Inline code</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-slate-200">
                        <code className="text-xs bg-slate-100 px-1 rounded">&lt;pre&gt;&lt;code&gt;</code>
                      </td>
                      <td className="p-3 border border-slate-200 font-mono text-xs">
                        ```lang ... ```
                      </td>
                      <td className="p-3 border border-slate-200">
                        Fenced code blocks
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-slate-200">
                        <code className="text-xs bg-slate-100 px-1 rounded">&lt;table&gt;</code>
                      </td>
                      <td className="p-3 border border-slate-200 font-mono text-xs">
                        | col | col |
                      </td>
                      <td className="p-3 border border-slate-200">Tables with headers</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-slate-200">
                        <code className="text-xs bg-slate-100 px-1 rounded">&lt;hr&gt;</code>
                      </td>
                      <td className="p-3 border border-slate-200 font-mono text-xs">
                        ---
                      </td>
                      <td className="p-3 border border-slate-200">
                        Horizontal rules
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-slate-200">
                        <code className="text-xs bg-slate-100 px-1 rounded">&lt;br&gt;</code>
                      </td>
                      <td className="p-3 border border-slate-200 font-mono text-xs">
                        Two trailing spaces
                      </td>
                      <td className="p-3 border border-slate-200">Line breaks</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-4">
                How to Use This Tool
              </h2>
              <p className="text-slate-600 mb-4">
                Using this HTML to Markdown converter is straightforward. Simply
                paste your HTML code into the left panel, and the converted
                Markdown will appear instantly in the right panel. You can also
                paste rich text directly from any web page - the tool will
                automatically detect and convert the HTML structure. Click the
                &quot;Copy Markdown&quot; button to copy the result to your clipboard, or
                use the &quot;Preview&quot; toggle to see how the generated Markdown
                renders as formatted text. The converter handles nested
                elements, preserves code block formatting with language
                detection, and generates proper Markdown tables from HTML
                tables. All processing happens locally in your browser - your
                content is never uploaded to any server.
              </p>
            </article>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-8 text-center">
          <div className="max-w-3xl mx-auto px-4">
            <p className="text-sm text-gray-500 mb-4">HTML to Markdown Converter — Free online tool. No signup required.</p>
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-2">Related Tools</p>
              <div className="flex flex-wrap justify-center gap-2">
                <a href="/markdown-preview" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Markdown Preview</a>
                <a href="/mdtable" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">MD Table</a>
                <a href="/html-entity" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTML Entity</a>
                <a href="/json-formatter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
                <a href="/minify-css" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Minify CSS</a>
              </div>
            </div>
            <div className="flex justify-center gap-3 text-xs text-gray-400">
              <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
