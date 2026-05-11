import { tools } from "@/lib/tools-config";
import { Faq, InfoCard, InfoSection, JsonLd, RelatedSection, ToolHeader, type FaqItem } from "@/components/ToolPageSections";
import AsciiFlowchart from "./components/AsciiFlowchart";

const faq: FaqItem[] = [
  { q: "Is the flowchart text uploaded?", a: "No. Parsing, validation, rendering, reset, and copy actions run locally in your browser." },
  { q: "What syntax does the generator use?", a: "Use lines such as Start -> Process -> Decision. A three-part line like Decision -> Yes -> End creates a labeled branch." },
  { q: "Where can I use ASCII diagrams?", a: "They work well in READMEs, code comments, terminal notes, pull requests, and plain-text documentation." },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <ToolHeader eyebrow="ASCII documentation" title="ASCII Flowchart Generator" description="Convert node-edge text into ASCII flowcharts, validate syntax, reset examples, and copy diagrams for README files or code comments." tone="slate" noteTitle="Plain-text output" note="Diagram parsing, rendering, validation, copy, and clear controls stay in the browser." />
        <AsciiFlowchart />
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Simple DSL" body="Write Start -> Process -> End and let the renderer build the box diagram." />
          <InfoCard title="Branch labels" body="Use Decision -> Yes -> End to show labeled edges in text documentation." />
          <InfoCard title="Copy diagrams" body="Copy the final ASCII chart into READMEs, issues, or terminal output." />
        </section>
        <InfoSection title="Diagram Notes" items={[["Monospace required", "ASCII diagrams line up correctly in code blocks and monospace fonts."], ["Keep labels short", "Short node names make generated flowcharts easier to scan in narrow layouts."]]} />
        <Faq items={faq} />
        <RelatedSection links={[["/ascii-art", "ASCII Art", "Generate text art"], ["/markdown-preview", "Markdown Preview", "Preview docs"], ["/mdtable", "Markdown Table", "Build tables"], ["/text-diff", "Text Diff", "Compare changes"]]} />
        <footer className="py-8 text-center text-xs text-slate-500">cc-tools publishes {toolCount} free online tools.</footer>
      </div>
      <JsonLd faq={faq} name="ASCII Flowchart Generator" description="Generate ASCII flowcharts locally with examples, validation, reset, copy, and browser-only rendering." url="https://tools.loresync.dev/ascii-flowchart" category="DeveloperApplication" />
    </main>
  );
}
