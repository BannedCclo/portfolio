/* ===========================================================
   sections/about.js
   Timeline entries reveal as they arrive; the rail's fill chases the scroll
   through damp(), the same signal-travelling-a-line idea as the manifesto.
   =========================================================== */

import { clamp01, damp, isNear } from "../motion.js";
import { onTick } from "../ticker.js";

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/** Called once from <About>'s mount effect. Returns a cleanup. */
export function initAbout() {
  const section = document.getElementById("sobre");
  if (!section) return () => {};

  const timeline = section.querySelector(".timeline");
  const entries = [...section.querySelectorAll(".tl")];

  const io = new IntersectionObserver(
    (obs) => {
      for (const entry of obs) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.4, rootMargin: "0px 0px -6% 0px" },
  );
  entries.forEach((el) => io.observe(el));

  if (!timeline) return () => io.disconnect();

  if (reduceMotion) {
    entries.forEach((el) => el.classList.add("is-revealed"));
    timeline.style.setProperty("--fill", 1);
    return () => io.disconnect();
  }

  let fill = 0;
  const unsubscribeTick = onTick((dt) => {
    if (!isNear(section, 0.4)) return;
    const rect = timeline.getBoundingClientRect();
    const vh = window.innerHeight;
    const target = clamp01((vh * 0.6 - rect.top) / rect.height);
    fill = damp(fill, target, dt, 1.8);
    timeline.style.setProperty("--fill", fill.toFixed(4));
  });

  return () => {
    io.disconnect();
    unsubscribeTick();
  };
}
