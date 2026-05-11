import Link from "next/link";
import { tools } from "@/lib/tools-config";
import ChmodCalculator from "./components/ChmodCalculator";

const faq = [
  {
    q: "What does chmod 755 mean?",
    a: "755 means owner can read, write, and execute; group and others can read and execute. It is common for directories and executable scripts.",
  },
  {
    q: "What is safer for private files?",
    a: "Use 600 for private files such as SSH keys, and 700 for private directories or scripts that only the owner should access.",
  },
  {
    q: "Should I use chmod 777?",
    a: "Avoid chmod 777 unless you have a very specific reason. It gives everyone read, write, and execute permission, which is risky on shared systems.",
  },
  {
    q: "Are generated paths or commands stored?",
    a: "No. The calculator runs locally in your browser and does not send the target path or generated chmod command anywhere.",
  },
];

export default function Home() {
  const toolCount = tools.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <header className="mb-6">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-950">
            ← Free online tools
          </Link>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-slate-700">Developer Tool</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Chmod Calculator</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Convert Unix file permissions between numeric, symbolic, and command formats. Toggle read, write, execute, setuid, setgid, and sticky bits, then copy a safe chmod command.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="font-semibold text-slate-950">Security note</div>
              <p className="mt-2">Avoid broad permissions like 777 on shared servers. Use recursive chmod only after checking every nested path.</p>
            </div>
          </div>
        </header>

        <ChmodCalculator />

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard title="Numeric mode" body="Read is 4, write is 2, execute is 1. Each digit is the sum for owner, group, and others." />
          <InfoCard title="Symbolic mode" body="rwxr-xr-x is the symbolic form of 755. Special bits appear as s, S, t, or T." />
          <InfoCard title="Local only" body="The target path and generated chmod command stay in your browser." />
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Common chmod examples</h2>
          <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-2">
            <Example mode="644" title="Regular file" body="Owner can write. Group and others can read. Common for text files and web assets." />
            <Example mode="755" title="Directory or executable" body="Owner can write. Everyone can enter or execute. Common for directories and scripts." />
            <Example mode="600" title="Private secret" body="Owner read/write only. Common for SSH private keys and local config files." />
            <Example mode="1777" title="Sticky shared directory" body="World writable, but users cannot delete files owned by others. Common for /tmp style directories." />
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">よくある質問</h2>
          <div className="mt-4 divide-y divide-slate-200">
            {faq.map((item) => (
              <div key={item.q} className="py-4 first:pt-0 last:pb-0">
                <h3 className="font-semibold text-slate-950">{item.q}</h3>
                <p className="mt-1 text-sm leading-7 text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-slate-950">Related tools</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Related href="/cron-generator" title="Cron Generator" body="Build and explain cron schedules." />
            <Related href="/regex-tester" title="Regex Tester" body="Test regular expressions quickly." />
            <Related href="/hash-generator" title="Hash Generator" body="Generate SHA and MD5 hashes." />
            <Related href="/binary-converter" title="Binary Converter" body="Convert decimal, binary, and hex." />
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-slate-500">
          cc-tools publishes {toolCount}+ free online tools.
        </footer>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Chmod Calculator",
            description: "Convert Unix file permissions between numeric, symbolic, and chmod command formats.",
            url: "https://tools.loresync.dev/chmod-calculator",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "All",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "JPY",
            },
            inLanguage: "en",
          }),
        }}
      />
    </main>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

function Example({ mode, title, body }: { mode: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-slate-950 px-2 py-1 font-mono text-sm font-bold text-white">{mode}</span>
        <h3 className="font-semibold text-slate-950">{title}</h3>
      </div>
      <p className="mt-2">{body}</p>
    </div>
  );
}

function Related({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="rounded-xl border border-slate-200 p-4 hover:border-slate-400 hover:bg-slate-50">
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">{body}</div>
    </Link>
  );
}
