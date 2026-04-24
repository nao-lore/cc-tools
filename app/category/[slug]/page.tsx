import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tools } from "@/lib/tools-config";
import { categories, getCategoryBySlug } from "@/lib/categories";
import { toolCategoryMap } from "@/lib/tool-categories";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  const title = `${category.name} - 無料オンラインツール`;
  const description = `${category.description}。無料で使える${category.name}ツール一覧。登録不要、広告なし。`;

  return {
    title,
    description,
    alternates: { canonical: `https://tools.loresync.dev/category/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://tools.loresync.dev/category/${slug}`,
      siteName: "cc-tools",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function getToolsForCategory(categorySlug: string) {
  return tools.filter((tool) => toolCategoryMap[tool.slug] === categorySlug);
}

function ToolCard({ tool, color }: { tool: { slug: string; name: string; description: string; market: "EN" | "JP" }; color: string }) {
  return (
    <Link
      href={`/${tool.slug}`}
      className="group block rounded-xl border border-gray-800 bg-gray-900 p-5 transition-all hover:border-gray-700 hover:bg-gray-800"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-100 group-hover:text-white transition-colors">
          {tool.name}
        </h3>
        <span
          className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: tool.market === "JP" ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)",
            color: tool.market === "JP" ? "#f87171" : "#60a5fa",
          }}
        >
          {tool.market}
        </span>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed">{tool.description}</p>
      <div
        className="mt-3 h-0.5 w-8 rounded-full opacity-60 group-hover:w-12 transition-all duration-200"
        style={{ backgroundColor: color }}
      />
    </Link>
  );
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const categoryTools = getToolsForCategory(slug);
  const otherCategories = categories.filter((c) => c.slug !== slug);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: "https://tools.loresync.dev",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `https://tools.loresync.dev/category/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
        {/* Breadcrumb */}
        <div className="border-b border-gray-800 bg-gray-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-300 transition-colors">
                ホーム
              </Link>
              <span>/</span>
              <span className="text-gray-300">{category.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <header className="border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl mb-6"
              style={{ backgroundColor: `${category.color}22`, border: `1px solid ${category.color}44` }}
            >
              {category.icon}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              {category.name}
            </h1>
            <p className="text-lg text-gray-400 max-w-xl mx-auto mb-2">
              {category.description}
            </p>
            <p className="text-sm text-gray-600">
              {categoryTools.length} ツール &mdash; 無料・登録不要
            </p>
          </div>
        </header>

        {/* Tool Grid */}
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {categoryTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} color={category.color} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p>このカテゴリにはまだツールがありません。</p>
            </div>
          )}

          {/* Other Categories */}
          <section className="mt-20">
            <h2 className="text-xl font-bold text-gray-100 mb-6">他のカテゴリを見る</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {otherCategories.map((cat) => {
                const count = getToolsForCategory(cat.slug).length;
                return (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 transition-all hover:border-gray-700 hover:bg-gray-800"
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">
                        {cat.name}
                      </p>
                      <p className="text-xs text-gray-500">{count} ツール</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-gray-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center space-y-3">
            <p className="text-sm text-gray-500">
              All tools are free, open source, and require no signup.
            </p>
            <p className="text-sm text-gray-600">
              Built with AI &mdash; interested in working together?{" "}
              <a href="mailto:nao@loresync.dev" className="text-blue-400 hover:text-blue-300 font-medium">
                nao@loresync.dev
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
