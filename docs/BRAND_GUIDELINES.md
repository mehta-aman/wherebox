# WhereBox — Brand Guidelines & Design System

## 1. Brand Essence

- **Product Name:** WhereBox
- **Primary Tagline:** Every package. One place.
- **Secondary Statement:** Your packages. Our priority.
- **Brand Character:** Premium, minimal, modern, friendly, and inspired by the polish of Apple's software interfaces.
- **Core Visual Philosophy:** Translucent glassmorphism surfaces, restrained gradients, refined typography, and smooth transitions.

---

## 2. Official Color Palette

| Token | Name | Hex | Usage |
|---|---|---|---|
| `--color-brand-primary` | Primary Blue | `#6366F1` | Primary CTA buttons, active navigation, links, focal points |
| `--color-brand-violet` | Secondary Violet | `#8B5CF6` | Gradients, visual emphasis, decorative highlights |
| `--color-brand-teal` | Accent Teal | `#14B8A6` | Delivery completed indicator, positive progress, pulses |
| `--color-brand-surface` | Surface Border | `#E5E7EB` | Translucent card borders, neutral dividers |
| `--color-brand-navy` | Deep Navy | `#0F172A` | Primary typography, headers, high contrast icons |
| `--color-brand-muted` | Muted Text | `#64748B` | Secondary details, metadata, relative timestamps |
| `--color-brand-bg` | Soft Canvas | `#F8FAFC` | Light mode viewport background |
| `--color-brand-dark-bg` | Dark Background | `#080F25` | PWA icon canvas, dark hero gradients |
| `--color-brand-dark-surface` | Dark Surface | `#111B35` | Dark mode translucent surfaces |
| Semantic Error | Alert Red | `#EF4444` | Exceptions, delivery failed, premise closed |
| Semantic Warning | Warning Amber | `#F59E0B` | Inactive scans, heuristic delay warnings |
| Semantic Success | Success Teal | `#14B8A6` | Delivered milestones |

---

## 3. Gradient System

Gradients are used sparingly and intentionally for high-value focal points:

1. **Primary Gradient:**
   `linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)`
   *Used on Primary CTA buttons, active state indicators, and wordmark accent.*

2. **Brand Gradient:**
   `linear-gradient(135deg, #14B8A6 0%, #6366F1 55%, #8B5CF6 100%)`
   *Used on pin symbols, feature cards, and celebratory badges.*

3. **Dark Hero Gradient:**
   `linear-gradient(135deg, #080F25 0%, #172554 55%, #4338CA 100%)`
   *Used for PWA app icon backgrounds and deep immersion surfaces.*

---

## 4. Logo & Wordmark Lockups

- **Concept:** An isometric parcel box unified with an emerging location pin, representing package discovery and delivery tracking.
- **Wordmark Typography:**
  - `"Where"` set in deep navy (`#0F172A`).
  - `"Box"` set in the Primary Gradient (`#6366F1` to `#8B5CF6`).
- **Lockups:**
  - **Primary Lockup:** Symbol + `WhereBox` wordmark.
  - **Secondary Lockup:** Symbol + `WhereBox` + tagline *"Every package. One place."*
  - **Compact Lockup:** Symbol only (48x48 viewport).

---

## 5. App Icon Variations

| Variation | Description | Primary Use |
|---|---|---|
| **Variation A — Default** | Deep navy (`#080F25`) rounded squircle, luminous blue-violet parcel with emerging teal-accented location pin. | PWA Homescreen icon, App Store icon, Splash screen |
| **Variation B — Light** | Clean white/light gray background with vivid gradient parcel and subtle shadow. | Light interfaces, Apple touch icon on light wallpaper |
| **Variation C — Dark Monochrome** | Dark background with crisp white monochrome vector outlines. | Dark high-contrast themes and developer settings |
| **Variation D — Glyph** | Simplified outline stroke of the box and pin. | Favicon, browser tab, compact navigation bar |

---

## 6. Glassmorphism Design Rules

1. **Surface Translucency:**
   - Background: `rgba(255, 255, 255, 0.75)` to `rgba(255, 255, 255, 0.88)`
   - Backdrop filter: `blur(16px)` to `blur(20px)`
   - Border: `1px solid rgba(255, 255, 255, 0.7)`
   - Soft shadow: `0 8px 32px 0 rgba(31, 38, 135, 0.05)`
2. **Readability First:**
   - Never use low-contrast text on glass surfaces. Text is rendered in `#0F172A` or `#64748B`.
   - Provide opaque fallbacks for browsers without `-webkit-backdrop-filter` support.
3. **Restraint:**
   - Never make the entire screen transparent. Background canvas is structured with soft radial gradients; cards sit firmly above the surface.

---

## 7. Typography Scale

- System font: Apple SF Pro on iOS/macOS, Inter on other platforms, with clean `-apple-system, BlinkMacSystemFont` fallback.
- **Hero Title:** 28–36px Bold / Extrabold (`text-2xl` to `text-3xl`)
- **Section Heading:** 18–20px Bold (`text-lg` to `text-xl`)
- **Card Title / Store Name:** 14–15px Semibold (`text-sm` to `text-base`)
- **Body Text:** 13–14px Regular / Medium (`text-xs` to `text-sm`)
- **Metadata / Timestamps:** 11–12px Medium (`text-[11px]` to `text-xs`)
- **Tracking Numbers:** Monospace tabular numerals (`font-mono`) for precision scanning.
