/* Cursor: one solid disc that sits on the pointer and grows over anything you can click. Pointer devices only; shared by every page. */
(() => {
  const cur = document.getElementById("cur");
  if (!cur || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("has-cur");
  let mx = -100, my = -100, x = -100, y = -100, raf = 0;
  const loop = () => {
    const k = RM ? 1 : 0.42;
    x += (mx - x) * k; y += (my - y) * k;
    cur.style.translate = `${x}px ${y}px`;
    raf = Math.abs(mx - x) + Math.abs(my - y) > 0.05 ? requestAnimationFrame(loop) : 0;
  };
  const kind = (t) => {
    if (!t || !t.closest) return "";
    if (t.closest("input, textarea, [contenteditable]")) return "is-text";
    if (t.closest(".prow")) return "is-row";
    if (t.closest("a, button, summary, label, .fchip")) return "is-link";
    return "";
  };
  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    if (x < -50) { x = mx; y = my; }
    cur.classList.remove("is-out");
    const k = kind(e.target);
    ["is-link", "is-row", "is-text"].forEach((c) => cur.classList.toggle(c, c === k));
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  document.addEventListener("mouseleave", () => cur.classList.add("is-out"));
  document.addEventListener("mouseenter", () => cur.classList.remove("is-out"));
  window.addEventListener("mousedown", () => cur.classList.add("is-down"));
  window.addEventListener("mouseup", () => cur.classList.remove("is-down"));
})();
