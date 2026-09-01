/**
 * App Store rating — the single source of truth.
 *
 * Both the visible stars (components/Reviews.astro) and the AggregateRating
 * JSON-LD (layouts/Base.astro) read from here, so they cannot drift apart.
 *
 * They HAD drifted: the schema said 6 ratings while the live listing had moved
 * to 7. Google requires an aggregateRating to reflect the real, visible rating,
 * so a stale count risks losing the rich result — and the count moves on its own
 * every time a user rates the app, which is exactly the kind of number nobody
 * remembers to update by hand.
 *
 * Refresh with `uv run tools/sync_rating.py` in clarive-seo, which reads the
 * iTunes lookup API and rewrites this file. Never edit the numbers by hand.
 */
export interface AppRating {
  /** Rounded DOWN to one decimal. Never round up: 4.67 is not 4.7 to Apple. */
  value: string;
  /** Ratings count, not review count. Meaningless without this. */
  count: string;
  /** ISO date this was last pulled from the App Store. */
  checked: string;
}

export const appRating: AppRating = {
  value: "4.7",
  count: "7",
  checked: "2026-09-01",
};

/** Star-bar fill, so the visual matches the number rather than a guessed width. */
export const ratingPercent = `${((parseFloat(appRating.value) / 5) * 100).toFixed(1)}%`;
