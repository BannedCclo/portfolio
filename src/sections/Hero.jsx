import { useEffect } from "react";
import { initHero } from "../three/acts/hero.js";
import "./Hero.css";

/**
 * The pinned brain sequence. Almost all of the actual behaviour — scroll
 * phases, camera choreography, the synapse shader — lives in
 * src/three/acts/hero.js; this component just renders the overlay chrome
 * that takes turns in front of the shared 3D canvas and wires that module up
 * on mount.
 */
export default function Hero() {
  useEffect(() => initHero(), []);

  return (
    <section id="brain" className="layer">
      <div className="brain-fade-bottom" />

      <div className="brain-title-screen" id="brainTitleScreen">
        <p className="brain-title-screen__eyebrow">Portfólio</p>
        <h1 className="brain-title-screen__name">Marcelo Guimarães</h1>
      </div>

      <div className="brain-hint" id="brainHint">
        <span>role para revelar</span>
        <span className="brain-hint__bar" />
      </div>

      <div className="brain-progress" id="brainProgress" aria-hidden="true">
        <i />
      </div>

      <div className="brain-page" id="brainPage0">
        <p className="brain-eyebrow">Desenvolvedor de software — Brasil</p>
        <h2 className="brain-title">
          Software com <em>precisão</em><br />e um pouco de peso.
        </h2>
        <div className="brain-row">
          <p className="brain-sub">
            Construo produtos digitais onde engenharia e forma andam juntas —
            do backend à última curva de uma animação.
          </p>
          <a className="brain-cta" href="#trabalho">
            Ver trabalho
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M3 3L11 11M11 11V4M11 11H4"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
          </a>
        </div>
      </div>

      <div className="brain-page" id="brainPage1">
        <p className="brain-eyebrow">Como eu penso</p>
        <h2 className="brain-page-title">
          Prefiro decisões simples e bem justificadas, mesmo quando o caminho
          fácil pedia outra coisa.
        </h2>
      </div>

      <div className="brain-page brain-page--right" id="brainPage2">
        <p className="brain-eyebrow">O que vem a seguir</p>
        <h2 className="brain-page-title">
          Alguns lugares onde essa forma de pensar virou produto.
        </h2>
      </div>

      <div className="brain-exit-fade" id="brainExitFade" aria-hidden="true" />
    </section>
  );
}
