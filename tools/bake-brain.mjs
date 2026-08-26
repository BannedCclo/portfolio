/* ===========================================================
   bake-brain.mjs — assets/brain.stl  →  assets/brain.glb + assets/brain-low.glb

   The runtime used to do all of this in the browser, on the main thread, on
   every single load: download 4 MB of uncompressed STL, rebuild the geometry
   to clip the spinal stub, weld ~247k loose vertices, then run fourteen
   Taubin smoothing passes over the result. All of it is deterministic, so it
   belongs here — run once, ship the result.

   Every step below is a deliberate port of what js/acts/hero.js did, down to
   using Float32Array for the position buffer so the arithmetic rounds at the
   same points three.js would. The baked mesh has to be identical, not merely
   similar: the hero's camera framing and scale were tuned against it.

   Two files come out of one run: brain.glb (full detail, uint16 indices +
   quantized SHORT normals — still float32 positions, see writeGLB's own
   comment on why those aren't quantized) and brain-low.glb (decimated via
   meshoptimizer for coarse-pointer devices — see quality.mesh in
   three/stage.js, which picks between them at runtime).

   usage:  node tools/bake-brain.mjs
   =========================================================== */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { MeshoptSimplifier, MeshoptEncoder } from "meshoptimizer";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "assets-source", "brain.stl");
const OUT_FULL = join(root, "public", "assets", "brain.glb");
const OUT_LOW = join(root, "public", "assets", "brain-low.glb");

// Where the sulci relief — the thing that actually reads as "brain" rather
// than "smooth ovoid" — starts visibly softening is the thing to watch when
// this number changes. Compare page1/page2 (the lateral profiles) at zoom;
// they show relief, the top-down page0 pose barely does.
const LOW_POLY_TARGET_TRIS = 18000;

/* ---------------- binary STL → flat triangle soup ---------------- */
function readBinarySTL(buf) {
  const triCount = buf.readUInt32LE(80);
  const positions = new Float32Array(triCount * 9);
  let o = 84;
  for (let t = 0; t < triCount; t++) {
    o += 12; // skip the face normal; we rebuild normals after smoothing
    for (let v = 0; v < 3; v++) {
      positions[t * 9 + v * 3] = buf.readFloatLE(o);
      positions[t * 9 + v * 3 + 1] = buf.readFloatLE(o + 4);
      positions[t * 9 + v * 3 + 2] = buf.readFloatLE(o + 8);
      o += 12;
    }
    o += 2; // per-triangle attribute byte count, unused but part of the record
  }
  return { positions, triCount };
}

/* ---------------- orientation ----------------
   Source axes: X anterior-posterior, Y left-right, Z superior-inferior.
   Scene axes want Y up and the front facing the camera: X'=-y, Y'=z, Z'=-x. */
function applyOrientation(pos) {
  for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i],
      y = pos[i + 1],
      z = pos[i + 2];
    pos[i] = -y;
    pos[i + 1] = z;
    pos[i + 2] = -x;
  }
}

/* ---------------- drop the spinal cord stub ----------------
   A near-constant ~9-13mm cylinder runs from y=0 up to about y=79 before
   flaring into the cerebellum. Cut whole triangles by centroid. */
function clipBelowY(pos, yThreshold) {
  const triCount = pos.length / 9;
  const kept = [];
  for (let t = 0; t < triCount; t++) {
    const b = t * 9;
    const yAvg = (pos[b + 1] + pos[b + 4] + pos[b + 7]) / 3;
    if (yAvg >= yThreshold) kept.push(t);
  }
  const out = new Float32Array(kept.length * 9);
  kept.forEach((t, k) => out.set(pos.subarray(t * 9, t * 9 + 9), k * 9));
  return out;
}

/* ---------------- weld ----------------
   Mirrors three's BufferGeometryUtils.mergeVertices: hash each vertex on its
   components truncated toward zero at 1/tolerance, keep the first occurrence.
   Reproducing the truncation (not rounding) matters — it decides which
   vertices merge, and therefore what the smoothing pass operates on. */
