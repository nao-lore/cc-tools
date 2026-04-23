import CssSpecificity from "./components/CssSpecificity";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">css-specificity</span>
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
            CSS Specificity Calculator
          </h1>
          <p className="text-muted text-lg">
            Calculate and compare CSS selector specificity. Visualize which selector wins when styles conflict.
            Enter multiple selectors to see them ranked side by side.
          </p>
        </div>

        <CssSpecificity />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            Understanding CSS Specificity
          </h2>
          <p>
            CSS specificity determines which style rule is applied when multiple rules target the same element.
            It is represented as a three-part score <code className="text-accent font-mono text-sm">(a, b, c)</code> where
            higher values in earlier positions always win, regardless of the count in later positions.
          </p>

          <h3 className="text-lg font-semibold text-foreground">The Three Specificity Columns</h3>
          <p>
            <strong className="text-foreground">A — ID selectors:</strong> Each <code className="text-accent font-mono text-sm">#id</code> contributes 1 to column A.
            IDs are the most specific selector type short of inline styles and the <code className="text-accent font-mono text-sm">!important</code> flag.
          </p>
          <p>
            <strong className="text-foreground">B — Classes, attributes, pseudo-classes:</strong> Selectors like <code className="text-accent font-mono text-sm">.class</code>,{" "}
            <code className="text-accent font-mono text-sm">[attr]</code>, and <code className="text-accent font-mono text-sm">:hover</code> each add 1 to column B.
            The <code className="text-accent font-mono text-sm">:not()</code> pseudo-class itself does not count, but its argument does.
          </p>
          <p>
            <strong className="text-foreground">C — Elements and pseudo-elements:</strong> Type selectors like <code className="text-accent font-mono text-sm">div</code>,{" "}
            <code className="text-accent font-mono text-sm">p</code>, and pseudo-elements like <code className="text-accent font-mono text-sm">::before</code> each add 1 to column C.
            The universal selector <code className="text-accent font-mono text-sm">*</code> contributes 0 to all columns.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Specificity Comparison Rules</h3>
          <p>
            Selectors are compared left to right. A selector with a higher A value always beats one with a lower A,
            regardless of B or C. If A is equal, compare B; if B is also equal, compare C. If all three are equal,
            the rule that appears later in the stylesheet wins (source order).
          </p>

          <h3 className="text-lg font-semibold text-foreground">The !important Exception</h3>
          <p>
            The <code className="text-accent font-mono text-sm">!important</code> flag overrides specificity entirely and should be used sparingly.
            When two competing declarations both use <code className="text-accent font-mono text-sm">!important</code>, specificity
            rules apply again between them. Inline styles (applied via the <code className="text-accent font-mono text-sm">style</code> attribute)
            sit above all selector-based specificity but below <code className="text-accent font-mono text-sm">!important</code>.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            CSS Specificity Calculator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-filter-mauve.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
              <a href="/css-box-shadow" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Box Shadow</a>
              <a href="https://css-gradient-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient</a>
              <a href="https://color-contrast-checker-xi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Contrast</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">54+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
