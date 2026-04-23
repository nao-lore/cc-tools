import ContrastChecker from "./components/ContrastChecker";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">color-contrast-checker</span>
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
            Color Contrast Checker
          </h1>
          <p className="text-muted text-lg">
            Check foreground and background color contrast ratio for WCAG 2.1 AA and AAA compliance.
            Test text readability and UI component accessibility instantly.
          </p>
        </div>

        <ContrastChecker />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            Understanding WCAG Contrast Requirements
          </h2>
          <p>
            The Web Content Accessibility Guidelines (WCAG) define minimum contrast ratios to ensure
            text is readable for users with low vision or color blindness. Contrast ratio is calculated
            from the relative luminance of two colors, ranging from 1:1 (identical) to 21:1 (black on white).
          </p>

          <h3 className="text-lg font-semibold text-foreground">AA vs AAA Compliance</h3>
          <p>
            WCAG Level AA is the standard legal requirement in most jurisdictions. It requires a contrast
            ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt or 14pt bold). Level AAA
            is the enhanced standard, requiring 7:1 for normal text and 4.5:1 for large text. UI components
            and graphical objects must meet a 3:1 ratio against adjacent colors at both levels.
          </p>

          <h3 className="text-lg font-semibold text-foreground">What Counts as Large Text</h3>
          <p>
            Large text is defined as 18pt (24px) or larger in regular weight, or 14pt (approximately 18.67px)
            or larger in bold weight. Large text has a lower contrast requirement because it is inherently
            easier to read due to its size and stroke width.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Relative Luminance Formula</h3>
          <p>
            Relative luminance is computed by linearizing each RGB channel (applying gamma correction),
            then combining them as{" "}
            <code className="text-accent font-mono text-sm">L = 0.2126R + 0.7152G + 0.0722B</code>.
            The contrast ratio between two luminances L1 and L2 (where L1 is the lighter) is{" "}
            <code className="text-accent font-mono text-sm">(L1 + 0.05) / (L2 + 0.05)</code>.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Color Contrast Checker — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/color-palette" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Palette</a>
              <a href="https://css-gradient-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient</a>
              <a href="https://css-filter-mauve.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
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
