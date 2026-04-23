import FaviconChecker from "./components/FaviconChecker";

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
            Favicon Requirements Checker
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the favicon types your site needs and get ready-to-paste HTML
            link tags and a web.manifest snippet. Free, no signup.
          </p>
        </div>

        {/* Tool */}
        <FaviconChecker />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Do You Need Multiple Favicon Sizes?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Different browsers, operating systems, and devices request different
            favicon formats and sizes. A 16×16 ICO file covers classic desktop
            browsers, while Apple devices require a 180×180 PNG for home-screen
            shortcuts. Android Chrome reads from your <code>manifest.json</code>{" "}
            to display 192×192 and 512×512 icons for PWA installs.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Recommended Favicon Set
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>favicon.ico (16×16 + 32×32)</strong> — The classic format
              supported by every browser. Can embed multiple resolutions in one
              file.
            </li>
            <li>
              <strong>PNG 16×16 &amp; 32×32</strong> — Explicit PNG sizes for
              browsers that prefer them over ICO.
            </li>
            <li>
              <strong>Apple Touch Icon (180×180)</strong> — Used when a user
              adds your site to their iOS home screen.
            </li>
            <li>
              <strong>Android Chrome 192×192 &amp; 512×512</strong> — Referenced
              in your web app manifest for PWA installs and splash screens.
            </li>
            <li>
              <strong>MS Application Tile (150×150)</strong> — Used by Windows
              when a site is pinned to the Start menu.
            </li>
            <li>
              <strong>Safari Pinned Tab SVG</strong> — A monochrome SVG used by
              macOS Safari for pinned tabs.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              Check the favicon types your site needs using the checklist.
            </li>
            <li>
              Set your path prefix — commonly <code>/</code> or{" "}
              <code>/images/</code> — to match where you store your favicon
              files.
            </li>
            <li>
              Copy the generated HTML snippet and paste it inside your{" "}
              <code>&lt;head&gt;</code>.
            </li>
            <li>
              If you are building a PWA, copy the manifest JSON and add it to
              your <code>manifest.json</code> icons array.
            </li>
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Favicon Requirements Checker — Free online SEO tool. No signup
            required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://canonical-tag-checker.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Canonical Tag Checker
              </a>
              <a
                href="https://robots-txt-parser.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                robots.txt Parser
              </a>
              <a
                href="https://schema-markup-tester.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Schema Markup Tester
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
