/* ======================================================================
   TACTICAL MAP RE-SKIN (Map Edition)
   Everything below replaces the Kyoto-temple scene builders with an
   original, generic tactical-shooter map: concrete courtyard, a spike
   site with a ring decal, a lit hangar, crates, barriers, neon posts.
   Layout and camera path are unchanged. Not a copy of any real map.
   ====================================================================== */
const TAC = { teal: 0x37f0d2, red: 0xff4655 };

function texSky() {
  const W = 512, H = 512, c = cvs(W, H), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgb(5,9,16)');   g.addColorStop(.38, 'rgb(10,20,32)');
  g.addColorStop(.72, 'rgb(18,36,50)'); g.addColorStop(.92, 'rgb(34,60,74)');
  g.addColorStop(1, 'rgb(16,30,40)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.globalAlpha = .28; x.globalCompositeOperation = 'overlay';
  x.drawImage(fbmCanvas(W, H, 313, 5, 3, .9), 0, 0);
  x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  const wg = x.createRadialGradient(W * .68, H * .95, 4, W * .68, H * .95, W * .46);
  wg.addColorStop(0, 'rgba(255,70,85,.30)'); wg.addColorStop(.5, 'rgba(180,40,60,.12)');
  wg.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = wg; x.fillRect(0, 0, W, H);
  /* faint map-grid in the sky */
  x.strokeStyle = 'rgba(120,230,220,.05)'; x.lineWidth = 1;
  for (let i = 0; i <= W; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); }
  for (let j = 0; j <= H; j += 64) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); }
  const rnd = mulberry32(881);
  for (let i = 0; i < 260; i++) {
    const sx = rnd() * W, sy = rnd() * H * .7, r = .5 + rnd() * rnd() * 1.4;
    x.fillStyle = 'rgba(214,232,240,' + (.10 + rnd() * .35) * (1 - sy / H) + ')';
    x.beginPath(); x.arc(sx, sy, r, 0, TAU); x.fill();
  }
  return c;
}

/* a blocky skyline instead of a forested ridge */
function texRidge() {
  const W = 2048, H = 512, c = cvs(W, H), x = c.getContext('2d');
  const rnd = mulberry32(1207);
  x.fillStyle = '#04070b';
  let px = 0;
  const blocks = [];
  while (px < W) {
    const bw = 40 + rnd() * 150, bh = 70 + rnd() * rnd() * 330;
    blocks.push([px, bw, bh]);
    x.fillRect(px, H - bh, bw, bh);
    if (rnd() > .72) {                       /* stepped top */
      const sw = bw * (.3 + rnd() * .3);
      x.fillRect(px + (bw - sw) / 2, H - bh - 18 - rnd() * 26, sw, 40);
    }
    if (rnd() > .78) {                       /* antenna */
      const ax = px + bw * (.2 + rnd() * .6), ah = 30 + rnd() * 70;
      x.fillRect(ax - 1.5, H - bh - ah, 3, ah);
      x.fillStyle = 'rgba(255,70,85,.9)'; x.fillRect(ax - 3, H - bh - ah - 3, 6, 6);
      x.fillStyle = '#04070b';
    }
    px += bw - 2;
  }
  blocks.forEach(b => {
    const cols = Math.floor(b[1] / 14), rows = Math.floor(b[2] / 22);
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      const q = rnd();
      if (q > .90) {
        x.fillStyle = q > .96 ? 'rgba(255,110,120,.55)' : 'rgba(90,235,215,.42)';
        x.fillRect(b[0] + 6 + k * 14, H - b[2] + 8 + r * 22, 6, 9);
      }
    }
  });
  return c;
}

