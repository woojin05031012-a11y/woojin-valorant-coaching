# Woojin VALORANT Coaching

발로란트 유튜버 이우진의 1:1 코칭을 소개하고 신청을 받는 개인 웹사이트입니다. (React + Vite + Firebase) 대학 과제 프로젝트입니다.

- 학번/이름: 202544043 이우진
- 유튜브: [이우진](https://www.youtube.com/@Woojinvlrt)

## 주요 기능

- **3D 랜딩 페이지**: 소개, 코칭 범위, 코칭 안내, FAQ, 신청을 한 페이지에서 스크롤로 확인
- **코칭 신청 폼**: 닉네임, 티어, 주 요원/포지션, Discord ID, 고민, 피드백받고 싶은 내용 입력. 입력 검사와 개인정보 수집 동의 후 접수
- **신청 저장**: 신청 내용을 Firebase Firestore(`applications` 컬렉션)에 저장
- **FAQ**: 자주 묻는 질문 8개 (펼침식)
- **코칭 후기**: 별점(1~5), 피드백 전·후 티어, 후기 제출 폼('후기 남기기' 버튼을 누르면 펼쳐짐). 제출한 후기는 `reviews` 컬렉션에 `approved: false`로 저장되고, Firebase 콘솔에서 `approved`를 `true`로 바꾼 것만 사이트에 공개 (로그인 없이 가짜 후기를 막기 위한 승인제)
- **강의 영상**: 채널의 강의 영상 2개를 연결 (썸네일을 누르면 재생)

## 페이지 주소

| 주소 | 내용 |
|---|---|
| `/` , `/kage` | 3D 랜딩 페이지 (기본 화면) |
| `/classic` | 초기에 만든 기본 화면 |

## 실행 방법

```bash
npm install
cp .env.example .env     # Firebase 설정값 입력 (아래 참고)
npm run dev
```

브라우저에서 `http://localhost:5173/` 으로 접속합니다. (Windows에서는 `cp` 대신 `copy .env.example .env`)

### Firebase 설정

1. Firebase 콘솔에서 프로젝트 생성 후 웹 앱 등록
2. 설정값 6개를 `.env`에 입력 (`VITE_FIREBASE_API_KEY` 등, `.env.example` 참고)
3. Firestore Database 생성
4. `firestore.rules` 내용을 콘솔의 Firestore 규칙에 붙여넣고 게시

`.env`는 `.gitignore`에 들어 있어 GitHub에 올라가지 않습니다.

## 신청이 저장되는 흐름

```
신청 폼(랜딩 페이지 iframe) → 입력 검사
  → postMessage로 부모 React 앱에 전달 (출처 확인)
  → React에서 항목과 길이를 한 번 더 검증
  → Firestore `applications` 컬렉션에 저장
```

`firestore.rules`는 정해진 항목의 새 문서 작성만 허용하고, 읽기·수정·삭제는 막습니다.

## 폴더 구조

- `src/main.jsx` 주소별 화면 연결 (`/`, `/kage` → 랜딩 페이지, `/classic` → 기본 화면)
- `src/components/KageLanding.jsx` 랜딩 페이지를 띄우고 신청 저장을 처리
- `src/components/ApplyForm.jsx` 기본 화면용 신청 폼
- `src/firebase.js` Firebase 초기화 (`.env`가 비어 있으면 연결하지 않음)
- `firestore.rules` Firestore 보안 규칙
- `public/landing-pages/kage-haven.html` 수정해서 사용하는 3D 랜딩 페이지
- `public/landing-pages/kage.html` 템플릿 원본 (보존)
- `kage-patch/` 랜딩 페이지를 만든 작업용 스크립트 (사이트 실행에는 필요 없음)

## AI 활용과 역할

이 프로젝트는 AI 코딩 도구인 Claude를 활용해서 구현했습니다.

- **제가 한 일**: 기획과 범위 결정, 코칭 조건과 문구 정리, 화면 방향 결정과 수정 요청, Firebase 콘솔 설정과 규칙 게시·저장 확인, 실행 테스트, GitHub 업로드
- **Claude가 한 일**: React 코드와 3D 장면 수정, 신청 폼·입력 검사·저장 코드, 보안 규칙 초안, 문구 초안

## 오픈소스와 출처

- 3D 랜딩 페이지: [Kage by ThreeUI](https://threeui.com) (`@designcodeio/threeui`), MIT License. 원본(`kage.html`)은 보존하고, 이 프로젝트에서는 수정본(`kage-haven.html`)을 사용합니다.
- Three.js: MIT License
- 글꼴(Onest, Noto Sans JP 등): SIL Open Font License 1.1
- 라이선스 안내는 `public/landing-pages/LICENSES.txt`를 참고하세요.
- 발로란트 게임 맵·요원 이미지는 저작권 문제로 사용하지 않았습니다.

## 진행 현황

- [x] React(Vite) 프로젝트 전환
- [x] 3D 랜딩 페이지 (소개, 코칭 범위, 코칭 안내)
- [x] 신청 폼, 입력 검사, Firestore 저장
- [x] FAQ
- [x] 후기 제출 폼 + 별점 + 승인제 (테스트 필요)
- [x] 강의 영상 연결
- [ ] 후기 추가
- [ ] 반응형 점검
- [ ] 테스트와 디버깅
