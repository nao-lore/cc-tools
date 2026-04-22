import JsMinifier from "./components/JsMinifier";

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
            JavaScript Minifier
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste your JavaScript code and minify it instantly. Remove comments,
            strip whitespace, and reduce file size — all client-side, nothing
            leaves your browser.
          </p>
        </div>

        {/* JS Minifier Tool */}
        <JsMinifier />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is JavaScript Minification?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            JavaScript minification is the process of removing unnecessary
            characters from source code without changing its functionality. This
            includes stripping comments, removing extra whitespace, collapsing
            newlines, and shortening code where possible. Minified JavaScript
            files are smaller, which means faster downloads and improved page
            load times.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Minify JavaScript?
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Faster page loads</strong> — Smaller files download
              quicker, especially on mobile networks.
            </li>
            <li>
              <strong>Reduced bandwidth</strong> — Less data transferred means
              lower hosting costs and better user experience.
            </li>
            <li>
              <strong>Better performance scores</strong> — Tools like Google
              Lighthouse reward smaller, optimized assets.
            </li>
            <li>
              <strong>Production-ready code</strong> — Minification is a
              standard step in modern deployment pipelines.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How This Tool Works
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            This minifier runs entirely in your browser. Your code is never sent
            to a server. It performs several transformations:
          </p>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Remove comments</strong> — Both single-line (//) and
              multi-line (/* */) comments are stripped.
            </li>
            <li>
              <strong>Collapse whitespace</strong> — Extra spaces, tabs, and
              newlines are removed or collapsed to a single space where needed.
            </li>
            <li>
              <strong>Preserve strings</strong> — String literals (single,
              double, and template) are kept intact.
            </li>
            <li>
              <strong>Preserve regex</strong> — Regular expression literals are
              detected and left unchanged.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Minify vs Beautify
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This tool also includes a beautify mode that adds indentation and
            line breaks back to compressed code. Use it to make minified code
            readable again for debugging or code review. Toggle between minify
            and beautify with one click.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            When to Use a JavaScript Minifier
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Before deploying JavaScript to production.
            </li>
            <li>
              When optimizing page speed for SEO or user experience.
            </li>
            <li>
              To quickly check how much space you can save on a script.
            </li>
            <li>
              When you need a quick minification without setting up a build tool.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">JavaScript Minifier — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://minify-css.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Minifier</a>
              <a href="https://json-formatter-topaz-pi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
              <a href="https://html-entity-sigma.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTML Entity Encoder</a>
              <a href="https://sql-formatter-liart.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">SQL Formatter</a>
              <a href="https://regex-tester-three.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Regex Tester</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools →</a>
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
