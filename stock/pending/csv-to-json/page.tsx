import CsvToJson from "./components/CsvToJson";

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
            CSV to JSON Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert CSV files or pasted data to JSON instantly. Auto-detects
            delimiters, maps column headers to keys, and supports multiple output
            formats. No signup required.
          </p>
        </div>

        {/* Tool */}
        <CsvToJson />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What This Tool Does
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This CSV to JSON converter parses your CSV data in the browser and
            outputs clean JSON. Paste text directly or upload a .csv file.
            The delimiter is detected automatically — commas, tabs, semicolons,
            and pipes are all supported. Quoted fields and escaped quotes inside
            values are handled correctly.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Output Modes
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Choose from three output formats:
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Array of Objects</strong> — the most common format for
              APIs and databases. Each row becomes an object with column headers
              as keys: <code>[&#123;"name":"Alice","age":30&#125;, ...]</code>
            </li>
            <li>
              <strong>Array of Arrays</strong> — compact matrix format. The
              first row contains headers, subsequent rows contain values:
              <code>[["name","age"], ["Alice",30], ...]</code>
            </li>
            <li>
              <strong>Keyed by Column</strong> — each key maps to an array of
              all values in that column:
              <code>&#123;"name":["Alice","Bob"], "age":[30,25]&#125;</code>
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Format vs. Minify
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Toggle between formatted (pretty-printed with indentation) and
            minified output. Formatted JSON is easier to read and debug.
            Minified JSON is smaller and faster to transfer over a network.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Use Cases
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Transform spreadsheet exports from Excel or Google Sheets into
              JSON for use in a web application or REST API.
            </li>
            <li>
              Convert database CSV dumps to JSON for import into MongoDB,
              Elasticsearch, or other document stores.
            </li>
            <li>
              Prepare configuration data or lookup tables as JSON arrays for
              front-end code.
            </li>
            <li>
              Quickly validate that a CSV file has the expected column structure
              before processing it in a pipeline.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            CSV to JSON Converter — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://csv-viewer-tau.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                CSV Viewer
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
                href="/yaml-to-json"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                YAML to JSON
              </a>
              <a
                href="https://json-to-csv-two.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON to CSV
              </a>
              <a
                href="/xml-formatter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                XML Formatter
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
