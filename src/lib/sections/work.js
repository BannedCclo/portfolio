/* ===========================================================
   sections/work.js — the horizontal gallery

   Vertical scroll drives horizontal travel. Notably there is no GSAP `scrub`
   here: ScrollTrigger reports raw progress, and every smoothed quantity (the
   track's x, each card's tilt) is damped in the tick loop instead. One
   smoothing layer, the same one the rest of the page uses — stacking scrub on
   top of damp() would produce a soggy double lag.

   Procedural card artwork is painted by the <ProjectArt> component instead of
   from here — this module only owns the travel/tilt/keyboard behaviour.
   =========================================================== */

import { gsap, ScrollTrigger } from "../gsap.js";
import { clamp01, damp, isNear } from "../motion.js";
import { onTick } from "../ticker.js";

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const isDesktop = () => window.matchMedia("(min-width: 820px)").matches;

/** Called once from <Work>'s mount effect. Returns a cleanup. */
export function initWork() {
  const section = document.getElementById("trabalho");
  if (!section) return () => {};

  const pin = section.querySelector(".work__pin");
  const track = section.querySelector(".work__track");
  const rail = section.querySelector(".work__rail");
  const cards = [...section.querySelectorAll(".proj")];

  if (reduceMotion) return () => {};

  /* ---- pointer tilt, damped per card ---- */
  const tilt = new Map(cards.map((c) => [c, { x: 0, y: 0, tx: 0, ty: 0 }]));
  const pointerHandlers = [];
  for (const card of cards) {
    const onMove = (e) => {
      if (!isDesktop()) return;
      const r = card.getBoundingClientRect();
      const t = tilt.get(card);
      t.ty = ((e.clientX - r.left) / r.width - 0.5) * 7;
      t.tx = -((e.clientY - r.top) / r.height - 0.5) * 7;
    };
    const onLeave = () => {
      const t = tilt.get(card);
      t.tx = 0;
      t.ty = 0;
    };
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
    pointerHandlers.push({ card, onMove, onLeave });
  }

  /* ---- horizontal travel ---- */
  let targetX = 0;
  let x = 0;

  const maxScroll = () =>
    Math.max(0, track.scrollWidth - window.innerWidth);

  /* The pin exists only above 820px. Below that the cards are a plain vertical
     stack, and a pin there would trap a full screen of scroll for a layout
     that has nothing to travel. gsap.matchMedia creates and reverts the
     trigger across the breakpoint for us, including on resize. */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 820px)", () => {
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      // the full track width, plus a little breathing room so the last card
      // can settle before the pin releases
      end: () => "+=" + (maxScroll() + window.innerHeight * 0.6),
      pin: pin,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        targetX = -self.progress * maxScroll();
      },
      // the gallery carries its own horizontal rail, so the page-wide reading
      // spine would be a second progress meter competing with it — and it sits
      // right where the cards travel
      onToggle: (self) =>
        document.body.classList.toggle("is-galleried", self.isActive),
    });

    /* Keyboard access. Tabbing to a card off to the right would normally do
       nothing useful: the track is moved with a transform, not scrolled, so
       the browser's own scroll-into-view has nothing to act on and the card
       stays out of frame. Translate the card's position along the track into
       a page scroll position instead, which is what actually drives it. */
    const onFocus = (e) => {
      const card = e.target.closest(".proj");
      if (!card) return;
      const m = maxScroll();
      if (!m) return;
      // where this card would need the track to sit to be comfortably in view
      const want = clamp01(
        (card.offsetLeft - window.innerWidth * 0.25) / m,
      );
      const start = trigger.start;
      const span = trigger.end - trigger.start;
      // Applied on the next frame so it lands after the browser's own
      // scroll-into-view for the newly focused element, which would otherwise
      // undo it. That default also tries to scroll .work__pin (overflow is
      // hidden, but it is still programmatically scrollable), which would
      // shift the content out from under the transform — so put it back.
      requestAnimationFrame(() => {
        pin.scrollLeft = 0;
        window.scrollTo({ top: start + want * span, behavior: "auto" });
      });
    };
    track.addEventListener("focusin", onFocus);

    return () => {
      track.removeEventListener("focusin", onFocus);
      trigger.kill();
      targetX = 0;
      x = 0;
      track.style.transform = "";
      document.body.classList.remove("is-galleried");
    };
  });

  const unsubscribeTick = onTick((dt) => {
    if (!isNear(section, 0.5)) return;

    if (isDesktop()) {
      x = damp(x, targetX, dt, 3.4);
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      if (rail) {
        const m = maxScroll();
        rail.style.setProperty("--x", m ? clamp01(-x / m) : 0);
      }
    }

    // depth falloff: cards nearest the centre of the screen sit forward and
    // at full opacity, the rest recede — motion on three properties at once
    // rather than a flat slide
    const mid = window.innerWidth / 2;
    for (const card of cards) {
      const r = card.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - mid) / mid;
      card.style.setProperty("--focus", clamp01(1 - d * 0.55).toFixed(3));

      const t = tilt.get(card);
      t.x = damp(t.x, t.tx, dt, 6);
      t.y = damp(t.y, t.ty, dt, 6);
      card.style.setProperty("--tilt-x", t.x.toFixed(2));
      card.style.setProperty("--tilt-y", t.y.toFixed(2));
    }
  });

  return () => {
    unsubscribeTick();
    mm.revert();
    for (const { card, onMove, onLeave } of pointerHandlers) {
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
    }
    document.body.classList.remove("is-galleried");
  };
}
