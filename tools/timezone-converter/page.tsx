import TimezoneConverter from "./components/TimezoneConverter";

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
            Time Zone Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert time between any time zones worldwide. Compare multiple
            zones at once, check DST status, and find the current time anywhere.
          </p>
        </div>

        {/* Timezone Converter Tool */}
        <TimezoneConverter />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a Time Zone?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A time zone is a region of the globe that observes a uniform
            standard time for legal, commercial, and social purposes. Time zones
            are based on the concept of dividing the Earth into 24 longitudinal
            segments, each offset from Coordinated Universal Time (UTC). In
            practice, time zone boundaries follow country and regional borders
            rather than strict longitude lines.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How Time Zone Conversion Works
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Converting time between zones involves calculating the difference in
            UTC offsets. For example, if it is 3:00 PM in New York (UTC-5) and
            you want to know the time in Tokyo (UTC+9), you add 14 hours to get
            5:00 AM the next day. This tool handles all the math automatically,
            including edge cases like date changes and Daylight Saving Time
            transitions.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Understanding Daylight Saving Time (DST)
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Many regions observe Daylight Saving Time, shifting clocks forward
            by one hour in spring and back in fall. This means UTC offsets change
            throughout the year. Not all countries observe DST, and those that do
            may switch on different dates. This converter shows a DST indicator
            for each timezone so you always know when DST is in effect.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Time Zone Converter
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Select your source timezone</strong> from the dropdown.
              Popular timezones like UTC, Eastern, Pacific, and Tokyo appear at
              the top for quick access.
            </li>
            <li>
              <strong>Set the time and date</strong> you want to convert. The
              tool defaults to the current time.
            </li>
            <li>
              <strong>View converted times</strong> in the target zones below.
              Each zone shows the converted time, date, UTC offset, and DST
              status.
            </li>
            <li>
              <strong>Add more timezones</strong> by clicking the &quot;Add
              timezone&quot; button to compare as many zones as you need.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Time Zone Conversions
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Some of the most frequently converted time zones include EST to PST
            (subtract 3 hours), UTC to EST (subtract 5 hours, or 4 during DST),
            EST to JST (add 14 hours), and GMT to CET (add 1 hour). Whether you
            are scheduling meetings across continents or coordinating with
            remote teams, this tool makes it easy to find the right time in any
            zone.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">timezone-converter — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/epoch-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Epoch Converter</a>
              <a href="/cron-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Cron Generator</a>
              <a href="/eigyoubi" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Eigyoubi</a>
              <a href="/wareki-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Wareki Converter</a>
              <a href="/aspect-ratio" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Aspect Ratio</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools &rarr;</a>
          </div>
        </div>
      </footer>

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Time Zone Converter",
  "description": "Convert time between any time zones worldwide. Compare multiple\n            zones at once, check DST status, and find the current time anywhere.",
  "url": "https://tools.loresync.dev/timezone-converter",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
