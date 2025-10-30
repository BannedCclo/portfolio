import { useEffect, useRef } from "react";
import "./App.css";
import curriculo from "./assets/Currículo.pdf";
import { useInView } from "react-intersection-observer";
import cssLogo from "./assets/images/css.png";
import htmlLogo from "./assets/images/html.png";
import jsLogo from "./assets/images/javascript.png";
import reactLogo from "./assets/images/react.png";
import cLogo from "./assets/images/c.png";
import cppLogo from "./assets/images/cpp.png";
import csharpLogo from "./assets/images/csharp.png";
import pythonLogo from "./assets/images/python.png";
import githubLogo from "./assets/images/github.png";
import figmaLogo from "./assets/images/figma.png";
import pythonFlask from "./assets/images/pythonFlask.jpg";
import reactBanner from "./assets/images/reactCurso.jpeg";
import udemyLogo from "./assets/images/udemy.png";
import courseraLogo from "./assets/images/coursera.png";
import cotemigLogo from "./assets/images/cotemig.png";
import noharmLogo from "./assets/images/noharm.png";
import pythonBanner from "./assets/images/pythonBanner.png";
import cotemigBanner from "./assets/images/cotemigBanner.jpg";
import noharmBanner from "./assets/images/noharmBanner.png";
import physix from "./assets/images/physix.png";

