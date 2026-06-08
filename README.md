# Reusable Event Landing Template

A config-driven, re-themeable landing page for live events / webinars.
Build a brand-new page by editing **one config object** — no layout code.

## Files

| File | Role |
|------|------|
| `index.html` | The `THEME` + `SITE` config and the `#app` mount point. **This is the only file you edit per campaign.** |
| `ds.css` | Design system: tokens (`:root`) + reusable component classes. Edit to change the design language globally. |
| `render.js` | Turns `SITE.sections` into HTML. Generic — rarely needs edits. |
| `assets/` | Images (logo, hero cut-out, mentor photos, stat cards, torn-edge strips). |
| `clone.html` | Standalone hand-coded version (no JS), kept for reference. |

## Make a new landing page

1. **Re-theme** — override tokens in `window.THEME` (in `index.html`):
   ```js
   window.THEME = {
     brand: '#2563EB',                  // CTAs + accents
     'accent-soft': '#6366F1',          // quote / pricing band
     'font-display': "'Anton', sans-serif"
   };
   ```
   Any token from `ds.css :root` is overridable: `brand`, `cream`, `accent-soft`,
   `accent-deep`, `ink-bg`, `gray-band`, `font-display`, `font-body`,
   `font-ui`, `font-accent`, `radius`, `container`, `section-y`, …

2. **Swap content** — edit `window.SITE`: the date/countdown, the copy, and the
   `sections` array. Add, remove, or reorder sections freely.

3. **Replace assets** — drop new images into `assets/` and point the config at them.

## Section types (`SITE.sections[].type`)

`header` · `hero` (with countdown + form) · `marquee` · `prose` (optional
maze-pattern bg) · `quote` · `cards` (3-up numbered) · `ctaBand` (image overlay) ·
`split` (image stack + text + chips) · `numberedGrid` (2-up) · `numberedList`
(dark) · `mentors` (+ guest cards + banner) · `feature` (dark image split) ·
`valueGrid` (+ pricing + date row) · `statement` · `finalCta` · `footer` ·
`logosStrip` (partner/trust logos) · `testimonials` (review cards + stars) ·
`faq` (accordion)

### Extras (outside the `sections` array)

- `SITE.stickyBar` — fixed bottom CTA bar that slides in after scrolling.
  `{ logoHtml, cta:{label, href} }`
- `SITE.formEndpoint` — POST URL for real lead capture. Empty = demo mode.
- `SITE.tracking` — `{ ga4:'G-XXX', metaPixel:'123' }`. Scripts load **only**
  if an ID is provided (empty = nothing is injected).
- `SITE.submitMessage` — success text shown after a valid form submit.

## Copy markers (in any text field)

- `**bold**`  → **bold**
- `*italic*`  → *italic*
- `==text==`  → accent-colored text
- `\n`        → line break

Raw HTML is also allowed in text fields (the config is author-trusted).

## Behaviors

- **Countdown** auto-runs to `SITE.countdownTarget` (ISO date with timezone).
- **Form** validates required/email/tel, shows inline success/error, and POSTs
  to `SITE.formEndpoint` when set (otherwise demo mode).
- **Images** lazy-load by default (hero loads eagerly). For light payloads,
  point `src` at a CDN with on-the-fly resizing (the coaching demo uses
  LadiCDN `/s{W}x{H}/…`), or pre-optimize your own assets.
- **FAQ** accordion + **sticky bar** are keyboard/aria friendly.

## Localization & performance notes

- The display font (`--font-display`) defaults to **Bebas Neue** (Latin only).
  For Vietnamese/other diacritics, override it with a font that has the right
  subset — the coaching demo uses **Oswald** + **Be Vietnam Pro**.
- Add `<meta>` description + Open Graph/Twitter tags and a favicon in the page
  `<head>` (see `coaching.html` for a complete example).
