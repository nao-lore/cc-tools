import CurlConverter from "./components/CurlConverter";

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
            cURL to Code Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste any cURL command and instantly convert it to JavaScript fetch,
            Python requests, Go, PHP, or Ruby. No signup required.
          </p>
        </div>

        {/* Tool */}
        <CurlConverter />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is cURL?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            cURL (Client URL) is a command-line tool for making HTTP requests.
            It is the universal language of APIs — documentation, Postman, and
            developer tools all use cURL as a lingua franca for sharing request
            examples. Knowing how to translate a cURL command into your
            preferred language is a daily task for most backend and full-stack
            developers.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supported Languages
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>JavaScript (fetch)</strong> — Uses the native Fetch API
              with async/await, compatible with Node.js 18+ and all modern
              browsers.
            </li>
            <li>
              <strong>Python (requests)</strong> — Uses the popular{" "}
              <code>requests</code> library, including automatic JSON
              serialization via the <code>json=</code> parameter.
            </li>
            <li>
              <strong>Go (net/http)</strong> — Uses the standard library{" "}
              <code>net/http</code> package with proper error handling and
              response body reading.
            </li>
            <li>
              <strong>PHP (curl)</strong> — Uses PHP's built-in cURL extension
              with <code>curl_init</code>, headers, and postfields.
            </li>
            <li>
              <strong>Ruby (net/http)</strong> — Uses Ruby's standard library
              with SSL support and basic authentication helpers.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Paste your cURL command</strong> into the input area. You
              can copy it from API docs, Postman, or browser DevTools (right-click
              a network request → Copy as cURL).
            </li>
            <li>
              <strong>Select the target language</strong> from the tabs:
              JavaScript, Python, Go, PHP, or Ruby.
            </li>
            <li>
              <strong>Click Copy</strong> to copy the generated code to your
              clipboard. The parsed method, URL, headers, and body are shown as
              badges below the input.
            </li>
            <li>
              Use the <strong>example buttons</strong> to see how common patterns
              like POST with JSON body, Bearer token auth, or basic auth are
              converted.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What cURL Flags Are Supported?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The parser handles the most common cURL flags used in API
            documentation:
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-1 mb-4 list-disc list-inside">
            <li><code>-X</code> / <code>--request</code> — HTTP method (GET, POST, PUT, PATCH, DELETE)</li>
            <li><code>-H</code> / <code>--header</code> — Request headers</li>
            <li><code>-d</code> / <code>--data</code> / <code>--data-raw</code> — Request body</li>
            <li><code>-u</code> / <code>--user</code> — Basic authentication</li>
            <li><code>-A</code> / <code>--user-agent</code> — User-Agent header</li>
            <li>Multi-line commands with <code>\</code> line continuations</li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            cURL Converter — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://json-formatter-xi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
              </a>
              <a
                href="https://jwt-decoder-five.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JWT Decoder
              </a>
              <a
                href="https://base64-encoder-xi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Base64 Encoder
              </a>
              <a
                href="https://url-encoder-five.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                URL Encoder
              </a>
              <a
                href="https://regex-tester-xi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Regex Tester
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
