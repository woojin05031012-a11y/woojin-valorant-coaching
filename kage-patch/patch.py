import re, sys, base64, random, urllib.parse

SRC = '/home/claude/kage-work/pub/landing-pages/kage.html'
OUT = sys.argv[1]
src = open(SRC, encoding='utf-8').read()
new_js = open('/home/claude/kage-work/tactical.js', encoding='utf-8').read()

# ---------------------------------------------------------------- function replace
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
        elif text.startswith('//', j):
            j = text.index('\n', j)
        elif text.startswith('/*', j):
            j = text.index('*/', j) + 1
        elif ch == '{': depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0: return m.start(), j + 1
        j += 1
    raise Exception('unbalanced ' + name)

names = ['texSky', 'texRidge', 'texWall', 'texFloor', 'texMoon', 'texLeaf',
         'buildTemple', 'buildTorii', 'buildLantern', 'buildMaple', 'buildRocks', 'buildForeground']
# drop the originals (highest offset first) and append the new block before buildShell
spans = sorted((find_func(src, n) for n in names), reverse=True)
for a, b in spans:
    src = src[:a] + src[b:]
marker = '/* the walls are boarded; a column, a sill and a rail are each one stick of'
assert marker in src
src = src.replace(marker, new_js + '\n' + marker, 1)

def rep(old, new, count=1):
    global src
    assert src.count(old) >= 1, old
    src = src.replace(old, new, count)

# per-frame hook, tints
rep('  updateLeaves(dt);\n  updateWisps(dt);', '  updateLeaves(dt);\n  updateTactical(dt);\n  updateWisps(dt);')
rep('fog: true, opacity: 0 }));', 'fog: true, opacity: 0, color: 0x37f0d2 }));')
rep('vec3(1.6,0.78,0.42)', 'vec3(1.7,0.34,0.42)')
rep('new THREE.DirectionalLight(0xff6a42, .52)', 'new THREE.DirectionalLight(0xff4655, .52)')
rep('new THREE.PointLight(0xff8a26, 2.3, 15, 2)', 'new THREE.PointLight(0x2fe6c8, 2.3, 15, 2)')
rep('new THREE.PointLight(0xff8420, 2.2, 11, 2)', 'new THREE.PointLight(0x2fe6c8, 2.2, 11, 2)')
rep('new THREE.PointLight(0xff3a1c, 3.0, 46, 2)', 'new THREE.PointLight(0xff3d4f, 3.0, 46, 2)')
rep('new THREE.PointLight(0xffa049, 4.2, 17, 2)', 'new THREE.PointLight(0x3fe8d0, 4.2, 17, 2)')
rep('<title>Kage — Where stillness reveals the unseen</title>', '<title>Kage — Tactical Map Edition</title>')

# ---------------------------------------------------------------- svg art for the DOM layers
BG = '#05080c'; T = '#37f0d2'; R = '#ff4655'
def svg(w, h, body):
    s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d">%s</svg>' % (w, h, w, h, body)
    return 'data:image/svg+xml;base64,' + base64.b64encode(s.encode()).decode()

def rect(x, y, w, h, f=BG, extra=''):
    return '<rect x="%d" y="%d" width="%d" height="%d" fill="%s" %s/>' % (x, y, w, h, f, extra)
def line(x1, y1, x2, y2, c=T, sw=3, op=.6):
    return '<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="%d" opacity="%s"/>' % (x1, y1, x2, y2, c, sw, op)

