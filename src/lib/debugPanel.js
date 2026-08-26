/* ===========================================================
   debugPanel.js — diagnóstico temporário, visível na própria página

   Só existe para investigar o bug do cérebro travado no A54 sem acesso a
   devtools remoto (USB). Ativa com ?debug na URL. Atualiza sozinho a cada
   meio segundo para capturar o estado durante o scroll. Depende de
   window.__stageDebug, exposto por three/stage.js só em dev. Seguro para
   remover assim que o diagnóstico terminar.
   =========================================================== */
export function mountDebugPanel() {
  if (!new URLSearchParams(location.search).has("debug")) return;

  let renderer = "desconhecido";
  try {
    const gl =
      document.createElement("canvas").getContext("webgl") ||
      document.createElement("canvas").getContext("experimental-webgl");
    const dbg = gl?.getExtension("WEBGL_debug_renderer_info");
    if (dbg) renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
  } catch {
    renderer = "erro ao consultar WebGL";
  }

  const staticInfo = {
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    coarsePointer: matchMedia("(pointer: coarse)").matches,
    deviceMemory: navigator.deviceMemory ?? "n/d",
    dpr: devicePixelRatio,
    renderer,
  };

  const el = document.createElement("pre");
  el.style.cssText =
    "position:fixed;inset:auto 0 0 0;z-index:999999;margin:0;padding:10px;" +
    "background:#000;color:#0f0;font:11px/1.5 monospace;white-space:pre-wrap;" +
    "max-height:55vh;overflow:auto;pointer-events:none;";
  document.body.appendChild(el);

  function render() {
    const stageEl = document.getElementById("stage");
    const live = {
      viewport: `${innerWidth}x${innerHeight}`,
      scrollY: Math.round(scrollY),
      stageInlineOpacity: stageEl?.style.opacity ?? "(vazio)",
      stageComputedOpacity: stageEl
        ? getComputedStyle(stageEl).opacity
        : "n/d",
      // window.__stageStats existe sempre (produção incluída — é o que
      // interessa testando no A54); window.__stageDebug é só DEV.
      stats: window.__stageStats
        ? window.__stageStats()
        : "window.__stageStats indisponível",
      acts: window.__stageDebug
        ? window.__stageDebug().map((a) => ({
            id: a.id,
            near: a.near,
            active: a.active,
            wantsRender: a.wantsRender,
            top: Math.round(a.rect?.top ?? NaN),
            bottom: Math.round(a.rect?.bottom ?? NaN),
          }))
        : "window.__stageDebug indisponível (só existe no build dev)",
    };
    el.textContent = JSON.stringify({ ...staticInfo, ...live }, null, 2);
  }

  render();
  setInterval(render, 500);
}
