import { useEffect } from "react";
import { initAbout } from "../lib/sections/about.js";
import "./About.css";

// CONTEÚDO PLACEHOLDER — substituir a trajetória por dados reais.
const TIMELINE = [
  {
    when: "2015",
    what: "Introdução",
    where:
      "Aos 8 anos, desenvolvi meu primeiro interesse pela área e comecei a aprender na escola Buddys.",
  },
  {
    when: "2021",
    what: "Estudos autônomos",
    where:
      "Na quarentena, retomei meus estudos na área com um curso online da USP, de Python.",
  },
  {
    when: "2023",
    what: "Curso técnico",
    where:
      "Tomei um passo maior e concluí meu ensino médio no curso técnico em informática COTEMIG.",
  },
  {
    when: "2023",
    what: "Estágio",
    where: "Na NoHarm, estagiei como desenvolvedor de testes unitários Python.",
  },
  {
    when: "2025 - hoje",
    what: "Faculdade",
    where:
      "Buscando ampliar minhas capacidades, ingressei na PUC-MG, para Engenharia de Software.",
  },
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
          <h2 className="block__title">Conheça a minha trajetória.</h2>
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
            Desde criança, sempre gostei de entender como as coisas funcionam.
            Por isso, acabei me interessando por programação, também incentivado
            por grandes referências da área que tenho na família.
          </p>
          <p>
            Hoje em dia, quanto mais eu aprendo, mais eu percebo que estou na
            área certa para mim, e que ainda tenho muito a aprender. Por isso,
            busco sempre me aprimorar, estudando, praticando e me inspirando em
            pessoas que admiro.
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
