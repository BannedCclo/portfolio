/* ===========================================================
   acts/finale.js — the brain returns

   Closes the loop the hero opened. It reuses the geometry the hero already
   built and uploaded, so a second brain costs a draw call and nothing else —
   no extra download, no second pass of welding and smoothing.

   Where the hero drives the brain hard, this one barely moves: far off, dim,
   slowly turning, synapses at a low idle. The section's text sits above it.
   =========================================================== */

import * as THREE from "three";
import { camera, scene, registerAct, unregisterAct } from "../stage.js";
import { clamp01, damp, lerp, deg } from "../../lib/motion.js";
import { brainGeometryReady, synapseMat, tissueMat } from "./hero.js";

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const HERO_BG = 0x1e1a1c;
const FINALE_BG = 0x0a0a0d; // matches --bg, so the canvas blends into the page

export const finaleGroup = new THREE.Group();
finaleGroup.position.set(0, -0.1, 0);

let mesh = null;
let glow = null;

/** Called once from <Contact>'s mount effect. Returns a cleanup. */
export function initFinale() {
  const section = document.getElementById("contato");
  if (!section) return () => {};

  brainGeometryReady
    ?.then((geometry) => {
      // Guards against a StrictMode double-invoke re-running this whole
      // chain: brainGeometryReady only resolves once, but if initFinale()
      // itself were called a second time, a second .then() would otherwise
      // build and add a duplicate mesh/glow pair to finaleGroup.
      if (mesh) return;

      // The hero's brain is the lit one. This is its echo: an almost-black
      // silhouette where the only bright thing left is the signal still
      // running across it. It also has to sit behind a headline, and a pale
      // surface there would simply eat the type.
      const darkMat = tissueMat.clone();
      darkMat.color = new THREE.Color(0x241f1d);
      darkMat.roughness = 0.95;
      darkMat.clearcoat = 0;
      darkMat.sheen = 0;
      darkMat.envMapIntensity = 0.1;

      mesh = new THREE.Mesh(geometry, darkMat);
      finaleGroup.add(mesh);

      // its own material instance so the idle activation here is independent
      // of whatever the hero's sequence left set on the shared one
      glow = new THREE.Mesh(geometry, synapseMat.clone());
      glow.scale.setScalar(1.006);
      finaleGroup.add(glow);
    })
    .catch(() => {
      /* the hero already reported the load failure */
    });

  let spin = 0;
  let entered = 0;

  const act = registerAct({
    id: "finale",
    el: section,
    group: finaleGroup,
    // this act exists only while its own section is on screen — with the
    // default 1.5-viewport lead the brain would surface behind the stack and
    // about sections long before the page gets here
    nearMargin: 0.1,
    update(t, dt) {
      // how centred the section is in the viewport, 0..1
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const centred = clamp01(
        1 - Math.abs(rect.top + rect.height / 2 - vh / 2) / vh,
      );
      entered = damp(entered, centred, dt, 1.4);
      // fully faded out means nothing to draw
      act.wantsRender = entered > 0.015;
      if (!act.wantsRender) return;

      if (!reduceMotion) spin += dt * 0.06;
      finaleGroup.rotation.y = spin;
      finaleGroup.rotation.x = deg(22);
      finaleGroup.rotation.z = deg(-5);
      finaleGroup.scale.setScalar(lerp(0.62, 0.78, entered));

      // sits well back and drifts a touch closer as the section centres
      camera.position.set(0, 0.35, lerp(13.5, 11.8, entered));
      camera.lookAt(0, -0.1, 0);

      if (glow) {
        glow.material.uniforms.uTime.value = t;
        // a low idle — present, but nothing like the hero's full activation
        glow.material.uniforms.uActivation.value = 0.72 * entered;
      }
    },
    setActive(active) {
      // the hero's warm backdrop would read as a colour shift this late in the
      // page, so the finale renders against the page's own background
      scene.background = new THREE.Color(active ? FINALE_BG : HERO_BG);
      scene.fog.color.setHex(active ? FINALE_BG : HERO_BG);
    },
  });

  return () => {
    unregisterAct(act);
    scene.background = new THREE.Color(HERO_BG);
    scene.fog.color.setHex(HERO_BG);
  };
}
