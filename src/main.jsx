import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// 기본 화면(/)은 3D 랜딩 페이지. /kage 도 같은 화면으로 열린다.
// 1주차에 만든 기존 화면은 /classic 에서 그대로 볼 수 있다.
const KageLanding = lazy(() => import('./components/KageLanding.jsx'))
const path = window.location.pathname.replace(/\/+$/, '') || '/'
const isClassic = path === '/classic'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isClassic ? (
      <App />
    ) : (
      <Suspense fallback={null}>
        <KageLanding />
      </Suspense>
    )}
  </React.StrictMode>
)
