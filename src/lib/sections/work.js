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

/* The pinned gallery needs real headroom, not just width: a card (image +
   full description + stack tags) can easily run 500-600px tall, and pinning
   the section to a short viewport centres header+cards as one flex block
   inside a fixed, clipped box — when they don't fit, the excess spills out
   both edges, and the bottom half lands squarely on the rail. Short windows
   fall back to the same plain, natively-scrollable strip already used below
   819px width (see Work.css) and under reduced motion, rather than pinning a
   layout that provably can't fit. */
const DESKTOP_QUERY = "(min-width: 820px) and (min-height: 820px)";
const isDesktop = () => window.matchMedia(DESKTOP_QUERY).matches;

/** Wires up drag-to-scrub on the rail: pointerdown jumps straight to that
 *  point and starts tracking, pointermove keeps scrubbing, setPointerCapture
 *  keeps it tracking even once the pointer strays off the (thin) rail.
 *  `scrollToProgress(p)` is the caller's job — the normal pinned path and
 *  the reduced-motion path each turn a 0..1 progress into "scroll" very
 *  differently. Returns a cleanup, or a no-op if there's no rail to wire. */
function installRailDrag(rail, scrollToProgress) {
  if (!rail) return () => {};

  // Measured once per drag (on pointerdown) instead of on every pointermove.
  // scrollToProgress writes a style (the --x custom property, which both the
  // fill and the thumb size/position off of) on every call, and re-reading
  // layout (getBoundingClientRect) right after writing it forces a
  // synchronous reflow — read-after-write, every single move event. A slow
  // drag generates few enough events that this is invisible; a fast one
  // generates many, and the accumulated forced reflows are exactly the lag
  // that makes the fill fall behind the cursor and then jump to catch up.
  // The rail's box doesn't change shape mid-drag, so it only needs measuring
  // once.
  let rect = null;
  const progressFromPoint = (x) => clamp01((x - rect.left) / rect.width);
  const onPointerDown = (e) => {
    rect = rail.getBoundingClientRect();
    rail.setPointerCapture(e.pointerId);
    rail.classList.add("is-dragging");
    scrollToProgress(progressFromPoint(e.clientX));
  };
  const onPointerMove = (e) => {
    if (!rail.hasPointerCapture(e.pointerId)) return;
    scrollToProgress(progressFromPoint(e.clientX));
  };
  const onPointerUp = (e) => {
    if (!rail.hasPointerCapture(e.pointerId)) return;
    rail.releasePointerCapture(e.pointerId);
    rail.classList.remove("is-dragging");
  };
  rail.addEventListener("pointerdown", onPointerDown);
  rail.addEventListener("pointermove", onPointerMove);
  rail.addEventListener("pointerup", onPointerUp);
  rail.addEventListener("pointercancel", onPointerUp);

  return () => {
    rail.removeEventListener("pointerdown", onPointerDown);
    rail.removeEventListener("pointermove", onPointerMove);
    rail.removeEventListener("pointerup", onPointerUp);
    rail.removeEventListener("pointercancel", onPointerUp);
    rail.classList.remove("is-dragging");
  };
}

/** Reduced-motion path: no pin, no ScrollTrigger — the track is a plain,
 *  natively scrollable strip (see reduced-motion.css), so the rail just
 *  mirrors and drives its real scrollLeft directly. No damping either,
 *  matching the rest of the reduced-motion treatment elsewhere on the page:
 *  the thumb should track the finger/mouse exactly, not chase it. */
