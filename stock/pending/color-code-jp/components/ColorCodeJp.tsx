"use client";

import { useState, useMemo } from "react";

type Color = {
  name: string;
  reading: string;
  hex: string;
  hue: string;
};

const COLORS: Color[] = [
  { name: "紅", reading: "くれない", hex: "#D7003A", hue: "赤" },
  { name: "茜", reading: "あかね", hex: "#B7282E", hue: "赤" },
  { name: "朱", reading: "しゅ", hex: "#EC6D51", hue: "赤" },
  { name: "緋", reading: "ひ", hex: "#E83929", hue: "赤" },
  { name: "臙脂", reading: "えんじ", hex: "#9B1942", hue: "赤" },
  { name: "深緋", reading: "こきひ", hex: "#BE0032", hue: "赤" },
  { name: "赤", reading: "あか", hex: "#FF0000", hue: "赤" },
  { name: "小豆", reading: "あずき", hex: "#8D2A2A", hue: "赤" },
  { name: "紅梅", reading: "こうばい", hex: "#E16B8C", hue: "ピンク" },
  { name: "桜", reading: "さくら", hex: "#FEEEED", hue: "ピンク" },
  { name: "薄紅", reading: "うすべに", hex: "#F3A0A0", hue: "ピンク" },
  { name: "撫子", reading: "なでしこ", hex: "#E9A0A0", hue: "ピンク" },
  { name: "桃", reading: "もも", hex: "#F4A7B9", hue: "ピンク" },
  { name: "鴇", reading: "とき", hex: "#F2A0A1", hue: "ピンク" },
  { name: "珊瑚", reading: "さんご", hex: "#F08080", hue: "ピンク" },
  { name: "橙", reading: "だいだい", hex: "#F26522", hue: "橙" },
  { name: "柿", reading: "かき", hex: "#F1672A", hue: "橙" },
  { name: "黄丹", reading: "おうに", hex: "#F4A33D", hue: "橙" },
  { name: "蜜柑", reading: "みかん", hex: "#F5A623", hue: "橙" },
  { name: "金", reading: "きん", hex: "#E8B14B", hue: "橙" },
  { name: "鬱金", reading: "うこん", hex: "#FFC06E", hue: "黄" },
  { name: "黄", reading: "き", hex: "#F8D849", hue: "黄" },
  { name: "山吹", reading: "やまぶき", hex: "#F5AB35", hue: "黄" },
  { name: "菜の花", reading: "なのはな", hex: "#F7D94C", hue: "黄" },
  { name: "刈安", reading: "かりやす", hex: "#E9D66B", hue: "黄" },
  { name: "黄檗", reading: "きはだ", hex: "#F6C90E", hue: "黄" },
  { name: "蒲公英", reading: "たんぽぽ", hex: "#F8D030", hue: "黄" },
  { name: "鶯", reading: "うぐいす", hex: "#808000", hue: "黄緑" },
  { name: "若草", reading: "わかくさ", hex: "#B9D08B", hue: "黄緑" },
  { name: "萌黄", reading: "もえぎ", hex: "#5B8930", hue: "黄緑" },
  { name: "苗", reading: "なえ", hex: "#8EBE6C", hue: "黄緑" },
  { name: "黄緑", reading: "きみどり", hex: "#8DB255", hue: "黄緑" },
  { name: "抹茶", reading: "まっちゃ", hex: "#7B8B5E", hue: "黄緑" },
  { name: "松葉", reading: "まつば", hex: "#5E7749", hue: "緑" },
  { name: "緑", reading: "みどり", hex: "#007849", hue: "緑" },
  { name: "常磐", reading: "ときわ", hex: "#237A57", hue: "緑" },
  { name: "千歳緑", reading: "ちとせみどり", hex: "#365A39", hue: "緑" },
  { name: "深緑", reading: "ふかみどり", hex: "#004D25", hue: "緑" },
  { name: "青竹", reading: "あおたけ", hex: "#7BAE7F", hue: "緑" },
  { name: "薄緑", reading: "うすみどり", hex: "#88C96E", hue: "緑" },
  { name: "翡翠", reading: "ひすい", hex: "#38B48B", hue: "緑" },
  { name: "水", reading: "みず", hex: "#87CEEB", hue: "青" },
  { name: "水色", reading: "みずいろ", hex: "#7FC8E0", hue: "青" },
  { name: "空", reading: "そら", hex: "#60A9D6", hue: "青" },
  { name: "浅葱", reading: "あさぎ", hex: "#00A3AF", hue: "青" },
  { name: "藍", reading: "あい", hex: "#165E83", hue: "青" },
  { name: "群青", reading: "ぐんじょう", hex: "#4C6CB3", hue: "青" },
  { name: "瑠璃", reading: "るり", hex: "#3E5FA4", hue: "青" },
  { name: "紺", reading: "こん", hex: "#223A70", hue: "青" },
  { name: "縹", reading: "はなだ", hex: "#1B6899", hue: "青" },
  { name: "藍鉄", reading: "あいてつ", hex: "#1F3055", hue: "青" },
  { name: "鉄紺", reading: "てつこん", hex: "#17184B", hue: "青" },
  { name: "露草", reading: "つゆくさ", hex: "#3A6EAA", hue: "青" },
  { name: "青", reading: "あお", hex: "#0000FF", hue: "青" },
  { name: "藤", reading: "ふじ", hex: "#B28FCE", hue: "紫" },
  { name: "紫", reading: "むらさき", hex: "#5B2C8D", hue: "紫" },
  { name: "菫", reading: "すみれ", hex: "#5B3382", hue: "紫" },
  { name: "薄紫", reading: "うすむらさき", hex: "#A8799C", hue: "紫" },
  { name: "江戸紫", reading: "えどむらさき", hex: "#5E3A8C", hue: "紫" },
  { name: "桔梗", reading: "ききょう", hex: "#6F479C", hue: "紫" },
  { name: "牡丹", reading: "ぼたん", hex: "#C45C94", hue: "紫" },
  { name: "紅紫", reading: "べにむらさき", hex: "#B44B8A", hue: "紫" },
  { name: "若紫", reading: "わかむらさき", hex: "#A277B0", hue: "紫" },
  { name: "二藍", reading: "ふたあい", hex: "#8B5B8A", hue: "紫" },
  { name: "白", reading: "しろ", hex: "#FFFFFF", hue: "白・灰" },
  { name: "胡粉", reading: "ごふん", hex: "#F9FBFF", hue: "白・灰" },
  { name: "白磁", reading: "はくじ", hex: "#F4F8FB", hue: "白・灰" },
  { name: "象牙", reading: "ぞうげ", hex: "#FFF9E8", hue: "白・灰" },
  { name: "銀", reading: "ぎん", hex: "#C0C0C0", hue: "白・灰" },
  { name: "鼠", reading: "ねずみ", hex: "#9B9B9B", hue: "白・灰" },
  { name: "利休鼠", reading: "りきゅうねずみ", hex: "#8C9B8A", hue: "白・灰" },
  { name: "薄墨", reading: "うすずみ", hex: "#AAAAAA", hue: "白・灰" },
  { name: "墨", reading: "すみ", hex: "#595459", hue: "黒・茶" },
  { name: "黒", reading: "くろ", hex: "#000000", hue: "黒・茶" },
  { name: "漆黒", reading: "しっこく", hex: "#0C0C0C", hue: "黒・茶" },
  { name: "鉄黒", reading: "てつぐろ", hex: "#281E15", hue: "黒・茶" },
  { name: "茶", reading: "ちゃ", hex: "#8B4513", hue: "黒・茶" },
  { name: "栗", reading: "くり", hex: "#762B0E", hue: "黒・茶" },
  { name: "弁柄", reading: "べんがら", hex: "#9B1B30", hue: "黒・茶" },
  { name: "煤竹", reading: "すすたけ", hex: "#4A3728", hue: "黒・茶" },
  { name: "焦茶", reading: "こげちゃ", hex: "#4D2B1E", hue: "黒・茶" },
  { name: "丁子", reading: "ちょうじ", hex: "#9B6A2F", hue: "黒・茶" },
  { name: "砂", reading: "すな", hex: "#C4A882", hue: "黒・茶" },
  { name: "肌", reading: "はだ", hex: "#F5CBA7", hue: "橙" },
  { name: "蘇芳", reading: "すおう", hex: "#9E3A47", hue: "赤" },
  { name: "薔薇", reading: "ばら", hex: "#D04E75", hue: "ピンク" },
  { name: "躑躅", reading: "つつじ", hex: "#E4407B", hue: "ピンク" },
  { name: "石竹", reading: "せきちく", hex: "#E8A8B8", hue: "ピンク" },
  { name: "薄桜", reading: "うすざくら", hex: "#FDE8E8", hue: "ピンク" },
  { name: "鶯茶", reading: "うぐいすちゃ", hex: "#656434", hue: "黄緑" },
  { name: "海松", reading: "みる", hex: "#5F7941", hue: "緑" },
  { name: "青磁", reading: "せいじ", hex: "#9DC4BB", hue: "緑" },
  { name: "緑青", reading: "ろくしょう", hex: "#3D8B8E", hue: "緑" },
  { name: "納戸", reading: "なんど", hex: "#0A5F78", hue: "青" },
  { name: "青藍", reading: "せいらん", hex: "#2B5FA5", hue: "青" },
  { name: "紺青", reading: "こんじょう", hex: "#1A3A6B", hue: "青" },
  { name: "花浅葱", reading: "はなあさぎ", hex: "#1B7EAA", hue: "青" },
  { name: "錆浅葱", reading: "さびあさぎ", hex: "#5B8899", hue: "青" },
  { name: "千草", reading: "ちぐさ", hex: "#7CB8C0", hue: "青" },
];

