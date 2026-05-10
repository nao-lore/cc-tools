"use client";

import { useMemo, useState } from "react";

type AccountCategory = {
  account: string;
  description: string;
  examples: string[];
  keywords: string[];
  caution: string;
  tone: string;
};

type Candidate = AccountCategory & {
  score: number;
  matchedKeywords: string[];
};

const CATEGORIES: AccountCategory[] = [
  {
    account: "旅費交通費",
    description: "業務上の移動、出張、宿泊に関する費用。",
    examples: ["電車代", "バス代", "タクシー代", "新幹線", "航空券", "ホテル", "駐車場", "高速料金"],
    keywords: ["電車", "バス", "タクシー", "新幹線", "飛行機", "航空", "ホテル", "宿泊", "出張", "駐車", "高速", "交通"],
    caution: "私用移動が混ざる場合は、事業利用分だけに分けて記録します。",
    tone: "border-sky-200 bg-sky-50 text-sky-900",
  },
  {
    account: "通信費",
    description: "電話、インターネット、郵送、配送など通信・連絡に関する費用。",
    examples: ["スマホ料金", "インターネット回線", "切手", "郵便", "宅配便", "クラウド電話"],
    keywords: ["スマホ", "携帯", "電話", "インターネット", "ネット", "wifi", "郵便", "切手", "宅配", "配送", "サーバー"],
    caution: "私用兼用のスマホや回線は、使用実態に合わせた家事按分の根拠を残します。",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  {
    account: "会議費",
    description: "打ち合わせ、会議室、会議に伴う軽い飲食などの費用。",
    examples: ["会議室利用", "打ち合わせ", "コワーキング", "オンライン会議ツール", "会議用飲み物"],
    keywords: ["会議", "打ち合わせ", "ミーティング", "会議室", "コワーキング", "商談", "zoom", "オンライン会議"],
    caution: "取引先の接待性が強い飲食は接待交際費候補としても確認します。",
    tone: "border-violet-200 bg-violet-50 text-violet-900",
  },
  {
    account: "接待交際費",
    description: "取引先や顧客との関係維持、接待、贈答に関する費用。",
    examples: ["取引先との会食", "手土産", "贈答品", "お中元", "お歳暮", "慶弔費"],
    keywords: ["会食", "飲食", "接待", "取引先", "手土産", "贈答", "お中元", "お歳暮", "慶弔", "ゴルフ"],
    caution: "相手先、目的、参加者、金額をメモしておくと説明しやすくなります。",
    tone: "border-orange-200 bg-orange-50 text-orange-900",
  },
  {
    account: "消耗品費",
    description: "文房具、事務用品、短期間で使う備品や小額備品の費用。",
    examples: ["文房具", "コピー用紙", "プリンタインク", "マウス", "キーボード", "小型備品"],
    keywords: ["文房具", "コピー", "用紙", "プリンタ", "インク", "マウス", "キーボード", "備品", "消耗品", "amazon"],
    caution: "パソコンや高額機材は、金額・使用期間・資産計上の要否を別途確認します。",
    tone: "border-amber-200 bg-amber-50 text-amber-900",
  },
  {
    account: "広告宣伝費",
    description: "集客、広告、販促、認知拡大のための費用。",
    examples: ["Google広告", "SNS広告", "チラシ", "名刺", "LP制作", "SEO施策"],
    keywords: ["広告", "宣伝", "販促", "google広告", "sns広告", "チラシ", "名刺", "lp", "seo", "マーケティング"],
    caution: "サイト制作など成果物が資産性を持つ場合は、処理方法を確認します。",
    tone: "border-pink-200 bg-pink-50 text-pink-900",
  },
  {
    account: "外注費",
    description: "業務の一部を外部の個人・法人へ委託した費用。",
    examples: ["デザイン委託", "システム開発", "ライティング", "翻訳", "動画編集", "業務委託"],
    keywords: ["外注", "委託", "業務委託", "デザイン", "開発", "翻訳", "ライティング", "動画編集", "制作", "フリーランス"],
    caution: "源泉徴収が必要な報酬に該当するか、請求書と契約内容を確認します。",
    tone: "border-teal-200 bg-teal-50 text-teal-900",
  },
  {
    account: "地代家賃",
    description: "事務所、店舗、倉庫、作業場所などの賃料。",
    examples: ["事務所家賃", "店舗家賃", "倉庫", "レンタルオフィス", "自宅兼事務所"],
    keywords: ["家賃", "賃料", "事務所", "店舗", "倉庫", "レンタルオフィス", "シェアオフィス", "自宅"],
    caution: "自宅兼事務所は床面積や使用時間など、合理的な按分根拠が必要です。",
    tone: "border-red-200 bg-red-50 text-red-900",
  },
  {
    account: "新聞図書費",
    description: "業務に必要な書籍、新聞、業界誌、情報収集に関する費用。",
    examples: ["専門書", "技術書", "新聞", "業界誌", "有料メディア", "学習教材"],
    keywords: ["本", "書籍", "新聞", "雑誌", "専門書", "技術書", "教材", "学習", "有料記事", "メディア"],
    caution: "業務との関連性が分かるよう、購入目的をメモしておくと安全です。",
    tone: "border-indigo-200 bg-indigo-50 text-indigo-900",
  },
  {
    account: "水道光熱費",
    description: "事業で使う電気、ガス、水道などの費用。",
    examples: ["電気代", "ガス代", "水道代", "作業場の光熱費"],
    keywords: ["電気", "ガス", "水道", "光熱", "電力", "エアコン"],
    caution: "自宅兼用の場合は、使用時間や面積などで事業分を按分します。",
    tone: "border-cyan-200 bg-cyan-50 text-cyan-900",
  },
  {
    account: "支払手数料",
    description: "決済手数料、振込手数料、プラットフォーム利用料などの費用。",
    examples: ["銀行振込手数料", "カード決済手数料", "販売サイト手数料", "Stripe手数料"],
    keywords: ["手数料", "振込", "決済", "stripe", "paypal", "販売手数料", "プラットフォーム"],
    caution: "売上から差し引かれる手数料も、明細で金額を確認して記録します。",
    tone: "border-slate-200 bg-slate-50 text-slate-900",
  },
  {
    account: "租税公課",
    description: "事業に関係する税金や公的な負担金。",
    examples: ["印紙税", "固定資産税の事業分", "登録手数料", "事業税"],
    keywords: ["印紙", "税金", "固定資産税", "登録", "公課", "証紙", "事業税"],
    caution: "所得税や住民税など、事業主個人にかかる税金は経費にならないものがあります。",
    tone: "border-lime-200 bg-lime-50 text-lime-900",
  },
];

const SAMPLES = ["タクシー代", "自宅兼事務所の家賃", "取引先との会食", "Amazonでマウスを購入", "スマホ料金の事業分"];

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, "");
}

