# Phase 2 バックログ — Claude AI提案 50本 (2026-04-23)

## デプロイ順序

### Month 1 前半（S優先 × 即効性）
1. `invoice-qualified-checker` — 適格請求書 チェッカー
2. `withholding-tax-calculator` — 源泉徴収税 計算（報酬）
3. `stripe-fee-calculator` — Stripe 手数料計算（日本）
4. `takuhaibin-hikaku` — 宅配便3社 送料比較
5. `mercari-tesuryou` — メルカリ 手数料・利益計算

### Month 1 後半（S優先 × SaaS系）
6. `firebase-pricing` — Firebase 料金試算
7. `auth-service-comparison` — 認証SaaS 料金比較
8. `render-fly-railway-comparison` — Render/Fly/Railway 料金比較
9. `openrouter-pricing` — OpenRouter 料金比較
10. `subscription-lifetime` — サブスク 生涯コスト可視化

### Month 2（S残り＋A上位）
11. `rag-cost-estimator` — RAG 運用コスト試算
12. `embedding-cost-calculator` — 埋め込みAPI 料金計算
13. `ai-video-pricing` — AI動画生成 料金比較
14. `consumption-tax-choice` — 簡易課税 vs 本則課税 判定
15. `aojiro-shinkoku-sim` — 青色申告 節税シミュレーター
16. `houjin-nari` — 法人成り 損益分岐シミュレーター
17. `click-post-size` — メール便・小型配送 判定
18. `meeting-cost` — 会議コスト計算機
19. `azure-openai-cost` — Azure OpenAI Service 料金
20. `kaji-anbun` — 家事按分 計算

### Month 3（A拡充）
21. `dalle-pricing` — DALL-E 画像生成 料金
22. `whisper-api-cost` — Whisper API 料金
23. `elevenlabs-pricing` — ElevenLabs 料金試算
24. `fine-tuning-cost` — ファインチューニング 料金計算
25. `context-window-visualizer` — コンテキストウィンドウ 可視化
26. `gcp-pricing` — Google Cloud 料金試算
27. `aws-s3-cost` — AWS S3 料金計算
28. `cdn-pricing-comparison` — CDN料金比較
29. `amazon-fba-fee` — Amazon FBA手数料計算
30. `dpi-resolution` — DPI / 解像度 / 印刷サイズ計算
31. `youtube-revenue` — YouTube 収益シミュレーター
32. `video-bitrate` — 動画ビットレート / ファイルサイズ計算
33. `kokumin-kenko-hoken` — 国民健康保険料 試算
34. `ideco-tax-saving` — iDeCo 節税額シミュレーター
35. `gyomu-itaku-hikaku` — 業務委託 vs 正社員 手取り比較
36. `sho-kigyo-kyosai` — 小規模企業共済 節税計算
37. `zaitaku-denki-anbun` — 在宅勤務 光熱費按分
38. `ai-tool-roi` — AIツール導入 ROI計算

### Month 4+（B/C）
39. `midjourney-pricing` — Midjourney 料金シミュレーター
40. `stable-diffusion-cost` — Stable Diffusion API 料金
41. `twilio-sms-cost` — Twilio SMS料金
42. `sendgrid-pricing` — SendGrid 料金試算
43. `mongodb-atlas-cost` — MongoDB Atlas 料金
44. `kojin-jigyo-zei` — 個人事業税 計算
45. `furusato-nozei-limit` — ふるさと納税 控除上限（フリーランス版）
46. `bleed-checker` — 塗り足し チェッカー
47. `renryo-weight` — 用紙 連量・重量 計算
48. `zoom-storage-estimate` — 会議録画 容量予測
49. `commute-vs-remote` — 通勤 vs 在宅 コスト比較
50. `book-thickness` — 本の背幅 計算

## 品質ガイドライン
- 日本語メタ情報完備（title, description, OGP, JSON-LD）
- モバイル最適化（LCP < 2.5s, CLS < 0.1）
- 共有URL（入力値をクエリパラメータで保持）
- 解説セクション（200〜400字）
- 関連ツール導線
- YMYL系は免責+引用元明記

---

# Phase 2b バックログ — Claude AI提案 第2弾 50本 (2026-04-23)

## 超最優先5本（第1弾+第2弾横断）
1. `invoice-qualified-checker` — ✅ 作成済み
2. `teigaku-genzei` — 定額減税計算機
3. `ai-coding-tool-comparison` — AIコーディングツール料金比較
4. `zangyou-dai` — 残業代計算機
5. `withholding-tax-calculator` — ✅ 作成済み

