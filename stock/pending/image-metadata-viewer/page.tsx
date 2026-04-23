import ImageMetadataViewer from "./components/ImageMetadataViewer";

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
            Image Metadata Viewer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a photo to instantly view its EXIF data — camera model, exposure settings, GPS location, and more. Everything runs in your browser. No files are uploaded to any server.
          </p>
        </div>

        {/* Tool */}
        <ImageMetadataViewer />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is EXIF Data?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            EXIF (Exchangeable Image File Format) is metadata embedded inside image files — particularly JPEGs taken by cameras and smartphones. It records technical details about how and where a photo was taken, including the camera make and model, shutter speed, aperture, ISO, focal length, date and time, and GPS coordinates.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Metadata Can This Tool Read?
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li><strong>File Info</strong> — File name, size, MIME type, and pixel dimensions.</li>
            <li><strong>Camera</strong> — Manufacturer (Make), camera model, and image orientation.</li>
            <li><strong>Exposure</strong> — Date/time of capture, shutter speed, aperture (f-number), ISO sensitivity, and focal length.</li>
            <li><strong>GPS</strong> — Latitude and longitude where the photo was taken, with a link to Google Maps.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Which File Formats Are Supported?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            EXIF parsing works best with <strong>JPEG</strong> files, as EXIF is a JPEG standard. PNG and WebP images will show file info and dimensions but typically do not contain EXIF data. Images shared via social media (Instagram, Twitter, WhatsApp) usually have EXIF stripped for privacy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Privacy Notice
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            All processing happens entirely in your browser using JavaScript. Your image is never sent to a server. GPS and camera data displayed here is only visible to you and is cleared when you close or refresh the tab.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Uses
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>Check if a photo has GPS data before sharing it publicly.</li>
            <li>Verify the capture date and camera settings for photography review.</li>
            <li>Inspect metadata on received images to verify authenticity.</li>
            <li>Debug image orientation issues in web applications.</li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Image Metadata Viewer — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://qr-reader.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                QR Code Reader
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
                href="/json-formatter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
              </a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a
              href="/"
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
