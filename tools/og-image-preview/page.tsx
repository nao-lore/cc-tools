import OgPreview from "./components/OgPreview";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            OG Image Preview
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Preview how your links will appear when shared on Facebook, Twitter,
            LinkedIn, Discord, and Slack. Enter your meta tag values and see
            live previews instantly.
          </p>
        </div>

        {/* OG Preview Tool */}
        <OgPreview />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Are Open Graph Meta Tags?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Open Graph (OG) meta tags are HTML elements that control how your
            web pages appear when shared on social media platforms. Originally
            created by Facebook, the Open Graph protocol is now used by
            LinkedIn, Discord, Slack, and many other platforms to generate rich
            link previews with titles, descriptions, and images.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Preview Your OG Tags?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Each social media platform renders link previews differently.
            Facebook and LinkedIn use large image cards, Twitter has its own
            card format with summary and large image variants, and Discord and
            Slack use colored embed styles. Previewing your tags before
            publishing ensures your content looks professional across all
            platforms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Recommended OG Image Dimensions
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The recommended Open Graph image size is{" "}
            <strong>1200 x 630 pixels</strong> with an aspect ratio of 1.91:1.
            This size works well across Facebook, LinkedIn, Twitter, and most
            other platforms. Images smaller than 600 x 315 pixels may not
            display correctly. For Twitter summary cards (small square), use
            a minimum of 144 x 144 pixels.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Essential OG Meta Tags
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">
                og:title
              </code>{" "}
              — The title of your page (60-90 characters recommended)
            </li>
            <li>
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">
                og:description
              </code>{" "}
              — A brief summary (150-200 characters recommended)
            </li>
            <li>
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">
                og:image
              </code>{" "}
              — URL to the preview image (1200x630px recommended)
            </li>
            <li>
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">
                og:url
              </code>{" "}
              — The canonical URL of your page
            </li>
            <li>
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">
                og:site_name
              </code>{" "}
              — The name of your website
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              Enter your page title, description, image URL, site name, and
              page URL in the input fields.
            </li>
            <li>
              See live previews for Facebook, Twitter, Discord, LinkedIn, and
              Slack update as you type.
            </li>
            <li>
              Check the character length indicators for optimal tag lengths.
            </li>
            <li>
              Copy the generated meta tag HTML and paste it into your page&apos;s{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">
                &lt;head&gt;
              </code>{" "}
              section.
            </li>
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">OG Image Preview — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/meta-tag-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Meta Tag Generator</a>
              <a href="/robots-txt-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Robots.txt Generator</a>
              <a href="/placeholder-image" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Placeholder Image</a>
              <a href="/favicon-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Favicon Generator</a>
              <a href="/http-status" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTTP Status Codes</a>
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
  "name": "OG Image Preview",
  "description": "Preview how your links will appear when shared on Facebook, Twitter,\n            LinkedIn, Discord, and Slack. Enter your meta tag values and see\n            live previews instantly.",
  "url": "https://tools.loresync.dev/og-image-preview",
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
