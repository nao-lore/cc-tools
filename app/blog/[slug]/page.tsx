import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts, getBlogPost } from "@/lib/blog-posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    alternates: { canonical: `https://tools.loresync.dev/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://tools.loresync.dev/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // h2
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="text-xl font-bold text-white mt-10 mb-4 pb-2 border-b border-gray-800"
        >
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    // h3
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-lg font-semibold text-gray-100 mt-6 mb-3">
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    // table
    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const [header, , ...rows] = tableLines;
      const headers = header.split("|").filter((c) => c.trim() !== "");
      elements.push(
        <div key={i} className="overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800">
                {headers.map((h, hi) => (
                  <th
                    key={hi}
                    className="text-left text-gray-200 font-semibold px-4 py-2 border border-gray-700"
                  >
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => {
                const cells = row.split("|").filter((c) => c.trim() !== "");
                return (
                  <tr key={ri} className="border-b border-gray-800 hover:bg-gray-800/40">
                    {cells.map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-4 py-2 text-gray-300 border border-gray-800"
                      >
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // internal tool link (→ [label](url))
    if (line.startsWith("→ [")) {
      const match = line.match(/→ \[(.+?)\]\((.+?)\)/);
      if (match) {
        elements.push(
          <div key={i} className="my-2">
            <Link
              href={match[2]}
              className="inline-flex items-center gap-2 bg-gray-800 border border-gray-700 hover:border-violet-500 hover:bg-gray-700 text-gray-200 hover:text-violet-300 text-sm px-4 py-2 rounded-lg transition-all font-medium"
            >
              {match[1]}
            </Link>
          </div>
        );
        i++;
        continue;
      }
    }

    // list item
    if (line.startsWith("- ")) {
      const listLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        listLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={i} className="list-disc list-inside space-y-1 my-4 text-gray-300">
          {listLines.map((item, li) => (
            <li key={li}>{item}</li>
          ))}
        </ul>
      );
      continue;
    }

    // bold paragraph inline (**text**)
    if (line.startsWith("**") && line.includes("**", 2)) {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      elements.push(
        <p key={i} className="text-gray-300 leading-relaxed my-3">
          {parts.map((part, pi) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pi} className="text-white font-semibold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
      i++;
      continue;
    }

    // empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // plain paragraph
    elements.push(
      <p key={i} className="text-gray-300 leading-relaxed my-3">
        {line}
      </p>
    );
    i++;
  }

  return elements;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    datePublished: post.date,
    dateModified: post.date,
    publisher: {
      "@type": "Organization",
      name: "tools.loresync.dev",
      url: "https://tools.loresync.dev",
    },
    url: `https://tools.loresync.dev/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-100 text-sm transition-colors"
          >
            ← ツール一覧
          </Link>
          <span className="text-gray-700">|</span>
          <Link
            href="/blog"
            className="text-gray-400 hover:text-gray-100 text-sm transition-colors"
          >
            ガイド記事
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Article header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
            <time dateTime={post.date}>{post.date}</time>
            <span>·</span>
            <span>{post.author}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-4">
            {post.title}
          </h1>
          <p className="text-gray-400 text-base leading-relaxed border-l-2 border-gray-700 pl-4">
            {post.description}
          </p>
        </div>

        {/* Article body */}
        <article className="prose-sm max-w-none">
          {renderContent(post.content)}
        </article>

        {/* Back link */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <Link
            href="/blog"
            className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
          >
            ← ガイド記事一覧に戻る
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-800 mt-8">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          © 2026 tools.loresync.dev — 無料オンラインツール集
        </div>
      </footer>
    </div>
  );
}
