"use client";
import { useState } from "react";

// ---- 型定義 ----
type Zokugara =
  | "友人"
  | "同僚"
  | "上司"
  | "部下"
  | "取引先"
  | "兄弟姉妹"
  | "いとこ"
  | "甥姪"
  | "祖父母"
  | "叔父叔母";

type Nendai = "20代" | "30代" | "40代" | "50代" | "60代以上";
type Kankeisei = "親しい" | "普通" | "あまり親しくない";
type Chiiki = "全国平均" | "北海道（会費制）" | "関東" | "関西" | "九州";
type Lang = "ja" | "en";

// ---- 翻訳定数 ----
const T = {
  ja: {
    // Tabs
    calc: "相場を調べる",
    table: "相場一覧表",
    manner: "マナーガイド",
    // Headings
    selectCondition: "条件を選択",
    recommended: "おすすめ金額",
    generalRange: "一般的な相場",
    rangeLabel: "一般的な範囲：",
    envelope: "ご祝儀袋の目安",
    ngManners: "NGマナー・注意事項",
    allTable: "全続柄×年代 相場一覧",
    tableNote: "関係性「普通」の場合の標準金額（万円）",
    tableFootnote: "※ 上記は関係性「普通」での目安です。親しい場合は+1万円、あまり親しくない場合は−1万円が目安です。",
    envelopeGuide: "ご祝儀袋の選び方",
    mizuhiki: "水引の結び方",
    mizuhikiDesc: "結婚祝いは必ず結び切り（あわじ結び）を使用。「一度結んだらほどけない＝再婚しない」の意。蝶結びは出産・入学など何度あってもよいお祝い用。",
    writeGuide: "書き方ガイド",
    omoteGaki: "表書き（外袋）",
    nakaFukuro: "中袋の書き方",
    shinsatsu: "新札の準備方法",
    hokkaido: "北海道の会費制について",
    // Labels
    zokugaraLabel: "続柄・関係",
    nendaiLabel: "あなたの年代",
    kankeiseiLabel: "関係性",
    chiikiLabel: "地域",
    hokkaido_title: "北海道は会費制",
    hokkaido_body: "会費 6,000〜10,000円を支払う形式が一般的です。上記の金額は参考値です。",
    attention: "注意",
    // Footer
    disclaimer: "※ 相場はあくまで目安です。地域・家族の慣習・関係性により異なります。最終的には周囲の方に確認することをおすすめします。",
    // Guide
    guideTitle: "ご祝儀相場 計算ツールの使い方",
    guide: [
      { step: "1", title: "続柄・関係を選ぶ", body: "友人・同僚・上司・兄弟など、新郎新婦との続柄をボタンで選択してください。" },
      { step: "2", title: "あなたの年代と関係性を選択", body: "年代が上がるほど相場も高くなる傾向があります。「親しい」「普通」「あまり親しくない」で金額が±1万円調整されます。" },
      { step: "3", title: "地域を設定する", body: "北海道の会費制など、地域特有の慣習がある場合は自動で注意メッセージが表示されます。" },
      { step: "4", title: "おすすめ金額とマナーを確認", body: "相場金額とNG金額の警告、ご祝儀袋の選び方まで一括で確認できます。" },
    ],
    // FAQ
    faqTitle: "ご祝儀に関するよくある質問",
    faq: [
      { q: "友人の結婚式のご祝儀の相場はいくらですか？", a: "20〜30代の友人へのご祝儀は3万円が一般的な相場です。親しい関係なら4万円（偶数NG）を避けて5万円にするケースもあります。" },
      { q: "ご祝儀に4万円はなぜNGなのですか？", a: "4は「死」を連想させる縁起の悪い数字とされています。4万円を贈る場合は3万円か5万円に変更してください。偶数全般が「縁が切れる」として避けられますが、2万円・8万円・10万円は例外とされています。" },
      { q: "夫婦で参加する場合のご祝儀はいくらが相場ですか？", a: "夫婦2人で参加する場合は、1人分の相場×1.5〜2倍が目安です。友人の場合は5〜7万円、上司や親族なら7〜10万円が一般的です。" },
      { q: "欠席する場合のご祝儀はどうすればいいですか？", a: "式を欠席する場合は、通常の相場の3分の1〜半額を目安に現金書留で郵送するか、お祝いの品と合わせて贈るのが一般的です。式の1〜2週間前に届くよう手配しましょう。" },
      { q: "北海道の結婚式の会費制とは何ですか？", a: "北海道では披露宴に「会費制」を採用することが一般的です。当日受付で6,000〜10,000円を支払う形式で、別途ご祝儀袋は不要なケースがほとんどです。招待状に「会費制」と記載があるか確認してください。" },
    ],
    // Related tools
    relatedTitle: "関連ツール",
    relatedTools: [
      { href: "/tools/hikidemono", label: "引き出物 相場ツール", desc: "引き出物の金額帯・選び方を確認" },
      { href: "/tools/cho-jyu-iwai", label: "長寿祝い 相場ツール", desc: "還暦・古希などのお祝い金額目安" },
      { href: "/tools/goshugi-souba", label: "出産祝い 相場ツール", desc: "出産内祝いの金額目安" },
    ],
    // CTA
    ctaTitle: "冠婚葬祭のマナーを網羅したツール集",
    ctaDesc: "ご祝儀・引き出物・お返しなど、おもてなしにまつわる計算を無料で。",
    ctaBtn: "全ツール一覧を見る",
    // NG items
    ngItems: [
      { title: "4万円はNG", body: "「死」を連想させるため厳禁。3万円か5万円に。" },
      { title: "偶数はNG（例外あり）", body: "「割り切れる＝縁が切れる」とされる。2万円・8万円・10万円は例外として許容。" },
      { title: "9万円はNG", body: "「苦」を連想させるため。10万円か8万円を。" },
      { title: "新札を用意する", body: "「前もって準備した＝お祝いを楽しみにしていた」の意。銀行ATMで交換可。" },
      { title: "欠席時は3分の1〜半額", body: "式を欠席する場合、通常相場の1/3〜1/2が目安。お祝いの品と合わせても。" },
      { title: "夫婦連名は通常の1.5〜2倍", body: "夫婦で出席する場合は1人分×1.5〜2倍が相場。2人で5〜7万円が一般的。" },
    ],
    // Table header
    zokugaraHeader: "続柄",
    // Omote items
    omoteItems: [
      { label: "壽（寿）", desc: "最も格式が高い。「寿」「壽」どちらもOK" },
      { label: "御祝", desc: "シンプルで汎用的。「御結婚御祝」も可" },
      { label: "御結婚御祝", desc: "「ご結婚おめでとう」の意。丁寧な表現" },
      { label: "Happy Wedding", desc: "洋式・カジュアルな披露宴向け" },
    ],
    // Nakafukuro
    nakaItems: [
      { side: "表面", content: "金額を漢数字で記入。例：金 参萬円也" },
      { side: "裏面", content: "住所・氏名をフルネームで記入（郵便番号から）" },
    ],
    kanjiNote: "金額の漢数字：1万＝壱万、2万＝弐万、3万＝参万、5万＝伍万、10万＝拾万",
    shinsatsuTips: [
      "銀行・郵便局の窓口で「新札に交換してください」と依頼",
      "ATMから引き出した紙幣も比較的新しいことが多い",
      "式の2〜3日前までに準備するのが理想",
    ],
    // Hokkaido section
    hokkaidoItems: [
      { label: "会費：", body: "6,000〜10,000円が相場（当日受付で支払い）" },
      { label: "ご祝儀：", body: "会費を払えば祝儀袋は不要なことがほとんど" },
      { label: "お祝い：", body: "仲の良い友人なら後日プレゼントを贈るケースも" },
      { label: "注意：", body: "招待状に「会費制」と明記されているか事前に確認" },
    ],
    hokkaidoIntro: "北海道では結婚式・披露宴に会費制を採用することが一般的です。",
    // Fukuro guide headers
    fukuroAmountHeader: "金額の目安",
    fukuroTypeHeader: "袋の種類",
    fukuroPointHeader: "ポイント",
    // Envelope range display
    envelopeRangeLabel: "金額の目安",
    // Chiiki notes
    chiikiNotes: {
      "全国平均": null,
      "北海道（会費制）": "北海道は会費制が主流（会費 6,000〜10,000円）。別途祝儀は不要なことが多い。",
      "関東": null,
      "関西": "関西は3万円が基本。「割り切れない数」を重視する傾向が強い。",
      "九州": "九州は5万円以上が相場とされる地域も。事前に確認を。",
    } as Record<Chiiki, string | null>,
    // NG warnings
    getNgWarning: (man: number): string | null => {
      if (man === 4) return "4万円は「死」を連想させるためNG。3万円か5万円に。";
      if (man === 6) return "6万円は偶数で割り切れるためNG（縁が切れる）。5万円か7万円に。";
      if (man === 8) return "8万円は偶数ですが「末広がり」で許容される場合も。地域によって異なります。";
      if (man === 9) return "9万円は「苦」を連想させるためNG。10万円か8万円に。";
      if (man % 2 === 0 && man !== 2 && man !== 8 && man !== 10) return `${man}万円は偶数で縁起が良くないとされます（2万円・8万円・10万円は例外OK）。`;
      return null;
    },
    langToggle: "EN",
  },
  en: {
    // Tabs
    calc: "Check Amount",
    table: "Rate Table",
    manner: "Manners Guide",
    // Headings
    selectCondition: "Select Conditions",
    recommended: "Recommended Amount",
    generalRange: "Standard Market Rate",
    rangeLabel: "Typical range: ",
    envelope: "Gift Envelope Guide",
    ngManners: "NG Manners & Cautions",
    allTable: "All Relations × Age Rate Table",
    tableNote: "Standard amount (¥10k units) for 'Normal' relationship",
    tableFootnote: "* Based on 'Normal' relationship. Close: +¥10,000. Not close: −¥10,000.",
    envelopeGuide: "Choosing the Right Envelope",
    mizuhiki: "Knot Style",
    mizuhikiDesc: "Always use musubi-kiri (awaji knot) for weddings — 'once tied, cannot be undone = no remarriage.' Butterfly knots are for celebrations that can happen multiple times.",
    writeGuide: "Writing Guide",
    omoteGaki: "Front Inscription",
    nakaFukuro: "Inner Envelope",
    shinsatsu: "How to Get Crisp Bills",
    hokkaido: "Hokkaido Entrance-Fee System",
    // Labels
    zokugaraLabel: "Relation",
    nendaiLabel: "Your Age Group",
    kankeiseiLabel: "Closeness",
    chiikiLabel: "Region",
    hokkaido_title: "Hokkaido: Entrance Fee",
    hokkaido_body: "Entrance-fee system (¥6,000–10,000) is common. Above amount is reference only.",
    attention: "Note",
    // Footer
    disclaimer: "* Amounts are guidelines only. Actual amounts vary by region, family custom, and relationship. Consult those around you for confirmation.",
    // Guide
    guideTitle: "How to Use This Tool",
    guide: [
      { step: "1", title: "Select Relation", body: "Choose the relation to the couple (friend, colleague, boss, sibling, etc.)." },
      { step: "2", title: "Set Age & Closeness", body: "Older guests typically give more. 'Close' adds ¥10k, 'Not close' subtracts ¥10k." },
      { step: "3", title: "Set Region", body: "Regional customs like Hokkaido's entrance-fee system will show an automatic notice." },
      { step: "4", title: "Review Results", body: "See the recommended amount, NG warnings, and which envelope to use — all at once." },
    ],
    // FAQ
    faqTitle: "Frequently Asked Questions",
    faq: [
      { q: "How much should I give a friend at their wedding?", a: "¥30,000 is the standard for friends in their 20s–30s. For close friends, ¥50,000 is common (avoid ¥40,000 — the number 4 is unlucky)." },
      { q: "Why is ¥40,000 considered bad luck?", a: "The number 4 is associated with death (死, shi) in Japanese culture. Use ¥30,000 or ¥50,000 instead. Even numbers are generally avoided (except ¥20,000, ¥80,000, ¥100,000)." },
      { q: "How much should a couple give together?", a: "Couples typically give 1.5–2× the single-person amount. ¥50,000–70,000 for friends, ¥70,000–100,000 for bosses or close relatives." },
      { q: "What if I can't attend the wedding?", a: "Send 1/3–1/2 of the standard amount by registered mail, or pair with a gift. Aim to have it arrive 1–2 weeks before the ceremony." },
      { q: "What is Hokkaido's entrance-fee system?", a: "In Hokkaido, guests pay an entrance fee (¥6,000–10,000) at the reception instead of a traditional gift envelope. No separate cash gift is usually needed — check the invitation for 'kaihisei' (会費制)." },
    ],
    // Related tools
    relatedTitle: "Related Tools",
    relatedTools: [
      { href: "/tools/hikidemono", label: "Wedding Favor Guide", desc: "Check appropriate price ranges for wedding favors" },
      { href: "/tools/cho-jyu-iwai", label: "Longevity Gift Guide", desc: "Amounts for kanreki, koki and other milestone birthdays" },
      { href: "/tools/goshugi-souba", label: "Baby Gift Guide", desc: "Typical amounts for birth celebration gifts" },
    ],
    // CTA
    ctaTitle: "Complete Wedding Etiquette Toolkit",
    ctaDesc: "Free calculators for gifts, favors, and return gifts for every occasion.",
    ctaBtn: "View All Tools",
    // NG items
    ngItems: [
      { title: "Avoid ¥40,000", body: "The number 4 (shi) sounds like 'death.' Use ¥30,000 or ¥50,000." },
      { title: "Avoid even numbers (with exceptions)", body: "'Even = easily divided = bond severed.' Exceptions: ¥20,000, ¥80,000, ¥100,000." },
      { title: "Avoid ¥90,000", body: "9 (ku) sounds like 'suffering.' Use ¥80,000 or ¥100,000." },
      { title: "Use crisp new bills", body: "'Prepared in advance = excited for the occasion.' Exchange at a bank ATM or window." },
      { title: "Absent guests: 1/3–1/2", body: "If you can't attend, send 1/3–1/2 the usual amount with a gift." },
      { title: "Couples: 1.5–2× per person", body: "Two attendees typically give ¥50,000–70,000 combined for friends." },
    ],
    // Table header
    zokugaraHeader: "Relation",
    // Omote items
    omoteItems: [
      { label: "壽 (Kotobuki)", desc: "Most formal. Either 寿 or 壽 is fine." },
      { label: "御祝 (Oiwai)", desc: "Simple, versatile. '御結婚御祝' also acceptable." },
      { label: "御結婚御祝", desc: "Literally 'Congratulations on your marriage.' Formal." },
      { label: "Happy Wedding", desc: "For Western-style or casual receptions." },
    ],
    // Nakabekuro
    nakaItems: [
      { side: "Front", content: "Write the amount in formal kanji. e.g., 金 参萬円也" },
      { side: "Back", content: "Write your full address and name (include postal code)." },
    ],
    kanjiNote: "Amount kanji: ¥10k=壱万, ¥20k=弐万, ¥30k=参万, ¥50k=伍万, ¥100k=拾万",
    shinsatsuTips: [
      "Ask at a bank or post office window to exchange for new bills",
      "Bills from ATMs tend to be relatively new as well",
      "Ideally prepare 2–3 days before the ceremony",
    ],
    // Hokkaido section
    hokkaidoItems: [
      { label: "Fee:", body: "¥6,000–10,000 (paid at the door)" },
      { label: "Cash gift:", body: "Usually not needed if entrance fee is paid" },
      { label: "Gift:", body: "Close friends sometimes send a present separately afterward" },
      { label: "Note:", body: "Check if the invitation says '会費制' (kaihisei)" },
    ],
    hokkaidoIntro: "In Hokkaido, entrance-fee receptions are the norm rather than traditional gift envelopes.",
    // Fukuro guide headers
    fukuroAmountHeader: "Amount Range",
    fukuroTypeHeader: "Envelope Type",
    fukuroPointHeader: "Tips",
    // Envelope range display
    envelopeRangeLabel: "Amount Range",
    // Chiiki notes
    chiikiNotes: {
      "全国平均": null,
      "北海道（会費制）": "Hokkaido uses an entrance-fee system (¥6,000–10,000). A separate gift envelope is usually not needed.",
      "関東": null,
      "関西": "Kansai: ¥30,000 is the baseline. Odd numbers are especially preferred.",
      "九州": "Kyushu: Some areas expect ¥50,000+. Confirm locally.",
    } as Record<Chiiki, string | null>,
    // NG warnings
    getNgWarning: (man: number): string | null => {
      if (man === 4) return "¥40,000 is NG — 4 (shi) sounds like 'death.' Use ¥30,000 or ¥50,000.";
      if (man === 6) return "¥60,000 is an even number (bond severed). Use ¥50,000 or ¥70,000.";
      if (man === 8) return "¥80,000 is even but considered lucky ('suehirogari'). Accepted in most regions.";
      if (man === 9) return "¥90,000 is NG — 9 (ku) sounds like 'suffering.' Use ¥80,000 or ¥100,000.";
      if (man % 2 === 0 && man !== 2 && man !== 8 && man !== 10) return `¥${man}0,000 is an even number and considered unlucky (exceptions: ¥20k, ¥80k, ¥100k).`;
      return null;
    },
    langToggle: "JP",
  },
} as const;