function mergeVertices(pos, tolerance = 1e-3) {
  const shift = Math.pow(10, Math.log10(1 / tolerance));
  const hashToIndex = new Map();
  const newPositions = [];
  const indices = new Uint32Array(pos.length / 3);
  let next = 0;

  for (let i = 0; i < pos.length / 3; i++) {
    const x = pos[i * 3],
      y = pos[i * 3 + 1],
      z = pos[i * 3 + 2];
    const hash = `${~~(x * shift)},${~~(y * shift)},${~~(z * shift)},`;
    let idx = hashToIndex.get(hash);
    if (idx === undefined) {
      idx = next++;
      hashToIndex.set(hash, idx);
      newPositions.push(x, y, z);
    }
    indices[i] = idx;
  }
  return { positions: new Float32Array(newPositions), indices };
}

/* ---------------- cap the base hole ----------------
   clipBelowY leaves a small hole where the spinal stub was cut off — a
   single closed loop of boundary edges at the back of the base. It's never
   in frame across the whole choreography (checked against every camera
   angle, including the finale's spin) but only by ~8° of margin at the
   tightest moment, and DoubleSide used to be what actually hid it. Now that
   tissueMat is FrontSide (see acts/hero.js), the hole must be closed for
   real — a triangle fan from the loop's centroid, plus it makes the mesh
   watertight, which matters for the simplifier's border handling below.

   General on purpose (any number of loops, including zero): finds every
   directed boundary edge — one that has no matching reverse edge anywhere in
   the mesh — and chains them head-to-tail into closed loops. A boundary
   triangle's own winding, carried through the chain, is what keeps the cap's
   winding (and therefore its outward normal) consistent with the rest of the
   mesh: capping each consecutive pair (loop[i], loop[i+1]) as
   (centroid, loop[i], loop[i+1]) is a cyclic permutation of the same
   orientation the adjacent real triangles already have. */
function capHoles(positions, indices) {
  const edgeSeen = new Set();
  const triCount = indices.length / 3;
  for (let t = 0; t < triCount; t++) {
    const a = indices[t * 3],
      b = indices[t * 3 + 1],
      c = indices[t * 3 + 2];
    edgeSeen.add(`${a},${b}`);
    edgeSeen.add(`${b},${c}`);
    edgeSeen.add(`${c},${a}`);
  }

  const nextOf = new Map();
  for (const key of edgeSeen) {
    const [u, v] = key.split(",").map(Number);
    if (!edgeSeen.has(`${v},${u}`)) nextOf.set(u, v);
  }

  const loops = [];
  const visited = new Set();
  for (const start of nextOf.keys()) {
    if (visited.has(start)) continue;
    const loop = [];
    let cur = start;
    while (cur !== undefined && !visited.has(cur)) {
      visited.add(cur);
      loop.push(cur);
      cur = nextOf.get(cur);
    }
    if (cur === start && loop.length >= 3) loops.push(loop);
  }

  if (!loops.length) return { positions, indices };

  const vertexCount = positions.length / 3;
  const extraPositions = [];
  const extraIndices = [];
  let nextVertex = vertexCount;

  for (const loop of loops) {
    let cx = 0,
      cy = 0,
      cz = 0;
    for (const v of loop) {
      cx += positions[v * 3];
      cy += positions[v * 3 + 1];
      cz += positions[v * 3 + 2];
    }
    const centroidIdx = nextVertex++;
    extraPositions.push(cx / loop.length, cy / loop.length, cz / loop.length);
    for (let i = 0; i < loop.length; i++) {
      extraIndices.push(centroidIdx, loop[i], loop[(i + 1) % loop.length]);
    }
  }

  const newPositions = new Float32Array(positions.length + extraPositions.length);
  newPositions.set(positions);
  newPositions.set(extraPositions, positions.length);

  const newIndices = new Uint32Array(indices.length + extraIndices.length);
  newIndices.set(indices);
  newIndices.set(extraIndices, indices.length);

  console.log(
    `hole cap       ${loops.length} loop(s), ${extraIndices.length / 3} triangle(s) added`,
  );
  return { positions: newPositions, indices: newIndices };
}

/* ---------------- Taubin smoothing ----------------
   Alternating shrink/inflate passes relax the marching-cubes faceting without
   the shrinkage plain Laplacian smoothing causes. */
