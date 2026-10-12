"""Stage 1 (Haven-inspired monastery version). Run: python3 haven.py out.html ; then content.py out.html haven"""
import re, sys, base64, random
OUT = sys.argv[1]
js = open('/home/claude/kage-work/haven.js', encoding='utf-8').read()

def find_func(text, name):
    m = re.search(r'^function ' + name + r'\(', text, re.M)
    assert m, name
    i = text.index('{', text.index(')', m.end()))
    depth = 0; j = i; n = len(text)
    while j < n:
        ch = text[j]
        if ch in '\'"`':
            q = ch; j += 1
            while text[j] != q:
                if text[j] == '\\': j += 1
                j += 1
        elif text.startswith('//', j): j = text.index('\n', j)
        elif text.startswith('/*', j): j = text.index('*/', j) + 1
        elif ch == '{': depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0: return m.start(), j + 1
        j += 1
    raise Exception(name)

src = open('/home/claude/kage-work/pub/landing-pages/kage.html', encoding='utf-8').read()
for a, b in sorted((find_func(src, n) for n in ['texSky', 'texRidge', 'texLeaf', 'buildMaple', 'buildTorii', 'texBranchCutout', 'texRoof']), reverse=True):
    src = src[:a] + src[b:]
marker = '/* the walls are boarded; a column, a sill and a rail are each one stick of'
assert marker in src
src = src.replace(marker, js + '\n' + marker, 1)

def rep(old, new):
    global src
    assert old in src, old[:70]
    src = src.replace(old, new, 1)

# roof shape
rep('Math.pow(1 - t, 1.45)', 'Math.pow(1 - t, 1.9)')
rep('const NX = 52, NZ = 34,', 'const NX = 96, NZ = 64,')
rep('roofGeo(9.6, 6.4, 3.2, 2.9, .40, .26)', 'roofGeo(9.8, 6.6, 2.6, 3.6, .42, .40)')
rep('roofGeo(10.8, 7.2, 3.6, 5.2, .48, .26)', 'roofGeo(11.0, 7.4, 3.0, 6.2, .50, .42)')
rep('roofGeo(5.0, 4.0, 1.4, 1.9, .32, .26)', 'roofGeo(5.1, 4.1, 1.1, 2.4, .34, .40)')
# whitewashed walls, red-brown posts, gilded roofs
rep("const timber = surface(wallWood(), [4, 1.6], { color: 0x565150, normal: 1.5 });",
    "const timber = surface(plaster(), [3, 1.4], { color: new THREE.Color().setRGB(1.25, 1.15, 1.0), normal: .8 });")
rep("const post   = surface(postWood(), [1.1, 1.0], { color: 0x8a746d, normal: 1.05, metalness: .03 });",
    "const post   = surface(postWood(), [1.1, 1.0], { color: new THREE.Color().setRGB(2.6, .72, .46), normal: 1.05, metalness: .03 });")
rep("{ color: 0x2b343a, roughness: .74, metalness: .10, normal: 1.4 });",
    "{ color: new THREE.Color().setRGB(1.9, 1.85, 1.9), roughness: .55, metalness: .12, normal: .8 });")
