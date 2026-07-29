import { useEffect } from "react";
import { initWork } from "../lib/sections/work.js";
import ProjectArt from "../components/ProjectArt.jsx";
import "./Work.css";

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
    <path
      d="M3 11L11 3M11 3H4M11 3V10"
      stroke="currentColor"
      strokeWidth="1.4"
    />
  </svg>
);

// CONTEÚDO PLACEHOLDER — substituir por projetos reais.
// Para cada projeto: ano, nome, o resultado em uma frase (de preferência com
// número), stack e link. Para usar uma captura de tela real, troque
// <ProjectArt seed={p.seed} /> por um <img> dentro de .proj__visual.
const PROJECTS = [
  {
    seed: "painel-operacoes",
    index: "01",
    year: "2025",
    name: "Painel de operações em tempo real",
    outcome:
      "Centralizou alertas que antes viviam em cinco ferramentas diferentes. O tempo médio até a primeira ação caiu de 40 para 9 minutos.",
    stack: ["React", "Node", "WebSocket", "Postgres"],
  },
  {
    seed: "motor-recomendacao",
    index: "02",
    year: "2024",
    name: "Motor de recomendação para varejo",
    outcome:
      "Substituiu uma lista de mais vendidos fixa por ranqueamento por sessão. Sete pontos percentuais a mais de conversão na vitrine inicial.",
    stack: ["Python", "PyTorch", "Airflow", "Redis"],
  },
  {
    seed: "identidade-institucional",
    index: "03",
    year: "2023",
    name: "Identidade visual e site institucional",
    outcome:
      "Design system e site construídos juntos, do token de cor ao último estado de foco. Novas páginas passaram a sair em horas, não em sprints.",
    stack: ["TypeScript", "Astro", "GSAP"],
  },
  {
    seed: "pipeline-dados",
    index: "04",
    year: "2022",
    name: "Pipeline de dados para faturamento",
    outcome:
      "Fechamento mensal que levava três dias de conferência manual passou a rodar sozinho, com trilha de auditoria por registro.",
    stack: ["Python", "dbt", "BigQuery", "Terraform"],
  },
];

export default function Work() {
  useEffect(() => initWork(), []);

  return (
    <section id="trabalho" className="work layer">
      <div className="work__pin">
        <header className="work__head fade-in">
          <span className="block__label" data-index="02">
            Trabalho selecionado
          </span>
          <h2 className="work__title">
            Alguns projetos onde a forma acompanhou a função.
          </h2>
        </header>

        <div className="work__track">
          {PROJECTS.map((p) => (
            <article className="proj" key={p.seed} data-seed={p.seed}>
              <div className="proj__visual">
                <ProjectArt seed={p.seed} />
              </div>
              <div className="proj__body">
                <div className="proj__meta">
                  <span className="proj__index">{p.index}</span>
                  <span>{p.year}</span>
                </div>
                <h3 className="proj__name">
                  <a className="proj__link" href="#">
                    {p.name}
                  </a>
                </h3>
                <p className="proj__outcome">{p.outcome}</p>
                <div className="proj__stack">
                  {p.stack.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
                <span className="proj__more" aria-hidden="true">
                  Ver projeto
                  <ArrowIcon />
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="work__rail" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  );
}
