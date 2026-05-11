import { tools } from "@/lib/tools-config";
import { Faq, InfoCard, InfoSection, JsonLd, RelatedSection, ToolHeader, type FaqItem } from "@/components/ToolPageSections";
import SvgConverter from "./components/SvgConverter";

const faq: FaqItem[] = [
  { q: "Are SVG files uploaded?", a: "No. SVG parsing, preview, PNG rendering, validation, reset, copy, and download actions run locally in your browser." },
  { q: "Can I export transparent PNG images?", a: "Yes. Keep the SVG background transparent and export to PNG to preserve transparency where supported by the source SVG." },
  { q: "When should I use 2x or 3x export?", a: "Use higher scale exports for Retina screens, app icons, presentation assets, or print workflows that need more pixels." },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <ToolHeader eyebrow="Image conversion" title="SVG to PNG Converter" description="Paste SVG code or upload SVG files, validate dimensions, preview output, and download high-resolution PNG assets locally." tone="sky" noteTitle="Browser-only rendering" note="Canvas export, scaling, transparent backgrounds, reset controls, and downloads stay on your device." />
        <SvgConverter />
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Scale examples" body="Export 1x, 2x, 3x, 4x, or custom dimensions for UI assets." />
          <InfoCard title="Batch workflow" body="Convert multiple SVG snippets or files and download generated PNG outputs." />
          <InfoCard title="Copy and download" body="Copy generated data, download PNG files, and clear the workspace after review." />
        </section>
        <InfoSection title="Export Notes" items={[["Vector to raster", "PNG output has fixed pixels, so choose dimensions that match the target display or print size."], ["Check source SVG", "External images, remote fonts, or unsupported SVG features may need manual review after conversion."]]} />
        <Faq items={faq} />
        <RelatedSection links={[["/image-compressor", "Image Compressor", "Shrink image files"], ["/favicon-generator", "Favicon Generator", "Create icon sets"], ["/image-to-base64", "Image to Base64", "Encode image assets"], ["/qr-generator", "QR Generator", "Create QR images"]]} />
        <footer className="py-8 text-center text-xs text-slate-500">cc-tools publishes {toolCount} free online tools.</footer>
      </div>
      <JsonLd faq={faq} name="SVG to PNG Converter" description="Convert SVG code and files to PNG locally with validation, reset, copy, and download controls." url="https://tools.loresync.dev/svg-to-png" category="MultimediaApplication" />
    </main>
  );
}
