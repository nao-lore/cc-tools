import MarkdownLint from "./components/MarkdownLint";

export default function Home() {
  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-2">Markdown Linter</h1>
        <p className="text-[var(--muted-fg)] mb-8">
          Paste your Markdown and instantly check for heading structure issues,
          bare URLs, trailing whitespace, long lines, and more. Toggle rules
          on or off to fit your style guide.
        </p>

        <MarkdownLint />

        {/* AdSense placeholder */}
        <div className="mt-12 border border-dashed border-[var(--border)] rounded-lg p-6 text-center text-[var(--muted-fg)] text-sm">
          Ad Space
        </div>

        {/* SEO content */}
        <article className="mt-16 max-w-none text-[var(--muted-fg)] text-sm leading-relaxed space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            What Does This Linter Check?
          </h2>
          <p>
            The Markdown Linter runs nine rules against your document. Heading
            level checks catch both missing H1 and skipped increments (for
            example jumping from H1 directly to H3). Bare URL detection flags
            plain links that should use <code className="bg-[var(--muted)] px-1 rounded">[text](url)</code> syntax for
            better accessibility. Trailing whitespace and multiple consecutive
            blank lines are flagged as errors because they can cause unexpected
            rendering in some parsers. Long lines over 120 characters and
            missing blank lines around headings are reported as warnings.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Errors vs Warnings
          </h2>
          <p>
            Issues are classified into two severities. <strong>Errors</strong> are
            problems that commonly break rendering or violate widely accepted
            Markdown standards — skipped heading levels, multiple consecutive
            blank lines, and missing trailing newlines. <strong>Warnings</strong> are
            style recommendations that improve readability and consistency
            without necessarily breaking output, such as bare URLs, trailing
            whitespace, long lines, and missing blank lines around headings.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Toggling Rules
          </h2>
          <p>
            Each rule can be toggled independently. This is useful when your
            project has its own style guide that explicitly allows certain
            patterns — for example, some teams permit bare URLs in internal
            documents, or use a line length limit different from 120 characters.
            Disabled rules are simply skipped during linting and do not appear
            in results.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Common Markdown Pitfalls
          </h2>
          <p>
            The most frequent issues in real-world Markdown documents are
            inconsistent list markers (mixing <code className="bg-[var(--muted)] px-1 rounded">-</code> and{" "}
            <code className="bg-[var(--muted)] px-1 rounded">*</code> in the same document), skipped heading levels that
            confuse screen readers and document outlines, and bare URLs that
            render as plain text in strict parsers. Running a linter before
            committing documentation catches these issues early and keeps your
            Markdown consistent across contributors.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Markdown Linter — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://diff-viewer.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Diff Viewer
              </a>
              <a
                href="https://readme-generator.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                README Generator
              </a>
              <a
                href="https://link-checker.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Link Checker
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

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Markdown Linter",
            description:
              "Lint Markdown for style issues. Check heading levels, bare URLs, trailing spaces, line length. Fix suggestions included. Free tool.",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />
    </>
  );
}
