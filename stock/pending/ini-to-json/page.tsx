import IniToJson from "./components/IniToJson";

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
            INI to JSON Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert INI configuration files to JSON instantly. Supports sections,
            key-value pairs, comments, quoted values, and multiline continuation.
            Free and instant.
          </p>
        </div>

        {/* Tool */}
        <IniToJson />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is an INI File?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            INI files are simple configuration files widely used in Windows applications,
            Python&apos;s configparser, PHP, and many other tools. They consist of sections
            enclosed in square brackets and key-value pairs separated by <code>=</code> or <code>:</code>.
            Comments start with <code>;</code> or <code>#</code>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supported INI Features
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>Sections using <code>[section]</code> syntax as top-level JSON keys</li>
            <li>Key-value pairs with <code>=</code> or <code>:</code> delimiters</li>
            <li>Line comments starting with <code>;</code> or <code>#</code></li>
            <li>Quoted string values (single and double quotes)</li>
            <li>Multiline values using backslash (<code>\</code>) line continuation</li>
            <li>Global keys before the first section</li>
            <li>Bidirectional: convert JSON back to INI format</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Paste your INI</strong> into the input on the INI to JSON tab.
            </li>
            <li>
              <strong>View the JSON output</strong> immediately in the right panel.
            </li>
            <li>
              <strong>Switch to JSON to INI</strong> to convert JSON back to INI format.
            </li>
            <li>
              <strong>Copy or Download</strong> the result with one click.
            </li>
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">ini-to-json — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://toml-formatter.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">TOML Formatter</a>
              <a href="https://yaml-to-json-five-wine.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">YAML to JSON</a>
              <a href="https://csv-to-json.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSV to JSON</a>
              <a href="https://json-formatter-topaz-pi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools &rarr;</a>
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
