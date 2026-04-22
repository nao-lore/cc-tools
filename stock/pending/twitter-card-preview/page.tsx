import TwitterCardPreview from "./components/TwitterCardPreview";

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
            Twitter/X Card Preview & Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Preview exactly how your page will appear when shared on Twitter/X.
            Generate ready-to-paste meta tags for both card types.
          </p>
        </div>

        {/* Tool */}
        <TwitterCardPreview />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Are Twitter Cards?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Twitter Cards are rich media attachments that automatically appear
            when your URL is shared on Twitter/X. Instead of a plain link, your
            tweet shows a visual card with a title, description, and image —
            dramatically increasing click-through rates and engagement.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Card Types
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>summary</strong> — Shows a small square thumbnail on the
              left with title and description on the right. Good for articles
              and profile pages.
            </li>
            <li>
              <strong>summary_large_image</strong> — Shows a full-width image
              above the title and description. Best for blog posts, landing
              pages, and visual content. Recommended image size: 1200×628px.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Add Twitter Card Tags
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Fill in the fields</strong> above — title, description,
              image URL, and optional Twitter handles.
            </li>
            <li>
              <strong>Choose your card type</strong> — summary for compact cards,
              summary_large_image for a bigger visual impact.
            </li>
            <li>
              <strong>Copy the generated tags</strong> and paste them inside the{" "}
              <code>&lt;head&gt;</code> section of your HTML.
            </li>
            <li>
              <strong>Validate</strong> with the{" "}
              <a
                href="https://cards-dev.twitter.com/validator"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                Twitter Card Validator
              </a>{" "}
              after deploying.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Best Practices
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-1 mb-4 list-disc list-inside">
            <li>Keep titles under 70 characters to avoid truncation</li>
            <li>Descriptions should be 100–200 characters</li>
            <li>Use HTTPS URLs for images — HTTP images may be blocked</li>
            <li>Images should be at least 144×144px; 1200×628px for large image cards</li>
            <li>Maximum image file size is 5MB</li>
            <li>The <code>twitter:site</code> handle should be your brand account</li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Twitter/X Card Preview — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://og-image-preview.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                OG Image Preview
              </a>
              <a
                href="https://meta-tag-generator.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Meta Tag Generator
              </a>
              <a
                href="https://json-ld-generator.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON-LD Generator
              </a>
              <a
                href="https://sitemap-generator.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Sitemap Generator
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
