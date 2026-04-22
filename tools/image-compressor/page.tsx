import ImageCompressor from "./components/ImageCompressor";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xl font-bold text-gray-900">Image Compressor</span>
          </div>
          <span className="text-xs text-gray-400">100% Client-Side</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <section className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Image Compressor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compress JPEG, PNG, and WebP images right in your browser.
            No uploads to any server — your files stay private.
          </p>
        </section>

        {/* Compressor Tool */}
        <ImageCompressor />

        {/* AdSense Placeholder */}
        <div className="max-w-6xl mx-auto mt-12 mb-8">
          <div className="bg-gray-100 border border-dashed border-gray-300 rounded-xl h-24 flex items-center justify-center text-sm text-gray-400">
            Ad Space
          </div>
        </div>

        {/* SEO Content */}
        <section className="max-w-3xl mx-auto mt-12 mb-16 prose prose-gray">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Why Compress Images?
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Image compression is essential for web performance. Large, unoptimized images
            are one of the biggest contributors to slow page load times. When visitors
            encounter a slow website, they leave — studies show that a one-second delay
            in load time can reduce conversions by up to 7%. By compressing your images
            before uploading them to your website, blog, or social media, you ensure
            faster loading, better user experience, and improved SEO rankings.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Understanding Image Formats
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            <strong>JPEG</strong> is the most widely used format for photographs and
            complex images. It uses lossy compression, meaning some image data is
            discarded to achieve smaller file sizes. JPEG is ideal for photos where
            slight quality loss is acceptable in exchange for dramatically smaller files.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            <strong>PNG</strong> uses lossless compression, preserving every pixel of
            the original image. This makes PNG perfect for graphics with sharp edges,
            text overlays, logos, and images that require transparency. The trade-off
            is larger file sizes compared to JPEG for photographic content.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            <strong>WebP</strong> is a modern format developed by Google that provides
            both lossy and lossless compression. WebP images are typically 25-35% smaller
            than equivalent JPEG or PNG files while maintaining comparable visual quality.
            Most modern browsers support WebP, making it an excellent choice for web
            optimization.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            How This Tool Works
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            This image compressor runs entirely in your browser using the HTML5 Canvas
            API. When you select an image, it is loaded into a canvas element, optionally
            resized to your specified dimensions, and then exported in your chosen format
            with the quality level you set. No data is ever sent to a server — the
            entire compression process happens on your device, ensuring complete privacy.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Tips for Best Results
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            For photographs, try WebP at 75-85% quality for the best balance of size
            and visual fidelity. For graphics and screenshots, PNG preserves sharpness
            but consider WebP lossless for smaller sizes. Use the max width and height
            options to resize large images — a 4000px wide image displayed at 800px on
            your website wastes bandwidth. Batch processing lets you compress an entire
            folder of images at once, saving time on bulk optimization tasks.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Privacy and Security
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Your images never leave your device. Unlike server-based compression tools,
            this compressor processes everything locally in your browser using JavaScript
            and the Canvas API. There are no uploads, no cookies tracking your files,
            and no data retention. Once you close the page, all processed images are
            cleared from memory. This makes it safe to compress sensitive or private
            images without any risk of data exposure.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Image Compressor — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://svg-to-png-six.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">SVG to PNG</a>
              <a href="https://image-to-base64-five.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Image to Base64</a>
              <a href="https://favicon-generator-psi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Favicon Generator</a>
              <a href="https://placeholder-image-fmq8sxvq6-naos-projects-52ff71e9.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Placeholder Image</a>
              <a href="https://qr-generator-ten-wheat.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">QR Generator</a>
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
