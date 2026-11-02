import { Fragment, useEffect, useState } from 'react'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, configured } from '../firebase.js'
import { pageCss, fmtDate, statusClass } from './pageStyle.js'

// /check : 신청 번호로 내 신청 내용을 확인하고, 아직 '접수' 상태일 때는 수정하거나 취소할 수 있다.
// 로그인이 없으므로 신청 번호(문서 ID, 추측할 수 없는 긴 문자열)가 열쇠 역할을 한다.
const TIERS = ['아이언', '브론즈', '실버', '골드', '플래티넘', '다이아몬드', '초월자', '불멸', '레디언트']
const FIELDS = [
  ['nick', '발로란트 닉네임', '닉네임을 입력해 주세요.'],
  ['tier', '현재 티어', '티어를 선택해 주세요.'],
  ['agent', '주 요원 또는 포지션', '주 요원이나 포지션을 입력해 주세요.'],
  ['discord', 'Discord ID', 'Discord ID를 입력해 주세요.'],
  ['problem', '현재 고민하고 있는 부분', '고민하는 부분을 적어 주세요.'],
  ['want', '가장 피드백받고 싶은 내용', '피드백받고 싶은 내용을 적어 주세요.'],
]
const CODE_RE = /^[A-Za-z0-9]{10,40}$/

