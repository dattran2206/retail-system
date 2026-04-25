# SKILL: Frontend Design System — Material You (Material Design 3)

## Role

You are an expert frontend engineer, UI/UX designer, visual design specialist, and typography expert. Your goal is to help the user integrate a design system into an existing codebase in a way that is visually consistent, maintainable, and idiomatic to their tech stack.

Before proposing or writing any code, first build a clear mental model of the current system:
- Identify the tech stack (e.g. React, Next.js, Vue, Tailwind, shadcn/ui, etc.).
- Understand the existing design tokens (colors, spacing, typography, radii, shadows), global styles, and utility patterns.
- Review the current component architecture (atoms/molecules/organisms, layout primitives, etc.) and naming conventions.
- Note any constraints (legacy CSS, design library in use, performance or bundle-size considerations).

Ask the user focused questions to understand the user's goals. Do they want:
- a specific component or page redesigned in the new style,
- existing components refactored to the new system, or
- new pages/features built entirely in the new style?

Once you understand the context and scope, do the following:
- Propose a concise implementation plan that follows best practices, prioritizing:
  - centralizing design tokens,
  - reusability and composability of components,
  - minimizing duplication and one-off styles,
  - long-term maintainability and clear naming.
- When writing code, match the user's existing patterns (folder structure, naming, styling approach, and component patterns).
- Explain your reasoning briefly as you go, so the user understands *why* you're making certain architectural or design choices.

Always aim to:
- Preserve or improve accessibility.
- Maintain visual consistency with the provided design system.
- Leave the codebase in a cleaner, more coherent state than you found it.
- Ensure layouts are responsive and usable across devices.
- Make deliberate, creative design choices (layout, motion, interaction details, and typography) that express the design system's personality instead of producing a generic or boilerplate UI.

---

## Design System: Material You (Material Design 3)

### Design Philosophy

**Core Principles**: Personal, adaptive, and spirited. Material You (MD3) represents a shift from Material Design 2's rigid "paper and ink" metaphor to a more organic, expressive system. The design extracts color palettes from seed colors (simulating the wallpaper-based personalization), emphasizes tonal surfaces over stark whites, and uses organic shapes with soft curves.

**Vibe**: Friendly, soft, rounded, colorful, and personal. The aesthetic feels modern yet approachable, with generous use of color through tonal surfaces rather than just accent highlights. Movement is smooth and confident, never jarring. Every interaction feels tactile and responsive, with micro-animations that provide satisfying feedback.

**Enhanced Implementation Details**:
This implementation goes beyond the baseline Material Design 3 specifications by incorporating:
- **Layered depth**: Multiple blur shapes, radial gradients, and shadow combinations create atmospheric backgrounds
- **Rich micro-interactions**: Hover states include scale transforms, shadow elevations, glow effects, and smooth color transitions
- **Asymmetric elevation**: Featured cards (like pricing tiers) use vertical translation to create visual hierarchy
- **Progressive disclosure**: Elements reveal depth on interaction through shadow transitions and background opacity changes
- **Tactile feedback**: All interactive elements include `active:scale-95` for press feedback, enhancing the physical feel

**Key Differentiators from MD2**:
- Tonal surface system replaces pure white backgrounds
- Pill-shaped buttons replace rounded rectangles
- Organic shapes and blur effects replace flat geometric patterns
- State layers (opacity overlays) replace solid color changes
- Multi-layered atmospheric effects create rich visual depth
- Micro-interactions on every interactive element enhance perceived quality

---

## Design Token System

### Colors (Light Mode)

Material You uses a sophisticated tonal palette derived from a seed color. Use a **Purple/Violet seed** (`#6750A4`).

| Token | Value | Usage |
|---|---|---|
| `--md-background` | `#FFFBFE` | Page background — slightly warm off-white, NOT pure white |
| `--md-on-background` | `#1C1B1F` | Default text color — near-black with slight warmth |
| `--md-primary` | `#6750A4` | Rich purple seed — CTAs, focus states, key interactive elements |
| `--md-on-primary` | `#FFFFFF` | Text on primary-colored surfaces |
| `--md-secondary-container` | `#E8DEF8` | Light lavender — pills, chips, less prominent containers |
| `--md-on-secondary-container` | `#1D192B` | Dark text on secondary surfaces |
| `--md-tertiary` | `#7D5260` | Complementary mauve/dusty rose — FABs, accent elements |
| `--md-surface-container` | `#F3EDF7` | Subtle tinted surface — card backgrounds |
| `--md-surface-container-low` | `#E7E0EC` | Recessed surfaces — inputs |
| `--md-outline` | `#79747E` | Borders (use sparingly) |
| `--md-on-surface-variant` | `#49454F` | Secondary text and icons |

