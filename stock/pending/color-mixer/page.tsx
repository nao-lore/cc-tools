import ColorMixer from "./components/ColorMixer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#f093fb] to-[#f5576c]" />
            <span className="font-semibold text-foreground">color-mixer</span>
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
            Color Mixer
          </h1>
          <p className="text-muted text-lg">
            Mix two or more colors with adjustable weights. Preview the blended result
            in real-time and copy the output in HEX, RGB, or HSL.
          </p>
        </div>

        <ColorMixer />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            How Color Mixing Works
          </h2>
          <p>
            Colors are mixed by blending their red, green, and blue channels
            separately, weighted by each color&apos;s contribution. A weight of 50 on two
            equal colors means each contributes half to the result. Higher weights pull
            the blend toward that color.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Weighted Average</h3>
          <p>
            The algorithm normalizes all weights so they sum to 1, then computes a
            weighted average of each RGB channel. This is equivalent to physically
            mixing paints proportionally — more of one color shifts the result toward
            that hue.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Output Formats</h3>
          <p>
            The blended color is shown in three formats: HEX (e.g.{" "}
            <code className="text-accent font-mono text-sm">#a83291</code>), RGB (e.g.{" "}
            <code className="text-accent font-mono text-sm">rgb(168, 50, 145)</code>),
            and HSL (e.g.{" "}
            <code className="text-accent font-mono text-sm">hsl(307, 54%, 43%)</code>).
            Click any format to copy it to the clipboard.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Use Cases</h3>
          <p>
            Use this tool to find intermediate colors for gradients, to blend brand
            colors together for neutral tones, or to experiment with color theory
            concepts like complementary and analogous palettes. Add up to many colors
            and vary their weights to dial in exactly the shade you need.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Color Mixer — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/color-palette" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Palette</a>
              <a href="https://css-filter-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
              <a href="https://css-gradient-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient</a>
              <a href="/css-box-shadow" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Box Shadow</a>
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
