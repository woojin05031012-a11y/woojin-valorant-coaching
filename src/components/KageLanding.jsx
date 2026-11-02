import { useEffect } from 'react'
import { collection, addDoc, getDocs, query, where, limit, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import { db, configured } from '../firebase.js'
import { faqScore } from '../faq.js'

// / 와 /kage → 밤의 사원 버전(kage-haven.html), ?style=tactical → 전술 맵 버전, /kage?original=1 → ThreeUI 원본(kage.html, 무수정)
// 신청 폼·후기 폼·FAQ는 iframe 안에 있고, postMessage로 이 컴포넌트에 요청을 보낸다.
// 저장·조회(Firestore)는 React 쪽에서만 처리한다.
const KEYS = ['nick', 'tier', 'agent', 'discord', 'problem', 'want']
const TIERS = ['아이언', '브론즈', '실버', '골드', '플래티넘', '다이아몬드', '초월자', '불멸', '레디언트']
// 후기용 세부 티어: 레디언트를 뺀 모든 티어는 1~3 등급이 있다.
const REVIEW_TIERS = [...TIERS.filter((t) => t !== '레디언트').flatMap((t) => [1, 2, 3].map((n) => t + ' ' + n)), '레디언트']
const ID_RE = /^[A-Za-z0-9]{1,40}$/

function clean(payload) {
  if (!payload || typeof payload !== 'object') return null
  const out = {}
  for (const k of KEYS) {
    const v = typeof payload[k] === 'string' ? payload[k].trim() : ''
    if (!v || v.length > 1000) return null
    out[k] = v
  }
  if (!TIERS.includes(out.tier)) return null
  if (out.discord.length < 2 || out.discord.length > 32 || /\s/.test(out.discord)) return null
  return out
}

// 후기: 승인된(approved == true) 것만 읽고, 새 후기는 approved: false 로만 저장한다.
function cleanReview(payload) {
  if (!payload || typeof payload !== 'object') return null
  const nick = typeof payload.nick === 'string' ? payload.nick.trim() : ''
  const text = typeof payload.text === 'string' ? payload.text.trim() : ''
  const rating = payload.rating
  const { tierBefore, tierAfter } = payload
  if (!REVIEW_TIERS.includes(tierBefore) || !REVIEW_TIERS.includes(tierAfter)) return null
  if (!nick || nick.length > 20) return null
  if (text.length < 10 || text.length > 300) return null
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return null
  return { nick, rating, text, tierBefore, tierAfter }
}

export default function KageLanding() {
  const q = new URLSearchParams(window.location.search)
  const src = q.get('original') === '1' ? '/landing-pages/kage.html'
    : q.get('style') === 'tactical' ? '/landing-pages/kage-valorant.html'
    : '/landing-pages/kage-haven.html'

  useEffect(() => {
    async function onMessage(e) {
      if (e.origin !== window.location.origin) return
      const d = e.data
      if (!d || typeof d.type !== 'string' || typeof d.id !== 'string') return
      const send = (msg) => e.source && e.source.postMessage({ ...msg, id: d.id }, window.location.origin)

      // ---- 신청 저장
      if (d.type === 'woojin-apply') {
        const data = clean(d.payload)
        if (!data) return send({ type: 'woojin-apply-result', ok: false, message: '입력 내용을 다시 확인해 주세요.' })
        if (!configured) return send({ type: 'woojin-apply-result', ok: false, message: 'Firebase 설정(.env)이 없어 저장할 수 없습니다.' })
        try {
          const ref = await addDoc(collection(db, 'applications'), {
            ...data, status: '접수', createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
          })
          send({ type: 'woojin-apply-result', ok: true, ref: ref.id })
        } catch (err) {
          send({ type: 'woojin-apply-result', ok: false, message: '저장 실패: ' + (err.code || err.message) })
        }
        return
      }

      // ---- 후기 목록(승인된 것만) / 후기 저장
      if (d.type === 'woojin-reviews-get') {
        if (!configured) return send({ type: 'woojin-reviews-result', items: [] })
        try {
          const snap = await getDocs(query(collection(db, 'reviews'), where('approved', '==', true), limit(30)))
          const items = snap.docs
            .map((x) => x.data())
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
            .map((x) => ({
              nick: String(x.nick), rating: Number(x.rating), text: String(x.text),
              tierBefore: REVIEW_TIERS.includes(x.tierBefore) ? x.tierBefore : '',
              tierAfter: REVIEW_TIERS.includes(x.tierAfter) ? x.tierAfter : '',
            }))
          send({ type: 'woojin-reviews-result', items })
        } catch (err) {
          send({ type: 'woojin-reviews-result', items: [] })
        }
        return
      }
      if (d.type === 'woojin-review') {
        const data = cleanReview(d.payload)
        if (!data) return send({ type: 'woojin-review-result', ok: false, message: '입력 내용을 다시 확인해 주세요.' })
        if (!configured) return send({ type: 'woojin-review-result', ok: false, message: 'Firebase 설정(.env)이 없어 저장할 수 없습니다.' })
        try {
          await addDoc(collection(db, 'reviews'), { ...data, approved: false, createdAt: serverTimestamp() })
          send({ type: 'woojin-review-result', ok: true })
        } catch (err) {
          send({ type: 'woojin-review-result', ok: false, message: '저장 실패: ' + (err.code || err.message) })
        }
        return
      }

      // ---- FAQ: 게시된 것을 읽어 통계 순으로 정렬해 돌려준다 (최대 100개)
      if (d.type === 'woojin-faqs-get') {
        if (!configured) return send({ type: 'woojin-faqs-result', items: [] })
        try {
          const snap = await getDocs(query(collection(db, 'faqs'), where('published', '==', true), limit(100)))
          const items = snap.docs
            .map((x) => ({ id: x.id, ...x.data() }))
            .filter((x) => typeof x.q === 'string' && typeof x.a === 'string' && x.a)
            .sort((a, b) => faqScore(b) - faqScore(a) || (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
            .map((x) => ({ id: x.id, q: x.q, a: x.a, views: Number(x.views) || 0, votes: Number(x.votes) || 0 }))
          send({ type: 'woojin-faqs-result', items })
        } catch (err) {
          send({ type: 'woojin-faqs-result', items: [] })
        }
        return
      }
      // FAQ 통계: 열어 봄(views) / 도움이 됐어요(votes) 를 1씩 올린다
      if (d.type === 'woojin-faq-view' || d.type === 'woojin-faq-vote') {
        const fid = d.faq
        if (!configured || typeof fid !== 'string' || !ID_RE.test(fid)) return
        const field = d.type === 'woojin-faq-view' ? 'views' : 'votes'
        try {
          await updateDoc(doc(db, 'faqs', fid), { [field]: increment(1) })
        } catch (err) { /* 통계 실패는 화면에 영향 없음 */ }
        return
      }
      // 방문자 질문 접수: 게시 전 상태로 저장되고, 관리자가 답변을 적어 게시한다
      if (d.type === 'woojin-faq-ask') {
        const text = typeof d.payload?.q === 'string' ? d.payload.q.trim() : ''
        if (text.length < 5 || text.length > 200) return send({ type: 'woojin-faq-ask-result', ok: false, message: '질문은 5~200자로 적어 주세요.' })
        if (!configured) return send({ type: 'woojin-faq-ask-result', ok: false, message: 'Firebase 설정(.env)이 없어 저장할 수 없습니다.' })
        try {
          await addDoc(collection(db, 'faqs'), {
            q: text, a: '', views: 0, votes: 0, published: false, source: 'user', createdAt: serverTimestamp(),
          })
          send({ type: 'woojin-faq-ask-result', ok: true })
        } catch (err) {
          send({ type: 'woojin-faq-ask-result', ok: false, message: '저장 실패: ' + (err.code || err.message) })
        }
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#05070a' }}>
      <iframe
        title="Woojin VALORANT Coaching"
        src={src}
        style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
        allow="fullscreen"
      />
    </div>
  )
}
