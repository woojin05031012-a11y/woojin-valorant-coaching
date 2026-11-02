import { Fragment, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { auth, db, configured, googleProvider, ADMIN_EMAIL } from '../firebase.js'
import { faqScore } from '../faq.js'
import { pageCss, fmtDate, STATUSES, statusClass } from './pageStyle.js'

// /admin : 관리자 페이지. 지정한 Google 계정으로 로그인해야 하고,
// 실제 권한 검사는 Firestore 보안 규칙(firestore.rules 의 isAdmin)이 한다.
const SEED_FAQ = [
  ['어떤 티어든 신청할 수 있나요?', '티어 제한 없이 신청할 수 있습니다. 신청서에 현재 티어를 적어 주시면 그에 맞춰 플레이를 봅니다.'],
  ['코칭은 어떻게 진행되나요?', '1:1로 Discord 음성 통화와 화면 공유를 이용해 진행합니다.'],
  ['진행 방식에는 어떤 것이 있나요?', '실시간 랭크, 리플레이, 녹화본 세 가지입니다. 어떤 방식으로 할지는 Discord에서 일정과 함께 정합니다.'],
  ['시간과 가격은 어떻게 되나요?', '1회 60분이며, 가격은 25,000원입니다.'],
  ['신청하면 어떻게 진행되나요?', '신청서를 확인한 뒤, 신청 당일에서 24시간 이내에 Discord로 먼저 연락드립니다. 그 자리에서 일정과 진행 방식을 정합니다.'],
  ['일정은 변경할 수 있나요?', '코칭 이틀 전까지 변경할 수 있습니다.'],
  ['신청서에는 무엇을 적어야 하나요?', '발로란트 닉네임, 현재 티어, 주 요원 또는 포지션, Discord ID, 고민하고 있는 부분과 피드백받고 싶은 내용을 적어 주세요. 전화번호와 주소는 받지 않습니다.'],
  ['코칭에서는 어떤 부분을 보나요?', '에임, 포지셔닝, 스킬 활용, 상황 판단, 라운드 운영까지 신청자의 플레이에서 필요한 부분을 봅니다.'],
]

const Stars = ({ n }) => <span className="star" aria-label={`별점 ${n}점`}>{'★'.repeat(n)}<s>{'★'.repeat(5 - n)}</s></span>

export default function AdminPage() {
  const [user, setUser] = useState(undefined) // undefined: 확인 중
  const [tab, setTab] = useState('apps')
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!auth) { setUser(null); return }
    return onAuthStateChanged(auth, (u) => setUser(u || null))
  }, [])

  async function login() {
    setErr('')
    try { await signInWithPopup(auth, googleProvider) } catch (e) { setErr('로그인에 실패했습니다. (' + (e.code || e.message) + ')') }
  }

  const isAdmin = user && user.email === ADMIN_EMAIL && user.emailVerified

  return (
    <div className="pg">
      <style>{pageCss}</style>
      <div className="pg-in">
        <p className="mute"><a href="/">← 코칭 사이트</a></p>
        <h1>관리자</h1>
        {!configured && <p className="msg bad">Firebase 설정(.env)이 없어 사용할 수 없습니다.</p>}
        {configured && user === undefined && <p className="msg">확인 중...</p>}
        {configured && user === null && (
          <div className="pg-card">
            <p className="pg-sub">신청, 후기, FAQ를 관리하는 페이지입니다. 관리자 Google 계정으로 로그인해 주세요.</p>
            <button className="btn pri" onClick={login}>Google로 로그인</button>
            {err && <p className="msg bad">{err}</p>}
          </div>
        )}
        {configured && user && !isAdmin && (
          <div className="pg-card">
            <p className="msg bad" style={{ marginTop: 0 }}>{user.email} 계정은 관리자 권한이 없습니다.</p>
            <button className="btn" onClick={() => signOut(auth)}>로그아웃</button>
          </div>
        )}
        {configured && isAdmin && (
          <>
            <div className="pg-row" style={{ justifyContent: 'space-between' }}>
              <span className="mute">{user.email}</span>
              <button className="btn sm" onClick={() => signOut(auth)}>로그아웃</button>
            </div>
            <div className="tabs" role="tablist">
              {[['apps', '신청'], ['reviews', '후기'], ['faqs', 'FAQ']].map(([k, l]) => (
                <button key={k} role="tab" className="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>
              ))}
            </div>
            {tab === 'apps' && <Apps />}
            {tab === 'reviews' && <Reviews />}
            {tab === 'faqs' && <Faqs />}
          </>
        )}
      </div>
    </div>
  )
}

