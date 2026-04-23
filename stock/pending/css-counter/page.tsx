import CssCounterGenerator from "./components/CssCounterGenerator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">css-counter</span>
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
            CSS Counter Generator
          </h1>
          <p className="text-muted text-lg">
            Build automatic numbering systems with CSS counters. Configure the counter
            name, format, and scope, then copy the ready-to-use CSS.
          </p>
        </div>

        <CssCounterGenerator />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            What are CSS Counters?
          </h2>
          <p>
            CSS counters let the browser maintain and display auto-incremented numbers
            without any JavaScript. You declare a counter with
            <code className="text-accent font-mono text-sm"> counter-reset</code>, advance
            it on each target element with
            <code className="text-accent font-mono text-sm"> counter-increment</code>, and
            render the value in a pseudo-element using
            <code className="text-accent font-mono text-sm"> content: counter(name)</code>.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Number Formats</h3>
          <p>
            The second argument to{" "}
            <code className="text-accent font-mono text-sm">counter()</code> controls
            formatting. <code className="text-accent font-mono text-sm">decimal</code> gives
            1, 2, 3. <code className="text-accent font-mono text-sm">lower-alpha</code> /
            <code className="text-accent font-mono text-sm">upper-alpha</code> give a–z /
            A–Z, and <code className="text-accent font-mono text-sm">lower-roman</code> /
            <code className="text-accent font-mono text-sm">upper-roman</code> give i–xii /
            I–XII. Any{" "}
            <code className="text-accent font-mono text-sm">list-style-type</code> keyword
            is valid here.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Nested Counters</h3>
          <p>
            Nesting is achieved by resetting a child counter on the parent element and
            using{" "}
            <code className="text-accent font-mono text-sm">counters(name, separator)</code>{" "}
            (plural) to concatenate all ancestor values. This produces classic outlines
            like 1.2.3 without touching the HTML.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Scope and Reset</h3>
          <p>
            A counter is scoped to the element where it is reset. Placing
            <code className="text-accent font-mono text-sm"> counter-reset</code> on each
            <code className="text-accent font-mono text-sm"> section</code> restarts the
            child counter for every section while the parent counter keeps incrementing
            across the whole document. This is the key difference between page-scoped and
            section-scoped configurations.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            CSS Counter Generator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-filter-mauve.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
              <a href="https://css-clip-path.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Clip-Path</a>
              <a href="https://css-specificity.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Specificity</a>
              <a href="https://css-variables-generator.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Variables</a>
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
