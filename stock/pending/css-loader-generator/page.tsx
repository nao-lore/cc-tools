import CssLoaderGenerator from "./components/CssLoaderGenerator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">css-loader-generator</span>
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
            CSS Loader Generator
          </h1>
          <p className="text-muted text-lg">
            Generate pure CSS loading spinners, dots, bars, pulse, and skeleton animations.
            Customize color, size, and speed — then copy the CSS instantly.
          </p>
        </div>

        <CssLoaderGenerator />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            Why Pure CSS Loaders?
          </h2>
          <p>
            Pure CSS loaders require zero JavaScript and no external libraries. They work
            in all modern browsers, animate on the GPU via{" "}
            <code className="text-accent font-mono text-sm">transform</code> and{" "}
            <code className="text-accent font-mono text-sm">opacity</code>, and stay
            smooth even when the main thread is busy — perfect for indicating network
            requests or deferred content.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Spinner vs Skeleton</h3>
          <p>
            Use a <strong className="text-foreground">spinner</strong> when the wait time
            is unknown or short (&lt;4 s). Use a{" "}
            <strong className="text-foreground">skeleton screen</strong> when you can
            predict the shape of the content — it reduces perceived latency by up to 20%
            compared to spinners because users start building a mental model of the page
            before data arrives.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Animation Performance Tips</h3>
          <p>
            Stick to animating <code className="text-accent font-mono text-sm">transform</code>{" "}
            and <code className="text-accent font-mono text-sm">opacity</code>. Animating
            width, height, or background-color triggers layout or paint, which is
            expensive. All loaders generated here follow this rule and include{" "}
            <code className="text-accent font-mono text-sm">will-change: transform</code>{" "}
            where beneficial.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Accessibility</h3>
          <p>
            Add <code className="text-accent font-mono text-sm">role="status"</code> and
            an <code className="text-accent font-mono text-sm">aria-label="Loading"</code>{" "}
            attribute to your loader element so screen readers announce the loading state.
            Pair with <code className="text-accent font-mono text-sm">prefers-reduced-motion</code>{" "}
            media queries to stop animations for users who prefer reduced motion.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            CSS Loader Generator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-filter-mauve.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
              <a href="https://css-clip-path.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Clip-Path</a>
              <a href="https://css-transform.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Transform</a>
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
