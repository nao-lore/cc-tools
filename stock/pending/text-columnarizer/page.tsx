import TextColumnarizer from "./components/TextColumnarizer";

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
            Text to Columns
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Split delimited text into columns, reorder or delete them, then
            export with a different delimiter. Supports CSV, TSV, pipe, and
            custom delimiters. Runs entirely in your browser.
          </p>
        </div>

        {/* Tool */}
        <TextColumnarizer />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is Text to Columns?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            "Text to Columns" is a classic spreadsheet operation that splits a
            single column of delimited text into multiple separate columns. This
            tool brings that capability to the browser — paste any delimited
            text, choose the delimiter, and instantly see a live table preview
            you can reshape before exporting.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Paste your delimited text into the input box and select the input
            delimiter (comma, tab, pipe, semicolon, or a custom character). A
            preview table appears showing each column. Drag column headers to
            reorder them, or click the delete button on any column to remove it
            entirely. Choose an output delimiter — which can differ from the
            input — and the reformatted text updates in the output box
            automatically. Copy to clipboard or download as a .txt file.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Use Cases
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Convert CSV to TSV or pipe-delimited format for database imports.
            </li>
            <li>
              Reorder columns in a CSV export without opening a spreadsheet app.
            </li>
            <li>
              Strip unwanted columns from log files or data dumps quickly.
            </li>
            <li>
              Change the delimiter of a data file to match a target system's
              expected format.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Text to Columns — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://csv-viewer-sigma.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                CSV Viewer
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
                href="/json-formatter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
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
