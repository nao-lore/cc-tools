import PomodoroTimer from "./components/PomodoroTimer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Pomodoro Timer</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Focus · Short Break · Long Break — track your sessions
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <PomodoroTimer />

        {/* AdSense Placeholder */}
        <div className="mt-8 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm bg-white">
          <p>Advertisement</p>
        </div>

        {/* SEO Content */}
        <section className="mt-10 space-y-6 text-sm leading-relaxed text-gray-600">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">What is the Pomodoro Technique?</h2>
            <p>
              The Pomodoro Technique is a time management method developed by Francesco Cirillo in
              the late 1980s. It uses a timer to break work into focused intervals — traditionally
              25 minutes — separated by short breaks. After four intervals, a longer break is taken.
              The technique trains sustained concentration and builds resistance to internal and
              external interruptions.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">How to Use This Timer</h2>
            <p>
              Set your preferred work and break durations in Settings, then press Start. The timer
              automatically advances from work to short break to work, and triggers a long break
              after the configured number of sessions. Enable browser notifications to receive
              alerts when a session ends — useful when the tab is in the background. Completed
              sessions are counted daily and reset at midnight.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Customizing Your Intervals</h2>
            <p>
              The default 25-minute work session works well for most knowledge tasks, but research
              suggests optimal focus intervals vary by person and task type. Creative or deep work
              may benefit from longer 45–50 minute blocks; administrative tasks may work better
              with shorter 15–20 minute bursts. Experiment with the sliders to find your ideal
              rhythm. Short breaks of 5 minutes are enough to reset attention; long breaks of
              15–20 minutes allow deeper recovery.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Why Timeboxing Works</h2>
            <p>
              Breaking work into defined intervals creates a sense of urgency that reduces
              procrastination (Parkinson&apos;s Law: work expands to fill available time). Scheduled
              breaks prevent mental fatigue from accumulating. Tracking sessions provides visible
              progress, which sustains motivation throughout the day. Studies on deliberate practice
              show that most people can sustain genuine deep focus for only 4–5 hours daily —
              Pomodoro helps you spend that capacity wisely.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Pomodoro Timer — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Unit Converter
              </a>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Percentage Calculator
              </a>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                BMI Calculator
              </a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600"
            >
              More Free Tools →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