function texWall() {
  const W = 1024, H = 1024;
  const c = cvs(W, H), x = c.getContext('2d');
  x.fillStyle = '#121a21'; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'overlay'; x.globalAlpha = .7;
  x.drawImage(fbmCanvas(W, H, 41, 6, 3, 1), 0, 0);
  x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  x.strokeStyle = 'rgba(0,0,0,.65)'; x.lineWidth = 4;
  for (let i = 0; i <= 4; i++) {
    x.beginPath(); x.moveTo(i * W / 4, 0); x.lineTo(i * W / 4, H); x.stroke();
    x.beginPath(); x.moveTo(0, i * H / 4); x.lineTo(W, i * H / 4); x.stroke();
  }
  x.fillStyle = 'rgba(55,240,210,.16)';
  for (let i = 0; i < 4; i++) x.fillRect(0, i * H / 4 + 6, W, 2);
  const h = cvs(W, H), hx = h.getContext('2d');
  hx.fillStyle = '#808080'; hx.fillRect(0, 0, W, H);
  hx.globalAlpha = .4; hx.drawImage(fbmCanvas(W, H, 41, 5, 6, 1), 0, 0); hx.globalAlpha = 1;
  hx.fillStyle = '#2a2a2a';
  for (let i = 0; i <= 4; i++) { hx.fillRect(i * W / 4 - 3, 0, 6, H); hx.fillRect(0, i * H / 4 - 3, W, 6); }
  return { map: c, normal: normalFromHeight(h, 2.0) };
}

function texFloor() {
  const W = 1024, H = 1024;
  const c = cvs(W, H), x = c.getContext('2d');
  const rnd = mulberry32(23);
  x.fillStyle = '#080d11'; x.fillRect(0, 0, W, H);
  const N = 4, S = W / N;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const t = .85 + rnd() * .32;
    x.fillStyle = hex(14 * t, 20 * t, 25 * t);
    x.fillRect(i * S + 2, j * S + 2, S - 4, S - 4);
  }
  x.globalCompositeOperation = 'overlay'; x.globalAlpha = .5;
  x.drawImage(fbmCanvas(W, H, 63, 6, 4, 1), 0, 0);
  x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  /* the tactical grid: thin teal lines on the joints, a heavier one on the tile edge */
  x.strokeStyle = 'rgba(55,240,210,.20)'; x.lineWidth = 2;
  for (let i = 0; i <= N; i++) {
    x.beginPath(); x.moveTo(i * S, 0); x.lineTo(i * S, H); x.stroke();
    x.beginPath(); x.moveTo(0, i * S); x.lineTo(W, i * S); x.stroke();
  }
  x.strokeStyle = 'rgba(255,70,85,.30)'; x.lineWidth = 5;
  x.beginPath(); x.moveTo(0, 2); x.lineTo(W, 2); x.moveTo(2, 0); x.lineTo(2, H); x.stroke();
  /* dashed lane marks */
  x.strokeStyle = 'rgba(230,240,240,.16)'; x.lineWidth = 6; x.setLineDash([46, 38]);
  x.beginPath(); x.moveTo(W / 2, 0); x.lineTo(W / 2, H); x.stroke(); x.setLineDash([]);
  const h = cvs(W, H), hx = h.getContext('2d');
  hx.fillStyle = '#8c8c8c'; hx.fillRect(0, 0, W, H);
  hx.globalAlpha = .35; hx.drawImage(fbmCanvas(W, H, 63, 5, 8, 1), 0, 0); hx.globalAlpha = 1;
  hx.strokeStyle = '#303030'; hx.lineWidth = 5;
  for (let i = 0; i <= N; i++) {
    hx.beginPath(); hx.moveTo(i * S, 0); hx.lineTo(i * S, H); hx.stroke();
    hx.beginPath(); hx.moveTo(0, i * S); hx.lineTo(W, i * S); hx.stroke();
  }
  const r = cvs(512, 512), rx = r.getContext('2d');
  rx.fillStyle = '#4a4a4a'; rx.fillRect(0, 0, 512, 512);
  rx.globalAlpha = .6; rx.globalCompositeOperation = 'lighten';
  rx.drawImage(fbmCanvas(512, 512, 77, 4, 3, 1.5), 0, 0);
  rx.globalAlpha = 1; rx.globalCompositeOperation = 'source-over';
  return { map: c, normal: normalFromHeight(h, 1.5), rough: r };
}

