import TomlToJson from "./components/TomlToJson";

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
            TOML to JSON Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste your TOML configuration and convert it to JSON instantly.
            Syntax errors are reported with line numbers — all client-side,
            nothing leaves your browser.
          </p>
        </div>

        {/* Tool */}
        <TomlToJson />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is TOML?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            TOML (Tom&apos;s Obvious Minimal Language) is a configuration file
            format designed to be easy to read and write. It is commonly used
            for application config files such as <code>Cargo.toml</code>,{" "}
            <code>pyproject.toml</code>, and <code>config.toml</code> in
            projects like Rust, Python, and Hugo.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            When Would You Convert TOML to JSON?
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>API integrations</strong> — many APIs and services consume
              JSON but not TOML.
            </li>
            <li>
              <strong>JavaScript tooling</strong> — Node.js ecosystems typically
              expect JSON config.
            </li>
            <li>
              <strong>Debugging</strong> — viewing TOML data as JSON makes it
              easier to inspect nested structures.
            </li>
            <li>
              <strong>Data migration</strong> — moving config from one system to
              another.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supported TOML Features
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>Standard and dotted key-value pairs</li>
            <li>Basic strings, literal strings, and multiline variants</li>
            <li>Integers, floats, and booleans</li>
            <li>Arrays (including mixed-type arrays)</li>
            <li>Inline tables</li>
            <li>Standard table headers <code>[table]</code></li>
            <li>Array of tables <code>[[array]]</code></li>
            <li>Comments (stripped from output)</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How This Tool Works
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The converter runs entirely in your browser using a hand-written
            TOML parser. Paste or type your TOML in the left panel and click
            <strong> Convert</strong>. If there are syntax errors, they are
            displayed with the exact line number so you can fix them quickly.
            Valid output appears as pretty-printed JSON on the right, ready to
            copy or download.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            TOML to JSON Converter — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://json-formatter-topaz-pi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
              </a>
              <a
                href="https://yaml-to-json-rho.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                YAML to JSON
              </a>
              <a
                href="https://json-schema-validator.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Schema Validator
              </a>
              <a
                href="https://csv-viewer-online.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                CSV Viewer
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
