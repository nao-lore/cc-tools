import TypeScaleGenerator from "./components/TypeScaleGenerator";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <header className="border-b border-panel-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-white font-mono text-xs font-bold">
              Ts
            </div>
            <span className="text-sm font-medium text-muted hidden sm:block">type-scale-generator</span>
          </div>
          <nav className="flex items-center gap-4 text-xs text-muted">
            <span>100% Client-Side</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">No Data Sent to Server</span>
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Typographic Scale Generator
          </h1>
          <p className="text-sm text-muted">
            Generate a modular type scale. Choose a ratio, preview sizes with sample text, and export as CSS custom properties, Tailwind config, or SCSS variables.
          </p>
        </div>

        <TypeScaleGenerator />

        {/* AdSense placeholder */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="border border-dashed border-panel-border rounded-lg p-6 text-center text-xs text-muted/40">
            Advertisement Space
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Typographic Scale Generator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://font-pair-preview.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Font Pair Preview</a>
              <a href="https://css-variables-generator.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Variables Generator</a>
              <a href="https://color-token-generator.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Token Generator</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">100+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
