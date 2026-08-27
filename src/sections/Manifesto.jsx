import { useEffect } from "react";
import { initManifesto } from "../lib/sections/manifesto.js";
import { useLanguage } from "../lib/i18n/LanguageContext.jsx";
import "./Manifesto.css";

export default function Manifesto() {
  useEffect(() => initManifesto(), []);
  const { s } = useLanguage();

  return (
    <section id="manifesto" className="manifesto layer">
      <div className="manifesto__rail" aria-hidden="true">
        <span className="manifesto__pulse" />
      </div>

      <header className="manifesto__head fade-in">
        <span className="block__label" data-index="04">
          {s.manifesto.label}
        </span>
        <h2 className="manifesto__title">{s.manifesto.title}</h2>
      </header>

      <ol className="manifesto__list">
        {s.manifesto.tenets.map((tenet, i) => (
          <li className="tenet" key={i}>
            <span className="tenet__num">{String(i + 1).padStart(2, "0")}</span>
            <p className="tenet__text" data-split-words="">
              {tenet.before}
              <em>{tenet.em}</em>
              {tenet.after}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
