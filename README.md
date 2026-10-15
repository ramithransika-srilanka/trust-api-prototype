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
Product imagery is rendered as SVG garment illustrations. To use real photos, add an `images` array (front, lifestyle, detail, back) to each colour in `product.colors`, or an `image` URL to each item in `related`, in `script.js`.
