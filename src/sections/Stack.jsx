import { useEffect } from "react";
import { initStack } from "../lib/sections/stack.js";
import "./Stack.css";

// CONTEÚDO PLACEHOLDER — ajustar para as ferramentas que você realmente usa.
const STACK_GROUPS = [
  {
    title: "Linguagens",
    items: ["C/C++", "Java", "Python", "JavaScript", "TypeScript"],
  },
  {
    title: "Frameworks",
    items: ["React", "Express", "Django", "Spring"],
  },
  { title: "Bancos de Dados", items: ["PostgreSQL", "MySQL", "SQLite"] },
  { title: "Outros", items: ["GitHub", "Figma", "Claude Code", "Vercel"] },
];

// continuous index across all columns, computed once at module load, so the
// reveal sweeps the whole grid rather than firing four columns in lockstep
let _i = 0;
const STACK_GROUPS_INDEXED = STACK_GROUPS.map((g) => ({
  title: g.title,
  items: g.items.map((item) => ({ item, i: _i++ })),
}));

export default function Stack() {
  useEffect(() => initStack(), []);

  return (
    <section id="stack" className="stack block layer">
      <div className="block__head fade-in">
        <span className="block__label" data-index="03">
          Ferramentas
        </span>
        <div>
          <h2 className="block__title">Tecnologias que eu já utilizei.</h2>
        </div>
      </div>

      <div className="stack__grid">
        {STACK_GROUPS_INDEXED.map((g) => (
          <div className="stack__group" key={g.title}>
            <h3>{g.title}</h3>
            <ul>
              {g.items.map(({ item, i }) => (
                <li key={item} style={{ "--i": i, cursor: "default" }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
