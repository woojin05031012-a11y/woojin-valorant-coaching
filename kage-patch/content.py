"""Stage 2: swap the Kyoto copy for the coaching content and add the apply form.
Run after patch.py:  python3 content.py kage-valorant.html
"""
import sys, re
P = sys.argv[1]
ACCENT = '#f0b45a' if len(sys.argv) > 2 and sys.argv[2] == 'haven' else '#37f0d2'
s = open(P, encoding='utf-8').read()

YT = 'https://www.youtube.com/@Woojinvlrt'

def between(text, start, end, new, from_pos=0):
    a = text.index(start, from_pos)
    b = text.index(end, a)
    return text[:a] + new + text[b:]

def rep(old, new):
    global s
    assert old in s, old[:60]
    s = s.replace(old, new, 1)

# ---- document level
s = re.sub(r'<title>[^<]*</title>', '<title>Woojin VALORANT Coaching</title>', s, count=1)
s = re.sub(r'<meta name="description" content="[^"]*">',
           '<meta name="description" content="발로란트 레디언트 이우진의 1:1 개인 코칭. 1시간, 25,000원.">', s, 1)
rep('<html lang="en"', '<html lang="ko"') if '<html lang="en"' in s else None
rep('data-layout-curriculum="b" data-layout-closing="b"', 'data-layout-curriculum="b" data-layout-closing="a"')

# ---- preloader / brand / nav
rep('<div class="pre-jp jp">影の道</div>', '<div class="pre-jp">WOOJIN</div>')
rep('<span>Raising the mountain temple</span>', '<span>맵 불러오는 중</span>')
rep('<span class="brand-tx"><b>KAGE</b><i>HIDDEN REALMS OF KYOTO</i></span>',
    '<span class="brand-tx"><b>WOOJIN</b><i>VALORANT COACHING</i></span>')
s = between(s, '<nav class="nav-links" id="navlinks">', '<button class="nav-burger"', '''<nav class="nav-links" id="navlinks">
    <a class="nav-link" href="#gate" data-cursor><span>소개</span><span class="alt">About</span></a>
    <a class="nav-link" href="#pathways" data-cursor><span>코칭 범위</span><span class="alt">Focus</span></a>
    <a class="nav-link" href="#lessons" data-cursor><span>코칭 안내</span><span class="alt">Guide</span></a>
    <a class="nav-link" href="#eternity" data-cursor><span>신청</span><span class="alt">Apply</span></a>
  </nav>
  ''')

# ---- hero
s = between(s, '<div class="hero-top">', '<div class="word-fb"', '''<div class="hero-top">
    <div class="eyebrow" data-rv="fade"><span class="dot"></span> VALORANT 1:1 COACHING</div>
    <h1 class="display h-hero">
      <span class="mask-line"><span>내 플레이의 문제를,</span></span>
      <span class="mask-line"><span>직접 짚어</span></span>
      <span class="mask-line"><span>드립니다.</span></span>
    </h1>
    <p class="hero-sub body" data-rv="up">발로란트 강의 유튜브를 운영하며 쌓은 피드백 경험으로,
      신청자의 플레이를 같이 보며 고쳐야 할 부분을 알려드립니다.</p>
  </div>

  <div class="hero-spacer"></div>

  <div class="hero-foot">
    <div class="hero-cue" data-rv="fade"><span>Scroll</span><span class="track"><i></i></span></div>
    <div class="chapters" id="chips">
      <div class="chip" data-chip="0" data-rv="up" data-cursor><span class="num">01</span>
        <span class="tx"><b>신청서 작성</b><p>닉네임, 티어, 고민, Discord ID 입력</p></span></div>
      <div class="chip" data-chip="1" data-rv="up" data-cursor><span class="num">02</span>
        <span class="tx"><b>Discord로 연락</b><p>신청 내용을 확인한 뒤 먼저 연락드립니다</p></span></div>
      <div class="chip" data-chip="2" data-rv="up" data-cursor><span class="num">03</span>
        <span class="tx"><b>일정 조율</b><p>Discord에서 시간과 진행 방식을 정합니다</p></span></div>
      <div class="chip" data-chip="3" data-rv="up" data-cursor><span class="num">04</span>
        <span class="tx"><b>1:1 코칭</b><p>음성 통화와 화면 공유로 진행</p></span></div>
    </div>
  </div>

  <a class="peek" href="%s" target="_blank" rel="noopener" data-view="3" data-rv="fade" data-cursor aria-label="이우진 YouTube 채널 열기">
    <span class="peek-fr" data-frame></span>
    <span class="peek-play"><svg viewBox="0 0 22 22" fill="none"><path d="M8 5.6 16.4 11 8 16.4z" fill="#dfe7e0"/></svg></span>
    <span class="peek-cap"><b>YouTube</b><i>이우진 채널 보기</i></span>
  </a>

  ''' % YT)
s = re.sub(r'<div class="word-fb" aria-hidden="true">KAGE</div>', '<div class="word-fb" aria-hidden="true">이우진</div>', s, 1)
rep("const word = 'KAGE'", "const word = '\\u2003이우진\\u2003'")
s=s.replace("px Wordmark, sans-serif", 'px Wordmark, "Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif')
s = re.sub(r'<span class="v jp">影の道</span>', '<span class="v">VALORANT</span>', s, 1)

# ---- chapter I: about
def section_body(sec_id, new_inner):
    global s
    a = s.index('<section class="sec%s" id="%s"' % (' fin' if sec_id == 'eternity' else '', sec_id))
    h = s.index('<div class="sec-head"', a) if sec_id != 'eternity' else s.index('<div class="eyebrow"', a)
    e = s.index('</section>', h)
    s = s[:h] + new_inner + s[e:]

