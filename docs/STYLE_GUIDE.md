# Tapresente UI Style Guide

This style guide defines how to build pages and components in Tapresente using React, Next.js (App Router), and Tailwind CSS.

It is meant to be **practical and copy‑pasteable**. When in doubt, follow the examples here before inventing new patterns.

---

## 1. Design Principles

- **Clarity first**
  - Prioritize content and task completion over decoration.
  - Keep layouts simple and predictable.
- **Hierarchy & focus**
  - Every page should have a clear primary action and 1–2 secondary actions.
  - Use size, weight, and color to guide the eye.
- **Consistency**
  - Reuse layout shells, card patterns, and text styles.
  - Similar screens should look and behave similarly.
- **Comfortable breathing room**
  - Prefer slightly more spacing and fewer borders.
- **Accessible by default**
  - Respect color contrast.
  - Use semantic HTML and clear focus states.

---

## 2. Page Layout & Shells

### 2.1 Root page container

All public pages should use a full‑height **tinted** background and center content in a constrained width. Avoid pure white everywhere; use subtle gradients or soft neutrals:

- **Page wrapper (public flows like store, success, buy)**
  - `min-h-screen bg-gradient-to-b from-slate-50 to-white`
- **Page wrapper (authenticated areas like /account, /admin)**
  - `min-h-screen bg-slate-950/2.5 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(148,163,184,0.12),_transparent_55%)]`
  - This creates a very soft, desaturated vignette instead of a flat white.
- **Content width**
  - Use `max-w-4xl` or `max-w-5xl` depending on the page type (forms vs dashboards).
  - Horizontal padding: `px-4` on mobile, rely on container width for larger screens.

**Pattern:**

```tsx
export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <Header />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page-specific content */}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
```

### 2.2 Sticky header for public flows

For flows like store pages and checkout, use a sticky header that is visually distinct from the page background but still light:

- **Container**: `bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-10`
- **Inner content**: `max-w-4xl mx-auto px-4 py-3 md:py-4`
- **Layout**: `flex items-center justify-between gap-3`

The header usually includes:

- Back button (icon-only ghost button).
- Business or brand identity (icon + name).

---

## 3. Layout Patterns

### 3.1 Two-column layout (form + preview)

Used for purchase/checkout style pages:

- Wrapper: `grid grid-cols-1 lg:grid-cols-2 gap-8`
- Left column: preview / explanation.
- Right column: primary form and actions.

```tsx
<main className="max-w-4xl mx-auto px-4 py-8">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <PreviewColumn />
    <FormColumn />
  </div>
</main>
```

### 3.2 Cards

Base card pattern:

- Container: `bg-white rounded-2xl border border-slate-200 p-6`
- Optional variants:
  - Raised: `shadow-sm` (use sparingly).
  - Subtle section: `bg-slate-50 rounded-xl p-4`.

Use cards to group related content and actions, **not** just to draw boxes.

---

## 4. Typography

Rely on Tailwind + default font; keep the following scales consistent:

- **Page titles**
  - `text-2xl md:text-3xl font-bold text-slate-900`
- **Section titles / card titles**
  - `text-xl font-bold text-slate-900`
- **Subheadings**
  - `text-base font-medium text-slate-900`
- **Body text**
  - Default: `text-sm text-slate-700` or `text-slate-600`
  - Muted: `text-xs text-slate-500`

**Rules:**

- Never go above `text-3xl` except for hero pages.
- Use `font-bold` only for clear hierarchy (titles, primary values).
- For labels and helper text, prefer `text-xs` or `text-sm`.

---

## 5. Color System

Tapresente combines:

- **Core neutral palette** (Tailwind `slate`)
- **Business-specific colors** fetched from the database
  - `primary_color`
  - `secondary_color`
  - `gift_card_color` / `card_color`

### 5.1 Neutrals

Use `slate` as the default neutral, but lean on **soft surfaces** instead of pure white blocks everywhere:

- Primary text: `text-slate-900`
- Secondary text: `text-slate-600`
- Muted text: `text-slate-500`
- Borders: `border-slate-200`
- Subtle backgrounds:
  - Page tint: `bg-slate-50` or a very light gradient
  - Cards: `bg-white` on tinted backgrounds, or `bg-slate-50` on white backgrounds
  - Sections: `bg-slate-50` / `bg-slate-100` for grouped content

### 5.2 Accent colors from business/template

When you have dynamic colors (like `primaryColor`, `secondaryColor`, `giftCardColor`):

