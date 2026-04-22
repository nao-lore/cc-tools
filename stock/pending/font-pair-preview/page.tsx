import FontPairPreview from "./components/FontPairPreview";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">font-pair-preview</span>
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
            Font Pair Preview
          </h1>
          <p className="text-muted text-lg">
            Preview Google Fonts pairings for headings and body text. Adjust size,
            weight, and line height. Get instant CSS output.
          </p>
        </div>

        <FontPairPreview />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            How to Choose a Font Pairing
          </h2>
          <p>
            A great font pairing creates visual hierarchy and rhythm on the page. The
            most reliable pairings use contrast — a strong, distinctive heading font
            balanced by a readable, neutral body font. Serif headings with sans-serif
            body text is a time-tested combination used in print and digital media alike.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Contrast and Harmony</h3>
          <p>
            Fonts that are too similar create a monotonous look. Fonts that are too
            different feel chaotic. Aim for contrast in classification (serif vs. sans-serif),
            weight (bold heading, regular body), or style (geometric vs. humanist) —
            while keeping the overall tone consistent. A playful display font pairs
            well with a simple, clean body face that doesn't compete for attention.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Size and Line Height</h3>
          <p>
            Heading size sets the visual anchor of the page. Body text is typically
            set between 15–18px for screens, with a line height of 1.5–1.7 for comfortable
            reading. Headings can use tighter line heights (1.1–1.3) since they span fewer
            lines. The ratio between heading and body size — the typographic scale — is
            usually 2:1 to 3:1 for strong hierarchy.
          </p>

          <h3 className="text-lg font-semibold text-foreground">System Fonts vs. Web Fonts</h3>
          <p>
            System fonts like Georgia, Verdana, Arial, and Helvetica are available on
            virtually every device with zero loading cost. Web fonts from Google Fonts
            or Adobe Fonts expand your options but add a network request. For performance-
            critical pages, system font stacks are ideal. This tool previews system fonts
            so you can evaluate pairings before committing to a web font service.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Font Weight Pairings</h3>
          <p>
            Using the same typeface at different weights (700 for headings, 400 for body)
            is the simplest pairing strategy — it guarantees harmony. When mixing two
            families, keep the body weight at 400 or 500 for readability, and use
            600–900 for headings to create a clear hierarchy. Avoid using light weights
            (300) for body text below 16px, as they reduce readability on low-contrast
            or small screens.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Font Pair Preview — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-filter-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
              <a href="https://css-gradient-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient</a>
              <a href="https://color-contrast-checker.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Contrast</a>
              <a href="https://css-text-shadow.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Text Shadow</a>
              <a href="https://tailwind-color-finder.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Tailwind Colors</a>
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
