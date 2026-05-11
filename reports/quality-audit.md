# cc-tools Quality Audit

This is a static quality proxy for deciding what to improve next. It is not a live competitor benchmark.

## Summary

- Tools audited: 142
- Average quality score: 82.1/100
- Priority tiers: {"B": 20, "C": 122}

## Highest Priority Tools

| Tier | Priority | Quality | Slug | Type | Category | Main gaps |
| --- | ---: | ---: | --- | --- | --- | --- |
| B | 51 | 69 | `furigana` | converter | Japanese Tools | privacy, current_count; penalties: old_count, ad_placeholder, any_type |
| B | 51 | 69 | `meeting-cost` | calculator | Business Tools | related_links, copy, examples, validation, current_count |
| B | 50 | 67 | `svg-to-png` | image | Image Tools | copy, current_count; penalties: old_count, ad_placeholder, any_type |
| B | 48 | 71 | `ai-model-comparison` | comparison | AI Tools | related_links, copy, reset_clear, validation, current_count |
| B | 48 | 71 | `fine-tuning-cost` | calculator | AI Tools | related_links, copy, reset_clear, validation, current_count |
| B | 48 | 71 | `ideco-tax-saving` | calculator | Tax Tools | related_links, copy, reset_clear, validation, current_count |
| B | 48 | 71 | `kaji-anbun` | calculator | Tax Tools | related_links, copy, reset_clear, validation, current_count |
| B | 47 | 65 | `uuid-generator` | generator | Developer Tools | reset_clear, validation, privacy, current_count; penalties: old_count, any_type |
| B | 46 | 54 | `ascii-art` | utility | Text & String Tools | labels, examples, reset_clear, validation, privacy; penalties: old_count, any_type |
| B | 46 | 69 | `qr-generator` | image | Image Tools | copy, privacy, current_count; penalties: old_count, any_type |
| B | 46 | 69 | `sql-formatter` | converter | Data Format Tools | validation, privacy, current_count; penalties: old_count, any_type |
| B | 46 | 69 | `yaml-to-json` | converter | Data Format Tools | labels, examples, privacy, current_count; penalties: old_count |
| B | 46 | 72 | `aojiro-shinkoku-sim` | calculator | Tax Tools | copy, examples, reset_clear, validation, current_count |
| B | 46 | 72 | `embedding-cost-calculator` | calculator | AI Tools | copy, examples, reset_clear, validation, current_count |
| B | 46 | 72 | `iryouhi-koujo` | calculator | Tax Tools | copy, reset_clear, validation, responsive, current_count |
| B | 46 | 72 | `teigaku-genzei` | calculator | Tax Tools | copy, examples, reset_clear, validation, current_count |
| B | 45 | 61 | `color-converter` | converter | Color Tools | faq, reset_clear, privacy; penalties: old_count, ad_placeholder, any_type |
| B | 45 | 65 | `cloudflare-workers-cost` | calculator | SaaS Pricing | related_links, copy, examples, reset_clear, validation |
| B | 45 | 65 | `github-actions-cost` | calculator | SaaS Pricing | related_links, copy, examples, reset_clear, validation |
| B | 45 | 65 | `video-bitrate` | calculator | Creator Tools | related_links, copy, examples, validation, privacy |
| C | 44 | 56 | `word-counter` | utility | Text & String Tools | labels, examples, validation, current_count; penalties: old_count, ad_placeholder, any_type |
| C | 44 | 62 | `timezone-converter` | converter | Time & Date | copy, validation, privacy, current_count; penalties: old_count, any_type |
| C | 42 | 68 | `takuhaibin-hikaku` | comparison | EC Tools | copy, examples, reset_clear, validation, accessible_buttons |
| C | 42 | 69 | `ascii-flowchart` | reference | Developer Tools | privacy, current_count; penalties: old_count, ad_placeholder, any_type |
| C | 42 | 72 | `binary-converter` | converter | Encoding & Decoding | reset_clear, privacy, current_count; penalties: old_count, any_type |
| C | 42 | 72 | `rag-cost-estimator` | utility | AI Tools | copy, examples, reset_clear, validation, current_count |
| C | 41 | 75 | `wareki-converter` | converter | Japanese Tools | labels, reset_clear, privacy, current_count; penalties: ad_placeholder |
| C | 40 | 60 | `css-grid` | utility | CSS Tools | faq, examples, validation, privacy, current_count; penalties: old_count |
| C | 40 | 60 | `markdown-preview` | utility | Text & String Tools | labels, reset_clear, validation, privacy, current_count; penalties: old_count, any_type |
| C | 40 | 65 | `gcp-pricing` | utility | SaaS Pricing | related_links, copy, examples, reset_clear, validation |

## Strongest Current Tools

| Quality | Slug | Type | Category |
| ---: | --- | --- | --- |
| 100 | `ad-budget-estimator` | utility | Business |
| 100 | `ai-cost-calculator` | calculator | AI Tools |
| 100 | `ai-tool-roi` | calculator | AI Workflow |
| 100 | `aircon-capacity` | calculator | Home |
| 100 | `asset-allocation` | utility | Finance |
| 100 | `base-stores-fee` | comparison | EC |
| 100 | `bmi-keisan` | calculator | Japanese Tools |
| 100 | `border-radius` | utility | CSS Tools |
| 100 | `calorie-keisan` | calculator | Japanese Tools |
| 100 | `cdn-pricing-comparison` | comparison | SaaS Pricing |
| 100 | `chmod-calculator` | calculator | Developer Tools |
| 100 | `color-palette` | utility | Color Tools |
| 100 | `context-window-visualizer` | utility | AI Tools |
| 100 | `css-box-shadow` | utility | CSS Tools |
| 100 | `css-flexbox` | utility | CSS Tools |

## Archetype Averages

| Type | Average quality |
| --- | ---: |
| calculator | 85.6 |
| comparison | 81.2 |
| converter | 81.4 |
| generator | 83 |
| image | 88.2 |
| reference | 77 |
| utility | 78.3 |

## Weakest Categories

| Category | Average quality | Tools |
| --- | ---: | ---: |
| Text & String Tools | 60.5 | 6 |
| Creator Tools | 67 | 2 |
| Music | 67 | 1 |
| Time & Date | 68 | 2 |
| Minifier Tools | 68 | 2 |
| Design Tools | 69 | 1 |
| EC Tools | 72.4 | 5 |
| SaaS Pricing | 73.6 | 13 |
| Data Format Tools | 76.3 | 6 |
| SEO Tools | 77.7 | 3 |
| Tax Tools | 78.3 | 9 |
| Labor Tools | 79.2 | 4 |

## Next Factory Steps

1. Build shared v2 shells for converter, calculator, image, and comparison tools.
2. Rewrite the highest-priority S-tier tools in batches using those shells.
3. Promote repeated checks from this report into `check-integrity.py` only after the signal is reliable.
4. Add live competitor notes only for tools selected for an S-tier rewrite.
