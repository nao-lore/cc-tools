import HttpHeaderBuilder from "./components/HttpHeaderBuilder";

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
            HTTP Header Builder & Validator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Build HTTP request or response headers with a form-based interface.
            Get instant validation warnings for deprecated values and common
            misconfigurations.
          </p>
        </div>

        {/* Tool */}
        <HttpHeaderBuilder />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Are HTTP Headers?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            HTTP headers are key-value pairs sent alongside every HTTP request
            and response. They carry metadata about the request, the client, the
            server, the content, and instructions for caching, security, and
            authentication. Getting headers right is critical for API security,
            browser compatibility, and performance.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Choose Request or Response mode</strong> using the toggle
              at the top. The header name list and presets will update
              accordingly.
            </li>
            <li>
              <strong>Add headers</strong> by selecting a name from the dropdown
              (or choose "Custom..." to type any name) and entering the value.
            </li>
            <li>
              <strong>Use Quick-add presets</strong> to insert common header
              groups in one click — CORS, caching, security, and more.
            </li>
            <li>
              <strong>Review validation warnings</strong> that appear
              automatically for deprecated headers, incorrect formats, and
              security misconfigurations.
            </li>
            <li>
              <strong>Copy the output</strong> to paste into your code, a curl
              command, Postman, or any HTTP client.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Header Presets
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>JSON API</strong> — Content-Type and Accept headers for
              REST JSON APIs.
            </li>
            <li>
              <strong>Bearer Auth</strong> — Authorization header with Bearer
              token placeholder.
            </li>
            <li>
              <strong>CORS Open</strong> — Full permissive CORS response headers
              for development and public APIs.
            </li>
            <li>
              <strong>Security</strong> — HSTS, X-Content-Type-Options,
              X-Frame-Options, and CSP for hardening response headers.
            </li>
            <li>
              <strong>Caching</strong> — Immutable long-term caching headers for
              static assets plus ETag and Vary.
            </li>
            <li>
              <strong>No Cache</strong> — Force no caching for dynamic or
              sensitive responses.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Deprecated Headers to Avoid
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Several HTTP headers have been deprecated or made obsolete by newer
            standards. This tool warns you when you use them:
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-1 mb-4 list-disc list-inside">
            <li>
              <code>Pragma</code> — Replaced by{" "}
              <code>Cache-Control</code> in HTTP/1.1.
            </li>
            <li>
              <code>Expires</code> — Replaced by{" "}
              <code>Cache-Control: max-age</code>.
            </li>
            <li>
              <code>X-XSS-Protection</code> — Removed from modern browsers; use
              Content-Security-Policy instead.
            </li>
            <li>
              <code>X-Frame-Options: ALLOW-FROM</code> — Deprecated; use CSP
              frame-ancestors.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            HTTP Header Builder — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://curl-converter-xi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                cURL Converter
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
                href="https://json-formatter-xi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
              </a>
              <a
                href="https://base64-encoder-xi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Base64 Encoder
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
