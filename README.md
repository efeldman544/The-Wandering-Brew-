# The Wandering Brew

Website for The Wandering Brew — a small craft brewery brewing one-off batches since 2023.

Live at **[thewanderingbrew.co.il](https://thewanderingbrew.co.il)**

## What's here

A static site. No build step, no dependencies, no framework.

```
index.html              the whole page (markup + CSS inline)
checkout.html           the order page, standalone
img/bottle-*.png        product shots, one per beer
og.jpg                  social share image (1200x630)
favicon.svg             browser tab icon
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

## Ordering

Jerusalem Syndrome has an **Add to cart** button; the other three carry a
**Sold out** chip instead. To put a beer on sale, give it the same `.buy`
block that Jerusalem Syndrome has in `index.html` (the `data-add` value is its
id) and add a matching entry to `PRODUCTS` at the bottom of `checkout.html`.
To take one off sale, swap the block back for the sold-out chip — the id can
stay in `PRODUCTS`, it just stops being reachable.

The cart lives in `localStorage` under `twb-cart`, as `{id: bottles}`. It is
per-browser and never leaves the visitor's machine until they send the order.

`checkout.html` collects a name, phone and optional email and notes, writes the
order out as plain text, and opens the visitor's mail app addressed to
`info@thewanderingbrew.co.il`. The same text is shown on the page with a copy
button, because `mailto:` does not fire reliably on every phone. **Nothing is
charged and no card details are handled anywhere.**

Prices are deliberately absent. `checkout.html` has:

```js
var PRICE = null;
```

Set it to a price per bottle in shekels and a per-line price and an order total
appear by themselves; leave it `null` and the page stays an order request.

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

- A price per bottle, if you want one shown before people order (`PRICE`)
- The stockist map id (`MAP_ID`)
- A pickup address, if you would rather state one than arrange it per order
- Photography — there are no shots of the brewery, people, or beer in a glass
