import assert from 'node:assert/strict'
import { createHandler, buildMessage } from '../api/notify.js'

const HOOK = 'https://discord.com/api/webhooks/123456/abc-DEF_ghi'
const NOW = 1_800_000_000_000
const ts = (ms) => ({ toMillis: () => ms })

function fakeDb(docs) {
  const logs = new Map()
  return {
    logs,
    collection(name) {
      return {
        where(_f, _op, since) {
          return { count: () => ({ get: async () => ({ data: () => ({ count: [...logs.values()].filter((l) => l.at >= since).length }) }) }) }
        },
        doc(id) {
          return {
            async get() { const v = (docs[name] || {})[id]; return { exists: !!v, data: () => v } },
            async create(o) { if (logs.has(id)) { const e = new Error('exists'); e.code = 6; throw e } logs.set(id, o) },
            async delete() { logs.delete(id) },
          }
        },
      }
    },
  }
}
function run({ docs, body, method = 'POST', origin, fetchResult, env = {}, preLogs = [] }) {
  const sent = []
  const db = fakeDb(docs)
  preLogs.forEach((l, i) => db.logs.set('pre' + i, l))
  const handler = createHandler({
    getDb: async () => db,
    fetchFn: async (url, opt) => { sent.push({ url, body: JSON.parse(opt.body) }); return fetchResult ?? { ok: true } },
    env: { DISCORD_WEBHOOK_URL: HOOK, ...env }, now: () => NOW,
  })
  const res = { code: 0, json: null, status(c) { this.code = c; return this }, json(b) { this.json = b; return this } }
  return handler({ method, body, headers: origin ? { origin } : {} }, res).then(() => ({ res, sent, db }))
}
const app = { nick: '닉`네임*', tier: '골드', agent: '제트', discord: 'secret_id', problem: '비밀 고민', want: '비밀 요청', createdAt: ts(NOW - 1000) }
const docs = () => ({
  applications: { A1: { ...app } },
  reviews: { R1: { nick: '후기러', rating: 4, text: 'x'.repeat(20), tierBefore: '골드 1', tierAfter: '플래티넘 2', approved: false, createdAt: ts(NOW - 1000) } },
  faqs: { F1: { q: '질문 @everyone 입니다\n둘째줄', a: '', source: 'user', published: false, createdAt: ts(NOW - 1000) },
          F2: { q: '관리자 FAQ', a: 'a', source: 'admin', createdAt: ts(NOW - 1000) } },
})
let n = 0
const ok = (name) => console.log('ok', ++n, name)

// 1 정상: 신청
let r = await run({ docs: docs(), body: { kind: 'application', id: 'A1' } })
assert.equal(r.res.code, 200); assert.equal(r.sent.length, 1)
const msg = r.sent[0].body.content
assert.ok(msg.includes('골드') && msg.includes('제트') && msg.includes('A1'))
assert.ok(!msg.includes('secret_id') && !msg.includes('비밀'), '개인정보 미포함')
assert.ok(msg.includes('닉네임 닉네임 ·'), '닉네임의 서식 문자 제거')
assert.deepEqual(r.sent[0].body.allowed_mentions, { parse: [] }); ok('신청 알림, 개인정보 제외, 멘션 차단')

// 2 후기 / FAQ 질문
r = await run({ docs: docs(), body: { kind: 'review', id: 'R1' } }); assert.ok(r.sent[0].body.content.includes('★★★★☆')); ok('후기 알림')
r = await run({ docs: docs(), body: { kind: 'faq', id: 'F1' } }); assert.ok(!r.sent[0].body.content.includes('@') && !r.sent[0].body.content.includes('\n질문 @')); ok('FAQ 질문 알림, @ 제거')

