import TailwindColorFinder from "./components/TailwindColorFinder";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#0ea5e9] to-[#6366f1]" />
            <span className="font-semibold text-foreground">tailwind-color-finder</span>
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
            Tailwind Color Finder
          </h1>
          <p className="text-muted text-lg">
            Pick any hex color and instantly find the closest Tailwind CSS v3 color class.
            Shows top 5 matches with perceptual distance (ΔE) and a full palette browser.
          </p>
        </div>

        <TailwindColorFinder />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            How the color matching works
          </h2>
          <p>
            This tool converts your hex color and every Tailwind v3 palette color into
            CIE Lab color space, then computes the CIE76 ΔE (delta-E) distance between them.
            Lab is designed to match human perception — a distance of 1 is barely noticeable
            to the human eye, while values above 10 indicate clearly different colors.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Why Lab instead of RGB distance?</h3>
          <p>
            RGB Euclidean distance treats red, green, and blue channels equally, but human vision
            is far more sensitive to changes in green than red or blue. The Lab color space
            maps colors so that equal numeric distances correspond to equal perceived differences,
            giving much better "closest color" results for design work.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Tailwind v3 palette coverage</h3>
          <p>
            The palette includes all 22 named hue families from Tailwind CSS v3: slate, gray,
            zinc, neutral, stone, red, orange, amber, yellow, lime, green, emerald, teal, cyan,
            sky, blue, indigo, violet, purple, fuchsia, pink, and rose. Each family has 11 shades
            (50, 100–900, 950) for a total of 242 colors.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Using the palette browser</h3>
          <p>
            Click any swatch in the full palette browser to set it as the input color and see
            its closest neighbors. The best match from your current search is highlighted with
            a ring. Use the search box to filter by color name (e.g. "blue") or hex fragment.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Tailwind Color Finder — Free online tool. No signup required.
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