function initReducedMotionRail(rail, track) {
  if (!rail || !track) return () => {};

  // Start at the very left regardless of whatever scroll position the
  // browser happened to land the track on (scroll anchoring before layout
  // settles can otherwise leave it parked at the far end on first paint).
  track.scrollLeft = 0;

  const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);

  // Skipped mid-drag: scrollToProgress below already drives --x directly
  // from the drag's own known position. track.scrollLeft = ... still fires
  // a "scroll" event asynchronously, and syncRail's readback of it can trail
  // what was just assigned during a fast, sustained drag (see
  // scrollToProgress's comment) — without this guard, that stale readback
  // lands a frame after the direct update and fights it for as long as the
  // drag continues in one direction, self-correcting only once input pauses
  // or reverses. Left in place for everything that isn't the rail's own
  // drag: native swipe/scrollbar use and window resize.
  const syncRail = () => {
    if (rail.classList.contains("is-dragging")) return;
    const m = maxScroll();
    rail.style.setProperty("--x", m ? clamp01(track.scrollLeft / m) : 0);
  };
  syncRail();
  track.addEventListener("scroll", syncRail, { passive: true });
  window.addEventListener("resize", syncRail);

  // Drives --x from `p` directly instead of syncRail()'s readback of
  // track.scrollLeft. Reading a freshly-written scrollLeft back is normally
  // fine, but under a fast, sustained drag Chrome doesn't always keep the
  // main-thread-visible scrollLeft in step with what was just assigned — the
  // compositor is still catching up — so the readback trails the real
  // target and only resolves once input pauses or reverses, which is what
  // let the fill visibly lag behind the cursor during a continuous drag. `p`
  // is already the exact position the cursor computed, so there's nothing
  // to read back for this path.
  const scrollToProgress = (p) => {
    track.scrollLeft = p * maxScroll();
    rail.style.setProperty("--x", p);
  };
  // No scroll-snap on this track (see reduced-motion.css) — a scrubbed
  // scrollLeft needs to be free to rest anywhere, not just on a card
  // boundary, so the drag has nothing to fight here.
  const uninstallDrag = installRailDrag(rail, scrollToProgress);

  return () => {
    track.removeEventListener("scroll", syncRail);
    window.removeEventListener("resize", syncRail);
    uninstallDrag();
  };
}

/** Called once from <Work>'s mount effect. Returns a cleanup. */
export function initWork() {
  const section = document.getElementById("trabalho");
  if (!section) return () => {};

  const pin = section.querySelector(".work__pin");
  const track = section.querySelector(".work__track");
  const rail = section.querySelector(".work__rail");
  const cards = [...section.querySelectorAll(".proj")];

  if (reduceMotion) return initReducedMotionRail(rail, track);

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

  /* The pin only exists at DESKTOP_QUERY. Outside it — narrow width or short
     height — a pin would trap a full screen of scroll for a layout that
     either has nothing to travel (narrow) or can't fit the way it's centred
     (short, see DESKTOP_QUERY's own comment above). gsap.matchMedia creates
     and reverts the trigger across the breakpoint for us, including on
     resize. */
  const mm = gsap.matchMedia();
  mm.add(DESKTOP_QUERY, () => {
    let pinActive = false;

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
      onToggle: (self) => {
        pinActive = self.isActive;
        document.body.classList.toggle("is-galleried", self.isActive);
      },
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

    // Drag-to-scrub the rail — see installRailDrag; here, a 0..1 progress
    // just maps onto the same pinned scroll range onFocus above already uses.
    const uninstallDrag = installRailDrag(rail, (p) => {
      const start = trigger.start;
      const span = trigger.end - trigger.start;
      window.scrollTo({ top: start + p * span, behavior: "auto" });
    });

    /* Horizontal wheel/trackpad input while pinned. The pin already turns
       vertical scroll into horizontal travel; this is the same conversion
       run in reverse, so a two-finger horizontal swipe (or shift+wheel,
       which browsers already report as deltaX on their own) can drive the
       gallery directly instead of only ever riding along with the page's
       vertical scroll. Deltas dominated by deltaY are left alone so normal
       vertical scrolling isn't hijacked.

       Once the track is already sitting at the edge the gesture is pushing
       towards, the horizontal delta has nowhere left to go — but a pure
       horizontal swipe reports almost no deltaY for the handler to fall back
       on, and trackpads/mice tend to keep a gesture's axis locked to
       horizontal for the rest of that same fling. Leaving the event alone
       here used to mean the browser had nothing scrollable to apply deltaX
       to (the page has no horizontal overflow) and nothing usable in deltaY
       either, so the gesture just went dead right at the rail's edge until
       the user released and started a fresh, vertical-only gesture. Instead,
       once maxed out, redirect the horizontal delta into a normal vertical
       scroll so the same gesture carries straight on past the section. */
    const onWheel = (e) => {
      if (!pinActive) return;
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      const m = maxScroll();
      if (!m) return;
      const atStart = targetX > -0.5 && e.deltaX < 0;
      const atEnd = targetX < -m + 0.5 && e.deltaX > 0;
      if (atStart || atEnd) {
        e.preventDefault();
        window.scrollBy(0, e.deltaX);
        return;
      }
      e.preventDefault();
      const span = trigger.end - trigger.start;
      window.scrollBy(0, e.deltaX * (span / m));
    };
    pin.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      track.removeEventListener("focusin", onFocus);
      pin.removeEventListener("wheel", onWheel);
      uninstallDrag();
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