function taubinSmooth(positions, indices, iterations = 14, lambda = 0.5, mu = -0.53) {
  const vertexCount = positions.length / 3;
  const neighbors = Array.from({ length: vertexCount }, () => new Set());
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i],
      b = indices[i + 1],
      c = indices[i + 2];
    neighbors[a].add(b); neighbors[a].add(c);
    neighbors[b].add(a); neighbors[b].add(c);
    neighbors[c].add(a); neighbors[c].add(b);
  }

  let cur = positions;
  for (let iter = 0; iter < iterations; iter++) {
    const factor = iter % 2 === 0 ? lambda : mu;
    const next = cur.slice();
    for (let v = 0; v < vertexCount; v++) {
      const nbrs = neighbors[v];
      if (nbrs.size === 0) continue;
      let ax = 0, ay = 0, az = 0;
      for (const n of nbrs) {
        ax += cur[n * 3];
        ay += cur[n * 3 + 1];
        az += cur[n * 3 + 2];
      }
      const inv = 1 / nbrs.size;
      ax *= inv; ay *= inv; az *= inv;
      next[v * 3] = cur[v * 3] + factor * (ax - cur[v * 3]);
      next[v * 3 + 1] = cur[v * 3 + 1] + factor * (ay - cur[v * 3 + 1]);
      next[v * 3 + 2] = cur[v * 3 + 2] + factor * (az - cur[v * 3 + 2]);
    }
    cur = next;
  }
  return cur;
}

/* ---------------- normals ----------------
   Area-weighted face normals accumulated per vertex, exactly as
   BufferGeometry.computeVertexNormals does (cb = (C-B) x (A-B), unnormalised).
   Reused after decimation too — a decimated mesh's normals are recomputed
   from its own (simplified) topology, never carried over from the source. */
function computeVertexNormals(positions, indices) {
  const normals = new Float32Array(positions.length);
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i] * 3,
      b = indices[i + 1] * 3,
      c = indices[i + 2] * 3;
    const cbx = positions[c] - positions[b];
    const cby = positions[c + 1] - positions[b + 1];
    const cbz = positions[c + 2] - positions[b + 2];
    const abx = positions[a] - positions[b];
    const aby = positions[a + 1] - positions[b + 1];
    const abz = positions[a + 2] - positions[b + 2];
    const nx = cby * abz - cbz * aby;
    const ny = cbz * abx - cbx * abz;
    const nz = cbx * aby - cby * abx;
    for (const o of [a, b, c]) {
      normals[o] += nx;
      normals[o + 1] += ny;
      normals[o + 2] += nz;
    }
  }
  for (let i = 0; i < normals.length; i += 3) {
    const l = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
    normals[i] /= l;
    normals[i + 1] /= l;
    normals[i + 2] /= l;
  }
  return normals;
}

/* ---------------- centre + normalise scale ---------------- */
function centerAndScale(positions, targetRadius = 1.55) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      if (positions[i + k] < min[k]) min[k] = positions[i + k];
      if (positions[i + k] > max[k]) max[k] = positions[i + k];
    }
  }
  const c = [0, 1, 2].map((k) => (min[k] + max[k]) / 2);
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] -= c[0];
    positions[i + 1] -= c[1];
    positions[i + 2] -= c[2];
  }
  // bounding sphere about the (now origin) box centre, as three computes it
  let maxSq = 0;
  for (let i = 0; i < positions.length; i += 3) {
    const d =
      positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2;
    if (d > maxSq) maxSq = d;
  }
  const scale = targetRadius / Math.sqrt(maxSq);
  for (let i = 0; i < positions.length; i++) positions[i] *= scale;
  return scale;
}

/* ---------------- decimation + cache-friendly vertex order ----------------
   Both meshoptimizer operations used here (simplify's compactMesh, and the
   encoder's reorderMesh) follow the same contract: they mutate the index
   buffer passed in, in place, and return [remap, uniqueVertexCount], where
   remap[oldVertexIndex] = newVertexIndex (or the sentinel below if that
   vertex is no longer referenced). remapBuffer() applies that same remap to
   whichever position/normal buffer needs to follow along. */
const MESHOPT_MISSING = 2 ** 32 - 1;

function remapBuffer(data, comps, remap, uniqueCount) {
  const vertexCount = data.length / comps;
  const out = new Float32Array(uniqueCount * comps);
  for (let i = 0; i < vertexCount; i++) {
    const newIdx = remap[i];
    if (newIdx === MESHOPT_MISSING) continue;
    for (let c = 0; c < comps; c++) out[newIdx * comps + c] = data[i * comps + c];
  }
  return out;
}

/** Collapses the mesh toward targetTriCount (meshoptimizer's simplify,
 *  topology-aware, borders locked so the capped hole's rim doesn't get
 *  chewed into), compacts the now-sparse vertex buffer, and recomputes
 *  normals from the decimated topology — never reuses the source normals. */
