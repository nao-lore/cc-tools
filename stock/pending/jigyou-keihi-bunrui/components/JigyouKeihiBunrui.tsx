"use client";

import { useState } from "react";

// ────────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────────
interface Rule {
  keywords: string[];
  kamoku: string;
  notes?: string;
  amountNote?: string; // 金額で科目が変わる場合
}

interface MatchResult {
  kamoku: string;
  matchedKeywords: string[];
  notes: string;
  amountNote?: string;
}

// ────────────────────────────────────────────────
// ルールベース (~50ルール)
// ────────────────────────────────────────────────
const RULES: Rule[] = [
  // 通信費
  {
    keywords: ["AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud", "さくらインターネット", "Xserver", "エックスサーバー", "ロリポップ", "Vercel", "Netlify", "Heroku", "Cloudflare", "ドメイン", "レンタルサーバー", "VPS", "ホスティング"],
    kamoku: "通信費",
    notes: "クラウドサービス・サーバー費用は通信費が一般的。",
  },
  {
    keywords: ["携帯", "スマホ", "スマートフォン", "iPhone", "Android", "ドコモ", "au", "ソフトバンク", "楽天モバイル", "格安SIM", "SIM", "インターネット", "光回線", "Wi-Fi", "ルーター", "回線", "通話", "電話料"],
    kamoku: "通信費",
    notes: "事業用途の割合に応じて按分が必要な場合があります。",
  },
  {
    keywords: ["Slack", "Zoom", "Teams", "Chatwork", "LINE WORKS", "メール", "MailChimp", "SendGrid"],
    kamoku: "通信費",
    notes: "コミュニケーションツールのサブスクは通信費。",
  },
  // 旅費交通費
  {
    keywords: ["電車", "地下鉄", "バス", "交通費", "Suica", "PASMO", "ICカード", "定期", "乗車券"],
    kamoku: "旅費交通費",
    notes: "事業目的の移動のみ対象。通勤定期は給与所得者向けのため個人事業主は要注意。",
  },
  {
    keywords: ["タクシー", "Uber", "GO", "DiDi", "ハイヤー"],
    kamoku: "旅費交通費",
    notes: "事業目的の移動のみ対象。領収書を必ず保管してください。",
  },
  {
    keywords: ["新幹線", "特急", "飛行機", "航空", "ANA", "JAL", "Peach", "LCC", "高速バス", "夜行バス", "フェリー", "出張"],
    kamoku: "旅費交通費",
    notes: "出張の場合は出張旅費規程を作成しておくと安心です。",
  },
  {
    keywords: ["ホテル", "宿泊", "旅館", "民泊", "Airbnb"],
    kamoku: "旅費交通費",
    notes: "事業目的の出張宿泊費。観光目的は不可。",
  },
  {
    keywords: ["ガソリン", "軽油", "駐車場", "ETC", "高速道路", "有料道路"],
    kamoku: "旅費交通費",
    notes: "事業用車両のみ。プライベート利用がある場合は按分が必要。",
  },
  // 交際費
  {
    keywords: ["接待", "会食", "接待飲食", "接待費", "得意先", "取引先", "クライアント", "お客様"],
    kamoku: "交際費",
    notes: "個人事業主は全額交際費として計上可能（法人と異なります）。",
  },
  {
    keywords: ["飲食", "ランチ", "ディナー", "食事代", "レストラン", "居酒屋", "カフェ"],
    kamoku: "交際費",
    notes: "1人での食事は交際費にならない場合があります。事業関係者との会食であることを記録してください。",
    amountNote: "1人5,000円基準は法人向けです。個人事業主は状況により判断。",
  },
  {
    keywords: ["手土産", "贈答", "お中元", "お歳暮", "ギフト", "プレゼント", "商品券"],
    kamoku: "交際費",
    notes: "取引先への贈答品。個人的な贈り物は不可。",
  },
  {
    keywords: ["ゴルフ", "接待ゴルフ", "会員権"],
    kamoku: "交際費",
    notes: "事業目的のゴルフ接待。趣味のゴルフは不可。",
  },
  // 消耗品費 / 工具器具備品
  {
    keywords: ["PC", "パソコン", "MacBook", "Mac", "Windows", "ノートPC", "デスクトップ", "laptop"],
    kamoku: "消耗品費（10万円未満）または工具器具備品（10万円以上）",
    notes: "購入金額によって科目が変わります。",
    amountNote: "10万円未満→消耗品費（一括経費）、10万円以上→工具器具備品（減価償却）。青色申告なら30万円未満は特例で一括経費化可能。",
  },
  {
    keywords: ["モニター", "ディスプレイ", "キーボード", "マウス", "Webカメラ", "ヘッドセット", "イヤホン", "スピーカー", "マイク"],
    kamoku: "消耗品費（10万円未満）または工具器具備品（10万円以上）",
    notes: "PC周辺機器。金額で科目が変わります。",
    amountNote: "10万円未満→消耗品費、10万円以上→工具器具備品（減価償却）。",
  },
  {
    keywords: ["プリンター", "スキャナー", "複合機", "コピー機"],
    kamoku: "消耗品費（10万円未満）または工具器具備品（10万円以上）",
    notes: "金額によって科目が変わります。",
    amountNote: "10万円未満→消耗品費、10万円以上→工具器具備品（減価償却）。",
  },
  {
    keywords: ["文房具", "コピー用紙", "封筒", "印刷用紙", "ボールペン", "ノート", "付箋", "クリアファイル", "ホッチキス", "消耗品"],
    kamoku: "消耗品費",
    notes: "日常的な事務用品。1点10万円未満のもの。",
  },
  {
    keywords: ["インク", "トナー", "カートリッジ"],
    kamoku: "消耗品費",
    notes: "プリンター用消耗品。",
  },
  {
    keywords: ["机", "デスク", "椅子", "チェア", "棚", "本棚", "キャビネット", "家具"],
    kamoku: "消耗品費（10万円未満）または工具器具備品（10万円以上）",
    notes: "事業用家具。金額によって科目が変わります。",
    amountNote: "10万円未満→消耗品費、10万円以上→工具器具備品（減価償却）。",
  },
  // 研修費（教育研修費）
  {
    keywords: ["書籍", "本", "技術書", "雑誌", "専門書", "参考書", "Amazon", "楽天ブックス"],
    kamoku: "研修費（新聞図書費）",
    notes: "事業に関連する書籍のみ対象。小説・趣味本は不可。",
  },
  {
    keywords: ["Udemy", "Coursera", "Progate", "ドットインストール", "online learning", "eラーニング", "オンライン講座", "動画学習"],
    kamoku: "研修費",
    notes: "事業スキルアップ目的のオンライン講座。",
  },
  {
    keywords: ["セミナー", "研修", "講習", "ウェビナー", "勉強会", "ハンズオン", "ワークショップ", "カンファレンス", "Conference"],
    kamoku: "研修費",
    notes: "業務に関連するセミナー・勉強会の参加費。",
  },
  {
    keywords: ["資格", "試験", "検定", "TOEIC", "英会話"],
    kamoku: "研修費",
    notes: "業務に必要な資格取得費用。直接業務と関係ない資格は不可の場合あり。",
  },
  // 地代家賃
  {
    keywords: ["家賃", "賃料", "テナント", "オフィス", "事務所", "家賃按分", "地代"],
    kamoku: "地代家賃",
    notes: "自宅兼事務所の場合は事業使用割合で按分が必要です。",
  },
  {
    keywords: ["コワーキング", "シェアオフィス", "レンタルオフィス", "WeWork", "自習室"],
    kamoku: "地代家賃",
    notes: "利用実態に応じて全額経費計上可能なことが多い。",
  },
  {
    keywords: ["駐車場代", "月極"],
    kamoku: "地代家賃",
    notes: "事業用車両の駐車場。プライベート兼用の場合は按分。",
  },
  // 水道光熱費
  {
    keywords: ["電気代", "電気料金", "電力", "東京電力", "関西電力", "電気"],
    kamoku: "水道光熱費",
    notes: "自宅兼事務所の場合は事業使用割合で按分。",
  },
  {
    keywords: ["ガス代", "ガス料金", "都市ガス", "プロパン"],
    kamoku: "水道光熱費",
    notes: "自宅兼事務所の場合は事業使用割合で按分。暖房目的は認められやすい。",
  },
  {
    keywords: ["水道代", "水道料金", "下水道"],
    kamoku: "水道光熱費",
    notes: "自宅兼事務所の場合は按分。",
  },
  // 広告宣伝費
  {
    keywords: ["広告", "Google広告", "Facebook広告", "Instagram広告", "Twitter広告", "X広告", "YouTube広告", "リスティング", "SEO", "SNS広告", "Meta広告"],
    kamoku: "広告宣伝費",
    notes: "事業の集客目的の広告費。",
  },
  {
    keywords: ["名刺", "チラシ", "パンフレット", "ポスター", "バナー", "印刷物", "デザイン制作"],
    kamoku: "広告宣伝費",
    notes: "販促・PR目的の制作費。",
  },
  {
    keywords: ["Canva", "Adobe", "Figma", "Photoshop", "Illustrator", "デザインツール"],
    kamoku: "広告宣伝費または消耗品費",
    notes: "主に広告・デザイン目的なら広告宣伝費、ツールとして使うなら消耗品費でも可。",
  },
  // 外注費
  {
    keywords: ["外注", "業務委託", "フリーランス", "クラウドワークス", "ランサーズ", "ライター", "デザイナー", "エンジニア報酬", "下請け"],
    kamoku: "外注費",
    notes: "他者に業務を依頼した場合。源泉徴収が必要な場合があります（報酬の10.21%）。",
  },
  // ソフトウェア・サブスク
  {
    keywords: ["GitHub", "GitLab", "Bitbucket"],
    kamoku: "通信費または消耗品費",
    notes: "開発ツールのサブスク。通信費または消耗品費どちらでも一般的。継続使用すれば通信費が自然。",
  },
  {
    keywords: ["ChatGPT", "Claude", "Copilot", "Notion AI", "AI", "OpenAI", "Anthropic"],
    kamoku: "通信費または消耗品費",
    notes: "AIツールのサブスク費用。業務利用前提。",
  },
  {
    keywords: ["Notion", "Confluence", "esa", "Backlog", "Jira", "Asana", "Trello", "Monday", "Airtable"],
    kamoku: "通信費または消耗品費",
    notes: "業務管理ツールのサブスク。",
  },
  {
    keywords: ["Microsoft 365", "Office", "Word", "Excel", "PowerPoint", "Google Workspace", "G Suite"],
    kamoku: "消耗品費または通信費",
    notes: "オフィスソフトのサブスク。",
  },
  {
    keywords: ["ソフトウェア", "アプリ", "サブスク", "subscription", "ライセンス", "月額", "年額"],
    kamoku: "消耗品費または通信費",
    notes: "業務用ソフトウェアのサブスクリプション費用。",
  },
  // 新聞図書費
  {
    keywords: ["新聞", "日経", "朝日新聞", "読売新聞", "電子新聞", "NewsPicksプレミアム", "日経電子版"],
    kamoku: "新聞図書費（研修費）",
    notes: "業務に関連する情報収集目的のもの。",
  },
  // 会議費
  {
    keywords: ["会議費", "ミーティング", "打ち合わせ", "コーヒー代", "お茶代"],
    kamoku: "会議費",
    notes: "1人あたり5,000円程度が目安（交際費との境界）。参加者・目的を記録。",
  },
  // 福利厚生費
  {
    keywords: ["健康診断", "人間ドック", "ストレスチェック"],
    kamoku: "福利厚生費",
    notes: "個人事業主自身の健康診断は事業主本人のみでは計上が難しい場合も。従業員がいる場合は全員対象にすること。",
  },
  // 損害保険料
  {
    keywords: ["保険料", "賠償保険", "損害保険", "火災保険", "PL保険", "情報漏洩保険"],
    kamoku: "損害保険料",
    notes: "事業用の保険料。生命保険料は社会保険料控除で別途申告。",
  },
  // 租税公課
  {
    keywords: ["印紙", "収入印紙", "固定資産税", "自動車税", "登録免許税", "事業税", "消費税"],
    kamoku: "租税公課",
    notes: "税金・印紙代など。所得税・住民税は経費不可。",
  },
  // 支払手数料
  {
    keywords: ["振込手数料", "クレジット手数料", "決済手数料", "Stripe", "PayPal", "PayPay", "Square", "手数料"],
    kamoku: "支払手数料",
    notes: "銀行振込手数料・決済サービス手数料など。",
  },
  {
    keywords: ["税理士", "会計士", "弁護士", "社労士", "行政書士", "司法書士", "コンサル"],
    kamoku: "支払手数料",
    notes: "専門家報酬。源泉徴収が必要な場合があります。",
  },
  // 修繕費
  {
    keywords: ["修理", "修繕", "メンテナンス", "オーバーホール", "部品交換"],
    kamoku: "修繕費",
    notes: "資産の原状回復目的の修繕。改良・機能向上は資本的支出として資産計上になる場合も。",
  },
  // 減価償却費
  {
    keywords: ["減価償却", "償却"],
    kamoku: "減価償却費",
    notes: "10万円以上の資産を期間按分した費用。自動計算・記帳が必要。",
  },
];

