import TtsPreview from "./components/TtsPreview";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Text to Speech — Browser TTS Tool
          </h1>
          <p className="text-sm text-muted mt-1">
            Hear text spoken aloud using your browser's built-in Speech Synthesis. Select a voice, adjust rate and pitch, and check pronunciation instantly.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <TtsPreview />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>Advertisement</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">What is Text to Speech?</h2>
            <p>
              Text to Speech (TTS) converts written text into spoken audio using synthesised voices. Modern browsers include a built-in Speech Synthesis API that provides access to multiple voices in different languages and accents — no plugins or downloads required.
            </p>

            <h2 className="text-lg font-bold text-foreground">Check Pronunciation</h2>
            <p>
              This tool is ideal for checking how a word or phrase is pronounced, proofreading content by ear, and creating an accessible reading experience. Simply type or paste your text, choose a voice, and press Play.
            </p>

            <h2 className="text-lg font-bold text-foreground">Adjust Rate, Pitch & Volume</h2>
            <p>
              The rate slider controls speaking speed (0.5× to 2×), the pitch slider adjusts vocal tone (0.5 to 2), and the volume slider sets loudness (0 to 1). All changes take effect the next time you press Play.
            </p>

            <h2 className="text-lg font-bold text-foreground">Browser Support</h2>
            <p>
              Speech Synthesis is supported in all modern browsers including Chrome, Edge, Firefox, and Safari. Available voices vary by operating system and browser. If no voices appear, try a different browser or check your system's text-to-speech settings.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">TTS Pronunciation Checker — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Readability Score</a>
              <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Text Case Converter</a>
              <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Keyword Density</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">More Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
