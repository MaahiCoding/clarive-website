import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Cluster slugs. These are the topical hubs at /blog/topics/<cluster>/ and they
 * mirror seo/clusters.md in the clarive-seo repo. Adding one here means adding
 * it to CLUSTERS below too.
 */
export const CLUSTER_IDS = [
  "listening-devices",
  "iphone-hearing",
  "live-captions",
  "situations",
  "hearing-health",
  "comparisons",
] as const;

export type ClusterId = (typeof CLUSTER_IDS)[number];

/**
 * `blurb` is on-page intro copy and stays short. `metaDescription` is the SERP
 * snippet and wants 120-155 chars. They were the same string, which made every
 * hub's meta description too short for Google to use well.
 */
export const CLUSTERS: Record<ClusterId,
  { title: string; blurb: string; metaDescription: string }> = {
  "listening-devices": {
    title: "Listening devices",
    blurb: "What assistive listening devices are, how they work, and how a phone fits in.",
    metaDescription:
      "Assistive listening devices explained: personal amplifiers, venue loop systems, and where an iPhone genuinely replaces dedicated hardware.",
  },
  "iphone-hearing": {
    title: "iPhone hearing tools",
    blurb: "Live Listen, accessibility settings, and the audio features already on your phone.",
    metaDescription:
      "Guides to the hearing tools already on your iPhone: Live Listen, Hearing Aid mode, and accessibility audio settings, plus what each one requires.",
  },
  "live-captions": {
    title: "Live captions",
    blurb: "Reading speech as it happens, on calls, on TV, and in the room.",
    metaDescription:
      "Live captions on iPhone: reading speech as it happens on calls, on TV, and in the room, and how accurate on-device transcription really is.",
  },
  situations: {
    title: "Situations",
    blurb: "Restaurants, meetings, lectures, TV, travel. The places hearing gets hard.",
    metaDescription:
      "Practical guides for the places hearing gets hard: restaurants, meetings, lectures, TV and travel, with what actually helps in each one.",
  },
  "hearing-health": {
    title: "Hearing health",
    blurb: "Plain explanations of the basics, with sources. Not medical advice.",
    metaDescription:
      "Plain explanations of hearing health basics, cited to NIDCD and WHO. Background reading, not medical advice, and no substitute for an audiologist.",
  },
  comparisons: {
    title: "Comparisons",
    blurb: "Honest side-by-sides of the apps and tools available on iPhone.",
    metaDescription:
      "Side-by-side comparisons of iPhone hearing apps and Apple's built-in tools, tested in real rooms rather than summarized from other reviews.",
  },
};

/** Search intent drives the article template. Set by gate 2 of write_article.md. */
export const INTENTS = [
  "how-to",
  "definition",
  "comparison",
  "list",
  "troubleshooting",
  "buying-guide",
] as const;

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.md" }),
  schema: ({ image }) =>
    z.object({
      /** Also the <h1>. Keep under 60 chars so the SERP title doesn't truncate. */
      title: z.string().min(10).max(70),
      /** Meta description. Google truncates around 155. */
      description: z.string().min(50).max(160),

      // --- SEO targeting -------------------------------------------------
      /** Primary keyword, pulled from seo/keyword-backlog.csv. One per article. */
      keyword: z.string().min(2),
      secondaryKeywords: z.array(z.string()).default([]),
      cluster: z.enum(CLUSTER_IDS),
      intent: z.enum(INTENTS),

      // --- Dates ---------------------------------------------------------
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),

      // --- Author (E-E-A-T) ----------------------------------------------
      author: z.string().default("Mahipal"),

      // --- Images --------------------------------------------------------
      /**
       * Optional for now: compose_hero.py (Phase 3) generates these. Until then
       * the article falls back to a CSS gradient card on-page and the site
       * og-image for social. article_qa.py requires a real hero before publish.
       */
      heroImage: image().optional(),
      heroAlt: z.string().min(10).optional(),

      // --- Article structure ---------------------------------------------
      /** The 40–60 word answer directly under the H1. Snippet + AI Overview bait. */
      shortAnswer: z.string().min(120).max(600),
      takeaways: z.array(z.string()).min(3).max(5),
      /** Mirrored verbatim into FAQPage JSON-LD. Visible text must match byte for byte. */
      faq: z
        .array(z.object({ q: z.string().min(8), a: z.string().min(30) }))
        .min(4)
        .max(8),

      // --- Linking -------------------------------------------------------
      relatedSlugs: z.array(z.string()).default([]),

      // --- Publishing ----------------------------------------------------
      /** Defaults to true: nothing reaches production unless explicitly cleared. */
      draft: z.boolean().default(true),
    })
      .refine((d) => !d.heroImage || d.heroAlt, {
        message: "heroAlt is required whenever heroImage is set",
        path: ["heroAlt"],
      })
      .refine((d) => !d.updatedDate || d.updatedDate >= d.publishDate, {
        message: "updatedDate cannot be before publishDate",
        path: ["updatedDate"],
      }),
});

export const collections = { blog };
