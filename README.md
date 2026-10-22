# The Wandering Brew

Website for The Wandering Brew — a small craft brewery brewing one-off batches since 2023.

Live at **[thewanderingbrew.co.il](https://thewanderingbrew.co.il)**

## What's here

A static site. No build step, no dependencies, no framework.

```
index.html              the whole page (markup + CSS inline)
checkout.html           the order page, standalone
api/order.js            serverless function, emails an order to the brewery
img/bottle-*.png        product shots, one per beer
og.jpg                  social share image (1200x630)
favicon-32.png          browser tab icon
favicon-16.png          browser tab icon, small
apple-touch-icon.png    iOS home screen icon
```

## Age gate

An 18+ confirmation covers the page on first visit, remembered in
`localStorage` under `twb-age-ok`.

It is **opt-out**: an inline script in `<head>` adds `needs-age-check` to
`<html>` only when no prior confirmation is stored, and the overlay is shown off
that class. So returning visitors get no flash, and visitors without JavaScript
— search crawlers included — get the page rather than a wall they cannot
dismiss. The trade-off is that disabling JavaScript bypasses it. To make it
strict, invert it: show the overlay by default and remove it with script.

## Deploying

Vercel serves this as-is. Import the repo at vercel.com and take the defaults:

- Framework preset: **Other**
- Build command: *none*
- Output directory: *root*

Every push to `main` redeploys.

If a push does not produce a deployment, check the project's Deployments tab
before assuming the push failed: `git ls-remote origin refs/heads/main` shows
what GitHub actually has, and the GitHub Deployments API lists what Vercel
picked up. A push can land on `main` with no deployment created at all, which
means the webhook was missed rather than the build failing. Redeploy from the
dashboard, or push again.

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
| `--gold` | `#D9AB41` | the brewery tag, and the corner blob |
| `--teal` | `#1C7F92` | corner mark |
| `--orange` / `--peach` | `#E2611E` / `#FAD9B4` | King of the Hill |
| `--navy` / `--coral` | `#16385A` / `#EF625D` | Pour Decisions |
| `--cosmic` / `--fire` | `#241640` / `#EE4A20` | The Wandering Brew |

Beers are in release order, newest first. Each is one `<article class="beer">`
that sets its own `--bg`, `--fg` and `--accent`.

## Ordering

Jerusalem Syndrome has an **Add to cart** button; the other three carry a
**Sold out** chip instead. To put a beer on sale, give it the same `.buy`
block that Jerusalem Syndrome has in `index.html` (the `data-add` value is its
id) and add a matching entry to `PRODUCTS` at the bottom of `checkout.html`.
To take one off sale, swap the block back for the sold-out chip — the id can
stay in `PRODUCTS`, it just stops being reachable.

The cart lives in `localStorage` under `twb-cart`, as `{id: bottles}`. It is
per-browser and never leaves the visitor's machine until they send the order.

`checkout.html` collects a name, phone and optional email and notes, then POSTs
the order to `/api/order`, which emails it to `info@thewanderingbrew.co.il`.
**Nothing is charged and no card details are handled anywhere.**

If that call fails for any reason — no API key set, the mail provider down, the
visitor offline — the page falls back to opening their own mail app with the
order already written out, and shows the same text with a copy button. An order
is never lost because the endpoint is having a bad day.

### Sending mail

`api/order.js` is a Vercel serverless function; any file under `/api` is picked
up automatically, so there is still no build step. It sends through
[Resend](https://resend.com). Set one environment variable in the Vercel
project (Settings → Environment Variables), then redeploy:

| Variable | |
|---|---|
| `RESEND_API_KEY` | **required** — an API key from resend.com |
| `ORDER_TO` | optional — defaults to `info@thewanderingbrew.co.il` |
| `ORDER_FROM` | optional — defaults to `onboarding@resend.dev` |

Until `RESEND_API_KEY` exists the endpoint answers `503 not-configured` and the
page quietly uses the mail-app fallback, so deploying this before setting the
key changes nothing for visitors.

An environment variable only reaches a **new** build. Saving one in Vercel does
nothing to the site already running, so a variable has to be followed by either
a redeploy from the dashboard or any push to `main`.

Resend will only send from a domain you have verified. Two ways to start:

- **Now, no DNS.** Sign up at resend.com using `info@thewanderingbrew.co.il` as
  the account address. Unverified accounts can send from `onboarding@resend.dev`
  to the account's own address, which is exactly where orders go.
- **Properly.** Add `thewanderingbrew.co.il` as a domain in Resend, put the DNS
  records it gives you on the domain, then set
  `ORDER_FROM="The Wandering Brew <orders@thewanderingbrew.co.il>"`. Orders then
  arrive from your own domain rather than Resend's.

The function keeps its own copy of the catalogue and the price, and works out
every figure in the email from that. Prices are never read from the browser, so
a tampered page cannot change what an order claims to cost. Quantities are
capped at 24 a line. A hidden `company` field catches form bots: anything that
fills it gets a cheerful `200` and no email.

Prices live in two places, both of which have to agree:

```js
// checkout.html
var PRICE = 18;       // what a bottle costs today
var FULL_PRICE = 20;  // struck through beside it; null ends the sale
```

```html
<!-- index.html, the specs row on Jerusalem Syndrome -->
<div><span class="k">Price</span><span class="v"><s>&#8362;20</s> &#8362;18</span></div>
```

Setting `PRICE` to `null` removes every price from the checkout and leaves it a
plain order request; you would take the specs row out of `index.html` to match.

Ordering sits behind the same age check as the rest of the site — reaching
`checkout.html` without a stored confirmation sends you back to the front page.

## Stockist map

"Find us" can show a Google My Maps embed with a pin on every shop carrying the
beer. It is **off until you give it a map**, so nothing broken is shown:

1. Go to [google.com/mymaps](https://www.google.com/mymaps) and make a map.
2. Drop a pin on each shop.
3. Set the map to **Anyone with the link**.
4. **Share → Embed on my site**, and copy the value of `mid=` out of the iframe
   Google hands you.
5. Paste it into `MAP_ID` in the last `<script>` of `index.html`.

After that, adding a shop is a pin on the map — nothing in this repo changes.

### Still to fill in

- The stockist map id (`MAP_ID`)
- A pickup address, if you would rather state one than arrange it per order
- Photography — there are no shots of the brewery, people, or beer in a glass
