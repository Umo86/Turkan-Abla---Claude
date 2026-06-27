# Landing Page — Binding Decisions (OVERRIDE the plan)

The plan file `docs/superpowers/plans/2026-06-27-landing-page.md` contains
starter code that is WRONG about this codebase in four systematic ways.
These corrections OVERRIDE the plan's code wherever they conflict. Apply
them in every task.

## 1. No new layout / no `(landing)` route group

- A root layout already exists at `src/app/layout.tsx` and defines `<html>`
  and `<body>` (with `globals.css` imported, Tailwind active).
- Next.js forbids a second root layout. Do NOT create
  `src/app/(landing)/layout.tsx`. Do NOT create a `(landing)` route group.
- The landing page is the site root. **REPLACE the existing boilerplate
  `src/app/page.tsx`** with the landing page. Do not create a duplicate `/`
  route (that is a build error).

## 2. Component location

- All landing components go in `src/components/landing/`.
- The page at `src/app/page.tsx` imports from `@/components/landing/...`.

## 3. Correct route paths for CTAs (NO `/app/` prefix)

The real routes in this repo are:
- Customer signup: `/auth/signup/customer`   (NOT `/app/auth/signup/customer`)
- Vendor signup:   `/auth/signup/vendor`
- Customer home/browse: `/home`               (NOT `/app/home`)
- Category browse: `/home?category=<Category>` (NOT `/app/home?...`)

Replace every `/app/...` link in the plan with the corrected path above.

## 4. The existing `Button` does NOT support `asChild`

`src/components/ui/button.tsx` is a plain `<button>` wrapper. Its props are
`variant?: 'primary' | 'secondary' | 'outline'`, `size?: 'sm'|'md'|'lg'`,
`fullWidth?: boolean`. There is NO `asChild`, and NO `default`/`ghost`
variants.

Therefore:
- For navigation / CTA links, do NOT use `<Button asChild><Link/></Button>`.
  Instead render a Next.js `<Link>` styled with Tailwind button classes
  directly. Example:

  ```tsx
  import Link from 'next/link';

  <Link
    href="/auth/signup/customer"
    className="inline-flex items-center justify-center h-12 px-8 rounded-lg text-lg font-semibold text-white bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 transition-all"
  >
    Book Now
  </Link>
  ```

- For a real form submit button (e.g. the contact form), use the existing
  `<Button type="submit" fullWidth>` component (no `asChild`, no `className`
  reliance for variant — use the `variant`/`size`/`fullWidth` props, extra
  Tailwind via `className` is fine since it's appended).

## 5. Metadata

- If you want a page title/description, export `metadata` from
  `src/app/page.tsx` (a server component). Do NOT add `<html>`/`<head>` tags.
- If a component uses hooks/state/handlers (`useState`, `onClick`, `onChange`,
  `onSubmit`) it must start with `'use client';`. Purely static sections can
  stay server components. `src/app/page.tsx` itself can remain a server
  component that renders the (client where needed) section components.

## 6. Verification per task

- Run `npm run dev` and confirm the page compiles with no errors and the new
  section renders. There are no unit tests for presentational sections; the
  acceptance check is: compiles, renders, links point to the corrected paths,
  responsive at 375px and 1440px.
- Keep the color palette warm (amber/orange/rose/cream) as in the plan.
