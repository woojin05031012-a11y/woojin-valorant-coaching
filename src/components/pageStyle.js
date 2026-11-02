// /check, /admin 페이지 공통 스타일 (어두운 배경 + 호박색 포인트, 랜딩 페이지와 같은 분위기)
export const pageCss = `
:root{ color-scheme:dark; }
.pg{ min-height:100vh; background:#070b12; color:#dfe7e0; font-family:'Pretendard','Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',system-ui,sans-serif; word-break:keep-all; padding:clamp(20px,4vw,48px) 16px 80px; }
.pg *{ box-sizing:border-box; }
.pg-in{ width:min(960px,100%); margin:0 auto; }
.pg h1{ margin:0 0 6px; font-size:clamp(26px,4vw,38px); font-weight:700; }
.pg h2{ margin:0 0 14px; font-size:20px; font-weight:600; }
.pg-sub{ margin:0 0 24px; color:#9aa5a0; line-height:1.7; font-size:15px; }
.pg a{ color:#f0b45a; }
.pg-card{ background:rgba(255,255,255,.04); border:1px solid rgba(223,231,224,.2); border-radius:14px; padding:20px; margin-bottom:14px; }
.pg-row{ display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
.pg-grid{ display:grid; grid-template-columns:1fr 1fr; gap:14px 18px; }
.pg-grid .full{ grid-column:1 / -1; }
@media (max-width:640px){ .pg-grid{ grid-template-columns:1fr; } }
.pg label{ display:block; font-size:12.5px; letter-spacing:.03em; color:#b4bfb7; margin-bottom:6px; }
.pg input, .pg select, .pg textarea{ width:100%; font:inherit; font-size:16px; color:#dfe7e0; background:rgba(255,255,255,.05); border:1px solid rgba(223,231,224,.25); border-radius:10px; padding:11px 13px; outline:none; }
.pg textarea{ min-height:90px; resize:vertical; }
.pg select option{ color:#111; }
.pg input:focus, .pg select:focus, .pg textarea:focus{ border-color:#f0b45a; box-shadow:0 0 0 3px rgba(240,180,90,.18); }
.pg input[type=checkbox]{ width:auto; accent-color:#f0b45a; }
.btn{ font:inherit; font-size:14.5px; cursor:pointer; color:#dfe7e0; background:transparent; border:1px solid rgba(223,231,224,.35); border-radius:999px; padding:9px 18px; }
.btn:hover{ border-color:#f0b45a; }
.btn:disabled{ opacity:.5; cursor:default; }
.btn.pri{ background:#f0b45a; color:#1a1305; border-color:#f0b45a; font-weight:600; }
.btn.danger{ color:#ff8a94; border-color:rgba(255,107,120,.5); }
.btn.sm{ padding:6px 13px; font-size:13px; }
.msg{ margin:12px 0 0; font-size:14.5px; line-height:1.6; color:#b4bfb7; }
.msg.ok{ color:#7ee0a1; } .msg.bad{ color:#ff8a94; }
.badge{ display:inline-block; font-size:12.5px; padding:3px 11px; border-radius:999px; border:1px solid rgba(223,231,224,.3); color:#dfe7e0; }
.badge.s0{ color:#f0b45a; border-color:#f0b45a; } .badge.s1{ color:#7cc4ff; border-color:#7cc4ff; }
.badge.s2{ color:#7ee0a1; border-color:#7ee0a1; } .badge.s3{ color:#9aa5a0; } .badge.s4{ color:#ff8a94; border-color:#ff8a94; }
.tabs{ display:flex; gap:8px; margin:20px 0; flex-wrap:wrap; }
.tab{ font:inherit; cursor:pointer; color:#b4bfb7; background:transparent; border:1px solid rgba(223,231,224,.25); border-radius:999px; padding:9px 20px; font-size:15px; }
.tab[aria-selected=true]{ background:#f0b45a; color:#1a1305; border-color:#f0b45a; font-weight:600; }
.stat{ display:flex; gap:10px 22px; flex-wrap:wrap; margin:0 0 18px; font-size:14px; color:#b4bfb7; }
.stat b{ color:#dfe7e0; font-size:17px; margin-left:5px; }
.kv{ display:grid; grid-template-columns:110px 1fr; gap:6px 14px; font-size:15px; line-height:1.6; margin:12px 0 0; }
.kv dt{ color:#9aa5a0; } .kv dd{ margin:0; white-space:pre-wrap; overflow-wrap:anywhere; }
@media (max-width:520px){ .kv{ grid-template-columns:1fr; } .kv dt{ margin-top:6px; } }
.code{ font-family:ui-monospace,Menlo,Consolas,monospace; font-size:14px; background:rgba(255,255,255,.07); padding:3px 9px; border-radius:8px; overflow-wrap:anywhere; }
.star{ color:#f0b45a; letter-spacing:.1em; } .star s{ text-decoration:none; color:rgba(223,231,224,.25); }
.mute{ color:#9aa5a0; font-size:13.5px; }
`
export const fmtDate = (ts) => {
  const d = ts && ts.toDate ? ts.toDate() : null
  if (!d) return ''
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
export const STATUSES = ['접수', '확인중', '연락완료', '완료', '취소']
export const statusClass = (s) => ({ 접수: 's0', 확인중: 's1', 연락완료: 's2', 완료: 's3', 취소: 's4' }[s] || '')
