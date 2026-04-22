import AsciiArtGenerator from "./components/AsciiArtGenerator";

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
            ASCII Art Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert text into large ASCII art banners, wrap text in boxes, and
            browse pre-made decorations. Copy the output instantly.
          </p>
        </div>

        {/* ASCII Art Generator Tool */}
        <AsciiArtGenerator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is ASCII Art?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            ASCII art is a graphic design technique that uses printable characters
            from the ASCII standard to create visual images and text banners.
            Originally used in early computing when graphical displays were
            limited, ASCII art remains popular today for README files, code
            comments, terminal decorations, and creative expression in plain text
            environments.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This ASCII Art Generator
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Type your text</strong> in the input field above. The
              generator converts each character into a large block letter.
            </li>
            <li>
              <strong>Choose a character style</strong> to change the look of
              your banner. Options include #, *, @, and more.
            </li>
            <li>
              <strong>Use the box generator</strong> to wrap any text in an
              ASCII box with single-line, double-line, or rounded borders.
            </li>
            <li>
              <strong>Browse pre-made decorations</strong> including dividers,
              arrows, faces, and borders for quick use.
            </li>
            <li>
              <strong>Copy the output</strong> with one click and paste it
              anywhere plain text is supported.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Where Can You Use ASCII Art?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            ASCII art works in any environment that supports monospaced text.
            Common use cases include GitHub README headers, code comments and
            documentation, terminal splash screens, email signatures, chat
            messages, forum posts, and creative coding projects. The output from
            this generator uses standard characters that display correctly across
            all platforms and text editors.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tips for Great ASCII Art
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Use a monospaced font when displaying ASCII art. Proportional
              fonts will misalign the characters.
            </li>
            <li>
              Keep text short for banner conversion. Long strings may wrap
              awkwardly in narrow displays.
            </li>
            <li>
              Try different character styles to find the density and look that
              works best for your use case.
            </li>
            <li>
              ASCII boxes are great for highlighting important information in
              plain text documents.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">ascii-art — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://dummy-text-murex.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Dummy Text</a>
              <a href="https://markdown-preview-pi-sandy.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Markdown Preview</a>
              <a href="https://word-counter-seven-khaki.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Word Counter</a>
              <a href="https://text-diff-mu.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Text Diff</a>
              <a href="https://qr-generator-ten-wheat.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">QR Generator</a>
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