// ---- 相場データ（単位: 万円）----
// [zokugara][nendai] => [min, standard, max]
const SOUBA_TABLE: Record<Zokugara, Record<Nendai, [number, number, number]>> = {
  友人:      { "20代": [2, 3, 3], "30代": [3, 3, 5], "40代": [3, 5, 5], "50代": [3, 5, 5], "60代以上": [3, 5, 5] },
  同僚:      { "20代": [2, 3, 3], "30代": [3, 3, 5], "40代": [3, 5, 5], "50代": [3, 5, 5], "60代以上": [3, 5, 5] },
  上司:      { "20代": [3, 3, 5], "30代": [3, 5, 5], "40代": [5, 5, 7], "50代": [5, 7, 10], "60代以上": [5, 10, 10] },
  部下:      { "20代": [3, 3, 5], "30代": [3, 5, 5], "40代": [5, 5, 7], "50代": [5, 7, 10], "60代以上": [5, 10, 10] },
  取引先:    { "20代": [3, 3, 5], "30代": [3, 5, 5], "40代": [5, 5, 7], "50代": [5, 5, 7], "60代以上": [5, 7, 10] },
  兄弟姉妹:  { "20代": [3, 5, 5], "30代": [5, 5, 10], "40代": [5, 10, 10], "50代": [5, 10, 10], "60代以上": [5, 10, 10] },
  いとこ:    { "20代": [2, 3, 5], "30代": [3, 5, 5], "40代": [3, 5, 5], "50代": [5, 5, 7], "60代以上": [5, 5, 10] },
  甥姪:      { "20代": [3, 5, 5], "30代": [5, 5, 10], "40代": [5, 10, 10], "50代": [5, 10, 10], "60代以上": [5, 10, 10] },
  祖父母:    { "20代": [3, 5, 10], "30代": [5, 10, 10], "40代": [5, 10, 10], "50代": [5, 10, 10], "60代以上": [5, 10, 10] },
  叔父叔母:  { "20代": [3, 5, 5], "30代": [5, 5, 10], "40代": [5, 5, 10], "50代": [5, 10, 10], "60代以上": [5, 10, 10] },
};

