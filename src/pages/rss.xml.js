import rss from "@astrojs/rss";
import { getPublishedPosts, postUrl } from "../lib/posts";
import { SITE } from "../lib/schema";

export async function GET() {
  const posts = await getPublishedPosts();

  return rss({
    title: "Clarive Blog",
    description:
      "Practical guides on hearing conversations more easily: iPhone audio settings, live captions, listening devices, and honest app comparisons.",
    site: SITE,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: postUrl(post.id),
      categories: [post.data.cluster],
      author: post.data.author,
    })),
    customData: "<language>en-us</language>",
  });
}
