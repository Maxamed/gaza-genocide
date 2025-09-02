Perfect—let’s wire your pages with **share-perfect metadata**. Two key points first:

* **Social crawlers don’t run JS.** All titles/descriptions/OG images must be **static in `<head>`** at build time.
* You can keep this **fully static on GitHub Pages**.

Below are copy-pasteable snippets and a clean structure you can reuse on every page.

---

# 1) Global `<head>` base (put on every page)

```html
<!-- Required basics -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Gaza Tracker — Human Scale</title>
<meta name="description" content="A bilingual memorial and data project: names, timelines, and human-scale context for lives lost in Gaza." />
<link rel="canonical" href="https://your-domain.com/" />

<!-- Favicons -->
<link rel="icon" href="/favicons/favicon.ico" sizes="any" />
<link rel="icon" type="image/svg+xml" href="/favicons/icon.svg" />
<link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#ffffff" />

<!-- Preconnect to fonts (if using Google Fonts) -->
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<!-- Your font CSS link here -->

<!-- Basic SEO -->
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
```

---

# 2) Open Graph + Twitter Card (reusable block)

> Put this **once per page**, with page-specific values.

```html
<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Gaza Tracker" />
<meta property="og:title" content="Gaza Tracker — Memorial & Data" />
<meta property="og:description" content="Numbers become human: names, timelines, and comparisons that show the true scale." />
<meta property="og:url" content="https://your-domain.com/" />
<meta property="og:image" content="https://your-domain.com/og/og-home-1200x630.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="en_US" />
<meta property="og:locale:alternate" content="ar_AR" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Gaza Tracker — Memorial & Data" />
<meta name="twitter:description" content="Numbers become human: names, timelines, and comparisons that show the true scale." />
<meta name="twitter:image" content="https://your-domain.com/og/og-home-1200x630.png" />
<!-- Optional handles -->
<!-- <meta name="twitter:site" content="@yourhandle" />
<meta name="twitter:creator" content="@yourhandle" /> -->
```

**Tip:** Even if your site “has no images,” you should still provide a **clean OG image** for social cards (white background, your title in Arabic/English). It won’t appear on the page—only in previews.

---

# 3) JSON-LD (structured data)

Add to **home page**:

```html
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"WebSite",
  "name":"Gaza Tracker",
  "url":"https://your-domain.com/",
  "inLanguage":["en","ar"]
}
</script>
```

Add to **organization/about page** (if you have one):

```html
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"Organization",
  "name":"Gaza Tracker",
  "url":"https://your-domain.com/",
  "logo":"https://your-domain.com/favicons/icon-512.png",
  "sameAs":[]
}
</script>
```

---

# 4) Per-page examples (fill these and you’re done)

### a) Memorial Wall (`/memorial.html`)

```html
<title>Memorial Wall — Names in Memoriam | Gaza Tracker</title>
<meta name="description" content="A bilingual roll of names — searchable and filterable — honoring every life lost." />
<link rel="canonical" href="https://your-domain.com/memorial.html" />
<meta property="og:title" content="Memorial Wall — Names in Memoriam" />
<meta property="og:description" content="A bilingual roll of names — searchable and filterable — honoring every life lost." />
<meta property="og:url" content="https://your-domain.com/memorial.html" />
<meta property="og:image" content="https://your-domain.com/og/og-memorial-1200x630.png" />
<meta name="twitter:title" content="Memorial Wall — Names in Memoriam" />
<meta name="twitter:description" content="A bilingual roll of names — searchable and filterable — honoring every life lost." />
<meta name="twitter:image" content="https://your-domain.com/og/og-memorial-1200x630.png" />
```

### b) Press Memorial (`/press.html`)

```html
<title>Press Memorial — Journalists & Media Workers | Gaza Tracker</title>
<meta name="description" content="Honoring journalists and media workers killed — names, outlets, and circumstances." />
<link rel="canonical" href="https://your-domain.com/press.html" />
<meta property="og:title" content="Press Memorial — Journalists & Media Workers" />
<meta property="og:description" content="Honoring journalists and media workers killed — names, outlets, and circumstances." />
<meta property="og:url" content="https://your-domain.com/press.html" />
<meta property="og:image" content="https://your-domain.com/og/og-press-1200x630.png" />
<meta name="twitter:title" content="Press Memorial — Journalists & Media Workers" />
<meta name="twitter:description" content="Honoring journalists and media workers killed — names, outlets, and circumstances." />
<meta name="twitter:image" content="https://your-domain.com/og/og-press-1200x630.png" />
```

### c) Press Roll (`/press-roll.html`)

```html
<title>Press Roll — Credits-Style Scroll | Gaza Tracker</title>
<meta name="description" content="Credits-style memorial scroll of journalists and media workers." />
<link rel="canonical" href="https://your-domain.com/press-roll.html" />
<meta property="og:title" content="Press Roll — Credits-Style Scroll" />
<meta property="og:description" content="Credits-style memorial scroll of journalists and media workers." />
<meta property="og:url" content="https://your-domain.com/press-roll.html" />
<meta property="og:image" content="https://your-domain.com/og/og-press-roll-1200x630.png" />
<meta name="twitter:title" content="Press Roll — Credits-Style Scroll" />
<meta name="twitter:description" content="Credits-style memorial scroll of journalists and media workers." />
<meta name="twitter:image" content="https://your-domain.com/og/og-press-roll-1200x630.png" />
```

---

# 5) Arabic pages (hreflang + language)

If you ship Arabic versions (recommended), set `lang` & `dir` on `<html>` and cross-link with `hreflang`:

```html
<!-- On /index.html (English) -->
<link rel="alternate" href="https://your-domain.com/index.ar.html" hreflang="ar" />
<link rel="alternate" href="https://your-domain.com/" hreflang="en" />
<meta property="og:locale" content="en_US" />
<meta property="og:locale:alternate" content="ar_AR" />

<!-- On /index.ar.html (Arabic) -->
<html lang="ar" dir="rtl">
<link rel="alternate" href="https://your-domain.com/" hreflang="en" />
<link rel="alternate" href="https://your-domain.com/index.ar.html" hreflang="ar" />
<meta property="og:locale" content="ar_AR" />
<meta property="og:locale:alternate" content="en_US" />
```

---

# 6) OG image strategy (you said “no images” on-site—this is different)

* Create simple, **white** 1200×630 PNGs in `/og/`:

  * `og-home-1200x630.png` — bilingual title + subtle subline
  * `og-memorial-1200x630.png`
  * `og-press-1200x630.png`
  * `og-press-roll-1200x630.png`
* Keep text large, high contrast, same fonts as site.
* Add **`og:image:alt`** for accessibility if you want:

  ```html
  <meta property="og:image:alt" content="Gaza Tracker — Memorial & Data" />
  ```

*(If you later want “dynamic” OG images for specific facts, you’ll need a build step to pre-generate PNGs; social bots won’t run client JS.)*

---

# 7) robots.txt + sitemap (tiny but important)

* `/robots.txt`

  ```
  User-agent: *
  Allow: /
  Sitemap: https://your-domain.com/sitemap.xml
  ```

* `/sitemap.xml` (handwritten or generated; list your static pages)

---

# 8) Reuse as a partial (optional)

If you enable Jekyll (default on GitHub Pages), put the OG/Twitter block in `_includes/meta.html` and set **front matter** per page:

```html
---
title: "Memorial Wall — Names in Memoriam"
description: "A bilingual roll of names — searchable and filterable — honoring every life lost."
permalink: /memorial.html
image: /og/og-memorial-1200x630.png
lang: en
---

{% include meta.html %}
```
 