# Portfólio — Marcelo Guimarães

Projeto React + Vite.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # gera dist/
npm run preview   # serve o build de produção localmente
```

---

## O que falta você preencher

Tudo que está marcado com `CONTEÚDO PLACEHOLDER` foi escrito por mim como
espaço reservado. O que bloqueia o site ficar real:

| Onde | O que | Arquivo |
|---|---|---|
| Trabalho | 4 projetos: ano, nome, **o resultado em uma frase com número**, stack, link | `src/sections/Work.jsx` (array `PROJECTS`) |
| Capturas | um `<img>` dentro de `.proj__visual` substitui `<ProjectArt>` (a arte gerada automaticamente) | `src/sections/Work.jsx` |
| Ferramentas | as ferramentas que você realmente usa | `src/sections/Stack.jsx` (array `STACK_GROUPS`) |
| Sobre | bio em primeira pessoa | `src/sections/About.jsx` |
| Trajetória | empregos e formação com datas | `src/sections/About.jsx` (array `TIMELINE`) |
| Retrato | trocar `.about__portrait--empty` por `<div className="about__portrait"><img … /></div>` | `src/sections/About.jsx` |
| Contato | links reais do GitHub e do LinkedIn (hoje `href="#"`) | `src/sections/Contact.jsx` |

O manifesto (as três opiniões) também é meu chute a partir do que você já tinha
escrito — vale reescrever com as suas, em `src/sections/Manifesto.jsx`.

---

## Estrutura

```
index.html                    entrada do Vite — só <div id="root"> e o script
src/
  main.jsx                    bootstrap (StrictMode, scrollRestoration)
  App.jsx                     compõe a página inteira
  styles/
    tokens.css                cores, escala tipográfica, espaçamento, easing
    base.css                  reset, nav, rodapé, chrome de seção
    reduced-motion.css        carregado por último, vence os outros
  lib/                        utilitários agnósticos de framework
    motion.js                 a linguagem de movimento (leia isto primeiro)
    ticker.js                 um RAF para toda animação de DOM
    split.js                  quebra texto em palavras mascaradas
    artwork.js                arte procedural dos cards, semeada pelo nome
    gsap.js                   único ponto de registro dos plugins do GSAP
    sections/*.js             comportamento de manifesto/trabalho/stack/sobre
  three/
    stage.js                  um canvas WebGL para a página inteira + diretor de atos
    acts/hero.js               o cérebro
    acts/finale.js             o cérebro de volta, no contato
  components/                 Stage, Nav, Spine, Footer, ProjectArt
  sections/                   um componente + um .css por seção
tools/
  bake-brain.mjs               brain.stl → public/assets/brain.glb (rodar só se a malha mudar)
assets-source/
  brain.stl                    fonte do baker, 4,1 MB — não vai para o build
public/assets/
  brain.glb                    o que o site carrega (1,9 MB)
  favicon.svg, og.png
```

---

## Por que React aqui, especificamente

O 3D e a coreografia de scroll continuam **imperativos** — Three.js e GSAP
ScrollTrigger não ganham nada sendo reescritos em `@react-three/fiber` ou
controlados por estado do React, e fazer isso adicionaria uma camada de
reconciliação exatamente onde o código já precisa rodar a 60fps de forma
previsível. Por isso `src/three/` e `src/lib/sections/*.js` são módulos comuns,
sem JSX — cada componente de seção só faz `useEffect(() => initX(), [])` e
descarta a função de cleanup que `initX()` devolve.

Essa função de cleanup existe porque, em desenvolvimento, o `<StrictMode>`
roda todo efeito duas vezes de propósito (monta → limpa → monta de novo) para
expor efeitos que não são idempotentes. Sem uma limpeza correta, isso
duplicaria pins do ScrollTrigger, listeners de ponteiro e `IntersectionObserver`s
— cada `initX()` neste projeto foi escrito já esperando por isso.

---

## As três regras de movimento

Estão em `src/lib/motion.js` e valem para qualquer seção nova. São elas que
fazem a página inteira parecer uma peça só em vez de um herói bonito seguido
de seções genéricas:

1. **Nunca ligue uma propriedade visual direto ao scroll.** O scroll define o
   *alvo*; o valor renderizado persegue esse alvo com `damp()`. É isso que
   sobrevive a um scroll rápido sem parecer mecânico.
2. **Nunca anime um eixo sozinho.** Toda transição move duas ou três
   propriedades juntas. Movimento de eixo único lê como carrossel.
3. **Transições longas e sobrepostas**, não passos discretos — use
   `sampleCurve()` com keyframes que se sobrepõem.

Corolário de performance: escreva os valores amortecidos em CSS custom
properties uma vez por frame e deixe o CSS aplicar. Não anime centenas de
elementos direto do JS — nem via `style.setProperty`, nem via `setState`.

---

## Detalhes que não são óbvios

- **Um canvas só.** Todo o 3D da página desenha no mesmo `#stage`, montado uma
  vez por `<Stage>` e nunca desmontado. Seções registram "atos" via
  `registerAct()`/`unregisterAct()`; o diretor atualiza só os que estão perto e
  **pula o render inteiro** quando nenhum está na tela.
- **`act.wantsRender`** existe porque a seção do herói continua a menos de uma
  viewport do manifesto muito depois da sequência dele acabar — sem isso o
  cérebro reaparece atrás do texto seguinte.
- **A galeria não usa `scrub`.** O ScrollTrigger reporta progresso cru e o
  amortecimento é feito no ticker. Empilhar `scrub` sobre `damp()` dá lag duplo.
- **`scroll-behavior: smooth` está desligado de propósito** — briga com os pins
  do ScrollTrigger. Os âncoras da nav usam o `ScrollToPlugin` do GSAP.
- **`js/split.js` mexe no DOM na mão dentro de um componente React** — e isso é
  intencional, não um descuido. O parágrafo alvo nunca muda depois do mount
  (sem props/estado dirigindo seu conteúdo), então o React nunca reconcilia
  aquele subtree de novo; `splitWords()` é idempotente (guardado por
  `data-split`), então mesmo a dupla chamada do `StrictMode` é inofensiva.
- **O cérebro vem pronto.** Orientação, corte do bulbo, solda, suavização de
  Taubin, centralização e escala são assados por `tools/bake-brain.mjs`
  (`npm run bake-brain`). Isso tudo rodava no navegador, na main thread, a
  cada carregamento, antes de virar um passo offline.
- **Atribuição obrigatória.** O modelo do cérebro é de Nevit Dilmen (Wikimedia
  Commons, CC BY-SA 3.0 / GFDL). O crédito no rodapé (`src/components/Footer.jsx`)
  é condição da licença — não remova.

---

## Verificação

- Redimensione abaixo de 820px: a galeria horizontal vira uma pilha vertical.
  Não é opcional — scroll horizontal em celular e trackpad é hostil.
- Ligue "reduzir movimento" no sistema: todos os pins somem, o conteúdo fica em
  fluxo normal e a galeria vira uma grade.
- Navegue só com Tab pela galeria: o foco arrasta a página junto com os cards.
- `npm run build` deve terminar sem erros; o aviso de chunk >500kB é esperado
  (Three.js + GSAP + React) e não é um bug.
