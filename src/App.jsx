import { useEffect } from "react";
import Stage from "./components/Stage.jsx";
import Nav from "./components/Nav.jsx";
import Spine from "./components/Spine.jsx";
import Footer from "./components/Footer.jsx";
import Hero from "./sections/Hero.jsx";
import Manifesto from "./sections/Manifesto.jsx";
import Work from "./sections/Work.jsx";
import Stack from "./sections/Stack.jsx";
import About from "./sections/About.jsx";
import Contact from "./sections/Contact.jsx";

export default function App() {
  /* Generic scroll reveal for anything tagged .fade-in, page-wide — mirrors
     the original main.js's single page-level observer rather than one per
     section. Safe to query the whole document here: React commits the entire
     tree's DOM before any effect runs, and child effects fire before this
     parent one, so every section's .fade-in elements already exist by the
     time this runs. */
  useEffect(() => {
    const revealer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll(".fade-in").forEach((el) => revealer.observe(el));
    return () => revealer.disconnect();
  }, []);

  return (
    <>
      <Stage />
      <Nav />
      <Spine />
      <Hero />
      <About />
      <Work />
      <Stack />
      <Manifesto />
      <Contact />
      <Footer />
    </>
  );
}
