import { useEffect } from "react";
import Stage from "./components/Stage.jsx";
import Nav from "./components/Nav.jsx";
import Spine from "./components/Spine.jsx";
import Footer from "./components/footer/footer";
import AnimatedLogo from "./components/animatedLogo/animatedLogo";
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
      {/* O logo do footer é a versão horizontal de traço claro (Assets/Logo →
          dark/horizontal): é a forma que cabe numa faixa larga e centrada como
          a do topo do footer, e o traço #ECE8DF é o próprio --ink do site. Ela
          se desenha ao entrar na viewport — ver components/animatedLogo. */}
      <Footer logo={<AnimatedLogo />} backgroundColor="var(--bg)">
        <p className="footer-note">Feito com React, Three.js e GSAP.</p>
        <p className="footer-copy">© 2026 Marcelo Guimarães</p>
      </Footer>
      {/* Attribution required by the brain model's licence — do not remove */}
      <p className="model-credit">
        Modelo 3D do cérebro: Nevit Dilmen,{" "}
        <a
          href="https://commons.wikimedia.org/wiki/File:3DPX-003765_3DModel_of_Brain_Nevit_Dilmen.stl"
          target="_blank"
          rel="noopener"
        >
          Wikimedia Commons
        </a>{" "}
        (CC BY-SA 3.0 / GFDL)
      </p>
    </>
  );
}
