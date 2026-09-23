/* ============================================================
   NIMIT JAIN · v17
   One load sequence on the hero, one masked reveal per section
   title, one fade-up per block. Sliders, count-ups, the work
   index, the form, and the Ask drawer. Reduced motion and no-JS
   both leave a complete, readable page.
   ============================================================ */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGsap = typeof gsap !== "undefined";

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- wrap masked lines ---------- */
document.querySelectorAll(".hero-name .ln, .sec-title[data-mask], .contact-title[data-mask]").forEach((el) => {
  const inner = document.createElement("span");
  inner.style.display = "block";
  while (el.firstChild) inner.appendChild(el.firstChild);
  el.appendChild(inner);
});

/* ---------- featured slider: buttons, dots, drag ---------- */
document.querySelectorAll("[data-slider]").forEach((slider) => {
  const track = slider.querySelector(".slides");
  const imgs = track.querySelectorAll("img");
  const dotsWrap = slider.querySelector(".slide-dots");
  const prev = slider.querySelector(".prev");
  const next = slider.querySelector(".next");
  let i = 0;
  if (imgs.length < 2) { if (dotsWrap) dotsWrap.remove(); return; }

  imgs.forEach((_, k) => {
    const d = document.createElement("button");
    d.type = "button";
    d.setAttribute("aria-label", `Image ${k + 1}`);
    d.addEventListener("click", () => go(k));
    dotsWrap.appendChild(d);
  });
  const dots = dotsWrap.querySelectorAll("button");
  function go(k) {
    i = (k + imgs.length) % imgs.length;
    track.style.transition = "transform 0.5s cubic-bezier(0.16,1,0.3,1)";
    track.style.transform = `translateX(-${i * 100}%)`;
    dots.forEach((d, n) => d.classList.toggle("on", n === i));
  }
  prev.addEventListener("click", () => go(i - 1));
  next.addEventListener("click", () => go(i + 1));

  let sx = 0, dx = 0, down = false, w = 0;
  track.addEventListener("pointerdown", (e) => { down = true; sx = e.clientX; dx = 0; w = track.clientWidth; track.setPointerCapture(e.pointerId); track.style.transition = "none"; });
  track.addEventListener("pointermove", (e) => { if (!down) return; dx = e.clientX - sx; track.style.transform = `translateX(calc(-${i * 100}% + ${dx}px))`; });
  const up = () => { if (!down) return; down = false; if (dx < -w * 0.16) go(i + 1); else if (dx > w * 0.16) go(i - 1); else go(i); };
  track.addEventListener("pointerup", up);
  track.addEventListener("pointercancel", up);
  track.addEventListener("click", (e) => { if (Math.abs(dx) > 8) e.preventDefault(); }, true);
  go(0);
});

/* ---------- work index: filter chips by hiring intent ---------- */
(() => {
  const chips = [...document.querySelectorAll(".fchip[data-filter]")];
  const rowsEl = [...document.querySelectorAll(".prow[data-keys]")];
  const count = document.querySelector("[data-shown]");
  if (!chips.length || !rowsEl.length) return;
  function apply(key) {
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === key)));
    let n = 0;
    rowsEl.forEach((r) => { const on = r.dataset.keys.split(" ").includes(key); r.hidden = !on; if (on) n += 1; });
    if (count) count.textContent = `${n} shown`;
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    try { history.replaceState(null, "", key === "all" ? location.pathname + location.search : `#work=${key}`); } catch (_) {}
  }
  chips.forEach((c) => c.addEventListener("click", () => apply(c.dataset.filter)));
  const fromHash = (location.hash.match(/^#work=([a-z]+)$/) || [])[1];
  if (fromHash && chips.some((c) => c.dataset.filter === fromHash)) apply(fromHash);
})();

