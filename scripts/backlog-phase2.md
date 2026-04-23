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
