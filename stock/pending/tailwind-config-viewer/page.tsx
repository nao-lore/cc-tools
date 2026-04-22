import TailwindConfigViewer from "./components/TailwindConfigViewer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#0ea5e9] to-[#6366f1]" />
            <span className="font-semibold text-foreground">tailwind-config-viewer</span>
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
            Tailwind Config Viewer
          </h1>
          <p className="text-muted text-lg">
            Paste your Tailwind config and instantly browse all design tokens — colors, spacing,
            typography, border radius, and shadows — as visual swatches.
          </p>
        </div>

        <TailwindConfigViewer />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            How to use this tool
          </h2>
          <p>
            Paste the <code className="font-mono text-sm bg-surface px-1 py-0.5 rounded">theme</code> section
            of your <code className="font-mono text-sm bg-surface px-1 py-0.5 rounded">tailwind.config.js</code> as
            JSON into the textarea above. The viewer instantly parses and visualizes every token
            across five categories.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Supported token types</h3>
          <p>
            <strong>Colors</strong> are displayed as color swatches grouped by family, with their
            hex values. <strong>Spacing</strong> tokens show proportional bars so you can quickly
            compare scale values. <strong>Font sizes</strong> render a live "Aa" preview at the
            actual size. <strong>Border radius</strong> tokens show a square with the radius applied.
            <strong> Shadows</strong> display a card with the box-shadow rendered.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Searching tokens</h3>
          <p>
            The search box filters across all token keys and values simultaneously. Type a color name
            like "blue", a pixel value like "16px", or a partial key like "2xl" to narrow results
            within the active tab.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Copying values</h3>
          <p>
            Every token has a copy button that puts the raw value on your clipboard. This is useful
            when you want to use a spacing value directly in a style attribute or compare a shadow
            definition across projects.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Tailwind Config Viewer — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://tailwind-color-finder.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Tailwind Color Finder</a>
              <a href="https://color-contrast-checker.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Contrast Checker</a>
              <a href="https://css-filter-mauve.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
              <a href="https://css-text-shadow.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Text Shadow Generator</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
