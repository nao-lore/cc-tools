"use client";

import { useState } from "react";

type Lang = "ja" | "en";

// ────────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────────
interface Rule {
  keywords: string[];
  kamoku: string;
  notes?: string;
  amountNote?: string;
}

interface MatchResult {
  kamoku: string;
  matchedKeywords: string[];
  notes: string;
  amountNote?: string;
}

// ────────────────────────────────────────────────
// Translations
// ────────────────────────────────────────────────
const T = {
  ja: {
    singleTab: "1件判定",
    batchTab: "まとめて判定",
    tableTab: "科目一覧",
    singleLabel: "摘要を入力",
    singlePlaceholder: "例：Amazon AWS利用料、電車代、Udemy講座",
    singleHint: "例：AWS EC2料金 / Zoom月額 / 書籍代 / 新幹線 東京→大阪",
    judgeBtn: "判定",
    noMatchTitle: "判定できませんでした",
    noMatchBody: "キーワードが認識されませんでした。摘要をより具体的に入力するか、税理士にご相談ください。",
    recommendedKamoku: "推奨勘定科目",
    matchedKeywords: "根拠キーワード",
    notes: "注意事項",
    amountNote: "金額による違い",
    batchLabel: "摘要を複数行入力（1行1件）",
    batchPlaceholder: "Amazon AWS利用料\n電車代 渋谷→新宿\nUdemy購入\nZoom Pro月額\n接待 〇〇社 ランチ",
    batchBtn: "まとめて判定",
    batchDescCol: "摘要",
    batchKamokuCol: "推奨勘定科目",
    batchEvidenceCol: "根拠",
    batchUnknown: "判定不可",
    tableKamokuCol: "勘定科目",
    tableDescCol: "よくある経費例",
    disclaimer: "このツールはルールベースの参考情報です。最終的な経費計上・勘定科目の判断は税理士または税務署にご確認ください。",
    adPlaceholder: "広告",
    faqTitle: "よくある質問",
    faq: [
      { q: "この事業経費 勘定科目 分類ツールは何ができますか？", a: "経費の摘要から適切な勘定科目を提案するルールベースツール。入力するだけで即座に結果を表示します。" },
      { q: "利用料金はかかりますか？", a: "完全無料でご利用いただけます。会員登録も不要です。" },
      { q: "計算結果は正確ですか？", a: "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。" },
    ],
  },
  en: {
    singleTab: "Single",
    batchTab: "Batch",
    tableTab: "Account List",
    singleLabel: "Enter description",
    singlePlaceholder: "e.g. Amazon AWS, train fare, Udemy course",
    singleHint: "e.g. AWS EC2 / Zoom monthly / Book / Shinkansen Tokyo→Osaka",
    judgeBtn: "Classify",
    noMatchTitle: "Could not classify",
    noMatchBody: "No keywords were recognized. Try a more specific description or consult a tax accountant.",
    recommendedKamoku: "Recommended Account",
    matchedKeywords: "Matched Keywords",
    notes: "Notes",
    amountNote: "Amount-based difference",
    batchLabel: "Enter multiple descriptions (one per line)",
    batchPlaceholder: "Amazon AWS\nTrain fare Shibuya→Shinjuku\nUdemy course\nZoom Pro monthly\nClient lunch",
    batchBtn: "Classify All",
    batchDescCol: "Description",
    batchKamokuCol: "Recommended Account",
    batchEvidenceCol: "Evidence",
    batchUnknown: "Unclassified",
    tableKamokuCol: "Account",
    tableDescCol: "Common expense examples",
    disclaimer: "This tool provides rule-based reference information. For final expense classification decisions, please consult a tax accountant or tax office.",
    adPlaceholder: "Advertisement",
    faqTitle: "FAQ",
    faq: [
      { q: "What can this business expense classifier do?", a: "It suggests appropriate accounting categories for expense descriptions using a rule-based engine. Results are shown instantly." },
      { q: "Is it free to use?", a: "Completely free. No registration required." },
      { q: "How accurate are the results?", a: "Results are approximate based on common rules. For exact classification, consult a professional." },
    ],
  },
} as const;