async function decimate(positions, indices, targetTriCount) {
  await MeshoptSimplifier.ready;

  const targetIndexCount = targetTriCount * 3;
  const [simplified, error] = MeshoptSimplifier.simplify(
    indices,
    positions,
    3,
    targetIndexCount,
    0.02,
    ["LockBorder"],
  );
  console.log(
    `simplify       target ${targetTriCount} tris, got ${simplified.length / 3} tris, error ${error.toFixed(4)}`,
  );

  const [remap, uniqueCount] = MeshoptSimplifier.compactMesh(simplified);
  const compactPositions = remapBuffer(positions, 3, remap, uniqueCount);
  const compactNormals = computeVertexNormals(compactPositions, simplified);

  return { positions: compactPositions, normals: compactNormals, indices: simplified };
}

/** Reorders vertices for GPU vertex-cache/fetch locality — grátis at
 *  runtime, applied to both variants (not just the decimated one).
 *
 *  MeshoptEncoder.reorderMesh() mutates its index-buffer argument IN PLACE
 *  (renumbers it to the new vertex order) — confirmed against the package's
 *  own test suite. Operating on a copy is what stops the full-detail
 *  variant's reorder from corrupting `cappedIndices` for whoever reads it
 *  next: with the caller's array mutated instead, the low-poly variant's own
 *  MeshoptSimplifier.simplify() call downstream would receive indices
 *  already renumbered for the FULL mesh's vertex order while `positions`
 *  stayed in the original order — every index would point at the wrong
 *  vertex, and the result renders as scrambled, faceted noise (this is
 *  exactly what happened before this fix: normals disagreed with their own
 *  triangle's geometric face normal ~38% of the time instead of the ~2-10%
 *  a decimated mesh should show). */
async function reorderForCache(positions, normals, indices) {
  await MeshoptEncoder.ready;
  const workingIndices = indices.slice();
  const [remap, uniqueCount] = MeshoptEncoder.reorderMesh(workingIndices, true, true);
  return {
    positions: remapBuffer(positions, 3, remap, uniqueCount),
    normals: remapBuffer(normals, 3, remap, uniqueCount),
    indices: workingIndices,
  };
}

/* ---------------- GLB writer ---------------- */
function pad4(n) {
  return (4 - (n % 4)) % 4;
}

/** Quantizes unit normals to signed 16-bit ints, padded to 4 components (8
 *  bytes/vertex) — glTF's KHR_mesh_quantization allows NORMAL as a
 *  normalized SHORT accessor, and three r160's GLTFLoader supports it. Only
 *  the normals are quantized: POSITION stays float32, since quantizing it
 *  would need a per-node `scale` to undo, and hero.js's GLTFLoader callback
 *  only reads `mesh.geometry` off the loaded scene — it drops node
 *  transforms silently, so a quantized-position mesh would load 32767x too
 *  large with no error. The saving there (~150KB) isn't worth that risk. */
function quantizeNormals(normals) {
  const count = normals.length / 3;
  const out = new Int16Array(count * 4);
  for (let i = 0; i < count; i++) {
    out[i * 4] = Math.max(-32767, Math.min(32767, Math.round(normals[i * 3] * 32767)));
    out[i * 4 + 1] = Math.max(-32767, Math.min(32767, Math.round(normals[i * 3 + 1] * 32767)));
    out[i * 4 + 2] = Math.max(-32767, Math.min(32767, Math.round(normals[i * 3 + 2] * 32767)));
    out[i * 4 + 3] = 0; // padding to 8 bytes; the VEC3 accessor never reads it
  }
  return out;
}

