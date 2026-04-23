import ImageToBase64 from "./components/ImageToBase64";

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
            Image to Base64 Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert images to Base64 strings instantly. Drag and drop any image
            to get its Base64 encoding in multiple formats — Data URI, CSS, or
            HTML.
          </p>
        </div>

        {/* Converter Tool */}
        <ImageToBase64 />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is Base64 Encoding?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Base64 is a binary-to-text encoding scheme that represents binary
            data using a set of 64 ASCII characters. When applied to images, it
            converts the raw binary file into a text string that can be embedded
            directly into HTML, CSS, JSON, or any text-based format. This
            eliminates the need for a separate image file request, which can
            improve page load performance for small images.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Convert Images to Base64?
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Reduce HTTP requests</strong> — Embedding small images
              directly in HTML or CSS eliminates extra network round trips.
            </li>
            <li>
              <strong>Email templates</strong> — Many email clients block
              external images. Inline Base64 images display without being
              blocked.
            </li>
            <li>
              <strong>Data URIs in CSS</strong> — Use Base64-encoded images as
              CSS background images without referencing external files.
            </li>
            <li>
              <strong>API payloads</strong> — Send image data as part of JSON
              API requests without multipart form encoding.
            </li>
            <li>
              <strong>Single-file applications</strong> — Bundle everything into
              one HTML file for portability.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supported Image Formats
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This tool supports all common web image formats: PNG, JPEG/JPG, GIF,
            SVG, WebP, and ICO. Each format is detected automatically and the
            correct MIME type is used in the Data URI output. SVG files can also
            be used as inline XML, but Base64 encoding provides a universal
            approach that works across all contexts.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Output Formats Explained
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Raw Base64</strong> — The pure Base64 string without any
              prefix. Useful for API payloads and custom processing.
            </li>
            <li>
              <strong>Data URI</strong> — The complete{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">
                data:image/type;base64,...
              </code>{" "}
              string. Can be used directly as an image source in HTML or CSS.
            </li>
            <li>
              <strong>CSS background-image</strong> — Ready-to-paste CSS
              property using the Data URI as a background image value.
            </li>
            <li>
              <strong>HTML img tag</strong> — A complete{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">
                {"<img>"}
              </code>{" "}
              element with the Data URI as the src attribute.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Base64 Size Overhead
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Base64 encoding increases the data size by approximately 33%. A 10
            KB image becomes roughly 13.3 KB when Base64-encoded. For this
            reason, Base64 embedding is best suited for small images like icons,
            logos, and UI elements. For larger images, traditional file references
            with proper caching are more efficient.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Upload an image</strong> by dragging it into the drop zone
              or clicking to browse your files.
            </li>
            <li>
              <strong>View the preview</strong> along with file details like
              name, type, size, and dimensions.
            </li>
            <li>
              <strong>Choose your output format</strong> — Raw Base64, Data URI,
              CSS, or HTML.
            </li>
            <li>
              <strong>Copy the output</strong> with one click and paste it
              wherever you need it.
            </li>
            <li>
              <strong>Reverse conversion</strong> — Paste a Base64 string to
              preview the decoded image.
            </li>
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Image to Base64 Converter — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/base64-tools" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Base64 Tools</a>
              <a href="/image-compressor" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Image Compressor</a>
              <a href="/svg-to-png" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">SVG to PNG</a>
              <a href="/favicon-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Favicon Generator</a>
              <a href="/placeholder-image" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Placeholder Image</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
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
