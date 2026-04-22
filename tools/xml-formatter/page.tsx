import XmlFormatter from "./components/XmlFormatter";

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
            XML Formatter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Format, beautify, validate, and minify XML online. Paste your XML,
            choose your indent style, and get clean output with syntax
            highlighting.
          </p>
        </div>

        {/* XML Formatter Tool */}
        <XmlFormatter />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is XML?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            XML (eXtensible Markup Language) is a markup language designed to
            store and transport structured data. It is widely used in web
            services, configuration files, data feeds, and document formats like
            SVG and XHTML. Unlike HTML, XML requires strict syntax: every tag
            must be closed, attributes must be quoted, and elements must be
            properly nested.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Format XML?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Raw XML from APIs, logs, or configuration files is often minified or
            poorly indented, making it hard to read and debug. Formatting XML
            with proper indentation and line breaks makes the structure visible
            at a glance. This tool adds consistent indentation, places each
            element on its own line, and applies syntax highlighting so you can
            quickly spot tags, attributes, and values.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This XML Formatter
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Paste your XML</strong> into the input panel on the left.
            </li>
            <li>
              <strong>Choose indent style</strong> from the dropdown: 2 spaces,
              4 spaces, or tab.
            </li>
            <li>
              <strong>Click Format</strong> to beautify the XML with proper
              indentation and syntax highlighting.
            </li>
            <li>
              <strong>Click Minify</strong> to compress the XML by removing all
              unnecessary whitespace.
            </li>
            <li>
              <strong>Click Validate</strong> to check if the XML is
              well-formed. Errors include line and column information.
            </li>
            <li>
              <strong>Click Copy</strong> to copy the formatted output to your
              clipboard.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Features
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Syntax highlighting</strong> with color-coded tags,
              attributes, values, and comments.
            </li>
            <li>
              <strong>XML validation</strong> using the browser&apos;s built-in
              DOMParser with detailed error messages.
            </li>
            <li>
              <strong>Minification</strong> to reduce file size by stripping
              whitespace.
            </li>
            <li>
              <strong>Configurable indentation</strong> with 2 spaces, 4 spaces,
              or tab characters.
            </li>
            <li>
              <strong>Character and line counts</strong> for both input and
              output panels.
            </li>
            <li>
              <strong>100% client-side</strong> processing. Your XML never
              leaves your browser.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common XML Use Cases
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            XML is used in SOAP web services, RSS and Atom feeds, Android
            layouts, Maven and Gradle build files, SVG graphics, Microsoft
            Office documents (OOXML), XSLT transformations, and many enterprise
            integration formats. This formatter handles all standard XML
            including declarations, comments, CDATA sections, and namespaced
            elements.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">xml-formatter — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://json-formatter-topaz-pi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
              <a href="https://sql-formatter-liart.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">SQL Formatter</a>
              <a href="https://yaml-to-json-theta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">YAML to JSON</a>
              <a href="https://html-to-markdown-kappa.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTML to Markdown</a>
              <a href="https://html-entity-sigma.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTML Entity</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools &rarr;</a>
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
