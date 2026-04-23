import EpochConverter from "./components/EpochConverter";

export default function Home() {
  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-900">
          Unix Timestamp Converter
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Convert between Unix epoch timestamps and human-readable dates
          instantly.
        </p>

        <EpochConverter />

        {/* SEO Content Section */}
        <section className="max-w-4xl mx-auto mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a Unix Timestamp?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A Unix timestamp (also known as Epoch time, POSIX time, or Unix
            Epoch) is a system for tracking time as a running count of seconds
            since the Unix Epoch. The Unix Epoch is defined as January 1, 1970,
            at 00:00:00 UTC. This date was chosen as a convenient reference
            point when the Unix operating system was being developed at Bell
            Labs in the early 1970s.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Unlike human-readable date formats that vary by culture, language,
            and timezone, Unix timestamps provide a single, unambiguous number
            that represents a specific moment in time. This makes them
            invaluable in computing for storing dates in databases, comparing
            timestamps across systems, synchronizing distributed applications,
            and handling time calculations without worrying about daylight
            saving time transitions or timezone differences.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
            How Does Unix Time Work?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Unix time counts the number of seconds that have elapsed since the
            epoch (January 1, 1970, 00:00:00 UTC), not counting leap seconds.
            For example, the timestamp{" "}
            <code className="bg-gray-100 px-1 rounded">1700000000</code>{" "}
            represents November 14, 2023, at 22:13:20 UTC. Negative timestamps
            represent dates before the epoch &mdash; for instance,{" "}
            <code className="bg-gray-100 px-1 rounded">-86400</code> represents
            December 31, 1969.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Many modern systems also use millisecond precision, resulting in
            13-digit timestamps. JavaScript&apos;s{" "}
            <code className="bg-gray-100 px-1 rounded">Date.now()</code>{" "}
            returns milliseconds since the epoch. Our converter automatically
            detects whether your input is in seconds or milliseconds, or you
            can use the toggle to switch manually.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
            Common Unix Timestamps Reference
          </h2>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-2 border border-gray-200 font-semibold">
                    Timestamp
                  </th>
                  <th className="text-left px-4 py-2 border border-gray-200 font-semibold">
                    Date (UTC)
                  </th>
                  <th className="text-left px-4 py-2 border border-gray-200 font-semibold">
                    Significance
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["0", "Jan 1, 1970 00:00:00", "Unix Epoch"],
                  ["1000000000", "Sep 9, 2001 01:46:40", "1 billionth second"],
                  ["1234567890", "Feb 13, 2009 23:31:30", "Sequential digits"],
                  ["1700000000", "Nov 14, 2023 22:13:20", "1.7 billion"],
                  ["2000000000", "May 18, 2033 03:33:20", "2 billionth second"],
                  [
                    "2147483647",
                    "Jan 19, 2038 03:14:07",
                    "Y2K38 (max 32-bit signed int)",
                  ],
                  [
                    "4294967295",
                    "Feb 7, 2106 06:28:15",
                    "Max 32-bit unsigned int",
                  ],
                ].map(([ts, date, note]) => (
                  <tr key={ts} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border border-gray-200 font-mono">
                      {ts}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {date}
                    </td>
                    <td className="px-4 py-2 border border-gray-200">
                      {note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
            The Year 2038 Problem (Y2K38)
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Year 2038 problem, often called Y2K38 or the Unix Millennium
            Bug, is a potential computing issue that affects systems storing
            Unix timestamps as 32-bit signed integers. The maximum value of a
            32-bit signed integer is 2,147,483,647, which corresponds to
            Tuesday, January 19, 2038, at 03:14:07 UTC. After this moment,
            32-bit systems will overflow, potentially wrapping around to a
            negative number and interpreting the date as December 13, 1901.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Modern 64-bit systems store timestamps as 64-bit integers, which
            can represent dates approximately 292 billion years into the future,
            effectively solving this problem. However, embedded systems, legacy
            databases, and older file formats that still rely on 32-bit
            timestamps may need to be updated before 2038.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
            Converting Timestamps in Programming Languages
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Most programming languages provide built-in functions for working
            with Unix timestamps. In JavaScript, use{" "}
            <code className="bg-gray-100 px-1 rounded">
              Math.floor(Date.now() / 1000)
            </code>{" "}
            to get the current timestamp in seconds, or{" "}
            <code className="bg-gray-100 px-1 rounded">
              new Date(timestamp * 1000)
            </code>{" "}
            to convert back to a date. In Python, the{" "}
            <code className="bg-gray-100 px-1 rounded">time.time()</code>{" "}
            function returns the current epoch, while{" "}
            <code className="bg-gray-100 px-1 rounded">
              datetime.fromtimestamp()
            </code>{" "}
            converts it to a datetime object. PHP offers{" "}
            <code className="bg-gray-100 px-1 rounded">time()</code> and{" "}
            <code className="bg-gray-100 px-1 rounded">date()</code>, Java uses{" "}
            <code className="bg-gray-100 px-1 rounded">
              System.currentTimeMillis()
            </code>{" "}
            (in milliseconds), and in Bash you can simply run{" "}
            <code className="bg-gray-100 px-1 rounded">date +%s</code>.
          </p>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Epoch Converter — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/cron-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Cron Generator</a>
              <a href="/timezone-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Timezone Converter</a>
              <a href="/binary-converter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Binary Converter</a>
              <a href="/uuid-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">UUID Generator</a>
              <a href="/chmod-calculator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Chmod Calculator</a>
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
