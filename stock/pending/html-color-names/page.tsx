import HtmlColorNames from "./components/HtmlColorNames";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#ff6b6b] to-[#4ecdc4]" />
            <span className="font-semibold text-foreground">html-color-names</span>
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
            HTML/CSS Color Names
          </h1>
          <p className="text-muted text-lg">
            Browse all 148 CSS named colors. Search by name, filter by hue, and copy hex or RGB values
            with one click.
          </p>
        </div>

        <HtmlColorNames />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            About CSS Named Colors
          </h2>
          <p>
            CSS defines 148 named colors that can be used directly in stylesheets without specifying a hex or
            RGB value. Names like <code className="text-accent font-mono text-sm">rebeccapurple</code>,{" "}
            <code className="text-accent font-mono text-sm">cornflowerblue</code>, and{" "}
            <code className="text-accent font-mono text-sm">papayawhip</code> are all valid color values
            recognized by every modern browser.
          </p>

          <h3 className="text-lg font-semibold text-foreground">History</h3>
          <p>
            The original set of 16 colors dates back to HTML 3.2 in 1996. Over time, X11 color names were
            adopted into CSS, and the list grew to 140 with CSS3. The color{" "}
            <code className="text-accent font-mono text-sm">rebeccapurple</code> was added in CSS4 in honor
            of Rebecca Meyer, daughter of CSS developer Eric Meyer. Several alias pairs (like{" "}
            <code className="text-accent font-mono text-sm">gray</code>/{" "}
            <code className="text-accent font-mono text-sm">grey</code>) account for the total of 148.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Usage in CSS</h3>
          <p>
            Named colors work in any CSS property that accepts a color value:{" "}
            <code className="text-accent font-mono text-sm">color</code>,{" "}
            <code className="text-accent font-mono text-sm">background-color</code>,{" "}
            <code className="text-accent font-mono text-sm">border-color</code>,{" "}
            <code className="text-accent font-mono text-sm">box-shadow</code>, and more. They are
            case-insensitive, so <code className="text-accent font-mono text-sm">Red</code>,{" "}
            <code className="text-accent font-mono text-sm">RED</code>, and{" "}
            <code className="text-accent font-mono text-sm">red</code> are identical.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            HTML Color Names Explorer — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://color-contrast-checker.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Contrast Checker</a>
              <a href="https://color-harmonies.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Harmonies</a>
              <a href="https://css-filter-mauve.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
              <a href="https://color-mixer.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Mixer</a>
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
