import DiffViewer from "./components/DiffViewer";

export default function Home() {
  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-2">Side-by-Side Diff Viewer</h1>
        <p className="text-[var(--muted-fg)] mb-8">
          Compare two texts side by side with line-level and character-level
          highlighting. See additions, deletions, and changes instantly.
        </p>

        <DiffViewer />

        {/* AdSense placeholder */}
        <div className="mt-12 border border-dashed border-[var(--border)] rounded-lg p-6 text-center text-[var(--muted-fg)] text-sm">
          Ad Space
        </div>

        {/* SEO content */}
        <article className="mt-16 max-w-none text-[var(--muted-fg)] text-sm leading-relaxed space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            What Is a Side-by-Side Diff?
          </h2>
          <p>
            A side-by-side diff places the original and modified versions of a
            text in two parallel columns, making it easy to visually scan both
            simultaneously. Added lines appear highlighted in green on the right,
            removed lines in red on the left, and changed lines show
            character-level highlighting so you can pinpoint exactly what was
            altered within a line. This visual format is the default view in
            tools like GitHub&apos;s pull request review interface and most
            modern code editors.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            When to Use Side-by-Side vs Unified View
          </h2>
          <p>
            Side-by-side view is ideal when you want to read both versions
            simultaneously and compare context line-by-line. It is especially
            useful for code reviews, contract comparisons, and document editing
            where the original context matters as much as the changes.
            Unified (inline) view compresses everything into a single column
            with{" "}
            <code className="bg-[var(--muted)] px-1 rounded">+</code> and{" "}
            <code className="bg-[var(--muted)] px-1 rounded">-</code> prefixes,
            which is more compact and better suited for terminal output or
            patch files.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Character-Level Highlighting
          </h2>
          <p>
            This tool goes beyond simple line diffing by also highlighting the
            specific characters that changed within a modified line. When a line
            in the original and the modified text are paired together, the
            differing characters are highlighted with a darker background so you
            can immediately see whether a variable was renamed, a number was
            tweaked, or punctuation was corrected — without reading the entire
            line carefully. Character-level diffing uses the same Longest Common
            Subsequence algorithm applied at the character level.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Features of This Tool
          </h2>
          <p>
            This diff viewer runs entirely in your browser — no data is sent to
            any server. You can toggle between side-by-side and unified view,
            enable ignore-whitespace mode to skip formatting-only changes, and
            view a summary of added, removed, and changed line counts. Line
            numbers are shown for both sides to help you locate differences in
            large files quickly.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Side-by-Side Diff Viewer — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://text-diff.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Text Diff Tool
              </a>
              <a
                href="/json-formatter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
              </a>
              <a
                href="/markdown-preview"
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
            name: "Side-by-Side Diff Viewer",
            description:
              "Compare two texts side by side with line-level and character-level highlighting. See additions, deletions, and changes instantly.",
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
