import SchemaMarkupTester from "./components/SchemaMarkupTester";

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
            Schema Markup Tester & Validator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Validate JSON-LD structured data against Schema.org. Check required
            and recommended properties, and preview how your markup may appear
            in Google rich results. Free, no signup.
          </p>
        </div>

        {/* Tool */}
        <SchemaMarkupTester />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is JSON-LD Schema Markup?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            JSON-LD (JavaScript Object Notation for Linked Data) is the
            recommended format for adding structured data to your web pages.
            Search engines like Google use it to understand your content and
            display enhanced results — called rich results — in search.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supported Schema Types
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Article</strong> — News articles, blog posts, and editorial content.
            </li>
            <li>
              <strong>Product</strong> — Products with price, availability, and ratings.
            </li>
            <li>
              <strong>FAQPage</strong> — Frequently asked questions that may appear as expandable answers in search.
            </li>
            <li>
              <strong>LocalBusiness</strong> — Physical business locations with address and hours.
            </li>
            <li>
              <strong>BreadcrumbList</strong> — Site navigation breadcrumbs.
            </li>
            <li>
              <strong>Event</strong> — Events with date, location, and ticket information.
            </li>
            <li>
              <strong>Recipe</strong> — Cooking recipes with ingredients and instructions.
            </li>
            <li>
              <strong>HowTo</strong> — Step-by-step instructional content.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              Paste your JSON-LD markup into the input area (the full{" "}
              <code>&lt;script type="application/ld+json"&gt;</code> block or
              just the JSON object).
            </li>
            <li>
              The tool automatically detects the <code>@type</code> and
              validates required and recommended properties.
            </li>
            <li>
              Review errors (missing required fields) and warnings (missing
              recommended fields) in the results panel.
            </li>
            <li>
              Check the rich result preview to see a simplified Google SERP
              snippet based on your data.
            </li>
            <li>
              Copy the cleaned, formatted JSON-LD and add it to your page&apos;s{" "}
              <code>&lt;head&gt;</code>.
            </li>
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Schema Markup Tester — Free online SEO tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://canonical-tag-checker.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Canonical Tag Checker
              </a>
              <a
                href="https://robots-txt-generator.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                robots.txt Generator
              </a>
              <a
                href="https://twitter-card-preview.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Twitter Card Preview
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