// 3 같은 문서 중복 요청은 한 번만
{
  const db = fakeDb(docs()); const sent = []
  const h = createHandler({ getDb: async () => db, fetchFn: async (u, o) => { sent.push(1); return { ok: true } }, env: { DISCORD_WEBHOOK_URL: HOOK }, now: () => NOW })
  const mk = () => ({ code: 0, status(c) { this.code = c; return this }, json(b) { this.body = b; return this } })
  const a = mk(), b = mk()
  await Promise.all([h({ method: 'POST', body: { kind: 'application', id: 'A1' }, headers: {} }, a), h({ method: 'POST', body: { kind: 'application', id: 'A1' }, headers: {} }, b)])
  assert.equal(sent.length, 1); assert.ok([a.body.skipped, b.body.skipped].includes('duplicate')); ok('동시 중복 요청도 알림 1번')
}
// 4 없는 문서 / 오래된 문서 / 관리자 FAQ
r = await run({ docs: docs(), body: { kind: 'application', id: 'NOPE' } }); assert.equal(r.res.code, 404); assert.equal(r.sent.length, 0); ok('없는 문서는 알림 없음')
{ const d = docs(); d.applications.A1.createdAt = ts(NOW - 16 * 60 * 1000)
  r = await run({ docs: d, body: { kind: 'application', id: 'A1' } }); assert.equal(r.sent.length, 0); assert.equal(r.res.json.skipped, 'old'); ok('15분 지난 문서는 알림 없음') }
r = await run({ docs: docs(), body: { kind: 'faq', id: 'F2' } }); assert.equal(r.sent.length, 0); ok('관리자가 만든 FAQ는 알림 없음')
// 5 잘못된 입력
for (const body of [{ kind: 'x', id: 'A1' }, { kind: 'application', id: '../a' }, { kind: 'application' }, { kind: '__proto__', id: 'A1' }, null, 'not json', { kind: 'application', id: 'a'.repeat(41) }]) {
  r = await run({ docs: docs(), body }); assert.equal(r.res.code, 400, JSON.stringify(body)); assert.equal(r.sent.length, 0)
}
ok('잘못된 요청 7종 거절')
// 6 메서드·출처·설정
r = await run({ docs: docs(), body: {}, method: 'GET' }); assert.equal(r.res.code, 405); ok('GET 거절')
r = await run({ docs: docs(), body: { kind: 'application', id: 'A1' }, origin: 'https://evil.example' }); assert.equal(r.res.code, 403); ok('다른 출처 거절')
r = await run({ docs: docs(), body: { kind: 'application', id: 'A1' }, origin: 'https://woojin-valorant-coaching.vercel.app' }); assert.equal(r.res.code, 200); ok('우리 사이트 출처 허용')
r = await run({ docs: docs(), body: { kind: 'application', id: 'A1' }, origin: 'http://localhost:5173' }); assert.equal(r.res.code, 200); ok('localhost 허용')
r = await run({ docs: docs(), body: { kind: 'application', id: 'A1' }, env: { DISCORD_WEBHOOK_URL: 'https://evil.example/hook' } }); assert.equal(r.res.code, 500); assert.equal(r.sent.length, 0); ok('디스코드 주소가 아니면 전송 안 함')
// 7 디스코드 실패 시 기록을 지워 재시도 가능
r = await run({ docs: docs(), body: { kind: 'application', id: 'A1' }, fetchResult: { ok: false } }); assert.equal(r.res.code, 502); assert.equal(r.db.logs.size, 0); ok('전송 실패 시 502, 재시도 가능')
// 8 메시지 길이
assert.ok(buildMessage('faq', { q: 'q'.repeat(500) }, 'F', 'https://s').length < 400); ok('긴 글 자르기')
// 9 알림 상한
{
  const pre = Array.from({ length: 30 }, () => ({ at: NOW - 1000 }))
  r = await run({ docs: docs(), body: { kind: 'application', id: 'A1' }, preLogs: pre })
  assert.equal(r.res.json.skipped, 'rate-limit'); assert.equal(r.sent.length, 0); assert.ok(!r.db.logs.has('A1'), '상한 초과분은 기록하지 않음'); ok('1시간 30건 넘으면 알림 중단')
  const pre29 = Array.from({ length: 29 }, () => ({ at: NOW - 1000 }))
  r = await run({ docs: docs(), body: { kind: 'application', id: 'A1' }, preLogs: pre29 }); assert.equal(r.sent.length, 1); ok('29건까지는 정상 알림')
  const old = Array.from({ length: 50 }, () => ({ at: NOW - 2 * 60 * 60 * 1000 }))
  r = await run({ docs: docs(), body: { kind: 'application', id: 'A1' }, preLogs: old }); assert.equal(r.sent.length, 1); ok('1시간 지난 기록은 세지 않음')
  r = await run({ docs: docs(), body: { kind: 'application', id: 'A1' }, preLogs: pre29.slice(0, 5), env: { ALERT_LIMIT_PER_HOUR: '5' } }); assert.equal(r.res.json.skipped, 'rate-limit'); ok('환경변수로 상한 조절')
}
console.log('ALL', n, 'PASSED')
