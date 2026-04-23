import AspectRatioCalculator from "./components/AspectRatioCalculator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* AdSense slot - top banner */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Aspect Ratio Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate aspect ratios from any dimensions, lock ratios for
            proportional resizing, and find the perfect resolution for your
            screens, images, and videos.
          </p>
        </div>

        {/* Calculator Tool */}
        <AspectRatioCalculator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is an Aspect Ratio?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            An aspect ratio is the proportional relationship between the width
            and height of an image, screen, or video. It is typically expressed
            as two numbers separated by a colon, such as 16:9 or 4:3. The first
            number represents the width and the second represents the height.
            Aspect ratios are fundamental in photography, videography, web
            design, and display technology.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Aspect Ratios
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Different aspect ratios serve different purposes:
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>16:9</strong> — The standard widescreen ratio used by most
              monitors, TVs, and YouTube videos. Resolutions include 1920x1080
              (1080p) and 3840x2160 (4K).
            </li>
            <li>
              <strong>4:3</strong> — The classic ratio used by older TVs and
              monitors. Common in presentations and iPad displays.
            </li>
            <li>
              <strong>21:9</strong> — Ultrawide ratio used by cinematic displays
              and ultrawide monitors for immersive viewing.
            </li>
            <li>
              <strong>1:1</strong> — Square format, popular on Instagram posts
              and profile pictures.
            </li>
            <li>
              <strong>9:16</strong> — Vertical video format used by TikTok,
              Instagram Reels, and YouTube Shorts.
            </li>
            <li>
              <strong>3:2</strong> — Used in many DSLR cameras and the Microsoft
              Surface line of devices.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Calculator
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Enter dimensions</strong> — Type a width and height to
              instantly see the simplified aspect ratio.
            </li>
            <li>
              <strong>Use presets</strong> — Click any common ratio preset to
              auto-fill dimensions.
            </li>
            <li>
              <strong>Lock the ratio</strong> — Enable ratio lock to
              proportionally adjust height when you change width, or vice versa.
            </li>
            <li>
              <strong>Preview</strong> — See a visual representation of your
              ratio in real time.
            </li>
            <li>
              <strong>Copy results</strong> — Copy your calculated ratio or
              dimensions with one click.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Aspect Ratios Matter
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Using the correct aspect ratio prevents images and videos from
            appearing stretched or cropped. When designing for multiple screen
            sizes, knowing your aspect ratio ensures content displays correctly
            on phones, tablets, monitors, and TVs. Video editors need to match
            export ratios to platform requirements, and photographers use aspect
            ratios to compose shots and prepare prints at standard sizes.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">aspect-ratio — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/placeholder-image" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Placeholder Image</a>
              <a href="/image-compressor" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Image Compressor</a>
              <a href="/px-to-rem" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">PX to REM</a>
              <a href="/css-grid" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Grid</a>
              <a href="/timezone-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Timezone Converter</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools &rarr;</a>
          </div>
        </div>
      </footer>

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    </div>
  );
}
