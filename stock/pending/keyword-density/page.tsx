import KeywordDensity from "./components/KeywordDensity";

export default function Home() {
  return (
    <main className="flex-1">
      {/* Header */}
      <div className="py-10 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Keyword Density Analyzer
        </h1>
        <p className="opacity-70 max-w-xl mx-auto">
          Paste any text to instantly see keyword frequency, density, and top
          phrases. Filter stop words and click any keyword to highlight it.
        </p>
      </div>

      {/* Tool */}
      <div className="px-4 pb-8">
        <KeywordDensity />
      </div>

      {/* AdSense placeholder */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div
          className="rounded-lg border border-dashed p-8 text-center text-sm opacity-30"
          style={{ borderColor: "var(--border)" }}
        >
          Ad space
        </div>
      </div>

      {/* SEO content */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <article
          className="rounded-xl p-6 sm:p-8 border space-y-6 text-sm leading-relaxed opacity-80"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <section>
            <h2 className="text-lg font-bold mb-2">What is keyword density?</h2>
            <p>
              Keyword density is the percentage of times a word or phrase appears
              in a piece of text relative to the total word count. For example, if
              a 100-word article contains the word "SEO" five times, its keyword
              density is 5%. Search engines use this metric as one of many signals
              to understand what a page is about.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">How to use this tool</h2>
            <p>
              Paste your content into the text area. The analyzer instantly
              calculates total word count, unique word count, and average word
              length. Switch between the Single Words, 2-Word Phrases, and 3-Word
              Phrases tabs to explore different levels of keyword analysis. Toggle
              the stop word filter to hide common English words like "the", "and",
              and "is" that carry little SEO value. Click any single keyword row to
              highlight every occurrence in your original text.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">Ideal keyword density</h2>
            <p>
              Most SEO practitioners recommend keeping primary keyword density
              between 1% and 3%. Overusing a keyword (keyword stuffing) can lead
              to search engine penalties. Underusing it may mean the page does not
              rank for the intended term. Multi-word phrases (bigrams and trigrams)
              help capture long-tail search intent and typically appear at lower
              densities — often under 1%.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2">Stop words explained</h2>
            <p>
              Stop words are common function words such as "a", "the", "in", "of",
              and "is" that appear in almost every piece of text. They add little
              semantic value to keyword analysis. Filtering them out surfaces the
              meaningful content words that actually drive search relevance. This
              tool includes a curated list of the most common English stop words,
              togglable with a single switch.
            </p>
          </section>
        </article>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Keyword Density Analyzer — Free online SEO tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://word-counter-delta-lemon.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Word Counter
              </a>
              <a
                href="https://sitemap-generator-phi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Sitemap Generator
              </a>
              <a
                href="https://readme-generator-gray.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                README Generator
              </a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a
              href="https://cc-tools.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600"
            >
              53+ Free Tools →
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
