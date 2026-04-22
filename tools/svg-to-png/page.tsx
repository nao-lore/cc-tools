import SvgConverter from "./components/SvgConverter";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="convert">
              🔄
            </span>
            <span className="font-bold text-lg text-gray-900">svg-to-png</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            SVG to PNG Converter
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Convert SVG files and code to high-resolution PNG images instantly.
            Free, fast, and 100% client-side &mdash; your files never leave your
            browser.
          </p>
        </div>
      </section>

      {/* Main Tool */}
      <main className="flex-1 px-4 py-8">
        <SvgConverter />
      </main>

      {/* SEO Content */}
      <section className="bg-gray-50 border-t border-gray-100 px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What is SVG to PNG Conversion?
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            SVG (Scalable Vector Graphics) is an XML-based vector image format
            widely used in web design, icons, logos, and illustrations. Unlike
            raster formats, SVG images are resolution-independent and can scale
            to any size without losing quality. However, many applications,
            platforms, and workflows require raster image formats like PNG.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            PNG (Portable Network Graphics) is a raster image format that
            supports lossless compression and transparency. It is universally
            supported across all devices, browsers, email clients, and social
            media platforms, making it the go-to format when you need a
            pixel-based version of your vector artwork.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
            Why Convert SVG to PNG?
          </h2>
          <ul className="text-gray-600 space-y-2 mb-4 list-disc pl-5">
            <li>
              <strong>Compatibility:</strong> Not all applications support SVG.
              Converting to PNG ensures your images work everywhere &mdash; in
              presentations, documents, emails, and social media posts.
            </li>
            <li>
              <strong>Fixed Resolution:</strong> When you need an image at a
              specific pixel size (for example, app icons, favicons, or social
              media headers), converting SVG to PNG at the exact dimensions
              guarantees pixel-perfect results.
            </li>
            <li>
              <strong>Print and Production:</strong> Many print workflows and
              design tools expect raster images. High-resolution PNG exports
              (2x, 3x, 4x) ensure crisp output on Retina displays and in print
              materials.
            </li>
            <li>
              <strong>Transparency Support:</strong> PNG preserves the
              transparency from your SVG, which is essential for logos, icons,
              and overlays that need to blend seamlessly with any background.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
            Understanding Resolution and Scale
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            When converting SVG to PNG, resolution matters. A 1x export renders
            the PNG at the SVG&apos;s native dimensions. A 2x export doubles
            both width and height, producing four times as many pixels &mdash;
            ideal for Retina/HiDPI displays. A 3x or 4x export is common for
            app icons and high-resolution assets. You can also specify exact
            pixel dimensions using custom width and height values for precise
            control over the output size.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
            Common Use Cases
          </h2>
          <ul className="text-gray-600 space-y-2 mb-4 list-disc pl-5">
            <li>
              Converting icon sets or logo SVGs to PNG for use in mobile apps
              (iOS, Android) at multiple resolutions
            </li>
            <li>
              Exporting SVG illustrations for social media posts, presentations,
              or marketing materials
            </li>
            <li>
              Generating favicon PNGs from an SVG source at standard sizes (16px,
              32px, 48px, 192px)
            </li>
            <li>
              Batch converting design system SVG assets to PNG for legacy system
              compatibility
            </li>
            <li>
              Creating high-resolution PNG versions of SVG charts, diagrams, or
              infographics for reports and documentation
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
            Privacy and Security
          </h2>
          <p className="text-gray-600 leading-relaxed">
            This tool performs all conversion entirely in your browser using the
            HTML5 Canvas API. Your SVG files and code are never uploaded to any
            server. The conversion happens locally on your device, ensuring
            complete privacy and security for your design assets. No account
            required, no file size limits, no watermarks.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            SVG to PNG Converter — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://image-compressor-eight-tawny.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Image Compressor</a>
              <a href="https://favicon-generator-psi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Favicon Generator</a>
              <a href="https://image-to-base64-five.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Image to Base64</a>
              <a href="https://qr-generator-ten-wheat.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">QR Generator</a>
              <a href="https://placeholder-image-fmq8sxvq6-naos-projects-52ff71e9.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Placeholder Image</a>
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
