import { useState } from 'react'

const TIERS = ['아이언', '브론즈', '실버', '골드', '플래티넘', '다이아몬드', '초월자', '불멸', '레디언트']
const FIELDS = [
  { id: 'nick', label: '발로란트 닉네임', msg: '닉네임을 입력해 주세요.' },
  { id: 'tier', label: '현재 티어', type: 'select', msg: '티어를 선택해 주세요.' },
  { id: 'agent', label: '주 요원 또는 포지션', msg: '주 요원이나 포지션을 입력해 주세요.' },
  { id: 'discord', label: 'Discord ID', msg: 'Discord ID를 입력해 주세요.' },
  { id: 'problem', label: '현재 고민하고 있는 부분', type: 'area', full: true, msg: '고민하는 부분을 적어 주세요.' },
  { id: 'want', label: '가장 피드백받고 싶은 내용', type: 'area', full: true, msg: '피드백받고 싶은 내용을 적어 주세요.' },
]

export default function ApplyForm() {
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [consent, setConsent] = useState(false)
  const [result, setResult] = useState(null)

  const set = (id) => (e) => setValues({ ...values, [id]: e.target.value })

  function submit(ev) {
    ev.preventDefault()
    const errs = {}
    FIELDS.forEach((f) => {
      const v = (values[f.id] || '').trim()
      if (!v) errs[f.id] = f.msg
      else if (f.id === 'discord' && (v.length < 2 || v.length > 32 || /\s/.test(v))) errs[f.id] = '공백 없이 2~32자로 입력해 주세요.'
    })
    if (!consent) errs.consent = '수집 안내에 동의해 주세요.'
    setErrors(errs)
    const first = Object.keys(errs)[0]
    if (first) {
      setResult(null)
      document.getElementById(first === 'consent' ? 'consent' : first).focus()
      return
    }
    // TODO(4주차): 여기서 Firebase Firestore에 저장
    setResult(values)
    setTimeout(() => document.getElementById('result')?.focus(), 0)
  }

  return (
    <form onSubmit={submit} noValidate>
      {FIELDS.map((f) => (
        <div key={f.id} className={'f' + (f.full ? ' full' : '')}>
          <label htmlFor={f.id}>{f.label}</label>
          {f.type === 'select' ? (
            <select id={f.id} value={values[f.id] || ''} onChange={set(f.id)} aria-invalid={!!errors[f.id]}>
              <option value="">선택</option>
              {TIERS.map((t) => <option key={t}>{t}</option>)}
            </select>
          ) : f.type === 'area' ? (
            <textarea id={f.id} value={values[f.id] || ''} onChange={set(f.id)} aria-invalid={!!errors[f.id]} />
          ) : (
            <input id={f.id} autoComplete="off" value={values[f.id] || ''} onChange={set(f.id)} aria-invalid={!!errors[f.id]} />
          )}
          <p className="err" aria-live="polite">{errors[f.id]}</p>
        </div>
      ))}
      <div className="f full">
        <label className="consent" htmlFor="consent">
          <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>닉네임, 티어, 고민, Discord ID는 코칭 신청 확인과 연락에만 사용합니다. 전화번호와 주소 등은 받지 않습니다.</span>
        </label>
        <p className="err" aria-live="polite">{errors.consent}</p>
      </div>
      <div className="f full"><button className="btn" type="submit">신청하기</button></div>
      {result && (
        <div className="result" id="result" tabIndex={-1}>
          <strong>입력 확인 완료 (저장은 4주차에 연결)</strong>
          <ul>{FIELDS.map((f) => <li key={f.id}>{f.label}: {result[f.id].trim()}</li>)}</ul>
        </div>
      )}
    </form>
  )
}
