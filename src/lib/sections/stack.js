/* ===========================================================
   sections/stack.js
   Reveals the whole block once it's on screen. Per-item stagger (--i) is set
   directly in JSX at render time (see Stack.jsx) rather than queried and
   assigned here — the DOM never needs to be walked for it.
   =========================================================== */

/** Called once from <Stack>'s mount effect. Returns a cleanup. */
export function initStack() {
  const section = document.getElementById("stack");
  if (!section) return () => {};

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.2 },
  );
  io.observe(section);

  return () => io.disconnect();
}
