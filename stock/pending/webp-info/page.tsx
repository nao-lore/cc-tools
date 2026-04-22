import ImageFormatInfo from "./components/ImageFormatInfo";

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
            Image Format Detector
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload any image to instantly detect its format, dimensions, color space, and transparency support — read directly from file headers. No upload to any server.
          </p>
        </div>

        {/* Tool */}
        <ImageFormatInfo />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How Image Format Detection Works
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Every image file starts with a unique sequence of bytes called a <strong>magic number</strong> or file signature. This tool reads those first bytes directly — no guessing from file extensions — to reliably identify the true format of any image.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supported Formats
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li><strong>JPEG</strong> — Detected by the <code>FF D8</code> SOI marker. Dimensions and color space extracted from the SOF segment.</li>
            <li><strong>PNG</strong> — Detected by the 8-byte PNG signature. Bit depth, color type, and alpha support read from the IHDR chunk.</li>
            <li><strong>WebP</strong> — Detected by the RIFF/WEBP header. Supports VP8 (lossy), VP8L (lossless), and VP8X (extended/animated) sub-formats with alpha flag detection.</li>
            <li><strong>GIF</strong> — Detected by the GIF87a/GIF89a signature. Supports transparency via palette index.</li>
            <li><strong>AVIF</strong> — Detected by the <code>ftyp avif</code> ISO base media box. Next-generation format based on AV1.</li>
            <li><strong>BMP</strong> — Detected by the BM signature. Bit depth and alpha (32-bit) detected from the DIB header.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Gets Detected
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li><strong>Format</strong> — The true file format from the binary header, not the file extension.</li>
            <li><strong>Dimensions</strong> — Width and height in pixels, parsed from the format-specific header.</li>
            <li><strong>Color Space</strong> — RGB, YCbCr, Grayscale, Indexed palette, or RGBA as reported in the header.</li>
            <li><strong>Bit Depth</strong> — Bits per channel (e.g. 8-bit, 16-bit for PNG).</li>
            <li><strong>Transparency / Alpha</strong> — Whether the image supports an alpha channel or transparent areas.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Uses
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>Confirm an image is truly WebP before serving it to browsers that support it.</li>
            <li>Check whether a PNG has an alpha channel before using it as a transparent overlay.</li>
            <li>Verify AVIF conversion output has the correct color space and dimensions.</li>
            <li>Inspect files that have wrong or missing extensions.</li>
            <li>Compare before/after conversion quality metadata (dimensions, color space).</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Privacy Notice
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            All processing happens entirely in your browser using JavaScript and the FileReader API. Your files are never sent to a server and leave no trace beyond your browser tab.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Image Format Detector — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://image-metadata-viewer.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Image Metadata Viewer
              </a>
              <a
                href="https://svg-optimizer.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                SVG Optimizer
              </a>
              <a
                href="https://qr-reader.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                QR Code Reader
              </a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a
              href="https://cc-tools.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600"
            >
              53+ Free Tools →
            </a>
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
