import CssMinifier from "./components/CssMinifier";

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
            CSS Minifier
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste your CSS code, get minified output instantly. Remove comments,
            whitespace, and optimize your stylesheets — all client-side.
          </p>
        </div>

        {/* CSS Minifier Tool */}
        <CssMinifier />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is CSS Minification?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            CSS minification is the process of removing unnecessary characters
            from CSS code without changing its functionality. This includes
            stripping comments, removing extra whitespace and line breaks,
            eliminating redundant semicolons, and collapsing spaces around
            selectors and properties. The result is a smaller file that loads
            faster in web browsers.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Minify CSS?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Minified CSS files are smaller, which means faster download times
            for your users. Every kilobyte matters for page load performance,
            especially on mobile networks. Smaller CSS files also reduce
            bandwidth usage and can improve your Core Web Vitals scores.
            Search engines consider page speed as a ranking factor, so
            minified CSS contributes to better SEO.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This CSS Minifier
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Paste your CSS</strong> into the input area on the left.
            </li>
            <li>
              <strong>View the minified result</strong> on the right, updated
              in real time.
            </li>
            <li>
              <strong>Check the stats</strong> to see original size, minified
              size, and bytes saved.
            </li>
            <li>
              <strong>Copy the output</strong> with one click and use it in
              your project.
            </li>
            <li>
              <strong>Beautify</strong> minified CSS back into readable format
              using the Beautify button.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Does This Tool Remove?
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Comments</strong> — both single-line and multi-line CSS
              comments are stripped.
            </li>
            <li>
              <strong>Whitespace</strong> — extra spaces, tabs, and newlines
              are removed or collapsed.
            </li>
            <li>
              <strong>Trailing semicolons</strong> — the last semicolon before
              a closing brace is removed.
            </li>
            <li>
              <strong>Redundant spaces</strong> — spaces around colons,
              semicolons, braces, and commas are collapsed.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Privacy and Security
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This CSS minifier runs entirely in your browser. Your code is never
            sent to any server. All processing happens client-side using
            JavaScript, so your stylesheets remain private and secure.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">minify-css — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/minify-js" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Minify JS</a>
              <a href="/tailwindconvert" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Tailwind Convert</a>
              <a href="/css-gradient" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient</a>
              <a href="/css-flexbox" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Flexbox</a>
              <a href="/html-entity" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTML Entity</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CSS Minifier",
  "description": "Paste your CSS code, get minified output instantly. Remove comments,\n            whitespace, and optimize your stylesheets — all client-side.",
  "url": "https://tools.loresync.dev/minify-css",
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
