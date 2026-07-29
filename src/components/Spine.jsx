import { useEffect, useRef } from "react";
import { clamp01 } from "../lib/motion.js";

/**
 * Page-wide reading progress rail. Steps aside (via CSS, see .is-hero /
 * .is-galleried in styles/base.css) whenever the hero or the work gallery
 * owns that same screen position with their own local progress indicator.
 */
export default function Spine() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.setProperty("--read", max > 0 ? clamp01(scrollY / max) : 0);
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="spine" id="spine" ref={ref} aria-hidden="true">
      <i />
    </div>
  );
}
