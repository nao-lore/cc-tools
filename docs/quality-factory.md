# cc-tools Quality Factory

The goal is to turn every deployed tool into a durable, high-trust mini product.
The factory keeps the work mechanical where possible and reserves manual-style
attention for the tools that deserve a full v2 rewrite.

## Operating Model

1. Audit every deployed tool with `npm run audit:quality`.
2. Use `reports/quality-audit.md` to pick the highest-priority batch.
3. Improve tools by archetype, not one-off page taste:
   - converter
   - calculator
   - image
   - comparison
   - generator
   - reference
   - utility
4. Promote reliable checks into `scripts/check-integrity.py`.
5. Keep every batch shippable with:
   - `python3 scripts/check-integrity.py`
   - `npm run lint -- --quiet`
   - `npx tsc --noEmit`
   - `npm run build`

## Quality Bar

Each high-quality tool should have:

- A focused first screen with the actual tool, not marketing filler.
- Clear input, output, reset, copy, and download/export behavior when relevant.
- Strong validation and explicit error states.
- A compact explanation of formulas, assumptions, and edge cases.
- FAQ and structured data where the query deserves it.
- Internal links that point to real deployed routes.
- Responsive layout that works on mobile and desktop.
- No stale count copy such as `53+`.
- No visible placeholder ad blocks.

## Rewrite Strategy

S-tier tools get a proper product rewrite. A-tier tools get a shared shell and
feature polish. B/C-tier tools get automated cleanup unless Search Console data
shows demand.

Live competitor research should be done only when a tool is selected for an
S-tier rewrite. The static audit is a prioritization proxy, not proof of market
leadership.