rep("const tileMat = surface(rf, [1, 1],", "const tileMat = surface(rf, [1.5, 1.1],")
rep("scene.add(g); WORLD.temple = g;", "dressHall(g); scene.add(g); WORLD.temple = g;")
# mountains: bigger, brighter, bluer
rep("[[-90, 13, 300, 26, 0], [-63, 9.5, 210, 19, 16]]", "[]")
rep("color: i ? 0x0a1015 : 0x06090d, depthWrite: false, fog: false", "color: i ? 0x8a94b8 : 0xa8b2d2, depthWrite: false, fog: false")
# dusk grade
rep("new THREE.FogExp2(0x050a0e, 0.0168)", "new THREE.FogExp2(0x0b1224, 0.0150)")
rep("new THREE.DirectionalLight(0xff6a42, .52)", "new THREE.DirectionalLight(0x9fb4ff, .55)")
rep("new THREE.HemisphereLight(0x53838f, 0x060a08, .13)", "new THREE.HemisphereLight(0x6a80b8, 0x2a2430, .22)")
rep("new THREE.DirectionalLight(0xb6dbe4, 1.22)", "new THREE.DirectionalLight(0xb6c8f0, 1.3)")
rep("roughness: .74, metalness: .06, color: 0x69757a", "roughness: .85, metalness: .02, color: new THREE.Color().setRGB(1.5, 1.4, 1.3)")
rep("normalScale: new THREE.Vector2(.18, .18), roughness: .93, metalness: .02, color: 0x58636a", "normalScale: new THREE.Vector2(.18, .18), roughness: .93, metalness: .02, color: new THREE.Color().setRGB(1.4, 1.3, 1.2)")
rep("roughness: .78, metalness: .05, color: 0x525c60", "roughness: .85, metalness: .02, color: new THREE.Color().setRGB(1.2, 1.1, 1.0)")
rep("new THREE.PointLight(0xff3a1c, 3.0, 46, 2)", "new THREE.PointLight(0x8ea4ff, 3.0, 46, 2)")
rep("color: hdr(3.6, .64, .61)", "color: hdr(2.0, 2.1, 2.5)")
rep("texGlow('rgba(255,124,112,.90)', 'rgba(206,52,48,.26)')", "texGlow('rgba(180,200,255,.90)', 'rgba(120,150,230,.26)')")
# snow instead of leaves
rep("color: 0x40080a, roughness: .84, metalness: 0,", "color: 0xcfd8ee, roughness: .9, metalness: 0,")
rep("emissive: 0x780200, emissiveIntensity: .72", "emissive: 0x6a7690, emissiveIntensity: .7")
rep("new THREE.PlaneGeometry(.40, .40), mat, N)", "new THREE.PlaneGeometry(.11, .11), mat, N)")

# DOM: the two Kyoto-only plates (sakura, maple leaves) become prayer-flag strings
def svg(w, h, body):
    s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d">%s</svg>' % (w, h, w, h, body)
    return 'data:image/svg+xml;base64,' + base64.b64encode(s.encode()).decode()
COLS = ['#2a58cc', '#e4e4dc', '#cc241a', '#2a9042', '#eab320']
def flags(w, h, seed, rows):
    rnd = random.Random(seed); b = ''
    for r in range(rows):
        y0 = 30 + r * 170; y1 = y0 + rnd.randint(30, 80); sag = rnd.randint(60, 110); N = 6
        pt = lambda t: (t * w * 1.04 - 14, y0 + (y1 - y0) * t + sag * (1 - (2 * t - 1) ** 2))
        pts = [pt(i / 60) for i in range(61)]
        b += '<polyline points="%s" fill="none" stroke="#1a120c" stroke-width="4"/>' % ' '.join('%d,%d' % p for p in pts)
        for i in range(N):
            a = pt(i / N + .01); c = pt((i + 1) / N - .01); fh = 100 + rnd.randint(0, 24)
            b += '<path d="M%d,%d L%d,%d Q%d,%d %d,%d Q%d,%d %d,%d Z" fill="%s" stroke="#00000044" stroke-width="2"/>' % (
                a[0], a[1], c[0], c[1], c[0] + 12, c[1] + fh * .55, c[0] + 4, c[1] + fh,
                (a[0] + c[0]) / 2, a[1] + fh * .9, a[0], a[1] + fh * .95, COLS[(i + r) % 5])
    return b + '<rect width="%d" height="%d" fill="#0e1228" opacity=".34"/>' % (w, h)
def sub_img(m):
    name = m.group(1); w = int(m.group(2)); h = int(m.group(3))
    if name not in ('sakura-branch', 'maple-leaves'): return m.group(0)
    return '<img src="%s" alt="" width="%d" height="%d"' % (svg(w, h, ''), w, h)
src, n = re.subn(r'<img src="secret-pathways-assets/foreground/png/([a-z-]+)\.webp" alt="" width="(\d+)" height="(\d+)"', sub_img, src)
print('flag plates:', n)

