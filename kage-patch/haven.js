/* ======================================================================
   HIMALAYAN MONASTERY RE-THEME ("Haven-inspired" concept)
   Dusk over snow peaks, whitewashed hall with gilded roofs, chortens at
   the foot of the stairs, prayer flags that really move, drifting snow.
   Everything is generated at runtime; layout and camera path are the
   original's. An original scene, not a copy of any game map.
   ====================================================================== */

/* dusk sky: indigo overhead, a rose-and-amber band low down */
function texSky() {
  const W = 512, H = 512, c = cvs(W, H), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgb(5,9,22)');    g.addColorStop(.40, 'rgb(12,20,44)');
  g.addColorStop(.70, 'rgb(30,36,68)'); g.addColorStop(.88, 'rgb(74,58,82)'); g.addColorStop(1, 'rgb(52,42,62)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  /* soft cloud banks, warm underneath */
  x.globalAlpha = .40; x.globalCompositeOperation = 'overlay';
  x.drawImage(fbmCanvas(W, H, 313, 5, 3, .9), 0, 0);
  x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  const wg = x.createRadialGradient(W * .66, H * .98, 4, W * .66, H * .98, W * .52);
  wg.addColorStop(0, 'rgba(255,190,120,.42)'); wg.addColorStop(.5, 'rgba(230,130,86,.16)');
  wg.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = wg; x.fillRect(0, 0, W, H);
  const rnd = mulberry32(881);
  for (let i = 0; i < 220; i++) {
    const sx = rnd() * W, sy = rnd() * H * .6, r = .5 + rnd() * rnd() * 1.4;
    x.fillStyle = 'rgba(224,232,250,' + (.10 + rnd() * .35) * (1 - sy / (H * .6)) + ')';
    x.beginPath(); x.arc(sx, sy, r, 0, TAU); x.fill();
  }
  return c;
}

/* layered snow peaks: lit snow on top, blue shadow, gullies, fading into the haze */
function texRidge() {
  const W = 2048, H = 512, c = cvs(W, H), x = c.getContext('2d');
  const n = noise2D(1207), rnd = mulberry32(1207);
  const hAt = t => {
    const a = fbm(n, t * 3.1, .5, 4, 2.1, .55) * .5 + .5;
    const b = fbm(n, t * 11, 3.1, 4, 2.3, .52) * .5 + .5;
    return .30 + .42 * a + .20 * Math.pow(b, 1.4);
  };
  const top = new Float32Array(W + 1);
  for (let i = 0; i <= W; i++) top[i] = H - hAt(i / W) * H * .96;
  /* body */
  const body = x.createLinearGradient(0, 0, 0, H);
  body.addColorStop(0, 'rgb(236,240,252)');  body.addColorStop(.30, 'rgb(190,200,226)');
  body.addColorStop(.58, 'rgb(104,116,156)'); body.addColorStop(1, 'rgba(60,70,110,0)');
  x.beginPath(); x.moveTo(0, H);
  for (let i = 0; i <= W; i += 2) x.lineTo(i, top[i]);
  x.lineTo(W, H); x.closePath(); x.fillStyle = body; x.fill();
  /* shadowed faces: diagonal wedges dropping from the crests */
  x.save(); x.clip();
  for (let k = 0; k < 120; k++) {
    const px = rnd() * W, py = top[px | 0], len = 60 + rnd() * 230, wd = 8 + rnd() * 34;
    const g2 = x.createLinearGradient(px, py, px + wd, py + len);
    g2.addColorStop(0, 'rgba(40,54,100,.42)'); g2.addColorStop(1, 'rgba(40,54,100,0)');
    x.fillStyle = g2; x.beginPath(); x.moveTo(px, py); x.lineTo(px + wd * 1.6, py + len);
    x.lineTo(px - wd * .6, py + len); x.closePath(); x.fill();
  }
  /* sun-warmed rim on the crests */
  x.strokeStyle = 'rgba(255,214,160,.55)'; x.lineWidth = 2.2; x.beginPath();
  for (let i = 0; i <= W; i += 2) { if (i) x.lineTo(i, top[i] + 1); else x.moveTo(i, top[i] + 1); }
  x.stroke();
  x.restore();
  return c;
}

/* snow instead of leaves: a soft round flake */
function texLeaf() {
  const S = 64, c = cvs(S, S), x = c.getContext('2d');
  const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.55, 'rgba(255,255,255,.95)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  return c;
}

/* ----------------------------------------------------------- prayer flags */
const FLAG_COLS = [[.16, .34, .80], [.86, .86, .82], [.80, .14, .10], [.16, .56, .26], [.92, .70, .12]];
const FLAGPOLES = [];
function flagLine(a, b, sag) {
  const N = 6, pos = [], col = [], sw = [], idx = [], line = [];
  const at = t => new THREE.Vector3().lerpVectors(a, b, t).add(new THREE.Vector3(0, -sag * (1 - Math.pow(2 * t - 1, 2)), 0));
  for (let i = 0; i <= 40; i++) line.push(at(i / 40));
  const lg = new THREE.BufferGeometry().setFromPoints(line);
  const str = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0x3a2c20 }));
  scene.add(str);
  const span = a.distanceTo(b) / N;
  for (let i = 0; i < N; i++) {
    const p0 = at(i / N + .012), p1 = at((i + 1) / N - .012), h = .52 + (i % 3) * .05;
    const base = pos.length / 3;
    [p0, p1].forEach(p => { pos.push(p.x, p.y, p.z); sw.push(0); });
    [p0, p1].forEach(p => { pos.push(p.x, p.y - h, p.z); sw.push(1); });
    const cc = FLAG_COLS[i % 5];
    for (let k = 0; k < 4; k++) col.push(cc[0] * .62, cc[1] * .62, cc[2] * .62);
    idx.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('aSw', new THREE.Float32BufferAttribute(sw, 1));
  g.setIndex(idx);
  const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, fog: true });
  mat.onBeforeCompile = sh => {
    sh.uniforms.uT = WORLD.uT;
    sh.vertexShader = 'attribute float aSw; uniform float uT;\n' + sh.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\n' +
      'float ph = position.x * 1.3 + position.z * 0.9;\n' +
      'float w1 = sin(uT * 2.4 + ph * 1.6);\n' +
      'transformed.z += (w1 * 0.26 + sin(uT * 4.1 + ph) * 0.08) * aSw;\n' +
      'transformed.x += cos(uT * 2.0 + ph) * 0.10 * aSw;\n' +
      'transformed.y += (w1 * 0.5 + 0.5) * 0.10 * aSw;\n');
  };
  const m = new THREE.Mesh(g, mat);
  m.frustumCulled = false; m.renderOrder = 3;
  scene.add(m);
  return m;
}
/* maples → dark conifers framing the courtyard */
function buildMaple(seed, x, z, scale) {
  const rnd = mulberry32(seed), g = new THREE.Group();
  const bark = new THREE.MeshStandardMaterial({ color: 0x2a1d16, roughness: 1 });
  const leaf = new THREE.MeshStandardMaterial({ color: 0x08120e, roughness: 1, flatShading: true });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.22, .34, 2.6, 8), bark);
  trunk.position.y = 1.3; trunk.castShadow = true; g.add(trunk);
  const tiers = 5 + Math.floor(rnd() * 2);
  for (let k = 0; k < tiers; k++) {
    const r = (2.1 - k * .3) * (.9 + rnd() * .2), hh = 2.6 - k * .12;
    const c = new THREE.Mesh(new THREE.ConeGeometry(r, hh, 9), leaf);
    c.position.set((rnd() - .5) * .2, 2.4 + k * 1.35, (rnd() - .5) * .2);
    c.rotation.y = rnd() * 6; c.castShadow = true; g.add(c);
  }
  g.position.set(x, 0, z); g.scale.setScalar((scale || 1) * 1.15);
  scene.add(g);
}

