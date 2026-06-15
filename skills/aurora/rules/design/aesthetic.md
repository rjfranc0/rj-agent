# Aesthetic Rules

## Typography

The font choice sets the entire tone. Get it wrong and nothing else matters.

- Always pair a distinctive **display font** with a refined **body font**
- Display font carries personality — it should be unexpected, characterful
- Body font carries content — legible, complementary, never competing
- Scale with contrast: massive headlines (`clamp()` up to `10–12vw`), crisp body (`16–18px` min)
- Fluid scale using `clamp()` — never fixed sizes that break at breakpoints

**Hard rule**: No Inter, Roboto, Arial, Space Grotesk, or system fonts. Ever.
If you don't know what to pick, go to Google Fonts and find something you haven't used before.

## Color

- Define everything as **CSS variables** — base, accent, surface, text, muted
- One dominant color family, one sharp accent — not five evenly distributed colors
- Commit to a palette direction: dark-first, light-first, or high-contrast monochrome
- Dominant + accent outperforms timid, evenly distributed palettes every time
- Background is not neutral — it sets the atmosphere

## Layout & Composition

The layout is the first design statement. Make it count.

- Unexpected over predictable — asymmetry, size contrast, deliberate tension
- Grid-breaking elements create visual interest — not everything aligns
- Generous negative space OR controlled density — never the default in-between
- Diagonal flow, overlap, layering add depth without complexity
- Every section should have one focal point — not three

## Backgrounds, Depth & Texture

Solid backgrounds are the floor, not the ceiling.

- Gradient meshes, noise textures, geometric patterns add atmosphere
- CSS/SVG noise overlay (`mix-blend-mode: overlay`, opacity `0.02–0.05`) removes digital sterility
- `backdrop-filter: blur()` + semi-transparent borders = depth without images
- Layered transparencies, dramatic shadows, grain overlays — use contextually
- The background should feel chosen, not defaulted to

## Spatial Rhythm

- Spacing is a design element — use it with intention
- Sections should breathe — silence between moments matters
- Density is valid too — but controlled density, not cluttered density