export default function App() {
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);

  const { ref: blueRef, inView: inViewBlue } = useInView({ threshold: 0.5 });
  const { ref: redRef, inView: inViewRed } = useInView({ threshold: 0.5 });
  const { ref: purpleRef, inView: inViewPurple } = useInView({
    threshold: 0.5,
  });
  const { ref: greenRef, inView: inViewGreen } = useInView({ threshold: 0.5 });
  const { ref: yellowRef, inView: inViewYellow } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (mainRef.current && bubbleRef.current) {
      if (inViewBlue) {
        mainRef.current.style.backgroundColor = "#0b1731";
        bubbleRef.current.style.setProperty("--color", "#61b3ff");
      }
      if (inViewRed) {
        mainRef.current.style.backgroundColor = "#310b0b";
        bubbleRef.current.style.setProperty("--color", "#ff8080");
      }
      if (inViewPurple) {
        mainRef.current.style.backgroundColor = "#260b31";
        bubbleRef.current.style.setProperty("--color", "#a459c2");
      }
      if (inViewGreen) {
        mainRef.current.style.backgroundColor = "#001f00";
        bubbleRef.current.style.setProperty("--color", "#5dbe5d");
      }
      if (inViewYellow) {
        mainRef.current.style.backgroundColor = "#222000";
        bubbleRef.current.style.setProperty("--color", "#beb85d");
      }
    }
  }, [inViewBlue, inViewRed, inViewPurple, inViewGreen, inViewYellow]);

  useEffect(() => {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf: number | null = null;
    const tick = () => {
      x += (tx - x) * 0.02;
      y += (ty - y) * 0.02;

      const el = bubbleRef.current;
      if (el) {
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <main ref={mainRef}>
        <div id="bubble" ref={bubbleRef} aria-hidden="true">
          <div className="shape" />
          <div className="shape" />
        </div>
        <section id="first" className="page" ref={blueRef}>
          <div>
            <h1>
              Oi! Meu nome é <br />
              <span id="name">Marcelo Guimarães</span>
            </h1>
            <p>
              Desenvolvi esse portfólio para que você conheça mais sobre o meu
              <span className="blue">
                {" "}
                <a href={curriculo} download="Curriculo_Marcelo_Guimaraes">
                  currículo
                </a>{" "}
                <i className="fa-solid fa-arrow-pointer"></i>
              </span>
            </p>
          </div>
          <div>
            <ul>
              <li>
                <a href="#second">
                  <h3>Conhecimento</h3>
                </a>
              </li>
              <li>
                <a href="#third">
                  <h3>Experiência</h3>
                </a>
              </li>
              <li>
                <a href="#fourth">
                  <h3>Projetos</h3>
                </a>
              </li>
              <li>
                <a href="#fifth">
                  <h3>Contato</h3>
                </a>
              </li>
            </ul>
          </div>
        </section>
        <section id="second" className="page" ref={redRef}>
          <div>
            <h1>Conhecimento</h1>
            <h2>
              Veja as <span id="red">tecnologias</span> que aprendi a utilizar
            </h2>
            <h3>(Organizados em ordem de experiência)</h3>
          </div>
          <div>
            <div className="logo veryGood">
              <img src={htmlLogo} alt="HTML Logo" />
              <h3>HTML</h3>
            </div>
            <div className="logo veryGood">
              <img src={cssLogo} alt="CSS Logo" />
              <h3>CSS</h3>
            </div>
            <div className="logo veryGood">
              <img src={jsLogo} alt="JavaScript Logo" />
              <h3>JavaScript</h3>
            </div>
            <div className="logo veryGood">
              <img src={reactLogo} alt="React Logo" />
              <h3>React</h3>
            </div>
            <div className="logo good">
              <img src={githubLogo} alt="GitHub Logo" />
              <h3>GitHub</h3>
            </div>
            <div className="logo good">
              <img src={pythonLogo} alt="Python Logo" />
              <h3>Python</h3>
            </div>
            <div className="logo good">
              <img src={cLogo} alt="C Logo" />
              <h3>C</h3>
            </div>
            <div className="logo good">
              <img src={cppLogo} alt="C++ Logo" />
              <h3>C++</h3>
            </div>
            <div className="logo ok">
              <img src={csharpLogo} alt="C# Logo" />
              <h3>C#</h3>
            </div>
            <div className="logo ok">
              <img src={figmaLogo} alt="Figma Logo" />
              <h3>Figma</h3>
            </div>
          </div>
        </section>
        <section id="third" className="page" ref={purpleRef}>
          <div>
            <h1>Experiências</h1>
            <h2>
              Estes são os <span id="purple">aprendizados</span> que me ajudaram
              a evoluir
            </h2>
          </div>
          <div id="classWrapper">
            <div className="flipCard">
              <div className="flipCardInner">
                <div className="flipCardFront">
                  <div>
                    <img src={pythonBanner} alt="Python" />
                  </div>
                  <p className="cardTitle">Python básico</p>
                  <div>
                    <img src={courseraLogo} alt="Coursera" />
                  </div>
                  <div className="label">Curso</div>
                </div>
                <div className="flipCardBack">
                  <div>
                    <p>
                      Curso online na Coursera pela USP sobre introdução à
                      Ciência da computação com Python
                    </p>
                  </div>
                  <div>
                    <a
                      href="https://www.coursera.org/learn/ciencia-computacao-python-conceitos"
                      target="_blank"
                    >
                      Saiba mais
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="flipCard">
              <div className="flipCardInner">
                <div className="flipCardFront">
                  <div>
                    <img src={pythonFlask} alt="Flask Python" />
                  </div>
                  <p className="cardTitle">Flask com Python</p>
                  <div>
                    <img src={udemyLogo} alt="Udemy" />
                  </div>
                  <div className="label">Curso</div>
                </div>
                <div className="flipCardBack">
                  <div>
                    <p>
                      Curso online na Udemy por Danilo Moreira sobre o uso de
                      REST APIs com Python e Flask
                    </p>
                  </div>
                  <div>
                    <a
                      href="https://www.udemy.com/course/rest-apis-com-python-e-flask"
                      target="_blank"
                    >
                      Saiba mais
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="flipCard">
              <div className="flipCardInner">
                <div className="flipCardFront">
                  <div>
                    <img src={reactBanner} alt="Curso Front-end" />
                  </div>
                  <p className="cardTitle">Front-end</p>
                  <div>
                    <img src={udemyLogo} alt="Udemy" />
                  </div>
                  <div className="label">Curso</div>
                </div>
                <div className="flipCardBack">
                  <div>
                    <p>
                      Curso online na Udemy por Matheus Battisti sobre
                      desenvolvimento Front-end com React
                    </p>
                  </div>
                  <div>
                    <a
                      href="https://www.udemy.com/course/formacao-front-end-html-css-javascript-react-e"
                      target="_blank"
                    >
                      Saiba mais
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="flipCard">
              <div className="flipCardInner">
                <div className="flipCardFront">
                  <div>
                    <img src={cotemigBanner} alt="Ensino médio técnico" />
                  </div>
                  <p className="cardTitle">COTEMIG</p>
                  <div>
                    <img src={cotemigLogo} alt="COTEMIG" />
                  </div>
                  <div className="label">Ensino Médio</div>
                </div>
                <div className="flipCardBack">
                  <div>
                    <p>
                      Ensino médio técnico em informática no colégio COTEMIG
                    </p>
                  </div>
                  <div>
                    <a href="https://www.cotemig.com.br/" target="_blank">
                      Saiba mais
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="flipCard">
              <div className="flipCardInner">
                <div className="flipCardFront">
                  <div>
                    <img src={noharmBanner} alt="Estágio" />
                  </div>
                  <p className="cardTitle">NoHarm</p>
                  <div>
                    <img src={noharmLogo} alt="NoHarm" />
                  </div>
                  <div className="label">Estágio</div>
                </div>
                <div className="flipCardBack">
                  <div>
                    <p>
                      Estágio na empresa NoHarm (desenvolvimento de testes
                      unitários em Python)
                    </p>
                  </div>
                  <div>
                    <a href="https://noharm.ai/" target="_blank">
                      Saiba mais
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="fourth" className="page" ref={greenRef}>
          <h1>Projetos</h1>
          <h2>
            Aqui estão as <span id="green">ideias</span> que ajudei a
            desenvolver
          </h2>
          <div id="slider">
            <div className="project">
              <img src={physix} alt="" />
            </div>
          </div>
        </section>
        <section id="fifth" className="page" ref={yellowRef}></section>
      </main>
    </>
  );
}
