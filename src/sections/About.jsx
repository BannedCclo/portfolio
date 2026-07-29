import { useEffect } from "react";
import { initAbout } from "../lib/sections/about.js";
import "./About.css";

// CONTEÚDO PLACEHOLDER — substituir a trajetória por dados reais.
const TIMELINE = [
  {
    when: "2024 — hoje",
    what: "Desenvolvedor full-stack",
    where:
      "Produto próprio, do banco de dados à interface. Responsável pela arquitetura e pelo design system.",
  },
  {
    when: "2022 — 2024",
    what: "Engenheiro de software",
    where:
      "Plataforma de dados e integrações. Pipelines de faturamento e ferramentas internas.",
  },
  {
    when: "2020 — 2022",
    what: "Desenvolvedor frontend",
    where:
      "Interfaces para clientes de varejo, com foco em performance e acessibilidade.",
  },
  { when: "2019", what: "Formação", where: "Ciência da Computação." },
];

export default function About() {
  useEffect(() => initAbout(), []);

  return (
    <section id="sobre" className="block layer">
      <div className="block__head fade-in">
        <span className="block__label" data-index="04">
          Sobre
        </span>
        <div>
          <h2 className="block__title">
            Gosto de sistemas que funcionam bem e parecem intencionais.
          </h2>
        </div>
      </div>

      <div className="about__grid">
        {/* CONTEÚDO PLACEHOLDER — bio em primeira pessoa.
            Para usar uma foto, troque about__portrait--empty por
            <div className="about__portrait"><img src="..." alt="..." /></div> */}
        <div className="about__bio fade-in">
          <div className="about__portrait about__portrait--empty">
            <span>retrato</span>
          </div>
          <p>
            Trabalho na fronteira entre engenharia e design de interface —
            cuidando tanto da arquitetura que sustenta um produto quanto do
            detalhe que o torna agradável de usar.
          </p>
          <p>
            Comecei pelo backend, onde aprendi a gostar de sistemas que se
            explicam sozinhos, e fui parar no frontend porque é ali que a
            decisão técnica encontra a pessoa que vai conviver com ela. Hoje
            faço os dois, e acho que o trabalho fica melhor quando não são
            duas pessoas diferentes fazendo cada metade.
          </p>
          <p>
            Fora do editor, geralmente estou{" "}
            <strong>desmontando alguma coisa</strong> para entender como foi
            feita.
          </p>
        </div>

        <ol className="timeline">
          {TIMELINE.map((t) => (
            <li className="tl" key={t.when}>
              <p className="tl__when">{t.when}</p>
              <h3 className="tl__what">{t.what}</h3>
              <p className="tl__where">{t.where}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
