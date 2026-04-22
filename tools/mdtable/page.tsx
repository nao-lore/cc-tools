import TableEditor from "./components/TableEditor";

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
            Markdown Table Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create Markdown tables with a visual spreadsheet editor. Edit cells,
            set column alignment, import CSV, and copy the output instantly.
          </p>
        </div>

        {/* Table Editor Tool */}
        <TableEditor />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a Markdown Table?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Markdown is a lightweight markup language used to format plain text.
            It is widely supported across platforms like GitHub, GitLab, Notion,
            Reddit, Stack Overflow, and many static site generators. Markdown
            tables let you present structured data in rows and columns using a
            simple text-based syntax that is easy to read even without rendering.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Markdown Table Syntax
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            A Markdown table consists of three parts: the header row, the
            separator row, and the data rows. The separator row uses dashes and
            colons to define column alignment. Here is an example:
          </p>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono text-gray-800 overflow-x-auto mb-4">
{`| Name    | Role       | Status |
|:--------|:----------:|-------:|
| Alice   | Developer  | Active |
| Bob     | Designer   | Active |`}
          </pre>
          <p className="text-gray-700 leading-relaxed mb-4">
            In the separator row, a colon on the left (<code className="text-sm bg-gray-100 px-1 py-0.5 rounded">:---</code>) means
            left-aligned, colons on both sides (<code className="text-sm bg-gray-100 px-1 py-0.5 rounded">:---:</code>) means
            center-aligned, and a colon on the right (<code className="text-sm bg-gray-100 px-1 py-0.5 rounded">---:</code>) means
            right-aligned. Pipes (<code className="text-sm bg-gray-100 px-1 py-0.5 rounded">|</code>) separate each column.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Markdown Table Generator
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Edit cells</strong> directly in the spreadsheet grid
              above. Click any cell and start typing.
            </li>
            <li>
              <strong>Add or remove rows and columns</strong> using the toolbar
              buttons.
            </li>
            <li>
              <strong>Set column alignment</strong> by clicking the alignment
              button below each header. It cycles through left, center, and
              right.
            </li>
            <li>
              <strong>Import CSV data</strong> by clicking the Import CSV
              button and pasting comma-separated or tab-separated text.
            </li>
            <li>
              <strong>Copy the Markdown output</strong> with one click. Paste
              it into your README, documentation, or any Markdown-supported
              editor.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Where Can You Use Markdown Tables?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Markdown tables work anywhere Markdown is supported. Common use
            cases include GitHub README files, pull request descriptions, wiki
            pages, Jupyter notebooks, documentation sites built with tools like
            Docusaurus or MkDocs, blog posts written in Markdown, and note-taking
            apps like Obsidian and Notion. This generator produces
            standard-compliant Markdown that renders correctly across all these
            platforms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tips for Better Markdown Tables
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Keep cell content concise. Long text in table cells can be hard to
              read in raw Markdown.
            </li>
            <li>
              Use column alignment to improve readability. Numbers look better
              right-aligned, while text is typically left-aligned.
            </li>
            <li>
              Avoid special Markdown characters inside cells. If you need a pipe
              character, escape it with a backslash (<code className="text-sm bg-gray-100 px-1 py-0.5 rounded">\|</code>).
            </li>
            <li>
              For large datasets, consider importing from CSV rather than typing
              each cell manually.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            mdtable — Free Markdown Table Generator. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://text-diff-mu.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Text Diff</a>
              <a href="https://json-to-csv-rho.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON to CSV</a>
              <a href="https://html-to-markdown-kappa.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTML to Markdown</a>
              <a href="https://markdown-preview-pi-sandy.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Markdown Preview</a>
              <a href="https://word-counter-seven-khaki.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Word Counter</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools →</a>
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
