import MarkdownPreview from "./components/MarkdownPreview";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Markdown Preview
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Write Markdown on the left, see it rendered in real time on the
            right. Supports headings, bold, italic, links, code blocks, tables,
            and more.
          </p>
        </div>

        {/* Markdown Preview Tool */}
        <MarkdownPreview />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is Markdown?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Markdown is a lightweight markup language created by John Gruber in
            2004. It lets you add formatting to plain text using simple syntax
            like asterisks for bold, hashes for headings, and brackets for
            links. Markdown is widely used on GitHub, GitLab, Reddit, Stack
            Overflow, Notion, Obsidian, and many documentation tools.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supported Markdown Syntax
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            This tool supports the most commonly used Markdown elements:
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Headings</strong> — use <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">#</code> through <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">######</code> for h1 through h6
            </li>
            <li>
              <strong>Emphasis</strong> — <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">**bold**</code> and <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">*italic*</code>
            </li>
            <li>
              <strong>Links</strong> — <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">[text](url)</code>
            </li>
            <li>
              <strong>Images</strong> — <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">![alt](url)</code>
            </li>
            <li>
              <strong>Code</strong> — inline with backticks, blocks with triple backticks
            </li>
            <li>
              <strong>Lists</strong> — unordered with <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">-</code> or <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">*</code>, ordered with <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">1.</code>
            </li>
            <li>
              <strong>Blockquotes</strong> — prefix lines with <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">&gt;</code>
            </li>
            <li>
              <strong>Tables</strong> — pipe-separated columns with alignment support
            </li>
            <li>
              <strong>Horizontal rules</strong> — three or more dashes <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">---</code>
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Write Markdown</strong> in the editor pane on the left
            </li>
            <li>
              <strong>See the preview</strong> update in real time on the right
            </li>
            <li>
              <strong>Switch views</strong> between split, edit-only, or preview-only
            </li>
            <li>
              <strong>Copy HTML</strong> to get the rendered HTML output
            </li>
            <li>
              <strong>Copy Markdown</strong> to save your source text
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Use Cases
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This Markdown preview tool is useful for writing GitHub README files,
            drafting documentation, composing blog posts, preparing content for
            static site generators like Astro, Hugo, or Jekyll, and previewing
            notes before publishing to platforms that support Markdown. The
            built-in HTML export makes it easy to embed formatted content
            anywhere.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Markdown Preview — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/mdtable" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Markdown Table Generator</a>
              <a href="/html-to-markdown" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTML to Markdown</a>
              <a href="/text-diff" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Text Diff</a>
              <a href="/word-counter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Word Counter</a>
              <a href="/dummy-text" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Dummy Text Generator</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Markdown Preview",
  "description": "Write Markdown on the left, see it rendered in real time on the\n            right. Supports headings, bold, italic, links, code blocks, tables,\n            and more.",
  "url": "https://tools.loresync.dev/markdown-preview",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