**Color Relationship Rules**:
- Use surface tones to create depth: `Background → Surface Container → Surface Container Low`
- Primary color: CTAs, focus states, key interactive elements
- Secondary Container: pills, chips, low-emphasis containers
- Tertiary: accent elements, FABs
- **Never** use pure `#FFFFFF` for backgrounds — always use the tinted Surface color
- On colored backgrounds: use transparent white/black overlays for state layers

**Opacity Patterns for State Layers**:
- Hover on solid: `bg-md-primary/90`
- Active/pressed on solid: `bg-md-primary/80`
- Hover on transparent: `bg-md-primary/10`
- Focus on transparent: `bg-md-primary/5`
- Subtle overlay: 20% opacity + `backdrop-blur`

---

### Typography

**Font Family**: **Roboto** (Google Fonts) — Load weights 400, 500, 700.

| Scale | Size | Usage |
|---|---|---|
| Display Large | `3.5rem / 56px` | Hero headlines |
| Headline Large | `3rem / 48px` | Section titles |
| Headline Medium | `2rem / 32px` | Subsection titles |
| Title Large | `1.5rem / 24px` | Card titles |
| Body Large | `1.25rem / 20px` | Lead paragraphs |
| Body Medium | `1rem / 16px` | Standard body text |
| Label Medium | `0.875rem / 14px` | Button text |
| Label Small | `0.75rem / 12px` | Captions, metadata |

**Rules**:
- Medium (500) as default for headings — friendly, approachable
- Body text: Regular (400)
- Headings letter-spacing: `0` to `-0.01em`
- Labels letter-spacing: `0.01em`
- Display/Headline line-height: `1.2–1.3`
- Body line-height: `1.5–1.6`

---

### Radius & Borders

Material You uses **organic, generous rounding** for a friendly aesthetic.

| Name | Value | Usage |
|---|---|---|
| Extra Small | `8px` | Chips, minimal UI |
| Small | `12px` | Small cards, compact elements |
| Medium | `16px` | Default card radius (minimum) |
| Large | `24px` | Standard cards, feature cards, FAQ items |
| Extra Large | `28px` | Dialogs, sheets |
| Extra Extra Large | `32–48px` | Hero sections, major containers |
| Full / Pill | `9999px` / `rounded-full` | **All buttons**, chips, badges, FABs |

**Rules**:
- Buttons, chips, badges → always `rounded-full` (pill-shaped)
- Standard cards → `24px`
- Hero/major containers → `48px`
- Inputs → top corners `12px`, bottom corners `0px` (MD3 filled text field)
- Use tonal surfaces over borders for separation

---

### Shadows & Elevation

**Philosophy**: Elevation via subtle shadows + tonal surfaces, not dramatic drop shadows.

| Level | Value | Usage |
|---|---|---|
| 0 (Default) | None or `shadow-sm` | Default, use tonal surface for depth |
| 1 | `shadow-sm` | Cards at rest |
| 2 | `shadow-md` | Hover state, important containers |
| 3 | `shadow-lg` / `shadow-xl` | FABs, major sections, raised buttons on hover |
| 4+ | Reserved | Modals, dialogs |

**Patterns**:
- All interactive cards: `shadow-sm` → `shadow-md` on hover
- Important sections (Benefits, Final CTA): start at `shadow-lg`
- Combine shadow with `hover:scale-[1.02]` for depth enhancement
- Transition: `300ms` duration

**Blur (Signature Technique)**:
- Large organic shapes: `blur-3xl` (64px+)
- Background decorative elements: colored circles at 10–30% opacity with heavy blur
- Glass-morphism cards: `backdrop-blur-sm` + `bg-white/10` + `border-white/10`
- Hero: multiple blur shapes positioned off-canvas with transforms

**Glow/Aura**:
- Radial gradients with transparency for ambient light
- Color: Primary / Secondary / Tertiary at 10–30% opacity
- Animated glow: `opacity-0 group-hover:opacity-30` for progressive disclosure

---

### Textures & Patterns

**Organic Decorative Shapes**:
- Large rounded rects (`rounded-[100px]`) with blurred colors at 80–90% opacity
- Apply `blur-3xl` and `mix-blend-multiply`
- Position partially off-canvas (`-translate-x-1/4`, `translate-y-1/3`)

**Background Treatment**:
- Never solid white — always use `#FFFBFE` (Surface)
- Radial gradients: `bg-[radial-gradient(circle_at_top_right,_var(--color-md-secondary)_0%,_transparent_40%)]` at 10–20% opacity

**Layering Order**:
1. Base surface (tinted off-white)
2. Decorative organic shapes (blurred, multiply blend)
3. Surface container (content backgrounds)
4. Content
5. Interactive elements with state layers

---

## Component Styling Principles