/* nothing stands at the foot of the stairs any more */
function buildTorii() { WORLD.torii = null; }

/* no foreground branch / flags: an empty plate keeps the layer list intact */
function texBranchCutout() { return cvs(8, 8); }
/* ---------------------------------------------------------------- roof tile
   Clay roof tiles, drawn as real cells: alternating concave pans and convex
   covers, each course overlapping the one below with a lit lip and a cast
   shadow, every tile slightly different in tone. Meant to be tiled many times
   across a roof (see the repeat in haven.py). */
function texRoof() {
  const W = 512, H = 512, c = cvs(W, H), x = c.getContext('2d');
  const h = cvs(W, H), hx = h.getContext('2d');
  const cols = 8, rows = 8, cw = W / cols, ch = H / rows, rnd = mulberry32(211);
  x.fillStyle = '#34363a'; x.fillRect(0, 0, W, H);
  hx.fillStyle = '#707070'; hx.fillRect(0, 0, W, H);
  for (let r = 0; r < rows; r++) for (let i = 0; i < cols; i++) {
    const x0 = i * cw, y0 = r * ch, cover = i % 2 === 1;
    const t = .88 + rnd() * .22, base = (cover ? 98 : 84) * t;
    const g = x.createLinearGradient(0, y0, 0, y0 + ch);
    g.addColorStop(0, hex(base * .78, base * .78, base * .80));
    g.addColorStop(1, hex(base * 1.04, base * 1.04, base * 1.06));
    x.fillStyle = g; x.fillRect(x0, y0, cw, ch);
    const gh = x.createLinearGradient(x0, 0, x0 + cw, 0);
    if (cover) { gh.addColorStop(0, 'rgba(0,0,0,.20)'); gh.addColorStop(.5, 'rgba(255,255,255,.07)'); gh.addColorStop(1, 'rgba(0,0,0,.22)'); }
    else { gh.addColorStop(0, 'rgba(0,0,0,.10)'); gh.addColorStop(.5, 'rgba(0,0,0,.22)'); gh.addColorStop(1, 'rgba(0,0,0,.10)'); }
    x.fillStyle = gh; x.fillRect(x0, y0, cw, ch);
    x.fillStyle = 'rgba(0,0,0,.20)'; x.fillRect(x0, y0 + ch - 2, cw, 2);
    const hg = hx.createLinearGradient(x0, 0, x0 + cw, 0);
    if (cover) { hg.addColorStop(0, '#6a6a6a'); hg.addColorStop(.5, '#d0d0d0'); hg.addColorStop(1, '#6a6a6a'); }
    else { hg.addColorStop(0, '#8a8a8a'); hg.addColorStop(.5, '#484848'); hg.addColorStop(1, '#8a8a8a'); }
    hx.fillStyle = hg; hx.fillRect(x0, y0, cw, ch);
    const lg = hx.createLinearGradient(0, y0, 0, y0 + ch);
    lg.addColorStop(0, 'rgba(0,0,0,.28)'); lg.addColorStop(.85, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(0,0,0,.45)');
    hx.fillStyle = lg; hx.fillRect(x0, y0, cw, ch);
  }
  x.globalCompositeOperation = 'overlay'; x.globalAlpha = .28;
  x.drawImage(fbmCanvas(256, 256, 211, 5, 3, 1), 0, 0, W, H);
  x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  hx.globalAlpha = .14; hx.drawImage(fbmCanvas(256, 256, 213, 4, 16, 1.2), 0, 0, W, H); hx.globalAlpha = 1;
  return { map: c, normal: normalFromHeight(h, 2.0) };
}

/* ---------------------------------------------------------------- plaster
   Lime-wash: a fine-grained face with a soft trowel mottle, faint rain
   streaks from the eaves and a few hairline cracks. */
function texPlaster() {
  const W = 512, H = 512, c = cvs(W, H), x = c.getContext('2d');
  const h = cvs(W, H), hx = h.getContext('2d'), rnd = mulberry32(77);
  x.fillStyle = '#b9b3a6'; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'overlay'; x.globalAlpha = .30;
  x.drawImage(fbmCanvas(W, H, 41, 6, 3, 1), 0, 0);
  x.globalAlpha = .08; x.drawImage(fbmCanvas(W, H, 43, 3, 160, 1.4), 0, 0);
  x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 26; i++) {                      /* rain streaks */
    const sx = rnd() * W, w = 2 + rnd() * 9, len = H * (.25 + rnd() * .5);
    const g = x.createLinearGradient(0, 0, 0, len);
    g.addColorStop(0, 'rgba(70,64,56,.16)'); g.addColorStop(1, 'rgba(70,64,56,0)');
    x.fillStyle = g; x.fillRect(sx, 0, w, len);
  }
  hx.fillStyle = '#808080'; hx.fillRect(0, 0, W, H);
  hx.globalAlpha = .55; hx.drawImage(fbmCanvas(W, H, 41, 5, 8, 1), 0, 0);
  hx.globalAlpha = .35; hx.drawImage(fbmCanvas(W, H, 45, 3, 200, 1.6), 0, 0); hx.globalAlpha = 1;
  x.strokeStyle = 'rgba(40,36,30,.35)'; x.lineWidth = 1; hx.strokeStyle = '#303030'; hx.lineWidth = 2;
  for (let k = 0; k < 5; k++) {                        /* hairline cracks */
    let px = rnd() * W, py = rnd() * H * .5;
    x.beginPath(); hx.beginPath(); x.moveTo(px, py); hx.moveTo(px, py);
    for (let s = 0; s < 14; s++) { px += (rnd() - .5) * 22; py += 8 + rnd() * 16; x.lineTo(px, py); hx.lineTo(px, py); }
    x.stroke(); hx.stroke();
  }
  return { map: c, normal: normalFromHeight(h, 1.6) };
}
const plaster = () => lib('plaster', () => texPlaster());

