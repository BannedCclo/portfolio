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

// Projetos reais. Mais serão adicionados depois (ver histórico de conversa).
// Para usar uma captura de tela real, troque <ProjectArt seed={p.seed} />
// por um <img> dentro de .proj__visual.
const PROJECTS = [
  {
    seed: "carbon",
    index: "01",
    year: "2025–2026",
    name: "Carbon — plataforma de concessionária",
    outcome:
      "Site completo para uma concessionária: cadastro e busca de veículos com fotos, autenticação de usuários e preenchimento automático de endereço por CEP. Client e API publicados em produção.",
    stack: ["React", "TypeScript", "Node.js", "Sequelize", "Postgres"],
    href: "https://carbonluxury.vercel.app",
  },
  {
    seed: "f1stats",
    index: "02",
    year: "2026",
    name: "F1stats — estatísticas de Fórmula 1",
    outcome:
      "Todo o histórico da Fórmula 1 migrado para Postgres, com sincronização diária automatizada via GitHub Actions e API serverless — corridas, pilotos e classificações sempre atualizados sem intervenção manual.",
    stack: ["React", "TypeScript", "Express", "Drizzle ORM", "Postgres"],
    href: "https://f1stats-client.vercel.app",
  },
  {
    seed: "noharm",
    index: "03",
    year: "2023",
    name: "NoHarm.ai — IA para farmácia clínica",
    outcome:
      "Atuei como dev de testes unitários em Python no sistema de IA que ajuda farmacêuticos clínicos a identificar erros de prescrição em hospitais.",
    stack: ["Python", "Testes automatizados"],
    href: "https://noharm.ai",
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
                <ProjectArt seed={p.seed} />
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