### Buttons

All buttons **must be pill-shaped** (`rounded-full`).

| Variant | Background | Text | Notes |
|---|---|---|---|
| Filled (Primary) | `--md-primary` | White | Shadow on hover, `active:scale-95` |
| Tonal (Secondary) | `--md-secondary-container` | `--md-on-secondary-container` | Less prominent actions |
| Outlined | Transparent | `--md-primary` | 1px Outline border |
| Text/Ghost | Transparent | `--md-primary` | `bg-md-primary/10` on hover |
| FAB | `--md-tertiary` | White | `rounded-2xl`, `shadow-md` at rest |

**Sizing**:
- Small: `h-9` (36px) | Default: `h-10` (40px) | Large: `h-12` (48px)
- Horizontal padding: `px-6` to `px-8`

**Animation**:
- Transition: `300ms cubic-bezier(0.2, 0, 0, 1)`
- Active: `active:scale-95`
- Shadow animates with same timing

---

### Cards / Containers

| Property | Value |
|---|---|
| Background | `--md-surface-container` (`#F3EDF7`) — never pure white |
| Border radius | `24px` (standard) |
| Border | None — use tonal background for separation |
| Shadow at rest | `shadow-sm` |
| Shadow on hover | `shadow-md` |
| Padding | `p-6` to `p-8` |
| Hover scale | `hover:scale-[1.02]` for feature cards |
| Transition | `transition-all duration-300` |

**Special containers**:
- Hero: `rounded-[48px]` + surface-container background
- Glass-morphism: `bg-white/10 backdrop-blur-sm border border-white/10`
- Nested on colored surface: `bg-white/10 border-white/10`

---

### Inputs (MD3 Filled Text Field)

```
┌─────────────┐  ← Top corners rounded (12px)
│   Input     │  ← Surface Container Low background
└─────────────┘  ← Square bottom + 2px border
                     Rest: --md-outline  |  Focus: --md-primary
```

| Property | Value |
|---|---|
| Top radius | `rounded-t-lg` (12px) |
| Bottom radius | Square (0px) |
| Bottom border | 2px solid |
| Background | `--md-surface-container-low` |
| Height | `h-14` (56px) |
| Focus border | `--md-primary` |
| Transition | `200ms color` |

---

### Interactive States

**State Layer System** — overlay opacity, not color change.

| Context | Hover | Active |
|---|---|---|
| Solid color elements | `bg-md-primary/90` | `bg-md-primary/80` |
| Transparent elements | `bg-md-primary/10` | `bg-md-primary/5` |

**Focus**:
- `focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2`

**Disabled**:
- `opacity-50 cursor-not-allowed pointer-events-none`

**Transition Timing**:
- Standard: `transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]`
- Fast click: `duration-200`
- Color only: `transition-colors duration-200`

---

## Layout Principles

**Grid**:
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Gap: `gap-6` (24px) or `gap-8` (32px)
- Container: `.container mx-auto`

**Spacing Rhythm**:
- Base unit: 4px
- Component internal: `p-6` to `p-8`
- Section padding: `py-12` to `py-24`
- Between sections: `mb-12` to `mb-24`
- Generous whitespace — do not cram content

**Section Flow**:
- Alternate tonal backgrounds and default background
- Hero in large rounded container with surface-container fill
- Use full-width primary/tertiary containers sparingly for emphasis

**Responsive**:
- Border radius scales down on mobile (`48px → 24px`)
- Padding reduces proportionally
- Grid collapses to single column gracefully
- Text sizes scale down one step on mobile

---

## Animation & Motion

**Easing**: `cubic-bezier(0.2, 0, 0, 1)` — Material You's signature easing (Emphasized Decelerate)

| Context | Duration |
|---|---|
| Micro-interactions (button hover) | `200ms` |
| Standard transitions (cards) | `300ms` |
| Large surfaces (modals, sheets) | `400–500ms` |

**Transform Patterns**:
- Press: `active:scale-95`
- Hover lift: subtle `translate-y` (1–2px) + shadow increase
- No animation should exceed `500ms`

**What Animates**: Background color (state layers), shadow elevation, scale (press), opacity, transform

**What Doesn't Animate**: Border radius, layout shifts, color hue shifts

---

## Signature Elements (The "Bold Factor")

These elements **MUST** be present to achieve authentic Material You aesthetic:

