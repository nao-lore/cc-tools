import LinkExtractor from "./components/LinkExtractor";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Header */}
      <div className="py-10 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Link Extractor & Checker
        </h1>
        <p className="opacity-70 max-w-xl mx-auto">
          Paste any HTML to extract all links. Categorize as internal, external,
          anchor, mailto, or tel. Spot empty hrefs and malformed URLs instantly.
        </p>
      </div>

      {/* Tool */}
      <div className="px-4 pb-8">
        <LinkExtractor />
      </div>

      {/* AdSense placeholder */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div
          className="rounded-lg border border-dashed p-8 text-center text-sm opacity-30"
          style={{ borderColor: "var(--border)" }}
        >
          Ad space
        </div>
      </div>

      {/* SEO content */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <article
          className="rounded-xl p-6 sm:p-8 border space-y-6 text-sm leading-relaxed opacity-80"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <section>
            <h2 className="text-lg font-bold mb-2">What does this tool do?</h2>
            <p>
              This Link Extractor parses all{" "}
              <code className="bg-gray-100 px-1 rounded text-xs">&lt;a href&gt;</code>{" "}
              tags from pasted HTML using the browser&apos;s built-in DOMParser. It
              displays each link&apos;s text, URL, type, and status in a sortable
              table — no server required, everything runs locally in your browser.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">Link types explained</h2>
            <p>
              <strong>Internal</strong> links point to the same domain as your base
              URL, or are relative paths like <code className="bg-gray-100 px-1 rounded text-xs">/about</code> or{" "}
              <code className="bg-gray-100 px-1 rounded text-xs">../contact</code>.{" "}
              <strong>External</strong> links point to a different domain.{" "}
              <strong>Anchor</strong> links start with{" "}
              <code className="bg-gray-100 px-1 rounded text-xs">#</code> and scroll
              within the same page. <strong>Mailto</strong> and <strong>Tel</strong>{" "}
              links open an email client or dialer respectively.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">Status flags</h2>
            <p>
              The tool flags four common link issues without making any network
              requests. <strong>Empty href</strong> means the attribute exists but
              has no value. <strong>javascript:</strong> links run arbitrary scripts
              and are accessibility and security concerns. <strong>Malformed</strong>{" "}
              means the URL could not be parsed as a valid absolute URL. All other
              links are marked <strong>OK</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">How to use the base URL</h2>
            <p>
              Enter your site&apos;s homepage URL (e.g.{" "}
              <code className="bg-gray-100 px-1 rounded text-xs">https://example.com</code>)
              to enable internal/external detection for absolute URLs. Without a base
              URL, only relative paths are classified as internal. Relative URLs are
              always treated as internal regardless.
            </p>
          </section>
        </article>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Link Extractor & Checker — Free online SEO tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://keyword-density-analyzer.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Keyword Density Analyzer
              </a>
              <a
                href="https://sitemap-generator-phi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Sitemap Generator
              </a>
              <a
                href="https://html-minifier-delta.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                HTML Minifier
              </a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600"
            >
              53+ Free Tools →
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
