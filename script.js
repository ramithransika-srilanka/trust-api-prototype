// ---------- Data ----------
// To use real photography, add an `images` array (4 URLs) to a color, or an
// `image` URL to a related product. The SVG illustrations show underneath and
// stay visible if an image file is missing.
const product = {
  colors: [
    { name: "Sheer White", body: "#f3f1ec", trim: "#141414",
      images: ["front", "lifestyle", "detail", "back"].map((v) => `assets/products/monaco-white-${v}.webp`) },
    { name: "Jet Black", body: "#1b1b1b", trim: "#f3f1ec",
      images: ["assets/products/monaco-black-front.webp"] },
  ],
  sizes: ["S", "M", "L", "XL", "XXL"],
  soldOut: { "Jet Black": ["XXL"] },
};

const related = [
  { name: "Urban Edge Knit Polo", variant: "Navy", price: 6450, image: "assets/products/urban-edge-navy.webp", body: "#f3f1ec", trim: "#f3f1ec", sleeve: "#1d2c57", stripes: "#1d2c57", polo: true,
    swatches: ["#1d3461", "#f5f5f5", "#4e8a1e", "#7a2e3a", "#1b1b1b", "#ededed"] },
  { name: "Urban Classic Knit Polo", variant: "Jet Black", price: 5950, image: "assets/products/urban-classic-black.webp", body: "#1b1b1b", trim: "#1b1b1b", sleeveBand: "#f3f1ec", polo: true, zip: true,
    swatches: ["#1b1b1b", "#f5f5f5", "#f0f0f0", "#9aa1b1", "#4e8a1e", "#1d3461"] },
  { name: "Urban Stripe Knit Tee", variant: "Jet Black", price: 5950, image: "assets/products/urban-stripe-black.webp", body: "#1b1b1b", trim: "#1b1b1b", stripes: "#f3f1ec",
    swatches: ["#1b1b1b", "#3a3f55", "#f5f5f5", "#1d3461"] },
  { name: "Luxe Knit Polo", variant: "Olive", price: 6250, image: "assets/products/luxe-olive.webp", body: "#5d6644", trim: "#5d6644", polo: true, texture: true,
    swatches: ["#4e8a1e", "#1b1b1b", "#6b4a35"] },
  { name: "Riviera Knit Polo", variant: "Sand", price: 6450, body: "#d8c7a8", trim: "#3b2f25", polo: true,
    swatches: ["#d8c7a8", "#1b1b1b", "#f5f5f5"] },
  { name: "Monaco Rib Tee", variant: "Stone", price: 5450, body: "#b9b4ab", trim: "#b9b4ab", texture: true,
    swatches: ["#b9b4ab", "#1b1b1b", "#1d3461"] },
];

const fmt = (n) => "LKR " + n.toLocaleString("en-US", { minimumFractionDigits: 2 });

