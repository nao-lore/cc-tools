import TomlFormatter from "./components/TomlFormatter";

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
            TOML Formatter & Validator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Format, validate, and convert TOML files online. Paste your TOML,
            view formatted output, JSON conversion, or tree structure. Free and instant.
          </p>
        </div>

        {/* Tool */}
        <TomlFormatter />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is TOML?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            TOML (Tom&apos;s Obvious, Minimal Language) is a configuration file format
            designed to be easy to read due to obvious semantics. It maps unambiguously
            to a hash table and is used by tools like Rust&apos;s Cargo, Python&apos;s Poetry,
            Hugo, and many other projects as their configuration format.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supported TOML Features
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>Key-value pairs with bare and quoted keys</li>
            <li>Sections and tables using <code>[section]</code> syntax</li>
            <li>Nested tables with dot notation</li>
            <li>Arrays of tables using <code>[[array]]</code> syntax</li>
            <li>Strings (basic, literal, multiline)</li>
            <li>Integers, floats, booleans</li>
            <li>Arrays and inline tables</li>
            <li>Comments (stripped during conversion)</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Paste your TOML</strong> into the input editor on the left.
            </li>
            <li>
              <strong>View the output</strong> in the Formatted TOML, JSON, or Tree tab on the right.
            </li>
            <li>
              <strong>Validation errors</strong> appear with line numbers below the editor.
            </li>
            <li>
              <strong>Format or Minify</strong> your TOML using the buttons above.
            </li>
            <li>
              <strong>Copy</strong> the output with one click.
            </li>
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">toml-formatter — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/json-formatter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
              <a href="https://yaml-to-json-five-wine.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">YAML to JSON</a>
              <a href="/xml-formatter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">XML Formatter</a>
              <a href="/sql-formatter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">SQL Formatter</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools &rarr;</a>
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