// ────────────────────────────────────────────────
// ルールベース
// ────────────────────────────────────────────────
const RULES: Rule[] = [
  { keywords: ["AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud", "さくらインターネット", "Xserver", "エックスサーバー", "ロリポップ", "Vercel", "Netlify", "Heroku", "Cloudflare", "ドメイン", "レンタルサーバー", "VPS", "ホスティング"], kamoku: "通信費", notes: "クラウドサービス・サーバー費用は通信費が一般的。" },
  { keywords: ["携帯", "スマホ", "スマートフォン", "iPhone", "Android", "ドコモ", "au", "ソフトバンク", "楽天モバイル", "格安SIM", "SIM", "インターネット", "光回線", "Wi-Fi", "ルーター", "回線", "通話", "電話料"], kamoku: "通信費", notes: "事業用途の割合に応じて按分が必要な場合があります。" },
  { keywords: ["Slack", "Zoom", "Teams", "Chatwork", "LINE WORKS", "メール", "MailChimp", "SendGrid"], kamoku: "通信費", notes: "コミュニケーションツールのサブスクは通信費。" },
  { keywords: ["電車", "地下鉄", "バス", "交通費", "Suica", "PASMO", "ICカード", "定期", "乗車券"], kamoku: "旅費交通費", notes: "事業目的の移動のみ対象。通勤定期は給与所得者向けのため個人事業主は要注意。" },
  { keywords: ["タクシー", "Uber", "GO", "DiDi", "ハイヤー"], kamoku: "旅費交通費", notes: "事業目的の移動のみ対象。領収書を必ず保管してください。" },
  { keywords: ["新幹線", "特急", "飛行機", "航空", "ANA", "JAL", "Peach", "LCC", "高速バス", "夜行バス", "フェリー", "出張"], kamoku: "旅費交通費", notes: "出張の場合は出張旅費規程を作成しておくと安心です。" },
  { keywords: ["ホテル", "宿泊", "旅館", "民泊", "Airbnb"], kamoku: "旅費交通費", notes: "事業目的の出張宿泊費。観光目的は不可。" },
  { keywords: ["ガソリン", "軽油", "駐車場", "ETC", "高速道路", "有料道路"], kamoku: "旅費交通費", notes: "事業用車両のみ。プライベート利用がある場合は按分が必要。" },
  { keywords: ["接待", "会食", "接待飲食", "接待費", "得意先", "取引先", "クライアント", "お客様"], kamoku: "交際費", notes: "個人事業主は全額交際費として計上可能（法人と異なります）。" },
  { keywords: ["飲食", "ランチ", "ディナー", "食事代", "レストラン", "居酒屋", "カフェ"], kamoku: "交際費", notes: "1人での食事は交際費にならない場合があります。事業関係者との会食であることを記録してください。", amountNote: "1人5,000円基準は法人向けです。個人事業主は状況により判断。" },
  { keywords: ["手土産", "贈答", "お中元", "お歳暮", "ギフト", "プレゼント", "商品券"], kamoku: "交際費", notes: "取引先への贈答品。個人的な贈り物は不可。" },
  { keywords: ["ゴルフ", "接待ゴルフ", "会員権"], kamoku: "交際費", notes: "事業目的のゴルフ接待。趣味のゴルフは不可。" },
  { keywords: ["PC", "パソコン", "MacBook", "Mac", "Windows", "ノートPC", "デスクトップ", "laptop"], kamoku: "消耗品費（10万円未満）または工具器具備品（10万円以上）", notes: "購入金額によって科目が変わります。", amountNote: "10万円未満→消耗品費（一括経費）、10万円以上→工具器具備品（減価償却）。青色申告なら30万円未満は特例で一括経費化可能。" },
  { keywords: ["モニター", "ディスプレイ", "キーボード", "マウス", "Webカメラ", "ヘッドセット", "イヤホン", "スピーカー", "マイク"], kamoku: "消耗品費（10万円未満）または工具器具備品（10万円以上）", notes: "PC周辺機器。金額で科目が変わります。", amountNote: "10万円未満→消耗品費、10万円以上→工具器具備品（減価償却）。" },
  { keywords: ["プリンター", "スキャナー", "複合機", "コピー機"], kamoku: "消耗品費（10万円未満）または工具器具備品（10万円以上）", notes: "金額によって科目が変わります。", amountNote: "10万円未満→消耗品費、10万円以上→工具器具備品（減価償却）。" },
  { keywords: ["文房具", "コピー用紙", "封筒", "印刷用紙", "ボールペン", "ノート", "付箋", "クリアファイル", "ホッチキス", "消耗品"], kamoku: "消耗品費", notes: "日常的な事務用品。1点10万円未満のもの。" },
  { keywords: ["インク", "トナー", "カートリッジ"], kamoku: "消耗品費", notes: "プリンター用消耗品。" },
  { keywords: ["机", "デスク", "椅子", "チェア", "棚", "本棚", "キャビネット", "家具"], kamoku: "消耗品費（10万円未満）または工具器具備品（10万円以上）", notes: "事業用家具。金額によって科目が変わります。", amountNote: "10万円未満→消耗品費、10万円以上→工具器具備品（減価償却）。" },
  { keywords: ["書籍", "本", "技術書", "雑誌", "専門書", "参考書", "楽天ブックス"], kamoku: "研修費（新聞図書費）", notes: "事業に関連する書籍のみ対象。小説・趣味本は不可。" },
  { keywords: ["Udemy", "Coursera", "Progate", "ドットインストール", "eラーニング", "オンライン講座", "動画学習"], kamoku: "研修費", notes: "事業スキルアップ目的のオンライン講座。" },
  { keywords: ["セミナー", "研修", "講習", "ウェビナー", "勉強会", "ハンズオン", "ワークショップ", "カンファレンス", "Conference"], kamoku: "研修費", notes: "業務に関連するセミナー・勉強会の参加費。" },
  { keywords: ["資格", "試験", "検定", "TOEIC", "英会話"], kamoku: "研修費", notes: "業務に必要な資格取得費用。" },
  { keywords: ["家賃", "賃料", "テナント", "オフィス", "事務所", "家賃按分", "地代"], kamoku: "地代家賃", notes: "自宅兼事務所の場合は事業使用割合で按分が必要です。" },
  { keywords: ["コワーキング", "シェアオフィス", "レンタルオフィス", "WeWork", "自習室"], kamoku: "地代家賃", notes: "利用実態に応じて全額経費計上可能なことが多い。" },
  { keywords: ["駐車場代", "月極"], kamoku: "地代家賃", notes: "事業用車両の駐車場。プライベート兼用の場合は按分。" },
  { keywords: ["電気代", "電気料金", "電力", "東京電力", "関西電力", "電気"], kamoku: "水道光熱費", notes: "自宅兼事務所の場合は事業使用割合で按分。" },
  { keywords: ["ガス代", "ガス料金", "都市ガス", "プロパン"], kamoku: "水道光熱費", notes: "自宅兼事務所の場合は事業使用割合で按分。" },
  { keywords: ["水道代", "水道料金", "下水道"], kamoku: "水道光熱費", notes: "自宅兼事務所の場合は按分。" },
  { keywords: ["広告", "Google広告", "Facebook広告", "Instagram広告", "Twitter広告", "X広告", "YouTube広告", "リスティング", "SEO", "SNS広告", "Meta広告"], kamoku: "広告宣伝費", notes: "事業の集客目的の広告費。" },
  { keywords: ["名刺", "チラシ", "パンフレット", "ポスター", "バナー", "印刷物", "デザイン制作"], kamoku: "広告宣伝費", notes: "販促・PR目的の制作費。" },
  { keywords: ["Canva", "Adobe", "Figma", "Photoshop", "Illustrator", "デザインツール"], kamoku: "広告宣伝費または消耗品費", notes: "主に広告・デザイン目的なら広告宣伝費、ツールとして使うなら消耗品費でも可。" },
  { keywords: ["外注", "業務委託", "フリーランス", "クラウドワークス", "ランサーズ", "ライター", "デザイナー", "エンジニア報酬", "下請け"], kamoku: "外注費", notes: "他者に業務を依頼した場合。源泉徴収が必要な場合があります（報酬の10.21%）。" },
  { keywords: ["GitHub", "GitLab", "Bitbucket"], kamoku: "通信費または消耗品費", notes: "開発ツールのサブスク。通信費または消耗品費どちらでも一般的。" },
  { keywords: ["ChatGPT", "Claude", "Copilot", "Notion AI", "OpenAI", "Anthropic"], kamoku: "通信費または消耗品費", notes: "AIツールのサブスク費用。業務利用前提。" },
  { keywords: ["Notion", "Confluence", "Backlog", "Jira", "Asana", "Trello", "Monday", "Airtable"], kamoku: "通信費または消耗品費", notes: "業務管理ツールのサブスク。" },
  { keywords: ["Microsoft 365", "Office", "Word", "Excel", "PowerPoint", "Google Workspace", "G Suite"], kamoku: "消耗品費または通信費", notes: "オフィスソフトのサブスク。" },
  { keywords: ["ソフトウェア", "アプリ", "サブスク", "subscription", "ライセンス", "月額", "年額"], kamoku: "消耗品費または通信費", notes: "業務用ソフトウェアのサブスクリプション費用。" },
  { keywords: ["新聞", "日経", "朝日新聞", "読売新聞", "電子新聞", "日経電子版"], kamoku: "新聞図書費（研修費）", notes: "業務に関連する情報収集目的のもの。" },
  { keywords: ["会議費", "ミーティング", "打ち合わせ", "コーヒー代", "お茶代"], kamoku: "会議費", notes: "1人あたり5,000円程度が目安（交際費との境界）。参加者・目的を記録。" },
  { keywords: ["健康診断", "人間ドック", "ストレスチェック"], kamoku: "福利厚生費", notes: "個人事業主自身の健康診断は事業主本人のみでは計上が難しい場合も。" },
  { keywords: ["保険料", "賠償保険", "損害保険", "火災保険", "PL保険", "情報漏洩保険"], kamoku: "損害保険料", notes: "事業用の保険料。生命保険料は社会保険料控除で別途申告。" },
  { keywords: ["印紙", "収入印紙", "固定資産税", "自動車税", "登録免許税", "事業税", "消費税"], kamoku: "租税公課", notes: "税金・印紙代など。所得税・住民税は経費不可。" },
  { keywords: ["振込手数料", "クレジット手数料", "決済手数料", "Stripe", "PayPal", "PayPay", "Square", "手数料"], kamoku: "支払手数料", notes: "銀行振込手数料・決済サービス手数料など。" },
  { keywords: ["税理士", "会計士", "弁護士", "社労士", "行政書士", "司法書士", "コンサル"], kamoku: "支払手数料", notes: "専門家報酬。源泉徴収が必要な場合があります。" },
  { keywords: ["修理", "修繕", "メンテナンス", "オーバーホール", "部品交換"], kamoku: "修繕費", notes: "資産の原状回復目的の修繕。改良・機能向上は資本的支出として資産計上になる場合も。" },
  { keywords: ["減価償却", "償却"], kamoku: "減価償却費", notes: "10万円以上の資産を期間按分した費用。自動計算・記帳が必要。" },
];

