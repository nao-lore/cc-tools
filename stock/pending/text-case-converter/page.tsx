import TextCaseConverter from "./components/TextCaseConverter";

export default function Home() {
  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-2">Text Case Converter</h1>
        <p className="text-[var(--muted-fg)] mb-8">
          Convert text between camelCase, PascalCase, snake_case, kebab-case,
          SCREAMING_SNAKE_CASE, and Title Case instantly. Handles acronyms and
          mixed formats automatically.
        </p>

        <TextCaseConverter />

        {/* AdSense placeholder */}
        <div className="mt-12 border border-dashed border-[var(--border)] rounded-lg p-6 text-center text-[var(--muted-fg)] text-sm">
          Ad Space
        </div>

        {/* SEO content */}
        <article className="mt-16 max-w-none text-[var(--muted-fg)] text-sm leading-relaxed space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            What Is Text Case Conversion?
          </h2>
          <p>
            Different programming languages and frameworks enforce different
            naming conventions. JavaScript and TypeScript use camelCase for
            variables and PascalCase for classes. Python, SQL, and shell scripts
            prefer snake_case. CSS and HTML attributes use kebab-case.
            Environment variables are written in SCREAMING_SNAKE_CASE. This tool
            converts any input format into all six conventions simultaneously so
            you never have to manually reformat variable names again.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            How Acronym Handling Works
          </h2>
          <p>
            Acronyms like <code className="bg-[var(--muted)] px-1 rounded">XMLParser</code> or{" "}
            <code className="bg-[var(--muted)] px-1 rounded">HTMLToMarkdown</code> are correctly
            split into their component words before conversion. The tokenizer
            detects runs of uppercase letters followed by a transition to
            lowercase (e.g. <code className="bg-[var(--muted)] px-1 rounded">XMLParser</code> →{" "}
            <code className="bg-[var(--muted)] px-1 rounded">xml_parser</code>) and handles
            mixed-case boundaries. You can also paste snake_case, kebab-case, or
            plain English phrases — the input format is auto-detected.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Supported Input Formats
          </h2>
          <p>
            This converter accepts any of the following as input: camelCase,
            PascalCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE, Title
            Case, plain English sentences, or any mixture thereof. The tokenizer
            splits the input into words and converts them all to lowercase before
            regenerating each target format, ensuring consistent output
            regardless of what you paste in.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Common Use Cases
          </h2>
          <p>
            Renaming variables when porting code between languages, converting
            database column names to JavaScript object keys, generating CSS class
            names from component labels, creating environment variable names from
            config keys, and formatting API response field names for different
            consumers. All conversions run entirely in your browser — nothing is
            sent to a server.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Text Case Converter — Free online tool. No signup required.
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
                href="https://json-formatter-topaz-pi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
              </a>
              <a
                href="https://markdown-preview-pi-sandy.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Markdown Preview
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

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Text Case Converter",
            description:
              "Convert text between camelCase, PascalCase, snake_case, kebab-case, SCREAMING_SNAKE_CASE, and Title Case. Free online converter.",
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
