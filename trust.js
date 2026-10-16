// Trust check chat: the store answers what a shopper is unsure about before buying —
// fit, their past purchase, how it looks and feels, what others say, durability.
// It never sells: no cart, no checkout. Scripted until the trust service is connected.

const params = new URLSearchParams(location.search);
const shopper = {
  email: params.get("email") || "",
  color: params.get("color") || "Sheer White",
  size: params.get("size") || "M",
};

const PRODUCT = {
  name: "Urban Monaco Knit Polo",
  price: "LKR 6,450.00",
  store: "Carnage",
  photos: {
    "Sheer White": ["assets/products/monaco-white-front.webp", "assets/products/monaco-white-lifestyle.webp", "assets/products/monaco-white-detail.webp"],
    "Jet Black": ["assets/products/monaco-black-front.webp"],
  },
};
const photosFor = (color) => PRODUCT.photos[color] || PRODUCT.photos["Sheer White"];

// The shopper's earlier order, used for the fit check and their own review.
const PAST = {
  name: "Urban Edge Knit Polo",
  color: "Navy",
  size: "M",
  when: "August",
  photo: "assets/products/urban-edge-navy.webp",
  review: "Fits well through the shoulders and the collar still sits flat after a lot of washes. Sleeves are a little snug on me.",
};

// What other shoppers have said since launch, summarised (no names). A concern is only
// mentioned when it is serious; minor ones stay out of the summary.
const OTHERS = {
  likes: [
    "The collar sits flat all day and doesn't curl",
    "Soft, light knit that's comfortable in the heat",
    "True to size for most people",
    "Looks smart enough for dinners, not just casual days",
  ],
  concerns: [{ text: "The white is slightly see-through in strong sun", serious: false }],
};
const seriousConcerns = OTHERS.concerns.filter((c) => c.serious);

// Authenticity, provenance and the seller's track record. Sample figures until the
// trust service is connected.
const SELLER = {
  name: "Carnage",
  batch: { "Sheer White": "MNK-0926-SW", "Jet Black": "MNK-0926-JB" },
  provenance: (color) => [
    ["Sold by", "Carnage, the brand itself"],
    ["Batch", SELLER.batch[color] || SELLER.batch["Sheer White"]],
    ["Made in", "Sri Lanka"],
    ["Knitted", "September 2026"],
    ["Yarn", "Cotton blend"],
    ["Released", "8 October 2026"],
  ],
  reliability: [
    ["On-time shipping", "96.8% of orders"],
    ["Not as described", "0.6% of orders"],
    ["Disputes settled in", "2.4 days avg."],
    ["Refund or exchange", "93% of disputes"],
  ],
  // Friends of the shopper who have recommended this seller as trustworthy.
  friendsRecommending: 2,
};

const SIZES = ["S", "M", "L", "XL", "XXL"];
const sizeStep = (size, by) => SIZES[Math.min(SIZES.length - 1, Math.max(0, SIZES.indexOf(size) + by))];

// ---------- Thread rhythm (same timings as the Personal Store chat) ----------
const TYPE_MIN_MS = 450;
const TYPE_MAX_MS = 1200;
const TYPE_MS_PER_CHAR = 9;
const CARD_TYPE_MS = 800;
const AFTER_MS = 220;
const REPLY_PAUSE_MS = 350;
const CHOICE_STAGGER = 50;

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
const log = document.getElementById("log");
const typingTime = (m) => (m.kind ? CARD_TYPE_MS : Math.min(TYPE_MAX_MS, TYPE_MIN_MS + (m.text?.length || 0) * TYPE_MS_PER_CHAR));

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

function scrollDown() {
  log.scrollTo({ top: log.scrollHeight, behavior: reduced ? "auto" : "smooth" });
}

// Consecutive messages from the same side share a group.
let lastGroup = null;
function group(from) {
  if (!lastGroup || lastGroup.dataset.from !== from) {
    lastGroup = el("div", from === "me" ? "msgs msgs--me" : "msgs");
    lastGroup.dataset.from = from;
    log.appendChild(lastGroup);
  }
  return lastGroup;
}