section_body('gate', '''<div class="sec-head" data-rv="fade">
    <span class="k"><b>01</b> — 소개</span><span class="rule"></span><span class="k">ABOUT</span>
  </div>
  <div class="gate-grid">
    <h2 class="display h-sec" data-rv="up">레디언트의 뇌지컬로 푸는 발로란트.</h2>
    <div class="gate-copy">
      <p class="lead" data-rv="up">발로란트 강의 영상을 올리는 유튜브 채널 '이우진'을 운영하고 있습니다.
        영상 마지막에 1:1 코칭 홍보를 넣어 문의를 받았고, 지금까지 300건 이상의 1:1 피드백을 진행했습니다.</p>
      <p class="body" data-rv="up">현재 티어는 최고 티어인 레디언트입니다. 플레이 스타일은 뇌지컬 위주로,
        에임 연습보다 상황 판단과 선택의 이유를 먼저 봅니다. 신청자의 플레이에서
        무엇이 문제인지 같이 확인하고, 다음 판에 바로 바꿀 수 있는 것부터 짚어드립니다.</p>
      <a class="arrowlink" href="#eternity" data-rv="fade" data-cursor>
        <span>코칭 신청하기</span>
        <span class="ar"><svg viewBox="0 0 14 14" fill="none"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg></span>
      </a>
    </div>
  </div>
  <div class="gate-stats" data-rv="up">
    <div><b>300+</b><span>누적 피드백</span></div>
    <div><b>1:1</b><span>개인 코칭</span></div>
    <div><b>60분</b><span>1회 시간</span></div>
    <div><b>Radiant</b><span>현재 티어</span></div>
  </div>
  <div class="vids" data-rv="up">
    <div class="vids-head"><span class="k">VIDEO</span><h3>실전 강의 영상</h3><p class="vids-note">채널에서 운영하는 강의 영상입니다.</p></div>
    <div class="vids-grid">
      <figure class="vid" data-yt="Du33Hr0-CsE" data-start="0">
        <button type="button" class="vid-btn" aria-label="영상 재생: 따라하기만 해도 티어가 달라지는" data-cursor>
          <img src="https://i.ytimg.com/vi/Du33Hr0-CsE/hqdefault.jpg" alt="" loading="lazy" onerror="this.style.display='none'">
          <span class="vid-play"><svg viewBox="0 0 22 22" fill="none"><path d="M8 5.6 16.4 11 8 16.4z" fill="#dfe7e0"/></svg></span>
        </button>
        <figcaption>[실전강의] 따라하기만 해도 티어가 달라지는</figcaption>
      </figure>
      <figure class="vid" data-yt="wK0nnEghZNU" data-start="302">
        <button type="button" class="vid-btn" aria-label="영상 재생: 알고 있으면 티어 무조건 상승하는" data-cursor>
          <img src="https://i.ytimg.com/vi/wK0nnEghZNU/hqdefault.jpg" alt="" loading="lazy" onerror="this.style.display='none'">
          <span class="vid-play"><svg viewBox="0 0 22 22" fill="none"><path d="M8 5.6 16.4 11 8 16.4z" fill="#dfe7e0"/></svg></span>
        </button>
        <figcaption>[실전강의] 알고 있으면 티어 무조건 상승하는</figcaption>
      </figure>
    </div>
  </div>
''')

# ---- chapter II: focus (cards keep their minimap art)
a = s.index('<section class="sec" id="pathways"')
h = s.index('<div class="sec-head"', a)
e = s.index('</section>', h)
blk = s[h:e]
blk = re.sub(r'<span class="k"><b>02</b> — Still Gardens</span><span class="rule"></span><span class="k jp">庭園</span>',
             '<span class="k"><b>02</b> — 코칭 범위</span><span class="rule"></span><span class="k">FOCUS</span>', blk)
for old, new in [('<b>Approach</b><span class="jp">参道</span>', '<b>포지셔닝</b><span>Position</span>'),
                 ('<b>Lanterns</b><span class="jp">灯籠</span>', '<b>상황 판단</b><span>Decision</span>'),
                 ('<b>Moonwater</b><span class="jp">月影</span>', '<b>라운드 운영</b><span>Round</span>'),
                 ('<span>The long climb</span>', '<span>어디에 자리잡고, 어디서 교전을 해야 하는지</span>'),
                 ('<span>Lantern court</span>', '<span>지금 이 선택이 왜 맞는지</span>'),
                 ('<span>The wet court</span>', '<span>스킬·정보·타이밍 정리</span>')]:
    assert old in blk, old
    blk = blk.replace(old, new)
TX = [('01', '교전 전에 정해 두는 것', ['맵과 상황에 맞는 기본 자리', '아군과의 거리, 서로 커버되는 위치', '정보를 이용한 포지션 선정']),
      ('02', '선택에 이유가 있는지', ['인원·시간·스킬 상황 읽기', '푸시할지 홀드할지의 기준', '잘못된 선택이 나온 원인 찾기']),
      ('03', '라운드를 길게 보는 법', ['스킬과 자원 사용 순서', '정보 수집과 콜 정리', '라운드 후반 타이밍과 마무리'])]
NAMES = {'01': '포지셔닝', '02': '상황 판단', '03': '라운드 운영'}
parts = blk.split('<div class="card-lab">')
assert len(parts) == 4
blk = parts[0]
for (n, t, ls), rest in zip(TX, parts[1:]):
    blk += '<div class="card-tx"><i>%s</i><h3>%s</h3><p>%s</p><ul>%s</ul></div><div class="card-lab">' % (n, NAMES[n], t, ''.join('<li>%s</li>' % x for x in ls)) + rest
s = s[:h] + blk + s[e:]

