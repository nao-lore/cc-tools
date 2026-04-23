import JsonSchemaValidator from "./components/JsonSchemaValidator";

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
            JSON Schema Validator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Validate JSON data against a JSON Schema definition. See all
            validation errors with exact JSON paths instantly.
          </p>
        </div>

        {/* Tool */}
        <JsonSchemaValidator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is JSON Schema?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            JSON Schema is a vocabulary that allows you to annotate and validate
            JSON documents. It describes the expected structure, data types, and
            constraints of JSON data. JSON Schema Draft-07 is one of the most
            widely adopted versions, supported by a large ecosystem of
            validators, code generators, and documentation tools.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supported Keywords
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>type</strong> — Validates the JSON type: string, number,
              integer, boolean, array, object, or null.
            </li>
            <li>
              <strong>required</strong> — Ensures specified keys are present in
              an object.
            </li>
            <li>
              <strong>properties</strong> — Validates each property of an object
              against its own sub-schema.
            </li>
            <li>
              <strong>additionalProperties</strong> — Controls whether extra
              properties not listed in{" "}
              <code className="font-mono text-sm bg-gray-100 px-1 rounded">
                properties
              </code>{" "}
              are allowed.
            </li>
            <li>
              <strong>items</strong> — Validates each element in an array
              against a sub-schema.
            </li>
            <li>
              <strong>minLength / maxLength</strong> — String length constraints.
            </li>
            <li>
              <strong>minimum / maximum</strong> — Numeric range constraints.
            </li>
            <li>
              <strong>enum</strong> — Restricts the value to a fixed set of
              allowed values.
            </li>
            <li>
              <strong>pattern</strong> — Validates a string against a regular
              expression.
            </li>
            <li>
              <strong>allOf / anyOf / oneOf / not</strong> — Composite schema
              combinators.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Validator
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              Paste your <strong>JSON Schema</strong> into the left panel.
            </li>
            <li>
              Paste the <strong>JSON data</strong> you want to validate into the
              right panel.
            </li>
            <li>
              Click <strong>Validate</strong> to run the validation. Errors are
              shown with their exact JSON path.
            </li>
            <li>
              Use <strong>Sample (valid)</strong> or{" "}
              <strong>Sample (invalid)</strong> to try it instantly with example
              data.
            </li>
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            JSON Schema Validator — Free online tool. No signup required.
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
                href="/yaml-to-json"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                YAML to JSON
              </a>
              <a
                href="/jwt-decoder"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JWT Decoder
              </a>
              <a
                href="/json-to-csv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON to CSV
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
