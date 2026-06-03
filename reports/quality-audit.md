# cc-tools Quality Audit

This is a static quality proxy for deciding what to improve next. It is not a live competitor benchmark.

## Summary

- Tools audited: 147
- Average quality score: 88.4/100
- Priority tiers: {"A": 1, "B": 12, "C": 134}

## Highest Priority Tools

| Tier | Priority | Quality | Slug | Type | Category | Main gaps |
| --- | ---: | ---: | --- | --- | --- | --- |
| A | 70 | 39 | `cat-human-age` | utility | Pets | h1, related_links, copy, examples, reset_clear; penalties: ad_placeholder |
| B | 66 | 49 | `chien-songai-kin` | calculator | Legal | h1, related_links, copy, examples, reset_clear; penalties: ad_placeholder |
| B | 66 | 49 | `churn-mrr-calculator` | calculator | Business | h1, related_links, copy, examples, reset_clear; penalties: ad_placeholder |
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
| C | 40 | 76 | `chat-export-converter` | converter | AI Workflow | related_links, examples, current_count; penalties: ad_placeholder |
| C | 40 | 76 | `houjin-nari` | comparison | Tax Tools | copy, examples, validation, current_count |
| C | 40 | 76 | `stripe-fee-calculator` | calculator | Business Tools | copy, examples, validation, current_count |
| C | 38 | 71 | `amazon-fba-fee` | calculator | EC Tools | related_links, copy, reset_clear, validation, current_count |

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
| 100 | `base64-tools` | utility | Encoding & Decoding |
| 100 | `binary-converter` | converter | Encoding & Decoding |
| 100 | `bmi-keisan` | calculator | Japanese Tools |
| 100 | `border-radius` | utility | CSS Tools |
| 100 | `bpm-delay` | reference | Music |
| 100 | `calorie-keisan` | calculator | Japanese Tools |
| 100 | `cdn-pricing-comparison` | comparison | SaaS Pricing |

## Archetype Averages

| Type | Average quality |
| --- | ---: |
| calculator | 85.5 |
| comparison | 81.2 |
| converter | 92.4 |
| generator | 92.8 |
| image | 98.8 |
| reference | 95.1 |
| utility | 88.7 |

## Weakest Categories

| Category | Average quality | Tools |
| --- | ---: | ---: |
| Pets | 39 | 1 |
| Legal | 49 | 1 |
| Design Tools | 69 | 1 |
| EC Tools | 72.4 | 5 |
| SaaS Pricing | 73.6 | 13 |
| Business | 74.5 | 2 |
| Tax Tools | 78.3 | 9 |
| Labor Tools | 79.2 | 4 |
| Creator Tools | 84.5 | 2 |
| Business Tools | 85 | 6 |
| Life Tools | 85.3 | 3 |
| SEO Tools | 85.7 | 3 |

## Next Factory Steps

1. Build shared v2 shells for converter, calculator, image, and comparison tools.
2. Rewrite the highest-priority S-tier tools in batches using those shells.
3. Promote repeated checks from this report into `check-integrity.py` only after the signal is reliable.
4. Add live competitor notes only for tools selected for an S-tier rewrite.
