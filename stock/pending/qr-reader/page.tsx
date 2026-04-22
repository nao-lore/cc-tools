import QrReader from "./components/QrReader";

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
            QR Code Reader
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload an image, drag and drop, or paste a screenshot to instantly
            decode any QR code — all in your browser, nothing uploaded to a
            server.
          </p>
        </div>

        {/* QR Reader Tool */}
        <QrReader />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Read a QR Code Online
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This free QR code reader lets you decode QR codes directly in your
            browser. Simply upload an image file, drag and drop it onto the
            tool, or paste a screenshot using Ctrl+V (or Cmd+V on Mac). The
            decoded text or URL appears instantly without any server round-trip.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Types of Data Can QR Codes Contain?
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>URLs</strong> — The most common use. Scan to open a
              website instantly.
            </li>
            <li>
              <strong>Plain text</strong> — Messages, notes, or any arbitrary
              string.
            </li>
            <li>
              <strong>Contact info (vCard)</strong> — Name, phone, email encoded
              for quick sharing.
            </li>
            <li>
              <strong>Wi-Fi credentials</strong> — SSID and password for easy
              network joining.
            </li>
            <li>
              <strong>Email and SMS</strong> — Pre-filled message drafts.
            </li>
            <li>
              <strong>Geographic coordinates</strong> — Map locations encoded as
              geo: URIs.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tips for Best Results
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Make sure the QR code is fully visible and not cropped at the
              edges.
            </li>
            <li>
              Use a well-lit, high-contrast image — blurry or low-resolution
              images may not decode.
            </li>
            <li>
              For screenshots, use Ctrl+V / Cmd+V to paste directly without
              saving a file first.
            </li>
            <li>
              If decoding fails, try cropping the image to show only the QR
              code.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Privacy and Security
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            All QR decoding happens entirely in your browser using the
            BarcodeDetector API. No image data is sent to any server. Your
            files and scan history remain on your device and are cleared when
            you close the tab.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Browser Compatibility
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This tool uses the native BarcodeDetector API available in Chrome
            83+, Edge 83+, and Safari 17.4+. If your browser does not support
            it, a compatibility notice will appear. For the best experience, use
            an up-to-date version of Google Chrome or Microsoft Edge.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            QR Code Reader — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://svg-optimizer.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                SVG Optimizer
              </a>
              <a
                href="https://json-formatter-topaz-pi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
              </a>
              <a
                href="https://base64-image-encoder.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Base64 Image Encoder
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
