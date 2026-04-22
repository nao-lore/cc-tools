import JsonDiff from "./components/JsonDiff";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            JSON Diff
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compare two JSON objects and see differences highlighted. Added,
            removed, and changed keys with color coding.
          </p>
        </div>

        <JsonDiff />

        <section className="mt-16 mb-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is JSON Diff?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            JSON Diff compares two JSON objects recursively and shows exactly
            what changed — which keys were added, which were removed, and which
            values were modified. Unlike plain text diff tools, JSON Diff
            understands the structure of JSON and compares objects and arrays
            semantically rather than line-by-line.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Color Coding
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong className="text-green-700">Green</strong> — Key or value
              was added in JSON B.
            </li>
            <li>
              <strong className="text-red-700">Red</strong> — Key or value was
              removed (present in JSON A, missing in JSON B).
            </li>
            <li>
              <strong className="text-yellow-700">Yellow</strong> — Value was
              changed between JSON A and JSON B.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>Paste your original JSON into the JSON A panel.</li>
            <li>Paste the modified JSON into the JSON B panel.</li>
            <li>
              Click <strong>Compare</strong> to run the diff. Results appear as
              a color-coded tree.
            </li>
            <li>
              Click any changed value to see the old vs. new value side by side.
            </li>
            <li>
              Use <strong>Load Sample</strong> to try it instantly with example
              data.
            </li>
          </ol>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            JSON Diff — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://json-formatter-gilt.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
              </a>
              <a
                href="https://json-schema-validator-xi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Schema Validator
              </a>
              <a
                href="https://yaml-to-json-theta.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                YAML to JSON
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "JSON Diff",
            description:
              "Compare two JSON objects and see differences highlighted. Added, removed, changed keys with color coding.",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />
    </div>
  );
}
