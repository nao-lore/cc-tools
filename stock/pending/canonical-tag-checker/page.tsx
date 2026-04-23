import CanonicalChecker from "./components/CanonicalChecker";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* AdSense slot - top banner */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Canonical Tag Generator & Checker
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate canonical link tags from a URL, or paste HTML to extract
            and validate existing canonical and alternate tags. Free, no signup.
          </p>
        </div>

        {/* Tool */}
        <CanonicalChecker />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a Canonical Tag?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A canonical tag (<code>&lt;link rel="canonical"&gt;</code>) tells
            search engines which URL is the authoritative version of a page. It
            prevents duplicate-content issues when the same or very similar
            content is accessible at multiple URLs — for example, with and
            without a trailing slash, via HTTP and HTTPS, or through tracking
            parameters.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Canonical Tag Issues
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Trailing slash mismatch</strong> — <code>/page</code> and{" "}
              <code>/page/</code> are treated as different URLs. Pick one and
              keep it consistent.
            </li>
            <li>
              <strong>Protocol mismatch</strong> — Canonical points to{" "}
              <code>http://</code> while the live page is served over{" "}
              <code>https://</code>. Always use the HTTPS version.
            </li>
            <li>
              <strong>Relative vs. absolute URL</strong> — Some crawlers
              struggle with relative canonicals. Always use absolute URLs
              including the scheme and domain.
            </li>
            <li>
              <strong>Multiple canonical tags</strong> — Only one canonical per
              page is valid. If multiple are found, search engines may ignore
              all of them.
            </li>
            <li>
              <strong>Self-referencing</strong> — Every page should have a
              canonical tag, even if it points to itself.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Generate mode</strong> — Enter a URL and get the correct{" "}
              <code>&lt;link rel="canonical"&gt;</code> tag to paste into your{" "}
              <code>&lt;head&gt;</code>.
            </li>
            <li>
              <strong>Check mode</strong> — Paste raw HTML (e.g. copied from
              View Source) and the tool extracts all canonical and alternate
              tags, then flags common issues.
            </li>
            <li>
              <strong>Validate</strong> — Optionally enter an expected canonical
              URL to check whether the extracted canonical matches.
            </li>
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Canonical Tag Checker — Free online SEO tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://htaccess-generator.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                .htaccess Generator
              </a>
              <a
                href="https://robots-txt-generator.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                robots.txt Generator
              </a>
              <a
                href="https://http-header-builder.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                HTTP Header Builder
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

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    </div>
  );
}