def blocks(w, h, seed, lo, hi):
    rnd = random.Random(seed); b = ''; x = -40
    while x < w:
        bw = int(w * (.06 + rnd.random() * .13)); bh = int(h * (lo + rnd.random() * (hi - lo)))
        b += rect(x, h - bh, bw, bh + 2)
        b += rect(x, h - bh, bw, 4, T, 'opacity=".6"')
        b += rect(x, h - bh, 4, bh, T, 'opacity=".18"')
        for k in range(1, 4): b += rect(x, h - bh + k * bh // 4, bw, 2, T, 'opacity=".08"')
        if rnd.random() > .55: b += rect(x + 12, h - bh + 16, int(bw * .4), 7, R, 'opacity=".95"')
        x += int(bw * (.6 + rnd.random() * .45))
    return b

def art(name, w, h):
    rnd = random.Random(sum(map(ord, name)))
    if name == 'temple-wall':
        top = int(h * .60); hh = h - top
        b = rect(0, top, w, hh)
        for i in range(0, w, w // 8): b += rect(i, top, 6, hh, '#000', 'opacity=".5"')
        for k in range(1, 4): b += rect(0, top + k * hh // 4, w, 3, T, 'opacity=".16"')
        b += rect(0, top, w, 6, T, 'opacity=".65"') + rect(0, top + 26, int(w * .5), 8, R, 'opacity=".9"')
        for i in range(0, w, w // 6): b += rect(i, top - int(h * .06), w // 12, int(h * .06))
        return b
    if name == 'pine-tree':  # lattice mast
        cx = w // 2; b = ''
        b += '<polygon points="%d,%d %d,%d %d,%d %d,%d" fill="%s"/>' % (cx - 70, h, cx - 24, 60, cx + 24, 60, cx + 70, h, BG)
        for i in range(10):
            y0 = h - i * (h - 60) // 10; y1 = h - (i + 1) * (h - 60) // 10
            b += line(cx - 60 + i * 4, y0, cx + 24 - i * 4 + 20, y1, T, 3, .45) + line(cx + 60 - i * 4, y0, cx - 24 + i * 4 - 20, y1, T, 3, .45)
        b += rect(cx - 150, 220, 300, 14) + rect(cx - 120, 420, 240, 12) + rect(cx - 6, 20, 12, 60)
        b += '<circle cx="%d" cy="22" r="14" fill="%s"/><circle cx="%d" cy="22" r="40" fill="%s" opacity=".25"/>' % (cx, R, cx, R)
        return b
    if name in ('tall-grass', 'garden-bush'):
        return blocks(w, h, rnd.randint(1, 9999), .22, .62 if name == 'tall-grass' else .5)
    if name == 'sakura-branch':  # overhead cables + junction boxes
        b = ''
        for i in range(8):
            sx = rnd.randint(0, w); ex = sx + rnd.randint(-300, 300); sag = rnd.randint(200, 620)
            b += '<path d="M%d,-10 C%d,%d %d,%d %d,%d" stroke="%s" stroke-width="%d" fill="none"/>' % (sx, sx, sag // 2, ex, sag, ex, sag + 120, BG, rnd.randint(8, 22))
            b += '<path d="M%d,-10 C%d,%d %d,%d %d,%d" stroke="%s" stroke-width="2" fill="none" opacity=".4"/>' % (sx - 5, sx - 5, sag // 2, ex - 5, sag, ex - 5, sag + 120, T)
        for i in range(4):
            bx = rnd.randint(100, w - 260); by = rnd.randint(40, 260)
            b += rect(bx, by, 170, 100) + rect(bx, by, 170, 4, T, 'opacity=".6"') + rect(bx + 16, by + 40, 20, 20, R)
        return b
    if name == 'maple-leaves':  # red shards
        b = ''
        for i in range(34):
            cx = rnd.randint(0, w); cy = rnd.randint(0, h); s = rnd.randint(30, 130); a = rnd.random() * 3
            pts = [(0, -s), (s * .5, 0), (0, s), (-s * .4, 0)]
            b += '<polygon transform="translate(%d,%d) rotate(%d)" points="%s" fill="%s" opacity="%.2f"/>' % (cx, cy, int(a * 60), ' '.join('%d,%d' % p for p in pts), R, .55 + rnd.random() * .4)
        return b
    if name == 'stone-lantern':  # neon bollard
        cx = w // 2
        b = rect(cx - 90, h - 120, 180, 120) + rect(cx - 24, 420, 48, h - 520) + rect(cx - 140, 280, 280, 150)
        b += rect(cx - 110, 300, 220, 110, '#3ff0d6', 'opacity=".95"') + rect(cx - 150, 262, 300, 22, R)
        b += '<circle cx="%d" cy="355" r="260" fill="%s" opacity=".14"/>' % (cx, T)
        return b
    if name == 'basalt-stones':  # jersey barriers
        b = ''; x = 40
        while x < w - 200:
            bw = rnd.randint(380, 560); bh = rnd.randint(260, 420)
            b += '<polygon points="%d,%d %d,%d %d,%d %d,%d" fill="%s"/>' % (x, h, x + 70, h - bh, x + bw - 70, h - bh, x + bw, h, BG)
            b += line(x + 70, h - bh, x + bw - 70, h - bh, T, 4, .7) + rect(x + 120, h - bh + 40, bw - 240, 8, R)
            x += bw - 60
        return b
    if name == 'hill':  # ramp wedge
        b = '<polygon points="0,%d %d,%d %d,%d %d,%d" fill="%s"/>' % (h, w, h, w, int(h * .30), 0, int(h * .85), BG)
        b += line(0, int(h * .85), w, int(h * .30), T, 5, .7)
        for i in range(1, 14): b += line(int(w * i / 14), int(h * (.85 - .55 * i / 14)), int(w * i / 14) + 90, h, R, 10, .35)
        return b
    # shrine-ruins: a broken doorway frame
    b = rect(60, int(h * .24), 150, int(h * .76)) + rect(w - 260, int(h * .38), 150, int(h * .62))
    b += rect(60, int(h * .24), int(w * .62), 120) + rect(int(w * .28), int(h * .24) + 120, 70, 90)
    b += line(60, int(h * .24), int(w * .62) + 60, int(h * .24), T, 5, .7) + rect(90, int(h * .24) + 80, int(w * .46), 8, R)
    b += blocks(w, h, 7, .08, .22)
    return b

def sub_img(m):
    name = m.group(1); w = int(m.group(2)); h = int(m.group(3))
    uri = svg(w, h, art(name, w, h))
    return '<img src="%s" alt="" width="%d" height="%d"' % (uri, w, h)
src, n = re.subn(r'<img src="secret-pathways-assets/foreground/png/([a-z-]+)\.webp" alt="" width="(\d+)" height="(\d+)"', sub_img, src)
print('dom foreground images replaced:', n)

# ---------------------------------------------------------------- minimap card art
def minimap(seed, w=1600, h=1000):
    rnd = random.Random(seed)
    b = rect(0, 0, w, h, '#071018')
    for i in range(0, w, 50): b += line(i, 0, i, h, T, 1, .07)
    for j in range(0, h, 50): b += line(0, j, w, j, T, 1, .07)
    # walls
    for i in range(14):
        x = rnd.randint(0, 28) * 50; y = rnd.randint(0, 18) * 50; L = rnd.randint(3, 9) * 50
        if rnd.random() > .5: b += rect(x, y, L, 16, '#13222c', 'stroke="%s" stroke-opacity=".45" stroke-width="2"' % T)
        else: b += rect(x, y, 16, L, '#13222c', 'stroke="%s" stroke-opacity=".45" stroke-width="2"' % T)
    # sites
    for (cx, cy, ch) in [(int(w * (.25 + .1 * rnd.random())), int(h * (.3 + .1 * rnd.random())), 'A'),
                         (int(w * (.7 + .1 * rnd.random())), int(h * (.6 + .1 * rnd.random())), 'B')]:
        b += '<circle cx="%d" cy="%d" r="130" fill="%s" fill-opacity=".10" stroke="%s" stroke-width="4" stroke-dasharray="18 12"/>' % (cx, cy, R, R)
        b += '<circle cx="%d" cy="%d" r="70" fill="none" stroke="%s" stroke-width="3" opacity=".6"/>' % (cx, cy, R)
        b += '<text x="%d" y="%d" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="92" fill="%s" text-anchor="middle">%s</text>' % (cx, cy + 32, R, ch)
    # route + players
    pts = [(int(w * .08), int(h * .88))]
    for k in range(4): pts.append((int(w * (.2 + .2 * k + .05 * rnd.random())), int(h * (.2 + .6 * rnd.random()))))
    b += '<polyline points="%s" fill="none" stroke="%s" stroke-width="6" stroke-dasharray="22 16" opacity=".85"/>' % (' '.join('%d,%d' % p for p in pts), T)
    for p in pts[:-1]: b += '<circle cx="%d" cy="%d" r="14" fill="%s"/>' % (p[0], p[1], T)
    b += '<circle cx="%d" cy="%d" r="22" fill="none" stroke="%s" stroke-width="4"/>' % (pts[-1][0], pts[-1][1], T)
    return 'data:image/svg+xml;base64,' + base64.b64encode(('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d">%s</svg>' % (w, h, w, h, b)).encode()).decode()

for i, f in enumerate(['kage-sanmon-preview', 'kage-approach', 'kage-lantern-court', 'kage-moonwater']):
    old = "url('secret-pathways-assets/generated/%s.webp')" % f
    assert old in src, f
    src = src.replace(old, "url('%s')" % minimap(11 + i * 7))

print('webp refs left:', src.count('.webp'))
open(OUT, 'w', encoding='utf-8').write(src)
print('wrote', OUT, len(src))
