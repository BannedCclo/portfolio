/* ===========================================================
   sections/manifesto.js
   Line-staggered text reveals plus the synapse rail, whose fill and pulse
   chase the section's scroll position through damp() rather than tracking it
   directly — same treatment the brain's poses get.
   =========================================================== */

import { clamp01, damp, isNear } from "../motion.js";
import { onTick } from "../ticker.js";
import { splitWords, relineWords } from "../split.js";

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/** Called once from <Manifesto>'s mount effect. Returns a cleanup. */
export function initManifesto() {
  const section = document.getElementById("manifesto");
  if (!section) return () => {};

  const rail = section.querySelector(".manifesto__rail");
  const texts = [...section.querySelectorAll("[data-split-words]")];
  const tenets = [...section.querySelectorAll(".tenet")];

  // offsetTop grouping is only meaningful once the real fonts are in place
  document.fonts.ready.then(() => {
    texts.forEach(splitWords);
  });

  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => texts.forEach(relineWords), 180);
  };
  addEventListener("resize", onResize);

  // each tenet reveals on its own as it comes up
  const revealer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        revealer.unobserve(entry.target);
      }
    },
    { threshold: 0.35, rootMargin: "0px 0px -8% 0px" },
  );
  tenets.forEach((el) => revealer.observe(el));

  if (reduceMotion) {
    tenets.forEach((el) => el.classList.add("is-revealed"));
    rail?.style.setProperty("--fill", 1);
    return () => {
      clearTimeout(resizeTimer);
      removeEventListener("resize", onResize);
      revealer.disconnect();
    };
  }

  /* the rail: fill follows how far the section has travelled past the middle
     of the viewport; the pulse rides at the head of that fill and fades out
     once the signal has arrived */
  let fill = 0;
  const unsubscribeTick = onTick((dt) => {
    if (!isNear(section, 0.4)) return;
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const target = clamp01((vh * 0.62 - rect.top) / rect.height);
    fill = damp(fill, target, dt, 1.8);
    rail.style.setProperty("--fill", fill);
    // brightest while travelling, gone once it reaches the end
    const alpha = fill > 0.004 && fill < 0.995 ? 1 : 0;
    rail.style.setProperty("--pulse-alpha", alpha);
  });

  return () => {
    clearTimeout(resizeTimer);
    removeEventListener("resize", onResize);
    revealer.disconnect();
    unsubscribeTick();
  };
}
