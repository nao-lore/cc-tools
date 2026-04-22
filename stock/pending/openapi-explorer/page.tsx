import OpenApiExplorer from "./components/OpenApiExplorer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* AdSense slot - top banner */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            OpenAPI / Swagger Explorer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste your OpenAPI 3.x JSON spec and browse endpoints interactively.
            See parameters, request bodies, and response schemas. No upload required.
          </p>
        </div>

        {/* Tool */}
        <OpenApiExplorer />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is OpenAPI?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            OpenAPI (formerly Swagger) is the industry-standard specification for describing REST
            APIs. An OpenAPI document is a JSON or YAML file that lists every endpoint your API
            exposes along with the HTTP method, parameters, request body shape, and all possible
            response codes and schemas. Tools like Swagger UI, Postman, and code generators all
            consume OpenAPI specs to produce interactive documentation or client SDKs automatically.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How This Explorer Works
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Paste any valid OpenAPI 3.x JSON document into the textarea. The tool parses it entirely
            in your browser — nothing is sent to a server. Endpoints are grouped by tag and displayed
            as collapsible cards. Click any card to expand it and see the full parameter table, request
            body schema, and response schemas. Use the search box to filter endpoints by path, HTTP
            method, tag, summary, or operationId in real time.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Reading the Endpoint Detail
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Each expanded endpoint shows three sections. The <strong>Parameters</strong> table lists
            path, query, header, and cookie parameters with their type, whether they are required,
            and a description. The <strong>Request Body</strong> section renders the schema for POST
            and PUT operations, including field names, types, and which fields are required. The{" "}
            <strong>Responses</strong> section lists every documented status code with its description
            and response schema, color-coded by class (2xx green, 4xx orange, 5xx red).
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Use Cases
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Quickly review an unfamiliar API without setting up Swagger UI locally.
            </li>
            <li>
              Validate that a generated OpenAPI spec has the expected paths and schemas before
              committing it to your repository.
            </li>
            <li>
              Share a read-only view of your API contract with team members or stakeholders without
              running a documentation server.
            </li>
            <li>
              Debug schema mismatches by inspecting request and response field definitions side by side.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            OpenAPI Explorer — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://json-formatter-topaz-pi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
              </a>
              <a
                href="https://json-schema-validator-chi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Schema Validator
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
                href="https://curl-converter-beige.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                cURL Converter
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