# ---- chapter III: guide
section_body('lessons', '''<div class="sec-head" data-rv="fade">
    <span class="k"><b>03</b> — 코칭 안내</span><span class="rule"></span><span class="k">GUIDE</span>
  </div>
  <div class="cur-head">
    <h2 class="display h-sec" data-rv="up">1:1로, 개인의 모든 문제점을 짚어드립니다.</h2>
    <p class="body-lg" data-rv="up">정해진 커리큘럼을 따라가는 강의가 아니라, 신청자의 플레이를 직접 보고
      그 사람에게 필요한 것만 이야기하는 코칭입니다.</p>
  </div>
  <div class="cur" id="cur">
    <div class="les" data-les="0" data-cursor>
      <span class="k">01</span>
      <h3>1:1 개인 코칭</h3>
      <p>한 명씩, 신청자의 플레이에 맞춰 진행합니다.</p>
      <span class="t">1:1</span><i class="bar"></i>
    </div>
    <div class="les" data-les="1" data-cursor>
      <span class="k">02</span>
      <h3>모든 문제점 짚기</h3>
      <p>에임, 포지셔닝, 스킬 활용, 상황 판단, 라운드 운영까지 한 번에 봅니다.</p>
      <span class="t">ALL</span><i class="bar"></i>
    </div>
    <div class="les" data-les="2" data-cursor>
      <span class="k">03</span>
      <h3>음성 통화와 화면 공유</h3>
      <p>Discord에서 실시간으로 같이 보며 이야기합니다.</p>
      <span class="t">Discord</span><i class="bar"></i>
    </div>
    <div class="les" data-les="3" data-cursor>
      <span class="k">04</span>
      <h3>소요 시간</h3>
      <p>한 번에 1시간 진행합니다.</p>
      <span class="t">60 min</span><i class="bar"></i>
    </div>
    <div class="les" data-les="4" data-cursor>
      <span class="k">05</span>
      <h3>가격</h3>
      <p>1회 25,000원입니다.</p>
      <span class="t">25,000원</span><i class="bar"></i>
    </div>
  </div>
  <div class="faq" id="faq" data-rv="up">
    <div class="faq-head"><span class="k">FAQ</span><h3>자주 묻는 질문</h3></div>
    <div class="faq-list">
      <details><summary>어떤 티어든 신청할 수 있나요?</summary>
        <p>티어 제한 없이 신청할 수 있습니다. 신청서에 현재 티어를 적어 주시면 그에 맞춰 플레이를 봅니다.</p></details>
      <details><summary>코칭은 어떻게 진행되나요?</summary>
        <p>1:1로 Discord 음성 통화와 화면 공유를 이용해 진행합니다.</p></details>
      <details><summary>진행 방식에는 어떤 것이 있나요?</summary>
        <p>실시간 랭크, 리플레이, 녹화본 세 가지입니다. 어떤 방식으로 할지는 Discord에서 일정과 함께 정합니다.</p></details>
      <details><summary>시간과 가격은 어떻게 되나요?</summary>
        <p>1회 60분이며, 가격은 25,000원입니다.</p></details>
      <details><summary>신청하면 어떻게 진행되나요?</summary>
        <p>신청서를 확인한 뒤, 신청 당일에서 24시간 이내에 Discord로 먼저 연락드립니다. 그 자리에서 일정과 진행 방식을 정합니다.</p></details>
      <details><summary>일정은 변경할 수 있나요?</summary>
        <p>코칭 이틀 전까지 변경할 수 있습니다.</p></details>
      <details><summary>신청서에는 무엇을 적어야 하나요?</summary>
        <p>발로란트 닉네임, 현재 티어, 주 요원 또는 포지션, Discord ID, 고민하고 있는 부분과 피드백받고 싶은 내용을 적어 주세요. 전화번호와 주소는 받지 않습니다.</p></details>
      <details><summary>코칭에서는 어떤 부분을 보나요?</summary>
        <p>에임, 포지셔닝, 스킬 활용, 상황 판단, 라운드 운영까지 신청자의 플레이에서 필요한 부분을 봅니다.</p></details>
    </div>
  </div>
  <div class="rev" id="reviews" data-rv="up">
    <div class="rev-head"><span class="k">REVIEWS</span><h3>코칭 후기</h3>
      <p class="rev-note">코칭을 받은 분이 남긴 후기입니다. 확인을 거친 후기만 공개하며, 별점이 낮은 후기도 숨기지 않습니다.</p></div>
    <ul class="rev-list" id="rv-list" aria-live="polite"><li class="rev-empty">후기를 불러오는 중입니다.</li></ul>
    <button type="button" class="rev-toggle" id="rv-toggle" aria-expanded="false" aria-controls="review-form"><span>후기 남기기</span><i aria-hidden="true">+</i></button>
    <form class="apply rev-form" id="review-form" novalidate hidden>
      <div class="f"><label for="rv-nick">닉네임 (실명은 쓰지 마세요)</label><input id="rv-nick" maxlength="20" autocomplete="off"><p class="err"></p></div>
      <div class="f"><span class="lbl" id="rv-star-l">별점</span>
        <div class="stars" role="radiogroup" aria-labelledby="rv-star-l">
          <input type="radio" name="rv-rating" id="rv-s5" value="5"><label for="rv-s5" title="5점">&#9733;</label>
          <input type="radio" name="rv-rating" id="rv-s4" value="4"><label for="rv-s4" title="4점">&#9733;</label>
          <input type="radio" name="rv-rating" id="rv-s3" value="3"><label for="rv-s3" title="3점">&#9733;</label>
          <input type="radio" name="rv-rating" id="rv-s2" value="2"><label for="rv-s2" title="2점">&#9733;</label>
          <input type="radio" name="rv-rating" id="rv-s1" value="1"><label for="rv-s1" title="1점">&#9733;</label>
        </div><p class="err"></p></div>
      <div class="f"><label for="rv-tb">피드백 받기 전 티어</label>
        <select id="rv-tb"><option value="">선택</option><option>아이언 1</option><option>아이언 2</option><option>아이언 3</option><option>브론즈 1</option><option>브론즈 2</option><option>브론즈 3</option><option>실버 1</option><option>실버 2</option><option>실버 3</option><option>골드 1</option><option>골드 2</option><option>골드 3</option><option>플래티넘 1</option><option>플래티넘 2</option><option>플래티넘 3</option><option>다이아몬드 1</option><option>다이아몬드 2</option><option>다이아몬드 3</option><option>초월자 1</option><option>초월자 2</option><option>초월자 3</option><option>불멸 1</option><option>불멸 2</option><option>불멸 3</option><option>레디언트</option></select><p class="err"></p></div>
      <div class="f"><label for="rv-ta">피드백 받은 후 티어</label>
        <select id="rv-ta"><option value="">선택</option><option>아이언 1</option><option>아이언 2</option><option>아이언 3</option><option>브론즈 1</option><option>브론즈 2</option><option>브론즈 3</option><option>실버 1</option><option>실버 2</option><option>실버 3</option><option>골드 1</option><option>골드 2</option><option>골드 3</option><option>플래티넘 1</option><option>플래티넘 2</option><option>플래티넘 3</option><option>다이아몬드 1</option><option>다이아몬드 2</option><option>다이아몬드 3</option><option>초월자 1</option><option>초월자 2</option><option>초월자 3</option><option>불멸 1</option><option>불멸 2</option><option>불멸 3</option><option>레디언트</option></select><p class="err"></p></div>
      <div class="f full"><label for="rv-text">후기 (10~300자)</label><textarea id="rv-text" rows="4" maxlength="300"></textarea><p class="err"></p></div>
      <div class="f full"><label class="consent" for="rv-consent"><input type="checkbox" id="rv-consent">
        <span>작성한 후기를 닉네임과 함께 사이트에 공개하는 데 동의합니다. 제출한 후기는 확인 후에 공개됩니다.</span></label><p class="err"></p></div>
      <div class="f full"><button class="cta apply-btn" type="submit"><i></i><span>후기 남기기</span></button>
        <p class="apply-status" id="rv-status" role="status" aria-live="polite"></p></div>
    </form>
  </div>
''')

