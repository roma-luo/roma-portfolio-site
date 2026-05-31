/**
 * [slug]/page.tsx
 *
 * Serves every /project-slug URL with the same SPA shell as the root page.
 * DesktopCanvas reads window.location.pathname on mount and auto-expands
 * the matching project window — no server-side redirect needed.
 */
export { default } from '@/app/page';

export function generateStaticParams() {
  // Allow all slugs through during static export / ISR
  return [];
}
