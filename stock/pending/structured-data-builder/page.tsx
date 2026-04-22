import StructuredDataBuilder from "./components/StructuredDataBuilder";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* AdSense slot - top banner */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            JSON-LD Structured Data Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Build Schema.org structured data visually. Select a schema type,
            fill in the fields, and copy the ready-to-paste script tag.
          </p>
        </div>

        {/* Tool */}
        <StructuredDataBuilder />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is JSON-LD Structured Data?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            JSON-LD (JavaScript Object Notation for Linked Data) is the
            recommended format for adding Schema.org structured data to web
            pages. Search engines like Google read this machine-readable markup
            to understand your content and display rich results — star ratings,
            FAQ dropdowns, breadcrumb trails, and product prices — directly in
            the search results page.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supported Schema Types
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Article</strong> — Marks up news articles, blog posts, and
              how-to guides. Required fields include headline and datePublished.
              Enables rich results for articles in Google News.
            </li>
            <li>
              <strong>Product</strong> — Adds price, availability, brand, and
              aggregate rating data. Enables product rich snippets with star
              ratings in search results.
            </li>
            <li>
              <strong>FAQ</strong> — Adds question/answer pairs that can appear
              as expandable dropdowns beneath your search result. Each answer
              must be present on the page.
            </li>
            <li>
              <strong>BreadcrumbList</strong> — Displays a navigation path (e.g.
              Home &rsaquo; Category &rsaquo; Page) inside the search snippet
              URL line.
            </li>
            <li>
              <strong>LocalBusiness</strong> — Provides business details for
              Knowledge Panel and local pack eligibility. Specify address,
              phone, hours, and business type.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Add JSON-LD to Your Page
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              Select your schema type and fill in the form fields on the left.
            </li>
            <li>
              Check the validation warnings — all required fields must be
              present for Google to use the markup.
            </li>
            <li>
              Click <strong>Copy Script Tag</strong> to copy the complete{" "}
              <code>&lt;script type=&quot;application/ld+json&quot;&gt;</code>{" "}
              block.
            </li>
            <li>
              Paste it inside the <code>&lt;head&gt;</code> section of your
              HTML. Multiple schema blocks on the same page are supported.
            </li>
            <li>
              Validate with{" "}
              <a
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google&apos;s Rich Results Test
              </a>{" "}
              before deploying.
            </li>
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            JSON-LD Structured Data Generator — Free online tool. No signup
            required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://json-schema-validator.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Schema Validator
              </a>
              <a
                href="https://json-path-tester.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSONPath Tester
              </a>
              <a
                href="https://openapi-explorer.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                OpenAPI Explorer
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
        <div className="max-w-6xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    </div>
  );
}
