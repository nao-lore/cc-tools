import WorldClock from "./components/WorldClock";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              🌍
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">World Clock</h1>
              <p className="text-xs text-gray-500">Multiple time zones · Live updating · UTC offset · DST status</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <WorldClock />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Free World Clock — Multiple Time Zones at a Glance</h2>
            <p>
              Track the current time across multiple cities and time zones simultaneously. This free world
              clock updates every second and displays each location&apos;s date, time, UTC offset, AM/PM
              indicator, and whether Daylight Saving Time (DST) is currently in effect. Add any city by
              searching the full IANA timezone database — over 400 locations worldwide.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">What Is UTC Offset?</h2>
            <p>
              UTC (Coordinated Universal Time) is the primary time standard by which the world regulates
              clocks. A UTC offset such as UTC+9 means the local time is 9 hours ahead of UTC. Offsets
              range from UTC−12 to UTC+14. Many time zones shift their offset by one hour during Daylight
              Saving Time — this tool detects DST automatically and shows you the current effective offset.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Daylight Saving Time (DST) Explained</h2>
            <p>
              Daylight Saving Time is the practice of advancing clocks during summer months so that
              darkness falls later each day. Not all countries observe DST — Japan, China, and most of
              Africa do not. Countries that do observe it (such as the US, UK, and most of Europe) switch
              on different dates, which can temporarily change the time difference between two locations.
              This clock shows a DST badge whenever a location is currently observing DST.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Reorder &amp; Customize Your Clocks</h2>
            <p>
              Drag clock cards to reorder them, or use the up/down buttons. Remove any clock you no longer
              need with the × button. Your selection and order are saved automatically in your browser via
              localStorage — no account required. Clocks are restored exactly as you left them on your
              next visit.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">World Clock — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://crontab-validator-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Crontab Validator</a>
              <a href="https://compound-interest-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Compound Interest</a>
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
