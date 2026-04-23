import ViewportUnitCalc from "./components/ViewportUnitCalc";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">viewport-unit-calc</span>
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
            Viewport Unit Calculator
          </h1>
          <p className="text-muted text-lg">
            Convert vw/vh values to pixels at common breakpoints, or reverse-calculate the
            viewport unit needed to hit a target pixel size.
          </p>
        </div>

        <ViewportUnitCalc />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            Understanding CSS Viewport Units
          </h2>
          <p>
            Viewport units are relative to the browser's viewport dimensions.{" "}
            <code className="text-accent font-mono text-sm">1vw</code> equals 1% of the
            viewport width, and <code className="text-accent font-mono text-sm">1vh</code>{" "}
            equals 1% of the viewport height. They're commonly used for fluid typography,
            spacing, and layout sizing that scales with the screen.
          </p>

          <h3 className="text-lg font-semibold text-foreground">vw — Viewport Width</h3>
          <p>
            <code className="text-accent font-mono text-sm">1vw</code> = 1% of the viewport
            width. At 1280px wide, <code className="text-accent font-mono text-sm">5vw</code>{" "}
            equals 64px. Use vw for elements that should scale horizontally with the screen.
          </p>

          <h3 className="text-lg font-semibold text-foreground">vh — Viewport Height</h3>
          <p>
            <code className="text-accent font-mono text-sm">1vh</code> = 1% of the viewport
            height. Useful for hero sections, modals, and full-screen layouts. Be cautious on
            mobile where the browser chrome can affect the viewport height.
          </p>

          <h3 className="text-lg font-semibold text-foreground">vmin and vmax</h3>
          <p>
            <code className="text-accent font-mono text-sm">vmin</code> uses the smaller of
            vw and vh, while <code className="text-accent font-mono text-sm">vmax</code> uses
            the larger. These are useful for elements that need to fit within the viewport
            regardless of orientation.
          </p>

          <h3 className="text-lg font-semibold text-foreground">CSS clamp() for Fluid Typography</h3>
          <p>
            Combine viewport units with <code className="text-accent font-mono text-sm">clamp()</code>{" "}
            to create fluid type scales:{" "}
            <code className="text-accent font-mono text-sm">font-size: clamp(1rem, 2.5vw, 2rem)</code>.
            This sets a minimum size, a fluid middle value, and a maximum — no media queries needed.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Viewport Unit Calculator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://breakpoint-visualizer-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Breakpoint Visualizer</a>
              <a href="https://css-clip-path-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Clip-Path</a>
              <a href="https://media-query-builder-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Media Query Builder</a>
              <a href="https://css-specificity-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Specificity</a>
              <a href="https://unit-converter-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Unit Converter</a>
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
