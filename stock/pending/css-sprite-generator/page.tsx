import SpriteCalculator from "./components/SpriteCalculator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">css-sprite-generator</span>
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
            CSS Sprite Position Calculator
          </h1>
          <p className="text-muted text-lg">
            Enter your sprite sheet dimensions and tile size to instantly generate
            background-position values and ready-to-use CSS classes for every tile.
          </p>
        </div>

        <SpriteCalculator />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            What are CSS Sprites?
          </h2>
          <p>
            A CSS sprite sheet combines multiple images into a single file. You then use
            <code className="text-accent font-mono text-sm"> background-position</code> to
            show only the tile you need, reducing HTTP requests and improving page load time.
            This technique is especially useful for icon sets, game assets, and UI elements
            that appear repeatedly across a site.
          </p>

          <h3 className="text-lg font-semibold text-foreground">How background-position Works</h3>
          <p>
            The <code className="text-accent font-mono text-sm">background-position</code> property
            shifts the background image relative to the element. For sprites, you set the element
            width and height to match the tile size, then use negative x/y offsets to reveal the
            correct tile. A tile at column 2, row 1 (zero-indexed) in a 32×32 grid would use
            <code className="text-accent font-mono text-sm"> background-position: -64px -32px</code>.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Using Gaps in Sprite Sheets</h3>
          <p>
            Some sprite sheets include padding between tiles to prevent color bleeding when the
            browser sub-pixel renders the image. Set the gap value to the number of pixels between
            each tile. The calculator adds the gap to both the x and y offset for every tile beyond
            the first row or column.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Optimizing with Sprites</h3>
          <p>
            Modern HTTP/2 reduces the per-request overhead that originally motivated sprites, but
            sprites still win for very large icon sets where individual SVG or PNG files would
            create hundreds of connections. Combine sprite usage with
            <code className="text-accent font-mono text-sm"> background-size</code> to scale the
            entire sheet for high-DPI displays while keeping a single asset.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            CSS Sprite Position Calculator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-filter-mauve.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
              <a href="https://css-clip-path.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Clip-Path</a>
              <a href="/css-box-shadow" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Box Shadow</a>
              <a href="https://css-gradient-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient</a>
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
