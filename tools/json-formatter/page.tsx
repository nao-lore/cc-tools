import JsonFormatter from "./components/JsonFormatter";

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
            JSON Formatter & Validator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste your JSON to format, validate, and beautify it instantly.
            Syntax highlighting, error detection, and one-click copy.
          </p>
        </div>

        {/* JSON Formatter Tool */}
        <JsonFormatter />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is JSON?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            JSON (JavaScript Object Notation) is a lightweight data interchange
            format that is easy for humans to read and write and easy for
            machines to parse and generate. It is the most widely used format
            for APIs, configuration files, and data storage across web
            applications, mobile apps, and backend services.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Format JSON?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Raw JSON from APIs or logs is often minified into a single line,
            making it nearly impossible to read. Formatting JSON with proper
            indentation and line breaks makes the structure visible at a glance.
            This tool also validates your JSON and highlights syntax errors with
            the exact line number, helping you catch missing commas, unmatched
            brackets, or invalid values before they cause problems in your code.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This JSON Formatter
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Paste your JSON</strong> into the input area on the left.
              The validator instantly checks whether the JSON is valid.
            </li>
            <li>
              <strong>Click Format</strong> to beautify the JSON with your
              chosen indentation (2 spaces, 4 spaces, or tabs).
            </li>
            <li>
              <strong>Click Minify</strong> to compress the JSON into a single
              line, removing all unnecessary whitespace.
            </li>
            <li>
              <strong>Click Copy</strong> to copy the formatted output to your
              clipboard with one click.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tips for Working with JSON
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Always use double quotes for keys and string values. Single quotes
              are not valid in JSON.
            </li>
            <li>
              Trailing commas after the last item in an object or array are not
              allowed in JSON, even though JavaScript permits them.
            </li>
            <li>
              Use minified JSON for network requests and storage to reduce
              payload size, and formatted JSON for debugging and documentation.
            </li>
            <li>
              When working with large JSON files, check the character and line
              count displayed above the output to monitor the size.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">JSON Formatter — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://json-to-csv-rho.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON to CSV</a>
              <a href="https://yaml-to-json-theta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">YAML to JSON</a>
              <a href="https://xml-formatter-xi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">XML Formatter</a>
              <a href="https://sql-formatter-liart.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">SQL Formatter</a>
              <a href="https://jwt-decoder-five.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JWT Decoder</a>
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
