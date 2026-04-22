import CsvViewer from "./components/CsvViewer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* AdSense slot - top banner */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            CSV Viewer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload or paste CSV data to explore it as a sortable, searchable
            table. Auto-detects commas, tabs, semicolons, and pipes. No signup
            required.
          </p>
        </div>

        {/* Tool */}
        <CsvViewer />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a CSV File?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            CSV (Comma-Separated Values) is one of the most widely used plain-text
            formats for tabular data. Spreadsheet applications like Excel and
            Google Sheets, databases, and data pipelines all export and import CSV
            files. The format stores rows as lines of text with fields separated
            by a delimiter — most commonly a comma, but sometimes a tab,
            semicolon, or pipe character.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How This CSV Viewer Works
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Upload a .csv file from your computer or paste CSV text directly into
            the textarea. The viewer automatically detects the delimiter by
            sampling the first line, then renders the data as a clean HTML table.
            Click any column header to sort ascending or descending. Use the
            search box to filter rows across all columns in real time. Drag the
            column resize handles to widen or narrow any column. Everything runs
            entirely in your browser — your data is never sent to a server.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sortable Columns and Search
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Click a column header once to sort that column ascending (A→Z or
            0→9). Click again to sort descending. An indicator arrow shows the
            current sort state. The search bar filters visible rows instantly —
            useful for large files with hundreds or thousands of rows. Only
            matching rows are counted in the stats bar.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Use Cases
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Quickly inspect CSV exports from Excel, Google Sheets, or databases
              without opening a spreadsheet app.
            </li>
            <li>
              Verify the structure and content of CSV files before importing them
              into a pipeline or API.
            </li>
            <li>
              Sort and filter large datasets to find specific records without any
              software installation.
            </li>
            <li>
              Preview tab-separated (TSV) files, semicolon-delimited exports from
              European locales, or pipe-delimited log files.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            CSV Viewer — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://json-to-csv-two.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON to CSV
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
                href="https://yaml-to-json-theta.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                YAML to JSON
              </a>
              <a
                href="https://xml-formatter-xi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                XML Formatter
              </a>
              <a
                href="https://mdtable.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Markdown Table
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