/* the "moon" becomes a spike beacon: core, rings, ticks, crosshair */
function texMoon() {
  const S = 512, c = cvs(S, S), x = c.getContext('2d'), R = S / 2 - 4;
  const core = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, R * .34);
  core.addColorStop(0, 'rgba(255,255,255,1)'); core.addColorStop(.7, 'rgba(255,255,255,.85)');
  core.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = core; x.beginPath(); x.arc(S / 2, S / 2, R * .34, 0, TAU); x.fill();
  x.strokeStyle = '#fff';
  [[.50, 5], [.74, 3], [.97, 7]].forEach(r => {
    x.lineWidth = r[1]; x.beginPath(); x.arc(S / 2, S / 2, R * r[0], 0, TAU); x.stroke();
  });
  x.lineWidth = 4;
  for (let i = 0; i < 48; i++) {
    const a = i / 48 * TAU, r0 = R * (i % 4 === 0 ? .80 : .86), r1 = R * .94;
    x.beginPath(); x.moveTo(S / 2 + Math.cos(a) * r0, S / 2 + Math.sin(a) * r0);
    x.lineTo(S / 2 + Math.cos(a) * r1, S / 2 + Math.sin(a) * r1); x.stroke();
  }
  x.lineWidth = 3;
  [[0, 1], [1, 0]].forEach(d => {
    x.beginPath(); x.moveTo(S / 2 - d[0] * R * .46, S / 2 - d[1] * R * .46);
    x.lineTo(S / 2 - d[0] * R * .2, S / 2 - d[1] * R * .2);
    x.moveTo(S / 2 + d[0] * R * .46, S / 2 + d[1] * R * .46);
    x.lineTo(S / 2 + d[0] * R * .2, S / 2 + d[1] * R * .2); x.stroke();
  });
  return c;
}

/* falling debris shards instead of maple leaves */
function texLeaf() {
  const S = 128, c = cvs(S, S), x = c.getContext('2d');
  x.fillStyle = '#fff';
  x.beginPath(); x.moveTo(S * .5, S * .06); x.lineTo(S * .84, S * .56);
  x.lineTo(S * .5, S * .94); x.lineTo(S * .22, S * .52); x.closePath(); x.fill();
  return c;
}

/* a ring decal for the spike site: dashed circle, ticks, a hex frame and an A */
function texSiteDecal() {
  const S = 1024, c = cvs(S, S), x = c.getContext('2d'), m = S / 2;
  x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.lineCap = 'round';
  x.lineWidth = 10; x.beginPath(); x.arc(m, m, 470, 0, TAU); x.stroke();
  x.lineWidth = 6; x.setLineDash([40, 30]); x.beginPath(); x.arc(m, m, 400, 0, TAU); x.stroke(); x.setLineDash([]);
  x.lineWidth = 4;
  for (let i = 0; i < 72; i++) {
    const a = i / 72 * TAU, r0 = i % 6 === 0 ? 420 : 446;
    x.beginPath(); x.moveTo(m + Math.cos(a) * r0, m + Math.sin(a) * r0);
    x.lineTo(m + Math.cos(a) * 470, m + Math.sin(a) * 470); x.stroke();
  }
  x.lineWidth = 12; x.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * TAU + TAU / 12;
    const px = m + Math.cos(a) * 230, py = m + Math.sin(a) * 230;
    if (i) x.lineTo(px, py); else x.moveTo(px, py);
  }
  x.closePath(); x.stroke();
  x.lineWidth = 26; x.lineJoin = 'miter';
  x.beginPath(); x.moveTo(m - 100, m + 110); x.lineTo(m, m - 120); x.lineTo(m + 100, m + 110); x.stroke();
  x.beginPath(); x.moveTo(m - 56, m + 36); x.lineTo(m + 56, m + 36); x.stroke();
  return c;
}

function texLetterA() {
  const S = 512, c = cvs(S, S), x = c.getContext('2d'), m = S / 2;
  x.strokeStyle = '#fff'; x.lineCap = 'round'; x.lineJoin = 'miter';
  x.lineWidth = 14; x.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * TAU + TAU / 12, px = m + Math.cos(a) * 214, py = m + Math.sin(a) * 214;
    if (i) x.lineTo(px, py); else x.moveTo(px, py);
  }
  x.closePath(); x.stroke();
  x.lineWidth = 34;
  x.beginPath(); x.moveTo(m - 100, m + 112); x.lineTo(m, m - 122); x.lineTo(m + 100, m + 112); x.stroke();
  x.beginPath(); x.moveTo(m - 56, m + 36); x.lineTo(m + 56, m + 36); x.stroke();
  return c;
}