/* ---------- halftone portrait: luminance -> dot radius; pointer proximity swells and pushes the dots ---------- */
function initDots(fig, { scroll }) {
  const canvas = fig.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = "assets/img/portrait-cut.png"; /* background removed, contrast lifted, alpha fades at the bottom */
  const W = 340, H = 425, STEP = 6.5, MAXR = 3.6;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = W * dpr; canvas.height = H * dpr; ctx.scale(dpr, dpr);
  let dots = [], px = -999, py = -999, progress = scroll ? 0 : 1, live = false, raf = 0;
  const seed = (i) => ((i * 9301 + 49297) % 233280) / 233280;

  img.onload = () => {
    /* sample luminance from a crop of the photo that keeps head and shoulders */
    const off = document.createElement("canvas"); off.width = W; off.height = H;
    const o = off.getContext("2d");
    const sw = img.width, sh = img.height, crop = Math.min(sw, sh * (W / H));
    o.drawImage(img, (sw - crop) / 2, 0, crop, crop * (H / W), 0, 0, W, H);
    const data = o.getImageData(0, 0, W, H).data;
    dots = [];
    let i = 0;
    for (let y = STEP / 2; y < H; y += STEP) for (let x = STEP / 2; x < W; x += STEP) {
      const k = ((y | 0) * W + (x | 0)) * 4;
      const a = data[k + 3] / 255;
      const lum = (0.299 * data[k] + 0.587 * data[k + 1] + 0.114 * data[k + 2]) / 255;
      const r = (1 - lum) * MAXR * a;
      if (r > 0.25) dots.push({ x, y, r, n: seed(i) });
      i += 1;
    }
    draw();
  };

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0c0c0c";
    for (const d of dots) {
      /* each dot appears at its own moment in the scroll, so the image develops rather than fades */
      const p = Math.min(1, Math.max(0, (progress - d.n * 0.6) / 0.4));
      if (p <= 0) continue;
      let r = d.r * p, x = d.x, y = d.y;
      const dx = x - px, dy = y - py, dist = Math.hypot(dx, dy);
      if (dist < 110) {
        const f = 1 - dist / 110;
        r += f * f * 3.4;
        x += (dx / (dist || 1)) * f * 14; y += (dy / (dist || 1)) * f * 14;
      }
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  const tick = () => { draw(); raf = live ? requestAnimationFrame(tick) : 0; };
  const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
  canvas.addEventListener("mousemove", (e) => { const b = canvas.getBoundingClientRect(); px = (e.clientX - b.left) * (W / b.width); py = (e.clientY - b.top) * (H / b.height); live = true; start(); });
  canvas.addEventListener("mouseleave", () => { px = py = -999; live = false; draw(); });
  if (scroll && typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.create({ trigger: fig, start: "top 85%", end: "top 30%", scrub: 0.4, onUpdate: (self) => { progress = self.progress; if (!live) draw(); } });
  } else progress = 1;
}

/* ---------- cursor: the arrow stays; a preview rides with it, buttons lean, the portrait turns ---------- */
(() => {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!fine || reduceMotion) return;

  /* b. magnetic buttons: lean toward the pointer, spring back */
  document.querySelectorAll("[data-magnet]").forEach((el) => {
    const strength = 0.28;
    const to = hasGsap ? (x, y, d) => gsap.to(el, { x, y, duration: d, ease: d > 0.3 ? "elastic.out(1, 0.5)" : "power3.out", overwrite: true }) : (x, y) => (el.style.transform = `translate(${x}px, ${y}px)`);
    el.addEventListener("mousemove", (e) => { const r = el.getBoundingClientRect(); to((e.clientX - (r.left + r.width / 2)) * strength, (e.clientY - (r.top + r.height / 2)) * strength, 0.25); });
    el.addEventListener("mouseleave", () => to(0, 0, 0.8));
  });

  /* c. the portrait turns a few degrees toward the pointer */
  const fig = document.querySelector("[data-tilt]");
  if (fig && hasGsap) {
    const img = fig.querySelector("img");
    const stage = fig.closest(".hero-stage") || fig;
    stage.addEventListener("mousemove", (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(fig, { rotateY: x * 6, rotateX: -y * 6, x: x * 8, y: y * 8, transformPerspective: 800, duration: 0.6, ease: "power3.out", overwrite: "auto" });
      if (img) gsap.to(img, { x: -x * 10, y: -y * 10, scale: 1.05, duration: 0.6, ease: "power3.out", overwrite: "auto" });
    });
    stage.addEventListener("mouseleave", () => { gsap.to(fig, { rotateY: 0, rotateX: 0, x: 0, y: 0, duration: 0.9, ease: "power3.out" }); if (img) gsap.to(img, { x: 0, y: 0, scale: 1, duration: 0.9, ease: "power3.out" }); });
  }
})();

