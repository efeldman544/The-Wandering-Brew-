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
```

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

### Still to fill in

- Jerusalem Syndrome's ABV and style (currently `TBC`)
- Real stockists in the "Find us" section (currently placeholder rows)
- The contact email and Instagram handle
