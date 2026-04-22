export interface JpColor {
  name: string;
  reading: string;
  hex: string;
  category: "赤系" | "橙系" | "黄系" | "緑系" | "青系" | "紫系" | "茶系" | "灰系" | "白黒系";
  season: "春" | "夏" | "秋" | "冬" | "通年";
  description: string;
}

export const JP_COLORS: JpColor[] = [
  // 赤系
  { name: "紅", reading: "くれない", hex: "#C0392B", category: "赤系", season: "通年", description: "鮮やかな赤。古来より染料として用いられた代表的な日本の赤。" },
  { name: "茜色", reading: "あかねいろ", hex: "#B7282E", category: "赤系", season: "秋", description: "茜草の根から採れる赤い染料の色。深みのある赤。" },
  { name: "緋色", reading: "ひいろ", hex: "#E83929", category: "赤系", season: "通年", description: "鮮やかな黄みがかった赤。武士の衣装にも使われた。" },
  { name: "朱色", reading: "しゅいろ", hex: "#E45E32", category: "赤系", season: "通年", description: "やや橙がかった赤。鳥居や漆器に使われる伝統色。" },
  { name: "臙脂色", reading: "えんじいろ", hex: "#9B2335", category: "赤系", season: "冬", description: "暗く深みのある赤紫。コチニールから染め出される色。" },
  { name: "紅梅色", reading: "こうばいいろ", hex: "#E86B8A", category: "赤系", season: "春", description: "梅の花のような淡い赤。春の訪れを感じさせる色。" },
  { name: "桃色", reading: "ももいろ", hex: "#F4A7B9", category: "赤系", season: "春", description: "桃の花のような淡いピンク。春の代表色。" },
  { name: "薄紅", reading: "うすくれない", hex: "#EEA4A7", category: "赤系", season: "春", description: "薄い紅色。淡くやさしい赤。" },
  { name: "退紅", reading: "あらぞめ", hex: "#F4B9C1", category: "赤系", season: "春", description: "色があせた紅色。ごく淡い赤みのピンク。" },
  { name: "珊瑚色", reading: "さんごいろ", hex: "#F08070", category: "赤系", season: "夏", description: "珊瑚のようなオレンジがかった赤。南国を連想させる色。" },
  { name: "赤", reading: "あか", hex: "#CC0000", category: "赤系", season: "通年", description: "純粋な赤。日本の伝統的な赤の基本色。" },
  { name: "深紅", reading: "しんく", hex: "#8B0000", category: "赤系", season: "冬", description: "非常に深い暗い赤。艶やかで重厚感がある。" },
  { name: "蘇芳色", reading: "すおういろ", hex: "#8E354A", category: "赤系", season: "秋", description: "蘇芳という植物から染め出した赤紫色。" },
  { name: "赤紫", reading: "あかむらさき", hex: "#C0306A", category: "赤系", season: "通年", description: "赤みがかった紫。華やかで艶やかな色。" },
  { name: "牡丹色", reading: "ぼたんいろ", hex: "#C0457C", category: "赤系", season: "春", description: "牡丹の花のような鮮やかな赤紫。" },

  // 橙系
  { name: "橙色", reading: "だいだいいろ", hex: "#F37A00", category: "橙系", season: "秋", description: "橙の果実のような鮮やかなオレンジ。" },
  { name: "柿色", reading: "かきいろ", hex: "#DC4B00", category: "橙系", season: "秋", description: "熟した柿のような深いオレンジ。秋の代表色。" },
  { name: "黄丹", reading: "おうに", hex: "#F6790B", category: "橙系", season: "秋", description: "皇太子専用の色。鮮やかな黄みのオレンジ。" },
  { name: "蜜柑色", reading: "みかんいろ", hex: "#F28500", category: "橙系", season: "冬", description: "みかんのような鮮やかなオレンジ。" },
  { name: "黄赤", reading: "きあか", hex: "#E8681A", category: "橙系", season: "秋", description: "黄みがかった赤。暖かみのある色。" },
  { name: "鉛丹色", reading: "えんたんいろ", hex: "#E2500B", category: "橙系", season: "通年", description: "鉛丹（鉛の酸化物）から作られる赤みがかったオレンジ。" },
  { name: "薄柿", reading: "うすがき", hex: "#F8B094", category: "橙系", season: "秋", description: "柿色を淡くした色。やさしいオレンジ系。" },
  { name: "肌色", reading: "はだいろ", hex: "#FBCEB1", category: "橙系", season: "通年", description: "肌のような淡い橙色。" },
  { name: "宍色", reading: "ししいろ", hex: "#F4B47A", category: "橙系", season: "通年", description: "肉の色のような淡い橙色。" },
  { name: "金色", reading: "きんいろ", hex: "#C6941A", category: "橙系", season: "通年", description: "金属の金のような輝く黄金色。" },

  // 黄系
  { name: "黄色", reading: "きいろ", hex: "#F5E500", category: "黄系", season: "通年", description: "純粋な黄色。明るく鮮やかな基本色。" },
  { name: "山吹色", reading: "やまぶきいろ", hex: "#F0A500", category: "黄系", season: "春", description: "山吹の花のような鮮やかな黄金色。" },
  { name: "向日葵色", reading: "ひまわりいろ", hex: "#FFD700", category: "黄系", season: "夏", description: "向日葵の花のような鮮やかな黄色。" },
  { name: "菜の花色", reading: "なのはないろ", hex: "#F5DB00", category: "黄系", season: "春", description: "菜の花のような明るい黄色。春の訪れを告げる色。" },
  { name: "鬱金色", reading: "うこんいろ", hex: "#E8B500", category: "黄系", season: "通年", description: "ウコンの根茎から染め出した黄色。" },
  { name: "刈安色", reading: "かりやすいろ", hex: "#D4BE00", category: "黄系", season: "秋", description: "刈安草から染め出した淡い黄緑色。" },
  { name: "蒲公英色", reading: "たんぽぽいろ", hex: "#F2D000", category: "黄系", season: "春", description: "タンポポの花のような鮮やかな黄色。" },
  { name: "藤黄", reading: "とうおう", hex: "#FFC800", category: "黄系", season: "通年", description: "藤黄樹脂から取れる鮮やかな黄色。絵の具として使用。" },
  { name: "黄朽葉", reading: "きくちば", hex: "#C8A800", category: "黄系", season: "秋", description: "黄みがかった朽ち葉色。秋の落ち葉を思わせる色。" },
  { name: "淡黄", reading: "たんこう", hex: "#FFF0A0", category: "黄系", season: "通年", description: "非常に薄い黄色。クリーム色に近い。" },
  { name: "黄緑", reading: "きみどり", hex: "#A0D000", category: "黄系", season: "春", description: "黄みがかった緑。春の新芽の色。" },

  // 緑系
  { name: "緑", reading: "みどり", hex: "#008000", category: "緑系", season: "通年", description: "純粋な緑。自然を象徴する色。" },
  { name: "萌黄色", reading: "もえぎいろ", hex: "#84B400", category: "緑系", season: "春", description: "春の若草のような黄緑色。生命力を感じさせる。" },
  { name: "若葉色", reading: "わかばいろ", hex: "#90C040", category: "緑系", season: "春", description: "若い葉のような明るい緑色。" },
  { name: "松葉色", reading: "まつばいろ", hex: "#4D7A2A", category: "緑系", season: "通年", description: "松の葉のような深い緑色。" },
  { name: "常磐色", reading: "ときわいろ", hex: "#007B43", category: "緑系", season: "通年", description: "常緑樹の葉のような深い緑色。永遠不変を意味する。" },
  { name: "草色", reading: "くさいろ", hex: "#5F8234", category: "緑系", season: "夏", description: "草のような暗い黄緑色。自然の色。" },
  { name: "若竹色", reading: "わかたけいろ", hex: "#5DB38D", category: "緑系", season: "春", description: "若い竹のような明るい青緑色。" },
  { name: "青竹色", reading: "あおたけいろ", hex: "#4EA577", category: "緑系", season: "通年", description: "成長した竹のような青みがかった緑。" },
  { name: "深緑", reading: "ふかみどり", hex: "#00461C", category: "緑系", season: "冬", description: "非常に深い暗い緑。森の奥を思わせる色。" },
  { name: "千草色", reading: "ちぐさいろ", hex: "#2EA090", category: "緑系", season: "夏", description: "千草（エゴノキ）の葉のような青緑色。" },
  { name: "薄緑", reading: "うすみどり", hex: "#A8D8A0", category: "緑系", season: "春", description: "淡い緑色。やさしい春の色。" },
  { name: "鶸色", reading: "ひわいろ", hex: "#C4D000", category: "緑系", season: "通年", description: "鶸（ひわ）の羽のような黄みがかった緑色。" },
  { name: "海松色", reading: "みるいろ", hex: "#6B7C3D", category: "緑系", season: "夏", description: "海松（海藻の一種）のような暗い黄緑。" },
  { name: "苔色", reading: "こけいろ", hex: "#5B7040", category: "緑系", season: "秋", description: "苔のような暗い緑色。" },
  { name: "柳色", reading: "やなぎいろ", hex: "#A0C878", category: "緑系", season: "春", description: "柳の葉のような明るい黄緑色。" },
  { name: "老竹色", reading: "おいたけいろ", hex: "#748B52", category: "緑系", season: "通年", description: "老いた竹のような暗い緑色。" },

  // 青系
  { name: "青", reading: "あお", hex: "#0050A0", category: "青系", season: "通年", description: "純粋な青。日本語では緑も「青」と呼ぶことがある基本色。" },
  { name: "紺色", reading: "こんいろ", hex: "#1A2060", category: "青系", season: "冬", description: "深い藍色。武士の衣装にも使われた日本の伝統色。" },
  { name: "藍色", reading: "あいいろ", hex: "#165C8E", category: "青系", season: "通年", description: "藍草から染め出した青。日本を代表する青色。" },
  { name: "浅葱色", reading: "あさぎいろ", hex: "#48B0D8", category: "青系", season: "夏", description: "浅葱（ネギの若芽）のような明るい青緑色。新撰組の色。" },
  { name: "水色", reading: "みずいろ", hex: "#87CEEB", category: "青系", season: "夏", description: "澄んだ水のような明るい青色。" },
  { name: "空色", reading: "そらいろ", hex: "#6EC6E5", category: "青系", season: "夏", description: "晴れた空のような明るい青。" },
  { name: "群青色", reading: "ぐんじょういろ", hex: "#2B4FBB", category: "青系", season: "通年", description: "鮮やかで深い青色。岩絵具として使われた。" },
  { name: "瑠璃色", reading: "るりいろ", hex: "#1E5CA8", category: "青系", season: "通年", description: "瑠璃（ラピスラズリ）のような美しい青。" },
  { name: "縹色", reading: "はなだいろ", hex: "#3F82A8", category: "青系", season: "夏", description: "はなだ花（木藍）で染めた青。" },
  { name: "蒼色", reading: "そういろ", hex: "#2E4D7A", category: "青系", season: "秋", description: "暗みがかった青。深い海を思わせる色。" },
  { name: "錆浅葱", reading: "さびあさぎ", hex: "#5F8E9E", category: "青系", season: "冬", description: "くすんだ浅葱色。落ち着いた青緑色。" },
  { name: "御納戸色", reading: "おなんどいろ", hex: "#456080", category: "青系", season: "通年", description: "納戸（収納室）の板壁のような暗い青緑色。" },
  { name: "藤色", reading: "ふじいろ", hex: "#8090C8", category: "青系", season: "春", description: "藤の花のような淡い青紫色。" },
  { name: "青磁色", reading: "せいじいろ", hex: "#9ECFB4", category: "青系", season: "通年", description: "青磁（陶磁器）のような淡い青緑色。" },
  { name: "新橋色", reading: "しんばしいろ", hex: "#59AEB5", category: "青系", season: "通年", description: "明治時代に流行した明るい青緑。" },

  // 紫系
  { name: "紫", reading: "むらさき", hex: "#800080", category: "紫系", season: "通年", description: "純粋な紫。高貴な色として古来より珍重された。" },
  { name: "江戸紫", reading: "えどむらさき", hex: "#7B3F8C", category: "紫系", season: "通年", description: "江戸時代に流行した青みがかった紫色。" },
  { name: "京紫", reading: "きょうむらさき", hex: "#9932CC", category: "紫系", season: "通年", description: "京都で染め出される赤みがかった紫色。" },
  { name: "菫色", reading: "すみれいろ", hex: "#7B5FB5", category: "紫系", season: "春", description: "菫の花のような青みがかった紫色。" },
  { name: "薄紫", reading: "うすむらさき", hex: "#C8A0E0", category: "紫系", season: "春", description: "淡い紫色。やさしくやわらかな色。" },
  { name: "葡萄色", reading: "えびいろ", hex: "#640125", category: "紫系", season: "秋", description: "葡萄の実のような暗い赤紫色。" },
  { name: "杜若色", reading: "かきつばたいろ", hex: "#604CB4", category: "紫系", season: "春", description: "杜若の花のような青紫色。" },
  { name: "桔梗色", reading: "ききょういろ", hex: "#5A4F9E", category: "紫系", season: "秋", description: "桔梗の花のような青みがかった紫。" },
  { name: "藤紫", reading: "ふじむらさき", hex: "#9080C8", category: "紫系", season: "春", description: "藤の花のような赤みがかった青紫。" },
  { name: "紅紫", reading: "べにむらさき", hex: "#B03080", category: "紫系", season: "通年", description: "赤みが強い紫色。華やかな印象。" },
  { name: "二藍", reading: "ふたあい", hex: "#7A6490", category: "紫系", season: "通年", description: "藍と紅の2色で染めた紫色。" },
  { name: "半色", reading: "はしたいろ", hex: "#9080A8", category: "紫系", season: "通年", description: "青と紫の中間の色。" },
  { name: "蒲萄色", reading: "ぶどういろ", hex: "#5D3A6B", category: "紫系", season: "秋", description: "ぶどうの実のような深い紫色。" },
  { name: "紅藤色", reading: "べにふじいろ", hex: "#D080B8", category: "紫系", season: "春", description: "赤みがかった藤色。やわらかな色。" },

  // 茶系
  { name: "茶色", reading: "ちゃいろ", hex: "#7B4A20", category: "茶系", season: "秋", description: "茶の葉の色。温かみのある基本的な茶色。" },
  { name: "栗色", reading: "くりいろ", hex: "#7B3B2A", category: "茶系", season: "秋", description: "栗の実のような暗い赤茶色。" },
  { name: "小豆色", reading: "あずきいろ", hex: "#8E3A40", category: "茶系", season: "通年", description: "小豆のような暗い赤みがかった茶色。" },
  { name: "赤茶", reading: "あかちゃ", hex: "#B85030", category: "茶系", season: "秋", description: "赤みがかった茶色。温かみのある色。" },
  { name: "黄茶", reading: "きちゃ", hex: "#C0782A", category: "茶系", season: "秋", description: "黄みがかった茶色。明るい茶色。" },
  { name: "飴色", reading: "あめいろ", hex: "#D4A040", category: "茶系", season: "通年", description: "飴のような透明感のある黄茶色。" },
  { name: "煎茶色", reading: "せんちゃいろ", hex: "#5C4024", category: "茶系", season: "通年", description: "煎茶のような暗い黄茶色。" },
  { name: "肉桂色", reading: "にっけいいろ", hex: "#B06840", category: "茶系", season: "冬", description: "シナモンのような赤みがかった茶色。" },
  { name: "団栗色", reading: "どんぐりいろ", hex: "#9B6840", category: "茶系", season: "秋", description: "どんぐりのような暗い黄茶色。" },
  { name: "鴬茶", reading: "うぐいすちゃ", hex: "#6B5830", category: "茶系", season: "春", description: "うぐいすのような緑みがかった茶色。" },
  { name: "江戸茶", reading: "えどちゃ", hex: "#9E4B2A", category: "茶系", season: "通年", description: "江戸時代に流行した赤みがかった茶色。" },
  { name: "弁柄色", reading: "べんがらいろ", hex: "#8C3820", category: "茶系", season: "通年", description: "弁柄（酸化鉄）から作られる暗い赤茶。" },
  { name: "柑子色", reading: "こうじいろ", hex: "#F0A030", category: "茶系", season: "冬", description: "柑子（橘の一種）のような黄橙色。" },
  { name: "朽葉色", reading: "くちばいろ", hex: "#A07840", category: "茶系", season: "秋", description: "朽ちた葉のような黄茶色。晩秋の色。" },
  { name: "狐色", reading: "きつねいろ", hex: "#C08050", category: "茶系", season: "通年", description: "狐の毛のような明るい茶色。" },

  // 灰系
  { name: "灰色", reading: "はいいろ", hex: "#808080", category: "灰系", season: "通年", description: "純粋な灰色。落ち着きのある中間色。" },
  { name: "鼠色", reading: "ねずみいろ", hex: "#707070", category: "灰系", season: "通年", description: "鼠の毛色のような暗い灰色。" },
  { name: "銀色", reading: "ぎんいろ", hex: "#C0C0C0", category: "灰系", season: "冬", description: "銀のような明るい灰色。光沢感を感じさせる。" },
  { name: "錆色", reading: "さびいろ", hex: "#A06040", category: "灰系", season: "秋", description: "金属が錆びたような赤みがかった灰茶色。" },
  { name: "利休色", reading: "りきゅういろ", hex: "#7A8B6A", category: "灰系", season: "通年", description: "千利休の茶道から生まれた渋みのある緑灰色。" },
  { name: "薄鼠", reading: "うすねず", hex: "#B0A8A8", category: "灰系", season: "冬", description: "薄い鼠色。やわらかな灰色。" },
  { name: "藍鼠", reading: "あいねず", hex: "#607080", category: "灰系", season: "冬", description: "藍みがかった鼠色。落ち着いた青灰色。" },
  { name: "紫鼠", reading: "むらさきねず", hex: "#786878", category: "灰系", season: "冬", description: "紫みがかった鼠色。上品な灰紫色。" },
  { name: "青鼠", reading: "あおねず", hex: "#607090", category: "灰系", season: "冬", description: "青みがかった鼠色。涼しげな灰青色。" },
  { name: "茶鼠", reading: "ちゃねず", hex: "#907868", category: "灰系", season: "秋", description: "茶みがかった鼠色。温かみのある灰茶色。" },
  { name: "錆鉄御召", reading: "さびてつおめし", hex: "#756555", category: "灰系", season: "通年", description: "錆びた鉄のような暗い茶灰色。" },
  { name: "丼鼠", reading: "どぶねずみ", hex: "#5C5C5C", category: "灰系", season: "通年", description: "どぶ鼠のような暗い灰色。" },
  { name: "煤色", reading: "すすいろ", hex: "#4A4040", category: "灰系", season: "冬", description: "煤のような暗い灰色。" },

  // 白黒系
  { name: "白", reading: "しろ", hex: "#FFFFFF", category: "白黒系", season: "通年", description: "純粋な白。清潔・純粋の象徴。" },
  { name: "黒", reading: "くろ", hex: "#000000", category: "白黒系", season: "通年", description: "純粋な黒。日本の伝統的な基本色。" },
  { name: "漆黒", reading: "しっこく", hex: "#0A0A0A", category: "白黒系", season: "通年", description: "漆のような深い黒。最も深みのある黒。" },
  { name: "墨色", reading: "すみいろ", hex: "#1A1A1A", category: "白黒系", season: "通年", description: "墨のような深い黒。書道を思わせる色。" },
  { name: "胡粉色", reading: "ごふんいろ", hex: "#F8F4F0", category: "白黒系", season: "通年", description: "胡粉（白土）のような温かみのある白。" },
  { name: "白磁", reading: "はくじ", hex: "#F5F0EA", category: "白黒系", season: "通年", description: "白磁器のような純白に近い白。" },
  { name: "象牙色", reading: "ぞうげいろ", hex: "#FFF8DC", category: "白黒系", season: "通年", description: "象牙のような温かみのある白。" },
  { name: "乳白色", reading: "にゅうはくしょく", hex: "#F8F4E6", category: "白黒系", season: "通年", description: "乳のような温かい白色。" },
  { name: "生成り色", reading: "きなりいろ", hex: "#F5F0DC", category: "白黒系", season: "通年", description: "生の絹のような自然な白。漂白していない色。" },
  { name: "卯の花色", reading: "うのはないろ", hex: "#F8F0E8", category: "白黒系", season: "春", description: "卯の花（ウツギの花）のような白。春の色。" },

  // 追加の色
  // 赤系追加
  { name: "鴇色", reading: "ときいろ", hex: "#F0A8A8", category: "赤系", season: "通年", description: "朱鷺の羽のような淡い赤みのピンク。" },
  { name: "薄桜", reading: "うすざくら", hex: "#F8DDE0", category: "赤系", season: "春", description: "桜の花びらのような極めて淡いピンク。" },
  { name: "撫子色", reading: "なでしこいろ", hex: "#E8A0B4", category: "赤系", season: "夏", description: "撫子の花のような淡い赤紫色。" },
  { name: "桜色", reading: "さくらいろ", hex: "#FFB7C5", category: "赤系", season: "春", description: "桜の花のような淡いピンク。春の代名詞。" },

  // 橙系追加
  { name: "珊瑚朱色", reading: "さんごしゅいろ", hex: "#EC7357", category: "橙系", season: "夏", description: "珊瑚と朱を合わせたような赤みのオレンジ。" },
  { name: "照柿", reading: "てりがき", hex: "#C46A30", category: "橙系", season: "秋", description: "照りのある柿のような深いオレンジ色。" },

  // 黄系追加
  { name: "玉子色", reading: "たまごいろ", hex: "#F5D080", category: "黄系", season: "通年", description: "卵黄のような温かい黄色。" },
  { name: "浅黄色", reading: "あさぎいろ", hex: "#E8E040", category: "黄系", season: "春", description: "淡い黄色。春の若葉を連想させる。" },
  { name: "芥子色", reading: "からしいろ", hex: "#C4A000", category: "黄系", season: "秋", description: "からしのような渋みのある黄色。" },
  { name: "黄金色", reading: "こがねいろ", hex: "#D4AC00", category: "黄系", season: "秋", description: "黄金のような輝く深い黄色。" },

  // 緑系追加
  { name: "千歳緑", reading: "ちとせみどり", hex: "#2D6A4F", category: "緑系", season: "冬", description: "千年の緑のように深い濃い緑色。" },
  { name: "鶸萌黄", reading: "ひわもえぎ", hex: "#A8C840", category: "緑系", season: "春", description: "鶸と萌黄を合わせた黄みの緑色。" },
  { name: "春草色", reading: "はるくさいろ", hex: "#9ABF78", category: "緑系", season: "春", description: "春の草のような明るい緑色。" },
  { name: "緑青色", reading: "ろくしょういろ", hex: "#2A8080", category: "緑系", season: "通年", description: "銅が酸化した緑青のような青緑色。" },

  // 青系追加
  { name: "碧色", reading: "みどりいろ", hex: "#007F80", category: "青系", season: "夏", description: "碧（深い青緑）の色。海の深さを感じる色。" },
  { name: "天色", reading: "あまいろ", hex: "#4FC0E8", category: "青系", season: "夏", description: "晴れた空の青色。澄んだ明るい青。" },
  { name: "勝色", reading: "かちいろ", hex: "#2C3F80", category: "青系", season: "通年", description: "「勝ち」に通じる縁起のよい深い藍色。" },
  { name: "青白橡", reading: "あおしろつるばみ", hex: "#8090A0", category: "青系", season: "秋", description: "橡（くぬぎ）の青白い色合い。" },

  // 紫系追加
  { name: "深紫", reading: "ふかむらさき", hex: "#500050", category: "紫系", season: "冬", description: "非常に深い暗い紫。高貴さを感じる色。" },
  { name: "藤浅葱", reading: "ふじあさぎ", hex: "#6080B8", category: "紫系", season: "春", description: "藤色と浅葱色を合わせた青紫色。" },
  { name: "薄色", reading: "うすいろ", hex: "#C0A8D0", category: "紫系", season: "通年", description: "淡い紫色の総称。やさしくやわらかな色。" },
  { name: "梅紫", reading: "うめむらさき", hex: "#906090", category: "紫系", season: "春", description: "梅の花のような赤みがかった紫色。" },

  // 茶系追加
  { name: "土色", reading: "つちいろ", hex: "#A0784A", category: "茶系", season: "通年", description: "土のような温かみのある黄茶色。" },
  { name: "黄橡", reading: "きつるばみ", hex: "#B09050", category: "茶系", season: "秋", description: "橡（くぬぎ）の実の黄みがかった茶色。" },
  { name: "路考茶", reading: "ろこうちゃ", hex: "#7A6040", category: "茶系", season: "通年", description: "歌舞伎役者・瀬川路考が好んだ緑みの茶色。" },
  { name: "梅染", reading: "うめぞめ", hex: "#C08060", category: "茶系", season: "春", description: "梅の木で染めた淡い赤茶色。" },
  { name: "丁子色", reading: "ちょうじいろ", hex: "#D09060", category: "茶系", season: "通年", description: "丁子（クローブ）の色。暖かみのある黄茶。" },
  { name: "樺色", reading: "かばいろ", hex: "#C07840", category: "茶系", season: "秋", description: "樺（かば）の木の皮のような赤みの茶色。" },

  // 灰系追加
  { name: "白鼠", reading: "しろねず", hex: "#D8D0CC", category: "灰系", season: "通年", description: "白みがかった鼠色。明るい灰色。" },
  { name: "深川鼠", reading: "ふかがわねず", hex: "#8090A0", category: "灰系", season: "通年", description: "深川地区で好まれた青みがかった灰色。" },
  { name: "消炭色", reading: "けしずみいろ", hex: "#404040", category: "灰系", season: "冬", description: "消し炭のような暗い灰色。" },
  { name: "鉛色", reading: "なまりいろ", hex: "#909090", category: "灰系", season: "冬", description: "鉛のような重みのある灰色。" },
  { name: "素鼠", reading: "すねずみ", hex: "#989898", category: "灰系", season: "通年", description: "何も加工していない鼠色。標準的な灰色。" },

  // 赤系 追加
  { name: "中紅花", reading: "なかくれない", hex: "#E8546A", category: "赤系", season: "通年", description: "紅花の中程度の染色。やや明るめの赤。" },
  { name: "赤紅", reading: "あかべに", hex: "#D02040", category: "赤系", season: "通年", description: "赤みの強い紅色。艶やかな深紅。" },
  { name: "一斤染", reading: "いっこんぞめ", hex: "#F0B8B0", category: "赤系", season: "春", description: "紅花一斤で染めた淡い赤。薄くやさしい色。" },
  { name: "紅緋", reading: "べにひ", hex: "#E8283C", category: "赤系", season: "通年", description: "紅と緋を合わせた鮮やかな赤。" },
  { name: "赤朽葉", reading: "あかくちば", hex: "#C06040", category: "赤系", season: "秋", description: "赤みがかった朽葉色。秋の情景を映す色。" },
  { name: "唐紅", reading: "からくれない", hex: "#D03060", category: "赤系", season: "通年", description: "中国渡来の技法で染めた濃い紅色。" },
  { name: "薔薇色", reading: "ばらいろ", hex: "#E8406A", category: "赤系", season: "春", description: "薔薇の花のような鮮やかなピンク。" },

  // 橙系 追加
  { name: "曙色", reading: "あけぼのいろ", hex: "#F0A070", category: "橙系", season: "春", description: "夜明けの空のような淡い赤橙色。" },
  { name: "蘗色", reading: "きわだいろ", hex: "#E8C000", category: "橙系", season: "通年", description: "黄蘗の樹皮から染めた鮮やかな黄橙色。" },
  { name: "黄支子色", reading: "きくちなしいろ", hex: "#F0C040", category: "橙系", season: "通年", description: "支子（クチナシ）で染めた黄みのオレンジ。" },
  { name: "浅緋", reading: "うすひ", hex: "#F4A080", category: "橙系", season: "通年", description: "薄い緋色。淡いオレンジがかった赤。" },

  // 黄系 追加
  { name: "木蘭色", reading: "もくらんいろ", hex: "#D4B080", category: "黄系", season: "通年", description: "木蘭の花のような淡い黄褐色。" },
  { name: "黄朽葉色", reading: "きくちばいろ", hex: "#C8A040", category: "黄系", season: "秋", description: "黄みがかった朽葉色。枯れ葉の色合い。" },
  { name: "女郎花色", reading: "おみなえしいろ", hex: "#E8D840", category: "黄系", season: "秋", description: "女郎花の花のような鮮やかな黄色。" },
  { name: "中黄", reading: "ちゅうき", hex: "#F0D000", category: "黄系", season: "通年", description: "中程度の純粋な黄色。" },
  { name: "蜂蜜色", reading: "はちみついろ", hex: "#F0C030", category: "黄系", season: "通年", description: "蜂蜜のような温かみのある黄色。" },
  { name: "肥後煤竹", reading: "ひごすすたけ", hex: "#B09050", category: "黄系", season: "通年", description: "肥後国（熊本）の煤竹のような暗い黄茶色。" },

  // 緑系 追加
  { name: "裏葉色", reading: "うらはいろ", hex: "#789060", category: "緑系", season: "夏", description: "葉の裏側のような銀みがかった緑色。" },
  { name: "木賊色", reading: "とくさいろ", hex: "#406050", category: "緑系", season: "通年", description: "木賊（トクサ）のような濃い灰緑色。" },
  { name: "緑青", reading: "ろくしょう", hex: "#3A8060", category: "緑系", season: "通年", description: "銅の錆から生まれた深い青緑色。日本画の顔料。" },
  { name: "御召茶", reading: "おめしちゃ", hex: "#607050", category: "緑系", season: "通年", description: "御召縮緬の緑みがかった茶色。" },
  { name: "夏虫色", reading: "なつむしいろ", hex: "#80B880", category: "緑系", season: "夏", description: "夏の虫（蛾の幼虫）のような淡い緑色。" },
  { name: "深川鼠", reading: "ふかがわねずみ", hex: "#708090", category: "緑系", season: "通年", description: "江戸の深川で好まれた青みがかった灰緑色。" },
  { name: "白緑", reading: "びゃくろく", hex: "#C8E0C0", category: "緑系", season: "春", description: "白みがかった淡い緑色。春の若草の色。" },

  // 青系 追加
  { name: "花浅葱", reading: "はなあさぎ", hex: "#1E90D0", category: "青系", season: "夏", description: "花のように鮮やかな浅葱色。明るい青。" },
  { name: "薄花色", reading: "うすはないろ", hex: "#A0C8E8", category: "青系", season: "春", description: "薄い青花色。やわらかな水色。" },
  { name: "瓶覗", reading: "かめのぞき", hex: "#C8E8F0", category: "青系", season: "夏", description: "藍染の甕を覗いた時のような極めて薄い青。" },
  { name: "青白", reading: "あおしろ", hex: "#D8EAF0", category: "青系", season: "通年", description: "青みがかった白。清澄な色。" },
  { name: "露草色", reading: "つゆくさいろ", hex: "#4488CC", category: "青系", season: "夏", description: "露草の花のような鮮やかな青色。" },
  { name: "鉄紺", reading: "てつこん", hex: "#18203A", category: "青系", season: "冬", description: "鉄のような深い紺色。非常に暗い青。" },
  { name: "海松藍", reading: "みるあい", hex: "#4A6858", category: "青系", season: "通年", description: "海松色に藍を加えた深い青緑色。" },
  { name: "薄藍", reading: "うすあい", hex: "#8090C0", category: "青系", season: "通年", description: "薄い藍色。淡い青みがかった色。" },

  // 紫系 追加
  { name: "赤紫", reading: "あかむらさき", hex: "#B03878", category: "紫系", season: "通年", description: "赤みが強い紫。情熱的な色。" },
  { name: "滅紫", reading: "けしむらさき", hex: "#6A3858", category: "紫系", season: "冬", description: "くすんで暗い紫色。渋みのある色。" },
  { name: "古代紫", reading: "こだいむらさき", hex: "#785880", category: "紫系", season: "通年", description: "古代より伝わる落ち着いた紫色。" },
  { name: "赤藤色", reading: "あかふじいろ", hex: "#C090B8", category: "紫系", season: "春", description: "赤みがかった藤色。やわらかな赤紫。" },
  { name: "紫苑色", reading: "しおんいろ", hex: "#8878B8", category: "紫系", season: "秋", description: "紫苑の花のような青みがかった紫色。" },
  { name: "鳩羽色", reading: "はとばいろ", hex: "#907898", category: "紫系", season: "通年", description: "鳩の羽のような灰みがかった薄紫色。" },

  // 茶系 追加
  { name: "檜皮色", reading: "ひわだいろ", hex: "#8B4020", category: "茶系", season: "通年", description: "檜の皮のような赤茶色。" },
  { name: "黒茶", reading: "くろちゃ", hex: "#3C2010", category: "茶系", season: "冬", description: "黒みがかった茶色。非常に暗い茶色。" },
  { name: "赤白橡", reading: "あかしろつるばみ", hex: "#C09060", category: "茶系", season: "秋", description: "橡実の赤みがかった薄い茶色。" },
  { name: "丁子茶", reading: "ちょうじちゃ", hex: "#B07040", category: "茶系", season: "通年", description: "丁子色に近い黄みがかった茶色。" },
  { name: "焦茶", reading: "こげちゃ", hex: "#3A1A00", category: "茶系", season: "冬", description: "焦げた茶のような非常に暗い茶色。" },
  { name: "銀煤竹", reading: "ぎんすすたけ", hex: "#8A7060", category: "茶系", season: "通年", description: "銀みがかった煤竹色。灰みの茶色。" },

  // 灰系 追加
  { name: "湊鼠", reading: "みなとねずみ", hex: "#7080A0", category: "灰系", season: "通年", description: "港の色のような青みがかった灰色。" },
  { name: "紅消鼠", reading: "べにけしねず", hex: "#887080", category: "灰系", season: "通年", description: "紅を消したような赤みがかった鼠色。" },
  { name: "暁鼠", reading: "あかつきねず", hex: "#C0A8A8", category: "灰系", season: "通年", description: "夜明けの空のような淡い赤みの灰色。" },
  { name: "錆鼠", reading: "さびねずみ", hex: "#706060", category: "灰系", season: "秋", description: "錆のような赤みがかった暗い灰色。" },
  { name: "牡丹鼠", reading: "ぼたんねず", hex: "#A088A0", category: "灰系", season: "春", description: "牡丹色がかった薄い紫灰色。" },

  // 白黒系 追加
  { name: "練色", reading: "ねりいろ", hex: "#F0E8D0", category: "白黒系", season: "通年", description: "絹糸を練った時のような温かみのある白。" },
  { name: "絹鼠", reading: "きぬねずみ", hex: "#D0C8C0", category: "白黒系", season: "通年", description: "絹の光沢のような淡い灰白色。" },
  { name: "灰白色", reading: "かいはくしょく", hex: "#E8E4DC", category: "白黒系", season: "通年", description: "灰みがかった白色。やわらかな白。" },
  { name: "薄墨色", reading: "うすすみいろ", hex: "#505050", category: "白黒系", season: "通年", description: "薄く溶いた墨のような暗い灰色。" },
];

export const CATEGORIES = ["赤系", "橙系", "黄系", "緑系", "青系", "紫系", "茶系", "灰系", "白黒系"] as const;
export const SEASONS = ["春", "夏", "秋", "冬", "通年"] as const;

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

export function isLightColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
