// 신청·후기·FAQ 질문이 저장되면 디스코드로 알림을 보내는 Vercel 서버 함수 (POST /api/notify)
// - 웹훅 주소와 서비스 계정 키는 Vercel 환경변수에만 있고, 브라우저로는 나가지 않는다.
// - 브라우저가 보낸 건 종류(kind)와 문서 번호(id)뿐이다. 서버가 Firestore에서 그 문서를 읽어 진짜 있는지 확인하고,
//   알림 내용은 문서에서 직접 만든다. (그래서 가짜 내용을 알림으로 보낼 수 없다)
// - 문서마다 알림은 한 번만 간다. (notifications 컬렉션에 기록, 규칙상 일반 사용자는 접근 불가)
// - 알림에는 디스코드 ID·고민 내용 같은 개인정보를 담지 않는다.

const COLLECTIONS = { application: 'applications', review: 'reviews', faq: 'faqs' }
const ID_RE = /^[A-Za-z0-9]{1,40}$/
const MAX_AGE_MS = 15 * 60 * 1000 // 저장된 지 15분 안의 문서만 알림
const DEFAULT_LIMIT = 30 // 1시간에 보낼 수 있는 알림 수 (환경변수 ALERT_LIMIT_PER_HOUR 로 바꿀 수 있음)
const HOUR_MS = 60 * 60 * 1000
const WEBHOOK_RE = /^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[\w-]+$/

// 디스코드에 그대로 나가는 글자라서 줄바꿈·서식·멘션을 정리하고 길이를 자른다
function t(v, max) {
  const s = String(v ?? '').replace(/[\r\n\t]+/g, ' ').replace(/[`*_~|>@\\]/g, '').trim()
  return s.length > max ? s.slice(0, max) + '…' : s
}

export function buildMessage(kind, d, id, site) {
  const admin = `${site}/admin`
  if (kind === 'application') {
    return `📩 **새 코칭 신청**\n닉네임 ${t(d.nick, 30)} · 티어 ${t(d.tier, 12)} · 요원 ${t(d.agent, 30)}\n신청 번호 \`${id}\`\n${admin}`
  }
  if (kind === 'review') {
    const r = Number(d.rating)
    const stars = Number.isInteger(r) && r >= 1 && r <= 5 ? `${'★'.repeat(r)}${'☆'.repeat(5 - r)}` : ''
    return `⭐ **새 후기 (승인 대기)**\n${t(d.nick, 20)} · ${stars} · ${t(d.tierBefore, 12)} → ${t(d.tierAfter, 12)}\n승인은 ${admin} 에서 합니다`
  }
  return `❓ **새 FAQ 질문**\n${t(d.q, 200)}\n답변을 쓰고 게시하려면 ${admin}`
}

export function createHandler(deps) {
  const { getDb, fetchFn, env, now = () => Date.now() } = deps
  const send = (res, code, body) => res.status(code).json(body)

  return async function handler(req, res) {
    if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method' })

    const hook = env.DISCORD_WEBHOOK_URL
    const site = (env.SITE_URL || 'https://woojin-valorant-coaching.vercel.app').replace(/\/$/, '')
    if (!hook || !WEBHOOK_RE.test(hook)) return send(res, 500, { ok: false, error: 'webhook-config' })

    // 우리 사이트(또는 로컬 개발)에서 온 요청만 받는다. 보안 장치라기보다 쓸데없는 호출을 줄이는 용도.
    const origin = req.headers?.origin
    if (origin && origin !== site && !/^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return send(res, 403, { ok: false, error: 'origin' })
    }

    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = null } }
    const kind = body && body.kind
    const id = body && body.id
    if (!Object.hasOwn(COLLECTIONS, kind) || typeof id !== 'string' || !ID_RE.test(id)) {
      return send(res, 400, { ok: false, error: 'bad-request' })
    }

    let db
    try { db = await getDb(env) } catch { return send(res, 500, { ok: false, error: 'firebase-config' }) }

    const snap = await db.collection(COLLECTIONS[kind]).doc(id).get()
    if (!snap.exists) return send(res, 404, { ok: false, error: 'not-found' })
    const d = snap.data()

    const created = d.createdAt && typeof d.createdAt.toMillis === 'function' ? d.createdAt.toMillis() : 0
    if (!created || now() - created > MAX_AGE_MS) return send(res, 200, { ok: true, skipped: 'old' })
    if (kind === 'faq' && d.source !== 'user') return send(res, 200, { ok: true, skipped: 'not-user-question' })

    // 알림 폭주 방지: 최근 1시간에 보낸 알림이 상한을 넘으면 더 보내지 않는다.
    // (신청·후기·질문 자체는 정상 저장되고 /admin 에서 모두 볼 수 있다. 알림만 멈춘다)
    const limit = Number(env.ALERT_LIMIT_PER_HOUR) > 0 ? Number(env.ALERT_LIMIT_PER_HOUR) : DEFAULT_LIMIT
    const recent = await db.collection('notifications').where('at', '>=', now() - HOUR_MS).count().get()
    if (recent.data().count >= limit) return send(res, 200, { ok: true, skipped: 'rate-limit' })

    // 같은 문서의 알림은 한 번만: 기록 문서를 만들 수 있었던 요청만 보낸다
    const log = db.collection('notifications').doc(`${kind}_${id}`)
    try {
      await log.create({ kind, id, at: now() })
    } catch (e) {
      if (e && (e.code === 6 || e.code === 'already-exists')) return send(res, 200, { ok: true, skipped: 'duplicate' })
      throw e
    }

    let resp
    try {
      resp = await fetchFn(hook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: '코칭 알림',
          content: buildMessage(kind, d, id, site),
          allowed_mentions: { parse: [] },
        }),
      })
    } catch { resp = null }

    if (!resp || !resp.ok) {
      await log.delete().catch(() => {}) // 실패하면 기록을 지워서 다시 시도할 수 있게 한다
      return send(res, 502, { ok: false, error: 'discord' })
    }
    return send(res, 200, { ok: true })
  }
}

// ---- 실제 환경: firebase-admin 으로 Firestore 에 접속 (서비스 계정 키는 환경변수 FIREBASE_SERVICE_ACCOUNT)
let cached
async function getDb(env) {
  if (cached) return cached
  const { initializeApp, cert, getApps } = await import('firebase-admin/app')
  const { getFirestore } = await import('firebase-admin/firestore')
  if (!getApps().length) {
    const key = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT)
    key.private_key = String(key.private_key).replace(/\\n/g, '\n')
    initializeApp({ credential: cert(key) })
  }
  cached = getFirestore()
  return cached
}

export default createHandler({ getDb, fetchFn: (...a) => fetch(...a), env: process.env })
