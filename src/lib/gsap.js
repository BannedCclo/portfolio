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

export { gsap, ScrollTrigger, ScrollToPlugin };