/* ---------- contact: live Pune clock, click-to-copy on the email, form to Notify with a delivery ledger ---------- */
(() => {
  const clock = document.getElementById("pune-clock");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: clock.dataset.tz || "Asia/Kolkata" });
    const tick = () => { const d = new Date(); clock.textContent = `${fmt.format(d)} IST`; clock.dateTime = d.toISOString(); };
    tick(); setInterval(tick, 15000);
  }
  const mail = document.querySelector(".contact-mail[data-copy]");
  if (mail && navigator.clipboard) {
    mail.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey) return;
      navigator.clipboard.writeText(mail.dataset.copy).then(() => { mail.setAttribute("data-copied", ""); setTimeout(() => mail.removeAttribute("data-copied"), 1600); }).catch(() => {});
    });
  }

  const form = document.getElementById("contact-form");
  if (!form) return;
  const send = document.getElementById("cf-send");
  const status = document.getElementById("cf-status");
  const errEl = document.getElementById("cf-error");
  const done = document.getElementById("cf-done");
  const EMAIL = "jainnimit34b@gmail.com";
  const fail = (msg) => { errEl.textContent = msg; errEl.hidden = false; send.disabled = false; status.textContent = ""; };
  const say = (title, line) => { done.hidden = false; done.innerHTML = `<b>${title}</b><span>${line}</span>`; };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errEl.hidden = true;
    const fields = ["name", "email", "message"].map((n) => form.elements[n]);
    const bad = fields.filter((f) => !f.value.trim() || !f.checkValidity());
    fields.forEach((f) => f.classList.toggle("is-bad", bad.includes(f)));
    if (bad.length) { fail("All three fields are needed. Ten characters or more for the message."); bad[0].focus(); return; }
    const [name, email, message] = fields.map((f) => f.value.trim());
    send.disabled = true; status.textContent = "Sending";
    let res, body;
    try {
      res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, email, message, company: form.elements.company.value, page: location.pathname }) });
      body = await res.json();
    } catch { return fail(`Could not reach the server. Email me directly at ${EMAIL}.`); }
    if (!res.ok) return fail(body.error || `Something failed. Email me directly at ${EMAIL}.`);
    form.reset(); send.disabled = false; status.textContent = "";
    say("Sent", `Thanks, ${name.split(" ")[0]}. Your message is on its way to Nimit's inbox.`);
    /* quietly confirm delivery: the worker runs every few seconds */
    const started = Date.now();
    const poll = async () => {
      let st;
      try { st = await (await fetch(`/api/contact/${body.traceId}`)).json(); } catch { return; }
      const mail = (st.jobs || []).find((j) => j.channel === "EMAIL");
      if (mail && (mail.status === "SENT" || mail.status === "DELIVERED")) { say("Delivered", `It is in Nimit's inbox. He replies within a day, to ${email}.`); return; }
      if (Date.now() - started < 40000) setTimeout(poll, 3000);
    };
    setTimeout(poll, 4000);
  });
})();

