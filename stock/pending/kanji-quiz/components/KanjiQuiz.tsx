"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Level = "N5" | "N4" | "N3" | "N2" | "N1";

type Word = {
  kanji: string;
  reading: string;
  meaning: string;
  example: string;
};

const WORDS: Record<Level, Word[]> = {
  N5: [
    { kanji: "日本", reading: "にほん", meaning: "Japan", example: "日本は島国です。" },
    { kanji: "大学", reading: "だいがく", meaning: "university", example: "大学で勉強します。" },
    { kanji: "先生", reading: "せんせい", meaning: "teacher", example: "先生に質問しました。" },
    { kanji: "学生", reading: "がくせい", meaning: "student", example: "私は学生です。" },
    { kanji: "水", reading: "みず", meaning: "water", example: "水を飲みます。" },
    { kanji: "山", reading: "やま", meaning: "mountain", example: "富士山は高いです。" },
    { kanji: "川", reading: "かわ", meaning: "river", example: "川で泳ぎます。" },
    { kanji: "木", reading: "き", meaning: "tree", example: "公園に木があります。" },
    { kanji: "火", reading: "ひ", meaning: "fire", example: "火は熱いです。" },
    { kanji: "土", reading: "つち", meaning: "soil / earth", example: "土の中に虫がいます。" },
    { kanji: "人", reading: "ひと", meaning: "person", example: "あそこに人がいます。" },
    { kanji: "手", reading: "て", meaning: "hand", example: "手を洗います。" },
    { kanji: "目", reading: "め", meaning: "eye", example: "目が大きいです。" },
    { kanji: "口", reading: "くち", meaning: "mouth", example: "口を開けてください。" },
    { kanji: "耳", reading: "みみ", meaning: "ear", example: "耳が痛いです。" },
    { kanji: "右", reading: "みぎ", meaning: "right (direction)", example: "右に曲がってください。" },
    { kanji: "左", reading: "ひだり", meaning: "left (direction)", example: "左の建物です。" },
    { kanji: "上", reading: "うえ", meaning: "above / up", example: "机の上に本があります。" },
    { kanji: "下", reading: "した", meaning: "below / down", example: "椅子の下を見てください。" },
    { kanji: "中", reading: "なか", meaning: "inside / middle", example: "箱の中に何がありますか。" },
    { kanji: "外", reading: "そと", meaning: "outside", example: "外は寒いです。" },
    { kanji: "今", reading: "いま", meaning: "now", example: "今、何時ですか。" },
    { kanji: "毎日", reading: "まいにち", meaning: "every day", example: "毎日運動します。" },
    { kanji: "食べ物", reading: "たべもの", meaning: "food", example: "食べ物が好きです。" },
    { kanji: "飲み物", reading: "のみもの", meaning: "drink / beverage", example: "飲み物は何にしますか。" },
    { kanji: "電話", reading: "でんわ", meaning: "telephone", example: "電話をかけます。" },
    { kanji: "学校", reading: "がっこう", meaning: "school", example: "学校へ行きます。" },
    { kanji: "友達", reading: "ともだち", meaning: "friend", example: "友達と遊びます。" },
    { kanji: "時間", reading: "じかん", meaning: "time", example: "時間がありません。" },
    { kanji: "来年", reading: "らいねん", meaning: "next year", example: "来年また会いましょう。" },
    { kanji: "今日", reading: "きょう", meaning: "today", example: "今日は天気がいいです。" },
    { kanji: "明日", reading: "あした", meaning: "tomorrow", example: "明日また来てください。" },
    { kanji: "昨日", reading: "きのう", meaning: "yesterday", example: "昨日は雨でした。" },
    { kanji: "何", reading: "なに", meaning: "what", example: "何が好きですか。" },
    { kanji: "言葉", reading: "ことば", meaning: "word / language", example: "日本語の言葉を覚えます。" },
    { kanji: "名前", reading: "なまえ", meaning: "name", example: "名前を教えてください。" },
    { kanji: "本", reading: "ほん", meaning: "book", example: "本を読みます。" },
    { kanji: "駅", reading: "えき", meaning: "station", example: "駅はどこですか。" },
    { kanji: "店", reading: "みせ", meaning: "shop / store", example: "この店は安いです。" },
    { kanji: "車", reading: "くるま", meaning: "car", example: "車で来ました。" },
    { kanji: "道", reading: "みち", meaning: "road / path", example: "この道を真っ直ぐ行きます。" },
    { kanji: "花", reading: "はな", meaning: "flower", example: "花がきれいです。" },
    { kanji: "空", reading: "そら", meaning: "sky", example: "空が青いです。" },
    { kanji: "海", reading: "うみ", meaning: "sea / ocean", example: "夏は海へ行きます。" },
    { kanji: "冬", reading: "ふゆ", meaning: "winter", example: "冬は寒いです。" },
    { kanji: "夏", reading: "なつ", meaning: "summer", example: "夏休みが楽しみです。" },
    { kanji: "春", reading: "はる", meaning: "spring", example: "春は桜が咲きます。" },
    { kanji: "秋", reading: "あき", meaning: "autumn / fall", example: "秋は紅葉がきれいです。" },
    { kanji: "雨", reading: "あめ", meaning: "rain", example: "今日は雨が降ります。" },
    { kanji: "雪", reading: "ゆき", meaning: "snow", example: "雪が積もりました。" },
  ],
  N4: [
    { kanji: "会議", reading: "かいぎ", meaning: "meeting", example: "午後に会議があります。" },
    { kanji: "説明", reading: "せつめい", meaning: "explanation", example: "もう一度説明してください。" },
    { kanji: "予約", reading: "よやく", meaning: "reservation", example: "レストランを予約しました。" },
    { kanji: "旅行", reading: "りょこう", meaning: "travel", example: "来月、旅行に行きます。" },
    { kanji: "運動", reading: "うんどう", meaning: "exercise", example: "毎朝運動しています。" },
    { kanji: "練習", reading: "れんしゅう", meaning: "practice", example: "毎日ピアノを練習します。" },
    { kanji: "準備", reading: "じゅんび", meaning: "preparation", example: "試験の準備をしています。" },
    { kanji: "世界", reading: "せかい", meaning: "world", example: "世界中を旅したいです。" },
    { kanji: "社会", reading: "しゃかい", meaning: "society", example: "社会のルールを守ります。" },
    { kanji: "文化", reading: "ぶんか", meaning: "culture", example: "日本の文化が好きです。" },
    { kanji: "科学", reading: "かがく", meaning: "science", example: "科学の授業は面白いです。" },
    { kanji: "技術", reading: "ぎじゅつ", meaning: "technology / skill", example: "最新の技術を使います。" },
    { kanji: "医者", reading: "いしゃ", meaning: "doctor", example: "医者に診てもらいました。" },
    { kanji: "病院", reading: "びょういん", meaning: "hospital", example: "病院へ行きました。" },
    { kanji: "薬", reading: "くすり", meaning: "medicine", example: "薬を飲んでください。" },
    { kanji: "体", reading: "からだ", meaning: "body", example: "体の調子はどうですか。" },
    { kanji: "顔", reading: "かお", meaning: "face", example: "彼女の顔はきれいです。" },
    { kanji: "声", reading: "こえ", meaning: "voice", example: "大きな声で話してください。" },
    { kanji: "言語", reading: "げんご", meaning: "language", example: "外国語を勉強しています。" },
    { kanji: "地図", reading: "ちず", meaning: "map", example: "地図を見て道を確認します。" },
    { kanji: "天気", reading: "てんき", meaning: "weather", example: "今日の天気はいいですね。" },
    { kanji: "地震", reading: "じしん", meaning: "earthquake", example: "地震が起きました。" },
    { kanji: "番号", reading: "ばんごう", meaning: "number", example: "電話番号を教えてください。" },
    { kanji: "写真", reading: "しゃしん", meaning: "photograph", example: "写真を撮りましょう。" },
    { kanji: "音楽", reading: "おんがく", meaning: "music", example: "音楽を聴くのが好きです。" },
    { kanji: "映画", reading: "えいが", meaning: "movie", example: "映画を見に行きましょう。" },
    { kanji: "料理", reading: "りょうり", meaning: "cooking / cuisine", example: "料理が得意です。" },
    { kanji: "食事", reading: "しょくじ", meaning: "meal", example: "一緒に食事しませんか。" },
    { kanji: "買い物", reading: "かいもの", meaning: "shopping", example: "週末に買い物に行きます。" },
    { kanji: "仕事", reading: "しごと", meaning: "work / job", example: "仕事が忙しいです。" },
    { kanji: "会社", reading: "かいしゃ", meaning: "company", example: "大きな会社に勤めています。" },
    { kanji: "電車", reading: "でんしゃ", meaning: "train", example: "電車で通勤します。" },
    { kanji: "飛行機", reading: "ひこうき", meaning: "airplane", example: "飛行機で海外へ行きます。" },
    { kanji: "切符", reading: "きっぷ", meaning: "ticket", example: "電車の切符を買います。" },
    { kanji: "荷物", reading: "にもつ", meaning: "luggage / baggage", example: "荷物が重いです。" },
    { kanji: "部屋", reading: "へや", meaning: "room", example: "部屋を掃除しました。" },
    { kanji: "窓", reading: "まど", meaning: "window", example: "窓を開けてもいいですか。" },
    { kanji: "階段", reading: "かいだん", meaning: "stairs", example: "階段を使ってください。" },
    { kanji: "玄関", reading: "げんかん", meaning: "entrance / front door", example: "玄関で靴を脱ぎます。" },
    { kanji: "台所", reading: "だいどころ", meaning: "kitchen", example: "台所で料理を作ります。" },
    { kanji: "図書館", reading: "としょかん", meaning: "library", example: "図書館で本を借ります。" },
    { kanji: "公園", reading: "こうえん", meaning: "park", example: "公園を散歩します。" },
    { kanji: "市場", reading: "いちば", meaning: "market", example: "市場で野菜を買います。" },
    { kanji: "動物", reading: "どうぶつ", meaning: "animal", example: "動物が好きです。" },
    { kanji: "植物", reading: "しょくぶつ", meaning: "plant", example: "植物に水をやります。" },
    { kanji: "色", reading: "いろ", meaning: "color", example: "好きな色は何ですか。" },
    { kanji: "形", reading: "かたち", meaning: "shape / form", example: "面白い形ですね。" },
    { kanji: "大切", reading: "たいせつ", meaning: "important / precious", example: "健康が一番大切です。" },
    { kanji: "有名", reading: "ゆうめい", meaning: "famous", example: "有名な場所です。" },
    { kanji: "便利", reading: "べんり", meaning: "convenient", example: "とても便利なアプリです。" },
  ],
  N3: [
    { kanji: "経験", reading: "けいけん", meaning: "experience", example: "海外での経験が役に立ちます。" },
    { kanji: "機会", reading: "きかい", meaning: "opportunity / chance", example: "いい機会なので挑戦します。" },
    { kanji: "目的", reading: "もくてき", meaning: "purpose / goal", example: "旅行の目的は何ですか。" },
    { kanji: "方法", reading: "ほうほう", meaning: "method / way", example: "別の方法を考えましょう。" },
    { kanji: "結果", reading: "けっか", meaning: "result", example: "試験の結果が出ました。" },
    { kanji: "原因", reading: "げんいん", meaning: "cause / reason", example: "事故の原因を調べます。" },
    { kanji: "影響", reading: "えいきょう", meaning: "influence / effect", example: "気候変動の影響を受けています。" },
    { kanji: "関係", reading: "かんけい", meaning: "relationship", example: "二人の関係はどうですか。" },
    { kanji: "状況", reading: "じょうきょう", meaning: "situation / circumstances", example: "現在の状況を説明します。" },
    { kanji: "問題", reading: "もんだい", meaning: "problem / question", example: "この問題を解いてください。" },
    { kanji: "解決", reading: "かいけつ", meaning: "solution / resolution", example: "問題を解決しました。" },
    { kanji: "計画", reading: "けいかく", meaning: "plan", example: "旅行の計画を立てます。" },
    { kanji: "判断", reading: "はんだん", meaning: "judgment / decision", example: "自分で判断してください。" },
    { kanji: "確認", reading: "かくにん", meaning: "confirmation / check", example: "予約を確認します。" },
    { kanji: "連絡", reading: "れんらく", meaning: "contact / communication", example: "後で連絡します。" },
    { kanji: "報告", reading: "ほうこく", meaning: "report", example: "上司に報告しました。" },
    { kanji: "調査", reading: "ちょうさ", meaning: "investigation / research", example: "市場調査を行います。" },
    { kanji: "研究", reading: "けんきゅう", meaning: "research / study", example: "新しい研究を始めました。" },
    { kanji: "発展", reading: "はってん", meaning: "development / growth", example: "経済の発展が続いています。" },
    { kanji: "環境", reading: "かんきょう", meaning: "environment", example: "環境問題を考えます。" },
    { kanji: "政治", reading: "せいじ", meaning: "politics", example: "政治に興味があります。" },
    { kanji: "経済", reading: "けいざい", meaning: "economy", example: "経済が回復しています。" },
    { kanji: "教育", reading: "きょういく", meaning: "education", example: "教育の質を向上させます。" },
    { kanji: "医療", reading: "いりょう", meaning: "medical care", example: "医療費が高いです。" },
    { kanji: "福祉", reading: "ふくし", meaning: "welfare", example: "社会福祉を充実させます。" },
    { kanji: "法律", reading: "ほうりつ", meaning: "law", example: "法律を守ることが大切です。" },
    { kanji: "規則", reading: "きそく", meaning: "rule / regulation", example: "規則に従ってください。" },
    { kanji: "習慣", reading: "しゅうかん", meaning: "habit / custom", example: "早起きの習慣があります。" },
    { kanji: "伝統", reading: "でんとう", meaning: "tradition", example: "日本の伝統を守ります。" },
    { kanji: "文明", reading: "ぶんめい", meaning: "civilization", example: "古代文明を研究しています。" },
    { kanji: "宗教", reading: "しゅうきょう", meaning: "religion", example: "宗教について学びます。" },
    { kanji: "芸術", reading: "げいじゅつ", meaning: "art", example: "芸術は感動を与えます。" },
    { kanji: "建築", reading: "けんちく", meaning: "architecture", example: "美しい建築が好きです。" },
    { kanji: "農業", reading: "のうぎょう", meaning: "agriculture", example: "農業を近代化します。" },
    { kanji: "工業", reading: "こうぎょう", meaning: "industry", example: "工業地帯が発展しました。" },
    { kanji: "商業", reading: "しょうぎょう", meaning: "commerce / trade", example: "商業の中心地です。" },
    { kanji: "貿易", reading: "ぼうえき", meaning: "trade / commerce", example: "日本は貿易が盛んです。" },
    { kanji: "輸出", reading: "ゆしゅつ", meaning: "export", example: "自動車を輸出しています。" },
    { kanji: "輸入", reading: "ゆにゅう", meaning: "import", example: "食料を輸入しています。" },
    { kanji: "市民", reading: "しみん", meaning: "citizen", example: "市民の意見を聞きます。" },
    { kanji: "地域", reading: "ちいき", meaning: "region / area", example: "地域のために働きます。" },
    { kanji: "都市", reading: "とし", meaning: "city / urban area", example: "都市化が進んでいます。" },
    { kanji: "農村", reading: "のうそん", meaning: "rural village", example: "農村に移住しました。" },
    { kanji: "自然", reading: "しぜん", meaning: "nature", example: "自然を大切にします。" },
    { kanji: "資源", reading: "しげん", meaning: "resources", example: "資源を有効活用します。" },
    { kanji: "エネルギー", reading: "えねるぎー", meaning: "energy", example: "再生可能エネルギーを使います。" },
    { kanji: "危険", reading: "きけん", meaning: "danger", example: "ここは危険です。" },
    { kanji: "安全", reading: "あんぜん", meaning: "safety", example: "安全を確認してください。" },
    { kanji: "注意", reading: "ちゅうい", meaning: "attention / caution", example: "注意してください。" },
    { kanji: "警告", reading: "けいこく", meaning: "warning", example: "警告を無視しないでください。" },
  ],
  N2: [
    { kanji: "概念", reading: "がいねん", meaning: "concept", example: "この概念を理解するのは難しい。" },
    { kanji: "抽象", reading: "ちゅうしょう", meaning: "abstraction", example: "抽象的な考え方が得意です。" },
    { kanji: "具体", reading: "ぐたい", meaning: "concrete / specific", example: "具体的な例を挙げてください。" },
    { kanji: "論理", reading: "ろんり", meaning: "logic", example: "論理的に考えることが大切です。" },
    { kanji: "推論", reading: "すいろん", meaning: "inference / reasoning", example: "データから推論します。" },
    { kanji: "仮説", reading: "かせつ", meaning: "hypothesis", example: "仮説を立てて実験します。" },
    { kanji: "証明", reading: "しょうめい", meaning: "proof / demonstration", example: "無罪を証明しました。" },
    { kanji: "根拠", reading: "こんきょ", meaning: "basis / grounds", example: "根拠を示してください。" },
    { kanji: "前提", reading: "ぜんてい", meaning: "premise / precondition", example: "前提が違います。" },
    { kanji: "矛盾", reading: "むじゅん", meaning: "contradiction", example: "説明に矛盾があります。" },
    { kanji: "批判", reading: "ひはん", meaning: "criticism", example: "建設的な批判をします。" },
    { kanji: "評価", reading: "ひょうか", meaning: "evaluation", example: "公正に評価してください。" },
    { kanji: "比較", reading: "ひかく", meaning: "comparison", example: "二つの案を比較します。" },
    { kanji: "分析", reading: "ぶんせき", meaning: "analysis", example: "データを分析します。" },
    { kanji: "統計", reading: "とうけい", meaning: "statistics", example: "統計データを見ます。" },
    { kanji: "傾向", reading: "けいこう", meaning: "tendency / trend", example: "最近の傾向を分析します。" },
    { kanji: "程度", reading: "ていど", meaning: "degree / extent", example: "どの程度まで可能ですか。" },
    { kanji: "範囲", reading: "はんい", meaning: "range / scope", example: "試験の範囲を確認します。" },
    { kanji: "限界", reading: "げんかい", meaning: "limit / boundary", example: "人間の限界を超えます。" },
    { kanji: "余裕", reading: "よゆう", meaning: "margin / leeway", example: "時間に余裕があります。" },
    { kanji: "緊張", reading: "きんちょう", meaning: "tension / nervousness", example: "発表前は緊張します。" },
    { kanji: "集中", reading: "しゅうちゅう", meaning: "concentration", example: "仕事に集中します。" },
    { kanji: "効率", reading: "こうりつ", meaning: "efficiency", example: "効率よく作業します。" },
    { kanji: "能力", reading: "のうりょく", meaning: "ability / capacity", example: "能力を発揮します。" },
    { kanji: "才能", reading: "さいのう", meaning: "talent", example: "音楽の才能があります。" },
    { kanji: "努力", reading: "どりょく", meaning: "effort", example: "努力すれば必ず結果が出ます。" },
    { kanji: "成功", reading: "せいこう", meaning: "success", example: "プロジェクトが成功しました。" },
    { kanji: "失敗", reading: "しっぱい", meaning: "failure", example: "失敗から学びます。" },
    { kanji: "挑戦", reading: "ちょうせん", meaning: "challenge", example: "新しいことに挑戦します。" },
    { kanji: "克服", reading: "こくふく", meaning: "overcoming", example: "困難を克服しました。" },
    { kanji: "達成", reading: "たっせい", meaning: "achievement", example: "目標を達成しました。" },
    { kanji: "継続", reading: "けいぞく", meaning: "continuation", example: "努力を継続することが大切です。" },
    { kanji: "維持", reading: "いじ", meaning: "maintenance", example: "品質を維持します。" },
    { kanji: "改善", reading: "かいぜん", meaning: "improvement", example: "システムを改善します。" },
    { kanji: "革新", reading: "かくしん", meaning: "innovation", example: "革新的な技術です。" },
    { kanji: "創造", reading: "そうぞう", meaning: "creation", example: "新しいものを創造します。" },
    { kanji: "発明", reading: "はつめい", meaning: "invention", example: "偉大な発明をしました。" },
    { kanji: "特許", reading: "とっきょ", meaning: "patent", example: "特許を取得しました。" },
    { kanji: "権利", reading: "けんり", meaning: "right", example: "人権を守ります。" },
    { kanji: "義務", reading: "ぎむ", meaning: "duty / obligation", example: "納税の義務があります。" },
    { kanji: "責任", reading: "せきにん", meaning: "responsibility", example: "責任を果たします。" },
    { kanji: "倫理", reading: "りんり", meaning: "ethics", example: "倫理的な問題を考えます。" },
    { kanji: "哲学", reading: "てつがく", meaning: "philosophy", example: "哲学を学んでいます。" },
    { kanji: "思想", reading: "しそう", meaning: "thought / ideology", example: "様々な思想があります。" },
    { kanji: "価値観", reading: "かちかん", meaning: "values / sense of values", example: "価値観が違います。" },
    { kanji: "信念", reading: "しんねん", meaning: "belief / conviction", example: "強い信念を持っています。" },
    { kanji: "感情", reading: "かんじょう", meaning: "emotion / feeling", example: "感情をコントロールします。" },
    { kanji: "記憶", reading: "きおく", meaning: "memory", example: "幼い頃の記憶があります。" },
    { kanji: "想像", reading: "そうぞう", meaning: "imagination", example: "想像力を働かせます。" },
    { kanji: "直感", reading: "ちょっかん", meaning: "intuition", example: "直感を信じることもあります。" },
  ],
  N1: [
    { kanji: "漸進", reading: "ぜんしん", meaning: "gradual progress", example: "漸進的な改革を進めます。" },
    { kanji: "逡巡", reading: "しゅんじゅん", meaning: "hesitation / wavering", example: "逡巡することなく決断しました。" },
    { kanji: "顛末", reading: "てんまつ", meaning: "whole story / details", example: "事件の顛末を説明します。" },
    { kanji: "忖度", reading: "そんたく", meaning: "conjecture / consideration", example: "相手の気持ちを忖度します。" },
    { kanji: "蹂躙", reading: "じゅうりん", meaning: "trampling / violation", example: "人権が蹂躙されました。" },
    { kanji: "瑕疵", reading: "かし", meaning: "defect / flaw", example: "製品に瑕疵が見つかりました。" },
    { kanji: "僭越", reading: "せんえつ", meaning: "presumptuousness", example: "僭越ながら申し上げます。" },
    { kanji: "鑑定", reading: "かんてい", meaning: "appraisal / expert opinion", example: "美術品を鑑定します。" },
    { kanji: "斡旋", reading: "あっせん", meaning: "mediation / arrangement", example: "就職を斡旋してもらいました。" },
    { kanji: "醸成", reading: "じょうせい", meaning: "fostering / cultivating", example: "信頼関係を醸成します。" },
    { kanji: "払拭", reading: "ふっしょく", meaning: "wiping out / clearing away", example: "疑念を払拭します。" },
    { kanji: "逸脱", reading: "いつだつ", meaning: "deviation", example: "規範から逸脱した行為です。" },
    { kanji: "煩雑", reading: "はんざつ", meaning: "complicated / troublesome", example: "手続きが煩雑です。" },
    { kanji: "些細", reading: "ささい", meaning: "trivial / minor", example: "些細なことで争いました。" },
    { kanji: "顕著", reading: "けんちょ", meaning: "remarkable / conspicuous", example: "顕著な改善が見られます。" },
    { kanji: "曖昧", reading: "あいまい", meaning: "vague / ambiguous", example: "曖昧な表現は避けましょう。" },
    { kanji: "恣意", reading: "しい", meaning: "arbitrariness", example: "恣意的な判断は問題です。" },
    { kanji: "齟齬", reading: "そご", meaning: "discrepancy / mismatch", example: "認識の齟齬がありました。" },
    { kanji: "乖離", reading: "かいり", meaning: "divergence / gap", example: "理想と現実の乖離があります。" },
    { kanji: "脆弱", reading: "ぜいじゃく", meaning: "fragile / vulnerable", example: "セキュリティが脆弱です。" },
    { kanji: "錯綜", reading: "さくそう", meaning: "complication / entanglement", example: "情報が錯綜しています。" },
    { kanji: "傍観", reading: "ぼうかん", meaning: "looking on / being a bystander", example: "事態を傍観できません。" },
    { kanji: "介入", reading: "かいにゅう", meaning: "intervention", example: "国際社会が介入しました。" },
    { kanji: "抑止", reading: "よくし", meaning: "deterrence", example: "犯罪を抑止する効果があります。" },
    { kanji: "緩和", reading: "かんわ", meaning: "relaxation / easing", example: "規制を緩和しました。" },
    { kanji: "是正", reading: "ぜせい", meaning: "correction / rectification", example: "不公平を是正します。" },
    { kanji: "喚起", reading: "かんき", meaning: "arousing / awakening", example: "注意を喚起します。" },
    { kanji: "懸念", reading: "けねん", meaning: "concern / worry", example: "安全性に懸念があります。" },
    { kanji: "憂慮", reading: "ゆうりょ", meaning: "anxiety / apprehension", example: "将来を憂慮しています。" },
    { kanji: "逼迫", reading: "ひっぱく", meaning: "pressure / urgency", example: "財政が逼迫しています。" },
    { kanji: "端緒", reading: "たんちょ", meaning: "beginning / clue", example: "解決の端緒をつかみました。" },
    { kanji: "帰趨", reading: "きすう", meaning: "outcome / result", example: "交渉の帰趨に注目します。" },
    { kanji: "所以", reading: "ゆえん", meaning: "reason / cause", example: "失敗した所以を考えます。" },
    { kanji: "蓋然性", reading: "がいぜんせい", meaning: "probability / likelihood", example: "成功の蓋然性が高いです。" },
    { kanji: "恣意的", reading: "しいてき", meaning: "arbitrary", example: "恣意的な解釈は認められません。" },
    { kanji: "辻褄", reading: "つじつま", meaning: "coherence / consistency", example: "辻褄が合わない説明です。" },
    { kanji: "忌憚", reading: "きたん", meaning: "reserve / hesitation", example: "忌憚のない意見をお願いします。" },
    { kanji: "忽然", reading: "こつぜん", meaning: "suddenly / abruptly", example: "彼は忽然と姿を消しました。" },
    { kanji: "邁進", reading: "まいしん", meaning: "pressing forward", example: "目標に向けて邁進します。" },
    { kanji: "慟哭", reading: "どうこく", meaning: "wailing / lamentation", example: "悲しみに慟哭しました。" },
    { kanji: "嘲笑", reading: "ちょうしょう", meaning: "ridicule / mockery", example: "嘲笑の的になりました。" },
    { kanji: "叱咤", reading: "しった", meaning: "scolding / spurring on", example: "叱咤激励されました。" },
    { kanji: "慟哭", reading: "どうこく", meaning: "wailing grief", example: "別れに慟哭しました。" },
    { kanji: "隘路", reading: "あいろ", meaning: "bottleneck / narrow path", example: "問題の隘路を特定します。" },
    { kanji: "敷衍", reading: "ふえん", meaning: "elaboration / expansion", example: "概念を敷衍して説明します。" },
    { kanji: "涵養", reading: "かんよう", meaning: "cultivation / fostering", example: "人材の涵養に努めます。" },
    { kanji: "惹起", reading: "じゃっき", meaning: "causing / provoking", example: "問題を惹起しました。" },
    { kanji: "瞭然", reading: "りょうぜん", meaning: "clear / obvious", example: "一目瞭然です。" },
    { kanji: "截然", reading: "せつぜん", meaning: "distinctly / clearly", example: "截然とした差があります。" },
    { kanji: "肯綮", reading: "こうけい", meaning: "vital point", example: "肯綮に当たる指摘です。" },
  ],
};

