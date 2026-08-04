/**
 * Build environment.
 *
 * Vercel sets VERCEL_ENV automatically on every build — "production", "preview",
 * or "development". Nothing to configure in the dashboard.
 *
 *   local `astro dev`  → undefined  → drafts visible
 *   branch push        → "preview"  → drafts visible, whole deployment noindex
 *   merge to main      → "production" → drafts excluded entirely
 *
 * `process.env`, not `import.meta.env`: static Astro builds run in Node, and Vite
 * only inlines values from .env files into import.meta.env — host system vars like
 * VERCEL_ENV aren't among them.
 *
 * Never expose this as PUBLIC_* — it must not reach the client bundle.
 */
export const IS_PRODUCTION_BUILD = process.env.VERCEL_ENV === "production";

/** Drafts render everywhere except the production build. */
export const SHOW_DRAFTS = !IS_PRODUCTION_BUILD;

/**
 * Any non-production build blocks itself, independent of Vercel's own
 * X-Robots-Tag on preview deployments. An indexed *.vercel.app copy is duplicate
 * content competing with listeningdevice.app, so this is deliberately redundant.
 */
export const NOINDEX = !IS_PRODUCTION_BUILD;
