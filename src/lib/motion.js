/* ===========================================================
   motion.js — the shared motion language

   Three rules hold the whole page together. They are what makes the brain
   sequence feel organic, and every new section is expected to follow them:

   1. Never bind a visual property straight to scroll. Scroll sets the
      TARGET; the rendered value always chases that target through damp().
      That is what survives a fast scroll flick without looking mechanical.
   2. Never animate one axis alone. Every transition moves two or three
      properties together — single-axis motion reads like a carousel.
   3. Long, overlapping transitions rather than discrete steps: shape scroll
      with sampleCurve() and let neighbouring keyframes overlap.
   =========================================================== */

export const clamp01 = (v) => Math.min(1, Math.max(0, v));

export const smoothstep = (x) => {
  x = clamp01(x);
  return x * x * (3 - 2 * x);
};

export const lerp = (a, b, t) => a + (b - a) * t;

export const deg = (d) => (d * Math.PI) / 180;

/**
 * Samples a [progress, value] keyframe list, easing between neighbours with
 * smoothstep so there is never a visible corner where one segment hands over
 * to the next. Values before the first / after the last keyframe are held.
 */
export function sampleCurve(p, kfs) {
  if (p <= kfs[0][0]) return kfs[0][1];
  for (let i = 1; i < kfs.length; i++) {
    if (p <= kfs[i][0]) {
      const [p0, v0] = kfs[i - 1];
      const [p1, v1] = kfs[i];
      const t = p1 > p0 ? smoothstep((p - p0) / (p1 - p0)) : 1;
      return lerp(v0, v1, t);
    }
  }
  return kfs[kfs.length - 1][1];
}

/**
 * Frame-rate independent exponential easing — a light spring without the
 * overshoot. `rate` is how eagerly the value catches up: higher is snappier,
 * lower is dreamier. The exp() form is what makes it independent of dt, so a
 * 144Hz display and a stuttering 30fps one settle over the same wall time.
 */
export const DEFAULT_DAMP_RATE = 2.2;

export function damp(current, target, dt, rate = DEFAULT_DAMP_RATE) {
  return current + (target - current) * (1 - Math.exp(-dt * rate));
}

/**
 * A bag of damped scalars. Set targets from scroll, call update(dt) once a
 * frame, read the smoothed values — this is the `stagePose` pattern from the
 * brain sequence, generalised so every section can use it.
 */
export class DampedPose {
  constructor(initial = {}, rate = DEFAULT_DAMP_RATE) {
    this.rate = rate;
    this.value = { ...initial };
    this.target = { ...initial };
  }
  set(key, target) {
    this.target[key] = target;
    if (!(key in this.value)) this.value[key] = target;
    return this;
  }
  update(dt) {
    for (const key in this.target) {
      this.value[key] = damp(
        this.value[key],
        this.target[key],
        dt,
        this.rate,
      );
    }
    return this.value;
  }
  get(key) {
    return this.value[key];
  }
}

/**
 * How far a section has travelled through the viewport, 0..1.
 *   0 → the section's top edge is just entering from the bottom
 *   1 → its bottom edge has just left through the top
 * Useful for sections that are not pinned and just want a scroll ratio.
 */
export function sectionProgress(el) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  return clamp01((vh - rect.top) / (vh + rect.height));
}

/** Whether a bounding rect is within `margin` viewports of the screen. Split
 *  out from isNear() below so a caller that already has the rect this frame
 *  (the 3D act director in three/stage.js) doesn't force a second layout
 *  read for the same element. */
export function isNearRect(rect, margin = 1.5) {
  const vh = window.innerHeight;
  return rect.bottom > -vh * margin && rect.top < vh * (1 + margin);
}

/** Whether an element is within `margin` viewports of the screen. */
export function isNear(el, margin = 1.5) {
  return isNearRect(el.getBoundingClientRect(), margin);
}
