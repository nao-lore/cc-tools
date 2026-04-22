import JsonToCsv from "./components/JsonToCsv";

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
            JSON to CSV Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste JSON, preview the data as a table, and download CSV instantly.
            Supports nested objects, custom delimiters, and reverse CSV-to-JSON
            conversion.
          </p>
        </div>

        {/* Converter Tool */}
        <JsonToCsv />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Convert JSON to CSV?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            JSON is the standard data format for APIs, configuration files, and
            web applications. However, many workflows still depend on
            spreadsheets and tabular data. Converting JSON to CSV lets you open
            API responses in Excel or Google Sheets, import data into databases,
            or share structured information with non-technical stakeholders who
            prefer flat files over nested structures.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How This Converter Works
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Paste a JSON array of objects into the input field and the tool
            automatically flattens nested properties using dot notation, extracts
            all unique keys as column headers, and generates a CSV string. You
            can choose between comma, tab, and semicolon delimiters. Toggle
            header inclusion or force-quote every field for maximum
            compatibility. The table preview lets you inspect the data before
            downloading. Everything runs in your browser with no server
            round-trips, so your data stays private.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            CSV to JSON Reverse Conversion
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Need to go the other way? Switch to CSV-to-JSON mode and paste
            comma-separated or tab-separated text. The first row is treated as
            the header, and each subsequent row becomes a JSON object. This is
            useful when you have spreadsheet data that needs to be sent to an API
            or consumed by a JavaScript application. The output is
            pretty-printed JSON that you can copy or download as a .json file.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Use Cases
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Export API responses to spreadsheets for analysis or reporting.
            </li>
            <li>
              Prepare CSV uploads for databases, CRMs, or marketing platforms
              from JSON source data.
            </li>
            <li>
              Convert CSV exports from tools like Excel or Google Sheets into
              JSON for use in web applications.
            </li>
            <li>
              Flatten deeply nested JSON structures into a readable flat table
              format.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">JSON to CSV Converter — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://json-formatter-topaz-pi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
              <a href="https://yaml-to-json-theta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">YAML to JSON</a>
              <a href="https://xml-formatter-xi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">XML Formatter</a>
              <a href="https://sql-formatter-liart.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">SQL Formatter</a>
              <a href="https://mdtable.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Markdown Table</a>
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
