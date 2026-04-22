import CodeSnippetFormatter from "./components/CodeSnippetFormatter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Code Snippet Formatter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste code, choose a language and theme, then copy the styled HTML
            to share beautiful syntax-highlighted snippets anywhere.
          </p>
        </div>

        {/* Tool */}
        <CodeSnippetFormatter />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto space-y-6 text-gray-700 leading-relaxed text-sm">
          <h2 className="text-2xl font-bold text-gray-900">
            What Is a Code Snippet Formatter?
          </h2>
          <p>
            A code snippet formatter takes raw source code and applies
            syntax-highlighting — coloring keywords, strings, comments, and
            numbers — so the snippet is easy to read at a glance. The output
            is copy-ready styled HTML that renders correctly in blog posts,
            emails, slide decks, documentation sites, and anywhere else that
            accepts HTML markup.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">
            Supported Languages
          </h2>
          <p>
            This tool covers 14 popular languages out of the box: JavaScript,
            TypeScript, Python, Rust, Go, SQL, HTML, CSS, JSON, Bash, Java,
            C++, Ruby, and PHP. Each language has its own keyword set so that
            only the words that actually matter get highlighted.
          </p>

          <h2 className="text-2xl font-bold text-gray-900">
            Color Scheme
          </h2>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <strong>Keywords</strong> — Blue. Reserved words like{" "}
              <code className="bg-gray-100 px-1 rounded">const</code>,{" "}
              <code className="bg-gray-100 px-1 rounded">def</code>,{" "}
              <code className="bg-gray-100 px-1 rounded">SELECT</code>.
            </li>
            <li>
              <strong>Strings</strong> — Green. Single-quoted, double-quoted, and
              template literals.
            </li>
            <li>
              <strong>Comments</strong> — Gray. Line comments (
              <code className="bg-gray-100 px-1 rounded">//</code>,{" "}
              <code className="bg-gray-100 px-1 rounded">#</code>,{" "}
              <code className="bg-gray-100 px-1 rounded">--</code>).
            </li>
            <li>
              <strong>Numbers</strong> — Orange. Integer and floating-point
              literals.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900">
            How to Use This Tool
          </h2>
          <ol className="space-y-2 list-decimal list-inside">
            <li>Select the language from the dropdown.</li>
            <li>Paste your code into the left textarea.</li>
            <li>
              Choose <strong>Dark</strong> or <strong>Light</strong> theme,
              adjust font size and tab size, and toggle line numbers.
            </li>
            <li>
              Click <strong>Copy HTML</strong> — the full{" "}
              <code className="bg-gray-100 px-1 rounded font-mono text-xs">
                &lt;pre&gt;
              </code>{" "}
              block is copied to your clipboard.
            </li>
            <li>Paste into your blog, email, or documentation.</li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900">
            Tips for Sharing Code
          </h2>
          <ul className="space-y-2 list-disc list-inside">
            <li>
              Keep snippets short — aim for the fewest lines that demonstrate
              the concept. Readers skim long code blocks.
            </li>
            <li>
              Use line numbers when referring to specific lines in surrounding
              text (&ldquo;see line 5&rdquo;).
            </li>
            <li>
              Choose Dark theme for developer audiences, Light theme for
              business or print contexts.
            </li>
            <li>
              Larger font size (16–18 px) improves readability in slide
              presentations.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Code Snippet Formatter — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://changelog-formatter.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Changelog Formatter
              </a>
              <a
                href="https://text-diff.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Diff Viewer
              </a>
              <a
                href="https://crontab-validator.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Crontab Validator
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
            name: "Code Snippet Formatter",
            description:
              "Format and syntax-highlight code for sharing. Choose language, theme, add line numbers. Copy styled HTML. Free code formatter.",
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
    </div>
  );
}
