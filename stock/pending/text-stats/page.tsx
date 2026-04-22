import TextStats from "./components/TextStats";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Text Statistics Dashboard
          </h1>
          <p className="text-sm text-muted mt-1">
            Paste any text to get word frequency, sentence length, lexical diversity, and complexity metrics instantly
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <TextStats />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>Advertisement</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">What is Lexical Diversity?</h2>
            <p>
              Lexical diversity measures the range of vocabulary used in a text. It is calculated by dividing the number of unique words (types) by the total number of words (tokens). A score of 1.0 means every word is unique; a lower score indicates repetition. Academic writing typically scores above 0.7, while conversational speech often falls between 0.4 and 0.6.
            </p>

            <h2 className="text-lg font-bold text-foreground">Reading Level Estimation</h2>
            <p>
              This tool uses the Flesch Reading Ease formula, which considers average sentence length and average number of syllables per word. Texts with shorter sentences and simpler words score higher (easier to read). The score is mapped to approximate US grade levels, from 5th grade (very easy) to professional/academic (very difficult).
            </p>

            <h2 className="text-lg font-bold text-foreground">Word Frequency Analysis</h2>
            <p>
              The top 20 most frequent words table excludes common stop words such as "the", "and", "is", and prepositions, focusing instead on meaningful content words. The bar visualization shows relative frequency at a glance, making it easy to spot key themes or overused terms in your writing.
            </p>

            <h2 className="text-lg font-bold text-foreground">Sentence Length Distribution</h2>
            <p>
              Varied sentence length makes writing more engaging. A histogram of sentence lengths helps you identify if your writing is monotonous (all bars in the same bucket) or dynamic (spread across multiple ranges). Most style guides recommend mixing short punchy sentences with longer complex ones for readability.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Text Statistics Dashboard — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Word Counter</a>
              <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Case Converter</a>
              <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Lorem Ipsum Generator</a>
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