// ---------- SVG garment illustrations ----------
let uid = 0;
function garment(opts, view = "front", fit = "slice") {
  const { body, trim, sleeve = body, stripes, sleeveBand, polo = true, zip, texture, bg = "#e8e8e8" } = opts;
  const id = "g" + uid++;
  const shirt = "M150 70 L210 52 Q240 78 270 52 L330 70 L400 140 L360 185 L335 165 L335 380 L145 380 L145 165 L120 185 L80 140 Z";
  const sleeves = "M150 70 L80 140 L120 185 L145 165 Z M330 70 L400 140 L360 185 L335 165 Z";
  const defs = `<defs>
      <clipPath id="${id}c"><path d="${shirt}"/></clipPath>
      <pattern id="${id}t" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="4" r="1.3" fill="#000" opacity="0.18"/></pattern>
      <linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0.12"/>
        <stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.14"/></linearGradient>
    </defs>`;

  const stripeEls = stripes
    ? `<g clip-path="url(#${id}c)" fill="${stripes}">
        <rect x="190" y="40" width="14" height="360"/><rect x="214" y="40" width="7" height="360"/>
        <rect x="262" y="40" width="7" height="360"/><rect x="279" y="40" width="14" height="360"/></g>`
    : "";
  const bandEls = sleeveBand
    ? `<path d="M88 148 L126 188 M96 140 L132 180 M392 148 L354 188 M384 140 L348 180" stroke="${sleeveBand}" stroke-width="4"/>`
    : "";
  const collar = polo
    ? view === "back"
      ? `<path d="M196 56 Q240 74 284 56 L276 72 Q240 86 204 72 Z" fill="${trim}"/>`
      : `<path d="M210 52 L240 112 L270 52 L292 60 L262 98 L240 128 L218 98 L188 60 Z" fill="${trim}"/>
         <path d="M226 60 L240 112 L254 60 Z" fill="${body}"/>
         ${zip ? `<path d="M240 112 L240 160" stroke="#888" stroke-width="2"/>` : ""}`
    : `<path d="M208 54 Q240 86 272 54" stroke="${trim === body ? "#0003" : trim}" stroke-width="7" fill="none"/>`;

  const garmentSvg = `
    <path d="${shirt}" fill="${body}"/>
    <path d="${sleeves}" fill="${sleeve}"/>
    ${texture ? `<path d="${shirt}" fill="url(#${id}t)"/>` : ""}
    ${stripeEls}${bandEls}
    <path d="${shirt}" fill="url(#${id}s)"/>
    <path d="M145 372 H335" stroke="#0002" stroke-width="6"/>
    ${collar}`;

  if (view === "detail") {
    return `<svg viewBox="0 0 480 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${defs}
      <rect width="480" height="400" fill="#d9d4cc"/>
      <g transform="translate(-520 -160) scale(2.6)">${garmentSvg}</g>
      <path d="M300 300 q14 -14 26 0 t26 0 t24 -4" stroke="${trim}" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`;
  }
  const scene = view === "lifestyle"
    ? `<rect width="480" height="400" fill="#cfcac2"/><rect y="250" width="480" height="150" fill="#b8b3ab"/>
       <ellipse cx="380" cy="300" rx="140" ry="60" fill="#a9a49c"/>`
    : `<rect width="480" height="400" fill="${bg}"/>`;
  return `<svg viewBox="0 0 480 400" preserveAspectRatio="xMidYMid ${fit}" xmlns="http://www.w3.org/2000/svg">${defs}
    ${scene}<g transform="translate(0 10)">${garmentSvg}</g></svg>`;
}

const media = (img, fallback, alt = "") =>
  fallback + (img ? `<img class="photo" src="${img}" alt="${alt}" loading="lazy" onerror="this.remove()">` : "");

// ---------- Product gallery & options ----------
const state = { color: 0, size: "S" };
const $ = (s) => document.querySelector(s);

function renderGallery() {
  const c = product.colors[state.color];
  // Colours with photos show just their photos (a single photo is paired with a
  // zoomed crop of itself); colours without photos show the four drawn views.
  const names = ["front", "lifestyle", "detail", "back"];
  let shots = c.images?.length
    ? c.images.map((src, i) => ({ src, view: names[i] || "front" }))
    : names.map((view) => ({ view }));
  if (shots.length === 1) shots.push({ src: shots[0].src, view: "detail", crop: true });
  const views = shots.map((s) => s.view);
  $("#gallery").innerHTML = shots
    .map((s) => `<div class="shot${s.crop ? " crop" : ""}">${media(s.src, garment({ ...c, bg: "#e6e6e6" }, s.view), `${c.name} — ${s.view}`)}</div>`)
    .join("");
  $("#gallery").scrollLeft = 0;
  $("#galleryDots").hidden = views.length < 2;
  $("#galleryDots").innerHTML = views
    .map((_, i) => `<button class="${i ? "" : "active"}" data-i="${i}" aria-label="Image ${i + 1}"></button>`)
    .join("");
}

// Mobile gallery: dots follow the swipe position and jump on tap
$("#gallery").addEventListener("scroll", () => {
  const g = $("#gallery");
  const i = Math.round(g.scrollLeft / g.clientWidth);
  document.querySelectorAll("#galleryDots button").forEach((d, j) => d.classList.toggle("active", i === j));
}, { passive: true });
$("#galleryDots").addEventListener("click", (e) => {
  const d = e.target.closest("button");
  if (d) $("#gallery").scrollTo({ left: d.dataset.i * $("#gallery").clientWidth, behavior: "smooth" });
});

