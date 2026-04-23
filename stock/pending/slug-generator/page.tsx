import SlugGenerator from "./components/SlugGenerator";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Header */}
      <div className="py-10 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          URL Slug Generator
        </h1>
        <p className="opacity-70 max-w-xl mx-auto">
          Convert article titles into clean, SEO-friendly URL slugs. Handles
          accents, special characters, CJK, and bulk conversion.
        </p>
      </div>

      {/* Tool */}
      <div className="px-4 pb-8">
        <SlugGenerator />
      </div>

      {/* AdSense placeholder */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div
          className="rounded-lg border border-dashed p-8 text-center text-sm opacity-30"
          style={{ borderColor: "var(--border)" }}
        >
          Ad space
        </div>
      </div>

      {/* SEO content */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <article
          className="rounded-xl p-6 sm:p-8 border space-y-6 text-sm leading-relaxed opacity-80"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <section>
            <h2 className="text-lg font-bold mb-2">What is a URL slug?</h2>
            <p>
              A URL slug is the human-readable part of a URL that identifies a
              specific page. For example, in{" "}
              <code className="font-mono text-xs">
                example.com/blog/seo-best-practices
              </code>
              , the slug is <code className="font-mono text-xs">seo-best-practices</code>.
              Good slugs are lowercase, contain only letters, numbers, and
              hyphens, and describe the page content concisely.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">How to use this tool</h2>
            <p>
              Type or paste a title in the input field and the slug is generated
              instantly. Use the separator option to switch between hyphens
              (most common), underscores, or dots. Toggle{" "}
              <strong>Transliterate accents</strong> to convert characters like{" "}
              <em>é</em>, <em>ü</em>, or <em>ñ</em> to their ASCII equivalents.
              Enable <strong>Remove stop words</strong> to strip common English
              words like &ldquo;the&rdquo;, &ldquo;and&rdquo;, and
              &ldquo;of&rdquo; for a more compact slug. For bulk generation,
              paste multiple titles — one per line — and get a slug for each.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">SEO slug best practices</h2>
            <p>
              Keep slugs short and descriptive — 3 to 5 words is a common
              target. Use hyphens as word separators; Google treats hyphens as
              word boundaries while underscores do not split words in search
              results. Avoid dates and version numbers unless they are essential
              to the content. Remove filler words to improve readability and
              reduce slug length. Once a slug is published and indexed, avoid
              changing it to prevent broken links and loss of link equity.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">Handling non-ASCII characters</h2>
            <p>
              Accented characters (é → e, ü → u), CJK characters, and symbols
              are all handled automatically. Accents are stripped via Unicode
              normalization. CJK characters are removed by default since they
              require percent-encoding in URLs, which reduces readability. If
              you need CJK in slugs, consider a dedicated transliteration
              library on your server side.
            </p>
          </section>
        </article>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            URL Slug Generator — Free online SEO tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://keyword-density-pi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Keyword Density
              </a>
              <a
                href="https://utm-builder-tau.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                UTM Builder
              </a>
              <a
                href="https://canonical-tag-checker.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Canonical Tag Checker
              </a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600"
            >
              53+ Free Tools →
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
