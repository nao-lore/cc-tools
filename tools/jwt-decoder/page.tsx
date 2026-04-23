import JwtDecoder from "./components/JwtDecoder";
import SeoContent from "./components/SeoContent";

export default function Home() {
  return (
    <main className="flex-1">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            JWT Decoder
          </h1>
          <p className="text-muted text-sm sm:text-base max-w-2xl mx-auto">
            Decode, inspect, and validate JSON Web Tokens instantly in your browser.
            No data is sent to any server &mdash; 100% client-side.
          </p>
        </div>

        {/* Decoder Tool */}
        <JwtDecoder />

        {/* AdSense Placeholder */}
        <div className="border border-dashed border-border rounded-lg p-6 text-center text-muted text-xs">
          Advertisement Placeholder
        </div>

        {/* SEO Content */}
        <SeoContent />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-10">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            JWT Decoder — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/base64-tools" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Base64 Tools</a>
              <a href="/json-formatter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
              <a href="/hash-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Hash Generator</a>
              <a href="/url-encoder" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">URL Encoder</a>
              <a href="/epoch-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Epoch Converter</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