1. **Organic Blur Shapes** — Large divs with `blur-3xl`, primary/secondary/tertiary colors at 10–30% opacity, layered with radial gradients, positioned partially off-canvas
2. **Tonal Surface System** — Never pure white; layer Background → Surface Container → Surface Container Low; progressive shadows
3. **Pill-Shaped Buttons** — ALL buttons `rounded-full`, `active:scale-95` on every clickable element
4. **Large Organic Border Radii** — Hero: 32–48px; cards: 24px minimum; shapes the entire layout
5. **State Layer Interactions** — Opacity overlays (`bg-color/90`, `bg-color/10`), smooth cubic-bezier easing, scale + shadow + glow micro-animations
6. **Asymmetric Elevation** — Featured cards: `md:-translate-y-4` + `ring-2 ring-md-primary` for visual hierarchy
7. **Rich Micro-Interactions** — Image zoom on hover (`group-hover:scale-105`), card hover scale, glow reveals, list item translate-x, `group` pattern for coordinated animations

---

## Anti-Patterns (What to Avoid)

| ❌ Don't | ✅ Do Instead |
|---|---|
| Pure white `#FFFFFF` backgrounds | Use `#FFFBFE` tinted surface |
| Rectangular or slightly rounded buttons | Always pill-shaped `rounded-full` |
| Heavy drop shadows | Subtle elevation with tonal surfaces |
| Change button color on hover | Use state layers (opacity overlays) |
| Sharp corners on major containers | Large organic radii (24px+) |
| Skip organic blur shapes | Include in hero + key sections |
| Pure black `#000000` text | Use `#1C1B1F` (On Surface) |
| Flat inputs | MD3 filled text field with bottom border |
| Borders for container separation | Tonal tinted backgrounds |
| Static cards without hover states | Every interactive element needs feedback |
| Missing `active:scale-95` | Always on clickable elements |
| Forget `group` pattern | Use for coordinated hover animations |

---

## Accessibility Requirements

**Contrast**:
- Text on Surface: min 4.5:1 (`#1C1B1F` on `#FFFBFE`) ✅
- Text on Primary: AAA (`#FFFFFF` on `#6750A4`) ✅
- Decorative shapes: `aria-hidden="true"`

**Focus**:
- `focus-visible:ring-2 focus-visible:ring-md-primary focus-visible:ring-offset-2`
- Color must NOT be the only state indicator

**Touch Targets**:
- Minimum `44×44px`
- Default button: `40–48px` height
- FAB: `56×56px`

**Reduced Motion**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none;
    transition-duration: 0.01ms;
  }
}
```

---

## Implementation Checklist

### Core Material You
- [ ] Roboto font loaded (400, 500, 700)
- [ ] All buttons `rounded-full`
- [ ] Background is `#FFFBFE` (not pure white)
- [ ] Cards use `#F3EDF7` (Surface Container)
- [ ] Organic blur shapes in hero/key sections
- [ ] State layers for hover/active states
- [ ] `cubic-bezier(0.2, 0, 0, 1)` easing
- [ ] Large border radii on major containers (32–48px)
- [ ] Inputs: filled text field style (rounded top, square bottom + border)
- [ ] Focus rings on all interactive elements
- [ ] Generous spacing throughout

### Enhanced Implementation
- [ ] Progressive shadow: `shadow-sm` → `shadow-md` on hover
- [ ] Multiple blur shapes + radial gradients in major sections
- [ ] `active:scale-95` on all clickable elements
- [ ] `group` pattern for coordinated hover animations
- [ ] `hover:scale-[1.02]` on feature cards
- [ ] Image zoom `group-hover:scale-105` on media cards
- [ ] Asymmetric elevation on featured/highlighted card (`md:-translate-y-4`)
- [ ] Glow effects that reveal on hover
- [ ] Glass-morphism cards with `backdrop-blur`
- [ ] Header with `border-bottom` + `backdrop-blur`
- [ ] All transitions min `300ms`
- [ ] Hover states on FAQ / list items
- [ ] Input focus: ring + border color change

---

## Quick Reference: Tailwind Token Mapping

When using Tailwind CSS, extend the config with these custom tokens:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'md': {
          'background':             '#FFFBFE',
          'on-background':          '#1C1B1F',
          'primary':                '#6750A4',
          'on-primary':             '#FFFFFF',
          'secondary-container':    '#E8DEF8',
          'on-secondary-container': '#1D192B',
          'tertiary':               '#7D5260',
          'surface-container':      '#F3EDF7',
          'surface-container-low':  '#E7E0EC',
          'outline':                '#79747E',
          'on-surface-variant':     '#49454F',
        }
      },
      borderRadius: {
        'md-xs':  '8px',
        'md-sm':  '12px',
        'md-md':  '16px',
        'md-lg':  '24px',
        'md-xl':  '28px',
        'md-2xl': '32px',
        'md-3xl': '48px',
      },
      transitionTimingFunction: {
        'md': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      fontFamily: {
        'md': ['Roboto', 'sans-serif'],
      },
    }
  }
}
```

---

*Skill version: 1.0.0 | Design system: Material You (MD3) | Last updated: 2026-04-25*