- Use them **only** where they help reinforce the brand:
  - Key CTAs (`backgroundColor: accentColor`)
  - Cards or highlights (`style={{ backgroundColor: giftCardColor }}`)
  - Titles/labels in highlight sections.
- For subtle tints, use alpha tricks:

```tsx
<div
  className="p-4 rounded-xl border"
  style={{
    backgroundColor: `${giftCardColor}10`,
    borderColor: `${giftCardColor}30`,
  }}
>
  {/* ... */}
</div>
```

Be careful with contrast; if a dynamic color is too light, consider falling back to defaults.

### 5.3 Default colors

When business colors are missing, use:

- `primary: '#1e3a5f'`
- `secondary: '#2563eb'`
- `giftCard: '#1e3a5f'`

Keep these values centralized where possible (e.g. constants near page or in a shared util).

---

## 6. Buttons

Buttons should be implemented as **components** or patterns, not ad‑hoc styles.

### 6.1 Primary button

Usage:

- Default CTA, e.g. "Pagar", "Salvar", "Continuar".
- Full width in single-column forms.

Tailwind pattern:

- `w-full py-3 px-6 rounded-lg text-white font-medium text-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50`
- Background color usually driven by `accentColor` or a palette color.

### 6.2 Ghost / icon buttons

For actions like "back", "close", or secondary icon‑only actions:

- `p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors`
- Use `aria-label` when icon‑only.

### 6.3 Destructive

For delete or dangerous actions (admin side):

- `bg-red-600 hover:bg-red-700 text-white`
- Keep disabled and hover states consistent with primary button.

---

## 7. Forms

Forms are central to Tapresente (logins, purchase flows, admin panels).

### 7.1 Form layout

- Vertical stacking with clear sections:
  - Form wrapper: `space-y-6`
  - Section blocks: `space-y-4` or `space-y-2`
- Use `Label` and `Input` components from `@/components/ui` where available.

### 7.2 Fields

- Labels:
  - Use `Label` component with `required` flag where needed.
- Inputs:
  - Prefer app-wide `Input` component styles.
- Textareas:

```tsx
<textarea
  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
  rows={3}
/>
```

### 7.3 Validation & errors

- Use the shared `Alert` component for form errors.
- Place errors **above the form** but inside the card.
- Message style: concise, humanly understandable, in Portuguese where relevant.

### 7.4 Disabled & loading states

- Disable inputs, toggles, and buttons when submitting.
- Use `Spinner` inside buttons where appropriate, keeping label if possible.

---

## 8. Cards & Visual Components

### 8.1 Gift card preview

Pattern used in the buy page and should be reused wherever gift cards are previewed:

- Container:
  - `rounded-2xl p-8 text-white aspect-[3/2] flex flex-col justify-between relative overflow-hidden`
  - Background color driven by `giftCardColor`.
- Decorative circles:

```tsx
<div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
<div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
```

- Content hierarchy:
  - Label: `text-white/60 text-sm`
  - Business name: `text-2xl font-bold`
  - Amount: `text-5xl font-bold`
  - Template name: `text-white/60 text-sm mt-2`

### 8.2 Info sections

For descriptions and "how it works" blocks:

- Description card:
  - `mt-6 p-4 bg-slate-100 rounded-xl`
  - Title: `font-medium text-slate-900 mb-2`
  - Body: `text-slate-600 text-sm`
- Highlighted info using brand color:

```tsx
<div
  className="mt-6 p-4 rounded-xl border"
  style={{
    backgroundColor: `${giftCardColor}10`,
    borderColor: `${giftCardColor}30`,
  }}
>
  <h3 className="font-medium mb-2" style={{ color: giftCardColor }}>
    Como funciona
  </h3>
  <ul className="text-sm space-y-2" style={{ color: `${giftCardColor}cc` }}>
    {/* list items */}
  </ul>
</div>
```

---

## 9. Icons

Use `lucide-react` icons consistently:

- Import only the icons you need, e.g. `import { ArrowLeft, Gift, User } from 'lucide-react';`
- Sizing:
  - Small: `w-4 h-4`
  - Default: `w-5 h-5`
  - Large illustration: `w-8 h-8`
- Colors:
  - Use text color utilities (`text-slate-400`, `text-slate-600`, etc.) rather than inline styles.

---

## 10. Component Organization (Next.js App Router)

### 10.1 Route‑local components

For components only used by a single route, colocate them under a `components` folder next to `page.tsx`:

