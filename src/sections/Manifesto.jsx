import { useEffect } from "react";
import { initManifesto } from "../lib/sections/manifesto.js";
import "./Manifesto.css";

export default function Manifesto() {
  useEffect(() => initManifesto(), []);

  return (
    <section id="manifesto" className="manifesto layer">
      <div className="manifesto__rail" aria-hidden="true">
        <span className="manifesto__pulse" />
      </div>

      <header className="manifesto__head fade-in">
        <span className="block__label" data-index="01">
          Metas
        </span>
        <h2 className="manifesto__title">O que eu busco agora?</h2>
      </header>

      <ol className="manifesto__list">
        <li className="tenet">
          <span className="tenet__num">01</span>
          <p className="tenet__text" data-split-words="">
            Encontrar um ambiente de trabalho onde eu possa <em>contribuir</em>{" "}
            com as minhas ideias e habilidades.
          </p>
        </li>
        <li className="tenet">
          <span className="tenet__num">02</span>
          <p className="tenet__text" data-split-words="">
            Aprender com pessoas mais experientes, que me desafiem a crescer e a{" "}
            <em>evoluir</em> como profissional.
          </p>
        </li>
        <li className="tenet">
          <span className="tenet__num">03</span>
          <p className="tenet__text" data-split-words="">
            Assumir novos desafios com garra e proatividade, buscando sempre{" "}
            <em>superar</em> as expectativas e entregar o melhor resultado
            possível.
          </p>
        </li>
      </ol>
    </section>
  );
}
