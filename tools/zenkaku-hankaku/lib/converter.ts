export type ConversionOptions = {
  katakana: boolean;
  alphanumeric: boolean;
  symbol: boolean;
  space: boolean;
};

// Katakana halfwidth ↔ fullwidth mapping
const kanaMap: [string, string][] = [
  ["ガ", "ｶﾞ"], ["ギ", "ｷﾞ"], ["グ", "ｸﾞ"], ["ゲ", "ｹﾞ"], ["ゴ", "ｺﾞ"],
  ["ザ", "ｻﾞ"], ["ジ", "ｼﾞ"], ["ズ", "ｽﾞ"], ["ゼ", "ｾﾞ"], ["ゾ", "ｿﾞ"],
  ["ダ", "ﾀﾞ"], ["ヂ", "ﾁﾞ"], ["ヅ", "ﾂﾞ"], ["デ", "ﾃﾞ"], ["ド", "ﾄﾞ"],
  ["バ", "ﾊﾞ"], ["ビ", "ﾋﾞ"], ["ブ", "ﾌﾞ"], ["ベ", "ﾍﾞ"], ["ボ", "ﾎﾞ"],
  ["パ", "ﾊﾟ"], ["ピ", "ﾋﾟ"], ["プ", "ﾌﾟ"], ["ペ", "ﾍﾟ"], ["ポ", "ﾎﾟ"],
  ["ヴ", "ｳﾞ"],
  ["ア", "ｱ"], ["イ", "ｲ"], ["ウ", "ｳ"], ["エ", "ｴ"], ["オ", "ｵ"],
  ["カ", "ｶ"], ["キ", "ｷ"], ["ク", "ｸ"], ["ケ", "ｹ"], ["コ", "ｺ"],
  ["サ", "ｻ"], ["シ", "ｼ"], ["ス", "ｽ"], ["セ", "ｾ"], ["ソ", "ｿ"],
  ["タ", "ﾀ"], ["チ", "ﾁ"], ["ツ", "ﾂ"], ["テ", "ﾃ"], ["ト", "ﾄ"],
  ["ナ", "ﾅ"], ["ニ", "ﾆ"], ["ヌ", "ﾇ"], ["ネ", "ﾈ"], ["ノ", "ﾉ"],
  ["ハ", "ﾊ"], ["ヒ", "ﾋ"], ["フ", "ﾌ"], ["ヘ", "ﾍ"], ["ホ", "ﾎ"],
  ["マ", "ﾏ"], ["ミ", "ﾐ"], ["ム", "ﾑ"], ["メ", "ﾒ"], ["モ", "ﾓ"],
  ["ヤ", "ﾔ"], ["ユ", "ﾕ"], ["ヨ", "ﾖ"],
  ["ラ", "ﾗ"], ["リ", "ﾘ"], ["ル", "ﾙ"], ["レ", "ﾚ"], ["ロ", "ﾛ"],
  ["ワ", "ﾜ"], ["ヲ", "ｦ"], ["ン", "ﾝ"],
  ["ァ", "ｧ"], ["ィ", "ｨ"], ["ゥ", "ｩ"], ["ェ", "ｪ"], ["ォ", "ｫ"],
  ["ッ", "ｯ"], ["ャ", "ｬ"], ["ュ", "ｭ"], ["ョ", "ｮ"],
  ["ー", "ｰ"], ["。", "｡"], ["「", "｢"], ["」", "｣"], ["、", "､"], ["・", "･"],
];

// Build reverse map for half→full katakana
const halfToFullKanaMap = new Map<string, string>();
const fullToHalfKanaMap = new Map<string, string>();
for (const [full, half] of kanaMap) {
  halfToFullKanaMap.set(half, full);
  fullToHalfKanaMap.set(full, half);
}

// Sort half-kana keys by length desc for greedy matching
const halfKanaKeys = Array.from(halfToFullKanaMap.keys()).sort(
  (a, b) => b.length - a.length
);

function convertKatakanaToHalf(text: string): string {
  let result = "";
  for (const char of text) {
    result += fullToHalfKanaMap.get(char) ?? char;
  }
  return result;
}

function convertKatakanaToFull(text: string): string {
  let result = "";
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const key of halfKanaKeys) {
      if (text.startsWith(key, i)) {
        result += halfToFullKanaMap.get(key)!;
        i += key.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += text[i];
      i++;
    }
  }
  return result;
}

function convertAlphanumToHalf(text: string): string {
  return text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );
}

function convertAlphanumToFull(text: string): string {
  return text.replace(/[A-Za-z0-9]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0xfee0)
  );
}

// Fullwidth symbols (excluding katakana punctuation handled in kana map)
const symbolFullHalfMap: [string, string][] = [
  ["！", "!"], ["＂", '"'], ["＃", "#"], ["＄", "$"], ["％", "%"],
  ["＆", "&"], ["＇", "'"], ["（", "("], ["）", ")"], ["＊", "*"],
  ["＋", "+"], ["，", ","], ["－", "-"], ["．", "."], ["／", "/"],
  ["：", ":"], ["；", ";"], ["＜", "<"], ["＝", "="], ["＞", ">"],
  ["？", "?"], ["＠", "@"], ["［", "["], ["＼", "\\"], ["］", "]"],
  ["＾", "^"], ["＿", "_"], ["｀", "`"], ["｛", "{"], ["｜", "|"],
  ["｝", "}"], ["～", "~"],
];

const fullToHalfSymbolMap = new Map(symbolFullHalfMap);
const halfToFullSymbolMap = new Map(
  symbolFullHalfMap.map(([f, h]) => [h, f])
);

function convertSymbolToHalf(text: string): string {
  let result = "";
  for (const char of text) {
    result += fullToHalfSymbolMap.get(char) ?? char;
  }
  return result;
}

function convertSymbolToFull(text: string): string {
  let result = "";
  for (const char of text) {
    result += halfToFullSymbolMap.get(char) ?? char;
  }
  return result;
}

function convertSpaceToHalf(text: string): string {
  return text.replace(/\u3000/g, " ");
}

function convertSpaceToFull(text: string): string {
  return text.replace(/ /g, "\u3000");
}

export function convert(
  text: string,
  direction: "toHalf" | "toFull",
  options: ConversionOptions
): string {
  let result = text;

  if (direction === "toHalf") {
    if (options.katakana) result = convertKatakanaToHalf(result);
    if (options.alphanumeric) result = convertAlphanumToHalf(result);
    if (options.symbol) result = convertSymbolToHalf(result);
    if (options.space) result = convertSpaceToHalf(result);
  } else {
    if (options.katakana) result = convertKatakanaToFull(result);
    if (options.alphanumeric) result = convertAlphanumToFull(result);
    if (options.symbol) result = convertSymbolToFull(result);
    if (options.space) result = convertSpaceToFull(result);
  }

  return result;
}
