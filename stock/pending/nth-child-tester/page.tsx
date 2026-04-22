import NthChildTester from "./components/NthChildTester";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">nth-child-tester</span>
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
            CSS :nth-child Tester
          </h1>
          <p className="text-muted text-lg">
            Test CSS :nth-child, :nth-of-type, and :nth-last-child expressions visually.
            Enter an An+B expression and instantly see which elements match.
          </p>
        </div>

        <NthChildTester />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            Understanding :nth-child Expressions
          </h2>
          <p>
            The <code className="text-accent font-mono text-sm">:nth-child(An+B)</code> pseudo-class selects elements based on their position
            among siblings. <strong className="text-foreground">A</strong> is the step size (cycle length) and{" "}
            <strong className="text-foreground">B</strong> is the offset. Both can be zero or negative.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Common Patterns</h3>
          <p>
            <code className="text-accent font-mono text-sm">odd</code> / <code className="text-accent font-mono text-sm">2n+1</code> — selects elements 1, 3, 5, 7… useful for alternating row colors.{" "}
            <code className="text-accent font-mono text-sm">even</code> / <code className="text-accent font-mono text-sm">2n</code> — selects elements 2, 4, 6, 8…
          </p>
          <p>
            <code className="text-accent font-mono text-sm">3n</code> — every third element (3, 6, 9…).{" "}
            <code className="text-accent font-mono text-sm">3n+1</code> — every third starting from 1 (1, 4, 7…).{" "}
            <code className="text-accent font-mono text-sm">-n+5</code> — first 5 elements only.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Selector Variants</h3>
          <p>
            <code className="text-accent font-mono text-sm">:nth-child</code> counts all siblings regardless of tag type.{" "}
            <code className="text-accent font-mono text-sm">:nth-of-type</code> counts only siblings of the same element type.{" "}
            <code className="text-accent font-mono text-sm">:nth-last-child</code> counts from the end, so position 1 is the last child.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Negative Values</h3>
          <p>
            A negative <strong className="text-foreground">A</strong> reverses direction.{" "}
            <code className="text-accent font-mono text-sm">-n+3</code> selects the first 3 elements (positions 3, 2, 1).
            A negative <strong className="text-foreground">B</strong> shifts the starting point before element 1, effectively
            skipping some steps at the beginning of the sequence.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            CSS :nth-child Tester — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-specificity-nu.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Specificity</a>
              <a href="https://css-filter-mauve.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
              <a href="https://css-gradient-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient</a>
              <a href="https://color-contrast-checker-xi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Contrast</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">54+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
