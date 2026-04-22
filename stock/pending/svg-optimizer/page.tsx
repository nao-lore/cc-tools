import SvgOptimizer from "./components/SvgOptimizer";

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
            SVG Optimizer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste your SVG code or upload a file to optimize and minify it
            instantly. Remove metadata, comments, and unnecessary attributes —
            all client-side, nothing leaves your browser.
          </p>
        </div>

        {/* SVG Optimizer Tool */}
        <SvgOptimizer />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is SVG Optimization?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            SVG optimization is the process of reducing the file size of an SVG
            image by removing elements and attributes that are not needed for
            rendering. Tools like design software (Figma, Illustrator) often
            export SVGs with extra metadata, comments, and redundant markup that
            bloats file size without affecting the visual output.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Optimize SVG Files?
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Faster page loads</strong> — Smaller SVGs download
              quicker, improving Core Web Vitals scores.
            </li>
            <li>
              <strong>Cleaner markup</strong> — Stripped comments and metadata
              make inline SVG easier to read and maintain.
            </li>
            <li>
              <strong>Better compression</strong> — Minified SVG compresses more
              efficiently with gzip or brotli.
            </li>
            <li>
              <strong>Production-ready</strong> — Remove editor artifacts before
              shipping icons, illustrations, or logos.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What This Tool Removes
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>XML declaration</strong> — The{" "}
              <code>&lt;?xml version=&quot;1.0&quot;?&gt;</code> header is not
              needed for inline or modern browser SVG.
            </li>
            <li>
              <strong>DOCTYPE</strong> — Rarely needed and adds unnecessary
              bytes.
            </li>
            <li>
              <strong>Comments</strong> — Editor and generator comments hidden
              inside{" "}
              <code>&lt;!-- --&gt;</code> blocks.
            </li>
            <li>
              <strong>Metadata elements</strong> — <code>&lt;title&gt;</code>,{" "}
              <code>&lt;desc&gt;</code>, and <code>&lt;metadata&gt;</code>{" "}
              blocks added by design tools.
            </li>
            <li>
              <strong>Empty attributes</strong> — Attributes with no value
              (e.g., <code>fill=&quot;&quot;</code>) that do nothing.
            </li>
            <li>
              <strong>Excess whitespace</strong> — Extra newlines and spaces
              between tags collapsed to reduce byte count.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Before and After Preview
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This tool renders your SVG directly in the browser so you can
            confirm the optimized version looks identical to the original. Use
            the Before / After toggle to compare both versions side by side.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Privacy and Security
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            All processing happens entirely in your browser using JavaScript. No
            SVG data is sent to any server. Your files stay on your machine.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            SVG Optimizer — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://minify-css.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                CSS Minifier
              </a>
              <a
                href="https://minify-js.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JS Minifier
              </a>
              <a
                href="https://json-formatter-topaz-pi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
              </a>
              <a
                href="https://html-entity-sigma.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                HTML Entity Encoder
              </a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a
              href="https://cc-tools.vercel.app"
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