const HUES = ["すべて", "赤", "ピンク", "橙", "黄", "黄緑", "緑", "青", "紫", "白・灰", "黒・茶"];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function isLight(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.55;
}

export default function ColorCodeJp() {
  const [search, setSearch] = useState("");
  const [selectedHue, setSelectedHue] = useState("すべて");
  const [selected, setSelected] = useState<Color | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    return COLORS.filter((c) => {
      const matchSearch =
        search === "" ||
        c.name.includes(search) ||
        c.reading.includes(search) ||
        c.hex.toLowerCase().includes(search.toLowerCase());
      const matchHue = selectedHue === "すべて" || c.hue === selectedHue;
      return matchSearch && matchHue;
    });
  }, [search, selectedHue]);

  const handleCopy = async (hex: string) => {
    await navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const rgb = selected ? hexToRgb(selected.hex) : null;
  const light = selected ? isLight(selected.hex) : true;
  const textClass = light ? "text-gray-900" : "text-white";

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <input
          type="text"
          placeholder="色名・よみ・HEXで検索…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
        <div className="flex flex-wrap gap-1.5">
          {HUES.map((h) => (
            <button
              key={h}
              onClick={() => setSelectedHue(h)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedHue === h
                  ? "bg-rose-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400">{filtered.length}色 表示中</p>
      </div>

      {/* Large Preview */}
      {selected && (
        <div
          className="rounded-xl overflow-hidden border border-gray-200 shadow-md"
          style={{ backgroundColor: selected.hex }}
        >
          <div className={`p-6 flex flex-col sm:flex-row gap-4 items-start ${textClass}`}>
            <div
              className="w-20 h-20 rounded-xl shadow-inner flex-shrink-0 border-2"
              style={{
                backgroundColor: selected.hex,
                borderColor: light ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.3)",
              }}
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-baseline gap-3">
                <h2 className="text-2xl font-bold">{selected.name}</h2>
                <span className="text-sm opacity-70">{selected.reading}</span>
              </div>
              <span
                className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                  light ? "bg-black/10" : "bg-white/20"
                }`}
              >
                {selected.hue}系
              </span>
              <div className="flex flex-wrap gap-3 text-sm font-mono pt-1">
                <button
                  onClick={() => handleCopy(selected.hex)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    light ? "bg-black/10 hover:bg-black/20" : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  {copied ? "コピー完了!" : selected.hex.toUpperCase()}
                  {!copied && (
                    <svg
                      className="w-3.5 h-3.5 opacity-70"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
                {rgb && (
                  <span
                    className={`px-3 py-1.5 rounded-lg ${
                      light ? "bg-black/10" : "bg-white/20"
                    }`}
                  >
                    rgb({rgb.r}, {rgb.g}, {rgb.b})
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className={`text-xl leading-none opacity-60 hover:opacity-100 transition-opacity ${textClass}`}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Color Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🎨</p>
          <p>該当する色が見つかりませんでした</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {filtered.map((color) => {
            const isSelected = selected?.name === color.name;
            return (
              <button
                key={color.name}
                onClick={() => setSelected(isSelected ? null : color)}
                className={`group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 ${
                  isSelected ? "ring-2 ring-rose-500 ring-offset-2 shadow-md" : ""
                }`}
                title={`${color.name}（${color.reading}）${color.hex.toUpperCase()}`}
              >
                <div className="h-16 w-full" style={{ backgroundColor: color.hex }} />
                <div className="bg-white border border-gray-100 px-1.5 py-1.5 text-center">
                  <p className="text-xs font-medium text-gray-800 truncate">{color.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{color.reading}</p>
                  <p className="text-[10px] font-mono text-gray-500">{color.hex.toUpperCase()}</p>
                
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この日本の伝統色コード集ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">日本の伝統色と慣用色名のカラーコードを検索。入力するだけで即座に結果を表示します。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">利用料金はかかりますか？</summary>
      <p className="mt-2 text-sm text-gray-600">完全無料でご利用いただけます。会員登録も不要です。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">計算結果は正確ですか？</summary>
      <p className="mt-2 text-sm text-gray-600">一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この日本の伝統色コード集ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "日本の伝統色と慣用色名のカラーコードを検索。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Ad placeholder */}
      <div className="w-full h-24 bg-gray-100 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
        広告
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "日本の伝統色コード集",
  "description": "日本の伝統色と慣用色名のカラーコードを検索",
  "url": "https://tools.loresync.dev/color-code-jp",
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
