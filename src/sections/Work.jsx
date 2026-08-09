import { useEffect } from "react";
import { initWork } from "../lib/sections/work.js";
import ProjectArt from "../components/ProjectArt.jsx";
import carbonShot from "../assets/projects/carbon.png";
import f1statsShot from "../assets/projects/f1stats.png";
import noharmShot from "../assets/projects/noharm.png";
import physixShot from "../assets/projects/physix.png";
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

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.5 7.5 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

// Projetos reais. Mais serão adicionados depois (ver histórico de conversa).
// Projetos sem captura de tela própria (`shot`) caem no ProjectArt
// procedural — ver .proj__visual mais abaixo.
const PROJECTS = [
  {
    seed: "noharm",
    index: "01",
    year: "2023",
    name: "NoHarm.ai — IA para farmácia clínica",
    outcome:
      "Atuei como dev de testes unitários em Python no sistema de IA que ajuda farmacêuticos clínicos a identificar erros de prescrição em hospitais.",
    stack: ["Python", "Testes automatizados"],
    href: "https://noharm.ai",
    github: "https://github.com/noharm-ai/backend",
    shot: noharmShot,
  },
  {
    seed: "carbon",
    index: "02",
    year: "2025–2026",
    name: "Carbon — plataforma de concessionária",
    outcome:
      "Site completo para uma concessionária: cadastro e busca de veículos com fotos, autenticação de usuários e preenchimento automático de endereço por CEP. Client e API publicados em produção.",
    stack: ["React", "TypeScript", "Node.js", "Sequelize", "Postgres"],
    href: "https://carbonluxury.vercel.app",
    github: "https://github.com/BannedCclo/Carbon",
    shot: carbonShot,
  },
  {
    seed: "f1stats",
    index: "03",
    year: "2026",
    name: "F1stats — estatísticas de Fórmula 1",
    outcome:
      "Todo o histórico da Fórmula 1 migrado para Postgres, com sincronização diária automatizada via GitHub Actions e API serverless — corridas, pilotos e classificações sempre atualizados sem intervenção manual.",
    stack: ["React", "TypeScript", "Express", "Drizzle ORM", "Postgres"],
    href: "https://f1stats-client.vercel.app",
    github: "https://github.com/BannedCclo/F1stats",
    shot: f1statsShot,
  },
  {
    seed: "physix",
    index: "04",
    year: "2024",
    name: "PhysiX — rede social para aulas de física",
    outcome:
      "Projeto final de curso técnico: plataforma social que conecta professores e alunos de física, com compartilhamento de material, curtidas, comentários e agendamento de aulas particulares entre aluno e professor.",
    stack: ["React", "TypeScript", "Node.js", "Express", "Knex", "SQLite"],
    href: "https://github.com/ArthurAnicio/PhysiX",
    github: "https://github.com/ArthurAnicio/PhysiX",
    shot: physixShot,
  },
];

export default function Work() {
  useEffect(() => initWork(), []);

  return (
    <section id="trabalho" className="work layer">
      <div className="work__pin">
        <header className="work__head fade-in">
          <span className="block__label" data-index="02">
            Experiência
          </span>
          <h2 className="work__title">Alguns projetos dos quais participei.</h2>
        </header>

        <div className="work__track">
          {PROJECTS.map((p) => (
            <article className="proj" key={p.seed} data-seed={p.seed}>
              <div className="proj__visual">
                {p.shot ? (
                  <img src={p.shot} alt="" loading="lazy" />
                ) : (
                  <ProjectArt seed={p.seed} />
                )}
                {p.github && (
                  <a
                    className="proj__github"
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ver código de ${p.name} no GitHub`}
                  >
                    <GithubIcon />
                  </a>
                )}
              </div>
              <div className="proj__body">
                <div className="proj__meta">
                  <span className="proj__index">{p.index}</span>
                  <span>{p.year}</span>
                </div>
                <h3 className="proj__name">
                  <a
                    className="proj__link"
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
