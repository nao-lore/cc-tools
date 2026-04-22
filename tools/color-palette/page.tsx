import ColorPalette from "./components/ColorPalette";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Color Palette Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate beautiful color palettes instantly. Press spacebar or click
            Generate to create new combinations. Lock colors you love and explore
            harmony modes.
          </p>
        </div>

        {/* Color Palette Tool */}
        <ColorPalette />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a Color Palette Generator?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A color palette generator helps designers and developers create
            harmonious color combinations for websites, apps, and graphic design
            projects. Instead of manually picking colors, you can generate
            palettes based on color theory principles like complementary,
            analogous, and triadic relationships.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Color Harmony Modes
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            This tool supports five color harmony modes based on the color wheel:
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Complementary</strong> — Colors opposite each other on the
              color wheel, creating high contrast and vibrant combinations.
            </li>
            <li>
              <strong>Analogous</strong> — Colors adjacent on the color wheel,
              producing harmonious and pleasing schemes.
            </li>
            <li>
              <strong>Triadic</strong> — Three colors evenly spaced on the color
              wheel, offering balanced yet colorful palettes.
            </li>
            <li>
              <strong>Split-Complementary</strong> — A base color plus the two
              colors adjacent to its complement, offering contrast with less
              tension.
            </li>
            <li>
              <strong>Monochromatic</strong> — Variations of a single hue with
              different saturation and lightness values.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Generate</strong> a new palette by pressing the spacebar or
              clicking the Generate button.
            </li>
            <li>
              <strong>Lock colors</strong> you want to keep by clicking the lock
              icon on any swatch.
            </li>
            <li>
              <strong>Adjust colors</strong> by clicking a swatch to open HSL
              sliders for fine-tuning.
            </li>
            <li>
              <strong>Choose a harmony mode</strong> to generate palettes based
              on color theory relationships.
            </li>
            <li>
              <strong>Export</strong> your palette as CSS variables, a HEX array,
              Tailwind config, or JSON.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            WCAG Contrast Checking
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The built-in contrast checker evaluates adjacent colors against WCAG
            accessibility guidelines. It shows whether color pairs pass AA
            (minimum 4.5:1 ratio for normal text) or AAA (enhanced 7:1 ratio)
            standards, helping you build accessible designs.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Export Formats
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Export your palette in the format that fits your workflow. CSS custom
            properties work great for web projects, HEX arrays are universal,
            Tailwind config integrates directly with Tailwind CSS projects, and
            JSON is perfect for design tokens or programmatic use.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Color Palette Generator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://color-converter-inky.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Converter</a>
              <a href="https://css-gradient-beta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient Generator</a>
              <a href="https://css-animation-tawny.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Animation Generator</a>
              <a href="https://tailwindconvert.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Tailwind Converter</a>
              <a href="https://border-radius-nine.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Border Radius Generator</a>
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
