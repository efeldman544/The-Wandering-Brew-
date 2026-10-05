# The Wandering Brew

Website for The Wandering Brew — a small craft brewery brewing one-off batches since 2023.

Live at **[thewanderingbrew.co.il](https://thewanderingbrew.co.il)**

## What's here

A static site. No build step, no dependencies, no framework.

```
index.html              the whole page (markup + CSS inline)
img/bottle-*.png        product shots, one per beer
og.jpg                  social share image (1200x630)
favicon.svg             browser tab icon
apple-touch-icon.png    iOS home screen icon
robots.txt              crawler rules + sitemap pointer
sitemap.xml             one entry; add a <url> per page as pages are added
```

## ⚠ Not launched

This site is **not ready for public launch**. `robots.txt` disallows all
crawling and `index.html` carries `<meta name="robots" content="noindex,
nofollow">`.

**To actually take it offline**, do one of these in Vercel — the repo cannot do
it, since the repo only controls what gets served, not whether it is served:

| Approach | Effect |
|---|---|
| Settings → Deployment Protection → Vercel Authentication | Stays deployed, only you can view it. **Most reversible.** |
| Settings → Domains → remove the domain | Frees `thewanderingbrew.co.il`; the `*.vercel.app` URL stays live |
| Settings → delete the project | Removes everything, including the domain link |
| Remove the DNS records at the registrar | Fastest kill, but DNS caches can keep it reachable for a while |

**When launching**, reverse the three things above: drop `Disallow: /`, restore
the `Sitemap:` line, and delete the `noindex` meta tag.

## Age gate

An 18+ confirmation covers the page on first visit and is remembered in
`localStorage` under `twb-age-ok`.

It is deliberately **opt-out, not opt-in**: an inline script in `<head>` adds
`needs-age-check` to `<html>` only when no prior confirmation is stored, and CSS
shows the overlay off that class. So there is no flash for returning visitors,
and visitors without JavaScript — including search crawlers — get the page
rather than a wall they cannot dismiss. If a stricter gate is ever required,
invert it: show the overlay by default and remove it with script.

## Analytics

Vercel Web Analytics and Speed Insights are wired via first-party script tags
(`/_vercel/insights`, `/_vercel/speed-insights`). No npm dependency. **They only
collect once enabled in the Vercel dashboard** under the project's Analytics and
Speed Insights tabs — until then the scripts 404 harmlessly.

## Deploying

Vercel serves this as-is. Import the repo at vercel.com and take the defaults:

- Framework preset: **Other**
- Build command: *none*
- Output directory: *root*

Every push to `main` redeploys.

## Domain

`thewanderingbrew.co.il` is attached in Vercel under **Settings → Domains**. Vercel
shows the exact DNS records to add at the registrar when the domain is added —
use those values rather than any copied from documentation, as they change.

## Editing

Everything lives in `index.html`. The palette is defined once as CSS custom
properties at the top, sampled from the bottle labels:

| Token | Colour | From |
|---|---|---|
| `--orchid` | `#C15CD6` | "JERUSALEM" |
| `--cyan` | `#35AAD3` | "SYNDROME" |
| `--gold` | `#D9AB41` | the brewery tag |
| `--teal` | `#1C7F92` | corner mark |
| `--orange` / `--peach` | `#E2611E` / `#FAD9B4` | King of the Hill |
| `--navy` / `--coral` | `#16385A` / `#EF625D` | Pour Decisions |
| `--cosmic` / `--fire` | `#241640` / `#EE4A20` | The Wandering Brew |

Beers are in release order, newest first. Each is one `<article class="beer">`
that sets its own `--bg`, `--fg` and `--accent`.

### Still to do

- **Confirm the contact details** — `hello@thewanderingbrew.co.il` and
  `instagram.com/thewanderingbrew` are assumed, not verified
- **Jerusalem Syndrome's ABV and style** (currently `TBC`)
- **Photography** — there is none. No brewery, no people, no beer in a glass.
  Only bottles on flat colour.
- **Hebrew / RTL** — the site is English-only on a `.co.il` domain
- **A page per beer** — the labels' QR codes say "scan me to learn more" and
  currently have nowhere to point
