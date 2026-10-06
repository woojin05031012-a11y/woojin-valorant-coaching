import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, configured } from '../firebase.js'

// 1주차: Firestore에 데이터 1건이 저장되는지 확인하는 개발용 패널
export default function FirebaseTest() {
  const [msg, setMsg] = useState('')

  async function run() {
    setMsg('저장 중...')
    try {
      const ref = await addDoc(collection(db, 'connectionTests'), {
        note: '1주차 저장 테스트',
        createdAt: serverTimestamp(),
      })
      setMsg('저장 성공. 문서 ID: ' + ref.id)
    } catch (e) {
      setMsg('저장 실패: ' + e.code + ' ' + e.message)
    }
  }

  return (
    <div className="devbox">
      <strong>Firebase 저장 테스트 (개발 모드에서만 보임)</strong>
      {configured ? (
        <button className="btn sm" type="button" onClick={run} style={{ marginLeft: 12 }}>테스트 저장</button>
      ) : (
        <p>.env에 Firebase 설정을 먼저 입력해 주세요.</p>
      )}
      <p role="status">{msg}</p>
    </div>
  )
}
