import ReadingTime from "./components/ReadingTime";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Reading Time Estimator
          </h1>
          <p className="text-sm text-muted mt-1">
            Estimate reading time for any text — word count, sentence count, paragraph count, and speaking time included
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <ReadingTime />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>Advertisement</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">How Reading Time Is Calculated</h2>
            <p>
              Reading time is estimated by dividing the total word count by your selected reading speed in words per minute (WPM). The average adult reads silently at around 200–250 WPM, while speed readers can reach 400 WPM or more. This tool lets you select a preset or drag the slider to match your own pace.
            </p>

            <h2 className="text-lg font-bold text-foreground">What Is a Normal Reading Speed?</h2>
            <p>
              Research suggests the average adult reads between 200 and 250 words per minute for non-fiction prose. Children typically read slower (100–150 WPM), while trained speed readers can sustain 400–600 WPM with good comprehension. For technical content such as academic papers or code documentation, most people slow to 100–150 WPM.
            </p>

            <h2 className="text-lg font-bold text-foreground">Speaking Time vs Reading Time</h2>
            <p>
              Speaking aloud is generally slower than silent reading. The average conversational speaker delivers around 130 words per minute, which is also the standard rate used for podcast production and audiobook narration. This tool calculates your speaking time separately so you can estimate presentation length, podcast scripts, or speech duration alongside reading time.
            </p>

            <h2 className="text-lg font-bold text-foreground">Why Word Count Matters for Content</h2>
            <p>
              Word count and reading time are key metrics for content creators, bloggers, and educators. A typical blog post reads in 3–7 minutes (600–1,400 words). Long-form articles above 2,000 words average about 10 minutes. Academic papers and essays often run 20–30 minutes. Knowing your reading time helps set audience expectations and improves engagement.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Reading Time Estimator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Word Counter</a>
              <a href="/" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Character Counter</a>
              <a href="/" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Text Formatter</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">More Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