function renderSwatches() {
  $("#colorSwatches").innerHTML = product.colors
    .map((c, i) => `<button class="${i === state.color ? "active" : ""}" data-i="${i}" aria-label="${c.name}">
        ${media(c.images?.[0], garment({ ...c, bg: "#efefef" }))}</button>`)
    .join("");
  $("#colorName").textContent = product.colors[state.color].name;
  updateBuyBar();
}

function updateBuyBar() {
  $("#mobileBuyMeta").textContent = `LKR 6,450.00 · ${product.colors[state.color].name} / ${state.size}`;
}

function renderSizes() {
  const sold = product.soldOut[product.colors[state.color].name] || [];
  if (sold.includes(state.size)) state.size = product.sizes.find((s) => !sold.includes(s));
  $("#sizes").innerHTML = product.sizes
    .map((s) => `<button class="${s === state.size ? "active" : ""}" ${sold.includes(s) ? "disabled" : ""}>${s}</button>`)
    .join("");
}

$("#colorSwatches").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  state.color = +btn.dataset.i;
  renderSwatches();
  renderSizes();
  renderGallery();
});

$("#sizes").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn || btn.disabled) return;
  state.size = btn.textContent;
  renderSizes();
  updateBuyBar();
});

// ---------- Cart ----------
let cartCount = 2;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 2200);
}
function addToCart() {
  cartCount++;
  const badge = $("#cartCount");
  badge.textContent = cartCount;
  badge.classList.add("bump");
  setTimeout(() => badge.classList.remove("bump"), 200);
  toast(`Added Urban Monaco Knit Polo — ${product.colors[state.color].name} / ${state.size}`);
}
$("#addToCart").addEventListener("click", addToCart);
$("#mobileAddToCart").addEventListener("click", addToCart);

// Mobile: show the sticky buy bar once the main button has scrolled above the viewport
new IntersectionObserver(([entry]) => {
  const on = !entry.isIntersecting && entry.boundingClientRect.top < 0;
  $("#mobileBuy").classList.toggle("show", on);
  document.body.classList.toggle("buybar-on", on && matchMedia("(max-width: 900px)").matches);
}).observe($("#addToCart"));

// ---------- Related carousel ----------
const carousel = $("#carousel");
carousel.innerHTML = related
  .map((p) => `<a href="#" class="card">
      <div class="card-img">${media(p.image, garment({ ...p, bg: "#e9eaec" }, "front", "meet"), p.name)}</div>
      <div class="card-swatches">${p.swatches.map((s) => `<span style="background:${s}"></span>`).join("")}</div>
      <h3>${p.name}</h3>
      <p class="variant">${p.variant}</p>
      <p class="card-price">${fmt(p.price)}</p>
    </a>`)
  .join("");

const prev = $("#prevBtn");
const next = $("#nextBtn");
function updateArrows() {
  prev.disabled = carousel.scrollLeft <= 2;
  next.disabled = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 2;
}
const step = () => carousel.querySelector(".card").offsetWidth + parseFloat(getComputedStyle(carousel).columnGap);
prev.addEventListener("click", () => carousel.scrollBy({ left: -step() }));
next.addEventListener("click", () => carousel.scrollBy({ left: step() }));
carousel.addEventListener("scroll", updateArrows, { passive: true });
window.addEventListener("resize", updateArrows);

// ---------- Mobile menu ----------
const toggle = $(".menu-toggle");
toggle.addEventListener("click", () => {
  const open = $(".main-nav").classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
  document.body.classList.toggle("menu-open", open);
});

// ---------- Newsletter ----------
$("#signupForm").addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.reset();
  $("#signupMsg").hidden = false;
});

// ---------- Check trust ----------
// Steps: "start" (Check the truth) -> "email" (Send OTP) -> "code" (checks itself once all
// six digits are in) -> "verified" (Truth + mic buttons) -> "checked" (after the chat).
// Sending and verifying are placeholders until a backend is connected.
const trust = { step: "start", email: "" };
// Demo code accepted until the trust service is connected
const TRUST_DEMO_CODE = "111111";
const trustBtn = $("#checkTrust");
// The code is typed into six single-digit boxes; this wraps them so the
// steps below can treat them like one input.
const codeBoxes = [...document.querySelectorAll(".otp-box")];
const codeField = {
  get value() { return codeBoxes.map((b) => b.value).join(""); },
  set value(v) { codeBoxes.forEach((b, i) => (b.value = v[i] || "")); },
  set tabIndex(t) { codeBoxes.forEach((b) => (b.tabIndex = t)); },
  focus() { (codeBoxes.find((b) => !b.value) || codeBoxes[codeBoxes.length - 1]).focus(); },
  setAttribute(name, v) { codeBoxes.forEach((b) => b.setAttribute(name, v)); },
  addEventListener(type, fn) { codeBoxes.forEach((b) => b.addEventListener(type, fn)); },
};

