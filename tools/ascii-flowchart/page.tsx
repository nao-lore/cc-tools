import AsciiFlowchart from "./components/AsciiFlowchart";

export default function Home() {
  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-2">ASCII Flowchart Generator</h1>
        <p className="text-[var(--muted-fg)] mb-8">
          Convert a simple node-edge list into an ASCII art flowchart using
          box-drawing characters. Perfect for READMEs, docs, and code comments.
        </p>

        <AsciiFlowchart />

        {/* AdSense placeholder */}
        <div className="mt-12 border border-dashed border-[var(--border)] rounded-lg p-6 text-center text-[var(--muted-fg)] text-sm">
          Ad Space
        </div>

        {/* SEO content */}
        <article className="mt-16 max-w-none text-[var(--muted-fg)] text-sm leading-relaxed space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            What Is an ASCII Flowchart?
          </h2>
          <p>
            An ASCII flowchart uses plain text characters — such as Unicode
            box-drawing symbols like{" "}
            <code className="bg-[var(--muted)] px-1 rounded">┌</code>,{" "}
            <code className="bg-[var(--muted)] px-1 rounded">─</code>, and{" "}
            <code className="bg-[var(--muted)] px-1 rounded">▼</code> — to draw
            flow diagrams that render correctly in any monospace environment.
            They are ideal for README files, inline code comments, terminal
            output, and documentation where rich graphics are unavailable.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            DSL Syntax
          </h2>
          <p>
            Write one rule per line. Use{" "}
            <code className="bg-[var(--muted)] px-1 rounded">-&gt;</code> to
            connect two nodes:{" "}
            <code className="bg-[var(--muted)] px-1 rounded">
              Start -&gt; Process
            </code>
            . Add an optional label by placing it between the two arrows:{" "}
            <code className="bg-[var(--muted)] px-1 rounded">
              Decision -&gt; Yes -&gt; End
            </code>
            . Chain multiple nodes in one line:{" "}
            <code className="bg-[var(--muted)] px-1 rounded">
              A -&gt; B -&gt; C
            </code>
            .
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Node Shapes
          </h2>
          <p>
            Node shapes are inferred from the name. Nodes named{" "}
            <strong>Start</strong>, <strong>End</strong>, <strong>Begin</strong>
            , or <strong>Stop</strong> render as rounded terminals using{" "}
            <code className="bg-[var(--muted)] px-1 rounded">╭╮╰╯</code>.
            Nodes whose names contain <strong>Decision</strong>,{" "}
            <strong>Check</strong>, or <strong>?</strong> render as diamond
            shapes. All other nodes render as standard process boxes with{" "}
            <code className="bg-[var(--muted)] px-1 rounded">┌┐└┘</code>
            corners.
          </p>

          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Common Use Cases
          </h2>
          <p>
            Documenting API request lifecycles, illustrating CI/CD pipeline
            stages, explaining algorithm logic in code comments, mapping
            user-flow decision trees in product specs, and generating quick
            architecture sketches that can be committed alongside code. All
            processing runs entirely in your browser — no data is sent to a
            server.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            ASCII Flowchart Generator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://ascii-table-generator.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                ASCII Table Generator
              </a>
              <a
                href="https://gitflow-visualizer.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Gitflow Visualizer
              </a>
              <a
                href="https://diff-viewer.nao-lore.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Diff Viewer
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

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "ASCII Flowchart Generator",
            description:
              "Generate ASCII art flowcharts from simple node-edge definitions. Box-drawing characters. Perfect for READMEs. Free online tool.",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />
    </>
  );
}