## Month 1（税務・行政・労務の即効性）
6. `iryouhi-koujo` — 医療費控除シミュレーター
7. `zip-to-address` — 郵便番号 ↔ 住所変換
8. `zei-kin-henkan` — 税込 ↔ 税抜 変換（軽減税率対応）
9. `yukyu-nissuu` — 有給休暇 付与日数計算
10. `hebon-romaji` — ヘボン式ローマ字変換（パスポート対応）

## Month 2（AI/開発者層）
11. `ai-coding-tool-comparison` — AIコーディングツール料金比較
12. `ai-output-json-validator` — AI出力 JSON整形・スキーマ検証
13. `prompt-chain-builder` — プロンプトチェーン設計ツール
14. `ab-test-significance` — A/Bテスト 統計的有意差計算
15. `system-prompt-optimizer` — System Prompt 最適化

## Month 3（税務・労務の定番）
16. `jigyou-keihi-bunrui` — 事業経費 勘定科目 AI分類
17. `juumin-zei` — 住民税 計算機
18. `haiguusha-koujo` — 配偶者控除・配偶者特別控除判定
19. `fuyou-koujo-hantei` — 扶養控除 判定
20. `shitsugyou-kyufu` — 失業給付金 計算
21. `ikujikyuugyou` — 育児休業給付金 計算
22. `houjin-bangou-validator` — 法人番号 バリデーション・検索
23. `bank-code-lookup` — 銀行・支店コード検索
24. `rodou-jikan-kanri` — 労働時間上限チェック（36協定）

## Month 4+
25. `function-calling-schema` — Function Calling スキーマビルダー
26. `prompt-injection-checker` — プロンプトインジェクション検査
27. `chat-export-converter` — AI会話ログ 相互変換
28. `netlify-pricing` — Netlify 料金試算
29. `neon-planetscale-comparison` — Neon / PlanetScale / Turso 比較
30. `figma-seats-calculator` — Figma / FigJam 座席料金計算
31. `shopify-fee-jp` — Shopify 日本円手数料計算
32. `base-stores-fee` — BASE / STORES 手数料比較
33. `paypal-fee-jp` — PayPal 日本向け手数料計算
34. `credit-card-fee-compare` — 決済サービス加盟店手数料比較
35. `ltv-cac-calculator` — LTV / CAC 計算機
36. `churn-mrr-calculator` — Churn率 / MRR 計算機
37. `ad-budget-estimator` — 広告予算逆算ツール
38. `joyo-kanji-check` — 常用漢字 / 人名用漢字 チェック
39. `ranuki-check` — ら抜き・二重敬語 校正
40. `bunshou-nanido` — 文章難易度判定
41. `teigaku-genzei` — 定額減税計算機
42. `few-shot-builder` — Few-shot例文 ビルダー
43. `temperature-top-p-tester` — Temperature / Top-p 比較実験
44. `digital-ocean-pricing` — DigitalOcean Droplet 料金
45. `notion-api-cost` — Notion API 利用料金
46. `my-number-validator` — マイナンバー桁・形式検証
47. `car-number-decoder` — 自動車ナンバー 地域・分類判定
48. `isbn-validator` — ISBN / JANコード バリデーション
49. `kettousei-keisan` — 決算期 計算ツール
50. `ebay-fee-jp` — eBay 日本から出品 手数料
51. `kojin-jigyo-zei` — 個人事業税 計算（第1弾重複）
52. `nps-score` — NPS スコア計算
53. `funnel-conversion` — ファネル コンバージョン計算
54. `kanji-ganyuu-ritsu` — 漢字含有率計算
55. `romaji-ime-henkan` — ローマ字 ↔ ひらがな 変換

## 品質ガイドライン（追加）
- YMYL系は免責+国税庁/厚労省リンク必須
- マイナンバー系は完全クライアントサイド処理必須
- 労務系は年次ロジック更新が必要（CLAUDE.mdにフラグ）
- 日本語校正系はZenn/note層へのリーチで被リンク獲得

---

# Phase 2c バックログ — Claude AI提案 第3弾 50本 (2026-04-23)

⚠ 第1-2弾のS/A層を完了してから着手。平均優先度は下がる（S/A=58%）。

