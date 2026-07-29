import { useCallback, useEffect, useState } from "react";
import { gsap } from "../lib/gsap.js";

/* CSS scroll-behavior is deliberately off (see styles/base.css): it fights
   ScrollTrigger pins, landing anchor jumps in the wrong place because the pin
   recalculates mid-animation. GSAP's own scroll (ScrollToPlugin) does respect
   pinned space, which is why anchor clicks go through gsap.to() below. */
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const NAV_LINKS = [
  { href: "#manifesto", label: "Método" },
  { href: "#trabalho", label: "Trabalho" },
  { href: "#stack", label: "Ferramentas" },
  { href: "#sobre", label: "Sobre" },
  { href: "#contato", label: "Contato" },
];

export default function Nav() {
  const [current, setCurrent] = useState(null);

  // current-section highlighting
  useEffect(() => {
    const targets = NAV_LINKS.map((l) => ({
      ...l,
      el: document.querySelector(l.href),
    })).filter((t) => t.el);
    if (!targets.length) return;

    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const hit = targets.find((t) => t.el === entry.target);
          if (hit) setCurrent(hit.href);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    targets.forEach((t) => spy.observe(t.el));
    return () => spy.disconnect();
  }, []);

  const handleClick = useCallback((e, href) => {
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    if (reduceMotion) {
      target.scrollIntoView();
      return;
    }
    gsap.to(window, {
      duration: 1.1,
      ease: "power2.inOut",
      scrollTo: { y: target, autoKill: true },
    });
  }, []);

  return (
    <nav className="nav">
      <a href="#top" className="nav__mark">
        Marcelo Guimarães
      </a>
      <div className="nav__links">
        {NAV_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            aria-current={current === l.href ? "true" : undefined}
            onClick={(e) => handleClick(e, l.href)}
          >
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
