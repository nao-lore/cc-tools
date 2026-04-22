import TextLineSorter from "./components/TextLineSorter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* AdSense slot - top banner */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Text Line Sorter &amp; Deduplicator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sort lines alphabetically, numerically, or randomly. Remove duplicates,
            trim whitespace, and clean up empty lines — all in your browser, instantly.
          </p>
        </div>

        {/* Tool */}
        <TextLineSorter />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a Line Sorter?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A line sorter arranges each line of text into a specified order — alphabetical,
            reverse alphabetical, numeric, or random. It is useful for sorting lists of names,
            domain names, keywords, file paths, or any structured text that comes one item per line.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Paste your text into the input box, one item per line. Choose a sort mode — A→Z,
            Z→A, Numeric, or Random Shuffle — then toggle any cleanup options you need. The
            sorted result appears instantly in the output box with a one-click copy button.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sort Modes Explained
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>A→Z</strong> — Standard lexicographic ascending sort. Toggle case-insensitive
              to treat uppercase and lowercase as equal.
            </li>
            <li>
              <strong>Z→A</strong> — Reverse lexicographic sort, useful for finding the last
              entry in a list or reversing alphabetical order.
            </li>
            <li>
              <strong>Numeric</strong> — Sorts lines by their leading numeric value. Lines without
              numbers sort after numbered lines.
            </li>
            <li>
              <strong>Random Shuffle</strong> — Randomises the order of lines. Useful for
              sampling, randomised lists, or shuffling quiz questions.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Use Cases
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Deduplicate a list of email addresses or usernames before importing into a CRM.
            </li>
            <li>
              Sort a keyword list alphabetically before adding it to an SEO spreadsheet.
            </li>
            <li>
              Clean up a pasted list of domain names by trimming whitespace and removing blanks.
            </li>
            <li>
              Shuffle a list of names for a random drawing or team assignment.
            </li>
            <li>
              Sort numbered lines (e.g. log entries prefixed with a line number) in numeric order.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Text Line Sorter &amp; Deduplicator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://diff-viewer-jade.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Diff Viewer
              </a>
              <a
                href="https://csv-viewer-puce.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                CSV Viewer
              </a>
              <a
                href="https://json-formatter-topaz-pi.vercel.app"
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

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    </div>
  );
}
