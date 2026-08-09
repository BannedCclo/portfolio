import { useEffect, useRef } from "react";
import { initStage, startStage } from "../three/stage.js";

/**
 * The single fixed WebGL canvas the whole page draws into (see
 * src/three/stage.js for why one canvas serves every section). Rendered once,
 * near the top of <App>, and never unmounted for the life of the page — acts
 * register against the shared scene from their own section components
 * regardless of mount order, so this only needs to attach the canvas and
 * start the render loop.
 */
export default function Stage() {
  const mountRef = useRef(null);

  useEffect(() => {
    initStage(mountRef.current);
    startStage();
    // no cleanup: the stage is a page-wide singleton that outlives this
    // component's own mount/unmount cycle (see stage.js's idempotency guards)
  }, []);

  return (
    <>
      <div id="stage" ref={mountRef} aria-hidden="true" />
      {/* These three live here, not inside <Hero>, on purpose: they mask or
          darken the fixed, always-full-viewport canvas, and need to keep
          doing that even once #brain itself has scrolled away. GSAP's pin
          only holds #brain (and anything positioned relative to it) in place
          for a fixed scroll distance, released the instant that distance is
          covered — regardless of scroll speed. A fast enough scroll covers
          it before any of the wall-clock-paced state in acts/hero.js has
          caught up (pose.exit, the exit dissolve; approach/idle easing for
          the other two), unpinning #brain — and scrolling every one of these
          off-screen with it, were they still positioned relative to it —
          while the canvas underneath is still visible, unmasked, uncomposed.
          Styled and driven from acts/hero.js/Hero.css; these are just their
          DOM anchors, each toggled with the others so none can end up
          inconsistent with the rest. */}
      <div className="brain-vignette" id="brainVignette" aria-hidden="true" />
      <div className="brain-fade-bottom" id="brainFadeBottom" aria-hidden="true" />
      <div className="brain-exit-fade" id="brainExitFade" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
