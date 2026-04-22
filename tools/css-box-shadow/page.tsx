import BoxShadowGenerator from "./components/BoxShadowGenerator";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            CSS Box Shadow Generator
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-500">
            Create beautiful box shadows visually with live preview
          </p>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <BoxShadowGenerator />
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
              Understanding CSS Box Shadow
            </h2>
            <p className="text-gray-600 mb-4">
              The CSS <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">box-shadow</code> property
              adds shadow effects around an element&apos;s frame. It is one of the most widely used CSS properties for
              creating depth, elevation, and visual hierarchy in modern web design. The property accepts multiple
              comma-separated shadows, which are applied front-to-back with the first shadow on top.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Box-Shadow Syntax
            </h3>
            <p className="text-gray-600 mb-4">
              The full syntax is: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">box-shadow:
              [inset] &lt;offset-x&gt; &lt;offset-y&gt; [blur-radius] [spread-radius] &lt;color&gt;</code>.
              The horizontal offset (offset-x) shifts the shadow left or right. The vertical offset (offset-y) shifts
              it up or down. Blur radius controls how soft the shadow appears — a value of 0 creates a hard edge.
              Spread radius expands or contracts the shadow size. Adding the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">inset</code> keyword
              makes the shadow appear inside the element instead of outside.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Multiple Shadows for Realistic Effects
            </h3>
            <p className="text-gray-600 mb-4">
              Professional designers often layer multiple shadows to create realistic depth. A common technique combines
              a tight, dark shadow close to the element with a larger, softer shadow further away. This mimics how light
              and shadows work in the real world. Our generator lets you add multiple shadow layers and reorder them to
              achieve exactly the look you want. Each layer can have its own offset, blur, spread, color, and opacity settings.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Performance Tips
            </h3>
            <p className="text-gray-600 mb-4">
              Box shadows are rendered by the browser&apos;s compositor and can impact performance, especially on mobile
              devices. To keep your pages fast, avoid applying large blur-radius values to many elements simultaneously.
              Prefer <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">filter: drop-shadow()</code> for
              non-rectangular shapes. When animating shadows, use <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">will-change: box-shadow</code> or
              animate opacity on a pseudo-element instead to avoid layout thrashing. Using CSS custom properties for your
              shadow values makes it easy to switch between themes or adjust shadows across your entire design system
              with a single change.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              How to Use This Generator
            </h3>
            <p className="text-gray-600 mb-4">
              Use the sliders and number inputs to adjust each shadow parameter and see the result instantly in the live
              preview panel. Click &quot;Add Shadow&quot; to layer multiple shadows for complex effects. Try the built-in
              presets for quick starting points — from subtle card elevations to dramatic drop shadows. When you are
              happy with the result, click &quot;Copy CSS&quot; to copy the complete box-shadow declaration to your
              clipboard, ready to paste into your stylesheet. You can also change the preview background color to test
              how your shadow looks against different surfaces.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">CSS Box Shadow Generator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-gradient-beta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient</a>
              <a href="https://border-radius-nine.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Border Radius</a>
              <a href="https://css-flexbox-rho.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Flexbox</a>
              <a href="https://css-animation-tawny.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Animation</a>
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
