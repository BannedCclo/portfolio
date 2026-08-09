import { useEffect } from "react";
import { initAbout } from "../lib/sections/about.js";
import "./About.css";

// Link institucional de cada marco — usado por tl__where para destacar o nome
// da instituição em laranja (--copper) e linkar para o site oficial.
const INSTITUTIONS = {
  Buddys: "https://buddys-programadores-do-futuro.webflow.io/",
  COTEMIG: "https://www.cotemig.com.br/",
  NoHarm: "https://noharm.ai/",
  "PUC-MG": "https://www.pucminas.br/",
};

// CONTEÚDO PLACEHOLDER — substituir a trajetória por dados reais.
const TIMELINE = [
  {
    when: "2015",
    what: "Introdução",
    where: [
      "Aos 8 anos, desenvolvi meu primeiro interesse pela área e comecei a aprender na escola ",
      "Buddys",
      ".",
    ],
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
    where: [
      "Tomei um passo maior e concluí meu ensino médio no curso técnico em informática ",
      "COTEMIG",
      ".",
    ],
  },
  {
    when: "2023",
    what: "Estágio",
    where: ["Na ", "NoHarm", ", estagiei como desenvolvedor de testes unitários Python."],
  },
  {
    when: "2025",
    what: "Universidade",
    where: [
      "Buscando ampliar minhas capacidades, ingressei na ",
      "PUC-MG",
      ", para Engenharia de Software.",
    ],
  },
];

// Marcos com trecho institucional destacam a instituição em `<mark>` — link
// quando há URL confirmada, span quando ainda não há (Buddys). Marcos sem
// instituição continuam string simples, sem passar por isto.
function renderWhere(where) {
  if (typeof where === "string") return where;
  const [before, institution, after] = where;
  const href = INSTITUTIONS[institution];
  return (
    <>
      {before}
      {href ? (
        <a
          className="tl__institution"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          {institution}
        </a>
      ) : (
        <span className="tl__institution">{institution}</span>
      )}
      {after}
    </>
  );
}

export default function About() {
  useEffect(() => initAbout(), []);

  return (
    <section id="sobre" className="block layer">
      <div className="block__head fade-in">
        <span className="block__label" data-index="01">
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
              <p className="tl__where">{renderWhere(t.where)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
