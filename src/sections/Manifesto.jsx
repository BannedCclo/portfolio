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
          Como eu trabalho
        </span>
        <h2 className="manifesto__title">
          Três opiniões que aparecem em tudo que eu construo.
        </h2>
      </header>

      <ol className="manifesto__list">
        <li className="tenet">
          <span className="tenet__num">01</span>
          <p className="tenet__text" data-split-words="">
            <em>Legibilidade</em> é uma decisão de arquitetura. Código que
            ninguém entende já está quebrado, mesmo passando nos testes.
          </p>
        </li>
        <li className="tenet">
          <span className="tenet__num">02</span>
          <p className="tenet__text" data-split-words="">
            A interface é a parte do sistema que as pessoas realmente tocam.
            Ela merece o mesmo <em>rigor</em> que o banco de dados.
          </p>
        </li>
        <li className="tenet">
          <span className="tenet__num">03</span>
          <p className="tenet__text" data-split-words="">
            Quase todo problema de produto que eu vi tinha peças demais, não
            de menos. <em>Subtrair</em> costuma ser o trabalho.
          </p>
        </li>
      </ol>
    </section>
  );
}
