/* ===========================================================
   stage.js — one WebGL canvas for the whole page

   Every 3D moment on the page draws into this single fixed canvas. Sections
   register "acts"; the director decides which act is close enough to matter,
   updates only those, and skips rendering entirely when none of them is on
   screen. A full-viewport canvas with bloom running behind every section
   would otherwise burn battery for the ~80% of the page that has no 3D.

   The active act owns the camera. Acts live far apart in the document, so at
   most one is ever near the viewport, which keeps that ownership unambiguous.

   Scene/camera/renderer/composer are module-level singletons, created once
   on import — same as the static version, and deliberately not tied to any
   one component's mount/unmount. Only the two things that actually need the
   DOM (attaching the canvas, toggling its opacity) wait for initStage(),
   called from <Stage>'s effect once the mount div exists. That split keeps
   registerAct() safe to call regardless of which component's effect fires
   first, and keeps a StrictMode double-invoke of <Stage>'s effect cheap
   (guarded, not a real teardown+rebuild of the renderer).
   =========================================================== */

import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { isNear } from "../lib/motion.js";

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/* ---------------------------------------------------------------
   quality tiers — bloom is by far the most expensive thing here
   (several downsample passes every frame), so it is the first thing
   dropped on constrained devices.
--------------------------------------------------------------- */
function detectQuality() {
  const mem = navigator.deviceMemory ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 820;
  if (mem <= 4 || (coarse && small)) {
    return { tier: "low", bloom: false, maxDpr: 1.25, flashes: 6 };
  }
  if (mem <= 8 || coarse) {
    return { tier: "mid", bloom: true, maxDpr: 1.5, flashes: 9 };
  }
  return { tier: "high", bloom: true, maxDpr: 1.5, flashes: 12 };
}

export const quality = detectQuality();

/* ---------------------------------------------------------------
   renderer / scene / camera
--------------------------------------------------------------- */
export const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
  alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.maxDpr));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// The neutral resting tone for scene.background/fog — matches --bg, so
// whenever no act cares to tint the scene (the long stretch between the hero
// and the finale) it already agrees with the flat CSS background sitting
// under the canvas. Acts that want a different tone (the hero's warmer
// HERO_BG) are responsible for restoring PAGE_BG themselves on deactivate —
// see acts/hero.js — otherwise a stale tint lingers, invisible while the
// canvas is hidden, until the next act reveals it as a sudden colour jump.
export const PAGE_BG = 0x0a0a0d;

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e1a1c);
scene.fog = new THREE.Fog(0x1e1a1c, 8, 20);

export const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;

const hemi = new THREE.HemisphereLight(0xfff2e6, 0x201a1c, 0.5);
scene.add(hemi);

const keyLight = new THREE.DirectionalLight(0xfff4e8, 1.3);
keyLight.position.set(4, 6, 5);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xd98f5f, 1.0);
rimLight.position.set(-5, 1, -4);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0x6f97a3, 0.6);
fillLight.position.set(-3, -4, 3);
scene.add(fillLight);

/* ---------------------------------------------------------------
   post-processing
--------------------------------------------------------------- */
export const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
if (quality.bloom) {
  composer.addPass(
    new UnrealBloomPass(new THREE.Vector2(1, 1), 0.4, 0.5, 0.85),
  );
}
composer.addPass(new OutputPass());

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener("resize", resize);

/* ---------------------------------------------------------------
   ambient star field — shared backdrop. It belongs to the stage rather
   than to any one act so it can carry continuity across sections: the
   same drifting particles that sat behind the brain stay behind the
   manifesto text, which quietly ties the two together.
--------------------------------------------------------------- */
const STAR_COUNT = 200;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(STAR_COUNT * 3);
for (let i = 0; i < STAR_COUNT; i++) {
  const r = 7 + Math.random() * 10;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  starPos[i * 3 + 2] = r * Math.cos(phi) - 3;
}
starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
export const stars = new THREE.Points(
  starGeo,
  new THREE.PointsMaterial({
    color: 0x8b8891,
    size: 0.018,
    transparent: true,
    opacity: 0.35,
  }),
);
scene.add(stars);

