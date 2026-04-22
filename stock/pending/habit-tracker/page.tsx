import HabitTracker from "./components/HabitTracker";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              📅
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Habit Tracker</h1>
              <p className="text-xs text-gray-500">Streak calendar · Heatmap · Local storage · Up to 10 habits</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <HabitTracker />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">How to Use This Habit Tracker</h2>
            <p>
              Add up to 10 habits with a name and a color. Each day, click &quot;Mark Done&quot; to log your
              completion. The app automatically calculates your current streak, longest streak, 30-day
              completion rate, and total completions — all updated instantly as you check off habits.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">GitHub-Style Heatmap</h2>
            <p>
              Click the arrow on any habit to expand its heatmap — a 52-week × 7-day grid showing
              every day of the past year. Days you completed the habit appear in your chosen color;
              missed days are light gray. The darker the cell, the more recent the completion. Hover
              any cell to see the exact date and whether you completed that habit.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Your Data Stays on Your Device</h2>
            <p>
              All habit data is stored in your browser&apos;s localStorage — nothing is sent to any
              server. Your streaks and history persist across browser sessions as long as you use the
              same browser. No account required, no ads, completely free.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Understanding Streaks</h2>
            <p>
              Your <strong>current streak</strong> counts consecutive days you completed the habit,
              ending today (or yesterday if you haven&apos;t checked in yet today).
              The <strong>longest streak</strong> is the best consecutive run you&apos;ve ever achieved.
              The <strong>completion rate</strong> shows what percentage of the last 30 days you completed
              the habit — a quick measure of consistency.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Habit Tracker — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://water-intake-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-800 px-2 py-1 bg-green-50 rounded">Water Intake Tracker</a>
              <a href="https://calorie-burn-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-800 px-2 py-1 bg-green-50 rounded">Calorie Burn Calculator</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
