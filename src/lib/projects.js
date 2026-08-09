import carbonShot from "../assets/projects/carbon.png";
import f1statsShot from "../assets/projects/f1stats.png";
import noharmShot from "../assets/projects/noharm.png";
import physixShot from "../assets/projects/physix.png";

// Projetos reais, compartilhados entre a seção Experiência (Work.jsx) e o
// botão de projeto aleatório do footer — uma única fonte de verdade para não
// os dois lugares desincronizarem quando um projeto for adicionado.
export const PROJECTS = [
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
