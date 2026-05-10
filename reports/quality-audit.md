# cc-tools Quality Audit

This is a static quality proxy for deciding what to improve next. It is not a live competitor benchmark.

## Summary

- Tools audited: 142
- Average quality score: 70.0/100
- Priority tiers: {"A": 2, "B": 61, "C": 79}

## Highest Priority Tools

| Tier | Priority | Quality | Slug | Type | Category | Main gaps |
| --- | ---: | ---: | --- | --- | --- | --- |
| A | 73 | 56 | `denki-keisan` | calculator | Japanese Tools | faq, copy, validation, current_count; penalties: old_count, ad_placeholder |
| A | 71 | 57 | `ai-tool-roi` | calculator | AI Workflow | h1, related_links, copy, examples, reset_clear; penalties: ad_placeholder |
| B | 69 | 54 | `favicon-generator` | image | Image Tools | faq, validation, privacy, current_count; penalties: old_count, ad_placeholder, any_type |
| B | 66 | 49 | `base-stores-fee` | comparison | EC | h1, related_links, copy, examples, reset_clear; penalties: ad_placeholder |
| B | 66 | 60 | `loan-simulator` | calculator | Japanese Tools | copy, reset_clear, validation, current_count; penalties: old_count, ad_placeholder |
| B | 66 | 60 | `tedori-keisan` | calculator | Japanese Tools | copy, reset_clear, validation, current_count; penalties: old_count, ad_placeholder |
| B | 66 | 60 | `waribiki-keisan` | calculator | Japanese Tools | copy, reset_clear, validation, current_count; penalties: old_count, ad_placeholder |
| B | 65 | 50 | `measuring-converter` | converter | Cooking Tools | labels, copy, reset_clear, validation, privacy; penalties: old_count, ad_placeholder |
| B | 64 | 57 | `jigyou-keihi-bunrui` | utility | Tax Tools | labels, reset_clear, validation, privacy, current_count; penalties: old_count, ad_placeholder |
| B | 63 | 62 | `hebon-romaji` | converter | Japanese Tools | reset_clear, validation, privacy, current_count; penalties: old_count, ad_placeholder |
| B | 60 | 54 | `oven-temp-converter` | converter | Cooking Tools | labels, copy, validation, privacy, current_count; penalties: old_count, ad_placeholder |
| B | 60 | 60 | `moji-count` | utility | Japanese Tools | labels, examples, validation, current_count; penalties: old_count, ad_placeholder |
| B | 59 | 64 | `elevenlabs-pricing` | calculator | AI Tools | related_links, labels, copy, examples, validation |
| B | 58 | 57 | `url-encoder` | reference | Encoding & Decoding | faq, reset_clear, privacy, current_count; penalties: old_count, ad_placeholder, any_type |
| B | 58 | 61 | `image-compressor` | image | Image Tools | copy, examples, current_count; penalties: old_count, ad_placeholder, any_type |
| B | 58 | 65 | `azure-openai-cost` | calculator | AI Tools | related_links, copy, examples, reset_clear, validation |
| B | 58 | 65 | `claude-api-cost` | calculator | AI Tools | related_links, copy, examples, reset_clear, validation |
| B | 58 | 65 | `dalle-pricing` | image | AI Tools | related_links, copy, examples, reset_clear, validation |
| B | 58 | 65 | `gemini-api-cost` | calculator | AI Tools | related_links, copy, examples, reset_clear, validation |
| B | 58 | 65 | `nenrei-keisan` | calculator | Japanese Tools | copy, examples, current_count; penalties: old_count, ad_placeholder |
| B | 58 | 65 | `sho-kigyo-kyosai` | calculator | Tax Tools | related_links, copy, examples, reset_clear, validation |
| B | 58 | 65 | `whisper-api-cost` | calculator | AI Tools | related_links, copy, examples, reset_clear, validation |
| B | 58 | 65 | `zenkaku-hankaku` | converter | Japanese Tools | examples, validation, current_count; penalties: old_count, ad_placeholder |
| B | 57 | 56 | `kenpei-yoseki` | calculator | Life Tools | copy, reset_clear, validation, privacy, current_count; penalties: old_count, ad_placeholder |
| B | 57 | 62 | `bank-code-lookup` | reference | Japanese Tools | h1, related_links, labels, reset_clear, validation |
| B | 56 | 51 | `asset-allocation` | utility | Finance | h1, related_links, labels, copy, examples; penalties: ad_placeholder |
| B | 55 | 58 | `gacha-cost-ceiling` | calculator | Game Tools | copy, examples, validation, current_count; penalties: old_count, ad_placeholder |
| B | 54 | 53 | `ad-budget-estimator` | utility | Business | h1, related_links, copy, examples, reset_clear; penalties: ad_placeholder |
| B | 54 | 60 | `hash-generator` | generator | Encoding & Decoding | examples, reset_clear, privacy, current_count; penalties: old_count, ad_placeholder, any_type |
| B | 54 | 64 | `placeholder-image` | image | Image Tools | examples, validation, privacy, current_count; penalties: old_count, any_type |

## Strongest Current Tools

| Quality | Slug | Type | Category |
| ---: | --- | --- | --- |
| 100 | `bmi-keisan` | calculator | Japanese Tools |
| 100 | `calorie-keisan` | calculator | Japanese Tools |
| 100 | `eigyoubi` | calculator | Japanese Tools |
| 100 | `menseki-keisan` | converter | Japanese Tools |
| 100 | `nissuu-keisan` | calculator | Japanese Tools |
| 100 | `risoku-keisan` | calculator | Japanese Tools |
| 100 | `tsumitate-sim` | calculator | Japanese Tools |
| 92 | `ai-output-json-validator` | utility | AI Workflow |
| 92 | `zei-kin-henkan` | converter | Finance |
| 89 | `prompt-chain-builder` | reference | AI Workflow |
| 85 | `html-to-markdown` | converter | Data Format Tools |
| 85 | `invoice-qualified-checker` | utility | Business Tools |
| 85 | `json-formatter` | converter | Data Format Tools |
| 85 | `recipe-scaling` | converter | Cooking Tools |
| 85 | `withholding-tax-calculator` | calculator | Business Tools |

## Archetype Averages

| Type | Average quality |
| --- | ---: |
| calculator | 72.0 |
| comparison | 71.2 |
| converter | 73.3 |
| generator | 69.8 |
| image | 63.3 |
| reference | 70.3 |
| utility | 65.7 |

## Weakest Categories

| Category | Average quality | Tools |
| --- | ---: | ---: |
| EC | 49 | 1 |
| Business | 53 | 1 |
| Color Tools | 55.5 | 2 |
| Home | 60 | 1 |
| Text & String Tools | 60.5 | 6 |
| CSS Tools | 62 | 8 |
| Image Tools | 63 | 5 |
| Cooking Tools | 63 | 3 |
| Creator Tools | 67 | 2 |
| Music | 67 | 1 |
| SaaS Pricing | 67.5 | 13 |
| Time & Date | 68 | 2 |

## Next Factory Steps

1. Build shared v2 shells for converter, calculator, image, and comparison tools.
2. Rewrite the highest-priority S-tier tools in batches using those shells.
3. Promote repeated checks from this report into `check-integrity.py` only after the signal is reliable.
4. Add live competitor notes only for tools selected for an S-tier rewrite.
