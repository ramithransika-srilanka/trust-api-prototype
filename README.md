# Product page prototype

A static e-commerce product page (PDP) built with plain HTML, CSS and JavaScript. There is no build step.

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

## What's included
- Sticky black header with nav, search/account/cart icons and a cart count badge
- Two-column product gallery with a sticky info panel: title, price, installment line, payment badges, colour swatches, size selector (sold-out sizes are disabled), add to cart, product details accordion, returns note
- "You may also like" carousel with arrow controls and colour-swatch product cards
- Footer with a full-width wordmark, newsletter signup, link columns, socials and tagline
- Floating live-chat button, add-to-cart toast, mobile layout (hamburger menu, swipeable gallery)

## Images
Photos live in `assets/products/` and the logo in `assets/logo.png`. Image paths are set in `script.js`: an `images` array (front, lifestyle, detail, back) on each colour in `product.colors`, and an `image` on each item in `related`.

Each image sits on top of an SVG garment illustration. If a file is missing, the illustration shows instead. These paths are referenced but the files aren't added yet:
- `assets/products/urban-classic-black.webp`
- `assets/products/urban-stripe-black.webp`
- `assets/products/luxe-olive.webp`
