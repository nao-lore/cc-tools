import CssVariablesGenerator from "./components/CssVariablesGenerator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#6366f1] to-[#8b5cf6]" />
            <span className="font-semibold text-foreground">css-variables-generator</span>
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
            CSS Variables Theme Generator
          </h1>
          <p className="text-muted text-lg">
            Pick a brand color and get a complete CSS custom properties theme — 10-step
            tint/shade scale, semantic tokens, and dark mode overrides. Copy and paste.
          </p>
        </div>

        <CssVariablesGenerator />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            About CSS Custom Properties Theming
          </h2>
          <p>
            CSS custom properties (variables) let you define design tokens once and
            reuse them everywhere. A single{" "}
            <code className="text-accent font-mono text-sm">:root</code> block holds
            your entire palette — change one value and every component updates instantly.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Tint / Shade Scale</h3>
          <p>
            This generator produces a 10-step scale from{" "}
            <code className="text-accent font-mono text-sm">--color-50</code> (near-white)
            to <code className="text-accent font-mono text-sm">--color-950</code> (near-black),
            following the same lightness progression used by Tailwind CSS. Each step is
            derived from your brand color by shifting the HSL lightness while preserving
            the hue and saturation.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Semantic Tokens</h3>
          <p>
            Raw scale values are mapped to role-based tokens:{" "}
            <code className="text-accent font-mono text-sm">--color-primary</code>,{" "}
            <code className="text-accent font-mono text-sm">--color-surface</code>,{" "}
            <code className="text-accent font-mono text-sm">--color-text-muted</code>,
            and so on. Semantic tokens decouple meaning from value — you can swap
            the entire palette by updating a handful of variables without touching
            component markup.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Dark Mode</h3>
          <p>
            The generated{" "}
            <code className="text-accent font-mono text-sm">@media (prefers-color-scheme: dark)</code>{" "}
            block overrides the semantic tokens automatically. Lighter scale steps become
            the background in dark mode while darker steps move to the foreground,
            keeping contrast ratios accessible without manually inverting every value.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Usage</h3>
          <p>
            Copy the generated CSS into your global stylesheet or{" "}
            <code className="text-accent font-mono text-sm">:root</code> block. Reference
            tokens with{" "}
            <code className="text-accent font-mono text-sm">var(--color-primary)</code> in
            any CSS rule, Tailwind arbitrary value, or CSS-in-JS string. The scale
            variables are also useful when you need a specific shade that falls
            outside the semantic token set.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            CSS Variables Theme Generator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-filter-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
              <a href="https://css-gradient-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient</a>
              <a href="/css-box-shadow" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Box Shadow</a>
              <a href="/color-palette" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Palette</a>
              <a href="https://css-text-shadow-psi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Text Shadow</a>
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
