/* ===========================================================
   bake-brain.mjs — assets/brain.stl  →  assets/brain.glb

   The runtime used to do all of this in the browser, on the main thread, on
   every single load: download 4 MB of uncompressed STL, rebuild the geometry
   to clip the spinal stub, weld ~247k loose vertices, then run fourteen
   Taubin smoothing passes over the result. All of it is deterministic, so it
   belongs here — run once, ship the result.

   Every step below is a deliberate port of what js/acts/hero.js did, down to
   using Float32Array for the position buffer so the arithmetic rounds at the
   same points three.js would. The baked mesh has to be identical, not merely
   similar: the hero's camera framing and scale were tuned against it.

   usage:  node tools/bake-brain.mjs
   =========================================================== */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "assets-source", "brain.stl");
const OUT = join(root, "public", "assets", "brain.glb");

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
   BufferGeometry.computeVertexNormals does (cb = (C-B) x (A-B), unnormalised). */
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

/* ---------------- GLB writer ---------------- */
function pad4(n) {
  return (4 - (n % 4)) % 4;
}

function writeGLB(positions, normals, indices) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      if (positions[i + k] < min[k]) min[k] = positions[i + k];
      if (positions[i + k] > max[k]) max[k] = positions[i + k];
    }
  }

  const posBuf = Buffer.from(positions.buffer, positions.byteOffset, positions.byteLength);
  const nrmBuf = Buffer.from(normals.buffer, normals.byteOffset, normals.byteLength);
  const idxBuf = Buffer.from(indices.buffer, indices.byteOffset, indices.byteLength);

  const parts = [];
  let offset = 0;
  const views = [];
  for (const [buf, target] of [
    [posBuf, 34962],
    [nrmBuf, 34962],
    [idxBuf, 34963],
  ]) {
    views.push({ buffer: 0, byteOffset: offset, byteLength: buf.length, target });
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
        componentType: 5126,
        count: positions.length / 3,
        type: "VEC3",
        min,
        max,
      },
      {
        bufferView: 1,
        componentType: 5126,
        count: normals.length / 3,
        type: "VEC3",
      },
      {
        bufferView: 2,
        componentType: 5125,
        count: indices.length,
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

const { positions: welded, indices } = mergeVertices(clipped, 1e-3);
console.log(`welded         ${welded.length / 3} vertices`);

const smoothed = taubinSmooth(welded, indices);
const scale = centerAndScale(smoothed);
console.log(`scale factor   ${scale.toFixed(6)}`);

const normals = computeVertexNormals(smoothed, indices);
const glb = writeGLB(smoothed, normals, indices);
writeFileSync(OUT, glb);

console.log(`glb            ${(glb.length / 1e6).toFixed(2)} MB`);
console.log(`done in        ${Date.now() - t0} ms`);
