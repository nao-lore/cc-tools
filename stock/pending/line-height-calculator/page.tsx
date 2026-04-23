import LineHeightCalculator from "./components/LineHeightCalculator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">line-height-calculator</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Line Height Calculator
          </h1>
          <p className="text-muted text-lg">
            Find the optimal <code className="text-accent font-mono text-base">line-height</code> for
            your font size, line width, and weight. Get unitless, px, rem, and em values instantly.
          </p>
        </div>

        <LineHeightCalculator />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            Why Line Height Matters
          </h2>
          <p>
            Line height (leading) controls the vertical space between lines of text. Too tight and
            lines blur together; too loose and the eye loses its place returning to the start of
            the next line. The optimal value depends on three factors: font size, line width
            (measure), and font weight.
          </p>

          <h3 className="text-lg font-semibold text-foreground">The Formula</h3>
          <p>
            The calculator starts from a base of{" "}
            <code className="text-accent font-mono text-sm">1.5</code> — the value recommended by
            the Web Content Accessibility Guidelines (WCAG 2.1 SC 1.4.12). It then applies three
            adjustments:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              <strong className="text-foreground">Font size:</strong> Larger type already looks
              more spaced, so the multiplier decreases slightly (e.g. display headings at 64px
              often look best around 1.1–1.2).
            </li>
            <li>
              <strong className="text-foreground">Measure (line width):</strong> Wider columns
              require less leading because the reader has more horizontal momentum. Narrower
              columns benefit from extra space to guide the eye back.
            </li>
            <li>
              <strong className="text-foreground">Font weight:</strong> Heavy weights create
              denser texture, so bold and black faces benefit from slightly tighter leading.
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-foreground">Unitless vs px vs rem</h3>
          <p>
            Always prefer the <strong className="text-foreground">unitless</strong> value in
            production. A unitless line-height multiplies the element's own font size, so child
            elements that inherit it scale correctly. Using{" "}
            <code className="text-accent font-mono text-sm">px</code> or{" "}
            <code className="text-accent font-mono text-sm">em</code> fixes the computed value and
            breaks inheritance for nested elements with different font sizes.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Ideal Measure (Line Width)</h3>
          <p>
            Robert Bringhurst's <em>The Elements of Typographic Style</em> recommends 45–75
            characters per line for body text, with 66 as the ideal. This translates to roughly
            500–700px at 16px body size. Headings can be narrower; captions and footnotes can
            be wider.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Line Height Calculator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://font-pair-preview.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Font Pair Preview</a>
              <a href="https://css-filter-mauve.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
              <a href="https://color-contrast-checker.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Contrast</a>
              <a href="https://css-text-shadow.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Text Shadow</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