// 関係性による補正（万円）
const KANKEISEI_OFFSET: Record<Kankeisei, number> = {
  親しい: 1,
  普通: 0,
  あまり親しくない: -1,
};

const ZOKUGARA_LIST: Zokugara[] = [
  "友人", "同僚", "上司", "部下", "取引先", "兄弟姉妹", "いとこ", "甥姪", "祖父母", "叔父叔母",
];
const NENDAI_LIST: Nendai[] = ["20代", "30代", "40代", "50代", "60代以上"];
const KANKEISEI_LIST: Kankeisei[] = ["親しい", "普通", "あまり親しくない"];
const CHIIKI_LIST: Chiiki[] = ["全国平均", "北海道（会費制）", "関東", "関西", "九州"];

// ---- ユーティリティ ----
const fmt = (man: number) => `¥${(man * 10000).toLocaleString("ja-JP")}`;

function getRecommended(
  zokugara: Zokugara,
  nendai: Nendai,
  kankeisei: Kankeisei
): { min: number; standard: number; max: number } {
  const [min, standard, max] = SOUBA_TABLE[zokugara][nendai];
  const offset = KANKEISEI_OFFSET[kankeisei];
  return {
    min: Math.max(2, min + (offset < 0 ? offset : 0)),
    standard: Math.max(2, standard + offset),
    max: Math.max(2, max + (offset > 0 ? offset : 0)),
  };
}