# ---- chapter IV: apply form
FIELDS = '''
    <div class="f"><label for="ap-nick">발로란트 닉네임</label><input id="ap-nick" name="nick" autocomplete="off"><p class="err"></p></div>
    <div class="f"><label for="ap-tier">현재 티어</label>
      <select id="ap-tier" name="tier"><option value="">선택</option>
        <option>아이언</option><option>브론즈</option><option>실버</option><option>골드</option><option>플래티넘</option>
        <option>다이아몬드</option><option>초월자</option><option>불멸</option><option>레디언트</option></select><p class="err"></p></div>
    <div class="f"><label for="ap-agent">주 요원 또는 포지션</label><input id="ap-agent" name="agent" autocomplete="off"><p class="err"></p></div>
    <div class="f"><label for="ap-discord">Discord ID</label><input id="ap-discord" name="discord" autocomplete="off"><p class="err"></p></div>
    <div class="f full"><label for="ap-problem">현재 고민하고 있는 부분</label><textarea id="ap-problem" name="problem" rows="3"></textarea><p class="err"></p></div>
    <div class="f full"><label for="ap-want">가장 피드백받고 싶은 내용</label><textarea id="ap-want" name="want" rows="3"></textarea><p class="err"></p></div>
    <div class="f full"><label class="consent" for="ap-consent"><input type="checkbox" id="ap-consent">
      <span>닉네임, 티어, 고민, Discord ID는 코칭 신청 확인과 연락에만 사용합니다. 전화번호와 주소 등은 받지 않습니다.</span></label><p class="err"></p></div>
    <div class="f full"><button class="cta apply-btn" type="submit"><i></i><span>신청하기</span></button>
      <p class="apply-status" id="ap-status" role="status" aria-live="polite"></p></div>
'''
section_body('eternity', '''<div class="eyebrow" data-rv="fade">Chapter 04 — 신청</div>
  <h2 class="display" data-rv="up">코칭 신청</h2>
  <p class="body-lg" data-rv="up">신청서를 보내주시면 내용을 확인한 뒤 Discord로 먼저 연락드립니다. 1회 60분, 25,000원입니다.</p>
  <form class="apply" id="apply" data-rv="up" novalidate>''' + FIELDS + '''  </form>
''')

# ---- footer
s = between(s, '<div class="foot-grid">', '</footer>', '''<div class="foot-grid">
    <div class="foot-brand">
      <svg viewBox="0 0 44 44" fill="none" width="34" height="34" aria-hidden="true">
        <circle cx="22" cy="25" r="8.6" fill="#ff4655" fill-opacity=".9"/>
        <path d="M5 13h34M9 18.4h26M22 8.5v27" stroke="#dfe7e0" stroke-width="1.5"/>
      </svg>
      <p>발로란트 레디언트 이우진의 1:1 개인 코칭 홍보·신청 사이트입니다.</p>
    </div>
    <div><h4>메뉴</h4><ul>
      <li><a href="#gate" data-cursor>소개</a></li>
      <li><a href="#pathways" data-cursor>코칭 범위</a></li>
      <li><a href="#lessons" data-cursor>코칭 안내</a></li>
      <li><a href="#eternity" data-cursor>신청</a></li>
    </ul></div>
    <div><h4>채널</h4><ul>
      <li><a href="%s" target="_blank" rel="noopener" data-cursor>YouTube 이우진</a></li>
      <li><a href="#eternity" data-cursor>Discord 연락 (신청 후)</a></li>
    </ul></div>
    <div><h4>정보</h4><ul>
      <li><a href="/" data-cursor>코칭 사이트(기본 화면)</a></li>
      <li><a href="/kage?original=1" data-cursor>원본 Kage 보기</a></li>
    </ul></div>
  </div>
  <div class="foot-base">
    <span>© 2026 Woojin VALORANT Coaching · 202544043 이우진</span>
    <span></span>
    <span>3D 랜딩: Kage by ThreeUI (MIT) 수정본</span>
  </div>
''' % YT)

