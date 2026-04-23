import ImageColorPicker from "./components/ImageColorPicker";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">image-color-picker</span>
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
            Image Color Picker
          </h1>
          <p className="text-muted text-lg">
            Upload any image and hover to instantly pick colors. Click to lock a sample and save it.
            Get HEX, RGB, and HSL values with one-click copy.
          </p>
        </div>

        <ImageColorPicker />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            How to Use the Image Color Picker
          </h2>
          <p>
            Upload an image by dragging and dropping it onto the upload area, or clicking to browse
            your files. Once loaded, move your cursor over the image to see the color under the
            crosshair in real time. A magnified preview helps you pick individual pixels precisely.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Picking and Saving Colors</h3>
          <p>
            Click anywhere on the image to lock that color as a sample. The color is added to your
            saved swatches below the canvas. Click again to unlock and continue picking. Up to 12
            samples are kept at a time — the newest always appears first.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Color Formats</h3>
          <p>
            Each picked color is displayed in three standard formats: HEX (e.g.{" "}
            <code className="text-accent font-mono text-sm">#FF6B9D</code>), RGB (e.g.{" "}
            <code className="text-accent font-mono text-sm">rgb(255, 107, 157)</code>), and HSL (e.g.{" "}
            <code className="text-accent font-mono text-sm">hsl(338, 100%, 71%)</code>). Click any
            value to copy it to the clipboard instantly.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Privacy</h3>
          <p>
            All processing happens locally in your browser. Your images are never uploaded to any
            server. The tool works entirely with the HTML5 Canvas API, so your files stay private.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Image Color Picker — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/color-palette" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Palette</a>
              <a href="https://color-contrast-checker.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Contrast Checker</a>
              <a href="https://css-filter-mauve.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
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
