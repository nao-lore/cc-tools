import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "ガイド記事一覧 — AI・フリーランス・開発ツール",
  description:
    "AI APIの料金比較、フリーランスの確定申告、ネット販売の送料節約、開発者向けツール活用など、実用的なガイド記事を掲載しています。",
  alternates: { canonical: "https://tools.loresync.dev/blog" },
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-100 text-sm transition-colors"
          >
            ← ツール一覧
          </Link>
          <span className="text-gray-700">|</span>
          <span className="text-gray-300 text-sm font-medium">ガイド記事</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-3">ガイド記事一覧</h1>
          <p className="text-gray-400 text-base leading-relaxed">
            AI・フリーランス・開発ツール・SaaS料金に関する実用的なガイドをまとめています。
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 hover:bg-gray-800/60 transition-all group"
            >
              <p className="text-xs text-gray-500 mb-2">{post.date}</p>
              <h2 className="text-base font-semibold text-white mb-2 leading-snug group-hover:text-violet-300 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                {post.description}
              </p>
              <span className="inline-block mt-4 text-xs text-violet-400 font-medium">
                続きを読む →
              </span>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          © 2026 tools.loresync.dev — 無料オンラインツール集
        </div>
      </footer>
    </div>
  );
}