const trustSteps = {
  email: { box: $("#trustEmail"), input: $("#trustEmailInput"), error: $("#trustEmailError"), label: "Send OTP" },
  code: { box: $("#trustCode"), input: codeField, error: $("#trustCodeError"), label: "" },
};
const trustLinks = [$("#trustChangeEmail"), $("#trustResend")];

function setTrustError(step, msg) {
  const { input, error } = trustSteps[step];
  error.textContent = msg;
  input.setAttribute("aria-invalid", msg ? "true" : "false");
}

function showTrustStep(step) {
  trust.step = step;
  for (const [name, s] of Object.entries(trustSteps)) {
    const on = name === step;
    s.box.classList.toggle("open", on);
    s.box.setAttribute("aria-hidden", on ? "false" : "true");
    s.input.tabIndex = on ? 0 : -1;
  }
  trustLinks.forEach((l) => (l.tabIndex = step === "code" ? 0 : -1));
  // The code step has no button: it verifies itself.
  trustBtn.hidden = step === "code";
  trustBtn.textContent = trustSteps[step].label;
  setTimeout(() => trustSteps[step].input.focus(), 250);
}

// Fake a network call: show a busy label, then run the callback
function trustBusy(label, done) {
  trustBtn.disabled = true;
  trustBtn.textContent = label;
  setTimeout(() => {
    trustBtn.disabled = false;
    trustBtn.textContent = trustSteps[trust.step].label;
    done();
  }, 600);
}

function sendOtp() {
  trustBusy("Sending…", () => {
    $("#trustSentTo").textContent = trust.email;
    codeField.value = "";
    setTrustError("code", "");
    showTrustStep("code");
  });
}

$("#trustForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (trustBtn.disabled) return;

  if (trust.step === "start") return showTrustStep("email");

  if (trust.step === "email") {
    const email = trustSteps.email.input.value.trim();
    if (!email) return setTrustError("email", "Please enter your email address.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setTrustError("email", "Please enter a valid email address.");
    setTrustError("email", "");
    trust.email = email;
    return sendOtp();
  }

  // Enter in the code boxes checks the code too.
  verifyCode();
});

// ---------- Code check ----------
// Runs as soon as all six digits are in (typed, pasted or autofilled).
const codeStatus = $("#trustCodeStatus");
let verifying = false;
function verifyCode() {
  if (verifying) return;
  const code = codeField.value;
  if (!/^\d{6}$/.test(code)) return setTrustError("code", "Please enter the 6-digit code.");
  if (code !== TRUST_DEMO_CODE) {
    // Clear the boxes so the shopper can type the code again straight away
    codeField.value = "";
    codeBoxes[0].focus();
    return setTrustError("code", "That code isn't right. Check your email and try again.");
  }
  setTrustError("code", "");
  verifying = true;
  codeStatus.textContent = "Verifying…";
  codeBoxes.forEach((b) => (b.readOnly = true));
  setTimeout(() => {
    verifying = false;
    codeStatus.textContent = "";
    codeBoxes.forEach((b) => (b.readOnly = false));
    showTruthRow();
  }, 700);
}

// ---------- Truth + mic buttons ----------
const truthRow = $("#truthRow");
const truthOpen = $("#truthOpen");
const truthLabel = $("#truthLabel");

function foldTrustSteps() {
  for (const s of Object.values(trustSteps)) {
    s.box.classList.remove("open");
    s.box.setAttribute("aria-hidden", "true");
    s.input.tabIndex = -1;
  }
  trustLinks.forEach((l) => (l.tabIndex = -1));
}

function showTruthRow() {
  trust.step = "verified";
  foldTrustSteps();
  trustBtn.hidden = true;
  truthRow.hidden = false;
  truthOpen.focus();
}