// 공통: 컬렉션을 불러오는 훅
function useList(name, order) {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  async function reload() {
    setError('')
    try {
      const q = order ? query(collection(db, name), orderBy(order, 'desc')) : collection(db, name)
      const snap = await getDocs(q)
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch (e) { setError('불러오지 못했습니다. (' + (e.code || e.message) + ')'); setItems([]) }
  }
  useEffect(() => { reload() /* eslint-disable-next-line */ }, [])
  return [items, setItems, reload, error]
}

// ---------------- 신청 ----------------
function Apps() {
  const [items, setItems, reload, error] = useList('applications', 'createdAt')
  const [filter, setFilter] = useState('전체')
  const [open, setOpen] = useState(null)
  if (!items) return <p className="msg">불러오는 중...</p>

  const count = (s) => items.filter((a) => a.status === s).length
  const shown = items.filter((a) => filter === '전체' || (a.status || '접수') === filter)

  async function setStatus(a, status) {
    try {
      await updateDoc(doc(db, 'applications', a.id), { status, updatedAt: serverTimestamp() })
      setItems(items.map((x) => (x.id === a.id ? { ...x, status } : x)))
    } catch (e) { alert('상태를 바꾸지 못했습니다. (' + (e.code || e.message) + ')') }
  }
  async function remove(a) {
    if (!window.confirm(`${a.nick} 님의 신청을 완전히 삭제할까요?`)) return
    try { await deleteDoc(doc(db, 'applications', a.id)); setItems(items.filter((x) => x.id !== a.id)) }
    catch (e) { alert('삭제하지 못했습니다. (' + (e.code || e.message) + ')') }
  }

  return (
    <>
      <div className="stat">
        <span>전체<b>{items.length}</b></span>
        {STATUSES.map((s) => <span key={s}>{s}<b>{count(s)}</b></span>)}
        <button className="btn sm" onClick={reload}>새로고침</button>
      </div>
      <div className="tabs" style={{ marginTop: 0 }}>
        {['전체', ...STATUSES].map((s) => <button key={s} className="tab" style={{ padding: '6px 14px', fontSize: 13.5 }} aria-selected={filter === s} onClick={() => setFilter(s)}>{s}</button>)}
      </div>
      {error && <p className="msg bad">{error}</p>}
      {!shown.length && <p className="msg">표시할 신청이 없습니다.</p>}
      {shown.map((a) => (
        <div className="pg-card" key={a.id}>
          <div className="pg-row" style={{ justifyContent: 'space-between' }}>
            <div>
              <b style={{ fontSize: 17 }}>{a.nick}</b> <span className="mute">· {a.tier} · {a.agent}</span>
              <div className="mute">접수 {fmtDate(a.createdAt)} · Discord {a.discord}</div>
            </div>
            <div className="pg-row">
              <span className={'badge ' + statusClass(a.status)}>{a.status || '접수(이전 형식)'}</span>
              <select aria-label="상태 변경" style={{ width: 'auto', padding: '7px 10px', fontSize: 14 }} value={STATUSES.includes(a.status) ? a.status : ''} onChange={(e) => e.target.value && setStatus(a, e.target.value)}>
                <option value="">상태 변경</option>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <button className="btn sm" onClick={() => setOpen(open === a.id ? null : a.id)}>{open === a.id ? '접기' : '내용 보기'}</button>
            </div>
          </div>
          {open === a.id && (
            <>
              <dl className="kv">
                <dt>고민</dt><dd>{a.problem}</dd>
                <dt>받고 싶은 피드백</dt><dd>{a.want}</dd>
                <dt>신청 번호</dt><dd><span className="code">{a.id}</span></dd>
              </dl>
              <div style={{ marginTop: 12 }}><button className="btn danger sm" onClick={() => remove(a)}>삭제</button></div>
            </>
          )}
        </div>
      ))}
    </>
  )
}

// ---------------- 후기 ----------------
function Reviews() {
  const [items, setItems, reload, error] = useList('reviews', 'createdAt')
  if (!items) return <p className="msg">불러오는 중...</p>
  const approved = items.filter((r) => r.approved)
  const avg = approved.length ? (approved.reduce((s, r) => s + (Number(r.rating) || 0), 0) / approved.length).toFixed(1) : '-'

  async function toggle(r) {
    try {
      await updateDoc(doc(db, 'reviews', r.id), { approved: !r.approved })
      setItems(items.map((x) => (x.id === r.id ? { ...x, approved: !r.approved } : x)))
    } catch (e) { alert('바꾸지 못했습니다. (' + (e.code || e.message) + ')') }
  }
  async function remove(r) {
    if (!window.confirm('이 후기를 완전히 삭제할까요?')) return
    try { await deleteDoc(doc(db, 'reviews', r.id)); setItems(items.filter((x) => x.id !== r.id)) }
    catch (e) { alert('삭제하지 못했습니다. (' + (e.code || e.message) + ')') }
  }
  const pending = items.filter((r) => !r.approved)

  return (
    <>
      <div className="stat">
        <span>전체<b>{items.length}</b></span><span>공개 중<b>{approved.length}</b></span><span>승인 대기<b>{pending.length}</b></span><span>공개된 후기 평균 별점<b>{avg}</b></span>
        <button className="btn sm" onClick={reload}>새로고침</button>
      </div>
      {error && <p className="msg bad">{error}</p>}
      {!items.length && <p className="msg">아직 후기가 없습니다.</p>}
      {[...pending, ...approved].map((r) => (
        <div className="pg-card" key={r.id}>
          <div className="pg-row" style={{ justifyContent: 'space-between' }}>
            <div><Stars n={Number(r.rating) || 0} /> <b style={{ marginLeft: 8 }}>{r.nick}</b>
              <div className="mute">{r.tierBefore && r.tierAfter ? `티어 ${r.tierBefore} → ${r.tierAfter} · ` : ''}{fmtDate(r.createdAt)}</div></div>
            <span className={'badge ' + (r.approved ? 's2' : 's0')}>{r.approved ? '공개 중' : '승인 대기'}</span>
          </div>
          <p style={{ margin: '12px 0', lineHeight: 1.7, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{r.text}</p>
          <div className="pg-row">
            <button className={'btn sm ' + (r.approved ? '' : 'pri')} onClick={() => toggle(r)}>{r.approved ? '비공개로 전환' : '공개(승인)'}</button>
            <button className="btn danger sm" onClick={() => remove(r)}>삭제</button>
          </div>
        </div>
      ))}
    </>
  )
}

// ---------------- FAQ ----------------
function Faqs() {
  const [items, setItems, reload, error] = useList('faqs')
  const [draft, setDraft] = useState({ q: '', a: '' })
  const [busy, setBusy] = useState(false)
  if (!items) return <p className="msg">불러오는 중...</p>

  const needAnswer = items.filter((f) => !f.published && !f.a).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  const others = items.filter((f) => !(!f.published && !f.a)).sort((a, b) => faqScore(b) - faqScore(a) || (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))

  async function seed() {
    if (!window.confirm('기본 FAQ 8개를 불러올까요? (이미 있는 FAQ는 그대로 둡니다)')) return
    setBusy(true)
    try { for (const [q, a] of SEED_FAQ) await addDoc(collection(db, 'faqs'), { q, a, views: 0, votes: 0, published: true, source: 'admin', createdAt: serverTimestamp() }) }
    catch (e) { alert('불러오지 못했습니다. (' + (e.code || e.message) + ')') }
    setBusy(false); reload()
  }
  async function add() {
    const q = draft.q.trim(), a = draft.a.trim()
    if (q.length < 5 || !a) return alert('질문(5자 이상)과 답변을 모두 적어 주세요.')
    setBusy(true)
    try { await addDoc(collection(db, 'faqs'), { q, a, views: 0, votes: 0, published: true, source: 'admin', createdAt: serverTimestamp() }); setDraft({ q: '', a: '' }) }
    catch (e) { alert('추가하지 못했습니다. (' + (e.code || e.message) + ')') }
    setBusy(false); reload()
  }

  return (
    <>
      <p className="pg-sub">점수 = 조회수 + 도움이 됐어요 × 3 입니다. 점수가 높은 순서로 정렬되고, 상위 10개가 사이트 FAQ 첫 화면에, 나머지(최대 100개)는 "질문 더 보기"에 자동으로 올라갑니다. 방문자가 남긴 질문은 답변을 적고 게시하면 FAQ에 올라갑니다.</p>
      <div className="stat"><span>전체<b>{items.length}</b></span><span>답변 필요<b>{needAnswer.length}</b></span><span>게시 중<b>{items.filter((f) => f.published).length}</b></span>
        <button className="btn sm" onClick={reload}>새로고침</button>
        {!items.length && <button className="btn sm pri" onClick={seed} disabled={busy}>기본 FAQ 8개 불러오기</button>}</div>
      {error && <p className="msg bad">{error}</p>}

      <div className="pg-card">
        <h2>FAQ 직접 추가</h2>
        <label htmlFor="nq">질문</label><input id="nq" value={draft.q} maxLength={200} onChange={(e) => setDraft({ ...draft, q: e.target.value })} />
        <label htmlFor="na" style={{ marginTop: 12 }}>답변</label><textarea id="na" value={draft.a} onChange={(e) => setDraft({ ...draft, a: e.target.value })} />
        <div style={{ marginTop: 12 }}><button className="btn pri" onClick={add} disabled={busy}>추가하고 게시</button></div>
      </div>

      {needAnswer.length > 0 && <h2>답변이 필요한 방문자 질문</h2>}
      {needAnswer.map((f) => <FaqRow key={f.id} f={f} items={items} setItems={setItems} highlight />)}
      {others.length > 0 && <h2 style={{ marginTop: 22 }}>FAQ 목록 (점수 순)</h2>}
      {others.map((f) => <FaqRow key={f.id} f={f} items={items} setItems={setItems} />)}
    </>
  )
}

function FaqRow({ f, items, setItems, highlight }) {
  const [q, setQ] = useState(f.q || '')
  const [a, setA] = useState(f.a || '')
  const [pub, setPub] = useState(!!f.published)
  const [saved, setSaved] = useState('')

  async function save() {
    const nq = q.trim(), na = a.trim()
    if (nq.length < 5) return alert('질문은 5자 이상이어야 합니다.')
    if (pub && !na) return alert('게시하려면 답변을 적어 주세요.')
    try {
      await updateDoc(doc(db, 'faqs', f.id), { q: nq, a: na, published: pub })
      setItems(items.map((x) => (x.id === f.id ? { ...x, q: nq, a: na, published: pub } : x)))
      setSaved('저장했습니다.')
    } catch (e) { alert('저장하지 못했습니다. (' + (e.code || e.message) + ')') }
  }
  async function remove() {
    if (!window.confirm('이 질문을 삭제할까요?')) return
    try { await deleteDoc(doc(db, 'faqs', f.id)); setItems(items.filter((x) => x.id !== f.id)) }
    catch (e) { alert('삭제하지 못했습니다. (' + (e.code || e.message) + ')') }
  }

  return (
    <div className="pg-card" style={highlight ? { borderColor: '#f0b45a' } : null}>
      <div className="pg-row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="mute">{f.source === 'user' ? '방문자 질문' : '관리자 작성'} · {fmtDate(f.createdAt)}</span>
        <span className="mute">조회 <b style={{ color: '#dfe7e0' }}>{f.views || 0}</b> · 도움이 됐어요 <b style={{ color: '#dfe7e0' }}>{f.votes || 0}</b> · 점수 <b style={{ color: '#f0b45a' }}>{faqScore(f)}</b></span>
      </div>
      <Fragment>
        <label>질문</label><input value={q} maxLength={200} onChange={(e) => { setQ(e.target.value); setSaved('') }} />
        <label style={{ marginTop: 10 }}>답변</label><textarea value={a} onChange={(e) => { setA(e.target.value); setSaved('') }} />
      </Fragment>
      <div className="pg-row" style={{ marginTop: 12 }}>
        <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><input type="checkbox" checked={pub} onChange={(e) => { setPub(e.target.checked); setSaved('') }} /> 사이트에 게시</label>
        <button className="btn pri sm" onClick={save}>저장</button>
        <button className="btn danger sm" onClick={remove}>삭제</button>
        {saved && <span className="msg ok" style={{ margin: 0 }}>{saved}</span>}
      </div>
    </div>
  )
}
