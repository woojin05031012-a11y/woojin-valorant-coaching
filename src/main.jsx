import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// 기본 화면(/)은 3D 랜딩 페이지. /kage 도 같은 화면으로 열린다.
// 1주차에 만든 기존 화면은 /classic 에서 그대로 볼 수 있다.
// /check : 신청 확인·수정 (신청 번호로 조회), /admin : 관리자 페이지 (Google 로그인)
const KageLanding = lazy(() => import('./components/KageLanding.jsx'))
const CheckPage = lazy(() => import('./components/CheckPage.jsx'))
const AdminPage = lazy(() => import('./components/AdminPage.jsx'))
const path = window.location.pathname.replace(/\/+$/, '') || '/'

let view
if (path === '/classic') view = <App />
else if (path === '/check') view = <CheckPage />
else if (path === '/admin') view = <AdminPage />
else view = <KageLanding />

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={null}>{view}</Suspense>
  </React.StrictMode>
)
