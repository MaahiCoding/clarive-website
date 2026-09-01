---
title: "Pipeline self test, safe to delete"
description: "A disposable article used once to prove the publish-on-merge workflow flips the draft flag and stamps the date. Deleted immediately after."
keyword: "pipeline self test"
secondaryKeywords: []
cluster: "iphone-hearing"
intent: "definition"
publishDate: 2026-09-01
author: "Mahipal"
shortAnswer: "This article exists only to test the publishing automation end to end. It carries an old publish date on purpose, so that a correct run visibly rewrites it to today. It is removed as soon as the test passes."
takeaways:
  - "This page is a test artifact and is deleted straight after."
  - "Its publishDate starts at 2020-01-01 so a correct stamp is obvious."
  - "It starts as draft true, so a correct run flips it to false."
faq:
  - q: "What is this page for?"
    a: "It exists only to prove the publish-on-merge automation works end to end, and it is deleted immediately after the test passes."
  - q: "Why does it start with an old date?"
    a: "The publishDate begins at 2020-01-01 so that a correct run visibly rewrites it to today rather than leaving it untouched."
  - q: "Why does it start as a draft?"
    a: "A draft produces no route in production, so the test proves the workflow flipped the flag rather than the page simply being live already."
  - q: "Will this ever be indexed?"
    a: "No. It is removed within minutes, long before any search engine would crawl it."
relatedSlugs: []
draft: false
---

This article exists only to prove the publish automation works. It is deleted immediately after.
