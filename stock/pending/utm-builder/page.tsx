import UtmBuilder from "./components/UtmBuilder";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Header */}
      <div className="py-10 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          UTM Parameter Builder
        </h1>
        <p className="opacity-70 max-w-xl mx-auto">
          Build UTM-tagged URLs for campaign tracking, or paste an existing URL
          to extract its parameters. URL encoding is handled automatically.
        </p>
      </div>

      {/* Tool */}
      <div className="px-4 pb-8">
        <UtmBuilder />
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
            <h2 className="text-lg font-bold mb-2">What are UTM parameters?</h2>
            <p>
              UTM parameters are tags appended to a URL that tell analytics
              platforms like Google Analytics where a visitor came from and what
              campaign drove the click. The five standard parameters are
              utm_source, utm_medium, utm_campaign, utm_term, and utm_content.
              They let marketers precisely attribute traffic without modifying
              server-side code.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">How to use this tool</h2>
            <p>
              Switch to <strong>Build URL</strong> mode and enter the base URL
              of your landing page, then fill in the three required fields —
              source, medium, and campaign. The optional utm_term and
              utm_content fields are useful for paid search keywords and A/B
              variant tracking. Click <em>Generate URL</em> to get a
              fully-encoded, ready-to-use link, copy it, and optionally scan
              the QR code to test on mobile. Use <strong>Parse URL</strong>{" "}
              mode to decode any existing UTM link into a clean parameter table.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">
              utm_source vs utm_medium vs utm_campaign
            </h2>
            <p>
              <strong>utm_source</strong> identifies the referrer — for example
              google, facebook, or newsletter. <strong>utm_medium</strong>{" "}
              describes the channel type — cpc, organic, email, or social.{" "}
              <strong>utm_campaign</strong> is the specific campaign name you
              define, such as spring_sale_2025 or product_launch. Together they
              give you a three-level hierarchy: where, how, and what.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">Best practices</h2>
            <p>
              Keep parameter values lowercase and use underscores instead of
              spaces to avoid case-sensitivity issues in reports. Be consistent —
              "Email" and "email" appear as two separate sources in Google
              Analytics. Avoid including personally identifiable information in
              UTM values. Always test your tagged URL in a browser before
              distributing it in a campaign.
            </p>
          </section>
        </article>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            UTM Parameter Builder — Free online campaign URL tool. No signup
            required.
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
                href="https://sitemap-generator-phi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Sitemap Generator
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
    </main>
  );
}