## Phase A（検索母数×バズ性）
1. `gacha-probability` — ガチャ確率 計算 [S]
2. `gacha-cost-ceiling` — ガチャ天井 コスト計算 [S]
3. `recipe-scaling` — レシピ 分量スケーリング [S]
4. `oven-temp-converter` — オーブン温度 変換 [S]
5. `measuring-converter` — 計量変換（大さじ・カップ→g）[S]
6. `hourly-to-annual` — 時給 ↔ 年収 ↔ 月収 逆算 [S]
7. `kenpei-yoseki` — 建蔽率・容積率 計算 [S]

## Phase B（イベント型+趣味クリエイター）
8. `rokuyou-calendar` — 六曜カレンダー [A]
9. `yakudoshi` — 厄年 判定 [A]
10. `jidoshazei` — 自動車税 計算 [A]
11. `fuel-economy` — 燃費・ガソリン代 計算 [A]
12. `ev-charging-cost` — EV 充電コスト計算 [A]
13. `jouu-menseki` — 畳数 ↔ 平米 ↔ 坪 変換 [A]
14. `aircon-capacity` — エアコン適正容量 計算 [A]
15. `focal-length-angle` — 焦点距離 ↔ 画角 計算 [A]
16. `depth-of-field` — 被写界深度 計算 [A]
17. `exposure-triangle` — 露出三角形 計算 [A]
18. `video-duration-size` — 動画サイズ 予測計算 [A]
19. `bpm-delay` — BPM ↔ ディレイタイム [A]
20. `key-transposer` — 楽曲 移調ツール [A]
21. `toeic-cefr-convert` — TOEIC / 英検 / CEFR 相互変換 [A]
22. `thread-length-optimizer` — X / Threads 投稿最適化 [A]
23. `linkedin-post-counter` — LinkedIn 投稿文字数チェック [A]
24. `youtube-chapters-generator` — YouTube チャプターマーカー生成 [A]
25. `raise-compound` — 昇給率 複利計算 [A]
26. `household-budget-allocate` — 家計予算配分 [A]
27. `savings-rate` — 貯蓄率 計算（FIRE向け）[A]
28. `asset-allocation` — アセットアロケーション 可視化 [A]
29. `dollar-cost-average-sim` — ドルコスト平均法 シミュレーション [A]

## Phase C/D（ロングテール+実験）
30-50: framerate-converter, print-size-pixels, music-interval, metronome-tool, sheet-music-duration, bread-hydration, salt-percentage, win-rate-rating, game-fps-input-lag, lumen-room, door-size-check, tire-size-converter, co2-travel, cho-jyu-iwai, eto-hantei, kyureki-converter, word-level-judge, ipa-phonetic, reading-speed-wpm, instagram-carousel-planner, tiktok-hashtag-counter

## 全150本のS優先度ランキング（横断）
1. invoice-qualified-checker ✅作成済
2. withholding-tax-calculator ✅作成済
3. teigaku-genzei — 定額減税（第2弾）
4. ai-coding-tool-comparison — AIコーディング比較（第2弾）
5. zangyou-dai — 残業代計算（第2弾）
6. takuhaibin-hikaku ✅作成済
7. mercari-tesuryou ✅作成済
8. stripe-fee-calculator ✅作成済
9. ai-video-pricing — AI動画料金（第1弾）
10. gacha-probability — ガチャ確率（第3弾）
11. recipe-scaling — レシピ分量（第3弾）
12. hourly-to-annual — 時給年収（第3弾）
13. iryouhi-koujo — 医療費控除（第2弾）

## 方針メモ
- 年内1000本の残り850本は、第1-3弾の150本から派生する「特定条件版」で埋める方がSEOクラスタ効果が出やすい
- 第4弾は第1-3弾のS/A完了後に検討

---

# Phase 2d バックログ — Claude AI提案 第4弾 50本 (2026-04-23)

⚠ S/A率46%。カテゴリ網羅・被リンク獲得・回遊導線が目的。第1-3弾のS/A完了後。

## S優先度（1本のみ）
1. `goshugi-souba` — ご祝儀相場 計算 [S] ※結婚シーズン爆発需要

