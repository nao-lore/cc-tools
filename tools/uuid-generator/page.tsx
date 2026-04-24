import UuidGenerator from "./components/UuidGenerator";

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
            UUID Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate random UUID v4 values instantly. Choose a count, pick a
            format, and copy to clipboard with one click.
          </p>
        </div>

        {/* UUID Generator Tool */}
        <UuidGenerator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a UUID?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A UUID (Universally Unique Identifier) is a 128-bit value used to
            uniquely identify information in computer systems. Also known as a
            GUID (Globally Unique Identifier), UUIDs are standardized by RFC
            4122. The most common version, UUID v4, is generated using random or
            pseudo-random numbers, making collisions extremely unlikely.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            UUID v4 Format
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            A UUID v4 follows the pattern{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">
              xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
            </code>{" "}
            where each <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">x</code> is
            a random hexadecimal digit and{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">y</code> is one of{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">8</code>,{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">9</code>,{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">a</code>, or{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">b</code>. The{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">4</code> indicates the
            UUID version. Example:
          </p>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono text-gray-800 overflow-x-auto mb-4">
            550e8400-e29b-41d4-a716-446655440000
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Use Cases
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Database primary keys</strong> — UUIDs provide unique IDs
              without a central authority or auto-increment sequence.
            </li>
            <li>
              <strong>Distributed systems</strong> — Multiple services can
              independently generate IDs without coordination.
            </li>
            <li>
              <strong>Session tokens</strong> — Random UUIDs work well as
              session identifiers in web applications.
            </li>
            <li>
              <strong>File naming</strong> — Ensure unique filenames for uploads
              or temporary files.
            </li>
            <li>
              <strong>API request tracing</strong> — Attach a UUID to each
              request for logging and debugging across microservices.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Generator
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Select a count</strong> — Choose how many UUIDs to
              generate at once (1, 5, 10, 50, or 100).
            </li>
            <li>
              <strong>Pick a format</strong> — Standard (with dashes), no
              dashes, uppercase, or lowercase.
            </li>
            <li>
              <strong>Click Generate</strong> — New UUIDs appear instantly.
            </li>
            <li>
              <strong>Copy</strong> — Click Copy on any single UUID, or Copy All
              to grab the entire list.
            </li>
          </ol>
          <p className="text-gray-700 leading-relaxed mb-4">
            All UUIDs are generated entirely in your browser using the Web
            Crypto API. No data is sent to any server.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">UUID Generator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/password-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Password Generator</a>
              <a href="/hash-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Hash Generator</a>
              <a href="/qr-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">QR Generator</a>
              <a href="/cron-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Cron Generator</a>
              <a href="/regex-tester" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Regex Tester</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "UUID Generator",
  "description": "Generate random UUID v4 values instantly. Choose a count, pick a\n            format, and copy to clipboard with one click.",
  "url": "https://tools.loresync.dev/uuid-generator",
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
