import { tools } from "@/lib/tools-config";
import { Faq, InfoCard, InfoSection, JsonLd, RelatedSection, ToolHeader, type FaqItem } from "@/components/ToolPageSections";
import QrGenerator from "./components/QrGenerator";

const faq: FaqItem[] = [
  { q: "Is QR content uploaded?", a: "No. QR generation, preview, validation, reset, copy, PNG download, and SVG download run locally in your browser." },
  { q: "Which format should I download?", a: "Use PNG for quick sharing and SVG for print or layouts that need scalable vector output." },
  { q: "How do I make a reliable QR code?", a: "Keep content short, use strong contrast, leave margin around the code, and test the result on more than one device." },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <ToolHeader eyebrow="Generator tools" title="QR Code Generator" description="Create QR codes for URLs, text, email, phone, WiFi, and vCard data. Customize colors, validate readability, reset settings, and download PNG or SVG." tone="emerald" noteTitle="Local QR rendering" note="Encoded content stays in the browser while you preview, copy, download, and clear generated codes." />
        <QrGenerator />
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Useful examples" body="Start from URL, WiFi, email, phone, or vCard patterns before customizing." />
          <InfoCard title="Print-friendly SVG" body="Download vector QR codes for menus, flyers, labels, and event materials." />
          <InfoCard title="Validation mindset" body="Check contrast and scan the final code before publishing or printing." />
        </section>
        <InfoSection title="QR Code Notes" items={[["Shorter data scans faster", "Long text creates denser QR codes, so use short URLs when the printed size is small."], ["Contrast matters", "Dark foreground on a light background is the most reliable choice across phone cameras."]]} />
        <Faq items={faq} />
        <RelatedSection links={[["/uuid-generator", "UUID Generator", "Generate IDs"], ["/password-generator", "Password Generator", "Create secrets"], ["/favicon-generator", "Favicon Generator", "Build icons"], ["/image-to-base64", "Image to Base64", "Encode assets"]]} />
        <footer className="py-8 text-center text-xs text-slate-500">cc-tools publishes {toolCount} free online tools.</footer>
      </div>
      <JsonLd faq={faq} name="QR Code Generator" description="Generate QR codes locally with validation, reset, copy, PNG download, and SVG download controls." url="https://tools.loresync.dev/qr-generator" />
    </main>
  );
}