# card / preview art: layered mountain landscapes
def land(seed, w=1600, h=1000):
    rnd = random.Random(seed)
    b = '<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1126"/><stop offset=".55" stop-color="#2a3158"/><stop offset=".85" stop-color="#7a5a78"/><stop offset="1" stop-color="#c89478"/></linearGradient></defs>'
    b += '<rect width="%d" height="%d" fill="url(#s)"/>' % (w, h)
    sx = rnd.randint(int(w * .55), int(w * .85))
    b += '<circle cx="%d" cy="%d" r="120" fill="#ffe1ae" opacity=".25"/><circle cx="%d" cy="%d" r="48" fill="#fff0d0" opacity=".9"/>' % (sx, int(h * .52), sx, int(h * .52))
    for k in range(5):
        bx = int(w * (.04 + .2 * k + rnd.random() * .05)); bw = rnd.randint(260, 360); bh = rnd.randint(260, 460); by = int(h * .9) - bh
        b += '<rect x="%d" y="%d" width="%d" height="%d" fill="#e6d6b8"/>' % (bx, by, bw, bh + 200)
        b += '<rect x="%d" y="%d" width="%d" height="26" fill="#a8412f"/><rect x="%d" y="%d" width="26" height="%d" fill="#a8412f"/>' % (bx, by + 70, bw, bx + bw // 2, by, bh + 200)
        b += '<polygon points="%d,%d %d,%d %d,%d %d,%d" fill="#5a3426"/>' % (bx - 30, by + 2, bx + 30, by - 50, bx + bw - 30, by - 50, bx + bw + 30, by + 2)
        for q in range(2): b += '<rect x="%d" y="%d" width="46" height="70" fill="#6a3a28" opacity=".85"/>' % (bx + 50 + q * 120, by + 150)
    b += '<rect y="%d" width="%d" height="%d" fill="#b9a58a"/>' % (int(h * .9), w, h)
    # monastery silhouette + flags
    mx = rnd.randint(int(w * .12), int(w * .5)); my = int(h * .86)
    b += '<polygon points="%d,%d %d,%d %d,%d %d,%d" fill="#1a1c33"/>' % (mx - 60, h, mx - 10, my, mx + 200, my, mx + 250, h)
    b += '<rect x="%d" y="%d" width="190" height="70" fill="#e8dcc2" opacity=".85"/>' % (mx, my - 60)
    b += '<polygon points="%d,%d %d,%d %d,%d %d,%d" fill="#c9a24a"/>' % (mx - 18, my - 62, mx + 36, my - 112, mx + 154, my - 112, mx + 208, my - 62)
    pts = [(int(w * .0) + i * 40, int(h * .18) + int(60 * (1 - ((i / 20) * 2 - 1) ** 2))) for i in range(41)]
    return 'data:image/svg+xml;base64,' + base64.b64encode(('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d">%s</svg>' % (w, h, w, h, b)).encode()).decode()
def tac(kind, w=1600, h=1000):
    """original top-down tactical diagram (invented layout, no game assets)"""
    C = '#2ee6d6'
    rooms = [(150,330,420,200),(470,120,330,420),(470,520,260,330),(720,330,480,190),(1020,150,330,380),(1130,500,300,330),(200,640,300,200),(720,640,330,190)]
    b = '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a1226"/><stop offset=".6" stop-color="#1a1230"/><stop offset="1" stop-color="#4a1520"/></linearGradient><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ffd27a"/></marker></defs>'
    b += '<rect width="%d" height="%d" fill="url(#g)"/>' % (w, h)
    for gx in range(0, w, 80): b += '<line x1="%d" y1="0" x2="%d" y2="%d" stroke="#2ee6d6" opacity=".05"/>' % (gx, gx, h)
    for gy in range(0, h, 80): b += '<line x1="0" y1="%d" x2="%d" y2="%d" stroke="#2ee6d6" opacity=".05"/>' % (gy, w, gy)
    for (x, y, rw, rh) in rooms:
        b += '<rect x="%d" y="%d" width="%d" height="%d" rx="6" fill="#000" opacity=".5"/>' % (x + 12, y + 14, rw, rh)
        b += '<rect x="%d" y="%d" width="%d" height="%d" rx="6" fill="#08222c" stroke="%s" stroke-width="3"/>' % (x, y, rw, rh, C)
    for (x, y, rw, rh) in [(480,300,60,60),(700,380,60,60),(690,560,60,60),(1180,470,60,60),(450,540,60,60),(930,590,60,60)]:
        b += '<rect x="%d" y="%d" width="%d" height="%d" fill="#08222c" stroke="%s" stroke-width="3"/>' % (x, y, rw, rh, C)
    for (x, y, rw, rh) in [(560,200,70,70),(1100,260,60,60),(300,720,60,60)]:
        b += '<rect x="%d" y="%d" width="%d" height="%d" fill="none" stroke="%s" stroke-width="2" opacity=".55"/>' % (x, y, rw, rh, C)
    for lab, (x, y) in {'A': (1220, 280), 'B': (330, 410)}.items():
        b += '<circle cx="%d" cy="%d" r="40" fill="none" stroke="#ffd27a" stroke-width="3" stroke-dasharray="8 8"/><text x="%d" y="%d" text-anchor="middle" font-family="sans-serif" font-size="44" font-weight="700" fill="#ffd27a">%s</text>' % (x, y, x, y + 15, lab)
    dot = lambda x, y, c: '<circle cx="%d" cy="%d" r="22" fill="%s" stroke="#fff" stroke-width="3"/>' % (x, y, c)
    if kind == 'pos':
        b += '<polygon points="640,470 1120,330 1120,540" fill="#ffd27a" opacity=".16"/>'
        b += '<polygon points="640,470 380,250 250,430" fill="#2ee6d6" opacity=".14"/>'
        b += dot(640, 470, '#2ee6d6') + dot(1140, 420, '#ff5a5a') + dot(360, 360, '#ff5a5a')
        b += '<text x="640" y="525" text-anchor="middle" font-family="sans-serif" font-size="30" fill="#e8f7f5">?</text>'
    elif kind == 'dec':
        b += '<path d="M600,820 L600,560 L900,430 L1220,300" fill="none" stroke="#ffd27a" stroke-width="8" stroke-dasharray="22 14" marker-end="url(#a)"/>'
        b += '<path d="M600,560 L330,430" fill="none" stroke="#ffd27a" stroke-width="8" stroke-dasharray="22 14" marker-end="url(#a)" opacity=".75"/>'
        b += '<path d="M900,430 L900,720" fill="none" stroke="#ffd27a" stroke-width="8" stroke-dasharray="22 14" marker-end="url(#a)" opacity=".5"/>'
        for (x, y) in [(600,560),(900,430)]:
            b += '<circle cx="%d" cy="%d" r="30" fill="#0a1226" stroke="#ffd27a" stroke-width="4"/><text x="%d" y="%d" text-anchor="middle" font-family="sans-serif" font-size="38" font-weight="700" fill="#ffd27a">?</text>' % (x, y, x, y + 13)
        b += dot(600, 820, '#2ee6d6')
    else:
        b += '<rect x="130" y="860" width="1340" height="14" rx="7" fill="#fff" opacity=".12"/>'
        for i, (t, c) in enumerate([(0, '#2ee6d6'), (.38, '#ffd27a'), (.72, '#ff5a5a')]):
            x = 130 + t * 1340
            b += '<circle cx="%d" cy="867" r="20" fill="%s"/><rect x="%d" y="867" width="%d" height="14" fill="%s" opacity=".0"/>' % (x, c, x, 40, c)
        b += '<path d="M470,330 L760,430 L1120,470 L1260,330" fill="none" stroke="#2ee6d6" stroke-width="8" stroke-dasharray="4 16" stroke-linecap="round"/>'
        b += dot(470, 330, '#2ee6d6') + dot(760, 430, '#2ee6d6') + dot(1120, 470, '#ffd27a') + dot(1260, 330, '#ff5a5a')
    return 'data:image/svg+xml;base64,' + base64.b64encode(('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d">%s</svg>' % (w, h, w, h, b)).encode()).decode()
for i, f in enumerate(['kage-sanmon-preview', 'kage-approach', 'kage-lantern-court', 'kage-moonwater']):
    old = "url('secret-pathways-assets/generated/%s.webp')" % f
    assert old in src, f
    if i == 0:
        src = src.replace(old, "url('data:image/jpeg;base64,%s')" % base64.b64encode(open('/home/claude/kage-work/thumb.jpg', 'rb').read()).decode())
    else:
        src = src.replace(old + " center / cover no-repeat", "linear-gradient(160deg,#0f1a30,#1a1430 62%,#2a1220)")

open(sys.argv[1], 'w', encoding='utf-8').write(src)
print('wrote', len(src))