function writeGLB(positions, normals, indices) {
  const vertexCount = positions.length / 3;
  if (vertexCount >= 65536) {
    throw new Error(
      `vertexCount ${vertexCount} excede o limite de indices uint16 (65535) — reveja o alvo de decimação ou volte para uint32`,
    );
  }

  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      if (positions[i + k] < min[k]) min[k] = positions[i + k];
      if (positions[i + k] > max[k]) max[k] = positions[i + k];
    }
  }

  const posBuf = Buffer.from(positions.buffer, positions.byteOffset, positions.byteLength);

  const quantizedNormals = quantizeNormals(normals);
  const nrmBuf = Buffer.from(
    quantizedNormals.buffer,
    quantizedNormals.byteOffset,
    quantizedNormals.byteLength,
  );

  const indices16 = Uint16Array.from(indices);
  const idxBuf = Buffer.from(indices16.buffer, indices16.byteOffset, indices16.byteLength);

  const parts = [];
  let offset = 0;
  const views = [];
  for (const [buf, target, byteStride] of [
    [posBuf, 34962, undefined],
    [nrmBuf, 34962, 8],
    [idxBuf, 34963, undefined],
  ]) {
    const view = { buffer: 0, byteOffset: offset, byteLength: buf.length, target };
    if (byteStride) view.byteStride = byteStride;
    views.push(view);
    parts.push(buf);
    offset += buf.length;
    const p = pad4(offset);
    if (p) {
      parts.push(Buffer.alloc(p));
      offset += p;
    }
  }
  const bin = Buffer.concat(parts);

  const gltf = {
    asset: { version: "2.0", generator: "bake-brain.mjs" },
    extensionsUsed: ["KHR_mesh_quantization"],
    extensionsRequired: ["KHR_mesh_quantization"],
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "brain" }],
    meshes: [
      {
        name: "brain",
        primitives: [
          { attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, mode: 4 },
        ],
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126, // FLOAT
        count: positions.length / 3,
        type: "VEC3",
        min,
        max,
      },
      {
        bufferView: 1,
        componentType: 5122, // SHORT
        normalized: true,
        count: normals.length / 3,
        type: "VEC3",
      },
      {
        bufferView: 2,
        componentType: 5123, // UNSIGNED_SHORT
        count: indices16.length,
        type: "SCALAR",
      },
    ],
    bufferViews: views,
    buffers: [{ byteLength: bin.length }],
  };

  let json = Buffer.from(JSON.stringify(gltf), "utf8");
  if (pad4(json.length)) {
    json = Buffer.concat([json, Buffer.alloc(pad4(json.length), 0x20)]);
  }

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); // 'glTF'
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + json.length + 8 + bin.length, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(json.length, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4); // 'JSON'

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(bin.length, 0);
  binHeader.writeUInt32LE(0x004e4942, 4); // 'BIN'

  return Buffer.concat([header, jsonHeader, json, binHeader, bin]);
}

/* ---------------- run ---------------- */
const t0 = Date.now();
const stl = readFileSync(SRC);
console.log(`stl            ${(stl.length / 1e6).toFixed(2)} MB`);

const { positions: raw, triCount } = readBinarySTL(stl);
console.log(`triangles      ${triCount}`);

applyOrientation(raw);
const clipped = clipBelowY(raw, 79);
console.log(`after clip     ${clipped.length / 9} triangles`);

const { positions: welded, indices: weldedIndices } = mergeVertices(clipped, 1e-3);
console.log(`welded         ${welded.length / 3} vertices`);

const { positions: capped, indices: cappedIndices } = capHoles(welded, weldedIndices);

const smoothed = taubinSmooth(capped, cappedIndices);
const scale = centerAndScale(smoothed);
console.log(`scale factor   ${scale.toFixed(6)}`);

// ---- full-detail variant ----
const fullNormals = computeVertexNormals(smoothed, cappedIndices);
const fullReordered = await reorderForCache(smoothed, fullNormals, cappedIndices);
const fullGlb = writeGLB(fullReordered.positions, fullReordered.normals, fullReordered.indices);
writeFileSync(OUT_FULL, fullGlb);
console.log(
  `${OUT_FULL.replace(root + "\\", "").replace(root + "/", "")}   ${(fullGlb.length / 1e6).toFixed(2)} MB, ${fullReordered.indices.length / 3} tris`,
);

// ---- decimated variant (coarse-pointer devices) ----
const low = await decimate(smoothed, cappedIndices, LOW_POLY_TARGET_TRIS);
const lowReordered = await reorderForCache(low.positions, low.normals, low.indices);
const lowGlb = writeGLB(lowReordered.positions, lowReordered.normals, lowReordered.indices);
writeFileSync(OUT_LOW, lowGlb);
console.log(
  `${OUT_LOW.replace(root + "\\", "").replace(root + "/", "")}   ${(lowGlb.length / 1e6).toFixed(2)} MB, ${lowReordered.indices.length / 3} tris`,
);

console.log(`done in        ${Date.now() - t0} ms`);
