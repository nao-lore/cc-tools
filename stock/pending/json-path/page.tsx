import JsonPathTester from "./components/JsonPathTester";

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
            JSONPath Tester
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Test JSONPath expressions against your JSON data. See matched
            results highlighted, explore the tree view, and use the syntax
            reference — all in one place.
          </p>
        </div>

        {/* Tool */}
        <JsonPathTester />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is JSONPath?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            JSONPath is a query language for JSON, similar to XPath for XML. It
            lets you extract specific values from nested JSON structures using a
            concise expression syntax. JSONPath is widely used in API testing
            tools, data pipelines, and configuration systems to pinpoint
            particular fields inside deeply nested JSON documents.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This JSONPath Tester
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Paste your JSON</strong> into the left panel. Click
              &quot;Format&quot; to prettify it automatically.
            </li>
            <li>
              <strong>Enter a JSONPath expression</strong> in the input at the
              top. All expressions start with <code>$</code> (the root).
            </li>
            <li>
              <strong>Click Run</strong> (or press Enter) to execute the query.
              Matched values appear in the Results panel on the right.
            </li>
            <li>
              <strong>Switch to Tree View</strong> to explore the full JSON
              structure interactively.
            </li>
            <li>
              Use the <strong>quick-fill buttons</strong> to try common
              expression patterns instantly.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            JSONPath Expression Examples
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <code>$.store.book[*].author</code> — all author values inside the
              book array
            </li>
            <li>
              <code>$..price</code> — every <em>price</em> field anywhere in the
              document
            </li>
            <li>
              <code>$.store.book[0:2]</code> — first two books (array slice)
            </li>
            <li>
              <code>$.store.book[-1]</code> — last book in the array
            </li>
            <li>
              <code>$..*</code> — every value in the entire document
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            JSONPath Tester — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://json-formatter-beta-rouge.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
              </a>
              <a
                href="https://json-to-csv-rho.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON to CSV
              </a>
              <a
                href="https://yaml-to-json-theta.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                YAML to JSON
              </a>
              <a
                href="https://jwt-decoder-five.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JWT Decoder
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
