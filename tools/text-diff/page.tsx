import DiffTool from "./components/DiffTool";

export default function Home() {
  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-2">Text Diff Tool</h1>
        <p className="text-[var(--muted-fg)] mb-8">
          Compare two texts and instantly see the differences highlighted
          line-by-line.
        </p>

        <DiffTool />

        {/* AdSense placeholder */}
        <div className="mt-12 border border-dashed border-[var(--border)] rounded-lg p-6 text-center text-[var(--muted-fg)] text-sm">
          Ad Space
        </div>

        {/* SEO content */}
        <article className="mt-16 max-w-none text-[var(--muted-fg)] text-sm leading-relaxed space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            What Is a Text Diff?
          </h2>
          <p>
            A text diff (short for &quot;difference&quot;) is a comparison
            between two pieces of text that shows exactly what changed between
            them. Diff tools highlight added lines, removed lines, and unchanged
            lines so you can quickly understand modifications without reading
            both texts in full. The concept originates from the Unix{" "}
            <code className="bg-[var(--muted)] px-1 rounded">diff</code> utility
            created in the early 1970s, which became a foundational tool for
            software development and version control systems.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Common Use Cases
          </h2>
          <p>
            Text diff tools are essential across many workflows. Developers use
            them to review code changes before committing to version control
            systems like Git. Technical writers compare document revisions to
            track edits and ensure accuracy. System administrators diff
            configuration files to identify unintended changes after updates.
            Students compare essay drafts to see how their writing evolved.
            Legal professionals compare contract versions to spot altered
            clauses. Quality assurance teams diff API responses to detect
            regressions. Whether you are comparing two versions of a
            configuration file, reviewing a pull request, or checking how a
            document was edited, a diff tool saves time and reduces the chance of
            missing important changes.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            How Diff Algorithms Work
          </h2>
          <p>
            Most diff algorithms are based on the Longest Common Subsequence
            (LCS) problem. The algorithm finds the longest sequence of lines (or
            characters) that appear in both texts in the same order. Lines not
            part of this common subsequence are marked as either additions or
            deletions. The classic dynamic programming approach to LCS runs in
            O(n*m) time where n and m are the lengths of the two inputs. More
            advanced algorithms like Myers&apos; diff algorithm optimize this by
            focusing on the shortest edit script, finding the minimal number of
            insertions and deletions needed to transform one text into the other.
            This tool implements a standard LCS-based approach that works well
            for most comparison tasks, providing both line-level and
            character-level diffing to give you maximum visibility into what
            changed.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Features of This Tool
          </h2>
          <p>
            This online text diff tool runs entirely in your browser. No data is
            sent to any server, making it safe for comparing sensitive content.
            You can choose between inline diff mode, which shows changes in a
            unified view with character-level highlighting, and side-by-side
            mode, which aligns the original and modified text in two columns for
            easy visual scanning. Additional options include ignoring whitespace
            differences and case differences, which are useful when you want to
            focus on meaningful content changes rather than formatting. The tool
            provides statistics showing the number of lines added, removed, and
            unchanged, giving you a quick summary of the scope of changes.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Text Diff Tool — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/word-counter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Word Counter</a>
              <a href="/json-formatter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
              <a href="/markdown-preview" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Markdown Preview</a>
              <a href="/mdtable" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Markdown Table</a>
              <a href="/sql-formatter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">SQL Formatter</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
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
            name: "Text Diff Tool",
            url: "https://text-diff.nao-lore.dev",
            description:
              "Free online text diff tool. Compare two texts and highlight differences with line-level and character-level diffing.",
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
