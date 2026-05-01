export interface Tool {
  slug: string;
  name: string;
  description: string;
  market: "EN" | "JP";
  category: string;
  oldUrl: string;
}

export const tools: Tool[] = [
  { slug: "mdtable", name: "Markdown Table Generator", description: "Create and edit Markdown tables visually", market: "EN", category: "Text & String Tools", oldUrl: "https://mdtable.vercel.app" },
  { slug: "text-diff", name: "Text Diff Checker", description: "Compare two texts and highlight differences", market: "EN", category: "Text & String Tools", oldUrl: "https://text-diff-mu.vercel.app" },
  { slug: "word-counter", name: "Word & Character Counter", description: "Count words, characters, sentences, and paragraphs", market: "EN", category: "Text & String Tools", oldUrl: "https://word-counter-seven-khaki.vercel.app" },
  { slug: "markdown-preview", name: "Markdown Live Preview", description: "Write Markdown and preview rendered output in real time", market: "EN", category: "Text & String Tools", oldUrl: "https://markdown-preview-pi-sandy.vercel.app" },
  { slug: "dummy-text", name: "Placeholder Text Generator", description: "Generate lorem ipsum and other placeholder text", market: "EN", category: "Text & String Tools", oldUrl: "https://dummy-text-murex.vercel.app" },
  { slug: "ascii-art", name: "ASCII Art Generator", description: "Convert text into ASCII art with various fonts", market: "EN", category: "Text & String Tools", oldUrl: "https://ascii-art-mu.vercel.app" },
  { slug: "json-formatter", name: "JSON Formatter & Validator", description: "Format, validate, and beautify JSON data", market: "EN", category: "Data Format Tools", oldUrl: "https://json-formatter-topaz-pi.vercel.app" },
  { slug: "json-to-csv", name: "JSON to CSV Converter", description: "Convert JSON arrays to CSV format", market: "EN", category: "Data Format Tools", oldUrl: "https://json-to-csv-rho.vercel.app" },
  { slug: "yaml-to-json", name: "YAML to JSON Converter", description: "Convert between YAML and JSON formats", market: "EN", category: "Data Format Tools", oldUrl: "https://yaml-to-json-theta.vercel.app" },
  { slug: "xml-formatter", name: "XML Formatter", description: "Format and prettify XML documents", market: "EN", category: "Data Format Tools", oldUrl: "https://xml-formatter-xi.vercel.app" },
  { slug: "sql-formatter", name: "SQL Formatter", description: "Format and beautify SQL queries", market: "EN", category: "Data Format Tools", oldUrl: "https://sql-formatter-liart.vercel.app" },
  { slug: "html-to-markdown", name: "HTML to Markdown", description: "Convert HTML markup to Markdown syntax", market: "EN", category: "Data Format Tools", oldUrl: "https://html-to-markdown-kappa.vercel.app" },
  { slug: "base64-tools", name: "Base64 Encoder/Decoder", description: "Encode and decode Base64 strings", market: "EN", category: "Encoding & Decoding", oldUrl: "https://base64-tools-three.vercel.app" },
  { slug: "url-encoder", name: "URL Encoder/Decoder", description: "Encode and decode URL components", market: "EN", category: "Encoding & Decoding", oldUrl: "https://url-encoder-pi.vercel.app" },
  { slug: "html-entity", name: "HTML Entity Encoder", description: "Encode and decode HTML entities", market: "EN", category: "Encoding & Decoding", oldUrl: "https://html-entity-sigma.vercel.app" },
  { slug: "jwt-decoder", name: "JWT Decoder", description: "Decode and inspect JSON Web Tokens", market: "EN", category: "Encoding & Decoding", oldUrl: "https://jwt-decoder-five.vercel.app" },
  { slug: "image-to-base64", name: "Image to Base64", description: "Convert images to Base64 encoded strings", market: "EN", category: "Encoding & Decoding", oldUrl: "https://image-to-base64-five.vercel.app" },
  { slug: "hash-generator", name: "Hash Generator", description: "Generate MD5, SHA-1, SHA-256, and other hashes", market: "EN", category: "Encoding & Decoding", oldUrl: "https://hash-generator-coral.vercel.app" },
  { slug: "binary-converter", name: "Binary/Decimal/Hex Converter", description: "Convert between binary, decimal, and hexadecimal", market: "EN", category: "Encoding & Decoding", oldUrl: "https://binary-converter-one.vercel.app" },
  { slug: "css-gradient", name: "CSS Gradient Generator", description: "Create linear and radial CSS gradients visually", market: "EN", category: "CSS Tools", oldUrl: "https://css-gradient-beta.vercel.app" },
  { slug: "css-box-shadow", name: "CSS Box Shadow", description: "Design box shadows with a visual editor", market: "EN", category: "CSS Tools", oldUrl: "https://css-box-shadow-gamma.vercel.app" },
  { slug: "css-flexbox", name: "CSS Flexbox Generator", description: "Build flexbox layouts with a visual playground", market: "EN", category: "CSS Tools", oldUrl: "https://css-flexbox-rho.vercel.app" },
  { slug: "css-grid", name: "CSS Grid Generator", description: "Create CSS Grid layouts visually", market: "EN", category: "CSS Tools", oldUrl: "https://css-grid-two-mocha.vercel.app" },
  { slug: "css-animation", name: "CSS Animation Generator", description: "Build CSS keyframe animations with a visual editor", market: "EN", category: "CSS Tools", oldUrl: "https://css-animation-tawny.vercel.app" },
  { slug: "border-radius", name: "Border Radius Generator", description: "Create custom border radius values visually", market: "EN", category: "CSS Tools", oldUrl: "https://border-radius-nine.vercel.app" },
  { slug: "tailwindconvert", name: "CSS to Tailwind Converter", description: "Convert vanilla CSS to Tailwind CSS utility classes", market: "EN", category: "CSS Tools", oldUrl: "https://tailwindconvert.vercel.app" },
  { slug: "px-to-rem", name: "PX to REM Converter", description: "Convert pixel values to REM units", market: "EN", category: "CSS Tools", oldUrl: "https://px-to-rem-rust.vercel.app" },
  { slug: "color-converter", name: "Color Converter", description: "Convert between HEX, RGB, HSL, and other color formats", market: "EN", category: "Color Tools", oldUrl: "https://color-converter-inky.vercel.app" },
  { slug: "color-palette", name: "Color Palette Generator", description: "Generate harmonious color palettes", market: "EN", category: "Color Tools", oldUrl: "https://color-palette-sand.vercel.app" },
  { slug: "svg-to-png", name: "SVG to PNG Converter", description: "Convert SVG files to PNG images", market: "EN", category: "Image Tools", oldUrl: "https://svg-to-png-six.vercel.app" },
  { slug: "image-compressor", name: "Image Compressor", description: "Compress images without losing quality", market: "EN", category: "Image Tools", oldUrl: "https://image-compressor-eight-tawny.vercel.app" },
  { slug: "favicon-generator", name: "Favicon Generator", description: "Generate favicons from text, emoji, or images", market: "EN", category: "Image Tools", oldUrl: "https://favicon-generator-psi.vercel.app" },
  { slug: "placeholder-image", name: "Placeholder Image Generator", description: "Create placeholder images with custom dimensions", market: "EN", category: "Image Tools", oldUrl: "https://placeholder-image-fmq8sxvq6-naos-projects-52ff71e9.vercel.app" },
  { slug: "qr-generator", name: "QR Code Generator", description: "Generate QR codes from text or URLs", market: "EN", category: "Image Tools", oldUrl: "https://qr-generator-ten-wheat.vercel.app" },
  { slug: "regex-tester", name: "Regex Tester", description: "Test and debug regular expressions with live matching", market: "EN", category: "Developer Tools", oldUrl: "https://regex-tester-three.vercel.app" },
  { slug: "uuid-generator", name: "UUID Generator", description: "Generate UUID v4 identifiers", market: "EN", category: "Developer Tools", oldUrl: "https://uuid-generator-eight-psi.vercel.app" },
  { slug: "cron-generator", name: "Cron Expression Generator", description: "Build and validate cron schedule expressions", market: "EN", category: "Developer Tools", oldUrl: "https://cron-generator-beryl.vercel.app" },
  { slug: "epoch-converter", name: "Unix Timestamp Converter", description: "Convert between Unix timestamps and dates", market: "EN", category: "Developer Tools", oldUrl: "https://epoch-converter-eosin.vercel.app" },
  { slug: "chmod-calculator", name: "Chmod Calculator", description: "Calculate file permission values", market: "EN", category: "Developer Tools", oldUrl: "https://chmod-calculator-gules.vercel.app" },
  { slug: "http-status", name: "HTTP Status Codes", description: "Reference for all HTTP status codes", market: "EN", category: "Developer Tools", oldUrl: "https://http-status-eight.vercel.app" },
  { slug: "password-generator", name: "Password Generator", description: "Generate secure random passwords", market: "EN", category: "Developer Tools", oldUrl: "https://password-generator-sepia-beta.vercel.app" },
  { slug: "meta-tag-generator", name: "Meta Tag Generator", description: "Generate HTML meta tags for SEO", market: "EN", category: "SEO Tools", oldUrl: "https://meta-tag-generator-indol.vercel.app" },
  { slug: "og-image-preview", name: "OG Image Preview", description: "Preview Open Graph images for social sharing", market: "EN", category: "SEO Tools", oldUrl: "https://og-image-preview-eight.vercel.app" },
  { slug: "robots-txt-generator", name: "Robots.txt Generator", description: "Generate robots.txt files for search engines", market: "EN", category: "SEO Tools", oldUrl: "https://robots-txt-generator-nine.vercel.app" },
  { slug: "minify-js", name: "JavaScript Minifier", description: "Minify JavaScript code to reduce file size", market: "EN", category: "Minifier Tools", oldUrl: "https://minify-js.vercel.app" },
  { slug: "minify-css", name: "CSS Minifier", description: "Minify CSS stylesheets to reduce file size", market: "EN", category: "Minifier Tools", oldUrl: "https://minify-css.vercel.app" },
  { slug: "timezone-converter", name: "Time Zone Converter", description: "Convert times between different time zones", market: "EN", category: "Time & Date", oldUrl: "https://timezone-converter-rouge-two.vercel.app" },
  { slug: "aspect-ratio", name: "Aspect Ratio Calculator", description: "Calculate and convert aspect ratios", market: "EN", category: "Time & Date", oldUrl: "https://aspect-ratio-pi.vercel.app" },
  { slug: "eigyoubi", name: "営業日数計算", description: "Calculate business days between dates", market: "JP", category: "Japanese Tools", oldUrl: "https://eigyoubi.vercel.app" },
  { slug: "wareki-converter", name: "和暦西暦変換", description: "Convert between Japanese and Western calendar years", market: "JP", category: "Japanese Tools", oldUrl: "https://wareki-converter-mu.vercel.app" },
  { slug: "zenkaku-hankaku", name: "全角半角変換", description: "Convert between fullwidth and halfwidth characters", market: "JP", category: "Japanese Tools", oldUrl: "https://zenkaku-hankaku.vercel.app" },
  { slug: "furigana", name: "ふりがな変換", description: "Add furigana readings to Japanese text", market: "JP", category: "Japanese Tools", oldUrl: "https://furigana-beta.vercel.app" },
  { slug: "tax-calculator", name: "税金計算", description: "Calculate Japanese consumption tax", market: "JP", category: "Japanese Tools", oldUrl: "https://tax-calculator-lilac-three.vercel.app" },
  { slug: "nenrei-keisan", name: "年齢計算", description: "生年月日から満年齢・数え年・干支・星座を計算", market: "JP", category: "Japanese Tools", oldUrl: "" },
  { slug: "moji-count", name: "文字数カウント", description: "ひらがな・カタカナ・漢字別にリアルタイムカウント", market: "JP", category: "Japanese Tools", oldUrl: "" },
  { slug: "nissuu-keisan", name: "日数計算", description: "日付間の日数や○日後・○日前の日付を計算", market: "JP", category: "Japanese Tools", oldUrl: "" },
  { slug: "bmi-keisan", name: "BMI計算", description: "身長と体重からBMI値と肥満度を判定", market: "JP", category: "Japanese Tools", oldUrl: "" },
  { slug: "waribiki-keisan", name: "割引計算", description: "割引率から割引後の価格・税込価格を計算", market: "JP", category: "Japanese Tools", oldUrl: "" },
  { slug: "loan-simulator", name: "ローン計算", description: "ローンの毎月返済額・総返済額をシミュレーション", market: "JP", category: "Japanese Tools", oldUrl: "" },
  { slug: "tedori-keisan", name: "手取り計算", description: "額面年収から手取り月額・年額を概算計算", market: "JP", category: "Japanese Tools", oldUrl: "" },
  { slug: "risoku-keisan", name: "利息計算", description: "単利・複利の利息額と元利合計を計算", market: "JP", category: "Japanese Tools", oldUrl: "" },
  { slug: "tsumitate-sim", name: "積立シミュレーション", description: "毎月の積立額から最終積立額・運用益を計算", market: "JP", category: "Japanese Tools", oldUrl: "" },
  { slug: "denki-keisan", name: "電気代計算", description: "家電の消費電力から電気料金を計算", market: "JP", category: "Japanese Tools", oldUrl: "" },
  { slug: "calorie-keisan", name: "カロリー計算", description: "基礎代謝量と1日の消費カロリーを計算", market: "JP", category: "Japanese Tools", oldUrl: "" },
  { slug: "menseki-keisan", name: "面積計算", description: "8図形の面積計算と坪・畳変換", market: "JP", category: "Japanese Tools", oldUrl: "" },
  { slug: "ascii-flowchart", name: "ASCII Flowchart Generator", description: "Convert a simple node-edge list into an ASCII flowchart", market: "EN", category: "Developer Tools", oldUrl: "" },
  { slug: "ab-test-significance", name: "A/Bテスト 有意差計算", description: "A/BテストのCV数と訪問数からp値・信頼区間・必要サンプルサイズを計算", market: "JP", category: "Business Tools", oldUrl: "" },
  { slug: "ai-coding-tool-comparison", name: "AIコーディングツール 料金比較", description: "主要AIコーディングツールの月額料金・機能・対応モデルを横断比較", market: "JP", category: "AI Tools", oldUrl: "" },
  { slug: "ai-video-pricing", name: "AI動画生成 料金比較", description: "主要AI動画生成サービスの料金・生成時間・解像度・機能を横断比較", market: "JP", category: "AI Tools", oldUrl: "" },
  { slug: "aojiro-shinkoku-sim", name: "青色申告 節税シミュレーター", description: "青色申告特別控除の3段階（65万/55万/10万）の適用条件と節税効果を可視化", market: "JP", category: "Tax Tools", oldUrl: "" },
  { slug: "auth-service-comparison", name: "認証SaaS 料金比較", description: "主要認証サービスの料金をMAU別に比較。無料枠・機能・SSO対応を一覧", market: "JP", category: "SaaS Pricing", oldUrl: "" },
  { slug: "click-post-size", name: "メール便・小型配送 判定", description: "荷物サイズ・重量から使える小型配送サービスを即判定。最安の送り方を比較", market: "JP", category: "EC Tools", oldUrl: "" },
  { slug: "consumption-tax-choice", name: "簡易課税 vs 本則課税 判定", description: "売上・仕入・業種から簡易課税と本則課税のどちらが有利か判定。2割特例の適用可否も確認", market: "JP", category: "Tax Tools", oldUrl: "" },
  { slug: "embedding-cost-calculator", name: "埋め込みAPI 料金計算", description: "テキスト埋め込み（Embedding）APIの料金をドキュメント数・トークン数から計算", market: "JP", category: "AI Tools", oldUrl: "" },
  { slug: "firebase-pricing", name: "Firebase 料金試算", description: "Firebaseの月額料金をFirestore読み書き数・Storage・Functions実行回数から試算", market: "JP", category: "SaaS Pricing", oldUrl: "" },
  { slug: "gacha-probability", name: "ガチャ確率 計算", description: "ソシャゲのガチャ排出率と試行回数から、目当てのキャラ・装備を引ける確率を計算", market: "JP", category: "Game Tools", oldUrl: "" },
  { slug: "goshugi-souba", name: "ご祝儀相場 計算", description: "結婚式のご祝儀金額を続柄・年代・地域・関係性から判定。相場表と注意事項付き", market: "JP", category: "Life Tools", oldUrl: "" },
  { slug: "houjin-nari", name: "法人成り 損益分岐シミュレーター", description: "年収別に個人事業主と法人（1人社長）の手取り・税金・社会保険を比較", market: "JP", category: "Tax Tools", oldUrl: "" },
  { slug: "hourly-to-annual", name: "時給 ↔ 年収 ↔ 月収 逆算", description: "時給から年収、年収から時給を即変換。勤務時間・日数・有給・残業込みで正確に計算", market: "JP", category: "Labor Tools", oldUrl: "" },
  { slug: "invoice-qualified-checker", name: "適格請求書 チェッカー", description: "適格請求書（インボイス）の必須記載事項を項目ごとにチェック。漏れがないか確認できます", market: "JP", category: "Business Tools", oldUrl: "" },
  { slug: "iryouhi-koujo", name: "医療費控除 シミュレーター", description: "年間医療費・保険金・家族分を入力して医療費控除の還付額を計算", market: "JP", category: "Tax Tools", oldUrl: "" },
  { slug: "mercari-tesuryou", name: "メルカリ 手数料・利益計算", description: "メルカリの販売手数料・送料・梱包費を引いた実利益を計算。逆算で目標利益から販売価格も算出", market: "JP", category: "EC Tools", oldUrl: "" },
  { slug: "openrouter-pricing", name: "OpenRouter 料金比較", description: "OpenRouter経由で使える主要LLMモデルのAPI料金・速度・性能を一覧比較", market: "JP", category: "AI Tools", oldUrl: "" },
  { slug: "rag-cost-estimator", name: "RAG 運用コスト試算", description: "RAGシステムの月額コストをドキュメント数・クエリ数・モデル選択から試算", market: "JP", category: "AI Tools", oldUrl: "" },
  { slug: "recipe-scaling", name: "レシピ 分量スケーリング", description: "レシピの人数を変えた時の材料分量を自動計算。分数・小数・計量単位変換対応", market: "JP", category: "Cooking Tools", oldUrl: "" },
  { slug: "render-fly-railway-comparison", name: "Render / Fly / Railway 料金比較", description: "Render・Fly.io・Railwayの料金・リソース・リージョンを横断比較", market: "JP", category: "SaaS Pricing", oldUrl: "" },
  { slug: "stripe-fee-calculator", name: "Stripe 手数料計算", description: "Stripeの決済手数料を決済方法別に計算。売上から手数料を引いた実収入を即座に確認", market: "JP", category: "Business Tools", oldUrl: "" },
  { slug: "subscription-lifetime", name: "サブスク 生涯コスト可視化", description: "月額サブスクリプションの合計額を1年・5年・10年で可視化。登録中の全サービスの総額を計算", market: "JP", category: "Life Tools", oldUrl: "" },
  { slug: "takuhaibin-hikaku", name: "宅配便 送料比較", description: "ヤマト運輸・佐川急便・日本郵便の送料をサイズ・重量・発送元/先から比較して最安を表示", market: "JP", category: "EC Tools", oldUrl: "" },
  { slug: "teigaku-genzei", name: "定額減税 計算機", description: "2024-2025年の定額減税（所得税3万円/住民税1万円）の適用額をシミュレーション。扶養家族数に応じた減税総額を即計算", market: "JP", category: "Tax Tools", oldUrl: "" },
  { slug: "withholding-tax-calculator", name: "源泉徴収税 計算", description: "フリーランス・個人事業主への報酬にかかる源泉徴収税額を計算。税込/税抜・消費税考慮対応", market: "JP", category: "Business Tools", oldUrl: "" },
  { slug: "zangyou-dai", name: "残業代 計算機", description: "残業代を法定時間外・所定時間外・深夜・休日・月60時間超に区分して正確に計算", market: "JP", category: "Labor Tools", oldUrl: "" },
  { slug: "amazon-fba-fee", name: "Amazon FBA 手数料計算", description: "Amazon FBAの販売手数料・配送代行手数料・保管手数料を販売価格・サイズから計算", market: "JP", category: "EC Tools", oldUrl: "" },
  { slug: "aws-s3-cost", name: "AWS S3 料金計算", description: "AWS S3の月額料金をストレージクラス・容量・リクエスト数・転送量から計算", market: "JP", category: "SaaS Pricing", oldUrl: "" },
  { slug: "azure-openai-cost", name: "Azure OpenAI 料金計算", description: "Azure OpenAI Serviceの料金をリージョン・モデル・トークン数から試算", market: "JP", category: "AI Tools", oldUrl: "" },
  { slug: "cdn-pricing-comparison", name: "CDN 料金比較", description: "主要CDN4社の料金をトラフィック量・リージョンから比較", market: "JP", category: "SaaS Pricing", oldUrl: "" },
  { slug: "context-window-visualizer", name: "コンテキストウィンドウ 可視化", description: "主要LLMモデルのコンテキスト長をトークン・文字数・ページ数で視覚化", market: "JP", category: "AI Tools", oldUrl: "" },
  { slug: "dalle-pricing", name: "DALL-E 料金計算", description: "DALL-E 3の解像度別・品質別の画像生成コストを枚数から計算", market: "JP", category: "AI Tools", oldUrl: "" },
  { slug: "dpi-resolution", name: "DPI / 解像度 / 印刷サイズ計算", description: "印刷サイズとDPIからピクセル数を計算、またはピクセル数から印刷可能サイズを逆算", market: "JP", category: "Design Tools", oldUrl: "" },
  { slug: "elevenlabs-pricing", name: "ElevenLabs 料金試算", description: "ElevenLabsの音声合成料金を文字数・プラン別に計算", market: "JP", category: "AI Tools", oldUrl: "" },
  { slug: "fine-tuning-cost", name: "ファインチューニング 料金計算", description: "LLMファインチューニングの学習コスト+推論コストをトレーニングデータ量から試算", market: "JP", category: "AI Tools", oldUrl: "" },
  { slug: "gcp-pricing", name: "Google Cloud 料金試算", description: "Google Cloudの主要サービス料金をリソース量から日本円で試算", market: "JP", category: "SaaS Pricing", oldUrl: "" },
  { slug: "gyomu-itaku-hikaku", name: "業務委託 vs 正社員 手取り比較", description: "同じ額面で業務委託と正社員の手取り・社会保障・将来年金を比較", market: "JP", category: "Labor Tools", oldUrl: "" },
  { slug: "ideco-tax-saving", name: "iDeCo 節税額シミュレーター", description: "iDeCoの掛金から所得税+住民税の節税効果を計算。年齢・職業別の掛金上限対応", market: "JP", category: "Tax Tools", oldUrl: "" },
  { slug: "kaji-anbun", name: "家事按分 計算", description: "家賃・光熱費・通信費を事業割合で按分。フリーランスの確定申告に必要な経費計算", market: "JP", category: "Tax Tools", oldUrl: "" },
  { slug: "meeting-cost", name: "会議コスト計算機", description: "会議1回あたりのコストを参加者の年収・人数・時間から計算。無駄な会議の可視化に", market: "JP", category: "Business Tools", oldUrl: "" },
];

export const categories = [...new Set(tools.map(t => t.category))];

export function getToolsByCategory(category: string): Tool[] {
  return tools.filter(t => t.category === category);
}

export function getRelatedTools(slug: string, limit = 5): Tool[] {
  const tool = tools.find(t => t.slug === slug);
  if (!tool) return [];
  return tools.filter(t => t.slug !== slug && t.category === tool.category).slice(0, limit);
}

export function getAllSlugs(): string[] {
  return tools.map(t => t.slug);
}