# ---- CSS (Korean text + the form)
CSS = '''
/* ===== Korean text + apply form (coaching edition) ===== */
body{ word-break:keep-all; line-break:strict; }
body, .body, .body-lg, .lead, .display, h1, h2, h3, .les p, .chip p, .card-meta, .nav-link, .cta, .arrowlink{
  font-family:'Onest','Pretendard','Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',system-ui,sans-serif; }
.display{ letter-spacing:-.01em; }
.h-hero{ line-height:1.12; }
:root{ --apply-line:rgba(223,231,224,.22); }
.fin{ padding-block:clamp(90px,12vh,150px) clamp(60px,8vh,100px); }
.fin h2{ font-size:clamp(38px,6vw,92px); }
.apply{ width:min(860px,100%); margin:34px auto 0; display:grid; grid-template-columns:1fr 1fr; gap:22px 26px; text-align:left;
  padding:clamp(20px,3vw,40px); background:rgba(5,8,12,.74); border:1px solid var(--apply-line); border-radius:16px;
  backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); position:relative; z-index:3; }
.apply .f{ display:flex; flex-direction:column; gap:8px; min-width:0; }
.apply .f.full{ grid-column:1 / -1; }
.apply label{ font-size:12px; letter-spacing:.04em; color:#b4bfb7; }
.apply input:not([type=checkbox]), .apply select, .apply textarea{
  font:inherit; font-size:16px; color:var(--bone,#dfe7e0); background:rgba(255,255,255,.04);
  border:1px solid var(--apply-line); border-radius:10px; padding:12px 14px; outline:none; width:100%; box-sizing:border-box; }
.apply textarea{ resize:vertical; min-height:84px; }
.apply select option{ color:#111; }
.apply input:focus, .apply select:focus, .apply textarea:focus{ border-color:#37f0d2; box-shadow:0 0 0 3px rgba(55,240,210,.16); }
.apply [aria-invalid=true]{ border-color:#ff4655; }
.apply .err{ margin:0; min-height:1em; font-size:12px; color:#ff6b78; }
.apply .consent{ display:flex; gap:10px; align-items:flex-start; font-size:12.5px; line-height:1.6; color:#9aa5a0; cursor:pointer; }
.apply .consent input{ margin-top:3px; accent-color:#37f0d2; flex:none; }
.apply .apply-btn{ margin-top:6px; cursor:pointer; background:transparent; color:inherit; font-family:inherit; width:fit-content; }
.apply .apply-btn[disabled]{ opacity:.5; pointer-events:none; }
.apply-status{ margin:14px 0 0; font-size:14px; line-height:1.6; min-height:1.4em; color:#b4bfb7; }
.apply-status.ok{ color:#37f0d2; } .apply-status.bad{ color:#ff6b78; }
@media (max-width:720px){ .apply{ grid-template-columns:1fr; } }
.fg-hill{ display:none !important; }
.pre-mark{ width:112px !important; height:auto !important; opacity:1 !important; }
.pre-mark img{ width:100%; height:auto; display:block; }
.brand .brand-logo{ width:40px; height:40px; display:block; }
.card-tx{ position:absolute; left:clamp(18px,2.2vw,34px); right:clamp(18px,2.2vw,34px); top:clamp(18px,2.4vw,36px); z-index:2; }
.card-tx i{ display:block; font-style:normal; font-size:clamp(34px,4.6vw,72px); line-height:1; font-weight:300; color:#37f0d2; opacity:.9; letter-spacing:.02em; }
.card-tx h3{ margin:.8em 0 .3em; font-size:clamp(20px,2vw,30px); font-weight:600; line-height:1.3; }
.card-tx p{ margin:0 0 1.2em; font-size:clamp(12px,1.05vw,15px); color:#37f0d2; opacity:.85; }
.card-lab{ display:none !important; }
body .cards{ grid-template-columns:repeat(3,1fr) !important; align-items:stretch !important; }
body .card:first-child{ grid-row:auto !important; }
body .card:nth-child(n){ transform:none !important; }
body .card:nth-child(n) .card-fr{ height:auto !important; aspect-ratio:auto !important; min-height:clamp(250px,24vw,330px) !important; flex:1 1 auto !important; }
@media (max-width:900px){ body .cards{ grid-template-columns:1fr !important; } body .card:nth-child(n) .card-fr{ min-height:300px !important; } }
.card-tx ul{ list-style:none; margin:0; padding:0; display:grid; gap:.55em; }
.card-tx li{ position:relative; padding-left:1.1em; font-size:clamp(12px,1.05vw,15px); line-height:1.55; color:rgba(223,231,224,.78); }
.card-tx li::before{ content:''; position:absolute; left:0; top:.7em; width:.45em; height:1px; background:#37f0d2; }
.card-fr .glow{ display:none; }
.faq{ margin-top:clamp(40px,7vh,84px); display:grid; grid-template-columns:minmax(0,.5fr) minmax(0,1fr); gap:clamp(24px,5vw,80px); position:relative; z-index:3; }
.faq-head h3{ margin:.6em 0 0; font-size:clamp(26px,3vw,44px); font-weight:600; line-height:1.25; }
.faq-head .k{ font-size:12px; letter-spacing:.2em; color:#37f0d2; }
.faq-list{ border-top:1px solid var(--apply-line); }
.faq details{ border-bottom:1px solid var(--apply-line); }
.faq summary{ list-style:none; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:18px;
  padding:clamp(16px,2.2vh,24px) 0; font-size:clamp(16px,1.35vw,20px); font-weight:500; }
.faq summary::-webkit-details-marker{ display:none; }
.faq summary::after{ content:'+'; flex:none; font-weight:300; font-size:26px; line-height:1; color:#37f0d2; transition:transform .25s; }
.faq details[open] summary::after{ transform:rotate(45deg); }
.faq details p{ margin:0; padding:0 0 clamp(16px,2.2vh,24px); font-size:clamp(14px,1.1vw,16px); line-height:1.75; color:#b4bfb7; max-width:60ch; }
.faq summary:focus-visible{ outline:2px solid #37f0d2; outline-offset:4px; }
@media (max-width:900px){ .faq{ grid-template-columns:1fr; gap:18px; } }
.sec#lessons{ padding-bottom:clamp(110px,16vh,190px); }
.vids{ margin-top:clamp(40px,7vh,84px); position:relative; z-index:3; }
.vids-head .k{ font-size:12px; letter-spacing:.2em; color:#37f0d2; }
.vids-head h3{ margin:.6em 0 0; font-size:clamp(26px,3vw,44px); font-weight:600; line-height:1.25; }
@media (max-width:560px){
  .hero-side .v{ display:none !important; }
  .hero-sub{ max-width:min(322px, calc(100vw - 48px)) !important; text-shadow:0 0 10px rgba(3,6,8,.95), 0 1px 26px rgba(3,6,8,.95) !important; }
}
@media (max-width:720px){
  .foot-base{ display:flex !important; flex-direction:column; align-items:flex-start; gap:8px; }
  .foot-base span{ text-align:left !important; white-space:normal; }
  .foot-base span:empty{ display:none; }
  .foot-grid, .foot-base{ z-index:6; }
  .foot-base{ padding-bottom:clamp(90px,16vh,130px); }
}
.vids-note{ margin:.9em 0 0; font-size:clamp(14px,1.15vw,17px); color:#b4bfb7; }
.vids-grid{ margin-top:clamp(20px,3vh,32px); display:grid; grid-template-columns:1fr 1fr; gap:clamp(16px,2.4vw,32px); }
.vid{ margin:0; min-width:0; }
.vid-btn, .vid iframe{ display:block; width:100%; aspect-ratio:16 / 9; border:1px solid var(--apply-line); border-radius:14px; overflow:hidden; background:#070b12; }
.vid-btn{ position:relative; padding:0; cursor:pointer; }
.vid-btn img{ width:100%; height:100%; object-fit:cover; display:block; opacity:.82; transition:opacity .25s, transform .4s; }
.vid-btn:hover img{ opacity:1; transform:scale(1.02); }
.vid-play{ position:absolute; left:50%; top:50%; width:64px; height:64px; margin:-32px 0 0 -32px; border-radius:50%;
  display:grid; place-items:center; background:rgba(5,8,12,.62); border:1px solid rgba(223,231,224,.5); }
.vid-play svg{ width:26px; height:26px; }
.vid-btn:focus-visible{ outline:2px solid #37f0d2; outline-offset:4px; }
.vid figcaption{ margin-top:12px; font-size:clamp(14px,1.1vw,16px); line-height:1.6; color:#b4bfb7; }
@media (max-width:900px){ .vids-grid{ grid-template-columns:1fr; } }
.rev{ margin-top:clamp(56px,9vh,110px); position:relative; z-index:3; }
.rev-head .k{ font-size:12px; letter-spacing:.2em; color:#37f0d2; }
.rev-head h3{ margin:.6em 0 0; font-size:clamp(26px,3vw,44px); font-weight:600; line-height:1.25; }
.rev-note{ margin:.9em 0 0; font-size:clamp(14px,1.15vw,17px); color:#b4bfb7; max-width:60ch; line-height:1.7; }
.rev-list{ list-style:none; margin:clamp(20px,3vh,32px) 0 0; padding:0; display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr)); gap:clamp(14px,2vw,24px); }
.rev-list li{ background:rgba(5,8,12,.6); border:1px solid var(--apply-line); border-radius:14px; padding:20px 22px; }
.rev-list li.rev-empty{ grid-column:1 / -1; color:#9aa5a0; font-size:15px; background:transparent; border-style:dashed; }
.rev-star{ color:#37f0d2; letter-spacing:.12em; font-size:17px; }
.rev-star s{ text-decoration:none; color:rgba(223,231,224,.22); }
.rev-text{ margin:.7em 0 0; font-size:15px; line-height:1.75; color:#dfe7e0; white-space:pre-wrap; overflow-wrap:anywhere; }
.rev-by{ margin:.9em 0 0; font-size:13px; color:#9aa5a0; }
.rev-form{ margin:18px 0 0; width:100%; max-width:none; }
.rev-form[hidden]{ display:none !important; }
.rev-toggle{ margin-top:clamp(24px,4vh,40px); display:inline-flex; align-items:center; gap:14px; cursor:pointer; font:inherit; font-size:15px; color:inherit;
  background:transparent; border:1px solid var(--apply-line); border-radius:999px; padding:13px 22px; transition:border-color .2s, background .2s; position:relative; z-index:3; }
.rev-toggle:hover{ border-color:#37f0d2; background:rgba(55,240,210,.07); }
.rev-toggle i{ font-style:normal; font-size:22px; line-height:1; color:#37f0d2; transition:transform .25s; }
.rev-toggle[aria-expanded=true] i{ transform:rotate(45deg); }
.rev-toggle:focus-visible{ outline:2px solid #37f0d2; outline-offset:4px; }
.rev-tier{ margin:.8em 0 0; font-size:13px; color:#37f0d2; letter-spacing:.02em; }
.rev-form .lbl{ font-size:12px; letter-spacing:.04em; color:#b4bfb7; }
.stars{ display:inline-flex; flex-direction:row-reverse; justify-content:flex-end; gap:2px; width:fit-content; }
.stars input{ position:absolute; opacity:0; width:1px; height:1px; pointer-events:none; }
.stars label{ font-size:34px !important; line-height:1; letter-spacing:0 !important; color:rgba(223,231,224,.25) !important; cursor:pointer; padding:2px 3px; transition:color .15s, transform .15s; }
.stars label:hover, .stars label:hover ~ label, .stars input:checked ~ label{ color:#37f0d2 !important; }
.stars label:hover{ transform:scale(1.12); }
.stars input:focus-visible + label{ outline:2px solid #37f0d2; outline-offset:2px; border-radius:6px; }
.stars[aria-invalid=true] label{ color:rgba(255,70,85,.6) !important; }
'''

