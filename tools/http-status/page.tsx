import HttpStatusCodes from "./components/HttpStatusCodes";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            HTTP Status Codes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete reference guide for every HTTP response status code.
            Search by code number or keyword, click to expand details.
          </p>
        </div>

        {/* HTTP Status Codes Tool */}
        <HttpStatusCodes />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Are HTTP Status Codes?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            HTTP status codes are three-digit numbers returned by a web server in
            response to a client request. They indicate whether the request was
            successful, redirected, or resulted in an error. Every time your
            browser loads a page, makes an API call, or submits a form, the
            server responds with one of these codes along with the actual content.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            HTTP Status Code Categories
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Status codes are grouped into five categories based on their first
            digit:
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>1xx Informational</strong> — The server received the
              request and is continuing the process.
            </li>
            <li>
              <strong>2xx Success</strong> — The request was successfully
              received, understood, and accepted.
            </li>
            <li>
              <strong>3xx Redirection</strong> — Further action is needed to
              complete the request, usually a redirect.
            </li>
            <li>
              <strong>4xx Client Error</strong> — The request contains bad
              syntax or cannot be fulfilled by the server.
            </li>
            <li>
              <strong>5xx Server Error</strong> — The server failed to fulfill a
              valid request.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Most Common HTTP Status Codes
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            While there are dozens of defined status codes, a handful appear far
            more frequently in everyday web development. <strong>200 OK</strong>{" "}
            means the request succeeded. <strong>301 Moved Permanently</strong>{" "}
            tells the client the resource has a new URL. <strong>404 Not Found</strong>{" "}
            means the server cannot find the requested resource.{" "}
            <strong>500 Internal Server Error</strong> indicates something went
            wrong on the server side. Understanding these codes helps developers
            debug issues, configure proper redirects, and build better error
            handling in their applications.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Reference
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Search</strong> by typing a status code number or keyword
              in the search box above.
            </li>
            <li>
              <strong>Browse by category</strong> — codes are color-coded and
              grouped by their response type.
            </li>
            <li>
              <strong>Click any code</strong> to expand its detailed explanation,
              including when you encounter it and examples.
            </li>
            <li>
              <strong>Copy descriptions</strong> with one click for use in
              documentation, comments, or error messages.
            </li>
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">HTTP Status Codes — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/robots-txt-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Robots.txt Generator</a>
              <a href="/meta-tag-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Meta Tag Generator</a>
              <a href="/regex-tester" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Regex Tester</a>
              <a href="/json-formatter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
              <a href="/url-encoder" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">URL Encoder</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "HTTP Status Codes",
  "description": "Complete reference guide for every HTTP response status code.\n            Search by code number or keyword, click to expand details.",
  "url": "https://tools.loresync.dev/http-status",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
