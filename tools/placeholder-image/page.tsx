import PlaceholderImage from "./components/PlaceholderImage";

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
            Placeholder Image Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create custom placeholder images with configurable dimensions,
            colors, text, and formats. Download or copy the data URI instantly.
          </p>
        </div>

        {/* Placeholder Image Tool */}
        <PlaceholderImage />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a Placeholder Image?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A placeholder image is a temporary graphic used during the design and
            development process to represent where a final image will appear.
            Placeholder images help designers and developers visualize layouts,
            test responsive designs, and build prototypes without needing actual
            content. They are commonly used in wireframes, mockups, and
            development environments.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Use a Placeholder Image Generator?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Instead of searching for stock photos or creating temporary graphics
            manually, a placeholder image generator lets you instantly create
            images of any size with custom colors and text. This speeds up the
            design workflow and ensures consistent placeholder content across
            your project. You can generate images for banners, thumbnails,
            avatars, social media cards, and more.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Set dimensions</strong> by entering width and height in
              pixels, or click a preset button for common sizes.
            </li>
            <li>
              <strong>Choose colors</strong> for the background and text using
              the color pickers.
            </li>
            <li>
              <strong>Add custom text</strong> or leave it blank to show the
              default dimension label (e.g., &quot;300x200&quot;).
            </li>
            <li>
              <strong>Adjust font size</strong> to fit your needs.
            </li>
            <li>
              <strong>Select a format</strong> (PNG, JPEG, or WebP) and click
              Download, or copy the image as a data URI for inline use.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Placeholder Image Sizes
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Banner (728x90)</strong> — Standard web banner ads and
              header strips.
            </li>
            <li>
              <strong>Thumbnail (150x150)</strong> — Small preview images for
              galleries and lists.
            </li>
            <li>
              <strong>Social (1200x630)</strong> — Open Graph images for
              Facebook, Twitter, and LinkedIn sharing.
            </li>
            <li>
              <strong>Avatar (100x100)</strong> — Profile pictures and user
              icons.
            </li>
            <li>
              <strong>Hero (1920x1080)</strong> — Full-width hero sections and
              desktop backgrounds.
            </li>
            <li>
              <strong>Mobile (375x667)</strong> — Mobile screen mockups and app
              design.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supported Formats
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This tool generates images in three formats: PNG for lossless quality
            with transparency support, JPEG for smaller file sizes ideal for
            photographs and web use, and WebP for modern browsers with excellent
            compression. All images are generated entirely in your browser using
            the Canvas API — no data is uploaded to any server.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Placeholder Image Generator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://favicon-generator-psi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Favicon Generator</a>
              <a href="https://image-compressor-eight-tawny.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Image Compressor</a>
              <a href="https://svg-to-png-six.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">SVG to PNG</a>
              <a href="https://qr-generator-ten-wheat.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">QR Code Generator</a>
              <a href="https://aspect-ratio-pi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Aspect Ratio Calculator</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools →</a>
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
