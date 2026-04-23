import ColorBlindnessSim from "./components/ColorBlindnessSim";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#e63946] to-[#457b9d]" />
            <span className="font-semibold text-foreground">color-blindness-sim</span>
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
            Color Blindness Simulator
          </h1>
          <p className="text-muted text-lg">
            See how colors appear to people with Protanopia, Deuteranopia, Tritanopia, and Achromatopsia.
            Test your palette for accessibility before shipping.
          </p>
        </div>

        <ColorBlindnessSim />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            Understanding Color Blindness
          </h2>
          <p>
            Color blindness affects approximately 8% of males and 0.5% of females of Northern European descent.
            It is caused by missing or malfunctioning cone cells in the retina. Designing with color blindness in
            mind ensures your UI is accessible to a much broader audience.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Types Simulated</h3>
          <p>
            <strong className="text-foreground">Protanopia</strong> — absent L-cones (long-wavelength / red). Reds appear dark and are confused with greens.
            Affects about 1% of males.{" "}
            <strong className="text-foreground">Deuteranopia</strong> — absent M-cones (medium-wavelength / green). The most common form, affecting about 1%
            of males; reds and greens are hard to distinguish.{" "}
            <strong className="text-foreground">Tritanopia</strong> — absent S-cones (short-wavelength / blue). Blues and yellows are confused; rare,
            affecting less than 0.1%.{" "}
            <strong className="text-foreground">Achromatopsia</strong> — complete absence of color vision; the world appears in shades of grey. Very rare.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Simulation Method</h3>
          <p>
            This simulator uses the Viénot–Brettel–Mollon (1999) dichromacy simulation matrices, which operate
            on linearized (gamma-corrected) sRGB values. Each RGB triplet is first linearized by reversing
            the sRGB gamma curve, then transformed with a 3×3 matrix that maps the missing cone response
            onto the remaining cones, then converted back to sRGB for display.
            Achromatopsia is approximated as luminance-only using the standard{" "}
            <code className="text-accent font-mono text-sm">L = 0.2126R + 0.7152G + 0.0722B</code> formula.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Design Tips</h3>
          <p>
            Never rely on color alone to convey information — pair it with shape, pattern, or text labels.
            Avoid red–green combinations without additional cues. Use high-contrast palettes and verify them
            with a contrast checker. Tools like this simulator let you catch accessibility issues before they
            reach users.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Color Blindness Simulator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://color-contrast-checker.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Contrast Checker</a>
              <a href="https://color-harmonies.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Harmonies</a>
              <a href="https://color-mixer.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Mixer</a>
              <a href="https://css-filter-mauve.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Filter</a>
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