export default function CheckPage() {
  const [code, setCode] = useState(new URLSearchParams(window.location.search).get('code') || '')
  const [app, setApp] = useState(null)
  const [vals, setVals] = useState({})
  const [errs, setErrs] = useState({})
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  async function load(c = code) {
    const id = c.trim()
    setApp(null); setMsg(null)
    if (!CODE_RE.test(id)) return setMsg({ bad: true, t: '신청 번호를 정확히 입력해 주세요. (영문과 숫자로 된 긴 번호입니다)' })
    if (!configured) return setMsg({ bad: true, t: 'Firebase 설정(.env)이 없어 조회할 수 없습니다.' })
    setBusy(true)
    try {
      const snap = await getDoc(doc(db, 'applications', id))
      if (!snap.exists()) setMsg({ bad: true, t: '해당 번호의 신청을 찾을 수 없습니다. 번호를 다시 확인해 주세요.' })
      else { const data = snap.data(); setApp({ id, ...data }); setVals(Object.fromEntries(FIELDS.map(([k]) => [k, data[k] || '']))) }
    } catch (e) {
      setMsg({ bad: true, t: '조회에 실패했습니다. 번호를 다시 확인해 주세요. (' + (e.code || e.message) + ')' })
    }
    setBusy(false)
  }
  useEffect(() => { if (code) load(code) /* eslint-disable-next-line */ }, [])

  const editable = app && app.status === '접수'

  async function save(ev) {
    ev.preventDefault()
    const er = {}
    FIELDS.forEach(([k, , m]) => {
      const v = (vals[k] || '').trim()
      if (!v) er[k] = m
      else if (k === 'discord' && (v.length < 2 || v.length > 32 || /\s/.test(v))) er[k] = '공백 없이 2~32자로 입력해 주세요.'
      else if (v.length > 1000) er[k] = '1000자 이내로 입력해 주세요.'
    })
    setErrs(er)
    if (Object.keys(er).length) return
    setBusy(true); setMsg(null)
    try {
      const upd = Object.fromEntries(FIELDS.map(([k]) => [k, vals[k].trim()]))
      await updateDoc(doc(db, 'applications', app.id), { ...upd, updatedAt: serverTimestamp() })
      setMsg({ ok: true, t: '신청 내용을 수정했습니다.' })
      await load(app.id)
      setMsg({ ok: true, t: '신청 내용을 수정했습니다.' })
    } catch (e) {
      setMsg({ bad: true, t: '수정하지 못했습니다. 이미 확인 중인 신청은 수정할 수 없습니다. (' + (e.code || e.message) + ')' })
    }
    setBusy(false)
  }

  async function cancel() {
    if (!window.confirm('신청을 취소할까요? 취소하면 다시 되돌릴 수 없습니다.')) return
    setBusy(true); setMsg(null)
    try {
      await updateDoc(doc(db, 'applications', app.id), { status: '취소', updatedAt: serverTimestamp() })
      await load(app.id)
      setMsg({ ok: true, t: '신청을 취소했습니다.' })
    } catch (e) {
      setMsg({ bad: true, t: '취소하지 못했습니다. (' + (e.code || e.message) + ')' })
    }
    setBusy(false)
  }

  return (
    <div className="pg">
      <style>{pageCss}</style>
      <div className="pg-in">
        <p className="mute"><a href="/">← 코칭 사이트로 돌아가기</a></p>
        <h1>신청 확인·수정</h1>
        <p className="pg-sub">신청할 때 받은 신청 번호를 입력하면 내용과 진행 상태를 볼 수 있습니다. 상태가 <b>접수</b>일 때는 직접 수정하거나 취소할 수 있고, 확인이 시작된 뒤에는 Discord로 말씀해 주세요.</p>

        <form className="pg-card" onSubmit={(e) => { e.preventDefault(); load() }}>
          <label htmlFor="code">신청 번호</label>
          <div className="pg-row">
            <input id="code" style={{ flex: 1, minWidth: 220 }} value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" placeholder="신청 완료 화면에 나온 번호" />
            <button className="btn pri" type="submit" disabled={busy}>조회</button>
          </div>
        </form>

        {msg && <p className={'msg ' + (msg.ok ? 'ok' : msg.bad ? 'bad' : '')} role="status">{msg.t}</p>}

        {app && (
          <div className="pg-card">
            <div className="pg-row" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0 }}>내 신청</h2>
              <span className={'badge ' + statusClass(app.status)}>{app.status}</span>
            </div>
            <p className="mute" style={{ margin: '8px 0 0' }}>접수 {fmtDate(app.createdAt)}{app.updatedAt && app.updatedAt.seconds !== app.createdAt?.seconds ? ' · 수정 ' + fmtDate(app.updatedAt) : ''}</p>

            {editable ? (
              <form onSubmit={save} noValidate style={{ marginTop: 16 }}>
                <div className="pg-grid">
                  {FIELDS.map(([k, label]) => (
                    <div key={k} className={k === 'problem' || k === 'want' ? 'full' : ''}>
                      <label htmlFor={'f-' + k}>{label}</label>
                      {k === 'tier' ? (
                        <select id={'f-' + k} value={vals[k]} onChange={(e) => setVals({ ...vals, [k]: e.target.value })}>
                          <option value="">선택</option>
                          {TIERS.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      ) : k === 'problem' || k === 'want' ? (
                        <textarea id={'f-' + k} value={vals[k]} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} />
                      ) : (
                        <input id={'f-' + k} value={vals[k]} autoComplete="off" onChange={(e) => setVals({ ...vals, [k]: e.target.value })} />
                      )}
                      {errs[k] && <p className="msg bad" style={{ margin: '6px 0 0', fontSize: 13 }}>{errs[k]}</p>}
                    </div>
                  ))}
                </div>
                <div className="pg-row" style={{ marginTop: 18 }}>
                  <button className="btn pri" type="submit" disabled={busy}>수정 저장</button>
                  <button className="btn danger" type="button" onClick={cancel} disabled={busy}>신청 취소</button>
                </div>
              </form>
            ) : (
              <>
                <dl className="kv">
                  {FIELDS.map(([k, label]) => (<Fragment key={k}><dt>{label}</dt><dd>{app[k]}</dd></Fragment>))}
                </dl>
                <p className="msg">{app.status === '취소' ? '취소된 신청입니다.' : '이미 확인이 시작되어 여기서는 수정할 수 없습니다. 바꾸고 싶은 내용은 Discord로 말씀해 주세요.'}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