/* ------------------------------------------------------- the site hangar */
const matConcrete = () => lib('tacConcrete', () => new THREE.MeshStandardMaterial({ color: 0x1c2832, roughness: .82, metalness: .18 }));
const matSteel    = () => lib('tacSteel',    () => new THREE.MeshStandardMaterial({ color: 0x2a3844, roughness: .5, metalness: .7 }));
const emi = (r, g, b) => new THREE.MeshBasicMaterial({ color: hdr(r, g, b), fog: false, toneMapped: false });

function edgeLines(mesh, color, op) {
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color: color || TAC.teal, transparent: true, opacity: op === undefined ? .5 : op }));
  mesh.add(e); return e;
}

function buildTemple() {
  const g = new THREE.Group();
  const conc = matConcrete(), steel = matSteel();
  const F = PODIUM;
  const box = (w, h, d, x, y, z, m) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m || conc);
    b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; g.add(b); return b;
  };
  /* main block, upper block, roof slabs */
  edgeLines(box(14.4, 5.0, 8.4, 0, F + 2.5, TEMPLE_Z), TAC.teal, .35);
  edgeLines(box(9.6, 3.4, 6.2, 0, F + 5.0 + 1.7, TEMPLE_Z - .4), TAC.teal, .35);
  box(15.0, .5, 9.0, 0, F + 5.25, TEMPLE_Z, steel);
  box(10.2, .5, 6.8, 0, F + 8.65, TEMPLE_Z - .4, steel);
  [-1, 1].forEach(s => {
    edgeLines(box(5.0, 3.2, 5.0, s * 10.6, F + 1.6, TEMPLE_Z + 1.4), TAC.teal, .3);
    box(5.4, .4, 5.4, s * 10.6, F + 3.4, TEMPLE_Z + 1.4, steel);
  });

  /* lit windows (teal), with a few red ones */
  const tealM = emi(.25, 1.9, 1.6), redM = emi(2.4, .30, .42);
  const FZ = TEMPLE_Z + 4.22;
  for (let i = -3; i <= 3; i++) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.7), (i === -3 || i === 3) ? redM : tealM);
    w.position.set(i * 1.9, F + 2.4, FZ); g.add(w);
  }
  for (let i = -1; i <= 1; i++) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.3), tealM);
    w.position.set(i * 2.5, F + 6.2, TEMPLE_Z - .4 + 3.12); g.add(w);
  }
  [-1, 1].forEach(s => {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.5), tealM);
    w.position.set(s * 10.6, F + 1.8, TEMPLE_Z + 1.4 + 2.52); g.add(w);
  });
  /* the red trim along the roof and the lintel */
  [[14.8, F + 5.0], [10.0, F + 8.4]].forEach((t, i) => {
    const r = new THREE.Mesh(new THREE.BoxGeometry(t[0], .14, .14), emi(2.6, .32, .44));
    r.position.set(0, t[1], (i ? TEMPLE_Z - .4 : TEMPLE_Z) + (i ? 3.18 : 4.3)); g.add(r);
  });
  /* the site marker over the door */
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4),
    new THREE.MeshBasicMaterial({ map: tx(texLetterA()), color: hdr(2.4, .34, .46), transparent: true,
      depthWrite: false, fog: false, toneMapped: false }));
  sign.position.set(0, F + 6.2, TEMPLE_Z - .4 + 3.2); sign.renderOrder = 3; g.add(sign);
  WORLD.siteSign = sign;
  /* antennas with beacons */
  [[-5.6, 5.5], [4.8, 4.2], [6.4, 6.6]].forEach(a => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(.06, .08, a[1], 8), steel);
    m.position.set(a[0], F + 8.9 + a[1] / 2, TEMPLE_Z - .4); g.add(m);
    const b = new THREE.Mesh(new THREE.SphereGeometry(.14, 10, 8), emi(3, .4, .5));
    b.position.set(a[0], F + 8.9 + a[1] + .1, TEMPLE_Z - .4); g.add(b);
  });
  /* crates on the podium */
  const rnd = mulberry32(51);
  for (let i = 0; i < 9; i++) {
    const s = 1.2 + rnd() * .9, x = (i < 5 ? -1 : 1) * (8.6 + rnd() * 8), z = TEMPLE_Z + 4.8 + rnd() * 5;
    const cr = box(s, s, s, x, F + s / 2, z, steel);
    cr.rotation.y = rnd() * .6; edgeLines(cr, TAC.teal, .5);
  }
  scene.add(g); WORLD.temple = g;

  /* glow pushed out over the steps */
  const spill = new THREE.Mesh(new THREE.PlaneGeometry(30, 16),
    new THREE.MeshBasicMaterial({ map: tx(texGlow('rgba(60,240,215,.80)', 'rgba(20,160,150,.24)')),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: .30 }));
  spill.position.set(0, F + 3.0, TEMPLE_Z + 5.6); spill.renderOrder = 2;
  scene.add(spill); WORLD.hallHalo = spill;
  const mist = new THREE.Mesh(new THREE.PlaneGeometry(64, 20),
    new THREE.MeshBasicMaterial({ map: tx(texGlow('rgba(150,190,200,.62)', 'rgba(104,150,164,.20)')),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: .17 }));
  mist.position.set(0, F - 1.4, TEMPLE_Z + 10); mist.renderOrder = 2; scene.add(mist);

  /* the spike-site decal and its pulse, painted on the courtyard */
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(15, 15),
    new THREE.MeshBasicMaterial({ map: tx(texSiteDecal()), color: hdr(2.0, .30, .40), transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: true, opacity: .55 }));
  decal.rotation.x = -Math.PI / 2; decal.position.set(0, .03, -1.5); decal.renderOrder = 6; decal.layers.set(1);
  scene.add(decal); WORLD.siteRing = decal;
  const wave = new THREE.Mesh(new THREE.PlaneGeometry(15, 15),
    new THREE.MeshBasicMaterial({ map: tx(texGlow('rgba(255,90,100,0)', 'rgba(255,70,85,.0)')), transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: true, opacity: 0 }));
  /* the wave is a ring: reuse the site texture's outer band by scaling the decal clone */
  wave.material.map = decal.material.map; wave.material.color = new THREE.Color().setRGB(1.6, .35, .45);
  wave.rotation.x = -Math.PI / 2; wave.position.set(0, .035, -1.5); wave.renderOrder = 6; wave.layers.set(1);
  scene.add(wave); WORLD.siteWave = wave;
}

