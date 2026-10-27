import { useEffect } from 'react'
import { collection, addDoc, getDocs, query, where, limit, serverTimestamp } from 'firebase/firestore'
import { db, configured } from '../firebase.js'

// / 와 /kage → 밤의 사원 버전(kage-haven.html), ?style=tactical → 전술 맵 버전, /kage?original=1 → ThreeUI 원본(kage.html, 무수정)
// 신청 폼은 iframe 안에 있고, 제출하면 postMessage로 이 컴포넌트에 전달된다.
// 저장(Firestore)은 React 쪽에서만 처리한다.
const KEYS = ['nick', 'tier', 'agent', 'discord', 'problem', 'want']
const TIERS = ['아이언', '브론즈', '실버', '골드', '플래티넘', '다이아몬드', '초월자', '불멸', '레디언트']

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

// 후기용 세부 티어: 레디언트를 뺀 모든 티어는 1~3 등급이 있다.
const REVIEW_TIERS = [...TIERS.filter((t) => t !== '레디언트').flatMap((t) => [1, 2, 3].map((n) => t + ' ' + n)), '레디언트']

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
      if (d && d.type === 'woojin-reviews-get' && typeof d.id === 'string') {
        const send = (items) =>
          e.source && e.source.postMessage({ type: 'woojin-reviews-result', id: d.id, items }, window.location.origin)
        if (!configured) return send([])
        try {
          const snap = await getDocs(query(collection(db, 'reviews'), where('approved', '==', true), limit(30)))
          const items = snap.docs
            .map((x) => x.data())
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
            .map((x) => ({ nick: String(x.nick), rating: Number(x.rating), text: String(x.text), tierBefore: REVIEW_TIERS.includes(x.tierBefore) ? x.tierBefore : '', tierAfter: REVIEW_TIERS.includes(x.tierAfter) ? x.tierAfter : '' }))
          send(items)
        } catch (err) {
          send([])
        }
        return
      }
      if (d && d.type === 'woojin-review' && typeof d.id === 'string') {
        const reply = (ok, message) =>
          e.source && e.source.postMessage({ type: 'woojin-review-result', id: d.id, ok, message }, window.location.origin)
        const data = cleanReview(d.payload)
        if (!data) return reply(false, '입력 내용을 다시 확인해 주세요.')
        if (!configured) return reply(false, 'Firebase 설정(.env)이 없어 저장할 수 없습니다.')
        try {
          await addDoc(collection(db, 'reviews'), { ...data, approved: false, createdAt: serverTimestamp() })
          reply(true)
        } catch (err) {
          reply(false, '저장 실패: ' + (err.code || err.message))
        }
        return
      }
      if (!d || d.type !== 'woojin-apply' || typeof d.id !== 'string') return
      const reply = (ok, message) =>
        e.source && e.source.postMessage({ type: 'woojin-apply-result', id: d.id, ok, message }, window.location.origin)

      const data = clean(d.payload)
      if (!data) return reply(false, '입력 내용을 다시 확인해 주세요.')
      if (!configured) return reply(false, 'Firebase 설정(.env)이 없어 저장할 수 없습니다.')
      try {
        await addDoc(collection(db, 'applications'), { ...data, createdAt: serverTimestamp() })
        reply(true)
      } catch (err) {
        reply(false, '저장 실패: ' + (err.code || err.message))
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
