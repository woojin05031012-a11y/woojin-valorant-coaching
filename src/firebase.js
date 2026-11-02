import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const env = import.meta.env
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

// .env가 비어 있으면 연결하지 않는다 (화면은 그대로 동작)
export const configured = Object.values(config).every(Boolean)
const app = configured ? initializeApp(config) : null
export const db = app ? getFirestore(app) : null
export const auth = app ? getAuth(app) : null
export const googleProvider = new GoogleAuthProvider()

// 관리자 계정. 화면 안내용이고, 실제 권한 검사는 firestore.rules 에서 한다.
export const ADMIN_EMAIL = 'woojin05031012@gmail.com'
