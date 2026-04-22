import TypingSpeedTest from "./components/TypingSpeedTest";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Typing Speed Test
          </h1>
          <p className="text-sm text-muted mt-1">
            Measure your WPM and accuracy — choose easy, medium, or hard difficulty and start typing instantly
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <TypingSpeedTest />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>Advertisement</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">What is WPM?</h2>
            <p>
              Words per minute (WPM) is the standard measure of typing speed. It is calculated by dividing the number of words typed by the time taken in minutes. A "word" is conventionally defined as five characters, though this tool counts actual space-separated words in the sample text for a more intuitive result.
            </p>

            <h2 className="text-lg font-bold text-foreground">Average Typing Speeds</h2>
            <p>
              The average person types between 38 and 45 WPM. Proficient office workers typically reach 60–75 WPM. Professional typists and experienced programmers often exceed 80–100 WPM. Top competitive typists can exceed 150 WPM with near-perfect accuracy. Most people find that consistent daily practice of 15–20 minutes improves speed noticeably within a few weeks.
            </p>

            <h2 className="text-lg font-bold text-foreground">How Accuracy Is Calculated</h2>
            <p>
              Accuracy is the percentage of characters typed correctly relative to the total characters in the target text. Even a single mistyped character counts as an error. High accuracy at moderate speed is generally more valuable than high speed with many errors, since correcting mistakes takes additional time in real-world writing tasks.
            </p>

            <h2 className="text-lg font-bold text-foreground">Tips to Improve Typing Speed</h2>
            <p>
              Focus on accuracy first — speed follows naturally. Keep your fingers on the home row (ASDF / JKL;) and avoid looking at the keyboard. Use all ten fingers rather than hunting and pecking. Practice with text that challenges you slightly beyond your comfort zone. Taking short, frequent practice sessions beats long infrequent ones for building muscle memory.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Typing Speed Test — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Word Counter</a>
              <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Character Counter</a>
              <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Pomodoro Timer</a>
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