## A優先度（22本）
社労士/労務: roudou-hoken-nendo, kaigo-hoken, koyou-hoken-tesuryou
法務: jikou-calc, chien-songai-kin, sozoku-ritsu
統計: t-test-calc, correlation-coef, sample-size-calc
教育: hensachi-calc, gpa-converter
釣り/アウトドア: tide-lunar, course-time, running-pace
ドリンク: coffee-ratio
ペット: dog-human-age, cat-human-age
冠婚葬祭: koden-souba, okaeshi-ratio
天気: taikan-ondo, nechuushou-shisuu
写真: focal-length-angle, depth-of-field, exposure-triangle, video-duration-size
音楽: bpm-delay, key-transposer

## B/C優先度（27本）
建築: saikou-keisan, kanki-keisan, kaidan-keikaku, structure-weight, danmenkei-sei
社労士: santei-kiso-todoke, getsugaku-henkou
法務: tourokumenkyozei
統計: chi-square-test, confidence-interval, anova-calc
教育: ebbinghaus-curve, study-schedule, speed-reading-test
ガーデニング: planting-calendar, fertilizer-ratio, water-tank-volume, yamori-hiryou, co2-aquarium
釣り: cycling-grade
ドリンク: abv-calc, caffeine-intake, wine-aging
ペット: dog-food-amount, rinyuushoku
冠婚葬祭: hikidemono
天気: kafun-flight, sleep-debt
音楽: music-interval, metronome-tool, sheet-music-duration
ゲーム: win-rate-rating, game-fps-input-lag
写真: framerate-converter, print-size-pixels

## 全200本のS優先度14本（最重要リスト）
1. invoice-qualified-checker ✅
2. withholding-tax-calculator ✅
3. ai-video-pricing
4. takuhaibin-hikaku ✅
5. mercari-tesuryou ✅
6. teigaku-genzei
7. ai-coding-tool-comparison
8. zangyou-dai
9. iryouhi-koujo
10. ab-test-significance
11. gacha-probability
12. recipe-scaling
13. hourly-to-annual
14. goshugi-souba

## 方針
- 1000本目標の残りは既存ツールの「特定条件版」派生で埋める（SEOクラスタ効果）
- S14本には1本1日かけて磨き込む価値あり
- 第5弾はS14本の磨き込み完了後に検討

---

# Phase 2e バックログ — Claude AI提案 第5弾 50本 (2026-04-23)

⚠ S優先度ゼロ。A10本のみ。ロングテール層。第1-4弾のS/A完了後に着手。
⚠ Claude AI評価:「第6弾を作る合理的理由は今のところない。S14本磨き込みのほうがPVに貢献。」

## A優先度（10本、量産パイプラインに放り込む候補）
1. `crypto-tax-jp` — 暗号資産 税金計算（日本）
2. `probability-drop` — ドロップ率 試行回数計算
3. `pos-comparison` — 飲食店POS比較
4. `salon-booking-saas` — 美容室予約システム比較
5. `mcp-server-finder` — MCP サーバー検索・料金比較
6. `agent-token-budget` — エージェント トークン予算計算
7. `1rm-calc` — 1RM（最大挙上重量）計算
8. `knitting-gauge` — 編み物 ゲージ・目数計算
9. `luggage-size-airline` — 機内持ち込み サイズ判定
10. `gift-recommendation-budget` — 贈答金額 目安計算

## B/C優先度（40本 — カテゴリ網羅用、個別磨き込み不要）
クリプト: gas-fee-calculator, nft-mint-cost, staking-yield, defi-impermanent-loss
ゲーム: exp-farm-calc, damage-calculator-generic, speedrun-timer, fighting-frame-data
SaaS: clinic-kartel, cloud-accounting-cmp, gym-management-saas
AI: vector-db-comparison, langfuse-cost, rerank-model-cmp
スポーツ: heart-rate-target, swim-pace, golf-score-handicap, tennis-utr-calc
手芸: fabric-yardage, beads-amount, wood-cutting-plan, screw-size-converter
旅行: jetlag-calculator, visa-duration-check, jr-pass-break-even, fx-travel-budget
数学: quadratic-solver, triangle-solver, circle-calculator, motion-formula, vector-calc
時間管理: time-blocking-planner, deep-work-calculator, task-estimation, procrastination-cost, focus-streak-tracker
その他: random-name-picker, word-frequency, color-blindness-sim-text, accessibility-check

## 戦略結論
- 累計250本で主要ジャンルは網羅完了
- 残り750本は既存ツールの派生版・多言語版で埋める
- S14本に週1日×丸8時間の磨き込み時間を投下するのが最もROI高い
- 第6弾は目的明示なしでは不要
