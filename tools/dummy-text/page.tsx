import DummyTextGenerator from "./components/DummyTextGenerator";

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
            Placeholder Text Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate dummy text for your designs and prototypes. Choose from
            multiple text styles, customize length, and copy the output
            instantly.
          </p>
        </div>

        {/* Generator Tool */}
        <DummyTextGenerator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is Placeholder Text?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Placeholder text is filler content used in design mockups,
            prototypes, and layouts before the final copy is ready. It helps
            designers and developers visualize how text will look in a layout
            without being distracted by meaningful content. Placeholder text is
            widely used in web design, app development, print layouts, and
            presentation templates.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Use a Placeholder Text Generator?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Instead of copying and pasting the same text repeatedly, a
            placeholder text generator creates fresh, randomized content every
            time. This tool generates text by combining common English words
            into natural-looking sentences, making it easy to fill layouts with
            realistic-looking content. Unlike traditional filler text, the
            output uses everyday English words that are easy to scan.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Text Style Options
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Standard Filler</strong> — General-purpose placeholder
              text using common English words. Great for most design work.
            </li>
            <li>
              <strong>Technical Jargon</strong> — Text filled with technical
              and development terminology. Ideal for developer tool mockups
              and documentation layouts.
            </li>
            <li>
              <strong>Business Speak</strong> — Corporate and business-style
              filler text. Perfect for business presentations, reports, and
              enterprise application designs.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Tool
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Choose a text style</strong> — Standard, Technical, or
              Business.
            </li>
            <li>
              <strong>Set the output format</strong> — Paragraphs, Sentences,
              or Words only.
            </li>
            <li>
              <strong>Adjust the length</strong> — Number of paragraphs,
              sentences per paragraph, and words per sentence.
            </li>
            <li>
              <strong>Toggle HTML tags</strong> — Optionally wrap output in
              paragraph tags for direct use in HTML.
            </li>
            <li>
              <strong>Generate and copy</strong> — Click Generate, then copy
              with one click.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Use Cases
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Web design mockups and wireframes
            </li>
            <li>
              UI component development and testing
            </li>
            <li>
              Presentation and slide deck templates
            </li>
            <li>
              Print layout design in tools like Figma, Sketch, or InDesign
            </li>
            <li>
              Database seeding and test data generation
            </li>
            <li>
              Email template previews
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">dummy-text — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/word-counter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Word Counter</a>
              <a href="/markdown-preview" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Markdown Preview</a>
              <a href="/ascii-art" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">ASCII Art</a>
              <a href="/text-diff" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Text Diff</a>
              <a href="/mdtable" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">MD Table</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    </div>
  );
}
