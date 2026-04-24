export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  { slug: "ai-tools", name: "AI・LLM ツール", description: "AIモデルの料金計算・比較ツール", icon: "🤖", color: "#8b5cf6" },
  { slug: "saas-pricing", name: "SaaS 料金計算", description: "クラウドサービスの料金シミュレーター", icon: "☁️", color: "#3b82f6" },
  { slug: "css-design", name: "CSS・デザイン", description: "CSS生成・デザインツール", icon: "🎨", color: "#ec4899" },
  { slug: "text-tools", name: "テキスト・文字列", description: "テキスト変換・文字数カウントツール", icon: "📝", color: "#10b981" },
  { slug: "data-format", name: "データ変換", description: "JSON/CSV/YAML/XML変換ツール", icon: "🔄", color: "#f59e0b" },
  { slug: "encoding", name: "エンコード・暗号", description: "Base64/URL/ハッシュ変換ツール", icon: "🔐", color: "#6366f1" },
  { slug: "image-tools", name: "画像ツール", description: "画像変換・圧縮ツール", icon: "🖼️", color: "#14b8a6" },
  { slug: "tax-tools", name: "税金・確定申告", description: "税金計算・確定申告シミュレーター", icon: "🏛️", color: "#ef4444" },
  { slug: "life-money", name: "生活・お金", description: "日常の計算・シミュレーションツール", icon: "💰", color: "#f97316" },
  { slug: "ec-shipping", name: "EC・配送", description: "手数料計算・送料比較ツール", icon: "📦", color: "#84cc16" },
  { slug: "dev-tools", name: "開発者ツール", description: "プログラミング支援ツール", icon: "⚡", color: "#06b6d4" },
  { slug: "math-stats", name: "数学・統計", description: "計算・統計分析ツール", icon: "📊", color: "#a855f7" },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
