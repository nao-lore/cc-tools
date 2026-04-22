import SitemapGenerator from "./components/SitemapGenerator";

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
            Sitemap XML Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate a valid sitemap.xml from a list of URLs. Set lastmod,
            changefreq, and priority per URL or apply bulk defaults. Preview,
            copy, and download instantly.
          </p>
        </div>

        {/* Tool */}
        <SitemapGenerator />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a Sitemap?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A sitemap is an XML file that lists all the important URLs of your
            website. Search engines like Google and Bing read it to discover and
            index your pages more efficiently. Submitting a sitemap through
            Google Search Console helps ensure your content is crawled quickly
            and reliably.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sitemap XML Format
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Each URL entry in a sitemap is wrapped in a{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">&lt;url&gt;</code>{" "}
            element with four optional child tags:
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>loc</strong> — The absolute URL of the page (required).
            </li>
            <li>
              <strong>lastmod</strong> — Date the page was last modified (YYYY-MM-DD).
            </li>
            <li>
              <strong>changefreq</strong> — How often the page changes (always, hourly,
              daily, weekly, monthly, yearly, never).
            </li>
            <li>
              <strong>priority</strong> — Relative importance from 0.0 to 1.0 (default
              is 0.5).
            </li>
          </ul>

          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono text-gray-800 overflow-x-auto mb-4">
{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Generator
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Paste URLs</strong> into the textarea (one per line) or add
              them one by one using the row editor.
            </li>
            <li>
              <strong>Set per-URL options</strong> — lastmod date, changefreq, and
              priority — or apply bulk defaults to all entries at once.
            </li>
            <li>
              <strong>Review the XML preview</strong> with syntax highlighting below
              the URL list.
            </li>
            <li>
              <strong>Copy or download</strong> the file and save it as{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">sitemap.xml</code>{" "}
              at the root of your domain.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sitemap Best Practices
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Use canonical URLs</strong> — always include the protocol (https://)
              and use the same domain format throughout.
            </li>
            <li>
              <strong>Keep it under 50,000 URLs.</strong> Larger sites should split into
              multiple sitemaps referenced by a sitemap index file.
            </li>
            <li>
              <strong>Update lastmod accurately.</strong> Do not set it to today if the
              page has not changed — search engines may penalise misleading dates.
            </li>
            <li>
              <strong>Submit to Search Console.</strong> After uploading sitemap.xml to
              your server root, submit the URL in Google Search Console and Bing
              Webmaster Tools.
            </li>
            <li>
              <strong>Reference in robots.txt.</strong> Add{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">Sitemap: https://example.com/sitemap.xml</code>{" "}
              to your robots.txt so crawlers find it automatically.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            sitemap-generator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://robots-txt-generator.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Robots.txt Generator
              </a>
              <a
                href="https://meta-tag-generator-indol.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Meta Tag Generator
              </a>
              <a
                href="https://htaccess-generator.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                .htaccess Generator
              </a>
              <a
                href="https://json-formatter-topaz-pi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
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
