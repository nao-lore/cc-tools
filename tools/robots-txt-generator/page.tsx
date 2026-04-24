import RobotsTxtGenerator from "./components/RobotsTxtGenerator";

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
            Robots.txt Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create, validate, and download robots.txt files for your website.
            Configure user-agent rules, sitemaps, crawl-delay, and export
            instantly.
          </p>
        </div>

        {/* Generator Tool */}
        <RobotsTxtGenerator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a robots.txt File?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A robots.txt file is a plain text file placed at the root of your
            website that tells web crawlers which pages or sections they are
            allowed or not allowed to access. It follows the Robots Exclusion
            Protocol and is the first file crawlers check before indexing your
            site. Every major search engine, including Google, Bing, and Yahoo,
            respects robots.txt directives.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            robots.txt Syntax Explained
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            A robots.txt file consists of one or more rule groups. Each group
            starts with a <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">User-agent</code> directive
            followed by <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">Allow</code> and <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">Disallow</code> rules.
            Here is a basic example:
          </p>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono text-gray-800 overflow-x-auto mb-4">
{`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/

Sitemap: https://example.com/sitemap.xml`}
          </pre>
          <p className="text-gray-700 leading-relaxed mb-4">
            The wildcard <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">*</code> matches
            all crawlers. You can create separate rule groups for specific bots
            like Googlebot or Bingbot. The <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">Sitemap</code> directive
            tells crawlers where to find your XML sitemap.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Generator
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Choose a preset</strong> or start from scratch. Presets
              cover common scenarios like allowing all bots, blocking all bots,
              blocking AI crawlers, or a standard SEO setup.
            </li>
            <li>
              <strong>Add user-agent groups</strong> for each bot or group of
              bots you want to configure. Select from common bots or enter a
              custom name.
            </li>
            <li>
              <strong>Define Allow and Disallow rules</strong> for each
              user-agent. Add as many path rules as needed.
            </li>
            <li>
              <strong>Set optional parameters</strong> like Crawl-delay and
              Sitemap URL.
            </li>
            <li>
              <strong>Review the live preview</strong> with syntax highlighting
              and check validation warnings.
            </li>
            <li>
              <strong>Copy or download</strong> the generated robots.txt file
              and place it at the root of your website.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Where to Place robots.txt
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The robots.txt file must be placed at the root of your domain. For
            example, if your site is <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">https://example.com</code>,
            the file should be accessible at{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">https://example.com/robots.txt</code>.
            It will not work if placed in a subdirectory. Each subdomain needs
            its own robots.txt file.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common robots.txt Mistakes
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Forgetting to include a wildcard (*) user-agent rule, leaving
              unmatched bots with no directives.
            </li>
            <li>
              Using <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">Disallow: /</code> for
              all bots, which blocks your entire site from search engines.
            </li>
            <li>
              Placing the file in the wrong directory or on a different
              subdomain.
            </li>
            <li>
              Not including a Sitemap directive, which helps crawlers discover
              all your pages.
            </li>
            <li>
              Using relative paths instead of paths starting with a forward
              slash.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Blocking AI Crawlers
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            With the rise of AI training crawlers, many site owners want to
            prevent their content from being used to train language models. Bots
            like GPTBot (OpenAI), Google-Extended (Google AI), CCBot
            (Common Crawl), and ChatGPT-User can be specifically blocked using
            dedicated user-agent rules. Use the &quot;Block AI Bots&quot; preset above
            for a quick configuration.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">robots-txt-generator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/meta-tag-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Meta Tag Generator</a>
              <a href="/og-image-preview" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">OG Image Preview</a>
              <a href="/http-status" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTTP Status</a>
              <a href="/json-formatter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
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
  "name": "Robots.txt Generator",
  "description": "Create, validate, and download robots.txt files for your website.\n            Configure user-agent rules, sitemaps, crawl-delay, and export\n            instantly.",
  "url": "https://tools.loresync.dev/robots-txt-generator",
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
