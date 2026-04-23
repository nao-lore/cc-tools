import StringEscape from "./components/StringEscape";

export default function Home() {
  return (
    <>
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-2">String Escape &amp; Unescape Tool</h1>
        <p className="text-[var(--muted-fg)] mb-8">
          Escape and unescape strings for JSON, JavaScript, SQL, regex, HTML, and CSV.
          Changed characters are highlighted in the output.
        </p>

        <StringEscape />

        {/* AdSense placeholder */}
        <div className="mt-12 border border-dashed border-[var(--border)] rounded-lg p-6 text-center text-[var(--muted-fg)] text-sm">
          Ad Space
        </div>

        {/* SEO content */}
        <article className="mt-16 max-w-none text-[var(--muted-fg)] text-sm leading-relaxed space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            What Is String Escaping?
          </h2>
          <p>
            String escaping is the process of adding a backslash or special sequence before
            characters that have a reserved meaning in a given context. For example, a double
            quote inside a JSON string must be written as <code className="bg-[var(--muted)] px-1 rounded">\&quot;</code> so the
            parser does not treat it as the end of the string. Without proper escaping, code
            can break, SQL queries can fail, or — in worst cases — security vulnerabilities
            like SQL injection or XSS can be introduced.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Format-Specific Rules
          </h2>
          <p>
            Each format has its own set of characters that require escaping.
            <strong> JSON</strong> requires escaping of double quotes, backslashes, and control
            characters (newline, tab, carriage return, etc.).
            <strong> JavaScript</strong> is similar to JSON but also handles single quotes and
            template literal backticks.
            <strong> SQL</strong> escapes single quotes by doubling them and optionally escapes
            backslashes.
            <strong> Regex</strong> requires escaping of metacharacters such as{" "}
            <code className="bg-[var(--muted)] px-1 rounded">. * + ? ^ $ {"{"} {"}"} [ ] ( ) | \</code>.
            <strong> HTML</strong> converts reserved characters to named entities like{" "}
            <code className="bg-[var(--muted)] px-1 rounded">&amp;amp;</code>,{" "}
            <code className="bg-[var(--muted)] px-1 rounded">&amp;lt;</code>, and{" "}
            <code className="bg-[var(--muted)] px-1 rounded">&amp;gt;</code>.
            <strong> CSV</strong> wraps fields containing commas or quotes in double quotes and
            doubles any embedded double quotes.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Highlighted Output
          </h2>
          <p>
            This tool highlights every character that was changed during escaping or unescaping
            so you can instantly see which parts of the string were affected. This is especially
            useful when debugging complex strings with multiple escape sequences scattered
            throughout the text.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Privacy
          </h2>
          <p>
            All processing happens entirely in your browser. No data is sent to any server.
            You can safely paste sensitive strings such as API keys, passwords, or private
            content and they will never leave your machine.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            String Escape &amp; Unescape Tool — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="//diff-viewer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Diff Viewer
              </a>
              <a
                href="//json-path"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Path
              </a>
              <a
                href="//regex-cheatsheet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Regex Cheatsheet
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
            name: "String Escape & Unescape Tool",
            description:
              "Escape and unescape strings for JSON, JavaScript, SQL, regex, HTML, and CSV. Highlight changed characters. Free online tool.",
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
