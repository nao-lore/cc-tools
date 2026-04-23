import MetaTagGenerator from "./components/MetaTagGenerator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Meta Tag Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate HTML meta tags for SEO, Open Graph, and Twitter Cards.
            Preview how your page will appear in search results and social media.
          </p>
        </div>

        {/* Generator Tool */}
        <MetaTagGenerator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Are Meta Tags?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Meta tags are HTML elements that provide metadata about a web page.
            They are placed in the <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">&lt;head&gt;</code> section
            of an HTML document and are not displayed on the page itself. Search
            engines and social media platforms use meta tags to understand the
            content of your page, which directly affects how your page appears in
            search results and when shared on social media.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Are Meta Tags Important for SEO?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The title tag and meta description are among the most important
            on-page SEO elements. The title tag appears as the clickable headline
            in search results, while the meta description provides a brief summary
            below it. A well-crafted title (under 60 characters) and description
            (under 160 characters) can significantly improve your click-through
            rate from search engine results pages.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Open Graph and Twitter Card Tags
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Open Graph (OG) tags control how your content appears when shared on
            Facebook, LinkedIn, and other social platforms. Twitter Card tags serve
            the same purpose for Twitter. Without these tags, social platforms may
            display incorrect titles, descriptions, or images when your page is
            shared. This generator creates both OG and Twitter Card tags so your
            content looks great everywhere.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Meta Tag Generator
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Fill in the basic fields</strong> — title, description,
              keywords, author, and canonical URL.
            </li>
            <li>
              <strong>Configure robots directives</strong> — choose whether search
              engines should index and follow links on your page.
            </li>
            <li>
              <strong>Add Open Graph tags</strong> — set the OG title, description,
              image URL, and other properties for social sharing.
            </li>
            <li>
              <strong>Add Twitter Card tags</strong> — choose the card type and set
              Twitter-specific metadata.
            </li>
            <li>
              <strong>Preview your snippets</strong> — see how your page will look
              in Google search results, Facebook shares, and Twitter cards.
            </li>
            <li>
              <strong>Copy the generated tags</strong> — click the copy button and
              paste the meta tags into your HTML document.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Best Practices for Meta Tags
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Keep your title tag under 60 characters to prevent truncation in
              search results.
            </li>
            <li>
              Write meta descriptions between 120 and 160 characters for optimal
              display.
            </li>
            <li>
              Use unique titles and descriptions for every page on your site.
            </li>
            <li>
              Include your primary keyword naturally in both the title and
              description.
            </li>
            <li>
              Always provide an og:image with dimensions of at least 1200x630
              pixels for best social media display.
            </li>
            <li>
              Set a canonical URL to prevent duplicate content issues.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Meta Tag Generator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/og-image-preview" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">OG Image Preview</a>
              <a href="/robots-txt-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Robots.txt Generator</a>
              <a href="/html-entity" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTML Entity Encoder</a>
              <a href="/json-formatter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
              <a href="/http-status" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTTP Status Codes</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
