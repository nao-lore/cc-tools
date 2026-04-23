import AspectCropCalculator from "./components/AspectCropCalculator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#7c5cfc] to-[#ff6b9d]" />
            <span className="font-semibold text-foreground">image-aspect-crop</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Image Aspect Ratio Crop Calculator
          </h1>
          <p className="text-muted text-lg">
            Enter your image dimensions and target aspect ratio to get precise crop coordinates.
            Choose a crop position or center-crop automatically.
          </p>
        </div>

        <AspectCropCalculator />

        <article className="mt-16 max-w-none space-y-6 text-muted">
          <h2 className="text-xl font-semibold text-foreground">
            How to Use the Aspect Ratio Crop Calculator
          </h2>
          <p>
            Enter your original image width and height in pixels, then select a target aspect ratio
            from the presets or type a custom ratio. The calculator instantly shows the crop
            dimensions and coordinates you need.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Crop Position</h3>
          <p>
            By default the crop is centered, keeping the subject in the middle of your image.
            You can also choose top-left, top-right, bottom-left, or bottom-right to preserve
            a specific corner of the original image.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Output Values</h3>
          <p>
            The result gives you four values: <code className="text-accent font-mono text-sm">x</code> and{" "}
            <code className="text-accent font-mono text-sm">y</code> (top-left corner of the crop area),
            plus <code className="text-accent font-mono text-sm">width</code> and{" "}
            <code className="text-accent font-mono text-sm">height</code> of the cropped region.
            These map directly to parameters used in image processing libraries like Sharp, ImageMagick,
            or the HTML5 Canvas <code className="text-accent font-mono text-sm">drawImage</code> API.
          </p>

          <h3 className="text-lg font-semibold text-foreground">Common Aspect Ratios</h3>
          <p>
            16:9 is the standard widescreen format used by YouTube, presentations, and most displays.
            4:3 is the classic photo and older monitor ratio. 1:1 is square, ideal for Instagram posts.
            3:2 matches most DSLR camera sensors. 21:9 is ultrawide cinematic format.
            9:16 is the vertical format for Instagram Reels, TikTok, and YouTube Shorts.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Image Aspect Ratio Crop Calculator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://image-color-picker.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Image Color Picker</a>
              <a href="https://image-metadata-viewer.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Image Metadata Viewer</a>
              <a href="https://unit-converter.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Unit Converter</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