// ---- ご祝儀袋の種類 ----
const FUKURO_GUIDE = [
  { range: "〜1万円", rangeEn: "Up to ¥10k", type: "印刷水引のポチ袋・簡易封筒", typeEn: "Simple printed envelope", note: "既製の簡易封筒でもOK", noteEn: "Convenience store envelope is fine" },
  { range: "1〜3万円", rangeEn: "¥10k–30k", type: "水引が印刷された中袋付きご祝儀袋", typeEn: "Standard noshi envelope with inner envelope", note: "スーパー・コンビニで入手可", noteEn: "Available at supermarkets or convenience stores" },
  { range: "3〜5万円", rangeEn: "¥30k–50k", type: "金封・白金水引（結び切り）", typeEn: "Gold envelope with musubi-kiri cord", note: "豪華な水引が印刷された中袋付き", noteEn: "Decorative printed cord with inner envelope" },
  { range: "5〜10万円", rangeEn: "¥50k–100k", type: "高級金封・本結び水引（あわじ結び）", typeEn: "Premium envelope with awaji knot cord", note: "西陣織・和紙使いの上質なもの", noteEn: "High-quality washi or nishijin-ori fabric" },
  { range: "10万円〜", rangeEn: "¥100k+", type: "鶴亀・寿の立体水引付き最高級袋", typeEn: "Top-tier envelope with 3D decorative cord", note: "百貨店での購入を推奨", noteEn: "Purchase at a department store" },
];

