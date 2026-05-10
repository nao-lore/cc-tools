# cc-tools Quality Audit

This is a static quality proxy for deciding what to improve next. It is not a live competitor benchmark.

## Summary

- Tools audited: 142
- Average quality score: 73.6/100
- Priority tiers: {"B": 51, "C": 91}

## Highest Priority Tools

| Tier | Priority | Quality | Slug | Type | Category | Main gaps |
| --- | ---: | ---: | --- | --- | --- | --- |
| B | 66 | 60 | `tedori-keisan` | calculator | Japanese Tools | copy, reset_clear, validation, current_count; penalties: old_count, ad_placeholder |
| B | 64 | 57 | `jigyou-keihi-bunrui` | utility | Tax Tools | labels, reset_clear, validation, privacy, current_count; penalties: old_count, ad_placeholder |
| B | 59 | 64 | `elevenlabs-pricing` | calculator | AI Tools | related_links, labels, copy, examples, validation |
| B | 58 | 61 | `image-compressor` | image | Image Tools | copy, examples, current_count; penalties: old_count, ad_placeholder, any_type |
| B | 58 | 65 | `azure-openai-cost` | calculator | AI Tools | related_links, copy, examples, reset_clear, validation |
| B | 58 | 65 | `claude-api-cost` | calculator | AI Tools | related_links, copy, examples, reset_clear, validation |
| B | 58 | 65 | `dalle-pricing` | image | AI Tools | related_links, copy, examples, reset_clear, validation |
| B | 58 | 65 | `gemini-api-cost` | calculator | AI Tools | related_links, copy, examples, reset_clear, validation |
| B | 58 | 65 | `nenrei-keisan` | calculator | Japanese Tools | copy, examples, current_count; penalties: old_count, ad_placeholder |
| B | 58 | 65 | `sho-kigyo-kyosai` | calculator | Tax Tools | related_links, copy, examples, reset_clear, validation |
| B | 58 | 65 | `whisper-api-cost` | calculator | AI Tools | related_links, copy, examples, reset_clear, validation |
| B | 57 | 56 | `kenpei-yoseki` | calculator | Life Tools | copy, reset_clear, validation, privacy, current_count; penalties: old_count, ad_placeholder |
| B | 57 | 62 | `bank-code-lookup` | reference | Japanese Tools | h1, related_links, labels, reset_clear, validation |
| B | 56 | 51 | `asset-allocation` | utility | Finance | h1, related_links, labels, copy, examples; penalties: ad_placeholder |
| B | 55 | 58 | `gacha-cost-ceiling` | calculator | Game Tools | copy, examples, validation, current_count; penalties: old_count, ad_placeholder |
| B | 54 | 53 | `ad-budget-estimator` | utility | Business | h1, related_links, copy, examples, reset_clear; penalties: ad_placeholder |
| B | 54 | 60 | `hash-generator` | generator | Encoding & Decoding | examples, reset_clear, privacy, current_count; penalties: old_count, ad_placeholder, any_type |
| B | 54 | 64 | `placeholder-image` | image | Image Tools | examples, validation, privacy, current_count; penalties: old_count, any_type |
| B | 54 | 67 | `tax-calculator` | calculator | Japanese Tools | reset_clear, validation, current_count; penalties: old_count, ad_placeholder |
| B | 53 | 61 | `password-generator` | generator | Developer Tools | examples, reset_clear, validation, current_count; penalties: old_count, ad_placeholder |
| B | 52 | 60 | `aircon-capacity` | calculator | Home | h1, related_links, copy, examples, reset_clear |
| B | 52 | 60 | `neon-planetscale-comparison` | comparison | SaaS Pricing | related_links, labels, copy, examples, reset_clear |
| B | 52 | 65 | `chmod-calculator` | calculator | Developer Tools | faq, validation, privacy, current_count; penalties: old_count |
| B | 52 | 65 | `context-window-visualizer` | utility | AI Tools | related_links, labels, copy, reset_clear, validation |
| B | 51 | 61 | `cdn-pricing-comparison` | comparison | SaaS Pricing | related_links, copy, examples, reset_clear, validation; penalties: any_type |
| B | 51 | 61 | `yukyu-nissuu` | calculator | Labor Tools | related_links, copy, examples, reset_clear, validation |
| B | 51 | 69 | `ai-cost-calculator` | calculator | AI Tools | related_links, copy, examples, validation, current_count |
| B | 51 | 69 | `furigana` | converter | Japanese Tools | privacy, current_count; penalties: old_count, ad_placeholder, any_type |
| B | 51 | 69 | `meeting-cost` | calculator | Business Tools | related_links, copy, examples, validation, current_count |
| B | 50 | 50 | `color-palette` | utility | Color Tools | faq, labels, examples, validation, privacy; penalties: old_count, any_type |

## Strongest Current Tools

| Quality | Slug | Type | Category |
| ---: | --- | --- | --- |
| 100 | `ai-tool-roi` | calculator | AI Workflow |
| 100 | `base-stores-fee` | comparison | EC |
| 100 | `bmi-keisan` | calculator | Japanese Tools |
| 100 | `calorie-keisan` | calculator | Japanese Tools |
| 100 | `denki-keisan` | calculator | Japanese Tools |
| 100 | `eigyoubi` | calculator | Japanese Tools |
| 100 | `favicon-generator` | image | Image Tools |
| 100 | `hebon-romaji` | converter | Japanese Tools |
| 100 | `loan-simulator` | calculator | Japanese Tools |
| 100 | `measuring-converter` | converter | Cooking Tools |
| 100 | `menseki-keisan` | converter | Japanese Tools |
| 100 | `moji-count` | utility | Japanese Tools |
| 100 | `nissuu-keisan` | calculator | Japanese Tools |
| 100 | `oven-temp-converter` | converter | Cooking Tools |
| 100 | `risoku-keisan` | calculator | Japanese Tools |

## Archetype Averages

| Type | Average quality |
| --- | ---: |
| calculator | 75.3 |
| comparison | 75.1 |
| converter | 81.4 |
| generator | 69.8 |
| image | 71 |
| reference | 74.2 |
| utility | 66.8 |

## Weakest Categories

| Category | Average quality | Tools |
| --- | ---: | ---: |
| Business | 53 | 1 |
| Color Tools | 55.5 | 2 |
| Home | 60 | 1 |
| Text & String Tools | 60.5 | 6 |
| CSS Tools | 62 | 8 |
| Creator Tools | 67 | 2 |
| Music | 67 | 1 |
| SaaS Pricing | 67.5 | 13 |
| Time & Date | 68 | 2 |
| Minifier Tools | 68 | 2 |
| Developer Tools | 68.6 | 8 |
| Design Tools | 69 | 1 |

## Next Factory Steps

1. Build shared v2 shells for converter, calculator, image, and comparison tools.
2. Rewrite the highest-priority S-tier tools in batches using those shells.
3. Promote repeated checks from this report into `check-integrity.py` only after the signal is reliable.
4. Add live competitor notes only for tools selected for an S-tier rewrite.
