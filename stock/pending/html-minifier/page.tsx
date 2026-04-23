import HtmlMinifier from "./components/HtmlMinifier";

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
            HTML Minifier
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste your HTML and compress it instantly. Remove comments, collapse
            whitespace, and strip optional tags — all client-side, nothing
            leaves your browser.
          </p>
        </div>

        {/* HTML Minifier Tool */}
        <HtmlMinifier />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is HTML Minification?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            HTML minification is the process of reducing the size of HTML files
            by removing unnecessary characters without changing how the page
            renders. This includes stripping HTML comments, collapsing
            whitespace between tags, and removing optional closing tags that
            browsers handle automatically.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Minify HTML?
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Faster page loads</strong> — Smaller HTML documents are
              transferred and parsed more quickly.
            </li>
            <li>
              <strong>Reduced bandwidth</strong> — Every byte saved lowers
              hosting costs and improves experience on slow connections.
            </li>
            <li>
              <strong>Better Core Web Vitals</strong> — Smaller initial HTML
              payloads can improve Time to First Byte and LCP scores.
            </li>
            <li>
              <strong>Cleaner delivery</strong> — Minified HTML is a standard
              practice in modern deployment pipelines alongside CSS and JS.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How This Tool Works
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            This minifier runs entirely in your browser. Your code is never sent
            to a server. You can enable or disable each optimization:
          </p>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Remove comments</strong> — HTML comments (
              {"<!-- ... -->"}) are stripped from the output.
            </li>
            <li>
              <strong>Collapse whitespace</strong> — Multiple spaces, tabs, and
              newlines between tags are collapsed to a single space.
            </li>
            <li>
              <strong>Remove optional closing tags</strong> — Tags like{" "}
              {"</li>"}, {"</td>"}, and {"</p>"} that browsers infer
              automatically are removed.
            </li>
            <li>
              <strong>Remove attribute quotes</strong> — Quotes around attribute
              values are removed when the value contains no spaces or special
              characters.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            When to Use an HTML Minifier
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>Before deploying static HTML files to production.</li>
            <li>
              When optimizing page speed scores for SEO or user experience.
            </li>
            <li>To quickly estimate how much size you can save on a page.</li>
            <li>
              When you need fast minification without configuring a build tool.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            HTML Minifier — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="/minify-css"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                CSS Minifier
              </a>
              <a
                href="/minify-js"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JS Minifier
              </a>
              <a
                href="/json-formatter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
              </a>
              <a
                href="https://svg-optimizer.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                SVG Optimizer
              </a>
              <a
                href="/regex-tester"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Regex Tester
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
