import HreflangGenerator from "./components/HreflangGenerator";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Header */}
      <div className="py-10 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Hreflang Tag Generator
        </h1>
        <p className="opacity-70 max-w-xl mx-auto">
          Generate hreflang link tags for multilingual and multi-regional
          websites. Auto x-default, self-referencing validation, and instant
          copy.
        </p>
      </div>

      {/* Tool */}
      <div className="px-4 pb-8">
        <HreflangGenerator />
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
            <h2 className="text-lg font-bold mb-2">What is hreflang?</h2>
            <p>
              Hreflang is an HTML attribute used in{" "}
              <code className="font-mono text-xs">&lt;link&gt;</code> tags to
              tell search engines which language and region a page targets. When
              you run a multilingual or multi-regional website, hreflang signals
              help Google serve the correct version to each user — for example,
              showing the French page to users in France and the English page to
              users in the United States. Without it, Google may pick the wrong
              version or consolidate pages as duplicates.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">How to use this tool</h2>
            <p>
              Add one row per language or region variant of your page. Select
              the{" "}
              <strong>
                BCP 47 language tag
              </strong>{" "}
              (e.g. <code className="font-mono text-xs">en-US</code>,{" "}
              <code className="font-mono text-xs">pt-BR</code>) and enter the
              full canonical URL for that variant. Use the radio button to mark
              one URL as <strong>x-default</strong> — this is the fallback
              shown to users whose locale does not match any specific variant.
              The tool validates your setup and generates ready-to-paste{" "}
              <code className="font-mono text-xs">&lt;link&gt;</code> tags.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">
              Self-referencing requirement
            </h2>
            <p>
              Google requires every page in your hreflang set to include the
              full list of hreflang tags — including a tag pointing to itself.
              This means you cannot just add the tags to one page; you must add
              the same complete set to <em>every</em> language variant. This
              tool generates the canonical set; copy and paste it into the{" "}
              <code className="font-mono text-xs">&lt;head&gt;</code> of each
              page in your set.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">
              x-default explained
            </h2>
            <p>
              The <code className="font-mono text-xs">x-default</code> tag
              designates a catch-all URL for users whose browser language does
              not match any of your hreflang values. It is also commonly used
              for a language-selection landing page. Google officially supports
              x-default and uses it when no other hreflang tag is a better
              match. Always set x-default to the most universal version of your
              page, typically English or a locale selector.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">Best practices</h2>
            <p>
              Use fully qualified, absolute URLs — never relative paths. Ensure
              all URLs use HTTPS. Keep hreflang values lowercase and follow BCP
              47 format (language code optionally followed by a region code
              separated by a hyphen, e.g.{" "}
              <code className="font-mono text-xs">zh-Hant</code> for
              Traditional Chinese). Avoid duplicating the same hreflang value
              across two different URLs, as this creates an ambiguous signal.
              Verify your implementation with Google Search Console after
              deployment.
            </p>
          </section>
        </article>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Hreflang Tag Generator — Free online multilingual SEO tool. No
            signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://utm-builder-eight.vercel.app"
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
              <a
                href="https://robots-txt-parser-nu.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Robots.txt Parser
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
