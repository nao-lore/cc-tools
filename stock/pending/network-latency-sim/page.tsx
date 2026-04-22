import NetworkLatencySim from "./components/NetworkLatencySim";

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
            Network Latency Simulator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Add your page resources, pick a network preset, and instantly see
            load times and a waterfall chart. Plan your loading UX before you
            ship.
          </p>
        </div>

        {/* Tool */}
        <NetworkLatencySim />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Simulate Network Latency?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Most developers build on fast broadband connections, but a large
            portion of users — especially in emerging markets or on mobile data
            — experience 2G or 3G speeds. Simulating these conditions before
            you deploy lets you identify the heaviest resources, prioritise
            critical assets, and design skeleton screens and progressive loading
            states that make your page feel fast even on slow connections.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How the Waterfall Works
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Browsers fetch page resources in a dependency-driven order. The HTML
            document must arrive first because it tells the browser what else to
            download. Once parsing begins, render-blocking resources — CSS,
            JavaScript, and web fonts — are requested in parallel. Only after
            those are resolved does the browser begin loading images and other
            deferred assets.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            This simulator models that three-phase waterfall: HTML → render-blocking
            (CSS / JS / Font in parallel) → images (in parallel). Each bar
            represents one request&apos;s duration, calculated as one round-trip
            time (RTT) plus the transfer time for the file at the selected
            bandwidth.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Network Preset Reference
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>2G</strong> — 50 kbps, 500 ms RTT. Typical for GPRS or
              EDGE connections in rural areas. Even a 100 KB page takes several
              seconds.
            </li>
            <li>
              <strong>3G</strong> — 1.5 Mbps, 100 ms RTT. Common on older
              smartphones or in congested urban cells.
            </li>
            <li>
              <strong>LTE</strong> — 12 Mbps, 30 ms RTT. Standard 4G mobile.
              Most resources load in well under a second.
            </li>
            <li>
              <strong>Cable</strong> — 50 Mbps, 10 ms RTT. Typical home
              broadband in developed markets.
            </li>
            <li>
              <strong>Fiber</strong> — 100 Mbps, 5 ms RTT. High-end wired
              connection; transfer time is negligible for most assets.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tips to Improve Load Performance
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Compress images</strong> — switch to WebP or AVIF and use
              responsive sizes. Images are often the largest resource on a page
              and load last, so reductions compound quickly.
            </li>
            <li>
              <strong>Code-split JavaScript</strong> — break large bundles into
              smaller chunks loaded on demand, reducing the amount of JS that
              blocks rendering.
            </li>
            <li>
              <strong>Self-host fonts</strong> — avoid third-party font latency
              and use <code>font-display: swap</code> to prevent invisible text
              during load.
            </li>
            <li>
              <strong>Inline critical CSS</strong> — a small inline style block
              lets the browser render the above-the-fold content immediately,
              without waiting for an external stylesheet.
            </li>
            <li>
              <strong>Use a CDN</strong> — serving assets from an edge location
              closer to the user reduces RTT, which has the biggest impact on
              slow connections where latency dominates transfer time.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Network Latency Simulator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://curl-converter-xi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">cURL Converter</a>
              <a href="https://http-header-builder-delta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTTP Header Builder</a>
              <a href="https://ip-calculator-theta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">IP Subnet Calculator</a>
              <a href="https://sitemap-generator-steel.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Sitemap Generator</a>
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