- Path: `src/app/store/[slug]/buy/[templateId]/components/ComponentName.tsx`
- Export named components: `export function ComponentName() {}`
- Import using relative paths from `page.tsx`:

```tsx
import { PageHeader } from './components/PageHeader';
import { GiftCardPreviewSection } from './components/GiftCardPreviewSection';
import { PurchaseSection } from './components/PurchaseSection';
```

### 10.2 Shared components

For components reused across routes, place them in:

- `src/components/` (global UI components)
- `src/components/ui/` (low‑level primitives like inputs, buttons, alerts)

Keep these components **presentational** where possible.

---

## 11. State Management & Data Fetching

### 11.1 Server components

- Pages under `app/` are server components by default.
- Use them to:
  - Fetch data from Supabase.
  - Compute derived props (colors, return URLs).
  - Compose and orchestrate presentational components.

### 11.2 Client components

- Mark with `'use client';` at the top.
- Use for:
  - Interactive forms with local state.
  - Hooks like `useRouter`, `useState`, `useEffect`.

### 11.3 Props from server → client

- Keep props serializable and typed.
- Avoid passing full DB rows when only a few fields are needed.

---

## 12. Error Handling & Empty States

### 12.1 Not found / missing data

- Use Next.js `notFound()` in server components when entities are missing.
- Prefer friendly copy when possible on user‑facing pages.

### 12.2 Auth required

- For pages that require auth but are server components, the page should:
  - Fetch `user` from Supabase.
  - Either redirect or present a login prompt (like the Buy page pattern).

### 12.3 Inline errors

- Use the `Alert` component at the top of forms.
- Messages should:
  - Be short and actionable.
  - Avoid leaking technical details.

---

## 13. Responsive Behavior

- All layouts must work on **mobile first**:
  - Single column on small screens.
  - Add `lg:grid-cols-2` or similar only at larger breakpoints.
- Avoid horizontal scrolling.
- For complex grids, always test:
  - Narrow (~375px)
  - Tablet (~768px)
  - Desktop (~1280px)

### 13.1 Mobile patterns (Buy page example)

- **Grid & stacking**
  - Start with `grid grid-cols-1 gap-6`.
  - Add `lg:grid-cols-2 lg:gap-8` only where needed.
  - Put the most important content (often the **form**) either first or second depending on the flow; use `order-*` / `lg:order-*` if you need different order on desktop vs mobile.

- **Padding & tap targets**
  - Use `px-4` on the page container and `py-3`–`py-4` for headers.
  - Keep vertical spacing between major sections at least `mt-6` on mobile.
  - Buttons and inputs should have at least `py-3` for comfortable tapping.

- **Typography on small screens**
  - Scale down large headings with responsive classes:
    - Example: `text-base md:text-lg`, `text-3xl md:text-4xl`.
  - Avoid large blocks of dense text; prefer `text-sm` for paragraphs and `text-xs` for helper text.

- **Sticky header behavior**
  - Use `bg-white/95 backdrop-blur` to keep the header readable over the gradient background.
  - Keep header height compact on mobile: `py-3` and avoid large logos.

- **Cards and scroll**
  - Let cards stretch to full width within the content container.
  - Avoid nested scroll areas inside cards on mobile; the whole page should typically scroll as one.

---

## 14. Naming & Class Conventions

- Prefer semantic component names: `PageHeader`, `PurchaseSection`, `GiftCardPreviewSection`.
- Group Tailwind classes by function where possible:
  - Layout: `flex`, `grid`, `items-center`, `justify-between`, `gap-*`
  - Box: `p-*`, `m-*`, `rounded-*`, `border`, `shadow-*`
  - Typography: `text-*`, `font-*`
  - Color: `bg-*`, `text-*`, `border-*`
  - Interaction: `hover:*`, `focus:*`, `transition-*`

Example:

```tsx
<button
  className="w-full py-3 px-6 rounded-lg text-white font-medium text-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
>
  {/* ... */}
</button>
```

---

## 15. Extending the Style Guide

When you build new pages or components:

1. **Start from an existing pattern** in this guide before creating new ones.
2. If you need a new pattern (e.g. a new card type or layout):
   - Implement it in one page.
   - If it feels reusable, extract it into a shared component.
   - Update this `STYLE_GUIDE.md` with:
     - When to use it.
     - Example JSX and Tailwind classes.
3. Keep examples minimal but realistic.

This document should evolve with the product. When you notice duplication or inconsistency across pages, consolidate around one of the patterns here and extend the guide accordingly.
