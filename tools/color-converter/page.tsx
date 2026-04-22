import ColorConverter from "./components/ColorConverter";

export default function Home() {
  return (
    <>
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">
          Color Converter
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Convert colors between HEX, RGB, HSL, and CMYK formats instantly. Pick
          a color, edit any value, and watch all formats update in real time.
        </p>

        <ColorConverter />

        {/* SEO Content */}
        <article className="mt-16 max-w-3xl mx-auto prose prose-gray dark:prose-invert prose-sm">
          <h2>Understanding Color Formats</h2>
          <p>
            Colors on the web and in print are represented using several
            different formats. Each format has its own strengths and is preferred
            in different contexts. Whether you are a web developer writing CSS, a
            designer preparing assets for print, or simply curious about how
            colors work under the hood, understanding these formats will help you
            make better decisions.
          </p>

          <h3>HEX (Hexadecimal)</h3>
          <p>
            HEX is the most commonly used color format in web development. A HEX
            color code starts with a hash symbol (#) followed by six hexadecimal
            digits representing the red, green, and blue channels. For example,{" "}
            <code>#3b82f6</code> encodes a vibrant blue. A shorthand three-digit
            form also exists: <code>#fff</code> expands to <code>#ffffff</code>{" "}
            (white). HEX values are compact and widely supported across all
            browsers and CSS preprocessors.
          </p>

          <h3>RGB (Red, Green, Blue)</h3>
          <p>
            The RGB model defines colors by mixing red, green, and blue light at
            varying intensities from 0 to 255. Pure red is{" "}
            <code>rgb(255, 0, 0)</code>, while equal parts of all three channels
            at maximum intensity produce white. RGB is the native color space of
            screens and monitors, making it the foundation for all digital color
            work. CSS accepts RGB values directly with the <code>rgb()</code>{" "}
            function, and many image editing tools display colors in RGB by
            default.
          </p>

          <h3>HSL (Hue, Saturation, Lightness)</h3>
          <p>
            HSL is a more intuitive way to think about color. Hue is a degree on
            the color wheel from 0 to 360 (red at 0, green at 120, blue at 240).
            Saturation controls the intensity of the color from 0% (gray) to
            100% (full color). Lightness ranges from 0% (black) to 100% (white),
            with 50% being the pure hue. Designers often prefer HSL because
            adjusting lightness or saturation feels more natural than tweaking
            individual red, green, and blue channels. CSS supports HSL through
            the <code>hsl()</code> function.
          </p>

          <h3>CMYK (Cyan, Magenta, Yellow, Key/Black)</h3>
          <p>
            CMYK is the standard color model for printing. Unlike the additive
            RGB model used by screens, CMYK is subtractive: colors are created
            by layering inks that absorb light. Cyan, magenta, yellow, and black
            inks combine in varying percentages to reproduce a wide range of
            colors on paper. If you are preparing designs for physical print,
            understanding the CMYK values of your colors is essential to avoid
            unexpected shifts between what you see on screen and what comes off
            the press.
          </p>

          <h3>When to Use Which Format</h3>
          <p>
            For web development, HEX and RGB are the default choices, with HSL
            gaining popularity because of its readability and ease of
            manipulation. If you need to create color palettes or generate
            lighter and darker shades of a base color, HSL makes the task
            straightforward: simply adjust the lightness value. For print design,
            always check the CMYK equivalent of your screen colors to ensure
            accurate reproduction. Many brands maintain color guidelines that
            specify values in all four formats to guarantee consistency across
            digital and physical media.
          </p>

          <h3>Accessibility and Contrast</h3>
          <p>
            Color choices directly affect the accessibility of your content. The
            Web Content Accessibility Guidelines (WCAG) define minimum contrast
            ratios between text and background colors. Level AA requires a ratio
            of at least 4.5:1 for normal text and 3:1 for large text. Level AAA
            raises the bar to 7:1 and 4.5:1 respectively. Our built-in contrast
            checker lets you verify that your color combinations meet these
            standards, helping you build interfaces that everyone can use
            comfortably. Poor contrast is one of the most common accessibility
            failures on the web, and choosing colors with sufficient contrast is
            a simple step that makes a significant difference.
          </p>

          <h3>CSS Named Colors</h3>
          <p>
            CSS defines 148 named colors, from <code>aliceblue</code> to{" "}
            <code>yellowgreen</code>. These names can be used directly in
            stylesheets and are often easier to remember than hex codes. Our
            converter shows the closest CSS named color for any color you pick,
            which can be a helpful reference when you want a recognizable name
            for a particular shade. While named colors are convenient, they cover
            only a tiny fraction of the millions of colors available in the full
            RGB spectrum.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Color Converter — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://color-palette-sand.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Palette</a>
              <a href="https://css-gradient-beta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient</a>
              <a href="https://binary-converter-one.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HEX Converter</a>
              <a href="https://tailwindconvert.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Tailwind Convert</a>
              <a href="https://px-to-rem-rust.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">PX to REM</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </>
  );
}
