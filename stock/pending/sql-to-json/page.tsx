import SqlToJson from "./components/SqlToJson";

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
            SQL INSERT to JSON Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste SQL INSERT statements and instantly convert them to a JSON
            array of objects. Supports multiple INSERTs, quoted strings,
            numbers, and NULL values. No signup required.
          </p>
        </div>

        {/* Tool */}
        <SqlToJson />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What This Tool Does
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This SQL to JSON converter parses SQL INSERT statements directly in
            the browser and outputs a clean JSON array. It extracts the table
            name, column list, and all value tuples from one or more INSERT
            statements, mapping each row to a JSON object keyed by column name.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supported SQL Syntax
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The parser handles standard INSERT syntax:
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Single-row inserts</strong> —{" "}
              <code>INSERT INTO table (col1, col2) VALUES (val1, val2);</code>
            </li>
            <li>
              <strong>Multi-row inserts</strong> — multiple value tuples in one
              statement:{" "}
              <code>VALUES (v1, v2), (v3, v4), ...</code>
            </li>
            <li>
              <strong>Multiple INSERT statements</strong> — paste a whole SQL
              dump and all INSERTs are merged into one JSON array.
            </li>
            <li>
              <strong>Quoted strings</strong> — single-quoted strings with
              escaped quotes (<code>\'</code> or <code>''</code>) are handled
              correctly.
            </li>
            <li>
              <strong>NULL values</strong> — SQL <code>NULL</code> becomes JSON{" "}
              <code>null</code>.
            </li>
            <li>
              <strong>Numbers and booleans</strong> — numeric literals are
              converted to JSON numbers; <code>TRUE</code>/<code>FALSE</code>{" "}
              become JSON booleans.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Use Cases
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Convert a SQL database dump or seed file into JSON for use in a
              Node.js, Python, or frontend application.
            </li>
            <li>
              Migrate data from a relational database to a document store like
              MongoDB or Firestore.
            </li>
            <li>
              Quickly inspect the data in a SQL INSERT script without running a
              database server.
            </li>
            <li>
              Prepare fixture data in JSON format for unit tests or API mocking.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            SQL INSERT to JSON Converter — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://csv-to-json-gamma.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                CSV to JSON
              </a>
              <a
                href="https://xml-to-json-xi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                XML to JSON
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
                href="https://toml-to-json-nu.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                TOML to JSON
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
