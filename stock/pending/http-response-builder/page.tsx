import HttpResponseBuilder from "./components/HttpResponseBuilder";

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
            HTTP Response Builder
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compose complete HTTP responses with status code, headers, and body.
            Copy the raw response string for API documentation, mock servers, or
            testing.
          </p>
        </div>

        {/* Tool */}
        <HttpResponseBuilder />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is an HTTP Response?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            An HTTP response is the message a server sends back after receiving
            an HTTP request. It consists of three parts: a status line (HTTP
            version, status code, and reason phrase), zero or more header
            fields, and an optional message body. Understanding the exact format
            is essential for building API documentation, writing integration
            tests, and configuring mock servers.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Select a status code</strong> from the grouped dropdown
              (2xx, 3xx, 4xx, 5xx). The badge updates to reflect the category.
            </li>
            <li>
              <strong>Add headers</strong> using the name dropdown or type a
              custom name. Use the preset buttons to insert common header groups
              like CORS, caching, or security headers in one click.
            </li>
            <li>
              <strong>Choose a body format</strong> — JSON, HTML, or plain text.
              Switching format updates the Content-Type header automatically.
            </li>
            <li>
              <strong>Format JSON</strong> with the Format button to
              pretty-print and validate the body.
            </li>
            <li>
              <strong>Copy the output</strong> — the raw HTTP response string
              with proper CRLF line endings, ready to paste into docs, fixtures,
              or a mock server.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Use Cases
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>API Documentation</strong> — Show example responses in
              OpenAPI specs, README files, or Postman collections.
            </li>
            <li>
              <strong>Mock Servers</strong> — Paste the raw response string into
              tools like WireMock, msw, or json-server fixture files.
            </li>
            <li>
              <strong>Integration Tests</strong> — Use the formatted response as
              a fixture for testing HTTP client parsing logic.
            </li>
            <li>
              <strong>Learning</strong> — Understand how status codes, headers,
              and bodies combine into a real HTTP response.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            HTTP Status Code Groups
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>2xx Success</strong> — The request was received, understood,
              and accepted. Common: 200 OK, 201 Created, 204 No Content.
            </li>
            <li>
              <strong>3xx Redirection</strong> — Further action is needed to
              complete the request. Common: 301 Moved Permanently, 304 Not
              Modified.
            </li>
            <li>
              <strong>4xx Client Error</strong> — The request contains bad syntax
              or cannot be fulfilled. Common: 400, 401, 403, 404, 429.
            </li>
            <li>
              <strong>5xx Server Error</strong> — The server failed to fulfill a
              valid request. Common: 500 Internal Server Error, 503 Service
              Unavailable.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            HTTP Response Builder — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://http-header-builder.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                HTTP Header Builder
              </a>
              <a
                href="https://curl-converter-xi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                cURL Converter
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
                href="https://json-formatter-xi.vercel.app"
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
