# FitDraw — Design

FitDraw is a clothing-measurement sketching tool for tailors, sewists and small clothing
brands. You pick a garment, enter its flat measurements, and get a clean annotated sketch you
can copy, share or export as a 1600×1600 PNG. Ships on **web**, **mobile (iOS/Android)** and
**desktop (Electron, which loads the web app)**. French UI, exactly like the original.

The visual direction is the one already in the source app: quiet, technical, paper-like. The
sketch is the hero — everything else is chrome around it. No gradients, no illustration, no
decorative motion. Accent colour is used sparingly (active garment, primary action, watermark)
so the ink drawing stays the loudest thing on screen.

## Brand & Colors

One token set, consumed per platform:

- **Web & desktop**: CSS variables in `packages/web/src/web/styles.css`. Desktop loads the web UI, so it inherits these for free.
- **Mobile**: `Colors.light` / `Colors.dark` in `packages/mobile/constants/theme.ts`, read via `useColors()`; `userInterfaceStyle: "automatic"` follows the system setting.

Tokens are stored as **space-separated RGB channels** under a `--t-` prefix (`rgb(var(--t-bg))`),
so alpha variants work (`rgb(var(--t-ink) / 0.06)`) and the shadcn HSL tokens stay untouched.

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| accent | `#3B4CCA` | `#6B78E8` | Primary action, active garment, watermark |
| accent-soft | `#E8EAFB` | `#232847` | Accent-tinted fills, selected chips |
| bg | 255 255 255 | 15 17 24 | Page / screen background |
| ink | 20 22 31 | 236 238 245 | Primary text, sketch outline |
| sub | 107 112 128 | 148 153 170 | Labels, helper text, units |
| surface | 244 245 248 | 28 31 42 | Inputs, secondary buttons, sheet chrome |
| surface2 | 241 242 247 | 33 36 48 | Hover, pressed, alternating rows |
| card | 255 255 255 | 21 24 33 | Panels, cards, measurement rows |
| border | 227 229 236 | 46 50 65 | Hairlines, dividers |
| border-strong | 213 216 226 | 60 65 82 | Input outlines, focus rings |
| canvas | 238 240 246 | 11 13 19 | Sketch stage behind the garment |

Semantic colours: danger `#D9534F` / `#F2777A` (soft warnings only), success `#2E9E6B` / `#45C08A`.

Utility classes to mirror the source: `.t-bg .t-ink .t-sub .t-surface .t-surface2 .t-card
.t-border .t-border-strong .t-canvas`. Dark mode switches on `.dark` on `<html>`; the theme
choice is persisted in `fitdraw-theme`.

## Typography

Single family, **Plus Jakarta Sans** (500 / 600 / 700 / 800), self-hosted:

- Web: `packages/web/public/fonts/plus-jakarta-sans-{500,600,700,800}.woff2`, declared with `@font-face` and referenced by absolute URL (`/fonts/...`).
- Mobile: `@expo-google-fonts/plus-jakarta-sans` loaded with `useFonts` from `expo-font`.

Hierarchy is weight-driven, not size-driven: 800 for the app name and export title, 700 for
section headers and button labels, 600 for garment names and measurement labels, 500 for
values and body copy. Sizes stay small and tight (11 → 28px); the interface should read like
a spec sheet. Line height 1.35 for body, 1.15 for headers.

## Layout

Three breakpoints, driven by `useLayout()` — `mobile` below 1020px, `tablet` when the pointer
is coarse or width < 1360px, `desktop` above:

- **Mobile** — single column. Sketch stage on top, actions in a sticky bottom bar, measurement rows stacked below. Garment picker is a bottom sheet.
- **Tablet** — sketch stage plus a fixed 380px side panel holding garment, size/coupe and measurements.
- **Desktop** — 420px `aside` on the left (garment, size, measurements), sketch stage filling the rest. Asymmetric on purpose: the drawing gets the space.

Radii: `16px` measurement rows, `18px` chips, `28px` sheets, `32px` large panels, `full` for
buttons. Action height 52px on mobile, 56px on desktop. Spacing scale 4 / 8 / 12 / 16 / 24 / 32.
Shadows are one soft layer only — `0 1px 2px rgb(20 22 31 / .06)` — never stacked.

## Pages & Screens

- **Web — Landing** (`src/web/pages/landing.tsx`) — value line, one screenshot of the sketch, "Ouvrir FitDraw" CTA, sign-in entry.
- **Web — Studio** (`src/web/pages/studio.tsx`) — the three layouts above; sketch, garment picker, size/coupe, measurement rows, warnings, copy / share / export actions.
- **Web — Personnalisation** (`src/web/pages/branding.tsx`) — boutique name, logo upload, watermark toggle.
- **Web — Compte** (`src/web/pages/account.tsx`) — sign-in / sign-up, sync state, sign out.
- **Mobile — Croquis** (`app/(tabs)/index.tsx`) — sketch, garment bottom sheet, size/coupe, measurement rows, warnings, export sheet.
- **Mobile — Mes vêtements** (`app/(tabs)/garments.tsx`) — drafts per garment, sorted by usage.
- **Mobile — Personnalisation** (`app/(tabs)/branding.tsx`) — name, logo, watermark.
- **Mobile — Compte** (`app/(tabs)/account.tsx`) — auth, sync state.

## Key User Flows

1. **Measure a garment** — open Croquis → pick garment from the sheet (search + usage-sorted) → optionally apply a size to prefill → type values into the rows → the sketch redraws live and soft warnings appear for inconsistent values.
2. **Export** — tap Exporter → canvas paints 1600×1600 (title `NOM · TAILLE · COUPE`, watermark, boutique signature) → web/desktop uses Web Share when available and falls back to a download; mobile captures the SVG and opens the native share sheet.
3. **Keep a draft** — every edit writes to `fitdraw-draft:<id>` locally and queues a sync. On sign-in, drafts merge with the server copy, newest wins per garment. No "Synchroniser" button.
4. **Brand the export** — Personnalisation → set boutique name and logo (PNG/JPG/WebP, ≤ 1 Mo, resized to 256px) → the export footer picks it up immediately.

## Motion

Almost none, and always functional: 160ms ease-out on hover/press, 220ms slide-up for the
mobile bottom sheet, a single 400ms fade-in of the sketch on first paint. `Animated` on mobile
always runs with `useNativeDriver: false` because the preview is Expo Web.
