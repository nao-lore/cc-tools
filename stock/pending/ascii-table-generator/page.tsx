import AsciiTableGenerator from "./components/AsciiTableGenerator";

export default function Home() {
  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-2">ASCII Table Generator</h1>
        <p className="text-[var(--muted-fg)] mb-8">
          Convert CSV data or use the grid editor to build ASCII art tables.
          Choose from classic, Unicode single-line, double-line, Markdown, or
          simple border styles with per-column alignment control.
        </p>

        <AsciiTableGenerator />

        {/* AdSense placeholder */}
        <div className="mt-12 border border-dashed border-[var(--border)] rounded-lg p-6 text-center text-[var(--muted-fg)] text-sm">
          Ad Space
        </div>

        {/* SEO content */}
        <article className="mt-16 max-w-none text-[var(--muted-fg)] text-sm leading-relaxed space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            What Is an ASCII Table?
          </h2>
          <p>
            An ASCII table uses plain text characters to draw a formatted table
            with visible borders and aligned columns. They are widely used in
            terminal output, README files, documentation, commit messages, and
            any context where rich formatting is not available. Tools like
            PostgreSQL, SQLite, and many CLI utilities output query results as
            ASCII tables by default.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Border Styles Explained
          </h2>
          <p>
            The <strong>Classic</strong> style uses{" "}
            <code className="bg-[var(--muted)] px-1 rounded">+</code>,{" "}
            <code className="bg-[var(--muted)] px-1 rounded">-</code>, and{" "}
            <code className="bg-[var(--muted)] px-1 rounded">|</code> characters
            for maximum compatibility with any font or terminal.{" "}
            <strong>Single Line</strong> and <strong>Double Line</strong> use
            Unicode box-drawing characters for a cleaner look in modern
            terminals and editors. <strong>Markdown</strong> produces a GitHub
            Flavored Markdown table with alignment hints in the separator row.{" "}
            <strong>Simple</strong> outputs space-separated columns with a
            dashed separator — ideal for monospace documentation.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            CSV Input Format
          </h2>
          <p>
            Paste any comma-separated data with the first row as headers. Quoted
            fields containing commas or newlines are handled correctly. You can
            copy data directly from a spreadsheet, database query result, or any
            CSV file. The tool auto-adjusts column widths to fit the longest
            value in each column.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Common Use Cases
          </h2>
          <p>
            Formatting database query results for documentation, generating
            comparison tables for README files, creating structured output for
            CLI tools, building aligned data displays for terminal dashboards,
            and producing Markdown tables for GitHub issues and pull requests.
            All processing runs entirely in your browser — no data is sent to a
            server.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            ASCII Table Generator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://csv-viewer.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                CSV Viewer
              </a>
              <a
                href="https://diff-viewer.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Diff Viewer
              </a>
              <a
                href="/json-formatter"
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
            name: "ASCII Table Generator",
            description:
              "Convert CSV data into ASCII art tables with multiple border styles and per-column alignment. Free online tool.",
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
