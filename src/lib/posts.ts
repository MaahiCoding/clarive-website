import { getCollection, type CollectionEntry } from "astro:content";
import { SHOW_DRAFTS } from "./env";
import { CLUSTERS, type ClusterId } from "../content.config";

export type Post = CollectionEntry<"blog">;

/**
 * THE draft gate. Every route reads posts through here — never call
 * getCollection("blog") directly.
 *
 * Single source of truth on purpose: the classic version of this bug is a draft
 * correctly hidden from /blog but still listed in sitemap-0.xml. Because the
 * sitemap integration only ever sees pages that actually got built, excluding
 * drafts here excludes them from the sitemap too, with nothing to keep in sync.
 */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", ({ data }) => SHOW_DRAFTS || !data.draft);
  return posts.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

export async function getPostsByCluster(cluster: ClusterId): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return posts.filter((p) => p.data.cluster === cluster);
}

/** Clusters that actually have posts — empty hubs are thin pages, so we don't build them. */
export async function getActiveClusters(): Promise<{ id: ClusterId; count: number }[]> {
  const posts = await getPublishedPosts();
  return (Object.keys(CLUSTERS) as ClusterId[])
    .map((id) => ({ id, count: posts.filter((p) => p.data.cluster === id).length }))
    .filter((c) => c.count > 0);
}

/**
 * Explicit relatedSlugs first (the pipeline sets these from the internal link
 * map), then same-cluster siblings to fill the row. Never returns the post itself.
 */
export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const posts = await getPublishedPosts();
  const pool = posts.filter((p) => p.id !== post.id);

  const explicit = post.data.relatedSlugs
    .map((slug) => pool.find((p) => p.id === slug))
    .filter((p): p is Post => Boolean(p));

  const sameCluster = pool.filter(
    (p) => p.data.cluster === post.data.cluster && !explicit.some((e) => e.id === p.id),
  );

  return [...explicit, ...sameCluster].slice(0, limit);
}

/** Trailing slash, to match Astro's directory output and the sitemap. */
export const postUrl = (id: string) => `/blog/${id}/`;
export const clusterUrl = (id: ClusterId) => `/blog/topics/${id}/`;

/** 200 wpm, rounded up. Close enough, and readers only use it as a rough signal. */
export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Headings for the table of contents. Astro's own heading extraction from
 * render() is preferred where available; this is the fallback for raw body text.
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function isoDate(date: Date): string {
  return date.toISOString();
}