// The first time, the product page is covered by the overlay until the shopper is back;
// after that the chat just opens.
function openTruthChat() {
  const win = openTruthWindow();
  if (!win) return toast("Please allow pop-ups for this site to open the truth check.");
  showTruthChat(win, { overlay: trust.step === "verified" });
}
truthOpen.addEventListener("click", openTruthChat);
// Voice isn't connected yet, so the mic opens the same chat.
$("#truthMic").addEventListener("click", openTruthChat);

// Opened inside the click so pop-up blockers allow it; the chat loads into it afterwards.
function openTruthWindow() {
  const win = window.open("", "trustCheck", "width=480,height=680");
  if (win) win.document.title = "Check the truth";
  return win;
}

// The first time, the product page is covered by the overlay until the shopper is back.
// Reopening from "Truth checked" just opens the chat, with no overlay.
function showTruthChat(win, { overlay = true } = {}) {
  if (win.closed) return;
  const q = new URLSearchParams({ email: trust.email, color: product.colors[state.color].name, size: state.size });
  win.location.href = `trust.html?${q}`;
  if (overlay) openTrustOverlay(win);
}

// Back on the product page after the chat, the long button says so.
const ACCOUNT_AVATAR = "assets/avatar.webp";
const TICK = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 12.5L10 17.5L19 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function markTruthChecked() {
  trust.step = "checked";
  truthLabel.innerHTML = `<span>Truth checked</span>${TICK}`;
}

// ---------- Trust check window + overlay ----------
const trustOverlay = $("#trustOverlay");
let trustWin = null;
let trustWatch = null;

function openTrustOverlay(win) {
  trustWin = win;
  trustOverlay.hidden = false;
  document.body.classList.add("trust-overlay-open");
  trustOverlay.focus();
  // Hide the overlay whenever the window is closed, however it was closed
  clearInterval(trustWatch);
  trustWatch = setInterval(() => trustWin.closed && closeTrustOverlay(), 500);
}

function closeTrustOverlay() {
  clearInterval(trustWatch);
  trustOverlay.hidden = true;
  document.body.classList.remove("trust-overlay-open");
  trustWin = null;
  markTruthChecked();
}

// The trust window reports how it ended before closing
window.addEventListener("message", (e) => {
  if (!trustWin || e.source !== trustWin) return;
  if (e.data?.type === "trust-complete") {
    closeTrustOverlay();
    toast("Truth check complete");
  } else if (e.data?.type === "trust-cancelled") {
    closeTrustOverlay();
  }
});

for (const step of Object.keys(trustSteps)) {
  trustSteps[step].input.addEventListener("input", () => trustSteps[step].error.textContent && setTrustError(step, ""));
}
// Fill digits into the boxes starting at `from`, then focus the box after them
function fillCode(from, digits) {
  digits.split("").forEach((d, k) => codeBoxes[from + k] && (codeBoxes[from + k].value = d));
  if (trustSteps.code.error.textContent) setTrustError("code", "");
  codeBoxes[Math.min(from + digits.length, codeBoxes.length - 1)].focus();
  if (codeField.value.length === codeBoxes.length) verifyCode();
}
codeBoxes.forEach((box, i) => {
  box.addEventListener("input", () => {
    const digits = box.value.replace(/\D/g, "");
    box.value = "";
    // More than one digit means a paste or one-time-code autofill
    if (digits) fillCode(i, digits.slice(0, codeBoxes.length - i));
  });
  box.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !box.value && i > 0) {
      e.preventDefault();
      codeBoxes[i - 1].value = "";
      codeBoxes[i - 1].focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      codeBoxes[i - 1].focus();
    } else if (e.key === "ArrowRight" && i < codeBoxes.length - 1) {
      e.preventDefault();
      codeBoxes[i + 1].focus();
    }
  });
  box.addEventListener("paste", (e) => {
    e.preventDefault();
    const digits = (e.clipboardData?.getData("text") || "").replace(/\D/g, "");
    if (digits) fillCode(i, digits.slice(0, codeBoxes.length - i));
  });
  box.addEventListener("focus", () => box.select());
});
$("#trustChangeEmail").addEventListener("click", () => showTrustStep("email"));
$("#trustResend").addEventListener("click", () => !trustBtn.disabled && sendOtp());

renderSwatches();
renderSizes();
renderGallery();
updateArrows();