const ALL_KAMOKU = [
  { kamoku: "売上原価", description: "商品・材料の仕入れ費用" },
  { kamoku: "通信費", description: "電話・ネット・クラウドサービス・サーバー費" },
  { kamoku: "旅費交通費", description: "電車・タクシー・出張の交通費・宿泊費" },
  { kamoku: "交際費", description: "取引先との飲食・接待・贈答品" },
  { kamoku: "会議費", description: "打ち合わせ時のコーヒー代等（少額）" },
  { kamoku: "広告宣伝費", description: "Web広告・チラシ・名刺・デザイン制作費" },
  { kamoku: "外注費", description: "業務委託・フリーランスへの報酬" },
  { kamoku: "消耗品費", description: "10万円未満の備品・文房具・ソフトウェア等" },
  { kamoku: "工具器具備品", description: "10万円以上の備品（減価償却対象）" },
  { kamoku: "研修費", description: "セミナー・書籍・オンライン講座費用" },
  { kamoku: "新聞図書費", description: "新聞・書籍・業界紙（研修費に含める場合も）" },
  { kamoku: "地代家賃", description: "オフィス・自宅事務所・コワーキング賃料" },
  { kamoku: "水道光熱費", description: "電気・ガス・水道（按分必要な場合あり）" },
  { kamoku: "損害保険料", description: "事業用保険の保険料" },
  { kamoku: "修繕費", description: "資産の修理・原状回復費用" },
  { kamoku: "減価償却費", description: "固定資産の期間按分費用" },
  { kamoku: "租税公課", description: "印紙・固定資産税・事業税等" },
  { kamoku: "支払手数料", description: "振込手数料・決済手数料・専門家報酬" },
  { kamoku: "福利厚生費", description: "健康診断・従業員の福利費用" },
  { kamoku: "雑費", description: "他の科目に当てはまらない少額の費用" },
];

