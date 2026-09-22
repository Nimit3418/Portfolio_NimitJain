/* Case-study pages: no motion library, just the reduced-motion-safe fade-up on load. */
if (!matchMedia("(prefers-reduced-motion: reduce)").matches && !document.hidden) {
  document.querySelectorAll(".cs > *").forEach((el, i) => {
    el.style.opacity = "0"; el.style.transform = "translateY(10px)";
    el.style.transition = `opacity .6s cubic-bezier(.16,1,.3,1) ${i * 60}ms, transform .6s cubic-bezier(.16,1,.3,1) ${i * 60}ms`;
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity = "1"; el.style.transform = "none"; }));
  });
}