/* ---------- now line: "updated N days ago", the date itself past 30 days ---------- */
(() => {
  const t = document.querySelector("[data-now-updated]");
  if (!t) return;
  const then = new Date(t.getAttribute("datetime") + "T00:00:00");
  const days = Math.max(0, Math.floor((Date.now() - then) / 86400000));
  if (days > 30) t.textContent = `Updated ${then.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
  else t.textContent = days === 0 ? "Updated today" : days === 1 ? "Updated yesterday" : `Updated ${days} days ago`;
})();

/* ---------- keyboard: 1-4 sections, / Ask, j/k projects, Enter opens, ? map ---------- */
(() => {
  const map = document.getElementById("kbd-map");
  const sections = ["#work", "#creator", "#about", "#contact"];
  const typing = (el) => el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
  const openMap = () => { if (!map) return; map.hidden = false; map.querySelector("[data-kbd-close]")?.focus(); };
  const closeMap = () => { if (map) map.hidden = true; };
  document.querySelectorAll("[data-kbd-open]").forEach((b) => b.addEventListener("click", openMap));
  map?.querySelectorAll("[data-kbd-close]").forEach((b) => b.addEventListener("click", closeMap));
  map?.addEventListener("click", (e) => { if (e.target === map) closeMap(); });

  const visibleRows = () => [...document.querySelectorAll(".prow[data-keys]")].filter((r) => !r.hidden);
  let cursor = -1;
  const focusRow = (dir) => {
    const rows = visibleRows();
    if (!rows.length) return;
    rows.forEach((r) => r.classList.remove("is-focus"));
    cursor = cursor < 0 ? (dir > 0 ? 0 : rows.length - 1) : (cursor + dir + rows.length) % rows.length;
    const row = rows[cursor];
    row.classList.add("is-focus");
    row.querySelector(".prow-t a")?.focus({ preventScroll: true });
    row.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
  };

  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (typing(document.activeElement)) return;
    const drawer = document.getElementById("palette");
    if (e.key === "Escape") { closeMap(); return; }
    if (map && !map.hidden) { if (e.key === "?") closeMap(); return; }
    if (drawer && drawer.classList.contains("is-open")) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4) { e.preventDefault(); document.querySelector(sections[n - 1])?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); return; }
    if (e.key === "/") { e.preventDefault(); (document.getElementById("ask-open") || document.getElementById("ask-open-nav"))?.click(); return; }
    if (e.key === "?") { e.preventDefault(); openMap(); return; }
    if (e.key === "j") { e.preventDefault(); focusRow(1); return; }
    if (e.key === "k") { e.preventDefault(); focusRow(-1); return; }
  });
  document.addEventListener("focusin", (e) => { if (!e.target.closest(".prow")) document.querySelectorAll(".prow.is-focus").forEach((r) => r.classList.remove("is-focus")); });
})();

/* ============================================================
   MOTION (skipped entirely under reduced motion / no GSAP)
   ============================================================ */

if (!reduceMotion && hasGsap) initMotion();
else { const f = document.querySelector("[data-dots]"); if (f) initDots(f, { scroll: false }); }

function initMotion() {
  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* reading progress: the gold hairline under the nav */
  const progress = document.getElementById("nav-progress");
  if (progress) gsap.to(progress, { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 } });

  /* hero line two fills from outline to solid on the first screen of scroll */
  const fillin = document.querySelector(".ln-fillin");
  if (fillin) gsap.fromTo(fillin, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 45%", scrub: 0.4 } });

  /* the dark section arrives with a short wipe instead of a jump */
  document.querySelectorAll(".sec-wipe").forEach((sec) => {
    gsap.from(sec, { "--wipe": 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: sec, start: "top 80%", once: true }, onStart: () => sec.classList.add("is-wiping"), onComplete: () => sec.classList.remove("is-wiping") });
  });

  /* QA: pin the section and scroll its internal content down using page scroll */
  const qa = document.querySelector(".qa");
  const qaInner = document.querySelector(".qa-inner");
  if (qa && qaInner && typeof ScrollTrigger !== "undefined") {
    gsap.to(qaInner, {
      y: () => -(qaInner.scrollHeight - qa.clientHeight),
      ease: "none",
      scrollTrigger: {
        trigger: qa,
        start: "top 18%", // Pin when the QA box is just below the About header
        end: () => "+=" + (qaInner.scrollHeight - qa.clientHeight),
        pin: true,
        scrub: true,
        invalidateOnRefresh: true
      }
    });
  }

  /* postmortems: strike through the old behaviour, then "So now" arrives */
  document.querySelectorAll("[data-pm]").forEach((row) => {
    ScrollTrigger.create({ trigger: row, start: "top 78%", once: true, onEnter: () => row.classList.add("is-on") });
  });

  /* quotes: words light up as you scroll past, scrubbed both ways */
  document.querySelectorAll("[data-pq] p").forEach((p) => {
    const words = p.textContent.trim().split(/\s+/).map((w) => { const sp = document.createElement("span"); sp.textContent = w + " "; return sp; });
    p.replaceChildren(...words);
    ScrollTrigger.create({ trigger: p, start: "top 85%", end: "bottom 45%", scrub: true, onUpdate: (self) => { const n = Math.round(self.progress * words.length); words.forEach((w, i) => w.classList.toggle("is-lit", i < n)); } });
  });

  /* the portrait as ink dots: develops as you scroll to it, and the dots swell away from the pointer */
  const dotsFig = document.querySelector("[data-dots]");
  if (dotsFig) initDots(dotsFig, { scroll: true });
  /* changelog: the numeral rolls to whichever entry has crossed the middle; the rail draws to there */
  const cl = document.querySelector("[data-changelog]");
  if (cl) {
    const rows = [...cl.querySelectorAll("[data-cl]")];
    const nums = [...cl.querySelectorAll(".cl-big span")];
    const when = cl.querySelector("[data-cl-when]");
    const rail = cl.querySelector(".cl-rail");
    const rowsBox = cl.querySelector(".cl-rows");
    const setCur = (i) => {
      rows.forEach((r, k) => r.classList.toggle("is-cur", k === i));
      nums.forEach((n, k) => { n.classList.toggle("is-cur", k === i); n.classList.toggle("is-past", k < i); });
      if (when) when.textContent = rows[i].dataset.d;
    };
    setCur(0);
    rows.forEach((row, i) => ScrollTrigger.create({ trigger: row, start: "top 50%", onEnter: () => setCur(i), onLeaveBack: () => setCur(Math.max(0, i - 1)) }));
    if (rail && rowsBox) gsap.fromTo(rail, { height: 0 }, { height: () => rowsBox.offsetHeight, ease: "none", scrollTrigger: { trigger: rowsBox, start: "top 50%", end: "bottom 50%", scrub: 0.2, invalidateOnRefresh: true } });
  }

  /* one authored load sequence, on the hero only. Background tabs skip it. */
  if (!document.hidden) {
    gsap.set(".hero-name .ln > span", { yPercent: 110 });
    gsap.set(".hero-figure", { autoAlpha: 0, y: 24 });
    gsap.timeline({ delay: 0.1 })
      .to(".hero-name .ln > span", { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.12 }, 0)
      .to(".hero-figure", { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" }, 0.35)
      .from(".hero-top, .hero-tags, .hero-foot", { opacity: 0, y: 14, duration: 0.7, ease: "power3.out", stagger: 0.1 }, 0.5)
      .from(".ticker, .now", { opacity: 0, y: 16, duration: 0.7, ease: "power3.out", stagger: 0.1 }, 0.8);
  }

  /* section titles: masked line reveal, once */
  document.querySelectorAll(".sec-title[data-mask] > span, .contact-title[data-mask] > span").forEach((inner) => {
    gsap.from(inner, { yPercent: 110, duration: 0.9, ease: "power4.out", scrollTrigger: { trigger: inner.parentElement, start: "top 88%", once: true } });
  });

  /* blocks: one fade-up, once */
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.from(el, { opacity: 0, y: 22, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
  });

  /* numbers count up once, keeping their thousands separators */
  const fmtIN = new Intl.NumberFormat("en-IN");
  gsap.utils.toArray("[data-count], .prow-v").forEach((el) => {
    const raw = el.textContent.trim();
    if (!/^[0-9][0-9,]*\+?$/.test(raw)) return; /* "1st", "Top 2" stay as written */
    const target = parseFloat(raw.replace(/[^0-9.]/g, ""));
    const suffix = raw.endsWith("+") ? "+" : "";
    if (isNaN(target)) return;
    const proxy = { v: 0 };
    gsap.to(proxy, { v: target, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%", once: true }, onUpdate: () => (el.textContent = fmtIN.format(Math.round(proxy.v)) + (proxy.v >= target ? suffix : "")) });
  });

  /* nav scrollspy */
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const sel = a.getAttribute("href");
    if (!sel || !sel.startsWith("#")) return;
    try {
      const sec = document.querySelector(sel);
      if (!sec) return;
      ScrollTrigger.create({ trigger: sec, start: "top 45%", end: "bottom 45%", onToggle: (self) => a.classList.toggle("on", self.isActive) });
    } catch (e) {}
  });
}

/* ============================================================
   ASK · command palette that also answers questions (/ or Cmd K)
   ============================================================ */
(() => {
  const wrap = document.getElementById("palette");
  const navOpen = document.getElementById("ask-open-nav");
  const form = document.getElementById("pal-form");
  const input = document.getElementById("pal-input");
  const list = document.getElementById("pal-list");
  const empty = document.getElementById("pal-empty");
  const log = document.getElementById("td-log");
  if (!wrap || !form) return;
  const groups = [...list.querySelectorAll(".pal-group")];
  const askGroup = list.querySelector('[data-group="ask"]');
  const askEcho = list.querySelector("[data-ask-echo]");
  const allRows = () => [...list.querySelectorAll(".pal-row")];
  const visible = () => allRows().filter((r) => !r.hidden && !r.closest(".pal-group").hidden);
  let active = 0;

  const setActive = (i) => {
    const rows = visible();
    if (!rows.length) return;
    active = (i + rows.length) % rows.length;
    rows.forEach((r, k) => { r.classList.toggle("is-active", k === active); r.setAttribute("aria-selected", k === active); });
    rows[active].scrollIntoView({ block: "nearest" });
  };

  /* filter: every word typed must appear in the row text or its keywords */
  const filter = () => {
    const q = input.value.trim().toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    let any = false;
    groups.forEach((g) => {
      if (g === askGroup) return;
      let shown = 0;
      g.querySelectorAll(".pal-row").forEach((r) => {
        const hay = (r.textContent + " " + (r.dataset.keys || "")).toLowerCase();
        const ok = words.every((w) => hay.includes(w));
        r.hidden = !ok; if (ok) shown += 1;
      });
      g.hidden = shown === 0; any = any || shown > 0;
    });
    /* anything with a few characters can be asked; put that first when nothing else matches */
    const askable = q.length >= 3;
    askGroup.hidden = !askable;
    /* a short word is probably a command; a sentence or a question is probably a question */
    const sentence = words.length >= 3 || q.endsWith("?");
    if (askable) { askEcho.textContent = input.value.trim(); if (sentence || !any) list.prepend(askGroup); else list.insertBefore(askGroup, empty); }
    empty.hidden = any || askable;
    setActive(0);
  };

  const open = () => { wrap.hidden = false; requestAnimationFrame(() => wrap.classList.add("is-open")); input.value = ""; filter(); setTimeout(() => input.focus(), 60); };
  const close = () => { wrap.classList.remove("is-open"); setTimeout(() => (wrap.hidden = true), 250); navOpen?.focus({ preventScroll: true }); };
  navOpen?.addEventListener("click", open);
  wrap.addEventListener("click", (e) => { if (e.target === wrap) close(); });
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); wrap.classList.contains("is-open") ? close() : open(); return; }
    if (e.key === "Escape" && wrap.classList.contains("is-open")) { e.preventDefault(); close(); }
  });
  input.addEventListener("input", filter);
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
    else if (e.key === "Enter" || e.keyCode === 13) { e.preventDefault(); submit(); }
  });
  list.addEventListener("mousemove", (e) => { const r = e.target.closest(".pal-row"); if (r) { const i = visible().indexOf(r); if (i >= 0 && i !== active) setActive(i); } });

  const run = (row) => {
    if (!row) return;
    const act = row.dataset.act;
    if (row.tagName === "A") { if (row.target !== "_blank" && row.hostname !== location.hostname) row.target = "_blank"; row.click(); close(); return; }
    if (act === "go") { close(); document.querySelector(row.dataset.to)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); return; }
    if (act === "copy") { navigator.clipboard?.writeText(row.dataset.copy); const k = row.querySelector("kbd"); const was = k.textContent; k.textContent = "copied"; setTimeout(() => (k.textContent = was), 1400); return; }
    if (act === "keys") { close(); document.querySelector("[data-kbd-open]")?.click() || document.getElementById("kbd-map")?.removeAttribute("hidden"); return; }
    if (act === "ask-text") { ask(row.textContent.trim()); return; }
    if (act === "ask") { ask(input.value.trim()); return; }
  };
  const submit = () => { const rows = visible(); run(rows[active] || (input.value.trim().length >= 3 ? askGroup.querySelector(".pal-row") : null)); };
  form.addEventListener("submit", (e) => { e.preventDefault(); submit(); });
  list.addEventListener("click", (e) => { const r = e.target.closest(".pal-row"); if (!r) return; if (r.tagName === "A") { close(); return; } e.preventDefault(); run(r); });

  /* single-letter commands when the input is empty */
  input.addEventListener("keydown", (e) => {
    if (input.value !== "" || e.metaKey || e.ctrlKey || e.altKey) return;
    const map = { 1: "#work", 2: "#creator", 3: "#about", 4: "#contact" };
    if (map[e.key]) { e.preventDefault(); run(list.querySelector(`[data-to="${map[e.key]}"]`)); return; }
    const letter = { c: '[data-act="copy"]', g: 'a[href*="github"]', y: 'a[href*="youtube"]', l: 'a[href*="linkedin"]', "?": '[data-act="keys"]' }[e.key];
    if (letter) { e.preventDefault(); run(list.querySelector(letter)); }
  });

  /* ---- answers, from /api/ask ---- */
  const el = (cls, html) => { const d = document.createElement("div"); d.className = cls; d.innerHTML = html; return d; };
  const escape = (s) => s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  const scrollLog = () => log.lastElementChild?.scrollIntoView({ block: "nearest" });
  let busy = false;
  const history = [];
  async function ask(q) {
    if (busy || q.length < 3) return;
    busy = true;
    input.value = ""; filter();
    log.hidden = false;
    log.appendChild(el("msg msg-you", `<p>${escape(q)}</p>`));
    const wait = el("msg msg-bot", `<p class="msg-wait">Looking it up</p>`);
    log.appendChild(wait); scrollLog();
    try {
      const r = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ q, history: history.slice(-6) }) });
      const j = await r.json().catch(() => ({}));
      wait.remove();
      if (!r.ok || j.error) {
        log.appendChild(el("msg msg-bot is-error", `<p>${escape(j.error ?? "The answer service is unavailable right now.")}</p><div class="msg-meta">Email works: jainnimit34b@gmail.com</div>`));
      } else {
        const kept = j.hits.filter((h) => h.kept);
        const cites = j.answer.citations.map((n) => { const h = kept[n - 1]; return h ? `<a href="${escape(h.url)}" title="${escape(h.section)}">[${n}] ${escape(h.title)}</a>` : ""; }).join("");
        const heard = j.resolved ? `Understood as: ${escape(j.resolved)}` : "";
        const meta = j.answer.refused ? [heard, "Not on this site"].filter(Boolean).join(" · ") : [heard, `${j.ms} ms`].filter(Boolean).join(" · ");
        log.appendChild(el(`msg msg-bot${j.answer.refused ? " is-refused" : ""}`,
          `<p>${escape(j.answer.answer).replace(/\[(\d+)\]/g, '<sup>[$1]</sup>')}</p>${cites ? `<div class="msg-cites">${cites}</div>` : ""}<div class="msg-meta">${meta}</div>`));
        history.push({ role: "you", text: q }, { role: "tower", text: j.answer.answer });
      }
    } catch {
      wait.remove();
      log.appendChild(el("msg msg-bot is-error", `<p>Could not reach the answer service. It runs on the deployed site; locally start it with <b>node rag/dev-server.mjs</b>.</p>`));
    }
    scrollLog();
    busy = false;
    input.focus();
  }
})();

/* ---------- Automated YouTube Stats ---------- */
(async function fetchYouTubeStats() {
  const viewsEl = document.getElementById("yt-views");
  const subsEl = document.getElementById("yt-subs");
  if (!viewsEl || !subsEl) return;

  const fmt = new Intl.NumberFormat("en-IN");

  function renderStats(views, subs) {
    if (typeof gsap !== "undefined") {
      const pViews = { v: 0 };
      const pSubs = { v: 0 };
      gsap.to(pViews, { v: views, duration: 1.4, ease: "power3.out", onUpdate: () => (viewsEl.textContent = fmt.format(Math.round(pViews.v))) });
      gsap.to(pSubs, { v: subs, duration: 1.4, ease: "power3.out", onUpdate: () => (subsEl.textContent = fmt.format(Math.round(pSubs.v))) });
    } else {
      viewsEl.textContent = fmt.format(views);
      subsEl.textContent = fmt.format(subs);
    }
  }

  try {
    const res = await fetch("/api/youtube");
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    
    if (data.views && data.subscribers) {
      // Save to localStorage for fallback
      localStorage.setItem("yt_stats_cache", JSON.stringify({ views: data.views, subs: data.subscribers }));
      renderStats(data.views, data.subscribers);
    }
  } catch (err) {
    console.error("YouTube API fetch failed, attempting to use cached data:", err);
    // Check localStorage
    const cached = localStorage.getItem("yt_stats_cache");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.views && parsed.subs) {
          renderStats(parsed.views, parsed.subs);
        }
      } catch (e) {
        // Leave as "--"
      }
    }
    // If no cache exists, the UI naturally remains as "--"
  }
})();
