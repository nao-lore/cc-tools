import MeetingPlanner from "./components/MeetingPlanner";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              🌍
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Meeting Time Planner</h1>
              <p className="text-xs text-gray-500">Time zone overlap · Suggested meeting times · Visual timeline</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <MeetingPlanner />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Free Meeting Time Zone Planner</h2>
            <p>
              Planning meetings across multiple time zones is one of the most common challenges for global
              teams. This tool lets you add team members with their time zones and working hours, then
              instantly shows you when everyone is available at the same time. No more manual time zone
              conversions or missed meetings due to scheduling errors.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">How to Find the Best Meeting Time</h2>
            <p>
              Add each team member, select their time zone, and set their working hours (defaults to
              9 AM – 5 PM). The visual 24-hour timeline shows each person's working hours as a colored
              bar. Green zones highlight hours when all team members are simultaneously available.
              Suggested meeting times are listed with each member's local time for easy scheduling.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Handling Next-Day Overlaps</h2>
            <p>
              When working hours cross midnight in UTC (e.g., a team member in Tokyo whose 9 AM is
              the previous UTC day), this tool correctly handles next-day wrapping so you always see
              accurate overlap windows. The timeline clearly indicates when working hours extend past
              midnight into the following day.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Tips for Scheduling Global Meetings</h2>
            <p>
              Rotate meeting times fairly so no single team member always bears the inconvenience of
              early morning or late evening calls. When no overlap exists during standard hours, consider
              expanding working hours slightly or using async communication tools for non-urgent matters.
              Aim for the earliest overlap window to maximize productive hours for all participants.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Meeting Time Planner — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://timestamp-converter-jp-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Timestamp Converter</a>
              <a href="https://unit-converter-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Unit Converter</a>
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
