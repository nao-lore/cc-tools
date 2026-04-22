import TextShadowGenerator from "./components/TextShadowGenerator";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            CSS Text Shadow Generator
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-500">
            Create CSS text-shadow effects visually with live preview
          </p>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <TextShadowGenerator />
        </div>

        {/* AdSense placeholder */}
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="w-full h-[90px] bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            Advertisement
          </div>
        </div>

        {/* SEO Content */}
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Understanding CSS Text Shadow
            </h2>
            <p className="text-gray-600 mb-4">
              The CSS <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">text-shadow</code> property
              adds shadow effects directly to text characters. It accepts a comma-separated list of shadows, each
              defined by a horizontal offset, vertical offset, optional blur radius, and color. Unlike{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">box-shadow</code>, text-shadow
              follows the exact shape of each glyph, making it ideal for typographic effects.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Text-Shadow Syntax
            </h3>
            <p className="text-gray-600 mb-4">
              The syntax is:{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
                text-shadow: &lt;offset-x&gt; &lt;offset-y&gt; [blur-radius] &lt;color&gt;
              </code>
              . The horizontal offset shifts the shadow left (negative) or right (positive). The vertical offset
              shifts it up (negative) or down (positive). Blur radius softens the shadow edge — omitting it or using 0
              gives a hard-edged shadow. Multiple shadows are comma-separated and rendered front-to-back.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Creative Effects with Multiple Shadows
            </h3>
            <p className="text-gray-600 mb-4">
              Layering multiple text shadows unlocks powerful typographic effects. A neon glow uses several shadows
              of the same color with increasing blur radii. A 3D effect stacks hard-edged shadows offset diagonally.
              A fire effect combines warm-colored shadows with varying offsets and blurs. Each layer in this generator
              can have its own position, blur, color, and opacity — giving you full control over the final result.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              How to Use This Generator
            </h3>
            <p className="text-gray-600 mb-4">
              Type your own text in the preview input and adjust the font size. Use the sliders to control each
              shadow&apos;s offset, blur, color, and opacity. Click &quot;Add Shadow Layer&quot; to stack multiple
              shadows for complex effects. Try the built-in presets for quick starting points. When satisfied, click
              &quot;Copy CSS&quot; to copy the complete declaration to your clipboard and paste it into your stylesheet.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">CSS Text Shadow Generator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-box-shadow-tau.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Box Shadow</a>
              <a href="https://css-gradient-beta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient</a>
              <a href="https://border-radius-nine.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Border Radius</a>
              <a href="https://color-palette-sand.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Palette</a>
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
