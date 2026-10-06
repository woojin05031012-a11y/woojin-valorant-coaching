# Woojin VALORANT Coaching

발로란트 유튜버 Woojin의 1:1 코칭 홍보·신청 웹사이트 (React + Vite + Firebase). 대학 과제 프로젝트.

## 실행
```bash
npm install
cp .env.example .env     # Firebase 설정값 입력 (아래 참고)
npm run dev
```

## 1주차 목표: Firebase 저장 테스트
1. Firebase 콘솔에서 프로젝트 생성
2. 프로젝트 설정에서 웹 앱 등록 후 설정값 6개를 `.env`에 입력
3. Firestore Database 생성
4. `firestore.rules` 내용을 콘솔의 규칙에 붙여넣고 게시 (연결 테스트용 규칙)
5. `npm run dev` 후 맨 아래 "개발 현황"의 **테스트 저장** 버튼 클릭
6. "저장 성공. 문서 ID: ..." 이 보이고 콘솔의 `connectionTests` 컬렉션에 문서가 생기면 1주차 완료

> `.env`는 `.gitignore`에 들어 있어 GitHub에 올라가지 않습니다. 4주차에 신청 컬렉션용 규칙을 따로 작성합니다.

## GitHub 업로드
```bash
git init
git add .
git commit -m "1주차: React 전환, Firebase 저장 테스트 준비"
git branch -M main
git remote add origin <저장소 주소>
git push -u origin main
```

## 폴더
- `src/App.jsx` 전체 화면 구성
- `src/components/ApplyForm.jsx` 신청 폼과 입력값 검증 (저장은 4주차)
- `src/components/FirebaseTest.jsx` 1주차 저장 테스트 패널 (개발 모드에서만 표시)
- `src/firebase.js` Firebase 초기화 (`.env`가 비어 있으면 연결하지 않음)