/* ---------------------------------------------------------------
   mount — the only part of this module that waits for React
--------------------------------------------------------------- */
let mount = null;
let stageInitialized = false;

/** Attaches the renderer's canvas to the DOM. Idempotent — safe to call twice
 *  under StrictMode's dev-only double-invoke of effects. */
export function initStage(mountEl) {
  if (stageInitialized) return;
  stageInitialized = true;
  mount = mountEl;
  mount.appendChild(renderer.domElement);
}

/* ---------------------------------------------------------------
   act director
--------------------------------------------------------------- */
const acts = [];

/**
 * @param {object} act
 * @param {string} act.id
 * @param {HTMLElement} act.el       element whose proximity gates the act
 * @param {THREE.Object3D} [act.group]
 * @param {(t:number, dt:number)=>void} act.update
 * @param {(active:boolean)=>void} [act.setActive]
 *
 * An act may set `act.wantsRender = false` from inside update() to say it is
 * near the viewport but has nothing to draw right now. The hero needs this:
 * its section stays within a viewport of the manifesto long after its own
 * sequence has finished and dissolved, and without it the brain reappears
 * behind the next section's text.
 *
 * `act.nearMargin` (in viewports) sets how early the act wakes up. The
 * default of 1.5 buys warm-up time for an act that has to animate in from
 * off-screen; an act that should only exist while its own section is on
 * screen wants a much smaller value.
 */
export function registerAct(act) {
  act.active = false;
  act.wantsRender = true;
  act.nearMargin ??= 1.5;
  acts.push(act);
  if (act.group) scene.add(act.group);
  return act;
}

/** The React-lifecycle counterpart to registerAct — every act's effect
 *  cleanup calls this so StrictMode's mount→cleanup→mount cycle in dev (and
 *  any real unmount) leaves no stale entry driving the shared render loop. */
export function unregisterAct(act) {
  const i = acts.indexOf(act);
  if (i !== -1) acts.splice(i, 1);
  if (act.group) scene.remove(act.group);
}

const clock = new THREE.Clock();
let running = true;
let canvasShown = true;
let started = false;

document.addEventListener("visibilitychange", () => {
  running = !document.hidden;
  // swallow the delta accumulated while hidden so nothing lurches on return
  if (running) clock.getDelta();
});

function frame() {
  requestAnimationFrame(frame);
  if (!running || !mount) return;

  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.getElapsedTime();

  let anyWants = false;
  for (const act of acts) {
    const near = isNear(act.el, act.nearMargin);
    if (near !== act.active) {
      act.active = near;
      act.setActive?.(near);
    }
    if (near) {
      act.update(t, dt);
      if (act.wantsRender !== false) anyWants = true;
    }
    if (act.group) act.group.visible = near && act.wantsRender !== false;
  }

  // nothing on screen wants the canvas — don't pay for a frame
  if (anyWants !== canvasShown) {
    canvasShown = anyWants;
    // Asymmetric on purpose: appearing fades in gently (see base.css's
    // #stage transition — this is what keeps the finale's brain from
    // popping in behind Contact), but disappearing needs to be near-instant.
    // Sections have no opaque background of their own — they rely on the
    // canvas underneath already being invisible — so on a fast scroll past
    // the hero, a slow fade-out would leave the outgoing brain visibly
    // bleeding through the next section for as long as the fade lasts.
    mount.style.transitionDuration = anyWants ? "" : "0s";
    mount.style.opacity = anyWants ? "1" : "0";
  }
  if (!anyWants) return;

  if (!reduceMotion) stars.rotation.y = t * 0.008;
  composer.render();
}

/** Idempotent for the same StrictMode reason as initStage(). */
export function startStage() {
  if (started) return;
  started = true;
  frame();
}
