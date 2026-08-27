import { useCallback, useEffect, useState } from "react";
import { gsap } from "../lib/gsap.js";
import { useLanguage } from "../lib/i18n/LanguageContext.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import logoIcon from "../assets/logo/dark/icon-bold.svg";

/* CSS scroll-behavior is deliberately off (see styles/base.css): it fights
   ScrollTrigger pins, landing anchor jumps in the wrong place because the pin
   recalculates mid-animation. GSAP's own scroll (ScrollToPlugin) does respect
   pinned space, which is why anchor clicks go through gsap.to() below. */
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// hrefs are DOM ids, stable across languages — only the label shown for
// each one comes from the current dictionary (see s.nav below)
const NAV_ITEMS = [
  { href: "#sobre", key: "sobre" },
  { href: "#trabalho", key: "trabalho" },
  { href: "#stack", key: "stack" },
  { href: "#manifesto", key: "manifesto" },
  { href: "#contato", key: "contato" },
];

export default function Nav() {
  const [current, setCurrent] = useState(null);
  const { s } = useLanguage();

  // current-section highlighting
  useEffect(() => {
    const targets = NAV_ITEMS.map((l) => ({
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
        <img src={logoIcon} alt="Marcelo Guimarães" width="200" height="200" />
      </a>
      <div className="nav__links">
        {NAV_ITEMS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            aria-current={current === l.href ? "true" : undefined}
            onClick={(e) => handleClick(e, l.href)}
          >
            {s.nav[l.key]}
          </a>
        ))}
      </div>
      <LanguageSwitcher />
    </nav>
  );
}