/* the gate becomes a steel archway with a red strip under the lintel */
function buildTorii() {
  const steel = matSteel();
  const g = new THREE.Group();
  const H = 6.4, SPAN = 3.5;
  [-1, 1].forEach(s => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(.95, H, 1.0), steel);
    col.position.set(s * SPAN, H / 2, 0); col.castShadow = true; g.add(col);
    edgeLines(col, TAC.teal, .5);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(.08, H * .8, .08), emi(.3, 2.0, 1.7));
    strip.position.set(s * (SPAN - .5), H * .48, .56); g.add(strip);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(1.4, .5, 1.5), matConcrete());
    foot.position.set(s * SPAN, .25, 0); g.add(foot);
  });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(8.8, .9, 1.2), steel);
  lintel.position.set(0, H + .45, 0); lintel.castShadow = true; g.add(lintel);
  edgeLines(lintel, TAC.teal, .5);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(7.2, .14, .14), emi(2.8, .32, .46));
  bar.position.set(0, H - .12, .5); g.add(bar);
  const top = new THREE.Mesh(new THREE.BoxGeometry(5.2, .5, .9), matConcrete());
  top.position.set(0, H + 1.15, 0); g.add(top);
  g.position.set(0, 0, -8.6); g.scale.setScalar(.9);
  scene.add(g); WORLD.torii = g;
}

