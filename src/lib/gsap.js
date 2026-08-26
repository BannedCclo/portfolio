/* ===========================================================
   gsap.js — one registration point

   The static version loaded GSAP from a CDN <script defer>, so every module
   guarded its ScrollTrigger use behind `window.gsap && window.ScrollTrigger`
   in case the script hadn't arrived yet. Bundled via npm, gsap is just a
   regular import — always present by the time any module runs — so that
   defensive check is gone; `reduceMotion` is the only gate left, and it's a
   deliberate one (see js/motion.js's original comment).

   ES modules are cached, so this file's top-level registerPlugin() call runs
   exactly once no matter how many places import from here.
   =========================================================== */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// GSAP auto-refreshes on window "load", but web fonts can still swap in
// after that on a slow connection/device, reflowing text and leaving every
// trigger's cached start/end stale — most visibly the hero's pin, whose
// "+=380%" then no longer lines up with the actual scroll distance. Cheap
// and idempotent, so safe to fire regardless of how many triggers exist yet.
document.fonts?.ready?.then(() => ScrollTrigger.refresh());

export { gsap, ScrollTrigger, ScrollToPlugin };