function getCandidates(query: string): Candidate[] {
  const normalized = normalize(query);
  if (!normalized) return [];

  return CATEGORIES.map((category) => {
    const matchedKeywords = category.keywords.filter((keyword) => normalized.includes(normalize(keyword)));
    return {
      ...category,
      matchedKeywords,
      score: matchedKeywords.length,
    };
  })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.account.localeCompare(b.account, "ja"))
    .slice(0, 3);
}

function getFlags(query: string) {
  const normalized = normalize(query);
  const flags = [];
  if (/(自宅|家賃|電気|ガス|水道|スマホ|携帯|インターネット|ネット)/.test(normalized)) {
    flags.push("私用兼用の可能性があります。家事按分の割合と根拠をメモしてください。");
  }
  if (/(pc|パソコン|カメラ|機材|設備|高額|10万|30万)/.test(normalized)) {
    flags.push("高額な備品は消耗品費ではなく固定資産や減価償却になる可能性があります。金額と使用期間を確認してください。");
  }
  if (/(報酬|原稿|デザイン|講演|士業|業務委託|外注)/.test(normalized)) {
    flags.push("外注報酬は源泉徴収や支払調書の対象になる場合があります。請求内容を確認してください。");
  }
  return flags;
}

function buildCopyText(query: string, candidates: Candidate[], flags: string[]) {
  return [
    `経費内容: ${query}`,
    ...candidates.map((candidate, index) => `${index + 1}. ${candidate.account} - ${candidate.description}（一致: ${candidate.matchedKeywords.join(", ")}）`),
    ...(flags.length ? ["注意点:", ...flags.map((flag) => `- ${flag}`)] : []),
    "最終判断は帳簿・領収書・業務実態に合わせて確認してください。",
  ].join("\n");
}

