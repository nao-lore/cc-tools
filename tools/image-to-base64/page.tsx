import { tools } from "@/lib/tools-config";
import {
  Faq,
  InfoCard,
  InfoSection,
  JsonLd,
  RelatedSection,
  ToolHeader,
  type FaqItem,
} from "@/components/ToolPageSections";
import ImageToBase64 from "./components/ImageToBase64";

const faq: FaqItem[] = [
  {
    q: "Are uploaded images sent to a server?",
    a: "No. The file is read by your browser with the File API, and the generated Base64 output stays on your device unless you copy it elsewhere.",
  },
  {
    q: "When should I use Base64 images?",
    a: "Use Base64 for small icons, placeholders, email snippets, or single-file demos. Larger images are usually better as normal files with caching.",
  },
  {
    q: "Why is the Base64 output larger than the image file?",
    a: "Base64 encoding adds about one third of size overhead because binary data is represented as text characters.",
  },
  {
    q: "Which output format should I copy?",
    a: "Use Data URI for HTML image sources and CSS backgrounds, raw Base64 for API payloads, and the HTML/CSS snippets for quick paste workflows.",
  },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <ToolHeader
          eyebrow="Image and encoding tools"
          title="Image to Base64 Converter"
          description="Convert PNG, JPG, GIF, SVG, WebP, and ICO files into Base64 strings, Data URIs, CSS snippets, or HTML img tags directly in your browser."
          noteTitle="Local file processing"
          note="Images are read in the browser. The tool does not upload your files or generated output."
          tone="cyan"
        />

        <ImageToBase64 />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Multiple outputs" body="Copy raw Base64, a Data URI, CSS background-image, or an HTML img tag." />
          <InfoCard title="Preview before copying" body="Check file name, type, dimensions, and encoded size before using the output." />
          <InfoCard title="Small asset friendly" body="Best for icons, placeholders, email snippets, and portable single-file examples." />
        </section>

        <InfoSection
          title="Base64 Image Notes"
          items={[
            [
              "Size tradeoff",
              "Base64 normally increases payload size by about 33%. For large media, a normal image URL with cache headers is usually faster.",
            ],
            [
              "Data URI usage",
              "A Data URI includes the MIME type and Base64 content in one string, so it can be pasted into an HTML src attribute or CSS url() value.",
            ],
            [
              "Privacy",
              "The conversion runs locally with browser APIs. The file content is not submitted to cc-tools during conversion.",
            ],
            [
              "Validation",
              "If a file cannot be read as an image, the tool reports an error instead of generating a broken snippet.",
            ],
          ]}
        />

        <Faq items={faq} />
        <RelatedSection
          links={[
            ["/base64-tools", "Base64 Tools", "Encode and decode text or files"],
            ["/svg-to-png", "SVG to PNG", "Rasterize SVG artwork"],
            ["/image-compressor", "Image Compressor", "Reduce image file size"],
            ["/favicon-generator", "Favicon Generator", "Create browser icons"],
          ]}
        />

        <footer className="py-8 text-center text-xs text-slate-500">
          cc-tools includes {toolCount} free online tools.
        </footer>
      </div>

      <JsonLd
        faq={faq}
        name="Image to Base64 Converter"
        description="Convert image files to Base64, Data URI, CSS, and HTML snippets in the browser."
        url="https://tools.loresync.dev/image-to-base64"
        inLanguage="en"
      />
    </main>
  );
}