function photoEl(src, label) {
  const img = el("img", "chat__photo");
  img.src = src;
  img.alt = label;
  img.tabIndex = 0;
  img.setAttribute("role", "button");
  img.setAttribute("aria-label", `View ${label}`);
  return img;
}

// Builds one message: plain text, or one of the cards (photos, review).
function render(m) {
  if (m.kind === "photos") {
    const row = el("div", "photos enter");
    m.photos.forEach((p) => row.appendChild(photoEl(p.src, p.label)));
    return row;
  }
  if (m.kind === "review") {
    const card = el("div", "review enter");
    card.append(el("p", "review__text", `“${m.text}”`), el("p", "review__meta", m.who));
    return card;
  }
  if (m.kind === "facts") {
    const card = el("div", "review facts enter");
    card.appendChild(el("p", "review__heading facts__title", m.title));
    const dl = el("dl", "facts__rows");
    m.rows.forEach(([k, v]) => dl.append(el("dt", "", k), el("dd", "", v)));
    card.appendChild(dl);
    return card;
  }
  if (m.kind === "summary") {
    const card = el("div", "review review--summary enter");
    const section = (title, items, cls) => {
      if (!items.length) return;
      card.appendChild(el("p", "review__heading", title));
      const ul = el("ul", `review__list ${cls}`);
      items.forEach((i) => ul.appendChild(el("li", "", i)));
      card.appendChild(ul);
    };
    section("What people like", m.likes, "review__list--good");
    section("Worth knowing", m.concerns, "review__list--bad");
    return card;
  }
  return el("p", `bubble bubble--${m.from} enter`, m.text);
}

let busy = Promise.resolve();
let typingEl = null;
// The conversation plays itself: the shopper's side answers on its own (see AUTOPLAY).
// It stops as soon as the shopper types, and the chat waits on them from then on.
let auto = true;

// The store sends its messages one by one, "typing" before each, then offers replies.
function send(messages, choices) {
  busy = busy.then(async () => {
    clearChoices();
    await wait(REPLY_PAUSE_MS);
    for (const m of messages) {
      typingEl = el("p", "bubble bubble--bot bubble--typing enter");
      typingEl.setAttribute("aria-label", "Typing");
      typingEl.innerHTML = "<span></span><span></span><span></span>";
      group("bot").appendChild(typingEl);
      scrollDown();
      await wait(typingTime(m));
      typingEl.replaceWith(render({ from: "bot", ...m }));
      typingEl = null;
      scrollDown();
      await wait(AFTER_MS);
    }
    if (choices) showChoices(choices);
  });
  return busy;
}

function say(text) {
  clearChoices();
  group("me").appendChild(render({ from: "me", text }));
  scrollDown();
}

// ---------- Quick replies ----------
let choiceRow = null;
function clearChoices() {
  choiceRow?.remove();
  choiceRow = null;
}
function showChoices(choices) {
  clearChoices();
  // While the chat plays itself, only the final way out is shown.
  if (auto && !choices.some((c) => c.final)) return;
  choiceRow = el("div", "options");
  choiceRow.setAttribute("role", "group");
  choiceRow.setAttribute("aria-label", "Replies");
  choices.forEach((c, i) => {
    const b = el("button", `option enter${c.done ? " option--done" : ""}`, c.label);
    b.style.setProperty("--d", `${i * CHOICE_STAGGER}ms`);
    b.addEventListener("click", () => {
      say(c.label);
      c.run();
    });
    choiceRow.appendChild(b);
  });
  log.appendChild(choiceRow);
  lastGroup = null;
  scrollDown();
}

// ---------- What the store can help with ----------
const covered = new Set();
const TOPICS = [
  { id: "trust", label: "Is the seller legit?", run: () => trustSeller() },
  { id: "feel", label: "What's the shirt like?", run: () => lookAndFeel() },
  { id: "others", label: "What are people saying?", run: () => othersSay() },
  { id: "durable", label: "Will it last?", run: () => durability() },
  { id: "fit", label: "What size should I get?", run: () => fitCheck() },
  { id: "past", label: "How did I rate my last one?", run: () => pastReview() },
];
const DONE = { label: "That's everything, thanks", done: true, run: () => finish() };

