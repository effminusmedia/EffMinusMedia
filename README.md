# EFF MINUS landing page — v1

Single-page, mobile-first landing page with two treatments using the same markup:

- Treatment A (black/white): open `index.html`
- Treatment B (restrained red): open `index.html?variant=red`

## Assets

The page uses `eff-minus-primary-mark.png` beside `index.html`, taken from the primary black-and-white mark and wordmark in the supplied brand board. Its dark panel background was made transparent so the white artwork sits directly on the page; the slogan is omitted. The red grade-book variation is not used as the primary mark.

The black video stage starts directly below the logo and fills the remaining viewport. Social links sit above the service line at the bottom of that stage. The bottom-right “Contact Us” link opens email; small clickable phone and email details sit directly underneath it. When the montage is ready, put it at `assets/eff-minus-hero.mp4` and uncomment the `<source>` line in `index.html`.

This is deliberately a small static foundation. New pages can share `styles.css` and the common header/contact conventions as the site grows.
