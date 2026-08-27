import { useRef, useState } from "react";
import { PROJECTS } from "../lib/projects.js";
import { useLanguage } from "../lib/i18n/LanguageContext.jsx";
import "./RandomProjectButton.css";

// Layout de pontos por face, num sistema de coordenadas 0-100 — o mesmo dado
// usado tanto para desenhar quanto para escolher a próxima face ao girar.
const PIPS_BY_FACE = {
  1: [[50, 50]],
  2: [
    [28, 28],
    [72, 72],
  ],
  3: [
    [28, 28],
    [50, 50],
    [72, 72],
  ],
  4: [
    [28, 28],
    [72, 28],
    [28, 72],
    [72, 72],
  ],
  5: [
    [28, 28],
    [72, 28],
    [50, 50],
    [28, 72],
    [72, 72],
  ],
  6: [
    [28, 26],
    [72, 26],
    [28, 50],
    [72, 50],
    [28, 74],
    [72, 74],
  ],
};

const DiceFace = ({ face }) => (
  <svg width="22" height="22" viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <rect x="6" y="6" width="88" height="88" rx="18" stroke="currentColor" strokeWidth="7" />
    {PIPS_BY_FACE[face].map(([cx, cy]) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="8" fill="currentColor" />
    ))}
  </svg>
);

// Rola o dado visualmente por alguns instantes antes de escolher o projeto
// de verdade e abrir a aba — o atraso é o que transforma "abrir link
// qualquer" em "sorteio", sem precisar de nada além de um setInterval.
export default function RandomProjectButton() {
  const [face, setFace] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const intervalRef = useRef(null);
  const { s } = useLanguage();
  const { randomProject } = s;

  const roll = () => {
    if (spinning) return;
    setSpinning(true);
    let ticks = 0;
    intervalRef.current = window.setInterval(() => {
      setFace(1 + Math.floor(Math.random() * 6));
      ticks += 1;
      if (ticks >= 10) {
        window.clearInterval(intervalRef.current);
        setSpinning(false);
        const project = PROJECTS[Math.floor(Math.random() * PROJECTS.length)];
        window.open(project.href, "_blank", "noopener,noreferrer");
      }
    }, 90);
  };

  return (
    <div className="random-project-cta">
      <p className="random-project-cta__title">{randomProject.title}</p>
      <button
        type="button"
        className="random-project"
        onClick={roll}
        disabled={spinning}
        aria-label={randomProject.aria}
      >
        <span className={`random-project__dice${spinning ? " is-spinning" : ""}`}>
          <DiceFace face={face} />
        </span>
        <span className="random-project__text">
          <span className="random-project__title">{randomProject.cta}</span>
          <span className="random-project__hint">
            {spinning ? randomProject.rolling : randomProject.hint}
          </span>
        </span>
      </button>
    </div>
  );
}