// The size the fit check lands on, for the wrap-up recap.
let recommendedSize = null;

// After each answer: the topics not covered yet, and a way out.
const nextChoices = () => [...TOPICS.filter((t) => !covered.has(t.id)), DONE];
const t = (text) => ({ text });
// While the chat plays itself the shopper just asks the next thing; when they're
// steering, the store checks in after each answer.
const checkIn = () => (auto ? [] : [t("Anything else on your mind?")]);

// ---------- The seller ----------
function trustSeller() {
  covered.add("trust");
  send(
    [
      t(`Totally legit. It's sold by ${SELLER.name} themselves, not a reseller.`),
      { kind: "facts", title: "Where this shirt comes from", rows: SELLER.provenance(shopper.color) },
      t("Little tip: the batch code is on the label inside the collar, so you can match it to your receipt."),
      ...(auto ? [] : [t(`Want to see how reliable ${SELLER.name} is?`)]),
    ],
    [
      { label: "Yes, show me", run: () => sellerRecord() },
      { label: "No, I'm good", run: () => send([t("Sure thing. Anything else on your mind?")], nextChoices()) },
    ],
  );
}

function sellerRecord() {
  covered.add("trust");
  send(
    [
      t("Pretty solid track record over the last year:"),
      { kind: "facts", title: `${SELLER.name} as a seller`, rows: SELLER.reliability },
      t("And if anything's off, they reply within a day. Most issues end in a refund or exchange."),
      t(`Oh, and ${SELLER.friendsRecommending} of your friends have recommended ${SELLER.name} as a seller you can trust.`),
      ...checkIn(),
    ],
    nextChoices(),
  );
}

function conditionAnswer() {
  send(
    [
      t("Yep, brand new. Not used or refurbished, so there's no condition to grade."),
      t("And returns are free if it's not right."),
      ...checkIn(),
    ],
    nextChoices(),
  );
}

// ---------- The product ----------
function lookAndFeel() {
  covered.add("feel");
  const pics = photosFor(shopper.color);
  send(
    [
      t("It's a fine-gauge knit: soft, light and breathable, with a bit of stretch."),
      {
        kind: "photos",
        photos: pics.slice(0, 3).map((src, i) => ({ src, label: `${PRODUCT.name}, photo ${i + 1}` })),
      },
      t(
        shopper.color === "Jet Black"
          ? "Jet Black is a deep, flat black with a cream open collar."
          : "Sheer White is more of a warm off-white than a bright white, with a black open collar.",
      ),
      t("Up close the weave has a subtle waffle texture, and there's a little script embroidered on the sleeve."),
      ...checkIn(),
    ],
    nextChoices(),
  );
}

function othersSay() {
  covered.add("others");
  send(
    [
      t("It only dropped last week, so there are just a few reviews. Here's the gist:"),
      { kind: "summary", likes: OTHERS.likes, concerns: seriousConcerns.map((c) => c.text) },
      t(seriousConcerns.length ? "Mostly good, but worth keeping that in mind." : "No real complaints so far."),
      ...checkIn(),
    ],
    nextChoices(),
  );
}

function durability() {
  covered.add("durable");
  send(
    [
      t("Honestly? It launched last week, so there hasn't been enough time to know how it holds up."),
      t(`It's the same knit family as your ${PAST.name} though, and you said that collar still sat flat after loads of washes.`),
      t("To keep it nice: wash cold, inside out, and dry it flat."),
      ...checkIn(),
    ],
    nextChoices(),
  );
}

// ---------- The fit ----------
function fitCheck() {
  covered.add("fit");
  send(
    [
      t(`Let's compare it with something you already own. You got the ${PAST.name} in ${PAST.color}, size ${PAST.size}, back in ${PAST.when}.`),
      { kind: "photos", photos: [{ src: PAST.photo, label: `${PAST.name} in ${PAST.color}` }] },
      t("How did that one fit you?"),
    ],
    [
      { label: "Perfect fit", run: () => fitAdvice(0) },
      { label: "A bit tight", run: () => fitAdvice(1) },
      { label: "A bit loose", run: () => fitAdvice(-1) },
    ],
  );
}