function classify(text: string): MatchResult | null {
  if (!text.trim()) return null;
  const upper = text.toUpperCase();
  const matched: { rule: Rule; keywords: string[] }[] = [];
  for (const rule of RULES) {
    const hits = rule.keywords.filter((kw) => upper.includes(kw.toUpperCase()));
    if (hits.length > 0) matched.push({ rule, keywords: hits });
  }
  if (matched.length === 0) return null;
  matched.sort((a, b) => b.keywords.length - a.keywords.length);
  const best = matched[0];
  return { kamoku: best.rule.kamoku, matchedKeywords: best.keywords, notes: best.rule.notes ?? "", amountNote: best.rule.amountNote };
}

export default function JigyouKeihiBunrui() {
  const [input, setInput] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [mode, setMode] = useState<"single" | "batch" | "table">("single");
  const [result, setResult] = useState<MatchResult | null | "no-match">(null);
  const [batchResults, setBatchResults] = useState<{ line: string; result: MatchResult | null }[]>([]);
  const [lang, setLang] = useState<Lang>("ja");

  const t = T[lang];

  const handleClassify = () => {
    const r = classify(input);
    setResult(r ?? "no-match");
  };

  const handleBatch = () => {
    const lines = batchInput.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    setBatchResults(lines.map((line) => ({ line, result: classify(line) })));
  };

  return (
    <div className="space-y-5">
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1); }
          50% { box-shadow: 0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(139,92,246,0.2); }
        }
        @keyframes float-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes border-spin { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .glass-card-bright {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .neon-focus:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(167,139,250,0.6), 0 0 20px rgba(167,139,250,0.2);
        }
        .glow-text { text-shadow: 0 0 30px rgba(196,181,253,0.6); }
        .result-card-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .gradient-border-box { position: relative; }
        .gradient-border-box::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(139,92,246,0.6), rgba(6,182,212,0.4), rgba(139,92,246,0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .number-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2d9f3;
        }
        .number-input::placeholder { color: rgba(196,181,253,0.4); }
        .table-row-stripe:hover { background: rgba(139,92,246,0.08); transition: background 0.2s ease; }
      `}</style>

      {/* Language toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-2xl p-1.5 flex gap-1">
        {(["single", "batch", "table"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              mode === m
                ? "bg-violet-600 text-white"
                : "text-violet-200 hover:text-white hover:bg-white/5"
            }`}
          >
            {m === "single" ? t.singleTab : m === "batch" ? t.batchTab : t.tableTab}
          </button>
        ))}
      </div>

      {/* Single mode */}
      {mode === "single" && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.singleLabel}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleClassify()}
                placeholder={t.singlePlaceholder}
                className="flex-1 number-input px-3 py-2 rounded-xl text-sm focus:outline-none neon-focus"
              />
              <button
                onClick={handleClassify}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {t.judgeBtn}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-violet-200">{t.singleHint}</p>
          </div>

          {result === "no-match" && (
            <div className="glass-card rounded-xl px-4 py-4" style={{ borderColor: "rgba(234,179,8,0.25)", background: "rgba(234,179,8,0.05)" }}>
              <p className="text-sm font-medium text-amber-300">{t.noMatchTitle}</p>
              <p className="mt-1 text-xs text-amber-200">{t.noMatchBody}</p>
            </div>
          )}

          {result && result !== "no-match" && (
            <div className="gradient-border-box glass-card-bright rounded-2xl p-5 result-card-glow space-y-4">
              <div>
                <p className="text-xs text-violet-200 font-medium uppercase tracking-wider mb-1">{t.recommendedKamoku}</p>
                <p className="text-2xl font-bold text-white glow-text">{result.kamoku}</p>
              </div>
              <div>
                <p className="text-xs text-violet-200 font-medium uppercase tracking-wider mb-1.5">{t.matchedKeywords}</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedKeywords.map((kw) => (
                    <span key={kw} className="px-2 py-0.5 text-xs rounded-full font-mono text-violet-100" style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)" }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
              {result.notes && (
                <div>
                  <p className="text-xs text-violet-200 font-medium uppercase tracking-wider mb-1">{t.notes}</p>
                  <p className="text-sm text-violet-100">{result.notes}</p>
                </div>
              )}
              {result.amountNote && (
                <div className="glass-card rounded-xl px-3 py-2.5" style={{ borderColor: "rgba(251,191,36,0.2)", background: "rgba(251,191,36,0.05)" }}>
                  <p className="text-xs font-medium text-amber-300 mb-0.5">{t.amountNote}</p>
                  <p className="text-xs text-amber-200">{result.amountNote}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Batch mode */}
      {mode === "batch" && (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.batchLabel}</label>
            <textarea
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder={t.batchPlaceholder}
              rows={6}
              className="w-full number-input rounded-xl px-3 py-2 text-sm font-mono focus:outline-none neon-focus resize-y"
            />
            <button
              onClick={handleBatch}
              className="mt-3 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {t.batchBtn}
            </button>
          </div>

          {batchResults.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="text-left px-3 py-2.5 text-xs font-medium text-violet-200 uppercase tracking-wider w-2/5">{t.batchDescCol}</th>
                      <th className="text-left px-3 py-2.5 text-xs font-medium text-violet-200 uppercase tracking-wider w-2/5">{t.batchKamokuCol}</th>
                      <th className="text-left px-3 py-2.5 text-xs font-medium text-violet-200 uppercase tracking-wider">{t.batchEvidenceCol}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchResults.map(({ line, result: r }, i) => (
                      <tr key={i} className="border-b border-white/5 table-row-stripe">
                        <td className="px-3 py-2.5 text-white/90 break-all">{line}</td>
                        <td className="px-3 py-2.5">
                          {r
                            ? <span className="font-medium text-violet-100">{r.kamoku}</span>
                            : <span className="text-amber-400 text-xs">{t.batchUnknown}</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          {r && (
                            <div className="flex flex-wrap gap-1">
                              {r.matchedKeywords.slice(0, 3).map((kw) => (
                                <span key={kw} className="px-1.5 py-0.5 text-xs rounded font-mono text-cyan-300" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table mode */}
      {mode === "table" && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-violet-200 uppercase tracking-wider w-1/3">{t.tableKamokuCol}</th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-violet-200 uppercase tracking-wider">{t.tableDescCol}</th>
                </tr>
              </thead>
              <tbody>
                {ALL_KAMOKU.map((item, i) => (
                  <tr key={item.kamoku} className={`border-b border-white/5 table-row-stripe ${i % 2 === 0 ? "" : ""}`}>
                    <td className="px-3 py-2.5 font-medium text-white/90">{item.kamoku}</td>
                    <td className="px-3 py-2.5 text-violet-200">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="glass-card rounded-xl px-4 py-3 text-xs text-violet-200">
        <span className="font-medium text-violet-100">免責事項：</span>
        {t.disclaimer}
      </div>

      {/* Ad placeholder */}
      <div className="glass-card rounded-xl flex items-center justify-center h-24 text-violet-200/30 text-sm select-none">
        {t.adPlaceholder}
      </div>

      {/* FAQ */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-5">{t.faqTitle}</h2>
        <div className="space-y-3">
          {t.faq.map((item, i) => (
            <details key={i} className="group glass-card rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-semibold text-white/90 hover:bg-white/5 list-none">
                <span>{item.q}</span>
                <span className="text-violet-400 text-lg leading-none group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-4 pb-4 pt-1 text-sm text-violet-100 border-t border-white/6">{item.a}</div>
            </details>
          ))}
        </div>
      </div>

      {/* JSON-LD FAQPage */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          { "@type": "Question", "name": "この事業経費 勘定科目 分類ツールは何ができますか？", "acceptedAnswer": { "@type": "Answer", "text": "経費の摘要から適切な勘定科目を提案するルールベースツール。入力するだけで即座に結果を表示します。" } },
          { "@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": { "@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。" } },
          { "@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": { "@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。" } },
        ],
      }) }} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "事業経費 勘定科目 分類",
  "description": "経費の摘要から適切な勘定科目を提案するルールベースツール",
  "url": "https://tools.loresync.dev/jigyou-keihi-bunrui",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "JPY" },
  "inLanguage": "ja"
}`
        }}
      />
    </div>
  );
}
