import BreakpointVisualizer from "./components/BreakpointVisualizer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">breakpoint-visualizer</span>
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
            CSS Breakpoint Visualizer
          </h1>
          <p className="text-muted text-lg">
            Visualize breakpoints for Bootstrap, Tailwind CSS, and Material UI side by side.
            Drag the slider or enter a viewport width to see which breakpoint is active.
          </p>
        </div>

        <BreakpointVisualizer />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            Understanding CSS Breakpoints
          </h2>
          <p>
            CSS breakpoints are the viewport widths at which your layout changes to accommodate
            different screen sizes. Each framework has its own set of named breakpoints, but they
            all use the same underlying mechanism:{" "}
            <code className="text-accent font-mono text-sm">@media (min-width: Xpx)</code> queries
            that apply styles only when the viewport is at least that wide.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Bootstrap 5</h3>
          <p>
            Bootstrap uses six breakpoints: <code className="text-accent font-mono text-sm">xs</code> (0px),{" "}
            <code className="text-accent font-mono text-sm">sm</code> (576px),{" "}
            <code className="text-accent font-mono text-sm">md</code> (768px),{" "}
            <code className="text-accent font-mono text-sm">lg</code> (992px),{" "}
            <code className="text-accent font-mono text-sm">xl</code> (1200px), and{" "}
            <code className="text-accent font-mono text-sm">xxl</code> (1400px). The grid system
            uses these to control column widths with classes like{" "}
            <code className="text-accent font-mono text-sm">col-md-6</code>.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Tailwind CSS</h3>
          <p>
            Tailwind's default breakpoints are{" "}
            <code className="text-accent font-mono text-sm">sm</code> (640px),{" "}
            <code className="text-accent font-mono text-sm">md</code> (768px),{" "}
            <code className="text-accent font-mono text-sm">lg</code> (1024px),{" "}
            <code className="text-accent font-mono text-sm">xl</code> (1280px), and{" "}
            <code className="text-accent font-mono text-sm">2xl</code> (1536px). All breakpoint
            prefixes are mobile-first — <code className="text-accent font-mono text-sm">md:flex</code>{" "}
            means "flex at 768px and above".
          </p>

          <h3 className="text-lg font-semibold text-foreground">Material UI</h3>
          <p>
            Material UI defines five breakpoints:{" "}
            <code className="text-accent font-mono text-sm">xs</code> (0px),{" "}
            <code className="text-accent font-mono text-sm">sm</code> (600px),{" "}
            <code className="text-accent font-mono text-sm">md</code> (900px),{" "}
            <code className="text-accent font-mono text-sm">lg</code> (1200px), and{" "}
            <code className="text-accent font-mono text-sm">xl</code> (1536px). These correspond
            to the breakpoint helper props on MUI components like{" "}
            <code className="text-accent font-mono text-sm">{"<Grid xs={12} md={6} />"}</code>.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Custom Breakpoints</h3>
          <p>
            Use the Custom tab to define your own breakpoint system. Add any number of named
            breakpoints with arbitrary min-widths. The visualizer will generate the corresponding
            media queries and highlight the active breakpoint for any viewport width you enter.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            CSS Breakpoint Visualizer — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-clip-path-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Clip-Path</a>
              <a href="https://css-filter-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
              <a href="https://css-gradient-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient</a>
              <a href="https://css-specificity-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Specificity</a>
              <a href="https://color-contrast-checker-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Contrast Checker</a>
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