function fitAdvice(by) {
  const rec = sizeStep(PAST.size, by);
  recommendedSize = rec;
  const lines = [
    t("Same regular cut on both, so that's a good guide."),
    t(
      by === 0
        ? `Stick with ${rec}. It'll sit just like your Urban Edge: close on the shoulders, straight through the body.`
        : by > 0
          ? `I'd go up to ${rec}. The knit has a bit of stretch, but not enough to fix a snug fit.`
          : `I'd go down to ${rec}. This knit relaxes a little with wear, so loose gets looser.`,
    ),
    t(shopper.size !== rec ? `You've got ${shopper.size} picked on the product page, so switch it to ${rec}.` : "That's the size you already picked, so you're set."),
    ...checkIn(),
  ];
  send(lines, nextChoices());
}

function pastReview() {
  covered.add("past");
  send(
    [
      t(`Here's what you said about the ${PAST.name}:`),
      { kind: "review", text: PAST.review, who: `Your review · ${PAST.color}, size ${PAST.size}` },
      t("Good news: the sleeves are cut a touch roomier on this one, so that snug feeling shouldn't come back."),
      ...checkIn(),
    ],
    nextChoices(),
  );
}

// ---------- Wrap-up ----------
function finish() {
  const recap = [
    covered.has("trust") && "it's genuine and from a reliable seller your friends vouch for",
    covered.has("feel") && "the knit is soft and breathable",
    recommendedSize && `${recommendedSize} is your size`,
  ].filter(Boolean);
  // "a and b", or "a, b, and c"
  const list =
    recap.length > 2
      ? `${recap.slice(0, -1).join(", ")}, and ${recap.at(-1)}`
      : recap.join(" and ");
  send(
    [
      ...(recap.length ? [t(`Quick recap: ${list}.`)] : []),
      t("Hope it's the one! Your product page is ready whenever you are."),
    ],
    [{ label: "Back to the product", done: true, final: true, run: () => closeWith("trust-complete") }],
  );
}

// Typed questions are routed to the closest topic.
// Trust questions are split three ways: delivery and disputes go to the seller's record,
// used / condition questions get the condition answer, the rest to authenticity.
// A word ending in "!" must match as a whole phrase ("is it real" but not "is it really").
const ROUTES = [
  { run: () => sellerRecord(), words: ["deliver", "shipping", "ship it", "arrive", "on time", "dispute", "refund", "return", "complain", "reliab", "not as described", "friend", "recommend"] },
  { run: () => conditionAnswer(), words: ["used", "refurb", "second hand", "secondhand", "condition", "flaw", "defect", "damage", "scratch"] },
  { run: () => trustSeller(), words: ["genuine", "is it real!", "real one", "real product", "fake", "authentic", "original", "counterfeit", "seller", "trust", "legit", "scam", "batch", "origin", "made in", "where is it made", "supply"] },
  { run: () => durability(), words: ["durab", "last", "wash", "shrink", "pill", "fade", "hold up", "long"] },
  { run: () => fitCheck(), words: ["fit", "size", "tight", "loose", "small", "large", "big", "measure"] },
  { run: () => pastReview(), words: ["past", "before", "previous", "bought", "my review", "order", "urban edge"] },
  { run: () => othersSay(), words: ["review", "others", "people", "rating", "saying", "customer"] },
  { run: () => lookAndFeel(), words: ["feel", "look", "fabric", "material", "soft", "colour", "color", "see-through", "sheer", "texture", "breath", "photo"] },
];
const matches = (q, w) => (w.endsWith("!") ? new RegExp(`\\b${w.slice(0, -1)}\\b`).test(q) : q.includes(w));
function answerTyped(text) {
  const q = text.toLowerCase();
  if (/(cart|checkout|buy|order it|pay|price|discount)/.test(q) && !q.includes("bought")) {
    return send([t("I'm only here to help you decide, so I can't add it or check out from this chat."), t("You can do that on the product page whenever you're ready.")], nextChoices());
  }
  const route = ROUTES.find((r) => r.words.some((w) => matches(q, w)));
  if (route) return route.run();
  send([t("I can help with the fit, your past purchase, how it looks and feels, what others are saying, whether it's genuine and the seller is reliable, or durability.")], nextChoices());
}

