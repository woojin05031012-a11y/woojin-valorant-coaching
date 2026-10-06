import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

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
export const db = configured ? getFirestore(initializeApp(config)) : null
