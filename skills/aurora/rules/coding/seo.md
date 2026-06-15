# SEO & Web Performance

Load this file when building **pages, routes, or marketing surfaces** — not isolated components.

These are build-time rules, not audit criteria. The output should be SEO-correct natively.

## Semantic Structure

- One `h1` per page — the page's subject, not the site name
- Heading hierarchy never skips levels (`h1` → `h2` → `h3`)
- Use landmarks: `header`, `nav`, `main`, `article`, `section`, `footer`
- Headings are document structure, not styling hooks — style with CSS, structure with semantics
- Links are `<a href>`, actions are `<button>` — never divs with click handlers for either

## Meta & Social

Every page declares:

- `<title>` — unique, ~50–60 chars, subject first
- `<meta name="description">` — unique, ~150–160 chars
- Canonical URL (`<link rel="canonical">`) — absolute
- Open Graph: `og:title`, `og:description`, `og:image` (1200×630), `og:url`, `og:type`
- `<html lang="...">` set correctly

In React frameworks, use the framework's metadata API (e.g. Next.js `metadata` export) — never raw `<head>` manipulation in components.

## Images

- `alt` on every meaningful image — empty `alt=""` for decorative ones
- Explicit `width` and `height` (or aspect-ratio) on every image and iframe — CLS prevention
- Modern formats: WebP/AVIF with fallback
- Lazy-load below-the-fold images — **never the LCP image**
- Preload the hero/LCP image

## Core Web Vitals — Build Targets

| Metric | Good | Build-time prevention |
|--------|------|----------------------|
| **LCP** ≤ 2.5s | Largest content paint | Preload hero image, modern formats, no render-blocking scripts, `font-display: swap` + preload fonts |
| **INP** ≤ 200ms | Interaction latency | Break long tasks (<50ms), debounce inputs (300–500ms), keep DOM lean (<1,500 elements), no sync storage access in handlers |
| **CLS** ≤ 0.1 | Layout shift | Dimensions on all media, reserve space for dynamic/async content, layout-stable loading states (skeleton matches final layout), font fallback metrics |

CWV is where design ambition meets discipline: heavy motion, display fonts, and full-bleed heroes are all LCP/CLS risks. The design declaration owns the ambition — these rules keep it shippable.

Mobile-first indexing is complete: the mobile version must contain all critical content, meta, and structured data. Never hide content on mobile that matters for indexing.

## Structured Data

- Always **JSON-LD** in a `<script type="application/ld+json">` — never Microdata
- `@context` is `https://schema.org` (https, not http)
- Emit the type matching the page: `WebSite` + `WebPage` baseline; `Organization`, `Article`/`BlogPosting`, `Product` + `Offer`, `BreadcrumbList`, `Person`, `Event`, `SoftwareApplication`/`WebApplication` as relevant
- Absolute URLs, ISO 8601 dates, no placeholder values
- **Never emit `HowTo`** — rich results removed since 2023
- **Avoid new `FAQPage`** — restricted to government/healthcare for rich results; only add if AI-search citation is an explicit goal

## Article-Type Pages

When building blog/article layouts, include the structural affordances search expects:
visible author byline, publication date, and `dateModified` when applicable — wired into the `Article` schema.