export default function KeihiBunrui() {
  const [query, setQuery] = useState("タクシー代");
  const [copied, setCopied] = useState(false);
  const candidates = useMemo(() => getCandidates(query), [query]);
  const flags = useMemo(() => getFlags(query), [query]);
  const hasInput = query.trim().length > 0;

  function reset() {
    setQuery("");
    setCopied(false);
  }

  async function copyResult() {
    if (!hasInput) return;
    await navigator.clipboard.writeText(buildCopyText(query, candidates, flags));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,0.85fr)_minmax(380px,0.7fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">経費内容</h2>
              <p className="mt-1 text-sm text-slate-500">領収書や明細の内容をそのまま入力すると、近い勘定科目候補を表示します。</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="w-fit whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              リセット
            </button>
          </div>

          <label htmlFor="keihi-query" className="mt-5 block text-sm font-semibold text-slate-800">
            内容・用途
          </label>
          <textarea
            id="keihi-query"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCopied(false);
            }}
            placeholder="例: 取引先との打ち合わせで使ったカフェ代"
            rows={4}
            className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-slate-950"
          />

          <p className={`mt-3 min-h-5 text-sm ${hasInput ? "text-slate-500" : "text-red-600"}`}>
            {hasInput ? "入力内容を検証し、キーワード一致による候補を表示します。入力値はブラウザ上で処理され、外部に送信されません。" : "経費の内容を入力してください。"}
          </p>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SAMPLES.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setQuery(sample);
                    setCopied(false);
                  }}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-950 hover:bg-slate-50"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!hasInput}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {copied ? "コピーしました" : "候補をコピー"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              入力をクリア
            </button>
          </div>
        </div>

        <aside className="p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">候補</h2>
          {!hasInput ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">内容を入力してください。</div>
          ) : candidates.length === 0 ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              一致する候補がありません。用途、相手先、購入物をもう少し具体的に入力するか、下の勘定科目一覧から近いものを確認してください。
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {candidates.map((candidate, index) => (
                <div key={candidate.account} className={`rounded-2xl border p-4 ${candidate.tone}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold opacity-70">候補 {index + 1}</p>
                      <p className="mt-1 text-2xl font-bold">{candidate.account}</p>
                    </div>
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold">一致 {candidate.score}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6">{candidate.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {candidate.matchedKeywords.map((keyword) => (
                      <span key={keyword} className="rounded-full bg-white/70 px-2 py-1 text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 rounded-xl bg-white/70 p-3 text-xs leading-5">{candidate.caution}</p>
                </div>
              ))}
            </div>
          )}

          {flags.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-950">確認ポイント</p>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-amber-900">
                {flags.map((flag) => (
                  <li key={flag}>・{flag}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <div className="border-t border-slate-200 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-950">主要勘定科目一覧</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <button
              key={category.account}
              type="button"
              onClick={() => {
                setQuery(category.examples[0]);
                setCopied(false);
              }}
              className={`rounded-xl border p-3 text-left transition hover:shadow-sm ${category.tone}`}
            >
              <p className="font-semibold">{category.account}</p>
              <p className="mt-1 text-xs leading-5 opacity-80">{category.description}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
