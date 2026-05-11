# cc-tools Quality Audit

This is a static quality proxy for deciding what to improve next. It is not a live competitor benchmark.

## Summary

- Tools audited: 142
- Average quality score: 88.0/100
- Priority tiers: {"B": 10, "C": 132}

## Highest Priority Tools

| Tier | Priority | Quality | Slug | Type | Category | Main gaps |
| --- | ---: | ---: | --- | --- | --- | --- |
| B | 48 | 71 | `ai-model-comparison` | comparison | AI Tools | related_links, copy, reset_clear, validation, current_count |
| B | 48 | 71 | `fine-tuning-cost` | calculator | AI Tools | related_links, copy, reset_clear, validation, current_count |
| B | 48 | 71 | `ideco-tax-saving` | calculator | Tax Tools | related_links, copy, reset_clear, validation, current_count |
| B | 48 | 71 | `kaji-anbun` | calculator | Tax Tools | related_links, copy, reset_clear, validation, current_count |
| B | 46 | 72 | `aojiro-shinkoku-sim` | calculator | Tax Tools | copy, examples, reset_clear, validation, current_count |
| B | 46 | 72 | `embedding-cost-calculator` | calculator | AI Tools | copy, examples, reset_clear, validation, current_count |
| B | 46 | 72 | `iryouhi-koujo` | calculator | Tax Tools | copy, reset_clear, validation, responsive, current_count |
| B | 46 | 72 | `teigaku-genzei` | calculator | Tax Tools | copy, examples, reset_clear, validation, current_count |
| B | 45 | 65 | `cloudflare-workers-cost` | calculator | SaaS Pricing | related_links, copy, examples, reset_clear, validation |
| B | 45 | 65 | `github-actions-cost` | calculator | SaaS Pricing | related_links, copy, examples, reset_clear, validation |
| C | 42 | 68 | `takuhaibin-hikaku` | comparison | EC Tools | copy, examples, reset_clear, validation, accessible_buttons |
| C | 42 | 72 | `binary-converter` | converter | Encoding & Decoding | reset_clear, privacy, current_count; penalties: old_count, any_type |
| C | 42 | 72 | `rag-cost-estimator` | utility | AI Tools | copy, examples, reset_clear, validation, current_count |
| C | 41 | 75 | `wareki-converter` | converter | Japanese Tools | labels, reset_clear, privacy, current_count; penalties: ad_placeholder |
| C | 40 | 65 | `gcp-pricing` | utility | SaaS Pricing | related_links, copy, examples, reset_clear, validation |
| C | 40 | 65 | `netlify-pricing` | utility | SaaS Pricing | related_links, copy, examples, reset_clear, validation |
| C | 40 | 65 | `supabase-pricing` | utility | SaaS Pricing | related_links, copy, examples, reset_clear, validation |
| C | 40 | 65 | `vercel-pricing` | utility | SaaS Pricing | related_links, copy, examples, reset_clear, validation |
| C | 40 | 69 | `aws-lambda-cost` | calculator | SaaS Pricing | related_links, copy, examples, validation, current_count |
| C | 40 | 69 | `dpi-resolution` | calculator | Design Tools | related_links, copy, examples, validation, current_count |
| C | 40 | 69 | `gyomu-itaku-hikaku` | comparison | Labor Tools | related_links, copy, examples, validation, current_count |
| C | 40 | 69 | `shopify-fee-jp` | calculator | EC Tools | related_links, copy, examples, validation, current_count |
| C | 40 | 69 | `youtube-revenue` | calculator | Creator Tools | related_links, copy, examples, validation, current_count |
| C | 40 | 76 | `ai-coding-tool-comparison` | comparison | AI Tools | copy, examples, reset_clear, validation |
| C | 40 | 76 | `houjin-nari` | comparison | Tax Tools | copy, examples, validation, current_count |
| C | 40 | 76 | `stripe-fee-calculator` | calculator | Business Tools | copy, examples, validation, current_count |
| C | 39 | 71 | `image-to-base64` | reference | Encoding & Decoding | examples, privacy, current_count; penalties: old_count, any_type |
| C | 38 | 71 | `amazon-fba-fee` | calculator | EC Tools | related_links, copy, reset_clear, validation, current_count |
| C | 38 | 72 | `html-entity` | reference | Encoding & Decoding | reset_clear, privacy, current_count; penalties: old_count, any_type |
| C | 38 | 72 | `jwt-decoder` | utility | Encoding & Decoding | faq, current_count; penalties: old_count, any_type |

## Strongest Current Tools

| Quality | Slug | Type | Category |
| ---: | --- | --- | --- |
| 100 | `ad-budget-estimator` | utility | Business |
| 100 | `ai-cost-calculator` | calculator | AI Tools |
| 100 | `ai-tool-roi` | calculator | AI Workflow |
| 100 | `aircon-capacity` | calculator | Home |
| 100 | `ascii-art` | utility | Text & String Tools |
| 100 | `ascii-flowchart` | reference | Developer Tools |
| 100 | `asset-allocation` | utility | Finance |
| 100 | `base-stores-fee` | comparison | EC |
| 100 | `bmi-keisan` | calculator | Japanese Tools |
| 100 | `border-radius` | utility | CSS Tools |
| 100 | `bpm-delay` | reference | Music |
| 100 | `calorie-keisan` | calculator | Japanese Tools |
| 100 | `cdn-pricing-comparison` | comparison | SaaS Pricing |
| 100 | `chmod-calculator` | calculator | Developer Tools |
| 100 | `color-converter` | converter | Color Tools |

## Archetype Averages

| Type | Average quality |
| --- | ---: |
| calculator | 86.9 |
| comparison | 81.2 |
| converter | 89.5 |
| generator | 88.8 |
| image | 98.8 |
| reference | 87.5 |
| utility | 89.4 |

## Weakest Categories

| Category | Average quality | Tools |
| --- | ---: | ---: |
| Design Tools | 69 | 1 |
| EC Tools | 72.4 | 5 |
| SaaS Pricing | 73.6 | 13 |
| SEO Tools | 77.7 | 3 |
| Tax Tools | 78.3 | 9 |
| Labor Tools | 79.2 | 4 |
| Encoding & Decoding | 80.1 | 7 |
| Creator Tools | 84.5 | 2 |
| Business Tools | 85 | 6 |
| Life Tools | 85.3 | 3 |
| AI Tools | 85.9 | 16 |
| Data Format Tools | 86.7 | 6 |

## Next Factory Steps

1. Build shared v2 shells for converter, calculator, image, and comparison tools.
2. Rewrite the highest-priority S-tier tools in batches using those shells.
3. Promote repeated checks from this report into `check-integrity.py` only after the signal is reliable.
4. Add live competitor notes only for tools selected for an S-tier rewrite.