type HistoryEntry = {
  level: Level;
  kanji: string;
  correct: boolean;
  timestamp: number;
};

const STORAGE_KEY = "kanji-quiz-history";

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-500)));
}

function normalize(str: string): string {
  return str.trim().replace(/\s+/g, "");
}

export default function KanjiQuiz() {
  const [level, setLevel] = useState<Level>("N5");
  const [current, setCurrent] = useState<Word | null>(null);
  const [input, setInput] = useState("");
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const pickQuestion = useCallback(
    (lvl: Level, used: Set<number>) => {
      const pool = WORDS[lvl];
      let available = pool
        .map((_, i) => i)
        .filter((i) => !used.has(i));
      if (available.length === 0) {
        // reset used if all words done
        setUsedIndices(new Set());
        available = pool.map((_, i) => i);
      }
      const idx = available[Math.floor(Math.random() * available.length)];
      return { word: pool[idx], idx };
    },
    []
  );

  const nextQuestion = useCallback(
    (lvl: Level, used: Set<number>) => {
      const { word, idx } = pickQuestion(lvl, used);
      setCurrent(word);
      setUsedIndices((prev) => new Set([...prev, idx]));
      setInput("");
      setAnswered(false);
      setIsCorrect(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    [pickQuestion]
  );

  useEffect(() => {
    setHistory(loadHistory());
    nextQuestion(level, new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLevelChange = (lvl: Level) => {
    setLevel(lvl);
    setUsedIndices(new Set());
    nextQuestion(lvl, new Set());
  };

  const handleSubmit = () => {
    if (!current || answered) return;
    const correct = normalize(input) === normalize(current.reading);
    setIsCorrect(correct);
    setAnswered(true);
    const newScore = {
      correct: sessionScore.correct + (correct ? 1 : 0),
      total: sessionScore.total + 1,
    };
    setSessionScore(newScore);
    const entry: HistoryEntry = {
      level,
      kanji: current.kanji,
      correct,
      timestamp: Date.now(),
    };
    const newHistory = [...history, entry];
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  const handleNext = () => {
    nextQuestion(level, usedIndices);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!answered) {
        handleSubmit();
      } else {
        handleNext();
      }
    }
  };

  const levelStats = (lvl: Level) => {
    const entries = history.filter((h) => h.level === lvl);
    if (entries.length === 0) return null;
    const correct = entries.filter((e) => e.correct).length;
    return { correct, total: entries.length };
  };

  const LEVELS: Level[] = ["N5", "N4", "N3", "N2", "N1"];

  return (
    <div className="space-y-4">
      {/* Level selector */}
      <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
        <p className="text-sm font-medium text-muted">レベルを選択</p>
        <div className="flex gap-2 flex-wrap">
          {LEVELS.map((lvl) => {
            const stats = levelStats(lvl);
            return (
              <button
                key={lvl}
                onClick={() => handleLevelChange(lvl)}
                className={`flex-1 min-w-[52px] py-2 px-3 rounded-xl text-sm font-bold border transition-all ${
                  level === lvl
                    ? "bg-accent text-white border-accent"
                    : "bg-surface border-border text-muted hover:border-accent/50"
                }`}
              >
                <span className="block">{lvl}</span>
                {stats && (
                  <span className="block text-[10px] font-normal mt-0.5 opacity-80">
                    {stats.correct}/{stats.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Session score */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-between">
        <span className="text-sm text-muted">セッション正答率</span>
        <span className="text-lg font-bold text-foreground">
          {sessionScore.total === 0
            ? "—"
            : `${sessionScore.correct} / ${sessionScore.total}`}
          {sessionScore.total > 0 && (
            <span className="text-sm font-normal text-muted ml-2">
              ({Math.round((sessionScore.correct / sessionScore.total) * 100)}%)
            </span>
          )}
        </span>
      </div>

      {/* Quiz card */}
      {current && (
        <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
          {/* Kanji display */}
          <div className="text-center">
            <p className="text-xs text-muted mb-2">読み方をひらがなで入力</p>
            <p className="text-6xl font-bold text-foreground tracking-widest leading-tight">
              {current.kanji}
            </p>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={answered}
              placeholder="ひらがなで入力…"
              className={`w-full border rounded-xl px-4 py-3 text-lg text-center focus:outline-none focus:ring-2 transition-colors ${
                answered
                  ? isCorrect
                    ? "border-green-400 bg-green-50 text-green-700 focus:ring-green-300"
                    : "border-red-400 bg-red-50 text-red-700 focus:ring-red-300"
                  : "border-border focus:ring-accent/40 text-foreground"
              }`}
              autoComplete="off"
              autoCorrect="off"
            />

            {!answered && (
              <button
                onClick={handleSubmit}
                disabled={input.trim().length === 0}
                className="w-full py-2.5 bg-accent text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                回答する（Enter）
              </button>
            )}
          </div>

          {/* Result */}
          {answered && (
            <div
              className={`rounded-xl p-4 space-y-3 ${
                isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-lg font-bold ${
                    isCorrect ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {isCorrect ? "正解！" : "不正解"}
                </span>
                {!isCorrect && (
                  <span className="text-sm text-red-600">
                    正解: <strong>{current.reading}</strong>
                  </span>
                )}
              </div>

              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted">意味: </span>
                  <span className="text-foreground font-medium">{current.meaning}</span>
                </p>
                <p>
                  <span className="text-muted">例文: </span>
                  <span className="text-foreground">{current.example}</span>
                </p>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-2.5 bg-accent text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
              >
                次の問題（Enter）
              </button>
            </div>
          )}
        </div>
      )}

      {/* History summary */}
      {history.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">累積履歴</p>
          <div className="grid grid-cols-5 gap-2">
            {LEVELS.map((lvl) => {
              const stats = levelStats(lvl);
              return (
                <div key={lvl} className="text-center">
                  <p className="text-xs font-bold text-muted">{lvl}</p>
                  {stats ? (
                    <>
                      <p className="text-base font-bold text-foreground">{stats.correct}</p>
                      <p className="text-[10px] text-muted">/{stats.total}</p>
                      <div className="h-1 bg-border rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${Math.round((stats.correct / stats.total) * 100)}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted mt-1">—</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center h-24 text-muted text-sm">
        広告
      </div>
    </div>
  );
}