// ---------- Window wiring ----------
function closeWith(type) {
  if (window.opener && !window.opener.closed) {
    window.opener.postMessage({ type }, location.origin === "null" ? "*" : location.origin);
  }
  window.close();
}
document.getElementById("close").addEventListener("click", () => closeWith("trust-cancelled"));

const askForm = document.getElementById("ask");
const askInput = document.getElementById("askInput");
const askSend = document.getElementById("askSend");
askInput.addEventListener("input", () => (askSend.disabled = !askInput.value.trim()));
askForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = askInput.value.trim();
  if (!text) return;
  stopAutoplay();
  askInput.value = "";
  askSend.disabled = true;
  say(text);
  answerTyped(text);
});

// Tap a photo to see it full screen; Back or Escape closes it.
const viewer = document.getElementById("viewer");
const viewerImg = document.getElementById("viewerImg");
const openViewer = (img) => {
  viewerImg.src = img.src;
  viewerImg.alt = img.alt;
  viewer.hidden = false;
  document.getElementById("viewerBack").focus();
};
const closeViewer = () => (viewer.hidden = true);
log.addEventListener("click", (e) => e.target.classList.contains("chat__photo") && openViewer(e.target));
log.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("chat__photo")) {
    e.preventDefault();
    openViewer(e.target);
  }
});
document.getElementById("viewerBack").addEventListener("click", closeViewer);
addEventListener("keydown", (e) => e.key === "Escape" && !viewer.hidden && closeViewer());

// ---------- Opening: verify the seller, or run a fit check ----------
(function open() {
  document.getElementById("chatProduct").textContent = PRODUCT.name;
  send(
    [t("Hey! Let's seek the truth about this shirt."), t("Want to start with the seller, or jump straight to the fit?")],
    [
      { label: "Start with the seller", run: () => trustSeller() },
      { label: "Check my fit", run: () => fitCheck() },
    ],
  );
})();

// ---------- Autoplay: the shopper's side of the conversation ----------
// Each reply waits for the store to finish, reads for a moment, "types", then sends.
const SHOPPER_READ_MS = 900;
const SHOPPER_TYPE_MS = 800;
const AUTOPLAY = [
  // The seller
  { text: "Let's start with the seller. Is it legit?", run: () => trustSeller() },
  { text: "Nice. And do their orders actually show up on time?", run: () => sellerRecord() },
  { text: "Oh nice, if my friends trust them that helps a lot. Is it brand new though?", run: () => conditionAnswer() },
  // The product
  { text: "Cool. So what's the shirt actually like?", run: () => lookAndFeel() },
  { text: "What are people saying about it?", run: () => othersSay() },
  { text: "Will it last?", run: () => durability() },
  // The fit
  { text: "Okay, last thing. What size should I get?", run: () => fitCheck() },
  { text: "It was a bit tight", run: () => fitAdvice(1) },
  { text: "How did I rate that one again?", run: () => pastReview() },
  { text: "That's everything, thanks!", run: () => finish() },
];

let shopperTyping = null;
function stopAutoplay() {
  auto = false;
  shopperTyping?.remove();
  shopperTyping = null;
}

(async function autoplay() {
  for (const step of AUTOPLAY) {
    // Wait until the store has said everything queued so far.
    let pending;
    do {
      pending = busy;
      await pending;
    } while (pending !== busy);
    await wait(SHOPPER_READ_MS);
    if (!auto) return;
    shopperTyping = el("p", "bubble bubble--me bubble--typing enter");
    shopperTyping.setAttribute("aria-label", "Typing");
    shopperTyping.innerHTML = "<span></span><span></span><span></span>";
    group("me").appendChild(shopperTyping);
    scrollDown();
    await wait(SHOPPER_TYPE_MS);
    if (!auto) return;
    shopperTyping.remove();
    shopperTyping = null;
    say(step.text);
    step.run();
  }
})();