import base64 as _b64
_LOGO = 'data:image/png;base64,' + _b64.b64encode(open('/home/claude/kage-work/logo.png', 'rb').read()).decode()
s = re.sub(r'(<div class="pre-mark">)\s*<svg.*?</svg>', lambda m: m.group(1) + '<img src="%s" alt="">' % _LOGO, s, 1, flags=re.S)
s = re.sub(r'(<a class="brand"[^>]*>)\s*<svg.*?</svg>', lambda m: m.group(1) + '<img class="brand-logo" src="%s" alt="">' % _LOGO, s, 1, flags=re.S)
s = re.sub(r'<link rel="icon" href="[^"]*">', '<link rel="icon" href="%s">' % _LOGO, s, 1)
s = s.replace('</style>', CSS.replace('#37f0d2', ACCENT).replace('rgba(55,240,210,.16)', 'rgba(240,180,90,.18)') + '</style>', 1)

# ---- form behaviour: validate, then hand the data to the React host
JS = '''<script>
/* apply form: validation here, saving is done by the React host (Firebase) via postMessage */
(function () {
  var form = document.getElementById('apply'); if (!form) return;
  var status = document.getElementById('ap-status'), btn = form.querySelector('button[type=submit]');
  var FIELDS = [['nick','닉네임을 입력해 주세요.'],['tier','티어를 선택해 주세요.'],['agent','주 요원이나 포지션을 입력해 주세요.'],
                ['discord','Discord ID를 입력해 주세요.'],['problem','고민하는 부분을 적어 주세요.'],['want','피드백받고 싶은 내용을 적어 주세요.']];
  var pending = null, timer = 0;
  function say(t, cls) { status.textContent = t; status.className = 'apply-status' + (cls ? ' ' + cls : ''); }
  function err(el, m) { var p = el.closest('.f').querySelector('.err'); if (p) p.textContent = m || ''; el.setAttribute('aria-invalid', m ? 'true' : 'false'); }
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var data = {}, first = null;
    FIELDS.forEach(function (f) {
      var el = document.getElementById('ap-' + f[0]), v = (el.value || '').trim(), m = '';
      if (!v) m = f[1];
      else if (f[0] === 'discord' && (v.length < 2 || v.length > 32 || /\\s/.test(v))) m = '공백 없이 2~32자로 입력해 주세요.';
      else if (v.length > 1000) m = '1000자 이내로 입력해 주세요.';
      err(el, m); if (m && !first) first = el; data[f[0]] = v;
    });
    var c = document.getElementById('ap-consent');
    err(c, c.checked ? '' : '수집 안내에 동의해 주세요.'); if (!c.checked && !first) first = c;
    if (first) { say(''); first.focus(); return; }
    if (window.parent === window) { say('이 화면에서는 저장되지 않습니다. 사이트의 /kage 주소에서 신청해 주세요.', 'bad'); return; }
    btn.disabled = true; say('저장 중...');
    pending = String(Date.now()) + Math.random();
    window.parent.postMessage({ type: 'woojin-apply', id: pending, payload: data }, location.origin);
    clearTimeout(timer);
    timer = setTimeout(function () { if (pending) { pending = null; btn.disabled = false; say('응답이 없습니다. 잠시 뒤 다시 시도해 주세요.', 'bad'); } }, 12000);
  });
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (e.origin !== location.origin || !d || d.type !== 'woojin-apply-result' || d.id !== pending) return;
    pending = null; clearTimeout(timer); btn.disabled = false;
    if (d.ok) { say('신청이 접수되었습니다. 확인 후 Discord로 먼저 연락드리겠습니다.', 'ok'); form.reset(); }
    else say(d.message || '저장에 실패했습니다. 잠시 뒤 다시 시도해 주세요.', 'bad');
  });
})();
</script>
'''
RJS = '''<script>
/* reviews: list is read by the React host (only approved ones), new reviews are saved unapproved */
(function () {
  var list = document.getElementById('rv-list'), form = document.getElementById('review-form'); if (!list || !form) return;
  var status = document.getElementById('rv-status'), btn = form.querySelector('button[type=submit]');
  var stars = form.querySelector('.stars'), pending = null, timer = 0, tries = 0, got = false, lid = String(Date.now());
  function say(t, cls) { status.textContent = t; status.className = 'apply-status' + (cls ? ' ' + cls : ''); }
  function err(el, m) { var p = el.closest('.f').querySelector('.err'); if (p) p.textContent = m || ''; el.setAttribute('aria-invalid', m ? 'true' : 'false'); }
  function render(items) {
    list.textContent = '';
    if (!items.length) { var e = document.createElement('li'); e.className = 'rev-empty'; e.textContent = '아직 공개된 후기가 없습니다. 코칭을 받으신 분은 아래에서 후기를 남겨 주세요.'; list.appendChild(e); return; }
    items.forEach(function (r) {
      var li = document.createElement('li'), st = document.createElement('div'), n = Math.max(1, Math.min(5, r.rating | 0));
      st.className = 'rev-star'; st.setAttribute('aria-label', '별점 5점 중 ' + n + '점');
      st.textContent = '\u2605'.repeat(n); if (n < 5) { var d = document.createElement('s'); d.textContent = '\u2605'.repeat(5 - n); st.appendChild(d); }
      var tr = null;
      if (r.tierBefore && r.tierAfter) { tr = document.createElement('p'); tr.className = 'rev-tier'; tr.textContent = '티어 ' + r.tierBefore + ' \u2192 ' + r.tierAfter; }
      var t = document.createElement('p'); t.className = 'rev-text'; t.textContent = r.text;
      var b = document.createElement('p'); b.className = 'rev-by'; b.textContent = r.nick;
      li.appendChild(st); if (tr) li.appendChild(tr); li.appendChild(t); li.appendChild(b); list.appendChild(li);
    });
  }
  function ask() {
    if (got || window.parent === window) { if (window.parent === window) render([]); return; }
    window.parent.postMessage({ type: 'woojin-reviews-get', id: lid }, location.origin);
    if (++tries < 4) setTimeout(ask, 1500 * tries);
    else if (!got) { list.textContent = ''; var e = document.createElement('li'); e.className = 'rev-empty'; e.textContent = '후기를 불러오지 못했습니다.'; list.appendChild(e); }
  }
  ask();
  var tg = document.getElementById('rv-toggle');
  tg.addEventListener('click', function () {
    var open = form.hasAttribute('hidden');
    if (open) form.removeAttribute('hidden'); else form.setAttribute('hidden', '');
    tg.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) document.getElementById('rv-nick').focus({ preventScroll: true });
  });
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var nickEl = document.getElementById('rv-nick'), textEl = document.getElementById('rv-text'), c = document.getElementById('rv-consent');
    var nick = nickEl.value.trim(), text = textEl.value.trim(), chk = form.querySelector('input[name=rv-rating]:checked'), first = null;
    var m = !nick ? '닉네임을 입력해 주세요.' : nick.length > 20 ? '20자 이내로 입력해 주세요.' : ''; err(nickEl, m); if (m) first = nickEl;
    var rm = chk ? '' : '별점을 선택해 주세요.'; err(stars, rm); stars.setAttribute('aria-invalid', rm ? 'true' : 'false'); if (rm && !first) first = stars.querySelector('input');
    var tbEl = document.getElementById('rv-tb'), taEl = document.getElementById('rv-ta');
    var bm = tbEl.value ? '' : '피드백 받기 전 티어를 선택해 주세요.'; err(tbEl, bm); if (bm && !first) first = tbEl;
    var am = taEl.value ? '' : '피드백 받은 후 티어를 선택해 주세요.'; err(taEl, am); if (am && !first) first = taEl;
    var tm = text.length < 10 ? '10자 이상 적어 주세요.' : text.length > 300 ? '300자 이내로 적어 주세요.' : ''; err(textEl, tm); if (tm && !first) first = textEl;
    err(c, c.checked ? '' : '공개 동의에 체크해 주세요.'); if (!c.checked && !first) first = c;
    if (first) { say(''); first.focus(); return; }
    if (window.parent === window) { say('이 화면에서는 저장되지 않습니다. 사이트의 /kage 주소에서 남겨 주세요.', 'bad'); return; }
    btn.disabled = true; say('저장 중...');
    pending = String(Date.now()) + Math.random();
    window.parent.postMessage({ type: 'woojin-review', id: pending, payload: { nick: nick, rating: parseInt(chk.value, 10), tierBefore: tbEl.value, tierAfter: taEl.value, text: text } }, location.origin);
    clearTimeout(timer);
    timer = setTimeout(function () { if (pending) { pending = null; btn.disabled = false; say('응답이 없습니다. 잠시 뒤 다시 시도해 주세요.', 'bad'); } }, 12000);
  });
  window.addEventListener('message', function (e) {
    var d = e.data; if (e.origin !== location.origin || !d) return;
    if (d.type === 'woojin-reviews-result' && d.id === lid) { got = true; render(Array.isArray(d.items) ? d.items : []); return; }
    if (d.type !== 'woojin-review-result' || d.id !== pending) return;
    pending = null; clearTimeout(timer); btn.disabled = false;
    if (d.ok) { say('후기가 접수되었습니다. 확인 후 공개됩니다. 감사합니다.', 'ok'); form.reset(); }
    else say(d.message || '저장에 실패했습니다. 잠시 뒤 다시 시도해 주세요.', 'bad');
  });
})();
</script>
'''
VJS = '''<script>
/* YouTube: show a thumbnail first, load the player only when clicked */
(function () {
  document.querySelectorAll('.vid[data-yt]').forEach(function (fig) {
    var btn = fig.querySelector('.vid-btn'); if (!btn) return;
    btn.addEventListener('click', function () {
      var id = fig.getAttribute('data-yt'), st = parseInt(fig.getAttribute('data-start') || '0', 10);
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0' + (st ? '&start=' + st : '');
      f.title = '유튜브 영상'; f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'; f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      btn.replaceWith(f);
    });
  });
})();
</script>
'''
i = s.rindex('</body>')
s = s[:i] + JS + VJS + RJS + s[i:]
open(P, 'w', encoding='utf-8').write(s)
print('ok', len(s))