/* lantern → neon post */
function buildLantern(x, z, s, y) {
  const steel = matSteel();
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(.8, .3, .8), matConcrete());
  base.position.y = .15; base.castShadow = true; g.add(base);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.07, .1, 2.3, 10), steel);
  pole.position.y = 1.4; pole.castShadow = true; g.add(pole);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.62, .62, .62), steel);
  head.position.y = 2.75; head.castShadow = true; g.add(head);
  const paneMat = new THREE.MeshBasicMaterial({ color: hdr(.25, 2.1, 1.8), fog: false, toneMapped: false });
  [[0, .321, 0], [0, -.321, Math.PI], [.321, 0, Math.PI / 2], [-.321, 0, -Math.PI / 2]].forEach(p => {
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(.44, .44), paneMat);
    if (p[0] === 0) pane.position.set(0, 2.75, p[1]); else pane.position.set(p[0], 2.75, 0);
    pane.rotation.y = p[2]; g.add(pane);
  });
  WORLD.lanternPane = WORLD.lanternPane || paneMat;
  const cap = new THREE.Mesh(new THREE.BoxGeometry(.8, .1, .8), emi(2.6, .32, .44));
  cap.position.y = 3.12; g.add(cap);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4),
    new THREE.MeshBasicMaterial({ map: tx(texGlow('rgba(60,240,215,.9)', 'rgba(20,200,180,.28)')),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: .5 }));
  glow.position.y = 2.75; glow.renderOrder = 2; g.add(glow);
  glow.userData.billboard = true;
  const lt = new THREE.PointLight(TAC.teal, 2.6, 9, 2);
  lt.position.set(0, 2.75, 0); g.add(lt);
  WORLD.lanternLights = WORLD.lanternLights || [];
  WORLD.lanternLights.push(lt); WORLD.lanternGlows = WORLD.lanternGlows || []; WORLD.lanternGlows.push(glow);
  g.position.set(x, y || 0, z); g.scale.setScalar((s || 1) * .85);
  scene.add(g);
  return g;
}

/* maples → crate stacks */
function buildMaple(seed, x, z, scale) {
  const rnd = mulberry32(seed), steel = matSteel(), g = new THREE.Group();
  const n = 3 + Math.floor(rnd() * 3);
  for (let i = 0; i < n; i++) {
    const s = 1.5 + rnd() * .8;
    const cr = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), steel);
    const lvl = i < 2 ? 0 : 1;
    cr.position.set((i % 2) * (s + .15) + rnd() * .3 - (lvl ? s * .5 : 0), lvl ? s * 1.5 : s / 2, (rnd() - .5) * .6);
    cr.rotation.y = (rnd() - .5) * .5; cr.castShadow = cr.receiveShadow = true;
    edgeLines(cr, TAC.teal, .55); g.add(cr);
    if (rnd() > .6) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(s * .9, .08, .08), emi(2.6, .32, .44));
      t.position.set(cr.position.x, cr.position.y + s * .18, cr.position.z + s / 2 + .02); t.rotation.y = cr.rotation.y; g.add(t);
    }
  }
  g.position.set(x, 0, z); g.scale.setScalar(scale || 1);
  scene.add(g);
}

/* rocks → concrete barriers */
function buildRocks() {
  const mat = matConcrete(), rnd = mulberry32(404);
  const spots = [[-6.2, -5.4, .95], [-7.4, -2.1, .7], [6.6, -7.2, .8], [8.0, -4.0, 1.05],
                 [-9.0, -8.4, 1.15], [9.6, -9.2, .9], [3.4, -7.8, .55], [-3.2, -8.6, .6]];
  spots.forEach(s => {
    const w = 2.6 * s[2], h = 1.1 * s[2], d = .85 * s[2];
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    b.position.set(s[0], h / 2, s[1]); b.rotation.y = (rnd() - .5) * 1.0;
    b.castShadow = b.receiveShadow = true; scene.add(b);
    edgeLines(b, TAC.teal, .45);
    const st = new THREE.Mesh(new THREE.BoxGeometry(w * .98, .06, d * .98), emi(2.4, .3, .4));
    st.position.y = h / 2 + .02; b.add(st);
  });
}

