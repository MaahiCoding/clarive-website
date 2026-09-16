// @ts-check
import { existsSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

/**
 * Wrap every markdown `<table>` in `<div class="table-scroll">`.
 *
 * global.css has styled `.prose-clarive .table-scroll { overflow-x: auto }`
 * since the blog was built, but **nothing ever applied the class** — markdown
 * emits a bare `<table>` and there was no rehype plugin. So the rule was dead
 * CSS, and every article with a table scrolled the whole page sideways on a
 * phone: measured at 375px, the document was 600px wide, so the h1, breadcrumb
 * and draft banner all ran off the left edge.
 *
 * `thead th` is `white-space: nowrap`, which is what makes it overflow rather
 * than merely look cramped — nowrap sets the table's min-content width to the
 * sum of its header cells (579px here), and `width: 100%` cannot shrink below
 * that. With no scroll container, that width lands on `<body>`.
 *
 * Written without `unist-util-visit` on purpose: it is only a transitive
 * dependency of Astro's markdown pipeline, so importing it here would break on
 * any install that hoists differently. A short walk has no such risk.
 */
function rehypeTableScroll() {
  /** Flatten a hast node to its text, for reading header labels. */
  const text = (node) =>
    node.type === 'text'
      ? node.value
      : (node.children || []).map(text).join('');

  /** Find the first descendant element with this tag name. */
  const find = (node, tag) => {
    if (node.type === 'element' && node.tagName === tag) return node;
    for (const c of node.children || []) {
      const hit = find(c, tag);
      if (hit) return hit;
    }
    return null;
  };

  /**
   * Copy each column's header onto its cells as `data-label`, so the phone
   * stylesheet can stack the table into labelled rows.
   *
   * A three-column comparison table in a 335px column wraps to one or two words
   * per line, which is unreadable — and this audience skews older and reads on a
   * phone. CSS alone cannot do this: stacked cells need to carry their own
   * header text, and markdown gives `<td>` no way to know which column it is in.
   */
  const label = (table) => {
    const head = find(table, 'thead');
    if (!head) return;
    const headers = (find(head, 'tr')?.children || [])
      .filter((c) => c.type === 'element' && c.tagName === 'th')
      .map((c) => text(c).trim());
    if (!headers.length) return;

    const body = find(table, 'tbody');
    for (const row of body?.children || []) {
      if (row.type !== 'element' || row.tagName !== 'tr') continue;
      let i = 0;
      for (const cell of row.children) {
        if (cell.type !== 'element' || cell.tagName !== 'td') continue;
        if (headers[i]) cell.properties = { ...cell.properties, dataLabel: headers[i] };
        i++;
      }
    }
  };

  return (tree) => {
    const walk = (node) => {
      if (!Array.isArray(node.children)) return;
      node.children = node.children.map((child) => {
        walk(child);
        if (child.type === 'element' && child.tagName === 'table') {
          label(child);
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['table-scroll'] },
            children: [child],
          };
        }
        return child;
      });
    };
    walk(tree);
  };
}

/**
 * Add `rel="nofollow"` to links pointing at competitor domains.
 *
 * Two different things get confused under "don't link competitors", and the
 * distinction decides which one this handles:
 *
 *   A product or App Store link  -> never publish one. It is a one-tap install
 *                                   button for a rival at the moment of intent.
 *                                   Name the app instead. slop_lint.py fails on it.
 *   A citation backing a number  -> keep it. The AirPods article's whole argument
 *                                   rests on measured scores from HearingUp,
 *                                   HearingTracker and Soundly, and
 *                                   claims-guardrails.md forbids uncited health
 *                                   facts. Removing the source does not make the
 *                                   claim ours, it makes it unsupported.
 *
 * So citations stay and stop passing link equity to a domain we are trying to
 * outrank. nofollow is the standard instrument for exactly this: the reader can
 * still verify the number, Google is told not to count the endorsement.
 */
const COMPETITOR_DOMAINS = [
  'hearingtracker.com',
  'soundly.com',
  'hearingup.com',
  'sorenson.com',
  'truhearing.com',
  'abilitycentral.org',
  'rnid.org.uk',
  'abilitynet.org.uk',
];

function rehypeCompetitorNofollow() {
  const isCompetitor = (href) =>
    typeof href === 'string' &&
    COMPETITOR_DOMAINS.some((d) => href.includes(d));

  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'a' && isCompetitor(node.properties?.href)) {
        const rel = new Set(String(node.properties.rel || '').split(/\s+/).filter(Boolean));
        rel.add('nofollow');
        rel.add('noopener');
        node.properties = { ...node.properties, rel: [...rel].join(' ') };
      }
      for (const child of node.children || []) walk(child);
    };
    walk(tree);
  };
}

/**
 * `<lastmod>` for every article in the sitemap.
 *
 * The sitemap carried `<loc>` alone, so an edited article looked no different
 * to Google from an untouched one and had no claim to an earlier recrawl.
 * `lastmod` is the one sitemap field Google says it reads, and only while it
 * stays honest, so it comes from the frontmatter: `updatedDate` when the post
 * has been touched, else `publishDate`. Never the build clock, which would
 * stamp every URL with today on every deploy and teach Google to ignore it.
 *
 * Read with a regex rather than the content collection because this runs in
 * astro.config, where `astro:content` does not exist. Both dates are unquoted
 * `YYYY-MM-DD` in every post (mark_published.py writes them), and the sitemap
 * package accepts that string and normalises it to ISO.
 *
 * Only `/blog/<slug>/` gets one; every other page is left without rather than
 * given a fake date. And the item is always returned: a `serialize` that
 * returns nothing DROPS the URL (@astrojs/sitemap checks `if (serialized)`),
 * and one that throws skips writing the sitemap altogether.
 */
const POST_URL = /^https:\/\/listeningdevice\.app\/blog\/([^/]+)\/$/;

/** @param {string} slug */
function postLastmod(slug) {
  const file = new URL(`./src/content/blog/${slug}.md`, import.meta.url);
  if (!existsSync(file)) return undefined;
  const front = readFileSync(file, 'utf8').split(/^---$/m)[1] ?? '';
  return front.match(/^updatedDate:\s*(\d{4}-\d{2}-\d{2})/m)?.[1]
    ?? front.match(/^publishDate:\s*(\d{4}-\d{2}-\d{2})/m)?.[1];
}

// https://astro.build/config
export default defineConfig({
  site: 'https://listeningdevice.app',
  // Pairs with build.format 'directory' (the default), as Astro's docs advise,
  // and with "trailingSlash": true in vercel.json. On a static site this only
  // bites in `astro dev` (301 to the slash form) and `astro preview` (404
  // without it); the production redirect is Vercel's.
  trailingSlash: 'always',
  integrations: [
    sitemap({
      serialize(item) {
        const slug = item.url.match(POST_URL)?.[1];
        const lastmod = slug && postLastmod(slug);
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
  ],
  markdown: {
    rehypePlugins: [rehypeTableScroll, rehypeCompetitorNofollow],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
