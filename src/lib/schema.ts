/**
 * JSON-LD builders. Everything here must describe something a visitor can
 * actually see on the page — invented ratings or authors are a structured-data
 * violation, not a shortcut.
 *
 * Note: no aggregateRating on articles. That belongs to the home page's
 * SoftwareApplication block only, where the visible Reviews section backs it.
 */

export const SITE = "https://listeningdevice.app";
export const APP_URL =
  "https://apps.apple.com/us/app/listening-device-clarive/id6748903280";
export const LINKEDIN = "https://www.linkedin.com/in/ios-mahipal/";

export const person = (name: string) => ({
  "@type": "Person",
  name,
  url: `${SITE}/about/`,
  jobTitle: "iOS Product Engineer",
  sameAs: [LINKEDIN],
});

export const organization = {
  "@type": "Organization",
  name: "Harshva Technology Private Limited",
  url: SITE,
};

export function blogPosting(opts: {
  title: string;
  description: string;
  url: string;
  author: string;
  publishDate: Date;
  updatedDate?: Date;
  image?: string;
  keywords?: string[];
  section?: string;
  wordCount?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    mainEntityOfPage: { "@type": "WebPage", "@id": opts.url },
    author: person(opts.author),
    publisher: organization,
    datePublished: opts.publishDate.toISOString(),
    dateModified: (opts.updatedDate ?? opts.publishDate).toISOString(),
    ...(opts.image && {
      image: { "@type": "ImageObject", url: opts.image, width: 1200, height: 630 },
    }),
    ...(opts.keywords?.length && { keywords: opts.keywords.join(", ") }),
    ...(opts.section && { articleSection: opts.section }),
    ...(opts.wordCount && { wordCount: opts.wordCount }),
    inLanguage: "en",
    isAccessibleForFree: true,
  };
}

export function breadcrumbList(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqPage(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function collectionPage(opts: {
  name: string;
  description: string;
  url: string;
  items: { title: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: opts.items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.title,
        url: item.url,
      })),
    },
  };
}

export function profilePage(name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: { ...person(name), description },
  };
}

/**
 * Hearing-health trigger words. Any article containing one must carry the
 * medical disclaimer — see clarive-seo/product/claims-guardrails.md.
 */
const DISCLAIMER_TRIGGERS = /\b(hearing loss|hearing aid|hearing aids|audiologist|tinnitus|deafness)\b/i;

export function needsDisclaimer(opts: {
  cluster: string;
  title: string;
  description: string;
  body: string;
}): boolean {
  if (opts.cluster === "hearing-health" || opts.cluster === "comparisons") return true;
  return DISCLAIMER_TRIGGERS.test(`${opts.title} ${opts.description} ${opts.body}`);
}
