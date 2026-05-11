import { tools } from "@/lib/tools-config";
import { Faq, InfoCard, InfoSection, JsonLd, RelatedSection, ToolHeader, type FaqItem } from "@/components/ToolPageSections";
import YamlJsonConverter from "./components/YamlJsonConverter";

const faq: FaqItem[] = [
  { q: "Is YAML or JSON uploaded?", a: "No. Conversion, validation, formatting, reset, copy, and download actions run locally in your browser." },
  { q: "Can I convert both directions?", a: "Yes. Switch between YAML to JSON and JSON to YAML, then format or download the result." },
  { q: "What example data can I try?", a: "Try a small config object with name, version, scripts, and feature flags to check nested arrays and booleans." },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <ToolHeader eyebrow="Data format tools" title="YAML to JSON Converter" description="Convert YAML and JSON in both directions, validate parse errors, format output, reset input, copy results, or download files." tone="amber" noteTitle="Local conversion" note="Configuration data stays in the browser while parsing, validation, copy, download, and clear controls run." />
        <YamlJsonConverter />
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Bidirectional" body="Convert YAML to JSON or JSON to YAML without changing tools." />
          <InfoCard title="Validation feedback" body="Parse errors are shown in the editor so malformed config is easier to fix." />
          <InfoCard title="Download output" body="Export converted JSON or YAML after formatting and review." />
        </section>
        <InfoSection title="Conversion Notes" items={[["Config files", "Useful for Docker Compose, GitHub Actions, Kubernetes snippets, and app settings."], ["Manual review", "YAML anchors, tags, or advanced syntax may need review when converting to JSON."]]} />
        <Faq items={faq} />
        <RelatedSection links={[["/json-formatter", "JSON Formatter", "Format JSON"], ["/xml-formatter", "XML Formatter", "Format XML"], ["/json-to-csv", "JSON to CSV", "Export rows"], ["/sql-formatter", "SQL Formatter", "Format queries"]]} />
        <footer className="py-8 text-center text-xs text-slate-500">cc-tools publishes {toolCount} free online tools.</footer>
      </div>
      <JsonLd faq={faq} name="YAML to JSON Converter" description="Convert YAML and JSON locally with validation, labels, examples, reset, copy, and download controls." url="https://tools.loresync.dev/yaml-to-json" category="DeveloperApplication" />
    </main>
  );
}