/* trim that gives the hall some architecture: plinth, red bands, a row of dentils */
function dressHall(g) {
  const rust = new THREE.MeshStandardMaterial({ color: 0x6d2a20, roughness: .72, metalness: 0 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x3a2a24, roughness: .8, metalness: 0 });
  const stone = new THREE.MeshStandardMaterial({ color: 0x77716a, roughness: .95, metalness: 0 });
  const F = PODIUM, Z = TEMPLE_Z;
  const add = (w, h, d, x, y, z, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; g.add(b); };
  add(14.2, .62, 8.7, 0, F + .31, Z, stone);                    /* plinth */
  add(14.0, .38, 8.5, 0, F + 4.62, Z, rust);                    /* band under the lower roof */
  add(10.3, .34, 6.3, 0, F + 10.95, Z, rust);                   /* band under the upper roof */
  for (let i = 0; i < 27; i++) add(.30, .30, .20, -6.5 + i * .5, F + 4.28, Z + 4.22, dark);
  for (let i = 0; i < 19; i++) add(.28, .28, .18, -4.5 + i * .5, F + 10.62, Z + 3.12, dark);
  [-1, 1].forEach(s => { add(.38, 4.6, .38, s * 6.95, F + 2.6, Z + 4.28, rust); });   /* corner posts */
}