/* ------------------------------------------ foreground cut-outs (blocks) */
function texBlockCutout(seed, o) {
  o = o || {};
  const W = 2048, H = 1024, c = cvs(W, H), x = c.getContext('2d'), rnd = mulberry32(seed);
  let px = -60;
  while (px < W) {
    const bw = 90 + rnd() * 260, bh = H * (o.min || .16) + rnd() * H * ((o.max || .5) - (o.min || .16));
    x.fillStyle = '#05080c'; x.fillRect(px, H - bh, bw, bh + 2);
    x.fillStyle = 'rgba(55,240,210,.55)'; x.fillRect(px, H - bh, bw, 3);
    x.fillStyle = 'rgba(55,240,210,.16)'; x.fillRect(px, H - bh, 3, bh);
    for (let k = 1; k < 4; k++) {
      x.fillStyle = 'rgba(55,240,210,.07)'; x.fillRect(px, H - bh + k * bh / 4, bw, 2);
    }
    if (rnd() > .6) { x.fillStyle = 'rgba(255,70,85,.9)'; x.fillRect(px + 10, H - bh + 12, bw * .45, 6); }
    px += bw * (.55 + rnd() * .5);
  }
  const g = x.createLinearGradient(0, H * .5, 0, H);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  return c;
}
function texCableCutout(seed) {
  const W = 1536, H = 1024, c = cvs(W, H), x = c.getContext('2d'), rnd = mulberry32(seed);
  x.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const sx = rnd() * W, ex = sx + (rnd() - .5) * 360, sag = 160 + rnd() * 380;
    x.strokeStyle = '#05080c'; x.lineWidth = 3 + rnd() * 6;
    x.beginPath(); x.moveTo(sx, -10); x.bezierCurveTo(sx, sag * .6, ex, sag * .9, ex + (rnd() - .5) * 60, sag + rnd() * 120); x.stroke();
    x.strokeStyle = 'rgba(55,240,210,.35)'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(sx - 4, -10); x.bezierCurveTo(sx - 4, sag * .6, ex - 4, sag * .9, ex - 4 + (rnd() - .5) * 60, sag + rnd() * 120); x.stroke();
  }
  for (let i = 0; i < 5; i++) {
    x.fillStyle = 'rgba(255,70,85,.95)'; x.beginPath(); x.arc(80 + rnd() * (W - 160), 40 + rnd() * 120, 7, 0, TAU); x.fill();
  }
  return c;
}
function buildForeground() {
  const layers = [
    ['grassFar',  texBlockCutout(101, { min: .12, max: .34 }), -3.4,  2.85, -0.4, 24, 12, .0001],
    ['rockLeft',  texBlockCutout(404, { min: .10, max: .30 }), -7.2,  2.55,  1.8, 17, 11.3, .0001],
    ['grassMid',  texBlockCutout(202, { min: .08, max: .22 }),  3.9,  2.86,  3.6, 15,  7.5, .0001],
    ['grassNear', texBlockCutout(303, { min: .06, max: .16 }), -1.9,  2.92,  5.6, 12,  6, .0001],
    ['bough',     texCableCutout(505), 4.6, 2.95, 6.4, 13, 8.7, .03],
    ['rockNear',  texBlockCutout(606, { min: .10, max: .26 }), -6.6,  1.70,  6.0, 9, 6, .0001]
  ];
  WORLD.fg = [];
  layers.forEach(L => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(L[5], L[6], 12, 12), cutoutMaterial(L[1], L[7]));
    m.position.set(L[2], L[3], L[4]);
    m.renderOrder = 20 + WORLD.fg.length; m.name = L[0]; m.frustumCulled = false;
    scene.add(m); WORLD.fg.push(m);
  });
}

/* per-frame life: the beacon turns, the site ring breathes, a ping rolls out */
function updateTactical(dt) {
  if (WORLD.moon) WORLD.moon.rotation.z += dt * .12;
  if (WORLD.siteRing) WORLD.siteRing.material.opacity = .50 + Math.sin(clock * 1.6) * .16;
  if (WORLD.siteWave) {
    const k = (clock * .45) % 1, s = .6 + k * .5;
    WORLD.siteWave.scale.set(s, s, 1);
    WORLD.siteWave.material.opacity = Math.sin(k * Math.PI) * .30 * (1 - k);
  }
  if (WORLD.siteSign) WORLD.siteSign.material.opacity = .78 + Math.sin(clock * 2.4) * .22;
}
