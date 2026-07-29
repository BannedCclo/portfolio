import { useEffect } from "react";
import { initFinale } from "../three/acts/finale.js";
import "./Contact.css";

export default function Contact() {
  useEffect(() => initFinale(), []);

  return (
    <section id="contato" className="contact layer">
      <p className="contact__eyebrow">Contato</p>
      <h2 className="contact__title">
        Vamos construir
        <br />
        alguma coisa.
      </h2>
      <a className="contact__mail" href="mailto:marcelosg909@gmail.com">
        marcelosg909@gmail.com
      </a>
      {/* CONTEÚDO PLACEHOLDER — trocar pelos seus perfis reais */}
      <div className="contact__links">
        <a href="#" target="_blank" rel="noopener">
          GitHub
        </a>
        <a href="#" target="_blank" rel="noopener">
          LinkedIn
        </a>
      </div>
    </section>
  );
}