// ---- コンポーネント ----
export default function GoshugiSouba() {
  const [lang, setLang] = useState<Lang>("ja");
  const [zokugara, setZokugara] = useState<Zokugara>("友人");
  const [nendai, setNendai] = useState<Nendai>("20代");
  const [kankeisei, setKankeisei] = useState<Kankeisei>("普通");
  const [chiiki, setChiiki] = useState<Chiiki>("全国平均");
  const [activeTab, setActiveTab] = useState<"calc" | "table" | "manner">("calc");

  const t = T[lang];
  const result = getRecommended(zokugara, nendai, kankeisei);
  const chiikiNote = t.chiikiNotes[chiiki];
  const ngWarning = t.getNgWarning(result.standard);

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1); }
          50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.2); }
        }
        @keyframes float-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes border-spin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
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
        .glow-text {
          text-shadow: 0 0 30px rgba(196,181,253,0.6);
        }
        .tab-active-glow {
          box-shadow: 0 0 16px rgba(236,72,153,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .result-card-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .tab-panel {
          animation: float-in 0.25s ease-out;
        }
        .method-btn:hover {
          box-shadow: 0 0 16px rgba(236,72,153,0.2);
        }
        .method-btn-active {
          box-shadow: 0 0 20px rgba(236,72,153,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
          background: rgba(236,72,153,0.15);
          border-color: rgba(244,114,182,0.6) !important;
        }
        .select-active {
          background: rgba(236,72,153,0.2);
          border-color: rgba(244,114,182,0.6);
          color: #f9a8d4;
          box-shadow: 0 0 10px rgba(236,72,153,0.3);
        }
        .table-row-stripe:hover {
          background: rgba(236,72,153,0.06);
          transition: background 0.2s ease;
        }
        .gradient-border-box {
          position: relative;
        }
        .gradient-border-box::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(236,72,153,0.6), rgba(167,139,250,0.4), rgba(236,72,153,0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .glass-select {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2d9f3;
        }
        .glass-select option {
          background: #1a1030;
          color: #e2d9f3;
        }
      `}</style>

      {/* Language toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {t.langToggle}
        </button>
      </div>

      {/* タブ */}
      <div className="glass-card rounded-2xl p-1.5 flex gap-1">
        {(["calc", "table", "manner"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab
                ? "bg-pink-600 text-white tab-active-glow"
                : "text-violet-200 hover:text-violet-100 hover:bg-white/5"
            }`}
          >
            {t[tab]}
          </button>
        ))}
      </div>

      {/* === 相場を調べる === */}
      {activeTab === "calc" && (
        <div className="tab-panel space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 入力パネル */}
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h2 className="text-sm font-semibold text-white uppercase tracking-widest">{t.selectCondition}</h2>

              {/* 続柄 */}
              <div>
                <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.zokugaraLabel}</label>
                <div className="grid grid-cols-3 gap-2">
                  {ZOKUGARA_LIST.map((z) => (
                    <button
                      key={z}
                      onClick={() => setZokugara(z)}
                      className={`method-btn py-2 px-3 rounded-xl text-sm font-medium border transition-all duration-200 ${
                        zokugara === z
                          ? "method-btn-active border-pink-500/60"
                          : "border-white/8 text-violet-100 hover:border-pink-500/30"
                      }`}
                    >
                      {z}
                    </button>
                  ))}
                </div>
              </div>

              {/* 年代 */}
              <div>
                <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.nendaiLabel}</label>
                <div className="flex gap-2 flex-wrap">
                  {NENDAI_LIST.map((n) => (
                    <button
                      key={n}
                      onClick={() => setNendai(n)}
                      className={`method-btn py-2 px-4 rounded-xl text-sm font-medium border transition-all duration-200 ${
                        nendai === n
                          ? "method-btn-active border-pink-500/60"
                          : "border-white/8 text-violet-100 hover:border-pink-500/30"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* 関係性 */}
              <div>
                <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.kankeiseiLabel}</label>
                <div className="flex gap-2 flex-wrap">
                  {KANKEISEI_LIST.map((k) => (
                    <button
                      key={k}
                      onClick={() => setKankeisei(k)}
                      className={`method-btn py-2 px-4 rounded-xl text-sm font-medium border transition-all duration-200 ${
                        kankeisei === k
                          ? "method-btn-active border-pink-500/60"
                          : "border-white/8 text-violet-100 hover:border-pink-500/30"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* 地域 */}
              <div>
                <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.chiikiLabel}</label>
                <select
                  value={chiiki}
                  onChange={(e) => setChiiki(e.target.value as Chiiki)}
                  className="glass-select w-full rounded-xl px-3 py-2.5 text-sm neon-focus"
                >
                  {CHIIKI_LIST.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {chiikiNote && (
                  <p className="mt-2 text-xs text-amber-300 glass-card rounded-xl px-3 py-2 border border-amber-500/20">
                    {chiikiNote}
                  </p>
                )}
              </div>
            </div>

            {/* 結果パネル */}
            <div className="space-y-4">
              {/* メイン金額表示 */}
              <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow">
                <div className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-1">{t.recommended}</div>
                <p className="text-xs text-violet-200 mb-4">
                  {zokugara} / {nendai} / {kankeisei}
                </p>

                <div className="glass-card rounded-2xl p-6 text-center border border-pink-500/20">
                  <p className="text-xs font-medium text-pink-300 mb-1 uppercase tracking-wider">{t.generalRange}</p>
                  <p className="text-5xl font-extrabold tracking-tight text-white glow-text font-mono">
                    {fmt(result.standard)}
                  </p>
                  <p className="text-sm text-violet-200 mt-3">
                    {t.rangeLabel}
                    <span className="font-semibold text-white font-mono">
                      {fmt(result.min)}〜{fmt(result.max)}
                    </span>
                  </p>
                </div>

                {ngWarning && (
                  <div className="mt-3 glass-card rounded-xl px-4 py-3 border border-red-500/30">
                    <p className="text-xs font-semibold text-red-400">{t.attention}</p>
                    <p className="text-xs text-red-300 mt-0.5">{ngWarning}</p>
                  </div>
                )}

                {chiiki === "北海道（会費制）" && (
                  <div className="mt-3 glass-card rounded-xl px-4 py-3 border border-cyan-500/20">
                    <p className="text-xs font-semibold text-cyan-300">{t.hokkaido_title}</p>
                    <p className="text-xs text-cyan-200 mt-0.5">{t.hokkaido_body}</p>
                  </div>
                )}
              </div>

              {/* ご祝儀袋の目安 */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-3">{t.envelope}</h2>
                {(() => {
                  const guide = FUKURO_GUIDE.find((g, i) => {
                    if (i === FUKURO_GUIDE.length - 1) return true;
                    const maxVal = [1, 3, 5, 10][i];
                    return result.standard <= maxVal;
                  });
                  return guide ? (
                    <div className="glass-card rounded-xl px-4 py-3 border border-pink-500/20">
                      <p className="text-sm font-semibold text-pink-300">{lang === "ja" ? guide.type : guide.typeEn}</p>
                      <p className="text-xs text-violet-200 mt-1">{lang === "ja" ? guide.note : guide.noteEn}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </div>

          {/* NGマナー */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.ngManners}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {t.ngItems.map((item) => (
                <div
                  key={item.title}
                  className="flex gap-3 glass-card rounded-xl p-4 border border-red-500/15"
                >
                  <span className="mt-0.5 text-red-400 font-bold text-base leading-none shrink-0">✕</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-violet-200 mt-0.5">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === 相場一覧表 === */}
      {activeTab === "table" && (
        <div className="tab-panel glass-card rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-2">{t.allTable}</h2>
          <p className="text-xs text-violet-200 mb-4">{t.tableNote}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pink-500/20">
                  <th className="text-left py-3 pr-4 text-xs text-violet-200 font-medium uppercase tracking-wider min-w-[90px]">{t.zokugaraHeader}</th>
                  {NENDAI_LIST.map((n) => (
                    <th key={n} className="text-center py-3 px-3 text-xs text-pink-300 font-medium uppercase tracking-wider min-w-[70px]">
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ZOKUGARA_LIST.map((z) => (
                  <tr key={z} className="border-b border-white/5 table-row-stripe">
                    <td className="py-3 pr-4 font-medium text-violet-100">{z}</td>
                    {NENDAI_LIST.map((n) => {
                      const [, std] = SOUBA_TABLE[z][n];
                      return (
                        <td key={n} className="text-center py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold font-mono ${
                              std >= 10
                                ? "bg-pink-500/20 text-pink-300"
                                : std >= 5
                                ? "bg-violet-500/20 text-violet-300"
                                : "bg-white/8 text-white/70"
                            }`}
                          >
                            {std}万
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-violet-200 mt-4">{t.tableFootnote}</p>
        </div>
      )}

      {/* === マナーガイド === */}
      {activeTab === "manner" && (
        <div className="tab-panel space-y-5">
          {/* ご祝儀袋の選び方 */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.envelopeGuide}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-pink-500/20">
                    <th className="text-left py-2 pr-4 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.fukuroAmountHeader}</th>
                    <th className="text-left py-2 px-3 text-xs text-pink-300 font-medium uppercase tracking-wider">{t.fukuroTypeHeader}</th>
                    <th className="text-left py-2 pl-3 text-xs text-violet-200 font-medium uppercase tracking-wider">{t.fukuroPointHeader}</th>
                  </tr>
                </thead>
                <tbody>
                  {FUKURO_GUIDE.map((g) => (
                    <tr key={g.range} className="border-b border-white/5 table-row-stripe">
                      <td className="py-3 pr-4 font-semibold text-violet-100 whitespace-nowrap font-mono">{lang === "ja" ? g.range : g.rangeEn}</td>
                      <td className="py-3 px-3 text-white/90">{lang === "ja" ? g.type : g.typeEn}</td>
                      <td className="py-3 pl-3 text-xs text-violet-200">{lang === "ja" ? g.note : g.noteEn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 glass-card rounded-xl p-4 border border-pink-500/20">
              <p className="text-sm font-semibold text-pink-300 mb-1">{t.mizuhiki}</p>
              <p className="text-xs text-violet-100 leading-relaxed">{t.mizuhikiDesc}</p>
            </div>
          </div>

          {/* 書き方ガイド */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.writeGuide}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-violet-100 mb-2 uppercase tracking-wider">{t.omoteGaki}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {t.omoteItems.map((item) => (
                    <div key={item.label} className="glass-card rounded-xl p-3 border border-pink-500/15">
                      <p className="text-base font-bold text-pink-300">{item.label}</p>
                      <p className="text-xs text-violet-200 mt-0.5">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-violet-100 mb-2 uppercase tracking-wider">{t.nakaFukuro}</h3>
                <div className="space-y-2">
                  {t.nakaItems.map((item) => (
                    <div key={item.side} className="flex gap-3 items-start glass-card rounded-xl px-4 py-3">
                      <span className="shrink-0 bg-pink-600 text-white text-xs font-bold px-2 py-0.5 rounded">{item.side}</span>
                      <p className="text-sm text-violet-100">{item.content}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 glass-card rounded-xl px-4 py-3 border border-amber-500/20">
                  <p className="text-xs text-amber-300">{t.kanjiNote}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-violet-100 mb-2 uppercase tracking-wider">{t.shinsatsu}</h3>
                <div className="space-y-2">
                  {t.shinsatsuTips.map((tip, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="shrink-0 w-5 h-5 bg-pink-500/20 text-pink-300 text-xs font-bold rounded-full flex items-center justify-center mt-0.5 border border-pink-500/30">
                        {i + 1}
                      </span>
                      <p className="text-sm text-violet-100">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 北海道の会費制 */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-3">{t.hokkaido}</h2>
            <div className="glass-card rounded-xl p-4 border border-cyan-500/20 space-y-2">
              <p className="text-sm text-cyan-200">{t.hokkaidoIntro}</p>
              <ul className="text-xs text-cyan-300 space-y-1.5 list-none">
                {t.hokkaidoItems.map((item) => (
                  <li key={item.label} className="flex gap-2">
                    <span className="font-bold shrink-0">{item.label}</span>
                    {item.body}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-violet-200 text-center pb-4">{t.disclaimer}</p>

      {/* ── SEO: 使い方ガイド ── */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.guideTitle}</h2>
        <ol className="space-y-3.5">
          {t.guide.map(({ step, title, body }) => (
            <li key={step} className="flex gap-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-pink-500/20 text-pink-300 text-sm font-bold flex items-center justify-center border border-pink-500/30">{step}</span>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-violet-200 mt-0.5">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ── SEO: FAQ ── */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.faqTitle}</h2>
        <div className="space-y-4">
          {t.faq.map(({ q, a }, i) => (
            <details key={i} className="group glass-card rounded-xl overflow-hidden border border-white/6">
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-semibold text-white hover:bg-pink-500/10 list-none transition-colors">
                <span>Q. {q}</span>
                <span className="text-pink-400 text-lg leading-none group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-4 pb-4 pt-1 text-sm text-violet-100 border-t border-white/6 leading-relaxed">{a}</div>
            </details>
          ))}
        </div>
      </div>

      {/* ── SEO: JSON-LD FAQPage ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "友人の結婚式のご祝儀の相場はいくらですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "20〜30代の友人へのご祝儀は3万円が一般的な相場です。親しい関係なら5万円にするケースもあります。" },
              },
              {
                "@type": "Question",
                "name": "ご祝儀に4万円はなぜNGなのですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "4は「死」を連想させる縁起の悪い数字とされているためです。3万円か5万円に変更してください。" },
              },
              {
                "@type": "Question",
                "name": "夫婦で参加する場合のご祝儀はいくらが相場ですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "夫婦2人で参加する場合は、1人分の相場×1.5〜2倍が目安です。友人の場合は5〜7万円が一般的です。" },
              },
              {
                "@type": "Question",
                "name": "北海道の結婚式の会費制とは何ですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "北海道では披露宴に会費制を採用することが一般的で、当日受付で6,000〜10,000円を支払います。別途ご祝儀袋は不要なケースがほとんどです。" },
              },
            ],
          }),
        }}
      />

      {/* ── SEO: 関連ツール ── */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-3">{t.relatedTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {t.relatedTools.map(({ href, label, desc }) => (
            <a
              key={href}
              href={href}
              className="flex flex-col gap-0.5 glass-card rounded-xl p-3 border border-white/8 hover:border-pink-500/40 transition-all duration-200"
            >
              <span className="text-sm font-semibold text-pink-300">{label}</span>
              <span className="text-xs text-violet-200">{desc}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── SEO: CTA ── */}
      <div
        className="rounded-2xl p-5 text-center space-y-3"
        style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.3), rgba(139,92,246,0.3))", border: "1px solid rgba(236,72,153,0.3)" }}
      >
        <p className="text-base font-bold text-white">{t.ctaTitle}</p>
        <p className="text-xs text-violet-200">{t.ctaDesc}</p>
        <a href="/tools" className="inline-block glass-card text-pink-300 text-sm font-bold px-5 py-2 rounded-xl hover:text-white transition-colors border border-pink-500/30">
          {t.ctaBtn}
        </a>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ご祝儀相場 計算",
  "description": "結婚式のご祝儀金額を続柄・年代・地域・関係性から判定。相場表と注意事項付き",
  "url": "https://tools.loresync.dev/goshugi-souba",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "ja"
}`
        }}
      />
    </div>
  );
}
