import Link from "next/link";
import { tools } from "@/lib/tools-config";
import BpmDelay from "./components/BpmDelay";

const faq = [
  {
    q: "How is delay time calculated?",
    a: "A quarter note is 60,000 divided by BPM. Other note values multiply that base duration, with dotted and triplet variants included.",
  },
  {
    q: "Can I convert milliseconds back to BPM?",
    a: "Yes. Switch to ms to BPM mode, enter the delay time, choose the note value, and validate the resulting BPM.",
  },
  {
    q: "Does the tap tempo leave the browser?",
    a: "No. Tap timing, calculations, copy buttons, reset controls, and examples run locally in your browser.",
  },
];

type FaqItem = (typeof faq)[number];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <header className="mb-6">
          <Link href="/" aria-label="Back to free online tools" className="text-sm font-medium text-slate-500 hover:text-slate-950">
            ← 無料オンラインツール集
          </Link>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-pink-700">Music production tool</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">BPM Delay Calculator</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                BPMから音符別ディレイタイムを計算し、msからBPMへ逆算できます。タップテンポ、コピー、リセットにも対応します。
              </p>
            </div>
            <div className="rounded-2xl border border-pink-200 bg-pink-50 p-4 text-sm leading-6 text-pink-900 shadow-sm">
              <div className="font-semibold text-pink-950">DTM向け計算</div>
              <p className="mt-2">20〜300 BPMの範囲で検証し、付点・3連符・タップテンポをブラウザ上で計算します。</p>
            </div>
          </div>
        </header>

        <BpmDelay />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Delay table" body="通常、付点、3連符のms値を音符ごとに一覧表示します。" />
          <InfoCard title="Reverse mode" body="ms値からBPMを逆算し、候補の音符ごとに比較できます。" />
          <InfoCard title="Copy values" body="計算結果をコピーしてDAWやメモに貼り付けられます。" />
        </section>

        <InfoSection title="制作メモ" items={[
          ["エフェクト設定", "ディレイ、LFO、コンプレッサーのサイドチェインなど、BPM同期の目安として使えます。"],
          ["検証のコツ", "DAWやプラグイン側の丸め処理が異なる場合があるため、耳で確認して微調整してください。"],
        ]} />

        <Faq items={faq} />

        <RelatedSection links={[
          ["/video-bitrate", "Video Bitrate", "映像のビットレート計算"],
          ["/dummy-text", "Dummy Text", "仮テキスト生成"],
          ["/css-animation", "CSS Animation", "動きのCSS生成"],
          ["/timezone-converter", "Time Zone", "時差変換"],
        ]} />

        <footer className="py-8 text-center text-xs text-slate-500">cc-tools は {toolCount} 個の無料オンラインツールを公開しています。</footer>
      </div>

      <JsonLd faq={faq} name="BPM Delay Calculator" description="BPM and delay time calculator for music production." url="https://tools.loresync.dev/bpm-delay" />
    </main>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="text-sm font-semibold text-slate-950">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{body}</p></div>;
}

function InfoSection({ title, items }: { title: string; items: [string, string][] }) {
  return <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-bold text-slate-950">{title}</h2><div className="mt-4 grid gap-5 text-sm leading-7 text-slate-600 md:grid-cols-2">{items.map(([heading, body]) => <div key={heading}><h3 className="font-semibold text-slate-900">{heading}</h3><p className="mt-1">{body}</p></div>)}</div></section>;
}

function Faq({ items }: { items: FaqItem[] }) {
  return <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-bold text-slate-950">FAQ</h2><div className="mt-4 divide-y divide-slate-200">{items.map((item) => <div key={item.q} className="py-4 first:pt-0 last:pb-0"><h3 className="font-semibold text-slate-950">{item.q}</h3><p className="mt-1 text-sm leading-7 text-slate-600">{item.a}</p></div>)}</div></section>;
}

function RelatedSection({ links }: { links: [string, string, string][] }) {
  return <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-bold text-slate-950">関連ツール</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{links.map(([href, title, body]) => <Link key={href} href={href} className="rounded-xl border border-slate-200 p-4 hover:border-slate-400 hover:bg-slate-50"><div className="text-sm font-semibold text-slate-950">{title}</div><div className="mt-1 text-xs leading-5 text-slate-500">{body}</div></Link>)}</div></section>;
}

function JsonLd({ faq, name, description, url }: { faq: FaqItem[]; name: string; description: string; url: string }) {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) }) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name, description, url, applicationCategory: "UtilityApplication", operatingSystem: "All", offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" }, inLanguage: "ja" }) }} /></>;
}