// ────────────────────────────────────────────────
// 全勘定科目一覧（参照テーブル）
// ────────────────────────────────────────────────
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

// ────────────────────────────────────────────────
// マッチングロジック
// ────────────────────────────────────────────────
function classify(text: string): MatchResult | null {
  if (!text.trim()) return null;

  const upper = text.toUpperCase();
  const matched: { rule: Rule; keywords: string[] }[] = [];

  for (const rule of RULES) {
    const hits = rule.keywords.filter((kw) =>
      upper.includes(kw.toUpperCase())
    );
    if (hits.length > 0) {
      matched.push({ rule, keywords: hits });
    }
  }

  if (matched.length === 0) return null;

  // 最もキーワードがヒットしたルールを採用
  matched.sort((a, b) => b.keywords.length - a.keywords.length);
  const best = matched[0];

  return {
    kamoku: best.rule.kamoku,
    matchedKeywords: best.keywords,
    notes: best.rule.notes ?? "",
    amountNote: best.rule.amountNote,
  };
}

// ────────────────────────────────────────────────
// コンポーネント
// ────────────────────────────────────────────────
export default function JigyouKeihiBunrui() {
  const [input, setInput] = useState("");
  const [batchInput, setBatchInput] = useState("");
  const [mode, setMode] = useState<"single" | "batch" | "table">("single");
  const [result, setResult] = useState<MatchResult | null | "no-match">(null);
  const [batchResults, setBatchResults] = useState<
    { line: string; result: MatchResult | null }[]
  >([]);

  const handleClassify = () => {
    const r = classify(input);
    setResult(r ?? "no-match");
  };

  const handleBatch = () => {
    const lines = batchInput
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const results = lines.map((line) => ({ line, result: classify(line) }));
    setBatchResults(results);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">経費→勘定科目 分類ツール</h1>
        <p className="mt-1 text-sm text-gray-500">
          摘要テキストから勘定科目をルールベースで即判定。フリーランス・個人事業主向け。
        </p>
      </div>

      {/* タブ */}
      <div className="flex gap-2 border-b border-gray-200">
        {(["single", "batch", "table"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              mode === m
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {m === "single" ? "1件判定" : m === "batch" ? "まとめて判定" : "科目一覧"}
          </button>
        ))}
      </div>

      {/* 1件判定モード */}
      {mode === "single" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              摘要を入力
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleClassify()}
                placeholder="例：Amazon AWS利用料、電車代、Udemy講座"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleClassify}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                判定
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              例：AWS EC2料金 / Zoom月額 / 書籍代 / 新幹線 東京→大阪
            </p>
          </div>

          {result === "no-match" && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm font-medium text-yellow-800">判定できませんでした</p>
              <p className="mt-1 text-xs text-yellow-700">
                キーワードが認識されませんでした。摘要をより具体的に入力するか、税理士にご相談ください。判断に迷う場合は「雑費」として計上し、後で修正するのも一手です。
              </p>
            </div>
          )}

          {result && result !== "no-match" && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
              <div>
                <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">推奨勘定科目</p>
                <p className="text-xl font-bold text-blue-900 mt-0.5">{result.kamoku}</p>
              </div>
              <div>
                <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">根拠キーワード</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {result.matchedKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
              {result.notes && (
                <div>
                  <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">注意事項</p>
                  <p className="mt-0.5 text-sm text-blue-800">{result.notes}</p>
                </div>
              )}
              {result.amountNote && (
                <div className="rounded bg-amber-50 border border-amber-200 px-3 py-2">
                  <p className="text-xs font-medium text-amber-700">金額による違い</p>
                  <p className="text-xs text-amber-800 mt-0.5">{result.amountNote}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* まとめて判定モード */}
      {mode === "batch" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              摘要を複数行入力（1行1件）
            </label>
            <textarea
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder={"Amazon AWS利用料\n電車代 渋谷→新宿\nUdemy購入\nZoom Pro月額\n接待 〇〇社 ランチ"}
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <button
            onClick={handleBatch}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            まとめて判定
          </button>

          {batchResults.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 w-2/5">摘要</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 w-2/5">推奨勘定科目</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">根拠</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {batchResults.map(({ line, result: r }, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 text-gray-800 break-all">{line}</td>
                      <td className="px-3 py-2">
                        {r ? (
                          <span className="font-medium text-blue-700">{r.kamoku}</span>
                        ) : (
                          <span className="text-yellow-600">判定不可</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {r && (
                          <div className="flex flex-wrap gap-1">
                            {r.matchedKeywords.slice(0, 3).map((kw) => (
                              <span key={kw} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
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
          )}
        </div>
      )}

      {/* 科目一覧モード */}
      {mode === "table" && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 w-1/3">勘定科目</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">よくある経費例</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ALL_KAMOKU.map((item, i) => (
                <tr key={item.kamoku} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2 font-medium text-gray-800">{item.kamoku}</td>
                  <td className="px-3 py-2 text-gray-600">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 免責 */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
        <span className="font-medium">免責事項：</span>
        このツールはルールベースの参考情報です。最終的な経費計上・勘定科目の判断は税理士または税務署にご確認ください。
        按分計算・源泉徴収・青色申告特例等の詳細は個別状況によって異なります。
      </div>

      {/* 広告プレースホルダー */}
      <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center h-24 text-gray-400 text-sm">
        広告
      </div>
    </div>
  );
}
